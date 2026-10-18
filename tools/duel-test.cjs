// Duelo con un bicho: mano desde ejercicios reales, orden, combo, vida, pista y XP.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const window = { NexoClasses: {} };
const ctx = { window, Date, Math, JSON, Number, Array };
for (const f of fs.readdirSync('dist/classes').filter(n => /^(ana|fis|fq|org)-\d+\.js$/.test(n))) vm.runInNewContext(fs.readFileSync(`dist/classes/${f}`, 'utf8'), ctx, { filename: f });
vm.runInNewContext(fs.readFileSync('dist/game/duel.js', 'utf8'), ctx, { filename: 'duel' });
const D = window.NexoDuel;
const items = [];
for (const cls of Object.values(window.NexoClasses)) (function walk(o) {
  if (Array.isArray(o)) return o.forEach(walk);
  if (o && typeof o === 'object') { if (o.id && D.eligible(o)) items.push({ cls: cls.id, item: o }); for (const k in o) walk(o[k]); }
})(cls);
const types = {}; for (const { item } of items) types[item.type || 'choice'] = (types[item.type || 'choice'] || 0) + 1;
assert.ok(items.length > 150, 'hay ejercicios suficientes: ' + items.length);
assert.ok(types.order && types.recipe && types.choice, JSON.stringify(types));

// 1) Cada ejercicio real se puede ganar jugando el orden correcto, y la mano no empieza resuelta.
for (const { cls, item } of items) {
  let s = D.start(item, { seed: 7 });
  assert.notEqual(s.hand.map(c => c.id).join(), s.answer.join(), `${cls}:${item.id} empieza resuelto`);
  for (const id of s.answer) s = D.play(s, id).state;
  assert.equal(s.status, 'won', `${cls}:${item.id}`);
  assert.equal(s.maxCombo, s.answer.length);
}
// 2) Un orden mezclado y una carta equivocada: pierde un corazón, rompe el combo y explica.
const ord = items.find(x => x.item.type === 'order').item;
let s = D.start(ord, { seed: 3 });
const wrong = s.hand.find(c => c.id !== s.answer[0]).id;
let r = D.play(s, wrong); s = r.state;
assert.equal(s.life, 2); assert.equal(s.combo, 0); assert.equal(r.result.right, false); assert.ok(r.result.note);
r = D.play(s, s.answer[0]); s = r.state;
assert.equal(s.next, 1); assert.equal(s.hand.find(c => c.id === s.answer[0]).step, 1, 'el número aparece al jugar bien');
// 3) Repetir una carta ya jugada no hace nada; sin corazones el bicho se va.
assert.ok(D.play(s, s.answer[0]).result.ignored);
let lost = D.start(ord, { seed: 3 });
for (let i = 0; i < 3; i++) lost = D.play(lost, lost.hand.find(c => c.id !== lost.answer[0]).id).state;
assert.equal(lost.status, 'lost'); assert.ok(D.play(lost, lost.answer[0]).result.ignored);
// 4) Evidencia honesta: limpio = acierto; con errores o pista no cuenta como acierto por tu cuenta.
let clean = D.start(ord, { seed: 1 }); for (const id of clean.answer) clean = D.play(clean, id).state;
assert.equal(D.summary(clean).attempt.correct, true);
let messy = D.start(ord, { seed: 1 }); messy = D.play(messy, messy.hand.find(c => c.id !== messy.answer[0]).id).state;
for (const id of messy.answer) messy = D.play(messy, id).state;
assert.equal(messy.status, 'won'); assert.equal(D.summary(messy).attempt.correct, false);
const h = D.hint(D.start(ord, { seed: 1 })); assert.equal(h.state.hintUsed, true); assert.ok(h.text);
assert.equal(D.summary(h.state).attempt.hint, true);
// 5) XP: más por bichos difíciles; perder no da; pista o errores = mitad; combo suma hasta 30 %.
const win = { won: true, mistakes: 0, hintUsed: false, maxCombo: 1 };
assert.equal(D.xp(win, 1), 20); assert.equal(D.xp(win, 3), 60);
assert.equal(D.xp({ ...win, hintUsed: true }, 3), 30); assert.equal(D.xp({ ...win, mistakes: 1 }, 2), 20);
assert.equal(D.xp({ ...win, maxCombo: 9 }, 1), 26); assert.equal(D.xp({ won: false, lost: true, mistakes: 3, hintUsed: false, maxCombo: 2 }, 3), 0);
// 6) Un ejercicio sin forma de duelo se rechaza.
assert.throws(() => D.start({ id: 'x', type: 'write' }), /duelo/);
console.log(`OK: duelo con ${items.length} ejercicios reales (${JSON.stringify(types)}).`);
