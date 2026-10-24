/* Estilo de movimiento de Nexo (skill nexo-animacion, docs/animacion/SPEC.md).
   Resortes, escena (pausa de impacto + temblor entero), alineación a píxel y sonido por evento.
   No dibuja nada: cada pantalla pinta lo que este módulo calcula.
   Sonido: no hay sistema propio. Reparte entre NexoAudio (interfaz) y NexoCofreSonidos (efectos); el silencio y el
   volumen salen siempre de NexoAudio.settings (Ajustes). */
(() => {
  'use strict';
  const PASO = 1 / 120;   // paso fijo de integración: el mismo movimiento a 60 o a 144 cuadros por segundo
  const DT_MAX = .05;     // un cuadro larguísimo (pestaña dormida) no hace explotar el resorte
  const PRESETS = Object.freeze({
    aplastar: Object.freeze({ rigidez: 260, amortiguacion: 14 }),   // cuerpo que se aplasta y rebota
    liquido: Object.freeze({ rigidez: 120, amortiguacion: 5 }),     // se agita y tarda en calmarse
    corcho: Object.freeze({ rigidez: 380, amortiguacion: 12 }),     // rápido y nervioso
    tapa: Object.freeze({ rigidez: 170, amortiguacion: 9 }),        // sube, se pasa y se asienta
    brillo: Object.freeze({ rigidez: 90, amortiguacion: 8 }),       // luz que late
    camara: Object.freeze({ rigidez: 220, amortiguacion: 18 })      // casi sin rebote
  });
  // Vocabulario de eventos -> nombre del sonido. Los de interfaz viven en NexoAudio; el resto, en el sintetizador de efectos.
  const EVENTOS = Object.freeze({
    preparar: 'rumble', lanzar: 'launch', estallar: 'pop', girar: 'whoosh', paso: 'tick', golpe: 'land', premio: 'reveal',
    brillo: 'sparkle', burbuja: 'bubble',
    clic: 'click', confirmar: 'confirm', comprar: 'purchase', equipar: 'equip', error: 'error'
  });
  const INTERFAZ = new Set(['click', 'confirm', 'purchase', 'equip', 'error']);
  const ESCALA_CALIDAD = { low: .35, balanced: .7, high: 1 };
  const num = (valor, porDefecto) => Number.isFinite(Number(valor)) ? Number(valor) : porDefecto;

  function reducido() {
    try {
      if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
      const cuerpo = typeof document !== 'undefined' ? document.body : null;
      return Boolean(cuerpo && (cuerpo.classList.contains('reduce-motion') || cuerpo.dataset.nexoAmbientMotion === 'reduced'));
    } catch (_) { return false; }
  }

  // Resorte amortiguado: se mueve cambiando `meta`, se golpea con `empujar` y se avanza con `avanzar(dt)`.
  function resorte(opciones = {}) {
    const base = typeof opciones === 'string' ? { preset: opciones } : opciones;
    const o = { ...(PRESETS[base.preset] || {}), ...base };
    const instantaneo = base.reducido ?? reducido();
    const r = {
      rigidez: num(o.rigidez, 200), amortiguacion: num(o.amortiguacion, 12),
      valor: num(o.valor, 0), velocidad: num(o.velocidad, 0), meta: num(o.meta, num(o.valor, 0)),
      empujar(v) { if (!instantaneo) r.velocidad += num(v, 0); return r; },
      fijar(valor) { r.valor = r.meta = num(valor, r.valor); r.velocidad = 0; return r; },
      reposo() { return Math.abs(r.valor - r.meta) < .001 && Math.abs(r.velocidad) < .001; },
      avanzar(dt) {
        if (instantaneo) { r.valor = r.meta; r.velocidad = 0; return r.valor; }
        let resto = Math.min(Math.max(num(dt, 0), 0), DT_MAX);
        while (resto > 1e-9) {
          const h = Math.min(PASO, resto);
          r.velocidad += (-r.rigidez * (r.valor - r.meta) - r.amortiguacion * r.velocidad) * h;
          r.valor += r.velocidad * h;
          resto -= h;
        }
        if (r.reposo()) { r.valor = r.meta; r.velocidad = 0; }
        return r.valor;
      }
    };
    return r;
  }

  // Escena: resortes que comparten reloj, pausa de impacto (todo se congela un instante) y temblor de cámara en píxeles enteros.
  // En cada cuadro: dt = escena.paso(dtReal). Durante la pausa devuelve 0: úsalo también para partículas.
  function escena({ reducido: forzado } = {}) {
    const quieto = forzado ?? reducido();
    const resortes = [];
    let espera = 0, restante = 0, duracion = 0, amplitud = 0, fase = 0;
    return {
      reducido: quieto,
      resorte(opciones) {
        const r = resorte({ ...(typeof opciones === 'string' ? { preset: opciones } : opciones), reducido: quieto });
        resortes.push(r);
        return r;
      },
      golpe({ pausa = .07, temblor = 0, duracion: dur = .5 } = {}) {
        if (quieto) return false;
        espera = Math.max(espera, num(pausa, 0));
        const actual = duracion > 0 ? amplitud * (restante / duracion) ** 2 : 0;
        if (num(temblor, 0) > 0 && temblor >= actual) { amplitud = temblor; duracion = Math.max(.05, num(dur, .5)); restante = duracion; }
        return true;
      },
      paso(dt) {
        const d = Math.min(Math.max(num(dt, 0), 0), DT_MAX);
        if (espera > 0) { espera = Math.max(0, espera - d); return 0; }
        for (const r of resortes) r.avanzar(d);
        if (restante > 0) { restante = Math.max(0, restante - d); fase += d; }
        return d;
      },
      pausado: () => espera > 0,
      temblor() {
        if (restante <= 0 || amplitud <= 0) return { x: 0, y: 0 };
        const fuerza = amplitud * (restante / duracion) ** 2;
        return { x: Math.round(fuerza * Math.sin(fase * 90)) || 0, y: Math.round(fuerza * .6 * Math.cos(fase * 71)) || 0 };
      }
    };
  }

  const alinear = (valor, paso = 1) => Math.round(num(valor, 0) / paso) * paso;

  // Cuántas partículas dibujar según la calidad gráfica de Ajustes (platform/performance.js). Con movimiento reducido, ninguna.
  function cantidad(n) {
    const total = Math.max(0, Math.floor(num(n, 0)));
    if (!total || reducido()) return 0;
    const calidad = typeof document !== 'undefined' ? document.body?.dataset?.nexoQuality : '';
    return Math.max(1, Math.round(total * (ESCALA_CALIDAD[calidad] ?? 1)));
  }

  // Devuelve true si el evento existe (no si sonó: el silencio lo decide Ajustes).
  function sonido(evento, rareza) {
    const nombre = EVENTOS[evento] || evento;
    if (INTERFAZ.has(nombre)) {
      if (!window.NexoAudio) return false;
      window.NexoAudio.play(nombre);
      return true;
    }
    const sintetizador = window.NexoCofreSonidos;
    if (!sintetizador || !sintetizador.nombres.includes(nombre)) return false;
    sintetizador.play(nombre, rareza);
    return true;
  }

  window.NexoMovimiento = Object.freeze({ PRESETS, EVENTOS, resorte, escena, alinear, reducido, cantidad, sonido });
})();
