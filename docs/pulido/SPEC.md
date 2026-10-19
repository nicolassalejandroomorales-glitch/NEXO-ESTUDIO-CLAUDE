# Pulido para el lanzamiento (19 oct 2026)

Se rehace porque el commit original ("Pulido para el lanzamiento…") se hizo en otro entorno y nunca llegó a esta copia. Decisiones de Niquito (preguntas del 19 oct).

## Qué
1. **Intro del umbral** (`dist/tutorial/umbral.js`, nuevo): larga y narrada (~20 s), voz de alquimista contando la leyenda de la torre. **Saltable** con un toque.
2. **Tutorial**: humor chileno marcado en todos los diálogos (`tutorial.js` STEPS). Mascota obligatoria (no se puede cerrar hasta elegirla); el resto del tutorial se puede cerrar. **Contador real**: cuenta solo los objetos que de verdad se dibujan en el refugio (hoy 7) y es **obligatorio tocar todos** para seguir.
3. **Grimorio vivo** (`grimorio-vivo.js`): estilo juguetón con resortes: rebota al aparecer, se estira al hablar, respira/flota siempre.
4. **Reloj del Inicio en móvil**: tamaño mini por defecto + botón para ocultar; recuerda la elección (localStorage con try/catch).
5. **Música**: activada por defecto a volumen alto (`musicVolume` en `audio.js`), ajustable en Ajustes. Suena tras el primer gesto (regla del navegador).
6. **Sótano inmersivo**: pantalla completa automática al entrar + aviso animado de "gira el celular" si está vertical. Botón de salir arriba a la izquierda, siempre visible. Capa viva nueva (`dist/aprender/sotano-fx.js`): luciérnagas, polvo y cristales que pulsan; baja la cantidad sola si el celular va lento.

## Decisiones
- Orden de trabajo: lo que ve el usuario nuevo (1-3) → reloj y música (4-5) → Sótano (6).
- Archivos compartidos (`app.js`, `update01.css`): tocar lo mínimo; lo nuevo va en archivos propios.
- Nada de parches encima ni código viejo; lo que quede sin uso se borra.

## Cómo
- Verificar con texto (read_page, consola) y una captura final. Probar en 1440x900, 390x844 y 844x390.
- `node tools/build-startup.cjs` y `node tools/run-tests.cjs` al terminar cada parte. Ya fallaban antes: `academic-test.cjs` y `database-test.cjs`.

## Criterios de aceptación
- La intro dura ~20 s y se salta con un toque.
- El contador dice "x de N" con N = objetos visibles en el refugio, y "Seguir" solo se activa con todos tocados.
- En móvil el reloj es mini y se oculta/muestra con un botón; se recuerda al recargar.
- Música activa a volumen alto desde el primer toque.
- Sótano: fullscreen, aviso de giro, salir visible, animación fluida.

## Hecho (19 oct 2026)
- Intro `umbral.js` (20 s, saltable), diálogos con humor chileno, contador real 0/7 obligatorio, "Salir" oculto hasta tener mascota.
- Grimorio con rebote al aparecer y estirón al hablar. Reloj móvil mini + botón Ocultar/Reloj. Música activa a volumen 0.8 por defecto.
- Sótano: pantalla completa fija (esconde barras de la app), pantalla completa del navegador, aviso de giro, salir arriba a la izquierda, capa viva `sotano-fx.js`.
- Verificado en 844x390, 390x844 y escritorio (texto + capturas); 43/43 pruebas.

## Pendiente
- Trailer: el fondo se ve como "png roñoso". Preguntar si es el video (`tools/trailer/trailer.py`) o la pantalla de entrada y proponer 2 opciones (tema aparte).
- Probar en un celular real: pantalla completa, bloqueo horizontal y fluidez de la capa viva (el navegador del escritorio no lo prueba).
- La música ahora parte activa: revisar que no moleste en el tutorial.
- Pantalla de entrada (`#/entrada`): se ve plana; es candidata del trailer.
