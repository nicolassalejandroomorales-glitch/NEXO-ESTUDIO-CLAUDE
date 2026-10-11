# Fisiopatología · PEP 1 (jueves 12 de noviembre)

## Qué
Cuatro clases nuevas para la PEP 1 (nervioso, respiratorio y digestivo, según el calendario del programa 2026-2):

| Clase | Misiones | Fuente |
|---|---|---|
| `fis-01` Motricidad y sistema nervioso vegetativo | m1 localizar la lesión (MNS, MNI, placa, ganglios basales, cerebelo) · m2 simpático, parasimpático y toxíndromes | Silbernagl y Lang (bibliografía básica del programa) |
| `fis-02` Lesión cerebral aguda: isquemia, edema y PIC | m1 cascada isquémica y penumbra · m2 edema, Monro-Kellie, PPC y Cushing | Silbernagl y Lang |
| `fis-06` Respiratorio: ventilación e intercambio gaseoso | m1 obstructivo/restrictivo, asma y EPOC · m2 hipoxemia, gradiente A-a, insuficiencia tipo 1 y 2 | Silbernagl y Lang + GOLD 2024 |
| `fis-09` Digestivo: barrera, secreción, motilidad e hígado | m1 ERGE, acalasia, úlcera · m2 diarrea (brecha osmolar), malabsorción, ictericia, cirrosis, pancreatitis | Silbernagl y Lang |

**Las clases del Dr. Cárdenas todavía no están en el Drive**: todo sale del libro. Cuando suban las PPT hay que revisar que el énfasis coincida.

## Decisiones
- Catálogo rehecho: la app decía "PEP 1 · SNC y endocrino", pero el programa pone endocrino en la PEP 2. Ahora: PEP 1 = fis-01, fis-02, fis-06, fis-09; PEP 2 = endocrino, cardiovascular y renal. Se mantuvieron los ids para no perder progreso guardado.
- Fisiopatología no es química: sin moléculas ni flechas. Se usan casos clínicos (causa → mecanismo → signo → fármaco), ordenar cadenas, clasificar, "el aprendiz que se equivocó" y escritas.
- Números con cálculo real: PPC = PAM − PIC, PAO₂ y gradiente A-a, VEF₁/CVF, brecha osmolar fecal (recalculados en Python).
- Generadores de casos: se arman combinando signos de bancos; a más nivel, más signos y opciones más parecidas.
- Laboratorio "¿qué pasa si…?": fármacos y su efecto (atropina, salbutamol, propranolol, manitol, naloxona, lactulosa…).
- Reparto de puntos **estimado** (no hay pauta): nervioso 40, respiratorio 30, digestivo 30.

## Criterios de aceptación
- `npm test` pasa (11 clases, 536 actividades revisadas).
- La torre de Fisiopatología junta las 4 clases.
- Revisión humana del contenido antes de pasar a `status: 'lista'`.

## Pendiente
- Ajustar con las PPT del Dr. Cárdenas y los seminarios.
- Confirmar la fecha (el calendario del programa dice "2024-II" en el título).
