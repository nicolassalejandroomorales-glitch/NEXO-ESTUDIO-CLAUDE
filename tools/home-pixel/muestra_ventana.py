"""Muestra de estilo: la esquina de la ventana del refugio en pixel art de verdad (160x128 px de arte, x4).

Uso:  python tools/home-pixel/muestra_ventana.py
Escribe docs/inicio-pixelart/muestra-ventana.png y la comparación antes/ahora.
"""
from pathlib import Path
import math
import random
import numpy as np
from PIL import Image
from pixel import Canvas

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/inicio-pixelart'
OUT.mkdir(parents=True, exist_ok=True)
rnd = random.Random(12)

W, H = 160, 128
c = Canvas(W, H)
yy, xx = c.grid()

# ------------------------------------------------------------------ pared de yeso
c.rect(0, 0, W, H, 'wall', 2)
noise = np.array([[rnd.random() for _ in range(W)] for _ in range(H)])
c.lvl[(noise > 0.93)] -= 1                     # motas de textura
c.lvl[(noise < 0.04)] += 1
# yeso descascarado: piedras que se asoman
def stones(x0, y0, cols, rows):
    for r in range(rows):
        off = 3 if r % 2 else 0
        for k in range(cols):
            sx, sy = x0 + k * 7 - off, y0 + r * 5
            c.rect(sx, sy, sx + 6, sy + 4, 'stone', 3 + rnd.choice([0, 0, 1, -1]))
            c.rect(sx, sy, sx + 6, sy + 1, 'stone', 4)      # canto de arriba con luz
            c.rect(sx, sy + 3, sx + 6, sy + 4, 'stone', 2)
    # borde de yeso roto alrededor
    c.rect(x0 - 4, y0 - 1, x0 + cols * 7 - 3, y0, 'wall', 2)
stones(6, 58, 2, 4)
stones(86, 104, 2, 1)

# ------------------------------------------------------------------ viga del techo
c.rect(0, 0, W, 7, 'wood', 3)
c.rect(0, 0, W, 1, 'wood', 5)
c.rect(0, 6, W, 7, 'wood', 1)
c.rect(0, 7, W, 8, 'void', 0)
for x in range(0, W, 1):                       # veta de la madera
    if (x * 7) % 23 < 9:
        c.px(x, 3 + (x // 11) % 2, 'wood', 2)

# ------------------------------------------------------------------ ventana en arco
CX, CY, RIN, ROUT = 52, 42, 21, 25
X0, X1, YB = CX - RIN, CX + RIN, 98
d = np.hypot(xx - CX, yy - CY)
glass = ((yy >= CY) & (xx >= X0) & (xx <= X1) & (yy <= YB)) | ((yy < CY) & (d <= RIN))
frame = (((yy >= CY) & (xx >= CX - ROUT) & (xx <= CX + ROUT) & (yy <= YB + 2)) | ((yy < CY) & (d <= ROUT))) & ~glass
reveal = frame & ~(((yy >= CY) & (xx >= CX - ROUT + 1) & (xx <= CX + ROUT - 1)) | ((yy < CY) & (d <= ROUT - 1)))

# cielo con degradado (más claro abajo y hacia el sol)
sun = (34, 30)
dsun = np.hypot(xx - sun[0], yy - sun[1])
sky_lvl = 1.2 + (yy - 20) / 16 + np.clip(3.2 - dsun / 9, 0, 3.2)
c.mask(glass, 'sky', sky_lvl)
# sol: disco con halo
c.mask(glass & (dsun <= 3.2), 'flame', 5)
c.mask(glass & (dsun > 3.2) & (dsun <= 5), 'sky', 7)
# nubes: bolitas con luz arriba y sombra abajo
def cloud(cx, cy, blobs):
    for (ox, oy, r) in blobs:
        bd = np.hypot(xx - (cx + ox), (yy - (cy + oy)) * 1.25)
        m = glass & (bd <= r)
        lv = np.where(yy - (cy + oy) < -r * 0.25, 4, np.where(yy - (cy + oy) > r * 0.45, 2, 3))
        c.mask(m, 'cloud', lv.astype(np.float32))
cloud(62, 33, [(0, 0, 4.5), (5, 1, 3.5), (-5, 2, 3), (9, 3, 2.5)])
cloud(40, 52, [(0, 0, 3), (4, 1, 2.5), (-3, 1.5, 2)])
# colinas lejanas, línea de árboles y prado
far = 70 + 3 * np.sin(xx * 0.11 + 1) + 2 * np.sin(xx * 0.27)
c.mask(glass & (yy >= far), 'hill', np.clip(4.2 - (yy - far) / 4, 1, 5))
near = 79 + 2.5 * np.sin(xx * 0.19 + 2)
c.mask(glass & (yy >= near), 'tree', 2.0)
for tx in range(X0 - 2, X1 + 3, 5):           # copas redondas
    ty = 78 + rnd.randint(-2, 2)
    r = rnd.choice([3, 3.5, 4])
    td = np.hypot(xx - tx, yy - ty)
    m = glass & (td <= r)
    c.mask(m, 'tree', np.where((xx - tx) + (yy - ty) < -1, 4, np.where((xx - tx) + (yy - ty) > 2, 2, 3)).astype(np.float32))
c.mask(glass & (yy >= 88), 'leaf', np.clip(6 - (yy - 88) / 3.5, 3, 6))
for k in range(14):                            # florcitas en el prado
    fx, fy = rnd.randint(X0, X1), rnd.randint(89, 97)
    if glass[fy, fx]:
        c.px(fx, fy, 'petal', 3)

# marco de madera y parteluces
c.mask(frame, 'wood', 4)
c.mask(reveal, 'wood', 2)
inner_edge = frame & ~reveal & (np.hypot(xx - CX, yy - CY) <= RIN + 1.5) & (yy < CY)
c.mask(inner_edge, 'wood', 6)
c.rect(X0 - 1, CY, X0, YB + 1, 'wood', 6)
c.rect(X1, CY, X1 + 1, YB + 1, 'wood', 3)
mull = (glass & (abs(xx - CX) <= 1)) | (glass & (abs(yy - 66) <= 0.5))
for ang in (-50, -130):                        # rayos del arco
    a = math.radians(ang)
    t = (xx - CX) * math.cos(a) + (yy - CY) * math.sin(a)
    perp = abs(-(xx - CX) * math.sin(a) + (yy - CY) * math.cos(a))
    mull |= glass & (yy < CY) & (t > 0) & (perp <= 0.7)
mull |= glass & (abs(yy - CY) <= 0.5)
c.mask(mull, 'wood', 3)
c.mask(mull & np.roll(~mull, 1, axis=0), 'wood', 5)   # canto de arriba de cada parteluz con luz
glass_only = glass & ~mull
# brillos del vidrio: dos trazos diagonales
for (gx, gy, n) in [(36, 70, 6), (60, 46, 4), (66, 84, 3)]:
    for i in range(n):
        if glass_only[gy - i, gx + i]:
            c.px(gx + i, gy - i, 'sky', 7)

# ------------------------------------------------------------------ alféizar y macetas
c.rect(24, 99, 92, 101, 'wood', 6)
c.rect(24, 101, 92, 104, 'wood', 4)
c.rect(24, 104, 92, 105, 'wood', 1)
c.rect(25, 105, 91, 106, 'void', 0)

def pot(x, y, w=8, h=6):
    c.rect(x, y, x + w, y + 2, 'clay', 4)              # borde
    c.rect(x, y + 2, x + w, y + 3, 'clay', 2)
    for j in range(3, h):
        ins = (j - 3) // 2
        c.rect(x + ins, y + j, x + w - ins, y + j + 1, 'clay', 3)
        c.px(x + ins, y + j, 'clay', 2)
        c.px(x + w - ins - 1, y + j, 'clay', 1)
        c.px(x + ins + 1, y + j, 'clay', 4)
    c.rect(x + 1, y, x + w - 1, y + 1, 'clay', 5)

# ------------------------------------------------------------------ hojas de hiedra (plantillas a mano)
LEAVES = [
    ["..o.o..",
     ".olomo.",
     "ohllmdo",
     "olhlmdo",
     ".olmdo.",
     "..omo..",
     "...o..."],
    [".o.o.",
     "ohlmo",
     "olmdo",
     ".omo.",
     "..o.."],
    [".oo...",
     "ohloo.",
     "olllmo",
     "omldo.",
     ".oo..."],
    ["..o..",
     ".olo.",
     "ohlmo",
     "olmmo",
     "olmdo",
     ".omo.",
     "..o.."],
]

def leaf_levels(base):
    return {'o': base - 2.5, 'd': base - 1, 'm': base, 'l': base + 1, 'h': base + 2.2}

def leaf(x, y, base, kind=None, flip=None):
    rows = LEAVES[kind if kind is not None else rnd.choice([0, 0, 1, 2, 3])]
    flip = rnd.random() < 0.5 if flip is None else flip
    c.sprite(int(x) - len(rows[0]) // 2, int(y), rows, 'leaf', leaf_levels(base), flip=flip)

def vine(x0, y0, length, base, sway=2.5, freq=0.12, every=3, big=True):
    ph = rnd.random() * 6
    pts = [(x0 + sway * math.sin(t * freq + ph) + t * rnd.uniform(-0.02, 0.02), y0 + t) for t in range(length)]
    for (x, y) in pts:
        c.px(x, y, 'stem', max(0, base - 3))
    side = 1
    for i in range(2, length, every):
        x, y = pts[i]
        side = -side
        kind = rnd.choice([0, 0, 3, 1]) if (big and i < length * 0.7) else rnd.choice([1, 2])
        leaf(x + side * 3, y - 1, base + rnd.choice([0, 0, 1, -1]), kind, flip=(side < 0) if kind == 2 else None)
    leaf(pts[-1][0], pts[-1][1] - 1, base, 1)            # hojita de la punta

def drape(x0, x1, y0, n, length, base, **kw):
    for _ in range(n):
        vine(rnd.uniform(x0, x1), y0 + rnd.randint(-1, 2), int(length * rnd.uniform(0.55, 1.0)), base, **kw)

# capa de atrás (más oscura) -------------------------------------------
drape(-2, 22, 6, 6, 104, 2, sway=3)
drape(78, 104, 6, 5, 80, 2, sway=2.5)
drape(20, 86, 6, 3, 16, 2, sway=1.5)

# ------------------------------------------------------------------ estantería de la derecha
c.rect(106, 8, W, 112, 'wood', 1)
for x in range(106, W, 9):                      # tablones del fondo
    c.rect(x, 8, x + 1, 112, 'wood', 0)
    c.rect(x + 1, 8, x + 2, 112, 'wood', 2)
c.rect(104, 8, 108, 112, 'wood', 4)             # pilar
c.rect(104, 8, 105, 112, 'wood', 6)
c.rect(107, 8, 108, 112, 'wood', 2)

def shelf(y):
    c.rect(108, y, W, y + 2, 'wood', 6)
    c.rect(108, y + 2, W, y + 4, 'wood', 4)
    c.rect(108, y + 4, W, y + 6, 'void', 0)     # sombra bajo la repisa
    c.rect(108, y + 6, W, y + 7, 'wood', 0)

def books(x, y_base, n):
    for _ in range(n):
        w = rnd.choice([3, 4, 4, 5])
        h = rnd.randint(10, 16)
        col = rnd.choice(['red', 'green', 'blue', 'red', 'paper'])
        top = y_base - h
        if x + w > W:
            break
        c.rect(x, top, x + w, y_base, col, 3)
        c.rect(x, top, x + 1, y_base, col, 4)          # luz en el lomo
        c.rect(x + w - 1, top, x + w, y_base, col, 1)
        band = rnd.choice(['brass', 'brass', 'paper'])
        for by in (top + 2, y_base - 3):
            c.rect(x + 1, by, x + w - 1, by + 1, band, 4)
        if rnd.random() < 0.5:
            c.rect(x + 1, top + 5, x + w - 1, top + 7, band, 3)   # etiqueta
        c.rect(x, top - 1, x + w, top, 'paper', 4)      # cantos de las hojas
        x += w
    return x

shelf(30)
books(110, 30, 11)
shelf(62)
# frascos en la repisa de abajo
def jar(x, y, w, h, liquid):
    c.rect(x + 1, y - h, x + w - 1, y, 'glass', 2)
    c.rect(x, y - h + 2, x + w, y, 'glass', 2)
    c.rect(x + 1, y - h + 4, x + w - 1, y - 1, liquid, 3)
    c.rect(x + 1, y - h + 4, x + w - 1, y - h + 5, liquid, 5)
    c.rect(x + 1, y - h + 2, x + 2, y - 2, 'glass', 6)     # brillo
    c.rect(x + 2, y - h - 2, x + w - 2, y - h, 'wood', 5)  # corcho
jar(110, 62, 7, 10, 'green')
jar(118, 62, 6, 8, 'red')
books(126, 62, 3)
jar(142, 62, 8, 12, 'blue')
x = books(151, 62, 2)
shelf(96)
books(110, 96, 4)
# libros acostados
for i, col in enumerate(['green', 'red', 'blue']):
    y = 96 - 3 * (i + 1)
    c.rect(130 + i, y, 152 - i, y + 3, col, 3)
    c.rect(130 + i, y, 152 - i, y + 1, col, 4)
    c.rect(150 - i, y, 152 - i, y + 3, 'paper', 4)

# ------------------------------------------------------------------ escritorio
c.rect(0, 112, W, 117, 'wood', 5)
c.rect(0, 112, W, 113, 'wood', 7)
c.rect(0, 117, W, 118, 'wood', 2)
c.rect(0, 118, W, H, 'wood', 3)
for x in range(0, W, 26):
    c.rect(x, 118, x + 1, H, 'wood', 1)
for x in range(0, W):                            # veta
    if (x * 13) % 31 < 6:
        c.px(x, 114 + (x // 17) % 2, 'wood', 4)
c.rect(70, 122, 78, 124, 'brass', 4)             # tirador del cajón
c.rect(71, 124, 77, 125, 'brass', 2)

# pergamino abierto y tintero con pluma
c.rect(30, 110, 60, 113, 'paper', 4)
c.rect(30, 110, 60, 111, 'paper', 5)
for k in range(5):
    c.rect(33 + k * 5, 111, 36 + k * 5, 112, 'paper', 2)
c.rect(28, 109, 31, 114, 'paper', 3)
c.rect(59, 109, 62, 114, 'paper', 3)
c.rect(70, 106, 76, 112, 'glass', 1)
c.rect(71, 105, 75, 106, 'brass', 4)
c.rect(71, 107, 72, 111, 'glass', 4)
for i in range(9):                               # pluma
    c.px(75 + i * 0.6, 105 - i, 'petal', 3 if i < 7 else 4)
    c.px(76 + i * 0.6, 105 - i, 'petal', 2)

# ------------------------------------------------------------------ farol de latón sobre el alféizar
LX = 94
c.rect(LX - 7, 104, LX + 8, 106, 'brass', 2)     # base
c.rect(LX - 6, 102, LX + 7, 104, 'brass', 4)
c.rect(LX - 6, 102, LX + 7, 103, 'brass', 5)
c.rect(LX - 5, 86, LX + 6, 102, 'glow', 2)       # vidrio con luz adentro
c.rect(LX - 5, 86, LX - 4, 102, 'brass', 3)      # barras
c.rect(LX + 5, 86, LX + 6, 102, 'brass', 1)
c.rect(LX, 86, LX + 1, 102, 'brass', 2)
c.rect(LX - 3, 87, LX - 2, 100, 'glow', 4)       # reflejo en el vidrio
flame = ["..h..", ".hfh.", ".fwf.", "hfwfh", ".fff.", "..r.."]
c.sprite(LX - 2, 92, flame, 'flame', {'h': 2, 'f': 3, 'w': 5, 'r': 1})
c.rect(LX - 1, 98, LX + 2, 101, 'paper', 4)      # vela
c.rect(LX - 7, 84, LX + 8, 86, 'brass', 3)       # tapa
c.rect(LX - 7, 84, LX + 8, 85, 'brass', 5)
c.rect(LX - 5, 82, LX + 6, 84, 'brass', 4)
c.rect(LX - 3, 80, LX + 4, 82, 'brass', 3)
c.rect(LX - 1, 78, LX + 2, 80, 'brass', 4)
for (ox, oy) in [(-2, 74), (-3, 75), (-3, 76), (-2, 77), (2, 74), (3, 75), (3, 76), (2, 77), (-1, 73), (0, 73), (1, 73)]:
    c.px(LX + ox, oy, 'brass', 4)               # argolla

# macetas sobre el alféizar (encima del vidrio, delante de la hiedra de atrás)
pot(30, 93)
drape(31, 37, 81, 3, 12, 6, sway=1, every=2, big=False)
pot(62, 94, 7, 5)
for (fx, fy) in [(63, 89), (66, 87), (68, 90)]:
    c.sprite(fx - 1, fy - 1, [".p.", "pyp", ".p."], 'petal', {'p': 3, 'y': ('flame', 4)})
    c.line(fx, fy + 1, 65, 94, 'stem', 3)
leaf(64, 90, 5, 1); leaf(67, 91, 5, 2, flip=False)

# ------------------------------------------------------------------ capas de hiedra de adelante
drape(-4, 16, 6, 4, 110, 4, sway=3.5)
drape(82, 102, 6, 4, 74, 4, sway=2.5)
drape(22, 40, 6, 2, 26, 4, sway=1.5)
drape(66, 84, 6, 2, 22, 4, sway=1.5)
drape(112, 156, 6, 4, 22, 4, sway=1.5)
drape(-6, 8, 6, 3, 118, 5, sway=4)              # la más cercana, bien iluminada

# ------------------------------------------------------------------ luz
# 1) brillo general que entra por la ventana
dwin = np.hypot((xx - CX) / 1.2, yy - 66)
c.add_light(np.clip(1.6 - dwin / 30, 0, 1.6))
# 2) haz de sol: cada píxel mira hacia arriba-izquierda; si "ve" vidrio, está en el haz
#    (así los parteluces proyectan su sombra de verdad)
shaft = np.zeros((H, W), np.float32)
dx, dy = 0.62, 1.0
for s in range(4, 90, 1):
    sx = np.clip(np.round(xx - dx * s).astype(int), 0, W - 1)
    sy = np.clip(np.round(yy - dy * s).astype(int), 0, H - 1)
    hit = glass_only[sy, sx] & (yy - dy * s >= 0) & (shaft == 0)
    shaft[hit] = np.clip(1.25 - s / 110, 0, 1)
inside = glass                                   # el cielo no recibe haz
desk = (yy >= 112) | ((yy >= 99) & (yy < 102) & (xx >= 24) & (xx < 92))
c.add_light(np.where(inside, 0, shaft * np.where(desk, 2.6, 0.55)))
# 3) farol y su halo
dl = np.hypot(xx - LX, (yy - 94) * 1.1)
c.add_light(np.clip(1 - dl / 30, 0, 1) ** 1.8 * 2.2)
# 4) rincones oscuros (viñeta hacia la estantería y el techo)
c.add_light(-np.clip((xx - 112) / 26, 0, 1.6) - np.clip((22 - yy) / 12, 0, 1.2) - np.clip((12 - xx) / 10, 0, 1) - np.clip((yy - 116) / 8, 0, 1))
# 5) polvo flotando en el haz
for _ in range(26):
    px, py = rnd.randint(0, W - 1), rnd.randint(10, 110)
    if shaft[py, px] > 0.3 and not glass[py, px] and c.names[c.mat[py, px]] in ('wall', 'wood', 'stone'):
        c.px(px, py, 'glow', 5); c.lock[py, px] = True

img = c.render(4)
img.save(OUT / 'muestra-ventana.png')

# comparación ANTES / AHORA (mismo encuadre del arte original 1672x941)
orig = Image.open(ROOT / 'dist/assets/home-scenes/refugio-012.png').convert('RGB').crop((0, 0, W * 4, H * 4))
both = Image.new('RGB', (W * 8 + 16, H * 4), (20, 12, 16))
both.paste(orig, (0, 0)); both.paste(img, (W * 4 + 16, 0))
both.save(OUT / 'antes-ahora-muestra.png')
print('ok', img.size)
