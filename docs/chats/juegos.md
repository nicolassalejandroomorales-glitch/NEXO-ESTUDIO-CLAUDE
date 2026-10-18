# Juegos
- modelo: Sonnet 5.5 · medio
- estado: juego anterior borrado (18 oct 2026); el nuevo se diseña dentro de Aprender
- prioridad: 3
- spec: docs/juegos-batalla/SPEC.md

## Hecho
- **18 oct 2026**: se borró la campaña "Camino a la PEP 1" (`dist/games/`), el prototipo del Rey Amonio, su tarjeta en #/games y el portal que llevaba a ella. Queda el cargador `dist/game/manager.js`.
- (Historia) - Campaña "Camino a la PEP 1": 3 guardianes + Rey Amonio, 6 tipos de desafío, preguntas de la pauta 2025, arte y audio.
- Prototipo `batalla-rey-amonio.html` y ficha de enemigos.

## Falta
- **Juego nuevo dentro de Aprender**: bichos que aparecen de repente (referencia: Vampire Crawlers) y tarjetas. Falta conversar el diseño: cómo se juega una tarjeta, qué es un bicho en términos de aprendizaje, y cómo deja evidencia (`recordAttempt` con las clases ya conectadas).
- Los cofres por jefes (`docs/economia`) leían `nexo-pep1-campana`; ya no hay jefes: decidir qué hito los reemplaza.
- (Historial) - Conectar a `#/games` (tarjeta "Boss Arena") y registrar intentos con `recordAttempt` (`activityType:'game'`).
- Rediseño del Rey Amonio, que Niquito quiere hacer él.
- Música de combate por jefe y arenas "de jefe".
- Más casos con estructuras dibujadas.

## Ideas
- Jefes por ramo, con las preguntas de cada evaluación.
- Modo repaso rápido de 5 minutos para la mañana de la prueba.
- Ranking personal de récords, sin nada social.

## Prompt de inicio
```
Chat: Juegos. Lee CLAUDE.md, la skill nexo-juegos y docs/juegos-batalla/SPEC.md.
Contexto: la campaña PEP 1 funciona aparte, falta conectarla a la app y que alimente el motor académico.
Tarea: dime en una línea qué entendiste. Implementa la conexión mínima (tarjeta en #/games + recordAttempt), tocando lo menos posible de app.js, y prueba en 1440 y 390.
El rediseño del Rey Amonio lo hago yo, no lo cambies. Al terminar, usa nexo-cierre y actualiza docs/chats/juegos.md.
```

## Prompt de continuación
```
Chat: Juegos. Lee CLAUDE.md, la skill nexo-juegos y docs/chats/juegos.md.
Parte desde "Falta" y pregúntame qué sigue.
```
