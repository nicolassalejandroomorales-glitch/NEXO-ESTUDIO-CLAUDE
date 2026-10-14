"""Capas MEDIA y FRENTE del laboratorio (grilla gruesa 360x150, el "sello" del refugio).
Píxel 'void' = transparente (deja ver la capa lejana). Los contornos usan 'ink'."""
from lab_base import *  # noqa: F401,F403

FLC = FL // 2          # piso en la grilla gruesa (113)


def plank_floor(c):
    yy, xx = c.grid()
    VPX, VPY = 180, -200
    fy = (yy - VPY) / (CH - VPY)
    xb = VPX + (xx - VPX) / np.maximum(fy, 1e-3)
    board = np.floor(xb / 16).astype(int)
    edge = xb / 16 - board
    lv = 3.1 + ((board * 37) % 5 - 2) * 0.24
    m = yy >= FLC
    depth = np.log((yy - VPY) / (FLC - VPY))
    jt = depth * 8 + (board * 0.37) % 1
    joint = np.abs(jt - np.round(jt)) < 0.05
    gr = (xb * 1.7 + np.sin(yy * 0.4 + board) * 3) % 7 < 0.8
    c.mask(m, 'wood', lv.astype(np.float32))
    c.mask(m & gr, 'wood', (lv - 0.6).astype(np.float32))
    c.mask(m & (edge < 0.07), 'wood', 1.0)
    c.mask(m & (edge > 0.07) & (edge < 0.14), 'wood', (lv + 1).astype(np.float32))
    c.mask(m & joint, 'wood', 1.2)
    nail = m & (np.abs(edge - 0.5) < 0.06) & (np.abs(jt - np.round(jt)) < 0.12) & ~joint
    c.mask(nail, 'wood', 1.6)
    c.mask(m & (yy < FLC + 1), 'ink', 0)
    c.mask(m & (yy >= FLC + 1) & (yy < FLC + 3), 'wood', 1.4)


def rug(ctx, c):
    y0, y1 = 124, 143
    for y in range(y0, y1):
        k = (y - y0) / (y1 - y0)
        a, b = int(110 - 14 * k), int(250 + 14 * k)
        c.rect(a, y, b, y + 1, 'red', 2.6 + 0.3 * ((y // 2) % 2))
        c.rect(a, y, a + 2, y + 1, 'rune', 2.6); c.rect(b - 2, y, b, y + 1, 'rune', 2.6)
        if y in (y0, y1 - 1):
            c.rect(a, y, b, y + 1, 'rune', 2.6)
        if y in (y0 + 3, y1 - 4):
            c.rect(a + 4, y, b - 4, y + 1, 'rune', 2.0)
        for x in range(a + 10, b - 10, 12):                    # rombos tejidos
            dy = abs(y - (y0 + y1) / 2)
            if dy < 5:
                c.rect(x - (4 - int(dy)), y, x + (4 - int(dy)) + 1, y + 1, 'lav' if (x // 12) % 2 else 'green', 3.0)
    for x in range(98, 266, 2):
        c.px(x, y1, 'paper', 3); c.px(x, y1 + 1, 'paper', 2.2)
    c.lvl[y0:y1, :] += 0.0


def front_table(ctx, c):
    """Esquina de una mesa pesada en primer plano (abajo a la izquierda), con desorden de alquimista."""
    top = 124
    c.rect(0, top, 74, top + 5, 'wood', 4.2)
    c.rect(0, top, 74, top + 1, 'wood', 6.0)
    c.rect(73, top, 74, top + 5, 'wood', 2)
    c.rect(0, top + 5, 74, top + 7, 'wood', 1.6)
    c.rect(0, top + 7, 70, CH, 'wood', 2.4)
    c.rect(56, top + 7, 66, CH, 'wood', 3.2); c.rect(56, top + 7, 57, CH, 'wood', 4.6)
    c.rect(-1, top - 1, 75, top, 'ink', 0); c.rect(74, top, 75, top + 7, 'ink', 0)
    for k in range(3):                                           # libros apilados
        col = ['blue', 'red', 'green'][k]
        y = top - 4 * (k + 1)
        c.rect(4 + k, y, 30 - k, y + 4, col, 3); c.rect(4 + k, y, 30 - k, y + 1, col, 4.8)
        c.rect(26 - k, y, 30 - k, y + 4, 'paper', 4.4); c.rect(4 + k, y + 3, 30 - k, y + 4, col, 1.6)
    c.rect(3, top - 13, 32, top - 12, 'ink', 0)
    # taza de té humeante
    c.rect(36, top - 6, 44, top, 'clay', 3.6); c.rect(36, top - 6, 37, top, 'clay', 5.2); c.rect(36, top - 6, 44, top - 5, 'clay', 1.8)
    c.rect(44, top - 5, 46, top - 2, 'clay', 3.2)
    c.rect(37, top - 6, 43, top - 5, 'clay', 1.0)
    for k, (sx, sy) in enumerate([(39, top - 9), (40, top - 11), (39, top - 13), (41, top - 15)]):
        c.px(sx, sy, 'petal', 2.4 - k * 0.3)
    # pergamino desenrollado con notas
    c.rect(48, top - 2, 70, top, 'paper', 4.6); c.rect(48, top - 2, 70, top - 1, 'paper', 5.6)
    for x in range(50, 68, 3):
        c.px(x, top - 1, 'ink', 0)
    c.sprite(66, top - 4, ["xx", "xx"], 'paper', {'x': 3.6})
    # vela gruesa (llama en movimiento la pone la app)
    c.rect(10, top - 20, 15, top - 12, 'wax', 4)
    c.rect(10, top - 20, 11, top - 12, 'wax', 5.4)
    c.sprite(11, top - 24, FLAME[1], 'flame', {'h': 2, 'w': 5, 'f': 3})
    ctx.lights.append((25, 2 * (top - 22), 70, 1.3, 1))
    ctx.glows.append((25, 2 * (top - 22), 22, '#ffb440', 0.7, 1))
    if ctx.p >= 1:                                               # frasco con muestra de Aminas (aparece al avanzar)
        c.rect(22, top - 18, 27, top - 13, 'glass', 3.4); c.rect(23, top - 16, 26, top - 13, 'arcane', 4.4)
        c.rect(23, top - 20, 26, top - 18, 'wood', 4.4)


def front_plant(ctx, c):
    """Helecho grande en maceta, muy cerca de la cámara (abajo a la derecha)."""
    r = det('fern-front')
    c.rect(318, 128, 346, CH, 'clay', 3.0)
    c.rect(318, 128, 320, CH, 'clay', 4.6); c.rect(344, 128, 346, CH, 'clay', 1.6)
    c.rect(314, 124, 350, 130, 'clay', 3.8); c.rect(314, 124, 350, 125, 'clay', 5.4); c.rect(314, 129, 350, 130, 'clay', 1.6)
    c.rect(313, 123, 351, 124, 'ink', 0)
    c.rect(318, 135, 346, 137, 'rune', 2.4)
    for i in range(9):
        a = math.radians(-160 + i * 17.5)
        ln = 26 + r.randint(0, 14)
        for s in range(ln):
            t = s / ln
            x = 332 + math.cos(a) * s * 1.05
            y = 124 + math.sin(a) * s * 0.85 + (t ** 2) * 18
            c.px(x, y, 'stem', 1.6)
            if s % 2 == 0 and s > 3:
                w = int(4 * math.sin(math.pi * t)) + 1
                for d in range(1, w + 1):
                    c.px(x - math.sin(a) * d, y + math.cos(a) * d * 0.5 + d * 0.3, 'shade', 3.2 + (1 - t) * 1.2)
                    c.px(x + math.sin(a) * d, y - math.cos(a) * d * 0.5 + d * 0.3, 'shade', 2.4 + (1 - t))
    if ctx.p == 2:
        mushroom(ctx, c, 306, 149, 5, 4, 41, shine=0.5)


def crate(ctx, c):
    x0, y0 = 276, 128
    box(c, x0, y0, x0 + 34, CH + 2, 'wood', 3.0)
    for y in (y0 + 7, y0 + 14):
        c.rect(x0 + 1, y, x0 + 33, y + 1, 'wood', 1.6)
    c.line(x0 + 2, y0 + 2, x0 + 32, CH, 'wood', 4.4)
    for i, col in enumerate(['green', 'blue', 'clay']):
        bx = x0 + 4 + i * 10
        if ctx.p >= i // 2:
            c.rect(bx, y0 - 10, bx + 6, y0, col, 3.4); c.rect(bx, y0 - 10, bx + 1, y0, col, 5)
            c.rect(bx + 2, y0 - 14, bx + 4, y0 - 10, col, 3)
            c.rect(bx + 1, y0 - 7, bx + 5, y0 - 4, 'paper', 4.6)


def front_ivy(ctx, c):
    """Hiedra oscura colgando arriba en los bordes: está pegada a la cámara (se mueve más con el parallax)."""
    r = det('ivy-front')
    c.rect(0, 0, CW, 4, 'wood', 1.6)
    c.rect(0, 4, CW, 5, 'ink', 0)
    for x, ln in ((4, 30), (12, 22), (22, 36), (34, 14), (330, 28), (342, 40), (352, 20)):
        vine(c, r, x, 4, ln, base=2.6, sway=1.6, every=2)


def draw_front(ctx, part='all'):
    """part: 'floor' (piso y alfombra, van bajo la mascota) · 'fg' (muebles del primer plano, tapan a la mascota) · 'all'."""
    c = Canvas(CW, CH)
    c.dither = {'wood': 0.5, 'stone': 0.5}
    if part in ('all', 'floor'):
        plank_floor(c)
        rug(ctx, c)
    if part in ('all', 'fg'):
        crate(ctx, c)
        front_table(ctx, c)
        front_plant(ctx, c)
        front_ivy(ctx, c)
    # sombra de contacto bajo la pared y los muebles (en la grilla gruesa)
    yy, xx = c.grid()
    c.add_light(np.where((yy >= FLC) & (yy < FLC + 6), -0.9 * (1 - (yy - FLC) / 6), 0).astype(np.float32))
    return c
