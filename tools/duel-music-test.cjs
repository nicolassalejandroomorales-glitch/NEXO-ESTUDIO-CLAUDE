// Música del duelo: temas bien formados, no suena si la música está apagada, y programa notas con un AudioContext de mentira.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let nodes = 0, starts = 0;
const param = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {} });
const node = () => { nodes++; const n = { connect: x => x || n, start() { starts++; }, stop() {}, gain: param(), frequency: param(), setPeriodicWave() {}, buffer: null, type: '' }; return n; };
class FakeCtx { constructor() { this.currentTime = 0; this.sampleRate = 8000; this.destination = {}; this.state = 'running'; }
  createGain() { return node(); } createOscillator() { return node(); } createBufferSource() { return node(); } createBiquadFilter() { return node(); }
  createBuffer(c, len) { return { getChannelData: () => new Float32Array(len) }; } createPeriodicWave() { return {}; } resume() { return Promise.resolve(); } }
const timers = [];
const window = { AudioContext: FakeCtx, NexoAudio: { settings: { sound: true, music: true, musicVolume: 0.15, sfxVolume: 0.4, gesture: true, hidden: false } } };
const ctx = { window, document: { addEventListener() {}, hidden: false }, setInterval: fn => { timers.push(fn); return timers.length; }, clearInterval() {}, Math, Float32Array, Promise };
vm.runInNewContext(fs.readFileSync('dist/game/duel-music.js', 'utf8'), ctx, { filename: 'duel-music' });
const M = window.NexoDuelMusic;
// 1) Los 4 ramos tienen tema y están bien formados.
assert.deepEqual([...M.songs].sort(), ['analitica', 'fisico', 'fisio', 'organica']);
for (const [id, s] of Object.entries(M.SONGS)) {
  assert.equal(s.lead.length, 32, id); assert.equal(s.bass.length, 16, id); assert.equal(s.prog.length, 4, id);
  assert.ok(s.bpm >= 80 && s.bpm <= 160, id); assert.ok(s.lead.filter(x => x !== null).length >= 8, `${id}: melodía muy corta`);
  for (const [off, tones] of s.prog) assert.ok(Number.isInteger(off) && tones.length === 3);
}
// 2) Temas distintos: ninguna melodía repite a otra.
const leads = Object.values(M.SONGS).map(s => JSON.stringify(s.lead)); assert.equal(new Set(leads).size, 4);
// 3) Con la música apagada no suena; con sonido apagado no hay efectos.
window.NexoAudio.settings.music = false;
assert.equal(M.start('organica'), false); assert.equal(M.playing, false);
window.NexoAudio.settings.sound = false; const before = starts; M.sfx('win'); assert.equal(starts, before);
// 4) Con todo activo: arranca, programa notas por capas y se detiene.
window.NexoAudio.settings.music = true; window.NexoAudio.settings.sound = true;
assert.equal(M.start('fisio'), true); assert.equal(M.playing, true);
const a = starts; M.setIntensity(2); window.NexoDuelMusic.sfx('right', 3); assert.ok(starts > a, 'los efectos suenan');
M.stop(); assert.equal(M.playing, false);
// 5) Un ramo desconocido cae en el de Orgánica, sin romper.
assert.equal(M.start('nada'), true); M.stop();
console.log('OK: música del duelo (4 temas originales, capas, efectos y respeto a Ajustes).');
