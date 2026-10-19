# Rangos desde las clases

Tema: motor académico. Rama `motor-rangos`. Diseñado con Opus el 19 oct 2026; se puede implementar con Sonnet.

## Qué

Desde el 18 oct, las clases y los juegos ya escriben su evidencia en el motor (`dist/academic/class-bridge.js` → `engine.recordAttempt`), y el historial ya la muestra.
Pero **las clases no pueden dar ningún rango** (`dist/academic/ranks.js`), por 4 razones:

1. **Tiempo en 0.** El rango 1 exige ≥ 5 min activos en el concepto (`activeTimeSegments`), pero nadie llama a `NexoActiveStudy.begin` dentro de las clases (solo lo hace `rescue.js`).
2. **"Verificado" no incluye las clases.** Los rangos 3 y 4 solo cuentan evidencia con `source` `structured_validator` o `instructor_review`. La evidencia de clase llega con `source: 'class_item'`.
3. **Una familia por concepto.** El puente crea `class.<clase>.<concepto>`, pero el rango 3 pide ≥ 2 familias y el 4 pide ≥ 3. Imposible.
4. **La carta del perfil** (`profileCardData` en `app.js`) solo recorre `engine.model.concepts`. Tras recargar, ahí solo están los 10 conceptos del piloto, hasta que abres una clase.

## Decisiones (Niquito, 19 oct 2026)

- **Verificadas:** cuenta como verificada toda respuesta de clase o juego corregida por la app (`class_item`). Las **escritas** siguen siendo `self_rubric` (autoevaluación) y no suben los rangos 3 a 5.
- **Familias = tipo de habilidad dentro del concepto:**
  - reconocer: `choice`, `pick`, `spot`, `poe`
  - organizar: `order`, `classify`, `match`, `recipe`
  - calcular: `number`
  - dibujar: `build`, `arrows`
  - justificar: `write`

  Para llegar alto hay que dominar el concepto **de varias formas**, no solo eligiendo alternativas.
- **Perfil:** antes de calcular el rango, carga el catálogo de las clases donde hay evidencia. Así da el mismo rango que el mapa de conceptos, con prerrequisitos incluidos.
- No cambian los umbrales de minutos (5/12/25/40/60) ni las reglas de los estados de conocimiento.

## Cómo

1. **`class-bridge.js`:**
   - Agregar `FAMILY` (tipo → habilidad).
   - `familyId = class.<clase>.<concepto>.<habilidad>`.
   - `skillIds` del ejercicio según la habilidad.
   - Agregar `ensureFromEvidence(state)`: para cada clase con evidencia (prefijo `<clase>:` en `exerciseId`) y ya cargada en `window.NexoClasses`, llamar a `ensureClass`.
2. **`ranks.js`:** sumar `'class_item'` a la lista de fuentes verificadas. La regla `validationStatus === 'verified'` sigue igual, así que una escrita (`self_rubric`) nunca entra.
3. **Estación (`renderStation` en `app.js`).** Al implementar resultó que la pantalla vieja de la torre ya no existe en `master` (commit 69a2420) y que `player.js` quedó solo como lógica. Hoy la única clase jugable es la estación de Basicidad, y no llamaba al puente.
   - Al montar la estación: `NexoActiveStudy.begin(conceptOf(cls, 'am.orden'), 'practice')`. Los cambios de ruta ya llaman a `stop`.
   - En `onResult`, además de la evidencia de clase, llamar a `NexoAcademicBridge.record` (tipo `order` → familia organizar).
   - Una **escrita correcta** se marca como `reasoningSupported`. Es el requisito "justificó" del rango 3 (5º bloqueo, visto al implementar). Sigue sin contar como verificada.
4. **`app.js`, carta del perfil:** si hay evidencia de clases, cargar esas clases con el mismo cargador que usa el aula, llamar a `ensureFromEvidence` y recién ahí calcular el máximo. Cambio mínimo, con `try`, como hoy.
5. **Pruebas:** ampliar `tools/class-bridge-test.cjs` y `tools/rank-test.cjs` (ver criterios).

La evidencia antigua no se reescribe: es inmutable. Las respuestas viejas quedan en la familia antigua `class.<clase>.<concepto>`, que cuenta como una familia más. No se inventa nada.

## Criterios de aceptación

- [ ] 6 min en una clase respondiendo bien sin ayuda un concepto → rango 1 en ese concepto (`activeTimeSegments` con su `conceptId`).
- [ ] Un concepto con aciertos sin ayuda en 2 habilidades distintas (por ejemplo elegir y calcular), con el tiempo y los prerrequisitos listos → puede llegar al rango 3.
- [ ] Un concepto con aciertos **solo de escritas** no pasa del rango 2.
- [ ] Al recargar la app, la carta del perfil muestra el mismo rango que `#/learn` para un concepto de clase.
- [ ] Los juegos (`encounter.js`) siguen registrando, con las mismas familias por habilidad.
- [ ] `node tools/run-tests.cjs` en verde. Probado en 1440 y 390.

## Estado (19 oct 2026)

Implementado en la rama `motor-rangos`, con 41/41 pruebas OK.
Probado en el navegador (1440 y 390): con evidencia solo de FQ, tras recargar la carta muestra "Mago Intermedio" (antes: "Sin rango"), y la estación suma minutos a `org-01:am.orden`.
No se probó en el navegador un resultado real de "Demuestra" en la estación: lo cubre `class-bridge-test`.

## Pendiente

- **Tema clases:** cuando Clases v2 sume más estaciones o actividades, cada una debe llamar a `NexoActiveStudy.begin` y a `NexoAcademicBridge.record`, como `renderStation`. `player.js` → `logEvidence` ya no lo llama nadie.

- `world/torre-mundo.js` (`labProgress`) cuenta como casos del piloto todo `exerciseId` que empiece con `org-01:`, y ahora la clase org-01 también usa ese prefijo. Anotado en `docs/pendientes.md` (tema torre).
- `study_bank` (motor de estudio piloto) también se corrige de forma exacta, pero no cuenta como verificado. Decidirlo aparte.
- Auditoría del 19 oct (otros temas): conceptos que no pueden llegar a "hoja verde", escritas autocorregidas, falta de ejemplos resueltos y de variedad fuera de Orgánica.
