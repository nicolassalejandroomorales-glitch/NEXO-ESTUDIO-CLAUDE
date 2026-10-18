"""Exporta el Sótano a la app: cuadros del pasillo y de las 4 Cámaras (una por ramo) como hojas WebP, sprites del estado y manifiesto.
Cada tira (tramo entre dos paradas) es una hoja de cuadros de 320x200; la app la reproduce hacia adelante o al revés.
La Cámara se renderiza NEUTRA (sin frascos, cristales apagados, sin cuenta regresiva): el estado real se dibuja encima con
sprites que salen de este mismo motor (cada frasco y cada cristal se renderiza solo y se resta del cuadro neutro).
Salida: dist/aprender/img/*.webp y dist/aprender/manifest.json.
Correr: python tools/aprender-pasillo/export_app.py [todo|pasillo|camara] [ramo ...]  (ramo: organica analitica fisico fisio)   (usa todos los núcleos; ~5 min por ramo la primera vez)
"""
import hashlib
import json
import math
import multiprocessing as mp
import os
import sys
import tempfile

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import build_sotano as bs  # noqa: E402
import build_camara as bc  # noqa: E402

DEST = os.path.join(ROOT, 'dist', 'aprender')
IMG = os.path.join(DEST, 'img')
CACHE = os.path.join(tempfile.gettempdir(), 'nexo-aprender-cache')
W, H, CELL_H, COLS = 320, 200, 208, 8      # alto de celda múltiplo de 16: la compresión no mezcla colores entre cuadros
QUALITY = 80
# milisegundos por cuadro según el tipo de tira (w caminar, u dar la vuelta, t girar a una puerta, e entrar, o orbitar, z acercarse, c llegada).
# La app mezcla cuadros vecinos, por eso puede ir lento sin verse a saltos. 'ease' = la app suaviza arranque y frenada (las demás ya lo traen).
MS_PER_FRAME = {'w': 200, 'u': 60, 't': 80, 'e': 145, 'o': 80, 'z': 150, 'c': 155, 'i': 0}
IDLE_N = 6                                  # cuadros de la animación de reposo de cada parada (ida y vuelta)
LOOK = 0.12
JAR_LEVELS = [0.0, 0.25, 0.5, 0.75, 1.0]
SOURCE_HASH = hashlib.sha1(b''.join(open(os.path.join(HERE, f), 'rb').read() for f in ('build_sotano.py', 'build_camara.py', 'murales.py'))).hexdigest()[:10]   # solo el motor: los recorridos ya van dentro de cada cuadro pedido


# ---------------------------------------------------------------- trabajos de render (corren en procesos aparte)
def neutral(ramo='organica'):
    """Cámara de un ramo sin estado: frascos fuera, cristales apagados, ramas verdes y sin cuenta regresiva."""
    bc.CRYSTAL_LIGHT = False
    cfg = bc.RAMOS[ramo]
    cfg['countdown'] = ''
    for t in cfg['temas']:
        t['crystals'] = [None] * len(t['crystals'])
        t['jars'] = []
        t['ramas'] = ['verde'] * len(t['ramas'])
    bc.set_ramo(ramo)


def alcove(key):
    return next(a for a in bc.ALCOVES if a['key'] == key)


def render(spec):
    """spec: {'k': 'h'|'c', 'cam': (x, z, yaw, bob, pitch, tiempo), 'ramo': ...} -> arreglo RGB 200x320."""
    bs.set_cam(*spec['cam'])
    if spec['k'] == 'h':
        img = bs.build(spec.get('opens'), spec.get('flash', 0.0), 1)
    else:
        neutral(spec.get('ramo', 'organica'))
        var = spec.get('var')
        if var:
            a = alcove(var['alcove'])
            n = var['n']
            if var['what'] == 'jar':
                a['jars'] = [None] * n
                a['jars'][var['i']] = var['v']
            else:
                a['crystals'] = [None] * n
                a['crystals'][var['i']] = var['v']
        img = bc.build(spec.get('swirl', 0.0), spec.get('flash', 0.0), 1)
    return np.asarray(img.convert('RGB'))


def job(item):
    key, spec = item
    path = os.path.join(CACHE, hashlib.sha1((SOURCE_HASH + repr(spec)).encode()).hexdigest() + '.npy')
    if os.path.exists(path):
        return key, np.load(path)
    arr = render(spec)
    np.save(path, arr)
    return key, arr


# ---------------------------------------------------------------- recorridos
def ease(u):
    u = min(max(u, 0.0), 1.0)
    return u * u * (3 - 2 * u)


class Clips:
    """Reúne tiras y paradas; cada cuadro es un spec de render."""

    def __init__(self):
        self.clips = {}        # nombre -> lista de specs
        self.camera = set()    # nombres de las tiras que se ven dentro de una Cámara

    def add(self, name, specs, camera=False):
        self.clips[name] = specs
        if camera:
            self.camera.add(name)

    def cam(self, x, z, yaw=0.0, bob=0.0, pitch=0.0, i=0):
        return (x, z, yaw, bob + 0.5 * math.sin(i * 0.4), pitch, 3.0 + i * 0.45)


CL = Clips()
HALL_Z = {'h0': 0.0, 'h1': 2.6, 'h2': 3.3, 'h3': 7.8, 'h4': 12.2}
DOOR = {'d-org': ('h1', 0), 'd-ana': ('h2', 1), 'd-fis': ('h3', 2), 'd-fisio': ('h4', 3)}   # parada del pasillo e índice de puerta
LATERAL_Z = {'b0': 0.0, 'b1': 3.2, 'b2': 6.4, 'b3': 8.0}
ZB = bs.ZJ                                  # el pasillo lateral sale a la derecha en z = ZJ


def hall_cam(z, i=0, bob=0.0):
    return CL.cam(0.0, z, 0.0, bob, 0.0, i)


def door_geometry(idx):
    s, zd, st = bs.DOORS['M'][idx]
    return s, zd, st, ('M', idx), bs.OPEN_DEFAULT[st]


TURN_N = 20                                 # cuadros de un giro de 60-90°: con pocos, la mezcla de cuadros deja doble imagen
WALK_PER_UNIT = 6                           # la app mezcla cuadros vecinos, así que no hacen falta tantos


def walk(pos, dist, pose, k='h'):
    """Tira de caminata a velocidad constante (la app suaviza arranque y frenada) con un balanceo suave por paso."""
    n = max(4, round(dist * WALK_PER_UNIT))
    steps = max(1, round(dist))
    out = []
    for i in range(1, n + 1):
        p = i / n
        x, z = pos(p)
        out.append({'k': k, 'cam': CL.cam(*pose(x, z), 1.3 * abs(math.sin(math.pi * steps * p)), 0.0, i)})
    return out


def turn_around(z, x=0.0, yaw0=0.0, yaw1=math.pi, n=32):
    """Darse la vuelta en el lugar (giro lineal; la app lo suaviza)."""
    return [{'k': 'h', 'cam': CL.cam(x, z, yaw0 + (yaw1 - yaw0) * i / n, 0.9 * math.sin(math.pi * i / n), 0.0, i)} for i in range(1, n + 1)]


def build_hall():
    names = list(HALL_Z)
    for a, b in zip(names, names[1:]):                              # caminar: ~9 cuadros por unidad, un paso con balanceo por unidad
        z0, z1 = HALL_Z[a], HALL_Z[b]
        CL.add(f'w-{a}-{b}', walk(lambda p: (0.0, z0 + (z1 - z0) * p), z1 - z0, lambda x, z: (x, z, 0.0)))
    ids = list(HALL_Z)
    for i, name in enumerate(ids):                                   # darse la vuelta y volver mirando hacia la entrada
        CL.add(f'u-{name}', turn_around(HALL_Z[name]))
        if i:
            z0, z1 = HALL_Z[name], HALL_Z[ids[i - 1]]
            CL.add(f'w-r{i}-r{i - 1}', walk(lambda p: (0.0, z0 + (z1 - z0) * p), z0 - z1, lambda x, z: (x, z, math.pi)))
    for name, (stop, idx) in DOOR.items():                           # girar hacia la puerta y acercarse a la pared de enfrente
        s, zd, st, key, d0 = door_geometry(idx)
        xb, yaw = -s * 0.65, s * math.pi / 2
        CL.add(f't-{stop}-{name}', [{'k': 'h', 'cam': CL.cam(xb * ease(i / TURN_N), zd, yaw * ease(i / TURN_N), 0.8 * math.sin(math.pi * i / TURN_N), 0.0, i), 'opens': {key: d0}}
                                    for i in range(1, TURN_N + 1)])
        seq = []
        for i in range(1, 13):                                       # se abre el portal
            u = ease(i / 12)
            seq.append({'k': 'h', 'cam': CL.cam(xb, zd, yaw, 1.4 * math.sin(i * 2.7) * (1 - u), 0.0, i),
                        'opens': {key: d0 + (1 - d0) * u, 'burst': ('M', idx, u)}})
        for i in range(1, 15):                                       # entra
            u = ease(i / 14)
            seq.append({'k': 'h', 'cam': CL.cam(xb + s * 1.95 * u, zd, yaw, 1.2 * math.sin(math.pi * u), 0.0, 12 + i),
                        'opens': {key: 1.0, 'burst': ('M', idx, 1.0 + u), 'zoom': u}, 'flash': max(0.0, (u - 0.65) / 0.35) * 0.85})
        CL.add(f'e-{name}', seq)
    CL.add('t-h3-b0', [{'k': 'h', 'cam': CL.cam(0.0, HALL_Z['h3'] + (ZB - HALL_Z['h3']) * ease(i / TURN_N), math.pi / 2 * ease(i / TURN_N), 0.8 * math.sin(math.pi * i / TURN_N), 0.0, i)}
                       for i in range(1, TURN_N + 1)])
    lat = list(LATERAL_Z)
    for a, b in zip(lat, lat[1:]):
        x0, x1 = LATERAL_Z[a], LATERAL_Z[b]
        CL.add(f'w-{a}-{b}', walk(lambda p: (x0 + (x1 - x0) * p, ZB), x1 - x0, lambda x, z: (x, z, math.pi / 2)))
        CL.add(f'w-q{lat.index(b)}-q{lat.index(a)}', walk(lambda p: (x1 + (x0 - x1) * p, ZB), x1 - x0, lambda x, z: (x, z, -math.pi / 2)))
    for name in lat[1:]:                                             # en el pasillo lateral también se da la vuelta (pasando por la pared opuesta)
        CL.add(f'u-{name}', turn_around(ZB, LATERAL_Z[name], math.pi / 2, 3 * math.pi / 2))
    CL.add('t-q0-h3', [{'k': 'h', 'cam': CL.cam(0.0, ZB + (HALL_Z['h3'] - ZB) * ease(i / TURN_N), -math.pi / 2 + (math.pi / 2) * ease(i / TURN_N), 0.8 * math.sin(math.pi * i / TURN_N), 0.0, i)}
                       for i in range(1, TURN_N + 1)])


def orbit(deg):
    p = math.radians(deg)
    return bc.STAND * math.sin(p), bc.STAND * math.cos(p), p


# Una Cámara por ramo. p = prefijo de sus paradas y tiras (Orgánica II no lleva: así conserva sus nombres y su caché).
# alc = (clave de la alcoba en build_camara.py, grados de su parada, frascos = misiones, cristales). Los frascos salen de las
# clases de la alcoba (estado.js); si una clase cambia de misiones hay que volver a exportar (lo vigila tools/aprender-test.cjs).
CAMARAS = {
    'organica': dict(p='', door='d-org', alc=[('aminas', 0, 8, 6), ('aromaticos', 60, 6, 5), ('heterociclos', 300, 0, 4)],
                     names={'c0': 'Aminas', 'c60': 'Aromáticos', 'c-60': 'Heterociclos'}),
    'analitica': dict(p='ana.', door='d-ana', alc=[('ana_errores', 0, 2, 4), ('ana_acidobase', 60, 4, 5), ('ana_polipro', 300, 0, 4)],
                      names={'c0': 'Errores', 'c60': 'Ácido-base', 'c-60': 'Polipróticos'}),
    'fisico': dict(p='fq.', door='d-fis', alc=[('fq_equilibrio', 0, 4, 5), ('fq_ionico', 60, 0, 4), ('fq_pila', 300, 0, 4)],
                   names={'c0': 'Equilibrio', 'c60': 'Electrolitos', 'c-60': 'Electroquímica'}),
    'fisio': dict(p='fis.', door='d-fisio', alc=[('fisio_potencial', 0, 4, 5), ('fisio_resp', 60, 2, 4), ('fisio_digest', 300, 2, 4)],
                  names={'c0': 'Nervioso', 'c60': 'Respiratorio', 'c-60': 'Digestivo'}),
}
CAM_LOCAL = ['c-in', 'c0', 'c60', 'c120', 'c180', 'c-120', 'c-60', 'cz0', 'cz60', 'cz-60']
RING = [('c0', 0), ('c60', 60), ('c120', 120), ('c180', 180), ('c-120', 240), ('c-60', 300)]
ZT = bc.R - 0.5


def table_cam(deg, u, i=0):
    p = math.radians(deg)
    r = bc.STAND + (ZT - bc.STAND) * u
    return CL.cam(r * math.sin(p), r * math.cos(p), p, 1.2 * math.sin(math.pi * u), LOOK - 0.06 * u, i)


def build_camara(ramo):
    cfg = CAMARAS[ramo]
    p = cfg['p']
    tag = {} if ramo == 'organica' else {'ramo': ramo}      # Orgánica II no lleva etiqueta: sus cuadros ya estaban en la caché
    z0 = -(bc.R + 0.35)
    CL.add(p + 'c-emerge', [{'k': 'c', **tag, 'cam': CL.cam(0.0, z0 + 0.35 * ease(i / 8), 0.0, 0.0, 0.16, i), 'swirl': 1 - ease(i / 8), 'flash': 0.45 * (1 - ease(i / 8))}
                            for i in range(0, 9)], True)
    zs = z0 + 0.35
    n = 32
    seq = []
    for i in range(1, n + 1):                                         # rodea el sauce por la derecha hasta quedar frente a la primera alcoba
        u = ease(i / n)
        x = 1.25 * math.sin(math.pi * u) ** 0.8
        z = zs + (bc.STAND - zs) * u
        yaw = math.atan2(0 - x, bc.R + bc.DEP - z) * (1 - u)
        seq.append({'k': 'c', **tag, 'cam': CL.cam(x, z, yaw, 1.6 * abs(math.sin(math.pi * 3 * i / n)), 0.16 + (LOOK - 0.16) * u, i)})
    CL.add(p + 'o-c-in-c0', seq, True)
    for k, (name, deg) in enumerate(RING):                           # anillo: +60° = girar a la derecha
        nxt = RING[(k + 1) % 6][0]
        seq = []
        for i in range(1, TURN_N + 1):
            x, z, yaw = orbit(deg + 60 * ease(i / TURN_N))
            seq.append({'k': 'c', **tag, 'cam': CL.cam(x, z, yaw, 0.8 * math.sin(math.pi * i / TURN_N), LOOK, i)})
        CL.add(f'{p}o-{name}-{nxt}', seq, True)
    for _, deg, jars, _c in cfg['alc']:                              # acercarse a la mesa de las alcobas con clase
        if jars:
            CL.add(f'{p}z-c{view_deg(deg)}', [{'k': 'c', **tag, 'cam': table_cam(deg, ease(i / 8), i)} for i in range(1, 9)], True)


def view_deg(deg):
    """Grados del anillo escritos como en los nombres de parada (300° = -60)."""
    return deg - 360 if deg > 180 else deg


# ---------------------------------------------------------------- paradas y reposo
def split_node(node):
    """('ana.c0') -> ('analitica', 'c0'); las paradas sin prefijo son del pasillo o de Orgánica II."""
    for ramo, cfg in CAMARAS.items():
        if cfg['p'] and node.startswith(cfg['p']):
            return ramo, node[len(cfg['p']):]
    return 'organica', node


def stop_cam(node, i=0):
    ramo, node = split_node(node)
    if node in HALL_Z:
        return hall_cam(HALL_Z[node], i)
    if node in DOOR:
        s, zd, st, key, d0 = door_geometry(DOOR[node][1])
        return CL.cam(-s * 0.65, zd, s * math.pi / 2, 0.0, 0.0, i)
    if node in LATERAL_Z:
        return CL.cam(LATERAL_Z[node], ZB, math.pi / 2, 0.0, 0.0, i)
    if node[0] == 'r' and node[1:].isdigit():
        return CL.cam(0.0, list(HALL_Z.values())[int(node[1:])], math.pi, 0.0, 0.0, i)
    if node[0] == 'q' and node[1:].isdigit():
        return CL.cam(list(LATERAL_Z.values())[int(node[1:])], ZB, -math.pi / 2, 0.0, 0.0, i)
    if node == 'c-in':
        return CL.cam(0.0, -(bc.R + 0.35) + 0.35, 0.0, 0.0, 0.16, i)
    if node.startswith('cz'):
        return table_cam(int(node[2:]), 1.0, i)
    x, z, yaw = orbit(dict(RING)[node])
    return CL.cam(x, z, yaw, 0.0, LOOK, i)


def stop_spec(node, i):
    ramo, local = split_node(node)
    spec = {'k': 'c' if local.startswith('c') else 'h', 'cam': stop_cam(node, i)}
    if spec['k'] == 'c' and ramo != 'organica':
        spec['ramo'] = ramo
    if local in DOOR:
        spec['opens'] = {door_geometry(DOOR[local][1])[3]: door_geometry(DOOR[local][1])[4]}
    return spec


HALL_NODES = ['h0', 'h1', 'h2', 'h3', 'h4', 'r0', 'r1', 'r2', 'r3', 'r4', 'd-org', 'd-ana', 'd-fis', 'd-fisio', 'b0', 'b1', 'b2', 'b3', 'q0', 'q1', 'q2', 'q3']


def camera_nodes(ramo):
    p = CAMARAS[ramo]['p']
    table = [f'cz{view_deg(deg)}' for _, deg, jars, _c in CAMARAS[ramo]['alc'] if jars]
    return [p + n for n in CAM_LOCAL if not n.startswith('cz') or n in table]


NODES = HALL_NODES + [n for ramo in CAMARAS for n in camera_nodes(ramo)]


def build_idle():
    for node in NODES:
        CL.add(f'i-{node}', [stop_spec(node, 60 + i * 2) for i in range(IDLE_N)], split_node(node)[1].startswith('c'))


# ---------------------------------------------------------------- sprites del estado de la Cámara
def alcoves_with_class():
    """(ramo, clave, grados, frascos, cristales) de cada alcoba que tiene clase detrás."""
    return [(ramo, key, deg, jars, crys) for ramo, cfg in CAMARAS.items() for key, deg, jars, crys in cfg['alc'] if jars]


def sprite_specs(only=None):
    out = {}
    for ramo, key, deg, jars, crys in alcoves_with_class():
        if only and ramo not in only:
            continue
        p = CAMARAS[ramo]['p']
        tag = {} if ramo == 'organica' else {'ramo': ramo}
        for view in (f'{p}c{view_deg(deg)}', f'{p}cz{view_deg(deg)}'):
            cam = stop_cam(view, 60)
            out[(ramo, key, view, 'base')] = {'k': 'c', **tag, 'cam': cam}
            for j in range(jars):
                for li, lv in enumerate(JAR_LEVELS):
                    out[(ramo, key, view, 'jar', j, li)] = {'k': 'c', **tag, 'cam': cam, 'var': dict(alcove=key, what='jar', i=j, v=lv, n=jars)}
            for i in range(crys):
                for st in (1, 0):
                    out[(ramo, key, view, 'cr', i, st)] = {'k': 'c', **tag, 'cam': cam, 'var': dict(alcove=key, what='crystal', i=i, v=st, n=crys)}
    return out


# ---------------------------------------------------------------- salida
def save_sheet(name, frames):
    n = len(frames)
    rows = (n + COLS - 1) // COLS
    sheet = Image.new('RGB', (COLS * W, rows * CELL_H))
    for i, fr in enumerate(frames):
        im = Image.fromarray(fr)
        cell = Image.new('RGB', (W, CELL_H))
        cell.paste(im, (0, 0))
        cell.paste(im.crop((0, H - 1, W, H)).resize((W, CELL_H - H)), (0, H))
        sheet.paste(cell, ((i % COLS) * W, (i // COLS) * CELL_H))
    path = os.path.join(IMG, name + '.webp')
    sheet.save(path, quality=QUALITY, method=6)
    return os.path.getsize(path)


def make_overlay(view_key, base, variants, c):
    """Atlas de sprites de una vista: frascos por nivel y cristales por estado, recortados donde cambian respecto del cuadro neutro."""
    jars, crys, packs = [], [], []

    def crop(arr):
        diff = np.any(arr != base, axis=2)
        return diff

    for kind, count, states in (('jar', c['jars'], range(len(JAR_LEVELS))), ('cr', c['crys'], (1, 0))):
        for idx in range(count):
            diffs = {st: crop(variants[(kind, idx, st)]) for st in states}
            union = np.zeros((H, W), bool)
            for d in diffs.values():
                union |= d
            ys, xs = np.where(union)
            if not len(xs):
                continue
            x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
            tiles = {}
            for st in states:
                rgba = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
                rgba[..., :3] = variants[(kind, idx, st)][y0:y1, x0:x1]
                rgba[..., 3] = np.where(diffs[st][y0:y1, x0:x1], 255, 0)
                tiles[st] = rgba
            packs.append((kind, idx, x0, y0, x1 - x0, y1 - y0, tiles))
    atlas_w, x, y, row_h, placed = 512, 0, 0, 0, []
    for kind, idx, x0, y0, w, h, tiles in packs:
        for st, rgba in tiles.items():
            if x + w > atlas_w:
                x, y, row_h = 0, y + row_h, 0
            placed.append((kind, idx, st, x, y, rgba))
            x, row_h = x + w, max(row_h, h)
    atlas = Image.new('RGBA', (atlas_w, y + row_h))
    for kind, idx, st, ax, ay, rgba in placed:
        atlas.paste(Image.fromarray(rgba, 'RGBA'), (ax, ay))
    fname = f'ov-{view_key}.webp'
    atlas.save(os.path.join(IMG, fname), lossless=True, method=6)
    where = {(k, i, st): (ax, ay) for k, i, st, ax, ay, _ in placed}
    for kind, idx, x0, y0, w, h, tiles in packs:
        entry = {'x': x0, 'y': y0, 'w': w, 'h': h}
        if kind == 'jar':
            entry['s'] = [list(where[(kind, idx, st)]) for st in range(len(JAR_LEVELS))]
            jars.append((idx, entry))
        else:
            entry['s'] = {str(st): list(where[(kind, idx, st)]) for st in (1, 0)}
            crys.append((idx, entry))
    slots = lambda found, n: [dict(found).get(i) for i in range(n)]     # null si el elemento queda fuera de cuadro en esa vista
    return {'atlas': fname, 'jars': slots(jars, c['jars']), 'crys': slots(crys, c['crys'])}


def moves():
    """Paradas, tramos y botones: lo único que la app necesita saber del recorrido."""
    names = {'d-org': 'Orgánica II', 'd-ana': 'Química Analítica', 'd-fis': 'Fisicoquímica II', 'd-fisio': 'Fisiopatología'}
    ramo_of_door = {cfg['door']: ramo for ramo, cfg in CAMARAS.items()}
    nodes = {n: {'idle': f'i-{n}', 'moves': []} for n in NODES}
    edges = []

    def edge(a, b, clip):
        edges.append({'a': a, 'b': b, 'clip': clip})

    def mv(node, d, to, label):
        nodes[node]['moves'].append({'dir': d, 'to': to, 'label': label})
    hall = list(HALL_Z)
    for i, a in enumerate(hall):
        edge(a, f'r{i}', f'u-{a}')                                  # dar la vuelta: nunca se retrocede de espaldas
        mv(a, 'turn', f'r{i}', 'Dar la vuelta')
        mv(f'r{i}', 'turn', a, 'Dar la vuelta')
        if i:
            edge(f'r{i}', f'r{i - 1}', f'w-r{i}-r{i - 1}')
            mv(f'r{i}', 'fwd', f'r{i - 1}', 'Avanzar')
        if i < len(hall) - 1:
            edge(a, hall[i + 1], f'w-{a}-{hall[i + 1]}')
            mv(a, 'fwd', hall[i + 1], 'Avanzar')
    for d, (stop, idx) in DOOR.items():
        ramo = ramo_of_door[d]
        edge(stop, d, f't-{stop}-{d}')
        mv(stop, 'right' if bs.DOORS['M'][idx][0] > 0 else 'left', d, names[d])
        mv(d, 'back', stop, 'Volver al pasillo')
        p = CAMARAS[ramo]['p']
        nodes[d]['moves'].append({'dir': 'enter', 'clip': f'e-{d}', 'cam': {'clip': p + 'c-emerge', 'node': p + 'c-in'}, 'label': 'Entrar'})
        nodes[d]['name'] = names[d]
        nodes[d]['ramo'] = ramo
    edge('h3', 'b0', 't-h3-b0')
    mv('h3', 'right', 'b0', 'Pasillo lateral')
    mv('b0', 'back', 'h3', 'Volver al pasillo')
    lat = list(LATERAL_Z)
    for k, a in enumerate(lat):
        if k < len(lat) - 1:
            edge(a, lat[k + 1], f'w-{a}-{lat[k + 1]}')
            mv(a, 'fwd', lat[k + 1], 'Avanzar')
        if k:
            edge(a, f'q{k}', f'u-{a}')
            mv(a, 'turn', f'q{k}', 'Dar la vuelta')
            mv(f'q{k}', 'turn', a, 'Dar la vuelta')
            edge(f'q{k}', f'q{k - 1}', f'w-q{k}-q{k - 1}')
            mv(f'q{k}', 'fwd', f'q{k - 1}', 'Avanzar')
    edge('q0', 'h3', 't-q0-h3')
    mv('q0', 'right', 'h3', 'Seguir al pasillo')
    for ramo, cfg in CAMARAS.items():
        p = cfg['p']
        names_c = {'c120': 'PEP 2', 'c180': 'Portal', 'c-120': 'PEP 2', **cfg['names']}
        edge(p + 'c-in', p + 'c0', p + 'o-c-in-c0')
        mv(p + 'c-in', 'fwd', p + 'c0', 'Rodear el sauce')
        nodes[p + 'c-in']['moves'].append({'dir': 'back', 'exit': cfg['door'], 'label': 'Salir'})
        for k, (name, deg) in enumerate(RING):
            nxt = RING[(k + 1) % 6][0]
            edge(p + name, p + nxt, f'{p}o-{name}-{nxt}')
            mv(p + name, 'right', p + nxt, names_c[nxt])
            mv(p + nxt, 'left', p + name, names_c[name])
            nodes[p + name]['name'] = names_c[name]
        nodes[p + 'c180']['moves'].append({'dir': 'back', 'exit': cfg['door'], 'label': 'Salir'})
        for _, deg, jars, _c in cfg['alc']:
            if jars:
                loc = f'c{view_deg(deg)}'
                edge(p + loc, p + 'cz' + loc[1:], f'{p}z-{loc}')
                mv(p + loc, 'fwd', p + 'cz' + loc[1:], 'Acercarse a la mesa')
                mv(p + 'cz' + loc[1:], 'back', p + loc, 'Alejarse')
        for n in camera_nodes(ramo):
            nodes[n]['ramo'] = ramo
    return nodes, edges


def idle_group(name):
    """Los reposos de varias paradas comparten una hoja (el Artifact admite 511 archivos): 'i-<parada>' -> nombre de la hoja."""
    ramo, local = split_node(name[2:])
    if local.startswith('c'):
        return 'i-cam-' + ramo
    if local[0] in 'hr':
        return 'i-pasillo'
    return 'i-puertas' if local.startswith('d-') else 'i-lateral'


def clip_kind(name):
    if name.startswith('i-'):
        return 'i'
    base = name.split('.')[-1]
    return 'c' if base.startswith('c-') else base.split('-')[0]


def main(which, ramos):
    os.makedirs(IMG, exist_ok=True)
    os.makedirs(CACHE, exist_ok=True)
    build_hall()
    for ramo in CAMARAS:
        build_camara(ramo)
    build_idle()
    pool_jobs = {}
    for name, specs in CL.clips.items():
        in_cam = name in CL.camera
        ramo = split_node(name[2:] if name.startswith('i-') else name)[0] if in_cam else None
        if which == 'pasillo' and in_cam:
            continue
        if which == 'camara' and not in_cam:
            continue
        if in_cam and ramos and ramo not in ramos:
            continue
        for i, sp in enumerate(specs):
            pool_jobs[('clip', name, i)] = sp
    if which in ('todo', 'camara'):
        for k, sp in sprite_specs(ramos).items():
            pool_jobs[('spr',) + k] = sp
    print(len(pool_jobs), 'cuadros por renderizar', flush=True)
    results = {}
    with mp.Pool(max(1, (os.cpu_count() or 4) - 2)) as pool:
        for n, (key, arr) in enumerate(pool.imap_unordered(job, pool_jobs.items(), chunksize=1), 1):
            results[key] = arr
            if n % 25 == 0:
                print(n, '/', len(pool_jobs), flush=True)
    manifest_path = os.path.join(DEST, 'manifest.json')
    old = json.load(open(manifest_path, encoding='utf-8')) if os.path.exists(manifest_path) else {}
    clips = old.get('clips', {})
    total = 0
    groups = {}
    for name, specs in CL.clips.items():
        if ('clip', name, 0) not in results:
            continue
        frames = [results[('clip', name, i)] for i in range(len(specs))]
        if name.startswith('i-'):                                    # reposos: varias paradas por hoja
            group = groups.setdefault(idle_group(name), [])
            clips[name] = {'n': len(frames), 'file': idle_group(name), 'off': sum(len(f) for _, f in group)}
            group.append((name, frames))
            continue
        total += save_sheet(name, frames)
        clips[name] = {'n': len(frames), 'ms': round(len(frames) * MS_PER_FRAME[clip_kind(name)]), 'ease': clip_kind(name) in ('w', 'u')}
    for group, members in groups.items():
        total += save_sheet(group, [fr for _, frames in members for fr in frames])
    overlay = old.get('overlay', {})
    for ramo, key, deg, jars, crys in alcoves_with_class():
        p = CAMARAS[ramo]['p']
        if ('spr', ramo, key, f'{p}c{view_deg(deg)}', 'base') not in results:
            continue
        for view in (f'{p}c{view_deg(deg)}', f'{p}cz{view_deg(deg)}'):
            base = results[('spr', ramo, key, view, 'base')]
            variants = {('jar', j, li): results[('spr', ramo, key, view, 'jar', j, li)] for j in range(jars) for li in range(len(JAR_LEVELS))}
            variants.update({('cr', i, st): results[('spr', ramo, key, view, 'cr', i, st)] for i in range(crys) for st in (1, 0)})
            overlay[view] = make_overlay(view, base, variants, dict(jars=jars, crys=crys))
    nodes, edges = moves()
    keep = {c.get('file', n) + '.webp' for n, c in clips.items()} | {o['atlas'] for o in overlay.values()}
    for f in os.listdir(IMG):                                        # hojas que ya no usa ninguna tira
        if f not in keep:
            os.remove(os.path.join(IMG, f))
    digest = hashlib.sha1()                                          # versión de los cuadros: cambia el ?v= de cada hoja
    for f in sorted(os.listdir(IMG)):
        digest.update(f.encode() + open(os.path.join(IMG, f), 'rb').read())
    manifest = {'v': digest.hexdigest()[:8], 'w': W, 'h': H, 'cellH': CELL_H, 'cols': COLS, 'idleMs': 280, 'idleN': IDLE_N, 'clips': clips,
                'nodes': nodes, 'edges': edges, 'overlay': overlay}
    json.dump(manifest, open(manifest_path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('listo:', len(clips), 'tiras,', round(total / 1e6, 2), 'MB de hojas nuevas')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'todo', set(sys.argv[2:]))
