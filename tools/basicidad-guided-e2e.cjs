// Feedback del usuario: desde cero, coma decimal, ayuda sin dominio y relectura sin perder intentos.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { chromium } = require('playwright');
const dist = path.resolve(__dirname, '../dist'), saved = page => page.evaluate(() => JSON.parse(localStorage.getItem('nexo-study-beta')));
const progress = async page => (await saved(page)).classSessions['org-01'].stationProgress['m4:full'];
const server = http.createServer((request, response) => {
  const name = new URL(request.url, 'http://localhost').pathname, file = path.resolve(dist, '.' + decodeURIComponent(name === '/' ? '/index.html' : name));
  if (!file.startsWith(dist + path.sep)) return response.writeHead(403).end();
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.wasm': 'application/wasm' };
  fs.readFile(file, (error, data) => error ? response.writeHead(404).end() : response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(data));
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    for (const width of [1440, 390, 250]) {
      const context = await browser.newContext({ viewport: { width, height: width === 250 ? 268 : 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage(), errors = []; page.setDefaultTimeout(12000); page.on('pageerror', e => errors.push(e.message));
      await page.route('https://**', route => route.abort());
      await page.addInitScript(() => {
        document.startViewTransition = undefined;
        if (!localStorage.getItem('nexo-study-beta')) localStorage.setItem('nexo-study-beta', JSON.stringify({ version: 19,
          tutorial: { status: 'done', rewarded: true, sections: {}, news: 99 }, settings: { sound: false, music: false }, meta: { keep: 'previo' } }));
      });
      await page.goto(`http://127.0.0.1:${server.address().port}/#/lesson/org-01/m4`);
      await page.getByRole('button', { name: 'No lo sé todavía: aprender desde cero', exact: true }).click();
      const pages = await page.evaluate(() => window.NexoClasses['org-01'].missions.find(m => m.id === 'm4').study.pages);
      for (let i = 0; i < pages.length; i++) {
        const part = pages[i]; await page.getByRole('heading', { name: part.title, exact: true }).waitFor();
        assert.ok(await page.locator('.cv-content').evaluate(e => e.scrollWidth <= e.clientWidth + 1), `desborde en ${part.id}/${width}`);
        assert.equal(await page.locator('.st-body').getByText(/Et₃/).count(), 0);
        if (part.id === 'equilibrium') {
          await page.locator('.st-opt[data-i="1"]').click(); // Error de base: confundir igual velocidad con igual cantidad.
        } else if (part.check) {
          if (part.id === 'pair') await page.getByRole('button', { name: 'No lo sé todavía', exact: true }).click();
          else await page.locator(`.st-opt[data-i="${part.check.options.findIndex(o => o.correct)}"]`).click();
          if (part.id === 'resonance') await page.getByRole('button', { name: 'Acerté adivinando: repasar por qué', exact: true }).click();
        }
        if (['pair', 'equilibrium', 'resonance'].includes(part.id)) {
          await page.reload(); await page.getByRole('heading', { name: part.title, exact: true }).waitFor();
          assert.equal((await progress(page)).studyIndex, i);
          assert.ok(await page.locator('.st-opt').first().isDisabled());
          const feedback = part.id === 'equilibrium' ? part.check.options[1].note : part.check.explain;
          assert.ok(await page.locator('.st-fb').filter({ hasText: feedback }).isVisible(), `corrección persistida: ${part.id}`);
        }
        if (part.id === 'conjugates') {
          await page.getByRole('button', { name: '← Paso anterior', exact: true }).click();
          assert.ok(await page.locator('.st-opt').first().isDisabled());
          await page.getByRole('button', { name: 'Continuar →', exact: true }).click();
        }
        await page.getByRole('button', { name: i === pages.length - 1 ? 'Comprobar lo aprendido →' : 'Continuar →', exact: true }).click();
      }
      let state = await saved(page), p = await progress(page);
      assert.equal(p.tasks['study:study-pair'].why, 'unknown'); assert.equal(p.tasks['study:study-resonance'].guessed, true);
      assert.equal(state.academicIntelligence.attempts.length, 0, 'leer, ayuda, error o adivinar no acreditan dominio');
      const diag = await page.evaluate(() => window.NexoClasses['org-01'].missions.find(m => m.id === 'm4').study.checks);
      for (const item of diag) {
        await page.locator(`.st-opt[data-i="${item.options.findIndex(o => o.correct)}"]`).click();
        await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
      }
      await page.getByRole('button', { name: 'Al juego →', exact: true }).click();
      let practice = (await progress(page)).tasks.practice.item;
      assert.ok(!practice.cards.some(c => /pKa/.test(c.text)), 'la práctica ya no muestra la respuesta numérica');
      await page.locator(`.st-card[data-id="${practice.answer[0]}"]`).click();
      await page.getByRole('button', { name: 'Volver a la explicación', exact: true }).click();
      await page.reload(); await page.getByRole('heading', { name: pages[0].title, exact: true }).waitFor();
      assert.equal((await progress(page)).tasks.practice.item.id, practice.id);
      assert.deepEqual((await progress(page)).tasks.practice.picked, [practice.answer[0]]);
      await require('./helpers/study-journey.cjs')(page);
      assert.equal((await progress(page)).studyChecksIndex, diag.length, 'releer conserva las comprobaciones ya hechas');
      await page.getByRole('button', { name: 'Al juego →', exact: true }).click();
      for (const id of practice.answer.slice(1)) await page.locator(`.st-card[data-id="${id}"]`).click();
      await page.locator('[data-check]').click();
      await page.getByRole('button', { name: 'Probar otro caso sin tabla', exact: true }).click();
      let next = await progress(page);
      assert.equal(next.practiceHistory.at(-1).item.id, practice.id, 'otra práctica archiva el intento anterior');
      assert.notEqual(next.tasks.practice.item.id, practice.id); practice = next.tasks.practice.item;
      await page.reload(); await page.locator('.st-cards').waitFor();
      assert.equal((await progress(page)).tasks.practice.item.id, practice.id);
      for (const id of practice.answer) await page.locator(`.st-card[data-id="${id}"]`).click();
      await page.locator('[data-check]').click(); await page.getByRole('button', { name: 'Ir a la prueba →', exact: true }).click();
      await page.locator('.st-clockopt input').uncheck(); await page.getByRole('button', { name: 'Empezar', exact: true }).click();
      assert.equal(await page.getByRole('button', { name: 'Volver a la explicación', exact: true }).count(), 0, 'sin ayuda dentro de Demuestra');
      const exam = (await progress(page)).exam;
      assert.ok(exam.item.id.endsWith(':piloto-basicidad'));
      for (const id of exam.item.answer) await page.locator(`.st-card[data-id="${id}"]`).click();
      await page.locator('[data-check]').click(); await page.locator('.st-pep').waitFor();
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('nexo-study-beta')).academicIntelligence.attempts.length === 1);
      await page.getByRole('button', { name: 'Volver a la explicación', exact: true }).click();
      state = await saved(page); p = await progress(page);
      assert.equal(p.exam.item.id, exam.item.id); assert.equal(state.academicIntelligence.attempts.length, 1); assert.equal(state.meta.keep, 'previo');
      assert.deepEqual(errors, []);
      if (process.env.NEXO_SCREENSHOTS) {
        fs.mkdirSync(process.env.NEXO_SCREENSHOTS, { recursive: true });
        await page.screenshot({ path: path.join(process.env.NEXO_SCREENSHOTS, `basicidad-guiada-${width}.png`) });
      }
      console.log(`OK ${width}: explicación, errores/ayuda/adivinación sin dominio, posición, relectura y examen independiente conservados`);
      await context.close();
    }
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
