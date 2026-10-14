# Prompt para el próximo chat (Tutorial: recorrido por la app real)

Pega esto en un chat nuevo (Sonnet 5.5 · esfuerzo medio; si el motor del foco se complica, sube el esfuerzo antes que el modelo):

```
Continuamos el tema Tutorial de Nexo. Lee CLAUDE.md y docs/tutorial/SPEC.md (sección "REDISEÑO: recorrido por la app real"). Dime en una línea qué entendiste.

Qué pasó: el tutorial actual es una escena aparte con paneles falsos y a Niquito no le gusta. Quiere que el Grimorio EXPLORE la app de verdad: navegar a cada pantalla real, oscurecer el resto y resaltar con un halo lo que explica. Ya decidimos: estilo mixto (foco + Siguiente, y "hazlo tú" en 3–4 momentos), el inicio de huevos/nombre se queda igual, y solo lo principal (5 pantallas, ~4–5 min). También pidió que el audio de la voz esté SINCRONIZADO con las letras (blip por letra programado con el reloj de audio, pausa en los signos).

Trabaja en el worktree limpio C:\Users\Hp\Desktop\NEXO_tutorial (desde origin/master), porque mi carpeta principal tiene cambios del Inicio sin subir.

Pasos: 1) lee el SPEC y mira la app real para confirmar los selectores (nav, cabecera, refugio, tarjetas); 2) crea dist/tutorial/recorrido.js (motor de foco con salto si el objetivo no existe y salida si nada pasa en ~10 s) y conéctalo reemplazando los paneles falsos (pasos 14–27 de tutorial.js); 3) arregla el audio; 4) verifica en 1440 y 390 con texto y UNA captura al final; 5) cuando yo apruebe: nexo-cierre, commit, push y republicar el Artifact (https://claude.ai/artifact/KGcGV5EDNqJMgtQCmMAYbh).

Pendiente aparte: preguntarme (con selección múltiple) qué hacer con el premio en cuentas con nube; no toques Supabase sin mi permiso.

Explícame todo simple y avísame si el chat se pone largo.
```
