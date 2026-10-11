/* Programación comunicada por Nicolás el 22-09-2026; control FQII cotejado con calendario docente 2S2026. Editable en la app. */
const NEXO_SEMESTER = {
  version: '2026-10-06',
  events: [
    { id: 'official-fq-c1', title: 'Control 1', subject: 'fisico', type: 'exam', date: '2026-10-26', topic: 'Equilibrio químico, electrolitos, equilibrio iónico y electroquímico', source: 'Calendarización Ejercicios FQII QyF 2s2026', dateNote: 'El calendario de ejercicios 2S2026 indica 26/10; antes se había informado 20/10. Confirma con cátedra.' },
    { id: 'official-fq-pep1', title: 'PEP 1', subject: 'fisico', type: 'exam', date: '2026-10-21', topic: 'Equilibrio químico, iónico y electroquímico', source: 'Programación FQII (Dr. Eduardo Pino): miércoles 21 de octubre' },
    { id: 'official-org-c1', title: 'Control 1', subject: 'organica', type: 'exam', date: '2026-10-14', topic: 'Aminas', source: 'Classroom QOII (aplazado una semana, anuncio del 30-09)', dateNote: 'Confirmado por Niquito el 05-10 con el calendario de ejercicios actualizado.' },
    { id: 'official-org-pep1', title: 'PEP 1', subject: 'organica', type: 'exam', date: '2026-10-27', topic: 'Aminas, heterociclos y compuestos aromáticos' },
    { id: 'official-ana-c1', title: 'Control 1', subject: 'analitica', type: 'exam', date: '2026-10-19' },
    { id: 'official-ana-c2', title: 'Control 2', subject: 'analitica', type: 'exam', date: '2026-11-05' },
    { id: 'official-ana-pep1', title: 'PEP 1', subject: 'analitica', type: 'exam', date: '2026-11-13', topic: 'Etapas y errores de análisis; titulaciones ácido-base; sistemas polipróticos' },
    { id: 'official-fisio-pep1', title: 'PEP 1', subject: 'fisio', type: 'exam', date: '2026-11-12', topic: 'Sistema nervioso, respiratorio y digestivo', source: 'Programa de asignatura Fisiopatología 2026-2', dateNote: 'El calendario del programa dice 2024-II en el título; confirma la fecha con cátedra.' },
    { id: 'official-fq-c2', title: 'Control 2', subject: 'fisico', type: 'exam', date: '2026-11-23', topic: 'Superficies y transporte' },
    { id: 'official-fq-pep2', title: 'PEP 2', subject: 'fisico', type: 'exam', date: '2026-11-25', topic: 'Química de superficies y fenómenos de transporte', weekdayUncertain: true },
    { id: 'official-ana-c4', title: 'Control 4', subject: 'analitica', type: 'exam', date: '2026-11-26' },
    { id: 'official-ana-pep2', title: 'PEP 2', subject: 'analitica', type: 'exam', date: '2026-12-04', topic: 'Complejometría y óxido-reducción' },
    { id: 'official-fq-c3', title: 'Control 3', subject: 'fisico', type: 'exam', date: '2026-12-28', topic: 'Cinética, enzimas, sistemas microheterogéneos y fotoquímica' },
    { id: 'official-fq-pep3', title: 'PEP 3', subject: 'fisico', type: 'exam', date: '2026-12-29', topic: 'Cinética química y elementos de fotoquímica' }
  ],
  grades: {
    fisico: {
      target: 4,
      groups: { theory: { name: 'Teoría', minimum: '' }, lab: { name: 'Laboratorio', minimum: '' } },
      components: [
        { id: 'official-fq-pep1', name: 'PEP 1', group: 'theory', weight: 80 / 3, grade: '', date: '2026-10-21' },
        { id: 'official-fq-pep2', name: 'PEP 2', group: 'theory', weight: 80 / 3, grade: '', date: '2026-11-25' },
        { id: 'official-fq-pep3', name: 'PEP 3', group: 'theory', weight: 80 / 3, grade: '', date: '2026-12-29' },
        { id: 'official-fq-controls', name: 'Controles (promedio)', group: 'theory', weight: 20, grade: '', date: '' }
      ]
    },
    analitica: {
      target: 4,
      groups: { theory: { name: 'Teoría', minimum: '', courseWeight: 60 }, lab: { name: 'Laboratorio', minimum: 4, courseWeight: 40 } },
      components: [
        { id: 'official-ana-pep1', name: 'PEP 1', group: 'theory', weight: 30, grade: '', date: '2026-11-13' },
        { id: 'official-ana-pep2', name: 'PEP 2', group: 'theory', weight: 30, grade: '', date: '2026-12-04' },
        { id: 'official-ana-pep3', name: 'PEP 3', group: 'theory', weight: 25, grade: '', date: '' },
        { id: 'official-ana-controls', name: 'Controles (conjunto)', group: 'theory', weight: 15, grade: '', date: '' }
      ]
    }
  },
  library: {
    organica: [
      { title: 'Aminas', kind: 'Cátedra', year: '2S-2025', pages: 50, pep: 1 },
      { title: 'Aromáticos I', kind: 'Cátedra', year: '2S-2025', pages: 50, pep: 1 },
      { title: 'Aromáticos II', kind: 'Cátedra', year: '2S-2025', pages: 62, pep: 1 },
      { title: 'Aminas', kind: 'Guía de ejercicios', year: '2021', pages: 3, pep: 1 },
      { title: 'Compuestos aromáticos', kind: 'Guía de ejercicios', year: '2021', pages: 3, pep: 1 },
      { title: 'Sustitución electrofílica aromática', kind: 'Guía de ejercicios', year: '2021', pages: 2, pep: 1 },
      { title: 'Espectroscopía RMN', kind: 'Taller', year: '1S-2026', pages: 3, pep: null },
      { title: 'Aldehídos y cetonas', kind: 'Cátedra', year: '2S-2025', pages: 75, pep: 2 },
      { title: 'Hidratos de carbono', kind: 'Cátedra', year: '2S-2025', pages: 59, pep: null },
      { title: 'Ácidos nucleicos', kind: 'Cátedra', year: '2S-2025', pages: 21, pep: null },
      { title: 'Ácidos carboxílicos', kind: 'Cátedra', year: '2S-2025', pages: 58, pep: null },
      { title: 'Derivados de ácidos carboxílicos', kind: 'Cátedra', year: '2S-2025', pages: 75, pep: null },
      { title: 'Aminoácidos', kind: 'Cátedra', year: '2S-2025', pages: 43, pep: null },
      { title: 'Lípidos', kind: 'Cátedra', year: '2S-2025', pages: 43, pep: null },
      { title: 'Condensaciones y sustituciones alfa', kind: 'Cátedra', year: '2S-2025', pages: 81, pep: null },
      { title: 'Aldehídos y cetonas', kind: 'Guía de ejercicios', year: '2021', pages: 4, pep: null },
      { title: 'Hidratos de carbono', kind: 'Guía de ejercicios', year: '2021', pages: 3, pep: null },
      { title: 'Ácidos carboxílicos', kind: 'Guía de ejercicios', year: '2021', pages: 3, pep: null },
      { title: 'Derivados de ácidos carboxílicos', kind: 'Guía de ejercicios', year: '2021', pages: 4, pep: null },
      { title: 'Lípidos', kind: 'Guía de ejercicios', year: '2021', pages: 2, pep: null },
      { title: 'Condensaciones carbonílicas', kind: 'Guía de ejercicios', year: '2021', pages: 5, pep: null }
    ]
  }
};

