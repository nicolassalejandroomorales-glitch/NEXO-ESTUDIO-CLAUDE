"""Capa LEJANA del laboratorio (grilla fina 720x300): pared, ventana, estantería, campana extractora, pizarra y frascos."""
from lab_base import *  # noqa: F401,F403
import lab_base as B

WIN = dict(x0=244, x1=396, ytop=34, ysill=178)
WIN_CX = (WIN['x0'] + WIN['x1']) / 2
WIN_R = (WIN['x1'] - WIN['x0']) / 2
WIN_CY = WIN['ytop'] + WIN_R
BAY = pixel.BAYER
HOOD = dict(x0=410, x1=566)


def window_inside(c, ext=0):
    yy, xx = c.grid()
    if ext:                                   # vista para el parallax: rectángulo más grande que el vano
        return (xx >= WIN['x0'] - ext) & (xx < WIN['x1'] + ext) & (yy >= WIN['ytop'] - ext) & (yy < WIN['ysill'] + 4)
    return (xx >= WIN['x0']) & (xx < WIN['x1']) & (yy < WIN['ysill']) & ((yy >= WIN_CY) | (np.hypot(xx - WIN_CX, yy - WIN_CY) <= WIN_R))


def mullions(c):
    yy, xx = c.grid()
    v = np.abs(xx - WIN_CX) < 2.2
    h = (np.abs(yy - 98) < 2) | (np.abs(yy - 142) < 2)
    ring = np.abs(np.hypot(xx - WIN_CX, yy - WIN_CY) - WIN_R * 0.56) < 1.6
    return window_inside(c) & (v | h | (ring & (yy < WIN_CY)))


def thick_line(c, x0, y0, x1, y1, th, mat, lv):
    n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
    for i in range(n + 1):
        t = i / max(1, n)
        x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        c.rect(round(x - th / 2), round(y - th / 2), round(x + th / 2) + 1, round(y + th / 2) + 1, mat, lv)


# ------------------------------------------------------------------ ventana en arco con vista
def draw_window(ctx, c, view_only=False):
    yy, xx = c.grid()
    inside = window_inside(c, 40 if view_only else 0)
    R, cy = WIN_R, WIN_CY
    dist = np.hypot(xx - WIN_CX, yy - cy)
    top = yy < cy
    ang = np.arctan2(yy - cy, xx - WIN_CX)
    ring = top & (dist <= R + 17) & (dist > R + 7) & (not view_only)
    seg = np.floor(ang / (math.pi / 15)).astype(int)
    segf = ang / (math.pi / 15) - seg
    lv = 4.3 + ((seg * 37) % 3 - 1) * 0.5
    c.mask(ring, 'stone', lv)
    c.mask(ring & (dist < R + 9.5), 'stone', lv + 0.7)
    c.mask(ring & (segf < 0.09), 'stone', 2.0)
    c.mask(ring & (dist > R + 15), 'stone', lv - 0.7)
    for x0 in (() if view_only else (WIN['x0'] - 17, WIN['x1'] + 7)):
        jm = (~top) & (xx >= x0) & (xx < x0 + 10) & (yy < WIN['ysill'] + 8)
        row = np.floor((yy - cy) / 13).astype(int)
        lvj = 4.3 + ((row * 53) % 3 - 1) * 0.5
        c.mask(jm, 'stone', lvj)
        c.mask(jm & (((yy - cy) % 13) < 1), 'stone', 2.0)
        c.mask(jm & (xx < x0 + 2), 'stone', lvj + 0.7)
        c.mask(jm & (xx >= x0 + 8), 'stone', lvj - 0.9)
    if not view_only:
        c.rect(WIN['x0'] - 20, WIN['ysill'], WIN['x1'] + 20, WIN['ysill'] + 9, 'stone', 4.6)
        c.rect(WIN['x0'] - 20, WIN['ysill'], WIN['x1'] + 20, WIN['ysill'] + 2, 'stone', 6.0)
        c.rect(WIN['x0'] - 20, WIN['ysill'] + 7, WIN['x1'] + 20, WIN['ysill'] + 9, 'stone', 2.4)
    wood = (top & (dist <= R + 7) & (dist > R)) | ((~top) & (yy < WIN['ysill']) & (((xx >= WIN['x0'] - 7) & (xx < WIN['x0'])) | ((xx >= WIN['x1']) & (xx < WIN['x1'] + 7))))
    wood &= not view_only
    c.mask(wood, 'wood', 3.4 + 0.5 * np.sin(xx * 0.9))
    c.mask(wood & (((dist < R + 2) & top) | (((xx < WIN['x0'] - 5) | (xx >= WIN['x1'] + 5)) & ~top)), 'wood', 5.4)
    c.mask(wood & (dist > R + 5.2) & top, 'wood', 1.8)
    # --- vista
    mat, lo, hi = {'dia': ('sky', 0.6, 5.8), 'tarde': ('dusk', 0.2, 6.9), 'noche': ('night', 0.0, 4.9)}[ctx.tod]
    t = np.clip((yy - WIN['ytop']) / (WIN['ysill'] - WIN['ytop'] - 28), 0, 1)
    bay = BAY[(yy % 4).astype(int), (xx % 4).astype(int)]
    sky = np.floor(lo + (hi - lo) * t ** 1.15 + bay * 0.9 + 0.5)
    c.mask(inside, mat, sky.astype(np.float32))
    r = det('window')
    if ctx.tod == 'noche':
        for _ in range(70):
            sx, sy = r.randint(WIN['x0'], WIN['x1'] - 1), r.randint(WIN['ytop'], 120)
            if inside[sy, sx]:
                c.px(sx, sy, 'petal', r.choice([2, 3, 4, 4]))
        for sx, sy in [(280, 60), (352, 52), (302, 92), (372, 112)]:
            c.px(sx, sy, 'petal', 4.6)
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                c.px(sx + dx, sy + dy, 'petal', 2.4)
        mm = np.hypot(xx - 362, yy - 78) <= 11
        c.mask(mm & inside, 'wax', 4.6)
        c.mask((np.hypot(xx - 367, yy - 74) <= 10) & mm & inside, 'night', 3.8)
        ctx.glows.append((362, 78, 24, '#9bb4ff', 0.28, 1))
    elif ctx.tod == 'dia':
        sunm = np.hypot(xx - 372, yy - 70) <= 9
        c.mask(inside & (np.hypot(xx - 372, yy - 70) <= 17) & ~sunm, 'sky', 6.4)
        c.mask(inside & sunm, 'sky', 7)
        for bx, by in [(300, 72), (312, 80), (336, 64)]:
            c.line(bx, by, bx + 2, by - 2, 'ink', 0); c.line(bx + 2, by - 2, bx + 4, by, 'ink', 0)
    else:
        sunm = np.hypot(xx - 318, yy - 150) <= 16
        c.mask(inside & (np.hypot(xx - 318, yy - 150) <= 30) & ~sunm, 'dusk', 6.6)
        c.mask(inside & sunm, 'dusk', 7)
    cmat, cl, ch = {'dia': ('cloud', 2.0, 3.6), 'tarde': ('dusk', 4.6, 6.4), 'noche': ('night', 3.0, 4.2)}[ctx.tod]
    for (cx, cy2, blobs) in [(276, 62, [(0, 0, 13), (14, -3, 10), (-12, 2, 9), (26, 3, 8)]), (352, 112, [(0, 0, 16), (18, 2, 11), (-18, 3, 10), (32, 5, 9)]),
                             (286, 118, [(0, 0, 10), (12, 2, 8)])]:
        for (ox, oy, rr) in blobs:
            bd = np.hypot(xx - (cx + ox), (yy - (cy2 + oy)) * 1.7)
            m = inside & (bd <= rr)
            c.mask(m, cmat, np.where(yy < cy2 + oy - rr * 0.18, ch, cl + 0.7).astype(np.float32))
    base = WIN['ysill'] - 44
    far = {'dia': [('hill', 1.8), ('hill', 3.0), ('tree', 2.0)], 'tarde': [('lav', 2.4), ('lav', 1.4), ('shade', 1.0)],
           'noche': [('night', 2.2), ('night', 1.0), ('shade', 0.0)]}[ctx.tod]
    for i, (mm_, lv_) in enumerate(far):
        hy = base - 10 + i * 13 + 6 * np.sin(xx * (0.03 + i * 0.011) + i * 2.1) + 3 * np.sin(xx * 0.11 + i)
        m = inside & (yy > hy)
        c.mask(m, mm_, (lv_ + np.clip((yy - hy) / 40, 0, 1) * 0.9 - bay * 0.3).astype(np.float32))
        if i == 2:
            for tx in range(WIN['x0'] + 3, WIN['x1'] - 3, 6):
                ty = int(base + 16 + 6 * math.sin(tx * 0.062 + 4.2) + 3 * math.sin(tx * 0.11 + 2))
                hh = 6 + (tx * 7) % 5
                for k in range(hh):
                    wdt = 1 + k // 3
                    yk = ty - hh + k
                    if 0 <= yk < c.h and inside[yk, tx]:
                        c.rect(tx - wdt, yk, tx + wdt + 1, yk + 1, mm_, lv_ + 0.6 - k * 0.04)
    tx0, tb = 300, base - 5                                         # torre lejana del alquimista
    tmat, tlv = ('stone', 3.0) if ctx.tod == 'dia' else ('night', 1.6)
    c.rect(tx0, tb - 38, tx0 + 9, tb, tmat, tlv)
    c.rect(tx0, tb - 38, tx0 + 2, tb, tmat, tlv + 1.2)
    for k in range(10):
        c.rect(tx0 - 2 + k // 3, tb - 48 + k, tx0 + 11 - k // 3, tb - 47 + k, 'clay' if ctx.tod == 'dia' else 'night', 2.4 if ctx.tod == 'dia' else 1.0)
    if ctx.tod != 'dia':
        c.rect(tx0 + 3, tb - 28, tx0 + 6, tb - 23, 'rune', 5)
        ctx.glows.append((tx0 + 4, tb - 26, 8, '#ffd860', 0.5, 1))
    if view_only:
        return inside, inside
    refl = inside & (((xx + yy * 0.9) % 46) < 3) & (yy > WIN['ytop'] + 6)
    c.lvl[refl] += 0.55
    mu = mullions(c)
    c.mask(mu, 'wood', 3.4)
    c.mask(mu & ((np.abs(xx - WIN_CX) < 2.2) & (xx < WIN_CX) | (np.abs(yy - 98) < 1) | (np.abs(yy - 142) < 1)), 'wood', 5.2)
    c.mask(mu & (xx > WIN_CX + 0.5) & (np.abs(xx - WIN_CX) < 2.2), 'wood', 1.8)
    lit = inside & ~mu & (yy > WIN['ytop'] + 3)
    return inside, lit


def window_ivy(ctx, c):
    r = det('ivy-win')
    for x in (WIN['x0'] - 14, WIN['x0'] - 6, WIN['x0'] + 18, WIN['x0'] + 34):
        vine(c, r, x, WIN['ytop'] + 18 + abs(x - WIN['x0']) * 0.4, r.randint(46, 90), base=5, sway=2.4, every=3)
    for x in (WIN['x1'] + 4, WIN['x1'] + 12, WIN['x1'] - 20):
        vine(c, r, x, WIN['ytop'] + 20 + abs(x - WIN['x1']) * 0.4, r.randint(40, 84), base=4.6, sway=2.4, every=3)


# ------------------------------------------------------------------ estantería de libros que se llena
def book(c, x, base, w, h, col, r):
    top = base - h
    c.rect(x, top, x + w, base, col, 3)
    c.rect(x, top, x + 1, base, col, 4.8)
    c.rect(x + w - 1, top, x + w, base, col, 1.4)
    c.rect(x, top, x + w, top + 1, col, 2.4)
    c.rect(x + 1, top + 3, x + w - 1, top + 4, 'rune', 2.8)
    c.rect(x + 1, base - 5, x + w - 1, base - 4, 'rune', 2.8)
    if w >= 7 and r.random() < 0.6:
        c.rect(x + 2, top + 8, x + w - 2, top + 8 + min(9, max(4, h - 20)), 'paper', 3.8)
        c.rect(x + 2, top + 8, x + w - 2, top + 9, 'paper', 5)
    if r.random() < 0.14:
        c.px(x + w // 2, top + 6, 'crystal', 5.6)
    c.rect(x + w, top, x + w + 1, base, 'ink', 0)


CUP = ["..xxxxxxxx..", ".xlxxxxxxxx.", "xxlxxxxxxxxx", "oxlxxxxxxxxo", "oxxxxxxxxxxo", ".xxxxxxxxxx.", "..xxxxxxxx..", "...xxxxxx...",
       "....xxxx....", ".....xx.....", ".....xx.....", "....xxxx....", "..xxxxxxxx..", ".xxxxxxxxxx."]


def draw_bookshelf(ctx, c):
    c.rect(8, 24, 150, 226, 'wood', 3.2)
    c.rect(8, 24, 10, 226, 'wood', 5.0)
    c.rect(148, 24, 150, 226, 'wood', 1.8)
    c.rect(3, 17, 155, 31, 'wood', 4.2)
    c.rect(3, 17, 155, 19, 'wood', 6.2)
    c.rect(3, 29, 155, 31, 'wood', 2.0)
    for dx in range(6, 152, 7):
        c.rect(dx, 21, dx + 4, 27, 'wood', 3.0); c.rect(dx, 21, dx + 1, 27, 'wood', 4.6)
    c.rect(14, 34, 144, 212, 'wood', 0.9)
    c.rect(78, 34, 84, 212, 'wood', 3.6); c.rect(78, 34, 79, 212, 'wood', 5.4); c.rect(83, 34, 84, 212, 'wood', 1.6)
    rows = [(34, 74), (80, 120), (126, 166), (172, 212)]
    comps = [(14, 78), (84, 144)]
    for ri, (yt, yb) in enumerate(rows):
        for ci, (x0, x1) in enumerate(comps):
            r = det('books', ri, ci)
            x = x0 + 1
            limit = 106 if (ri == 0 and ci == 1) else x1 - 1
            while x < limit - 5:
                if r.random() < 0.08:
                    x += r.randint(3, 6)
                    continue
                w = r.choice([5, 6, 6, 7, 8, 9])
                h = r.randint(25, 36)
                col = r.choice(['red', 'green', 'blue', 'paper', 'lav', 'clay', 'green', 'red', 'arcane'])
                lean = r.random() < 0.07
                if x + w > limit:
                    break
                if present(ctx, 'book', ri, ci, x):
                    book(c, x + 2, yb - 3, w, h - 3, col, r) if lean else book(c, x, yb, w, h, col, r)
                x += w + 1
            if ((ri in (1, 3) and ci == 1) or (ri == 2 and ci == 0)) and present(ctx, 'stack', ri, ci):
                sx = x1 - 26
                for k, col in enumerate(r.sample(['red', 'blue', 'green', 'clay'], 3)):
                    y0 = yb - 6 * (k + 1)
                    c.rect(sx + k, y0, sx + 22 - k, y0 + 6, col, 3); c.rect(sx + k, y0, sx + 22 - k, y0 + 1, col, 4.8)
                    c.rect(sx + 22 - k - 4, y0, sx + 22 - k, y0 + 6, 'paper', 4); c.rect(sx + k, y0 + 5, sx + 22 - k, y0 + 6, col, 1.6)
            c.lvl[yt:yt + 4, x0:x1] -= 0.8
        c.rect(10, yb, 148, yb + 6, 'wood', 4.4)
        c.rect(10, yb, 148, yb + 2, 'wood', 6.4)
        c.rect(10, yb + 5, 148, yb + 6, 'wood', 1.6)
    c.rect(10, 218, 148, 226, 'wood', 2.6)
    for px_ in (22, 62, 102, 136):
        c.rect(px_, 220, px_ + 14, 225, 'wood', 3.4); c.rect(px_, 220, px_ + 14, 221, 'wood', 1.6)
    c.rect(7, 24, 8, 226, 'ink', 0); c.rect(150, 24, 151, 226, 'ink', 0)
    if ctx.p >= 1:                                                     # reliquias según el rango
        c.sprite(114, 54, CUP, 'brass', {'x': 4.2, 'l': 6.4, 'o': 2.2})
        ctx.lights.append((120, 54, 30, 0.5, 1))
    if ctx.p >= 2:
        ball(c, 96, 52, 8, 'crystal', 4.2)
        c.sprite(90, 59, ["xxxxxxxxxxxx", ".xxxxxxxxxx."], 'brass', {'x': 3.6})
        c.px(93, 48, 'crystal', 7); c.px(94, 47, 'crystal', 7)
        ctx.glows.append((96, 52, 20, '#5cc4dc', 0.5, 1))
        ctx.lights.append((96, 52, 34, 0.6, 1))
        c.line(134, 36, 134, 42, 'stem', 2)
        c.rect(131, 42, 138, 45, 'red', 4)
        ball(c, 134, 50, 5, 'brass', 4.6)
        c.px(134, 49, 'brass', 6.6)


# ------------------------------------------------------------------ póster de grupos funcionales + microscopio
def draw_poster_and_scope(ctx, c):
    box(c, 168, 46, 226, 136, 'wood', 3.6)
    c.rect(170, 48, 224, 134, 'paper', 4.0)
    micro(c, 176, 52, 'R-NH2', 'ink', 0, 1)
    cols = ['red', 'green', 'blue', 'arcane', 'crystal', 'clay']
    for j in range(6):
        for i in range(4):
            x, y = 173 + i * 13, 62 + j * 11
            on = present(ctx, 'poster', i, j)
            col = cols[(i + j * 2) % 6]
            c.rect(x, y, x + 12, y + 10, col if on else 'paper', 3.4 if on else 2.6)
            if on:
                c.rect(x, y, x + 12, y + 1, col, 5)
                c.rect(x + 3, y + 3, x + 9, y + 4, 'paper', 5.4); c.rect(x + 3, y + 6, x + 7, y + 7, 'paper', 5.4)
    for (px_, py_) in [(171, 49), (222, 49), (171, 132), (222, 132)]:
        c.px(px_, py_, 'red', 4.6); c.px(px_ + 1, py_, 'red', 3)
    c.rect(164, 196, 230, 204, 'wood', 4.4); c.rect(164, 196, 230, 198, 'wood', 6.2); c.rect(164, 203, 230, 204, 'wood', 1.6)
    c.rect(170, 204, 176, 226, 'wood', 2.8); c.rect(218, 204, 224, 226, 'wood', 2.8); c.rect(170, 204, 171, 226, 'wood', 4.2)
    c.rect(170, 214, 224, 218, 'wood', 3.2); c.rect(170, 214, 224, 215, 'wood', 5)
    box(c, 176, 188, 214, 196, 'brass', 3.6)
    c.rect(206, 150, 212, 190, 'brass', 3.8); c.rect(206, 150, 207, 190, 'brass', 5.4)
    c.rect(190, 150, 212, 157, 'brass', 3.8); c.rect(190, 150, 212, 151, 'brass', 5.6)
    box(c, 190, 138, 199, 182, 'steel', 3.4)
    c.rect(191, 139, 192, 181, 'steel', 6)
    box(c, 192, 130, 198, 138, 'steel', 2.2)
    c.rect(193, 182, 197, 188, 'brass', 3.4)
    box(c, 182, 184, 206, 187, 'steel', 3.0)
    c.rect(188, 183, 200, 184, 'glass', 5.4)
    ball(c, 210, 168, 4, 'brass', 4.4)
    ball(c, 203, 174, 3, 'brass', 4.4)
    ctx.glows.append((195, 200, 12, '#ffd270', 0.12, 1))


# ------------------------------------------------------------------ jardinera bajo la ventana: plantas por tema
def sprout_up(c, r, x, y0, height, base, kind, stage, wilt=False):
    ramp_pool = ['leaf', 'sprout', 'leaf', 'shade']
    if wilt:
        base, ramp_pool = 3.0, ['stem']
    if stage == 0:
        for dx in (-2, 2):
            c.px(x + dx, y0 - 1, 'sprout', 5); c.px(x + dx + (1 if dx > 0 else -1), y0 - 2, 'sprout', 6)
        c.px(x, y0 - 1, 'sprout', 4)
        return
    hh = int(height * (0.6 if stage == 1 else 1.0))
    p0 = r.random() * 6
    pts = []
    for k in range(hh):
        sx = x + (1.4 if kind != 'fern' else 0.8) * math.sin(k * 0.17 + p0)
        if wilt:
            sx += (k / max(1, hh)) ** 2 * 6
        pts.append((sx, y0 - 2 - k))
        c.px(sx, y0 - 2 - k, 'stem', max(0, base - 3))
    side = 1
    step = 3 if kind != 'fern' else 2
    for i in range(3, hh, step):
        sx, sy = pts[i]
        side = -side
        rows = LEAF_B if kind == 'herb' else LEAF_A if kind == 'flower' else LEAF_C
        leaf(c, sx + side * 3, sy, rows, base + r.choice([0, 1, -1]) - (1.0 if wilt else 0), r.choice(ramp_pool), flip=side < 0)
    if stage == 2 and not wilt:
        sx, sy = pts[-1]
        if kind == 'flower':
            c.sprite(int(sx) - 2, int(sy) - 4, [".p.p.", "ppypp", ".ppp.", ".p.p."], 'petal', {'p': 3.6, 'y': ('rune', 4.6)})
        elif kind == 'herb':
            c.sprite(int(sx) - 1, int(sy) - 4, [".l.", "lbl", ".l."], 'lav', {'l': 4.4, 'b': ('arcane', 4)})
            c.sprite(int(sx) + 4, int(sy) + 2, [".l.", "lbl"], 'lav', {'l': 4, 'b': ('arcane', 3.6)})
        else:
            leaf(c, sx, sy - 2, LEAF_D, base + 2, 'sprout')


def draw_trough(ctx, c):
    x0, x1, y0 = 236, 404, 176
    box(c, x0, y0 + 2, x1, y0 + 28, 'wood', 3.2)
    c.rect(x0, y0 + 2, x1, y0 + 4, 'wood', 5.2)
    for xx_ in range(x0 + 14, x1, 28):
        c.rect(xx_, y0 + 6, xx_ + 1, y0 + 27, 'wood', 1.6)
    c.rect(x0 + 3, y0, x1 - 3, y0 + 4, 'bark', 2.6)
    kinds = ['flower', 'herb', 'fern', 'flower', 'herb', 'fern', 'flower']
    for i in range(7):
        x = x0 + 14 + i * 24
        rk = rank('plant', i)
        stage = 2 if rk < ctx.fill - 0.04 else (1 if rk < ctx.fill + 0.4 else 0)
        wilt = ctx.p == 1 and i == 3
        if wilt:
            stage = max(stage, 1)
        sprout_up(c, det('pl', i), x, y0 + 2, 26 + (i % 3) * 5, 5, kinds[i], stage, wilt)
    if ctx.p == 1:                                                     # repaso pendiente: la planta olvidada pide agua
        px0 = x0 + 14 + 3 * 24
        c.rect(px0 - 5, y0 + 10, px0 + 6, y0 + 17, 'paper', 4.4)
        c.rect(px0 - 5, y0 + 10, px0 + 6, y0 + 11, 'paper', 5.6)
        c.px(px0, y0 + 13, 'red', 4.4); c.px(px0, y0 + 15, 'red', 4.4)


# ------------------------------------------------------------------ campana extractora con montaje de destilación
def draw_hood(ctx, c):
    x0, x1 = HOOD['x0'], HOOD['x1']
    yy, xx = c.grid()
    # ducto al techo
    c.rect(468, 14, 490, 62, 'steel', 3.4)
    c.rect(468, 14, 471, 62, 'steel', 5.2); c.rect(487, 14, 490, 62, 'steel', 1.8)
    for y in range(20, 60, 10):
        c.rect(468, y, 490, y + 1, 'steel', 1.8)
        for rx in (470, 486):
            c.px(rx, y + 3, 'steel', 6)
    c.rect(466, 54, 492, 60, 'brass', 3.8); c.rect(466, 54, 492, 55, 'brass', 5.8)
    # capota
    for y in range(58, 84):
        inset = int((84 - y) * 1.15)
        c.rect(x0 + inset, y, x1 - inset, y + 1, 'steel', 3.0 + (y - 58) * 0.02)
        c.px(x0 + inset, y, 'steel', 5.4); c.px(x0 + inset + 1, y, 'steel', 5.0)
        c.px(x1 - inset - 1, y, 'steel', 1.6)
    c.rect(x0 - 2, 82, x1 + 2, 88, 'brass', 3.8); c.rect(x0 - 2, 82, x1 + 2, 83, 'brass', 5.8); c.rect(x0 - 2, 87, x1 + 2, 88, 'brass', 1.8)
    for bx in range(x0 + 6, x1, 18):
        c.px(bx, 85, 'brass', 6.4)
    # montantes
    for (a, b) in ((x0, x0 + 14), (x1 - 14, x1)):
        c.rect(a, 88, b, FL, 'steel', 2.6)
        c.rect(a, 88, a + 2, FL, 'steel', 4.6)
        c.rect(b - 2, 88, b, FL, 'steel', 1.4)
        for by in range(98, 200, 22):
            c.px(a + 6, by, 'brass', 5.8)
    # interior con azulejos
    ix0, ix1, iy0, iy1 = x0 + 14, x1 - 14, 88, 192
    c.rect(ix0, iy0, ix1, iy1, 'glass', 3.0)
    tile = ((yy - iy0) % 11 == 0) | ((xx - ix0 + ((yy - iy0) // 11 % 2) * 6) % 12 == 0)
    c.mask((xx >= ix0) & (xx < ix1) & (yy >= iy0) & (yy < iy1) & tile, 'glass', 1.9)
    c.lvl[iy0:iy0 + 8, ix0:ix1] -= 0.8
    c.rect(ix0, iy1 - 2, ix1, iy1, 'steel', 1.4)
    # mesón de trabajo
    c.rect(x0 + 8, 190, x1 - 8, 200, 'stone', 5.0); c.rect(x0 + 8, 190, x1 - 8, 192, 'stone', 6.0); c.rect(x0 + 8, 198, x1 - 8, 200, 'stone', 2.6)
    # montaje de destilación
    cxm, cym, rr = 452, 164, 18                                                   # matraz de fondo redondo
    box(c, 434, 178, 470, 192, 'ink', 1.0, edge=False)                            # manta calefactora
    c.rect(436, 179, 468, 191, 'steel', 1.8)
    for ly in (183, 186, 189):
        c.rect(438, ly, 466, ly + 1, 'flame', 2.2 + (ly == 186))
    c.lock[183:190, 438:466] = True
    ctx.glows.append((452, 186, 18, '#ff9a30', 0.7, 1))
    ctx.lights.append((452, 186, 40, 0.6, 1))
    ball(c, cxm, cym, rr, 'glass', 3.6, hi=1.8)
    liq = (np.hypot(xx - cxm, yy - cym) <= rr - 1.5) & (yy > cym - 2)
    c.mask(liq, 'sprout', (4.4 + 1.2 * np.clip(-(xx - cxm) / rr, -1, 1) + BAY[(yy % 4).astype(int), (xx % 4).astype(int)] * 0.6).astype(np.float32))
    c.mask((np.abs(np.hypot(xx - cxm, yy - cym) - rr) < 1.0), 'glass', 5.6)
    c.rect(cxm - 12, cym - 12, cxm - 10, cym - 6, 'glass', 7)                         # brillo
    for bx, by in [(444, 170), (456, 174), (450, 178), (460, 168)]:                    # burbujas
        c.sprite(bx, by, [".x.", "x.x", ".x."], 'sprout', {'x': 7})
    box(c, cxm - 4, 126, cxm + 5, cym - rr + 4, 'glass', 3.4, edge=False)               # cuello
    c.rect(cxm - 4, 126, cxm - 3, cym - rr + 4, 'glass', 6)
    box(c, cxm - 5, 120, cxm + 6, 128, 'wood', 4.2)                                    # tapón
    c.line(cxm + 1, 119, cxm + 1, 98, 'ink', 0); c.px(cxm + 1, 98, 'red', 5)           # termómetro
    thick_line(c, cxm + 5, 123, 512, 150, 8, 'glass', 3.4)                             # refrigerante inclinado
    thick_line(c, cxm + 5, 123, 512, 150, 4, 'crystal', 4.2)
    thick_line(c, cxm + 5, 122, 512, 149, 1, 'glass', 6.6)
    for hx, hy in ((480, 132), (498, 142)):                                           # mangueras de agua
        c.line(hx, hy, hx + 8, hy - 30, 'crystal', 3.4); c.line(hx + 1, hy, hx + 9, hy - 30, 'crystal', 5)
    c.rect(480, 100, 483, 192, 'steel', 3.4); c.rect(480, 100, 481, 192, 'steel', 5.6)  # varilla soporte
    c.rect(447, 130, 484, 134, 'brass', 4.0); c.rect(447, 130, 484, 131, 'brass', 6)    # pinza
    box(c, 468, 188, 498, 192, 'steel', 3.0)
    ex = 522                                                                          # matraz Erlenmeyer receptor
    for y in range(152, 190):
        w = 3 + int((y - 152) * 0.3)
        c.rect(ex - w, y, ex + w + 1, y + 1, 'glass', 3.0)
        c.px(ex - w, y, 'glass', 5.8); c.px(ex + w, y, 'glass', 1.8)
        if y > 172:
            c.rect(ex - w + 1, y, ex + w, y + 1, 'arcane', 4.2 + 0.8 * ((ex - w + 3) % 2 == 0))
    c.rect(ex - 5, 140, ex + 6, 152, 'glass', 3.4); c.rect(ex - 5, 140, ex - 4, 152, 'glass', 6)
    c.rect(ex - 4, 172, ex + 5, 173, 'arcane', 6)
    for dy in (151, 158, 165):                                                        # gotas
        c.px(512, dy, 'crystal', 6); c.px(512, dy + 1, 'crystal', 4)
    c.px(512, 164, 'crystal', 7)
    ball(c, 542, 178, 6, 'clay', 4.0)                                                 # frasco lavador
    c.rect(540, 164, 545, 173, 'clay', 3.4); c.line(545, 166, 552, 160, 'clay', 3.4)
    # hoja de vidrio levantada (con reflejos) y manija
    sash = (xx >= ix0) & (xx < ix1) & (yy >= iy0) & (yy < 150)
    c.lvl[sash & (((xx + yy) % 40) < 5)] += 0.9
    c.lvl[sash & (((xx + yy) % 40) >= 5) & (((xx + yy) % 40) < 8)] += 0.4
    c.rect(ix0 - 1, iy0, ix0 + 2, 154, 'steel', 3.4); c.rect(ix1 - 2, iy0, ix1 + 1, 154, 'steel', 2.0)
    c.rect(ix0 - 1, 150, ix1 + 1, 156, 'steel', 3.6); c.rect(ix0 - 1, 150, ix1 + 1, 151, 'steel', 5.8); c.rect(ix0 - 1, 155, ix1 + 1, 156, 'steel', 1.6)
    box(c, 484, 151, 500, 155, 'brass', 4.2)
    # gabinete inferior
    c.rect(x0 + 14, 200, x1 - 14, FL, 'wood', 2.6)
    for dx0 in (x0 + 18, 478):
        box(c, dx0, 204, dx0 + 60, 222, 'wood', 3.0)
        c.rect(dx0 + 6, 208, dx0 + 54, 209, 'wood', 1.8)
        ball(c, dx0 + 52 if dx0 == x0 + 18 else dx0 + 8, 212, 2, 'brass', 5.2)
    # manómetro y rótulo
    ball(c, 559, 118, 8, 'brass', 4.4)
    ball(c, 559, 118, 5, 'paper', 4.6, hi=0.8)
    c.line(559, 118, 562, 114, 'ink', 0)
    c.rect(x0 + 18, 92, x0 + 52, 100, 'paper', 4.2)
    micro(c, x0 + 21, 93, 'NH2', 'red', 4.2, 1)
    ctx.glows.append((452, 150, 52, '#76943a', 0.55, 1))
    ctx.lights.append((470, 140, 70, 0.7, 1))


# ------------------------------------------------------------------ pared derecha: pizarra, frascos del bestiario, estante
def draw_board(ctx, c):
    bx0, bx1, by0, by1 = 580, 710, 46, 124
    box(c, bx0, by0, bx1, by1, 'wood', 3.8)
    c.rect(bx0 + 4, by0 + 4, bx1 - 4, by1 - 4, 'green', 1.4)
    r = det('chalk')
    for _ in range(60):
        sx, sy = r.randint(bx0 + 6, bx1 - 22), r.randint(by0 + 6, by1 - 8)
        c.rect(sx, sy, sx + r.randint(3, 14), sy + 1, 'green', 2.0)
    c.rect(bx0 + 4, by1, bx1 - 4, by1 + 4, 'wood', 4.6); c.rect(bx0 + 4, by1, bx1 - 4, by1 + 1, 'wood', 6.4)
    c.rect(bx0 + 10, by1 - 2, bx0 + 17, by1, 'paper', 5.8); c.rect(bx0 + 22, by1 - 3, bx0 + 33, by1, 'wax', 3)
    micro(c, 590, 52, 'AMINAS', 'paper', 5.8, 1)
    hx, hy, hr = 612, 84, 14                                                           # anillo bencénico con NH2
    pts = [(hx + hr * math.cos(math.radians(60 * k - 30)), hy + hr * math.sin(math.radians(60 * k - 30))) for k in range(6)]
    for k in range(6):
        c.line(*pts[k], *pts[(k + 1) % 6], 'paper', 5.4)
    for k in (0, 2, 4):
        a, b = pts[k], pts[(k + 1) % 6]
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        c.line(a[0] + (hx - a[0]) * 0.22, a[1] + (hy - a[1]) * 0.22, b[0] + (hx - b[0]) * 0.22, b[1] + (hy - b[1]) * 0.22, 'paper', 4.4)
    c.line(*pts[0], pts[0][0] + 10, pts[0][1] - 5, 'paper', 5.4)
    micro(c, int(pts[0][0]) + 12, int(pts[0][1]) - 12, 'NH2', 'paper', 6, 1)
    if ctx.p >= 1:
        x = micro(c, 590, 108, 'RNH2+H+', 'paper', 5.6, 1)
        c.line(x + 1, 110, x + 11, 110, 'paper', 5.6); c.line(x + 8, 108, x + 11, 110, 'paper', 5.6); c.line(x + 8, 112, x + 11, 110, 'paper', 5.6)
        micro(c, x + 14, 108, 'RNH3+', 'paper', 5.6, 1)
    if ctx.p >= 2:                                                     # tabla de pKaH (aprendida) y estrella dorada
        for i, s_ in enumerate(['pKa 10.6', 'pKa 9.2', 'pKa 4.6']):
            micro(c, 664, 70 + i * 9, s_, 'wax', 5.0, 1)
        c.sprite(694, 54, ["..x..", "..x..", "xxxxx", ".xxx.", "xx.xx"], 'rune', {'x': 5.2})
        for ci in range(3):
            c.line(656, 72 + ci * 9, 657, 74 + ci * 9, 'sprout', 7); c.line(657, 74 + ci * 9, 660, 70 + ci * 9, 'sprout', 7)


def draw_jars(ctx, c):
    x0, x1, y_sh = 576, 714, 144
    c.rect(x0, y_sh, x1, y_sh + 6, 'wood', 4.4); c.rect(x0, y_sh, x1, y_sh + 2, 'wood', 6.4); c.rect(x0, y_sh + 5, x1, y_sh + 6, 'wood', 1.6)
    for bx in (x0 + 4, x1 - 8):
        c.sprite(bx, y_sh + 6, ["xxxx", "xxx.", "xx..", "x..."], 'wood', {'x': 3.2})
    loose = {0: [0], 1: [5], 2: []}[ctx.p]
    cols = [('red', 4.4), ('lav', 4.6), ('blue', 4.8), ('green', 4.8), ('clay', 4.8), ('arcane', 5)]
    for i in range(6):
        x, yb = 584 + i * 21, y_sh
        h = 26
        c.rect(x, yb - h, x + 18, yb, 'glass', 2.4)
        c.rect(x, yb - h, x + 1, yb, 'glass', 4.8); c.rect(x + 17, yb - h, x + 18, yb, 'glass', 1.4)
        c.rect(x, yb - h, x + 18, yb - h + 1, 'glass', 5.0)
        c.rect(x + 2, yb - h - 4, x + 16, yb - h, 'wood', 4.2); c.rect(x + 2, yb - h - 4, x + 16, yb - h - 3, 'wood', 6.2)
        c.rect(x + 3, yb - h + 2, x + 4, yb - 4, 'glass', 6.6)
        col, lvb = cols[i]
        if i in loose:
            c.sprite(x + 5, yb - 11, CREATURE, 'red', {'o': 3, 'x': 4.6, 'e': ('ink', 0)})
            c.rect(x + 8, yb - 22, x + 10, yb - 17, 'red', 5); c.rect(x + 8, yb - 15, x + 10, yb - 14, 'red', 5)
            ctx.glows.append((x + 9, yb - 12, 9, '#d87052', 0.22, 1))
        elif present(ctx, 'jar', i):
            c.sprite(x + 5, yb - 11, CREATURE_B if i % 2 else CREATURE, col, {'o': lvb - 1.6, 'x': lvb, 'e': ('ink', 0), 'w': ('paper', 4.6)})
            c.lock[yb - 11:yb - 4, x + 5:x + 12] = True
            ctx.glows.append((x + 9, yb - 9, 11, '#b88cf4' if col in ('lav', 'arcane') else '#5cc4dc', 0.34, 1))
            ctx.lights.append((x + 9, yb - 9, 20, 0.35, 1))
        else:
            for mx in range(x + 4, x + 14, 3):
                c.px(mx, yb - 5 - (mx % 5), 'glass', 3.6)
        c.rect(x + 4, yb - 18 if False else yb - 20, x + 14, yb - 17, 'paper', 4.6)
    # estante de abajo: reactivos, mortero y balanza
    y2 = 192
    c.rect(x0, y2, x1, y2 + 6, 'wood', 4.4); c.rect(x0, y2, x1, y2 + 2, 'wood', 6.4); c.rect(x0, y2 + 5, x1, y2 + 6, 'wood', 1.6)
    for k, (bx, col) in enumerate([(584, 'clay'), (592, 'blue'), (600, 'green'), (608, 'clay')]):
        c.rect(bx, y2 - 22 + (k % 2) * 3, bx + 7, y2, col, 3.4); c.rect(bx, y2 - 22 + (k % 2) * 3, bx + 1, y2, col, 5)
        c.rect(bx + 2, y2 - 25 + (k % 2) * 3, bx + 5, y2 - 22 + (k % 2) * 3, 'wood', 4)
        c.rect(bx + 1, y2 - 14, bx + 6, y2 - 8, 'paper', 4.6)
    disc(c, 640, y2 - 2, 9, 'stone', lambda d, dx, dy: 4.4 - dx * 0.05 - d, aspect=1.5)                    # mortero
    c.rect(631, y2 - 8, 649, y2 - 6, 'stone', 5.6)
    c.line(646, y2 - 7, 654, y2 - 18, 'wood', 4.8)
    c.rect(668, y2 - 22, 670, y2, 'brass', 4.2); c.rect(660, y2 - 2, 678, y2, 'brass', 3.6)                 # balanza
    c.line(654, y2 - 22, 684, y2 - 22, 'brass', 5)
    for px_ in (656, 682):
        c.line(px_, y2 - 22, px_ - 3, y2 - 11, 'steel', 4); c.line(px_, y2 - 22, px_ + 3, y2 - 11, 'steel', 4)
        c.rect(px_ - 5, y2 - 11, px_ + 6, y2 - 9, 'brass', 4.6)
    candle_fine(ctx, c, 700, y2, 11)
    for dx0 in (x0 + 2, 647):                                                                                # gabinete
        box(c, dx0, y2 + 8, dx0 + 66, FL - 2, 'wood', 2.8)
        c.rect(dx0 + 8, y2 + 12, dx0 + 58, y2 + 13, 'wood', 1.6)
        ball(c, dx0 + 60 if dx0 == x0 + 2 else dx0 + 6, y2 + 22, 2, 'brass', 5.2)


def candle_fine(ctx, c, x, base_y, h):
    c.rect(x, base_y - h, x + 5, base_y, 'wax', 3.6)
    c.rect(x, base_y - h, x + 2, base_y, 'wax', 5.2)
    c.rect(x + 4, base_y - h, x + 5, base_y, 'wax', 2)
    c.px(x + 2, base_y - h - 1, 'ink', 0)
    c.sprite(x + 1, base_y - h - 5, FLAME[0], 'flame', {'h': 2, 'w': 5, 'f': 3})
    ctx.lights.append((x + 2, base_y - h - 4, 44, 1.2, 1))
    ctx.glows.append((x + 2, base_y - h - 4, 12, '#ffb440', 0.6, 1))


# ------------------------------------------------------------------ lo que cuelga del techo
def lantern(ctx, c, x, y, lit):
    c.line(x, 16, x, y, 'steel', 2.6)
    c.rect(x - 8, y, x + 9, y + 3, 'brass', 3.8); c.rect(x - 8, y, x + 9, y + 1, 'brass', 5.8)
    for k in range(5):
        c.rect(x - 7 + k, y + 3 + k, x + 8 - k, y + 4 + k, 'brass', 3.4)
    c.rect(x - 7, y + 8, x + 8, y + 28, 'glow' if lit else 'glass', 4.4 if lit else 1.6)
    if lit:
        c.lock[y + 8:y + 28, x - 7:x + 8] = True
        c.sprite(x - 1, y + 14, FLAME[1], 'flame', {'h': 2, 'w': 5, 'f': 3})
        ctx.lights.append((x, y + 18, 100, 1.7, 1))
        ctx.glows.append((x, y + 18, 34, '#ffb440', 0.9, 1))
    for bx in (x - 7, x - 3, x + 1, x + 5):
        c.rect(bx, y + 8, bx + 1, y + 28, 'brass', 3.0)
    c.rect(x - 8, y + 27, x + 9, y + 31, 'brass', 3.4); c.rect(x - 8, y + 27, x + 9, y + 28, 'brass', 5.4)
    c.rect(x - 2, y + 31, x + 3, y + 34, 'brass', 2.6)


def hanging_herbs(ctx, c):
    r = det('herbs')
    for x, ln in ((196, 22), (238, 18), (426, 14), (592, 20), (670, 16)):
        c.line(x, 16, x, 22, 'stem', 3)
        c.rect(x - 2, 22, x + 3, 25, 'wax', 3.6)
        for k in range(5):
            sx = x - 3 + k * 1.5
            c.line(sx, 25, sx + r.choice([-1, 0, 1]), 25 + ln, 'stem', 3)
        for k in range(ln // 3):
            leaf(c, x + r.choice([-4, -2, 2, 4]), 27 + k * 3, r.choice([LEAF_A, LEAF_B, LEAF_C]), 5 - (k % 2) * 1, r.choice(['leaf', 'sprout', 'lav']))


def string_lights(ctx, c):
    if ctx.p == 0:
        return
    r = det('string')
    for x in range(0, 720):
        y = 18 + 4.5 * math.sin(x * 0.034) ** 2
        c.px(x, y, 'stem', 2)
    for i, x in enumerate(range(8, 720, 17)):
        if rank('bulb', i) < (0.5 if ctx.p == 1 else 1.0):
            y = int(18 + 4.5 * math.sin(x * 0.034) ** 2)
            col = ['crystal', 'rune', 'arcane', 'flame'][i % 4]
            c.sprite(x - 1, y + 1, ["xx", "xx", ".x"], col, {'x': 5.4})
            c.lock[y + 1:y + 4, x - 1:x + 1] = True
            ctx.glows.append((x, y + 3, 7, {'crystal': '#5cc4dc', 'rune': '#ffd860', 'arcane': '#b88cf4', 'flame': '#ffb440'}[col], 0.45, 1))


def base_mushrooms(ctx, c):
    for i, (x, h, cw) in enumerate([(250, 8, 5), (262, 12, 7), (276, 6, 4), (352, 9, 5), (366, 6, 4), (380, 13, 8), (396, 7, 4),
                                    (172, 6, 4), (232, 7, 4), (16, 8, 5), (30, 5, 3), (708, 10, 6), (700, 6, 4)]):
        mushroom(ctx, c, x, FL - 1, h, cw, i)


# ------------------------------------------------------------------ armado de la capa lejana
def draw_far(ctx):
    c = Canvas(FW, FH)
    c.dither = {'wall': 0.4, 'stone': 0.5, 'wood': 0.5}
    plaster(c, 0, 0, FW, 150)
    stone_wall(c, 0, 150, FW, FL, base=2.5, mossy=0.7)
    c.lvl[150:156, :] -= 0.0
    c.rect(0, 148, FW, 152, 'wood', 3.2); c.rect(0, 148, FW, 149, 'wood', 5.2); c.rect(0, 151, FW, 152, 'wood', 1.6)     # moldura entre yeso y piedra
    # viga del techo
    c.rect(0, 0, FW, 16, 'wood', 3.0)
    c.rect(0, 0, FW, 2, 'wood', 5.4); c.rect(0, 2, FW, 3, 'wood', 4.2); c.rect(0, 13, FW, 15, 'wood', 1.4); c.rect(0, 15, FW, 16, 'ink', 0)
    r = det('beam')
    for x in range(0, FW, 2):
        if (x * 7) % 23 < 10:
            c.rect(x, 5 + (x // 13) % 3 * 2, x + 2, 6 + (x // 13) % 3 * 2, 'wood', 2.0)
    for kx in (60, 300, 520, 650):
        c.sprite(kx, 5, [".oo.", "oxxo", ".oo."], 'wood', {'o': 1.4, 'x': 0.6})
    for (a, b) in ((156, 166), (566, 576), (708, 718)):
        timber_post(c, a, b, 16, FL, seed=a)
    inside, lit = draw_window(ctx, c)
    hole = lit | (inside & (c.mat != c.mid('wood')))                    # vidrio de la ventana (deja ver la capa de la vista)
    snap_m, snap_l = c.mat.copy(), c.lvl.copy()
    draw_poster_and_scope(ctx, c)
    draw_bookshelf(ctx, c)
    draw_trough(ctx, c)
    draw_hood(ctx, c)
    draw_board(ctx, c)
    draw_jars(ctx, c)
    base_mushrooms(ctx, c)
    window_ivy(ctx, c)
    hanging_herbs(ctx, c)
    string_lights(ctx, c)
    for i, lx in enumerate((412, 196, 640)):
        lantern(ctx, c, lx, 16 + (i % 2) * 2, i < [1, 2, 3][ctx.p])
    c.window_hole = hole & (c.mat == snap_m) & (c.lvl == snap_l)        # lo que sigue siendo vista al final
    return c, inside, lit
