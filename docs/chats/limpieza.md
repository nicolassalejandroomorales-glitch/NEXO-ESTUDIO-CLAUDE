# Limpieza y auditoría del código
- modelo: Sonnet 5.5 · medio
- estado: regla escrita (CLAUDE.md, Forma de trabajo 4); falta la limpieza de lo acumulado
- prioridad: 2
- spec: docs/pendientes.md

## Hecho
- Regla de orden y limpieza en `CLAUDE.md` y paso de limpieza en `nexo-cierre` (15 oct).
- Script `tools/limpieza.cjs` (escribir LIMPIEZA o `node tools/limpieza.cjs`; en el PowerShell de Niquito `npm` está bloqueado). Borradas 8 imágenes viejas sin uso (15 oct).
- Inventario de solo lectura (15 oct): `dist/` tiene 357 archivos sin contar `vendor`; el código no está muy sucio (casi nada de código comentado, un solo TODO), pero hay restos sin usar.

## Falta
- Correr `node tools/limpieza.cjs` y seguir su lista (hoy: 2 scripts de versiones paralelas y 6 assets sin uso).
- `tools/home-pixel/muestra_ventana_v2.py` y `_v3.py`: versiones paralelas de una muestra ya superada; ver si se pueden quitar.
- 6 assets `assets/torre/lab/dia-*` que ningún código carga: los genera `build_lab_muestra.py`; lo decide el chat de la Torre.
- **Restos de funciones borradas** como el `hydrateAvatars` que ya se arregló: agregar un revisor automático (ESLint `no-undef` y `no-unused-vars`). Instalarlo necesita permiso.
- **Escena vieja** `refugio-012.png` y el respaldo SVG de las mascotas (`dist/dev/alquimicos.js`): decidir si ya se pueden quitar.
- **`dist/dev/`** (252 KB de demos y hojas de revisión): ver cuáles se usan todavía.
- **`tools/`**: 71 entradas; revisar scripts que ya no se usan.
- Ramas viejas en el repo (`respaldo-auto`, ramas de chats ya unidas): revisar y borrar las que sobren, con permiso.
- 4 pruebas rotas que se saltan (ver `docs/pendientes.md`).

## Ideas
- Revisor automático en el repo privado (GitHub Actions) que corra pruebas, lint y la regla "no viaja material de profesores" en cada subida.
- Una línea fija en cada PR: "¿qué se borró en este cambio?".

## Prompt de inicio
```
Chat: Limpieza y auditoría del código. Lee CLAUDE.md (Forma de trabajo, regla 4) y docs/chats/limpieza.md.
Contexto: quiero trabajar ordenado, sin basura ni parches encima. Hay un inventario de restos en el archivo del chat.
Tarea: dime en una línea qué entendiste. Corre `node tools/limpieza.cjs` y sigue su lista, mostrándome qué borrarías antes de hacerlo. Un grupo de restos por cambio, en un worktree limpio, con pruebas y revisión en 1440 y 390.
No borres nada mío sin preguntarme. Al terminar, usa nexo-cierre y actualiza docs/chats/limpieza.md.
```

## Prompt de continuación
```
Chat: Limpieza y auditoría del código. Lee CLAUDE.md y docs/chats/limpieza.md.
Parte desde "Falta" y pregúntame qué grupo de restos sigue.
```
