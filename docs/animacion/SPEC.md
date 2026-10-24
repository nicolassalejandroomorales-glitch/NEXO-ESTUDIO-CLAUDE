# Estándar de animación

Estado: hecho, esperando aprobación de Niquito (24 oct 2026). Skill: `.claude/skills/nexo-animacion/SKILL.md`. Código: `dist/core/movimiento.js`.

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

## Pendiente
- Aplicar el estilo al nacimiento de la mascota, al Grimorio y a botones/transiciones (un chat por lugar).
- Falta el archivo de chat `docs/chats/animacion.md` (no se creó: este cambio tenía lista cerrada de archivos nuevos).
- Hay CSS sin uso desde antes en `tienda.css` (`cfxBang`, `cfxFlash`, `.cfx-flash`, `.cfx-bang`): borrarlo en un chat de limpieza.
- Falta que Niquito vea el cofre con su ojo (la fluidez no se juzga con capturas) y apruebe el estilo.
- Con GPU real faltan medir los cuadros de escritorio; aquí el Chromium era por software.

## Prompt de continuación
```
Chat: Estándar de animación, siguiente lugar. Lee CLAUDE.md, la skill nexo-animacion y docs/animacion/SPEC.md.
Objetivo: aplicar el estilo aprobado en UN solo lugar nuevo: <nacimiento de la mascota | apertura del Grimorio | botones y transiciones>.
Reutiliza dist/core/movimiento.js y el sonido existente (NexoMovimiento.sonido); no crees otro sistema de audio. Respeta movimiento reducido y el silencio de Ajustes.
Listo cuando: se ve en 1440 y 390, pasan las pruebas rápidas y hay una prueba en tools/. Si algo es ambiguo, máximo 3 preguntas antes de programar. Al terminar usa nexo-cierre.
```
