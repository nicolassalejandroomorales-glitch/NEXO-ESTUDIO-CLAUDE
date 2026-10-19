# Orgánica II · PEP 1 (martes 27 oct 2026): qué cae y dónde se enseña (19 oct 2026)

Estado de las tres clases (`org-01` Aminas, `org-04` Aromaticidad, `org-05` SEA): **borrador** hasta que Niquito las apruebe.
Este mapa reemplaza al de `docs/estudio-organica/MAPA_PEP1.md` solo en lo del "qué cae"; el método de estudio de ese archivo sigue valiendo.

## 1. Qué cayó en la PEP 1 2025 (pauta: `dist/assets/exams/13_org2_pep1_2025_aminas_aromaticos.jpg` y `07_org2_aminas_aromaticidad_productos.jpg`)

Prueba de 15 puntos (Dr. J. Echeverría y Dr. J. A. Ortiz). Las preguntas 4 a 6 vienen en la foto 07.

| P | Pts | Qué pide | Respuesta de la pauta | Dónde se practica |
|---|---|---|---|---|
| 1a | 2 (P1 completa) | p-bromotolueno + 1) HNO₃/H₂SO₄ 2) Fe/HCl 3) CH₃COCl | NO₂ en orto al CH₃, luego NH₂, luego amida | org-05 m2 (`m2-p6`) |
| 1b | | Benceno + 1) PrCl/AlCl₃ 2) SO₃/H₂SO₄ 3) CH₃COCl/AlCl₃ 4) H₃O⁺, calor | isopropilo (reordenamiento), SO₃H bloquea para, acetilo en orto, se quita el SO₃H | org-05 m2 (`m2-p7`) |
| 2a | 4 (P2 completa) | Desde benceno: benzamida | CH₃Cl/AlCl₃, KMnO₄, SOCl₂, NH₃ | org-05 m3 (`m3-p10`) |
| 2b | | Desde benceno: 1-cloro-4-propilbenceno | CH₃CH₂COCl/AlCl₃, Zn(Hg)/HCl, Cl₂/AlCl₃ | org-05 m3 (`m3-p11`) |
| 3 | 1 | Ordenar 4 compuestos nitrogenados por basicidad (pirrol-tipo, 2-metilpiridina, amina con Cl, imidazol-tipo) | la pauta marca `d < b < c < a` (la foto es borrosa: **cotejar la numeración con la hoja original**) | org-01 m5 |
| 4 | 3 | Aminas y reactivos: a) anilina → sal de diazonio (NaNO₂/HCl); b) N,N-dimetilbencilamina; c) sal de amonio cuaternario desde NH₃ y haluro | ver pauta | org-01 m6 y m7 |
| 5 | 3 | Clasificar aromático/antiaromático/no aromático con Hückel: a) anillo no conjugado; b) catión ciclopropenilo; c) azuleno | b y c aromáticos (4n+2 = 2 y 10); a "no conjugado, no aromático" | org-04 m2 |
| 6 | 2 | Productos: a) 2-metilpirrolidina + CH₃I en exceso, Ag₂O, calor (Hofmann); b) ftalimida + KOH, bromuro de propilo, hidracina (Gabriel) | alqueno/amina tras Hofmann; propilamina | org-01 m6 y m7 |

**Reparto de puntos:** Aminas (P3 + P4 + P6) = 6; SEA y rutas (P1 + P2) = 6; Aromaticidad (P5) = 3.
Los rótulos `P1…P6` de `goal`, `pep:` y "Estilo PEP" de org-04 y org-05 estaban corridos (decían P1 para Hückel); se corrigieron a esta numeración real.

## 2. Qué dice el temario 2026 (diapositivas de cátedra) y si la clase lo cubre

Fuente: PDF de cátedra 2S-2025 (Dr. Echeverría); en Descargas solo encontré estos PDF 2S-2025 (no revisé si el Classroom ya subió versiones 2026).

| Tema (diapositivas) | Clase | Cubierto |
|---|---|---|
| Aminas 1–28 (nombres, geometría, solubilidad, sales, basicidad) | org-01 m1–m5 | sí |
| Aminas 29–33 (alquilación, azida, Gabriel, aminación reductiva) | org-01 m6 | sí |
| Aminas 34–40 (acilación, Hofmann, diazonio/Sandmeyer) | org-01 m7 r1–r3 | sí |
| **Aminas 41–43 y 50: reactividad de pirrol y piridina** (Br₂ 0 °C → 2-bromopirrol 90 %; Br₂ 300 °C → 3-bromopiridina 30 %) | org-01 m7 **r4 (nueva)** | **estaba sin cubrir; agregado hoy** |
| Aminas 44–47 (IR, RMN, masas) | org-01 m8 | sí |
| Aromáticos I 1–50 (estabilidad, OM, Hückel, heterociclos, nombres, espectros) | org-04 m1–m3 | sí (ya citaba las diapositivas del PDF) |
| Aromáticos II 2–19 (complejo σ, halogenación, nitración, sulfonación) | org-05 m1 | sí |
| Aromáticos II 20–47 (orientación, activadores, halógenos, varios grupos) | org-05 m2 | sí |
| Aromáticos II 48–59 (Friedel-Crafts, síntesis) | org-05 m3 | sí |
| Aromáticos II 60–61 (SNA) | org-05 m3 r3 | sí |

**Qué se hizo hoy con las diapositivas:** se convirtieron los PDF de Aromáticos I (50 diap.) y II (62 diap.) con `tools/classroom-art/slides.py` a `dist/assets/classes/org-04|05/slides/` y `dist/classes/slides/org-04|05.js`.
org-05 usaba una numeración propia (1–49) porque el PDF no traía número legible; **se reasignó cada actividad a su diapositiva real** (los números nuevos son los de la página del PDF).
Diapositivas de org-05 que son solo esquemas/imágenes sin texto: 6–7, 9, 15, 18, 27, 31, 35, 38, 42–43, 49, 54, 56–59 y 62.

## 3. Guías 2021 como práctica (Dr. Echeverría; sin solucionario completo, el de la guía 1A solo trae "I, I, II")

Las respuestas de los ítems nuevos las razonó Claude con química estándar; **no vienen de un solucionario del curso. Cotejar con él o con el libro.**

| Guía | Ejercicio | Dónde |
|---|---|---|
| SEA 5e (p-metilanisol + CH₃COCl/AlCl₃) y 5g (ácido p-etilbencensulfónico + HNO₃/H₂SO₄) | `m2-p9`, `m2-p10` de org-05 |
| Aromáticos 7 (2-piridona) y 9 (ciprofloxacina: N básico) | `m3-p10`, `m3-p11` de org-04 (el de ciprofloxacina depende de la estructura dibujada en la guía, que no se pudo leer en texto) |
| Aminas 8 (sulfonación de piridina) | `m7-h3` de org-01 |
| Aminas 9a (2-bromopiridina + NaNH₂) y 9b (3-bromopiridina: mezcla 3-/4-amino) | `m3-p13`, `m3-p14` de org-05 |

**Ya cubiertos por los generadores o por las clases** (sin cambios): SEA 1 y 3–4 (orientación, Friedel-Crafts, reordenamiento, polialquilación), Aminas 1, 2, 4, 10–11, 12–13 (Hofmann), 16 (Sandmeyer), Aromáticos 4–6 y 8 (Hückel), 10 (nombres).

**Fuera de las diapositivas (se dejó como pendiente, preguntar a Niquito si cae en 2026):** Aminas 3 (quiralidad de aminas: inversión del N, ya mencionada en org-01 m1), 14 (N-óxidos de amina, eliminación de Cope), 15 (nitrosación de 1°/2°/3° alifáticas), 7 (fragmentación MS m/z 58), 5–6 (RMN/espectros de aminas, estructuras en imágenes que no se pudieron leer);
SEA 4k (Gattermann-Koch: CO/HCl/AlCl₃) y 4l (malonil dicloruro); Aromáticos 2 (ΔH con figura).
El mecanismo del piridino (guía 9b) y el de la piridina con NaNH₂ **no están en las diapositivas 2025**: se marcaron con la fuente "guía 2021".

## 4. Errores y límites encontrados

- Los apuntes de Obsidian (de un amigo) tienen el pKa de piridinio y pirrolio mal (ver `docs/estudio-organica/MAPA_PEP1.md`); no se usaron como fuente.
- La imagen de la pauta (P3, P5a) es de baja resolución: transcripción de basicidad y del anillo de 7 miembros por confirmar con Niquito (él tiene el papel).

## 5. Bibliografía (cada actividad ya apunta a su diapositiva; esto es solo para profundizar)

- Cátedra: PPT 2S-2025 del Dr. Echeverría (Aminas, Aromáticos I y II) y guías 2021.
- Drive de Niquito: `Química_Organica_Wade_Vol_I.pdf` y `Carey - Química orgánica 6a Ed.pdf` (carpeta Química Orgánica I). **No se encontró en el Drive el libro oficial de Orgánica II ni los capítulos exactos**; los números de capítulo de abajo salen de las ediciones en inglés y hay que cotejarlos con la edición en español.
- OpenStax, *Organic Chemistry* (McMurry; gratis en openstax.org). **Cotejado el 19 oct:** cap. 16 = Chemistry of Benzene: SEA (sec. 16.1 bromación: FeBr₃ polariza el Br₂, complejo σ no aromático, sustitución y no adición) y sec. 24.9 Heterocyclic Amines (pirrol reacciona en C2 con 3 formas de resonancia contra 2 en C3; piridina reacciona en C3, mal, y su bromación pide ≈300 °C con ≈30 % de 3-bromopiridina). Eso confirma las diap. 42/50 y las actividades  de org-01. El cap. 15 (aromaticidad) no se abrió.
- Wade, *Organic Chemistry*: cap. 16 (aromáticos) y 17 (reacciones de aromáticos), como ya decían los encabezados de org-04 y org-05.

## 6. Qué falta para sacar de "borrador" (lo hace Niquito)

1. Resolver la PEP 2025 completa en el aula, sin ayuda (es el simulacro); decir qué preguntas le parecieron distintas al examen real.
2. Revisar la química de las actividades nuevas (`m2-p6…p10`, `m3-p10…p14` de org-05; `m3-p10`, `m3-p11` de org-04; `m7-h1…h4` de org-01).
3. Confirmar con su profesor o Classroom si pirrol/piridina (diap. 42) y la guía de aminas (N-óxidos, nitrosación) caen en la PEP 2026.
4. Revisar en el celular real (390) la lectura de las diapositivas.
