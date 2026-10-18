"""Cuadros del Sótano de los Cristales en vertical (180x320 de arte) para el tráiler.
Usa el motor aprobado de tools/aprender-pasillo/build_sotano.py; los cuadros se guardan en caché (carpeta temporal).
Uso directo: python tools/trailer/pasillo.py   (lo llama trailer.py solo si faltan cuadros)"""
import math
import os
import sys
import tempfile
from multiprocessing import Pool

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'aprender-pasillo'))
CACHE = os.path.join(tempfile.gettempdir(), 'nexo-trailer-pasillo')
FPS = 30
AW, AH = 180, 320
ORG = ('M', 0)
ZD = 2.6                      # puerta de Orgánica II (derecha)
D0 = 0.22


def ease(u):
    u = min(1.0, max(0.0, u))
    return u * u * (3 - 2 * u)


def cam_pasos(t):
    """4 pasos cortos con balanceo, mirando de reojo las puertas."""
    k, u = int(t), t - int(t)
    m = ease(u / 0.6)
    z = 0.5 * (k + m)
    bob = 1.6 * math.sin(math.pi * min(1.0, u / 0.6))
    return dict(x=0.0, z=z, yaw=0.16 * math.sin(t * 1.4 - 0.6), bob=bob, pitch=0.03, opens=None, flash=0.0)


def cam_puerta(t):
    """Gira hacia Orgánica II, mira el letrero, se abre el portal y entra."""
    if t < 1.2:
        u = ease(t / 1.2)
        return dict(x=-0.65 * u, z=2.0 + (ZD - 2.0) * u, yaw=math.pi / 2 * u, bob=1.2 * math.sin(math.pi * t / 1.2), pitch=0.03,
                    opens={ORG: D0}, flash=0.0)
    if t < 1.8:
        return dict(x=-0.65, z=ZD, yaw=math.pi / 2, bob=0.0, pitch=0.03 + 0.14 * ease((t - 1.2) / 0.5), opens={ORG: D0}, flash=0.0)
    if t < 3.1:
        u = ease((t - 1.8) / 1.3)
        return dict(x=-0.65, z=ZD, yaw=math.pi / 2, bob=1.4 * math.sin(t * 40) * (1 - u), pitch=0.17 * (1 - u),
                    opens={ORG: D0 + (1 - D0) * u, 'burst': ('M', 0, u)}, flash=0.0)
    u = ease((t - 3.1) / 1.4)
    return dict(x=-0.65 + 1.95 * u, z=ZD, yaw=math.pi / 2, bob=1.2 * math.sin(math.pi * u), pitch=0.0,
                opens={ORG: 1.0, 'burst': ('M', 0, 1.0 + u), 'zoom': u}, flash=max(0.0, (u - 0.6) / 0.4) * 0.9)


def cam_fijo(x, z, yaw, pitch):
    return lambda t: dict(x=x, z=z, yaw=yaw, bob=0.4 * math.sin(t * 3), pitch=pitch, opens=None, flash=0.0)


# nombre: (cámara, duración en s, cuadros por segundo)
SHOTS = {
    'pasos': (cam_pasos, 4.0, FPS),
    'puerta': (cam_puerta, 4.5, FPS),
    'combate': (cam_fijo(0.0, 8.6, 0.0, 0.04), 2.0, 12),
    'jefe': (cam_fijo(0.0, 4.2, 0.0, 0.06), 2.0, 12),
    'titulo': (cam_fijo(0.0, 0.2, 0.0, 0.10), 2.0, 12),
}


def path(name, i):
    return os.path.join(CACHE, f'{name}-{i:04d}.png')


def count(name):
    _, dur, fps = SHOTS[name]
    return int(round(dur * fps))


def _render(job):
    name, i = job
    import build_sotano as b
    b.W, b.H, b.CX, b.CY0, b.F = AW, AH, AW / 2, 157.0, 150.0
    cam, dur, fps = SHOTS[name]
    t = i / fps
    c = cam(t)
    b.set_cam(c['x'], c['z'], c['yaw'], c['bob'], c['pitch'], t * 2.5)
    b.build(c['opens'], c['flash'], 1).save(path(name, i))


def ensure():
    os.makedirs(CACHE, exist_ok=True)
    jobs = [(n, i) for n in SHOTS for i in range(count(n)) if not os.path.exists(path(n, i))]
    if jobs:
        print(f'pasillo: {len(jobs)} cuadros por dibujar', flush=True)
        with Pool(max(1, (os.cpu_count() or 2) - 2)) as pool:
            pool.map(_render, jobs, chunksize=2)


def frame(name, t, loop=False):
    """Cuadro del plano `name` en el segundo t (RGB 180x320)."""
    _, dur, fps = SHOTS[name]
    n = count(name)
    i = int(t * fps)
    i = i % n if loop else min(n - 1, max(0, i))
    return Image.open(path(name, i)).convert('RGB')


if __name__ == '__main__':
    ensure()
    print('listo')
