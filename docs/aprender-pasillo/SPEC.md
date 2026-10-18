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
- Para la app (por decidir): reproducir cuadros pre-renderizados (tira de PNG/WebP por paso, giro y puerta) o portar el motor a WebGL/canvas en tiempo real.

## Criterios de aceptación (de la prueba)
- Avanzar, girar y abrir una puerta se ven fluidos y con profundidad real (no "PNG plano").
- Cada puerta se distingue a primera vista por color, emblema, letrero y murales del ramo; el letrero se lee de frente.
- Nada de runas o guías genéricas; brillo sobrio.

## Lecciones de las versiones descartadas (17 oct)
- v1 (pasillo lateral de ladrillo) = "plano, soso, castillo genérico". v2/puerta estrella (madera tipo refugio) = "se parece al refugio, todo plano, hojas asquerosas". Se borraron.
- Lo que destrabó: perspectiva real con volumen y luz (trazado de rayos), y luego contenido **propio de cada ramo** en vez de decoración genérica.
- Cuando Niquito no sabe explicar qué falla: ofrecer **3 versiones lado a lado** y que elija.

## Decisiones del otro lado del portal (Niquito, 18 oct 2026)
Bocetos aprobados: pasillo, Cámara de Orgánica II (`build_camara.py`), Sala de entrenamiento (`build_sala.py`) y Sala de Laboratorio (`build_lab.py`: nave por fases con pizarra de cálculos, vitrina GHS, banco de montaje con reflujo, bitácora y estante de prácticas).
Esos tres scripts estaban en la carpeta de trabajo de otro chat y **no aparecían en `tools/aprender-pasillo/`** al abrir este chat: verificar que se guardaron antes de portar.
- **Cristal de la Sala de entrenamiento: uno por ramo**, con el color del ramo (igual que su puerta). Se carga con las tandas de ese ramo.
- **Premio al terminar una tanda: según evidencia real** (aciertos sin ayuda y recuerdo tras días); terminar sin acertar no paga. Detalle de montos en `docs/economia/`.
- **Grietas de errores en la Cámara: cada error abre una grieta** en la pared con el concepto fallado; se sella al acertarlo sin ayuda y de nuevo días después (espaciado).
- **Grimorio-formulario del pedestal** (propuesta, por aprobar): el grimorio del pedestal es el formulario del ramo; se abre al tocarlo y muestra las fórmulas/mecanismos que ya dominas (los no vistos quedan borrosos), con páginas por tema.

## Pendiente
- Aprobar el grimorio-formulario del pedestal y boceto de las grietas en la Cámara.
- Llevar el pasillo a la app (otro chat, Sonnet 5.5 · alto): cuadros pre-renderizados, probar en 1440 y 390.
- Conectar con la app: formato (cuadros pre-renderizados vs tiempo real), peso, móvil (390) y escritorio (1440).
- Pulir: cristales que aún parecen pegados, legibilidad de murales vistos de lado.
- Si "desbloquear al dominar" puede trabar a alguien cerca de una PEP (¿salida para saltar?).
- Relación con la Torre (`docs/mundo-torre/SPEC.md`: pisos, escalera, ascensor).
- Tutorial: su recorrido de Aprender espera a este rediseño (`docs/chats/tutorial.md`).
