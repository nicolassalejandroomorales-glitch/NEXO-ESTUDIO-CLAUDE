/* Recorrido por la app real (docs/tutorial/SPEC.md, «REDISEÑO»). El Grimorio lleva a una pantalla de verdad, oscurece el resto y resalta con un halo
   lo que explica. Modular: cada sección es un objeto de SECCIONES (ruta + pasos { sel, pose, texto }). Si un objetivo no existe, se salta sin trabarse.
   Carga perezosa desde tutorial.js. NexoRecorrido.active = true mientras corre (app.js no manda al tutorial desde el Inicio en ese rato). */
(() => {
  'use strict';
  const HERE = document.currentScript?.src || new URL('tutorial/recorrido.js', document.baseURI).href;

  // Para sumar una pantalla: agrega una sección aquí y un paso { recorrido: '<id>' } en STEPS de tutorial.js.
  const SECCIONES = {
    inicio: {
      ruta: 'home',
      pasos: [
        { sel: '.home-clock', pose: 'senalar', texto: 'El *reloj de la torre*: la hora, tus minutos de hoy y cuánto falta para tu próxima prueba. «Estudiar» enciende el cronómetro.' },
        { sel: '.sign-pruebas', pose: 'importante', texto: 'Las *próximas pruebas*, ordenadas por urgencia. Las fechas de este semestre ya las traigo anotadas.' },
        { sel: '.sign-dia', pose: 'dedo', texto: '*Tu día*: la meta diaria y los repasos que vencen. Volver un poco cada día pesa más que una noche heroica.' },
        { sel: '.sign-continuar', pose: 'abrir', texto: '*Continuar*: te dejo justo donde estabas, con el mapa de preparación de tu próxima prueba.' }
      ]
    },
    aprender: {
      ruta: 'learn',
      pasos: [
        { sel: '.sotano-stage', pose: 'abrir', texto: 'El *Sótano de los Cristales*: un pasillo con una puerta por ramo. Cada puerta lleva a su Cámara, y ahí vive tu *ruta al 7*.' },
        { sel: '.sotano-pad [data-move="fwd"]', toca: true, pose: 'senalar', texto: 'Pruébalo tú: toca *Avanzar* y caminamos un tramo. Con *Dar la vuelta* regresas; también sirven las flechas del teclado.' },
        { sel: '.sotano-stage', pose: 'dedo', texto: 'Sobre las piedras dibujo tu estado *real*: frascos y cristales según lo que has demostrado, no según lo que has releído.' }
      ]
    },
    organizacion: {
      ruta: 'planner',
      pasos: [
        { sel: '.estudio-tabs', pose: 'senalar', texto: 'El *estudio de planos*: Hoy, Calendario, Pruebas, Notas y Laboratorio, bajo un mismo techo.' },
        { sel: '.plan-bloques', pose: 'importante', texto: 'Tu *plan del día*: con tus fechas de prueba, el tiempo que tienes y lo que ya sabes, te digo qué estudiar primero y por qué.' },
        { sel: '.viene', pose: 'dedo', texto: '*Lo que viene*: los relojes de arena cuentan los días que faltan para cada prueba.' }
      ]
    },
    perfil: {
      ruta: 'profile',
      pasos: [
        { sel: '.carta-ventana', pose: 'feliz', texto: 'Tu *compañero*: te habla según lo que viene, por ejemplo cuántos días faltan para una prueba.' },
        { sel: '.carta-rango', pose: 'importante', texto: 'Tu *rango arcano*: subes por evidencia real, no por tiempo sentado.' },
        { sel: '.carta-botones', pose: 'guino', texto: '*Vestuario*, *Estadísticas* y *Ajustes*. En Ajustes puedes volver a invocarme cuando quieras.' }
      ]
    }
  };

  let cssLoaded = false, ui = null;
  const R = { active: false, SECCIONES };
  const esc = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ensureCss() {
    if (cssLoaded) return; cssLoaded = true;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = new URL('./recorrido.css?v=2', HERE).href; document.head.append(l);
  }
  const visible = e => { const r = e && e.getBoundingClientRect(); return !!r && r.width > 4 && r.height > 4; };
  const esperar = (sel, ms) => new Promise(ok => {
    const t0 = performance.now();
    (function mira() { const e = document.querySelector(sel); if (visible(e)) return ok(e); if (performance.now() - t0 > ms) return ok(null); setTimeout(mira, 100); })();
  });

  // opts: { volver() } se llama al terminar o salir.
  R.run = function run(id, opts = {}) {
    const sec = SECCIONES[id]; if (!sec) { opts.volver?.(); return; }
    ensureCss(); R.close();
    R.active = true;
    const veil = document.createElement('div'); veil.className = 'rec-veil';
    const halo = document.createElement('div'); halo.className = 'rec-halo'; halo.hidden = true;
    const box = document.createElement('aside'); box.className = 'rec-box'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite');
    box.innerHTML = '<div class="rec-grim"></div><div class="rec-body"><p></p><div class="rec-nav"><button class="secondary-btn rec-salir" type="button">Salir</button><span></span><button class="secondary-btn rec-atras" type="button">Atrás</button><button class="primary-btn rec-sig" type="button">Siguiente</button></div></div>';
    document.body.append(veil, halo, box);
    ui = { veil, halo, box, raf: 0, target: null, stop: () => clearTimeout(typeTimer) };
    const g = box.querySelector('.rec-grim'), txt = box.querySelector('p'), sig = box.querySelector('.rec-sig'), atras = box.querySelector('.rec-atras');
    let i = 0, token = 0, dir = 1;

    let actual = 'reposo', typeTimer = 0, altoTexto = 0, vivo = null;
    const pose = (name, col = 0) => { actual = name; if (vivo) { vivo.set(name); vivo.mouth(col); } };
    Promise.resolve().then(() => window.NexoLoader.script(new URL('./grimorio-vivo.js?v=3', HERE).href)).then(() => { if (ui && ui.box === box) { vivo = window.NexoGrimorioVivo.mount(g); vivo.set(actual); } }).catch(() => {});
    // Texto letra por letra con el blip del Grimorio (opts.voz) y la boca que se mueve; tocar el globo lo completa.
    const PAUSA = { '…': 380, '.': 280, '?': 280, '!': 260, ':': 220, ',': 170, '—': 170 };
    const escribe = raw => {
      clearTimeout(typeTimer);
      const plain = [], glow = []; let on = false;
      for (const ch of raw) { if (ch === '*') { on = !on; continue; } plain.push(ch); glow.push(on); }
      const n = plain.length;
      const paint = k => {
        let out = '', open = false;
        for (let j = 0; j < k; j++) { if (glow[j] !== open) { out += open ? '</b>' : '<b>'; open = glow[j]; } out += esc(plain[j]); }
        txt.innerHTML = out + (open ? '</b>' : '');
      };
      paint(n); txt.style.minHeight = ''; altoTexto = Math.max(altoTexto, txt.offsetHeight); txt.style.minHeight = altoTexto + 'px';   // reserva el alto: el globo no salta al escribir
      if (reduced()) return;
      let k = 0;
      if (vivo) vivo.talk(true);
      const termina = () => { clearTimeout(typeTimer); paint(n); pose(actual, 0); if (vivo) vivo.talk(false); txt.onclick = null; };
      txt.onclick = termina;
      const tick = () => {
        k++; paint(k);
        const ch = plain[k - 1];
        pose(actual, [1, 2, 1, 0][k % 4]);
        if (/\p{L}/u.test(ch)) opts.voz?.('', glow[k - 1]);
        if (k >= n) return termina();
        typeTimer = setTimeout(tick, PAUSA[ch] || (glow[k - 1] ? 48 : 28));
      };
      tick();
    };
    const coloca = () => {
      const e = ui && ui.target;
      if (e && e.isConnected && visible(e)) {
        const r = e.getBoundingClientRect(), p = 8, top = Math.max(r.top - p, 6), bottom = Math.min(r.bottom + p, innerHeight - 6);   // recortado a la pantalla: algunos carteles son más altos que ella
        Object.assign(halo.style, { left: r.left - p + 'px', top: top + 'px', width: r.width + 2 * p + 'px', height: Math.max(bottom - top, 20) + 'px' });
        box.dataset.pos = bottom - top < innerHeight * .6 && top > innerHeight - bottom ? 'top' : 'bottom';   // el globo va donde hay más espacio libre; si el objetivo es muy alto (carteles en móvil), abajo, para ver su título
      }
    };
    const sigue = () => { coloca(); if (ui) ui.raf = requestAnimationFrame(sigue); };   // sigue al objetivo si la página se mueve o cambia de tamaño
    const fin = () => { R.close(); opts.volver?.(); };
    const suelta = () => { if (ui?.libre) { ui.libre(); ui.libre = null; } veil.style.pointerEvents = ''; };
    // «Hazlo tú» (paso con toca: true): el velo deja pasar los toques, pero solo el objetivo responde; al tocarlo se avanza solo.
    const esperaToque = (paso, mi) => {
      const dentro = ev => !!ev.target.closest?.(paso.sel);
      const filtro = ev => { if (box.contains(ev.target) || dentro(ev)) return; ev.preventDefault(); ev.stopPropagation(); };
      const alTocar = ev => {
        if (!dentro(ev)) return;
        suelta();
        setTimeout(() => { if (mi !== token || !ui) return; dir = 1; i++; if (i >= sec.pasos.length) return fin(); mostrar(); }, 1400);
      };
      const evs = ['pointerdown', 'pointerup', 'click'];
      evs.forEach(n => document.addEventListener(n, filtro, true));
      document.addEventListener('click', alTocar, true);
      veil.style.pointerEvents = 'none';
      ui.libre = () => { evs.forEach(n => document.removeEventListener(n, filtro, true)); document.removeEventListener('click', alTocar, true); };
    };

    async function mostrar() {
      const mi = ++token, paso = sec.pasos[i];
      halo.hidden = true; ui.target = null; suelta();
      const e = await esperar(paso.sel, i === 0 ? 4000 : 1500);
      if (mi !== token || !ui) return;
      if (!e) { i += dir; if (i < 0) i = 0; if (i >= sec.pasos.length) return fin(); return mostrar(); }   // objetivo ausente: se salta
      e.scrollIntoView({ block: e.getBoundingClientRect().height > innerHeight * .7 ? 'start' : 'center', behavior: 'instant' });
      ui.target = e; halo.hidden = false; coloca();
      pose(paso.pose); escribe(paso.texto);
      box.classList.remove('entra'); if (!reduced()) { void box.offsetWidth; box.classList.add('entra'); }
      atras.disabled = i === 0;
      sig.textContent = paso.toca ? 'Saltar' : i === sec.pasos.length - 1 ? 'Listo' : 'Siguiente';
      if (paso.toca) esperaToque(paso, mi);
      if (!ui.raf) ui.raf = requestAnimationFrame(sigue);
    }
    sig.addEventListener('click', () => { dir = 1; i++; if (i >= sec.pasos.length) return fin(); mostrar(); });
    atras.addEventListener('click', () => { dir = -1; i = Math.max(0, i - 1); mostrar(); });
    box.querySelector('.rec-salir').addEventListener('click', fin);

    if (parseHash() !== sec.ruta) location.hash = '#/' + sec.ruta;
    mostrar();
  };

  const parseHash = () => location.hash.replace(/^#\/?/, '').split('/')[0];

  R.close = function close() {
    R.active = false;
    if (!ui) return;
    ui.stop(); ui.libre?.(); cancelAnimationFrame(ui.raf); ui.veil.remove(); ui.halo.remove(); ui.box.remove(); ui = null;
  };

  window.NexoRecorrido = R;
})();
