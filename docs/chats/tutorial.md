# Tutorial (Grimorio guía)
- modelo: Sonnet 5.5 · medio
- estado: conectado a la app; Inicio mágico y huevos/mascota hechos (18 oct); faltan voz, texto y recorrido
- prioridad: 2
- spec: docs/tutorial/SPEC.md

## Hecho
- Diseño cerrado (SPEC, GUION de 29 pasos, FRASES) y arte pixel: Grimorio (15 poses × 3 bocas), huevos con nacimiento, marcos.
- Guion completo programado y conectado: cuenta nueva lo ve sola, guarda mascota y nombre reales, premio de 150 ⚛ una vez, Ajustes › Tutoriales, filtro de nombres.
- Avisos del Grimorio (primera vez por sección y novedades con versión) y revisión en móvil (390).
- Objetos del refugio resaltados, voz por letra con botón de silencio.
- **Inicio mágico (18 oct)**: fondo mágico con tema de química (`magia.js`), velas con llama animada, aura del Grimorio (runas en órbita, chispas) y nube de diálogo con vida. Aprobado por Niquito.
- **Huevos y mascota (18 oct)**: huevos vivos por especie (`huevos.js`), nacimiento con estallido, dab y grito/timbre por especie. Falta revisar en 390.

## Falta
- **Voz del mago**: no le gusta la actual (voz por letra estilo videojuego); probar otras o solo un blip suave, y dejarlo elegir.
- **Texto con personalidad** (hoy suena "NPC") y arreglar el salto de pantalla hacia arriba al apretar Siguiente.
- **Recorrido por la app real**, modular por secciones (ver SPEC › REDISEÑO), con animaciones y explicando lo que hay detrás.
- Opcional: separar el libro del altar y animar barba/páginas por piezas (hay que avisar al chat de Cuentas: `entrada.js` usa el mismo sprite).
- Premio con nube (necesita permiso explícito) y revisar 150 ⚛ si cambian los precios.

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
Chat: Tutorial. Lee CLAUDE.md, la skill nexo-tutorial, docs/tutorial/SPEC.md (secciones "Inicio mágico" y "Huevos y mascota") y docs/chats/tutorial.md.
Inicio mágico, huevos vivos, estallido, dab y voz por especie ya están. Parte desde "Falta" y pregúntame con selección múltiple cuál sigue: voz del mago y texto con personalidad, o el recorrido por la app real (modular por secciones).
```
