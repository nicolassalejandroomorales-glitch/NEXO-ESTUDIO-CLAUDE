"""Murales animados de cada ramo para el Sótano de los Cristales.

Cada mural se dibuja como una textura chica (PW x PH texeles) en función del tiempo y luego build_sotano.py la pega
sobre la piedra junto a cada puerta, con perspectiva real. Los valores de la textura son códigos de color:
0 fondo (pizarra), 1 trazo tenue, 2 trazo del ramo, 3 electrón/blanco, 4 flecha dorada, 5 rojo, 6 acento, 7 celeste.
"""
import math

import numpy as np

PW, PH = 64, 124

# fuente de 5x5 (la tilde va en una fila extra arriba; la pone quien dibuja el texto)
FONT = {
    'A': ['.XXX.', 'X...X', 'XXXXX', 'X...X', 'X...X'], 'B': ['XXXX.', 'X...X', 'XXXX.', 'X...X', 'XXXX.'],
    'C': ['.XXXX', 'X....', 'X....', 'X....', '.XXXX'], 'D': ['XXXX.', 'X...X', 'X...X', 'X...X', 'XXXX.'],
    'E': ['XXXXX', 'X....', 'XXX..', 'X....', 'XXXXX'], 'F': ['XXXXX', 'X....', 'XXX..', 'X....', 'X....'],
    'G': ['.XXXX', 'X....', 'X..XX', 'X...X', '.XXXX'], 'H': ['X...X', 'X...X', 'XXXXX', 'X...X', 'X...X'],
    'I': ['XXXXX', '..X..', '..X..', '..X..', 'XXXXX'], 'J': ['..XXX', '...X.', '...X.', 'X..X.', '.XX..'],
    'Y': ['X...X', '.X.X.', '..X..', '..X..', '..X..'], '/': ['....X', '...X.', '..X..', '.X...', 'X....'], 'K': ['X..X.', 'X.X..', 'XX...', 'X.X..', 'X..X.'],
    'L': ['X....', 'X....', 'X....', 'X....', 'XXXXX'], 'M': ['X...X', 'XX.XX', 'X.X.X', 'X...X', 'X...X'],
    'N': ['X...X', 'XX..X', 'X.X.X', 'X..XX', 'X...X'], 'O': ['.XXX.', 'X...X', 'X...X', 'X...X', '.XXX.'],
    'P': ['XXXX.', 'X...X', 'XXXX.', 'X....', 'X....'], 'Q': ['.XXX.', 'X...X', 'X...X', 'X..XX', '.XXXX'],
    'R': ['XXXX.', 'X...X', 'XXXX.', 'X..X.', 'X...X'], 'S': ['.XXXX', 'X....', '.XXX.', '....X', 'XXXX.'],
    'T': ['XXXXX', '..X..', '..X..', '..X..', '..X..'], 'U': ['X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
    'V': ['X...X', 'X...X', 'X...X', '.X.X.', '..X..'], 'X': ['X...X', '.X.X.', '..X..', '.X.X.', 'X...X'],
    '0': ['.XXX.', 'X..XX', 'X.X.X', 'XX..X', '.XXX.'], '1': ['..X..', '.XX..', '..X..', '..X..', '.XXX.'],
    '2': ['XXXX.', '....X', '.XXX.', 'X....', 'XXXXX'], '7': ['XXXXX', '....X', '...X.', '..X..', '..X..'],
    '3': ['XXXX.', '....X', '.XXX.', '....X', 'XXXX.'], '4': ['X..X.', 'X..X.', 'XXXXX', '...X.', '...X.'],
    '5': ['XXXXX', 'X....', 'XXXX.', '....X', 'XXXX.'], '6': ['.XXX.', 'X....', 'XXXX.', 'X...X', '.XXX.'],
    '8': ['.XXX.', 'X...X', '.XXX.', 'X...X', '.XXX.'], '9': ['.XXX.', 'X...X', '.XXXX', '....X', '.XXX.'],
    '-': ['.....', '.....', 'XXXXX', '.....', '.....'], '+': ['.....', '..X..', '.XXX.', '..X..', '.....'],
    '>': ['X....', '.XX..', '...XX', '.XX..', 'X....'], '·': ['...', '...', '.X.', '...', '...'],
    ' ': ['...', '...', '...', '...', '...'],
}
ACCENT = {'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'}


class Lienzo:
    def __init__(self, w=PW, h=PH):
        self.w, self.h = w, h
        self.a = np.zeros((h, w), np.uint8)

    def px(self, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < self.w and 0 <= y < self.h:
            self.a[y, x] = c

    def line(self, x0, y0, x1, y1, c, w=1, dash=0):
        n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        for i in range(n + 1):
            if dash and (i // dash) % 2:
                continue
            t = i / n
            x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            for d in range(w):
                if abs(x1 - x0) >= abs(y1 - y0):
                    self.px(x, y + d - (w - 1) // 2, c)
                else:
                    self.px(x + d - (w - 1) // 2, y, c)

    def poly(self, pts, c, w=1, closed=True):
        n = len(pts) if closed else len(pts) - 1
        for k in range(n):
            a, b = pts[k], pts[(k + 1) % len(pts)]
            self.line(a[0], a[1], b[0], b[1], c, w)

    def circle(self, cx, cy, r, c, fill=False):
        yy, xx = np.mgrid[0:self.h, 0:self.w]
        d = np.hypot(xx + 0.5 - cx, yy + 0.5 - cy)
        m = d <= r if fill else np.abs(d - r) < 0.6
        self.a[m] = c

    def text(self, x, y, s, c):
        for ch in s:
            g = FONT[ACCENT.get(ch, ch)]
            for ry, row in enumerate(g):
                for rx, chx in enumerate(row):
                    if chx == 'X':
                        self.px(x + rx, y + ry, c)
            x += len(g[0]) + 1

    def title(self, s, c=1):
        w = sum(len(FONT[ACCENT.get(ch, ch)][0]) + 1 for ch in s) - 1
        self.text((self.w - w) // 2, 3, s, c)

    def curve(self, p0, p1, p2, c, prog=1.0, head=True):
        """Flecha curva (Bézier cuadrática) que se dibuja sola hasta `prog`."""
        if prog <= 0:
            return
        n = 40
        last = p0
        pts = []
        for i in range(int(n * min(prog, 1.0)) + 1):
            t = i / n
            x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
            y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
            pts.append((x, y))
        for q in pts:
            self.line(last[0], last[1], q[0], q[1], c)
            last = q
        if head and len(pts) > 3:
            (xa, ya), (xb, yb) = pts[-4], pts[-1]
            ang = math.atan2(yb - ya, xb - xa)
            for da in (2.5, -2.5):
                self.line(xb, yb, xb + 4 * math.cos(ang + da), yb + 4 * math.sin(ang + da), c)


def ease(u):
    u = min(max(u, 0.0), 1.0)
    return u * u * (3 - 2 * u)


def hexv(cx, cy, r):
    return [(cx + r * math.cos(math.radians(90 + 60 * k)), cy - r * math.sin(math.radians(90 + 60 * k))) for k in range(6)]


def ring(L, cx, cy, r, kek, w=2):
    """Anillo aromático con enlaces dobles alternados (kek = 0 o 1)."""
    v = hexv(cx, cy, r)
    L.poly(v, 2, w)
    for k in range(kek, 6, 2):
        a, b = v[k], v[(k + 1) % 6]
        s = 0.72
        a2 = (cx + (a[0] - cx) * s, cy + (a[1] - cy) * s)
        b2 = (cx + (b[0] - cx) * s, cy + (b[1] - cy) * s)
        L.line(a2[0] + (b2[0] - a2[0]) * 0.15, a2[1] + (b2[1] - a2[1]) * 0.15,
               b2[0] - (b2[0] - a2[0]) * 0.15, b2[1] - (b2[1] - a2[1]) * 0.15, 2)
    return v


# ---------------------------------------------------------------- Orgánica II
def org_resonancia(T):
    """Resonancia del benceno (flechas que mueven los electrones pi) y, alternando, la anilina con su par libre."""
    L = Lienzo()
    if (T % 24) < 12:
        L.title('RESONANCIA')
        t = T % 6
        kek = int((T % 12) // 6)
        v = ring(L, 32, 36, 15, kek)
        prog = ease(t / 4.0)
        cx, cy = 32, 36
        for k in range(kek, 6, 2):                                   # cada doble enlace se mueve al enlace vecino
            a, b, c2 = v[k], v[(k + 1) % 6], v[(k + 2) % 6]
            m1 = ((a[0] + b[0]) / 2 * 0.7 + cx * 0.3, (a[1] + b[1]) / 2 * 0.7 + cy * 0.3)
            m2 = ((b[0] + c2[0]) / 2 * 0.7 + cx * 0.3, (b[1] + c2[1]) / 2 * 0.7 + cy * 0.3)
            ctrl = (b[0] * 0.75 + cx * 0.25, b[1] * 0.75 + cy * 0.25)
            L.curve(m1, ctrl, m2, 4, prog)
        L.line(20, 64, 44, 64, 1)                                    # flecha de resonancia (doble punta)
        for xx_, sg in ((20, 1), (44, -1)):
            L.line(xx_, 64, xx_ + 4 * sg, 61, 1)
            L.line(xx_, 64, xx_ + 4 * sg, 67, 1)
        v2 = hexv(32, 94, 15)                                        # híbrido: anillo con electrones deslocalizados
        L.poly(v2, 2, 2)
        L.circle(32, 94, 8.5 + 0.6 * math.sin(T * 2.0), 2)
        for k in range(6):
            a = T * 1.6 + k * math.pi / 3
            L.px(32 + 8.5 * math.cos(a), 94 + 8.5 * math.sin(a), 3)
            L.px(33 + 8.5 * math.cos(a), 94 + 8.5 * math.sin(a), 3)
    else:
        L.title('AMINAS')
        t = T % 6
        v = ring(L, 32, 76, 15, int((T % 12) // 6))
        L.line(32, 61, 32, 47, 2, 2)                                 # C-N
        L.text(26, 40, 'NH', 2)
        L.text(38, 44, '2', 2)
        blink = 3 if (int(T * 2) % 2 == 0) else 1
        L.px(30, 36, blink)
        L.px(33, 36, blink)                                          # par libre del nitrógeno
        L.curve((31, 34), (14, 40), (22, 58), 4, ease(t / 3.5))      # el par libre entra al anillo
        if t > 3:
            for k in (1, 3, 5):                                      # carga negativa parcial en orto y para
                x, y = v[k]
                ox, oy = (x - 32) * 0.4, (y - 76) * 0.4
                L.line(x + ox - 2, y + oy, x + ox + 2, y + oy, 5)
        L.text(11, 104, 'ANILINA', 1)
    return L.a


def org_sn2(T):
    """SN2: el nucleófilo ataca por detrás, estado de transición y el carbono se invierte como un paraguas."""
    L = Lienzo()
    L.title('SN2')
    q = (T % 10) / 10
    cx, cy = 32, 60
    if q < 0.3:
        u = 1.0
        nux = 3 + ease(q / 0.3) * 6
    elif q < 0.55:
        u = 1 - ease((q - 0.3) / 0.25)
        nux = 9
    else:
        u = -ease((q - 0.55) / 0.3)
        nux = 9
    brx = 46 + (ease((q - 0.55) / 0.35) * 8 if q >= 0.55 else 0)
    L.text(int(nux), cy - 2, 'NU', 2)
    L.line(int(nux) + 6, cy - 6, int(nux) + 8, cy - 6, 5)            # carga negativa del nucleófilo
    for (dy, short) in ((-16, False), (16, False), (4, True)):       # tres sustituyentes (paraguas)
        ex = cx - (6 if short else 10) * u
        ey = cy + dy * (0.6 if short else 1)
        L.line(cx, cy, ex, ey, 1 if short else 2, 1 if short else 2)
        L.text(int(ex - 2 - 3 * u), int(ey - 2 + (3 if dy > 0 else -3)), 'H', 1)
    L.circle(cx, cy, 3, 2, fill=True)
    L.text(cx - 2, cy - 13, 'C', 2)
    if q < 0.3:
        L.line(cx, cy, brx, cy, 2, 2)
        L.curve((nux + 10, cy + 6), (20, cy + 16), (cx - 3, cy + 3), 4, ease(q / 0.25))
        L.curve((cx + 7, cy - 2), (cx + 12, cy - 10), (brx + 2, cy - 5), 4, ease(q / 0.25))
    elif q < 0.55:
        L.line(nux + 11, cy, cx - 4, cy, 2, 1, dash=2)
        L.line(cx + 4, cy, brx, cy, 2, 1, dash=2)
        for x0, sg in ((5, 1), (59, -1)):                            # corchetes del estado de transición
            L.line(x0, cy - 22, x0, cy + 22, 1)
            L.line(x0, cy - 22, x0 + 3 * sg, cy - 22, 1)
            L.line(x0, cy + 22, x0 + 3 * sg, cy + 22, 1)
        L.text(52, cy - 30, '+', 4)
    else:
        L.line(nux + 11, cy, cx - 4, cy, 2, 2)
    L.text(int(brx) + 2, cy - 2, 'BR', 2 if q < 0.55 else 1)
    if q >= 0.55:
        L.line(int(brx) + 13, cy - 6, int(brx) + 15, cy - 6, 5)
        L.text(5, 100, 'INVERSION', 4 if int(T * 3) % 2 else 1)
    return L.a


# ---------------------------------------------------------------- Química Analítica
def ana_curva(T):
    """Curva de titulación ácido-base que se traza sola: el pH salta en el punto de equivalencia."""
    L = Lienzo()
    L.title('TITULACIÓN')
    q = (T % 11) / 9
    L.line(8, 110, 58, 110, 1)
    L.line(8, 110, 8, 16, 1)
    L.text(1, 14, 'PH', 1)
    L.text(56, 113, 'V', 1)
    veq = 0.6

    def ph(v):
        return 2 + 10 / (1 + math.exp(-(v - veq) * 22))
    L.line(9, 110 - 7 * 7.5, 57, 110 - 7 * 7.5, 1, dash=2)
    L.text(1, 110 - 7 * 7.5 - 2, '7', 1)
    L.line(9 + veq * 48, 111, 9 + veq * 48, 20, 1, dash=2)
    prev = None
    for i in range(int(min(q, 1.0) * 96) + 1):
        v = i / 96
        p = (9 + v * 48, 110 - ph(v) * 7.5)
        if prev:
            L.line(prev[0], prev[1], p[0], p[1], 7 if v < veq else 6, 2)
        prev = p
    if prev:
        L.circle(prev[0], prev[1], 2.2, 3, fill=True)
    return L.a


def ana_bureta(T):
    """Bureta que gotea sobre un matraz: el indicador vira a rosado justo en el punto de equivalencia."""
    L = Lienzo()
    L.title('BURETA')
    q = (T % 11) / 9
    for y in range(16, 76, 6):                                       # graduaciones
        L.line(24, y, 27 if (y // 6) % 5 else 22, y, 1)
    L.line(28, 14, 28, 76, 1)
    L.line(36, 14, 36, 76, 1)
    level = 18 + min(q, 1.0) * 46
    for y in range(int(level), 76):
        L.line(29, y, 35, y, 7)
    L.line(26, 78, 38, 78, 4, 2)                                     # llave
    L.line(31, 80, 33, 86, 1)
    if q < 1.0:
        for k in range(2):                                           # gotas
            y = 88 + ((T * 14 + k * 9) % 14)
            L.px(32, y, 7)
            L.px(32, y + 1, 7)
    L.poly([(29, 92), (35, 92), (35, 100), (50, 118), (14, 118), (29, 100)], 1, 1)
    pink = q > 0.62
    for y in range(106, 118):
        half = 6 + (y - 100) * 0.95
        L.line(32 - half + 1, y, 32 + half - 1, y, 6 if pink else 7)
    if pink:
        for k in range(5):
            a = T * 3 + k * 1.25
            L.px(32 + 10 * math.cos(a), 112 + 3 * math.sin(a), 3)
    return L.a


# ---------------------------------------------------------------- Fisicoquímica II
def fq_energia(T):
    """Diagrama de energía: la reacción sube la barrera de activación y baja a los productos."""
    L = Lienzo()
    L.title('ENERGIA')
    L.line(8, 112, 58, 112, 1)
    L.line(8, 112, 8, 18, 1)
    L.text(1, 18, 'E', 1)

    def e(x):
        return 80 + 18 / (1 + math.exp(-(x - 42) / 2.5)) - 52 * math.exp(-((x - 33) / 6.5) ** 2)
    prev = None
    for x in range(10, 59):
        p = (x, e(x))
        if prev:
            L.line(prev[0], prev[1], p[0], p[1], 2, 2)
        prev = p
    q = (T % 9) / 7
    bx = 11 + min(q, 1.0) * 46
    L.circle(bx, e(bx) - 3.5, 2.6, 3, fill=True)
    L.line(18, 80, 33, 80, 1, dash=2)
    L.line(22, 79, 22, e(33) + 2, 4)                                 # flecha de la energía de activación
    L.line(22, e(33) + 2, 20, e(33) + 6, 4)
    L.line(22, e(33) + 2, 24, e(33) + 6, 4)
    L.text(24, 52, 'EA', 4)
    L.text(11, 70, 'A', 1)
    L.text(52, 88, 'B', 1)
    return L.a


def fq_equilibrio(T):
    """Partículas A (color del ramo) que se transforman en B (celeste) hasta llegar al equilibrio."""
    L = Lienzo()
    L.title('EQUILIBRIO')
    L.poly([(5, 16), (59, 16), (59, 84), (5, 84)], 1)
    f = 0.62 * (1 - math.exp(-(T % 30) / 5.0))
    rg = np.random.RandomState(4)
    for k in range(16):
        sx, sy, vx, vy, h = rg.rand(5)
        x = 9 + 46 * abs(((sx * 2 + T * (0.15 + 0.2 * vx)) % 2) - 1)
        y = 20 + 60 * abs(((sy * 2 + T * (0.12 + 0.2 * vy)) % 2) - 1)
        is_b = (h + 0.06 * math.sin(T * 1.7 + k)) < f
        L.circle(x, y, 2.1, 7 if is_b else 2, fill=True)
    for (x0, frac, col, lab) in ((18, 1 - f, 2, 'A'), (40, f, 7, 'B')):
        top = 116 - frac * 22
        for x in range(x0, x0 + 8):
            L.line(x, top, x, 116, col)
        L.text(x0 + 2, 118, lab, 1)
    return L.a


# ---------------------------------------------------------------- Fisiopatología
def fisio_neurona(T):
    """Neurona mielinizada: el potencial de acción salta de nodo en nodo (conducción saltatoria)."""
    L = Lienzo()
    L.title('NEURONA')
    for a in (-2.4, -1.9, -1.2, -0.7):                               # dendritas
        L.line(32, 24, 32 + 16 * math.cos(a), 24 + 12 * math.sin(a), 1)
    L.circle(32, 26, 7, 2, fill=False)
    L.circle(32, 26, 2, 2, fill=True)
    L.line(32, 33, 32, 100, 1, 2)
    nodes = [38, 52, 66, 80, 94]
    for y0, y1 in zip(nodes[:-1], nodes[1:]):                        # vainas de mielina
        L.poly([(29, y0 + 2), (35, y0 + 2), (35, y1 - 2), (29, y1 - 2)], 1)
    for ex in (18, 32, 46):                                          # terminales
        L.line(32, 100, ex, 112, 1)
        L.circle(ex, 113, 2, 1, fill=True)
    step = int(T * 2.2) % 7
    if step < 5:
        y = nodes[step]
        for dy in range(-2, 3):
            L.line(28, y + dy, 36, y + dy, 5)
        L.px(26, y, 3)
        L.px(38, y, 3)
    else:
        for ex in (18, 32, 46):
            L.circle(ex, 113, 3, 5, fill=True)
    return L.a


def fisio_ecg(T):
    """Electrocardiograma que avanza (onda P, complejo QRS, onda T) y un corazón que late con cada R."""
    L = Lienzo()
    L.title('ECG')
    for y in range(26, 92, 6):
        for x in range(2, 63, 6):
            L.px(x, y, 1)

    def wave(ph):
        ph %= 40
        if 5 <= ph < 10:
            return -3 * math.sin((ph - 5) / 5 * math.pi)
        if 15 <= ph < 16.5:
            return 3
        if 16.5 <= ph < 18.5:
            return -24 * math.sin((ph - 16.5) / 2 * math.pi)
        if 18.5 <= ph < 20:
            return 6
        if 25 <= ph < 32:
            return -5 * math.sin((ph - 25) / 7 * math.pi)
        return 0
    shift = T * 18
    prev = None
    for x in range(2, 62):
        p = (x, 60 + wave(x + shift))
        if prev:
            L.line(prev[0], prev[1], p[0], p[1], 5)
        prev = p
    L.circle(61, 60 + wave(61 + shift), 1.5, 3, fill=True)
    beat = 1.0 + 0.25 * max(0.0, math.cos(((61 + shift - 17.5) % 40) / 40 * 2 * math.pi)) ** 8
    r = 5 * beat
    L.circle(32 - r * 0.55, 104, r * 0.62, 5, fill=True)
    L.circle(32 + r * 0.55, 104, r * 0.62, 5, fill=True)
    for y in range(int(104), int(104 + r * 1.6)):
        half = r * 1.15 * (1 - (y - 104) / (r * 1.6))
        L.line(32 - half, y, 32 + half, y, 5)
    L.text(24, 116, '72', 1)
    return L.a


# ---------------------------------------------------------------- Cámara de Orgánica II (murales de alcoba, más anchos)
AW_, AH_ = 96, 72


def check(L, x, y, c=2):
    L.line(x, y, x + 2, y + 2, c)
    L.line(x + 2, y + 2, x + 7, y - 3, c)


def cross(L, x, y, c=5):
    L.line(x, y, x + 5, y + 5, c)
    L.line(x + 5, y, x, y + 5, c)


def alc_aminas(T):
    """Basicidad: el H+ se pega al par libre de una amina; en la anilina el par se reparte en el anillo y el H+ se va."""
    L = Lienzo(AW_, AH_)
    L.title('BASICIDAD')
    t = T % 8
    L.line(48, 13, 48, 54, 1, dash=2)
    # izquierda: amina alifática, su par libre atrapa al H+
    stuck = t >= 3
    L.text(9, 36, 'R-NH', 2)
    L.text(33, 36, '3' if stuck else '2', 2)
    if not stuck:
        blink = 3 if int(T * 2) % 2 == 0 else 1
        L.px(22, 32, blink)
        L.px(24, 32, blink)
        u = ease(t / 3.0)
        hx, hy = 36 - 14 * u, 13 + 10 * u
        L.text(int(hx), int(hy), 'H+', 4)
        L.curve((23, 31), (18, 22), (hx - 1, hy + 3), 4, ease((t - 0.4) / 2.0))
    else:
        L.text(39, 31, '+', 4)
        L.line(23, 33, 23, 27, 2)
        L.text(21, 20, 'H', 2)
        check(L, 34, 23)
    # derecha: anilina, el par libre entra al anillo y el H+ rebota
    v = ring(L, 72, 46, 9, int((T % 4) // 2), w=1)
    L.line(72, 37, 72, 32, 2)
    L.text(66, 26, 'NH', 2)
    L.text(78, 29, '2', 2)
    L.px(70, 23, 3)
    L.px(73, 23, 3)
    L.curve((69, 24), (58, 30), (v[1][0] + 2, v[1][1] + 3), 4, ease(t / 2.5))
    if t < 3:
        u = ease(t / 3.0)
        L.text(int(90 - 14 * u), int(8 + 9 * u), 'H+', 4)
    else:
        u = ease((t - 3) / 3.0)
        L.text(int(76 + 12 * u), int(17 - 9 * u), 'H+', 4 if int(T * 3) % 2 else 1)
        cross(L, 84, 36)
    L.text(10, 62, 'AMINA', 2)
    L.text(44, 62, '>', 4)
    L.text(53, 62, 'ANILINA', 1)
    return L.a


def alc_aromaticos(T):
    """Primero Hückel (cuenta los electrones pi: 6 = 4n+2) y después la SEA: entra E+, complejo sigma, sale H+."""
    L = Lienzo(AW_, AH_)
    t = T % 16
    if t < 8:
        L.title('AROMÁTICO')
        v = ring(L, 28, 40, 15, 0)
        npairs = min(3, int(t / 1.2))
        for k in range(npairs):                                     # cada doble enlace aporta 2 electrones pi
            a, b = v[2 * k], v[2 * k + 1]
            mx, my = (a[0] + b[0]) / 2 * 0.55 + 28 * 0.45, (a[1] + b[1]) / 2 * 0.55 + 40 * 0.45
            L.px(mx - 1, my, 3)
            L.px(mx + 1, my, 3)
        if npairs:
            L.text(60, 16, str(2 * npairs), 3)
            L.text(67, 16, 'PI', 1)
        if t >= 4.2:
            L.text(54, 31, '4N+2', 4)
            check(L, 82, 33)
        if t >= 5.4:                                                # ciclobutadieno: 4 electrones, antiaromático
            L.poly([(60, 47), (72, 47), (72, 59), (60, 59)], 2)
            L.line(62, 50, 62, 56, 2)
            L.line(70, 50, 70, 56, 2)
            L.text(76, 50, '4', 1)
            if int(T * 3) % 2:
                cross(L, 84, 50)
        return L.a
    s = t - 8
    L.title('SEA')
    cx, cy = 34, 42
    if s < 2.2 or s >= 6:
        v = ring(L, cx, cy, 14, 0)
    else:                                                           # complejo sigma: un carbono sp3 y la carga deslocalizada
        v = hexv(cx, cy, 14)
        L.poly(v, 2, 2)
        L.line(v[2][0] + 3, v[2][1] + 1, v[3][0] + 3, v[3][1] - 1, 2)
        L.line(v[4][0] - 3, v[4][1] - 1, v[5][0] - 3, v[5][1] + 1, 2)
        L.text(cx - 2, cy - 2, '+', 5)
    top = v[1]
    if s < 2.2:
        u = ease(s / 2.0)
        ex, ey = 74 - 20 * u, 12 + 8 * u
        L.text(int(ex), int(ey), 'E+', 4)
        L.curve((cx + 6, cy - 9), (cx + 16, cy - 16), (ex - 1, ey + 4), 4, ease((s - 0.3) / 1.6))
    elif s < 6:
        L.line(top[0], top[1], top[0] + 7, top[1] - 6, 2)
        L.text(int(top[0]) + 8, int(top[1]) - 11, 'E', 4)
        if s < 4.2:
            L.line(top[0], top[1], top[0] + 9, top[1] + 1, 1)
            L.text(int(top[0]) + 10, int(top[1]) - 2, 'H', 3)
            L.text(56, 60, 'SIGMA', 1)
        else:
            u = ease((s - 4.2) / 1.6)
            L.text(int(top[0] + 10 + 26 * u), int(top[1] - 2 - 12 * u), 'H+', 3)
            L.curve((top[0] + 6, top[1] + 1), (top[0] + 2, top[1] + 8), (cx + 5, cy - 2), 4, u)
    else:
        L.line(top[0], top[1], top[0] + 7, top[1] - 6, 2)
        L.text(int(top[0]) + 8, int(top[1]) - 11, 'E', 4)
        check(L, 72, 44)
        L.text(56, 60, 'AROMÁTICO', 1)
    return L.a


def alc_heterociclos(T):
    """Dónde está el par libre: en la piridina queda fuera del anillo y atrapa al H+; en el pirrol es parte de los 6 pi."""
    L = Lienzo(AW_, AH_)
    L.title('PAR LIBRE')
    t = T % 8
    L.line(48, 13, 48, 56, 1, dash=2)
    # piridina: N arriba, par libre hacia afuera
    v = ring(L, 24, 40, 12, int((T % 4) // 2), w=1)
    nx, ny = v[0]
    for dx in range(-3, 4):
        for dy in range(-3, 4):
            L.px(nx + dx, ny + dy, 0)
    L.text(int(nx) - 2, int(ny) - 2, 'N', 7)
    if t < 3:
        u = ease(t / 3.0)
        L.px(nx - 1, ny - 6, 3)
        L.px(nx + 1, ny - 6, 3)
        L.text(int(nx) - 4, int(4 + 8 * u) - 4, 'H+', 4)
        L.curve((nx, ny - 7), (nx - 7, ny - 11), (nx - 1, 4 + 8 * u + 2), 4, ease((t - 0.6) / 1.8))
    else:
        L.line(nx, ny - 4, nx, ny - 8, 2)
        L.text(int(nx) - 2, int(ny) - 14, 'H', 2)
        L.text(int(nx) + 4, int(ny) - 15, '+', 4)
        check(L, 38, 18)
    # pirrol: anillo de 5, el par libre del N gira dentro de la nube pi
    cx, cy, r = 72, 38, 11
    pv = [(cx + r * math.cos(math.radians(90 + 72 * k)), cy + r * math.sin(math.radians(90 + 72 * k))) for k in range(5)]
    L.poly(pv, 2, 2)
    L.line(pv[1][0] - 2, pv[1][1] - 3, pv[2][0] + 1, pv[2][1] + 3, 2)
    L.line(pv[4][0] + 2, pv[4][1] - 3, pv[3][0] - 1, pv[3][1] + 3, 2)
    bx, by = pv[0]
    for dx in range(-3, 4):
        for dy in range(-3, 4):
            L.px(bx + dx, by + dy, 0)
    L.text(int(bx) - 2, int(by) - 2, 'N', 7)
    L.line(bx, by + 4, bx, by + 7, 1)
    L.text(int(bx) - 2, int(by) + 8, 'H', 1)
    for k in range(6):
        a = T * 1.4 + k * math.pi / 3
        L.px(cx + 5.5 * math.cos(a), cy - 1 + 5.5 * math.sin(a), 3 if k < 2 else 2)
    if t < 3:
        u = ease(t / 3.0)
        L.text(int(90 - 8 * u), int(8 + 12 * u), 'H+', 4)
    else:
        u = ease((t - 3) / 3.0)
        L.text(int(82 + 6 * u), int(20 - 12 * u), 'H+', 4 if int(T * 3) % 2 else 1)
        cross(L, 87, 30)
    L.text(1, 62, 'PIRIDINA', 2)
    L.text(57, 62, 'PIRROL', 1)
    return L.a


CAMARA = {'aminas': alc_aminas, 'aromaticos': alc_aromaticos, 'heterociclos': alc_heterociclos}


# ---------------------------------------------------------------- Sala de entrenamiento (murales de estación)
def sala_ejercicios(T, ok=0.0):
    """Tanda de hoy: diez fichas mezcladas de varios temas; `ok` (0 a 1) es el acierto sin ayuda de la ficha actual."""
    L = Lienzo(AW_, AH_)
    L.title('TANDA DE HOY')
    hechas = [2, 5, 2] + ([2] if ok >= 0.5 else [])            # 2 acierto, 5 error
    for k in range(10):
        cx = 7 + k * 9
        if k < len(hechas):
            if hechas[k] == 2:
                check(L, cx - 4, 16)
            else:
                cross(L, cx - 2, 13)
        elif k == len(hechas):
            L.circle(cx, 16, 2.6, 4 if int(T * 3) % 2 else 1)
        else:
            L.circle(cx, 16, 2.6, 1)
    temas = ['AMINAS', 'SN2', 'AROMÁTICOS']
    tema = temas[len(hechas) % 3]
    w = len(tema) * 6 - 1
    L.text((AW_ - w) // 2, 27, tema, 2)
    sel = int(T * 1.6) % 3 if ok < 0.25 else 1
    for j, ch in enumerate('ABC'):
        x0 = 13 + j * 26
        col = 2 if (ok >= 0.25 and j == 1) else 1
        L.poly([(x0, 38), (x0 + 18, 38), (x0 + 18, 52), (x0, 52)], col)
        L.text(x0 + 7, 43, ch, 3 if col == 2 else 1)
        if j == sel and ok < 0.5:
            L.text(x0 - 7, 43, '>', 4)
    L.text(3, 62, 'SIN PISTAS', 1)
    L.text(68, 62, f'{len(hechas)}/10', 4)
    return L.a


def sala_guias(T):
    """Guía del profe pregunta por pregunta, con corrección real; la P4 se resuelve y la barra avanza."""
    L = Lienzo(AW_, AH_)
    L.title('GUÍA 3 · AMINAS')
    t = T % 10
    res = [2, 2, 5, 2 if t >= 5 else 0, 0, 0]
    for k, r in enumerate(res):
        x, y = (8 if k < 3 else 54), 16 + (k % 3) * 13
        L.text(x, y, f'P{k + 1}', 2 if r else 1)
        if r == 2:
            check(L, x + 16, y + 2)
        elif r == 5:
            cross(L, x + 17, y)
        elif k == 3:
            L.text(x + 16, y, '-', 4 if int(T * 3) % 2 else 1)
    n = sum(1 for r in res if r == 2)
    L.poly([(8, 57), (88, 57), (88, 62), (8, 62)], 1)
    L.line(10, 59, 10 + int(76 * n / 6), 59, 2, w=2)
    return L.a


def sala_pruebas(T):
    """Prueba antigua en dos modos: simulacro (reloj real, nota al final) o práctica (sin tiempo, corrige cada pregunta)."""
    L = Lienzo(AW_, AH_)
    L.title('PEP 1 · 2024')
    t = T % 12
    sim = t < 6
    L.text(14, 14, 'SIMULACRO', 4 if sim else 1)
    L.text(14, 23, 'PRÁCTICA', 4 if not sim else 1)
    L.text(6, 14 if sim else 23, '>', 4)
    if sim:
        L.text(20, 40, f'{90 - int(t * 4)} MIN', 3)
        L.poly([(70, 34), (80, 34), (75, 41)], 4)
        L.poly([(75, 41), (80, 48), (70, 48)], 4)
        L.line(75, 41, 75, 47, 4)
        L.text(10, 58, 'NOTA AL FINAL', 1)
    else:
        L.text(10, 36, 'P1', 2)
        check(L, 26, 38)
        L.text(10, 46, 'P2', 2)
        if t >= 8:
            cross(L, 27, 46)
            L.line(42, 48, 42 + int(min(t - 8, 2) * 20), 48, 1)
        L.text(10, 58, 'SIN TIEMPO', 1)
    return L.a


SALA = {'ejercicios': sala_ejercicios, 'guias': sala_guias, 'pruebas': sala_pruebas}


MURALES = {
    'organica': (org_resonancia, org_sn2),
    'analitica': (ana_curva, ana_bureta),
    'fisico': (fq_energia, fq_equilibrio),
    'fisio': (fisio_neurona, fisio_ecg),
}
