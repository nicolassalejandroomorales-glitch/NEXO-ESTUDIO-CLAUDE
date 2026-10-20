# Analítica · PEP 1 (13 nov 2026): qué cae y qué cubren las clases

Sesión «clases PEP 1 con el motor» (19 oct 2026). Clases: `ana-01`, `ana-02`, `ana-03`. Todas siguen en `status: 'borrador'` hasta que Niquito las apruebe.

## 1. Alcance oficial de la PEP 1
Programa 2026 (Drive: Material Nexo 2026 › ANALITICA › TEORIA › PPT CLASES, `1.2_QF_CURSO QUÍMICA ANALÍTICA_2°_2026.pdf`):
**PEP 1 = 30 % de la teoría** = «Conceptos analíticos, etapas y errores, introducción al análisis volumétrico y **volumetría ácido-base**». Los PEP 2 (complejos y óxido-reducción) y 3 (precipitación y gravimetría) no entran.
Bibliografía del programa: Skoog, West, Holler y Crouch (7.ª ed.) · Christian · Harris · Hamilton/Simpson/Ellis · Marchante et al. (Habana).

## 2. Pruebas pasadas (escaneadas, sin texto: leídas a mano)
### `analitica_pep1_historica.pdf` (PEP 1, resuelta por una alumna, 7 páginas, 40 puntos)
| P | Pts | Qué pide | Tema | Clase |
|---|---|---|---|---|
| 1 | 10 | Diagrama de flujo con las etapas del análisis y explicar cada una | Etapas | ana-01 m1 |
| 2 | 5 | Dibujar en un mismo gráfico las curvas de 25 mL de 4 ácidos débiles 0,1 M (Ka = 10⁻³, 10⁻⁵, 10⁻⁷, 10⁻⁹) con NaOH 0,1 M y discutir | Curva ácido débil vs Ka | ana-03 m2 |
| 3 | 15 | Ácido fólico (H₂Fol, 441 g/mol, **diprótico**): 50 mL de extracto + KOH 0,01 M, gasto 10 mL. a) mg/mL, b) equivalentes, c) fracciones para 200 µg/día | **Equivalentes, PE = PM/n, normalidad, estequiometría** | ana-02 m2 |
| 4 | 10 | 3 dispensadores de jarabe (296 mL), 5 botellas cada uno: media, mediana, s, error absoluto y relativo, ¿cuál es más exacto y preciso? | Exactitud y precisión | ana-01 m2 |

Formulario que entregan: N = eq/L, eq = g/PE, PE = PM/n; varianza y s (n − 1); Ea, Er; CV; «constante de acidez Ka».
Lo que el puntaje de la alumna enseña: P3 salió mal por **estequiometría** (convirtió mol de KOH en gramos de ácido sin dividir por 2) y por confundir mg con g (0,882 en vez de 0,441 mg/mL).

### `analitica_pep2_historica.pdf` (PEP 2, 11 de julio, 60 puntos)
Complejometría con EDTA (calamina, ZnO/Fe₂O₃, enmascarar Fe), precipitación + redox con KMnO₄ (ZnC₂O₄), curvas EDTA vs pH y elección de valorante redox. **Fuera de la PEP 1**, pero confirma el patrón: cada pregunta mezcla ecuaciones, estequiometría con alícuotas y un % en la muestra.

### Patrones persistentes
1. Siempre hay un bloque de **cálculo con estequiometría** (equivalentes o mmol) y un **% o concentración final**.
2. Siempre una pregunta **de dibujo/discusión** (diagrama de flujo, curvas).
3. Los datos «de laboratorio» se dan en tabla y hay que **elegir al mejor** (exactitud + precisión).
4. Nunca piden memorizar fórmulas: las dan en el formulario.

## 3. Guía 1 2026 y controles (Prof. Matías Vidal)
Material de la sesión de ejercicios del 8 oct (correo «Materiales»): errores y análisis de datos (media, s, Er, test Q de Dixon, comparar métodos). **Ya integrada** en `ana-01` m2 (test Q con Ca en suero; generadores `dixon` y `comparar`). Control 1 = 19 oct.

## 4. Diapositivas de cátedra y qué cubre cada clase
| Tema del temario | Diapositivas (Dra. Pizarro) | Clase | Estado antes | Estado ahora |
|---|---|---|---|---|
| Conceptos y etapas | Conceptos (89 diap.) | ana-01 m1 | ✔ | ✔ + generador de etapas ya en formato PEP |
| Errores, exactitud, precisión, Dixon | Errores (diap. 49–57, 66, 83–88) | ana-01 m2 | ✔ | ✔ + **generador `dispensador`** (P4 de la PEP) + **aviso de la diap. 87** |
| Análisis volumétrico: piezas, patrón | Volumetría (35 diap.) 2–28 | ana-02 m1 | ✔ | ✔ |
| **Equivalentes, normalidad, «eqp = eqa», vinagre/FAK** | Volumetría diap. 29–34 | ana-02 | ✘ **no estaba** (todo en mmol) | ✔ parte nueva m2 + generador `equiv` (P3 de la PEP) |
| Fuerte–fuerte, indicadores | Ácido-base diap. 10–30 | ana-03 m1 | ✔ | ✔ |
| Ácido débil, tampón, HH | Ácido-base diap. 31–48 | ana-03 m2 | ✔ (sin capacidad amortiguadora ni preparación de tampón) | ✔ + **comparar Ka (P2 de la PEP)** y tampón en m3 |
| **Base débil con ácido fuerte** | diap. 50–51 | ana-03 | ✘ | ✔ m3 |
| **Diprótico paso a paso** (curva de 7 puntos) | diap. 52, 55–58 | ana-03 | ✘ (solo «promedio de pKa») | ✔ m3 |
| **Anfolitos** | diap. 53–54 | ana-03 | ✘ | ✔ m3 |
| Polipróticos en general | diap. 59–60 | ana-03 m2 | ✔ parcial | ✔ m2 + m3 |
| **Diagramas de distribución (α)** | **No están en las PPT**. Skoog (sistemas ácido/base complejos) y Harris (cap. sobre polipróticos) | ana-03 | ✘ | ✔ m3, marcado como «libro» |
| **Mezclas** (HCl + ácido débil; NaOH/Na₂CO₃/NaHCO₃) | **No están en las PPT**. Skoog (aplicaciones de titulaciones de neutralización) y Harris | ana-03 | ✘ | ✔ m3, marcado como «libro» |

## 5. Errores del material de cátedra (avisados dentro de la clase)
**Diapositiva 87 de Pizarro («Apliquemos lo aprendido», errores absoluto y relativo)**: dos de las cuatro respuestas están mal.
| Fila | Datos | Respuesta de la diapositiva | Correcto |
|---|---|---|---|
| A | 22,62 g vs 22,57 g | E 0,05 g; Er 0,22 % | ✔ 0,2215 % |
| B | 45,02 mL vs 45,31 mL | E 0,29 mL; **Er 0,006 %** | **Er = 0,29/45,31 = 0,640 %** |
| C | 2,68 % vs 2,71 % | E 0,03 %; **Er 0,71 %** | **Er = 0,03/2,71 = 1,107 %** (el 0,71 % es el de la fila D) |
| D | 85,6 cm vs 85 cm | E 0,60 cm; Er 0,71 % | ✔ 0,706 % |
(La nota anterior del chat solo anotaba la fila B; la C también está mal.)

## 6. Fuentes nuevas y cómo se cotejaron
- pKa de H₃PO₄ (2,15 · 7,20 · 12,35): diap. 59 (Ka = 7,11e-3; 6,32e-8; 4,5e-13).
- Kb de bases (amoníaco 1,8e-5, etilamina, anilina…): tabla de la diap. 31.
- pKa de H₂CO₃ (6,35 · 10,33), ácido oxálico (1,25 · 4,27), ftalato (2,95 · 5,41), glicina (2,35 · 9,78), NH₄⁺ (9,24): Harvey, *Analytical Chemistry 2.1*, apéndice «Acid Dissociation Constants» (chem.libretexts.org). Coinciden con el apéndice de Harris.
- Ejemplo de diprótico (base B, pKb 4,0 y 9,0; 10 mL, HCl 0,1 M): diap. 55–58; los 7 puntos (11,5 · 10,0 · 7,5 · 5,0 · 3,24 · 1,84) recalculados en Python y coinciden.
- Mezclas con carbonato (fenolftaleína/naranja de metilo, método de Warder): Skoog (Fundamentos, aplicaciones de neutralización) y Harris. **Pendiente: Niquito confirma la página exacta en su ejemplar** (el PDF de Skoog del Drive pesa 21 MB y no se abrió entero).

## 7. Pendiente
- Pauta y reparto de puntos de la PEP 1 2026: se desconoce; el «camino al 7» sigue usando un reparto estimado (ana-01 35 · ana-02 25 · ana-03 40). La PEP histórica suma 40 puntos y la ácido-base pesa solo 5 → ajustar cuando salgan las fechas/puntajes.
- Revisión química de Niquito de las tres clases (por eso siguen en `borrador`).
- Probar en celular real (390).
