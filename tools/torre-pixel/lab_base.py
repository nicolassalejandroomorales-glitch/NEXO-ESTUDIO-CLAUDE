"""Piezas comunes de la muestra del Laboratorio de Orgánica II (docs/mundo-torre/SPEC.md · Fase 2).
Módulos: lab_base.py (esto) · lab_fondo.py (capa lejana fina) · lab_frente.py (medio y frente gruesos) · build_lab_muestra.py (arma y exporta).

Resolución MIXTA (decisión de Niquito, 11 oct 2026):
  - fondo lejano  → grilla FINA   720x300 (cada píxel mide la mitad)
  - medio + frente → grilla GRUESA 360x150 (el "sello" del refugio; la mascota va en esta escala)
Tres estados de progreso (vacío · a medias · completo) × tres luces (día · tarde · noche).
Lo que se llena con el progreso: libros, frascos del bestiario, plantas, farolas y reliquias.
Cada objeto trae un "rango" fijo: aparece cuando el progreso supera su rango, así la sala es siempre la misma y solo se va llenando.

Uso:  python tools/torre-pixel/build_lab_muestra.py            (imágenes de la muestra en docs/mundo-torre/)
      python tools/torre-pixel/build_lab_muestra.py --una dia 1  (un solo cuadro para iterar rápido)
"""
from pathlib import Path
import base64
import io
import math
import random
import sys
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/home-pixel'))
import pixel  # noqa: E402
from pixel import RAMPS, hexes, Canvas, glow  # noqa: E402

RAMPS.update({
    'ink':    hexes('#140c10'),                                            # contorno oscuro (no es transparente)
    'steel':  hexes('#161e24', '#26343c', '#3c4e56', '#586c72', '#7e9296', '#a8bab6', '#d4e2dc'),
    'dusk':   hexes('#241c4c', '#3c2a68', '#6a3a7c', '#a44c7c', '#d86a6c', '#f4905c', '#ffbe70', '#ffe6a0'),
    'night':  hexes('#060818', '#0a0e2a', '#10163e', '#182254', '#223068', '#2e4082', '#4058a0'),
    'shroom': hexes('#0c2230', '#16404c', '#22666e', '#38989a', '#66ccc0', '#a8f0dc', '#e8fff4'),
    'bark':   hexes('#150c10', '#26161a', '#3e2420', '#5a3628', '#7a4c34', '#9c6a46'),
})
pixel.LIGHT_GAIN.update({'dusk': 0, 'night': 0, 'ink': 0, 'shroom': 0.1, 'steel': 0.7, 'bark': 1.0})

OUT_DOCS = ROOT / 'docs/mundo-torre'
FW, FH, CW, CH = 720, 300, 360, 150
FL = 226                                   # y del piso en la grilla fina (113 en la gruesa)
TODS = ['dia', 'tarde', 'noche']
TOD_NAME = {'dia': 'DÍA', 'tarde': 'ATARDECER', 'noche': 'NOCHE'}
STATE_NAME = ['VACÍO', 'A MEDIAS', 'COMPLETO']
FILL = [0.14, 0.58, 1.01]                  # fracción de cosas que existen en cada estado

# ------------------------------------------------------------------ sprites chicos
LEAF_A = [".o.o.", "olmlo", ".olmo", "..lo."]
LEAF_B = ["o...o", "olmlo", "olhlo", ".omo.", "..o.."]
LEAF_C = [".oo.", "olmo", "omho", ".oo."]
LEAF_D = ["..o..", ".olo.", "olhlo", ".omo."]
PETAL = [".p.", "pyp", ".p."]
FLAME = [[".h.", "hwh", ".f."], ["h..", ".wh", ".f."], ["..h", "hw.", ".f."]]
CREATURE = ["o.....o", "oo...oo", "oxxxxxo", "xexxxex", "xxxxxxx", "xxxxxxx", ".x...x."]
CREATURE_B = ["oo...oo", "oxxxxxo", "xexxxex", "xxxxxxx", "xxwwwxx", ".xxxxx.", ".x...x."]
FONT = {'A': [".x.", "x.x", "xxx", "x.x", "x.x"], 'M': ["x.x", "xxx", "xxx", "x.x", "x.x"], 'I': ["xxx", ".x.", ".x.", ".x.", "xxx"],
        'N': ["x.x", "xxx", "xxx", "xxx", "x.x"], 'S': [".xx", "x..", ".x.", "..x", "xx."], 'H': ["x.x", "x.x", "xxx", "x.x", "x.x"],
        'R': ["xx.", "x.x", "xx.", "x.x", "x.x"], '2': ["xx.", "..x", ".x.", "x..", "xxx"], '3': ["xx.", "..x", ".x.", "..x", "xx."],
        '+': ["...", ".x.", "xxx", ".x.", "..."], '1': [".x.", "xx.", ".x.", ".x.", "xxx"], '0': ["xxx", "x.x", "x.x", "x.x", "xxx"],
        '.': ["...", "...", "...", "...", ".x."], 'p': ["xx.", "x.x", "xx.", "x..", "x.."], 'K': ["x.x", "xx.", "xx.", "x.x", "x.x"],
        'a': [".xx", "x.x", ".xx", "...", "..."], '9': ["xxx", "x.x", "xxx", "..x", "xxx"], '6': ["xxx", "x..", "xxx", "x.x", "xxx"],
        '5': ["xxx", "x..", "xxx", "..x", "xxx"], '=': ["...", "xxx", "...", "xxx", "..."], '-': ["...", "...", "xxx", "...", "..."]}


def det(*keys):
    return random.Random('|'.join(map(str, keys)))


def rank(*keys):
    return det(*keys).random()


class Ctx:
    """Un cuadro (estado de progreso + hora): acumula luces y brillos para sumarlos al final."""

    def __init__(self, p, tod):
        self.p, self.tod = p, tod
        self.fill = FILL[p]
        self.lights = []        # (x, y, radio, fuerza, squash)  en coordenadas FINAS
        self.glows = []         # (x, y, r, color, fuerza, squash) en coordenadas FINAS
        self.night = tod == 'noche'
        self.dusk = tod == 'tarde'


def present(ctx, *keys):
    return rank(*keys) < ctx.fill


# ================================================================== piezas genéricas
def micro(c, x, y, s, mat, lv, gap=1):
    for ch in s:
        rows = FONT.get(ch)
        if rows:
            c.sprite(x, y, rows, mat, {'x': lv})
        x += 3 + gap
    return x


def stone_wall(c, x0, y0, x1, y1, base=2.6, bw=16, bh=9, mossy=0.0, seed=1):
    yy, xx = c.grid()
    m = (xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1)
    row = np.floor((yy - y0) / bh).astype(int)
    off = (row % 2) * (bw // 2)
    col = np.floor((xx - x0 + off) / bw).astype(int)
    h = (((row * 73856093) ^ (col * 19349663) ^ seed * 83492791) % 100) / 100.0
    lv = base + (h - 0.5) * 1.1
    lu = (yy - y0) % bh
    lx = (xx - x0 + off) % bw
    c.mask(m, 'stone', lv)
    c.mask(m & (lu == 0), 'stone', lv + 1.1)
    c.mask(m & (lx == 0), 'stone', lv + 0.6)
    c.mask(m & ((lu == bh - 1) | (lx == bw - 1)), 'stone', base - 1.4)
    chip = m & (lu > bh - 4) & (lx < 3) & (h > 0.7)
    c.mask(chip, 'stone', base - 1.0)
    if mossy:
        n = np.sin(xx * 2.7 + yy * 1.3) + np.sin(xx * 0.7 - yy * 2.1)
        c.mask(m & (lu >= bh - 2) & (n > 2 - mossy * 2.2), 'shade', 4.4)
        c.mask(m & (lu >= bh - 2) & (n > 2.35 - mossy * 2.2), 'sprout', 4)


def plaster(c, x0, y0, x1, y1, seed=3):
    yy, xx = c.grid()
    m = (xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1)
    lv = 3.1 + 0.32 * np.sin(xx * 0.05 + np.sin(yy * 0.04) * 2) * np.cos(yy * 0.05 + xx * 0.01) + 0.18 * np.sin(xx * 0.31 + yy * 0.23)
    lv -= np.clip((yy - 150) / 40, 0, 1) * 0.5
    c.mask(m, 'wall', lv)
    r = det('plaster', seed)
    for _ in range(9):                                            # manchas de humedad
        cx, cy, rx, ry = r.randint(x0, x1), r.randint(y0 + 10, y1 - 10), r.randint(10, 26), r.randint(8, 18)
        d = np.hypot((xx - cx) / rx, (yy - cy) / ry)
        c.lvl[m & (d < 1)] -= 0.35 * (1 - d[m & (d < 1)])
    for _ in range(7):                                            # grietas
        x, y = r.randint(x0 + 6, x1 - 6), r.randint(y0 + 6, y1 - 40)
        for _k in range(r.randint(10, 26)):
            c.px(x, y, 'wall', 1.2); c.px(x + 1, y, 'wall', 4.4)
            x += r.choice([-1, 0, 0, 1]); y += 1


def timber_post(c, x0, x1, y0, y1, seed=5):
    r = det('post', seed)
    c.rect(x0, y0, x1, y1, 'wood', 3.2)
    c.rect(x0, y0, x0 + 2, y1, 'wood', 5.2)
    c.rect(x0 + 2, y0, x0 + 3, y1, 'wood', 4.2)
    c.rect(x1 - 2, y0, x1, y1, 'wood', 1.6)
    for y in range(y0, y1, 3):
        if r.random() < 0.55:
            gx = x0 + 3 + r.randint(0, max(1, x1 - x0 - 7))
            c.rect(gx, y, gx + r.randint(1, 3), y + 1, 'wood', 2.2)
    for _ in range(3):
        ky = r.randint(y0 + 10, y1 - 10)
        c.sprite(x0 + 3, ky, [".xx.", "xooxx", ".xx."], 'wood', {'x': 2, 'o': 1})
    for by in range(y0 + 40, y1 - 20, 80):                        # abrazaderas de hierro
        c.rect(x0, by, x1, by + 5, 'steel', 2.6); c.rect(x0, by, x1, by + 1, 'steel', 4.4)
        c.px(x0 + 2, by + 2, 'steel', 5.4); c.px(x1 - 3, by + 2, 'steel', 5.4)
    c.rect(x0 - 1, y0, x0, y1, 'ink', 0); c.rect(x1, y0, x1 + 1, y1, 'ink', 0)


def box(c, x0, y0, x1, y1, mat, lv, hl=1.5, sh=-1.5, edge=True):
    c.rect(x0, y0, x1, y1, mat, lv)
    c.rect(x0, y0, x1, y0 + 1, mat, lv + hl)
    c.rect(x0, y0, x0 + 1, y1, mat, lv + hl * 0.6)
    c.rect(x1 - 1, y0, x1, y1, mat, lv + sh)
    c.rect(x0, y1 - 1, x1, y1, mat, lv + sh)
    if edge:
        c.rect(x0 - 1, y0 - 1, x1 + 1, y0, 'ink', 0); c.rect(x0 - 1, y1, x1 + 1, y1 + 1, 'ink', 0)
        c.rect(x0 - 1, y0, x0, y1, 'ink', 0); c.rect(x1, y0, x1 + 1, y1, 'ink', 0)


def disc(c, cx, cy, r, mat, lv_fn, aspect=1.0):
    yy, xx = c.grid()
    d = np.hypot((xx - cx), (yy - cy) * aspect) / r
    m = d <= 1
    lv = lv_fn(d, xx - cx, yy - cy)
    c.mask(m, mat, np.asarray(lv, np.float32) if isinstance(lv, np.ndarray) else lv)
    return m


def ball(c, cx, cy, r, mat, base, hi=2.4, lo=-1.8):
    """Esfera con luz arriba-izquierda y brillo puntual."""
    return disc(c, cx, cy, r, mat, lambda d, dx, dy: base + hi * np.clip(-(dx + dy) / (r * 1.6), -1, 1) * (1 - d * 0.35) + lo * d ** 3 * 0.5)


def leaf(c, x, y, rows, b, ramp='leaf', flip=False):
    lv = {'o': b - 2.6, 'd': b - 1, 'm': b, 'l': b + 1, 'h': b + 2.4}
    c.sprite(int(x) - len(rows[0]) // 2, int(y) - len(rows) // 2, rows, ramp, lv, flip=flip)


def vine(c, rnd, x0, y0, length, base=5, sway=2.2, every=3, big=False):
    p0 = rnd.random() * 6
    pts = []
    for k in range(length):
        pts.append((x0 + sway * math.sin(k * 0.13 + p0), y0 + k))
    for (x, y) in pts:
        c.px(x, y, 'stem', max(0, base - 3))
    side = 1
    for i in range(2, length, every):
        x, y = pts[i]
        side = -side
        ramp = rnd.choice(['leaf', 'leaf', 'sprout', 'shade'])
        rows = rnd.choice([LEAF_A, LEAF_B, LEAF_C, LEAF_D])
        leaf(c, x + side * 3, y, rows, base + rnd.choice([0, 0, 1, -1]), ramp, flip=side < 0)
    leaf(c, pts[-1][0], pts[-1][1], LEAF_C, base + 1, 'sprout')


def mushroom(ctx, c, x, y, h, cw, seed, shine=1.0):
    """Hongo que brilla: tallo claro y sombrero cian con manchas. El brillo sube de noche."""
    for k in range(h):
        c.rect(x - 1, y - k, x + 2, y - k + 1, 'wax', 4.5 - 0.3 * (k % 2))
    c.rect(x + 1, y - h, x + 2, y, 'wax', 2.4)
    top = y - h
    yy, xx = c.grid()
    d = np.hypot((xx - x) / cw, (yy - top) / (cw * 0.62))
    cap = (d <= 1) & (yy <= top + 1)
    c.mask(cap, 'shroom', (3.4 + 1.5 * np.clip(-((xx - x) * 0.7 + (yy - top)) / cw, -1, 1) - d * 1.1).astype(np.float32))
    c.lock[cap] = True
    r = det('shroom', seed)
    for _ in range(max(2, cw // 3)):
        sx, sy = x + r.randint(-cw + 2, cw - 2), top - r.randint(0, max(1, int(cw * 0.45)))
        if 0 <= sy < c.h and 0 <= sx < c.w and c.mat[int(sy), int(sx)] == c.mid('shroom'):
            c.px(sx, sy, 'shroom', 6); c.lock[int(sy), int(sx)] = True
    k = 1.0 if ctx.night else (0.5 if ctx.dusk else 0.22)
    ctx.glows.append((x, top, cw * 2.6, '#38c8b8', 0.55 * k * shine, 1.0))
    ctx.lights.append((x, top, cw * 5, 0.9 * k * shine, 1.0))


def shaft_field(view, lit, slope, steps=260, strength=1.0):
    """Haz de luz que baja desde la ventana en diagonal (como el refugio)."""
    h, w = view.shape
    yy, xx = np.mgrid[0:h, 0:w]
    out = np.zeros((h, w), np.float32)
    for s in range(4, steps):
        sx = np.clip(np.round(xx - slope * s).astype(int), 0, w - 1)
        sy = np.clip(np.round(yy - s).astype(int), 0, h - 1)
        hit = lit[sy, sx] & (yy - s >= 0) & (out == 0)
        out[hit] = float(np.clip(1.25 - s / (steps * 1.1), 0, 1))
    return out * strength
