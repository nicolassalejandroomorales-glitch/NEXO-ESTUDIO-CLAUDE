const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const dist = path.resolve(__dirname, '..', 'dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.webp': 'image/webp', '.png': 'image/png', '.riv': 'application/octet-stream', '.pdf': 'application/pdf' };
const server = http.createServer((request, response) => {
  const file = path.resolve(dist, `.${decodeURIComponent(new URL(request.url, 'http://localhost').pathname === '/' ? '/index.html' : new URL(request.url, 'http://localhost').pathname)}`);
  if (!file.startsWith(`${dist}${path.sep}`)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(data);
  });
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: ['--no-sandbox','--disable-dev-shm-usage'], headless: true }
    : { channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const capture = async (name,fullPage=true) => {
    if (!process.env.NEXO_SCREENSHOTS) return;
    const folder = path.join(__dirname, '..', 'tmp', 'v11-visual');
    fs.mkdirSync(folder, { recursive: true });
    await page.screenshot({ path: path.join(folder, `${name}.png`), fullPage });
  };
  try {
    await page.goto(`${url}#/home`);
    await page.locator('.rpg-stage').waitFor();
    await page.locator('.rpg-stage .avatar-canvas-v10[data-engine="rive"]').waitFor({timeout:15000});
    await page.waitForFunction(() => performance.getEntriesByType('resource').some(item => item.name.endsWith('/assets/home-mascot-refuge.webp')));
    assert.ok(['Idle','Read'].includes(await page.locator('.rpg-stage .avatar-canvas-v10').getAttribute('data-pose')));
    await capture('home-desktop');
    assert.equal(await page.locator('.heart-hud,.rpg-duel').count(), 0);
    assert.equal(await page.evaluate(() => performance.getEntriesByType('resource').some(item => /(?:phaser|howler|gsap)\.min\.js/.test(item.name))), false);
    await page.locator('.rail-nav [data-route="games"]').click();
    await page.locator('.game-placeholder').first().waitFor();
    await page.waitForFunction(() => performance.getEntriesByType('resource').some(item => item.name.endsWith('/assets/rooms/games.webp')));
    assert.equal(await page.locator('.game-placeholder').count(),4);
    assert.equal(await page.evaluate(() => performance.getEntriesByType('resource').some(item => /phaser\.min\.js/.test(item.name))),false);
    await capture('games-desktop');
    await page.locator('.rail-nav [data-route="learn"]').click();
    await page.locator('.subject-card').first().waitFor();
    await page.waitForFunction(() => performance.getEntriesByType('resource').some(item => item.name.endsWith('/assets/rooms/learn.webp')));
    await page.locator('#companionPresence .avatar-canvas-v10[data-engine="rive"][data-pose="Read"]').waitFor({state:'attached',timeout:15000}); // en escritorio el avatar solo se ve en el Inicio
    await capture('learn-desktop');
    await page.goto(`${url}#/learn/map`);
    await page.locator('.academic-map').waitFor();
    await page.goto(`${url}#/learn/library`);
    await page.locator('.academic-library').waitFor();
    await page.goto(`${url}#/learn/course/organica/concept/org.pka`);
    await page.locator('.academic-map').waitFor();
    assert.match(await page.locator('.academic-concept-detail h2').textContent(),/pKa/i);
    await page.goto(`${url}#/learn/course/organica/lesson/org-01`);
    await page.locator('.amine-lesson').waitFor();
    await page.goto(`${url}#/profile/collection`);
    await page.locator('.forge-editor').waitFor();
    await page.goto(`${url}#/profile/progress`);
    await page.locator('.profile-page').waitFor();
    await page.waitForFunction(() => performance.getEntriesByType('resource').some(item => item.name.endsWith('/assets/rooms/profile.webp')));
    await capture('profile-desktop');
    await page.goto(`${url}#/subject/organica`);
    await page.locator('[data-open-lesson="org-01"]').first().click();
    await page.locator('.amine-lesson').waitFor();
    const structured=page.locator('[data-structured-case="sv-protonation"]');
    await structured.waitFor();
    await structured.locator('[name="bonds"]').selectOption('3');
    await structured.locator('[name="charge"]').selectOption('+1');
    await structured.locator('[name="chloride"]').selectOption('counterion');
    await structured.locator('button[type="submit"]').click();
    await page.locator('[data-structured-case="sv-protonation"] .structured-feedback.incorrect').waitFor();
    assert(await page.locator('[data-structured-case="sv-protonation"] .structured-feedback').textContent().then(text=>text.includes('cuatro enlaces')));
    await page.locator('[data-structured-case="sv-protonation"] [name="bonds"]').selectOption('4');
    await page.locator('[data-structured-case="sv-protonation"] button[type="submit"]').click();
    await page.locator('[data-structured-case="sv-protonation"] .structured-feedback.correct').waitFor();
    const structuredEvidence=await page.evaluate(()=>JSON.parse(localStorage.getItem('nexo-study-beta')).academicIntelligence.evidence.filter(item=>item.exerciseId==='org-01:sv-protonation'&&item.conceptId==='org.protonation'));
    assert.equal(structuredEvidence.length,2);
    assert.equal(structuredEvidence[0].source,'structured_validator');
    assert.equal(structuredEvidence[0].assistanceUsed,true);
    assert.equal(structuredEvidence[1].outcome,'incorrect');
    await page.waitForTimeout(1100);
    await page.locator('.back-btn').first().click();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('nexo-study-beta')).academicIntelligence.activeTimeSegments.length>=1);
    await page.locator('[data-open-lesson="org-01"]').first().waitFor();
    await page.locator('[data-route="knowledge"]').click();
    await page.locator('.academic-map-node').first().waitFor();
    assert.equal(await page.locator('.academic-map-node').count(),8);
    assert.ok(await page.locator('.rank-flame').count()>=8);
    await page.locator('[data-academic-select="org.protonation"]').click();
    assert(await page.locator('.academic-concept-detail').textContent().then(text=>text.includes('Pares libres')));
    await page.locator('[data-route="reviews"]').click();
    await page.locator('.academic-reviews').waitFor();
    await page.evaluate(()=>{
      const state=JSON.parse(localStorage.getItem('nexo-study-beta'));
      state.academicIntelligence.attempts.unshift(
        {id:'seed-prerequisite-a',exerciseId:'org-01:b01',familyId:'org.protonation.charge',
          conceptIds:['org.protonation'],outcome:'incorrect',assistanceUsed:false},
        {id:'seed-prerequisite-b',exerciseId:'org-01:b03',familyId:'org.basicity.resonance',
          conceptIds:['org.resonance'],outcome:'incorrect',assistanceUsed:false});
      localStorage.setItem('nexo-study-beta',JSON.stringify(state));
    });
    await page.reload();
    await page.goto(`${url}#/lesson/org-01`);
    await page.locator('.amine-lesson').waitFor();
    await capture('amine-desktop-top',false);
    await page.locator('[data-amine-concepts-open]').click();
    await page.locator('[data-amine-diagnostic="org.lone-pair"]').click();
    await page.locator('[data-structured-case="sv-heterocycle"] [name="site"]').selectOption('nh');
    await page.locator('[data-structured-case="sv-heterocycle"] [name="pi"]').selectOption('6');
    await page.locator('[data-structured-case="sv-heterocycle"] [name="after"]').selectOption('retained');
    await page.locator('[data-structured-case="sv-heterocycle"] button[type="submit"]').click();
    await page.locator('[data-structured-case="sv-heterocycle"] .structured-feedback.incorrect').waitFor();
    await page.locator('[data-structured-case="sv-resonance"] [name="stronger"]').selectOption('aniline');
    await page.locator('[data-structured-case="sv-resonance"] [name="conjugates"]').selectOption('aniline');
    await page.locator('[data-structured-case="sv-resonance"] [name="benzene"]').selectOption('retained');
    await page.locator('[data-structured-case="sv-resonance"] button[type="submit"]').click();
    await page.locator('[data-structured-case="sv-resonance"] .structured-feedback.incorrect').waitFor();
    await page.goto(`${url}#/rescue/org.lone-pair`);
    await page.locator('.arcane-rescue .rescue-page').waitFor();
    await capture('rescue-desktop');
    assert(await page.locator('.arcane-rescue').textContent().then(text=>text.includes('La misma flecha')));
    await page.locator('[data-rescue-next]').click();
    await page.locator('[data-rescue-next]').click();
    await page.locator('[data-rescue-case="sv-pep-hetero"] [name="most"]').selectOption('piperidine');
    await page.locator('[data-rescue-case="sv-pep-hetero"] [name="least"]').selectOption('pyrrole');
    await page.locator('[data-rescue-case="sv-pep-hetero"] [name="pyridinium"]').selectOption('retained');
    await page.locator('[data-rescue-case="sv-pep-hetero"] [name="reason"]').fill('El par piridínico queda fuera del sexteto aromático.');
    await page.locator('[data-rescue-case="sv-pep-hetero"] button[type="submit"]').click();
    await page.locator('.rescue-case .structured-feedback.correct').waitFor();
    await page.locator('[data-rescue-next]').click();
    await page.locator('[data-rescue-case="sv-pep-order"] [name="order"]').selectOption('n-a-m-b');
    await page.locator('[data-rescue-case="sv-pep-order"] [name="shared"]').selectOption('direct');
    await page.locator('[data-rescue-case="sv-pep-order"] [name="benzyl"]').selectOption('sp3');
    await page.locator('[data-rescue-case="sv-pep-order"] [name="reason"]').fill('El metoxi dona y un carbono saturado separa bencilamina del anillo.');
    await page.locator('[data-rescue-case="sv-pep-order"] button[type="submit"]').click();
    await page.locator('.rescue-case .structured-feedback.correct').waitFor();
    await page.locator('[data-rescue-next]').click();
    assert(await page.locator('.arcane-rescue').textContent().then(text=>text.includes('Rescate practicado')));
    assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('nexo-study-beta')).academicIntelligence.attempts.some(item=>item.activityType==='rescue')));
    await page.goto(`${url}?nexoDev=1#/inspector`);
    await page.locator('.academic-inspector').waitFor();
    assert(await page.locator('.academic-inspector').textContent().then(text=>text.includes('avisos')));
    await page.goto(`${url}?nexoDev=1#/review`);
    await page.locator('.dev-link-grid').waitFor();
    await capture('review-desktop');
    await page.locator('[data-dev-route="ui-lab"]').click();
    await page.locator('.dev-swatches').first().waitFor();
    assert.equal(await page.locator('.dev-swatches').count(),3);
    await capture('ui-lab-desktop');
    await page.goto(`${url}?nexoDev=1#/performance`);
    await page.locator('[data-dev-fps]').waitFor();
    await page.waitForTimeout(1100);
    assert.match(await page.locator('[data-dev-fps]').textContent(),/^\d+$/);
    await page.goto(`${url}#/review`);
    await page.locator('.rpg-stage').waitFor();
    assert.equal(await page.locator('.dev-workbench').count(),0);
    await page.goto(`${url}#/lesson/org-02`);
    await page.locator('.org-studio').waitFor({ timeout: 8000 }).catch(async error => { console.error('Orgánica 02:', page.url(), errors, await page.locator('body').textContent({timeout:2000}).catch(() => 'BODY NO DISPONIBLE')); throw error; });
    await page.locator('[data-org-smiles] img').first().waitFor({ timeout: 20000 });
    await capture('organic-desktop');
    const organicResources = await page.evaluate(() => performance.getEntriesByType('resource').map(item => item.name));
    assert.ok(organicResources.some(name => name.includes('organic-pep1.js')));
    assert.equal(organicResources.some(name => name.includes('organic-pep3.js') || name.includes('rdkit.js') || name.includes('phaser.min.js')), false);
    await page.goto(`${url}#/hub/timer`);
    await page.locator('[data-action="timer-start"]').click();
    await page.waitForTimeout(1300);
    await page.locator('[data-action="timer-finish"]').click();
    assert.ok(await page.evaluate(() => JSON.parse(localStorage.getItem('nexo-study-beta')).sessions.length) >= 1);
    await page.goto(`${url}#/hub/calendar`);
    await capture('calendar-desktop');
    await page.locator('[data-calendar-new]').click();
    await page.locator('[data-event-form] [name="title"]').fill('Evento V11 E2E');
    await page.locator('[data-event-form] button[type="submit"]').click();
    assert.ok(await page.evaluate(() => JSON.parse(localStorage.getItem('nexo-study-beta')).events.some(e => e.title === 'Evento V11 E2E')));
    await page.goto(`${url}#/profile/grades`);
    await page.locator('[data-profile-grade-subject="organica"]').click();
    const grade = page.locator('[data-profile-grade-field="grade"]').first();
    await grade.fill('5,50'); await grade.press('Tab');
    await page.goto(`${url}#/shop`);
    await page.locator('.shop-page,.shop-v10,.page').first().waitFor();
    await page.locator('[data-v13-preview]').first().click();
    assert(await page.locator('[data-forge-stage]').textContent());
    await page.locator('[data-v13-preview="hat-beanie"]').click();
    await page.locator('[data-forge-stage] canvas[data-engine="layered"]').waitFor();
    await page.goto(`${url}#/profile/settings`);
    await page.locator('[data-performance-setting="graphicsQuality"]').selectOption('low');
    assert.equal(await page.locator('body').getAttribute('data-nexo-quality'),'low');
    assert.ok(await page.locator('.ambient-particle').count()<=2);
    await page.locator('[data-performance-setting="graphicsQuality"]').selectOption('auto');
    await page.locator('[data-action="reset-app"]').click();
    await page.locator('[data-modal-panel]').waitFor();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.querySelector('[data-modal-panel]').contains(document.activeElement)), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-modal-panel]').count(), 0);
    await page.goto(`${url}#/profile`);
    await page.locator('.profile-page').waitFor();
    await page.reload();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('nexo-study-beta')).grades.organica.components[0].grade), '5.50');
    for (const width of [768, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of ['home', 'learn', 'subjects', 'subject/organica', 'knowledge', 'reviews', 'lesson/org-01', 'hub/timer', 'hub/calendar', 'hub/grades', 'shop', 'profile/grades']) {
        await page.goto(`${url}#/${route}`);
        await page.locator('#app').waitFor();
        if(width===390&&route==='learn')await page.locator('#companionPresence .avatar-canvas-v10[data-engine="rive"][data-pose="Read"]').waitFor({timeout:15000});
        if (width === 390 && ['home','learn', 'lesson/org-01', 'hub/calendar', 'hub/grades', 'shop', 'profile/grades'].includes(route)) await capture(`${route.replace('/', '-')}-mobile`);
        if(width===390&&route==='lesson/org-01')await capture('amine-mobile-top',false);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert.ok(overflow <= 1, `Overflow ${overflow}px en ${route} a ${width}px`);
      }
      await page.goto(`${url}?nexoDev=1#/ui-lab`);
      await page.locator('.dev-swatches').first().waitFor();
      assert.equal(await page.locator('.dev-rank-item').count(),6);
      assert(await page.locator('#dev-feedback .dev-feedback').count()>=2);
      assert(await page.locator('#dev-mascot').textContent().then(text=>text.includes('Fallback')));
      if(width===390)await capture('ui-lab-mobile');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, `Overflow en UI Lab a ${width}px`);
      await page.goto(`${url}?nexoDev=1#/review`);
      await page.locator('.dev-link-grid').waitFor();
      for(const label of ['Feedback','Rescate','Mascota','Rangos arcanos'])
        assert(await page.locator('.dev-link-grid').textContent().then(text=>text.includes(label)));
    }
    for(const viewport of [{width:375,height:812},{width:844,height:390},{width:1440,height:900}]){
      await page.setViewportSize(viewport);
      for(const route of ['home','rescue/org.lone-pair','lesson/org-01','hub/calendar','shop','profile']){
        await page.goto(`${url}#/${route}`);
        if(route==='lesson/org-01')await page.locator('.amine-lesson').waitFor();
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
        assert.ok(overflow<=1,`Overflow ${overflow}px en ${route} a ${viewport.width}×${viewport.height}`);
      }
    }
    await page.goto(`${url}#/profile`);
    await page.locator('.profile-page').waitFor();
    assert.deepEqual(errors, []);
    await page.evaluate(() => {
      const current = JSON.parse(localStorage.getItem('nexo-study-beta'));
      current.version = 13;
      current.hearts = { count: 2 };
      current.grades.organica.components[0].grade = '6.25';
      localStorage.setItem('nexo-study-beta', JSON.stringify(current));
    });
    await page.reload();
    await page.locator('.profile-page').waitFor();
    const migrated = await page.evaluate(() => ({ current: JSON.parse(localStorage.getItem('nexo-study-beta')), source: JSON.parse(localStorage.getItem('nexo-study-beta-pre-v11')) }));
    assert.equal(migrated.current.version, 19);
    assert.equal(migrated.current.hearts, undefined);
    assert.equal(migrated.current.grades.organica.components[0].grade, '6.25');
    assert.equal(migrated.source.hearts.count, 2);
    const dependencies = await page.evaluate(async () => {
      await window.NexoAnimation.reveal(document.querySelector('.profile-page'));
      const howler = await window.NexoAudio.init();
      window.NexoGame.register('test-only', ({ Phaser }) => ({ loaded: Boolean(Phaser), destroy() {} }));
      const game = await window.NexoGame.loadGame('test-only', document.body);
      window.NexoGame.unloadGame();
      return { gsap: Boolean(window.gsap), howler: Boolean(howler), phaser: game.loaded, registered: window.NexoGame.registered() };
    });
    assert.equal(dependencies.gsap, true);
    assert.equal(dependencies.howler, true);
    assert.equal(dependencies.phaser, true);
    assert.deepEqual(dependencies.registered, ['test-only']);
    console.log('OK: navegación, Aminas, entrenamiento, cronómetro, calendario, notas, tienda, perfil y responsive 375/390/768/1440/landscape.');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
