const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const memory = new Map();
const context = { window: { addEventListener() {}, NEXO_PUBLIC_CONFIG: {}, NEXO_TEST_MODE: true },
  document: { addEventListener() {} }, navigator: { onLine: false }, Date, JSON, console, setTimeout, clearTimeout,
  localStorage: { getItem: k => memory.get(k) ?? null, setItem: (k,v) => memory.set(k,String(v)), removeItem: k => memory.delete(k) } };
for (const file of ['core/storage.js', 'core/experiences.js', 'cloud/foundation.js']) vm.runInNewContext(fs.readFileSync(path.join(root,'dist',file),'utf8'),context);
const E = context.window.NexoExperiences;
const plain = v => JSON.parse(JSON.stringify(v));
const fresh = () => ({ tutorial: E.fresh(), meta: {}, sessions: [], completedLessons: [], practice: {}, errors: [], inventory: [], mascot: { name: 'Nexo' } });
const state = fresh();
assert(E.startTutorial(state,'guest'));
assert.equal(JSON.parse(memory.get('nexo-experiences-v1:guest')).tutorial.status,'shown','durable antes del primer cuadro');
assert.equal(state.tutorial.status,'shown');
assert(!E.startTutorial(state,'guest'),'no segundo inicio en memoria');
for (let i=0;i<5;i++) { const reloaded=fresh(); E.hydrate(reloaded,'guest'); assert.equal(reloaded.tutorial.status,'shown'); assert(!E.startTutorial(reloaded,'guest')); }
E.finishTutorial(state,'guest','done');
const history=plain(state.tutorial);
E.finishTutorial(state,'guest','skipped');
assert.deepEqual(plain(state.tutorial),history,'resultado histórico no se reemplaza');
const stale=fresh(); E.hydrate(stale,'guest'); assert.equal(stale.tutorial.status,'done','un remoto/caché pendiente no borra el registro');
const skip=fresh(); assert(E.startTutorial(skip,'user:skip')); E.finishTutorial(skip,'user:skip','skipped');
assert.equal(E.hydrate(fresh(),'user:skip').tutorial.status,'skipped');
assert(E.startTutorial(fresh(),'user:other'),'aislamiento de cuentas');
for (const data of [{sessions:[{id:'a'}]}, {practice:{q:{attempts:1}}}, {errors:[{id:'e'}]}, {organicProgress:{a:{}}}, {classSessions:{a:{}}}, {grades:{a:{components:[{grade:'5.5'}]}}}, {mascot:{kind:'slime'}}, {inventory:['hat']}, {academicIntelligence:{evidence:[{id:'x'}]}}]) {
  for (const pending of [false,true]) {
    const legacy={...data, ...(pending ? {tutorial:{status:'pending'}} : {})};
    const before=JSON.stringify(legacy);
    assert.equal(E.normalize(legacy).tutorial.status,'shown','progreso antiguo no es nuevo');
    assert.equal(JSON.stringify(legacy),before,'normalización no altera datos académicos');
  }
}
const cursor=fresh(); E.hydrate(cursor,'user:cursor',{legacyCursor:true}); assert.equal(cursor.tutorial.status,'shown');
const oldDone=E.normalize({tutorial:{status:'done',rewarded:true,sections:{clases:true},news:4}});
assert.equal(oldDone.tutorial.status,'done'); assert(oldDone.tutorial.rewarded); assert.equal(oldDone.tutorial.news,4);
assert.equal(E.normalize({tutorial:{status:'done'},meta:{experiences:{tutorial:{status:'pending'}}}}).tutorial.status,'done','metadatos parciales no borran el historial compatible');
assert.equal(E.normalize({tutorial:E.fresh(),inventory:['species-pig','scene-ruins']}).tutorial.status,'pending','objetos sembrados de fábrica no son progreso');
assert.doesNotThrow(()=>E.normalize({inventory:{},grades:{a:{components:'invalid'}}}),'datos parciales siguen siendo normalizables');
const protectedData={sessions:[{id:'study'}],inventory:['hat'],mascot:{kind:'slime',name:'Luz'},settings:{sound:false},coins:15,grades:{a:{components:[{grade:'6'}]}}};
Object.assign(state,plain(protectedData)); E.mirror(state);
const rows=context.window.NexoCloudTest.rowsFromState(state);
const reconstructed=context.window.NexoCloudTest.applyRows(fresh(),rows);
assert.equal(reconstructed.meta.experiences.tutorial.status,'done','roundtrip usa el documento meta permitido, sin SQL nuevo');
assert(!rows.some(r=>r.kind==='tutorial'||r.kind==='cinematic'),'sin tipos de documento no permitidos');
const originalWrite=context.localStorage.setItem;
context.localStorage.setItem=()=>{throw new Error('quota');};
const blocked=fresh(); assert(!E.startTutorial(blocked,'user:blocked')); assert.equal(blocked.tutorial.status,'pending');
context.localStorage.setItem=originalWrite;

let story=fresh(), owner='user:story', controls, plays=0, saves=0;
Object.assign(story,plain(protectedData));
story.tutorial = { ...E.fresh(), status: 'skipped' }; E.mirror(story);
const make=()=>E.createCinematics({getState:()=>story,owner:()=>owner,save:()=>saves++});
let cinema=make();
const register=()=>cinema.register({id:'basement.first-crystal',title:'Primer cristal',when:s=>s.crystal===true,render:c=>{controls=c;plays++;}});
register(); assert(!cinema.trigger('basement.first-crystal')); assert.equal(plays,0);
story.crystal=true; const academicBefore=plain(protectedData);
assert(cinema.trigger('basement.first-crystal')); assert.equal(plays,1);
assert.equal(JSON.parse(memory.get('nexo-experiences-v1:user:story')).cinematics['basement.first-crystal'].status,'shown');
controls.skip(); assert.equal(cinema.archive()[0].status,'skipped'); assert(!cinema.trigger('basement.first-crystal'));
const storyHistory=plain(story.meta.experiences);
assert(cinema.replay('basement.first-crystal')); controls.finish();
assert.deepEqual(plain(story.meta.experiences),storyHistory,'repetición narrativa no cambia historial');
for(const [k,v] of Object.entries(academicBefore)) assert.deepEqual(plain(story[k]),v,'repetición conserva '+k);
story=fresh(); cinema=make(); register(); story.crystal=true;
assert(!cinema.trigger('basement.first-crystal'),'reapertura no reproduce');
assert.equal(story.tutorial.status,'skipped','narrativa conserva el historial del tutorial');
assert.throws(register,/duplicada/);
assert(saves>=2);
// Finalizar una reproducción de otra identidad no modifica la cuenta activa.
assert(cinema.replay('basement.first-crystal')); owner='user:next'; story=fresh(); controls.skip();
assert.equal(story.meta.experiences,undefined);
console.log('OK: tutorial durable, cierre/recarga, estados terminales, migración, identidades, cuota, roundtrip meta y cinemáticas independientes.');
