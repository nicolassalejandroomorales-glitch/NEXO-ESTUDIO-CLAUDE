# Intro de la torre (tráiler dentro de la app) — 19 oct 2026

Reemplaza la intro narrada de texto (`dist/tutorial/umbral.js`, hecha hoy en el pulido): no era la visión de Niquito. Se edita ese mismo archivo (nada de `-v2`).
No es el MP4 de `docs/trailer/`; es una escena viva dentro de la app, antes de la pantalla de entrada/tutorial.

## Qué (visión de Niquito)
Solo la **cima de la torre**, en **pixel art detallado con sombras y volumen** (rampas de `tools/home-pixel/pixel.py`), rodeada de un **cielo estrellado enorme**. Todo con mucha animación.

**Acto 1: la noche (0 a ~25 s).** Torre apagada, sin luz. Tormenta eléctrica: lluvia, nubes que se mueven, rayos que iluminan la torre y el paisaje por un instante, estrellas que parpadean entre las nubes. Pocas frases dramáticas aparecen con los rayos y cuentan que el **último estudiante entró y nunca más volvió** (tono sombrío, sin humor).

**Acto 2: llegas tú (~25 a 45 s).** Aparece la indicación **"Mantén presionado"** (dedo/anillo que pulsa). Mientras mantienes, se acumula energía: chispas, vibración, brillo creciente en la ventana. Al soltar, estalla el despertar: la torre se llena de **runas, jeroglíficos y estelas**, y los cuatro elementos (**electricidad, fuego, hielo, tierra**) giran **todos juntos en espiral** alrededor de la torre. Cámara con **acercamiento final** a la ventana encendida y **fundido directo al refugio** (Inicio), sin pantalla intermedia.

## Decisiones
- Duración ~45 s. Siempre **saltable** con un toque (aviso discreto "Saltar").
- **Solo la primera vez** + botón para repetirlo en Ajustes. Con sesión nueva/limpia se ve; después no estorba.
- **Sonido sintetizado** con WebAudio (lluvia, truenos, viento, zumbido de energía, estallido, ambiente mágico). Sin archivos ni servicios externos. Respeta mute/volumen de Ajustes.
- Si no mantiene presionado: tras ~8 s la indicación se vuelve más visible; nunca se queda atascado (un toque largo o salto lo resuelve).
- Con «reducir movimiento»: imágenes fijas con fundidos, sin rayos intermitentes (seguridad fotosensible: máx. 3 destellos por segundo).
- Arte en archivos propios: hojas de sprites generadas con script reproducible `tools/umbral-pixel/` (Python) → `dist/assets/umbral/`. Animación por capas en canvas (nubes, lluvia, estrellas, estelas) para fluidez en celular; baja la cantidad sola si va lento (patrón de `sotano-fx.js`).
- Conexión: llamada a la intro desde donde hoy se invoca `umbral.js` + hook en `app.js` mínimo; el fundido llega al refugio.

## Cómo (por partes, una captura al final de cada una)
1. Arte base: cima de la torre con luz/sombra y cielo estrellado (script + PNG).
2. Tormenta: nubes, lluvia, rayos que iluminan, estrellas; frases del último estudiante.
3. Sonido sintetizado de la tormenta.
4. Mantener presionado: indicador, carga, estallido.
5. Despertar: runas, estelas elementales en espiral, acercamiento y fundido al refugio.
6. Ajustes: "Ver intro de nuevo"; solo primera vez.

## Criterios de aceptación
- Se ve solo la cima de la torre, en pixel art con sombras, y un cielo con muchas estrellas.
- Hay tormenta con lluvia y rayos con sonido; la torre empieza apagada.
- La indicación de mantener presionado es clara; soltar dispara el despertar.
- Aparecen runas y los 4 elementos en espiral; termina fundiéndose al refugio.
- Saltable siempre; ~45 s; fluida en 390x844 y 844x390; sin errores en consola.

## Hecho
- Paso 1 (19 oct): arte base con `tools/umbral-pixel/build_umbral.py` → `dist/assets/umbral/` (cielo, nubes-lejos, nubes-cerca, torre-oscura, torre-rayo, torre-despierta; 384x384 px de arte, nubes 384x200 repetibles). Vista previa: `docs/umbral/preview-arte.png`. La torre trae balcón con libro abierto y vela gastada (el último estudiante), hiedra, musgo y pararrayos.

## Pendiente
- Frases exactas del último estudiante (3 a 4 líneas): proponerlas a Niquito antes de fijar.
- Decidir si el sonido de lluvia continúa suave en el refugio (idea).
- Revisar encaje con la pantalla de entrada (`#/entrada`: Google o invitado), que hoy viene antes del tutorial.
