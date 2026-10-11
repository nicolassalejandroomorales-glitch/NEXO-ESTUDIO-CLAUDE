---
name: nexo-cierre
description: Cierre obligatorio de un chat de Nexo cuando Niquito aprueba un cambio o se termina el tema. Actualiza SPEC, ESTADO y CLAUDE.md si hace falta, y hace commit y push.
---

# Cierre de chat

1. **SPEC del tema** (`docs/<cambio>/SPEC.md`): actualiza Hecho / Decisiones / Pendiente.
2. **`docs/ESTADO.md`**: agrega una línea con fecha bajo el tema (qué quedó hecho y dónde está el SPEC). Corta.
3. **`CLAUDE.md`**: solo si se tomó una decisión que deba valer siempre (regla, límite, preferencia, error que no se repite). Una línea, en su sección. Avísale a Niquito en una línea. Nunca borres reglas sin su permiso.
4. **Skills**: si el cambio movió archivos, rutas, pruebas o reglas de una sección, actualiza su skill en `.claude/skills/` (1–2 líneas). Luego corre `node tools/check-skills.cjs`; si marca rutas viejas, corrígelas.
5. Si apareció algo de otro tema: anótalo en el Pendiente de ese SPEC o en `docs/pendientes.md`.
6. **Git**: `git status` → commit en español claro → `git push`.
   - Nunca force push. Nunca subir `.env` ni claves.
   - Conflicto o algo raro: detente y explícalo en simple antes de hacer nada.
7. Cuéntale a Niquito en 1–2 líneas qué se subió.
