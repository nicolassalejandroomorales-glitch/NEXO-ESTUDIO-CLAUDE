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
- Feedback académico incorporado: 12 pasos de explicación con ejemplos, cadenas explícitas, práctica sin tabla y preguntas con distractores causales. Ayuda/adivinación formativa sin dominio; relectura y otra práctica conservando el historial. Detalle en `docs/basicidad-guiada/SPEC.md`.

## Falta
- Modo Inmersivo: montar el mismo controlador en la futura cámara (constelaciones, atril, prácticas y materiales).
- Segunda prueba del usuario: revisar si los fundamentos explican el porqué y si los retos nuevos sin tabla tienen dificultad adecuada; el primer feedback ya se implementó.
- Revisión de contenido académico y prueba en celular físico; no dar por integradas nube ni publicación.

## Prompt de continuación
```
Continúa Clases Vivas en GitHub NEXO Claude. Lee CLAUDE.md, docs/clases-vivas/SPEC.md, docs/basicidad-guiada/SPEC.md y la skill nexo-clase. Ya se implementó el feedback real: explicación desde cero y criterios antes del reto, cadenas explícitas y práctica sin pKa visible. Prueba con el usuario si la dificultad y el porqué ahora sirven; no vuelvas a pedir la primera prueba como si no hubiera ocurrido. Conserva variantes, historial y reloj; no acredites dominio por ayudas o autorreporte. Modo Inmersivo, revisión del PPT y publicación del Artifact siguen pendientes. Parte desde master actualizado y verifica la ubicación de la última entrega. No construyas Sótano 3D ni cambies cloud. Presupuesto $0, sin IA obligatoria.
```

## Integración autorizada · 20 oct 2026
El usuario pidió incorporar la entrega a GitHub Claude. Rama de destino: master; conserva el módulo, continuidad de Basicidad y adaptación a panel pequeño. No requiere rehacer la implementación.
