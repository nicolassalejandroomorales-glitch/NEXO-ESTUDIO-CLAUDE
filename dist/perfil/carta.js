/* Perfil = carta de jugador (docs/perfil-alcoba/SPEC.md). Arte: tools/perfil-carta/build_carta.py → assets/perfil/carta.png.
   render(app, data): pinta la carta y los 3 botones (Vestuario, Estadísticas, Ajustes).
   wrapSection(page, tab): envuelve una sección (mascota, estadísticas, ajustes) en madera + pergamino, con "← Mi carta".
   data = { name, kind, rank: { level, name }, streak, minutes, badges: [6 booleanos] }. app.js arma el data (profileCardData). */
(() => {
  'use strict';
  const V = '1';
  const ART = { w: 120, h: 170 };
  const ZONES = {
    nombre: [14, 9, 106, 22], ventana: [12, 26, 108, 100], rango: [28, 105, 107, 121],
    racha: [12, 125, 58, 141], minutos: [62, 125, 108, 141],
    insignias: [0, 1, 2, 3, 4, 5].map(i => [13 + i * 16, 146, 26 + i * 16, 159])
  };
  const BADGES = ['Racha de 3 días', 'Racha de 7 días', '10 horas de estudio', 'Una clase dominada', 'Un desafío cobrado', 'Vestuario puesto'];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const place = ([x0, y0, x1, y1]) => `left:${x0 / ART.w * 100}%;top:${y0 / ART.h * 100}%;width:${(x1 - x0) / ART.w * 100}%;height:${(y1 - y0) / ART.h * 100}%`;
  let said = false;                       // la mascota comenta tu semestre 1 vez por sesión

  function css() {
    for (const href of ['perfil/carta.css?v=' + V, 'planner/estudio.css?v=1']) {
      if (document.querySelector(`link[href^="${href.split('?')[0]}"]`)) continue;
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.append(l);
    }
  }
  const minutesLabel = m => m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? String(m % 60).padStart(2, '0') + ' min' : ''}`.trim() : `${m} min`;

  function render(app, d) {
    css();
    const flame = window.NexoArcaneRanks?.flame?.(d.rank.level) || '';
    app.innerHTML = `<section class="page profile-page perfil-carta-page">
      <div class="carta" role="img" aria-label="Carta de ${esc(d.name)}: ${esc(d.rank.name)}, racha de ${d.streak} días">
        <p class="carta-nombre" style="${place(ZONES.nombre)}">${esc(d.name)}</p>
        <div class="carta-ventana" style="${place(ZONES.ventana)}"><canvas class="carta-mascota" width="40" height="44" aria-hidden="true"></canvas><p class="carta-say" hidden></p></div>
        <p class="carta-rango" style="${place(ZONES.rango)}"><span>${esc(d.rank.name)}</span></p>
        <span class="carta-llama level-${d.rank.level}" style="${place([9, 109, 27, 127])}">${flame}</span>
        <p class="carta-dato" style="${place(ZONES.racha)}"><b>${d.streak}</b><small>${d.streak === 1 ? 'día' : 'días'} de racha</small></p>
        <p class="carta-dato" style="${place(ZONES.minutos)}"><b>${minutesLabel(d.minutes)}</b><small>de estudio</small></p>
        ${ZONES.insignias.map((z, i) => `<i class="carta-insignia${d.badges[i] ? '' : ' apagada'}" style="${place(z)};--i:${i}" title="${BADGES[i]}${d.badges[i] ? '' : ' (aún no)'}"></i>`).join('')}
      </div>
      <nav class="carta-botones" aria-label="Perfil">
        <button data-profile-tab="mascot"><strong>Vestuario</strong><small>Tu compañero y accesorios</small></button>
        <button data-profile-tab="stats"><strong>Estadísticas</strong><small>Tu esfuerzo y tu avance</small></button>
        <button data-profile-tab="settings"><strong>Ajustes</strong><small>Cuenta, sonido y más</small></button>
      </nav></section>`;
    const canvas = app.querySelector('.carta-mascota');
    window.NexoPet?.paintBig(canvas);
    if (!said) {
      const r = window.NexoReacciones?.now();
      if (r) { said = true; const b = app.querySelector('.carta-say'); b.textContent = r.say; b.hidden = false; setTimeout(() => { b.hidden = true; }, 6500); }
    }
  }

  function wrapSection(page, tab) {
    css();
    const nodes = [...page.childNodes];
    const pergamino = document.createElement('div');
    pergamino.className = 'pergamino';
    pergamino.append(...nodes);
    const madera = document.createElement('div');
    madera.className = 'madera perfil-madera';
    madera.append(pergamino);
    page.replaceChildren(madera);
    pergamino.insertAdjacentHTML('afterbegin', '<button class="carta-volver" data-profile-close>← Mi carta</button>');
    page.classList.add('perfil-seccion', 'perfil-' + tab);
  }

  window.NexoCarta = Object.freeze({ render, wrapSection });
})();
