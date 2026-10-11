/* UPDATE 01.3 checkpoint 1 — one profile; only the window is a slot/hotspot. */
(() => {
  'use strict';
  const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
  const profiles=freeze({
    'refugio-012':{
      sceneId:'refugio-012',referenceWidth:1672,referenceHeight:941,
      backgroundAsset:'assets/home-scenes/refugio-012.png',cleanPlateAsset:null,
      layers:{background:0,ambientBack:1,modularObjects:2,mascotBack:3,mascot:4,mascotFront:5,ambientFront:6,integratedUI:7,hotspots:8},
      slots:[{id:'window',type:'window',zone:'window-area',bounds:[.045,.08,.235,.40],layer:'modularObjects',renderMode:'baked',asset:null,foregroundAsset:null,replacementReady:false}],
      hotspots:[
        {id:'window-focus',slot:'window',inset:[.04,.04,.76,.60],action:'focus-light',accessibleLabel:'Ventana: resaltar suavemente la luz de entrada'},
        // Navegación diegética: cada objeto usa el MISMO router que los botones normales (data-route).
        {id:'staff-shop',bounds:[1078/1672,292/941,62/1672,318/941],action:'route',route:'shop',accessibleLabel:'Báculo estelar: abrir la Tienda'},
        {id:'armchair-profile',bounds:[1255/1672,395/941,240/1672,280/941],action:'route',route:'profile',accessibleLabel:'Sillón: abrir tu Perfil'},
        {id:'map-logbook',bounds:[612/1672,612/941,180/1672,76/941],action:'route',route:'planner',routeSub:'grades',accessibleLabel:'Mapa enrollado: abrir la Bitácora'},
        {id:'parchment-calendar',bounds:[995/1672,278/941,105/1672,125/941],action:'route',route:'planner',routeSub:'calendar',accessibleLabel:'Pergamino de la pared: abrir el calendario'},
        {id:'bookshelf-library',bounds:[1142/1672,205/941,108/1672,370/941],action:'route',route:'learn',routeSub:'library',accessibleLabel:'Estantería: abrir la Biblioteca'},
        {id:'globe-knowledge',bounds:[705/1672,290/941,95/1672,90/941],action:'route',route:'knowledge',accessibleLabel:'Globo dorado: abrir el mapa de conocimiento'},
        {id:'desk-continue',bounds:[30/1672,430/941,205/1672,95/941],action:'continue',accessibleLabel:'Escritorio: continuar estudiando'}
      ],
      mascotAnchors:{
        desk:{zone:'desk-area',bounds:[.025,.46,.345,.18],point:[.205,.55],layer:'mascot',active:true,seat:{width:.12,foot:.89}},
        window:{zone:'window-area',bounds:[.045,.08,.235,.40],point:[.16,.44],layer:'mascotBack',active:false},
        bookshelf:{zone:'bookshelf-area',bounds:[.34,.075,.40,.49],point:[.54,.55],layer:'mascotBack',active:false},
        rest:{zone:'rest-area',bounds:[.76,.42,.225,.33],point:[.87,.70],layer:'mascotBack',active:false}
      },
      ambientLayers:[
        {id:'floor-night',className:'home-light-layer home-floor-night',bounds:[220/1672,600/941,758/1672,341/941],depth:1},
        {id:'map',className:'home-light-layer home-map',bounds:[600/1672,600/941,200/1672,105/941],depth:1},
        {id:'staff',className:'home-light-layer home-staff',bounds:[1050/1672,285/941,120/1672,340/941],depth:1},
        {id:'staff-star',className:'home-light-layer home-staff-star',bounds:[1109.61/1672,324.5/941,28/1672,40/941],depth:1},
        // UPDATE 01.4 — enredaderas que se mecen (tools/home-leaves/build_leaves.py): fondo reconstruido + hojas.
        {id:'leaf-a-plate',className:'home-light-layer home-leaf-plate home-leaf-plate-a',bounds:[858/1672,52/941,77/1672,230/941],depth:1},
        {id:'leaf-b-plate',className:'home-light-layer home-leaf-plate home-leaf-plate-b',bounds:[930/1672,56/941,56/1672,192/941],depth:1},
        {id:'leaf-c-plate',className:'home-light-layer home-leaf-plate home-leaf-plate-c',bounds:[712/1672,36/941,78/1672,132/941],depth:1},
        {id:'leaf-d-plate',className:'home-light-layer home-leaf-plate home-leaf-plate-d',bounds:[1296/1672,116/941,90/1672,84/941],depth:1},
        {id:'leaf-a',className:'home-light-layer home-leaf home-leaf-a',bounds:[858/1672,52/941,77/1672,230/941],depth:1},
        {id:'leaf-b',className:'home-light-layer home-leaf home-leaf-b',bounds:[930/1672,56/941,56/1672,192/941],depth:1},
        {id:'leaf-c',className:'home-light-layer home-leaf home-leaf-c',bounds:[712/1672,36/941,78/1672,132/941],depth:1},
        {id:'leaf-d',className:'home-light-layer home-leaf home-leaf-d',bounds:[1296/1672,116/941,90/1672,84/941],depth:1},
        {id:'view-dawn',className:'home-light-layer home-view-dawn',bounds:[120/1672,85/941,160/1672,320/941],depth:1},
        {id:'view-dusk',className:'home-light-layer home-view-dusk',bounds:[120/1672,85/941,160/1672,320/941],depth:1},
        {id:'view-night',className:'home-light-layer home-view-night',bounds:[120/1672,85/941,160/1672,320/941],depth:1},
        {id:'foliage-back',className:'refuge-foliage',bounds:[0,0,1,1],depth:1},
        {id:'tint-dawn',className:'home-light-layer home-tint-dawn',bounds:[0,0,1,1],depth:1},
        {id:'tint-dusk',className:'home-light-layer home-tint-dusk',bounds:[0,0,1,1],depth:1},
        {id:'tint-night',className:'home-light-layer home-tint-night',bounds:[0,0,1,1],depth:1},
        {id:'lamp-glow',className:'home-light-layer home-lamp-glow',bounds:[0,0,1,1],depth:2},
        {id:'staff-glow',className:'home-light-layer home-staff-glow',bounds:[1097/1672,325/941,54/1672,54/941],depth:2},
        {id:'dust',className:'home-dust',bounds:[.05,.1,.42,.62],depth:3},
        {id:'window-tone',className:'home-window-tone',slot:'window',inset:[.025531914893617,.0375,.817021276595745,.8875],depth:2},
        {id:'light-rays',className:'refuge-light',bounds:[0,0,1,1],depth:3}
      ],
      lightingProfile:{sourceSlot:'window',driver:'NexoAmbientTime',states:['dawn','day','dusk','night'],continuous:true,feedback:{duration:600,peakBrightness:1.12}}
    },
    // 5 oct 2026 — refugio en pixel art (tools/home-pixel/build_refugio.py). 418×235 px de arte ×4.
    // Coordenadas en el mismo sistema 1672×941; por ahora solo tintes de hora (las capas animadas vienen después).
    'refugio-pixel':{
      sceneId:'refugio-pixel',referenceWidth:1672,referenceHeight:941,
      backgroundAsset:'assets/home-scenes/refugio-pixel.png',cleanPlateAsset:null,pixelArt:true,
      layers:{background:0,ambientBack:1,modularObjects:2,mascotBack:3,mascot:4,mascotFront:5,ambientFront:6,integratedUI:7,hotspots:8},
      slots:[{id:'window',type:'window',zone:'window-area',bounds:[72/1672,64/941,280/1672,344/941],layer:'modularObjects',renderMode:'baked',asset:null,foregroundAsset:null,replacementReady:false}],
      hotspots:[
        {id:'window-focus',slot:'window',inset:[.08,.06,.84,.86],action:'focus-light',accessibleLabel:'Ventana: resaltar suavemente la luz de entrada'},
        {id:'staff-shop',bounds:[1160/1672,192/941,112/1672,448/941],action:'route',route:'shop',accessibleLabel:'Báculo estelar: abrir la Tienda'},
        {id:'armchair-profile',bounds:[1264/1672,368/941,264/1672,296/941],action:'route',route:'profile',accessibleLabel:'Sillón: abrir tu Perfil'},
        {id:'map-logbook',bounds:[616/1672,620/941,176/1672,60/941],action:'route',route:'planner',routeSub:'grades',accessibleLabel:'Mapa enrollado: abrir la Bitácora'},
        {id:'parchment-calendar',bounds:[852/1672,172/941,128/1672,188/941],action:'route',route:'planner',routeSub:'calendar',accessibleLabel:'Pergamino de la pared: abrir el calendario'},
        {id:'bookshelf-library',bounds:[408/1672,64/941,272/1672,536/941],action:'route',route:'learn',routeSub:'library',accessibleLabel:'Estantería: abrir la Biblioteca'},
        {id:'globe-knowledge',bounds:[744/1672,328/941,104/1672,128/941],action:'route',route:'knowledge',accessibleLabel:'Globo dorado: abrir el mapa de conocimiento'},
        {id:'desk-continue',bounds:[8/1672,416/941,392/1672,84/941],action:'continue',accessibleLabel:'Escritorio: continuar estudiando'}
      ],
      mascotAnchors:{
        desk:{zone:'desk-area',bounds:[.005,.44,.235,.10],point:[.13,.475],layer:'mascot',active:true,seat:{width:.12,foot:.89}},
        window:{zone:'window-area',bounds:[.043,.068,.168,.366],point:[.12,.41],layer:'mascotBack',active:false},
        bookshelf:{zone:'bookshelf-area',bounds:[.43,.30,.17,.20],point:[.555,.48],layer:'mascotBack',active:false},
        rest:{zone:'rest-area',bounds:[.76,.40,.21,.32],point:[.87,.70],layer:'mascotBack',active:false}
      },
      ambientLayers:[
        {id:'tint-dawn',className:'home-light-layer home-tint-dawn',bounds:[0,0,1,1],depth:1},
        {id:'tint-dusk',className:'home-light-layer home-tint-dusk',bounds:[0,0,1,1],depth:1},
        {id:'tint-night',className:'home-light-layer home-tint-night',bounds:[0,0,1,1],depth:1}
      ],
      lightingProfile:{sourceSlot:'window',driver:'NexoAmbientTime',states:['dawn','day','dusk','night'],continuous:true,feedback:{duration:600,peakBrightness:1.12}}
    }
  });
  // ?scene=refugio-012 abre el arte anterior (respaldo).
  const requestedScene=typeof location!=='undefined'?new URLSearchParams(location.search).get('scene'):null;
  const defaultSceneId=requestedScene&&profiles[requestedScene]?requestedScene:'refugio-pixel';
  function getProfile(id=defaultSceneId) {
    if(!profiles[id])throw new Error('Unknown home scene profile: '+id);
    return profiles[id];
  }
  const geometry=b=>`left:${b[0]*100}%;top:${b[1]*100}%;width:${b[2]*100}%;height:${b[3]*100}%;`;
  function ambientBounds(profile,layer) {
    if(!layer.slot)return layer.bounds;
    const slot=profile.slots.find(item=>item.id===layer.slot);
    const [x,y,w,h]=slot.bounds,[ix,iy,iw,ih]=layer.inset;
    return [x+w*ix,y+h*iy,w*iw,h*ih];
  }
  function replacementReady(profile,slot) {
    return slot.renderMode==='modular'&&slot.replacementReady===true&&Boolean(profile.cleanPlateAsset&&slot.asset);
  }
  function debugEnabled() {return new URLSearchParams(location.search).get('debugScene')==='true';}
  function render(profile=getProfile()) {
    const debug=debugEnabled();
    const ambient=profile.ambientLayers.map(layer=>`<div class="${layer.className} scene-ambient-layer" data-ambient-layer="${layer.id}" style="${geometry(ambientBounds(profile,layer))}--scene-depth:${layer.depth}" aria-hidden="true"></div>`).join('');
    const slots=profile.slots.map(slot=>{
      const ready=replacementReady(profile,slot);
      // A replacement is never painted over an object still baked in the base.
      const image=ready?`<img src="${slot.asset}" alt="" class="scene-object-image">`:'';
      const foreground=ready&&slot.foregroundAsset?`<span class="scene-slot" style="${geometry(slot.bounds)}--scene-depth:${profile.layers.mascotFront}" aria-hidden="true"><img src="${slot.foregroundAsset}" alt="" class="scene-object-foreground"></span>`:'';
      return `<span class="scene-slot" data-scene-slot="${slot.id}" data-replacement-ready="${ready}" style="${geometry(slot.bounds)}--scene-depth:${profile.layers[slot.layer]}" aria-hidden="true">${image}${debug?`<small class="scene-debug-label">slot · ${slot.id} · ${slot.renderMode}</small>`:''}</span>${foreground}`;
    }).join('');
    const hotspots=profile.hotspots.map(h=>{
      const route=h.action==='route'?` data-route="${h.route}"${h.routeSub?` data-route-sub="${h.routeSub}"`:''}`:'';
      const slotRef=h.slot?` data-scene-slot-ref="${h.slot}"`:'';
      return `<button type="button" class="scene-hotspot" data-scene-hotspot="${h.id}" data-scene-action="${h.action}"${slotRef}${route} style="${geometry(ambientBounds(profile,h))}--scene-depth:${profile.layers.hotspots}" aria-label="${h.accessibleLabel}" title="${h.accessibleLabel.split(':')[0]}">${debug?`<small class="scene-debug-label">hotspot · ${h.id}</small>`:''}</button>`;
    }).join('');
    const anchors=debug?Object.entries(profile.mascotAnchors).map(([id,a])=>`<span class="scene-debug-anchor" style="left:${a.point[0]*100}%;top:${a.point[1]*100}%" aria-hidden="true"><small>${id}</small></span>`).join(''):'';
    return {markup:ambient+slots+hotspots+anchors,debug,backgroundAsset:profile.cleanPlateAsset||profile.backgroundAsset};
  }
  function legacyContract(profile=getProfile()) {
    const desk=profile.mascotAnchors.desk;
    const anchors=Object.fromEntries(Object.entries(profile.mascotAnchors).map(([id,a])=>[id==='rest'?'rest-area':id,{...a,selector:`[data-scene-zone="${a.zone}"]`}]));
    return freeze({artSize:[profile.referenceWidth,profile.referenceHeight],layers:{...profile.layers,scene:profile.layers.modularObjects,interactive:profile.layers.hotspots},currentSeat:{zone:desk.zone,x:desk.point[0],y:desk.point[1],...desk.seat},anchors});
  }
  let pulse=null;
  function cleanup() {pulse?.cancel();pulse=null;}
  function activate(id,root,profile=getProfile()) {
    const hotspot=profile.hotspots.find(item=>item.id===id);
    if(hotspot?.action==='continue') {
      // Reutiliza el destino del botón "Abrir mapa de preparación": no se duplica la lógica.
      root.querySelector('.continue-volume .primary-btn')?.click();
      return true;
    }
    if(!hotspot||hotspot.action!=='focus-light')return false;
    cleanup();
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('reduce-motion')||document.body.dataset.nexoAmbientMotion==='reduced')return true;
    const tone=root.querySelector('[data-ambient-layer="window-tone"]');
    if(!tone?.animate)return true;
    const feedback=profile.lightingProfile.feedback;
    pulse=tone.animate([{filter:'brightness(1)'},{filter:`brightness(${feedback.peakBrightness})`,offset:.5},{filter:'brightness(1)'}],{duration:feedback.duration,easing:'ease-in-out'});
    const active=pulse;
    active.finished.then(()=>{if(pulse===active)pulse=null;}).catch(()=>{});
    return true;
  }
  // Móvil: la sala es más ancha que la pantalla y se desliza de lado (CSS en update01.css).
  // Parte mostrando el escritorio y la mascota; el aviso "Desliza" se oculta al primer deslizamiento.
  function enhancePan(root) {
    const pan=root?.querySelector('.home-pan');
    if(!pan)return;
    const hint=root.querySelector('.home-pan-hint');
    const update=()=>{
      const max=pan.scrollWidth-pan.clientWidth;
      pan.dataset.pan=max<=2?'none':pan.scrollLeft<4?'start':pan.scrollLeft>max-4?'end':'mid';
      if(hint)hint.dataset.visible=String(max>2&&pan.dataset.pan==='start'&&!pan.dataset.touched);
    };
    pan.scrollLeft=0;
    pan.addEventListener('scroll',()=>{if(pan.scrollLeft>4)pan.dataset.touched='1';update();},{passive:true});
    update();
  }
  if(typeof matchMedia==='function')matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',cleanup);
  if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden)cleanup();});
  window.NexoHomeScene=Object.freeze({profiles,getProfile,ambientBounds,replacementReady,render,legacyContract,activate,cleanup,enhancePan});
})();
