"""Gera assets/portrait-sakura.png e assets/portrait-jose.png a partir de assets/src/portraits-original.webp.

Cada avatar e recortado num quadrado centrado no proprio circulo, com folga de 19% do raio
para o cabelo/chapeu que "saltam" para fora do circulo (o CSS deixa essa parte aparecer
por cima do aro dourado). Alfa limpo: sem halo semitransparente.
Uso: python tools/build_portraits.py
"""
import os

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'src', 'portraits-original.webp')
OVERFLOW = 1.19   # metade do lado do quadrado = 1.19 x raio do circulo
SIZE = 384


def fit_circle(xs, ys):
    A = np.c_[2 * xs, 2 * ys, np.ones(len(xs))]
    b = xs ** 2 + ys ** 2
    cx, cy, c = np.linalg.lstsq(A, b, rcond=None)[0]
    return cx, cy, np.sqrt(c + cx ** 2 + cy ** 2)


def main():
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
    main()
