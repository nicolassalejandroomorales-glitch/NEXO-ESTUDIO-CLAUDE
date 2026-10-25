// Prueba del estilo de movimiento en botones y transición entre secciones (dist/design-system/pixel-ui.js).
// Reutiliza core/movimiento.js y el sonido existente; no hay audio propio.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const leer = archivo => fs.readFileSync(path.join(__dirname, '..', 'dist', archivo), 'utf8');
const cargar = (archivo, contexto) => vm.runInContext(leer(archivo), contexto);
const estilo = () => ({ props: {}, setProperty(clave, valor) { this.props[clave] = String(valor); }, translate: '' });

// Navegador mínimo: eventos, reloj de cuadros manual, View Transitions y un AudioContext que cuenta.
function entorno({ reducido = false, sonido = true, viewTransitions = true } = {}) {
  const manejadores = {}, llamadas = [], cuenta = { contextos: 0 };
  let ahora = 0, cola = [];
  const app = { style: estilo() };
  const nodo = extra => ({ connect: destino => destino, start() {}, stop() {}, ...extra });
  const param = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {}, value: 0 });
  class AudioContext {
    constructor() { cuenta.contextos++; this.currentTime = 0; this.sampleRate = 8000; this.state = 'running'; this.destination = nodo(); }
    resume() {}
    createOscillator() { return nodo({ frequency: param(), type: '' }); }
    createGain() { return nodo({ gain: param() }); }
    createBiquadFilter() { return nodo({ frequency: param(), Q: { value: 0 }, type: '' }); }
    createBuffer() { return { getChannelData: () => new Float32Array(8000) }; }
    createBufferSource() { return nodo({ buffer: null, loop: false }); }
  }
  const document = {
    body: { classList: { contains: () => false }, dataset: {} },
    documentElement: { style: estilo() },
    addEventListener: (tipo, funcion) => { (manejadores[tipo] ||= []).push(funcion); },
    querySelectorAll: () => [], querySelector: () => null,
    getElementById: id => (id === 'app' ? app : null)
  };
  if (viewTransitions) {
    document.startViewTransition = callback => {
      callback();
      return { ready: Promise.resolve(), updateCallbackDone: Promise.resolve(), finished: Promise.resolve() };
    };
  }
  const window = {
    AudioContext,
    NexoAudio: { settings: { sound: sonido, sfxVolume: .4, hidden: false }, play: nombre => llamadas.push(['NexoAudio', nombre]) },
    NexoPixelText: null
  };
  const contexto = {
    window, document, Math, Number, Object, Array, Set, Map, WeakMap, Float32Array, Boolean, Date, Promise,
    matchMedia: () => ({ matches: reducido }), innerWidth: 1440, innerHeight: 900,
    performance: { now: () => ahora }, setTimeout: () => 0,
    requestAnimationFrame: funcion => { cola.push(funcion); return cola.length; }
  };
  vm.createContext(contexto);
  const cuadros = n => { for (let i = 0; i < n; i++) { ahora += 1000 / 60; const hoy = cola; cola = []; hoy.forEach(f => f(ahora)); } };
  const disparar = (tipo, evento) => (manejadores[tipo] || []).forEach(f => f(evento));
  return { window, document, contexto, cuenta, llamadas, app, cuadros, disparar, pendientes: () => cola.length };
}

function cargarTodo(x, { sintetizadorReal = false } = {}) {
  if (sintetizadorReal) cargar('economy/cofre-sonidos.js', x.contexto);
  else x.window.NexoCofreSonidos = { nombres: ['whoosh', 'land'], play: nombre => x.llamadas.push(['NexoCofreSonidos', nombre]) };
  cargar('core/movimiento.js', x.contexto);
  cargar('design-system/pixel-ui.js', x.contexto);
}

const boton = (extra = {}) => ({ style: estilo(), disabled: false, getAttribute: () => null, ...extra });
const evento = (objetivo, extra = {}) => ({ target: { closest: () => objetivo }, clientX: 100, clientY: 80, ...extra });
// Corre cuadros mientras haya algo en movimiento y devuelve la historia de --pu-y.
function historia(x, objetivo, maximo = 120) {
  const valores = [];
  for (let i = 0; i < maximo && x.pendientes(); i++) { x.cuadros(1); valores.push(Number(objetivo.style.props['--pu-y'])); }
  return valores;
}

// ---- botón: se hunde, rebota al soltar y se asienta, todo en pasos de 2 px ----
{
  const x = entorno(); cargarTodo(x);
  const b = boton();
  x.disparar('pointerdown', evento(b));
  assert.deepEqual(x.llamadas, [['NexoAudio', 'click']], 'el clic suena una vez, por la fachada hacia NexoAudio');
  const bajada = historia(x, b);
  assert.equal(bajada.at(-1), 2, 'al apretar se hunde un píxel de arte (2 px)');
  assert.ok(bajada.every(v => v % 2 === 0), 'solo posiciones alineadas a la grilla del arte (múltiplos de 2)');
  assert.equal(x.pendientes(), 0, 'sin movimiento no queda un bucle de cuadros corriendo');

  x.disparar('pointerup', {});
  const subida = historia(x, b);
  assert.ok(Math.min(...subida) <= -2, `al soltar rebota hacia arriba (${subida.join(',')})`);
  assert.equal(subida.at(-1), 0, 'se asienta en su sitio');
  assert.ok(subida.every(v => v % 2 === 0), 'el rebote también va alineado');
  assert.ok(subida.length < 40, `se asienta rápido (${subida.length} cuadros)`);
  assert.equal(x.pendientes(), 0, 'el bucle se detiene al quedar quieto');
}

// ---- botón desactivado: ni suena ni se mueve; pulsar fuera de botones tampoco ----
{
  const x = entorno(); cargarTodo(x);
  const b = boton({ disabled: true }), c = boton({ getAttribute: () => 'true' });
  x.disparar('pointerdown', evento(b)); x.disparar('pointerdown', evento(c)); x.disparar('pointerdown', evento(null));
  assert.equal(x.llamadas.length, 0);
  assert.equal(x.pendientes(), 0);
  assert.equal(b.style.props['--pu-y'], undefined);
}

// ---- soltar fuera del botón (o cancelar el toque) también lo suelta ----
{
  const x = entorno(); cargarTodo(x);
  const b = boton();
  x.disparar('pointerdown', evento(b)); historia(x, b);
  x.disparar('pointercancel', {});
  assert.equal(historia(x, b).at(-1), 0, 'pointercancel suelta el botón');
}

// ---- movimiento reducido: sin rebote, el estado se ve directo; el sonido sigue (solo lo manda Ajustes) ----
{
  const x = entorno({ reducido: true }); cargarTodo(x);
  const b = boton();
  x.disparar('pointerdown', evento(b));
  const bajada = historia(x, b);
  x.disparar('pointerup', {});
  const subida = historia(x, b);
  assert.equal(bajada.at(-1), 2);
  assert.ok([...bajada, ...subida].every(v => v >= 0), 'sin rebote hacia arriba');
  assert.equal(subida.at(-1), 0);
  assert.deepEqual(x.llamadas, [['NexoAudio', 'click']], 'reducido no es silencio');
}

// ---- transición animada: gira al empezar, cae, aterriza con golpe y se asienta ----
{
  const x = entorno(); cargarTodo(x);
  let cambios = 0;
  x.disparar('pointerdown', evento(boton(), { clientX: 700, clientY: 300 }));
  x.llamadas.length = 0;
  x.window.NexoPixelUI.transition(() => { cambios++; });
  assert.equal(cambios, 1, 'la pantalla cambia');
  assert.deepEqual(x.llamadas, [['NexoCofreSonidos', 'whoosh']], 'al abrir el portal suena el giro, nada más todavía');
  assert.equal(x.document.documentElement.style.props['--vt-x'], '700px', 'el portal se abre donde tocaste');

  const caida = [];
  for (let i = 0; i < 120 && x.pendientes(); i++) { x.cuadros(1); caida.push(x.app.style.translate); }
  const valores = caida.map(t => (t ? Number(t.split(' ')[1].replace('px', '')) : 0));
  assert.ok(valores.includes(-10) || valores[0] <= -8, `parte de arriba (${valores.slice(0, 3)})`);
  assert.ok(valores.every(Number.isInteger), 'posiciones enteras');
  assert.ok(Math.max(...valores) <= 0, 'nunca baja de su sitio (no hace crecer el scroll de la página)');
  assert.ok(valores.slice(valores.findIndex(v => v === 0) + 1).some(v => v < 0), 'al aterrizar rebota hacia arriba contra su piso');
  assert.equal(x.app.style.translate, '', 'al quedar quieta no deja ningún translate puesto');
  const golpes = x.llamadas.filter(l => l[1] === 'land');
  assert.equal(golpes.length, 1, 'el golpe suena una sola vez');
  const primerCruce = valores.findIndex(v => v >= 0);
  assert.ok(primerCruce > 6 && primerCruce < 30, `el golpe cae cuando la pantalla toca (cuadro ${primerCruce})`);
  assert.equal(x.pendientes(), 0, 'sin bucle al terminar');
}

// ---- transición calmada (movimiento reducido, sin View Transitions o calidad baja): solo cambia la pantalla ----
for (const [nombre, opciones, ajuste] of [
  ['movimiento reducido', { reducido: true }],
  ['sin View Transitions', { viewTransitions: false }],
  ['calidad baja', {}, x => { x.document.body.dataset.nexoQuality = 'low'; }]
]) {
  const x = entorno(opciones); cargarTodo(x);
  ajuste?.(x);
  let cambios = 0;
  x.window.NexoPixelUI.transition(() => { cambios++; });
  assert.equal(cambios, 1, `${nombre}: la pantalla cambia`);
  assert.equal(x.llamadas.length, 0, `${nombre}: sin giro ni golpe`);
  assert.equal(x.pendientes(), 0, `${nombre}: sin movimiento`);
  assert.equal(x.app.style.translate, '');
}

// ---- silencio de Ajustes: ni un AudioContext, con el sintetizador real ----
{
  const x = entorno({ sonido: false }); cargarTodo(x, { sintetizadorReal: true });
  x.disparar('pointerdown', evento(boton()));
  x.window.NexoPixelUI.transition(() => {});
  x.cuadros(60);
  assert.equal(x.cuenta.contextos, 0, 'con el sonido apagado no se crea ni un AudioContext');
}
{
  const x = entorno({ sonido: true }); cargarTodo(x, { sintetizadorReal: true });
  x.window.NexoPixelUI.transition(() => {});
  x.cuadros(60);
  assert.equal(x.cuenta.contextos, 1, 'con el sonido encendido el portal usa el sintetizador existente (un solo contexto)');
}

// ---- conexión: el módulo carga antes que el kit y el kit no trae audio propio ----
{
  const build = fs.readFileSync(path.join(__dirname, 'build-startup.cjs'), 'utf8');
  assert.ok(build.indexOf("'core/movimiento.js'") < build.indexOf("'design-system/pixel-ui.js'"), 'movimiento.js se carga antes que pixel-ui.js');
  assert.doesNotMatch(leer('design-system/pixel-ui.js'), /new Howl|AudioContext|createOscillator|NexoAudio/, 'pixel-ui.js suena solo por NexoMovimiento.sonido');
  assert.match(leer('design-system/pixel-ui.css'), /translate:0 calc\(var\(--pu-y,0\)\*1px\)/, 'la cara del botón usa --pu-y');
}

console.log('interfaz-movimiento-test OK');
