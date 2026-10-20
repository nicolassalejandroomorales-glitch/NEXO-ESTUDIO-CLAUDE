# Tutorial: corrección P0 de persistencia
- modelo: GPT-6 · alto
- fase: terminado
- estado: corrección verificada (44/44 pruebas y 14 escenarios en Edge); solo NEXO-ESTUDIO-CLAUDE, sin publicación del Artifact
- prioridad: 0
- spec: docs/tutorial-persistencia/SPEC.md

## Hecho
- Registro durable `shown` antes de reproducir; resultado `done/skipped`, migración de usuarios con datos y protección frente a caché/remoto pendiente.
- Repetición exclusiva desde Ajustes, cursor separado, sin recompensa ni alteraciones del historial o de la mascota.
- Registro independiente de cinemáticas por ID y condición, marcado antes de abrir, archivo consultable y repetición voluntaria.
- Botón Saltar desde el comienzo y controles accesibles durante el recorrido (el Sótano no solicita fullscreen mientras guía el Grimorio).

## Falta
- Verificar con una cuenta real sincronizada y actualizar el Artifact privado en un trabajo autorizado de publicación.
- Contenido narrativo y pantalla visual del archivo de recuerdos, cuando exista guion aprobado.

## Ideas
- El archivo visual puede consumir `NexoCinematics.archive()`; cada escena se registra con ID estable y condición basada en un acontecimiento real.

## Prompt de continuación
```
NEXO: revisar la corrección P0 del tutorial en NEXO-ESTUDIO-CLAUDE. Lee CLAUDE.md, docs/tutorial-persistencia/SPEC.md y tools/tutorial-e2e.cjs. El historial se registra antes de mostrar y viaja dentro de meta.experiences. No restablezcas pending por versión/ruta; la repetición de Ajustes no entrega recompensas ni modifica el primer resultado. Antes de publicar el Artifact privado, verifica con una cuenta de prueba real y conserva los cambios visuales que tenga el Artifact y todavía no estén en Git. No modifiques otros repositorios.
```
