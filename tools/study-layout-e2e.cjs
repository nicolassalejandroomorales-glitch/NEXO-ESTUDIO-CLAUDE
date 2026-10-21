// El panel real mide 250x268. Comprobar espacio útil, scroll y controles en cuatro tamaños.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { chromium } = require('playwright');
const dist = path.resolve(__dirname, '../dist');
const server = http.createServer((request, response) => {
  const name = new URL(request.url, 'http://localhost').pathname;
  const file = path.resolve(dist, '.' + decodeURIComponent(name === '/' ? '/index.html' : name));
  if (!file.startsWith(dist + path.sep)) return response.writeHead(403).end();
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.webp': 'image/webp' };
  fs.readFile(file, (error, data) => error ? response.writeHead(404).end() : response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(data));
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const url = `http://127.0.0.1:${server.address().port}/`;
    for (const [width, height] of [[250,268],[390,720],[1024,600],[1440,900]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      const page = await context.newPage(), errors = []; page.setDefaultTimeout(12000);
      page.on('pageerror', error => errors.push(error.message)); await page.route('https://**', route => route.abort());
      await page.addInitScript(() => {
        document.startViewTransition = undefined;
        localStorage.setItem('nexo-study-beta', JSON.stringify({ version: 19, tutorial: { status: 'done', rewarded: true, sections: {}, news: 99 }, settings: { sound: false, music: false } }));
      });
      await page.goto(url + '#/lesson/org-01/m4'); await page.locator('#auHost .st-opt').first().waitFor();
      const compact = height <= 540 || width <= 340;
      assert.equal(await page.locator('.cv-companion').getAttribute('open') !== null, !compact);
      const geometry = await page.evaluate(() => {
        const header = document.querySelector('.cv-header').getBoundingClientRect(), content = document.querySelector('.cv-content'), panel = document.querySelector('.st-panel').getBoundingClientRect();
        return { header: header.height, top: header.top, content: content.clientHeight, client: content.clientWidth, scroll: content.scrollWidth, panelTop: panel.top };
      });
      assert.ok(geometry.scroll <= geometry.client + 1, JSON.stringify(geometry));
      assert.ok(geometry.content >= height * .65, 'al menos 65% de la altura queda para el contenido');
      if (compact) {
        assert.ok(geometry.header <= 70, JSON.stringify(geometry));
        await page.getByText('Grimorio', { exact: true }).first().click(); assert.ok(await page.locator('.st-bubble').isVisible());
        await page.getByText('Grimorio', { exact: true }).first().click(); assert.equal(await page.locator('.st-bubble').isVisible(), false);
      }
      await page.locator('.cv-content').evaluate(el => { el.scrollTop = el.scrollHeight; });
      const exit = await page.locator('[data-cv-exit]').boundingBox();
      assert.ok(exit.y >= 0 && exit.y + exit.height <= height, 'salir permanece accesible al desplazar');
      // El mismo marco sirve para una clase general de título largo.
      await page.goto(url + '#/lesson/ana-01/m1'); await page.locator('#auHost .au-body').waitFor();
      const longHeader = await page.locator('.cv-header').boundingBox();
      if (compact) assert.ok(longHeader.height <= 70, 'el título largo tampoco consume el panel pequeño');
      assert.ok(await page.locator('.cv-content').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
      assert.deepEqual(errors, []);
      console.log(`OK ${width}x${height}: encabezado ${Math.round(geometry.header)}px, lectura ${geometry.content}px, salida fija y compañero accesible`);
      await context.close();
    }
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
