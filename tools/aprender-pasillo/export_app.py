"""Exporta el Sótano a la app: cuadros del pasillo y de la Cámara de Orgánica II como hojas WebP, sprites del estado y manifiesto.
Cada tira (tramo entre dos paradas) es una hoja de cuadros de 320x200; la app la reproduce hacia adelante o al revés.
La Cámara se renderiza NEUTRA (sin frascos, cristales apagados, sin cuenta regresiva): el estado real se dibuja encima con
sprites que salen de este mismo motor (cada frasco y cada cristal se renderiza solo y se resta del cuadro neutro).
Salida: dist/aprender/img/*.webp y dist/aprender/manifest.json.
Correr: python tools/aprender-pasillo/export_app.py [todo|pasillo|camara]   (usa todos los núcleos; ~5 min la primera vez)
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
MS_PER_FRAME = {'w': 200, 'u': 115, 't': 125, 'e': 145, 'o': 135, 'z': 150, 'c': 155, 'i': 0}
IDLE_N = 6                                  # cuadros de la animación de reposo de cada parada (ida y vuelta)
LOOK = 0.12
JAR_LEVELS = [0.0, 0.25, 0.5, 0.75, 1.0]
SOURCE_HASH = hashlib.sha1(b''.join(open(os.path.join(HERE, f), 'rb').read() for f in ('build_sotano.py', 'build_camara.py', 'murales.py'))).hexdigest()[:10]   # solo el motor: los recorridos ya van dentro de cada cuadro pedido


# ---------------------------------------------------------------- trabajos de render (corren en procesos aparte)
def neutral():
    """Cámara de Orgánica II sin estado: frascos fuera, cristales apagados, ramas verdes y sin cuenta regresiva."""
    bc.CRYSTAL_LIGHT = False
    cfg = bc.RAMOS['organica']
    cfg['countdown'] = ''
    for t in cfg['temas']:
        t['crystals'] = [None] * len(t['crystals'])
        t['jars'] = []
        t['ramas'] = ['verde'] * len(t['ramas'])
    bc.set_ramo('organica')


def alcove(key):
    return next(a for a in bc.ALCOVES if a['key'] == key)


def render(spec):
    """spec: {'k': 'h'|'c', 'cam': (x, z, yaw, bob, pitch, tiempo), ...} -> arreglo RGB 200x320."""
    bs.set_cam(*spec['cam'])
    if spec['k'] == 'h':
        img = bs.build(spec.get('opens'), spec.get('flash', 0.0), 1)
    else:
        neutral()
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
        self.t = 0.0

    def add(self, name, specs):
        self.clips[name] = specs

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


def turn_around(z, x=0.0, yaw0=0.0, yaw1=math.pi, n=16):
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
        CL.add(f't-{stop}-{name}', [{'k': 'h', 'cam': CL.cam(xb * ease(i / 12), zd, yaw * ease(i / 12), 0.8 * math.sin(math.pi * i / 12), 0.0, i), 'opens': {key: d0}}
                                    for i in range(1, 13)])
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
    CL.add('t-h3-b0', [{'k': 'h', 'cam': CL.cam(0.0, HALL_Z['h3'] + (ZB - HALL_Z['h3']) * ease(i / 12), math.pi / 2 * ease(i / 12), 0.8 * math.sin(math.pi * i / 12), 0.0, i)}
                       for i in range(1, 13)])
    lat = list(LATERAL_Z)
    for a, b in zip(lat, lat[1:]):
        x0, x1 = LATERAL_Z[a], LATERAL_Z[b]
        CL.add(f'w-{a}-{b}', walk(lambda p: (x0 + (x1 - x0) * p, ZB), x1 - x0, lambda x, z: (x, z, math.pi / 2)))
        CL.add(f'w-q{lat.index(b)}-q{lat.index(a)}', walk(lambda p: (x1 + (x0 - x1) * p, ZB), x1 - x0, lambda x, z: (x, z, -math.pi / 2)))
    for name in lat[1:]:                                             # en el pasillo lateral también se da la vuelta (pasando por la pared opuesta)
        CL.add(f'u-{name}', turn_around(ZB, LATERAL_Z[name], math.pi / 2, 3 * math.pi / 2))
    CL.add('t-q0-h3', [{'k': 'h', 'cam': CL.cam(0.0, ZB + (HALL_Z['h3'] - ZB) * i / 12, -math.pi / 2 + (math.pi / 2) * i / 12, 0.8 * math.sin(math.pi * i / 12), 0.0, i)}
                       for i in range(1, 13)])


def orbit(deg):
    p = math.radians(deg)
    return bc.STAND * math.sin(p), bc.STAND * math.cos(p), p


RING = [('c0', 0), ('c60', 60), ('c120', 120), ('c180', 180), ('c-120', 240), ('c-60', 300)]
ZT = bc.R - 0.5


def table_cam(deg, u, i=0):
    p = math.radians(deg)
    r = bc.STAND + (ZT - bc.STAND) * u
    return CL.cam(r * math.sin(p), r * math.cos(p), p, 1.2 * math.sin(math.pi * u), LOOK - 0.06 * u, i)


def build_camara():
    z0 = -(bc.R + 0.35)
    CL.add('c-emerge', [{'k': 'c', 'cam': CL.cam(0.0, z0 + 0.35 * ease(i / 8), 0.0, 0.0, 0.16, i), 'swirl': 1 - ease(i / 8), 'flash': 0.45 * (1 - ease(i / 8))}
                        for i in range(0, 9)])
    zs = z0 + 0.35
    n = 22
    seq = []
    for i in range(1, n + 1):                                         # rodea el sauce por la derecha hasta quedar frente a Aminas
        u = ease(i / n)
        x = 1.25 * math.sin(math.pi * u) ** 0.8
        z = zs + (bc.STAND - zs) * u
        yaw = math.atan2(0 - x, bc.R + bc.DEP - z) * (1 - u)
        seq.append({'k': 'c', 'cam': CL.cam(x, z, yaw, 1.6 * abs(math.sin(math.pi * 3 * i / n)), 0.16 + (LOOK - 0.16) * u, i)})
    CL.add('o-c-in-c0', seq)
    for k, (name, deg) in enumerate(RING):                           # anillo: +60° = girar a la derecha
        nxt = RING[(k + 1) % 6][0]
        seq = []
        for i in range(1, 13):
            x, z, p = orbit(deg + 60 * ease(i / 12))
            seq.append({'k': 'c', 'cam': CL.cam(x, z, p, 0.8 * math.sin(math.pi * i / 12), LOOK, i)})
        CL.add(f'o-{name}-{nxt}', seq)
    for name, deg in (('c0', 0), ('c60', 60)):                       # acercarse a la mesa de las alcobas con clase
        CL.add(f'z-{name}', [{'k': 'c', 'cam': table_cam(deg, ease(i / 8), i)} for i in range(1, 9)])


# ---------------------------------------------------------------- paradas y reposo
def stop_cam(node, i=0):
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
    x, z, p = orbit(dict(RING)[node])
    return CL.cam(x, z, p, 0.0, LOOK, i)


def stop_spec(node, i):
    spec = {'k': 'c' if node.startswith('c') else 'h', 'cam': stop_cam(node, i)}
    if node in DOOR:
        spec['opens'] = {door_geometry(DOOR[node][1])[3]: door_geometry(DOOR[node][1])[4]}
    return spec


NODES = ['h0', 'h1', 'h2', 'h3', 'h4', 'r0', 'r1', 'r2', 'r3', 'r4', 'd-org', 'd-ana', 'd-fis', 'd-fisio', 'b0', 'b1', 'b2', 'b3', 'q0', 'q1', 'q2', 'q3',
         'c-in', 'c0', 'c60', 'c120', 'c180', 'c-120', 'c-60', 'cz0', 'cz60']


def build_idle():
    for node in NODES:
        CL.add(f'i-{node}', [stop_spec(node, 60 + i * 2) for i in range(IDLE_N)])


# ---------------------------------------------------------------- sprites del estado de la Cámara
ALC = {  # clave de la alcoba, grados de su parada, frascos (misiones) y cristales
    'aminas': dict(deg=0, jars=8, crys=6), 'aromaticos': dict(deg=60, jars=6, crys=5)}


def sprite_specs():
    out = {}
    for key, c in ALC.items():
        for view, cam in ((f'c{c["deg"]}', stop_cam(f'c{c["deg"]}', 60)), (f'cz{c["deg"]}', stop_cam(f'cz{c["deg"]}', 60))):
            out[(key, view, 'base')] = {'k': 'c', 'cam': cam}
            for j in range(c['jars']):
                for li, lv in enumerate(JAR_LEVELS):
                    out[(key, view, 'jar', j, li)] = {'k': 'c', 'cam': cam, 'var': dict(alcove=key, what='jar', i=j, v=lv, n=c['jars'])}
            for i in range(c['crys']):
                for st in (1, 0):
                    out[(key, view, 'cr', i, st)] = {'k': 'c', 'cam': cam, 'var': dict(alcove=key, what='crystal', i=i, v=st, n=c['crys'])}
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
        edge(stop, d, f't-{stop}-{d}')
        mv(stop, 'right' if bs.DOORS['M'][idx][0] > 0 else 'left', d, names[d])
        mv(d, 'back', stop, 'Volver al pasillo')
        nodes[d]['moves'].append({'dir': 'enter', 'clip': f'e-{d}', 'door': d[2:], 'label': 'Entrar'})
        nodes[d]['name'] = names[d]
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
    names_c = {'c0': 'Aminas', 'c60': 'Aromáticos', 'c120': 'PEP 2', 'c180': 'Portal', 'c-120': 'PEP 2', 'c-60': 'Heterociclos'}
    edge('c-in', 'c0', 'o-c-in-c0')
    mv('c-in', 'fwd', 'c0', 'Rodear el sauce')
    nodes['c-in']['moves'].append({'dir': 'back', 'exit': 'd-org', 'label': 'Salir'})
    for k, (name, deg) in enumerate(RING):
        nxt = RING[(k + 1) % 6][0]
        edge(name, nxt, f'o-{name}-{nxt}')
        mv(name, 'right', nxt, names_c[nxt])
        mv(nxt, 'left', name, names_c[name])
        nodes[name]['name'] = names_c[name]
    nodes['c180']['moves'].append({'dir': 'back', 'exit': 'd-org', 'label': 'Salir'})
    for name in ('c0', 'c60'):
        edge(name, 'cz' + name[1:], f'z-{name}')
        mv(name, 'fwd', 'cz' + name[1:], 'Acercarse a la mesa')
        mv('cz' + name[1:], 'back', name, 'Alejarse')
    return nodes, edges


def main(which):
    os.makedirs(IMG, exist_ok=True)
    os.makedirs(CACHE, exist_ok=True)
    build_hall()
    build_camara()
    build_idle()
    pool_jobs = {}
    for name, specs in CL.clips.items():
        if which == 'pasillo' and name.startswith(('c-', 'o-', 'z-')):
            continue
        if which == 'camara' and not name.startswith(('c-', 'o-', 'z-', 'i-c')):
            continue
        for i, sp in enumerate(specs):
            pool_jobs[('clip', name, i)] = sp
    if which in ('todo', 'camara'):
        for k, sp in sprite_specs().items():
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
    for name, specs in CL.clips.items():
        if ('clip', name, 0) not in results:
            continue
        frames = [results[('clip', name, i)] for i in range(len(specs))]
        total += save_sheet(name, frames)
        clips[name] = {'n': len(frames), 'ms': round(len(frames) * MS_PER_FRAME[name.split('-')[0] if not name.startswith('c-') else 'c']),
                       'ease': name.startswith(('w-', 'u-'))}
    overlay = old.get('overlay', {})
    for key, c in ALC.items():
        if ('spr', key, f'c{c["deg"]}', 'base') not in results:
            continue
        for view in (f'c{c["deg"]}', f'cz{c["deg"]}'):
            base = results[('spr', key, view, 'base')]
            variants = {('jar', j, li): results[('spr', key, view, 'jar', j, li)] for j in range(c['jars']) for li in range(len(JAR_LEVELS))}
            variants.update({('cr', i, st): results[('spr', key, view, 'cr', i, st)] for i in range(c['crys']) for st in (1, 0)})
            overlay[view] = make_overlay(view, base, variants, c)
    nodes, edges = moves()
    digest = hashlib.sha1()                                          # versión de los cuadros: cambia el ?v= de cada hoja
    for f in sorted(os.listdir(IMG)):
        digest.update(f.encode() + open(os.path.join(IMG, f), 'rb').read())
    manifest = {'v': digest.hexdigest()[:8], 'w': W, 'h': H, 'cellH': CELL_H, 'cols': COLS, 'idleMs': 280, 'idleN': IDLE_N, 'clips': clips,
                'nodes': nodes, 'edges': edges, 'overlay': overlay}
    json.dump(manifest, open(manifest_path, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('listo:', len(clips), 'tiras,', round(total / 1e6, 2), 'MB de hojas nuevas')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'todo')
