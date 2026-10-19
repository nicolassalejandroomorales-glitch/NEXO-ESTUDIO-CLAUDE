/* Intro del umbral: ~20 s de noche, torre y voz de alquimista narrando la leyenda. Saltable con un toque.
   Uso: NexoUmbral.play(contenedor, alTerminar). Con «reducir movimiento» las líneas aparecen sin animación. */
(() => {
  'use strict';
  const LINEAS = [
    ['Hace mucho, en lo alto de una colina de Santiago, un alquimista cerró su torre con prisa…', 3600],
    ['Dicen que se fue a rendir una prueba final y nunca volvió. Qué señal más pesimista.', 3800],
    ['La naturaleza se coló por las grietas. Los frascos siguieron burbujeando solos.', 3600],
    ['Y entre los libros, uno solo quedó despierto, esperando a un estudiante con ganas.', 3800],
    ['Esta noche, la puerta se abre.', 2600],
    ['Bienvenido a *Nexo*.', 2600]
  ];
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CSS = `
.umb{position:fixed;inset:0;z-index:9999;display:grid;place-items:end center;padding:0 16px 14vh;overflow:hidden;cursor:pointer;color:#f4e9c8;
  background:radial-gradient(120% 90% at 50% 100%,#2a1d4a 0%,#120c26 55%,#05030c 100%);animation:umbIn 1.2s ease both}
.umb-stars{position:absolute;inset:0;background-image:radial-gradient(1.5px 1.5px at 20% 18%,#fff8,transparent),radial-gradient(1.5px 1.5px at 70% 12%,#fff9,transparent),radial-gradient(2px 2px at 45% 30%,#ffe9a8aa,transparent),radial-gradient(1.5px 1.5px at 85% 40%,#fff7,transparent),radial-gradient(1.5px 1.5px at 8% 50%,#fff7,transparent);animation:umbTw 3.2s ease-in-out infinite alternate}
.umb-tower{position:absolute;left:50%;bottom:0;width:min(46vw,260px);aspect-ratio:1/2.4;translate:-50% 0;background:linear-gradient(#0b0716,#05030c);clip-path:polygon(32% 100%,32% 36%,22% 36%,50% 0,78% 36%,68% 36%,68% 100%);animation:umbRise 5s cubic-bezier(.2,.8,.2,1) both}
.umb-win{position:absolute;left:50%;bottom:44%;width:14px;height:22px;translate:-50% 0;background:#ffd36b;box-shadow:0 0 22px 8px #ffb84a88;animation:umbGlow 2.4s ease-in-out infinite alternate}
.umb-txt{position:relative;max-width:34ch;text-align:center;font:600 clamp(17px,4.6vw,24px)/1.45 Georgia,serif;text-shadow:0 2px 12px #000;min-height:4.4em}
.umb-txt b{color:#ffd36b}
.umb-txt span{display:inline-block;opacity:0;animation:umbWord .6s ease forwards}
.umb-skip{position:absolute;top:12px;right:14px;font:600 13px system-ui;opacity:.7;letter-spacing:.04em}
@keyframes umbIn{from{opacity:0}to{opacity:1}}@keyframes umbTw{to{opacity:.55}}
@keyframes umbRise{from{translate:-50% 30%;opacity:0}to{translate:-50% 0;opacity:1}}
@keyframes umbGlow{to{box-shadow:0 0 34px 14px #ffb84acc}}@keyframes umbWord{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.umb,.umb-stars,.umb-tower,.umb-win,.umb-txt span{animation:none;opacity:1}}`;
  const esc = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  function play(host, done) {
    if (!document.getElementById('umb-css')) { const st = document.createElement('style'); st.id = 'umb-css'; st.textContent = CSS; document.head.append(st); }
    const root = document.createElement('div'); root.className = 'umb'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Introducción de Nexo');
    root.innerHTML = '<div class="umb-stars"></div><div class="umb-tower"></div><div class="umb-win"></div><p class="umb-txt" aria-live="polite"></p><div class="umb-skip">toca para saltar</div>';
    host.append(root);
    const txt = root.querySelector('.umb-txt'); let i = 0, timer = 0, ended = false;
    const fin = () => { if (ended) return; ended = true; clearTimeout(timer); root.style.transition = 'opacity .6s'; root.style.opacity = '0'; setTimeout(() => root.remove(), 600); done(); };
    const linea = () => {
      if (ended) return;
      if (i >= LINEAS.length) { fin(); return; }
      const [t, ms] = LINEAS[i++];
      let n = 0;
      txt.innerHTML = esc(t).split(' ').map(w => { const b = /^\*.*\*[.,]?$/.test(w); const s = `<span style="animation-delay:${(n++ * (reduced() ? 0 : .12)).toFixed(2)}s">${b ? '<b>' + w.replace(/\*/g, '') + '</b>' : w}</span>`; return s; }).join(' ');
      timer = setTimeout(linea, ms);
    };
    root.addEventListener('click', fin);
    linea();
  }
  window.NexoUmbral = { play };
})();
