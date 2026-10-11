# Cómo crear una clase nueva en Nexo

Guía corta para replicar la clase de Aminas en cualquier tema, prueba o ramo. Ejemplo completo: `dist/classes/org-01.js`.

## La idea en una frase

**Una clase es un archivo de datos.** El aula (la torre del alquimista) es una sola y sabe mostrar cualquier clase. Rehacer un tema es escribir contenido, no programar.

```
Grimorio (mapa de la PEP) ──toca el tema──▶ catalog.js ¿tiene aula? ──sí──▶ Torre del alquimista
                                                      └──no──▶ "Disponible próximamente"

Torre = player.js (reproductor) + classroom.css (estilos) + tower-art.js (pinturas y objetos)
Clase = dist/classes/<tema>.js (contenido)
      + dist/classes/<tema>-gen.js (ejercicios infinitos, laboratorio y bestiario; opcional)
      + slides/<tema>.js (imágenes del PPT, opcional)
```

## Cómo está hecha una clase

```
Clase (por ejemplo Aminas, PEP 1)
├─ subject      el ramo del calendario (organica, fisico, analitica, fisio): la torre cuenta los días a su próxima evaluación
├─ fuentes, glosario, datos curiosos, texto de diapositivas, errores típicos
└─ misiones (8 en Aminas). Cada misión:
   ├─ diagnostic   2–3 preguntas sin pistas → si aciertas todo, puedes saltar la lección
   ├─ fundamentals bases "desde cero" (prerrequisitos), con "Explícame más simple"
   ├─ hook         (opcional) caso real del inicio: { title, text, sage, scene }
   ├─ explain      la materia, bloque por bloque, cada uno con su diapositiva
   ├─ parts        (opcional) recetas: cada una con intro, pretest ("adivina antes", no cuenta),
   │               explain (un bloque con frames = mecanismo con controles), practice (3+ tipos) y recipe guardada
   ├─ worked       ejemplo resuelto; algunos pasos hay que pensarlos antes de verlos
   ├─ practice     actividades variadas, con pista de la mascota
   ├─ challenge    (opcional) desafío extra en Expedición si vas sin ayuda
   └─ transfer     problema nuevo, estilo prueba, sin ayuda
```

El **rescate** y el **cierre** no se escriben: el aula los arma solos con tus errores.

Cada bloque de lección (`fundamentals`, `explain` y los de las partes) lleva `concept`: así "No recuerdo la regla", la mini clase
y el árbol saben de qué hoja es. La prueba lo exige.

Además, a nivel de clase (etapa 4, `docs/etapa-4-diagnostico/SPEC.md`):

- `diagnosis: { start, max, items: [{ level: 1|2|3, item }] }`: preguntas **propias** del diagnóstico "¿Por dónde empiezo?" (nivel 1 = bases,
  2 = lo básico del tema, 3 = lo difícil). Cada una con su `concept`.
- `base: [misiones]`: el "Repaso desde cero". Cada misión base declara `concept` (una raíz del árbol, `root: true`), explicaciones con `deeper`,
  ejercicios de fácil a difícil y una pregunta escrita.
- `formulas: [{ id, title, formula, vars: [[símbolo, qué es, unidad]], what, when, example, deeper, sources: [{ label, url | slide }], concepts, calc? }]`:
  el formulario del grimorio (etapa 5). `calc = { inputs: [{ id, label, value, step }], run: valores => texto }` es la calculadora opcional.
- `recipes: [{ id, mission, concept, slide, title, base, reagents, condition, result, note }]`: el recetario; se completa con la evidencia del concepto.
- En cada error típico (`misconceptions`): `base` (de qué raíz viene, para el desvío) y opcionalmente `check` (un caso corto que aparece justo después).

### La meta de la clase: el camino al 7

Cada clase declara qué puntos de la prueba prepara (`goal`, sacado de la pauta). Un 7 es tener todos los puntos;
un punto cuenta como **demostrado** cuando aciertas sin ayuda el caso estilo prueba (transferencia) de las misiones que lo preparan.

```js
goal: {
  total: 15, text: 'Asegurar los 6 puntos de Aminas de la PEP 1',
  questions: [{ id: 'P3', label: 'Ordenar por basicidad', points: 1, missions: ['m4', 'm5'] }, …],
  rest: [{ label: 'Aromáticos (P1, P2 y P5)', points: 9, note: 'clase en preparación' }]   // lo que dan otras clases
}
```

Se ve en el encabezado (★ Camino al 7), en el mapa de misiones (puntos por misión o **base**) y en el cierre.

### Siempre hay una forma más simple

- Cada bloque de `fundamentals` y `explain` trae `deeper`: la versión paso a paso del botón **Explícame más simple**.
- Cada término del glosario trae tres capas:
  ```js
  { term: 'Par libre', mission: 'm1', def: 'definición exacta, como en la prueba',
    simple: 'lo mismo en palabras simples', simpler: 'una analogía de la vida diaria' }
  ```
  El libro muestra primero los términos de la misión en curso.

## Tipos de actividad

| Tipo | Qué hace el estudiante | Cuándo usarlo |
|---|---|---|
| `choice` | Elige una alternativa | Conceptos; cada distractor apunta a un error típico |
| `order` | Ordena tarjetas | "Ordene de menor a mayor basicidad", pasos de una síntesis |
| `classify` | Pone tarjetas en calderos | "Aromático, antiaromático o no aromático" |
| `match` | Une pares | Reactivo → producto, estructura → nombre |
| `pick` | Toca una parte de la molécula | "¿Cuál N es más básico?", "¿qué grupo manda?" |
| `build` | Dibuja la molécula tocando, partiendo de una base (`start`); se compara con `target` | "Dibuja el producto". Agrega `smiles` para que RDKit lo revise |
| `arrows` | Traza flechas de mecanismo sobre una escena (`scene`, `lonePairs`, `answer`, `notes` por flecha equivocada) | "Dibuja las flechas del primer paso" |
| `poe` | Predice, mueve una simulación (`sim`: min, max, threshold, below/above) y compara | "¿Qué pasa si calientas el diazonio?" |
| `recipe` | Echa ingredientes al caldero en orden (`ingredients`, `answer`, `notes` por ingrediente equivocado) | Secuencias de síntesis |
| `spot` | Encuentra el paso malo del aprendiz (`steps`, `wrong`) y elige la corrección (`fix`) | Errores típicos de síntesis |
| `choice` + `figures` | Elige mirando 2 dibujos lado a lado (casos gemelos) | Cuando cambia una sola cosa |
| `write` | Escribe la respuesta, la compara con la modelo y marca qué ideas tenía | "Explícalo con tus palabras". Es la única que vale **escalón 5**: sin ella, las hojas no pasan de brote |

### Conceptos, escalones y confianza (motor de evidencia)

- `concepts`: las hojas del árbol. Cada actividad declara su `concept`. La prueba exige que exista.
- Escalón por tipo: elegir = 2 (reconocer), ordenar/clasificar/unir/tocar = 3 (completar), escribir = 5 (producir solo). Una actividad puede fijar `step`.
- Antes de cada pregunta aparece la **barra de confianza**; con 60 % o menos pide el porqué (opcional).
- El motor (`dist/classes/evidence.js`) calcula la hoja de cada concepto y agenda el repaso con FSRS. Sus reglas se prueban en `tools/class-evidence-test.cjs`.

## Paso a paso

1. **Crear el esqueleto** (ya trae un ejemplo de cada actividad, una misión base y ejercicios infinitos):
   ```
   node tools/new-class.cjs org-04 "Aromáticos" "PEP 1"
   ```
   Crea `dist/classes/org-04.js` y `dist/classes/org-04-gen.js`. El ramo (`subject`) lo saca solo de `dist/data.js`.
   Opciones: `--sin-generadores` (sin el archivo `-gen.js`), `--ramo fisico` (si el tema no está en `data.js`), `--catalogo` (publicar).
2. **Juntar el material:** diapositivas de cátedra (Drive › 2S QYF 2026), la pauta de la prueba anterior y tus apuntes.
3. **Escribir el contenido:** reemplaza cada `REEMPLAZAR`. Una misión por grupo de diapositivas. Los ejercicios de transferencia deben copiar el formato de la prueba real.
4. **Diapositivas reales**: Claude baja el PDF de cátedra desde tu Drive (conector de Google Drive) a `art-source/pdfs/` (no se sube a Git) y lo convierte:
   ```
   python3 tools/classroom-art/slides.py RUTA/AL/ARCHIVO.pdf org-04
   ```
5. **Revisar:** `npm test` (o solo `node tools/classroom-test.cjs`) comprueba que cada actividad tenga una sola respuesta correcta, que cada error tenga su explicación y su repaso, que todo tenga su versión más simple, que la meta sume el total de la prueba, que los caminos funcionen y, si hay `-gen.js`, arma 200 ejercicios por generador
   y concepto (40 por nivel) para revisar que cada uno tenga una sola correcta, su porqué, pista, explicación y diapositiva.
   Las revisiones con números propios de Aminas (pKa, misión 7, recetas de la etapa 5) solo corren en Aminas.
6. **Publicar en el grimorio:**
   ```
   node tools/new-class.cjs org-04 "Aromáticos" "PEP 1" --catalogo   (o agrega la línea a mano en catalog.js)
   node tools/build-startup.cjs
   ```
   Y sube la versión `?v=` en `dist/index.html`.

## Reglas de calidad (lo que hace buena una clase)

- **Desde cero:** cada misión parte con los prerrequisitos que necesita, en lenguaje simple.
- **Cada error con nombre:** los distractores apuntan a errores típicos reales, con su porqué y qué repasar.
- **Variedad:** al menos 3 tipos de actividad por misión. Nada de solo alternativas.
- **Fuente siempre:** cada bloque y cada actividad dice de qué diapositiva sale.
- **Estilo prueba:** la transferencia copia el formato de la pauta (las preguntas y su puntaje).
- **Honestidad:** terminar no es dominar. El cierre lo dice.
- **Química revisada:** valores (pKa, puntos de ebullición) de tablas estándar; si algo no está en las diapositivas, se dice de dónde sale.

## Qué modelo usar

| Tarea | Modelo |
|---|---|
| Escribir el contenido químico de una clase | Opus 5.5 (o Fable 5.1) |
| Crear el esqueleto, convertir diapositivas, ajustes de estilo | Sonnet 5.5 |
| Buscar referencias o revisar que nada se rompió | Haiku 4.5 |

## Replicar a otro ramo (lo que se hereda y lo que hay que escribir)

**Se hereda solo (no hay que programar nada):** el aula y la torre, el sabio y el compañero, la barra de confianza, el motor de evidencia
(hojas, calibración, repaso FSRS), el diagnóstico adaptativo, los errores que guían y el desvío a la base, la mini clase y "Ver a profundidad",
el grimorio (glosario, formulario con calculadoras, recetario, reglas, laboratorio, bestiario y hoja de la noche anterior), el Camino al 7,
la ronda del alba, el simulacro, Entrenar con su escalera de 5 niveles, el recorrido de bienvenida y todos los tipos de actividad.

**Se escribe por ramo (contenido):** misiones con sus partes, conceptos, errores típicos, fórmulas, recetas o reglas, mini clases, diagnóstico y
la meta de la prueba. Las diapositivas se cargan con `tools/classroom-art/slides.py`.

**Ejercicios infinitos (`dist/classes/<id>-gen.js`, lo crea la plantilla):** `window.NexoClassGen['<id>'] = { LEVELS, source, generators, lab, creatures }`.
Sin este archivo la clase funciona igual, pero sin Entrenar, sin laboratorio y con una ronda del alba que sí se agota. Ejemplo completo: `org-01-gen.js` (15 generadores).

| Pieza | Qué es | Cómo se escribe |
|---|---|---|
| Generador | `{ id, title, mission, concepts, make(rng, nivel, concepto) }` que devuelve una pregunta `choice` u `order` | Usa `rng` para elegir (nunca `Math.random`): la misma semilla debe dar la misma pregunta |
| Desde una tabla | Ej. `comparar` en la plantilla: la respuesta se **calcula** de los datos (ordenar por pKa, elegir el mayor) | Para todo lo que tenga números: pKa, ebulliciones, constantes, masas |
| Desde un banco | Ej. `concepto` en la plantilla: varias preguntas escritas por nivel; el azar elige y baraja | Para ideas sin tabla. Mientras más entradas, más variedad |
| `lab` | Sustancias, reactivos y `react(sustancia, reactivo)` → `{ to, ok, why }` | Solo reacciones de la tabla `RX`, cada una con su porqué; lo demás explica por qué no pasa nada |
| `creatures` | `{ concepto: [nombre, color] }`: la criatura del bestiario para los errores de ese concepto | Diseños propios (nada de series conocidas) |

Reglas de los 5 niveles (1 Fácil · 2 Media · 3 Intermedia · 4 Avanzada · 5 Nivel PEP): en 1 y 2 se muestran los datos; en 3 y 4 hay que
razonar sin ellos; el 5 imita la pregunta real de la pauta. **Todo concepto de la clase debe tener al menos un generador** (la prueba lo exige).
Cada pregunta trae `concept`, `hint`, `explain`, `slide` y un porqué (`note`) en cada distractor; un distractor puede apuntar a un error típico.

**Ojo con ramos que no son de química:** el editor de moléculas y las flechas (`build`, `arrows`) son para química. Para Física o Cálculo
faltaría un tipo de actividad "respuesta numérica con unidades" (pendiente). Todo lo demás sirve igual.

Pasos: `node tools/new-class.cjs <id> "<Título>" "<Evaluación>"` → reemplazar cada REEMPLAZAR → `npm test`.
`tools/new-class-test.cjs` revisa en cada `npm test` que la plantilla siga funcionando con el aula actual: crea una clase de prueba,
la pone en el catálogo al lado de Aminas (en una carpeta temporal) y le pasa **la prueba completa del aula**. Si alguien cambia el aula
y la plantilla queda vieja, `npm test` falla.

## Lista antes de publicar una clase

- [ ] Ningún `REEMPLAZAR` en `<id>.js` ni en `<id>-gen.js` (Ctrl+F).
- [ ] Cada misión con caso real, diagnóstico, partes con "adivina antes", 3+ tipos de práctica y regla o receta guardada.
- [ ] Al menos una escrita por misión (sin ella las hojas no pasan de brote) y una misión base por raíz.
- [ ] `goal` suma el total de la prueba y copia la pauta; `subject` es el ramo correcto (cuenta regresiva).
- [ ] Generadores para todos los conceptos, con datos de tabla citados.
- [ ] `npm test` en verde, prueba en 1440 y 390, ANTES/AHORA y revisión humana (capa 3) de la química.
- [ ] `--catalogo`, `node tools/build-startup.cjs` y subir `?v=` en `dist/index.html`.
