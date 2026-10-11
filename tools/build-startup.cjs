const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

// Conservar fuentes modulares y reducir viajes de red en el arranque. Estos módulos
// ya son IIFE/registro global y deben ejecutarse en el mismo orden que index.html.
const startupModules = [
  'cloud/foundation.js', 'core/storage.js', 'core/migrations.js',
  'design-system/home-scene.js', 'design-system/rooms.js', 'design-system/preparation.js', 'ambient/time.js', 'ambient/events.js',
  'planner/priority.js', 'planner/labs.js', 'planner/grades.js',
  'study/economy.js', 'academic/amine-mastery.js', 'academic/active-time.js',
  'academic/history.js', 'platform/loader.js', 'platform/performance.js',
  'platform/animation.js', 'platform/audio.js', 'game/manager.js',
  'mascot/controller.js',
  'organic-manifest.js', 'classes/catalog.js'
];
const startupBundle = startupModules.map(name => {
  const code = fs.readFileSync(path.join(root, 'dist', name), 'utf8');
  return `\n/* ${name} */\n${code}\n;`;
}).join('\n');
fs.writeFileSync(path.join(root, 'dist', 'startup-bundle.js'),
  '/* Generado por tools/build.cjs; editar los módulos fuente, no este archivo. */\n' + startupBundle);
console.log(`Arranque: ${startupModules.length} módulos en startup-bundle.js.`);
