// Velociraptor cartoon (rubber hose, Fase 2 en docs/mascota/SPEC.md). Solo define cabeza, cola y colores; el resto es tools/mascots/cartoon.cjs.
'use strict';
const { cartoon, grad, inked } = require('./cartoon.cjs');
const c = { base: '#7fa36a', light: '#a3c08a', dark: '#587a4c', belly: '#efd9a8', accent: '#d98a4a', limb: '#4f6e44' };
const HEAD = 'M168 132 C166 102 190 86 216 86 C240 86 256 98 262 112 C282 114 300 124 302 140 C304 158 288 170 262 170 C236 172 200 172 186 166 C172 160 168 148 168 132 Z';

module.exports = cartoon({
  name: 'Velociraptor', colors: c,
  head: {
    top: [214, 86], eyes: [[226, 116], [250, 111]], mouth: [272, 156], mouthSize: 1.1,
    shapes: [
      { name: 'Cabeza', d: HEAD, fill: grad(220, 86, 230, 172, c.light, c.base), stroke: inked() },
      { name: 'Hocico', d: 'M252 152 C270 158 290 156 300 146 C298 160 286 170 262 170 C246 171 236 168 232 164 Z', fill: c.belly, clip: 'Cabeza' },
      { name: 'CabezaBorde', d: HEAD, stroke: inked() },
      { name: 'Nariz', ellipse: [292, 131, 2.6, 2], fill: '#2b1d14' },
      { name: 'Mejilla', ellipse: [248, 150, 8, 5], fill: '#e9937a', fillAlpha: .45 }
    ],
    behind: [{ name: 'Crestas', pivot: [180, 110], shapes: [
      { name: 'Cresta', d: 'M184 96 L174 82 L196 90 Z M172 114 L156 106 L176 106 Z M169 132 L154 130 L170 124 Z', fill: c.accent, stroke: inked(2.6) }
    ] }]
  },
  tail: { name: 'Cola', pivot: [170, 224], shapes: [
    { name: 'Puas', d: 'M150 214 L145 200 L159 209 Z M132 225 L125 213 L139 220 Z M118 239 L109 230 L122 234 Z', fill: c.accent, stroke: inked(2.4) },
    { name: 'Cola', d: 'M174 206 C150 208 128 222 116 238 C108 248 104 258 110 260 C116 262 124 252 134 246 C148 238 160 236 176 236 Z', fill: grad(140, 206, 140, 260, c.light, c.base), stroke: inked() }
  ] }
});
