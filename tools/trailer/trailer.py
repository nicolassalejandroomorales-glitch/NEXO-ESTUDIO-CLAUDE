"""Tráiler épico de la beta de Nexo (docs/trailer/SPEC.md): vertical 1080x1920, 30 fps, ~46 s, orquesta propia.
Todo el arte se dibuja para el tráiler (arte.py, pasillo.py) a 180x320 y se agranda x6; los letreros son de piedra tallada (letras.py).
Uso:  python tools/trailer/trailer.py [--preview] [--out ruta.mp4]"""
import argparse
import base64
import hashlib
import json
import math
import os
import subprocess
import sys
import tempfile
import wave

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import arte as A  # noqa: E402
import letras as L  # noqa: E402
import musica  # noqa: E402
import pasillo  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
W, H, P, FPS, DUR = 1080, 1920, 6, 30, 46.5
AW, AH = A.AW, A.AH
TMP = tempfile.gettempdir()


def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def ease(u):
    u = clamp(u)
    return u * u * (3 - 2 * u)


def snap(v):
    return int(round(v / P)) * P


# ——— composición ———
def up(img):
    return img.resize((img.width * P, img.height * P), Image.NEAREST)


def scaled(img, a):
    return img if a >= 0.999 else img.point(lambda v: int(v * a))


def add_light(frame, light, a, x, y):
    if a <= 0.01:
        return
    x0, y0, x1, y1 = max(0, x), max(0, y), min(frame.width, x + light.width), min(frame.height, y + light.height)
    if x1 <= x0 or y1 <= y0:
        return
    region = frame.crop((x0, y0, x1, y1))
    frame.paste(ImageChops.add(region, scaled(light.crop((x0 - x, y0 - y, x1 - x, y1 - y)), a)), (x0, y0))


def paste(frame, img, x, y, a=1.0):
    if a > 0.01:
        frame.paste(img, (int(x), int(y)), scaled(img.getchannel('A'), a))


def sign(f, lines, luz, k, cx, cy, t, t0, t1=99.0, ign=0.6, bloom=1.0):
    """Letrero de piedra: cae, se enciende de izquierda a derecha y se apaga al salir."""
    if t < t0 or t > t1:
        return
    lines = tuple(lines)
    step = L.ignite_step(t, t0 + 0.1, ign)
    big, glow, pad = L.sign_scaled(lines, luz, step, k)
    a = min(1.0, (t - t0) / 0.08) * min(1.0, (t1 - t) / 0.2)
    x = snap(cx - big.width / 2)
    y = snap(cy - big.height / 2) - snap(30 * (1 - ease((t - t0) / 0.16)))
    add_light(f, glow, bloom * a * (0.85 + 0.15 * math.sin(t * 5)) * step / 20, x - pad, y - pad)
    paste(f, big, x, y, a)


def motas(img, t, n, cols, speed=12.0, seed=1, y0=0, y1=AH):
    """Partículas que suben (brasas, polvo, chispas de cristal) en el arte chico."""
    r = np.random.default_rng(seed)
    xs, sp, off, ph, fr = r.uniform(0, AW, n), r.uniform(0.5, 1.5, n), r.uniform(0, y1 - y0, n), r.uniform(0, 6.3, n), r.uniform(.5, 2, n)
    d = ImageDraw.Draw(img)
    for i in range(n):
        y = y1 - ((off[i] + t * sp[i] * speed) % (y1 - y0))
        x = xs[i] + 3 * math.sin(t * fr[i] + ph[i])
        fl = 0.5 + 0.5 * math.sin(t * 6 * fr[i] + ph[i])
        if fl > 0.25:
            d.point((int(x), int(y)), fill=cols[min(len(cols) - 1, int(fl * len(cols)))])


def chispas(img, t, t0, cx, cy, n=30, speed=90, cols=((255, 240, 160), (255, 200, 90), (255, 255, 255)), seed=1, life=1.0, grav=60):
    dt = t - t0
    if dt < 0 or dt > life:
        return
    r = np.random.default_rng(seed)
    ang, sp, sz = r.uniform(0, 2 * math.pi, n), r.uniform(.3, 1, n) * speed, r.choice([1, 1, 2, 2, 3], n)
    k = 3.0
    dist = (1 - math.exp(-k * dt)) / k
    fade = 1 - dt / life
    d = ImageDraw.Draw(img)
    for i in range(n):
        x = cx + math.cos(ang[i]) * sp[i] * dist
        y = cy + math.sin(ang[i]) * sp[i] * dist + grav * dt * dt
        s = max(1, int(sz[i] * fade + 0.5))
        c = cols[i % len(cols)]
        d.rectangle([int(x), int(y), int(x) + s - 1, int(y) + s - 1], fill=tuple(int(v * (0.5 + 0.5 * fade)) for v in c))


def shockwave(frame, t, t0, cx, cy, dur=0.6, color=(255, 210, 140), rmax=1300):
    dt = t - t0
    if dt < 0 or dt > dur:
        return
    q = 3
    ring = Image.new('RGB', (W // q, H // q))
    r = (dt / dur) ** 0.6 * rmax / q
    ImageDraw.Draw(ring).ellipse([cx / q - r, cy / q - r, cx / q + r, cy / q + r], outline=color, width=max(1, int(30 * (1 - dt / dur) / q)))
    add_light(frame, ring.filter(ImageFilter.GaussianBlur(2)).resize((W, H), Image.BILINEAR), 1 - dt / dur, 0, 0)


def tint(img, mul, add=(0, 0, 0)):
    a = np.asarray(img, np.float32) * np.array(mul, np.float32) + np.array(add, np.float32)
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGB')


def label(text, ramp, k=2, tiny=False):
    """Texto flotante del arte chico (daño, XP) con contorno."""
    w = (len(text) * (4 if tiny else 6) + 4) * k
    c = A.Art(w, 11 * k)
    c.text(text, w / 2, 2, ramp, 5, tiny=tiny, k=k)
    c.outline('night', 0)
    return c.image()


def make_rays():
    s = 600
    m = Image.new('L', (s, s))
    d = ImageDraw.Draw(m)
    for i in range(18):
        a0 = i / 18 * 2 * math.pi
        w = 0.06 + 0.05 * ((i * 7) % 3)
        d.polygon([(s / 2, s / 2)] + [(s / 2 + s * math.cos(a0 + da), s / 2 + s * math.sin(a0 + da)) for da in (-w, w)], fill=150 if i % 2 else 90)
    m = m.filter(ImageFilter.GaussianBlur(5))
    yy, xx = np.mgrid[0:s, 0:s]
    fall = np.clip(1 - np.sqrt((xx - s / 2) ** 2 + (yy - s / 2) ** 2) / (s / 2), 0, 1) ** 1.4
    m = Image.fromarray((np.asarray(m, np.float32) * fall).astype(np.uint8))
    out = Image.new('RGB', (s, s))
    out.paste(Image.new('RGB', (s, s), (255, 190, 110)), (0, 0), m)
    return out


def rays(frame, angle, cx, cy, a, size=2600):
    r = RAYS.rotate(angle, resample=Image.BILINEAR).resize((size, size), Image.BILINEAR)
    add_light(frame, r, a, cx - size // 2, cy - size // 2)


def load_mascots():
    path = os.path.join(TMP, 'nexo-trailer-mascotas.json')
    subprocess.run(['node', os.path.join(HERE, 'mascotas.cjs'), path], check=True)
    d = json.load(open(path))
    return {k: [Image.frombytes('RGBA', (d['W'], d['H']), base64.b64decode(f)) for f in v] for k, v in d['frames'].items()}


def mascota(kind, pose, t):
    return MASC[f'{kind}-{pose}'][int(t * FPS) % 60]


WARM = ((255, 214, 150), (255, 180, 90), (255, 240, 200))
CRYS = ((156, 232, 240), (92, 196, 220), (224, 252, 255))
EMBER = ((255, 120, 60), (255, 190, 80), (220, 60, 40))


# ——— escenas ———
def sc_examen(t):
    a = A.escena_examen(t)
    motas(a, t, 26, WARM, speed=5, seed=2, y0=100, y1=320)
    z = 1 + 0.05 * ease(t / 4.2)
    cw, ch = AW / z, AH / z
    f = a.crop((int((AW - cw) / 2), int((AH - ch) * 0.7), int((AW - cw) / 2 + cw), int((AH - ch) * 0.7 + ch))).resize((W, H), Image.NEAREST)
    sign(f, ('¿CANSADO', 'DE NO PODER', 'ASPIRAR AL 7', 'EN LAS PEP?'), 'cristal', 2, 540, 396, t, 0.3, 4.15, ign=1.6)
    return f


def sc_caos(t):
    a = A.escena_caos(t)
    f = up(a)
    if t < 8.0:
        sign(f, ('¿NO TE', 'ORGANIZAS', 'BIEN?'), 'cristal', 2, 540, 1680, t, 4.5, 7.95, ign=0.8)
    else:
        sign(f, ('NEXO',), 'oro', 4, 540, 192, t, 8.0, ign=0.35, bloom=1.4)
        sign(f, ('LO HACE', 'POR TI.'), 'oro', 2, 540, 1668, t, 8.45, ign=0.5)
        shockwave(f, t, 8.0, 540, 900, color=(150, 230, 240))
    return f


def sc_pasillo(t):
    u = t - 10.5
    a = pasillo.frame('pasos', u) if u < 4.0 else pasillo.frame('puerta', u - 4.0)
    f = up(a)
    sign(f, ('UNA PUERTA', 'POR CADA RAMO'), 'cristal', 2, 540, 300, t, 11.0, 14.3, ign=0.7)
    return f


def sc_combate(t):
    u = t - 19.0
    a = tint(pasillo.frame('combate', u, loop=True), (0.62, 0.74, 0.66))
    motas(a, t, 30, CRYS, speed=8, seed=4)
    hit_t = 22.9
    hit = max(0.0, 1 - (t - hit_t) / 0.3) if t >= hit_t else 0.0
    if t < 23.6:
        rise = 1 - ease(u / 0.8)
        m = A.amina(u, hit)
        knock = int(8 * hit)
        a.paste(m, (42 + knock, 66 + int(90 * rise)), m.point(lambda v: int(v * (1 - rise * 0.8))) if rise > 0 else m)
    chispas(a, t, 23.6, 90, 114, n=70, speed=140, cols=CRYS + ((184, 140, 244),), seed=6, life=1.2)
    chispas(a, t, hit_t, 90, 114, n=40, speed=110, seed=7, life=0.8)
    if t >= 20.9:
        frac = 1.0 if t < hit_t else max(0.0, 1 - (t - hit_t) / 0.45)
        hb = A.barra_vida('AMINA SALVAJE', frac)
        a.paste(hb, (30, 50), hb)
    if t >= 21.0:
        b = A.banda('¿CUÁL ES MÁS BÁSICA?')
        a.paste(b, (4 - int(180 * (1 - ease((t - 21.0) / 0.25))), 186), b)
    for i, (nombre, icono) in enumerate(A.CARTAS):
        t0 = 20.6 + i * 0.12
        if t < t0:
            continue
        x, y = 6 + i * 58, 236 + int(100 * (1 - ease((t - t0) / 0.3)))
        glow = 0.0
        if i == 1 and t >= 21.9:
            glow = 0.5 + 0.5 * math.sin(t * 12)
            y -= int(12 * ease((t - 21.9) / 0.2))
            if t >= 22.5:
                if t >= hit_t:
                    continue
                v = ease((t - 22.5) / 0.4)
                x, y = int(x + (64 - x) * v), int(y + (90 - y) * v)
        elif t >= 23.0:
            y += int(120 * ease((t - 23.0) / 0.3))
        c = A.carta(nombre, icono, glow)
        if i == 1 and t >= 22.5:
            s = 1 - 0.5 * ease((t - 22.5) / 0.4)
            c = c.resize((max(1, int(c.width * s)), max(1, int(c.height * s))), Image.NEAREST)
        a.paste(c, (x, y), c)
    if hit_t <= t < hit_t + 1.0:
        d = label('-100', 'flame', 2)
        a.paste(d, (90 - d.width // 2, 90 - int(30 * (t - hit_t))), d)
    if t >= 24.2:
        d = label('+120 XP', 'rune', 2)
        a.paste(d, (90 - d.width // 2, 120 - int(12 * ease((t - 24.2) / 0.4))), d)
    f = up(a)
    sign(f, ('LUCHA CON', 'LO QUE SABES'), 'verde', 2, 540, 276, t, 19.3, 20.85, ign=0.5)
    if t >= hit_t:
        sign(f, ('¡CRÍTICO!',), 'fuego', 3, 540, 1590, t, hit_t + 0.05, 24.15, ign=0.2, bloom=1.3)
        shockwave(f, t, hit_t, 540, 684, color=(180, 255, 140))
    return f


FUNCIONES = ((A.funcion_curva, ('REPASA', 'JUSTO ANTES', 'DE OLVIDAR'), 'cristal', 2),
             (A.funcion_siete, ('TU CAMINO', 'AL 7'), 'oro', 2),
             (A.funcion_rango, ('SUBE DE', 'RANGO'), 'violeta', 3))


def sc_funciones(t):
    u = t - 25.0
    i = min(2, int(u / 1.5))
    fn, lines, luz, k = FUNCIONES[i]
    t0 = 25.0 + i * 1.5
    a = fn(t - t0)
    motas(a, t, 24, CRYS if i == 0 else WARM, speed=10, seed=8 + i)
    f = up(a)
    sign(f, lines, luz, k, 540, 288, t, t0, t0 + 1.5, ign=0.35)
    return f


ATAQUES = ((32.0, 'atomo', 40, CRYS), (32.4, 'matraz', 90, ((154, 226, 180), (98, 195, 145), (214, 251, 226))),
           (32.8, 'slime', 140, ((178, 207, 92), (226, 238, 138), (131, 173, 66))))


def sc_jefe(t):
    u = t - 29.5
    k = ease(u / 1.0)
    a = tint(pasillo.frame('jefe', u, loop=True), (0.55 - 0.15 * k, 0.4 - 0.15 * k, 0.45 - 0.12 * k), (18 * k, 0, 0))
    motas(a, t, 40, EMBER, speed=14, seed=11)
    lit, eyes = ease((u - 0.6) / 0.5), ease(u / 0.5)
    hp = 1.0
    for t0, *_ in ATAQUES:
        if t >= t0:
            hp -= 0.28
    if t >= 33.4:
        hp = max(0.0, 0.16 - (t - 33.4) * 0.6)
    hit = 0.0
    for th in (32.0, 32.4, 32.8, 33.4):
        if 0 <= t - th < 0.25:
            hit = max(hit, 1 - (t - th) / 0.25)
    if t < 33.7:
        g = A.golem(t, lit, eyes, hit, cracks=clamp((t - 31.8) / 1.6))
        a.paste(g, (5, 58), g)
    else:
        g = GOLEM_FIN
        dt = t - 33.7
        r = np.random.default_rng(3)
        for by in range(0, g.height, 14):
            for bx in range(0, g.width, 14):
                piece = g.crop((bx, by, bx + 14, by + 14))
                if not piece.getbbox():
                    continue
                vx, vy = r.uniform(-90, 90), r.uniform(-120, -20)
                x = 5 + bx + vx * dt
                y = 58 + by + vy * dt + 260 * dt * dt
                a.paste(piece, (int(x), int(y)), scaled(piece.getchannel('A'), max(0.0, 1 - dt / 1.2)))
    if u >= 1.1 and t < 34.4:
        hb = A.barra_vida('JEFE  PEP 1', hp, w=150)
        a.paste(hb, (15, 26), hb)
    if t >= 31.5:
        for i, kind in enumerate(('atomo', 'matraz', 'slime')):
            dt = t - 31.5 - i * 0.1
            if dt < 0:
                continue
            jump = int(40 * 4 * (dt / 0.45) * (1 - dt / 0.45)) if dt < 0.45 else 0
            pose = 'dance' if t >= 33.8 else 'up' if t >= 31.9 else 'wave'
            img = mascota(kind, pose, dt)
            a.paste(img, (20 + i * 50, 274 - jump - int(60 * (1 - ease(dt / 0.25)))), img)
    d = ImageDraw.Draw(a)
    for t0, kind, x, cols in ATAQUES:
        if 0 <= t - t0 < 0.25:
            v = (t - t0) / 0.25
            for j in range(12):
                p = j / 11 * v
                d.rectangle([x + (90 - x) * p - 2, 280 + (140 - 280) * p - 2, x + (90 - x) * p + 2, 280 + (140 - 280) * p + 2], fill=cols[j % 3])
        chispas(a, t, t0 + 0.2, 90, 140, n=24, speed=70, cols=cols, seed=int(t0 * 10), life=0.6)
    if 33.2 <= t < 33.5:
        for _, _, x, cols in ATAQUES:
            d.line([(x, 280), (90, 140)], fill=(255, 250, 220), width=5)
            d.line([(x, 280), (90, 140)], fill=cols[0], width=2)
    chispas(a, t, 33.4, 90, 140, n=90, speed=160, seed=33, life=1.4)
    f = up(a)
    sign(f, ('Y CUANDO', 'LLEGUE', 'LA PEP...'), 'fuego', 2, 540, 1640, t, 30.0, 31.45, ign=0.5)
    sign(f, ('...LA VAS A', 'APLASTAR.'), 'oro', 2, 540, 1610, t, 34.0, 35.0, ign=0.3, bloom=1.3)
    shockwave(f, t, 30.6, 540, 400, color=(255, 90, 60))
    shockwave(f, t, 33.4, 540, 840, dur=0.8)
    return f


def sc_latido(t):
    a = Image.new('RGB', (AW, AH), (3, 4, 8))
    beat = max(math.exp(-(t - b) * 6) if t >= b else 0 for b in (35.4, 35.65, 36.2, 36.45))
    motas(a, t, 16, CRYS, speed=6, seed=13)
    f = up(a)
    add_light(f, SPOT, 0.25 + 0.5 * beat, 0, 0)
    sign(f, ('EL SÓTANO', 'TE ESPERA.'), 'cristal', 2, 540, 960, t, 35.3, 36.97, ign=0.9)
    return f


def sc_titulo(t):
    u = t - 37.0
    a = tint(pasillo.frame('titulo', u, loop=True), (0.42, 0.42, 0.5))
    motas(a, t, 60, WARM + CRYS, speed=16, seed=17)
    chispas(a, t, 37.0, 90, 100, n=110, speed=170, seed=37, life=1.6)
    chispas(a, t, 41.0, 90, 242, n=60, speed=120, seed=41, life=1.1)
    if t >= 37.6:
        for i, kind in enumerate(('atomo', 'matraz', 'slime')):
            dt = t - 37.6 - i * 0.12
            if dt < 0:
                continue
            img = mascota(kind, 'dance' if kind != 'matraz' else 'wave', dt)
            a.paste(img, (24 + i * 46, 26 - int(50 * (1 - ease(dt / 0.3)))), img)
    f = up(a)
    rays(f, u * 5, 540, 600, 0.35 + 0.5 * math.exp(-u * 1.5))
    sign(f, ('NEXO',), 'oro', 5, 540, 600, t, 37.0, ign=0.35, bloom=1.5)
    shockwave(f, t, 37.0, 540, 600)
    sign(f, ('APRENDE DE VERDAD.',), 'cristal', 1, 540, 870, t, 38.2, ign=0.5)
    sign(f, ('PRIMERA BETA',), 'cristal', 2, 540, 1050, t, 39.0, ign=0.4)
    sign(f, ('DOMINGO 18 · OCT',), 'cristal', 1, 540, 1220, t, 40.0, ign=0.4)
    sign(f, ('18:00',), 'fuego', 4, 540, 1452, t, 41.0, ign=0.3, bloom=1.4)
    shockwave(f, t, 41.0, 540, 1452, dur=0.5, color=(255, 170, 90))
    sign(f, ('PREPÁRATE.',), 'oro', 2, 540, 1740, t, 43.0, ign=0.4, bloom=1.2)
    return f


SCENES = ((0.0, sc_examen), (4.2, sc_caos), (10.5, sc_pasillo), (19.0, sc_combate), (25.0, sc_funciones), (29.5, sc_jefe),
          (35.0, sc_latido), (37.0, sc_titulo))
HITS = [(3.6, .2, 14), (8.0, .9, 28), (19.0, .7, 20), (22.9, .6, 26), (23.6, .3, 10), (25.0, .45, 8), (26.5, .45, 8), (28.0, .45, 8),
        (30.6, .3, 30), (32.0, .15, 8), (32.4, .15, 8), (32.8, .15, 8), (33.4, 1.0, 34), (37.0, 1.0, 32), (39.0, .1, 6), (40.0, .1, 6),
        (41.0, .4, 16), (43.0, .3, 10), (45.0, .35, 8)]


def render_frame(t):
    fn = [s for s in SCENES if s[0] <= t][-1][1]
    arr = np.asarray(fn(t), np.float32) * VIG
    fl = sum(a * math.exp(-(t - th) * 7) for th, a, _ in HITS if 0 <= t - th < 1.5)
    if 18.6 <= t < 19.0:
        fl += ease((t - 18.6) / 0.4)
    if fl > 0.004:
        arr += (255 - arr) * min(1.0, fl)
    fade = ease(t / 0.6) * ease((DUR - t) / 0.7)
    if fade < 1:
        arr *= fade
    sh = sum(s * math.exp(-(t - th) * 7) for th, _, s in HITS if 0 <= t - th < 1.2)
    out = arr.clip(0, 255).astype(np.uint8)
    dx, dy = int(sh * math.sin(t * 97)), int(sh * math.cos(t * 83))
    if dx or dy:
        moved = np.zeros_like(out)
        moved[max(0, dy):H + min(0, dy), max(0, dx):W + min(0, dx)] = out[max(0, -dy):H - max(0, dy), max(0, -dx):W - max(0, dx)]
        out = moved
    return out


def audio():
    """Música en caché: solo se vuelve a sintetizar si cambia musica.py."""
    key = hashlib.sha1(open(os.path.join(HERE, 'musica.py'), 'rb').read() + str(DUR).encode()).hexdigest()[:12]
    path = os.path.join(TMP, f'nexo-trailer-{key}.wav')
    if not os.path.exists(path):
        x = musica.compose(DUR)
        with wave.open(path, 'wb') as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(musica.SR)
            w.writeframes((x.T * 32767).astype('<i2').tobytes())
    return path


def prepare():
    global MASC, RAYS, VIG, SPOT, GOLEM_FIN
    pasillo.ensure()
    MASC = load_mascots()
    RAYS = make_rays()
    GOLEM_FIN = A.golem(33.7, 1.0, 1.0, 0.2, 1.0)
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - W / 2) / (W * .75)) ** 2 + ((yy - H / 2) / (H * .62)) ** 2)
    VIG = (1 - 0.6 * np.clip(d - .35, 0, 1) ** 1.5)[..., None].astype(np.float32)
    s = np.clip(1 - np.hypot(xx - 540, yy - 960) / 700, 0, 1) ** 2
    SPOT = Image.fromarray((s[..., None] * np.array([40, 90, 110])).astype(np.uint8), 'RGB')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--preview', action='store_true')
    ap.add_argument('--out', default=os.path.join(ROOT, 'docs', 'trailer', 'nexo-beta-trailer.mp4'))
    args = ap.parse_args()
    prepare()
    if args.preview:
        times = (2.8, 3.9, 6.8, 8.9, 12.0, 16.0, 17.0, 20.2, 22.0, 23.1, 25.8, 27.3, 28.9, 30.3, 32.1, 33.9, 36.3, 37.4, 41.6, 44.0)
        cols, s = 5, 0.2
        out = Image.new('RGB', (int(W * s) * cols, int(H * s) * math.ceil(len(times) / cols)))
        for i, t in enumerate(times):
            fr = Image.fromarray(render_frame(t)).resize((int(W * s), int(H * s)), Image.LANCZOS)
            out.paste(fr, ((i % cols) * int(W * s), (i // cols) * int(H * s)))
        path = os.path.join(TMP, 'nexo-trailer-preview.png')
        out.save(path)
        print(path)
        return
    wav = audio()
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-i', wav, '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
                           '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', args.out], stdin=subprocess.PIPE)
    total = int(DUR * FPS)
    for i in range(total):
        ff.stdin.write(render_frame(i / FPS).tobytes())
        if i % 150 == 0:
            print(f'{i}/{total}', flush=True)
    ff.stdin.close()
    ff.wait()
    print(args.out)


if __name__ == '__main__':
    main()
