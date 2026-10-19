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

## REDISEÑO: recorrido por la app real (14 oct 2026, pedido de Niquito)

**Problema:** hoy el tutorial es una escena aparte con paneles de ejemplo. Niquito quiere que el Grimorio **explore la aplicación de verdad**: que te lleve a cada pantalla real y te explique lo que hay ahí.

**Decisiones (Niquito, 14 oct):**
- **Estilo mixto:** «foco + Siguiente» en casi todo (el Grimorio navega a la pantalla real, oscurece el resto y resalta con un halo el botón o tarjeta que explica) y **«hazlo tú»** solo en 3–4 momentos clave (esperar el toque real: abrir una clase, tocar un objeto del refugio, abrir el calendario).
- **Inicio igual:** se mantiene la escena de huevos, nombre y nacimiento; justo después el Grimorio sale a recorrer la app real.
- **Profundidad:** solo lo principal. 5 pantallas (Inicio, Aprender, Juegos/Entrenar, Organización, Perfil), 2–4 cosas resaltadas en cada una. ~4–5 min.
- Los objetos del refugio **nunca bloquean** el avance (ya hecho).

**Cómo (propuesta, a confirmar leyendo el código real):**
- Motor nuevo `dist/tutorial/recorrido.js` (carga perezosa, como `avisos.js`): lista de pasos `{ ruta, objetivo (selector CSS), texto, pose, accion? }`. Hace `routeTo(ruta)`, espera a que exista el objetivo, lo resalta (halo + fondo oscurecido con recorte) y coloca al Grimorio en la esquina más cercana sin taparlo. Si el objetivo no existe, lo salta sin trabarse.
- Selectores reales a usar (verificar): barra de navegación `.nav-btn[data-route=home|learn|train|games|profile]`, botones de cabecera (Bitácora/calendario, monedas, Tienda), objetos tocables del refugio (`NexoHomeScene`), tarjetas de cada pantalla.
- Reutiliza los textos y datos del GUION (con su evidencia) pero cada uno **atado a algo visible**.
- Móvil (390): barra de texto abajo; el halo sigue la barra de navegación móvil.
- Los avisos por sección (`avisos.js`) siguen igual; se reemplazan los paneles falsos (pasos 14–27) por este recorrido.

**Audio sincronizado (pedido explícito):** hoy hay un blip por letra a ~28 ms y se solapan. Cambiar a: **un blip por cada letra visible, con duración menor que el intervalo y programado con el reloj de audio** (no con `setTimeout`), pausa más larga en `. , ? !` (sin sonido, como Undertale), y el mismo ritmo para la boca y el salto del Grimorio. Probar que el sonido empieza justo cuando aparece cada letra y que termina cuando termina el texto (también al saltar el texto con clic).

**Criterios de aceptación:** el recorrido pasa por las 5 pantallas reales y resalta elementos que existen; los 3–4 «hazlo tú» esperan el toque real y tienen salida si no pasa nada en ~10 s; nunca queda trabado; funciona en 1440 y 390; el audio coincide con las letras; se puede salir y repetir desde Ajustes → Tutoriales.

## Ajustes tras probarlo (14 oct 2026, esperando aprobación de Niquito)
- **Objetos del refugio**: ahora brillan (borde dorado, pulso y estrella ✦; verde con ✓ al tocarlos) y el botón **ya no bloquea**: dice «Seguir (faltan N)» y se puede avanzar sin tocarlos todos.
- **Voz del texto** (estilo videojuego): un blip por letra, tono al azar en escala pentatónica, más grave en el Grimorio; suena **por defecto** (antes dependía del ajuste de sonido, que viene apagado). Botón ♪ arriba para silenciar (se recuerda en el navegador).
- **Grimorio con más vida**: flota y respira siempre, salta al empezar cada palabra, rebota al cambiar de pose. Se apaga con «reducir movimiento».

## Para terminar el tutorial (14 oct 2026)

Niquito: «el tutorial ya está súper bueno»: se da por **aprobado el tono, la segunda tanda del Grimorio (expresiones, boca, marco) y los 150 ⚛**. Solo se cambia algo si él lo pide. Ya hecho: guion de 29 pasos, conexión real, avisos por sección y novedades, revisión en móvil (390).

**Falta (en este orden):**
1. **Premio en cuentas con nube** (única decisión abierta). Hoy se omite porque el saldo viene de la nube y `CLAUDE.md` prohíbe tocar cloud sin permiso. Opciones para preguntarle con `AskUserQuestion`: (a) dejarlo omitido; (b) darlo solo en local y marcarlo `rewarded`; (c) pedirle permiso para tocar la nube. Recomendado: (b) si no implica tocar Supabase.
2. **Revisión final en 1440 y 390** de punta a punta (`#/tutorial/test`, una cuenta nueva simulada y una que salta el tutorial), con una sola captura al final.
3. **Filtro de nombres y datos de estudio** del guion: leerlos una vez y confirmar que no hay datos dudosos (cada dato con su fuente).
4. **Limpiar este SPEC**: quitar pendientes viejos ya resueltos y dejar solo lo que falte.
5. **Cierre**: skill `nexo-cierre`, commit, push y republicar el Artifact (ver `CLAUDE.md`, sección «Dónde se ve la app»).

**Criterios de aceptación:** cuenta nueva ve el tutorial sola; elegir mascota y nombre se guarda; el premio se da una sola vez (o la decisión de nube queda escrita); saltarlo no da monedas; Ajustes → Tutoriales lo repite sin premio; `npm test` sin fallas nuevas.

## Inicio mágico (18 oct 2026, crítica del 15 oct; aprobado por Niquito: "hazlo", capas y partículas)

**Qué:** el tutorial "se ve como PNG que se mueve" y el fondo azul liso no gusta. Se rehace en este orden (una etapa por vez, cada una se prueba y se aprueba):
1. **Fondo mágico (hecho, esperando aprobación):** `dist/tutorial/magia.js` (carga perezosa; lo monta `tutorial.js`). Un canvas de baja resolución (1 px = 3 de pantalla, escalado pixelado) detrás de todo el tutorial:
   círculo de transmutación con runas inventadas (dos anillos que giran en sentidos contrarios), luz cálida que respira, estrellas, luciérnagas, polvo, runas que suben, hojas y enredaderas en las esquinas.
   Fondo base ciruela/verde oscuro (sin azul). `NexoMagia.mount(el).pulse()` hace un destello: se usa en el estallido del nacimiento.
   Respeta "reducir movimiento" (un solo cuadro quieto), se pausa con la pestaña oculta y se apaga solo al salir.
2. **Altar con velas (hecho, esperando aprobación):** la vela del arte ya solo trae la mecha; las llamas son `dist/assets/tutorial/llama.png` (4 cuadros de 3×8, `tools/tutorial-pixel/build_llama.py`) y parpadean por cuadros con ritmo distinto en cada vela. Encima, una luz cálida pulsa (mezcla `screen`). Se arma en `tutorial.js` (dos `<i class="tut-llama">` dentro del Grimorio) y `tutorial.css`. Se quitó del arte el brillo naranja fijo de las velas.
3. **Aura del Grimorio (hecha, esperando aprobación):** `NexoMagia.aura(grimEl)` en `magia.js`: un canvas alineado al píxel con el sprite (68×76 + margen) con 6 runas en órbita alrededor del libro (se apagan al pasar por detrás, con estela), chispas de tinta y hojitas que salen por arriba, y luz que respira. Se enciende al hablar (`talk`) y da un chorro al cambiar de pose (`burst`); en `tutorial.js`, dentro de `say`/`finishType`/`drawGrim`. Sin «reducir movimiento» no se monta.
   **No se separó el libro del altar en el arte** (decisión técnica): `dist/cuentas/entrada.js` reutiliza el mismo sprite `.tut-grim` y se habría roto. Si más adelante quieres piezas sueltas (barba que se mece, páginas que aletean), hay que rehacer las hojas en `build_grimorio.py` y avisar al chat de Cuentas.
4. **Nube de diálogo con vida (hecha, esperando aprobación):** el borde respira con brillo dorado (`drop-shadow` que pulsa), cada frase entra con un «pop» elástico, cuatro chispas en cruz titilan en las esquinas, sube una chispita dorada al empezar cada palabra y cada letra nueva aparece con destello (`.nl`). Todo en `tutorial.css` / `say()` de `tutorial.js`; se apaga con «reducir movimiento». Como `entrada.js` reutiliza el CSS, su nube también brilla, pero sin chispas (no las crea).

**Fuera de esta tanda (después, uno por uno):** voz/sonido del mago, texto con personalidad y el salto de pantalla hacia arriba, huevos con textura, la mascota hablando con su personalidad y el dab, y el recorrido por la app real (modular por secciones).

**Criterios (etapa 1):** en 1440 y 390 el fondo se mueve sin tapar ni ensuciar el texto; no hay azul liso; no baja de ~50 fps; con reducir movimiento queda quieto; `npm test` sin fallas nuevas.

## Huevos y mascota (18 oct 2026, hecho, esperando aprobación de Niquito)

- **Huevos vivos:** `dist/tutorial/huevos.js` (`NexoHuevos.attach(huevo, kind)`) pone un canvas pixelado encima de cada huevo: átomo = electrones con estela en sus órbitas; matraz = burbujas que suben, revientan y se escapan por arriba; slime = gotas gelatinosas, gotitas que caen y el huevo se estira como gelatina. Todos con destellos en cruz. Al pasar el cursor (o enfocar) se agitan: más partículas y el huevo vibra. Sin «reducir movimiento» no se monta.
- **Nacimiento:** la luz dorada se escapa por las grietas (`level` 1→3 sube con cada fase), y en el estallido: trozos de cáscara con gravedad, chispas, dos ondas de choque y `NexoMagia.pulse()`.
- **Dab + grito por especie:** al nacer, la mascota hace el dab (`arm: 'dab'`, ya existía en `armPose`) y da su grito: átomo «¡EUREKA!…», matraz «¡BLUP!…», slime «…bluuu». Cada especie tiene timbre propio en `beep` (átomo seco y cuadrado, matraz burbujeante con tono que sube, slime blando con tono que cae).
- Probado en el navegador (huevos, grietas, estallido, grito y dab); falta revisarlo en móvil (390) y que Niquito lo apruebe.

## Voz y texto del Grimorio (18 oct 2026, aprobado por Niquito)

- **Voz:** `vozGrimorio` = blip grave y hueco por letra (pulso 25 %, ~140 Hz, tono casi fijo). Se descartaron guitarra/libro viejo, campanitas, tintineo y murmullo. Las mascotas conservan su timbre.
- **Texto:** tono misterioso y poético con humor. Marcas: `*palabra*` brilla, `~` susurro, `^` temblor; pausas más largas en `…` y `.`.
- **Salto al apretar Siguiente (revisado en 390, 18 oct):** el scroll nunca se movía (`scrollY` = 0), pero el botón Siguiente se desplazaba hasta ~30 px entre pasos y la nube crecía línea a línea mientras se escribía. Arreglo en `say()` de `tutorial.js`: se reserva el alto del texto completo (`altoTexto`, solo crece). Resultado: en los 14 pasos con panel el botón queda fijo. Queda un cambio de ~100 px en el paso del nombre (por el formulario), que es otra pantalla.

## Recorrido por la app real (18 oct 2026, primera sección hecha, esperando aprobación de Niquito)

- **Motor modular:** `dist/tutorial/recorrido.js` + `recorrido.css` (carga perezosa desde `tutorial.js`). `SECCIONES` = `{ ruta, pasos: [{ sel, pose, texto }] }`. Lleva a la pantalla real, oscurece el resto con un halo dorado (recortado a la pantalla, porque los carteles del Inicio son más altos que ella), y el Grimorio explica en un globo (arriba o abajo según dónde esté el objetivo). Si un `sel` no existe se salta; «Atrás», «Siguiente» y «Salir».
- **Primera sección: Inicio** (reloj, próximas pruebas, tu día, continuar). En `STEPS` es el paso `rec-inicio` (`recorrido: 'inicio'`); al terminar o salir vuelve a `#/tutorial` y sigue donde iba. `app.js`: `tutorialDue` no te manda de vuelta al tutorial mientras `NexoRecorrido.active`.
- **Segunda sección: Aprender** (`rec-aprender`, reemplaza el paso de panel «ruta al 7»): marcadores de ramos, índice del ramo y nota de cómo se estudia.
- **Tercera sección: Juegos** (`rec-juegos`, reemplaza los paneles falsos «campaña» y «desafíos»; hoy solo la campaña está lista, las otras máquinas dicen «Próximamente»: el texto lo dice honesto).
- **Cuarta sección: Organización** (`rec-organizacion`, reemplaza los paneles «calendario» y «notas y labs»): pestañas del estudio de planos, plan del día y «lo que viene».
- **Quinta sección: Perfil** (`rec-perfil`, reemplaza «rangos» y «ajustes»): compañero, rango arcano y botones de Vestuario/Estadísticas/Ajustes. Con esto ya no queda ninguna de las 5 pantallas en panel falso (quedan los paneles de evidencia/espaciado/error con sus estudios, que son dato, no pantalla).
- Probado en 390 (Inicio y Aprender: pasan los pasos, el halo queda sobre el objetivo y se vuelve al tutorial). Falta: revisar Juegos/Organización/Perfil en 390 con captura, voz por letra y «hazlo tú».
- **Voz por letra (18 oct):** el globo escribe el texto letra por letra con el blip del Grimorio (`opts.voz` = `vozGrimorio` de `tutorial.js`), la boca se mueve y tocar el texto lo completa.
- **Rehecho sobre el Artifact (18 oct):** Aprender es ahora el *Sótano de los Cristales* (`.sotano-stage`, `.sotano-pad`) y Juegos la sala con 3 máquinas y un portal, todo «Próximamente» (`.torre-scene`, `.games-grid`).
- **«Hazlo tú» (18 oct):** un paso con `toca: true` deja pasar los toques solo al objetivo (el resto se bloquea) y avanza solo al tocarlo; «Saltar» lo omite. Hoy lo usa Aprender (tocar *Avanzar*). Para sumar otro, usar un `sel` cuyo toque no cambie de pantalla.
- **Móvil (390, 18 oct):** los carteles del Inicio y «lo que viene» son más altos que la pantalla; el globo va abajo si el objetivo mide más del 60 % del alto y, si no, donde haya más espacio libre. Revisado Inicio, Aprender, Juegos, Organización y Perfil.

## Animación fluida del Grimorio (18 oct 2026, aprobado por Niquito: «hazlo»)

Pedido: movimiento de todo tipo, las 4 magias y pergamino vivo. Se hace en 3 pasos, de menos a más arte:

1. **Magia + pergamino + gestos (solo código, sobre el dibujo actual). HECHO el 18 oct, esperando aprobación de Niquito.**
   - **Aura según emoción** (`aura.mood(pose)` en `magia.js`): el resplandor y una runa de cada tres cambian de color suave según la pose (sorpresa violeta, enojo rojo, tristeza azul, alegría dorado cálido, duda verde agua).
   - **Humo** que sube detrás del libro y **brasas** que salen de las dos velas (las llamas por cuadros y su luz ya existían).
   - **Gestos por emoción** (`gesto(pose)` en `tutorial.js`, WAAPI sobre `translate`/`rotate`/`scale`): salto y estirón al sorprenderse, temblor al enojarse, hundirse al estar triste, dos saltitos al alegrarse, sacudida de «no lo creo», balanceo al pensar, pulso al enfatizar.
   - **Pergamino vivo:** la nube se desenrolla desde el centro en cada frase (rodillos arriba y abajo que se separan) y queda con sus dos rodillos. La tinta nueva ya brillaba (`tutLetra`).
   - Con «reducir movimiento»: sin gestos, humo ni desenrollado (quedan los rodillos quietos).
   - Probado en escritorio y en 390: gestos corriendo, aura que cambia por pose, pergamino que se desenrolla y rodillos sin desbordar la caja. Pendiente visto bueno de Niquito sobre cómo se ve el humo y las brasas.
   - Aviso aparte: en 390 el documento mide 389 px de ancho (el lienzo `.tut-egg-fx` de los huevos y/o la app se salen ~14 px); no lo causa esta animación. Revisarlo en el tema de los huevos.
2. **Cuerpo por capas — tanda 1 HECHA (18 oct), esperando aprobación de Niquito.** Decidido con él: empezar por barba + ojos + boca; la boca solo abre y cierra (3 estados); las 15 poses (+ `dormido`) se arman con capas y se borran las hojas viejas.
   - `build_grimorio.py` ahora saca 4 hojas: `grimorio-cuerpo.png` (libro, atril, velas, brazos y efectos, con el halo de luz), `grimorio-cara.png` (ojos, cejas, mejillas y nariz; columna 2 = parpadeo), `grimorio-barba.png` y `grimorio-boca.png` (3 columnas) + `grimorio-capas.json`. Cada capa lleva su propio contorno oscuro exterior.
   - `dist/tutorial/grimorio-vivo.js` las apila en un canvas 68×76 (orden: cuerpo, cara, barba, boca): parpadeo automático cada 2–5 s, barba que ondea con inercia en cortes de píxel entero (más la punta; se sacude con cada salto al hablar con `kick`), y boca por letra. Lo usan `tutorial.js`, `recorrido.js`, `avisos.js` y `cuentas/entrada.js`.
   - Borradas: `grimorio-hablar.png/json` y `grimorio-v1.png`. Con «reducir movimiento» no corre el bucle (solo se dibuja al cambiar de pose o boca).
   - **Tanda 2 HECHA (18 oct), esperando aprobación de Niquito:** brazos y accesorios como capas. `grimorio-cuerpo.png` se partió en `fondo` (atril, velas y halo), `manoI`, `manoD` (con el cartel si lo sostiene), `libro` (libro, páginas y marcapáginas) y `extras` (nubes, signos, estrellas, estela, zZ y chispas); lágrimas y sudor viajan con la `cara`. Orden de apilado: fondo → manos (detrás del libro, como el dibujo original) → libro → cara → barba → boca → extras.
   - Las manos oscilan cada una con su resorte y gesticulan al hablar (cada salto de palabra las impulsa hacia arriba); los extras flotan ±1 px. Todo en píxeles enteros.
   - **Tanda 3 HECHA (18 oct), esperando aprobación de Niquito:** `libro` se partió en `paginas` (cantos, página con oreja, mancha de tinta y marcapáginas; se prolongan por debajo de la tapa para que no queden huecos) y `tapa` (cuero, lomo, cinchas, esquineros, broche, remiendo y emblema). Orden: fondo → manos → páginas → tapa → cara → barba → boca → extras.
   - Animación: el canto y la oreja de las páginas ondean hacia afuera (0 a 2 px, más al hablar); la tapa se alza 1 px al abrir la boca y de vez en cuando «respira», y con ella suben cara, barba y boca (la «cabeza» del libro).
   - Falta (opcional): cuadros extra para 3 o 4 poses clave (hablar, sorpresa, enojo, aparecer) si Niquito los quiere después de verlo.
3. **Cuadros extra** solo para 3 o 4 poses clave (hablar, sorpresa, enojo, aparecer). Sesión aparte.

## Pendiente (ideas a futuro, no bloquean)
- Aparición y avisos ya hechos; las novedades nuevas se agregan en `NEWS` de `dist/tutorial/avisos.js`.
- Si Niquito cambia los precios de la tienda (`PRICES` en `dist/mascot/home-pet.js`), revisar que 150 ⚛ siga sintiéndose bien.
