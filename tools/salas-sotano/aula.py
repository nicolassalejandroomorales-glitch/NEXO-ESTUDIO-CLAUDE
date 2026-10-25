"""Boceto del Aula (Orgánica II): atril de piedra con el tomo + muro de cristal donde el Grimorio proyecta la clase.

Recorrido del GIF: mirando el muro (el H+ vuela al par libre y se forma el enlace) -> bajas la mirada al tomo
(lees y respondes; la mascota acompaña sobre el atril) -> vuelves a levantarla.
Correr: python tools/salas-sotano/aula.py  ->  docs/salas-sotano/aula.png (cuadro clave x3) y aula.gif
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw

import comun as cm
from comun import H, W, pixel

R = 4.8            # radio del Aula (cripta circular)
WALLH = 4.5        # altura del muro antes de la cúpula
EYE = np.array([0.0, 1.62, -0.2], np.float32)
TH0 = 0.52         # medio ancho angular del muro de cristal
PILLARS = [(a, 4.5) for a in (0.66, -0.66, 1.2, -1.2, 1.85, -1.85)]
PR = 0.28
# atril: centro de la tapa, inclinación y medidas (s = a lo ancho, q = a lo largo de la pendiente)
SLANT = math.radians(25)
Q = np.array([0.0, 1.13, 0.27], np.float32)
EX = np.array([1.0, 0.0, 0.0], np.float32)
EA = np.array([0.0, math.sin(SLANT), math.cos(SLANT)], np.float32)
NP = np.array([0.0, math.cos(SLANT), -math.sin(SLANT)], np.float32)
PLATE = (0.33, 0.23)
COVER = (0.25, 0.175)
PAGE = (0.24, 0.165)
GRIM = np.array([1.6, 1.9, 2.9], np.float32)
SP = os.environ.get('NEXO_SPRITES', '/tmp/claude-0/-home-claude/622bf8d6-11a2-5daf-a7a2-565848ea4c82/scratchpad')
TORCHES = [((PR + 0.05) * 0 + (r - 0.33) * math.sin(a), 2.35, (r - 0.33) * math.cos(a)) for a, r in PILLARS[:4]]
CLUSTERS = [(0.86, 0.0), (-0.84, 1.0), (0.42, 2.0), (-0.45, 3.0), (1.45, 4.0), (-1.5, 5.0)]
VINES = [(-0.62, 1.6), (-0.55, 0.9), (0.6, 1.3), (0.71, 2.1), (-0.95, 1.0), (0.98, 1.8), (0.2, 0.55), (-0.25, 0.75),
         (1.4, 1.2), (-1.38, 2.2)]


def wpt(s, q, lift=0.0):
    return Q + EX * s + EA * q + NP * lift


def wall_pt(u, v):
    th = u / R
    return np.array([R * math.sin(th), v, R * math.cos(th)], np.float32)


# ---------------- proyección del Grimorio sobre el cristal (textura en u, v) ----------------
TU0, TU1, TV0, TV1, TD = -2.5, 2.5, 0.65, 4.0, 36.0
TW, TH = int((TU1 - TU0) * TD), int((TV1 - TV0) * TD)


def ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def proj_tex(p):
    """p in [0,1]: avance de la animación (el H+ vuela, choca y se forma el enlace)."""
    T = np.zeros((TH, TW), np.uint8)
    put = lambda txt, x, y, c, s=2: cm.stamp(T, cm.text_mask(txt, s), x, y, c)
    put('BASICIDAD', TW / 2 - 53, 10, 2)
    put('AMINAS', TW / 2 - 17, 26, 1, 1)
    # metilamina: CH3 - N (H2), con el par libre arriba del N
    nx, ny = 74, 66
    put('CH3', nx - 50, ny - 4, 2)
    T[ny:ny + 2, nx - 16:nx - 4] = 2
    put('N', nx - 3, ny - 4, 2)
    T[ny + 8:ny + 18, nx + 1:nx + 3] = 2
    put('H', nx - 3, ny + 20, 2)
    for i in range(10):
        T[ny + 4 - i // 2, nx + 9 + i] = 2
    put('H', nx + 20, ny - 6, 2)
    bond = ease((p - 0.55) / 0.15)
    if bond < 1:
        for dx in (-3, 3):
            yy = ny - 10
            T[yy:yy + 3, nx + 2 + dx - 1:nx + 2 + dx + 2] = 3
    # el H+ llega en arco desde arriba a la derecha
    a = ease(p / 0.55)
    x0, y0, x1, y1 = 168, 28, nx + 2, ny - 22
    hx = x0 + (x1 - x0) * a
    hy = y0 + (y1 - y0) * a - 26 * math.sin(math.pi * a)
    for k in range(1, 7):
        b = max(0.0, a - k * 0.035)
        tx = x0 + (x1 - x0) * b
        ty = y0 + (y1 - y0) * b - 26 * math.sin(math.pi * b)
        if a < 1 and k % 2:
            T[int(ty), int(tx)] = 1
    orb = cm.disc(T.shape, hx, hy, 3.2)
    T[orb] = 4
    put('+', hx + 5, hy - 9, 4, 1)
    if bond > 0:
        n = int(10 * bond)
        T[ny - 4 - n:ny - 4, nx + 1:nx + 3] = 2
        put('+', nx + 9, ny - 14, 5, 1)
    if 0.55 < p < 0.8:
        r = 4 + (p - 0.55) * 90
        yy, xx = np.mgrid[0:TH, 0:TW]
        d = np.hypot(xx - (nx + 2), yy - (ny - 6))
        T[(np.abs(d - r) < 1.0) & (T == 0)] = 5
    # a la derecha, la anilina: el par se reparte en el anillo (menos disponible)
    cx, cy, rr = 150, 72, 14
    pts = [(cx + rr * math.cos(math.radians(30 + 60 * k)), cy + rr * math.sin(math.radians(30 + 60 * k))) for k in range(6)]
    img = Image.fromarray(T)
    d = ImageDraw.Draw(img)
    d.polygon(pts, outline=1)
    d.line([(cx, cy - rr), (cx, cy - rr - 10)], fill=1)
    T = np.array(img)
    put('NH2', cx - 9, cy - rr - 18, 1, 1)
    ph = p * 2 * math.pi
    for k in range(3):
        ang = ph + k * 2.1
        T[int(cy + (rr - 4) * math.sin(ang)), int(cx + (rr - 4) * math.cos(ang))] = 3
    put('AMINA > ANILINA', TW / 2 - 44, TH - 14, 2, 1)
    return T


# ---------------- trazado de rayos de la sala ----------------
def trace(cam):
    D = cam.rays()
    E = cam.E
    INF = np.float32(1e9)
    best = np.full((H, W), INF, np.float32)
    reg = np.zeros((H, W), np.int8)
    aux = np.zeros((H, W), np.float32)
    dy = D[..., 1]
    tf = np.where(dy < -1e-4, -E[1] / np.where(dy < -1e-4, dy, -1), INF)
    upd = tf < best; best[upd] = tf[upd]; reg[upd] = 3
    a = D[..., 0] ** 2 + D[..., 2] ** 2
    b = 2 * (E[0] * D[..., 0] + E[2] * D[..., 2])
    c = E[0] ** 2 + E[2] ** 2 - R * R
    tw = (-b + np.sqrt(np.maximum(b * b - 4 * a * c, 0))) / (2 * a + 1e-9)
    yw = E[1] + tw * dy
    tw = np.where((yw >= 0) & (yw <= WALLH), tw, INF)
    upd = tw < best; best[upd] = tw[upd]; reg[upd] = 1
    o = E - np.array([0, WALLH, 0], np.float32)
    bb = (D * o).sum(-1)
    cc = (o * o).sum() - R * R
    td = -bb + np.sqrt(np.maximum(bb * bb - cc, 0))
    yd = E[1] + td * dy
    td = np.where(yd > WALLH, td, INF)
    upd = td < best; best[upd] = td[upd]; reg[upd] = 2
    for i, (ang, rr) in enumerate(PILLARS):
        px, pz = rr * math.sin(ang), rr * math.cos(ang)
        ox, oz = E[0] - px, E[2] - pz
        bq = 2 * (ox * D[..., 0] + oz * D[..., 2])
        cq = ox * ox + oz * oz - PR * PR
        disc = bq * bq - 4 * a * cq
        tp = (-bq - np.sqrt(np.maximum(disc, 0))) / (2 * a + 1e-9)
        yp = E[1] + tp * dy
        tp = np.where((disc > 0) & (tp > 0) & (yp > 0) & (yp < WALLH), tp, INF)
        upd = tp < best; best[upd] = tp[upd]; reg[upd] = 4; aux[upd] = i
    dn = (D * NP).sum(-1)
    tpl = np.where(np.abs(dn) > 1e-5, ((Q - E) @ NP) / np.where(np.abs(dn) > 1e-5, dn, 1), INF)
    Pp = E + D * tpl[..., None]
    s = (Pp - Q) @ EX
    q = (Pp - Q) @ EA
    tpl = np.where((tpl > 0) & (np.abs(s) < PLATE[0]) & (np.abs(q) < PLATE[1]), tpl, INF)
    upd = tpl < best; best[upd] = tpl[upd]; reg[upd] = 5
    P = E + D * best[..., None]
    return P, reg, aux, s, q


def build_frame(cam, t, p, read):
    """t: segundos; p: avance de la proyección; read: avance de la respuesta en el tomo (0..1)."""
    P, reg, aux, s, q = trace(cam)
    c = pixel.Canvas(W, H)
    c.dither = {'stone': 0.55, 'wall': 0.45}
    x, y, z = P[..., 0], P[..., 1], P[..., 2]
    N = np.zeros_like(P)
    # --- muro ---
    m = reg == 1
    th = np.arctan2(x, z)
    u = th * R
    lv, mo, nn = cm.blocks(u, y, 0.45, 0.86)
    c.mask(m, 'stone', np.where(mo, 0.15, lv * 0.62))
    plinth = m & (y < 0.32)
    c.mask(plinth, 'stone', np.where(y > 0.27, 2.4, 1.2))
    N[m] = -np.stack([x, np.zeros_like(x), z], -1)[m] / R
    cor = m & (y > WALLH - 0.28)
    c.mask(cor, 'wall', np.where(y > WALLH - 0.07, 3.2, np.where(y < WALLH - 0.24, 1.6, 2.4)))
    c.mask(cor & (np.abs(y - (WALLH - 0.15)) < 0.025), 'sprout', 5.0)
    # muro de cristal: marco de sillería clara con filete verde, cristal facetado, proyección
    tn = np.abs(th) / TH0
    ytop = 3.2 + 0.75 * np.sqrt(np.clip(1 - tn ** 2, 0, 1))
    inner = m & (tn < 1) & (y > 0.62) & (y < ytop)
    tn2 = np.abs(th) / (TH0 + 0.06)
    ytop2 = 3.2 + 0.95 * np.sqrt(np.clip(1 - tn2 ** 2, 0, 1)) + 0.05
    frame = m & (tn2 < 1) & (y > 0.45) & (y < ytop2) & ~inner
    vs = np.floor(np.where(y < 3.2, y / 0.42, 8 + np.arctan2(y - 3.2, np.abs(th) * R) * 6))
    c.mask(frame, 'wall', 2.3 + cm.h2(vs, np.sign(th)) * 0.9 - np.where(np.abs(np.abs(th) - TH0 - 0.03) > 0.025, 0, 0))
    c.mask(frame & (np.abs(th) * R > (TH0 + 0.012) * R) & (np.abs(th) * R < (TH0 + 0.022) * R), 'sprout', 5.5)
    edge = frame & (y < ytop + 0.035) & (y > ytop) & (tn < 1)
    c.mask(edge, 'sprout', 5.5)
    f1, f2, cid = cm.voronoi(u, y, 0.32)
    c.mask(inner, 'shade', 0.7 + cid * 0.6 + np.where(f2 - f1 < 0.02, 0.8, 0) + 0.5 * (1 - np.clip(y - 0.6, 0, 3) / 3))
    T = proj_tex(p)
    tx = np.clip((u - TU0) * TD, 0, TW - 1).astype(int)
    ty = np.clip((TV1 - y) * TD, 0, TH - 1).astype(int)
    code = np.where(inner, T[ty, tx], 0)
    c.mask(code == 1, 'sprout', 3.6)
    for k, (mat, lv2) in {2: ('sprout', 7.2), 3: ('petal', 4), 4: ('glow', 5), 5: ('sprout', 8)}.items():
        mk = code == k
        c.mask(mk, mat, lv2)
        c.lock |= mk
    # enredaderas que bajan desde la cornisa
    for k, (ang, L) in enumerate(VINES):
        u0 = ang * R
        sway = 0.035 * np.sin(y * 3.5 + k * 1.7 + t * 1.3)
        stem = m & (np.abs(u - (u0 + sway)) < 0.022) & (y > WALLH - L)
        c.mask(stem, 'shade', 3.2)
        leaf = m & (y > WALLH - L + 0.05) & (np.abs(u - (u0 + sway + np.where(np.floor(y / 0.22) % 2 == 0, 0.055, -0.055))) < 0.04) & ((y / 0.22) % 1 < 0.35)
        c.mask(leaf, 'sprout', 3.4 + cm.h2(np.floor(y / 0.22), k) * 1.5)
        tip = stem & (y < WALLH - L + 0.06)
        c.mask(tip, 'crystal', 6)
    # --- cúpula ---
    m = reg == 2
    ph = np.arctan2(x, z)
    el = np.arcsin(np.clip((y - WALLH) / R, -1, 1))
    lv, mo, _ = cm.blocks(ph * R * np.cos(el), el * R, 0.42, 0.8, 5.0)
    c.mask(m, 'stone', np.where(mo, 0.1, lv * 0.5 - 0.3))
    rib = m & (np.abs(((ph / (math.pi / 6)) + 0.5) % 1 - 0.5) * (math.pi / 6) * R * np.cos(el) < 0.1)
    c.mask(rib, 'wall', 1.9)
    N[m] = (np.array([0, WALLH, 0], np.float32) - P)[m] / R
    # --- piso ---
    m = reg == 3
    r = np.hypot(x, z)
    ring = np.floor(r / 0.8)
    nseg = np.maximum(6, np.round(2 * math.pi * (ring + 0.5) * 0.8 / 0.95))
    ang = (np.arctan2(x, z) / (2 * math.pi) + 0.5) * nseg
    fr, fa = (r / 0.8) % 1, ang % 1
    mo = (fr < 0.06) | (fa < 0.05 * np.maximum(1, 4 - ring * 0.5))
    nfl = cm.h2(ring, np.floor(ang))
    c.mask(m, 'stone', np.where(mo, 0.1, 0.6 + nfl * 0.6))
    moss = m & mo & (r > 3.4) & (cm.h2(np.floor(x * 9), np.floor(z * 9)) > 0.45)
    c.mask(moss, 'leaf', 2.2)
    c.mask(m & (np.abs(r - 1.6) < 0.035), 'brass', 3.0)
    hexr = np.cos(math.pi / 6) / np.cos(((np.arctan2(x, z) + math.pi / 6) % (math.pi / 3)) - math.pi / 6) * 0.95
    c.mask(m & (np.abs(r - hexr) < 0.03), 'sprout', 5.0)
    N[m] = (0, 1, 0)
    # --- pilares ---
    m = reg == 4
    for i, (ang0, rr) in enumerate(PILLARS):
        mi = m & (aux == i)
        if not mi.any():
            continue
        px, pz = rr * math.sin(ang0), rr * math.cos(ang0)
        al = np.arctan2(x - px, z - pz)
        lv, mo, _ = cm.blocks(al * PR, y, 0.4, 0.42, i * 3.0)
        c.mask(mi, 'stone', np.where(mo, 0.15, lv * 0.62))
        c.mask(mi & ((y < 0.3) | (y > WALLH - 0.3)), 'wall', 1.5)
        c.mask(mi & (np.abs(y - 2.22) < 0.05), 'brass', 3.2)
        nrm = np.stack([x - px, np.zeros_like(x), z - pz], -1) / PR
        N[mi] = nrm[mi]
    # --- atril ---
    m = reg == 5
    grain = cm.h2(np.floor(s * 140), np.floor(q * 60))
    c.mask(m, 'wall', 1.5 + grain * 0.4)
    c.mask(m & ((np.abs(s) > PLATE[0] - 0.022) | (np.abs(q) > PLATE[1] - 0.022)), 'brass', 3.3)
    inl = m & (((np.abs(np.abs(s) - (PLATE[0] - 0.04)) < 0.004) & (np.abs(q) < PLATE[1] - 0.036)) |
               ((np.abs(np.abs(q) - (PLATE[1] - 0.036)) < 0.004) & (np.abs(s) < PLATE[0] - 0.04)))
    c.mask(inl, 'sprout', 5.4)
    cov = m & (np.abs(s) < COVER[0]) & (np.abs(q) < COVER[1])
    c.mask(cov, 'lav', 2.4 + np.where(np.abs(q) > COVER[1] - 0.006, 1.0, 0))
    pg = m & (np.abs(s) < PAGE[0]) & (np.abs(q) < PAGE[1])
    w = np.abs(s) / PAGE[0]
    plv = 3.0 + 0.55 * np.sqrt(np.clip(np.sin(np.pi * np.clip(w, 0, 1)), 0, 1)) - 1.7 * np.exp(-w / 0.06)
    stripes = (w > 0.95) | (np.abs(q) > PAGE[1] - 0.007)
    plv = np.where(stripes, np.where((np.floor(w * 400 + np.abs(q) * 400) % 2) == 0, 2.5, 3.3), plv)
    c.mask(pg, 'paper', plv)
    rib_ = m & (s > 0.018) & (s < 0.032) & (q < -0.11) & (q > -PLATE[1] + 0.03)
    c.mask(rib_, 'red', 3.6 - (s - 0.018) * 60)
    N[m] = NP
    # --- luces ---
    fl = lambda i, f: 1 + 0.09 * math.sin(t * f + i * 2.3) + 0.05 * math.sin(t * f * 2.7 + i)
    lights = [(tp, 2.4 * fl(i, 11), 1.15) for i, tp in enumerate(TORCHES)]
    lights += [(((R - 0.4) * math.sin(a2), yy, (R - 0.4) * math.cos(a2)), 1.5, 2.2) for a2 in (-0.3, 0.3) for yy in (1.3, 2.7)]
    lights = [(lp[0], lp[1] * (0.55 if k >= len(TORCHES) else 1), lp[2]) for k, lp in enumerate(lights)]
    lights = [(np.array(lp[0], np.float32), lp[1], lp[2]) for lp in lights]
    candle = wpt(-0.285, 0.185, 0.14)
    lights.append((candle, 1.9 * fl(9, 15), 0.62))
    lights.append((GRIM, 1.1, 1.3))
    c.add_light(cm.point_light(P, N, lights))
    c.add_light(np.where(reg == 2, -0.5, 0))
    glows = []
    for i, tp in enumerate(TORCHES):
        glows.append(('torch', tp, fl(i, 11)))
    glows.append(('candle', candle, fl(9, 15)))
    return c, P, reg, glows


def foreground(c, cam, glows, t, cl_rng):
    # cristales que nacen del piso junto al muro
    for k, (ang, sd) in enumerate(CLUSTERS):
        rng = np.random.default_rng(int(sd * 7 + 3))
        base = np.array([(R - 0.25) * math.sin(ang), 0.0, (R - 0.25) * math.cos(ang)], np.float32)
        bx, by, bz = cam.project(base)
        if bz < 0.2:
            continue
        sc = cam.f / bz
        for j in range(5):
            hgt = (0.28 + rng.random() * 0.45) * sc
            wid = (0.05 + rng.random() * 0.05) * sc
            lean = (rng.random() - 0.5) * 0.9
            ox = (rng.random() - 0.5) * 0.4 * sc
            tipx, tipy = bx + ox + lean * hgt * 0.5, by - hgt
            left = cm.poly_mask([(bx + ox - wid, by), (bx + ox, by + wid * 0.3), (tipx, tipy)])
            right = cm.poly_mask([(bx + ox, by + wid * 0.3), (bx + ox + wid, by), (tipx, tipy)])
            c.mask(left, 'crystal', 3.2 + j * 0.2)
            c.mask(right, 'crystal', 5.0)
            c.lock |= left | right
        glows.append(('crystal', base + np.array([0, 0.3, 0], np.float32), 1.0))
    # antorchas
    for kind, pos, f in glows:
        if kind != 'torch':
            continue
        fx, fy, fz = cam.project(pos)
        if fz < 0.2:
            continue
        sc = cam.f / fz
        c.rect(fx - 0.035 * sc, fy, fx + 0.035 * sc, fy + 0.22 * sc, 'brass', 2.4)
        cm.draw_flame(c, fx, fy, 0.2 * sc * f, t, pos[0])
    # vela, plato de latón y tintero sobre el atril
    for kind, pos, f in glows:
        if kind != 'candle':
            continue
        b0 = wpt(-0.285, 0.185, 0.0)
        bx, by, bz = cam.project(b0)
        tx, ty, tz = cam.project(b0 + np.array([0, 0.1, 0], np.float32))
        if bz < 0.05 or tz < 0.05:
            continue
        sc = cam.f / bz
        rr = 0.05 * sc
        yy, xx = np.mgrid[0:H, 0:W]
        dish = ((xx - bx) / rr) ** 2 + ((yy - by) / (rr * 0.45)) ** 2 < 1
        c.mask(dish, 'brass', 3.0)
        cw = 0.024 * sc
        body = (np.abs(xx - bx) < cw) & (yy > ty) & (yy < by)
        c.mask(body, 'wax', 1.8 + (xx - bx + cw) / (2 * cw) * 2.6)
        drip = body & (np.abs(xx - (bx - cw * 0.4)) < cw * 0.25) & (yy < ty + (by - ty) * 0.45)
        c.mask(drip, 'wax', 4.6)
        top = ((xx - tx) / cw) ** 2 + ((yy - ty) / (cw * 0.4)) ** 2 < 1
        c.mask(top, 'wax', 4.2)
        c.lock |= dish | body | top
        cm.draw_flame(c, tx, ty - 1, 0.07 * sc * f, t, 9)
        # tintero de vidrio (tinta verde oscura) con pluma
        ix, iy, iz = cam.project(wpt(0.292, 0.19, 0.0))
        isc = cam.f / iz
        rw, rh = 0.022 * isc, 0.03 * isc
        nx_ = (xx - ix) / rw
        ny_ = (yy - (iy - rh)) / rh
        bottle = (nx_ ** 2 + ny_ ** 2 < 1) | ((np.abs(nx_) < 0.45) & (ny_ < -0.8) & (ny_ > -1.35))
        c.mask(bottle, 'glass', 1.2 + np.clip(1 - nx_, 0, 2) * 0.4)
        c.mask(bottle & (ny_ > 0.1) & (nx_ ** 2 + ny_ ** 2 < 0.8), 'shade', 1.6)
        c.mask(bottle & (np.abs(nx_ + 0.45) < 0.15) & (ny_ < 0) & (ny_ > -0.7), 'glass', 5.5)
        c.lock |= bottle
        qx, qy = ix + 0.2 * rw, iy - 2.2 * rh
        for j in range(int(0.1 * isc)):
            wv = 0 if j < 3 else min(3, 1 + j // 6)
            c.rect(qx + j * 0.45 - wv, qy - j, qx + j * 0.45 + 1, qy - j + 1, 'petal', 2.2 + (j % 4) * 0.4)
            c.lock[int(np.clip(qy - j, 0, H - 1)), int(np.clip(qx + j * 0.45, 0, W - 1))] = True


def motes(c, cam, t, glows):
    rng = np.random.default_rng(4)
    for i in range(40):
        base = np.array([rng.uniform(-2, 2), rng.uniform(0.3, 3.5), rng.uniform(0.2, 4.2)], np.float32)
        ph = (t * 0.06 + rng.random()) % 1
        p = base + np.array([0.15 * math.sin(t * 0.7 + i), ph * 0.8, 0.1 * math.cos(t * 0.5 + i)], np.float32)
        x, y, z = cam.project(p)
        if z > 0.3 and 0 <= x < W and 0 <= y < H:
            c.px(x, y, 'glow', 3 + (i % 3))
            c.lock[int(y), int(x)] = True


def render(cam, t, p, read):
    c, P, reg, glows = build_frame(cam, t, p, read)
    foreground(c, cam, glows, t, None)
    motes(c, cam, t, glows)
    gx, gy, gz = cam.project(GRIM)
    bob = math.sin(t * 2.2) * 2.5
    proj_c = cam.project(wall_pt(0, 2.3))
    hx = TU0 + (168 + (74 + 2 - 168) * ease(p / 0.55)) / TD
    hv = TV1 - (28 + (66 - 22 - 28) * ease(p / 0.55) - 26 * math.sin(math.pi * ease(p / 0.55))) / TD
    hpos = cam.project(wall_pt(hx, hv))

    def post(arr):
        yy, xx = np.mgrid[0:H, 0:W]
        bay = pixel.BAYER[yy % 4, xx % 4] + 0.47
        if gz > 0.3 and proj_c[2] > 0.3:
            # haz del Grimorio al cristal: cuña tramada, tenue
            ax, ay = gx - 22, gy + bob - 14
            top = cam.project(wall_pt(-1.6, 3.3))
            bot = cam.project(wall_pt(-1.6, 1.0))
            top2 = cam.project(wall_pt(1.3, 3.5))
            bot2 = cam.project(wall_pt(1.3, 0.9))
            wedge = cm.poly_mask([(ax, ay), (top2[0], top2[1]), (top[0], top[1]), (bot[0], bot[1]), (bot2[0], bot2[1])])
            wedge &= reg == 1
            arr += (wedge & (bay > 0.72))[..., None] * np.array([40, 70, 30], np.float32)
            pixel.glow(arr, ax, ay, 26, '#9cb84a', 0.8, 4)
        if hpos[2] > 0.3 and p < 0.6:
            pixel.glow(arr, hpos[0], hpos[1], 14, '#ffd270', 1.1, 3)
        for kind, pos, f in glows:
            x, y, z = cam.project(pos)
            if z < 0.2:
                continue
            if kind == 'torch':
                pixel.glow(arr, x, y - 4, 30 * f, '#f89a30', 0.7, 4)
            elif kind == 'candle':
                pixel.glow(arr, x, y, 46 * f, '#ffc850', 0.65, 5)
            elif kind == 'crystal':
                pixel.glow(arr, x, y, 34, '#3098b8', 0.6, 4)
    img = c.render(scale=1, post=post)
    rgb = np.array(img, np.float32)
    if gz > 0.3:
        cm.paste_sprite(rgb, os.path.join(SP, 'grimorio.png'), gx - 34, gy - 38 + bob)
    mpt = wpt(0.287, -0.06, 0.0)
    mx, my, mz = cam.project(mpt)
    if mz > 0.05 and -40 < mx < W + 40 and -50 < my < H + 50:
        hop = abs(math.sin(t * 3.0)) * 2 if read > 0.5 else 0
        cm.paste_sprite(rgb, os.path.join(SP, 'mascota.png'), mx - 20, my - 42 - hop)
    big = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).resize((W * cm.SCALE, H * cm.SCALE), Image.NEAREST).convert('RGBA')
    pages(big, cam, read)
    return big


def page_img(side, read):
    pw, ph = 710, 1000
    im = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    ink, soft, green = (52, 36, 30, 238), (122, 92, 60, 225), (66, 108, 40, 240)
    if side == 0:
        d.text((70, 70), 'TRATADO DE QUÍMICA ORGÁNICA · AMINAS', font=cm.font(cm.SERIF, 20), fill=soft)
        d.text((70, 130), 'Capítulo I', font=cm.font(cm.SERIF_I, 34), fill=soft)
        d.text((70, 180), 'E', font=cm.font(cm.SERIF_B, 88), fill=green)
        d.text((140, 205), 'l par libre', font=cm.font(cm.SERIF_B, 58), fill=ink)
        d.line([(70, 305), (640, 305)], fill=(150, 120, 80, 200), width=2)
        body = ['El nitrógeno de una amina guarda', 'un par de electrones sin compartir:',
                'el par libre.', '', 'Ese par puede atrapar un protón', '(H⁺) y formar un enlace N–H nuevo.',
                'Por eso las aminas son bases.']
        f = cm.font(cm.SERIF, 33)
        for i, line in enumerate(body):
            d.text((70, 340 + i * 50), line, font=f, fill=ink)
        fy = 720
        d.line([(70, fy - 20), (640, fy - 20)], fill=(150, 120, 80, 120), width=1)
        fc = cm.font(cm.SERIF, 38)
        d.text((95, fy + 30), 'CH₃–NH₂  +  H⁺  →  CH₃–NH₃⁺', font=fc, fill=ink)
        d.text((232, fy + 6), '••', font=cm.font(cm.SERIF_B, 30), fill=green)
        d.text((95, fy + 110), 'Base + protón → ácido conjugado', font=cm.font(cm.SERIF_I, 27), fill=soft)
        d.text((330, 930), '— 12 —', font=cm.font(cm.SERIF, 24), fill=soft)
    else:
        d.text((70, 120), 'Detente un momento', font=cm.font(cm.SERIF_I, 34), fill=soft)
        q = ['¿Qué permite que el nitrógeno', 'acepte un H⁺?']
        for i, line in enumerate(q):
            d.text((70, 190 + i * 50), line, font=cm.font(cm.SERIF_B, 37), fill=ink)
        opts = ['Su par de electrones libre', 'Una carga positiva previa', 'Romper un enlace C–H']
        fo = cm.font(cm.SERIF, 32)
        for i, o in enumerate(opts):
            y0 = 340 + i * 115
            chosen = i == 0 and read > 0.35
            d.rounded_rectangle([(70, y0), (640, y0 + 88)], 10, outline=(green if chosen else (150, 120, 80, 200)), width=4 if chosen else 2)
            d.ellipse([(92, y0 + 28), (124, y0 + 60)], outline=ink, width=3)
            if chosen:
                d.ellipse([(99, y0 + 35), (117, y0 + 53)], fill=green)
            d.text((145, y0 + 24), o, font=fo, fill=ink)
        if read > 0.6:
            a = int(min(1, (read - 0.6) / 0.2) * 230)
            d.line([(72, 722), (84, 736), (106, 704)], fill=(66, 108, 40, a), width=5)
            d.text((118, 700), 'Exacto: el par libre forma', font=cm.font(cm.SERIF_B, 32), fill=(66, 108, 40, a))
            d.text((118, 745), 'el nuevo enlace N–H.', font=cm.font(cm.SERIF_B, 32), fill=(66, 108, 40, a))
        d.text((330, 930), '— 13 —', font=cm.font(cm.SERIF, 24), fill=soft)
    return im


def pages(big, cam, read):
    for side, (s0, s1) in enumerate(((-0.226, -0.014), (0.014, 0.226))):
        corners = [wpt(s0, 0.155, 0.002), wpt(s1, 0.155, 0.002), wpt(s1, -0.155, 0.002), wpt(s0, -0.155, 0.002)]
        pr = [cam.project(p) for p in corners]
        if min(z for _, _, z in pr) < 0.05:
            continue
        quad = [(x * cm.SCALE, y * cm.SCALE) for x, y, _ in pr]
        if max(y for _, y in quad) < 0 or min(y for _, y in quad) > H * cm.SCALE:
            continue
        cm.warp_onto(big, page_img(side, read), quad)


def cam_at(k):
    """k = 0 mirando el muro, k = 1 leyendo el tomo."""
    e = ease(k)
    return cm.Cam(EYE, pitch_deg=3 + (-46 - 3) * e, hfov=84 + (70 - 84) * e)


def main():
    frames = []
    seq = []
    n_wall, n_tilt, n_read = 28, 16, 26
    for i in range(n_wall):
        seq.append((0.0, i / (n_wall - 1), 0.0))
    for i in range(n_tilt):
        seq.append((i / (n_tilt - 1), 1.0, 0.0))
    for i in range(n_read):
        seq.append((1.0, 1.0, i / (n_read - 1)))
    for i in range(n_tilt):
        seq.append((1 - i / (n_tilt - 1), 1.0, 1.0))
    keys = {}
    for j, (k, p, rd) in enumerate(seq):
        t = j * 0.09
        img = render(cam_at(k), t, p, rd)
        frames.append(img)
        if j == 20:
            keys['muro'] = img
        if j == n_wall + n_tilt + n_read - 4:
            keys['tomo'] = img
        print('cuadro', j + 1, '/', len(seq), flush=True)
    os.makedirs(cm.OUT, exist_ok=True)
    keys['muro'].convert('RGB').save(os.path.join(cm.OUT, 'aula-muro.png'))
    keys['tomo'].convert('RGB').save(os.path.join(cm.OUT, 'aula-tomo.png'))
    cm.save(frames, 'aula', ms=90)


if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'cuadros':
        os.makedirs(cm.OUT, exist_ok=True)
        render(cam_at(0), 1.0, 0.42, 0).convert('RGB').save(os.path.join(cm.OUT, 'aula-muro.png'))
        render(cam_at(1), 1.0, 1.0, 1.0).convert('RGB').save(os.path.join(cm.OUT, 'aula-tomo.png'))
    else:
        main()
