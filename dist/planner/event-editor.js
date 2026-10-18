/* Hoja de organización: la misma para agregar y editar, con espacio propio sobre la mesa. */
(() => {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const types = [['exam', 'Prueba o control'], ['lab', 'Laboratorio'], ['deadline', 'Entrega'], ['task', 'Tarea o lectura'], ['class', 'Clase'], ['study', 'Sesión de estudio'], ['work', 'Trabajo'], ['personal', 'Actividad personal'], ['recess', 'Descanso o receso']];
  const sector = type => type === 'work' ? 'work' : ['personal', 'activity', 'recess'].includes(type) ? 'personal' : 'academic';
  const num = (n, title, content) => `<fieldset class="agenda-section"><legend><span>${n}</span>${title}</legend>${content}</fieldset>`;
  function shell(title, sub, body, name = 'event') {
    const pt = window.NexoPixelText ? window.NexoPixelText.render(title, { shadow: false }) : title;
    const wisps = [0, 1, 2, 3, 4].map(i => `<i class="agenda-wisp agenda-wisp-${i}"></i>`).join('');
    return `<dialog class="agenda-overlay" data-agenda-overlay aria-labelledby="agendaTitle"><section class="agenda-sheet pu-panel" data-agenda-dialog="${name}">
      <i class="pu-ivy agenda-ivy-l" aria-hidden="true"></i><i class="pu-ivy pu-ivy-b agenda-ivy-r" aria-hidden="true"></i><span class="agenda-wisps" aria-hidden="true">${wisps}</span><canvas class="agenda-pet" width="40" height="44" aria-hidden="true"></canvas>
      <header class="agenda-head"><div><p class="eyebrow">TU BITÁCORA · ORGANIZACIÓN</p><h2 id="agendaTitle" aria-label="${esc(title)}">${pt}</h2><p>${sub}</p></div><button type="button" class="agenda-close" data-cal-cancel aria-label="Cerrar sin guardar">×</button></header>${body}</section></dialog>`;
  }
  // La mascota asoma por el borde y reacciona: base (queda) + gesto breve (flash).
  const mood = { base: ['neutral', 'rest'], flash: null };
  const REACT = { wow: ['deslumbrada', 'cheeks'], worry: ['nerviosa', 'fiddle'], sleep: ['dormida', 'sleep'], cheer: ['feliz', 'up'] };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function gesture(name, ms) { mood.flash = { pose: REACT[name], until: performance.now() + ms }; }
  function peek(root) {
    const pet = root.querySelector('.agenda-pet');
    if (!pet || !window.NexoPet?.mini) { pet?.remove(); return; }
    mood.base = ['neutral', 'rest']; mood.flash = null;
    const now = () => (mood.flash && performance.now() < mood.flash.until ? mood.flash.pose : mood.base);
    window.NexoPet.mini({ canvas: pet, expr: () => now()[0], arm: () => now()[1] });
  }
  // Mira la fecha y la hora del borrador: se asombra al cambiarlas, se preocupa si chocan y duerme de madrugada.
  function watch(form, { state, schedule }) {
    const S = window.NexoSchedule, f = form.elements, start = S.time(f.time.value), end = S.time(f.endTime.value);
    gesture('wow', 1400);
    mood.base = ['neutral', 'rest'];
    if (start === null || !f.date.value) return;
    const id = form.dataset.calForm, info = S.dayInfo(state, f.date.value, schedule);
    const clash = end !== null && info.occupied.some(o => o.id !== id && start < o.end && o.start < end);
    if (clash) mood.base = REACT.worry; else if (start < 360 || start >= 1380) mood.base = REACT.sleep;
  }
  // Al guardar: sello grande, la mascota celebra y el pergamino se enrolla. Devuelve una promesa.
  function farewell(dialog) {
    const sheet = dialog?.querySelector('.agenda-sheet');
    if (!sheet || reduced()) return Promise.resolve();
    dialog.querySelectorAll('button').forEach(b => { b.disabled = true; });
    sheet.insertAdjacentHTML('beforeend', '<i class="pu-seal pu-seal-3 agenda-stamp" aria-hidden="true"></i>');
    gesture('cheer', 1200);
    sheet.classList.add('sellando');
    return new Promise(done => setTimeout(done, 950));
  }
  function render(ev, date, subjects, lastSubject) {
    const e = ev || {}, type = ['Prueba', 'control'].includes(e.type) ? 'exam' : e.type || 'exam';
    const end = e.endTime || (e.time && e.durationMinutes ? window.NexoSchedule.clock(Math.min(1439, window.NexoSchedule.time(e.time) + e.durationMinutes)) : '');
    const subject = e.subject || lastSubject || subjects[0]?.id;
    const opt = (v, t, cur) => `<option value="${esc(v)}"${String(v) === String(cur) ? ' selected' : ''}>${esc(t)}</option>`;
    const form = `<form class="cal-form agenda-form" data-cal-form="${esc(e.id || '')}" data-sector="${sector(type)}">
      <div class="agenda-body"><div class="agenda-sectors" role="group" aria-label="Ámbito de la actividad">${[['academic', 'exam', 'Estudio', 'Clases, pruebas y entregas'], ['work', 'work', 'Trabajo', 'Turnos y compromisos'], ['personal', 'personal', 'Mi vida', 'Actividades y descanso']].map(([s, t, name, hint]) => `<button type="button" data-agenda-type="${t}" aria-pressed="${sector(type) === s}"><b>${name}</b><small>${hint}</small></button>`).join('')}</div>
      ${num('01', 'Qué vas a organizar', `<label class="agenda-name">Nombre<input name="title" required maxlength="80" value="${esc(e.title || '')}" placeholder="Ej. turno de trabajo, PEP de Orgánica…" autocomplete="off"></label><div class="agenda-grid"><label>Tipo<select name="type">${types.map(([v, t]) => opt(v, t, type)).join('')}${types.some(([v]) => v === type) ? '' : opt(type, type, type)}</select></label><label data-academic>Ramo<select name="subject">${subjects.map(s => opt(s.id, s.name, subject)).join('')}${opt('personal', 'Sin ramo · personal / trabajo', subject)}</select></label></div>`)}
      ${num('02', 'Cuándo ocurre', `<div class="agenda-grid agenda-when"><label>Fecha<input name="date" type="date" required value="${esc(e.date || date)}"></label><label>Desde<input name="time" type="time" value="${esc(e.time || '')}"></label><label>Hasta<input name="endTime" type="time" value="${esc(end)}"></label></div><p class="agenda-hint" data-time-hint>Si agregas inicio y término, Nexo reserva ese espacio y organiza el estudio alrededor.</p><label class="agenda-until" ${type === 'recess' ? '' : 'hidden'}>Último día del receso<input name="until" type="date" value="${esc(e.until || '')}"></label>
      ${ev?.series ? '<label>Aplicar cambios a<select name="scope"><option value="one">Solo esta ocasión</option><option value="following">Esta y las siguientes de la serie</option></select></label>' : !ev ? '<div class="agenda-repeat"><label class="check"><input name="weekly" type="checkbox"> Repetir cada semana</label><label data-repeat-count hidden>Ocasiones, contando esta<input name="repeatCount" type="number" min="2" max="52" value="8"></label></div>' : ''}`)}
      <details class="mas agenda-details"${ev ? ' open' : ''}><summary>Preparación y notas <span>Opcional</span></summary><div class="cal-form-mas agenda-grid"><label data-academic>Importancia<select name="priority">${[[1, 'Normal'], [2, 'Alta'], [3, 'Muy alta']].map(([v, t]) => opt(v, t, e.priority || 2)).join('')}</select></label><label data-academic>Dificultad<select name="difficulty">${opt('', 'Sin definir', e.difficulty || '')}${[1, 2, 3, 4, 5].map(v => opt(v, `${v} / 5`, e.difficulty)).join('')}</select></label><label class="ancho">Notas<textarea name="notes" maxlength="500" rows="3" placeholder="Qué llevar, dónde es, qué necesitas preparar…">${esc(e.notes || '')}</textarea></label></div></details>
      <p class="agenda-error" role="alert" hidden></p></div>
      <footer class="agenda-footer"><i class="pu-seal pu-seal-1 agenda-seal" aria-hidden="true"></i><p>El alquimista lo anota en tu calendario.<br><small>Podrás moverlo o corregirlo cuando quieras.</small></p><div class="cal-form-acc"><button type="button" class="pu-btn" data-cal-cancel>Mejor no</button><button type="submit" class="pu-btn">${ev ? 'Corregir pergamino' : 'Sellar en mi semana'}</button></div></footer></form>`;
    return shell(ev ? 'Corrige el pergamino' : 'Que nada se escape', ev ? 'Ajusta lo que cambió; el plan se reacomoda solito con tus nuevos horarios.' : 'Estudio, trabajo y vida propia: todo cabe en el mismo pergamino.', form);
  }
  function update(form) {
    const type = form.elements.type.value, s = sector(type), fixed = window.NexoSchedule.fixed(type);
    form.dataset.sector = s;
    form.querySelectorAll('[data-academic]').forEach(el => { el.hidden = s !== 'academic'; });
    form.querySelectorAll('[data-agenda-type]').forEach(el => { el.setAttribute('aria-pressed', sector(el.dataset.agendaType) === s); });
    form.elements.time.required = fixed; form.elements.endTime.required = fixed;
    form.querySelector('.agenda-until').hidden = type !== 'recess';
    form.querySelector('[data-time-hint]').textContent = fixed ? 'Este horario queda reservado. Nexo buscará otros espacios para estudiar.' : type === 'recess' ? 'Elige el período del receso. El plan propondrá un repaso liviano.' : 'Sin hora funciona como fecha límite. Añade inicio y término si debe reservar tiempo.';
    const count = form.querySelector('[data-repeat-count]'); if (count) count.hidden = !form.elements.weekly.checked;
  }
  function availability(org, goal = 120) {
    const days = [[1, 'Lunes'], [2, 'Martes'], [3, 'Miércoles'], [4, 'Jueves'], [5, 'Viernes'], [6, 'Sábado'], [0, 'Domingo']];
    const rows = days.map(([id, name]) => {
      const saved = org.availability?.[id], ranges = saved || [{ start: id === 0 || id === 6 ? '10:00' : '17:00', end: id === 0 || id === 6 ? '18:00' : '21:00' }];
      return `<fieldset class="availability-day"><legend><label class="check"><input type="checkbox" name="enabled-${id}"${!saved || saved.length ? ' checked' : ''}>${name}</label></legend><div class="availability-windows">${[0, 1].map(i => `<div><span>${i ? 'Otra franja' : 'Disponible'}</span><input type="time" name="from-${id}-${i}" aria-label="${name}, inicio ${i + 1}" value="${esc(ranges[i]?.start || '')}"><span>–</span><input type="time" name="to-${id}-${i}" aria-label="${name}, término ${i + 1}" value="${esc(ranges[i]?.end || '')}"></div>`).join('')}</div><label class="availability-goal">Meta<input type="number" name="minutes-${id}" aria-label="Meta de estudio del ${name.toLowerCase()}" min="0" max="600" step="5" value="${Number(org.minutes?.[id] ?? goal)}"> min</label></fieldset>`;
    }).join('');
    return shell('Tus horas de estudio', 'Marca cuándo podrías estudiar; el alquimista descontará clases, trabajo y actividades.', `<form class="agenda-form" data-availability-form><div class="agenda-body"><p class="agenda-callout">${org.availability ? 'Tus franjas actuales. Apaga un día para que el caldero descanse, o pártelo en dos.' : 'Estos horarios son una sugerencia del alquimista. Ajústalos y séllalos para empezar a usarlos.'}</p>${rows}<label class="availability-break">Pausa entre sesiones<select name="breakMinutes">${[0, 5, 10, 15, 20, 30].map(n => `<option value="${n}"${Number(org.breakMinutes ?? 10) === n ? ' selected' : ''}>${n} minutos</option>`).join('')}</select></label><p class="agenda-error" role="alert" hidden></p></div><footer class="agenda-footer"><p>Descansar también cuenta.<br><small>Un día desmarcado queda sin estudio.</small></p><i class="pu-seal pu-seal-2 agenda-seal" aria-hidden="true"></i><div class="cal-form-acc"><button type="button" class="pu-btn" data-cal-cancel>Mejor no</button><button type="submit" class="pu-btn">Sellar mis horarios</button></div></footer></form>`, 'availability');
  }
  function readAvailability(form) {
    const fd = new FormData(form), availability = {}, minutes = {};
    for (let d = 0; d < 7; d++) {
      availability[d] = []; const value = Number(fd.get(`minutes-${d}`));
      if (!Number.isFinite(value) || value < 0 || value > 600) return { error: 'La meta diaria debe estar entre 0 y 600 minutos.' };
      minutes[d] = fd.has(`enabled-${d}`) ? value : 0;
      if (!fd.has(`enabled-${d}`)) continue;
      for (let i = 0; i < 2; i++) {
        const start = String(fd.get(`from-${d}-${i}`) || ''), end = String(fd.get(`to-${d}-${i}`) || '');
        if (!start && !end) continue;
        const a = window.NexoSchedule.time(start), b = window.NexoSchedule.time(end);
        if (a === null || b === null || b <= a) return { error: 'Cada franja necesita inicio y término, dentro del mismo día.' };
        availability[d].push({ start, end });
      }
      if (!availability[d].length) return { error: 'Añade una franja a los días marcados, o desmárcalos para descansar.' };
    }
    return { availability, minutes, breakMinutes: Number(fd.get('breakMinutes')) || 0 };
  }
  window.NexoEventEditor = Object.freeze({ render, update, availability, readAvailability, peek, watch, farewell });
})();
