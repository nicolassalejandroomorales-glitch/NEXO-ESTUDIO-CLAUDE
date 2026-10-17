"""Reloj de la torre (Inicio): marco 9-slice, engranaje, orbe de átomo y hiedra que se mece.

Todo sale de las rampas de tools/home-pixel/pixel.py. Cada tira de animación son cuadros de izquierda a derecha;
el CSS (update01.css, .home-clock) los recorre con steps(). Se muestran con image-rendering: pixelated.

    python tools/reloj-pixel/build_reloj.py      ->  dist/assets/home-scenes/reloj-*.png
"""
import math
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'home-pixel'))
from pixel import Canvas  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'dist', 'assets', 'home-scenes')


def save(canvas, name):
    """Render a tamaño de arte con transparencia donde no hay material."""
    img = canvas.render(scale=1).convert('RGBA')
    alpha = np.where(canvas.mat == 0, 0, 255).astype(np.uint8)
    arr = np.array(img)
    arr[..., 3] = alpha
    Image.fromarray(arr, 'RGBA').save(os.path.join(OUT, name))


def outline(c, mat='brass', lvl=0):
    """Contorno exterior de 1 px con el tono más oscuro."""
    filled = c.mat != 0
    grown = filled.copy()
    grown[1:, :] |= filled[:-1, :]
    grown[:-1, :] |= filled[1:, :]
    grown[:, 1:] |= filled[:, :-1]
    grown[:, :-1] |= filled[:, 1:]
    c.mask(grown & ~filled, mat, lvl)


# ---------- marco 9-slice (24x24, borde de 8) ----------
def marco():
    n = 24
    c = Canvas(n, n)
    for y in range(n):
        for x in range(n):
            d = min(x, y, n - 1 - x, n - 1 - y)
            lit = min(x, y) < min(n - 1 - x, n - 1 - y)     # arriba/izquierda recibe la luz
            if d == 0:
                c.px(x, y, 'wood', 0)
            elif d <= 4:
                c.px(x, y, 'wood', [0, 5, 4, 4, 3][d] + (1 if lit else -1) * (1 if d in (1, 2) else 0))
            elif d == 5:
                c.px(x, y, 'brass', 2)
            elif d == 6:
                c.px(x, y, 'brass', 5 if lit else 3)
            elif d == 7:
                c.px(x, y, 'green', 0)
            else:
                c.px(x, y, 'green', 1)
    for cx, cy in ((3, 3), (n - 4, 3), (3, n - 4), (n - 4, n - 4)):     # remaches de latón en las esquinas
        c.px(cx, cy, 'brass', 3)
        c.px(cx - 1, cy, 'brass', 5); c.px(cx, cy - 1, 'brass', 5)
        c.px(cx - 1, cy - 1, 'brass', 6)
        c.px(cx + 1, cy + 1, 'brass', 1)
    for x, y in ((0, 0), (1, 0), (0, 1), (n - 1, 0), (n - 2, 0), (n - 1, 1),
                 (0, n - 1), (1, n - 1), (0, n - 2), (n - 1, n - 1), (n - 2, n - 1), (n - 1, n - 2)):
        c.mat[y, x] = 0
    save(c, 'reloj-marco.png')


# ---------- engranaje (8 cuadros de 20x20; 8 dientes => 45 grados por vuelta de patrón) ----------
def engranaje(frames=8, s=20):
    sheet = Canvas(s * frames, s)
    for f in range(frames):
        phase = (math.pi / 4) * f / frames
        cx = cy = s / 2 - 0.5
        for y in range(s):
            for x in range(s):
                dx, dy = x - cx, y - cy
                r = math.hypot(dx, dy)
                th = math.atan2(dy, dx)
                tooth = math.cos(8 * (th - phase)) > -0.15
                inner = r <= 6.6
                outer = r <= 8.9 and tooth and r > 6.0
                if not (inner or outer):
                    continue
                shade = -(dx + dy) / (r + 1e-6) * 0.5          # luz desde arriba a la izquierda
                if r < 2.1:
                    sheet.px(f * s + x, y, 'brass', 1)           # hueco del eje
                elif r < 3.3:
                    sheet.px(f * s + x, y, 'brass', 6 if shade > 0 else 4)
                elif r < 4.6:
                    sheet.px(f * s + x, y, 'brass', 2)           # aro hundido
                else:
                    sheet.px(f * s + x, y, 'brass', int(round(4 + shade * 2)))
    outline(sheet)
    save(sheet, 'reloj-engranaje.png')


# ---------- orbe de átomo (6 cuadros de 20x20): núcleo que late y dos electrones que orbitan ----------
def orbe(frames=6, s=20):
    sheet = Canvas(s * frames, s)
    for f in range(frames):
        cx = cy = s / 2 - 0.5
        pulse = 0.5 + 0.5 * math.sin(2 * math.pi * f / frames)
        for y in range(s):
            for x in range(s):
                dx, dy = x - cx, y - cy
                r = math.hypot(dx, dy)
                if r <= 5.6:
                    shade = -(dx + dy) / (r + 1e-6) * 0.5
                    sheet.px(f * s + x, y, 'crystal', max(0, min(6, int(round(2.8 + shade * 2 + (1 - r / 5.6) * 1.2)))))
        sheet.px(f * s + 7, 6, 'crystal', 7)                    # brillo del cristal
        sheet.px(f * s + 8, 6, 'crystal', 6)
        rn = 1.2 + pulse * 1.0                                   # núcleo: late
        for y in range(s):
            for x in range(s):
                if math.hypot(x - cx, y - cy) <= rn:
                    sheet.px(f * s + x, y, 'rune', 4 + int(pulse > 0.5) + int(pulse > 0.85))
        tilt = math.radians(30)
        for k in range(2):                                       # dos electrones en órbita elíptica
            a = 2 * math.pi * f / frames + k * math.pi
            ex, ey = 9.0 * math.cos(a), 3.6 * math.sin(a)
            px_ = cx + ex * math.cos(tilt) - ey * math.sin(tilt)
            py_ = cy + ex * math.sin(tilt) + ey * math.cos(tilt)
            sheet.px(f * s + px_, py_, 'rune', 5)
            sheet.px(f * s + px_ - 1, py_, 'rune', 3)
    outline(sheet, 'crystal', 0)
    save(sheet, 'reloj-orbe.png')


# ---------- hiedra colgante (8 cuadros de 12x16): se mece con un seno ----------
def hoja(frames=8, w=12, h=16):
    sheet = Canvas(w * frames, h)
    for f in range(frames):
        sway = math.sin(2 * math.pi * f / frames)
        stem = []
        for y in range(h - 2):
            x = 6 + int(round(sway * 3 * (y / (h - 3)) ** 1.4))
            stem.append((x, y))
            sheet.px(f * w + x, y, 'stem', 3 if y % 3 else 2)
        for (ly, side) in ((4, -1), (8, 1), (12, -1)):
            x0, y0 = stem[ly]
            for i, (dx, dy, lvl) in enumerate(((1, 0, 6), (2, 0, 5), (3, 1, 4), (1, 1, 5), (2, 1, 7), (2, 2, 3))):
                sheet.px(f * w + x0 + side * dx, y0 + dy, 'sprout', lvl)
        x_end, y_end = stem[-1]
        sheet.px(f * w + x_end, h - 2, 'sprout', 7)
        sheet.px(f * w + x_end, h - 1, 'sprout', 5)
    outline(sheet, 'shade', 0)
    save(sheet, 'reloj-hoja.png')


# ---------- péndulo (8 cuadros de 16x30): una vara de latón con su pesa, cuelga bajo el reloj ----------
def pendulo(frames=8, w=24, h=30):
    sheet = Canvas(w * frames, h)
    for f in range(frames):
        ang = 0.42 * math.sin(2 * math.pi * f / frames)
        ox, oy = f * w + w // 2, 1
        ex, ey = ox + math.sin(ang) * 21, oy + math.cos(ang) * 21
        sheet.px(ox, 0, 'brass', 6)
        sheet.line(ox, oy, ex, ey, 'brass', 3)
        sheet.line(ox + 1, oy, ex + 1, ey, 'brass', 2)
        for y in range(h):
            for x in range(w * frames):
                dx, dy = x - (ex + 0.5), y - ey
                r = math.hypot(dx, dy)
                if r <= 3.6:
                    shade = -(dx + dy) / (r + 1e-6) * 0.5
                    sheet.px(x, y, 'brass', int(round(4 + shade * 2 - (1 if r > 2.6 else 0))))
        sheet.px(int(round(ex - 1)), int(round(ey - 1)), 'brass', 6)
    outline(sheet)
    save(sheet, 'reloj-pendulo.png')


# ---------- matraz que burbujea (6 cuadros de 12x16): líquido verde, burbujas que suben y vapor ----------
def matraz(frames=6, w=12, h=16):
    sheet = Canvas(w * frames, h)
    for f in range(frames):
        o = f * w
        for y in range(5, 15):                                    # panza del frasco
            half = 2 + int(round((y - 5) * 0.45))
            half = min(half, 4)
            for x in range(6 - half, 6 + half):
                sheet.px(o + x, y, 'glass', 3 if x < 6 - half + 1 else 2)
        for y in range(2, 6):                                     # cuello
            for x in (5, 6):
                sheet.px(o + x, y, 'glass', 3)
        sheet.px(o + 5, 1, 'wood', 5); sheet.px(o + 6, 1, 'wood', 4)   # corcho
        top = 9 + (1 if f % 2 else 0)
        for y in range(top, 15):                                  # líquido
            half = min(2 + int(round((y - 5) * 0.45)), 4) - 1
            for x in range(6 - half, 6 + half):
                sheet.px(o + x, y, 'sprout', 5 if y == top else 4 if x < 6 else 3)
        for k in range(3):                                        # burbujas que suben
            p = (f / frames + k / 3) % 1
            sheet.px(o + 4 + (k * 2) % 4 + (1 if p > 0.5 else 0), int(round(14 - p * 6)), 'crystal', 7 if k else 6)
        sheet.px(o + 5 + (f % 3 - 1), 0, 'glass', 6)              # hilo de vapor
    outline(sheet, 'glass', 0)
    save(sheet, 'reloj-matraz.png')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    marco()
    engranaje()
    orbe()
    hoja()
    pendulo()
    matraz()
    print('Reloj listo en', os.path.normpath(OUT))
