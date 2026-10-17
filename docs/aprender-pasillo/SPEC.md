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
- `tools/aprender-pasillo/murales.py`: los 8 murales como texturas 64×124 que se dibujan por cuadro según el tiempo; también la fuente 5×5 compartida.
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

## Criterios de aceptación (de la prueba)
- Avanzar, girar y abrir una puerta se ven fluidos y con profundidad real (no "PNG plano").
- Cada puerta se distingue a primera vista por color, emblema, letrero y murales del ramo; el letrero se lee de frente.
- Nada de runas o guías genéricas; brillo sobrio.

## Lecciones de las versiones descartadas (17 oct)
- v1 (pasillo lateral de ladrillo) = "plano, soso, castillo genérico". v2/puerta estrella (madera tipo refugio) = "se parece al refugio, todo plano, hojas asquerosas". Se borraron.
- Lo que destrabó: perspectiva real con volumen y luz (trazado de rayos), y luego contenido **propio de cada ramo** en vez de decoración genérica.
- Cuando Niquito no sabe explicar qué falla: ofrecer **3 versiones lado a lado** y que elija.

## Pendiente
- Diseñar (conversando) la **Sala de entrenamiento** del fondo y la **sala de Laboratorio**; luego bocetos. Sumar a la Cámara el grimorio-formulario del pedestal y las grietas de errores.
- Cámara: el tronco del sauce aún se ve en bloques; la fecha de la PEP 2 de Orgánica no está en `semester-2026.js` (las veladas dicen "EN CAMINO").
- Llevar el pasillo a la app con cuadros pre-renderizados (Sonnet · alto): peso, móvil (390) y escritorio (1440).
- Pulir: cristales que aún parecen pegados, legibilidad de murales vistos de lado.
- Relación con la Torre (`docs/mundo-torre/SPEC.md`: pisos, escalera, ascensor).
- El laboratorio caminable de la Torre (`dist/world/torre-mundo.js`) quedó sin página: evaluar si es la sala de Laboratorio o de entrenamiento del sótano (avisado en `docs/mundo-torre/SPEC.md`).
- Tutorial: su recorrido de Aprender espera a este rediseño (`docs/chats/tutorial.md`).
