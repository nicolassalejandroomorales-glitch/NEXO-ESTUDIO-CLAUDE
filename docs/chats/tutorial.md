# Tutorial (Grimorio guía)
- modelo: Sonnet 5.5 · medio
- estado: conectado a la app, falta pulir
- prioridad: 2
- spec: docs/tutorial/SPEC.md

## Hecho
- Diseño cerrado (SPEC, GUION de 29 pasos, FRASES) y arte pixel: Grimorio (15 poses × 3 bocas), huevos con nacimiento, marcos.
- Guion completo programado y conectado: cuenta nueva lo ve sola, guarda mascota y nombre reales, premio de 150 ⚛ una vez, Ajustes › Tutoriales, filtro de nombres.
- Avisos del Grimorio (primera vez por sección y novedades con versión) y revisión en móvil (390).
- Objetos del refugio resaltados, voz por letra con botón de silencio.

## Falta
- Premio con nube (necesita permiso explícito, hoy no se toca Supabase).
- Rediseño propuesto: recorrido por la app real con audio sincronizado (ver SPEC).
- Que Niquito corrija el tono del guion y de FRASES.md.
- Revisar que 150 ⚛ siga bien si cambian los precios de la tienda.

## Ideas
- Mini tutoriales por sección que se activan la primera vez que entras.
- El Grimorio recuerda tus preferencias y sugiere la primera sesión.

## Prompt de inicio
```
Chat: Tutorial. Lee CLAUDE.md, la skill nexo-tutorial y docs/tutorial/SPEC.md.
Contexto: el tutorial ya está conectado a la app. Lo que sigue es el rediseño (recorrido por la app real con audio sincronizado) y corregir el tono del guion.
Tarea: dime en una línea qué entendiste y propón con selección múltiple por cuál empezar. Implementa en pasos chicos, probando en 1440 y 390.
No te salgas del tema. Al terminar, usa nexo-cierre y actualiza docs/chats/tutorial.md.
```

## Prompt de continuación
```
Chat: Tutorial. Lee CLAUDE.md, la skill nexo-tutorial y docs/chats/tutorial.md.
Parte desde "Falta" y pregúntame qué sigue.
```
