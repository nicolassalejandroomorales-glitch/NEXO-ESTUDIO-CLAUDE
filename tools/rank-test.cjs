const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const window={};
vm.runInNewContext(fs.readFileSync('dist/academic/ranks.js','utf8'),{window});
const rank=window.NexoArcaneRanks;
const conceptId='org.basicity';
const ev=(id,family,exercise,day,extra={})=>({id,attemptId:id,conceptId,familyId:family,
  exerciseId:exercise,outcome:'correct',assistanceUsed:false,at:`${day}T12:00:00.000Z`,
  source:'structured_validator',validationStatus:'verified',...extra});
const e=[
  ev('a','f1','e1','2026-09-01'),
  ev('b','f2','e2','2026-09-01',{reasoningSupported:true}),
  ev('c','f3','e3','2026-09-02',{transfer:true,examStyle:true,delayed:true,delayHours:25})
];
const time=[{id:'s1',conceptId,seconds:2100,day:'2026-09-01'},
  {id:'s2',conceptId,seconds:2100,day:'2026-09-02'}];
const input={conceptId,evidence:e,activeTime:time,errors:[],prerequisiteStates:{required:'independent'}};
assert.equal(rank.derive({...input,evidence:[]}).level,0,'tiempo no concede rango');
assert.equal(rank.derive({...input,evidence:e.map(item=>({...item,source:'self_rubric',validationStatus:'self_reported'}))}).level,0,
  'la autoevaluación sola no concede rango verificado');
assert.equal(rank.derive({...input,activeTime:[]}).level,0,'evidencia sin tiempo no concede rango');
assert.equal(rank.derive({...input,evidence:[e[0],{...e[0],id:'repeat',attemptId:'a'}]}).level,1,
  'repetir un mismo intento no aumenta el rango');
assert.equal(rank.derive({...input,evidence:[e[0],e[1]],activeTime:[{id:'s1',conceptId,seconds:800}]}).level,2);
assert.equal(rank.derive({...input,activeTime:[{id:'s1',conceptId,seconds:1600}]}).level,3);
assert.equal(rank.derive({...input,activeTime:[{id:'s1',conceptId,seconds:2700}]}).level,4);
assert.equal(rank.derive(input).level,5);
assert.equal(rank.derive({...input,errors:[{conceptId,status:'pending',misconceptionId:'x'}]}).level,3);
assert.equal(rank.derive({...input,prerequisiteStates:{required:'unseen'}}).level,2);
assert.equal(rank.derive({...input,evidence:e.map(item=>({...item,at:'2026-09-01T12:00:00Z'}))}).level,4);
// Clases (docs/motor-rangos/SPEC.md): lo corregido por la app (class_item) es verificado; solo escritas no pasa del rango 2.
assert.equal(rank.derive({...input,evidence:e.map(item=>({...item,source:'class_item'}))}).level,5,'class_item cuenta como verificada');
assert.equal(rank.derive({...input,evidence:e.map(item=>({...item,source:'self_rubric',validationStatus:'self_reported',reasoningSupported:true}))}).level,0,
  'solo escritas autoevaluadas no conceden rango');
assert.equal(rank.derive({...input,evidence:e.map(item=>({...item,source:'class_item',familyId:'class.x.c.identify'}))}).level,2,
  'una sola familia (solo elegir) no llega al rango 3');
console.log('Rangos: tiempo, evidencia, familias, error crítico y recuerdo diferido OK');
