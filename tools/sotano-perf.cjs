const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { chromium } = require('playwright');
const root = path.join(__dirname, '../dist');
const output = process.env.NEXO_PERF_OUTPUT || path.join(__dirname, '../work/perf');
fs.mkdirSync(output, {recursive:true});
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/^\/$/, '/index.html'));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  fs.readFile(file, (err, data) => {
    if (err) return res.writeHead(404).end();
    res.writeHead(200, {'Content-Type': ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png'})[path.extname(file)] || 'application/octet-stream'}).end(data);
  });
});
(async () => {
  await new Promise(ok => server.listen(0, '127.0.0.1', ok));
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const results = [];
    for (const viewport of [{width:1440,height:900},{width:844,height:390}]) {
      const context = await browser.newContext({viewport, deviceScaleFactor: viewport.width === 844 ? 2 : 1});
      const page = await context.newPage(), errors=[];
      page.on('pageerror', e => errors.push(e.message));
      await page.route('https://**', r => r.abort());
      await page.addInitScript(() => {
        localStorage.setItem('nexo-study-beta', JSON.stringify({version:19,tutorial:{status:'done',rewarded:true,sections:{},news:99},settings:{sound:false,music:false}}));
        sessionStorage.setItem('nexo-sotano-parada','h0');
        const counts = window.drawStats = {draws:0,drawMs:0,fills:0};
        for (const key of ['drawImage','fillRect']) {
          const original=CanvasRenderingContext2D.prototype[key];
          CanvasRenderingContext2D.prototype[key]=function(...args) {
            const t=performance.now();const result=original.apply(this,args);
            if (this.canvas.classList.contains('sotano-view')) {counts.draws++;counts.drawMs+=performance.now()-t;}
            if (this.canvas.classList.contains('sotano-fx')) counts.fills++;
            return result;
          };
        }
      });
      await page.goto(`http://127.0.0.1:${server.address().port}/#/learn`);
      await page.locator('[data-move="fwd"]').waitFor();
      await page.locator('[data-s="load"]').waitFor({state:'hidden'});
      await page.waitForTimeout(1000);
      const measure = async () => page.evaluate(async () => {
        Object.assign(window.drawStats,{draws:0,drawMs:0,fills:0});
        const samples=[];let prev=performance.now();const start=prev;
        await new Promise(ok => {const tick=t=>{samples.push(t-prev);prev=t;if(t-start<3000)requestAnimationFrame(tick);else ok();};requestAnimationFrame(tick);});
        samples.sort((a,b)=>a-b);
        return {frameP50Ms:samples[Math.floor(samples.length*.5)],frameP95Ms:samples[Math.floor(samples.length*.95)],frames:samples.length,...window.drawStats,canvases:[...document.querySelectorAll('.sotano-stage canvas')].map(c=>({class:c.className,width:c.width,height:c.height})),images:performance.getEntriesByType('resource').filter(r=>r.name.includes('/aprender/img/')).length};
      });
      const idle=await measure();
      await page.locator('[data-move="fwd"]').click();
      const moving=await measure();
      await page.waitForFunction(()=>sessionStorage.getItem('nexo-sotano-parada')==='h1');
      const result={viewport,idle,moving,errors};results.push(result);
      await page.screenshot({path:path.join(output,`sotano-${process.argv[2]||'baseline'}-${viewport.width}.png`)});
      await context.close();
    }
    fs.writeFileSync(path.join(output,`sotano-${process.argv[2]||'baseline'}.json`),JSON.stringify(results,null,2));
    console.log(JSON.stringify(results));
  } finally {await browser.close();await new Promise(ok=>server.close(ok));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
