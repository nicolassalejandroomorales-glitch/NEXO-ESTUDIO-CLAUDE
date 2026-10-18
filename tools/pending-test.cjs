// Cola de pendientes: repasos vencidos y errores abiertos por concepto, con peso de dificultad.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const window = {};
for (const name of ['knowledge', 'pending']) vm.runInNewContext(fs.readFileSync(`dist/academic/${name}.js`, 'utf8'), { window, Date, Math }, { filename: name });
const P = window.NexoAcademicPending;
const now = new Date('2026-10-18T12:00:00Z');
const day = n => new Date(now - n * 86400000).toISOString();
const ev = (conceptId, outcome, assistanceUsed = false) => ({ id: `${conceptId}:${outcome}:${assistanceUsed}`, conceptId, outcome, assistanceUsed });
const state = { academicIntelligence: {
  reviewSchedules: [
    { targetType: 'concept', targetId: 'a', dueAt: day(1) },                                   // vence hoy, bien sabido
    { targetType: 'concept', targetId: 'b', dueAt: day(9) },                                   // muy atrasado, sin evidencia
    { targetType: 'concept', targetId: 'futuro', dueAt: new Date(+now + 86400000).toISOString() }, // todavía no vence
    { targetType: 'lesson', targetId: 'x', dueAt: day(5) }                                     // no es concepto
  ],
  structuredErrors: [
    { id: 'e1', conceptId: 'c', status: 'pending', misconceptionId: 'm1' },
    { id: 'e2', conceptId: 'c', status: 'pending', candidateMisconceptionId: 'm2' },
    { id: 'e3', conceptId: 'c', status: 'resolved' },
    { id: 'e4', conceptId: 'a', status: 'pending' }
  ],
  evidence: [ev('a', 'correct'), ev('a', 'correct', false), { ...ev('a', 'correct'), id: 'a2', transfer: true }]
} };
const list = P.list(state, { now });
const by = id => list.find(i => i.conceptId === id);
assert.ok(!by('futuro'), 'un repaso futuro no es pendiente');
assert.ok(!by('x'), 'las lecciones no son conceptos');
assert.deepEqual([...by('b').reasons], ['review_due']);
assert.equal(by('c').openErrors, 2, 'los errores resueltos no cuentan');
assert.deepEqual([...by('c').misconceptionIds], ['m1', 'm2']);
assert.ok(by('a').reasons.includes('review_due') && by('a').reasons.includes('open_error'));
assert.ok(by('c').weight >= by('a').weight || by('b').weight >= by('a').weight, 'lo débil pesa más que lo sabido');
assert.equal(by('b').weight, 3, 'atrasado y sin evidencia = bicho difícil');
assert.equal(list[0].conceptId, 'c', 'ordenado por lo que más cuesta');
assert.equal(P.list({}, { now }).length, 0, 'sin datos, no hay bichos');
assert.equal(P.list(state, { now, limit: 1 }).length, 1);
console.log('OK: cola de pendientes (repasos vencidos + errores abiertos + peso).');
