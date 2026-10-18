"""Cámara de cada ramo (lo que hay al otro lado del portal): cripta circular de piedra con una alcoba por tema.
Al centro, un sauce de cristal (cada rama = un concepto: brote, hojas o flor según el dominio). Cada alcoba tiene su mural
animado, una mesa con un frasco por misión (lleno según la evidencia) y un cristal por concepto que se apaga si toca repasar.
Usa el mismo estilo y las piezas de build_sotano.py (rampas, cristales, letreros, luz) con otra geometría.
Salida: docs/aprender-pasillo/camara-<ramo>.gif (y camara-cuadros[-<ramo>].png con los cuadros clave).
Correr: python tools/aprender-pasillo/build_camara.py [gif|cuadros] [organica|fisico|analitica|fisio]
"""
import math
import os
import random
import sys

import numpy as np

import build_sotano as bs
from build_sotano import Canvas, glow, BAYER, W, H, F, CX, FLOOR
from murales import CAMARA, AW_, AH_

R, DEP, AW = 2.6, 0.75, 1.0             # radio de la cripta, fondo de cada alcoba y medio ancho de su boca
CW, DOME = -1.8, 1.0                     # altura donde termina el muro y cuánto sube la cúpula hacia el centro
PED_R, PED_Y = 0.75, 0.36                # pedestal del sauce
PR = 0.2                                 # radio de los pilares entre alcobas
CTR = 0.38                               # profundidad de la mesa del fondo de cada alcoba
TOP = 0.12                               # altura de la cubierta de la mesa
STAND = 0.45                             # distancia al centro desde donde se mira cada alcoba
TREE_TOP = -1.72

# una alcoba por tema de la PEP 1 (sus murales están en murales.CAMARA); las de la PEP 2, veladas; atrás, el portal.
# jars = frascos por misión (lleno según la evidencia), crystals = 1 al día / 0 toca repasar / None sin empezar,
# ramas = una por concepto en el sauce (brote, verde, flor). Los números son de ejemplo hasta conectar el motor.
RAMOS = {
    'organica': dict(acc='#b6f070', mat='sprout', countdown='PEP 1 · 10 DÍAS', temas=[
        dict(key='aminas', lines=['AMINAS'], hoy=True, jars=[1.0, 1.0, 0.85, 0.6, 0.35, 0.15, 0.0, 0.0],
             crystals=[1, 1, 0, 1, 0, 1], ramas=['flor', 'flor', 'verde', 'verde', 'brote', 'brote']),
        dict(key='aromaticos', lines=['AROMÁTICOS'], hoy=False, jars=[0.55, 0.25, 0.0, 0.0, 0.0, 0.0],
             crystals=[1, 0, 1, 1, 1], ramas=['verde', 'brote', 'brote', 'brote', 'brote']),
        dict(key='heterociclos', lines=['HETEROCICLOS'], hoy=False, jars=[], crystals=[None] * 4, ramas=['brote'] * 4)]),
    'fisico': dict(acc='#b88cf4', mat='arcane', countdown='PEP 1 · 4 DÍAS', temas=[
        dict(key='fq_equilibrio', lines=['EQUILIBRIO'], hoy=True, jars=[1.0, 0.9, 0.7, 0.4, 0.1, 0.0],
             crystals=[1, 1, 0, 1, 1], ramas=['flor', 'verde', 'verde', 'brote', 'brote']),
        dict(key='fq_ionico', lines=['ELECTROLITOS'], hoy=False, jars=[0.6, 0.3, 0.0, 0.0, 0.0],
             crystals=[1, 0, 1, 1], ramas=['verde', 'brote', 'brote', 'brote']),
        dict(key='fq_pila', lines=['ELECTRO-', 'QUÍMICA'], hoy=False, jars=[0.2, 0.0, 0.0, 0.0, 0.0],
             crystals=[0, None, None, None], ramas=['brote'] * 4)]),
    'analitica': dict(acc='#7fe0f0', mat='crystal', countdown='PEP 1 · 27 DÍAS', temas=[
        dict(key='ana_errores', lines=['ERRORES'], hoy=True, jars=[1.0, 0.8, 0.5, 0.2, 0.0],
             crystals=[1, 0, 1, 1], ramas=['flor', 'verde', 'brote', 'brote']),
        dict(key='ana_acidobase', lines=['ÁCIDO-BASE'], hoy=False, jars=[0.7, 0.4, 0.1, 0.0, 0.0, 0.0],
             crystals=[1, 1, 0, 1, 1], ramas=['verde', 'verde', 'brote', 'brote', 'brote']),
        dict(key='ana_polipro', lines=['POLIPRÓTICOS'], hoy=False, jars=[], crystals=[None] * 4, ramas=['brote'] * 4)]),
    'fisio': dict(acc='#ff8a5a', mat='ember', countdown='PEP 1 · 26 DÍAS', temas=[
        dict(key='fisio_potencial', lines=['NERVIOSO'], hoy=True, jars=[1.0, 0.85, 0.6, 0.3, 0.0, 0.0],
             crystals=[1, 1, 0, 1, 0], ramas=['flor', 'verde', 'verde', 'brote', 'brote']),
        dict(key='fisio_resp', lines=['RESPIRATORIO'], hoy=False, jars=[0.5, 0.2, 0.0, 0.0],
             crystals=[1, 0, 1, 1], ramas=['verde', 'brote', 'brote', 'brote']),
        dict(key='fisio_digest', lines=['DIGESTIVO'], hoy=False, jars=[], crystals=[None] * 4, ramas=['brote'] * 4)]),
}
RAMO, ACC, ACCMAT, ALCOVES, COUNTDOWN = None, None, None, [], []
PILLARS = [math.radians(30 + 60 * k) for k in range(6)]


def set_ramo(key):
    """Deja la Cámara lista para el ramo `key`: sus alcobas, su color y su cuenta regresiva."""
    global RAMO, ACC, ACCMAT, ALCOVES, COUNTDOWN
    cfg = RAMOS[key]
    RAMO, ACC, ACCMAT, COUNTDOWN = key, cfg['acc'], cfg['mat'], [cfg['countdown']]
    t = cfg['temas']
    ALCOVES = [dict(t[0], ang=0, kind='tema'), dict(t[1], ang=60, kind='tema'), dict(t[2], ang=-60, kind='tema'),
               dict(key='pep2a', ang=120, kind='velada', lines=['PEP 2', 'EN CAMINO'], ramas=['seca'] * 3),
               dict(key='pep2b', ang=-120, kind='velada', lines=['PEP 2', 'EN CAMINO'], ramas=['seca'] * 3),
               dict(key='portal', ang=180, kind='portal', lines=None, ramas=[])]
    for a in ALCOVES:
        r = math.radians(a['ang'])
        a['s'], a['c'] = math.sin(r), math.cos(r)


set_ramo('organica')


def yarch(u):
    return -0.55 - 0.85 * np.sqrt(np.clip(1 - (u / AW) ** 2, 0, None))


def local(a, X, Z):
    """Coordenadas de la alcoba: d hacia afuera (radial) y u a lo ancho (positivo a la derecha de quien la mira)."""
    return X * a['s'] + Z * a['c'], X * a['c'] - Z * a['s']


def parts(X, Y, Z):
    r = np.hypot(X, Z)
    ceil = CW - DOME * (1 - np.clip(r / R, 0, 1) ** 2)
    room = np.minimum(np.minimum(R - r, FLOOR - Y), Y - ceil)
    alc = []
    for a in ALCOVES:
        d, u = local(a, X, Z)
        g = np.minimum(np.minimum(AW - np.abs(u), R + DEP - d), np.minimum(d - (R - 0.6), np.minimum(FLOOR - Y, Y - yarch(u))))
        alc.append(g)
    pil = np.full(X.shape, 9.0, np.float32)
    for ph in PILLARS:
        pil = np.minimum(pil, np.hypot(X - R * math.sin(ph), Z - R * math.cos(ph)) - PR)
    ped = np.maximum(r - PED_R, PED_Y - Y)
    ctr = np.full(X.shape, 9.0, np.float32)
    for a in ALCOVES:
        if a['kind'] == 'tema':
            d, u = local(a, X, Z)
            ctr = np.minimum(ctr, np.maximum(np.maximum(np.abs(u) - AW - 0.1, np.abs(d - (R + DEP - CTR / 2 + 0.05)) - (CTR / 2 + 0.05)), TOP - Y))
    return room, alc, pil, ped, ctr


def emptiness(X, Y, Z):
    """> 0 en el aire de la cripta, < 0 dentro de la roca."""
    room, alc, pil, ped, ctr = parts(X, Y, Z)
    g = room
    for ga in alc:
        g = np.maximum(g, ga)
    return np.minimum(np.minimum(g, pil), np.minimum(ped, ctr))


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
    step = 0.06
    for _ in range(int(7.6 / step)):
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
class Comp(bs.Compositor):
    """Como el del pasillo, pero además guarda la profundidad de lo pegado (para las ramas del sauce y las motas)."""

    def paste(self, layer, zo, margin=0.3):
        m = (layer.mat != 0) & (zo <= self.t + margin)
        super().paste(layer, zo, margin)
        self.t[m] = np.minimum(self.t[m], zo)


def seed(a):
    return sum(map(ord, a['key']))


def wpt(a, d, u, y):
    return np.array([a['s'] * d + a['c'] * u, y, a['c'] * d - a['s'] * u], np.float32)


def crystal_sites(a):
    """Un cristal por concepto en las paredes laterales de la alcoba (mitad a cada lado)."""
    out = []
    spots = [(R + 0.08, -0.25), (R + 0.2, 0.2), (R + 0.32, -0.38)]
    for i, st in enumerate(a.get('crystals', [])):
        side = 1 if i % 2 == 0 else -1
        d, y = spots[(i // 2) % 3]
        base = wpt(a, d, side * (AW - 0.01), y)
        nrm = wpt(a, -0.75, -side * 0.65, 0)
        nrm = nrm / np.linalg.norm(nrm)
        out.append((base, nrm, st, i))
    return out


def draw_jar(comp, a, d, u, fill, glows, lights):
    P = bs.to_cam(wpt(a, d, u, TOP - 0.075))
    if P[2] < 0.6:
        return
    ly = Canvas(W, H)
    sx, sy, rp = bs.sphere_px(ly, P, 0.075, 'glass', 1.2, lights, spec=0, rim=0.4)
    neck = bs.to_cam(wpt(a, d, u, TOP - 0.13))
    bs.cylinder_px(ly, neck, 0.028, 0.07, 'glass', 2.2, lights, spec=1.2)
    nx, ny = bs.project(neck)
    k = max(1.0, 0.03 * F / P[2])
    ly.rect(nx - k, ny - 0.075 * F / P[2] - k, nx + k + 1, ny - 0.075 * F / P[2] + 1, 'wood', 3.4)
    if fill > 0:
        lit = 3.0 + 2.2 * fill
        bs.sphere_px(ly, P, 0.068, ACCMAT, lit, lights, spec=0.8, rim=0.7, only=lambda dx, dy: dy > 1 - 2 * fill)
        if fill >= 0.8:
            glows.append((sx, sy, rp * 3.2, ACC, 0.35))
    yy, xx = np.mgrid[0:H, 0:W]
    ring_ = np.abs(np.hypot((xx + 0.5 - sx) / rp, (yy + 0.5 - sy) / rp) - 0.93) < 0.12
    ly.mask(ring_, 'glass', 4.6)
    ly.px(sx - rp * 0.45, sy - rp * 0.45, 'petal', 4.0)
    ly.lock |= ly.mat != 0
    comp.paste(ly, float(P[2]), 0.2)


def draw_torch(comp, ph, glows):
    P = bs.to_cam(np.array([(R - PR - 0.04) * math.sin(ph), -0.6, (R - PR - 0.04) * math.cos(ph)], np.float32))
    if P[2] < 0.7:
        return
    ly = Canvas(W, H)
    sx, sy = bs.project(P)
    k = max(1.0, 0.07 * F / P[2])
    ly.rect(sx - k * 0.4, sy + k * 0.2, sx + k * 0.4, sy + k * 2.6, 'brass', 3.4)
    ly.rect(sx - k * 0.9, sy + k * 0.2, sx + k * 0.9, sy + k * 0.8, 'brass', 4.6)
    fl = 1.0 + 0.18 * math.sin(bs.TIME * 7 + ph * 3)
    for (dy, r, lv) in ((-0.2, 1.1, 4.0), (-1.1, 0.8, 5.0), (-1.9, 0.45, 5.8)):
        ly.rect(sx - k * r * fl, sy + k * dy - k * 0.5, sx + k * r * fl, sy + k * dy + k * 0.5, 'flame', lv)
    ly.lock |= ly.mat != 0
    comp.paste(ly, float(P[2]), 0.5)
    glows.append((sx, sy - k, 0.35 * F / P[2] + 8, '#ff9a3c', 0.75 * fl))


def draw_trunk(comp, glows, lights):
    """Tronco del sauce: prisma de cristal que se adelgaza y se tuerce un poco al subir."""
    n = 9
    segs = []
    for k in range(n):
        y0 = PED_Y + (TREE_TOP - PED_Y) * k / n
        hseg = (PED_Y - TREE_TOP) / n
        rad = 0.17 - 0.09 * k / n
        ox = 0.05 * math.sin(k * 0.9)
        P = bs.to_cam(np.array([ox, y0, 0.03 * math.cos(k * 0.7)], np.float32))
        segs.append((P, rad, hseg + 0.01))
    for P, rad, hseg in segs:
        if P[2] < 0.6:
            continue
        ly = Canvas(W, H)
        bs.cylinder_px(ly, P, rad, hseg, 'crystal', 2.6, lights, spec=2.0)
        bs.cylinder_px(ly, P, rad, hseg, 'crystal', 5.6, [], spec=0, only=lambda dx, dy: np.abs(dx + 0.35) < 0.12)
        bs.cylinder_px(ly, P, rad, hseg, 'crystal', 1.4, [], spec=0, only=lambda dx, dy: np.abs(dx - 0.55) < 0.1)
        ly.lock |= ly.mat != 0
        comp.paste(ly, float(P[2]), 0.3)
    top = bs.to_cam(np.array([0, TREE_TOP, 0], np.float32))
    if top[2] > 0.6:
        gx, gy = bs.project(top)
        glows.append((gx, gy, 0.9 * F / top[2], '#9ce8f0', 0.35))
    mid = bs.to_cam(np.array([0, -0.4, 0], np.float32))
    if mid[2] > 0.6:
        gx, gy = bs.project(mid)
        glows.append((gx, gy, 0.7 * F / mid[2], '#5cc4dc', 0.25))


def bez(p0, p1, p2, p3, t):
    return (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t * t * p2 + t ** 3 * p3


def zpx(c, zb, x, y, z, mat, lvl, margin=0.05):
    ix, iy = int(x), int(y)
    if 0 <= ix < W and 0 <= iy < H and z <= zb[iy, ix] + margin:
        c.px(ix, iy, mat, lvl)
        c.lock[iy, ix] = True


def limb(a):
    """Rama gruesa del sauce hacia la alcoba `a`: sale del tronco, sube y se abre."""
    ang = math.radians(a['ang'])
    dv = np.array([math.sin(ang), 0, math.cos(ang)], np.float32)
    y0 = -1.05 - 0.12 * (seed(a) % 5)
    return dv, [np.array([0, y0, 0], np.float32) + dv * 0.08, dv * 0.35 + np.array([0, y0 - 0.55, 0], np.float32),
                dv * 0.75 + np.array([0, -2.25, 0], np.float32), dv * 0.95 + np.array([0, -2.2, 0], np.float32)]


def zline(c, zb, A, B, mat, lv, wpx):
    if A[2] < 0.35 or B[2] < 0.35:
        return
    (ax, ay), (bx, by) = bs.project(A), bs.project(B)
    m = int(max(abs(bx - ax), abs(by - ay))) + 1
    for j in range(m + 1):
        q = j / m
        x, y, z = ax + (bx - ax) * q, ay + (by - ay) * q, A[2] + (B[2] - A[2]) * q
        for o in range(int(wpx)):
            zpx(c, zb, x + o - int(wpx) // 2, y, z, mat, lv + (1.6 if o == 0 and wpx > 1 else 0) - (1.2 if o == int(wpx) - 1 and wpx > 2 else 0))


def draw_ramas(c, zb, glows):
    """Sauce de cristal: una rama gruesa por alcoba y de ella cuelgan mimbres con hojas.
    Cada mimbre de un tema es un concepto: su punta y sus hojas muestran el dominio (brote, hojas verdes o flor)."""
    leafc = {'brote': ('glass', 4.0, 2), 'verde': (ACCMAT, 5.4, 1), 'flor': (ACCMAT, 5.8, 1),
             'relleno': ('glass', 3.2, 1), 'seca': ('crypt', 2.4, 99)}
    for a in ALCOVES:
        dv, L = limb(a)
        lp = [bs.to_cam(bez(*L, k / 16)) for k in range(17)]
        for k in range(16):
            zline(c, zb, lp[k], lp[k + 1], 'crystal' if a['kind'] != 'velada' else 'crypt', 3.4, max(1, 0.05 * (1 - k / 22) * F / max(lp[k][2], 0.4)))
        pos = [((i + 0.5) / len(a['ramas']), st) for i, st in enumerate(a['ramas'])] + [((j + 0.3) / 4, 'relleno') for j in range(4)]
        ramas = [st for _, st in sorted(pos)]
        n = len(ramas)
        for i, st in enumerate(ramas):
            spread = math.radians((i - (n - 1) / 2) * (50.0 / max(n - 1, 1)))
            ang = math.radians(a['ang']) + spread
            dd = np.array([math.sin(ang), 0, math.cos(ang)], np.float32)
            p0 = bez(*L, 0.55 + 0.45 * ((i * 3) % n) / n)
            rr = 1.3 + 0.28 * ((i * 7) % 4)
            yend = -0.82 + 0.1 * ((i * 5) % 4) + (0.35 if st == 'seca' else 0) - (0.25 if st == 'relleno' else 0)
            sw = 0.05 * math.sin(bs.TIME * 0.8 + i * 1.7 + a['ang'])
            p1 = p0 + dd * 0.35 + np.array([0, -0.18, 0], np.float32)
            p2 = dd * rr + np.array([0, float(p0[1]) - 0.05, 0], np.float32)
            p3 = dd * rr + np.array([sw * dd[2], yend, -sw * dd[0]], np.float32)
            pts = [bs.to_cam(bez(p0, p1, p2, p3, k / 32)) for k in range(33)]
            mat, lv = ('crypt', 2.6) if st == 'seca' else ('crystal', 3.0)
            lm, ll, every = leafc[st]
            for k in range(32):
                A, B = pts[k], pts[k + 1]
                zline(c, zb, A, B, mat, lv, 2 if A[2] < 1.2 else 1)
                if k >= 12 and k % every == 0 and B[2] > 0.35:      # hojas a lo largo de la parte que cuelga
                    bx, by = bs.project(B)
                    sd = 1 if k % 4 < 2 else -1
                    s_ = max(2, int(0.05 * F / B[2]))
                    for j in range(1, s_ + 1):
                        zpx(c, zb, bx + sd * j, by + j * 0.5, B[2], lm, ll - 0.5 * j)
                        if s_ > 1:
                            zpx(c, zb, bx + sd * j, by + j * 0.5 + 1, B[2], lm, ll - 1.8)
            E = pts[-1]
            if E[2] < 0.35 or st in ('seca', 'relleno'):
                continue
            ex, ey = bs.project(E)
            s_ = max(1, int(0.06 * F / E[2]))
            if st == 'brote':
                for j in range(s_ + 1):
                    zpx(c, zb, ex, ey + j, E[2], ACCMAT, 4.6 - j * 0.6)
            elif st == 'verde':
                for j in range(-s_, s_ + 1):
                    zpx(c, zb, ex + j, ey + 1, E[2], ACCMAT, 5.4 - abs(j) * 0.8)
                    zpx(c, zb, ex, ey + 1 + abs(j), E[2], ACCMAT, 4.4)
            else:
                pulse = 0.4 * math.sin(bs.TIME * 2.0 + i)
                for j in range(-s_ - 1, s_ + 2):
                    zpx(c, zb, ex + j, ey + 1, E[2], 'petal', 3.8 + pulse)
                    zpx(c, zb, ex, ey + 1 + j, E[2], 'petal', 3.8 + pulse)
                for dx in (-1, 1):
                    for dy in (-1, 1):
                        zpx(c, zb, ex + dx * s_, ey + 1 + dy * s_, E[2], 'petal', 2.8)
                zpx(c, zb, ex, ey + 1, E[2], 'rune', 6.0)
                if E[2] <= zb[int(np.clip(ey, 0, H - 1)), int(np.clip(ex, 0, W - 1))] + 0.1:
                    glows.append((ex, ey + 1, 6 + 0.25 * F / E[2], '#e0fcff', 0.3))


def draw_roots(comp, a):
    """Raíces que cuelgan sobre la boca de una alcoba velada (tema de la PEP 2, aún sin material)."""
    rg = random.Random(seed(a))
    ly = Canvas(W, H)
    zmin = 99.0
    for k in range(18):
        u = rg.uniform(-AW + 0.05, AW - 0.05)
        y0 = float(yarch(np.array(u))) + 0.03
        ln = rg.uniform(0.5, 1.6)
        d0 = R + rg.uniform(0.02, 0.25)
        pts = [bs.to_cam(wpt(a, d0, u + 0.06 * math.sin(j * 0.9 + k), y0 + ln * j / 8)) for j in range(9)]
        for j in range(8):
            A, B = pts[j], pts[j + 1]
            if A[2] < 0.6 or B[2] < 0.6:
                continue
            zmin = min(zmin, float(A[2]))
            (ax, ay), (bx, by) = bs.project(A), bs.project(B)
            wpx = 0.03 * (1 - j / 9) * F / A[2]
            ly.line(ax, ay, bx, by, 'wood', 2.0)
            if wpx >= 0.9:
                ly.line(ax - wpx * 0.5, ay, bx - wpx * 0.5, by, 'wood', 3.2)
            if j % 3 == 2 and wpx >= 0.9:
                ly.px(bx, by, 'sprout', 4.6)
    if zmin < 99:
        comp.paste(ly, zmin, 0.6)


def draw_motes(c, zb):
    rg = np.random.RandomState(5)
    base = rg.rand(60, 3)
    for k in range(60):
        ang = base[k, 0] * 2 * math.pi + 0.05 * math.sin(bs.TIME * 0.6 + k)
        rad = 0.4 + base[k, 1] * 2.0
        y = 0.6 - ((base[k, 2] * 2.8 + bs.TIME * 0.06 * (0.5 + base[k, 1])) % 2.8)
        P = bs.to_cam(np.array([rad * math.sin(ang), y, rad * math.cos(ang)], np.float32))
        if P[2] < 0.6:
            continue
        sx, sy = bs.project(P)
        zpx(c, zb, sx, sy, P[2], 'crystal' if k % 3 else ACCMAT, 6.2)


def mural_tex(m, pm):
    """Mural `m` (textura de códigos); si en pantalla queda más chico que la textura, engrosa los trazos."""
    cols = np.where(pm.any(0))[0]
    if len(cols) and (cols[-1] - cols[0] + 1) < AW_ * 0.95:
        g = m.copy()
        g[:, 1:] = np.maximum(g[:, 1:], m[:, :-1])
        g[1:, :] = np.maximum(g[1:, :], m[:-1, :] * (m[:-1, :] > 0))
        m = np.where(m > 0, m, g)
    return m


# ---------- cuadro ----------
def build(swirl=0.0, flash=0.0, scale=3):
    Pw, t, Plo = march()
    X, Y, Z = Pw[..., 0], Pw[..., 1], Pw[..., 2]
    yy, xx = np.mgrid[0:H, 0:W]
    N = normals(Pw)
    room, alc, pil, ped, ctr = parts(Plo[..., 0], Plo[..., 1], Plo[..., 2])
    region = np.argmax(np.stack([room] + alc), axis=0)          # 0 sala, k+1 alcoba k
    _, _, pil_h, ped_h, ctr_h = parts(X, Y, Z)
    is_pil = pil_h < 0.02
    is_ped = (ped_h < 0.02) & ~is_pil
    is_ctr = (ctr_h < 0.02) & ~is_pil & ~is_ped
    r = np.hypot(X, Z)
    th = np.arctan2(X, Z)
    floor = N[..., 1] < -0.7
    ceil = N[..., 1] > 0.45
    wall = ~floor & ~ceil

    # ----- luces -----
    cold = np.zeros((H, W), np.float32)
    warm = np.zeros((H, W), np.float32)

    def add(lpos, inten, acc):
        Lv = np.array(lpos, np.float32)[None, None, :] - Pw
        d2 = (Lv ** 2).sum(-1) + 1e-4
        nd = np.clip((Lv * N).sum(-1) / np.sqrt(d2), 0, 1)
        acc += inten * (0.25 + 0.75 * nd) / (d2 + 0.35)
    add((0, -0.9, 0), 2.0, cold)
    add((0, -1.9, 0), 1.0, cold)
    for a in ALCOVES:
        if a['kind'] == 'tema':
            add(wpt(a, R + DEP - 0.55, 0, -0.55), 1.9 if a['hoy'] else 1.1, warm)
            for base, nrm, st, _ in crystal_sites(a):
                if st:
                    add(base + nrm * 0.18, 0.35, cold)
        elif a['kind'] == 'portal':
            add(wpt(a, R + DEP - 0.3, 0, -0.3), 1.6, cold)
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
        sel = region == k + 1
        ld = np.where(sel, d_, ld)
        lu = np.where(sel, u_, lu)
    in_alc = (region > 0) | is_ctr
    for k, a in enumerate(ALCOVES):                               # la mesa toma las coordenadas de su alcoba
        d_, u_ = local(a, X, Z)
        sel = is_ctr & (np.abs(u_) < AW + 0.15) & (d_ > R)
        ld = np.where(sel, d_, ld)
        lu = np.where(sel, u_, lu)
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

    # costillas de la cúpula sobre cada pilar, moho y tubería de latón a lo largo del muro
    rib = ceil & ~in_alc & (np.min(np.stack([np.abs(np.angle(np.exp(1j * (th - ph)))) for ph in PILLARS]), 0) * r < 0.1)
    c.mask(rib, 'crypt', np.clip(lum * 5.4 + 1.2, 0, 7).astype(np.float32))
    nz_ = np.sin(u * 5.1 + v * 3.7) * np.sin(u * 2.9 - v * 6.3)
    moss = ((wall & (Y > 0.3)) | (floor & (ao < 0.8))) & (nz_ > 0.45) & ~is_ped & ~is_ctr
    c.mask(moss, 'shade', np.clip(lum * 2.4 + 2.2, 1, 5).astype(np.float32))
    c.mask(moss & (bs.hash2(xx * 1.0, yy * 1.0) > 0.82), 'sprout', 3.4)
    tt = (Y - 0.5) / 0.045
    pipe = wall & ~in_alc & ~is_pil & ~is_ped & (np.abs(tt) < 1)
    c.mask(pipe, 'brass', np.clip(0.6 + lum * 1.4 + 2.2 * np.sqrt(np.clip(1 - tt ** 2, 0, 1)) - 0.7 * tt, 0.6, 4.4).astype(np.float32))

    # pedestal del sauce: canto superior y la cuenta regresiva de la PEP grabada en la piedra
    pside = is_ped & wall
    c.mask(is_ped & floor, 'stone', np.clip(lum * 3 + 1.0, 0.6, 4).astype(np.float32))
    c.mask(pside & (Y < PED_Y + 0.04), 'stone', np.clip(lum * 4 + 2.6, 2, 6).astype(np.float32))
    band = pside & (Y > 0.42) & (Y < 0.62)
    half = 0.66
    ua = PED_R * np.angle(np.exp(1j * (math.pi - th)))
    tex_c = bs.sign_texture(COUNTDOWN, 168, 16)
    pu = np.clip(((ua + half) / (2 * half) * 168).astype(int), 0, 167)
    pv = np.clip(((Y - 0.42) / 0.2 * 16).astype(int), 0, 15)
    code = tex_c[pv, pu]
    band = band & (np.abs(ua) < half)
    slab = np.clip(lum * 3.0 + 2.6, 2.2, 5.4).astype(np.float32)
    c.mask(band, 'stone', slab)
    c.mask(band & (code == 1), 'stone', slab + 1.3)
    c.mask(band & (code == 8), 'stone', np.clip(slab - 2.2, 0.6, 4))
    c.mask(band & (code == 7), 'stone', slab + 1.6)
    c.mask(band & (code == 2), 'rune', 4.6 + 1.0 * bs.PULSE)
    c.mask(band & (code == 6), 'rune', 2.4)
    c.lock |= band & ((code == 2) | (code == 6))

    # ----- alcobas: arco, letrero, mural o portal -----
    room_wall = wall & (region == 0) & ~is_pil & ~is_ped
    for k, a in enumerate(ALCOVES):
        d_, u_ = local(a, X, Z)
        front = d_ > 0
        mine = region == k + 1
        hoy = a.get('hoy', False)
        dimk = 0.45 if a['kind'] == 'velada' else 1.0
        frame = room_wall & front & (np.abs(u_) < AW + 0.13) & (Y > -0.55 - 0.97 * np.sqrt(np.clip(1 - (u_ / (AW + 0.13)) ** 2, 0, None)) - 0.02)
        c.mask(frame, 'stone', np.clip(lum * 4 + 3.0, 2.6, 6).astype(np.float32))
        c.mask(frame & ((np.floor(np.arctan2(Y + 0.55, u_) * 5.5) % 2) == 0), 'stone', np.clip(lum * 4 + 2.2, 2, 5.4).astype(np.float32))
        c.lock |= frame
        if a['kind'] == 'tema':
            inl = frame & (np.abs(np.hypot(u_ / (AW + 0.04), np.clip(-(Y + 0.55), 0, None) / 0.89) - 1) < 0.035)
            c.mask(inl, ACCMAT, (5.0 if hoy else 3.8) + (1.4 if hoy else 0.6) * bs.PULSE)
        if a['lines']:
            plate = room_wall & front & (np.abs(u_) < 0.95) & (Y > -1.77) & (Y < -1.47)
            pu = np.clip(((u_ + 0.95) / 1.9 * bs.SIGN_W).astype(int), 0, bs.SIGN_W - 1)
            pv = np.clip(((Y + 1.77) / 0.3 * bs.SIGN_H).astype(int), 0, bs.SIGN_H - 1)
            code = bs.sign_texture(a['lines'])[pv, pu]
            slab = np.clip(lum * 3.0 + 3.0, 2.4, 5.6).astype(np.float32)
            c.mask(plate, 'stone', slab)
            c.mask(plate & (code == 1), 'stone', slab + 1.3)
            c.mask(plate & (code == 8), 'stone', np.clip(slab - 2.2, 0.6, 4))
            c.mask(plate & (code == 7), 'stone', slab + 1.6)
            lmat = ACCMAT if a['kind'] == 'tema' else 'glow'
            c.mask(plate & (code == 2), lmat, ((5.2 + 1.4 * bs.PULSE) if hoy else (4.2 + 0.8 * bs.PULSE)) * dimk)
            c.mask(plate & (code == 6), lmat, 2.6 * dimk)
            c.lock |= plate & ((code == 2) | (code == 6))
        back = mine & wall & (d_ > R + DEP - 0.03)
        if a['kind'] == 'tema':
            mu0, mu1, my0, my1 = -0.74, 0.74, -1.1, 0.0
            pm = back & (u_ > mu0) & (u_ < mu1) & (Y > my0) & (Y < my1)
            if pm.any():
                edge = np.minimum(np.minimum(u_ - mu0, mu1 - u_), np.minimum(Y - my0, my1 - Y))
                rim_l = pm & (edge < 0.04) & (((u_ - mu0) < 0.04) | ((Y - my0) < 0.04))
                c.mask(rim_l, 'stone', np.clip(lum * 3 + 3.8, 3, 6).astype(np.float32))
                c.mask(pm & (edge < 0.04) & ~rim_l, 'stone', 1.2)
                inner = pm & (edge >= 0.04)
                tx = np.clip(((u_ - mu0 - 0.04) / (mu1 - mu0 - 0.08) * AW_).astype(int), 0, AW_ - 1)
                ty = np.clip(((Y - my0 - 0.04) / (my1 - my0 - 0.08) * AH_).astype(int), 0, AH_ - 1)
                mc = mural_tex(CAMARA[a['key']](bs.TIME), pm)[ty, tx]
                c.mask(inner, 'crypt', np.clip(lum * 1.2 + 1.0, 0.6, 2.4).astype(np.float32))
                for cd, (mat_, lv_) in bs.mural_colors(bs.THEMES[RAMO]).items():
                    mk = inner & (mc == cd)
                    c.mask(mk, mat_, lv_)
                    c.lock |= mk
                pc_ = bs.to_cam(wpt(a, R + DEP - 0.05, 0, -0.65))
                if pc_[2] > 0.8:
                    gx_, gy_ = bs.project(pc_)
                    glows.append((gx_, gy_, 0.75 * F / pc_[2], ACC, 0.3 if hoy else 0.18))
            # cubierta de la mesa: canto con luz
            ctop = is_ctr & floor & (np.abs(u_) < AW + 0.15) & front
            c.mask(ctop, 'stone', np.clip(lum * 4 + 2.0, 1.6, 5.4).astype(np.float32))
            c.mask(is_ctr & wall & front & (np.abs(Y - TOP) < 0.03) & (np.abs(u_) < AW + 0.15), 'stone', np.clip(lum * 4 + 3.4, 3, 6).astype(np.float32))
        elif a['kind'] == 'portal':
            pm = back & (Y > -1.35)
            px_, py_ = u_ / 0.7, (Y + 0.35) / 0.95
            rr = np.clip(np.hypot(px_, py_), 0.02, 3.0)
            theta = np.arctan2(py_, px_)
            lr = np.log(rr + 0.07)
            val = 0.55 + 0.30 * np.sin(3 * theta + 5.0 * lr - bs.TIME * 2.6) + 0.15 * np.sin(14 * lr + bs.TIME * 3.4)
            g = np.clip(1.3 + 3.6 * val + 2.6 * np.exp(-rr ** 2 * 6) - 1.4 * np.clip(rr - 0.9, 0, 1), 0.4, 7).astype(np.float32)
            c.mask(pm, ACCMAT, g)
            c.lock |= pm
            pc_ = bs.to_cam(wpt(a, R + DEP - 0.1, 0, -0.35))
            if pc_[2] > 0.8:
                gx_, gy_ = bs.project(pc_)
                glows.append((gx_, gy_, 1.0 * F / pc_[2], ACC, 0.45))
        if a['kind'] == 'tema':
            mouth = bs.to_cam(wpt(a, R, 0, -0.4))
            if mouth[2] > 0.8:
                gx_, gy_ = bs.project(mouth)
                glows.append((gx_, gy_, 1.1 * F / mouth[2], ACC, 0.32 if hoy else 0.14))

    # ----- objetos de lejos a cerca -----
    zb = t.copy()
    comp = Comp(c, zb)
    obj_lights = [(bs.to_cam(np.array([0, -0.9, 0], np.float32)), 2.0)]
    obj_lights += [(bs.to_cam(wpt(a, R + DEP - 0.55, 0, -0.55)), 1.6) for a in ALCOVES if a['kind'] == 'tema']
    items = []
    for a in ALCOVES:
        for base, nrm, st, i in crystal_sites(a):
            items.append((float(bs.to_cam(base)[2]), 'cr', (a, base, nrm, st, i)))
        for j, fill in enumerate(a.get('jars', [])):
            n = len(a['jars'])
            uj = -0.82 + 1.64 * (j + 0.5) / n
            items.append((float(bs.to_cam(wpt(a, R + DEP - 0.18, uj, 0))[2]), 'ja', (a, R + DEP - 0.18, uj, fill)))
        if a['kind'] == 'velada':
            items.append((float(bs.to_cam(wpt(a, R, 0, 0))[2]), 'ro', a))
    for ph in PILLARS:
        items.append((float(bs.to_cam(np.array([R * math.sin(ph), 0, R * math.cos(ph)], np.float32))[2]), 'to', ph))
    items.append((float(bs.to_cam(np.zeros(3, np.float32))[2]), 'tr', None))
    for zc_, tipo, data in sorted(items, key=lambda it: -it[0]):
        if zc_ < 0.5:
            continue
        if tipo == 'cr':
            a, base, nrm, st, i = data
            up, rad = np.array([0, 1, 0], np.float32), wpt(a, 1, 0, 0)
            lit = 1.0 if st == 1 else (0.36 + 0.08 * math.sin(bs.TIME * 2.2 + i) if st == 0 else 0.22)
            bs.draw_crystal(comp, bs.to_cam(base), bs.camdir(nrm), [bs.camdir(up), bs.camdir(rad)], 'w', 'crystal', glows,
                            random.Random(seed(a) + i), lit, size=0.85, bed=False)
        elif tipo == 'ja':
            a, d, uj, fill = data
            lt = sorted(obj_lights, key=lambda l: float(np.linalg.norm(l[0] - bs.to_cam(wpt(a, d, uj, 0)))))[:2]
            draw_jar(comp, a, d, uj, fill, glows, lt)
        elif tipo == 'ro':
            draw_roots(comp, data)
        elif tipo == 'to':
            draw_torch(comp, data, glows)
        else:
            draw_trunk(comp, glows, obj_lights)
    draw_ramas(c, zb, glows)
    draw_motes(c, zb)

    # ----- luz de color, neblina (más espesa en las alcobas veladas), halos y llegada desde el remolino -----
    cold_q = 1 - np.exp(-cold * 1.1)
    warm_q = 1 - np.exp(-warm * 1.1)
    bay = BAYER[yy % 4, xx % 4] + 0.47
    nz1 = 0.5 + 0.5 * np.sin(X * 2.0 + bs.TIME * 0.5) * np.sin(Z * 1.3 - bs.TIME * 0.4)
    nz2 = 0.5 + 0.5 * np.sin(X * 3.1 - bs.TIME * 0.7 + Z * 0.8) * np.sin(Z * 2.2 + bs.TIME * 0.3)
    far = np.clip((t - 1.2) * 0.05, 0, 0.45) * (0.55 + 0.45 * nz1)
    low = 0.28 * np.exp(-np.clip(FLOOR - Y, 0, 5) / 0.22) * (0.4 + 0.6 * nz2)
    veil = np.zeros((H, W), np.float32)
    for k, a in enumerate(ALCOVES):
        if a['kind'] == 'velada':
            d_, _ = local(a, X, Z)
            veil = np.where(region == k + 1, np.clip((d_ - R + 0.2) * 0.9, 0, 0.7) * (0.75 + 0.25 * nz2), veil)
    fog_f = np.clip((far + low) * bs.STYLE['fog'] + veil, 0, 0.75).astype(np.float32)
    sw_m = None
    if swirl > 0:
        sx_, sy_ = (xx + 0.5 - CX) / 70.0, (yy + 0.5 - bs.CY) / 70.0
        rr = np.clip(np.hypot(sx_, sy_), 0.02, 9) * (1 + 3 * (1 - swirl))
        theta = np.arctan2(sy_, sx_)
        lr = np.log(rr + 0.07)
        val = 0.55 + 0.30 * np.sin(3 * theta + 5.0 * lr - bs.TIME * 2.6) + 0.15 * np.sin(14 * lr + bs.TIME * 3.4)
        gsw = np.clip(0.2 + 3.4 * val + 3.0 * np.exp(-rr ** 2 * 6) - 1.2 * np.clip(rr - 1.2, 0, 2), 0.2, 7).astype(np.float32)
        sw_m = np.hypot(sx_, sy_) * (0.75 + 0.5 * bay) > (1 - swirl) * 3.2
        c.mask(sw_m, ACCMAT, gsw)
        c.lock |= sw_m

    def post(arr):
        for f_, col, k in ((cold_q, (60, 190, 170), 0.2 * bs.STYLE['coldk']), (warm_q, (255, 170, 80), 0.28 * bs.STYLE['warmk'])):
            q = np.floor(f_ * 4 + bay * 0.6) / 4
            if sw_m is not None:
                q = np.where(sw_m, 0, q)
            arr += q[..., None] * np.array(col, np.float32)[None, None, :] * k
        fz = fog_f if sw_m is None else np.where(sw_m, 0, fog_f)
        arr[...] = arr * (1 - fz[..., None]) + np.array([46, 96, 92], np.float32)[None, None, :] * fz[..., None]
        for (gx, gy, rad, col, s_) in glows:
            glow(arr, gx, gy, rad, col, s_ * bs.STYLE['glow'], 4)
        arr[...] = 255.0 * (np.clip(arr, 0, 255) / 255.0) ** bs.STYLE['tone']
        if flash > 0:
            arr[...] = arr * (1 - flash) + (0.55 * 255 + 0.45 * np.array([int(ACC[i:i + 2], 16) for i in (1, 3, 5)], np.float32)) * flash
    return c.render(scale, post)


# ---------- recorrido ----------
def ease(u):
    u = min(max(u, 0.0), 1.0)
    return u * u * (3 - 2 * u)


def orbit(phi_deg):
    p = math.radians(phi_deg)
    return STAND * math.sin(p), STAND * math.cos(p), p


def recorrido():
    """(x, z, giro, balanceo, inclinación, remolino, destello) por cuadro."""
    LOOK = 0.12                                              # vista algo levantada para ver letrero, mural y mesa
    seq = []
    z0 = -(R + 0.35)
    for i in range(9):                                       # sale del remolino: el portal queda atrás
        u = ease(i / 8)
        seq.append((0, z0 + 0.35 * u, 0, 0, 0.16, 1 - u, 0.45 * (1 - u)))
    seq += [(0, z0 + 0.35, 0, 0, 0.16, 0, 0)] * 8
    zs = z0 + 0.35
    n = 22                                                   # rodea el sauce por la derecha hasta quedar frente a Aminas (lo de hoy)
    for i in range(1, n + 1):
        u = ease(i / n)
        x = 1.25 * math.sin(math.pi * u) ** 0.8
        z = zs + (STAND - zs) * u
        yaw = math.atan2(0 - x, R + DEP - z) * (1 - u)
        seq.append((x, z, yaw, 1.6 * abs(math.sin(math.pi * 3 * i / n)), 0.16 + (LOOK - 0.16) * u, 0, 0))
    seq += [(0, STAND, 0, 0, LOOK, 0, 0)] * 10
    zt = R - 0.5                                            # un toque: se acerca a la mesa de la alcoba
    for i in range(1, 9):
        u = ease(i / 8)
        seq.append((0, STAND + (zt - STAND) * u, 0, 1.2 * math.sin(math.pi * u), LOOK - 0.06 * u, 0, 0))
    seq += [(0, zt, 0, 0, LOOK - 0.06, 0, 0)] * 14
    for i in range(1, 9):
        u = ease(i / 8)
        seq.append((0, zt + (STAND - zt) * u, 0, 1.2 * math.sin(math.pi * u), LOOK - 0.06 * (1 - u), 0, 0))
    for a0, a1, nn in ((0, 60, 14), (60, -60, 22), (-60, -120, 12)):
        for i in range(1, nn + 1):
            x, z, p = orbit(a0 + (a1 - a0) * ease(i / nn))
            seq.append((x, z, p, 0.8 * math.sin(math.pi * i / nn), LOOK, 0, 0))
        x, z, p = orbit(a1)
        seq += [(x, z, p, 0, LOOK, 0, 0)] * (14 if a1 != -120 else 10)
    return seq


def render_seq(seq, scale=3):
    frames = []
    for i, (x, z, yaw, bob, pitch, sw, fl) in enumerate(seq):
        bs.set_cam(x, z, yaw, bob + 0.5 * math.sin(i * 0.4), pitch, i * 0.45)
        frames.append(build(sw, fl, scale))
        print(i + 1, '/', len(seq), flush=True)
    return frames


def cuadros(scale=2):
    """Cuadros clave lado a lado (para revisar sin abrir el GIF)."""
    from PIL import Image
    seq = recorrido()
    keys = [4, 16, 48, 70, 106, 135]
    imgs = []
    for i in keys:
        x, z, yaw, bob, pitch, sw, fl = seq[i]
        bs.set_cam(x, z, yaw, bob, pitch, i * 0.45)
        imgs.append(build(sw, fl, scale))
    w, h = imgs[0].size
    sheet = Image.new('RGB', (w * 2, h * 3))
    for k, im in enumerate(imgs):
        sheet.paste(im, ((k % 2) * w, (k // 2) * h))
    sheet.save(os.path.join(bs.OUT, 'camara-cuadros.png' if RAMO == 'organica' else 'camara-cuadros-' + RAMO + '.png'))


if __name__ == '__main__':
    os.makedirs(bs.OUT, exist_ok=True)
    which = sys.argv[1] if len(sys.argv) > 1 else 'gif'
    set_ramo(sys.argv[2] if len(sys.argv) > 2 else 'organica')
    if which == 'cuadros':
        cuadros()
    else:
        fr = render_seq(recorrido())
        pal = [f.convert('P', palette=0, colors=140) for f in fr]
        pal[0].save(os.path.join(bs.OUT, 'camara-' + RAMO + '.gif'), save_all=True, append_images=pal[1:], duration=[80] * len(pal), loop=0)
    print('listo')
