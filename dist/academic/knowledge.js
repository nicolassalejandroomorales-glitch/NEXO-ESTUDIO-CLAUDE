/* Evidence derives current knowledge; legacy lesson mastery remains separate. */
(() => {
  'use strict';
  const stages=['unseen','guided','independent','transferable','retained'];
  const labels={unseen:'Sin evidencia',guided:'Con ayuda',independent:'Por cuenta propia',
    transferable:'En otro contexto',retained:'Recordado después'};
  const isVerified=item=>item?.validationStatus==='verified'&&
    ['class_item','study_bank','structured_validator','instructor_review'].includes(item.source);
  function derive(evidence) {
    const unique=[...new Map((evidence||[]).map(item=>[item.attemptId||item.id,item])).values()]
      .filter(item=>item?.outcome==='correct');
    const verified=unique.filter(isVerified);
    const selfReportedCount=unique.filter(item=>item.validationStatus==='self_reported'||item.source==='self_rubric').length;
    const guided=verified.some(item=>item.assistanceUsed);
    const independent=verified.filter(item=>!item.assistanceUsed);
    const transferred=independent.some(item=>item.transfer===true);
    const retained=independent.some(item=>item.delayed===true&&
      Number(item.delayHours)>=24);
    const state=retained&&transferred?'retained':transferred?'transferable':
      independent.length?'independent':guided?'guided':'unseen';
    const recent=(evidence||[]).slice(0,3);
    return {state,label:state==='unseen'&&selfReportedCount?'Autoevaluado · sin verificación':labels[state],stage:stages.indexOf(state),selfReportedCount,
      evidenceCount:(evidence||[]).length,recentErrors:recent.filter(item=>item.outcome==='incorrect').length};
  }
  function migrateLegacy(legacy) {
    // A mastered lesson is not evidence that each concept was retained.
    return {legacyLessonStatus:legacy?.status||'pendiente',conceptEvidence:[]};
  }
  window.NexoKnowledge={stages,labels,isVerified,derive,migrateLegacy};
})();
