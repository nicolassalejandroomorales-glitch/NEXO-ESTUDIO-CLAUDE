"""Boceto de la Mesa del alquimista (Taller de Orgánica II): ejercicios que se resuelven manipulando objetos.

Ejercicio del GIF: "Lleva el H+ con la pinza a la base más fuerte". La pinza lo acerca a la anilina (su par libre
está repartido en el anillo: el H+ rebota), luego a la metilamina (el par libre lo atrapa: se forma el enlace N-H,
se enciende el pozo y se llena un frasco de misión en el estante).
Correr: python tools/salas-sotano/mesa.py  ->  docs/salas-sotano/mesa.png y mesa.gif
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw

import comun as cm
from comun import H, W, pixel

EYE = (0.0, 1.8, -0.6)
TOP = 0.95                     # altura de la cubierta de la mesa
TX, TZ0, TZ1 = 1.15, -0.25, 1.35
WALLZ = 2.0
SHELF_Y, SHELF_Z = 1.12, 1.78
W1 = np.array([-0.45, 0.0, 0.62], np.float32)    # pozo de la metilamina
W2 = np.array([0.45, 0.0, 0.62], np.float32)     # pozo de la anilina
AY = TOP + 0.10                                   # altura de los átomos
SP = os.environ.get('NEXO_SPRITES', '/tmp/claude-0/-home-claude/622bf8d6-11a2-5daf-a7a2-565848ea4c82/scratchpad')
HANDLE = np.array([0.95, 1.62, -0.62], np.float32)
CANDLES = [(-0.98, 1.16, 0.22), (-0.86, 1.25, 0.15), (-1.06, 1.27, 0.11)]
JARS = 8


def v3(x, y, z):
    return np.array([x, y, z], np.float32)


def ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def lerp(a, b, u):
    return a + (b - a) * u


# ---------------- moléculas ----------------
NMET = W1 + v3(0.03, AY, -0.03)
CMET = W1 + v3(-0.11, AY, 0.04)
RING_C = W2 + v3(0.0, AY - 0.02, 0.06)
NANI = RING_C + v3(0.0, 0.0, -0.21)


def molecules(bond):
    """Esferas (centro, radio, material, nivel base). bond: avance del enlace N-H nuevo (0..1)."""
    S = []
    S.append((CMET, 0.058, 'stone', 1.6))
    for d in ((-0.08, 0.03, 0.05), (-0.03, 0.07, 0.06), (-0.04, 0.0, -0.08)):
        S.append((CMET + v3(*d), 0.032, 'petal', 1.6))
        S += beads(CMET, CMET + v3(*d), 0.012, 'wax', 1.6)
    S.append((NMET, 0.06, 'blue', 2.2))
    S += beads(CMET, NMET, 0.014, 'wax', 1.6)
    for d in ((0.08, -0.01, -0.05), (0.06, 0.0, 0.07)):
        S.append((NMET + v3(*d), 0.032, 'petal', 1.6))
        S += beads(NMET, NMET + v3(*d), 0.012, 'wax', 1.6)
    # anilina: anillo de 6 C (con sus H) y el NH2
    ring = [RING_C + v3(0.11 * math.cos(math.radians(90 + 60 * k)), 0.0, -0.11 * math.sin(math.radians(90 + 60 * k))) for k in range(6)]
    for k, p in enumerate(ring):
        S.append((p, 0.045, 'stone', 1.6))
        S += beads(p, ring[(k + 1) % 6], 0.013, 'wax', 1.6)
        if k != 3:
            out = RING_C + (p - RING_C) * 1.75
            S.append((out, 0.026, 'petal', 1.6))
            S += beads(p, out, 0.01, 'wax', 1.6)
    S.append((NANI, 0.055, 'blue', 2.2))
    S += beads(ring[3], NANI, 0.013, 'wax', 1.6)
    for d in ((-0.07, 0.0, -0.05), (0.07, 0.0, -0.05)):
        S.append((NANI + v3(*d), 0.028, 'petal', 1.6))
        S += beads(NANI, NANI + v3(*d), 0.01, 'wax', 1.6)
    if bond > 0:
        top = NMET + v3(0, 0.1, 0)
        S += beads(NMET, NMET + (top - NMET) * bond, 0.014, 'sprout', 4.0)
    return S, ring


def beads(a, b, r, mat, lvl, step=None):
    step = step or r * 0.8
    n = max(2, int(np.linalg.norm(b - a) / step))
    return [(a + (b - a) * (i / n), r, mat, lvl) for i in range(n + 1)]


# ---------------- estado de la animación ----------------
def state(j, n):
    """Avance del ejercicio en el cuadro j de n."""
    u = j / (n - 1)
    S0 = v3(0.62, 1.32, 0.05)
    PA = NANI + v3(0, 0.12, 0)
    PB = NANI + v3(0.18, 0.24, -0.08)
    PM = NMET + v3(0, 0.17, 0)
    PC = NMET + v3(0, 0.1, 0)
    st = dict(rebound=0.0, bond=0.0, grip=1.0, jar=0.0, result=0.0, hint=0.0, tongs=1.0)
    if u < 0.2:
        h = lerp(S0, PA, ease(u / 0.2))
    elif u < 0.32:
        k = (u - 0.2) / 0.12
        st['rebound'] = math.sin(math.pi * k)
        h = lerp(PA, PB, ease(k)) + v3(0, 0.02 * math.sin(k * 25), 0)
        st['hint'] = 1.0
    elif u < 0.52:
        h = lerp(PB, PM, ease((u - 0.32) / 0.2))
        st['hint'] = 1.0
    elif u < 0.6:
        h = lerp(PM, PC, ease((u - 0.52) / 0.08))
    else:
        h = PC
        st['bond'] = ease((u - 0.6) / 0.06)
        st['grip'] = 1 - ease((u - 0.64) / 0.05)
        st['tongs'] = 1 - ease((u - 0.68) / 0.12)
        st['jar'] = ease((u - 0.7) / 0.15)
        st['result'] = ease((u - 0.72) / 0.08)
    st['h'] = h
    st['flash'] = max(0.0, 1 - abs(u - 0.62) / 0.05) if u > 0.57 else 0.0
    return st


# ---------------- textura grabada de la mesa (en x, z) ----------------
TD = 200.0
TX0, TZ_0 = -TX, TZ0
TEX = np.zeros((int((TZ1 - TZ0) * TD), int(2 * TX * TD)), np.uint8)
for txt, w in (('METILAMINA', W1), ('ANILINA', W2)):
    m = cm.text_mask(txt, 2)
    cm.stamp(TEX, m, (w[0] - TX0) * TD - m.shape[1] / 2, TEX.shape[0] - (w[2] - 0.345 - TZ0) * TD, 1)


def trace(cam):
    D = cam.rays()
    E = cam.E
    INF = np.float32(1e9)
    best = np.full((H, W), INF, np.float32)
    reg = np.zeros((H, W), np.int8)

    def plane(axis, val, cond, rid):
        dd = D[..., axis]
        t = np.where(np.abs(dd) > 1e-5, (val - E[axis]) / np.where(np.abs(dd) > 1e-5, dd, 1), INF)
        P = E + D * t[..., None]
        ok = (t > 0) & cond(P)
        t = np.where(ok, t, INF)
        upd = t < best
        best[upd] = t[upd]
        reg[upd] = rid

    plane(1, 0.0, lambda P: np.ones(P.shape[:2], bool), 2)
    plane(2, WALLZ, lambda P: P[..., 1] > -1, 1)
    plane(1, TOP, lambda P: (np.abs(P[..., 0]) < TX) & (P[..., 2] > TZ0) & (P[..., 2] < TZ1), 3)
    plane(2, TZ0, lambda P: (np.abs(P[..., 0]) < TX) & (P[..., 1] < TOP) & (P[..., 1] > TOP - 0.13), 4)
    plane(1, SHELF_Y, lambda P: (np.abs(P[..., 0]) < 1.5) & (P[..., 2] > SHELF_Z) & (P[..., 2] < WALLZ), 6)
    plane(2, SHELF_Z, lambda P: (np.abs(P[..., 0]) < 1.5) & (P[..., 1] < SHELF_Y) & (P[..., 1] > SHELF_Y - 0.07), 7)
    return D, best, reg


def spheres(c, cam, D, best, S, lights, key):
    """Dibuja esferas con prueba de profundidad, solo dentro de su recuadro en pantalla."""
    E = cam.E
    order = sorted(S, key=lambda s: -float(np.linalg.norm(s[0] - E)))
    for ctr, rad, mat, lvl in order:
        x, y, z = cam.project(ctr)
        if z < 0.05:
            continue
        rp = rad * cam.f / z * 1.3 + 2
        x0, x1 = int(max(0, x - rp)), int(min(W, x + rp + 1))
        y0, y1 = int(max(0, y - rp)), int(min(H, y + rp + 1))
        if x1 <= x0 or y1 <= y0:
            continue
        d = D[y0:y1, x0:x1]
        o = E - ctr
        b = (d * o).sum(-1)
        cc = (o * o).sum() - rad * rad
        disc = b * b - cc
        t = -b - np.sqrt(np.maximum(disc, 0))
        hit = (disc > 0) & (t > 0) & (t < best[y0:y1, x0:x1])
        if not hit.any():
            continue
        P = E + d * t[..., None]
        N = (P - ctr) / rad
        lam = np.clip((N * key).sum(-1), 0, 1)
        Lf = cm.point_light(P, N, lights)
        hv = key - d
        hv /= np.linalg.norm(hv, axis=-1, keepdims=True)
        spec = (N * hv).sum(-1) > 0.93
        lv = lvl + lam * 1.8 + np.minimum(Lf, 3.0) * 0.8 + np.where(spec, 1.6, 0) - 0.6 * (1 - np.clip(-(N * d).sum(-1), 0, 1))
        sub_m = c.mat[y0:y1, x0:x1]
        sub_l = c.lvl[y0:y1, x0:x1]
        sub_m[hit] = c.mid(mat)
        sub_l[hit] = lv[hit]
        c.lock[y0:y1, x0:x1] |= hit
        best[y0:y1, x0:x1][hit] = t[hit]


def render(t, j, n):
    cam = cm.Cam(EYE, pitch_deg=-35, hfov=78)
    st = state(j, n)
    D, best, reg = trace(cam)
    E = cam.E
    P = E + D * np.minimum(best, 50)[..., None]
    x, y, z = P[..., 0], P[..., 1], P[..., 2]
    c = pixel.Canvas(W, H)
    c.dither = {'stone': 0.55, 'wall': 0.45}
    N = np.zeros_like(P)
    # muro del fondo
    m = reg == 1
    lv, mo, _ = cm.blocks(x, y, 0.42, 0.8)
    c.mask(m, 'stone', np.where(mo, 0.15, lv * 0.6))
    N[m] = (0, 0, -1)
    for k, (u0, L) in enumerate(((-1.25, 0.9), (-0.7, 0.5), (0.35, 0.7), (1.1, 1.0), (-0.1, 0.35))):
        sway = 0.03 * np.sin(y * 4 + k + t * 1.2)
        stem = m & (np.abs(x - (u0 + sway)) < 0.016) & (y > 2.6 - L)
        c.mask(stem, 'shade', 3.0)
        leaf = m & (y > 2.6 - L) & (np.abs(x - (u0 + sway + np.where(np.floor(y / 0.16) % 2 == 0, 0.04, -0.04))) < 0.03) & ((y / 0.16) % 1 < 0.35)
        c.mask(leaf, 'sprout', 3.2 + cm.h2(np.floor(y / 0.16), k) * 1.4)
    # piso
    m = reg == 2
    lv, mo, _ = cm.blocks(x, z, 0.7, 0.9, 2.0)
    c.mask(m, 'stone', np.where(mo, 0.1, lv * 0.45))
    N[m] = (0, 1, 0)
    # cubierta de la mesa: pizarra oscura, borde de latón, pozos tallados con filete verde
    m = reg == 3
    vein = np.abs(np.sin(x * 7 + np.sin(z * 9) * 1.5 + np.sin(x * 23) * 0.3)) < 0.05
    c.mask(m, 'stone', 1.25 + cm.h2(np.floor(x * 30), np.floor(z * 30)) * 0.35 + np.where(vein, 0.7, 0))
    rim = m & ((np.abs(x) > TX - 0.04) | (z < TZ0 + 0.04) | (z > TZ1 - 0.04))
    c.mask(rim, 'brass', 3.0)
    for w, lit in ((W1, 0.0), (W2, 0.0)):
        r = np.hypot(x - w[0], z - w[2])
        c.mask(m & (r < 0.3), 'stone', 0.7 + (r / 0.3) * 0.5)
        c.mask(m & (np.abs(r - 0.31) < 0.012), 'stone', 2.8)
        c.mask(m & (np.abs(r - 0.27) < 0.008), 'sprout', 3.0)
    lit = st['bond']
    r1 = np.hypot(x - W1[0], z - W1[2])
    ring1 = m & (np.abs(r1 - 0.27) < 0.008 + 0.006 * lit)
    c.mask(ring1, 'sprout', 3.0 + 4.5 * lit)
    c.lock |= ring1 & (lit > 0.3)
    txi = np.clip(((x - TX0) * TD).astype(int), 0, TEX.shape[1] - 1)
    tzi = np.clip((TEX.shape[0] - 1 - (z - TZ0) * TD).astype(int), 0, TEX.shape[0] - 1)
    eng = m & (TEX[tzi, txi] > 0)
    c.mask(eng, 'rune', 3.2)
    N[m] = (0, 1, 0)
    m = reg == 4
    c.mask(m, 'brass', np.where(y > TOP - 0.03, 3.4, 1.8 + cm.h2(np.floor(x * 20), 1) * 0.4))
    N[m] = (0, 0, -1)
    m = reg == 6
    c.mask(m, 'wall', 2.2)
    N[m] = (0, 1, 0)
    m = reg == 7
    c.mask(m, 'wall', 1.4)
    N[m] = (0, 0, -1)
    # luces
    fl = lambda i, f: 1 + 0.09 * math.sin(t * f + i * 2.3) + 0.05 * math.sin(t * f * 2.7 + i)
    lights = [(v3(cx, TOP + hgt + 0.05, cz), 1.6 * fl(i, 13), 0.7) for i, (cx, cz, hgt) in enumerate(CANDLES)]
    lights.append((W1 + v3(0, TOP + 0.15, 0), 0.6 + 1.8 * st['bond'], 0.5))
    lights.append((W2 + v3(0, TOP + 0.15, 0), 0.6, 0.45))
    lights.append((st['h'], 1.3 * st['tongs'] + 0.4, 0.35))
    lights.append((v3(1.05, 1.2, 1.25), 1.2, 0.6))
    c.add_light(cm.point_light(P, N, lights))
    best = best.copy()
    # objetos en pantalla: frascos de misión, cristales, velas
    glows = []
    draw_jars(c, cam, st, glows)
    draw_crystals(c, cam, glows)
    for i, (cx, cz, hgt) in enumerate(CANDLES):
        draw_candle(c, cam, v3(cx, TOP, cz), hgt, 0.03, t, i, fl(i, 13), glows)
    # esferas: moléculas, H+ y pinza
    S, ring = molecules(st['bond'])
    h = st['h']
    S.append((h, 0.036, 'glow', 3.5))
    if st['tongs'] > 0.02:
        back = HANDLE + v3(0.4, 0.2, -0.2) * (1 - st['tongs'])
        gap = 0.032 + 0.03 * (1 - st['grip'])
        tip = h + (h - back) / np.linalg.norm(h - back) * -0.03 + (v3(0.0, 0.0, 0.0))
        side = np.cross(h - back, v3(0, 1, 0))
        side /= np.linalg.norm(side)
        for sgn in (-1, 1):
            a = back + side * sgn * 0.035
            b = tip + side * sgn * gap * 0.5 + (h - tip) * 0.6
            S += beads(a, b, 0.006, 'brass', 1.9, 0.0055)
    key = np.array([-0.5, 0.8, -0.3], np.float32)
    key /= np.linalg.norm(key)
    spheres(c, cam, D, best, S, lights, key)
    # par libre: dos lóbulos verdes sobre el N de la metilamina; en la anilina, puntos que corren por el anillo
    lobes = []
    if st['bond'] < 0.5:
        for dx in (-0.016, 0.016):
            lobes.append(NMET + v3(dx, 0.075, 0))
    for k in range(3):
        ang = t * 3 + k * 2.09
        lobes.append(RING_C + v3(0.11 * math.cos(ang), 0.03, 0.11 * math.sin(ang)))
    for p in lobes:
        px_, py_, pz_ = cam.project(p)
        if pz_ > 0.05:
            msk = cm.disc((H, W), px_, py_, 2.6)
            c.mask(msk, 'sprout', 7)
            c.lock |= msk
    # chispas rojas al rebotar
    rng = np.random.default_rng(j)
    sparks = []
    if st['rebound'] > 0.05:
        for k in range(10):
            p = NANI + v3(0, 0.1, 0) + v3(*(rng.normal(size=3) * 0.06 * st['rebound']))
            sparks.append(cam.project(p))
        for sx, sy, sz in sparks:
            c.px(sx, sy, 'red', 5)
            c.lock[int(np.clip(sy, 0, H - 1)), int(np.clip(sx, 0, W - 1))] = True
    hx, hy, hz = cam.project(h)
    n1 = cam.project(NMET + v3(0, 0.05, 0))

    def post(arr):
        pixel.glow(arr, hx, hy, 18, '#ffd270', 1.0, 3)
        for p in lobes:
            px_, py_, _ = cam.project(p)
            pixel.glow(arr, px_, py_, 7, '#9cb84a', 0.8, 2)
        if st['flash'] > 0:
            pixel.glow(arr, n1[0], n1[1], 40 * st['flash'] + 10, '#c6d862', 1.2 * st['flash'], 4)
        if st['bond'] > 0:
            pixel.glow(arr, n1[0], n1[1], 60, '#52722a', 0.5 * st['bond'], 4, squash=1.8)
        if st['rebound'] > 0.05:
            ax, ay, _ = cam.project(NANI + v3(0, 0.08, 0))
            pixel.glow(arr, ax, ay, 22, '#d87052', 0.9 * st['rebound'], 3)
        for kind, gx, gy, gr, col, gs in glows:
            pixel.glow(arr, gx, gy, gr, col, gs, 4)
    img = c.render(scale=1, post=post)
    rgb = np.array(img, np.float32)
    # Grimorio asomado arriba a la derecha; mascota en la esquina de la mesa
    cm.paste_sprite(rgb, os.path.join(SP, 'grimorio.png'), W - 92, 6 + math.sin(t * 2.2) * 2.5)
    mx, my, mz = cam.project(v3(0.7, TOP, 0.08))
    hop = abs(math.sin(t * 9)) * 4 * st['result'] * (1 - st['result'] * 0.6)
    cm.paste_sprite(rgb, os.path.join(SP, 'mascota.png'), mx - 20, my - 42 - hop)
    big = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).resize((W * cm.SCALE, H * cm.SCALE), Image.NEAREST).convert('RGBA')
    card(big, cam, st)
    bubble(big, st)
    return big


def draw_jars(c, cam, st, glows):
    fills = [1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    fills[2] = st['jar']
    yy, xx = np.mgrid[0:H, 0:W]
    for k in range(JARS):
        base = v3(-1.12 + k * 0.32, SHELF_Y, 1.9)
        bx, by, bz = cam.project(base)
        sc = cam.f / bz
        r = 0.07 * sc
        cy = by - r
        body = (xx - bx) ** 2 + (yy - cy) ** 2 < r * r
        neck = (np.abs(xx - bx) < r * 0.32) & (yy < cy - r * 0.7) & (yy > cy - r * 1.6)
        cork = (np.abs(xx - bx) < r * 0.38) & (yy <= cy - r * 1.6) & (yy > cy - r * 1.95)
        c.mask(body | neck, 'glass', 1.4 + np.clip((bx - xx) / r, -1, 1) * -0.4)
        level = cy + r - 2 * r * fills[k]
        liq = body & (yy > level)
        c.mask(liq, 'sprout', 4.0 + (yy - cy) / r * -0.8 + (1 if k == 2 and 0 < fills[k] < 1 else 0))
        hl = body & (np.abs(xx - (bx - r * 0.45)) < 1) & (yy < cy) & (yy > cy - r * 0.6)
        c.mask(hl, 'glass', 6)
        c.mask(cork, 'clay', 3.0)
        c.lock |= body | neck | cork
        if fills[k] > 0:
            glows.append(('jar', bx, cy, r * 2.2, '#9cb84a', 0.35 + (0.5 if k == 2 else 0) * fills[k]))


def draw_crystals(c, cam, glows):
    rng = np.random.default_rng(11)
    for base in (v3(1.05, TOP, 1.26), v3(-1.32, SHELF_Y, 1.9)):
        bx, by, bz = cam.project(base)
        sc = cam.f / bz
        for j in range(5):
            hgt = (0.12 + rng.random() * 0.2) * sc
            wid = (0.025 + rng.random() * 0.02) * sc
            lean = (rng.random() - 0.5) * 0.9
            ox = (rng.random() - 0.5) * 0.15 * sc
            tipx, tipy = bx + ox + lean * hgt * 0.5, by - hgt
            left = cm.poly_mask([(bx + ox - wid, by), (bx + ox, by + wid * 0.3), (tipx, tipy)])
            right = cm.poly_mask([(bx + ox, by + wid * 0.3), (bx + ox + wid, by), (tipx, tipy)])
            c.mask(left, 'crystal', 3.2)
            c.mask(right, 'crystal', 5.0)
            c.lock |= left | right
        glows.append(('crystal', bx, by - 0.12 * sc, 0.4 * sc, '#3098b8', 0.5))


def draw_candle(c, cam, base, hgt, rad, t, seed, f, glows):
    bx, by, bz = cam.project(base)
    tx, ty, tz = cam.project(base + v3(0, hgt, 0))
    sc = cam.f / bz
    cw = rad * sc
    yy, xx = np.mgrid[0:H, 0:W]
    body = (np.abs(xx - bx) < cw) & (yy > ty) & (yy < by)
    c.mask(body, 'wax', 1.6 + (xx - bx + cw) / (2 * cw) * 2.6)
    drip = body & (np.abs(xx - (bx + cw * 0.3)) < max(1, cw * 0.25)) & (yy < ty + (by - ty) * 0.4)
    c.mask(drip, 'wax', 4.6)
    top = ((xx - tx) / cw) ** 2 + ((yy - ty) / (cw * 0.4)) ** 2 < 1
    c.mask(top, 'wax', 4.2)
    c.lock |= body | top
    cm.draw_flame(c, tx, ty - 1, 0.06 * sc * f, t, seed * 3)
    glows.append(('candle', tx, ty - 3, 26 * f, '#ffc850', 0.55))


def quad_on_table(cam, x0, x1, z0, z1):
    pts = [v3(x0, TOP + 0.001, z1), v3(x1, TOP + 0.001, z1), v3(x1, TOP + 0.001, z0), v3(x0, TOP + 0.001, z0)]
    return [(px * cm.SCALE, py * cm.SCALE) for px, py, _ in (cam.project(p) for p in pts)]


def card(big, cam, st):
    """Ficha de pergamino sobre la mesa con el enunciado (texto nítido en perspectiva)."""
    pw, ph = 900, 520
    im = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([(6, 6), (pw - 6, ph - 6)], 18, fill=(232, 216, 178, 245), outline=(138, 104, 60, 255), width=6)
    d.rounded_rectangle([(22, 22), (pw - 22, ph - 22)], 12, outline=(170, 136, 84, 180), width=2)
    ink, soft, green = (52, 36, 30, 255), (120, 90, 58, 255), (60, 104, 36, 255)
    d.text((50, 44), 'TALLER · AMINAS        Ejercicio 3 de 8', font=cm.font(cm.SERIF, 34), fill=soft)
    d.text((50, 108), 'Lleva el H⁺ con la pinza', font=cm.font(cm.SERIF_B, 50), fill=ink)
    d.text((50, 170), 'a la base más fuerte.', font=cm.font(cm.SERIF_B, 50), fill=ink)
    if st['result'] > 0:
        a = int(255 * st['result'])
        d.line([(52, 300), (70, 322), (102, 278)], fill=(60, 104, 36, a), width=8)
        d.text((118, 268), 'Metilamina: su par libre', font=cm.font(cm.SERIF_B, 42), fill=(60, 104, 36, a))
        d.text((118, 324), 'queda disponible.', font=cm.font(cm.SERIF_B, 42), fill=(60, 104, 36, a))
        d.text((50, 420), '+1 frasco de misión', font=cm.font(cm.SERIF_I, 34), fill=(120, 90, 58, a))
    elif st['hint'] > 0:
        d.text((50, 270), 'La anilina lo rechazó…', font=cm.font(cm.SERIF_I, 40), fill=(150, 60, 50, 255))
        d.text((50, 326), '¿dónde está su par libre?', font=cm.font(cm.SERIF_I, 40), fill=(150, 60, 50, 255))
    cm.warp_onto(big, im, quad_on_table(cam, -0.8, -0.14, -0.06, 0.19))


def bubble(big, st):
    """Lo que dice el Grimorio (arriba a la derecha)."""
    if st['hint'] <= 0 and st['result'] <= 0:
        return
    txt = ['Bien hecho. Ese par libre', 'atrapó al protón.'] if st['result'] > 0 else ['En la anilina el par libre', 'se reparte en el anillo.']
    d = ImageDraw.Draw(big)
    f = cm.font(cm.SERIF_I, 26)
    x1, y0 = W * cm.SCALE - 290, 40
    x0 = x1 - 420
    d.rounded_rectangle([(x0, y0), (x1, y0 + 96)], 14, fill=(36, 28, 46, 235), outline=(200, 172, 112, 255), width=3)
    d.polygon([(x1 - 2, y0 + 36), (x1 + 22, y0 + 50), (x1 - 2, y0 + 62)], fill=(36, 28, 46, 235))
    for i, line in enumerate(txt):
        d.text((x0 + 22, y0 + 14 + i * 34), line, font=f, fill=(234, 222, 196, 255))


def main():
    n = 64
    frames = []
    for j in range(n):
        frames.append(render(j * 0.09, j, n))
        print('cuadro', j + 1, '/', n, flush=True)
    os.makedirs(cm.OUT, exist_ok=True)
    frames[56].convert('RGB').save(os.path.join(cm.OUT, 'mesa.png'))
    frames[16].convert('RGB').save(os.path.join(cm.OUT, 'mesa-rebote.png'))
    cm.save(frames, 'mesa', ms=90)


if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'cuadros':
        os.makedirs(cm.OUT, exist_ok=True)
        render(56 * 0.09, 56, 64).convert('RGB').save(os.path.join(cm.OUT, 'mesa.png'))
        render(16 * 0.09, 16, 64).convert('RGB').save(os.path.join(cm.OUT, 'mesa-rebote.png'))
    else:
        main()
