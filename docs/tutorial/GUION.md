# Guion del tutorial (borrador 1, 12 oct 2026)

Borrador para que Niquito lo corrija. Solo textos, sin código.
`{nombre}` = nombre que le pone el usuario a su mascota. **G** = Grimorio. **M** = mascota.
Expresiones entre [corchetes]. Los datos de estudio son resúmenes generales de la literatura (no citas exactas): antes de implementar, verificar cada uno.

---

## 0. Despertar del Grimorio (G)

1. [dormido, ronca] "Zzz… ¿eh? ¿Alguien abrió el libro? [sorprendido] ¡Un estudiante! Hace siglos que nadie me abría."
2. [feliz] "Soy el Grimorio. Estudio contigo, tú haces el trabajo y yo me llevo el crédito. Es un buen trato."
3. [pensativo] "Antes de empezar necesitas un compañero. Mira lo que encontré en la repisa…"

## 1. Elegir mascota (G)

4. Aparecen 3 huevos: átomo, vidrio tipo matraz, gelatinoso. [guiño] "Elige uno. Es **para siempre**, así que nada de arrepentirse."
5. Al tocar un huevo, ficha corta:
   - Átomo: "Inteligente. Te corrige con cariño. Probablemente tiene razón."
   - Matraz: "Valiente. Se lanza a todo. A veces sin mirar."
   - Slime: "Dormilón. Vive tranquilo. Duerme más que tú en época de pruebas."
6. [serio] "Última pregunta antes de confirmar: ¿seguro? No hay devolución."
7. Nacimiento con suspenso (~10 s): [sudor nervioso] "Está temblando… ¿es normal? Creo que es normal. ¡NO SÉ SI ES NORMAL!" → [feliz] "¡Nació!"

## 2. Ponerle nombre (G y M)

8. G: "Ahora el nombre. Será el que escuches cuando te alienten y cuando saques un 7. Elige bien."
   Botones sugeridos (átomo: Quark, Mol, Ión · matraz: Chispa, Burbuja, Bruno · slime: Gelatina, Flan, Nube) + campo libre (2–12 letras).
9. G: [serio] "{nombre}. Queda grabado en tinta que no sale. Última confirmación." [Confirmar]
10. M se presenta (según personalidad):
   - Átomo: "Soy {nombre}. Calculé que estudiar contigo tiene una probabilidad alta de éxito."
   - Matraz: "¡Soy {nombre}! ¿Qué explotamos primero? Era broma. Más o menos."
   - Slime: "Hola. Soy {nombre}. …¿Hay almohadas por aquí?"

## 3. Inicio y mascota (M explica)

11. "Este es el **refugio**: tu base. Cambia con la hora del día y el clima, y siempre vuelves aquí."
12. "Toca los objetos. Cada uno hace algo distinto." Uno por uno, los 8 reales del refugio (sacados de `home-scene.js`):
   - **Ventana:** "Resalta la luz de entrada. Cambia con la hora y el clima de verdad."
   - **Báculo estelar:** "Abre la Tienda."
   - **Sillón:** "Tu Perfil: mascota, estadísticas y ajustes."
   - **Mapa enrollado:** "La Bitácora: tus notas y calificaciones."
   - **Pergamino de la pared:** "El calendario con tus fechas."
   - **Estantería:** "La Biblioteca."
   - **Globo dorado:** "El mapa de conocimiento: qué dominas y qué no."
   - **Escritorio:** "Continuar estudiando justo donde lo dejaste."
13. "Aquí me vistes y compras cosas con monedas. Sí, tengo opiniones sobre mi sombrero."
14. Dato: "Volver todos los días, aunque sea poco, ayuda más que estudiar mucho una sola noche (el espaciado funciona)."

## 4. Clases (G)

15. **Ruta al 7:** "Esta ruta sigue el material de tu semestre y se adapta a tu tiempo, a lo que ya sabes y a tus errores."
16. **Evidencia, no sensación:** "Releer da sensación de dominio. Acertar sin ayuda da dominio de verdad. Por eso te pido que respondas antes de mostrarte nada."
    Dato: la práctica de recuperación (responder sin mirar) supera a releer en recordar después (Roediger y Karpicke, 2006).
17. **Repaso espaciado:** "Te hago volver a temas viejos justo antes de que se te olviden. Molesta un poco. Funciona."
    Dato: espaciar el repaso mejora el recuerdo a largo plazo frente a hacerlo todo junto (Cepeda et al., 2006).
18. **Errores como pistas:** [pensativo] "Equivocarte no es el fin. Es información: la ruta se ajusta a lo que fallaste."

## 5. Juegos (G)

19. "La **campaña Camino a la PEP 1**: mapa, jefes y combates que avanzan con tu estudio."
20. "**Desafíos:** retos cortos con premio."
21. "Aquí ganas **monedas**, y las gastas en la tienda del refugio."
22. Dato: "Jugar no es perder el tiempo: te obliga a recordar sin mirar, que es justo lo que funciona."

## 6. Organización y Perfil (G)

23. **Calendario y prioridades:** "Tus fechas de pruebas. Con eso te digo qué estudiar primero."
24. **Notas y labs:** "Tus apuntes y trabajos de laboratorio, en un solo lugar."
25. **Estadísticas y rangos:** "Tu avance real y tus **rangos arcanos**. Subes por evidencia, no por tiempo sentado."
26. **Ajustes e inasistencias:** "Sonido, tutoriales (aquí vuelves a verme) y control de faltas."

## 7. Configurar (G)

27. "Último paso serio. Dime tus **ramos**, las **fechas de pruebas** y cuánto tiempo tienes. Con eso la ruta parte hecha a tu medida."

## 8. Cierre (M entrega monedas)

28. M llega con un saco de monedas: "¡Terminamos! Para ti. Gasta con cabeza." (cantidad mediana)
29. G: [feliz] "Fue un honor. Si me necesitas, estoy en Ajustes. Y no, no me pagan."

---

## Huevos de pascua del Grimorio (borrador)

- Tocarlo mucho: [enojado] "¡Oye! Me desencuaderno."
- 5 toques seguidos: [ojos en espiral] "Me mareé… vi páginas que no existen."
- Inactividad: [dormido] "Zzz… (ronca)" y se despierta al tocar.
- Intentar saltar rápido: [cara de "no me creo esto"] "¿Tan rápido? Te lo pierdes… pero tú sabrás."
- Pulsar Atrás varias veces: "¿Se te olvidó algo? Yo no olvido nada. Soy un libro."

## Pendiente

- Niquito corrige el tono y las bromas.
- Cantidad de monedas: propuesta **150 ⚛** (ver SPEC), a confirmar por Niquito.
- Verificar los datos citados antes de dejarlos en la app.
