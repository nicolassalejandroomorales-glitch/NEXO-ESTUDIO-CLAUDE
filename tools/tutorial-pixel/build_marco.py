"""Marco de diálogo RPG del tutorial de Nexo (pixel art, mismas rampas del refugio).

Piezas (todas con fondo transparente, se muestran x4):
  marco-dialogo.png   48x48, para border-image 9-slice: esquinas de 12 px, centro de pergamino que se estira
  marco-nombre.png    36x16, cartelito del nombre (9-slice con esquinas de 6 px)
  flecha-siguiente.png 2 cuadros de 10x8 (flechita "siguiente" que parpadea)
Vista previa: docs/tutorial/marco-preview.png
Uso:  python tools/tutorial-pixel/build_marco.py
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools' / 'home-pixel'))
from pixel import Canvas, hexes  # noqa: E402


def finish(c):
    """Contorno exterior oscuro y salida RGBA con transparencia."""
    filled = c.mat != 0
    pad = np.pad(filled, 1)
    nb = pad[:-2, 1:-1] | pad[2:, 1:-1] | pad[1:-1, :-2] | pad[1:-1, 2:]
    edge = nb & ~filled
    c.mat[edge] = c.mid('clay')
    c.lvl[edge] = 0
    img = np.array(c.render(scale=1))
    alpha = np.where(c.mat != 0, 255, 0).astype(np.uint8)
    return Image.fromarray(np.dstack([img[..., :3], alpha]), 'RGBA')


def caja(w, h, corner, cut, name_tag=False):
    c = Canvas(w, h)
    # marco de madera con filete de latón y pergamino adentro (se contornea sola al final)
    c.rect(1, 1, w - 1, h - 1, 'wood', 3)
    c.rect(1, 1, w - 1, 2, 'wood', 5)
    c.rect(1, h - 2, w - 1, h - 1, 'wood', 2)
    c.rect(2, 2, w - 2, h - 2, 'brass', 4)
    c.rect(3, 3, w - 3, h - 3, 'wood', 2)
    c.rect(4, 4, w - 4, h - 4, 'paper', 5)
    c.rect(4, 4, w - 4, 5, 'paper', 4)                       # sombra interior arriba
    c.rect(4, h - 5, w - 4, h - 4, 'paper', 4)
    c.rect(4, 4, 5, h - 4, 'paper', 4)
    if not name_tag:
        for x in range(corner, w - corner, 3):               # fibras del pergamino
            c.px(x, h // 2 - 4 + (x % 5), 'paper', 4)
    # esquineros de latón
    for (cx_, cy_) in ((1, 1), (w - 1 - cut, 1), (1, h - 1 - cut), (w - 1 - cut, h - 1 - cut)):
        c.rect(cx_, cy_, cx_ + cut, cy_ + cut, 'brass', 5)
        c.rect(cx_, cy_, cx_ + cut, cy_ + 1, 'brass', 6)
        c.px(cx_ + cut // 2, cy_ + cut // 2, 'brass', 2)
    # esquinas cortadas (transparentes) para que no sea un rectángulo duro
    for (x, y) in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        c.mat[y, x] = 0
    return c


def flecha(frame):
    c = Canvas(10, 8)
    y = 1 + frame
    rows = ['#######', '.#####.', '..###..', '...#...']
    c.sprite(1, y, rows, 'rune', {'#': 6})
    c.sprite(1, y, ['#......', '.#.....'], 'rune', {'#': 7})
    return finish(c)


def main():
    out = ROOT / 'dist' / 'assets' / 'tutorial'
    out.mkdir(parents=True, exist_ok=True)
    marco = finish(caja(48, 48, 12, 4))
    nombre = finish(caja(36, 16, 6, 3, name_tag=True))
    f0, f1 = flecha(0), flecha(1)
    marco.save(out / 'marco-dialogo.png')
    nombre.save(out / 'marco-nombre.png')
    hoja = Image.new('RGBA', (20, 8), (0, 0, 0, 0))
    hoja.paste(f0, (0, 0))
    hoja.paste(f1, (10, 0))
    hoja.save(out / 'flecha-siguiente.png')

    # vista previa: marco estirado 160x40 con nombre y flecha, x3 sobre fondo del refugio
    bg = Image.new('RGBA', (180, 60), hexes('#45302c')[0] + (255,))
    big = Image.new('RGBA', (160, 40), (0, 0, 0, 0))
    big.paste(estirar(marco, 160, 40, 12), (0, 0))
    bg.alpha_composite(big, (10, 14))
    bg.alpha_composite(nombre, (16, 4))
    bg.alpha_composite(f0, (146, 38))
    bg.resize((bg.width * 4, bg.height * 4), Image.NEAREST).convert('RGB').save(ROOT / 'docs' / 'tutorial' / 'marco-preview.png')
    print('ok')


def estirar(im, w, h, k):
    """9-slice con esquinas de k px (para la vista previa; en la app lo hace border-image)."""
    iw, ih = im.size
    o = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    xs = [(0, k, 0, k), (k, w - k, k, iw - k), (w - k, w, iw - k, iw)]
    ys = [(0, k, 0, k), (k, h - k, k, ih - k), (h - k, h, ih - k, ih)]
    for (dx0, dx1, sx0, sx1) in xs:
        for (dy0, dy1, sy0, sy1) in ys:
            piece = im.crop((sx0, sy0, sx1, sy1)).resize((dx1 - dx0, dy1 - dy0), Image.NEAREST)
            o.paste(piece, (dx0, dy0))
    return o


if __name__ == '__main__':
    main()
