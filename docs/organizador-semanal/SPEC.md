# Organización del día y la semana

Estado: implementación local para revisión visual; no publicar sin revisar el resultado.
Base: instantánea `origin/master` local bc13cd1 (17-10-2026). El clon de red no terminó; no se afirma que incluya trabajo remoto posterior.

## Qué
Ampliar el calendario existente a clases, trabajo y vida personal. Sustituir la hoja estrecha de añadir/editar por una hoja de pergamino amplia, con campos agrupados y controles cómodos. Mantener la torre y el arte existente.

## Decisiones
- Un calendario y el mismo registro de eventos. Las repeticiones generan ocasiones independientes con identificador de serie único; editar/borrar puede afectar esta ocasión o esta y las siguientes.
- Inicio y término obligatorios para compromisos; una entrega puede tener solo fecha. Ramo opcional para trabajo y vida personal.
- Disponibilidad de estudio explícita por día, hasta dos ventanas, meta diaria y pausa entre sesiones. El horario sugerido no cuenta como confirmado hasta guardarlo.
- El motor conserva prioridades académicas y asigna horas a propuestas. No mueve compromisos. Resta clases, eventos, pausas y horas ya transcurridas. Sin disponibilidad confirmada muestra pendientes sin inventar horas.
- Muestra sesiones que no caben, choques y duraciones faltantes. Los minutos nunca son evidencia de dominio.
- Guardado local, importación/exportación y recarga conservan los datos; sin cambios de cloud, SQL ni OAuth. La sincronización remota queda fuera de la verificación.

## Cómo
`planner/schedule.js`: disponibilidad, intervalos, choques y asignación pura. `event-editor.js`: hoja de evento. Integración en calendario, plan diario y bundle existente. Se conserva la identidad de evaluaciones y el historial de fechas; el alcance de una serie es explícito.

## Aceptación
1. Añadir trabajo o actividad con horario; aparece en mes, semana y día y sobrevive a recargar.
2. El estudio no pisa clases ni compromisos; las pausas y el límite diario se respetan.
3. Cambiar una prueba conserva historial y recalcula las propuestas; borrar admite deshacer.
4. Día sin tiempo y semana saturada muestran pendientes, sin apilar trabajo de forma invisible.
5. Formulario usable por teclado y a 390/1440 px, sin desborde. Capturas antes/después.
6. Pruebas de intervalos, series, persistencia y flujos de navegador; regenerar bundle.

## Pendiente
Aprobación visual, integración con avances posteriores a la instantánea y publicación del Artifact. No se conecta Classroom ni se modifica el motor académico.

## Implementado y verificado
- Hoja modal nativa sobre la torre: foco contenido, Escape, botones visibles y campos agrupados. En móvil queda sobre la navegación inferior.
- Tipos personales, trabajo, clases y sesiones de estudio; inicio/término, repetición de 2–52 ocasiones, alcance de edición/borrado y deshacer.
- Disponibilidad semanal de dos franjas por día, meta y pausas; resta horas pasadas y compromisos, respeta la hora límite del evento y muestra sesiones completas o parciales que no caben.
- Conserva entregas vencidas pendientes; no convierte un turno o actividad en una prioridad de estudio. Las sesiones de estudio fijadas manualmente también consumen presupuesto.
- Exportación .ics con término y respaldo JSON con disponibilidad y series; persistencia comprobada al recargar.
- `schedule-test.cjs` y flujos de `organizador-e2e.cjs` en 1440/390. Suite general: 30/32 pasan, dos bloqueadas por `ts-fsrs` y `@electric-sql/pglite` ausentes; cinco exclusiones previas del propio ejecutor. No se atribuyen esos bloqueos al cambio.
- `tools/limpieza.cjs` requiere un índice Git y no corre en esta instantánea ZIP; se revisaron los cambios por comparación con el ZIP de base.

## Vida visual (17 oct 2026, aprobado por Niquito: "se ve muy plano")
- El editor reutiliza el kit `.pu-*`: marco de madera (`.pu-panel`), papel con fibras, título en `NexoPixelText`, botones `.pu-btn`, hiedra, sello (`.pu-seal`) y textos del alquimista ("Sellar en mi semana", "Mejor no").
- Animaciones en `calendario.css`: pergamino que se despliega, luciérnagas, mascota que asoma (copia el cuadro de `.dock-pet`; `NexoEventEditor.peek`). En móvil se esconden mascota, hiedra y sello. Todo se apaga con `prefers-reduced-motion`.
- Semana: días con papel y entrada escalonada, "hoy" con brillo, sesiones doradas con destello.
- Pendiente: la mascota no reacciona aún a los campos (solo asoma); `¡` no existe en la fuente pixel (no usarlo en títulos).

## Límites concretos
El plan sigue proponiendo hasta tres sesiones por día según el motor existente. No estima el temario ni garantiza preparación suficiente: muestra tiempo, prioridades y pendientes. Un compromiso con inicio y sin duración impide prometer horarios ese día hasta completarlo. No admite compromisos que crucen medianoche; dividirlos en dos días. La sincronización con cuenta no fue modificada ni verificada. Las propuestas se recalculan; los compromisos fijos solo cambian por acción del usuario.
