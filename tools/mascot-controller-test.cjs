const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const window={};
let timer=0;
for(const file of ['dist/mascot/controller.js'])
  vm.runInNewContext(fs.readFileSync(file,'utf8'),{window,Date,
    setTimeout:()=>++timer,clearTimeout:()=>{}});
const controller=window.NexoMascotController;
const mascot={species:'pig',slots:{head:'hat-beanie',back:'bag-lab'}};
const learn=controller.plan({currentMascot:mascot,currentRoom:'learn',hour:14});
assert.equal(learn.intent,'read');
assert.equal(learn.availableAnimation,'Idle');
assert.equal(learn.rigAnimationAvailable,false);
assert.equal(learn.slots.head,'hat-beanie');
assert.equal(controller.plan({currentMascot:mascot,currentRoom:'train'}).intent,'ready');
assert.equal(controller.plan({currentMascot:{species:'pig',slots:{}},currentRoom:'train'}).availableAnimation,'Ready');
assert.equal(controller.plan({currentMascot:{species:'pig',slots:{}},currentRoom:'learn'}).availableAnimation,'Read');
assert.equal(controller.plan({currentMascot:mascot,currentRoom:'home',hour:3}).intent,'sleep');
assert.equal(controller.plan({currentMascot:mascot,currentRoom:'learn',
  academicEvent:{type:'misconception_detected'}}).intent,'think');
assert.equal(controller.plan({currentMascot:mascot,currentRoom:'home',hour:15,
  ambientEvent:{room:'home',intent:'read'}}).intent,'read');
const figure={dataset:{}},root={querySelector:()=>figure};
assert.equal(controller.react({type:'misconception_detected'},root),true);
assert.equal(figure.dataset.academicEmote,'think');
assert.equal(controller.react({type:'concept_state_changed'},root),true);
assert.equal(figure.dataset.academicEmote,'spark');
controller.cleanup();
console.log('OK: intención de la mascota por habitación, hora y eventos.');
