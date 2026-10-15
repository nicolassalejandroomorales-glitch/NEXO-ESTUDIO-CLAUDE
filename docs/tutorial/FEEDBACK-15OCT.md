# Crítica del Tutorial por Niquito (15 oct 2026)

Dicha en voz alta, tras probarlo entero. Está ordenada por **sección** para poder rehacer cada una sin tocar las demás.
Lo marcado con **(entiendo…)** es mi interpretación; confirmar con Niquito antes de programar.
Regla de este tema: "Diseñar = conversar". Nada de esto se implementa hasta que él diga "hazlo".

## Lo que le gusta (no tocar)
- La secuencia **huevo → nacimiento → ponerle nombre**: "ya, nació, todo bien", "me gusta".
- La **explicación** de cada parte y cómo se **marca** lo que explica (resalte de objetos): "me encanta".
- Poder **saltar secciones** y **apagar la música**: "muy bueno".
- Que el tutorial explique **todo**: Inicio, Aprender, Entrenar, Juegos, Perfil y "todas las cosas que hay detrás".
- El dado no importa (se puede dejar como está o quitar).

## Principio general (lo que más falta)
- **Animación fluida y bonita de verdad**, no imágenes (PNG) que se mueven. Lo que ve hoy es "un PNG con una boca que se mueve y flota".
- **Magia visible y en movimiento**: partículas, runas, brillos, humo. Hoy "no se ve mágico".
- **Personalidad en el texto**: hoy suena "muy NPC". Quiere voz propia, efectos al escribir, ritmo.

## Por sección

### 1. Grimorio (el guía)
- Más personalidad, más movimiento y más fluidez en su animación (hoy: PNG con boca que se mueve y flota).
- **El libro** con más magia: runas, luces, movimiento.
- **El altar**: velas cuyas llamas se muevan; que todo se vea mágico.
- **La nube de diálogo** se ve como un PNG: sin movimiento ni partículas, nada mágica.
- **El sonido/voz del mago no le gusta**. (Hoy es una voz por letra estilo videojuego.)

### 2. Texto y diálogo
- Sin personalidad ("NPC"). Quiere más carácter y efectos al aparecer el texto.
- **(entiendo)** que al apretar "siguiente" la pantalla **salta hacia arriba** de repente; no le gusta. Revisar en qué pasos pasa.

### 3. Fondo de la pantalla de inicio del tutorial
- El **fondo azul** no le gusta: "se ve horrible".
- Quiere **runas detrás, magia pura**, y que **se muevan**.

### 4. Elegir el huevo
- Los huevos son PNG: quiere **mejor textura y que se muevan**.
- Mismo fondo que arriba (sin azul plano; con magia).

### 5. Después de elegir y nacer
- La mascota debe **hablar con la personalidad del slime, del átomo o del matraz** (cada una distinta).
- Quiere que al nacer haga un **"dab"**. **(entiendo: el dab que ya existe en las mascotas pixel; confirmar)**.

### 6. Recorrido por la app (Inicio, Aprender, Entrenar, Juegos, Perfil)
- Mantener la explicación y el marcado; **añadirle animaciones** al recorrido.
- Debe **explicar también lo que hay detrás** de cada pantalla.
- **Hacerlo modular por secciones**: Niquito va a **seguir cambiando partes de la app** (por ejemplo, Aprender se va a rehacer porque el grimorio de ahí le parece antiestético). Cada sección del tutorial debe poder cambiarse sin romper las otras.

## Para el diseño (cuando toque)
- Estructura propuesta: un archivo/paso por sección en `dist/tutorial/` y un bloque del GUION por sección, para reemplazar una sin tocar el resto.
- Animación: pasar de "imagen que se mueve" a **capas y partículas** (canvas o hojas de sprites por cuadro), como ya hace `dist/ambient/refugio-vida.js` en el Inicio.
- Sonido: probar voces distintas (o sin voz, solo un "blip" suave por sílaba) y dejarlo elegir.
