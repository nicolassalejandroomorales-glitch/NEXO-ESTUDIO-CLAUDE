# Segunda entrega · confiabilidad académica local

Fecha: 20 oct 2026. Punto de partida: `88937b5`; referencia anterior: `5503511`.

## Qué y decisiones
Corregir atribución de variantes, dominio basado solo en autorúbrica, concurrencia FSRS y reconstrucción del catálogo al recargar. Autorizado por el usuario después de revisar el plan y riesgos.

- Primero cuatro regresiones permanentes y ejecución roja; después cambios mínimos y ejecución verde.
- Cada variante conserva su identidad reproducible; las familias siguen agrupando habilidades.
- La autorúbrica se conserva como autoevaluación, pero no aporta dominio verificado, transferencia ni retención. Los registros sin procedencia comprobable no se promueven automáticamente.
- Las actualizaciones FSRS se serializan por estado académico y concepto; reenvíos y recuperación antigua no duplican ni retrasan la tarjeta vigente.
- Restaurar el catálogo es independiente de entregar intentos. Se mantienen IDs históricos y JSON de intentos/evidencias. No se inventan fuentes para datos irrecuperables.
- Sin servicios remotos, publicación, cambios visuales ni acceso al progreso personal. Pruebas con JSON sintético y navegador temporal.

## Cómo
Modificar los componentes existentes en `dist/academic/` y las proyecciones de clase que conceden dominio. Reutilizar almacenamiento, generadores, correctores y puente. Regenerar versiones de caché con la herramienta existente.

## Aceptación
- Cuatro pruebas reproducen fallos de `88937b5` antes de corregir.
- Variantes de distintos conceptos/tipos no comparten corrección ni atribución accidental.
- Autoevaluación sola no concede dominio; ayudas y reintentos tampoco acreditan autonomía.
- Concurrencia, reenvío y fallo/reintento FSRS mantienen una tarjeta por concepto y estado.
- Guardar/restaurar conserva intentos, evidencia y datos ajenos, reconstruyendo ejercicios, familias y fuentes recuperables.
- Batería rápida y navegador 1440/390; cinco exclusiones previas documentadas, sin contarlas como aprobadas.

## Hecho / pendiente
- Cuatro regresiones permanentes creadas antes de editar el motor: R1 concepto incorrecto, R2 autorúbrica acredita retención, R3 tarjetas duplicadas, R4 catálogo ausente. Las cuatro fallaron tanto en `88937b5` como en `5503511`.
- Corregido el contrato de ejercicios: ID completo reproducible; familias por concepto/habilidad. La restauración reconoce referencias históricas sin cambiar intentos/evidencias.
- Progreso verificado exige evidencia objetiva. Autoevaluación conserva etiqueta y respuestas; no concede estado de conocimiento, hojas verdes, puntos PEP demostrados ni rango. Intervalo de recuerdo basado solo en aciertos objetivos independientes.
- Cola FSRS por estado académico/concepto; reenvío con igual fecha idempotente. Duplicados previos se normalizan al actualizar ese concepto, conservando tarjeta reciente y los IDs aplicados con fecha empatada. Estado importado aislado de operaciones anteriores.
- Catálogo reconstruido al abrir clase, mapa, revisiones o perfil. Metadatos recuperables restauran ejercicio/familia/fuente/diapositiva. `evidenceFor` deja fuera de acreditación contradicciones antiguas y variantes agregadas sin metadatos; `ensureFromEvidence` devuelve incidencias sin inventar contenido.
- Pruebas antiguas actualizadas donde su expectativa anterior concedía dominio por autorúbrica o agrupaba variantes. No se añadieron exclusiones.
- El auditor de cobertura excluye `write`: identifica 88 conceptos sin dos actividades objetivas de producción (antes informaba 86 contando autorúbricas). La diferencia es org-01 18→19 y org-04 7→8; no se añadieron ni eliminaron ejercicios. Se actualiza ese inventario explícito en su prueba, sin saltarla.
- Verificación final: cuatro regresiones pasan; ciclo académico local pasa; batería rápida 45/45 archivos con cinco exclusiones anteriores; navegador 1440/390 con actividad visible, recuperación y catálogo histórico en dos arranques. Sin errores de JavaScript ni desborde horizontal en esas vistas.
- Informe, parche, logs antes/después, fuentes de apoyo y manifiesto se entregan en el paquete de auditoría de esta segunda entrega. Estado local: pendiente de revisión independiente, sin publicación ni integración remota.

## Cinco exclusiones anteriores (sin cambios)
| Archivo | Motivo que declara el ejecutor |
|---|---|
| `tools/update01-test.cjs` | Espera «Bloque del catálogo» y la app muestra «Evaluación». |
| `tools/update01-dom-test.cjs` | Requiere jsdom, ausente de package.json. |
| `tools/update01-integrity-test.cjs` | Lee un manifiesto externo en Desktop/MANIFIESTO_SHA256.tsv. |
| `tools/web-vitals-test.cjs` | Requiere navegador; no se ejecuta en la batería rápida. |
| `tools/torre-mundo-test.cjs` | Depende del laboratorio antiguo de Entrenar, retirado. |

Los motivos se transcriben de `tools/run-tests.cjs`; no constituyen una nueva ejecución ni una aprobación de esos cinco archivos.

## Riesgos y límites
- No se reescribe la atribución histórica incorrecta. Si es contradictoria, no acredita dominio; su reparación de origen requiere una decisión de migración trazable. Los metadatos irrecuperables quedan pendientes.
- Una etiqueta/rango puede bajar al dejar de contar autorúbricas o evidencia inconsistente. Respuestas, intentos, evidencias y datos ajenos se conservan.
- La cola garantiza concurrencia dentro del mismo estado/motor JavaScript, no coordinación entre pestañas, dispositivos o servidores.
- Corrección objetiva nueva de texto libre, precisión científica de todo el contenido, sincronización autenticada, cuotas/averías de almacenamiento y teléfono físico quedan fuera de esta entrega. El puntaje de una autorúbrica de simulacro sigue siendo autoevaluación, no certificación de dominio.
- Las tarjetas históricas ya atribuidas a un concepto equivocado no se reasignan automáticamente.
- Algunos objetivos/rangos no podrán completarse con el contenido actual hasta incorporar comprobaciones objetivas suficientes. No se recupera una acreditación falsa para hacerlos alcanzables.
