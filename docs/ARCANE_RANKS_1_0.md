# Rangos arcanos por concepto

`dist/academic/ranks.js` calcula 0–5: Sin rango, Mago Principiante, Intermedio, Avanzado, Experto y Rey Mago. Los umbrales iniciales de tiempo activo son 5/12/25/40/60 minutos, editables por `concept.rankThresholds`. El tiempo solo abre una puerta; nunca concede un rango sin respuestas.

Principiante exige una respuesta correcta verificada; Intermedio, dos ejercicios diferentes y respuestas independientes verificadas. Avanzado exige al menos dos familias verificadas, justificación y prerrequisitos. Experto exige tres familias verificadas, transferencia y formato PEP sin error crítico abierto. Rey Mago requiere días y sesiones distintas, repaso sin ayuda al menos 24 horas después y ausencia de error crítico abierto. En la segunda entrega local la autoevaluación se conserva y se señala, pero **no concede rango verificado en ningún nivel** ni aporta transferencia, justificación o recuerdo para completarlo. Se mantiene la exclusión previa de `study_bank` de las familias que habilitan rangos altos.

Los casos estructurados del piloto usan `academic/structured.js`. El navegador muestra feedback inmediato, pero una cuenta autenticada registra el caso verificado mediante `submit_verified_case`; el servidor conoce las claves correctas y limita duplicados. `start_academic_focus`, `ping_academic_focus` y `finish_academic_focus` determinan tiempo activo servido. `refresh_rank_reservations` crea reservas únicas por cuenta/concepto/umbral. Son **reservas futuras**, no cofres canjeables ni átomos adjudicados por el cliente.

Para añadir un rango no basta con cambiar la etiqueta: ajustar `ranks.js`, la función SQL `server_concept_rank`, pruebas de duplicados/RLS y la visualización en UI Lab. No publicar umbrales cliente-servidor divergentes.
