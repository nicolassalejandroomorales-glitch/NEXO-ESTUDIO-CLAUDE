# Tutorial (Grimorio guía)
- modelo: Sonnet 5.5 · medio
- fase: desarrollo
- estado: todo conectado y publicado (Artifact v39); esperando que Niquito revise la animación del Grimorio por capas
- prioridad: 2
- spec: docs/tutorial/SPEC.md

## Hecho
- Diseño cerrado (SPEC, GUION, FRASES) y arte pixel: huevos con nacimiento, marcos y Grimorio.
- Guion programado y conectado: cuenta nueva lo ve sola, guarda mascota y nombre reales, premio de 150 ⚛ una vez, Ajustes › Tutoriales, filtro de nombres.
- Avisos del Grimorio (primera vez por sección y novedades con versión).
- Inicio mágico (fondo con runas, aura, nube), huevos vivos por especie, nacimiento con estallido, dab y voz por especie.
- Voz del Grimorio (blip grave por letra) y textos con personalidad.
- Recorrido por la app real (`dist/tutorial/recorrido.js`): Inicio, Aprender (Sótano de los Cristales), Organización y Perfil, con voz por letra, «hazlo tú» (tocar *Avanzar* en el Sótano) y globo bien ubicado en móvil. **Sin Juegos** (Niquito, 18 oct: se bugea) **y sin el paso «Configurar»** (no tenía sentido).
- Animación del Grimorio (18 oct): aura por emoción, humo, brasas, gestos por emoción y pergamino que se desenrolla.
- Grimorio por capas (18 oct, 9 capas en `dist/tutorial/grimorio-vivo.js`): fondo, manos, páginas, tapa, cara (parpadea), barba (ondea con inercia), boca, extras. Hojas nuevas `grimorio-*.png`; las viejas se borraron. Lo usan tutorial, recorrido, avisos y entrada.

## Falta
- Que Niquito revise y apruebe: Grimorio por capas, aura/humo/pergamino, recorrido y «hazlo tú» (todo sin aprobar aún).
- Ajustar la intensidad de los movimientos según lo que él vea (barba, manos, tapa, páginas).
- (Opcional) Cuadros extra para 3 o 4 poses clave: hablar, sorpresa, enojo, aparecer.
- Revisar el Grimorio por capas con captura en 390 (solo se probó por texto y en escritorio).
- Volver a poner el recorrido de Juegos cuando la sala de juegos esté lista.
- En 390 el documento mide 389 px de ancho: se sale ~14 px (lienzo `.tut-egg-fx` de los huevos y/o la app). Revisar en el tema de los huevos.
- Premio con nube (necesita permiso explícito, hoy no se toca Supabase).
- Revisar que 150 ⚛ siga bien si cambian los precios de la tienda.

- (18 oct) **URGENTE antes de publicar el Artifact**: el Artifact tiene versiones de `tutorial/tutorial.js`, `tutorial.css` y `magia.js` más nuevas que el repo (el repo: 35838 / 15989 / 17693 bytes; el Artifact: 38000 / 17360 / 20581). Ese trabajo está solo en la carpeta `NEXO_tutorial` (sin commit) y en el Artifact. Commitearlo y subirlo (`git push claude <rama>:master`) para no perderlo.

## Ideas
- Mini tutoriales por sección que se activan la primera vez que entras.
- El Grimorio recuerda tus preferencias y sugiere la primera sesión.
- Más pasos «hazlo tú» (usar un `sel` cuyo toque no cambie de pantalla; ver SPEC).

## Prompt de inicio
```
Chat: Tutorial (solo conversar primero). Lee CLAUDE.md, la skill nexo-tutorial, docs/tutorial/SPEC.md y docs/chats/tutorial.md.
Contexto: el tutorial está completo y publicado; falta mi revisión de la animación del Grimorio por capas.
Tarea: dime en una línea qué entendiste y hazme máximo 3 preguntas de selección múltiple sobre qué quiero ajustar. No escribas código ni dibujes hasta que yo diga "hazlo".
Al terminar, usa nexo-cierre y actualiza docs/chats/tutorial.md.
```

## Prompt de continuación
```
Chat: Tutorial. Lee CLAUDE.md, la skill nexo-tutorial, docs/tutorial/SPEC.md (secciones "Animación fluida del Grimorio" y "Recorrido por la app real") y docs/chats/tutorial.md.
El Grimorio por capas (9 capas, dist/tutorial/grimorio-vivo.js), la magia y el pergamino están publicados en el Artifact (v39). El recorrido ya no tiene Juegos ni el paso Configurar.
Parte desde "Falta": primero parte de dónde está master (trabaja en un worktree limpio de origin/master, mi carpeta principal queda atrás) y pregúntame con selección múltiple qué ajustar de lo que vi (barba, manos, tapa, páginas, aura, pergamino).
```
