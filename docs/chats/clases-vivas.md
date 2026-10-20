# Clases Vivas · módulo académico del Sótano
- estado: Modo Estudio implementado; inmersivo pendiente
- fase: desarrollo
- prioridad: 1
- spec: docs/clases-vivas/SPEC.md

## Hecho
- Controlador sin DOM y presentación Estudio con los componentes de contenido actuales.
- Acceso desde cámara y navegación directa; mismo historial local y Motor Académico.
- Punto de lectura y borradores del reproductor amplio recuperables; dos ramos y dos tamaños comprobados.
- 47/47 pruebas rápidas y recorridos de navegador en 1440/390 px.
- Basicidad conserva fases, respuestas, variantes, borradores y reloj; resultado recuperable e idempotente. Pruebas finales de otras misiones también conservan su intento pendiente.

- Feedback visual corregido: el panel real de 250×268 usa encabezado compacto, contenido desplazable y compañero desplegable; comprobado en cuatro tamaños y con la continuidad de Basicidad.

## Falta
- Modo Inmersivo: montar el mismo controlador en la futura cámara (constelaciones, atril, prácticas y materiales).
- Que el usuario estudie Basicidad durante 10–15 minutos en PC/celular y revise explicaciones, corrección y fuentes antes de integrar la rama.
- Revisión de contenido académico y prueba en celular físico; no dar por integradas nube ni publicación.

## Prompt de continuación
```
Continúa Clases Vivas. Lee CLAUDE.md, docs/clases-vivas/SPEC.md y las skills nexo-clase y nexo-motor. Las clases pertenecen a la cámara de la asignatura en el Sótano; no crees un Aula independiente. Usa NexoLivingClasses.create para compartir contenido, sesión y evidencia con Modo Estudio. El guardado de la fase interna de Basicidad ya está implementado y probado: no reinicies esa tarea. Antes de construir Inmersivo, realiza una sesión real de estudio con el usuario en Basicidad y recoge problemas de explicación, corrección o uso; corrige solo los que se observen y deja la entrega lista para su aprobación e integración. Preserva módulos, IDs e historial. No construyas Sótano 3D ni cambies cloud. Presupuesto $0, sin IA obligatoria.
```
