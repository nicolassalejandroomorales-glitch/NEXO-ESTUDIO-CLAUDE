# Etapa 4 · Diagnóstico adaptativo, errores que guían y clase base

Parte del plan de `docs/clase-viva/DISENO.md` (§4 "Diagnóstico siempre primero", §5 "Errores que guían" y "Clase base").

## Qué

1. **Diagnóstico "¿Por dónde empiezo?"**: un camino nuevo en la torre. 6 a 7 preguntas que se adaptan:
   si aciertas, la siguiente es de un nivel más alto; si fallas, baja hacia las bases. Al final muestra tu punto de partida
   (qué parece que sabes y qué no), **recomienda la misión por donde empezar** y, si falló una base, **sugiere** (no obliga) el repaso desde cero.
2. **Errores que guían**, dentro de las misiones:
   - **Error de concepto con caso corto**: si tu respuesta cae en un error típico que tiene un caso de control, justo después aparece
     una pregunta corta para corregirlo en el momento.
   - **Falta una base**: si fallas 2 veces cosas que dependen de la misma base (por ejemplo, cargas formales), el sabio ofrece un desvío:
     una explicación breve + 2 ejercicios fáciles de esa base, y **vuelta** al problema que fallaste. Puedes decir "ahora no".
   - **El sabio recuerda**: al empezar una misión, si otro día caíste en un error típico de esa misión, te lo recuerda.
3. **Clase base "Repaso desde cero"** (opcional): 4 misiones cortas con las raíces del árbol: Lewis y par libre, cargas formales,
   ácido-base y pKa, SN2/E2 y solvente. Cada una con explicación ("Explícame más simple"), ejercicios de fácil a difícil y una pregunta escrita.

## Decisiones

- El diagnóstico usa **preguntas propias** (`dx-*`), no las de las misiones: así no te "gasta" las preguntas que vas a ver después.
- La adaptación es una **escalera** de 3 niveles (bases → aminas básico → reacciones). Es simple y predecible; se puede probar sin navegador.
  Con 7 preguntas no se puede medir todo: el resultado se presenta como **hipótesis** ("parece que…") y se corrige solo con las misiones.
  Si aciertas un concepto, sus prerrequisitos se dan por probables (si sabes acilación, probablemente sabes qué es un par libre).
- Las respuestas del diagnóstico **sí** dejan evidencia (brote), con confianza, pero no cuentan para el Camino al 7.
- El desvío a la base se ofrece **una vez por base** y por sesión; nunca bloquea.
- La clase base no tiene diapositivas de cátedra (es Orgánica I): se marca como fuente "Repaso desde cero · Nexo".
  Su contenido es estándar de Orgánica I; las cifras (pKa 4,8 / 10,6 / 15,7) son valores de tabla habituales.

## Cómo

- `dist/classes/org-01.js`: `cls.diagnosis` (banco por nivel y concepto), `cls.base` (4 misiones), casos cortos (`check`) en algunos errores típicos,
  y `base` en los errores que vienen de una raíz. Más una pregunta escrita para la receta de diazonio (`m7-w2`).
- `dist/classes/player.js`: camino `diagnostico` (beats dinámicos según respuestas) y `base` (misión de la clase base);
  beats nuevos `diagresult` y `detour`; pregunta de etapa `fix` y `placement`; recuerdo de errores en la bienvenida de la misión.
- `dist/classes/evidence.js`: cada registro guarda el error típico (`misconception`) para poder recordarlo.
- Pruebas en `tools/classroom-test.cjs`: escalera (todo bien sube, todo mal baja a las bases y sugiere la base), desvío tras 2 fallos con la
  misma base, caso corto tras un error con `check`, misiones base válidas.

## Criterios de aceptación

- Diagnóstico de 6–7 preguntas que cambia según aciertas o fallas; resultado con misión recomendada y base sugerida si corresponde.
- En la misión, 2 errores con la misma base ofrecen el desvío; aceptarlo muestra base + 2 ejercicios + vuelta al problema.
- Las 4 misiones base funcionan solas desde el mapa de misiones ("Repaso desde cero").
- Pruebas rápidas en verde; recorrido en 1440 y 390 sin errores; ANTES/AHORA.

## Pendiente

- Diagnóstico más fino (más preguntas por concepto, teoría de respuesta al ítem) cuando haya datos reales.
- Más casos cortos (`check`) para el resto de los errores típicos.
- Material de Orgánica I de tu Drive para enriquecer la clase base (solo si lo pides).
