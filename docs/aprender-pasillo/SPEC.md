# Aprender: el Sótano de los Cristales

Pedido de Niquito (17 oct 2026): rehacer Aprender antes de terminar el Tutorial, porque su grimorio es "antiestético" (ver `docs/ux-app/FEEDBACK-15OCT.md`).
Estado: **dirección de arte aprobada** ("SIII AHORA SI", 17 oct) en animaciones de prueba. **Aún no está en la app.**

## Qué
Aprender es un **pasillo de piedra en primera persona** (cripta alquímica dentro de la torre) con **una puerta por ramo**.
Se avanza paso a paso (toque o flechas, como en Vampire Crawlers), se gira en los cruces, y al abrir la puerta de un ramo se entra por un **portal** a sus clases.

## Decisiones vigentes (Niquito, 17 oct)
- **Navegación**: primera persona por casillas; cada toque = un paso corto y fluido con balanceo; giro de 90° en los cruces. Inspiración en la *sensación* de Vampire Crawlers, sin copiar su arte.
- **Ambiente**: piedra oscura y húmeda, pasillo que se aleja al fondo con costillas de piedra, cristales que nacen de la roca y alumbran, antorchas, neblina baja. Nada de madera ni del look del refugio.
- **Estilo B "piedra mágica"**: oscuro y contrastado, poco ruido (dither), brillos sobrios (le molestó el exceso de brillo). Nada de runas genéricas ni guías en el piso.
- **4 puertas del semestre** (de `dist/data.js`): Orgánica II (verde, benceno), Química Analítica (celeste, dial), Fisicoquímica II (violeta, órbitas), Fisiopatología (naranja, cruz). Las de semestres futuros están en un pasillo lateral, cerradas con candado y cadenas, con "PRÓXIMO SEMESTRE".
- **Cada puerta**: hojas de piedra tallada con paneles, bandas de latón, bisagras y aldaba; emblema del ramo sobre el arco y en cada hoja; línea incrustada del color del ramo en el marco.
- **Letrero de piedra grabada** sobre el arco: letras grandes talladas que brillan con el color del ramo.
- **Murales animados del ramo** a ambos lados de cada puerta:
  Orgánica II = resonancia del benceno con flechas curvas ↔ anilina con su par libre / SN2 con estado de transición e inversión.
  Química Analítica = curva de titulación con salto de pH / bureta que gotea y el indicador vira a rosado.
  Fisicoquímica II = diagrama de energía con Ea / partículas A→B hasta el equilibrio.
  Fisiopatología = neurona con conducción saltatoria / ECG con corazón que late.
- **Objetos del ramo** en los tramos libres entre puertas (balanza y bureta, modelo orbital, corazón en frasco, mortero, alambique, caldero), sin tapar los murales.
- **Portal** (tipo "otra dimensión", no un relleno plano): remolino en espiral con núcleo brillante, anillo de energía y estrellas; chispas del color del ramo al abrir; al entrar, zoom dentro del remolino.
- Estados de puerta: entreabierta con portal visible (del semestre), más abierta y con más brillo si hay repasos, cerrada con candado (futura). Repasos y Rescate no tienen puerta propia.

## Cómo (técnico)
- `tools/aprender-pasillo/build_sotano.py`: motor de trazado de rayos en numpy (pasillo principal + pasillo lateral en un cruce, nichos, costillas, cámara con avance, giro e inclinación), pintado con las rampas de `tools/home-pixel/pixel.py` (pixel art, no filtro). Estilos en `STYLES` (a/b/c; **B por defecto**).
- `tools/aprender-pasillo/murales.py`: los 8 murales de puerta (64×124), los 12 de alcoba (96×72) y los 3 de la Sala, dibujados por cuadro según el tiempo; también la fuente 5×5 compartida.
- Correr: `python tools/aprender-pasillo/build_sotano.py pasos|giro|puerta` → `docs/aprender-pasillo/sotano-*.gif` (los GIF pesan ~15 MB y **no se suben a git**: se regeneran con el script; ~4–7 min cada uno).
- **Para la app: híbrido** (Niquito, 17 oct). Pasillo, giros y puertas = cuadros pre-renderizados por el script (WebP chicos, 320×200), con un loop corto en cada parada para que murales y antorchas sigan vivos. La Cámara del ramo (abajo) = canvas en vivo, porque depende del estado real (como hoy `dist/classes/willow-tower.js`).

## Al otro lado del portal: la Cámara del ramo (diseño, 17 oct; piloto Orgánica II)
- **Forma**: cripta **circular** de piedra y cristal. Se aterriza del remolino al centro; desde ahí se gira (igual que en el pasillo) para mirar cada **alcoba = un tema**.
- **Llegada**: apareces ya **mirando lo que toca hoy** (la alcoba recomendada o la de cristales más apagados). Un toque y estás estudiando.
- **Centro: sauce de cristal** que nace del suelo; cada rama = un concepto y **muestra el dominio** (brote → verde → flor). Reusa la idea y los estados de la Torre del Sauce (`willow-tower.js`), con el estilo B de piedra mágica.
- **Repasos = cristales que se apagan**: en las paredes de cada alcoba hay un cristal por concepto; se apaga a medida que el FSRS dice que se está olvidando. Tocar uno apagado = repaso rápido de ese concepto. (Así los cristales del sótano pasan a tener función.)
- **Cada alcoba**: un **mural animado del tema** al fondo y un **estante de frascos**, un frasco por misión, lleno y brillante según la evidencia demostrada (no por haberla "visto").
- **Al tocar un frasco**: la cámara hace **zoom a la mesa de la alcoba** y la clase se juega ahí, con la cripta de fondo (sin corte de pantalla). Reusa el motor de clases (`player.js`), cambia el marco.
- **Ruta: todo abierto + guía**. Nada se bloquea; la alcoba de hoy brilla más y la **cuenta regresiva de la PEP** está grabada en la piedra ("PEP 1 · 10 días"). Resuelve el riesgo de trabar a alguien cerca de una prueba.
- **Temas de la próxima PEP**: alcobas **veladas** con raíces y neblina y la fecha en que llega el material; se ven, aún sin misiones.
- Orgánica II, PEP 1 (27 oct): alcobas **Aminas** (`org-01`), **Aromáticos** (`org-04` aromaticidad + `org-05` sustitución electrofílica) y **Heterociclos** (aún sin clase: su estante queda vacío hasta crearla); las de la PEP 2, veladas.
- **Murales de alcoba** (Niquito, 17 oct; sacados de `docs/estudio-organica/MAPA_PEP1.md`):
  Aminas = **basicidad** (el H⁺ se pega al par libre de una amina; en la anilina el par se reparte en el anillo y el H⁺ se va: "AMINA > ANILINA").
  Aromáticos = **Hückel → SEA** (cuenta 2·4·6 electrones π = 4n+2 ✓ y ciclobutadieno 4 ✗; luego entra E⁺, complejo sigma, sale H⁺).
  Heterociclos = **piridina vs pirrol** (el par libre de la piridina queda fuera del anillo y atrapa al H⁺; el del pirrol gira dentro de los 6 π y el H⁺ rebota).

### Dónde va el resto de Aprender (Niquito, 17 oct; diseño, sin dibujar aún)
Hoy el "Centro de estudio" (`renderPractice` en `app.js`) tiene Ejercicios, Guías, Errores, Pruebas antiguas y Laboratorio. En el sótano:
- **Formulario** = un **grimorio abierto en el pedestal del sauce** de cada Cámara (uno por ramo, a mano desde cualquier alcoba).
- **Ejercicios, Guías y Pruebas antiguas** = una **Sala de entrenamiento aparte**, al fondo del pasillo (el gran arco con luz que ya existe), para todos los ramos, con estaciones.
- **Errores** = **grietas brillantes** en la alcoba de su tema (tocar una = reintentar ese error).
- **Laboratorio** = **sala propia en el pasillo** (alambiques), porque cruza todos los temas.

### Boceto animado (17 oct, aprobado: "está muy buena")
- `tools/aprender-pasillo/build_camara.py` (usa las piezas de `build_sotano.py`): cripta de radio 2,6 con 6 alcobas (Aminas al frente, Aromáticos a la derecha, Heterociclos a la izquierda, 2 veladas de la PEP 2 y el portal de llegada atrás), pilares con antorchas, pedestal con **"PEP 1 · 10 DÍAS"** grabado, sauce con una rama gruesa por alcoba y un mimbre por concepto (hojas verdes y flor = dominio), mesa con un frasco por misión (Aminas 8, Aromáticos 6, Heterociclos vacía) y un cristal por concepto en las paredes de la alcoba (apagado = toca repaso).
- Murales de alcoba en `murales.py` (`CAMARA`, 96×72 texeles); si en pantalla quedan más chicos, se engrosan los trazos.
- Recorrido: sale del remolino mirando el sauce y, detrás, la alcoba de hoy → rodea el sauce → frente a Aminas → un toque = se acerca a la mesa → gira a Aromáticos → Heterociclos → alcoba velada.
- Correr: `python tools/aprender-pasillo/build_camara.py` → `docs/aprender-pasillo/camara-organica.gif` (~6 min; no se sube a git). `... build_camara.py cuadros` → `camara-cuadros.png` con 6 cuadros clave en segundos (para revisar sin el GIF).

## Las 4 puertas y sus Cámaras (17 oct: "tenerlas todas listas")
- Cada ramo del semestre tiene **su puerta** (letrero grabado, 2 murales, portal de su color) y **su Cámara** con una alcoba por tema de la **PEP 1** (de `dist/semester-2026.js`), su mural animado, frascos, cristales de repaso, ramas en el sauce y la cuenta regresiva:
  | Ramo | Color (material) | Alcobas (mural) | Grabado |
  |---|---|---|---|
  | Orgánica II | verde (`sprout`) | Aminas (basicidad) · Aromáticos (Hückel→SEA) · Heterociclos (piridina vs pirrol) | PEP 1 · 10 días |
  | Fisicoquímica II | violeta (`arcane`) | Equilibrio (Q y K, Le Chatelier) · Electrolitos (disociación y atmósfera iónica) · Electroquímica (pila de Daniell, 1,1 V) | PEP 1 · 4 días |
  | Química Analítica | celeste (`crystal`) | Errores (sistemático vs aleatorio) · Ácido-base (neutralización y pH-metro) · Polipróticos (dos saltos, pKa1 y pKa2) | PEP 1 · 27 días |
  | Fisiopatología | brasa (`ember`, rampa nueva) | Nervioso (potencial de acción, Na⁺/K⁺) · Respiratorio (alvéolo, O₂/CO₂) · Digestivo (peristalsis) | PEP 1 · 26 días |
- La alcoba "de hoy" (más brillante) es el primer tema de cada ramo. Frascos, cristales y ramas usan **números de ejemplo** hasta conectar el motor.
- Código: `build_camara.py` tiene `RAMOS` y `set_ramo(key)`; `murales.py` suma 9 murales de alcoba (`CAMARA`); `build_sotano.py` tiene `anim_puerta(idx)` para cualquier puerta.
- Correr: `python tools/aprender-pasillo/build_sotano.py puerta-analitica|puerta-fisico|puerta-fisio` → `sotano-puerta-<ramo>.gif`; `python tools/aprender-pasillo/build_camara.py gif|cuadros <ramo>` → `camara-<ramo>.gif` / `camara-cuadros-<ramo>.png`.

## Sala de entrenamiento (diseño y boceto animado, 17 oct, aprobado: "me encanta")
Al fondo del pasillo, para todos los ramos: Ejercicios, Guías y Pruebas antiguas. Decisiones de Niquito (selección múltiple):
- **Forma: arena circular** abovedada (misma cripta que la Cámara), 4 nichos a 90°: **Yunque de ejercicios** al frente, **Atril de guías** a la derecha, **Archivo de pruebas antiguas** a la izquierda y el **arco de entrada** atrás. Letreros y bordes en **dorado** (forja), para distinguirla del verde de Orgánica.
- **Al centro, un gran cristal en bruto** sobre un pedestal con **"TANDA DE HOY"** grabado. Crece solo con **aciertos sin ayuda**: cada acierto suelta un **hilo de luz** desde la estación hacia el cristal. Idea: se opaca si pasan días sin practicar (FSRS).
- **Qué practicar: tanda de hoy** (~10 min, mezclada entre temas según errores y cercanía de la PEP; intercalar rinde más que bloques, Rohrer y Taylor 2007). Igual se puede ir a cualquier estación.
- **Pruebas antiguas en 2 modos**: **Simulacro** (reloj de arena con el tiempo real de la PEP, nota al final) y **Práctica** (sin tiempo, corrige cada pregunta). Hacer pruebas de práctica es de lo que más rinde (Dunlosky y colegas, 2013).
- Errores: cada fallo deja una **grieta** en la alcoba del tema (Cámara del ramo). Sin combate: los jefes siguen en Juegos.
- Boceto: `tools/aprender-pasillo/build_sala.py` (geometría propia + piezas de `build_camara.py`/`build_sotano.py`; muebles de piedra como parte del trazado de rayos). Murales de estación en `murales.py` (`SALA`: tanda 4/10 con A-B-C, guía con P1–P6 y barra, PEP 1 · 2024 simulacro/práctica). Recorrido: entra por el pasillo → rodea el cristal → yunque (acierta: chispas, ✓ y hilo de luz) → atril (pasa la hoja) → archivo (cae la arena) → vuelve a mirar el cristal: llegan 3 hilos y crece.
- Correr: `python tools/aprender-pasillo/build_sala.py` → `sala-entrenamiento.gif` (~5 min, no se sube) · `... cuadros` → `sala-cuadros.png`.

## Sala de Laboratorio (diseño y boceto animado, 17 oct, aprobado: "me gusta")
Para todos los ramos. Meta: **llegar preparado al lab real y salir con el informe resuelto** (la preparación previa baja la carga mental en el lab: Johnstone y Al-Shuaili 2001; Agustian y Seery 2017). Reemplaza el formulario "Laboratorio" de `renderPractice`.
- **Forma: nave larga por fases** (Niquito): cripta alargada de piedra (estilo B) con una gran mesa de mármol y alambiques al centro, campana de cobre hasta la bóveda, tuberías de latón y luz verde que burbujea. Bordes y letreros en **cobre/verdín** (distinto del dorado de la Sala y de los colores de ramo). Se camina a lo largo de la mesa: PRE al entrar, DURANTE al medio, DESPUÉS al fondo.
- **Estaciones**: **Pizarra de cálculos** (PRE: diluciones, estequiometría, rendimiento teórico, con corrección real del motor) · **Vitrina de seguridad** (PRE: reactivos con pictogramas GHS; qué riesgo y qué EPP) · **Banco de montaje** (DURANTE: armar reflujo/destilación/titulación pieza por pieza y en orden; si te equivocas, gotea o humea) · **Cuaderno de bitácora** (DESPUÉS: datos crudos, % de rendimiento, % de error, discusión del informe).
- **Progreso: estante de prácticas** (Niquito): un matraz por lab del semestre (sale del calendario del Organizador: fechas de prelab e informe), se llena en 3 fases (pre ✓, montaje ✓, informe ✓); el próximo lab burbujea con su fecha grabada ("LAB 3 · JUEVES").
- Lo que dependa del manual del semestre (cantidades, protocolo) sigue marcado como pendiente del manual, como hoy.
- Boceto: `tools/aprender-pasillo/build_lab.py` (geometría propia: nave de 3,4 × 7,4 con bóveda de cañón, 3 arcos fajones con antorchas, 4 nichos + entrada, banco de mármol con vetas de verdín y campana de cobre con chimenea; usa piezas de `build_sotano.py`/`build_camara.py`). Rampas nuevas `copper` y `verdin`. Murales de estación en `murales.py` (`LAB`: prelab con C1·V1 = C2·V2 que se despeja; vitrina con rombo GHS que rota ANILINA tóxico / ÉTER inflamable / HCL corrosivo y su EPP; informe con rendimiento 70 % y discusión). Fuente: se sumaron `= , . % W Z`.
  Recorrido: entra (se ve "LABORATORIO" en el tímpano del fondo) → pizarra → vitrina → banco de montaje (aparece el matraz, calienta **sin refrigerante y el vapor se escapa**, baja el refrigerante y gotea de vuelta: reflujo) → estante (LAB 3 sube a 2/3) → bitácora → mira el estante y el LAB 3 se completa.
- Correr: `python tools/aprender-pasillo/build_lab.py` → `sala-laboratorio.gif` (~6 min, no se sube) · `... cuadros` → `lab-cuadros.png` (segundos).
- **El laboratorio caminable de la Torre queda como lugar del mundo** (decorativo y de mascota), no como sala de estudio: no se mezcla madera con piedra.

## Criterios de aceptación (de la prueba)
- Avanzar, girar y abrir una puerta se ven fluidos y con profundidad real (no "PNG plano").
- Cada puerta se distingue a primera vista por color, emblema, letrero y murales del ramo; el letrero se lee de frente.
- Nada de runas o guías genéricas; brillo sobrio.

## Lecciones de las versiones descartadas (17 oct)
- v1 (pasillo lateral de ladrillo) = "plano, soso, castillo genérico". v2/puerta estrella (madera tipo refugio) = "se parece al refugio, todo plano, hojas asquerosas". Se borraron.
- Lo que destrabó: perspectiva real con volumen y luz (trazado de rayos), y luego contenido **propio de cada ramo** en vez de decoración genérica.
- Cuando Niquito no sabe explicar qué falla: ofrecer **3 versiones lado a lado** y que elija.

## Decisiones cerradas (Niquito, 18 oct 2026)
- **Cristal de la Sala de entrenamiento: uno por ramo**, con el color del ramo (igual que su puerta); se carga con las tandas de ese ramo.
- **Premio al terminar una tanda: según evidencia real** (aciertos sin ayuda y recuerdo tras días); terminar sin acertar no paga. Montos en `docs/economia/`.
- **Grietas de errores en la Cámara: cada error abre una grieta** en la pared con el concepto fallado; se sella al acertarlo sin ayuda y de nuevo días después.
- **Grimorio-formulario del pedestal** (propuesta, por aprobar): se abre al tocarlo y muestra fórmulas/mecanismos del ramo con páginas por tema; lo no dominado queda borroso.

## Implementación v1 (Niquito, 18 oct 2026)
Decisiones: **tiras de cuadros por paso** (fluido como el boceto), **reemplazar del todo** el índice del grimorio y **partir por Orgánica II**.

### Qué entra
- `#/learn` pasa a ser el Sótano (código en `dist/aprender/`, carga bajo demanda desde `renderSubjects` de `app.js`). Se borró el índice-grimorio (su contenido y su CSS en `update01.css`); `renderSubjects` quedó como el cargador del Sótano y `grimoireShell` sigue sirviendo a las evaluaciones.
  Las rutas `learn/course/<ramo>/evaluation/...` y `learn/course/<ramo>/lesson/...` **siguen vivas** (las usan Inicio, el tutorial y el aula); su rediseño dentro de la Cámara queda pendiente.
- Pasillo con las 4 puertas + pasillo lateral con candado; **cada puerta entra a la Cámara de su ramo** (Orgánica II en v1; Analítica, Fisicoquímica II y Fisiopatología se agregaron el 18 oct, ver "Cámaras de los otros 3 ramos").
- Cámara de Orgánica II: Aminas → `org-01` (8 misiones = 8 frascos), Aromáticos → `org-04` + `org-05` (3+3 misiones = 6 frascos), Heterociclos → sin clase (cristales apagados, "próximamente").

### Cómo se mueve (grafo de paradas)
- Cada **parada** (nodo) es un cuadro fijo; cada **tramo** (arista) es una tira de cuadros que se reproduce hacia adelante o al revés (volver = la tira en reversa). Un BFS elige la ruta.
- Pasillo: paradas `h0 · h1(Orgánica) · h2(Analítica) · h3(Fisico + cruce) · h4(Fisio)`, sus gemelas mirando atrás `r0..r4`, vistas de puerta `d-*`, pasillo lateral `b0..b3` y `q0..q3`.
- Cámara: llegada `c-in`, anillo `c0 · c60 · c120 · c180(portal) · c-120 · c-60`, y vista de mesa `ct0 · ct60 · ct-60`.
- **Nunca se retrocede de espaldas** (Niquito, 18 oct): "Volver" no existe en el pasillo. Se usa **Dar la vuelta** (giro de 180° en el lugar) y se camina hacia adelante mirando hacia la entrada. Por eso cada parada tiene su gemela mirando atrás (`r0..r4` en el pasillo, `q0..q3` en el lateral) y sus tramos de caminata propios. Salir de una puerta o de la mesa sí es un giro/acercamiento al revés, no una caminata.
- **Ritmo** (Niquito, 18 oct: "muy rápido, muy GIF"): ~1,2 s por unidad caminada, giros de ~1,8 s; la app **mezcla cuadros vecinos** (movimiento continuo aunque sea lento) y suaviza arranque y frenada. Los giros llevan ~20-32 cuadros (con menos, la mezcla deja doble imagen). La prueba exige ≥ 1 s por tira.
- Controles: botones contextuales (Avanzar, Volver, ◀ ▶ girar/mirar puerta, Entrar), flechas y Enter del teclado, toque en las mitades del cuadro. Móvil (390) y escritorio (1440) usan el mismo lienzo de 320×200 escalado sin suavizar (`image-rendering: pixelated`).

### Formato de los cuadros
- 320×200, WebP con pérdida q≈80 (~12 KB por cuadro; casi idéntico al original, medido el 18 oct). Una **hoja de cuadros por tira** (cuadrícula), cargada bajo demanda y precargando las tiras vecinas.
- Se generan con `tools/aprender-pasillo/export_app.py` (reproducible, usa los motores `build_sotano.py` y `build_camara.py`, en paralelo). Salida en `dist/aprender/img/` + `dist/aprender/manifest.json`. Los GIF del boceto siguen sin subirse.

### El estado real va ENCIMA (no horneado)
- En la Cámara los cuadros se renderizan **neutros**: sin frascos, sin texto de cuenta regresiva, cristales apagados y ramas del sauce verdes.
- Encima del cuadro, en las paradas de alcoba y de mesa, se dibujan **sprites** (recortes pre-renderizados con el mismo motor): 5 niveles de llenado por frasco (0 · ¼ · ½ · ¾ · 1) y cristales «al día» / «toca repasar» (sin empezar = el apagado de fondo).
- Datos (reutiliza lo que ya hay, nada nuevo en el motor): frasco = misiones con actividades respondidas / totales (`NexoClassroom.itemsOf` + `state.classSessions[id].answers`); cristal = un grupo de conceptos seguidos de la clase (Aminas tiene 18 conceptos y 6 cristales, así que 3 por cristal; Aromáticos 16 y 5): se apaga si algún concepto del grupo tiene la hoja `seca` (`NexoClassEvidence.leaves`), queda sin empezar si todos son `semilla` y brilla en cualquier otro caso; cuenta regresiva = `NexoClassroom.nextExam` (calendario real). Repasos del ramo = cristales `seca`.
- La ficha bajo el cuadro repite todo en botones (una ficha por alcoba, con los frascos numerados): sirve en celular, donde los frascos del cuadro son chicos, y para lectores de pantalla.
- Tocar un frasco abre la clase en esa misión; el pedestal y el sauce quedan sin acción en v1 (Niquito, 18 oct: el botón "Ver el sauce" llevaba a la pantalla vieja de la Torre del Sauce y estaba mal; se quitó: el sauce debe vivir dentro de la Cámara, con su estado real, en v2); tocar un cristal explica su concepto.
- Alcoba «de hoy»: queda grabada en el cuadro (Aminas, el tema vigente). El sauce central no refleja aún el estado real (v2: pasada de render por capas).

### Criterios de aceptación v1
- Avanzar, girar, mirar una puerta y entrar se ven fluidos en 1440 y 390; el cuadro no se deforma ni se suaviza.
- Con datos reales: los frascos de Aminas/Aromáticos reflejan las misiones respondidas, los cristales apagan o encienden según repaso, la cuenta regresiva sale del calendario.
- Cada puerta abre su portal; Orgánica II entra a la Cámara y las clases abren con el player existente; Analítica, Fisicoquímica y Fisiopatología muestran sus clases reales.
- Peso: ≤ 20 MB de cuadros en total (15,6 MB hoy) (cada Cámara y el pasillo cargan por separado) en total, cada tira carga sola. Pruebas `tools/aprender-test.cjs` en `npm test`.

### Cámaras de los otros 3 ramos (18 oct 2026)
Mismas reglas que Orgánica II: cuadros neutros por Cámara y estado real encima. Paradas con prefijo (`ana.c0`, `fq.c60`, `fis.cz-60`…); una Cámara por ramo, su color y su sauce de cristal (tal como se aprobaron en los bocetos).
- **Analítica**: Errores → `ana-01` (2 frascos) · Ácido-base → `ana-02` + `ana-03` (4) · Polipróticos sin clase.
- **Fisicoquímica II**: Equilibrio → `fq-01` (4) · Electrolitos y Electroquímica sin clase todavía.
- **Fisiopatología**: Nervioso → `fis-01` + `fis-02` (4) · Respiratorio → `fis-06` (2) · Digestivo → `fis-09` (2).
- Se borró la tarjeta provisional de clases de las puertas: ya no hay puerta sin Cámara. Las alcobas sin clase se muestran con sus cristales apagados y "todavía no tiene clase propia".
- Las clases de cada Cámara se cargan al llegar a su puerta. `export_app.py` acepta el ramo: `python tools/aprender-pasillo/export_app.py camara fisio`.
- Peso: cada Cámara carga sola (~3 MB); el total del sótano es de ~16 MB, pero una visita baja el pasillo (~5 MB) y la Cámara que abre (~2,5 MB).

### Pendiente de v2
Sauce y torre dentro de la Cámara (reemplaza la pantalla vieja `#/torre`), sauce con estado real, grietas de error, grimorio-formulario del pedestal, Sala de entrenamiento y Sala de Laboratorio dentro del flujo, mapas de evaluación dentro de la Cámara, sonido por portal.

## Pendiente
- **Sala de Laboratorio** (aprobada): el mural del informe queda chico (el arco del nicho lo limita); la campana se ve poco desde el banco.
- Aprobar el grimorio-formulario del pedestal y bocetar las grietas en la Cámara.
- Cámara: el tronco del sauce aún se ve en bloques; la fecha de la PEP 2 de Orgánica no está en `semester-2026.js` (las veladas dicen "EN CAMINO").
- Llevar el pasillo a la app con cuadros pre-renderizados (Sonnet · alto): peso, móvil (390) y escritorio (1440).
- Pulir: cristales que aún parecen pegados, legibilidad de murales vistos de lado.
- Relación con la Torre (`docs/mundo-torre/SPEC.md`: pisos, escalera, ascensor).
- Tutorial: su recorrido de Aprender espera a este rediseño (`docs/chats/tutorial.md`).
