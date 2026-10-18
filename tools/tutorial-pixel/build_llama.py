"""Llama de las velas del altar del Grimorio (pixel art, rampa 'flame' del refugio).

Salida: dist/assets/tutorial/llama.png  4 cuadros de 3x8 px (derecha a izquierda del parpadeo), fondo transparente, se muestra x4.
La vela del Grimorio (build_grimorio.py) solo dibuja la mecha; tutorial.css coloca y anima estas llamas.
Uso:  python tools/tutorial-pixel/build_llama.py
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools' / 'home-pixel'))
from pixel import Canvas  # noqa: E402

LEVELS = {'a': 1, 'b': 2, 'c': 3, 'd': 5}
FRAMES = [
    ['.a.', '.b.', '.b.', 'bcb', 'bcb', 'cdc', 'cdc', '.b.'],   # recta y alta
    ['a..', 'ab.', '.b.', 'bcb', 'bcb', 'cdc', 'cdc', '.b.'],   # inclinada a la izquierda
    ['.a.', '.a.', '.b.', '.b.', 'bcb', 'bdb', 'cdc', '.b.'],   # alta y fina
    ['..a', '.ba', '.b.', 'bcb', 'bcb', 'cdc', 'cdc', '.b.'],   # inclinada a la derecha
]


def main():
    c = Canvas(3 * len(FRAMES), 8)
    for i, rows in enumerate(FRAMES):
        for y, row in enumerate(rows):
            for x, ch in enumerate(row):
                if ch != '.':
                    c.px(i * 3 + x, y, 'flame', LEVELS[ch])
    rgb = np.array(c.render(scale=1))[..., :3]
    alpha = np.where(c.mat != 0, 255, 0).astype(np.uint8)
    out = ROOT / 'dist' / 'assets' / 'tutorial' / 'llama.png'
    Image.fromarray(np.dstack([rgb, alpha]), 'RGBA').save(out)
    print('ok', out.name)


if __name__ == '__main__':
    main()
