/* Deterministic, lightweight environmental moments. No timer per room. */
(() => {
  'use strict';
  const scenes=Object.freeze({
    home:[['leaves','watch'],['book','read'],['lamp','rest']],
    learn:[['book','read'],['ink','think']],
    games:[['spark','play']],
    profile:[['lamp','rest'],['book','read'],['sleep','sleep']],
    shop:[['spark','preview']],
    planner:[['ink','watch'],['book','read']]
  });
  let current=null,interval=null,profile='local',room='home';
  function hash(value) {let out=2166136261;for(const char of String(value)){
    out^=char.charCodeAt(0);out=Math.imul(out,16777619);
  }return out>>>0;}
  function localDay(at) {return `${at.getFullYear()}-${String(at.getMonth()+1).padStart(2,'0')}-${String(at.getDate()).padStart(2,'0')}`;}
  function select({at=new Date(),room:requested='home',profileId='local'}={}) {
    const variants=scenes[requested]||scenes.home;
    const block=Math.floor(at.getHours()/3);
    const [prop,intent]=variants[hash(`${localDay(at)}|${requested}|${profileId}|${block}`)%variants.length];
    const night=at.getHours()<6||at.getHours()>=22;
    if(night&&['home','profile'].includes(requested))return {room:requested,prop:'sleep',intent:'sleep',block};
    return {room:requested,prop,intent,block};
  }
  function apply(nextRoom=room,profileId=profile,at=new Date()) {
    room=nextRoom;profile=profileId;
    current=select({at,room,profileId});
    document.body.dataset.nexoAmbientEvent=current.prop;
    document.body.dataset.nexoMascotActivity=current.intent;
    return current;
  }
  function refresh() {if(!document.hidden)apply(room,profile);}
  function start() {
    if(interval)return;
    interval=setInterval(refresh,300000);
    document.addEventListener('visibilitychange',refresh);
  }
  function dispose() {
    if(interval)clearInterval(interval);interval=null;
    document.removeEventListener('visibilitychange',refresh);
    current=null;
  }
  window.NexoAmbientEvents=Object.freeze({scenes,select,apply,start,dispose,get current(){return current;}});
})();
