"""Grimorio del tutorial de Nexo (pixel art, v3): libro de cuero abombado con cara, barba de mechones, manitas y marcapáginas, sobre un atril mágico.

Usa el motor y las rampas del refugio (tools/home-pixel/pixel.py). Cada pose es un cuadro de 68x76 px de arte (se muestra x4).
Salida:
  dist/assets/tutorial/grimorio-v1.png        hoja con fondo transparente (5 poses en fila)
  docs/tutorial/grimorio-v1-preview.png       vista previa x4 sobre fondo del refugio, con nombres
Uso:  python tools/tutorial-pixel/build_grimorio.py
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools' / 'home-pixel'))
from pixel import Canvas, glow, hexes  # noqa: E402

W, H = 68, 76
BX0, BX1, BY0, BY1 = 12, 44, 14, 50      # tapa del libro (32 x 36)
CX = 30                                   # centro de la cara (sin el lomo)
LEDGE = 63                                # tapa del atril

POSES = {
    #              dy  ojos      cejas    boca      mano der  mano izq
    'reposo':     dict(dy=0,  eye='open',   brow='idle',  mouth='closed', rh='down',  lh='down', look=1),
    'senalar':    dict(dy=-1, eye='open',   brow='idle',  mouth='talk',   rh='point', lh='down', look=1),
    'abrir':      dict(dy=0,  eye='open',   brow='idle',  mouth='talk',   rh='hold',  lh='down', look=1, panel=True),
    'importante': dict(dy=-1, eye='wide',   brow='up',    mouth='o',      rh='up',    lh='up',   look=0, excl=True),
    'dormido':    dict(dy=1,  eye='closed', brow='relax', mouth='snore',  rh='down',  lh='down', look=0, zz=True),
}


def ell(c, cx, cy, rx, ry):
    yy, xx = c.grid()
    return ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1.0


def erode(m):
    p = np.pad(m, 1)
    return m & p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:]


# ---------------------------------------------------------------- atril
def atril(c):
    ax = CX
    for sx in (-1, 1):                                          # patas con pie
        x = ax + sx * 14
        c.rect(x - 2, LEDGE + 4, x + 2, H - 1, 'wood', 3)
        c.rect(x - 2 if sx < 0 else x, LEDGE + 4, x - 1 if sx < 0 else x + 2, H - 1, 'wood', 4 if sx < 0 else 2)
        c.rect(x - 4, H - 3, x + 4, H - 1, 'wood', 3)
        c.rect(x - 4, H - 3, x + 4, H - 2, 'wood', 5)
    c.rect(ax - 20, LEDGE, ax + 20, LEDGE + 1, 'wood', 7)       # tapa
    c.rect(ax - 20, LEDGE + 1, ax + 20, LEDGE + 2, 'brass', 5)  # canto de latón
    c.rect(ax - 20, LEDGE + 2, ax + 20, LEDGE + 4, 'wood', 4)
    c.rect(ax - 20, LEDGE + 3, ax + 20, LEDGE + 4, 'wood', 2)
    for sx in (-20, 19):
        c.rect(ax + sx, LEDGE, ax + sx + 1, LEDGE + 4, 'brass', 4)
    for j in range(7):                                          # paño mágico con flecos de latón
        half = 10 - j // 3
        y = LEDGE + 4 + j
        c.rect(ax - half, y, ax + half + 1, y + 1, 'arcane', 3)
        c.rect(ax - half, y, ax - half + 1, y + 1, 'arcane', 4)
        c.rect(ax + half, y, ax + half + 1, y + 1, 'arcane', 2)
        c.rect(ax - 1, y, ax + 1, y + 1, 'arcane', 4)
    for x in range(ax - 8, ax + 9, 2):
        c.px(x, LEDGE + 11, 'brass', 4)
    c.sprite(ax - 1, LEDGE + 6, ['.#.', '###'], 'rune', {'#': 5})   # símbolo de fuego en el paño


def velas(c):
    for x in (CX - 17, CX + 14):
        c.rect(x, LEDGE - 3, x + 3, LEDGE, 'wax', 4)
        c.rect(x, LEDGE - 3, x + 1, LEDGE, 'wax', 5)
        c.rect(x + 2, LEDGE - 3, x + 3, LEDGE, 'wax', 2)
        c.px(x + 1, LEDGE - 4, 'clay', 0)
        c.rect(x, LEDGE - 6, x + 3, LEDGE - 4, 'flame', 3)
        c.px(x + 1, LEDGE - 6, 'flame', 4)
        c.px(x + 1, LEDGE - 7, 'flame', 5)


# ---------------------------------------------------------------- libro
def libro(c, dy):
    x0, x1, y0, y1 = BX0, BX1, BY0 + dy, BY1 + dy
    yy, xx = c.grid()
    # páginas gruesas (lado y abajo)
    c.rect(x1, y0 + 3, x1 + 4, y1 + 2, 'paper', 4)
    c.rect(x0 + 3, y1, x1 + 4, y1 + 4, 'paper', 4)
    for y in range(y0 + 4, y1 + 1, 2):
        c.rect(x1, y, x1 + 4, y + 1, 'paper', 3)
    for x in range(x0 + 4, x1 + 1, 2):
        c.rect(x, y1, x + 1, y1 + 4, 'paper', 3)
    c.rect(x1 + 3, y0 + 3, x1 + 4, y1 + 2, 'paper', 2)
    c.rect(x0 + 3, y1 + 3, x1 + 3, y1 + 4, 'paper', 2)

    # tapa abombada con esquinas suaves
    r = 4.0
    m = (xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1)
    for (cx_, cy_, sx, sy) in ((x0, y0, 1, 1), (x1 - 1, y0, -1, 1), (x0, y1 - 1, 1, -1), (x1 - 1, y1 - 1, -1, -1)):
        ccx, ccy = cx_ + sx * r, cy_ + sy * r
        corner = ((xx - ccx) * sx < 0) & ((yy - ccy) * sy < 0)
        m &= ~(corner & (np.hypot(xx - ccx, yy - ccy) > r + 0.2))
    w, h = x1 - x0, y1 - y0
    hx, hy = x0 + 0.40 * w, y0 + 0.32 * h
    d = np.hypot((xx - hx) / (0.78 * w), (yy - hy) / (0.85 * h))
    lvl = np.select([d < 0.22, d < 0.45, d < 0.72], [5, 4, 3], 2).astype(np.float32)
    hsh = (xx.astype(int) * 7 + yy.astype(int) * 13) % 17
    lvl = np.clip(lvl - (hsh == 0) + (hsh == 6), 1, 5).astype(np.float32)   # cuero gastado
    edge = m & ~erode(m)
    lit = (xx - x0) + (yy - y0) < (w + h) * 0.42
    lvl[edge & lit] = 5
    lvl[edge & ~lit] = 1
    c.mask(m, 'clay', lvl)

    # lomo curvo con cinchas de latón
    for i, l in enumerate((3, 4, 3, 2)):
        c.mask(m & (xx == x0 + i), 'clay', l)
    for by in (y0 + 5, y0 + 17, y0 + 29):
        for i, l in enumerate((4, 6, 5, 3)):
            c.rect(x0 + i, by, x0 + i + 1, by + 2, 'brass', l)
    # filete de latón (esquinas cortadas)
    bx0, bx1, by0, by1 = x0 + 5, x1 - 3, y0 + 3, y1 - 3
    for (a, b, cc, e) in ((bx0 + 1, by0, bx1 - 1, by0 + 1), (bx0 + 1, by1 - 1, bx1 - 1, by1),
                          (bx0, by0 + 1, bx0 + 1, by1 - 1), (bx1 - 1, by0 + 1, bx1, by1 - 1)):
        c.rect(a, b, cc, e, 'brass', 2)
    # esquineros que abrazan la esquina redondeada
    for (cx_, cy_) in ((x0, y0), (x1 - 1, y0), (x0, y1 - 1), (x1 - 1, y1 - 1)):
        cm = m & (np.abs(xx - cx_) + np.abs(yy - cy_) <= 5)
        c.mask(cm, 'brass', 4)
    c.rect(x1 - 2, y0 + 15, x1 + 1, y0 + 21, 'brass', 4)             # broche dorado
    c.rect(x1 - 2, y0 + 15, x1 + 1, y0 + 16, 'brass', 6)
    c.px(x1 - 1, y0 + 18, 'brass', 1)


def pagina_con_oreja(c, dy):
    y0 = BY0 + dy
    x = BX1 + 3
    c.rect(x, y0 + 12, x + 6, y0 + 22, 'paper', 5)
    c.rect(x, y0 + 12, x + 6, y0 + 13, 'paper', 4)
    for j in (15, 17):
        c.rect(x + 1, y0 + j, x + 4, y0 + j + 1, 'paper', 2)
    c.rect(x + 4, y0 + 20, x + 6, y0 + 22, 'paper', 3)               # esquina doblada
    c.px(x + 5, y0 + 21, 'paper', 1)


def detalles_libro(c, dy):
    y0, y1 = BY0 + dy, BY1 + dy
    # un solo remiendo con puntadas (abajo, izquierda)
    c.rect(BX0 + 4, y1 - 11, BX0 + 12, y1 - 4, 'green', 3)
    c.rect(BX0 + 4, y1 - 11, BX0 + 12, y1 - 10, 'green', 4)
    for i in range(BX0 + 4, BX0 + 12, 2):
        c.px(i, y1 - 11, 'paper', 4)
        c.px(i, y1 - 5, 'paper', 4)
    for j in range(y1 - 9, y1 - 5, 2):
        c.px(BX0 + 4, j, 'paper', 4)
        c.px(BX0 + 11, j, 'paper', 4)
    # mancha de tinta en las páginas
    for (a, b, l) in ((0, 0, 1), (1, 0, 0), (-1, 1, 1), (0, 1, 0), (1, 1, 0), (2, 2, 1)):
        c.px(BX1 + 1 + a, y0 + 32 + b, 'blue', l)
    # emblema alquímico (triángulo de fuego) entre las cejas
    c.sprite(CX - 1, y0 + 4, ['.#.', '###'], 'brass', {'#': 5})
    c.px(CX, y0 + 4, 'brass', 6)


# ---------------------------------------------------------------- cara
def ojo(c, ex, ey, kind, look):
    if kind == 'closed':
        for i, dy_ in enumerate((0, 1, 2, 2, 2, 2, 1, 0)):
            c.px(ex + i, ey + 2 + dy_, 'clay', 0)
        c.px(ex, ey + 1, 'clay', 0)
        c.px(ex + 7, ey + 1, 'clay', 0)
        return
    inner = 5 if kind == 'open' else 7
    rows = ['.oooooo.'] + ['o######o'] * inner + ['.oooooo.']
    c.sprite(ex, ey, rows, 'wax', {'o': ('clay', 0), '#': ('wax', 5)})
    c.rect(ex + 1, ey + 1, ex + 7, ey + 2, 'wax', 3)                 # sombra del párpado
    top = ey + 2 + (inner - 5) // 2 + (1 if kind == 'wide' else 0)
    ix = ex + 2 + look
    c.rect(ix, top, ix + 4, top + 4, 'crystal', 4)                  # iris
    c.rect(ix, top + 2, ix + 4, top + 4, 'crystal', 3)
    c.rect(ix + 1, top + 1, ix + 3, top + 3, 'clay', 0)             # pupila
    c.px(ix, top, 'wax', 5)                                         # dos brillos
    c.px(ix + 1, top, 'wax', 5)
    c.px(ix + 3, top + 3, 'crystal', 7)


def ceja(c, x, y, outer_dy, inner_dy, outer_left):
    for i in range(8):
        t = i / 7
        if not outer_left:
            t = 1 - t
        yy = int(round(outer_dy * (1 - t) + inner_dy * t))
        c.px(x + i, y + yy, 'petal', 4)
        c.px(x + i, y + yy + 1, 'petal', 2)
        if i in (2, 3, 4, 5):
            c.px(x + i, y + yy - 1, 'petal', 3)


def cara(c, p, dy):
    ey = BY0 + dy + 8
    ex_l, ex_r = CX - 11, CX + 3
    ojo(c, ex_l, ey, p['eye'], p['look'])
    ojo(c, ex_r, ey, p['eye'], p['look'])
    od, idd = {'idle': (-1, 0), 'up': (-3, -4), 'relax': (1, 0)}[p['brow']]
    ceja(c, ex_l, ey - 3, od, idd, True)
    ceja(c, ex_r, ey - 3, od, idd, False)
    c.rect(ex_l + 1, ey + 8, ex_l + 5, ey + 10, 'red', 5)             # mejillas
    c.rect(ex_r + 3, ey + 8, ex_r + 7, ey + 10, 'red', 5)
    c.sprite(CX - 2, ey + 6, ['.##.', '####', '####', '.##.'], 'clay', {'#': 5})   # nariz
    c.rect(CX - 1, ey + 9, CX + 1, ey + 10, 'clay', 3)
    return ey


def mechon(c, xc, ytop, length, width, sway):
    """Un mechón de barba que se afina hacia abajo y ondula; sombra azulada a la derecha."""
    yy, xx = c.grid()
    t = (yy - ytop) / float(length)
    hw = width * (1 - np.clip(t, 0, 1) ** 1.25) + 0.7
    center = xc + sway * np.sin(np.clip(t, 0, 1) * np.pi * 1.2)
    m = (t >= 0) & (t <= 1) & (np.abs(xx - center) <= hw)
    lvl = np.full(yy.shape, 3.0, np.float32)
    lvl[xx < center - hw * 0.25] = 4
    lvl[xx > center + hw * 0.35] = 2
    lvl[((t > 0.2) & (np.abs(xx - center) < 0.7))] = 2              # línea de pelo en el centro del mechón
    e = m & ~erode(m)
    lvl[e & (xx > center)] = 1
    c.mask(m, 'petal', lvl)


def barba(c, ey, p):
    my = ey + 10
    mechon(c, CX - 6, my, 20, 6, -1.5)
    mechon(c, CX + 6, my, 20, 6, 1.5)
    mechon(c, CX, my, 27, 7, 1.2)
    k = p['mouth']
    if k == 'talk':
        c.mask(ell(c, CX, my + 4, 3, 2), 'red', 0)
        c.rect(CX - 1, my + 5, CX + 2, my + 6, 'red', 4)
    elif k == 'o':
        c.mask(ell(c, CX, my + 5, 2, 3), 'red', 0)
        c.rect(CX - 1, my + 6, CX + 1, my + 7, 'red', 3)
    elif k == 'snore':
        c.mask(ell(c, CX, my + 4, 2, 1.6), 'red', 0)
    else:
        c.rect(CX - 3, my + 4, CX + 4, my + 5, 'clay', 0)
        c.px(CX - 4, my + 3, 'clay', 0)
        c.px(CX + 4, my + 3, 'clay', 0)
    yy, xx = c.grid()
    mm = ell(c, CX - 5, my, 6, 2.5) | ell(c, CX + 5, my, 6, 2.5)
    ml = (3 + (yy < my - 1) - (yy > my + 1)).astype(np.float32)
    c.mask(mm, 'petal', ml)
    for sx in (-11, 11):
        c.px(CX + sx, my - 1, 'petal', 4)
        c.px(CX + sx + (1 if sx < 0 else -1), my - 2, 'petal', 3)


def marcapaginas(c, dy, sway):
    x = BX1 - 6
    for j in range(10):
        sx = int(round(sway * (j / 9.0) ** 1.5))
        c.rect(x + sx, BY1 + dy + j + 1, x + sx + 4, BY1 + dy + j + 2, 'red', 4 if j < 9 else 3)
        c.px(x + sx, BY1 + dy + j + 1, 'red', 5)
        c.px(x + sx + 3, BY1 + dy + j + 1, 'red', 2)
    c.rect(x + sway + 1, BY1 + dy + 9, x + sway + 3, BY1 + dy + 11, 'clay', 0)   # muesca en V


# ---------------------------------------------------------------- manos
def manopla(c, x, y, finger=False):
    c.sprite(x, y, ['.####.', '######', '######', '######', '.####.'], 'clay', {'#': 5})
    c.rect(x, y + 3, x + 6, y + 4, 'clay', 4)
    c.rect(x + 5, y + 1, x + 6, y + 4, 'clay', 4)
    c.px(x + 1, y + 1, 'clay', 5)
    if finger:
        c.rect(x + 6, y + 1, x + 12, y + 3, 'clay', 5)
        c.rect(x + 6, y + 2, x + 12, y + 3, 'clay', 4)
        c.rect(x + 11, y + 1, x + 12, y + 3, 'clay', 5)


def brazo(c, x0, y0, x1, y1):
    for k in range(3):
        c.line(x0, y0 + k, x1, y1 + k, 'arcane', 4 if k == 0 else 3)
    c.line(x1, y1, x1, y1 + 2, 'petal', 3)


def manos(c, p, dy):
    lh, rh = p['lh'], p['rh']
    if lh == 'down':
        brazo(c, BX0, 31 + dy, BX0 - 4, 34 + dy)
        manopla(c, BX0 - 10, 33 + dy)
    elif lh == 'up':
        brazo(c, BX0, 28 + dy, BX0 - 5, 21 + dy)
        manopla(c, BX0 - 11, 15 + dy)
    if rh == 'down':
        brazo(c, BX1 + 4, 31 + dy, BX1 + 9, 34 + dy)
        manopla(c, BX1 + 7, 34 + dy)
    elif rh == 'up':
        brazo(c, BX1 + 4, 28 + dy, BX1 + 9, 21 + dy)
        manopla(c, BX1 + 6, 15 + dy)
    elif rh == 'point':
        brazo(c, BX1 + 4, 27 + dy, BX1 + 12, 21 + dy)
        manopla(c, BX1 + 9, 15 + dy, finger=True)
    elif rh == 'hold':
        brazo(c, BX1 + 4, 33 + dy, BX1 + 11, 36 + dy)
        manopla(c, BX1 + 9, 35 + dy)


# ---------------------------------------------------------------- extras
def panel(c, dy):
    x0, y0, x1, y1 = 51, 7 + dy, 67, 33 + dy
    c.rect(x0, y0, x1, y1, 'brass', 3)
    c.rect(x0 + 1, y0 + 1, x1 - 1, y1 - 1, 'paper', 5)
    c.rect(x0 + 1, y1 - 3, x1 - 1, y1 - 1, 'paper', 4)
    for i, row in enumerate((y0 + 5, y0 + 12, y0 + 19)):
        c.rect(x0 + 3, row, x0 + 5, row + 2, 'green', 4)
        c.px(x0 + 3, row, 'green', 5)
        c.rect(x0 + 7, row, x1 - 3 - (i % 2) * 3, row + 1, 'paper', 2)
        c.rect(x0 + 7, row + 2, x1 - 6 + (i % 2) * 2, row + 3, 'paper', 1)
    c.rect(x0, y0, x1, y0 + 1, 'brass', 5)


def exclamacion(c, dy):
    x = CX - 2
    c.rect(x, 1, x + 4, 6, 'rune', 4)
    c.rect(x, 1, x + 1, 6, 'rune', 5)
    c.rect(x + 3, 1, x + 4, 6, 'rune', 3)
    c.rect(x, 8, x + 4, 10, 'rune', 4)
    c.rect(x, 8, x + 1, 10, 'rune', 5)
    c.rect(x + 3, 8, x + 4, 10, 'rune', 3)


def zeta(c, x, y, s):
    rows = ['#' * s] + [('.' * (s - 1 - i)) + '#' + ('.' * i) for i in range(s - 2)] + ['#' * s]
    c.sprite(x, y, rows, 'crystal', {'#': 6})
    c.px(x, y, 'crystal', 7)


def particulas(c):
    for (x, y, m, l) in ((3, 48, 'rune', 4), (7, 57, 'arcane', 5), (63, 50, 'rune', 3), (64, 58, 'arcane', 4)):
        c.px(x, y, m, l)


# ---------------------------------------------------------------- cuadro
def cuadro(name, p):
    c = Canvas(W, H)
    dy = p['dy']
    atril(c)
    velas(c)
    manos(c, p, dy)
    pagina_con_oreja(c, dy)
    libro(c, dy)
    detalles_libro(c, dy)
    ey = cara(c, p, dy)
    barba(c, ey, p)
    marcapaginas(c, dy, 2 if name != 'dormido' else 1)
    if p.get('panel'):
        panel(c, dy)
    if p.get('excl'):
        exclamacion(c, dy)
    if name != 'dormido':
        particulas(c)
    if p.get('zz'):
        zeta(c, BX1 + 9, 12, 6)
        zeta(c, BX1 + 16, 5, 4)
    filled = c.mat != 0                                          # contorno exterior oscuro
    pad = np.pad(filled, 1)
    nb = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
    edge = nb & ~filled
    c.mat[edge] = c.mid('clay')
    c.lvl[edge] = 0

    cl, cr = CX - 16, CX + 15
    if name == 'dormido':
        halos = [(CX, LEDGE + 2, 22, '#5072a0', 0.7, 2.6), (cl, LEDGE - 6, 8, '#f89a30', 0.5, 1.0), (cr, LEDGE - 6, 8, '#f89a30', 0.5, 1.0)]
    else:
        halos = [(CX, LEDGE + 2, 26, '#9060dc', 0.9, 2.6), (cl, LEDGE - 6, 9, '#f89a30', 0.8, 1.0), (cr, LEDGE - 6, 9, '#f89a30', 0.8, 1.0)]
    if p.get('excl'):
        halos.append((CX, 30, 30, '#ffd860', 0.6, 1.0))
    if p.get('panel'):
        halos.append((59, 20, 16, '#fff0a8', 0.7, 1.0))

    def post(arr):
        for (hx, hy, r, col, s, sq) in halos:
            glow(arr, hx, hy, r, col, s, 4, sq)

    base = np.array(c.render(scale=1))
    lit = np.array(c.render(scale=1, post=post))
    solid = c.mat != 0
    diff = np.abs(lit.astype(int) - base.astype(int)).sum(axis=2)
    alpha = np.where(solid, 255, np.clip(diff * 1.3, 0, 150)).astype(np.uint8)
    return Image.fromarray(np.dstack([lit, alpha]), 'RGBA')


def main():
    frames = [(n, cuadro(n, p)) for n, p in POSES.items()]
    sheet = Image.new('RGBA', (W * len(frames), H), (0, 0, 0, 0))
    for i, (_, im) in enumerate(frames):
        sheet.paste(im, (i * W, 0))
    out = ROOT / 'dist' / 'assets' / 'tutorial'
    out.mkdir(parents=True, exist_ok=True)
    sheet.save(out / 'grimorio-v1.png')

    S = 4
    big = sheet.resize((sheet.width * S, sheet.height * S), Image.NEAREST)
    bg = Image.new('RGBA', (big.width, big.height + 28), hexes('#45302c')[0] + (255,))
    bg.alpha_composite(big, (0, 0))
    d = ImageDraw.Draw(bg)
    for i, (n, _) in enumerate(frames):
        d.text((i * W * S + 8, big.height + 8), n, fill=(255, 240, 196, 255))
    bg.convert('RGB').save(ROOT / 'docs' / 'tutorial' / 'grimorio-v1-preview.png')
    print('ok', sheet.size)


if __name__ == '__main__':
    main()
