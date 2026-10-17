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

  upgradeNav();
  window.NexoPixelUI = Object.freeze({ upgradeNav });
})();
