# Limpieza y auditoría del código
- modelo: Sonnet 5.5 · medio
- estado: regla escrita (CLAUDE.md, Forma de trabajo 4); falta la limpieza de lo acumulado
- prioridad: 2
- spec: docs/pendientes.md

## Hecho
- Regla de orden y limpieza en `CLAUDE.md` y paso de limpieza en `nexo-cierre` (15 oct).
- Inventario de solo lectura (15 oct): `dist/` tiene 357 archivos sin contar `vendor`; el código no está muy sucio (casi nada de código comentado, un solo TODO), pero hay restos sin usar.

## Falta
- **Assets sin mención** en el código: 45 archivos (1,3 MB), 33 en `assets/torre`. Antes de borrar, comprobar que no se carguen por nombres armados a mano.
- **Escena vieja** `refugio-012.png` y el respaldo SVG de las mascotas (`dist/dev/alquimicos.js`): decidir si ya se pueden quitar.
- **`dist/dev/`** (252 KB de demos y hojas de revisión): ver cuáles se usan todavía.
- **Restos de funciones borradas** como el `hydrateAvatars` que ya se arregló: agregar un revisor automático (ESLint `no-undef` y `no-unused-vars`) que los encuentre solo. Instalarlo necesita permiso.
- **`tools/`**: 71 entradas; revisar scripts que ya no se usan.
- Archivos sueltos en la raíz sin subir: `AGENTS.md` y `AUDITORIA_CODEX.md` (de Codex): decidir si se quedan.
- Ramas viejas en el repo (`respaldo-auto`, ramas de chats ya unidas): revisar y borrar las que sobren, con permiso.
- 4 pruebas rotas que se saltan (ver `docs/pendientes.md`).

## Ideas
- Revisor automático en el repo privado (GitHub Actions) que corra pruebas, lint y la regla "no viaja material de profesores" en cada subida.
- Una línea fija en cada PR: "¿qué se borró en este cambio?".

## Prompt de inicio
```
Chat: Limpieza y auditoría del código. Lee CLAUDE.md (Forma de trabajo, regla 4) y docs/chats/limpieza.md.
Contexto: quiero trabajar ordenado, sin basura ni parches encima. Hay un inventario de restos en el archivo del chat.
Tarea: dime en una línea qué entendiste. Empieza por lo más seguro: verifica cuáles de los 45 assets sin mención de verdad no se usan (busca nombres armados a mano) y muéstrame la lista antes de borrar nada. Un grupo de restos por cambio, en un worktree limpio, con pruebas y revisión en 1440 y 390.
No borres nada mío sin preguntarme. Al terminar, usa nexo-cierre y actualiza docs/chats/limpieza.md.
```

## Prompt de continuación
```
Chat: Limpieza y auditoría del código. Lee CLAUDE.md y docs/chats/limpieza.md.
Parte desde "Falta" y pregúntame qué grupo de restos sigue.
```
