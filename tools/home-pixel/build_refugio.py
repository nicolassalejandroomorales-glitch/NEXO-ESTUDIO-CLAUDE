"""El refugio completo en pixel art (418x235 px de arte, mostrado x4 = 1672x940).

Estilo aprobado en la muestra v3 (5 oct 2026): calma, pocas cosas, ventana de madera con hoja abierta,
runas talladas que respiran en los muebles, hiedra que se mece suave.

Uso:  python tools/home-pixel/build_refugio.py           (cuadro fijo + GIF de vista previa)
      python tools/home-pixel/build_refugio.py --rapido  (solo el cuadro fijo)
Escribe:
  dist/assets/home-scenes/refugio-pixel.png      fondo base (x4)
  docs/inicio-pixelart/refugio-pixel.gif         vista previa animada (x2)
  docs/inicio-pixelart/antes-ahora-refugio.png   comparación
"""
from pathlib import Path
import math
import random
import sys
import numpy as np
from PIL import Image
from pixel import Canvas, glow

ROOT = Path(__file__).resolve().parents[2]
OUT_DOCS = ROOT / 'docs/inicio-pixelart'
OUT_ASSET = ROOT / 'dist/assets/home-scenes'
W, H = 418, 235
FRAMES = 48
FLOOR_Y = 150

LEAF_BIG = [".oo...oo.", "ohlo.olmo", "ohllolmdo", ".ohlvlmo.", "..olvmdo.", "..olvdo..", "...omo...", "....o...."]
LEAF_MED = ["..o.o..", ".olomo.", "ohlvmdo", "olhvmdo", ".olvdo.", "..omo..", "...o..."]
LEAF_TALL = ["..o..", ".olo.", "ohlmo", "olvmo", "olvdo", ".omo.", "..o.."]
LEAF_SMALL = [".o.o.", "ohlmo", "olmdo", ".omo.", "..o.."]
LEAF_SIDE = [".oo...", "ohloo.", "olvvmo", "omldo.", ".oo..."]
JASMINE = [".p.", "pyp", ".p."]
RUNES = [["x.x", ".x.", "xxx", ".x.", ".x."], [".x.", "x.x", "x.x", ".x.", ".xx"], ["x..", "x.x", "xxx", "..x", "..x"],
         [".xx", "x..", ".x.", "..x", "xx."], ["xxx", ".x.", "x.x", "x.x", ".x."], ["x.x", "xxx", "x.x", ".x.", ".x."],
         [".x.", ".x.", "xxx", "x.x", "x.."], ["xx.", ".x.", ".xx", ".x.", "xx."]]
MINI = [["x.x", ".x.", "x.x"], [".x.", "xxx", ".x."], ["xx.", ".x.", ".xx"], ["x..", "xxx", "..x"]]
FLAMES = [["..h..", ".hfh.", ".fwf.", "hfwfh", ".fff.", "..r.."],
          [".h...", "..fh.", ".fwf.", "hfwfh", ".fwf.", "..r.."],
          ["...h.", ".hf..", ".fwf.", "hfwfh", ".fff.", "..r.."]]
SMALL_FLAMES = [[".h.", "hwh", ".f."], ["h..", ".wh", ".f."], ["..h", "hw.", ".f."]]
STAR = ["...a...", "...a...", "..aba..", "aabcbaa", "..aba..", "...a...", "...a..."]

_static = {}


def draw(t):
    rnd = random.Random(21)
    ph = 2 * math.pi * t / FRAMES
    c = Canvas(W, H)
    c.dither = {'wall': 0.35}                     # yeso más limpio, casi sin puntillado
    yy, xx = c.grid()
    glows = []

    # ------------------------------------------------------------------ ayudantes
    def leaf_lv(b):
        return {'o': b - 2.6, 'd': b - 1, 'm': b, 'l': b + 1, 'h': b + 2.4, 'v': b + 1.6}

    def leaf(x, y, b, rows, flip=False, ramp='leaf'):
        c.sprite(int(round(x)) - len(rows[0]) // 2, int(round(y)), rows, ramp, leaf_lv(b), flip=flip)

    def vine(x0, y0, length, base, sway=2.5, freq=0.11, every=3, big=True, alive=0.0, flowers=0.0):
        p0 = rnd.random() * 6
        drift = rnd.uniform(-0.03, 0.03)
        pts = []
        for k in range(length):
            wob = alive * (k / max(1, length)) ** 1.3 * math.sin(ph + p0 - k * 0.06)
            pts.append((x0 + sway * math.sin(k * freq + p0) + k * drift + wob, y0 + k))
        for (x, y) in pts:
            c.px(x, y, 'stem', max(0, base - 3))
        side = 1
        for i in range(2, length, every):
            x, y = pts[i]
            side = -side
            frac = i / length
            ramp = rnd.choice(['leaf', 'leaf', 'leaf', 'sprout', 'shade']) if base >= 4 else rnd.choice(['leaf', 'shade', 'shade'])
            if big and frac < 0.5:
                rows = rnd.choice([LEAF_BIG, LEAF_MED, LEAF_MED, LEAF_TALL])
            elif frac < 0.85:
                rows = rnd.choice([LEAF_MED, LEAF_TALL, LEAF_SMALL, LEAF_SIDE])
            else:
                rows = rnd.choice([LEAF_SMALL, LEAF_SIDE])
            leaf(x + side * (len(rows[0]) // 2 + 0.5), y - 1, base + rnd.choice([0, 0, 1, -1]), rows, flip=(side < 0), ramp=ramp)
            if rnd.random() < flowers:
                c.sprite(int(x - side * 2) - 1, int(y + 2), JASMINE, 'petal', {'p': 3, 'y': ('rune', 4)})
        leaf(pts[-1][0], pts[-1][1] - 1, base + 1, LEAF_SMALL, ramp='sprout')

    def drape(x0, x1, y0, n, length, base, **kw):
        for _ in range(n):
            vine(rnd.uniform(x0, x1), y0 + rnd.randint(-1, 2), int(length * rnd.uniform(0.6, 1.0)), base, **kw)

    def rune_wave(x, y):
        return 0.5 + 0.5 * math.sin(ph - x * 0.03 - y * 0.04)

    def carve(x, y, rows, glowing=True):
        x, y = int(round(x)), int(round(y))
        wv = rune_wave(x, y)
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch == 'x':
                    if glowing:
                        c.px(x + i, y + j, 'crystal', 1.6 + wv * 3.2)
                        if 0 <= y + j < H and 0 <= x + i < W:
                            c.lock[y + j, x + i] = True
                    else:
                        c.px(x + i, y + j, 'wood', 1.2)
                    below = rows[j + 1][i] if j + 1 < len(rows) else '.'
                    if below == '.':
                        c.px(x + i, y + j + 1, 'wood', 1.5)
        if glowing:
            glows.append((x + len(rows[0]) / 2, y + len(rows) / 2, 6, '#5cc4dc', 0.05 + 0.35 * wv ** 2, 1))

    def book(x, y_base, w, h, col):
        top = y_base - h
        c.rect(x, top, x + w, y_base, col, 3)
        c.rect(x, top, x + 1, y_base, col, 4.6)
        c.rect(x + w - 1, top, x + w, y_base, col, 1.4)
        c.rect(x, top, x + w, top + 1, col, 2)
        for by in (top + 2, y_base - 3):
            c.rect(x + 1, by, x + w - 1, by + 1, 'rune', 2.8)

    def books(x, y_base, n, maxx, colors=('red', 'green', 'blue', 'paper', 'green', 'red', 'lav')):
        for _ in range(n):
            w = rnd.choice([3, 4, 4, 5])
            h = rnd.randint(11, 16)
            if x + w > maxx:
                break
            book(x, y_base, w, h, rnd.choice(colors))
            x += w
        return x

    def flat_books(x0, x1, y_base, cols):
        for i, col in enumerate(cols):
            y = y_base - 3 * (i + 1)
            c.rect(x0 + i, y, x1 - i, y + 3, col, 3)
            c.rect(x0 + i, y, x1 - i, y + 1, col, 4.5)
            c.rect(x1 - i - 2, y, x1 - i, y + 3, 'paper', 4)

    def candle(x, base_y, h, off):
        c.rect(x, base_y - h, x + 3, base_y, 'wax', 3.5)
        c.rect(x, base_y - h, x + 1, base_y, 'wax', 5)
        c.rect(x + 2, base_y - h, x + 3, base_y, 'wax', 2)
        c.px(x + 1, base_y - h + 2, 'wax', 5)
        c.px(x + 1, base_y - h - 1, 'void', 0)
        c.sprite(x, base_y - h - 4, SMALL_FLAMES[(t // 4 + off) % 3], 'flame', {'h': 2, 'w': 5, 'f': 3})
        glows.append((x + 1, base_y - h - 3, 10, '#ffb440', 0.5 + 0.15 * math.sin(ph * 3 + off), 1))

    def post_wood(x0, x1, y0, y1):
        c.rect(x0, y0, x1, y1, 'wood', 3)
        c.rect(x0, y0, x0 + 1, y1, 'wood', 5)
        c.rect(x1 - 1, y0, x1, y1, 'wood', 1.5)
        for y in range(y0 + 4, y1 - 2, 11):
            c.px(x0 + 2 + (y // 11) % 2, y, 'wood', 2); c.px(x0 + 2 + (y // 11) % 2, y + 1, 'wood', 2)
        for y in (y0 + 12, (y0 + y1) // 2, y1 - 8):
            c.px(x0 + (x1 - x0) // 2, y, 'wood', 6); c.px(x0 + (x1 - x0) // 2 + 1, y + 1, 'wood', 1)

    # ================================================================== PARED
    c.rect(0, 0, W, FLOOR_Y, 'wall', 3)
    noise = np.array([[rnd.random() for _ in range(W)] for _ in range(H)])
    # yeso: variación suave y grande (manchas de cal), sin puntitos sueltos
    c.lvl[yy < FLOOR_Y] += (0.25 * np.sin(xx * 0.07 + np.sin(yy * 0.05) * 2) * np.cos(yy * 0.06 + xx * 0.01))[yy < FLOOR_Y]
    c.lvl[(yy > 124) & (yy < FLOOR_Y)] -= 0.35
    # piedra a la vista donde se cayó el yeso (con borde roto y musgo en las juntas)
    def stones(cx, cy, rx, ry):
        """Parche irregular donde se cayó el yeso: piedras cálidas, borde roto con luz abajo y sombra arriba."""
        ed = np.hypot((xx - cx) / rx, (yy - cy) / ry) + 0.18 * np.sin(xx * 0.9 + yy * 1.7) + 0.12 * np.sin(xx * 2.3)
        hole = ed < 1
        row = np.floor((yy - cy) / 4).astype(int)
        col = np.floor((xx - cx + (row % 2) * 3) / 6).astype(int)
        lv = 3.4 + ((row * 7 + col * 13) % 5 - 2) * 0.35
        lu = (yy - cy) % 4
        lx = (xx - cx + (row % 2) * 3) % 6
        c.mask(hole, 'stone', lv.astype(np.float32))
        c.mask(hole & (lu == 0), 'stone', (lv + 1).astype(np.float32))
        c.mask(hole & ((lu == 3) | (lx == 5)), 'stone', 1.8)
        rim = (ed >= 1) & (ed < 1.22)
        c.mask(rim & (yy < cy), 'wall', 1.8)                        # sombra del yeso arriba
        c.mask(rim & (yy >= cy), 'wall', 4.4)                       # canto con luz abajo
        moss = hole & (lu == 3) & (np.sin(xx * 3.1 + yy) > 0.6)
        c.mask(moss, 'sprout', 3.4)
    stones(240, 26, 10, 7)
    stones(388, 88, 8, 6)
    # grietas finas en el yeso
    for (gx, gy, n_) in [(214, 30, 10), (262, 18, 8), (390, 30, 9), (24, 100, 4), (160, 20, 6)]:
        x_, y_ = gx, gy
        for _ in range(n_):
            c.px(x_, y_, 'wall', 1.2); c.px(x_ + 1, y_, 'wall', 4)
            x_ += rnd.choice([-1, 0, 1]); y_ += 1
    # sombra suave bajo la viga y manchas de humedad
    c.lvl[(yy >= 9) & (yy < 13)] -= 0.8
    c.lvl[(yy >= 13) & (yy < 16)] -= 0.4
    # entramado: postes, riel y una diagonal
    for (x0, x1) in [(0, 6), (96, 102), (170, 176), (252, 258), (302, 308), (412, 418)]:
        post_wood(x0, x1, 8, FLOOR_Y)
    for (x0, x1) in [(6, 96), (176, 252), (258, 302), (308, 412)]:
        c.rect(x0, 104, x1, 108, 'wood', 3)
        c.rect(x0, 104, x1, 105, 'wood', 5)
        c.rect(x0, 107, x1, 108, 'wood', 1.5)
    for (x0, x1) in [(6, 96), (176, 252), (258, 302), (308, 412)]:
        c.rect(x0, 108, x1, FLOOR_Y - 4, 'wood', 2.6)
        n_ = max(1, round((x1 - x0) / 22))
        pw = (x1 - x0) / n_
        for k in range(n_):
            a, b = int(x0 + k * pw) + 2, int(x0 + (k + 1) * pw) - 2
            c.rect(a, 111, b, FLOOR_Y - 7, 'wood', 3.2)            # panel en relieve
            c.rect(a, 111, b, 112, 'wood', 1.4)
            c.rect(a, 111, a + 1, FLOOR_Y - 7, 'wood', 1.4)
            c.rect(a + 1, FLOOR_Y - 8, b, FLOOR_Y - 7, 'wood', 4.6)
            c.rect(b - 1, 112, b, FLOOR_Y - 7, 'wood', 4.6)
            c.rect(a + 3, 114, b - 3, 115, 'wood', 3.8)
        c.rect(x0, 108, x1, 109, 'wood', 1)
    # repisita sobre el sillón: dos plantas y un frasco
    c.rect(326, 66, 372, 69, 'wood', 5)
    c.rect(326, 66, 372, 67, 'wood', 6.5)
    c.rect(326, 69, 372, 70, 'wood', 1.5)
    for bx in (330, 366):
        c.sprite(bx, 70, ["xxx", ".xx", "..x"], 'wood', {'x': 3})
    for (qx, w_) in [(332, 8), (356, 7)]:
        c.rect(qx, 59, qx + w_, 66, 'clay', 3)
        c.rect(qx, 59, qx + w_, 60, 'clay', 5)
        c.rect(qx + w_ - 2, 60, qx + w_, 66, 'clay', 1.8)
    for (dx, ln) in [(334, 10), (337, 14), (358, 8), (360, 11)]:
        vine(dx, 59 - ln, ln, 5, sway=0.6, every=2, big=False, alive=0.5)
    c.rect(345, 58, 351, 66, 'glass', 2); c.rect(346, 60, 350, 66, 'arcane', 3.6)
    c.rect(346, 60, 350, 61, 'arcane', 5.5); c.rect(347, 55, 349, 58, 'wood', 5)
    glows.append((348, 62, 8, '#9060dc', 0.35 + 0.15 * math.sin(ph + 2), 1))
    # cuadro de constelaciones (las estrellas titilan)
    QX0, QY0, QX1, QY1 = 180, 38, 206, 70
    c.rect(QX0, QY0, QX1, QY1, 'wood', 4)
    c.rect(QX0, QY0, QX1, QY0 + 1, 'wood', 6)
    c.rect(QX0, QY1 - 1, QX1, QY1, 'wood', 1.8)
    c.rect(QX0 + 2, QY0 + 2, QX1 - 2, QY1 - 2, 'blue', 1.2)
    stars = [(184, 44), (189, 48), (195, 46), (200, 52), (192, 56), (186, 62), (198, 63), (202, 44)]
    for i in range(len(stars) - 2):
        c.line(*stars[i], *stars[i + 1], 'blue', 2.6)
    for i, (sx_, sy_) in enumerate(stars):
        on = (t // 6 + i) % 5 != 0
        c.px(sx_, sy_, 'rune', 6 if on else 4)
        if on and i % 3 == 0:
            c.px(sx_ - 1, sy_, 'rune', 3.5); c.px(sx_ + 1, sy_, 'rune', 3.5)
            c.px(sx_, sy_ - 1, 'rune', 3.5); c.px(sx_, sy_ + 1, 'rune', 3.5)
    c.px(193, QY0 - 3, 'brass', 5); c.line(193, QY0 - 3, QX0 + 3, QY0, 'stem', 2); c.line(193, QY0 - 3, QX1 - 3, QY0, 'stem', 2)
    # zócalo
    c.rect(0, FLOOR_Y - 4, W, FLOOR_Y, 'wood', 3)
    c.rect(0, FLOOR_Y - 4, W, FLOOR_Y - 3, 'wood', 5)
    c.rect(0, FLOOR_Y - 1, W, FLOOR_Y, 'wood', 1)

    # ================================================================== VIGA
    c.rect(0, 0, W, 8, 'wood', 3)
    c.rect(0, 0, W, 1, 'wood', 5)
    c.rect(0, 1, W, 2, 'wood', 4)
    c.rect(0, 7, W, 8, 'wood', 1)
    c.rect(0, 8, W, 9, 'void', 0)
    for x in range(W):
        if (x * 7) % 23 < 9:
            c.px(x, 3 + (x // 11) % 2, 'wood', 2)
    for kx in (60, 210, 350):
        c.sprite(kx, 2, [".oo.", "oxxo", ".oo."], 'wood', {'o': 1.5, 'x': 0.5})
    def garland(x0, x1, y0, base):
        p0 = rnd.random() * 6
        for x in range(x0, x1):
            y = y0 + 2.2 * math.sin(x * 0.045 + p0) + 0.4 * math.sin(ph + x * 0.05)
            c.px(x, y, 'stem', base - 3)
            if x % 4 == 0:
                up = (x // 4) % 2 == 0
                rows = rnd.choice([LEAF_SMALL, LEAF_MED, LEAF_SIDE])
                ramp = rnd.choice(['leaf', 'leaf', 'sprout', 'shade'])
                leaf(x, y - (len(rows) - 1 if up else -1) + (0 if up else 0), base + rnd.choice([0, 1, -1]), rows,
                     flip=rnd.random() < 0.5, ramp=ramp)
    _garland = lambda: (garland(-2, W + 2, 8, 4), None)

    # ================================================================== PISO de tablones en perspectiva
    VPX, VPY = 209, -260                           # punto de fuga muy arriba: tablones casi verticales
    fy = (yy - VPY) / (H - VPY)
    xb = VPX + (xx - VPX) / np.maximum(fy, 1e-3)    # x donde ese píxel llegaría al borde de abajo
    board = np.floor(xb / 22).astype(int)
    edge = (xb / 22) - board
    lv = 3 + ((board * 37) % 5 - 2) * 0.22
    floor_m = yy >= FLOOR_Y
    depth = np.log((yy - VPY) / (FLOOR_Y - VPY))
    jt = (depth * 9 + (board * 0.37) % 1)
    joint = np.abs(jt - np.round(jt)) < 0.035 + 0.02 * (1 - fy)
    gr = ((xb * 1.7 + np.sin(yy * 0.3 + board) * 3) % 9 < 0.9)
    c.mask(floor_m, 'wood', lv.astype(np.float32))
    c.mask(floor_m & gr, 'wood', (lv - 0.6).astype(np.float32))
    c.mask(floor_m & (edge < 0.06), 'wood', 1)
    c.mask(floor_m & (edge > 0.06) & (edge < 0.12), 'wood', (lv + 1).astype(np.float32))
    c.mask(floor_m & joint, 'wood', 1.2)
    c.mask(floor_m & (yy < FLOOR_Y + 2), 'wood', 1.5)

    # ================================================================== ALFOMBRA con círculo bordado
    RT, RB = 168, 224
    for y in range(RT, RB):
        k = (y - RT) / (RB - RT)
        x0, x1 = 128 - 22 * k, 312 + 22 * k
        c.rect(x0, y, x1, y + 1, 'green', 2.6)
        if y in (RT, RT + 1, RB - 2, RB - 1):
            c.rect(x0, y, x1, y + 1, 'rune', 2.4)
        c.rect(x0, y, x0 + 2, y + 1, 'rune', 2.4); c.rect(x1 - 2, y, x1, y + 1, 'rune', 2.4)
        if RT + 4 <= y < RB - 4:
            c.rect(x0 + 4, y, x0 + 5, y + 1, 'rune', 2); c.rect(x1 - 5, y, x1 - 4, y + 1, 'rune', 2)
        if y in (RT + 4, RB - 5):
            c.rect(x0 + 4, y, x1 - 4, y + 1, 'rune', 2)
    for x in range(110, 340, 4):                               # flecos
        k = 1.0
        if 106 <= x <= 334:
            c.px(x, RB, 'paper', 3); c.px(x, RB + 1, 'paper', 2.5)
    rcx, rcy = 220, 196
    rd = np.hypot((xx - rcx) / 2.6, yy - rcy)                  # elipse (vista en perspectiva)
    rug = (yy > RT + 5) & (yy < RB - 5)
    c.mask(rug & ((np.abs(rd - 20) < 0.55) | (np.abs(rd - 15) < 0.5) | (np.abs(rd - 6) < 0.5)), 'rune', 2.6)
    for k in range(12):
        a = k * math.pi / 6
        c.sprite(int(rcx + 17.5 * 2.6 * math.cos(a)) - 1, int(rcy + 17.5 * math.sin(a)) - 1, MINI[k % 4], 'rune', {'x': 2.8})
    for k in range(8):
        a = k * math.pi / 4
        c.line(rcx + 6 * 2.6 * math.cos(a), rcy + 6 * math.sin(a), rcx + 15 * 2.6 * math.cos(a), rcy + 15 * math.sin(a), 'rune', 2.2)
    c.sprite(rcx - 3, rcy - 3, STAR, 'rune', {'a': 2.8, 'b': 3.4, 'c': 4})

    # ================================================================== VENTANA (la de la muestra v3)
    FX0, FX1, FY0, FY1 = 24, 80, 20, 96
    c.rect(FX0 - 4, FY0 - 4, FX1 + 4, FY0, 'wood', 4)
    c.rect(FX0 - 4, FY0 - 4, FX1 + 4, FY0 - 3, 'wood', 6)
    c.rect(FX0 - 3, FY0 - 1, FX1 + 3, FY0, 'wood', 2)
    OX0, OX1, OY0, OY1 = FX0 + 3, FX1 - 3, FY0 + 3, FY1 - 1
    view = (xx >= OX0) & (xx < OX1) & (yy >= OY0) & (yy < OY1)
    c.mask(view, 'sky', np.floor(1.6 + np.clip((yy - OY0) / 12, 0, 4.4)))

    def cloud(cx, cy, blobs):
        for (ox, oy, rr) in blobs:
            bd = np.hypot(xx - (cx + ox), (yy - (cy + oy)) * 1.25)
            m = view & (bd <= rr)
            rel = yy - (cy + oy)
            c.mask(m, 'cloud', np.where(rel < -rr * 0.35, 4, np.where(rel > rr * 0.35, 1.7, 3)).astype(np.float32))
    dr = 3 * t / FRAMES
    cloud(44 + dr, 40, [(0, 0, 6), (7, 2, 5), (-7, 3, 4), (13, 4, 3.5), (-12, 5, 3), (2, -4, 4)])
    cloud(70 + dr * 0.7, 58, [(0, 0, 3.5), (4, 1, 3), (-4, 1, 2.5)])
    mtn = 72 - np.clip(8 - np.abs(xx - 38) * 0.55, 0, 8) - np.clip(5 - np.abs(xx - 66) * 0.5, 0, 5)
    c.mask(view & (yy >= mtn), 'hill', np.where(xx < 38, 2, 1.4).astype(np.float32))
    c.mask(view & (yy >= mtn) & (yy < mtn + 1.5) & (mtn < 67), 'cloud', 3)
    far = 79 + 2 * np.sin(xx * 0.12 + 1) + 1.2 * np.sin(xx * 0.33)
    c.mask(view & (yy >= far), 'hill', np.clip(4 - (yy - far) / 3, 2.6, 4).astype(np.float32))
    for tx in range(OX0 - 3, OX1 + 3, 4):
        ty = 83 + rnd.randint(-1, 1)
        td = np.hypot(xx - tx, (yy - ty) * 0.9)
        rel = (xx - tx) + (yy - ty)
        c.mask(view & (td <= rnd.choice([2.5, 3, 3.5])), 'tree', np.where(rel < -1.5, 4, np.where(rel > 1.5, 1.4, 2.6)).astype(np.float32))
    mead = 86 + np.sin(xx * 0.2) * 0.8
    c.mask(view & (yy >= mead), 'sprout', np.clip(5.4 - (yy - mead) / 2.6, 3, 5.4).astype(np.float32))
    c.mask(view & (yy >= 88) & (np.abs(xx - (60 + (yy - 88) * 1.6)) < 1 + (yy - 88) * 0.35), 'paper', 3.6)
    for k in range(12):
        fx, fy = rnd.randint(OX0, OX1 - 1), rnd.randint(88, 94)
        if view[fy, fx]:
            c.px(fx, fy, rnd.choice(['petal', 'lav', 'rune']), 3.5)
    for k, (ox, oy) in enumerate([(0, 0), (-4, 2), (-7, -1), (-10, 3)]):     # bandada
        bx = OX0 - 4 + ((t * 0.9 + ox + 60) % 70)
        by = 50 + oy + math.sin(ph * 2 + k) * 0.6
        if OX0 <= bx < OX1 - 1:
            up = (t // 3 + k) % 2 == 0
            c.px(bx, by, 'stone', 1.2)
            c.px(bx - 1, by - (1 if up else 0), 'stone', 1.2)
            c.px(bx + 1, by - (1 if up else 0), 'stone', 1.2)
            if not up:
                c.px(bx - 2, by + 1, 'stone', 1.6); c.px(bx + 2, by + 1, 'stone', 1.6)
    fr = (xx >= FX0) & (xx < FX1) & (yy >= FY0) & (yy < FY1) & ~view
    c.mask(fr, 'wood', 4)
    c.rect(FX0, FY0, FX0 + 1, FY1, 'wood', 2)
    c.rect(FX1 - 1, FY0, FX1, FY1, 'wood', 2)
    c.rect(OX0 - 1, OY0, OX0, OY1, 'wood', 6)
    c.rect(OX0, OY0 - 1, OX1, OY0, 'wood', 2)
    TY = OY0 + 12
    c.rect(OX0, TY, OX1, TY + 3, 'wood', 4)
    c.rect(OX0, TY, OX1, TY + 1, 'wood', 6)
    c.rect(OX0, TY + 2, OX1, TY + 3, 'wood', 2)
    for k in range(1, 4):
        x = OX0 + k * (OX1 - OX0) // 4
        c.rect(x, OY0, x + 1, TY, 'wood', 3)
    c.mask(view & (yy < TY) & ((xx + yy) % 13 == 0) & (yy > OY0 + 2) & (yy < TY - 2), 'sky', 6)
    MID = (OX0 + OX1) // 2
    LX0, LX1, LY0, LY1 = OX0, MID, TY + 3, OY1
    c.rect(LX0, LY0, LX0 + 2, LY1, 'wood', 4.5)
    c.rect(LX1 - 2, LY0, LX1, LY1, 'wood', 3.5)
    c.rect(LX0, LY1 - 3, LX1, LY1, 'wood', 4)
    c.rect(LX0, LY1 - 3, LX1, LY1 - 2, 'wood', 6)
    for k in (1, 2):
        y = LY0 + k * (LY1 - 3 - LY0) // 3
        c.rect(LX0 + 2, y, LX1 - 2, y + 1, 'wood', 4)
    c.rect((LX0 + LX1) // 2, LY0, (LX0 + LX1) // 2 + 1, LY1 - 3, 'wood', 4)
    for (gx, gy) in [(LX0 + 4, LY0 + 8), (LX0 + 15, LY0 + 20)]:
        for i in range(4):
            c.px(gx + i, gy - i, 'cloud', 4)
    c.px(LX1 - 3, (LY0 + LY1) // 2, 'brass', 5); c.px(LX1 - 3, (LY0 + LY1) // 2 + 1, 'brass', 3)
    RX0, RX1 = FX1 - 2, FX1 + 6                                # hoja abierta
    for x in range(RX0, RX1):
        k = (x - RX0) / (RX1 - RX0)
        top, bot = LY0 - 1 - k * 4, LY1 + 1 + k * 4
        c.rect(x, top, x + 1, bot, 'wood', 4 if x in (RX0, RX1 - 1) else 3)
        if RX0 < x < RX1 - 1:
            c.rect(x, top + 2, x + 1, bot - 2, 'sky', 3 + (x % 3 == 0))
            for j in (1, 2):
                c.px(x, top + 2 + j * (bot - top - 4) / 3, 'wood', 4)
        c.px(x, top, 'wood', 6)
    # cortina de lino
    c.rect(FX0 - 6, FY0 + 1, FX1 + 12, FY0 + 2, 'brass', 3)
    c.px(FX0 - 7, FY0 + 1, 'brass', 5); c.px(FX1 + 12, FY0 + 1, 'brass', 5)
    for y in range(FY0 + 2, FY1 + 4):
        k = (y - FY0) / (FY1 - FY0)
        tie = 64
        width = 9 - 5 * math.exp(-((y - tie) / 6) ** 2) + (2.5 * (k - 0.6) if y > tie else 0)
        sway = (1.6 * math.sin(ph - y * 0.07) * max(0, (y - tie) / 30)) if y > tie else 0.5 * math.sin(ph - y * 0.05) * k
        x0 = FX0 - 6 + sway * 0.4
        x1 = x0 + width + sway
        for x in range(int(round(x0)), int(round(x1))):
            fold = math.sin((x - x0) * 1.3 + y * 0.02)
            c.px(x, y, 'petal', 2.2 + fold * 0.9 + (0.4 if x < x0 + 2 else 0))
        c.px(int(round(x1)) - 1, y, 'petal', 1.2)
    c.rect(FX0 - 6, 63, FX0 + 2, 65, 'red', 3)
    c.rect(FX0 - 6, 63, FX0 + 2, 64, 'red', 4)
    # alféizar, maceta y libros
    c.rect(FX0 - 4, FY1, FX1 + 4, FY1 + 2, 'wood', 6)
    c.rect(FX0 - 4, FY1 + 2, FX1 + 4, FY1 + 4, 'wood', 4)
    c.rect(FX0 - 3, FY1 + 4, FX1 + 3, FY1 + 5, 'wood', 1.5)
    c.rect(FX0 - 2, FY1 + 5, FX1 + 2, FY1 + 6, 'void', 0)
    px0, py0 = 34, 89
    c.rect(px0, py0, px0 + 9, py0 + 2, 'clay', 4.5)
    c.rect(px0 + 1, py0, px0 + 8, py0 + 1, 'clay', 5)
    for j in range(2, 7):
        ins = (j - 2) // 2
        c.rect(px0 + ins, py0 + j, px0 + 9 - ins, py0 + j + 1, 'clay', 3)
        c.px(px0 + ins + 1, py0 + j, 'clay', 4.2); c.px(px0 + 8 - ins, py0 + j, 'clay', 1.6)
    for (dx, ln) in [(-1, 9), (2, 12), (5, 8)]:
        vine(px0 + 3 + dx, py0 - ln, ln, 5, sway=0.7, every=2, big=False, alive=0.5)
    for (fx, fy) in [(36, 79), (40, 77), (43, 81)]:
        c.sprite(fx - 1, fy - 1, JASMINE, 'petal', {'p': 3.5, 'y': ('rune', 4)})
    flat_books(58, 72, FY1, ['green', 'red'])

    # ================================================================== ESCRITORIO bajo la ventana (Continuar estudiando)
    DX0, DX1, DY = 2, 100, 112
    c.rect(DX0, DY, DX1, DY + 5, 'wood', 5)
    c.rect(DX0, DY, DX1, DY + 1, 'wood', 7)
    c.rect(DX0, DY + 5, DX1, DY + 6, 'wood', 2)
    c.rect(DX0 + 2, DY + 6, DX1 - 2, DY + 15, 'wood', 3)
    c.rect(DX0 + 2, DY + 7, DX1 - 2, DY + 8, 'wood', 4.5)
    c.rect(DX0 + 2, DY + 14, DX1 - 2, DY + 15, 'wood', 1.5)
    for i, x in enumerate(range(DX0 + 6, DX1 - 6, 8)):
        if i % 5 == 2:
            c.sprite(x, DY + 8, [".x.", "xox", "x.x", "xox", ".x."], 'wood', {'x': 1.4, 'o': 5})
        else:
            carve(x, DY + 8.5, RUNES[(i * 3) % len(RUNES)])
    for lx in (DX0 + 3, DX1 - 9):                              # patas torneadas
        for y in range(DY + 15, FLOOR_Y + 6):
            wbulge = 1 if (y - DY) % 12 in (3, 4, 5) else 0
            c.rect(lx - wbulge, y, lx + 6 + wbulge, y + 1, 'wood', 3)
            c.px(lx - wbulge, y, 'wood', 5); c.px(lx + 5 + wbulge, y, 'wood', 1.5)
    c.rect(DX0 + 9, FLOOR_Y - 6, DX1 - 9, FLOOR_Y - 4, 'wood', 2.5)   # travesaño
    for x in range(DX0, DX1):
        if (x * 13) % 31 < 6:
            c.px(x, DY + 2 + (x // 17) % 2, 'wood', 4)
    # grimorio cerrado, tintero y pluma, vela
    c.rect(40, DY - 6, 64, DY, 'green', 3)
    c.rect(40, DY - 6, 64, DY - 5, 'green', 4.5)
    c.rect(41, DY - 3, 63, DY - 1, 'paper', 4)
    c.rect(41, DY - 2, 63, DY - 1, 'paper', 2.5)
    c.rect(50, DY - 6, 54, DY - 2, 'brass', 4)
    c.px(51, DY - 5, 'brass', 6)
    c.rect(70, DY - 6, 76, DY, 'glass', 1)
    c.rect(71, DY - 7, 75, DY - 6, 'brass', 4)
    c.rect(71, DY - 5, 72, DY - 1, 'glass', 4)
    for i in range(11):
        c.px(75 + i * 0.55, DY - 7 - i, 'petal', 3 if i < 8 else 4)
        c.px(76 + i * 0.55, DY - 7 - i, 'petal', 2 if i < 9 else 3)
    candle(16, DY, 8, 0)
    c.rect(14, DY - 1, 22, DY, 'brass', 4)
    # pisito redondo delante del escritorio
    SX, SY = 66, 136
    c.rect(SX - 12, SY, SX + 12, SY + 4, 'wood', 5)
    c.rect(SX - 12, SY, SX + 12, SY + 1, 'wood', 6.5)
    c.rect(SX - 11, SY + 4, SX + 11, SY + 5, 'wood', 2)
    for lx in (SX - 10, SX + 7):
        c.rect(lx, SY + 5, lx + 3, SY + 26, 'wood', 3.2)
        c.px(lx, SY + 8, 'wood', 5)
        c.rect(lx, SY + 5, lx + 1, SY + 26, 'wood', 4.5)
    c.rect(SX - 2, SY + 5, SX + 1, SY + 22, 'wood', 2)
    c.rect(SX - 9, SY + 16, SX + 9, SY + 18, 'wood', 2.6)

    # ================================================================== ESTANTERÍA CON RUNAS (Biblioteca)
    SX0, SX1 = 104, 168
    c.rect(SX0, 9, SX1, FLOOR_Y, 'wood', 1)
    for x in range(SX0 + 8, SX1, 9):
        c.rect(x, 15, x + 1, FLOOR_Y, 'wood', 0.5)
    c.rect(SX0 - 2, 9, SX1 + 2, 16, 'wood', 4)
    c.rect(SX0 - 2, 9, SX1 + 2, 10, 'wood', 6)
    c.rect(SX0 - 2, 15, SX1 + 2, 16, 'wood', 2)
    c.rect(SX0 - 2, 16, SX1 + 2, 17, 'void', 0)
    mx, my = (SX0 + SX1) // 2 + 3, 12.5
    for i, x in enumerate(range(SX0 + 2, SX1 - 2, 6)):
        if abs(x - mx) > 7:
            carve(x, 10, MINI[i % 4])
    md = np.hypot(xx - mx, yy - my)
    c.mask((md <= 4.2) & (md > 3.2), 'wood', 1.2)
    c.mask(md <= 3.2, 'wood', 5)
    wv = rune_wave(mx, my)
    c.mask(md <= 1.2, 'crystal', 4 + wv * 2.5)
    glows.append((mx, my, 10, '#5cc4dc', 0.3 + 0.5 * wv, 1))
    for (p0, p1) in [(SX0 - 2, SX0 + 6), (SX1 - 6, SX1 + 2)]:           # pilares con runas
        c.rect(p0, 17, p1, FLOOR_Y, 'wood', 4)
        c.rect(p0, 17, p0 + 1, FLOOR_Y, 'wood', 6)
        c.rect(p1 - 1, 17, p1, FLOOR_Y, 'wood', 2)
        c.rect(p0 + 2, 19, p1 - 2, FLOOR_Y - 4, 'wood', 2.4)
        c.rect(p0 + 2, 19, p1 - 2, 20, 'wood', 1)
        for i, y in enumerate(range(21, FLOOR_Y - 10, 8)):
            carve(p0 + 2.5, y, RUNES[(i + p0) % len(RUNES)])

    def shelf(y):
        c.rect(SX0 + 6, y, SX1 - 6, y + 6, 'wood', 4)
        c.rect(SX0 + 6, y, SX1 - 6, y + 1, 'wood', 6)
        c.rect(SX0 + 6, y + 5, SX1 - 6, y + 6, 'wood', 2)
        c.rect(SX0 + 6, y + 6, SX1 - 6, y + 8, 'void', 0)
        for i, x in enumerate(range(SX0 + 10, SX1 - 8, 7)):
            carve(x, y + 1.5, MINI[(i + y) % 4])

    IN0, IN1 = SX0 + 7, SX1 - 6
    shelf(38)
    books(IN0, 38, 12, IN1)
    shelf(72)
    x = books(IN0, 72, 4, IN1)
    px1 = x + 3                                                  # poción que brilla
    c.rect(px1 + 1, 61, px1 + 7, 72, 'glass', 2)
    c.rect(px1, 63, px1 + 8, 71, 'glass', 2)
    c.rect(px1 + 1, 65, px1 + 7, 71, 'crystal', 4)
    c.rect(px1 + 1, 65, px1 + 7, 66, 'crystal', 6)
    c.rect(px1 + 1, 63, px1 + 2, 70, 'glass', 6)
    c.rect(px1 + 3, 58, px1 + 5, 61, 'glass', 3)
    c.rect(px1 + 3, 56, px1 + 5, 58, 'wood', 5)
    c.px(px1 + 4, 70 - (t // 4) % 6, 'crystal', 7)
    glows.append((px1 + 4, 67, 11, '#3098b8', 0.55 + 0.15 * math.sin(ph), 1))
    books(px1 + 11, 72, 6, IN1)
    shelf(106)
    books(IN0, 106, 4, IN1)
    flat_books(IN0 + 22, IN1 - 2, 106, ['blue', 'lav', 'green'])
    shelf(FLOOR_Y - 10)
    books(IN0, FLOOR_Y - 10, 12, IN1, colors=('red', 'green', 'blue', 'paper'))

    # ================================================================== APARADOR + GLOBO (Mapa de conocimiento) + PERGAMINO (Calendario)
    AX0, AX1, AY = 180, 248, 116
    c.rect(AX0, AY, AX1, FLOOR_Y + 2, 'wood', 3)
    c.rect(AX0 - 2, AY - 3, AX1 + 2, AY, 'wood', 5)
    c.rect(AX0 - 2, AY - 3, AX1 + 2, AY - 2, 'wood', 7)
    c.rect(AX0 - 2, AY, AX1 + 2, AY + 1, 'wood', 1.5)
    c.rect(AX0, AY + 1, AX0 + 1, FLOOR_Y + 2, 'wood', 5)
    c.rect(AX1 - 1, AY + 1, AX1, FLOOR_Y + 2, 'wood', 1.5)
    for (d0, d1) in [(AX0 + 3, (AX0 + AX1) // 2 - 1), ((AX0 + AX1) // 2 + 1, AX1 - 3)]:   # dos puertas
        c.rect(d0, AY + 4, d1, FLOOR_Y - 2, 'wood', 2.2)
        c.rect(d0, AY + 4, d1, AY + 5, 'wood', 1)
        c.rect(d0, FLOOR_Y - 3, d1, FLOOR_Y - 2, 'wood', 4.5)
        c.rect(d1 - 1, AY + 4, d1, FLOOR_Y - 2, 'wood', 4.5)
        cx_ = (d0 + d1) // 2
        carve(cx_ - 1, AY + 9, RUNES[(d0 // 7) % len(RUNES)])
        c.sprite(cx_ - 2, AY + 17, [".x.", "xox", ".x."], 'wood', {'x': 1.4, 'o': 5})
        carve(cx_ - 1, AY + 23, RUNES[(d0 // 5 + 3) % len(RUNES)])
    c.px((AX0 + AX1) // 2 - 3, AY + 18, 'brass', 5); c.px((AX0 + AX1) // 2 + 2, AY + 18, 'brass', 5)
    for lx in (AX0 + 1, AX1 - 4):
        c.rect(lx, FLOOR_Y + 2, lx + 3, FLOOR_Y + 5, 'wood', 2)
    # globo dorado sobre su pie
    GX, GY, GR = 198, 96, 10
    gd = np.hypot(xx - GX, yy - GY)
    sphere = gd <= GR
    shade_l = np.clip(4.6 - np.hypot(xx - (GX - 3), yy - (GY - 3)) * 0.33, 1.5, 4.6)
    c.mask(sphere, 'blue', shade_l.astype(np.float32))
    spin = t * (2 * math.pi / FRAMES)                          # los continentes giran lento
    lon = np.arcsin(np.clip((xx - GX) / GR, -1, 1)) + spin
    lat = np.arcsin(np.clip((yy - GY) / GR, -1, 1))
    land = sphere & ((np.sin(lon * 2) * np.cos(lat * 3) + 0.3 * np.sin(lon * 5 + lat * 4)) > 0.35)
    c.mask(land, 'sprout', (shade_l + 0.3).astype(np.float32))
    c.mask(sphere & (np.abs(gd - GR) < 0.8), 'blue', 1)
    c.px(GX - 4, GY - 5, 'cloud', 4); c.px(GX - 5, GY - 4, 'cloud', 3)
    ring = (np.abs(np.hypot((xx - GX) * 1.0, (yy - GY)) - (GR + 2)) < 0.8) & (xx <= GX + 1)
    c.mask(ring, 'brass', 4.5)
    c.rect(GX - 1, GY - GR - 3, GX + 2, GY - GR - 1, 'brass', 5)
    c.rect(GX - 1, GY + GR + 1, GX + 2, GY + GR + 5, 'brass', 3.5)
    c.rect(GX - 5, GY + GR + 5, GX + 6, GY + GR + 7, 'brass', 4)
    c.rect(GX - 6, GY + GR + 7, GX + 7, AY - 3, 'brass', 2.5)
    glows.append((GX, GY, 18, '#ffd860', 0.25 + 0.1 * math.sin(ph), 1))
    candle(234, AY - 3, 7, 2)
    c.rect(214, AY - 9, 224, AY - 3, 'clay', 3)                 # macetita con hierba
    c.rect(214, AY - 9, 224, AY - 8, 'clay', 5)
    for (dx, ln) in [(0, 8), (3, 11), (6, 7)]:
        vine(216 + dx, AY - 9 - ln, ln, 5, sway=0.6, every=2, big=False, alive=0.5)
    # pergamino calendario clavado en la pared
    CX0, CY0, CX1, CY1 = 214, 44, 244, 84
    c.rect(CX0, CY0, CX1, CY1, 'paper', 4)
    c.rect(CX0, CY0, CX1, CY0 + 2, 'paper', 5)
    c.rect(CX1 - 1, CY0, CX1, CY1, 'paper', 2.5)
    c.rect(CX0, CY1 - 1, CX1, CY1, 'paper', 2.5)
    c.rect(CX0 - 1, CY0 - 1, CX1 + 1, CY0 + 1, 'paper', 3)      # enrollado arriba
    c.rect(CX0 - 1, CY0 - 1, CX1 + 1, CY0, 'paper', 5)
    c.rect(CX0 + 3, CY0 + 4, CX1 - 3, CY0 + 6, 'red', 3)        # título
    for gy_ in range(CY0 + 10, CY1 - 4, 6):                     # cuadrícula de días
        c.rect(CX0 + 3, gy_, CX1 - 3, gy_ + 1, 'paper', 2.4)
    for gx_ in range(CX0 + 3, CX1 - 2, 6):
        c.rect(gx_, CY0 + 10, gx_ + 1, CY1 - 5, 'paper', 2.4)
    c.sprite(CX0 + 16, CY0 + 18, ["x.x", ".x.", "x.x"], 'red', {'x': 3.5})          # día marcado
    c.sprite(CX0 + 4, CY0 + 29, [".x.", "xxx", ".x."], 'arcane', {'x': 4})
    c.px(CX0 + 2, CY0 + 1, 'brass', 6); c.px(CX1 - 3, CY0 + 1, 'brass', 6)
    c.rect(CX1 - 6, CY1 - 1, CX1 - 4, CY1 + 6, 'red', 3.5)       # cinta colgando

    # ================================================================== PERCHERO con túnica y sombrero de mago
    c.rect(260, 32, 300, 37, 'wood', 4)
    c.rect(260, 32, 300, 33, 'wood', 6)
    c.rect(260, 36, 300, 37, 'wood', 1.6)
    carve(278, 33, MINI[1])
    for pgx in (266, 292):
        c.rect(pgx, 37, pgx + 2, 41, 'wood', 5); c.px(pgx, 41, 'brass', 5); c.px(pgx + 1, 41, 'brass', 4)
    # túnica: capucha, hombros, cuerpo que se abre hacia abajo, forro violeta, ribete dorado con estrellas
    RCX = 279
    for y in range(40, 132):
        k = (y - 40) / 92
        if y < 50:
            half = 5 + (y - 40) * 0.5
        elif y < 58:
            half = 10 + (y - 50) * 0.62
        else:
            half = 15 + k * 5
        sway = 0.9 * math.sin(ph - y * 0.04) * max(0, (y - 70) / 60)
        x0, x1 = RCX - half + sway * 0.6, RCX + half + sway
        for x in range(int(round(x0)), int(round(x1))):
            u = (x - x0) / max(1, x1 - x0)
            fold = 0.7 * math.sin(u * 9 + y * 0.015) if y > 58 else 0
            lv = 2.4 + 1.1 * math.cos((u - 0.35) * math.pi) + fold
            if y < 50:
                lv -= 0.3
            c.px(x, y, 'blue', lv)
        c.px(round(x0), y, 'blue', 0.8); c.px(round(x1) - 1, y, 'blue', 0.8)
        if y > 58:                                               # abertura delantera con forro
            ox = RCX + sway * 0.8 + 0.5
            gap = (y - 58) * 0.09
            for x in range(int(ox - gap), int(ox + gap) + 1):
                c.px(x, y, 'arcane', 2.4)
            c.px(ox - gap - 1, y, 'rune', 3.2); c.px(ox + gap + 1, y, 'rune', 3.2)
        if y >= 127:                                             # ribete del ruedo
            for x in range(int(round(x0)), int(round(x1))):
                c.px(x, y, 'rune', 3.4 if y < 129 else 2.4)
    for (sx_, sy_) in [(266, 120), (273, 122), (286, 122), (293, 120), (268, 98), (291, 104)]:   # estrellitas bordadas
        c.sprite(sx_ - 1, sy_ - 1, [".x.", "xxx", ".x."], 'rune', {'x': 3.6})
    c.rect(RCX - 9, 70, RCX + 10, 72, 'red', 3)                   # faja
    c.rect(RCX - 9, 70, RCX + 10, 71, 'red', 4.2)
    c.rect(RCX + 4, 72, RCX + 6, 82, 'red', 3.4)
    c.px(RCX + 4, 82, 'rune', 3.5); c.px(RCX + 5, 83, 'rune', 3.5)
    c.rect(RCX - 2, 69, RCX + 3, 73, 'brass', 4.6)
    # mangas caídas a los lados
    for (sx0, dirx) in [(RCX - 19, -1), (RCX + 15, 1)]:
        for y in range(56, 98):
            w_ = 4 + (y - 56) * 0.08
            sw = 0.6 * math.sin(ph - y * 0.05) * (y - 56) / 42
            for x in range(int(sx0 + sw), int(sx0 + w_ + sw)):
                c.px(x, y, 'blue', 2 + (0.8 if dirx < 0 and x == int(sx0 + sw) + 1 else 0))
        c.rect(sx0, 96, sx0 + 6, 98, 'rune', 3.2)
    # capucha (pliegue) y broche
    c.rect(RCX - 4, 42, RCX + 5, 48, 'blue', 1.4)
    c.rect(RCX - 3, 43, RCX + 4, 47, 'arcane', 2)
    c.sprite(RCX - 1, 52, [".x.", "xox", ".x."], 'brass', {'x': 4.4, 'o': ('crystal', 5.5)})
    glows.append((RCX, 53, 6, '#5cc4dc', 0.3 + 0.2 * math.sin(ph * 2), 1))
    # sombrero puntiagudo colgado del otro clavo, con la punta caída
    HX, HY = RCX, 20
    for y in range(HY, HY + 24):
        tt = (y - HY) / 24
        half = 0.6 + tt * 7.5
        cx_ = HX - 7 * (1 - tt) ** 2.2 + 0.4 * math.sin(ph) * (1 - tt)     # la punta se dobla hacia un lado
        for x in range(int(round(cx_ - half)), int(round(cx_ + half)) + 1):
            u = (x - (cx_ - half)) / max(1, 2 * half)
            c.px(x, y, 'blue', 1.8 + 1.4 * math.cos((u - 0.3) * math.pi))
    c.px(HX - 8, HY - 1, 'rune', 4.5)                             # borla de la punta
    c.rect(HX - 7, HY + 17, HX + 8, HY + 20, 'rune', 3.4)        # cinta dorada
    c.rect(HX - 7, HY + 17, HX + 8, HY + 18, 'rune', 4.6)
    c.sprite(HX - 1, HY + 10, [".x.", "xxx", ".x."], 'rune', {'x': 4.2})
    for y in range(HY + 20, HY + 25):                             # ala ancha, vista un poco desde abajo
        half = 14 - abs(y - (HY + 22)) * 1.6
        c.rect(HX - half, y, HX + half + 1, y + 1, 'blue', 3.6 if y == HY + 20 else (2.6 if y < HY + 23 else 1.4))
    # botas al pie de la túnica
    for bx_ in (268, 284):
        c.rect(bx_, 138, bx_ + 7, FLOOR_Y + 2, 'clay', 2.2)
        c.rect(bx_, 138, bx_ + 7, 139, 'clay', 3.6)
        c.rect(bx_ - 2, FLOOR_Y - 1, bx_ + 7, FLOOR_Y + 2, 'clay', 2.6)
        c.rect(bx_ - 2, FLOOR_Y + 1, bx_ + 7, FLOOR_Y + 2, 'clay', 1)
        c.rect(bx_ + 1, 141, bx_ + 6, 142, 'brass', 3.6)

    # ================================================================== BÁCULO apoyado en la pared (Tienda)
    # vara de madera levemente inclinada, cabeza de media luna de latón que abraza una estrella de cristal
    BTX, BTY, BBX, BBY = 304, 64, 311, FLOOR_Y + 8
    n = BBY - BTY
    for k in range(n):
        x = BTX + (BBX - BTX) * k / n
        y = BTY + k
        c.rect(x - 1, y, x + 2, y + 1, 'wood', 3.6)
        c.px(x - 1, y, 'wood', 5.2); c.px(x + 1, y, 'wood', 1.8)
        if k % 17 == 8:                                       # anillos de latón
            c.rect(x - 1, y, x + 2, y + 2, 'brass', 4.5)
    c.rect(BTX - 2, BTY + 18, BTX + 4, BTY + 22, 'red', 3)     # empuñadura envuelta
    for k in range(4):
        c.px(BTX - 1 + k % 2, BTY + 18 + k, 'red', 4.5)
    hx, hy = BTX + 0.5, BTY - 9
    hd = np.hypot(xx - hx, yy - hy)
    hang = np.degrees(np.arctan2(yy - hy, xx - hx))
    moon = (hd <= 9) & (hd >= 6.3) & ((hang > 20) | (hang < -200)) & ~((hang > -60) & (hang < 20))
    moon = (hd <= 9) & (hd >= 6.3) & ~((hang > -150) & (hang < -30))
    c.mask(moon, 'brass', np.clip(5.5 - (xx - hx + 9) * 0.18, 2.5, 5.5).astype(np.float32))
    c.mask(moon & (hd > 8.3), 'brass', 1.8)
    tw = 0.5 + 0.5 * math.sin(ph * 2)
    c.sprite(int(hx) - 3, int(hy) - 4, STAR, 'crystal', {'a': 4.5 + tw, 'b': 6, 'c': 7})
    c.lock[int(hy) - 4:int(hy) + 3, int(hx) - 3:int(hx) + 4] |= c.mat[int(hy) - 4:int(hy) + 3, int(hx) - 3:int(hx) + 4] == c.mid('crystal')
    glows.append((hx, hy - 1, 22, '#5cc4dc', 0.55 + 0.35 * tw, 1))
    for k in range(3):                                        # chispitas que orbitan la estrella
        a = ph + k * 2.1
        c.px(hx + 11 * math.cos(a), hy - 1 + 6 * math.sin(a), 'crystal', 6.5)
    c.px(hx - 9, hy + 6, 'brass', 5)
    c.rect(BTX + 1, BTY - 1, BTX + 3, BTY + 6, 'paper', 3.5)   # cintita de tela
    c.px(BTX + 3 + round(math.sin(ph)), BTY + 7, 'paper', 3)

    # ================================================================== SILLÓN (Perfil) + mesita
    CH0, CH1, CTOP = 318, 380, 92
    CC = (CH0 + CH1) / 2
    # respaldo de orejas: arco arriba, orejas que salen a los lados
    for y in range(CTOP, 130):
        dy_ = y - CTOP
        if dy_ < 6:
            half = 14 + dy_ * 1.6
        elif dy_ < 14:
            half = 24 + (dy_ - 6) * 0.25
        else:
            half = 26 - max(0, dy_ - 26) * 0.15
        x0, x1 = int(CC - half), int(CC + half)
        for x in range(x0, x1):
            u = (x - x0) / max(1, x1 - x0)
            lvx = 3.4 + 0.9 * math.cos((u - 0.3) * math.pi) - (0.7 if dy_ > 30 else 0)
            plaid = ((x - x0) % 7 == 0) or (dy_ % 7 == 0)
            gold = (dy_ % 14 == 3)
            c.px(x, y, 'rune' if gold else 'green', 2.6 if gold else (lvx - 1 if plaid else lvx))
        c.px(x0, y, 'green', 1.2); c.px(x1 - 1, y, 'green', 1.2)
    for x in range(int(CC - 14), int(CC + 14)):
        c.px(x, CTOP, 'green', 4.8)
    for (bx_, by_) in [(CC - 8, CTOP + 12), (CC, CTOP + 12), (CC + 8, CTOP + 12), (CC - 4, CTOP + 20), (CC + 4, CTOP + 20)]:
        c.px(bx_, by_, 'green', 1.4); c.px(bx_ + 1, by_ + 1, 'green', 4.4)
    # cojín bordado
    c.rect(CC - 11, 110, CC + 9, 126, 'paper', 4)
    c.rect(CC - 11, 110, CC + 9, 111, 'paper', 5)
    c.rect(CC + 8, 110, CC + 9, 126, 'paper', 2.4)
    c.rect(CC - 11, 125, CC + 9, 126, 'paper', 2.4)
    leaf(CC - 1, 113, 4, LEAF_MED, ramp='leaf')
    for (qx, qy) in [(CC - 12, 109), (CC + 9, 109), (CC - 12, 126), (CC + 9, 126)]:
        c.px(qx, qy, 'rune', 3.5)
    # asiento
    c.rect(CH0 + 6, 128, CH1 - 6, 142, 'green', 3.8)
    c.rect(CH0 + 6, 128, CH1 - 6, 130, 'green', 5)
    c.rect(CH0 + 6, 130, CH1 - 6, 131, 'green', 4.4)
    c.rect(CH0 + 8, 141, CH1 - 8, 142, 'green', 2)
    # brazos enrollados (voluta al frente)
    for (a0, a1, flip) in [(CH0 - 2, CH0 + 10, False), (CH1 - 10, CH1 + 2, True)]:
        c.rect(a0, 122, a1, 150, 'green', 3)
        c.rect(a0, 122, a1, 124, 'green', 4.6)
        c.rect(a0, 127, a0 + 1, 150, 'green', 1.6 if not flip else 4.2)
        c.rect(a1 - 1, 127, a1, 150, 'green', 4.2 if not flip else 1.6)
        vcx = (a0 + a1) / 2
        vd = np.hypot(xx - vcx, yy - 127)
        c.mask(vd <= 5.5, 'green', np.clip(4.6 - vd * 0.4, 2, 4.6).astype(np.float32))
        c.mask((vd <= 3.6) & (vd > 2.6), 'green', 1.8)
        c.px(vcx, 127, 'rune', 4)
        c.rect(a0, 146, a1, 150, 'wood', 4)
        c.rect(a0, 146, a1, 147, 'wood', 5.5)
    # faldón y patas torneadas
    c.rect(CH0 + 8, 142, CH1 - 8, 152, 'green', 2.4)
    c.rect(CH0 - 2, 150, CH1 + 2, 154, 'wood', 4)
    c.rect(CH0 - 2, 150, CH1 + 2, 151, 'wood', 6)
    for lx in (CH0 - 1, CH1 - 3):
        for y in range(154, 166):
            b = 1 if y in (157, 158) else 0
            c.rect(lx - b, y, lx + 4 + b, y + 1, 'wood', 3)
            c.px(lx - b, y, 'wood', 5)
    # manta roja de cuadros sobre el brazo derecho
    for y in range(118, 162):
        sway = 0.6 * math.sin(ph - y * 0.05) * max(0, (y - 142) / 20)
        x0 = CH1 - 12 + (y - 118) * 0.1 + sway
        x1 = CH1 + 5 + (y - 118) * 0.16 + sway
        for x in range(int(x0), int(x1)):
            plaid = ((x // 3) % 2) ^ ((y // 3) % 2)
            fold = 0.5 * math.sin((x - x0) * 0.9)
            c.px(x, y, 'red', 2.9 + plaid * 0.8 + fold - (1 if x >= int(x1) - 1 else 0))
    for x in range(int(CH1 - 8), int(CH1 + 12), 2):
        c.px(x, 162, 'rune', 2.8); c.px(x, 163, 'rune', 2.2)

    # mesita con lámpara y taza que humea
    TX0, TX1, TYY = 386, 410, 124
    c.rect(TX0, TYY, TX1, TYY + 3, 'wood', 5)
    c.rect(TX0, TYY, TX1, TYY + 1, 'wood', 6.5)
    c.rect(TX0 + 2, TYY + 3, TX1 - 2, TYY + 7, 'wood', 3)
    carve((TX0 + TX1) // 2 - 1, TYY + 3.5, MINI[1])
    for lx in (TX0 + 2, TX1 - 5):
        c.rect(lx, TYY + 7, lx + 3, FLOOR_Y + 12, 'wood', 3)
        c.rect(lx, TYY + 7, lx + 1, FLOOR_Y + 12, 'wood', 4.5)
    c.rect(TX0 + 3, FLOOR_Y + 2, TX1 - 3, FLOOR_Y + 4, 'wood', 2.6)
    # lámpara de aceite
    LMX = 401
    c.rect(LMX - 4, TYY - 3, LMX + 5, TYY, 'brass', 3.5)
    c.rect(LMX - 3, TYY - 9, LMX + 4, TYY - 3, 'brass', 4)
    c.rect(LMX - 3, TYY - 9, LMX - 2, TYY - 3, 'brass', 5.5)
    c.rect(LMX - 2, TYY - 20, LMX + 3, TYY - 9, 'glow', 2.5)
    c.rect(LMX - 2, TYY - 20, LMX - 1, TYY - 9, 'glow', 4.2)
    c.sprite(LMX - 1, TYY - 17, SMALL_FLAMES[(t // 4 + 1) % 3], 'flame', {'h': 2, 'w': 5, 'f': 3})
    c.rect(LMX - 3, TYY - 22, LMX + 4, TYY - 20, 'brass', 4)
    glows.append((LMX, TYY - 14, 30, '#ffb440', 0.8 + 0.1 * math.sin(ph * 4), 1))
    # taza
    c.rect(389, TYY - 5, 395, TYY, 'petal', 3)
    c.rect(389, TYY - 5, 395, TYY - 4, 'petal', 4)
    c.rect(390, TYY - 5, 394, TYY - 4, 'wood', 2)
    c.px(395, TYY - 4, 'petal', 3); c.px(396, TYY - 3, 'petal', 3); c.px(395, TYY - 2, 'petal', 3)
    for k in range(3):                                        # vapor
        life = ((t + k * 16) % FRAMES) / FRAMES
        sy = TYY - 7 - life * 14
        sx = 392 + math.sin(life * 6 + k) * 1.5
        if life < 0.85:
            c.px(sx, sy, 'cloud', 3.5 - life * 2); c.px(sx, sy - 1, 'cloud', 3 - life * 2)
            c.lock[int(sy) % H, int(sx) % W] = True

    # ================================================================== MAPA ENROLLADO en el suelo (Bitácora)
    MX0, MX1, MY = 156, 196, 164
    c.rect(MX0 + 6, MY - 4, MX1 - 6, MY + 2, 'paper', 4)         # parte abierta
    c.rect(MX0 + 6, MY - 4, MX1 - 6, MY - 3, 'paper', 5)
    for k in range(12):
        c.px(MX0 + 9 + k * 2, MY - 2 + (k % 3 == 0) - (k % 4 == 1), 'red', 3)   # ruta punteada
    c.sprite(MX1 - 12, MY - 3, ["x.x", ".x.", "x.x"], 'red', {'x': 4})
    c.px(MX0 + 12, MY - 1, 'leaf', 3); c.px(MX0 + 13, MY - 1, 'leaf', 3)
    for (rx, lv) in [(MX0, 4), (MX1 - 7, 4)]:                    # rollos de los lados
        c.rect(rx, MY - 6, rx + 7, MY + 3, 'paper', 3.6)
        c.rect(rx, MY - 6, rx + 7, MY - 5, 'paper', 5)
        c.rect(rx, MY + 2, rx + 7, MY + 3, 'paper', 2.2)
        c.rect(rx + 3, MY - 6, rx + 4, MY + 3, 'paper', 2.4)
    c.rect(MX0 + 2, MY - 6, MX0 + 4, MY + 3, 'red', 3.5)          # cordel

    # ================================================================== HIEDRA
    drape(5, 12, 8, 3, 96, 2, sway=2.5)
    drape(104, 168, 16, 3, 16, 2, sway=1.2)
    drape(176, 250, 8, 3, 18, 2, sway=1.2)
    drape(380, 418, 8, 4, 90, 2, sway=2.5)
    drape(-3, 8, 8, 3, 108, 4, sway=3, alive=1.4, flowers=0.12)
    drape(86, 96, 8, 1, 22, 4, sway=0.8, alive=1.0, flowers=0.2)
    drape(112, 160, 16, 2, 16, 4, sway=1.2, alive=0.8, flowers=0.1)
    drape(184, 210, 8, 2, 24, 4, sway=1.2, alive=0.9, flowers=0.15)
    drape(258, 300, 8, 2, 14, 4, sway=1.0, alive=0.8, flowers=0.15)
    drape(392, 416, 8, 3, 120, 4, sway=3, alive=1.4, flowers=0.12)
    drape(-6, 4, 8, 2, 128, 5, sway=3.5, alive=1.8, flowers=0.1)
    drape(408, 422, 8, 2, 140, 5, sway=3.5, alive=1.8, flowers=0.1)
    _garland()
    # maceteros colgantes de cuerda (macramé) con hiedra que cae
    def hanger(x, y_pot, trail):
        for dx in (-5, 5):
            c.line(x + dx * 0.2, 9, x + dx, y_pot, 'paper', 2.6)
        c.px(x, 9, 'brass', 4)
        for k in range(3):
            c.px(x - 4 + k * 4, y_pot - 4, 'paper', 3.4)
        c.rect(x - 6, y_pot, x + 7, y_pot + 2, 'clay', 4.6)
        c.rect(x - 5, y_pot + 2, x + 6, y_pot + 5, 'clay', 3)
        c.rect(x - 3, y_pot + 5, x + 4, y_pot + 6, 'clay', 2)
        c.px(x - 4, y_pot + 3, 'clay', 4.4)
        for k, ln in enumerate(trail):
            vine(x - 5 + k * 3.3, y_pot - 1, ln, 4 + (k % 2), sway=1.2, every=2, alive=1.3, flowers=0.15)
    hanger(160, 26, [20, 30, 16])
    hanger(350, 30, [20, 14, 24])
    # helecho grande en el suelo entre la estantería y el aparador
    def fern(cx, base_y, fronds):
        for (ang, ln) in fronds:
            a = math.radians(ang)
            wob = 0.04 * math.sin(ph + ang)
            for k in range(ln):
                tt = k / ln
                bend = a + (tt * 0.9 + wob) * (1 if ang > -90 else -1)
                x = cx + math.cos(a) * k * 0.9 + math.cos(bend) * tt * 3
                y = base_y + math.sin(a) * k * 0.9 + tt * tt * 10
                c.px(x, y, 'leaf', 2.6)
                if k % 2 == 0 and k > 1:
                    lw = max(1, int((1 - tt) * 4))
                    nx, ny = -math.sin(a), math.cos(a)
                    for j in range(1, lw + 1):
                        rp = 'sprout' if k < ln * 0.4 else 'leaf'
                        c.px(x + nx * j, y + ny * j - j * 0.5, rp, 4.2 - j * 0.3)
                        c.px(x - nx * j, y - ny * j - j * 0.5, 'leaf', 3.4 - j * 0.3)
    c.rect(166, 136, 182, 139, 'clay', 4.6)
    c.rect(167, 139, 181, FLOOR_Y + 3, 'clay', 3)
    c.rect(167, 139, 169, FLOOR_Y + 3, 'clay', 4.2)
    c.rect(179, 139, 181, FLOOR_Y + 3, 'clay', 1.8)
    c.rect(167, 143, 181, 144, 'rune', 2.8)
    fern(174, 136, [(-150, 26), (-125, 30), (-100, 32), (-80, 32), (-55, 30), (-30, 26), (-165, 18), (-15, 18)])
    # plantita bajo el escritorio
    c.rect(24, 140, 36, 142, 'clay', 4.4)
    c.rect(25, 142, 35, FLOOR_Y + 2, 'clay', 2.8)
    for (dx, ln) in [(27, 10), (30, 14), (33, 9)]:
        vine(dx, 140 - ln, ln, 4, sway=0.8, every=2, big=False, alive=0.5)
    # flores que brillan en la maceta grande del rincón
    for k, (fx, fy) in enumerate([(398, 156), (408, 150), (402, 162), (412, 160), (396, 146)]):
        pulse_k = 0.5 + 0.5 * math.sin(ph + k * 1.3)
        c.sprite(fx - 1, fy - 1, [".x.", "xox", ".x."], 'crystal', {'x': 4 + pulse_k * 1.5, 'o': 6.5})
        c.lock[fy - 1:fy + 2, fx - 1:fx + 2] = True
        glows.append((fx, fy, 7, '#9ce8f0', 0.25 + 0.35 * pulse_k, 1))
    # planta grande en maceta en el rincón derecho
    PX, PY = 404, 176
    c.rect(PX - 10, PY, PX + 10, PY + 3, 'clay', 4.5)
    c.rect(PX - 9, PY + 3, PX + 9, PY + 18, 'clay', 3)
    c.rect(PX - 9, PY + 3, PX - 7, PY + 18, 'clay', 4.2)
    c.rect(PX + 7, PY + 3, PX + 9, PY + 18, 'clay', 1.8)
    c.rect(PX - 9, PY + 8, PX + 9, PY + 9, 'rune', 2.8)
    for (dx, ln) in [(-6, 22), (-2, 30), (3, 26), (7, 18)]:
        vine(PX + dx, PY - ln, ln, 5, sway=1.2, every=2, big=True, alive=0.8)

    # ================================================================== farol colgante junto a la ventana
    LX, LY = 90, 52
    for y in range(9, LY - 6, 2):
        c.px(LX, y, 'brass', 3); c.px(LX, y + 1, 'brass', 1.5)
    c.sprite(LX - 2, LY - 8, [".xxx.", "x...x", ".xxx."], 'brass', {'x': 4})
    c.rect(LX - 3, LY - 5, LX + 4, LY - 3, 'brass', 3)
    c.rect(LX - 5, LY - 3, LX + 6, LY - 1, 'brass', 4)
    c.rect(LX - 5, LY - 3, LX + 6, LY - 2, 'brass', 5)
    c.rect(LX - 4, LY - 1, LX + 5, LY + 12, 'glow', 2)
    c.rect(LX - 4, LY - 1, LX - 3, LY + 12, 'brass', 3.5)
    c.rect(LX + 4, LY - 1, LX + 5, LY + 12, 'brass', 1.5)
    c.rect(LX - 2, LY, LX - 1, LY + 10, 'glow', 4)
    c.sprite(LX - 2, LY + 3, FLAMES[(t // 4) % 3], 'flame', {'h': 2, 'f': 3, 'w': 5, 'r': 1})
    c.rect(LX - 1, LY + 9, LX + 2, LY + 12, 'wax', 4)
    c.rect(LX - 5, LY + 12, LX + 6, LY + 14, 'brass', 4)
    c.rect(LX - 5, LY + 13, LX + 6, LY + 14, 'brass', 2)
    c.rect(LX - 1, LY + 14, LX + 2, LY + 16, 'brass', 3)
    flick = 0.06 * math.sin(ph * 4) + 0.04 * math.sin(ph * 7 + 1)

    # ================================================================== MAGIA VIVA
    # velas que flotan sobre el centro de la sala
    for k, (vx, vy, h_) in enumerate([(196, 24, 8), (214, 18, 10), (252, 26, 7)]):
        by_ = vy + 1.6 * math.sin(ph + k * 2.1)
        c.rect(vx, by_, vx + 3, by_ + h_, 'wax', 3.6)
        c.rect(vx, by_, vx + 1, by_ + h_, 'wax', 5)
        c.rect(vx + 2, by_, vx + 3, by_ + h_, 'wax', 2)
        c.px(vx + 2, by_ + 2, 'wax', 5)
        c.sprite(vx, by_ - 4, SMALL_FLAMES[(t // 4 + k) % 3], 'flame', {'h': 2, 'w': 5, 'f': 3})
        glows.append((vx + 1, by_ - 3, 12, '#ffb440', 0.55 + 0.1 * math.sin(ph * 3 + k), 1))
        for j in range(3):                                         # chispitas bajo la vela (lo que la sostiene)
            if (t // 3 + j + k) % 4 == 0:
                c.px(vx + 1 + (j - 1) * 2, by_ + h_ + 2 + j, 'rune', 5)
    # lucecitas (espíritus del bosque) que vagan lento por la sala
    for k in range(6):
        cx_ = [70, 150, 230, 300, 360, 120][k]
        cy_ = [120, 60, 100, 70, 90, 180][k]
        ax_, ay_ = [30, 26, 34, 22, 26, 40][k], [10, 14, 12, 16, 12, 8][k]
        a = ph + k * 1.05
        wx = cx_ + ax_ * math.sin(a)
        wy = cy_ + ay_ * math.sin(2 * a + k)
        col = 'crystal' if k % 2 else 'sprout'
        c.px(wx, wy, col, 7); c.px(wx + 1, wy, col, 6); c.px(wx, wy + 1, col, 6)
        for (dx, dy) in [(1, 1)]:
            c.px(wx + dx, wy + dy, col, 5)
        iy, ix = int(round(wy)), int(round(wx))
        c.lock[max(0, iy):iy + 2, max(0, ix):ix + 2] = True
        glows.append((wx + 0.5, wy + 0.5, 8, '#9ce8f0' if k % 2 else '#c6d862', 0.6, 1))
        # estela de 2 puntitos
        a2 = a - 0.15
        c.px(cx_ + ax_ * math.sin(a2), cy_ + ay_ * math.sin(2 * a2 + k), col, 4)
    # mariposas cerca de la ventana y las plantas
    for k, (mcx, mcy, col) in enumerate([(70, 80, 'lav'), (120, 120, 'rune'), (390, 120, 'crystal')]):
        a = ph * (1 if k % 2 else -1) + k
        bx_ = mcx + 14 * math.sin(a) + 4 * math.sin(3 * a)
        by_ = mcy + 8 * math.sin(2 * a)
        open_ = (t + k) % 2 == 0
        wings = [["x.x", "xbx", ".b."], [".x.", ".b.", ".b."]][0 if open_ else 1]
        c.sprite(int(bx_) - 1, int(by_) - 1, wings, col, {'x': 4.6, 'b': ('wood', 1)})

    # ================================================================== LUZ
    floor = yy >= FLOOR_Y
    horiz = floor | ((yy >= DY) & (yy < DY + 5) & (xx < DX1)) | ((yy >= AY - 3) & (yy < AY) & (xx >= AX0) & (xx < AX1))
    if 'shaft' not in _static:
        lit_src = (view & (yy >= TY + 3)) & ~((xx >= LX1 - 2) & (xx < MID)) & ~(np.abs(xx - (LX0 + LX1) // 2) < 1)
        open_part = view & (xx >= MID) & (yy >= TY + 3)
        lit_src &= ~((yy >= LY0 + (LY1 - 3 - LY0) // 3) & (yy <= LY0 + (LY1 - 3 - LY0) // 3) & (xx < MID))
        shaft = np.zeros((H, W), np.float32)
        for s in range(3, 230):
            sx_ = np.clip(np.round(xx - 0.62 * s).astype(int), 0, W - 1)
            sy_ = np.clip(np.round(yy - s).astype(int), 0, H - 1)
            hit = lit_src[sy_, sx_] & (yy - s >= 0) & (shaft == 0)
            shaft[hit] = (np.clip(1.25 - s / 260, 0, 1) * np.where(open_part[sy_, sx_], 1.0, 0.75))[hit]
        _static['shaft'] = shaft
    shaft = _static['shaft']
    dwin = np.hypot((xx - 52) / 1.3, yy - 70)
    c.add_light(np.clip(1.3 - dwin / 44, 0, 1.3))
    c.add_light(np.where(view, 0, shaft * np.where(horiz, np.where(floor, 1.5, 2.2), 0.3)))
    dl = np.hypot(xx - LX, (yy - (LY + 6)) * 1.1)
    c.add_light(np.clip(1 - dl / 28, 0, 1) ** 1.8 * (1.8 + flick * 3))
    dlamp = np.hypot(xx - LMX, (yy - (TYY - 14)) * 0.9)
    c.add_light(np.clip(1 - dlamp / 60, 0, 1) ** 1.6 * 2.2)
    dstaff = np.hypot(xx - hx, yy - hy)
    c.add_light(np.clip(1 - dstaff / 26, 0, 1) ** 2 * 0.9)
    # sombras de contacto bajo los muebles
    for (x0, x1, y0, y1) in [(DX0, DX1, FLOOR_Y, FLOOR_Y + 9), (AX0 - 3, AX1 + 3, FLOOR_Y, FLOOR_Y + 7),
                             (CH0 - 2, CH1 + 12, FLOOR_Y + 4, FLOOR_Y + 16), (SX0 - 2, SX1 + 2, FLOOR_Y, FLOOR_Y + 6),
                             (SX - 13, SX + 13, SY + 25, SY + 29), (TX0, TX1, FLOOR_Y + 10, FLOOR_Y + 15)]:
        m = (xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1)
        c.add_light(np.where(m, -1.3, 0))
    # viñeta: techo, rincones y primer plano del piso
    c.add_light(-np.clip((24 - yy) / 14, 0, 1.0) - np.clip((8 - xx) / 8, 0, 0.8) - np.clip((xx - 410) / 8, 0, 0.8)
                - np.clip((yy - 205) / 30, 0, 1.1))
    # polvo flotando en el haz
    r2 = random.Random(5)
    for k in range(60):
        x0, y0 = r2.randint(0, W - 1), r2.randint(14, 200)
        x_ = int(x0 + 2 * math.sin(ph + k))
        y_ = int(y0 - ((t * 0.25 + k * 3) % 8))
        if 0 <= x_ < W and 0 <= y_ < H and shaft[y_, x_] > 0.3 and not view[y_, x_]:
            c.px(x_, y_, 'glow', 5); c.lock[y_, x_] = True

    def post(arr):
        glow(arr, LX, LY + 6, 26, '#ffb440', 0.75 + flick * 2, rings=4)
        glow(arr, 52, 66, 60, '#fff6dc', 0.3, rings=3, squash=0.75)
        for g in glows:
            glow(arr, g[0], g[1], g[2], g[3], g[4], rings=3, squash=g[5])

    return lambda scale: c.render(scale, post=post)


if __name__ == '__main__':
    base = draw(0)(4)
    # 941 de alto como el arte original: se repite la última fila (1 px)
    full = Image.new('RGB', (1672, 941)); full.paste(base, (0, 0)); full.paste(base.crop((0, 939, 1672, 940)), (0, 940))
    full.save(OUT_ASSET / 'refugio-pixel.png', optimize=True)
    orig = Image.open(ROOT / 'dist/assets/home-scenes/refugio-012.png').convert('RGB')
    both = Image.new('RGB', (1672, 941 * 2 + 12), (20, 12, 16))
    both.paste(orig, (0, 0)); both.paste(full, (0, 941 + 12))
    both.resize((836, (941 * 2 + 12) // 2), Image.LANCZOS).save(OUT_DOCS / 'antes-ahora-refugio.png')
    if '--rapido' not in sys.argv:
        frames = [draw(t)(2) for t in range(FRAMES)]
        pal = [f.convert('P', palette=Image.ADAPTIVE, colors=255) for f in frames]
        pal[0].save(OUT_DOCS / 'refugio-pixel.gif', save_all=True, append_images=pal[1:], duration=90, loop=0, disposal=2)
    print('ok')
