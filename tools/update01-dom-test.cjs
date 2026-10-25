/* Actual app scripts and DOM routing; this is NOT browser layout or pixel evidence. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const dist=path.resolve(__dirname,'../dist');
const errors=[];
class LocalResources extends ResourceLoader {
 fetch(url) {
  const parsed=new URL(url);
  if(parsed.hostname!=='nexo.test')return null;
  const file=path.resolve(dist,'.'+parsed.pathname);
  if(!file.startsWith(dist+path.sep))return null;
  return fs.existsSync(file)?Promise.resolve(fs.readFileSync(file)):null;
 }
}
const until=async check=>{for(let attempt=0;attempt<100;attempt++){if(check())return;await new Promise(resolve=>setTimeout(resolve,20));}throw Error('DOM wait timeout');};
(async()=>{
 const vc=new VirtualConsole();vc.on('jsdomError',error=>{if(!/Not implemented: navigation|Not implemented: window.scrollTo/.test(error.message))errors.push(error.message);});
 const dom=new JSDOM(fs.readFileSync(path.join(dist,'index.html'),'utf8'),{
  url:'http://nexo.test/#/home',resources:new LocalResources(),runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,
  beforeParse(window){
   window.matchMedia=query=>({matches:query.includes('reduce'),addEventListener(){},removeEventListener(){}});
   window.scrollTo=()=>{};window.HTMLElement.prototype.scrollIntoView=()=>{};
   window.structuredClone=structuredClone;window.fetch=async()=>({ok:false,json:async()=>({}),text:async()=>''});
   const ctx=new Proxy({measureText:()=>({width:0}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(object,key)=>object[key]||(()=>{})});
   window.HTMLCanvasElement.prototype.getContext=()=>ctx;
   window.IntersectionObserver=class{observe(){}disconnect(){}};
   window.ResizeObserver=class{observe(){}disconnect(){}};
  }
 });
 const w=dom.window,d=w.document;
 const route=async target=>{w.location.hash='#/'+target;await until(()=>d.querySelector('#app')?.dataset.renderedRoute===target);};
 try{
  await until(()=>d.querySelector('.refuge'));
  assert.equal(d.querySelectorAll('.refuge .evaluation-board').length,1);
  assert.ok(d.querySelector('.home-side .home-clock'),'el reloj vive en la columna derecha');
  assert.ok(d.querySelector('.home-calendar .cal-day.is-today'),'el calendario marca hoy');
  assert.equal(d.querySelectorAll('.home-grades .grade-chip').length,4,'una chapa de calificación por ramo');
  assert.equal(d.querySelectorAll('.refuge-signs,.sign,.refuge-caption').length,0,'sin carteles colgados ni pie');
  assert.ok(d.querySelector('.hc-continue').textContent.length>0,'Continuar nombra el ramo');
  const stored=()=>JSON.parse(w.localStorage.getItem('nexo-study-beta'));
  const immutableKeys=['mastery','organicProgress','completedLessons','events','grades','documents','inventory','mascot'];
  const academicBefore=Object.fromEntries(immutableKeys.map(key=>[key,stored()?.[key]]));
  d.querySelector('.rail-nav [data-route="learn"]').click();
  await until(()=>d.querySelector('.sotano'));
  assert.equal(d.querySelector('.sotano-title').textContent,'Sótano de los Cristales');
  assert.equal(d.querySelector('#app').dataset.worldTransition,'book-first');
  await route('learn/course/organica');
  await until(()=>d.querySelector('.grimoire-evaluations'));
  assert.equal(d.querySelector('#app').dataset.renderedRoute,'learn/course/organica');
  d.querySelector('.evaluation-chapter').click();
  await until(()=>d.querySelector('.preparation-map'));
  assert.equal(d.querySelectorAll('.preparation-node').length,5);
  assert.ok(d.querySelector('.preparation-path path').getAttribute('d').includes('C'));
  d.querySelector('.preparation-node').click();
  await until(()=>d.querySelector('.preparation-detail'));
  assert.ok(d.querySelector('.preparation-detail').textContent.includes('próximamente'));
  assert.equal(d.querySelector('.preparation-detail [data-open-lesson]').dataset.openLesson,'org-01');
  await route('learn/course/analitica');
  assert.equal(d.body.dataset.nexoCourse,'analitica');
  await route('learn/course/fisio');
  assert.equal(d.body.dataset.nexoCourse,'fisio');
  await route('learn/course/fisico/evaluation/event-official-fq-c1');
  assert.ok(d.querySelector('.preparation-empty').textContent.includes('Temario por vincular'));
  assert.equal(d.querySelectorAll('.preparation-node').length,0);
  await route('learn/course/fisico/evaluation/missing');
  assert.ok(d.querySelector('.grimoire-evaluations'));
  await route('learn/course/missing');await until(()=>d.querySelector('.sotano'));
  await route('subject/organica');assert.ok(d.querySelector('[data-open-lesson="org-01"]'));
  await route('home');assert.equal(d.querySelector('#app').dataset.worldTransition,'book-close');
  await route('learn');assert.equal(d.querySelector('#app').dataset.worldTransition,'book-return');
  for(const [time,hour] of [['morning',8],['day',14],['dusk',18],['night',23]]){
   w.NexoAmbientTime.update(new w.Date(2026,9,1,hour));assert.equal(d.body.dataset.nexoTime,time);
  }
  await route('home');
  d.querySelector('.continue-volume[data-grimoire-route]').click();
  await until(()=>d.querySelector('.preparation-map'));
  assert.ok(d.querySelectorAll('.preparation-node').length>0,'Continuar abre un mapa real');
  const academicAfter=Object.fromEntries(immutableKeys.map(key=>[key,stored()?.[key]]));
  assert.deepEqual(academicAfter,academicBefore,'Recorrer mapas no altera registros académicos');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('UPDATE01 DOM: Inicio → ramo → evaluación → mapa → detalle; 4 temas; controles/invalid routes/legado; ambiente; primera/reapertura/cierre; datos intactos; 0 errores JS. Layout no verificado.');
 }finally{dom.window.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
