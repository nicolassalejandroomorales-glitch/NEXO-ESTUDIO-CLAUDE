"""Capas MEDIA y FRENTE del estudio de planos (grilla gruesa 360x150) y la campana (sprite aparte, 3 cuadros).
Píxel 'void' = transparente. Reutiliza el piso del laboratorio."""
from lab_base import *  # noqa: F401,F403
import lab_frente

FLC = FL // 2


def compass_rug(ctx, c):
    """Alfombra ovalada con una rosa de los vientos tejida (diseño propio)."""
    cx, cy, rx, ry = 176, 133, 72, 12
    yy, xx = c.grid()
    d = np.hypot((xx - cx) / rx, (yy - cy) / ry)
    c.mask(d <= 1, 'blue', 2.4 + 0.3 * ((yy // 2) % 2))
    c.mask((d > 0.88) & (d <= 1), 'rune', 2.6)
    c.mask((d > 0.76) & (d <= 0.81), 'rune', 2.0)
    ns = (np.abs(xx - cx) / 6 + np.abs(yy - cy) / 9.5) <= 1              # rosa de los vientos: 4 puntas en rombo
    ew = (np.abs(xx - cx) / 34 + np.abs(yy - cy) / 3.5) <= 1
    dg = (np.abs(xx - cx) / 14 + np.abs(yy - cy) / 5) <= 1
    c.mask(dg, 'rune', 2.4)
    c.mask(ns | ew, 'paper', 3.2)
    c.mask((ns & (xx < cx)) | (ew & (yy < cy)), 'paper', 4.6)
    c.mask(ns & (yy < cy - 3), 'red', 3.6)
    c.mask(ns & (yy < cy - 3) & (xx < cx), 'red', 4.6)
    c.mask((np.abs(xx - cx) <= 1) & (np.abs(yy - cy) <= 0), 'rune', 5)
    for x in range(cx - rx, cx + rx + 1, 3):
        for side in (-1, 1):
            y = cy + side * ry * math.sqrt(max(0, 1 - ((x - cx) / rx) ** 2))
            c.px(x, y + side, 'paper', 2.6)


def map_barrel(ctx, c):
    """Barril con planos enrollados (abajo a la izquierda, pegado a la cámara)."""
    x0, y0 = 0, 128
    c.rect(x0, y0, x0 + 26, CH, 'wood', 3.0); c.rect(x0, y0, x0 + 26, y0 + 1, 'wood', 4.8)
    for y in (y0 + 5, y0 + 15):
        c.rect(x0, y, x0 + 26, y + 2, 'steel', 3.0); c.rect(x0, y, x0 + 26, y + 1, 'steel', 4.6)
    c.rect(x0 + 26, y0, x0 + 27, CH, 'ink', 0)
    for i, (x, h) in enumerate([(3, 16), (8, 22), (13, 13), (18, 19)]):
        c.rect(x, y0 - h, x + 4, y0, 'paper', 4.4 - (i % 2) * 0.7); c.rect(x, y0 - h, x + 1, y0, 'paper', 5.4)
        c.rect(x, y0 - h, x + 4, y0 - h + 1, 'paper', 2.4)
        if i % 2 == 0:
            c.rect(x, y0 - h + 4, x + 4, y0 - h + 5, 'red', 3.6)
        c.rect(x - 1, y0 - h, x, y0, 'ink', 0)


def stool_books(ctx, c):
    """Taburete con libros y un hongo en maceta (abajo a la derecha)."""
    x0, top = 324, 132
    c.rect(x0, top, x0 + 30, top + 4, 'wood', 4.2); c.rect(x0, top, x0 + 30, top + 1, 'wood', 6)
    c.rect(x0 - 1, top - 1, x0 + 31, top, 'ink', 0)
    for lx in (x0 + 2, x0 + 24):
        c.rect(lx, top + 4, lx + 4, CH, 'wood', 2.6)
    for k, col in enumerate(['red', 'blue', 'green']):
        y = top - 3 * (k + 1)
        c.rect(x0 + 2 + k, y, x0 + 20 - k, y + 3, col, 3); c.rect(x0 + 2 + k, y, x0 + 20 - k, y + 1, col, 4.6)
        c.rect(x0 + 17 - k, y, x0 + 20 - k, y + 3, 'paper', 4.4)
    c.rect(x0 + 22, top - 6, x0 + 29, top, 'clay', 3.4); c.rect(x0 + 22, top - 6, x0 + 23, top, 'clay', 5)
    mushroom(ctx, c, x0 + 25, top - 6, 4, 4, 77, shine=0.6)


def front_ivy(ctx, c):
    r = det('ivy-front-est')
    c.rect(0, 0, CW, 4, 'wood', 1.6)
    c.rect(0, 4, CW, 5, 'ink', 0)
    for x, ln in ((4, 26), (14, 34), (26, 16), (334, 30), (346, 38), (356, 18)):
        vine(c, r, x, 4, ln, base=2.6, sway=1.6, every=2)


def draw_front(ctx, part='all'):
    c = Canvas(CW, CH)
    c.dither = {'wood': 0.5, 'stone': 0.5}
    if part in ('all', 'floor'):
        lab_frente.plank_floor(c)
        compass_rug(ctx, c)
    if part in ('all', 'fg'):
        map_barrel(ctx, c)
        stool_books(ctx, c)
        front_ivy(ctx, c)
    yy, xx = c.grid()
    c.add_light(np.where((yy >= FLC) & (yy < FLC + 6), -0.9 * (1 - (yy - FLC) / 6), 0).astype(np.float32))
    return c


BELL_ROWS = [
    "......oo......",
    ".....oxxo.....",
    "....oxxhxo....",
    "...oxxhhxxo...",
    "...oxxhhxxo...",
    "..oxxxhhxxxo..",
    "..oxxxhxxxxo..",
    "..oxxxhxxxxo..",
    ".oxxxxxxxxxxo.",
    ".oxxxxxxxxxdo.",
    "oxxxxxxxxxxddo",
    "oooooooooooooo",
    ".....o..o.....",
    "......oo......",
]


def bell_frames(light):
    """3 cuadros de la campana: quieta, mecida a la izquierda y a la derecha (inclinando filas: píxel de verdad)."""
    frames = []
    for tilt in (0, -1, 1):
        c = Canvas(18, 16)
        for j, row in enumerate(BELL_ROWS):
            off = int(round(tilt * j / 6))
            c.sprite(2 + off, 1 + j, [row], 'brass', {'o': ('ink', 0), 'x': 3.6 + light, 'h': 5.6 + light, 'd': 2.2 + light})
        frames.append(c)
    return frames
