// Calidad de los ejercicios generados (docs/calidad-ejercicios/SPEC.md).
// Para cada generador y concepto arma 200 ejercicios (5 niveles × 40 semillas) y mide:
//  - distintos: cuántos tienen contenido realmente distinto (enunciado + alternativas o respuesta);
//  - moldes: cuántos enunciados distintos quedan al borrar los números y la edad del paciente;
//  - alternativas: toda pregunta de alternativas necesita al menos 3 (con 2, adivinar da 50 %);
//  - relleno: nada de "ninguna/todas las anteriores".
// Uso: node tools/exercise-quality.cjs [id ...]   (sin ids revisa todo el catálogo). Sale con error si algo no cumple.
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = process.env.NEXO_CLASSES_DIR || path.join(__dirname, '..', 'dist', 'classes');
const MIN_DISTINCT = 60, MIN_MOLDS = 3, MIN_OPTIONS = 3;
const FILLER = /ninguna de las anteriores|todas las anteriores|ninguna de estas/i;
const hashStr = t => [...String(t)].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const mold = s => String(s).replace(/Estilo PEP: /, '').replace(AGE_RE, 'P').replace(/−?\d+([.,]\d+)?/g, '#');
const AGE_RE = /(Mujer|Hombre|Paciente|Niña|Niño) de \d+ años/g;
// Cambiar solo la edad del paciente NO cuenta como ejercicio distinto.
const signature = it => `${String(it.prompt).replace(AGE_RE, 'P')}|${it.options ? it.options.map(o => o.text).sort().join('/') : it.cards ? it.cards.map(c => c.text).sort().join('/') : it.answer}`;

function audit(id) {
  const ctx = { window: {}, console }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(dir, `${id}-gen.js`), 'utf8'), ctx);
  const G = ctx.window.NexoClassGen[id], problems = [], rows = [];
  for (const g of G.generators) for (const want of g.concepts) {
    const sig = new Set(), molds = new Set(); let few = 0, filler = 0;
    for (let lv = 1; lv <= 5; lv++) for (let k = 0; k < 40; k++) {
      const it = g.make(mulberry(hashStr(`t${k}`)), lv, g.concepts.length > 1 ? want : undefined);
      sig.add(signature(it)); molds.add(mold(it.prompt));
      if ((it.type || 'choice') === 'choice') { if (it.options.length < MIN_OPTIONS) few++; if (it.options.some(o => FILLER.test(o.text))) filler++; }
    }
    const tag = `${id}/${g.id}${g.concepts.length > 1 ? `[${want}]` : ''}`;
    rows.push(`${tag}: ${sig.size} distintos · ${molds.size} moldes`);
    if (sig.size < MIN_DISTINCT) problems.push(`${tag}: solo ${sig.size} ejercicios distintos de 200 (mínimo ${MIN_DISTINCT})`);
    if (molds.size < MIN_MOLDS) problems.push(`${tag}: solo ${molds.size} molde(s) de enunciado (mínimo ${MIN_MOLDS})`);
    if (few) problems.push(`${tag}: ${few} preguntas con menos de ${MIN_OPTIONS} alternativas`);
    if (filler) problems.push(`${tag}: ${filler} preguntas con alternativas de relleno`);
  }
  return { rows, problems };
}

if (require.main === module) {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys((() => { const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(dir, 'catalog.js'), 'utf8'), c); return c.window.NexoClassCatalog; })())
    .filter(id => fs.existsSync(path.join(dir, `${id}-gen.js`)));
  let bad = 0;
  for (const id of ids) { const { rows, problems } = audit(id); if (process.env.VERBOSE) rows.forEach(r => console.log('  ' + r)); problems.forEach(p => console.log('✗ ' + p)); bad += problems.length; }
  console.log(bad ? `Calidad de ejercicios: ${bad} problema(s).` : `Calidad de ejercicios: ${ids.length} clases OK (≥ ${MIN_DISTINCT} distintos y ≥ ${MIN_MOLDS} moldes por generador, ≥ ${MIN_OPTIONS} alternativas, sin relleno).`);
  process.exit(bad ? 1 : 0);
}
module.exports = { audit };
