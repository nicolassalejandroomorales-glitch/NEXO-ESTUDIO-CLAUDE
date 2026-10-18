// Director de encuentros: cuándo y cuál bicho sale, con clases reales.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const window = { NexoClasses: {} };
const ctx = { window, Date, Math, JSON, Number, Array, Object, Set, Map, WeakMap, RegExp };
const load = f => vm.runInNewContext(fs.readFileSync(`dist/${f}.js`, 'utf8'), ctx, { filename: f });
for (const f of fs.readdirSync('dist/classes').filter(n => /^(ana|fis|fq|org)-\d+\.js$/.test(n))) load(`classes/${f.slice(0, -3)}`);
['academic/knowledge', 'academic/pending', 'game/duel', 'academic/class-bridge', 'game/director'].forEach(load);
const Dir = window.NexoDirector, classes = window.NexoClasses;
const now = new Date('2026-10-18T15:00:00Z');
const ago = ms => new Date(now - ms).toISOString();
// Concepto "am.pka" de Aminas = org.pka del piloto (alias). Hay repaso vencido y un error abierto en am.fisicas.
const state = { academicIntelligence: {
  reviewSchedules: [{ targetType: 'concept', targetId: 'org.pka', dueAt: ago(3 * 86400000) }],
  structuredErrors: [{ id: 'e1', conceptId: 'org-01:am.fisicas', status: 'pending', misconceptionId: 'org-01.tertiary-donor' }], evidence: [] } };
let d = Dir.createState();

// 1) Elige el bicho más difícil con ejercicio de duelo; trae su mano real, ramo y nombre.
let enc = Dir.choose(d, { state, classes, now, seed: 5 });
assert.ok(enc, 'sale un bicho');
assert.ok(['org-01:am.fisicas', 'org.pka'].includes(enc.conceptId));
assert.equal(enc.subject, 'organica'); assert.ok(enc.name && enc.item.id && enc.weight >= 1);
assert.ok(window.NexoDuel.eligible(enc.item));
assert.ok(enc.item.type === 'order' || enc.item.type === 'recipe', 'prefiere ordenar/receta si hay');
// 2) Sin pendientes no hay bicho.
assert.equal(Dir.choose(d, { state: {}, classes, now }), null);
// 3) Un duelo gasta el gap: 10 min sin bichos, "ahora no" lo acorta a 5; después puede salir otra vez.
d = Dir.register(d, enc, 40, now);
assert.equal(Dir.choose(d, { state, classes, now: new Date(+now + 9 * 60000) }), null);
assert.ok(Dir.choose(d, { state, classes, now: new Date(+now + 10 * 60000), seed: 9 }));
let z = Dir.snooze(Dir.createState(), now);
assert.equal(Dir.canAppear(z, new Date(+now + 4 * 60000)), false);
assert.equal(Dir.canAppear(z, new Date(+now + 5 * 60000)), true);
// 4) Tope diario de XP: no se puede farmear; al día siguiente vuelve.
let capped = Dir.createState();
for (let i = 0; i < 4; i++) capped = Dir.register(capped, enc, 100, new Date(+now - 86400000 * 0 - i));
assert.equal(capped.day.xp, Dir.DAILY_XP);
assert.equal(Dir.choose(capped, { state, classes, now: new Date(+now + 3600000), seed: 1 }), null);
assert.ok(Dir.choose(capped, { state, classes, now: new Date(+now + 86400000), seed: 1 }));
// 5) No repite el mismo ejercicio antes de 3 días.
const only = { ...state, academicIntelligence: { ...state.academicIntelligence, structuredErrors: [], reviewSchedules: [{ targetType: 'concept', targetId: 'org-01:am.sales', dueAt: ago(86400000) }] } };
const first = Dir.choose(Dir.createState(), { state: only, classes, now, seed: 2 });
const withSeen = Dir.register(Dir.createState(), first, 0, new Date(+now - 86400000));
const again = Dir.choose(withSeen, { state: only, classes, now, seed: 2 });
assert.ok(!again || again.item.id !== first.item.id, 'no repite pronto');
// 6) Un pendiente sin ejercicio de duelo se salta y sale el siguiente; qué clases cargar.
const mixed = { academicIntelligence: { reviewSchedules: [{ targetType: 'concept', targetId: 'no-existe', dueAt: ago(9 * 86400000) }, { targetType: 'concept', targetId: 'org.pka', dueAt: ago(86400000) }], structuredErrors: [], evidence: [] } };
assert.equal(Dir.choose(Dir.createState(), { state: mixed, classes, now, seed: 3 }).conceptId, 'org.pka');
const pend = window.NexoAcademicPending.list(mixed, { now });
assert.ok(Dir.classIdsFor(pend).includes('org-01'), 'org.pka pertenece a la clase org-01 (alias)');
// 7) Cada clase tiene bichos reales: al menos un concepto por clase con ejercicio de duelo.
for (const [id, cls] of Object.entries(classes)) {
  const concepts = cls.concepts.filter(c => c.mission).map(c => window.NexoAcademicBridge.conceptOf(cls, c.id));
  const fake = { academicIntelligence: { reviewSchedules: concepts.map(c => ({ targetType: 'concept', targetId: c, dueAt: ago(86400000) })), structuredErrors: [], evidence: [] } };
  assert.ok(Dir.choose(Dir.createState(), { state: fake, classes: { [id]: cls }, now, seed: 1 }), `la clase ${id} no tiene bichos`);
}
console.log('OK: director (gap, snooze, tope diario, sin repetir, todas las clases con bichos).');
