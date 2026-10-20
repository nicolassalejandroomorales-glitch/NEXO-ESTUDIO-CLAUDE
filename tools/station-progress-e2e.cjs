// Navegador aislado: continuidad real de Basicidad, plazo, borradores y entrega recuperable.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { chromium } = require('playwright');
const dist = path.resolve(__dirname, '../dist'), out = process.env.NEXO_SCREENSHOTS;
const server = http.createServer((request, response) => {
  const name = new URL(request.url, 'http://localhost').pathname;
  const file = path.resolve(dist, '.' + decodeURIComponent(name === '/' ? '/index.html' : name));
  if (!file.startsWith(dist + path.sep)) return response.writeHead(403).end();
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.webp': 'image/webp' };
  fs.readFile(file, (error, data) => error ? response.writeHead(404).end() : response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(data));
});
const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem('nexo-study-beta')));
const progress = async page => (await saved(page)).classSessions['org-01'].stationProgress['m4:full'];
async function load(page, url) {
  await page.goto(url + '#/lesson/org-01/m4'); await page.locator('#auHost .st-body').waitFor();
}
async function reload(page) { await page.reload(); await page.locator('#auHost .st-body').waitFor(); }
async function records(page, count) {
  await page.waitForFunction(n => JSON.parse(localStorage.getItem('nexo-study-beta')).classEvidence?.['org-01']?.records.length === n, count);
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
        const realNow = Date.now.bind(Date);
        Date.now = () => realNow() + Number(sessionStorage.getItem('qa-time-offset') || 0);
        if (!localStorage.getItem('nexo-study-beta')) localStorage.setItem('nexo-study-beta', JSON.stringify({ version: 19,
          tutorial: { status: 'done', rewarded: true, sections: {}, news: 99 }, settings: { sound: false, music: false, volume: .17 },
          meta: { preservedByStationTest: 'previo' } }));
      });
      await load(page, url); await page.locator('.st-opt[data-i="0"]').click();
      await reload(page);
      assert.ok(await page.locator('.st-opt[data-i="0"]').isDisabled());
      assert.equal((await progress(page)).adivinaOk, true);
      await page.getByRole('button', { name: 'A la clase →', exact: true }).click();
      await require('./helpers/study-journey.cjs')(page);
      const diag = await page.evaluate(() => window.NexoClasses['org-01'].missions.find(m => m.id === 'm4').study.checks.map(it => ({ id: it.id, answer: it.options.findIndex(o => o.correct) })));
      await page.locator(`.st-opt[data-i="${diag[0].answer}"]`).click(); await reload(page);
      assert.ok(await page.locator(`.st-opt[data-i="${diag[0].answer}"]`).isDisabled());
      assert.equal((await progress(page)).studyChecksIndex || 0, 0);
      for (let i = 0; i < diag.length; i++) {
        if (i) await page.locator(`.st-opt[data-i="${diag[i].answer}"]`).click();
        await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
        if (i + 1 < diag.length) { await reload(page); assert.equal((await progress(page)).studyChecksIndex, i + 1); }
      }
      await page.getByRole('button', { name: 'Al juego →', exact: true }).click();
      const practice = (await progress(page)).tasks.practice.item;
      await page.locator(`.st-card[data-id="${practice.answer[0]}"]`).click(); await reload(page);
      assert.equal((await progress(page)).tasks.practice.item.id, practice.id);
      assert.deepEqual((await progress(page)).tasks.practice.picked, [practice.answer[0]]);
      assert.equal(await page.locator('.st-slot.full').count(), 1);
      for (const id of practice.answer.slice(1)) await page.locator(`.st-card[data-id="${id}"]`).click();
      await page.locator('[data-check]').click(); await reload(page);
      assert.ok((await progress(page)).tasks.practice.done);
      assert.equal((await saved(page)).academicIntelligence.attempts.length, 0, 'ni abrir ni repetir práctica acredita dominio');
      console.log(`OK ${width}: Adivina, pregunta de Clase y Práctica recuperables con la misma variante`);

      await page.getByRole('button', { name: 'Ir a la prueba →', exact: true }).click();
      await page.getByRole('button', { name: 'Empezar', exact: true }).click();
      const timed = (await progress(page)).exam;
      await page.locator(`.st-card[data-id="${timed.item.answer[0]}"]`).click();
      await page.locator('[data-cv-exit]').click(); await page.locator('#auHost').waitFor({ state: 'detached' });
      await load(page, url);
      let restored = (await progress(page)).exam;
      assert.equal(restored.deadlineAt, timed.deadlineAt); assert.equal(restored.item.id, timed.item.id);
      assert.equal(await page.locator('.st-slot.full').count(), 1);
      await page.locator('[data-cv-exit]').click(); await page.locator('#auHost').waitFor({ state: 'detached' });
      await page.evaluate(() => sessionStorage.setItem('qa-time-offset', '95000'));
      await load(page, url); await page.locator('.st-pep').waitFor(); await records(page, 1);
      restored = (await progress(page)).exam;
      assert.equal(restored.result.timeout, true); assert.equal(restored.result.correct, false);
      const firstResult = restored.result;
      await reload(page); await page.locator('.st-pep').waitFor(); await records(page, 1);
      assert.deepEqual((await progress(page)).exam.result, firstResult);
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('nexo-study-beta')).academicIntelligence.attempts.length === 1);
      console.log(`OK ${width}: cierre con reloj, vencimiento y un solo resultado tras recargar`);

      await page.getByRole('button', { name: 'Probar otra variante', exact: true }).click();
      await page.locator('.st-clockopt input').uncheck(); await reload(page);
      assert.equal(await page.locator('.st-clockopt input').isChecked(), false);
      await page.getByRole('button', { name: 'Empezar', exact: true }).click();
      const untimed = (await progress(page)).exam;
      assert.notEqual(untimed.item.id, timed.item.id); assert.equal(untimed.deadlineAt, null);
      await page.locator(`.st-card[data-id="${untimed.item.answer[0]}"]`).click();
      await page.route('**/academic/engine.js*', route => route.abort());
      await reload(page);
      assert.deepEqual((await progress(page)).exam.task.picked, [untimed.item.answer[0]]);
      assert.equal((await progress(page)).exam.item.source, untimed.item.source);
      if (out) { fs.mkdirSync(out, { recursive: true }); await page.screenshot({ path: path.join(out, `basicidad-continuidad-${width}.png`) }); }
      for (const id of untimed.item.answer.slice(1)) await page.locator(`.st-card[data-id="${id}"]`).click();
      await page.locator('[data-check]').click(); await page.locator('.st-pep').waitFor(); await records(page, 2);
      assert.equal((await saved(page)).academicIntelligence.attempts.length, 1, 'el motor bloqueado no recibió el segundo resultado');
      await page.unroute('**/academic/engine.js*'); await reload(page); await page.locator('.st-pep').waitFor();
      await page.waitForFunction(() => JSON.parse(localStorage.getItem('nexo-study-beta')).academicIntelligence.attempts.length === 2);
      const final = await saved(page), second = final.classEvidence['org-01'].records.at(-1);
      assert.equal(second.itemId, untimed.item.id); assert.equal(second.correct, true);
      assert.equal(second.academicItem.source, untimed.item.source); assert.deepEqual(second.academicItem.gen, untimed.item.gen);
      assert.equal(final.classEvidence['org-01'].records.length, 2);
      assert.equal(final.academicIntelligence.attempts.length, 2);
      assert.equal(final.meta.preservedByStationTest, 'previo'); assert.equal(final.settings.volume, .17);
      assert.ok(await page.locator('#auHost').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
      // Una prueba final iniciada desde otra misión también se reabre directamente.
      await page.locator('[data-cv-exit]').click(); await page.locator('#auHost').waitFor({ state: 'detached' });
      const finalId = await page.evaluate(() => {
        const state = JSON.parse(localStorage.getItem('nexo-study-beta')), cls = window.NexoClasses['org-01'];
        const mission = cls.missions.find(m => m.id !== 'm4' && cls.demuestra?.[m.id]);
        const generator = [].concat(cls.demuestra[mission.id].gen)[0];
        const item = window.NexoClassroom.genItem(cls, `gen:${generator}:5:final-resume`);
        const api = { getState: () => state, saveState: () => localStorage.setItem('nexo-study-beta', JSON.stringify(state)), flushState() {} };
        window.NexoStation.progressFor({ cls, mission: mission.id, only: 'demuestra', api }).start(() => item, false, 90);
        return mission.id;
      });
      await page.goto(url + '?only=1#/lesson/org-01/' + finalId); await page.locator('#auHost .st-body').waitFor();
      assert.equal(await page.locator('.st-h').innerText(), 'DEMUESTRA');
      assert.equal(await page.locator('.st-start').count(), 0);
      assert.deepEqual(errors, []);
      console.log(`OK ${width}: borrador sin reloj, nueva variante explícita, fuente y entrega recuperable sin duplicados`);
      await context.close();
    }
    // Compatibilidad de los otros dos tipos que usa Demuestra, con datos de prueba explícitos.
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage(); page.setDefaultTimeout(12000);
    await page.route(url + 'fixture.html', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><meta charset="utf-8"><div id="fixture" class="au-host"></div>' }));
    async function fixture(type) {
      await page.goto(url + 'fixture.html');
      for (const name of ['estacion', 'aula']) await page.addStyleTag({ url: url + `classes/${name}.css` });
      for (const name of ['player', 'estacion']) await page.addScriptTag({ url: url + `classes/${name}.js` });
      await page.evaluate(type => {
        const key = 'qa-station-' + type, state = JSON.parse(localStorage.getItem(key) || '{"classSessions":{},"results":{}}');
        const api = { getState: () => state, saveState: () => localStorage.setItem(key, JSON.stringify(state)), flushState() {} };
        const cls = { id: 'qa-' + type, title: 'Datos de prueba', missions: [{ id: 'm1', stages: { diagnostic: [] } }] };
        const gen = { source: 'fixture', generators: [{ id: 'fixture', make: () => ({ type, concept: 'qa', prompt: 'Actividad de prueba',
          answer: 42, unit: 'mol', explain: 'Explicación de prueba.', options: [{ text: 'Correcta', correct: true }, { text: 'Incorrecta' }] }) }] };
        window.NexoStation.mount(document.getElementById('fixture'), { cls, gen, api, mission: 'm1', only: 'demuestra',
          demuestra: { gen: 'fixture' }, onResult(result) { state.results[result.itemId] ||= result; api.saveState(); } });
      }, type);
    }
    await fixture('number'); await page.locator('.st-clockopt input').uncheck(); await page.locator('.st-start').click();
    assert.ok(await page.locator('[data-check]').isDisabled(), 'el vacío no es una respuesta numérica');
    await page.locator('.st-num').fill('4,2'); await fixture('number');
    assert.equal(await page.locator('.st-num').inputValue(), '4,2');
    await page.locator('.st-num').fill('42'); await page.locator('[data-check]').click(); await fixture('number');
    assert.equal(await page.locator('.st-num').inputValue(), '42'); assert.ok(await page.locator('.st-num').isDisabled());
    assert.equal(await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('qa-station-number')).results).filter(r => r.correct).length), 1);
    await fixture('choice'); await page.locator('.st-clockopt input').uncheck(); await page.locator('.st-start').click();
    await page.locator('.st-opt[data-i="1"]').click(); await fixture('choice');
    assert.ok(await page.locator('.st-opt[data-i="1"]').isDisabled());
    assert.equal(await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('qa-station-choice')).results).filter(r => !r.correct).length), 1);
    console.log('OK 390: borrador numérico y corrección de alternativas recuperables; sin reintentos por recarga');
    await context.close();
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
