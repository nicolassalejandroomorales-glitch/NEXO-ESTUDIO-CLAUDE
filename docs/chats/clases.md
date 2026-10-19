# Clases (contenido y aula)
- modelo: Sonnet 5.5 · medio
- estado: en curso
- prioridad: 1
- spec: docs/clases-estructura/SPEC.md

## Hecho
- ~~Aula inmersiva "torre del alquimista"~~ **borrada el 18 oct 2026** (estética vieja): `player.js` quedó como solo lógica (`NexoClassroom`, 38 KB); `#/lesson/<clase>` muestra "Disponible próximamente" + botón a la estación. La pantalla nueva vive en la Cámara del ramo.
- Aminas completo para la PEP 1 (misiones 2 a 8, 63 actividades verificadas), diapositivas y glosario.
- Clases de Analítica, Fisiopatología, Orgánica II y FQ II; ejercicios infinitos con regla de calidad.
- Guía para crear una clase: `docs/clases-estructura/COMO_CREAR_UNA_CLASE.md` y `node tools/new-class.cjs`.

## Clases v2 (18 oct 2026)
- Paso 1 hecho: 3 versiones visuales de la estación Basicidad (`docs/clases-v2/estacion-basicidad.html`, SPEC en `docs/clases-v2/SPEC.md`). Decidido: mini juego "Atrapa el H⁺", habla la mascota.
- Elegida la versión C (cristal-pantalla). Paso 2 hecho: prototipo en `dist/classes/estacion-prueba.html` (mascota real, textos cortos, animaciones fluidas). Niquito descartó "Atrapa el H⁺" (no prepara para la PEP): ahora Práctica + Demuestra con la pregunta 3 de la PEP (reloj, un intento, puntos asegurados, repaso). Aprobado. Paso 3 hecho: estructuras dibujadas (RDKit) y conectado a la app (`#/station/org-01/m4`, tarjeta en las misiones, evidencia + repaso). Falta: otras misiones, celular real.

## Falta
- Que la clase de Aminas → Basicidad se sienta increíble (corrección real, actividades variadas). Es lo más importante del producto.
- Revisar las clases hechas en móvil (390 px).
- Construir la clase dentro de la Cámara (diseño cerrado en `docs/clases-v2/SPEC.md`, sección "La clase dentro de la Cámara"). Sin esto, las clases solo se entran por la estación de Basicidad.

## Ideas
- Modo "simulacro" de PEP 1 con tiempo y pauta.
- Retrosíntesis guiada paso a paso con flechas dibujadas por el usuario.
- Clases de otros ramos del semestre con la misma estructura.

## Prompt de inicio
```
Chat: Clases (contenido y aula). Lee CLAUDE.md, la skill nexo-clase y docs/clases-estructura/SPEC.md.
Contexto: Aminas está completo para la PEP 1 (27 oct). Quiero que la parte de Basicidad se sienta increíble, con corrección real y actividades variadas.
Tarea: dime en una línea qué entendiste, revisa la clase en desktop (1440) y móvil (390), y propónme con selección múltiple las 3 mejoras de mayor impacto antes de programar.
Si aparece un problema de diseño del motor, no lo resuelvas aquí: anótalo en docs/chats/motor.md. Al terminar, usa nexo-cierre y actualiza docs/chats/clases.md.
```

## Prompt de continuación
```
Chat: Clases (contenido y aula). Lee CLAUDE.md, la skill nexo-clase y docs/chats/clases.md.
Parte desde "Falta" del archivo de chat y pregúntame qué sigue.
```

## Prompt de continuación (Clases v2 · la clase en la Cámara)
```
Chat: Clases v2 (la clase dentro de la Cámara de Orgánica II). Lee CLAUDE.md, la skill nexo-clase, docs/clases-v2/SPEC.md (sobre todo "La clase dentro de la Cámara"), docs/aprender-pasillo/SPEC.md y docs/chats/clases.md.
Dónde quedamos (18 oct 2026): la torre vieja ya está borrada (player.js = solo lógica). Diseño cerrado: la Cámara (cripta circular, sauce de cristal, una alcoba por tema, mesa con un frasco por misión, un cristal por concepto) es donde se juega.
Tocas un frasco = una misión → la cámara entra al frasco → el cristal-pantalla flota sobre la alcoba (mascota al lado). Siempre 4 pasos (Adivina, Clase, Práctica, Demuestra), con modos distintos del cristal y la pieza de Práctica/Demuestra según la misión (ordenar, receta, nombrar, espectro). 8 frascos abiertos con "sugerido de hoy". Al terminar: mini escena de 3-4 s (frasco se llena, cristal se enciende, luz a la rama del sauce, según evidencia real). Celular: flechas ◀ ▶ y toque en la alcoba.
Falta por conversar (sin código): sonido de la sala (propuesta: Web Audio sintetizado, acorde que se afina con tu avance, Demuestra casi en silencio, botón de silencio; Niquito aún no respondió si quiere zumbido de fondo o silencio) y cómo se ven las grietas de errores.
Primero dime en una línea qué entendiste y hazme máximo 3 preguntas de selección múltiple. Luego: plan de construcción en pasos chicos en el SPEC (Opus), y recién ahí implementar con Sonnet 5.5. Primer corte sugerido: Cámara de Aminas navegable en la app + abrir el frasco de Basicidad (m4) con la estación existente. Probar en 1440 y 390.
Al terminar, usa nexo-cierre y actualiza docs/chats/clases.md.
```

## Aula nueva y prueba final (19 oct 2026)
- Hecho: `dist/classes/aula.js` (+ `aula.css`) es la pantalla de cada misión, en el estilo de la estación; `demuestra` por misión con la prueba final en formato PEP. Detalle en `docs/clases-v2/SPEC.md` («El aula nueva y la prueba final»).
- Escena final, campanilla y grietas de errores ya están en el Sótano (`dist/aprender/sotano-luz.js`). La Cámara propia de la rama `clases-camara` queda solo como referencia.

## Prompt de continuación (aula nueva)
```
Chat: Clases v2 (aula nueva). Lee CLAUDE.md, la skill nexo-clase, docs/clases-v2/SPEC.md («El aula nueva y la prueba final») y docs/chats/clases.md.
Hecho: aula.js en estilo estación para todas las misiones, prueba final PEP por misión, mezcla de alternativas.
Hecho también: panel «Camino al 7», mini clase y clase a profundidad. Tarea: glosario, formulario, recetario y bestiario dentro del aula nueva; `demuestra` para FQ II 02 y 03 cuando estén en master. Regla: nunca el aspecto de la pantalla vieja; contraste y animaciones revisados antes de entregar. 1440 y 390. Sonnet 5.5.
```
