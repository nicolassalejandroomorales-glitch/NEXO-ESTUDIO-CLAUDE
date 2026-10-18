/* Pantalla del motor de estudio (#/study): una actividad a la vez, ayuda registrada, repaso FSRS. */
(() => {
  'use strict';
  const E = () => window.NexoStudyEngine;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MODES = {
    today: { label: 'Estudiar hoy', hint: 'Repasos que vencen y, si no hay, lo que más falta.' },
    diagnostic: { label: 'Diagnóstico', hint: 'Una pregunta por habilidad. Sin castigo.' }
  };
  const STYLE = '.study-page{max-width:760px}.study-option{display:flex;gap:10px;align-items:center;padding:8px 10px;border:1px solid rgba(255,255,255,.14);border-radius:10px;margin:6px 0;cursor:pointer}.study-option input{width:18px;height:18px;flex:none}.study-field{border:0;padding:0;margin:14px 0}.study-actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.study-help{padding:10px 12px;border-left:3px solid #9bd3a0;background:rgba(155,211,160,.08);margin:10px 0}.study-diagram{font-size:1.1rem}.study-skills{list-style:none;padding:0}.study-skill{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.1)}.study-skill div{display:grid}.study-skill span,.study-note,.study-why{opacity:.75}';
  let api = null, host = null;

  const get = () => api.getState().studyEngine || (api.getState().studyEngine = E().createState());
  function save(next) { api.getState().studyEngine = next; api.saveState(); render(); }
  function run(fn) {
    try { save(fn(get())); } catch (error) { api.showToast?.(error.message); }
  }

  // Cada intento también entra al motor académico (mapa, repasos por concepto). Si falla, el estudio sigue.
  function share(state) {
    const session = state.session, attempt = state.attempts.at(-1);
    if (!attempt || !window.NexoAcademicEngine) return;
    window.NexoAcademicEngine.recordAttempt(api, {
      id: attempt.id, exerciseId: `org-01:study-${attempt.itemId}`, outcome: attempt.correct ? 'correct' : 'incorrect',
      assistanceUsed: attempt.assistance.length > 0, confidence: attempt.confidence || null, reasoningText: attempt.note,
      at: attempt.at, review: session?.mode === 'reviews', activityType: 'study', activityId: attempt.sessionId
    }).catch(() => {});
  }

  function home(state) {
    const engine = E(), info = engine.reviewInfo(state);
    const skills = engine.bank.skills.map(skill => {
      const ev = engine.skillEvidence(state, skill.id);
      return `<li class="study-skill study-${ev.tone}"><div><strong>${esc(skill.title)}</strong><span>${esc(skill.short)}</span></div>
        <em>${esc(ev.status)}</em><button class="secondary-btn" data-study-focus="${esc(skill.id)}">Practicar</button></li>`;
    }).join('');
    const done = state.sessions.slice(-3).reverse().map(s =>
      `<li>${new Date(s.completedAt).toLocaleDateString('es-CL')} · ${s.independent}/${s.attempted} sin ayuda</li>`).join('');
    return `<h1>Motor de estudio · Aminas</h1>
      <p class="study-note">Completar una sesión no es dominio: solo cuentan los aciertos sin ayuda, en variantes distintas y tras un día.</p>
      <div class="study-actions"><button class="primary-btn" data-study-start="today">${MODES.today.label}${info.due ? ` (${info.due} repaso${info.due > 1 ? 's' : ''})` : ''}</button>
      <button class="secondary-btn" data-study-start="diagnostic">${MODES.diagnostic.label}</button></div>
      <p>${info.due ? `${info.due} repaso(s) vencidos.` : info.next ? `Próximo repaso: ${new Date(info.next).toLocaleString('es-CL')}.` : 'Aún no hay repasos programados.'}</p>
      <ul class="study-skills">${skills}</ul>${done ? `<h2>Últimas sesiones</h2><ul>${done}</ul>` : ''}`;
  }

  function activity(state) {
    const engine = E(), session = state.session, cur = session.current, item = engine.byId[cur.itemId];
    const skill = engine.skillById[item.skill], n = state.attempts.filter(a => a.sessionId === session.id).length + (cur.submitted ? 0 : 1);
    const attempt = cur.submitted ? state.attempts.find(a => a.id === cur.attemptId) : null;
    const locked = cur.submitted;
    const fields = item.fields.map(field => `<fieldset class="study-field"><legend>${esc(field.label)}</legend>
      ${field.options.map(o => `<label class="study-option"><input type="radio" name="${esc(field.key)}" value="${esc(o.id)}"
        ${cur.draft.answers[field.key] === o.id ? 'checked' : ''} ${locked ? 'disabled' : ''}><span>${esc(o.label)}</span></label>`).join('')}</fieldset>`).join('');
    const help = cur.assistance.includes('lesson') ? `<div class="study-help"><b>Repaso:</b> ${esc(skill.lesson)}<ol>${skill.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>`
      : '';
    const hint = cur.assistance.includes('hint') ? `<div class="study-help"><b>Pista:</b> ${esc(item.hint)}</div>` : '';
    const feedback = attempt ? `<div class="structured-feedback ${attempt.correct ? 'correct' : 'incorrect'}" role="status">
      <strong>${attempt.correct ? (attempt.assistance.length ? 'Correcto, con ayuda' : 'Correcto') : 'Hay algo por revisar'}</strong>
      ${engine.grade(item, attempt.answers).criteria.map(c => `<p>${c.correct ? '✔' : '✘'} ${esc(c.label)}: ${esc(c.chosen)}${c.correct ? '' : ` → <b>${esc(c.expected)}</b>`}</p>`).join('')}
      <p>${esc(item.explanation)}</p>${attempt.assistance.length ? '<p><small>Usaste ayuda: este acierto no cuenta como independiente.</small></p>' : ''}</div>` : '';
    const last = n >= session.target;
    return `<p class="eyebrow">${esc(skill.title)} · ${n} de ${session.target}</p><h1>${esc(item.title)}</h1>
      <p class="study-why">${esc(cur.why)}</p><p>${esc(item.prompt)}</p>
      ${item.diagram?.length ? `<pre class="study-diagram" aria-label="Esquema">${item.diagram.map(esc).join('\n')}</pre>` : ''}
      <form data-study-form>${fields}
        <label class="field"><span>Tu razonamiento (opcional, no se califica solo)</span>
          <textarea name="note" rows="2" ${locked ? 'disabled' : ''}>${esc(cur.draft.note)}</textarea></label>${hint}${help}
        ${locked ? '' : `<div class="study-actions"><button type="submit" class="primary-btn">Comprobar</button>
          <button type="button" class="secondary-btn" data-study-help="hint">Pista</button>
          <button type="button" class="secondary-btn" data-study-help="lesson">Repasar la idea</button></div>`}</form>
      ${feedback}${locked ? `<div class="study-actions"><button class="primary-btn" data-study-next>${last ? 'Terminar' : 'Siguiente'}</button></div>` : ''}
      <button class="back-btn" data-study-stop>Salir de la sesión</button>`;
  }

  function summary(state) {
    const s = state.sessions.at(-1);
    const rows = state.attempts.filter(a => a.sessionId === state.session.id);
    const firstErrors = rows.filter(a => !a.correct).map(a => E().skillById[a.skill].title);
    return `<h1>Sesión terminada</h1><p>${s?.attempted || 0} actividades · ${s?.independent || 0} sin ayuda.</p>
      ${firstErrors.length ? `<p>Para volver a mirar: <b>${[...new Set(firstErrors)].map(esc).join(', ')}</b>. Aparecerán primero en la próxima sesión.</p>` : '<p>Sin errores esta vez. Los repasos quedaron programados.</p>'}
      <div class="study-actions"><button class="primary-btn" data-study-close>Volver</button></div>`;
  }

  function render() {
    if (!host) return;
    const state = get(), session = state.session;
    const body = !session ? home(state) : session.status === 'complete' ? summary(state) : session.current ? activity(state) : home(state);
    host.innerHTML = `<section class="page study-page"><button class="back-btn" data-route="home">← Inicio</button>${body}</section>`;
  }

  function readForm(form) {
    const data = new FormData(form), answers = {};
    for (const [key, value] of data.entries()) if (key !== 'note') answers[key] = value;
    return { answers, note: data.get('note') || '' };
  }

  function bind() {
    host.onchange = event => {
      const form = event.target.closest('[data-study-form]');
      if (form) run(state => E().setDraft(state, readForm(form)));
    };
    host.onsubmit = event => {
      const form = event.target.closest('[data-study-form]');
      if (!form) return;
      event.preventDefault();
      run(state => { const next = E().submit(E().setDraft(state, readForm(form))); share(next); return next; });
    };
    host.onclick = event => {
      const button = event.target.closest('button');
      if (!button) return;
      const form = host.querySelector('[data-study-form]');
      const d = button.dataset;
      if (d.studyStart) return run(state => {
        const m = d.studyStart === 'diagnostic' ? 'diagnostic' : E().reviewInfo(state).due ? 'reviews' : 'practice';
        return E().start(state, m, m === 'reviews' ? Math.min(8, E().reviewInfo(state).due) : 8);
      });
      if (d.studyFocus) return run(state => E().start(state, 'practice', 6, new Date(), d.studyFocus));
      if (d.studyHelp) return run(state => E().help(form ? E().setDraft(state, readForm(form)) : state, d.studyHelp));
      if (d.studyNext !== undefined) return run(state => E().next(state));
      if (d.studyStop !== undefined) return run(state => E().stop(state));
      if (d.studyClose !== undefined) { const state = get(); state.session = null; api.saveState(); render(); }
    };
  }

  window.NexoStudyUI = {
    render(target, context) {
      api = context; host = document.createElement('div');
      if (!document.getElementById('study-style')) document.head.append(Object.assign(document.createElement('style'), { id: 'study-style', textContent: STYLE }));
      target.replaceChildren(host); bind(); render();
    }
  };
})();
