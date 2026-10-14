"""Kit pixel de la vista Hoy (Organización · Fase 1): madera, pergamino, rollos, relojes de arena y cinta.
Mismas rampas que el refugio (tools/home-pixel/pixel.py). Se muestran ×4 en la app (CSS image-rendering: pixelated).
Uso: python tools/torre-pixel/estudio_ui.py  → dist/assets/torre/estudio/ui-*.png"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lab_base import *  # noqa: F401,F403,E402

OUT = ROOT / 'dist/assets/torre/estudio'


def save(c, name, alpha=True):
    img = c.render(1)
    if alpha:
        a = Image.fromarray(((c.mat != 0) * 255).astype(np.uint8))
        img = img.convert('RGBA'); img.putalpha(a)
    img.save(OUT / name, optimize=True)


def wood():
    """Tablones horizontales, repetibles en x e y (64x32)."""
    c = Canvas(64, 32)
    c.dither = {'wood': 0.6}
    yy, xx = c.grid()
    board = (yy // 8).astype(int)
    lv = 2.3 + ((board * 37) % 3 - 1) * 0.3 + 0.25 * np.sin(xx * 0.35 + board * 2 + np.sin(yy * 0.9) * 1.5)
    c.mask(np.ones_like(yy, bool), 'wood', lv.astype(np.float32))
    c.mask((yy % 8) == 0, 'wood', 0.8)
    c.mask((yy % 8) == 1, 'wood', (lv + 0.9).astype(np.float32))
    joint = ((xx + board * 23) % 64) == 0
    c.mask(joint, 'wood', 0.8)
    for b in range(4):
        x = (b * 23 + 9) % 64
        c.px(x, b * 8 + 4, 'wood', 1.0); c.px(x + 1, b * 8 + 4, 'wood', 1.4)
        nx = (b * 23 + 2) % 64
        c.px(nx, b * 8 + 2, 'steel', 4.6)
    save(c, 'ui-madera.png', alpha=False)


def paper():
    """Pergamino repetible (32x32): fibras y manchas suaves."""
    c = Canvas(32, 32)
    c.dither = {'paper': 0.0}
    yy, xx = c.grid()
    n = np.random.default_rng(7).random(xx.shape)
    lv = 4.25 + 0.25 * np.sin(xx * 0.4 + yy * 0.2) * np.cos(yy * 0.4)
    c.mask(np.ones_like(yy, bool), 'paper', lv.astype(np.float32))
    c.mask(n < 0.06, 'paper', 3.6)
    c.mask(n > 0.96, 'paper', 4.9)
    save(c, 'ui-pergamino.png', alpha=False)


def roll():
    """Rollo del pergamino (cilindro): 1 px de ancho se estira en x; 2 tapas en los extremos."""
    rows = [0, 1.8, 3.4, 4.6, 5.0, 4.4, 3.4, 2.4, 1.4, 0]
    c = Canvas(14, 10)
    for x in range(14):
        for y, lv in enumerate(rows):
            if x in (0, 13):
                c.px(x, y, 'ink', 0)
            elif x in (1, 12):
                c.px(x, y, 'wood', [0, 3, 4.6, 5.6, 6, 5.2, 4.2, 3.2, 2.2, 0][y]) if 0 < y < 9 else c.px(x, y, 'ink', 0)
            else:
                c.px(x, y, 'paper' if 0 < y < 9 else 'ink', lv)
    save(c, 'ui-rollo.png')


HG = [   # reloj de arena 12x20: m = madera, g = vidrio, el resto lo pinta la arena
    "mmmmmmmmmmmm",
    "mmmmmmmmmmmm",
    ".m........m.",
    ".mgggggggg m",
    ".mg......gm.",
    ".mg......gm.",
    ".m.g....g.m.",
    ".m..g..g..m.",
    ".m...gg...m.",
    ".m....g...m.",
    ".m...gg...m.",
    ".m..g..g..m.",
    ".m.g....g.m.",
    ".mg......gm.",
    ".mg......gm.",
    ".mgggggggg m",
    ".m........m.",
    "mmmmmmmmmmmm",
    "mmmmmmmmmmmm",
    "............",
]


def hourglass_sheet():
    """6 cuadros: 0 = toda la arena arriba … 5 = toda abajo. La arena baja por escalones (sin animación suave)."""
    sheet = Canvas(12 * 6, 20)
    top_rows = [(4, 2, 9), (5, 2, 9), (6, 3, 8), (7, 4, 7)]                    # (y, x0, x1) cámara de arriba
    bot_rows = [(14, 2, 9), (13, 2, 9), (12, 3, 8), (11, 4, 7)]                # de abajo hacia arriba
    for f in range(6):
        ox = f * 12
        for y, row in enumerate(HG):
            for x, ch in enumerate(row):
                if ch == 'm':
                    lv = 5.4 if y in (0, 17) else 1.6 if y in (1, 18) else 3.6 if x in (1, 10) else 4.2
                    sheet.px(ox + x, y, 'wood', lv)
                elif ch == 'g':
                    sheet.px(ox + x, y, 'glass', 4.4)
        for (y, x0, x1) in [(4, 2, 9), (5, 2, 9), (6, 3, 8), (7, 4, 7), (8, 5, 6), (9, 6, 6), (10, 5, 6), (11, 4, 7), (12, 3, 8), (13, 2, 9), (14, 2, 9)]:
            for x in range(x0, x1 + 1):
                if sheet.mat[y, ox + x] == 0:
                    sheet.px(ox + x, y, 'glass', 1.4)
        fall = f / 5
        n_top = round((1 - fall) * 4)
        for (y, x0, x1) in top_rows[4 - n_top:]:
            for x in range(x0, x1 + 1):
                sheet.px(ox + x, y, 'rune', 3.8 if x > x0 else 4.8)
        n_bot = round(fall * 4)
        for (y, x0, x1) in bot_rows[:n_bot]:
            for x in range(x0, x1 + 1):
                sheet.px(ox + x, y, 'rune', 3.8 if x > x0 else 4.8)
        if 0 < f < 5:
            sheet.px(ox + 6, 9, 'rune', 5.4); sheet.px(ox + 6, 10, 'rune', 5.4); sheet.px(ox + 6, 12 if n_bot < 3 else 11, 'rune', 4.6)
        sheet.px(ox + 3, 5, 'glass', 6.6); sheet.px(ox + 3, 13, 'glass', 6.6)
    save(sheet, 'ui-reloj.png')


def ribbon():
    """Cinta roja de "semana crítica": punta izq (6) · centro repetible (1) · punta der (6), 12 de alto, con corte en V."""
    c = Canvas(13, 12)
    for y in range(12):
        lv = 4.4 if y == 1 else 1.6 if y == 10 else 3.2
        edge = y in (0, 11)
        for x in range(13):
            d = min(x, 12 - x)                                 # distancia al extremo más cercano
            if d < 3 - abs(y - 5.5) * 0.55:
                continue                                        # el corte en V
            c.px(x, y, 'ink' if edge else 'red', 0 if edge else lv)
            if not edge and d < 3.6 - abs(y - 5.5) * 0.55:
                c.px(x, y, 'red', 1.2)
    save(c, 'ui-cinta.png')


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    wood(); paper(); roll(); hourglass_sheet(); ribbon()
    print('ok ui')
