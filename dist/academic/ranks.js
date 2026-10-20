/* Evidence-based concept ranks. Time is only a minimum gate, never a score. */
(() => {
  'use strict';
  const ranks=[
    {level:0,name:'Sin rango',tier:null,minutes:0},
    {level:1,name:'Mago Principiante',tier:'basic',minutes:5},
    {level:2,name:'Mago Intermedio',tier:'uncommon',minutes:12},
    {level:3,name:'Mago Avanzado',tier:'rare',minutes:25},
    {level:4,name:'Mago Experto',tier:'epic',minutes:40},
    {level:5,name:'Rey Mago',tier:'arcane',minutes:60}
  ];
  const uniqueBy=(items,key)=>[...new Map(items.map(item=>[key(item),item])).values()];
  function derive({conceptId,concept={},evidence=[],attempts=[],activeTime=[],errors=[],prerequisiteStates={}}) {
    const byAttempt=new Map(attempts.map(item=>[item.id,item]));
    const relevant=uniqueBy(evidence.filter(item=>item.conceptId===conceptId),item=>item.attemptId||item.id);
    const reported=relevant.filter(item=>item.outcome==='correct');
    const correct=reported.filter(item=>item.validationStatus==='verified'&&
      ['structured_validator','instructor_review','class_item','study_bank'].includes(item.source));
    const independent=correct.filter(item=>!item.assistanceUsed);
    const verified=independent.filter(item=>item.validationStatus==='verified'&&
      ['structured_validator','instructor_review','class_item'].includes(item.source));
    const verifiedFamilies=new Set(verified.map(item=>item.familyId).filter(Boolean));
    const exercises=new Set(independent.map(item=>item.exerciseId||byAttempt.get(item.attemptId)?.exerciseId).filter(Boolean));
    const families=new Set(independent.map(item=>item.familyId).filter(Boolean));
    const minutes=activeTime.filter(item=>item.conceptId===conceptId).reduce((sum,item)=>sum+Math.max(0,Number(item.seconds)||0),0)/60;
    const days=new Set(independent.map(item=>String(item.at||byAttempt.get(item.attemptId)?.attemptedAt||'').slice(0,10)).filter(Boolean));
    const sessions=new Set(activeTime.filter(item=>item.conceptId===conceptId&&Number(item.seconds)>0).map(item=>item.id));
    const delayed=independent.some(item=>item.delayed&&Number(item.delayHours)>=24);
    const transfer=independent.some(item=>item.transfer);
    const justified=independent.some(item=>item.reasoningSupported===true);
    const examStyle=independent.some(item=>item.examStyle===true);
    const criticalOpen=errors.some(item=>item.conceptId===conceptId&&item.status!=='resolved'&&
      (item.misconceptionId||item.candidateMisconceptionId));
    const prerequisitesReady=Object.values(prerequisiteStates).every(value=>
      ['independent','transferable','retained'].includes(value));
    const min=level=>Math.max(0,Number(concept.rankThresholds?.[level]??ranks[level].minutes));
    let level=0;
    if(minutes>=min(1)&&correct.length>=1)level=1;
    if(level>=1&&minutes>=min(2)&&exercises.size>=2&&independent.length>=2)level=2;
    if(level>=2&&minutes>=min(3)&&families.size>=2&&verifiedFamilies.size>=2&&justified&&prerequisitesReady)level=3;
    if(level>=3&&minutes>=min(4)&&families.size>=3&&verifiedFamilies.size>=3&&transfer&&examStyle&&!criticalOpen)level=4;
    if(level>=4&&minutes>=min(5)&&days.size>=2&&sessions.size>=2&&delayed&&
      !criticalOpen&&independent.every(item=>!item.assistanceUsed))level=5;
    const next=ranks[Math.min(level+1,5)];
    return {conceptId,level,name:ranks[level].name,tier:ranks[level].tier,
      minutes:Math.floor(minutes*10)/10,independent:independent.length,verified:verified.length,
      exercises:exercises.size,families:families.size,days:days.size,sessions:sessions.size,
      delayed,transfer,justified,examStyle,criticalOpen,prerequisitesReady,
      next:level<5?{name:next.name,minMinutes:min(level+1)}:null,
      evidenceBasis:reported.some(item=>item.source==='self_rubric')?'Incluye autoevaluación; solo las respuestas verificadas acreditan rango.':'Evidencia registrada.'};
  }
  function forState(state,conceptId,model) {
    const academic=state.academicIntelligence||{};
    const evidence=window.NexoAcademicBridge?.evidenceFor(state)||academic.evidence||[];
    const concept=model.concepts.find(item=>item.id===conceptId)||{};
    const required=model.prerequisites.filter(item=>item.to===conceptId&&item.strength==='required');
    const prerequisiteStates=Object.fromEntries(required.map(item=>[item.from,
      window.NexoKnowledge.derive(evidence.filter(e=>e.conceptId===item.from)).state]));
    return derive({conceptId,concept,evidence,attempts:academic.attempts||[],
      activeTime:academic.activeTimeSegments||[],errors:academic.structuredErrors||[],prerequisiteStates});
  }
  function flame(level) {
    const size=16+Math.max(0,level)*3;
    const opacity=level?1:.32;
    return `<svg class="rank-flame level-${level}" width="${size}" height="${size}" viewBox="0 0 32 36" aria-hidden="true" focusable="false"><path fill="currentColor" opacity="${opacity}" d="M16 2c-3 6-1 9-8 15C2 22 7 34 16 34s14-10 8-17c-2-3-4-4-4-10-2 2-3 5-4 6-2-4-1-7 0-11Z"/><path fill="var(--paper-100)" opacity=".65" d="M16 19c-1 3-5 5-5 8a5 5 0 0 0 10 0c0-3-3-5-5-8Z"/>${level===5?'<path fill="var(--amber-500)" d="m7 1 4 5 5-5 5 5 4-5-2 9H9L7 1Z"/>':''}</svg>`;
  }
  window.NexoArcaneRanks=Object.freeze({ranks,derive,forState,flame});
})();
