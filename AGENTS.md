# Nexo — instrucciones para Codex

Antes de hacer nada, lee `CLAUDE.md` (reglas del proyecto, mapa del código y límites). Todo lo que dice ahí también vale para ti.
Idioma: **español**. El autor (Niquito) está aprendiendo a programar: explica en simple qué hiciste y por qué.

## Reglas clave
- No hay framework ni paso de compilación: el código vive en `dist/`.
- `dist/startup-bundle.js` es **generado**. Nunca lo edites a mano. Si cambias módulos de `dist/` que van en el bundle, corre `node tools/build-startup.cjs`.
- Pruebas: `npm test` (corre todo `tools/*-test.cjs`). Prueba nueva = archivo `tools/<algo>-test.cjs`.
- `dist/app.js` es muy grande (184 KB): no lo leas entero; busca con grep y lee solo el tramo.
- No toques Supabase, SQL, migraciones, OAuth ni servicios externos. No uses force push. No subas claves.
- No cambies el diseño visual ni el pixel art sin que se pida: eso lo hace Claude.
- Un cambio = un tema. Si ves algo de otro tema, anótalo en el informe, no lo arregles.

## Dónde mirar
- `docs/ESTADO.md` = historial. `docs/<tema>/SPEC.md` = diseño de cada tema.
- Skills con detalles por tema: `.claude/skills/*/SKILL.md` (léelas como documentación).
- Tareas de auditoría: ver `AUDITORIA_CODEX.md`.
