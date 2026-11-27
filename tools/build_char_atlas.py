"""Gera assets/char-sheet.png (atlas limpo) a partir da sheet original em alta resolucao.

O que faz para cada quadro:
  1. apaga as etiquetas (IDLE, WALK...);
  2. separa quadros encostados "crescendo" a partir do corpo de cada um (nao corta a aba do chapeu);
  2b. mantem so o corpo principal (descarta etiquetas e pedacos de outros quadros);
  3. remove o halo semitransparente e tapa furinhos no alfa;
  4. reduz UMA vez (Lanczos, alfa pre-multiplicado) para o tamanho exato que aparece na tela;
  5. alfa binario (0/255) + contorno escuro de 1px -> borda nitida, sem franja.

Uso:  python tools/build_char_atlas.py
Saida: assets/char-sheet.png e o bloco CHAR_ANIMS impresso (colar em js/sprites.js).
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
OUT = os.path.join(ROOT, 'assets', 'char-sheet.png')

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
    'male':   {'idle': [0], 'walk': [0, 1, 2, 1], 'jump': [0], 'fall': [0], 'hurt': [0]},
    'female': {'idle': [1, 2], 'walk': [0, 1, 2, 1], 'jump': [0], 'fall': [0], 'hurt': [0]},
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


def extract_row(src, y0, y1, runs):
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
    """Apaga as etiquetas azul-marinho (IDLE, WALK...) que encostam nos personagens."""
    r, g, b = (src[..., i].astype(int) for i in range(3))
    navy = (src[..., 3] >= 128) & (b > r + 25) & (b > g + 12) & (r < 110)
    lab, n = ndi.label(navy)
    panel = np.zeros_like(navy)
    for i, sl in enumerate(ndi.find_objects(lab)):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if w >= 40 and h >= 12:  # painel retangular, nao um detalhe azul do personagem
            panel[sl] = True
    panel = ndi.binary_dilation(panel, iterations=3)
    src = src.copy()
    src[panel] = 0
    return src


def main():
    src = remove_labels(np.array(Image.open(SRC).convert('RGBA')))
    packed = []  # (char, anim, idx, arr)
    anims = {}
    for ch, rows in ROWS.items():
        bands = {}
        for name, (y0, y1, x0, x1, k) in rows.items():
            bands.setdefault((y0, y1), []).append((name, x0, x1, k))
        raw, touch = {}, {}
        for (y0, y1), runs in bands.items():
            fr, t = extract_row(src, y0, y1, runs)
            raw.update(fr)
            touch.update(t)
        bad = [f'{ch}.{n}[{i}]' for n, ids in USE[ch].items() for i in set(ids) if touch[n][i]]
        if bad:
            sys.exit('Quadros encostados em vizinhos (seriam cortados): ' + ', '.join(bad))
        s = TARGET_IDLE_H[ch] / raw['idle'][0].shape[0]
        anims[ch] = {}
        for name, idxs in USE[ch].items():
            anims[ch][name] = []
            cache = {}
            for j, i in enumerate(idxs):
                if i not in cache:
                    cache[i] = len(packed)
                    packed.append(downscale(raw[name][i], s))
                anims[ch][name].append(cache[i])
    # empacota em linhas de ate 1024px
    x = y = PAD
    row_h = 0
    rects = []
    for arr in packed:
        h, w = arr.shape[:2]
        if x + w + PAD > 1024:
            x, y = PAD, y + row_h + PAD
            row_h = 0
        rects.append((x, y, w, h))
        x += w + PAD
        row_h = max(row_h, h)
    H = y + row_h + PAD
    atlas = np.zeros((H, 1024, 4), np.uint8)
    for (x, y, w, h), arr in zip(rects, packed):
        atlas[y:y + h, x:x + w] = arr
    Image.fromarray(atlas, 'RGBA').save(OUT, optimize=True)

    lines = ['const CHAR_ANIMS = {']
    for ch, label in (('male', 'José'), ('female', 'Sakura')):
        lines.append(f'  // {label}')
        lines.append(f'  {ch}: {{')
        for name, ids in anims[ch].items():
            items = []
            for j, pid in enumerate(ids):
                x, y, w, h = rects[pid]
                extra = ''
                if name == 'walk':
                    m = WALK_META[j]
                    extra = f", dur: {m['dur']:.2f}, bob: {m['bob']}, step: {json.dumps(m['step'])}"
                items.append(f'{{ x: {x}, y: {y}, w: {w}, h: {h}{extra} }}')
            lines.append(f'    {name}: [' + ', '.join(items) + '],')
        lines.append('  },')
    lines.append('};')
    print('\n'.join(lines))
    print(f'// atlas: 1024x{H}', file=sys.stderr)


if __name__ == '__main__':
    main()
