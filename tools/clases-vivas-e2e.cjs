// Clases Vivas en navegador aislado: enlaces, cámara, borradores y ciclo de vida.
const assert = require('node:assert/strict'), fs = require('node:fs'), http = require('node:http'), path = require('node:path');
const { chromium } = require('playwright');
const dist = path.join(__dirname, '../dist'), out = process.env.NEXO_SCREENSHOTS;
const server = http.createServer((request, response) => {
  const name = new URL(request.url, 'http://localhost').pathname;
  const file = path.resolve(dist, '.' + decodeURIComponent(name === '/' ? '/index.html' : name));
  if (!file.startsWith(dist + path.sep)) return response.writeHead(403).end();
  const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm' };
  fs.readFile(file, (error, data) => error ? response.writeHead(404).end() : response.writeHead(200, { 'Content-Type': type[path.extname(file)] || 'application/octet-stream' }).end(data));
});
const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem('nexo-study-beta')));
async function fit(page) {
  const sizes = await page.locator('#auHost').evaluate(el => ({ width: el.clientWidth, content: el.scrollWidth }));
  assert.ok(sizes.content <= sizes.width + 1, JSON.stringify(sizes));
  assert.ok(await page.locator('[data-cv-exit]').isVisible());
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
    const url = `http://127.0.0.1:${server.address().port}/`;
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage(), errors = []; page.setDefaultTimeout(12000);
      page.on('pageerror', error => errors.push(error.message));
      await page.route('https://**', route => route.abort());
      await page.addInitScript(() => {
        document.startViewTransition = undefined;
        if (!localStorage.getItem('nexo-study-beta')) localStorage.setItem('nexo-study-beta', JSON.stringify({ version: 19,
          tutorial: { status: 'done', rewarded: true, sections: {}, news: 99 }, settings: { sound: false, music: false }, meta: { keep: 'previo' } }));
      });
      // Sin imágenes de cámaras, la clase directa sigue siendo plenamente utilizable.
      await page.route('**/aprender/img/**', route => route.abort());
      await page.goto(url + '#/learn/course/organica/lesson/org-01/m2');
      await page.locator('#auHost .au-body').waitFor();
      assert.equal(await page.locator('.cv-header h1').innerText(), await page.evaluate(() => window.NexoClasses['org-01'].title));
      assert.equal((await saved(page)).classSessions['org-01'].mission, 'm2'); await fit(page);
      assert.equal((await saved(page)).academicIntelligence.attempts.length, 0, 'abrir no acredita dominio');

      // Reentrada conserva el punto de lectura, incluso sin responder.
      await page.locator('[data-au="next"]').click();
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('nexo-study-beta')).classSessions['org-01'].beat > 1);
      const position = (await saved(page)).classSessions['org-01'].beat;
      await page.reload(); await page.locator('#auHost .au-body').waitFor();
      assert.equal((await saved(page)).classSessions['org-01'].beat, position);
      console.log(`OK ${width}: enlace de ramo/misión y punto de lectura`);

      // Avanzar con respuestas válidas hasta una actividad escrita y guardar un borrador sin enviar.
      await page.goto(url + '#/lesson/ana-01/m1'); await page.locator('#auHost .au-body').waitFor();
      // Fixture de una sesión previa: ubicar una actividad escrita real usando el reproductor.
      await page.locator('[data-cv-exit]').click(); await page.locator('#auHost').waitFor({ state: 'detached' });
      const draftId = await page.evaluate(() => {
        const state = JSON.parse(localStorage.getItem('nexo-study-beta'));
        const session = window.NexoClassroom.sessionFor({ getState: () => state }, 'ana-01');
        session.path = 'misiones'; session.mission = 'm1';
        const beats = window.NexoClassroom.beats(window.NexoClasses['ana-01'], session);
        const index = beats.findIndex(b => b.kind === 'question' && b.item?.type === 'write');
        if (index < 0) throw new Error('No se encontró la actividad escrita real');
        session.beat = index; session.far.m1 = index;
        localStorage.setItem('nexo-study-beta', JSON.stringify(state));
        return beats[index].item.id;
      });
      await page.goto(url + '?draft=1#/lesson/ana-01/m1'); await page.locator('textarea[data-au-text]').waitFor();
      assert.ok(draftId);
      const draft = 'Borrador conservado al recargar antes de enviarlo.';
      await page.locator('[data-au-conf]').fill('90');
      await page.locator('textarea[data-au-text]').fill(draft);
      await page.reload(); await page.locator('textarea[data-au-text]').waitFor();
      assert.equal(await page.locator('textarea[data-au-text]').inputValue(), draft);
      await page.locator('[data-au="tip"]').click();
      await fit(page);
      if (out) { fs.mkdirSync(out, { recursive: true }); await page.screenshot({ path: path.join(out, `clases-vivas-${width}.png`) }); }
      const before = await saved(page);
      await page.locator('[data-cv-exit]').click(); await page.locator('#auHost').waitFor({ state: 'detached' });
      console.log(`OK ${width}: borrador, guardado y salida`);

      // Cámara existente → el mismo módulo. La parada recordada evita recorrer el pasillo en cada prueba.
      await page.unroute('**/aprender/img/**');
      // El Sótano previo exige horizontal en celular; Estudio funciona en vertical.
      if (width < 600) await page.setViewportSize({ width: 900, height: 390 });
      await page.evaluate(() => sessionStorage.setItem('nexo-sotano-parada', 'ana.c0'));
      await page.goto(url + '#/learn'); await page.locator('[data-open="ana-01"]').waitFor();
      await page.locator('[data-open="ana-01"]').click(); await page.locator('textarea[data-au-text]').waitFor();
      if (width < 600) await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.locator('textarea[data-au-text]').inputValue(), draft);
      const after = await saved(page);
      assert.deepEqual(after.classSessions['ana-01'].answers, before.classSessions['ana-01'].answers);
      assert.equal(after.academicIntelligence.attempts.length, before.academicIntelligence.attempts.length);
      assert.equal(after.meta.keep, 'previo');
      await page.locator('[data-cv-exit]').click(); await page.locator('.sotano').waitFor();
      console.log(`OK ${width}: cámara → clase → cámara, un solo historial`);

      // Contrato de misión desconocida y navegación rápida durante la carga.
      await page.goto(url + '#/lesson/org-01/no-existe'); await page.getByRole('heading', { name: 'Misión no disponible' }).waitFor();
      assert.equal(await page.locator('#auHost').count(), 0);
      await page.goto(url + '#/lesson/fq-01/m1'); await page.evaluate(() => { location.hash = '#/planner'; });
      await page.waitForTimeout(1000); assert.equal(await page.locator('#auHost').count(), 0);
      assert.deepEqual(errors, []);
      await context.close();
    }
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
