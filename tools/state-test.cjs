const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const dist = path.join(__dirname, '..', 'dist');
const entries = new Map();
const localStorage = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, String(value)) };
const window = { addEventListener() {} };
const context = { window, document: { addEventListener() {} }, localStorage, setTimeout, clearTimeout, Date, JSON };
vm.runInNewContext(fs.readFileSync(path.join(dist, 'core/migrations.js'), 'utf8'), context);
vm.runInNewContext(fs.readFileSync(path.join(dist, 'core/storage.js'), 'utf8'), context);
vm.runInNewContext(fs.readFileSync(path.join(dist, 'study/economy.js'), 'utf8'), context);
for (const [seconds, atoms] of [[0,0],[299,0],[900,0],[1800,5],[3600,8],[7200,10]]) assert.equal(window.NexoEconomy.sessionReward(seconds), atoms);

const original = {
  version: 13, hearts: { count: 2 }, duel: { streak: 3 }, coins: 487,
  sessions: [{ id: 's1', seconds: 900 }],
  grades: { organica: { components: [{ name: 'PEP 1', grade: '5.50' }] } },
  events: [{ id: 'e1', title: 'PEP 1' }], inventory: ['species-pig', 'hat-star'],
  organicProgress: { 'org-01': { status: 'inestable', firstAttemptAt: '2026-09-22' } }
};
const raw = JSON.stringify(original);
window.NexoStorage.preserveBeforeMigration(raw);
const migrated = window.NexoMigrations.migrate(original);
assert.equal(migrated.version, 13, 'No adelantar versión antes de migraciones previas');
assert.equal(migrated.hearts, undefined);
assert.equal(migrated.duel, undefined);
for (const key of ['coins', 'sessions', 'grades', 'events', 'inventory', 'organicProgress']) assert.deepEqual(JSON.parse(JSON.stringify(migrated[key])), original[key]);
assert.equal(window.NexoStorage.getItem(window.NexoStorage.PRE_V11), raw);
const v11={...original,version:16,meta:{createdAt:'2026-09-20T00:00:00Z'}};
const v11raw=JSON.stringify(v11);
window.NexoStorage.preserveBeforeV12(v11raw);
window.NexoStorage.preserveBeforeV12(JSON.stringify({...v11,coins:0}));
assert.equal(window.NexoStorage.getItem(window.NexoStorage.PRE_V12),v11raw,'respaldo V11 inmutable');
const v12=window.NexoMigrations.migrate(v11,17);
window.NexoStorage.preserveBeforeV13(JSON.stringify(v12));
window.NexoStorage.preserveBeforeV13(JSON.stringify({...v12,coins:0}));
assert.equal(JSON.parse(window.NexoStorage.getItem(window.NexoStorage.PRE_V13)).coins,487,'respaldo V12 inmutable');
assert.equal(v12.meta.migrationVersion,12);
assert.equal(v12.meta.localSchemaVersion,17);
for(const key of ['coins','sessions','grades','events','inventory','organicProgress'])
  assert.deepEqual(JSON.parse(JSON.stringify(v12[key])),v11[key]);
const v13=window.NexoMigrations.migrate({...v12,version:17,settings:{volume:.65}});
assert.equal(v13.meta.migrationVersion,13);
assert.equal(v13.meta.localSchemaVersion,18);
assert.equal(v13.settings.sfxVolume,.65);
window.NexoStorage.preserveBeforeV14(JSON.stringify({...v13,version:18}));
window.NexoStorage.preserveBeforeV14(JSON.stringify({...v13,version:18,coins:0}));
assert.equal(JSON.parse(window.NexoStorage.getItem(window.NexoStorage.PRE_V14)).coins,487);
const v14=window.NexoMigrations.migrate({...v13,version:18,organicProgress:{'org-01':{answers:{b01:'contenido privado'}}}},19);
assert.equal(v14.meta.localSchemaVersion,19);
assert.equal(v14.meta.migrationVersion,14);
assert.equal(v14.organicProgress['org-01'].answers.b01,'contenido privado');
assert.deepEqual(JSON.parse(JSON.stringify(v14.academicIntelligence.attempts)),[]);
window.NexoStorage.schedule({ ...migrated, version: 16, meta: {} }, { backup: false });
assert.equal(entries.has(window.NexoStorage.KEY), false, 'Guardado editable debe agruparse');
window.NexoStorage.flush();
assert.equal(JSON.parse(window.NexoStorage.getItem(window.NexoStorage.KEY)).coins, 487);
window.NexoStorage.schedule({ ...migrated, version: 16, coins: 500, meta: {} }, { backup: true });
assert.equal(JSON.parse(window.NexoStorage.getItem(window.NexoStorage.BACKUP)).coins, 487);
let writeErrors = 0;
window.NexoStorage.onError(() => { writeErrors += 1; });
const originalSet = localStorage.setItem;
localStorage.setItem = (key, value) => { if (key === window.NexoStorage.KEY) throw new Error('quota'); originalSet(key, value); };
window.NexoStorage.schedule({ ...migrated, version: 16, coins: 510, meta: {} }, { backup: false });
assert.equal(window.NexoStorage.flush(), false);
assert.equal(writeErrors, 1);
localStorage.setItem = originalSet;
assert.equal(window.NexoStorage.flush(), true);
assert.equal(JSON.parse(window.NexoStorage.getItem(window.NexoStorage.KEY)).coins, 510);
console.log('OK: migración explícita, respaldo previo, datos académicos y guardado diferido/flush.');
