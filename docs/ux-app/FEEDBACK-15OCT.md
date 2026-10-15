# Crítica de la app (aspecto y navegación) por Niquito (15 oct 2026)

Tema: cómo se ve y se siente la app completa, no una pantalla puntual. La del Tutorial está en `docs/tutorial/FEEDBACK-15OCT.md`.
Regla: "Diseñar = conversar". Nada se implementa hasta que él diga "hazlo". Lo marcado con **(entiendo…)** hay que confirmarlo.

## Lo que no le gusta
1. **La versión de computador, en general**: "no me gusta para nada".
2. **Los botones**: "se ven feos, sin personalidad".
3. **La navegación** (barra lateral con Inicio, Aprender, Entrenar, Juegos, Perfil): duda de que le guste, porque
   **ya se navega tocando los objetos de las escenas**; se pregunta "¿para qué?" tener las dos.
4. **Aprender**: el grimorio de esa sección "es muy antiestético". Va a cambiarse. **(entiendo: la pantalla de Aprender con forma de grimorio)**.
5. **"La biblioteca Nexo"**: "no me gusta ya". **(no queda claro a qué pantalla se refiere; preguntar)**.
6. **Animación en general**: falta fluidez y magia en lo que se mueve (ver el Tutorial para el detalle).

## Lo que sí funciona (por contraste)
- El tutorial, su explicación y su marcado de objetos le gustan mucho.
- Las escenas pixel (Inicio) son el estilo del que parte.

## Preguntas abiertas para decidir (conversar, no programar)
- ¿La barra lateral se quita, se achica, o se deja solo en celular?
- ¿Cómo debería verse un botón de Nexo? (¿madera y metal? ¿runa que brilla? ¿pergamino?)
- ¿Cómo debería verse Aprender si no es un grimorio?
- ¿Qué es "la biblioteca Nexo"?

## Orden sugerido (por confirmar con Niquito)
1. Decidir la **navegación** (afecta a todas las pantallas).
2. Diseñar el **botón** y el **panel** de Nexo una vez, con su personalidad (kit `tools/pixel-ui/`).
3. Rehacer **Aprender**.
4. Aplicar el kit al resto, pantalla por pantalla.
