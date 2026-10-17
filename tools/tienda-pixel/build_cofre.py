"""Arte de la Tienda: el cofre del alquimista (cerrado y abierto), con tapa curva, bandas de latón, cerradura arcana y hiedra.

Las rampas vienen de tools/home-pixel/pixel.py.

    python tools/tienda-pixel/build_cofre.py      ->  dist/assets/tienda/cofre-cerrado.png, cofre-abierto.png
"""
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'home-pixel'))
from pixel import Canvas  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'dist', 'assets', 'tienda')
os.makedirs(OUT, exist_ok=True)
W, H = 56, 46
X0, X1 = 3, 53           # ancho del cofre [X0, X1)
LID_TOP, SPLIT, BASE = 3, 23, 43


def save(c, name):
    arr = np.array(c.render(scale=1).convert('RGBA'))
    arr[..., 3] = np.where(c.mat == 0, 0, 255).astype(np.uint8)
    Image.fromarray(arr, 'RGBA').save(os.path.join(OUT, name))


def arch_top(x):
    """Y del borde superior de la tapa en la columna x (curva suave)."""
    u = (x - (X0 + X1 - 1) / 2) / ((X1 - X0) / 2)
    return LID_TOP + round(7 * (u * u) ** 1.5)


def wood(c, x, y, y0, y1, dark=0):
    t = (y - y0) / max(1, y1 - y0)
    lvl = 6 - 3.2 * t - dark
    if (x - X0) % 12 == 0:
        lvl -= 2.2                                   # junta entre tablones
    elif (x - X0) % 12 in (4, 5) and (y + (x - X0) // 12 * 3) % 7 == 0:
        lvl -= 1                                      # veta
    elif (x - X0) % 12 in (8, 9) and (y + 2) % 9 == 0:
        lvl += .6
    return lvl


def banda(c, x0, y0, y1, top_fn=None):
    for y in range(y0, y1):
        if top_fn and y < top_fn(x0 + 3):
            continue
        for x in range(x0, x0 + 6):
            if top_fn and y < top_fn(x):
                continue
            lvl = {0: 2, 1: 6, 2: 5, 3: 4, 4: 3, 5: 1}[x - x0]
            c.px(x, y, 'brass', lvl)
        if (y - y0) % 7 == 3:
            c.px(x0 + 2, y, 'brass', 6); c.px(x0 + 3, y, 'brass', 2)       # remache


def cuerpo(c):
    for y in range(SPLIT, BASE):
        for x in range(X0, X1):
            c.px(x, y, 'wood', wood(c, x, y, SPLIT, BASE))
    for x in range(X0, X1):
        c.px(x, BASE, 'wood', 0); c.px(x, BASE - 1, 'wood', 1)
    for y in range(SPLIT, BASE + 1):
        c.px(X0, y, 'wood', 1); c.px(X1 - 1, y, 'wood', 1)
    banda(c, X0 + 1, SPLIT, BASE - 1); banda(c, X1 - 7, SPLIT, BASE - 1)
    # pies
    for x0 in (X0, X1 - 6):
        c.rect(x0, BASE, x0 + 6, BASE + 2, 'brass', 2); c.rect(x0, BASE, x0 + 6, BASE + 1, 'brass', 4)


def tapa(c):
    for x in range(X0, X1):
        top = arch_top(x)
        for y in range(top, SPLIT + 1):
            lvl = wood(c, x, y + 4, LID_TOP, SPLIT) + 0.4 + (1.4 if y - top < 2 else 0)
            c.px(x, y, 'wood', lvl)
        c.px(x, top, 'wood', 1)
    for x in range(X0, X1):
        c.px(x, SPLIT, 'brass', 3); c.px(x, SPLIT - 1, 'brass', 5); c.px(x, SPLIT + 1, 'wood', 0)   # aro de latón bajo la tapa
    banda(c, X0 + 1, LID_TOP, SPLIT - 1, arch_top); banda(c, X1 - 7, LID_TOP, SPLIT - 1, arch_top)
    for y in range(LID_TOP, SPLIT):
        for x in (X0, X1 - 1):
            if y >= arch_top(x):
                c.px(x, y, 'wood', 1)


def cerradura(c, abierta):
    cx = (X0 + X1) // 2
    if abierta:
        c.rect(cx - 4, SPLIT + 3, cx + 4, SPLIT + 10, 'brass', 3); c.rect(cx - 3, SPLIT + 4, cx + 3, SPLIT + 9, 'brass', 1)
        c.rect(cx - 1, SPLIT + 10, cx + 1, SPLIT + 14, 'brass', 4)
        return
    for y in range(SPLIT - 3, SPLIT + 10):
        for x in range(cx - 5, cx + 5):
            d = min(x - (cx - 5), cx + 4 - x, y - (SPLIT - 3), SPLIT + 9 - y)
            c.px(x, y, 'brass', [1, 5, 4, 4][min(d, 3)] if (x + y) % 6 else 5)
    c.px(cx - 1, SPLIT + 3, 'rune', 6); c.px(cx, SPLIT + 3, 'rune', 6)             # ojo de la llave: brilla
    c.rect(cx - 1, SPLIT + 4, cx + 1, SPLIT + 7, 'rune', 5)
    c.px(cx - 1, SPLIT + 2, 'rune', 3); c.px(cx, SPLIT + 2, 'rune', 3)


def hiedra(c, lado):
    rng = np.random.default_rng(3 + lado)
    x = X0 + 2 if lado == 0 else X1 - 3
    d = 1 if lado == 0 else -1
    y = LID_TOP + 6
    pts = []
    for i in range(26):
        pts.append((x, y))
        x += d * (1 if i % 3 == 0 else 0) + (0 if i % 5 else d)
        y += 1
    for (px, py) in pts:
        c.px(px, py, 'stem', 3)
    for i, (px, py) in enumerate(pts):
        if i % 3 == 1:
            s = d * (1 + (i % 2))
            c.rect(min(px + s, px + s + d), py - 1, max(px + s, px + s + d) + 1, py + 1, 'leaf', 4 + (i % 3))
            c.px(px + s, py - 1, 'leaf', 7)


def musgo(c):
    for x in range(X0 + 9, X0 + 22):
        top = arch_top(x)
        h = 1 + int((x * 7) % 3)
        for k in range(h):
            c.px(x, top + k, 'leaf', 4 + (k == 0) * 2)
    for x in range(X1 - 20, X1 - 12):
        top = arch_top(x)
        for k in range(1 + (x % 2)):
            c.px(x, top + k, 'leaf', 5)
    for (x, y) in ((X0 + 3, BASE - 2), (X0 + 5, BASE - 3), (X1 - 5, BASE - 2), (X1 - 8, BASE - 1)):
        c.px(x, y, 'sprout', 6); c.px(x, y - 1, 'sprout', 8)


def cerrado():
    c = Canvas(W, H)
    cuerpo(c); tapa(c); cerradura(c, False); hiedra(c, 0); hiedra(c, 1); musgo(c)
    save(c, 'cofre-cerrado.png')


def abierto():
    c = Canvas(W, H)
    # tapa levantada, vista de atrás
    for j in range(0, 14):
        ins = 2 + (13 - j) // 3
        for x in range(X0 + ins, X1 - ins):
            c.px(x, 1 + j, 'wood', 2 + (j > 3) * 1.2)
        c.px(X0 + ins, 1 + j, 'wood', 1); c.px(X1 - 1 - ins, 1 + j, 'wood', 1)
    for x0 in (X0 + 9, X1 - 14):
        for j in range(1, 13):
            for x in range(x0, x0 + 5):
                c.px(x, 1 + j, 'brass', 4 if x == x0 else 3)
    # interior luminoso
    for y in range(15, SPLIT + 2):
        for x in range(X0 + 2, X1 - 2):
            c.px(x, y, 'rune', 2 + (y - 15) * .35)
    for x in range(X0 + 2, X1 - 2):
        c.px(x, 15, 'wood', 3); c.px(x, 16, 'wood', 2)
    cuerpo(c); cerradura(c, True)
    for x in range(X0, X1):
        c.px(x, SPLIT, 'wood', 7)
    hiedra(c, 0); hiedra(c, 1)
    save(c, 'cofre-abierto.png')


if __name__ == '__main__':
    cerrado(); abierto()
    for old in ('cofre-raices.png',):
        p = os.path.join(OUT, old)
        if os.path.exists(p):
            os.remove(p)
    print('cofre listo en', OUT)
