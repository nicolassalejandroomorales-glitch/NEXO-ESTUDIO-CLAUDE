// Contrato independiente del escenario: clases reales, persistencia y motor reales, sin DOM.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { test } = require('node:test');
function fixture(initial) {
  const disk = new Map(), times = [];
  const window = { FSRS: require('ts-fsrs'), NexoLoader: { script: async () => {} }, addEventListener() {},
    NexoActiveStudy: { begin: (...args) => times.push(args), stop() {} } };
  const ctx = vm.createContext({ window, Date, console, setTimeout, clearTimeout,
    document: { addEventListener() {} }, localStorage: { getItem: key => disk.get(key) || null, setItem: (key, value) => disk.set(key, value) } });
  for (const file of ['core/storage', 'academic/model', 'academic/graph', 'academic/knowledge', 'academic/diagnosis',
    'academic/reviews', 'academic/engine', 'classes/org-01', 'classes/ana-01', 'classes/player', 'classes/evidence',
    'academic/class-bridge', 'classes/vivas']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist', file + '.js'), 'utf8'), ctx);
  const state = initial || { meta: { keep: 'previo' }, events: [{ id: 'conservar' }], classSessions: {},
    academicIntelligence: { attempts: [], evidence: [], reviewSchedules: [], structuredErrors: [], userSources: [] } };
  const api = { getState: () => state, saveState: () => window.NexoStorage.schedule(state, { backup: false }), flushState: () => window.NexoStorage.flush() };
  return { window, state, api, disk, times, create: (id, mission) => window.NexoLivingClasses.create({ cls: window.NexoClasses[id], api, mission }) };
}
test('Controlador de dos ramos funciona sin cámara, rutas, imágenes ni nodos DOM', async () => {
  const a = fixture();
  for (const id of ['org-01', 'ana-01']) {
    const c = a.create(id); await c.ready;
    const item = a.window.NexoClassroom.allItems(c.cls).find(x => x.item.type !== 'write' && x.item.options).item;
    const result = { itemId: item.id, conceptId: item.concept, type: item.type, correct: true, assisted: false,
      source: item.source, slide: item.slide, at: '2026-10-20T10:00:00Z' };
    c.submitResult(result); c.submitResult(result);
    await a.window.NexoClassEvidence.reconcile(a.api, c.cls);
    const attempt = a.state.academicIntelligence.attempts.find(x => x.id.includes(item.id));
    assert.ok(attempt, 'el resultado llega al motor');
    assert.equal(a.state.classEvidence[id].records.length, 1, 'reenvío idempotente');
    c.destroy();
  }
  assert.equal(a.state.academicIntelligence.attempts.length, 2);
  assert.equal(a.state.meta.keep, 'previo'); assert.equal(a.state.events[0].id, 'conservar');
});
test('Misión explícita y reentrada conservan borrador, ayudas y posición', async () => {
  const a = fixture(), c = a.create('org-01', 'm2'); await c.ready;
  Object.assign(c.session, { path: 'misiones', mission: 'm2', beat: 4, work: { draft: { text: 'mi razonamiento' } }, hints: { draft: true } });
  c.destroy();
  const restored = fixture(JSON.parse(a.disk.get('nexo-study-beta'))), next = restored.create('org-01');
  assert.equal(next.mission, 'm2'); assert.equal(next.session.beat, 4);
  assert.equal(next.session.work.draft.text, 'mi razonamiento'); assert.equal(next.session.hints.draft, true);
  assert.throws(() => restored.create('org-01', 'inventada'), /Misión desconocida/);
  next.destroy();
});
test('Resultado con ayuda no acredita transferencia; abrir o leer no agrega intentos', async () => {
  const a = fixture(), c = a.create('ana-01'); await c.ready;
  c.onBeat({ kind: 'lesson', block: { concept: 'm1' } });
  assert.equal(a.state.academicIntelligence.attempts.length, 0);
  const item = a.window.NexoClassroom.allItems(c.cls).find(x => x.item.options).item;
  c.submitResult({ itemId: item.id, conceptId: item.concept, type: item.type, correct: true, assisted: true, at: '2026-10-20T10:00:00Z' });
  await a.window.NexoClassEvidence.reconcile(a.api, c.cls);
  const evidence = a.state.academicIntelligence.evidence[0];
  assert.equal(evidence.assistanceUsed, true);
  assert.notEqual(a.window.NexoAcademicEngine.knowledgeFor(a.state, evidence.conceptId).state, 'transferable');
  assert.equal(a.times.length, 1); c.destroy();
});
test('Inmersivo queda explícitamente pendiente y no monta una vista ficticia', () => {
  const a = fixture();
  assert.equal(a.window.NexoLivingClasses.modes.immersive, 'planned');
  assert.throws(() => a.window.NexoLivingClasses.mount(null, { mode: 'immersive' }), /pendiente/);
});
