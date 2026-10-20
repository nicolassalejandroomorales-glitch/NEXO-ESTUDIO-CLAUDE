// Cuatro regresiones de la auditoría de 88937b5. Solo JSON sintético y almacenamiento en memoria.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.join(__dirname, '..');
const copy = value => JSON.parse(JSON.stringify(value));
const day = n => `2026-10-${String(n).padStart(2, '0')}T10:00:00.000Z`;
function app(initial) {
  const disk = new Map(), window = { FSRS: require('ts-fsrs'), NexoLoader: { script: async () => {} }, addEventListener() {} };
  const ctx = vm.createContext({ window, Date, console, setTimeout, clearTimeout, document: { addEventListener() {} },
    localStorage: { getItem: key => disk.get(key) || null, setItem: (key, value) => disk.set(key, value) } });
  for (const file of ['core/storage', 'academic/model', 'academic/graph', 'academic/knowledge', 'academic/ranks',
    'academic/diagnosis', 'academic/reviews', 'academic/engine', 'classes/org-01', 'classes/org-01-gen',
    'classes/player', 'classes/evidence', 'academic/class-bridge']) {
    const source = process.env.NEXO_TEST_REVISION
      ? execFileSync('git', ['show', `${process.env.NEXO_TEST_REVISION}:dist/${file}.js`], { cwd: root, encoding: 'utf8' })
      : fs.readFileSync(path.join(root, 'dist', `${file}.js`), 'utf8');
    vm.runInContext(source, ctx, { filename: file });
  }
  let state = copy(initial || { meta: {}, grades: { note: 'preservar' }, events: [{ id: 'previo' }], classSessions: {},
    academicIntelligence: { attempts: [], evidence: [], reviewSchedules: [], structuredErrors: [], userSources: [] } });
  const api = { getState: () => state, saveState: () => window.NexoStorage.schedule(state, { backup: false }),
    flushState: () => window.NexoStorage.flush() };
  return { window, disk, api, get state() { return state; }, replace: next => { state = next; },
    cls: window.NexoClasses['org-01'], E: window.NexoClassEvidence, NX: window.NexoClassroom };
}
async function submit(a, item, extra = {}) {
  const entry = { itemId: item.id, conceptId: item.concept, correct: true, stage: 'practice', step: a.E.stepOf(item), at: day(20), ...extra };
  if (a.E.submit) { const rec = a.E.submit(a.api, a.cls, item, entry); await a.E.reconcile(a.api, a.cls); return rec; }
  // Permite contrastar los mismos escenarios con la base 5503511 sin copiar ni editar esa versión.
  const rec = a.E.record(a.state, a.cls.id, entry);
  await a.E.schedule(a.state, a.cls.id, rec, { now: new Date(entry.at) });
  await a.window.NexoAcademicBridge.record(a.api, a.cls, item, rec);
  a.api.saveState(); a.api.flushState(); return rec;
}
const generated = (a, seed, concept = 'am.orden') => a.NX.genItem(a.cls, `gen:basicidad:5:${seed}:${concept}`);
const find = (a, id) => a.NX.findItem(a.cls, id);
const restore = a => app(JSON.parse(a.disk.get('nexo-study-beta')));

test('R1: cada variante acredita su concepto, tipo y fuente sin modificar el historial', async () => {
  let a = app();
  const first = generated(a, 'orden'), second = generated(a, 'resonancia', 'am.resonancia');
  await submit(a, first); await submit(a, second, { at: day(21) });
  const academic = a.state.academicIntelligence, attempts = academic.attempts;
  const actual = attempts.map(x => x.conceptIds[0]).sort();
  assert.deepEqual(copy(actual), ['org-01:am.orden', 'org.resonance'].sort(), 'la variante de resonancia debe acreditar resonancia');
  assert.notEqual(attempts[0].exerciseId, attempts[1].exerciseId, 'variantes distintas conservan identidad propia');
  const model = a.window.NexoAcademicModel;
  for (const attempt of attempts) {
    const item = attempt.conceptIds[0] === 'org.resonance' ? second : first;
    const ex = model.byId(model.exercises, attempt.exerciseId);
    assert.ok(ex.sourceIds.includes(`org-01.${item.source}.s${item.slide}`));
  }
  // Un generador puede producir tipos diferentes: no heredar el validador del primero.
  const write = { ...second, id: 'gen:basicidad:5:write', type: 'write' };
  await submit(a, write, { at: day(22) });
  assert.equal(academic.attempts[0].validationStatus, 'self_reported');
  const history = JSON.stringify(academic.attempts), evidence = JSON.stringify(academic.evidence);
  const reviews = JSON.stringify(academic.reviewSchedules);
  await submit(a, second, { at: day(21), correct: false });
  assert.equal(JSON.stringify(academic.attempts), history, 'reenvío no altera el intento original');
  assert.equal(JSON.stringify(academic.evidence), evidence);
  assert.equal(JSON.stringify(academic.reviewSchedules), reviews);
  a = restore(a); a.window.NexoAcademicBridge.ensureFromEvidence(a.state);
  assert.equal(JSON.stringify(a.state.academicIntelligence.attempts), history);
  // Un JSON antiguo mal atribuido se conserva, pero no vuelve a acreditar el concepto equivocado.
  const wrongLegacy = copy(a.state);
  const wrong = wrongLegacy.academicIntelligence.evidence.find(e => e.conceptId === 'org.resonance' && e.source === 'class_item');
  wrong.conceptId = 'org-01:am.orden';
  wrongLegacy.academicIntelligence.attempts.find(attempt => attempt.id === wrong.attemptId).conceptIds = [wrong.conceptId];
  const rawLegacy = JSON.stringify(wrongLegacy.academicIntelligence);
  const projected = a.window.NexoAcademicBridge.evidenceFor(wrongLegacy).find(e => e.attemptId === wrong.attemptId);
  assert.equal(projected.validationStatus, 'unverified');
  assert.equal(projected.provenanceIssue, 'historical_concept_mismatch');
  assert.ok(a.window.NexoAcademicBridge.ensureFromEvidence(wrongLegacy).some(issue => issue.attemptId === wrong.attemptId));
  assert.equal(JSON.stringify(wrongLegacy.academicIntelligence), rawLegacy);
});

test('R2: autorúbricas no conceden dominio, transferencia, retención, hojas ni rangos verificados', async () => {
  let a = app(); const item = find(a, 'm4-w1'), concept = a.window.NexoAcademicBridge.conceptOf(a.cls, item.concept);
  for (const [i, at] of [day(20), day(22)].entries()) {
    const it = { ...item, id: `${item.id}@s${i}` };
    const correct = a.NX.isCorrect(it, { paper: true, checks: it.rubric.map(() => true) });
    await submit(a, it, { correct, transfer: true, at });
  }
  const history = JSON.stringify(a.state.academicIntelligence);
  const knowledge = () => a.window.NexoAcademicEngine.knowledgeFor(a.state, concept);
  assert.equal(knowledge().state, 'unseen', 'autoevaluado no significa dominio verificado');
  assert.ok(a.state.academicIntelligence.evidence.every(e => e.validationStatus === 'self_reported'));
  assert.ok(a.E.leaf(a.state.classEvidence['org-01'], item.concept).key !== 'flor');
  const rank = a.window.NexoArcaneRanks.derive({ conceptId: concept, evidence: a.state.academicIntelligence.evidence,
    activeTime: [{ id: 'time', conceptId: concept, seconds: 7200 }] });
  assert.equal(rank.level, 0, 'tiempo y autorúbrica no conceden rango verificado');
  const s = a.NX.sessionFor(a.api, 'org-01');
  s.answers[item.id] = { correct: true, hint: false };
  assert.equal(a.NX.goalOf(a.cls, s).earned, 0, 'una escrita autoevaluada no asegura puntos PEP');
  a.api.saveState(); a.api.flushState(); a = restore(a);
  assert.equal(JSON.stringify(a.state.academicIntelligence), history);
  assert.equal(knowledge().state, 'unseen');
  const unproven = [{ id: 'unknown', outcome: 'correct', transfer: true, delayed: true, delayHours: 48 }];
  assert.equal(a.window.NexoKnowledge.derive(unproven).state, 'unseen', 'sin procedencia no se inventa verificación');
  const legacySelf = copy(a.state);
  for (const r of legacySelf.classEvidence['org-01'].records) { delete r.academicItem; delete r.validationStatus; }
  assert.equal(a.E.leaf(a.E.storeFor(legacySelf, 'org-01'), item.concept).knowledge, 'unseen', 'la escrita antigua identificable sigue autoevaluada');
  // La autorúbrica previa tampoco establece el inicio del intervalo de recuerdo objetivo.
  const objective = { ...generated(a, 'objective'), concept: item.concept };
  await submit(a, objective, { at: day(23), transfer: true, step: 5 });
  assert.equal(knowledge().state, 'transferable');
  assert.equal(a.state.academicIntelligence.evidence[0].delayed, false);
  await submit(a, { ...objective, id: objective.id + '@hint' }, { at: day(24), hint: true, transfer: true });
  await submit(a, { ...objective, id: objective.id + '@retry' }, { at: day(24), retry: true, transfer: true });
  assert.equal(knowledge().state, 'transferable');
  await submit(a, { ...objective, id: objective.id + '@late' }, { at: day(25), transfer: true, step: 5 });
  assert.equal(knowledge().state, 'retained', 'la comprobación objetiva diferida sí puede acreditar recuerdo');
  const soloOnly = {};
  for (const [i, at] of [day(20), day(22)].entries()) a.E.record(soloOnly, 'solo', {
    itemId: `solo-${i}`, conceptId: 'x', correct: true, step: 5, at, validationStatus: 'verified' });
  assert.equal(a.E.leaf(a.E.storeFor(soloOnly, 'solo'), 'x').knowledge, 'independent', 'recordar sin transferencia no acredita retención completa');
  const unavailable = a.E.auditGreen({ self: { id: 'self', concepts: [{ id: 'x' }], missions: [{ id: 'm',
    stages: { practice: [{ id: 'w1', type: 'write', concept: 'x' }, { id: 'w2', type: 'write', concept: 'x' }] } }] } });
  assert.equal(unavailable[0].exercises, 0, 'el auditor tampoco presenta autorúbricas como vía a dominio verificado');
});

test('R3: FSRS mantiene una tarjeta ante concurrencia, reenvío y fallo/reintento', async () => {
  let a = app(); const item = find(a, 'm1-d1') || a.NX.allItems(a.cls)[0].item;
  const bridge = a.window.NexoAcademicBridge, reviews = a.window.NexoAcademicReviews;
  const schedule = reviews.schedule; let release, started, calls = 0;
  const gate = new Promise(resolve => { release = resolve; });
  const didStart = new Promise(resolve => { started = resolve; });
  reviews.schedule = async (...args) => { if (++calls === 1) { started(); await gate; } return schedule(...args); };
  const entry = (id, at = day(20)) => ({ id, conceptId: item.concept, correct: true, at });
  const first = bridge.record(a.api, a.cls, item, entry('parallel-1'));
  await didStart;
  const second = bridge.record(a.api, a.cls, item, entry('parallel-2', day(21)));
  await new Promise(resolve => setImmediate(resolve)); release(); await Promise.all([first, second]);
  const academic = a.state.academicIntelligence;
  assert.equal(academic.reviewSchedules.length, 1, 'dos operaciones del mismo concepto no duplican la tarjeta');
  assert.equal(academic.reviewSchedules[0].lastAttemptId, 'parallel-2');
  const saved = JSON.stringify(academic.reviewSchedules);
  await Promise.all([bridge.record(a.api, a.cls, item, entry('parallel-2', day(21))),
    bridge.record(a.api, a.cls, item, entry('parallel-1'))]);
  assert.equal(JSON.stringify(academic.reviewSchedules), saved);
  assert.equal(academic.attempts.length, 2); assert.equal(academic.evidence.length, 2);
  reviews.schedule = async () => { throw new Error('scheduler_offline'); };
  await bridge.record(a.api, a.cls, item, entry('repair', day(22)));
  assert.equal(academic.attempts.length, 3);
  reviews.schedule = schedule;
  await Promise.all([bridge.record(a.api, a.cls, item, entry('repair', day(22))),
    bridge.record(a.api, a.cls, item, entry('repair', day(22)))]);
  assert.equal(academic.reviewSchedules.length, 1); assert.equal(academic.reviewSchedules[0].lastAttemptId, 'repair');
  assert.equal(academic.attempts.length, 3);
  await Promise.all([bridge.record(a.api, a.cls, item, entry('same-time-1', day(23))),
    bridge.record(a.api, a.cls, item, entry('same-time-2', day(23)))]);
  const sameTime = JSON.stringify(academic.reviewSchedules);
  await bridge.record(a.api, a.cls, item, entry('same-time-1', day(23)));
  assert.equal(JSON.stringify(academic.reviewSchedules), sameTime, 'un reenvío con fecha empatada tampoco reaplica FSRS');
  const latest = copy(academic.reviewSchedules[0]);
  academic.reviewSchedules.push({ ...latest, lastAttemptId: 'stale-duplicate', updatedAt: day(20) });
  await bridge.record(a.api, a.cls, item, entry('same-time-2', day(23)));
  assert.equal(academic.reviewSchedules.length, 1, 'duplicados históricos conservan la tarjeta más reciente');
  assert.deepEqual(copy(academic.reviewSchedules[0]), latest);
  assert.equal(academic.attempts.length, 5);
  academic.reviewSchedules.push({ ...copy(latest), lastAttemptId: 'same-time-1', attemptIdsAtUpdatedAt: ['same-time-1'] });
  await bridge.record(a.api, a.cls, item, entry('same-time-1', day(23)));
  assert.equal(academic.reviewSchedules.length, 1);
  assert.equal(academic.reviewSchedules[0].card.reps, latest.card.reps, 'fusionar tarjetas empatadas no repite el intento');
  a.api.saveState(); a.api.flushState(); a = restore(a);
  assert.equal(a.state.academicIntelligence.reviewSchedules.length, 1);
  // Cambiar de estado mientras FSRS espera no escribe la tarjeta antigua en el importado.
  const isolated = app(); let unlock, entered;
  const wait = new Promise(resolve => { unlock = resolve; }), enteredPromise = new Promise(resolve => { entered = resolve; });
  const realSchedule = isolated.window.NexoAcademicReviews.schedule;
  isolated.window.NexoAcademicReviews.schedule = async (...args) => { entered(); await wait; return realSchedule(...args); };
  const inFlight = isolated.window.NexoAcademicBridge.record(isolated.api, isolated.cls, find(isolated, item.id), entry('in-flight'));
  await enteredPromise;
  const replacement = app().state; isolated.replace(replacement); unlock(); await inFlight;
  assert.equal(replacement.academicIntelligence.attempts.length, 0);
  assert.equal(replacement.academicIntelligence.reviewSchedules.length, 0);
});

test('R4: recargar reconstruye catálogo y referencias históricas sin reenviar ni borrar intentos', async () => {
  let a = app(); const item = generated(a, 'reload');
  await submit(a, item, { transfer: true });
  a.api.saveState(); a.api.flushState();
  const saved = JSON.parse(a.disk.get('nexo-study-beta'));
  // Formato de ejercicio agregado anterior a esta corrección; la variante queda en classEvidence.
  const oldId = 'org-01:gen:basicidad:5#t';
  saved.academicIntelligence.attempts[0].exerciseId = oldId;
  saved.academicIntelligence.evidence[0].exerciseId = oldId;
  const history = JSON.stringify(saved.academicIntelligence), records = JSON.stringify(saved.classEvidence);
  a = app(saved);
  a.window.NexoAcademicBridge.ensureFromEvidence(a.state);
  if (a.E.reconcile) await a.E.reconcile(a.api, a.cls);
  const model = a.window.NexoAcademicModel, attempt = a.state.academicIntelligence.attempts[0];
  const ex = model.byId(model.exercises, oldId);
  assert.ok(ex, 'se restaura el ejercicio referenciado por el intento histórico');
  assert.ok(model.byId(model.families, attempt.familyId), 'se restaura su familia');
  assert.ok(ex.sourceIds.includes(`org-01.${item.source}.s${item.slide}`), 'fuente y diapositiva recuperables');
  assert.ok(model.byId(model.sources, `org-01.${item.source}.s${item.slide}`));
  assert.equal(model.validate(), true);
  a.window.NexoAcademicBridge.ensureFromEvidence(a.state);
  assert.equal(JSON.stringify(a.state.academicIntelligence), history);
  assert.equal(JSON.stringify(a.state.classEvidence), records);
  assert.equal(a.state.grades.note, 'preservar'); assert.equal(a.state.events[0].id, 'previo');
  // Una respuesta antigua identificable sin academicItem también permite reconstruir el catálogo.
  const staticItem = find(a, 'm4-w1'); await submit(a, staticItem, { at: day(21), transfer: true });
  const legacy = copy(a.state); const rec = legacy.classEvidence['org-01'].records.at(-1); delete rec.academicItem;
  const before = JSON.stringify(legacy.academicIntelligence);
  a = app(legacy); a.window.NexoAcademicBridge.ensureFromEvidence(a.state);
  assert.ok(a.window.NexoAcademicModel.byId(a.window.NexoAcademicModel.exercises, legacy.academicIntelligence.attempts[0].exerciseId));
  assert.equal(JSON.stringify(a.state.academicIntelligence), before);
  const unknown = copy(a.state);
  unknown.academicIntelligence.attempts.push({ id: 'old-unrecoverable', exerciseId: 'org-01:gen:unknown:5',
    conceptIds: ['org-01:am.orden'], familyId: 'old-family', skillIds: ['compare'], validator: 'class_item' });
  const missingBefore = JSON.stringify(unknown.academicIntelligence);
  const issues = a.window.NexoAcademicBridge.ensureFromEvidence(unknown);
  assert.ok(issues.some(issue => issue.attemptId === 'old-unrecoverable' && issue.reason === 'missing_item_metadata'));
  assert.equal(JSON.stringify(unknown.academicIntelligence), missingBefore, 'lo irrecuperable queda señalado y conservado');
});
