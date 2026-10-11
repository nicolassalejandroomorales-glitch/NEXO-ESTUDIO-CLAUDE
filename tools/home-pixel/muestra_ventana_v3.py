"""Muestra v3: esquina de la ventana, más calma y aire (menos objetos), ventana de madera con hoja abierta
y cortina, runas talladas en la estantería y el escritorio, y movimiento suave.

Uso:  python tools/home-pixel/muestra_ventana_v3.py
Escribe en docs/inicio-pixelart/: muestra-v3.png, muestra-v3.gif y antes-ahora-v3.png.
"""
from pathlib import Path
import math
import random
import numpy as np
from PIL import Image
from pixel import Canvas, glow

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/inicio-pixelart'
W, H = 160, 128
FRAMES = 48                                       # más cuadros = movimiento más suave

LEAF_BIG = [".oo...oo.", "ohlo.olmo", "ohllolmdo", ".ohlvlmo.", "..olvmdo.", "..olvdo..", "...omo...", "....o...."]
LEAF_MED = ["..o.o..", ".olomo.", "ohlvmdo", "olhvmdo", ".olvdo.", "..omo..", "...o..."]
LEAF_TALL = ["..o..", ".olo.", "ohlmo", "olvmo", "olvdo", ".omo.", "..o.."]
LEAF_SMALL = [".o.o.", "ohlmo", "olmdo", ".omo.", "..o.."]
LEAF_SIDE = [".oo...", "ohloo.", "olvvmo", "omldo.", ".oo..."]
JASMINE = [".p.", "pyp", ".p."]
# Runas propias de Nexo (3x5), talladas en la madera
RUNES = [["x.x", ".x.", "xxx", ".x.", ".x."], [".x.", "x.x", "x.x", ".x.", ".xx"], ["x..", "x.x", "xxx", "..x", "..x"],
         [".xx", "x..", ".x.", "..x", "xx."], ["xxx", ".x.", "x.x", "x.x", ".x."], ["x.x", "xxx", "x.x", ".x.", ".x."],
         [".x.", ".x.", "xxx", "x.x", "x.."], ["xx.", ".x.", ".xx", ".x.", "xx."]]
MINI = [["x.x", ".x.", "x.x"], [".x.", "xxx", ".x."], ["xx.", ".x.", ".xx"], ["x..", "xxx", "..x"]]
FLAMES = [["..h..", ".hfh.", ".fwf.", "hfwfh", ".fff.", "..r.."],
          [".h...", "..fh.", ".fwf.", "hfwfh", ".fwf.", "..r.."],
          ["...h.", ".hf..", ".fwf.", "hfwfh", ".fff.", "..r.."]]


def draw(t):
    rnd = random.Random(21)
    ph = 2 * math.pi * t / FRAMES
    c = Canvas(W, H)
    yy, xx = c.grid()
    glows = []

    def leaf_lv(b):
        return {'o': b - 2.6, 'd': b - 1, 'm': b, 'l': b + 1, 'h': b + 2.4, 'v': b + 1.6}

    def leaf(x, y, b, rows, flip=False, ramp='leaf'):
        c.sprite(int(round(x)) - len(rows[0]) // 2, int(round(y)), rows, ramp, leaf_lv(b), flip=flip)

    def vine(x0, y0, length, base, sway=2.5, freq=0.11, every=3, big=True, alive=0.0, flowers=0.0):
        p0 = rnd.random() * 6
        drift = rnd.uniform(-0.03, 0.03)
        pts = []
        for k in range(length):
            # ola que baja por la enredadera: arriba casi quieta, la punta se mece más
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

    # luz que recorre las runas: una ola lenta de izquierda a derecha y de arriba abajo
    def rune_wave(x, y):
        return 0.5 + 0.5 * math.sin(ph - x * 0.06 - y * 0.04)

    def carve(x, y, rows, glowing=True, base_wood=1.2):
        x, y = int(round(x)), int(round(y))
        """Runa tallada: surco oscuro con un hilo de luz adentro que respira."""
        wv = rune_wave(x, y)
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch == 'x':
                    if glowing:
                        c.px(x + i, y + j, 'crystal', 1.6 + wv * 3.2)
                        c.lock[min(H - 1, y + j), min(W - 1, x + i)] = True
                    else:
                        c.px(x + i, y + j, 'wood', base_wood)
                    # sombra del surco abajo-derecha (lo hace ver hundido)
                    if j + 1 >= len(rows) or row[i] == 'x' and (rows[j + 1][i] if j + 1 < len(rows) else '.') == '.':
                        c.px(x + i, y + j + 1, 'wood', 1.5)
        if glowing:
            glows.append((x + len(rows[0]) / 2, y + len(rows) / 2, 6, '#5cc4dc', 0.05 + 0.35 * wv ** 2, 1))

    # ================================================================== PARED: entramado de madera y yeso claro
    c.rect(0, 0, W, H, 'wall', 3)
    noise = np.array([[rnd.random() for _ in range(W)] for _ in range(H)])
    c.lvl[noise > 0.985] -= 1
    c.lvl[(yy > 96) & (noise > 0.7)] -= 0.6                   # zócalo un poco gastado
    # postes y riel
    for (x0, x1) in [(0, 6), (96, 102)]:
        c.rect(x0, 8, x1, 112, 'wood', 3)
        c.rect(x0, 8, x0 + 1, 112, 'wood', 5)
        c.rect(x1 - 1, 8, x1, 112, 'wood', 1.5)
        for y in range(12, 110, 11):
            c.px(x0 + 2 + (y // 11) % 2, y, 'wood', 2); c.px(x0 + 2 + (y // 11) % 2, y + 1, 'wood', 2)
    c.rect(6, 104, 96, 108, 'wood', 3)
    c.rect(6, 104, 96, 105, 'wood', 5)
    c.rect(6, 107, 96, 108, 'wood', 1.5)
    c.rect(6, 108, 96, 110, 'wall', 2)
    # tarugos de madera (detalle de carpintería)
    for (px_, py_) in [(3, 20), (3, 60), (3, 100), (99, 20), (99, 60), (99, 100)]:
        c.px(px_, py_, 'wood', 6); c.px(px_ + 1, py_ + 1, 'wood', 1)

    # ================================================================== VIGA
    c.rect(0, 0, W, 8, 'wood', 3)
    c.rect(0, 0, W, 1, 'wood', 5)
    c.rect(0, 1, W, 2, 'wood', 4)
    c.rect(0, 7, W, 8, 'wood', 1)
    c.rect(0, 8, W, 9, 'void', 0)
    for x in range(W):
        if (x * 7) % 23 < 9:
            c.px(x, 3 + (x // 11) % 2, 'wood', 2)

    # ================================================================== VENTANA DE MADERA
    FX0, FX1, FY0, FY1 = 24, 80, 20, 96           # marco exterior
    # dintel con cornisa
    c.rect(FX0 - 4, FY0 - 4, FX1 + 4, FY0, 'wood', 4)
    c.rect(FX0 - 4, FY0 - 4, FX1 + 4, FY0 - 3, 'wood', 6)
    c.rect(FX0 - 3, FY0 - 1, FX1 + 3, FY0, 'wood', 2)
    c.rect(FX0 - 2, FY0, FX1 + 2, FY0 + 1, 'void', 0)
    # hueco (vista)
    OX0, OX1, OY0, OY1 = FX0 + 3, FX1 - 3, FY0 + 3, FY1 - 1
    view = (xx >= OX0) & (xx < OX1) & (yy >= OY0) & (yy < OY1)

    # --- cielo en bandas limpias, nubes grandes y suaves
    sky_lvl = np.floor(1.6 + np.clip((yy - OY0) / 12, 0, 4.4))
    c.mask(view, 'sky', sky_lvl)

    def cloud(cx, cy, blobs):
        for (ox, oy, r) in blobs:
            bd = np.hypot(xx - (cx + ox), (yy - (cy + oy)) * 1.25)
            m = view & (bd <= r)
            rel = yy - (cy + oy)
            c.mask(m, 'cloud', np.where(rel < -r * 0.35, 4, np.where(rel > r * 0.35, 1.7, 3)).astype(np.float32))
    dr = 3 * t / FRAMES
    cloud(44 + dr, 40, [(0, 0, 6), (7, 2, 5), (-7, 3, 4), (13, 4, 3.5), (-12, 5, 3), (2, -4, 4)])
    cloud(70 + dr * 0.7, 58, [(0, 0, 3.5), (4, 1, 3), (-4, 1, 2.5)])
    # montañas lejanas, colinas, árbol solitario, sendero
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
    path = view & (yy >= 88) & (np.abs(xx - (60 + (yy - 88) * 1.6)) < 1 + (yy - 88) * 0.35)
    c.mask(path, 'paper', 3.6)
    for k in range(12):
        fx, fy = rnd.randint(OX0, OX1 - 1), rnd.randint(88, 94)
        if view[fy, fx]:
            c.px(fx, fy, rnd.choice(['petal', 'lav', 'rune']), 3.5)
    # pájaros (una bandada que cruza lento, aleteando)
    for k, (ox, oy) in enumerate([(0, 0), (-4, 2), (-7, -1), (-10, 3)]):
        bx = OX0 - 4 + ((t * 0.9 + ox + 60) % 70)
        by = 50 + oy + math.sin(ph * 2 + k) * 0.6
        if OX0 <= bx < OX1 - 1:
            up = (t // 3 + k) % 2 == 0
            c.px(bx, by, 'stone', 1.2)
            c.px(bx - 1, by - (1 if up else 0), 'stone', 1.2)
            c.px(bx + 1, by - (1 if up else 0), 'stone', 1.2)
            if not up:
                c.px(bx - 2, by + 1, 'stone', 1.6); c.px(bx + 2, by + 1, 'stone', 1.6)

    # --- marco exterior
    fr = (xx >= FX0) & (xx < FX1) & (yy >= FY0) & (yy < FY1) & ~view
    c.mask(fr, 'wood', 4)
    c.rect(FX0, FY0, FX0 + 1, FY1, 'wood', 2)
    c.rect(FX1 - 1, FY0, FX1, FY1, 'wood', 2)
    c.rect(OX0 - 1, OY0, OX0, OY1, 'wood', 6)                 # canto interior con luz
    c.rect(OX0, OY0 - 1, OX1, OY0, 'wood', 2)
    # travesaño del montante (ventanita de arriba fija)
    TY = OY0 + 12
    c.rect(OX0, TY, OX1, TY + 3, 'wood', 4)
    c.rect(OX0, TY, OX1, TY + 1, 'wood', 6)
    c.rect(OX0, TY + 2, OX1, TY + 3, 'wood', 2)
    # vidrios chicos del montante (4 paños)
    for k in range(1, 4):
        x = OX0 + k * (OX1 - OX0) // 4
        c.rect(x, OY0, x + 1, TY, 'wood', 3)
    tglass = view & (yy < TY)
    c.mask(tglass & ((xx + yy) % 13 == 0) & (yy > OY0 + 2) & (yy < TY - 2), 'sky', 6)          # reflejo diagonal
    # hoja izquierda cerrada: marco + 2x3 vidrios
    MID = (OX0 + OX1) // 2
    LX0, LX1, LY0, LY1 = OX0, MID, TY + 3, OY1
    c.rect(LX0, LY0, LX0 + 2, LY1, 'wood', 4.5)
    c.rect(LX1 - 2, LY0, LX1, LY1, 'wood', 3.5)
    c.rect(LX0, LY1 - 3, LX1, LY1, 'wood', 4)
    c.rect(LX0, LY1 - 3, LX1, LY1 - 2, 'wood', 6)
    for k in (1, 2):
        y = LY0 + k * (LY1 - 3 - LY0) // 3
        c.rect(LX0 + 2, y, LX1 - 2, y + 1, 'wood', 4)
        c.px(LX0 + 2, y, 'wood', 6)
    c.rect((LX0 + LX1) // 2, LY0, (LX0 + LX1) // 2 + 1, LY1 - 3, 'wood', 4)
    lglass = (xx >= LX0 + 2) & (xx < LX1 - 2) & (yy >= LY0) & (yy < LY1 - 3)
    for (gx, gy) in [(LX0 + 4, LY0 + 8), (LX0 + 15, LY0 + 20)]:     # brillos del vidrio
        for i in range(4):
            c.px(gx + i, gy - i, 'cloud', 4)
    c.px(LX1 - 3, (LY0 + LY1) // 2, 'brass', 5); c.px(LX1 - 3, (LY0 + LY1) // 2 + 1, 'brass', 3)   # manilla
    # hoja derecha ABIERTA hacia adentro: se ve angosta, en perspectiva, sobre la pared
    RX0, RX1 = FX1 - 2, FX1 + 6
    for x in range(RX0, RX1):
        k = (x - RX0) / (RX1 - RX0)
        top = LY0 - 1 - k * 4
        bot = LY1 + 1 + k * 4
        c.rect(x, top, x + 1, bot, 'wood', 4 if x in (RX0, RX1 - 1) else 3)
        if RX0 < x < RX1 - 1:
            c.rect(x, top + 2, x + 1, bot - 2, 'sky', 3 + (x % 3 == 0))
            for j in (1, 2):
                yb = top + 2 + j * (bot - top - 4) / 3
                c.px(x, yb, 'wood', 4)
    for x in range(RX0, RX1):
        k = (x - RX0) / (RX1 - RX0)
        c.px(x, LY0 - 1 - k * 4, 'wood', 6)
    # cortina de lino a la izquierda, recogida, que se mece con el aire
    c.rect(FX0 - 6, FY0 + 1, FX1 + 12, FY0 + 2, 'brass', 3)           # barra
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
    c.rect(FX0 - 6, 63, FX0 + 2, 65, 'red', 3)                          # lazo
    c.rect(FX0 - 6, 63, FX0 + 2, 64, 'red', 4)

    # ================================================================== ALFÉIZAR (pocas cosas)
    c.rect(FX0 - 4, FY1, FX1 + 4, FY1 + 2, 'wood', 6)
    c.rect(FX0 - 4, FY1 + 2, FX1 + 4, FY1 + 4, 'wood', 4)
    c.rect(FX0 - 3, FY1 + 4, FX1 + 3, FY1 + 5, 'wood', 1.5)
    c.rect(FX0 - 2, FY1 + 5, FX1 + 2, FY1 + 6, 'void', 0)
    # maceta con flores
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
    # dos libros acostados
    for i, col in enumerate(['green', 'red']):
        y = FY1 - 3 * (i + 1)
        c.rect(58 + i, y, 72 - i, y + 3, col, 3)
        c.rect(58 + i, y, 72 - i, y + 1, col, 4.5)
        c.rect(70 - i, y, 72 - i, y + 3, 'paper', 4)

    # ================================================================== ESTANTERÍA CON RUNAS TALLADAS
    SX0 = 104
    c.rect(SX0, 9, W, 112, 'wood', 1)
    for x in range(SX0 + 8, W, 9):
        c.rect(x, 15, x + 1, 112, 'wood', 0.5)
    # coronación con medallón tallado
    c.rect(SX0 - 2, 9, W, 16, 'wood', 4)
    c.rect(SX0 - 2, 9, W, 10, 'wood', 6)
    c.rect(SX0 - 2, 15, W, 16, 'wood', 2)
    c.rect(SX0 - 2, 16, W, 17, 'void', 0)
    for i, x in enumerate(range(SX0 + 2, W - 2, 6)):
        if abs(x - 132) > 8:
            carve(x, 10, MINI[i % 4])
    mx, my = 132, 12.5
    md = np.hypot(xx - mx, yy - my)
    c.mask((md <= 4.2) & (md > 3.2), 'wood', 1.2)
    c.mask(md <= 3.2, 'wood', 5)
    wv = rune_wave(mx, my)
    c.mask(md <= 1.2, 'crystal', 4 + wv * 2.5)
    glows.append((mx, my, 10, '#5cc4dc', 0.3 + 0.5 * wv, 1))
    # pilar izquierdo con una columna de runas
    c.rect(SX0 - 2, 17, SX0 + 6, 112, 'wood', 4)
    c.rect(SX0 - 2, 17, SX0 - 1, 112, 'wood', 6)
    c.rect(SX0 + 5, 17, SX0 + 6, 112, 'wood', 2)
    c.rect(SX0, 19, SX0 + 4, 110, 'wood', 2.4)                   # canal rebajado
    c.rect(SX0, 19, SX0 + 4, 20, 'wood', 1)
    for i, y in enumerate(range(21, 106, 8)):
        carve(SX0 + 0.5, y, RUNES[i % len(RUNES)])

    def shelf(y):
        c.rect(SX0 + 6, y, W, y + 6, 'wood', 4)
        c.rect(SX0 + 6, y, W, y + 1, 'wood', 6)
        c.rect(SX0 + 6, y + 5, W, y + 6, 'wood', 2)
        c.rect(SX0 + 6, y + 6, W, y + 8, 'void', 0)
        for i, x in enumerate(range(SX0 + 10, W - 2, 7)):          # banda de mini-runas
            carve(x, y + 1.5, MINI[(i + y) % 4])

    def book(x, y_base, w, h, col):
        top = y_base - h
        c.rect(x, top, x + w, y_base, col, 3)
        c.rect(x, top, x + 1, y_base, col, 4.6)
        c.rect(x + w - 1, top, x + w, y_base, col, 1.4)
        c.rect(x, top, x + w, top + 1, col, 2)
        for by in (top + 2, y_base - 3):
            c.rect(x + 1, by, x + w - 1, by + 1, 'rune', 2.8)

    def books(x, y_base, n, colors=('red', 'green', 'blue', 'paper', 'green', 'red')):
        for _ in range(n):
            w = rnd.choice([3, 4, 4, 5])
            h = rnd.randint(11, 16)
            if x + w > W:
                break
            book(x, y_base, w, h, rnd.choice(colors))
            x += w
        return x

    shelf(36)
    x = books(SX0 + 7, 36, 7)
    shelf(70)
    x = books(SX0 + 7, 70, 4)
    # una sola poción que brilla
    px1 = x + 4
    c.rect(px1 + 1, 59, px1 + 7, 70, 'glass', 2)
    c.rect(px1, 61, px1 + 8, 69, 'glass', 2)
    c.rect(px1 + 1, 63, px1 + 7, 69, 'crystal', 4)
    c.rect(px1 + 1, 63, px1 + 7, 64, 'crystal', 6)
    c.rect(px1 + 1, 61, px1 + 2, 68, 'glass', 6)
    c.rect(px1 + 3, 56, px1 + 5, 59, 'glass', 3)
    c.rect(px1 + 3, 54, px1 + 5, 56, 'wood', 5)
    b = (t // 4) % 6
    c.px(px1 + 4, 68 - b, 'crystal', 7)
    glows.append((px1 + 4, 65, 11, '#3098b8', 0.55 + 0.15 * math.sin(ph), 1))
    books(px1 + 11, 70, 3)
    shelf(104)
    books(SX0 + 7, 104, 4)
    for i, col in enumerate(['blue', 'lav', 'green']):
        y = 104 - 3 * (i + 1)
        c.rect(128 + i, y, 150 - i, y + 3, col, 3)
        c.rect(128 + i, y, 150 - i, y + 1, col, 4.5)
        c.rect(148 - i, y, 150 - i, y + 3, 'paper', 4)

    # ================================================================== hiedra de atrás (poca)
    drape(5, 20, 8, 4, 96, 2, sway=2.5)
    drape(104, 156, 16, 3, 14, 2, sway=1.2)

    # ================================================================== farol colgante (único foco cálido)
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

    # ================================================================== ESCRITORIO con banda de runas
    c.rect(0, 112, W, 117, 'wood', 5)
    c.rect(0, 112, W, 113, 'wood', 7)
    c.rect(0, 117, W, 118, 'wood', 2)
    c.rect(0, 118, W, H, 'wood', 3)
    c.rect(0, 119, W, 120, 'wood', 4.5)
    c.rect(0, 126, W, 127, 'wood', 1.5)
    for i, x in enumerate(range(4, W - 3, 8)):
        if i % 5 == 2:                                             # rombo tallado entre runas
            c.sprite(x, 120, [".x.", "xox", "x.x", "xox", ".x."], 'wood', {'x': 1.4, 'o': 5})
        else:
            carve(x, 120.5, RUNES[(i * 3) % len(RUNES)])
    for x in range(W):
        if (x * 13) % 31 < 6:
            c.px(x, 114 + (x // 17) % 2, 'wood', 4)
    # grimorio cerrado con cierre de latón + tintero y pluma
    c.rect(40, 106, 64, 112, 'green', 3)
    c.rect(40, 106, 64, 107, 'green', 4.5)
    c.rect(41, 109, 63, 111, 'paper', 4)
    c.rect(41, 110, 63, 111, 'paper', 2.5)
    c.rect(50, 106, 54, 110, 'brass', 4)
    c.px(51, 107, 'brass', 6)
    c.sprite(57, 107, RUNES[0][:3], 'rune', {'x': 3.4})
    c.rect(70, 106, 76, 112, 'glass', 1)
    c.rect(71, 105, 75, 106, 'brass', 4)
    c.rect(71, 107, 72, 111, 'glass', 4)
    for i in range(11):
        c.px(75 + i * 0.55, 105 - i, 'petal', 3 if i < 8 else 4)
        c.px(76 + i * 0.55, 105 - i, 'petal', 2 if i < 9 else 3)

    # ================================================================== hiedra de adelante (elegante, poca, suave)
    drape(-3, 12, 8, 3, 108, 4, sway=3, alive=1.4, flowers=0.12)
    drape(14, 30, 8, 2, 16, 4, sway=1.2, alive=0.8, flowers=0.2)
    drape(92, 96, 8, 1, 22, 4, sway=0.8, alive=1.0, flowers=0.2)
    drape(112, 150, 16, 2, 16, 4, sway=1.2, alive=0.8, flowers=0.1)
    drape(-6, 4, 8, 2, 120, 5, sway=3.5, alive=1.8, flowers=0.1)

    # ================================================================== LUZ de día, limpia
    view_only = view & ~lglass | (view & lglass)
    dwin = np.hypot((xx - 52) / 1.2, yy - 66)
    c.add_light(np.clip(1.3 - dwin / 34, 0, 1.3))
    shaft = np.zeros((H, W), np.float32)
    open_part = view & (xx >= MID) & (yy >= TY + 3)
    lit_src = (view & (yy >= TY + 3)) & ~((xx >= LX1 - 2) & (xx < MID)) & ~(np.abs(xx - (LX0 + LX1) // 2) < 1)
    for s in range(3, 90):
        sx_ = np.clip(np.round(xx - 0.62 * s).astype(int), 0, W - 1)
        sy_ = np.clip(np.round(yy - s).astype(int), 0, H - 1)
        hit = lit_src[sy_, sx_] & (yy - s >= 0) & (shaft == 0)
        shaft[hit] = np.clip(1.2 - s / 110, 0, 1) * np.where(open_part[sy_, sx_], 1.0, 0.75)[hit]
    desk = (yy >= 112) & (yy < 118)
    c.add_light(np.where(view, 0, shaft * np.where(desk, 2.4, 0.45)))
    dl = np.hypot(xx - LX, (yy - (LY + 6)) * 1.1)
    c.add_light(np.clip(1 - dl / 28, 0, 1) ** 1.8 * (1.8 + flick * 3))
    c.add_light(-np.clip((xx - 116) / 30, 0, 1.3) - np.clip((22 - yy) / 12, 0, 1.0) - np.clip((8 - xx) / 8, 0, 0.8)
                - np.clip((yy - 120) / 8, 0, 0.6))
    # polvo flotando lento en el haz
    r2 = random.Random(5)
    for k in range(22):
        x0, y0 = r2.randint(0, W - 1), r2.randint(14, 110)
        x_ = int(x0 + 2 * math.sin(ph + k))
        y_ = int(y0 - ((t * 0.25 + k * 3) % 8))
        if 0 <= x_ < W and 0 <= y_ < H and shaft[y_, x_] > 0.3 and not view[y_, x_]:
            c.px(x_, y_, 'glow', 5); c.lock[y_, x_] = True

    def post(arr):
        glow(arr, LX, LY + 6, 26, '#ffb440', 0.75 + flick * 2, rings=4)
        glow(arr, 52, 66, 50, '#fff6dc', 0.3, rings=3, squash=0.75)
        for g in glows:
            glow(arr, g[0], g[1], g[2], g[3], g[4], rings=3, squash=g[5])

    return c.render(4, post=post)


frames = [draw(t) for t in range(FRAMES)]
frames[0].save(OUT / 'muestra-v3.png')
pal = [f.convert('P', palette=Image.ADAPTIVE, colors=255) for f in frames]
pal[0].save(OUT / 'muestra-v3.gif', save_all=True, append_images=pal[1:], duration=90, loop=0, disposal=2)
orig = Image.open(ROOT / 'dist/assets/home-scenes/refugio-012.png').convert('RGB').crop((0, 0, W * 4, H * 4))
both = Image.new('RGB', (W * 8 + 16, H * 4), (20, 12, 16))
both.paste(orig, (0, 0)); both.paste(frames[0], (W * 4 + 16, 0))
both.save(OUT / 'antes-ahora-v3.png')
print('ok')
