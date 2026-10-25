"""Boceto del Vestíbulo del ramo (25 oct 2026): la cripta circular de la Cámara, SIN sauce, con tres arcos
que llevan al Aula (al frente), al Taller (derecha) y a la Arena (izquierda). Las veladas de la PEP 2 quedan atrás
y el portal de llegada detrás. Usa el motor de build_camara.py.

    python tools/salas-sotano/vestibulo.py           -> docs/salas-sotano/vestibulo.gif (~4 min; no se sube)
    python tools/salas-sotano/vestibulo.py cuadros   -> docs/salas-sotano/vestibulo-cuadros.png
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), 'aprender-pasillo'))
import build_sotano as bs  # noqa: E402
import build_camara as bc  # noqa: E402
from PIL import Image  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'docs', 'salas-sotano')

# sin sauce: ni tronco ni ramas
bc.draw_trunk = lambda *a, **k: None
bc.draw_ramas = lambda *a, **k: None

# los tres arcos (los murales reutilizan los de la Cámara mientras no haya murales propios de cada sala)
cfg = bc.RAMOS['organica']
aminas, aroma, hetero = cfg['temas']
cfg['temas'] = [
    dict(aminas, lines=['AULA'], hoy=True),
    dict(aroma, lines=['TALLER'], hoy=False),
    dict(hetero, lines=['ARENA'], hoy=False, jars=[]),
]
bc.set_ramo('organica')


def ease(u):
    u = min(max(u, 0.0), 1.0)
    return u * u * (3 - 2 * u)


def recorrido():
    """(x, z, giro, balanceo, inclinación, remolino, destello): sale del portal, camina al centro y mira los tres arcos."""
    seq = []
    z0 = -(bc.R + 0.35)
    for i in range(9):
        u = ease(i / 8)
        seq.append((0, z0 + 0.35 * u, 0, 0, 0.16, 1 - u, 0.45 * (1 - u)))
    zs = z0 + 0.35
    for i in range(1, 19):
        u = ease(i / 18)
        seq.append((0, zs + (0 - zs) * u, 0, 1.4 * abs(math.sin(math.pi * 2 * i / 18)), 0.16 - 0.04 * u, 0, 0))
    seq += [(0, 0, 0, 0, 0.12, 0, 0)] * 10
    for a0, a1, n in ((0, 60, 14), (60, -60, 24), (-60, 0, 14)):
        for i in range(1, n + 1):
            p = math.radians(a0 + (a1 - a0) * ease(i / n))
            seq.append((0, 0, p, 0, 0.12, 0, 0))
        seq += [(0, 0, math.radians(a1), 0, 0.12, 0, 0)] * 10
    return seq


def render(seq, scale=3):
    frames = []
    for i, (x, z, yaw, bob, pitch, sw, fl) in enumerate(seq):
        bs.set_cam(x, z, yaw, bob + 0.5 * math.sin(i * 0.4), pitch, i * 0.45)
        frames.append(bc.build(sw, fl, scale))
        print(i + 1, '/', len(seq), flush=True)
    return frames


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    seq = recorrido()
    if len(sys.argv) > 1 and sys.argv[1] == 'cuadros':
        keys = [12, 36, 55, 90]
        imgs = render([seq[k] for k in keys])
        w, h = imgs[0].size
        sheet = Image.new('RGB', (w * 2, h * 2))
        for k, im in enumerate(imgs):
            sheet.paste(im.convert('RGB'), ((k % 2) * w, (k // 2) * h))
        sheet.save(os.path.join(OUT, 'vestibulo-cuadros.png'))
        imgs[1].convert('RGB').save(os.path.join(OUT, 'vestibulo.png'))
    else:
        frames = [f.convert('RGB') for f in render(seq)]
        frames[0].save(os.path.join(OUT, 'vestibulo.gif'), save_all=True, append_images=frames[1:], duration=90, loop=0)
