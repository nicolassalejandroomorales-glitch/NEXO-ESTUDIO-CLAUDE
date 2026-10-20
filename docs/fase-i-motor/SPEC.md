# Fase I · registro académico local recuperable

Base revisada: `NEXO-ESTUDIO-CLAUDE`, `master` en `550351161169f65be126c2dffb9bee2254db7a99` (20 oct 2026).

## Qué
Primera entrega: responder una actividad existente, recibir su corrección, guardar una única evidencia local y recuperar su entrega al motor y a FSRS al volver a abrir la clase. Asignatura, clase, misión, concepto y fuente salen del contenido existente. No se crea otro motor ni otra pantalla.

## Decisiones
- Presupuesto $0: JavaScript local y FSRS ya incluidos; sin IA ni nuevos servicios.
- Reutilizar el aula, la estación Demuestra, `classEvidence`, el puente académico y el almacenamiento actual con sus respaldos/importación/exportación. Sin migraciones destructivas.
- Guardar antes de las operaciones asíncronas. Conservar una referencia mínima al ejercicio (sin respuesta libre), y un estado de entrega separado del registro pedagógico.
- Reenvío del mismo intento = mismo registro. Reintentos con corrección vista conservan `retry`/ayuda; escrita sigue `self_rubric`.
- Recuperar únicamente registros creados con este contrato. No inventar fuentes o correcciones para registros anteriores.
- Mantener tiempos originales de las respuestas y evitar que una recuperación antigua retrase el reloj de un repaso más reciente.
- Diseño, Grimorio, mascota y contenido permanecen en sus componentes existentes. Sin avatar jugable.

## Cómo
`NexoClassEvidence.submit` guarda de inmediato y entrega en serie; `reconcile` reintenta lo pendiente cuando se abre la clase. El aula y Demuestra usan el mismo contrato. El puente recibe los metadatos reales del ejercicio generado.

## Aceptación
- Actividad objetiva de Orgánica y otra asignatura: corrección → evidencia de clase → intento/evidencia académica → repaso local.
- Recargar tras un fallo del motor recupera el registro sin duplicarlo ni perder datos previos.
- Doble envío, pista, reintento, autorúbrica y recuperación de intentos antiguos tienen pruebas.
- Recorrido en navegador en 1440 y 390 px, recarga y persistencia comprobadas.
- Ejecutar las pruebas rápidas; separar fallos previos de regresiones.

## Hecho
- Revisión inicial del repositorio y pruebas base: 41/43 archivos de prueba pasan; faltan `ts-fsrs` y `@electric-sql/pglite` en esta copia recién descargada.
- Instaladas las dependencias existentes sin cambiar `package.json` ni el lockfile; sin nuevos paquetes.
- `classes/evidence.js`: `submit` guarda y fuerza la escritura local antes de entregar; `reconcile` recupera registros pendientes en serie, con estado de entrega separado de la evidencia. IDs por clase/ítem/fecha/reintento; reenvíos no modifican ni duplican la respuesta original.
- `classes/player.js` y `app.js`: aula y Demuestra usan el mismo registro; reabrir una clase reintenta entregas pendientes.
- `classes/estacion.js`: variantes reproducibles del generador del aula, con identificador, fuente y diapositiva; cierre idempotente de la prueba.
- `academic/engine.js`: recuperar un intento antiguo conserva un repaso más reciente. Si se importa otro estado mientras carga el motor, el intento anterior no contamina la importación.
- `tools/academic-loop-test.cjs`: correctores reales de alternativas/número en dos ramos, almacenamiento real con JSON, fallo y recuperación de motor/FSRS, concurrencia, reenvío, ayuda, autorúbrica y conservación de datos.
- `tools/academic-loop-e2e.cjs`: navegador aislado a 1440 y 390 px; Orgánica/Analítica con corrección visible, motor bloqueado y recuperado, recarga sin duplicados y estación Demuestra con metadatos reales. Sin errores de JavaScript ni desborde horizontal en las vistas comprobadas.
- Suite rápida: **44/44**, con **5 exclusiones previas** del ejecutor. Se ajustó el fixture de `sotano-luz-test.cjs`: dos respuestas distintas necesitan IDs distintos; ya no reutiliza el mismo ítem/fecha con ayudas contradictorias.
- Regenerado el arranque y sus versiones con la herramienta del proyecto; sin editar el bundle a mano.

## Pendiente
- Revisar/aprobar esta entrega antes de integrarla con el diseño de otro chat o publicarla al usuario final.
- Los registros recuperables usan el nuevo contrato; los antiguos sin referencia al ejercicio permanecen intactos y no se reinterpretan.
- La estación todavía comienza su recorrido al reabrirse: esta entrega recupera respuestas ya enviadas, no una prueba final sin terminar.
- Validación en tamaños de navegador, no en un teléfono físico. No se audita aquí la exactitud de todo el contenido académico ni la sincronización remota.
- La limpieza de solo lectura marca duplicados y assets antiguos de otros temas: no se borraron.
- Fuera de esta entrega: autorúbrica no equivale a corrección objetiva; hay varios modelos de progreso y registros antiguos sin metadatos recuperables. No se migran ni reinterpretan aquí.
- Sin publicación del sitio ni cambios a servicios externos. No se genera Biblia definitiva ni skill NEXO Arquitecto.
