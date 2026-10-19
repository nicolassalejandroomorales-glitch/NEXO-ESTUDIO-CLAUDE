# FQ II · PEP 1 · Mapa de qué cae (19 oct 2026)

> **Lo más importante, primero**
> 1. **La PEP 1 se movió: ahora es el miércoles 28 de octubre** (antes 21). Fuente: correo del Dr. Eduardo Pino del lunes 19 oct 2026 («La PEP1 se traslada para el próximo miércoles 28 de octubre»). El **Control 1** sigue el lunes 26 oct (Calendarización Ejercicios FQII 2S2026). El lab 2 del 21 oct no cambia.
> 2. El calendario de Nexo (`dist/semester-2026.js`) **todavía dice 21 oct**. No lo cambié: ese archivo y sus pruebas (`calendario-test`, `organizacion-test`) son del chat de Organización y el cambio las rompe en cadena. Niquito puede mover la fecha en la app (Calendario → editar) o lo hace el chat de Organización.
> 3. Las imágenes `dist/assets/exams/01…04` de FQ II son de **cinética y fotoquímica (PEP 3)**: no entran en la PEP 1. Las pruebas pasadas que sí sirven están en el Drive (abajo).

## 1. Lo que dice la cátedra

| Dato | Valor | Fuente |
|---|---|---|
| Temario PEP 1 | Equilibrio químico, iónico y electroquímico (el Control 1 agrega «soluciones de electrolitos») | Programación 1S2026 (PEP1: «Equilibrio químico, iónico y electroquímico»); Calendarización Ejercicios FQII 2S2026, «Resumen evaluaciones» |
| Peso | PEP 1, 2 y 3 = 80 % de la cátedra, a partes iguales (26,7 % cada una); controles de ejercicios 20 % | Programación 1S2026; `semester-2026.js` |
| Formulario | Permitido: **máximo 2 páginas, solo fórmulas** (sin diagramas ni contenidos); se entrega al terminar | Programación 1S2026, reglas 5 |
| Celulares | Prohibidos | misma, regla 4 |
| Duración | **No dice.** El simulacro usa 100 min como supuesto; confirmar con Pino/Zúñiga | — |
| Profesores | E. Pino (teoría/ejercicios/lab), D. Zúñiga (teoría), M. Zapata (clase de ejercicios 2S2026) | Programación; correos |
| Bibliografía oficial | Lissi (FQ II, USACH), Chang, Levine, Atkins (+ Castellan y Lissi en 1S) | Calendarización 2S2026 y Programación 1S2026 |

## 2. Pruebas y guías pasadas que encontré (Drive «Material Nexo 2026» y correo)

| Material | Qué es | Sirve para |
|---|---|---|
| **Control 1, FQII Q y F, 2S2023** (`Control 1 ej.jpg`, 02/10/23) | Enunciado real: «Reacciones químicas, equilibrio químico y soluciones de electrolitos». 3 problemas | Formato y dificultad |
| **Control 1 revisión** (`Control 1 revisión_231023…pdf`) | Resolución manuscrita de un alumno de ese control | Cómo se desarrolla y qué se espera |
| **PEP 1, 2S2023** (`Pep 1_231022….pdf`) | Resolución manuscrita de un alumno (no es la pauta oficial) | Formato y temas |
| **Guía 1** «Reacciones químicas y equilibrio químico» (2026) | 9 problemas | `fq-01` |
| **Guía 2** «Soluciones de electrolitos» (versión 2S2023, Prof. P. Barrías) | 11 problemas | `fq-02` |
| **Guía 2 y Guía 3 2S2026** (adjuntos de M. Zapata, 15–16 oct) | Electrolitos y equilibrio electroquímico 2026 | **No pude leerlas**: el conector de Gmail no baja adjuntos. Pendiente: Niquito las pasa en foto/PDF a la carpeta del chat |
| «PEP 1 (2024).pdf», «EQUILIBRIO IONICO-SOLO.pdf», «Equilibrio electroquimico.pdf» (carpeta Pino, 2024) | Apuntes de clase de un alumno y las diapositivas de equilibrio iónico (2024) | Pistas de lo que se enseña (Debye–Hückel ampliada, Nernst, pila de concentración) |
| Clases 1–3 de Equilibrio Químico (Pino 2026, carpeta «PINO») y «Clase 2 Soluciones electrolíticas FQII-E» (Zúñiga) | Diapositivas 2026 | Ya convertidas en `fq-01` y `fq-02` |
| «Manual de problemas resueltos» y «Ejercicios .pdf» | Son de **Química Analítica** (Univ. de Navarra), no de FQ II | No usados |

## 3. Qué ha caído (tabla de temas × pruebas)

| Tema | Control 1 2S2023 | PEP 1 2S2023 | Guía 1 / Guía 2 | Apuntes PEP 1 2024 | Clase de Nexo |
|---|---|---|---|---|---|
| Equilibrio desde moles iniciales: ξ, fracciones molares, Kp, Kc, ΔrG° (2A+B⇌3C+2D) | **P1** | — | G1 #8 | — | fq-01 m1/m3 · generador `eqmoles` (nuevo) |
| ΔfG°, ΔfH° → K(25 °C) → K(T) con van't Hoff | **P2** (NO, 1500 °C) | **P1a** (CO₂+H₂, Kc a otra T, ΔH dado) | G1 #2, #6, #9 | sí (van't Hoff) | fq-01 m2/m4 · `kdg`, `vanthoff`, `gibbsvh` (nuevo) |
| Efecto de agregar un gas inerte (Xe) | — | **P1b** | — | sí | fq-01 m4 · `lechatelier` |
| K con coeficientes de actividad/fugacidad (N₂+3H₂⇌2NH₃, 720 K) | — | **P1c** | **G1 #7** | sí (Ka = a) | fq-01 m4 · `actividad` |
| Equilibrio heterogéneo, Kp y Kc, múltiples equilibrios | — | — | G1 #5, #3 | sí | fq-01 m3 · `hetero`, `kpkc` |
| Q contra K, espontaneidad en la célula (glucosa-6-fosfato) | — | — | G1 #4 | sí | fq-01 m2 · `qk` |
| Fuerza iónica de una sal y de una **mezcla** | **P3a, P3b** | P2 | G2 #1, #6, #8 | sí | fq-02 m1/m2 · `fuerza`, `mezcla` (nuevo) |
| γ± con la ley límite de Debye–Hückel | **P3** | **P2** (Na₂SO₄ 0,010 m vs CuSO₄) | G2 #4, #5 | sí | fq-02 m2 · `debye`, `mezcla` |
| m±, a±, expresiones de actividad de una sal | — | **P2** (Na₂SO₄ en m y γ) | G2 #2, #3 | sí | fq-02 m1 · `actividad` |
| Postulados de Debye–Hückel (escrito) | — | **P2c** | G2 #7 (discusión 1:1, 1:2, 2:2) | sí | fq-02 m2 · actividad escrita `m2-w2` (nueva) |
| Solubilidad con actividades (Kps, efecto salino) | — | — | G2 #9, #10, #11 | sí | fq-02 m2 · `solub` |
| Ácido débil, grado de disociación con actividades | — | — | clase 5, diap. 100 | sí | fq-02 m2 · `acidez` |
| Conductividad, Kohlrausch, Ostwald | — | — | lab 2 (Ka por conductimetría, **21 oct**) | — | fq-02 m3 · `conduc` |
| Pila: E°, diagrama, ánodo/cátodo, ΔG = −nFE, K | — | — | G3 2026 (no leída) | sí | fq-03 m1/m2 · `potenciales`, `celdas`, `dg` |
| Nernst y **pila de concentración** (Cu 1,5 M / 0,025 M) | — | — | G3 2026 (no leída) | sí | fq-03 m2 · `nernst` |
| pH por fem, Faraday | — | — | G3 2026 (no leída) | — | fq-03 m3 · `phfem`, `faraday` |

**Cómo leerla.** Cada prueba vista tiene **3 problemas** y combina cálculo largo con una pregunta de teoría breve. Nunca vi una pregunta de pura definición sin números.

## 4. Qué cae más (prioridad para estudiar)

Estimación mía a partir de 2 pruebas + 2 guías + el temario 2026 (**no hay pauta oficial**; es una hipótesis, no una promesa):

1. **Equilibrio químico con números (≈ 35 %)**: moles → ξ → Kp/Kc/ΔG; tablas → K; van't Hoff; inerte; K con γ. Es lo que más repite (aparece en las dos pruebas y en 6 de 9 problemas de la Guía 1).
2. **Electrolitos y Debye–Hückel (≈ 30 %)**: fuerza iónica (incluida la de una mezcla), γ±, a±, y 1 pregunta escrita de teoría.
3. **Electroquímica (≈ 35 % si el Control 1 / PEP 1 2026 la incluyen completa, como dice el temario)**: Nernst, pila de concentración, ΔG y K desde E°. Menos datos históricos: **es el mayor riesgo**; hay que leer la Guía 3 2026.

Lo que **no** cae con evidencia: fugacidad en profundidad, Debye–Hückel extendida con tamaño iónico (aparece en los apuntes de Pino, pero ninguna prueba vista la pide con números), conductividad (va al lab 2 y a la prueba de ciclo del lab, no a la PEP 1).

## 5. Cobertura de Nexo y brechas

| Brecha vista en las pruebas | Qué hice (19 oct) |
|---|---|
| Faltaba el problema largo «desde los moles» (Control 1 P1, G1 #8) | Generador `eqmoles` en `fq-01-gen.js` (reacción genérica A, B, C, D, ξ → n, x, Kp, ΔrG°), conectado a los conceptos del motor `eq.avance` y `eq.kp-kc` y a la prueba final de m3 |
| Faltaba «tablas → K(25 °C) → K(T)» en un solo ejercicio (Control 1 P2, G1 #2, #6) | `gibbsvh`: 10 reacciones con ΔrH° y ΔrG° de tablas, K a otra T (en K o °C), concepto `eq.vanthoff`; prueba final de m4 |
| Faltaba «una sal dentro de una mezcla» (Control 1 P3b, G2 #8) | `mezcla` en `fq-02-gen.js`: I de la mezcla y γ± de la primera sal con I **total**; conceptos `ion.fuerza` e `ion.debye`; prueba final de m2 |
| Faltaban los postulados de Debye–Hückel (PEP 1 2023 P2c) | Actividad escrita `m2-w2` en fq-02 (rúbrica de 4 ideas) |
| Pila de concentración, Nernst, K desde E° | Ya estaban en `fq-03`; sin cambios |
| Duración y pauta global | `docs/fq-pep1-motor/SIMULACRO.md` (100 min, 5 problemas, pauta con puntaje) |
| Guías 2 y 3 de 2026 | **Pendiente**: no se pueden leer desde Gmail. Con esas guías se ajustan los generadores a lo que el Dr. Zapata realmente pide |

Todo lo demás de fq-01, fq-02 y fq-03 queda como estaba.

## 6. Errores o dudas del material (avisados, no copiados)

| Dónde | Qué pasa | Qué hice |
|---|---|---|
| Clase 5, diapositiva 22 (ya avisado) | I = 0,01 en vez de 0,10 | Corregido en `fq-02` |
| Clase 6, «Aplicaciones de FEM» (diap. 83–93, ya avisado) | Datos incoherentes (γ± ≈ 27, pH negativo) | No usados |
| Guía 1 #5 | Dice «NH₄Cl sólido se disocia **en agua**» con «presión de vapor» a 427 y 459 °C: es la descomposición térmica del sólido (NH₄Cl(s) ⇌ NH₃(g) + HCl(g)), y 608 kPa es la presión **total** (p(NH₃) = p(HCl) = 304 kPa, K = (p/p°)² ≈ 9,2 con p° = 1 bar) | Lo explico así en clase; confirmar con el profe cuál p° usan |
| Guía 1 #1 B | «La energía de Gibbs **molar** cambia −2,41 kJ/mol» con Δξ = 0,051 mol: lo que se puede calcular es ΔrG ≈ ΔG/Δξ = −47 kJ/mol **si** −2,41 kJ es el cambio total de G; la palabra «molar» confunde | Ya está así en `fq-01` (slide 51); lo dejo anotado |
| Control 1 2S2023 P2 | El enunciado (transcrito) da «ΔG°f NO(g) = **−**86,7 kJ/mol», pero el valor de tablas es **+86,7** (NO se forma con ΔG > 0; K(25 °C) ≈ 5 × 10⁻³¹, no 10³⁰). Además los datos son por mol de NO y la reacción forma 2 NO: hay que multiplicar por 2 (ΔrH° = 180,8; ΔrG° = +173,4 kJ/mol). La resolución manuscrita del alumno usó −173 400 J y obtuvo K enorme. La segunda temperatura (¿50 °C?) no se lee bien | Usé el signo correcto y ×2 en `gibbsvh`; si en la prueba aparece un dato así, pregunta |
| Guía 2 (2S2023) #11 | «Kps del BaCl₂ = 176,94» no es coherente con 370 g/kg (m = 1,78 mol/kg): 4m³ = 22,5, así que γ±³ saldría 7,9 (γ± ≈ 2). Un γ± real de BaCl₂ a esa molalidad ronda 0,4 | No usé este problema; preguntar al profe |
| Apuntes 2024 (Pino): ejemplo ZnCl₂ 0,005 M | «γ± calculado 0,75 vs experimental 0,789 → SÍ CUMPLE»: es una diferencia de ~5 %; la ley límite empieza a fallar para sales 2:1 sobre ~0,005 m | En clase se dice «aproximadamente» |
| Apuntes 2024 (Pino): Debye–Hückel ampliada | log γ± = A\|z₊z₋\|√I − Cte·I con «Cte = A·B·a·z₊z₋ » mezcla dos aproximaciones y el ejemplo del NaCl 0,1 m (γ± = 0,776) corresponde a ese truco, no a la forma 1/(1+aB√I) | No la uso en ejercicios numéricos hasta ver una prueba que la pida |

## 7. Bibliografía de apoyo

**En el Drive (Material Nexo 2026 → «AÑOS ANTERIORES»):** Chang, *Fisicoquímica para las ciencias químicas y biológicas* (3.ª ed., 2008; PDF de 73 MB en la carpeta de Pino), y «Fisicoquimica Lissi 1» (PDF de 28 MB).

**Fuentes confiables recomendadas (los números de capítulo cambian por edición: abre el índice):**
- Atkins, *Química Física* / *Physical Chemistry*: equilibrio químico (temas 6A–6B), celdas y potenciales (6C–6E), actividades de iones y Debye–Hückel (5F).
- Levine, *Fisicoquímica*: equilibrio en mezclas de gases ideales (cap. 6), equilibrio en sistemas no ideales (cap. 11), soluciones de electrolitos y Debye–Hückel (cap. 13), sistemas electroquímicos (cap. 14).
- Chang (ed. Drive): equilibrio químico y electroquímica al final de los capítulos de termodinámica.
- Libre y en inglés: OpenStax *Chemistry 2e* (equilibrio, termodinámica, electroquímica) y LibreTexts «Physical Chemistry» (ley límite de Debye–Hückel, ecuación de Nernst).

## 8. Plan hasta el 28 de octubre (Niquito dispone de 4 h o más al día)

| Día | Qué | Dónde en Nexo |
|---|---|---|
| Lun 19–mar 20 | Equilibrio químico: misión 1–4 de fq-01 y rondas de `eqmoles`, `gibbsvh` | `#/learn` → FQ II → fq-01 |
| Mié 21 (lab 2 por la tarde) | Electrolitos: fq-02 m1–m2; repasar fuerza iónica y γ± de mezclas | fq-02 |
| Jue 22–vie 23 | fq-02 m3 (conductividad, útil para el lab) y fq-03 m1–m2 | fq-02, fq-03 |
| Sáb 24 | fq-03 m3 + hacer la Guía 3 2026 | fq-03 |
| Dom 25 | **Simulacro completo** (100 min, con formulario de 2 páginas) y corregir con la pauta | `SIMULACRO.md` |
| Lun 26 | Control 1 (misma materia): repasar los errores del simulacro | repaso del motor |
| Mar 27 | Segundo simulacro corto (los 3 problemas que más fallaste) y dormir | `Simulacro PEP` de cada clase |
| **Mié 28** | **PEP 1** | |
