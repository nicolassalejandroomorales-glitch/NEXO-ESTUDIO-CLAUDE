"""Carta de jugador del Perfil (docs/perfil-alcoba/SPEC.md). Pixel art con el motor del refugio (tools/home-pixel/pixel.py).
Uso:   python tools/perfil-carta/build_carta.py
Escribe:
  dist/assets/perfil/carta.png       120x170 px de arte (la app lo amplía sin suavizar). Marco, ventana de la mascota, cinta de nombre,
                                     banda de rango, dos placas (racha y minutos) y 6 huecos de insignias. El texto y la mascota van encima (HTML).
  dist/assets/perfil/insignias.png   6 íconos de 13x13 en una tira (la app los apaga en gris si aún no los tienes)
  dist/assets/perfil/carta.json      posiciones de cada zona en px de arte (la app las usa para colocar el texto)
  tools/perfil-carta/vista-previa.png  carta e insignias x4 para revisar
"""
from pathlib import Path
import json
import math
import sys
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/home-pixel'))
from pixel import Canvas, glow  # noqa: E402

OUT = ROOT / 'dist/assets/perfil'
W, H = 120, 170
ZONES = {
    'nombre': [14, 9, 106, 22],
    'ventana': [12, 26, 108, 100],
    'rango': [28, 105, 107, 121],
    'racha': [12, 125, 58, 141],
    'minutos': [62, 125, 108, 141],
    'insignias': [[13 + i * 16, 146, 13 + i * 16 + 13, 159] for i in range(6)],
}


def box(c, x0, y0, x1, y1, mat, lv, hl=1.4, sh=-1.4):
    c.rect(x0, y0, x1, y1, mat, lv)
    c.rect(x0, y0, x1, y0 + 1, mat, lv + hl); c.rect(x0, y0, x0 + 1, y1, mat, lv + hl * 0.6)
    c.rect(x1 - 1, y0, x1, y1, mat, lv + sh); c.rect(x0, y1 - 1, x1, y1, mat, lv + sh)


def ivy(c, x0, y0, length, phase, direction=1, base=5.5):
    for k in range(length):
        x = x0 + direction * 1.5 * math.sin(k * 0.2 + phase)
        c.px(x, y0 + k, 'stem', base - 3)
        if k % 3 == 1:
            side = 1 if (k // 3) % 2 else -1
            ramp = ['leaf', 'sprout', 'leaf', 'shade'][(k // 3) % 4]
            c.sprite(int(x + side * 2) - 1, y0 + k - 1, [".l.", "lml", ".d."], ramp, {'l': base + 1, 'm': base, 'd': base - 1.5})


def build_card():
    c = Canvas(W, H)
    c.dither = {'wall': 0.45, 'wood': 0.6}
    yy, xx = c.grid()

    # --- marco dorado y papel ---
    box(c, 0, 0, W - 1, H - 1, 'brass', 3.2, 1.6, -1.6)
    c.rect(3, 3, W - 4, H - 4, 'wood', 2)                       # filete oscuro entre el oro y el papel
    c.rect(4, 4, W - 5, H - 5, 'paper', 4.2)
    c.rect(4, 4, W - 5, 5, 'paper', 5.2); c.rect(4, 4, 5, H - 5, 'paper', 5)
    c.rect(W - 6, 4, W - 5, H - 5, 'paper', 3.2); c.rect(4, H - 6, W - 5, H - 5, 'paper', 3.2)
    for (px, py) in [(9, 30), (110, 60), (8, 112), (112, 140), (60, 166), (22, 126), (100, 148), (55, 104)]:
        c.px(px, py, 'paper', 3.4)                               # venas del papel
    for (cx, cy) in [(4, 4), (W - 5, 4), (4, H - 5), (W - 5, H - 5)]:   # rombos de oro en las esquinas
        c.sprite(cx - 3, cy - 3, [".xxx.", "xyyyx", "xyzyx", "xyyyx", ".xxx."], 'brass', {'x': 5.2, 'y': 4, 'z': 6.4})
        c.px(cx, cy, 'rune', 5)

    # --- cinta del nombre ---
    nx0, ny0, nx1, ny1 = ZONES['nombre']
    c.rect(nx0 - 7, ny0 + 2, nx0 + 4, ny1 + 1, 'red', 3.2); c.rect(nx1 - 4, ny0 + 2, nx1 + 7, ny1 + 1, 'red', 3.2)
    c.rect(nx0 - 7, ny0 + 2, nx0 + 4, ny0 + 3, 'red', 4.6); c.rect(nx1 - 4, ny0 + 2, nx1 + 7, ny0 + 3, 'red', 4.6)
    box(c, nx0, ny0, nx1, ny1, 'paper', 4.8, 1.0, -1.6)
    c.rect(nx0, ny0, nx1, ny0 + 1, 'brass', 5); c.rect(nx0, ny1 - 1, nx1, ny1, 'brass', 3)

    # --- ventana de la mascota: un rincón cálido del refugio ---
    vx0, vy0, vx1, vy1 = ZONES['ventana']
    c.rect(vx0 - 2, vy0 - 2, vx1 + 2, vy1 + 2, 'wood', 1)
    c.rect(vx0 - 1, vy0 - 1, vx1 + 1, vy1 + 1, 'brass', 4.4)
    m = (xx >= vx0) & (xx < vx1) & (yy >= vy0) & (yy < vy1)
    c.mask(m, 'wall', (3.1 + np.clip(1 - np.hypot((xx - 60) / 60, (yy - 54) / 40), 0, 1) * 1.6).astype(np.float32))
    c.rect(vx0, 80, vx1, 83, 'wood', 3); c.rect(vx0, 80, vx1, 81, 'wood', 5)
    c.rect(vx0, 83, vx1, 86, 'wood', 2.2)
    fm = m & (yy >= 86)
    c.mask(fm, 'wood', (3 + ((np.floor((xx + (yy - 86) * 1.2) / 14)) % 3 - 1) * 0.35).astype(np.float32))
    for x in range(vx0 + 6, vx1, 14):
        c.line(x, 86, x - 4, vy1 - 1, 'wood', 1.4)
    d = np.hypot((xx - 60) / 30, (yy - 93) / 5.2)                 # alfombra verde con borde dorado
    c.mask(fm & (d <= 1), 'brass', 4); c.mask(fm & (d <= 0.88), 'green', 3.2)
    c.mask(fm & (d <= 0.88) & (d > 0.78), 'green', 4.4)
    for (ix, iy, il, ph, dr) in [(vx0 + 3, vy0, 36, 0.4, 1), (vx0 + 11, vy0, 18, 1.7, 1), (vx0 + 19, vy0, 9, 2.6, 1),
                                 (vx1 - 4, vy0, 40, 2.2, -1), (vx1 - 13, vy0, 20, 0.9, -1), (vx1 - 22, vy0, 10, 3.4, -1)]:
        ivy(c, ix, iy, il, ph, dr)
    c.line(92, vy0, 92, vy0 + 9, 'brass', 3)                      # farol colgado
    c.rect(89, vy0 + 9, 95, vy0 + 17, 'brass', 3.6); c.rect(90, vy0 + 10, 94, vy0 + 16, 'glow', 5)
    c.rect(89, vy0 + 9, 95, vy0 + 10, 'brass', 5.4); c.rect(89, vy0 + 17, 95, vy0 + 18, 'brass', 2.6)
    for (px_, py_) in [(20, 96), (96, 97), (30, 90), (88, 91)]:  # margaritas
        c.px(px_, py_, 'petal', 3.4); c.px(px_, py_ - 1, 'sprout', 5)
    c.rect(vx0, vy1 - 2, vx1, vy1, 'wood', 1.5)
    c.rect(vx0, vy0, vx1, vy0 + 1, 'wood', 1.4); c.rect(vx0, vy0, vx0 + 1, vy1, 'wood', 1.4)

    # --- banda del rango: medallón del emblema a la izquierda, cinta roja con filo dorado ---
    rx0, ry0, rx1, ry1 = ZONES['rango']
    box(c, rx0, ry0, rx1, ry1, 'red', 3.4, 1.4, -1.4)
    c.rect(rx0, ry0, rx1, ry0 + 1, 'brass', 5); c.rect(rx0, ry1 - 1, rx1, ry1, 'brass', 3)
    ex, ey = 18, (ry0 + ry1) // 2
    d = np.hypot(xx - ex, yy - ey)
    c.mask(d <= 9, 'void', 0); c.mask(d <= 8, 'brass', 4.2); c.mask(d <= 6.6, 'arcane', 1.6)
    c.mask((d <= 8) & (d > 7) & (yy < ey), 'brass', 6)

    # --- placas de racha y minutos ---
    for key in ('racha', 'minutos'):
        px0, py0, px1, py1 = ZONES[key]
        c.rect(px0 - 1, py0 - 1, px1 + 1, py1 + 1, 'wood', 1.2)
        c.rect(px0, py0, px1, py1, 'paper', 5.2)
        c.rect(px0, py0, px1, py0 + 1, 'paper', 3); c.rect(px0, py0, px0 + 1, py1, 'paper', 3.4)
        c.rect(px0, py1 - 1, px1, py1, 'paper', 6); c.rect(px1 - 1, py0, px1, py1, 'paper', 6)
    c.sprite(15, 128, [".h.", "hwh", "fwf", ".f."], 'flame', {'h': 2, 'w': 4, 'f': 3})
    c.sprite(65, 127, ["xxxxx", ".xyx.", "..x..", ".xyx.", "xxxxx"], 'brass', {'x': 4.4, 'y': 6})

    # --- huecos de insignias ---
    c.rect(10, 144, W - 11, 161, 'wood', 1.4)
    c.rect(11, 145, W - 12, 160, 'wood', 2.4)
    for (sx0, sy0, sx1, sy1) in ZONES['insignias']:
        cx, cy = (sx0 + sx1) / 2, (sy0 + sy1) / 2
        d = np.hypot(xx - cx, yy - cy)
        c.mask(d <= 7.2, 'void', 0); c.mask(d <= 6.4, 'wood', 1.6)

    c.add_light(np.where(m, np.clip(1 - np.hypot((xx - 60) / 70, (yy - 40) / 50), 0, 1) * 0.8, 0).astype(np.float32))
    img = c.render(1, post=lambda a: glow(a, 92, vy0 + 13, 16, '#ffb440', 0.55, rings=3))
    a = np.array(img.convert('RGBA'))
    for (x, y) in [(0, 0), (1, 0), (0, 1), (W - 1, 0), (W - 2, 0), (W - 1, 1), (0, H - 1), (1, H - 1), (0, H - 2),
                   (W - 1, H - 1), (W - 2, H - 1), (W - 1, H - 2)]:
        a[y, x, 3] = 0                                            # esquinas cortadas en escalera
    return Image.fromarray(a, 'RGBA')


def build_badges():
    cv = Canvas(13 * 6, 13)
    yy, xx = cv.grid()
    icons = [
        ('flame', ["..h..", ".hfh.", ".fwf.", ".fff.", "..r.."]),            # racha de 3 días
        ('flame', ["..h..", ".hfh.", "hfwfh", "fwwwf", ".fff.", "..r.."]),    # racha de 7 días
        ('brass', ["xxxxx", ".xyx.", "..x..", ".xyx.", "xxxxx"]),             # 10 horas de estudio
        ('red', ["xxxx.", "xyyx.", "xyyxx", "xxxxx"]),                        # clases dominadas
        ('rune', ["..x..", ".xyx.", "xyyyx", ".xyx.", ".x.x."]),              # desafíos cobrados
        ('arcane', ["..xx.", ".xxxx", "xxyxx", ".xxx.", ".xxx."]),            # vestuario
    ]
    for i, (mat, rows) in enumerate(icons):
        ox = i * 13
        d = np.hypot(xx - (ox + 6), yy - 6)
        cv.mask(d <= 6.4, 'void', 0); cv.mask(d <= 5.6, 'brass', 4.2); cv.mask(d <= 4.6, 'paper', 4.4)
        cv.mask((d <= 5.6) & (d > 4.8) & (yy < 6), 'brass', 6)
        w, h = len(rows[0]), len(rows)
        sx, sy = ox + (13 - w) // 2, (13 - h) // 2
        if mat == 'flame':
            cv.sprite(sx, sy, rows, 'flame', {'h': 2, 'w': 5, 'f': 3, 'r': 1})
        else:
            cv.sprite(sx, sy, rows, mat, {'x': 3.6, 'y': 5.4})
    a = np.array(cv.render(1).convert('RGBA'))
    a[(a[:, :, 0] == 0x14) & (a[:, :, 1] == 0x0c) & (a[:, :, 2] == 0x10), 3] = 0      # fuera del medallón, transparente
    return Image.fromarray(a, 'RGBA')


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    card, badges = build_card(), build_badges()
    card.save(OUT / 'carta.png', optimize=True)
    badges.save(OUT / 'insignias.png', optimize=True)
    (OUT / 'carta.json').write_text(json.dumps({'w': W, 'h': H, 'zonas': ZONES}, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    prev = Image.new('RGB', (W * 4 + 13 * 6 * 4 + 40, H * 4), (30, 22, 26))
    big = card.resize((W * 4, H * 4), Image.NEAREST); prev.paste(big, (0, 0), big)
    bb = badges.resize((13 * 6 * 4, 13 * 4), Image.NEAREST); prev.paste(bb, (W * 4 + 20, 20), bb)
    prev.save(ROOT / 'tools/perfil-carta/vista-previa.png')
    print('ok')
