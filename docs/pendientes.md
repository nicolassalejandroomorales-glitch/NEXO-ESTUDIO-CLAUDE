# Pendientes de temas sin SPEC propio

Ideas o decisiones que aparecieron en un chat pero pertenecen a otro tema. Cada una debe pasar a su propio `docs/<tema>/SPEC.md` cuando se trabaje.

## Estilo visual "pixel art" (5 oct 2026) — DECIDIDO

- El Inicio se rehace en pixel art en su propio chat: `docs/inicio-pixelart/SPEC.md` (418×235 px de arte ×4, rampas de color, sin filtros).
- Las mascotas ya están en pixel art con las mismas rampas y tamaño de píxel: `docs/mascota/SPEC.md` (Fase 5) y `/dev/mascota-pixel.html`.
  A Niquito le encantó ("creo que esto era lo que quería").
- Pendiente para otros temas: decidir si el **grimorio, las clases, la tienda y los juegos** también pasan a pixel art (fuentes, botones, paneles).
  Cada uno en su chat, reutilizando las rampas de `tools/home-pixel/pixel.py` para que todo se vea del mismo mundo.

## Pruebas rotas desde antes (11 oct 2026, chat de unión de ramas)
- `tools/run-tests.cjs` salta 4 pruebas que ya fallaban: `update01-test` (espera "Bloque del catálogo", la app dice "Evaluación"),
  `update01-dom-test` (falta `jsdom`), `update01-integrity-test` (lee `Desktop/MANIFIESTO_SHA256.tsv`, fuera del repo) y `web-vitals-test` (navegador).
  Arreglar cada una y sacarla de `SALTAR`.

## Torre / mundo (19 oct 2026, chat de rangos del motor)
- `dist/world/torre-mundo.js` → `labProgress` cuenta como casos del piloto todo `exerciseId` que empiece con `org-01:`.
  Desde el puente de clases (18 oct) la clase org-01 usa el mismo prefijo, así que el laboratorio puede avanzar de más.
  Arreglo sugerido: filtrar también `r.source === 'structured_validator'`.
