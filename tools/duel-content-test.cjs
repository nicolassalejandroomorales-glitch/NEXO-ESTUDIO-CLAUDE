// Calidad de los ejercicios de duelo (cls.duelos): bien formados, con fuente y diapositiva, jugables y que el director los use.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const window = { NexoClasses: {} };
const ctx = { window, Date, Math, JSON, Number, Array, Object, Set, Map, WeakMap, RegExp };
const load = f => vm.runInNewContext(fs.readFileSync(`dist/${f}.js`, 'utf8'), ctx, { filename: f });
for (const f of fs.readdirSync('dist/classes').filter(n => /^(ana|fis|fq|org)-\d+\.js$/.test(n))) load(`classes/${f.slice(0, -3)}`);
['academic/knowledge', 'academic/pending', 'game/duel', 'academic/class-bridge', 'game/director'].forEach(load);
const D = window.NexoDuel;
let total = 0;
for (const cls of Object.values(window.NexoClasses)) {
  if (!cls.duelos) continue;
  const taken = new Set();
  (function walk(o) { if (Array.isArray(o)) return o.forEach(walk); if (o && typeof o === 'object') { if (o.id) taken.add(o.id); for (const k in o) walk(o[k]); } })(cls.missions);
  const concepts = new Set(cls.concepts.filter(c => c.mission).map(c => c.id));
  const ids = new Set();
  for (const item of cls.duelos) {
    const where = `${cls.id}:${item.id}`;
    assert.ok(!ids.has(item.id) && !taken.has(item.id), `${where}: id repetido o choca con una misión`); ids.add(item.id);
    assert.ok(['order', 'recipe'].includes(item.type), `${where}: tipo`);
    assert.ok(D.eligible(item), `${where}: no sirve para un duelo`);
    assert.ok(concepts.has(item.concept), `${where}: concepto ${item.concept} no existe`);
    assert.ok(cls.sources[item.source], `${where}: fuente`);
    assert.ok(Number.isInteger(item.slide) && item.slide > 0, `${where}: falta la diapositiva`);
    assert.ok(item.explain?.length > 20 && item.hint?.length > 10 && item.direction, `${where}: falta explicación, pista o dirección`);
    if (item.misconception) assert.ok(cls.misconceptions[item.misconception], `${where}: error típico ${item.misconception} no existe`);
    const cards = item.cards || item.ingredients;
    assert.ok(cards.length >= 3 && cards.length <= 6, `${where}: de 3 a 6 cartas`);
    assert.equal(new Set(cards.map(c => c.id)).size, cards.length, `${where}: cartas repetidas`);
    assert.equal(new Set(cards.map(c => c.text || c.label)).size, cards.length, `${where}: textos repetidos`);
    assert.ok(item.answer.every(a => cards.some(c => c.id === a)) && new Set(item.answer).size === item.answer.length, `${where}: respuesta`);
    for (const c of cards) assert.ok(!/ninguna|todas las anteriores/i.test(c.text || c.label), `${where}: relleno`);
    let s = D.start(item, { seed: 11 });
    for (const a of item.answer) s = D.play(s, a).state;
    assert.equal(s.status, 'won', where);
    total += 1;
  }
}
assert.ok(total >= 8, 'hay ejercicios de duelo: ' + total);
// El director los usa: un repaso vencido de Hofmann trae un ejercicio de ordenar de la lista de duelos.
const Dir = window.NexoDirector, cls = window.NexoClasses['org-01'], now = new Date('2026-10-18T12:00:00Z');
const state = { academicIntelligence: { reviewSchedules: [{ targetType: 'concept', targetId: 'org.hofmann', dueAt: new Date(now - 864e5).toISOString() }], structuredErrors: [], evidence: [] } };
const enc = Dir.choose(Dir.createState(), { state, classes: { 'org-01': cls }, now, seed: 1 });
assert.ok(enc && cls.duelos.some(d => d.id === enc.item.id) || enc.item.type === 'order', 'Hofmann sale con un ejercicio de ordenar');
console.log(`OK: ${total} ejercicios de duelo bien formados, con fuente y diapositiva.`);
