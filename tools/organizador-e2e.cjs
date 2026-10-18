// Flujos reales del organizador en navegador aislado; no usa el perfil ni los datos del usuario.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const {chromium} = require('playwright');
const dist = path.resolve(__dirname,'../dist');
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json','.wasm':'application/wasm','.svg':'image/svg+xml'};
const server = http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(dist,'.'+(name==='/'?'/index.html':name));
if(!file.startsWith(dist+path.sep))return res.writeHead(403).end();fs.readFile(file,(e,b)=>e?res.writeHead(404).end():res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(b));});
(async()=>{
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
const origin=`http://127.0.0.1:${server.address().port}/`, out=process.env.NEXO_CAPTURE_DIR || path.resolve(__dirname,'../work/organizador-e2e');fs.mkdirSync(out,{recursive:true});
try {for(const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:960}}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{if(!localStorage.getItem('nexo-study-beta'))localStorage.setItem('nexo-study-beta',JSON.stringify({version:19,tutorial:{status:'done',rewarded:true,sections:{},news:99}}));});
  await page.clock.setFixedTime(new Date('2026-10-17T09:00:00'));
  const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nexo-study-beta')));
  const saved=()=>page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('nexo-study-beta'));return s?.events?.some(e=>e.title==='Turno en farmacia');});
  const overflow=()=>page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  await page.goto(origin+'#/planner/calendario');await page.locator('[data-cal-add]').click();
  const form=page.locator('.cal-form'); await form.waitFor();
  await page.waitForFunction(()=>document.activeElement?.name==='title');
  await page.locator('[data-agenda-type="work"]').click();
  await form.locator('[name=title]').fill('Turno en farmacia');await form.locator('[name=date]').fill('2026-10-19');
  await form.locator('[name=time]').fill('17:00');await form.locator('[name=endTime]').fill('16:00');
  await form.locator('[name=weekly]').check();await form.locator('[name=repeatCount]').fill('3');
  await form.locator('[type=submit]').click();assert.match(await form.locator('.agenda-error').innerText(),/posterior/);
  await form.locator('[name=endTime]').fill('19:00');
  await page.locator('.agenda-body').evaluate(el=>{el.scrollTop=0;});
  await page.screenshot({path:path.join(out,`editor-${width}.png`)});
  assert.ok(await overflow()<=1,'editor sin desborde horizontal');
  await form.locator('[type=submit]').click();await page.locator('.agenda-overlay').waitFor({state:'detached'});await saved();
  let state=await read();let turns=state.events.filter(e=>e.title==='Turno en farmacia');assert.equal(turns.length,3);assert.ok(turns.every(e=>e.subject==='personal'&&e.endTime==='19:00'));
  await page.reload();await page.locator('.mes-dias').waitFor();state=await read();assert.equal(state.events.filter(e=>e.title==='Turno en farmacia').length,3);
  await page.locator('[data-cal-availability]').click();const av=page.locator('[data-availability-form]');await av.waitFor();
  await av.locator('[name=from-1-0]').fill('17:00');await av.locator('[name=to-1-0]').fill('21:00');await av.locator('[name=minutes-1]').fill('120');
  await page.screenshot({path:path.join(out,`horarios-${width}.png`)});
  await av.locator('[type=submit]').click();await page.locator('.agenda-overlay').waitFor({state:'detached'});
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('nexo-study-beta'))?.organization?.availability?.[1]?.[0]?.start==='17:00');
  await page.locator('[data-cal-sem="1"]').click();
  const monday=page.locator('[data-cal-drop="2026-10-19"]');await monday.waitFor();
  const placements=await monday.locator('.sem-bloque time').allTextContents();assert.ok(placements.length>0);
  for(const value of placements){const [from,to]=value.split('–');assert.ok(from>='19:00'&&to<='21:00',`no pisa el trabajo: ${value}`);}
  await page.locator('.semana-vista').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`semana-${width}.png`)});
  assert.ok(await overflow()<=1,'semana sin desborde');
  // Editar solo una ocasión conserva la serie y sus hermanos.
  await page.locator('[data-cal-day="2026-10-19"]').first().click();
  const turn=page.locator('.evento').filter({hasText:'Turno en farmacia'});await turn.locator('[data-cal-editar]').click();
  await page.locator('.cal-form [name=title]').fill('Turno ajustado');await page.locator('.cal-form [type=submit]').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('nexo-study-beta')).events.some(e=>e.title==='Turno ajustado'));
  state=await read();assert.equal(state.events.filter(e=>e.title==='Turno en farmacia').length,2);
  // Cambiar la evaluación conserva historial; recarga vuelve a calcular los mismos espacios.
  const exam=page.locator('.evento').filter({hasText:'Control 1'}).first();await exam.locator('.ev-mover input').fill('2026-10-20');await exam.locator('.ev-mover button').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('nexo-study-beta')).events.some(e=>e.id==='official-ana-c1'&&e.date==='2026-10-20'));
  state=await read();assert.ok(state.events.find(e=>e.id==='official-ana-c1').dateHistory.length);
  const edited=page.locator('.evento').filter({hasText:'Turno ajustado'});await edited.locator('[data-delete-scope]').selectOption('following');
  await edited.locator('[data-cal-borrar]').click();
  await page.waitForFunction(()=>!JSON.parse(localStorage.getItem('nexo-study-beta')).events.some(e=>e.title.startsWith('Turno')));
  await page.locator('#toast button').click();await saved();assert.equal((await read()).events.filter(e=>e.title.startsWith('Turno')).length,3,'deshacer devuelve la serie');
  // Teclado: Escape cierra la hoja de evento y devuelve el foco a Agregar.
  await page.locator('[data-cal-cerrar]').click();
  const [ics]=await Promise.all([page.waitForEvent('download'),page.locator('[data-cal-ics]').click()]);
  const exported=fs.readFileSync(await ics.path(),'utf8');assert.match(exported,/DTEND:20261019T190000/);assert.match(exported,/Vida personal y trabajo/);
  await page.locator('[data-cal-add]').click();await page.locator('.cal-form [type=submit]').focus();await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement?.hasAttribute('data-cal-cancel')),true,'el foco permanece en la hoja');
  await page.locator('.cal-form [name=title]').press('Escape');
  assert.equal(await page.locator('.agenda-overlay').count(),0);
  assert.equal(await page.evaluate(()=>document.activeElement?.hasAttribute('data-cal-add')),true);
  await page.goto(origin+'#/planner/hoy');await page.locator('.today-capacity').waitFor();assert.ok(await overflow()<=1);
  await page.goto(origin+'#/profile/settings');
  const [backup]=await Promise.all([page.waitForEvent('download'),page.locator('[data-action=export-data]').click()]);
  const portable=JSON.parse(fs.readFileSync(await backup.path(),'utf8'));assert.equal(portable.events.filter(e=>e.title.startsWith('Turno')).length,3);assert.equal(portable.organization.availability[1][0].start,'17:00');
  assert.deepEqual(errors,[],'sin errores JavaScript');await page.close();
  console.log(`Organizador E2E ${width}: crear, validar, repetir, editar, mover, guardar, horarios, teclado y layout OK.`);
}}finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);server.close();process.exit(1);});
