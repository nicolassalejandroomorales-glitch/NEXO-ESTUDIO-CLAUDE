---
name: nexo-juegos
description: Juegos de Nexo (nuevo juego dentro de Aprender, cargador de juegos, #/games). Úsala antes de tocar dist/game/manager.js, renderGames en app.js o crear un juego.
---

# Juegos de Nexo

## Estado (18 oct 2026)
- El juego anterior (campaña "Camino a la PEP 1", Phaser aparte en `dist/games/`) **se borró** (Niquito: "no me gusta"). Su código sigue en el historial de Git (commit anterior al borrado).
- El juego nuevo va **dentro de Aprender** (el rediseño de las puertas): bichos que aparecen de repente, como en Vampire Crawlers, y tarjetas. Diseño por conversar con Niquito antes de programar; cuando exista, su SPEC irá en `docs/juegos/SPEC.md`.
- Material reutilizable: `docs/juegos-batalla/ENEMIGOS.md` (fichas de bichos) y los tipos de desafío descritos en `docs/juegos-batalla/SPEC.md`. Solo como inspiración; la campaña vieja ya no existe.

## Archivos
- `dist/game/manager.js` (`window.NexoGame`): `register`, `loadGame`, `pauseGame`, `destroyGame`. Phaser se carga solo al abrir un juego que lo use.
- `dist/app.js` → `renderGames()`: sala "Arcade arcano" con tarjetas "Próximamente"; el portal de la torre ya no lleva a ningún juego.
- Prueba: `node tools/game-test.cjs`.

## Reglas (aprendizaje primero)
- Cada juego responde a una necesidad de aprendizaje y debería dejar **evidencia real** en el motor (`recordAttempt` con `activityType`).
- Solo suman evidencia respuestas **verificadas**; nunca autoreporte.
- **Velocidad, racha, esquivar o XP nunca suben el estado de conocimiento.** Puntos y monedas son solo cosméticos.
- Con pista o reintento = práctica con ayuda (daño ×0,5).
- El juego elige el desafío; nunca el mismo tipo dos veces seguidas (práctica intercalada); si fallas un tema, vuelve en otro formato.
- Preguntas desde las fuentes reales de cada clase (diapositiva o pauta); si algo no está en la fuente, no inventarlo.
- Música y arte originales: no citar obras ni copiar personajes conocidos.
- Progreso en `localStorage` solo como comodidad. Nada de Supabase.

## Entrega
Probar 1440 y 390 px, ANTES/AHORA, esperar aprobación visual.
