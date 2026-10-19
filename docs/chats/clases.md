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

## Clases funcionales hasta la PEP 1 (18 oct 2026)
- Prioridad de Niquito: que cada ramo tenga clases de verdad (PPT real, explicación a fondo, ejemplos, versión simple, práctica y prueba) al menos hasta su PEP 1. Orden pedido: Analítica (control 19 oct) → Orgánica → FQ → Fisiopatología.
- Analítica: PPT de cátedra 2026 bajados de Classroom (Conceptos, Etapas, Errores, Análisis volumétrico, Volumetría ácido-base). ana-01 (89 diapositivas), ana-02 (35), ana-03 (61) ya muestran las diapositivas reales y cada actividad apunta a su página real. Pruebas OK.
- Analítica control 1 (19 oct): bajados de Gmail el PPT «Clase 2 Ejercicios» y la «Guía 1 2026» (Vidal). Guía = errores y análisis de datos. ana-01 ahora enseña test Q de Dixon (diapositivas 83 y 86) y «elegir al mejor laboratorio/método» (misión m2, parte 3) y tiene 2 generadores nuevos (`dixon`, `comparar`). Pendiente: probar en celular (390) y que Niquito revise la química; la diapositiva 87 de Pizarro tiene un error (B: Er = 0,64 %, no 0,006 %).
- Orgánica (hecho 18 oct): org-02 (pKa) y org-03 (par libre) ya vivían en org-01 (misiones 4 y 5), así que se quitaron del mapa; la PEP 1 queda con Aminas, Aromaticidad y SEA (3 clases con contenido). PPT y 3 guías 2021 bajados de su Classroom (ids en el correo usach); las guías aún no se usan como ejercicios: pendiente decidir si se suman a org-01/04/05.
- FQ II (hecho 18 oct): fq-02 «Actividad y fuerza iónica» (3 misiones: electrolitos y actividad, Debye–Hückel con solubilidad y Ka, conductividad; 104 diapositivas) y fq-03 «Celdas galvánicas y Nernst» (3 misiones: potenciales y celdas, ΔG/K/Nernst, pH por fem y Faraday; 101 diapositivas), ambas con generadores propios. PPT: Classroom «FQII - Farmacia» (Clases 5 I, 5 II y 6). fq-01 ya muestra las diapositivas reales (Clases 1–4, 192 páginas; las referencias van al inicio de cada sección porque casi todo son imágenes). Pendiente: revisión química de Niquito.
- Errores en el material de FQ (avisados dentro de la clase o evitados): la diapositiva 22 de fq-02 da I = 0,01 y la suma correcta es 0,10; los ejercicios «Aplicaciones de FEM» de la Clase 6 (diap. 83–93 de fq-03) tienen datos incoherentes (γ± ≈ 27, pH negativo) y no se usaron.
- Límite del reproductor (chat de diseño): las respuestas numéricas tienen una tolerancia mínima absoluta de 1e-12, así que en respuestas < 1e-10 (p. ej. K°ps del AgBr) cualquier valor se acepta; en fq-02 se evitó. Si algún día se cambia, quitar el filtro de `solub` nivel 4.
- Prompt de continuación: «Chat Clases. Lee CLAUDE.md, la skill nexo-clase y docs/chats/clases.md. Sigue por Fisiopatología: sus 4 clases PEP 1 ya tienen contenido, pero sin diapositivas reales; busca las de cátedra (correos de Hugo Cárdenas y Drive), conviértelas con slides.py y reasigna cada slide: como se hizo en ana-01. »

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

## FQ II · PEP 1 con el motor (19 oct 2026)
- **PEP 1 de FQ II: miércoles 28 de octubre** (correo del Dr. Pino, 19 oct). Control 1: lunes 26. `dist/semester-2026.js` y el Inicio todavía muestran 21 oct: lo mueve el chat de Organización (arreglar también `calendario-test` y `organizacion-test`).
- Hecho: `docs/fq-pep1-motor/MAPA.md` (qué cae, prioridad, errores del material, bibliografía), `SIMULACRO.md` (100 min, 5 problemas, pauta), generadores `eqmoles` y `gibbsvh` (fq-01) y `mezcla` (fq-02), actividad escrita `m2-w2`. fq-01/02/03 siguen en `borrador`.
- Falta: Guías 2 y 3 de 2026 (adjuntos de M. Zapata; Gmail no los baja), confirmar duración y p° con la cátedra, simulacro mezclado dentro de la app, aprobación de Niquito por clase.

## Prompt de continuación (FQ II PEP 1)
```
Chat: Clases FQ II (PEP 1 el miércoles 28 oct). Lee CLAUDE.md, la skill nexo-clase y docs/fq-pep1-motor/SPEC.md, MAPA.md y SIMULACRO.md.
Hecho: mapa de qué cae, generadores eqmoles/gibbsvh/mezcla, simulacro en documento.
Tarea: lee las Guías 2 y 3 de 2026 que Niquito deje en la carpeta del chat, ajusta los generadores de fq-02 y fq-03 a lo que piden, y construye el simulacro mezclado dentro de la app. Después, revisión con Niquito clase por clase para sacarlas de borrador. Sonnet 5.5.
```
