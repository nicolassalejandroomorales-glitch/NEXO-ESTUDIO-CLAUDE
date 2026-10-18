"""Arte de la Tienda: el cofre del alquimista (80x66 px de arte) con tapa curva, tablones con vetas y nudos, bandas de latón
remachadas, placa con cerradura arcana que brilla, hiedra con flores, musgo y luz que se cuela por la rendija.

Las rampas vienen de tools/home-pixel/pixel.py.

    python tools/tienda-pixel/build_cofre.py      ->  dist/assets/tienda/cofre-cerrado.png
"""
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'home-pixel'))
from pixel import Canvas  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'dist', 'assets', 'tienda')
os.makedirs(OUT, exist_ok=True)
W, H = 80, 66
X0, X1 = 4, 76               # ancho del cofre [X0, X1)
LID_TOP, SPLIT, BASE = 4, 34, 60
MID = (X0 + X1 - 1) / 2
rng = np.random.default_rng(11)


def save(c, name):
    arr = np.array(c.render(scale=1).convert('RGBA'))
    arr[..., 3] = np.where(c.mat == 0, 0, 255).astype(np.uint8)
    Image.fromarray(arr, 'RGBA').save(os.path.join(OUT, name))


def arch_top(x):
    u = abs(x - MID) / ((X1 - X0) / 2)
    return LID_TOP + round(11 * u ** 2.2)


def madera(x, y, y0, y1, ancho, offset=0):
    """Nivel de la rampa 'wood' para un tablón: luz arriba, junta oscura, borde claro, vetas y desgaste."""
    t = (y - y0) / max(1, y1 - y0)
    lvl = 5.6 - 2.4 * t
    px = (x - X0 + offset) % ancho
    if px == 0:
        return lvl - 2.6
    if px == 1:
        lvl += .8
    if px == ancho - 1:
        lvl -= .8
    plank = (x - X0 + offset) // ancho
    h = (plank * 7919 + (y // 2) * 104729 + (px // 3) * 1299709) % 11
    if h == 0:
        lvl -= .9          # veta oscura
    elif h == 1 and px % 3 == 0:
        lvl += .6          # veta clara
    return lvl


def nudo(c, cx, cy):
    for dx, dy, l in ((0, 0, 1), (-1, 0, 2), (1, 0, 2), (0, -1, 2), (0, 1, 2), (-2, 0, 3), (2, 0, 3)):
        c.px(cx + dx, cy + dy, 'wood', l)


def banda(c, x0, y0, y1, top_fn=None, w=9):
    for y in range(y0, y1):
        for x in range(x0, x0 + w):
            if top_fn and y < top_fn(x):
                continue
            k = x - x0
            lvl = [0, 5, 4.6, 4.2, 3.6, 3.2, 2.8, 2.0, 0.5][k]
            if k in (3, 4, 5) and (y // 2) % 5 == 0:
                lvl -= .6                       # rayado del metal
            c.px(x, y, 'brass', lvl)
    for y in range(y0 + 4, y1 - 2, 10):          # remaches
        x = x0 + 4
        if top_fn and y < top_fn(x) + 2:
            continue
        c.px(x, y, 'brass', 6); c.px(x + 1, y, 'brass', 4); c.px(x, y + 1, 'brass', 3); c.px(x + 1, y + 1, 'brass', 1)


def cuerpo(c):
    for y in range(SPLIT, BASE):
        for x in range(X0, X1):
            c.px(x, y, 'wood', madera(x, y, SPLIT, BASE, 13))
    nudo(c, X0 + 20, SPLIT + 14); nudo(c, X1 - 22, SPLIT + 18)
    for x in range(X0, X1):
        c.px(x, BASE - 1, 'wood', 1); c.px(x, BASE, 'wood', 0)       # sombra al pie
        c.px(x, SPLIT + 1, 'wood', 0)
    for y in range(SPLIT, BASE + 1):
        c.px(X0, y, 'wood', 1); c.px(X1 - 1, y, 'wood', 1)
    banda(c, X0 + 1, SPLIT, BASE - 1); banda(c, X1 - 10, SPLIT, BASE - 1)
    for x0 in (X0, X1 - 9):                                         # pies de latón
        c.rect(x0, BASE, x0 + 9, BASE + 3, 'brass', 2); c.rect(x0, BASE, x0 + 9, BASE + 1, 'brass', 5); c.rect(x0, BASE + 2, x0 + 9, BASE + 3, 'brass', 0)


def tapa(c):
    for x in range(X0, X1):
        top = arch_top(x)
        for y in range(top, SPLIT + 1):
            lvl = madera(x, y + 7, LID_TOP, SPLIT, 13) + .5
            if (y - top) % 8 == 7:
                lvl -= 1.8                                         # costura de la curva
            if y - top < 2:
                lvl += 1.3
            c.px(x, y, 'wood', lvl)
        c.px(x, top, 'wood', 1)
    nudo(c, X0 + 30, LID_TOP + 17)
    for x in range(X0, X1):                                        # aro de latón donde se cierra la tapa
        c.px(x, SPLIT - 2, 'brass', 4.4); c.px(x, SPLIT - 1, 'brass', 3.4); c.px(x, SPLIT, 'brass', 1.5); c.px(x, SPLIT + 1, 'wood', 0)
    banda(c, X0 + 1, LID_TOP, SPLIT - 2, arch_top); banda(c, X1 - 10, LID_TOP, SPLIT - 2, arch_top)
    for y in range(LID_TOP, SPLIT):
        for x in (X0, X1 - 1):
            if y >= arch_top(x):
                c.px(x, y, 'wood', 1)
    for x in range(X0 + 12, X1 - 12):                              # luz que se cuela por la rendija
        c.px(x, SPLIT + 1, 'rune', 4 if x % 3 else 5)


def placa(c):
    cx = int(MID) + 1
    x0, y0, w, h = cx - 9, SPLIT - 8, 18, 22
    for y in range(h):
        for x in range(w):
            d = min(x, w - 1 - x, y, h - 1 - y)
            if d == 0 and ((x in (0, w - 1)) and (y in (0, h - 1))):
                continue
            lvl = [1, 5, 4, 3.4][min(d, 3)] if (x + y) % 7 else 4.6
            c.px(x0 + x, y0 + y, 'brass', lvl)
    for (rx, ry) in ((2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)):
        c.px(x0 + rx, y0 + ry, 'brass', 5); c.px(x0 + rx + 1, y0 + ry + 1, 'brass', 1)
    # ojo de la cerradura: brilla en violeta/oro
    for y in range(5, 16):
        for x in range(6, 12):
            if (x - 8.5) ** 2 / 9 + (y - 8) ** 2 / 9 < 1 or (7 <= x <= 10 and 10 <= y <= 15):
                c.px(x0 + x, y0 + y, 'arcane', 1)
    for y in range(6, 15):
        for x in range(7, 11):
            if (x - 8.5) ** 2 / 4 + (y - 8) ** 2 / 5 < 1 or (8 <= x <= 9 and 10 <= y <= 14):
                c.px(x0 + x, y0 + y, 'rune', 5 if y < 11 else 4)
    c.px(x0 + 8, y0 + 7, 'rune', 6); c.px(x0 + 9, y0 + 7, 'rune', 6)


def hiedra(c, lado):
    d = 1 if lado == 0 else -1
    x, y = (X0 + 3 if lado == 0 else X1 - 4), LID_TOP + 10
    pts = []
    for i in range(40):
        pts.append((x, y))
        if i % 4 == 0:
            x += d
        if i % 9 == 5:
            x -= d
        y += 1
    for (px, py) in pts:
        c.px(px, py, 'stem', 3); c.px(px + d, py, 'stem', 2)
    for i, (px, py) in enumerate(pts):
        if i % 3 == 1:
            s = d * (1 + (i % 3))
            lx = px + s
            for (ox, oy, l) in ((0, 0, 4), (d, 0, 5), (0, -1, 6), (d, -1, 7), (2 * d, 0, 4), (0, 1, 3)):
                c.px(lx + ox, py + oy, 'leaf', l + (i % 2) * .6)
            c.px(lx + d, py - 1, 'sprout', 7)
        if i in (8, 21, 33):                                      # florecitas
            fx, fy = px + 3 * d, py
            for (ox, oy) in ((0, -1), (-1, 0), (1, 0), (0, 1)):
                c.px(fx + ox, fy + oy, 'petal', 3)
            c.px(fx, fy, 'rune', 5)


def musgo(c):
    for x in range(X0 + 12, X0 + 32):
        top = arch_top(x)
        for k in range(1 + (x * 7 + x // 3) % 4):
            c.px(x, top + k, 'leaf', 4 + (k == 0) * 2 + (x % 2) * .6)
    for x in range(X1 - 30, X1 - 15):
        top = arch_top(x)
        for k in range(1 + (x * 5) % 3):
            c.px(x, top + k, 'leaf', 4.6 + (k == 0))
    for x in range(X0 + 14, X0 + 30):                              # hierba al pie
        for k in range((x * 3) % 4):
            c.px(x, BASE - 1 - k, 'sprout', 5 + k)
    for x in range(X1 - 26, X1 - 12):
        for k in range((x * 5) % 4):
            c.px(x, BASE - 1 - k, 'sprout', 5 + k)


def cerrado():
    c = Canvas(W, H)
    cuerpo(c); tapa(c); placa(c); hiedra(c, 0); hiedra(c, 1); musgo(c)
    save(c, 'cofre-cerrado.png')


if __name__ == '__main__':
    cerrado()
    for old in ('cofre-abierto.png', 'cofre-raices.png'):
        p = os.path.join(OUT, old)
        if os.path.exists(p):
            os.remove(p)
    print('cofre listo en', OUT)
