---
name: nexo-grimorio
description: Grimorio de Nexo (portada, intro épica, cambio de página, decoración por ramo, sonidos). Úsala antes de tocar platform/animation.js, platform/audio.js, assets/grimoire o tools/grimoire-*.
---

# Grimorio

## Leer primero
El SPEC más reciente del tema: `docs/update-01-7-grimorio-epico/SPEC.md` (antes: `update-01-5-grimorio`, `update-01-6-paginas`).

## Archivos
- `dist/platform/animation.js`: intro épica (3,4 s, una vez por pestaña con `sessionStorage`), fundido al entrar/salir, `pageCurl` (0,82 s; móvil 0,56 s), entrada de capítulo.
- `dist/platform/audio.js`: sonidos; solo suenan con "Efectos de sonido" activado. Prueba: `node tools/audio-test.cjs`.
- Estilos en `dist/design-system/update01.css`.
- Scripts reproducibles: `tools/grimoire-cover/build_cover.py` (portada), `tools/grimoire-pages/build_decor.py` (SVG por ramo → `dist/assets/grimoire/decor/`), `tools/grimoire-audio/build_sounds.py` (→ `dist/assets/audio/`).

## Reglas
- Nunca animar opacidad sobre un elemento con `preserve-3d` (aplana el 3D): animarla en la capa o el escenario.
- Capa de intro `position:fixed`; precargar y decodificar imágenes antes de la intro.
- Movimiento reducido: sin intro, fundido de 200 ms. Calidad baja: menos motas y chispas.
- Decoración: legibilidad primero; va sobre el papel y bajo el texto (`isolation:isolate` + `z-index:-1`). Opacidad dentro del SVG.
- Sonido suave: sin clics ni ruidos ásperos. Claude no puede escucharlo: verificar con espectrograma y pedir opinión a Niquito.
- Diseño original: nada de portadas o símbolos de obras conocidas. Si se pasa a pixel art, seguir `nexo-pixel-art`.
- Pruebas: `smoke-test`, `room-test`, `update01-test`, `audio-test`. Probar 1440 y 390, ANTES/AHORA.
