/* Kit de UI pixel art (dist/design-system/pixel-ui.css): letras pixel en la barra lateral, clic físico en botones de latón
   y portal entre secciones. Movimiento y sonido con el estilo de la skill nexo-animacion (core/movimiento.js). */
(() => {
  'use strict';
  const BUTTONS = '.pu-btn,.nav-btn,.hc-btn';

  // Letras pixel para la marca y los botones de las dos barras (de escritorio y de celular), que son HTML fijo.
  function upgradeNav(root = document) {
    root.querySelectorAll('.nav-btn').forEach(button => {
      if (button.dataset.pu) return;
      button.dataset.pu = '1';
      const label = button.querySelector('b');
      if (label && window.NexoPixelText) { button.setAttribute('aria-label', label.textContent); label.innerHTML = window.NexoPixelText.render(label.textContent); }
    });
    const brand = document.querySelector('.brand span:last-child');
    if (brand && window.NexoPixelText && !brand.dataset.pu) { brand.dataset.pu = '1'; brand.innerHTML = window.NexoPixelText.render('Nexo'); }
  }

  // Movimiento (skill nexo-animacion): cada pieza que se mueve sigue su resorte y un solo bucle de cuadros las pinta
  // mientras alguna no esté quieta; sin nada en movimiento no hay bucle.
  const M = window.NexoMovimiento;
  const HUNDIR = 2;            // px de arte: un píxel de arte (×2) de sobrerrecorrido al apretar
  const CAIDA = -10;           // px: de dónde cae la pantalla nueva
  const activos = new Map();   // resorte -> quién pinta su valor
  let cuadro = 0, antes = 0;
  function bucle(ahora) {
    const dt = (ahora - antes) / 1000;
    antes = ahora;
    for (const [resorte, pintar] of activos) {
      resorte.avanzar(dt);
      if (resorte.reposo(.5)) { resorte.fijar(resorte.meta); activos.delete(resorte); } // ya no se nota: se acaba el bucle
      pintar(resorte.valor);
    }
    cuadro = activos.size ? requestAnimationFrame(bucle) : 0;
  }
  function mover(resorte, pintar) {
    activos.set(resorte, pintar);
    if (!cuadro) { antes = performance.now(); cuadro = requestAnimationFrame(bucle); }
  }

  // Botón: al apretar se hunde un píxel de arte (anticipación) y al soltar rebota hacia arriba y se asienta, siempre en pasos de 2 px.
  const caras = new WeakMap(), apretados = new Set();
  function mueveCara(button, preset, meta, empuje = 0) {
    const previo = caras.get(button);
    if (previo) activos.delete(previo);
    const resorte = M.resorte({ preset, valor: previo?.valor ?? 0, velocidad: previo?.velocidad ?? 0, meta }).empujar(empuje);
    caras.set(button, resorte);
    mover(resorte, valor => button.style.setProperty('--pu-y', M.alinear(valor, 2)));
  }
  document.addEventListener('pointerdown', event => {
    const button = event.target.closest?.(BUTTONS);
    if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
    M.sonido('clic');
    apretados.add(button);
    mueveCara(button, 'camara', HUNDIR);
  }, { passive: true });
  const soltar = () => { for (const button of apretados) mueveCara(button, 'corcho', 0, -60); apretados.clear(); };
  document.addEventListener('pointerup', soltar, { passive: true, capture: true });
  document.addEventListener('pointercancel', soltar, { passive: true, capture: true });

  // Pantalla nueva: cae sobre el portal, aterriza (suena el golpe) y rebota contra su piso. Nunca baja de su sitio (-|valor|),
  // porque pasarse hacia abajo haría crecer el scroll de la página unos píxeles y movería la barra.
  function aterrizar() {
    const app = document.getElementById('app');
    if (!app) return;
    let golpeo = false;
    mover(M.resorte({ preset: 'pagina', valor: CAIDA, meta: 0 }), valor => {
      const y = M.alinear(-Math.abs(valor));
      app.style.translate = y ? `0 ${y}px` : '';
      if (!golpeo && valor >= 0) { golpeo = true; M.sonido('golpe'); }
    });
  }

  // Portal entre secciones: la pantalla nueva se abre en círculo desde el último toque (o el centro si fue con teclado).
  // Usa View Transitions; sin soporte, con movimiento reducido o calidad baja la pantalla solo cambia.
  let point = null, busy = false;
  document.addEventListener('pointerdown', event => { point = { x: event.clientX, y: event.clientY, at: Date.now() }; }, { passive: true, capture: true });
  const calm = () => !document.startViewTransition || busy || M.reducido() || document.body.dataset.nexoQuality === 'low';
  function transition(update) {
    if (calm()) return update();
    M.sonido('girar');
    const fresh = point && Date.now() - point.at < 1500, root = document.documentElement.style;
    root.setProperty('--vt-x', `${fresh ? point.x : innerWidth / 2}px`);
    root.setProperty('--vt-y', `${fresh ? point.y : innerHeight / 3}px`);
    busy = true;
    let done = false;
    const once = () => { if (done) return; done = true; busy = false; update(); aterrizar(); };
    try {
      const run = document.startViewTransition(once);
      run.ready.catch(() => {}); run.updateCallbackDone.catch(() => {}); // si el navegador salta la animación, no es un error
      run.finished.catch(() => {}).finally(() => { busy = false; });
      setTimeout(once, 800); // si el navegador no alcanza a pintar el cuadro (pestaña oculta), la pantalla igual cambia
    } catch (_) { once(); }
  }

  upgradeNav();
  window.NexoPixelUI = Object.freeze({ upgradeNav, transition });
})();
