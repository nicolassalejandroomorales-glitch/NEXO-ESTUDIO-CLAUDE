// Revisa que la plantilla de clases nuevas (tools/new-class.cjs) siga funcionando con el aula actual:
// se genera una clase de prueba y se recorre con el reproductor, igual que Aminas. Así replicar a otro ramo no se rompe.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), vm = require('node:vm'), assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'nexo-clase-'));
execFileSync(process.execPath, [path.join(__dirname, 'new-class.cjs'), 'xx-01', 'Clase de prueba', 'PEP 1', '--salida', out], { stdio: 'pipe' });
const dir = path.join(__dirname, '..', 'dist', 'classes');
const context = { window: {} }; vm.createContext(context);
for (const f of ['molecule.js', 'editor.js', 'player.js']) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(out, 'xx-01.js'), 'utf8'), context);
const cls = context.window.NexoClasses['xx-01'], NX = context.window.NexoClassroom;
assert.ok(cls && cls.missions.length, 'La plantilla no registra la clase');
const st = { path: 'misiones', mission: 'm1', answers: {}, hints: {}, retries: {}, revealed: {}, skipExplain: {}, detour: {}, conf: {}, confWhy: {} };
const kinds = NX.beats(cls, st).map(b => b.kind === 'lesson' ? `lesson:${b.block.kind || 'bloque'}` : b.kind === 'question' ? `q:${b.stage}` : b.kind);
for (const k of ['hook', 'q:diagnostic', 'q:pretest', 'lesson:bloque', 'q:practice', 'lesson:rule', 'q:transfer', 'close']) assert.ok(kinds.includes(k), `La misión de la plantilla no muestra "${k}"`);
for (const { item } of NX.itemsOf(cls.missions[0])) {
  const type = item.type || 'choice';
  const sol = type === 'order' ? item.answer : type === 'spot' ? { step: item.wrong, fix: item.fix.options.findIndex(o => o.correct) }
    : type === 'write' ? { text: item.model, checks: item.rubric.map(() => true) } : type === 'number' ? { num: item.answer, unit: item.unit } : item.options.findIndex(o => o.correct);
  assert.ok(NX.isCorrect(item, sol), `${item.id}: la solución de la plantilla no se corrige como correcta`);
}
assert.ok(cls.concepts.every(c => cls.mini[c.id]), 'Cada concepto de la plantilla trae su mini clase');
assert.ok(NX.diagnosisPlan(cls, { answers: {} }).next, 'El diagnóstico de la plantilla arranca');
assert.ok(cls.formulas[0].calc.run({ x: 3 }).includes('6'), 'La calculadora de la plantilla funciona');
// Ejercicios infinitos de la plantilla: se cargan y arman preguntas en los 5 niveles.
assert.ok(fs.existsSync(path.join(out, 'xx-01-gen.js')), 'La plantilla también crea el archivo de ejercicios infinitos');
vm.runInContext(fs.readFileSync(path.join(out, 'xx-01-gen.js'), 'utf8'), context);
for (let lv = 1; lv <= 5; lv++) assert.ok(NX.genItem(cls, `gen:comparar:${lv}:s1`)?.prompt, `La plantilla arma un ejercicio de nivel ${lv}`);
assert.ok(NX.beats(cls, { ...st, path: 'base', mission: cls.base[0].id }).some(b => b.kind === 'close'), 'El repaso desde cero de la plantilla se recorre');
// Prueba de fuego: la plantilla, puesta en el catálogo junto a Aminas, pasa la prueba completa del aula (tools/classroom-test.cjs).
const classes = path.join(out, 'classes'); fs.mkdirSync(classes);
for (const f of fs.readdirSync(dir)) if (f.endsWith('.js')) fs.copyFileSync(path.join(dir, f), path.join(classes, f));
for (const f of ['xx-01.js', 'xx-01-gen.js']) fs.copyFileSync(path.join(out, f), path.join(classes, f));
const cat = path.join(classes, 'catalog.js');
fs.writeFileSync(cat, fs.readFileSync(cat, 'utf8').replace(/\n\}\);\s*$/, ",\n  'xx-01': 'xx-01.js'\n});\n"));
execFileSync(process.execPath, [path.join(__dirname, 'classroom-test.cjs')], { stdio: 'pipe', env: { ...process.env, NEXO_CLASSES_DIR: classes } });
fs.rmSync(out, { recursive: true, force: true });
console.log('Plantilla de clases: una clase nueva sale con caso, adivina antes, partes, regla, repaso desde cero, diagnóstico, formulario, mini clase y ejercicios infinitos, y pasa la prueba completa del aula.');
