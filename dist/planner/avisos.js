/* Avisos de Organización dentro de Nexo (UPDATE 02, Fase 1). Solo locales: sin nube ni notificaciones del celular.
   - list(bridge): avisos de hoy (pruebas por urgencia, semana crítica, cambios de fecha). Los usa la campana del estudio.
   - home(app, bridge): el Inicio avisa solo: tablón que cambia según la urgencia, cinta de semana crítica,
     el calendario de la pared brilla (prueba en ≤ 7 días), plan de hoy con "Empezar" y la mascota lo dice 1 vez.
   Primer aviso 2 semanas antes (decisión de Niquito). */
(() => {
  'use strict';
  const EVAL = ['exam', 'Prueba', 'control'];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const T = () => window.NexoTodayPlan;
  const when = d => d === 0 ? 'hoy' : d === 1 ? 'mañana' : `en ${d} días`;
  const SAY = {
    hoy: e => `¡Hoy es ${e}! Repaso flash y a rendir tranquilo.`,
    sello: e => `${e} es muy pronto: repaso liviano y a dormir temprano.`,
    brillo: e => `${e} esta semana: toca ensayo sin apuntes.`,
    ambar: e => `${e} en menos de 2 semanas: hoy basta con un bloque corto.`
  };

  function org(state) {
    if (!state.organization || typeof state.organization !== 'object') state.organization = {};
    const o = state.organization;
    if (!o.seen || typeof o.seen !== 'object') o.seen = { avisos: [], dates: {} };
    if (!Array.isArray(o.seen.avisos)) o.seen.avisos = [];
    if (!o.seen.dates || typeof o.seen.dates !== 'object') o.seen.dates = {};
    return o;
  }

  function list(bridge) {
    const state = bridge.state, today = bridge.today(), o = org(state), out = [];
    const crit = T().critical(state.events, today);
    if (crit?.active) out.push({ id: `crit:${crit.from}:${crit.count}`, nivel: 'brillo', titulo: 'Semana crítica', texto: crit.label });
    for (const e of state.events || []) {
      const before = o.seen.dates[e.id];
      if (before && before !== e.date && e.date >= today && e.status !== 'done')
        out.push({ id: `fecha:${e.id}:${e.date}`, nivel: 'cambio', titulo: 'Cambio de fecha',
          texto: `${bridge.subjectFor(e.subject).short} ${e.title}: ${T().shortDate(before)} → ${T().shortDate(e.date)}` });
    }
    // Inasistencias: aviso cuando te queda 1 falta (o ya llegaste al límite).
    if (window.NexoGradeRules) for (const sub of bridge.subjects) {
      const att = window.NexoGradeRules.attendance(state.absences, sub.id, o.absenceMax);
      for (const g of ['theory', 'lab']) {
        const a = att[g], parte = g === 'lab' ? 'laboratorio' : 'teoría';
        if (a.state === 'queda-1') out.push({ id: `falta:${sub.id}:${g}:${a.count}`, nivel: 'brillo', titulo: `${sub.short} · ${parte}`, texto: 'Te queda 1 falta.' });
        else if (a.state === 'limite' || a.state === 'pasado') out.push({ id: `falta:${sub.id}:${g}:${a.count}`, nivel: 'sello', titulo: `${sub.short} · ${parte}`, texto: a.state === 'limite' ? 'Llegaste al máximo de faltas.' : 'Pasaste el máximo de faltas.' });
      }
    }
    T().hourglasses(state.events, today, 14).forEach(h => {
      const s = bridge.subjectFor(h.event.subject);
      out.push({ id: `prueba:${h.event.id}:${h.urgency}`, nivel: h.urgency, event: h.event, days: h.days,
        titulo: `${s.short} · ${h.event.title}`, texto: `${T().shortDate(h.event.date)} (${when(h.days)})` });
    });
    const seen = new Set(o.seen.avisos);
    out.forEach(a => { a.nuevo = !seen.has(a.id) && a.nivel !== 'ambar' && a.nivel !== 'calma'; });
    return out;
  }

  function markSeen(bridge) {
    const o = org(bridge.state);
    o.seen.avisos = [...new Set([...o.seen.avisos, ...list(bridge).map(a => a.id)])].slice(-80);
    (bridge.state.events || []).forEach(e => { if (e.id && e.date) o.seen.dates[e.id] = e.date; });
    bridge.save();
  }
  // La primera vez solo se toma la foto (fechas y avisos de hoy): la campana suena por lo que cambie DESPUÉS.
  function snapshot(bridge) {
    const o = org(bridge.state);
    if (o.seen.started) return;
    o.seen.started = bridge.today();
    markSeen(bridge);
  }

  // ——— Inicio ———
  let bubbleTimer = 0;
  function home(app, bridge) {
    if (!document.querySelector('link[href^="planner/estudio.css"]')) {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'planner/estudio.css?v=1'; document.head.append(l);
    }
    snapshot(bridge);
    const state = bridge.state, today = bridge.today();
    const ranked = bridge.ranked();
    const evals = ranked.filter(x => EVAL.includes(x.event.type)).slice(0, 3);     // el mismo orden que arma app.js
    const board = app.querySelector('.evaluation-board');
    if (board) {
      board.querySelectorAll('.evaluation-note').forEach((li, i) => {
        const x = evals[i]; if (!x) return;
        const u = T().urgency(x.days);
        li.classList.add('u-' + u);
        li.insertAdjacentHTML('afterbegin', `<span class="aviso-reloj" style="--f:${Math.max(0, Math.min(5, Math.round((1 - x.days / 21) * 5)))}" aria-hidden="true"></span>
          <b class="aviso-dias">${x.days === 0 ? 'HOY' : x.days === 1 ? 'mañana' : `${x.days} días`}</b>`);
        li.querySelectorAll('[data-route="planner"]').forEach(b => { b.dataset.routeSub = 'pruebas'; b.textContent = 'Ver en el corcho de pruebas →'; });
      });
      const crit = T().critical(state.events, today);
      if (crit?.active) board.insertAdjacentHTML('afterbegin', `<div class="cinta cinta-tablon" role="note"><span>Semana crítica · ${esc(crit.label)}</span></div>`);
      board.querySelectorAll('.wood-link[data-route="planner"]').forEach(b => { b.dataset.routeSub = 'hoy'; b.textContent = 'Abrir el estudio de planos →'; });
    }
    // Calendario de la pared: brilla si hay prueba en 7 días o menos (y lleva a Hoy).
    const soon = evals.some(x => x.days >= 0 && x.days <= 7);
    const cal = app.querySelector('[data-scene-hotspot="parchment-calendar"]');
    if (cal) { cal.classList.toggle('org-brilla', soon); cal.dataset.routeSub = 'hoy'; }
    app.querySelector('[data-scene-hotspot="map-logbook"]')?.setAttribute('data-route-sub', 'hoy');
    // Plan de hoy en la hoja del día, con "Empezar".
    const paper = app.querySelector('.day-paper .day-goal');
    const blocks = window.NexoTodayPlan.planDay(bridge, today, T().critical(state.events, today));
    if (paper && blocks.length) {
      paper.insertAdjacentHTML('afterend', `<ol class="home-plan" aria-label="Plan de hoy">${blocks.map(b => {
        const s = bridge.subjectFor(b.subject);
        return `<li class="${b.done ? 'hecho' : ''}"><span class="ramo" style="--ramo:${esc(s.color)}">${esc(s.short)}</span>
          <span class="tinta">${b.minutes} min · ${esc(b.text)}</span>${b.done ? '' : `<button type="button" class="paper-link" data-org-home-start="${esc(b.subject)}">Empezar</button>`}</li>`;
      }).join('')}</ol><button type="button" class="paper-link home-plan-ver" data-route="planner" data-route-sub="hoy">Ver el plan y por qué →</button>`);
      app.querySelectorAll('[data-org-home-start]').forEach(btn => btn.addEventListener('click', e => {
        e.stopPropagation();
        state.timer.subject = btn.dataset.orgHomeStart; bridge.save(); bridge.go('hub', 'timer');
      }));
    }
    // La mascota avisa: 1 vez al entrar (por día) y cuando aparece un aviso nuevo.
    const fresh = list(bridge).filter(a => a.nuevo);
    const top = fresh.find(a => a.nivel === 'cambio') || fresh.find(a => a.nivel === 'brillo' && a.id.startsWith('crit')) || fresh.find(a => a.event);
    const o = org(state);
    const key = `${today}:${fresh.map(a => a.id).join('|')}`;
    if (o.lastSaid !== key && (top || o.lastSaidDay !== today)) {
      const first = evals[0];
      const text = top?.nivel === 'cambio' ? `Ojo: ${top.texto}.`
        : top?.id.startsWith('crit') ? `Viene semana crítica (${top.texto}). Partamos antes.`
          : top?.event ? (SAY[top.nivel]?.(`${bridge.subjectFor(top.event.subject).short} ${top.event.title}`) || '')
            : first && SAY[T().urgency(first.days)] ? SAY[T().urgency(first.days)](`${bridge.subjectFor(first.event.subject).short} ${first.event.title}`) : '';
      if (text) {
        o.lastSaid = key; o.lastSaidDay = today; bridge.save();
        speak(app, text);
      }
    }
  }

  function minutes(bridge) {
    const v = bridge.state.organization?.minutes?.[new Date().getDay()];
    return Number.isFinite(Number(v)) ? Number(v) : bridge.state.settings.dailyGoalMinutes || 120;
  }

  // Globo sobre la mascota del refugio (la posición la da home-pet.js; si aún no aparece, espera un poco).
  function speak(app, text, tries = 0) {
    const plane = app.querySelector('.home-art-plane'); if (!plane) return;
    const spot = window.NexoPet?.homeSpot?.();
    if (!spot) { if (tries < 12) setTimeout(() => speak(app, text, tries + 1), 300); return; }
    let b = plane.querySelector('.org-say');
    if (!b) { b = document.createElement('p'); b.className = 'org-say'; b.setAttribute('role', 'status'); plane.append(b); }
    b.textContent = text;
    const place = () => { const s = window.NexoPet?.homeSpot?.(); if (!s || !b.isConnected) return;
      b.style.left = `${Math.max(14, Math.min(86, s.x / 418 * 100))}%`; b.style.top = `${s.y / 235 * 100}%`; };
    place();
    spot.act?.('saludo');
    clearInterval(bubbleTimer);
    let n = 0;
    bubbleTimer = setInterval(() => { place(); if (++n > 30 || !b.isConnected) { clearInterval(bubbleTimer); b.remove(); } }, 200);
  }

  window.NexoOrgAvisos = Object.freeze({ list, markSeen, snapshot, home });
})();
