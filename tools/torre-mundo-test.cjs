// Mundo de la torre (docs/mundo-torre/SPEC.md): objetos dentro del arte, piso caminable y acciones que existen en la app.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const dist = path.join(__dirname, '..', 'dist');
const read = file => fs.readFileSync(path.join(dist, file), 'utf8');

const json = JSON.parse(read('assets/torre/torre.json'));
const png = file => { const b = fs.readFileSync(path.join(dist, 'assets/torre', file)); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
assert.deepEqual(png('mundo.png'), [json.mundo.w, json.mundo.h], 'mundo.png del tamaño del json');

const training = read('academic/training.js');
const modes = [...training.match(/const modes=\[([\s\S]*?)\];/)[1].matchAll(/\['(\w+)'/g)].map(m => m[1]);
const app = read('app.js');
const cards = [...app.matchAll(/data-game-card="?\$?\{?(\w+)/g)].map(m => m[1]);
const cardIds = new Set([...app.matchAll(/\['(memory|hunter|blitz)'/g)].map(m => m[1]).concat(cards));

for (const [key, meta] of Object.entries(json)) {
  const ids = new Set();
  const [y0, y1] = meta.walk;
  assert.ok(y0 > meta.floor && y1 < meta.h, `${key}: la banda para caminar está en el piso`);
  for (const o of meta.objects) {
    const tag = `${key}/${o.id}/${o.room}`;
    assert.ok(!ids.has(o.id + o.room), `${tag} repetido`); ids.add(o.id + o.room);
    const [a, b, c, d] = o.rect;
    assert.ok(a >= 0 && b >= 0 && c <= meta.w && d <= meta.h && c > a && d > b, `${tag}: rectángulo dentro del arte`);
    assert.ok(o.label && o.say, `${tag}: tiene nombre y frase`);
    const [sx, sy] = o.stand;
    assert.ok(sy >= y0 && sy <= y1, `${tag}: la mascota se para en el piso`);
    if (key === 'mundo') {
      const room = meta.rooms[o.room];
      assert.ok(room, `${tag}: sala existe`);
      if (o.action !== 'go') assert.ok(sx >= room.x0 && sx < room.x1, `${tag}: se para dentro de su sala`);
    }
    if (o.action === 'mode') assert.ok(modes.includes(o.mode), `${tag}: modo ${o.mode} existe en Entrenar`);
    else if (o.action === 'game') assert.ok(cardIds.has(o.game), `${tag}: hay tarjeta data-game-card="${o.game}"`);
    else if (o.action === 'go') assert.ok(meta.rooms[o.route] && o.route !== o.room, `${tag}: lleva a la otra sala`);
    else assert.equal(o.action, 'nap', `${tag}: acción conocida`);
  }
}
// Laboratorio por capas (fase 2): 3 horas x 3 estados, objetos dentro del arte y con modos reales.
const lab = JSON.parse(read('assets/torre/lab/lab.json'));
for (const tod of ['dia', 'tarde', 'noche']) {
  const v = png2('lab/' + tod + '-vista.png'); assert.deepEqual(v, [lab.w * lab.fine, lab.h * lab.fine], `vista ${tod}`);
  for (const p of [0, 1, 2]) {
    assert.deepEqual(png2(`lab/${tod}-${p}-fondo.png`), [lab.w * lab.fine, lab.h * lab.fine], `fondo ${tod}-${p}`);
    assert.deepEqual(png2(`lab/${tod}-${p}-frente.png`), [lab.w, lab.h], `frente ${tod}-${p}`);
  }
}
for (const o of lab.objects) {
  const [a, b, c, d] = o.rect;
  assert.ok(a >= 0 && b >= 0 && c <= lab.w && d <= lab.h, `lab/${o.id}: rectángulo dentro del arte`);
  assert.ok(o.stand[1] >= lab.walk[0] && o.stand[1] <= lab.walk[1], `lab/${o.id}: se para en el piso`);
  assert.ok(o.action === 'mode' && modes.includes(o.mode), `lab/${o.id}: modo real de Entrenar`);
}
for (const m of modes) assert.ok(lab.objects.some(o => o.mode === m), `modo ${m} sin objeto en el laboratorio`);
function png2(file) { const b = fs.readFileSync(path.join(dist, 'assets/torre', file)); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }

// Cada modo de Entrenar y cada pestaña del Perfil tiene su objeto.
const objs = Object.values(json).flatMap(m => m.objects).concat(lab.objects);
for (const m of modes) assert.ok(objs.some(o => o.mode === m), `modo ${m} sin objeto en la sala`);
for (const t of tabs) assert.ok(objs.some(o => o.tab === t), `pestaña ${t} sin objeto en la habitación`);
assert.ok(fs.existsSync(path.join(dist, 'games/pep1/index.html')), 'el portal lleva a la campaña');
assert.ok(read('startup-bundle.js').includes('/* world/torre-mundo.js */'), 'torre-mundo.js va en el arranque');
assert.ok(read('mascot/pixel-vida.js').includes('walkTo('), 'PixelVida tiene modo manual');
console.log(`Mundo de la torre: ${objs.length} objetos revisados.`);
