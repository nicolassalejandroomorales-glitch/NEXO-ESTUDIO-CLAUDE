# Estándar de animación

Estado: cofre, botones/transiciones y apertura del Grimorio hechos, esperando aprobación de Niquito (24 oct 2026). Skill: `.claude/skills/nexo-animacion/SKILL.md`. Código: `dist/core/movimiento.js`.

## Qué
Un estilo de movimiento único para Nexo, escrito y reutilizable, aplicado en **un solo lugar**: la apertura del cofre de la Tienda.
Fuera de alcance: economía, precios, cofres por hitos, Sótano, Inicio, mascotas nuevas, Rive, nube.

## Decisiones
- **Estilo aprobado por Niquito** (24 oct 2026, viendo el Artifact "Pruebas de animación Nexo"): piezas que se mueven por separado con resortes (opción 2) + efectos y sonido en todo (opción 3). Cuadro a cuadro (opción 1) solo en momentos estrella: cofre y nacimiento de la mascota. Le gustó el peso del salto y los sonidos.
- **Las 6 reglas** están en la skill. Salen del Artifact y de los 12 principios de animación de Disney (Thomas y Johnston, *The Illusion of Life*, 1981). Nadie las había enumerado antes: las armó Claude, Niquito puede cambiarlas.
- **Módulo propio** `dist/core/movimiento.js` → `window.NexoMovimiento`: resortes, escena (pausa de impacto + temblor entero), alineación a píxel y sonido. Sin DOM propio; cada pantalla pinta lo que le da.
- **Audio: no hay un segundo sistema.** `NexoMovimiento.sonido()` es una fachada: los sonidos de interfaz (`click`, `confirm`, `purchase`, `equip`, `error`) van a `NexoAudio` y los de efectos al sintetizador que ya existía (`NexoCofreSonidos`), al que se le sumaron `launch`, `sparkle` y `bubble`. Silencio y volumen salen siempre de `NexoAudio.settings` (Ajustes).
- **Movimiento reducido**: `prefers-reduced-motion`, `data-nexo-ambient-motion="reduced"` o el ajuste de mascota en Reducido. En ese modo los resortes saltan a su destino, no hay pausa ni temblor y el cofre muestra el premio directo.
- **Conexión**: el módulo entra por la lista de `tools/build-startup.cjs` (así llega al bundle). No hizo falta tocar `app.js` ni `economy/tienda.js` (la lógica de la Tienda sigue pura); los `?v=` de `app.js` e `index.html` se ponen solos al regenerar.
- **Arte**: ninguno nuevo. Tapa y cuerpo siguen saliendo de `cofre-cerrado.png` partido con `clip-path`; lo que cambia es cómo se mueven.

## Cómo (cofre)
Se mantiene el guion (carga → explosión → ruleta → golpe) y la ruleta no se toca. Cambia el cofre y el pulso de la escena:
1. **Carga**: el cofre se agacha (anticipación), tiembla con un resorte que se carga y el brillo late.
2. **Explosión**: pausa de impacto de ~70 ms, la tapa sale con resorte propio (sube, se inclina, rebota), el cuerpo se aplasta y se estira, y el brillo revienta.
3. **Golpe del premio**: pausa de impacto y temblor entero de cámara, mayor cuanto más rara la rareza.
4. Cada evento suena por `NexoMovimiento.sonido`.
El temblor usa la propiedad CSS `translate` para no pelear con el `transform: scale` de la cámara.

## Criterios de aceptación
1. La skill resume las 6 reglas del estilo.
2. `movimiento.js` trae resortes y sonidos reutilizables, con prueba en `tools/movimiento-test.cjs`.
3. El cofre se abre con ese estilo en 1440 y 390.
4. Las pruebas rápidas pasan (`node tools/run-tests.cjs`).

## Hecho (24 oct 2026)
- `dist/core/movimiento.js` (`NexoMovimiento`): resortes con 6 presets, escena con pausa de impacto y temblor entero, `alinear`, `cantidad`, `reducido` y `sonido` por evento. Prueba: `tools/movimiento-test.cjs`.
- `cofre-sonidos.js`: sonidos nuevos `launch`, `sparkle`, `bubble` y lista `nombres`. Sigue siendo el único sintetizador; con el sonido apagado no se crea ni un `AudioContext`.
- `cofre-fx.js` + `tienda.css`: cofre dibujado en 80×66 px reales y ampliado ×3 (móvil) o ×4 (escritorio); se agacha, la tapa sale con resorte y giro, boca oscura con borde de luz, pausa de impacto al reventar y al caer el premio, temblor de cámara entero. Se borraron los keyframes del cofre que quedaron sin uso. La ruleta no se tocó.
- Se agregó la skill `nexo-animacion`. `tools/build-startup.cjs` carga el módulo; `app.js` solo cambió por los sellos `?v=` automáticos.

## Mediciones (Chromium sin GPU, una pasada)
- 1440×900, legendario, con sonido: 12,9 s hasta la tarjeta; cuadro p50 33 ms, p95 83 ms, **igual que el código anterior** (los efectos a pantalla completa ya costaban eso sin GPU).
- 390×844, raro, en silencio: 12,4 s; cuadro p50 16,7 ms y p95 16,8 ms; 0 `AudioContext`.
- Movimiento reducido: el premio aparece a los 0,14 s, sin cofre animado.
- Pruebas rápidas: 46/51 OK. Fallan `academic-loop`, `academic-reliability`, `academic`, `clases-vivas` y `database`; ya fallaban antes de este cambio (se anotó en `docs/pendientes.md`).

## Segundo lugar: botones y transiciones (24 oct 2026)
Alcance: el kit de botones de latón (`.pu-btn`, `.nav-btn`, `.hc-btn`) y el portal entre secciones, que viven juntos en `dist/design-system/pixel-ui.js` y `.css`.
- **Botón**: al apretar la cara se hunde un píxel de arte (2 px, resorte `camara`, anticipación) y al soltar rebota hacia arriba y se asienta (resorte `corcho` + empujón). Posiciones en pasos de 2 px (la grilla del arte ×2). Va por `--pu-y` y la propiedad CSS `translate`, que no choca con el `transform` del rebote de hover. El arte no se escala ni se gira (regla 5).
- **Portal**: se mantiene el círculo que se abre desde el toque. Suma sonido `girar` al abrir y una caída de la pantalla nueva (10 px, resorte nuevo `pagina`) que aterriza con `golpe` y rebota contra su piso. Nunca baja de su sitio: un rebote hacia abajo hacía crecer el scroll de 900 a 902 px y movía la barra.
- **Sonido**: el clic pasó de `NexoAudio.play('click')` a `NexoMovimiento.sonido('clic')`; `girar` y `golpe` usan el sintetizador que ya existía. Sin sistema nuevo.
- **Movimiento reducido** (sistema, clase `reduce-motion` o ajuste): el botón se hunde y vuelve sin rebote, la pantalla cambia sin portal ni caída. El clic sigue sonando (solo lo manda Ajustes). Con calidad baja o sin View Transitions, igual.
- **Rendimiento**: un solo bucle de cuadros compartido, que se enciende al mover algo y se apaga cuando ya no se nota (`reposo(.5)`); nada permanente.
- Cambios compartidos: `movimiento.js` suma el preset `pagina` y `reposo(tolerancia)`. `pixel-ui.js` ya no repite los chequeos de movimiento reducido: usa `NexoMovimiento.reducido()`.
- Prueba: `tools/interfaz-movimiento-test.cjs` (botón, desactivado, cancelar toque, reducido, portal animado y calmado, silencio sin AudioContext, orden de carga).
- Medido en Chromium sin GPU (que arranca en calidad baja, así que se forzó "alta" para ver el portal), código anterior vs nuevo: 1440 p50 16,7 / p95 66,8 ms vs 16,7 / 66,7 ms; 390 p50 16,7 / p95 33,3 ms vs 16,7 / 33,3 ms. Mismo costo. Pruebas rápidas: 47/52 (las mismas 5 que ya fallaban).
- Los 2 `AudioContext` que aparecen al entrar a Aprender los crea Howler al cargar (vendor), igual que antes de este cambio; no son de esta animación.

## Tercer lugar: apertura del Grimorio (24 oct 2026)
Alcance: la intro de la primera entrada al Grimorio (`grimoireIntro` en `dist/platform/animation.js`, 3,4 s, una vez por sesión). El cambio de página (`pageCurl`) no se tocó.
- **Se mantiene** la línea de tiempo de luces, círculo mágico, motas, rayos y sello (WAAPI), porque el sonido largo `grimoire-open` está calzado con ella.
- **Pasa a resortes** (`NexoMovimiento`): subida del libro (resorte propio, aterriza ~0,8 s con pausa de impacto de 70 ms, squash y temblor de 2 px), flote, broche (tira hacia atrás y salta, regla 2), tapa (anticipo, cae y **golpea la mesa a -168°**: pausa 80 ms, temblor de 5 px, rebote al 28 % de la velocidad), tres hojas que salen tarde tras el golpe (60, 150 y 240 ms), corrimiento del libro y cámara que retrocede antes de entrar.
- **Pausa de impacto real**: en cada golpe se pausan todas las animaciones de la capa y los resortes dejan de avanzar; al terminar se reanudan juntas.
- **Sonido** por `NexoMovimiento.sonido`: `golpe` al aterrizar, `preparar` al soltar el broche, `golpe` al caer la tapa. Se sumaron a lo que ya suena (`grimoire-open`), que no cambió. Silencio y volumen salen de Ajustes.
- **Se movieron** (para que la luz espere a la tapa): luz de la página en blanco 2000→2150 ms, sello 2150→2250 ms, chispas del estallido 2050→2300 ms (+ azar).
- **Reloj real**: los resortes avanzan por tramos de 50 ms hasta alcanzar el reloj, porque la línea de tiempo no espera si el equipo va lento.
- **Movimiento reducido**: no cambia (ya no hay intro, solo fundido de 200 ms).
- **Sin código sin uso**: se borró `layer._main` y el `navigationAnimation` de la intro (nadie los leía).
- Prueba: `tools/grimorio-movimiento-test.cjs` (carga los módulos reales en Chromium, mide el orden y el momento de los 3 sonidos, que la tapa nunca pase de -168°, pausas de impacto, temblor y píxeles enteros, silencio sin `AudioContext`, saltar con un toque, móvil 390 y movimiento reducido).
- Medido en Chromium sin GPU (cuadros de 50–200 ms, la intro dura ~5 s en vez de 3,4 s y una pausa de 70 ms se ve de ~200 ms; en un equipo normal se espera lo del guion): original 4,2 s vs nuevo 5,0 s en la misma máquina. Pruebas rápidas: 48/53 (las mismas 5 que ya fallaban).
- Para que Niquito lo vea sin tocar GitHub: Artifact privado "Prueba Grimorio Nexo" con botones ANTES y AHORA (código real de la rama).
- Pendiente de este lugar: que Niquito lo vea y lo oiga; si la tapa cae muy rápido o muy lento se cambia `rigidez`/`amortiguacion` de `tapa` (hoy 22 / 6,5), o los 70/80 ms de pausa. Claude no puede oír: los 3 sonidos nuevos (`land`, `rumble`) no se han escuchado.

## Pendiente
- Aplicar el estilo al nacimiento de la mascota (un chat por lugar).
- Botones y transiciones: lo que sigue sin el estilo son los botones de otras pantallas con su propio CSS (`.primary-btn`, `.secondary-btn`) y los cambios de pantalla con transición propia (grimorio, tutorial, clases).
- Falta que Niquito pruebe con su ojo el peso del botón y de la caída (la fluidez no se juzga con capturas); si le sobra o le falta, se cambia `HUNDIR`, `CAIDA` o los presets.
- Hay CSS sin uso desde antes en `tienda.css` (`cfxBang`, `cfxFlash`, `.cfx-flash`, `.cfx-bang`): borrarlo en un chat de limpieza.
- Falta que Niquito vea el cofre con su ojo (la fluidez no se juzga con capturas) y apruebe el estilo.
- Los cambios de pantalla con transición propia que siguen sin el estilo: cambio de página del Grimorio (`pageCurl`), tutorial y clases.
- Con GPU real faltan medir los cuadros de escritorio; aquí el Chromium era por software.

## Prompt de continuación
```
Chat: Estándar de animación, siguiente lugar. Lee CLAUDE.md, la skill nexo-animacion y docs/animacion/SPEC.md.
Dónde quedamos: cofre, botones/transiciones y apertura del Grimorio hechos (sin aprobar). Falta el nacimiento de la mascota.
Objetivo: aplicar el estilo aprobado en UN solo lugar nuevo: <nacimiento de la mascota>.
Reutiliza dist/core/movimiento.js y el sonido existente (NexoMovimiento.sonido); no crees otro sistema de audio. Respeta movimiento reducido y el silencio de Ajustes.
Listo cuando: se ve en 1440 y 390, pasan las pruebas rápidas y hay una prueba en tools/. Si algo es ambiguo, máximo 3 preguntas antes de programar. Al terminar usa nexo-cierre.
```
