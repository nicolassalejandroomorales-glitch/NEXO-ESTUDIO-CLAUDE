'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
globalThis.FSRS = require('../dist/vendor/fsrs/index.umd.js');
const E = require('../dist/study/engine.js');
const T0 = new Date('2026-10-17T18:00:00Z');
const T1 = new Date('2026-10-18T18:01:00Z');
function activeItem(state) { return E.byId[state.session.current.itemId]; }
function answer(state, { correct = true, hint = false, now = T0, wrongReason = false } = {}) {
  const item = activeItem(state);
  const values = Object.fromEntries(item.fields.map(field => [field.key, field.correct]));
  if (!correct) values.answer = item.fields[0].options.find(o => o.id !== item.fields[0].correct).id;
  if (wrongReason) values.reason = item.fields[1].options.find(o => o.id !== item.fields[1].correct).id;
  state = E.setDraft(state, { answers: values, note: 'Mi razonamiento se conserva sin calificación automática.', confidence: 'high' }, now);
  if (hint) state = E.help(state, 'hint', now);
  return E.submit(state, now);
}
test('el banco tiene 33 actividades, claves únicas y criterios resolubles', () => {
  assert.equal(E.bank.activities.length, 33);
  assert.equal(new Set(E.bank.activities.map(i => i.id)).size, 33);
  for (const item of E.bank.activities) {
    for (const field of item.fields) assert.equal(field.options.filter(o => o.id === field.correct).length, 1);
    assert.ok(E.skillById[item.skill]);
  }
});
test('diagnóstico completo: seis habilidades distintas, seis intentos y cierre finito', () => {
  let state = E.start(E.createState(T0), 'diagnostic', 8, T0);
  const skills = [];
  for (let i = 0; i < 6; i++) { skills.push(activeItem(state).skill); state = answer(state); state = E.next(state, T0); }
  assert.equal(new Set(skills).size, 6);
  assert.equal(state.attempts.length, 6);
  assert.equal(state.session.status, 'complete');
  assert.equal(state.sessions.length, 1);
});
test('un acierto asistido no acredita autonomía y provoca otra variante pertinente', () => {
  let state = E.start(E.createState(T0), 'practice', 5, T0, 'resonance');
  const first = activeItem(state);
  state = answer(state, { hint: true });
  assert.equal(E.skillEvidence(state, 'resonance', T0).independent, 0);
  assert.equal(E.skillEvidence(state, 'resonance', T0).status, 'Resuelto con ayuda');
  state = E.next(state, T0);
  assert.equal(activeItem(state).skill, first.skill);
  assert.notEqual(activeItem(state).id, first.id);
  assert.match(state.session.current.why, /con ayuda/);
});
test('decisión correcta y motivo erróneo se conservan como acierto parcial', () => {
  let state = E.start(E.createState(T0), 'practice', 5, T0);
  state = answer(state, { wrongReason: true });
  assert.equal(state.attempts[0].correct, false);
  assert.equal(state.attempts[0].partial, true);
  assert.equal(state.attempts[0].firstError, 'reason');
  assert.equal(state.attempts[0].diagnosis.certainty, 'limited');
});
test('tras un error se elige otro ejercicio de esa habilidad sin saltar a dificultad mayor', () => {
  let state = E.start(E.createState(T0), 'practice', 5, T0, 'pka');
  const item = activeItem(state);
  state = answer(state, { correct: false });
  state = E.next(state, T0);
  assert.equal(activeItem(state).skill, item.skill);
  assert.notEqual(activeItem(state).id, item.id);
  assert.ok(activeItem(state).level <= 2);
  assert.match(state.session.current.why, /punto por revisar/);
});
test('dos errores activan una comprobación del requisito previo que falta', () => {
  let state = E.start(E.createState(T0), 'practice', 5, T0, 'hofmann');
  state = E.next(answer(state, { correct: false }), T0);
  state = E.next(answer(state, { correct: false }), T0);
  assert.equal(activeItem(state).skill, 'alkylation');
  assert.match(state.session.current.why, /dos dificultades/);
});
test('subir exigencia requiere aciertos independientes y respeta el máximo', () => {
  let state = E.start(E.createState(T0), 'practice', 5, T0, 'pair');
  state = E.next(answer(state), T0);
  state = E.next(answer(state), T0);
  assert.equal(activeItem(state).level, 3);
  assert.equal(E.skillEvidence(state, 'pair', T0).retained, false);
});
test('reenvío de la respuesta no duplica intento ni actualización FSRS', () => {
  const once = answer(E.start(E.createState(T0), 'practice', 5, T0));
  const twice = E.submit(once, T1);
  assert.deepEqual(twice, once);
  assert.equal(twice.attempts.length, 1);
});
test('no se avanza sin responder todos los criterios', () => {
  const state = E.start(E.createState(T0), 'practice', 5, T0);
  assert.throws(() => E.submit(state, T0), /Responde/);
  assert.throws(() => E.next(state, T0), /Comprueba/);
  assert.equal(state.attempts.length, 0);
});
test('repasos: los futuros no se tratan como vencidos y no hay bucle vacío', () => {
  let state = answer(E.start(E.createState(T0), 'practice', 1, T0));
  state = E.next(state, T0);
  assert.equal(E.reviewInfo(state, T0).due, 0);
  state = E.start(state, 'reviews', 5, T0);
  assert.equal(state.session.status, 'complete');
  assert.equal(state.session.current, null);
});
test('repaso vencido aparece y no se repite dentro de la misma sesión', () => {
  let state = E.next(answer(E.start(E.createState(T0), 'practice', 1, T0)), T0);
  const due = new Date(Object.values(state.cards)[0].due);
  assert.equal(E.reviewInfo(state, due).due, 1);
  state = E.start(state, 'reviews', 5, due);
  const id = activeItem(state).id;
  state = E.next(answer(state, { now: due }), due);
  assert.equal(state.session.status, 'complete');
  assert.equal(state.attempts.filter(a => a.itemId === id).length, 2);
});
test('retención exige otro día y otra familia: el mismo ejemplo repetido no basta', () => {
  let state = answer(E.start(E.createState(T0), 'practice', 1, T0, 'pair'));
  const first = state.attempts[0];
  state = E.stop(state, T0);
  state = E.start(state, 'practice', 1, T1, 'pair');
  assert.notEqual(activeItem(state).family, first.family);
  state = answer(state, { now: T1 });
  assert.equal(E.skillEvidence(state, 'pair', T1).retained, true);
  const repeated = { ...first, id: 'repeated', at: T1.toISOString() };
  const sameOnly = { ...state, attempts: [first, repeated] };
  assert.equal(E.skillEvidence(sameOnly, 'pair', T1).retained, false);
});
test('tres aciertos el mismo día no se convierten en retención', () => {
  let state = E.start(E.createState(T0), 'practice', 3, T0, 'pair');
  for (let i = 0; i < 3; i++) state = E.next(answer(state), T0);
  assert.equal(E.skillEvidence(state, 'pair', T0).retained, false);
  assert.equal(E.skillEvidence(state, 'pair', T0).status, 'Autónomo en variantes');
});
test('un fallo actual deja visible la dificultad aunque haya retención histórica', () => {
  let state = E.stop(answer(E.start(E.createState(T0), 'practice', 1, T0, 'pair')), T0);
  state = E.stop(answer(E.start(state, 'practice', 1, T1, 'pair'), { now: T1 }), T1);
  assert.equal(E.skillEvidence(state, 'pair', T1).retained, true);
  state = answer(E.start(state, 'practice', 1, T1, 'pair'), { correct: false, now: T1 });
  assert.equal(E.skillEvidence(state, 'pair', T1).status, 'En práctica');
});
test('confianza y texto libre nunca sustituyen la corrección química', () => {
  const state = answer(E.start(E.createState(T0), 'practice', 1, T0), { correct: false });
  assert.equal(state.attempts[0].confidence, 'high');
  assert.equal(state.attempts[0].correct, false);
  assert.ok(state.attempts[0].note.length > 20);
});
test('no iniciar otra sesión encima de un borrador y detener no fabrica un intento', () => {
  const state = E.start(E.createState(T0), 'practice', 5, T0);
  assert.throws(() => E.start(state, 'diagnostic', 6, T0), /sesión activa/);
  const stopped = E.stop(state, T0);
  assert.equal(stopped.attempts.length, 0);
  assert.equal(stopped.sessions[0].attempted, 0);
  assert.equal(E.stop(stopped, T0).sessions.length, 1);
});

test('puente: cada actividad del banco existe como ejercicio del motor académico', () => {
  const fs = require('node:fs'), vm = require('node:vm');
  const window = {};
  vm.runInNewContext(fs.readFileSync('dist/academic/model.js', 'utf8'), { window });
  const model = window.NexoAcademicModel;
  assert.equal(model.validate(), true);
  for (const item of E.bank.activities) {
    const exercise = model.byId(model.exercises, `org-01:study-${item.id}`);
    assert.ok(exercise, item.id);
    assert.equal(exercise.validator, 'study_bank');
  }
});
