"""Sala de entrenamiento (al fondo del pasillo de Aprender): arena circular de piedra con tres estaciones y un gran cristal al centro.
Yunque de ejercicios (la tanda de hoy, mezclada), atril de guías y archivo de pruebas antiguas con reloj de arena (simulacro o práctica).
El cristal del centro crece solo con aciertos sin ayuda: cada acierto suelta un hilo de luz que vuela hacia él.
Usa el motor de build_sotano.py y piezas de build_camara.py con otra geometría.
Salida: docs/aprender-pasillo/sala-entrenamiento.gif (y sala-cuadros.png con los cuadros clave).
Correr: python tools/aprender-pasillo/build_sala.py [gif|cuadros]
"""
import math
import os
import random
import sys

import numpy as np

import build_sotano as bs
import build_camara as bc
from build_sotano import Canvas, glow, BAYER, W, H, F, CX, FLOOR
from build_camara import R, DEP, AW, CW, DOME, PED_R, PED_Y, PR, STAND, Comp, wpt, local, yarch, zpx, mural_tex, ease
from murales import SALA, AW_, AH_

GOLD = '#ffcf70'
ALCOVES = [
    dict(key='ejercicios', ang=0, kind='yunque', lines=['EJERCICIOS'], dep=DEP, mural=(-0.74, 0.74, -1.1, 0.0)),
    dict(key='guias', ang=90, kind='atril', lines=['GUÍAS'], dep=DEP, mural=(-0.74, 0.74, -1.1, 0.0)),
    dict(key='pruebas', ang=-90, kind='archivo', lines=['PRUEBAS', 'ANTIGUAS'], dep=DEP, mural=(-0.55, 0.55, -1.22, -0.45)),
    dict(key='entrada', ang=180, kind='entrada', lines=None, dep=2.6),
]
for _a in ALCOVES:
    _r = math.radians(_a['ang'])
    _a['s'], _a['c'] = math.sin(_r), math.cos(_r)
ST = {a['key']: a for a in ALCOVES}
PILLARS = [math.radians(45 + 90 * k) for k in range(4)]
BAND = ['TANDA DE HOY']                    # grabado en el pedestal, de cara a la entrada
D_YUNQUE, D_ATRIL, D_RELOJ, U_RELOJ = R + 0.3, R + 0.1, R - 0.05, 0.62
SHELF = R + DEP - 0.3                      # frente del estante del archivo
ROWS = [(-0.32, 0.02), (0.1, 0.42)]        # huecos del estante (y de arriba, y de abajo)

# estado animado del cuadro (lo pone render_seq): acierto en el yunque, hoja del libro, arena caída, hilos y crecimiento
STATE = dict(ok=0.0, spark=0.0, page=0.0, sand=0.3, threads=(), grow=0.0)


def lectern_y(dd):
    """Altura de la cubierta inclinada del atril (más alta atrás, de cara a quien llega)."""
    return 0.22 - 0.55 * dd


def box(d, u, Y, d0, u0, hd, hu, y0, y1):
    return np.maximum(np.maximum(np.abs(d - d0) - hd, np.abs(u - u0) - hu), np.maximum(y0 - Y, Y - y1))


def furniture(a, d, u, Y):
    """Mueble de piedra de cada estación (forma parte de la geometría, así recibe la misma luz y sombra que la sala)."""
    k = a['kind']
    if k == 'yunque':
        g = box(d, u, Y, D_YUNQUE, 0, 0.17, 0.24, 0.6, FLOOR + 0.1)
        g = np.minimum(g, box(d, u, Y, D_YUNQUE, 0, 0.08, 0.11, 0.3, 0.62))
        g = np.minimum(g, box(d, u, Y, D_YUNQUE, 0.02, 0.14, 0.36, 0.18, 0.32))
        horn = np.maximum(box(d, u, Y, D_YUNQUE, -0.48, 0.1, 0.13, 0.2, 0.3), np.abs(d - D_YUNQUE) - 0.1 * np.clip((u + 0.62) / 0.26, 0.15, 1))
        return np.minimum(g, horn)
    if k == 'atril':
        g = box(d, u, Y, D_ATRIL, 0, 0.18, 0.2, 0.68, FLOOR + 0.1)
        g = np.minimum(g, box(d, u, Y, D_ATRIL, 0, 0.07, 0.07, 0.2, 0.7))
        ys = lectern_y(d - D_ATRIL)
        return np.minimum(g, np.maximum(np.maximum(np.abs(d - D_ATRIL) - 0.21, np.abs(u) - 0.44), np.abs(Y - ys - 0.035) - 0.035))
    if k == 'archivo':
        g = box(d, u, Y, SHELF + 0.2, 0, 0.2, 0.62, -0.4, FLOOR + 0.1)
        for y0, y1 in ROWS:
            g = np.maximum(g, -box(d, u, Y, SHELF - 0.1, 0, 0.36, 0.55, y0, y1))
        return np.minimum(g, box(d, u, Y, D_RELOJ, U_RELOJ, 0.15, 0.15, 0.38, FLOOR + 0.1))
    return np.full(d.shape, 9.0, np.float32)


def parts(X, Y, Z):
    r = np.hypot(X, Z)
    ceil = CW - DOME * (1 - np.clip(r / R, 0, 1) ** 2)
    room = np.minimum(np.minimum(R - r, FLOOR - Y), Y - ceil)
    alc = []
    fur = np.full(X.shape, 9.0, np.float32)
    for a in ALCOVES:
        d, u = local(a, X, Z)
        alc.append(np.minimum(np.minimum(AW - np.abs(u), R + a['dep'] - d), np.minimum(d - (R - 0.6), np.minimum(FLOOR - Y, Y - yarch(u)))))
        fur = np.minimum(fur, furniture(a, d, u, Y))
    pil = np.full(X.shape, 9.0, np.float32)
    for ph in PILLARS:
        pil = np.minimum(pil, np.hypot(X - R * math.sin(ph), Z - R * math.cos(ph)) - PR)
    ped = np.maximum(r - PED_R, PED_Y - Y)
    return room, alc, pil, ped, fur


def emptiness(X, Y, Z):
    """> 0 en el aire de la sala, < 0 dentro de la roca."""
    room, alc, pil, ped, fur = parts(X, Y, Z)
    g = room
    for ga in alc:
        g = np.maximum(g, ga)
    return np.minimum(np.minimum(g, pil), np.minimum(ped, fur))


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
    for _ in range(int(8.0 / step)):
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
def anvil_top():
    return wpt(ST['ejercicios'], D_YUNQUE, 0.0, 0.17)


def crystal_core():
    return np.array([0, -0.45, 0], np.float32)


def draw_core(comp, glows):
    """El gran cristal en bruto del centro: dos racimos sobre el pedestal; crece con STATE['grow']."""
    g = STATE['grow']
    up, ax, az = bs.camdir((0, -1, 0)), bs.camdir((1, 0, 0)), bs.camdir((0, 0, 1))
    for seed_, off, sz in ((7, (0.0, 0.0), 2.5), (23, (0.14, -0.1), 1.6), (41, (-0.16, 0.08), 1.3)):
        base = bs.to_cam(np.array([off[0], PED_Y - 0.01, off[1]], np.float32))
        bs.draw_crystal(comp, base, up, [ax, az], 'w', 'crystal', glows, random.Random(seed_), 0.8 + 0.2 * g, size=sz * (0.9 + 0.22 * g), bed=False)
    P = bs.to_cam(crystal_core())
    if P[2] > 0.6:
        gx, gy = bs.project(P)
        glows.append((gx, gy, (0.8 + 0.5 * g) * F / P[2], '#9ce8f0', 0.25 + 0.3 * g + 0.25 * STATE.get('pulse', 0)))


def draw_anvil_items(comp, glows, lights):
    """Sobre el yunque, la ficha que se está trabajando: un cristal chico que se enciende al acertar; chispas al golpe."""
    a = ST['ejercicios']
    base = bs.to_cam(anvil_top())
    if base[2] < 0.6:
        return
    ok = STATE['ok']
    bs.draw_crystal(comp, base, bs.camdir((0, -1, 0)), [bs.camdir(wpt(a, 0, 1, 0)), bs.camdir(wpt(a, 1, 0, 0))], 'w', 'crystal',
                    glows, random.Random(3), 0.45 + 0.55 * min(ok * 2, 1), size=0.55, bed=False)
    sp = STATE['spark']
    if sp <= 0:
        return
    ly = Canvas(W, H)
    rg = random.Random(9)
    for k in range(26):
        ang = rg.uniform(0, 2 * math.pi)
        v = np.array([math.cos(ang) * rg.uniform(0.2, 0.7), -rg.uniform(0.5, 1.2), math.sin(ang) * rg.uniform(0.2, 0.7)], np.float32)
        p = anvil_top() + np.array([0, -0.1, 0], np.float32) + v * sp * 0.7 + np.array([0, 1.3 * sp * sp, 0], np.float32)
        P = bs.to_cam(p)
        if P[2] < 0.6:
            continue
        sx, sy = bs.project(P)
        ly.px(sx, sy, 'flame' if k % 3 else 'rune', 5.6 * (1 - sp) + 1.2)
    ly.lock |= ly.mat != 0
    comp.paste(ly, float(base[2]) - 0.3, 0.6)
    glows.append((*bs.project(bs.to_cam(anvil_top())), 0.6 * F / base[2], '#ff9a3c', 0.6 * (1 - sp)))


def quad(ly, pts, mat, lvl):
    P = [bs.to_cam(p) for p in pts]
    if min(p[2] for p in P) < 0.4:
        return
    q = [np.array(bs.project(p)) for p in P]
    bs.tri(ly, q[0], q[1], q[2], mat, lvl)
    bs.tri(ly, q[0], q[2], q[3], mat, lvl)


def draw_book(comp):
    """Libro abierto sobre el atril, con renglones; STATE['page'] (0 a 1) da vuelta una hoja."""
    a = ST['guias']

    def at(dd, u, lift=0.0):
        return wpt(a, D_ATRIL + dd, u, lectern_y(dd) - 0.005 - lift)
    P = bs.to_cam(at(0, 0))
    if P[2] < 0.6:
        return
    ly = Canvas(W, H)
    quad(ly, [at(-0.19, -0.4), at(0.19, -0.4), at(0.19, 0.4), at(-0.19, 0.4)], 'wood', 2.6)
    for s in (-1, 1):
        quad(ly, [at(-0.17, s * 0.01, 0.01), at(0.17, s * 0.01, 0.01), at(0.17, s * 0.37, 0.01), at(-0.17, s * 0.37, 0.01)], 'paper', 4.4 if s > 0 else 3.6)
        for k in range(6):
            dd = -0.12 + 0.048 * k
            A, B = bs.to_cam(at(dd, s * 0.06, 0.015)), bs.to_cam(at(dd, s * (0.32 - 0.08 * (k % 3 == 2)), 0.015))
            (ax, ay), (bx, by) = bs.project(A), bs.project(B)
            ly.line(ax, ay, bx, by, 'paper', 1.6)
    th = math.pi * STATE['page']
    if 0 < STATE['page'] < 1:
        ex, ey = 0.36 * math.cos(th), 0.36 * math.sin(th)
        quad(ly, [at(-0.17, 0.0, 0.02), at(0.17, 0.0, 0.02), at(0.17, ex, 0.02 + ey), at(-0.17, ex, 0.02 + ey)], 'paper', 5.2)
    ly.lock |= ly.mat != 0
    comp.paste(ly, float(P[2]), 0.25)


def draw_scrolls(comp, lights):
    """Pruebas antiguas enrolladas en el estante, cada una con su sello de cera."""
    a = ST['pruebas']
    for (y0, y1) in ROWS:
        for j in range(11):
            u = -0.48 + 0.096 * j
            P = bs.to_cam(wpt(a, SHELF + 0.12, u, y1))
            if P[2] < 0.6:
                continue
            ly = Canvas(W, H)
            h = 0.22 + 0.06 * ((j * 7) % 3) / 2
            bs.cylinder_px(ly, P, 0.036, h, 'paper', 2.4, lights, spec=0.8)
            if j % 3 != 1:
                bs.sphere_px(ly, bs.to_cam(wpt(a, SHELF + 0.08, u, y1 - h * 0.55)), 0.025, 'red', 3.4, lights, spec=1.4, rim=0.4)
            ly.lock |= ly.mat != 0
            comp.paste(ly, float(P[2]), 0.25)


def draw_hourglass(comp, glows, lights):
    """Reloj de arena grande sobre su base: STATE['sand'] es la fracción que ya cayó."""
    a = ST['pruebas']
    s = STATE['sand']

    def at(y):
        return bs.to_cam(wpt(a, D_RELOJ, U_RELOJ, y))
    P = at(0.38)
    if P[2] < 0.6:
        return
    ly = Canvas(W, H)
    for y in (0.38, -0.44):
        bs.cylinder_px(ly, at(y), 0.19, 0.06, 'brass', 2.6, lights, spec=2.0)
    for du in (-0.16, 0.16):
        A, B = bs.to_cam(wpt(a, D_RELOJ - 0.06, U_RELOJ + du, 0.32)), bs.to_cam(wpt(a, D_RELOJ - 0.06, U_RELOJ + du, -0.44))
        (ax, ay), (bx, by) = bs.project(A), bs.project(B)
        ly.line(ax, ay, bx, by, 'brass', 3.4)
        ly.line(ax + 1, ay, bx + 1, by, 'brass', 2.0)
    lo, hi = at(0.16), at(-0.23)
    bs.sphere_px(ly, lo, 0.16, 'glass', 2.4, lights, spec=1.6, rim=0.9)
    bs.sphere_px(ly, hi, 0.16, 'glass', 2.4, lights, spec=1.6, rim=0.9)
    bs.sphere_px(ly, lo, 0.15, 'rune', 3.6, lights, spec=0.6, rim=0.6, only=lambda dx, dy: dy > 1 - 1.4 * s)
    bs.sphere_px(ly, hi, 0.15, 'rune', 3.6, lights, spec=0.6, rim=0.6, only=lambda dx, dy: dy > 1 - 1.4 * (1 - s))
    if 0 < s < 1:
        (nx, ny), (bx, by) = bs.project(at(-0.04)), bs.project(at(0.3 - 0.2 * s))
        ly.line(nx, ny, bx, by, 'rune', 5.4)
    for c_ in (lo, hi):
        sx, sy = bs.project(c_)
        rp = 0.16 * F / c_[2]
        ly.px(sx - rp * 0.45, sy - rp * 0.5, 'petal', 4.0)
    ly.lock |= ly.mat != 0
    comp.paste(ly, float(P[2]), 0.3)
    gx, gy = bs.project(lo)
    glows.append((gx, gy, 0.35 * F / lo[2], GOLD, 0.25))


def draw_threads(c, zb, glows):
    """Hilos de luz: de la estación donde acertaste al cristal del centro (cola que se desvanece)."""
    for src, prog in STATE['threads']:
        if prog <= 0 or prog >= 1.15:
            continue
        P0, P3 = src, crystal_core()
        P1 = P0 + np.array([0, -0.9, 0], np.float32)
        P2 = P3 + np.array([0, -1.0, 0], np.float32)
        head = None
        for k in range(40):
            q = prog - 0.3 * k / 40
            if q < 0 or q > 1:
                continue
            p = bs.to_cam(bc.bez(P0, P1, P2, P3, q))
            if p[2] < 0.5:
                continue
            sx, sy = bs.project(p)
            lv = 7.2 - 4.5 * k / 40
            zpx(c, zb, sx, sy, p[2], 'crystal', lv, 0.4)
            zpx(c, zb, sx + 1, sy, p[2], 'crystal', lv - 1.5, 0.4)
            if head is None:
                head = (sx, sy, p[2])
        if head:
            glows.append((head[0], head[1], 6 + 0.25 * F / head[2], '#e0fcff', 0.6))


# ---------- cuadro ----------
def build(scale=3):
    Pw, t, Plo = march()
    X, Y, Z = Pw[..., 0], Pw[..., 1], Pw[..., 2]
    yy, xx = np.mgrid[0:H, 0:W]
    N = normals(Pw)
    room, alc, pil, ped, fur = parts(Plo[..., 0], Plo[..., 1], Plo[..., 2])
    region = np.argmax(np.stack([room] + alc), axis=0)
    _, _, pil_h, ped_h, fur_h = parts(X, Y, Z)
    is_pil = pil_h < 0.02
    is_ped = (ped_h < 0.02) & ~is_pil
    is_fur = (fur_h < 0.02) & ~is_pil & ~is_ped
    r = np.hypot(X, Z)
    th = np.arctan2(X, Z)
    floor = N[..., 1] < -0.7
    ceil = N[..., 1] > 0.45
    wall = ~floor & ~ceil

    # ----- luces: el cristal (frío, crece) y la forja de cada estación (cálida) -----
    cold = np.zeros((H, W), np.float32)
    warm = np.zeros((H, W), np.float32)

    def add(lpos, inten, acc):
        Lv = np.array(lpos, np.float32)[None, None, :] - Pw
        d2 = (Lv ** 2).sum(-1) + 1e-4
        nd = np.clip((Lv * N).sum(-1) / np.sqrt(d2), 0, 1)
        acc += inten * (0.25 + 0.75 * nd) / (d2 + 0.35)
    g = STATE['grow']
    add((0, -0.6, 0), 1.6 + 1.2 * g + 1.0 * STATE.get('pulse', 0), cold)
    add((0, -1.6, 0), 0.8 + 0.6 * g, cold)
    fl = 1.0 + 0.15 * math.sin(bs.TIME * 6.3) + 0.1 * math.sin(bs.TIME * 11.1)
    add(wpt(ST['ejercicios'], D_YUNQUE - 0.35, 0, -0.1), (1.5 + 2.5 * (1 - STATE['spark'] if STATE['spark'] > 0 else 0)) * fl, warm)
    for key in ('ejercicios', 'guias', 'pruebas'):
        add(wpt(ST[key], R + DEP - 0.55, 0, -0.55), 1.2, warm)
    add(wpt(ST['entrada'], R + 1.6, 0, -0.4), 0.5, cold)
    for ph in PILLARS:
        add(((R - 0.5) * math.sin(ph), -0.6, (R - 0.5) * math.cos(ph)), 0.9, warm)

    lum = 0.03 + 0.8 * (1 - np.exp(-(warm * 0.8 + cold * 0.8) * 0.8))
    g1 = emptiness(*(Pw + N * 0.12).transpose(2, 0, 1))
    g2 = emptiness(*(Pw + N * 0.32).transpose(2, 0, 1))
    ao = np.clip(1 - 1.6 * (np.clip(0.12 - g1, 0, None) + 0.5 * np.clip(0.32 - g2, 0, None)), 0.3, 1)
    lum = lum * (0.45 + 0.55 * ao) * np.clip(1.1 - t * 0.06, 0.25, 1)
    lum = np.clip(lum, 0, 1.6) ** bs.STYLE['gamma']

    # ----- textura de piedra -----
    lu = np.zeros((H, W), np.float32)
    ld = np.zeros((H, W), np.float32)
    for k, a in enumerate(ALCOVES):
        d_, u_ = local(a, X, Z)
        sel = (region == k + 1) | (is_fur & (d_ > R - 0.3) & (np.abs(u_) < AW + 0.1))
        ld = np.where(sel, d_, ld)
        lu = np.where(sel, u_, lu)
    in_alc = (region > 0) | is_fur
    side_w = in_alc & wall & (np.abs(lu) > AW - 0.03)
    ph_ = np.zeros((H, W), np.float32)
    for ph in PILLARS:
        px_, pz_ = R * math.sin(ph), R * math.cos(ph)
        near = np.hypot(X - px_, Z - pz_) < PR + 0.05
        ph_ = np.where(near, np.arctan2(X - px_, Z - pz_), ph_)
    u = np.where(floor | ceil, np.where(in_alc, lu, th * np.maximum(r, 0.4)),
                 np.where(is_pil, ph_ * PR * 2.2, np.where(is_ped, th * PED_R, np.where(in_alc, np.where(side_w, ld, lu), th * R))))
    v = np.where(floor | ceil, np.where(in_alc, ld, r), Y + 3.0)
    rowh = np.where(floor | ceil, 0.6, 0.34).astype(np.float32)
    tex = bs.stone_tex(u, v, rowh, t)
    lvl = lum * 5.4 + tex * 0.75 * np.clip(lum * 2 + 0.25, 0, 1)

    c = Canvas(W, H)
    c.dither = {k_: bs.STYLE['dither'] for k_ in ('crypt', 'stone', 'wood', 'wall')}
    c.mat[:] = c.mid('crypt')
    c.lvl[:] = np.clip(lvl, 0, 8).astype(np.float32)
    glows = []

    rib = ceil & ~in_alc & (np.min(np.stack([np.abs(np.angle(np.exp(1j * (th - ph)))) for ph in PILLARS]), 0) * r < 0.1)
    c.mask(rib, 'crypt', np.clip(lum * 5.4 + 1.2, 0, 7).astype(np.float32))
    nz_ = np.sin(u * 5.1 + v * 3.7) * np.sin(u * 2.9 - v * 6.3)
    moss = ((wall & (Y > 0.3)) | (floor & (ao < 0.8))) & (nz_ > 0.45) & ~is_ped & ~is_fur
    c.mask(moss, 'shade', np.clip(lum * 2.4 + 2.2, 1, 5).astype(np.float32))
    c.mask(moss & (bs.hash2(xx * 1.0, yy * 1.0) > 0.82), 'sprout', 3.4)
    tt = (Y - 0.5) / 0.045
    pipe = wall & ~in_alc & ~is_pil & ~is_ped & (np.abs(tt) < 1)
    c.mask(pipe, 'brass', np.clip(0.6 + lum * 1.4 + 2.2 * np.sqrt(np.clip(1 - tt ** 2, 0, 1)) - 0.7 * tt, 0.6, 4.4).astype(np.float32))

    # muebles: piedra oscura y pulida (el yunque, casi negro, con canto de luz)
    for k, a in enumerate(ALCOVES):
        d_, u_ = local(a, X, Z)
        mine = is_fur & (d_ > R - 0.3) & (np.abs(u_) < AW + 0.1)
        if a['kind'] == 'yunque':
            c.mask(mine, 'crypt', np.clip(lum * 4.6 + 0.4, 0.4, 5).astype(np.float32))
            c.mask(mine & floor & (Y < 0.2), 'crypt', np.clip(lum * 5 + 2.4, 2, 6.4).astype(np.float32))
            c.mask(mine & wall & (np.abs(Y - 0.19) < 0.02), 'rune', 3.2 + 1.4 * STATE['ok'])
        elif a['kind'] == 'archivo':
            c.mask(mine & wall & (np.abs(d_ - SHELF) < 0.03) & (Y > -0.42), 'wood', np.clip(lum * 4 + 1.6, 1, 5).astype(np.float32))
            c.mask(mine & (d_ > SHELF + 0.02) & (d_ < SHELF + 0.36) & ~floor, 'crypt', np.clip(lum * 2 + 0.6, 0.4, 2.6).astype(np.float32))
        c.lock |= mine & (a['kind'] == 'yunque')

    # pedestal del cristal: canto superior y "TANDA DE HOY" grabado
    pside = is_ped & wall
    c.mask(is_ped & floor, 'stone', np.clip(lum * 3 + 1.0, 0.6, 4).astype(np.float32))
    c.mask(pside & (Y < PED_Y + 0.04), 'stone', np.clip(lum * 4 + 2.6, 2, 6).astype(np.float32))
    band = pside & (Y > 0.42) & (Y < 0.62)
    half = 0.66
    ua = PED_R * np.angle(np.exp(1j * (math.pi - th)))
    tex_c = bs.sign_texture(BAND, 168, 16)
    pu = np.clip(((ua + half) / (2 * half) * 168).astype(int), 0, 167)
    pv = np.clip(((Y - 0.42) / 0.2 * 16).astype(int), 0, 15)
    code = tex_c[pv, pu]
    band = band & (np.abs(ua) < half)
    slab = np.clip(lum * 3.0 + 2.6, 2.2, 5.4).astype(np.float32)
    c.mask(band, 'stone', slab)
    c.mask(band & (code == 1), 'stone', slab + 1.3)
    c.mask(band & (code == 8), 'stone', np.clip(slab - 2.2, 0.6, 4))
    c.mask(band & (code == 7), 'stone', slab + 1.6)
    c.mask(band & (code == 2), 'crystal', 4.8 + 1.0 * bs.PULSE)
    c.mask(band & (code == 6), 'crystal', 2.4)
    c.lock |= band & ((code == 2) | (code == 6))

    # ----- estaciones: arco con incrustación dorada, letrero y mural -----
    room_wall = wall & (region == 0) & ~is_pil & ~is_ped
    for k, a in enumerate(ALCOVES):
        d_, u_ = local(a, X, Z)
        front = d_ > 0
        mine = region == k + 1
        frame = room_wall & front & (np.abs(u_) < AW + 0.13) & (Y > -0.55 - 0.97 * np.sqrt(np.clip(1 - (u_ / (AW + 0.13)) ** 2, 0, None)) - 0.02)
        c.mask(frame, 'stone', np.clip(lum * 4 + 3.0, 2.6, 6).astype(np.float32))
        c.mask(frame & ((np.floor(np.arctan2(Y + 0.55, u_) * 5.5) % 2) == 0), 'stone', np.clip(lum * 4 + 2.2, 2, 5.4).astype(np.float32))
        c.lock |= frame
        if a['kind'] == 'entrada':
            continue
        inl = frame & (np.abs(np.hypot(u_ / (AW + 0.04), np.clip(-(Y + 0.55), 0, None) / 0.89) - 1) < 0.035)
        c.mask(inl, 'rune', 2.8 + 0.6 * bs.PULSE)
        plate = room_wall & front & (np.abs(u_) < 0.95) & (Y > -1.77) & (Y < -1.47)
        pu = np.clip(((u_ + 0.95) / 1.9 * bs.SIGN_W).astype(int), 0, bs.SIGN_W - 1)
        pv = np.clip(((Y + 1.77) / 0.3 * bs.SIGN_H).astype(int), 0, bs.SIGN_H - 1)
        code = bs.sign_texture(a['lines'])[pv, pu]
        slab = np.clip(lum * 3.0 + 3.0, 2.4, 5.6).astype(np.float32)
        c.mask(plate, 'stone', slab)
        c.mask(plate & (code == 1), 'stone', slab + 1.3)
        c.mask(plate & (code == 8), 'stone', np.clip(slab - 2.2, 0.6, 4))
        c.mask(plate & (code == 7), 'stone', slab + 1.6)
        c.mask(plate & (code == 2), 'rune', 4.6 + 1.0 * bs.PULSE)
        c.mask(plate & (code == 6), 'rune', 2.4)
        c.lock |= plate & ((code == 2) | (code == 6))
        mu0, mu1, my0, my1 = a['mural']
        back = mine & wall & (d_ > R + DEP - 0.03)
        pm = back & (u_ > mu0) & (u_ < mu1) & (Y > my0) & (Y < my1)
        if pm.any():
            edge = np.minimum(np.minimum(u_ - mu0, mu1 - u_), np.minimum(Y - my0, my1 - Y))
            rim_l = pm & (edge < 0.04) & (((u_ - mu0) < 0.04) | ((Y - my0) < 0.04))
            c.mask(rim_l, 'stone', np.clip(lum * 3 + 3.8, 3, 6).astype(np.float32))
            c.mask(pm & (edge < 0.04) & ~rim_l, 'stone', 1.2)
            inner = pm & (edge >= 0.04)
            tx = np.clip(((u_ - mu0 - 0.04) / (mu1 - mu0 - 0.08) * AW_).astype(int), 0, AW_ - 1)
            ty = np.clip(((Y - my0 - 0.04) / (my1 - my0 - 0.08) * AH_).astype(int), 0, AH_ - 1)
            m = SALA[a['key']](bs.TIME, STATE['ok']) if a['key'] == 'ejercicios' else SALA[a['key']](bs.TIME)
            mc = mural_tex(m, pm)[ty, tx]
            c.mask(inner, 'crypt', np.clip(lum * 1.2 + 1.0, 0.6, 2.4).astype(np.float32))
            for cd, (mat_, lv_) in bs.mural_colors(bs.THEMES['organica']).items():
                mk = inner & (mc == cd)
                c.mask(mk, mat_, lv_)
                c.lock |= mk
        mouth = bs.to_cam(wpt(a, R, 0, -0.4))
        if mouth[2] > 0.8:
            gx_, gy_ = bs.project(mouth)
            glows.append((gx_, gy_, 1.0 * F / mouth[2], GOLD, 0.12))

    # ----- objetos de lejos a cerca -----
    zb = t.copy()
    comp = Comp(c, zb)
    obj_lights = [(bs.to_cam(np.array([0, -0.6, 0], np.float32)), 1.6 + g)]
    obj_lights += [(bs.to_cam(wpt(ST[k_], R + DEP - 0.55, 0, -0.55)), 1.6) for k_ in ('ejercicios', 'guias', 'pruebas')]
    items = [(float(bs.to_cam(np.zeros(3, np.float32))[2]), 'core'),
             (float(bs.to_cam(anvil_top())[2]), 'anvil'),
             (float(bs.to_cam(wpt(ST['guias'], D_ATRIL, 0, -0.1))[2]), 'book'),
             (float(bs.to_cam(wpt(ST['pruebas'], SHELF + 0.12, 0, 0))[2]), 'scrolls'),
             (float(bs.to_cam(wpt(ST['pruebas'], D_RELOJ, U_RELOJ, 0))[2]), 'reloj')]
    items += [(float(bs.to_cam(np.array([R * math.sin(ph), 0, R * math.cos(ph)], np.float32))[2]), ph) for ph in PILLARS]
    for zc_, it in sorted(items, key=lambda it: -it[0]):
        if zc_ < 0.5:
            continue
        if it == 'core':
            draw_core(comp, glows)
        elif it == 'anvil':
            draw_anvil_items(comp, glows, obj_lights)
        elif it == 'book':
            draw_book(comp)
        elif it == 'scrolls':
            draw_scrolls(comp, obj_lights)
        elif it == 'reloj':
            draw_hourglass(comp, glows, obj_lights)
        else:
            bc.draw_torch(comp, it, glows)
    draw_threads(c, zb, glows)
    bc.draw_motes(c, zb)

    # ----- luz de color, neblina (espesa hacia el pasillo de entrada) y halos -----
    cold_q = 1 - np.exp(-cold * 1.1)
    warm_q = 1 - np.exp(-warm * 1.1)
    bay = BAYER[yy % 4, xx % 4] + 0.47
    nz1 = 0.5 + 0.5 * np.sin(X * 2.0 + bs.TIME * 0.5) * np.sin(Z * 1.3 - bs.TIME * 0.4)
    nz2 = 0.5 + 0.5 * np.sin(X * 3.1 - bs.TIME * 0.7 + Z * 0.8) * np.sin(Z * 2.2 + bs.TIME * 0.3)
    far = np.clip((t - 1.2) * 0.05, 0, 0.45) * (0.55 + 0.45 * nz1)
    low = 0.28 * np.exp(-np.clip(FLOOR - Y, 0, 5) / 0.22) * (0.4 + 0.6 * nz2)
    d_e, _ = local(ST['entrada'], X, Z)
    veil = np.where(region == len(ALCOVES), np.clip((d_e - R - 0.4) * 0.35, 0, 0.6), 0)
    fog_f = np.clip((far + low) * bs.STYLE['fog'] + veil, 0, 0.75).astype(np.float32)

    def post(arr):
        for f_, col, k in ((cold_q, (60, 190, 170), 0.2 * bs.STYLE['coldk']), (warm_q, (255, 170, 80), 0.28 * bs.STYLE['warmk'])):
            q = np.floor(f_ * 4 + bay * 0.6) / 4
            arr += q[..., None] * np.array(col, np.float32)[None, None, :] * k
        arr[...] = arr * (1 - fog_f[..., None]) + np.array([46, 96, 92], np.float32)[None, None, :] * fog_f[..., None]
        for (gx, gy, rad, col, s_) in glows:
            glow(arr, gx, gy, rad, col, s_ * bs.STYLE['glow'], 4)
        arr[...] = 255.0 * (np.clip(arr, 0, 255) / 255.0) ** bs.STYLE['tone']
    return c.render(scale, post)


# ---------- recorrido ----------
def orbit(phi_deg):
    p = math.radians(phi_deg)
    return STAND * math.sin(p), STAND * math.cos(p), p


def recorrido():
    """Por cuadro: cámara (x, z, giro, balanceo, inclinación) y estado de la animación."""
    LOOK = 0.12
    seq = []

    def put(x, z, yaw, bob, pitch, **st):
        seq.append(((x, z, yaw, bob, pitch), st))
    z0, zc = -(R + 1.5), -1.75
    for i in range(1, 15):                                   # llega por el pasillo: el cristal al frente, "TANDA DE HOY" en el pedestal
        u = ease(i / 14)
        put(0, z0 + (zc - z0) * u, 0, 1.4 * abs(math.sin(math.pi * 2 * i / 14)), 0.02)
    for _ in range(8):
        put(0, zc, 0, 0, 0.02)
    n = 22                                                   # rodea el cristal hasta quedar frente al yunque
    for i in range(1, n + 1):
        u = ease(i / n)
        x = 1.25 * math.sin(math.pi * u) ** 0.8
        z = zc + (STAND - zc) * u
        yaw = math.atan2(0 - x, R + DEP - z) * (1 - u)
        put(x, z, yaw, 1.4 * abs(math.sin(math.pi * 3 * i / n)), 0.02 + (LOOK - 0.02) * u)
    for _ in range(6):
        put(0, STAND, 0, 0, LOOK)

    def station(phi, near, frames, look, **fixed):
        """Un toque: se acerca a la estación, se queda `frames` cuadros (estado por cuadro) y vuelve al centro."""
        p = math.radians(phi)
        for i in range(1, 9):
            u = ease(i / 8)
            rad = STAND + (near - STAND) * u
            put(rad * math.sin(p), rad * math.cos(p), p, 1.2 * math.sin(math.pi * u), LOOK + (look - LOOK) * u, **fixed)
        for i in range(frames):
            put(near * math.sin(p), near * math.cos(p), p, 0, look, **{**fixed, **frame_state(phi, i)})
        for i in range(1, 9):
            u = ease(i / 8)
            rad = near + (STAND - near) * u
            put(rad * math.sin(p), rad * math.cos(p), p, 1.2 * math.sin(math.pi * u), look + (LOOK - look) * u,
                **{**fixed, **frame_state(phi, frames - 1), 'ok': 1.0, 'spark': 0.0, 'threads': ()})

    def frame_state(phi, i):
        if phi == 0:
            return dict(ok=min(i / 8, 1.0), spark=(i - 6) / 8 if 6 <= i < 14 else 0.0,
                        threads=((anvil_top(), (i - 8) / 12),) if i >= 8 else ())
        if phi == 90:
            return dict(page=ease((i - 5) / 9) if i >= 5 else 0.0)
        return dict(sand=0.3 + 0.03 * i)
    station(0, R - 0.75, 22, LOOK - 0.1)
    for i in range(1, 15):                                   # gira al atril de guías
        x, z, p = orbit(90 * ease(i / 14))
        put(x, z, p, 0.8 * math.sin(math.pi * i / 14), LOOK, ok=1.0)
    station(90, R - 1.0, 18, -0.04, ok=1.0)
    for i in range(1, 25):                                   # media vuelta hasta el archivo de pruebas antiguas
        x, z, p = orbit(90 - 180 * ease(i / 24))
        put(x, z, p, 0.8 * math.sin(math.pi * i / 24), LOOK, ok=1.0)
    station(-90, R - 1.0, 20, LOOK - 0.04, ok=1.0)
    n = 20                                                   # se aleja y se da vuelta hacia el cristal
    for i in range(1, n + 1):
        u = ease(i / n)
        phi = math.radians(-90 - 90 * u)
        rad = STAND + (abs(zc) - STAND) * u
        put(rad * math.sin(phi), rad * math.cos(phi), math.radians(-90 + 90 * u), 1.2 * abs(math.sin(math.pi * 2 * i / n)),
            LOOK + (0.14 - LOOK) * u, ok=1.0, sand=0.9)
    srcs = [anvil_top(), wpt(ST['guias'], D_ATRIL, 0, -0.2), wpt(ST['pruebas'], D_RELOJ, U_RELOJ, -0.1)]
    for i in range(34):                                      # tres hilos de luz llegan y el cristal crece
        thr = tuple((s_, (i - 2 * j) / 14) for j, s_ in enumerate(srcs))
        grow = ease((i - 16) / 10)
        pulse = max(0.0, 1 - abs(i - 18) / 6)
        put(0, zc, 0, 0, 0.14, ok=1.0, sand=0.9, threads=thr, grow=grow, pulse=pulse)
    return seq


def render_seq(seq, scale=3):
    frames = []
    for i, (cam, st) in enumerate(seq):
        x, z, yaw, bob, pitch = cam
        STATE.update(ok=0.0, spark=0.0, page=0.0, sand=0.3, threads=(), grow=0.0, pulse=0.0)
        STATE.update(st)
        bs.set_cam(x, z, yaw, bob + 0.5 * math.sin(i * 0.4), pitch, i * 0.45)
        frames.append(build(scale))
        print(i + 1, '/', len(seq), flush=True)
    return frames


def cuadros(scale=2):
    """Cuadros clave lado a lado (para revisar sin abrir el GIF)."""
    from PIL import Image
    seq = recorrido()
    keys = [18, 66, 76, 120, 178, len(seq) - 6]
    imgs = render_seq([seq[i] for i in keys], scale)
    w, h = imgs[0].size
    sheet = Image.new('RGB', (w * 2, h * 3))
    for k, im in enumerate(imgs):
        sheet.paste(im, ((k % 2) * w, (k // 2) * h))
    sheet.save(os.path.join(bs.OUT, 'sala-cuadros.png'))


if __name__ == '__main__':
    os.makedirs(bs.OUT, exist_ok=True)
    which = sys.argv[1] if len(sys.argv) > 1 else 'gif'
    if which == 'cuadros':
        cuadros()
    else:
        fr = render_seq(recorrido())
        pal = [f.convert('P', palette=0, colors=140) for f in fr]
        pal[0].save(os.path.join(bs.OUT, 'sala-entrenamiento.gif'), save_all=True, append_images=pal[1:], duration=[80] * len(pal), loop=0)
    print('listo')
