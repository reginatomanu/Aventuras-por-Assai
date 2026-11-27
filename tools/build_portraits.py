"""Gera assets/portrait-sakura.png e assets/portrait-jose.png.

Fonte padrao ('avatar'): assets/src/avatar-jose.webp e assets/src/avatar-sakura.webp (avatares
individuais com o proprio aro colorido). O fundo xadrez "falso" (pintado na imagem) e removido,
e o retrato sai com o aro do avatar exatamente na borda da moldura do jogo (ver .medallion-img).
Fonte 'pdf': a imagem da 1a pagina do PDF "MASCOTE INSTITUCIONAL"
(assets/src/mascote-institucional-p1.png), recortada em circulo em volta de cada rosto.
Fonte alternativa ('ilustracao'): assets/src/portraits-original.webp (avatares desenhados).
Uso: python tools/build_portraits.py [avatar|pdf|ilustracao]

Modo 'ilustracao':

Cada avatar e recortado num quadrado centrado no proprio circulo, com folga de 19% do raio
para o cabelo/chapeu que "saltam" para fora do circulo (o CSS deixa essa parte aparecer
por cima do aro dourado). Alfa limpo: sem halo semitransparente.
"""
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'src', 'portraits-original.webp')
SRC_PDF = os.path.join(ROOT, 'assets', 'src', 'mascote-institucional-p1.png')
# circulo de cada rosto na imagem do PDF: (centro x, centro y, raio) - inclui o chapeu inteiro do José
PDF_CIRCLES = {'sakura': (244, 345, 186), 'jose': (696, 345, 272)}
OVERFLOW = 1.19   # metade do lado do quadrado = 1.19 x raio do circulo
SIZE = 384


def fit_circle(xs, ys):
    A = np.c_[2 * xs, 2 * ys, np.ones(len(xs))]
    b = xs ** 2 + ys ** 2
    cx, cy, c = np.linalg.lstsq(A, b, rcond=None)[0]
    return cx, cy, np.sqrt(c + cx ** 2 + cy ** 2)


def remove_fake_checker(rgb):
    """Fundo xadrez pintado na imagem: cinza/branco sem saturacao, ligado as bordas."""
    a = rgb.astype(int)
    light = (a.min(-1) > 120) & (a.max(-1) - a.min(-1) < 18)   # todos os cinzas do xadrez
    seed = np.zeros_like(light)
    seed[0, :] = seed[-1, :] = seed[:, 0] = seed[:, -1] = True
    lab, _ = ndi.label(light)
    ids = np.unique(lab[seed & light])
    bg = np.isin(lab, ids[ids > 0])
    # franja acinzentada colada no fundo (mistura do xadrez com o contorno) tambem sai
    for _ in range(2):
        fringe = ndi.binary_dilation(bg) & ~bg & (a.max(-1) - a.min(-1) < 22) & (a.min(-1) > 110)
        bg |= fringe
    return ~bg


def main_avatar():
    for name in ('jose', 'sakura'):
        im = Image.open(os.path.join(ROOT, 'assets', 'src', f'avatar-{name}.webp'))
        arr = np.array(im.convert('RGBA'))
        if im.mode == 'RGBA' and (arr[..., 3] < 128).mean() > 0.05:
            m = arr[..., 3] >= 128
        else:
            m = remove_fake_checker(arr[..., :3])
        # so o desenho principal (remove sujeirinhas soltas no fundo)
        lab, n = ndi.label(m)
        sizes = ndi.sum(m, lab, range(1, n + 1))
        m = lab == (int(np.argmax(sizes)) + 1)
        m = ndi.binary_fill_holes(m)
        arr[..., 3] = np.where(m, 255, 0)
        arr[~m] = 0
        edge = m & ~ndi.binary_erosion(m)
        ys, xs = np.where(edge)
        H, W = m.shape
        sel = (ys > ys.min() + (ys.max() - ys.min()) * 0.55) & (ys < H - 3) & (xs > 2) & (xs < W - 3)  # so o aro
        cx, cy, r = fit_circle(xs[sel].astype(float), ys[sel].astype(float))
        half = r * OVERFLOW
        box = tuple(int(round(v)) for v in (cx - half, cy - half, cx + half, cy + half))
        crop = Image.fromarray(arr).crop(box).convert('RGBa').resize((SIZE, SIZE), Image.LANCZOS).convert('RGBA')
        path = os.path.join(ROOT, 'assets', f'portrait-{name}.png')
        crop.save(path, optimize=True)
        print(f'{name}: aro centro=({cx:.0f},{cy:.0f}) raio={r:.0f} -> {os.path.relpath(path, ROOT)}')


def main_pdf():
    src = Image.open(SRC_PDF).convert('RGBA')
    d = round(SIZE / OVERFLOW)               # diametro do circulo no retrato (mesma geometria do CSS)
    off = (SIZE - d) // 2
    yy, xx = np.mgrid[0:SIZE, 0:SIZE]
    rr = np.hypot(xx + 0.5 - SIZE / 2, yy + 0.5 - SIZE / 2)
    alpha = np.clip(d / 2 - rr + 0.5, 0, 1)  # borda do circulo suavizada
    for name, (cx, cy, r) in PDF_CIRCLES.items():
        face = src.crop((cx - r, cy - r, cx + r, cy + r)).resize((d, d), Image.LANCZOS)
        out = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
        out.paste(face, (off, off))
        a = np.array(out)
        a[..., 3] = (alpha * 255).astype(np.uint8)
        path = os.path.join(ROOT, 'assets', f'portrait-{name}.png')
        Image.fromarray(a).save(path, optimize=True)
        print(f'{name}: circulo ({cx},{cy}) r={r} -> {os.path.relpath(path, ROOT)}')


def main_ilustracao():
    src = np.array(Image.open(SRC).convert('RGBA'))
    a = src[..., 3].astype(float)
    a[a < 40] = 0
    a[a >= 200] = 255
    src[..., 3] = a.astype(np.uint8)
    mask = a >= 128
    lab, n = ndi.label(mask)
    sizes = ndi.sum(mask, lab, range(1, n + 1))
    comps = sorted(np.argsort(sizes)[-2:] + 1, key=lambda i: ndi.center_of_mass(lab == i)[1])
    for name, cid in zip(('sakura', 'jose'), comps):
        m = lab == cid
        edge = m & ~ndi.binary_erosion(m)
        ys, xs = np.where(edge)
        cy0 = ys.min() + (ys.max() - ys.min()) * 0.5
        sel = ys > cy0 + 40          # metade de baixo: so o circulo, sem cabelo/chapeu saltando
        cx, cy, r = fit_circle(xs[sel].astype(float), ys[sel].astype(float))
        half = r * OVERFLOW
        box = (int(round(cx - half)), int(round(cy - half)), int(round(cx + half)), int(round(cy + half)))
        part = np.where(m[..., None], src, 0).astype(np.uint8)
        crop = Image.fromarray(part).crop(box)  # fora da imagem vira transparente
        crop = crop.convert('RGBa').resize((SIZE, SIZE), Image.LANCZOS).convert('RGBA')
        out = os.path.join(ROOT, 'assets', f'portrait-{name}.png')
        crop.save(out, optimize=True)
        print(f'{name}: circulo centro=({cx:.0f},{cy:.0f}) raio={r:.0f} -> {os.path.relpath(out, ROOT)}')


if __name__ == '__main__':
    {'ilustracao': main_ilustracao, 'pdf': main_pdf}.get((sys.argv[1:] or ['avatar'])[0], main_avatar)()
