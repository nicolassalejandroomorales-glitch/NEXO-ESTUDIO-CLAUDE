---
name: nexo-juegos
description: Juegos de Nexo (#/games, campaña "Camino a la PEP 1", jefes, desafíos, música de combate). Úsala antes de tocar dist/games/, dist/game/manager.js o renderGames en app.js.
---

# Juegos de Nexo

## Leer primero
- `docs/juegos/SPEC.md` (área general) y `docs/juegos-batalla/SPEC.md` (campaña PEP 1, la que está en curso).

## Archivos
- `dist/games/pep1/`: `juego.js` (combate), `desafios.js` (tipos de pregunta), `contenido.js` (preguntas, se editan aquí), `moleculas.js`, `arte.js`, `audio.js`, `index.html`.
- Abrir: `http://127.0.0.1:8765/games/pep1/index.html` · `?todo=1` desbloquea todos los jefes.
- `dist/game/manager.js` (`window.NexoGame`): `register`, `loadGame`, `pauseGame`, `destroyGame`. Phaser se carga solo al abrir un juego que lo use.
- `dist/app.js` → `renderGames()`: solo conectar, cambio mínimo. Pendiente: conectar la campaña a `#/games`.
- Prueba: `node tools/game-test.cjs`.

## Reglas (aprendizaje primero)
- Cada juego responde a una necesidad de aprendizaje y debería dejar **evidencia real** en el motor (`recordAttempt` con `activityType`).
- Solo suman evidencia respuestas **verificadas**; nunca autoreporte.
- **Velocidad, racha, esquivar o XP nunca suben el estado de conocimiento.** Puntos y monedas son solo cosméticos.
- Con pista o reintento = práctica con ayuda (daño ×0,5).
- El juego elige el desafío; nunca el mismo tipo dos veces seguidas (práctica intercalada); si fallas un tema, vuelve en otro formato.
- Preguntas desde la pauta real de la PEP 1 2025; si algo no está en la fuente, no inventarlo.
- Música y arte originales: no citar obras ni copiar personajes conocidos.
- Progreso en `localStorage` solo como comodidad. Nada de Supabase.

## Entrega
Probar 1440 y 390 px, ANTES/AHORA, esperar aprobación visual.
