/* Organización · Calendario (UPDATE 02, Fase 3). Mesa de planos del estudio: 4 vistas (Mes, Semana, Semestre, Lista), hoja del día,
   agregar rápido, editar, mover fechas con historial y deshacer, tareas con estado, receso, horario fijo editable y exportar .ics.
   La lógica es de NexoCalendarModel (puro, con prueba); los planes de cada día, de NexoTodayPlan.planDay. Se pinta desde estudio.js. */
(() => {
  'use strict';
  const M = () => window.NexoCalendarModel;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const VIEWS = [['mes', 'Mes'], ['semana', 'Semana'], ['semestre', 'Semestre'], ['lista', 'Lista']];
  const KIND_NAME = { theory: 'Teoría', exercises: 'Ejercicios', lab: 'Laboratorio', seminar: 'Seminario' };
  const TASK_WORD = { pendiente: 'Pendiente', progreso: 'En progreso', hecha: 'Hecha' };
  const ui = { view: 'mes', month: null, week: null, day: null, add: false, addDate: null, edit: null, availability: false, roll: false, schSettings: false, showPast: false, drag: null };
  let ctx = null;
  const bridge = () => ctx.bridge;
  const today = () => bridge().today();
  const org = () => { const s = bridge().state; s.organization = s.organization && typeof s.organization === 'object' ? s.organization : {}; return s.organization; };
  const keep = () => bridge().save();
  const refresh = () => ctx.refresh();

  // ——— Íconos pixel (9 de ancho): el color del ramo va en las celdas "x"; luces y sombras fijas ———
  const ICONS = {
    sello: ['..ooooo..', '.oxxxxxo.', 'oxllxxxxo', 'oxlxddxxo', 'oxxxxdxxo', 'oxxddxxdo', '.oxxxxxdo', '..ooooo..'],
    matraz: ['...ooo...', '...owo...', '...ogo...', '...ogo...', '..ogggo..', '.ogxxxgo.', 'ogxlxxxgo', 'ogxxxxxgo', '.ooooooo.'],
    pluma: ['......ooo', '.....oxxo', '....oxxlo', '...oxxxo.', '..oxxxo..', '.oxxo....', 'odxo.....', 'od.......', 'o........'],
    receso: ['oooooooo.', 'oxxxxxxo.', 'oxlxxxxo.', 'oxxxxxxo.', 'oooooooo.', 'o........', 'o........', 'o........']
  };
  function icon(kind, color) {
    const rows = ICONS[kind] || ICONS.pluma;
    let r = ''; rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') r += `<rect class="px-${ch}" x="${x}" y="${y}" width="1" height="1"/>`; }));
    return `<svg class="ico-px ico-${kind}" viewBox="0 0 9 ${rows.length}" style="--ramo:${esc(color)}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${r}</svg>`;
  }

  // ——— Datos ———
  const subj = id => id === 'personal' ? { id, name: 'Mi vida', short: 'VIDA', color: '#92b9a0' } : bridge().subjectFor(id);
  const subjColor = e => e.type === 'recess' ? '#7494bc' : subj(e.subject).color;
  const tag = e => e.type === 'recess' ? '<span class="ramo" style="--ramo:#7494bc">RECESO</span>' : `<span class="ramo" style="--ramo:${esc(subj(e.subject).color)}">${esc(subj(e.subject).short)}</span>`;
  const schedule = () => { const o = org(); return Array.isArray(o.schedule) ? o.schedule : (typeof NEXO_SEMESTER !== 'undefined' ? NEXO_SEMESTER.schedule : []); };
  const critical = () => window.NexoTodayPlan.critical(bridge().state.events, today());
  const dayNum = d => Number(d.slice(8));
  const longDate = d => new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${d}T12:00:00`));
  function gradeOf(e) {
    const GR = window.NexoGradeRules; if (!GR) return null;
    for (const s of bridge().subjects) {
      const c = bridge().gradeConfig(s.id).components.find(x => x.id === e.id || x.id === e.sourceId || M().GRADE_EVENT[x.id] === e.id);
      if (c) return GR.known(c);
    }
    return null;
  }
  const inCritical = d => (critical() && d >= critical().from && d <= critical().to);

  // ——— Pantalla ———
  function panel(S, b) {
    ctx = ctx ? { ...ctx, bridge: b } : { bridge: b };
    ui.month = ui.month || M().monthKey(today());
    ui.week = ui.week || M().mondayOf(today());
    const body = ui.view === 'mes' ? vistaMes() : ui.view === 'semana' ? vistaSemana() : ui.view === 'semestre' ? vistaSemestre() : vistaLista();
    return `<div class="cal-layout${ui.day ? ' con-hoja' : ''}">
      <article class="pergamino cal" aria-labelledby="calTit">
        <header class="pergamino-head"><div><p class="eyebrow">MESA DE PLANOS</p><h2 id="calTit">Calendario</h2></div>
          <div class="cal-acciones"><button type="button" class="pix-btn" data-cal-add aria-expanded="${ui.add}">+ Agregar</button>
            <button type="button" class="pix-btn suave" data-cal-availability>Mis horarios</button>
            <button type="button" class="pix-btn suave" data-cal-ics title="Llévalo al calendario del celular">Exportar .ics</button></div></header>
        <nav class="cal-vistas" role="tablist" aria-label="Vista del calendario">${VIEWS.map(([id, t]) => `<button type="button" role="tab" aria-selected="${ui.view === id}" data-cal-view="${id}">${t}</button>`).join('')}</nav>
        ${body}
        ${leyenda()}
      </article>${ui.day ? hojaDia() : ''}${ui.availability ? window.NexoEventEditor.availability(org(), b.state.settings?.dailyGoalMinutes || 120) : ui.add || ui.edit ? formulario(ui.edit ? b.state.events.find(e => e.id === ui.edit) : null, ui.addDate || today()) : ''}</div>`;
  }
  const leyenda = () => `<p class="cal-leyenda" aria-label="Leyenda">${icon('sello', '#e2b850')} prueba o control · ${icon('matraz', '#e2b850')} laboratorio · ${icon('pluma', '#e2b850')} entrega o tarea · <span class="leyenda-banda"></span> semana crítica</p>`;

  // ——— Mes: pergamino desplegado en la mesa ———
  function celda(d, evs) {
    const rec = M().recessOn(bridge().state.events, d), icons = evs.filter(e => e.type !== 'recess');
    const names = icons.map(e => e.title).join(', ');
    return `<button type="button" class="dia${d === today() ? ' hoy' : ''}${d === ui.day ? ' sel' : ''}${inCritical(d) ? ' critica' : ''}${rec ? ' receso' : ''}${d < today() ? ' pasado' : ''}" data-cal-day="${d}"
      aria-label="${esc(longDate(d))}: ${icons.length ? icons.length + (icons.length === 1 ? ' evento' : ' eventos') + ': ' + esc(names) : 'sin eventos'}${rec ? '; receso' : ''}">
      <b>${dayNum(d)}</b><span class="dia-ico">${icons.slice(0, 3).map(e => icon(M().kind(e), subjColor(e))).join('')}${icons.length > 3 ? `<small>+${icons.length - 3}</small>` : ''}</span></button>`;
  }
  function vistaMes() {
    const g = M().monthGrid(ui.month), evs = bridge().state.events;
    const roll = ui.roll; ui.roll = false;
    return `<div class="mes"><div class="cal-nav"><button type="button" class="pix-btn mini" data-cal-mes="-1" aria-label="Mes anterior">‹</button><h3>${esc(g.label)}</h3>
      <button type="button" class="pix-btn mini" data-cal-mes="1" aria-label="Mes siguiente">›</button><button type="button" class="pix-btn suave" data-cal-hoy>Hoy</button></div>
      <div class="mes-papel${roll ? ' enrollar' : ''}"><div class="mes-sem" aria-hidden="true">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(x => `<b>${x}</b>`).join('')}</div>
      <div class="mes-dias">${g.cells.map(d => d ? celda(d, M().eventsOn(evs, d)) : '<span class="vacio" aria-hidden="true"></span>').join('')}</div></div></div>`;
  }

  // ——— Semana: horario fijo + eventos + bloques de estudio (arrastrables) ———
  function bloquesDe(d) {
    if (d < today()) return [];
    return window.NexoTodayPlan.planDay(bridge(), d, critical());
  }
  const blockTime = b => b.start ? `<time class="agenda-slot">${b.start}–${b.end}</time>` : b.done ? '' : '<span class="agenda-slot pending">Sin horario</span>';
  function capacity(d, blocks) {
    const info = window.NexoSchedule.dayInfo(bridge().state, d, schedule());
    const pending = blocks.filter(b => !b.done && (!b.start || b.remainingMinutes));
    return `<div class="day-capacity${pending.length ? ' tight' : ''}"><span>${info.configured ? `${info.available} min libres` : 'Disponibilidad sin definir'}</span>${pending.length ? `<b>${pending.length} sesión${pending.length === 1 ? '' : 'es'} por ubicar</b>` : ''}${info.conflicts.length ? `<small role="status">Hay horarios superpuestos: ${info.conflicts.map(c => esc(c.a + ' / ' + c.b)).join('; ')}.</small>` : ''}${info.warnings.length ? `<small>${info.warnings.map(esc).join(' ')}</small>` : ''}</div>`;
  }
  function vistaSemana() {
    const days = M().weekOf(ui.week), st = bridge().state;
    const label = `${M().shortDate(days[0])} – ${M().shortDate(days[6])}`;
    return `<div class="semana-vista"><div class="cal-nav"><button type="button" class="pix-btn mini" data-cal-sem="-1" aria-label="Semana anterior">‹</button><h3>Semana del ${esc(label)}</h3>
      <button type="button" class="pix-btn mini" data-cal-sem="1" aria-label="Semana siguiente">›</button><button type="button" class="pix-btn suave" data-cal-hoy>Esta semana</button></div>
      <div class="sem-dias">${days.map(d => {
        const evs = M().eventsOn(st.events, d), clases = M().scheduleFor(schedule(), d), bl = bloquesDe(d), rec = M().recessOn(st.events, d);
        return `<section class="sem-dia${d === today() ? ' hoy' : ''}${d < today() ? ' pasado' : ''}${inCritical(d) ? ' critica' : ''}${rec ? ' receso' : ''}" data-cal-drop="${d}" aria-label="${esc(longDate(d))}">
          <header><button type="button" data-cal-day="${d}"><b>${esc(M().weekdayName(d).slice(0, 3))}</b> ${dayNum(d)}</button>${rec ? '<small>receso</small>' : ''}</header>
          ${capacity(d, bl)}
          <ul class="tablillas">${clases.map(c => `<li class="tablilla" style="--ramo:${esc(subj(c.subject).color)}" title="${esc(c.room || '')}"><b>${esc(c.start)}–${esc(c.end)}</b> ${esc(c.name || subj(c.subject).short)} <small>${esc(KIND_NAME[c.kind] || '')}</small></li>`).join('')}</ul>
          <ul class="sem-evs">${evs.filter(e => e.type !== 'recess').map(e => `<li class="sem-ev"><button type="button" data-cal-day="${d}" style="--ramo:${esc(subjColor(e))}">${icon(M().kind(e), subjColor(e))}<span>${esc(subj(e.subject).short)} ${esc(e.title)}${e.time ? ` <small>${esc(e.time)}</small>` : ''}</span></button></li>`).join('')}</ul>
          ${bl.length ? `<ul class="sem-bloques" aria-label="Estudio propuesto">${bl.map(b => `<li class="sem-bloque${b.done ? ' hecho' : ''}" draggable="${b.done ? 'false' : 'true'}" data-cal-drag="${esc(b.event.id)}" data-from="${d}" style="--ramo:${esc(subj(b.subject).color)}">
            ${blockTime(b)}<span class="ramo" style="--ramo:${esc(subj(b.subject).color)}">${esc(subj(b.subject).short)}</span> <b>${b.minutes} min</b> <span class="tinta">${esc(b.text)}</span>
            ${b.remainingMinutes ? `<small>Quedan ${b.remainingMinutes} min por ubicar.</small>` : ''}${b.unplaced ? `<small class="block-warning">${esc(b.unplaced)}</small>` : ''}
            ${b.done ? '' : `<select class="mover" data-cal-mover="${esc(b.event.id)}" data-from="${d}" aria-label="Mover este bloque a otro día"><option value="">Mover a…</option>${days.filter(x => x !== d && x >= today()).map(x => `<option value="${x}">${esc(M().weekdayName(x))} ${dayNum(x)}</option>`).join('')}</select>`}</li>`).join('')}</ul>` : ''}
        </section>`;
      }).join('')}</div>
      <details class="horario"${ui.schSettings ? ' open' : ''}><summary data-cal-sch-toggle>Ajustar mi horario fijo</summary>${editorHorario()}</details></div>`;
  }
  function editorHorario() {
    const sch = schedule();
    const sOpt = id => bridge().subjects.map(s => `<option value="${esc(s.id)}"${s.id === id ? ' selected' : ''}>${esc(s.name)}</option>`).join('') + `<option value="ingles"${id === 'ingles' ? ' selected' : ''}>Otro (ej. Inglés)</option>`;
    return `<div class="hor-lista">${sch.map((b, i) => `<div class="hor-fila">
      <select aria-label="Día" data-cal-sch="${i}:day">${M().WEEKDAYS.map((n, k) => `<option value="${k + 1}"${Number(b.day) === k + 1 ? ' selected' : ''}>${n}</option>`).join('')}</select>
      <input type="time" aria-label="Desde" value="${esc(b.start)}" data-cal-sch="${i}:start"><input type="time" aria-label="Hasta" value="${esc(b.end)}" data-cal-sch="${i}:end">
      <select aria-label="Ramo" data-cal-sch="${i}:subject">${sOpt(b.subject)}</select>
      <select aria-label="Tipo" data-cal-sch="${i}:kind">${Object.entries(KIND_NAME).map(([k, n]) => `<option value="${k}"${b.kind === k ? ' selected' : ''}>${n}</option>`).join('')}</select>
      <button type="button" class="pix-btn suave mini" data-cal-sch-del="${i}" aria-label="Quitar este bloque">×</button></div>`).join('')}
      <button type="button" class="pix-btn suave" data-cal-sch-add>+ Agregar clase</button></div>`;
  }

  // ——— Semestre: línea de tiempo ———
  function vistaSemestre() {
    const sem = M().semester(bridge().state.events, bridge().subjects, today());
    if (!sem) return '<p class="pergamino-vacio">Aún no hay fechas para dibujar el semestre.</p>';
    return `<div class="semestre"><div class="sem-scroll"><div class="sem-ancho"><div class="sem-eje" aria-hidden="true">${sem.months.map(m => `<span style="--p:${m.left / 100}">${esc(m.label)}</span>`).join('')}</div>
      <div class="sem-pista">${sem.bands.map(b => `<i class="banda" style="--p:${b.left / 100};--w:${b.width / 100}" title="Semana crítica: ${b.count} evaluaciones"></i>`).join('')}
        <i class="linea-hoy" style="--p:${sem.today / 100}" title="Hoy"></i>
        ${sem.rows.map(r => `<div class="sem-fila" style="--ramo:${esc(r.subject.color)}"><span class="sem-nombre">${esc(r.subject.short)}</span><div class="sem-carril">${r.items.map((i, k, arr) => {
          const g = gradeOf(i.event), done = i.event.status === 'done';
          // Fechas muy cercanas se escalonan en vertical para que no se tapen.
          i.nivel = k && i.left - arr[k - 1].left < 3 ? 1 - arr[k - 1].nivel : 0;
          return `<button type="button" class="marca${done ? ' hecha' : ''}" style="left:${i.left}%;top:${i.nivel ? 72 : 34}%" data-cal-day="${i.event.date}" title="${esc(subj(i.event.subject).short + ' ' + i.event.title + ' · ' + M().shortDate(i.event.date))}"
            aria-label="${esc(i.event.title)}, ${esc(M().shortDate(i.event.date))}">${icon(i.kind, r.subject.color)}${g !== null ? `<small class="nota nota-${window.NexoGradeRules.level(g)}">${window.NexoGradeRules.fmt(g, 1)}</small>` : ''}</button>`;
        }).join('')}</div></div>`).join('')}</div></div></div>
      ${sem.bands.length ? `<p class="sem-criticas">Semanas críticas: ${sem.bands.map(b => `<b>${esc(window.NexoTodayPlan.range(b.from, b.to))}</b> (${b.count} evaluaciones)`).join(' · ')}.</p>` : ''}</div>`;
  }

  // ——— Lista: por semana ———
  function vistaLista() {
    const st = bridge().state, t = today();
    const list = (st.events || []).filter(e => M().valid(e.date) && (ui.showPast || e.date >= t || e.status !== 'done' && e.date >= M().addDays(t, -7))).sort((a, b) => a.date.localeCompare(b.date) || String(a.time || '').localeCompare(String(b.time || '')));
    const weeks = new Map();
    list.forEach(e => { const k = M().mondayOf(e.date); if (!weeks.has(k)) weeks.set(k, []); weeks.get(k).push(e); });
    return `<div class="lista"><label class="lista-pasadas"><input type="checkbox" data-cal-pasadas ${ui.showPast ? 'checked' : ''}> Ver también las ya pasadas</label>
      ${[...weeks].map(([k, evs]) => `<section class="semana"><h3>Semana del ${esc(M().shortDate(k))}${inCritical(k) ? ' <span class="chip chip-warn">semana crítica</span>' : ''}</h3><ul>${evs.map(e => `<li class="${e.status === 'done' ? 'hecho' : ''}">
        ${icon(M().kind(e), subjColor(e))}<time datetime="${esc(e.date)}">${esc(M().shortDate(e.date))}${e.time ? ' · ' + esc(e.time) : ''}</time> ${tag(e)}
        <span>${esc(e.title)}${e.topic ? ` <small>${esc(e.topic)}</small>` : ''}${e.dateHistory?.length ? ' <small class="movida">(movida)</small>' : ''}</span>
        <button type="button" class="pix-btn suave mini" data-cal-day="${e.date}" aria-label="Abrir ${esc(e.title)}">Abrir</button></li>`).join('')}</ul></section>`).join('') || '<p class="pergamino-vacio">Sin fechas por delante.</p>'}</div>`;
  }

  function formulario(ev, date) {
    return window.NexoEventEditor.render(ev, date, bridge().subjects, ui.lastSubject);
  }

  // ——— Hoja del día (al costado en PC, desde abajo en celular) ———
  function hojaDia() {
    const d = ui.day, st = bridge().state, evs = M().eventsOn(st.events, d), clases = M().scheduleFor(schedule(), d), bl = bloquesDe(d);
    const rec = M().recessOn(st.events, d);
    return `<aside class="hoja-dia" role="dialog" aria-modal="false" aria-labelledby="hojaTit">
      <header><h3 id="hojaTit">${esc(longDate(d))}</h3><button type="button" class="pix-btn suave mini" data-cal-cerrar aria-label="Cerrar la hoja del día">×</button></header>
      ${d === today() ? '<p class="hoja-hoy">Es hoy. <button type="button" class="pix-btn mini" data-route="planner" data-route-sub="hoy">Ver el plan →</button></p>' : ''}
      ${rec ? `<p class="chip chip-info">Receso: ${esc(rec.title)}. El plan de estos días es liviano.</p>` : ''}
      ${clases.length ? `<ul class="tablillas">${clases.map(c => `<li class="tablilla" style="--ramo:${esc(subj(c.subject).color)}"><b>${esc(c.start)}–${esc(c.end)}</b> ${esc(c.name || subj(c.subject).name)} <small>${esc(KIND_NAME[c.kind] || '')}${c.room ? ' · ' + esc(c.room) : ''}</small></li>`).join('')}</ul>` : ''}
      ${evs.map(e => eventoHoja(e)).join('') || '<p class="pergamino-vacio">Nada anotado este día.</p>'}
      ${bl.length ? `<div class="hoja-plan"><h4>Estudio propuesto</h4><ul>${bl.map(b => `<li class="${b.done ? 'hecho' : ''}">${b.minutes} min · <span class="tinta">${esc(b.text)}</span> <small>(${esc(subj(b.subject).short)})</small></li>`).join('')}</ul></div>` : ''}
      <button type="button" class="pix-btn" data-cal-add-aqui="${d}">+ Agregar aquí</button>
    </aside>`;
  }
  function eventoHoja(e) {
    const isTask = ['task', 'deadline'].includes(e.type), ts = M().taskState(e), g = gradeOf(e);
    const hist = e.dateHistory || [];
    return `<div class="evento${e.status === 'done' ? ' hecho' : ''}" style="--ramo:${esc(subjColor(e))}">
      <div class="evento-cab">${icon(M().kind(e), subjColor(e))}<div><b>${esc(e.title)}</b>${e.time ? ` <small>${esc(e.time)}${e.endTime ? '–' + esc(e.endTime) : ''}</small>` : ''}<br>${tag(e)} ${e.type === 'recess' && e.until ? `<small>hasta ${esc(M().shortDate(e.until))}</small>` : ''}${e.difficulty ? ` <small>dificultad ${esc(e.difficulty)}/5</small>` : ''}</div></div>
      ${e.topic ? `<p class="ev-tema">${esc(e.topic)}</p>` : ''}${e.dateNote ? `<p class="ev-nota">${esc(e.dateNote)}</p>` : ''}${e.notes ? `<p class="ev-tema">${esc(e.notes)}</p>` : ''}
      ${g !== null ? `<p class="ev-nota">Nota: <b>${window.NexoGradeRules.fmt(g, 1)}</b></p>` : ''}
      ${isTask ? `<div class="ev-estado" role="group" aria-label="Estado">${['pendiente', 'progreso', 'hecha'].map(s => `<button type="button" class="pix-btn${ts === s ? '' : ' suave'}" aria-pressed="${ts === s}" data-cal-estado="${esc(e.id)}:${s}">${TASK_WORD[s]}</button>`).join('')}</div>`
        : `<div class="ev-estado"><button type="button" class="pix-btn suave" data-cal-hecho="${esc(e.id)}" aria-pressed="${e.status === 'done'}">${e.status === 'done' ? 'Hecha ✓ (deshacer)' : 'Marcar como hecha'}</button></div>`}
      <form class="ev-mover" data-cal-mover-form="${esc(e.id)}"><label>Mover a <input type="date" name="date" value="${esc(e.date)}" required></label><button type="submit" class="pix-btn suave">Mover</button></form>
      ${e.series ? '<label class="series-scope">Borrar de la serie<select data-delete-scope><option value="one">Solo esta ocasión</option><option value="following">Esta y las siguientes</option></select></label>' : ''}
      <div class="ev-acc"><button type="button" class="pix-btn suave" data-cal-editar="${esc(e.id)}">Editar</button><button type="button" class="pix-btn suave" data-cal-borrar="${esc(e.id)}">Borrar</button></div>
      ${hist.length ? `<details class="historial"><summary>Historial de fechas (${hist.length})</summary><ol>${hist.map(h => `<li>${esc(M().shortDate(h.from))} → <b>${esc(M().shortDate(h.to))}</b> <small>${h.undo ? 'deshecho' : 'movida'} el ${esc(M().shortDate(h.on))}</small></li>`).join('')}</ol>
        <button type="button" class="pix-btn suave" data-cal-deshacer="${esc(e.id)}">Deshacer el último cambio</button></details>` : ''}
    </div>`;
  }

  // ——— Acciones ———
  function mover(id, date, from) {
    const m = M().moveEvent(bridge().state, id, date, { today: today() });
    if (!m.ok) return false;
    keep(); ctx.sound?.('sello');
    const e = bridge().state.events.find(x => x.id === id);
    ui.month = date.slice(0, 7);
    refresh();
    bridge().toast(`${e.title}: ${M().shortDate(m.entry.from)} → ${M().shortDate(date)}. Reacomodé tu plan.`, 'Deshacer', () => { m.revert(); keep(); refresh(); });
    ctx.react?.('nerviosa', `Fecha movida al ${M().shortDate(date)}. Ya reacomodé tu plan.`);
    return true;
  }
  function moverBloque(eventId, from, to) {
    if (!to || to === from) return;
    const o = org(); o.marks = o.marks || {}; o.pins = o.pins || {};
    const mk = o.marks[from] = o.marks[from] || { done: [], skip: [] };
    const hadPinFrom = (o.pins[from] || []).includes(eventId), prevSkip = [...mk.skip], prevPinsTo = [...(o.pins[to] || [])], prevPinsFrom = [...(o.pins[from] || [])];
    if (hadPinFrom) o.pins[from] = o.pins[from].filter(x => x !== eventId); else mk.skip = [...new Set([...mk.skip, eventId])];
    o.pins[to] = [...new Set([...(o.pins[to] || []), eventId])];
    keep(); refresh();
    bridge().toast(`Bloque movido al ${M().weekdayName(to)} ${dayNum(to)}.`, 'Deshacer', () => { mk.skip = prevSkip; o.pins[from] = prevPinsFrom; o.pins[to] = prevPinsTo; keep(); refresh(); });
  }

  function click(e) {
    const t = e.target.closest('button, [data-cal-cerrar]'); if (!t) return;
    const d = t.dataset;
    if (d.agendaType) { const f = t.closest('.cal-form'); f.elements.type.value = d.agendaType; return window.NexoEventEditor.update(f); }
    if (d.calAvailability !== undefined) { ui.availability = true; ui.add = false; ui.edit = null; return refresh(); }
    if (d.route) return bridge().go(d.route, d.routeSub);
    if (d.calView) { ui.view = d.calView; ui.day = null; ui.edit = null; return refresh(); }
    if (d.calMes) { ui.month = M().shiftMonth(ui.month, Number(d.calMes)); ui.roll = true; ctx.sound?.('pagina'); return refresh(); }
    if (d.calSem) { ui.week = M().addDays(ui.week, 7 * Number(d.calSem)); return refresh(); }
    if (d.calHoy !== undefined) { ui.month = M().monthKey(today()); ui.week = M().mondayOf(today()); ui.roll = ui.view === 'mes'; return refresh(); }
    if (d.calDay) { ui.day = d.calDay; ui.edit = null; ui.add = false; if (ui.view === 'mes') ui.month = d.calDay.slice(0, 7); if (ui.view === 'semestre' || ui.view === 'lista') { /* la hoja se ve igual */ } refresh(); return setTimeout(() => document.querySelector('.hoja-dia')?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }), 40); }
    if (d.calCerrar !== undefined) { ui.day = null; ui.edit = null; return refresh(); }
    if (d.calAdd !== undefined) { ui.add = true; ui.addDate = null; ui.edit = null; ui.availability = false; return refresh(); }
    if (d.calAddAqui) { ui.add = true; ui.addDate = d.calAddAqui; ui.edit = null; ui.day = null; refresh(); return setTimeout(() => document.querySelector('.cal-form input[name=title]')?.focus(), 40); }
    if (d.calCancel !== undefined) { ui.add = false; ui.edit = null; ui.availability = false; refresh(); return document.querySelector('[data-cal-add]')?.focus({ preventScroll: true }); }
    if (d.calIcs !== undefined) return bridge().exportIcs();
    if (d.calEditar) { ui.edit = d.calEditar; return refresh(); }
    if (d.calEstado) {
      const [id, s] = d.calEstado.split(':'), ev = bridge().state.events.find(x => x.id === id); if (!ev) return;
      const prev = { taskState: ev.taskState, status: ev.status }; M().setTaskState(ev, s); keep(); if (s === 'hecha') ctx.sound?.('tinta'); refresh();
      return bridge().toast(`${ev.title}: ${TASK_WORD[s].toLowerCase()}.`, 'Deshacer', () => { ev.taskState = prev.taskState; ev.status = prev.status; keep(); refresh(); });
    }
    if (d.calHecho) {
      const ev = bridge().state.events.find(x => x.id === d.calHecho); if (!ev) return;
      const prev = ev.status; ev.status = prev === 'done' ? 'planned' : 'done'; keep(); if (ev.status === 'done') ctx.sound?.('tinta'); refresh();
      return bridge().toast(ev.status === 'done' ? `${ev.title}: hecha.` : `${ev.title}: de nuevo pendiente.`, 'Deshacer', () => { ev.status = prev; keep(); refresh(); });
    }
    if (d.calBorrar) {
      const st = bridge().state, ev = st.events.find(x => x.id === d.calBorrar); if (!ev) return;
      const scope = t.closest('.evento')?.querySelector('[data-delete-scope]')?.value;
      const ids = new Set(window.NexoSchedule.seriesMembers(st.events, ev, scope).map(e => e.id));
      const before = st.events.slice(); st.events = st.events.filter(e => !ids.has(e.id));
      keep(); refresh(); return bridge().toast(`${ids.size === 1 ? 'Actividad borrada' : ids.size + ' ocasiones borradas'}.`, 'Deshacer', () => { st.events = before; keep(); refresh(); });
    }
    if (d.calDeshacer) {
      const r = M().undoLastMove(bridge().state, d.calDeshacer, { today: today() }); if (!r.ok) return bridge().toast('No hay un cambio de fecha para deshacer.');
      keep(); ctx.sound?.('sello'); refresh(); return bridge().toast('Fecha devuelta. Reacomodé tu plan.');
    }
    if (d.calSchAdd !== undefined) { const o = org(); o.schedule = schedule().map(b => ({ ...b })); o.schedule.push({ day: 1, start: '08:15', end: '09:35', subject: bridge().subjects[0].id, kind: 'theory' }); ui.schSettings = true; keep(); return refresh(); }
    if (d.calSchDel !== undefined) { const o = org(); o.schedule = schedule().map(b => ({ ...b })); o.schedule.splice(Number(d.calSchDel), 1); ui.schSettings = true; keep(); return refresh(); }
  }

  function formError(f, text) {
    const el = f.querySelector('.agenda-error'); el.textContent = text; el.hidden = false; el.scrollIntoView({ block: 'nearest' });
  }
  function guardarForm(f) {
    const fd = new FormData(f), st = bridge().state, id = f.dataset.calForm;
    const type = String(fd.get('type') || 'exam');
    const draft = { title: String(fd.get('title') || '').trim(), date: String(fd.get('date') || ''), type,
      subject: String(fd.get('subject') || ''), time: String(fd.get('time') || ''), endTime: String(fd.get('endTime') || ''),
      priority: Math.max(1, Math.min(3, Number(fd.get('priority')) || 2)), difficulty: Number(fd.get('difficulty')) || undefined,
      notes: String(fd.get('notes') || '').trim().slice(0, 500), until: type === 'recess' ? String(fd.get('until') || '') : undefined };
    const r = window.NexoSchedule.saveEvent(st, draft, { id, scope: String(fd.get('scope') || 'one'),
      count: !id && fd.has('weekly') ? Number(fd.get('repeatCount')) || 8 : 1, uid: bridge().uid, today: today() });
    if (!r.ok) return formError(f, r.error);
    if (type === 'lab' && window.NexoLabPlan) st.events.filter(e => e.type === 'lab' && !e.lab).forEach(e => { e.lab = window.NexoLabPlan.normalize({}); });
    ui.lastSubject = draft.subject; ui.edit = null; ui.add = false; ui.month = draft.date.slice(0, 7); ui.day = draft.date;
    keep(); ctx.sound?.('sello'); refresh();
    bridge().toast(r.count > 1 ? `${r.count} ocasiones guardadas. El plan se actualizó.` : 'Guardado. El plan se actualizó.', 'Deshacer', () => { r.revert(); keep(); refresh(); });
    ctx.react?.('saludo', 'Anotado. Ya cuenta para tu semana.');
  }

  function submit(e) {
    const f = e.target; e.preventDefault();
    if (f.matches('[data-availability-form]')) {
      const values = window.NexoEventEditor.readAvailability(f); if (values.error) return formError(f, values.error);
      const o = org(), before = { availability: o.availability, minutes: o.minutes, breakMinutes: o.breakMinutes };
      Object.assign(o, values); ui.availability = false; ui.view = 'semana'; keep(); refresh();
      return bridge().toast('Horarios guardados. Ya puedes revisar las horas propuestas.', 'Deshacer', () => { Object.assign(o, before); keep(); refresh(); });
    }
    if (f.matches('[data-cal-form]')) return guardarForm(f);
    if (f.matches('[data-cal-mover-form]')) { const date = String(new FormData(f).get('date')); if (!mover(f.dataset.calMoverForm, date)) bridge().toast('Esa es la misma fecha, o no es válida.'); }
  }
  function change(e) {
    const t = e.target;
    if (t.closest('.cal-form') && ['type', 'weekly'].includes(t.name)) return window.NexoEventEditor.update(t.closest('.cal-form'));
    if (t.matches('[data-cal-pasadas]')) { ui.showPast = t.checked; return refresh(); }
    if (t.dataset.calMover) return moverBloque(t.dataset.calMover, t.dataset.from, t.value);
    if (t.dataset.calSch) {
      const [i, field] = t.dataset.calSch.split(':'), o = org(); o.schedule = schedule().map(b => ({ ...b }));
      const b = o.schedule[Number(i)]; if (!b) return;
      if ((field === 'start' || field === 'end') && !M().validTime(t.value)) return refresh();
      b[field] = field === 'day' ? Number(t.value) : t.value; ui.schSettings = true; keep(); refresh();
    }
  }
  // Arrastrar un bloque de estudio a otro día (PC). En celular se usa "Mover a…".
  function dragstart(e) { const li = e.target.closest?.('[data-cal-drag]'); if (!li) return; ui.drag = { id: li.dataset.calDrag, from: li.dataset.from }; e.dataTransfer?.setData('text/plain', li.dataset.calDrag); e.dataTransfer && (e.dataTransfer.effectAllowed = 'move'); }
  function dragover(e) { const z = e.target.closest?.('[data-cal-drop]'); if (z && ui.drag && z.dataset.calDrop >= today()) { e.preventDefault(); z.classList.add('suelta'); } }
  function dragleave(e) { e.target.closest?.('[data-cal-drop]')?.classList.remove('suelta'); }
  function drop(e) {
    const z = e.target.closest?.('[data-cal-drop]'); if (!z || !ui.drag) return;
    e.preventDefault(); const dr = ui.drag; ui.drag = null; moverBloque(dr.id, dr.from, z.dataset.calDrop);
  }
  function keydown(e) {
    const dialog = e.target.closest('[data-agenda-dialog]');
    if (dialog && e.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button, input, select, textarea, summary')].filter(el => !el.disabled && el.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
    if (e.key === 'Escape' && (ui.day || ui.edit || ui.add || ui.availability)) {
      if (ui.add || ui.edit || ui.availability) { ui.add = false; ui.edit = null; ui.availability = false; }
      else ui.day = null;
      refresh(); document.querySelector('[data-cal-add]')?.focus({ preventScroll: true });
    }
  }

  function wire(root, c) {
    ctx = { ...ctx, ...c };
    root.onclick = click; root.onsubmit = submit; root.onchange = change; root.onkeydown = keydown;
    root.oninput = e => { const error = e.target.closest('.agenda-form')?.querySelector('.agenda-error'); if (error) error.hidden = true; };
    root.ondragstart = dragstart; root.ondragover = dragover; root.ondragleave = dragleave; root.ondrop = drop;
    const form = root.querySelector('.cal-form'); if (form) window.NexoEventEditor.update(form);
    const dialog = root.querySelector('dialog.agenda-overlay'); if (dialog && !dialog.open) { dialog.showModal(); window.NexoEventEditor.peek(dialog); }
    if (root.querySelector('[data-agenda-dialog]')) requestAnimationFrame(() => root.querySelector('.agenda-form input[name=title], .agenda-form input')?.focus({ preventScroll: true }));
  }
  window.NexoCalendario = Object.freeze({ panel, wire, icon, openAvailability() { ui.availability = true; ui.add = false; ui.edit = null; } });
})();
