# Hoja verde: que todo concepto pueda llegar

Tema: motor académico (`dist/classes/evidence.js`). Diseñado el 19 oct 2026; se puede implementar con Sonnet.
Viene del punto 2 de la auditoría del 19 oct (ver `docs/motor-rangos/SPEC.md`, Pendiente).

## Qué

La hoja verde ("Hoja verde · por tu cuenta") es el estado `independent`: hay que haber **producido solo**. Hoy `leaf()` la da con 1 respuesta que cumpla
`independent(r)`: correcta, sin pista, sin reintento, escalón ≥ 5 y sin acierto frágil. En `DEFAULT_STEP` solo `write` y `number` están en el escalón 5.

El problema, medido leyendo las 13 clases (ana, fis, fq, org) con un script, sin generadores:

- De **123 conceptos**, **60 no tienen ninguna actividad de escalón 5** (los generadores y el "Demuestra" podrían subir algunos: el auditor lo mide con el catálogo real).
- **56 ni siquiera llegan al escalón 4**, y **30 de ellos son `base.*`** (Lewis, log, ohm, moles...): no tienen actividades. Son prerrequisitos que nadie practica, así que nunca pasan de "semilla".
- Aun con el escalón 4 (dibujar molécula o flechas), hay conceptos con un solo ejercicio, así que 1 golpe de suerte los pintaría verdes.

## Decisiones (Niquito, 19 oct 2026)

1. **Qué cuenta como "producir solo": escalón ≥ 4, sin ayuda.** Dibujar molécula o flechas (`build`, `arrows`), `write` y `number` cuentan. Siempre sin pista, sin reintento y sin acierto frágil (confianza ≤ 60 %).
   Elegir, ordenar, clasificar, unir, tocar y detectar el error (escalones 2 y 3) siguen sin dar verde: se pueden acertar al azar.
2. **Cuánta evidencia: 2 aciertos en ejercicios distintos** (`itemId` distinto) para pasar a verde. Un acierto solo deja la hoja en "clara". Dos intentos del mismo ejercicio no suman.
3. **Conceptos `base.*`:** llegan a verde igual que los demás. La clase les agrega 1 o 2 ejercicios de calcular o dibujar (tema clases). El motor solo avisa cuáles faltan. No se crean excepciones ni diagnósticos nuevos.
4. **Alcance:** regla + auditor + prueba. El contenido que falta **no** se escribe en este cambio.

## Cómo

1. **`evidence.js`**
   - Reemplazar `independent` por `solo(r) = r.correct && !r.hint && !r.retry && r.step >= 4 && r.kind !== 'fragil'` (el umbral pasa de 5 a 4).
   - Constante `SOLO_NEEDED = 2`. En `leaf()`, verde exige `recs.filter(solo)` con **≥ 2 `itemId` distintos**. Con 1 queda en "clara" (si hubo un paso ≥ 4 correcto, como hoy).
   - `intensa` (transferencia) y `flor` (≥ 24 h después) siguen exigiendo `solo`, y además tener verde; `firstSolo`/`delayed` en `record()` usan `solo`.
   - Texto de `STEPS[4]` ("Producir con ayuda"): aclarar que dibujar sin pista ya es producir. Revisar que no contradiga el cartel de `LEAVES`.
2. **Auditor `auditGreen(classes)`** (misma carpeta, exportado en `NexoClassEvidence`): para cada concepto de cada clase devuelve el escalón máximo y cuántos ejercicios distintos de escalón ≥ 4 tiene, incluyendo lo que traen los generadores y el "Demuestra". Marca los que **no pueden** llegar a verde (menos de 2 ejercicios de escalón ≥ 4).
3. **Prueba** en `tools/class-evidence-test.cjs` (ampliar, no archivo nuevo):
   - 1 `number` correcto → clara; 2 `number` distintos → verde; el mismo `itemId` dos veces → clara.
   - `build` sin pista × 2 → verde; con pista, con reintento o con acierto frágil → no suma.
   - Dos aciertos de `choice` + `order` → no pasan de brote.
   - Retrocompatibilidad: la evidencia antigua no se reescribe y la hoja se recalcula con la regla nueva (puede bajar una hoja que antes era verde por un solo `write`; es lo esperado).
   - La prueba imprime la lista de conceptos que no pueden llegar a verde. **No falla** por ellos hoy (son el pendiente de clases), pero sí falla si una clase nueva queda con un concepto sin salida y no está en la lista permitida.
4. **Efectos a revisar** (no se tocan aquí): `class-bridge.js` (mapea las hojas a `unseen..retained`), la carta del perfil y el sello dorado del grimorio. Solo comprobar que siguen coherentes.

## Criterios de aceptación

- [ ] 1 acierto de calcular solo = "Hoja clara"; el 2º ejercicio distinto = "Hoja verde".
- [ ] Dos `choice` o dos `order` perfectos nunca dan verde.
- [ ] Un `build`/`arrows` sin pista cuenta; con pista no.
- [ ] `auditGreen` lista los conceptos sin salida a verde, con ramo y clase, y corre dentro de `node tools/run-tests.cjs`.
- [ ] `node tools/run-tests.cjs` en verde. Probado en el navegador (1440 y 390) con una clase que tenga evidencia.

## Pendiente

- **Tema clases:** agregar 1 o 2 ejercicios de calcular o dibujar a cada concepto marcado por el auditor, empezando por los `base.*` (30) y los de escalón ≤ 3 de Orgánica (control más cercano). Pasar la lista al chat de clases.
- Escritas autocorregidas (`self_rubric`): hoy una `write` correcta cuenta para verde. Decidir aparte si la autoevaluación debe valer menos que una respuesta corregida por la app (punto 3 de la auditoría).
- Falta de ejemplos resueltos y de variedad fuera de Orgánica (puntos de la auditoría, otros temas).

## Estado (19 oct 2026)

Implementado: `evidence.js` (`solo`, `SOLO_NEEDED = 2`, `auditGreen`), `class-evidence-test.cjs` ampliada (con tope por clase de conceptos sin salida a verde: ana-01 9, ana-02 3, ana-03 4, fis-01 7, fis-02 5, fis-06 4, fis-09 5, fq-01 4, fq-02 5, fq-03 4, org-01 18, org-04 7, org-05 11 = 86) y `camara-test.cjs` ajustada (ahora usa 2 ejercicios). 35/35 pruebas OK. Sin probar en navegador ni commit todavía.
Cuando clases agregue ejercicios, bajar el tope de esa clase en la prueba.
