---
name: nexo-organizacion
description: Área de Organización de Nexo (UPDATE 02: plan semanal, calendario, ponderaciones/notas, horario, tareas, avisos; antes "Bitácora"). Úsala antes de tocar dist/planner/, renderPlanner, renderCalendarInteractive, renderGrades o #/organizacion.
---

# Organización (UPDATE 02)

## Leer primero
- `docs/update-02-organizacion/SPEC.md` (borrador **esperando aprobación de Niquito**; responder sus preguntas pendientes antes de programar).
- `docs/update-02-organizacion/AVISOS.md` (avisos: diseño en curso, sin código).
- Lo que ya existe: `docs/PLANNER_1_0.md`.

## Qué existe hoy (reutilizar, no reescribir)
- Eventos en `state.events` (sincronizados como `academic_events`). UI vieja de Bitácora en `dist/app.js` (`renderPlanner`, `renderCalendarInteractive`, `renderGrades`).
- `dist/planner/priority.js` → `NexoPriority.rank(events, context)` (orden con razones visibles).
- `dist/planner/grades.js` (`NexoGrades`): pondera dentro de teoría y laboratorio por separado; notas 1.00–7.00, coma decimal; regla PEP < 4.00 aparte.
- `dist/planner/labs.js`: pre-lab, durante, informe.
- Pruebas: `node tools/priority-test.cjs`, `tools/lab-test.cjs`, `tools/grade-test.cjs`, `tools/planner-e2e.cjs`.

## Reglas
- Código nuevo en módulos propios (`dist/planner/schedule.js`, `weekly-plan.js`, `tasks.js`, `dist/organization.js`), **no** más líneas en `app.js`.
- El plan reparte **tiempo**; nunca declara dominio por minutos. Prioriza por evidencia (errores, transferencia, repaso espaciado) y muestra la razón de cada bloque.
- `#/planner` debe seguir funcionando (redirige a Organización).
- Objeto nuevo en el refugio: seguir la skill `nexo-inicio`.
- **Sin cloud**: nada de Supabase/SQL. Google Classroom/OAuth (Plan A de Avisos) requiere permiso explícito de Niquito.
- Nexo nunca cambia el calendario solo: propone, Niquito confirma, y queda historial para deshacer.
- Sin desborde horizontal a 390 px.
