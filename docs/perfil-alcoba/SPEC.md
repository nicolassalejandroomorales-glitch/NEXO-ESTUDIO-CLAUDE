# Perfil — tarjeta de jugador (reemplaza la "alcoba")

Estado: implementado el 17 oct 2026 (falta aprobación de Niquito y commit). La alcoba se borró del código.
Historia: se probó una alcoba pixel con objetos tocables y paneles; a Niquito no le gustó (ruidosa, complicada, "rígida"). Se descarta entera.

## Qué
`#/profile` = una **carta coleccionable** pixel, simple y clara, con tu mascota, rango, racha e insignias. Debajo, 3 botones grandes. Sin escena caminable, sin objetos tocables, sin paneles flotantes.

## Decisiones (Niquito)
- Sin 3D, sin habitación. Estilo pixel con la paleta del refugio (madera cálida, dorado, papel, hiedra), poco ruido visual.
- La carta lleva: **mascota grande con nombre** (con su vestuario), **rango arcano**, **racha y tiempo de estudio** (como esfuerzo, no dominio) e **insignias/logros**.
- Carta coleccionable: marco dorado, papel, mascota al centro.
- Debajo, 3 botones: **Vestuario · Estadísticas · Ajustes**. Cada uno abre su pantalla pixel simple (kit de Organización: pergamino + marcapáginas).
- **Mascotas no gratis**: ya está `state.mascot.owned`; en Vestuario las que no tienes salen bloqueadas (🔒 "En la Tienda"). Falta que la Tienda las venda (chat economia).
- Reacciones de la mascota (`mascot/reacciones.js`, ya hecho): prueba cerca, nota, regreso, racha. En la carta salen como un globito.

## Cómo (borrador)
1. Arte: carta en `tools/perfil-carta/` (script Python reproducible con `tools/home-pixel/pixel.py`) → `dist/assets/perfil/`. Marco + fondo; la mascota, rango e insignias se pintan encima con canvas/HTML.
2. `renderProfile` en `app.js`: carta + 3 botones; Estadísticas y Ajustes se mantienen, Vestuario reemplaza "Mascota".
3. Móvil (390): carta arriba, botones apilados.
4. **Se borra** lo de la alcoba: `habitacion.png`, el objeto `profile` de `world/torre-mundo.js/.css`, `build_room` de `build_torre.py` y su prueba/skill. (Regla de orden y limpieza.)

## Criterios de aceptación
- A simple vista se entiende en 3 segundos: quién eres, tu rango, tu racha.
- Se ve bien en 1440 y 390; sin horizontal scroll.
- Las 3 secciones siguen alcanzables; `node tools/run-tests.cjs` pasa.

## Hecho
- Carta pixel (`tools/perfil-carta/build_carta.py`): cinta con el nombre, ventana de la mascota con rincón del refugio, banda de rango con llama, placas de racha y minutos, 6 insignias (se apagan si aún no las tienes: racha 3 y 7, 10 horas, clase dominada, desafío cobrado, vestuario puesto).
- Rango de la carta = el más alto entre los conceptos (`NexoArcaneRanks.forState`); "Sin rango" si el motor no cargó.
- Se borró la alcoba: `habitacion.png`, `build_room`, objetos `profile` de `torre-mundo.js/.css`, CSS de `.profile-room-header`.

## Pendiente
- Mirar la carta con tus ojos en 1440 y 390; ajustar colores, textos o insignias.
- Tienda: comprar mascotas y agregarlas a `mascot.owned` (precio en el chat economia).
- Emblemas de rango e insignias: definir cuáles y su arte.
- La nota reciente solo se detecta si el componente tiene `date`.
