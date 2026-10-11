// Capibara cartoon (rubber hose, Fase 2 en docs/mascota/SPEC.md). Solo define cabeza y colores; el resto es tools/mascots/cartoon.cjs.
'use strict';
const { cartoon, grad, inked } = require('./cartoon.cjs');
const c = { base: '#a8774f', light: '#c4946a', dark: '#7d5536', belly: '#caa077', muzzle: '#7a5139', limb: '#6e4a30', leaf: '#86a85a', leafDark: '#4f7139' };
const HEAD = 'M170 138 C168 106 190 88 220 88 C250 88 270 100 276 120 C282 136 282 156 272 166 C260 176 236 176 212 174 C188 172 172 160 170 138 Z';

module.exports = cartoon({
  name: 'Capibara', colors: c, bodyWidth: 1.14,
  head: {
    top: [222, 88], eyes: [[230, 124], [250, 120]], mouth: [262, 162], mouthSize: 0.75, lids: true,
    shapes: [
      { name: 'Cabeza', d: HEAD, fill: grad(220, 88, 226, 176, c.light, c.base), stroke: inked() },
      { name: 'Hocico', ellipse: [262, 140, 21, 24], fill: grad(262, 116, 262, 164, '#8d6045', c.muzzle), clip: 'Cabeza' },
      { name: 'CabezaBorde', d: HEAD, stroke: inked() },
      { name: 'Narinas', d: 'M274 124 C276 127 276 130 274 132 M266 122 C268 125 268 128 266 130', stroke: inked(2.4) },
      { name: 'Mejilla', ellipse: [240, 152, 8, 5], fill: '#e48a7a', fillAlpha: .35 }
    ],
    behind: [{ name: 'Orejas', pivot: [202, 94], shapes: [
      { name: 'OrejaLejos', ellipse: [214, 90, 9, 8], fill: c.dark, stroke: inked(2.6) },
      { name: 'Oreja', ellipse: [192, 96, 10, 9], fill: c.base, stroke: inked(2.6) }
    ] }],
    front: [{ name: 'Brote', pivot: [221, 89], shapes: [
      { name: 'Hoja1', d: 'M220 71 C212 61 200 61 198 67 C204 73 214 74 220 71 Z', fill: c.leaf, stroke: { color: c.leafDark, width: 2 } },
      { name: 'Hoja2', d: 'M221 70 C228 59 241 60 242 66 C235 72 226 73 221 70 Z', fill: c.leaf, stroke: { color: c.leafDark, width: 2 } },
      { name: 'Tallo', d: 'M220 90 C220 83 220 77 221 70', stroke: { color: c.leafDark, width: 2.6 } }
    ] }]
  }
});
