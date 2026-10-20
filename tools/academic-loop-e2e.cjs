// Navegador aislado: respuestas reales del aula, recuperación tras fallo y recarga en PC/celular.
// Ejecutar: node tools/academic-loop-e2e.cjs. No usa la sesión ni los datos del usuario.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { chromium } = require('playwright');
const dist = path.resolve(__dirname, '..', 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.webp': 'image/webp', '.png': 'image/png' };
const server = http.createServer((request, response) => {
  const name = new URL(request.url, 'http://localhost').pathname;
  const file = path.resolve(dist, `.${decodeURIComponent(name === '/' ? '/index.html' : name)}`);
  if (!file.startsWith(dist + path.sep)) return response.writeHead(403).end();
  fs.readFile(file, (error, bytes) => error ? response.writeHead(404).end() : response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(bytes));
});
const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem('nexo-study-beta')));
async function question(page) {
  for (let i = 0; i < 12; i++) {
    if (await page.locator('[data-au="answer"]').count()) return;
    await page.locator('[data-au="next"]').click();
  }
  throw new Error('No apareció la actividad de alternativas');
}
async function answer(page, id, right) {
  await question(page);
  const itemId = await page.locator('[data-au="answer"]').first().getAttribute('data-item');
  const choice = await page.evaluate(({ id, itemId, right }) => {
    const item = window.NexoClassroom.findItem(window.NexoClasses[id], itemId);
    return item.options.findIndex(o => Boolean(o.correct) === right);
  }, { id, itemId, right });
  await page.locator('[data-au-conf]').fill('90');
  await page.locator(`[data-au="answer"][data-choice="${choice}"]`).click();
  await page.locator(right ? '.au-card.right' : '.au-card.wrong').waitFor();
  return itemId;
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
    const url = `http://127.0.0.1:${server.address().port}/`;
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('https://**', route => route.abort());
      await page.addInitScript(() => {
        document.startViewTransition = undefined;
        if (!localStorage.getItem('nexo-study-beta')) localStorage.setItem('nexo-study-beta', JSON.stringify({ version: 19,
          tutorial: { status: 'done', rewarded: true, sections: {}, news: 99 }, settings: { sound: false, music: false, volume: .17 },
          meta: { preservedByTest: 'previo' } }));
      });
      await page.route('**/academic/engine.js*', route => route.abort());
      await page.goto(url + '#/lesson/org-01'); await page.locator('#auHost').waitFor();
      const itemId = await answer(page, 'org-01', false);
      const initial = await saved(page), first = initial.classEvidence['org-01'].records[0];
      assert.equal(first.itemId, itemId); assert.equal(first.correct, false);
      assert.ok(first.academicItem.source); assert.ok(first.academicItem.slide);
      assert.equal(initial.academicIntelligence.attempts.length, 0, 'el motor está bloqueado');
      assert.ok(initial.classSessions['org-01'].answers[itemId], 'respuesta y evidencia se guardan juntas');

      await page.unroute('**/academic/engine.js*');
      await page.reload(); await page.locator('#auHost').waitFor();
      await page.waitForFunction(id => {
        const s = JSON.parse(localStorage.getItem('nexo-study-beta'));
        return s?.classEvidence?.['org-01']?.delivery?.[id]?.academic === true;
      }, first.id);
      let state = await saved(page);
      assert.equal(state.classEvidence['org-01'].records.length, 1);
      assert.equal(state.academicIntelligence.attempts.filter(a => a.id === first.id).length, 1);
      assert.equal(state.academicIntelligence.evidence.filter(e => e.attemptId === first.id).length, 1);
      assert.equal(state.classSessions['org-01'].answers[itemId].correct, false);
      assert.equal(state.meta.preservedByTest, 'previo'); assert.equal(state.settings.volume, .17);
      await page.locator('.au-card.wrong').waitFor();
      await page.locator('[data-au="next"]').click();
      await answer(page, 'org-01', true);
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('nexo-study-beta')).academicIntelligence.attempts.length === 2);
      state = await saved(page);
      assert.equal(state.classEvidence['org-01'].records.length, 2);
      assert.equal(state.academicIntelligence.reviewSchedules.length, new Set(state.academicIntelligence.reviewSchedules.map(r => r.id)).size);
      assert.ok(await page.evaluate(() => window.NexoClassEvidence.leaf(JSON.parse(localStorage.getItem('nexo-study-beta')).classEvidence['org-01'],
        JSON.parse(localStorage.getItem('nexo-study-beta')).classEvidence['org-01'].records[1].conceptId).count > 0));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.ok(await page.locator('.st-exit').isVisible());
      if (process.env.NEXO_SCREENSHOTS) {
        fs.mkdirSync(process.env.NEXO_SCREENSHOTS, { recursive: true });
        await page.screenshot({ path: path.join(process.env.NEXO_SCREENSHOTS, `academico-${width}.png`) });
      }

      // Otro ramo, mismo recorrido visible y sus conceptos propios.
      await page.goto(url + '#/lesson/ana-01'); await page.locator('#auHost').waitFor();
      const anaItem = await answer(page, 'ana-01', true);
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('nexo-study-beta')).academicIntelligence.attempts.length === 3);
      state = await saved(page);
      assert.equal(state.classEvidence['ana-01'].records[0].itemId, anaItem);
      assert.ok(state.academicIntelligence.evidence.some(e => e.exerciseId.startsWith('ana-01:') && e.validationStatus === 'verified'));
      await page.reload(); await page.locator('#auHost').waitFor();
      await page.locator('.au-card.right').waitFor();
      state = await saved(page);
      assert.equal(state.academicIntelligence.attempts.length, 3);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));

      // Demuestra usa el corrector de la estación y conserva variante, fuente y diapositiva.
      await page.evaluate(() => {
        const s = JSON.parse(localStorage.getItem('nexo-study-beta'));
        s.classSessions['org-01'].path = 'misiones'; s.classSessions['org-01'].mission = 'm4';
        localStorage.setItem('nexo-study-beta', JSON.stringify(s));
      });
      await page.goto(url + '?qa=station#/lesson/org-01');
      await page.locator('#auHost .st-opt').first().waitFor();
      await page.evaluate(() => {
        const original = window.NexoClassroom.genItem;
        window.NexoClassroom.genItem = (...args) => (window.qaGenerated = original(...args));
      });
      await page.locator('.st-opt[data-i="0"]').click();
      await page.getByRole('button', { name: 'A la clase →', exact: true }).click();
      const diag = await page.evaluate(() => window.NexoClasses['org-01'].missions.find(m => m.id === 'm4').stages.diagnostic.map(it => it.options.findIndex(o => o.correct)));
      for (const choice of diag) {
        await page.locator(`.st-opt[data-i="${choice}"]`).click();
        await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
      }
      await page.getByRole('button', { name: 'Al juego →', exact: true }).click();
      for (const card of await page.evaluate(() => window.qaGenerated.answer)) await page.locator(`.st-card[data-id="${card}"]`).click();
      await page.locator('[data-check]').click();
      await page.getByRole('button', { name: 'Ir a la prueba →', exact: true }).click();
      await page.locator('.st-clockopt input').uncheck();
      await page.getByRole('button', { name: 'Empezar', exact: true }).click();
      const generated = await page.evaluate(() => window.qaGenerated);
      for (const card of generated.answer) await page.locator(`.st-card[data-id="${card}"]`).click();
      await page.locator('[data-check]').click(); await page.locator('.st-pep').waitFor();
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('nexo-study-beta')).academicIntelligence.attempts.length === 4);
      state = await saved(page);
      const exam = state.classEvidence['org-01'].records.at(-1);
      assert.equal(exam.itemId, generated.id); assert.ok(exam.correct && exam.transfer && !exam.hint);
      assert.equal(exam.academicItem.gen.id, 'basicidad'); assert.equal(exam.academicItem.gen.level, 5);
      assert.equal(exam.academicItem.source, generated.source); assert.equal(exam.academicItem.slide, generated.slide);
      assert.equal(state.academicIntelligence.attempts.filter(a => a.id === exam.id).length, 1);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
      console.log(`OK ${width}px: aula de Orgánica/Analítica, fallo/recuperación del motor, recarga y Demuestra con fuente y variante.`);
      await context.close();
    }
  } finally { await browser?.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
