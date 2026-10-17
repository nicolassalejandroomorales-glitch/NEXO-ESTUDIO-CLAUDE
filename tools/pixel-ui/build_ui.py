"""Kit de UI pixel art de Nexo: marcos, pergamino, botones, barra de cristal, sellos, hiedra, riel e íconos.

Todo sale de las rampas de tools/home-pixel/pixel.py (madera = estructura, latón = botones y esquinas,
cristal = barras de progreso, pergamino = texto). Los 9-slice se muestran con border-image y image-rendering: pixelated
(ver dist/design-system/pixel-ui.css). Docs: docs/ux-app/SPEC.md.

    python tools/pixel-ui/build_ui.py      ->  dist/assets/pixel-ui/*.png
"""
import math
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'home-pixel'))
from pixel import Canvas  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'dist', 'assets', 'pixel-ui')
os.makedirs(OUT, exist_ok=True)


def save(c, name):
    """Render a tamaño de arte, transparente donde no hay material."""
    arr = np.array(c.render(scale=1).convert('RGBA'))
    arr[..., 3] = np.where(c.mat == 0, 0, 255).astype(np.uint8)
    Image.fromarray(arr, 'RGBA').save(os.path.join(OUT, name))


def clear_corners(c, n_w, n_h, size=2):
    """Esquinas redondeadas de píxel: quita el triángulo de cada esquina."""
    for k in range(size):
        for j in range(size - k):
            for x, y in ((j, k), (n_w - 1 - j, k), (j, n_h - 1 - k), (n_w - 1 - j, n_h - 1 - k)):
                c.mat[y, x] = 0


# ---------- marco de madera con esquinas de latón (32x32, borde 12; el tramo medio de 8 px se repite) ----------
def marco():
    n, b = 32, 12
    c = Canvas(n, n)
    for y in range(n):
        for x in range(n):
            d = min(x, y, n - 1 - x, n - 1 - y)
            lit = min(x, y) < min(n - 1 - x, n - 1 - y)
            t = x if min(y, n - 1 - y) < min(x, n - 1 - x) else y      # coordenada a lo largo del borde
            if d == 0:
                c.px(x, y, 'wood', 0)
            elif d <= 6:
                lvl = [0, 6, 5, 5, 4, 4, 3][d] + (0 if lit else -1)
                grain = (d in (2, 4) and t % 8 in (1, 2)) or (d == 3 and t % 8 in (5, 6)) or (d == 5 and t % 8 == 3)
                c.px(x, y, 'wood', lvl - (1 if grain else 0))
            elif d == 7:
                c.px(x, y, 'wood', 1)
            elif d == 8:
                c.px(x, y, 'brass', 0)
            elif d == 9:
                c.px(x, y, 'brass', 5 if lit else 3)
            elif d == 10:
                c.px(x, y, 'brass', 3 if lit else 2)
            elif d == 11:
                c.px(x, y, 'green', 0)
            else:
                c.px(x, y, 'green', 1)
    # esquinas: placa de latón con remache (se dibuja en la esquina superior izquierda y se espeja)
    plate = Canvas(b, b)
    for y in range(b):
        for x in range(b):
            if x < 1 or y < 1 or x > 10 or y > 10 or x + y < 3 or (x + y) > 19:
                continue
            ring = min(x - 1, y - 1, 10 - x, 10 - y)
            if ring == 0:
                plate.px(x, y, 'brass', 0)
            elif ring == 1:
                plate.px(x, y, 'brass', 6 if (x == 2 or y == 2) else 3)
            else:
                plate.px(x, y, 'brass', 4 if (x + y) % 5 else 5)
    for dx, dy, lv in ((5, 5, 6), (6, 5, 5), (5, 6, 5), (6, 6, 2), (7, 7, 1), (4, 4, 2)):
        plate.px(dx, dy, 'brass', lv)
    for y in range(b):
        for x in range(b):
            if plate.mat[y, x]:
                for fx, fy in ((x, y), (n - 1 - x, y), (x, n - 1 - y), (n - 1 - x, n - 1 - y)):
                    c.mat[fy, fx] = plate.mat[y, x]
                    c.lvl[fy, fx] = plate.lvl[y, x] - (0 if (fx == x and fy == y) else 0)
    clear_corners(c, n, n, 1)
    save(c, 'marco.png')


# ---------- pergamino: borde (24x24, borde 6) y fibras (16x16 en mosaico) ----------
def pergamino():
    n = 24
    c = Canvas(n, n)
    for y in range(n):
        for x in range(n):
            d = min(x, y, n - 1 - x, n - 1 - y)
            lit = min(x, y) < min(n - 1 - x, n - 1 - y)
            if d == 0:
                c.px(x, y, 'paper', 0)
            elif d == 1:
                c.px(x, y, 'paper', 2)
            elif d == 2:
                c.px(x, y, 'paper', 3 if lit else 2)
            elif d == 3:
                c.px(x, y, 'paper', 5 if lit else 3)
            elif d == 4:
                c.px(x, y, 'paper', 4)
            else:
                c.px(x, y, 'paper', 4)
    # arruguitas en las esquinas: dos píxeles más oscuros
    for cx, cy in ((2, 2), (n - 3, 2), (2, n - 3), (n - 3, n - 3)):
        c.px(cx, cy, 'paper', 2)
    clear_corners(c, n, n, 1)
    save(c, 'pergamino.png')

    f = Canvas(16, 16)
    f.rect(0, 0, 16, 16, 'paper', 4)
    for x, y, l in ((2, 3, 3), (3, 3, 3), (9, 1, 5), (10, 1, 5), (12, 8, 3), (4, 11, 5), (5, 11, 5), (6, 11, 5), (13, 13, 3), (0, 7, 5), (8, 14, 3)):
        f.px(x, y, 'paper', l)
    save(f, 'papel.png')


# ---------- botón de latón: 4 estados (18x18, borde 6) ----------
def boton(name, lift, bright, ramp='brass'):
    n = 18
    c = Canvas(n, n)
    top = 2 - lift                      # el botón pulsado baja 2 px
    face_h = n - 2
    for y in range(face_h):
        for x in range(n):
            Y = top + y
            d = min(x, y, n - 1 - x, face_h - 1 - y)
            lit = min(x, y) < min(n - 1 - x, face_h - 1 - y)
            if d == 0:
                c.px(x, Y, ramp, 0)
            elif d == 1:
                c.px(x, Y, ramp, min(6, 5 + bright) if lit else 2)
            elif d == 2 and y < 6:
                c.px(x, Y, ramp, 5 + bright - (0 if lit else 1))
            else:
                c.px(x, Y, ramp, 4 + bright - (1 if y > face_h - 5 else 0))
    for x in range(n):                  # canto de abajo (grosor del botón)
        if lift:
            c.px(x, face_h, ramp, 1)
            c.px(x, face_h + 1, ramp, 0)
    for x, y in ((4, 4), (n - 5, 4)):   # dos remaches discretos
        if y + top >= 0:
            c.px(x, y + top, ramp, 6 if bright else 5)
            c.px(x + 1, y + top + 1, ramp, 2)
    clear_corners(c, n, n, 2)
    # el hueco que deja el canto: píxeles de la fila sin material quedan transparentes
    save(c, name)


# ---------- barra de progreso de cristal ----------
def barra():
    w, h = 20, 12
    c = Canvas(w, h)
    for y in range(h):
        for x in range(w):
            cap = x < 5 or x >= w - 5
            if cap:
                d = min(y, h - 1 - y, x if x < 5 else w - 1 - x)
                c.px(x, y, 'brass', [0, 5, 4, 3, 2][min(d, 4)] if d < 4 else 4)
            elif y in (0, h - 1):
                c.px(x, y, 'wood', 0)
            elif y in (1, h - 2):
                c.px(x, y, 'brass', 5 if y == 1 else 2)
            elif y == 2:
                c.px(x, y, 'glass', 0)
            elif y == 3:
                c.px(x, y, 'glass', 1)
            elif y in (8,):
                c.px(x, y, 'glass', 1)
            else:
                c.px(x, y, 'glass', 0 if y < 7 else 1)
    for y in (1, h - 2):
        c.px(0, y, 'brass', 0); c.px(w - 1, y, 'brass', 0)
    c.px(2, 5, 'brass', 6); c.px(w - 3, 5, 'brass', 6)               # remaches de las tapas
    c.px(2, 6, 'brass', 2); c.px(w - 3, 6, 'brass', 2)
    clear_corners(c, w, h, 1)
    save(c, 'barra.png')
    # líquido: 12 de ancho x 6 de alto, con brillo y una burbuja; se desliza solo
    l = Canvas(12, 6)
    for x in range(12):
        l.px(x, 0, 'leaf', 8 if x in (1, 2, 3) else 7)
        l.px(x, 1, 'leaf', 6)
        l.px(x, 2, 'leaf', 5)
        l.px(x, 3, 'leaf', 5)
        l.px(x, 4, 'leaf', 4)
        l.px(x, 5, 'leaf', 3)
    l.px(8, 2, 'leaf', 8); l.px(8, 3, 'leaf', 7); l.px(9, 2, 'leaf', 7)
    l.px(4, 4, 'leaf', 6)
    save(l, 'liquido.png')


# ---------- sellos de cera (3 de 18x18 en una tira) ----------
def sellos():
    s = 18
    sheet = Canvas(s * 3, s)
    for k in range(3):
        ox = k * s
        cx = cy = (s - 1) / 2
        for y in range(s):
            for x in range(s):
                r = math.hypot(x - cx, y - cy)
                wob = 7.6 + 0.7 * math.sin(math.atan2(y - cy, x - cx) * 5 + k)
                if r <= wob:
                    shade = -((x - cx) + (y - cy)) / (r + 1e-6) * 0.5
                    lvl = 3 + (shade * 1.6) + (1 if r < 5.5 else 0)
                    sheet.px(ox + x, y, 'red', max(1, min(5, round(lvl))))
                    if r > wob - 1:
                        sheet.px(ox + x, y, 'red', 0 if shade < 0.1 else 1)
        # relieve (más claro con sombra abajo a la derecha)
        marks = [
            [(8, 5), (9, 5), (8, 6), (9, 6), (7, 8), (10, 8), (8, 9), (9, 9), (8, 12), (9, 12), (7, 10), (10, 10)],          # calendario: estrella
            [(8, 5), (9, 5), (6, 8), (7, 8), (10, 8), (11, 8), (8, 9), (9, 9), (7, 11), (10, 11), (8, 12), (9, 12)],        # día: sol
            [(8, 5), (9, 6), (10, 7), (9, 8), (8, 9), (8, 10), (7, 11), (8, 12), (6, 8), (7, 7), (7, 9)],                    # continuar: hoja
        ][k]
        for x, y in marks:
            sheet.px(ox + x + 1, y + 1, 'red', 1)
        for x, y in marks:
            sheet.px(ox + x, y, 'red', 5)
    save(sheet, 'sellos.png')


# ---------- hiedra colgante con una flor (2 variantes de 24x44) ----------
def hiedra():
    w, h = 24, 44
    sheet = Canvas(w * 2, h)
    for k in range(2):
        ox = k * w
        for y in range(h):
            x = 12 + 3 * math.sin(y / 5.0 + k * 1.7)
            sheet.px(ox + x, y, 'stem', 3)
            sheet.px(ox + x + 1, y, 'stem', 1)
        for i, y in enumerate(range(4, h - 6, 6)):
            x = 12 + 3 * math.sin(y / 5.0 + k * 1.7)
            side = -1 if (i + k) % 2 else 1
            for dx, dy, lv in ((0, 0, 4), (1, 0, 5), (2, 0, 3), (1, -1, 6), (0, -1, 4), (2, 1, 3), (1, 1, 4), (3, 0, 2)):
                sheet.px(ox + x + side * (dx + 1) + (0 if side > 0 else -0), y + dy, 'sprout' if i % 2 else 'leaf', lv + (2 if i % 2 else 1))
        fx, fy = 12 + 3 * math.sin((h - 6) / 5.0 + k * 1.7), h - 6
        for dx, dy in ((0, 0), (-2, 0), (2, 0), (0, -2), (0, 2)):
            sheet.px(ox + fx + dx, fy + dy, 'petal', 3)
        sheet.px(ox + fx, fy, 'rune', 4)
        sheet.px(ox + fx, fy + 3, 'stem', 2)
    save(sheet, 'hiedra.png')


# ---------- hojita que brota al tocar un botón (10x10) ----------
def hojita():
    c = Canvas(10, 10)
    rows = ['....bb....', '...bccb...', '..bcdcdb..', '..bcdcdb..', '...bcdcb..', '....bdb...', '....sb....', '....s.....', '....s.....', '....s.....']
    lv = {'b': ('leaf', 3), 'c': ('leaf', 6), 'd': ('leaf', 8), 's': ('stem', 3)}
    c.sprite(0, 0, rows, 'leaf', lv)
    save(c, 'hojita.png')


# ---------- riel de la barra lateral: tablones verticales y canto de latón ----------
def riel():
    c = Canvas(48, 64)
    for y in range(64):
        for x in range(48):
            px = x % 24
            if px == 0:
                c.px(x, y, 'wood', 0)
            elif px == 1:
                c.px(x, y, 'wood', 5)
            elif px == 23:
                c.px(x, y, 'wood', 1)
            else:
                grain = 3 + (1 if (px + (y // 7) * 3) % 9 in (3, 4) else 0) - (1 if (px * 5 + y) % 13 == 0 else 0)
                c.px(x, y, 'wood', grain)
    for kx, ky in ((9, 20), (36, 47)):                                    # nudos
        for dx, dy, lv in ((0, 0, 1), (1, 0, 1), (-1, 0, 2), (2, 0, 2), (0, 1, 2), (1, 1, 2), (0, -1, 2), (1, -1, 2)):
            c.px(kx + dx, ky + dy, 'wood', lv)
    for y in (8, 40):                                                     # clavos
        for x in (6, 18, 30, 42):
            c.px(x, y, 'brass', 5); c.px(x + 1, y + 1, 'brass', 1)
    save(c, 'riel.png')
    e = Canvas(8, 16)
    for y in range(16):
        for x, lv in enumerate((0, 6, 5, 4, 3, 2, 1, 0)):
            e.px(x, y, 'brass', lv)
    for x in (3, 4):
        e.px(x, 3, 'brass', 6); e.px(x, 11, 'brass', 6)
    save(e, 'riel-borde.png')


# ---------- íconos de la barra: 4 íconos x 2 estados (reposo latón, activo oro brillante) de 16x16 ----------
ICONS = {
    'inicio': ['.......oo.......', '......olmo......', '.....olmmdo.....', '....olmmmmdo....', '...oollmmmddo...', '..oooooooooooo..',
               '....olmmmmdo....', '....olmaamdo....', '....olmaamdo....', '....olmmmmdo....', '....olmmmmdo....', '....olmmmmdo....',
               '....olmmmmdo....', '....olmoomdo....', '...oooooooooooo.', '................'],
    'aprender': ['................', '.ooooooooooooo..', 'olllllmoldllllmo', 'olmmmmmomdmmmmdo', 'olmaaammdmaaamdo', 'olmmmmmomdmmmmdo',
                 'olmaaaamdmaaamdo', 'olmmmmmomdmmmmdo', 'olmaaammdmaaamdo', 'olmmmmmomdmmmmdo', 'oddddddoodddddoo', '.oooooooooooooo.',
                 '..........oo....', '.........olmo...', '..........oo....', '................'],
    'organizacion': ['..oo........oo..', '..ol........ld..', '.oooooooooooooo.', 'olllllllllllllmo', 'oaaaaaaaaaaaaaao', 'olmmmmmmmmmmmmdo',
                     'olmlmmlmmlmmmddo', 'olmmmmmmmmmmmmdo', 'olmmlmmlmmlmmddo', 'olmmmmmmmmmmmmdo', 'olmlmmlmmlmmmddo', 'olmmmmmmmmmmmmdo',
                     'oddddddddddddddo', '.oooooooooooooo.', '................', '................'],
    'tienda': ['.....oooooo.....', '....olllllmo....', '...ollmmmmmdo...', '...olmmmooodo...', '...olmmoaaodo...', '...olmmmooodo...', '....ommmmmdo....', '.....oodmdoo....',
               '......odmdo.....', '......odmdo.....', '......odmdo.....', '......odmdo.....', '......odmdo.....', '......odmdo.....', '......oddo......', '................'],
    'atomo': ['................', '.....oo..oo.....', '....olmooomo....', '...olmo.oo.omo..', '..olmo..oo..omo.', '..oomo.olmo.oo..', '..oo..olaamo.oo.', '.oo...olaamo..oo', '..oo..odaamo.oo.',
              '..oomo.odmo.oo..', '..odmo..oo..omo.', '...odmo.oo.omo..', '....odmoooomo...', '.....oo..oo.....', '................', '................'],
    'perfil': ['......oooo......', '.....ollmmo.....', '.....olmmdo.....', '.....olmmdo.....', '.....omddo......', '......oddo......',
               '....oooooooo....', '..ooollllmmdoo..', '.oolllmmmmmddoo.', '.olllmmmmmmmddo.', '.olmmmmmmmmmmdo.', '.olmmmmmmmmmmdo.',
               '.oddddddddddddo.', '..oooooooooooo..', '................', '................'],
}


def iconos():
    names = ['inicio', 'aprender', 'organizacion', 'perfil', 'tienda', 'atomo']
    sheet = Canvas(16 * len(names), 32)
    rest = {'o': ('brass', 0), 'l': ('brass', 4), 'm': ('brass', 3), 'd': ('brass', 1), 'a': ('crystal', 3)}
    act = {'o': ('brass', 1), 'l': ('rune', 6), 'm': ('rune', 4), 'd': ('rune', 2), 'a': ('crystal', 7)}
    for i, name in enumerate(names):
        for row, table in ((0, rest), (16, act)):
            for y, line in enumerate(ICONS[name]):
                for x, ch in enumerate(line.ljust(16, '.')):
                    if ch in table:
                        m, lv = table[ch]
                        sheet.px(i * 16 + x, row + y, m, lv)
    save(sheet, 'iconos.png')


if __name__ == '__main__':
    marco()
    pergamino()
    boton('boton.png', 2, 0)
    boton('boton-hover.png', 2, 1)
    boton('boton-down.png', 0, 0)
    boton('boton-off.png', 2, 0, ramp='stone')
    barra()
    sellos()
    hiedra()
    hojita()
    riel()
    iconos()
    print('listo ->', os.path.abspath(OUT))
