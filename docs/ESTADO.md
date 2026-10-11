# Estado de Nexo

Historial de lo hecho por tema. Lo lee Claude solo cuando necesita contexto de otro tema; el cierre de cada chat agrega aquí una línea con fecha (skill nexo-cierre).

## Al 3–5 oct 2026

- Base: UPDATE 01.2 (Sites v23) + Checkpoint 1. En Git desde el commit `f728d1e`.
- Hecho en Claude: vista de la ventana según la hora, noche coherente (sin manchas de sol, faroles encendidos),
  luz continua, 7 objetos tocables, báculo estelar y mapa pintados por código, llamas que titilan, estrella que se balancea y polvo en la luz.
- UPDATE 01.4 (cierre del Inicio): báculo v2, mapa envejecido, sala deslizable en móvil, 4 enredaderas que se mecen
  (`tools/home-leaves/`), iconos propios de Bitácora y Tienda. Ver `docs/update-01-4-cierre-inicio/SPEC.md`. Pendiente su aprobación visual.
- UPDATE 01.5 (grimorio): portada pintada por código (`tools/grimoire-cover/`), intro ceremonial de 2,3 s, reapertura corta,
  cierre al volver al refugio, cambio de página corregido y sonido de apertura. Ver `docs/update-01-5-grimorio/SPEC.md`.
- UPDATE 01.6: páginas decoradas por ramo (`tools/grimoire-pages/`), cambio de página con hoja curvada y sonidos sintetizados
  (`tools/grimoire-audio/`). Ver `docs/update-01-6-paginas/SPEC.md`.
- UPDATE 01.7: páginas llenas de dibujos, sonido suave e intro épica una vez por sesión. Ver `docs/update-01-7-grimorio-epico/SPEC.md`.
- **Clases borradas (4 oct 2026)**: se eliminaron los reproductores y el contenido de las clases (`amine-lesson.*`, `organic-studio.*`, `organic-pep1-3.js`, `organic-biomolecules.js`). Abrir cualquier tema muestra "Disponible próximamente". El catálogo de temas (`organic-manifest.js`, `data.js`) sigue. Siguen sin tocar: ejercicios generados desde el catálogo (`generatedExercises` en `app.js`) y el motor académico de Aminas (`dist/academic/*`); se decide caso a caso al rehacer cada clase.
- **Clases nuevas (4 oct 2026, hechas en la nube y unidas a master)**: aula inmersiva "torre del alquimista" en `dist/classes/` (`player.js`, `org-01.js`, `tower-art.js`, `classroom.css`), Aminas completo para la PEP 1 (misiones 2 a 8, 63 actividades verificadas), diapositivas reales del PPT y glosario. Crear otra clase: `node tools/new-class.cjs` (guía en `docs/clases-estructura/COMO_CREAR_UNA_CLASE.md`). Prueba: `node tools/classroom-test.cjs`. Reemplaza lo de "Clases borradas" de arriba.
- Pendiente del producto (lo más importante): **una clase completa que se sienta increíble** (Orgánica II → PEP 1 → Aminas → Basicidad),
  con corrección real y actividades variadas. Ver `docs/contexto/RESUMEN_OBJETIVOS_NEXO.md`.
- Arreglado: `tools/static-server.cjs` ya declara el MIME de `.svg`.
- **Mascota** (4 oct 2026, chat propio, `docs/mascota/SPEC.md`): se borraron cerdito/gato/perro, cosméticos, tienda vieja y Rive; átomos a cero una vez.
  **Mascotas elegidas (4 oct 2026): 3 criaturas alquímicas — átomo, matraz y slime** (`dist/dev/alquimicos.js`), dibujadas en **SVG por código con
  mucho detalle** (luz/sombra, materiales, etiquetas, burbujas) y animadas con **JS/CSS** (no Rive: Niquito lo descartó; animales y estilo cartoon
  también se probaron y rechazó). Cada SVG tiene partes con clase (`m-root`, `m-body`, `m-eye`…) y **ranuras de accesorios** (`m-slot`: cabeza, cara,
  cuello, mano). Demo en la sala: `/dev/mascota-sala.html`. Regla: nada de diseños "planos"; siempre volumen, material y detalle. Tienda y Mascota
  muestran "Disponible próximamente".
  **5 oct 2026: versión PIXEL ART** (`dist/dev/pixelmascotas.js`, demo `/dev/mascota-pixel.html`): sprites de 40×44 px de arte con las **mismas
  rampas y tamaño de píxel (×4) que el refugio pixel**; cada pose se re-rasteriza (nunca se estira la imagen). Mismas conductas, 14 expresiones,
  emotes (incluido "6 7") y 14 accesorios. La versión SVG queda de respaldo.
- **Inicio en pixel art** (5 oct 2026, chat propio, `docs/inicio-pixelart/SPEC.md`): el refugio se rehízo en pixel art de verdad
  (`tools/home-pixel/build_refugio.py` → `refugio-pixel.png`, 113 KB) y **ya es el Inicio por defecto** (escena `refugio-pixel` en
  `home-scene.js`; `?scene=refugio-012` abre el arte viejo). Le gustan mucho el piso, la ventana y las runas (no agregar más runas).
  Pendiente: capas animadas en la app (hoy el fondo es estático; la animación existe en el GIF), ventana de tarde/noche en pixel y zoom por zonas.
- **Juegos de Nexo** (3 oct 2026): chat nuevo dedicado. SPEC borrador en `docs/juegos/SPEC.md` (esperando decisiones de Niquito). Principio: los juegos deben alimentar
  el motor académico (evidencia, FSRS), no ser entretención suelta. Código nuevo en `dist/games/`.
- **Campaña "Camino a la PEP 1"** (4 oct 2026): `dist/games/pep1/` (abrir `http://127.0.0.1:8765/games/pep1/index.html`; `?todo=1` abre todos los jefes).
  3 guardianes que se desbloquean (Trimetilamina, Ciclobutadieno, Benceno malvado) + Rey Amonio final; el juego elige el desafío (conectar, ordenar,
  clasificar, ruta de síntesis, elegir, flecha) con preguntas de la pauta PEP 1 2025. Preguntas en `contenido.js`. Ver `docs/juegos-batalla/SPEC.md`.
  Base aprobada por Niquito (4 oct). En curso: música de combate por jefe, arenas "de jefe" y rediseño del Rey. Pendiente: conectarlo a `#/games`.
- **Bitácora viva** (5 oct 2026, chat propio, `docs/update-02-organizacion/SPEC.md` v2): diseño de organización, calendario, pruebas y notas
  en pixel art de madera (pestañas Hoy · Calendario · Pruebas · Notas · Avisos), avisos por urgencia en el Inicio, semana crítica (19–27 oct),
  notas en un solo lugar (frascos alquímicos) y mascota acompañando. Maqueta: `docs/update-02-organizacion/maqueta/`. **Solo diseño, sin programar**; esperando respuestas de Niquito.
