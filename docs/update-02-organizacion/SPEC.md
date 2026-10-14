# UPDATE 02 — La Bitácora viva (organización, calendario, pruebas y notas)

Estado: **Fase 1 aprobada por Niquito (14 oct 2026).** Siguen Calendario, Notas, Lab y Avisos. Diseño en `## Decisiones de Niquito`.
Los avisos de Classroom siguen en `AVISOS.md`.

## Decisiones de Niquito · tandas de preguntas (11 oct 2026)

Mandan sobre todo lo de más abajo (diseño v2 del 5 oct). Donde choquen, gana esta sección.

**Lugar y estilo**
- La Organización es el **estudio de planos de la torre** (`docs/mundo-torre/SPEC.md`): escena pixel de borde a borde, la mascota camina
  y cada objeto abre una parte; el contenido va debajo como **pergamino sobre madera**. La Bitácora vieja y la maqueta del 5 oct "cortan la continuidad".
- Objetos: **mesa de planos = Calendario** · **tablero de corcho = Pruebas** · **balanza/libro = Notas** (con inasistencias) ·
  **banco con matraces = Laboratorio** · **reloj de pared = Hoy** · **campana = Avisos**.
- Se llega desde el **calendario de la pared del refugio** (abre Hoy) y por la **escalera/ascensor de la torre**. (El mapa del suelo no se eligió.)
- De la maqueta se rescatan: **relojes de arena, cinta "semana crítica", sellos de lacre y frascos de notas**.
- **Notas e Inasistencias se mudan del Perfil a Organización** (una sola casa). → Avisar al chat del Perfil (`docs/mundo-torre/SPEC.md`: escritorio y calendario de la habitación).

**Qué hace**
- Lo más importante: **qué estudiar hoy** (y en qué orden). Luego calendario, notas y no olvidar nada.
- Organiza: **pruebas y controles, laboratorio, tareas y lecturas, horario de clases**.
- Plan del día: **Nexo propone, Niquito acepta/mueve**. Prioridad = **mezcla equilibrada** (cercanía + dificultad + ponderación + cómo va en el ramo + errores abiertos).
- Dificultad: **Niquito parte con 1–5, Nexo ajusta** con errores y notas reales.
- Tiempo de estudio: **distinto por día de la semana** (lo configura él).
- Si no cumple: **reprograma sin culpa** y avisa si ya no alcanza.
- Cambio de fecha: **historial + deshacer + aviso en Inicio + reacomoda el plan**.
- Calendario con 4 vistas: **mes, semana, semestre (línea de tiempo) y lista**.
- Agregar cosas: **botón rápido (qué, ramo, fecha)**, **desde la escena** y **conectar Classroom** (requiere terminar la prueba de factibilidad OAuth de `AVISOS.md`, Fase 0 pendiente).

**Avisos**
- **Solo dentro de Nexo** (sin nube). Primer aviso **2 semanas antes**.
- En el Inicio, todo: **tablón que cambia por urgencia**, **la mascota lo dice**, **el calendario de la pared brilla** (≤ 7 días) y **plan de hoy visible con "Empezar"**.

**Notas**
- Las publican en **Classroom** o **el profe las dice/envía** → se ingresan a mano (o Classroom si se conecta).
- Al caer una nota: **recalcula cuánto necesita**, **ajusta prioridades**, **3 preguntas de qué falló** y **la mascota reacciona**.
- Después de rendir (sin nota aún): **"¿cómo te fue?" + nota estimada**; al llegar la real se compara (calibración).
- Pantalla de Notas: **cuánto necesito**, **simulador "¿y si me saco…?"**, **riesgo de examen/reprobar** y **promedio general del semestre**.
- Laboratorio hoy está mal en todo: **% no reales, no se ve si aprueba, confuso/feo y falta desglose**.
  Partes del lab: **pre-lab / control de entrada, informes y prueba de laboratorio**.
- Ponderaciones reales: Niquito pasa **foto o PDF del programa** de cada ramo y Claude las carga.
- Inasistencias: **cuántas quedan** (barra vs máximo, teoría y lab) y **aviso cuando queda 1**.

**Mascota en el estudio**: camina al objeto que tocas, **señala qué toca hoy** (objeto que brilla), reacciona a notas y pruebas, da consejos con evidencia. Nunca culpa.

**Extras elegidos**: ritual del domingo, modo día de prueba, exportar al calendario del celular (.ics), resumen del semestre.

**Urgencia**: diseñar todo con calma antes de programar (no se hace nada mínimo antes del 19 oct).

**Tanda 2 (11 oct)**
- Bloque del plan: **qué hacer + duración + la razón + botón Empezar + se tacha con tinta** al terminar (suma a la meta).
  **Orden y duración; la hora es opcional** (la pone Niquito si quiere).
- Reglas de evaluación conocidas: **PEP roja → examen** y **prueba recuperativa** si falta. El resto, desde los PDF de cada ramo.
- Recesos (vacaciones, paro): **plan liviano de repaso**.
- **Ritual del domingo**: ver la semana que viene, confirmar fechas, aceptar el plan semanal y mirar lo cumplido (sin culpa).
- **Modo día de prueba**: repaso flash de 10 min (lo clave + errores típicos, sin materia nueva) e Inicio calmado.
- **Mascota habla** 1 vez al entrar y cuando pasa algo (nota nueva, cambio de fecha).
- **Banco del lab**: próxima sesión y su práctico, pre-lab pendiente, informes por entregar (estado) y notas de lab aparte con mínimo.
- **Promedio general: simple** (todos los ramos valen igual).
- **Tareas: pendiente / en progreso / hecha**.
- **Vista semestre**: PEPs y controles por ramo (una fila cada uno), semanas críticas, notas que van cayendo y marca de "hoy".

**Tanda 3 (11 oct) — regla: todo en pixel art y con la ambientación de la torre** (rampas de `tools/home-pixel/pixel.py`,
resolución mixta, hora real, clima real, alquimista excéntrico + naturaleza que invade, sin runas nuevas).
- **Escena del estudio**: ventanal con vista exterior (hora y clima reales), mapas y planos colgando (mini historias de un cartógrafo
  excéntrico: compases, reglas, tinteros), hiedra y hongos que brillan, chimenea o caldero (luz cálida de noche).
- **Objetos con vida**: reloj con péndulo (hora real), campana que se mece y suena con aviso nuevo, matraces que burbujean (más si hay pre-lab
  pendiente), velas y polvo en la luz.
- **La escena refleja la situación real**: el corcho se llena de fichas (rojas si están cerca), la balanza se inclina a verde/rojo según notas,
  ambiente algo más cálido y papeles revueltos en semana crítica (sin ansiedad), mesa ordenada si se cumple el plan (desordenada si no, sin culpa).
- **Ficha de prueba**: reloj de arena + días, temario y material (Biblioteca, clases, PEPs antiguas), preparación con evidencia (no minutos) y plan hacia atrás.
- **Vista Mes**: pergamino desplegado en la mesa (se enrolla al cambiar de mes), sellos de lacre por prueba + iconos pixel (matraz = lab,
  pluma = entrega), hoy con brillo que respira, tocar un día abre su hoja (al costado en PC, desde abajo en celular).
- **Vista Semana**: horario fijo (tablillas de madera), bloques de estudio del plan, tareas con estado y **mover bloques arrastrando**.
- **Vista Lista**: por fecha, agrupada por semana.
- **Sonido**: ambiente suave (fuego, lluvia real, tic-tac bajito) y sonidos al actuar (pluma, sello, campana). Respeta silencio/ajustes.
- **Notas en pixel**: frascos en un estante (teoría y lab en repisas distintas), número grande tallado ("Necesitas 4,6"),
  simulador con **palanca de latón**, lomos de libro por ramo.
- **Al guardar una nota**: el frasco se llena por escalones, la pluma escribe "guardado" (con deshacer), la mascota reacciona
  (roja → "¿vemos qué falló?") y chispas de color según la nota.
- **Horario**: Niquito manda foto, Claude lo carga, y él lo ajusta en Nexo.
- **Orden de construcción**: primero **escena del estudio + Hoy + avisos en el Inicio**.

**Hecho 14 oct 2026 — datos reales cargados** (ver `DATOS-RAMOS.md`): ponderaciones de los 4 ramos con el laboratorio desglosado,
reglas de examen/eximición/PF por ramo (`rules`), 14 fechas nuevas (labs de ORG y FQ, pruebas de ciclo, PEP 2 de FISIO), horario fijo
(`NEXO_SEMESTER.schedule`) y actualización segura de cuentas existentes (`NEXO_SEMESTER.upgrade`, nunca pisa notas). Prueba `tools/semester-test.cjs`.
La pantalla sigue siendo la vieja: el rediseño (estudio de planos) no se ha programado.

**Hecho 14 oct 2026 — Fase 1: estudio de planos + Hoy + avisos en el Inicio** (aprobada por Niquito; ANTES/AHORA en `fase1/`).
- Escena pixel de borde a borde: `tools/torre-pixel/build_estudio.py` (+ `estudio_fondo.py`, `estudio_frente.py`; reutiliza el piso, la ventana y las piezas del laboratorio)
  → `dist/assets/torre/estudio/` (vista, fondo, frente y campana por hora + `estudio.json`). Kit de la vista Hoy: `tools/torre-pixel/estudio_ui.py` (madera, pergamino, rollos, relojes de arena, cinta).
  Chimenea, reloj de péndulo con la **hora real**, ventanal con hora y **clima real** (lluvia, nieve, nubes, niebla, tormenta encima de la vista), mapas, hiedra, hongos que brillan, velas, polvo en la luz.
  La escena refleja la situación: **fichas en el corcho** (rojas a ≤ 7 días, con los días), **más burbujas** si hay pre-lab pendiente, **campana que se mece** con aviso nuevo,
  objeto recomendado con chispas, luz algo más cálida en semana crítica. Para probar: `?hora=dia|tarde|noche&clima=lluvia|nieve|nubes|niebla|tormenta`.
- Código: `dist/planner/today-plan.js` (puro: plan, relojes, semana crítica, urgencia), `dist/planner/estudio.js` + `estudio.css` (pantalla), `dist/planner/avisos.js` (`NexoOrgAvisos`: avisos e Inicio).
  En `app.js` solo: `orgBridge()`, la ruta `planner` y la redirección de `#/hub/calendar|grades`, y una línea en el Inicio. En `home-pet.js` una línea (`homeSpot`, para el globo).
- Hoy: plan propuesto (orden + duración + razón + "por qué" con evidencia), **Empezar** (abre el cronómetro con el ramo), **Listo** (se tacha con tinta; también solo si el cronómetro
  ya sumó esos minutos del ramo), **Hoy no** (sale sin culpa, con deshacer), **tiempo por día de la semana** (−/+), modo día de prueba (repaso flash de 10 min), relojes de arena y cinta.
- Inicio: notas del tablón por urgencia (calma/ámbar/brillo/sello/HOY), cinta de semana crítica, calendario de la pared que brilla (≤ 7 días) y lleva a Hoy, plan de hoy con Empezar,
  la mascota avisa 1 vez al día y cuando aparece algo nuevo (cambio de fecha, semana crítica, cambio de urgencia).
- Las otras partes ya usan el diseño nuevo pero en versión mínima: Calendario = **lista por semana + agregar rápido**; Pruebas = fichas con reloj, temario y nota;
  Lab = próximos prácticos con "pre-lab listo"; Avisos = lista; Notas = enlace al Perfil (la balanza llega en su fase). El diseño viejo ya no se ve.
- Estado nuevo (local, sin nube nueva): `state.organization = { minutes: {díaSemana: min}, marks: {fecha: {done, skip}}, seen: {avisos, dates, started}, lastSaid… }`.
- Pruebas: `tools/organizacion-test.cjs` (nueva) y `tools/planner-e2e.cjs` reescrita para el estudio (390 y 1440). `npm test`: 27/29 (fallan `academic-test` y `database-test` por paquetes npm que no están en el contenedor; fallan igual sin estos cambios).

**Falta**: dudas de `DATOS-RAMOS.md` (programa ORG 2025, teoría FQ, lab ANA, Inglés IV);
orden de las fases siguientes; cómo se ve Avisos (campana) y la vista Semestre en pixel; cómo se integra el viaje escalera/ascensor.

---

# Diseño v2 (5 oct 2026) — referencia

Reemplazó el borrador v1 (sus decisiones siguen al final).

- ANTES (capturas reales de hoy): `antes/` (Inicio, Calendario, Ponderaciones y Perfil → Notas, en 1440 y 390 px).
- PROPUESTA (maqueta estática, no es la app): `maqueta/maqueta.html` y sus capturas `maqueta/propuesta-*.png`.

## Qué

Una sola área, **la Bitácora**, que responde: *"¿qué tengo, cuándo, cómo voy y qué hago hoy para llegar bien?"*.
Hoy esa información está repartida y fea: calendario con formulario gigante, ponderaciones como planilla,
notas **duplicadas** (Bitácora → Ponderaciones y Perfil → Notas guardan lo mismo con dos pantallas distintas),
inasistencias en Perfil, y el cielo nocturno del calendario no tiene nada que ver con el refugio de madera.

### Lo que se ve hoy y falla (diagnóstico de las capturas)

| Problema | Dónde | Por qué importa |
|---|---|---|
| El formulario "Agregar evento" ocupa media pantalla siempre | Calendario | Fricción: lo usas 1 vez por semana, lo ves siempre |
| 12 pruebas en lista plana, sin urgencia visual | Calendario | No se nota que **19–27 oct son 4 evaluaciones en 9 días** |
| Notas en dos lugares | Ponderaciones y Perfil → Notas | Confunde y se puede desincronizar en la cabeza |
| Planilla de inputs (%, nota, fecha mm/dd/yyyy) | Ponderaciones | Se ve como Excel, no como Nexo; fecha en formato gringo |
| Resultado en texto ("Necesitas promedio 4.00 en el 100.00 % pendiente") | Ponderaciones | No se entiende de un vistazo |
| Orgánica y Fisiopatología sin ponderaciones cargadas | Datos | No se puede calcular nada |
| Cabecera del calendario = cielo negro con estrellas | Calendario | Rompe la temática de madera/refugio |
| La mascota no aparece en ninguna de estas pantallas | Todo | No se siente vivo |

## La idea en una frase

**Un escritorio de madera del refugio con un tablero de corcho, un calendario de pergamino y un libro de notas alquímico,
donde la mascota te acompaña, te avisa y celebra contigo.** Todo en pixel art (mismas rampas y píxel ×4 que `refugio-pixel.png`).

## Estructura (5 pestañas = marcapáginas de cuero colgando del libro)

| Pestaña | Metáfora | Qué hace |
|---|---|---|
| **Hoy** | Tablero de corcho | Cuenta regresiva de las próximas pruebas (relojes de arena), plan de hoy con su razón, aviso de semana crítica, consejo de la mascota |
| **Calendario** | Pergamino clavado en madera | Mes y semana. Pruebas = sello de lacre del color del ramo; labs = matraz; entregas = pluma. Tocar un día abre su hoja |
| **Pruebas** | Fichas de misión | Una ficha por evaluación: fecha, temario, material (Biblioteca), estado de preparación con evidencia, plan hacia atrás, historial de cambios de fecha, y después de rendirla: nota + "autopsia" |
| **Notas** | Libro de notas alquímico | Ponderaciones y notas en **un solo lugar**: cada evaluación es un frasco (tamaño = peso, líquido = nota). "Necesitas X" grande, simulador "¿y si me saco…?" |
| **Avisos** | Buzón | Bandeja de `AVISOS.md` (cambios de fecha, entregas). Pegar texto o Classroom si la prueba de factibilidad sale bien |

Horario de clases/labs y Tareas (del v1) quedan **dentro** de Calendario (vista Semana) y Hoy, no como pestañas propias.
Inasistencias se mueve a Notas (es parte de "¿cómo voy en el ramo?"), con el % de asistencia contra el mínimo del ramo.

## Pantalla por pantalla

### 1. Inicio: que te avise solo

El tablón "Próximas pruebas y controles" del Inicio ya existe; se convierte en un **tablón de avisos que cambia según la urgencia**:

| Faltan | Cómo se ve | Qué dice la mascota (ejemplo) |
|---|---|---|
| > 14 días | Nota de papel tranquila | — |
| 8–14 | Nota con chinche ámbar | "En 14 días: Control 1 de Analítica. Hoy basta con 20 min." |
| 3–7 | Nota con borde que brilla suave + reloj de arena cayendo | "Semana de prueba. Toca ensayo sin apuntes." |
| 1–2 | Sello rojo que late lento | "Mañana: PEP 1 FQ. Repaso liviano y a dormir temprano." |
| Día D | Cinta "HOY" + checklist (calculadora, carnet, lápiz) | "¡Tú puedes! Lleva calculadora." |
| Después | Sobre cerrado "¿Cómo te fue?" | "Registra tu nota y qué te costó (2 min)." |
| Cambio de fecha | Nota con tachón: ~~20 oct~~ → 26 oct | "Ojo: el Control 1 FQ se movió al 26." |
| Semana crítica | Cinta roja sobre el tablón: "19–27 oct: 4 evaluaciones" | "Empecemos Orgánica antes: va última pero en la misma semana." |

Además, en la escena: **el calendario de la pared brilla un poco más cuando hay una prueba a ≤ 7 días** (usa la variable de luz, sin
reglas nuevas por estado) y su casilla roja marca el día. La mascota, si está en la sala, puede llevar el aviso como un papelito.

### 2. Hoy (tablero de corcho)

- Arriba: **relojes de arena** pixel por cada prueba de los próximos 21 días; la arena baja por escalones (no animación suave).
- **Plan de hoy**: 1 a 3 bloques con su razón, escritos como intención concreta (ver evidencia):
  *"Hoy 16:00 · 25 min · Aminas: 6 ejercicios de basicidad sin apuntes — PEP 1 ORG en 22 días, 3 errores abiertos."*
  Botón **Empezar** abre el temporizador / la clase; al terminar se tacha con tinta y suma a la meta diaria.
- **Línea de la semana** (lun→dom) con los compromisos fijos (clases, labs) y huecos libres.
- **Rincón de la mascota**: está sentada en el borde del tablero, con un consejo del día (uno, corto, nunca regaña).

### 3. Calendario (pergamino)

- Vista **Mes** y **Semana**. Cabecera de madera con faroles (no cielo negro). Cambiar de mes = el pergamino se enrolla y desenrolla.
- Hoy = casilla con runa que respira. Pruebas = **sello de lacre** del color del ramo; labs = matraz; entregas = pluma; estudio = vela.
- Tocar un día: se abre su hoja al costado (en móvil, sube desde abajo) con eventos y "+ Agregar".
- **Agregar** = hoja que baja solo cuando la pides (no siempre visible). Campos mínimos: qué, ramo, tipo, fecha (formato chileno 19/10/2026);
  lo demás plegado en "Más detalles".
- Semana crítica = franja roja suave sobre esos días. Choques (2 pruebas el mismo día o en días seguidos) se marcan con "⚠".

### 4. Pruebas (fichas de misión)

Cada evaluación tiene su ficha:
- **Fecha + cuenta regresiva**, temario, material de la Biblioteca vinculado, PEPs antiguas si existen.
- **Preparación honesta**: no "% de minutos", sino evidencia del motor académico (conceptos con acierto sin ayuda, errores abiertos, repasos al día).
  Si el ramo aún no tiene motor (todo menos Aminas), lo dice: "Sin evidencia todavía".
- **Plan hacia atrás** (se arma solo, editable): T-21 a T-14 ver materia nueva · T-14 a T-3 práctica de recuperación + ejercicios mezclados ·
  T-3 ensayo cronometrado con PEP antigua · T-1 repaso liviano y dormir.
- **Historial de cambios de fecha** (lo que pediste como "modificaciones"): fecha antigua, nueva, de dónde vino, y deshacer.
- **Después de rendirla**: nota (va directo a Notas) + "autopsia" de 3 preguntas: ¿qué tipo de pregunta te costó?, ¿error de concepto, de cálculo
  o de tiempo?, ¿qué harías distinto? → los errores alimentan el motor académico.

### 5. Notas (libro alquímico) — reemplaza Ponderaciones y Perfil → Notas

- Pestañas por ramo (lomos de libro con su color). Teoría / Laboratorio como dos páginas.
- Cada evaluación es un **frasco**: ancho = su peso (%). Sin nota = vacío con "?". Con nota = líquido con altura según la nota
  (1–7), color: rojo < 4,0 · ámbar 4,0–4,9 · verde ≥ 5,0. Burbujitas en pixel.
- **Número grande**: "Necesitas **4,6** en lo que queda (55 %)" + frase simple. Si es imposible o ya está asegurado, lo dice claro.
- **Simulador**: deslizar la nota de una prueba futura y ver cómo cambia el final (escenarios: difícil / normal / bien).
- **Reglas del ramo** visibles: PEP roja → examen, mínimo de laboratorio, aporte teoría/lab (60/40 en Analítica).
- **Guardar una nota**: tocar el frasco → teclado grande con coma decimal → se llena el frasco, sonido suave, la mascota reacciona
  (feliz con verde; con rojo, se acerca y dice algo amable + "veamos qué falló" → autopsia). Se guarda solo, con "✓ guardado" escrito con pluma y **deshacer**.
- Editar ponderaciones queda en "Ajustar ramo" (modo edición aparte), no a la vista siempre.
- Inasistencias: contador por ramo con barra contra el mínimo de asistencia (si Niquito lo confirma).

### La mascota con nosotros (en toda la Bitácora)

- Vive en una esquina fija de cada pestaña (sprite pixel de `dist/dev/pixelmascotas.js`, la mascota que Niquito elija, ×4).
- Conductas: **escribe** con pluma cuando guardas; **pega** un sello cuando agregas una prueba; **celebra** una buena nota;
  se pone **nerviosa** la víspera; **duerme** de noche (usa el reloj de luz); lee el temario en la ficha de prueba.
- Habla poco: máximo 1 globo por pantalla, cerrable, y nunca culpa ("no estudiaste") — solo propone el siguiente paso.

### Cómo se siente vivo (animaciones)

Todo en pixel, con `steps()` (saltos de píxel, sin difuminados): velas y faroles que titilan, polvo en la luz, arena que cae,
burbujas en los frascos, runa de "hoy" que respira, pergamino que se enrolla al cambiar de mes, tinta que se escribe al guardar,
sello de lacre que cae al agregar una prueba. Respeta `prefers-reduced-motion`, `data-nexo-ambient-motion="reduced"`,
`data-nexo-quality="low"` y `body.ambient-paused` (todo queda quieto pero legible).

## Recomendaciones de organización (con evidencia)

Nexo las aplica en el plan y las explica en una línea cuando las usa:

| Qué hace Nexo | Evidencia |
|---|---|
| Reparte el estudio en varios días en vez de concentrarlo al final; separa los repasos ~10–20 % del tiempo que falta (prueba en 14 días → repasos cada 1–3 días) | Cepeda et al. 2006 (*Psych. Bulletin*) y 2008 (*Psych. Science*) |
| Prioriza **recuperar sin mirar** (ejercicios, PEP antiguas) sobre releer o subrayar | Roediger & Karpicke 2006; Dunlosky et al. 2013 (práctica de evaluación y práctica distribuida = "alta utilidad"; releer/subrayar = "baja") |
| Mezcla tipos de ejercicio en la etapa final | Rohrer & Taylor 2007 (práctica intercalada) |
| Suma un colchón de tiempo a lo que calculas y detecta semanas con choques | Buehler, Griffin & Ross 1994 (falacia de planificación: subestimamos cuánto tardamos) |
| Escribe los bloques como "si es X hora en Y lugar, hago Z" | Gollwitzer & Sheeran 2006 (intenciones de implementación, efecto medio-grande, d ≈ 0,65) |
| No propone trasnoche antes de la prueba: T-1 es repaso liviano y dormir | Diekelmann & Born 2010 (el sueño consolida la memoria) |
| Mide preparación por evidencia, no por sensación | Bjork, Dunlosky & Kornell 2013 (ilusión de dominio) |
| Autopsia después de cada prueba | Lovett 2013 ("exam wrappers": mejora la reflexión sobre cómo estudiar) |

**Aplicado a tu semestre ahora mismo:** 19 oct Control 1 ANA · 21 oct PEP 1 FQ · 26 oct Control 1 FQ · 27 oct PEP 1 ORG
= **4 evaluaciones en 9 días**. Recomendación: empezar Orgánica (Aminas) esta semana aunque sea la última, y dejar la semana del 19 para ensayos.

## Ideas extra (para que elijas)

1. **Ritual del domingo** (5 min): revisar la semana que viene, confirmar fechas, la mascota arma el plan.
2. **Modo día de prueba**: el Inicio se calma (sin distracciones), checklist de qué llevar, respiración de 1 min.
3. **Exportar a Google Calendar / celular** con el `.ics` que ya existe (sin conexión a la nube).
4. **Racha de plan cumplido** (no de horas): premia hacer lo planeado, no estar sentado.
5. **Bitácora del semestre**: al final, un pergamino con todas tus notas y la evolución por ramo.

## Decisiones

- Nombre del área: **Bitácora** (ya la conoces). Ruta `#/planner/<pestaña>`; `#/planner/calendar` y `#/planner/grades` siguen funcionando.
  `#/profile/grades` redirige a Notas.
- Entradas desde el refugio: **calendario de la pared → Hoy** (antes Calendario), **mapa del suelo → Notas**. Sin objeto nuevo en la escena.
- Se **reutiliza** lo que existe: `state.events`, `NexoPriority.rank`, `NexoGrades` (`dist/planner/grades.js`), `labs.js`, `exportIcs`. No se reescribe la lógica de notas (tiene pruebas).
- Una sola fuente de notas: `gradeConfig()`; Perfil → Notas deja de tener pantalla propia.
- Código nuevo en módulos propios: `dist/planner/bitacora/` (`screen.js`, `today.js`, `calendar.js`, `exams.js`, `notes.js`, `alerts.js`, `plan.js` puro, `bitacora.css`)
  y un cambio chico en `app.js` para conectar el router.
- Arte: **kit pixel de interfaz** generado por script `tools/pixel-ui/` (marcos de madera y pergamino en 9 partes, marcapáginas, sellos, frascos,
  reloj de arena, iconos 16×16) usando las rampas de `tools/home-pixel/pixel.py`. Nada de imágenes de IA ni Canva.
- Honestidad pedagógica: el plan reparte **tiempo**, nunca declara dominio por minutos.
- Datos nuevos (se guardan en el estado local actual, sin cloud nuevo): en cada evento `dateHistory[]` y `result { grade, autopsy }`;
  `state.schedule[]` (horario fijo). Subir `SCHEMA_VERSION` con migración que no pierde nada.

## Cómo (fases chicas, una sesión cada una, Sonnet 5.5 · medio)

Orden pensado para que lo urgente (la semana del 19 oct) llegue primero:

0. **Kit pixel + fuente** (`tools/pixel-ui/`) y maqueta aprobada.
1. **Avisos en el Inicio + pestaña Hoy**: urgencia por días, semana crítica, cambio de fecha, día D, "¿cómo te fue?". Prueba `tools/bitacora-alerts-test.cjs`.
2. **Notas** (frascos, simulador, guardar bonito, unificar Perfil → Notas). Ponderaciones de Orgánica y Fisiopatología.
3. **Calendario** mes/semana nuevo + hoja de agregar plegable + horario fijo.
4. **Pruebas**: fichas, plan hacia atrás, historial de fechas, autopsia.
5. **Mascota viva** en todas las pestañas + objeto de la pared que brilla.
6. **Avisos** (bandeja, pegar texto) según `AVISOS.md`.

## Criterios de aceptación

- Con las fechas actuales, el Inicio muestra la cinta "19–27 oct: 4 evaluaciones" y cada nota con su nivel de urgencia correcto.
- Cambiar la fecha de una prueba deja historial, se puede deshacer y el Inicio muestra el cambio.
- Las notas existen en **un** solo lugar; los cálculos dan igual que hoy (`tools/grade-test.cjs` verde).
- Guardar una nota: se ve "guardado", sobrevive a recargar y se puede deshacer.
- Fechas en formato chileno (dd/mm/aaaa) y coma decimal en notas.
- Desktop 1440 y móvil 390 sin desborde horizontal. Animaciones quietas con movimiento reducido o calidad baja.
- Pruebas verdes: `smoke-test`, `room-test`, `update01-test`, `grade-test`, `priority-test`, `lab-test`, `planner-e2e`.
- ANTES/AHORA de cada fase y aprobación visual de Niquito.

## Preguntas para Niquito (antes de programar)

1. ¿Te gusta la estructura de 5 pestañas (Hoy · Calendario · Pruebas · Notas · Avisos) y los nombres?
2. ¿Qué mascota acompaña en la Bitácora (átomo, matraz o slime), o la que tengas elegida en el refugio?
3. **Fuente pixel**: ¿usamos una fuente pixel libre (licencia OFL) guardada dentro de Nexo para títulos y números? (No se carga de internet.)
4. Ponderaciones de **Orgánica II** y **Fisiopatología**: ¿me pasas el programa o los porcentajes? ¿Hay examen / eximición y con qué regla?
5. ¿Hay % mínimo de asistencia por ramo (teoría/lab)?
6. ¿Tu horario de clases y labs fijo de este semestre? (Para que el plan no choque.)
7. ¿Cuánto puedes estudiar de verdad por día de semana y fin de semana? (Hoy la meta es 120 min.)
8. De las ideas extra, ¿cuáles quieres?

## Pendiente

- Siguiente (Fase 1 ya aprobada): Calendario (mes/semana/semestre, mover con historial), Notas (balanza, frascos, simulador; mudar Notas e Inasistencias del Perfil), Lab completo, Avisos (campana).
- Fase 1, falta: sonidos (fuego, lluvia, tic-tac, pluma, campana), balanza que se inclina según notas, mesa ordenada/desordenada según el plan, editar o borrar una fecha desde el estudio (hoy solo agregar),
  "¿cómo te fue?" después de rendir (llega con Notas), Inicio calmado el día de prueba, ritual del domingo.
- Avisar al chat del Perfil: Notas e Inasistencias se mudan a Organización (pendiente desde la tanda 1).
- Aprobación de este diseño y de la maqueta.
- Decisiones abiertas de `AVISOS.md` (Classroom vs pegar texto).
- Avisos fuera de la app (notificaciones del celular) quedan fuera de este cambio.

## Decisiones del v1 que se mantienen

- Plan semanal automático por evaluaciones cercanas, errores, conocimiento previo y tiempo disponible, con la razón visible.
- Horario fijo (`day`, `start`, `end`, `subject`, `kind`): el plan no pisa clases ni labs ni pasa la meta diaria.
- Sin Supabase/SQL nuevo.
