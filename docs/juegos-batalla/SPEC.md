# Batalla con esquiva → Campaña "Camino a la PEP 1" — SPEC (4 oct 2026)

Parte de `docs/juegos/SPEC.md`. Estado: **en construcción, esperando aprobación visual de Niquito**.

## Qué

Un juego de jefes para preparar la **PEP 1 de Orgánica II** (aminas y aromáticos). Antes de la pelea final contra el **Rey Amonio**
hay que vencer a **3 guardianes**, que se desbloquean en orden:

| # | Jefe | Arena | Temas (lo que de verdad pregunta la PEP 1 2025) |
|---|---|---|---|
| 1 | Trimetilamina, "la amina apestosa" | Muelle del pantano (noche, faroles, niebla) | Aminas: clasificación, propiedades, IR, nomenclatura, síntesis (Gabriel, azida, reducción, P4) |
| 2 | Ciclobutadieno, "el antiaromático" | Laboratorio en ruinas (tormenta, bobina, matraces) | Hückel (P5), heterociclos, basicidad de heterociclos y anilinas |
| 3 | Benceno malvado | Catedral aromática (rosetón, vitrales) | SEA, directores, Friedel-Crafts, síntesis desde benceno (P1, P2), diazonio |
| 4 | **Rey Amonio** (final, 3 fases) | Salón del trono | Basicidad (P3), Hofmann, mecanismo con flechas + repaso de todo |

Código: `dist/games/pep1/` (abrir `http://127.0.0.1:8765/games/pep1/index.html`). Contenido editable en `dist/games/pep1/contenido.js`.

## Decisiones (pedidas por Niquito)

1. **El juego decide el desafío**, no el estudiante. Director: nunca el mismo tipo dos veces seguidas (práctica intercalada,
   Rohrer y Taylor 2007) y, si fallas un tema, el turno siguiente vuelve a ese tema en otro formato.
2. **Varios tipos de pregunta** (no solo alternativas): **conectar** pares, **ordenar**, **clasificar** en cajas, **ruta de síntesis**
   paso a paso, **elegir** y **flecha** de mecanismo (Rey). Salen de la pauta real de la PEP 1 2025 (`dist/assets/exams/13_…jpg`, `07_…jpg`).
3. **Harta vida**: 180 / 200 / 220 / 280 PV. Una pelea completa son ~12 a 20 aciertos.
4. **El conocimiento manda**: solo un acierto completo hace daño fuerte. En preguntas de varias partes, más de la mitad bien da daño parcial,
   pero cuenta como error (el tema vuelve). Pista = daño ×0,5. Esquivar nunca cuenta como dominio.
5. **Combate mejorado**: racha de aciertos sin ayuda (daño hasta ×1,4), barra de precisión al canalizar (crítico ×1,5),
   **Foco** al rozar balas sin que te toquen (lleno = próximo acierto crítico), fases de furia, jefes 3 y 4 se curan al fallar,
   té automático con poca vida, ataques que representan el error.
6. **Música original de jefe por arena** (coro, metales, cuerdas, timbales; sintetizada en vivo, sin citar obras) que sube por fase.
7. **Jefes en 3D simple** (esferas y enlaces que giran) con animación fluida: entrada, respiración, golpe con resorte, transformación de fase y disolución.
8. Progreso guardado en el navegador (`localStorage`, solo comodidad). `?todo=1` en la URL abre todos los jefes para probar.

## v2 (4 oct 2026, pedida por Niquito tras aprobar la base)

- **Música de combate por jefe**, más rápida y "movida" (batería, staccato "tan tan tan", galope). Firma de cada uno:
  Trimetilamina = tuba saltarina + pizzicato + oboe (Mi menor, 138→150) · Ciclobutadieno = semicorcheas + arpegiador eléctrico (Do menor, 160→174) ·
  Benceno = órgano + coro + doble bombo (Sol menor, 144→156) · Rey = galope + metales + coro en la fase 3 (Re menor, 128→140→152).
  La música sigue durante las preguntas (más suave) y cada fase sube el tempo y suma capas.
- **Arenas "de jefe"** (antes se veían planas): sello mágico giratorio con runas químicas detrás de cada jefe que late con la batería,
  círculo en el piso, rayos de luz, partículas en espiral hacia el jefe, siluetas en primer plano con paralaje y viñeta.
  Ciénaga maldita (luna tóxica, altar, árboles muertos) · Reactor inestable (anillos de energía 3D, escombros, tormenta por el techo) ·
  Catedral (sello hexagonal, plataformas flotantes, incensarios) · Salón del trono (columnata en profundidad, trono, cortinas, rocas que levitan en fase 2).
- **Rey Amonio v2**: cuerpo de cristal con núcleo de N y remolino de electrones, corona con halo, cuello de armiño con broche "+",
  cetro con H⁺, enlaces de energía y ojos dorados (rojos y con colmillos desde la fase 2).
- **Calidad automática**: si el juego va lento (computador o celular modesto) apaga rayos y remolinos. Forzar con `?calidad=baja`.

## v3 (4 oct 2026)

- **Música estilo chiptune** (inspirada en el género de bandas sonoras como la de Undertale: ondas cuadradas, bajo saltarín, arpegios,
  melodías pegajosas). Todas las melodías son originales; se arman con "motivos" que tocan notas del acorde, así siempre calzan.
  El **lobby (mapa) tiene su propio tema** tranquilo en Fa mayor; cada jefe tiene su tema de combate. Pantalla de inicio "▶ Comenzar" (activa el sonido).
- **Texto lento con voz** (estilo Undertale): letra a letra, cada personaje suena distinto, pausas en puntos y comas; clic para terminar.
- **Barra de precisión que va y vuelve** (3,6 s, dos oportunidades de crítico).
- **Dificultad que escala**: ×0,85 · ×1 · ×1,15 · ×1,35. El Rey en la fase 3 lanza **dos ataques a la vez**.
- **Animaciones nuevas**: conjuro del jefe antes de atacar, ondas expansivas, pausa de impacto al golpear, escena de cambio de fase
  (un solo destello que se desvanece + cámara lenta), borde rojo al recibir daño, "¡Tu turno!".
- **Fondos = dimensiones del grimorio** (se quitaron los dibujos de objetos que se veían básicos): nebulosa pintada con ruido,
  constelación con la forma de la molécula, páginas del grimorio flotando con dibujos, sello con runas, piso de luz, runas que suben.

## Criterios de aceptación

- Se juega completo de principio a fin: mapa → 3 guardianes → Rey Amonio → final, sin errores en consola.
- Cada tipo de desafío funciona con mouse y con el dedo (390 px), y corrige bien (probado por script).
- `prefers-reduced-motion` reduce movimiento; el sonido respeta el botón y se pausa con la pestaña oculta.
- Ningún destello rápido (máx. 3 por segundo).

## Pendiente

- Aprobación visual de Niquito (ANTES/AHORA).
- Conectar a la app: tarjeta "Boss Arena" en `#/games` y `recordAttempt` con `activityType:'game'` (toca `app.js`, cambio chico).
- Rediseño del Rey Amonio **por Niquito** (quiere diseñarlo él): la ficha `ENEMIGOS` en `contenido.js` y `arte.js` están listas para cambiar.
- Más casos con estructuras dibujadas (hoy hay anillos simples en SVG; los productos complejos van en texto).
- Si se quiere música orquestal real: componerla o usar pistas con licencia libre y registrar la fuente.
