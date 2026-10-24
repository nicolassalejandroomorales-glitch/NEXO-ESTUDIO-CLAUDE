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

8. **Mano de 4–5 cartas; el número de cada carta es el orden del paso** (ej. el mecanismo de Hofmann: cartas 1 a 4 = los pasos). Los números son la lógica de la química, no un costo arbitrario.
9. **Carta fuera de orden: el bicho te ataca un poco.** Pierdes vida del duelo (cosmética); si te quedas sin vida el bicho se va y regresa después, sin pérdida de progreso académico. El combo se rompe.
10. **10 rangos de jugador, un cofre por rango** (los rangos 5 y 10 dan uno mejor). Sube rápido al inicio y más lento después. Tabla exacta de XP por definir con el chat de economía.
11. **La XP depende de qué tan difícil era el bicho para ti:** un error viejo o un concepto débil da más XP que algo que ya dominas. Así lo que más necesitas estudiar es lo que más rinde.
12. **Boceto aprobado (18 oct 2026):** escena arriba (pasillo en primera persona + bicho) y **mano de cartas abajo**, en la misma pantalla. El **bicho es una criatura con cara y el concepto encima** (ej. la N⁺ en la frente del amonio cuaternario). Cada **carta trae el paso escrito y un dibujito** (mini estructura o ícono); el número del paso solo aparece al jugarla bien. Arriba: rango de jugador y barra de XP; corazones del duelo y combo en la escena.

## Hecho (18 oct 2026)
- **Cola de pendientes** (`dist/academic/pending.js`): de dónde salen los bichos y su peso 1–3.
- **Lógica del duelo** (`dist/game/duel.js`, `window.NexoDuel`, pura, sin pantalla): la mano sale de ejercicios reales de las clases: ordenar (`order`, 34), receta (`recipe`, 12, con cartas señuelo que explican por qué no) y elegir (`choice`, 343, una sola carta correcta). 389 ejercicios probados de punta a punta.
- Reglas implementadas: la mano nunca empieza resuelta; carta equivocada = −1 corazón, combo roto y explicación; 3 corazones; pista anotada; **un duelo = un intento de evidencia y solo cuenta como acierto si saliste limpio** (ganar tras equivocarte enseña pero no cuenta por tu cuenta). XP = 20 × peso (1–3); con pista o errores, la mitad; combo hasta +30 %; perder no da XP.
- **Director de encuentros** (`dist/game/director.js`, `window.NexoDirector`, puro): `choose` toma el pendiente que más te cuesta que tenga ejercicio de duelo (prefiere ordenar/receta), con su ramo, nombre, peso y mano. Reglas: como mucho 1 bicho cada 10 min; `snooze` ("ahora no") lo deja volver en 5; **tope diario de 300 XP**; el mismo ejercicio no vuelve antes de 3 días; sin pendientes, no sale nada. `classIdsFor(pendientes)` dice qué clases cargar (se cargan bajo demanda). El estado del director (`createState`) lo guarda quien lo llama. Cada una de las 11 clases tiene bichos con ejercicio real.
- Pruebas: `tools/pending-test.cjs`, `tools/duel-test.cjs`, `tools/director-test.cjs`.
- **Registro de evidencia** (`dist/game/encounter.js`): al terminar, un duelo = un intento (`activityType:'game'`) por el puente de las clases; cuenta la XP, el gap y el tope del director. Bicho de práctica: deja evidencia pero no da XP ni gasta el tope.
- **Pantalla de prueba** (`dist/game/duel-ui.js`, ruta `#/duelo`, sin botón en ningún menú): escena con el bicho (color por ramo) arriba y la mano abajo, corazones, combo, pista, "ahora no" y cierre con XP. Probada en el navegador (práctica → duelo → evidencia en el motor). El estado vive en `state.duel` (director + XP total).
- **Música y sonidos** (`dist/game/duel-music.js`, `window.NexoDuelMusic`): sintetizados en vivo con WebAudio (ondas de pulso, bajo, batería, arpegio), sin archivos. **4 temas originales, uno por ramo** (Orgánica: La menor saltarina; Fisicoquímica: Re menor firme y rápida; Fisiopatología: Mi menor lenta e inquietante; Analítica: Sol mayor precisa). Empieza al aparecer el bicho y crece por capas: bajo y batería → + arpegio → + melodía cuando llevas combo ×2. Efectos: aparece, carta correcta (sube de tono con el combo), carta equivocada, victoria, derrota. Solo suena si la música (o el sonido, para efectos) está activa en Ajustes; la ruta `#/duelo` cuenta como sala sin música de fondo para que no se pisen. Probada con un AudioContext de mentira (`tools/duel-music-test.cjs`) y arrancando en el navegador; **no la he escuchado** (falta tu oído: tempo, volumen y si te gusta cada tema).
- **Ejercicios de duelo** (`cls.duelos`, desde el 18 oct): lista aparte en cada clase, no forma parte de las misiones; solo salen en el juego. Aminas (org-01) tiene 8 de ordenar con 3–4 cartas, sacados solo de la cátedra (diap. 17 y 30–36): Hofmann completo, mecanismo de acilación, azida, cascada de sobrealquilación, aminación reductiva, benceno → anilina, Gabriel y el razonamiento del equilibrio con pKa. `tools/duel-content-test.cjs` exige: id único, concepto existente, fuente y diapositiva, 3–6 cartas distintas, pista, explicación y error típico válido. Para sumar a otra clase basta `cls.duelos = [order(...)]` con las mismas reglas. Ojo: los pasos de una E2 u otro paso concertado **no** se ordenan (es un solo paso).
- Falta: mover la escena **dentro de Aprender** (con el chat de las puertas), más ejercicios de ordenar (hoy muchos duelos son de una carta), y el **rango de jugador** (tabla de XP por definir con economía).

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
- Implementar la tabla de XP de los 10 rangos, el cofre de los rangos 5 y 10 y el tope de 300 XP por día: ya definidos en `docs/economia/SPEC.md` (pendiente de aprobación de Niquito).
- Cómo se ve la vida del duelo y cuántos golpes aguantas.
- Nombres, caras y música de los primeros bichos por ramo.
- ¿Cuántos bichos distintos al inicio y cómo se llaman?
- Coordinar con el chat de Aprender (`docs/chats/aprender.md`) dónde viven los bichos en las puertas.
