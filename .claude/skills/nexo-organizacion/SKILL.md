---
name: nexo-organizacion
description: Área de Organización de Nexo (UPDATE 02: plan semanal, calendario, ponderaciones/notas, horario, tareas, avisos; antes "Bitácora"). Úsala antes de tocar dist/planner/, renderPlanner, renderCalendarInteractive, renderGrades o #/organizacion.
---

# Organización (UPDATE 02)

## Leer primero
- `docs/update-02-organizacion/SPEC.md` (la sección "Decisiones de Niquito" manda; Fase 1 hecha, esperando aprobación visual).
- `docs/update-02-organizacion/AVISOS.md` (avisos: diseño en curso, sin código).
- Lo que ya existe: `docs/PLANNER_1_0.md`.

## Estudio de planos (Fase 1, 14 oct 2026)
- `#/planner/<hoy|calendario|pruebas|notas|lab|avisos>` → `dist/planner/estudio.js` (`NexoEstudio.render(app, vista, orgBridge())`). `#/hub/calendar|grades` redirigen. Lo viejo (`renderPlanner`…) ya no se ve.
- Plan, relojes, semana crítica y urgencia: `dist/planner/today-plan.js` (puro, `tools/organizacion-test.cjs`). Avisos e Inicio: `dist/planner/avisos.js` (`window.NexoOrgAvisos`; ¡`NexoAvisos` es del tutorial!).
- Arte: `python tools/torre-pixel/build_estudio.py` (escena) y `estudio_ui.py` (kit). Objetos en `estudio.json` (coordenadas gruesas 360×150).
- Estado: `state.organization` (minutos por día, marcas del plan, avisos vistos). Los tres módulos van en el bundle (`node tools/build-startup.cjs`).

## Qué existe hoy (reutilizar, no reescribir)
- Eventos en `state.events` (sincronizados como `academic_events`). UI vieja de Bitácora en `dist/app.js` (`renderPlanner`, `renderCalendarInteractive`, `renderGrades`).
- `dist/planner/priority.js` → `NexoPriority.rank(events, context)` (orden con razones visibles).
- `dist/planner/grades.js` (`NexoGrades`): pondera dentro de teoría y laboratorio por separado; notas 1.00–7.00, coma decimal; regla PEP < 4.00 aparte.
- `dist/planner/labs.js`: pre-lab, durante, informe.
- Pruebas: `node tools/priority-test.cjs`, `tools/lab-test.cjs`, `tools/grade-test.cjs`, `tools/planner-e2e.cjs`.

## Reglas
- Código nuevo en módulos propios (planeados: dist/planner/schedule.js, weekly-plan.js, tasks.js y dist/organization.js), **no** más líneas en `app.js`.
- El plan reparte **tiempo**; nunca declara dominio por minutos. Prioriza por evidencia (errores, transferencia, repaso espaciado) y muestra la razón de cada bloque.
- `#/planner` debe seguir funcionando (redirige a Organización).
- Objeto nuevo en el refugio: seguir la skill `nexo-inicio`.
- **Sin cloud**: nada de Supabase/SQL. Google Classroom/OAuth (Plan A de Avisos) requiere permiso explícito de Niquito.
- Nexo nunca cambia el calendario solo: propone, Niquito confirma, y queda historial para deshacer.
- Sin desborde horizontal a 390 px.
