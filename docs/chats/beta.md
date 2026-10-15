# Beta para compañeros
- modelo: Sonnet 5.5 · medio
- estado: carpeta beta lista y probada; falta elegir hosting y publicar el ensayo
- prioridad: 1
- spec: docs/PLAN.md

## Hecho
- Meta decidida: beta para 10 a 30 compañeros, sin cuentas ni nube, con tutorial, una clase por ramo y Organización.
- `node tools/build-beta.cjs` arma `beta/` (296 archivos, 52 MB): sin diapositivas, pautas ni PDFs de profes, sin el texto de las diapositivas dentro de las clases, sin pestaña de Pruebas antiguas, con la nube apagada y con `.nojekyll`.
- Probada en 1440 y 390 y dentro de una subcarpeta (`/nexo-beta/`), como la verá GitHub Pages: sin rutas rotas.
- Repo principal pasado a privado (15 oct) y flujo deseado anotado en PLAN.md.
- Se investigaron GitHub Pages y Cloudflare Pages con la documentación oficial (comparación en PLAN.md).

## Falta
- **Elegir hosting**: Niquito pidió tener GitHub presente; se inclinó por GitHub Pages con un repo público aparte (`nexo-beta`). Claude no debe darlo por elegido.
- Crear el repo público vacío `nexo-beta` (lo hace Niquito) y pasar su correo **noreply** de GitHub (Settings › Emails) para firmar el commit sin mostrar su Gmail.
- Publicar la beta (Claude solo con permiso explícito) y revisarla ya publicada en 1440 y 390.
- Decidir si la beta sale como está o tras pulir lo más visible (tutorial, botones, navegación).
- Botón de feedback dentro de la app y aviso "es una prueba, tu progreso queda solo en este navegador".
- Revisar si las fechas del Inicio (PEP 1 21 oct, etc.) valen para compañeros de otra sección.
- Revisar que el recorrido guiado de la clase no nombre la Pizarra (quitada en la beta).
- Revisor automático en el repo privado (pruebas, limpieza y "no viaja material de profes") antes de cada publicación.

## Ideas
- Un script `tools/publish-beta.cjs` que arme y suba la beta al repo público con un solo comando y pida confirmación antes.
- Formulario de feedback con preguntas fijas (qué entendiste, qué se rompió, qué te gustó).

## Prompt de inicio
```
Chat: Beta para compañeros. Lee CLAUDE.md y docs/PLAN.md (secciones Propuesta, Avance, Hallazgos y Falta decidir).
Contexto: tengo una carpeta beta/ lista (node tools/build-beta.cjs) para compartir con 10 a 30 compañeros, sin cuentas ni material de profesores. Mi repo principal es privado. Quiero publicar en GitHub Pages con un repo público aparte, pero la decisión final es mía.
Tarea: dime en una línea qué entendiste. Pregúntame con selección múltiple qué decido primero (hosting, feedback, o pulir antes). Nada se publica sin que yo lo autorice en el momento.
Al terminar, usa nexo-cierre y actualiza docs/chats/beta.md.
```

## Prompt de continuación
```
Chat: Beta para compañeros. Lee CLAUDE.md, docs/PLAN.md y docs/chats/beta.md.
Parte desde "Falta" y pregúntame qué sigue. Recuerda: nada se publica sin mi permiso explícito.
```
