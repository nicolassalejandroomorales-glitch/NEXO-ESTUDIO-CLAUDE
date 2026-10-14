// Sonido del estudio: respeta Ajustes (silencio, volúmenes, pestaña oculta) y arranca/para el ambiente. Sin navegador: AudioContext falso.
const assert = require('assert'); const fs = require('fs'); const path = require('path');
let made = 0, started = 0, stopped = 0;
const node = () => { const n = { connect: x => x, disconnect() {}, start() { started++; }, stop() { stopped++; }, frequency: { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {} }, gain: { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, Q: { value: 0 } }; n.connect = x => x || n; return n; };
class FakeCtx { constructor() { made++; this.state = 'running'; this.currentTime = 0; this.sampleRate = 8000; this.destination = node(); }
  createGain() { return node(); } createBiquadFilter() { return node(); } createOscillator() { return node(); } createBufferSource() { return node(); }
  createBuffer(c, n) { return { getChannelData: () => new Float32Array(n) }; } resume() { return Promise.resolve(); } }
global.window = { AudioContext: FakeCtx }; global.document = { hidden: false, addEventListener() {} };
global.setTimeout = () => 0; global.setInterval = () => 0; global.clearTimeout = () => {}; global.clearInterval = () => {};
eval(fs.readFileSync(path.join(__dirname, '../dist/planner/estudio-audio.js'), 'utf8'));
const A = window.NexoEstudioAudio;
assert.deepStrictEqual(A.names.sort(), ['campana', 'pagina', 'pluma', 'sello', 'tinta']);
// Silencio en Ajustes: no suena ni crea contexto.
assert.strictEqual(A.play('campana', { sound: false }), false); assert.strictEqual(made, 0);
assert.strictEqual(A.start({ ambient: false }, 'lluvia'), false); assert.strictEqual(A.playing(), false);
// Con sonido: suena cada efecto; uno desconocido no.
for (const n of A.names) assert.strictEqual(A.play(n, { sound: true, sfxVolume: .5 }), true, n);
assert.strictEqual(A.play('nada', { sound: true }), false);
assert.ok(started > 0, 'creó fuentes de sonido');
// Pestaña oculta: no suena.
document.hidden = true; assert.strictEqual(A.play('sello', { sound: true }), false); assert.strictEqual(A.start({ ambient: true }, 'despejado'), false); document.hidden = false;
// Ambiente: arranca con Ajustes → ambient, y para.
assert.strictEqual(A.start({ ambient: true, ambientVolume: .2 }, 'lluvia'), true); assert.strictEqual(A.playing(), true);
const before = stopped; A.stop(); assert.strictEqual(A.playing(), false); assert.ok(stopped > before, 'detuvo las fuentes');
console.log('estudio-audio-test: ok');
