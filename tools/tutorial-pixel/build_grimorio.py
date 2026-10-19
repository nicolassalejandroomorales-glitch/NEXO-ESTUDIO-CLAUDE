"""Grimorio del tutorial de Nexo (pixel art, v4 por capas): libro de cuero abombado con cara, barba de mechones, manitas y marcapáginas, sobre un atril mágico.

Usa el motor y las rampas del refugio (tools/home-pixel/pixel.py). Cada pose es un cuadro de 68x76 px de arte (se muestra x4) y se dibuja en CAPAS
que dist/tutorial/grimorio-vivo.js apila en un canvas (de atrás hacia adelante), para que cada pieza se mueva por separado:
  grimorio-fondo.png   atril y velas, con el halo de luz de la pose
  grimorio-manoI.png   brazo y mano izquierda (detrás del libro)
  grimorio-manoD.png   brazo y mano derecha, con el cartel si lo sostiene (detrás del libro)
  grimorio-libro.png   libro, páginas y marcapáginas
  grimorio-cara.png    ojos, cejas, mejillas, nariz y lágrimas/sudor (2 columnas: normal, parpadeo)
  grimorio-barba.png   mechones y bigote
  grimorio-boca.png    boca (3 columnas: cerrada, media, abierta)
  grimorio-extras.png  accesorios flotantes: nubes, signos, estrellas, estela, zZ, chispas
  grimorio-capas.json  filas, orden de capas y medidas        (todo en dist/assets/tutorial/; 16 poses por hoja, 'dormido' al final)
  docs/tutorial/grimorio-expresiones-preview.png   vista previa x2 de las 16 poses apilando las capas
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


# Segunda tanda: expresiones, poses nuevas y boca animada (3 cuadros por pose: cerrada, media, abierta)
_D = dict(rh='down', lh='down', look=0)
HABLAR = {
    'reposo':      dict(POSES['reposo'], mouth='neutral'),
    'senalar':     dict(POSES['senalar'], mouth='neutral', fx='senalar'),
    'abrir':       dict(POSES['abrir'], mouth='neutral'),
    'importante':  dict(POSES['importante'], mouth='o'),
    'feliz':       dict(dy=0, eye='happy', brow='idle', mouth='smile', **_D),
    'sorprendido': dict(dy=-1, eye='wide', brow='up', mouth='o', **_D),
    'pensativo':   dict(dy=0, eye='open', brow=('idle', 'up'), mouth='flat', rh='up', lh='down', look=1, fx='pensar'),
    'triste':      dict(dy=1, eye='open', brow='sad', mouth='frown', tear=True, fx='lluvia', halo='#4a6aa8', **_D),
    'enojado':     dict(dy=0, eye='open', brow='angry', mouth='grit', rh='up', lh='up', look=0, mark=True),
    'espiral':     dict(dy=0, eye='spiral', brow='relax', mouth='wavy', stars=True, **_D),
    'sudor':       dict(dy=0, eye='open', brow='sad', mouth='wavy', sweat=True, fx='nervios', rh='down', lh='down', look=-1),
    'guino':       dict(dy=0, eye=('open', 'happy'), brow='idle', mouth='smile', spark=True, rh='down', lh='down', look=1),
    'nocreo':      dict(dy=0, eye='lid', brow=('idle', 'up'), mouth='flat', rh='down', lh='down', look=-1),
    'lista':       dict(dy=0, eye='open', brow='idle', mouth='neutral', rh='hold', lh='down', look=1, panel='lista'),
    'dedo':        dict(dy=-1, eye='open', brow='up', mouth='neutral', rh='finger', lh='down', look=1, idea=True),
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
        c.px(x + 1, LEDGE - 4, 'clay', 0)            # solo la mecha: la llama se anima aparte (build_llama.py)


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
SPIRAL = ['######', '#....#', '#.##.#', '#..#.#', '####.#']


def ojo(c, ex, ey, kind, look):
    if kind == 'happy':                                   # arco ^ (ojo feliz / guiño)
        for i, d in enumerate((3, 2, 1, 1, 1, 1, 2, 3)):
            c.px(ex + i, ey + 1 + d, 'clay', 0)
            c.px(ex + i, ey + 2 + d, 'clay', 0)
        return
    if kind == 'spiral':                                  # ojo en espiral
        rows = ['.oooooo.'] + ['o######o'] * 5 + ['.oooooo.']
        c.sprite(ex, ey, rows, 'wax', {'o': ('clay', 0), '#': ('wax', 5)})
        for j, row in enumerate(SPIRAL):
            for i, ch in enumerate(row):
                if ch == '#':
                    c.px(ex + 1 + i, ey + 1 + j, 'crystal', 3)
        return
    lid = kind == 'lid'                                   # párpado a medias (desconfianza)
    if lid:
        kind = 'open'
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
    if lid:
        c.rect(ex + 1, ey + 1, ex + 7, ey + 3, 'clay', 3)
        c.rect(ex + 1, ey + 3, ex + 7, ey + 4, 'clay', 0)


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


BROWS = {'idle': (-1, 0), 'up': (-3, -4), 'relax': (1, 0), 'angry': (-2, 2), 'sad': (2, -2)}


def cara(c, p, dy):
    ey = BY0 + dy + 8
    ex_l, ex_r = CX - 11, CX + 3
    el, er = p['eye'] if isinstance(p['eye'], tuple) else (p['eye'],) * 2
    bl, br = p['brow'] if isinstance(p['brow'], tuple) else (p['brow'],) * 2
    ojo(c, ex_l, ey, el, p['look'])
    ojo(c, ex_r, ey, er, p['look'])
    ceja(c, ex_l, ey - 3, *BROWS[bl], True)
    ceja(c, ex_r, ey - 3, *BROWS[br], False)
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


def boca_fase(c, my, style, phase):
    """Boca de 3 cuadros: 0 cerrada, 1 media, 2 abierta."""
    yy, xx = c.grid()
    dark = ('red', 0)
    if style in ('neutral', 'flat'):
        if phase == 0:
            c.rect(CX - 3, my + 4, CX + 4, my + 5, 'clay', 0)
            if style == 'neutral':
                c.px(CX - 4, my + 3, 'clay', 0)
                c.px(CX + 4, my + 3, 'clay', 0)
        elif phase == 1:
            c.mask(ell(c, CX, my + 4, 2.6, 1.4), *dark)
        else:
            c.mask(ell(c, CX, my + 4, 3, 2), *dark)
            c.rect(CX - 1, my + 5, CX + 2, my + 6, 'red', 4)
    elif style == 'smile':
        if phase == 0:
            c.rect(CX - 3, my + 4, CX + 4, my + 5, 'clay', 0)
            for sx in (-4, 4):
                c.px(CX + sx, my + 3, 'clay', 0)
            for sx in (-5, 5):
                c.px(CX + sx, my + 2, 'clay', 0)
        else:
            ry = 1.8 if phase == 1 else 3
            c.mask(ell(c, CX, my + 3.5, 4, ry) & (yy >= my + 3), *dark)
            c.rect(CX - 4, my + 3, CX + 5, my + 4, 'clay', 0)
            if phase == 2:
                c.rect(CX - 2, my + 5, CX + 3, my + 6, 'red', 4)
    elif style == 'frown':
        if phase == 0:
            c.rect(CX - 3, my + 5, CX + 4, my + 6, 'clay', 0)
            for sx in (-4, 4):
                c.px(CX + sx, my + 6, 'clay', 0)
        else:
            c.mask(ell(c, CX, my + 5, 2.2, 1.2 if phase == 1 else 2.2), *dark)
            c.rect(CX - 3, my + 3, CX + 4, my + 4, 'clay', 0)
    elif style == 'grit':
        h = (1, 2, 3)[phase]
        c.rect(CX - 4, my + 4, CX + 5, my + 5 + h, *dark)
        c.rect(CX - 4, my + 4, CX + 5, my + 5, 'paper', 5)
        for x in (CX - 2, CX, CX + 2):
            c.px(x, my + 4, 'clay', 2)
        if h > 1:
            c.rect(CX - 4, my + 4 + h, CX + 5, my + 5 + h, 'paper', 4)
    elif style == 'wavy':
        for i, x in enumerate(range(CX - 4, CX + 5)):
            c.px(x, my + 4 + (i % 2), 'clay', 0)
        if phase:
            c.mask(ell(c, CX, my + 5.5, 2, 1 if phase == 1 else 1.6), *dark)
    elif style == 'o':
        r = (1, 1.6, 2)[phase]
        c.mask(ell(c, CX, my + 5, r, (1.2, 2.2, 3)[phase]), *dark)
        if phase == 2:
            c.rect(CX - 1, my + 6, CX + 1, my + 7, 'red', 3)


def barba(c, ey):
    """Mechones y bigote (sin boca: la boca es otra capa)."""
    my = ey + 10
    mechon(c, CX - 6, my, 20, 6, -1.5)
    mechon(c, CX + 6, my, 20, 6, 1.5)
    mechon(c, CX, my, 27, 7, 1.2)
    yy, xx = c.grid()
    mm = ell(c, CX - 5, my, 6, 2.5) | ell(c, CX + 5, my, 6, 2.5)
    ml = (3 + (yy < my - 1) - (yy > my + 1)).astype(np.float32)
    c.mask(mm, 'petal', ml)
    for sx in (-11, 11):
        c.px(CX + sx, my - 1, 'petal', 4)
        c.px(CX + sx + (1 if sx < 0 else -1), my - 2, 'petal', 3)


def boca(c, ey, p, phase):
    """Boca de la pose; phase None = boca fija (solo 'dormido')."""
    my = ey + 10
    k = p['mouth']
    if phase is not None:
        boca_fase(c, my, k, phase)
    elif k == 'snore':
        c.mask(ell(c, CX, my + 4, 2, 1.6), 'red', 0)
    else:
        raise ValueError('boca fija solo para snore: ' + k)


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


def mano_izq(c, p, dy):
    lh = p['lh']
    if lh == 'down':
        brazo(c, BX0, 31 + dy, BX0 - 4, 34 + dy)
        manopla(c, BX0 - 10, 33 + dy)
    elif lh == 'up':
        brazo(c, BX0, 28 + dy, BX0 - 5, 21 + dy)
        manopla(c, BX0 - 11, 15 + dy)


def mano_der(c, p, dy):
    rh = p['rh']
    if rh == 'down':
        brazo(c, BX1 + 4, 31 + dy, BX1 + 9, 34 + dy)
        manopla(c, BX1 + 7, 34 + dy)
    elif rh == 'up':
        brazo(c, BX1 + 4, 28 + dy, BX1 + 9, 21 + dy)
        manopla(c, BX1 + 6, 15 + dy)
    elif rh == 'point':
        brazo(c, BX1 + 4, 27 + dy, BX1 + 12, 21 + dy)
        manopla(c, BX1 + 9, 15 + dy, finger=True)
    elif rh == 'finger':
        brazo(c, BX1 + 4, 28 + dy, BX1 + 9, 21 + dy)
        manopla(c, BX1 + 6, 15 + dy)
        c.rect(BX1 + 8, 8 + dy, BX1 + 10, 16 + dy, 'clay', 5)
        c.rect(BX1 + 9, 8 + dy, BX1 + 10, 16 + dy, 'clay', 4)
        c.px(BX1 + 8, 8 + dy, 'clay', 5)
    elif rh == 'hold':
        brazo(c, BX1 + 4, 33 + dy, BX1 + 11, 36 + dy)
        manopla(c, BX1 + 9, 35 + dy)


# ---------------------------------------------------------------- extras
def panel(c, dy, checks=False):
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
    if checks:
        for row in (y0 + 5, y0 + 12, y0 + 19):
            c.rect(x0 + 3, row - 1, x0 + 6, row + 2, 'green', 3)
            for (a, b) in ((0, 1), (1, 2), (2, 1)):
                c.px(x0 + 3 + a, row - 1 + b, 'paper', 5)


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


def rostro_extras(c, p, dy):
    """Lágrimas y gota de sudor: viajan con la cara."""
    ey = BY0 + dy + 8
    if p.get('tear'):
        for x in (CX - 9, CX + 8):
            c.rect(x, ey + 7, x + 2, ey + 10, 'crystal', 5)
            c.px(x, ey + 7, 'crystal', 7)
    if p.get('sweat'):
        c.sprite(BX1 - 5, BY0 + dy + 2, ['.o.', 'o#o', 'o#o', '.o.'], 'crystal', {'o': ('clay', 0), '#': ('crystal', 6)})


def extras(c, p, dy):
    ey = BY0 + dy + 8
    if p.get('dots'):                                         # "..." pensando
        for (x, y) in ((CX + 15, 11 + dy), (CX + 19, 8 + dy), (CX + 23, 5 + dy)):
            c.rect(x, y, x + 2, y + 2, 'rune', 4)
    if p.get('mark'):                                         # marca de enojo
        c.sprite(BX1 + 1, BY0 + dy - 5, ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'], 'red', {'#': 5})
    if p.get('spark'):                                        # destello (guiño)
        c.sprite(CX + 12, ey - 5, ['.#.', '###', '.#.'], 'rune', {'#': 6})
    if p.get('stars'):                                        # mareo
        for (x, y) in ((5, 20 + dy), (60, 24 + dy), (9, 34 + dy), (57, 38 + dy)):
            c.sprite(x, y, ['.#.', '###', '.#.'], 'rune', {'#': 5})
    if p.get('idea'):                                         # chispa de idea sobre el dedo
        c.sprite(BX1 + 3, 1 + dy, ['..#..', '.###.', '#####', '.###.', '..#..'], 'rune', {'#': 6})

def nube(c, cx, cy, mat, lv, rx_list):
    """Nube hecha de elipses (cx, cy centro; rx_list = [(dx, dy, rx, ry), ...]); borde oscuro."""
    m = np.zeros((H, W), bool)
    for (dx, dy_, rx, ry) in rx_list:
        m |= ell(c, cx + dx, cy + dy_, rx, ry)
    yy, xx = c.grid()
    e = m & ~erode(m)
    lvl = np.full(m.shape, lv, np.float32)
    lvl[yy > cy + 1] = lv - 1
    lvl[yy < cy - 2] = lv + 1
    lvl[e] = 1
    c.mask(m, mat, lvl)


def efectos_pose(c, p, dy):
    ey = BY0 + dy + 8
    if p.get('fx') == 'senalar':                              # estela mágica y destello en la punta
        for (x, y, w) in ((53, 9 + dy, 5), (56, 12 + dy, 4), (50, 23 + dy, 4), (54, 26 + dy, 5)):
            c.rect(x, y, x + w, y + 1, 'rune', 4)
        c.sprite(60, 5 + dy, ['..#..', '..#..', '#####', '..#..', '..#..'], 'rune', {'#': 6})
        c.px(62, 7 + dy, 'wax', 5)
        for (x, y) in ((65, 11 + dy), (64, 22 + dy), (58, 28 + dy)):
            c.px(x, y, 'rune', 5)
    if p.get('fx') == 'pensar':                               # nube de pensamiento con ? y engranaje
        nube(c, 55, 9, 'cloud', 5, [(-6, 1, 5.5, 4), (0, -1, 7, 5.5), (6, 1, 5.5, 4)])
        c.sprite(52, 4, ['.####.', '##..##', '....##', '...##.', '..##..', '..##..', '......', '..##..', '..##..'], 'arcane', {'#': 2})
        c.rect(47, 15, 49, 17, 'cloud', 5)
        c.px(45, 18, 'cloud', 5)
        c.sprite(3, 12 + dy, ['.#.', '..#', '.#.', '...', '.#.'], 'rune', {'#': 5})   # ? chiquito
        c.sprite(6, 26 + dy, ['.#.', '###', '.#.'], 'rune', {'#': 5})
    if p.get('fx') == 'lluvia':                               # nube de lluvia sobre la cabeza
        nube(c, CX, 6, 'cloud', 3, [(-8, 1, 6, 3.5), (-1, -1, 8, 4.5), (8, 1, 7, 3.5)])
        for (x, y0_) in ((CX - 9, 10), (CX - 3, 11), (CX + 4, 10), (CX + 10, 12)):
            c.rect(x, y0_, x + 1, y0_ + 3, 'blue', 5)
            c.px(x, y0_, 'blue', 6)
        for (x, y) in ((8, 20), (56, 22)):                    # gotas sueltas a los lados
            c.rect(x, y, x + 1, y + 2, 'blue', 4)
        for x in (CX - 9, CX + 8):                            # lágrima que baja por la barba
            c.rect(x, ey + 10, x + 1, ey + 13, 'crystal', 5)
    if p.get('fx') == 'nervios':                              # temblor, gotas voladoras y cara pálida
        for (x, y) in ((7, 20), (4, 23), (58, 20), (61, 23)):
            c.rect(x, y + dy, x + 1, y + 4 + dy, 'rune', 4)
        for (x, y, big) in ((7, 15 + dy, True), (47, 13 + dy, False), (52, 20 + dy, False)):
            c.sprite(x, y, ['.o.', 'o#o', 'o#o', '.o.'] if big else ['.o', 'o#', '.o'], 'crystal', {'o': ('clay', 0), '#': ('crystal', 6)})
        c.rect(CX - 9, ey + 7, CX - 4, ey + 9, 'green', 4)     # cara verdosa (mejillas pálidas)
        c.rect(CX + 4, ey + 7, CX + 9, ey + 9, 'green', 4)


def particulas(c):
    for (x, y, m, l) in ((3, 48, 'rune', 4), (7, 57, 'arcane', 5), (63, 50, 'rune', 3), (64, 58, 'arcane', 4)):
        c.px(x, y, m, l)


# ---------------------------------------------------------------- capas
DORMIDO = dict(POSES['dormido'])
POSAS = dict(HABLAR, dormido=DORMIDO)           # 16 poses; 'dormido' va al final
SWAY = {'dormido': 1}
# Orden de apilado (de atrás hacia adelante). Los brazos van detrás del libro, como en el dibujo original.
CAPAS = ['fondo', 'manoI', 'manoD', 'libro', 'cara', 'barba', 'boca', 'extras']


def _contorno(mats):
    """Contorno oscuro exterior del conjunto; cada capa recibe los píxeles de contorno que tocan lo suyo."""
    filled = np.zeros_like(mats[0], bool)
    for m in mats:
        filled |= m
    pad = np.pad(filled, 1)
    edge = (pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]) & ~filled
    out = []
    for m in mats:
        q = np.pad(m, 1)
        out.append(edge & (q[:-2, 1:-1] | q[2:, 1:-1] | q[1:-1, :-2] | q[1:-1, 2:]))
    return out


def _foto(c, edge, post=None, halo=False):
    """Capa a imagen RGBA. La luz de color (post) tiñe los píxeles de cada capa; solo la de fondo suma el halo en el aire."""
    c.mat[edge] = c.mid('clay')
    c.lvl[edge] = 0
    base = np.array(c.render(scale=1))
    lit = np.array(c.render(scale=1, post=post)) if post else base
    solid = c.mat != 0
    if post and halo:
        diff = np.abs(lit.astype(int) - base.astype(int)).sum(axis=2)
        alpha = np.where(solid, 255, np.clip(diff * 1.3, 0, 150)).astype(np.uint8)
    else:
        alpha = np.where(solid, 255, 0).astype(np.uint8)
    return Image.fromarray(np.dstack([lit, alpha]), 'RGBA')


def capas(name, p):
    """Devuelve {capa: imagen} de una pose; 'cara' = [normal, parpadeo] y 'boca' = [fase 0..2] (o [fija])."""
    dy = p['dy']
    fondo, izq, der, libro_c, ojos0, ojos1, barbac, extras_c = (Canvas(W, H) for _ in range(8))
    atril(fondo)
    velas(fondo)
    mano_izq(izq, p, dy)
    mano_der(der, p, dy)
    if p.get('panel'):
        panel(der, dy, p['panel'] == 'lista')              # el cartel va con la mano que lo sostiene
    pagina_con_oreja(libro_c, dy)
    libro(libro_c, dy)
    detalles_libro(libro_c, dy)
    marcapaginas(libro_c, dy, SWAY.get(name, 2))
    extras(extras_c, p, dy)
    efectos_pose(extras_c, p, dy)
    if p.get('excl'):
        exclamacion(extras_c, dy)
    if name != 'dormido':
        particulas(extras_c)
    if p.get('zz'):
        zeta(extras_c, BX1 + 9, 12, 6)
        zeta(extras_c, BX1 + 16, 5, 4)
    ey = cara(ojos0, p, dy)
    rostro_extras(ojos0, p, dy)
    q = dict(p)
    cierra = lambda e: 'closed' if e in ('open', 'wide', 'lid') else e
    q['eye'] = tuple(cierra(e) for e in p['eye']) if isinstance(p['eye'], tuple) else cierra(p['eye'])
    cara(ojos1, q, dy)
    rostro_extras(ojos1, q, dy)
    barba(barbac, ey)
    fases = [None] if name == 'dormido' else [0, 1, 2]
    bocas = []
    for ph in fases:
        b = Canvas(W, H)
        boca(b, ey, p, ph)
        bocas.append(b)

    lista = [fondo, izq, der, libro_c, barbac, extras_c] + bocas
    edges = _contorno([c.mat != 0 for c in lista])
    if name == 'dormido':
        halos = [(CX, LEDGE + 2, 22, '#5072a0', 0.7, 2.6)]
    else:
        halos = [(CX, LEDGE + 2, 26, '#9060dc', 0.9, 2.6)]
    if p.get('excl'):
        halos.append((CX, 30, 30, '#ffd860', 0.6, 1.0))
    if p.get('halo'):
        halos.append((CX, 20, 30, p['halo'], 0.45, 1.0))
    if p.get('fx') == 'senalar':
        halos.append((62, 9, 9, '#fff0a8', 0.8, 1.0))
    if p.get('mark'):
        halos.append((CX, 30, 30, '#e04030', 0.35, 1.0))
    if p.get('panel'):
        halos.append((59, 20, 16, '#fff0a8', 0.7, 1.0))

    def post(arr):
        for (hx, hy, r, col, s, sq) in halos:
            glow(arr, hx, hy, r, col, s, 4, sq)

    nada = np.zeros((H, W), bool)
    return {
        'fondo': _foto(fondo, edges[0], post, halo=True),
        'manoI': _foto(izq, edges[1], post),
        'manoD': _foto(der, edges[2], post),
        'libro': _foto(libro_c, edges[3], post),
        'cara': [_foto(ojos0, nada, post), _foto(ojos1, nada, post)],
        'barba': _foto(barbac, edges[4], post),
        'extras': _foto(extras_c, edges[5], post),
        'boca': [_foto(b, e, post) for b, e in zip(bocas, edges[6:])],
    }


def main():
    import json
    names = list(POSAS)
    out = ROOT / 'dist' / 'assets' / 'tutorial'
    out.mkdir(parents=True, exist_ok=True)
    ancho = {'cara': 2, 'boca': 3}
    hojas = {k: Image.new('RGBA', (W * ancho.get(k, 1), H * len(names)), (0, 0, 0, 0)) for k in CAPAS}
    todo = {}
    for r, n in enumerate(names):
        L = capas(n, POSAS[n])
        todo[n] = L
        for k in CAPAS:
            ims = L[k] if isinstance(L[k], list) else [L[k]]
            for i in range(ancho.get(k, 1)):                 # 'dormido' tiene boca fija: se repite en las 3 columnas
                hojas[k].paste(ims[min(i, len(ims) - 1)], (i * W, r * H))
    for k in CAPAS:
        hojas[k].save(out / f'grimorio-{k}.png')
    (out / 'grimorio-capas.json').write_text(json.dumps(
        {'frame': [W, H], 'filas': names, 'capas': CAPAS, 'cara': ['normal', 'parpadeo'], 'boca': ['cerrada', 'media', 'abierta'],
         'nota': 'dormido es la ultima fila; su boca es fija'},
        ensure_ascii=False, indent=1), encoding='utf-8')

    S2, cols = 2, 4
    cw, ch = W * S2, H * S2 + 14
    rows_n = (len(names) + cols - 1) // cols
    pv = Image.new('RGBA', (cw * cols, ch * rows_n), hexes('#45302c')[0] + (255,))
    d = ImageDraw.Draw(pv)
    for i, n in enumerate(names):
        L = todo[n]
        f = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        for k in CAPAS:
            f.alpha_composite(L[k][0] if k == 'cara' else L[k][-1] if k == 'boca' else L[k])
        x, y = (i % cols) * cw, (i // cols) * ch
        pv.alpha_composite(f.resize((cw, H * S2), Image.NEAREST), (x, y))
        d.text((x + 6, y + H * S2 + 1), n, fill=(255, 240, 196, 255))
    pv.convert('RGB').save(ROOT / 'docs' / 'tutorial' / 'grimorio-expresiones-preview.png')
    print('ok', {k: hojas[k].size for k in CAPAS})


if __name__ == '__main__':
    main()
