const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const dist = path.resolve(__dirname, '..', 'dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.riv': 'application/octet-stream' };
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const file = path.resolve(dist, `.${decodeURIComponent(pathname === '/' ? '/index.html' : pathname)}`);
  if (!file.startsWith(`${dist}${path.sep}`)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(data);
  });
});

(async () => {
  if (!process.env.NEXO_TEST_URL) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: ['--no-sandbox','--disable-dev-shm-usage'], headless: true }
    : { headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const url = process.env.NEXO_TEST_URL || `http://127.0.0.1:${server.address().port}/`;
  try {
    // Notas e Inasistencias se mudaron a Organización: el Perfil solo redirige y ya no muestra esas pestañas.
    await page.addInitScript(() => { if (!localStorage.getItem('nexo-study-beta')) localStorage.setItem('nexo-study-beta', JSON.stringify({ version: 19, tutorial: { status: 'done', rewarded: true, sections: {}, news: 99 } })); });
    await page.goto(`${url}#/profile/mascot`);
    assert.deepEqual(await page.locator('[data-profile-tab]').allInnerTexts(), ['Mascota', 'Estadísticas', 'Ajustes']);
    for (const old of ['grades', 'absences']) {
      await page.goto(`${url}#/profile/${old}`); await page.locator('.estudio-page').waitFor();
      assert.equal(await page.evaluate(() => location.hash), '#/planner/notas');
    }
    // Una nota se guarda con coma decimal, se rechaza lo fuera de rango y sobrevive a recargar.
    await page.locator('[data-nt-subject="organica"]').click();
    await page.locator('[data-nt-grade="official-org-pep1"]').click();
    await page.fill('[data-nt-input]', '8'); await page.locator('[data-nt-nota-form] button[type=submit]').click();
    assert.equal(await page.locator('.nt-error').isVisible(), true);
    await page.fill('[data-nt-input]', '5,5'); await page.locator('[data-nt-nota-form] button[type=submit]').click();
    await page.evaluate(() => window.NexoStorage.flush());
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('nexo-study-beta')).grades.organica.components[0].grade), '5.50');
    await page.reload(); await page.locator('.frasco').first().waitFor();
    assert.equal(await page.locator('[data-nt-grade="official-org-pep1"].lv-verde').count(), 1);
    // Inasistencias: anotar una falta de laboratorio, persistir y borrar.
    await page.locator('[data-nt-abs-form] input[name="date"]').fill('2026-09-22');
    await page.locator('[data-nt-abs-form] select[name="group"]').selectOption('lab');
    await page.locator('[data-nt-abs-form] button[type="submit"]').click();
    assert.equal(await page.locator('.asis-lista li').count(), 1);
    await page.reload(); await page.locator('.asis-lista').waitFor();
    assert.match(await page.locator('.asis-lista li').innerText(), /Laboratorio/);
    await page.locator('[data-nt-subject="analitica"]').click();
    assert.equal(await page.locator('.asis-lista li').count(), 0);
    await page.locator('[data-nt-subject="organica"]').click();
    await page.locator('[data-nt-abs-del]').click();
    assert.equal(await page.locator('.asis-lista li').count(), 0);
    // Móvil sin desborde.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${url}#/planner/notas`); await page.locator('.frasco').first().waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    // Datos viejos (versión 14) con evaluaciones propias: se ven en "Ajustar ramo".
    await page.evaluate(() => window.NexoStorage.flush());
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('nexo-study-beta'));
      data.version = 14;
      data.grades.analitica.components = Array.from({ length: 4 }, (_, index) => ({ id: `custom-${index}`, name: `Evaluación propia ${index}`, group: 'theory', weight: '', grade: index === 0 ? '5.00' : '' }));
      localStorage.setItem('nexo-study-beta', JSON.stringify(data));
    });
    await page.reload();
    await page.locator('[data-nt-subject="analitica"]').click();
    await page.locator('[data-nt-edit-toggle]').click();
    assert.equal(await page.locator('[data-nt-field="name"]').first().inputValue(), 'Evaluación propia 0');
    console.log('OK: Perfil sin Notas/Inasistencias (redirigen), notas con coma, faltas, persistencia, datos antiguos y móvil.');
  } finally {
    await browser.close();
    if (server.listening) await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
