"""Estudio de planos de la torre = Organización (docs/update-02-organizacion/SPEC.md · Fase 1).

Como el laboratorio (build_lab_muestra.py): fondo fino 720x300 (x2) + piso y frente gruesos 360x150 (x4), por hora (día · tarde · noche).
Exporta a dist/assets/torre/estudio/:
  <hora>-vista.png   lo que se ve por el ventanal (la app le suma el clima real encima)
  <hora>-fondo.png   pared, muebles y piso (con hueco en el vidrio del ventanal)
  <hora>-frente.png  primer plano (tapa a la mascota)
  <hora>-campana.png 3 cuadros de la campana (quieta, mecida izq., mecida der.)
  estudio.json       objetos tocables, piso y animaciones
Uso:  python tools/torre-pixel/build_estudio.py            (todo, para la app)
      python tools/torre-pixel/build_estudio.py --una noche (un cuadro completo en docs/update-02-organizacion/fase1/)
"""
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lab_base import *  # noqa: F401,F403,E402
import estudio_fondo as F  # noqa: E402
import estudio_frente as R  # noqa: E402
from build_lab_muestra import AMBIENT, LAMP_K, SHAFT, TINT, light_field  # noqa: E402

OUT = ROOT / 'dist/assets/torre/estudio'
DOCS = ROOT / 'docs/update-02-organizacion/fase1'

# Coordenadas GRUESAS (360x150), las mismas de la mascota. view = parte de Organización que abre.
OBJECTS = [
    dict(id='hoy', label='Reloj: Hoy', rect=[73, 13, 99, 72], stand=[86, 124], view='hoy', say='Veamos qué toca hoy'),
    dict(id='calendario', label='Mesa de planos: Calendario', rect=[103, 78, 197, 113], stand=[150, 124], view='calendario',
         say='Desenrollo el calendario'),
    dict(id='avisos', label='Campana: Avisos', rect=[201, 8, 219, 33], stand=[210, 124], view='avisos', say='¿Sonó la campana?'),
    dict(id='pruebas', label='Corcho: Pruebas', rect=[221, 19, 271, 63], stand=[246, 124], view='pruebas', say='Las pruebas que vienen'),
    dict(id='notas', label='Balanza y libro: Notas', rect=[279, 30, 320, 113], stand=[300, 124], view='notas', say='Tus notas y cuánto necesitas'),
    dict(id='lab', label='Banco de matraces: Laboratorio', rect=[320, 54, 359, 113], stand=[336, 126], view='lab',
         say='Lo que viene en el laboratorio'),
    dict(id='fuego', label='Chimenea', rect=[9, 8, 65, 113], stand=[40, 126], view='', say='Qué rico el fuego…'),
]


def render_layers(tod):
    ctx = Ctx(2, tod)
    far, inside, lit = F.draw_far(ctx)
    floor = R.draw_front(ctx, 'floor')
    fg = R.draw_front(ctx, 'fg')
    slope, k = SHAFT[tod]
    shaft = shaft_field(inside, lit, slope, steps=300, strength=k)
    lf = light_field(ctx, FW, FH, 1)
    yy = np.mgrid[0:FH, 0:FW][0]
    floorish = (yy >= FL - 2) | ((yy >= 182) & (yy < 192))
    far.add_light(np.full((FH, FW), AMBIENT[tod], np.float32) + lf + np.where(inside, 0, shaft * np.where(floorish, 1.4, 0.55))
                  - np.clip((26 - yy) / 16, 0, 1) * 0.8)
    yc = np.mgrid[0:CH, 0:CW][0]
    front_l = lf[::2, ::2] + np.where(inside[::2, ::2], 0, shaft[::2, ::2] * 1.1)
    for cv in (floor, fg):
        cv.add_light(np.full((CH, CW), AMBIENT[tod] - 0.45, np.float32) + front_l * 0.8 - np.clip((yc - 132) / 18, 0, 1) * 0.7)
    back = far.render(1)
    back.paste(floor.render(2), (0, 0), Image.fromarray(((floor.mat != 0) * 255).astype(np.uint8)).resize((FW, FH), Image.NEAREST))
    arr = np.asarray(back, np.float32).copy()
    for (x, y, r, col, s, sq) in ctx.glows:
        glow(arr, x, y, r, col, s * LAMP_K[tod], rings=4, squash=sq)
    arr *= np.array(TINT[tod], np.float32)
    a = np.where(far.window_hole, 0, 255).astype(np.uint8)
    fondo = Image.fromarray(np.dstack([np.clip(arr, 0, 255).astype(np.uint8), a]), 'RGBA')
    farr = np.asarray(fg.render(1), np.float32).copy() * np.array(TINT[tod], np.float32)
    frente = Image.fromarray(np.dstack([np.clip(farr, 0, 255).astype(np.uint8), ((fg.mat != 0) * 255).astype(np.uint8)]), 'RGBA')
    dust = []
    r = det('dust-est', tod)
    if tod != 'noche':
        for _ in range(5000):
            x, y = r.randint(0, FW - 1), r.randint(30, FL)
            if shaft[y, x] > 0.4 and not inside[y, x]:
                dust.append([x, y])
            if len(dust) >= 44:
                break
    # luz local de la campana (para que no quede plana de noche)
    bl = float(np.clip(AMBIENT[tod] + lf[F.BELL['y'] + 10, F.BELL['x']] * 0.6, -1.5, 1.2))
    return fondo, frente, ctx, dust, bl


def view_layer(tod):
    ctx = Ctx(0, tod)
    c, inside = F.draw_view(ctx)
    arr = np.asarray(c.render(1), np.float32).copy()
    for (x, y, r, col, s, sq) in ctx.glows:
        glow(arr, x, y, r, col, s, rings=4, squash=sq)
    arr *= np.array(TINT[tod], np.float32)
    return Image.fromarray(np.dstack([np.clip(arr, 0, 255).astype(np.uint8), (inside * 255).astype(np.uint8)]), 'RGBA')


def bell_sheet(tod, light):
    frames = R.bell_frames(light)
    sheet = Image.new('RGBA', (36 * 3, 32))
    for i, c in enumerate(frames):
        rgb = np.asarray(c.render(1), np.float32) * np.array(TINT[tod], np.float32)
        img = Image.fromarray(np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), ((c.mat != 0) * 255).astype(np.uint8)]), 'RGBA')
        sheet.paste(img.resize((36, 32), Image.NEAREST), (i * 36, 0))
    return sheet


def meta():
    return {
        'w': CW, 'h': CH, 'fine': 2, 'floor': FL // 2, 'walk': [122, 144], 'home': [150, 132], 'objects': OBJECTS,
        'parallax': {'vista': 0.8, 'frente': 1.3}, 'dust': {},
        'window': {'x0': F.WIN['x0'], 'x1': F.WIN['x1'], 'y0': F.WIN['ytop'], 'y1': F.WIN['ysill']},       # finas
        'clock': F.CLOCK, 'cork': F.CORK, 'scale': {'cx': 599, 'y': 62, 'shelf': 98}, 'table': {'x0': 226, 'x1': 374, 'top': 184}, 'bell': {'x': F.BELL['x'] - 18, 'y': F.BELL['y'], 'w': 36, 'h': 32},
        'anim': {
            'fire': [[64, 211, 16], [72, 211, 22], [80, 211, 18], [86, 211, 12]],
            'candles': [[32, 133], [114, 137], [218, 173], [710, 160]],
            'lantern': [600, 50],
            'bubbles': [[668, 140], [664, 144], [672, 138], [652, 160]],
            'shrooms': [[x, FL - 1 - h] for (x, h) in [(134, 9), (402, 12), (548, 10), (634, 11), (14, 8)]],
            'flasks': [[668, 133, 9], [652, 158, 4]],
        },
    }


def full_frame(tod):
    """Un cuadro completo (vista + fondo + mascota ausente + frente) para revisar el arte."""
    fondo, frente, ctx, dust, bl = render_layers(tod)
    img = Image.new('RGBA', (FW, FH))
    img.alpha_composite(view_layer(tod))
    img.alpha_composite(fondo)
    img.alpha_composite(frente.resize((FW, FH), Image.NEAREST))
    b = bell_sheet(tod, bl).crop((0, 0, 36, 32))
    img.alpha_composite(b, (F.BELL['x'] - 18, F.BELL['y']))
    return img.convert('RGB')


def export():
    OUT.mkdir(parents=True, exist_ok=True)
    m = meta()
    for tod in TODS:
        view_layer(tod).save(OUT / f'{tod}-vista.png', optimize=True)
        fondo, frente, ctx, dust, bl = render_layers(tod)
        fondo.save(OUT / f'{tod}-fondo.png', optimize=True)
        frente.save(OUT / f'{tod}-frente.png', optimize=True)
        bell_sheet(tod, bl).save(OUT / f'{tod}-campana.png', optimize=True)
        m['dust'][tod] = dust
    (OUT / 'estudio.json').write_text(json.dumps(m, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')


if __name__ == '__main__':
    if '--una' in sys.argv:
        DOCS.mkdir(parents=True, exist_ok=True)
        tod = sys.argv[sys.argv.index('--una') + 1]
        full_frame(tod).resize((FW * 2, FH * 2), Image.NEAREST).save(DOCS / f'estudio-{tod}.png')
        print('ok')
        sys.exit()
    export()
    print('ok app')
