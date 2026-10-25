# Inicio y reloj · SPEC

Estado: diseño aprobado por Niquito el 24 oct 2026 (borrador **C** del Artifact "Borradores Inicio Nexo": https://claude.ai/artifact/ULgmb12nmaVM6zmTJ2A1p7). **Paso 1 hecho (24 oct), falta aprobación visual de Niquito.** Siguiente: paso 2.
Chat: Inicio (refugio). Modelo recomendado: Sonnet 5.5 · medio (Opus solo si el ping en segundo plano falla 2 veces).
Estilo de movimiento: el aprobado en el Artifact "Pruebas de animación Nexo" (piezas con resorte + efectos y sonido; cuadro a cuadro solo en momentos estrella).

## Qué
Rehacer la distribución del Inicio de escritorio y móvil, el reloj de estudio y el aviso sonoro. Problemas a resolver (vistos en la página publicada):
1. El reloj (`.home-clock`, ~580 px centrado arriba de la escena) tapa la ventana y los objetos.
2. Números chicos (dígitos de 28 px).
3. Botones − y + sin explicación; "Ocultar" y dos chapas compiten con el cronómetro.
4. No hay selector de ramo (`timerStart` lee un `#timerSubject` que no existe en el Inicio).
5. Falta sonido: un ping cada 30 min de estudio.
6. La barra de abajo (3 carteles: pruebas, tu día, continuar + pie "Un lugar donde…") no sirve.
7. Fondo y animación se sienten separados.
8. Texto superpuesto en la esquina de la barra lateral (por verificar; sospecha: `.companion-presence` contra la marca NEXO).

## Decisiones (Niquito)
- Versión **C**. Próximas pruebas, calificaciones y calendario van **al inicio**, visibles sin scrollear.
- "Notas" = **calificaciones** (no apuntes). Los apuntes (subir fotos de cuadernos y verlos como imágenes) son un tema aparte; el Inicio solo reserva un espacio punteado "Apuntes".
- Reloj **a la derecha**, fuera de la escena.
- Barra lateral izquierda **más chica**, botones chicos; la mascota sale de la barra.
- Refugio **más grande**.

## Distribución · escritorio (1440)
| Zona | Contenido |
|---|---|
| Barra izquierda (~104 px) | Marca NEXO chica + 4 botones chicos (Inicio, Aprender, Organiz., Perfil). Sin mascota. |
| Arriba a la derecha | Bitácora · átomos · Tienda (ya flotan fijos; la columna derecha parte ~64 px más abajo para no taparlos). |
| Izquierda, arriba | **Refugio** ~924×520 (proporción 1672:941), sin nada encima. |
| Debajo del refugio | **Calificaciones** (por ramo, chip con nota) + **Apuntes** (espacio punteado, pendiente). |
| Abajo a la izquierda | **Avatar de la mascota** (cuadrado ~112 px) con un globo de texto. La mascota sigue viviendo en el refugio. |
| Columna derecha (~340 px) | **Reloj de la torre** → **Mini calendario del mes** (hoy marcado, punto por evento; rojo = evaluación) → **Próximas pruebas** (3, la primera resaltada). |
| Se quitan | Los 3 carteles colgados, el pie "Un lugar donde el conocimiento florece" y el botón "Ocultar" suelto. |

## Distribución · móvil (390)
Barra superior + **tira fija del reloj** (ramo · cronómetro · Estudiar) → refugio con desliz lateral (`.home-pan`) → Próximas pruebas → Próximos 7 días → Calificaciones → barra de navegación inferior. La tira se abre como panel al tocarla.

## Reloj nuevo
- Solo 4 cosas: hora (28 px), cronómetro (≥ 48–56 px), ramo y controles.
- **Selector de ramo**: chip con color y nombre completo; abre la lista de ramos del semestre. Editable en reposo y en pausa; con el cronómetro corriendo solo se muestra. Guarda `state.timer.subject` (hoy `timerStart` lo toma de `#timerSubject`: reemplazar por el selector nuevo).
- Botones con texto claro: Estudiar / Pausar / Terminar. Se **eliminan − y +**; el tamaño pasa a Ajustes (Pequeño / Normal / Grande, hoy `nexo.clockSize`). "Ocultar" → "Minimizar" (queda hora + ▶).
- "Hoy · X min" y la cuenta regresiva de la prueba salen del reloj (la prueba ya vive en Próximas pruebas).
- Una línea "Continuar: ramo · tema →" dentro del panel; una línea "Aviso de estudio cada 30 min".
- Conserva engranaje, orbe y hiedra animados y las chispas al terminar.

## Ping de estudio
- Suena cada **30 min de cronómetro corriendo** (no de reloj de pared). Se calcula con marcas de tiempo (`startedAt` + `elapsedBeforeMs`), nunca contando ticks.
- Sonido: campana de latón sintetizada (reutilizar la de `planner/estudio-audio.js`), ataque corto y cola de ~10 s. Mientras suena: el orbe late y la hiedra se mece (movimiento reducido = solo luz fija).
- **Ajustes · "Aviso de estudio"**: interruptor propio (el `sound` global parte apagado; no depender de él), cada 15/30/45/60 min, duración 3/6/10 s, volumen = efectos (`sfxVolume`), botón "Probar". Tocar lo mínimo de `app.js` (la pantalla de Ajustes es del tema perfil).
- Crear/reanudar el `AudioContext` dentro del clic en "Estudiar" (política de autoplay).
- Cancelar el aviso al pausar o terminar.

### Límites de los navegadores y prueba obligatoria
- Chrome limita los timers de pestañas ocultas a 1 por segundo con presupuesto, y exime a las páginas con audio audible (el silencio no cuenta): https://developer.chrome.com/blog/background_tabs
- Hipótesis **por confirmar** (no verificada): tras ~5 min oculta, Chrome baja a 1 vez por minuto. Con 30 min de intervalo un atraso de ~1 min es aceptable.
- Hipótesis: en celular con pantalla bloqueada (sobre todo iOS) probablemente no suena. Plan: al volver a la app, aviso con el tiempo acumulado.
- Modo oculto `?pingTest=1` con intervalo de 1 min, midiendo cuánto se atrasa en: pestaña visible; otra pestaña 1 y 6 min; ventana minimizada; Android encendido y bloqueado; iPhone.
- Comparar **A)** `setTimeout` + comprobación por marca de tiempo contra **B)** programar el sonido por adelantado con el reloj de audio (hipótesis: no depende de timers, pero pausar obliga a cancelarlo). Anotar la tabla de resultados aquí.
- Sin Supabase ni servicios externos (límite del proyecto): nada de notificaciones push de servidor.

## Fondo y animación unidos (hipótesis, confirmar con captura)
Causas probables: la sala es un PNG rectangular sobre `ambient-world`; los loops son independientes; `refugio-vida.js` dibuja a ~10 cuadros/s mientras el CSS va a 60; la luz `--w-*` tiñe la sala pero no lo que la rodea.
Cómo: un solo viento (hiedra, hojas, nubes, polvo y follaje del fondo), una sola luz (`--w-*` también afuera de la sala), bordes de la sala difuminados hacia el fondo, misma curva y mismo reloj de tiempo. Respetar `prefers-reduced-motion`, `data-nexo-ambient-motion="reduced"`, `data-nexo-quality="low"` y `body.ambient-paused`.

## Movimiento del reloj
Engranaje y orbe arrancan con resorte y sobrepaso; pausa de impacto ~70 ms al pulsar Estudiar; micro-rebote de los dígitos por segundo; chispas, luz que late y sonido en cada hito. Píxeles alineados (rotar en pasos).

## Cómo (orden sugerido, un paso por chat o sesión)
1. Distribución nueva (riel chico, refugio grande, columna derecha, calificaciones/apuntes/avatar) y quitar carteles y pie.
2. Reloj nuevo + selector de ramo + tamaño en Ajustes.
3. Mini calendario y Próximas pruebas con datos reales (`state.events`, `rankedCommitments`, `urgency`) y calificaciones desde `NexoGradeRules` / `NexoNotas`; reutilizar, sin editar el módulo de Organización.
4. Ping + Ajustes + prueba de límites con tabla.
5. Unir fondo y animación.
6. Móvil.
Reglas: editar el original (sin `-v2`), borrar lo que quede sin uso, `node tools/build-startup.cjs` tras editar módulos del bundle, prueba nueva = `tools/<algo>-test.cjs`.

## Criterios de aceptación
- Reloj sin tapar ventana ni objetos en 1440 y 390.
- Cronómetro legible a 2 m.
- Ramo elegible y registrado en la sesión.
- Pruebas, calificaciones y calendario visibles sin scroll en 1440×900.
- Barra izquierda ≤ ~110 px, botones chicos; mascota solo como avatar abajo a la izquierda y viva en el refugio.
- Ping medido, con tabla de resultados en este archivo, y desactivable en Ajustes.
- Texto de la esquina de la barra lateral corregido.
- Sin romper `node tools/run-tests.cjs`.
- Probado en 1440 y 390; ANTES/AHORA y aprobación visual de Niquito.

## Hecho · paso 1 (24 oct 2026)
- Riel izquierdo de 104 px (`arcane.css`): marca NEXO chica, 4 botones chicos, sin mascota. `#app` parte a 104 px (afecta a todas las pantallas de escritorio).
- Inicio nuevo (marcado en `renderHomeRpg`, estilos en `design-system/home-layout.css`): refugio 924×520 en 1440 sin nada encima; debajo Calificaciones (chapa por ramo, promedio con `NexoGrades`) y Apuntes (espacio punteado); columna derecha de 340 px con reloj, calendario del mes (hoy marcado, punto por evento, rojo = evaluación), Próximas pruebas (3, compactas) y Continuar.
- Avatar de la mascota: `#companionPresence` ahora es un cuadro fijo abajo a la izquierda, solo en el Inicio en escritorio, con un globo (`.home-bubble`) con la prueba más cercana. En otras pantallas de escritorio no se muestra. En ≤ 900 px sigue en la barra superior como antes.
- Quitados: los 3 carteles, el pie "Un lugar donde…", `home-signs.css` (el estilo base `.pixel-text` pasó a `pixel-ui.css`), `resizeClock`, las chapas "Hoy · X min" y cuenta regresiva del reloj y los botones − y +.
- Medido en 1440×900: reloj, calendario, Próximas pruebas y Calificaciones se ven sin scroll; Continuar queda justo bajo el borde.
- Selectores del tutorial (`tutorial/recorrido.js`) y pruebas (`e2e-test`, `update01-dom-test`, `smoke-test`) actualizados.

### Decisiones tomadas en el paso 1 (confirmar)
- **Continuar** se mantiene como panel chico en la columna derecha (no se pidió quitarlo y lo usan el escritorio del refugio y la animación del grimorio); el paso 2 lo funde en la línea "Continuar: ramo · tema →" del reloj.
- **Ocultar** sigue en el reloj hasta el paso 2 (pasa a "Minimizar"). El tamaño del reloj queda fijo en normal hasta que Ajustes tenga el selector (paso 2).
- **Plan de hoy** (Organización): vivía en el cartel "Tu día" (`.day-paper`). Sin ese cartel `planner/avisos.js` ya no lo pinta en el Inicio; sigue en Organización › Hoy. Decidir si vuelve al Inicio (p. ej. dentro de Próximas pruebas).
- Pruebas: la tarjeta ya no muestra el párrafo de motivos ni un botón por tarjeta (un solo enlace al final).
- Calificaciones: promedio simple con `NexoGrades.calculate` (curso completo si está, si no el parcial); el paso 3 lo afina con `NexoGradeRules`.

### Por verificar
- Texto superpuesto en la esquina de la barra (punto 8): no se pudo comprobar el estado anterior; con la mascota fuera de la barra y la marca más chica ya no comparten esquina. Confirmar a ojo.
- `tools/update01-dom-test.cjs` no corre en este entorno (con jsdom instalado se agota igual sobre el código original): sus aserciones nuevas se comprobaron a mano en un navegador.
- Móvil (390): no se rompe (sin scroll horizontal), pero el reloj queda bajo el refugio; el orden final y la tira fija son el paso 6.

## Hecho · paso 2 (24 oct 2026)
- Reloj nuevo (marcado `homeClockMarkup` en `app.js`, estilos en `design-system/home-clock.css`; las reglas viejas se borraron de `update01.css` y `home-layout.css`): hora de 4 px por pixel (29 px de alto), selector de ramo, cronómetro grande (51 px de alto), Estudiar/Pausar/Seguir + Terminar con ícono ▶/❚❚ dibujado en CSS, y la línea "Continuar: ramo · tema →" (`.hc-continue.continue-volume`, mantiene los enganches de `platform/animation.js` y del escritorio del refugio).
- Selector de ramo: chip con el color del ramo que abre la lista del semestre; guarda en `state.timer.subject`; con el cronómetro corriendo queda bloqueado (solo se muestra). Escape y clic fuera lo cierran.
- Minimizar (antes Ocultar): queda la hora y ▶; el cronómetro solo aparece si hay sesión en curso o en pausa. Se recuerda en el dispositivo (`nexo.clockMin`).
- Tamaño en Ajustes: select pequeño / normal / grande (`nexo.clockSize`; por defecto normal en escritorio y pequeño en móvil). Píxeles enteros, nunca `scale`.
- Quitados: saludo/momento del día, cartel "Estudiando", el panel Continuar aparte, `#timerSubject` y las reglas `.home-continue`.
- La caída del reloj ocurre solo la primera vez en la sesión (antes se repetía al parar/seguir).
- Pruebas ajustadas: `smoke-test`, `update01-dom-test`, selectores del tutorial. `run-tests`: 45/50 (las 5 de antes).
- Medido en 1440×900: columna derecha termina en 884 px (sin scroll). En pantallas bajas (≤ 960 px de alto) Próximas pruebas muestra solo las 2 más cercanas.

### Decisiones tomadas en el paso 2 (confirmar)
- Tamaños: 3 (pequeño/normal/grande) en vez de 4; el "enorme" viejo se quitó por la altura de la columna.
- Plan de hoy sigue sin aparecer en el Inicio (decisión del paso 1 pendiente).
- La línea "Aviso de estudio cada 30 min" llega con el paso 4.

## Pendiente (otros temas)
- **Apuntes**: subir fotos de cuadernos y verlas como imágenes. Guardado local en el dispositivo (límite de peso), no en la nube. Tema aparte: crear `docs/apuntes/SPEC.md`.
- Ajustes del aviso viven en la pantalla de Perfil (skill `nexo-perfil`): conectar con cambio mínimo.
- Revisar el ancla `desk` de la mascota en el escritorio nuevo (ya estaba pendiente en `docs/chats/inicio.md`).

## Prompt de continuación
```
Chat: Inicio (refugio). Lee CLAUDE.md, la skill nexo-inicio y docs/inicio-reloj/SPEC.md.
Pasos 1 y 2 hechos (24 oct). Implementa el paso 3 de "Cómo" (mini calendario/próximas pruebas con datos reales + calificaciones con NexoGradeRules/NexoNotas) y avísame antes de seguir. Una sesión = un cambio.
```
