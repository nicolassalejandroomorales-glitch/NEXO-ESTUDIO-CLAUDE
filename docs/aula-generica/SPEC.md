# Aula genérica: que TODAS las clases se estudien en el diseño nuevo

Pedido de Niquito (18 oct 2026): «una vez estén listas todas las clases, incorpóralas al diseño de la aplicación y que estén operativas y funcionales para poder estudiar dentro de la app». Trabaja solo en el repo **`claude`** (NEXO-ESTUDIO-CLAUDE); `origin` solo con su aprobación (CLAUDE.md, «Dos repos»).

## Dónde estamos (verificado en `claude/master`, 18 oct)
- Contenido listo y con pruebas OK (`node tools/classroom-test.cjs`: 13 clases, 642 actividades; `node tools/exercise-quality.cjs`): org-01, org-04, org-05 (Aminas, Aromaticidad, SEA), ana-01..03, fq-01..03 (con diapositivas reales de cátedra) y fis-01, fis-02, fis-06, fis-09 (sus diapositivas reales las hace otra sesión).
- **Pantalla de clase: no existe.** El commit `69a2420` borró la torre del alquimista (`classroom.css`, `tower-art.js`, 130 KB de `player.js`). Hoy `#/lesson/<clase>` (`renderLesson` en `app.js`) solo muestra «Disponible próximamente… dentro de la Cámara del ramo».
- Lo único jugable: la **estación** `#/station/org-01/m4` (`renderStation` en `app.js`, `dist/classes/estacion.js/.css/-art.js`): piloto de Basicidad, 4 pasos Adivina → Clase → Práctica → Demuestra, mascota real que habla, cristal-pantalla. Está escrito a mano para esa misión (generador `basicidad`, RDKit, concepto `am.orden`).
- Quedó intacta la **lógica** en `dist/classes/player.js` (`window.NexoClassroom`, 38 KB) y la evidencia en `evidence.js`. El Sótano (`dist/aprender/`) ya muestra el estado de las clases y al tocar un frasco manda a la clase en esa misión.

## Qué hay que construir
Una pantalla de clase **genérica** (`dist/classes/aula.js` + `aula.css`, sin dibujar la torre vieja) que corra cualquiera de las 13 clases sobre `NexoClassroom`, con la **misma estética de la estación** (cristal-pantalla, mascota que habla, pantalla completa con «← Salir»).

### 1. Reproductor de misión (el corazón)
`NexoClassroom.beats(cls, session)` ya entrega la clase como secuencia de «momentos» (`beat.kind`): `path`, `pick`, `say`, `hook`, `question`, `offer`, `lesson`, `step` (ejemplo resuelto), `rescue`, `detour`, `plan`, `trainpick`, `trainsum`, `albaclose`, `simstart`, `simresult`, `diagresult`, `basepick`, `close`. `beatDone(s, b)` dice cuáles ya pasaron. La pantalla vieja (ver `git show 4d1c18b:dist/classes/player.js`, funciones `render`, `panel`, `onClick`, `onActivity`, y `git show 4d1c18b:dist/classes/classroom.css`) dibujaba un momento a la vez. Solo hay que **dibujar cada `kind`** en el cascarón de la estación y llamar a las mismas funciones de lógica. No copiar el dibujo viejo: copiar el comportamiento.
- Los 4 pasos de la estación salen de las etapas: Adivina = `stage` `pretest` y `diagnostic`; Clase = `hook` + `lesson` (+ `step`); Práctica = `practice` (con pistas y reintento); Demuestra = `transfer` (sin pistas, un intento, opcional con reloj) y los puntos de `cls.goal` («Tu PEP 1»).
- Cada respuesta: `NexoClassroom.withConfidence` (barra de confianza opcional) → `logEvidence` (`evidence.js` + FSRS) → `saveState`. El estado vive en `state.classSessions[clase]` (`sessionFor`). Mismo contrato que la pantalla vieja: así no se rompen el Sótano ni la Torre del Sauce.

### 2. Tipos de actividad que hay que dibujar (todos corrigen con `NexoClassroom.isCorrect`)
Conteo real en las 13 clases: `choice` 294 · `number` 96 · `write` 71 · `classify` 43 · `order` 40 · `match` 32 · `spot` 28 · `recipe` 12 · `build` 8 · `arrows` 7 · `pick` 4 · `poe` 2.
- **Prioridad 1** (Analítica, FQ y Fisiopatología usan SOLO estos): `choice`, `number` (entrada con coma/punto, `1,2e-3`, `parseNum`; unidad si hay `units`; `traps` con su porqué), `order`, `classify`, `match`, `spot` («encuentra el paso con el error» + cómo se corrige), `write` (autoevaluación con `rubric` y `keywords`, `teach: true` = «enséñale a tu compañero»).
- **Prioridad 2** (Orgánica): `recipe`, `poe`, `pick`, y `build`/`arrows` que delega en `window.NexoMolEditor` (`dist/classes/editor.js`, `molecule.js`).
- En todas: pista (`hint`), explicación (`explain`), «Explícame más simple» (`block.deeper`, `mini[concept]`), error típico con su mensaje (`misconceptions[mc].why`), fuente (`slide`).

### 3. Hub de la clase en `#/lesson/<id>`
Reemplaza el «Disponible próximamente». Muestra: título, cuenta regresiva a la PEP (`NexoClassroom.nextExam`), puntos asegurados (`goalOf`), las misiones (estado y botón), y los caminos de `PATHS`: Diagnóstico, Tengo X minutos, Entrenar (infinito, `newRun`/`trainAdvance`), Ronda del alba (`roundPick`), Simulacro PEP (`simBuild`/`simScore`, nota 1–7), Expedición, Repaso desde cero (`base`). Más: **Diapositivas** (visor), Glosario, Formulario con calculadora (`cls.formulas[].calc`), Más ayuda (`cls.mini`, `cls.deep`), Bestiario (`bestiary`). Entrada desde el Sótano: ya setea sesión y misión; la pantalla debe respetarlo y volver al Sótano al salir.

### 4. Visor de diapositivas reales
`cls.slideImages` (de `dist/classes/slides/<clase>.js`, cargado por `loadClassroom`) + `cls.slides` (texto: «Lo que dice, en texto»). Botón «Ver diapositiva N» en cada actividad y bloque (`slide`), navegación anterior/siguiente, título «Clase de cátedra · <profesor>». Las imágenes ya cargan; solo falta el visor (el viejo estaba en `render`, `s.slideOpen`).

### 5. Estación de Basicidad
Se queda como está (extra de org-01 m4). Idealmente su cascarón (arte, mascota, burbuja, `burst`, `react`, pantalla completa) se extrae de `estacion.js` y lo comparten las dos; **tocar `estacion.js` lo mínimo y avisar**: el diseño del Sótano/Cámara lo lleva otro chat.

## Reglas y trampas ya descubiertas
- No tocar `player.js` salvo para exportar algo que falte (lo usan Sótano, Torre y pruebas).
- La corrección numérica (`numOk`) tiene un piso absoluto de 1e-12: una respuesta menor que ~1e-10 acepta cualquier valor. Los generadores de fq-02 ya lo evitan; si cambia, quitar el filtro de `solub` nivel 4.
- Diapositiva 22 de fq-02 trae un error de cálculo (I = 0,10, no 0,01) y fq-03 evita los ejercicios de FEM (diap. 83–93) por datos incoherentes: ya está dicho dentro de la clase.
- Pantalla nueva = pixel art + ambientación de la torre (hora/clima, alquimista excéntrico + naturaleza), nada de «pantalla de formulario» (CLAUDE.md). Probar en 1440 y 390, sin scroll horizontal, `prefers-reduced-motion`.
- Archivos compartidos (`app.js`, `data.js`, `index.html`, `startup-bundle.js`): tocar lo mínimo. Trabajar en un worktree limpio de `claude/master` y subir con `git push claude HEAD:master`; **nunca** a `origin` sin aprobación. Regenerar con `node tools/build-startup.cjs` y volver a pedir `claude/master` justo antes de subir (otros chats suben seguido).

## Criterios de aceptación
1. Desde el Sótano y por URL, `#/lesson/<id>` abre el hub de las **13 clases**, sin «próximamente».
2. En cada clase se completa de punta a punta una misión: Adivina → Clase → Práctica → Demuestra, con diapositiva real visible, pista, «más simple», corrección y puntos de «Tu PEP».
3. Los 12 tipos de actividad corrigen igual que `isCorrect` (prueba nueva en `tools/aula-test.cjs` que arma cada tipo y comprueba correcto/incorrecto).
4. Entrenar, Ronda y Simulacro funcionan y escriben evidencia (`NexoClassEvidence`) y repasos; el estado persiste al recargar.
5. `node tools/run-tests.cjs` verde, sin errores de consola, 1440 y 390 sin scroll horizontal.
6. Una captura de ana-01 (misión 2), fq-03 (misión 2) y org-01 (misión 4) para Niquito.

## Orden sugerido (Sonnet 5.5 · alto; Opus solo para decidir el cascarón compartido)
1) Cascarón + `choice`/`number`/`write` + una misión de ana-01 jugable. 2) Resto de tipos de prioridad 1. 3) Hub, visor de diapositivas, caminos. 4) Orgánica (recetas/molécula). 5) Pulido, mascota, sonido y prueba automática.
