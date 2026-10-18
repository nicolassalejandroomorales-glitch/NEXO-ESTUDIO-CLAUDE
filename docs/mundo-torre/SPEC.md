# Mundo de la torre: Entrenar + Juegos recorribles y la habitación del Perfil (11 oct 2026)

Pedido de Niquito: "que la app no se vea tan beta": mejorar Entrenar, Perfil y Sala de juegos con pixel art
que se pueda recorrer con la mascota. Que no quede todo tan "anti ambiental".

## Qué

1. **Un mundo de dos salas** (piso de la torre del alquimista), pixel art propio:
   - **Sala de prácticas** (= `#/train`): mesa de alquimia con caldero, frascos del bestiario, reloj de arena,
     estante de temas, mapa del curso y estandarte de la PEP.
   - **Arcade arcano** (= `#/games`): máquinas/mesas para Memory Lab, Error Hunter, Blitz y Boss Arena,
     y la puerta de la campaña **Camino a la PEP 1**.
   - Las une un **arco** con escalones. La mascota camina de una sala a otra y la pantalla cambia sola.
2. **Clic/toque donde ir**: tocas el piso o un objeto y la mascota camina hasta ahí. Tocar un objeto hace su acción.
3. **Perfil aparte**: su propia sala (la **habitación de la mascota**), no conectada al mundo. Cada objeto es una pestaña:
   armario = Mascota, escritorio con libreta = Notas, calendario = Inasistencias, vitrina de trofeos = Estadísticas,
   reloj de engranajes = Ajustes. La mascota camina al objeto de la pestaña abierta. De noche duerme en la cama.
4. Todo lo de antes sigue funcionando: los formularios, pestañas y botones quedan debajo de la escena (accesibles con teclado).

## Decisiones

- Estilo **torre del alquimista** (coherente con el refugio y el aula), rampas de `tools/home-pixel/pixel.py`. Sin runas nuevas.
- **La escena es parte de la página, como el refugio del Inicio** (pedido de Niquito, 11 oct): de borde a borde de la columna,
  pegada arriba, sin marco ni esquinas, con el título encima del arte y un fundido hacia el resto. Nada de "cuadrito".
- Mundo = un solo PNG ancho; una sala llena el ancho y la cámara sigue a la mascota (en celular la vista es más angosta).
- La escena se inserta sola (observa `#app`): **no se toca `training.js`**, y en `app.js` solo se conecta la Boss Arena / campaña.
- La mascota reutiliza `PixelVida` (agrega un modo `manual` chico: `walkTo`). Su posición se recuerda entre pantallas
  para que cruzar el arco no "salte".
- Los objetos del Entrenar **eligen el modo** del formulario (no empiezan solos): la decisión sigue siendo del estudiante.
- `prefers-reduced-motion` o "movimiento reducido": la mascota llega sin animar el camino.

## Cómo

- Arte: `tools/torre-pixel/build_torre.py` → `dist/assets/torre/mundo.png`, `habitacion.png` + `*.json` (objetos, piso).
- Código: `dist/world/torre-mundo.js` (escena, cámara, clics, objetos) y `dist/world/torre-mundo.css`.
- `dist/mascot/pixel-vida.js`: opción `manual` + `walkTo(x, y)`.
- Prueba: `tools/torre-mundo-test.cjs` (objetos dentro del arte, cada objeto con acción válida, rutas existentes).

## Criterios de aceptación

- En `#/train` y `#/games` se ve la sala con la mascota; tocar el piso la hace caminar; cruzar el arco cambia de pantalla.
- Cada objeto hace su acción (elige modo / abre juego / cambia pestaña).
- Perfil: ya NO es una habitación (17 oct 2026, ahora carta de jugador; ver docs/perfil-alcoba/SPEC.md).
- 1440 y 390 sin errores; pruebas en verde; ANTES/AHORA.

## Hecho (11 oct)

- Arte v1: `mundo.png` (780×150) y `habitacion.png` (360×150) + `torre.json` (18 objetos). Animado en la app: llamas, burbujas,
  pantallas, farolitos, portal y péndulo. De noche se oscurece; en la habitación se va a dormir a la cama.
- Escena de borde a borde en Entrenar, Juegos y Perfil. Cruzar el arco cambia de pantalla sin cortar la escena.
- Objetos → modo de Entrenar · máquinas "próximamente" · portal = campaña `games/pep1/` · pestañas del Perfil.
- `tools/torre-mundo-test.cjs` en verde; `npm test` 26/26. ANTES/AHORA: `docs/mundo-torre/antes-ahora.png`.

## Pendiente
- (Desde Aprender, 17 oct) El Sótano de los Cristales tendrá una **sala de Laboratorio** y una **Sala de entrenamiento** propias (`docs/aprender-pasillo/SPEC.md`): el laboratorio caminable sin página podría reengancharse ahí.

- Esperar aprobación visual de Niquito.
- La campaña (`games/pep1/index.html`) no tiene botón "Volver a Nexo" (anotado en el SPEC de juegos).

---

# Fase 2 · La torre (diseño conversado con Niquito, 11 oct 2026)

Niquito aprobó la v1 como bosquejo ("me gusta"), pero la ve **simple y básica** y quiere que el recorrido sea una pieza central de Nexo.
Todo lo de abajo salió de 4 tandas de preguntas; son decisiones suyas (salvo donde dice "decide Claude").

## Qué es

Una **torre de varios pisos** que se recorre con la mascota y que **refleja tu progreso real**. Mirar la torre = ver tu avance, no una barra.

## Decisiones

- **Propósito:** mundo que refleja el progreso. Lo que cambia, solo con **evidencia** (aciertos sin ayuda, transferencia, repaso; regla del
  motor, ver skill `nexo-motor`). Nunca por tiempo o racha. Lo cosmético no sube el dominio.
  - Frascos del bestiario (capturado = frasco lleno, suelto = inquieto) · plantas y luz por tema (olvidado según FSRS = se marchita/apaga hasta repasar)
    · trofeos y reliquias por rango arcano (0–5) · estanterías que se llenan de libros.
- **Pisos:** un piso por ramo (Orgánica II, Química Analítica, Fisicoquímica II…), cada ramo con su **mundo propio**.
  Cada piso tiene: aula (clases y misiones) · sala de prácticas (Entrenar) · laboratorio · sala de evaluaciones (simulacro PEP).
  - Comunes: **refugio (Inicio) = planta baja** · **arcade arcano = sótano** · **organización = estudio de planos** · **perfil/habitación = azotea**.
- **Subir y bajar:** escalera caminando (piso vecino) **y** ascensor arcano (saltos largos).
- **Menú de abajo:** sigue existiendo, pero **ves el viaje** (escalera/ascensor) y se puede saltar con un toque. Poca fricción.
- **Vista:** lateral con profundidad (como ahora), con **parallax** por capas; funciona en PC y celular.
- **Arte (los 4 problemas que Niquito marcó):** profundidad · detalle de objetos · luz · vida/animación.
  - **Resolución mixta:** fondos lejanos de píxel fino, primer plano y mascota de píxel grueso (el "sello" del refugio).
  - **Personalidad:** mezcla de *alquimista excéntrico* (notas, tazas, experimentos a medias, etiquetas a mano) con *naturaleza que invade*
    (hiedra, musgo, hongos que brillan). Cada rincón con una mini historia. **Sin runas nuevas.**
- **Mascota:** reacciona a lo que tocas, tiene **un poco de vida propia** (gestos y paseitos cortos, nunca cruza la sala ni cambia de lugar
  sola), te señala qué hacer hoy (objeto recomendado que brilla; tu error más urgente o el repaso que toca) y descubre cosas.
  **Sin culpa ni castigos** si no estudias.
- **Ambiente:** hora real · clima real (Open-Meteo, ya autorizado) · ambiente suave cuando se acerca la PEP (sin ansiedad) · estaciones y fechas.
- **Empezar:** una **sola sala de muestra** con la calidad nueva, antes de dibujar el resto. Niquito dejó la elección de la sala a Claude
  (decide Claude): **Laboratorio de Orgánica II** (es la que más muestra luz, detalle, vida y progreso). La siguiente muestra es el vestíbulo
  con escalera y ascensor (define cómo se siente "subir").

## Muestra pedida (imagen ANTES/AHORA)

- Mismo laboratorio en **3 estados de progreso** (vacío · a medias · completo) × **día / atardecer / noche**.
- Parallax y animaciones de vida **no se ven en una imagen**: se describen y se prueban en la app solo si Niquito aprueba el estilo.

## Orden de trabajo

1. Muestra del laboratorio (imagen) → aprobación de estilo.
2. Muestra en la app caminando (parallax + vida).
3. Vestíbulo: escalera + ascensor + viaje del menú.
4. Diseño de cómo se guarda el progreso del mundo y cómo se conecta con el motor (`docs/academic`): **conviene Opus** (decisión de arquitectura).
5. Piso de Orgánica II completo, con Aminas reflejado. Después, los demás ramos y los lugares comunes.

## Hecho (fase 2, 11 oct)

- Muestra del laboratorio: `tools/torre-pixel/build_lab_muestra.py` (+ `lab_base.py`, `lab_fondo.py`, `lab_frente.py`).
  Fondo fino 720×300 (×2) + medio/frente grueso 360×150 (×4). Luz por velas, faroles, hongos y haz de ventana.
  Imágenes: `docs/mundo-torre/muestra-lab-estados.png` (3×3) y `antes-ahora-lab.png`. **Aún no está en la app.**
- Progreso visible: libros, póster de grupos funcionales, frascos (bicho suelto = rojo inquieto), plantas (una marchita pide repaso),
  ecuaciones y pKa en la pizarra, guirnalda, faroles encendidos, reliquias (copa, esfera, medalla).

- **Paso 2 hecho (11 oct):** Niquito aprobó el estilo ("me gusta mucho"). El laboratorio es ahora la sala de **Entrenar** (`#/train`).
  `build_lab_muestra.py --app` → `dist/assets/torre/lab/` (vista por hora, fondo y frente por hora × estado, `lab.json`).
  Capas: vista por la ventana (parallax 0.8) · sala (1) · mascota · primer plano (1.3, tapa a la mascota). Animación en la app:
  burbujas, gotas del refrigerante, llamas, hongos y polvo en el haz. La hora sale de `body.dataset.nexoTime`.
  Estado **provisorio**: ejercicios de Aminas resueltos sin ayuda / total (<25 % vacío, <75 % a medias). Para probar: `?estado=0|1|2&hora=dia|tarde|noche`.
  Juegos sigue con el arcade v1 (su arco lleva a Entrenar).

## Pendiente (fase 2)

- Aprobar el laboratorio caminable.
- Decisión del chat Aprender (17 oct): el lab caminable **queda como lugar del mundo** (decorativo y de mascota); el lab de estudio es la sala de piedra del sótano. Falta darle página o entrada en la Torre.
- Paso 3: vestíbulo (escalera + ascensor + viaje del menú). Paso 4 (Opus): progreso real por objeto, que reemplace el provisorio.

- Aprobar el estilo de la muestra.
- Definir cuántas "etapas de progreso" tiene cada objeto (¿3 estados, o más finos?) y de qué evidencia sale cada una (paso 4).
- Ruta/URL de la torre (`#/torre`?) y cómo convive con `#/train`, `#/games`, `#/profile` (paso 3).
