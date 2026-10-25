// Prueba de la apertura del Grimorio con el estilo de movimiento (dist/platform/animation.js + core/movimiento.js).
// Carga los módulos reales en una página mínima, deja correr la intro completa en un Chromium y mide cuadro a cuadro.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const dist = path.resolve(__dirname, '..', 'dist');
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
const PAGINA = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/design-system/update01.css">
<body style="margin:0;background:#101612"><main id="raiz"><div class="grimoire" data-book-course="index"><div class="grimoire-spread">Grimorio</div></div></main>
<script>
  window.llamadas = []; window.contextos = 0;
  window.AudioContext = class { constructor() { window.contextos++; this.currentTime = 0; this.sampleRate = 8000; this.state = 'running'; const n = e => ({ connect: d => d, start() {}, stop() {}, ...e }), p = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {}, value: 0 });
    this.destination = n(); this.createOscillator = () => n({ frequency: p(), type: '' }); this.createGain = () => n({ gain: p() });
    this.createBiquadFilter = () => n({ frequency: p(), Q: { value: 0 }, type: '' }); this.createBuffer = () => ({ getChannelData: () => new Float32Array(8000) }); this.createBufferSource = () => n({ buffer: null, loop: false }); } resume() {} };
  window.NexoAudio = { settings: { sound: true, sfxVolume: .4, hidden: false }, play: nombre => window.llamadas.push([Math.round(performance.now() - window.t0), 'archivo:' + nombre]) };
</script>
<script src="/core/movimiento.js"></script><script src="/economy/cofre-sonidos.js"></script><script src="/platform/animation.js"></script>`;

const servidor = http.createServer((pedido, respuesta) => {
  const ruta = new URL(pedido.url, 'http://x').pathname;
  if (ruta === '/') { respuesta.writeHead(200, { 'Content-Type': 'text/html' }).end(PAGINA); return; }
  const archivo = path.resolve(dist, `.${decodeURIComponent(ruta)}`);
  if (!archivo.startsWith(`${dist}${path.sep}`)) { respuesta.writeHead(403).end(); return; }
  fs.readFile(archivo, (error, datos) => error ? respuesta.writeHead(404).end() : respuesta.writeHead(200, { 'Content-Type': tipos[path.extname(archivo)] || 'application/octet-stream' }).end(datos));
});

// Corre la intro y devuelve lo medido. `opciones.sonido` apaga el sonido de Ajustes; `opciones.saltar` toca la capa a los 900 ms.
async function correr(browser, url, { sonido = true, saltar = false, reducido = false, ancho = 1440, alto = 900 } = {}) {
  const contexto = await browser.newContext({ viewport: { width: ancho, height: alto }, reducedMotion: reducido ? 'reduce' : 'no-preference' });
  const pagina = await contexto.newPage();
  const errores = [];
  pagina.on('pageerror', e => errores.push(e.message));
  await pagina.goto(url);
  await pagina.evaluate(async ({ sonido, saltar }) => {
    window.NexoAudio.settings.sound = sonido;
    document.body.dataset.nexoQuality = 'high';
    // El sintetizador se vigila por evento: se anota cuándo se pide cada sonido de efectos.
    const original = window.NexoCofreSonidos.play;
    const registro = window.llamadas;
    const sintetizador = { ...window.NexoCofreSonidos, play: (n, r) => { registro.push([Math.round(performance.now() - window.t0), n]); original(n, r); } };
    Object.defineProperty(window, 'NexoCofreSonidos', { value: Object.freeze(sintetizador), configurable: true });
    const raiz = document.getElementById('raiz');
    window.muestras = [];
    window.t0 = performance.now();
    window.NexoAnimation.navigate(raiz, 'home', 'learn');
    let saltado = false;
    await new Promise(fin => {
      const cuadro = ahora => {
        const capa = document.querySelector('.grimoire-intro');
        const t = Math.round(ahora - window.t0);
        if (capa) {
          const tapa = capa.querySelector('.gi-cover'), escenario = capa.querySelector('.gi-stage');
          const m = /rotateY\(([-\d.]+)deg\)/.exec(tapa?.style.transform || '');
          window.muestras.push({ t, angulo: m ? Number(m[1]) : null, escenario: escenario.style.transform, temblor: escenario.style.translate, pausadas: document.getAnimations().filter(a => a.playState === 'paused').length });
          if (saltar && !saltado && t > 900) { saltado = true; capa.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); }
        } else if (t > 300) { window.fin = t; fin(); return; }
        if (t > 6000) { window.fin = -1; fin(); return; }
        requestAnimationFrame(cuadro);
      };
      requestAnimationFrame(cuadro);
    });
  }, { sonido, saltar });
  const datos = await pagina.evaluate(() => ({ muestras: window.muestras, llamadas: window.llamadas, fin: window.fin, contextos: window.contextos,
    libro: getComputedStyle(document.querySelector('.grimoire')).opacity }));
  await contexto.close();
  return { ...datos, errores };
}

(async () => {
  await new Promise(resolver => servidor.listen(0, '127.0.0.1', resolver));
  const url = `http://127.0.0.1:${servidor.address().port}/`;
  const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'], headless: true }
    : { channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  try {
    // 1) Intro completa en escritorio, con sonido.
    const a = await correr(browser, url);
    assert.deepEqual(a.errores, [], 'sin errores en la página');
    // Sin GPU cada cuadro dura 50–200 ms: una pausa de 70 ms se ve más larga y la intro dura algo más que 3,4 s.
    assert.ok(a.fin > 3000 && a.fin < 6500, `la intro termina (fue ${a.fin} ms)`);
    assert.equal(a.libro, '1', 'al terminar, el grimorio real queda visible');
    const efectos = a.llamadas.filter(([, n]) => !String(n).startsWith('archivo:'));
    assert.deepEqual(efectos.map(([, n]) => n), ['land', 'rumble', 'land'], 'suenan: aterrizaje, preparar (broche) y golpe de la tapa');
    const inicio = a.llamadas.find(([, n]) => n === 'archivo:grimoire')?.[0];
    assert.ok(inicio >= 0, 'el sonido largo del grimorio sigue sonando');
    const [aterriza, prepara, golpea] = efectos.map(([t]) => t - inicio);
    assert.ok(aterriza > 500 && aterriza < 1500, `el libro aterriza a ~0,8 s de empezar (fue ${aterriza})`);
    assert.ok(prepara > 1400 && prepara < 2600, `el broche prepara a ~1,5 s (fue ${prepara})`);
    assert.ok(golpea > 2000 && golpea < 3400, `la tapa golpea la mesa a ~2,3 s (fue ${golpea})`);
    assert.ok(aterriza < prepara && prepara < golpea, 'orden: aterriza, broche, golpe de tapa');
    const angulos = a.muestras.map(m => m.angulo).filter(v => v !== null);
    assert.ok(Math.min(...angulos) >= -168.01, 'la tapa nunca atraviesa la mesa (≥ -168°)');
    assert.ok(angulos.at(-1) <= -160, `la tapa termina abierta (fue ${angulos.at(-1)})`);
    assert.ok(Math.max(...angulos) <= 3.01, 'el anticipo de la tapa es chico');
    assert.ok(a.muestras.some(m => m.pausadas > 0), 'hay pausa de impacto: las animaciones se congelan un instante');
    const congeladas = a.muestras.filter(m => m.pausadas > 0).length;
    assert.ok(congeladas >= 2 && congeladas <= 20, `las pausas duran pocos cuadros (${congeladas})`);
    assert.ok(a.muestras.some(m => /^-?\d+px -?\d+px$/.test(m.temblor) && m.temblor !== '0px 0px'), 'la cámara tiembla con píxeles enteros');
    assert.ok(a.muestras.every(m => !/\d\.\d+px/.test(m.escenario.split(' scale')[0])), 'el libro se mueve en píxeles enteros');
    const subida = a.muestras.map(m => Number((/translateY\((-?\d+)px\)/.exec(m.escenario) || [])[1])).filter(Number.isFinite);
    assert.ok(Math.max(...subida) >= 60, 'el libro parte abajo y sube');
    assert.ok(a.contextos === 1, `un solo AudioContext del sintetizador (fue ${a.contextos})`);

    // 2) Silencio de Ajustes: ni un AudioContext.
    const callado = await correr(browser, url, { sonido: false });
    assert.equal(callado.contextos, 0, 'con el sonido apagado no se crea ningún AudioContext');
    assert.deepEqual(callado.errores, []);

    // 3) Saltar con un toque: la capa desaparece al tiro, sin errores.
    const salto = await correr(browser, url, { saltar: true });
    assert.deepEqual(salto.errores, []);
    assert.ok(salto.fin > 900 && salto.fin < 2200, `saltar cierra la intro enseguida (fue ${salto.fin} ms)`);
    assert.equal(salto.libro, '1');

    // 4) Móvil 390: mismo guion, sin errores.
    const movil = await correr(browser, url, { ancho: 390, alto: 844 });
    assert.deepEqual(movil.errores, []);
    assert.ok(movil.fin > 3000 && movil.fin < 6500, `en móvil termina (fue ${movil.fin} ms)`);
    assert.equal(movil.llamadas.filter(([, n]) => !String(n).startsWith('archivo:')).length, 3);

    // 5) Movimiento reducido: sin capa ni resortes, solo un fundido corto.
    const quieto = await correr(browser, url, { reducido: true });
    assert.deepEqual(quieto.errores, []);
    assert.equal(quieto.muestras.length, 0, 'con movimiento reducido no se arma la capa de la intro');
    assert.equal(quieto.llamadas.filter(([, n]) => !String(n).startsWith('archivo:')).length, 0, 'ni suenan los efectos de la intro');

    const cuadros = a.muestras.slice(1).map((m, i) => m.t - a.muestras[i].t).sort((x, y) => x - y);
    console.log(`Apertura del Grimorio OK · termina a ${a.fin} ms · aterriza ${aterriza} ms, broche ${prepara} ms, golpe de tapa ${golpea} ms · cuadro p50 ${cuadros[Math.floor(cuadros.length * .5)]} ms, p95 ${cuadros[Math.floor(cuadros.length * .95)]} ms`);
  } finally {
    await browser.close();
    servidor.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
