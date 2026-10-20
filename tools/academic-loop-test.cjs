// Recorrido real: corrector del aula → registro durable → puente → evidencia/FSRS → recarga.
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const copy = value => JSON.parse(JSON.stringify(value));
function app(initial) {
  const disk = new Map();
  const window = { FSRS: require('ts-fsrs'), NexoLoader: { script: async () => {} }, addEventListener() {} };
  const ctx = vm.createContext({ window, document: { addEventListener() {} }, Date, console, setTimeout, clearTimeout,
    localStorage: { getItem: k => disk.get(k) || null, setItem: (k, v) => disk.set(k, v) } });
  for (const file of ['core/storage', 'academic/model', 'academic/graph', 'academic/knowledge', 'academic/diagnosis',
    'academic/reviews', 'academic/engine', 'classes/org-01', 'classes/org-01-gen', 'classes/ana-01',
    'classes/player', 'classes/evidence', 'academic/class-bridge'])
    vm.runInContext(fs.readFileSync(path.join(root, 'dist', file + '.js'), 'utf8'), ctx, { filename: file });
  const state = initial || { meta: {}, grades: { organica: { note: 'conservar' } }, events: [{ id: 'anterior' }],
    classSessions: {}, academicIntelligence: { attempts: [], evidence: [], reviewSchedules: [], structuredErrors: [], userSources: [] } };
  const api = { getState: () => state, saveState: () => window.NexoStorage.schedule(state, { backup: false }), flushState: () => window.NexoStorage.flush() };
  return { window, state, api, disk, E: window.NexoClassEvidence, NX: window.NexoClassroom };
}
const time = '2026-10-20T10:00:00.000Z';
const entry = (item, extra = {}) => ({ itemId: item.id, conceptId: item.concept, missionId: 'm1', stage: 'practice',
  step: 5, correct: true, at: time, ...extra });

(async () => {
  let a = app(), cls = a.window.NexoClasses['org-01'];
  const item = a.NX.allItems(cls).find(x => !x.item.type || x.item.type === 'choice').item;
  const choice = item.options.findIndex(x => x.correct);
  assert.equal(a.NX.isCorrect(item, choice), true);
  const wrongChoice = item.options.findIndex(x => !x.correct);
  assert.equal(a.NX.isCorrect(item, wrongChoice), false);
  const savedLoad = async () => {};
  a.window.NexoAcademicLoad = async () => { throw new Error('motor no disponible'); };
  const rec = a.E.submit(a.api, cls, item, entry(item));
  const immediately = JSON.parse(a.disk.get('nexo-study-beta'));
  assert.equal(immediately.classEvidence[cls.id].records.length, 1, 'guardado antes de cualquier carga asíncrona');
  assert.equal(immediately.academicIntelligence.attempts.length, 0);
  assert.equal(immediately.classEvidence[cls.id].records[0].academicItem.source, item.source);
  await a.E.reconcile(a.api, cls);
  assert.equal(a.state.academicIntelligence.attempts.length, 0);
  assert.equal(a.state.classEvidence[cls.id].delivery[rec.id].academic, undefined);
  a.api.flushState();

  // Recarga completa: nuevos módulos, catálogo y colas; solo queda el JSON realmente guardado.
  a = app(JSON.parse(a.disk.get('nexo-study-beta'))); cls = a.window.NexoClasses['org-01'];
  a.window.NexoAcademicLoad = savedLoad;
  await a.E.reconcile(a.api, cls);
  const academic = a.state.academicIntelligence;
  assert.equal(academic.attempts.length, 1);
  assert.equal(academic.evidence.length, 1);
  assert.equal(academic.attempts[0].id, rec.id);
  assert.equal(academic.attempts[0].attemptedAt, time);
  assert.equal(academic.evidence[0].source, 'class_item');
  assert.equal(academic.evidence[0].validationStatus, 'verified');
  const concept = a.window.NexoAcademicBridge.conceptOf(cls, item.concept);
  assert.equal(academic.evidence[0].conceptId, concept);
  const model = a.window.NexoAcademicModel;
  assert.equal(model.byId(model.concepts, concept).courseId, 'organica');
  assert.ok(model.byId(model.exercises, `${cls.id}:${item.id}`).sourceIds.some(id => id.endsWith(`.s${item.slide}`)));
  assert.ok(academic.reviewSchedules.some(r => r.targetId === concept && r.lastAttemptId === rec.id));
  assert.ok(a.state.classEvidence[cls.id].reviews[item.concept].dueAt);
  assert.equal(a.state.grades.organica.note, 'conservar');
  assert.equal(a.state.events[0].id, 'anterior');
  const otherClassRecord = a.E.record(a.state, 'otra-clase', entry(item));
  assert.notEqual(otherClassRecord.id, rec.id, 'el mismo id de ítem y fecha de otro ramo no colisiona');

  // Reenvíos simultáneos: un registro inmutable, un intento, una evidencia, sin nuevas revisiones FSRS.
  const reviewBefore = copy(academic.reviewSchedules);
  const original = JSON.stringify(a.state.classEvidence[cls.id].records[0]);
  for (let i = 0; i < 5; i++) a.E.submit(a.api, cls, item, entry(item, { correct: false }));
  await Promise.all([a.E.reconcile(a.api, cls), a.E.reconcile(a.api, cls)]);
  assert.equal(a.state.classEvidence[cls.id].records.length, 1);
  assert.equal(JSON.stringify(a.state.classEvidence[cls.id].records[0]), original);
  assert.equal(academic.attempts.length, 1); assert.equal(academic.evidence.length, 1);
  assert.deepEqual(copy(academic.reviewSchedules), reviewBefore);

  // Corrección con pista/reintento y escrita se conservan como ayuda/autorúbrica.
  for (const [id, type, extra] of [['hint', 'choice', { hint: true }], ['retry', 'choice', { retry: true }], ['write', 'write', {}]]) {
    const it = { ...item, id, type };
    a.E.submit(a.api, cls, it, entry(it, extra));
  }
  await a.E.reconcile(a.api, cls);
  const attempts = academic.attempts;
  assert.ok(attempts.find(x => x.exerciseId === 'org-01:hint').assistanceUsed);
  assert.ok(attempts.find(x => x.exerciseId === 'org-01:retry').assistanceUsed);
  assert.equal(attempts.find(x => x.exerciseId === 'org-01:write').validationStatus, 'self_reported');

  // Otra asignatura usa el mismo contrato sin mezclar conceptos, fechas o fuentes.
  const ana = a.window.NexoClasses['ana-01'];
  const numeric = a.NX.allItems(ana).find(x => x.item.type === 'number').item;
  const value = { num: numeric.answer, raw: String(numeric.answer), unit: numeric.unit || '' };
  assert.ok(a.NX.isCorrect(numeric, value));
  assert.equal(a.NX.isCorrect(numeric, { ...value, num: numeric.answer + 100 }), false);
  a.E.submit(a.api, ana, numeric, entry(numeric));
  await a.E.reconcile(a.api, ana);
  const anaConcept = a.window.NexoAcademicBridge.conceptOf(ana, numeric.concept);
  assert.equal(model.byId(model.concepts, anaConcept).courseId, 'analitica');
  assert.ok(academic.evidence.some(x => x.conceptId === anaConcept && x.validationStatus === 'verified'));

  // FSRS académico falla después de guardar el intento: al reabrir se completa sin duplicar evidencia.
  const schedule = a.window.NexoAcademicReviews.schedule;
  const repairItem = { ...item, id: 'repair', concept: 'am.sales' };
  a.window.NexoAcademicReviews.schedule = async (...args) => { if (args[1] === 'org-01:am.sales') throw new Error('FSRS no disponible'); return schedule(...args); };
  const repair = a.E.submit(a.api, cls, repairItem, entry(repairItem));
  await a.E.reconcile(a.api, cls);
  assert.equal(a.state.classEvidence[cls.id].delivery[repair.id].academic, false);
  assert.equal(academic.attempts.filter(x => x.id === repair.id).length, 1);
  a.window.NexoAcademicReviews.schedule = schedule;
  await a.E.reconcile(a.api, cls);
  assert.equal(a.state.classEvidence[cls.id].delivery[repair.id].academic, true);
  assert.equal(academic.evidence.filter(x => x.attemptId === repair.id).length, 1);

  // Recuperar una respuesta antigua no mueve hacia atrás la tarjeta de una respuesta posterior.
  const latest = { ...item, id: 'latest', concept: 'am.pka' };
  a.E.submit(a.api, cls, latest, entry(latest, { at: '2026-10-22T10:00:00.000Z' }));
  await a.E.reconcile(a.api, cls);
  const before = copy(academic.reviewSchedules.find(r => r.targetId === 'org.pka'));
  a.E.submit(a.api, cls, { ...latest, id: 'old' }, entry({ ...latest, id: 'old' }));
  await a.E.reconcile(a.api, cls);
  assert.deepEqual(copy(academic.reviewSchedules.find(r => r.targetId === 'org.pka')), before);
  assert.equal(a.state.classEvidence[cls.id].reviews['am.pka'].updatedAt, '2026-10-22T10:00:00.000Z');

  // Los datos anteriores se conservan; no se inventa un ejercicio para evidencia sin metadatos.
  const old = a.E.record(a.state, cls.id, { itemId: 'legacy', conceptId: item.concept, correct: true, at: time });
  await a.E.reconcile(a.api, cls);
  assert.ok(a.state.classEvidence[cls.id].records.includes(old));
  assert.equal(academic.attempts.some(x => x.id === old.id), false);
  // Una importación mientras carga el motor no recibe intentos del estado anterior.
  const imported = app(), importedClass = imported.window.NexoClasses['org-01'];
  let release, started;
  const loading = new Promise(resolve => { release = resolve; });
  const didStart = new Promise(resolve => { started = resolve; });
  imported.window.NexoAcademicLoad = () => { started(); return loading; };
  imported.E.submit(imported.api, importedClass, item, entry(item));
  const delivery = imported.E.reconcile(imported.api, importedClass);
  await didStart;
  const replacement = { meta: {}, academicIntelligence: { attempts: [], evidence: [], reviewSchedules: [], structuredErrors: [], userSources: [] } };
  imported.api.getState = () => replacement;
  release(); await delivery;
  assert.equal(replacement.academicIntelligence.attempts.length, 0);
  assert.equal(replacement.classEvidence, undefined);
  console.log('OK: ciclo académico local, corrección en 2 ramos, persistencia, recarga, reenvíos, ayuda, autorúbrica y recuperación de FSRS.');
})().catch(error => { console.error(error); process.exitCode = 1; });
