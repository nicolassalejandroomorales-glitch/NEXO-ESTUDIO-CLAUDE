# Tutorial (Grimorio guía)
- modelo: Sonnet 5.5 · medio
- estado: en curso
- prioridad: 2
- spec: docs/tutorial/SPEC.md

## Hecho
- Diseño cerrado: SPEC, GUION de 29 pasos y FRASES de las mascotas.
- Grimorio v3 en pixel art con 5 poses, huevos de mascota y marcos de diálogo.
- Guion de 29 pasos programado en una ruta de prueba; paso 12 con los 8 objetos tocables reales.

## Falta
- Conectar el tutorial: guardar mascota y nombre reales, aparición automática la primera vez, Ajustes › Tutoriales.
- Premio final de monedas (propuesta 150 ⚛; depende del chat economia).
- Aprobar la segunda tanda de arte (expresiones, boca, marco).
- Revisar el filtro de nombres y que Niquito corrija el tono de FRASES.md.

## Ideas
- Mini tutoriales por sección que se activan la primera vez que entras.
- El Grimorio recuerda tus preferencias y sugiere la primera sesión.

## Prompt de inicio
```
Chat: Tutorial. Lee CLAUDE.md, la skill nexo-tutorial y docs/tutorial/SPEC.md.
Contexto: el guion de 29 pasos está programado en una ruta de prueba. Falta conectarlo a la app de verdad.
Tarea: dime en una línea qué entendiste y propón con selección múltiple el orden de lo que falta (mascota y nombre reales, primera vez, Ajustes › Tutoriales, premio). Implementa en pasos chicos, probando en 1440 y 390.
No te salgas del tema. Al terminar, usa nexo-cierre y actualiza docs/chats/tutorial.md.
```

## Prompt de continuación
```
Chat: Tutorial. Lee CLAUDE.md, la skill nexo-tutorial y docs/chats/tutorial.md.
Parte desde "Falta" y pregúntame qué sigue.
```
