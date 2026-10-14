/* Programación comunicada por Nicolás el 22-09-2026; control FQII cotejado con calendario docente 2S2026. Editable en la app.
   14-10-2026: ponderaciones, laboratorios y horario leídos de los programas en Drive ("Material Nexo (2026) / 2S QYF 2026").
   Fuentes y dudas por ramo: docs/update-02-organizacion/DATOS-RAMOS.md. */
const NEXO_SEMESTER = {
  version: '2026-10-14',
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
    { id: 'official-fq-pep3', title: 'PEP 3', subject: 'fisico', type: 'exam', date: '2026-12-29', topic: 'Cinética química y elementos de fotoquímica' },
    { id: 'official-org-lab-1', title: 'Laboratorio', subject: 'organica', type: 'lab', date: '2026-10-15', time: '09:50', topic: 'P-2 (1/2): síntesis de un éster (excipiente)', source: 'Manual Lab QOII 2S-26 · sección jueves', added: '2026-10-14', lab: { manual: 'Manual Lab QOII 2S-26 (Drive). Control de entrada al inicio; el reporte se entrega al terminar la sesión.', prelab: { dueDate: '2026-10-15', done: false }, during: { checklist: [] }, after: { reportDueDate: '2026-10-15', reportDone: false } } },
    { id: 'official-org-lab-2', title: 'Laboratorio', subject: 'organica', type: 'lab', date: '2026-10-22', time: '09:50', topic: 'P-2 (2/2): síntesis de un éster (excipiente)', source: 'Manual Lab QOII 2S-26 · sección jueves', added: '2026-10-14', lab: { manual: 'Manual Lab QOII 2S-26 (Drive). Control de entrada al inicio; el reporte se entrega al terminar la sesión.', prelab: { dueDate: '2026-10-22', done: false }, during: { checklist: [] }, after: { reportDueDate: '2026-10-22', reportDone: false } } },
    { id: 'official-org-lab-3', title: 'Laboratorio', subject: 'organica', type: 'lab', date: '2026-11-12', time: '09:50', topic: 'P-3 (1/2): síntesis de benzocaína (esterificación de Fischer)', source: 'Manual Lab QOII 2S-26 · sección jueves', added: '2026-10-14', lab: { manual: 'Manual Lab QOII 2S-26 (Drive). Control de entrada al inicio; el reporte se entrega al terminar la sesión.', prelab: { dueDate: '2026-11-12', done: false }, during: { checklist: [] }, after: { reportDueDate: '2026-11-12', reportDone: false } } },
    { id: 'official-org-lab-4', title: 'Laboratorio', subject: 'organica', type: 'lab', date: '2026-11-19', time: '09:50', topic: 'P-3 (2/2): síntesis de benzocaína (esterificación de Fischer)', source: 'Manual Lab QOII 2S-26 · sección jueves', added: '2026-10-14', lab: { manual: 'Manual Lab QOII 2S-26 (Drive). Control de entrada al inicio; el reporte se entrega al terminar la sesión.', prelab: { dueDate: '2026-11-19', done: false }, during: { checklist: [] }, after: { reportDueDate: '2026-11-19', reportDone: false } } },
    { id: 'official-org-lab-5', title: 'Laboratorio', subject: 'organica', type: 'lab', date: '2026-11-26', time: '09:50', topic: 'P-4 (1/2): condensación aldólica, dibenzalacetona', source: 'Manual Lab QOII 2S-26 · sección jueves', added: '2026-10-14', lab: { manual: 'Manual Lab QOII 2S-26 (Drive). Control de entrada al inicio; el reporte se entrega al terminar la sesión.', prelab: { dueDate: '2026-11-26', done: false }, during: { checklist: [] }, after: { reportDueDate: '2026-11-26', reportDone: false } } },
    { id: 'official-org-lab-6', title: 'Laboratorio', subject: 'organica', type: 'lab', date: '2026-12-03', time: '09:50', topic: 'P-4 (2/2): condensación aldólica, dibenzalacetona', source: 'Manual Lab QOII 2S-26 · sección jueves', added: '2026-10-14', lab: { manual: 'Manual Lab QOII 2S-26 (Drive). Control de entrada al inicio; el reporte se entrega al terminar la sesión.', prelab: { dueDate: '2026-12-03', done: false }, during: { checklist: [] }, after: { reportDueDate: '2026-12-03', reportDone: false } } },
    { id: 'official-org-ciclo1', title: 'Prueba de ciclo 1 (lab)', subject: 'organica', type: 'exam', date: '2026-11-04', time: '08:15', topic: 'Prácticos 1 y 2: procedimientos, fundamentos, resultados y discusión', source: 'Manual Lab QOII 2S-26 · sección jueves', added: '2026-10-14', dateNote: 'En horario de ejercicios (miércoles). El 29-10 no hay lab por la Feria Científica.' },
    { id: 'official-org-ciclo2', title: 'Prueba de ciclo 2 (lab)', subject: 'organica', type: 'exam', date: '2026-12-16', time: '08:15', topic: 'Prácticos 3 y 4: procedimientos, fundamentos, resultados y discusión', source: 'Manual Lab QOII 2S-26 · sección jueves', added: '2026-10-14', dateNote: 'En horario de ejercicios (miércoles). Recuperativos de lab: 10-12.' },
    { id: 'official-fq-lab-2', title: 'Laboratorio', subject: 'fisico', type: 'lab', date: '2026-10-21', time: '16:55', topic: 'Lab 2: constante de acidez por conductimetría', source: 'Programación Lab FQ2 2S-2026 · sección L-7', added: '2026-10-14', lab: { manual: 'Programación Lab FQ2 2S-2026 (Drive). Test de entrada al inicio; la tabla de datos y gráficos se entrega al terminar la sesión.', prelab: { dueDate: '2026-10-21', done: false }, during: { checklist: [] }, after: { reportDueDate: '2026-10-21', reportDone: false } } },
    { id: 'official-fq-lab-3', title: 'Laboratorio', subject: 'fisico', type: 'lab', date: '2026-11-04', time: '16:55', topic: 'Lab 3: adsorción de ácido acético sobre carbón activado', source: 'Programación Lab FQ2 2S-2026 · sección L-7', added: '2026-10-14', lab: { manual: 'Programación Lab FQ2 2S-2026 (Drive). Test de entrada al inicio; la tabla de datos y gráficos se entrega al terminar la sesión.', prelab: { dueDate: '2026-11-04', done: false }, during: { checklist: [] }, after: { reportDueDate: '2026-11-04', reportDone: false } } },
    { id: 'official-fq-lab-4', title: 'Laboratorio', subject: 'fisico', type: 'lab', date: '2026-12-02', time: '16:55', topic: 'Lab 4: CMC mediante conductividad', source: 'Programación Lab FQ2 2S-2026 · sección L-7', added: '2026-10-14', lab: { manual: 'Programación Lab FQ2 2S-2026 (Drive). Test de entrada al inicio; la tabla de datos y gráficos se entrega al terminar la sesión.', prelab: { dueDate: '2026-12-02', done: false }, during: { checklist: [] }, after: { reportDueDate: '2026-12-02', reportDone: false } } },
    { id: 'official-fq-lab-5', title: 'Laboratorio', subject: 'fisico', type: 'lab', date: '2026-12-16', time: '16:55', topic: 'Lab 5: solvólisis de cloruro de terc-butilo', source: 'Programación Lab FQ2 2S-2026 · sección L-7', added: '2026-10-14', lab: { manual: 'Programación Lab FQ2 2S-2026 (Drive). Test de entrada al inicio; la tabla de datos y gráficos se entrega al terminar la sesión.', prelab: { dueDate: '2026-12-16', done: false }, during: { checklist: [] }, after: { reportDueDate: '2026-12-16', reportDone: false } } },
    { id: 'official-fq-ciclo', title: 'Prueba de ciclo (lab)', subject: 'fisico', type: 'exam', date: '2026-11-25', time: '', topic: 'Labs 1, 2 y 3 (ley de reparto, constante de acidez, adsorción)', source: 'Programación Lab FQ2 2S-2026 · sección L-7', added: '2026-10-14', dateNote: 'Mismo día que la PEP 2 de FQ II. Sala por definir. Con nota roja se rinde examen de lab (13-01).' },
    { id: 'official-fisio-pep2', title: 'PEP 2', subject: 'fisio', type: 'exam', date: '2027-01-08', time: '13:45', topic: 'Endocrino, cardiovascular, renal, cáncer y reproductivo', source: 'Programa de asignatura Fisiopatología 2026-2', added: '2026-10-14', dateNote: 'Examen el 15-01-2027 (eximición con 4,5).' }
  ],
  grades: {
    organica: {
      target: 4,
      source: 'Programa QOII (2S-2025, el más reciente en Drive) + Manual Lab QOII 2S-26',
      groups: { theory: { name: 'Cátedra', minimum: 4, courseWeight: 50 }, lab: { name: 'Laboratorio', minimum: 4, courseWeight: 50 } },
      rules: [
        'Cátedra y laboratorio se aprueban por separado (4,0 cada uno). Si repruebas uno, la nota final es la reprobada, sin promediar.',
        'Promedio de cátedra bajo 3,4: reprobación sin prueba final.',
        'Promedio de cátedra entre 3,5 y 3,9, o alguna PEP bajo 4,0: prueba final (PF) que reemplaza la PEP más baja.',
        'Lab con escala al 60 % de exigencia; aprobación 4,0 (3,95). Si apruebas el lab y repruebas la teoría, guardas la nota de lab un semestre.',
        'Lab: 100 % de asistencia (recuperable con justificación).'
      ],
      components: [
        { id: 'official-org-pep1', name: 'PEP 1', group: 'theory', weight: 30, grade: '', date: '2026-10-27' },
        { id: 'grade-org-pep2', name: 'PEP 2', group: 'theory', weight: 30, grade: '', date: '' },
        { id: 'grade-org-pep3', name: 'PEP 3', group: 'theory', weight: 30, grade: '', date: '' },
        { id: 'grade-org-controls', name: 'Controles del taller (promedio)', group: 'theory', weight: 10, grade: '', date: '' },
        { id: 'grade-org-lab-control1', name: 'Control de entrada · P-1', group: 'lab', weight: 3.75, grade: '', date: '' },
        { id: 'grade-org-lab-control2', name: 'Control de entrada · P-2', group: 'lab', weight: 3.75, grade: '', date: '' },
        { id: 'grade-org-lab-control3', name: 'Control de entrada · P-3', group: 'lab', weight: 3.75, grade: '', date: '' },
        { id: 'grade-org-lab-control4', name: 'Control de entrada · P-4', group: 'lab', weight: 3.75, grade: '', date: '' },
        { id: 'grade-org-lab-reporte1', name: 'Reporte · P-1', group: 'lab', weight: 3.75, grade: '', date: '' },
        { id: 'grade-org-lab-reporte2', name: 'Reporte · P-2', group: 'lab', weight: 3.75, grade: '', date: '' },
        { id: 'grade-org-lab-reporte3', name: 'Reporte · P-3', group: 'lab', weight: 3.75, grade: '', date: '' },
        { id: 'grade-org-lab-reporte4', name: 'Reporte · P-4', group: 'lab', weight: 3.75, grade: '', date: '' },
        { id: 'grade-org-lab-ciclo1', name: 'Prueba de ciclo 1 (P-1 y P-2)', group: 'lab', weight: 35, grade: '', date: '' },
        { id: 'grade-org-lab-ciclo2', name: 'Prueba de ciclo 2 (P-3 y P-4)', group: 'lab', weight: 35, grade: '', date: '' }
      ]
    },
    fisico: {
      target: 4,
      source: 'Programación FQII (Pino/Zúñiga; teoría según la de 1S-2026) + Programación Lab FQ2 2S-2026',
      groups: { theory: { name: 'Cátedra', minimum: 4, courseWeight: 50 }, lab: { name: 'Laboratorio', minimum: 4, courseWeight: 50 } },
      rules: [
        'Cátedra (teoría + ejercicios) 50 % y laboratorio 50 %.',
        'Cátedra bajo 4,0 (3,95): examen, que vale 40 % de la nota final y entra todo.',
        'Lab: con una prueba de ciclo roja (bajo 4,0) se rinde examen de lab (40 %, 13-01-2027).',
        'Lab: 100 % de asistencia; la tabla de datos se entrega el mismo día al terminar la sesión.'
      ],
      components: [
        { id: 'official-fq-pep1', name: 'PEP 1', group: 'theory', weight: 80 / 3, grade: '', date: '2026-10-21' },
        { id: 'official-fq-pep2', name: 'PEP 2', group: 'theory', weight: 80 / 3, grade: '', date: '2026-11-25' },
        { id: 'official-fq-pep3', name: 'PEP 3', group: 'theory', weight: 80 / 3, grade: '', date: '2026-12-29' },
        { id: 'official-fq-controls', name: 'Controles de ejercicios (promedio)', group: 'theory', weight: 20, grade: '', date: '' },
        { id: 'grade-fq-lab-libreta', name: 'Libreta en el lab', group: 'lab', weight: 5, grade: '', date: '' },
        { id: 'grade-fq-lab-rev1', name: 'Revisión de libreta 1', group: 'lab', weight: 12.5, grade: '', date: '' },
        { id: 'grade-fq-lab-rev2', name: 'Revisión de libreta 2', group: 'lab', weight: 12.5, grade: '', date: '' },
        { id: 'grade-fq-lab-fichas', name: 'Fichas de seguridad', group: 'lab', weight: 5, grade: '', date: '' },
        { id: 'grade-fq-lab-test1', name: 'Test de entrada · Lab 1', group: 'lab', weight: 3, grade: '', date: '' },
        { id: 'grade-fq-lab-test2', name: 'Test de entrada · Lab 2', group: 'lab', weight: 3, grade: '', date: '' },
        { id: 'grade-fq-lab-test3', name: 'Test de entrada · Lab 3', group: 'lab', weight: 3, grade: '', date: '' },
        { id: 'grade-fq-lab-test4', name: 'Test de entrada · Lab 4', group: 'lab', weight: 3, grade: '', date: '' },
        { id: 'grade-fq-lab-test5', name: 'Test de entrada · Lab 5', group: 'lab', weight: 3, grade: '', date: '' },
        { id: 'grade-fq-lab-ciclo', name: 'Prueba de ciclo (labs 1–3)', group: 'lab', weight: 25, grade: '', date: '' },
        { id: 'grade-fq-lab-datos1', name: 'Tabla de datos y gráficos · Lab 1', group: 'lab', weight: 5, grade: '', date: '' },
        { id: 'grade-fq-lab-datos2', name: 'Tabla de datos y gráficos · Lab 2', group: 'lab', weight: 5, grade: '', date: '' },
        { id: 'grade-fq-lab-datos3', name: 'Tabla de datos y gráficos · Lab 3', group: 'lab', weight: 5, grade: '', date: '' },
        { id: 'grade-fq-lab-datos4', name: 'Tabla de datos y gráficos · Lab 4', group: 'lab', weight: 5, grade: '', date: '' },
        { id: 'grade-fq-lab-datos5', name: 'Tabla de datos y gráficos · Lab 5', group: 'lab', weight: 5, grade: '', date: '' }
      ]
    },
    analitica: {
      target: 4,
      source: 'Presentación del curso Química Analítica 2S-2026',
      groups: { theory: { name: 'Teoría', minimum: '', courseWeight: 60 }, lab: { name: 'Laboratorio', minimum: 4, courseWeight: 40 } },
      rules: [
        'Teoría 60 % (PEP 85 % + controles de ejercicios 15 %) y laboratorio 40 %.',
        'Eximición: 4,0 o más en cada una de las PEP.',
        'Derecho a examen con promedio entre 3,5 y 4,0. El examen vale 40 %.',
        'El laboratorio se aprueba en forma independiente (4,0).'
      ],
      components: [
        { id: 'official-ana-pep1', name: 'PEP 1', group: 'theory', weight: 30, grade: '', date: '2026-11-13' },
        { id: 'official-ana-pep2', name: 'PEP 2', group: 'theory', weight: 30, grade: '', date: '2026-12-04' },
        { id: 'official-ana-pep3', name: 'PEP 3', group: 'theory', weight: 25, grade: '', date: '' },
        { id: 'official-ana-controls', name: 'Controles de ejercicios (conjunto)', group: 'theory', weight: 15, grade: '', date: '' },
        { id: 'grade-ana-lab', name: 'Laboratorio (nota final, desglose por confirmar)', group: 'lab', weight: 100, grade: '', date: '' }
      ]
    },
    fisio: {
      target: 4,
      source: 'Programa de asignatura Fisiopatología 2026-2',
      groups: { theory: { name: 'PEP', minimum: '', courseWeight: 70 }, lab: { name: 'Seminarios', minimum: '', courseWeight: 30 } },
      rules: [
        'PEP 1 + PEP 2 = 70 % y seminarios = 30 %.',
        'Examen: vale 30 % de la nota de cátedra. Te eximes con 4,5 (15-01-2027).',
        'Para aprobar el curso es obligatorio tener la cátedra aprobada.'
      ],
      components: [
        { id: 'official-fisio-pep1', name: 'PEP 1', group: 'theory', weight: 50, grade: '', date: '2026-11-12' },
        { id: 'official-fisio-pep2', name: 'PEP 2', group: 'theory', weight: 50, grade: '', date: '2027-01-08' },
        { id: 'grade-fisio-seminarios', name: 'Seminarios (casos clínicos)', group: 'lab', weight: 100, grade: '', date: '' }
      ]
    }
  },
  /* Horario 2/2026 (HORARIO NICO.pdf). Módulos USACH: 1 08:15 · 2 09:50 · 3 11:25 · 4 13:45 · 5 15:20 · 6 16:55 · 7 18:45 (80 min cada uno). */
  schedule: [
    { day: 1, start: '11:25', end: '12:45', subject: 'fisico', kind: 'exercises', room: 'EAO554' },
    { day: 1, start: '13:45', end: '15:05', subject: 'analitica', kind: 'theory' },
    { day: 2, start: '08:15', end: '09:35', subject: 'ingles', name: 'Inglés IV', kind: 'theory' },
    { day: 2, start: '09:50', end: '11:10', subject: 'organica', kind: 'theory' },
    { day: 2, start: '11:25', end: '12:45', subject: 'fisico', kind: 'theory' },
    { day: 3, start: '08:15', end: '09:35', subject: 'organica', kind: 'exercises' },
    { day: 3, start: '09:50', end: '11:10', subject: 'fisico', kind: 'theory' },
    { day: 3, start: '16:55', end: '20:05', subject: 'fisico', kind: 'lab', room: 'CDA102' },
    { day: 4, start: '08:15', end: '09:35', subject: 'fisio', kind: 'theory', room: 'FQB305' },
    { day: 4, start: '09:50', end: '12:45', subject: 'organica', kind: 'lab', room: 'CDA101' },
    { day: 4, start: '13:45', end: '15:05', subject: 'organica', kind: 'theory' },
    { day: 4, start: '15:20', end: '16:40', subject: 'analitica', kind: 'exercises', room: 'REG335' },
    { day: 4, start: '16:55', end: '18:15', subject: 'fisio', kind: 'seminar', room: 'REG306' },
    { day: 5, start: '08:15', end: '11:10', subject: 'analitica', kind: 'lab', room: 'DQM203' },
    { day: 5, start: '11:25', end: '12:45', subject: 'analitica', kind: 'theory' },
    { day: 5, start: '13:45', end: '15:05', subject: 'fisio', kind: 'theory', room: 'FQB305' }
  ],
  /* Lleva a las cuentas existentes lo nuevo de esta versión, una sola vez.
     Nunca pisa notas: un ramo con alguna nota escrita conserva su configuración. Eventos: solo agrega los que faltan. */
  upgrade(state, clone) {
    state.meta = state.meta || {};
    if (String(state.meta.semesterData || '') >= this.version) return;
    for (const event of this.events) {
      if (!event.added || state.events.some(item => item.id === event.id)) continue;
      state.events.push({ ...clone(event), priority: event.type === 'exam' ? 3 : 2, status: 'planned' });
    }
    for (const [id, plan] of Object.entries(this.grades)) {
      const current = state.grades[id];
      const hasGrade = Array.isArray(current?.components) && current.components.some(item => String(item.grade ?? '').trim() !== '');
      if (!hasGrade) state.grades[id] = { ...(current || {}), ...clone(plan), rounding: '2' };
    }
    state.meta.semesterData = this.version;
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

