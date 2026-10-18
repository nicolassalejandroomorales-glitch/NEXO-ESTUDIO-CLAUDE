/* Kit de UI pixel art (dist/design-system/pixel-ui.css): letras pixel en la barra lateral y clic físico en botones de latón. */
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

  // Clic físico: un "tac" suave de la mesa de sonidos de la app (respeta el silencio de Ajustes).
  document.addEventListener('pointerdown', event => {
    const button = event.target.closest?.(BUTTONS);
    if (button && !button.disabled && button.getAttribute('aria-disabled') !== 'true') window.NexoAudio?.play('click');
  }, { passive: true });

  // Portal entre secciones: la pantalla nueva se abre en círculo desde el último toque (o el centro si fue con teclado).
  // Usa View Transitions; sin soporte, con movimiento reducido o calidad baja la pantalla solo cambia.
  let point = null, busy = false;
  document.addEventListener('pointerdown', event => { point = { x: event.clientX, y: event.clientY, at: Date.now() }; }, { passive: true, capture: true });
  const calm = () => !document.startViewTransition || busy || matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.body.classList.contains('reduce-motion') || document.body.dataset.nexoAmbientMotion === 'reduced' || document.body.dataset.nexoQuality === 'low';
  function transition(update) {
    if (calm()) return update();
    const fresh = point && Date.now() - point.at < 1500, root = document.documentElement.style;
    root.setProperty('--vt-x', `${fresh ? point.x : innerWidth / 2}px`);
    root.setProperty('--vt-y', `${fresh ? point.y : innerHeight / 3}px`);
    busy = true;
    let done = false;
    const once = () => { if (done) return; done = true; busy = false; update(); };
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
