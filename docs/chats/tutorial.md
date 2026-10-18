# Tutorial (Grimorio guía)
- modelo: Sonnet 5.5 · medio
- estado: conectado a la app; Niquito pidió rehacer su aspecto y animación (crítica del 15 oct)
- prioridad: 2
- spec: docs/tutorial/SPEC.md

## Hecho
- Diseño cerrado (SPEC, GUION de 29 pasos, FRASES) y arte pixel: Grimorio (15 poses × 3 bocas), huevos con nacimiento, marcos.
- Guion completo programado y conectado: cuenta nueva lo ve sola, guarda mascota y nombre reales, premio de 150 ⚛ una vez, Ajustes › Tutoriales, filtro de nombres.
- Avisos del Grimorio (primera vez por sección y novedades con versión) y revisión en móvil (390).
- Objetos del refugio resaltados, voz por letra con botón de silencio.

## Falta
- (18 oct) Huevos vivos, estallido, dab y voz por especie ya están (`dist/tutorial/huevos.js`), esperando aprobación de Niquito y revisión en 390.
- Leer `docs/tutorial/FEEDBACK-15OCT.md` (crítica de Niquito, por sección) y conversar con él el orden antes de programar.
- Animación fluida del Grimorio, el libro, el altar con velas y la nube de diálogo (hoy parecen PNG).
- (18 oct) Voz (blip grave por letra) y texto con personalidad hechos y aprobados. Falta confirmar el «salto hacia arriba» de la pantalla (no se reproduce en pasos 1–4 en escritorio; probar en 390 y en pasos con panel).
- Hacer el tutorial **modular por secciones**, porque Aprender y otras pantallas van a cambiar.
- Premio con nube (necesita permiso explícito, hoy no se toca Supabase).
- Revisar que 150 ⚛ siga bien si cambian los precios de la tienda.

## Ideas
- Mini tutoriales por sección que se activan la primera vez que entras.
- El Grimorio recuerda tus preferencias y sugiere la primera sesión.

## Prompt de inicio
```
Chat: Tutorial (solo conversar primero). Lee CLAUDE.md, la skill nexo-tutorial, docs/tutorial/SPEC.md y docs/tutorial/FEEDBACK-15OCT.md.
Contexto: el tutorial funciona, pero quiero rehacer su aspecto y animación; mi crítica está en FEEDBACK-15OCT.md, ordenada por sección.
Tarea: dime en una línea qué entendiste y hazme máximo 3 preguntas de selección múltiple para decidir por qué sección empezamos y cómo se debe ver la animación. No escribas código ni dibujes hasta que yo diga "hazlo".
Al terminar, usa nexo-cierre y actualiza docs/chats/tutorial.md.
```

## Prompt de continuación
```
Chat: Tutorial. Lee CLAUDE.md, la skill nexo-tutorial, docs/tutorial/SPEC.md (secciones "Inicio mágico", "Huevos y mascota" y "Voz y texto del Grimorio") y docs/chats/tutorial.md.
Inicio mágico, huevos vivos, estallido, dab, voz por especie y voz/texto del Grimorio ya están. Parte desde "Falta": primero revisa el salto de pantalla al apretar Siguiente (móvil 390 y pasos con panel) y pregúntame con selección múltiple si seguimos con el recorrido por la app real (modular por secciones).
```
