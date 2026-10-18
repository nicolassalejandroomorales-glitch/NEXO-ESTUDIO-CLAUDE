/* Pantalla del motor de estudio (#/study): una actividad a la vez, ayuda registrada, repaso FSRS.
   Usa el kit pixel de la torre (pixel-ui.css): marco de madera, pergamino, botones de latón y barras de cristal. */
(() => {
  'use strict';
  const E = () => window.NexoStudyEngine;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // Letras pixel solo para lo corto (la fuente propia no trae subíndices ni minúsculas).
  const pt = text => (window.NexoPixelText ? window.NexoPixelText.render(text, { shadow: false }) : esc(text));
  const btn = (label, attrs = '') => `<button class="pu-btn" ${attrs}>${pt(label)}</button>`;
  const STAGE = { empty: 0, practice: 25, assisted: 25, independent: 60, retained: 100 };
  const STYLE = `
.study-page{max-width:820px;min-width:0;width:100%;box-sizing:border-box;margin:0 auto;padding:12px 8px 40px}
.study-page>.pu-panel,.study-sheet{min-width:0;max-width:100%;overflow-wrap:anywhere}
.study-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:2px 4px 12px}
.study-head .pixel-text{height:22px;width:auto;fill:var(--pu-brass)}
.study-sheet{padding:14px 16px 18px;font-family:Georgia,'Palatino Linotype',serif;font-size:1.05rem;line-height:1.5}
.study-sheet h1,.study-sheet h2{font-family:inherit;color:#34271c;margin:.3em 0 .4em;font-size:1.6rem}
.study-sheet h2{font-size:1.2rem}
.study-sheet .pixel-text{fill:#3a2c1d;height:14px;width:auto}
.study-sheet .pu-btn .pixel-text{height:12px}
.study-kicker{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px}
.study-why{font-style:italic;color:#6b5238;margin:.2em 0 .8em}
.study-diagram{margin:10px 0;padding:10px 14px;background:#2a1a0a;color:#fbe08a;border:3px solid #6a4a28;box-shadow:3px 3px 0 #0006;font:1.15rem/1.5 ui-monospace,Consolas,monospace;overflow:auto}
.study-field{border:0;padding:0;margin:14px 0 0}
.study-field legend{font-weight:700;color:#34271c;margin-bottom:6px}
.study-option{position:relative;display:flex;gap:12px;align-items:center;margin:8px 0;padding:10px 12px;cursor:pointer;background:#f6e8c4;border:2px solid #8a6a40;box-shadow:3px 3px 0 #6a4a28;transition:transform .08s,box-shadow .08s,background .12s}
.study-option:hover{background:#fff3cf;transform:translate(-1px,-1px);box-shadow:4px 4px 0 #6a4a28}
.study-option input{position:absolute;opacity:0;pointer-events:none}
.study-option i{flex:none;width:16px;height:16px;background:#e0cc98;border:2px solid #6a4a28;box-shadow:inset 2px 2px 0 #b99a62}
.study-option input:checked+i{background:#fbe08a;box-shadow:inset 0 0 0 3px #8a5a14}
.study-option:has(input:checked){background:#ffeab0;border-color:#8a5a14;transform:translate(2px,2px);box-shadow:1px 1px 0 #6a4a28}
.study-option:has(input:focus-visible){outline:2px dashed #8a5a14;outline-offset:2px}
.study-option:has(input:disabled){cursor:default}
.study-note-field{display:grid;gap:4px;margin-top:14px;color:#6b5238;font-size:.9rem}
.study-note-field textarea{font:inherit;background:#fbf1d4;color:#3a2c1d;border:2px solid #8a6a40;padding:8px;resize:vertical}
.study-actions{display:flex;gap:12px;flex-wrap:wrap;margin:18px 0 6px;align-items:center}
.study-help{position:relative;margin:12px 0;padding:10px 14px 10px 20px;background:#e4efc9;border:2px solid #6c8a4a;box-shadow:3px 3px 0 #4a6a30;color:#2f4220}
.study-help::before{content:'';position:absolute;left:0;top:0;bottom:0;width:6px;background:#6c8a4a}
.study-feedback{margin:14px 0 4px;padding:10px 14px;border:2px solid;box-shadow:3px 3px 0 #0003}
.study-feedback.correct{background:#e4efc9;border-color:#6c8a4a;color:#2f4220}
.study-feedback.incorrect{background:#f4d9c4;border-color:#a8583a;color:#5a2a18}
.study-feedback strong{display:block;font-size:1.15rem;margin-bottom:4px}
.study-skills{list-style:none;padding:0;margin:12px 0;display:grid;gap:10px}
.study-skill{display:grid;grid-template-columns:1fr auto;gap:6px 12px;align-items:center;padding:10px 12px;background:#f6e8c4;border:2px solid #8a6a40;box-shadow:3px 3px 0 #6a4a28}
.study-skill strong{display:block;color:#34271c}
.study-skill span{color:#6b5238;font-size:.9rem}
.study-skill .pu-bar{grid-column:1/-1}
.study-note{color:#6b5238;font-style:italic}
@media (max-width:520px){.study-sheet{padding:10px 8px 14px;font-size:1rem}.study-skill{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.study-option{transition:none}}`;
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

  const bar = (pct, label) => `<div class="pu-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="${esc(label)}"><i style="width:${pct}%"></i></div>`;

  function home(state) {
    const engine = E(), info = engine.reviewInfo(state);
    const skills = engine.bank.skills.map(skill => {
      const ev = engine.skillEvidence(state, skill.id);
      return `<li class="study-skill"><div><strong>${esc(skill.title)}</strong><span>${esc(skill.short)} · ${esc(ev.status)}</span></div>
        ${btn('Practicar', `data-study-focus="${esc(skill.id)}"`)}${bar(STAGE[ev.tone] ?? 0, `${skill.title}: ${ev.status}`)}</li>`;
    }).join('');
    const done = state.sessions.slice(-3).reverse().map(s =>
      `<li>${new Date(s.completedAt).toLocaleDateString('es-CL')} · ${s.independent} de ${s.attempted} sin ayuda</li>`).join('');
    const reviews = info.due ? `${info.due} repaso(s) vencido(s): irán primero.`
      : info.next ? `Próximo repaso: ${new Date(info.next).toLocaleString('es-CL')}.` : 'Aún no hay repasos programados.';
    return `<h1>Estudiar hoy · Aminas</h1>
      <p class="study-note">Terminar una sesión no es dominar: solo cuentan los aciertos sin ayuda, en variantes distintas y tras un día.</p>
      <div class="study-actions">${btn('Estudiar hoy', 'data-study-start="today"')}${btn('Diagnóstico', 'data-study-start="diagnostic"')}</div>
      <p>${reviews}</p><ul class="study-skills">${skills}</ul>${done ? `<h2>Últimas sesiones</h2><ul>${done}</ul>` : ''}`;
  }

  function activity(state) {
    const engine = E(), session = state.session, cur = session.current, item = engine.byId[cur.itemId];
    const skill = engine.skillById[item.skill], locked = cur.submitted;
    const answered = state.attempts.filter(a => a.sessionId === session.id).length;
    const n = answered + (locked ? 0 : 1), pct = Math.round(100 * answered / session.target);
    const attempt = locked ? state.attempts.find(a => a.id === cur.attemptId) : null;
    const fields = item.fields.map(field => `<fieldset class="study-field"><legend>${esc(field.label)}</legend>
      ${field.options.map(o => `<label class="study-option"><input type="radio" name="${esc(field.key)}" value="${esc(o.id)}"
        ${cur.draft.answers[field.key] === o.id ? 'checked' : ''} ${locked ? 'disabled' : ''}><i aria-hidden="true"></i><span>${esc(o.label)}</span></label>`).join('')}</fieldset>`).join('');
    const help = cur.assistance.includes('lesson')
      ? `<div class="study-help"><b>Repaso:</b> ${esc(skill.lesson)}<ol>${skill.steps.map(t => `<li>${esc(t)}</li>`).join('')}</ol></div>` : '';
    const hint = cur.assistance.includes('hint') ? `<div class="study-help"><b>Pista:</b> ${esc(item.hint)}</div>` : '';
    const feedback = attempt ? `<div class="study-feedback ${attempt.correct ? 'correct' : 'incorrect'}" role="status">
      <strong>${attempt.correct ? (attempt.assistance.length ? 'Correcto, con ayuda' : '¡Correcto!') : 'Hay algo por revisar'}</strong>
      ${engine.grade(item, attempt.answers).criteria.map(c => `<p>${c.correct ? '✔' : '✘'} ${esc(c.label)}: ${esc(c.chosen)}${c.correct ? '' : ` → <b>${esc(c.expected)}</b>`}</p>`).join('')}
      <p>${esc(item.explanation)}</p>${attempt.assistance.length ? '<p><small>Usaste ayuda: este acierto no cuenta como independiente.</small></p>' : ''}</div>` : '';
    const controls = locked
      ? `<div class="study-actions">${btn(n >= session.target ? 'Terminar' : 'Siguiente', 'data-study-next')}</div>`
      : `<div class="study-actions">${btn('Comprobar', 'type="submit"')}${btn('Pista', 'type="button" data-study-help="hint"')}${btn('Repasar la idea', 'type="button" data-study-help="lesson"')}</div>`;
    return `<div class="study-kicker">${pt(skill.title)}<span class="study-note">${n} de ${session.target}</span></div>
      ${bar(pct, 'Avance de la sesión')}
      <h1>${esc(item.title)}</h1><p class="study-why">${esc(cur.why)}</p><p>${esc(item.prompt)}</p>
      ${item.diagram?.length ? `<pre class="study-diagram" aria-label="Esquema">${item.diagram.map(esc).join('\n')}</pre>` : ''}
      <form data-study-form>${fields}
        <label class="study-note-field"><span>Tu razonamiento (opcional, no se califica solo)</span>
          <textarea name="note" rows="2" ${locked ? 'disabled' : ''}>${esc(cur.draft.note)}</textarea></label>${hint}${help}
        ${locked ? '' : controls}</form>${feedback}${locked ? controls : ''}
      <div class="study-actions">${btn('Salir', 'data-study-stop')}</div>`;
  }

  function summary(state) {
    const s = state.sessions.at(-1);
    const failed = state.attempts.filter(a => a.sessionId === state.session.id && !a.correct).map(a => E().skillById[a.skill].title);
    return `<h1>Sesión terminada</h1><p>${s?.attempted || 0} actividades · ${s?.independent || 0} sin ayuda.</p>
      ${failed.length ? `<p>Para volver a mirar: <b>${[...new Set(failed)].map(esc).join(', ')}</b>. Aparecerán primero en la próxima sesión.</p>` : '<p>Sin errores esta vez. Los repasos quedaron programados.</p>'}
      <div class="study-actions">${btn('Volver', 'data-study-close')}</div>`;
  }

  function render() {
    if (!host) return;
    const state = get(), session = state.session;
    const body = !session ? home(state) : session.status === 'complete' ? summary(state) : session.current ? activity(state) : home(state);
    host.innerHTML = `<section class="page study-page"><div class="pu-panel">
      <div class="study-head">${pt('Cámara de estudio')}${btn('Inicio', 'data-route="home"')}</div>
      <div class="study-sheet pu-paper">${body}</div></div></section>`;
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
