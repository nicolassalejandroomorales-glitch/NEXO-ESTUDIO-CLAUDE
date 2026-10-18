# Organización — continuidad del organizador semanal
- modelo: conservar configuración del chat
- fase: desarrollo
- estado: integrado en master y publicado en el Artifact (17 oct 2026)
- prioridad: 1
- spec: docs/organizador-semanal/SPEC.md

## Hecho
- Se inspeccionó el Artifact Nexo en Claude y sus vistas Hoy, Calendario, semana y formularios.
- Se tomó una instantánea del origin/master local bc13cd1 (17 oct). El clon de red no terminó: no asumir que incluye avances remotos posteriores.
- Editor modal amplio sobre la torre, con secciones Estudio/Trabajo/Mi vida, horarios, notas, repetición configurable y edición/borrado de ocasiones con deshacer.
- Disponibilidad semanal, pausas y asignación de horas al estudio; compromisos, choques y sesiones sin espacio visibles. Conserva tareas vencidas y exporta término en .ics.
- Flujos del organizador comprobados en 1440/390: crear, validar, repetir, editar, mover prueba, borrar/deshacer serie, recargar, disponibilidad, teclado y exportar JSON/.ics.

- Integrado sobre master d4f97b4 (pruebas 32/32) y aprobado visualmente. Editor y Semana con vida: kit `.pu-*`, pergamino que se despliega, luciérnagas, mascota que asoma, textos del alquimista.

## Falta
- La mascota solo asoma: que reaccione (se asombre al elegir fecha, celebre al guardar) y que el sello se estampe al guardar de verdad.
- Vistas Hoy y Mes con la misma vida que la Semana.
- Lab y Avisos continúan en el tema anterior.

## Prompt de continuación
```text
Continuar el organizador de Nexo. Lee CLAUDE.md, docs/organizador-semanal/SPEC.md y docs/chats/organizacion.md. El organizador (editor modal, eventos personales/trabajo, disponibilidad y horas de estudio) ya está en master con vida visual en el editor y la Semana. Siguiente: que la mascota reaccione y el sello se estampe al guardar, y darle la misma vida a Hoy y Mes con el kit .pu-*. Parte de master actualizado, regenera el bundle y ejecuta schedule-test.cjs, organizador-e2e.cjs y las pruebas pertinentes. No tocar cloud ni migraciones.
```
