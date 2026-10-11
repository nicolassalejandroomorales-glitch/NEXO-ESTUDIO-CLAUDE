# Juegos de Nexo — SPEC (borrador, 3 oct 2026)

Estado: **borrador, esperando decisiones de Niquito** (ver "Pendiente").

## Qué

Un área de **juegos** dentro de Nexo (la habitación "Arcade Arcano", ruta `#/games`) donde jugar sea una forma de estudiar:
que sea entretenido, pero que **cada partida deje evidencia real** en el motor académico. Los juegos no son un premio aparte ni "falsa sensación de dominio".

## Lo que ya existe (encontrado en el código)

- `dist/app.js` → `renderGames()` (línea ~667): hoy muestra 4 tarjetas "Próximamente": **Memory Lab, Error Hunter, Blitz, Boss Arena**.
- `dist/game/manager.js` (`window.NexoGame`): registro de juegos (`register(id, factory)`, `loadGame(id, host)`, `pauseGame`, `destroyGame`).
  Carga **Phaser** solo cuando se abre un juego (`dist/vendor/phaser/phaser.min.js`). Solo hay un juego de prueba técnica (`?nexoDev`).
- `dist/academic/engine.js` → `recordAttempt()` ya acepta `activityType` y `activityId`; `ACADEMIC_MODEL.md` ya prevé `game` como origen de evidencia.
- Fuentes de datos para juegos: errores (`structuredErrors`), revisiones FSRS (`reviewSchedules`), casos con validador (`structured.js`), ejercicios con `examStyle` y `transfer`.
- Límite actual: el contenido académico es solo el piloto **org-01 / Aminas** (pocos casos). Los juegos necesitan más variantes.

## Decisiones propuestas (Niquito debe aprobarlas)

1. **Cada juego se apoya en una necesidad de aprendizaje**, no al revés:

   | Tarjeta | Qué entrena | Datos que usa |
   |---|---|---|
   | Memory Lab | Recordar después (retención) | revisiones FSRS vencidas |
   | Error Hunter | Reparar errores y malas ideas | `structuredErrors`, `misconceptionId` |
   | Blitz | Fluidez en lo que ya sabes | conceptos ya dominados |
   | Boss Arena | Nivel PEP y transferencia | ejercicios `examStyle` / `transfer` |

2. **Reglas de evidencia (propuestas como reglas absolutas):**
   - Un juego solo suma evidencia con respuestas **verificadas** por validador (no autoreporte).
   - **Velocidad o racha nunca suben el estado de conocimiento.** Blitz mide fluidez y se registra aparte; no cuenta como "dominio".
   - Respuestas con pista o reintento cuentan como práctica con ayuda (igual que en entrenar).
   - Los puntos, XP o monedas del juego son **solo cosméticos**; no entran al motor académico. Sin tocar Supabase ni nada de cloud.
3. **Tecnología:** empezar con HTML/CSS/JS simple (sin Phaser) para los juegos de preguntas; reservar Phaser (ya instalado) para juegos con animación real (p. ej. Boss Arena).
4. **Código nuevo en `dist/games/`**, un archivo por juego, registrado en `NexoGame`. Cambios mínimos en `app.js` (solo conectar `renderGames`).
5. **Estética:** coherente con el refugio (grimorio, mascota). La mascota puede reaccionar al resultado.

## Cómo (en pasos chicos)

1. Aprobar este SPEC y elegir el **primer juego** (uno solo, hecho bien).
2. Crear `dist/games/` con el juego elegido + conexión a `recordAttempt` (`activityType:'game'`).
3. Reemplazar su tarjeta "Próximamente" por la real; las otras quedan igual.
4. Probar en desktop (1440) y móvil (390) + pruebas rápidas; mostrar ANTES/AHORA.
5. Repetir con el siguiente juego.

## Criterios de aceptación (del primer juego)

- Se abre desde `#/games`, funciona en 1440 y 390 px y respeta `prefers-reduced-motion`.
- Cada respuesta verificada crea intento y evidencia con `activityType:'game'`; reintentar no duplica (IDs idempotentes).
- Jugar sin errores a toda velocidad **no** cambia el estado de conocimiento sin evidencia independiente.
- Pruebas rápidas existentes siguen pasando.

## Ideas en cola

- **Batalla con esquiva (género Undertale, diseño propio)** — en curso, ver `docs/juegos-batalla/SPEC.md`.

- **Juego de cartas por carriles (estilo PvZ Heroes, diseño propio)** — idea de Niquito, 3 oct 2026. Condición: la química es la mecánica (integración intrínseca,
  Habgood y Ainsworth 2011), no un peaje de preguntas. Ej.: poder de carta = pKaH real; el carril se resuelve por basicidad/inducción; el jugador predice el resultado
  y el validador lo verifica (evidencia real); las jugadas falladas alimentan errores y FSRS. MVP: 3 carriles, ~12 cartas, solo Basicidad de aminas, rival simple, sin mazos.
  Encaja como **Boss Arena**; va después de un primer juego chico. Sin plantas/zombies ni arte de PvZ.

## Pendiente (preguntas para Niquito)

- ¿Cuál es el **primer juego**? Recomendación: **Error Hunter** (usa errores reales y es lo más distintivo de Nexo).
- ¿Apruebas las reglas de evidencia (punto 2) para pasarlas a `CLAUDE.md` como absolutas?
- ¿Hay otros juegos que quieras además de los 4 de las tarjetas?
- ¿Recompensas cosméticas (monedas de tienda, marcos del grimorio) o nada por ahora?
- Contenido: hay pocos casos de Aminas; ¿generamos más variantes para los juegos o partimos con lo que hay?
