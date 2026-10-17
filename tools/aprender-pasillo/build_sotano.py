"""Sótano de los Cristales (ambiente Orgánica): pasillo en primera persona con perspectiva real.
Trazado de rayos sobre un túnel de piedra con costillas, nichos con puertas y un cruce con un pasillo lateral.
La cámara avanza, gira y entra por una puerta. Se pinta con las rampas de tools/home-pixel/pixel.py (pixel art).
Salida: docs/aprender-pasillo/sotano-pasos.gif, sotano-giro.gif y sotano-puerta.gif.
Correr: python tools/aprender-pasillo/build_sotano.py [pasos|giro|puerta]
"""
import math
import os
import random
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'home-pixel'))
import pixel as px  # noqa: E402
from pixel import Canvas, glow, BAYER  # noqa: E402
from murales import ACCENT, FONT, MURALES, PH, PW  # noqa: E402

px.RAMPS['crypt'] = px.hexes('#06080e', '#0c101a', '#141a28', '#1e2637', '#2b364f', '#3d4a68', '#566784', '#7587a6', '#9db0cc')
px.DITHERED.add('crypt')

OUT = os.path.join(ROOT, 'docs', 'aprender-pasillo')
W, H, F, CX = 320, 200, 140.0, 160.0
CY0 = 98.0
FLOOR, ZMAX, WALL = 0.75, 15.0, 1.1
NICHE, NICHE_R = 0.42, 0.75
RIB_EVERY = 5.0
ZJ = 7.6                                   # el pasillo lateral (B) sale a la derecha en esta z del pasillo principal (M)
FR = ['M', 'B']
# (lado, z central, estado) por pasillo; lado +1 derecha, -1 izquierda (en el eje local de cada pasillo)
DOORS = {'M': [(1, 2.6, 'repasos'), (-1, 3.3, 'abierta'), (-1, 7.8, 'abierta'), (1, 12.2, 'abierta')],
         'B': [(1, 3.2, 'futura'), (-1, 6.4, 'futura'), (1, 8.0, 'futura')]}
OPEN_DEFAULT = {'repasos': 0.22, 'abierta': 0.14, 'futura': 0.0}
# ramo de cada puerta, con su identidad: material de la luz, color del halo, hoja y cartel (líneas de texto)
RAMO = {('M', 0): 'organica', ('M', 1): 'analitica', ('M', 2): 'fisico', ('M', 3): 'fisio',
        ('B', 0): 'futuro', ('B', 1): 'futuro', ('B', 2): 'futuro'}
THEMES = {
    'organica': dict(lines=['ORGÁNICA II'], gap='sprout', halo='#b6f070', dots='sprout', leaf='green', leaf_lv=3.6),
    'analitica': dict(lines=['QUÍMICA', 'ANALÍTICA'], gap='crystal', halo='#7fe0f0', dots='crystal', leaf='blue', leaf_lv=4.0),
    'fisico': dict(lines=['FISICOQUÍMICA', 'II'], gap='arcane', halo='#b88cf4', dots='arcane', leaf='lav', leaf_lv=3.6),
    'fisio': dict(lines=['FISIO-', 'PATOLOGÍA'], gap='flame', halo='#ff8a5a', dots='flame', leaf='red', leaf_lv=3.8),
    'futuro': dict(lines=['PRÓXIMO', 'SEMESTRE'], gap='glow', halo='#ffcf70', dots='rune', leaf='blue', leaf_lv=2.0),
}

# fuente de 5x5 (más una fila arriba para la tilde) para los carteles tipo Minecraft
SIGN_W, SIGN_H = 168, 30
SIGN_HALF = 1.03
_sign_cache = {}


def sign_texture(lines):
    """Letrero de piedra grabada: placa con bisel y letras talladas (fuente 5x5 al doble).
    Códigos: 0 placa, 1 bisel con luz, 8 bisel en sombra, 2 letra (brilla), 6 sombra dentro del surco, 7 canto con luz bajo la letra."""
    key = tuple(lines)
    if key in _sign_cache:
        return _sign_cache[key]
    tex = np.zeros((SIGN_H, SIGN_W), np.uint8)
    let = np.zeros((SIGN_H, SIGN_W), bool)
    y = (SIGN_H - (len(lines) * 12 + (len(lines) - 1) * 2)) // 2
    for text in lines:
        glyphs = [(FONT[ACCENT.get(ch, ch)], ch in ACCENT) for ch in text]
        x = (SIGN_W - (sum((len(g[0]) + 1) * 2 for g, _ in glyphs) - 2)) // 2
        for g, acc in glyphs:
            for ry, row in enumerate(g):
                for rx, chx in enumerate(row):
                    if chx == 'X':
                        let[y + 2 + ry * 2:y + 4 + ry * 2, x + rx * 2:x + rx * 2 + 2] = True
            if acc:
                ax = x + (len(g[0]) - 2) * 2
                let[y:y + 1, ax:ax + 3] = True
            x += (len(g[0]) + 1) * 2
        y += 14
    up_free = np.ones_like(let)
    up_free[1:] = ~let[:-1]
    left_free = np.ones_like(let)
    left_free[:, 1:] = ~let[:, :-1]
    below_let = np.zeros_like(let)
    below_let[1:] = let[:-1]
    right_let = np.zeros_like(let)
    right_let[:, 1:] = let[:, :-1]
    tex[let] = 2
    tex[let & (up_free | left_free)] = 6
    tex[~let & (below_let | right_let)] = 7
    tex[:2, :] = 1
    tex[:, :2] = 1
    tex[-2:, :] = 8
    tex[:, -2:] = 8
    _sign_cache[key] = tex
    return tex


def mural_colors(th):
    return {1: (th['dots'], 2.8), 2: (th['dots'], 5.6), 3: ('petal', 4.4), 4: ('rune', 5.0), 5: ('flame', 4.6),
            6: ('arcane', 5.8), 7: ('crystal', 5.4)}


SCALE = 3

# estado de la cámara (se cambia por cuadro con set_cam)
CAMX, CAMZ, YAW, PITCH, CY = 0.0, 0.0, 0.0, 0.0, CY0
TIME, PULSE = 0.0, 0.5
ALL_ITEMS = ('cr', 'ob', 'ro', 'mu', 'mo', 'to', 'la')
# estilo de la imagen: ruido (dither), brillos, cuánto se muestra y material de la puerta
STYLE = dict(dither=0.3, glow=1.0, coldk=1.0, warmk=1.0, tone=1.0, fog=0.0, gamma=1.0, post=False, items=ALL_ITEMS, particles=True, leaf='panel')
STYLES = {
    'a': dict(dither=0.0, glow=0.35, coldk=0.5, warmk=0.7, gamma=1.0, post=True, items=('ob', 'to', 'mo'), particles=False, leaf='panel'),
    'b': dict(dither=0.15, glow=0.3, coldk=0.6, warmk=0.5, tone=1.3, fog=1.0, gamma=1.5, post=False, items=('cr', 'to', 'ob'), particles=True, leaf='stone'),
    'c': dict(dither=0.2, glow=0.8, coldk=0.25, warmk=1.9, gamma=1.0, post=False, items=('ob', 'to', 'la', 'mu', 'ro'), particles=True, leaf='panel'),
}
STYLE.update(STYLES['b'])               # estilo elegido por Niquito (17 oct): piedra mágica, contrastada y oscura


def set_cam(x, z, yaw=0.0, bob=0.0, pitch=0.0, time=0.0):
    global CAMX, CAMZ, YAW, PITCH, CY, TIME, PULSE
    CAMX, CAMZ, YAW, PITCH, CY = x, z, yaw, pitch, CY0 + bob
    TIME, PULSE = time, 0.5 + 0.5 * math.sin(time * 1.7)


# ---------- marcos de referencia ----------
def loc2w(fr, p):
    return np.array(p, np.float32) if fr == 'M' else np.array([p[2], p[1], p[0] + ZJ], np.float32)


def fvec(fr, v):
    return np.array(v, np.float32) if fr == 'M' else np.array([v[2], v[1], v[0]], np.float32)


def camdir(v):
    """Vector del mundo a espacio de cámara (primero el giro y luego la inclinación)."""
    c_, s_ = math.cos(YAW), math.sin(YAW)
    cp, sp = math.cos(PITCH), math.sin(PITCH)
    xr, zr = v[0] * c_ - v[2] * s_, v[0] * s_ + v[2] * c_
    return np.array([xr, v[1] * cp + zr * sp, -v[1] * sp + zr * cp], np.float32)


def to_cam(p):
    return camdir((p[0] - CAMX, p[1], p[2] - CAMZ))


def L2C(fr, p):
    return to_cam(loc2w(fr, p))


def project(p):
    return CX + F * p[0] / p[2], CY + F * p[1] / p[2]


# ---------- geometría ----------
def hash2(a, b):
    return np.abs(np.modf(np.sin(a * 12.9898 + b * 78.233) * 43758.5453)[0])


def rib_at(z):
    return (z > 1.0) & ((z % RIB_EVERY) < 0.45)


def yarch(z, zc):
    return -0.35 - 0.93 * np.sqrt(np.clip(NICHE_R ** 2 - (z - zc) ** 2, 0, None))


def niche_depth(x, y, z, doors):
    d = np.zeros_like(x)
    for s, zc, _ in doors:
        m = (x * s > 0) & (np.abs(z - zc) < NICHE_R) & (y > yarch(z, zc))
        d = np.where(m, NICHE, d)
    return d


def ceil_y(x, z):
    ax = np.minimum(np.abs(x), WALL)
    return -2.05 + 0.6 * (ax / WALL) ** 2 + 0.24 * rib_at(z)


def wall_x(z):
    return WALL - 0.22 * rib_at(z)


def occ_corr(x, y, z, doors):
    w = wall_x(z) + niche_depth(x, y, z, doors)
    return (np.abs(x) > w) | (y > FLOOR) | (y < ceil_y(x, z)) | (z > ZMAX)


def occupied(x, y, z):
    """Sólido si lo es en el pasillo principal Y también en el lateral (el cruce abre la pared derecha)."""
    om = occ_corr(x, y, z, DOORS['M'])
    ob = occ_corr(z - ZJ, y, x, DOORS['B']) | (x < -WALL)
    return om & ob


def classify(xl, yl, zl, doors):
    w_eff = wall_x(zl) + niche_depth(xl, yl, zl, doors)
    dW = np.abs(xl) - w_eff
    dF = yl - FLOOR
    dC = ceil_y(xl, zl) - yl
    dB = zl - ZMAX
    face = np.argmax(np.stack([dW, dF, dC, dB]), axis=0)      # 0 pared, 1 piso, 2 techo, 3 fondo
    zface = ((face == 0) & (dW > 0.05)) | ((face == 2) & (dC > 0.05))
    return face, zface, w_eff


def stone_tex(u, v, rowh, t):
    row = np.floor(v / rowh)
    bw = 0.55 + 0.4 * hash2(row, 3.0)
    uu = (u + (row % 2) * bw * 0.5) / bw
    col = np.floor(uu)
    fu = (uu - col) * bw
    fv = (v / rowh - row) * rowh
    rnd = hash2(row, col) - 0.5
    fade = np.clip(1.25 - t * 0.09, 0.15, 1.0)
    mortar = (fu < 0.03) | (fv < 0.03)
    off = rnd * 0.9
    off = off + fade * (0.9 * ((fv < 0.09) & ~mortar) + 0.5 * ((fu < 0.09) & ~mortar)
                        - 0.9 * ((rowh - fv) < 0.07) - 0.5 * ((bw - fu) < 0.06))
    off = off + 0.35 * np.sin(u * 7.1 + v * 3.3) * np.sin(u * 2.3 - v * 5.1)
    crack = (np.abs(np.sin(u * 2.3 + 1.7 * np.sin(v * 4.1))) < 0.03) & (hash2(np.floor(u * 0.7), np.floor(v * 0.9)) > 0.62)
    off = off - 1.5 * crack * fade
    return np.where(mortar, -1.5 * fade - 0.2, off)


def march():
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    dxc = (xs - CX + 0.5) / F
    dyc = (ys - CY + 0.5) / F
    c_, s_ = math.cos(YAW), math.sin(YAW)
    cp, sp = math.cos(PITCH), math.sin(PITCH)
    yr, zr = dyc * cp - sp, dyc * sp + cp
    dwx, dwy, dwz = dxc * c_ + zr * s_, yr, -dxc * s_ + zr * c_

    def at(t):
        return CAMX + t * dwx, t * dwy, CAMZ + t * dwz
    t = np.zeros((H, W), np.float32)
    lo = np.zeros((H, W), np.float32)
    hi = np.zeros((H, W), np.float32)
    hit = np.zeros((H, W), bool)
    step = 0.09
    for _ in range(int(ZMAX / step) + 8):
        t = t + step
        occ = occupied(*at(t))
        new = occ & ~hit
        lo = np.where(new, t - step, lo)
        hi = np.where(new, t, hi)
        hit |= occ
    hi = np.where(hit, hi, t)
    for _ in range(11):
        mid = (lo + hi) / 2
        occ = occupied(*at(mid))
        hi = np.where(occ, mid, hi)
        lo = np.where(occ, lo, mid)
    Pw = np.stack(at(hi), -1)
    Plo = at(lo)
    in_m = ~occ_corr(Plo[0], Plo[1], Plo[2], DOORS['M'])
    return Pw, hi, in_m


# ---------- sitios (cristales, raíces, hongos, moléculas, objetos) ----------
def crystal_sites():
    r = random.Random(17)
    sites = []
    m_w = [(1.6, 1, 0.25), (1.8, -1, -0.45), (3.4, 1, -0.3), (3.0, -1, 0.3), (5.8, 1, 0.2), (5.7, -1, -0.35),
           (6.6, -1, 0.4), (8.4, -1, 0.1), (10.6, 1, 0.1), (10.9, -1, -0.5), (12.0, -1, 0.45), (13.8, 1, -0.25), (14.2, -1, 0.3)]
    b_w = [(1.5, 1, 0.2), (2.0, -1, -0.4), (4.8, 1, -0.3), (8.4, -1, 0.3), (10.0, 1, 0.1), (11.4, -1, -0.4), (12.4, 1, 0.4)]
    for fr, lst in (('M', m_w), ('B', b_w)):
        for z, s, y in lst:
            if any(ds == s and abs(z - dz) < 1.75 for ds, dz, _ in DOORS[fr]):
                continue
            if fr == 'M' and s == 1 and abs(z - ZJ) < 1.5:
                continue
            sites.append((fr, 'w', s, z, y, r.choice(['crystal', 'crystal', 'arcane'])))
    for fr, lst in (('M', [(2.2, -0.45), (5.6, 0.4), (7.8, 0.15), (10.3, -0.5), (12.6, 0.4)]),
                    ('B', [(2.4, 0.3), (5.2, -0.4), (9.0, 0.3), (12.0, -0.3)])):
        for z, x in lst:
            sites.append((fr, 'c', 0, z, x, r.choice(['crystal', 'arcane'])))
    for fr, lst in (('M', [(3.7, 1), (6.4, -1), (9.6, 1), (11.5, -1), (13.4, 1)]), ('B', [(3.6, -1), (6.0, 1), (10.6, 1)])):
        for z, s in lst:
            if fr == 'M' and s == 1 and abs(z - ZJ) < 1.5:
                continue
            sites.append((fr, 'f', s, z, 0.0, 'crystal'))
    return sites


def site_local(site):
    fr, kind, s, z, v, _ = site
    wx = float(wall_x(np.array(z)))
    if kind == 'w':
        return np.array([s * (wx - 0.01), v, z], np.float32), np.array([-s, 0, 0], np.float32)
    if kind == 'c':
        return np.array([v, float(ceil_y(np.array(v), np.array(z))) + 0.01, z], np.float32), np.array([0, 1, 0], np.float32)
    return np.array([s * (wx - 0.16), FLOOR - 0.01, z], np.float32), np.array([0, -1, 0], np.float32)


def site_cam(site):
    p, n = site_local(site)
    return L2C(site[0], p), camdir(fvec(site[0], n))


_rr = random.Random(41)
ROOTS = []
for _fr, _n1, _n2 in (('M', 26, 10), ('B', 20, 8)):
    for _k in range(_n1):
        ROOTS.append((_fr, 'hang', _rr.uniform(1.6, 14.4), (_rr.uniform(-0.85, 0.85), _rr.uniform(0.35, 1.0), _rr.uniform(-0.2, 0.2))))
    for _k in range(_n2):
        ROOTS.append((_fr, 'wall', _rr.uniform(1.8, 14.0), (_rr.choice([-1, 1]), _rr.uniform(0.5, 1.3), _rr.uniform(-0.4, 0.4))))
MUSH = [('M', 1, 1.7), ('M', -1, 2.9), ('M', 1, 5.0), ('M', -1, 5.3), ('M', 1, 9.2), ('M', -1, 10.0), ('M', 1, 13.0), ('M', -1, 13.0),
        ('B', 1, 1.6), ('B', -1, 3.0), ('B', -1, 8.8), ('B', 1, 11.6)]
MOLS = [('M', -1, 2.3, -0.2), ('M', 1, 5.4, -0.25), ('M', -1, 6.0, -0.25), ('M', 1, 9.4, -0.1), ('M', -1, 12.3, -0.2),
        ('B', 1, 1.7, -0.2), ('B', -1, 4.2, -0.2)]
# objetos de cada ramo en los tramos libres entre puertas (no tapan los murales)
OBJS = [('frasco', 'M', 0.8, 4.6), ('mortero', 'M', 0.8, 5.7), ('balanza', 'M', -0.8, 5.35), ('bureta', 'M', -0.78, 5.95),
        ('atomo', 'M', -0.8, 9.8), ('caldero', 'M', -0.8, 11.0), ('alambique', 'M', 0.8, 9.7), ('corazon', 'M', 0.8, 14.2), ('alambique', 'B', -0.8, 1.8), ('frasco', 'B', 0.8, 5.2), ('caldero', 'B', -0.8, 9.6)]
TORCHES = [('M', 1, 5.8), ('M', -1, 5.6), ('M', 1, 9.4), ('M', -1, 10.8), ('M', 1, 14.4), ('M', -1, 13.6),
           ('B', 1, 1.8), ('B', -1, 3.9), ('B', 1, 5.6), ('B', -1, 9.6), ('B', 1, 11.4)]
LAMPS = [('M', 3.3), ('M', 7.0), ('M', 9.0), ('M', 12.8), ('B', 2.6), ('B', 6.0), ('B', 10.6)]


# ---------- dibujo de objetos en capas con prueba de profundidad ----------
def tri(c, p0, p1, p2, mat, lvl):
    xs = [p0[0], p1[0], p2[0]]
    ys_ = [p0[1], p1[1], p2[1]]
    x0, x1 = max(0, int(min(xs)) - 1), min(W - 1, int(max(xs)) + 1)
    y0, y1 = max(0, int(min(ys_)) - 1), min(H - 1, int(max(ys_)) + 1)
    if x1 < x0 or y1 < y0:
        return
    gy, gx = np.mgrid[y0:y1 + 1, x0:x1 + 1]
    gx = gx + 0.5
    gy = gy + 0.5

    def sgn(a, b):
        return (gx - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (gy - b[1])
    d1, d2, d3 = sgn(p0, p1), sgn(p1, p2), sgn(p2, p0)
    inside = ~(((d1 < 0) | (d2 < 0) | (d3 < 0)) & ((d1 > 0) | (d2 > 0) | (d3 > 0)))
    sub = np.zeros((H, W), bool)
    sub[y0:y1 + 1, x0:x1 + 1] = inside
    c.mask(sub, mat, lvl)
    c.lock |= sub


class Compositor:
    """Pinta cada objeto en una capa aparte y lo pega solo donde no lo tapa la piedra (prueba de profundidad)."""

    def __init__(self, c, t):
        self.c, self.t = c, t

    def paste(self, layer, zo, margin=0.3):
        m = (layer.mat != 0) & (zo <= self.t + margin)
        self.c.mat[m] = layer.mat[m]
        self.c.lvl[m] = layer.lvl[m]
        self.c.lock[m] = layer.lock[m]


def draw_crystal_cluster(comp, site, glows, rng):
    base, nrm = site_cam(site)
    fr, kind, mat = site[0], site[1], site[5]
    z = float(base[2])
    if z < 0.9:
        return
    ly = Canvas(W, H)
    bx, by_ = project(base)
    rr = 0.2 * F / z
    yy, xx = np.mgrid[0:H, 0:W]
    ex, ey = (0.9, 1.2) if kind == 'w' else (1.3, 0.55)
    ring = ((xx + 0.5 - bx) / (rr * ex * 1.25)) ** 2 + ((yy + 0.5 - by_) / (rr * ey * 1.25)) ** 2 <= 1
    bed = ((xx + 0.5 - bx) / (rr * ex)) ** 2 + ((yy + 0.5 - by_) / (rr * ey)) ** 2 <= 1
    ly.mask(ring, 'crypt', 1.2)
    ly.mask(bed, 'crypt', 4.2)
    ly.mask(bed & (((xx + yy) % 4) < 2), 'crypt', 3.2)
    ly.mask(bed & (yy + 0.5 < by_ - rr * ey * 0.45), 'crypt', 5.4)
    ly.lock |= bed
    axes = {'w': ((0, 1, 0), (0, 0, 1)), 'c': ((1, 0, 0), (0, 0, 1)), 'f': ((1, 0, 0), (0, 0, 1))}[kind]
    tang = [camdir(fvec(fr, a)) for a in axes]
    spikes = []
    for k in range(rng.randint(5, 8)):
        B = base + tang[0] * rng.uniform(-0.13, 0.13) + tang[1] * rng.uniform(-0.11, 0.11)
        D = nrm * rng.uniform(0.9, 1.1) + tang[0] * rng.uniform(-0.3, 0.3) + tang[1] * rng.uniform(-0.3, 0.3)
        D = D / np.linalg.norm(D)
        L = rng.uniform(0.26, 0.45) if k == 0 else rng.uniform(0.08, 0.26)
        spikes.append((B, B + D * L, rng.uniform(0.045, 0.075) * (1.5 if k == 0 else 1)))
    spikes.sort(key=lambda sp: -sp[0][2])
    hi_l, mid_l, lo_l = (5.6, 4.0, 2.6) if mat == 'crystal' else (5.2, 3.6, 2.4)
    for (B, T, wd) in spikes:
        if B[2] < 0.5 or T[2] < 0.5:
            continue
        b2, t2 = np.array(project(B)), np.array(project(T))
        axis = t2 - b2
        ln = float(np.hypot(*axis))
        if ln < 1.5:
            continue
        perp = np.array([-axis[1], axis[0]]) / ln * max(wd * F / B[2], 0.9)
        mid = b2 + axis * 0.82
        tri(ly, b2 + perp, mid + perp * 0.55, b2, mat, hi_l)
        tri(ly, b2, mid + perp * 0.55, mid - perp * 0.55, mat, mid_l)
        tri(ly, b2, mid - perp * 0.55, b2 - perp, mat, lo_l)
        tri(ly, mid + perp * 0.55, t2, mid - perp * 0.55, mat, 6.4)
        ly.line(b2[0], b2[1], mid[0], mid[1], mat, 6.8)
    comp.paste(ly, z)
    glows.append((bx, by_ - rr * 0.8, max(8, 0.9 * F / z), '#5cc4dc' if mat == 'crystal' else '#b88cf4', 0.45))


def sphere_px(layer, P, rad, mat, base, lights, spec=2.4, only=None, lock=False, rim=0.9):
    """Esfera con volumen: luz difusa de cada fuente, borde oscuro y brillo especular (P en espacio de cámara)."""
    if P[2] < 0.5:
        return 0, 0, 1
    sx, sy = project(P)
    rp = rad * F / P[2]
    ya, yb = max(int(sy - rp) - 1, 0), min(int(sy + rp) + 2, H)
    xa, xb = max(int(sx - rp) - 1, 0), min(int(sx + rp) + 2, W)
    if ya >= yb or xa >= xb:
        return sx, sy, rp
    gy, gx = np.mgrid[ya:yb, xa:xb]
    dxn = (gx + 0.5 - sx) / rp
    dyn = (gy + 0.5 - sy) / rp
    d2 = dxn ** 2 + dyn ** 2
    nz = np.sqrt(np.clip(1 - d2, 0, 1))
    n = np.stack([dxn, dyn, -nz], -1)
    lum = np.full(d2.shape, base, np.float32)
    hv = np.zeros_like(lum)
    for lp, gain in lights:
        v = lp - P
        d = max(float(np.linalg.norm(v)), 1e-3)
        lv = v / d
        g = gain / (1 + 0.5 * d * d)
        lum += g * np.clip((n * lv[None, None, :]).sum(-1), 0, 1)
        hh = lv + np.array([0, 0, -1], np.float32)
        hh = hh / (np.linalg.norm(hh) + 1e-6)
        hv += g * np.clip((n * hh[None, None, :]).sum(-1), 0, 1) ** 24
    lum = lum - rim * (1 - nz) + spec * hv
    sel = d2 <= 1
    if only is not None:
        sel = sel & only(dxn, dyn)
    full = np.zeros((H, W), bool)
    lv_arr = np.zeros((H, W), np.float32)
    full[ya:yb, xa:xb] = sel
    lv_arr[ya:yb, xa:xb] = lum
    layer.mask(full, mat, np.clip(lv_arr, 0, 7.5))
    if lock:
        layer.lock |= full
    return sx, sy, rp


def shadow(c, P, rad, face):
    if P[2] < 0.5:
        return
    sx, sy = project(np.array([P[0], FLOOR, P[2]], np.float32))
    rp = rad * F / P[2]
    yy, xx = np.mgrid[0:H, 0:W]
    m = (((xx + 0.5 - sx) / (rp * 1.5)) ** 2 + ((yy + 0.5 - sy) / (rp * 0.5)) ** 2 <= 1) & (face == 1)
    c.lvl[m] = np.maximum(c.lvl[m] - 2.2, 0.2)


def draw_object(comp, kind, fr, x, z, lights, glows, face):
    c = comp.c
    P = L2C(fr, (x, 0, z))
    if P[2] < 0.9:
        return
    ly = Canvas(W, H)
    yy, xx = np.mgrid[0:H, 0:W]
    if kind == 'frasco':                                    # matraz grande con líquido verde
        rad = 0.26
        C = np.array([P[0], FLOOR - rad - 0.02, P[2]], np.float32)
        shadow(c, C, rad, face)
        sx, sy, rp = sphere_px(ly, C, rad, 'glass', 2.2, lights, spec=3, only=lambda dx, dy: (dx * dx + dy * dy > 0.55) | (dy < -0.15))
        sphere_px(ly, C, rad * 0.94, 'green', 3.0, lights, spec=1.5, only=lambda dx, dy: dy > 0.05, lock=True)
        ly.rect(sx - rp * 0.22, sy - rp * 1.75, sx + rp * 0.22, sy - rp * 0.75, 'glass', 3.4)
        ly.rect(sx - rp * 0.22, sy - rp * 1.75, sx - rp * 0.1, sy - rp * 0.75, 'glass', 5.2)
        ly.rect(sx - rp * 0.27, sy - rp * 1.95, sx + rp * 0.27, sy - rp * 1.72, 'brass', 4.4)
        glows.append((sx, sy + rp * 0.3, rp * 2.2, '#7fe08a', 0.55))
    elif kind == 'alambique':                               # cobre con tubo hacia un frasquito
        rad = 0.24
        C = np.array([P[0], FLOOR - rad - 0.02, P[2]], np.float32)
        shadow(c, C, rad, face)
        sx, sy, rp = sphere_px(ly, C, rad, 'brass', 1.6, lights, spec=3.2, rim=1.3)
        ly.rect(sx - rp * 0.2, sy - rp * 1.7, sx + rp * 0.2, sy - rp * 0.8, 'brass', 3.4)
        ly.rect(sx - rp * 0.2, sy - rp * 1.7, sx - rp * 0.07, sy - rp * 0.8, 'brass', 5.4)
        off = camdir(fvec(fr, (0, 0, 0.55)))
        C2 = np.array([C[0] + off[0], FLOOR - 0.12, C[2] + off[2]], np.float32)
        sx2, sy2, rp2 = sphere_px(ly, C2, 0.12, 'glass', 2.0, lights, spec=3, only=lambda dx, dy: (dx * dx + dy * dy > 0.5) | (dy < -0.1))
        sphere_px(ly, C2, 0.11, 'clay', 3.4, lights, spec=1.2, only=lambda dx, dy: dy > 0.0, lock=True)
        ly.line(sx, sy - rp * 1.7, sx + rp * 0.9, sy - rp * 2.3, 'brass', 4.6)
        ly.line(sx + rp * 0.9, sy - rp * 2.3, sx2, sy2 - rp2 * 1.1, 'brass', 4.6)
        ly.line(sx, sy - rp * 1.6, sx + rp * 0.9, sy - rp * 2.2, 'brass', 3)
        glows.append((sx2, sy2, rp2 * 2, '#ffb04a', 0.35))
    elif kind == 'mortero':                                 # mortero con hierbas y su mano
        rad = 0.2
        C = np.array([P[0], FLOOR - rad * 0.8, P[2]], np.float32)
        shadow(c, C, rad, face)
        sx, sy, rp = sphere_px(ly, C, rad, 'stone', 1.4, lights, spec=2.2, only=lambda dx, dy: dy > -0.2, rim=1.2)
        top = ((xx + 0.5 - sx) / (rp * 0.85)) ** 2 + ((yy + 0.5 - (sy - rp * 0.18)) / (rp * 0.28)) ** 2 <= 1
        ly.mask(top, 'shade', 2.0)
        for q in range(9):
            ly.px(sx - rp * 0.6 + q * rp * 0.15, sy - rp * 0.18 + ((q * 5) % 3 - 1) * 0.3 * rp * 0.28, 'leaf', 4.6 + (q % 3) * 0.5)
        ly.line(sx + rp * 0.1, sy - rp * 0.2, sx + rp * 0.75, sy - rp * 1.6, 'wood', 4.4)
        ly.line(sx + rp * 0.18, sy - rp * 0.2, sx + rp * 0.82, sy - rp * 1.6, 'wood', 2.6)
        glows.append((sx, sy - rp * 0.4, rp * 1.6, '#9bd86a', 0.3))
    elif kind == 'balanza':                                 # balanza de platillos de latón
        base_p = np.array([P[0], FLOOR, P[2]], np.float32)
        shadow(c, base_p + np.array([0, -0.1, 0], np.float32), 0.14, face)
        cylinder_px(ly, base_p, 0.14, 0.04, 'brass', 2.0, lights)
        sx, sy, rp, hp = cylinder_px(ly, base_p, 0.035, 0.62, 'brass', 2.2, lights, spec=2.6)
        top = np.array([P[0], FLOOR - 0.62, P[2]], np.float32)
        ax = camdir(fvec(fr, (0.3, 0, 0)))
        tilt = 0.05 * math.sin(TIME * 1.1)
        ends = [top + ax + np.array([0, tilt, 0], np.float32), top - ax - np.array([0, tilt, 0], np.float32)]
        pe = [project(e) for e in ends]
        pt = project(top)
        ly.line(pe[0][0], pe[0][1], pe[1][0], pe[1][1], 'brass', 5.0)
        ly.line(pe[0][0], pe[0][1] + 1, pe[1][0], pe[1][1] + 1, 'brass', 2.8)
        for k, e in enumerate(ends):
            dn = e + np.array([0, 0.2, 0], np.float32)
            a2, b2 = project(e), project(dn)
            ly.line(a2[0], a2[1], b2[0] - 4, b2[1], 'brass', 3.6)
            ly.line(a2[0], a2[1], b2[0] + 4, b2[1], 'brass', 3.6)
            rr_ = 0.1 * F / e[2]
            pan = ((xx + 0.5 - b2[0]) / rr_) ** 2 + ((yy + 0.5 - b2[1]) / (rr_ * 0.28)) ** 2 <= 1
            ly.mask(pan, 'brass', 4.6)
            ly.mask(pan & (yy + 0.5 < b2[1]), 'brass', 6.0)
            sphere_px(ly, dn + np.array([0, -0.07, 0], np.float32), 0.05, 'green' if k == 0 else 'crypt', 3.4, lights, spec=2, lock=(k == 0))
        glows.append((pt[0], pt[1], 12, '#ffcf70', 0.2))
    elif kind == 'bureta':                                  # bureta con soporte y matraz debajo
        base_p = np.array([P[0], FLOOR, P[2]], np.float32)
        shadow(c, base_p + np.array([0, -0.1, 0], np.float32), 0.15, face)
        cylinder_px(ly, base_p, 0.15, 0.03, 'blue', 2.4, lights)
        cylinder_px(ly, base_p, 0.02, 1.05, 'brass', 2.0, lights, spec=2.4)
        off = camdir(fvec(fr, (0.1, 0, 0)))
        tube = base_p + off + np.array([0, -0.3, 0], np.float32)
        cylinder_px(ly, tube, 0.04, 0.7, 'glass', 3.0, lights, spec=3, only=lambda dx, h_: (np.abs(dx) > 0.55) | (h_ > 0.62))
        sxl, syl, rpl, hpl = cylinder_px(ly, tube, 0.028, 0.42, 'crystal', 3.6, lights, spec=1.2, lock=True)
        cb = project(base_p + off * 0.55 + np.array([0, -0.72, 0], np.float32))
        ly.rect(cb[0] - 3, cb[1] - 1, cb[0] + 4, cb[1] + 1, 'brass', 5)
        fl_ = np.array([base_p[0] + off[0], FLOOR - 0.09, base_p[2] + off[2]], np.float32)
        sphere_px(ly, fl_, 0.09, 'glass', 2.2, lights, spec=3, only=lambda dx, dy: (dx * dx + dy * dy > 0.5) | (dy < -0.1))
        sphere_px(ly, fl_, 0.082, 'crystal', 3.2, lights, spec=1.2, only=lambda dx, dy: dy > 0.1, lock=True)
        glows.append((sxl, syl - hpl * 0.3, 14, '#7fe0f0', 0.35))
    elif kind == 'atomo':                                   # modelo orbital sobre pedestal
        base_p = np.array([P[0], FLOOR, P[2]], np.float32)
        shadow(c, base_p + np.array([0, -0.1, 0], np.float32), 0.14, face)
        cylinder_px(ly, base_p, 0.13, 0.3, 'stone', 2.4, lights)
        cen = np.array([P[0], FLOOR - 0.52, P[2]], np.float32)
        sx, sy, rp = sphere_px(ly, cen, 0.09, 'arcane', 4.2, lights, spec=3, lock=True)
        for k, ang in enumerate((0.0, math.pi / 3, 2 * math.pi / 3)):
            ellipse_ring(ly, sx, sy, rp * 2.6, rp * 0.9, ang, 0.1, 'arcane', 5.6)
            th_ = TIME * 1.4 + k * 2.1
            ex_, ey_ = rp * 2.6 * math.cos(th_), rp * 0.9 * math.sin(th_)
            px_, py_ = sx + ex_ * math.cos(ang) - ey_ * math.sin(ang), sy + ex_ * math.sin(ang) + ey_ * math.cos(ang)
            ly.rect(px_ - 1.2, py_ - 1.2, px_ + 1.2, py_ + 1.2, 'petal', 6.5)
            ly.lock |= (ly.mat != 0)
        glows.append((sx, sy, rp * 3.4, '#b88cf4', 0.6))
    elif kind == 'corazon':                                 # corazón en frasco con latido
        base_p = np.array([P[0], FLOOR, P[2]], np.float32)
        shadow(c, base_p + np.array([0, -0.1, 0], np.float32), 0.14, face)
        cylinder_px(ly, base_p, 0.13, 0.25, 'stone', 2.4, lights)
        jar = base_p + np.array([0, -0.25, 0], np.float32)
        cylinder_px(ly, jar, 0.1, 0.36, 'glass', 2.8, lights, spec=3, only=lambda dx, h_: (np.abs(dx) > 0.6) | (h_ > 0.9) | (h_ < 0.06))
        beat = 1.0 + 0.12 * max(0.0, math.sin(TIME * 3.2)) ** 2
        hc = np.array([P[0], FLOOR - 0.43, P[2]], np.float32)
        sx, sy, rp = sphere_px(ly, hc, 0.07 * beat, 'red', 4.0, lights, spec=2.4, lock=True)
        glows.append((sx, sy, rp * 3.0, '#ff6a5a', 0.55 * beat))
    else:                                                   # caldero con poción
        rad = 0.32
        C = np.array([P[0], FLOOR - rad, P[2]], np.float32)
        shadow(c, C, rad, face)
        sx, sy, rp = sphere_px(ly, C, rad, 'blue', 1.2, lights, spec=2.5, only=lambda dx, dy: dy > -0.55, rim=1.2)
        top = ((xx + 0.5 - sx) / (rp * 0.92)) ** 2 + ((yy + 0.5 - (sy - rp * 0.55)) / (rp * 0.33)) ** 2 <= 1
        ly.mask(top, 'blue', 4.4)
        liq = ((xx + 0.5 - sx) / (rp * 0.8)) ** 2 + ((yy + 0.5 - (sy - rp * 0.52)) / (rp * 0.26)) ** 2 <= 1
        ly.mask(liq, 'green', 5.2)
        ly.lock |= liq
        for k in range(3):
            bx, by_ = int(sx - rp * 0.25 + k * rp * 0.25), int(sy - rp * 0.95 - (k % 2) * 3)
            if 0 <= bx < W and 0 <= by_ < H:
                ly.px(bx, by_, 'sprout', 6)
                ly.lock[by_, bx] = True
        glows.append((sx, sy - rp * 0.6, rp * 2.4, '#7fe08a', 0.6))
    comp.paste(ly, float(P[2]), 0.6)


def draw_root(comp, fr, kind, z, a):
    ly = Canvas(W, H)
    wx = float(wall_x(np.array(z)))
    if kind == 'hang':
        x0, ln, sway = a
        x0 = float(np.clip(x0, -wx + 0.1, wx - 0.1))
        S = np.array([x0, float(ceil_y(np.array(x0), np.array(z))) + 0.02, z], np.float32)
        pts = [S + np.array([sway * (k / 8.0) ** 2, ln * k / 8.0, 0.1 * np.sin(k)], np.float32) for k in range(9)]
    else:
        s, ln, drift = a
        S = np.array([s * (wx - 0.02), FLOOR, z], np.float32)
        pts = [S + np.array([0, -ln * k / 8.0, drift * np.sin(k * 0.8) + drift * k / 4], np.float32) for k in range(9)]
    cp = [L2C(fr, p) for p in pts]
    if cp[0][2] < 0.9:
        return
    for k in range(8):
        p0, p1 = cp[k], cp[k + 1]
        if p0[2] < 0.6 or p1[2] < 0.6:
            continue
        a0, a1 = project(p0), project(p1)
        wpx = max(0.0, (0.045 * (1 - k / 9.0)) * F / p0[2])
        for off, mat, lv in ((0, 'wood', 2.2), (-wpx * 0.5, 'wood', 3.6), (wpx * 0.5, 'wood', 1.0)):
            if wpx < 0.9 and off != 0:
                continue
            ly.line(a0[0] + off, a0[1], a1[0] + off, a1[1], mat, lv)
        if k % 3 == 2 and wpx >= 0.9:
            ly.px(a1[0], a1[1], 'sprout', 5.2)
    comp.paste(ly, float(cp[0][2]), 0.5)


def draw_mushrooms(comp, fr, s, z, lights, glows, face):
    rg = random.Random(int(z * 100) + s)
    wx = float(wall_x(np.array(z)))
    for k in range(3):
        r = rg.uniform(0.06, 0.12) * (1.3 if k == 0 else 1)
        P = L2C(fr, (s * (wx - 0.16 - rg.uniform(0, 0.18)), FLOOR - 0.1 - r, z + rg.uniform(-0.16, 0.16)))
        if P[2] < 0.9:
            continue
        ly = Canvas(W, H)
        shadow(comp.c, P, r * 0.9, face)
        sx, sy, rp = sphere_px(ly, P, r, 'crystal', 3.0, lights, spec=1.8, only=lambda dx, dy: dy < 0.35, lock=True)
        ly.rect(sx - rp * 0.22, sy + rp * 0.3, sx + rp * 0.22, sy + rp * 1.5, 'paper', 4.2)
        ly.rect(sx - rp * 0.22, sy + rp * 0.3, sx - rp * 0.05, sy + rp * 1.5, 'paper', 5.4)
        for q in range(3):
            bx, by_ = int(sx - rp * 0.5 + q * rp * 0.5), int(sy - rp * 0.35 - (q % 2) * rp * 0.2)
            if 0 <= bx < W and 0 <= by_ < H:
                ly.px(bx, by_, 'crystal', 7.2)
        comp.paste(ly, float(P[2]), 0.6)
        glows.append((sx, sy, rp * 3.2, '#6ff0b0', 0.5))


def draw_molecule(comp, fr, s, z, y0, lights, glows):
    wx = float(wall_x(np.array(z)))
    R = 0.3
    ring = [L2C(fr, (s * (wx - 0.03), y0 + R * np.sin(np.radians(30 + 60 * k)), z + R * np.cos(np.radians(30 + 60 * k)))) for k in range(6)]
    if min(p[2] for p in ring) < 0.9:
        return
    ly = Canvas(W, H)
    ext = L2C(fr, (s * (wx - 0.03), y0, z + 0.62))
    h1 = L2C(fr, (s * (wx - 0.03), y0 - 0.2, z + 0.8))
    h2 = L2C(fr, (s * (wx - 0.03), y0 + 0.2, z + 0.8))
    mid = L2C(fr, (s * (wx - 0.03), y0, z))
    for k in range(6):
        a, b = project(ring[k]), project(ring[(k + 1) % 6])
        ly.line(a[0], a[1], b[0], b[1], 'brass', 5.0)
    cxm, cym = project(mid)
    for k in range(0, 6, 2):                                       # enlaces dobles
        a, b = project(ring[k]), project(ring[(k + 1) % 6])
        ly.line(a[0] + (cxm - a[0]) * 0.18, a[1] + (cym - a[1]) * 0.18, b[0] + (cxm - b[0]) * 0.18, b[1] + (cym - b[1]) * 0.18, 'brass', 3.6)
    a, b = project(ring[0]), project(ext)
    ly.line(a[0], a[1], b[0], b[1], 'brass', 5.0)
    for hh in (h1, h2):
        c1, c2 = project(ext), project(hh)
        ly.line(c1[0], c1[1], c2[0], c2[1], 'brass', 4.2)
    for k in range(6):
        sphere_px(ly, ring[k], 0.065, 'crypt', 4.6, lights, spec=2.4, lock=True)
    sphere_px(ly, ext, 0.085, 'blue', 4.4, lights, spec=2.6, lock=True)
    for hh in (h1, h2):
        sphere_px(ly, hh, 0.05, 'paper', 4.6, lights, spec=2.0, lock=True)
    comp.paste(ly, float(mid[2]), 0.5)
    glows.append((cxm, cym, 0.55 * F / mid[2], '#5cc4dc', 0.35))


# ---------- escena ----------
def cylinder_px(layer, P, rad, h, mat, base, lights, spec=1.8, lock=False, only=None):
    """Cilindro vertical con volumen (P = centro de la base, en espacio de cámara)."""
    if P[2] < 0.5:
        return 0, 0, 1, 1
    sx, sy = project(P)
    rp = rad * F / P[2]
    hp = h * F / P[2]
    xa, xb = max(int(sx - rp) - 1, 0), min(int(sx + rp) + 2, W)
    ya, yb = max(int(sy - hp) - 1, 0), min(int(sy) + 2, H)
    if xa >= xb or ya >= yb:
        return sx, sy, rp, hp
    gy, gx = np.mgrid[ya:yb, xa:xb]
    dxn = (gx + 0.5 - sx) / rp
    nz = np.sqrt(np.clip(1 - dxn ** 2, 0, 1))
    n = np.stack([dxn, np.zeros_like(dxn), -nz], -1)
    lum = np.full(dxn.shape, base, np.float32)
    hv = np.zeros_like(lum)
    for lp, gain in lights:
        v = lp - P
        d = max(float(np.linalg.norm(v)), 1e-3)
        lv = v / d
        g = gain / (1 + 0.5 * d * d)
        lum += g * np.clip((n * lv[None, None, :]).sum(-1), 0, 1)
        hh = lv + np.array([0, 0, -1], np.float32)
        hh = hh / (np.linalg.norm(hh) + 1e-6)
        hv += g * np.clip((n * hh[None, None, :]).sum(-1), 0, 1) ** 20
    lum = lum - 0.9 * (1 - nz) + spec * hv
    sel = (np.abs(dxn) <= 1) & (gy + 0.5 <= sy + 1) & (gy + 0.5 >= sy - hp)
    if only is not None:
        sel = sel & only(dxn, (sy - gy - 0.5) / max(hp, 1e-3))
    full = np.zeros((H, W), bool)
    la = np.zeros((H, W), np.float32)
    full[ya:yb, xa:xb] = sel
    la[ya:yb, xa:xb] = lum
    layer.mask(full, mat, np.clip(la, 0, 7.5))
    if lock:
        layer.lock |= full
    return sx, sy, rp, hp


def ellipse_ring(layer, cx, cy, rx, ry, ang, th, mat, lvl):
    yy, xx = np.mgrid[0:H, 0:W]
    u = (xx + 0.5 - cx) * math.cos(ang) + (yy + 0.5 - cy) * math.sin(ang)
    v = -(xx + 0.5 - cx) * math.sin(ang) + (yy + 0.5 - cy) * math.cos(ang)
    m = np.abs(np.hypot(u / rx, v / ry) - 1) < th
    layer.mask(m, mat, lvl)
    layer.lock |= m


def draw_torch(comp, fr, s, z, glows):
    wx = float(wall_x(np.array(z)))
    P = L2C(fr, (s * (wx - 0.05), -0.55, z))
    if P[2] < 0.9:
        return
    ly = Canvas(W, H)
    sx, sy = project(P)
    k = max(1.0, 0.07 * F / P[2])
    ly.rect(sx - k * 0.4, sy + k * 0.2, sx + k * 0.4, sy + k * 2.6, 'brass', 3.4)
    ly.rect(sx - k * 0.9, sy + k * 0.2, sx + k * 0.9, sy + k * 0.8, 'brass', 4.6)
    fl = 1.0 + 0.18 * math.sin(TIME * 7 + z * 3)
    for (dy, r, lv) in ((-0.2, 1.1, 4.0), (-1.1, 0.8, 5.0), (-1.9, 0.45, 5.8)):
        ly.rect(sx - k * r * fl, sy + k * dy - k * 0.5, sx + k * r * fl, sy + k * dy + k * 0.5, 'flame', lv)
    ly.lock |= (ly.mat != 0)
    comp.paste(ly, float(P[2]), 0.5)
    glows.append((sx, sy - k, 0.35 * F / P[2] + 8, '#ff9a3c', 0.75 * fl))


def draw_lamp(comp, fr, z, glows):
    P = L2C(fr, (0, -1.3, z))
    if P[2] < 0.9:
        return
    ly = Canvas(W, H)
    top = L2C(fr, (0, float(ceil_y(np.array(0.0), np.array(z))) + 0.02, z))
    a, b = project(top), project(P)
    ly.line(a[0], a[1], b[0], b[1] - 0.12 * F / P[2], 'brass', 3.4)
    rp = 0.1 * F / P[2]
    sphere_px(ly, P, 0.1, 'glass', 2.8, [], spec=0, only=lambda dx, dy: (dx * dx + dy * dy > 0.5))
    fl = 1.0 + 0.15 * math.sin(TIME * 6 + z)
    sx, sy = project(P)
    ly.rect(sx - rp * 0.4 * fl, sy - rp * 0.5, sx + rp * 0.4 * fl, sy + rp * 0.4, 'flame', 5.0)
    ly.rect(sx - rp * 0.3, sy - rp * 1.35, sx + rp * 0.3, sy - rp * 0.95, 'brass', 4.4)
    ly.lock |= (ly.mat != 0)
    comp.paste(ly, float(P[2]), 0.5)
    glows.append((sx, sy, 0.55 * F / P[2] + 8, '#ffb440', 0.8 * fl))


def draw_particles(c, t, glows, burst):
    """Motas de luz que flotan en el aire; al abrir una puerta salen chispas del ramo hacia el pasillo."""
    rg = np.random.RandomState(3)
    base = rg.rand(70, 3)
    for k in range(70):
        x = (base[k, 0] * 2 - 1) * 0.85 + 0.05 * math.sin(TIME * 0.9 + k)
        y = -1.7 + ((base[k, 1] * 2.4 + TIME * 0.05 * (0.5 + base[k, 2])) % 2.4)
        P = L2C('M' if k % 4 else 'B', (x, y, base[k, 2] * 14.0 + 0.8))
        if P[2] < 0.8:
            continue
        sx, sy = project(P)
        ix, iy = int(sx), int(sy)
        if 0 <= ix < W and 0 <= iy < H and P[2] <= t[iy, ix] + 0.05:
            c.px(ix, iy, 'rune' if k % 2 else 'crystal', 6.4)
            c.lock[iy, ix] = True
    if burst:
        fr, idx, p = burst
        s, zc, _ = DOORS[fr][idx]
        th = THEMES[RAMO[(fr, idx)]]
        rg = np.random.RandomState(8)
        for k in range(70):
            q = p * (0.4 + 0.9 * rg.rand())
            za0, y0 = (rg.rand() - 0.5) * 0.7, (rg.rand() - 0.4) * 1.1
            P = L2C(fr, (s * (1.45 - q * 1.5), y0 - 0.25 * q * rg.rand(), zc + za0 * (1 + q * 0.6)))
            if P[2] < 0.7:
                continue
            sx, sy = project(P)
            ix, iy = int(sx), int(sy)
            if 0 <= ix < W and 0 <= iy < H and P[2] <= t[iy, ix] + 0.3:
                c.px(ix, iy, th['dots'], 7.0)
                c.lock[iy, ix] = True
                if rg.rand() < 0.4 and ix + 1 < W:
                    c.px(ix + 1, iy, th['dots'], 5.5)
                    c.lock[iy, ix + 1] = True


def hex_ring(za, yl, yc, R, th):
    """Anillo hexagonal (benceno) centrado en (0, yc) dentro del plano de la puerta."""
    ang = np.arctan2(yl - yc, za)
    r = np.hypot(za, yl - yc)
    seg = np.mod(ang, np.pi / 3) - np.pi / 6
    rr = R * math.cos(math.pi / 6) / np.cos(seg)
    return np.abs(r - rr) < th


def emblem(ramo, a, b, th, R):
    """Emblema del ramo centrado en (a=0, b=0): benceno, dial analítico, órbitas o cruz con latido."""
    r = np.hypot(a, b)
    if ramo == 'organica':
        return hex_ring(a, b, 0.0, R, th)
    if ramo == 'analitica':
        return ((np.abs(r - R) < th) | ((np.abs(a) < th) & (np.abs(b) < R)) | ((np.abs(b) < th) & (np.abs(a) < R))
                | ((np.abs(b + R * 0.5) < th) & (np.abs(a) < R * 0.5)))
    if ramo == 'fisico':
        out = r < th * 1.8
        for ang in (0.0, math.pi / 3, 2 * math.pi / 3):
            u = a * math.cos(ang) + b * math.sin(ang)
            v = -a * math.sin(ang) + b * math.cos(ang)
            out = out | (np.abs(np.hypot(u / R, v / (R * 0.38)) - 1) < th * 5)
        return out
    if ramo == 'fisio':
        return ((np.abs(a) < th * 1.6) & (np.abs(b) < R)) | ((np.abs(b) < th * 1.6) & (np.abs(a) < R)) | (np.abs(r - R * 1.05) < th)
    return np.abs(r - R * 0.5) < th


def build(opens=None, flash=0.0, scale=3):
    global SCALE
    SCALE = scale
    opens = opens or {}
    zoom = float(opens.get('zoom', 0.0))
    mural_cache = {}
    Pw, t, in_m = march()
    X, Y, Z = Pw[..., 0], Pw[..., 1], Pw[..., 2]
    yy, xx = np.mgrid[0:H, 0:W]

    # coordenadas locales de cada pasillo y elección según desde dónde se mira
    fm, zfm, wm = classify(X, Y, Z, DOORS['M'])
    fb, zfb, wb = classify(Z - ZJ, Y, X, DOORS['B'])
    face = np.where(in_m, fm, fb)
    zface = np.where(in_m, zfm, zfb)
    w_eff = np.where(in_m, wm, wb)
    fr_id = np.where(in_m, 0, 1)
    xl = np.where(in_m, X, Z - ZJ)
    zl = np.where(in_m, Z, X)
    yl = Y
    side = np.sign(xl)
    is_w = (face == 0) & ~zface
    Nl = np.zeros(Pw.shape, np.float32)
    Nl[..., 0] = np.where(is_w, -side, 0)
    Nl[..., 1] = np.where(face == 1, -1, np.where((face == 2) & ~zface, 1, 0))
    Nl[..., 2] = np.where(zface | (face == 3), -1, 0)
    N = np.where(in_m[..., None], Nl, Nl[..., [2, 1, 0]])

    # ----- luces (mundo) -----
    sites = crystal_sites()
    cold = np.zeros((H, W), np.float32)
    warm = np.zeros((H, W), np.float32)

    def add(lpos, inten, acc):
        Lv = lpos[None, None, :] - Pw
        d2 = (Lv ** 2).sum(-1) + 1e-4
        nd = np.clip((Lv * N).sum(-1) / np.sqrt(d2), 0, 1)
        acc += inten * (0.25 + 0.75 * nd) / (d2 + 0.35)
    for st in sites:
        p, n = site_local(st)
        add(loc2w(st[0], p + n * 0.18), 0.45, cold)
    for fr in FR:
        for s, zc, stt in DOORS[fr]:
            if stt != 'futura':
                add(loc2w(fr, (s * 1.2, 0.1, zc)), 1.5 if stt == 'repasos' else 1.1, warm)
                add(loc2w(fr, (s * 0.5, 0.65, zc)), 0.9, warm)
        add(loc2w(fr, (0, 0.0, ZMAX - 0.6)), 3.0 if fr == 'M' else 1.6, warm)
    for fr, s_, z_ in TORCHES:
        add(loc2w(fr, (s_ * (float(wall_x(np.array(z_))) - 0.3), -0.55, z_)), 0.9, warm)
    for fr, z_ in LAMPS:
        add(loc2w(fr, (0, -1.2, z_)), 0.8, warm)

    lum = 0.03 + 0.8 * (1 - np.exp(-(warm * 0.8 + cold * 0.8) * 0.8))
    d_wall = np.clip(w_eff - np.abs(xl), 0, 3)
    d_floor = np.clip(FLOOR - Y, 0, 3)
    d_ceil = np.clip(Y - ceil_y(xl, zl), 0, 3)
    ao = (1 - 0.65 * np.exp(-d_wall / 0.18)) * (1 - 0.65 * np.exp(-d_floor / 0.18)) * (1 - 0.65 * np.exp(-d_ceil / 0.22))
    lum = lum * (0.45 + 0.55 * ao) * np.clip(1.1 - t * 0.06, 0.25, 1)
    lum = np.clip(lum, 0, 1.6) ** STYLE['gamma']

    # ----- textura -----
    u = np.where((face == 1) | (face == 2), xl, np.where(is_w, zl, xl))
    v = np.where((face == 1) | (face == 2), zl, Y + 3.0)
    rowh = np.where((face == 1) | (face == 2), 0.7, 0.34).astype(np.float32)
    tex = stone_tex(u, v, rowh, t)
    lvl = lum * 5.4 + tex * 0.75 * np.clip(lum * 2 + 0.25, 0, 1)

    c = Canvas(W, H)
    c.dither = {k_: STYLE['dither'] for k_ in ('crypt', 'stone', 'wood', 'wall')}
    c.mat[:] = c.mid('crypt')
    c.lvl[:] = np.clip(lvl, 0, 8).astype(np.float32)
    if STYLE['post']:
        c.lvl[:] = np.round(c.lvl)
    glows = []

    # moho en las juntas y tubería de latón con bridas
    nz_ = np.sin(u * 5.1 + v * 3.7) * np.sin(u * 2.9 - v * 6.3)
    moss = (((is_w & (yl > 0.28)) | ((face == 1) & (d_wall < 0.22))) & (nz_ > 0.45))
    c.mask(moss, 'shade', np.clip(lum * 2.4 + 2.2, 1, 5).astype(np.float32))
    c.mask(moss & (hash2(xx * 1.0, yy * 1.0) > 0.82), 'sprout', 3.4)
    wall_zone = is_w & (np.abs(xl) < 1.3)
    tt = (yl - 0.55) / 0.045
    pipe = wall_zone & (np.abs(tt) < 1)
    c.mask(pipe, 'brass', np.clip(0.6 + lum * 1.4 + 2.2 * np.sqrt(np.clip(1 - tt ** 2, 0, 1)) - 0.7 * tt, 0.6, 4.4).astype(np.float32))
    flange = wall_zone & (np.abs(yl - 0.55) < 0.075) & ((zl % 1.8) < 0.08)
    c.mask(flange, 'brass', np.clip(lum * 2 + 2.4, 1.5, 4.6).astype(np.float32))

    # ----- puertas en nichos: hojas que se parten al abrir, marco con runas y un benceno sobre el arco -----
    for fid, fr in enumerate(FR):
        inF = (fr_id == fid)
        for idx, (s, zc, st) in enumerate(DOORS[fr]):
            za = zl - zc
            an = (za + NICHE_R) / (2 * NICHE_R)
            m = is_w & inF & (side == s) & (np.abs(za) < NICHE_R) & (np.abs(xl) > 1.35)
            frame = m & ((yl - yarch(zl, zc) < 0.1) | (an < 0.07) | (an > 0.93))
            c.mask(frame, 'stone', np.clip(lum * 4 + 3.2, 3, 6).astype(np.float32))
            body = m & ~frame
            o = opens.get((fr, idx), OPEN_DEFAULT[st])
            ramo = RAMO[(fr, idx)]
            th = THEMES[ramo]
            flip = s if fr == 'M' else -s                   # el pasillo lateral está en espejo: el texto debe leerse igual
            uview = -flip * za                              # posición a lo largo de la pared vista de frente (izquierda < 0)
            dimk = 0.45 if st == 'futura' else 1.0
            # letrero de piedra grabada sobre el arco: letras talladas que brillan con el color del ramo
            plate = is_w & inF & (side == s) & (np.abs(za) < SIGN_HALF) & (yl > -1.45) & (yl < -1.06) & (np.abs(xl) < 1.25)
            pu = np.clip(((uview + SIGN_HALF) / (2 * SIGN_HALF) * SIGN_W).astype(int), 0, SIGN_W - 1)
            pv = np.clip(((yl + 1.45) / 0.39 * SIGN_H).astype(int), 0, SIGN_H - 1)
            code = sign_texture(th['lines'])[pv, pu]
            slab = np.clip(lum * 3.0 + 3.0, 2.4, 5.6).astype(np.float32)
            c.mask(plate, 'stone', slab)
            c.mask(plate & (code == 1), 'stone', slab + 1.3)
            c.mask(plate & (code == 8), 'stone', np.clip(slab - 2.2, 0.6, 4))
            c.mask(plate & (code == 7), 'stone', slab + 1.6)
            letter = plate & (code == 2)
            groove = plate & (code == 6)
            c.mask(letter, th['dots'], (4.4 + 1.2 * PULSE) * dimk)
            c.mask(groove, th['dots'], 2.6 * dimk)
            c.lock |= letter | groove
            c.lvl[is_w & inF & (side == s) & (np.abs(za) < SIGN_HALF + 0.03) & (yl >= -1.06) & (yl < -1.0)] *= 0.45
            # murales animados del ramo a ambos lados de la puerta
            if ramo in MURALES:
                for k_, (lo, hi) in enumerate(((-1.62, -0.82), (0.82, 1.62))):
                    pm = is_w & inF & (side == s) & (uview > lo) & (uview < hi) & (yl > -1.02) & (yl < 0.52) & (np.abs(xl) < 1.25)
                    if not pm.any():
                        continue
                    edge = np.minimum(np.minimum(uview - lo, hi - uview), np.minimum(yl + 1.02, 0.52 - yl))
                    rim_l = pm & (edge < 0.04) & (((uview - lo) < 0.04) | ((yl + 1.02) < 0.04))
                    rim_d = pm & (edge < 0.04) & ~rim_l
                    c.mask(rim_l, 'stone', np.clip(lum * 3 + 3.8, 3, 6).astype(np.float32))
                    c.mask(rim_d, 'stone', 1.2)
                    inner = pm & (edge >= 0.04)
                    tx = np.clip(((uview - lo - 0.04) / 0.72 * PW).astype(int), 0, PW - 1)
                    ty = np.clip(((yl + 0.98) / 1.46 * PH).astype(int), 0, PH - 1)
                    if (ramo, k_) not in mural_cache:
                        mural_cache[(ramo, k_)] = MURALES[ramo][k_](TIME)
                    mc = mural_cache[(ramo, k_)][ty, tx]
                    c.mask(inner, 'crypt', np.clip(lum * 1.2 + 1.0, 0.6, 2.4).astype(np.float32))
                    for cd, (mat_, lv_) in mural_colors(th).items():
                        mk = inner & (mc == cd)
                        c.mask(mk, mat_, lv_)
                        c.lock |= mk
                    pc_ = L2C(fr, (s * (WALL - 0.02), -0.25, zc - flip * (lo + hi) / 2))
                    if pc_[2] > 0.8:
                        gx_, gy_ = project(pc_)
                        glows.append((gx_, gy_, 0.45 * F / pc_[2], th['halo'], 0.22))
            if st == 'futura':
                c.mask(body, 'blue', np.clip(lum * 5.2 + 1.0, 0.5, 6).astype(np.float32))
                c.mask(body & ((an * 9) % 1 < 0.07), 'blue', 1.0)
                for by in (-0.15, 0.5):
                    c.mask(body & (np.abs(yl - by) < 0.06), 'blue', np.clip(lum * 5.2 + 2.4, 0, 6.5).astype(np.float32))
                continue
            c.lock |= frame
            inlay = frame & ((np.abs(yl - yarch(zl, zc) - 0.05) < 0.012) | (np.abs(an - 0.035) < 0.01) | (np.abs(an - 0.965) < 0.01))
            c.mask(inlay, th['dots'], 4.4 + 1.0 * PULSE)
            go = o * 0.66
            gap = body & (np.abs(za) < go + 0.012)
            leaf = body & ~gap
            uo = np.abs(za) - go                             # distancia desde el borde de la hoja
            lw = NICHE_R - go                                # ancho visible de cada hoja
            leaf_mat = 'stone' if STYLE['leaf'] == 'stone' else th['leaf']
            leaf_lvl = np.clip(lum * 2.2 + th['leaf_lv'] - 1.6, 0.8, 4.2).astype(np.float32)
            if leaf_mat == 'stone':
                leaf_lvl = np.clip(lum * 3.0 + 2.0, 1.0, 5.0).astype(np.float32)
            c.mask(leaf, leaf_mat, leaf_lvl)
            c.mask(leaf & (((uo * 9) % 1) < 0.08), leaf_mat, 0.8)                         # junta de tablas
            pan = leaf & (uo > 0.07) & (uo < lw - 0.07) & (((yl > -0.78) & (yl < -0.3)) | ((yl > -0.1) & (yl < 0.5)))
            rim = pan & ((uo < 0.1) | (uo > lw - 0.1) | (np.abs(yl + 0.78) < 0.03) | (np.abs(yl + 0.3) < 0.03)
                         | (np.abs(yl + 0.1) < 0.03) | (np.abs(yl - 0.5) < 0.03))
            c.mask(pan & ~rim, leaf_mat, leaf_lvl + 0.7)                                  # panel en relieve
            c.mask(rim, leaf_mat, np.clip(leaf_lvl - 1.0, 0.4, 4))
            for by in (-0.22, 0.58):                                                      # bandas de latón con remaches
                band = leaf & (np.abs(yl - by) < 0.05)
                c.mask(band, 'brass', np.clip(lum * 4.0 + 2.4, 1.5, 5.8).astype(np.float32))
                c.mask(band & (np.abs(yl - by) < 0.02) & ((np.floor(uo * 18) % 2) == 0), 'brass', 6.4)
            hinge = leaf & (uo > lw - 0.17) & ((np.abs(yl + 0.55) < 0.07) | (np.abs(yl - 0.33) < 0.07))
            c.mask(hinge, 'brass', np.clip(lum * 3 + 3.0, 2, 6).astype(np.float32))
            c.mask(hinge & (np.abs(uo - (lw - 0.08)) < 0.018), 'brass', 6.6)
            hh_ = np.hypot(uo - 0.11, yl - 0.18)                                          # aldaba con placa
            c.mask(leaf & (hh_ < 0.08), 'brass', 3.0)
            c.mask(leaf & (np.abs(hh_ - 0.05) < 0.014), 'brass', 6.4)
            c.mask(leaf & emblem(ramo, np.abs(za) - go - 0.34, yl + 0.04, 0.02, 0.17), th['dots'], 5.8)
            c.lock |= leaf & emblem(ramo, np.abs(za) - go - 0.34, yl + 0.04, 0.02, 0.17)
            # portal a otra dimensión: remolino en espiral con núcleo brillante, anillos de energía y estrellas que se acercan
            gtop = 7 if th['gap'] != 'flame' else 5
            px_, py_ = za / 0.62, (yl + 0.12) / 0.95
            rr = np.clip(np.hypot(px_, py_), 0.02, 3.0)
            theta = np.arctan2(py_, px_)
            lr = np.log(rr * (1 - 0.8 * zoom) + 0.07)
            val = 0.55 + 0.30 * np.sin(3 * theta + 5.0 * lr - TIME * 2.6) + 0.15 * np.sin(14 * lr + TIME * 3.4)
            core = np.exp(-((rr * (1 - 0.8 * zoom)) ** 2) * 6)
            rim_p = np.exp(-((rr - 0.95) / 0.07) ** 2)
            g = np.clip(1.3 + 3.6 * val + 2.6 * core + 1.8 * rim_p - 1.4 * np.clip(rr - 0.9, 0, 1), 0.4, gtop).astype(np.float32)
            c.mask(gap, th['gap'], g)
            sa, sb = theta * 10, lr * 7 - TIME * 1.5
            star = gap & (hash2(np.floor(sa), np.floor(sb)) > 0.9) & (np.abs(sa % 1 - 0.5) < 0.1) & (np.abs(sb % 1 - 0.5) < 0.12)
            c.mask(star, 'petal', 4.0)
            c.lock |= gap
            key_m = m & emblem(ramo, za, yl - (-0.82), 0.015, 0.14)       # emblema del ramo sobre el arco
            c.mask(key_m, th['dots'], 6.6)
            c.lock |= key_m

    # fondo de cada pasillo: gran arco con luz
    bk = (face == 3)
    arch = bk & (np.abs(xl) < 0.8) & (yl > -0.4 - np.sqrt(np.clip(0.64 - xl ** 2, 0, None)) * 0.95)
    c.mask(arch, 'glow', np.clip(3.2 + (yl + 1) * 1.3, 0, 5.6).astype(np.float32))
    c.lock |= arch
    c.mask(bk & ~arch & (np.abs(xl) < 0.95) & (yl > -1.05 - np.sqrt(np.clip(0.9 - xl ** 2, 0, None)) * 0.9), 'crypt', 6.5)

    # candados y cadenas de las puertas futuras
    for fr in FR:
        for s, zc, st in DOORS[fr]:
            if st != 'futura':
                continue
            pc = L2C(fr, (s * (WALL + NICHE - 0.02), 0.12, zc))
            if pc[2] < 1.0:
                continue
            sx, sy = project(pc)
            sz = max(2, int(0.2 * F / pc[2]))
            c.rect(sx - sz // 2, sy - sz // 2, sx + sz // 2 + 1, sy + sz // 2 + 1, 'brass', 4.5)
            c.rect(sx - sz // 2, sy - sz // 2, sx + sz // 2 + 1, sy - sz // 2 + 1, 'brass', 6)
            c.lock[max(0, int(sy - sz // 2)):max(0, int(sy + sz // 2 + 1)), max(0, int(sx - sz // 2)):max(0, int(sx + sz // 2 + 1))] = True
            for k in range(8):
                for sgn_ in (-1, 1):
                    q = L2C(fr, (s * 1.5, -0.55 + k * 0.1, zc + sgn_ * (0.6 - k * 0.17)))
                    if q[2] > 0.8:
                        qx, qy = project(q)
                        c.px(qx, qy, 'brass', 3.4 if k % 2 else 5)

    # ----- cristales, raíces, hongos, moléculas y objetos (de lejos a cerca, con prueba de profundidad) -----
    comp = Compositor(c, t)
    rng = random.Random(9)
    cam_sites = [site_cam(st) for st in sites]
    obj_lights = [(p + n * 0.2, 1.2) for p, n in cam_sites] + \
                 [(L2C(fr, (sd * 1.1, 0.1, zc)), 1.4) for fr in FR for sd, zc, stt in DOORS[fr] if stt != 'futura']
    near8 = [(p + n * 0.2, 1.1) for p, n in cam_sites[:8]]
    items = [(float(site_cam(st)[0][2]), 'cr', st) for st in sites]
    items += [(float(L2C(fr, (x, 0, z))[2]), 'ob', (k_, fr, x, z)) for k_, fr, x, z in OBJS]
    items += [(float(L2C(fr, (0, 0, z))[2]), 'ro', (fr, k_, z, a_)) for fr, k_, z, a_ in ROOTS]
    items += [(float(L2C(fr, (0, 0, z))[2]), 'mu', (fr, s_, z)) for fr, s_, z in MUSH]
    items += [(float(L2C(fr, (0, 0, z))[2]), 'mo', (fr, s_, z, y_)) for fr, s_, z, y_ in MOLS]
    items += [(float(L2C(fr, (0, 0, z))[2]), 'to', (fr, s_, z)) for fr, s_, z in TORCHES]
    items += [(float(L2C(fr, (0, 0, z))[2]), 'la', (fr, z)) for fr, z in LAMPS]
    for zc_, tipo, data in sorted(items, key=lambda it: -it[0]):
        if zc_ < 0.9 or tipo not in STYLE['items']:
            continue
        if tipo == 'cr':
            draw_crystal_cluster(comp, data, glows, rng)
        elif tipo == 'ro':
            draw_root(comp, *data)
        elif tipo == 'mu':
            draw_mushrooms(comp, *data, near8, glows, face)
        elif tipo == 'mo':
            draw_molecule(comp, *data, near8, glows)
        elif tipo == 'to':
            draw_torch(comp, *data, glows)
        elif tipo == 'la':
            draw_lamp(comp, *data, glows)
        else:
            k_, fr, x, z = data
            lt = sorted(obj_lights, key=lambda l: float(np.linalg.norm(l[0] - L2C(fr, (x, 0, z)))))[:4]
            draw_object(comp, k_, fr, x, z, lt, glows, face)

    for fr in FR:
        for idx, (s, zc, st) in enumerate(DOORS[fr]):
            if st == 'futura':
                continue
            pc = L2C(fr, (s * 1.25, 0.2, zc))
            if pc[2] > 0.8:
                sx, sy = project(pc)
                o = opens.get((fr, idx), OPEN_DEFAULT[st])
                halo = THEMES[RAMO[(fr, idx)]]['halo']
                glows.append((sx, sy, 1.1 * F / pc[2] * (1 + 0.25 * o), halo, (0.6 if st == 'repasos' else 0.4) * (1 + 0.15 * o)))
    if STYLE['particles']:
        draw_particles(c, t, glows, opens.get('burst'))
    pend = L2C('M', (0, 0.1, ZMAX - 0.5))
    if pend[2] > 1:
        glows.append((CX + F * pend[0] / pend[2], CY + 4, 26, '#ffcf70', 0.7))

    cold_q = 1 - np.exp(-cold * 1.1)
    warm_q = 1 - np.exp(-warm * 1.1)
    bay = BAYER[yy % 4, xx % 4] + 0.47
    nz1 = 0.5 + 0.5 * np.sin(X * 2.0 + TIME * 0.5) * np.sin(Z * 1.3 - TIME * 0.4)
    nz2 = 0.5 + 0.5 * np.sin(X * 3.1 - TIME * 0.7 + Z * 0.8) * np.sin(Z * 2.2 + TIME * 0.3)
    far = np.clip((t - 1.2) * 0.05, 0, 0.45) * (0.55 + 0.45 * nz1)
    low = 0.28 * np.exp(-np.clip(FLOOR - Y, 0, 5) / 0.22) * (0.4 + 0.6 * nz2)
    fog_f = np.clip((far + low) * STYLE['fog'], 0, 0.6).astype(np.float32)

    def post(a):
        for f_, col, k in ((cold_q, (60, 190, 170), 0.2 * STYLE['coldk']), (warm_q, (255, 170, 80), 0.28 * STYLE['warmk'])):
            q = np.floor(f_ * 4 + bay * 0.6) / 4
            a += q[..., None] * np.array(col, np.float32)[None, None, :] * k
        if STYLE['fog'] > 0:
            a[...] = a * (1 - fog_f[..., None]) + np.array([46, 96, 92], np.float32)[None, None, :] * fog_f[..., None]
        for (sx, sy, r, col, s_) in glows:
            glow(a, sx, sy, r, col, s_ * STYLE['glow'], 4)
        if STYLE['tone'] != 1.0:
            a[...] = 255.0 * (np.clip(a, 0, 255) / 255.0) ** STYLE['tone']
        if flash > 0:
            a[...] = a * (1 - flash) + np.array([255, 236, 200], np.float32) * flash
    return c.render(scale, post)


# ---------- animaciones ----------
def ease(u):
    return u * u * (3 - 2 * u)


def anim_pasos():
    seq = [(0, 0.0, 0, 0, None, 0)] * 3
    for st in range(2):
        for i in range(1, 10):
            u = i / 9
            seq.append((0, st + ease(u), 0, 1.6 * math.sin(math.pi * u), None, 0))
        seq += [(0, st + 1.0, 0, 0, None, 0)] * 3
    return seq


def anim_giro():
    z0 = ZJ - 1.6
    seq = [(0, z0, 0, 0, None, 0)] * 3
    for i in range(1, 9):
        u = i / 8
        seq.append((0, z0 + 1.6 * ease(u), 0, 1.6 * math.sin(math.pi * u), None, 0))
    seq += [(0, ZJ, 0, 0, None, 0)] * 3
    for i in range(1, 13):
        u = i / 12
        seq.append((0, ZJ, math.pi / 2 * ease(u), 0.8 * math.sin(math.pi * u), None, 0))
    seq += [(0, ZJ, math.pi / 2, 0, None, 0)] * 5
    return seq


def anim_puerta():
    """Llegar a la puerta de Orgánica II, mirarla de frente (un paso atrás para ver letrero y murales), abrir el portal y entrar."""
    zd = DOORS['M'][0][1]
    z0 = zd - 1.4
    key = ('M', 0)
    d0 = OPEN_DEFAULT['repasos']
    seq = [(0, z0, 0, 0, None, 0)] * 2
    for i in range(1, 8):
        u = i / 7
        seq.append((0, z0 + 1.4 * ease(u), 0, 1.6 * math.sin(math.pi * u), None, 0))
    for i in range(1, 13):                                   # gira y retrocede hacia la pared de enfrente
        u = ease(i / 12)
        seq.append((-0.65 * u, zd, math.pi / 2 * u, 0.8 * math.sin(math.pi * i / 12), {key: d0}, 0, 0.0))
    seq += [(-0.65, zd, math.pi / 2, 0, {key: d0}, 0, 0.0)] * 4
    for i in range(1, 7):                                    # levanta la vista hacia el letrero
        seq.append((-0.65, zd, math.pi / 2, 0, {key: d0}, 0, 0.22 * ease(i / 6)))
    seq += [(-0.65, zd, math.pi / 2, 0, {key: d0}, 0, 0.22)] * 6
    for i in range(1, 7):
        seq.append((-0.65, zd, math.pi / 2, 0, {key: d0}, 0, 0.22 * (1 - ease(i / 6))))
    seq += [(-0.65, zd, math.pi / 2, 0, {key: d0}, 0, 0.0)] * 6
    for i in range(1, 13):                                   # se abre el portal
        u = ease(i / 12)
        seq.append((-0.65, zd, math.pi / 2, 1.4 * math.sin(i * 2.7) * (1 - u), {key: d0 + (1 - d0) * u, 'burst': ('M', 0, u)}, 0, 0.0))
    for i in range(1, 15):                                   # entra
        u = ease(i / 14)
        seq.append((-0.65 + 1.95 * u, zd, math.pi / 2, 1.2 * math.sin(math.pi * u),
                    {key: 1.0, 'burst': ('M', 0, 1.0 + u), 'zoom': u}, max(0.0, (u - 0.65) / 0.35) * 0.85, 0.0))
    seq += [(1.3, zd, math.pi / 2, 0, {key: 1.0, 'zoom': 1.0}, 0.85, 0.0)] * 2
    return seq


def save_gif(name, seq, scale=3):
    frames = []
    for i, (cx_, cz_, yaw, bob, opens, flash, *pr) in enumerate(seq):
        set_cam(cx_, cz_, yaw, bob + 0.5 * math.sin(i * 0.4), pr[0] if pr else 0.0, i * 0.45)
        frames.append(build(opens, flash, scale))
    pal = [f.convert('P', palette=0, colors=140) for f in frames]
    dur = [80] * len(frames)
    pal[0].save(os.path.join(OUT, name), save_all=True, append_images=pal[1:], duration=dur, loop=0, optimize=False)
    set_cam(0, 0, 0, 0)
    return len(frames)


def estilos():
    """Tres versiones de la misma puerta (Orgánica II) para elegir dirección de arte."""
    global STYLE
    for k, st in STYLES.items():
        STYLE = dict(st)
        set_cam(0.0, 0.6, 0.62, 0.0, 0.12, 1.0)
        build({('M', 0): 0.3}, 0, 3).save(os.path.join(OUT, 'estilo-' + k + '.png'))
    STYLE = dict(STYLE, **{})
    print('listo')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    which = sys.argv[1] if len(sys.argv) > 1 else 'todo'
    if which == 'estilos':
        estilos()
        sys.exit(0)
    jobs = {'pasos': ('sotano-pasos.gif', anim_pasos), 'giro': ('sotano-giro.gif', anim_giro), 'puerta': ('sotano-puerta.gif', anim_puerta)}
    for k, (fn, af) in jobs.items():
        if which in ('todo', k):
            print(k, save_gif(fn, af()))
