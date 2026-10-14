"""Capa LEJANA del estudio de planos (grilla fina 720x300): chimenea, reloj de péndulo, ventanal, mesa de planos,
mapas colgando, tablero de corcho, balanza y libro, banco con matraces. Ver docs/update-02-organizacion/SPEC.md (Fase 1).
Reutiliza las piezas del laboratorio (lab_base.py) y su ventana (lab_fondo.draw_window), corrida hacia la izquierda."""
from lab_base import *  # noqa: F401,F403
import lab_fondo
from lab_fondo import candle_fine

DX = -20                                    # el ventanal es el del laboratorio, corrido 20 px a la izquierda
WIN = dict(x0=lab_fondo.WIN['x0'] + DX, x1=lab_fondo.WIN['x1'] + DX, ytop=lab_fondo.WIN['ytop'], ysill=lab_fondo.WIN['ysill'])
CLOCK = dict(cx=168, cy=62, r=13, pend=(168, 86, 34))        # cara del reloj y péndulo (x, y del eje, largo)
CORK = dict(x0=444, y0=40, x1=540, y1=118)
BELL = dict(x=420, y=30)                                      # la campana la dibuja la app (estudio_campana)


def shifted(fn, ctx, view_only=False):
    """Dibuja la ventana del laboratorio en un lienzo aparte y la devuelve corrida DX píxeles."""
    t = Canvas(FW, FH)
    sub = Ctx(ctx.p, ctx.tod)
    inside, lit = fn(sub, t, view_only=view_only) if view_only else fn(sub, t)
    roll = lambda a: np.roll(a, DX, axis=1)
    for g in sub.glows:
        ctx.glows.append((g[0] + DX,) + tuple(g[1:]))
    for l in sub.lights:
        ctx.lights.append((l[0] + DX,) + tuple(l[1:]))
    return roll(t.mat), roll(t.lvl), roll(t.lock), roll(inside), roll(lit)


def paste(c, mat, lvl, lock):
    m = mat != 0
    c.mat[m], c.lvl[m] = mat[m], lvl[m]
    c.lock |= lock & m


# ------------------------------------------------------------------ chimenea con mapa enmarcado encima
def draw_fireplace(ctx, c):
    stone_wall(c, 26, 16, 122, 150, base=3.0, bw=12, bh=8, seed=7)
    c.rect(26, 16, 28, 150, 'stone', 4.6); c.rect(120, 16, 122, 150, 'stone', 1.4)
    c.rect(25, 16, 26, 150, 'ink', 0); c.rect(122, 16, 123, 150, 'ink', 0)
    # mapa enmarcado: costa, río, ruta punteada y una X (diseño propio)
    box(c, 42, 52, 106, 116, 'wood', 3.4)
    c.rect(45, 55, 103, 113, 'paper', 4.2)
    yy, xx = c.grid()
    m = (xx >= 45) & (xx < 103) & (yy >= 55) & (yy < 113)
    coast = 70 + 9 * np.sin((yy - 55) * 0.16) + 4 * np.sin((yy - 55) * 0.5)
    c.mask(m & (xx > coast), 'blue', 4.6)
    c.mask(m & (xx > coast) & (((xx + yy * 2) % 9) == 0), 'blue', 5.4)
    c.mask(m & (np.abs(xx - coast) < 0.8), 'ink', 0)
    for k in range(18):
        x = 50 + k * 1.1; y = 62 + k * 2.6 + 3 * math.sin(k * 0.7)
        if k % 2 == 0:
            c.px(x, y, 'red', 4.4)
    c.sprite(52, 101, ["x.x", ".x.", "x.x"], 'red', {'x': 4.6})
    for (tx, ty) in [(58, 64), (62, 70), (55, 80)]:                           # arbolitos
        c.sprite(tx, ty, [".x.", "xxx", ".o."], 'green', {'x': 3.6, 'o': ('wood', 2.6)})
    c.sprite(90, 58, ["..x..", "..x..", "xxoxx", "..x..", "..x.."], 'brass', {'x': 4.6, 'o': ('red', 4.6)})   # rosa de los vientos
    c.px(92, 57, 'ink', 0)
    # repisa
    c.rect(18, 146, 130, 156, 'wood', 3.6); c.rect(18, 146, 130, 148, 'wood', 5.8); c.rect(18, 155, 130, 156, 'wood', 1.4)
    c.rect(17, 145, 131, 146, 'ink', 0); c.rect(17, 156, 131, 157, 'ink', 0)
    for bx in (24, 118):
        c.sprite(bx, 157, ["xxxxxx", ".xxxx.", "..xx.."], 'wood', {'x': 2.8})
    # boca de la chimenea
    stone_wall(c, 28, 157, 120, FL, base=3.3, bw=14, bh=9, seed=8)
    op = (xx >= 44) & (xx < 104) & (yy >= 176) & (yy < FL) & ((yy >= 190) | (np.hypot(xx - 74, (yy - 190) * 2.1) <= 30))
    c.mask(op, 'clay', 0.6 + np.clip((yy - 176) / 50, 0, 1) * 0.8)
    c.mask(op & (((yy - 176) % 7) == 0), 'clay', 0.2)
    ring = (xx >= 40) & (xx < 108) & (yy >= 172) & (yy < 192) & (np.hypot(xx - 74, (yy - 190) * 2.1) <= 35) & ~op
    c.mask(ring, 'stone', 4.4)
    c.mask(ring & (np.floor(np.arctan2(yy - 190, xx - 74) * 4) % 2 == 0), 'stone', 3.6)
    # leños y brasas
    for (x0, x1, y) in [(52, 96, 216), (58, 92, 211)]:
        c.rect(x0, y, x1, y + 5, 'bark', 3.2); c.rect(x0, y, x1, y + 1, 'bark', 4.6); c.rect(x0, y + 4, x1, y + 5, 'bark', 1.2)
        c.sprite(x0 - 2, y, ["xx", "xo", "xx"], 'wood', {'x': 4.6, 'o': 2.4})
    for x in range(54, 94, 3):
        c.px(x, 215, 'glow', 4 + (x % 2))
    for (fx, h, w) in [(62, 18, 6), (74, 26, 8), (85, 20, 6), (68, 12, 4), (80, 14, 4)]:   # llamas en gota (la app las anima)
        for k in range(h):
            t = k / h
            half = w * math.sin(math.pi * min(1, 0.25 + t * 0.95)) * (1 - t) ** 0.6
            sway = 1.4 * math.sin(t * 3 + fx)
            for dx in range(-int(half), int(half) + 1):
                core = 1 - abs(dx) / max(half, 1)
                c.px(fx + dx + sway * t, 212 - k, 'flame', min(5, 0.6 + core * 3.2 + (1 - t) * 1.4))
        c.lock[212 - h:213, fx - w - 2:fx + w + 3] = True
    c.rect(18, FL - 4, 130, FL, 'stone', 4.8); c.rect(18, FL - 4, 130, FL - 3, 'stone', 6)
    k = {'dia': 0.8, 'tarde': 1.1, 'noche': 1.5}[ctx.tod]
    ctx.lights.append((74, 196, 240, 2.6 * k, 0.9))
    ctx.glows.append((74, 198, 90, '#ff9a40', 1.0 * k, 0.9))
    # repisa: velas, planos enrollados, compás y un frasco de tinta
    candle_fine(ctx, c, 30, 146, 12)
    candle_fine(ctx, c, 112, 146, 8)
    for i, (x, w) in enumerate([(48, 26), (52, 22), (50, 24)]):
        y = 140 - i * 4
        c.rect(x, y, x + w, y + 4, 'paper', 4.4 - i * 0.3); c.rect(x, y, x + w, y + 1, 'paper', 5.6)
        c.rect(x + w - 3, y, x + w, y + 4, 'paper', 2.6); c.px(x + w - 2, y + 2, 'paper', 1.4)
        c.rect(x + 10, y, x + 12, y + 4, 'red', 3.6)
    c.line(84, 145, 90, 128, 'brass', 4.6); c.line(96, 145, 90, 128, 'brass', 3.6); c.rect(89, 126, 92, 129, 'brass', 5.6)
    c.rect(100, 138, 106, 146, 'blue', 2.4); c.rect(100, 138, 101, 146, 'blue', 4.2); c.rect(101, 136, 105, 138, 'ink', 0)
    c.line(104, 136, 110, 120, 'petal', 3.4); c.line(105, 136, 111, 121, 'petal', 2.2)


# ------------------------------------------------------------------ reloj de pared con péndulo (= Hoy)
def draw_clock(ctx, c):
    cx, cy, r = CLOCK['cx'], CLOCK['cy'], CLOCK['r']
    for k in range(6):                                                         # corona escalonada
        c.rect(150 + k * 2, 34 - k, 186 - k * 2, 35 - k, 'wood', 4.6 + k * 0.2)
    c.rect(166, 26, 170, 29, 'brass', 5)
    box(c, 150, 35, 186, 82, 'wood', 3.6)
    box(c, 154, 82, 182, 136, 'wood', 3.2)
    c.rect(150, 82, 186, 84, 'wood', 5.0)
    box(c, 152, 136, 184, 142, 'wood', 3.8)
    c.sprite(164, 142, ["xxxxxxxx", ".xxxxxx.", "..xxxx..", "...xx..."], 'wood', {'x': 3.0})
    disc(c, cx, cy, r + 2, 'brass', lambda d, dx, dy: 4.2 - (dx + dy) * 0.08)
    disc(c, cx, cy, r, 'wax', lambda d, dx, dy: 4.4 - d * 0.6)
    for k in range(12):
        a = k * math.pi / 6
        x, y = cx + math.sin(a) * (r - 2.5), cy - math.cos(a) * (r - 2.5)
        c.px(x, y, 'ink', 0)
        if k % 3 == 0:
            c.px(x + (1 if k == 9 else -1 if k == 3 else 0), y + (1 if k == 0 else -1 if k == 6 else 0), 'ink', 0)
    c.lock[cy - r:cy + r + 1, cx - r:cx + r + 1] |= c.mat[cy - r:cy + r + 1, cx - r:cx + r + 1] == c.mid('wax')
    # ventanita del péndulo (vidrio oscuro: la app dibuja el péndulo con la hora real)
    c.rect(158, 86, 178, 130, 'glass', 1.2)
    c.rect(158, 86, 160, 130, 'glass', 2.6)
    c.rect(157, 85, 179, 86, 'ink', 0); c.rect(157, 130, 179, 131, 'ink', 0)
    c.rect(157, 86, 158, 130, 'ink', 0); c.rect(178, 86, 179, 130, 'ink', 0)
    for y in range(90, 128, 9):
        c.px(175, y, 'glass', 4.6)
    for (x, y) in [(152, 38), (183, 38), (152, 78), (183, 78)]:
        c.px(x, y, 'brass', 5.4)
    # papelito pegado: "HOY"
    c.rect(186, 46, 196, 54, 'paper', 4.8); c.rect(186, 46, 196, 47, 'paper', 5.6)
    c.rect(187, 49, 195, 50, 'ink', 0); c.rect(187, 51, 192, 52, 'ink', 0)


# ------------------------------------------------------------------ mesa de planos (= Calendario)
def draw_plan_table(ctx, c):
    x0, x1, top = 210, 390, 184
    for y in range(top, top + 8):                                              # tablero inclinado (más ancho adelante)
        k = (y - top)
        c.rect(x0 - k // 2, y, x1 + k // 2, y + 1, 'wood', 3.8 if k < 6 else 2.6)
    c.rect(x0 - 4, top + 8, x1 + 4, top + 11, 'wood', 1.8)
    c.rect(x0 - 1, top - 1, x1 + 1, top, 'ink', 0)
    for (lx) in (x0 + 2, x1 - 10):
        c.rect(lx, top + 11, lx + 8, FL, 'wood', 2.8); c.rect(lx, top + 11, lx + 2, FL, 'wood', 4.2)
        c.rect(lx - 1, top + 11, lx, FL, 'ink', 0); c.rect(lx + 8, top + 11, lx + 9, FL, 'ink', 0)
    c.rect(x0 + 10, 210, x1 - 10, 214, 'wood', 3.2); c.rect(x0 + 10, 210, x1 - 10, 211, 'wood', 4.8)
    # pergamino desplegado con días (cuadrícula) y sellos de lacre
    px0, px1 = 226, 374
    c.rect(px0, top - 3, px1, top + 6, 'paper', 4.6); c.rect(px0, top - 3, px1, top - 2, 'paper', 5.6)
    for x in range(px0 + 4, px1 - 2, 10):
        c.rect(x, top - 1, x + 1, top + 5, 'paper', 3.4)
    c.rect(px0 + 2, top + 2, px1 - 2, top + 3, 'paper', 3.4)
    c.rect(px0 - 4, top - 4, px0, top + 7, 'paper', 3.0); c.rect(px1, top - 4, px1 + 4, top + 7, 'paper', 3.0)   # rollos
    c.rect(px0 - 4, top - 4, px0 - 3, top + 7, 'paper', 5.0); c.rect(px1 + 3, top - 4, px1 + 4, top + 7, 'paper', 1.8)
    for (sx, col) in [(262, 'red'), (292, 'red'), (322, 'blue'), (346, 'green')]:
        c.sprite(sx, top - 1, [".x.", "xox", ".x."], col, {'x': 3.6, 'o': 5.0})
    # herramientas del cartógrafo: compás, regla, tintero con pluma, lupa
    c.line(300, top - 2, 306, top - 18, 'brass', 4.6); c.line(312, top - 2, 306, top - 18, 'brass', 3.6)
    c.rect(305, top - 21, 308, top - 18, 'brass', 5.8)
    c.rect(236, top - 6, 284, top - 4, 'wood', 5.2); c.rect(236, top - 6, 284, top - 5, 'wood', 6.6)
    for x in range(238, 284, 4):
        c.px(x, top - 5, 'ink', 0)
    c.rect(356, top - 10, 366, top - 1, 'ink', 0); c.rect(357, top - 9, 365, top - 2, 'blue', 2.0); c.rect(357, top - 9, 358, top - 2, 'blue', 3.6)
    c.rect(358, top - 12, 364, top - 10, 'brass', 4.4)
    for k in range(14):                                                        # pluma
        c.px(362 + k * 0.5, top - 12 - k, 'petal', 3.2)
        if k > 3:
            c.px(363 + k * 0.5, top - 12 - k, 'petal', 2.2); c.px(361 + k * 0.5, top - 12 - k + 1, 'petal', 4.0)
    disc(c, 334, top - 6, 4, 'glass', lambda d, dx, dy: 5.0 - d * 2)
    c.line(337, top - 3, 342, top + 1, 'wood', 3.6)
    candle_fine(ctx, c, 216, top - 1, 9)
    # cesto con planos enrollados bajo la mesa
    box(c, 258, 202, 300, FL - 1, 'wood', 2.6)
    for x in range(260, 300, 6):
        c.rect(x, 203, x + 1, FL - 2, 'wood', 1.6)
    for i, x in enumerate(range(262, 296, 6)):
        h, lean = 16 + (i * 7) % 8, (i % 3) - 1
        for k in range(h):
            xx_ = x + round(lean * k / 6)
            c.rect(xx_, 202 - k, xx_ + 5, 203 - k, 'paper', 3.4 - (i % 2) * 0.5)
            c.px(xx_, 202 - k, 'paper', 4.6)
            c.px(xx_ + 4, 202 - k, 'paper', 2.0)
        top_x = x + round(lean * h / 6)
        c.rect(top_x, 202 - h - 1, top_x + 5, 202 - h + 1, 'paper', 5.0)
        c.px(top_x + 2, 202 - h, 'paper', 2.2)
        if i % 2:
            c.rect(x + round(lean), 196, x + round(lean) + 5, 197, 'red', 3.6)


# ------------------------------------------------------------------ mapa colgando bajo la campana
def hanging_map(ctx, c, x0, y0, w, h, seed):
    r = det('map', seed)
    c.line(x0 + w // 2, 16, x0 + 2, y0, 'stem', 2.6); c.line(x0 + w // 2, 16, x0 + w - 2, y0, 'stem', 2.6)
    c.rect(x0 - 3, y0, x0 + w + 3, y0 + 3, 'wood', 4.4); c.rect(x0 - 3, y0, x0 + w + 3, y0 + 1, 'wood', 6)
    c.rect(x0, y0 + 3, x0 + w, y0 + h, 'paper', 4.2)
    c.rect(x0, y0 + 3, x0 + 1, y0 + h, 'paper', 5.2); c.rect(x0 + w - 1, y0 + 3, x0 + w, y0 + h, 'paper', 2.8)
    for k in range(5):                                                         # curvas de nivel
        yb = y0 + 12 + k * 9
        for x in range(x0 + 3, x0 + w - 3):
            y = yb + 2.5 * math.sin(x * 0.4 + k + seed)
            c.px(x, y, 'clay', 2.4 if k % 2 else 3.0)
    for _ in range(3):
        c.sprite(r.randint(x0 + 3, x0 + w - 6), r.randint(y0 + 8, y0 + h - 8), ["x.x", ".x.", "x.x"], 'red', {'x': 4.4})
    c.rect(x0 - 3, y0 + h, x0 + w + 3, y0 + h + 3, 'wood', 3.6); c.rect(x0 - 3, y0 + h + 2, x0 + w + 3, y0 + h + 3, 'wood', 1.6)
    c.px(x0 - 3, y0 + h + 1, 'brass', 5); c.px(x0 + w + 2, y0 + h + 1, 'brass', 5)


# ------------------------------------------------------------------ tablero de corcho (= Pruebas); las fichas las pone la app
def draw_cork(ctx, c):
    x0, y0, x1, y1 = CORK['x0'], CORK['y0'], CORK['x1'], CORK['y1']
    box(c, x0, y0, x1, y1, 'wood', 3.6)
    c.rect(x0 + 1, y0 + 1, x1 - 1, y0 + 3, 'wood', 5.6)
    yy, xx = c.grid()
    m = (xx >= x0 + 4) & (xx < x1 - 4) & (yy >= y0 + 4) & (yy < y1 - 4)
    n = ((xx * 7919 + yy * 104729) % 23) / 23.0
    c.mask(m, 'clay', 3.4)
    c.mask(m & (n < 0.18), 'clay', 2.4)
    c.mask(m & (n > 0.86), 'clay', 4.4)
    c.mask(m & (yy < y0 + 6), 'clay', 2.2)
    c.rect(x0 + 4, y0 + 4, x0 + 5, y1 - 4, 'clay', 2.0)
    # un hilo rojo de cartógrafo y un trozo de mapa viejo (decoración fija)
    c.line(x0 + 8, y1 - 10, x1 - 12, y0 + 12, 'red', 3.2)
    c.rect(x1 - 26, y1 - 22, x1 - 8, y1 - 8, 'paper', 3.6); c.rect(x1 - 26, y1 - 22, x1 - 8, y1 - 21, 'paper', 4.8)
    c.line(x1 - 24, y1 - 12, x1 - 10, y1 - 18, 'blue', 3.8)
    c.px(x1 - 17, y1 - 23, 'brass', 5.6)
    # rótulo tallado
    c.rect(x0 + 30, y1 - 1, x1 - 30, y1 + 6, 'wood', 4.2); c.rect(x0 + 30, y1 + 5, x1 - 30, y1 + 6, 'wood', 1.6)
    c.rect(x0 + 40, y1 + 1, x1 - 40, y1 + 4, 'brass', 4.2); c.rect(x0 + 40, y1 + 1, x1 - 40, y1 + 2, 'brass', 5.6)


# ------------------------------------------------------------------ balanza y libro de notas (= Notas)
def draw_scale_book(ctx, c):
    sh = 98
    c.rect(560, sh, 638, sh + 5, 'wood', 4.4); c.rect(560, sh, 638, sh + 1, 'wood', 6.2); c.rect(560, sh + 4, 638, sh + 5, 'wood', 1.6)
    for bx in (566, 628):
        c.sprite(bx, sh + 5, ["xxxx", "xxx.", "xx..", "x..."], 'wood', {'x': 3.0})
    # balanza de latón (la app la puede inclinar más adelante)
    cx = 599
    c.rect(cx - 9, sh - 4, cx + 10, sh, 'brass', 3.6); c.rect(cx - 9, sh - 4, cx + 10, sh - 3, 'brass', 5.4)
    c.rect(cx - 1, sh - 34, cx + 2, sh - 4, 'brass', 4.0); c.rect(cx - 1, sh - 34, cx, sh - 4, 'brass', 5.6)
    c.rect(cx - 22, sh - 36, cx + 23, sh - 34, 'brass', 4.6); c.rect(cx - 22, sh - 36, cx + 23, sh - 35, 'brass', 6)
    ball(c, cx, sh - 37, 2, 'brass', 5)
    for px_, col in ((cx - 20, 'red'), (cx + 21, 'green')):
        c.line(px_, sh - 34, px_ - 6, sh - 18, 'steel', 4.4); c.line(px_, sh - 34, px_ + 6, sh - 18, 'steel', 4.4)
        c.rect(px_ - 8, sh - 18, px_ + 9, sh - 16, 'brass', 4.8); c.rect(px_ - 6, sh - 16, px_ + 7, sh - 15, 'brass', 3.0)
        c.sprite(px_ - 3, sh - 21, [".xx.", "xxxx"], col, {'x': 4.0})
    # libros apilados a un lado del estante
    for i, (col, h) in enumerate([('blue', 16), ('red', 20), ('green', 14)]):
        lab_fondo.book(c, 616 + i * 6, sh, 6, h, col, det('nb', i))
    # atril con el libro grande abierto
    c.rect(594, 172, 604, FL - 4, 'wood', 3.0); c.rect(594, 172, 596, FL - 4, 'wood', 4.6)
    c.rect(593, 172, 594, FL - 4, 'ink', 0); c.rect(604, 172, 605, FL - 4, 'ink', 0)
    c.rect(582, FL - 5, 616, FL - 1, 'wood', 3.4); c.rect(582, FL - 5, 616, FL - 4, 'wood', 5.2)
    for y in range(156, 172):
        k = y - 156
        c.rect(578 - k // 4, y, 620 + k // 4, y + 1, 'wood', 3.6 if k < 13 else 2.2)
    c.rect(576, 155, 622, 156, 'ink', 0)
    for y in range(146, 162):                                                    # páginas
        k = y - 146
        c.rect(580 - k // 5, y, 598, y + 1, 'paper', 5.0 - (k > 12) * 1.2)
        c.rect(600, y, 618 + k // 5, y + 1, 'paper', 4.4 - (k > 12) * 1.2)
    c.rect(598, 146, 600, 162, 'paper', 2.4)
    for y in range(150, 160, 3):
        c.rect(583, y, 595, y + 1, 'paper', 2.6); c.rect(603, y, 615, y + 1, 'paper', 2.6)
    c.sprite(605, 153, ["x.", "xx", "xx"], 'red', {'x': 4.4})                    # sello en la página
    c.rect(599, 160, 601, 176, 'red', 3.8)                                      # cinta marcapáginas
    c.px(600, 176, 'red', 2.2)


# ------------------------------------------------------------------ banco con matraces (= Laboratorio)
def draw_bench(ctx, c):
    x0, x1, top = 640, 716, 168
    c.rect(x0, top, x1, top + 6, 'wood', 4.2); c.rect(x0, top, x1, top + 2, 'wood', 6.0); c.rect(x0, top + 5, x1, top + 6, 'wood', 1.6)
    c.rect(x0 - 1, top - 1, x1 + 1, top, 'ink', 0)
    for lx in (x0 + 4, x1 - 10):
        c.rect(lx, top + 6, lx + 6, FL, 'wood', 2.8); c.rect(lx, top + 6, lx + 2, FL, 'wood', 4.2)
    c.rect(x0 + 4, 200, x1 - 4, 204, 'wood', 3.6); c.rect(x0 + 4, 200, x1 - 4, 201, 'wood', 5.4)
    for i, (bx, col) in enumerate([(652, 'clay'), (662, 'blue'), (672, 'green'), (684, 'clay'), (694, 'lav')]):
        h = 12 + (i * 5) % 7
        c.rect(bx, 200 - h, bx + 7, 200, col, 3.2); c.rect(bx, 200 - h, bx + 1, 200, col, 4.8)
        c.rect(bx + 1, 200 - h + 4, bx + 6, 200 - h + 7, 'paper', 4.6)
        c.rect(bx + 2, 200 - h - 2, bx + 5, 200 - h, 'wood', 4)
    # erlenmeyer verde
    ex, eb = 652, top
    for k in range(22):
        w = 2 if k > 14 else 2 + (14 - k) // 2
        c.rect(ex - w, eb - 1 - k, ex + w + 1, eb - k, 'glass', 2.6)
        c.px(ex - w, eb - 1 - k, 'glass', 5.0)
        if k < 9:
            c.rect(ex - w + 1, eb - 1 - k, ex + w, eb - k, 'sprout', 5.2 if k > 6 else 4.2)
    c.lock[eb - 10:eb, ex - 9:ex + 10] = True
    ctx.glows.append((ex, eb - 6, 14, '#c6d862', 0.35, 1))
    # balón sobre el soporte con mechero
    bx, by = 680, 140
    c.rect(bx - 1, 112, bx + 1, top, 'steel', 4.0)
    c.rect(bx - 12, 128, bx + 1, 130, 'steel', 4.4)
    c.rect(bx - 15, 126, bx - 9, 133, 'steel', 3.2)
    disc(c, bx - 12, by, 9, 'glass', lambda d, dx, dy: 3.0 + 1.6 * np.clip(-(dx + dy) / 12, -1, 1))
    m = disc(c, bx - 12, by + 2, 7, 'arcane', lambda d, dx, dy: 4.6 - d)
    c.lock[by - 8:by + 10, bx - 22:bx - 2] |= c.mat[by - 8:by + 10, bx - 22:bx - 2] == c.mid('arcane')
    c.rect(bx - 14, 124, bx - 10, 132, 'glass', 3.6)
    c.px(bx - 16, by - 4, 'glass', 6.4)
    c.rect(bx - 16, 154, bx - 8, top, 'steel', 3.0); c.rect(bx - 15, 152, bx - 9, 154, 'steel', 4.6)
    c.sprite(bx - 14, 147, [".x.", "xox", "xox"], 'crystal', {'x': 5, 'o': 6.6})
    ctx.glows.append((bx - 12, by + 2, 18, '#b88cf4', 0.5, 1))
    ctx.glows.append((bx - 12, 150, 8, '#5cc4dc', 0.6, 1))
    # probeta alta
    c.rect(700, top - 30, 706, top, 'glass', 2.6); c.rect(700, top - 30, 701, top, 'glass', 5)
    c.rect(701, top - 14, 705, top, 'crystal', 4.4)
    c.rect(698, top - 2, 708, top, 'glass', 3.6)
    candle_fine(ctx, c, 708, top, 7)
    # repisa de frascos arriba
    c.rect(636, 120, 718, 124, 'wood', 4.2); c.rect(636, 120, 718, 121, 'wood', 6)
    for i, x in enumerate(range(640, 714, 9)):
        col = ['red', 'crystal', 'sprout', 'lav', 'clay', 'blue', 'arcane', 'green', 'red'][i % 9]
        h = 8 + (i * 3) % 6
        c.rect(x, 120 - h, x + 6, 120, 'glass', 2.6); c.rect(x + 1, 120 - h + 3, x + 5, 120, col, 4.0)
        c.rect(x + 1, 120 - h - 2, x + 5, 120 - h, 'wood', 4.4)


def draw_hanging_herbs(ctx, c):
    r = det('herbs-est')
    for x, ln in ((136, 18), (520, 14), (658, 22), (690, 16)):
        c.line(x, 16, x, 22, 'stem', 3)
        c.rect(x - 2, 22, x + 3, 25, 'wax', 3.6)
        for k in range(ln // 3):
            leaf(c, x + r.choice([-4, -2, 2, 4]), 27 + k * 3, r.choice([LEAF_A, LEAF_B, LEAF_C]), 5 - (k % 2), r.choice(['leaf', 'sprout', 'lav']))


def draw_ivy(ctx, c):
    r = det('ivy-est')
    for x in (WIN['x0'] - 14, WIN['x0'] - 6, WIN['x0'] + 18, WIN['x1'] + 4, WIN['x1'] + 12, WIN['x1'] - 20):
        vine(c, r, x, WIN['ytop'] + 18 + abs(x - WIN['x0']) * 0.1, r.randint(40, 84), base=4.8, sway=2.4, every=3)
    for x in (30, 44, 116):                                                     # la hiedra se come la chimenea
        vine(c, r, x, 16, r.randint(30, 70), base=4.4, sway=2.0, every=3)
    for x in (560, 572, 714):
        vine(c, r, x, 16, r.randint(26, 60), base=4.6, sway=2.0, every=3)


def draw_mushrooms(ctx, c):
    for i, (x, h, cw) in enumerate([(14, 8, 5), (134, 9, 5), (142, 6, 4), (196, 7, 4), (402, 12, 7), (414, 6, 4), (440, 8, 5),
                                    (548, 10, 6), (560, 6, 4), (626, 7, 4), (634, 11, 6)]):
        mushroom(ctx, c, x, FL - 1, h, cw, 100 + i)


def draw_far(ctx):
    c = Canvas(FW, FH)
    c.dither = {'wall': 0.4, 'stone': 0.5, 'wood': 0.5}
    plaster(c, 0, 0, FW, 150, seed=11)
    stone_wall(c, 0, 150, FW, FL, base=2.5, mossy=0.8, seed=4)
    c.rect(0, 148, FW, 152, 'wood', 3.2); c.rect(0, 148, FW, 149, 'wood', 5.2); c.rect(0, 151, FW, 152, 'wood', 1.6)
    c.rect(0, 0, FW, 16, 'wood', 3.0)
    c.rect(0, 0, FW, 2, 'wood', 5.4); c.rect(0, 2, FW, 3, 'wood', 4.2); c.rect(0, 13, FW, 15, 'wood', 1.4); c.rect(0, 15, FW, 16, 'ink', 0)
    for x in range(0, FW, 2):
        if (x * 7) % 23 < 10:
            c.rect(x, 5 + (x // 13) % 3 * 2, x + 2, 6 + (x // 13) % 3 * 2, 'wood', 2.0)
    for (a, b) in ((134, 144), (548, 558)):
        timber_post(c, a, b, 16, FL, seed=a + 3)
    mat, lvl, lock, inside, lit = shifted(lab_fondo.draw_window, ctx)
    paste(c, mat, lvl, lock)
    hole = lit | (inside & (c.mat != c.mid('wood')))
    snap_m, snap_l = c.mat.copy(), c.lvl.copy()
    draw_fireplace(ctx, c)
    draw_clock(ctx, c)
    hanging_map(ctx, c, 404, 66, 30, 72, 1)
    draw_cork(ctx, c)
    draw_scale_book(ctx, c)
    draw_bench(ctx, c)
    draw_plan_table(ctx, c)
    draw_mushrooms(ctx, c)
    draw_ivy(ctx, c)
    draw_hanging_herbs(ctx, c)
    lantern_x = 600
    lab_fondo.lantern(ctx, c, lantern_x, 18, True)
    c.rect(BELL['x'] - 4, 16, BELL['x'] + 5, 19, 'steel', 3.0)                   # soporte de la campana
    c.line(BELL['x'], 19, BELL['x'], BELL['y'], 'steel', 3.6)
    c.window_hole = hole & (c.mat == snap_m) & (c.lvl == snap_l)
    return c, inside, lit


def draw_view(ctx):
    c = Canvas(FW, FH)
    mat, lvl, lock, inside, lit = shifted(lab_fondo.draw_window, ctx, view_only=True)
    paste(c, mat, lvl, lock)
    return c, inside
