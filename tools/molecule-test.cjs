// Revisa la química del editor (dist/classes/molecule.js) contra RDKit (dist/vendor/rdkit), sin navegador.
// Comprueba: valencias, H implícitos, fórmulas, que "la misma molécula dibujada distinto" se reconozca igual que lo hace RDKit,
// y que cada molécula de las clases (dibujos y escenas de flechas) sea químicamente válida.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert');
const root = path.join(__dirname, '..', 'dist');
const context = { window: {} }; vm.createContext(context);
for (const f of ['classes/molecule.js', 'classes/catalog.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), context);
for (const file of Object.values(context.window.NexoClassCatalog)) vm.runInContext(fs.readFileSync(path.join(root, 'classes', file), 'utf8'), context);
const M = context.window.NexoMolecule;

// Pequeño constructor: g('C C C N', [[0,1],[1,2],[2,3]]) con cargas opcionales { 3: 1 }
const g = (els, bonds, q = {}) => ({ atoms: els.split(' ').map((el, i) => ({ id: `a${i}`, el, x: i * 40 + 20, y: 50, q: q[i] || 0 })),
  bonds: bonds.map(([a, b, o = 1]) => ({ a: `a${a}`, b: `a${b}`, o })) });
const propylamine = g('C C C N', [[0, 1], [1, 2], [2, 3]]), propylamine2 = g('N C C C', [[0, 1], [1, 2], [2, 3]]);
const isopropylamine = g('C C C N', [[0, 1], [1, 2], [1, 3]]);
const amideA = g('C C C N C O C', [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5, 2], [4, 6]]); // N-propilacetamida
const amideB = g('C C C O N C C', [[0, 1], [1, 2], [2, 3, 2], [2, 4], [4, 5], [5, 6]]); // N-etilpropanamida (isómero)
const methylammonium = g('C N', [[0, 1]], { 1: 1 }), methylamine = g('C N', [[0, 1]]);
const explicitH = g('C N H H', [[0, 1], [1, 2], [1, 3]]);
const pentavalent = g('C C C C C C', [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]]);

assert.equal(M.formulaText(M.formula(propylamine)), 'C₃H₉N');
assert.equal(M.formulaText(M.formula(amideA)), 'C₅H₁₁NO');
assert.equal(M.formulaText(M.formula(methylammonium)), 'CH₆N');
assert.ok(M.same(propylamine, propylamine2), 'la misma molécula numerada distinto es la misma');
assert.ok(!M.same(propylamine, isopropylamine), 'propilamina e isopropilamina son distintas');
assert.ok(!M.same(amideA, amideB), 'dos isómeros de la misma fórmula son distintos');
assert.ok(M.same(explicitH, methylamine), 'N–H dibujado y NH implícito son lo mismo');
assert.ok(!M.same(methylammonium, methylamine), 'la carga cuenta');
assert.equal(M.problems(pentavalent).length, 1, 'un C con 5 enlaces es un error');
assert.match(M.problems(pentavalent)[0].message, /5 enlaces/);
assert.equal(M.diff(amideB, amideA).kind, 'connect');
assert.equal(M.diff(methylamine, methylammonium).kind, 'charge');
assert.equal(M.diff(propylamine, amideA).kind, 'formula');

(async () => {
  const src = fs.readFileSync(path.join(root, 'vendor/rdkit/RDKit_minimal.js'), 'utf8');
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', '__dirname', `${src};module.exports=initRDKitModule;`)(mod, mod.exports, require, path.join(root, 'vendor/rdkit'));
  const RDKit = await mod.exports({ locateFile: () => path.join(root, 'vendor/rdkit/RDKit_minimal.wasm') });
  const smiles = graph => { const m = RDKit.get_mol(M.toMolblock(graph)); assert.ok(m, 'RDKit no pudo leer la molécula'); const s = m.get_smiles(); m.delete(); return s; };
  const canon = s => { const m = RDKit.get_mol(s); const out = m.get_smiles(); m.delete(); return out; };
  // El editor y RDKit deben estar de acuerdo en qué es "la misma molécula"
  const pairs = [[propylamine, propylamine2], [propylamine, isopropylamine], [amideA, amideB], [explicitH, methylamine], [methylammonium, methylamine]];
  for (const [a, b] of pairs) assert.equal(M.same(a, b), smiles(a) === smiles(b), `editor y RDKit no coinciden en ${smiles(a)} / ${smiles(b)}`);
  assert.equal(RDKit.get_mol(M.toMolblock(pentavalent)), null, 'RDKit también rechaza el C con 5 enlaces');
  // Moléculas de las clases
  let checked = 0;
  for (const cls of Object.values(context.window.NexoClasses)) for (const m of [...cls.missions, ...(cls.base || [])]) {
    if (m.stages.hook?.scene) { const got = smiles(m.stages.hook.scene); if (m.stages.hook.smiles) assert.equal(got, canon(m.stages.hook.smiles), `${m.id}: el caso de farmacia no dibuja ${m.stages.hook.smiles}`); checked++; }
    for (const p of m.parts || []) for (const blk of p.explain || []) for (const f of blk.frames || []) { smiles(f.scene); checked++; }
    const items = [...['diagnostic', 'practice', 'challenge', 'transfer'].flatMap(st => m.stages[st] || []), ...(m.parts || []).flatMap(p => [p.pretest, ...(p.practice || [])].filter(Boolean))];
    for (const item of items) {
      for (const f of item.figures || []) { smiles(f.scene); checked++; }
      for (const n of item.near || []) { assert.ok(!M.same(n.graph, item.target), `${item.id}: un "casi" no puede ser la respuesta`); smiles(n.graph); }
      if (item.type === 'build') {
        const got = smiles(item.target); smiles(item.start);
        if (item.smiles) assert.equal(got, canon(item.smiles), `${item.id}: el dibujo de la respuesta no es ${item.smiles}`);
        checked++;
      }
      if (item.type === 'arrows') { smiles(item.scene); checked++; }
    }
  }
  console.log(`Moléculas: editor y RDKit de acuerdo (mismas moléculas, isómeros, cargas, valencias); ${checked} dibujos de las clases revisados por RDKit.`);
})().catch(error => { console.error(error); process.exit(1); });
