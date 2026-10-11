# Etapa 5 · Formulario con investigación y recetario de pociones

Parte del plan de `docs/clase-viva/DISENO.md` (§6 "El grimorio").

## Qué

El **Libro** de la torre pasa a ser **tu grimorio**, con 3 pestañas:

1. **Glosario** (ya existía, 3 capas).
2. **Formulario**: 8 tarjetas de Aminas (pKa, pKa + pKb = 14, Keq desde pKa, Henderson-Hasselbalch, carga formal,
   regla del nitrógeno, picos N–H en IR, regla de Hückel). Cada una: fórmula · qué es cada letra y su unidad · para qué sirve ·
   cuándo se usa · ejemplo resuelto · a fondo · fuentes. Algunas traen una **calculadora** para probar valores.
3. **Recetario**: 10 reacciones (síntesis de la misión 6 y reacciones de la misión 7) que **se completan con tu evidencia**:
   - sin ver → "???" (solo dice en qué misión aparece),
   - vista (respondiste algo de ese concepto) → nombre, ingrediente base y resultado; lo demás "???",
   - aprendida (acertaste una vez) → completa,
   - dominada (hoja verde o más) → sello dorado.

Además: en la barra de confianza, el porqué **"no recuerdo la regla"** abre la tarjeta del formulario de ese concepto.
En **Prueba encima** y en el diagnóstico el formulario está cerrado (como en la PEP).

## Decisiones

- **Orden de fuentes** (DISENO §6): diapositivas de cátedra → libros del programa (McMurry) → LibreTexts (adaptación abierta de McMurry).
  La IUPAC (Gold Book) quedó fuera porque la red de esta sesión la bloquea; se puede agregar después.
- Henderson-Hasselbalch **no está en las diapositivas**: se marca así y se explica para qué sirve (extracción y fármacos).
- **Ejemplo resuelto** en cada tarjeta: estudiar ejemplos resueltos ayuda a los novatos (efecto del ejemplo resuelto, Sweller y Cooper, 1985).
  La calculadora sirve para explorar ("¿y si el pH fuera 12?"), no para reemplazar el cálculo en la prueba.
- El recetario usa la **misma evidencia** que las hojas del árbol (`evidence.js`): no hay una segunda contabilidad.

## Criterios de aceptación

- Grimorio con 3 pestañas desde el Libro (objeto de la torre y fila de objetos en el celular).
- 8 tarjetas completas con fuentes; las calculadoras dan resultados correctos (probados en `classroom-test`).
- Recetario con los 4 estados según la evidencia.
- "No recuerdo la regla" lleva a la tarjeta correcta.
- Pruebas rápidas en verde; 1440 y 390 sin errores; ANTES/AHORA.

## Pendiente

- Más tarjetas cuando lleguen Aromáticos.
- "El caldero pide preparaciones" desde el recetario (va con Entrenar, etapa 8).
- Hoja de la noche anterior con las fórmulas clave (etapa 7).
