"""Gera assets/char-sheet.png (atlas limpo) a partir da sheet original em alta resolucao.

O que faz para cada quadro:
  1. apaga as etiquetas (IDLE, WALK...);
  2. separa quadros encostados "crescendo" a partir do corpo de cada um (nao corta a aba do chapeu);
  2b. mantem so o corpo principal (descarta etiquetas e pedacos de outros quadros);
  3. remove o halo semitransparente e tapa furinhos no alfa;
  4. reduz UMA vez (Lanczos, alfa pre-multiplicado) para o tamanho exato que aparece na tela;
  5. alfa binario (0/255) + contorno escuro de 1px -> borda nitida, sem franja.

Uso:  python tools/build_char_atlas.py
Saida: assets/char-sheet.png, assets/char-jump.png e o bloco CHAR_ANIMS impresso (colar em js/sprites.js).
"""
import json
import os
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'src', 'char-sheet-original.png')
OUTS = {
    'main': os.path.join(ROOT, 'assets', 'char-sheet.png'),  # parado, andando, dano
    'jump': os.path.join(ROOT, 'assets', 'char-jump.png'),   # conjunto separado do pulo
}

# Altura (em pixels do canvas 1536x864) do quadro idle de cada personagem.
TARGET_IDLE_H = {'male': 118, 'female': 110}

# Faixas da sheet original: (y0, y1, x0, x1, nº de quadros nesse trecho)
ROWS = {
    'female': {
        'idle': (100, 270, 29, 290, 3),
        'walk': (100, 270, 317, 586, 3),
        'run':  (100, 270, 613, 871, 3),
        'jump': (100, 270, 914, 1023, 1),
        'fall': (100, 270, 1064, 1262, 2),
        'hurt': (300, 485, 37, 274, 2),
    },
    'male': {
        'idle': (560, 785, 22, 297, 3),
        'walk': (560, 785, 313, 593, 3),
        'run':  (560, 785, 608, 877, 3),
        'jump': (560, 785, 910, 1035, 1),
        'fall': (560, 785, 1056, 1267, 2),
        'hurt': (785, 1005, 22, 280, 2),
    },
}

# Quais quadros cada animacao usa no jogo (indice dentro do trecho) + metadados de caminhada.
WALK_META = [
    dict(dur=1.25, bob=0, step=True),
    dict(dur=0.80, bob=-1, step=False),
    dict(dur=1.25, bob=0, step=True),
    dict(dur=0.80, bob=-1, step=False),
]
# Regra: so usar quadros que NAO encostam em nenhum vizinho na sheet original.
# (Os idle 1 e 2 do José se sobrepoem na aba do chapeu: a parte de baixo nao existe na imagem.)
USE = {
    # anim: (arquivo, trecho da sheet original, quadros)
    'male': {
        'idle': ('main', 'idle', [0]),
        'walk': ('main', 'walk', [0, 1, 2, 1]),
        'hurt': ('main', 'hurt', [0]),
        'jump': ('jump', 'jump', [0]),   # subindo
        'fall': ('jump', 'fall', [0]),   # descendo
        'land': ('jump', 'fall', [1]),   # aterrissagem (agachado)
    },
    'female': {
        'idle': ('main', 'idle', [1, 2]),
        'walk': ('main', 'walk', [0, 1, 2, 1]),
        'hurt': ('main', 'hurt', [0]),
        'jump': ('jump', 'jump', [0]),
        'fall': ('jump', 'fall', [0]),
        'land': ('jump', 'fall', [1]),
    },
}
PAD = 8  # espaco entre quadros no atlas: cada um fica isolado na propria celula


def split_columns(alpha_band, k):
    """Divide um trecho com k quadros encostados, cortando nos vales de menor ocupacao."""
    w = alpha_band.shape[1]
    if k == 1:
        return [(0, w)]
    col = alpha_band.sum(0).astype(float)
    cuts = [0]
    for i in range(1, k):
        guess = int(w * i / k)
        lo, hi = max(guess - w // (3 * k), 1), min(guess + w // (3 * k), w - 1)
        cuts.append(lo + int(np.argmin(col[lo:hi])))
    cuts.append(w)
    return list(zip(cuts[:-1], cuts[1:]))


def clean_mask(rgba):
    a = rgba[..., 3]
    m = a >= 128
    lab, n = ndi.label(m)
    if n == 0:
        return m
    sizes = ndi.sum(m, lab, range(1, n + 1))
    main = lab == (int(np.argmax(sizes)) + 1)
    near = ndi.binary_dilation(main, iterations=5)
    keep = main.copy()
    for i, s in enumerate(sizes):
        comp = lab == i + 1
        if s >= 12 and (comp & near).any():
            keep |= comp
    # tapa furinhos internos pequenos (sobras do recorte), preserva vaos grandes (entre bracos/pernas)
    holes = ndi.binary_fill_holes(keep) & ~keep
    hl, hn = ndi.label(holes)
    if hn:
        hs = ndi.sum(holes, hl, range(1, hn + 1))
        for i, s in enumerate(hs):
            if s <= 40:
                keep |= hl == i + 1
    return keep


def geodesic_assign(mask, seeds):
    """Cada pixel opaco vai para a semente mais proxima *andando por dentro do desenho*.
    Assim a aba do chapeu que encosta no quadro vizinho continua com o proprio dono,
    em vez de ser fatiada por um corte reto de coluna."""
    h, w = mask.shape
    lab = np.zeros((h, w), np.int32)
    q = deque()
    for sid, sm in seeds:
        ys, xs = np.where(sm & mask)
        for y, x in zip(ys, xs):
            if lab[y, x] == 0:
                lab[y, x] = sid
                q.append((y, x))
    while q:
        y, x = q.popleft()
        sid = lab[y, x]
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and lab[ny, nx] == 0:
                lab[ny, nx] = sid
                q.append((ny, nx))
    return lab


def repair_top(cell, m, pan):
    """Reconstroi o topo do personagem onde a etiqueta foi desenhada POR CIMA dele na sheet.

    Nesses pontos o chapeu/cabeca termina numa linha reta logo abaixo da etiqueta.
    O topo novo e uma curva suave (Hermite) que continua a inclinacao das laterais,
    pintada com a cor lisa do proprio desenho (sem copiar detalhes como o sol),
    com leve brilho em cima e contorno escuro de 2px. Altera cell e m no lugar;
    devolve quantas colunas foram reconstruidas."""
    h, w = m.shape
    cols = np.where(m.any(0))[0]
    if not len(cols):
        return 0
    top = np.full(w, -1)
    top[cols] = m[:, cols].argmax(0)
    occl = [x for x in cols if top[x] > 0 and pan[max(0, top[x] - 4):top[x], x].any()]
    if len(occl) < 5:
        return 0
    lo, hi = min(occl), max(occl)
    flat = int(np.median(top[lo:hi + 1]))

    def side_slope(xs):
        xs = [x for x in xs if 0 <= x < w and top[x] >= 0 and top[x] < flat + 40]
        if len(xs) < 3:
            return None
        return np.polyfit(xs, top[xs], 1)[0]

    sl = side_slope(range(lo - 10, lo))
    sr = side_slope(range(hi + 1, hi + 11))
    # metade da inclinacao das laterais: domo largo e baixo, como o topo dos quadros intactos
    sl = -0.5 if sl is None else 0.5 * float(np.clip(sl, -2.0, -0.35))
    sr = 0.5 if sr is None else 0.5 * float(np.clip(sr, 0.35, 2.0))
    span = hi - lo

    # cor lisa: mediana do proprio desenho logo abaixo do topo, sem amarelo (sol) nem contorno
    under = cell[flat + 3:flat + 14, lo:hi + 1].reshape(-1, 4)
    rgb = under[:, :3].astype(int)
    ok = (under[:, 3] > 0) & ~((rgb[:, 1] > 130) & (rgb[:, 0] > 180))  # tudo menos o amarelo do sol
    base = np.median(rgb[ok], 0) if ok.any() else np.array([150, 60, 40])
    dark = cell[m & (cell[..., :3].max(-1) < 70)]
    outline = np.median(dark[:, :3], 0) if len(dark) else np.array([30, 20, 18])

    new = np.zeros_like(m)
    ytop = {}
    for x in range(lo, hi + 1):
        t = (x - lo) / max(span, 1)
        y = (2 * t ** 3 - 3 * t ** 2 + 1) * flat + (t ** 3 - 2 * t ** 2 + t) * sl * span             + (-2 * t ** 3 + 3 * t ** 2) * flat + (t ** 3 - t ** 2) * sr * span
        ytop[x] = max(0, int(round(max(y, flat - 0.16 * span))))
    # pinta da curva ate 2px abaixo da linha reta (cobre a franja azulada da etiqueta)
    for x in range(lo, hi + 1):
        for y in range(ytop[x], min(h, flat + 2)):
            d = (y - ytop[x]) / max(flat + 2 - ytop[x], 1)
            shade = 1.10 - 0.10 * d          # um pouco mais claro em cima (luz)
            cell[y, x, :3] = np.clip(base * shade, 0, 255).astype(np.uint8)
            cell[y, x, 3] = 255
            new[y, x] = True
    m |= new
    ring = new & ~ndi.binary_erosion(m, iterations=2)
    cell[ring, :3] = outline.astype(np.uint8)
    return int(span + 1)


def extract_row(src, y0, y1, runs, panel=None):
    """runs: lista de (nome, x0, x1, k) que dividem a mesma faixa horizontal."""
    band = src[y0:y1]
    mask = band[..., 3] >= 128
    hgt = y1 - y0
    seeds, owners = [], []
    for name, x0, x1, k in runs:
        for j, (a, b) in enumerate(split_columns(mask[:, x0:x1], k)):
            cx = x0 + (a + b) // 2
            sm = np.zeros_like(mask)
            # semente no tronco/pernas (longe da aba do chapeu, que e o que encosta nos vizinhos)
            sm[int(hgt * 0.50):int(hgt * 0.88), cx - 6:cx + 7] = True
            seeds.append((len(seeds) + 1, sm))
            owners.append((name, j))
    lab = geodesic_assign(mask, seeds)
    out = {name: [] for name, *_ in runs}
    touches = {name: [] for name, *_ in runs}
    for sid, (name, j) in enumerate(owners, start=1):
        own = lab == sid
        ring = ndi.binary_dilation(own, iterations=2) & ~own
        touches[name].append(bool((ring & (lab > 0)).any()))
        cell = band.copy()
        cell[~own] = 0
        m = clean_mask(cell)
        if panel is not None:
            repaired = repair_top(cell, m, panel[y0:y1])
            if repaired:
                print(f'// topo reconstruido: {name}[{j}] ({repaired} colunas tampadas pela etiqueta)', file=sys.stderr)
        ys, xs = np.where(m)
        cy0, cy1, cx0, cx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        fr = cell[cy0:cy1, cx0:cx1].copy()
        fr[..., 3] = np.where(m[cy0:cy1, cx0:cx1], 255, 0)
        out[name].append(fr)
    return out, touches


def downscale(rgba, s):
    im = Image.fromarray(rgba, 'RGBA')
    w, h = max(1, round(im.width * s)), max(1, round(im.height * s))
    pm = im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
    arr = np.array(pm)
    # alfa a partir da mascara reduzida (sem franja)
    mask = np.array(Image.fromarray(rgba[..., 3]).resize((w, h), Image.BOX)) >= 128
    # tira "espinhos": pixels da borda presos por no maximo 1 vizinho
    for _ in range(2):
        nb = sum(np.roll(np.roll(mask, dy, 0), dx, 1) for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        mask &= ~(mask & (nb <= 1))
    arr[..., 3] = np.where(mask, 255, 0)
    rgb = Image.fromarray(arr[..., :3]).filter(ImageFilter.UnsharpMask(radius=0.8, percent=60, threshold=2))
    arr[..., :3] = np.array(rgb)
    # contorno: anel externo de 1px puxado para a cor escura do proprio traco
    edge = mask & ~ndi.binary_erosion(mask)
    dark = np.array([38, 24, 22], float)
    arr[edge, :3] = (arr[edge, :3] * 0.35 + dark * 0.65).astype(np.uint8)
    arr[~mask] = 0
    return arr


def remove_labels(src):
    """Apaga as etiquetas azul-marinho (IDLE, WALK...) sem encostar no personagem.

    So remove os pixels do proprio painel (e o texto dentro dele). A borda clarinha
    do painel e apagada crescendo apenas sobre pixels "frios" (azulados/cinza):
    pixels quentes (chapeu, pele, lenco) nunca sao apagados."""
    r, g, b = (src[..., i].astype(int) for i in range(3))
    opaque = src[..., 3] >= 128
    navy = opaque & (b > r + 25) & (b > g + 12) & (r < 110)
    lab, n = ndi.label(navy)
    panel = np.zeros_like(navy)
    for i, sl in enumerate(ndi.find_objects(lab)):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if w >= 40 and h >= 12:  # painel retangular, nao um detalhe azul do personagem
            panel[sl] |= ndi.binary_fill_holes(lab[sl] == i + 1)
    cold = ~((r > b + 15) & (r > g + 5))
    for _ in range(4):
        panel |= ndi.binary_dilation(panel) & cold
    src = src.copy()
    src[panel] = 0
    return src, panel


def pack(arrs):
    """Empacota em linhas de ate 1024px, cada quadro isolado com PAD de folga."""
    x = y = PAD
    row_h = 0
    rects = []
    for arr in arrs:
        h, w = arr.shape[:2]
        if x + w + PAD > 1024:
            x, y = PAD, y + row_h + PAD
            row_h = 0
        rects.append((x, y, w, h))
        x += w + PAD
        row_h = max(row_h, h)
    H = y + row_h + PAD
    atlas = np.zeros((H, 1024, 4), np.uint8)
    for (x, y, w, h), arr in zip(rects, arrs):
        atlas[y:y + h, x:x + w] = arr
    return atlas, rects


def main():
    src, panel = remove_labels(np.array(Image.open(SRC).convert('RGBA')))
    packed = {k: [] for k in OUTS}
    anims = {}
    for ch, rows in ROWS.items():
        bands = {}
        for name, (y0, y1, x0, x1, k) in rows.items():
            bands.setdefault((y0, y1), []).append((name, x0, x1, k))
        raw, touch = {}, {}
        for (y0, y1), runs in bands.items():
            fr, t = extract_row(src, y0, y1, runs, panel)
            raw.update(fr)
            touch.update(t)
        bad = [f'{ch}.{run}[{i}]' for _, run, ids in USE[ch].values() for i in set(ids) if touch[run][i]]
        if bad:
            sys.exit('Quadros encostados em vizinhos (seriam cortados): ' + ', '.join(bad))
        s = TARGET_IDLE_H[ch] / raw['idle'][0].shape[0]
        anims[ch] = {}
        for name, (sheet, run, idxs) in USE[ch].items():
            cache = {}
            anims[ch][name] = []
            for i in idxs:
                if i not in cache:
                    cache[i] = len(packed[sheet])
                    packed[sheet].append(downscale(raw[run][i], s))
                anims[ch][name].append((sheet, cache[i]))
    rects = {}
    for sheet, arrs in packed.items():
        atlas, rects[sheet] = pack(arrs)
        Image.fromarray(atlas, 'RGBA').save(OUTS[sheet], optimize=True)
        print(f'// {os.path.basename(OUTS[sheet])}: 1024x{atlas.shape[0]}', file=sys.stderr)

    lines = ['const CHAR_ANIMS = {']
    for ch, label in (('male', 'José'), ('female', 'Sakura')):
        lines.append(f'  // {label}')
        lines.append(f'  {ch}: {{')
        for name, ids in anims[ch].items():
            items = []
            for j, (sheet, pid) in enumerate(ids):
                x, y, w, h = rects[sheet][pid]
                extra = f", img: '{sheet}'" if sheet != 'main' else ''
                if name == 'walk':
                    m = WALK_META[j]
                    extra += f", dur: {m['dur']:.2f}, bob: {m['bob']}, step: {json.dumps(m['step'])}"
                items.append(f'{{ x: {x}, y: {y}, w: {w}, h: {h}{extra} }}')
            lines.append(f'    {name}: [' + ', '.join(items) + '],')
        lines.append('  },')
    lines.append('};')
    sys.stdout.reconfigure(encoding='utf-8')
    print('\n'.join(lines))


if __name__ == '__main__':
    main()
