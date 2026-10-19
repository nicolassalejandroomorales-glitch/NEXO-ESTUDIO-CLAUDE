// Pruebas finales de las misiones (cls.demuestra) de las 13 clases: cada una apunta a generadores reales de su misión,
// a una pregunta de la PEP que esa misión prepara, y produce solo ítems que la estación sabe mostrar (alternativas, ordenar, número).
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert');
const read = f => fs.readFileSync(path.join(__dirname, '..', 'dist', 'classes', f), 'utf8');
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const SHOWN = ['choice', 'order', 'number'];
const CLASSES = ['org-01', 'org-04', 'org-05', 'ana-01', 'ana-02', 'ana-03', 'fq-01', 'fq-02', 'fq-03', 'fis-01', 'fis-02', 'fis-06', 'fis-09'];
let total = 0;

for (const id of CLASSES) {
  if (!fs.existsSync(path.join(__dirname, '..', 'dist', 'classes', `${id}.js`))) continue;   // clases que aún no están en esta rama
  const ctx = { window: {}, console, document: {} }; vm.createContext(ctx);
  vm.runInContext(read(`${id}-gen.js`), ctx); vm.runInContext(read(`${id}.js`), ctx);
  const cls = ctx.window.NexoClasses[id], gens = ctx.window.NexoClassGen[id].generators;
  assert.ok(cls.demuestra, `${id}: tiene demuestra`);
  for (const m of cls.missions) {
    const own = gens.filter(g => g.mission === m.id);
    if ((cls.stations || []).includes(m.id)) continue;   // tienen su estación completa
    if (!own.length) continue;
    const cfg = cls.demuestra[m.id];
    assert.ok(cfg, `${id}/${m.id}: la misión tiene generadores pero no prueba final`);
    for (const g of [].concat(cfg.gen)) {
      const gen = gens.find(x => x.id === g);
      assert.ok(gen, `${id}/${m.id}: el generador ${g} existe`);
      assert.equal(gen.mission, m.id, `${id}/${m.id}: ${g} es de la misión ${gen.mission}`);
      for (let i = 1; i <= 40; i++) {
        const it = gen.make(mulberry(i * 13), 5);
        assert.ok(SHOWN.includes(it.type), `${id}/${m.id}/${g}: tipo ${it.type} no lo muestra la estación`);
        assert.ok(it.concept, `${id}/${m.id}/${g}: el ítem trae concepto (para la evidencia)`);
        if (it.type === 'number') assert.ok(Number.isFinite(it.answer), `${id}/${g}: respuesta numérica`);
        if (it.type === 'order') assert.ok(it.cards.length >= 2 && it.answer.length === it.cards.length, `${id}/${g}: ordenar completo`);
      }
    }
    if (cfg.pep) assert.ok((cls.goal?.questions || []).some(q => q.id === cfg.pep && q.missions.includes(m.id)), `${id}/${m.id}: ${cfg.pep} es una pregunta de la meta que esa misión prepara`);
    total++;
  }
  for (const mid of Object.keys(cls.demuestra)) assert.ok(cls.missions.some(m => m.id === mid), `${id}: demuestra.${mid} no es una misión`);
}
console.log(`Pruebas finales de misión OK: ${total} misiones en ${CLASSES.length} clases`);
