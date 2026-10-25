---
name: nexo-inicio
description: Reglas del Inicio de Nexo (refugio, escena, luz, objetos tocables, pixel art). Úsala antes de tocar home-scene.js, update01.css, ambient/time.js, assets de home-scenes o scripts de tools/home-*.
---

# Inicio / refugio de Nexo

## Archivos
- `dist/design-system/home-scene.js`: **única fuente de verdad** del Inicio (capas, hotspots, anclas de la mascota) en coordenadas del arte 1672×941.
- `dist/design-system/update01.css`: estilos del Inicio y grimorio; al final, capas de luz, objetos y "vida".
- `dist/ambient/time.js`: reloj de luz. Escribe `--w-dawn/--w-day/--w-dusk/--w-night` (suman 1) y `data-nexo-time`.
- Tras editar módulos del bundle: `node tools/build-startup.cjs`. Sube `?v=` en `dist/index.html`.
- Debug: `?debugScene=true#/home`. Consola: `NexoAmbientTime.timelapse()`, `.preview(21)`, `.stopPreview()`.

## Reglas
- `dist/assets/home-scenes/refugio-012.png` es el original: **nunca se modifica ni se borra**.
- Desde el 5 oct 2026 el Inicio es **pixel art de verdad** (`refugio-pixel.png`, 418×235 ×4, ver `docs/inicio-pixelart/SPEC.md`): sigue la skill `nexo-pixel-art`. Le gustan el piso, la ventana y las runas (no agregar más runas).
- Cada asset nuevo sale de un **script reproducible** en `tools/` que escribe en `dist/assets/home-scenes/`.
- Objetos tocables: usan el router normal (`data-route` / `data-route-sub`), invisibles, sin etiquetas ni bordes, solo brillo suave al pasar el mouse.
- Toda capa de luz usa `--w-*` o `--sun` / `--lamps` (cambio gradual). **No** crear reglas por estado `body[data-nexo-time=...]`.
- Respetar `prefers-reduced-motion`, `data-nexo-ambient-motion="reduced"`, `data-nexo-quality="low"` y `body.ambient-paused`.
- Móvil (≤700 px): la sala se desliza de lado dentro de `.home-pan` (no se recorta).
- Vida extra del refugio (17 oct): `ambient/refugio-vida.js` (`drawExtras`) suma sombra de nubes en el piso, ola de luz en la hiedra, hojas y páginas que caen, burbujas y vapor de la poción, polvo de luz y luciérnagas. La ventana ya no es tocable.
- Texto del Inicio (17 oct): letras pixel propias en `design-system/pixel-text.js` (`NexoPixelText.render`, escala entera con `--s`; su estilo base `.pixel-text` vive en `pixel-ui.css`). Los carteles colgados y el pie "Un lugar donde…" se quitaron el 24 oct 2026. Ganchos que se mantienen: `evaluation-board`/`evaluation-note` (en Próximas pruebas, los usa `planner/avisos.js`) y `continue-volume` (lo usan `platform/animation.js` y el escritorio de `home-scene.js`). `day-paper` ya no existe, así que el "plan de hoy" de `avisos.js` no se pinta en el Inicio (sigue en Organización › Hoy).
- Distribución del Inicio (24 oct 2026, diseño C, `docs/inicio-reloj/SPEC.md`; estilos en `design-system/home-layout.css`): riel izquierdo de 104 px (`arcane.css`, sin mascota) · `.home-main` (refugio ~924×520 sin nada encima + `.home-lower` con Calificaciones y Apuntes + globo `.home-bubble`) · `.home-side` de 340 px (reloj, calendario del mes, Próximas pruebas, Continuar). La mascota es un avatar fijo (`#companionPresence`, abajo a la izquierda, solo en el Inicio en escritorio) y sigue viviendo en el refugio.
- Reloj de la torre (columna derecha `.home-side`, `.home-clock` en `update01.css`, marcado en `homeClockMarkup` de `app.js`): marco 9-slice + engranaje, orbe y hiedra animados por tiras de cuadros. Se dibujan con `python tools/reloj-pixel/build_reloj.py`.
- Objetos: ventana (pulso de luz), báculo → Tienda, sillón → Perfil, mapa → Bitácora, pergamino → Calendario, estantería → Biblioteca, globo → Mapa de conocimiento, escritorio → Continuar estudiando.

## Entrega
Probar en 1440 y 390 px, mostrar imagen **ANTES/AHORA** y esperar aprobación visual.
