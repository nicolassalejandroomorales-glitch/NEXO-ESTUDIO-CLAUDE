// Piezas compartidas por las especies (docs/mascota/SPEC.md).
'use strict';
const grad = (x1, y1, x2, y2, a, b) => ({ line: [x1, y1, x2, y2], stops: [[0, a], [1, b]] });

// Libro cerrado centrado en (cx, cy), inclinado `tilt` grados. Va dentro del Solo ObjetoMano (Nada | Libro).
function book(cx, cy, line, tilt = -8) {
  const r = tilt * Math.PI / 180, cos = Math.cos(r), sin = Math.sin(r);
  const P = (x, y) => `${(cx + x * cos - y * sin).toFixed(2)} ${(cy + x * sin + y * cos).toFixed(2)}`;
  return [
    { name: 'Hojas', d: `M${P(11, -14)} L${P(14, -13)} L${P(14, 12)} L${P(11, 14)} Z`, fill: '#fbf3dc', stroke: { color: line, width: 1.5 } },
    { name: 'Tapa', d: `M${P(-13, -14)} L${P(10, -15)} C${P(12, -15)} ${P(13, -14)} ${P(13, -12)} L${P(13, 12)} C${P(13, 14)} ${P(12, 15)} ${P(10, 15)} L${P(-11, 15)} C${P(-13, 15)} ${P(-14, 14)} ${P(-14, 12)} Z`, fill: '#8e3b2e', stroke: { color: line, width: 2.2 } },
    { name: 'Lomo', d: `M${P(-14, -14)} L${P(-9, -14)} L${P(-9, 15)} L${P(-11, 15)} C${P(-13, 15)} ${P(-14, 14)} ${P(-14, 12)} Z`, fill: '#6a2a20' },
    { name: 'Banda', d: `M${P(-1, -15)} L${P(2, -15)} L${P(2, 15)} L${P(-1, 15)} Z`, fill: '#e3b04b' }
  ];
}
const bookProp = (cx, cy, line, tilt) => ({ name: 'ObjetoMano', options: [{ name: 'Nada' }, { name: 'Libro', shapes: book(cx, cy, line, tilt) }] });

module.exports = { grad, book, bookProp };
