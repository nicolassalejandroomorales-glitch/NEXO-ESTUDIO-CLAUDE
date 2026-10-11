# Réplica a los otros ramos · solo PEP 1

Pedido de Niquito (6 oct 2026): replicar la clase viva y la Torre del Sauce en los demás ramos, buscando el material en el Drive,
pero solo para la PEP 1. Primero se mide si Nexo sirve (experimento, `docs/replica-pep1/` se completará con eso más adelante).

## Qué entra en cada PEP 1 (según el material oficial del Drive)

| Ramo | PEP 1 | Qué entra | Material en el Drive (2S QYF 2026) | Falta |
|---|---|---|---|---|
| Fisicoquímica II | **mi 21 oct** | Equilibrio químico (reacciones, grado de avance, ΔrG, K, Kp/Kc, van't Hoff, actividad), soluciones de electrolitos, equilibrio iónico y electroquímico | Clases 1–3 de Equilibrio (Pino), Guía 1, ejercicios de la clase 1 (Zúñiga), calendarización | Diapositivas de **electrolitos** y de **equilibrio iónico / electroquímico** (clases del 30-09 al 20-10) |
| Orgánica II | ma 27 oct | Aminas (hecha), aromáticos (aromaticidad, SEA, orientación) y heterociclos | PPT 2025: Aminas, Aromáticos I, Aromáticos II | PPT 2026 de aromáticos (si cambiaron); pauta de una PEP 1 anterior |
| Fisiopatología | ju 12 nov | Sistema **nervioso**, **respiratorio** y **digestivo** | Programa 2026-2, clase introductoria | Clases de nervioso (1–3), respiratorio y digestivo; seminarios |
| Química Analítica | vi 13 nov | Conceptos y etapas del análisis químico, errores, introducción a la volumetría y volumetría ácido-base | Presentación del curso, Conceptos, Etapas del análisis | Clases de **errores** y **volumetría ácido-base**; guías de ejercicios |

## Lo que hubo que diseñar o cambiar

1. **Respuesta numérica con unidades** (hecho): tipo de actividad `number` en el aula. Acepta coma decimal y notación científica,
   corrige con tolerancia relativa, puede pedir elegir la unidad y reconoce resultados de errores típicos (`traps`). Cuenta como
   escalón 5 (producir solo). Lo necesitan Fisicoquímica y Analítica. En la plantilla y en las pruebas.
2. **Calendario** (hecho): PEP 1 de Fisiopatología el 12 de noviembre (el programa dice "2024-II" en el título del calendario:
   confirmar) y la PEP 1 de FQ II confirmada el miércoles 21 de octubre.
3. **Catálogo de temas de Fisiopatología mal armado** (hecho): la app dice "PEP 1 · SNC y endocrino", pero la PEP 1 real es
   nervioso, respiratorio y digestivo (endocrino va a la PEP 2). Hay que rehacer los temas fis-01…fis-09 según el programa.
4. **Fisiopatología no es química**: sin editor de moléculas, flechas ni laboratorio de reacciones. Se usa el caso clínico
   (causa → mecanismo → signo) con las actividades que ya existen (ordenar cadenas, clasificar, el aprendiz que se equivocó, escrita).
   El laboratorio puede ser de "qué pasa si…" (fisiología alterada) en vez de reactivos.
5. **Torre con varias clases** (por hacer): hoy la torre muestra una clase por ramo. Orgánica tendrá Aminas + Aromáticos en la
   misma PEP: la torre del ramo debe juntar los conceptos de todas sus clases de la PEP 1.

## Orden de trabajo (por fecha de la prueba)

1. **Fisicoquímica II — Equilibrio químico** (`fq-01`) con lo que ya está en el Drive. Electrolitos y equilibrio iónico/electroquímico
   cuando suban las diapositivas.
2. **Orgánica II — Aromáticos y heterociclos** (`org-04`, `org-05`).
3. **Fisiopatología — Nervioso, respiratorio y digestivo** (después de rehacer su catálogo).
4. **Química Analítica — Etapas, errores y volumetría ácido-base**.

## Avance (6 oct 2026)

- [x] Fisicoquímica `fq-01` · [x] Orgánica `org-04`, `org-05` · [x] Analítica `ana-01`, `ana-02`, `ana-03` (ver `docs/clase-ana-pep1/SPEC.md`)
- [x] Fisiopatología: catálogo rehecho y clases `fis-01`, `fis-02`, `fis-06`, `fis-09` (ver `docs/clase-fis-pep1/SPEC.md`)

Cada clase: SPEC corto, contenido con fuente por diapositiva, generadores, pruebas, ANTES/AHORA y revisión humana de la química.
