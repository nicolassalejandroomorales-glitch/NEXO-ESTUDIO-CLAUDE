/* Pilot map and review queue. The data model remains independent of these views. */
(() => {
  'use strict';
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date=x=>/^\d{4}-\d{2}-\d{2}$/.test(x)?x:
    new Intl.DateTimeFormat('es-CL',{dateStyle:'medium',timeStyle:'short'}).format(new Date(x));
  let selected='org.basicity',context=null,screen='knowledge';
  function relations(graph,model,id) {
    const names=ids=>ids.map(key=>model.byId(model.concepts,key)?.title||key);
    return {
      prerequisites:names(graph.direct(id).map(edge=>edge.from)),
      dependents:names(graph.unlocks(id).map(edge=>edge.to))
    };
  }
  function renderMap(host,api,conceptId) {
    context=api;screen='knowledge';
    const engine=window.NexoAcademicEngine,model=engine.model,state=api.getState();
    if(conceptId&&model.byId(model.concepts,conceptId))selected=conceptId;
    if(!model.byId(model.concepts,selected))selected=model.concepts[0].id;
    const concept=model.byId(model.concepts,selected),knowledge=engine.knowledgeFor(state,selected);
    const rank=window.NexoArcaneRanks.forState(state,selected,model);
    const reserved=(api.getReservations?.()||[]).filter(item=>item.concept_id===selected)
      .sort((a,b)=>a.rank-b.rank);
    const related=relations(engine.graph,model,selected);
    const evidence=(window.NexoAcademicBridge?.evidenceFor(state)||state.academicIntelligence?.evidence||[]).filter(item=>item.conceptId===selected);
    const uncertain=evidence.filter(item=>item.provenanceIssue).length;
    const review=(state.academicIntelligence?.reviewSchedules||[]).find(item=>item.id===`concept:${selected}`);
    const sources=window.NexoSources.sourcesFor(model,state.academicIntelligence?.userSources||[],selected);
    const errors=(state.academicIntelligence?.structuredErrors||[]).filter(item=>item.conceptId===selected).slice(0,8);
    const successes=evidence.filter(item=>item.outcome==='correct'&&!item.assistanceUsed&&window.NexoKnowledge.isVerified(item));
    const selfReported=evidence.filter(item=>item.validationStatus==='self_reported').length;
    const transfers=successes.filter(item=>item.transfer);
    host.innerHTML=`<section class="page academic-map"><button data-route="subject" data-route-sub="organica" class="back-btn">← Orgánica</button>
      <div class="section-head"><div><p class="eyebrow">PILOTO ORG-01</p><h1>Mapa de conocimiento</h1>
      <p>Selecciona un concepto para ver relaciones, evidencia y fuentes.</p></div>
      <button data-route="reviews" class="secondary-btn">Revisiones →</button></div>
      <div class="academic-map-layout"><nav class="academic-map-nodes" aria-label="Conceptos de Aminas">
      ${model.concepts.map(item=>{
        const current=engine.knowledgeFor(state,item.id);
        const level=window.NexoArcaneRanks.forState(state,item.id,model);
        return `<button type="button" class="academic-map-node state-${current.state}" data-academic-select="${esc(item.id)}"
          aria-pressed="${item.id===selected}" aria-label="${esc(item.title)}: ${esc(level.name)}, ${esc(current.label)}">
          <span class="rank-symbol" aria-hidden="true">${window.NexoArcaneRanks.flame(level.level)}</span><strong>${esc(item.title)}</strong><small>${esc(level.name)} · ${esc(current.label)}</small></button>`;
      }).join('')}</nav>
      <article class="academic-concept-detail panel" aria-live="polite"><p class="eyebrow">FICHA DE CONCEPTO</p>
        <h2>${esc(concept.title)}</h2><p>${esc(concept.description)}</p>
        <div class="rank-summary">${window.NexoArcaneRanks.flame(rank.level)}<div><strong>${esc(rank.name)}</strong><small>${esc(knowledge.label)} · ${rank.minutes.toFixed(1)} min activos · ${rank.families} familias independientes</small></div></div>
        <p>${esc(rank.evidenceBasis)} El tiempo por sí solo no sube un rango.</p>
        ${reserved.length?`<div class="rank-reservations"><strong>Recompensa reservada</strong><span>${reserved.map(item=>`Rango ${item.rank} · ${esc(item.reward_tier)}`).join(' · ')}</span><small>Cofres — Próximamente</small></div>`:
          '<p class="rank-reservation-pending">Las recompensas de rango se reservan solo tras comprobación en tu cuenta.</p>'}
        <h3>Relaciones</h3><p>Depende de: ${related.prerequisites.map(esc).join(', ')||'Sin prerequisitos mapeados.'}</p>
        <p>Desbloquea: ${related.dependents.map(esc).join(', ')||'Sin dependientes mapeados.'}</p>
        <h3>Evidencia</h3><p>${successes.length} aciertos independientes · ${transfers.length} transferencias ·
          ${evidence.filter(item=>item.outcome==='incorrect').length} intentos fallidos · ${selfReported} autoevaluaciones (sin acreditar dominio).</p>
        ${uncertain?`<p>${uncertain} registros históricos requieren revisión de procedencia y no acreditan dominio.</p>`:''}
        <p>Próxima revisión: ${review?.dueAt?esc(date(review.dueAt)):'Todavía no programada.'}</p>
        <h3>Fuentes</h3>${sources.length?`<ul>${sources.map(item=>`<li>${item.url?
          `<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer" data-academic-source="${esc(item.id)}">${esc(item.title)}</a>`:
          esc(item.title)} <small>${esc(Object.entries(item.location||{}).map(([k,v])=>k+': '+v).join(' · '))}</small></li>`).join('')}</ul>`:
          '<p>Mapeo de fuentes pendiente.</p>'}
        <h3>Bitácora de errores</h3>${errors.length?`<ul>${errors.map(item=>`<li>${esc(item.familyId)} ·
          ${esc(item.status)} · ${esc(item.at?.slice(0,10)||'')} ${item.misconceptionId?esc(item.misconceptionId):''}</li>`).join('')}</ul>`:
          '<p>Sin errores estructurados registrados.</p>'}
        <a href="#/lesson/org-01" class="secondary-btn">Practicar en Aminas</a>
      </article></div>
      ${new URLSearchParams(location.search).has('nexoDev')?'<a href="#/inspector">Inspector de contenido</a>':''}
    </section>`;
  }
  function renderReviews(host,api) {
    context=api;screen='reviews';
    const state=api.getState(),model=window.NexoAcademicEngine.model;
    const all=state.academicIntelligence?.reviewSchedules||[];
    const due=window.NexoAcademicReviews.due(all,new Date(),state.mastery||{});
    const upcoming=all.filter(item=>!due.some(entry=>entry.id===item.id))
      .sort((a,b)=>new Date(a.dueAt)-new Date(b.dueAt)).slice(0,4);
    const row=item=>{
      const concept=model.byId(model.concepts,item.targetId);
      const title=concept?.title||item.targetId;
      return `<li class="academic-review-row"><span><strong>${esc(title)}</strong>
        <small>${item.legacy?'Revisión de clase anterior':'Recuperación tras intento'} · ${esc(date(item.dueAt))} · ≈ 3 min</small></span>
        <a href="#/lesson/org-01" class="secondary-btn">Practicar sin mirar la pauta</a></li>`;
    };
    host.innerHTML=`<section class="page academic-reviews"><button data-route="knowledge" class="back-btn">← Mapa</button>
      <h1>Revisiones</h1><p>${due.length} para hoy. Practica recuperando la respuesta antes de consultar la pauta.</p>
      ${due.length?`<ul>${due.map(row).join('')}</ul>`:'<p>Aún no hay revisiones vencidas.</p>'}
      ${upcoming.length?`<h2>Próximas</h2><ul>${upcoming.map(row).join('')}</ul>`:''}
    </section>`;
  }
  document.addEventListener('click',event=>{
    if(screen!=='knowledge'||!document.querySelector('.academic-map')||!context)return;
    const source=event.target.closest('[data-academic-source]');
    if(source)context.track?.('source_opened',{source_id:source.dataset.academicSource});
    const button=event.target.closest('[data-academic-select]');
    if(button){selected=button.dataset.academicSelect;context.track?.('concept_viewed',{concept_id:selected});
      renderMap(document.querySelector('#app'),context);}
  });
  window.NexoAcademicExplorer={renderMap,renderReviews,relations};
})();
