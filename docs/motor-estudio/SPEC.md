# Motor de estudio (sesión adaptativa) — SPEC

## Qué
Pantalla `#/study`: una sesión de estudio que elige la siguiente actividad según tu evidencia (repasos vencidos, errores, prerrequisitos, nivel) y registra ayudas, intentos y repasos FSRS. Piloto: **Aminas (Orgánica II)**.

## Origen
Portado del prototipo `NEXO_CONTROL1_ORGANICA_V03` (hecho con ChatGPT/Codex, 17 oct 2026): `content.js` (33 actividades, 6 habilidades) y `engine.js` (elección, ayuda, FSRS). No se trajeron las 7 salas, el pasillo SVG ni el taller de Hofmann (el propio prototipo dice que no reemplazan el arte de la torre).

## Decisiones
- Código en `dist/study/` (content, engine, ui). Estado en `state.studyEngine` (se guarda/respalda con el resto).
- Reglas del prototipo: la ayuda (pista/repaso) hace que el acierto no cuente como independiente; retención = otro día + otra familia; leer ≠ dominar.
- Modos de la UI: "Estudiar hoy" (repasos vencidos si hay, si no práctica), diagnóstico (1 por habilidad) y práctica por habilidad.
- Se carga bajo demanda desde `renderStudy` en `app.js` (FSRS vendor → content → engine → ui).

## Puente con el motor académico (hecho)
- `model.js`: conceptos nuevos `org.alkylation` y `org.hofmann`, una familia por habilidad (`org.study.*`) y los 33 ejercicios `org-01:study-<id>` con validador `study_bank` (corrección determinista local, evidencia `verified` pero **no** cuenta para rangos, que exigen `structured_validator`).
- `ui.js` llama a `recordAttempt` en cada comprobación: alimenta evidencia, estados y repaso FSRS por concepto. Idempotente por id.

## Criterios de aceptación
- Elegir sesión, contestar, pedir pista, comprobar, recargar y retomar en el mismo punto. ✔ (probado en navegador)
- Reenvío no duplica intento. ✔ (`tools/study-engine-test.cjs`, 16 pruebas)

## Fase 1 · Clases → motor (hecho, 18 oct 2026)
- `dist/academic/class-bridge.js`: cada respuesta de una clase (`logEvidence` en `player.js`) también llama a `recordAttempt`. Lo que se registra sale **de la propia clase**: conceptos y `needs` (prerrequisitos), fuentes con la **diapositiva exacta** de cada ejercicio, y errores típicos (`misconceptions`) como equivocaciones confirmadas por distractor etiquetado.
- Aminas (org-01): 4 bases + 22 conceptos. 5 se funden con el piloto (par libre, pKa, resonancia, heterociclos, Hofmann): una sola evidencia por idea.
- Honestidad: reintentar tras ver la corrección cuenta como ayuda; respuestas escritas quedan `self_reported`; generados comparten ejercicio por generador y nivel; transferencia es otro ejercicio. Valida como `class_item` (no cuenta para rangos, que exigen `structured_validator`).
- `model.extend()` amplía el catálogo y deshace todo si no valida o crea ciclos; el grafo del motor se reconstruye solo (`model.revision`).
- Prueba: `tools/class-bridge-test.cjs`. Verificado en el navegador con un ejercicio de Entrenar.
- **Todas las clases (18 oct)**: ana-01/02/03, fis-01/02/06/09, fq-01, org-01/04/05 ya cumplen el formato (concepto, fuente y diapositiva por ejercicio, `needs`, `misconceptions`). Cada clase tiene sus conceptos con id `<clase>:<concepto>` (así `base.gases` de Fisiología y el de Fisicoquímica no se mezclan); solo los alias comparten evidencia con el piloto (org-01 y org-04: par libre, pKa, resonancia, heterociclos, Hofmann). `courseId` = ramo de la clase.
- Para sumar otra clase: declarar `needs`, `source`, `slide` y `misconceptions` (ya lo piden las guías); añadir alias en `ALIAS` solo si el concepto ya existe en el piloto.

## Dónde vive (Niquito, 17 oct 2026)
Lo que sale en **Aprender** es el rediseño de las puertas (`docs/chats/aprender.md`, `docs/aprender-pasillo/`). `#/study` es una pantalla de prueba, no la entrada final: el motor (`dist/study/`, `recordAttempt`) debe quedar detrás de los objetos del aula (frasco de misión, mesa, cristales de repaso, grietas). No agregar entradas nuevas a Aprender desde aquí; coordinar con ese chat antes de conectar.

## Pendiente
- Entrada visible (botón en la torre / Plan del día); hoy solo existe la ruta `#/study`.
- Estética pixel/torre (hoy es una pantalla sobria).
- Otros ramos (mismo formato de `content.js`), respuestas abiertas, taller de Hofmann del prototipo.
- Falta fecha/temario del Control 1 reprogramado: no inventar.
