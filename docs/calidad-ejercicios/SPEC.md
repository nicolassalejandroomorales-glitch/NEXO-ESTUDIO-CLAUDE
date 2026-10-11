# Calidad de los ejercicios generados

## Qué
Los ejercicios infinitos tenían muchos repetidos o genéricos. Por ejemplo, "tratamiento" de Fisio 1 tenía **2** ejercicios distintos, y había preguntas de 2 alternativas (adivinando se acierta el 50 %). Además, el motor podía volver a mostrar el **mismo contenido** con otra semilla y contarlo como evidencia nueva. Ahora:

1. **El motor no repite contenido** (`player.js`, `genFor`). Antes de mostrar un ejercicio compara su "huella" (enunciado + alternativas o respuesta, sin contar la edad del paciente) con todo lo ya respondido. Si ya salió, busca otro, incluso en otro generador del mismo concepto. Así, una pregunta memorizada no cuenta como evidencia.
2. **Regla de calidad automática** (`tools/exercise-quality.cjs`, dentro de `npm test`). Por cada generador y concepto, sobre 200 ejercicios armados:
   - al menos **60 distintos**;
   - al menos **3 moldes de enunciado** (no solo cambiar números);
   - al menos **3 alternativas**;
   - nada de "ninguna/todas las anteriores".
3. **Generadores reescritos** con formatos que se usan en las PEP:
   - **Caso clínico armado con signos al azar**, que **siempre** trae al menos un signo distintivo, para que el caso no sea ambiguo. Las alternativas son cuadros que de verdad se confunden.
   - **"Tratamiento + porqué"**: un distractor tiene el fármaco correcto con una razón falsa, para que no se pueda acertar solo de memoria.
   - **Afirmaciones**: "¿cuál es correcta?", "¿cuál es INCORRECTA?" y "¿cuántas son verdaderas?" (formato V/F). Salen de bancos de hechos y errores típicos, y cada error trae su explicación.
   - **Cálculos con más de un molde**: directo, al revés (despejar), con dilución, con dato anómalo y por retroceso.
   - **Química sin ambigüedad**: el indicador solo se pregunta si el pH de equivalencia cae claramente dentro de un intervalo. Se sacaron comparaciones dudosas (como el carbocatión bencílico frente al terciario). En basicidad, solo se comparan compuestos con diferencias de pKa de al menos 0,5.

## Resultado (5 niveles × 40 semillas por generador y concepto)
| | Antes | Ahora |
|---|---|---|
| Ejercicios realmente distintos | 8.473 | 13.450 |
| Generadores bajo el mínimo | 52 | 0 |
| Preguntas de 2 alternativas | 520 | 0 |

## Pendiente
- Revisión humana de la química y la fisiopatología de los bancos nuevos (Niquito).
- Cuando lleguen las PPT de cada ramo, agregar a los bancos los ejemplos propios de cátedra.
