/* Organización · plan de hoy (UPDATE 02, Fase 1). Módulo puro: sin pantalla ni estado propio, se prueba con node.
   Nexo PROPONE (orden + duración + razón); Niquito acepta, salta o marca listo. Reparte TIEMPO, nunca declara dominio.
   Usa el orden de NexoPriority.rank (cercanía + importancia + errores abiertos + carga del día). */
(function (root) {
  'use strict';
  const DAY = 86400000;
  const EVAL = ['exam', 'Prueba', 'control'];
  const pad = n => String(n).padStart(2, '0');
  const parse = d => new Date(`${d}T12:00:00`);
  const iso = x => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / DAY);
  const addDays = (d, n) => { const x = parse(d); x.setDate(x.getDate() + n); return iso(x); };
  const isEval = e => EVAL.includes(e?.type);
  const valid = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || ''));
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  const shortDate = d => { const x = parse(d); return `${x.getDate()} ${MONTHS[x.getMonth()]}`; };
  const range = (a, b) => {
    const x = parse(a), y = parse(b);
    return x.getMonth() === y.getMonth() ? `${x.getDate()}–${y.getDate()} ${MONTHS[y.getMonth()]}` : `${shortDate(a)} – ${shortDate(b)}`;
  };

  // Nivel de urgencia de una evaluación (tablón del Inicio y fichas). SPEC: tabla "Inicio: que te avise solo".
  function urgency(days) {
    if (days < 0) return 'despues';
    if (days === 0) return 'hoy';
    if (days <= 2) return 'sello';
    if (days <= 7) return 'brillo';
    if (days <= 14) return 'ambar';
    return 'calma';
  }

  const upcomingEvals = (events, today, horizon) => (events || [])
    .filter(e => isEval(e) && valid(e.date) && e.status !== 'done')
    .map(e => ({ event: e, days: daysBetween(today, e.date) }))
    .filter(x => x.days >= 0 && x.days <= horizon)
    .sort((a, b) => a.days - b.days || String(a.event.id).localeCompare(String(b.event.id)));

  // Semana crítica: la ventana de `span` días con más evaluaciones (mínimo `min`). Empate → la más cercana.
  function critical(events, today, { span = 9, min = 3, horizon = 35 } = {}) {
    const list = upcomingEvals(events, today, horizon);
    let best = null;
    list.forEach((first, i) => {
      const end = addDays(first.event.date, span - 1);
      const items = list.slice(i).filter(x => x.event.date <= end);
      if (items.length >= min && (!best || items.length > best.items.length)) best = { from: first.event.date, to: items[items.length - 1].event.date, items };
    });
    if (!best) return null;
    return { ...best, count: best.items.length, label: `${range(best.from, best.to)}: ${best.items.length} evaluaciones`,
      active: daysBetween(today, best.from) <= 7 };
  }

  // Relojes de arena: evaluaciones de los próximos `horizon` días. level 0 (lleno arriba) … 5 (toda la arena cayó).
  function hourglasses(events, today, horizon = 21) {
    return upcomingEvals(events, today, horizon).map(x => ({ ...x, urgency: urgency(x.days),
      level: Math.max(0, Math.min(5, Math.round((1 - x.days / horizon) * 5))) }));
  }

  // Qué hacer según cuánto falta (con su evidencia, en una línea).
  function action(item) {
    const e = item.event, d = item.days;
    if (e.type === 'lab') {
      if (item.stage === 'Pre-lab') return { text: 'Pre-lab: procedimiento, fundamentos y riesgos', why: 'Llegar con el pre-lab listo: suele ser nota (control de entrada)', cap: 40 };
      if (item.stage === 'Informe') return { text: 'Avanzar el informe mientras está fresco', why: 'Los datos se olvidan rápido: mejor escribir pronto' };
      return { text: 'Prepara el práctico: procedimiento, reactivos y riesgos', why: d === 0 ? 'El práctico es hoy' : `El práctico es ${d === 1 ? 'mañana' : `en ${d} días`}` };
    }
    if (!isEval(e)) return { text: 'Avanzar en la entrega', why: d <= 1 ? 'Vence pronto' : `Vence en ${d} días` };
    if (d === 0) return { text: 'Repaso flash: lo clave y los errores típicos, sin materia nueva', why: 'Día de prueba: repasar sin saturarte', flash: true };
    if (d === 1) return { text: 'Repaso liviano de lo clave y a dormir temprano', why: 'Dormir consolida lo estudiado (Diekelmann & Born 2010)', cap: 30 };
    if (d <= 3) return { text: 'Ensayo cronometrado: una PEP antigua o 5 ejercicios mezclados', why: 'Practicar como en la prueba (Roediger & Karpicke 2006)' };
    if (d <= 7) return { text: 'Ejercicios mezclados sin apuntes', why: 'Mezclar tipos de ejercicio entrena a elegir el método (Rohrer & Taylor 2007)' };
    if (d <= 14) return { text: 'Ejercicios sin mirar los apuntes y corregir', why: 'Recuperar rinde más que releer (Roediger & Karpicke 2006)' };
    return { text: 'Primera pasada por la materia + 3 preguntas para ti', why: 'Empezar antes reparte el estudio en más días (Cepeda et al. 2006)' };
  }

  function candidate(item) {
    const e = item.event, d = item.days;
    if (d < 0) return false;
    if (isEval(e)) return d <= 21;
    if (e.type === 'lab') return item.stage === 'Pre-lab' ? d <= 7 : d <= 2;
    return ['task', 'deadline', 'report', 'prelab'].includes(e.type) && d <= 7;
  }

  const round5 = n => Math.round(n / 5) * 5;

  /* plan({ ranked, today, minutes, sessions, marks, critical, pins, recess, weak })
     pins: ids de eventos que Niquito movió a este día (van primero) · recess: día de receso (plan liviano) · weak: errores abiertos por ramo.
     ranked: salida de NexoPriority.rank · minutes: tiempo de hoy · sessions: state.sessions · marks: { done:[], skip:[] } de hoy. */
  function plan({ ranked = [], today, minutes = 120, sessions = [], marks = {}, critical: crit = null, pins = [], recess = false, weak = {} } = {}) {
    const skip = new Set(marks.skip || []), doneIds = new Set(marks.done || []);
    const pool = ranked.filter(candidate).filter(x => !skip.has(x.event.id));
    const flash = pool.filter(x => isEval(x.event) && x.days === 0);
    // Las evaluaciones van antes que el lab (salvo el pre-lab de mañana): el rank les da la misma importancia a todos.
    // Dificultad: Niquito parte con 1–5 y Nexo suma si el ramo tiene 3 o más errores abiertos (entra al orden con su razón).
    const diff = x => { const d = Number(x.event.difficulty) || 0; return d ? Math.min(5, d + ((weak[x.event.subject] || 0) >= 3 ? 1 : 0)) : 0; };
    const lift = x => x.score + (isEval(x.event) ? 10 : x.event.type === 'lab' && x.days <= 1 ? 6 : 0) + (diff(x) ? (diff(x) - 3) * 2 : 0);
    const pinned = ranked.filter(x => (pins || []).includes(x.event.id) && !skip.has(x.event.id) && !flash.includes(x));
    const rest = pool.filter(x => !flash.includes(x) && !pinned.includes(x)).sort((a, b) => lift(b) - lift(a));
    rest.unshift(...pinned);
    const picked = [...flash.slice(0, 1)];
    const kind = x => `${x.event.subject}:${x.event.type === 'lab' ? 'lab' : 'teoria'}`;     // un bloque por ramo (el lab cuenta aparte)
    const seen = new Set(picked.map(kind));
    for (const x of rest) if (picked.length < 3 && !seen.has(kind(x))) { picked.push(x); seen.add(kind(x)); }
    for (const x of rest) if (picked.length < 3 && !picked.includes(x)) picked.push(x);
    let budget = Math.max(15, Number(minutes) || 0);
    const blocks = [];
    if (picked[0] && flash.includes(picked[0])) { blocks.push({ item: picked[0], minutes: 10 }); budget -= 10; }
    const others = picked.filter(x => !flash.includes(x));
    const room = Math.max(1, Math.min(others.length, Math.floor(budget / 15)));
    const chosen = others.slice(0, room);
    const total = chosen.reduce((s, x) => s + x.score, 0) || 1;
    chosen.forEach(x => blocks.push({ item: x, minutes: Math.min(action(x).cap || 50, Math.max(15, round5(budget * x.score / total))) }));
    while (blocks.reduce((s, b) => s + b.minutes, 0) > Math.max(budget + (flash.length ? 10 : 0), 15) && blocks.some(b => b.minutes > 15))
      blocks.filter(b => b.minutes > 15).pop().minutes -= 5;
    // Minutos de hoy por ramo (cronómetro + registro manual): tachan los bloques en orden.
    const studied = {};
    (sessions || []).filter(s => s.date === today).forEach(s => {
      studied[s.subject] = (studied[s.subject] || 0) + (Number(s.seconds) || Number(s.minutes || 0) * 60) / 60;
    });
    if (recess) {                                                      // receso (vacaciones, paro): un repaso liviano para mantener lo aprendido
      const first = blocks.find(b => !flash.includes(b.item)) || blocks[0];
      if (!first) return [];
      blocks.length = 0; blocks.push({ item: first.item, minutes: 20, recess: true });
    }
    return blocks.map(({ item, minutes: m, recess: rc }, i) => {
      const a = rc ? { text: 'Repaso liviano de lo visto: 3 ejercicios sin apuntes', why: 'En un receso basta con mantener lo aprendido: repasar espaciado rinde más que estudiar mucho un solo día (Cepeda et al. 2006)' } : action(item), e = item.event;
      const id = `${today}:${e.id}`;
      const left = studied[e.subject] || 0;
      const auto = left >= m;
      studied[e.subject] = Math.max(0, left - m);
      const when = item.days === 0 ? 'hoy' : item.days === 1 ? 'mañana' : `en ${item.days} días`;
      const inCrit = crit && isEval(e) && e.date >= crit.from && e.date <= crit.to;
      const extra = item.reasons.filter(r => /error|base|compromisos/.test(r)).slice(0, 1);
      const dd = diff(item); if (dd >= 4) extra.push(`dificultad ${dd}/5`);
      if ((pins || []).includes(e.id)) extra.push('lo moviste a hoy');
      return {
        id, order: i + 1, event: e, subject: e.subject, minutes: m, text: a.text, why: a.why, flash: !!a.flash,
        recess: !!rc, reason: [`${e.title} ${when}`, ...(rc ? ['receso'] : []), ...(inCrit ? ['semana crítica'] : []), ...extra].join(' · '),
        done: doneIds.has(id) || auto, auto: auto && !doneIds.has(id)
      };
    });
  }

  /* Plan de cualquier día con todo lo que Niquito configuró: minutos de ese día de la semana, bloques movidos (pins), "hoy no" (marks),
     receso y errores abiertos. bridge = el puente de app.js (state, ranked(día)). Lo usan Hoy, la semana del calendario y el Inicio. */
  function planDay(bridge, day, crit = null) {
    const st = bridge.state, o = st.organization || {}, v = o.minutes?.[parse(day).getDay()];
    const minutes = v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : (st.settings?.dailyGoalMinutes || 120);
    if (minutes <= 0) return [];
    const weak = {}; (st.errors || []).filter(e => e.status !== 'resolved').forEach(e => { weak[e.subject] = (weak[e.subject] || 0) + 1; });
    const recess = !!root.NexoCalendarModel?.recessOn(st.events, day);
    return plan({ ranked: bridge.ranked(day), today: day, minutes, sessions: st.sessions, marks: o.marks?.[day] || {}, critical: crit,
      pins: o.pins?.[day] || [], recess, weak });
  }

  const api = Object.freeze({ plan, planDay, critical, hourglasses, urgency, action, daysBetween, addDays, shortDate, range });
  root.NexoTodayPlan = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
