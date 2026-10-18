---
name: nexo-tutorial
description: Tutorial guiado de Nexo (Grimorio que explica la app, elección y nacimiento de la mascota inicial, nombre, pasos por sección, recompensa final). Úsala antes de tocar dist/tutorial/, tools/tutorial-pixel/ o docs/tutorial/.
---

# Tutorial

## Leer primero
`docs/tutorial/SPEC.md` (decisiones y estado), `docs/tutorial/GUION.md` (29 pasos) y `docs/tutorial/FRASES.md` (frases y reglas del nombre de las mascotas). El tema es **solo** el tutorial.

## Código
- `dist/tutorial/tutorial.js` + `tutorial.css`: se cargan perezosamente al abrir la ruta **`#/tutorial`** (app.js tiene una entrada en `renderers`). Nada va al bundle.
- `dist/tutorial/avisos.js` + `avisos.css`: globo del Grimorio. Primera vez por sección (solo si `state.tutorial.status==='skipped'`) y novedades (`NEWS`, id sube de 1 en 1). app.js lo carga en `checkAvisos`. Prueba: `tools/avisos-test.cjs`.
- Exporta `window.NexoTutorial.render(app, { sound, exit })`. Los pasos son el arreglo `STEPS` (cada uno: `pose`, `text` o función de `s`, `scene`, `needs`, `next/back`, `noBack`).
- Estado de **prueba** en `localStorage['nexo.tutorial.test.v1']` = `{i, kind, draft, name}`. **No toca** `state.mascot` ni las monedas todavía. Para repetir: `localStorage.removeItem('nexo.tutorial.test.v1')`.
- La mascota que nace se dibuja con `window.PixelMascotas.render` (mismo código que `home-pet.js`), no con las hojas de huevos.
- Bips de 8 bits con WebAudio; respetan `state.settings.sound`.

## Fondo mágico
- `dist/tutorial/magia.js` (`NexoMagia.mount(el).pulse()`): canvas de baja resolución detrás del tutorial (círculo de runas con símbolos de elementos, benceno con grupo amino, órbitas con electrones, burbujas, moléculas, hojas y enredaderas). Lo carga `tutorial.js`; respeta «reducir movimiento».

## Huevos vivos
- `dist/tutorial/huevos.js` (`NexoHuevos.attach(huevoEl, kind)` → `excite(bool)`, `level(0-3)`, `burst()`): canvas encima del huevo con partículas por especie y el estallido del nacimiento. `eggEl` en `tutorial.js` lo monta (no con «reducir movimiento»). En el nacimiento la mascota hace `arm='dab'` y su `grito` (INFO); el timbre de voz por especie está en `TIMBRE` de `beep`.

## Recorrido por la app real
- `dist/tutorial/recorrido.js` + `.css` (`NexoRecorrido.run(id, {volver})`): halo sobre elementos reales y globo del Grimorio. Secciones en `SECCIONES` (`ruta`, `pasos: {sel, pose, texto}`); en `STEPS` de `tutorial.js` un paso `{ recorrido: '<id>' }` la lanza y al terminar vuelve a `#/tutorial`. Si cambia una pantalla, revisa que sus `sel` existan (si no, se saltan).

## Arte (scripts reproducibles en `tools/tutorial-pixel/`, salida en `dist/assets/tutorial/`)
- `build_grimorio.py` → `grimorio-v1.png` (5 poses, incl. dormido) y `grimorio-hablar.png` + `.json` (15 poses × 3 bocas, 68×76; el orden de filas está en el JSON y en `ROWS` de tutorial.js).
- `build_llama.py` → `llama.png` (4 cuadros 3×8): llamas de las velas del altar, animadas por CSS (`.tut-llama`). Las posiciones salen del arte del Grimorio (68×76); si mueves las velas en `build_grimorio.py`, ajusta `.tut-llama.l/.r` en `tutorial.css`.
- `build_marco.py` → `marco-dialogo.png` (9-slice 12), `marco-nombre.png` (9-slice 6), `flecha-siguiente.png`.
- `build_huevos.py` → `huevo-{atomo,matraz,slime}.png` (9 cuadros de 56×64).
- Cambios de arte: seguir `nexo-pixel-art`. Si cambia el orden de filas del Grimorio, actualizar `ROWS`.

## Reglas
- Escala x4 en desktop, x2 en móvil (<700 px); en móvil el texto va en barra abajo.
- La mascota elegida y su nombre son **definitivos**: por eso `noBack` en los pasos posteriores al nacimiento.
- Tono: humor + dato (los datos de estudio del guion se verifican antes de implementarlos).
- Para subir: si hay cambios de otros chats sin subir, usar un worktree limpio sobre `origin/master` y regenerar el bundle ahí.

## Voz y texto del Grimorio
- Voz: `vozGrimorio` en `tutorial.js` = blip grave y hueco por letra (onda de pulso 25 %, ~140 Hz, tono casi fijo). Elegida por Niquito el 18 oct tras descartar guitarra/libro viejo, campanitas, tintineo y murmullo. Las mascotas conservan su `TIMBRE`.
- Marcas en los textos: `*palabra*` brilla, `~` al inicio = susurro, `^` al inicio = temblor. Tono del texto: misterioso y poético con humor.
