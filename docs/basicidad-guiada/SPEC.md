# Basicidad: explicar antes de exigir

## Qué y decisiones · 20 octubre 2026
Feedback real: la estación explica solo dos frases antes de diagnosticar y luego exige criterios estructurales no enseñados. El usuario adivina y pide cadenas desarrolladas. Aclaración posterior: el problema era que mostrar el pKa revelaba el orden, haciendo las preguntas demasiado sencillas; no pedía una lección sobre decimales.

- Conservar mapa, retos, IDs, intentos y módulos. Mismo módulo Estudio/Sótano; sin rediseño ni nube.
- Añadir a los datos de m4 doce pasos: notación, par libre/protonación, pares conjugados, equilibrio reversible, pKa del ácido conjugado, ejemplos resueltos, resonancia, sustituyentes, amida frente a amina, hibridación/medio y aplicación sin números.
- Pretest opcional con «No lo sé todavía». Comprobaciones formativas con explicación y regreso al fundamento; leer, pedir ayuda o acertar adivinando no acredita dominio.
- Mostrar coma decimal y cadenas explícitas en el piloto. Conservar notación química correcta: etilamina CH₃–CH₂–NH₂; dietilamina CH₃–CH₂–NH–CH₂–CH₃.
- Persistir posición del recorrido separada de classIndex antiguo. Poder volver a la explicación desde práctica y antes del examen, sin reiniciar respuestas, variante ni reloj.
- Las variantes nuevas del piloto usan un perfil del generador existente limitado a familias enseñadas; variantes anteriores se conservan. No pedir un orden fino entre alquilaminas sin datos.
- Práctica nueva de nivel 3 sin tabla y Demuestra de nivel 5 sin tabla; pKa en ejemplos y correcciones, no como respuesta visible al ordenar estructuras. Dos comprobaciones causales: dos N en una molécula y límites de comparar 1°/2°/3° en agua; distractor con sitio correcto pero causa falsa.
- «Probar otro caso sin tabla» archiva el intento de práctica anterior, incluidas variantes previas con pKa. No modifica un examen. `studyChecksIndex` y tareas nuevas no reescriben el diagnóstico previo ni su historial.
- Material nuevo: explicación original de apoyo verificada con McMurry/OpenStax 2.9, 24.3 y 24.4, etiquetada como apoyo y con enlaces. No afirmar que se cotejó nuevamente el PPT de cátedra, que no está disponible en esta copia.

## Aceptación
1. Desde cero hay explicación antes de cada comprobación y ejemplo resuelto antes del problema independiente.
2. «No lo sé todavía», error y «Acerté adivinando» ofrecen explicación sin dar dominio.
3. Ejercicios estructurales sin pKa visible; diferencias entre base/ácido conjugado y K frente a proporción final explícitas.
4. Volver/recargar conserva posición y respuestas; releer no altera el historial académico ni un examen pendiente.
5. Recorrido en 1440/390 y panel pequeño; sin desborde, errores de navegador ni regresiones de persistencia.

## Estado
Implementado y verificado en GitHub NEXO Claude, partiendo de master a5fdb4a (incluye tutorial P0). Pendientes: revisión del usuario y cotejo con su material oficial. No se publica el Artifact.

## Verificación
- `basicidad-guided-test.cjs`: 240 variantes reproducibles de práctica/reto; familias enseñadas y ninguna comparación fina entre alquilaminas sin datos. Contrato anterior disponible.
- `basicidad-guided-e2e.cjs`: recorrido real a 1440/390/250; ayuda, error y acierto adivinado persistidos sin dominio, volver/recargar, relectura conservando práctica, otra variante con archivo e independencia del examen.
- Regresiones `station-progress-e2e.cjs`, `academic-loop-e2e.cjs` y `study-layout-e2e.cjs`: guardado/reloj, motor recuperable, fuente/variante, no duplicados, dos ramos y cuatro tamaños.
- Corrección de carga: `stamp-versions.cjs` ahora también invalida la URL dinámica `classes/${file}` al cambiar contenido. Antes conservaba `v=20`. Prueba aislada `class-content-cache-test.cjs`: cambio de clase invalida clase/app e idempotencia, sin modificar archivos reales.
- Batería rápida final: 50/50 OK; cinco exclusiones preexistentes. Bundle y versiones regenerados, skills y diff revisados.
- No equivale a validación del contenido completo del ramo, revisión del PPT ni prueba en celular físico.
