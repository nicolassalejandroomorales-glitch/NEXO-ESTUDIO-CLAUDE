"""Convierte los PDF de cátedra de una clase en imágenes para la pizarra del aula.

Uso:  python tools/classroom-art/slides.py org-01 ARCHIVO.pdf [OTRO.pdf ...]
Con varios PDF se pegan en orden y las diapositivas se numeran seguidas.
Escribe:
  - dist/assets/classes/<clase>/slides/NN.webp  (una por diapositiva, 1280 px de ancho)
  - dist/classes/slides/<clase>.js              (lista de imágenes; el aula la carga sola si existe)
  - art-source/slides-text/<clase>.txt          (texto de cada diapositiva, para escribir la clase; no se sube a Git)
Necesita PyMuPDF (pip install pymupdf) y ffmpeg.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[2]


def main(class_id, pdfs):
    out = ROOT / 'dist' / 'assets' / 'classes' / class_id / 'slides'
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob('*.webp'):
        old.unlink()
    texts = []
    images = {}
    n = 0
    with tempfile.TemporaryDirectory() as tmp:
        for pdf in pdfs:
            doc = pymupdf.open(pdf)
            for page in doc:
                n += 1
                png = Path(tmp) / f'p{n}.png'
                page.get_pixmap(matrix=pymupdf.Matrix(1.6, 1.6)).save(png)
                dest = out / f'{n:02d}.webp'
                subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(png), '-vf', 'scale=1280:-2', '-q:v', '82', str(dest)], check=True)
                images[n] = f'assets/classes/{class_id}/slides/{n:02d}.webp'
                texts.append(f'=== {n} ({Path(pdf).name} p.{page.number + 1}) ===\n{page.get_text().strip()}\n')
    js_dir = ROOT / 'dist' / 'classes' / 'slides'
    js_dir.mkdir(parents=True, exist_ok=True)
    (js_dir / f'{class_id}.js').write_text(
        '/* Generado por tools/classroom-art/slides.py: no editar a mano. */\n'
        'window.NexoClassSlides = window.NexoClassSlides || {};\n'
        f'window.NexoClassSlides[{json.dumps(class_id)}] = {json.dumps(images, indent=2)};\n')
    text_dir = ROOT / 'art-source' / 'slides-text'
    text_dir.mkdir(parents=True, exist_ok=True)
    (text_dir / f'{class_id}.txt').write_text('\n'.join(texts), encoding='utf-8')
    print(f'{class_id}: {n} diapositivas convertidas.')


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2:])
