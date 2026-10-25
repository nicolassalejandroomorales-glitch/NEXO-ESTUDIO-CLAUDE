# Estándar de animación
- modelo: Sonnet 5.5 · medio
- fase: desarrollo
- estado: cofre, botones/transiciones y apertura del Grimorio hechos en la rama claude/animacion-siguiente; esperando que Niquito los pruebe y apruebe
- prioridad: 2
- spec: docs/animacion/SPEC.md

## Hecho
- 24 oct: estilo aprobado (piezas con resortes + efectos y sonido; cuadro a cuadro solo en momentos estrella), skill `nexo-animacion` y módulo `dist/core/movimiento.js`.
- 24 oct: aplicado al cofre de la Tienda (`dist/economy/cofre-fx.js`).
- 24 oct: aplicado a botones de latón y portal entre secciones (`dist/design-system/pixel-ui.js`). Prueba `tools/interfaz-movimiento-test.cjs`.
- 24 oct: aplicado a la apertura del Grimorio (`dist/platform/animation.js`, `grimoireIntro`). Prueba `tools/grimorio-movimiento-test.cjs`. Artifact privado "Prueba Grimorio Nexo" con ANTES/AHORA.

## Falta
- Que Niquito pruebe el cofre, el botón, la caída de pantalla y la apertura del Grimorio (esta última ya tiene página de prueba) y apruebe (o ajuste `HUNDIR`, `CAIDA`, presets, `tapa`). Los sonidos nuevos del Grimorio no se han oído.
- Aplicar el estilo al nacimiento de la mascota (un chat por lugar).
- Botones con CSS propio (`.primary-btn`, `.secondary-btn`) y transiciones propias (cambio de página del grimorio, tutorial, clases).
- Medir con GPU real; aquí el Chromium era por software y arranca en calidad baja.

## Ideas
- Partículas de latón al soltar un botón importante (comprar, confirmar) con `cantidad(n)`.
- Sonido distinto al cambiar de sección según el destino.

## Prompt de inicio
```
Chat: Estándar de animación. Lee CLAUDE.md, la skill nexo-animacion y docs/animacion/SPEC.md.
Objetivo: aplicar el estilo aprobado en UN solo lugar nuevo: <nacimiento de la mascota>.
Reutiliza dist/core/movimiento.js y el sonido existente (NexoMovimiento.sonido); no crees otro sistema de audio. Respeta movimiento reducido y el silencio de Ajustes.
Listo cuando: se ve en 1440 y 390, pasan las pruebas rápidas y hay una prueba en tools/. Si algo es ambiguo, máximo 3 preguntas antes de programar. Al terminar usa nexo-cierre.
```

## Prompt de continuación
```
Chat: Estándar de animación, siguiente lugar. Lee CLAUDE.md, la skill nexo-animacion, docs/animacion/SPEC.md y docs/chats/animacion.md.
Dónde quedamos: cofre, botones/transiciones y apertura del Grimorio hechos (rama claude/animacion-siguiente, sin aprobar). Falta el nacimiento de la mascota.
Objetivo: aplicar el estilo en UN solo lugar nuevo: <nacimiento de la mascota>. Antes pregunta si Niquito ya probó y aprobó el cofre, los botones y el Grimorio (Artifact "Prueba Grimorio Nexo"). Si no puede ver la rama, ofrécele una página de prueba ANTES/AHORA como esa.
Reutiliza dist/core/movimiento.js y NexoMovimiento.sonido. Respeta movimiento reducido y el silencio de Ajustes. Máximo 3 preguntas antes de programar. Al terminar usa nexo-cierre.
```
