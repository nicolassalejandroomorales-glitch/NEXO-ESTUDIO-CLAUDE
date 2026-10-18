/* Context decisions only. Actual artboard animation remains Idle until the rig supports named states. */
(() => {
  'use strict';
  const intents={home:'idle',learn:'read',games:'play',profile:'rest',shop:'preview',planner:'watch'};
  const props={home:'window',learn:'book',games:null,profile:'cushion',shop:null,planner:'calendar'};
  let effectTimer=null;
  const roomOf=input=>typeof input==='string'?input:input?.id||'home';
  function plan({currentMascot={},currentEquipment={},currentRoom='home',currentActivity='',academicEvent=null,ambientEvent=null,
    hour=new Date().getHours()}={}) {
    const room=roomOf(currentRoom);
    const slots={...(currentMascot.slots||{}),...currentEquipment};
    const defaultIntent=intents[room]||'idle';
    const quiet=room==='home'&&hour>=0&&hour<6;
    const eventKind=academicEvent?.type||'';
    const eventIntent=eventKind==='concept_state_changed'&&academicEvent?.payload?.state==='retained'
      ?'celebrate':eventKind==='misconception_detected'?'think':null;
    const ambientIntent=ambientEvent?.room===room&&['read','watch','rest','sleep','ready','play','think'].includes(ambientEvent.intent)
      ?ambientEvent.intent:null;
    const intent=eventIntent||((currentActivity==='review'&&room==='learn')?'think':quiet?'sleep':ambientIntent||defaultIntent);
    const species=currentMascot.species||'pig';
    const equipped=['head','face','shirt','back','tail','aura','main_hand','off_hand'].some(slot=>Boolean(slots[slot]));
    const rigAnimationAvailable=species==='pig'&&!equipped;
    const availableAnimation=rigAnimationAvailable?(intent==='read'||intent==='think'?'Read':intent==='ready'?'Ready':'Idle'):'Idle';
    return Object.freeze({species,room,intent,
      desiredAnimation:intent,availableAnimation,rigAnimationAvailable,
      ambientProp:props[room]||null,slots:Object.freeze(slots),
      emote:eventIntent?'brief':null,animationPack:null});
  }
  function react(event,root=document) {
    const kind=event?.type==='misconception_detected'?'think':
      event?.type==='concept_state_changed'?'spark':null;
    if(!kind)return false;
    const figure=root.querySelector('.avatar-shell-v10:not(.mini)')
      ||document.getElementById('companionPresence')?.querySelector('.avatar-shell-v10:not(.mini)');
    if(!figure)return false;
    clearTimeout(effectTimer);
    figure.dataset.academicEmote=kind;
    effectTimer=setTimeout(()=>{delete figure.dataset.academicEmote;effectTimer=null;},1600);
    return true;
  }
  function cleanup(){clearTimeout(effectTimer);effectTimer=null;}
  window.NexoMascotController=Object.freeze({plan,intents,react,cleanup});
})();
