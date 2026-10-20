/* V14 academic application service. No Supabase, currency or UI-specific state writes. */
(() => {
  'use strict';
  const model=window.NexoAcademicModel;
  // El grafo se reconstruye cuando una clase amplía el catálogo (model.revision).
  let built=null;
  const current=()=>{
    if(!built||built.revision!==model.revision)built={revision:model.revision,graph:window.NexoPrerequisites.create(model.concepts,model.prerequisites)};
    return built.graph;
  };
  const graph={direct:id=>current().direct(id),unlocks:id=>current().unlocks(id),
    ancestors:(id,strength)=>current().ancestors(id,strength),descendants:(id,strength)=>current().descendants(id,strength)};
  const listeners=new Set();
  const domainEvent=(name,payload)=>({type:name,referenceId:payload.attemptId||payload.id,
    payload:{...payload},requiresServerValidation:true,currencyGranted:0});
  function emit(name,payload) {
    const event=domainEvent(name,payload);
    for(const listener of listeners)try {listener(event);} catch (_) { /* Listeners never block study. */ }
    return event;
  }
  function subscribe(listener) {listeners.add(listener);return ()=>listeners.delete(listener);}
  model.validate();current();
  const evidenceFor=state=>window.NexoAcademicBridge?.evidenceFor(state)||state.academicIntelligence?.evidence||[];
  function knowledgeFor(state,conceptId) {
    return window.NexoKnowledge.derive(evidenceFor(state)
      .filter(item=>item.conceptId===conceptId));
  }
  function diagnoses(state) {
    const academic=state.academicIntelligence||{};
    return window.NexoAcademicDiagnosis.diagnose(academic.attempts||[],model,graph)
      .map(item=>window.NexoAcademicDiagnosis.resolve(item,academic.attempts||[]));
  }
  const reviewQueues=new WeakMap();
  function ensureReview(api,academic,attempt,conceptId,now) {
    const reviewId=`concept:${conceptId}`;
    let queues=reviewQueues.get(academic);
    if(!queues){queues=new Map();reviewQueues.set(academic,queues);}
    const run=async()=>{
      if(api.getState().academicIntelligence!==academic)return;
      // También normaliza duplicados de guardados anteriores, conservando la tarjeta más reciente.
      const matches=academic.reviewSchedules.filter(item=>item.id===reviewId);
      const prior=matches.reduce((latest,item)=>!latest||new Date(item.updatedAt)>new Date(latest.updatedAt)||
        (item.updatedAt===latest.updatedAt&&Number(item.card?.reps)>Number(latest.card?.reps))?item:latest,null);
      if(matches.length>1){
        prior.attemptIdsAtUpdatedAt=[...new Set(matches.filter(item=>item.updatedAt===prior.updatedAt)
          .flatMap(item=>[...(item.attemptIdsAtUpdatedAt||[]),item.lastAttemptId]).filter(Boolean))];
        const keep=academic.reviewSchedules.indexOf(prior);
        academic.reviewSchedules=academic.reviewSchedules.filter((item,index)=>item.id!==reviewId||index===keep);
        api.saveState();
      }
      if(prior?.lastAttemptId===attempt.id||new Date(prior?.updatedAt)>now||
        (new Date(prior?.updatedAt).getTime()===now.getTime()&&prior?.attemptIdsAtUpdatedAt?.includes(attempt.id)))return;
      const scheduled=await window.NexoAcademicReviews.schedule(prior,conceptId,'concept',attempt,{now});
      if(api.getState().academicIntelligence!==academic)return;
      scheduled.attemptIdsAtUpdatedAt=new Date(prior?.updatedAt).getTime()===now.getTime()
        ? [...new Set([...(prior.attemptIdsAtUpdatedAt||[prior.lastAttemptId]),attempt.id])]:[attempt.id];
      const index=academic.reviewSchedules.findIndex(item=>item.id===reviewId);
      if(index<0)academic.reviewSchedules.push(scheduled);else academic.reviewSchedules[index]=scheduled;
      api.saveState();api.track?.('review_scheduled',{concept_id:conceptId});
    };
    const pending=(queues.get(reviewId)||Promise.resolve()).catch(()=>{}).then(run);
    queues.set(reviewId,pending);
    return pending.finally(()=>{if(queues.get(reviewId)===pending)queues.delete(reviewId);});
  }
  async function recordAttempt(api,input) {
    const exercise=model.byId(model.exercises,input.exerciseId);
    if(!exercise||!input.id)throw new Error('invalid_attempt');
    const structured=exercise.validator==='structured_validator';
    const banked=['study_bank','class_item'].includes(exercise.validator); // corrección determinista local (dist/study, clases)
    const checked=structured?window.NexoAcademicStructured?.evaluate(exercise.id.slice('org-01:'.length),input.structuredAnswers):null;
    const outcome=checked?.outcome||input.outcome;
    if(structured&&!checked||!['correct','incorrect'].includes(outcome))throw new Error('invalid_attempt');
    const state=api.getState(),academic=state.academicIntelligence;
    const existing=academic.attempts.find(item=>item.id===input.id);
    if(existing) {
      try {await ensureReview(api,academic,existing,existing.conceptIds[0],new Date(existing.attemptedAt));}
      catch (_) { /* An unavailable scheduler leaves the attempt intact for a later retry. */ }
      return existing;
    }
    const oldDiagnoses=diagnoses(state);
    const now=new Date(input.at||Date.now()),prior=knowledgeFor(state,exercise.conceptIds[0]);
    const diagnosticTarget=input.diagnostic&&input.diagnosticConceptId&&
      graph.ancestors(exercise.conceptIds[0],'required').includes(input.diagnosticConceptId)
      ? input.diagnosticConceptId:null;
    const earliestIndependent=evidenceFor(state).filter(item=>item.conceptId===exercise.conceptIds[0]
      &&item.outcome==='correct'&&!item.assistanceUsed&&window.NexoKnowledge.isVerified(item))
      .sort((a,b)=>new Date(a.at)-new Date(b.at))[0];
    const delayHours=earliestIndependent?Math.max(0,(now-new Date(earliestIndependent.at))/3600000):0;
    const attempt={id:input.id,exerciseId:exercise.id,familyId:exercise.familyId,
      conceptIds:[...exercise.conceptIds,...(diagnosticTarget?[diagnosticTarget]:[])],
      skillIds:[...exercise.skillIds],contentVersion:exercise.version,
      outcome,assistanceUsed:Boolean(input.assistanceUsed),confidence:input.confidence??null,
      transfer:Boolean(exercise.transfer),diagnostic:Boolean(input.diagnostic),
      validator:exercise.validator,validationStatus:structured||banked?'verified':'self_reported',
      reasoningText:String(input.reasoningText||'').slice(0,2000),
      structuredAnswers:structured?Object.fromEntries(exercise.id.startsWith('org-01:')?
        (window.NexoAcademicStructured.byId(exercise.id.slice('org-01:'.length))?.fields||[])
          .map(field=>[field.key,String(input.structuredAnswers?.[field.key]??'').slice(0,60)]):[]):null,
      reviewed:Boolean(input.review),
      attemptedAt:now.toISOString(),attemptNumber:Math.max(1,Number(input.attemptNumber)||1),
      activityType:input.review?'review':input.activityType||'lesson',activityId:input.activityId||exercise.lessonId};
    academic.attempts.unshift(attempt);
    if(structured&&attempt.outcome==='correct')for(const error of academic.structuredErrors)
      if(error.exerciseId===exercise.id&&error.status!=='resolved')
        {error.status='resolved';error.resolvedAt=attempt.attemptedAt;}
    for(const conceptId of exercise.conceptIds)academic.evidence.unshift({
      id:`${attempt.id}:${conceptId}`,attemptId:attempt.id,exerciseId:exercise.id,conceptId,familyId:exercise.familyId,
      outcome:attempt.outcome,assistanceUsed:attempt.assistanceUsed,transfer:attempt.transfer,
      examStyle:Boolean(exercise.examStyle),reasoningSupported:Boolean(input.reasoningSupported),
      delayed:Boolean(input.review)&&delayHours>=24,delayHours,at:attempt.attemptedAt,
      source:structured?'structured_validator':banked?exercise.validator:'self_rubric',validationStatus:structured||banked?'verified':'self_reported',
      activityType:attempt.activityType,activityId:attempt.activityId
    });
    if(attempt.outcome==='incorrect') {
      academic.structuredErrors.unshift({id:`error:${attempt.id}`,attemptId:attempt.id,
        exerciseId:exercise.id,conceptId:exercise.conceptIds[0],familyId:exercise.familyId,
        misconceptionId:structured?checked.misconceptionId:input.misconceptionId||null,
        candidateMisconceptionId:input.candidateMisconceptionId||null,
        at:attempt.attemptedAt,status:'pending',confidence:attempt.confidence,
        attemptNumber:attempt.attemptNumber,assistanceUsed:attempt.assistanceUsed,resolvedAt:null});
    }
    api.saveState(); // append-only evidence survives an unavailable scheduler
    const next=knowledgeFor(state,exercise.conceptIds[0]);
    api.track?.('problem_family_attempted',{family_id:exercise.familyId,concept_id:exercise.conceptIds[0],correct:attempt.outcome==='correct'});
    if(next.state!==prior.state) {
      api.track?.('concept_state_changed',{concept_id:exercise.conceptIds[0],state:next.state});
      emit('concept_state_changed',{attemptId:attempt.id,conceptId:exercise.conceptIds[0],state:next.state});
    }
    const verifiedMisconception=structured?checked?.misconceptionId:input.misconceptionId;
    if(verifiedMisconception) {
      api.track?.('misconception_detected',{misconception_id:verifiedMisconception});
      emit('misconception_detected',{attemptId:attempt.id,misconceptionId:verifiedMisconception});
    }
    const suspected=diagnoses(state);
    for(const item of suspected)if(item.status==='possible'&&
      !oldDiagnoses.some(x=>x.conceptId===item.conceptId))
      api.track?.('prerequisite_suspected',{concept_id:item.conceptId});
    for(const item of suspected)if(item.status==='confirmed'&&
      oldDiagnoses.find(x=>x.conceptId===item.conceptId)?.status!=='confirmed')
      {api.track?.('prerequisite_confirmed',{concept_id:item.conceptId});
        emit('prerequisite_confirmed',{attemptId:attempt.id,conceptId:item.conceptId});}
    try {
      await ensureReview(api,academic,attempt,exercise.conceptIds[0],now);
    } catch (_) { /* Evidence persists; review can be retried without duplicating attempt. */ }
    return attempt;
  }
  window.NexoAcademicEngine={model,graph,knowledgeFor,diagnoses,recordAttempt,domainEvent,emit,subscribe};
})();
