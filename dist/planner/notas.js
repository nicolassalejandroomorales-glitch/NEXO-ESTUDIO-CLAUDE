/* Organización · Notas e inasistencias (UPDATE 02, Fase 2). Balanza y libro del estudio de planos.
   Lomos de libro por ramo, repisas de Teoría y Laboratorio, un frasco por evaluación (ancho = peso, líquido = nota por escalones),
   "Necesitas X,X" tallado, simulador con palanca, riesgo de examen, promedio general e inasistencias.
   Las cuentas son de NexoGrades / NexoGradeRules; los datos son state.grades (gradeConfig) y state.absences. Se pinta desde estudio.js. */
(() => {
  'use strict';
  const R = () => window.NexoGradeRules;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
  const dateLabel = d => { const x = new Date(`${d}T12:00:00`); return `${x.getDate()} ${MONTHS[x.getMonth()]}`; };
  const GROUPS = ['theory', 'lab'];
  const ui = { subject: null, edit: false, sim: {}, dialog: null, autopsy: null, fresh: null, absForm: false };
  let ctx = null;

  // ——— Números en pixel (5×7), para "Necesitas 4,6" ———
  const GL = {
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'], '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'], '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '4': ['10010', '10010', '10010', '11111', '00010', '00010', '00010'], '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
    '6': ['01111', '10000', '10000', '11110', '10001', '10001', '01110'], '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'], '9': ['01110', '10001', '10001', '01111', '00001', '00001', '11110'],
    ',': ['00', '00', '00', '00', '01', '01', '10'], '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'], '—': ['00000', '00000', '00000', '11111', '00000', '00000', '00000']
  };
  function pixelText(text, cls = '') {
    let x = 0, rects = '';
    for (const ch of String(text)) {
      const rows = GL[ch] || GL['?'];
      rows.forEach((row, y) => [...row].forEach((b, dx) => { if (b === '1') rects += `<rect x="${x + dx}" y="${y}" width="1" height="1"/>`; }));
      x += rows[0].length + 1;
    }
    return `<svg class="pix-num ${cls}" viewBox="0 0 ${Math.max(1, x - 1)} 7" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects}</svg>`;
  }

  // ——— Datos ———
  const bridge = () => ctx.bridge;
  const org = () => { const s = bridge().state; s.organization = s.organization && typeof s.organization === 'object' ? s.organization : {}; return s.organization; };
  const maxes = () => { const o = org(); o.absenceMax = o.absenceMax && typeof o.absenceMax === 'object' ? o.absenceMax : {}; return o.absenceMax; };
  const cfg = id => bridge().gradeConfig(id);
  // Las pruebas de ciclo del laboratorio tienen id distinto en el calendario que en las notas.
  const LINK = window.NexoCalendarModel?.GRADE_EVENT || { 'grade-fq-lab-ciclo': 'official-fq-ciclo', 'grade-org-lab-ciclo1': 'official-org-ciclo1', 'grade-org-lab-ciclo2': 'official-org-ciclo2' };
  const eventFor = id => (bridge().state.events || []).find(e => e.sourceId === id || e.id === id || e.id === LINK[id]);
  const num = v => R().num(v);

  function defaultSubject() {
    const next = (bridge().ranked() || []).find(x => ['exam', 'Prueba', 'control'].includes(x.event.type));
    return next?.event.subject || bridge().subjects[0].id;
  }
  function current() {
    if (!ui.subject || !bridge().subjects.some(s => s.id === ui.subject)) ui.subject = org().notasSubject || defaultSubject();
    return bridge().subjectFor(ui.subject);
  }
  const evalAll = () => bridge().subjects.map(s => ({ s, ev: R().evaluate(s.id, cfg(s.id)) }));
  const w1 = w => String(Number(num(w).toFixed(1))).replace('.', ',');
  const gname = (c, g) => c.groups?.[g]?.name || (g === 'lab' ? 'Laboratorio' : 'Teoría');

  // ——— Piezas ———
  const STATUS_WORD = { risk: 'En riesgo', warn: 'Ojo', ok: 'Vas bien', none: '' };
  function lomos(evs) {
    return `<nav class="lomos" role="tablist" aria-label="Ramo">${evs.map(({ s, ev }) => `<button role="tab" type="button" class="lomo lomo-${ev.worst}" style="--ramo:${esc(s.color)}"
      aria-selected="${s.id === ui.subject}" data-nt-subject="${esc(s.id)}"><b>${esc(s.short)}</b><small>${ev.llevas === null ? '—' : R().fmt(ev.llevas, 1)}</small>${ev.worst === 'risk' || ev.worst === 'warn' ? `<i class="lomo-marca" aria-label="${STATUS_WORD[ev.worst]}"></i>` : ''}</button>`).join('')}</nav>`;
  }
  function frasco(c, config, today) {
    const g = R().known(c), lv = R().level(g), steps = g === null ? 0 : Math.max(1, Math.round((g - 1) / 6 * 8));
    const tier = num(c.weight) < 6 ? 1 : num(c.weight) < 15 ? 2 : num(c.weight) < 30 ? 3 : 4;
    const date = c.date || eventFor(c.id)?.date || '';
    const past = g === null && date && date < today;
    const est = c.estimate === undefined || c.estimate === '' ? NaN : num(c.estimate);
    const fresh = ui.fresh && ui.fresh.id === c.id;
    const label = g === null ? (past ? '¿cómo te fue?' : '?') : R().fmt(g, 2);
    return `<li class="frasco-wrap">
      <button type="button" class="frasco t${tier} lv-${lv}${past ? ' pasada' : ''}${fresh ? ' fresco' : ''}" style="--n:${steps}" data-nt-grade="${esc(c.id)}"
        aria-label="${esc(c.name)}, ${w1(c.weight)} %, ${g === null ? 'sin nota' : 'nota ' + R().fmt(g, 2)}. Tocar para ${g === null ? 'escribir' : 'cambiar'} la nota">
        <span class="liq"><i></i><i></i><i></i></span>
        <b class="fr-nota${g === null ? ' vacia' : ''}">${g === null ? (past ? '¿?' : '?') : R().fmt(g, 1)}</b>
        ${g === null && Number.isFinite(est) ? `<small class="fr-est">estimé ${R().fmt(est, 1)}</small>` : ''}
        ${fresh ? `<span class="chispas lv-${lv}" aria-hidden="true">${'<i></i>'.repeat(8)}</span>` : ''}
      </button>
      <span class="fr-tag"><span>${esc(c.name)}</span><small>${w1(c.weight)} %${date ? ` · ${esc(dateLabel(date))}` : ''}</small></span>
      ${fresh ? '<span class="pluma-ok" role="status">guardado</span>' : ''}
      ${c.autopsy ? '<span class="fr-auto" title="Ya contaste qué pasó">✎</span>' : ''}</li>`;
  }

  function need(group, simOut) {
    const g = group;
    if (g.status === 'falta-pesos') return `<p class="placa-texto">Faltan ponderaciones: esta parte suma ${w1(g.total)} %. Usa “Ajustar ramo”.</p>`;
    if (g.status === 'aprobada' || g.status === 'reprobada') return `<div class="placa ${g.status}"><span class="placa-eti">${g.status === 'aprobada' ? 'Quedó en' : 'Quedó en'}</span>${pixelText(R().fmt(g.grade, 1), 'grande')}</div>
      <p class="placa-texto">${g.status === 'aprobada' ? 'Parte aprobada.' : 'Parte reprobada: mira las reglas de abajo.'}</p>`;
    if (g.status === 'asegurada') return `<div class="placa aprobada"><span class="placa-eti">Ya aprobaste</span></div><p class="placa-texto">Aunque saques 1,0 en lo que queda (${w1(g.pendingWeight)} %), esta parte se aprueba.</p>`;
    if (g.status === 'imposible') {
      const best = (g.current * g.knownWeight + 7 * g.pendingWeight) / 100;
      return `<div class="placa reprobada"><span class="placa-eti">Con 7,0 llegas a</span>${pixelText(R().fmt(best, 1), 'grande')}</div>
        <p class="placa-texto">Ya no alcanza el 4,0 en esta parte, ni sacando 7,0 en lo que queda. Veamos qué reglas te quedan abajo.</p>`;
    }
    const goal = g.goal > 4 ? `para llegar a ${R().fmt(g.goal, 1)}` : 'para aprobar';
    return `<div class="placa ${g.status}"><span class="placa-eti">Necesitas</span>${pixelText(R().fmt(g.need, 1), 'grande')}</div>
      <p class="placa-texto">de promedio en lo que queda (${w1(g.pendingWeight)} % de ${esc(g.name.toLowerCase())}) ${goal}.${g.current !== null ? ` Hasta ahora llevas <b>${R().fmt(g.current, 2)}</b>.` : ''}</p>`;
  }

  function simulador(subject, config, g) {
    if (!g || g.pendingWeight <= .0001 || g.status === 'falta-pesos') return '';
    const key = `${subject.id}:${g.id}`, v = ui.sim[key] ?? Math.min(7, Math.max(1, g.need ?? 5));
    const out = simText(subject.id, config, g.id, v);
    return `<div class="simulador"><p class="sim-pregunta">¿Y si me saco…</p>
      <div class="palanca"><input type="range" min="1" max="7" step="0.1" value="${v}" data-nt-sim="${esc(g.id)}" aria-label="Nota que sacarías en lo que queda de ${esc(g.name)}">
        <output class="sim-valor" data-nt-simvalor>${R().fmt(v, 1)}</output></div>
      <p class="sim-out" data-nt-simout aria-live="polite">${out}</p></div>`;
  }
  function simText(sid, config, gid, v) {
    const r = R().simulate(sid, config, gid, v);
    const lines = [`En lo que queda sacas <b>${R().fmt(r.value, 1)}</b> → ${esc(r.group.name.toLowerCase())} queda en <b class="lv-${R().level(r.group.grade)}">${R().fmt(r.group.grade, 2)}</b>.`];
    if (r.final !== null) lines.push(`Nota final del ramo: <b>${R().fmt(r.final, 2)}</b>.`);
    r.chips.filter(c => c.tone !== 'info').slice(0, 2).forEach(c => lines.push(`<span class="chip chip-${c.tone}">${esc(c.text)}</span>`));
    return lines.join(' ');
  }

  function repisa(subject, config, ev, gid, today) {
    const g = ev.groups[gid]; if (!g) return '';
    const comps = g.comps.length ? g.comps : (config.components || []).filter(c => c.group === gid);
    return `<section class="repisa" aria-label="${esc(gname(config, gid))}">
      <header class="repisa-head"><h3>${gid === 'lab' ? '⚗' : '▤'} ${esc(gname(config, gid))}</h3>
        <small>${g.courseWeight !== null ? `${w1(g.courseWeight)} % del ramo` : ''}${g.minimum ? ` · mínimo ${R().fmt(g.minimum, 1)}` : ''}</small></header>
      <ul class="frascos">${comps.map(c => frasco(c, config, today)).join('') || '<li class="repisa-vacia">Sin evaluaciones: agrégalas en “Ajustar ramo”.</li>'}</ul>
      <div class="repisa-tabla"></div>
      <div class="repisa-info">${need(g)}</div>${simulador(subject, config, g)}</section>`;
  }

  function editor(subject, config) {
    return `<section class="ajuste" aria-label="Ajustar ramo">
      <p class="ajuste-ayuda">Cambia el porcentaje y la fecha de cada evaluación, agrega o borra. Cada parte debería sumar 100 %.</p>
      ${GROUPS.map(gid => {
        const rows = (config.components || []).filter(c => c.group === gid), total = rows.reduce((s, c) => s + (num(c.weight) || 0), 0);
        return `<fieldset class="ajuste-grupo"><legend>${esc(gname(config, gid))} <span class="${Math.abs(total - 100) < .01 ? 'ok' : 'warn'}">suma ${w1(total)} %</span></legend>
          ${rows.map(c => `<div class="ajuste-fila"><input aria-label="Nombre" maxlength="80" value="${esc(c.name)}" data-nt-edit="${esc(c.id)}" data-nt-field="name">
            <input aria-label="Porcentaje de ${esc(c.name)}" type="text" inputmode="decimal" value="${esc(c.weight === '' ? '' : Number(num(c.weight).toFixed(2)))}" data-nt-edit="${esc(c.id)}" data-nt-field="weight">
            <input aria-label="Fecha de ${esc(c.name)}" type="date" value="${esc(c.date || '')}" data-nt-edit="${esc(c.id)}" data-nt-field="date">
            <button type="button" class="pix-btn suave mini" data-nt-del="${esc(c.id)}" aria-label="Borrar ${esc(c.name)}">×</button></div>`).join('')}
          <button type="button" class="pix-btn suave" data-nt-add="${gid}">+ Agregar evaluación</button></fieldset>`;
      }).join('')}
      <button type="button" class="pix-btn" data-nt-edit-done>Terminar</button></section>`;
  }

  function dialogNota(config) {
    const d = ui.dialog; if (!d) return '';
    const c = config.components.find(x => x.id === d.id); if (!c) return '';
    const g = R().known(c), date = c.date || eventFor(c.id)?.date || '', past = date && date < bridge().today();
    return `<div class="nt-fondo" data-nt-cancel><form class="nt-dialog" role="dialog" aria-modal="true" aria-labelledby="ntTit" data-nt-nota-form>
      <h3 id="ntTit">${esc(c.name)} · ${w1(c.weight)} %</h3>
      ${past && g === null || d.mode === 'estimate' ? `<div class="nt-modo" role="tablist"><button type="button" role="tab" aria-selected="${d.mode !== 'estimate'}" data-nt-mode="real">Nota real</button>
        <button type="button" role="tab" aria-selected="${d.mode === 'estimate'}" data-nt-mode="estimate">¿Cómo te fue? (estimada)</button></div>` : ''}
      <p class="nt-ayuda">${d.mode === 'estimate' ? 'Tu estimación se guarda aparte. Cuando llegue la nota real, Nexo las compara: así aprendes a calibrarte.' : 'Escribe la nota (1,0 a 7,0). Con “55” entiendo 5,5.'}</p>
      <input class="nt-input" name="nota" type="text" inputmode="decimal" autocomplete="off" maxlength="4" value="${esc(d.value)}" aria-label="Nota" data-nt-input>
      <div class="nt-teclas" role="group" aria-label="Teclado">${['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫'].map(k => `<button type="button" class="pix-btn" data-nt-key="${k}">${k}</button>`).join('')}</div>
      <p class="nt-error" role="alert" hidden></p>
      <div class="nt-acciones"><button type="submit" class="pix-btn">Guardar</button><button type="button" class="pix-btn suave" data-nt-cancel-btn>Cancelar</button>
        ${d.mode !== 'estimate' && g !== null ? '<button type="button" class="pix-btn suave" data-nt-clear>Borrar nota</button>' : ''}</div></form></div>`;
  }

  function dialogAutopsia(config) {
    const a = ui.autopsy; if (!a) return '';
    const c = config.components.find(x => x.id === a.id); if (!c) return '';
    const o = c.autopsy || {};
    const opt = (list, cur) => list.map(([v, t]) => `<option value="${v}"${cur === v ? ' selected' : ''}>${t}</option>`).join('');
    return `<div class="nt-fondo" data-nt-autopsy-cancel><form class="nt-dialog" role="dialog" aria-modal="true" aria-labelledby="ntAu" data-nt-autopsy-form>
      <h3 id="ntAu">¿Qué pasó en ${esc(c.name)}?</h3>
      <p class="nt-ayuda">Tres preguntas rápidas, sin culpa: sirven para elegir qué practicar. Puedes saltarlas.</p>
      <label>¿Qué tipo de pregunta te costó? <input name="tipo" maxlength="120" value="${esc(o.tipo || '')}" placeholder="Ej.: basicidad de aminas, gráficos…"></label>
      <label>¿Fue un error de… <select name="causa"><option value="">elige</option>${opt([['concepto', 'concepto (no lo entendía)'], ['calculo', 'cálculo o desarrollo'], ['tiempo', 'tiempo'], ['nervios', 'nervios o lectura'], ['estudio', 'no alcancé a estudiar eso']], o.causa)}</select></label>
      <label>¿Qué harías distinto la próxima vez? <input name="distinto" maxlength="160" value="${esc(o.distinto || '')}" placeholder="Ej.: ensayo cronometrado antes"></label>
      <div class="nt-acciones"><button type="submit" class="pix-btn">Guardar</button><button type="button" class="pix-btn suave" data-nt-autopsy-cancel-btn>Saltar</button></div></form></div>`;
  }

  // ——— Inasistencias ———
  function asistencia(subject) {
    const att = R().attendance(bridge().state.absences, subject.id, maxes());
    const rows = (bridge().state.absences || []).filter(a => a.subject === subject.id).sort((a, b) => b.date.localeCompare(a.date));
    const MSG = {
      'sin-maximo': a => `Faltas: ${a.count}. Pon el máximo que permite el ramo para ver cuántas te quedan.`,
      estricto: () => 'Laboratorio con 100 % de asistencia: no se puede faltar (una falta se recupera con justificación).',
      'estricto-falta': a => `Faltaste ${a.count} ${a.count === 1 ? 'vez' : 'veces'} al laboratorio: avisa al profe y recupera con justificación.`,
      ok: a => `Te quedan ${a.left} ${a.left === 1 ? 'falta' : 'faltas'}.`,
      'queda-1': () => 'Te queda 1 falta: cuídala.',
      limite: () => 'Estás en el límite: no puedes faltar más.',
      pasado: a => `Pasaste el máximo por ${-a.left}.`
    };
    const tone = { 'queda-1': 'warn', limite: 'risk', pasado: 'risk', 'estricto-falta': 'risk', ok: 'ok' };
    return `<article class="pergamino asistencia" style="--ramo:${esc(subject.color)}" aria-labelledby="asisTit">
      <header class="pergamino-head"><p class="eyebrow">LIBRO DE ASISTENCIA</p><h2 id="asisTit">Inasistencias · ${esc(subject.name)}</h2></header>
      <div class="asis-partes">${GROUPS.map(gid => {
        const a = att[gid], cells = a.max !== null ? Math.min(a.max, 24) : 0;
        return `<div class="asis-parte asis-${a.state}"><div class="asis-top"><b>${gid === 'lab' ? 'Laboratorio' : 'Teoría'}</b>
          <label class="asis-max">Máximo de faltas <input type="number" min="0" max="40" inputmode="numeric" data-nt-max="${gid}" value="${a.max === null ? '' : a.max}" placeholder="${a.strict ? '0' : '—'}"></label></div>
          ${a.max !== null ? `<div class="asis-barra" role="img" aria-label="${a.count} de ${a.max} faltas">${Array.from({ length: cells }, (_, i) => `<i class="${i < a.count ? 'cae' : ''}${a.count > a.max ? ' roja' : ''}"></i>`).join('')}</div>` : ''}
          <p class="asis-msg ${tone[a.state] ? 'chip chip-' + tone[a.state] : ''}">${MSG[a.state](a)}</p></div>`;
      }).join('')}</div>
      <form class="asis-form" data-nt-abs-form><label>Fecha <input type="date" name="date" value="${esc(bridge().today())}" required></label>
        <label>Clase <select name="group"><option value="theory">Teoría</option><option value="lab">Laboratorio</option></select></label>
        <button type="submit" class="pix-btn">+ Anotar falta</button></form>
      ${rows.length ? `<ul class="asis-lista">${rows.map(a => `<li><time datetime="${esc(a.date)}">${esc(dateLabel(a.date))}</time><span>${a.group === 'lab' ? 'Laboratorio' : 'Teoría'}</span>
        <button type="button" class="pix-btn suave mini" data-nt-abs-del="${esc(a.id)}" aria-label="Borrar la falta del ${esc(dateLabel(a.date))}">×</button></li>`).join('')}</ul>` : '<p class="pergamino-vacio">Sin faltas anotadas.</p>'}
    </article>`;
  }

  // ——— Pantalla ———
  function panel(S, b) {
    ctx = ctx ? { ...ctx, bridge: b } : { bridge: b };
    const subject = current(), config = cfg(subject.id), evs = evalAll();
    const ev = evs.find(x => x.s.id === subject.id).ev, ov = R().overall(evs.map(x => x.ev));
    const cal = R().calibration(bridge().subjects.map(s => cfg(s.id)));
    const today = bridge().today();
    return `<article class="pergamino notas" style="--ramo:${esc(subject.color)}" aria-labelledby="notasTit">
      <header class="pergamino-head"><div><p class="eyebrow">BALANZA Y LIBRO</p><h2 id="notasTit">Notas</h2></div>
        <div class="promedio" title="Promedio simple: todos los ramos valen igual"><small>Promedio general</small>
          <b>${ov.final !== null ? R().fmt(ov.final, 2) : ov.llevas !== null ? R().fmt(ov.llevas, 2) : '—'}</b><small>${ov.final !== null ? 'final del semestre' : ov.llevas !== null ? `llevas · ${ov.ramos} ${ov.ramos === 1 ? 'ramo' : 'ramos'}` : 'sin notas aún'}</small></div></header>
      ${lomos(evs)}
      <div class="ramo-cabecera"><h3>${esc(subject.name)}</h3>
        <p>${ev.final !== null ? `Nota final: <b>${R().fmt(ev.final, 2)}</b>` : ev.llevas !== null ? `Llevas <b>${R().fmt(ev.llevas, 2)}</b> con lo evaluado` : 'Aún sin notas'}</p>
        <button type="button" class="pix-btn suave" data-nt-edit-toggle aria-pressed="${ui.edit}">${ui.edit ? 'Volver a los frascos' : 'Ajustar ramo'}</button></div>
      ${ev.chips.length ? `<ul class="riesgos" aria-label="Reglas del ramo según tus notas">${ev.chips.map(c => `<li class="chip chip-${c.tone}">${esc(c.text)}</li>`).join('')}</ul>` : ''}
      ${ui.edit ? editor(subject, config) : GROUPS.map(g => repisa(subject, config, ev, g, today)).join('')}
      ${cal.pairs.length ? `<p class="calibra">Calibración: en ${cal.pairs.length} ${cal.pairs.length === 1 ? 'evaluación' : 'evaluaciones'} tu estimación fue ${Math.abs(cal.mean) < .05 ? 'justa' : `${R().fmt(Math.abs(cal.mean), 1)} ${cal.mean > 0 ? 'más alta' : 'más baja'} que la real, en promedio`}.</p>` : ''}
      ${(config.rules || []).length ? `<details class="reglas"><summary>Reglas del ramo (del programa)</summary><ul>${config.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ul>${config.source ? `<p class="fuente">Fuente: ${esc(config.source)}</p>` : ''}</details>` : ''}
      ${dialogNota(config)}${dialogAutopsia(config)}
    </article>${asistencia(subject)}`;
  }

  // ——— Acciones ———
  function parseTyped(raw) {
    let t = String(raw || '').trim().replace('.', ',');
    if (/^\d{2}$/.test(t)) t = `${t[0]},${t[1]}`;
    else if (/^\d{3}$/.test(t)) t = `${t[0]},${t.slice(1)}`;
    const n = Number(t.replace(',', '.'));
    return Number.isFinite(n) && n >= 1 && n <= 7 && /^\d(,\d{1,2})?$/.test(t) ? n : null;
  }
  const refresh = (focus) => { ctx.refresh(); if (focus) setTimeout(() => document.querySelector(focus)?.focus(), 30); };
  const keep = () => bridge().save();

  function saveGrade(id, n, mode) {
    const config = cfg(ui.subject), row = config.components.find(c => c.id === id); if (!row) return;
    if (mode === 'estimate') {
      const prev = row.estimate; row.estimate = n.toFixed(2); keep(); ui.dialog = null; refresh();
      bridge().toast(`Estimaste ${R().fmt(n, 1)} para ${row.name}. Cuando llegue la nota real, las comparo.`, 'Deshacer', () => { row.estimate = prev ?? ''; keep(); refresh(); });
      ctx.react('idea', 'Anotado. Cuando llegue la nota real vemos qué tan cerca estabas.');
      return;
    }
    const prev = { grade: row.grade, gradedOn: row.gradedOn }, ev = eventFor(id), prevStatus = ev?.status;
    row.grade = n.toFixed(2); row.gradedOn = bridge().today();
    if (ev) ev.status = 'done';
    keep();
    ctx.sound?.('pluma');
    const lv = R().level(n), est = row.estimate === undefined || row.estimate === '' ? NaN : num(row.estimate);
    ui.dialog = null; ui.fresh = { id, level: lv };
    if (lv === 'rojo') ui.autopsy = { id };
    refresh();
    setTimeout(() => { if (ui.fresh?.id === id) { ui.fresh = null; } }, 3500);
    const cmp = Number.isFinite(est) ? ` Estimabas ${R().fmt(est, 1)}: ${est > n + .04 ? `${R().fmt(est - n, 1)} menos de lo esperado` : est < n - .04 ? `${R().fmt(n - est, 1)} más de lo esperado` : 'justo lo que esperabas'}.` : '';
    bridge().toast(`Guardado: ${row.name} ${R().fmt(n, 1)}.${cmp}`, 'Deshacer', () => {
      row.grade = prev.grade; row.gradedOn = prev.gradedOn; if (ev) ev.status = prevStatus || 'planned'; ui.fresh = null; ui.autopsy = null; keep(); refresh();
    });
    ctx.react(lv === 'verde' ? (n >= 6 ? 'deslumbrada' : 'baile') : lv === 'ambar' ? 'saludo' : 'idea',
      lv === 'verde' ? '¡Buena nota! Mira cuánto te queda por asegurar.' : lv === 'ambar' ? 'Anotada. Veamos cuánto necesitas en lo que queda.' : 'Una nota no te define. ¿Vemos qué falló?');
  }

  /* La autopsia de una nota baja entra al cuaderno de errores del ramo: sube su prioridad en el plan de Hoy ("errores abiertos"). */
  const BLOCKER = { concepto: 'concept', calculo: 'formula', tiempo: 'attention', nervios: 'attention', estudio: 'first_step' };
  function autopsyToError(row) {
    const a = row.autopsy, list = bridge().state.errors; if (!list || !a.tipo && !a.causa) return;
    const text = a.tipo || `Nota baja en ${row.name}`;
    let err = row.autopsy.errorId && list.find(x => x.id === row.autopsy.errorId);
    const body = { subject: ui.subject, blocker: BLOCKER[a.causa] || 'concept', observable: `${row.name}: ${text}`, reasoning: a.distinto || '',
      diagnosis: a.distinto ? `Plan propio: ${a.distinto}` : 'Revisar el primer eslabón del razonamiento.', status: 'open', source: 'autopsia' };
    if (err) Object.assign(err, body);
    else { err = { id: bridge().uid('error'), date: bridge().today(), dueAt: bridge().today(), ...body }; list.unshift(err); row.autopsy.errorId = err.id; }
  }

  function click(e) {
    const t = e.target.closest('button, [data-nt-cancel], [data-nt-autopsy-cancel]'); if (!t) return;
    const d = t.dataset;
    if (d.ntSubject) { ui.subject = d.ntSubject; org().notasSubject = ui.subject; keep(); ui.edit = false; return refresh(); }
    if (d.ntEditToggle !== undefined) { ui.edit = !ui.edit; return refresh(); }
    if (d.ntEditDone !== undefined) { ui.edit = false; return refresh(); }
    if (d.ntGrade) {
      const row = cfg(ui.subject).components.find(c => c.id === d.ntGrade); if (!row) return;
      const g = R().known(row);
      ui.dialog = { id: d.ntGrade, mode: 'real', value: g === null ? '' : R().fmt(g, 2).replace(/,?0$/, '') };
      return refresh('[data-nt-input]');
    }
    if (d.ntCancel !== undefined || d.ntCancelBtn !== undefined) { if (e.target.closest('.nt-dialog') && d.ntCancelBtn === undefined) return; ui.dialog = null; return refresh(); }
    if (d.ntMode) { ui.dialog.mode = d.ntMode; const row = cfg(ui.subject).components.find(c => c.id === ui.dialog.id); ui.dialog.value = d.ntMode === 'estimate' && row?.estimate ? R().fmt(num(row.estimate), 1) : ''; return refresh('[data-nt-input]'); }
    if (d.ntKey) {
      const inp = document.querySelector('[data-nt-input]'); if (!inp) return;
      if (d.ntKey === '⌫') inp.value = inp.value.slice(0, -1); else if (inp.value.length < 4 && !(d.ntKey === ',' && inp.value.includes(','))) inp.value += d.ntKey;
      ui.dialog.value = inp.value; inp.focus(); return;
    }
    if (d.ntClear !== undefined) {
      const row = cfg(ui.subject).components.find(c => c.id === ui.dialog.id), prev = { grade: row.grade, gradedOn: row.gradedOn }, ev = eventFor(row.id), ps = ev?.status;
      row.grade = ''; row.gradedOn = ''; if (ev && ev.status === 'done') ev.status = 'planned'; keep(); ui.dialog = null; refresh();
      return bridge().toast(`Nota de ${row.name} borrada.`, 'Deshacer', () => { row.grade = prev.grade; row.gradedOn = prev.gradedOn; if (ev) ev.status = ps || 'planned'; keep(); refresh(); });
    }
    if (d.ntAutopsy) { ui.autopsy = { id: d.ntAutopsy }; return refresh(); }
    if (d.ntAutopsyCancel !== undefined || d.ntAutopsyCancelBtn !== undefined) { if (e.target.closest('.nt-dialog') && d.ntAutopsyCancelBtn === undefined) return; ui.autopsy = null; return refresh(); }
    if (d.ntAdd) {
      const c = cfg(ui.subject); c.components.push({ id: bridge().uid('grade'), name: 'Nueva evaluación', group: d.ntAdd, weight: '', grade: '', date: '' });
      keep(); return refresh();
    }
    if (d.ntDel) {
      const rows = cfg(ui.subject).components, i = rows.findIndex(c => c.id === d.ntDel); if (i < 0) return;
      const [row] = rows.splice(i, 1), linked = (bridge().state.events || []).filter(x => x.sourceId === row.id);
      bridge().state.events = bridge().state.events.filter(x => x.sourceId !== row.id); keep(); refresh();
      return bridge().toast('Evaluación eliminada.', 'Deshacer', () => { rows.splice(i, 0, row); bridge().state.events.push(...linked); keep(); refresh(); });
    }
    if (d.ntAbsDel) {
      const list = bridge().state.absences, i = list.findIndex(a => a.id === d.ntAbsDel); if (i < 0) return;
      const [a] = list.splice(i, 1); keep(); refresh();
      return bridge().toast('Falta borrada.', 'Deshacer', () => { list.splice(Math.min(i, list.length), 0, a); keep(); refresh(); });
    }
  }

  function submit(e) {
    const f = e.target; e.preventDefault();
    if (f.matches('[data-nt-nota-form]')) {
      const n = parseTyped(f.elements.nota.value), err = f.querySelector('.nt-error');
      if (n === null) { err.textContent = 'Escribe una nota entre 1,0 y 7,0 (por ejemplo 5,5).'; err.hidden = false; return; }
      return saveGrade(ui.dialog.id, n, ui.dialog.mode);
    }
    if (f.matches('[data-nt-autopsy-form]')) {
      const row = cfg(ui.subject).components.find(c => c.id === ui.autopsy.id), fd = new FormData(f);
      if (row) { row.autopsy = { tipo: String(fd.get('tipo') || '').trim(), causa: String(fd.get('causa') || ''), distinto: String(fd.get('distinto') || '').trim() }; autopsyToError(row); keep(); }
      ui.autopsy = null; ctx.sound?.('pluma'); refresh(); bridge().toast('Anotado. Con esto elegimos qué practicar.');
      return ctx.react('idea', 'Gracias por contarlo: eso me ayuda a proponerte mejores bloques.');
    }
    if (f.matches('[data-nt-abs-form]')) {
      const fd = new FormData(f), date = String(fd.get('date') || '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
      bridge().state.absences.push({ id: bridge().uid('absence'), subject: ui.subject, group: fd.get('group') === 'lab' ? 'lab' : 'theory', date });
      keep(); refresh();
      const a = R().attendance(bridge().state.absences, ui.subject, maxes())[fd.get('group') === 'lab' ? 'lab' : 'theory'];
      ctx.sound?.('sello'); bridge().toast('Falta anotada.');
      if (a.state === 'queda-1') ctx.react('nerviosa', 'Ojo: te queda 1 falta en esta parte.');
      else if (a.state === 'limite' || a.state === 'pasado') ctx.react('nerviosa', 'Llegaste al límite de faltas. Hablemos con el profe si hace falta.');
    }
  }

  function input(e) {
    const t = e.target;
    if (t.dataset.ntSim) {
      const subject = current(), config = cfg(subject.id), v = Number(t.value);
      ui.sim[`${subject.id}:${t.dataset.ntSim}`] = v;
      const box = t.closest('.simulador');
      box.querySelector('[data-nt-simvalor]').textContent = R().fmt(v, 1);
      box.querySelector('[data-nt-simout]').innerHTML = simText(subject.id, config, t.dataset.ntSim, v);
    }
    if (t.dataset.ntInput !== undefined && ui.dialog) { ui.dialog.value = t.value; t.closest('form').querySelector('.nt-error').hidden = true; }
  }

  function change(e) {
    const t = e.target;
    if (t.dataset.ntEdit) {
      const config = cfg(ui.subject), row = config.components.find(c => c.id === t.dataset.ntEdit); if (!row) return;
      const f = t.dataset.ntField;
      if (f === 'name') row.name = t.value.trim() || 'Nueva evaluación';
      else if (f === 'weight') { const n = num(t.value); row.weight = t.value.trim() === '' || !Number.isFinite(n) ? '' : Math.max(0, Math.min(100, n)); }
      else if (f === 'date') row.date = /^\d{4}-\d{2}-\d{2}$/.test(t.value) ? t.value : '';
      bridge().syncGrade(row, ui.subject); keep(); refresh();
    }
    if (t.dataset.ntMax) {
      const m = maxes(); m[ui.subject] = m[ui.subject] || {};
      m[ui.subject][t.dataset.ntMax] = t.value === '' ? '' : Math.max(0, Math.min(40, Math.floor(Number(t.value) || 0)));
      keep(); refresh();
    }
  }

  function keydown(e) {
    if (e.key === 'Escape' && (ui.dialog || ui.autopsy)) { ui.dialog = null; ui.autopsy = null; refresh(); }
  }

  function wire(root, c) {
    ctx = { ...ctx, ...c };
    root.onclick = click; root.onsubmit = submit; root.oninput = input; root.onchange = change; root.onkeydown = keydown;
  }

  window.NexoNotas = Object.freeze({ panel, wire, pixelText, parseTyped });
})();
