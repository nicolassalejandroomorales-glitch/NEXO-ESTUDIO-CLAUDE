"""Letreros de piedra tallada que se encienden (tráiler de Nexo).
Losa de piedra del sótano con bisel, grietas y musgo; letras grabadas (5x7 con tildes y Ñ; las grandes se tallan con más detalle) que se iluminan de izquierda a derecha."""
import math
from functools import lru_cache

import numpy as np
from PIL import Image, ImageChops, ImageFilter


def hexes(*cs):
    return [tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) for c in cs]


BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], np.float32) / 16.0 - 0.47
STONE = hexes('#06080e', '#0c101a', '#141a28', '#1e2637', '#2b364f', '#3d4a68', '#566784', '#7587a6')
MOSS = hexes('#101e22', '#18302c', '#244636', '#346040')
# luz de las letras por escena (oscuro → claro)
LUZ = {
    'cristal': hexes('#123448', '#18506a', '#1e7090', '#3098b8', '#5cc4dc', '#9ce8f0', '#e0fcff'),
    'oro': hexes('#6a4a14', '#a87a1c', '#e0b030', '#ffd860', '#fff0a8', '#fffce8', '#ffffff'),
    'verde': hexes('#22361a', '#365222', '#52722a', '#76943a', '#b6f070', '#e2ffb0', '#fbffe8'),
    'violeta': hexes('#2c1a4c', '#46287a', '#6a3cb0', '#9060dc', '#b88cf4', '#dcc0ff', '#f6ecff'),
    'fuego': hexes('#64202a', '#a83818', '#dc6420', '#f89a30', '#ffc850', '#ffe890', '#fffce8'),
    'hueso': hexes('#4e4034', '#7a6650', '#a69070', '#cab692', '#e6d6b2', '#fff4d8', '#ffffff'),
}

GLYPHS = {
    'A': '.###.|#...#|#...#|#####|#...#|#...#|#...#', 'B': '####.|#...#|#...#|####.|#...#|#...#|####.',
    'C': '.###.|#...#|#....|#....|#....|#...#|.###.', 'D': '####.|#...#|#...#|#...#|#...#|#...#|####.',
    'E': '#####|#....|#....|####.|#....|#....|#####', 'F': '#####|#....|#....|####.|#....|#....|#....',
    'G': '.###.|#...#|#....|#.###|#...#|#...#|.####', 'H': '#...#|#...#|#...#|#####|#...#|#...#|#...#',
    'I': '#####|..#..|..#..|..#..|..#..|..#..|#####', 'J': '..###|...#.|...#.|...#.|#..#.|#..#.|.##..',
    'K': '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', 'L': '#....|#....|#....|#....|#....|#....|#####',
    'M': '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', 'N': '#...#|##..#|##..#|#.#.#|#..##|#..##|#...#',
    'O': '.###.|#...#|#...#|#...#|#...#|#...#|.###.', 'P': '####.|#...#|#...#|####.|#....|#....|#....',
    'Q': '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', 'R': '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
    'S': '.####|#....|#....|.###.|....#|....#|####.', 'T': '#####|..#..|..#..|..#..|..#..|..#..|..#..',
    'U': '#...#|#...#|#...#|#...#|#...#|#...#|.###.', 'V': '#...#|#...#|#...#|#...#|.#.#.|.#.#.|..#..',
    'W': '#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#', 'X': '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
    'Y': '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', 'Z': '#####|....#|...#.|..#..|.#...|#....|#####',
    '0': '.###.|#..##|#.#.#|#.#.#|#.#.#|##..#|.###.', '1': '..#..|.##..|#.#..|..#..|..#..|..#..|#####',
    '2': '.###.|#...#|....#|..##.|.#...|#....|#####', '3': '####.|....#|....#|.###.|....#|....#|####.',
    '4': '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', '5': '#####|#....|####.|....#|....#|#...#|.###.',
    '6': '.###.|#....|#....|####.|#...#|#...#|.###.', '7': '#####|....#|...#.|..#..|.#...|.#...|.#...',
    '8': '.###.|#...#|#...#|.###.|#...#|#...#|.###.', '9': '.###.|#...#|#...#|.####|....#|....#|.###.',
    '.': '.|.|.|.|.|.|#', ',': '..|..|..|..|..|.#|#.', ':': '.|.|#|.|.|#|.', '·': '.|.|.|#|.|.|.',
    '+': '.....|..#..|..#..|#####|..#..|..#..|.....', '!': '#|#|#|#|#|.|#', '¡': '#|.|#|#|#|#|#', '-': '...|...|...|###|...|...|...',
    '?': '.###.|#...#|....#|...#.|..#..|.....|..#..', '¿': '..#..|.....|..#..|.#...|#....|#...#|.###.',
    ' ': '..|..|..|..|..|..|..',
}
MARKS = {'acute': ['...#.', '..#..'], 'tilde': ['.##.#', '#.##.']}
ACCENTED = {'Á': ('A', 'acute'), 'É': ('E', 'acute'), 'Í': ('I', 'acute'), 'Ó': ('O', 'acute'), 'Ú': ('U', 'acute'), 'Ñ': ('N', 'tilde')}


def glyph(ch):
    base, mark = ACCENTED.get(ch, (ch, None))
    rows = GLYPHS[base].split('|')
    rows = (MARKS[mark] if mark else ['.' * len(rows[0])] * 2) + rows
    return np.array([[c == '#' for c in r] for r in rows])


def line_mask(line):
    parts = []
    for i, ch in enumerate(line):
        if i:
            parts.append(np.zeros((9, 1), bool))
        parts.append(glyph(ch))
    m = np.concatenate(parts, axis=1)
    return m if m[:2].any() else m[2:]


def hash2(x, y, s=0):
    v = np.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453
    return v - np.floor(v)


P = 6                                            # píxeles de pantalla por píxel de arte (igual que el sótano)


@lru_cache(maxsize=None)
def layout(lines, k=1):
    """k = grosor del trazo en píxeles de arte: las letras grandes se tallan con más detalle, no con píxeles más gordos."""
    masks = [np.kron(line_mask(l), np.ones((k, k), bool)) for l in lines]
    pad, gap = (4 + 2 * k, 3 + 2 * k), 2 * k + 1
    tw = max(m.shape[1] for m in masks)
    th = sum(m.shape[0] for m in masks) + gap * (len(masks) - 1)
    w, h = tw + 2 * pad[0], th + 2 * pad[1]
    letters = np.zeros((h, w), bool)
    ty = np.zeros((h, w), np.float32)                # altura relativa dentro de cada línea (0 arriba, 1 abajo)
    y = pad[1]
    for m in masks:
        x = pad[0] + (tw - m.shape[1]) // 2
        letters[y:y + m.shape[0], x:x + m.shape[1]] = m
        ty[y:y + m.shape[0]] = np.linspace(0, 1, m.shape[0])[:, None]
        y += m.shape[0] + gap
    seed = sum(map(ord, ''.join(lines)))
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # forma de la losa: esquinas cortadas y borde de abajo un poco irregular
    shape = np.ones((h, w), bool)
    for (cx, cy) in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        shape &= (np.abs(xx - cx) + np.abs(yy - cy)) > 2
    shape[h - 1] &= hash2(xx[h - 1], 3, seed) > 0.3
    # piedra: base con textura, bisel (luz arriba-izquierda), grietas
    lvl = 3.2 + (hash2(np.floor(xx / 3), np.floor(yy / 2), seed) - 0.5) * 0.9 + BAYER[yy.astype(int) % 4, xx.astype(int) % 4] * 0.5
    lvl[1, :] += 1.5
    lvl[2, :] += 0.7
    lvl[:, 1] += 1.0
    lvl[h - 2, :] -= 1.2
    lvl[:, w - 2] -= 0.8
    lvl[0, :] = 5.6
    lvl[:, 0] = np.minimum(lvl[:, 0], 4.5)
    lvl[h - 1, :] = 0.6
    lvl[:, w - 1] = 0.8
    rng = np.random.default_rng(seed)
    for _ in range(max(2, w // 30)):
        x, y = int(rng.integers(2, w - 2)), int(rng.choice([1, h - 2]))
        for _ in range(int(rng.integers(3, 7))):
            if 0 < x < w - 1 and 0 < y < h - 1 and not letters[y, x]:
                lvl[y, x] = 1.0
            x += int(rng.integers(-1, 2))
            y += 1 if y < h / 2 else -1
    # talla: sombra arriba de cada letra y labio de luz abajo
    up = np.zeros_like(letters)
    up[:-1] = letters[1:]
    down = np.zeros_like(letters)
    down[1:] = letters[:-1]
    lvl[up & ~letters] = 1.2
    lvl[down & ~letters] = 5.4
    stone = np.array(STONE, np.uint8)[np.clip(np.floor(lvl + 0.5), 0, len(STONE) - 1).astype(int)]
    moss = (yy > h - 4) & ((xx < 7) | (xx > w - 8)) & (hash2(xx, yy, seed + 1) > 0.45) & shape & ~letters
    stone[moss] = np.array(MOSS, np.uint8)[(hash2(xx, yy, seed + 2)[moss] * 4).astype(int)]
    # nivel de luz dentro de cada trazo: borde de arriba en sombra (surco), centro encendido, borde de abajo más claro
    core = np.where(ty < 0.5, 5, 4).astype(np.int8) if k >= 2 else np.full(letters.shape, 5, np.int8)
    above = np.zeros_like(letters)
    above[1:] = letters[:-1]
    above2 = np.zeros_like(letters)
    above2[2:] = letters[:-2]
    below = np.zeros_like(letters)
    below[:-1] = letters[1:]
    core[letters & ~above] = 3 if k == 1 else 2
    if k >= 3:
        core[letters & above & ~above2] = 4
    if k >= 2:
        core[letters & above & ~below] = 6
    return letters, core, stone, shape, xx


@lru_cache(maxsize=None)
def sign_art(lines, luz, step, k, steps=20):
    """Losa a tamaño de arte con las letras encendidas hasta `step`/steps (barrido de izquierda a derecha)."""
    letters, core, stone, shape, xx = layout(lines, k)
    h, w = letters.shape
    ramp = np.array(LUZ[luz], np.uint8)
    s = step / steps * 1.25
    lit = np.clip((s * w - xx) / 6.0, 0, 1)
    yy = np.mgrid[0:h, 0:w][0]
    lit_q = np.clip(np.floor(lit * 4 + (BAYER[yy % 4, xx.astype(int) % 4] + 0.47) * 0.9) / 4, 0, 1)
    rgb = stone.copy()
    dark = np.array(STONE[0], np.float32)
    on = ramp[core].astype(np.float32)
    col = dark + (on - dark) * lit_q[..., None]
    rgb[letters] = col[letters].astype(np.uint8)
    a = np.where(shape, 255, 0).astype(np.uint8)
    img = Image.fromarray(np.dstack([rgb, a]), 'RGBA')
    glow = np.zeros((h, w, 3), np.float32)
    glow[letters] = np.array(LUZ[luz][4], np.float32) * lit_q[letters][:, None]
    return img, Image.fromarray(glow.astype(np.uint8), 'RGB')


@lru_cache(maxsize=None)
def sign_scaled(lines, luz, step, k):
    p = P
    img, glow = sign_art(lines, luz, step, k)
    big = img.resize((img.width * p, img.height * p), Image.NEAREST)
    pad = p * 10
    g = Image.new('RGB', (big.width + 2 * pad, big.height + 2 * pad))
    g.paste(glow.resize(big.size, Image.NEAREST), (pad, pad))
    bloom = ImageChops.add(g.filter(ImageFilter.GaussianBlur(p * (1 + k))), g.filter(ImageFilter.GaussianBlur(p * (4 + 2 * k))))
    return big, bloom, pad


def fit(lines, maxw=1000, maxk=4):
    """Grosor más grande que cabe en maxw píxeles de pantalla."""
    for k in range(maxk, 1, -1):
        if layout(tuple(lines), k)[0].shape[1] * P <= maxw:
            return k
    return 1


def ignite_step(t, t0, dur, steps=20):
    return int(min(steps, max(0, (t - t0) / dur * steps)))
