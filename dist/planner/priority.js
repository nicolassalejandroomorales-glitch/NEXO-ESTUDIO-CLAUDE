/* Bitácora 1.0: orden explicable, sin inferir dominio desde minutos estudiados. */
(() => {
  'use strict';

  const DAY = 86400000;
  const validDay = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) &&
    !Number.isNaN(new Date(`${value}T12:00:00`).getTime()) &&
    new Date(`${value}T12:00:00`).toISOString().slice(0, 10) === value;
  const daysUntil = (now, date) => Math.round((new Date(`${date}T12:00:00`) - new Date(`${now}T12:00:00`)) / DAY);
  const number = (value, max) => Math.min(max, Math.max(0, Number(value) || 0));
  function target(event, now) {
    if (event.type !== 'lab') return { date: event.date, stage: '' };
    const prelab = event.lab?.prelab;
    const report = event.lab?.after;
    if (!prelab?.done && validDay(prelab?.dueDate) && prelab.dueDate <= event.date)
      return { date: prelab.dueDate, stage: 'Pre-lab' };
    if (now >= event.date && !report?.reportDone && validDay(report?.reportDueDate))
      return { date: report.reportDueDate, stage: 'Informe' };
    return { date: event.date, stage: '' };
  }

  function rank(events, context = {}) {
    const current = new Date();
    const localToday = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,'0')}-${String(current.getDate()).padStart(2,'0')}`;
    const now = validDay(context.today) ? context.today : localToday;
    const weaknesses = context.weaknesses || {};
    const prerequisites = context.prerequisites || {};
    const loadByDay = new Map();
    const academic = (events || []).filter(e => !['class', 'work', 'personal', 'activity', 'study', 'recess'].includes(e?.type));
    for (const event of academic) {
      if (validDay(event?.date) && event.status !== 'done') {
        const date = target(event, now).date;
        loadByDay.set(date, (loadByDay.get(date) || 0) + 1);
      }
    }
    return academic.filter(event => validDay(event?.date) && event.status !== 'done')
      .filter(event => daysUntil(now, target(event, now).date) >= 0 || !['exam', 'Prueba', 'control'].includes(event.type))
      .map(event => {
        const focus = target(event, now);
        const days = daysUntil(now, focus.date);
        const isLab = event.type === 'lab';
        const weight = number(event.priority ?? (['exam', 'Prueba', 'control'].includes(event.type) ? 3 : 2), 3) || 1;
        const prep = number(event.prepMinutes, 2000);
        const gaps = number(weaknesses[event.subject], 20);
        const prereq = number(prerequisites[event.id], 20);
        const load = loadByDay.get(focus.date) || 1;
        const overdue = days < 0;
        const proximity = overdue ? 34 : days <= 1 ? 32 : days <= 3 ? 25 : days <= 7 ? 18 : days <= 14 ? 10 : 3;
        const score = proximity + weight * 7 + Math.min(16, Math.ceil(prep / 30) * 2) +
          Math.min(14, gaps * 3) + Math.min(9, prereq * 3) + (isLab && prep ? 8 : 0) +
          (load > 1 ? Math.min(8, (load - 1) * 4) : 0);
        const reasons = [];
        if (overdue) reasons.push(`Atrasado ${Math.abs(days)} día${days === -1 ? '' : 's'}`);
        else if (days === 0) reasons.push('Hoy');
        else if (days === 1) reasons.push('Mañana');
        else reasons.push(`En ${days} días`);
        if (focus.stage) reasons.push(focus.stage);
        if (weight === 3) reasons.push('Importancia muy alta');
        else if (weight === 2) reasons.push('Importancia alta');
        if (prep) reasons.push(`${prep} min de preparación pendiente`);
        if (gaps) reasons.push(`${gaps} ${gaps === 1 ? 'error abierto' : 'errores abiertos'} en el ramo`);
        if (prereq) reasons.push(`${prereq} ${prereq === 1 ? 'base pendiente' : 'bases pendientes'}`);
        if (load > 1) reasons.push(`${load} compromisos ese día`);
        return { event, score, reasons, days, targetDate: focus.date, stage: focus.stage };
      })
      .sort((a, b) => b.score - a.score || a.days - b.days || String(a.event.id).localeCompare(String(b.event.id)));
  }

  window.NexoPriority = Object.freeze({ rank, daysUntil });
})();
