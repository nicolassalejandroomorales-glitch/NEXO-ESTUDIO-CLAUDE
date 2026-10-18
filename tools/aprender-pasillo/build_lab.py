"""Sala de Laboratorio (en el pasillo de Aprender, para todos los ramos): nave larga de piedra que se recorre por fases.
PRE al entrar (pizarra de cálculos a la izquierda, vitrina de seguridad a la derecha), DURANTE al medio (banco de montaje bajo
la campana de cobre) y DESPUÉS al fondo (cuaderno de bitácora). A la derecha, el estante de prácticas: un matraz por lab del
semestre que se llena en 3 fases; el próximo (LAB 3) burbujea con su fecha grabada.
Usa el motor de build_sotano.py y piezas de build_camara.py con otra geometría.
Salida: docs/aprender-pasillo/sala-laboratorio.gif (y lab-cuadros.png con los cuadros clave).
Correr: python tools/aprender-pasillo/build_lab.py [gif|cuadros]
"""
import math
import os
import sys

import numpy as np

import build_sotano as bs
from build_sotano import Canvas, glow, BAYER, W, H, F, CX, FLOOR, px
from build_camara import Comp, zpx, mural_tex, ease
from murales import LAB, AW_, AH_

px.RAMPS['copper'] = px.hexes('#2a120c', '#4a2216', '#74361e', '#a04e26', '#c86e34', '#e8975a', '#fcc490', '#ffe8c8')
px.RAMPS['verdin'] = px.hexes('#0a1a16', '#123026', '#1c4a3a', '#286a52', '#3a8e6e', '#58b48e', '#88d8b2', '#c4f4dc')
VERDIN = '#6cd8a8'
LAB_THEME = dict(dots='verdin')

WN, ZB = 1.7, 7.4                        # medio ancho de la nave y muro del fondo (la entrada está en z = 0)
CW, VR = -1.9, 0.7                       # altura donde empieza la bóveda de cañón y cuánto sube al centro
DEP, ARCH = 0.6, 0.9                     # fondo de cada nicho y alto de su arco sobre -0.5
RIBS = [0.7, 3.4, 6.6]                   # arcos fajones (con pilastra y antorcha a cada lado)
TABLE = dict(z0=3.2, z1=4.8, hx=0.55, top=0.18)
ZT = 4.0                                 # centro del banco de montaje y de la campana
PIPE_Y = -1.0

NICHES = [
    dict(key='calculos', o=(-WN, 1.9), n=(-1, 0), r=(0, 1), al=0.75, lines=['CÁLCULOS', '· PRE ·'], mural=(-0.62, 0.62, -1.2, -0.12)),
    dict(key='seguridad', o=(WN, 1.9), n=(1, 0), r=(0, -1), al=0.75, lines=['SEGURIDAD', '· PRE ·'], mural=(-0.6, 0.6, -1.28, -0.38)),
    dict(key='estante', o=(WN, 5.2), n=(1, 0), r=(0, -1), al=1.0, lines=['PRÁCTICAS', 'LAB 3 · JUEVES'], mural=None),
    dict(key='bitacora', o=(0, ZB), n=(0, 1), r=(1, 0), al=0.8, lines=['BITÁCORA', '· DESPUÉS ·'], mural=(-0.55, 0.55, -1.12, -0.3)),
    dict(key='entrada', o=(0, 0), n=(0, -1), r=(-1, 0), al=0.75, lines=None, mural=None, dep=3.0),
]
NI = {a['key']: a for a in NICHES}
SHELF_Y = (-0.35, 0.12)                  # cubierta de cada repisa del estante
D_SHELF = DEP - 0.2                      # fondo donde se paran los matraces
D_LECT = 0.32                            # atril de la bitácora
LABS = 6                                 # prácticas del semestre (el estante muestra una por matraz)

# estado animado del cuadro: avance de la pizarra, de la vitrina, del montaje, fases del LAB 3 (0 a 3) y de la bitácora
STATE = dict(calc=0.0, seg=0.0, mont=0.0, fase=0.0, bit=0.0, pulse=0.0)


def local(a, X, Z):
    """Coordenadas del nicho: d hacia adentro del muro y u a lo ancho (positivo a la derecha de quien lo mira)."""
    ox, oz = a['o']
    return (X - ox) * a['n'][0] + (Z - oz) * a['n'][1], (X - ox) * a['r'][0] + (Z - oz) * a['r'][1]


def wpt(a, d, u, y):
    ox, oz = a['o']
    return np.array([ox + a['n'][0] * d + a['r'][0] * u, y, oz + a['n'][1] * d + a['r'][1] * u], np.float32)


def yarch(u, al):
    return -0.5 - ARCH * np.sqrt(np.clip(1 - (u / al) ** 2, 0, None))


def ceil_y(X):
    return CW - VR * np.sqrt(np.clip(1 - (X / WN) ** 2, 0, None))


def box(d, u, Y, d0, u0, hd, hu, y0, y1):
    return np.maximum(np.maximum(np.abs(d - d0) - hd, np.abs(u - u0) - hu), np.maximum(y0 - Y, Y - y1))


def lectern_y(dd):
    return 0.0 - 0.5 * dd


def hood_half(Y):
    return 0.62 - 0.44 * np.clip((-0.85 - Y) / 0.6, 0, 1)


def furniture(a, d, u, Y):
    k = a['key']
    if k == 'calculos':                                   # repisa de tiza bajo la pizarra
        return box(d, u, Y, DEP - 0.06, 0, 0.07, 0.64, -0.08, -0.03)
    if k == 'seguridad':                                  # mueble bajo de piedra (los frascos van encima)
        return box(d, u, Y, DEP - 0.22, 0, 0.22, 0.66, 0.05, FLOOR + 0.1)
    if k == 'estante':
        g = box(d, u, Y, DEP - 0.22, 0, 0.22, 0.98, 0.5, FLOOR + 0.1)
        for y in SHELF_Y:
            g = np.minimum(g, box(d, u, Y, DEP - 0.22, 0, 0.22, 0.98, y, y + 0.05))
        return g
    if k == 'bitacora':
        g = box(d, u, Y, D_LECT, 0, 0.17, 0.2, 0.05, FLOOR + 0.1)
        g = np.minimum(g, box(d, u, Y, D_LECT, 0, 0.06, 0.06, -0.02, 0.1))
        ys = lectern_y(d - D_LECT)
        return np.minimum(g, np.maximum(np.maximum(np.abs(d - D_LECT) - 0.2, np.abs(u) - 0.42), np.abs(Y - ys - 0.03) - 0.03))
    return np.full(d.shape, 9.0, np.float32)


def parts(X, Y, Z):
    room = np.minimum(np.minimum(WN - np.abs(X), FLOOR - Y), np.minimum(Y - ceil_y(X), np.minimum(Z, ZB - Z)))
    nic = []
    fur = np.full(X.shape, 9.0, np.float32)
    for a in NICHES:
        d, u = local(a, X, Z)
        al = a['al']
        nic.append(np.minimum(np.minimum(al - np.abs(u), a.get('dep', DEP) - d), np.minimum(d + 0.3, np.minimum(FLOOR - Y, Y - yarch(u, al)))))
        fur = np.minimum(fur, furniture(a, d, u, Y))
    tb = np.minimum(box(Z, X, Y, (TABLE['z0'] + TABLE['z1']) / 2, 0, (TABLE['z1'] - TABLE['z0']) / 2, TABLE['hx'], TABLE['top'], TABLE['top'] + 0.08),
                    box(Z, X, Y, (TABLE['z0'] + TABLE['z1']) / 2, 0, (TABLE['z1'] - TABLE['z0']) / 2 - 0.1, TABLE['hx'] - 0.1, TABLE['top'], FLOOR + 0.1))
    hh = hood_half(Y)
    hood = np.maximum(np.maximum(np.abs(X) - hh, np.abs(Z - ZT) - hh - 0.08), np.maximum(-1.45 - Y, Y + 0.85))
    hood = np.minimum(hood, np.maximum(np.hypot(X, Z - ZT) - 0.17, Y + 1.4))
    rib = np.full(X.shape, 9.0, np.float32)
    for zr in RIBS:
        rib = np.minimum(rib, np.maximum(np.abs(Z - zr) - 0.1, np.minimum(WN - 0.12 - np.abs(X), Y - ceil_y(X) - 0.12)))
    return room, nic, fur, tb, hood, rib


def emptiness(X, Y, Z):
    """> 0 en el aire de la sala, < 0 dentro de la roca o de un mueble."""
    room, nic, fur, tb, hood, rib = parts(X, Y, Z)
    g = room
    for gn in nic:
        g = np.maximum(g, gn)
    return np.minimum(np.minimum(g, fur), np.minimum(np.minimum(tb, hood), rib))


def march():
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    dxc = (xs - CX + 0.5) / F
    dyc = (ys - bs.CY + 0.5) / F
    c_, s_ = math.cos(bs.YAW), math.sin(bs.YAW)
    cp, sp = math.cos(bs.PITCH), math.sin(bs.PITCH)
    yr, zr = dyc * cp - sp, dyc * sp + cp
    dwx, dwy, dwz = dxc * c_ + zr * s_, yr, -dxc * s_ + zr * c_

    def at(t):
        return bs.CAMX + t * dwx, t * dwy, bs.CAMZ + t * dwz
    t = np.zeros((H, W), np.float32)
    lo = np.zeros((H, W), np.float32)
    hi = np.zeros((H, W), np.float32)
    hit = np.zeros((H, W), bool)
    step = 0.05
    for _ in range(int(10.5 / step)):
        t = t + step
        occ = emptiness(*at(t)) < 0
        new = occ & ~hit
        lo = np.where(new, t - step, lo)
        hi = np.where(new, t, hi)
        hit |= occ
        if hit.all():
            break
    hi = np.where(hit, hi, t)
    for _ in range(11):
        mid = (lo + hi) / 2
        occ = emptiness(*at(mid)) < 0
        hi = np.where(occ, mid, hi)
        lo = np.where(occ, lo, mid)
    return np.stack(at(hi), -1), hi, np.stack(at(lo), -1)


def normals(P):
    e = 0.012
    X, Y, Z = P[..., 0], P[..., 1], P[..., 2]
    n = np.stack([emptiness(X + e, Y, Z) - emptiness(X - e, Y, Z),
                  emptiness(X, Y + e, Z) - emptiness(X, Y - e, Z),
                  emptiness(X, Y, Z + e) - emptiness(X, Y, Z - e)], -1)
    return n / (np.linalg.norm(n, axis=-1, keepdims=True) + 1e-6)


# ---------- objetos ----------
def C(x, y, z):
    return bs.to_cam(np.array([x, y, z], np.float32))


def seg(ly, A, B, mat, lv, wd):
    """Trazo recto entre dos puntos de cámara, de `wd` unidades de mundo de grosor."""
    if A[2] < 0.4 or B[2] < 0.4:
        return
    (ax, ay), (bx, by) = bs.project(A), bs.project(B)
    k = max(1, int(round(wd * F / ((A[2] + B[2]) / 2))))
    for o in range(k):
        ly.line(ax + o - k // 2, ay, bx + o - k // 2, by, mat, lv + (1.2 if o == 0 and k > 1 else 0))


def flask(ly, P, rad, fill, lights, liquid='verdin', lit=4.6, glass=1.0):
    """Matraz de fondo redondo con cuello: vidrio con borde y brillo, líquido hasta `fill` (0 a 1)."""
    sx, sy, rp = bs.sphere_px(ly, P, rad, 'glass', 1.4 * glass - 0.6, lights, spec=0, rim=0.4)
    neck = P + bs.camdir((0, -rad * 0.85, 0))
    bs.cylinder_px(ly, neck, rad * 0.32, rad * 0.95, 'glass', 2.4, lights, spec=1.2)
    if fill > 0:
        bs.sphere_px(ly, P, rad * 0.9, liquid, lit, lights, spec=0.8, rim=0.7, only=lambda dx, dy: dy > 1 - 2 * fill)
    yy, xx = np.mgrid[0:H, 0:W]
    ring_ = np.abs(np.hypot((xx + 0.5 - sx) / rp, (yy + 0.5 - sy) / rp) - 0.93) < 0.12
    ly.mask(ring_, 'glass', 4.6 * glass)
    ly.px(sx - rp * 0.45, sy - rp * 0.45, 'petal', 4.0)
    return sx, sy, rp


def bubbles(ly, P, rad, n, speed, seed_):
    sx, sy = bs.project(P)
    rp = rad * F / P[2]
    rg = np.random.RandomState(seed_)
    for k in range(n):
        ph = rg.rand()
        q = (ph + bs.TIME * speed) % 1.0
        x = sx + (rg.rand() - 0.5) * rp * 1.1
        y = sy + rp * 0.75 - q * rp * 0.85
        ly.px(x, y, 'verdin', 7.2 if k % 2 else 6.2)


def draw_bench(comp, glows, lights):
    """Banco de montaje: reflujo que se arma pieza a pieza. Sin refrigerante el vapor se escapa (humo); con él, gotea de vuelta."""
    m = STATE['mont']
    top = TABLE['top']
    base = C(0, top, ZT)
    if base[2] < 0.6:
        return
    heat = ease((m - 0.25) / 0.08)
    fl_y = top - 0.09 - 0.085
    drop = (1 - ease((m - 0.06) / 0.14)) * 0.6
    cond = ease((m - 0.5) / 0.12)
    pieces = []

    def stand(ly):
        bs.cylinder_px(ly, C(0.24, top, ZT + 0.12), 0.11, 0.02, 'crypt', 3.0, lights, spec=1.0)
        seg(ly, C(0.24, top, ZT + 0.12), C(0.24, -0.8, ZT + 0.12), 'brass', 3.4, 0.018)
        for y in (fl_y - 0.11, -0.4):
            seg(ly, C(0.24, y, ZT + 0.12), C(0.04, y, ZT + 0.02), 'brass', 3.8, 0.014)
    pieces.append((float(C(0.24, 0, ZT + 0.12)[2]), stand))

    def mantle(ly):
        bs.cylinder_px(ly, C(0, top, ZT), 0.13, 0.09, 'copper', 2.6, lights, spec=1.6)
        if heat > 0:
            sx, sy = bs.project(C(0, top - 0.09, ZT))
            k = 0.12 * F / base[2]
            ly.rect(sx - k, sy - 1, sx + k, sy + 1, 'flame', 4.4 + 1.2 * heat * (0.8 + 0.2 * math.sin(bs.TIME * 9)))
    pieces.append((float(base[2]) - 0.01, mantle))

    if m > 0.06:
        def fl(ly):
            P = C(0, fl_y - drop, ZT)
            flask(ly, P, 0.095, 0.55, lights, lit=4.2 + 1.4 * heat)
            if heat > 0:
                bubbles(ly, P, 0.095, 9, 1.4, 3)
        pieces.append((float(base[2]) - 0.02, fl))
    if cond > 0:
        def cn(ly):
            y0 = fl_y - 0.17 - (1 - cond) * 0.7
            A, B = C(0, y0, ZT), C(0, y0 - 0.44, ZT)
            bs.cylinder_px(ly, A, 0.05, 0.44, 'glass', 1.8, lights, spec=1.4)
            bs.cylinder_px(ly, A, 0.034, 0.44, 'blue', 2.6 + 0.6 * math.sin(bs.TIME * 2), lights, spec=0.6)
            seg(ly, A, B, 'glass', 5.6, 0.008)
            if cond >= 1:
                seg(ly, C(0.0, y0 - 0.06, ZT), C(-0.32, top, ZT - 0.2), 'blue', 2.4, 0.012)
                seg(ly, C(0.0, y0 - 0.38, ZT), C(-0.42, top, ZT + 0.1), 'blue', 2.4, 0.012)
            if m > 0.64:
                for k in range(4):
                    q = (k / 4 + bs.TIME * 0.9) % 1.0
                    sx, sy = bs.project(C(0, y0 - 0.42 + 0.44 * q, ZT))
                    ly.px(sx, sy, 'verdin', 7.4)
        pieces.append((float(base[2]) - 0.03, cn))
    for _, fn in sorted(pieces, key=lambda p: -p[0]):
        ly = Canvas(W, H)
        fn(ly)
        ly.lock |= ly.mat != 0
        comp.paste(ly, float(base[2]) - 0.1, 0.4)
    if heat > 0:
        gx, gy = bs.project(C(0, fl_y, ZT))
        glows.append((gx, gy, 0.5 * F / base[2], VERDIN, 0.35 + 0.25 * heat))
    smoke = max(0.0, 1 - abs(m - 0.4) / 0.13) if m < 0.56 else 0.0
    if smoke > 0:                                          # error: calentar sin refrigerante, el vapor se escapa
        ly = Canvas(W, H)
        rg = np.random.RandomState(11)
        for k in range(34):
            q = (rg.rand() + bs.TIME * 0.5) % 1.0
            wob = math.sin(bs.TIME * 3 + k) * 0.03
            p_ = C((rg.rand() - 0.5) * 0.08 * (1 + 5 * q) + wob, fl_y - 0.18 - q * 0.75, ZT)
            sx, sy = bs.project(p_)
            r_ = 1 + int(q * 2.5)
            if rg.rand() < smoke:
                ly.rect(sx - r_, sy - r_, sx + r_, sy + r_, 'cloud', 3.6 - 1.8 * q)
        ly.lock |= ly.mat != 0
        comp.paste(ly, float(base[2]) - 0.2, 0.4)


def draw_shelf(comp, glows, lights):
    """Estante de prácticas: un matraz por lab; los hechos llenos, el LAB 3 se llena por fases y burbujea, los que vienen vacíos."""
    a = NI['estante']
    fase = STATE['fase']
    items = []
    for i in range(LABS):
        row, col = i // 3, i % 3
        P = bs.to_cam(wpt(a, D_SHELF, -0.6 + 0.6 * col, SHELF_Y[row] - 0.095))
        items.append((float(P[2]), i, P))
    for z, i, P in sorted(items, key=lambda it: -it[0]):
        if z < 0.6:
            continue
        ly = Canvas(W, H)
        fill = 1.0 if i < 2 else (fase / 3 if i == 2 else 0.0)
        lit = 5.6 if i < 2 else 5.0 + 1.4 * STATE['pulse']
        sx, sy, rp = flask(ly, P, 0.095, fill, lights if i <= 2 else [], lit=lit, glass=1.0 if i <= 2 else 0.7)
        for f in (1 / 3, 2 / 3):                          # marcas de las 3 fases (pre, montaje, informe)
            yl = sy + rp * (1 - 2 * f)
            hw = rp * math.sqrt(max(0.0, 1 - (1 - 2 * f) ** 2))
            ly.line(sx - hw, yl, sx + hw, yl, 'brass', 3.6)
        if i == 2:
            bubbles(ly, P, 0.095, 6, 0.8, 7)
        ly.lock |= ly.mat != 0
        comp.paste(ly, z, 0.2)
        if i < 2 or (i == 2 and fill > 0):
            glows.append((sx, sy, rp * 3.0, VERDIN, 0.22 + (0.25 * STATE['pulse'] if i == 2 else 0.1)))


def draw_bottles(comp, glows, lights):
    """Frascos de reactivos sobre el mueble de la vitrina, con etiqueta y rombo rojo; brilla el que se está revisando."""
    a = NI['seguridad']
    k_on = int(bs.TIME / 4) % 3
    for j, u in enumerate((-0.38, 0.0, 0.38)):
        P = bs.to_cam(wpt(a, DEP - 0.24, u, 0.05))
        if P[2] < 0.6:
            continue
        ly = Canvas(W, H)
        sx, sy, rp, hp = bs.cylinder_px(ly, P, 0.06, 0.2, 'wood' if j != 1 else 'glass', 2.6, lights, spec=1.6)
        bs.cylinder_px(ly, bs.to_cam(wpt(a, DEP - 0.24, u, -0.15)), 0.035, 0.05, 'crypt', 2.4, lights, spec=1.0)
        lab_ = (np.mgrid[0:H, 0:W][0] + 0.5 > sy - hp * 0.75) & (np.mgrid[0:H, 0:W][0] + 0.5 < sy - hp * 0.3)
        ly.mask(lab_ & (ly.mat != 0) & (np.abs(np.mgrid[0:H, 0:W][1] + 0.5 - sx) < rp * 0.85), 'paper', 4.2)
        dy = sy - hp * 0.52
        rr = max(1.0, rp * 0.4)
        for t_ in range(int(rr) + 1):
            ly.line(sx - (rr - t_), dy - t_, sx + (rr - t_), dy - t_, 'red', 4.2)
            ly.line(sx - (rr - t_), dy + t_, sx + (rr - t_), dy + t_, 'red', 4.2)
        ly.lock |= ly.mat != 0
        comp.paste(ly, float(P[2]), 0.2)
        if j == k_on:
            glows.append((sx, sy - hp * 0.5, rp * 3.4, '#ff8a5a', 0.3))


def draw_book(comp):
    """Cuaderno de bitácora abierto sobre el atril: los renglones de la página derecha se escriben con STATE['bit']."""
    a = NI['bitacora']

    def at(dd, u, lift=0.0):
        return wpt(a, D_LECT + dd, u, lectern_y(dd) - 0.005 - lift)
    P = bs.to_cam(at(0, 0))
    if P[2] < 0.6:
        return
    ly = Canvas(W, H)

    def quad(pts, mat, lvl):
        Q = [bs.to_cam(p) for p in pts]
        if min(q[2] for q in Q) < 0.4:
            return
        q = [np.array(bs.project(p)) for p in Q]
        bs.tri(ly, q[0], q[1], q[2], mat, lvl)
        bs.tri(ly, q[0], q[2], q[3], mat, lvl)
    quad([at(-0.18, -0.38), at(0.18, -0.38), at(0.18, 0.38), at(-0.18, 0.38)], 'copper', 2.4)
    for s in (-1, 1):
        quad([at(-0.16, s * 0.01, 0.01), at(0.16, s * 0.01, 0.01), at(0.16, s * 0.35, 0.01), at(-0.16, s * 0.35, 0.01)], 'paper', 4.4 if s > 0 else 3.6)
        n = 6 if s < 0 else int(6 * STATE['bit'] + 0.5)
        for k in range(n):
            dd = -0.11 + 0.045 * k
            A, B = bs.to_cam(at(dd, s * 0.06, 0.015)), bs.to_cam(at(dd, s * (0.3 - 0.08 * (k % 3 == 2)), 0.015))
            (ax, ay), (bx, by) = bs.project(A), bs.project(B)
            ly.line(ax, ay, bx, by, 'paper', 1.6)
    ly.lock |= ly.mat != 0
    comp.paste(ly, float(P[2]), 0.25)


def draw_torch(comp, pos, glows):
    P = bs.to_cam(np.array(pos, np.float32))
    if P[2] < 0.7:
        return
    ly = Canvas(W, H)
    sx, sy = bs.project(P)
    k = max(1.0, 0.07 * F / P[2])
    ly.rect(sx - k * 0.4, sy + k * 0.2, sx + k * 0.4, sy + k * 2.6, 'copper', 3.4)
    ly.rect(sx - k * 0.9, sy + k * 0.2, sx + k * 0.9, sy + k * 0.8, 'copper', 4.6)
    fl = 1.0 + 0.18 * math.sin(bs.TIME * 7 + pos[2] * 3)
    for (dy, r, lv) in ((-0.2, 1.1, 4.0), (-1.1, 0.8, 5.0), (-1.9, 0.45, 5.8)):
        ly.rect(sx - k * r * fl, sy + k * dy - k * 0.5, sx + k * r * fl, sy + k * dy + k * 0.5, 'flame', lv)
    ly.lock |= ly.mat != 0
    comp.paste(ly, float(P[2]), 0.5)
    glows.append((sx, sy - k, 0.35 * F / P[2] + 8, '#ff9a3c', 0.75 * fl))


def torches():
    return [(s * (WN - 0.24), -0.75, zr) for zr in RIBS for s in (-1, 1)]


def draw_motes(c, zb):
    rg = np.random.RandomState(5)
    base = rg.rand(70, 3)
    for k in range(70):
        x = (base[k, 0] - 0.5) * 2 * (WN - 0.2) + 0.05 * math.sin(bs.TIME * 0.6 + k)
        z = 0.3 + base[k, 1] * (ZB - 0.6)
        y = 0.6 - ((base[k, 2] * 2.8 + bs.TIME * 0.06 * (0.5 + base[k, 1])) % 2.8)
        P = bs.to_cam(np.array([x, y, z], np.float32))
        if P[2] < 0.6:
            continue
        sx, sy = bs.project(P)
        zpx(c, zb, sx, sy, P[2], 'verdin' if k % 3 else 'flame', 6.2)


def sign(c, sel, u, Y, lines, u_half, y0, y1, lum, mat='verdin'):
    """Letrero de piedra grabada sobre `sel` (u a lo ancho, Y de y0 a y1); las letras brillan en `mat`."""
    plate = sel & (np.abs(u) < u_half) & (Y > y0) & (Y < y1)
    if not plate.any():
        return
    pu = np.clip(((u + u_half) / (2 * u_half) * bs.SIGN_W).astype(int), 0, bs.SIGN_W - 1)
    pv = np.clip(((Y - y0) / (y1 - y0) * bs.SIGN_H).astype(int), 0, bs.SIGN_H - 1)
    code = bs.sign_texture(lines)[pv, pu]
    slab = np.clip(lum * 3.0 + 3.0, 2.4, 5.6).astype(np.float32)
    c.mask(plate, 'stone', slab)
    c.mask(plate & (code == 1), 'stone', slab + 1.3)
    c.mask(plate & (code == 8), 'stone', np.clip(slab - 2.2, 0.6, 4))
    c.mask(plate & (code == 7), 'stone', slab + 1.6)
    c.mask(plate & (code == 2), mat, 5.4 + 1.0 * bs.PULSE)
    c.mask(plate & (code == 6), mat, 3.0)
    c.lock |= plate & ((code == 2) | (code == 6))


# ---------- cuadro ----------
def build(scale=3):
    Pw, t, Plo = march()
    X, Y, Z = Pw[..., 0], Pw[..., 1], Pw[..., 2]
    yy, xx = np.mgrid[0:H, 0:W]
    N = normals(Pw)
    room, nic, _, _, _, _ = parts(Plo[..., 0], Plo[..., 1], Plo[..., 2])
    region = np.argmax(np.stack([room] + nic), axis=0)
    _, _, fur_h, tb_h, hood_h, rib_h = parts(X, Y, Z)
    is_hood = hood_h < 0.02
    is_tb = (tb_h < 0.02) & ~is_hood
    is_rib = (rib_h < 0.02) & ~is_hood & ~is_tb
    is_fur = (fur_h < 0.02) & ~is_rib & ~is_tb & ~is_hood
    floor = N[..., 1] < -0.7
    ceil = N[..., 1] > 0.45
    wall = ~floor & ~ceil

    # ----- luces: el reflujo (verde, se enciende al calentar), la lámpara de la campana y antorchas -----
    cold = np.zeros((H, W), np.float32)
    warm = np.zeros((H, W), np.float32)

    def add(lpos, inten, acc):
        Lv = np.array(lpos, np.float32)[None, None, :] - Pw
        d2 = (Lv ** 2).sum(-1) + 1e-4
        nd = np.clip((Lv * N).sum(-1) / np.sqrt(d2), 0, 1)
        acc += inten * (0.25 + 0.75 * nd) / (d2 + 0.35)
    heat = ease((STATE['mont'] - 0.25) / 0.08)
    bub = 1.0 + 0.12 * math.sin(bs.TIME * 5.1) + 0.08 * math.sin(bs.TIME * 13)
    add((0, -0.2, ZT - 0.35), (1.0 + 1.6 * heat) * bub, cold)
    add((0, -0.55, ZT), 0.7, warm)
    add(wpt(NI['estante'], D_SHELF - 0.3, 0, -0.4), 0.8 + 0.8 * STATE['fase'] / 3 + 0.6 * STATE['pulse'], cold)
    add(wpt(NI['seguridad'], DEP - 0.45, 0, -0.7), 0.7, cold)
    add(wpt(NI['calculos'], DEP - 0.5, 0, -0.6), 0.9, warm)
    add(wpt(NI['bitacora'], 0.1, 0.3, -0.5), 1.1, warm)
    add((0, -0.4, -1.4), 0.5, cold)
    fl = 1.0 + 0.15 * math.sin(bs.TIME * 6.3) + 0.1 * math.sin(bs.TIME * 11.1)
    for p_ in torches():
        add((p_[0] * 0.85, p_[1], p_[2]), 0.85 * fl, warm)

    lum = 0.03 + 0.8 * (1 - np.exp(-(warm * 0.8 + cold * 0.8) * 0.8))
    g1 = emptiness(*(Pw + N * 0.12).transpose(2, 0, 1))
    g2 = emptiness(*(Pw + N * 0.32).transpose(2, 0, 1))
    ao = np.clip(1 - 1.6 * (np.clip(0.12 - g1, 0, None) + 0.5 * np.clip(0.32 - g2, 0, None)), 0.3, 1)
    lum = lum * (0.45 + 0.55 * ao) * np.clip(1.1 - t * 0.06, 0.25, 1)
    lum = np.clip(lum, 0, 1.6) ** bs.STYLE['gamma']

    # ----- textura de piedra (u a lo largo del muro, v hacia arriba) -----
    side = np.abs(N[..., 0]) > 0.6
    u = np.where(floor | ceil, X * 1.0, np.where(side, Z, X))
    v = np.where(floor | ceil, Z, Y + 3.0)
    rowh = np.where(floor | ceil, 0.6, 0.34).astype(np.float32)
    tex = bs.stone_tex(u, v, rowh, t)
    lvl = lum * 5.4 + tex * 0.75 * np.clip(lum * 2 + 0.25, 0, 1)

    c = Canvas(W, H)
    c.dither = {k_: bs.STYLE['dither'] for k_ in ('crypt', 'stone', 'wood', 'wall')}
    c.mat[:] = c.mid('crypt')
    c.lvl[:] = np.clip(lvl, 0, 8).astype(np.float32)
    glows = []
    L5 = lambda add_, lo, hi: np.clip(lum * 5.4 + add_, lo, hi).astype(np.float32)   # noqa: E731

    # arcos fajones: piedra más clara con dovelas
    c.mask(is_rib, 'crypt', L5(1.0, 0.6, 6.6))
    c.mask(is_rib & ((np.floor((Y + np.abs(X)) * 6) % 2) == 0), 'crypt', L5(0.4, 0.4, 6))
    # musgo y verdín que chorrea bajo las tuberías
    nz_ = np.sin(u * 5.1 + v * 3.7) * np.sin(u * 2.9 - v * 6.3)
    moss = ((wall & (Y > 0.3)) | (floor & (ao < 0.8))) & (nz_ > 0.45) & ~is_fur & ~is_tb
    c.mask(moss, 'shade', np.clip(lum * 2.4 + 2.2, 1, 5).astype(np.float32))
    c.mask(moss & (bs.hash2(xx * 1.0, yy * 1.0) > 0.82), 'sprout', 3.4)
    in_room = (region == 0) & wall & ~is_rib & ~is_hood & ~is_tb & side
    streak = in_room & (Y > PIPE_Y) & (Y < PIPE_Y + 0.6) & (np.sin(Z * 23.0) * np.sin(Z * 7.3) > 0.55) & (bs.hash2(Z * 40, Y * 3) > 0.25 + (Y - PIPE_Y))
    c.mask(streak, 'verdin', np.clip(lum * 3 + 1.0, 0.8, 3.4).astype(np.float32))
    tt = (Y - PIPE_Y) / 0.05
    pipe = in_room & (np.abs(tt) < 1)
    c.mask(pipe, 'copper', np.clip(0.6 + lum * 1.6 + 2.2 * np.sqrt(np.clip(1 - tt ** 2, 0, 1)) - 0.7 * tt, 0.6, 5).astype(np.float32))
    c.mask(pipe & (np.abs((Z % 1.3) - 0.65) < 0.03), 'verdin', 3.6)

    # banco de montaje: mármol claro con vetas; base oscura
    top_ = is_tb & (Y < TABLE['top'] + 0.085)
    c.mask(is_tb, 'crypt', L5(0.2, 0.3, 4.4))
    vein = np.sin(X * 9 + Z * 4 + np.sin(Z * 13) * 1.5)
    c.mask(top_, 'crypt', L5(1.6, 3.0, 6.8))
    c.mask(top_ & (np.abs(vein) < 0.1), 'verdin', L5(-0.6, 1.6, 3.6))
    c.mask(top_ & wall, 'crypt', L5(2.4, 3.6, 7.6))

    # campana de cobre: planchas remachadas con verdín; boca oscura con la lámpara
    c.mask(is_hood, 'copper', L5(0.6, 0.8, 5.6))
    seam = is_hood & ((np.abs(((Y + 1.45) % 0.2) - 0.1) < 0.012) | (np.abs(np.abs(X) - 0.02) < 0.012))
    c.mask(seam, 'copper', L5(1.8, 2, 6.4))
    vrd = is_hood & (np.sin(X * 31 + Y * 7) * np.sin(Y * 23 - Z * 5) > 0.55)
    c.mask(vrd, 'verdin', L5(0.8, 1.4, 4.6))
    c.mask(is_hood & ceil, 'crypt', 0.6)
    c.lock |= is_hood & ceil
    c.mask(is_hood & wall & (np.abs(Y + 0.87) < 0.025), 'copper', L5(2.4, 3, 6.6))
    hface = is_hood & (N[..., 2] < -0.4)
    sign(c, hface, X, Y, ['MONTAJE', '· DURANTE ·'], 0.42, -1.27, -0.97, lum)

    # muebles de los nichos: piedra pulida
    c.mask(is_fur, 'crypt', L5(0.6, 0.4, 5))
    c.mask(is_fur & floor, 'stone', L5(1.4, 1.2, 5.4))

    # ----- nichos: marco de dovelas, incrustación de verdín, letrero y mural -----
    room_wall = wall & (region == 0) & ~is_rib & ~is_hood & ~is_tb
    for k, a in enumerate(NICHES):
        d_, u_ = local(a, X, Z)
        al = a['al']
        front = (d_ > -0.05) & (d_ < 0.05)
        mine = region == k + 1
        frame = room_wall & front & (np.abs(u_) < al + 0.13) & (Y > yarch(np.clip(u_, -al - 0.12, al + 0.12) * al / (al + 0.13), al) - 0.13)
        c.mask(frame, 'stone', np.clip(lum * 4 + 3.0, 2.6, 6).astype(np.float32))
        c.mask(frame & ((np.floor(np.arctan2(Y + 0.5, u_) * 5.5) % 2) == 0), 'stone', np.clip(lum * 4 + 2.2, 2, 5.4).astype(np.float32))
        c.lock |= frame
        if a['lines'] is None:
            continue
        inl = frame & (np.abs(np.hypot(u_ / (al + 0.04), np.clip(-(Y + 0.5), 0, None) / (ARCH + 0.04)) - 1) < 0.035)
        c.mask(inl, 'verdin', 2.8 + 0.6 * bs.PULSE)
        sign(c, room_wall & front, u_, Y, a['lines'], 0.95, -1.82, -1.5, lum)
        if a['mural'] is None:
            continue
        mu0, mu1, my0, my1 = a['mural']
        back = mine & wall & (d_ > DEP - 0.03)
        pm = back & (u_ > mu0) & (u_ < mu1) & (Y > my0) & (Y < my1)
        if pm.any():
            edge = np.minimum(np.minimum(u_ - mu0, mu1 - u_), np.minimum(Y - my0, my1 - Y))
            rim_l = pm & (edge < 0.04) & (((u_ - mu0) < 0.04) | ((Y - my0) < 0.04))
            c.mask(rim_l, 'copper', np.clip(lum * 3 + 3.8, 3, 6).astype(np.float32))
            c.mask(pm & (edge < 0.04) & ~rim_l, 'copper', 1.4)
            inner = pm & (edge >= 0.04)
            tx = np.clip(((u_ - mu0 - 0.04) / (mu1 - mu0 - 0.08) * AW_).astype(int), 0, AW_ - 1)
            ty = np.clip(((Y - my0 - 0.04) / (my1 - my0 - 0.08) * AH_).astype(int), 0, AH_ - 1)
            p_ = {'calculos': STATE['calc'], 'seguridad': STATE['seg'], 'bitacora': STATE['bit']}[a['key']]
            mc = mural_tex(LAB[a['key']](bs.TIME, p_), pm)[ty, tx]
            c.mask(inner, 'crypt', np.clip(lum * 1.2 + 1.0, 0.6, 2.4).astype(np.float32))
            for cd, (mat_, lv_) in bs.mural_colors(LAB_THEME).items():
                mk = inner & (mc == cd)
                c.mask(mk, mat_, lv_)
                c.lock |= mk
        mouth = bs.to_cam(wpt(a, 0.0, 0, -0.4))
        if mouth[2] > 0.8:
            gx_, gy_ = bs.project(mouth)
            glows.append((gx_, gy_, 1.0 * F / mouth[2], VERDIN, 0.1))
    # gran letrero en el tímpano del fondo, visible desde la entrada
    back_w = wall & (region == 0) & (Z > ZB - 0.05) & ~is_rib
    sign(c, back_w, X, Y, ['LABORATORIO'], 1.05, -2.42, -2.08, lum)

    # ----- objetos de lejos a cerca -----
    zb = t.copy()
    comp = Comp(c, zb)
    obj_lights = [(C(0, -0.2, ZT - 0.35), 1.2 + 1.4 * heat), (C(0, -0.55, ZT), 1.0),
                  (bs.to_cam(wpt(NI['estante'], D_SHELF - 0.3, 0, -0.4)), 1.4), (bs.to_cam(wpt(NI['seguridad'], DEP - 0.45, 0, -0.7)), 1.2),
                  (bs.to_cam(wpt(NI['bitacora'], 0.1, 0.3, -0.5)), 1.2)]
    items = [(float(C(0, 0, ZT)[2]), 'bench'), (float(bs.to_cam(wpt(NI['estante'], D_SHELF, 0, 0))[2]), 'shelf'),
             (float(bs.to_cam(wpt(NI['seguridad'], DEP - 0.24, 0, 0))[2]), 'bottles'),
             (float(bs.to_cam(wpt(NI['bitacora'], D_LECT, 0, 0))[2]), 'book')]
    items += [(float(bs.to_cam(np.array(p_, np.float32))[2]), p_) for p_ in torches()]
    for zc_, it in sorted(items, key=lambda it: -it[0]):
        if zc_ < 0.5:
            continue
        if it == 'bench':
            draw_bench(comp, glows, obj_lights)
        elif it == 'shelf':
            draw_shelf(comp, glows, obj_lights)
        elif it == 'bottles':
            draw_bottles(comp, glows, obj_lights)
        elif it == 'book':
            draw_book(comp)
        else:
            draw_torch(comp, it, glows)
    draw_motes(c, zb)

    # ----- luz de color, neblina baja y halos -----
    cold_q = 1 - np.exp(-cold * 1.1)
    warm_q = 1 - np.exp(-warm * 1.1)
    bay = BAYER[yy % 4, xx % 4] + 0.47
    nz1 = 0.5 + 0.5 * np.sin(X * 2.0 + bs.TIME * 0.5) * np.sin(Z * 1.3 - bs.TIME * 0.4)
    nz2 = 0.5 + 0.5 * np.sin(X * 3.1 - bs.TIME * 0.7 + Z * 0.8) * np.sin(Z * 2.2 + bs.TIME * 0.3)
    far = np.clip((t - 1.5) * 0.045, 0, 0.4) * (0.55 + 0.45 * nz1)
    low = 0.28 * np.exp(-np.clip(FLOOR - Y, 0, 5) / 0.22) * (0.4 + 0.6 * nz2)
    fog_f = np.clip((far + low) * bs.STYLE['fog'], 0, 0.7).astype(np.float32)

    def post(arr):
        for f_, col, k in ((cold_q, (70, 200, 150), 0.2 * bs.STYLE['coldk']), (warm_q, (255, 160, 90), 0.28 * bs.STYLE['warmk'])):
            q = np.floor(f_ * 4 + bay * 0.6) / 4
            arr += q[..., None] * np.array(col, np.float32)[None, None, :] * k
        arr[...] = arr * (1 - fog_f[..., None]) + np.array([40, 92, 78], np.float32)[None, None, :] * fog_f[..., None]
        for (gx, gy, rad, col, s_) in glows:
            glow(arr, gx, gy, rad, col, s_ * bs.STYLE['glow'], 4)
        arr[...] = 255.0 * (np.clip(arr, 0, 255) / 255.0) ** bs.STYLE['tone']
    return c.render(scale, post)


# ---------- recorrido ----------
def recorrido():
    """Por cuadro: cámara (x, z, giro, balanceo, inclinación) y estado de la animación."""
    seq = []
    pose = dict(x=0.0, z=-1.8, yaw=0.0, pitch=0.04)
    st = dict(STATE)

    def go(n, steps=1.0, anim=None, **to):
        a = dict(pose)
        for i in range(1, n + 1):
            u = ease(i / n)
            for k_, v_ in to.items():
                pose[k_] = a[k_] + (v_ - a[k_]) * u
            if anim:
                st.update(anim(i / n))
            bob = 1.4 * abs(math.sin(math.pi * steps * u)) if steps else 0.0
            seq.append(((pose['x'], pose['z'], pose['yaw'], bob, pose['pitch']), dict(st)))

    def hold(n, anim=None):
        go(n, steps=0, anim=anim)
    R90 = math.radians(90)
    go(14, steps=2, z=0.6)                                   # entra: la nave entera, la campana y "LABORATORIO" al fondo
    hold(6)
    go(10, steps=1.5, z=1.9)
    go(10, steps=0, yaw=-R90, pitch=0.1)                     # PRE: la pizarra de cálculos
    go(7, steps=0.5, x=-0.85)
    hold(18, lambda q: dict(calc=q))
    go(7, steps=0.5, x=0.0)
    go(12, steps=0, yaw=R90)                                 # PRE: la vitrina de seguridad
    go(7, steps=0.5, x=0.85)
    hold(16, lambda q: dict(seg=q))
    go(7, steps=0.5, x=0.0, anim=lambda q: dict(fase=q))
    go(10, steps=0, yaw=0.0, pitch=0.06)                     # DURANTE: el banco de montaje bajo la campana
    go(8, steps=1, z=2.55, pitch=0.16)
    hold(30, lambda q: dict(mont=q))
    go(8, steps=1, x=1.0, z=3.0, yaw=math.radians(15))       # rodea el banco por la derecha
    go(10, steps=1.5, z=5.2, yaw=0.0)
    go(8, steps=0, yaw=R90, pitch=0.04)                      # el estante: el LAB 3 sube a 2/3
    hold(16, lambda q: dict(fase=1 + ease(q), pulse=math.sin(math.pi * q)))
    go(8, steps=0, yaw=0.0, anim=lambda q: dict(pulse=0.0))
    go(10, steps=1.5, x=0.0, z=6.3, pitch=0.08)              # DESPUÉS: la bitácora del fondo
    hold(20, lambda q: dict(bit=q))
    go(12, steps=0, yaw=math.radians(118), pitch=0.04)       # vuelve a mirar el estante: el LAB 3 se completa
    hold(18, lambda q: dict(fase=2 + ease(q / 0.6), pulse=max(0.0, math.sin(math.pi * q))))
    return seq


def render_seq(seq, scale=3):
    frames = []
    for i, (cam, st) in enumerate(seq):
        x, z, yaw, bob, pitch = cam
        STATE.update(st)
        bs.set_cam(x, z, yaw, bob + 0.5 * math.sin(i * 0.4), pitch, i * 0.45)
        frames.append(build(scale))
        print(i + 1, '/', len(seq), flush=True)
    return frames


def cuadros(scale=2):
    """Cuadros clave lado a lado (para revisar sin abrir el GIF)."""
    from PIL import Image
    seq = recorrido()
    keys = [18, 58, 100, 150, 236, len(seq) - 4]
    imgs = render_seq([seq[i] for i in keys], scale)
    w, h = imgs[0].size
    sheet = Image.new('RGB', (w * 2, h * 3))
    for k, im in enumerate(imgs):
        sheet.paste(im, ((k % 2) * w, (k // 2) * h))
    sheet.save(os.path.join(bs.OUT, 'lab-cuadros.png'))


if __name__ == '__main__':
    os.makedirs(bs.OUT, exist_ok=True)
    which = sys.argv[1] if len(sys.argv) > 1 else 'gif'
    if which == 'cuadros':
        cuadros()
    else:
        fr = render_seq(recorrido())
        pal = [f.convert('P', palette=0, colors=140) for f in fr]
        pal[0].save(os.path.join(bs.OUT, 'sala-laboratorio.gif'), save_all=True, append_images=pal[1:], duration=[80] * len(pal), loop=0)
    print('listo')
