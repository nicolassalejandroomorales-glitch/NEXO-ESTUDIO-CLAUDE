"""Huevos de las 3 mascotas del tutorial de Nexo (pixel art, rampas del refugio) y su nacimiento.

Cada huevo: hoja de 9 cuadros de 56x64 px de arte (se muestra x4):
  0 reposo · 1 y 2 temblor · 3 brillo · 4, 5 y 6 grietas (cada vez mas luz) · 7 estallido · 8 cascara vacia
La mascota que nace sale del dibujo real de la app (dist/mascot/pixelmascotas.js), no de aqui.
Salida:
  dist/assets/tutorial/huevo-atomo.png, huevo-matraz.png, huevo-slime.png   (hojas 504x64, fondo transparente)
  docs/tutorial/huevos-preview.png                                           (vista previa x2: reposo + nacimiento)
Uso:  python tools/tutorial-pixel/build_huevos.py
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools' / 'home-pixel'))
from pixel import Canvas, glow, hexes  # noqa: E402

W, H = 56, 64
CX, CY, RX, RY = 28, 30, 14.5, 18.5

FRAMES = ['reposo', 'temblor1', 'temblor2', 'brillo', 'grieta1', 'grieta2', 'grieta3', 'estallido', 'vacia']
LEAN = {'temblor1': -2.0, 'temblor2': 2.0}

# grietas en coordenadas relativas al centro del huevo; cada tramo se suma a los anteriores
CRACKS = [
    [(3, -17), (6, -12), (3, -9), (7, -5)],                                   # grieta1
    [(-12, -4), (-8, -8), (-9, -2), (-4, -6), (1, -10), (3, -9)],             # grieta2
    [(7, -5), (4, 1), (9, 5), (3, 8), (-3, 4), (-9, -2), (-5, 10), (1, 14)],  # grieta3
]
CRACK_LEVEL = {'grieta1': 1, 'grieta2': 2, 'grieta3': 3, 'estallido': 3, 'vacia': 3}
# trozos de cascara que salen volando en el estallido: (dx, dy, tamano, giro)
SHARDS = [(-17, -23, 8, 0.4), (15, -25, 9, 2.6), (-23, -9, 7, 1.7), (22, -11, 7, 3.4), (3, -29, 7, 5.0), (-8, -30, 5, 1.0)]

LOOK = {
    'atomo':  dict(halo='#5cc4dc', glow=(0.9, 1.0), shard=('blue', 4)),
    'matraz': dict(halo='#9ae2b4', glow=(0.9, 1.0), shard=('glass', 5)),
    'slime':  dict(halo='#e2ee8a', glow=(0.9, 1.0), shard=('sprout', 6)),
}


def ell(c, cx, cy, rx, ry):
    yy, xx = c.grid()
    return ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1.0


def erode(m):
    p = np.pad(m, 1)
    return m & p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:]


def huevo_mask(c, lean, squash=1.0, rx=RX, ry=RY):
    """Forma de huevo (mas ancho abajo y puntudo arriba); lean inclina el huevo (temblor)."""
    yy, xx = c.grid()
    t = np.clip((yy - CY) / ry, -1.2, 1.2)
    cxx = CX + lean * t
    half = rx * np.sqrt(np.clip(1 - t ** 2, 0, 1)) * (1 + 0.14 * t)
    top = CY - ry * squash
    return (np.abs(xx - cxx) <= half) & (yy >= top) & (yy <= CY + ry)


def sombrear(c, m, mat, lo, hi, lean, spots=None):
    """Nivel por distancia a un brillo arriba-izquierda; borde claro arriba-izq y oscuro abajo-der."""
    yy, xx = c.grid()
    hx, hy = CX - 5 + lean * -0.3, CY - 8
    d = np.hypot((xx - hx) / 20.0, (yy - hy) / 26.0)
    lvl = hi - np.clip(d, 0, 1.0) * (hi - lo)
    lvl = np.floor(lvl + 0.5).astype(np.float32)
    e = m & ~erode(m)
    lit = (xx - CX) + (yy - CY) < 0
    lvl[e & lit] = min(hi + 1, hi)
    lvl[e & ~lit] = max(lo - 1, 0)
    c.mask(m, mat, lvl)


def pts_line(c, a, b, mat, lvl, mask=None):
    n = int(max(abs(b[0] - a[0]), abs(b[1] - a[1]))) + 1
    for i in range(n + 1):
        x = int(round(a[0] + (b[0] - a[0]) * i / max(n, 1)))
        y = int(round(a[1] + (b[1] - a[1]) * i / max(n, 1)))
        if 0 <= x < W and 0 <= y < H and (mask is None or mask[y, x]):
            c.px(x, y, mat, lvl)


def grietas(c, m, nivel, lean):
    """Grietas oscuras con luz que se escapa por dentro."""
    for k in range(nivel):
        path = CRACKS[k]
        for a, b in zip(path, path[1:]):
            A = (CX + a[0], CY + a[1])
            B = (CX + b[0], CY + b[1])
            if nivel >= 2:   # luz a un lado de la grieta
                pts_line(c, (A[0] + 1, A[1]), (B[0] + 1, B[1]), 'rune', 5, m)
            pts_line(c, A, B, 'void', 0, m)


# ------------------------------------------------------------------- atomo
def cuerpo_atomo(c, m, lean):
    sombrear(c, m, 'blue', 1, 4, lean)
    yy, xx = c.grid()
    for (dx, dy) in ((-6, -9), (7, -3), (-4, 6), (5, 10), (-9, 0)):          # protones naranjas
        p = ell(c, CX + dx + lean * dy / RY, CY + dy, 2.2, 2.2) & m
        c.mask(p, 'clay', np.where((xx < CX + dx) & (yy < CY + dy), 5, 4).astype(np.float32))
    for (tilt, ra, rb) in ((0.5, 15.5, 6.0), (-0.5, 15.5, 6.0)):              # dos orbitas cruzadas
        u, v = (xx - CX) * np.cos(tilt) + (yy - CY) * np.sin(tilt), -(xx - CX) * np.sin(tilt) + (yy - CY) * np.cos(tilt)
        ring = np.abs(np.hypot(u / ra, v / rb) - 1.0) < 0.09
        c.mask(ring & m, 'crystal', 5)
    for (dx, dy) in ((10, -7), (-11, -5), (8, 8)):                           # electrones
        c.mask(ell(c, CX + dx, CY + dy, 1.6, 1.6) & m, 'wax', 5)


def base_atomo(c):
    yy, xx = c.grid()
    for (rx, ry, mat, lv, thick) in ((17, 5, 'crystal', 3, 1), (13, 3.6, 'crystal', 5, 1)):   # aro flotante
        ring = np.abs(np.hypot((xx - CX) / rx, (yy - 51) / ry) - 1.0) < 0.12 * thick
        c.mask(ring, mat, lv)
    for (x, y) in ((CX - 18, 47), (CX + 18, 48), (CX - 9, 55), (CX + 10, 56)):
        c.px(x, y, 'crystal', 6)


# ------------------------------------------------------------------- matraz
def cuerpo_matraz(c, m, lean):
    yy, xx = c.grid()
    sombrear(c, m, 'glass', 3, 5, lean)
    liquido = m & erode(erode(m)) & (yy > CY + 1 + 1.2 * np.sin((xx - CX) * 0.5))
    ll = np.where(yy < CY + 4, 6, 4).astype(np.float32)
    c.mask(liquido, 'leaf', ll)
    c.mask(liquido & (xx < CX - 4) & (yy > CY + 5), 'leaf', 7)
    for (dx, dy, r) in ((-3, 8, 1.6), (4, 12, 1.2), (1, 4, 1.0), (-6, 14, 1.0)):   # burbujas
        c.mask(ell(c, CX + dx, CY + dy, r, r) & liquido, 'glass', 6)
    c.rect(CX - 9, CY - 12, CX - 7, CY - 4, 'glass', 6)                          # reflejo largo
    c.px(CX - 8, CY - 13, 'glass', 6)
    c.rect(CX - 11, CY - 6, CX - 10, CY - 3, 'glass', 6)


def base_matraz(c):
    c.rect(CX - 15, 48, CX + 15, 50, 'brass', 5)                                 # aro de latón
    c.rect(CX - 15, 48, CX + 15, 49, 'brass', 6)
    c.rect(CX - 15, 50, CX + 15, 51, 'brass', 2)
    for sx in (-1, 1):                                                           # patas
        x = CX + sx * 13
        c.rect(x - 1, 51, x + 2, 59, 'brass', 3)
        c.rect(x - 1, 51, x, 59, 'brass', 5)
        c.rect(x - 3, 58, x + 4, 60, 'brass', 4)
    c.rect(CX - 1, 51, CX + 2, 59, 'brass', 3)
    c.rect(CX - 3, 58, CX + 4, 60, 'brass', 4)


# ------------------------------------------------------------------- slime
def cuerpo_slime(c, m, lean):
    yy, xx = c.grid()
    sombrear(c, m, 'sprout', 4, 7, lean)
    nucleo = ell(c, CX + 1, CY + 5, 7, 8) & m
    c.mask(nucleo, 'leaf', np.where(yy < CY + 4, 6, 5).astype(np.float32))
    for (dx, dy, r) in ((-6, -8, 2.0), (6, -2, 1.5), (-5, 12, 1.4), (7, 11, 1.2), (0, -13, 1.0)):   # burbujas
        c.mask(ell(c, CX + dx, CY + dy, r, r) & m, 'sprout', 8)
        c.px(int(CX + dx - r / 2), int(CY + dy - r / 2), 'wax', 5)
    c.rect(CX - 9, CY - 12, CX - 7, CY - 8, 'wax', 5)                            # brillo gelatinoso
    c.px(CX - 9, CY - 7, 'wax', 5)


def base_slime(c):
    yy, xx = c.grid()
    puddle = ell(c, CX, 50, 20, 4.2)
    c.mask(puddle, 'leaf', np.where(yy < 50, 5, 3).astype(np.float32))
    e = puddle & ~erode(puddle)
    c.mask(e, 'leaf', 2)
    for (dx, dy, r) in ((-10, 1, 1.5), (9, 0, 1.5), (-3, 2, 1.0)):
        c.mask(ell(c, CX + dx, 50 + dy, r, 0.8), 'sprout', 7)
    for sx in (-1, 1):                                                           # goteos del borde
        x = CX + sx * 17
        c.rect(x, 53, x + 2, 56, 'leaf', 4)
        c.px(x, 53, 'sprout', 6)


TIPOS = {
    'atomo': (cuerpo_atomo, base_atomo),
    'matraz': (cuerpo_matraz, base_matraz),
    'slime': (cuerpo_slime, base_slime),
}


# ------------------------------------------------------------------- estallido
def poligono(c, cx, cy, size, rot):
    img = Image.new('L', (W, H), 0)
    pts = [(cx + size * np.cos(rot + a) * r, cy + size * np.sin(rot + a) * r)
           for a, r in ((0, 1.0), (2.3, 0.8), (4.1, 0.9))]
    ImageDraw.Draw(img).polygon(pts, fill=255)
    return np.array(img) > 0


def explosion(c, tipo, frame):
    mat, lv = LOOK[tipo]['shard']
    for (dx, dy, size, rot) in SHARDS:
        m = poligono(c, CX + dx, CY + dy, size * 0.8, rot)
        c.mask(m, mat, lv + 1)
        e = m & ~erode(m)
        c.mask(e, mat, max(lv - 2, 0))
    if frame == 'estallido':                                                     # chispas de luz
        for (dx, dy) in ((0, -20), (-14, -14), (14, -14), (-18, 0), (18, 0), (0, -26)):
            c.sprite(CX + dx - 1, CY + dy - 1, ['.#.', '###', '.#.'], 'rune', {'#': 6})


def copa(c, m):
    """Mitad de abajo de la cascara (borde roto en zigzag)."""
    yy, xx = c.grid()
    jag = np.array([0, -3, 1, -2, 2, -4, 0, -1, 2, -3, 1, -2, 0], np.int32)
    lim = CY + 3 + jag[(xx.astype(int) + 7) % len(jag)]
    return m & (yy >= lim)


def cuadro(tipo, frame):
    cuerpo, base = TIPOS[tipo]
    c = Canvas(W, H)
    lean = LEAN.get(frame, 0.0)
    base(c)
    m = huevo_mask(c, lean)
    if frame in ('estallido', 'vacia'):
        cp = copa(c, m)
        cuerpo(c, m, lean)
        # lo que no es copa se borra (queda solo la cascara de abajo)
        c.mat[m & ~cp] = 0
        c.lvl[m & ~cp] = 0
        if frame == 'estallido':
            c.mask(ell(c, CX, CY + 7, 10, 4) & cp, 'rune', 5)                    # luz dentro de la copa
        if frame == 'vacia':
            for (dx, dy) in ((-17, 18), (16, 20), (-8, 22), (11, 15)):
                c.mask(poligono(c, CX + dx, CY + dy, 2.2, dx), *LOOK[tipo]['shard'])
        else:
            explosion(c, tipo, frame)
    else:
        cuerpo(c, m, lean)
        if frame in CRACK_LEVEL:
            grietas(c, m, CRACK_LEVEL[frame], lean)

    filled = c.mat != 0                                                          # contorno exterior oscuro
    pad = np.pad(filled, 1)
    nb = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
    edge = nb & ~filled
    c.mat[edge] = c.mid('void')
    c.lvl[edge] = 0

    k = {'reposo': 0.55, 'temblor1': 0.6, 'temblor2': 0.6, 'brillo': 1.0, 'grieta1': 0.9, 'grieta2': 1.1,
         'grieta3': 1.5, 'estallido': 0.9, 'vacia': 0.6}[frame]
    halo = LOOK[tipo]['halo']
    halos = [(CX, CY + 2, 24 + 4 * k, halo, min(k, 1.6), 1.0)]
    if frame == 'estallido':
        halos.append((CX, CY, 20, '#fff0a8', 0.55, 1.0))

    def post(arr):
        for (hx, hy, r, col, s, sq) in halos:
            glow(arr, hx, hy, r, col, s, 4, sq)

    base_img = np.array(c.render(scale=1))
    lit = np.array(c.render(scale=1, post=post))
    solid = c.mat != 0
    diff = np.abs(lit.astype(int) - base_img.astype(int)).sum(axis=2)
    alpha = np.where(solid, 255, np.clip(diff * 1.3, 0, 150)).astype(np.uint8)
    return Image.fromarray(np.dstack([lit, alpha]), 'RGBA')


def main():
    out = ROOT / 'dist' / 'assets' / 'tutorial'
    out.mkdir(parents=True, exist_ok=True)
    hojas = {}
    for tipo in TIPOS:
        sheet = Image.new('RGBA', (W * len(FRAMES), H), (0, 0, 0, 0))
        for i, f in enumerate(FRAMES):
            sheet.paste(cuadro(tipo, f), (i * W, 0))
        sheet.save(out / f'huevo-{tipo}.png')
        hojas[tipo] = sheet

    S = 2
    bg = Image.new('RGBA', (W * len(FRAMES) * S, H * S * 3 + 18), hexes('#45302c')[0] + (255,))
    d = ImageDraw.Draw(bg)
    for r, tipo in enumerate(TIPOS):
        big = hojas[tipo].resize((hojas[tipo].width * S, hojas[tipo].height * S), Image.NEAREST)
        bg.alpha_composite(big, (0, r * H * S))
    for i, f in enumerate(FRAMES):
        d.text((i * W * S + 6, H * S * 3 + 4), f, fill=(255, 240, 196, 255))
    bg.convert('RGB').save(ROOT / 'docs' / 'tutorial' / 'huevos-preview.png')
    print('ok')


if __name__ == '__main__':
    main()
