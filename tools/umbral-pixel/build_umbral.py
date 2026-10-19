"""Arte base de la intro de la torre (docs/umbral/SPEC.md, paso 1).

Capas de 384x384 px de arte (se amplian con pixeles enteros en la app):
  cielo.png            noche profunda, Via Lactea y muchas estrellas
  nubes-lejos.png      banco de nubes de tormenta, repetible en horizontal (384x200)
  nubes-cerca.png      nubes y bruma bajas, repetible en horizontal (384x200)
  torre-oscura.png     la cima de la torre apagada, con luz fria y baja
  torre-rayo.png       la misma torre iluminada por un rayo (la app la mezcla en cada destello)
  torre-despierta.png  la torre viva: ventanas de oro, runas y halos
Uso: python tools/umbral-pixel/build_umbral.py   (escribe en dist/assets/umbral/ y docs/umbral/preview-arte.png)
"""
import os
import sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'home-pixel'))
import pixel as P  # noqa: E402

ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
OUT = os.path.join(ROOT, 'dist', 'assets', 'umbral')
S = 384
CX = 192
APX = 199           # punta de la aguja: el sombrero esta doblado hacia la derecha

P.RAMPS['noche'] = P.hexes('#050414', '#0a0822', '#120d33', '#1b1448', '#281c5e', '#3a2a78', '#4f3a8c')
P.RAMPS['astro'] = P.hexes('#6a6aa0', '#a8b0d8', '#e0e4f8', '#ffffff', '#ffe8a8', '#a8e0ff')
P.RAMPS['nube'] = P.hexes('#0d0a1c', '#17122e', '#241c44', '#34295c', '#4a3b78', '#6b5a98', '#9a88b8')
P.DITHERED.update({'noche', 'nube'})


def hash2(a, b, seed=7):
    return ((int(a) * 73856093) ^ (int(b) * 19349663) ^ (seed * 83492791)) % 1000 / 1000.0


# ---------------------------------------------------------------- cielo
def cielo():
    rng = np.random.default_rng(11)
    c = P.Canvas(S, S)
    yy, xx = c.grid()
    lvl = 0.2 + 4.4 * (yy / S) ** 1.5
    d = np.abs(0.57 * xx + 0.82 * yy - 0.82 * 330)             # distancia a una diagonal: la Via Lactea
    band = np.exp(-(d / 38.0) ** 2)
    lvl += band * 1.3
    c.rect(0, 0, S, S, 'noche', 0)
    c.lvl[:] = lvl
    prob = 0.0042 + 0.026 * band
    prob[int(S * 0.8):, :] *= 0.4
    stars = rng.random((S, S)) < prob
    for y, x in zip(*np.nonzero(stars)):
        r = rng.random()
        lv = 0 if r < .35 else 1 if r < .7 else 2 if r < .9 else 3
        if rng.random() < .12:
            lv = 4 if rng.random() < .6 else 5
        c.px(x, y, 'astro', lv)
    for _ in range(18):                                        # estrellas grandes con destello en cruz
        x, y = int(rng.integers(8, S - 8)), int(rng.integers(6, int(S * 0.72)))
        col = int(rng.choice([3, 4, 5]))
        c.px(x, y, 'astro', col)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            c.px(x + dx, y + dy, 'astro', 1)
        if rng.random() < .5:
            for dx, dy in ((2, 0), (-2, 0), (0, 2), (0, -2)):
                c.px(x + dx, y + dy, 'astro', 0)
    return c


# ---------------------------------------------------------------- nubes
def periodic_noise(h, w, seed, octs):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    n = np.zeros((h, w), np.float32)
    amp = 1.0
    for k, ky in octs:
        ph1, ph2, ph3 = rng.random(3) * 6.283
        n += amp * (np.sin(2 * np.pi * k * xx / w + ph1 + 1.7 * np.sin(2 * np.pi * ky * yy / h + ph2))
                    + np.sin(2 * np.pi * (k + 1) * xx / w + ph3) * np.cos(2 * np.pi * ky * yy / h + ph1)) * 0.5
        amp *= 0.55
    return n


def nubes(seed, cerca):
    h, w = 200, S
    c = P.Canvas(w, h)
    n = periodic_noise(h, w, seed, [(2, 2), (4, 3), (7, 5), (11, 8)])
    yy = np.mgrid[0:h, 0:w][0].astype(np.float32)
    if cerca:
        prof = np.clip((yy - 70) / 125.0, 0, 1) ** 0.8 * 1.9 - 0.3    # espesa abajo: bruma que cubre la base
        thr = 0.22
    else:
        prof = np.exp(-((yy - 100) / 55.0) ** 2) * 1.0 - 0.45           # un banco de nubes en el medio
        thr = 0.3
    dens = n * 0.55 + prof
    m = dens > thr
    up = np.zeros_like(m)
    up[3:] = m[3:] & ~m[:-3]
    up2 = np.zeros_like(m)
    up2[6:] = m[6:] & ~m[:-6]
    lvl = 1.0 + np.clip((dens - thr) * 1.6, 0, 2.0) + np.where(up2, 1.2, 0) + np.where(up, 1.6, 0)
    if cerca:
        lvl -= 0.5
    c.mask(m, 'nube', lvl)
    c.dither = {'nube': 0.9}
    return c


# ---------------------------------------------------------------- torre
RUNAS = [
    ['.X.X.', '.XXX.', 'X.X.X', '..X..', '.XXX.', 'X...X', '.....'],
    ['..X..', '.XXX.', '..X..', 'XXXXX', '..X..', '.X.X.', 'X...X'],
    ['XXXX.', 'X..X.', 'X.XXX', 'X..X.', 'XXXX.', '.X...', '.X...'],
    ['X...X', '.X.X.', '..X..', '.XXX.', '..X..', '.X.X.', 'X...X'],
    ['.XXX.', 'X...X', 'X.X.X', 'X...X', '.XXX.', '..X..', '.XXX.'],
    ['XX.XX', 'X.X.X', 'XX.XX', '..X..', 'XXXXX', '..X..', '.XXX.'],
]
RUNAS_POS = [(CX - 40, 176), (CX + 22, 176), (CX + 31, 200), (CX - 36, 208), (CX + 28, 258), (CX - 8, 252),
             (CX + 30, 232), (CX - 44, 290), (CX - 6, 300), (CX + 22, 330), (CX - 28, 344), (CX + 6, 362)]


def torre(modo):
    """modo: 'oscura' (luz fria y baja), 'rayo' (iluminada por un relampago), 'despierta' (viva y magica)."""
    awake = modo == 'despierta'
    c = P.Canvas(S, S)
    c.dither = {'stone': 0.7, 'wall': 0.7}
    rng = np.random.default_rng(5)
    R0, R1 = 54, 150                            # techo en cono: de la punta al alero

    # --- techo de pizarra azul ---
    for y in range(R0, R1 + 1):
        t = (y - R0) / (R1 - R0)
        hw = 66 * t ** 0.78 + 1
        cxy = CX + 7 * (1 - t) ** 1.6
        row = (y - R0) // 5
        for x in range(int(cxy - hw), int(cxy + hw) + 1):
            nx = (x - cxy) / max(hw, 1)
            lv = 2.1 + 1.7 * nx
            if (y - R0) % 5 == 4:
                lv -= 0.8
            if (x + (row % 2) * 4) % 8 == 0:
                lv -= 0.6
            lv += (hash2(x // 8 + row * 31, row) - .5) * .7
            c.px(x, y, 'blue', max(0.0, lv))
            if hash2(x, y, 3) > 0.992:
                c.px(x, y, 'blue', 0)                                       # teja perdida
            elif nx < 0.1 and hash2(x // 3, y // 2, 9) > 0.8 and t > .35:
                c.px(x, y, 'shade', 2 + hash2(x, y, 4) * 2)                 # musgo que sube por el techo

    # --- aguja, pararrayos y banderin roto ---
    c.rect(APX, 34, APX + 2, R0 + 2, 'brass', 3)
    c.rect(APX - 1, R0 - 2, APX + 3, R0 + 2, 'brass', 4)
    c.rect(APX, 22, APX + 1, 34, 'brass', 5)
    c.px(APX, 21, 'brass', 6)
    flag = ['XXXXXXX..', '.XXXXXXXX', 'XXXXXXX..', '..XXXXXX.', '...XXX...', '....X....']
    for j, rw in enumerate(flag):
        for i, ch in enumerate(rw):
            if ch == 'X':
                c.px(APX + 2 + i, 36 + j, 'red', 1 + (j % 2) + (1 if i < 3 else 0) - (1 if i > 6 else 0))

    # --- alero de madera con vigas ---
    ehw = 72
    c.rect(CX - ehw, R1, CX + ehw, R1 + 7, 'wood', 2)
    c.rect(CX - ehw, R1, CX + ehw, R1 + 1, 'wood', 4)
    c.rect(CX - ehw, R1 + 6, CX + ehw, R1 + 7, 'wood', 0)
    for x in range(CX - ehw + 3, CX + ehw - 2, 9):
        c.rect(x, R1 + 7, x + 3, R1 + 12, 'wood', 1 + (1 if x > CX else 0))
        c.px(x + 1, R1 + 12, 'wood', 0)
    for x in range(CX - ehw, CX + ehw, 18):
        c.px(x + 1, R1 + 3, 'brass', 3)

    # --- muro de piedra (cilindro) ---
    Y0 = R1 + 13
    for y in range(Y0, S):
        hw = 50 + (y - Y0) * 0.04
        r = (y - Y0) // 6
        for x in range(int(CX - hw), int(CX + hw) + 1):
            nx = (x - CX) / hw
            lv = 2.2 + 1.9 * nx
            if y % 6 == 5:
                lv -= 1.0
            if (x + (r % 2) * 6) % 12 == 0:
                lv -= 1.0
            lv += (hash2((x + (r % 2) * 6) // 12, r, 2) - .5) * 1.0
            c.px(x, y, 'stone', max(0.0, lv))
    for _ in range(7):                                                      # grietas
        x, y = int(rng.integers(CX - 40, CX + 40)), int(rng.integers(Y0 + 10, S - 20))
        for _ in range(int(rng.integers(7, 16))):
            c.px(x, y, 'stone', 0)
            x += int(rng.integers(-1, 2))
            y += int(rng.integers(0, 3))

    # --- ventana en arco ---
    wx0, wx1, wy1, cy = CX - 11, CX + 11, 242, 218
    for y in range(cy - 15, wy1 + 4):
        for x in range(wx0 - 4, wx1 + 4):
            inner = wx0 <= x < wx1 and (y >= cy or np.hypot(x - CX + .5, y - cy) < 11) and y < wy1
            outer = wx0 - 3 <= x < wx1 + 3 and (y >= cy or np.hypot(x - CX + .5, y - cy) < 14) and y < wy1 + 3
            if inner:
                if awake:
                    c.px(x, y, 'glow', 4.6 - 1.4 * (y - 207) / 35)
                else:
                    c.px(x, y, 'glass', 0 if hash2(x, y) > .06 else 1)
            elif outer:
                c.px(x, y, 'stone', 5 if x >= CX else 3.6)
    for x in range(wx0, wx1):
        c.px(x, 226, 'wood', 1)
    for y in range(cy - 11, wy1):
        c.px(CX, y, 'wood', 1)
    c.rect(wx0 - 5, wy1 + 2, wx1 + 5, wy1 + 6, 'stone', 4)
    c.rect(wx0 - 5, wy1 + 6, wx1 + 5, wy1 + 7, 'stone', 1)

    # --- troneras ---
    for y in (292, 318):
        c.rect(CX + 18, y, CX + 20, y + 11, 'stone', 0)
        c.px(CX + 20, y, 'stone', 3)

    # --- balcon con puerta, libro abierto y una vela gastada ---
    dx0, dx1, dy1 = CX - 46, CX - 26, 266
    mid = (dx0 + dx1 - 1) / 2
    for y in range(238, dy1 + 1):
        for x in range(dx0 - 3, dx1 + 3):
            inner = dx0 <= x < dx1 and (y >= 248 or np.hypot(x - mid, y - 248) < 10)
            outer = dx0 - 3 <= x < dx1 + 3 and (y >= 248 or np.hypot(x - mid, y - 248) < 13)
            if inner:
                if awake:
                    c.px(x, y, 'glow', 1.4 + 1.6 * ((dy1 - y) / 30))
                else:
                    c.px(x, y, 'stone', 0)
            elif outer:
                c.px(x, y, 'stone', 3.4)
    c.rect(dx0 - 22, dy1 + 1, dx1 + 6, dy1 + 6, 'stone', 4)                 # losa
    c.rect(dx0 - 22, dy1 + 6, dx1 + 6, dy1 + 7, 'stone', 1)
    c.rect(dx0 - 22, dy1 + 1, dx1 + 6, dy1 + 2, 'stone', 5)
    c.rect(dx0 - 22, dy1 - 14, dx1 + 6, dy1 - 13, 'wood', 3)                # pasamanos
    for x in range(dx0 - 22, dx1 + 6, 6):
        c.rect(x, dy1 - 13, x + 2, dy1 + 1, 'wood', 2)
    c.sprite(dx0 - 14, dy1 - 3, ['.XXXX.XXXX.', 'XPPPPXPPPPX', 'XPLLPXPLLPX', '.XXXXXXXXX.'], 'paper',
             {'X': ('paper', 1), 'P': ('paper', 4), 'L': ('paper', 2)})     # libro abierto
    c.rect(dx0 - 22, dy1 - 6, dx0 - 19, dy1 + 1, 'wax', 3)                  # vela gastada
    c.px(dx0 - 21, dy1 - 7, 'wax', 1)
    if awake:
        for k in range(3):
            c.px(dx0 - 21, dy1 - 8 - k, 'flame', 4 - k)

    # --- hiedra que invade desde abajo a la izquierda ---
    x, y = CX - 52, S - 1
    leaf = 'sprout' if awake else 'shade'
    for i in range(190):
        x += int(rng.choice([-1, 0, 0, 1])) + (0 if rng.random() < .7 else 1)
        y -= 1 if rng.random() < .85 else 0
        x = max(CX - 64, min(CX - 38, x))
        c.px(x, y, 'stem', 1 + (i % 3 == 0))
        if i % 3 == 0:
            ox = int(rng.integers(-3, 4))
            lv = 2 + hash2(x, y, 6) * 3
            c.rect(x + ox, y - 1, x + ox + 3, y + 1, leaf, lv)
            c.px(x + ox + 1, y - 2, leaf, lv + 1)
            if awake and i % 12 == 0:
                c.px(x + ox + 1, y - 3, 'crystal', 6)

    # --- runas y circulo magico (solo despierta) ---
    if awake:
        for k, (rx, ry) in enumerate(RUNAS_POS):
            for j, rw in enumerate(RUNAS[k % len(RUNAS)]):
                for i, ch in enumerate(rw):
                    if ch == 'X':
                        c.px(rx + i, ry + j, 'rune', 5 if (i + j) % 3 else 4)
        for a in np.linspace(0, 2 * np.pi, 40, endpoint=False):
            c.px(CX + 21 * np.cos(a), cy + 4 + 21 * np.sin(a) * 1.15, 'arcane', 6)
        for x in range(CX - ehw + 4, CX + ehw - 3, 6):
            c.px(x, R1 + 3, 'rune', 5)

    # --- contorno exterior oscuro ---
    solid = c.mat != 0
    edge = solid.copy()
    edge[1:-1, 1:-1] = solid[1:-1, 1:-1] & solid[:-2, 1:-1] & solid[2:, 1:-1] & solid[1:-1, :-2] & solid[1:-1, 2:]
    border = solid & ~edge
    border[-1, :] = False
    c.mat[border] = c.mid('stone')
    c.lvl[border] = 0
    c.lock[border] = True

    # --- luz segun el modo ---
    yy, xx = c.grid()
    if modo == 'oscura':
        c.add_light((xx - CX) / 70.0 * 0.9 - 1.15)
    elif modo == 'rayo':
        c.add_light(1.3 + (xx - CX) / 60.0 - (yy - 150) / 330.0)
    else:
        c.add_light(0.25 + (xx - CX) / 160.0 + np.exp(-((yy - 218) / 70.0) ** 2) * 0.6)
    return c


def render_alpha(c, post=None):
    """Imagen RGBA: opaca donde hay torre; los halos (post) quedan semitransparentes alrededor."""
    base = np.array(c.render(scale=1))
    solid = c.mat != 0
    out = np.zeros((c.h, c.w, 4), np.uint8)
    out[solid, :3] = base[solid]
    out[solid, 3] = 255
    if post is not None:
        g = np.zeros((c.h, c.w, 3), np.float32)
        post(g)
        a = np.clip(g.max(axis=2) / 160.0, 0, 1)
        col = np.where(a[..., None] > 0, g / np.maximum(a[..., None], 1e-3), 0)
        add = ~solid & (a > 0)
        out[add, :3] = np.clip(col[add], 0, 255).astype(np.uint8)
        out[add, 3] = (a[add] * 190).astype(np.uint8)
        rgb = out[..., :3].astype(np.float32)
        rgb[solid] = np.clip(rgb[solid] + g[solid] * 0.5, 0, 255)
        out[..., :3] = rgb.astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def glow_awake(arr):
    P.glow(arr, CX, 222, 38, '#ffc850', 1.15, rings=5)                    # la ventana
    P.glow(arr, CX - 36, 256, 26, '#ffc850', .8, rings=4)                 # la puerta del balcon
    P.glow(arr, APX, 24, 46, '#b88cf4', .9, rings=5)                      # arcano en la punta
    P.glow(arr, CX, 130, 80, '#6a3cb0', .55, rings=5, squash=.8)          # aura sobre el techo


def main():
    os.makedirs(OUT, exist_ok=True)
    cielo().render(scale=1).save(os.path.join(OUT, 'cielo.png'), optimize=True)
    for nombre, seed, cerca in (('nubes-lejos', 3, False), ('nubes-cerca', 8, True)):
        c = nubes(seed, cerca)
        img = np.array(c.render(scale=1))
        a = np.where(c.mat != 0, 255, 0).astype(np.uint8)
        Image.fromarray(np.dstack([img, a]), 'RGBA').save(os.path.join(OUT, nombre + '.png'), optimize=True)
    for modo in ('oscura', 'rayo', 'despierta'):
        render_alpha(torre(modo), glow_awake if modo == 'despierta' else None).save(
            os.path.join(OUT, f'torre-{modo}.png'), optimize=True)
    sky = Image.open(os.path.join(OUT, 'cielo.png')).convert('RGBA')
    far = Image.open(os.path.join(OUT, 'nubes-lejos.png'))
    near = Image.open(os.path.join(OUT, 'nubes-cerca.png'))
    sheet = Image.new('RGB', (S * 3, S))
    for i, modo in enumerate(('oscura', 'rayo', 'despierta')):
        pan = sky.copy()
        pan.alpha_composite(far, (0, 120))
        pan.alpha_composite(Image.open(os.path.join(OUT, f'torre-{modo}.png')))
        pan.alpha_composite(near, (0, S - 185))
        if modo == 'rayo':
            pan = Image.alpha_composite(pan, Image.new('RGBA', (S, S), (170, 190, 255, 60)))
        sheet.paste(pan.convert('RGB'), (i * S, 0))
    sheet.save(os.path.join(ROOT, 'docs', 'umbral', 'preview-arte.png'))


if __name__ == '__main__':
    main()
