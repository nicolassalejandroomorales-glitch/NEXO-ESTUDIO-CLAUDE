const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const out=path.resolve('tmp/update01');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const dist=path.resolve('dist');
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.wasm':'application/wasm'};
 const server=http.createServer((request,response)=>{
  const pathname=new URL(request.url,'http://localhost').pathname;
  const file=path.resolve(dist,'.'+(pathname==='/'?'/index.html':decodeURIComponent(pathname)));
  if(!file.startsWith(dist+path.sep)){response.writeHead(403).end();return;}
  fs.readFile(file,(error,data)=>error?response.writeHead(404).end():response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(data));
 });
 let browser;
 try {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||chromium.executablePath(),args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage({viewport:{width:1440,height:1000},timezoneId:'America/Santiago'});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const base=`http://127.0.0.1:${server.address().port}/`;
  await page.goto(base+'#/home');await page.locator('.refuge').waitFor();
  const data=()=>page.evaluate(()=>{const state=JSON.parse(localStorage.getItem('nexo-study-beta'));return {events:state.events,mastery:state.mastery,organicProgress:state.organicProgress,documents:state.documents,mascot:state.mascot,inventory:state.inventory};});
  const before=await data();
  await page.locator('.rail-nav [data-route="learn"]').click();await page.locator('.sotano').waitFor();
  assert.equal(await page.locator('#app').getAttribute('data-world-transition'),'book-first');
  await page.goto(base+'#/learn/course/organica');await page.locator('.grimoire-evaluations').waitFor();
  await page.locator('.evaluation-chapter').first().click();await page.locator('.preparation-map').waitFor();
  assert.equal(await page.locator('.preparation-node').count(),5);
  await page.locator('.preparation-node').first().click();await page.locator('.preparation-detail').waitFor();
  assert.match(await page.locator('.preparation-detail').textContent(),/próximamente/);
  await page.locator('.grimoire-wayfinding [data-route="home"]').click();await page.locator('.refuge').waitFor();
  assert.equal(await page.locator('#app').getAttribute('data-world-transition'),'book-close');
  await page.locator('.rail-nav [data-route="learn"]').click();await page.locator('.sotano').waitFor();
  assert.equal(await page.locator('#app').getAttribute('data-world-transition'),'book-return');
  const routes=['home','learn','learn/course/organica','learn/course/organica/evaluation/pep-1','learn/course/organica/evaluation/pep-1/org-01','learn/course/fisio','learn/course/fisico/evaluation/event-official-fq-c1'];
  for(const viewport of [{width:375,height:812},{width:390,height:844},{width:768,height:1024},{width:1440,height:1000},{width:844,height:390}]){
   await page.setViewportSize(viewport);
   for(const route of routes){
    await page.goto(base+'#/'+route);await page.locator(route==='home'?'.refuge':route==='learn'?'.sotano':'.grimoire').waitFor();await page.waitForTimeout(700);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} overflow at ${viewport.width}`);
    const overlaps=await page.locator('.preparation-node').evaluateAll(nodes=>nodes.slice(1).some((node,index)=>nodes[index].getBoundingClientRect().bottom>node.getBoundingClientRect().top));
    assert.equal(overlaps,false,'Map nodes overlap');
    await page.screenshot({path:path.join(out,`${viewport.width}-${route.replaceAll('/','-')}.png`),fullPage:true});
   }
  }
  for(const hour of [8,14,18,23]){
   await page.goto(base+'#/home');await page.locator('.refuge').waitFor();
   await page.evaluate(hour=>NexoAmbientTime.update(new Date(2026,9,1,hour)),hour);
   await page.screenshot({path:path.join(out,`home-hour-${hour}.png`),fullPage:true});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base+'#/home');await page.locator('.refuge').waitFor();
  await page.locator('[data-route="learn"]').last().click();await page.locator('.grimoire').waitFor();
  assert.equal(await page.locator('.grimoire-opening-leaf').count(),0);
  await page.setViewportSize({width:390,height:844});
  for(const route of ['home','learn','learn/course/organica/evaluation/pep-1']){
   await page.goto(base+'#/'+route);await page.locator(route==='home'?'.refuge':'.grimoire').waitFor();
   await page.evaluate(()=>document.documentElement.style.fontSize='200%');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'200% overflow');
   await page.evaluate(()=>document.documentElement.style.fontSize='');
  }
  assert.deepEqual(await data(),before);
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({passed:true,viewports:[375,390,768,1440,'844x390'],errors},null,2));
  console.log('UPDATE01 E2E: navigation, motion, responsive, local light, 200% text and data preservation OK');
 }finally{await browser?.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
