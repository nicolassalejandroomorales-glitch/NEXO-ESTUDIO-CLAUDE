// Servidor mínimo SOLO para la prueba de Classroom. Sirve únicamente esta carpeta.
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const allowed = { '/': 'index.html', '/index.html': 'index.html', '/config.js': 'config.js' };
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
  const file = allowed[pathname];
  if (!file) { response.writeHead(404).end('Not found'); return; }
  fs.readFile(path.join(root, file), (error, data) => {
    if (error) { response.writeHead(404).end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Cache-Control': 'no-store' });
    response.end(data);
  });
}).listen(8766, '127.0.0.1', () => console.log('Prueba Classroom: http://127.0.0.1:8766'));
