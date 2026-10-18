"""Ilustraciones pixel del tráiler (arte propio, 180x320 de arte; se agranda x6 al componer).
Escritorio con la PEP, calendario que se ordena solo, Amina salvaje y cartas, funciones de la app y el Gólem de la PEP.
Rampas de tools/home-pixel/pixel.py; todo se dibuja con código según el tiempo t."""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'home-pixel'))
import pixel as px  # noqa: E402
from letras import STONE, hexes, line_mask  # noqa: E402

AW, AH = 180, 320
BAY = px.BAYER
R = {k: v for k, v in px.RAMPS.items()}
R.update({
    'crypt': STONE,
    'ink': hexes('#120c10', '#2a1e22', '#4a3634', '#6a5248'),
    'redink': hexes('#4a0a12', '#7c1220', '#b81c2a', '#e8343c', '#ff7068', '#ffb0a0'),
    'pink': hexes('#3e141e', '#64202a', '#a8406a', '#d8669a', '#f49ac0', '#ffd0e4'),
    'silver': hexes('#141a26', '#2c3446', '#4c586e', '#76849c', '#a8b6c8', '#d8e2ee', '#ffffff'),
    'bronze': hexes('#22100a', '#44220e', '#6c3c18', '#9a5c26', '#c4803a', '#e4a860', '#ffd8a0'),
    'ember': hexes('#3a0a0c', '#6a1212', '#a8201a', '#dc4420', '#f8802c', '#ffc050', '#fff0a0'),
    'night': hexes('#05070f', '#0a1020', '#121c34', '#1c2a4a', '#2a3c62'),
    'white': hexes('#4a5868', '#8a9aac', '#c8d4e0', '#f4f8fc', '#ffffff'),
})

# letra mini 3x5 para etiquetas (cartas, notas, rótulos)
T3 = {
    'A': '.#.|#.#|###|#.#|#.#', 'B': '##.|#.#|##.|#.#|##.', 'C': '.##|#..|#..|#..|.##', 'D': '##.|#.#|#.#|#.#|##.',
    'E': '###|#..|##.|#..|###', 'F': '###|#..|##.|#..|#..', 'G': '.##|#..|#.#|#.#|.##', 'H': '#.#|#.#|###|#.#|#.#',
    'I': '###|.#.|.#.|.#.|###', 'J': '..#|..#|..#|#.#|.#.', 'K': '#.#|#.#|##.|#.#|#.#', 'L': '#..|#..|#..|#..|###',
    'M': '#.#|###|###|#.#|#.#', 'N': '##.|#.#|#.#|#.#|#.#', 'O': '.#.|#.#|#.#|#.#|.#.', 'P': '##.|#.#|##.|#..|#..',
    'Q': '.#.|#.#|#.#|##.|.##', 'R': '##.|#.#|##.|#.#|#.#', 'S': '.##|#..|.#.|..#|##.', 'T': '###|.#.|.#.|.#.|.#.',
    'U': '#.#|#.#|#.#|#.#|###', 'V': '#.#|#.#|#.#|#.#|.#.', 'W': '#.#|#.#|###|###|#.#', 'X': '#.#|#.#|.#.|#.#|#.#',
    'Y': '#.#|#.#|.#.|.#.|.#.', 'Z': '###|..#|.#.|#..|###', '0': '###|#.#|#.#|#.#|###', '1': '.#.|##.|.#.|.#.|###',
    '2': '##.|..#|.#.|#..|###', '3': '##.|..#|.#.|..#|##.', '4': '#.#|#.#|###|..#|..#', '5': '###|#..|##.|..#|##.',
    '6': '.##|#..|###|#.#|###', '7': '###|..#|.#.|.#.|.#.', '8': '###|#.#|###|#.#|###', '9': '###|#.#|###|..#|##.',
    '-': '...|...|###|...|...', '+': '...|.#.|###|.#.|...', ',': '.|.|.|#|#', '.': '.|.|.|.|#', ':': '.|#|.|#|.',
    '!': '#|#|#|.|#', ' ': '..|..|..|..|..', '=': '...|###|...|###|...', '|': '#|#|#|#|#',
}


def tiny_mask(text):
    parts = []
    for i, ch in enumerate(text):
        if i:
            parts.append(np.zeros((5, 1), bool))
        parts.append(np.array([[c == '#' for c in r] for r in T3[ch].split('|')]))
    return np.concatenate(parts, axis=1)


def ease(u):
    u = min(1.0, max(0.0, u))
    return u * u * (3 - 2 * u)


def hsh(x, y, s=0):
    v = np.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453
    return v - np.floor(v)


class Art:
    """Lienzo de arte con transparencia; se pinta con rampas (nivel 0 = más oscuro)."""

    def __init__(self, w=AW, h=AH):
        self.w, self.h = w, h
        self.rgb = np.zeros((h, w, 3), np.float32)
        self.a = np.zeros((h, w), np.float32)
        self.yy, self.xx = np.mgrid[0:h, 0:w].astype(np.float32)
        self.bay = BAY[self.yy.astype(int) % 4, self.xx.astype(int) % 4]

    def paint(self, m, ramp, lvl, dither=0.0, alpha=1.0):
        r = np.array(R[ramp], np.float32)
        lv = lvl if np.ndim(lvl) else np.full((self.h, self.w), float(lvl), np.float32)
        if dither:
            lv = lv + self.bay * dither
        idx = np.clip(np.floor(lv + 0.5), 0, len(r) - 1).astype(int)
        self.rgb[m] = r[idx[m]]
        self.a[m] = alpha

    def ell(self, cx, cy, rx, ry=None):
        ry = rx if ry is None else ry
        return ((self.xx - cx) / rx) ** 2 + ((self.yy - cy) / ry) ** 2 <= 1.0

    def box(self, x0, y0, x1, y1):
        return (self.xx >= x0) & (self.xx < x1) & (self.yy >= y0) & (self.yy < y1)

    def rbox(self, x0, y0, x1, y1, r):
        cx, cy = np.clip(self.xx, x0 + r, x1 - 1 - r), np.clip(self.yy, y0 + r, y1 - 1 - r)
        return self.box(x0, y0, x1, y1) & (np.hypot(self.xx - cx, self.yy - cy) <= r + 0.3)

    def poly(self, pts):
        im = Image.new('L', (self.w, self.h))
        ImageDraw.Draw(im).polygon([tuple(map(float, p)) for p in pts], fill=255)
        return np.asarray(im) > 0

    def line(self, pts, width=1):
        im = Image.new('L', (self.w, self.h))
        ImageDraw.Draw(im).line([tuple(map(float, p)) for p in pts], fill=255, width=width)
        return np.asarray(im) > 0

    def blit(self, other, x, y):
        """Pega otro lienzo (con su transparencia) en (x, y)."""
        x, y = int(round(x)), int(round(y))
        x0, y0, x1, y1 = max(0, x), max(0, y), min(self.w, x + other.w), min(self.h, y + other.h)
        if x1 <= x0 or y1 <= y0:
            return
        m = other.a[y0 - y:y1 - y, x0 - x:x1 - x] > 0
        self.rgb[y0:y1, x0:x1][m] = other.rgb[y0 - y:y1 - y, x0 - x:x1 - x][m]
        self.a[y0:y1, x0:x1][m] = 1

    def place(self, small, x, y):
        m = np.zeros((self.h, self.w), bool)
        x, y = int(round(x)), int(round(y))
        h, w = small.shape
        x0, y0, x1, y1 = max(0, x), max(0, y), min(self.w, x + w), min(self.h, y + h)
        if x1 > x0 and y1 > y0:
            m[y0:y1, x0:x1] = small[y0 - y:y1 - y, x0 - x:x1 - x]
        return m

    def text(self, txt, x, y, ramp, lvl, tiny=False, k=1, center=True):
        m = tiny_mask(txt) if tiny else line_mask(txt)
        if k > 1:
            m = np.kron(m, np.ones((k, k), bool))
        if center:
            x -= m.shape[1] / 2
        self.paint(self.place(m, x, y), ramp, lvl)
        return m.shape[1]

    def sphere(self, cx, cy, r, ramp, lx=-0.55, ly=-0.7, extra=0.0, spec=True, rim=True, m=None):
        m = self.ell(cx, cy, r) if m is None else m
        nx, ny = (self.xx - cx) / r, (self.yy - cy) / r
        nz = np.sqrt(np.clip(1 - nx * nx - ny * ny, 0, 1))
        d = np.clip(-(nx * lx + ny * ly) * 0.8 + nz * 0.45, 0, 1)
        n = len(R[ramp])
        self.paint(m, ramp, 0.8 + (n - 2.4) * d + extra, dither=0.6)
        if rim:
            self.paint(m & ~self.ell(cx, cy, r - 1.0), ramp, 0.4 + extra * 0.5)
        if spec and r >= 3:
            self.paint(m & self.ell(cx - r * 0.38, cy - r * 0.42, max(1.0, r * 0.2)), ramp, n - 1)

    def outline(self, ramp='void', lvl=0):
        a = self.a > 0
        p = np.pad(a, 1)
        near = p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]
        self.paint(near & ~a, ramp, lvl)

    def glow(self, cx, cy, r, color, strength=1.0, rings=4):
        px.glow(self.rgb, cx, cy, r, color, strength, rings)

    def image(self):
        rgba = np.dstack([np.clip(self.rgb, 0, 255), self.a * 255]).astype(np.uint8)
        return Image.fromarray(rgba, 'RGBA')

    def rgb_image(self):
        return Image.fromarray(np.clip(self.rgb, 0, 255).astype(np.uint8), 'RGB')


# ——— 1. El escritorio de noche con la PEP ———
def escena_examen(t, stamp_t=3.6):
    c = Art()
    yy, xx = c.yy, c.xx
    fl = 0.25 * math.sin(t * 13) + 0.15 * math.sin(t * 29 + 1)
    light = 3.2 * np.clip(1 - np.hypot(xx - 160, (yy - 180) * 1.1) / (170 + 8 * fl), 0, 1) ** 1.5
    moon = 1.3 * np.clip(1 - np.hypot(xx - 40, yy - 50) / 80, 0, 1) ** 2
    # muro de piedra
    row = np.floor(yy / 9)
    brick = ((xx + (row % 2) * 9) % 18 < 1) | (yy % 9 < 1)
    wall = yy < 140
    c.paint(wall, 'stone', 0.4 + light * 0.9 + moon * 0.5 + (hsh(np.floor((xx + (row % 2) * 9) / 18), row) - 0.5) * 0.8, dither=0.6)
    c.paint(wall & brick, 'stone', 0.1 + light * 0.6)
    # ventana con luna
    c.paint(c.box(14, 18, 70, 96), 'wood', 1.2 + light * 0.4)
    sky = c.box(18, 22, 66, 92)
    c.paint(sky, 'night', 1 + (92 - yy) / 40, dither=0.8)
    c.paint(sky & (hsh(xx, yy, 3) > 0.985), 'white', 3)
    c.sphere(50, 40, 8, 'petal', lx=0.6, ly=-0.3)
    c.paint(c.box(41, 22, 43, 92) | c.box(18, 55, 66, 57), 'wood', 1.5 + light * 0.4)
    # reloj: 3:47
    c.sphere(136, 48, 15, 'brass', extra=0.6)
    c.paint(c.ell(136, 48, 12), 'paper', 2.5 + light * 0.5)
    for i in range(12):
        a_ = i / 12 * math.tau
        c.paint(c.box(136 + 10 * math.sin(a_), 48 - 10 * math.cos(a_), 137 + 10 * math.sin(a_), 49 - 10 * math.cos(a_)), 'ink', 1)
    for frac, ln in (((3 + 47 / 60) / 12, 6), (47 / 60 + t / 600, 10)):
        a_ = frac * math.tau
        c.paint(c.line([(136, 48), (136 + ln * math.sin(a_), 48 - ln * math.cos(a_))]), 'ink', 0)
    # escritorio
    desk = yy >= 140
    c.paint(desk, 'wood', 1.0 + light * 1.4 + (hsh(np.floor(xx / 40), np.floor((yy - 140) / 24)) - 0.5) * 0.6, dither=0.5)
    c.paint(desk & ((yy - 140) % 24 < 1), 'wood', 0.3 + light * 0.8)
    c.paint(c.box(0, 140, AW, 143), 'wood', 2.5 + light * 1.2)
    # la PEP
    c.paint(c.box(26, 158, 148, 318), 'ink', 0)
    c.paint(c.box(22, 154, 144, 314), 'paper', 2.6 + light * 0.9, dither=0.3)
    c.text('PEP 1', 30, 162, 'ink', 1, center=False)
    c.text('QUIMICA ORGANICA II', 30, 172, 'ink', 2, tiny=True, center=False)
    c.paint(c.box(30, 180, 136, 181), 'ink', 2)
    rng = np.random.default_rng(4)
    for i, y in enumerate(range(188, 306, 13)):
        c.text(f'{i + 1}.', 28, y, 'ink', 1, tiny=True, center=False)
        for yl in (y + 2, y + 7):
            x = 36
            while x < 124:
                w = int(rng.integers(4, 14))
                c.paint(c.box(x, yl, min(124, x + w), yl + 1), 'ink', 2)
                x += w + 2
        if i in (1, 3, 4, 6, 8):
            c.paint(c.line([(128, y + 1), (135, y + 8)], 2) | c.line([(135, y + 1), (128, y + 8)], 2), 'redink', 3)
        elif i in (0, 5):
            c.paint(c.line([(128, y + 5), (130, y + 8), (136, y + 1)], 2), 'redink', 3)
    # la nota en rojo: un 3,8 que cae como sello
    if t >= stamp_t:
        u = ease((t - stamp_t) / 0.12)
        r = 22 + 14 * (1 - u)
        c.paint(c.ell(112, 168, r) & ~c.ell(112, 168, r - 2.6), 'redink', 3)
        c.text('3,8', 112, 160, 'redink', 3, k=2)
    # lápiz
    c.paint(c.line([(100, 296), (150, 266)], 3), 'rune', 3 + light * 0.3)
    c.paint(c.line([(98, 297), (101, 295)], 3), 'wood', 2)
    # taza con vapor
    c.paint(c.rbox(150, 230, 174, 262, 3), 'clay', 1.5 + light * 0.8, dither=0.4)
    c.paint(c.ell(148, 246, 6, 7) & ~c.ell(148, 246, 3, 4) & (xx < 151), 'clay', 1.6 + light * 0.6)
    c.paint(c.box(152, 232, 172, 235), 'wood', 1)
    for i in range(3):
        for j in range(8):
            y = 226 - j * 4 - (t * 14 + i * 5) % 4
            x = 156 + i * 6 + 2 * math.sin(t * 3 + j * 0.9 + i)
            c.paint(c.box(x, y, x + 1, y + 2), 'paper', 3.5 - j * 0.3)
    # bolas de papel arrugado
    for (x, y, r) in ((166, 296, 8), (10, 300, 7), (160, 316, 6)):
        c.sphere(x, y, r, 'paper', extra=light[min(AH - 1, y), min(AW - 1, x)] * 0.3)
        c.paint(c.ell(x, y, r) & (hsh(xx, yy, x) > 0.8), 'paper', 1.5)
    # vela
    c.paint(c.box(156, 160, 168, 200), 'wax', 2.5 + light * 0.4, dither=0.4)
    c.paint(c.box(156, 160, 168, 163) | c.box(159, 163, 161, 170), 'wax', 4.5)
    c.paint(c.ell(162, 202, 14, 4), 'brass', 2.5)
    c.paint(c.box(161, 154, 163, 160), 'ink', 0)
    fh = 9 + 2 * fl
    c.paint(c.ell(162, 150, 3.5, fh / 2), 'flame', 2.5)
    c.paint(c.ell(162, 152, 1.8, fh / 3.4), 'flame', 5)
    c.glow(162, 148, 60, '#ffb060', 0.9 + fl * 0.4)
    return c.rgb_image()


# ——— 2. Calendario lleno de notas → se ordena solo ———
NOTAS = [('PEP 1', 'redink'), ('LAB', 'crystal'), ('QUIZ', 'rune'), ('INFORME', 'pink'), ('TALLER', 'sprout'), ('PEP 2', 'redink'),
         ('CONTROL', 'clay'), ('LAB', 'crystal'), ('ENTREGA', 'arcane'), ('QUIZ', 'rune'), ('TALLER', 'sprout'), ('INFORME', 'pink'),
         ('PEP 1', 'redink'), ('LAB', 'crystal')]
CAL = (14, 66, 166, 236)          # calendario en la pared


def note_sprite(label, ramp):
    w = max(24, len(label) * 4 + 5)
    c = Art(w, 15)
    c.paint(c.box(0, 0, w, 15), ramp, 4, dither=0.3)
    c.paint(c.box(0, 0, w, 3), ramp, 3)
    c.paint(c.poly([(w - 5, 15), (w, 10), (w, 15)]), ramp, 2)
    c.text(label, w / 2, 6, 'ink', 1, tiny=True)
    return c


def escena_caos(t, t_orden=8.0):
    """Notas que se caen del calendario; desde t_orden vuelan a su día y quedan ordenadas."""
    c = Art()
    yy, xx = c.yy, c.xx
    row = np.floor(yy / 9)
    c.paint(np.ones((AH, AW), bool), 'stone', 1.2 + (hsh(np.floor((xx + (row % 2) * 9) / 18), row) - 0.5) * 0.8 - yy / 400, dither=0.6)
    c.paint(((xx + (row % 2) * 9) % 18 < 1) | (yy % 9 < 1), 'stone', 0.5)
    x0, y0, x1, y1 = CAL
    order = ease((t - t_orden - 0.1) / 0.9) if t >= t_orden else 0.0
    c.paint(c.box(x0 + 3, y0 + 3, x1 + 3, y1 + 3), 'ink', 0)
    c.paint(c.box(x0, y0, x1, y1), 'paper', 3.6, dither=0.3)
    c.paint(c.box(x0, y0, x1, y0 + 16), 'redink', 2)
    c.text('OCTUBRE', (x0 + x1) / 2, y0 + 4, 'paper', 5)
    cw, ch = (x1 - x0 - 4) / 7, (y1 - y0 - 22) / 5
    for i in range(8):
        c.paint(c.box(x0 + 2 + i * cw, y0 + 18, x0 + 3 + i * cw, y1 - 2), 'paper', 1.6)
    for j in range(6):
        c.paint(c.box(x0 + 2, y0 + 18 + j * ch, x1 - 2, y0 + 19 + j * ch), 'paper', 1.6)
    for d in range(31):
        cx_, cy_ = (d + 3) % 7, (d + 3) // 7
        if cy_ < 5:
            c.text(str(d + 1), x0 + 4 + cx_ * cw, y0 + 20 + cy_ * ch, 'ink', 2, tiny=True, center=False)
    # reloj que gira loco (se calma al ordenarse)
    spin = t * (14 if t < t_orden else 0.5)
    c.sphere(150, 30, 13, 'brass')
    c.paint(c.ell(150, 30, 10), 'paper', 3)
    for frac, ln in ((spin / 12, 5), (spin, 8)):
        a = frac * math.tau
        c.paint(c.line([(150, 30), (150 + ln * math.sin(a), 30 - ln * math.cos(a))]), 'ink', 0)
    # notas
    rng = np.random.default_rng(9)
    slots = [(1, 0), (3, 0), (5, 1), (0, 1), (2, 2), (4, 2), (6, 2), (1, 3), (3, 3), (5, 3), (0, 4), (2, 4), (4, 4), (6, 4)]
    for i, (label, ramp) in enumerate(NOTAS):
        sx, sy = rng.uniform(x0 - 6, x1 - 24), rng.uniform(y0 + 10, y1 - 10)
        fall_at = 4.6 + i * 0.22
        if t > fall_at and i % 3 != 0:
            dt = t - fall_at
            sy = min(AH - 18 - (i % 4) * 5, sy + 60 * dt * dt)
            sx += 6 * math.sin(dt * 5 + i)
        else:
            sx += 1.5 * math.sin(t * 20 + i) if t > 4.4 else 0
        cx_, cy_ = slots[i]
        tx, ty = x0 + 3 + cx_ * cw, y0 + 20 + cy_ * ch + 7
        u = ease((order - i * 0.03) / 0.7) if order else 0.0
        if u <= 0:
            n = note_sprite(label, ramp)
            c.paint(c.place(n.a > 0, sx + 2, sy + 2), 'ink', 0)
            c.blit(n, sx, sy)
        else:
            x = sx + (tx - sx) * u
            y = sy + (ty - sy) * u
            w = 24 + (cw - 2 - 24) * u
            h = 15 + (5 - 15) * u
            c.paint(c.box(x, y, x + w, y + h), ramp, 4 if u < 1 else 3.5 + 0.8 * math.sin(t * 6 + i))
            if u >= 1 and i % 2 == 0:
                c.paint(c.line([(x + 2, y + 2), (x + 4, y + 4), (x + 8, y - 1)]), 'sprout', 7)
    if order:
        c.glow((x0 + x1) / 2, (y0 + y1) / 2, 120 * order, '#5cc4dc', 0.6 * order)
    return c.rgb_image()


# ——— 3. Combate con cartas: Amina salvaje ———
def amina(t, hit=0.0):
    """Monstruo: metilamina con cara. N azul (cuerpo), dos H (manos), CH3 (cola) y su par libre como dos luces encima."""
    c = Art(96, 96)
    cx, cy = 48 + 2 * math.sin(t * 2.2), 54 + 2 * math.sin(t * 3.1)
    hx = [(cx - 32, cy + 16 + 3 * math.sin(t * 4)), (cx + 30, cy + 18 + 3 * math.sin(t * 4 + 2))]
    mx, my = cx + 24, cy - 26
    for (x, y) in hx + [(mx, my)]:
        c.paint(c.line([(cx, cy), (x, y)], 4), 'silver', 3)
        c.paint(c.line([(cx, cy - 1), (x, y - 1)], 1), 'silver', 5)
    c.sphere(mx, my, 11, 'silver')
    for a in (0.3, 1.6, 2.9):
        hx_, hy_ = mx + 12 * math.cos(a - 0.8), my + 12 * math.sin(a - 0.8) - 2
        c.sphere(hx_, hy_, 4, 'white')
    c.sphere(cx, cy, 24, 'crystal', extra=0.3)
    for (x, y) in hx:
        c.sphere(x, y, 7, 'white')
    # cara
    for ex in (-9, 9):
        c.paint(c.ell(cx + ex, cy - 3, 5, 4), 'white', 4)
        c.paint(c.ell(cx + ex + (1 if ex < 0 else -1), cy - 2, 2, 2.4), 'ember', 4)
        c.paint(c.line([(cx + ex - 6 * np.sign(ex), cy - 11), (cx + ex + 4 * np.sign(ex), cy - 7)], 2), 'night', 1)
    mouth = c.ell(cx, cy + 10, 9, 5) & (c.yy > cy + 8)
    c.paint(mouth, 'night', 0)
    for tx in (-6, -2, 2, 6):
        c.paint(c.poly([(cx + tx - 1.5, cy + 9), (cx + tx + 1.5, cy + 9), (cx + tx, cy + 12)]), 'white', 4)
    c.text('N', cx + 15, cy + 8, 'white', 3, tiny=True)
    # par libre
    for k in (-1, 1):
        a = t * 3 + k * 0.6
        lx, ly = cx + 9 * math.cos(a) * k, cy - 33 + 3 * math.sin(a * 2)
        c.paint(c.ell(lx, ly, 3), 'arcane', 6)
        c.glow(lx, ly, 10, '#b88cf4', 0.8)
    c.outline('night', 0)
    if hit > 0:
        c.rgb[c.a > 0] = c.rgb[c.a > 0] * (1 - hit) + np.array([255, 255, 255], np.float32) * hit
    return c.image()


CARTAS = [('ANILINA', 'anilina'), ('METILAMINA', 'metil'), ('ACETAMIDA', 'amida')]


def carta(nombre, icono, glow=0.0):
    c = Art(52, 74)
    c.paint(c.rbox(0, 0, 52, 74, 3), 'crypt', 3, dither=0.5)
    c.paint(c.rbox(1, 1, 51, 73, 3) & ~c.rbox(3, 3, 49, 71, 2), 'crypt', 5)
    c.paint(c.rbox(4, 4, 48, 70, 2), 'paper', 3.6, dither=0.3)
    for (x, y) in ((1, 1), (47, 1), (1, 69), (47, 69)):
        c.paint(c.box(x, y, x + 4, y + 4), 'brass', 4)
    c.paint(c.box(6, 6, 46, 15), 'paper', 2.4)
    c.text(nombre, 26, 8, 'ink', 1, tiny=True)
    ix, iy = 26, 40
    if icono == 'anilina':
        pts = [(ix + 10 * math.cos(a), iy + 4 + 10 * math.sin(a)) for a in np.linspace(-math.pi / 2, 1.5 * math.pi, 7)]
        c.paint(c.line(pts, 1), 'ink', 1)
        c.paint(c.ell(ix, iy + 4, 5) & ~c.ell(ix, iy + 4, 4), 'ink', 2)
        c.paint(c.line([(ix, iy - 6), (ix, iy - 11)]), 'ink', 1)
        c.text('NH2', ix, iy - 18, 'crystal', 2, tiny=True)
    elif icono == 'metil':
        c.text('CH3', ix, iy - 16, 'ink', 1, tiny=True)
        c.paint(c.line([(ix, iy - 9), (ix, iy - 3)]), 'ink', 1)
        c.text('NH2', ix, iy - 1, 'crystal', 2, tiny=True)
        c.sphere(ix - 12, iy + 12, 4, 'silver')
        c.sphere(ix + 12, iy + 12, 4, 'crystal')
        c.paint(c.line([(ix - 8, iy + 12), (ix + 8, iy + 12)], 2), 'silver', 3)
    else:
        c.text('O', ix, iy - 18, 'redink', 3, tiny=True)
        c.paint(c.box(ix - 1, iy - 12, ix, iy - 7) | c.box(ix + 1, iy - 12, ix + 2, iy - 7), 'ink', 1)
        c.text('C-NH2', ix + 6, iy - 6, 'ink', 1, tiny=True)
        c.paint(c.line([(ix - 4, iy), (ix - 4, iy + 5)]), 'ink', 1)
        c.text('CH3', ix - 4, iy + 7, 'ink', 1, tiny=True)
    c.paint(c.ell(26, 62, 4), 'crystal' if icono != 'amida' else 'arcane', 5)
    if glow > 0:
        edge = c.rbox(0, 0, 52, 74, 3) & ~c.rbox(2, 2, 50, 72, 3)
        c.paint(edge, 'sprout', 5 + 3 * glow)
    return c.image()


def banda(texto, ramp='crystal', w=AW - 8):
    """Franja de piedra con texto 5x7 (pregunta, avisos)."""
    c = Art(w, 15)
    c.paint(c.box(0, 0, w, 15), 'crypt', 2.4, dither=0.5)
    c.paint(c.box(0, 0, w, 1), 'crypt', 5)
    c.paint(c.box(0, 14, w, 15), 'crypt', 0.5)
    c.text(texto, w / 2, 3 if not any(ch in texto for ch in 'ÁÉÍÓÚÑ') else 1, ramp, 5)
    return c.image()


def barra_vida(nombre, frac, w=120, ramp='ember'):
    c = Art(w, 16)
    c.text(nombre, w / 2, 0, 'white', 3, tiny=True)
    c.paint(c.box(0, 7, w, 16), 'brass', 2)
    c.paint(c.box(1, 8, w - 1, 15), 'night', 0)
    fw = int((w - 4) * max(0.0, min(1.0, frac)))
    if fw > 0:
        c.paint(c.box(2, 9, 2 + fw, 14), ramp, 4)
        c.paint(c.box(2, 9, 2 + fw, 10), ramp, 6)
    return c.image()


# ——— 4. Funciones de la app ———
def tabla(c, ramp_borde='brass'):
    """Tablilla de piedra con marco de latón, ocupa el centro del cuadro."""
    yy, xx = c.yy, c.xx
    row = np.floor(yy / 10)
    c.paint(np.ones((AH, AW), bool), 'crypt', 1.2 + (hsh(np.floor((xx + (row % 2) * 10) / 20), row) - 0.5) * 0.9, dither=0.6)
    c.paint(((xx + (row % 2) * 10) % 20 < 1) | (yy % 10 < 1), 'crypt', 0.4)
    c.paint(c.box(12, 96, 168, 262), ramp_borde, 2.5)
    c.paint(c.box(14, 98, 166, 260), ramp_borde, 4)
    c.paint(c.box(17, 101, 163, 257), 'crypt', 1.6, dither=0.5)
    for (x, y) in ((12, 96), (162, 96), (12, 256), (162, 256)):
        c.paint(c.box(x, y, x + 6, y + 6), ramp_borde, 5)


def funcion_curva(t):
    """Curva del olvido: cae, un repaso la devuelve arriba y cada vez cae más lento."""
    c = Art()
    tabla(c)
    ox, oy, wd, ht = 30, 238, 124, 112
    c.paint(c.box(ox, oy - ht, ox + 1, oy + 1) | c.box(ox, oy, ox + wd, oy + 1), 'white', 2)
    c.text('MEMORIA', ox + 2, oy - ht - 8, 'white', 2, tiny=True, center=False)
    c.text('DIAS', ox + wd - 14, oy + 4, 'white', 2, tiny=True, center=False)
    reviews = (0.0, 0.22, 0.48, 0.8)
    prog = ease(t / 1.15)
    pts = []
    for i in range(160):
        u = i / 159
        if u > prog:
            break
        r0 = max(r for r in reviews if r <= u)
        k = reviews.index(r0)
        stab = 0.06 * (2.6 ** k)
        val = math.exp(-(u - r0) / stab)
        pts.append((ox + 1 + u * (wd - 2), oy - 4 - val * (ht - 10)))
    if len(pts) > 1:
        c.paint(c.line(pts, 3), 'crystal', 3)
        c.paint(c.line(pts, 1), 'crystal', 6)
    for r0 in reviews[1:]:
        if prog >= r0:
            x = ox + 1 + r0 * (wd - 2)
            c.paint(c.box(x, oy - ht + 4, x + 1, oy), 'crystal', 2)
            c.text('+', x, oy - ht - 2, 'rune', 5, tiny=True)
            age = (prog - r0) * 1.15
            if age < 0.4:
                c.glow(x, oy - ht + 8, 22, '#9ce8f0', 1.2 * (1 - age / 0.4))
    return c.rgb_image()


def funcion_siete(t):
    """Tu camino al 7: la nota sube de 4,0 a 7,0 y la barra de cristal se llena."""
    c = Art()
    tabla(c, 'rune')
    u = ease(t / 1.0)
    nota = 4.0 + 3.0 * u
    txt = f'{nota:.1f}'.replace('.', ',')
    ramp = 'redink' if nota < 5 else 'rune' if nota < 6.9 else 'flame'
    c.text(txt, AW / 2, 128, ramp, 4 if ramp != 'flame' else 4, k=4)
    c.paint(c.box(28, 210, 152, 224), 'brass', 3)
    c.paint(c.box(30, 212, 150, 222), 'night', 0)
    c.paint(c.box(31, 213, 31 + 118 * (nota - 1) / 6, 221), 'crystal', 5)
    c.paint(c.box(31, 213, 31 + 118 * (nota - 1) / 6, 215), 'crystal', 7)
    for i, mark in enumerate(range(1, 8)):
        c.text(str(mark), 31 + 118 * i / 6, 228, 'white', 2, tiny=True)
    if nota >= 6.95:
        c.glow(AW / 2, 150, 80, '#ffd860', 1.4)
    return c.rgb_image()


RANGOS = (('PRINCIPIANTE', 'bronze'), ('AVANZADO', 'silver'), ('REY MAGO', 'rune'))


def funcion_rango(t):
    """Sube de rango: el escudo pasa de bronce a plata y a oro."""
    c = Art()
    tabla(c, 'brass')
    k = min(2, int(t / 0.42))
    nombre, ramp = RANGOS[k]
    cx, cy = AW / 2, 168
    for i in range(12):
        a = i / 12 * math.tau + t * 0.8
        c.paint(c.line([(cx, cy), (cx + 80 * math.cos(a), cy + 80 * math.sin(a))], 3), ramp, 1.5 + k * 0.5)
    shield = c.poly([(cx - 34, cy - 40), (cx + 34, cy - 40), (cx + 34, cy + 6), (cx, cy + 46), (cx - 34, cy + 6)])
    inner = c.poly([(cx - 28, cy - 34), (cx + 28, cy - 34), (cx + 28, cy + 4), (cx, cy + 38), (cx - 28, cy + 4)])
    c.paint(shield, ramp, 2 + (c.yy < cy) * 1.5 + (c.xx < cx) * 0.8, dither=0.4)
    c.paint(inner, ramp, 3.5 + (cy - c.yy) / 30, dither=0.5)
    for j in range(k + 1):
        sx = cx + (j - k / 2) * 16
        c.paint(c.poly([(sx, cy - 16), (sx + 4, cy - 6), (sx + 12, cy - 6), (sx + 6, cy), (sx + 8, cy + 10), (sx, cy + 4),
                        (sx - 8, cy + 10), (sx - 6, cy), (sx - 12, cy - 6), (sx - 4, cy - 6)]), 'rune', 5)
    if k == 2:
        for a in (-1, 1):
            c.paint(c.poly([(cx + a * 34, cy - 30), (cx + a * 64, cy - 52), (cx + a * 58, cy - 20), (cx + a * 34, cy - 8)]), 'white', 3)
    if k < 2:
        c.text('MAGO', cx, cy + 56, 'white', 3, tiny=True)
    c.text(nombre, cx, cy + 64 if k < 2 else cy + 58, 'white', 4, tiny=True)
    since = t - k * 0.42
    if since < 0.25:
        c.glow(cx, cy, 90, '#fff0a8', 1.6 * (1 - since / 0.25))
    return c.rgb_image()


# ——— 5. El Gólem de la PEP ———
def golem(t, lit=1.0, eyes=1.0, hit=0.0, cracks=0.0):
    c = Art(170, 200)
    cx = 85
    b = 2 * math.sin(t * 1.6)
    base = -1.2 + 2.2 * lit
    # brazos y puños
    for s in (-1, 1):
        sx = cx + s * 52
        c.paint(c.line([(sx, 70 + b), (sx + s * 10, 128 + b)], 18), 'crypt', base + 2.0 - s * 0.6, dither=0.6)
        c.paint(c.rbox(sx + s * 10 - 18, 120 + b, sx + s * 10 + 18, 158 + b, 6), 'crypt', base + 2.6 - s * 0.6, dither=0.6)
        c.paint(c.box(sx + s * 10 - 14, 123 + b, sx + s * 10 + 14, 126 + b), 'crypt', base + 4)
    # torso
    torso = c.poly([(cx - 46, 52 + b), (cx + 46, 52 + b), (cx + 34, 150 + b), (cx - 34, 150 + b)])
    c.paint(torso, 'crypt', base + 2.4 + (cx - c.xx) / 50 + (100 - c.yy) / 90, dither=0.7)
    plate = c.rbox(cx - 24, 82 + b, cx + 24, 112 + b, 3)
    c.paint(plate, 'crypt', base + 1.2, dither=0.4)
    c.text('PEP 1', cx, 90 + b, 'ember', 1 + 5 * eyes * lit)
    # piernas
    for s in (-1, 1):
        c.paint(c.rbox(cx + s * 22 - 14, 146 + b, cx + s * 22 + 14, 198, 4), 'crypt', base + 1.6 - s * 0.5, dither=0.6)
    # hombros con cristales rojos
    for s in (-1, 1):
        c.sphere(cx + s * 50, 60 + b, 17, 'crypt', extra=base)
        for k_, (dx, h) in enumerate(((-6, 20), (2, 28), (9, 16))):
            x = cx + s * (50 + dx)
            c.paint(c.poly([(x - 4, 50 + b), (x + 4, 50 + b), (x + s * 2, 50 + b - h)]), 'ember', 2 + 3 * lit + (k_ == 1))
    # cabeza
    c.paint(c.rbox(cx - 22, 18 + b, cx + 22, 56 + b, 6), 'crypt', base + 2.8 + (36 - c.yy) / 30, dither=0.6)
    c.paint(c.box(cx - 22, 34 + b, cx + 22, 37 + b), 'crypt', base + 0.6)
    for s in (-1, 1):
        c.paint(c.poly([(cx + s * 14, 20 + b), (cx + s * 22, 20 + b), (cx + s * 30, 0 + b)]), 'ember', 2 + 2 * lit)
        c.paint(c.ell(cx + s * 10, 30 + b, 5, 3), 'ember', 1 + 5.5 * eyes)
    c.paint(c.box(cx - 12, 44 + b, cx + 12, 48 + b), 'ember', 1 + 4 * eyes * lit)
    # grietas que brillan
    rng = np.random.default_rng(5)
    n = int(6 + 18 * cracks)
    for i in range(n):
        x, y = cx + rng.uniform(-36, 36), rng.uniform(60, 150)
        pts = [(x, y + b)]
        for _ in range(4):
            x += rng.uniform(-6, 6)
            y += rng.uniform(2, 7)
            pts.append((x, y + b))
        c.paint(c.line(pts) & (c.a > 0), 'ember', 3 + 3 * max(eyes * lit, cracks))
    c.outline('night', 0)
    if hit > 0:
        m = c.a > 0
        c.rgb[m] = c.rgb[m] * (1 - hit) + np.array([255, 240, 220], np.float32) * hit
    return c.image()
