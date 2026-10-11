# UPDATE 02 — Área de Organización

Estado: **borrador para aprobación de Niquito** (nada programado todavía).

## Qué

Una sola área, "Organización", que responde la pregunta *"¿qué hago hoy y esta semana para llegar bien a mis evaluaciones?"*. Reúne cuatro piezas:

1. **Plan semanal automático**: reparte las horas de estudio de la semana según evaluaciones cercanas, errores abiertos, conocimiento previo y tiempo disponible.
2. **Calendario + ponderaciones**: lo que hoy es Bitácora (`renderPlanner`, `renderCalendarInteractive`, `renderGrades`) pasa a ser pestañas de esta área.
3. **Horario de clases y labs**: bloques fijos semanales (clase, laboratorio) alrededor de los cuales se arma el plan.
4. **Tareas y entregas**: pendientes por ramo (pre-lab, informe, tarea, lectura) con prioridad y fecha.

## Decisiones

- Dónde vive: **objeto nuevo tocable en el refugio** (invisible, brillo al pasar el mouse, usa `data-route`, como el resto). Ruta propuesta: `#/organizacion`. El objeto exacto (pizarra, agenda, reloj de arena…) se diseña con script en `tools/home-organizacion/`, sin tocar `refugio-012.png`.
- Se **reutiliza** lo que ya existe: `state.events`, `NexoPriority.rank`, `NexoGrades`, `dist/planner/labs.js`. No se reescribe nada.
- Código nuevo en módulos propios (`dist/planner/schedule.js`, `dist/planner/weekly-plan.js`, `dist/planner/tasks.js`, `dist/organization.js` para la pantalla), no más líneas en `dist/app.js`.
- Honestidad pedagógica: el plan reparte **tiempo**, nunca declara "dominio" por minutos. Las sesiones se priorizan por evidencia (errores, transferencia, repaso espaciado).
- Sin cloud nuevo: se guarda donde ya se guardan los eventos; nada de Supabase/SQL por ahora.

## Cómo (pasos chicos)

1. **Modelo de datos**: bloque de horario (`day`, `start`, `end`, `subject`, `kind`) y tarea (`title`, `subject`, `due`, `priority`, `status`). Normalizadores + prueba `tools/schedule-test.cjs`.
2. **Motor del plan semanal**: función pura `weeklyPlan(events, schedule, tasks, context)` → bloques de estudio por día con razón visible ("PEP 1 Orgánica en 12 días · 3 errores abiertos en Aminas"). Prueba `tools/weekly-plan-test.cjs` con casos deterministas.
3. **Pantalla Organización** con pestañas: *Semana* · *Calendario* · *Ponderaciones* · *Horario* · *Tareas*. Desktop 1440 y móvil 390.
4. **Objeto en el refugio** + entrada en `home-scene.js` y rebuild (`node tools/build-startup.cjs`), subir `?v=`.
5. **Home**: el escritorio "Continuar estudiando" muestra lo siguiente del plan de hoy.
6. Bitácora vieja redirige a Organización (`#/planner` sigue funcionando).

## Criterios de aceptación

- Con el horario cargado, el plan de la semana no pisa clases/labs ni excede la meta diaria.
- Cada bloque del plan muestra su razón; cambiar una fecha de PEP cambia el plan.
- Calendario y ponderaciones siguen funcionando igual que hoy (misma data, pruebas `grade-test`, `priority-test`, `lab-test`, `planner-e2e` verdes).
- Objeto tocable respeta `prefers-reduced-motion`, calidad baja y móvil deslizable.
- Sin desborde horizontal a 390 px. `smoke-test`, `room-test`, `update01-test` verdes.

## Pendiente / preguntas para Niquito

- ¿Cuántas horas reales de estudio por día y qué días estás libre? (valor inicial: meta de 120 min/día, editable).
- ¿Cargamos tu horario de clases del semestre 2S2026 ahora o lo ingresas tú en la pantalla?
- ¿Qué objeto del refugio prefieres para Organización?
- Avisos automáticos (notificaciones) quedan **fuera** de este corte.
