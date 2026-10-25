// Prueba del estilo de movimiento (dist/core/movimiento.js) y de su sonido sobre el sintetizador existente.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const leer = archivo => fs.readFileSync(path.join(__dirname, '..', 'dist', archivo), 'utf8');
const cargar = (archivo, contexto) => vm.runInContext(leer(archivo), contexto);

// WebAudio simulado: cuenta contextos y osciladores, y acepta el encadenado .connect(a).connect(b).
function webAudio() {
  const cuenta = { contextos: 0, osciladores: 0, ruidos: 0 };
  const param = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {}, value: 0 });
  const nodo = extra => ({ connect: destino => destino, start() {}, stop() {}, ...extra });
  class AudioContext {
    constructor() { cuenta.contextos++; this.currentTime = 0; this.sampleRate = 8000; this.state = 'running'; this.destination = nodo(); }
    resume() {}
    createOscillator() { cuenta.osciladores++; return nodo({ frequency: param(), type: '' }); }
    createGain() { return nodo({ gain: param() }); }
    createBiquadFilter() { return nodo({ frequency: param(), Q: { value: 0 }, type: '' }); }
    createBuffer() { return { getChannelData: () => new Float32Array(8000) }; }
    createBufferSource() { cuenta.ruidos++; return nodo({ buffer: null, loop: false }); }
  }
  return { AudioContext, cuenta };
}

function entorno({ sonido = true, cuerpo, reducido = false } = {}) {
  const { AudioContext, cuenta } = webAudio();
  const llamadas = [];
  const window = {
    AudioContext,
    NexoAudio: { settings: { sound: sonido, sfxVolume: .4, hidden: false }, play: nombre => llamadas.push(['NexoAudio', nombre]) }
  };
  const contexto = { window, Math, Number, Object, Array, Set, Float32Array, Boolean, Date };
  if (cuerpo) contexto.document = { body: cuerpo };
  if (reducido) contexto.matchMedia = () => ({ matches: true });
  vm.createContext(contexto);
  return { window, contexto, cuenta, llamadas };
}

// ---- resortes ----
{
  const { window, contexto } = entorno();
  cargar('core/movimiento.js', contexto);
  const M = window.NexoMovimiento;

  const r = M.resorte({ preset: 'aplastar', meta: 1 });
  let pico = 0;
  for (let i = 0; i < 180; i++) { r.avanzar(1 / 60); pico = Math.max(pico, r.valor); }
  assert.ok(pico > 1.02, 'un resorte subamortiguado se pasa un poco de la meta (rebota)');
  assert.ok(pico < 1.6, 'pero no se dispara');
  assert.equal(r.valor, 1, 'se asienta exactamente en la meta');
  assert.equal(r.velocidad, 0);
  assert.ok(r.reposo());
  const cerca = M.resorte({ meta: 10, valor: 10.3 });
  assert.ok(!cerca.reposo() && cerca.reposo(.5), 'reposo acepta una tolerancia (para apagar bucles cuando ya no se nota)');

  // Mismo movimiento a 60 y a 144 cuadros por segundo (paso fijo).
  const a = M.resorte({ preset: 'tapa', meta: -24 }).empujar(-380), b = M.resorte({ preset: 'tapa', meta: -24 }).empujar(-380);
  for (let i = 0; i < 30; i++) a.avanzar(1 / 60);
  for (let i = 0; i < 72; i++) b.avanzar(1 / 144);
  assert.ok(Math.abs(a.valor - b.valor) < .25, `60 y 144 fps coinciden (${a.valor.toFixed(2)} vs ${b.valor.toFixed(2)})`);

  // Un cuadro larguísimo no rompe nada.
  const g = M.resorte({ preset: 'corcho', meta: 5 }).empujar(50);
  g.avanzar(60);
  assert.ok(Number.isFinite(g.valor) && Math.abs(g.valor) < 100, `dt enorme se recorta (${g.valor})`);
  g.avanzar(NaN); g.avanzar(-1);
  assert.ok(Number.isFinite(g.valor), 'dt inválido no genera NaN');

  // fijar y valores por defecto con basura.
  assert.equal(M.resorte({ valor: 'x', rigidez: undefined }).valor, 0);
  assert.equal(M.resorte('brillo').fijar(3).valor, 3);
  assert.deepEqual(Object.keys(M.PRESETS).sort(), ['aplastar', 'brillo', 'camara', 'corcho', 'liquido', 'pagina', 'tapa']);

  // alinear
  assert.equal(M.alinear(3.4), 3);
  assert.equal(M.alinear(3.6), 4);
  assert.equal(M.alinear(3.6, .5), 3.5);
  assert.equal(M.alinear('x'), 0);
}

// ---- escena: pausa de impacto y temblor ----
{
  const { window, contexto } = entorno();
  cargar('core/movimiento.js', contexto);
  const M = window.NexoMovimiento;
  const e = M.escena({ reducido: false });
  const s = e.resorte({ preset: 'aplastar', meta: 1 });
  assert.equal(e.golpe({ pausa: .07, temblor: 10, duracion: .5 }), true);
  assert.equal(e.pausado(), true);
  for (let i = 0; i < 5; i++) {
    assert.equal(e.paso(1 / 60), 0, 'durante la pausa de impacto el tiempo no corre');
    assert.equal(s.valor, 0, 'y los resortes se quedan quietos');
  }
  assert.equal(e.pausado(), false, 'la pausa dura ~70 ms (5 cuadros a 60 fps)');
  assert.ok(e.paso(1 / 60) > 0, 'después el tiempo vuelve');
  assert.ok(s.valor > 0, 'y los resortes se mueven');

  let maximo = 0;
  for (let i = 0; i < 40; i++) {
    const t = e.temblor();
    assert.ok(Number.isInteger(t.x) && Number.isInteger(t.y), 'el temblor es en píxeles enteros');
    maximo = Math.max(maximo, Math.abs(t.x), Math.abs(t.y));
    e.paso(1 / 60);
  }
  assert.ok(maximo >= 3 && maximo <= 10, `el temblor tiene fuerza y no pasa de su amplitud (${maximo})`);
  assert.deepEqual({ ...e.temblor() }, { x: 0, y: 0 }, 'el temblor termina solo');

  // Un temblor más débil no pisa a uno fuerte en curso.
  const f = M.escena({ reducido: false });
  f.golpe({ pausa: 0, temblor: 20, duracion: 1 }); f.paso(1 / 60);
  f.golpe({ pausa: 0, temblor: 2, duracion: .2 });
  let peor = 0; for (let i = 0; i < 10; i++) { const t = f.temblor(); peor = Math.max(peor, Math.abs(t.x)); f.paso(1 / 60); }
  assert.ok(peor > 2, 'se conserva el temblor más fuerte');
}

// ---- movimiento reducido ----
{
  const { window, contexto } = entorno();
  cargar('core/movimiento.js', contexto);
  const M = window.NexoMovimiento;
  const e = M.escena({ reducido: true });
  const r = e.resorte({ preset: 'tapa', meta: -24 });
  r.empujar(-500);
  assert.equal(r.avanzar(1 / 60), -24, 'con movimiento reducido el resorte salta a su destino');
  assert.equal(e.golpe({ pausa: .1, temblor: 20 }), false, 'sin pausa de impacto');
  assert.equal(e.paso(1 / 60), 1 / 60, 'el tiempo nunca se congela');
  assert.deepEqual({ ...e.temblor() }, { x: 0, y: 0 }, 'ni temblor');
  assert.equal(M.resorte({ preset: 'tapa', meta: 2, reducido: true }).avanzar(.016), 2);
}
{
  // La detección lee prefers-reduced-motion, la clase del cuerpo y el ajuste ambiental.
  const normal = entorno({ cuerpo: { classList: { contains: () => false }, dataset: {} } });
  cargar('core/movimiento.js', normal.contexto);
  assert.equal(normal.window.NexoMovimiento.reducido(), false);
  const sistema = entorno({ reducido: true, cuerpo: { classList: { contains: () => false }, dataset: {} } });
  cargar('core/movimiento.js', sistema.contexto);
  assert.equal(sistema.window.NexoMovimiento.reducido(), true);
  const clase = entorno({ cuerpo: { classList: { contains: c => c === 'reduce-motion' }, dataset: {} } });
  cargar('core/movimiento.js', clase.contexto);
  assert.equal(clase.window.NexoMovimiento.reducido(), true);
  const ajuste = entorno({ cuerpo: { classList: { contains: () => false }, dataset: { nexoAmbientMotion: 'reduced' } } });
  cargar('core/movimiento.js', ajuste.contexto);
  assert.equal(ajuste.window.NexoMovimiento.reducido(), true);
}

// ---- cantidad de partículas según la calidad ----
{
  const caso = (calidad, n) => {
    const x = entorno({ cuerpo: { classList: { contains: () => false }, dataset: { nexoQuality: calidad } } });
    cargar('core/movimiento.js', x.contexto);
    return x.window.NexoMovimiento.cantidad(n);
  };
  assert.equal(caso('high', 100), 100);
  assert.equal(caso('balanced', 100), 70);
  assert.equal(caso('low', 100), 35);
  assert.equal(caso('low', 1), 1, 'si pides algo, al menos una');
  assert.equal(caso('high', 0), 0);
  const x = entorno({ reducido: true, cuerpo: { classList: { contains: () => false }, dataset: {} } });
  cargar('core/movimiento.js', x.contexto);
  assert.equal(x.window.NexoMovimiento.cantidad(50), 0, 'sin partículas con movimiento reducido');
}

// ---- sonido: fachada sobre el audio que ya existe ----
{
  const { window, contexto, llamadas } = entorno();
  window.NexoCofreSonidos = { nombres: ['land', 'pop'], play: (n, r) => llamadas.push(['efectos', n, r]) };
  cargar('core/movimiento.js', contexto);
  const M = window.NexoMovimiento;
  assert.equal(M.sonido('golpe'), true);
  assert.equal(M.sonido('estallar', 'raro'), true);
  assert.equal(M.sonido('comprar'), true);
  assert.equal(M.sonido('equip'), true, 'también acepta el nombre directo');
  assert.deepEqual(llamadas, [['efectos', 'land', undefined], ['efectos', 'pop', 'raro'], ['NexoAudio', 'purchase'], ['NexoAudio', 'equip']]);
  assert.equal(M.sonido('inexistente'), false);
  assert.equal(M.sonido('lanzar'), false, 'un sonido que el sintetizador no tiene devuelve false, no revienta');
  delete window.NexoCofreSonidos; delete window.NexoAudio;
  assert.equal(M.sonido('golpe'), false, 'sin audio cargado no revienta');
  assert.equal(M.sonido('clic'), false);
}

// ---- sintetizador real: cada evento existe, respeta el silencio y suena cuando se puede ----
{
  const eventos = (() => { const x = entorno(); cargar('core/movimiento.js', x.contexto); return x.window.NexoMovimiento.EVENTOS; })();

  const callado = entorno({ sonido: false });
  cargar('economy/cofre-sonidos.js', callado.contexto);
  for (const nombre of callado.window.NexoCofreSonidos.nombres) callado.window.NexoCofreSonidos.play(nombre, 'legendario');
  assert.equal(callado.cuenta.contextos, 0, 'con el sonido apagado en Ajustes no se crea ni un AudioContext');

  const oculto = entorno();
  oculto.window.NexoAudio.settings.hidden = true;
  cargar('economy/cofre-sonidos.js', oculto.contexto);
  oculto.window.NexoCofreSonidos.play('land');
  assert.equal(oculto.cuenta.contextos, 0, 'con la pestaña oculta tampoco');

  const x = entorno();
  cargar('economy/cofre-sonidos.js', x.contexto);
  cargar('core/movimiento.js', x.contexto);
  const S = x.window.NexoCofreSonidos, M = x.window.NexoMovimiento;
  for (const nombre of S.nombres.filter(n => n !== 'reveal')) {
    const antes = x.cuenta.osciladores + x.cuenta.ruidos;
    S.play(nombre);
    assert.ok(x.cuenta.osciladores + x.cuenta.ruidos > antes, `"${nombre}" produce sonido`);
  }
  const rarezas = {};
  for (const rareza of ['comun', 'poco', 'raro', 'legendario']) {
    const antes = x.cuenta.osciladores;
    S.play('reveal', rareza);
    rarezas[rareza] = x.cuenta.osciladores - antes;
  }
  assert.ok(rarezas.comun < rarezas.poco && rarezas.poco < rarezas.raro && rarezas.raro < rarezas.legendario, `lo más raro suena más (${JSON.stringify(rarezas)})`);
  assert.equal(x.cuenta.contextos, 1, 'todos los sonidos comparten un solo AudioContext');

  // Todo el vocabulario de eventos está respaldado por algún sonido real.
  for (const [evento, nombre] of Object.entries(eventos)) {
    const interfaz = ['click', 'confirm', 'purchase', 'equip', 'error'].includes(nombre);
    assert.ok(interfaz || S.nombres.includes(nombre), `el evento "${evento}" → "${nombre}" existe`);
    assert.equal(M.sonido(evento), true);
  }
}

// ---- el módulo entra en el arranque y no mete dependencias nuevas ----
{
  const build = fs.readFileSync(path.join(__dirname, 'build-startup.cjs'), 'utf8');
  assert.match(build, /'core\/movimiento\.js'/, 'movimiento.js está en la lista del bundle de arranque');
  assert.ok(build.indexOf("'core/movimiento.js'") < build.indexOf("'economy/cofre-fx.js'"), 'se carga antes que el cofre');
  assert.doesNotMatch(leer('core/movimiento.js'), /new Howl|new (window\.)?AudioContext|createOscillator/, 'no crea un segundo sistema de audio');
}

console.log('movimiento-test OK');
