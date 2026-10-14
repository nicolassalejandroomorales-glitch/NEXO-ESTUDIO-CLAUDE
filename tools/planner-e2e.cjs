// Organización E2E (UPDATE 02 · Fase 1): estudio de planos + Hoy + avisos del Inicio, en celular (390) y PC (1440).
// El calendario y las ponderaciones viejas ya no se ven: #/planner, #/hub/calendar y #/hub/grades llevan al estudio nuevo.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const dist = path.resolve(__dirname, '..', 'dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.wasm': 'application/wasm', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const file = path.resolve(dist, `.${decodeURIComponent(pathname === '/' ? '/index.html' : pathname)}`);
  if (!file.startsWith(`${dist}${path.sep}`)) return response.writeHead(403).end();
  fs.readFile(file, (error, bytes) => error ? response.writeHead(404).end() :
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(bytes));
});
const launch = () => fs.existsSync('/opt/pw-browsers/chromium') ? chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true })
  : chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await launch();
  const origin = `http://127.0.0.1:${server.address().port}/`;
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => { if (!localStorage.getItem('nexo-study-beta')) localStorage.setItem('nexo-study-beta', JSON.stringify({ version: 19, tutorial: { status: 'done', rewarded: true, sections: {}, news: 99 } })); });
      await page.clock.setFixedTime(new Date('2026-10-14T16:30:00'));
      const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      // Rutas viejas → estudio nuevo.
      for (const [from, to] of [['#/hub/calendar', '#/planner/hoy'], ['#/hub/grades', '#/planner/notas'], ['#/planner/calendar', '#/planner/calendar']]) {
        await page.goto(origin + from); await page.locator('.estudio-page').waitFor();
        assert.equal(await page.evaluate(() => location.hash), to);
        assert.equal(await page.locator('.calendar-interactive, .grades-view').count(), 0, 'el diseño viejo no se ve');
      }
      await page.goto(origin + '#/planner/hoy');
      await page.locator('.estudio-scene canvas').waitFor();
      assert.match(await page.locator('.cinta').first().innerText(), /19–27 oct: 4 evaluaciones/);
      assert.equal(await page.locator('.relojes li').count(), 6);
      const first = page.locator('.bloque').first();
      assert.match(await first.innerText(), /Repaso flash[\s\S]*Control 1 hoy/);
      // Listo → se tacha y sobrevive a recargar; Deshacer lo vuelve atrás.
      await first.locator('[data-org-done]').click();
      await page.reload(); await page.locator('.bloque').first().waitFor();
      assert.equal(await page.locator('.bloque').first().evaluate(el => el.classList.contains('hecho')), true);
      await page.locator('[data-org-undo]').first().click();
      assert.equal(await page.locator('.bloque.hecho').count(), 0);
      // Hoy no → sale del plan, con deshacer.
      const n = await page.locator('.bloque').count();
      const third = await page.locator('.bloque').nth(2).innerText();
      await page.locator('[data-org-skip]').nth(2).click();
      assert.notEqual(await page.locator('.bloque').nth(2).innerText().catch(() => ''), third);
      await page.locator('#toast button').click().catch(() => {});
      assert.equal(await page.locator('.bloque').count(), n);
      // Tiempo de hoy (−/+) cambia el plan y se guarda por día de la semana.
      await page.locator('[data-org-min="-15"]').click();
      assert.match(await page.locator('.hoy-tiempo b').innerText(), /105 min/);
      // Calendario: agregar rápido (qué, ramo, tipo, fecha).
      await page.goto(origin + '#/planner/calendario');
      await page.locator('[data-org-add]').click();
      await page.fill('[data-org-form] input[name=title]', 'Informe P-2');
      await page.selectOption('[data-org-form] select[name=type]', 'deadline');
      await page.fill('[data-org-form] input[name=date]', '2026-10-20');
      await page.locator('[data-org-form] button[type=submit]').click();
      assert.equal(await page.locator('.semana li', { hasText: 'Informe P-2' }).count(), 1);
      // Lab: marcar pre-lab listo queda guardado.
      await page.goto(origin + '#/planner/lab');
      await page.locator('[data-org-prelab="official-org-lab-1"]').click();
      await page.reload();
      assert.match(await page.locator('[data-org-prelab="official-org-lab-1"]').innerText(), /Pre-lab listo/);
      // Notas: guardar con el teclado, roja → autopsia, deshacer, simulador, faltas con aviso, y #/profile/grades redirige.
      await page.goto(origin + '#/planner/notas'); await page.locator('.frasco').first().waitFor();
      await page.locator('[data-nt-subject="analitica"]').click();
      await page.locator('[data-nt-grade="official-ana-pep1"]').click();
      for (const k of ['5', '5']) await page.locator(`[data-nt-key="${k}"]`).click();
      await page.locator('[data-nt-nota-form] button[type=submit]').click();
      assert.equal(await page.locator('[data-nt-grade="official-ana-pep1"].lv-verde').count(), 1);
      assert.match(await page.locator('.placa').first().innerText(), /Necesitas/);
      await page.locator('[data-nt-grade="official-ana-pep2"]').click();
      await page.fill('[data-nt-input]', '3,2'); await page.locator('[data-nt-nota-form] button[type=submit]').click();
      assert.equal(await page.locator('[data-nt-autopsy-form]').count(), 1, 'nota roja ofrece contar qué pasó');
      await page.fill('[data-nt-autopsy-form] input[name=tipo]', 'titulaciones'); await page.selectOption('[data-nt-autopsy-form] select', 'calculo');
      await page.locator('[data-nt-autopsy-form] button[type=submit]').click();
      await page.evaluate(() => window.NexoStorage.flush());
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('nexo-study-beta')).errors.filter(e => e.source === 'autopsia' && e.subject === 'analitica').length), 1, 'la autopsia entra a los errores abiertos');
      assert.match(await page.locator('.riesgos').innerText(), /sin eximición/);
      await page.locator('[data-nt-grade="official-ana-pep3"]').click();
      await page.fill('[data-nt-input]', '9'); await page.locator('[data-nt-nota-form] button[type=submit]').click();
      assert.equal(await page.locator('.nt-error').isVisible(), true, 'nota fuera de rango'); await page.keyboard.press('Escape');
      await page.locator('[data-nt-sim]').first().fill('6');
      assert.match(await page.locator('[data-nt-simout]').first().innerText(), /sacas 6,0/);
      await page.locator('[data-nt-max="theory"]').fill('2'); await page.locator('[data-nt-max="theory"]').press('Tab');
      await page.locator('[data-nt-abs-form] button[type=submit]').click();
      assert.match(await page.locator('.asis-msg').first().innerText(), /Te quedan 1 falta|Te queda 1 falta/);
      await page.reload(); await page.locator('.frasco').first().waitFor();
      assert.equal(await page.locator('[data-nt-grade="official-ana-pep1"].lv-verde').count(), 1, 'la nota sobrevive a recargar');
      await page.locator('[data-nt-grade="official-ana-pep1"]').click(); await page.locator('[data-nt-clear]').click();
      await page.locator('#toast button').click();
      assert.equal(await page.locator('[data-nt-grade="official-ana-pep1"].lv-verde').count(), 1, 'deshacer devuelve la nota');
      await page.goto(origin + '#/profile/grades'); await page.locator('.estudio-page').waitFor();
      assert.equal(await page.evaluate(() => location.hash), '#/planner/notas');
      // Inicio: tablón por urgencia, cinta, calendario que brilla y plan con Empezar.
      await page.goto(origin + '#/home');
      await page.locator('.evaluation-note.u-hoy').waitFor();
      assert.equal(await page.locator('.scene-hotspot.org-brilla[data-scene-hotspot="parchment-calendar"]').count(), 1);
      assert.match(await page.locator('.cinta-tablon').innerText(), /4 evaluaciones/);
      await page.locator('[data-org-home-start]').first().click();
      assert.equal(await page.evaluate(() => location.hash), '#/hub/timer');
      assert(await overflow() <= 1, `desborde horizontal a ${width}px`);
      assert.equal(errors.length, 0, errors.join('\n'));
      await page.close();
    }
    console.log('Organización E2E: rutas viejas → estudio, plan de hoy, agregar, pre-lab, notas (teclado, roja, simulador, faltas, deshacer), avisos del Inicio, 390 y 1440 OK');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
