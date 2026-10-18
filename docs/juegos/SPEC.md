# Juego de Nexo: bichos y tarjetas dentro de Aprender — SPEC (diseño, 18 oct 2026)

Estado: **diseño acordado con Niquito, sin código todavía.** Reemplaza al borrador del 3 oct y a la campaña "Camino a la PEP 1" (borrada el 18 oct).

## Qué
Dentro de **Aprender** (las puertas / Sótano de los Cristales) aparecen **bichos de repente**, a la Vampire Crawlers. Cada bicho es un concepto que necesita trabajo y se vence jugando **tarjetas**. Es una forma de estudiar, no un premio aparte: cada duelo deja evidencia real.

## Decisiones (Niquito, 18 oct 2026)
1. **La tarjeta ES la respuesta.** El bicho plantea una pregunta; eliges entre tarjetas con las respuestas posibles. La correcta lo vence; las incorrectas son los distractores de la propia clase (cada uno con su "porqué").
2. **Los bichos salen de tus errores y repasos.** Un bicho = un concepto con repaso vencido o error abierto (lo que hoy alimentaría cristales y grietas). Vencerlo **sin ayuda** lo repara; el bicho de un error vuelve en otra forma, no el mismo ejemplo.
3. **Perder no castiga.** Ves la explicación, el bicho regresa en otro formato. Nunca se pierde nota ni dominio; lo único que se arriesga es cosmético.

4. **Se cruza caminando, en la misma pantalla.** No hay pantalla de juego aparte: caminas por el Sótano/cámara de Aprender (primera persona) y **de repente te sale un bicho**, como un encuentro al azar. Al aparecer **empieza a sonar una música** (la de ese bicho); al terminar, vuelve el ambiente.
5. **Los bichos son "jefes chiquititos" de cada ramo**, con nombre y cara propios: Orgánica = una amina, un ácido; Fisicoquímica = iones, un ácido; Fisiopatología = una enfermedad; Analítica = balanzas y material. Cada bicho representa un concepto real (el que tiene repaso vencido o error abierto).
6. **Qué da vencerlo: solo experiencia (XP). Nunca cofres directos.** La XP sube un **rango de jugador nuevo** (distinto de los rangos arcanos por concepto, que siguen dependiendo solo de evidencia verificada). **Ese rango da los cofres.** Esto reemplaza al hito "jefe vencido" de la economía.
7. **Duelo "a la Vampire Crawlers"**: robas una **mano de cartas**; cada carta es un paso, concepto o respuesta con un número. Jugarlas **en el orden correcto encadena el combo** (cada efecto multiplica al anterior). Mezcla ordenar pasos con elegir respuestas. Referencia: [Vampire Crawlers](https://en.wikipedia.org/wiki/Vampire_Crawlers) (cartas en orden ascendente de maná, multiplicador, primera persona).

## Reglas contra "falsa sensación de dominio"
- La XP se gana **solo con respuestas verificadas** (más con acierto sin ayuda; con pista, menos). Combos, velocidad y vida solo afectan la XP y lo cosmético, **nunca el estado de conocimiento**.
- Como los bichos salen de repasos vencidos y errores abiertos, **no hay forma de farmear XP infinita**; además un tope diario de XP por juego.
- El rango de jugador no se usa como prueba de dominio ni de nota.

## Cómo (propuesta, por confirmar)
- **Aparición:** mientras caminas entre salas (nunca en medio de una explicación), como mucho 1 cada ~10 minutos y con botón "ahora no" (vuelve después). Música solo si el sonido está activo; respeta reducir movimiento.
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
- Mazo y mano: cuántas cartas, qué es un "coste" en aprendizaje (¿el orden del paso?) y qué pasa si juegas una carta fuera de orden (sin castigo académico).
- Tabla de XP y niveles del rango de jugador, y qué cofre da cada nivel (acordar con el chat de economía).
- ¿Cuántos bichos distintos al inicio y cómo se llaman?
- Coordinar con el chat de Aprender (`docs/chats/aprender.md`) dónde viven los bichos en las puertas.
