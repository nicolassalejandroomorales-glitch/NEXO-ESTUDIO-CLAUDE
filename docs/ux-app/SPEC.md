# Kit de UI pixel art + Inicio + barra lateral

Tema: `docs/chats/pixel-ui.md`. Crítica de origen: `FEEDBACK-15OCT.md` y la del 17 oct ("el Inicio sigue sintiéndose básico o feo").
Estado: **implementado en la rama (17 oct 2026): kit, Inicio y barra lateral. Falta la aprobación visual de Niquito (ANTES/AHORA) y el merge.**

## Qué
Un kit de UI pixel art compartido (`tools/pixel-ui/`, scripts Python reproducibles → PNG en `dist/assets/pixel-ui/`) y su CSS/JS en `dist/design-system/`.
Se aplica primero al **Inicio** (carteles, reloj, barras) y a la **barra lateral**. Aprender, clases, tienda y juegos quedan para otros chats con este mismo kit.

## Decisiones (Niquito, 17 oct 2026)
1. **Material por función**: madera = estructura/marcos, latón = botones y esquinas, cristal con líquido = barras de progreso, pergamino = texto.
2. **Barra lateral**: se queda en computador como **riel de madera** con íconos pixel (Inicio · Aprender · Organización · Perfil), etiqueta al pasar el mouse. En móvil, misma barra abajo.
3. **Botón** (sensación): se hunde 2 px y rebota; destello de latón con 2-3 chispas al hover; sonido de clic físico suave (respeta silencio); una hojita brota en la esquina al hover.
4. **Tipografía**: fuente pixel propia (`pixel-text.js`) para todo lo corto (títulos, botones, números, etiquetas). Párrafos largos: una fuente pixel legible tipo pergamino (por elegir, con licencia libre y empaquetada local; si no hay una buena, se dibuja una segunda fuente propia).
5. **Decoración** de carteles y paneles: esquinas de latón con remache, sello de cera en el pergamino (uno distinto por cartel), hiedra y flores que cuelgan y se mecen, grabados tallados en la madera (vetas y muescas; **sin runas nuevas**).
6. **Animación**: los carteles entran bajando de la viga con rebote suave y siguen meciéndose; al abrir, el pergamino se despliega.
7. **Alcance**: kit + Inicio + barra lateral.

## Cómo (pasos)
1. `tools/pixel-ui/`: reutiliza rampas de `tools/home-pixel/pixel.py` y el marco 9-slice de `tools/reloj-pixel/build_reloj.py`. Piezas: marco madera 9-slice con esquinas de latón, botón (normal/hover/pulsado/desactivado), pergamino 9-slice, sello de cera ×3, barra de progreso de cristal (vacía/relleno), riel de la barra y 4 íconos (con estado activo), hiedra/flor colgante.
2. CSS del kit en un archivo nuevo `dist/design-system/pixel-ui.css` (variables `--pu-*`, clases `.pu-btn`, `.pu-panel`, `.pu-bar`); el JS de chispas/sonido en `dist/design-system/pixel-ui.js`. Los reemplaza `home-signs.css` donde se solapen (se borra lo viejo en el mismo cambio).
3. Aplicar al Inicio: carteles, reloj, botón "Continuar", barra de meta diaria.
4. Rehacer la barra lateral (en `app.js` solo el mínimo; estilos en el kit).
5. Probar en 1440 y 390 px, `node tools/build-startup.cjs`, `node tools/run-tests.cjs`, una captura ANTES/AHORA al final.

## Criterios de aceptación
- Ningún botón ni panel del Inicio ni de la barra usa gradientes CSS planos: todos con PNG 9-slice del kit.
- Texto corto en fuente pixel propia; párrafos legibles a 390 px.
- Hover/pulsado/desactivado visibles en cada botón; foco de teclado visible.
- Respeta `prefers-reduced-motion`, `data-nexo-ambient-motion="reduced"`, `data-nexo-quality="low"` y `body.ambient-paused`.
- Sin romper ganchos de `planner/avisos.js` y `platform/animation.js`; no se toca `dist/economy` ni `home-pet.js`.
- Pruebas rápidas pasan (torre-mundo-test sigue saltada).

## Hecho (17 oct)
- `tools/pixel-ui/build_ui.py` -> `dist/assets/pixel-ui/` (marco, pergamino, 4 botones, barra y líquido, sellos, hiedra, hojita, riel, íconos). Reemplaza `reloj-marco.png`.
- `dist/design-system/pixel-ui.css` (+ `pixel-ui.js`, dentro del bundle): `.pu-panel`, `.pu-paper`, `.pu-btn`, `.pu-bar`, `.pu-seal`, `.pu-ivy`, `.nav-ico`.
- Inicio: reloj con marco nuevo y botones de latón; 3 carteles con marco, pergamino, sello, hiedra, barra de cristal y entrada que cuelga de la viga con rebote.
- Barra lateral (248 px) y barra de celular: riel de madera, íconos pixel, letras pixel, botón hundido en la activa.

## Falta de este tema
- Fuente legible para párrafos largos (hoy siguen en la fuente normal; solo lo corto va en letras pixel).
- Grabados tallados extra en el marco (hoy solo vetas) y flores más visibles en la hiedra.
- Botones redondos de la cabecera (Bitácora, átomos, Tienda) aún sin kit.

## Pendiente (otros chats)
- Aprender (rehacer el grimorio) y "la biblioteca Nexo": preguntar a qué se refiere.
- Aplicar el kit a clases, tienda, juegos y perfil.
- Versión de computador del resto de pantallas.
- Transiciones entre pantallas con el lenguaje del grimorio.
