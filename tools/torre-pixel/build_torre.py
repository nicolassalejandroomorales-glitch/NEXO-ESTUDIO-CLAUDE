"""Mundo de la torre (docs/mundo-torre/SPEC.md): Sala de prácticas + arco + Arcade arcano.

Pixel art de verdad con el motor del refugio (tools/home-pixel/pixel.py): material + nivel por píxel, rampas compartidas.
Uso:   python tools/torre-pixel/build_torre.py
Escribe:
  dist/assets/torre/mundo.png        780x150 px de arte (la app lo amplía con image-rendering: pixelated)
  dist/assets/torre/torre.json       objetos tocables, piso y puntos animados (llamas, burbujas, pantallas)
  docs/mundo-torre/vista-previa.png  la escena x2 para revisar
"""
from pathlib import Path
import json
import math
import random
import sys
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/home-pixel'))
from pixel import Canvas, glow  # noqa: E402

OUT = ROOT / 'dist/assets/torre'
DOCS = ROOT / 'docs/mundo-torre'
H = 150
FLOOR_Y = 112
WALK = (122, 144)          # banda del piso donde camina la mascota (y de los pies)

FONT = {'P': ["xx.", "x.x", "xx.", "x..", "x.."], 'E': ["xxx", "x..", "xx.", "x..", "xxx"],
        '7': ["xxx", "..x", ".x.", ".x.", ".x."], '.': ["...", "...", "...", "...", ".x."], '0': ["xxx", "x.x", "x.x", "x.x", "xxx"]}
SMALL_FLAME = [".h.", "hwh", ".f."]
BIG_FLAME = ["..h..", ".hfh.", ".fwf.", "hfwfh", ".fff.", "..r.."]
CREATURE = ["o...o", "oxxxo", "xexex", "xxxxx", ".x.x."]          # bicho redondo con orejas (bestiario)
TROPHY = [".xxxxx.", "xxxxxxx", "x.xxx.x", ".xxxxx.", "..xxx..", "...x...", "..xxx..", ".xxxxx."]
MEDAL = ["r.r", ".r.", "ooo", "oxo", "ooo"]
HAT = ["...k...", "..kxk..", "..kxk..", ".kxxxk.", "kkkkkkk"]
BOOT_HAT = [".kkk.", "kxxxk", "kxxxk", "kkkkk"]


class Scene:
    """Helpers comunes para dibujar una sala de la torre sobre un Canvas."""

    def __init__(self, w, seed):
        self.w = w
        self.c = Canvas(w, H)
        self.c.dither = {'wall': 0.45, 'stone': 0.6, 'wood': 0.6}
        self.rnd = random.Random(seed)
        self.yy, self.xx = self.c.grid()
        self.glows = []        # (x, y, r, color, fuerza, squash)
        self.lights = []       # (x, y, radio, fuerza, squash)
        self.anim = {'flames': [], 'bubbles': [], 'screens': [], 'sparks': []}
        self.objects = []

    # ---------- primitivas con volumen ----------
    def box(self, x0, y0, x1, y1, mat, lv, hl=1.4, sh=-1.4, outline=True):
        c = self.c
        c.rect(x0, y0, x1, y1, mat, lv)
        c.rect(x0, y0, x1, y0 + 1, mat, lv + hl)
        c.rect(x0, y0, x0 + 1, y1, mat, lv + hl * 0.6)
        c.rect(x1 - 1, y0, x1, y1, mat, lv + sh)
        c.rect(x0, y1 - 1, x1, y1, mat, lv + sh)
        if outline:
            self.frame(x0 - 1, y0 - 1, x1 + 1, y1 + 1, mat, 0.2)

    def frame(self, x0, y0, x1, y1, mat, lv):
        c = self.c
        c.rect(x0, y0, x1, y0 + 1, mat, lv); c.rect(x0, y1 - 1, x1, y1, mat, lv)
        c.rect(x0, y0, x0 + 1, y1, mat, lv); c.rect(x1 - 1, y0, x1, y1, mat, lv)

    def ellipse(self, cx, cy, rx, ry, mat, lv_fn):
        d = np.hypot((self.xx - cx) / rx, (self.yy - cy) / ry)
        m = d <= 1
        self.c.mask(m, mat, lv_fn(d, self.xx - cx, self.yy - cy).astype(np.float32) if callable(lv_fn) else lv_fn)
        return m

    def text(self, x, y, s, mat, lv):
        for i, ch in enumerate(s):
            self.c.sprite(x + i * 4, y, FONT[ch], mat, {'x': lv})

    def candle(self, x, base_y, h=6):
        c = self.c
        c.rect(x, base_y - h, x + 3, base_y, 'wax', 3.5)
        c.rect(x, base_y - h, x + 1, base_y, 'wax', 5)
        c.rect(x + 2, base_y - h, x + 3, base_y, 'wax', 2)
        c.px(x + 1, base_y - h - 1, 'void', 0)
        c.sprite(x, base_y - h - 4, SMALL_FLAME, 'flame', {'h': 2, 'w': 5, 'f': 3})
        self.anim['flames'].append({'x': x, 'y': base_y - h - 4, 'k': 'small'})
        self.lights.append((x + 1, base_y - h - 3, 26, 1.3, 1.0))
        self.glows.append((x + 1, base_y - h - 3, 10, '#ffb440', 0.55, 1))

    def torch(self, x, y):
        c = self.c
        c.rect(x, y, x + 4, y + 10, 'wood', 3); c.rect(x, y, x + 1, y + 10, 'wood', 5)
        c.rect(x - 1, y, x + 5, y + 2, 'brass', 4); c.rect(x - 1, y, x + 5, y + 1, 'brass', 5.5)
        c.rect(x + 1, y + 10, x + 3, y + 13, 'brass', 2.5)
        c.sprite(x - 1, y - 6, BIG_FLAME, 'flame', {'h': 2, 'w': 5, 'f': 3, 'r': 1})
        self.anim['flames'].append({'x': x - 1, 'y': y - 6, 'k': 'big'})
        self.lights.append((x + 2, y - 2, 46, 2.0, 1.0))
        self.glows.append((x + 2, y - 3, 18, '#ffb440', 0.7, 1))

    def books(self, x, y_base, maxx, colors=('red', 'green', 'blue', 'paper', 'lav', 'clay')):
        c, rnd = self.c, self.rnd
        while True:
            w = rnd.choice([3, 4, 4, 5]); h = rnd.randint(10, 15)
            if x + w > maxx:
                break
            if rnd.random() < 0.12 and x + 6 < maxx:                      # libro inclinado / hueco
                x += 2
                continue
            col = rnd.choice(colors)
            top = y_base - h
            c.rect(x, top, x + w, y_base, col, 3)
            c.rect(x, top, x + 1, y_base, col, 4.6)
            c.rect(x + w - 1, top, x + w, y_base, col, 1.4)
            c.rect(x, top, x + w, top + 1, col, 2)
            for by in (top + 2, y_base - 3):
                c.rect(x + 1, by, x + w - 1, by + 1, 'rune', 2.6)
            x += w

    def vine(self, x0, y0, length, base=5):
        c, rnd = self.c, self.rnd
        p0 = rnd.random() * 6
        for k in range(length):
            x = x0 + 1.6 * math.sin(k * 0.18 + p0)
            c.px(x, y0 + k, 'stem', base - 3)
            if k % 3 == 1:
                side = 1 if (k // 3) % 2 else -1
                ramp = rnd.choice(['leaf', 'leaf', 'sprout', 'shade'])
                c.sprite(int(x + side * 2) - 1, y0 + k - 1, [".l.", "lml", ".d."], ramp, {'l': base + 1, 'm': base, 'd': base - 1.5})

    def plant(self, cx, base_y, w=9, h=7, leaves=5):
        c = self.c
        c.rect(cx - w // 2, base_y - h, cx + w // 2 + 1, base_y, 'clay', 3)
        c.rect(cx - w // 2, base_y - h, cx + w // 2 + 1, base_y - h + 1, 'clay', 5)
        c.rect(cx + w // 2 - 1, base_y - h + 1, cx + w // 2 + 1, base_y, 'clay', 1.8)
        for k in range(leaves):
            a = -math.pi / 2 + (k - (leaves - 1) / 2) * 0.5
            for s in range(2, 10):
                x = cx + math.cos(a) * s * 0.9
                y = base_y - h - 1 + math.sin(a) * s
                c.px(x, y, 'leaf' if k % 2 else 'sprout', 3.5 + s * 0.3)
            c.sprite(int(cx + math.cos(a) * 9) - 1, int(base_y - h - 1 + math.sin(a) * 9) - 1, [".l.", "lml", ".l."],
                     'leaf', {'l': 6.5, 'm': 5})

    def obj(self, id_, label, room, rect, stand, action, **extra):
        self.objects.append({'id': id_, 'label': label, 'room': room, 'rect': list(map(int, rect)),
                             'stand': list(map(int, stand)), 'action': action, **extra})

    # ---------- luz y salida ----------
    def finish(self, ambient=0.0, vignette=True):
        c, xx, yy = self.c, self.xx, self.yy
        if ambient:
            c.add_light(np.full((H, self.w), ambient, np.float32))
        for (x, y, r, s, sq) in self.lights:
            d = np.hypot(xx - x, (yy - y) * sq)
            c.add_light(np.clip(1 - d / r, 0, 1) ** 1.6 * s)
        if vignette:
            c.add_light(-np.clip((22 - yy) / 14, 0, 0.9) - np.clip((yy - 138) / 14, 0, 0.8))

        def post(arr):
            for g in self.glows:
                glow(arr, g[0], g[1], g[2], g[3], g[4], rings=3, squash=g[5])
        return c.render(1, post=post)


# ====================================================================== piezas compartidas
def beam(s, x0, x1):
    c = s.c
    c.rect(x0, 0, x1, 8, 'wood', 3); c.rect(x0, 0, x1, 1, 'wood', 5); c.rect(x0, 1, x1, 2, 'wood', 4)
    c.rect(x0, 7, x1, 8, 'wood', 1); c.rect(x0, 8, x1, 9, 'void', 0)
    for x in range(x0, x1):
        if (x * 7) % 23 < 9:
            c.px(x, 3 + (x // 11) % 2, 'wood', 2)


def post_wood(s, x0, x1, y0=8, y1=FLOOR_Y):
    c = s.c
    c.rect(x0, y0, x1, y1, 'wood', 3); c.rect(x0, y0, x0 + 1, y1, 'wood', 5); c.rect(x1 - 1, y0, x1, y1, 'wood', 1.5)
    for y in range(y0 + 4, y1 - 2, 11):
        c.px(x0 + 2 + (y // 11) % 2, y, 'wood', 2)


def plaster(s, x0, x1, y1=FLOOR_Y):
    c, xx, yy = s.c, s.xx, s.yy
    m = (xx >= x0) & (xx < x1) & (yy < y1)
    lv = 3 + 0.3 * np.sin(xx * 0.07 + np.sin(yy * 0.05) * 2) * np.cos(yy * 0.06 + xx * 0.01)
    c.mask(m, 'wall', lv.astype(np.float32))
    for (gx, gy, n) in [(x0 + 30, 20, 8), (x0 + (x1 - x0) * 2 // 3, 16, 6)]:
        x, y = gx, gy
        for _ in range(n):
            c.px(x, y, 'wall', 1.4); c.px(x + 1, y, 'wall', 4)
            x += s.rnd.choice([-1, 0, 1]); y += 1


def wainscot(s, x0, x1, top=88):
    c = s.c
    c.rect(x0, top, x1, top + 3, 'wood', 3); c.rect(x0, top, x1, top + 1, 'wood', 5); c.rect(x0, top + 2, x1, top + 3, 'wood', 1.5)
    c.rect(x0, top + 3, x1, FLOOR_Y - 3, 'wood', 2.6)
    n = max(1, round((x1 - x0) / 22)); pw = (x1 - x0) / n
    for k in range(n):
        a, b = int(x0 + k * pw) + 2, int(x0 + (k + 1) * pw) - 2
        c.rect(a, top + 5, b, FLOOR_Y - 5, 'wood', 3.2)
        c.rect(a, top + 5, b, top + 6, 'wood', 1.4); c.rect(a, top + 5, a + 1, FLOOR_Y - 5, 'wood', 1.4)
        c.rect(a + 1, FLOOR_Y - 6, b, FLOOR_Y - 5, 'wood', 4.6); c.rect(b - 1, top + 6, b, FLOOR_Y - 5, 'wood', 4.6)
    c.rect(x0, FLOOR_Y - 3, x1, FLOOR_Y, 'wood', 3); c.rect(x0, FLOOR_Y - 3, x1, FLOOR_Y - 2, 'wood', 5)
    c.rect(x0, FLOOR_Y - 1, x1, FLOOR_Y, 'wood', 1)


def plank_floor(s, x0, x1, vpx):
    c, xx, yy = s.c, s.xx, s.yy
    VPY = -260
    fy = (yy - VPY) / (H - VPY)
    xb = vpx + (xx - vpx) / np.maximum(fy, 1e-3)
    board = np.floor(xb / 20).astype(int)
    edge = (xb / 20) - board
    lv = 3 + ((board * 37) % 5 - 2) * 0.22
    m = (yy >= FLOOR_Y) & (xx >= x0) & (xx < x1)
    depth = np.log((yy - VPY) / (FLOOR_Y - VPY))
    jt = depth * 9 + (board * 0.37) % 1
    joint = np.abs(jt - np.round(jt)) < 0.04
    gr = (xb * 1.7 + np.sin(yy * 0.3 + board) * 3) % 9 < 0.9
    c.mask(m, 'wood', lv.astype(np.float32))
    c.mask(m & gr, 'wood', (lv - 0.6).astype(np.float32))
    c.mask(m & (edge < 0.06), 'wood', 1)
    c.mask(m & (edge > 0.06) & (edge < 0.12), 'wood', (lv + 1).astype(np.float32))
    c.mask(m & joint, 'wood', 1.2)
    c.mask(m & (yy < FLOOR_Y + 2), 'wood', 1.5)


def tile_floor(s, x0, x1, vpx):
    c, xx, yy = s.c, s.xx, s.yy
    VPY = -200
    fy = (yy - VPY) / (H - VPY)
    xb = vpx + (xx - vpx) / np.maximum(fy, 1e-3)
    depth = np.log((yy - VPY) / (FLOOR_Y - VPY))
    col = np.floor(xb / 18).astype(int)
    row = np.floor(depth * 7).astype(int)
    lv = 2.6 + ((col + row) % 2) * 0.7 + ((col * 13 + row * 7) % 5 - 2) * 0.12
    m = (yy >= FLOOR_Y) & (xx >= x0) & (xx < x1)
    c.mask(m, 'stone', lv.astype(np.float32))
    ex, ey = xb / 18 - col, depth * 7 - row
    c.mask(m & ((ex < 0.05) | (ey < 0.08)), 'stone', 1.3)
    c.mask(m & (ex > 0.05) & (ex < 0.1), 'stone', (lv + 0.9).astype(np.float32))
    c.mask(m & (yy < FLOOR_Y + 2), 'stone', 1.2)


def stone_wall(s, x0, x1, y1=FLOOR_Y, base=2.4):
    c, xx, yy = s.c, s.xx, s.yy
    m = (xx >= x0) & (xx < x1) & (yy < y1)
    row = np.floor(yy / 6).astype(int)
    col = np.floor((xx + (row % 2) * 6) / 12).astype(int)
    lv = base + ((row * 7 + col * 13) % 5 - 2) * 0.22
    lu, lx = yy % 6, (xx + (row % 2) * 6) % 12
    c.mask(m, 'stone', lv.astype(np.float32))
    c.mask(m & (lu == 0), 'stone', (lv + 0.8).astype(np.float32))
    c.mask(m & ((lu == 5) | (lx == 11)), 'stone', base - 1.2)
    moss = m & (lu == 5) & (np.sin(xx * 3.1 + yy) > 0.85) & (yy > 70)
    c.mask(moss, 'shade', 3)


def rug(s, x0, x1, y0, y1, mat, border='rune'):
    c = s.c
    for y in range(y0, y1):
        k = (y - y0) / max(1, (y1 - y0))
        a, b = x0 - 10 * k, x1 + 10 * k
        c.rect(a, y, b, y + 1, mat, 2.6)
        if y in (y0, y0 + 1, y1 - 2, y1 - 1):
            c.rect(a, y, b, y + 1, border, 2.4)
        c.rect(a, y, a + 2, y + 1, border, 2.4); c.rect(b - 2, y, b, y + 1, border, 2.4)
        if y0 + 4 <= y < y1 - 4:
            c.rect(a + 4, y, a + 5, y + 1, border, 2); c.rect(b - 5, y, b - 4, y + 1, border, 2)
        if y in (y0 + 4, y1 - 5):
            c.rect(a + 4, y, b - 4, y + 1, border, 2)
    for x in range(int(x0 - 8), int(x1 + 9), 3):
        c.px(x, y1, 'paper', 3); c.px(x, y1 + 1, 'paper', 2.4)


def round_window(s, cx, cy, r, sky_lv=3.0):
    c, xx, yy = s.c, s.xx, s.yy
    d = np.hypot(xx - cx, yy - cy)
    c.mask((d <= r + 3) & (d > r), 'wood', 4)
    c.mask((d <= r + 3) & (d > r + 2), 'wood', 1.2)
    c.mask((d <= r + 1) & (d > r) & (yy > cy), 'wood', 2.2)
    view = d <= r
    c.mask(view, 'sky', np.floor(sky_lv + np.clip((yy - (cy - r)) / (2 * r) * 3, 0, 3)).astype(np.float32))
    hill = view & (yy > cy + r * 0.35 + 2 * np.sin(xx * 0.3))
    c.mask(hill, 'hill', 3)
    c.mask(view & (yy > cy + r * 0.6 + 1.5 * np.sin(xx * 0.5 + 1)), 'tree', 2.5)
    c.mask(view & (np.abs(xx - cx) < 1), 'wood', 2.6)
    c.mask(view & (np.abs(yy - cy) < 1), 'wood', 2.6)
    s.lights.append((cx, cy + 10, 60, 1.2, 0.9))
    s.glows.append((cx, cy, r + 10, '#fff6dc', 0.25, 1))
    return view


# ====================================================================== MUNDO: prácticas + arco + arcade
def build_world():
    W = 780
    s = Scene(W, 11)
    c, xx, yy = s.c, s.xx, s.yy
    ROOM1, ARCH0, ARCH1 = (0, 360), 360, 420

    # ---------------- pared y piso
    plaster(s, 0, ARCH0)
    wainscot(s, 0, ARCH0)
    stone_wall(s, ARCH1, W)
    plank_floor(s, 0, 390, 180)
    tile_floor(s, 390, W, 600)
    beam(s, 0, W)
    for (a, b) in [(0, 5), (148, 153), (226, 231)]:
        post_wood(s, a, b)

    # ---------------- SALA DE PRÁCTICAS ----------------
    # 1) Estante de temas (Tema)
    X0, X1, Y0 = 8, 64, 30
    s.box(X0, Y0, X1, FLOOR_Y, 'wood', 3)
    c.rect(X0 + 3, Y0 + 3, X1 - 3, FLOOR_Y - 2, 'wood', 1.2)
    for sy in (52, 74, 96):
        s.books(X0 + 4, sy, X1 - 4)
        c.rect(X0 + 2, sy, X1 - 2, sy + 3, 'wood', 4); c.rect(X0 + 2, sy, X1 - 2, sy + 1, 'wood', 6)
    s.books(X0 + 4, FLOOR_Y - 3, X1 - 20)
    c.rect(X1 - 18, FLOOR_Y - 9, X1 - 5, FLOOR_Y - 3, 'paper', 3); c.rect(X1 - 18, FLOOR_Y - 9, X1 - 5, FLOOR_Y - 8, 'paper', 5)
    s.plant(X0 + 12, Y0 - 1, 9, 6)
    c.rect(X1 - 16, Y0 - 9, X1 - 9, Y0, 'glass', 2.4); c.rect(X1 - 15, Y0 - 6, X1 - 10, Y0 - 1, 'arcane', 3.8)
    c.rect(X1 - 14, Y0 - 12, X1 - 11, Y0 - 9, 'wood', 5)
    s.glows.append((X1 - 12, Y0 - 4, 8, '#9060dc', 0.35, 1))
    s.obj('topic', 'Estante de temas', 'train', (X0, Y0 - 12, X1, FLOOR_Y), (36, 124), 'mode', mode='topic',
          say='Elige un tema del estante')

    # 2) Pizarra del curso (Curso completo)
    BX0, BX1, BY0, BY1 = 74, 144, 22, 70
    s.box(BX0, BY0, BX1, BY1, 'wood', 4)
    c.rect(BX0 + 3, BY0 + 3, BX1 - 3, BY1 - 3, 'green', 1.3)
    c.lvl[(yy >= BY0 + 3) & (yy < BY1 - 3) & (xx >= BX0 + 3) & (xx < BX1 - 3)] += (0.25 * np.sin(xx * 0.2 + yy * 0.1))[
        (yy >= BY0 + 3) & (yy < BY1 - 3) & (xx >= BX0 + 3) & (xx < BX1 - 3)]
    nodes = [(84, 60), (96, 48), (110, 54), (122, 40), (134, 32)]
    for a, b in zip(nodes, nodes[1:]):
        for k in range(0, 12):
            if k % 3 != 2:
                t = k / 12
                c.px(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 'paper', 4)
    for i, (nx, ny) in enumerate(nodes):
        c.sprite(nx - 1, ny - 1, [".x.", "x.x", ".x."] if i < 4 else ["x.x", ".x.", "x.x"], 'paper' if i < 4 else 'rune',
                 {'x': 5 if i < 4 else 5})
    # amina dibujada con tiza: N con tres enlaces
    c.sprite(82, 28, ["x...x", "xx..x", "x.x.x", "x..xx", "x...x"], 'paper', {'x': 4.6})
    c.line(88, 30, 94, 27, 'paper', 3.6); c.line(88, 32, 94, 35, 'paper', 3.6); c.line(81, 30, 77, 30, 'paper', 3.6)
    c.rect(BX0 + 2, BY1, BX1 - 2, BY1 + 3, 'wood', 4); c.rect(BX0 + 2, BY1, BX1 - 2, BY1 + 1, 'wood', 6)
    c.rect(BX0 + 8, BY1 - 1, BX0 + 13, BY1, 'paper', 5); c.rect(BX0 + 16, BY1 - 1, BX0 + 19, BY1, 'red', 5)
    s.candle(BX1 - 10, BY1, 6)
    c.rect(118, FLOOR_Y - 12, 140, FLOOR_Y - 1, 'wood', 3.2)               # banquito con libros
    c.rect(118, FLOOR_Y - 12, 140, FLOOR_Y - 11, 'wood', 5)
    c.rect(120, FLOOR_Y - 1, 122, FLOOR_Y, 'wood', 1); c.rect(136, FLOOR_Y - 1, 138, FLOOR_Y, 'wood', 1)
    for i, col in enumerate(['blue', 'red']):
        c.rect(121 + i, FLOOR_Y - 15 - 3 * i, 136 - i, FLOOR_Y - 12 - 3 * i, col, 3)
        c.rect(121 + i, FLOOR_Y - 15 - 3 * i, 136 - i, FLOOR_Y - 14 - 3 * i, col, 4.5)
    s.obj('course', 'Pizarra del curso', 'train', (BX0, BY0, BX1, BY1 + 3), (108, 124), 'mode', mode='course',
          say='Todo el curso, mezclado')

    # 3) Caldero (Recomendado) con ventana redonda arriba y hierbas colgando
    round_window(s, 189, 30, 14)
    for hx in (166, 176, 202, 212):
        c.line(hx, 9, hx, 16, 'stem', 2)
        s.vine(hx, 16, 10 + (hx % 3) * 3, 4)
    CX, CY = 189, 98
    c.rect(CX - 15, FLOOR_Y - 4, CX + 16, FLOOR_Y, 'stone', 2)              # piedras del fuego
    for k in range(-14, 16, 5):
        c.sprite(CX + k - 2, FLOOR_Y - 4, [".xx.", "xxxx"], 'stone', {'x': 3.4})
    pot = s.ellipse(CX, CY, 19, 13, 'stone', lambda d, dx, dy: 1.6 + 1.4 * np.clip(-dx / 19 - dy / 26, -1, 1) - 0.8 * d)
    c.mask(pot & (np.hypot((xx - CX) / 19, (yy - CY) / 13) > 0.9), 'stone', 0.6)
    c.rect(CX - 20, CY - 12, CX + 21, CY - 8, 'stone', 3.4); c.rect(CX - 20, CY - 12, CX + 21, CY - 11, 'stone', 5)
    c.rect(CX - 20, CY - 8, CX + 21, CY - 7, 'stone', 1)
    liquid = (np.hypot((xx - CX) / 18, (yy - (CY - 12)) / 3) <= 1) & (yy <= CY - 11)
    c.mask(liquid, 'sprout', 4.2)
    c.rect(CX - 17, CY - 13, CX + 18, CY - 12, 'sprout', 5.4)
    c.lock[liquid] = True
    for bx in (CX - 9, CX + 2, CX + 11):
        c.sprite(bx, CY - 16, [".x.", "x.x", ".x."], 'sprout', {'x': 7})
        s.anim['bubbles'].append({'x': bx + 1, 'y': CY - 15})
    c.line(CX + 8, CY - 26, CX + 14, CY - 12, 'wood', 4); c.rect(CX + 6, CY - 28, CX + 9, CY - 25, 'wood', 5)
    c.sprite(CX - 5, CY + 13, BIG_FLAME, 'flame', {'h': 2, 'w': 5, 'f': 3, 'r': 1})
    s.anim['flames'].append({'x': CX - 5, 'y': CY + 13, 'k': 'big'})
    s.lights.append((CX, CY - 14, 60, 1.2, 1.0))
    s.glows.append((CX, CY - 16, 26, '#76943a', 0.6, 1.4))
    s.glows.append((CX, CY + 16, 12, '#ffb440', 0.6, 1))
    s.obj('recommended', 'Caldero: lo que más necesito', 'train', (CX - 21, 60, CX + 22, FLOOR_Y), (CX, 126), 'mode',
          mode='recommended', say='Te preparo lo que más necesitas')

    # 4) Reloj de arena sobre pedestal (Revisiones) + fases de luna
    HX = 246
    s.box(HX - 9, 92, HX + 10, FLOOR_Y, 'stone', 3.6)
    c.rect(HX - 11, 90, HX + 12, 93, 'stone', 4.6); c.rect(HX - 11, 90, HX + 12, 91, 'stone', 5.6)
    for yb in (60, 88):
        s.box(HX - 9, yb, HX + 10, yb + 3, 'brass', 3.2)
    for px_ in (HX - 8, HX + 8):
        c.rect(px_, 63, px_ + 1, 88, 'wood', 4.5)
    for y in range(63, 88):
        k = abs(y - 75.5) / 12.5
        half = 1 + 6 * k
        c.rect(HX - half + 0.5, y, HX + half + 1.5, y + 1, 'glass', 4.6 if y < 75 else 4)
        if (y > 79) or (y < 72 and y > 69):
            sand_half = half - 1 if y > 79 else max(0, half - 2)
            c.rect(HX - sand_half + 0.5, y, HX + sand_half + 1.5, y + 1, 'wall', 6)
    c.rect(HX, 72, HX + 1, 82, 'wall', 6.5)
    c.rect(HX - 6, 64, HX - 5, 72, 'glass', 6.5)
    for i, ph in enumerate([0.0, 0.25, 0.5, 0.75, 1.0]):
        mx, my = HX - 16 + i * 8, 34
        d = np.hypot(xx - mx, yy - my)
        c.mask(d <= 2.6, 'rune', 5)
        c.mask((d <= 2.6) & (xx - mx > 5 * ph - 2.6), 'blue', 1.6)
    c.line(HX - 20, 28, HX + 20, 28, 'stem', 2.4)
    s.glows.append((HX, 75, 14, '#ffe890', 0.3, 1))
    s.obj('reviews', 'Reloj de repasos', 'train', (HX - 20, 26, HX + 21, FLOOR_Y), (HX, 124), 'mode', mode='reviews',
          say='Repasos que ya tocan (memoria espaciada)')

    # 5) Repisas con frascos del bestiario (Mis errores)
    JX0, JX1 = 268, 326
    creatures = [('red', 4), ('lav', 4.5), ('blue', 4.6), ('green', 4.6), ('clay', 4.6), ('arcane', 5)]
    for row, sy in enumerate((62, 92)):
        c.rect(JX0, sy, JX1, sy + 3, 'wood', 4); c.rect(JX0, sy, JX1, sy + 1, 'wood', 6); c.rect(JX0, sy + 3, JX1, sy + 4, 'wood', 1)
        for bx in (JX0 + 2, JX1 - 5):
            c.sprite(bx, sy + 4, ["xxx", ".xx", "..x"], 'wood', {'x': 3})
        for j in range(3):
            jx = JX0 + 4 + j * 18
            jh = 18 - (j % 2) * 3
            col, lvb = creatures[row * 3 + j]
            s.box(jx, sy - jh, jx + 13, sy, 'glass', 3.0, hl=1.6, sh=-1)
            c.rect(jx + 1, sy - jh + 4, jx + 12, sy - 1, 'glass', 2.2)
            c.rect(jx + 2, sy - jh - 3, jx + 11, sy - jh, 'wood', 4.4); c.rect(jx + 2, sy - jh - 3, jx + 11, sy - jh - 2, 'wood', 6)
            c.sprite(jx + 4, sy - 7, CREATURE, col, {'o': lvb - 1.5, 'x': lvb, 'e': ('void', 0)})
            c.rect(jx + 2, sy - jh + 2, jx + 3, sy - 3, 'glass', 6.2)
            s.glows.append((jx + 6, sy - 6, 9, '#b88cf4' if col in ('lav', 'arcane') else '#5cc4dc', 0.25, 1))
    c.rect(JX0 + 6, 70, JX1 - 6, 72, 'paper', 4)                           # etiqueta "bestiario"
    s.obj('errors', 'Frascos del bestiario', 'train', (JX0, 38, JX1, 96), (297, 124), 'mode', mode='errors',
          say='Tus errores capturados en frascos')

    # lámpara colgante sobre los frascos
    c.line(298, 9, 298, 20, 'stem', 2)
    s.box(294, 20, 303, 30, 'brass', 3.4)
    c.rect(296, 23, 301, 28, 'glow', 4.6)
    s.lights.append((298, 26, 60, 1.6, 1.0)); s.glows.append((298, 26, 16, '#ffd270', 0.55, 1))

    # 6) Estandarte PEP + cofre (Nivel PEP)
    PX0, PX1 = 334, 354
    c.rect(PX0 - 2, 12, PX1 + 2, 15, 'wood', 5); c.rect(PX0 - 2, 12, PX1 + 2, 13, 'wood', 6.5)
    c.rect(PX0, 15, PX1, 60, 'red', 3)
    c.rect(PX0, 15, PX0 + 1, 60, 'red', 4.4); c.rect(PX1 - 1, 15, PX1, 60, 'red', 1.6)
    for y in range(15, 60):
        c.lvl[y, PX0:PX1] += 0.4 * math.sin(y * 0.4)
    for k in range(0, 6):
        c.rect(PX0 + k * 4, 60, PX0 + k * 4 + 2, 64 - (k % 2) * 2, 'red', 2.4)
    c.rect(PX0 + 2, 17, PX1 - 2, 18, 'rune', 4); c.rect(PX0 + 2, 57, PX1 - 2, 58, 'rune', 4)
    for i, ch in enumerate('PEP'):
        c.sprite(PX0 + 8, 22 + i * 7, FONT[ch], 'rune', {'x': 5.4})
    c.sprite(PX0 + 6, 46, ["..x..", ".xxx.", "xxxxx", ".x.x."], 'rune', {'x': 4.6})   # estrella/corona
    s.box(PX0 - 2, 98, PX1 + 4, FLOOR_Y, 'wood', 3.4)
    c.rect(PX0 - 2, 96, PX1 + 4, 100, 'wood', 4.4); c.rect(PX0 - 2, 96, PX1 + 4, 97, 'wood', 6)
    for bx in (PX0 + 1, PX1 - 1):
        c.rect(bx, 96, bx + 2, FLOOR_Y, 'brass', 4)
    c.rect(PX0 + 8, 101, PX0 + 13, 106, 'brass', 5); c.px(PX0 + 10, 103, 'void', 0)
    s.obj('pep', 'Estandarte de la PEP', 'train', (PX0 - 3, 12, PX1 + 5, FLOOR_Y), (344, 126), 'mode', mode='pep',
          say='Preguntas nivel PEP')

    # ---------------- ARCO entre salas ----------------
    stone_wall(s, ARCH0, ARCH1, base=3.0)
    AX0, AX1, ATOP = 372, 408, 40
    cx_a = (AX0 + AX1) / 2
    r_a = (AX1 - AX0) / 2
    opening = (xx >= AX0) & (xx < AX1) & (yy < FLOOR_Y) & ((yy >= ATOP) | (np.hypot(xx - cx_a, (yy - ATOP) * 1.1) <= r_a))
    c.mask(opening, 'stone', np.clip(0.6 + (yy - 20) / 70, 0.4, 1.9).astype(np.float32))
    ring = (~opening) & (np.hypot(xx - cx_a, (yy - ATOP) * 1.1) <= r_a + 4) & (yy < ATOP + 1) & (xx >= AX0 - 4) & (xx < AX1 + 4)
    c.mask(ring, 'stone', 4.4)
    for k in range(9):
        a = math.pi + k * math.pi / 8
        c.px(cx_a + (r_a + 2) * math.cos(a), ATOP + (r_a + 2) * math.sin(a) / 1.1, 'stone', 1.4)
    c.rect(AX0 - 4, ATOP, AX0, FLOOR_Y, 'stone', 4.2); c.rect(AX1, ATOP, AX1 + 4, FLOOR_Y, 'stone', 3.4)
    c.rect(AX0 - 4, ATOP, AX0 - 3, FLOOR_Y, 'stone', 5.4); c.rect(AX1 + 3, ATOP, AX1 + 4, FLOOR_Y, 'stone', 2)
    c.mask(opening & (yy >= FLOOR_Y - 6), 'stone', 2.2)
    for k in range(3):                                                      # escalones hacia el arcade
        c.rect(AX0 + 4 + k * 10, FLOOR_Y - 2 - k * 2, AX1, FLOOR_Y - 1 - k * 2, 'stone', 3.6 + k * 0.4)
    s.torch(AX0 + 16, 64)
    # cartel colgante: matraz | dado
    c.line(378, 9, 378, 16, 'stem', 2); c.line(402, 9, 402, 16, 'stem', 2)
    s.box(374, 16, 407, 27, 'wood', 4.6)
    c.sprite(378, 18, [".x.", ".x.", "xxx", "xxx", ".x."], 'crystal', {'x': 5})
    c.sprite(387, 20, ["xx.", ".xx"], 'wood', {'x': 1.6}); c.sprite(392, 20, [".xx", "xx."], 'wood', {'x': 1.6})
    c.sprite(398, 18, ["xxxx", "x.xx", "xxxx", "xx.x"], 'paper', {'x': 5.4})
    s.obj('toGames', 'Ir al Arcade arcano', 'train', (AX0, 16, AX1, FLOOR_Y), (404, 126), 'go', route='games',
          say='¡Vamos al Arcade!')
    s.obj('toTrain', 'Volver a la Sala de prácticas', 'games', (AX0, 16, AX1, FLOOR_Y), (376, 126), 'go', route='train',
          say='De vuelta a practicar')

    # ---------------- ARCADE ARCANO ----------------
    # guirnalda de farolitos
    for x in range(ARCH1 + 2, W - 2):
        y = 15 + 3.5 * math.sin((x - ARCH1) * 0.05) ** 2
        c.px(x, y, 'stem', 2)
        if (x - ARCH1) % 14 == 7:
            col = ['crystal', 'rune', 'arcane', 'flame'][((x - ARCH1) // 14) % 4]
            c.sprite(x - 1, int(y) + 1, ["xx", "xx", ".x"][:2], col, {'x': 5})
            s.glows.append((x, y + 2, 6, {'crystal': '#5cc4dc', 'rune': '#ffd860', 'arcane': '#b88cf4', 'flame': '#ffb440'}[col], 0.4, 1))
            s.anim['sparks'].append({'x': x, 'y': int(y) + 1, 'c': col})
    rug(s, 440, 760, 120, 138, 'lav')

    def cabinet(x0, id_, label, screen, marquee, say):
        x1 = x0 + 38
        s.box(x0, 46, x1, FLOOR_Y, 'wood', 3.0)
        c.rect(x0 + 1, 47, x0 + 3, FLOOR_Y - 1, 'arcane', 3.4)                  # franjas laterales
        c.rect(x1 - 3, 47, x1 - 1, FLOOR_Y - 1, 'arcane', 2.2)
        s.box(x0 + 3, 48, x1 - 3, 58, marquee, 4.6, hl=1.2, sh=-1.6)              # marquesina iluminada
        c.rect(x0 + 6, 52, x1 - 6, 54, marquee, 6)
        s.glows.append(((x0 + x1) / 2, 53, 16, {'rune': '#ffd860', 'crystal': '#5cc4dc', 'arcane': '#b88cf4', 'red': '#d87052'}[marquee], 0.45, 1.6))
        c.rect(x0 + 4, 60, x1 - 4, 84, 'void', 0)                                  # pantalla
        c.rect(x0 + 6, 62, x1 - 6, 82, 'blue', 1)
        screen(x0 + 6, 62)
        for yl in range(62, 82, 2):
            c.lvl[yl, x0 + 6:x1 - 6] -= 0.35
        s.anim['screens'].append({'x0': x0 + 6, 'y0': 62, 'x1': x1 - 6, 'y1': 82})
        s.lights.append(((x0 + x1) / 2, 74, 34, 1.0, 1.0))
        s.glows.append(((x0 + x1) / 2, 72, 18, '#5cc4dc', 0.35, 1))
        c.rect(x0 + 2, 86, x1 - 2, 94, 'wood', 4.2); c.rect(x0 + 2, 86, x1 - 2, 87, 'wood', 6)
        c.rect(x0 + 8, 82, x0 + 10, 89, 'stone', 1)
        c.sprite(x0 + 6, 80, [".xx.", "xxxx", "xxxx", ".xx."], 'red', {'x': 4.6})   # palanca
        c.px(x0 + 7, 81, 'red', 5.8)
        for k, col in enumerate(['crystal', 'rune']):
            c.sprite(x0 + 20 + k * 6, 88, ["xx", "xx"], col, {'x': 5})
        c.rect(x0 + 15, 100, x0 + 23, 106, 'brass', 3); c.rect(x0 + 18, 101, x0 + 20, 105, 'void', 0)
        s.obj(id_, label, 'games', (x0, 46, x1, FLOOR_Y), ((x0 + x1) // 2, 124), 'game', game=id_, say=say)

    def scr_memory(x, y):
        for j in range(2):
            for i in range(3):
                flip = (i, j) == (1, 0)
                c.rect(x + 2 + i * 8, y + 3 + j * 9, x + 8 + i * 8, y + 10 + j * 9, 'paper' if flip else 'arcane', 4.6 if flip else 3.2)
                c.px(x + 4 + i * 8, y + 5 + j * 9, 'arcane' if flip else 'arcane', 5.6 if not flip else 3)
        c.sprite(x + 11, y + 5, [".x.", "xxx", ".x."], 'red', {'x': 4.6})

    def scr_hunter(x, y):
        c.sprite(x + 9, y + 6, CREATURE, 'red', {'o': 3, 'x': 4.6, 'e': ('void', 0)})
        d = np.hypot(xx - (x + 11), yy - (y + 8))
        c.mask((np.abs(d - 7) < 0.6) & (xx >= x) & (xx < x + 26) & (yy >= y) & (yy < y + 20), 'crystal', 6)
        c.rect(x + 11, y + 1, x + 12, y + 4, 'crystal', 6); c.rect(x + 11, y + 13, x + 12, y + 16, 'crystal', 6)
        c.rect(x + 3, y + 8, x + 6, y + 9, 'crystal', 6); c.rect(x + 17, y + 8, x + 20, y + 9, 'crystal', 6)

    def scr_blitz(x, y):
        c.sprite(x + 8, y + 2, ["...xx", "..xx.", ".xx..", "xxxxx", "..xx.", ".xx..", "xx...", "x...."], 'rune', {'x': 6})
        c.rect(x + 2, y + 16, x + 24, y + 18, 'blue', 2.4); c.rect(x + 2, y + 16, x + 16, y + 18, 'crystal', 5.4)

    cabinet(430, 'memory', 'Memory Lab', scr_memory, 'arcane', 'Memory Lab: próximamente')
    cabinet(478, 'hunter', 'Error Hunter', scr_hunter, 'red', 'Error Hunter: próximamente')
    cabinet(526, 'blitz', 'Blitz', scr_blitz, 'rune', 'Blitz: próximamente')

    # Portal de la campaña (Camino a la PEP 1 / Boss Arena)
    PCX, PTOP = 628, 34
    prx = 26
    outer = (np.hypot((xx - PCX) / (prx + 7), (yy - (PTOP + prx)) / (prx + 7)) <= 1) | (
        (np.abs(xx - PCX) <= prx + 7) & (yy >= PTOP + prx) & (yy < FLOOR_Y))
    inner = (np.hypot((xx - PCX) / prx, (yy - (PTOP + prx)) / prx) <= 1) | ((np.abs(xx - PCX) <= prx) & (yy >= PTOP + prx) & (yy < FLOOR_Y))
    blk_r = np.floor(yy / 7).astype(int)
    c.mask(outer & ~inner, 'stone', (4 + ((blk_r * 5 + np.floor(xx / 9).astype(int) * 3) % 3) * 0.4).astype(np.float32))
    c.mask(outer & ~inner & (yy % 7 == 0), 'stone', 2)
    dc = np.hypot(xx - PCX, (yy - (PTOP + prx + 14)) * 0.85)
    swirl = np.sin(dc * 0.55 - np.arctan2(yy - (PTOP + prx + 14), xx - PCX) * 2)
    c.mask(inner, 'arcane', np.clip(1.2 + (1 - dc / 50) * 4 + swirl * 0.9, 0.5, 7).astype(np.float32))
    c.mask(inner & (dc < 6), 'arcane', 7)
    c.mask(inner & (yy >= FLOOR_Y - 3), 'arcane', 2)
    c.rect(PCX - prx - 9, FLOOR_Y - 4, PCX + prx + 10, FLOOR_Y, 'stone', 4.4)
    c.rect(PCX - prx - 9, FLOOR_Y - 4, PCX + prx + 10, FLOOR_Y - 3, 'stone', 5.6)
    # corona (jefe) sobre el portal
    c.sprite(PCX - 7, PTOP - 12, ["x..x..x..x", "xx.xx.xx.x", "xxxxxxxxxx", "xrxxbxxrxx", "xxxxxxxxxx"], 'rune',
             {'x': 5, 'r': ('red', 5), 'b': ('crystal', 6)})
    s.glows.append((PCX, PTOP + prx + 14, 52, '#9060dc', 0.9, 0.9))
    s.lights.append((PCX, PTOP + prx + 18, 90, 1.8, 0.9))
    s.anim['portal'] = {'cx': PCX, 'cy': PTOP + prx + 14, 'r': prx}
    s.torch(PCX - prx - 18, 60)
    s.torch(PCX + prx + 14, 60)
    s.obj('campaign', 'Portal: Camino a la PEP 1', 'games', (PCX - prx - 8, PTOP - 12, PCX + prx + 9, FLOOR_Y), (PCX, 124),
          'game', game='campaign', say='¡Al Camino a la PEP 1!')

    # Rincón: mesa redonda con dados y cartas + tablero de puntajes
    TX = 726
    c.rect(TX - 22, 22, TX + 23, 58, 'wood', 4); s.frame(TX - 23, 21, TX + 24, 59, 'wood', 1)
    c.rect(TX - 19, 25, TX + 20, 55, 'void', 0)
    c.rect(TX - 18, 26, TX + 19, 54, 'green', 1.4)
    for i, w_ in enumerate([30, 22, 15]):
        y = 30 + i * 8
        c.rect(TX - 16, y, TX - 15, y + 5, 'rune', 5.4 - i)
        c.rect(TX - 12, y + 2, TX - 12 + w_, y + 3, 'paper', 4.6 - i * 0.6)
    c.sprite(TX + 12, 28, [".x.", "xxx", ".x."], 'rune', {'x': 6})
    c.rect(TX - 24, 98, TX + 25, 101, 'wood', 5); c.rect(TX - 24, 98, TX + 25, 99, 'wood', 6.6)
    c.rect(TX - 2, 101, TX + 3, FLOOR_Y, 'wood', 3); c.rect(TX - 10, FLOOR_Y - 2, TX + 11, FLOOR_Y, 'wood', 2.2)
    c.sprite(TX - 14, 93, ["xxxx", "xbxx", "xxbx", "xxxx"], 'paper', {'x': 5.6, 'b': ('void', 0)})
    c.sprite(TX - 6, 94, ["xxx", "xbx", "xxx"], 'red', {'x': 4.6, 'b': ('paper', 5)})
    for k in range(3):
        c.rect(TX + 4 + k * 3, 96 - k, TX + 10 + k * 3, 98 - k, ['paper', 'lav', 'paper'][k], 5 - k * 0.5)
    s.candle(TX + 17, 98, 5)
    s.plant(W - 10, FLOOR_Y, 11, 9, 6)
    s.plant(ARCH1 + 9, FLOOR_Y, 9, 7, 5)

    # sombras de contacto
    for (a, b) in [(8, 64), (118, 140), (168, 212), (237, 256), (332, 358), (430, 468), (478, 516), (526, 564), (700, 752)]:
        m = (xx >= a - 2) & (xx < b + 2) & (yy >= FLOOR_Y) & (yy < FLOOR_Y + 5)
        c.add_light(np.where(m, -1.2, 0))
    # la sala de prácticas es cálida; el arcade más oscuro, iluminado por pantallas y antorchas
    c.add_light(np.where(xx >= ARCH1, -1.1, 0.2).astype(np.float32))
    img = s.finish()
    meta = {'w': W, 'h': H, 'floor': FLOOR_Y, 'walk': WALK,
            'rooms': {'train': {'x0': 0, 'x1': 390, 'home': [180, 132], 'door': [404, 126]},
                      'games': {'x0': 390, 'x1': W, 'home': [600, 132], 'door': [376, 126]}},
            'objects': s.objects, 'anim': s.anim}
    return img, meta


# ====================================================================== HABITACIÓN DEL PERFIL
if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True); DOCS.mkdir(parents=True, exist_ok=True)
    world, wmeta = build_world()
    world.save(OUT / 'mundo.png', optimize=True)
    (OUT / 'torre.json').write_text(json.dumps({'mundo': wmeta}, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    world.resize((780 * 2, H * 2), Image.NEAREST).save(DOCS / 'vista-previa.png')
    print('ok', len(wmeta['objects']), 'objetos en el mundo')
