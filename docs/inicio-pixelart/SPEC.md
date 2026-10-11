# Inicio en pixel art (UPDATE 02 · refugio pixel)

## Qué
Rehacer todo el fondo del Inicio (el refugio) como **pixel art de verdad**, tipo Terraria / Stardew:
la misma temática (hojas, magia, madera, habitación del alquimista) y la misma distribución de la sala,
pero dibujado píxel por píxel con paleta propia, contornos y sombreado. Después se sigue con el resto de la inmersión.

## Decisiones (5 oct 2026, Niquito)
- **Real pixel art, no un filtro**: nada de achicar el arte actual y pixelarlo, ni pegar sprites sueltos encima.
  Cada material (madera, yeso, hojas, latón, vidrio, llama, libros) tiene su **rampa de colores** con cambio de tono
  (sombras frías y luces cálidas) y la luz sube o baja de escalón dentro de esa rampa.
- Resolución del arte: **418×235** píxeles de arte, mostrados ×4 (cabe en las coordenadas 1672×941 de siempre).
- `refugio-012.png` **se guarda intacto como respaldo**. El Inicio pasará a usar `refugio-pixel.png` como base (regla cambiada en `CLAUDE.md`).
- Se mantiene la distribución de la sala, así los 7 objetos tocables y las anclas de la mascota siguen sirviendo.
- Todo se genera con un script reproducible: `tools/home-pixel/` (Python + Pillow + numpy). Sin IA de imágenes.
- Primero una **muestra chica** (la esquina de la ventana con enredaderas y el farol). Si gusta el estilo, se hace la sala completa.

## Cómo
- `tools/home-pixel/pixel.py`: lienzo de (material, nivel), rampas de colores, dibujo con dithering Bayer,
  hojas de hiedra como plantillas hechas a mano y luz real de la ventana (proyecta los marcos) y del farol.
- `tools/home-pixel/muestra_ventana.py`: dibuja la muestra en `docs/inicio-pixelart/`.

## Criterios de aceptación
- Las hojas se leen como hojas una por una (contorno, cara clara, sombra, brillo), no como una mancha.
- La paleta es corta y coherente; no aparecen colores "sucios" de un filtro.
- Se ve bien a ×4 en desktop (1440) y en móvil (390, con la sala deslizable).
- Luz de día / tarde / noche sigue funcionando (pesos `--w-*`).

## Historial
- v1 (muy iluminada) → v2 (mucha magia, "demasiadas cosas") → **v3 aprobada** (5 oct): calma, ventana de madera con hoja
  abierta y cortina, runas talladas que respiran en los muebles, hiedra suave, pájaros. Inspiración de *ambiente*
  (no de diseños): Frieren, Mushoku Tensei, Dungeon Meshi.
- Sala completa: `tools/home-pixel/build_refugio.py` → `dist/assets/home-scenes/refugio-pixel.png` (96 KB) y vista previa
  `docs/inicio-pixelart/refugio-pixel.gif`. Objetos (px de arte): escritorio 2–100, estantería 104–168, aparador+globo 180–248,
  calendario 214–244×44–84, báculo ~276, sillón 318–380, mesita 386–410, mapa en el suelo 156–196×158–167.

- Sala v2 (5 oct, pedido de Niquito: "más verde, más mágico, paredes menos planas, más animación"): zócalo de paneles,
  piedra a la vista, grietas, guirnalda de hiedra en toda la viga, 2 maceteros colgantes, helecho, flores que brillan,
  túnica + sombrero de mago en un perchero (el báculo pasó a x≈304), velas flotantes, lucecitas que vagan y mariposas.
  Se mantienen tal cual: piso, ventana y runas (le gustan; no agregar más runas).

## Idea futura (Niquito, 5 oct): zoom por zonas
- Tocar una zona (ventana, sillón, alfombra…) hace zoom y la mascota interactúa ahí.
- Ojo: agrandar pixel art no agrega detalle. Cada zona con zoom necesita su **propia escena de detalle** dibujada
  a más resolución (mismo estilo, mismas rampas), con su ancla de mascota. Planificarlo como un cambio aparte.

## Pendiente
- [x] Muestra de la ventana → aprobación del estilo (v3).
- [x] Aprobación visual de la sala completa (v2, 5 oct: "súbela").
- [x] Nueva escena `refugio-pixel` en `home-scene.js` (por defecto), objetos tocables en su nuevo lugar, `image-rendering: pixelated`.
  Capturas en `capturas/app-desktop-dia.jpg` y `capturas/app-movil-dia.jpg`.
- [ ] **Animación dentro de la app**: hoy el fondo es estático. Exportar capas animadas (hiedra, llamas, runas, velas flotantes,
  lucecitas, pájaros, nubes, vapor, túnica) como hojas de sprites o dibujarlas en un `<canvas>`.
- [ ] Vista de la ventana de tarde y de noche en pixel (hoy de noche solo se oscurece todo y el cielo sigue de día).
- [ ] Mascota pixel (otro chat) sentada en el escritorio nuevo: revisar el ancla `desk`.
