'use strict';
// Sótano de los Cristales (Aprender): estado real, coherencia del manifiesto de cuadros y peso.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dist = path.join(__dirname, '..', 'dist');
const sandbox = { NexoClasses: {} };
global.window = sandbox;
global.document = {};
require('../dist/aprender/estado.js');
for (const id of ['org-01', 'org-04', 'org-05']) require(`../dist/classes/${id}.js`);
const S = sandbox.NexoAprenderEstado;
const classes = sandbox.NexoClasses;

// El aula real arma los ítems de cada misión; aquí basta con una lista fija por misión.
const NX = { itemsOf: m => (m.stages?.transfer || []).concat(m.stages?.practice || []).map(item => ({ item })) };
const leaf = shown => ({ shown });

test('nivel de un frasco: vacío, avance mínimo visible y lleno solo con todo respondido', () => {
  assert.equal(S.level(0, 5), 0);
  assert.equal(S.level(1, 20), 1);
  assert.equal(S.level(2, 4), 2);
  assert.equal(S.level(19, 20), 3);
  assert.equal(S.level(5, 5), 4);
});

test('los conceptos se reparten en cristales seguidos y completos', () => {
  const groups = S.chunks([...Array(18).keys()], 6);
  assert.deepEqual(groups.map(g => g.length), [3, 3, 3, 3, 3, 3]);
  const uneven = S.chunks([...Array(16).keys()], 5);
  assert.deepEqual(uneven.map(g => g.length), [4, 3, 3, 3, 3]);
  assert.deepEqual(uneven.flat(), [...Array(16).keys()]);
  assert.deepEqual(S.chunks([1], 3).map(g => g.length), [1, 0, 0]);
});

test('hoja del concepto: semilla = sin empezar, seca = repaso, el resto al día', () => {
  assert.equal(S.conceptState(leaf('semilla')), null);
  assert.equal(S.conceptState(leaf('seca')), 'review');
  assert.equal(S.conceptState(leaf('flor')), 'ok');
  assert.equal(S.conceptState(undefined), null);
});

test('cada alcoba tiene tantas misiones como frascos y la Cámara no se desfasa de las clases', () => {
  const missions = ids => ids.reduce((n, id) => n + classes[id].missions.length, 0);
  for (const def of Object.values(S.ALCOVES)) assert.equal(missions(def.classes), def.jars, `${def.name}: si cambia el número de misiones hay que volver a exportar los cuadros (export_app.py)`);
});

test('el estado de Aminas sale de las respuestas y de la evidencia guardadas', () => {
  const cls = classes['org-01'];
  const first = cls.missions[0], items = NX.itemsOf(first);
  const state = { classSessions: { 'org-01': { answers: Object.fromEntries(items.map(({ item }) => [item.id, { correct: true }])) } } };
  const concepts = cls.concepts.filter(c => !c.root);
  const E = {
    storeFor: () => ({}),
    leaves: () => Object.fromEntries(cls.concepts.map((c, i) => [c.id, leaf(i === cls.concepts.indexOf(concepts[0]) ? 'seca' : c.root ? 'flor' : 'semilla')]))
  };
  const a = S.alcove(S.ALCOVES.c0, { classes, NX, E, state });
  assert.equal(a.jars.length, 8);
  assert.equal(a.jars[0].level, 4);
  assert.ok(a.jars.slice(1).every(j => j.done === 0 && j.level === 0));
  assert.equal(a.crystals.length, 6);
  assert.equal(a.crystals[0].state, 0);              // su primer grupo tiene un concepto por repasar
  assert.ok(a.crystals.slice(1).every(c => c.state === null));
  assert.equal(a.reviews, 1);
  assert.equal(a.inProgress, 1);
  assert.match(S.summary(a), /1 de 8 misiones en marcha · 1 concepto por repasar/);
});

test('sin clases cargadas la alcoba no inventa estado, y Heterociclos no tiene clase', () => {
  const empty = S.alcove(S.ALCOVES.c0, { classes: {}, NX, E: null, state: {} });
  assert.equal(empty.jars.length, 0);
  assert.match(S.summary(empty), /Cargando/);
  const het = S.alcove(S.ALCOVES['c-60'], { classes, NX, E: null, state: {} });
  assert.equal(het.crystals.length, 4);
  assert.ok(het.crystals.every(c => c.state === null));
  assert.match(S.summary(het), /sin clase propia|no tiene clase/);
});

test('las paradas cercanas a una alcoba comparten su estado', () => {
  assert.equal(S.alcoveOf('cz0'), S.ALCOVES.c0);
  assert.equal(S.alcoveOf('cz60'), S.ALCOVES.c60);
  assert.equal(S.alcoveOf('c180'), null);
});

const manifestPath = path.join(dist, 'aprender', 'manifest.json');
test('el manifiesto es coherente: cada parada, tramo y sprite existe', { skip: !fs.existsSync(manifestPath) && 'aún no se exportaron los cuadros (python tools/aprender-pasillo/export_app.py)' }, () => {
  const M = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const img = name => path.join(dist, 'aprender', 'img', name + '.webp');
  assert.ok(M.v);
  for (const [name, clip] of Object.entries(M.clips)) {
    assert.ok(fs.existsSync(img(name)), `falta la hoja ${name}`);
    if (!name.startsWith('i-')) assert.ok(clip.ms >= clip.n * 100, `${name}: va demasiado rápido (${clip.ms} ms para ${clip.n} cuadros)`);
  }
  // Nunca se retrocede de espaldas: ningún botón reproduce al revés un tramo de caminata.
  for (const [id, node] of Object.entries(M.nodes)) for (const m of node.moves.filter(x => x.to)) {
    const edge = M.edges.find(e => (e.a === id && e.b === m.to) || (e.b === id && e.a === m.to));
    if (edge.clip.startsWith('w-')) assert.equal(edge.a, id, `${id} → ${m.to}: caminaría al revés`);
  }
  for (const [id, node] of Object.entries(M.nodes)) {
    assert.ok(M.clips[node.idle], `${id}: falta su reposo`);
    for (const m of node.moves) {
      if (m.to) {
        assert.ok(M.nodes[m.to], `${id} → ${m.to}: la parada no existe`);
        assert.ok(M.edges.some(e => (e.a === id && e.b === m.to) || (e.b === id && e.a === m.to)), `${id} → ${m.to}: falta el tramo`);
      }
      if (m.clip) assert.ok(M.clips[m.clip], `${id}: falta ${m.clip}`);
      if (m.exit) assert.ok(M.nodes[m.exit]);
    }
  }
  for (const e of M.edges) assert.ok(M.clips[e.clip], `falta el tramo ${e.clip}`);
  for (const [view, ov] of Object.entries(M.overlay)) {
    assert.ok(fs.existsSync(img(ov.atlas.replace(/\.webp$/, ''))), `falta el atlas de ${view}`);
    const def = S.alcoveOf(view);
    assert.equal(ov.jars.length, def.jars, `${view}: frascos`);
    assert.equal(ov.crys.length, def.crystals, `${view}: cristales`);
    assert.ok(ov.jars.some(Boolean), `${view}: sin sprites de frascos`);
    for (const jar of ov.jars.filter(Boolean)) assert.equal(jar.s.length, 5);
  }
});

test('el peso de los cuadros cabe en el presupuesto (≤ 9 MB)', { skip: !fs.existsSync(manifestPath) && 'sin cuadros exportados' }, () => {
  const dir = path.join(dist, 'aprender', 'img');
  const total = fs.readdirSync(dir).reduce((sum, f) => sum + fs.statSync(path.join(dir, f)).size, 0);
  assert.ok(total <= 9 * 1024 * 1024, `pesan ${(total / 1048576).toFixed(1)} MB`);
});

test('los módulos de Aprender compilan', () => {
  for (const f of ['estado.js', 'sotano.js']) assert.doesNotThrow(() => new Function(fs.readFileSync(path.join(dist, 'aprender', f), 'utf8')), f);
});
