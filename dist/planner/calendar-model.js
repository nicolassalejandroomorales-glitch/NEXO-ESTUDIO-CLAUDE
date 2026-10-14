/* Organización · Calendario (UPDATE 02, Fase 3). Módulo puro: sin pantalla ni estado propio, se prueba con node (tools/calendario-test.cjs).
   Cuadrícula del mes y la semana, mover una fecha con historial y deshacer, borrar con deshacer, línea de tiempo del semestre,
   semanas críticas y el horario fijo de cada día. Las fechas son 'AAAA-MM-DD' (hora local de Chile, sin zonas horarias). */
(function (root) {
  'use strict';
  const DAY = 86400000;
  const pad = n => String(n).padStart(2, '0');
  const parse = d => new Date(`${d}T12:00:00`);
  const iso = x => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  const valid = d => /^\d{4}-\d{2}-\d{2}$/.test(String(d || '')) && iso(parse(d)) === d;
  const addDays = (d, n) => { const x = parse(d); x.setDate(x.getDate() + n); return iso(x); };
  const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / DAY);
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MON = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  const WEEKDAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const EVAL = ['exam', 'Prueba', 'control'];
  const isEval = e => EVAL.includes(e?.type);
  // Las pruebas de ciclo del laboratorio tienen id distinto en el calendario que en las notas.
  const GRADE_EVENT = { 'grade-fq-lab-ciclo': 'official-fq-ciclo', 'grade-org-lab-ciclo1': 'official-org-ciclo1', 'grade-org-lab-ciclo2': 'official-org-ciclo2' };

  // ——— Fechas ———
  const monthKey = d => d.slice(0, 7);
  const shiftMonth = (key, n) => { const [y, m] = key.split('-').map(Number); const x = new Date(y, m - 1 + n, 1); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}`; };
  const monthLabel = key => { const [y, m] = key.split('-').map(Number); return `${MONTHS[m - 1]} de ${y}`; };
  const shortDate = d => { const x = parse(d); return `${x.getDate()} ${MON[x.getMonth()]}`; };
  const weekdayName = d => WEEKDAYS[(parse(d).getDay() + 6) % 7];
  const weekdayIndex = d => { const g = parse(d).getDay(); return g === 0 ? 7 : g; };      // lunes = 1 … domingo = 7 (como NEXO_SEMESTER.schedule)
  const mondayOf = d => addDays(d, -((parse(d).getDay() + 6) % 7));
  const weekOf = d => { const m = mondayOf(d); return Array.from({ length: 7 }, (_, i) => addDays(m, i)); };

  /* Cuadrícula del mes: semanas de 7 casillas (lunes a domingo); null = casilla fuera del mes. */
  function monthGrid(key) {
    const [y, m] = key.split('-').map(Number), days = new Date(y, m, 0).getDate();
    const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7, cells = [];
    for (let i = 0; i < Math.ceil((offset + days) / 7) * 7; i++) { const n = i - offset + 1; cells.push(n >= 1 && n <= days ? `${key}-${pad(n)}` : null); }
    return { key, label: monthLabel(key), cells, weeks: Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7)) };
  }

  // ——— Eventos ———
  const timeOf = e => String(e.time || '99:99');
  const eventsOn = (events, date) => (events || []).filter(e => e.date === date).sort((a, b) => timeOf(a).localeCompare(timeOf(b)) || String(a.title).localeCompare(String(b.title)));
  /* Qué ícono pixel lleva: sello de lacre (pruebas), matraz (lab), pluma (entregas y tareas), bandera (receso). */
  function kind(e) {
    if (e.type === 'lab') return 'matraz';
    if (isEval(e)) return 'sello';
    if (e.type === 'recess') return 'receso';
    return 'pluma';
  }
  /* Receso (vacaciones, paro) que cubre una fecha: event.type = 'recess', de event.date a event.until. */
  const recessOn = (events, date) => (events || []).find(e => e.type === 'recess' && e.status !== 'done' && e.date <= date && date <= (valid(e.until) ? e.until : e.date)) || null;
  const nextState = s => s === 'pendiente' ? 'progreso' : s === 'progreso' ? 'hecha' : 'pendiente';
  const taskState = e => e.status === 'done' ? 'hecha' : ['pendiente', 'progreso', 'hecha'].includes(e.taskState) ? e.taskState : 'pendiente';
  function setTaskState(e, s) { e.taskState = s; e.status = s === 'hecha' ? 'done' : 'planned'; }

  // ——— Mover una fecha: historial + deshacer ———
  function syncGradeDate(state, event, date) {
    for (const plan of Object.values(state.grades || {})) for (const row of plan.components || []) {
      if (row.id === event.sourceId || row.id === event.id || GRADE_EVENT[row.id] === event.id) row.date = date;
    }
  }
  function moveEvent(state, id, date, { today = iso(new Date()), by = 'tú', undo = false } = {}) {
    const e = (state.events || []).find(x => x.id === id);
    if (!e || !valid(date) || date === e.date) return { ok: false };
    const entry = { from: e.date, to: date, on: today, by };
    if (undo) entry.undo = true;
    const hadHistory = Array.isArray(e.dateHistory);
    e.dateHistory = hadHistory ? e.dateHistory : [];
    e.dateHistory.push(entry);
    const prev = { date: e.date, dateNote: e.dateNote, weekdayUncertain: e.weekdayUncertain, source: e.source };
    e.date = date;
    if (!undo) { delete e.weekdayUncertain; delete e.dateNote; }
    syncGradeDate(state, e, date);
    return { ok: true, entry, revert() { e.dateHistory.pop(); if (!hadHistory) delete e.dateHistory; Object.assign(e, prev); if (prev.dateNote === undefined) delete e.dateNote; if (prev.weekdayUncertain === undefined) delete e.weekdayUncertain; syncGradeDate(state, e, prev.date); } };
  }
  /* Deshacer el último cambio de fecha (queda anotado en el historial como "deshecho"). */
  function undoLastMove(state, id, opts = {}) {
    const e = (state.events || []).find(x => x.id === id);
    const last = [...(e?.dateHistory || [])].reverse().find(h => !h.undo && h.to === e.date);
    return last ? moveEvent(state, id, last.from, { ...opts, undo: true, by: 'deshacer' }) : { ok: false };
  }
  function removeEvent(state, id) {
    const i = (state.events || []).findIndex(x => x.id === id); if (i < 0) return { ok: false };
    const [e] = state.events.splice(i, 1);
    return { ok: true, event: e, revert() { state.events.splice(Math.min(i, state.events.length), 0, e); } };
  }

  // ——— Semestre: línea de tiempo ———
  /* Bandas de semanas críticas: ventanas de `span` días con `min` o más evaluaciones (las que se traslapan se unen). */
  function criticalBands(events, { span = 9, min = 3 } = {}) {
    const list = (events || []).filter(e => isEval(e) && valid(e.date) && e.status !== 'done').sort((a, b) => a.date.localeCompare(b.date));
    const wins = [];
    list.forEach((first, i) => {
      const end = addDays(first.date, span - 1), inside = list.slice(i).filter(x => x.date <= end);
      if (inside.length >= min) wins.push({ from: first.date, to: inside[inside.length - 1].date, count: inside.length });
    });
    // Ventanas que se traslapan = una sola banda: se queda la de más evaluaciones (a igualdad, la más cercana).
    const bands = []; let reach = '';
    wins.forEach(w => {
      const last = bands[bands.length - 1];
      if (last && w.from <= reach) { if (w.count > last.count) bands[bands.length - 1] = w; reach = w.to > reach ? w.to : reach; }
      else { bands.push(w); reach = w.to; }
    });
    return bands;
  }
  /* Datos de la línea de tiempo: una fila por ramo con sus pruebas, labs y entregas; bandas críticas; marca de hoy. */
  function semester(events, subjects, today) {
    const dated = (events || []).filter(e => valid(e.date) && e.type !== 'recess');
    if (!dated.length) return null;
    const dates = dated.map(e => e.date).concat(today).sort();
    const from = addDays(mondayOf(dates[0]), 0), to = addDays(mondayOf(dates[dates.length - 1]), 6), total = Math.max(1, daysBetween(from, to));
    const pct = d => Math.max(0, Math.min(100, daysBetween(from, d) / total * 100));
    const months = []; let cur = from.slice(0, 7);
    while (cur <= to.slice(0, 7)) { const first = `${cur}-01`; months.push({ key: cur, label: MONTHS[Number(cur.slice(5)) - 1].slice(0, 3), left: pct(first < from ? from : first) }); cur = shiftMonth(cur, 1); }
    return {
      from, to, months, today: pct(today),
      rows: subjects.map(s => ({ subject: s, items: dated.filter(e => e.subject === s.id).sort((a, b) => a.date.localeCompare(b.date)).map(e => ({ event: e, left: pct(e.date), kind: kind(e) })) })),
      bands: criticalBands(events).map(b => ({ ...b, left: pct(b.from), width: Math.max(1.2, pct(addDays(b.to, 1)) - pct(b.from)) }))
    };
  }

  // ——— Horario fijo ———
  /* Clases y labs de una fecha, ordenados por hora (schedule[].day: 1 = lunes … 7 = domingo). */
  const scheduleFor = (schedule, date) => (schedule || []).filter(b => Number(b.day) === weekdayIndex(date)).slice().sort((a, b) => String(a.start).localeCompare(String(b.start)));
  const validTime = t => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(t || ''));

  root.NexoCalendarModel = Object.freeze({ GRADE_EVENT, valid, addDays, daysBetween, monthKey, shiftMonth, monthLabel, shortDate, weekdayName, weekdayIndex, mondayOf, weekOf,
    monthGrid, eventsOn, kind, isEval, recessOn, taskState, nextState, setTaskState, moveEvent, undoLastMove, removeEvent, criticalBands, semester, scheduleFor, validTime, WEEKDAYS });
  if (typeof module !== 'undefined') module.exports = root.NexoCalendarModel;
})(typeof window !== 'undefined' ? window : globalThis);
