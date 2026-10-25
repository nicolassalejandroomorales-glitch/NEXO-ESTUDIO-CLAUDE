"""Piezas compartidas de los bocetos de las salas nuevas del Sótano (Aula y Mesa del alquimista).

Idea: el mundo se dibuja en pixel art a 480x270 (más detalle que los 320x200 del pasillo) con las rampas de
tools/home-pixel/pixel.py; el texto que se estudia (páginas, enunciados) va encima, nítido, a la resolución final.
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'home-pixel'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'aprender-pasillo'))
import pixel  # noqa: E402
from murales import FONT  # noqa: E402

W, H = 480, 270
SCALE = 3
OUT = os.path.join(ROOT, 'docs', 'salas-sotano')
SERIF = '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
SERIF_B = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
SERIF_I = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf'


def font(path, size):
    return ImageFont.truetype(path if os.path.exists(path) else SERIF, size)


def h2(a, b):
    v = np.sin(a * 12.9898 + b * 78.233) * 43758.5453
    return v - np.floor(v)


class Cam:
    """Cámara en primera persona: posición, giro (yaw) e inclinación (pitch), campo horizontal en grados."""

    def __init__(self, pos, pitch_deg=0.0, yaw_deg=0.0, hfov=78.0):
        self.E = np.array(pos, np.float32)
        p, y = math.radians(pitch_deg), math.radians(yaw_deg)
        self.fw = np.array([math.sin(y) * math.cos(p), math.sin(p), math.cos(y) * math.cos(p)], np.float32)
        self.rt = np.array([math.cos(y), 0.0, -math.sin(y)], np.float32)
        self.up = np.cross(self.fw, self.rt)
        self.f = (W / 2) / math.tan(math.radians(hfov) / 2)

    def rays(self):
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        cx = (xx + 0.5 - W / 2) / self.f
        cy = -(yy + 0.5 - H / 2) / self.f
        d = cx[..., None] * self.rt + cy[..., None] * self.up + self.fw
        return d / np.linalg.norm(d, axis=-1, keepdims=True)

    def project(self, p):
        v = np.asarray(p, np.float32) - self.E
        z = float(v @ self.fw)
        return W / 2 + self.f * float(v @ self.rt) / z, H / 2 - self.f * float(v @ self.up) / z, z


def blocks(u, v, rowh, bw, seed=0.0):
    """Sillares: devuelve (nivel base, mortero) para coordenadas de superficie u, v en metros."""
    row = np.floor(v / rowh)
    off = (row % 2) * bw * 0.5
    col = np.floor((u + off) / bw)
    fu = (u + off) / bw - col
    fv = v / rowh - row
    n = h2(row + seed, col)
    mortar = (fu < 0.05) | (fv < 0.09)
    lvl = 1.1 + n * 0.9 + np.where(fv > 0.82, 0.55, 0.0) - np.where(fu < 0.12, 0.3, 0.0)
    return lvl, mortar, n


def voronoi(u, v, cell):
    """Distancias F1, F2 a semillas de una grilla con jitter (facetas de cristal) y el id de la celda."""
    gu, gv = np.floor(u / cell), np.floor(v / cell)
    f1 = np.full(u.shape, 9.0, np.float32)
    f2 = np.full(u.shape, 9.0, np.float32)
    cid = np.zeros(u.shape, np.float32)
    for du in (-1, 0, 1):
        for dv in (-1, 0, 1):
            a, b = gu + du, gv + dv
            su = (a + 0.15 + 0.7 * h2(a, b)) * cell
            sv = (b + 0.15 + 0.7 * h2(b + 3.1, a)) * cell
            d = np.hypot(u - su, v - sv)
            closer = d < f1
            f2 = np.where(closer, f1, np.minimum(f2, d))
            cid = np.where(closer, h2(a + 7.0, b - 2.0), cid)
            f1 = np.where(closer, d, f1)
    return f1, f2, cid


def point_light(P, N, lights):
    """Campo de luz (escalones de rampa) por luces puntuales: (pos, fuerza, radio)."""
    L = np.zeros(P.shape[:-1], np.float32)
    for pos, s, r in lights:
        d = np.asarray(pos, np.float32) - P
        dist = np.linalg.norm(d, axis=-1) + 1e-4
        lam = np.clip((d * N).sum(-1) / dist, 0, 1) if N is not None else 1.0
        L += s * lam / (1.0 + (dist / r) ** 2)
    return L


def text_mask(txt, scale=1):
    """Texto con la fuente 5x5 de los murales -> arreglo bool (alto 5*scale)."""
    cols = []
    for ch in txt.upper():
        g = FONT.get(ch)
        if g is None:
            cols.append(np.zeros((5, 3), bool))
        else:
            cols.append(np.array([[c == 'X' for c in row] for row in g], bool))
        cols.append(np.zeros((5, 1), bool))
    m = np.concatenate(cols, axis=1) if cols else np.zeros((5, 1), bool)
    return np.kron(m, np.ones((scale, scale), bool))


def stamp(arr, m, x, y, val):
    """Pega una máscara bool en un arreglo 2D (x, y = esquina superior izquierda)."""
    h, w = m.shape
    x, y = int(round(x)), int(round(y))
    y0, x0 = max(0, y), max(0, x)
    y1, x1 = min(arr.shape[0], y + h), min(arr.shape[1], x + w)
    if y1 <= y0 or x1 <= x0:
        return
    sub = m[y0 - y:y1 - y, x0 - x:x1 - x]
    arr[y0:y1, x0:x1][sub] = val


def disc(shape, cx, cy, r):
    yy, xx = np.mgrid[0:shape[0], 0:shape[1]]
    return np.hypot(xx - cx, yy - cy) <= r


def poly_mask(pts, shape=(H, W)):
    img = Image.new('L', (shape[1], shape[0]), 0)
    ImageDraw.Draw(img).polygon([(float(x), float(y)) for x, y in pts], fill=1)
    return np.array(img, bool)


def paste_sprite(rgb, path, x, y, alpha=1.0):
    """Pega un sprite RGBA sobre la imagen a tamaño de arte (sin escalar: pixel art 1:1)."""
    sp = np.array(Image.open(path).convert('RGBA'), np.float32)
    h, w = sp.shape[:2]
    x, y = int(round(x)), int(round(y))
    y0, x0 = max(0, y), max(0, x)
    y1, x1 = min(rgb.shape[0], y + h), min(rgb.shape[1], x + w)
    if y1 <= y0 or x1 <= x0:
        return
    s = sp[y0 - y:y1 - y, x0 - x:x1 - x]
    a = (s[..., 3:4] / 255.0 > 0.5) * alpha
    rgb[y0:y1, x0:x1] = rgb[y0:y1, x0:x1] * (1 - a) + s[..., :3] * a


def persp_coeffs(dst, src):
    """Coeficientes de Image.transform(PERSPECTIVE): para cada punto de salida (dst) da el de entrada (src)."""
    A, B = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); B.append(v)
    return np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()


def warp_onto(final, page, quad):
    """Pone una imagen RGBA plana (página) sobre un cuadrilátero de la imagen final (tl, tr, br, bl)."""
    pw, ph = page.size
    src = [(0, 0), (pw, 0), (pw, ph), (0, ph)]
    c = persp_coeffs(quad, src)
    warped = page.transform(final.size, Image.PERSPECTIVE, c, Image.BICUBIC)
    final.alpha_composite(warped)


def draw_flame(c, x0, y0, hgt, t, seed):
    """Llama de pixel art (base en x0, y0) con alto hgt en píxeles."""
    hgt = max(3, int(hgt))
    for j in range(hgt):
        f = j / hgt
        wdt = (1 - f) ** 0.7 * hgt * 0.32 * (1 + 0.15 * math.sin(t * 17 + seed + j))
        xc = x0 + math.sin(t * 9 + seed + j * 0.6) * f * hgt * 0.12
        for i in range(int(-wdt), int(wdt) + 1):
            lvl = 5 - f * 3.5 - abs(i) / (wdt + 1) * 2
            c.px(xc + i, y0 - j, 'flame', max(0, lvl))
            c.lock[min(H - 1, max(0, int(y0 - j))), min(W - 1, max(0, int(xc + i)))] = True


def save(frames, name, ms=80, gif_scale=2):
    """frames: imágenes RGBA a tamaño final (x3). Guarda un PNG del cuadro clave y un GIF liviano."""
    os.makedirs(OUT, exist_ok=True)
    seq = [f.convert('RGB').resize((W * gif_scale, H * gif_scale), Image.LANCZOS) for f in frames]
    pal = seq[len(seq) // 2].quantize(colors=255, method=Image.MEDIANCUT)
    q = [s.quantize(palette=pal, dither=Image.NONE) for s in seq]
    q[0].save(os.path.join(OUT, name + '.gif'), save_all=True, append_images=q[1:], duration=ms, loop=0, optimize=True)
