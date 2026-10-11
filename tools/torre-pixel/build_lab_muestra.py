"""Muestra de calidad nueva: Laboratorio de Orgánica II (docs/mundo-torre/SPEC.md · Fase 2).

Arma la capa lejana fina (lab_fondo.py, 720x300 → x2) con la capa media/frente gruesa (lab_frente.py, 360x150 → x4),
le suma la luz (velas, faroles, hongos, haz de la ventana) y exporta:
  docs/mundo-torre/muestra-lab-estados.png   3 estados de progreso x 3 luces (día · atardecer · noche)
  docs/mundo-torre/antes-ahora-lab.png       sala de prácticas v1 vs laboratorio nuevo (completo, de día)
Uso:  python tools/torre-pixel/build_lab_muestra.py
      python tools/torre-pixel/build_lab_muestra.py --una dia 2     (un cuadro: hora y estado 0/1/2)
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lab_base import *  # noqa: F401,F403,E402
import lab_fondo  # noqa: E402
import lab_frente  # noqa: E402

AMBIENT = {'dia': 0.35, 'tarde': -0.35, 'noche': -1.75}
LAMP_K = {'dia': 0.75, 'tarde': 1.0, 'noche': 1.35}
SHAFT = {'dia': (0.62, 1.5), 'tarde': (1.25, 1.2), 'noche': (0.5, 0.35)}
TINT = {'dia': (1.0, 1.0, 0.98), 'tarde': (1.06, 0.94, 0.86), 'noche': (0.78, 0.84, 1.06)}


def light_field(ctx, w, h, scale):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    f = np.zeros((h, w), np.float32)
    for (x, y, r, s, sq) in ctx.lights:
        d = np.hypot(xx - x / scale, (yy - y / scale) * sq)
        f += np.clip(1 - d / (r / scale), 0, 1) ** 1.6 * s * LAMP_K[ctx.tod]
    return f


def frame(tod, p):
    ctx = Ctx(p, tod)
    far, inside, lit = lab_fondo.draw_far(ctx)
    front = lab_frente.draw_front(ctx)
    # luz: ambiente + lámparas + haz de la ventana (en la fina) y lo mismo, reducido, en la gruesa
    slope, k = SHAFT[tod]
    shaft = shaft_field(inside, lit, slope, steps=300, strength=k)
    lf = light_field(ctx, FW, FH, 1)
    yy, xx = np.mgrid[0:FH, 0:FW]
    floorish = (yy >= FL - 2) | ((yy >= 176) & (yy < 182))
    far.add_light(np.full((FH, FW), AMBIENT[tod], np.float32) + lf
                  + np.where(inside, 0, shaft * np.where(floorish, 1.4, 0.55))
                  - np.clip((26 - yy) / 16, 0, 1) * 0.8)
    front_l = lf[::2, ::2] + np.where(inside[::2, ::2], 0, shaft[::2, ::2] * 1.1)
    yc = np.mgrid[0:CH, 0:CW][0]
    front.add_light(np.full((CH, CW), AMBIENT[tod] - 0.45, np.float32) + front_l * 0.8
                    - np.clip((yc - 132) / 18, 0, 1) * 0.7)     # el primer plano queda un poco en sombra: da profundidad
    far_img = far.render(2)
    front_img = front.render(4)
    alpha = Image.fromarray(((front.mat != 0) * 255).astype(np.uint8)).resize((CW * 4, CH * 4), Image.NEAREST)
    far_img.paste(front_img, (0, 0), alpha)
    arr = np.asarray(far_img, np.float32).copy()
    for (x, y, r, col, s, sq) in ctx.glows:
        sub = np.zeros_like(arr)
        glow(sub, x * 2, y * 2, r * 2, col, s * LAMP_K[tod], rings=4, squash=sq)
        arr += sub
    if tod != 'noche':                                            # polvo flotando en el haz
        r = det('dust', tod)
        for _ in range(140):
            x, y = r.randint(0, FW - 1), r.randint(30, FL)
            if shaft[y, x] > 0.35 and not inside[y, x]:
                arr[y * 2:y * 2 + 2, x * 2:x * 2 + 2] = np.array(hexes('#fff0b0')[0], np.float32) * (0.75 + 0.25 * shaft[y, x])
    arr *= np.array(TINT[tod], np.float32)
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGB')


LAB_OUT = ROOT / 'dist/assets/torre/lab'
OBJECTS = [   # coordenadas gruesas (360x150), las mismas de la mascota
    dict(id='topic', label='Estantería de temas', rect=[2, 8, 78, 113], stand=[40, 124], action='mode', mode='topic',
         say='Elige un tema de la estantería'),
    dict(id='course', label='Póster de grupos funcionales', rect=[82, 22, 116, 113], stand=[99, 124], action='mode', mode='course',
         say='Todo el curso, mezclado'),
    dict(id='reviews', label='Jardinera: tus repasos', rect=[118, 16, 203, 104], stand=[160, 126], action='mode', mode='reviews',
         say='Cada planta es un tema: si se marchita, toca repasar'),
    dict(id='recommended', label='Destilación: lo que más necesito', rect=[205, 7, 284, 113], stand=[244, 124], action='mode',
         mode='recommended', say='Te preparo lo que más necesitas'),
    dict(id='pep', label='Pizarra: nivel PEP', rect=[289, 20, 356, 52], stand=[322, 124], action='mode', mode='pep',
         say='Preguntas nivel PEP'),
    dict(id='errors', label='Frascos del bestiario', rect=[287, 52, 358, 113], stand=[322, 126], action='mode', mode='errors',
         say='Tus errores capturados en frascos'),
]


def layers(tod, p):
    """Capas para la app: fondo (720x300, con hueco en la ventana) · frente (360x150 con transparencia)."""
    ctx = Ctx(p, tod)
    far, inside, lit = lab_fondo.draw_far(ctx)
    floor = lab_frente.draw_front(ctx, 'floor')
    fg = lab_frente.draw_front(ctx, 'fg')
    slope, k = SHAFT[tod]
    shaft = shaft_field(inside, lit, slope, steps=300, strength=k)
    lf = light_field(ctx, FW, FH, 1)
    yy = np.mgrid[0:FH, 0:FW][0]
    floorish = (yy >= FL - 2) | ((yy >= 176) & (yy < 182))
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
    r = det('dust-app', tod)
    if tod != 'noche':
        for _ in range(4000):
            x, y = r.randint(0, FW - 1), r.randint(30, FL)
            if shaft[y, x] > 0.4 and not inside[y, x]:
                dust.append([x, y])
            if len(dust) >= 40:
                break
    return fondo, frente, ctx, dust


def view_layer(tod):
    ctx = Ctx(0, tod)
    c = Canvas(FW, FH)
    lab_fondo.draw_window(ctx, c, view_only=True)
    arr = np.asarray(c.render(1), np.float32).copy()
    for (x, y, r, col, s, sq) in ctx.glows:
        glow(arr, x, y, r, col, s, rings=4, squash=sq)
    arr *= np.array(TINT[tod], np.float32)
    m = lab_fondo.window_inside(c, 40)
    return Image.fromarray(np.dstack([np.clip(arr, 0, 255).astype(np.uint8), (m * 255).astype(np.uint8)]), 'RGBA')


def export_app():
    import json
    LAB_OUT.mkdir(parents=True, exist_ok=True)
    meta = {'w': CW, 'h': CH, 'fine': 2, 'floor': FL // 2, 'walk': [122, 144], 'home': [160, 132], 'objects': OBJECTS,
            'parallax': {'vista': 0.8, 'frente': 1.3}, 'dust': {}, 'lit': [1, 2, 3],
            'anim': {'bubbles': [[444, 172], [452, 176], [458, 168], [448, 166]], 'drips': [[512, 151, 165]],
                     'lanterns': [[412, 30], [196, 32], [640, 30]], 'candles': [[701, 176]], 'frontCandle': [11, 100],
                     'shrooms': [[x, FL - 1 - h] for (x, h, cw) in [(262, 12, 7), (380, 13, 8), (16, 8, 5), (708, 10, 6)]]}}
    for tod in TODS:
        view_layer(tod).save(LAB_OUT / f'{tod}-vista.png', optimize=True)
        for p in range(3):
            fondo, frente, ctx, dust = layers(tod, p)
            fondo.save(LAB_OUT / f'{tod}-{p}-fondo.png', optimize=True)
            frente.save(LAB_OUT / f'{tod}-{p}-frente.png', optimize=True)
            meta['dust'][tod] = dust
    (LAB_OUT / 'lab.json').write_text(json.dumps(meta, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')


def label(img, text):
    text = text.translate(str.maketrans('ÁÉÍÓÚáéíóú', 'AEIOUaeiou'))     # la fuente por defecto no tiene tildes
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, 8 + 7 * len(text), 18), fill=(20, 12, 16))
    d.text((5, 3), text, fill=(251, 224, 138))
    return img


if __name__ == '__main__':
    OUT_DOCS.mkdir(parents=True, exist_ok=True)
    if '--app' in sys.argv:
        export_app()
        print('ok app')
        sys.exit()
    if '--una' in sys.argv:
        i = sys.argv.index('--una')
        tod, p = sys.argv[i + 1], int(sys.argv[i + 2])
        frame(tod, p).save(OUT_DOCS / f'muestra-lab-{tod}-{p}.png')
        print('ok')
        sys.exit()
    tw, th = 720, 300
    grid = Image.new('RGB', (tw * 3 + 40, th * 3 + 40), (16, 23, 26))
    best = None
    for j, p in enumerate(range(3)):
        for i, tod in enumerate(TODS):
            f = frame(tod, p)
            if (tod, p) == ('dia', 2):
                best = f
            grid.paste(label(f.resize((tw, th), Image.NEAREST), f'{STATE_NAME[p]} · {TOD_NAME[tod]}'), (10 + i * (tw + 10), 10 + j * (th + 10)))
    grid.save(OUT_DOCS / 'muestra-lab-estados.png', optimize=True)
    old = Image.open(ROOT / 'dist/assets/torre/mundo.png').crop((0, 0, 360, 150)).resize((1440, 600), Image.NEAREST)
    both = Image.new('RGB', (1440, 1220), (16, 23, 26))
    both.paste(label(old, 'ANTES · sala de prácticas v1'), (0, 0))
    both.paste(label(best, 'AHORA · laboratorio de Orgánica II (completo, de día)'), (0, 620))
    both.resize((1080, 915), Image.NEAREST).save(OUT_DOCS / 'antes-ahora-lab.png', optimize=True)
    print('ok')
