# Tutorial de Nexo (SPEC en diseño, 11 oct 2026)

Estado: diseño completo (SPEC, GUION, FRASES) y **Grimorio v3 en pixel art aprobado** (`tools/tutorial-pixel/build_grimorio.py`). Código del tutorial: sin empezar.

## Qué

Un tutorial guiado por **el Grimorio**, un personaje en pixel art, que explica toda la app mientras la exploras. Parte con la **elección de la mascota inicial**.

## Decisiones (respondidas por Niquito)

**Guía**
- Personaje: **el Grimorio** (sin otro nombre), libro con ojos y boca.
- Humor: amistoso y bromista, tipo compañero de curso.
- Expresiones: básicas (feliz, sorprendido, pensativo, triste, enojado), cómicas (ojos en espiral, sudor, guiño, cara de "no me creo esto") y poses de explicar (señalar, levantar un dedo, abrir el libro, lista, mensaje importante).
- Texto: caja de diálogo estilo RPG pixel art con el nombre arriba; texto letra por letra.
- Sonido: bips al hablar + efectos de páginas/magia. Se puede silenciar en Ajustes.

**Pantalla y avance**
- No oscurece la app: el Grimorio va en una esquina y señala con una flecha.
- Los pasos avanzan con botón "Siguiente".
- No se adapta a lo ya usado: igual para todos.
- No responde dudas sueltas (solo pasos fijos).

**Cuándo y dónde**
- Aparece sola la **primera vez en cada sección**.
- Se repite desde **Ajustes → Tutoriales** (solo ahí, no hay botón flotante ni "?").
- Recorrido inicial completo (~6 min) por: Inicio y mascota, Clases y ruta de estudio, Juegos y grimorio, Organización y perfil.

**Recompensa**
- Completar el tutorial da **monedas**. Saltarlo no da monedas.

## Paso 1: elegir mascota inicial (idea de Niquito)

- Como el inicial de Pokémon: eliges **una** entre **átomo, matraz o slime**.
- Se **conserva** esa elección.
- Le pones un **nombre** a tu mascota, y ese nombre debe tener **relevancia** en toda la app (el Grimorio y los textos la nombran, etc.).
- Elección con **tres huevos distintos** (patrón de átomo, vidrio tipo matraz, gelatinoso): se intuye quién sale de cada uno.
- Nacimiento **con suspenso** (~10 s): el huevo tiembla y brilla, el Grimorio hace comentarios nerviosos y luego nace.
- La mascota elegida **no se puede cambiar** (decisión final, como un inicial de Pokémon).
- El nombre **tampoco se puede cambiar**: queda fijo para darle peso.
- El nombre aparece en: diálogos (Grimorio y mascota), Inicio y Perfil, logros y recordatorios ("Chispa está orgullosa de tu 6.5", "te extraña"), y en clases y juegos.
- Las tres mascotas tienen **personalidad distinta** al hablar y reaccionar (átomo serio, slime relajado, etc.), **sin ventaja de juego**.
- Solo **cuentas nuevas** pasan por este paso: la mascota y datos de la cuenta actual de Niquito quedan como están.

- Personalidades base: **átomo inteligente, matraz valiente, slime dormilón**.
- Nombre: botones de **nombres sugeridos** (+ campo libre), debe haber uno válido para avanzar.

## Orden del recorrido y cierre

- Orden: Mascota → Inicio → Clases → Juegos → Organización → Perfil.
- Cierre: **la mascota (por su nombre) entrega las monedas**, feliz.

## Otras decisiones

- Monedas: cantidad **mediana** (ajustar a la economía actual de la tienda).
- Si cierras la app a medias: **retoma donde ibas**.
- Incluye un paso para **configurar ramos, fechas de pruebas y tiempo disponible**, para que la ruta parta personalizada.
- Tono en lo serio (evidencia, olvido, errores): **humor + dato**: bromea, pero cada concepto de estudio cierra con un dato concreto.

## Visual y guion

- Aspecto del Grimorio: **libro antiguo de cuero** (tapa marrón gastada, broche dorado, páginas amarillentas), con la **cara en la tapa**; al hablar se abre un poco.
- Profundidad de cada paso: **qué hace + para qué sirve** (cómo ayuda a aprender o prepararse).
- La mascota **tiene sus propios pasos**: ella explica la parte de Inicio y mascota; el Grimorio explica el resto.

## Contenido por sección (todo lo marcado entra)

- **Inicio y mascota:** explica **todos** los objetos tocables del refugio, vestuario y tienda (la mascota lo cuenta).
- **Clases:** ruta al 7, evidencia vs sensación de dominio, repaso espaciado, errores como pistas (cada uno con dato/evidencia).
- **Juegos:** campaña PEP 1, desafíos, recompensas y monedas, por qué jugar ayuda a aprender.
- **Organización y Perfil:** calendario y prioridades, notas y labs, estadísticas y rangos arcanos, ajustes e inasistencias.

## Extras

- Fuera del tutorial: la **mascota** comenta cosas en la app; el **Grimorio** queda solo para el tutorial.
- Secciones nuevas a futuro: el Grimorio avisa "hay algo nuevo" y lo explica una vez.
- Bips: estilo **videojuego retro (8 bits)**, claros.
- Móvil (390): Grimorio **más chico** y el texto en una barra abajo.

- El Grimorio también reaparece **solo para avisar novedades** (secciones nuevas).
- Durante el tutorial se usan **datos de ejemplo** (no se guardan, no ensucian la cuenta). Los datos reales entran solo en el paso de configurar ramos y fechas.
- Repetir un tutorial desde Ajustes: **sin recompensa** (las monedas se dan una sola vez).
- Si lo saltaste y lo completas después desde Ajustes: **sí recibes las monedas** (una sola vez).

- Huevos de pascua: **varios** (si lo tocas mucho se enoja, etc.).
- Inactividad: **se duerme** (cierra los ojos y ronca; se despierta al tocar).
- Hay botón **Atrás** además de Siguiente.
- Indicador de avance: **barra de progreso**.

## Guion

Borrador en [GUION.md](GUION.md) (29 pasos, 8 bloques). Pendiente de corrección por Niquito.

## Decisiones del 12 oct 2026

- El Grimorio del tutorial es **un libro nuevo**, distinto del de la portada del grimorio de la app.
- Monedas: **solo premio final**, sin recompensa por sección. Cantidad mediana, a fijar mirando los precios de la tienda.
- Guion: se queda en **29 pasos**, sin acortar ni pasos opcionales (Niquito aún puede corregir tono y bromas).

## Diseño del Grimorio (12 oct 2026, conversado, sin dibujar aún)

- Tamaño: **igual que las mascotas** (píxel ×4, mismas rampas que el refugio, `tools/home-pixel/pixel.py`).
- Rasgos: libro antiguo de cuero con cara en la tapa + **barba blanca larga de viejo sabio** (sale del borde inferior de la tapa) +
  **manitas que salen de los lados** + **marcapáginas como lengua/cola** (cinta roja que se mueve al hablar).
  Sin bigote, cejas aparte ni gafas (las cejas se pueden dibujar como parte de las expresiones).
- Movimiento: **flota sobre un atril de magia**; se mece suave y las páginas se agitan. En móvil, más chico y el texto en barra abajo.
- Poses de la primera tanda: **señalar con flecha, abrir el libro, mensaje importante y dormido**. Las demás expresiones y poses
  (básicas, cómicas, lista) van en una segunda tanda.

**Hecho (12 oct): primera tanda dibujada** — `tools/tutorial-pixel/build_grimorio.py` → `dist/assets/tutorial/grimorio-v1.png`
(hoja transparente, 5 cuadros de 64×76: reposo, señalar, abrir, importante, dormido) y vista previa `grimorio-v1-preview.png`.
Esperando aprobación de Niquito. Falta la segunda tanda (expresiones básicas y cómicas, pose de lista), animar la boca al hablar
y el marco de diálogo.

**Retoque v2 (12 oct, pedido de Niquito: "me gustó pero lo veo muy simple")** — a redibujar en `build_grimorio.py`:
- Tapa: relieve y grabados, símbolo alquímico central (sin sumar runas al refugio), cuero más gastado.
- Silueta: menos cuadrada (páginas sueltas, cintas, hojas que cuelgan, esquinas dobladas).
- Atril y entorno: velas, tinta/polvo mágico, partículas alrededor.
- Cara: más detalle en ojos (brillo), arrugas, más expresiva.
- Viejo sabio: **remiendos, manchas de tinta y páginas con orejas** (sin gorro, gafas ni pipa).
- Movimiento (al animar): páginas que aletean, barba y marcapáginas que se mecen, letras/runas de tinta que salen del libro,
  parpadeo y cejas que se mueven.

**v2 dibujada (12 oct):** relieve y emblema de fuego en la tapa, remiendos con puntadas, manchas de tinta, hojas sueltas y páginas con orejas,
cinta azul, brillo en ojos, bolsas y mejillas, velas en el atril y partículas de tinta. Esperando aprobación de Niquito.

**Retoque v3 (12 oct, Niquito: "mucho mejor pero aún hay algo"):** no convencen **barba, cara y atril**; en conjunto está **demasiado recargado**.
Cambios pedidos: **libro más redondeado y grueso** (tapa abombada, lomo curvo, esquinas suaves) y **ojos más grandes y brillantes**.
Plan: bajar detalles chicos (menos partículas y remiendos, un solo foco por zona), barba con mechones y volumen,
atril más proporcionado al libro y menos genérico.

**v3 dibujada (12 oct):** tapa abombada con esquinas suaves y lomo curvo, ojos grandes con iris turquesa y dos brillos, barba de 3 mechones
con sombra azulada, atril nuevo (tapa de madera con canto de latón, paño mágico con flecos, patas) y menos detalles (un remiendo,
sin hojas sueltas arriba ni cinta azul, 4 partículas). Hoja de 5 poses de 68×76. **Aprobado por Niquito (12 oct).**

**Segunda tanda dibujada (12 oct):** `build_grimorio.py` ahora también genera `dist/assets/tutorial/grimorio-hablar.png` (+ `.json` con el orden):
15 poses/expresiones × 3 cuadros de boca (cerrada, media, abierta), cuadros de 68×76. Poses: reposo, senalar, abrir, importante, feliz, sorprendido,
pensativo, triste, enojado, espiral, sudor, guino, nocreo, lista, dedo. `dormido` sigue en `grimorio-v1.png`. Vista previa: `grimorio-expresiones-preview.png`.
Marco de diálogo: `tools/tutorial-pixel/build_marco.py` → `marco-dialogo.png` (48×48, 9-slice con esquinas de 12), `marco-nombre.png` (36×16, esquinas de 6)
y `flecha-siguiente.png` (2 cuadros de 10×8). Esperando aprobación de Niquito.

**Huevos dibujados (12 oct), esperando aprobación:** `tools/tutorial-pixel/build_huevos.py` → `dist/assets/tutorial/huevo-atomo.png`, `huevo-matraz.png`, `huevo-slime.png`
(hojas de 9 cuadros de 56×64: reposo, temblor ×2, brillo, grieta ×3, estallido, cáscara vacía). Átomo = azul noche con órbitas y protones sobre aro flotante;
matraz = vidrio con líquido verde sobre soporte de latón; slime = gelatina verde-amarilla con núcleo y burbujas sobre una poza. La mascota que nace sale del dibujo real
(`dist/mascot/pixelmascotas.js`). Vista previa: `huevos-preview.png`.

**Tramo 1 programado (12 oct):** `dist/tutorial/tutorial.js` + `tutorial.css`, ruta de **prueba** `#/tutorial` (carga perezosa, sin bundle). Cubre los pasos 1–10 del guion:
despertar del Grimorio, elegir huevo (ficha al tocar), confirmación, nacimiento de ~11 s con suspenso, nombre (sugeridos, 2–12 caracteres), confirmación y presentación de la mascota.
Motor: texto letra por letra con boca animada y bips 8 bits, Siguiente/Atrás, barra de progreso, retoma donde ibas, escala x4/x2. **No toca** `state.mascot` ni monedas todavía.
Skill: `.claude/skills/nexo-tutorial`.

**Tramo 2 programado (12 oct):** pasos 11–14 del guion (refugio, 8 objetos, vestuario/tienda, dato del espaciado) en `tutorial.js`. La mascota habla; el escenario `refugio`
lee fondo, objetos y ancla de la mascota **en vivo** desde `NexoHomeScene.getProfile()` (no se tocó `home-scene.js` ni se copiaron coordenadas). En el paso "Toca los objetos"
hay que tocar los 8 (contador x/8, se guarda en `seen`) para habilitar Siguiente. Probado en el navegador de Claude (8/8 y avance). Falta tu visto bueno.

**Tramo 3 programado (12 oct):** pasos 15–18 (Clases) como paneles ilustrados (`scene: 'panel'`, HTML simple en `step.panel`): ruta al 7, releer vs responder (Roediger y Karpicke, 2006), repaso espaciado (Cepeda et al., 2006), errores como pistas. Las dos citas son estudios reales; falta que Niquito confirme el texto.

**Tramo 4 programado (12 oct):** pasos 19–22 (Juegos) como paneles: campaña PEP 1, desafíos, monedas, dato de recordar sin mirar. Texto de los desafíos ampliado un poco respecto al guion ("retos cortos con premio"); a confirmar.

**Tramo 5 programado (12 oct):** pasos 23–26 (Organización y Perfil) como paneles: calendario y prioridades, notas y labs, estadísticas y rangos arcanos, ajustes e inasistencias. Faltan el paso 27 (configurar ramos y fechas) y el cierre con monedas (28–29).

**Guion completo programado (12 oct):** pasos 27–29. Paso 27 = panel con dos enlaces a las pantallas que ya existen (#/planner/calendar y #/profile); el tutorial retoma donde quedaste al volver a #/tutorial. Paso 28 = la mascota entrega **+150 ⚛** (decidido por Niquito; en la prueba es solo visual). Paso 29 = cierre del Grimorio. Queda solo la conexión real.

**Conexión real hecha (12 oct):** `state.tutorial = {status: pending|skipped|done, rewarded}` en `app.js` (defaultState + normalizeState: saves con progreso previo quedan como `done` y sin premio).
- Cuenta nueva (`pending`): el Inicio redirige solo a `#/tutorial` (no en navegadores automatizados: `navigator.webdriver`). Los huevos guardan `state.mascot.kind/name` al confirmar el nombre (definitivo). **Salir** = `skipped`; terminar = `done`.
- **Premio:** +150 ⚛ al llegar al paso del saco, una sola vez (`rewarded`). Con cuenta en la nube **no** se da ni se muestra el paso (el saldo viene de la nube; a decidir). Repetir desde Ajustes → Tutoriales (`#/tutorial`, panel nuevo en `renderSettings`): salta los pasos de elegir mascota, usa la real y solo premia si nunca lo cobraste.
- `#/tutorial/test` = la prueba de antes (sin guardar nada). Avance real en `localStorage['nexo.tutorial.v1']`.
- Filtro de nombres: palabras ofensivas por fragmento o exactas (ignora tildes y cambios tipo "l33t"); lista corta en `tutorial.js`, ampliable.

## Pendiente
- Aparición «primera vez en cada sección» (Clases, Juegos, etc.) y avisos de secciones nuevas: no hecho.
- Decidir qué pasa con el premio en cuentas con nube. Probar en móvil (390). Aprobar el tono del guion.
- Revisar el filtro de nombres (palabras no permitidas) y los datos de estudio del guion.

- Aprobar la segunda tanda (expresiones, boca, marco).

- Banco de frases de las mascotas y reglas del nombre: borrador en [FRASES.md](FRASES.md) (12 oct). Falta que Niquito corrija el tono.
- Banco de frases del Grimorio: ya está dentro del [GUION.md](GUION.md).
- Confirmar las monedas. **Propuesta: 150 ⚛.** Los 14 accesorios cuestan 60–260 ⚛ (`PRICES` en `dist/mascot/home-pet.js`, precios de ejemplo
  aún no definitivos). 150 alcanza para uno de rango medio (bufanda, lupa, monóculo) pero no para los caros (corona 260, sombrero 200),
  así que el premio se siente bien sin romper la economía. Si Niquito cambia los precios, se ajusta.
- ✅ Paso 12 del guion ya tiene los 8 objetos tocables reales (ventana, báculo, sillón, mapa, pergamino, estantería, globo, escritorio).
- Diseño de pixel art del Grimorio (sprites y expresiones) con `nexo-pixel-art`.
- Skill propia `nexo-tutorial` cuando se implemente.
- Conexión con el sistema de mascota existente (`dist/mascot/`, skill `nexo-mascota`) y con el Perfil.
