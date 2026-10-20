const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const window={FSRS:require('ts-fsrs'),NexoLoader:{script:async()=>{}}};
const document={addEventListener(){},querySelector(){return null;}};
const location={search:'?nexoDev=1'};
const ctx=vm.createContext({window,document,location,URLSearchParams,Date,Intl,crypto:require('node:crypto').webcrypto});
for(const name of ['model','graph','diagnosis','knowledge','ranks','classifiers','sources','reviews','structured','engine','inspector','explorer'])
  vm.runInContext(fs.readFileSync('dist/academic/'+name+'.js','utf8'),ctx,{filename:name});
const M=window.NexoAcademicModel,G=window.NexoPrerequisites,K=window.NexoKnowledge,
  D=window.NexoAcademicDiagnosis,C=window.NexoAcademicClassifiers,S=window.NexoSources,
  R=window.NexoAcademicReviews,E=window.NexoAcademicEngine,I=window.NexoAcademicInspector;
assert(M.validate());
assert.deepEqual(JSON.parse(JSON.stringify(I.inspect(M))),[],
  'el piloto publicado no admite conceptos sin fuente o referencias rotas');
assert.equal(M.exercises.find(x=>x.id==='org-01:b02').familyId,'org.heterocycle.pair');
assert(E.graph.ancestors('org.basicity').includes('org.lone-pair'));
assert(E.graph.descendants('org.lone-pair').includes('org.basicity'));
assert.throws(()=>G.create(['A','B'],[{from:'A',to:'B',strength:'required'},
  {from:'B',to:'A',strength:'required'}]),/cycle/);
assert.equal(C.classifyMultipleChoice({options:[{id:'wrong',misconceptionId:'org.pka.inverted'}]},'wrong').misconceptionId,'org.pka.inverted');
assert.equal(C.classifyNumeric({expected:.01,tolerance:.00001,errorPatterns:[{value:.1,misconceptionId:'factor-ten'}]},.1).misconceptionId,'factor-ten');
assert.equal(C.classifyText('respuesta').outcome,'self_assessment_required');
assert.deepEqual(JSON.parse(JSON.stringify(C.classifyStructure({charge:1,protonationSite:'N1'},
  {charge:0,protonationSite:'N2'}).differences)),['charge','protonationSite']);
const evidence=[{id:'g',outcome:'correct',assistanceUsed:true},
 {id:'i',outcome:'correct',assistanceUsed:false},
 {id:'t',outcome:'correct',assistanceUsed:false,transfer:true},
 {id:'d',outcome:'correct',assistanceUsed:false,transfer:true,delayed:true,delayHours:26}]
 .map(item=>({...item,source:'class_item',validationStatus:'verified'}));
assert.equal(K.derive([]).state,'unseen');
for(const [n,state] of [[1,'guided'],[2,'independent'],[3,'transferable'],[4,'retained']])
 assert.equal(K.derive(evidence.slice(0,n)).state,state);
assert.equal(K.derive([...evidence,{id:'bad',outcome:'incorrect'}]).state,'retained');
assert.equal(K.migrateLegacy({status:'dominado'}).conceptEvidence.length,0);
const failures=[{id:'f1',familyId:'org.protonation.charge',outcome:'incorrect'},
 {id:'f2',familyId:'org.basicity.resonance',outcome:'incorrect'}];
assert.equal(D.diagnose(failures.slice(0,1),M,E.graph).length,0);
const suspicion=D.diagnose(failures,M,E.graph).find(x=>x.conceptId==='org.lone-pair');
assert(suspicion);
const checks=outcome=>[{id:'d1',familyId:'a',conceptIds:['org.lone-pair'],diagnostic:true,
  validationStatus:'verified',outcome},
 {id:'d2',familyId:'b',conceptIds:['org.lone-pair'],diagnostic:true,
  validationStatus:'verified',outcome}];
assert.equal(D.resolve(suspicion,checks('incorrect')).status,'confirmed');
assert.equal(D.resolve(suspicion,checks('correct')).status,'not_confirmed');
assert.equal(D.resolve(suspicion,checks('incorrect').map(item=>({...item,validationStatus:'self_reported'}))).status,'possible');
assert(S.sourcesFor(M,[],'org.basicity').some(item=>item.type==='web'));
assert.deepEqual(JSON.parse(JSON.stringify(S.parseTranscript('1\n00:00:01,000 --> 00:00:03,500\nResonancia\n','srt'))),
 [{start:1,end:3.5,text:'Resonancia'}]);
assert.equal(S.validate({id:'private:1',type:'book',title:'Libro propio',location:{chapter:3,pageStart:12}}).type,'book');
assert.equal(S.validate({id:'private:ppt',type:'ppt',title:'Clase',location:{slideStart:18,slideEnd:29},authority:'professor'}).authority,'professor');
assert.equal(S.validate({id:'private:recording',type:'recording',title:'Audio',location:{startTime:2600,endTime:3310}}).location.endTime,3310);
assert.throws(()=>S.validate({id:'private:2',type:'web',title:'Enlace',url:'javascript:evil()'}));
const fixture=JSON.parse(JSON.stringify(M));
fixture.families.push({id:'orphan',version:1,conceptIds:['unknown'],skillIds:[]});
fixture.exercises.push({id:'bad',version:1,familyId:'missing',conceptIds:[]});
fixture.misconceptions.push({id:'empty',version:1,feedback:''});
fixture.conceptSources.push({conceptId:'org.basicity',sourceId:'missing'});
fixture.prerequisites.push({from:'org.basicity',to:'org.lone-pair',strength:'required'});
const codes=new Set(I.inspect(fixture).map(item=>item.code));
for(const code of ['family_without_exercise','dangling_concept','exercise_without_family',
  'misconception_without_feedback','missing_source','prerequisite_cycle'])assert(codes.has(code));
(async()=>{
 const at='2026-09-20T10:00:00Z';
 const first=await R.schedule(null,'org.lone-pair','concept',{id:'attempt-1',outcome:'correct'},
   {now:new Date(at)});
 assert(first.dueAt>at&&first.card);
 assert.equal(await R.schedule(first,'org.lone-pair','concept',{id:'attempt-1',outcome:'correct'}),first);
 assert.equal(R.due([first],new Date('2027-01-01T00:00:00Z')).length,1);
 const state={academicIntelligence:{attempts:[],evidence:[],reviewSchedules:[],structuredErrors:[],userSources:[]}};
 const tracked=[],api={getState:()=>state,saveState(){},track:(...event)=>tracked.push(event)};
 const emitted=[],unsubscribe=E.subscribe(event=>emitted.push(event));
 await E.recordAttempt(api,{id:'pilot-1',exerciseId:'org-01:b01',outcome:'incorrect',at});
 await E.recordAttempt(api,{id:'pilot-1',exerciseId:'org-01:b01',outcome:'incorrect',at});
 assert.equal(state.academicIntelligence.attempts.length,1);
 assert.equal(state.academicIntelligence.evidence[0].activityType,'lesson');
 assert.equal(state.academicIntelligence.structuredErrors[0].misconceptionId,null);
 assert(state.academicIntelligence.reviewSchedules.length>0);
 assert.equal(E.domainEvent('review_completed',{attemptId:'pilot-1'}).currencyGranted,0);
 const structured=window.NexoAcademicStructured.cases[0];
 const answers=Object.fromEntries(structured.fields.map(field=>[field.key,String(field.answer)]));
 await E.recordAttempt(api,{id:'structured-pilot',exerciseId:'org-01:sv-protonation',
   structuredAnswers:answers,outcome:'incorrect',at});
 assert.equal(state.academicIntelligence.attempts[0].outcome,'correct');
 assert.equal(state.academicIntelligence.evidence[0].validationStatus,'verified');
 assert.equal(state.academicIntelligence.evidence[0].source,'structured_validator');
 const wrong={...answers,charge:'0'};
 await E.recordAttempt(api,{id:'structured-error',exerciseId:'org-01:sv-protonation',
   structuredAnswers:wrong,outcome:'correct',at:'2026-09-21T10:00:00Z'});
 assert.equal(state.academicIntelligence.structuredErrors[0].misconceptionId,'org.charge.disappears');
 await E.recordAttempt(api,{id:'structured-repair',exerciseId:'org-01:sv-protonation',
   structuredAnswers:answers,assistanceUsed:true,at:'2026-09-21T11:00:00Z'});
 assert.equal(state.academicIntelligence.structuredErrors[0].status,'resolved');
 assert(emitted.every(event=>event.currencyGranted===0&&event.requiresServerValidation));
 unsubscribe();
 const host={innerHTML:''};
 window.NexoAcademicExplorer.renderMap(host,api);
 assert(host.innerHTML.includes('data-academic-select="org.protonation"'));
 assert(host.innerHTML.includes('Fuentes'));
 window.NexoAcademicExplorer.renderReviews(host,api);
 assert(host.innerHTML.includes('Practicar sin mirar la pauta'));
 I.render(host);assert(host.innerHTML.includes('Inspector académico'));
 console.log('OK: modelo org-01, DAG, familias, clasificadores, evidencia, diagnóstico, FSRS y fuentes.');
})().catch(error=>{console.error(error);process.exitCode=1});
