/* node tools/tutorial-e2e.cjs — navegador real, incluida activación automática (webdriver sin ocultar). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../dist');
const server = http.createServer((req,res) => {
  const pathname = new URL(req.url,'http://localhost').pathname;
  const file = path.resolve(root, '.'+(pathname==='/'?'/index.html':decodeURIComponent(pathname)));
  if (!file.startsWith(root+path.sep)) return res.writeHead(403).end();
  fs.readFile(file,(err,data) => { if(err) return res.writeHead(404).end();
    const type = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.json':'application/json'};
    res.writeHead(200,{'Content-Type':type[path.extname(file)]||'application/octet-stream'}).end(data);
  });
});
let browser; const passed=[], errors=[];
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}/`;
  browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
  const create=async(viewport={width:1440,height:900})=>{
    const ctx=await browser.newContext({viewport,reducedMotion:'reduce'});
    ctx.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
    await ctx.route('**/*', route=>route.request().url().startsWith(url)?route.continue():route.abort());
    // Sin servicios externos: la configuración y el clima no intervienen en el tutorial.
    await ctx.route('**/config.js?*', route=>route.fulfill({contentType:'application/javascript',body:'window.NEXO_PUBLIC_CONFIG = {};'}));
    await ctx.addInitScript(()=>{if(location.protocol==='http:') localStorage.setItem('nexo.tutorial.mute','1');});
    return ctx;
  };
  const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('nexo-study-beta')));
  const noTutorial=async page=>{await page.waitForFunction(()=>document.querySelector('#app')?.dataset.renderedRoute && !location.hash.startsWith('#/tutorial'));assert.equal(await page.locator('.tut').count(),0);};
  const endTutorial=async page=>{
    // Recorrer controles reales, incluidos huevos, nombre, escenas y recorrido por módulos.
    for(let i=0;i<160;i++) {
      if (!await page.locator('.tut').count() && !await page.locator('.rec-box').count()) {
        if (await page.evaluate(()=>!location.hash.startsWith('#/tutorial') && !window.NexoRecorrido?.active)) return;
        await page.waitForFunction(()=>document.querySelector('.tut,.rec-box') || (!location.hash.startsWith('#/tutorial') && !window.NexoRecorrido?.active));
        continue;
      }
      if(await page.locator('.rec-box').count()) {await page.locator('.rec-salir').click();continue;}
      if(await page.locator('.tut-eggs button').count() && !await page.locator('.tut-egg-btn.on').count()) await page.locator('.tut-eggs button').first().click();
      if(await page.locator('.tut input').count()) await page.locator('.tut input').fill('Luz');
      while(await page.locator('.tut-hot:not(:disabled):not(.seen)').count()) await page.locator('.tut-hot:not(:disabled):not(.seen)').first().click();
      const next=page.locator('.tut-next');
      await next.waitFor(); await next.waitFor({state:'visible'});
      if(await next.isEnabled()) await next.click();
      else await page.waitForTimeout(250);
      await page.waitForTimeout(80);
    }
    const diagnostic=await page.evaluate(()=>({hash:location.hash,cursor:localStorage.getItem('nexo.tutorial.v1'),replay:localStorage.getItem('nexo.tutorial.replay.v1'),scene:document.querySelector('.tut-scene')?.dataset.scene,text:document.querySelector('.tut-text')?.textContent}));
    throw new Error('El tutorial no terminó: '+JSON.stringify(diagnostic));
  };
  const ctx=await create(); let page=await ctx.newPage();
  await page.goto(url+'#/home');await page.locator('.tut').waitFor();
  assert.equal((await saved(page)).tutorial.status,'shown'); passed.push('nuevo: mostrado y guardado antes del primer cuadro');
  for(let i=0;i<3;i++){await page.reload();await noTutorial(page);} passed.push('interrumpido y tres recargas: no vuelve');
  await page.close();page=await ctx.newPage();await page.goto(url+'#/home');await noTutorial(page);passed.push('cerrar/abrir pestaña conserva historial');
  const snapshot=await saved(page);
  for(const route of ['learn','learn/course/organica','learn/course/organica/lesson/org-01','planner','profile','home','settings']) {
    await page.evaluate(r=>location.hash='#/'+r,route);await page.waitForFunction(r=>document.querySelector('#app').dataset.renderedRoute===r,route); assert.equal(await page.locator('.tut').count(),0);
  } passed.push('Refugio, Sótano, clase, organización, perfil y Ajustes: no vuelve');
  await page.getByRole('button',{name:'Repetir tutorial',exact:true}).click();await page.locator('.tut').waitFor();
  await page.locator('.tut-skip').click();await noTutorial(page);await page.reload();await noTutorial(page);
  assert.deepEqual((await saved(page)).tutorial,snapshot.tutorial);passed.push('Ajustes → repetir → salir → recargar: historial intacto');
  await page.goto(url+'#/tutorial');await noTutorial(page);passed.push('URL directa no autoriza repetición');
  // Contexto nuevo: saltar la primera reproducción.
  const skipCtx=await create({width:390,height:844}),skipPage=await skipCtx.newPage();
  await skipPage.goto(url+'#/home');await skipPage.locator('.tut').waitFor();await skipPage.getByRole('button',{name:'Saltar',exact:true}).click();await noTutorial(skipPage);
  assert.equal((await saved(skipPage)).tutorial.status,'skipped');
  await skipPage.evaluate(()=>location.hash='#/settings');await skipPage.getByRole('button',{name:'Repetir tutorial',exact:true}).click();await skipPage.locator('.tut').waitFor();await skipPage.locator('.tut-skip').click();await noTutorial(skipPage);
  await skipPage.reload();await noTutorial(skipPage);passed.push('móvil 390: saltar, repetir sin mascota elegida y recargar conserva skipped');
  // Contexto nuevo: completar toda la primera reproducción con UI real.
  const doneCtx=await create();
  await doneCtx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));
  const donePage=await doneCtx.newPage();
  await donePage.goto(url+'#/home');await donePage.locator('.tut').waitFor();await endTutorial(donePage);await noTutorial(donePage);
  assert.equal((await saved(donePage)).tutorial.status,'done');await donePage.reload();await noTutorial(donePage);passed.push('completar con UI real y recargar: no vuelve');
  const beforeReplay=await saved(donePage);
  await donePage.goto(url+'#/settings');await donePage.getByRole('button',{name:'Repetir tutorial',exact:true}).click();await donePage.locator('.tut').waitFor();await endTutorial(donePage);await noTutorial(donePage);
  const afterReplay=await saved(donePage);
  for(const key of ['tutorial','sessions','completedLessons','mastery','practice','grades','inventory','mascot','settings','coins','xp','shop']) assert.deepEqual(afterReplay[key],beforeReplay[key],'replay conserva '+key);
  passed.push('repetición completa: sin premio, reinicio ni alteración histórica');
  // Migración antigua: incluso pending con progreso no vuelve a arrancar.
  const legacyCtx=await create(),legacyPage=await legacyCtx.newPage();
  await legacyCtx.addInitScript(data=>{if(location.protocol==='http:' && !localStorage.getItem('seeded')) {localStorage.setItem('nexo-study-beta',JSON.stringify(data));localStorage.setItem('seeded','1');}},
    {...beforeReplay,tutorial:{status:'pending',rewarded:true},meta:{...beforeReplay.meta,experiences:undefined},sessions:[{id:'old-study',date:'2026-10-19',seconds:900,subject:'organica',mode:'Practicar'}]});
  await legacyPage.goto(url+'#/home');await noTutorial(legacyPage);await legacyPage.goto(url+'#/settings');
  await legacyPage.getByRole('button',{name:'Repetir tutorial',exact:true}).click();await legacyPage.locator('.tut').waitFor();await legacyPage.locator('.tut-skip').click();await noTutorial(legacyPage);
  assert.equal((await saved(legacyPage)).sessions[0].id,'old-study');assert.equal((await saved(legacyPage)).tutorial.status,'shown');passed.push('migración pending con datos conserva sesión y bloquea inicio');
  // Adaptador de cuenta simulado: ejecutar los callbacks reales de app.js con
  // caché y remoto separados, sin sesión externa ni cambios en Supabase.
  const authContext=async()=>{
    const context=await create();
    await context.addInitScript(()=>{
      let cloud;
      Object.defineProperty(window,'NexoCloud',{configurable:true,get:()=>cloud,set:value=>{
        cloud=value;value.user={id:'fake-account'};
        Object.defineProperty(value,'enabled',{value:true});
        value.save=s=>{window.__savedCloud=JSON.parse(JSON.stringify(s));};
        value.init=async callbacks=>{window.__cloudCallbacks=callbacks;await new Promise(resolve=>window.__resolveCloud=resolve);};
      }});
    });
    return context;
  };
  const authCtx=await authContext(),authPage=await authCtx.newPage();
  await authPage.goto(url+'#/home');await authPage.waitForFunction(()=>window.__cloudCallbacks);
  await authPage.evaluate(()=>window.__cloudCallbacks.onState(window.__cloudCallbacks.getDefault(),{cached:true}));
  await authPage.waitForTimeout(4200);assert.equal(await authPage.locator('.tut').count(),0);passed.push('caché pendiente y timeout no anticipan tutorial sin remoto');
  await authPage.evaluate(()=>{const remote=window.__cloudCallbacks.getDefault();remote.sessions=[{id:'remote-study',subject:'organica',date:'2026-10-19',seconds:600}];window.__cloudCallbacks.onState(remote,{cached:false});window.__resolveCloud();});
  await noTutorial(authPage);assert.equal(await authPage.evaluate(()=>window.__cloudCallbacks.getCurrent().sessions[0].id),'remote-study');passed.push('remoto tardío con progreso evita clasificar cuenta como nueva');
  // Nueva cuenta: varios callbacks iguales no remontan/reinician el tutorial.
  const newAuthCtx=await authContext(),newAuthPage=await newAuthCtx.newPage();
  await newAuthPage.goto(url+'#/home');await newAuthPage.waitForFunction(()=>window.__cloudCallbacks);
  await newAuthPage.evaluate(()=>{window.__newRemote=window.__cloudCallbacks.getDefault();window.__cloudCallbacks.onState(window.__newRemote,{cached:false});window.__resolveCloud();});
  await newAuthPage.locator('.tut').waitFor();
  await newAuthPage.evaluate(()=>{window.__tutorialRoot=document.querySelector('.tut');window.__cloudCallbacks.onState(window.__newRemote,{cached:false});window.__cloudCallbacks.onState(window.__newRemote,{cached:true});});
  assert(await newAuthPage.evaluate(()=>window.__tutorialRoot===document.querySelector('.tut')));
  await newAuthPage.getByRole('button',{name:'Saltar',exact:true}).click();await noTutorial(newAuthPage);
  await newAuthPage.evaluate(()=>{window.NexoCloud.user=null;window.__cloudCallbacks.onGuest();window.NexoCloud.user={id:'fake-account'};window.__cloudCallbacks.onState(window.__newRemote,{cached:false});});
  await noTutorial(newAuthPage);assert.equal(await newAuthPage.evaluate(()=>window.__cloudCallbacks.getCurrent().tutorial.status),'skipped');
  passed.push('cuenta nueva, callbacks duplicados y cerrar/iniciar sesión: una sola reproducción');
  // Reabrir un navegador completo conservando su almacenamiento, equivalente a cierre de aplicación.
  const storageState=await ctx.storageState();await browser.close();browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
  const reopened=await browser.newContext({storageState});const reopenedPage=await reopened.newPage();
  await reopenedPage.route('**/config.js?*',r=>r.fulfill({contentType:'application/javascript',body:'window.NEXO_PUBLIC_CONFIG = {};'}));
  await reopenedPage.goto(url+'#/home');await noTutorial(reopenedPage);passed.push('cerrar y abrir navegador completo conserva el bloqueo');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed},null,2));
})().catch(error=>{console.error(JSON.stringify({passed},null,2));console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
