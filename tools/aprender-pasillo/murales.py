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
    'I': ['XXXXX', '..X..', '..X..', '..X..', 'XXXXX'], 'K': ['X..X.', 'X.X..', 'XX...', 'X.X..', 'X..X.'],
    'L': ['X....', 'X....', 'X....', 'X....', 'XXXXX'], 'M': ['X...X', 'XX.XX', 'X.X.X', 'X...X', 'X...X'],
    'N': ['X...X', 'XX..X', 'X.X.X', 'X..XX', 'X...X'], 'O': ['.XXX.', 'X...X', 'X...X', 'X...X', '.XXX.'],
    'P': ['XXXX.', 'X...X', 'XXXX.', 'X....', 'X....'], 'Q': ['.XXX.', 'X...X', 'X...X', 'X..XX', '.XXXX'],
    'R': ['XXXX.', 'X...X', 'XXXX.', 'X..X.', 'X...X'], 'S': ['.XXXX', 'X....', '.XXX.', '....X', 'XXXX.'],
    'T': ['XXXXX', '..X..', '..X..', '..X..', '..X..'], 'U': ['X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
    'V': ['X...X', 'X...X', 'X...X', '.X.X.', '..X..'], 'X': ['X...X', '.X.X.', '..X..', '.X.X.', 'X...X'],
    '0': ['.XXX.', 'X..XX', 'X.X.X', 'XX..X', '.XXX.'], '1': ['..X..', '.XX..', '..X..', '..X..', '.XXX.'],
    '2': ['XXXX.', '....X', '.XXX.', 'X....', 'XXXXX'], '7': ['XXXXX', '....X', '...X.', '..X..', '..X..'],
    '-': ['.....', '.....', 'XXXXX', '.....', '.....'], '+': ['.....', '..X..', '.XXX.', '..X..', '.....'],
    ' ': ['...', '...', '...', '...', '...'],
}
ACCENT = {'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'}


class Lienzo:
    def __init__(self):
        self.a = np.zeros((PH, PW), np.uint8)

    def px(self, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < PW and 0 <= y < PH:
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
        yy, xx = np.mgrid[0:PH, 0:PW]
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
        self.text((PW - w) // 2, 3, s, c)

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


MURALES = {
    'organica': (org_resonancia, org_sn2),
    'analitica': (ana_curva, ana_bureta),
    'fisico': (fq_energia, fq_equilibrio),
    'fisio': (fisio_neurona, fisio_ecg),
}
