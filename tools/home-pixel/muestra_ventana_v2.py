"""Muestra v2: la esquina de la ventana del refugio, con más magia, más detalle y vida (animada).

Uso:  python tools/home-pixel/muestra_ventana_v2.py
Escribe en docs/inicio-pixelart/: muestra-v2.png (cuadro fijo), muestra-v2.gif (animada) y antes-ahora-v2.png.
"""
from pathlib import Path
import math
import random
import numpy as np
from PIL import Image
from pixel import Canvas, glow

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/inicio-pixelart'
OUT.mkdir(parents=True, exist_ok=True)
W, H = 160, 128
FRAMES = 16

# ------------------------------------------------------------------ plantillas dibujadas a mano
# Hojas de hiedra: o contorno, d sombra, m medio, l luz, h brillo, v nervadura
LEAF_BIG = [".oo...oo.",
            "ohlo.olmo",
            "ohllolmdo",
            ".ohlvlmo.",
            "..olvmdo.",
            "..olvdo..",
            "...omo...",
            "....o...."]
LEAF_MED = ["..o.o..",
            ".olomo.",
            "ohlvmdo",
            "olhvmdo",
            ".olvdo.",
            "..omo..",
            "...o..."]
LEAF_TALL = ["..o..",
             ".olo.",
             "ohlmo",
             "olvmo",
             "olvdo",
             ".omo.",
             "..o.."]
LEAF_SMALL = [".o.o.",
              "ohlmo",
              "olmdo",
              ".omo.",
              "..o.."]
LEAF_SIDE = [".oo...",
             "ohloo.",
             "olvvmo",
             "omldo.",
             ".oo..."]
JASMINE = [".p.",
           "pyp",
           ".p."]
JASMINE_BIG = ["..p..",
               ".ppp.",
               "ppypp",
               ".p.p."]
STAR7 = ["...a...",
         "...a...",
         "..aba..",
         "aabcbaa",
         "..aba..",
         "...a...",
         "...a..."]
SPARK = [[".", ], ["x"], [".x.", "xwx", ".x."], ["..x..", "..x..", "xxwxx", "..x..", "..x.."]]
RUNES = [[".x.", "xxx", "x.x", ".x."], [".x.", "xxx", ".x.", "x.x"], ["x.x", ".x.", "xxx", ".x."],
         ["xx.", "x..", "xxx", "..x"], ["x..", "xxx", "x.x", "xxx"]]
FLAMES = [["..h..", ".hfh.", ".fwf.", "hfwfh", ".fff.", "..r.."],
          [".h...", "..fh.", ".fwf.", "hfwfh", ".fwf.", "..r.."],
          ["...h.", ".hf..", ".fwf.", "hfwfh", ".fff.", "..r.."]]
SMALL_FLAMES = [[".h.", "hwh", ".f."], ["h..", ".wh", ".f."], ["..h", "hw.", ".f."]]


def draw(t):
    rnd = random.Random(12)                      # misma escena en cada cuadro; solo cambia lo animado
    ph = 2 * math.pi * t / FRAMES
    c = Canvas(W, H)
    yy, xx = c.grid()
    glows = []                                   # (x, y, radio, color, fuerza, aplastado)

    def leaf_lv(base):
        return {'o': base - 2.6, 'd': base - 1, 'm': base, 'l': base + 1, 'h': base + 2.4, 'v': base + 1.6}

    def leaf(x, y, base, rows, flip=False, ramp='leaf'):
        c.sprite(int(round(x)) - len(rows[0]) // 2, int(round(y)), rows, ramp, leaf_lv(base), flip=flip)

    def vine(x0, y0, length, base, sway=2.5, freq=0.11, every=3, big=True, alive=0.0, flowers=0.0):
        p0 = rnd.random() * 6
        drift = rnd.uniform(-0.03, 0.03)
        pts = []
        for k in range(length):
            # 'alive': las puntas se mecen más que la parte de arriba (la enredadera cuelga de la viga)
            wob = alive * (k / max(1, length)) ** 1.4 * math.sin(ph + p0)
            pts.append((x0 + sway * math.sin(k * freq + p0) + k * drift + wob, y0 + k))
        for (x, y) in pts:
            c.px(x, y, 'stem', max(0, base - 3))
        side = 1
        for i in range(2, length, every):
            x, y = pts[i]
            side = -side
            frac = i / length
            ramp = rnd.choice(['leaf', 'leaf', 'leaf', 'sprout', 'shade']) if base >= 4 else rnd.choice(['leaf', 'shade', 'shade'])
            if big and frac < 0.55:
                rows = rnd.choice([LEAF_BIG, LEAF_MED, LEAF_MED, LEAF_TALL])
            elif frac < 0.85:
                rows = rnd.choice([LEAF_MED, LEAF_TALL, LEAF_SMALL, LEAF_SIDE])
            else:
                rows = rnd.choice([LEAF_SMALL, LEAF_SIDE])
            b = base + rnd.choice([0, 0, 1, -1])
            leaf(x + side * (len(rows[0]) // 2 + 0.5), y - 1, b, rows, flip=(side < 0), ramp=ramp)
            if rnd.random() < flowers:
                fx, fy = x - side * 2, y + 2
                c.sprite(int(fx) - 1, int(fy), JASMINE if rnd.random() < 0.6 else JASMINE_BIG, 'petal',
                         {'p': 3, 'y': ('rune', 4)})
        tip = rnd.choice(['sprout', 'leaf'])
        leaf(pts[-1][0], pts[-1][1] - 1, base + 1, LEAF_SMALL, ramp=tip)

    def drape(x0, x1, y0, n, length, base, **kw):
        for _ in range(n):
            vine(rnd.uniform(x0, x1), y0 + rnd.randint(-1, 2), int(length * rnd.uniform(0.55, 1.0)), base, **kw)

    def spark(x, y, size, mat='rune', lv=5):
        rows = SPARK[size]
        c.sprite(int(x) - len(rows[0]) // 2, int(y) - len(rows) // 2, rows, mat, {'x': lv, 'w': lv + 2})
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch != '.':
                    xx_, yy_ = int(x) - len(row) // 2 + i, int(y) - len(rows) // 2 + j
                    if 0 <= xx_ < W and 0 <= yy_ < H:
                        c.lock[yy_, xx_] = True

    # ================================================================== PARED
    c.rect(0, 0, W, H, 'wall', 2)
    noise = np.array([[rnd.random() for _ in range(W)] for _ in range(H)])
    c.lvl[noise > 0.975] -= 1
    c.lvl[noise < 0.015] += 1
    # manchas de humedad / suciedad abajo y grietas finas
    c.lvl[(yy > 90) & (noise > 0.55)] -= 0.5
    for (gx, gy, n) in [(14, 30, 9), (96, 16, 6), (86, 64, 7)]:
        x, y = gx, gy
        for _ in range(n):
            c.px(x, y, 'wall', 0.5); c.px(x + 1, y, 'wall', 3.5)
            x += rnd.choice([-1, 0, 1]); y += 1

    def stones(x0, y0, cols, rows):
        for r in range(rows):
            off = 3 if r % 2 else 0
            for k in range(cols):
                sx, sy = x0 + k * 7 - off, y0 + r * 5
                lv = 3 + rnd.choice([0, 0, 1, -1])
                c.rect(sx, sy, sx + 6, sy + 4, 'stone', lv)
                c.rect(sx, sy, sx + 6, sy + 1, 'stone', lv + 1)
                c.rect(sx, sy + 3, sx + 6, sy + 4, 'stone', lv - 1)
                c.px(sx + 5, sy + 1, 'stone', lv - 1)
                if rnd.random() < 0.3:                       # musgo en las juntas
                    c.px(sx + rnd.randint(0, 5), sy + 3, 'sprout', 3)
            c.rect(x0 - 4, y0 - 1, x0 + cols * 7 - 3, y0, 'wall', 1)
    stones(8, 56, 2, 5)

    # entramado de madera (casa de entramado): poste izquierdo y diagonal
    c.rect(0, 8, 6, 112, 'wood', 3)
    c.rect(0, 8, 1, 112, 'wood', 1)
    c.rect(5, 8, 6, 112, 'wood', 5)
    for y in range(10, 112, 9):
        c.px(2 + (y // 9) % 3, y, 'wood', 1); c.px(2 + (y // 9) % 3, y + 1, 'wood', 2)

    # ================================================================== VIGA
    c.rect(0, 0, W, 8, 'wood', 3)
    c.rect(0, 0, W, 1, 'wood', 5)
    c.rect(0, 1, W, 2, 'wood', 4)
    c.rect(0, 7, W, 8, 'wood', 1)
    c.rect(0, 8, W, 9, 'void', 0)
    for x in range(W):
        if (x * 7) % 23 < 9:
            c.px(x, 3 + (x // 11) % 2, 'wood', 2)
        if (x * 5) % 37 < 3:
            c.px(x, 5, 'wood', 5)
    for kx in (30, 118):                         # nudos de la madera
        c.sprite(kx, 2, [".oo.", "oxxo", ".oo."], 'wood', {'o': 1.5, 'x': 0.5})
    for bx in (20, 84, 140):                     # clavos de latón
        c.px(bx, 4, 'brass', 5); c.px(bx + 1, 5, 'brass', 2)

    # ================================================================== VENTANA CON ARCO DE PIEDRA
    CX, CY, RIN, RFR, RST = 52, 46, 19, 22, 28
    X0, X1, YB = CX - RIN, CX + RIN, 96
    d = np.hypot(xx - CX, yy - CY)
    ang = np.degrees(np.arctan2(yy - CY, xx - CX))           # -180..180, arriba = -90
    glass = ((yy >= CY) & (xx >= X0) & (xx <= X1) & (yy <= YB)) | ((yy < CY) & (d <= RIN))
    frame = (((yy >= CY) & (xx >= CX - RFR) & (xx <= CX + RFR) & (yy <= YB + 2)) | ((yy < CY) & (d <= RFR))) & ~glass
    arch = (yy < CY + 1) & (d > RFR) & (d <= RST)
    jamb = (yy >= CY + 1) & (yy <= YB + 2) & (((xx >= CX - RST) & (xx < CX - RFR)) | ((xx > CX + RFR) & (xx <= CX + RST)))

    # dovelas del arco: bloques radiales con canto de luz y junta oscura
    seg = np.floor((ang + 180) / 15).astype(int)
    lv_arch = 3 + ((seg * 7) % 3 - 1) * 0.7
    c.mask(arch, 'stone', lv_arch.astype(np.float32))
    joint = arch & (np.abs(((ang + 180) % 15) - 0) < 1.6)
    c.mask(joint, 'stone', 1)
    c.mask(arch & (d > RST - 1.2), 'stone', 1.5)
    c.mask(arch & (d <= RFR + 1.2), 'stone', 5)
    # jambas de piedra en bloques
    jl = jamb & (((yy - CY) // 6) % 2 == 0)
    c.mask(jamb, 'stone', 3)
    c.mask(jl, 'stone', 2.4)
    c.mask(jamb & ((yy - CY) % 6 == 0), 'stone', 1)
    # clave del arco con runa que pulsa
    c.rect(CX - 4, CY - RST - 2, CX + 5, CY - RFR + 1, 'stone', 4)
    c.rect(CX - 4, CY - RST - 2, CX + 5, CY - RST - 1, 'stone', 5)
    c.rect(CX - 4, CY - RFR, CX + 5, CY - RFR + 1, 'stone', 2)
    pulse = 0.5 + 0.5 * math.sin(ph)
    c.sprite(CX - 1, CY - RST + 1, RUNES[0], 'crystal', {'x': 5 + pulse * 1.5})
    glows.append((CX, CY - RST + 3, 9, '#5cc4dc', 0.55 + 0.45 * pulse, 1))

    # --- vista: cielo, isla flotante, montañas, bosque, prado
    sun = (40, 58)
    dsun = np.hypot(xx - sun[0], yy - sun[1])
    sky_lvl = 1.0 + np.clip((yy - 26) / 11, 0, 4) + np.clip(2.6 - dsun / 10, 0, 2.6)
    sky_lvl = np.floor(sky_lvl)                  # cielo en bandas limpias, sin puntillado
    c.mask(glass, 'sky', sky_lvl)
    c.mask(glass & (dsun <= 2.6), 'flame', 5)
    c.mask(glass & (dsun > 2.6) & (dsun <= 4), 'sky', 7)

    def cloud(cx, cy, blobs):
        for (ox, oy, r) in blobs:
            bd = np.hypot(xx - (cx + ox), (yy - (cy + oy)) * 1.3)
            m = glass & (bd <= r)
            rel = yy - (cy + oy)
            lv = np.where(rel < -r * 0.3, 4, np.where(rel > r * 0.4, 1.6, 3))
            c.mask(m, 'cloud', lv.astype(np.float32))
    drift = (t / FRAMES) * 2
    cloud(64 + drift, 54, [(0, 0, 4), (5, 1, 3), (-4, 1.5, 2.5), (8, 2, 2)])
    cloud(38 - drift, 64, [(0, 0, 2.5), (3, 0.5, 2), (-3, 1, 1.6)])

    # montañas lejanas azuladas con nieve
    mtn = 74 - np.clip(9 - np.abs(xx - 44) * 0.7, 0, 9) - np.clip(6 - np.abs(xx - 64) * 0.6, 0, 6)
    c.mask(glass & (yy >= mtn), 'hill', np.where(xx < 44, 2, 1).astype(np.float32))
    c.mask(glass & (yy >= mtn) & (yy < mtn + 2) & (mtn < 70), 'cloud', 3)
    # isla flotante con torre y cascada
    IX, IY = 62, 61
    isl = glass & (np.abs(xx - IX) <= 7 - np.clip(yy - IY, 0, 7)) & (yy >= IY) & (yy <= IY + 6)
    c.mask(isl, 'stone', 2)
    c.mask(isl & (yy == IY), 'sprout', 4)
    c.mask(isl & (yy == IY + 1), 'leaf', 3)
    c.rect(IX - 1, IY - 6, IX + 2, IY, 'stone', 4)          # torre
    c.rect(IX - 2, IY - 7, IX + 3, IY - 6, 'arcane', 3)      # techo
    c.px(IX, IY - 8, 'arcane', 4)
    c.px(IX, IY - 4, 'rune', 5 if t % 4 < 2 else 4)           # ventanita encendida
    for k in range(9):                                      # cascada
        c.px(IX + 4, IY + 2 + k, 'cloud', 3 if (k + t) % 3 else 4)
    c.px(IX - 3, IY + 7, 'stone', 1); c.px(IX - 1, IY + 8, 'stone', 1)  # rocas colgando
    # pájaros
    for (bx, by, o) in [(44, 50, 0), (48, 52, 3)]:
        bx += (t * 0.5) % 8
        w = (t + o) % 4 < 2
        c.px(bx, by, 'stone', 1)
        c.px(bx - 1, by - (1 if w else 0), 'stone', 1); c.px(bx + 1, by - (1 if w else 0), 'stone', 1)
    # colinas, bosque y prado
    far = 80 + 2.5 * np.sin(xx * 0.13 + 1) + 1.5 * np.sin(xx * 0.31)
    c.mask(glass & (yy >= far), 'hill', np.clip(4 - (yy - far) / 3, 2, 4).astype(np.float32))
    for tx in range(X0 - 2, X1 + 3, 4):
        ty = 85 + rnd.randint(-2, 1)
        r = rnd.choice([2.5, 3, 3.5])
        td = np.hypot(xx - tx, (yy - ty) * 0.9)
        m = glass & (td <= r)
        rel = (xx - tx) + (yy - ty)
        c.mask(m, 'tree', np.where(rel < -1.5, 4, np.where(rel > 1.5, 1, 2.5)).astype(np.float32))
    c.mask(glass & (yy >= 89), 'sprout', np.clip(5 - (yy - 89) / 3, 3, 5).astype(np.float32))
    for k in range(18):
        fx, fy = rnd.randint(X0, X1), rnd.randint(90, 96)
        if glass[fy, fx]:
            c.px(fx, fy, rnd.choice(['petal', 'lav', 'rune']), 3)

    # --- vitral en la parte del arco (rebanadas de colores con plomo)
    colors = ['glow', 'crystal', 'arcane', 'crystal', 'glow', 'arcane']
    sector = np.floor((ang + 180) / 30).astype(int)
    upper = glass & (yy < CY - 1) & (d > 7)
    for k, col in enumerate(colors):
        m = upper & (sector == k)
        if m.any():
            c.mask(m, col, (np.where(d < 13, 5, 4) + ((xx + yy) % 5 == 0) * 1).astype(np.float32))
    rose = glass & (yy < CY) & (d <= 7)
    c.mask(rose, 'rune', np.where(d < 3, 6, 4).astype(np.float32))
    lead = (upper & ((((ang + 180) % 30) < 30 / max(1, 1) * 0) | (np.abs(d - 13) < 0.6))) | (glass & (yy < CY) & (np.abs(d - 7) < 0.6))
    bnd = np.radians(((ang + 180) % 30)) * d                       # distancia (en px) al borde del sector
    bnd = np.minimum(bnd, np.radians(30 - ((ang + 180) % 30)) * d)
    lead |= upper & (bnd < 0.7)
    lead |= glass & (np.abs(yy - (CY - 1)) < 0.6)
    c.mask(lead, 'void', 0)
    # estrella en la roseta
    c.sprite(CX - 3, CY - 8, STAR7, 'rune', {'a': 5, 'b': 6, 'c': 6})
    glows.append((CX, CY - 8, 16, '#ffd860', 0.35, 1))

    # --- marco de madera y parteluces
    c.mask(frame, 'wood', 4)
    c.mask(frame & (d > RFR - 1) & (yy < CY), 'wood', 2)
    c.mask(frame & (d <= RIN + 1.3) & (yy < CY), 'wood', 6)
    c.rect(CX - RFR, CY, CX - RFR + 1, YB + 3, 'wood', 2)
    c.rect(CX + RFR, CY, CX + RFR + 1, YB + 3, 'wood', 2)
    c.rect(X0 - 1, CY, X0, YB + 1, 'wood', 6)
    mull = (glass & (yy >= CY) & (np.abs(xx - CX) <= 1)) | (glass & (np.abs(yy - 72) <= 0.6))
    c.mask(mull, 'wood', 3)
    c.mask(mull & (xx == CX - 1), 'wood', 5)
    c.mask(mull & (yy == 72), 'wood', 5)
    glass_only = glass & ~mull & ~lead
    for (gx, gy, n) in [(36, 80, 5), (58, 68, 3), (68, 92, 3)]:          # reflejos en el vidrio
        for i in range(n):
            if glass_only[gy - i, gx + i]:
                c.px(gx + i, gy - i, 'cloud', 4)

    # ================================================================== ALFÉIZAR
    c.rect(20, 97, 86, 99, 'stone', 5)
    c.rect(20, 99, 86, 102, 'stone', 3)
    c.rect(20, 102, 86, 103, 'stone', 1)
    for x in range(22, 86, 9):
        c.px(x, 100, 'stone', 2)
    c.rect(21, 103, 85, 104, 'void', 0)

    # ================================================================== ESTANTERÍA (fondo)
    c.rect(106, 9, W, 112, 'wood', 1)
    for x in range(106, W, 9):
        c.rect(x, 9, x + 1, 112, 'wood', 0)
        c.rect(x + 1, 9, x + 2, 112, 'wood', 2)
        for y in range(14 + (x % 5), 112, 13):
            c.px(x + 4, y, 'wood', 0.5)
    c.rect(103, 9, 107, 112, 'wood', 4)
    c.rect(103, 9, 104, 112, 'wood', 6)
    c.rect(106, 9, 107, 112, 'wood', 2)
    for y in (20, 54, 88):                       # tallado del pilar
        c.sprite(103, y, ["xxxx", ".oo.", "xxxx"], 'wood', {'x': 6, 'o': 2})

    def shelf(y):
        c.rect(107, y, W, y + 2, 'wood', 6)
        c.rect(107, y + 2, W, y + 4, 'wood', 4)
        c.rect(107, y + 3, W, y + 4, 'wood', 3)
        c.rect(107, y + 4, W, y + 6, 'void', 0)
        c.rect(107, y + 6, W, y + 7, 'wood', 0)
        for bx in range(112, W, 22):             # ménsulas
            c.sprite(bx, y + 4, ["xxx", ".xx", "..x"], 'wood', {'x': 3})

    def book(x, y_base, w, h, col, lean=0):
        top = y_base - h
        c.rect(x, top, x + w, y_base, col, 3)
        c.rect(x, top, x + 1, y_base, col, 4.6)
        c.rect(x + w - 1, top, x + w, y_base, col, 1.4)
        c.rect(x, top, x + w, top + 1, col, 2)
        deco = rnd.choice(['bands', 'bands', 'diamond', 'label'])
        if deco == 'bands':
            for by in (top + 2, y_base - 3):
                c.rect(x + 1, by, x + w - 1, by + 1, 'rune', 3)
        elif deco == 'diamond' and w >= 4:
            my = top + h // 2
            c.px(x + w // 2, my - 1, 'rune', 4); c.px(x + w // 2 - 1, my, 'rune', 3)
            c.px(x + w // 2 + 1 if w > 4 else x + w // 2, my, 'rune', 3); c.px(x + w // 2, my + 1, 'rune', 3)
            c.rect(x + 1, top + 1, x + w - 1, top + 2, 'rune', 3)
        else:
            c.rect(x + 1, top + 3, x + w - 1, top + 6, 'paper', 4)
            c.rect(x + 1, top + 4, x + w - 2, top + 5, 'paper', 2)

    def books(x, y_base, n, maxx=W):
        for _ in range(n):
            w = rnd.choice([3, 4, 4, 5])
            h = rnd.randint(10, 16)
            if x + w > maxx:
                break
            book(x, y_base, w, h, rnd.choice(['red', 'green', 'blue', 'red', 'lav', 'paper']))
            x += w
        return x

    def potion(x, y, w, h, col, glowcol=None, neck=2):
        body_top = y - h
        c.rect(x + 1, body_top, x + w - 1, y, 'glass', 2)
        c.rect(x, body_top + 1, x + w, y - 1, 'glass', 2)
        c.rect(x + 1, body_top + h // 3, x + w - 1, y - 1, col, 4)
        c.rect(x + 1, body_top + h // 3, x + w - 1, body_top + h // 3 + 1, col, 6)
        c.rect(x + 1, body_top + 1, x + 2, y - 2, 'glass', 6)
        c.rect(x + w // 2 - 1, body_top - neck, x + w // 2 + 1, body_top, 'glass', 3)
        c.rect(x + w // 2 - 1, body_top - neck - 2, x + w // 2 + 1, body_top - neck, 'wood', 5)
        b = (t * 2 + x) % h                     # burbuja que sube
        c.px(x + w // 2, y - 2 - b * 0.6, col, 7)
        if glowcol:
            glows.append((x + w / 2, y - h / 2, 10, glowcol, 0.5 + 0.2 * math.sin(ph + x), 1))

    shelf(30)
    xb = books(109, 30, 6)
    # bola de cristal sobre soporte
    bx, by = xb + 6, 23
    bd = np.hypot(xx - bx, yy - by)
    c.mask(bd <= 5.2, 'crystal', np.clip(6 - bd * 0.7, 2, 6).astype(np.float32))
    c.px(bx - 2, by - 2, 'crystal', 7); c.px(bx - 1, by - 3, 'crystal', 7)
    swirl = [(math.cos(ph + k) * 2.5, math.sin(ph + k) * 1.5) for k in range(0, 6, 2)]
    for (sx, sy) in swirl:
        c.px(bx + sx, by + sy, 'arcane', 6)
    c.rect(bx - 3, by + 5, bx + 4, by + 7, 'brass', 4)
    c.rect(bx - 4, by + 6, bx + 5, by + 7, 'brass', 2)
    glows.append((bx, by, 14, '#5cc4dc', 0.75 + 0.25 * math.sin(ph), 1))
    books(bx + 8, 30, 3)

    shelf(62)
    potion(109, 62, 7, 11, 'arcane', '#9060dc')
    potion(118, 62, 5, 8, 'red', '#d87052', neck=3)
    books(125, 62, 3)
    potion(139, 62, 8, 13, 'crystal', '#3098b8')
    # reloj de arena
    hx = 150
    c.rect(hx, 46, hx + 7, 48, 'wood', 5); c.rect(hx, 60, hx + 7, 62, 'wood', 5)
    c.rect(hx, 48, hx + 1, 60, 'wood', 3); c.rect(hx + 6, 48, hx + 7, 60, 'wood', 3)
    for j in range(12):
        wj = abs(j - 6) // 2 + 1
        c.rect(hx + 3.5 - wj, 48 + j, hx + 3.5 + wj, 49 + j, 'glass', 3)
    c.rect(hx + 2, 57, hx + 5, 60, 'paper', 4)
    c.rect(hx + 2, 50, hx + 5, 52, 'paper', 4)
    c.px(hx + 3, 53 + (t % 4), 'paper', 5)

    shelf(96)
    books(109, 96, 4)
    for i, col in enumerate(['green', 'lav', 'red', 'blue']):
        y = 96 - 3 * (i + 1)
        c.rect(128 + i, y, 152 - i, y + 3, col, 3)
        c.rect(128 + i, y, 152 - i, y + 1, col, 4.5)
        c.rect(150 - i, y, 152 - i, y + 3, 'paper', 4)
        c.px(140, y + 1, 'rune', 4)
    # pergaminos enrollados
    for (sx, sy) in [(154, 92), (156, 88)]:
        c.rect(sx, sy, sx + 6, sy + 3, 'paper', 4)
        c.rect(sx, sy, sx + 6, sy + 1, 'paper', 5)
        c.px(sx, sy + 1, 'paper', 2)

    # ================================================================== hiedra de atrás
    drape(4, 22, 7, 6, 104, 2, sway=3, flowers=0.05)
    drape(99, 104, 7, 2, 70, 2, sway=1.5)
    drape(108, 158, 7, 4, 18, 2, sway=1.5)

    # ================================================================== pergamino con círculo mágico (pared derecha)
    PX0, PY0, PX1, PY1 = 82, 26, 101, 50
    c.rect(PX0, PY0, PX1, PY1, 'paper', 4)
    c.rect(PX0, PY0, PX1, PY0 + 1, 'paper', 5)
    c.rect(PX1 - 1, PY0, PX1, PY1, 'paper', 2)
    c.rect(PX0, PY1 - 1, PX1, PY1, 'paper', 2)
    c.px(PX1 - 1, PY1 - 1, 'wall', 2); c.px(PX1 - 2, PY1 - 1, 'paper', 1)   # esquina doblada
    mcx, mcy = (PX0 + PX1) // 2, (PY0 + PY1) // 2
    md = np.hypot(xx - mcx, yy - mcy)
    mang = np.arctan2(yy - mcy, xx - mcx)
    inside = (xx > PX0) & (xx < PX1 - 1) & (yy > PY0) & (yy < PY1 - 1)
    circ = inside & ((np.abs(md - 7.5) < 0.6) | (np.abs(md - 4.5) < 0.55))
    tri = np.zeros_like(circ)
    for k in range(3):
        a = mang - (ph * 0.0 + k * 2 * math.pi / 3 - math.pi / 2)
        tri |= inside & (md < 7.5) & (np.abs(md * np.cos(((mang + math.pi / 2) % (2 * math.pi / 3)) - math.pi / 3) - 3.75) < 0.5)
    c.mask(circ | tri, 'rune', 3)
    c.px(mcx, mcy, 'arcane', 5)
    for k in range(6):                           # puntos de runa alrededor que se encienden en turno
        a = k * math.pi / 3 + ph * 0.25
        on = (t // 2 + k) % 6 == 0
        c.px(mcx + 9 * math.cos(a) * 0.95, mcy + 9 * math.sin(a), 'arcane' if on else 'rune', 6 if on else 2.5)
    c.px(PX0 + 2, PY0 + 1, 'brass', 5); c.px(PX1 - 3, PY0 + 1, 'brass', 5)   # chinches
    for k in range(4):
        c.rect(PX0 + 3, PY1 - 6 + k * 0 + (k // 2) * 2, PX0 + 8 + k * 2, PY1 - 5 + (k // 2) * 2, 'paper', 2)
    glows.append((mcx, mcy, 13, '#ffd860', 0.25 + 0.15 * pulse, 1))

    # ================================================================== objetos que cuelgan de la viga
    # hierbas secas (lavanda y salvia)
    def herbs(x, length, ramp):
        c.line(x, 9, x, 9 + length - 8, 'stem', 2)
        c.rect(x - 1, 9 + length - 9, x + 2, 9 + length - 7, 'red', 3)       # amarra
        for k in range(9):
            sx = x + (k - 4) * 0.7
            for j in range(rnd.randint(4, 7)):
                yv = 9 + length - 7 + j
                c.px(sx + (j * (k - 4)) * 0.12, yv, ramp, 3 + (j % 2) - (abs(k - 4) > 2) + (k < 3))
    herbs(30, 20, 'lav')
    herbs(70, 16, 'sprout')

    # estrella de latón colgante que se balancea
    sx = 78 + round(1.2 * math.sin(ph))
    c.line(78, 9, sx, 22, 'paper', 2)
    c.sprite(sx - 3, 22, STAR7, 'brass', {'a': 4, 'b': 5, 'c': 6})
    c.px(sx - 1, 24, 'brass', 6)
    glows.append((sx, 25, 9, '#fbe08a', 0.35 + 0.2 * pulse, 1))

    # farol colgante
    LX, LY = 92, 64
    for y in range(9, LY - 6, 2):                # cadena
        c.px(LX, y, 'brass', 3); c.px(LX, y + 1, 'brass', 1.5)
    c.sprite(LX - 2, LY - 8, [".xxx.", "x...x", ".xxx."], 'brass', {'x': 4})
    c.rect(LX - 3, LY - 5, LX + 4, LY - 3, 'brass', 3)
    c.rect(LX - 5, LY - 3, LX + 6, LY - 1, 'brass', 4)
    c.rect(LX - 5, LY - 3, LX + 6, LY - 2, 'brass', 5)
    c.rect(LX - 4, LY - 1, LX + 5, LY + 12, 'glow', 2)
    c.rect(LX - 4, LY - 1, LX - 3, LY + 12, 'brass', 3.5)
    c.rect(LX + 4, LY - 1, LX + 5, LY + 12, 'brass', 1.5)
    c.rect(LX, LY - 1, LX + 1, LY + 12, 'brass', 2.5)
    c.rect(LX - 2, LY, LX - 1, LY + 10, 'glow', 4)
    fl = FLAMES[(t // 2) % 3]
    c.sprite(LX - 2, LY + 3, fl, 'flame', {'h': 2, 'f': 3, 'w': 5, 'r': 1})
    c.rect(LX - 1, LY + 9, LX + 2, LY + 12, 'wax', 4)
    c.rect(LX - 5, LY + 12, LX + 6, LY + 14, 'brass', 4)
    c.rect(LX - 5, LY + 13, LX + 6, LY + 14, 'brass', 2)
    c.rect(LX - 1, LY + 14, LX + 2, LY + 16, 'brass', 3)
    flick = 0.08 * math.sin(ph * 3) + 0.05 * math.sin(ph * 5 + 1)

    # ================================================================== cosas del alféizar
    def pot(x, y, w=8, h=6):
        c.rect(x, y, x + w, y + 2, 'clay', 4)
        c.rect(x, y + 2, x + w, y + 3, 'clay', 2)
        for j in range(3, h):
            ins = (j - 3) // 2
            c.rect(x + ins, y + j, x + w - ins, y + j + 1, 'clay', 3)
            c.px(x + ins, y + j, 'clay', 2)
            c.px(x + w - ins - 1, y + j, 'clay', 1)
            c.px(x + ins + 1, y + j, 'clay', 4)
        c.rect(x + 1, y, x + w - 1, y + 1, 'clay', 5)
        c.px(x + 3, y + 4, 'rune', 3); c.px(x + 4, y + 4, 'rune', 3)     # adorno pintado

    pot(23, 91)
    for k, (dx, ln) in enumerate([(-2, 10), (1, 13), (4, 9), (6, 11)]):
        vine(27 + dx, 92 - ln, ln, 5, sway=0.8, every=2, big=False, alive=0.0)
    for (fx, fy) in [(25, 82), (30, 80)]:
        c.sprite(fx - 1, fy - 1, JASMINE, 'petal', {'p': 3, 'y': ('rune', 4)})

    # racimo de cristales mágicos
    def crystal(x, y, h, w, lv):
        for j in range(h):
            half = w if j > 1 else (1 if j == 1 else 0)
            for i in range(-half, half + 1):
                l = lv + (1.5 if i < 0 else (-0.8 if i > 0 else 0.6))
                c.px(x + i, y - j, 'arcane', l)
        c.px(x, y - h, 'arcane', 7)
    CRX, CRY = 46, 96
    crystal(CRX, CRY, 9, 1, 4)
    crystal(CRX - 3, CRY, 6, 1, 3.5)
    crystal(CRX + 3, CRY, 5, 1, 3)
    crystal(CRX + 5, CRY, 3, 0, 3)
    c.rect(CRX - 5, CRY, CRX + 7, CRY + 1, 'stone', 2)
    glows.append((CRX, CRY - 4, 18, '#9060dc', 0.7 + 0.3 * math.sin(ph + 1), 1))

    # tres velas con cera chorreada
    def candle(x, base_y, h, frame_off):
        c.rect(x, base_y - h, x + 3, base_y, 'wax', 3.5)
        c.rect(x, base_y - h, x + 1, base_y, 'wax', 5)
        c.rect(x + 2, base_y - h, x + 3, base_y, 'wax', 2)
        c.px(x + 1, base_y - h + 2, 'wax', 5); c.px(x + 2, base_y - h + 3, 'wax', 5)   # gotas
        c.px(x + 1, base_y - h - 1, 'void', 0)
        fl = SMALL_FLAMES[(t // 2 + frame_off) % 3]
        c.sprite(x, base_y - h - 4, fl, 'flame', {'h': 2, 'w': 5, 'f': 3})
        glows.append((x + 1, base_y - h - 3, 9, '#ffb440', 0.5 + 0.2 * math.sin(ph * 3 + frame_off), 1))
    candle(60, 97, 7, 0)
    candle(64, 97, 10, 1)
    candle(68, 97, 5, 2)
    c.rect(59, 97, 72, 98, 'wax', 4)             # charco de cera

    # hongo en maceta chica
    pot(76, 92, 6, 5)
    c.sprite(76, 86, [".rrrr.", "rwrrwr", "oooooo", "..ss..", "..ss.."], 'red',
             {'r': 4, 'w': ('petal', 4), 'o': 2, 's': ('wax', 4)})

    # ================================================================== ESCRITORIO
    c.rect(0, 110, W, 115, 'wood', 5)
    c.rect(0, 110, W, 111, 'wood', 7)
    c.rect(0, 115, W, 116, 'wood', 2)
    c.rect(0, 116, W, H, 'wood', 3)
    for x in range(0, W, 26):
        c.rect(x, 116, x + 1, H, 'wood', 1)
        c.rect(x + 1, 116, x + 2, H, 'wood', 4)
    for x in range(W):
        if (x * 13) % 31 < 6:
            c.px(x, 112 + (x // 17) % 2, 'wood', 4)
        if (x * 11) % 29 < 4:
            c.px(x, 121 + (x // 13) % 3, 'wood', 2)
    c.sprite(70, 120, [".xxxxx.", "xo...ox", ".xxxxx."], 'brass', {'x': 4, 'o': 2})

    # grimorio abierto con círculo que brilla
    GX, GY = 24, 103
    c.rect(GX - 1, GY + 6, GX + 41, GY + 9, 'red', 2)         # tapas
    c.rect(GX - 1, GY + 8, GX + 41, GY + 9, 'red', 1)
    for side in (0, 1):
        x0 = GX + side * 20
        c.rect(x0, GY, x0 + 20, GY + 7, 'paper', 4)
        c.rect(x0, GY, x0 + 20, GY + 1, 'paper', 5)
        c.rect(x0 + (19 if side == 0 else 0), GY, x0 + (20 if side == 0 else 1), GY + 7, 'paper', 2)
        c.rect(x0, GY + 6, x0 + 20, GY + 7, 'paper', 3)
    for k in range(4):                           # texto en la página izquierda
        c.rect(GX + 2, GY + 2 + k * 1, GX + 7 + (k * 5) % 9, GY + 2 + k * 1 + 0.5, 'paper', 1.5)
    c.sprite(GX + 12, GY + 1, RUNES[2], 'rune', {'x': 2.5})
    gcx, gcy = GX + 30, GY + 3
    gd = np.hypot((xx - gcx), (yy - gcy) * 2.2)
    page = (xx >= GX + 21) & (xx < GX + 40) & (yy >= GY + 1) & (yy < GY + 6)
    c.mask(page & (np.abs(gd - 6) < 0.7), 'crystal', 5 + pulse)
    c.mask(page & (np.abs(gd - 3) < 0.6), 'crystal', 6)
    c.px(gcx, gcy, 'crystal', 7)
    glows.append((gcx, gcy - 2, 20, '#5cc4dc', 0.6 + 0.4 * pulse, 1.6))
    # chispas mágicas que suben del libro
    for k in range(5):
        life = ((t + k * 3.3) % FRAMES) / FRAMES
        sxp = gcx - 6 + k * 3 + math.sin(ph + k) * 1.5
        syp = gcy - 2 - life * 22
        size = 2 if life < 0.35 else (1 if life < 0.8 else 0)
        if size:
            spark(sxp, syp, size, 'crystal', 6)

    # tintero y pluma
    c.rect(70, 104, 76, 110, 'glass', 1)
    c.rect(71, 103, 75, 104, 'brass', 4)
    c.rect(71, 105, 72, 109, 'glass', 4)
    for i in range(11):
        c.px(75 + i * 0.55, 103 - i, 'petal', 3 if i < 8 else 4)
        c.px(76 + i * 0.55, 103 - i, 'petal', 2 if i < 9 else 3)
    # astrolabio chico de latón
    ax, ay = 132, 104
    ad = np.hypot(xx - ax, yy - ay)
    c.mask(np.abs(ad - 5) < 0.7, 'brass', 4)
    rx = np.abs((xx - ax) * math.cos(ph * 0.5) )
    c.mask((np.abs(np.hypot((xx - ax) / max(0.2, abs(math.cos(ph * 0.5))), yy - ay) - 5) < 0.8) & (ad < 6), 'brass', 5)
    c.px(ax, ay, 'rune', 6)
    c.rect(ax - 1, ay + 5, ax + 2, ay + 7, 'brass', 3)
    c.rect(ax - 3, ay + 7, ax + 4, ay + 8, 'brass', 2)
    # vela del escritorio
    candle(148, 110, 9, 1)

    # ================================================================== hiedra de adelante (se mece)
    drape(-4, 14, 7, 4, 108, 4, sway=3.5, alive=1.2, flowers=0.12)
    drape(98, 104, 7, 2, 50, 4, sway=1.5, alive=1.0, flowers=0.1)
    drape(80, 84, 7, 1, 30, 4, sway=1.0, alive=1.0, flowers=0.2)
    drape(18, 40, 7, 3, 20, 4, sway=1.5, alive=0.6, flowers=0.15)
    drape(62, 76, 7, 2, 14, 4, sway=1.5, alive=0.6, flowers=0.15)
    drape(112, 156, 7, 3, 20, 4, sway=1.5, alive=0.6, flowers=0.1)
    drape(-6, 6, 7, 2, 120, 5, sway=4, alive=1.6, flowers=0.1)

    # ================================================================== LUZ
    dwin = np.hypot((xx - CX) / 1.2, yy - 70)
    c.add_light(np.clip(1.5 - dwin / 30, 0, 1.5))
    shaft = np.zeros((H, W), np.float32)
    dx, dy = 0.62, 1.0
    for s in range(3, 90):
        sx_ = np.clip(np.round(xx - dx * s).astype(int), 0, W - 1)
        sy_ = np.clip(np.round(yy - dy * s).astype(int), 0, H - 1)
        hit = glass_only[sy_, sx_] & (yy - dy * s >= 0) & (shaft == 0) & (sy_ >= CY)
        shaft[hit] = np.clip(1.25 - s / 110, 0, 1)
    desk = (yy >= 110) & (yy < 116)
    c.add_light(np.where(glass, 0, shaft * np.where(desk, 2.6, 0.5)))
    dl = np.hypot(xx - LX, (yy - (LY + 6)) * 1.1)
    c.add_light(np.clip(1 - dl / (32 + 2 * flick * 10), 0, 1) ** 1.8 * (2.3 + flick * 3))
    c.add_light(-np.clip((xx - 112) / 26, 0, 1.5) - np.clip((22 - yy) / 12, 0, 1.2) - np.clip((10 - xx) / 8, 0, 1)
                - np.clip((yy - 118) / 8, 0, 0.8))

    # luciérnagas mágicas
    for k in range(6):
        fx = [14, 36, 74, 98, 120, 60][k] + 3 * math.sin(ph + k * 1.7)
        fy = [70, 40, 50, 92, 78, 22][k] + 2 * math.cos(ph * (1 + k % 2) + k)
        on = (t + k * 5) % 8 < 6
        if on:
            c.px(fx, fy, 'rune', 6); c.lock[int(round(fy)) % H, int(round(fx)) % W] = True
            glows.append((fx, fy, 5, '#e2ee8a', 0.6, 1))
    # polvo flotando en el haz
    r2 = random.Random(5)
    for k in range(30):
        px_, py_ = r2.randint(0, W - 1), r2.randint(10, 108)
        py_ = int(py_ - (t * 0.5 + k) % 6)
        if 0 <= py_ < H and shaft[py_, px_] > 0.3 and not glass[py_, px_]:
            c.px(px_, py_, 'glow', 5); c.lock[py_, px_] = True
    # destellos alrededor de los cristales y la estrella
    for k, (sx2, sy2) in enumerate([(CRX - 6, 84), (CRX + 6, 88), (sx + 5, 21), (bx + 6, 18), (PX0 - 2, 34)]):
        st = (t + k * 3) % 8
        size = {0: 1, 1: 2, 2: 3, 3: 2, 4: 1}.get(st, 0)
        if size:
            spark(sx2, sy2, min(size, 3), 'rune' if k % 2 else 'crystal', 6)

    def post(arr):
        glow(arr, LX, LY + 6, 30, '#ffb440', 0.9 + flick * 2, rings=4)
        glow(arr, 46, 70, 46, '#fff0b0', 0.35, rings=3, squash=0.8)
        for g in glows:
            glow(arr, g[0], g[1], g[2], g[3], g[4], rings=3, squash=g[5])

    return c.render(4, post=post)


frames = [draw(t) for t in range(FRAMES)]
frames[0].save(OUT / 'muestra-v2.png')
pal = [f.convert('P', palette=Image.ADAPTIVE, colors=255) for f in frames]
pal[0].save(OUT / 'muestra-v2.gif', save_all=True, append_images=pal[1:], duration=120, loop=0, disposal=2)
orig = Image.open(ROOT / 'dist/assets/home-scenes/refugio-012.png').convert('RGB').crop((0, 0, W * 4, H * 4))
both = Image.new('RGB', (W * 8 + 16, H * 4), (20, 12, 16))
both.paste(orig, (0, 0)); both.paste(frames[0], (W * 4 + 16, 0))
both.save(OUT / 'antes-ahora-v2.png')
print('ok')
