# Juego de Nexo: bichos y tarjetas dentro de Aprender — SPEC (diseño, 18 oct 2026)

Estado: **diseño acordado con Niquito, sin código todavía.** Reemplaza al borrador del 3 oct y a la campaña "Camino a la PEP 1" (borrada el 18 oct).

## Qué
Dentro de **Aprender** (las puertas / Sótano de los Cristales) aparecen **bichos de repente**, a la Vampire Crawlers. Cada bicho es un concepto que necesita trabajo y se vence jugando **tarjetas**. Es una forma de estudiar, no un premio aparte: cada duelo deja evidencia real.

## Decisiones (Niquito, 18 oct 2026)
1. **La tarjeta ES la respuesta.** El bicho plantea una pregunta; eliges entre tarjetas con las respuestas posibles. La correcta lo vence; las incorrectas son los distractores de la propia clase (cada uno con su "porqué").
2. **Los bichos salen de tus errores y repasos.** Un bicho = un concepto con repaso vencido o error abierto (lo que hoy alimentaría cristales y grietas). Vencerlo **sin ayuda** lo repara; el bicho de un error vuelve en otra forma, no el mismo ejemplo.
3. **Perder no castiga.** Ves la explicación, el bicho regresa en otro formato. Nunca se pierde nota ni dominio; lo único que se arriesga es cosmético.

## Cómo (propuesta, por confirmar)
- **Aparición:** entre bloques de una misión (nunca en medio de una explicación), como mucho 1 cada ~10 minutos y con botón "ahora no" (vuelve después). Respeta reducir movimiento.
- **Bicho:** ficha de `docs/juegos-batalla/ENEMIGOS.md` como inspiración; diseño propio en pixel art, uno por familia de dificultad (p. ej. por tipo de error típico de la clase).
- **Tarjetas:** las opciones de los ejercicios existentes (`choice`, `poe`, `pick`) + las de Entrenar (generadores). Primera versión solo selección múltiple y numéricas (corrección exacta, sin IA).
- **Evidencia:** cada duelo llama a `NexoAcademicBridge.record` (ya conectado a las 11 clases). Pista o reintento = práctica con ayuda (no cuenta como independiente). **Velocidad, combos, vida y XP nunca suben el estado de conocimiento.**
- **De dónde salen:** funciones de lectura del motor (`qué vence hoy`, `errores abiertos por concepto`), pensadas para que cristales, grietas y bichos usen la misma fuente.

## Criterios de aceptación
- Un bicho aparece por un concepto real con repaso vencido o error abierto, y deja evidencia al resolverse.
- Vencer con ayuda no cambia el estado a "por tu cuenta".
- Rechazar o perder no pierde progreso académico.
- Se puede jugar con teclado y en 390 px; movimiento reducido sin animación obligatoria.

## Pendiente (preguntar a Niquito antes de programar)
- ¿Cómo se ve un duelo? (pantalla propia, o sobre la mesa de la alcoba).
- ¿Cuántos bichos distintos al inicio y cómo se llaman?
- Qué hito de cofres reemplaza a "jefes vencidos" (`docs/economia`).
- Coordinar con el chat de Aprender (`docs/chats/aprender.md`) dónde viven los bichos en las puertas.
