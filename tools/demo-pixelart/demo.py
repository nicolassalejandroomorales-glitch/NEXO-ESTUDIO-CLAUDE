# Demo de pixel art hecho 100 % con código (sin imágenes IA).
# Lienzo de 320x180 píxeles de arte, escalado x4 (1280x720) sin suavizar.
# Uso: python tools/demo-pixelart/demo.py  -> docs/demo-pixelart/demo-pixelart.mp4
import math, os, shutil, subprocess
import numpy as np
from PIL import Image

W, H, S, FPS = 320, 180, 4, 12
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'docs', 'demo-pixelart')
FR = os.path.join(OUT, '_frames')
rng = np.random.default_rng(7)

B4 = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], float) / 16 + 1 / 32
BT = np.tile(B4, (H // 4, W // 4))
YY, XX = np.mgrid[0:H, 0:W] + 0.5

FONT = {
 'A': '010101111101101', 'B': '110101110101110', 'C': '011100100100011', 'D': '110101101101110',
 'E': '111100110100111', 'F': '111100110100100', 'G': '011100101101011', 'H': '101101111101101',
 'I': '111010010010111', 'J': '001001001101010', 'K': '101101110101101', 'L': '100100100100111',
 'M': '101111111101101', 'N': '110101101101101', 'O': '010101101101010', 'P': '110101110100100',
 'Q': '010101101110011', 'R': '110101110101101', 'S': '011100010001110', 'T': '111010010010010',
 'U': '101101101101111', 'V': '101101101101010', 'W': '101101111111101', 'X': '101101010101101',
 'Y': '101101010010010', 'Z': '111001010100111', '0': '111101101101111', '1': '010110010010111',
 '2': '110001010100111', '3': '110001010001110', '4': '101101111001001', '5': '111100110001110',
 '6': '011100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001110',
 ' ': '000000000000000', '.': '000000000000010', ':': '000010000010000', '-': '000000111000000',
 '+': '000010111010000', '!': '010010010000010', '/': '001001010100100',
}

def tw(s, sc=1):
    return len(s) * 4 * sc - sc

def text(img, s, x, y, col, sc=1, shadow=(12, 10, 24)):
    for c, o in ((shadow, sc), (col, 0)):
        if c is None:
            continue
        cx = x
        for ch in s:
            g = FONT.get(ch, FONT[' '])
            for i, b in enumerate(g):
                if b == '1':
                    r, k = divmod(i, 3)
                    y0, x0 = y + r * sc + o, cx + k * sc + o
                    if 0 <= y0 < H and 0 <= x0 < W:
                        img[y0:y0 + sc, x0:x0 + sc] = c
            cx += 4 * sc

def ctext(img, s, y, col, sc=1):
    text(img, s, (W - tw(s, sc)) // 2, y, col, sc)

def dq(t, n):
    """Cuantiza 0..1 a n tonos con dither ordenado (Bayer 4x4)."""
    v = np.clip(t, 0, 1) * (n - 1)
    i = np.floor(v)
    return np.clip(i + ((v - i) > BT), 0, n - 1).astype(int)

def nq(t, n):
    return np.clip(np.round(np.clip(t, 0, 1) * (n - 1)), 0, n - 1).astype(int)

def dilate(m):
    o = m.copy()
    o[1:] |= m[:-1]; o[:-1] |= m[1:]; o[:, 1:] |= m[:, :-1]; o[:, :-1] |= m[:, 1:]
    return o

def lerp(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(len(a)))

def canvas(col=(0, 0, 0)):
    img = np.zeros((H, W, 3), np.uint8)
    img[:] = col
    return img

def bg_vignette(img, ramp):
    ramp = np.array(ramp, np.uint8)
    d = np.hypot((XX - W / 2) / (W * 0.6), (YY - H / 2) / (H * 0.6))
    img[:] = ramp[dq(1 - d, len(ramp))]

# ------------------------------------------------------------------ esfera
ORB = np.array([(22, 18, 44), (34, 46, 94), (36, 96, 128), (52, 150, 138), (118, 206, 146), (236, 248, 196)], np.uint8)
BGA = [(14, 11, 26), (22, 17, 40), (30, 23, 54)]

def sphere(img, cx, cy, r, step, ang, ramp=ORB, shadow=True):
    dx, dy = (XX - cx) / r, (YY - cy) / r
    d2 = dx * dx + dy * dy
    m = d2 <= 1
    nz = np.sqrt(np.clip(1 - d2, 0, 1))
    L = np.array([math.cos(ang) * 0.75, -0.55, 0.55]); L /= np.linalg.norm(L)
    dot = dx * L[0] + dy * L[1] + nz * L[2]
    lam = np.clip(dot * 0.75 + 0.3, 0, 1)
    if shadow:
        sm = ((XX - cx + L[0] * 14) / r) ** 2 + ((YY - (cy + r + 5)) / (r * 0.22)) ** 2 <= 1
        img[sm & ((BT < 0.55) if step >= 3 else True)] = (8, 6, 16)
    if step == 0:
        img[m] = ramp[3]
    else:
        idx = 1 + (dq(lam, 4) if step >= 3 else nq(lam, 4))
        img[m] = ramp[idx[m]]
    if step >= 3:
        img[m & (dot > 0.985)] = ramp[5]
        img[m & (d2 > 0.78) & (dot < -0.1) & (dy > 0.2)] = ramp[2]   # luz rebotada
    if step >= 2:
        img[dilate(m) & ~m] = ramp[0]

def scene_sphere():
    frames = []
    subs = ['PASO 1: COLOR PLANO', 'PASO 2: SOMBRA EN 4 TONOS', 'PASO 3: CONTORNO OSCURO', 'PASO 4: DITHER + BRILLO + REBOTE']
    for f in range(18 * 4 + 42):
        step = min(f // 18, 3)
        rot = f >= 72
        ang = math.pi * 0.75 + (f - 72) * 0.15 if rot else math.pi * 0.75
        img = canvas(); bg_vignette(img, BGA)
        sphere(img, 105, 95, 34, step, ang)
        ctext(img, '1 RAMPAS DE COLOR', 8, (255, 214, 120), 2)
        ctext(img, 'LUZ QUE GIRA: LA SOMBRA SE CALCULA SOLA' if rot else subs[step], 28, (220, 220, 240))
        if step >= 1:
            text(img, 'RAMPA', 200, 50, (200, 200, 230))
            for i, c in enumerate(ORB):
                img[59:73, 200 + i * 17:214 + i * 17] = c
                img[59:60, 200 + i * 17:214 + i * 17] = ORB[0]
                img[72:73, 200 + i * 17:214 + i * 17] = ORB[0]
            text(img, 'SOMBRA AZUL - LUZ AMARILLA', 200, 77, (150, 150, 190), shadow=None)
        if step >= 3:
            crop = img[95 - 8:95 + 8, 68:84].copy()
            zoom = crop.repeat(4, 0).repeat(4, 1)
            text(img, 'ZOOM X4', 236, 96, (200, 200, 230))
            img[104:170, 235:301] = (240, 230, 200)
            img[105:169, 236:300] = zoom
            img[87:88, 67:85] = img[104:105, 67:85] = (240, 230, 200)
            img[87:105, 67:68] = img[87:105, 84:85] = (240, 230, 200)
        frames.append(img)
    return frames

# ------------------------------------------------------------------ slime
SLM = np.array([(18, 32, 40), (30, 74, 62), (46, 128, 76), (98, 190, 84), (176, 232, 120), (240, 252, 204)], np.uint8)
FIRE = np.array([(110, 28, 44), (206, 76, 40), (248, 156, 58), (255, 234, 150)], np.uint8)
WALL = np.array([(26, 22, 42), (40, 32, 58), (70, 46, 60), (112, 70, 62)], np.uint8)
FLOOR = np.array([(22, 16, 26), (38, 28, 36), (62, 42, 46), (98, 64, 56)], np.uint8)
HOPS = [0, 0, 0, 7, 17, 26, 33, 37, 38, 37, 33, 26, 17, 7, 0, 0]
SQY = [0.72, 0.84, 0.96, 1.22, 1.14, 1.05, 1.0, 0.97, 0.95, 0.97, 1.0, 1.05, 1.14, 1.22, 0.68, 0.84]

def slime(img, cx, gy, sx, sy, blink=False, f=0, size=1.0):
    rx, ry = 22 * sx * size, 18 * sy * size
    cy = gy - ry
    dx, dy = (XX - cx) / rx, (YY - cy) / ry
    d = dx * dx + np.abs(dy) ** np.where(dy > 0, 6, 2)
    m = d <= 1
    nz = np.sqrt(np.clip(1 - d, 0, 1))
    L = np.array([-0.5, -0.65, 0.6]); L /= np.linalg.norm(L)
    lam = np.clip((dx * L[0] + dy * L[1] + nz * L[2]) * 0.75 + 0.32, 0, 1)
    img[m] = SLM[1 + dq(lam, 4)[m]]
    # burbujas internas que suben
    for i in range(3):
        by = cy + ry * 0.6 - ((f * 0.8 + i * 9) % (ry * 1.2))
        bx = cx + (i - 1) * rx * 0.35 + math.sin(f * 0.3 + i) * 2
        b = (np.hypot(XX - bx, YY - by) <= 1.3 * size) & m
        img[b] = SLM[4]
    hl = (((XX - (cx - rx * 0.42)) / (rx * 0.2)) ** 2 + ((YY - (cy - ry * 0.48)) / (ry * 0.13)) ** 2) <= 1
    img[hl & m] = SLM[5]
    img[dilate(m) & ~m] = SLM[0]
    k = max(1, round(size))
    ey = int(cy - ry * 0.05)
    for s in (-1, 1):
        ex = int(cx + s * 7 * sx * size)
        if blink:
            img[ey + 2 * k:ey + 3 * k, ex - k:ex + 2 * k] = (16, 20, 30)
        else:
            img[ey:ey + 5 * k, ex - k:ex + 2 * k] = (16, 20, 30)
            img[ey + k:ey + 2 * k, ex - k:ex] = (255, 255, 255)
        img[ey + 6 * k:ey + 7 * k, ex + s * 3 * k - k:ex + s * 3 * k + k] = (232, 120, 140)
    my, mx = ey + 6 * k, int(cx)
    for ox, oy in ((-2, 0), (-1, 1), (0, 1), (1, 1), (2, 0)):
        img[my + oy * k:my + (oy + 1) * k, mx + ox * k:mx + (ox + 1) * k] = (16, 20, 30)

def fire(img, x, y, f, scale=1.0):
    r = np.random.default_rng(f)
    noise = r.random((H // 2 + 1, W // 2 + 1)).repeat(2, 0).repeat(2, 1)[:H, :W]
    dx = (XX - x - math.sin(f * 0.9) * 1.2 * (y - YY).clip(0) / 10) / (5 * scale)
    dy = (YY - y) / np.where(YY < y, 13 * scale, 5 * scale)
    v = 1 - np.hypot(dx, dy) + (noise - 0.5) * 0.45
    m = v > 0
    img[m] = FIRE[nq(v * 1.6, 4)[m]]

def scene_slime():
    frames, drops = [], []
    for f in range(16 * 3 + 8):
        c = f % 16
        img = canvas()
        flick = 1 + 0.06 * math.sin(f * 1.7) + 0.04 * math.sin(f * 3.1)
        glow = np.clip(1 - np.hypot(XX - 60, (YY - 66) * 1.1) / (95 * flick), 0, 1) ** 1.3
        wall = (YY < 132)
        brick = ((YY.astype(int) % 10) == 0) | ((((XX.astype(int) + (YY.astype(int) // 10) % 2 * 10) % 20) == 0))
        widx = dq(glow, 4)
        img[wall] = WALL[np.clip(widx - brick, 0, 3)[wall]]
        fl = ~wall
        plank = ((XX.astype(int) + (YY.astype(int) - 132) // 1 * 0) % 26 == 0) | (YY.astype(int) == 132)
        fidx = dq(glow * 1.15, 4)
        img[fl] = FLOOR[np.clip(fidx - plank, 0, 3)[fl]]
        img[74:92, 58:63] = (70, 44, 30); img[74:92, 58:59] = (40, 26, 22)
        img[72:75, 55:66] = (90, 60, 40)
        fire(img, 60.5, 68, f)
        gy, cx = 150, 175
        h, sy = HOPS[c], SQY[c]
        sx = 1 / sy ** 0.85
        sh = (((XX - cx) / (24 * sx * (1 - h / 70))) ** 2 + ((YY - gy - 1) / 3) ** 2) <= 1
        img[sh & (BT < 0.6)] = (14, 10, 18)
        if c == 14:
            for i in range(6):
                drops.append([cx + (i - 2.5) * 6, gy - 4, (i - 2.5) * 0.9, -2.2 - (i % 3) * 0.6])
        slime(img, cx, gy - h, sx, sy, blink=(f % 23 in (20, 21)), f=f)
        for d in drops:
            d[0] += d[2]; d[1] += d[3]; d[3] += 0.45
            if d[1] < gy:
                img[int(d[1]):int(d[1]) + 2, int(d[0]):int(d[0]) + 2] = SLM[3]
                img[int(d[1]), int(d[0])] = SLM[5]
        drops = [d for d in drops if d[1] < gy]
        ctext(img, '2 ANIMACION', 8, (255, 214, 120), 2)
        ctext(img, 'ESTIRAR Y APLASTAR + FUEGO CON RUIDO', 28, (220, 220, 240))
        frames.append(img)
    return frames

# ------------------------------------------------------------------ dia y noche
KH = [0, 5, 6.5, 9, 16.5, 18.5, 20.5, 24]
NIGHT = ((8, 10, 28), (26, 30, 66), (0.30, 0.34, 0.60), 1)
DAWN = ((56, 62, 128), (246, 150, 112), (1.0, 0.74, 0.70), 0)
DAY = ((58, 124, 214), (168, 214, 246), (1.0, 1.0, 1.0), 0)
DUSK = ((66, 46, 112), (244, 116, 84), (1.0, 0.66, 0.58), 0.1)
KS = [NIGHT, NIGHT, DAWN, DAY, DAY, DUSK, NIGHT, NIGHT]

def sky_at(h):
    h %= 24
    for i in range(len(KH) - 1):
        if KH[i] <= h <= KH[i + 1]:
            t = (h - KH[i]) / (KH[i + 1] - KH[i])
            a, b = KS[i], KS[i + 1]
            return lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), a[3] + (b[3] - a[3]) * t

def tint(c, t):
    return tuple(int(min(255, c[i] * t[i])) for i in range(3))

STARS = [(rng.integers(2, W - 2), rng.integers(4, 110), rng.random() * 6) for _ in range(70)]
FLIES = [(rng.random() * 140 + 30, rng.random() * 18 + 150, rng.random() * 6) for _ in range(9)]

def ridge(x, base, amps):
    return base + sum(a * math.sin(x * fr + ph) for a, fr, ph in amps)

PROF = [np.array([ridge(x, b, a) for x in range(W)]) for b, a in (
    (104, [(10, 0.031, 1), (5, 0.083, 2), (2, 0.21, 0)]),
    (122, [(7, 0.045, 4), (4, 0.11, 1), (1.5, 0.3, 3)]),
    (146, [(4, 0.025, 2), (2, 0.07, 5)]))]
LAYER = [(96, 104, 160), (62, 74, 120), (52, 96, 66)]
HAZE = [0.55, 0.3, 0.0]

def scene_daynight():
    frames = []
    N = 96
    for f in range(N):
        h = 5 + f / N * 24
        top, hor, tn, night = sky_at(h)
        img = canvas()
        bands = np.array([lerp(top, hor, k / 5) for k in range(6)], np.uint8)
        img[:] = bands[dq(np.clip(YY / 130, 0, 1) ** 1.3, 6)]
        for i, (sx, sy, ph) in enumerate(STARS):
            a = night * (0.6 + 0.4 * math.sin(f * 0.8 + ph))
            if a > BT[sy, sx]:
                img[sy, sx] = (230, 230, 255)
                if i % 12 == 0:
                    for ox, oy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        img[sy + oy, sx + ox] = (140, 140, 200)
        hd = h % 24
        if 6 <= hd <= 19:
            th = (hd - 6) / 13 * math.pi
            px, py = 160 - 140 * math.cos(th), 140 - 108 * math.sin(th)
            warm = 1 - min(1, math.sin(th) * 2)
            col = lerp((255, 244, 180), (255, 160, 80), warm)
            g = np.hypot(XX - px, YY - py)
            img[(g <= 12) & (BT < 0.35)] = lerp(col, hor, 0.4)
            img[g <= 7] = col
            img[(g <= 4) & (XX < px)] = lerp(col, (255, 255, 240), 0.6)
        mh = (hd - 19) % 24
        if mh <= 11:
            th = mh / 11 * math.pi
            px, py = 160 - 140 * math.cos(th), 140 - 108 * math.sin(th)
            g = np.hypot(XX - px, YY - py)
            img[g <= 6] = (228, 228, 206)
            img[(g <= 6) & (np.hypot(XX - px - 3, YY - py + 1) <= 5)] = (150, 150, 160)
            for ox, oy in ((-3, 1), (-2, -2)):
                img[int(py + oy), int(px + ox)] = (190, 190, 176)
        for k, pr in enumerate(PROF):
            c = lerp(tint(LAYER[k], tn), hor, HAZE[k] * (1 - night * 0.5))
            m = YY > pr[None, :]
            img[m] = c
            rim = m & (YY - pr[None, :] < 1.5)
            img[rim] = lerp(c, hor, 0.45 if k < 2 else 0.25)
        img[YY > 160] = tint((44, 82, 54), tn)
        for x in range(0, W, 7):
            img[int(PROF[2][x]) - 1, x] = tint((70, 120, 70), tn)
        # árbol: la luz viene del sol o de la luna
        lx = (px - 176) / 120
        L = np.array([lx, -0.6, 0.6]); L /= np.linalg.norm(L)
        img[134:156, 174:179] = tint((80, 52, 40), tn)
        dx, dy = (XX - 176) / 15, (YY - 128) / 13
        d2 = dx * dx + dy * dy; m = d2 <= 1
        lam = np.clip((dx * L[0] + dy * L[1] + np.sqrt(np.clip(1 - d2, 0, 1)) * L[2]) * 0.8 + 0.3, 0, 1)
        TREE = np.array([tint(c, tn) for c in ((20, 40, 40), (34, 80, 56), (60, 128, 64), (120, 180, 80))], np.uint8)
        img[m] = TREE[dq(lam, 4)[m]]
        img[dilate(m) & ~m & (YY < 140)] = tint((14, 26, 28), tn)
        # casa
        lit = night > 0.35
        img[138:158, 200:233] = tint((148, 98, 68), tn)
        for yy in range(141, 158, 4):
            img[yy, 200:233] = tint((112, 72, 52), tn)
        for i in range(17):
            img[138 - i, 196 + i:237 - i] = tint((150, 52, 60), tn)
            if i % 3 == 0:
                img[138 - i, 196 + i:237 - i] = tint((116, 36, 50), tn)
        img[120:132, 226:231] = tint((90, 80, 90), tn)
        img[148:158, 213:220] = tint((70, 42, 34), tn)
        if lit:
            gl = np.hypot(XX - 206, YY - 146)
            img[(gl > 4) & (BT < 0.45 * np.clip(1 - gl / 18, 0, 1)) & (YY < 160)] = (178, 128, 74)
        img[143:150, 203:210] = (255, 214, 120) if lit else tint((120, 170, 200), tn)
        img[146, 203:210] = img[143:150, 206] = tint((80, 52, 40), tn)
        # humo de la chimenea
        for i in range(8):
            age = ((f * 0.5 + i * 6) % 48) / 48
            sx_, sy_ = 228.5 + age * 28 + math.sin(age * 6 + i) * 3, 118 - age * 44
            r = 1.2 + age * 4
            sm = (np.hypot(XX - sx_, YY - sy_) <= r) & (BT < (1 - age) * 0.8)
            img[sm] = tint((190, 190, 200), tn)
        if night > 0.5:
            for i, (fx, fy, ph) in enumerate(FLIES):
                x = int(fx + math.sin(f * 0.15 + ph) * 8); y = int(fy + math.sin(f * 0.23 + ph * 2) * 4)
                if math.sin(f * 0.5 + ph * 3) > -0.3:
                    img[y, x] = (236, 255, 130)
        text(img, '3 LUZ: DIA Y NOCHE', 8, 8, (255, 214, 120), 2)
        hh, mm = int(hd), int((hd % 1) * 60)
        clock = f'{hh:02d}:{mm // 10 * 10:02d}'
        text(img, clock, W - tw(clock, 2) - 8, 8, (240, 240, 255), 2)
        frames.append(img)
    return frames

# ------------------------------------------------------------------ título y cierre
def scene_title():
    frames, t = [], 'DEMO PIXEL ART'
    for f in range(34):
        img = canvas(); bg_vignette(img, BGA)
        s = t[:min(len(t), f)]
        text(img, s, (W - tw(t, 4)) // 2, 50, (255, 214, 120), 4)
        if f >= 16:
            ctext(img, 'CADA PIXEL PUESTO CON CODIGO', 86, (220, 220, 240))
            ctext(img, '320 X 180 PIXELES - ESCALA X4', 96, (150, 150, 190))
        if f >= 20:
            p = min(1, (f - 20) / 6)
            slime(img, 160, 178 - int(30 * p) + 30, 1, 1, blink=False, f=f, size=0.8)
        frames.append(img)
    return frames

def scene_end():
    frames = []
    for f in range(40):
        img = canvas(); bg_vignette(img, BGA)
        ctext(img, 'HECHO PIXEL A PIXEL', 20, (255, 214, 120), 3)
        ctext(img, 'TODO CON CODIGO - SIN IMAGENES IA', 44, (220, 220, 240))
        sphere(img, 70, 118, 24, 3, math.pi * 0.75 + f * 0.2)
        c = f % 16
        slime(img, 160, 160 - HOPS[c], 1 / SQY[c] ** 0.85, SQY[c], f=f)
        fire(img, 250, 132, f, 1.3)
        img[134:156, 246:255] = (70, 44, 30)
        frames.append(img)
    return frames

def dissolve(a, b, n=8):
    out = []
    for i in range(n):
        m = BT < (i + 1) / n
        x = a.copy(); x[m] = b[i][m] if isinstance(b, list) else b[m]
        out.append(x)
    return out

def main():
    shutil.rmtree(FR, ignore_errors=True); os.makedirs(FR)
    scenes = [scene_title(), scene_sphere(), scene_slime(), scene_daynight(), scene_end()]
    allf = list(scenes[0])
    for sc in scenes[1:]:
        allf += dissolve(allf[-1], sc) + sc[8:]
    for i, fr in enumerate(allf):
        Image.fromarray(fr).resize((W * S, H * S), Image.NEAREST).save(os.path.join(FR, f'f_{i:04d}.png'))
    stills = {'1-titulo': 30, '2-esfera': 34 + 105, '3-slime': 34 + 114 + 8 + 3, '4-dia': 34 + 114 + 56 + 50, '5-noche': 34 + 114 + 56 + 86}
    for k, i in stills.items():
        Image.fromarray(allf[min(i, len(allf) - 1)]).resize((W * S, H * S), Image.NEAREST).save(os.path.join(OUT, f'cuadro-{k}.png'))
    mp4 = os.path.join(OUT, 'demo-pixelart.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', os.path.join(FR, 'f_%04d.png'),
                    '-vf', 'fps=24', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '14', mp4], check=True)
    shutil.rmtree(FR)
    print(len(allf), 'cuadros,', round(len(allf) / FPS, 1), 's ->', mp4)

if __name__ == '__main__':
    main()
