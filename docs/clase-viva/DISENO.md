# Clase viva: diseño maestro (Aminas como modelo)

Diseño acordado con Niquito el 4 oct 2026, conversando, antes de programar. Este documento es la guía para construir:
se sigue por etapas (al final) y cada etapa se muestra ANTES/AHORA y espera aprobación.
Reemplaza el aula actual (torre pintada) de `docs/clases-estructura/`; lo que ya funciona (misiones, actividades,
rescate, glosario, diapositivas reales, camino al 7, prueba automática) se reutiliza.

## 1. Meta

- **Objetivo final de cada clase:** que puedas **resolver una PEP tú solo**. Primero Aminas (Control 1 y parte de la PEP 1).
- Nada de "hacer por hacer": cada momento tiene un porqué y deja evidencia.
- Sin falsa sensación de dominio: reconocer no es saber; lo único que cuenta como dominado es producir sin ayuda y recordarlo días después.
- Entretenido y vivo: si estudiar aburre, que se sienta como jugar, sin perder la evidencia.
- Todo gratis, sin plugins que no aporten, y con diseños propios (nada copiado de otros artistas o series).

## 2. Principios con evidencia

| Principio | Qué hace Nexo | Base |
|---|---|---|
| Ejemplos resueltos que se desvanecen | El sabio resuelve todo, después deja 1 paso, 2 pasos, nada | Sweller; Renkl (fading) |
| Recordar sin opciones | El escalón 5 es producir solo (dibujar, escribir) | Roediger y Karpicke (testing effect) |
| Pre-test | Pregunta antes de enseñar; equivocarse ahí no cuenta | Richland, Kornell y Kao |
| Casos contrastados | "Casos gemelos": dos moléculas que difieren en una cosa | Schwartz y Bransford |
| Ejemplos con errores | "El aprendiz se equivocó" | McLaren y otros (erroneous examples) |
| Autoexplicación | "Enséñale al personaje" | Chi |
| Práctica espaciada y mezclada | Ronda del alba (1, 3 y 7 días), temas revueltos | Cepeda; Rohrer |
| Hipercorrección | Barra de confianza: los errores con mucha seguridad se explican con más detalle | Butterfield y Metcalfe |
| Segmentación | Lecturas en trozos (opcional), una cosa a la vez | Mayer |

## 3. El mundo

- **Torre nueva por capas, hecha desde cero por código** (se deja de usar la pintura del mago; las pinturas quedan guardadas en `art-source/`).
  Vigas de madera, arcos, repisas y enredaderas en los bordes; nada de un cuadro gigante al centro.
- **Vida:** enredaderas y hojas que se mecen con viento, hojas que caen, destellos verdes chiquititos, faroles que titilan.
  Respeta `prefers-reduced-motion`, `data-nexo-ambient-motion`, `data-nexo-quality="low"`.
- **El centro es el árbol vivo** (el mapa de lo que sabes). La clase vive en piezas flotantes: pergamino colgado, pizarra chica, grimorio abierto.
- **Celular con composición vertical propia** (enredaderas arriba, árbol al medio, plantas abajo), no una pintura horizontal recortada.
- **La torre crece contigo:** más velas y plantas a medida que dominas misiones.
- **El grimorio es la voz del saber:** runas que brillan al hablar, texto que se escribe como tinta. Llama "aprendiz".
- **El personaje se disfraza de sabio** (barba y gorro) cuando explica mecanismos.
  Pendiente aparte: rediseñar los personajes en estilo más cartoon (proyecto propio; toca avatar, tienda y skins).

### Árbol vivo (mapa de lo que sabes)

Raíces = bases (Lewis, cargas formales) · tronco = ácido-base · ramas = misiones · hojas = conceptos.

| Hoja | Significa | Cómo se llega |
|---|---|---|
| Brote | No visto o solo guiado | Escalones 1 a 3 |
| Verde claro | Con ayuda | Escalón 4 |
| Verde | Independiente | Escalón 5 sin pistas |
| Verde intenso | Transferible | Pregunta estilo PEP sin ayuda |
| **Flor** | **Retenido** | Acierto sin ayuda 24 h o más después |
| Amarilla | Acierto frágil | Acertó con confianza baja |
| Seca | Olvidándose | El repaso venció (FSRS) |

Se conecta con el motor académico existente (`dist/academic/*`: estados unseen → guided → independent → transferable → retained y FSRS).

## 4. La clase

### Diagnóstico siempre primero

6 a 8 preguntas que se adaptan (si aciertas suben, si fallas bajan). Pintan el árbol y la clase parte desde el primer rojo.
Si faltan bases, **sugiere** (no obliga) la clase base. Lo que saltaste vuelve como repaso. El diagnóstico es una hipótesis que se corrige sola.

### Escalones (siempre de fácil a difícil)

1. **Ver:** ejemplo resuelto, mecanismo animado.
2. **Reconocer:** elegir.
3. **Completar:** falta un paso, una flecha o una parte del esqueleto.
4. **Producir con ayuda:** armar con piezas, con pista.
5. **Producir solo:** dibujar o escribir sin ayuda ni opciones.
6. **Mezclado y en el tiempo:** temas revueltos, días después.

### Momentos (piezas con las que se arma cada misión)

Caso de farmacia · pregunta antes de enseñar · lectura (corta, profunda o rápida; ninguna obligatoria) · diapositiva real ·
mecanismo con controles (play, pausa, retroceder; los electrones viajan por las flechas) · ejemplos que se borran ·
casos gemelos · predice, observa, explica (mini simulación) · el caldero (recetas) · el aprendiz se equivocó ·
editor (armar el producto) · enséñale al personaje (voz o texto) · encargo estilo PEP (pantalla o papel) · frase final.

### Misión modelo: Reacciones de aminas (≈ 35 min, 3 recetas; con "tengo 10 min" se hace una receta por sesión)

| Tiempo | Momento | Escalón |
|---|---|---|
| 0:00 | La torre te recibe; rama "Reacciones" con 3 brotes | — |
| 0:30 | Caso de farmacia: el paracetamol se fabrica acetilando p-aminofenol | — |
| 1:30 | Diagnóstico de la misión (3 preguntas, con confianza); si dominas una receta, saltas a su escalón 5 | — |
| **Receta 1: Acilación** | | |
| 4:00 | Pregunta antes: ¿dónde ataca el N? (tocar el átomo) | pre-test |
| 5:00 | Lectura + diapositiva | 1 |
| 6:30 | Mecanismo con controles (adición–eliminación) | 1 |
| 8:00 | Ejemplos que se borran: trazar la última flecha, luego dos | 2–3 |
| 10:00 | Casos gemelos: dietilamina vs trietilamina con cloruro de acetilo (la 3° no tiene H) | 2 |
| 11:00 | Editor: propilamina + cloruro de benzoílo → amida (piezas) | 4 |
| 13:00 | Receta guardada en el recetario; brota la hoja | — |
| **Receta 2: Diazonio** | | |
| 14:00 | Pregunta antes: ¿y si el N quisiera escapar como gas? | pre-test |
| 15:00 | Lectura + diapositivas 38–40 | 1 |
| 16:30 | Predice, observa, explica: termómetro; sobre 5 °C burbujea N₂ y se forma fenol | 2 |
| 18:30 | El caldero: "clorobenceno desde anilina" (NaNO₂/HCl frío → CuCl); pociones fallidas que explican; variantes CuBr, CuCN, HBF₄, KI, H₂O | 2–4 |
| 21:30 | El aprendiz se equivocó: puso HBF₄ para obtener Cl | 3 |
| 23:00 | Receta guardada con sus 6 variantes | — |
| **Receta 3: Hofmann** | | |
| 24:00 | Chequeo de E2; si falla o la confianza es baja, ofrece la clase base de E2 (5 min) | — |
| 25:00 | Mecanismo: CH₃I ×3, Ag₂O, calor; la base saca el H más accesible | 1 |
| 27:00 | Casos gemelos: –N(CH₃)₃⁺ da el alqueno menos sustituido (Hofmann); –Br con etóxido da el más sustituido (Zaitsev) | 2 |
| 28:30 | Editor: producto principal desde 2-butanamina (1-buteno) | 4–5 |
| **Cierre** | | |
| 31:00 | Enséñale al personaje: ¿por qué la amina 3° no forma amida? (ideas clave: H en el N, sustitución) | autoexplicación |
| 32:30 | Encargo estilo PEP 2025 (P4 y P6), sin ayuda; en pantalla o en papel con autocorrección | 5 / transferencia |
| 35:30 | Frase final; el árbol crece; "mañana al alba volveré a preguntarte" | — |
| Días 1, 3 y 7 | Ronda del alba: 3 preguntas mezcladas; si aciertas tras 24 h, la hoja florece | 6 |

Errores de esta misión y su ruta: "cualquier amina se acila" → contar los H del N (misión 1) ·
"HNO₃/H₂SO₄ forma diazonio" → diferencia nitración / diazotación · falla Hofmann → E2 y buen grupo saliente (clase base).

## 5. El motor

### Barra de confianza (en Clases y Entrenar; nunca en los juegos)

Barra tipo volumen de 0 a 100 % antes de responder. Si es 60 % o menos, pregunta por qué con opciones rápidas
(*no recuerdo la regla · dudo entre dos · no entendí la pregunta · estoy adivinando*) y una línea opcional.

| | Acierta | Falla |
|---|---|---|
| Muy seguro | Sólido | **Alerta:** explicación a fondo (error que no sabías que tenías) |
| Poco seguro | **Acierto frágil:** cuenta menos y vuelve antes | Normal |

La razón alimenta los errores: "no recuerdo la regla" → formulario o base; "dudo entre dos" → ejercicio de comparar esos dos;
"no entendí la pregunta" → se reformula. Con el tiempo muestra tu **calibración** ("cuando dices 90 %, aciertas 60 %").

### Errores que guían

- **Descuido:** pista corta y reintento.
- **Error de concepto:** tu respuesta al lado de la correcta, por qué, y un caso corto para corregirlo.
- **Falta una base** (2 fallos con el mismo origen): qué repasar, 2–3 ejercicios fáciles del prerrequisito y **vuelta** al problema original.
- El sabio recuerda: "la última vez confundiste pirrol con piridina…".

### Árbol de prerrequisitos (de abajo hacia arriba)

Lewis → cargas formales → electronegatividad y resonancia → ácido-base y pKa → par libre, nucleófilo y electrófilo → flechas →
SN1/SN2/E1/E2 y solvente → reacciones de aminas.

### Clase base "Repaso desde cero" (opcional)

Mismas misiones y escalones; la sugiere el diagnóstico o un error de base. Incluye solventes (cuándo desprotonan) y la ruta de decisión SN1/SN2/E1/E2.
Material: Drive de Niquito (material de años pasados), solo cuando él lo pida.

### Tiempo

- **"Tengo X minutos":** arma bloques. Con 2 h: ronda del alba 10 · lo nuevo 40 · pausa 10 · práctica mezclada 35 · mini simulacro 20 · cierre 5.
- **Prioridad:** puntos de la PEP × lo que no dominas × repasos vencidos.
- Retomar exactamente donde quedaste. Cada actividad muestra "qué mide".

## 6. El grimorio

- **Formulario:** tarjeta por fórmula: fórmula · qué es cada letra y su unidad · para qué sirve · cuándo se usa · ejemplo simple ·
  a profundidad · fuentes. Se investiga al construir cada tarjeta (Drive y luego internet), con este orden de fuentes:
  diapositivas de cátedra → libros del programa (McMurry, Carey) → IUPAC Gold Book, LibreTexts. Si difieren, dice cuál usa la cátedra.
  Abierto durante los ejercicios; cerrado en Prueba encima y simulacro.
- **Recetario de pociones:** cada reacción dominada es una receta (ingrediente base, ingredientes mágicos, condición, resultado);
  empieza incompleta y se completa con evidencia. El caldero pide preparaciones; las pociones fallidas explican el error.
- **Bestiario de errores:** cada error típico es una criatura de diseño propio; se captura al corregirlo 3 veces en días distintos.
- **Glosario** (ya existe, tres capas) y **hoja de la noche anterior** (tus errores y fórmulas clave antes de la prueba).

## 7. La prueba

- **Simulacro PEP:** con tiempo, formato real y puntaje según la pauta; al terminar actualiza el árbol y el camino al 7.
- **Cómo te corrige el profe:** la pauta paso a paso, con qué da puntaje parcial.
- **Práctica en papel:** resuelves a mano y te autocorriges paso a paso (cuenta como evidencia); opcional, foto de tu hoja al lado de la solución (cámara del navegador, gratis). Sin corrección automática de la foto.

## 8. Entrenar (sección aparte)

Eliges tipo (reconocer, entender, producir), tema y dificultad, y haces todas las que quieras. Preguntas generadas desde tablas
(por ejemplo, ordenar por basicidad desde la tabla de pKa) con corrección automática. **Laboratorio libre:** eliges una amina y un reactivo
del estante y ves qué sale (o por qué no reacciona); solo combinaciones de la tabla de reacciones, cada una con su fuente.
Los juegos usan los mismos generadores; las recompensas premian retener, no hacer clic. Racha amable (no castiga).

**Hecho (etapa 8):** 15 generadores cubren los 22 conceptos en 5 niveles (Fácil → Nivel PEP) con escalera 2 arriba / 1 abajo.
Se usan en Entrenar, en la Ronda del alba (cuando se acaban las fijas), en el Simulacro (desde el 2° intento) y en "Practicar más".
El grimorio suma Laboratorio, Bestiario y Noche antes. Ver `docs/etapa-8-entrenar/SPEC.md`.

## 9. Herramientas propias (sin plugins)

| Herramienta | Qué hace | Límite honesto |
|---|---|---|
| Editor de estructuras | Tocar para poner átomos, arrastrar para enlazar, cargas y pares libres; avisa valencias imposibles; compara tu molécula con la respuesta aunque esté dibujada distinto | Sin estereoquímica (cuñas) ni resonancia compleja al principio |
| Flechas de mecanismo | Tocar origen y destino de los electrones; animación del viaje | Solo los mecanismos escritos en la clase |
| Revisor químico (RDKit, BSD, fuera de la app) | En las pruebas automáticas: valencias, fórmula, masa, conservación de átomos en cada reacción, moléculas iguales | No sabe si la reacción es "la de la cátedra": eso lo da la fuente |
| Voz → texto | Reconocimiento de voz del navegador | Bien en Chrome y Edge, regular en Safari, no en Firefox; en Chrome el audio pasa por Google |
| Revisión de explicaciones | Revisa si nombraste las ideas clave | Busca palabras, no entiende razonamientos. Una IA que evalúe de verdad normalmente cuesta: revisar antes de prometer |
| Voz del grimorio | Voz del navegador más grave y lenta, eco de torre, zumbido suave, texto en tinta sincronizado | La voz base depende del equipo; lo más épico es una voz grabada por una persona con los mismos efectos |

## 10. Revisión en 3 capas

1. **Automática:** RDKit y la prueba del aula.
2. **Fuente citada:** diapositiva, PEP o libro en cada respuesta.
3. **Persona:** Niquito, un compañero o el profe marca "revisada". Sin esta capa nada aparece como verificado.

## 11. Plan de construcción

Cada etapa: SPEC corto si hace falta, implementar, probar en 1440 y 390, pruebas automáticas, ANTES/AHORA y aprobación.

| Etapa | Qué | Estado | Modelo sugerido |
|---|---|---|---|
| 1 | Motor de evidencia: escalones, confianza, hojas del árbol; conectado con FSRS | **Hecha** | Opus 5.5 |
| 2 | Editor de estructuras, flechas de mecanismo y revisor RDKit en las pruebas | **Hecha** | Opus 5.5 |
| 3 | **Piloto:** misión Reacciones completa con todos sus momentos | **Hecha** (esperando tu prueba) | Opus 5.5 (química) + Sonnet 5.5 (pantalla) |
| 4 | Diagnóstico adaptativo, errores que guían y clase base mínima (Lewis, cargas, ácido-base, E2) | **Hecha** (esperando tu prueba) | Opus 5.5 |
| 5 | Formulario con investigación y recetario de pociones | **Hecha** (esperando tu prueba) | Opus 5.5 |
| 6 | Las otras misiones de Aminas al modelo nuevo | **Hecha** (esperando tu prueba) | Opus 5.5 |
| 7 | Ronda del alba, "tengo X minutos", simulacro PEP y práctica en papel | **Hecha** (esperando tu prueba) | Sonnet 5.5 |
| 8 | Entrenar con generadores de 5 niveles (en toda la app), laboratorio libre, bestiario, hoja de la noche anterior. La voz queda para después | **Hecha** (esperando tu prueba) · `docs/etapa-8-entrenar/SPEC.md` | Opus 5.5 (química) + Sonnet 5.5 (pantalla) |
| 9 | Replicar: actualizar `tools/new-class.cjs` y la guía para la próxima clase | **Hecha** · `docs/etapa-9-replicar/SPEC.md` | Sonnet 5.5 |
| 10 | **Arte al final:** la Torre del Sauce (pixel art, un sauce que crece dentro de la torre de cada ramo) | **Diseño aprobado** · `docs/etapa-10-arte/SPEC.md`; falta conectarlo a la app | Opus 5.5 |

Orden cambiado el 4 oct a pedido de Niquito: el arte se diseña al final, cuando todo lo funcional esté listo.
Mientras tanto, las etapas 2 a 9 usan el aula actual.

La etapa 3 es la prueba de fuego: si la misión Reacciones te sirve a ti para entender, el modelo se replica.

### Avance

- **Etapa 1 hecha (4 oct):** motor de evidencia `dist/classes/evidence.js` (escalones, confianza × resultado, hojas brote → flor,
  amarilla y seca, calibración, repaso FSRS con `academic/reviews.js`). Barra de confianza antes de cada pregunta, con porqué opcional y
  ruta según el porqué. Nueva actividad **escrita** con autocorrección por ideas (escalón 5): 3 preguntas (basicidad, equilibrio, acilación).
  22 conceptos de Aminas (4 raíces de base) y cada actividad con su concepto. Vista previa del árbol en el cierre y en "Camino al 7".
  Pruebas: `tools/class-evidence-test.cjs` y `tools/classroom-test.cjs`.
- **Etapa 2 hecha (4 oct):** `dist/classes/molecule.js` (grafo de la molécula, valencias, H implícitos, fórmula, "¿es la misma molécula?",
  explicación del error: piezas sueltas, átomos que faltan o sobran, cargas, átomos conectados distinto) y `dist/classes/editor.js`
  (dibujar tocando: átomos, enlaces simple/doble/triple, cargas, borrar, deshacer; flechas desde pares libres o enlaces, con los electrones viajando).
  Actividades nuevas `build` y `arrows` (escalón 4): 4 de ejemplo (protonación y acilación). RDKit (ya estaba en `dist/vendor/rdkit`) revisa en
  `tools/molecule-test.cjs` que el editor y RDKit coincidan y que cada molécula de las clases sea válida.
- **Etapa 3 hecha (4 oct):** la misión 7 (Reacciones) rehecha según el guion: caso de farmacia (paracetamol), diagnóstico, bases
  (flecha curva, C=O δ+, E2) y **3 recetas** (acilación, diazonio, Hofmann). Cada receta: "adivina antes" que no cuenta (efecto del pretest),
  lección, **mecanismo con controles** (atrás, reproducir, siguiente), práctica que se va soltando (flecha ya puesta → sin ayuda),
  **casos gemelos**, **predice-observa-explica** con termómetro, **caldero** (ingredientes en orden; la poción mal hecha explica el error),
  **el aprendiz que se equivocó** (encontrar y corregir el paso), dibujo del producto con aviso de "casi" (Zaitsev vs Hofmann) y la
  **receta guardada** en el grimorio. Cierre: enséñale a tu compañero (escrito, con ideas clave detectadas) y encargo estilo PEP con opción en papel.
  Tipos nuevos: `poe`, `recipe`, `spot` y `figures` en `choice`. Pruebas: `classroom-test` exige 3+ tipos por receta y cuadros con escena.
- **Etapa 4 hecha (5 oct):** ver `docs/etapa-4-diagnostico/SPEC.md`. Camino nuevo **"¿Por dónde empiezo?"**: 7 preguntas en escalera de 3 niveles
  (aciertas → sube, fallas → baja a las bases), resultado como hipótesis con misión recomendada y base sugerida. **Errores que guían**: caso corto
  justo después de 4 errores típicos; 2 errores con la misma base ofrecen un desvío (explicación + 2 ejercicios + vuelta al problema); el sabio
  recuerda tu error típico de otro día. **Repaso desde cero**: 4 misiones base (Lewis, cargas formales, ácido-base y pKa, SN2/E2 y solvente), cada una
  con pregunta escrita. También: pregunta escrita en la receta de diazonio, y dos errores antiguos arreglados (el rescate se metía antes de tu posición
  al fallar el encargo final; el aviso de flechas aparecía en actividades que no eran de dibujo). Prueba nueva: responder nunca cambia lo que ya pasaste.
- **Etapa 4b (5 oct, a pedido de Niquito: "un usuario nuevo se puede marear"):** ver `docs/etapa-4b-intuitivo/SPEC.md`. Recorrido de 30 s la
  primera vez (ilumina y nombra cada parte, también los objetos invisibles de la pintura), avisos de una sola vez (barra de confianza, pista del
  compañero), botón "?" con "Cómo funciona la torre", diagnóstico marcado "Recomendado para empezar" y objetos que brillan hasta que tocas uno.
- **Etapa 5 hecha (5 oct):** ver `docs/etapa-5-grimorio/SPEC.md`. El Libro es ahora **tu grimorio** con 3 pestañas. **Formulario**: 8 tarjetas
  (pKa, pKa + pKb = 14, Keq desde pKa, Henderson-Hasselbalch, carga formal, regla del nitrógeno, picos N–H en IR, Hückel) con letras y unidades,
  para qué, cuándo, ejemplo resuelto, "a fondo", fuentes (cátedra → McMurry en LibreTexts) y 7 calculadoras. **Recetario**: 10 reacciones que se
  completan con tu evidencia (???, vista, aprendida al acertar en su misión, dominada con sello). "No recuerdo la regla" abre la tarjeta del concepto.
  El formulario se cierra en Prueba encima.
- **Más ayuda (5 oct, a pedido de Niquito):** ver `docs/mas-ayuda/SPEC.md`. Después de "Explícame más simple" aparece la **mini clase** (26 conceptos)
  y en cada lección **Ver a profundidad** (10 temas, con desafío y fuentes). Fuentes IUPAC agregadas al formulario.
- **Etapa 6 en curso (5 oct):** **misión 6 (Síntesis) rehecha** al modelo de la misión 7: caso del p-aminofenol (paracetamol), 3 recetas
  (alquilar sin descontrol: azida y Gabriel · aminación reductiva · reducir amidas y nitroarenos), cada una con "adivina antes", mecanismo con
  flechas (azida y aminación reductiva), práctica variada (flechas, caldero, aprendiz, dibujo con aviso de "te quedaste en la imina", gemelos,
  clasificar) y receta guardada; cierre con pregunta escrita para el compañero y encargo estilo PEP en papel. **Misiones 4 y 5 (basicidad, pregunta 3 de la PEP) rehechas (6 oct):**
  m4 con caso de la lidocaína (clorhidrato), 2 partes (medir con el pKa · hacia dónde va el equilibrio), flechas de la protonación, simulación de pH
  y aprendiz que confunde el lado débil; m5 con caso de la nicotina, 3 partes (resonancia · anillos con N · el agua cambia el orden), mecanismo de
  resonancia de la anilina y gemelos con el par dibujado. Como no son reacciones, cada parte guarda una **regla del sabio** (lista de chequeo) en el
  recetario. **Misiones 1, 2, 3 y 8 (6 oct):** casos de la dopamina, la etiqueta del 4-aminofenol, el limón y el pescado, y el frasco
  sin etiqueta; cada una en 2–3 partes que reusan las lecciones de cátedra, con "adivina antes", ejemplo resuelto dentro de su parte,
  actividades nuevas (clasificar, tocar, dibujar la N-metilanilina, gemelos, caldero de extracción, aprendiz) y reglas del sabio.
  **Etapa 6 completa: las 8 misiones de Aminas siguen el modelo de la clase viva.** También: dibujo de moléculas estilo libro y plantilla
  `tools/new-class.cjs` al día (probada en cada `npm test`).
- **Etapa 7 hecha (6 oct):** ver `docs/etapa-7-prueba/SPEC.md`. Caminos nuevos **Tengo X minutos** (plan por bloques), **Ronda del alba**
  (repaso diario mezclado, con los conceptos vencidos primero) y **Simulacro PEP** (mini o completo, con reloj, sin pistas ni formulario,
  corrección con la pauta, puntaje parcial y nota estimada). Escritas **en papel** con foto opcional que no se guarda. Retomar donde quedaste y botón ☰ Caminos.
- **Etapa 9 hecha (5 oct):** ver `docs/etapa-9-replicar/SPEC.md`. La plantilla `tools/new-class.cjs` ahora crea también los ejercicios
  infinitos (`<id>-gen.js`: generador desde tabla, generador desde banco, laboratorio y bestiario), el ramo para la cuenta regresiva, una misión
  base y errores con desvío. La prueba del aula separa lo general de lo propio de Aminas, y `npm test` le pasa la prueba completa a una clase
  recién creada. Guía con lista antes de publicar.
- Nota honesta: el "Camino al 7" todavía cuenta las alternativas de transferencia como puntos; cuando cada misión tenga sus preguntas de producir
  (etapas 4 y 7) se exigirá escalón 5 también ahí.

### Arte: lo aprendido con los bocetos (para la etapa 10)

Boceto vivo: https://claude.ai/artifact/WPt53fynN5jZ4BbETXyudh (4 versiones). Lo que dijo Niquito:
- **Le gusta** que la escena cambie con la hora (amanecer, día, atardecer, noche) y que esté viva.
- **No le gusta:** el árbol como dibujo de líneas ni el de cuento; los objetos (ventanas, libros) se ven planos y básicos;
  la pintura con IA (Canva) se ve "muy IA".
- **Quiere:** más detalle y algo de realismo, sin que parezca IA. Árbol elegido: **sauce de luz** con farolitos (conceptos).
  Detalles elegidos: libros y velas que flotan, caldero con vapor, astrolabio y techo de estrellas, pluma que escribe sola.
- Caminos a explorar en la etapa 10: texturas y luz más ricas por código; objetos pintados uno por uno (no la escena entera) y animados por código;
  un estilo propio muy cuidado (por ejemplo pixel art detallado); referencias que traiga Niquito.

## 12. Pendiente y decisiones abiertas

- Rediseño de personajes en estilo cartoon (proyecto propio).
- Voz grabada por una persona para las frases fijas (opcional, después).
- Diapositivas de Orgánica I para la clase base (buscar en el Drive cuando Niquito lo pida).
- Si existe una forma gratis de que una IA evalúe explicaciones (revisar antes de prometer).
- Revisión química humana de cada misión.

## 13. Riesgos

- **Que crezca y no se termine:** construir primero el núcleo completo de una misión (etapa 4) antes de los extras.
- **Errores químicos:** las 3 capas de revisión; nada aparece como verificado sin la persona.
- **Rendimiento en celulares:** animaciones con perfil de calidad bajo y modo de menos movimiento.
