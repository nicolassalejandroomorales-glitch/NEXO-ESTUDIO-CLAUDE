# Estructura de las clases de Nexo (SPEC)

Estado: **estructura aprobada por Niquito (4 oct 2026)**: 7 etapas, sistema de errores con prerrequisitos y actividades reutilizables. Quedan abiertas las preguntas del final.

**18 oct 2026: reemplazado para clases nuevas por `DISENO-V2.md`** (estaciones mixtas: clase, juego y reto PEP; piloto Aminas → Basicidad). Este SPEC queda como historia de v1.

## Qué

Una forma única de construir clases: **cada clase es un archivo de datos** y **un solo reproductor** la muestra.
No hay una pantalla distinta por clase. Así, rehacer Aminas y después Carbonilos es escribir contenido, no programar de nuevo.

Esto cumple los 3 objetivos del proyecto: aprender de verdad (se pide evidencia), prepararse para las evaluaciones (la clase sigue el material del semestre) y que sea entretenido (actividades variadas, mascota, poca fricción).

## Decisiones ya tomadas por Niquito (no se discuten)

- Inicio adaptativo según lo que ya sabes (3C).
- Ruta recomendada, pero con libertad para desviarse (1B).
- Actividades variadas; escribir solo cuando aporte evidencia: conectar, ordenar, clasificar, dibujar, resolver.
- Respuesta distinta según el tipo de error (6D).
- Fuente a un botón de distancia, con vista dividida opcional.
- Material del semestre actual manda; lo histórico va después.
- Primera clase de prueba: Orgánica II → PEP 1 → Aminas → Basicidad.
- **Aula inmersiva con mascota** (4 oct): toda la clase ocurre sobre un fondo inmersivo, como el refugio. Nada de páginas planas.
- **Varios caminos para la misma clase** (4 oct): quien quiere una clase larga e interactiva debe recibir desafíos crecientes; quien prefiere sesiones cortas usa misiones.
- **El sistema de errores es central** (4 oct): explicar por qué te equivocaste, qué prerrequisito te falta y qué hacer ahora.

## Caminos (misma clase, distinto ritmo)

El contenido es el mismo; cambia el orden, el ritmo y la exigencia. Se elige al entrar al aula y se puede cambiar.

| Camino | Para quién | Cómo se siente |
|---|---|---|
| **Misiones** | Tienes 10–15 min. | Una misión = una idea con sus 7 etapas en miniatura. Se guardan y se retoman. |
| **Expedición** | Quieres una clase larga e interactiva. | Recorre todas las misiones seguidas. La dificultad sube sola si aciertas sin ayuda (desafíos extra) y cierra con un **desafío final estilo PEP**. |
| **Prueba encima** | La evaluación es pronto. | Diagnóstico → directo a los problemas tipo PEP. Si fallas, el rescate te devuelve solo a la misión que necesitas. |

Los tres caminos escriben la misma evidencia en el motor; ninguno da dominio por "terminar".

## Las 7 etapas de una clase

| # | Etapa | Para qué sirve | Evidencia que deja |
|---|---|---|---|
| 1 | **Diagnóstico** | 3–4 preguntas rápidas. Decide qué bloques se saltan y cuáles se refuerzan. | Qué sabías antes (punto de partida). |
| 2 | **Explicar** | Bloques cortos con una imagen o actividad interactiva. Nada de muros de texto. | Ninguna (solo exposición). |
| 3 | **Ejemplo resuelto** | Un caso paso a paso. Después se te van quitando pasos y los completas tú. | Parcial, con ayuda. |
| 4 | **Práctica variada** | Actividades de distintos tipos, mezcladas. Sin pistas visibles por defecto. | Acertar sin ayuda (`independent`). |
| 5 | **Error y rescate** | Si fallas, la respuesta depende del tipo de error (ver abajo). | El error queda registrado y se reintenta. |
| 6 | **Transferencia** | Un problema en contexto nuevo, estilo prueba, sin ayuda. | `transferable`. |
| 7 | **Cierre** | Resumen de lo que demostraste y de lo que falta. Se agenda el repaso. | Repaso FSRS; `retained` solo si recuerdas ≥ 24 h después. |

La **fuente** (diapositiva, guía, minuto de clase) está disponible en todas las etapas con un botón, y se puede abrir al lado.

Regla central: **terminar la clase no equivale a dominarla**. El estado sale solo de la evidencia (`unseen → guided → independent → transferable → retained`), como ya define `ACADEMIC_MODEL.md`.

### Respuesta según el error (6D)

| Tipo de error | Qué hace Nexo |
|---|---|
| Error de concepto (un distractor etiquetado como misconception) | Rescate dirigido: explica ese error en concreto y da un caso corto para corregirlo. |
| Falta un prerrequisito (fallos en 2 familias con el mismo prerrequisito) | Sugiere volver al concepto anterior; no lo declara débil por un solo fallo. |
| Descuido (acertó antes y falló ahora, o respondió muy rápido) | Pista corta y reintento. |
| Respuesta abierta ambigua | Autorúbrica; no se inventa una corrección que no se puede verificar. |

## Tipos de actividad (componentes reutilizables)

Cada tipo sale de lo que **de verdad pregunta la PEP 1 2025** (pauta en `dist/assets/exams/13_org2_pep1_2025_aminas_aromaticos.jpg` y `07_…`):

| Actividad | Qué es, en simple | Pregunta real de la PEP 1 2025 |
|---|---|---|
| **Ordenar** | Arrastras tarjetas para dejarlas en orden (de menor a mayor). | P3: "Ordene de menor a mayor la basicidad de los siguientes compuestos" (1,0 pt). |
| **Clasificar** | Arrastras cada molécula a su caja. | P5: "Clasifique como aromáticos, antiaromáticos o no aromáticos (regla de Hückel)" (3,0 pts). |
| **Dibujar producto** | Dibujas la estructura que se forma. | P1 y P6: "Prediga el/los productos mayoritarios" (Hofmann, Gabriel, SEA). |
| **Ruta de síntesis** (nueva) | Encadenas reactivos paso a paso, de la molécula de partida al producto. | P2 y P4: "Diseñe una síntesis a partir de benceno" (4,0 pts) y "Proponga aminas y reactivos" (3,0 pts). |
| **Elegir** | Alternativas; cada distractor apunta a un error típico. | Útil para diagnóstico y repaso rápido. |


Reutilizan los `responseTypes` que ya existen en `dist/academic/model.js`, así no se duplica el motor.

| Actividad | Cómo se corrige | Estado hoy |
|---|---|---|
| Elegir (con distractores etiquetados) | Automática; cada distractor apunta a un error. | Existe el validador. |
| Ordenar | Automática por orden esperado. | Tipo declarado; falta componente. |
| Conectar (pares) | Automática. | Tipo declarado; falta componente. |
| Clasificar en cajas | Automática. | Falta tipo y componente. |
| Ruta de síntesis | Por pasos: cada reactivo se compara con los aceptados para esa transformación. | Nueva; falta tipo y componente. |
| Numérica | Automática con tolerancia. | Existe el validador. |
| Dibujar estructura | Por dimensiones (conectividad, carga, enlace, regio). | Existe `classifiers.js`; falta integrar el editor. |
| Justificar con texto | Autorúbrica; nunca "corrección" falsa. | Existe en `structured.js`. |

## Dibujar estructuras de forma sencilla

Pedido de Niquito: dibujar moléculas fácil y entendible. Tres niveles, de más guiado a más libre:

1. **Completar sobre un esqueleto**: aparece el anillo o la cadena y tocas una posición para ponerle un grupo (–NH₂, –NO₂, –CH₃, carga +, par libre). Cubre la mayoría de las preguntas de la PEP y se corrige exacto.
2. **Lápiz de esqueleto**: arrastras para dibujar en zigzag (línea-ángulo), tocas un vértice para cambiarlo a N u O, tocas un enlace para hacerlo doble.
3. **Editor completo** (Ketcher, ya está en `dist/vendor/ketcher`): solo para productos libres o síntesis largas.

La corrección compara dimensiones (conectividad, carga, enlace, posición) con `classifiers.js`, no la imagen.

## Aula inmersiva

- Fondo pintado de aula (como el refugio), con la mascota presente. La mascota reacciona: celebra un acierto sin ayuda, se preocupa ante un error y "te acompaña" al rescate.
- La interfaz flota sobre el fondo (pergaminos, pizarras), no en tarjetas planas.
- Reglas del Inicio también aplican: respetar `prefers-reduced-motion`, `data-nexo-quality="low"` y contraste ≥ 4,5:1.

## Material encontrado (Drive "Material Nexo (2026)")

| Fuente | Dónde | Qué aporta |
|---|---|---|
| Diapositivas de cátedra "Aminas" (Dr. Javier Echeverría, 50 diap.) | `2S QYF 2026 › ORGANICA 2 › TEORIA › PPTS CLASES` | Temario oficial; fuente principal (autoridad `course_official`). |
| Las mismas diapositivas con apuntes a mano | `PPTs con apuntes › PEP 1(1).pdf` | Pistas del profesor: "en la prueba me hacen determinar cuál N es más básico", "analizar los orbitales y la reactividad en cada ejercicio". |
| Apunte propio de Obsidian | `QyF Obsidian › 1.1 Compuestos nitrogenados - Aminas.md` | Resumen ordenado. **Ojo:** dice "piridina pKa ≈ 8,75"; ese valor es su **pKb**. El pKa del ion piridinio es ≈ 5,2 (consistente con la diapositiva: piridina ≈ 10⁵ veces más básica que el pirrol, pKa ≈ 0,4). |
| PEP 1 2025 con pauta | `dist/assets/exams/13_…jpg`, `07_…jpg` | Qué se evalúa y con qué puntaje. |
| Grabaciones de clase | `TEORIA › GRABACIONES` (2 archivos `.m4a`) | Solo audio, sin transcripción. Pendiente transcribir. |

### Misiones propuestas para Aminas (siguen el orden de las diapositivas)

| # | Misión | Diapositivas | Peso en la PEP 1 2025 |
|---|---|---|---|
| 1 | El par libre: base y nucleófilo, clasificación 1°/2°/3°, geometría | 2–5, 11 | Base de todo |
| 2 | Nombrar aminas | 6–10 | Ejercicios 1–3 de la clase |
| 3 | Propiedades y sales (solubilidad, ebullición, fármacos) | 12–16 | Bajo |
| 4 | Basicidad I: pKa del ácido conjugado, equilibrio, Ka·Kb = Kw | 17–20 | Alto |
| 5 | Basicidad II: resonancia, sustituyentes, heterociclos, hibridación | 21–28 | **P3 (ordenar)** |
| 6 | Síntesis de aminas: alquilación, azida, Gabriel, aminación reductiva, reducción de nitro | 29–33 | **P4, P6** |
| 7 | Reacciones: acilación, Hofmann, diazonio (Sandmeyer, Schiemann) | 34–40 | **P4, P6** |
| 8 | Espectroscopía: IR, RMN, regla del nitrógeno | 44–47 | Bajo |
| ★ | Desafío final estilo PEP | — | Todo |

La PEP 1 también evalúa **aromáticos** (SEA, Hückel): esa sería la segunda clase, y sirve como prueba de que la estructura se reutiliza.

## Cómo se ve una clase por dentro (datos)

Un archivo por clase en `dist/classes/<id>.js` que se registra en `window.NexoClasses`. Forma propuesta:

```js
{
  id: 'org-01',                 // el mismo de hoy, para no perder el catálogo
  title: '…', evaluation: 'pep-1', sourceIds: ['…'],
  concepts: ['org.lone-pair', 'org.protonation', …],   // IDs del motor
  stages: [
    { type: 'diagnostic', items: [ /* ejercicios */ ] },
    { type: 'explain',    blocks: [ /* texto + visual */ ] },
    { type: 'worked',     steps: [ /* paso a paso con pasos que se esconden */ ] },
    { type: 'practice',   items: [ /* actividades variadas */ ] },
    { type: 'transfer',   items: [ /* contexto nuevo */ ] }
  ]
}
```

Cada actividad lleva: tipo, enunciado, respuesta esperada, distractores con su `misconceptionId`, concepto, habilidad, dificultad y fuente exacta (diapositiva o página). Los IDs de concepto y familia son los del motor; si cambia el significado de un concepto se crea un ID nuevo.

## Cómo se conecta con lo que ya existe

- Cada intento llama a `NexoAcademicEngine.recordAttempt(...)` con `activityType: 'lesson'`. Eso actualiza evidencia, estado y repaso. Cero lógica de dominio nueva.
- La ruta del grimorio ya abre `#/lesson/<id>`; el reproductor reemplaza la página "Disponible próximamente" **solo para las clases que ya tengan archivo**. Las demás siguen en "Próximamente".
- No se toca Supabase ni nada de nube (regla del proyecto).

## Por qué esta estructura (evidencia)

- **Recuperar, no releer**: practicar recordando mejora la retención más que releer (Roediger y Karpicke, 2006, *Psychological Science*). Por eso las etapas 4–6 mandan sobre la 2.
- **Repaso espaciado**: repartir los repasos en el tiempo supera a repetir todo junto (Cepeda y cols., 2006, *Psychological Bulletin*). Por eso el cierre agenda el repaso.
- **Ejemplos resueltos con retirada gradual**: ayudan a principiantes y se van quitando a medida que se domina (Renkl y Atkinson, 2003). Por eso la etapa 3.
- **Mezclar tipos de problema** (intercalado) mejora la discriminación entre ellos (Rohrer y Taylor, 2007). Por eso la práctica es variada.
- Resumen de efectividad de técnicas: Dunlosky y cols., 2013, *Psychological Science in the Public Interest*.

## Pasos de construcción (cada uno se prueba y se muestra ANTES/AHORA)

1. **Esqueleto**: registro de clases y reproductor con las 7 etapas y la navegación. Con una clase de prueba **sin química** (marcada claramente como demo).
2. **Actividades**, una por una: elegir → ordenar → conectar → clasificar → numérica → dibujar.
3. **Motor**: guardar evidencia, estados y repaso.
4. **Error y rescate** por tipo de error.
5. **Fuente** en botón y vista dividida.
6. **Contenido real de Aminas** (necesita tu material del semestre).
7. **Segunda clase** distinta (prueba de que la estructura sirve para más de una).

## Criterios de aceptación

- Una clase se agrega escribiendo **solo un archivo de datos**, sin tocar `app.js`.
- Una clase sin archivo sigue mostrando "Disponible próximamente".
- Terminar una clase no cambia el estado a `retained`; lo prueba una prueba automática.
- Reintentar el mismo ejercicio no duplica evidencia.
- Funciona en 1440 y 390 px y pasa `tools/contrast-audit.cjs` (0 problemas).
- Respeta `prefers-reduced-motion`.
- Pruebas rápidas en verde.

## Decidido

- Duración → **los dos**: caminos Misiones, Expedición y Prueba encima.
- Aspecto → **aula inmersiva con mascota**, todo sobre fondo inmersivo.
- Material → Drive "Material Nexo (2026)" (ver arriba).

- Dibujo → empezamos con **nivel 1: completar el esqueleto**.
- Fondo → **aula nueva pintada por script** (en `tools/`, reproducible, diseño propio).
- Mascota → **reacciona y da pistas cuando tú las pides**; usar pista queda registrado y ese intento no cuenta como "sin ayuda".
- Grabaciones → **sí, transcribir**. Bloqueado por ahora: la red del entorno en la nube rechaza `drive.usercontent.google.com` (bajar el audio) y `huggingface.co` (modelo de voz a texto). Se retoma cuando se permitan esos dominios.

## Avance

- **Paso 1 hecho (4 oct)**: reproductor del aula (`dist/classes/player.js`, `classroom.css`), catálogo (`classes/catalog.js`, va en el arranque) y borrador de la Misión 1 de Aminas (`classes/org-01.js`). Caminos, 7 etapas, rescate con repaso, pistas de la mascota y panel de fuente funcionando. Fondo provisional: la sala de Aprender. Prueba: `tools/classroom-test.cjs`.
- Se borraron los restos de la clase vieja (lámina del índice y funciones sin uso).

## Rediseño del aula (4 oct, tras revisión de Niquito)

Niquito revisó el paso 1 y no le gustó: faltaba un fondo inmersivo de verdad, la barra con todos los pasos arriba molesta y quiere que **la app lo guíe sola**. Decisiones:

- **Escena: torre del alquimista** donde aprendes de un **sabio**. Pintura base generada con la IA de imágenes de Canva (permiso dado; diseño propio), y encima, por código, animaciones de velas y frascos, la mascota en la mesa y los diálogos del sabio. Se eligen entre 3 opciones.
- **Sin barra de pasos.** Se muestra una sola cosa a la vez; el sabio habla en burbujas y avanza la clase. Solo queda un hilo discreto de progreso.
- **Las fases como escenas:** 1) el reto del sabio (diagnóstico), 2) la lección con la **diapositiva proyectada** en la pizarra o espejo, 3) el experimento en la mesa (ejemplo resuelto con predicción), 4) las pruebas del aprendiz (práctica: frascos que se enturbian si fallas), 5) el rescate (vuelve a la diapositiva que falta), 6) el encargo final (transferencia estilo PEP), 7) cierre con el sabio y la mascota.
- **Diapositivas reales visibles:** el PDF de cátedra convertido en imágenes, proyectado en la escena y ampliable. Requiere permitir en la red del entorno `drive.usercontent.google.com` (y `drive.google.com`) y compartir el PDF con enlace.
- Bajar la pintura de Canva en alta resolución requiere permitir `export-download.canva.com` en la red del entorno.

- **Torre guiada hecha (4 oct)**: el reproductor se rehízo como torre del alquimista. Sin barra de pasos: la clase es una secuencia de momentos (`beats()` en `player.js`) que el sabio narra en un cuadro de diálogo; una sola cosa a la vez en pergamino; diapositiva proyectada en una pizarra y ampliable (texto real de cátedra mientras faltan las imágenes); mascota en la mesa que da pistas al tocarla; escena con 4 pinturas (amanecer, mediodía, atardecer, noche) fundidas por hora. Fondo provisional: miniaturas de Canva desenfocadas hasta tener la versión HD.

- **Torre interactiva y explicaciones desde cero (4 oct)**: objetos tocables en la pintura como en el refugio (sabio → explica desde cero, libro → glosario, pizarra → diapositivas, ventana → cambia la hora, frascos → datos curiosos de las diapositivas; mascota → pista). En móvil también hay una fila compacta de objetos, porque la pintura no cabe entera. Cada misión parte con 5 bases "desde cero" con dibujos de Lewis, cada bloque tiene "Explícame más simple" y cada pregunta acertada muestra por qué cada alternativa es correcta o no.

- **Clase completa de Aminas para la PEP 1 (4 oct)**: 8 misiones (el par libre, nombrar, propiedades y sales, basicidad I y II, síntesis, reacciones, espectroscopía) con 63 actividades. Tipos nuevos: ordenar, clasificar en calderos, unir pares y tocar en la molécula. Pinturas HD entregadas por Niquito; el mediodía se crea por script (`tools/classroom-art/build_tower.py`), que también recorta el brillo de cada objeto tocable.

- **Diapositivas reales, sabio entero, glosario en capas y camino al 7 (4 oct)**, tras la segunda revisión de Niquito:
  - Los PDF de cátedra se bajan con el **conector de Google Drive** (la red bloquea la descarga directa, pero el conector guarda el archivo y se decodifica). Aminas: 50 diapositivas en `dist/assets/classes/org-01/slides/`. Aromáticos I y II quedan en `art-source/pdfs/` (no se suben a Git) para la próxima clase.
  - El sabio ya no queda tapado: el diálogo parte a la derecha del sabio en escritorio y, en el celular, la pintura se corre para mostrarlo.
  - Glosario en tres capas: en simple, definición de prueba y "más simple todavía" (analogía), con los términos de la misión en curso primero. Los 53 bloques de explicación tienen "Explícame más simple" (la prueba lo exige).
  - Avance con porcentaje arriba (de la misión, o de toda la clase en el mapa) y **meta de la clase**: los puntos de la PEP que prepara (Aminas: P3 1 pt, P4 3 pts, P6 2 pts = 6 de 15). Un punto cuenta al acertar sin ayuda la transferencia de las misiones que lo preparan.
  - Revisión química: la diapositiva 17 dice "1 de cada 1.000.000 queda neutra" (trietilamina + ácido acético). La constante del equilibrio es 10⁶; con cantidades iguales de ácido y amina, la fracción neutra real es cercana a 1 de cada 1.000. La clase usa la frase de la diapositiva y explica que K = 10⁶.

## Pendiente

- Clase de Aromáticos (9 de 15 puntos de la PEP 1), con sus PDF ya descargados.
- Habilitar los dominios para transcribir, o transcribir fuera de la nube.
- Moléculas dibujadas en las actividades de tocar la molécula.
- Conectar las respuestas con el motor de evidencia y el repaso espaciado (FSRS).
