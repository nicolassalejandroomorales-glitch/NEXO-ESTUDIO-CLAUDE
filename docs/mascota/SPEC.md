# Mascota: vida en el refugio (UPDATE 02.1)

Tema de este chat: **la mascota**. Meta: que deje de estar clavada en el escritorio y *viva* en la sala:
se mueve, saca libros de la biblioteca, mira por la ventana, duerme, y reacciona al clima real (se asusta con la tormenta).
Estado: **borrador, esperando OK de Niquito** (3 oct 2026).

## Fase 0 — Borrón y cuenta nueva (4 oct 2026, pedido por Niquito)

Antes de la vida en la sala se borra todo lo viejo para rehacerlo con el diseño propio de Niquito (él trae una imagen de referencia).

- **Se borran**: cerdito/gato/perro (bases, poses, Rive, `mascot-rive.js`, `vendor/rive`), los 27 cosméticos (`dist/avatar/*`, `assets/avatar/`),
  la tienda y el vestuario actuales, la mascota de la barra lateral y las pruebas que solo revisaban eso. Todo sigue en el historial de Git.
- **Átomos a cero** (una sola vez, con marca en el estado) y se quita el artículo "Modo sin distracciones". Se sigue ganando átomos al estudiar;
  la economía se rediseña junto con la tienda nueva.
- **Inicio**: escritorio vacío hasta que exista la mascota nueva. Tienda y Vestuario muestran "Disponible próximamente".
- **No se toca Supabase**: el catálogo e inventario de la nube siguen ahí; la app local los ignora. Con sesión iniciada, el saldo de la nube
  lo manda el servidor (no se puede poner en cero sin tocar Supabase) → pendiente para cuando se autorice.
- Se conserva `dist/mascot/controller.js` (decide intención por habitación, sin arte): lo reutiliza el motor de vida.

**Hecho (4 oct 2026, esperando aprobación visual)**: archivos borrados con `git rm`; `data.js` con `companions`/`rewards` vacíos;
`app.js` con `avatarMarkup()` vacío, Tienda y Mascota en "Disponible próximamente" (los Desafíos siguen bajo la Tienda), migración
`meta.shopReset202610`; bundle sin módulos de avatar; `smoke-test` y `mascot-controller-test` actualizados. Capturas en `capturas/fase0-*`.
**Quedó pendiente de la Fase 0**: CSS muerto del avatar/tienda en `styles.css`, `arcane.css` y `update01.css` (no estorba; limpiarlo al hacer la tienda nueva),
y pruebas de navegador/nube que aún mencionan la mascota vieja (`e2e-test`, `cloud-e2e`, `cloud-test`, `database-test`, `optimize-room-art`).

## Fase 5 — Las mismas mascotas en PIXEL ART (5 oct 2026) ← DIRECCIÓN ACTUAL

Niquito pidió rehacer átomo, matraz y slime en pixel art con todas las animaciones. El Inicio también pasa a pixel art
(otro chat: `docs/inicio-pixelart/SPEC.md`, 418×235 px de arte ×4), así que las mascotas usan **el mismo tamaño de píxel y las mismas rampas**.
- `dist/dev/pixelmascotas.js`: motor de sprites. Grilla de 40×44 px de arte; cada cuadro se **re-rasteriza** con la pose (aplastar, inclinar,
  flotar, poción inclinada, corcho que salta) → nunca se estira la imagen. Sombreado por escalones dentro de rampas (luz arriba-izquierda),
  contorno propio de cada pieza + contorno exterior con el tono más oscuro ("selout"). Ojos, bocas, 14 expresiones, 14 accesorios y efectos
  (corazón, notas, !, ?, 6, 7, lágrima, z, estrella, vapor, enojo, libros, bombilla) son mini dibujos hechos a mano (mapas de caracteres).
- Demo: `/dev/mascota-pixel.html` sobre la muestra pixel del refugio (copia en `dist/dev/ref/muestra-ventana.png`): camina por el escritorio,
  saca un libro de la estantería, lo lee junto a la ventana, duerme junto a las plantas, emotes, vestuario y luciérnagas de píxel.
  Hoja de revisión: `/dev/pixel-hoja.html` (×6–×8, expresiones, cosméticos y poses).
- La versión SVG (Fase 4) queda como respaldo; el diseño, conductas, expresiones, emotes y ranuras son los mismos.
- **Mini brazos con manitos** (5 oct 2026): cápsula hombro→(codo)→mano + manito redonda, re-rasterizados por cuadro. Matraz: brazos de vidrio
  con manitos crema; átomo: brazos celeste energía con manitos crema; slime: seudópodos de gelatina. `armPose(nombre)`: rest, walk,
  **sixseven** (el gesto del meme: palmas arriba que suben y bajan alternadas), **dab** (brazos en diagonal, cara en el codo, cuerpo inclinado),
  wave, dance, up, carry, read, cry, fists, fiddle, scratch, cheeks, sleep. En la demo las poses se mezclan suave y cada conducta usa la suya.

## Fase 4 — Mascota temática simple (4 oct 2026) — su diseño se conserva en la Fase 5 (pixel)

Ningún diseño de raptor convenció. Diagnóstico honesto: no había referencia clara de lo que gusta y el dibujo de animales por código tiene techo.
**Niquito eligió una mascota temática de formas simples** (lo que sí se dibuja bien por código y encaja con Nexo/química).
Galería: `http://127.0.0.1:8765/dev/mascota-alquimica.html` — A matraz, B balón de poción, C átomo, D slime alquímico, E espíritu de vela,
F tubo de ensayo, G gota de mercurio, H cristal. Esperando su elección. Las especies raptor/capibara/zorro quedan en pausa.
- **Diagnóstico de Niquito (clave)**: se veían **planas** (sin detalles ni profundidad). Regla de diseño desde ahora: cada mascota lleva
  volumen con luz (luz/medio/sombra + luz de borde cálida de la ventana), materiales creíbles (vidrio con grosor y reflejos, líquido con superficie
  y burbujas, madera con veta, cera, bronce), detalles con historia (etiqueta con símbolo alquímico, cordel, sello de cera), grano suave y
  sombra de contacto + luz proyectada para integrarse a la pintura del refugio. Prueba: `/dev/mascota-detallada.html` (matraz, balón, vela).
- **Elegidas (4 oct 2026): las 3 → átomo, matraz y slime** (el slime del primer diseño). Detalle v2 en `dist/dev/alquimicos.js`
  (graduaciones y gotas de condensación en el vidrio, núcleo de protones/neutrones con órbitas que brillan, slime translúcido con núcleo claro,
  partículas y gota que cae). Cada SVG trae partes con clase (`m-root`, `m-body`, `m-eye`, `m-liquid`, `m-bubbles`, `m-foot-l/r`, `m-hat`…).
- **Demo en la sala**: `/dev/mascota-sala.html` — suelo caminable (puntos `desk`, `nearDesk`, `rug`, `shelf`, `chair`), escala por profundidad,
  salto en arco al escritorio, animaciones CSS por tipo (matraz camina meciéndose y la poción se balancea; átomo flota con electrones en órbita;
  slime avanza a saltitos aplastándose). Botón "Ver puntos del suelo" para calibrar.
- Cómo interactuar con un fondo PNG: suelo caminable + escala por profundidad + puntos de interés (anclas de `home-scene.js`) + recortes del
  mismo PNG encima de la mascota para que pase "detrás" (técnica de las enredaderas). Falta implementar los recortes (oclusión).
- **v3 de la demo (4 oct 2026)**: animador por código que mezcla quieto/caminar con suavizado exponencial; **mirada** (grupo `m-gaze`:
  mira hacia donde va, vistazos al azar, al libro al leer); **anticipación** (se agacha antes de saltar) y **aterrizaje** con polvo; giro con
  aplastamiento; **gestos sueltos** en reposo (corcho que salta, gota del slime `m-drip`, giro de energía del átomo); páginas que se dan vuelta
  al leer; **corazones** al tocarla; **aura amarilla translúcida** detrás + 4 **luciérnagas** que orbitan (idea de Niquito); toque cálido
  (`sepia/saturate`) para integrarse a la luz de velas. Análisis de encaje: colores más fríos que la pintura → toque cálido + aura.
- **v4 (4 oct 2026)**: **8 expresiones** en `alquimicos.js` (`setExpression`: neutral, feliz, sorpresa, dormida, concentrada, amor, bostezo,
  idea; ojos y bocas como variantes que se muestran/ocultan) + hoja `/dev/expresiones.html`. Conductas: **baile** con notas ♪, **saludo** "¡!",
  **bostezo y estirón** (antes/después de la siesta), **idea** con bombilla, runas que salen del libro al leer, sorpresa cuando el libro vuela,
  amor al tocarla. **Curvas** (Bézier) al caminar e **inclinación** por aceleración. **Luciérnagas en JS** que persiguen con retraso (estela),
  se calman al dormir y se alborotan al estar feliz. **Libros detallados** (cuero, esquinas de metal, símbolo en relieve, cinta, 3 colores;
  abierto con letra capital, texto y un benceno con flechas).
- **v5 (5 oct 2026)**: 14 expresiones (nuevas: triste, enojada, deslumbrada, nerviosa, confundida, pícara) y emotes nuevos en la demo:
  **"6 7"** (meme: se balancea de lado a lado con un 6 y un 7 dorados que suben y bajan), confundida "?", llorar (lágrimas), enojada (vapor +
  símbolo de enojo + temblor), nerviosa (gota de sudor), deslumbrada (ojos de estrella). **14 cosméticos** (`ACCESORIOS` + `NOMBRES`):
  sombrero de mago, birrete, corona, gorro de lana, flor · lentes, lentes de sol, monóculo · corbatín, bufanda, collar · lupa, varita, taza.
  Vestuario con un selector por ranura en la demo. Hoja de revisión: `/dev/expresiones.html` (expresiones + cosméticos en las 3).
- **Ojo**: Niquito propuso llevar **toda la app a pixel art** (ver `docs/pendientes.md`). Si se decide, las mascotas pasan a sprites;
  diseño, expresiones, emotes, cosméticos y ranuras se conservan.

## Fase 3 — Diseñar primero, animar después (4 oct 2026) — reemplazada por la Fase 4

Niquito tampoco quedó conforme con la v5 cartoon ("las proporciones no están correctas"). **Decisión: Rive y animaciones en pausa
hasta aprobar un diseño.** Se trabaja una especie a la vez, partiendo por el velociraptor.
- Galería de opciones: `http://127.0.0.1:8765/dev/raptor-disenos.html` (8 diseños A–H, solo dibujo, con vista sobre el escritorio del refugio).
  Cada diseño se arma con formas básicas en 3 capas y **un contorno unificado por capa** (filtro SVG): las piezas se funden en un solo dibujo.
- Flujo: Niquito elige (o mezcla) → se refina esa opción → recién ahí se pasa a Rive con sus animaciones (el generador y el rig de fideo ya existen).
- Proporción cabeza/cuerpo y forma base (redonda = tierna, triangular = dinámica) son las palancas principales del diseño.

## Fase 2 — Estilo cartoon "rubber hose" (4 oct 2026) — en pausa (ver Fase 3)

Niquito vio la v4 (animales realistas en Rive) y **no le convenció**: quiere algo **más cartoon, tipo Cuphead** (dibujos de los años 30).
- **Las mismas 3 especies**, ahora como **personajes de pie**: tronco tipo frijol, **brazos y piernas de fideo** (sin codos, se doblan como manguera),
  **guantes blancos**, **zapatos grandes**, **ojos "pie-cut"** (negros con una cuña recortada), bocas exageradas. Diseño propio: no copiar personajes de Cuphead.
- **Color vintage de película** (cálido y algo apagado; el grano de película va como capa CSS en la app).
- **Un solo cuerpo de cartoon compartido** (aquí sí corresponde: en el rubber hose todos se construyen igual) → mismas animaciones para las 3;
  cambian cabeza, cola y colores. Generador: `tools/mascots/cartoon.cjs`.
- **Brazos y piernas de fideo en Rive**: una curva con trazo grueso (tinta + color) cuyos vértices se animan; guante/zapato en la punta siguen la curva.
- **Interactividad** (todas aprobadas): mirar el cursor, reaccionar al tocarla, celebrar el estudio (`accion` nueva), bailar al ritmo (idle con rebote).
- Más adelante: "hervor" de línea (2-3 versiones del contorno alternando, efecto dibujo a mano).

**Hecho v5 (4 oct 2026, esperando opinión de Niquito)**: `tools/mascots/cartoon.cjs` (cuerpo, guantes, zapatos, ojos pie-cut, 3 bocas en el Solo
`Expresion`: Sonrisa/Contento/Oh) + `raptor.cjs`/`capibara.cjs`/`zorro.cjs` (solo cabeza, cola y colores). El generador soporta extremidades
de fideo (`noodle`: vértices animados + guante/zapato en la punta) y `scale`. Acciones: `0` Idle = **baile al ritmo** (100 bpm, estirar/aplastar),
`1` Caminar (pavoneo), `2` Alcanzar (brazo de goma que se estira hasta la estantería), `3` **Celebrar** (salto con brazos arriba).
Artboard 400×380 (80 px de aire arriba). Capturas en `capturas/cartoon/`.
**Falta de la Fase 2**: mirar el cursor y reaccionar al tocarla (listeners de Rive), hervor de línea, grano de película (CSS), limpiar los
conceptos/capturas del estilo animal si ya no sirven.

## Fase 1 — Diseño de las 3 mascotas en Rive (4 oct 2026) — reemplazada por la Fase 2

- **Especies**: velociraptor, capibara, zorro. Estilo **tierno de cuento** (cabeza grande, redondos, ojos expresivos, sombreado cálido).
- **Herramienta**: Rive CLI oficial 1.3.0 (`rive.exe`), formato RML (texto → `.riv`). Verificación con `rive <dir> --verify` y capturas con `--screenshot`.
- ~~Un solo esqueleto para las tres~~ → **descartado** (boceto v1 feo: las obligaba a estar de pie como peluche). **Cada especie tiene su anatomía real**:
  raptor horizontal con cola de contrapeso y garra en hoz; capibara y zorro **en 4 patas** (se sientan para leer). Lo compartido son los
  *comportamientos* (mismas entradas de la máquina de estados: caminar, leer, emotes), no la forma.
- **Concepto elegido: estilo "A · cuento"** (contorno limpio, sombreado suave, proporciones de animal real). Referencias en `conceptos/*-A-vector.jpg`
  (generadas con Canva una sola vez; no generar más). Raptor: **escamas y rayas estilo película, sin plumas** (diseño propio, no copia de Jurassic Park).
- **Sin huesos con skinning ni scripts Luau** al inicio: grupos rígidos con pivotes (más simple y robusto); sin scripts no hace falta firma ni cuenta.
- **Fuente única**: `tools/mascots/` genera el RML (`rive/mascotas/`) desde la geometría de cada especie; boceto rápido en `dist/dev/mascotas.html`.
- El reproductor web de Rive se vuelve a agregar a `dist/vendor/` cuando las mascotas entren a la app (versión compatible con la CLI).

**Hecho (4 oct 2026)**: tubería Rive funcionando → `tools/mascots/build.cjs` (trazos estilo SVG → RML, partes con pivote, animaciones con curvas suaves,
recortes) + `tools/mascots/raptor.cjs`. Compila con la CLI, verifica y exporta `dist/assets/mascotas/mascotas.riv`. El reproductor web
(`dist/vendor/rive`, v2.42.2, recuperado de Git) lo carga sin problemas. Prueba en vivo: `http://127.0.0.1:8765/dev/mascotas.html`.
Mesa de luz para calcar: `/dev/ref/mesa.html?f=raptor|capibara|zorro`. Raptor v2: respira, mueve cola/brazos y parpadea.
**Sigue**: aprobación del raptor → capibara y zorro (4 patas) → caminar → sacar libro y leer → emotes.

### Contrato del rig (igual para las 3 especies; lo usa la app)
- **Máquina de estados** `Mascota`, entrada numérica **`accion`**: `0` Idle · `1` Caminar (en el lugar; la app desplaza la mascota por la sala)
  · `2` Alcanzar (oneShot: se estira, toma el libro y queda con él). Mezcla de 220 ms entre acciones. Capa aparte `Ojos` con el parpadeo.
- **Ranuras de accesorios** (Node vacíos, mismos nombres en todas): `RanuraCabeza`, `RanuraCara`, `RanuraCuello`, `RanuraEspalda`,
  `RanuraMano`, `RanuraCola`. Cada una cuelga de su parte → el accesorio se mueve con ella. Accesorios futuros = un `Solo` por ranura
  (primera opción vacía), igual que `ObjetoMano` (`Nada | Libro`) en `RanuraMano`.
- El generador vuelve al reposo lo que una acción no anima (evita piernas dobladas al cambiar de acción).
- Captura de prueba de cualquier cuadro: `node tools/mascots/build.cjs --estado=Alcanzar --advance=45` (después recompilar sin `--estado`).
- **v4 (4 oct 2026)**: las 3 especies en un solo `.riv` (un artboard por especie: `Velociraptor`, `Capibara`, `Zorro`), 400×340
  (40 px de aire arriba para estirarse y sombreros). Capibara y zorro **llevan el libro en la boca** (su `RanuraMano` está bajo el hocico)
  y para *Alcanzar* se paran en las patas traseras. Raptor: contorno encima de la crema (papada/cuello ya marcados) y zancada más amplia.
  Página de prueba con selector de especie y acción: `/dev/mascotas.html`. Capturas: `capturas/v4-*`.
- Pendiente del raptor: en el cuadro medio de la caminata las piernas se cruzan (falta zancada más amplia), pies algo planos,
  sombreado suave bajo la panza, y doblar la cola con huesos (más fluida).

## Qué

**1. Estaciones**: 4 lugares de la sala (anclas de `home-scene.js`, hoy solo el escritorio está calibrado).

| Estación | Ancla | Para qué |
|---|---|---|
| Escritorio | `desk` | Leer, escribir |
| Ventana | `window` | Mirar afuera, mirar la lluvia |
| Estantería | `bookshelf` | Sacar y devolver libros |
| Sillón | `rest` | Descansar, dormir, esconderse |

**2. Escenas**: pequeños guiones que encadenan pasos. Ejemplos:

| Escena | Pasos | Cuándo |
|---|---|---|
| Buscar un libro | va a la estantería → se estira → aparece el libro en sus manos → salta al escritorio → lee | Bloques de "leer" |
| Mirar por la ventana | va a la ventana → mira → "…" de vez en cuando | Bloques de "mirar", amanecer y atardecer |
| Dormir | va al sillón → se acurruca → "z z" | Noche (22:00–06:00) |
| Lluvia curiosa | va a la ventana → mira las gotas → "?" | Llovizna o lluvia suave |
| **Susto de tormenta** | trueno → "!" y salta → corre al sillón → tiembla con gotitas de sudor hasta que se calma | Tormenta (interrumpe cualquier escena) |
| Cariño | al tocarla: corazón + saltito | Siempre |

**3. Clima real**: la ventana muestra lluvia cuando de verdad llueve en Santiago y hay relámpagos cuando hay tormenta.

Es puro ambiente: no da recompensas ni toca el motor académico.

## Decisiones

1. **Se mueve a saltitos, no caminando.** No hay arte de caminata y deslizar una imagen se ve falso. Un salto en arco con
   *squash & stretch* y anticipación funciona con las poses actuales. Base: principios de animación de Disney
   (Thomas & Johnston, *The Illusion of Life*, 1981).
2. **Las emociones se muestran con movimiento + "emotes"** (iconitos sobre la cabeza: `!`, `?`, `…`, `z`, gotitas, corazón), no con poses nuevas.
   Por qué: sirven para las 3 especies y **conservan los cosméticos** (regla de `MASCOT_SYSTEM_1_0.md`), y un rig con expresiones no existe todavía.
   Es la misma técnica que usan juegos como *Animal Crossing* o *Stardew Valley*. Movimientos: temblar, agacharse, estirarse y saltar.
   Las poses nuevas (dormido y asustado) quedan como mejora, solo para el cerdito.
3. **Motor de escenas propio** en `dist/mascot/life.js`: estaciones + guiones con pasos (`go`, `pose`, `prop`, `emote`, `motion`, `wait`).
   Un elegidor decide la siguiente escena con este orden de prioridad: **clima fuerte > noche > intención del bloque > variedad**.
   Solo una escena urgente (el trueno) puede interrumpir a otra. Un único temporizador para toda la sala.
4. **La hora sale de una sola fuente**: se reutiliza `NexoAmbientEvents.select()` (`ambient/events.js`), que ya es determinista por día y bloque de 3 h.
5. **Clima real con Open-Meteo** (autorizado por Niquito el 3 oct 2026): API gratis, sin clave y sin cuenta.
   - **Ubicación fija: Santiago** (−33.45, −70.66). No se pide la ubicación del dispositivo. Más adelante podría haber un ajuste opcional, redondeado a ~10 km.
   - Se consulta como máximo cada 30 min, y solo con la pestaña visible. Se guarda en `localStorage`, con try/catch.
   - Sin internet → "despejado" (Nexo no inventa lluvia).
   - Módulo propio `dist/ambient/weather.js`: traduce el código WMO a `clear | cloudy | fog | drizzle | rain | storm`
     y escribe pesos `--w-rain` y `--w-storm` (0 a 1) para transiciones graduales, igual que `--w-*` de la luz.
     También escribe `body[data-nexo-weather]` solo para la mascota (la escena usa los pesos).
   - Consola (F12): `NexoWeather.preview('storm')` / `NexoWeather.stopPreview()`. Es clave, porque en Santiago llueve poco.
6. **La lluvia de la ventana se pinta por código**: una capa nueva en `ambientLayers` dentro de la ventana, con gotas animadas y cielo más gris.
   El relámpago es un destello suave y raro (nunca más de 3 por segundo, WCAG 2.3.1), y no aparece con reduced-motion.
   *Nota*: esto toca la escena del Inicio, pero solo como capa nueva; el arte original no se modifica.
7. **El libro es un objeto (prop) dibujado por código** (SVG en el JS) **con el color del ramo que estás estudiando**. Así la escena conecta con tu semestre real.
8. **Las anclas se calibran sobre el arte** (`point`, `foot`, `width`; más lejos = más chica), y se comprueban con `?debugScene=true`.
   Todas parten en la capa `mascot` (delante). Pasan a `mascotBack` solo con prueba visual.
9. **Gato y perro** hacen las mismas escenas; solo el cerdito tiene poses `read`/`ready`, y el resto usa `Idle` (`MASCOT_RIG_CONTRACT.md`).

## Cómo: 4 fases, cada una con ANTES/AHORA y tu aprobación

**Fase A — Estaciones y saltos**
1. Calibrar las 4 anclas (1440 y 390).
2. `life.js` núcleo: estaciones, salto en arco, giro, elegidor por hora, `cleanup`. Conectarlo con un cambio chico en `app.js`,
   y agregarlo a `tools/build-startup.cjs`; subir `?v=`.

**Fase B — Emociones**
3. Emotes por código y movimientos (temblar, agacharse, estirarse). Escenas de dormir y de cariño al tocarla.

**Fase C — Libros**
4. Escena "buscar un libro" con el libro del color del ramo.

**Fase D — Clima**
5. `weather.js` + Open-Meteo + caché + `preview()`.
6. Lluvia y relámpagos en la ventana.
7. Escenas "lluvia curiosa" y "susto de tormenta".

**Pruebas**: `tools/mascot-life-test.cjs` (elección determinista, prioridades, interrupción por trueno, traducción de códigos WMO, sin red → despejado)
+ `smoke-test.cjs`, `room-test.cjs` y `update01-test.cjs`.

## Reglas que debe cumplir (de `CLAUDE.md`)

- `prefers-reduced-motion`, `data-nexo-ambient-motion="reduced"`, `data-nexo-quality="low"` y `body.ambient-paused`:
  **no viaja ni tiembla** (cambia de estación con un fundido; los emotes siguen, quietos), y no hay relámpagos.
- Se pausa con la pestaña oculta.
- En móvil la sala se desliza (`.home-pan`): la mascota **no mueve el scroll** del usuario.
- La mascota no tapa los 8 objetos tocables.

## Criterios de aceptación

- [ ] Con la misma hora, día y clima, elige la misma escena (determinista).
- [ ] Viaja entre estaciones con el pie apoyado en cada ancla (1440 y 390).
- [ ] Saca un libro del color del ramo y lo lleva al escritorio.
- [ ] De noche duerme en el sillón.
- [ ] Con `NexoWeather.preview('rain')` llueve en la ventana; con `'storm'` hay relámpagos y la mascota se asusta y se esconde.
- [ ] Sin internet no se rompe nada y no llueve.
- [ ] Mantiene sus cosméticos durante todo.
- [ ] Reduced-motion: sin viajes animados, sin temblores ni relámpagos.
- [ ] Las pruebas rápidas y la prueba nueva pasan.

## Pendiente / ideas fuera de este cambio

- Poses dibujadas por código: cerdito dormido y asustado (mejora sobre los emotes).
- Hueco en la estantería cuando saca el libro (técnica de "plate" como las enredaderas).
- Sonido de lluvia suave y trueno lejano (`platform/audio.js`).
- Ajuste opcional "usar mi ubicación" para el clima.
- Caminata real / rig articulado (`MASCOT_RIG_CONTRACT.md`). Es trabajo de Opus.
- Reacciones al estudio (celebrar al consolidar un concepto, pensar al fallar; `controller.react` existe), cuando haya clase.
- Mascota con conducta propia en Aprender y Entrenar.
