// Zorro cartoon (rubber hose, Fase 2 en docs/mascota/SPEC.md). Solo define cabeza, cola y colores; el resto es tools/mascots/cartoon.cjs.
'use strict';
const { cartoon, grad, inked } = require('./cartoon.cjs');
const c = { base: '#d9773a', light: '#eb9655', dark: '#a8552a', belly: '#f3e4c8', limb: '#3b2620', white: '#f4e6cc', tip: '#3b2620' };
const HEAD = 'M170 136 C168 106 190 88 218 88 C244 88 260 102 266 118 L292 134 C298 138 296 146 288 146 C274 148 266 156 256 164 C238 176 206 176 188 168 C172 160 170 148 170 136 Z';
const TAIL = 'M174 222 C144 228 116 216 108 192 C102 172 112 152 128 148 C124 172 140 198 176 208 Z';
// Oreja con la punta oscura (degradado con corte duro).
const earFill = (top, bottom) => ({ line: [0, top, 0, bottom], stops: [[0, c.tip], [0.36, c.tip], [0.4, c.base], [1, c.base]] });

module.exports = cartoon({
  name: 'Zorro', colors: c,
  head: {
    top: [218, 88], eyes: [[228, 120], [250, 115]], mouth: [266, 158], mouthSize: 0.9,
    shapes: [
      { name: 'Cabeza', d: HEAD, fill: grad(218, 88, 224, 176, c.light, c.base), stroke: inked() },
      { name: 'Mejillas', d: 'M206 150 C230 154 262 150 288 146 C276 152 266 158 256 164 C238 176 206 176 188 168 L182 160 L192 158 L186 150 Z', fill: c.white, clip: 'Cabeza' },
      { name: 'CabezaBorde', d: HEAD, stroke: inked() },
      { name: 'Nariz', ellipse: [292, 138, 4.5, 3.8], fill: '#2b1d14' },
      { name: 'Mejilla', ellipse: [246, 146, 8, 5], fill: '#f08a7e', fillAlpha: .4 }
    ],
    behind: [{ name: 'Orejas', pivot: [214, 88], shapes: [
      { name: 'OrejaLejos', d: 'M186 96 C182 76 182 56 186 42 C200 52 212 70 214 86 Z', fill: earFill(42, 96), stroke: inked(2.8) },
      { name: 'OrejaDentro', d: 'M220 86 C224 70 230 58 236 50 C241 62 242 76 240 88 Z', fill: c.white },
      { name: 'Oreja', d: 'M214 88 C220 68 228 52 238 40 C246 56 248 76 244 94 Z', fill: earFill(40, 94), stroke: inked(2.8) }
    ] }]
  },
  tail: { name: 'Cola', pivot: [170, 214], shapes: [
    { name: 'Cola', d: TAIL, fill: grad(130, 148, 150, 226, c.light, c.base), stroke: inked() },
    { name: 'Punta', d: 'M108 192 C102 172 112 152 128 148 C126 158 126 166 128 174 L118 170 L120 184 L110 182 Z', fill: c.white, clip: 'Cola' },
    { name: 'ColaBorde', d: TAIL, stroke: inked() }
  ] }
});
