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

## 11 oct 2026 · Unión de ramas en master
- Unidas a `master`: Clases (Analítica, Fisiopatología, Orgánica II, FQ II, ejercicios infinitos con regla de calidad, Torre del Sauce, `netlify.toml`),
  Bitácora viva (diseño) y del prototipo de juegos solo `dist/games/prototipos/batalla-rey-amonio.html` + `docs/juegos-batalla/ENEMIGOS.md`.
- Subido lo que estaba sin subir en el PC: mascota pixel (six seven, dab), juego PEP 1 (arte/audio nuevos) y capturas.
- Reglas nuevas: `npm test` = `tools/run-tests.cjs` (encuentra las pruebas solo), `?v=` por hash (`tools/stamp-versions.cjs`), `docs/ESTADO.md merge=union`.

## 11 oct 2026 · Mascota pixel en la app (Fase 6)
- La mascota vive en el Inicio, barra lateral/móvil, Perfil › Mascota y Tienda (solo "Probar"); celebra al guardar sesión, duerme de noche y se pone nerviosa con tormenta. Motores en `dist/mascot/`. Detalle y pendiente (precios, oclusión, nube): `docs/mascota/SPEC.md`.

## 11 oct 2026 · Mundo de la torre (fases 1 y 2)
- Entrenar, Juegos y Perfil tienen escena pixel **de borde a borde** (como el Inicio) donde la mascota camina con clic/toque; cada objeto hace algo (elige modo, abre juego, cambia pestaña). Perfil = habitación de la mascota; Juegos = arcade v1 con portal a la campaña PEP 1.
- Entrenar = **Laboratorio de Orgánica II** con calidad nueva: capas con parallax, luz por hora real, animaciones y 3 estados de progreso (provisorio). Diseño de la torre completa (pisos por ramo, escalera + ascensor) en `docs/mundo-torre/SPEC.md`.
## 12 oct 2026 · Tutorial (diseño + Grimorio)
- Diseño cerrado en `docs/tutorial/` (SPEC, GUION de 29 pasos, FRASES de las mascotas) y Grimorio v3 en pixel art aprobado: libro abombado con barba, atril con paño y 5 poses (`tools/tutorial-pixel/build_grimorio.py` → `dist/assets/tutorial/grimorio-v1.png`). Falta programar el tutorial.
- Segunda tanda del Grimorio (15 poses × 3 bocas, `grimorio-hablar.png`), marco de diálogo RPG, y huevos de átomo/matraz/slime con nacimiento (9 cuadros) en pixel art, todo en `tools/tutorial-pixel/`.
- **Tramo 1 programado** (pasos 1–10 del guion): `dist/tutorial/tutorial.js` + `.css`, ruta de PRUEBA `#/tutorial` (no toca la mascota ni las monedas). Skill `nexo-tutorial`. Siguiente: tramo 2 (Inicio y mascota) y conectar a cuentas nuevas/Ajustes/monedas. Ver `docs/tutorial/SPEC.md`.
- **Tramos 2–5 y cierre programados** (pasos 11–29, guion completo en la ruta de prueba): refugio con los 8 objetos tocables (lee `NexoHomeScene.getProfile()`), paneles de Clases, Juegos, Organización y Perfil, paso de configurar (enlaces a calendario y perfil) y premio de +150 ⚛ solo visual. Siguiente: conectar de verdad (mascota/nombre reales, premio, primera vez, Ajustes → Tutoriales, filtro de nombres).
- **Tutorial conectado**: cuenta nueva ve el tutorial sola (state.tutorial), guarda mascota y nombre reales, premio de 150 ⚛ una vez, repetir desde Ajustes → Tutoriales, filtro de nombres. Prueba sin guardar en `#/tutorial/test`. Pendiente: aparición por sección, premio con nube.
- **Avisos del Grimorio** (12 oct): globo en la esquina, primera vez por sección solo si saltaste el tutorial, y novedades con versión (`dist/tutorial/avisos.js`, prueba `tools/avisos-test.cjs`). SPEC en `docs/tutorial/SPEC.md`. Falta móvil (390), premio con nube y tono del guion.
- **Tutorial en móvil (390)** revisado (12 oct): se arregló el paso de elegir huevo, que se salía del ancho. Pendiente: premio con nube y tono del guion.

## 14 oct 2026 · Organización: datos reales de los ramos
- Leídos del Drive los programas de Orgánica II, Analítica, FQ II (lab y ejercicios), Fisiopatología y el horario. Cargados en `dist/semester-2026.js`:
  ponderaciones con lab desglosado, reglas de examen/eximición, 14 fechas nuevas (labs, pruebas de ciclo, PEP 2 FISIO) y horario fijo.
  Cuentas existentes se actualizan una vez sin pisar notas (`NEXO_SEMESTER.upgrade`, prueba `tools/semester-test.cjs`). Detalle y dudas: `docs/update-02-organizacion/DATOS-RAMOS.md`.
- El rediseño de Organización: decisiones de 3 tandas en `docs/update-02-organizacion/SPEC.md`.
- **Fase 1 aprobada por Niquito (14 oct)**: estudio de planos de la torre (escena pixel con hora y clima reales), vista Hoy con plan propuesto (Empezar / Listo / Hoy no), relojes de arena, cinta de semana crítica y avisos en el Inicio. El diseño viejo de la Bitácora ya no se ve. Detalle en `docs/update-02-organizacion/SPEC.md`; prueba `tools/organizacion-test.cjs`. Siguen: Calendario, Notas, Lab y Avisos.
- **Organización Fase 2 · Notas e inasistencias** (14 oct, esperando aprobación): frascos por evaluación, "Necesitas X,X", simulador, riesgo de examen por ramo, promedio general, autopsia, estimación y faltas con aviso. Perfil → Notas/Inasistencias ya redirigen. SPEC: `docs/update-02-organizacion/SPEC.md`; pruebas `tools/notas-test.cjs`. Siguen: Calendario, Lab, Avisos.
- **Organización Fase 1 y 2 aprobadas (14 oct)** y cerradas con todo: sonidos del estudio, balanza que se inclina, mesa que se desordena, pruebas de ciclo enlazadas, autopsia → errores del plan, Perfil sin Notas/Inasistencias. Sigue el Calendario.
- **Organización Fase 3 · Calendario** (14 oct, esperando aprobación): mes (pergamino con sellos), semana (horario + bloques arrastrables), semestre (línea de tiempo con semanas críticas), lista; hoja del día; mover fechas con historial y deshacer; tareas, receso, dificultad, .ics. `tools/calendario-test.cjs`. Siguen: Lab y Avisos.

## 15 oct 2026 · Orden del desarrollo y beta para compañeros
- **Organización del trabajo**: un archivo por tema en `docs/chats/` (modelo, hecho, falta, ideas y prompts) y vista `docs/hoja-de-ruta.html` (`node tools/build-hoja.cjs`). Regla 5b en `CLAUDE.md`: ningún chat termina sin prompt de continuación.
- **Limpieza**: regla en `CLAUDE.md` (Forma de trabajo, 4) y `node tools/limpieza.cjs` (solo lee, sin tokens). Borradas 8 imágenes sin uso. Chat `docs/chats/limpieza.md`.
- **Beta para compañeros** (`docs/PLAN.md`, `docs/chats/beta.md`): `node tools/build-beta.cjs` arma `beta/` sin material de profesores ni nube; probada en 1440, 390 y en subcarpeta. Hosting por decidir (GitHub Pages en repo aparte o Cloudflare); nada publicado.
- **Repo principal pasado a privado** (estaba público con pruebas, diapositivas y correo). Arreglado `hydrateAvatars`. Inicio con clima y escenas por luz subido a master.
- **Críticas de Niquito por sección**: `docs/tutorial/FEEDBACK-15OCT.md` y `docs/ux-app/FEEDBACK-15OCT.md` (animación, personalidad, botones, navegación). Sin implementar.
- **Tablero y navegación (17 oct)**: `docs/hoja-de-ruta.html` ahora es un tablero (Terminado / En desarrollo / Por hacer, % por tema, hook que lo regenera solo). Barra nueva: Inicio · Aprender · Organización · Perfil; Entrenar borrado (el laboratorio de la Torre queda pendiente en `docs/chats/torre.md`). Reloj de estudio en el Inicio.
- **Aprender / Sótano de los Cristales (18 oct)**: pasillo y 3 salas (Cámara, entrenamiento, laboratorio) aprobados en bocetos; cerrado: cristal por ramo, premio según evidencia real, una grieta por error. Falta llevarlo a la app. SPEC: `docs/aprender-pasillo/SPEC.md`.
