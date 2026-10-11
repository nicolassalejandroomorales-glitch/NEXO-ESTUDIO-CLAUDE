"""Motor chico de pixel art para el refugio de Nexo.

Idea (como lo hace un pixel artist):
  - Cada píxel guarda un MATERIAL (madera, yeso, hoja, latón...) y un NIVEL dentro de su rampa de colores.
  - Las rampas tienen cambio de tono: sombras frías/moradas, luces cálidas/amarillas.
  - La luz NO mezcla colores: sube o baja escalones dentro de la rampa. Así la paleta queda corta y limpia.
  - Superficies grandes (pared, cielo, madera) usan dithering Bayer en los bordes de la luz;
    los objetos chicos (hojas, libros, latón) se quedan nítidos, sin dithering.
"""
import numpy as np
from PIL import Image


def hexes(*cs):
    return [tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) for c in cs]


# Rampas: de oscuro a claro. Índice 0 = el más oscuro.
RAMPS = {
    'void':   hexes('#140c10'),
    'wall':   hexes('#2b1d22', '#45302c', '#6b4a3a', '#8f6a4c', '#b48c62', '#d4ae7c', '#ecd29c', '#fff0c4'),
    'stone':  hexes('#231b22', '#3a2f33', '#564641', '#776152', '#9a8068', '#bea282', '#e0c69c'),
    'wood':   hexes('#1a0f13', '#2c1916', '#47281b', '#673c23', '#8a552e', '#b0743d', '#d29a55', '#f0c378', '#ffe2a0'),
    'leaf':   hexes('#0c1716', '#13261d', '#1c3a23', '#2a5228', '#3f6e2d', '#5d8c36', '#83ad42', '#b2cf5c', '#e2ee8a', '#fffbc0'),
    'stem':   hexes('#1a1a14', '#2e2c18', '#4a4420', '#6a6028', '#8e8236'),
    'sky':    hexes('#4664aa', '#5880c4', '#719dd8', '#90b8e6', '#b2d0f0', '#d6e6f4', '#f4f2e2', '#fff8d4'),
    'cloud':  hexes('#8c98c0', '#b2bcd8', '#d6dcec', '#f2f4f8', '#ffffff'),
    'hill':   hexes('#34506a', '#43666e', '#557e74', '#6c9a7a', '#8ab688', '#b0d29a'),
    'tree':   hexes('#1e3a44', '#2a4e4a', '#38664e', '#4c8052', '#689c58', '#8cba62'),
    'brass':  hexes('#2e1a0e', '#5a3616', '#8a5c20', '#ba8a30', '#e2b850', '#fbe08a', '#fff6c8'),
    'flame':  hexes('#a83818', '#dc6420', '#f89a30', '#ffc850', '#ffe890', '#fffce8'),
    'glow':   hexes('#5a2c18', '#8c4a20', '#c07430', '#e8a448', '#ffd270', '#fff0b0'),
    'clay':   hexes('#2e1614', '#552820', '#80402a', '#a85a36', '#cc7a48', '#eaa066'),
    'red':    hexes('#220c14', '#3e141e', '#64202a', '#8c3234', '#b44c40', '#d87052'),
    'green':  hexes('#0c1c1e', '#14302c', '#20483a', '#30644a', '#4c845a', '#70a46a'),
    'blue':   hexes('#10162c', '#1a2644', '#263a62', '#385480', '#5072a0', '#7494bc'),
    'paper':  hexes('#4e4034', '#7a6650', '#a69070', '#cab692', '#e6d6b2', '#fff4d8'),
    'petal':  hexes('#5a5878', '#9894b4', '#d0cce0', '#f4f2f8', '#ffffff'),
    'glass':  hexes('#1c2c2c', '#2c4440', '#40605a', '#5c8478', '#86aa98', '#bcd6c0', '#eef8e8'),
    # hojas nuevas (más amarillas) y hojas en sombra (más azuladas), para que la hiedra no sea de un solo verde
    'sprout': hexes('#14200e', '#22361a', '#365222', '#52722a', '#76943a', '#9cb84a', '#c6d862', '#eef09a', '#fffcd0'),
    'shade':  hexes('#0a1218', '#101e22', '#18302c', '#244636', '#346040', '#4c7c4c', '#6a9a5c', '#94bc72', '#c4dc94'),
    # magia: violeta arcano, cian de cristal y oro de runa (brillan solos)
    'arcane': hexes('#1a1030', '#2c1a4c', '#46287a', '#6a3cb0', '#9060dc', '#b88cf4', '#dcc0ff', '#f6ecff'),
    'crystal':hexes('#0c1e2c', '#123448', '#18506a', '#1e7090', '#3098b8', '#5cc4dc', '#9ce8f0', '#e0fcff'),
    'rune':   hexes('#3a2a10', '#6a4a14', '#a87a1c', '#e0b030', '#ffd860', '#fff0a8', '#fffce8'),
    'lav':    hexes('#24162c', '#3c2448', '#583668', '#7a4c8a', '#9c6aaa', '#c094c8'),
    'wax':    hexes('#5a4a3a', '#8a7660', '#bca88a', '#e0d0b0', '#f6ecd4', '#fffaf0'),
}

# Cuánto sube cada material con la luz (el cielo y la llama brillan por sí solos).
LIGHT_GAIN = {'void': 0, 'sky': 0, 'cloud': 0, 'flame': 0, 'hill': 0, 'tree': 0, 'glow': 0.25,
              'arcane': 0.15, 'crystal': 0.15, 'rune': 0.1, 'sprout': 0.75, 'shade': 0.7, 'lav': 0.7,
              'leaf': 0.75, 'brass': 0.8, 'paper': 0.8, 'petal': 0.5, 'glass': 0.6}
# Superficies grandes con dithering suave; el resto, nítido.
DITHERED = {'wall', 'stone', 'wood'}

BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], np.float32) / 16.0 - 0.47


class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.names = list(RAMPS)
        self.mat = np.zeros((h, w), np.int16)        # 0 = void
        self.lvl = np.zeros((h, w), np.float32)
        self.light = np.zeros((h, w), np.float32)    # escalones extra de luz
        self.lock = np.zeros((h, w), bool)           # píxeles que no reciben luz (contornos finales)

    def mid(self, name):
        return self.names.index(name)

    # ---------- primitivas ----------
    def px(self, x, y, mat, lvl):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < self.w and 0 <= y < self.h:
            self.mat[y, x] = self.mid(mat)
            self.lvl[y, x] = lvl

    def rect(self, x0, y0, x1, y1, mat, lvl):
        """Rectángulo [x0,x1) x [y0,y1)."""
        x0, y0 = max(0, int(x0)), max(0, int(y0))
        x1, y1 = min(self.w, int(x1)), min(self.h, int(y1))
        if x1 > x0 and y1 > y0:
            self.mat[y0:y1, x0:x1] = self.mid(mat)
            self.lvl[y0:y1, x0:x1] = lvl

    def mask(self, m, mat, lvl):
        """Pinta donde m es True. lvl puede ser número o arreglo del mismo tamaño."""
        self.mat[m] = self.mid(mat)
        self.lvl[m] = lvl[m] if isinstance(lvl, np.ndarray) else lvl

    def line(self, x0, y0, x1, y1, mat, lvl):
        x0, y0, x1, y1 = int(round(x0)), int(round(y0)), int(round(x1)), int(round(y1))
        dx, dy = abs(x1 - x0), -abs(y1 - y0)
        sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
        err = dx + dy
        while True:
            self.px(x0, y0, mat, lvl)
            if x0 == x1 and y0 == y1:
                break
            e2 = 2 * err
            if e2 >= dy:
                err += dy; x0 += sx
            if e2 <= dx:
                err += dx; y0 += sy

    def sprite(self, x, y, rows, mat, levels, flip=False):
        """rows: lista de strings; cada carácter es una clave de `levels` ('.' = transparente)."""
        for j, row in enumerate(rows):
            if flip:
                row = row[::-1]
            for i, ch in enumerate(row):
                if ch in levels:
                    m, l = levels[ch] if isinstance(levels[ch], tuple) else (mat, levels[ch])
                    self.px(x + i, y + j, m, l)

    def grid(self):
        return np.mgrid[0:self.h, 0:self.w].astype(np.float32)   # (yy, xx)

    def add_light(self, field):
        self.light += field

    # ---------- render ----------
    def render(self, scale=4, post=None):
        """post(arr) recibe el arreglo float (h, w, 3) a tamaño de arte, para sumar halos de color."""
        out = np.zeros((self.h, self.w, 3), np.uint8)
        yy, xx = np.mgrid[0:self.h, 0:self.w]
        bay = BAYER[yy % 4, xx % 4]
        for k, name in enumerate(self.names):
            m = self.mat == k
            if not m.any():
                continue
            ramp = np.array(RAMPS[name], np.uint8)
            gain = LIGHT_GAIN.get(name, 1.0)
            v = self.lvl + np.where(self.lock, 0, self.light * gain)
            if name in DITHERED:
                v = v + bay * getattr(self, 'dither', {}).get(name, 0.8)
            idx = np.clip(np.floor(v + 0.5), 0, len(ramp) - 1).astype(int)
            out[m] = ramp[idx[m]]
        if post is not None:
            f = out.astype(np.float32)
            post(f)
            out = np.clip(f, 0, 255).astype(np.uint8)
        img = Image.fromarray(out, 'RGB')
        return img.resize((self.w * scale, self.h * scale), Image.NEAREST) if scale != 1 else img


def glow(arr, cx, cy, r, color, strength=1.0, rings=4, squash=1.0):
    """Halo de luz de pixel art: anillos de borde duro (no un difuminado), con un poco de dithering entre anillos."""
    h, w, _ = arr.shape
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.hypot(xx - cx, (yy - cy) * squash)
    t = np.clip(1 - d / r, 0, 1)
    step = np.floor(t * rings + (BAYER[yy % 4, xx % 4] + 0.47) * 0.7) / rings
    col = np.array(hexes(color)[0], np.float32) if isinstance(color, str) else np.array(color, np.float32)
    arr += (step * step * strength)[..., None] * col[None, None, :] * 0.55
