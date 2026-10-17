#!/usr/bin/env node
// Hook de Claude Code: cuando se edita un archivo de docs/chats/, regenera el tablero (docs/hoja-de-ruta.html) solo.
const { execFileSync } = require('child_process');
const path = require('path');

let raw = '';
process.stdin.on('data', d => { raw += d; });
process.stdin.on('end', () => {
  let file = '';
  try { file = String(JSON.parse(raw).tool_input.file_path || ''); } catch (e) { return; }
  const norm = file.replace(/\\/g, '/');
  if (!/\/docs\/chats\/[^/]+\.md$/.test(norm) || norm.endsWith('/README.md')) return;
  execFileSync(process.execPath, [path.join(__dirname, 'build-hoja.cjs')], { stdio: 'ignore' });
});
