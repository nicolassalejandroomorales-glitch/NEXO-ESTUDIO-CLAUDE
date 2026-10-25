---
name: nexo-animacion
description: Estilo de movimiento de Nexo (6 reglas, resortes, pausa de impacto, sonido por evento). Úsala antes de animar o darle vida a cualquier cosa: cofres, mascota, grimorio, botones, transiciones.
---

# Animación de Nexo

Estilo aprobado por Niquito (24 oct 2026): **piezas que se mueven con resortes + efectos + sonido en todo**. Cuadro a cuadro solo en momentos estrella (cofre, nacimiento de la mascota). Referencia viva: Artifact "Pruebas de animación Nexo". SPEC y decisiones: `docs/animacion/SPEC.md`.

## Las 6 reglas

1. **Piezas, no bloques.** Lo que se mueve se arma con piezas (cuerpo, tapa, corcho, líquido, cara) y cada una sigue su propio resorte. Nada se anima con una curva lineal ni como un solo bloque rígido.
2. **Peso.** Toda acción tiene anticipación (se agacha antes de saltar), aplastar y estirar, y al caer una **pausa de impacto** de ~70 ms y un rebote que se amortigua. Se prueba mirando el aterrizaje: ¿se siente que pesa?
3. **Efectos que acompañan.** Cada momento fuerte suma partículas, luz que late y un temblor corto de cámara. Lo que va "después del cuerpo" (chispas, líquido) llega tarde, no a la vez.
4. **Sonido en cada evento.** Preparar, lanzar, golpe y premio suenan, y lo más raro suena más. Todo pasa por `NexoMovimiento.sonido`, nunca por un sistema nuevo.
5. **Píxeles alineados.** El pixel art se dibuja en su tamaño real y se escala entero con `image-rendering: pixelated`. Posiciones enteras (`alinear`), giros en pasos chicos y sin suavizado. Girar o escalar el PNG ya ampliado ensucia la grilla.
6. **Cuadro a cuadro solo en momentos estrella.** El resto es procedural (resortes, efectos, sonido): barato y es lo que más cambia cómo se siente la app.

## Cómo se usa (`dist/core/movimiento.js`, `window.NexoMovimiento`)

- `resorte('aplastar' | 'liquido' | 'corcho' | 'tapa' | 'brillo' | 'camara' | 'pagina')` o `{ rigidez, amortiguacion, valor, meta }`. Se mueve cambiando `.meta`, se da un golpe con `.empujar(v)` y se avanza con `.avanzar(dt)`; `.valor` es lo que se pinta. `.reposo(tolerancia)` sirve para apagar el bucle de cuadros cuando ya no se nota (en píxeles, ~0,5).
- `escena()` agrupa resortes: `esc.resorte(...)`, `esc.golpe({ pausa, temblor, duracion })` y, en cada cuadro, `dt = esc.paso(dtReal)` (devuelve 0 durante la pausa de impacto: úsalo también para partículas). `esc.temblor()` da `{x, y}` en píxeles enteros.
- `alinear(v, paso)`, `cantidad(n)` (partículas según la calidad de Ajustes), `reducido()`.
- `sonido(evento, rareza)`. Eventos: `preparar`, `lanzar`, `estallar`, `girar`, `paso`, `golpe`, `premio`, `brillo`, `burbuja`, y de interfaz `clic`, `confirmar`, `comprar`, `equipar`, `error`. Los de interfaz van a `NexoAudio`; los de efectos al sintetizador `NexoCofreSonidos` (`dist/economy/cofre-sonidos.js`). Un sonido nuevo se agrega a ese sintetizador y a `EVENTOS`.
- Ejemplos: cofre (`dist/economy/cofre-fx.js`, prueba `tools/movimiento-test.cjs`), botones de latón + portal entre secciones (`dist/design-system/pixel-ui.js`, prueba `tools/interfaz-movimiento-test.cjs`) y apertura del Grimorio (`dist/platform/animation.js`, prueba `tools/grimorio-movimiento-test.cjs`).
- Interfaz: un bucle de cuadros compartido que solo corre mientras algo se mueve; la cara del botón va por la variable CSS `--pu-y` y la propiedad `translate` (no choca con `transform`). Si un rebote pasaría del piso y haría crecer el scroll, se pinta `-Math.abs(valor)` (rebota contra el piso).

## Qué técnica para qué

- Interfaz y efectos: CSS (transiciones simples) o canvas con resortes.
- Pixel art con piezas que giran o se aplastan: dibujar en un lienzo del tamaño del arte y ampliar entero (como el cofre).
- Hojas de sprites o cuadros dibujados: solo momentos estrella. Rive: fuera de alcance hasta que Niquito lo pida.

## Siempre (límites)

- **Movimiento reducido**: `prefers-reduced-motion`, `data-nexo-ambient-motion="reduced"` o el ajuste de la mascota. Resortes saltan a su destino, sin pausa ni temblor, y la pantalla muestra el resultado directo. Reducido no es silencio: el sonido solo lo manda Ajustes.
- **Silencio**: con el sonido apagado en Ajustes no se crea ni un `AudioContext`. Nada suena antes de un gesto del usuario.
- **Rendimiento**: partículas con `cantidad(n)`, un solo bucle de cuadros por escena, nada de bucles permanentes en segundo plano.
- **Entrega**: nada sale sin probar en 1440 y 390, una captura por tamaño y un número de tiempo de cuadro. Pruebas rápidas en verde.
- **Resortes sobre una línea de tiempo existente** (Grimorio): avanza los resortes por tramos de 50 ms hasta alcanzar el reloj real (la línea de tiempo no espera si el equipo va lento). Para la pausa de impacto, pausa también las animaciones de la capa y reanúdalas juntas. Un golpe contra un tope (la tapa en la mesa) se hace con meta más allá del tope y rebote manual: `valor = tope`, `velocidad = |v| · 0,28`.
- Para que Niquito vea una animación sin tocar GitHub: Artifact privado con botones ANTES/AHORA que carga el módulo original y el nuevo.
