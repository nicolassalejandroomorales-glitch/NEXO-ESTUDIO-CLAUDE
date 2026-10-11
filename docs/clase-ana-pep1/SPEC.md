# Química Analítica · PEP 1 (viernes 13 de noviembre)

## Qué
Tres clases nuevas para la PEP 1 de Analítica, con la misma estructura que Orgánica y Fisicoquímica:

| Clase | Misiones | Fuente |
|---|---|---|
| `ana-01` El análisis químico y sus errores | m1 conceptos, etapas, humedad e interferentes · m2 calibración, exactitud, precisión y errores | Diapositivas de la Dra. Carmen Pizarro (Conceptos y Etapas) + Skoog cap. 5–6 para tipos de error |
| `ana-02` Volumetría: de la bureta a la muestra | m1 titulante, equivalencia, patrón primario · m2 estequiometría, alícuotas y % | Skoog cap. 13 y Harris cap. 7 (**sin diapositivas de cátedra todavía**) |
| `ana-03` Curvas de titulación ácido-base | m1 fuerte-fuerte e indicadores · m2 ácido débil, tampón y polipróticos | Skoog cap. 14–15 y Harris cap. 10–11 (**sin diapositivas de cátedra todavía**) |

## Decisiones
- Los números de los ejemplos (Pb en sangre, Fe(III), humedad, recta 0,0067, KHP, aspirina, curvas de HCl y ácido acético, H₃PO₄) se recalcularon en Python antes de escribirlos.
- Como no hay pauta, el "camino al 7" usa un reparto **estimado**: 35 puntos ana-01, 25 ana-02, 40 ana-03. Se ajusta cuando llegue la prueba de ejemplo.
- Las "láminas" de ana-02 y ana-03 son secciones propias numeradas (no diapositivas reales). Cuando suban las PPT de volumetría y ácido-base se reemplazan.
- Títulos del catálogo (`data.js`) cambiados para que coincidan con las clases.
- Generadores: 10 (ana-01), 7 (ana-02), 8 (ana-03), con trampas por error típico (Fh al revés, n en vez de n − 1, olvidar la alícuota, estequiometría 1:2, pH 7 en la equivalencia de un ácido débil, razón invertida en Henderson-Hasselbalch).
- Laboratorios: preparar una muestra (ana-01), de la tableta a la titulación (ana-02), qué pasa con el pH al agregar NaOH (ana-03).

## Criterios de aceptación
- `npm test` pasa (classroom-test revisa 7 clases y todos los ejercicios generados).
- La torre de Analítica junta los conceptos de las 3 clases.
- Revisión humana de la química (Niquito) antes de marcar `status: 'lista'`.

## Pendiente
- Reemplazar Skoog/Harris por las diapositivas de cátedra cuando estén en el Drive.
- Ajustar puntajes con la pauta real.
