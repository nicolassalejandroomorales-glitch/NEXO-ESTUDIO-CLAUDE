// Cuerpo cartoon "rubber hose" (estilo dibujos de los años 30) compartido por las 3 mascotas (docs/mascota/SPEC.md, Fase 2).
// Cada especie aporta cabeza, cola y colores; el cuerpo, las extremidades de fideo, los guantes, los zapatos, los ojos pie-cut,
// las bocas y TODAS las animaciones son iguales. Coordenadas del dibujo: 400×300, suelo en y≈292, mira a la derecha.
'use strict';
const { book } = require('./common.cjs');

const INK = '#2b1d14', GLOVE = '#fbf1dc', GLOVE_SHADE = '#e2d1b2', SHOE = '#5b3a26', SHOE_BACK = '#462c1d', SHOE_LIGHT = '#87593b';
const SCLERA = '#fbf3e0', MOUTH = '#3a1a12', TONGUE = '#c4544a';
const grad = (x1, y1, x2, y2, a, b) => ({ line: [x1, y1, x2, y2], stops: [[0, a], [1, b]] });
const inked = (w = 3.2) => ({ color: INK, width: w });

// ——— Piezas ———
function glove(shade) {
  const fill = shade ? GLOVE_SHADE : GLOVE, ink = inked(2.4);
  // Apunta hacia +x (la dirección del brazo). De atrás hacia adelante: dedos, pulgar, palma, líneas, puño.
  return [
    { name: 'Dedo1', ellipse: [21, -5, 5.2, 3.8], fill, stroke: ink },
    { name: 'Dedo2', ellipse: [22.5, 1, 5.2, 3.8], fill, stroke: ink },
    { name: 'Dedo3', ellipse: [20, 6.8, 4.6, 3.5], fill, stroke: ink },
    { name: 'Pulgar', ellipse: [11, -9.5, 3.8, 5.2], fill, stroke: ink },
    { name: 'Palma', ellipse: [12, 0, 10.5, 9.5], fill, stroke: ink },
    { name: 'Lineas', d: 'M7 -3.5 L14 -3.5 M7 0.5 L15 0.5 M7 4.5 L14 4.5', stroke: { color: INK, width: 1.5 } },
    { name: 'Puno', d: 'M-5 -8 C-2 -9.5 2 -9.5 5 -8 L5 8 C2 9.5 -2 9.5 -5 8 Z', fill, stroke: ink }
  ];
}
function shoe(back) {
  return [
    { name: 'Zapato', d: 'M-8 -4 C-6 -13 12 -15 24 -9 C35 -4 38 8 30 11 C20 14 0 14 -8 11 C-15 8 -13 0 -8 -4 Z',
      fill: back ? SHOE_BACK : grad(0, -14, 0, 13, SHOE_LIGHT, SHOE), stroke: inked() },
    ...(back ? [] : [{ name: 'Brillo', ellipse: [16, -6, 5, 2.4], fill: '#b07a52', fillAlpha: .8 }])
  ];
}
// Ojo "pie-cut": esclerótica alta, pupila negra con una cuña recortada (arriba a la derecha) y, si se pide, párpado caído.
function eye(id, cx, cy, s, lid, lidColor) {
  const px = cx + 3 * s, py = cy + 2 * s;
  return [
    { name: 'Esclera' + id, ellipse: [cx, cy, 11 * s, 15 * s], fill: SCLERA, stroke: inked(3) },
    { name: 'Pupila' + id, ellipse: [px, py, 6.6 * s, 10 * s], fill: INK },
    { name: 'Cuna' + id, d: `M${px} ${py - 1 * s} L${px + 1.5 * s} ${py - 13 * s} L${px + 9 * s} ${py - 7 * s} Z`, fill: SCLERA, clip: 'Pupila' + id },
    ...(lid ? [{ name: 'Parpado' + id, d: `M${cx - 12 * s} ${cy - 1 * s} C${cx - 12 * s} ${cy - 21 * s} ${cx + 12 * s} ${cy - 21 * s} ${cx + 12 * s} ${cy - 1 * s} Z`, fill: lidColor, stroke: inked(2.6) }] : [])
  ];
}
// Bocas (Solo "Expresion"): Sonrisa grande, Contento (cerrada) y Oh (sorpresa).
function mouths(mx, my, k = 1) {
  const P = (x, y) => `${mx + x * k} ${my + y * k}`;
  const grin = `M${P(-16, -4)} C${P(-8, 10)} ${P(12, 10)} ${P(18, -6)} C${P(13, 17)} ${P(-10, 17)} ${P(-16, -4)} Z`;
  return { name: 'Expresion', options: [
    { name: 'Sonrisa', shapes: [
      { name: 'Boca', d: grin, fill: MOUTH, stroke: inked(2.6) },
      { name: 'Lengua', ellipse: [mx + 1 * k, my + 10 * k, 7.5 * k, 4 * k], fill: TONGUE, clip: 'Boca' }
    ] },
    { name: 'Contento', shapes: [{ name: 'Labio', d: `M${P(-14, -2)} C${P(-6, 8)} ${P(10, 8)} ${P(16, -4)}`, stroke: inked(3) }] },
    { name: 'Oh', shapes: [{ name: 'BocaOh', ellipse: [mx + 1 * k, my + 5 * k, 6 * k, 8 * k], fill: MOUTH, stroke: inked(2.6) }] }
  ] };
}

// ——— Personaje completo ———
function cartoon(sp) {
  const c = sp.colors, w = sp.bodyWidth || 1;
  const X = x => 200 + (x - 200) * w;
  const BODY = `M200 162 C${X(228)} 162 ${X(241)} 186 ${X(240)} 208 C${X(239)} 233 ${X(223)} 248 200 248 C${X(177)} 248 ${X(161)} 233 ${X(160)} 208 C${X(159)} 186 ${X(172)} 162 200 162 Z`;
  const BELLY = `M${X(212)} 180 C${X(229)} 186 ${X(234)} 208 ${X(229)} 226 C${X(224)} 240 ${X(211)} 245 ${X(199)} 244 C${X(195)} 226 ${X(198)} 196 ${X(212)} 180 Z`;
  const limb = { width: 10.5, inkWidth: 3.2, color: c.limb, ink: INK };
  const leg = (name, from, to, bend, back) => ({ name, pivot: from, noodle: { ...limb, width: 11.5, to, bend, end: { name: name + 'Zapato', rotate: false, scale: 1.15, shapes: shoe(back) } } });
  const arm = (name, from, to, bend, back) => ({ name, pivot: from, behind: back, noodle: { ...limb, to, bend,
    end: { name: name + 'Guante', scale: 1.4, shapes: glove(back), slots: back ? [] : [{ name: 'RanuraMano', at: [17, 0], prop: { name: 'ObjetoMano', options: [{ name: 'Nada' }, { name: 'Libro', shapes: book(30, -2, INK, 0) }] } }] } } });
  const h = sp.head;
  return {
    name: sp.name, width: 400, height: 300, background: '#f3e6cc',
    root: {
      // Escala 1,25 desde los pies: el personaje llena mejor el cuadro.
      name: 'Personaje', pivot: [200, 290], scale: 1.25,
      parts: [
        leg('PiernaAtras', [188, 238], [184, 284], 0.06, true),
        {
          name: 'Cuerpo', pivot: [200, 248],
          shapes: [
            { name: 'Cuerpo', d: BODY, fill: grad(190, 162, 210, 248, c.light, c.base), stroke: inked() },
            { name: 'Panza', d: BELLY, fill: c.belly, clip: 'Cuerpo' },
            ...(sp.bodyExtra || []),
            { name: 'CuerpoBorde', d: BODY, stroke: inked() }
          ],
          slots: [{ name: 'RanuraCuello', at: [204, 168] }, { name: 'RanuraEspalda', at: [X(170), 196] }, { name: 'RanuraCola', at: [X(164), 226] }],
          parts: [
            arm('BrazoAtras', [X(184), 182], [X(168), 226], 0.15, true),
            ...(sp.tail ? [{ ...sp.tail, behind: true }] : []),
            {
              name: 'Cabeza', pivot: [204, 168],
              shapes: h.shapes,
              slots: [{ name: 'RanuraCabeza', at: h.top }, { name: 'RanuraCara', at: h.eyes[0] }, { name: 'Boca', at: h.mouth, prop: mouths(h.mouth[0], h.mouth[1], h.mouthSize) }],
              parts: [
                ...(h.behind || []).map(p => ({ ...p, behind: true })),
                { name: 'Ojos', pivot: [(h.eyes[0][0] + h.eyes[1][0]) / 2, h.eyes[0][1]],
                  shapes: [...eye('B', h.eyes[1][0], h.eyes[1][1], 0.86, h.lids, c.base), ...eye('A', h.eyes[0][0], h.eyes[0][1], 1, h.lids, c.base)] },
                ...(h.front || [])
              ]
            },
            arm('BrazoFrente', [X(222), 184], [X(240), 228], -0.15, false)
          ]
        },
        leg('PiernaFrente', [212, 238], [220, 286], -0.06, false)
      ]
    },
    animations: ANIMATIONS(X)
  };
}

// ——— Animaciones compartidas ———
// Baile: rebote al ritmo (100 bpm → un pulso cada 36 cuadros), con estirar/aplastar y la cabeza que llega "atrasada".
function ANIMATIONS(X) {
  const F = (x, y, bend, tilt) => ({ to: [X(x), y], bend, ...(tilt !== undefined ? { tilt } : {}) });
  const armF = F(240, 228, -0.15), armB = F(168, 226, 0.15), legF = { to: [220, 286], bend: -0.06 }, legB = { to: [184, 284], bend: 0.06 };
  return [
    { name: 'Idle', frames: 72, tracks: {
      Cuerpo: {
        scaleY: [[0, 1], [6, 0.92, 'out'], [16, 1.05], [28, 1], [36, 1], [42, 0.92, 'out'], [52, 1.05], [64, 1], [72, 1]],
        scaleX: [[0, 1], [6, 1.07, 'out'], [16, 0.97], [28, 1], [36, 1], [42, 1.07, 'out'], [52, 0.97], [64, 1], [72, 1]],
        rotation: [[0, 0], [18, 0.04], [36, 0], [54, -0.04], [72, 0]]
      },
      Cabeza: {
        rotation: [[0, 0], [10, -0.05], [24, 0.06], [36, 0], [46, 0.05], [60, -0.06], [72, 0]],
        y: [[0, 0], [8, 3], [18, -4], [30, 0], [36, 0], [44, 3], [54, -4], [66, 0], [72, 0]]
      },
      BrazoFrente: { pose: [[0, armF], [18, F(248, 214, -0.3)], [36, armF], [54, F(236, 232, -0.02)], [72, armF]] },
      BrazoAtras: { pose: [[0, armB], [18, F(172, 232, 0.02)], [36, armB], [54, F(160, 214, 0.3)], [72, armB]] },
      PiernaFrente: { pose: [[0, legF], [6, { ...legF, bend: -0.2 }, 'out'], [16, { ...legF, bend: 0.02 }], [36, legF], [42, { ...legF, bend: -0.2 }, 'out'], [52, { ...legF, bend: 0.02 }], [72, legF]] },
      PiernaAtras: { pose: [[0, legB], [6, { ...legB, bend: 0.2 }, 'out'], [16, { ...legB, bend: -0.02 }], [36, legB], [42, { ...legB, bend: 0.2 }, 'out'], [52, { ...legB, bend: -0.02 }], [72, legB]] },
      Expresion: { active: [[0, 'Sonrisa']] }
    } },
    { name: 'Parpadeo', frames: 210, tracks: { Ojos: { scaleY: [[0, 1], [170, 1], [175, 0.1, 'out'], [181, 1], [210, 1]] } } },
    // Caminar "pavoneándose": rebote fuerte, piernas en arco, brazos en contrafase. 0,67 s por ciclo.
    { name: 'Caminar', frames: 40, tracks: {
      Personaje: { y: [[0, 0], [10, -6], [20, 0], [30, -6], [40, 0]] },
      Cuerpo: { rotation: [[0, 0.06], [10, 0.03], [20, 0.06], [30, 0.03], [40, 0.06]], scaleY: [[0, 0.97], [10, 1.04], [20, 0.97], [30, 1.04], [40, 0.97]] },
      Cabeza: { rotation: [[0, -0.03], [10, 0.03], [20, -0.03], [30, 0.03], [40, -0.03]] },
      PiernaFrente: { pose: [[0, { to: [240, 284], bend: -0.04 }], [20, { to: [198, 284], bend: 0.04 }], [30, { to: [222, 266], bend: -0.32, tilt: -0.3 }], [40, { to: [240, 284], bend: -0.04 }]] },
      PiernaAtras: { pose: [[0, { to: [166, 284], bend: 0.04 }], [10, { to: [190, 266], bend: 0.32, tilt: -0.3 }], [20, { to: [210, 284], bend: -0.04 }], [40, { to: [166, 284], bend: 0.04 }]] },
      BrazoFrente: { pose: [[0, F(226, 232, 0.1)], [20, F(254, 216, -0.3)], [40, F(226, 232, 0.1)]] },
      BrazoAtras: { pose: [[0, F(184, 220, -0.2)], [20, F(160, 230, 0.2)], [40, F(184, 220, -0.2)]] },
      Expresion: { active: [[0, 'Contento']] }
    } },
    // Alcanzar: se aplasta, se estira mucho (brazo de goma hasta la estantería), toma el libro y lo baja.
    { name: 'Alcanzar', frames: 100, loop: false, tracks: {
      Personaje: { y: [[0, 0], [16, 4], [40, -10], [66, -6], [100, 0]] },
      Cuerpo: {
        scaleY: [[0, 1], [16, 0.88, 'out'], [40, 1.18], [66, 1.12], [100, 1]],
        scaleX: [[0, 1], [16, 1.1, 'out'], [40, 0.9], [66, 0.94], [100, 1]],
        rotation: [[0, 0], [40, -0.08], [66, -0.05], [100, 0]]
      },
      Cabeza: { rotation: [[0, 0], [16, 0.05], [40, -0.15], [62, -0.1], [80, 0.1], [100, 0.05]] },
      BrazoFrente: { pose: [[0, armF], [16, F(236, 232, -0.1)], [40, F(262, 92, -0.05)], [58, F(264, 90, 0.05)], [80, F(250, 196, -0.3)], [100, F(248, 200, -0.3)]] },
      BrazoAtras: { pose: [[0, armB], [16, F(172, 232, 0.05)], [40, F(158, 160, 0.25)], [70, F(166, 200, 0.2)], [100, armB]] },
      PiernaFrente: { pose: [[0, legF], [16, { ...legF, bend: -0.2 }], [40, { to: [220, 286], bend: 0, tilt: -0.25 }], [66, { to: [220, 286], bend: 0, tilt: -0.2 }], [100, legF]] },
      PiernaAtras: { pose: [[0, legB], [16, { ...legB, bend: 0.2 }], [40, { to: [184, 284], bend: 0, tilt: -0.25 }], [66, { to: [184, 284], bend: 0, tilt: -0.2 }], [100, legB]] },
      Expresion: { active: [[0, 'Sonrisa'], [30, 'Oh'], [62, 'Sonrisa']] },
      ObjetoMano: { active: [[0, 'Nada'], [58, 'Libro']] }
    } },
    // Celebrar (cuando terminas una sesión o aciertas): salta con los brazos arriba.
    { name: 'Celebrar', frames: 60, tracks: {
      Personaje: { y: [[0, 0], [8, 6, 'out'], [22, -34], [34, 0, 'in'], [40, 6, 'out'], [60, 0]] },
      Cuerpo: { scaleY: [[0, 1], [8, 0.85, 'out'], [18, 1.12], [34, 1.05], [40, 0.86, 'out'], [60, 1]], scaleX: [[0, 1], [8, 1.12, 'out'], [18, 0.92], [34, 0.96], [40, 1.1, 'out'], [60, 1]] },
      Cabeza: { rotation: [[0, 0], [22, -0.08], [40, 0.05], [60, 0]] },
      BrazoFrente: { pose: [[0, armF], [14, F(262, 118, 0.25)], [26, F(266, 112, -0.25)], [40, F(260, 124, 0.25)], [60, armF]] },
      BrazoAtras: { pose: [[0, armB], [14, F(152, 122, -0.25)], [26, F(148, 116, 0.25)], [40, F(154, 126, -0.25)], [60, armB]] },
      PiernaFrente: { pose: [[0, legF], [8, { ...legF, bend: -0.25 }], [22, { to: [228, 272], bend: -0.45, tilt: -0.3 }], [34, legF], [40, { ...legF, bend: -0.25 }], [60, legF]] },
      PiernaAtras: { pose: [[0, legB], [8, { ...legB, bend: 0.25 }], [22, { to: [178, 270], bend: 0.45, tilt: 0.3 }], [34, legB], [40, { ...legB, bend: 0.25 }], [60, legB]] },
      Expresion: { active: [[0, 'Sonrisa']] }
    } }
  ];
}

module.exports = { cartoon, INK, grad, inked };
