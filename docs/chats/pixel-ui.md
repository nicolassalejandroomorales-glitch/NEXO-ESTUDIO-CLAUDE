# Aspecto y navegación de toda la app
- modelo: Sonnet 5.5 · alto (solo conversar y diseñar al inicio)
- estado: crítica recibida el 15 oct, sin decisiones
- fase: por-hacer
- prioridad: 2
- spec: docs/ux-app/FEEDBACK-15OCT.md

## Hecho
- Barra nueva (17 oct): Inicio · Aprender · Organización · Perfil. Entrenar se borró (pantalla, entrenamiento, sala Taller y pruebas); Repasos y Rescate siguen en Aprender. Juegos salió de la barra (sigue en #/games).
- Refugio y mascotas ya en pixel art con las rampas de `tools/home-pixel/pixel.py`.
- Grimorio del tutorial, marcos de diálogo y huevos en pixel art.

## Falta
- Decidir la **navegación**: la barra lateral convive con las escenas tocables; Niquito duda de que haga falta.
- Diseñar **botones y paneles con personalidad** (hoy "feos, sin personalidad") como un kit compartido en `tools/pixel-ui/`.
- Mejorar la **versión de computador**, que no le gusta.
- Rehacer **Aprender** (su grimorio es "antiestético") y preguntar a qué se refiere con "la biblioteca Nexo".
- Decidir si grimorio, clases, tienda y juegos pasan a pixel art con el mismo kit.

## Ideas
- Una sola fuente y un solo set de botones para toda la app.
- Íconos de la barra lateral en pixel art.
- Transiciones entre pantallas con el mismo lenguaje del grimorio.

## Prompt de inicio
```
Chat: Aspecto y navegación de toda la app (solo diseño). Lee CLAUDE.md, la skill nexo-pixel-art y docs/ux-app/FEEDBACK-15OCT.md.
Contexto: no me gusta la versión de computador, los botones ni la navegación; mi crítica está en ese archivo.
Tarea: conversemos, sin dibujar ni programar. Dime en una línea qué entendiste y hazme máximo 3 preguntas de selección múltiple, empezando por la navegación (¿se queda la barra lateral?) y por cómo debe verse un botón de Nexo. Revisa si ya existe tools/pixel-ui/ para reutilizarlo.
Al terminar, usa nexo-cierre y actualiza docs/chats/pixel-ui.md.
```

## Prompt de continuación
```
Chat: Aspecto y navegación de toda la app. Lee CLAUDE.md, la skill nexo-pixel-art y docs/chats/pixel-ui.md.
Parte desde "Falta" y pregúntame qué decisión toca primero.
```
