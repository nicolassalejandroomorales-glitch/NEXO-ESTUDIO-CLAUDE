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

- Mascota que reacciona en el editor (asombro, preocupación, sueño, celebración) y sello + cierre animado al guardar (18 oct).
- Integrado sobre master d4f97b4 (pruebas 32/32) y aprobado visualmente. Editor y Semana con vida: kit `.pu-*`, pergamino que se despliega, luciérnagas, mascota que asoma, textos del alquimista.

## Falta
- Vista Semestre y panel del día (al tocar un día del Mes): siguen más planos que el resto.
- Probar con los datos reales de Niquito (respaldo importado en una copia).
- Lab y Avisos continúan en el tema anterior.

## Prompt de continuación
```text
Continuar el organizador de Nexo. Lee CLAUDE.md, docs/organizador-semanal/SPEC.md y docs/chats/organizacion.md. El organizador (editor modal, eventos personales/trabajo, disponibilidad y horas de estudio) ya está en master con vida visual en el editor y la Semana. Ya tienen vida el editor (con mascota que reacciona y sello al guardar), Semana, Hoy, Mes y Mis horarios. Siguiente: vista Semestre y panel del día del Mes con el kit .pu-*. Parte de master actualizado, regenera el bundle y ejecuta schedule-test.cjs, organizador-e2e.cjs y las pruebas pertinentes. No tocar cloud ni migraciones.
```
