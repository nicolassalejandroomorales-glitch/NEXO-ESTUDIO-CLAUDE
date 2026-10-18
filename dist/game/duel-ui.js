/* Pantalla de prueba del duelo (#/duelo): escena con el bicho arriba y la mano de cartas abajo.
   Es una prueba suelta para jugar la lógica; la escena final va dentro de Aprender (docs/juegos/SPEC.md). Sin música todavía. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SKIN = { organica: ['#d9a441', '#6a4a1a'], fisico: ['#4fb3a5', '#1f5a52'], fisio: ['#e0786a', '#7a2f26'], analitica: ['#9b8be0', '#463a8a'] };
  const STYLE = `
.duel-page{max-width:820px;margin:0 auto;padding:12px 8px 40px}
.duel-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 4px 10px;color:var(--pu-cream)}
.duel-top .pixel-text{height:22px;width:auto;fill:var(--pu-brass)}
.duel-scene{position:relative;height:230px;background:#2b2833;border:3px solid #6a4a28;box-shadow:3px 3px 0 #0006;overflow:hidden}
.duel-wall{position:absolute;top:0;bottom:0;width:22%;background:#3a3644}.duel-wall.l{left:0;clip-path:polygon(0 0,100% 18%,100% 82%,0 100%)}.duel-wall.r{right:0;clip-path:polygon(0 18%,100% 0,100% 100%,0 82%)}
.duel-floor{position:absolute;left:22%;right:22%;bottom:0;height:34%;background:#4a4555;clip-path:polygon(18% 0,82% 0,100% 100%,0 100%)}
.duel-bug{position:absolute;left:50%;top:26px;transform:translateX(-50%);text-align:center;width:220px}
.duel-bug.hit{animation:duelShake .35s}.duel-bug.dead{opacity:.15;transform:translateX(-50%) scale(.8);transition:all .6s}
@keyframes duelShake{0%,100%{transform:translateX(-50%)}25%{transform:translateX(-58%)}75%{transform:translateX(-42%)}}
.duel-body{position:relative;width:92px;height:84px;margin:0 auto;border:3px solid;border-radius:46% 46% 40% 40%}
.duel-eye{position:absolute;top:28px;width:14px;height:14px;background:#fff;border:2px solid #2a1a0a;border-radius:50%}.duel-eye:after{content:"";position:absolute;left:3px;top:3px;width:5px;height:5px;background:#2a1a0a;border-radius:50%}
.duel-eye.l{left:20px}.duel-eye.r{right:20px}.duel-mouth{position:absolute;left:30px;bottom:14px;width:26px;height:8px;border-bottom:3px solid #2a1a0a;border-radius:0 0 14px 14px}
.duel-name{margin-top:8px;color:#f1ecff;font-size:.9rem;line-height:1.2}.duel-hp{width:140px;height:7px;background:#17151c;margin:5px auto 0}.duel-hp i{display:block;height:100%;background:#e0604f;transition:width .4s}
.duel-hearts{position:absolute;right:10px;top:8px;color:#e0604f;font-size:1.3rem;letter-spacing:3px}.duel-weight{position:absolute;left:10px;top:8px;color:#cfc8ff;font-size:.8rem}
.duel-combo{position:absolute;right:12px;bottom:10px;font-size:1.4rem;color:#f3dba0}.duel-msg{position:absolute;left:10px;bottom:10px;max-width:62%;color:#e8e3ff;font-size:.9rem}
.duel-hand{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:16px 4px 6px}
.duel-card{position:relative;min-height:110px;padding:12px 10px;text-align:left;font:inherit;font-size:.92rem;line-height:1.35;color:#34271c;background:#f6e8c4;border:2px solid #8a6a40;box-shadow:3px 3px 0 #6a4a28;cursor:pointer;transition:transform .12s}
.duel-card:hover{transform:translateY(-4px)}.duel-card:focus-visible{outline:2px dashed #fbe08a;outline-offset:3px}
.duel-card .n{display:none;position:absolute;top:-10px;left:-8px;width:26px;height:26px;border-radius:50%;background:#fbe08a;color:#2a1a0a;border:2px solid #6a4a1a;align-items:center;justify-content:center;font-weight:700}
.duel-card.ok{background:#e4efc9;border-color:#6c8a4a;pointer-events:none}.duel-card.ok .n{display:flex}.duel-card.bad{background:#f4d9c4;border-color:#a8583a;animation:duelShake2 .3s}
@keyframes duelShake2{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.duel-bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin:10px 4px;color:var(--pu-cream)}.duel-sheet{padding:12px 16px;color:#3a2c1d}
@media (prefers-reduced-motion:reduce){.duel-card,.duel-bug,.duel-hp i{transition:none;animation:none}}`;
  const pt = text => (window.NexoPixelText ? window.NexoPixelText.render(text, { shadow: false }) : esc(text));
  const btn = (label, attrs = '') => `<button class="pu-btn" ${attrs}>${pt(label)}</button>`;
  let api = null, host = null, view = null;
  const music = () => window.NexoDuelMusic;
  window.addEventListener?.('hashchange', () => { if (!/duelo/.test(location.hash)) music()?.stop(true); });

  const store = () => api.getState().duel || (api.getState().duel = { director: window.NexoDirector.createState(), totalXp: 0 });

  async function classesFor(pending) {
    const ids = window.NexoDirector.classIdsFor(pending);
    await Promise.all(ids.map(id => api.loadClass(id).catch(() => null)));
    return window.NexoClasses || {};
  }

  /* practice: sin pendientes (o para probar), arma un bicho con lo que haya en la clase de Aminas. */
  async function nextBug(practice) {
    const now = new Date(), state = api.getState();
    let source = state, force = false;
    if (practice) {
      await api.loadClass('org-01').catch(() => null);
      const cls = window.NexoClasses['org-01'];
      source = { academicIntelligence: { evidence: [], structuredErrors: [], reviewSchedules: (cls?.concepts || []).filter(c => c.mission)
        .map(c => ({ targetType: 'concept', targetId: window.NexoAcademicBridge.conceptOf(cls, c.id), dueAt: new Date(now - 864e5).toISOString() })) } };
      force = true;
    }
    const pending = window.NexoAcademicPending.list(source, { now, limit: 30 });
    const classes = await classesFor(pending);
    const encounter = window.NexoDirector.choose(store().director, { state: source, classes, now, seed: Date.now(), force });
    return encounter ? { encounter, cls: classes[encounter.classId], practice } : null;
  }

  function scene(d, enc) {
    const [fill, edge] = SKIN[enc.subject] || SKIN.organica;
    const hearts = Array.from({ length: d.maxLife }, (_, i) => (i < d.life ? '♥' : '♡')).join('');
    const hp = 100 - Math.round(100 * d.next / d.answer.length);
    return `<div class="duel-scene" id="duelScene"><i class="duel-wall l"></i><i class="duel-wall r"></i><i class="duel-floor"></i>
      <div class="duel-weight">${'★'.repeat(enc.weight)} ${enc.openErrors ? 'error abierto' : 'repaso vencido'}${view.practice ? ' · práctica' : ''}</div>
      <div class="duel-hearts" aria-label="Vida: ${d.life} de ${d.maxLife}">${hearts}</div>
      <div class="duel-bug ${d.status === 'won' ? 'dead' : ''}" id="duelBug"><div class="duel-body" style="background:${fill};border-color:${edge}"><i class="duel-eye l"></i><i class="duel-eye r"></i><i class="duel-mouth"></i></div>
        <div class="duel-name">${esc(enc.name)}</div><div class="duel-hp"><i style="width:${hp}%"></i></div></div>
      <div class="duel-msg" role="status">${esc(view.msg)}</div>${d.combo > 1 ? `<div class="duel-combo">combo ×${d.combo}</div>` : ''}</div>`;
  }

  function end(d) {
    const r = view.result;
    if (!r) return '';
    const text = r.sum.won ? (r.sum.mistakes || r.sum.hintUsed ? 'Lo lograste, pero con ayuda o errores: eso enseña, aunque no cuenta como acierto por tu cuenta.' : 'Limpio: cuenta como acierto por tu cuenta.')
      : 'El bicho se fue. Volverá con otra forma; no pierdes nada de tu avance.';
    return `<div class="duel-sheet pu-paper"><h2>${r.sum.won ? 'Bicho vencido' : 'El bicho escapó'}</h2><p>${esc(text)}</p><p><b>+${r.xp} xp</b>${view.practice ? ' (práctica: no da xp)' : ''} · total ${store().totalXp} xp</p>
      <p>${esc(d.explain)}</p><div class="duel-bar">${btn('Otro bicho', 'data-duel-next')}${btn('Salir', 'data-route="home"')}</div></div>`;
  }

  function render() {
    if (!host) return;
    if (!view) { host.innerHTML = `<section class="page duel-page"><div class="pu-panel"><div class="duel-sheet pu-paper"><h1>Duelo</h1><p>Los bichos salen de tus repasos vencidos y errores abiertos.</p>
      <div class="duel-bar">${btn('Buscar un bicho', 'data-duel-find')}${btn('Bicho de práctica', 'data-duel-practice')}</div><p class="study-note" id="duelNote"></p></div></div></section>`; return; }
    const { duel: d, encounter: enc } = view;
    host.innerHTML = `<section class="page duel-page"><div class="pu-panel">
      <div class="duel-top">${pt('Duelo')}<span>${store().totalXp} xp</span></div>${scene(d, enc)}
      <div class="duel-sheet pu-paper"><p>${esc(d.direction || (d.type === 'choice' ? enc.item.prompt : enc.item.prompt))}</p>
      ${view.result ? end(d) : `<div class="duel-hand">${d.hand.map(c => `<button class="duel-card ${c.played ? 'ok' : ''} ${view.bad === c.id ? 'bad' : ''}" data-duel-card="${esc(c.id)}"><span class="n">${c.step || ''}</span>${esc(c.text)}</button>`).join('')}</div>
      <div class="duel-bar">${btn('Pista', 'data-duel-hint')}${btn('Ahora no', 'data-duel-snooze')}</div>`}</div></div></section>`;
  }

  async function startBug(practice) {
    const note = host.querySelector('#duelNote');
    const found = await nextBug(practice);
    if (!found) { if (note) note.textContent = practice ? 'No encontré un ejercicio de duelo.' : 'Hoy no hay bichos: no tienes repasos vencidos ni errores abiertos, o ya llegaste al tope. Prueba un bicho de práctica.'; return; }
    view = { ...found, duel: window.NexoDuel.start(found.encounter.item, { seed: Date.now() }), msg: 'Un bicho salió del pasillo. Juega los pasos en orden.', result: null, bad: null };
    music()?.sfx('appear'); music()?.start(found.encounter.subject); music()?.setIntensity(1);
    render();
  }

  async function finishIf() {
    const d = view.duel;
    if (d.status === 'active' || view.result) return;
    const r = await window.NexoEncounter.finish(api, { cls: view.cls, encounter: view.encounter, duel: d, dstate: store().director, practice: view.practice });
    store().director = r.dstate; store().totalXp += r.xp; api.saveState();
    view.result = r; view.msg = r.sum.won ? '¡Lo vencimos!' : 'Se fue el bicho.';
    music()?.stop(); music()?.sfx(r.sum.won ? 'win' : 'lose');
    render();
  }

  function bind() {
    host.onclick = async event => {
      const el = event.target.closest('button'); if (!el) return;
      const d = el.dataset;
      if (d.duelFind !== undefined) return startBug(false);
      if (d.duelPractice !== undefined) return startBug(true);
      if (d.duelNext !== undefined) { const again = view?.practice ?? false; view = null; return startBug(again); }
      if (!view || view.result) return;
      if (d.duelHint !== undefined) { const h = window.NexoDuel.hint(view.duel); view.duel = h.state; view.msg = `Pista: ${h.text} (con pista, menos xp)`; return render(); }
      if (d.duelSnooze !== undefined) { music()?.stop(); if (!view.practice) { store().director = window.NexoDirector.snooze(store().director); api.saveState(); } view = null; return render(); }
      if (d.duelCard) {
        const r = window.NexoDuel.play(view.duel, d.duelCard);
        view.duel = r.state; view.bad = r.result.right === false ? d.duelCard : null;
        if (r.result.right === false) music()?.sfx('wrong'); else if (r.result.right) { music()?.sfx('right', r.result.combo); music()?.setIntensity(r.result.combo >= 2 ? 2 : 1); }
        view.msg = r.result.right ? (r.result.status === 'won' ? '' : `Bien: ese era el paso ${r.result.step}.`) : (r.result.note || 'Esa no.');
        render();
        if (r.result.right === false) { const bug = host.querySelector('#duelBug'); bug?.classList.add('hit'); setTimeout(() => bug?.classList.remove('hit'), 400); }
        return finishIf();
      }
    };
  }

  window.NexoDuelUI = {
    render(target, context) {
      api = context; host = document.createElement('div');
      if (!document.getElementById('duel-style')) document.head.append(Object.assign(document.createElement('style'), { id: 'duel-style', textContent: STYLE }));
      target.replaceChildren(host); view = null; bind(); render();
    }
  };
})();
