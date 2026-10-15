# Auditoría completa de Nexo (para Codex)

**Modo: solo lectura. No modifiques ningún archivo del proyecto.** Escribe el resultado en un único archivo nuevo: `INFORME_AUDITORIA.md`.

Contexto: lee `AGENTS.md` y `CLAUDE.md`. Nexo es una app de estudio (Química y Farmacia, USACH) con refugio/mascota, grimorio, clases con corrección real, juegos, organización (calendario/notas/labs), perfil y tutorial.

## Qué revisar (en este orden)
1. **Bugs reales**: errores lógicos, rutas que fallan, variables sin definir, promesas sin manejar, `localStorage` que puede romperse. Recorre el router de `dist/app.js` (`routeTo`, `renderRoute`) y comprueba que cada ruta existe y no rompe.
2. **Motor académico** (`dist/academic/`): coherencia de estados de conocimiento, FSRS, evidencia y validadores. ¿Se puede "ganar" dominio sin acertar de verdad?
3. **Clases** (`dist/classes/`): respuestas incorrectas o ambiguas, enunciados con errores de química, actividades que no corrigen bien. Marca cada duda con archivo y línea.
4. **Organización** (`dist/planner/`), **tutorial** (`dist/tutorial/`), **juegos** (`dist/games/`, `dist/game/`), **mascotas** (`dist/mascot/`), **Inicio y luz** (`dist/design-system/`, `dist/ambient/`).
5. **Rendimiento**: carga inicial, archivos pesados, imágenes sin optimizar, trabajo repetido en cada render, fugas (listeners/intervalos que no se limpian).
6. **Móvil (390 px) y accesibilidad**: elementos que se salen, botones muy chicos, falta de etiquetas, contraste.
7. **Código muerto y duplicado**: funciones sin uso, bloques copiados, archivos huérfanos.
8. **Pruebas**: corre `npm test` y reporta qué falla. Lista qué partes importantes no tienen prueba.
9. **Consistencia**: choques entre `startup-bundle.js` y los módulos fuente; `?v=` mal puestos; reglas de `CLAUDE.md` que el código no cumple.

## Formato del informe `INFORME_AUDITORIA.md`
- Resumen de 10 líneas máximo, en lenguaje simple.
- Tabla de hallazgos: `#`, **gravedad** (alta/media/baja), **tema**, **archivo:línea**, **qué pasa**, **cómo arreglarlo** (1-2 líneas).
- Ordenado de más grave a menos grave. Máximo 40 hallazgos; si hay más, deja los más importantes.
- Al final: "Lo que está bien" (5 puntos) y "Primeros 5 arreglos recomendados".
- No inventes: si no estás seguro, márcalo como "duda". No incluyas hallazgos sin archivo y línea.
