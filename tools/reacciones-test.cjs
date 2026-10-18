const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const window={};
vm.runInNewContext(fs.readFileSync('dist/mascot/reacciones.js','utf8'),{window});
const {pick,now,bind}=window.NexoReacciones;

// Sin nada que comentar, la mascota se queda callada.
assert.equal(pick({}),null);
assert.equal(pick({days:null,away:1,streak:2,grade:null}),null);

// Prueba muy cerca manda sobre todo lo demás.
assert.equal(pick({days:0,grade:6.5,streak:7}).act,'nerviosa');
assert.match(pick({days:1}).say,/1 día/);
assert.match(pick({days:3}).say,/3 días/);

// Notas: alta celebra, baja consuela, intermedia no dice nada.
assert.equal(pick({grade:6.2}).act,'baile');
assert.equal(pick({grade:3.4}).act,'confundida');
assert.equal(pick({grade:4.8}),null);

// Volver tras días sin entrar, y racha solo en hitos.
assert.equal(pick({away:5}).act,'saludo');
assert.equal(pick({away:2}),null);
assert.equal(pick({streak:7}).act,'deslumbrada');
assert.equal(pick({streak:8}),null);

// Prueba lejana (hasta 7 días) solo si no hay algo más importante.
assert.equal(pick({days:6}).act,'idea');
assert.equal(pick({days:6,away:4}).act,'saludo');

// now() usa el proveedor y no revienta si falla o no existe.
assert.equal(now(),null);
bind(()=>({days:0}));
assert.equal(now().act,'nerviosa');
bind(()=>{throw new Error('x');});
assert.equal(now(),null);
console.log('reacciones OK');
