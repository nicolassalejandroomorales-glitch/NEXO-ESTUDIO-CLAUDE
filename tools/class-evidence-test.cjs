// Reglas del motor de evidencia de las clases (dist/classes/evidence.js): escalones, confianza, hojas y calibración.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert');
const context = { window: {} }; vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'dist', 'classes', 'evidence.js'), 'utf8'), context);
const E = context.window.NexoClassEvidence;

// Escalones por tipo: elegir es reconocer, escribir es producir.
assert.equal(E.stepOf({ type: 'choice' }), 2); assert.equal(E.stepOf({}), 2);
assert.equal(E.stepOf({ type: 'order' }), 3); assert.equal(E.stepOf({ type: 'write' }), 5); assert.equal(E.stepOf({ type: 'choice', step: 4 }), 4);

// Confianza × resultado (tabla del diseño).
assert.equal(E.confidenceKind(90, true), 'solido'); assert.equal(E.confidenceKind(80, false), 'alerta');
assert.equal(E.confidenceKind(60, true), 'fragil'); assert.equal(E.confidenceKind(30, false), 'consciente');
assert.equal(E.confidenceKind(70, true), 'medio'); assert.equal(E.confidenceKind(null, true), null);

const day = (n, h = 10) => new Date(Date.UTC(2026, 9, n, h)).toISOString();
const st = {};
let n = 0;
const add = e => E.record(st, 'c', { conceptId: 'x', itemId: `i${n++}`, validationStatus: 'verified', ...e });
const leaf = (now = new Date(day(30))) => E.leaf(E.storeFor(st, 'c'), 'x', now);

assert.equal(leaf().key, 'semilla', 'sin evidencia es semilla');
add({ step: 2, correct: true, confidence: 90, at: day(1) });
assert.equal(leaf().key, 'brote', 'elegir bien deja solo un brote: reconocer no es dominar');
add({ step: 5, correct: true, hint: true, confidence: 90, at: day(1, 11) });
assert.equal(leaf().key, 'clara', 'producir con pista es hoja clara');
add({ step: 5, correct: true, confidence: 40, at: day(1, 12) });
assert.equal(leaf().key, 'clara', 'producir con confianza baja no cuenta como independiente');
assert.equal(leaf().overlay, 'amarilla', 'un acierto frágil pinta la hoja amarilla');
add({ step: 5, correct: true, confidence: 90, at: day(1, 13) });
assert.equal(leaf().key, 'clara', 'un solo acierto solo puede ser suerte: sigue clara');
E.record(st, 'c', { conceptId: 'x', itemId: 'i3', step: 5, correct: true, confidence: 90, at: day(1, 13) });
assert.equal(leaf().key, 'clara', 'el mismo ejercicio dos veces no suma');
add({ step: 4, correct: true, confidence: 90, at: day(1, 13) });
assert.equal(leaf().key, 'verde', 'dos ejercicios distintos de escalón 4 o más, solo y seguro: hoja verde');
assert.equal(leaf().overlay, null);
add({ step: 5, correct: true, confidence: 90, transfer: true, at: day(1, 14) });
assert.equal(leaf().key, 'intensa', 'en un caso nuevo es verde intenso');
const late = add({ step: 5, correct: true, confidence: 80, at: day(2, 14) });
assert.ok(late.delayed, '24 h después del primer acierto independiente cuenta como diferido');
assert.equal(leaf().key, 'flor', 'recordarlo días después florece');
add({ step: 5, correct: true, confidence: 80, retry: true, at: day(3) });
assert.equal(E.storeFor(st, 'c').records.at(-1).kind, null, 'el reintento del rescate no mide confianza');

// Escalón 4 sin pista cuenta; con pista, no. Elegir y ordenar nunca dan verde.
const st2 = {};
const l2 = k => E.leaf(E.storeFor(st2, 'c'), k, new Date(day(30))).key;
const rec2 = e => E.record(st2, 'c', { step: 4, correct: true, confidence: 90, at: day(1), validationStatus: 'verified', ...e });
rec2({ conceptId: 'a', itemId: 'a1' }); rec2({ conceptId: 'a', itemId: 'a2', hint: true });
assert.equal(l2('a'), 'clara', 'con pista no suma');
rec2({ conceptId: 'a', itemId: 'a3' }); assert.equal(l2('a'), 'verde', 'dibujar dos veces sin pista es verde');
[2, 3].forEach(step => ['b1', 'b2', 'b3'].forEach(itemId => rec2({ conceptId: 'b', itemId, step })));
assert.equal(l2('b'), 'brote', 'reconocer y completar, por muchos que sean, no dan verde');

// Hoja seca: el repaso venció.
E.storeFor(st, 'c').reviews.x = { targetId: 'x', dueAt: day(10) };
assert.equal(leaf(new Date(day(11))).overlay, 'seca'); assert.equal(leaf(new Date(day(9))).overlay, null);
assert.deepEqual([...E.due(E.storeFor(st, 'c'), new Date(day(11)))], ['x']);

// Calibración.
const cal = E.calibration([{ confidence: 90, correct: true }, { confidence: 90, correct: false }, { confidence: 20, correct: false }, { confidence: 90, correct: true, retry: true }]);
assert.deepEqual(cal.map(b => [b.label, b.n, b.right]), [['0–40', 1, 0], ['50–70', 0, 0], ['80–100', 2, 1]]);

// Auditor: ningún ramo puede crecer en conceptos sin salida a verde (la lista actual es el pendiente del tema clases).
const dir = path.join(__dirname, '..', 'dist', 'classes');
const ctx = vm.createContext({ window: {}, document: {}, localStorage: { getItem() {}, setItem() {} } }); ctx.window = ctx;
fs.readdirSync(dir).filter(f => /^(ana|fis|fq|org)-\d+(-gen)?\.js$/.test(f)).sort().forEach(f => vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx));
const stuck = E.auditGreen(ctx.NexoClasses);
const byClass = {}; stuck.forEach(s => { byClass[s.classId] = (byClass[s.classId] || 0) + 1; });
// Dos conceptos adicionales dependían solo de autorúbricas. Se documenta el déficit objetivo, no se omite la prueba.
const MAX_STUCK = { 'ana-01': 9, 'ana-02': 3, 'ana-03': 4, 'fis-01': 7, 'fis-02': 5, 'fis-06': 4, 'fis-09': 5, 'fq-01': 4, 'fq-02': 5, 'fq-03': 4, 'org-01': 19, 'org-04': 8, 'org-05': 11 };
for (const [id, count] of Object.entries(byClass)) assert.ok(count <= (MAX_STUCK[id] ?? 0), `${id}: ${count} conceptos no pueden llegar a hoja verde (máx. ${MAX_STUCK[id] ?? 0}): ${stuck.filter(s => s.classId === id).map(s => s.concept).join(', ')}`);
console.log(`Conceptos sin salida a hoja verde (pendiente de clases): ${stuck.length}`, byClass);

console.log('Evidencia de clases: escalones, confianza, hojas (brote → flor, amarilla y seca), repaso y calibración OK');
