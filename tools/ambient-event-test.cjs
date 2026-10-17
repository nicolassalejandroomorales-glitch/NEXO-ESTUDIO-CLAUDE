const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const listeners={};let activeIntervals=0;
const document={hidden:false,body:{dataset:{}},addEventListener(name,fn){listeners[name]=fn;},
  removeEventListener(name){delete listeners[name];}};
const window={};
vm.runInNewContext(fs.readFileSync('dist/ambient/events.js','utf8'),{
  window,document,Date,Math,Number,String,Object,
  setInterval:()=>{activeIntervals++;return 1;},clearInterval:()=>{activeIntervals--;}
});
const events=window.NexoAmbientEvents;
const at=new Date('2026-09-28T14:00:00-03:00');
const first=events.select({at,room:'learn',profileId:'nicolas'});
assert.deepEqual(events.select({at,room:'learn',profileId:'nicolas'}),first);
assert(['book','ink'].includes(first.prop));
assert.equal(events.select({at:new Date('2026-09-28T02:00:00-03:00'),room:'profile'}).intent,'sleep');
const applied=events.apply('home','nicolas',at);
assert.equal(document.body.dataset.nexoAmbientEvent,applied.prop);
assert.equal(document.body.dataset.nexoMascotActivity,applied.intent);
events.start();events.start();assert.equal(activeIntervals,1);
events.dispose();assert.equal(activeIntervals,0);assert.equal(listeners.visibilitychange,undefined);
console.log('Eventos ambientales: selección estable, contexto, noche y lifecycle OK');
