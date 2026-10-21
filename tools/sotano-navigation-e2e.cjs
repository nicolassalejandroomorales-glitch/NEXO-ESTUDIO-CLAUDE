const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');const root=path.resolve(__dirname,'../dist');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(e,data)=>{if(e)return res.writeHead(404).end();res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png'})[path.extname(file)]||'application/octet-stream'}).end(data);});});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'no-preference'});await context.route('https://**',r=>r.abort());
  await context.addInitScript(()=>{document.startViewTransition=undefined;localStorage.setItem('nexo-study-beta',JSON.stringify({version:19,tutorial:{status:'done',rewarded:true,sections:{},news:99},settings:{sound:false,music:false}}));sessionStorage.setItem('nexo-sotano-parada','h0');});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
  const url=`http://127.0.0.1:${server.address().port}/`;
  await page.goto(url+'#/learn');await page.locator('[data-move="fwd"]').waitFor();await page.locator('[data-s="load"]').waitFor({state:'hidden'});
  await page.waitForTimeout(350);
  const box=await page.locator('.sotano-stage').boundingBox();
  await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.65,box.y+box.height*.5,{steps:6});await page.mouse.up();
  await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>sessionStorage.getItem('nexo-sotano-parada')),'h0','arrastrar no desplaza');
  const run=async(action,to,maxMs)=>{
   await page.evaluate(()=>window.__navStart=performance.now());await action();
   await page.waitForFunction(node=>sessionStorage.getItem('nexo-sotano-parada')===node,to,{polling:'raf'});
   const elapsed=await page.evaluate(()=>performance.now()-window.__navStart);assert.ok(elapsed<maxMs,`${width}: ${to} ${elapsed.toFixed(0)} ms`);return Math.round(elapsed);
  };
  const walk=await run(()=>page.keyboard.down('w'),'h1',1300);
  await page.keyboard.down('w');await page.keyboard.down('w');await page.waitForTimeout(800);
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('nexo-sotano-parada')),'h1','mantener tecla no encadena movimientos');await page.keyboard.up('w');
  const turn=await run(()=>page.locator('[data-move="right"]').click(),'d-org',1300);
  const portal=await run(()=>page.locator('[data-move="enter"]').click(),'c-in',2300);
  await page.locator('[data-move="fwd"]').click();await page.waitForFunction(()=>sessionStorage.getItem('nexo-sotano-parada')==='c0');
  await page.locator('[data-open="org-01"]').first().waitFor();await page.locator('[data-open="org-01"]').first().click();await page.locator('#auHost .st').waitFor();
  assert.equal(await page.locator('.sotano').count(),0);assert.deepEqual(errors,[]);
  console.log(`OK ${width}: caminar ${walk} ms, giro ${turn} ms, portal ${portal} ms; teclado/botones, arrastre y cámara→clase`);await context.close();
 }}finally{await browser.close();await new Promise(ok=>server.close(ok));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
