const test=require('node:test'),assert=require('node:assert/strict');
global.window={};require('../dist/core/study-timer.js');
test('cronómetro usa tiempo absoluto, restaura y no duplica ticks',()=>{
 const T=window.NexoStudyTimer;
 const running={status:'running',startedAt:1000,elapsedBeforeMs:4000};
 assert.equal(T.elapsed(running,6000),9000);assert.equal(T.elapsed(running,6000),9000);
 assert.equal(T.elapsed(JSON.parse(JSON.stringify(running)),3601000),3604000);
 assert.equal(T.elapsed({status:'paused',startedAt:null,elapsedBeforeMs:9000},999999),9000);
 assert.equal(T.elapsed({...running,startedAt:7000},6000),4000);
 assert.equal(T.elapsed({status:'idle',startedAt:null,elapsedBeforeMs:0},6000),0);
});
