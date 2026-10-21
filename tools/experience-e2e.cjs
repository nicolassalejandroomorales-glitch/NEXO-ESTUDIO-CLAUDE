const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');const root=path.resolve(__dirname,'../dist');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(e,data)=>{if(e)return res.writeHead(404).end();res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png'})[path.extname(file)]||'application/octet-stream'}).end(data);});});
const saved=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('nexo-study-beta')));
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const width of [1440,390]){
  const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});await ctx.route('https://**',r=>r.abort());
  await ctx.addInitScript(()=>{document.startViewTransition=undefined;if(!localStorage.getItem('nexo-study-beta'))localStorage.setItem('nexo-study-beta',JSON.stringify({version:19,tutorial:{status:'done',rewarded:true,sections:{},news:99},settings:{sound:false,music:false}}));});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
  const url=`http://127.0.0.1:${server.address().port}/`;
  await page.goto(url+'#/home');await page.locator('[data-action="timer-start"]').waitFor();
  assert.equal(await page.locator('.study-dock:visible').count(),0);
  await page.locator('[data-action="timer-start"]').click();await page.locator('.study-dock:visible').waitFor();
  const started=(await saved(page)).timer.startedAt;
  for(const route of ['planner','profile','learn','lesson/org-01/m2','lesson/org-01/m4']){
   await page.evaluate(route=>location.hash='#/'+route,route);
   if(route==='learn')await page.locator('[data-move="fwd"]').waitFor();
   else if(route.startsWith('lesson'))await page.locator('#auHost .st').waitFor();
   else await page.waitForTimeout(250);
   assert.equal(await page.locator('.study-dock:visible').count(),1,route);
   assert.equal((await saved(page)).timer.startedAt,started);
   if(route==='learn'){
    assert.equal(await page.locator('.sotano-turn:visible').count(),0,'vertical utilizable');
    if(width===390){await page.setViewportSize({width:844,height:390});await page.waitForTimeout(150);await page.setViewportSize({width:390,height:900});await page.waitForTimeout(150);assert.ok(await page.locator('[data-move="fwd"]').isVisible());}
    await page.locator('[data-move="fwd"]').click();
    await page.waitForFunction(()=>sessionStorage.getItem('nexo-sotano-parada')==='h1');
   }
  }
  assert.equal(await page.locator('.st-bubble b').first().textContent(),'Grimorio');
  assert.equal(await page.locator('.st-pet:visible').count(),0,'mascota oculta en pretest');
  const before=JSON.stringify((await saved(page)).classSessions);
  await page.evaluate(()=>window.__sameClass=document.querySelector('#auHost .st'));
  await page.locator('.study-toggle').click();
  assert.equal((await saved(page)).timer.status,'paused');
  assert.equal(await page.evaluate(()=>window.__sameClass===document.querySelector('#auHost .st')),true,'pausa no remonta la clase');
  assert.equal(JSON.stringify((await saved(page)).classSessions),before);
  const paused=(await saved(page)).timer.elapsedBeforeMs;await page.waitForTimeout(1100);
  assert.equal((await saved(page)).timer.elapsedBeforeMs,paused);
  await page.locator('.study-fold').click();assert.equal(await page.locator('.study-dock.is-folded').count(),1);
  await page.locator('.study-toggle').click();await page.reload();await page.locator('#auHost .st').waitFor();
  assert.equal((await saved(page)).timer.status,'running');assert.equal(await page.locator('.study-dock').count(),1);
  // Segunda pestaña: pausa/reanudación actualiza el mismo reloj.
  const other=await ctx.newPage();await other.goto(url+'#/planner');await other.locator('.study-dock:visible').waitFor();
  await other.locator('.study-toggle').click();await page.waitForFunction(()=>document.querySelector('.study-dock').dataset.status==='paused');
  await page.locator('.study-toggle').click();await other.waitForFunction(()=>document.querySelector('.study-dock').dataset.status==='running');
  // Cerrar y reabrir conserva la marca y sigue contando, según preferencia del usuario.
  const stamp=(await saved(page)).timer.startedAt;await page.close();await other.close();await new Promise(ok=>setTimeout(ok,1100));
  const reopened=await ctx.newPage();await reopened.goto(url+'#/lesson/org-01/m2');await reopened.locator('#auHost .au-body').waitFor();
  assert.equal((await saved(reopened)).timer.startedAt,stamp);
  const bounds=await reopened.evaluate(()=>{const d=document.querySelector('.study-dock').getBoundingClientRect(),a=document.querySelector('#auHost').getBoundingClientRect();return {dockTop:d.top,contentBottom:a.bottom,width:innerWidth,right:d.right};});
  assert.ok(bounds.contentBottom<=bounds.dockTop+1,JSON.stringify(bounds));assert.ok(bounds.right<=bounds.width);
  assert.equal(await reopened.locator('.cv-guide canvas').count(),1,'Grimorio existente reutilizado');
  assert.equal(await reopened.locator('.st-pet:visible').count(),1,'mascota acompaña la lectura');
  assert.equal((await saved(reopened)).sessions.length,0,'no registra sesiones automáticamente');
  assert.deepEqual(errors,[]);console.log(`OK ${width}: reloj global, rutas, pausa sin remontar, plegado, recarga, pestañas, reapertura, roles y vertical`);
  if(process.env.NEXO_SCREENSHOTS){
   fs.mkdirSync(process.env.NEXO_SCREENSHOTS,{recursive:true});await reopened.screenshot({path:path.join(process.env.NEXO_SCREENSHOTS,`clase-verificada-${width}.png`)});
   if(width===1440)for(const [selector,name] of [['.st-pet','mascota-actual'],['.cv-guide canvas','grimorio-actual']]){const data=await reopened.locator(selector).evaluate(c=>c.toDataURL('image/png'));fs.writeFileSync(path.join(process.env.NEXO_SCREENSHOTS,name+'.png'),Buffer.from(data.split(',')[1],'base64'));}
  }
  // Tutorial voluntario y pantalla completa no ocultan ni reinician el reloj.
  await reopened.evaluate(()=>location.hash='#/settings');await reopened.getByRole('button',{name:'Repetir tutorial',exact:true}).click();await reopened.locator('.tut').waitFor();
  await reopened.evaluate(()=>window.__sameTutorial=document.querySelector('.tut'));
  await reopened.locator('.study-toggle').click();assert.equal((await saved(reopened)).timer.status,'paused');
  assert.ok(await reopened.evaluate(()=>window.__sameTutorial===document.querySelector('.tut')));
  await reopened.locator('.tut-skip').click();await reopened.locator('[data-action="timer-start"]').waitFor();
  if(width===390)await reopened.getByRole('button',{name:'Ocultar reloj',exact:true}).click();
  await reopened.locator('.nav-btn[data-route="learn"]:visible').first().click();await reopened.locator('[data-move="fwd"]').waitFor();
  assert.ok(await reopened.locator('.study-dock').isVisible());
  assert.ok(await reopened.evaluate(()=>!document.fullscreenElement || document.fullscreenElement.contains(document.querySelector('.study-dock'))));
  await reopened.locator('[data-s="exit"]').click();await reopened.locator('[data-action="timer-start"]').waitFor({state:'attached'});
  assert.equal(await reopened.locator('.tut').count(),0);
  console.log(`OK ${width}: tutorial repetido sin interrumpir reloj; indicador en fullscreen y salida`);
  const hintedId=await reopened.evaluate(()=>{
   const data=JSON.parse(localStorage.getItem('nexo-study-beta')),cls=window.NexoClasses['org-01'];
   const s=window.NexoClassroom.sessionFor({getState:()=>data},cls.id);s.path='misiones';s.mission='m2';
   const beats=window.NexoClassroom.beats(cls,s),at=beats.findIndex(b=>b.kind==='question'&&b.stage==='practice'&&b.item.hint&&!s.answers[b.item.id]);
   if(at<0)throw Error('No hay práctica real con pista');s.beat=at;s.far.m2=at;const id=beats[at].item.id;delete s.hints[id];localStorage.setItem('nexo-study-beta',JSON.stringify(data));return id;
  });
  await reopened.goto(url+'?hints=1#/lesson/org-01/m2');await reopened.locator('[data-grimorio-hint]').waitFor();
  await reopened.locator('.st-pet').click();assert.ok(!(await saved(reopened)).classSessions['org-01'].hints[hintedId],'mascota no ofrece ayuda académica');
  await reopened.locator('[data-grimorio-hint]').click();
  await reopened.waitForFunction(id=>JSON.parse(localStorage.getItem('nexo-study-beta')).classSessions['org-01'].hints[id]===true,hintedId);
  console.log(`OK ${width}: pista voluntaria del Grimorio conserva marca de ayuda; mascota no altera ejercicio`);
  await ctx.close();
 }}finally{await browser.close();await new Promise(ok=>server.close(ok));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
