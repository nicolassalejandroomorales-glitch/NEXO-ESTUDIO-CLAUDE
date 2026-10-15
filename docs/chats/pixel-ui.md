# Pixel art en toda la app
- modelo: Sonnet 5.5 · medio
- estado: idea, sin decidir
- prioridad: 4
- spec: docs/pendientes.md (sección Estilo visual)

## Hecho
- Refugio y mascotas ya en pixel art con las rampas de `tools/home-pixel/pixel.py`.
- Grimorio del tutorial, marcos de diálogo y huevos en pixel art.

## Falta
- Decidir si grimorio (portada y páginas), clases, tienda y juegos pasan a pixel art (fuentes, botones, paneles).
- Kit compartido `tools/pixel-ui/` (lo crea la Fase 0 del chat organizacion; reutilizar, no duplicar).

## Ideas
- Una sola fuente y un solo set de botones para toda la app.
- Íconos de la barra lateral en pixel art.
- Transiciones entre pantallas con el mismo lenguaje del grimorio.

## Prompt de inicio
```
Chat: Pixel art en toda la app (solo diseño). Lee CLAUDE.md, la skill nexo-pixel-art y la sección "Estilo visual" de docs/pendientes.md.
Tarea: conversemos, sin dibujar. Dime en una línea qué entendiste y hazme máximo 3 preguntas de selección múltiple sobre qué pantallas pasan primero a pixel art. Revisa si ya existe tools/pixel-ui/ del chat organizacion para reutilizarlo.
Al terminar, usa nexo-cierre y actualiza docs/chats/pixel-ui.md.
```

## Prompt de continuación
```
Chat: Pixel art en toda la app. Lee CLAUDE.md, la skill nexo-pixel-art y docs/chats/pixel-ui.md.
Parte desde "Falta" y pregúntame qué sigue.
```
