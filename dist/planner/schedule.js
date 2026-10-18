/* Organización: intervalos locales y propuestas de estudio. No modifica compromisos ni mide dominio. */
(function (root) {
  'use strict';
  const time = s => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(s || '')) ? Number(s.slice(0, 2)) * 60 + Number(s.slice(3)) : null;
  const clock = n => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  const fixed = type => ['class', 'work', 'personal', 'activity', 'study'].includes(type);
  const personal = type => ['work', 'personal', 'activity', 'recess'].includes(type);
  const weekday = day => new Date(`${day}T12:00:00`).getDay();
  function merge(ranges) {
    const out = [];
    ranges.filter(r => r.end > r.start).sort((a, b) => a.start - b.start).forEach(r => {
      const last = out[out.length - 1];
      if (last && r.start <= last.end) last.end = Math.max(last.end, r.end);
      else out.push({ start: r.start, end: r.end });
    });
    return out;
  }
  function subtract(windows, occupied) {
    let free = merge(windows);
    merge(occupied).forEach(b => { free = free.flatMap(a => b.end <= a.start || b.start >= a.end ? [a] :
      [{ start: a.start, end: Math.min(a.end, b.start) }, { start: Math.max(a.start, b.end), end: a.end }].filter(r => r.end > r.start)); });
    return free;
  }
  function dayInfo(state, day, schedule = [], now = new Date()) {
    const wd = weekday(day), org = state.organization || {}, config = org.availability;
    const configured = !!config && Array.isArray(config[wd]);
    const windows = configured ? config[wd].map(w => ({ start: time(w.start), end: time(w.end) })).filter(w => w.start !== null && w.end !== null && w.end > w.start) : [];
    const schoolDay = wd === 0 ? 7 : wd;
    const occupied = (schedule || []).filter(c => Number(c.day) === schoolDay).map(c => ({
      start: time(c.start), end: time(c.end), title: c.name || 'Clase', subject: c.subject, kind: c.kind, id: c.id || `class-${c.start}`, source: 'schedule'
    })).filter(c => c.start !== null && c.end !== null && c.end > c.start);
    const warnings = [];
    (state.events || []).filter(e => e.date === day && e.type !== 'recess').forEach(e => {
      const start = time(e.time), explicit = time(e.endTime), duration = Number(e.durationMinutes) || 0;
      if (start === null) return;
      const end = explicit !== null ? explicit : duration > 0 ? Math.min(1440, start + duration) : null;
      if (end === null && ['task', 'deadline', 'report', 'prelab'].includes(e.type)) return;
      // El práctico puede estar también en el horario oficial; no se cuenta dos veces.
      const duplicate = e.type === 'lab' && occupied.some(c => c.source === 'schedule' && c.kind === 'lab' && c.subject === e.subject && c.start === start);
      if (duplicate) return;
      if (end === null || end <= start) { warnings.push(`Falta la hora de término de «${e.title}».`); return; }
      occupied.push({ start, end, title: e.title, id: e.id, type: e.type, source: 'event' });
    });
    const conflicts = [];
    occupied.forEach((a, i) => occupied.slice(i + 1).forEach(b => {
      if (a.start < b.end && b.start < a.end) conflicts.push({ a: a.title, b: b.title });
    }));
    const localDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const elapsed = day === localDay ? now.getHours() * 60 + now.getMinutes() : day < localDay ? 1440 : 0;
    const free = subtract(windows, [...occupied, { start: 0, end: elapsed }]);
    const reservedStudyMinutes = occupied.filter(c => c.type === 'study').reduce((n, c) => n + c.end - c.start, 0);
    return { date: day, configured, free, occupied, conflicts, warnings, reservedStudyMinutes, available: free.reduce((n, r) => n + r.end - r.start, 0) };
  }
  function allocate(blocks, info, { breakMinutes = 10, limit = 120 } = {}) {
    let slots = info.free.map(r => ({ ...r })), used = 0;
    const pause = Math.max(0, Math.min(60, Number(breakMinutes) || 0));
    return blocks.map(block => {
      const b = { ...block, start: null, end: null, remainingMinutes: 0 };
      if (b.done) return b;
      if (!info.configured) return { ...b, unplaced: 'Define tus horas disponibles para asignarle un horario.' };
      if (info.warnings.length) return { ...b, unplaced: 'Completa los horarios pendientes antes de ubicar el estudio.' };
      const room = Math.max(0, Number(limit) - used);
      const min = b.flash ? 5 : 15;
      const due = b.event?.date === info.date && b.stage !== 'Informe' ? time(b.event.time) : null;
      const until = r => due === null ? r.end : Math.min(r.end, due);
      const slot = slots.find(r => Math.min(until(r) - r.start, room) >= Math.min(min, b.minutes));
      if (!slot) return { ...b, unplaced: 'No cabe en tus espacios disponibles. Puedes moverla a otro día.' };
      const duration = Math.min(b.minutes, until(slot) - slot.start, room);
      b.start = clock(slot.start); b.end = clock(slot.start + duration);
      b.remainingMinutes = b.minutes - duration; b.minutes = duration;
      used += duration; slot.start += duration + pause;
      slots = slots.filter(r => r.end > r.start);
      return b;
    });
  }
  // Valida antes de mutar: una serie inválida nunca deja ocasiones a medio guardar.
  function validateEvent(draft) {
    const M = root.NexoCalendarModel;
    if (!String(draft.title || '').trim()) return 'Escribe el nombre de la actividad.';
    if (!M.valid(draft.date)) return 'Elige una fecha válida.';
    const start = time(draft.time), end = time(draft.endTime);
    if (draft.time && start === null || draft.endTime && end === null) return 'Revisa las horas de inicio y término.';
    if (fixed(draft.type) && (start === null || end === null)) return 'Esta actividad necesita hora de inicio y término.';
    if (end !== null && (start === null || end <= start)) return 'El término debe ser posterior al inicio, dentro del mismo día.';
    if (draft.type === 'recess' && draft.until && (!M.valid(draft.until) || draft.until < draft.date)) return 'El receso debe terminar el mismo día o después.';
    return '';
  }
  function seriesMembers(events, event, scope) {
    return !event.series || scope !== 'following' ? [event] : events.filter(e => e.series === event.series && e.date >= event.date);
  }
  function saveEvent(state, draft, { id = '', scope = 'one', count = 1, uid, today } = {}) {
    const error = validateEvent(draft); if (error) return { ok: false, error };
    const M = root.NexoCalendarModel, ev = id && state.events.find(e => e.id === id);
    if (id && !ev) return { ok: false, error: 'Esta actividad ya no está en el calendario.' };
    const clean = { ...draft, title: draft.title.trim(), durationMinutes: draft.time && draft.endTime ? time(draft.endTime) - time(draft.time) : 0 };
    if (personal(clean.type)) clean.subject = 'personal';
    const members = ev ? seriesMembers(state.events, ev, scope) : [];
    const shift = ev ? M.daysBetween(ev.date, clean.date) : 0;
    const before = JSON.parse(JSON.stringify(state.events));
    const gradeBefore = JSON.parse(JSON.stringify(state.grades || {}));
    if (ev) {
      members.forEach(e => {
        const date = M.addDays(e.date, shift);
        if (date !== e.date) M.moveEvent(state, e.id, date, { today });
        Object.assign(e, clean, { date });
      });
    } else {
      const n = Math.max(1, Math.min(52, Math.floor(Number(count)) || 1)), series = n > 1 ? uid('series') : undefined;
      for (let i = 0; i < n; i++) state.events.push({ ...clean, id: uid('event'), date: M.addDays(clean.date, 7 * i), status: 'planned', source: 'manual', dependencies: [], ...(series ? { series } : {}) });
    }
    return { ok: true, count: ev ? members.length : Math.max(1, Math.min(52, Math.floor(Number(count)) || 1)), revert() { state.events = before; state.grades = gradeBefore; } };
  }
  const api = Object.freeze({ time, clock, fixed, personal, merge, subtract, dayInfo, allocate, validateEvent, saveEvent, seriesMembers });
  root.NexoSchedule = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
