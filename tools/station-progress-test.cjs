// Contrato de continuidad de la estación: mismo almacén, variantes y resultado durable.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { test } = require('node:test');
function fixture(initial) {
  let state = initial || { meta: { keep: true }, events: [{ id: 'previo' }], classSessions: {} }, disk, time = 100000;
  const window = {}, ctx = vm.createContext({ window, URL, Date, document: { currentScript: { src: 'https://nexo.test/classes/estacion.js' } } });
  for (const name of ['player', 'estacion']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist/classes', name + '.js'), 'utf8'), ctx);
  const api = { getState: () => state, saveState() { disk = JSON.stringify(state); }, flushState() {} };
  const cls = { id: 'org-01' };
  return { get state() { return state; }, get disk() { return disk; }, setTime(t) { time = t; },
    open: (mission = 'm4', only) => window.NexoStation.progressFor({ cls, mission, only, api, now: () => time }) };
}
const item = () => ({ id: 'gen:basicidad:5:seed', type: 'order', concept: 'am.orden',
  source: 'ppt-aminas', slide: 12, gen: { id: 'basicidad', level: 5 }, cards: [{ id: 'a' }, { id: 'b' }], answer: ['b', 'a'] });
test('Restaurar fase, pretest, pregunta de Clase y selección parcial sin alterar otros datos', () => {
  const a = fixture(), p = a.open();
  Object.assign(p.state, { step: 2, classIndex: 1, adivinaOk: true });
  Object.assign(p.task('class:q1'), { done: true, choice: 1, correct: false, order: [2, 0, 1] });
  p.task('practice', item).picked = ['b']; p.save();
  const b = fixture(JSON.parse(a.disk)), restored = b.open();
  assert.equal(restored.state.step, 2); assert.equal(restored.state.classIndex, 1); assert.equal(restored.state.adivinaOk, true);
  assert.equal(restored.task('class:q1').choice, 1);
  assert.deepEqual(restored.task('practice', () => { throw new Error('no generar otra variante'); }).picked, ['b']);
  assert.equal(restored.state.tasks.practice.item.source, 'ppt-aminas');
  assert.equal(b.state.meta.keep, true); assert.equal(b.state.events[0].id, 'previo');
});
test('El plazo absoluto sobrevive al cierre y no se reinicia con Empezar', () => {
  const a = fixture(), p = a.open(); p.start(item, true, 90); p.state.exam.task.picked = ['b']; p.save();
  const b = fixture(JSON.parse(a.disk)); b.setTime(120000); const restored = b.open();
  assert.equal(restored.remaining(), 70);
  assert.equal(restored.start(() => { throw new Error('no generar'); }, false, 999).deadlineAt, 190000);
  b.setTime(191000);
  const result = restored.finish(true, null, 'P3');
  assert.equal(result.correct, false); assert.equal(result.timeout, true);
  assert.equal(result.itemId, 'gen:basicidad:5:seed');
});
test('Prueba sin reloj conserva borrador y resultado; una nueva variante exige acción explícita', () => {
  const a = fixture(), p = a.open(); p.start(item, false, 90);
  p.state.exam.task.raw = '0,042'; p.save(); a.setTime(99999999);
  assert.equal(p.expired(), false); assert.equal(p.remaining(), null);
  const first = p.finish(true, null, 'P3'), b = fixture(JSON.parse(a.disk)), next = b.open();
  b.setTime(999999999);
  assert.deepEqual(JSON.parse(JSON.stringify(next.finish(false, 'timeout', 'P3'))), JSON.parse(JSON.stringify(first)), 'restaurar no cambia ID, fecha, fuente ni resultado');
  assert.equal(next.state.exam.task.raw, '0,042');
  next.nextExam(); assert.equal(next.state.exam, undefined);
  next.start(() => ({ ...item(), id: 'gen:basicidad:5:otra' }), false, 90);
  assert.equal(next.state.exam.item.id, 'gen:basicidad:5:otra');
});
test('Estación completa, prueba final y otras misiones mantienen recorridos separados', () => {
  const a = fixture(); a.open().state.step = 2;
  assert.equal(a.open('m4', 'demuestra').state.step, 3);
  assert.equal(a.open('m5').state.step, 0); assert.equal(a.open().state.step, 2);
});
