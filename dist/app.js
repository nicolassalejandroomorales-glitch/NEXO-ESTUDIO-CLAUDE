/* Nexo V11 — runtime principal y eventos delegados. */
(() => {
  'use strict';

  const DATA = NEXO_DATA;
  const ORGANIC = window.NEXO_ORGANIC_COURSE || {};
  const organicSupplementIds = ['org-14', 'org-15', 'org-16', 'org-17', 'org-18'];
  const organicSubject = DATA.subjects.find(subject => subject.id === 'organica');
  if (organicSubject && !organicSubject.peps.some(pep => pep.lessons.includes('org-14'))) {
    organicSubject.peps.push({ name: 'Unidades de cátedra · fecha por confirmar', lessons: organicSupplementIds });
  }
  organicSupplementIds.forEach(id => {
    if (ORGANIC[id] && !DATA.lessons[id]) DATA.lessons[id] = { id, subject: 'organica', title: ORGANIC[id].title, central: ORGANIC[id].central, duration: ORGANIC[id].duration };
  });
  Object.entries(ORGANIC).forEach(([id, lesson]) => {
    if (DATA.lessons[id]) Object.assign(DATA.lessons[id], { title: lesson.title, central: lesson.central, duration: lesson.duration });
  });
  const SUBJECTS = DATA.subjects;
  const LESSONS = DATA.lessons;
  const STORAGE_KEY = 'nexo-study-beta';
  const BACKUP_KEY = 'nexo-study-beta-backup';
  const SCHEMA_VERSION = 19;
  const storage = window.NexoStorage;
  const cloud = window.NexoCloud;
  const app = document.querySelector('#app');
  const toast = document.querySelector('#toast');
  const modalRoot = document.querySelector('#modalRoot');
  const importFile = document.querySelector('#importFile');
  let toastTimer = null;
  let timerTicker = null;
  let lastFocus = null;
  let recoveryNotice = '';
  let undoAction = null;
  storage.onError(() => { recoveryNotice = 'El navegador no pudo guardar el último cambio. Exporta un respaldo desde Ajustes antes de continuar.'; });
  const ui = {
    practiceSubject: 'all',
    practiceLevel: 'all',
    errorSearch: '',
    examSubject: 'all',
    statsRange: '30',
    homeSubject: 'analitica',
    gradeSubject: 'analitica',
    gradeGroup: 'theory',
    profileSubject: 'organica',
    profileGroup: 'theory',
    absenceSubject: 'organica',
    challengeFeedback: '',
    calendarDate: '',
    calendarMonth: '',
    editEventId: ''
  };

  const deepClone = value => JSON.parse(JSON.stringify(value));
  const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const todayKey = (date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const addDays = (date, days) => { const next = new Date(date); next.setDate(next.getDate() + days); return next; };
  const parseDay = value => new Date(`${value}T12:00:00`);
  const formatDate = value => new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }).format(parseDay(value));
  const todayLabel = () => new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).replace(/\bde\b/gi, 'de');
  const formatClock = ms => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
    return `${h ? `${String(h).padStart(2, '0')}:` : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  const pixelGlyphs = {
    '0': ['01110','11011','10001','10001','10001','11011','01110'],
    '1': ['00100','01100','00100','00100','00100','00100','01110'],
    '2': ['01110','10001','00001','00010','00100','01000','11111'],
    '3': ['11110','00001','00001','01110','00001','00001','11110'],
    '4': ['10010','10010','10010','11111','00010','00010','00010'],
    '5': ['11111','10000','10000','11110','00001','00001','11110'],
    '6': ['01111','10000','10000','11110','10001','10001','01110'],
    '7': ['11111','00001','00010','00100','01000','01000','01000'],
    '8': ['01110','10001','10001','01110','10001','10001','01110'],
    '9': ['01110','10001','10001','01111','00001','00001','11110'],
    ':': ['0','1','0','0','1','0','0']
  };
  function pixelDigits(value) {
    let x = 0, d = '';
    for (const glyph of String(value)) {
      const rows = pixelGlyphs[glyph] || pixelGlyphs['0'];
      rows.forEach((row, y) => { for (const m of row.matchAll(/1+/g)) d += `M${x + m.index} ${y}h${m[0].length}v1h-${m[0].length}z`; });
      x += rows[0].length + 1;
    }
    return `<svg class="pixel-digits" viewBox="0 0 ${Math.max(1, x - 1)} 7" aria-hidden="true" focusable="false" shape-rendering="crispEdges"><path d="${d}"/></svg>`;
  }
  const subjectFor = id => id === 'personal' ? { id, name: 'Vida personal y trabajo', short: 'VIDA', color: '#92b9a0', peps: [] } : SUBJECTS.find(subject => subject.id === id) || SUBJECTS[0];
  const allLessons = subjectId => subjectFor(subjectId).peps.flatMap(pep => pep.lessons);
  const lessonSubject = id => subjectFor(LESSONS[id]?.subject);
  const sessionSeconds = session => Number(session.seconds) || Number(session.minutes || 0) * 60;
  const daysBetween = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 86400000);

  function defaultGrades() {
    const defaults = Object.fromEntries(SUBJECTS.map(subject => [subject.id, {
      target: 4,
      rounding: '2',
      groups: { theory: { name: 'Teoría', minimum: '' }, lab: { name: 'Laboratorio', minimum: '' } },
      components: [
        { id: `grade-${subject.id}-theory-1`, name: 'PEP 1', group: 'theory', weight: '', grade: '' },
        { id: `grade-${subject.id}-theory-2`, name: 'PEP 2', group: 'theory', weight: '', grade: '' },
        { id: `grade-${subject.id}-theory-3`, name: 'PEP 3', group: 'theory', weight: '', grade: '' },
        { id: `grade-${subject.id}-lab`, name: 'Laboratorio', group: 'lab', weight: '', grade: '' }
      ]
    }]));
    for (const [id, plan] of Object.entries(NEXO_SEMESTER.grades)) defaults[id] = { ...defaults[id], ...deepClone(plan), rounding: '2' };
    return defaults;
  }

  function defaultState() {
    return {
      version: SCHEMA_VERSION,
      coins: 0,
      xp: 0,
      sessions: [],
      timer: { status: 'idle', subject: 'organica', startedAt: null, elapsedBeforeMs: 0 },
      completedLessons: [],
      mastery: {},
      organicProgress: {},
      lessonSession: null,
      routeMode: Object.fromEntries(SUBJECTS.map(s => [s.id, 'progression'])),
      errors: [],
      practice: {},
      academicIntelligence: {attempts:[],evidence:[],reviewSchedules:[],structuredErrors:[],userSources:[],activeTimeSegments:[]},
      duel: null,
      studyEngine: null,
      guides: {},
      exams: {},
      labs: {},
      events: deepClone(NEXO_SEMESTER.events).map(item=>({...item,source:item.source||'programación informada',priority:3,status:'planned'})),
      grades: defaultGrades(),
      absences: [],
      weeklyGoal: 300,
      inventory: [],
      mascot: { name: 'Nexo' },
      tutorial: { status: 'pending', rewarded: false, sections: {}, news: 0 },
      boosts: { streakShields: 0, protectedDates: [] },
      settings: { background: 'studio', sound: false, volume: 0.4, sfxVolume: 0.4,
        music: false, musicVolume: 0.15, ambient: false, ambientVolume: 0.12,
        motion: true, focusMode: false, analytics: false, dailyGoalMinutes: 120,
        graphicsQuality:'auto',particles:'low',ambientMotion:'normal',mascotMotion:'full' },
      claimedChallenges: [],
      meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastBackupAt: null }
    };
  }

  function normalizeState(input) {
    const base = defaultState();
    const raw = input && typeof input === 'object' ? input : {};
    const next = { ...base, ...raw };
    const subjectIds = new Set(SUBJECTS.map(subject => subject.id));
    const dateOrToday = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? value : todayKey();
    for (const key of ['sessions', 'completedLessons', 'errors', 'events', 'absences', 'inventory', 'claimedChallenges']) {
      if (!Array.isArray(next[key])) next[key] = deepClone(base[key]);
    }
    for (const key of ['mastery', 'organicProgress', 'practice', 'guides', 'exams', 'labs', 'routeMode', 'grades', 'settings', 'boosts', 'mascot', 'meta']) {
      if (!next[key] || typeof next[key] !== 'object' || Array.isArray(next[key])) next[key] = deepClone(base[key]);
    }
    if(!next.academicIntelligence||typeof next.academicIntelligence!=='object')next.academicIntelligence=deepClone(base.academicIntelligence);
    for(const key of Object.keys(base.academicIntelligence))
      if(!Array.isArray(next.academicIntelligence[key]))next.academicIntelligence[key]=[];
    next.settings = { ...base.settings, ...next.settings };
    next.settings.volume = clamp(Number(next.settings.volume ?? 0.4), 0, 1);
    next.settings.sfxVolume=clamp(Number(raw.settings?.sfxVolume??raw.settings?.volume??.4),0,1);
    next.settings.music=Boolean(raw.settings?.music);
    next.settings.ambient=Boolean(raw.settings?.ambient);
    next.settings.musicVolume=clamp(Number(raw.settings?.musicVolume??.15),0,1);
    next.settings.ambientVolume=clamp(Number(raw.settings?.ambientVolume??.12),0,1);
    next.settings.dailyGoalMinutes=clamp(Number(next.settings.dailyGoalMinutes)||120,15,600);
    for(const [key,values,fallback] of [
      ['graphicsQuality',['auto','low','balanced','high'],'auto'],
      ['particles',['none','low','high'],'low'],
      ['ambientMotion',['reduced','normal','rich'],'normal'],
      ['mascotMotion',['reduced','full'],'full']
    ])if(!values.includes(next.settings[key]))next.settings[key]=fallback;
    if (raw.background && !raw.settings?.background) next.settings.background = raw.background;
    if (typeof raw.focusActive === 'boolean' && typeof raw.settings?.focusMode !== 'boolean') next.settings.focusMode = raw.focusActive;
    next.boosts = { ...base.boosts, ...next.boosts };
    if (!Array.isArray(next.boosts.protectedDates)) next.boosts.protectedDates = [];
    next.boosts.streakShields = clamp(Number(next.boosts.streakShields) || 0, 0, 2);
    next.boosts.protectedDates = [...new Set(next.boosts.protectedDates.filter(value => /^\d{4}-\d{2}-\d{2}$/.test(String(value))))];
    next.mascot = { ...base.mascot, ...next.mascot };
    next.timer = { ...base.timer, ...(next.timer || {}) };
    next.timer.subject = subjectIds.has(next.timer.subject) ? next.timer.subject : 'organica';
    next.timer.elapsedBeforeMs = Math.max(0, Number(next.timer.elapsedBeforeMs) || 0);
    if (!['idle', 'paused', 'running'].includes(next.timer.status)) next.timer.status = 'idle';
    if (next.timer.status === 'running' && !Number.isFinite(Number(next.timer.startedAt))) next.timer = deepClone(base.timer);
    next.routeMode = { ...base.routeMode, ...next.routeMode };
    SUBJECTS.forEach(subject => { if (!['progression', 'urgent'].includes(next.routeMode[subject.id])) next.routeMode[subject.id] = 'progression'; });
    next.grades = { ...base.grades, ...next.grades };
    // Conserva la antigua calculadora (gradePlans/passGrade) dentro del modelo con grupos.
    if (raw.gradePlans && typeof raw.gradePlans === 'object') {
      SUBJECTS.forEach(subject => {
        const legacy = raw.gradePlans[subject.id];
        if (Array.isArray(legacy) && legacy.length && !raw.grades?.[subject.id]) {
          next.grades[subject.id] = {
            ...deepClone(base.grades[subject.id]),
            target: clamp(Number(raw.passGrade) || 4, 4, 7),
            components: legacy.map((item, index) => ({
              id: item?.id || uid('grade'),
              name: String(item?.name || `Evaluación ${index + 1}`),
              group: 'theory',
              weight: item?.weight ?? '',
              grade: item?.grade ?? '',
              date: item?.date || ''
            }))
          };
        }
      });
    }
    SUBJECTS.forEach(subject => {
      const fallback = base.grades[subject.id];
      const plan = next.grades[subject.id];
      if (!plan || typeof plan !== 'object' || !Array.isArray(plan.components)) next.grades[subject.id] = deepClone(fallback);
      else next.grades[subject.id] = {
        ...fallback,
        ...plan,
        target: clamp(Number(plan.target) || 4, 4, 7),
        rounding: ['1', '2'].includes(String(plan.rounding)) ? String(plan.rounding) : '2',
        groups: Object.fromEntries(Object.entries(fallback.groups).map(([id,group])=>[id,{...group,...(plan.groups?.[id]||{})}])),
        components: plan.components.filter(item => item && typeof item === 'object').map((item, index) => ({
          ...item,
          id: item.id || uid('grade'),
          name: String(item.name || `Evaluación ${index + 1}`),
          group: ['theory', 'lab', 'other'].includes(item.group) ? item.group : 'theory',
          weight: item.weight ?? '',
          grade: item.grade ?? ''
        }))
      };
    });
    next.coins = Math.max(0, Number(next.coins) || 0);
    next.xp = Math.max(0, Number(next.xp) || 0);
    next.weeklyGoal = clamp(Number(next.weeklyGoal) || 300, 30, 3000);
    next.version = SCHEMA_VERSION;
    if (!DATA.companions.some(c => c.species === next.mascot.species)) {
      next.mascot.legacySpecies = next.mascot.species;
      next.mascot.species = 'pig';
    }
    if (!next.inventory.includes('species-pig')) next.inventory.unshift('species-pig');
    if (!next.inventory.includes('scene-ruins')) next.inventory.push('scene-ruins');
    next.inventory = [...new Set(next.inventory.filter(item => typeof item === 'string'))];
    next.completedLessons = [...new Set(next.completedLessons.filter(id => LESSONS[id]))];
    next.claimedChallenges = [...new Set(next.claimedChallenges.filter(item => typeof item === 'string'))];
    next.sessions = next.sessions.filter(item => item && typeof item === 'object').map(item => ({
      ...item,
      id: item.id || uid('session'),
      date: dateOrToday(item.date),
      subject: subjectIds.has(item.subject) ? item.subject : 'organica',
      mode: String(item.mode || 'Sesión importada'),
      seconds: Math.max(0, Math.round(sessionSeconds(item)))
    }));
    next.events = next.events.filter(item => item && typeof item === 'object' && /^\d{4}-\d{2}-\d{2}$/.test(String(item.date || ''))).map(item => ({
      ...item,
      id: item.id || uid('event'),
      title: String(item.title || 'Evaluación'),
      subject: item.subject === 'personal' ? 'personal' : subjectIds.has(item.subject) ? item.subject : 'organica',
      type: String(item.type || 'Prueba'),
      time: /^\d{2}:\d{2}$/.test(String(item.time || '')) ? item.time : '',
      priority: clamp(Number(item.priority) || (['exam','Prueba','control'].includes(item.type) ? 3 : 2),1,3),
      durationMinutes: clamp(Number(item.durationMinutes) || 0,0,1440),
      prepMinutes: clamp(Number(item.prepMinutes) || 0,0,2000),
      dependencies: Array.isArray(item.dependencies) ? item.dependencies.filter(value=>typeof value==='string').slice(0,10) : [],
      status: item.status === 'done' ? 'done' : 'planned',
      notes: String(item.notes || '').slice(0,2000),
      source: String(item.source || (String(item.id || '').startsWith('official-') ? 'programa 2026' : 'manual')).slice(0,100),
      lab: item.type === 'lab' ? window.NexoLabPlan.normalize(item.lab) : undefined
    }));
    next.absences = next.absences.filter(item => item && typeof item === 'object' && subjectIds.has(item.subject) && /^\d{4}-\d{2}-\d{2}$/.test(String(item.date || '')) && todayKey(parseDay(item.date)) === item.date).map(item => ({
      id: item.id || uid('absence'),
      subject: item.subject,
      group: item.group === 'lab' ? 'lab' : 'theory',
      date: item.date
    }));
    if ((Number(raw.version) || 0) < 14) {
      for (const official of NEXO_SEMESTER.events) {
        if (!next.events.some(item => item.id === official.id || (item.subject === official.subject && item.title === official.title && item.date === official.date))) next.events.push(deepClone(official));
      }
      for (const [id, plan] of Object.entries(NEXO_SEMESTER.grades)) {
        const existing = raw.grades?.[id]?.components;
        if (!Array.isArray(existing) || (existing.length === 4 && existing.every(item => item.weight === '' && item.grade === ''))) next.grades[id] = { ...next.grades[id], ...deepClone(plan), rounding: '2' };
      }
    }
    // Control 1 de Orgánica II (Aminas), confirmado el 05-10: se agrega a quienes ya tenían el calendario sembrado.
    if(!next.events.some(item=>item.id==='official-org-c1')) next.events.push({...deepClone(NEXO_SEMESTER.events.find(item=>item.id==='official-org-c1')),priority:3,status:'planned'});
    if(!next.events.some(item=>item.id==='official-fisio-pep1')) next.events.push({...deepClone(NEXO_SEMESTER.events.find(item=>item.id==='official-fisio-pep1')),priority:3,status:'planned'}); // PEP 1 de Fisiopatología (programa 2026-2)
    NEXO_SEMESTER.upgrade?.(next, deepClone); // ponderaciones, labs y fechas reales de los programas (14-10-2026)
    // La calendarización docente posterior corrigió la fecha inicial del Control 1 FQII.
    // Solo actualiza el evento sembrado, no una fecha que el estudiante haya cambiado.
    const fqControl=next.events.find(item=>item.id==='official-fq-c1');
    if(fqControl?.date==='2026-10-20'&&['programa 2026','programación informada'].includes(fqControl.source)) {
      fqControl.date='2026-10-26';
      fqControl.source='Calendarización Ejercicios FQII QyF 2s2026';
      fqControl.dateNote=NEXO_SEMESTER.events.find(item=>item.id==='official-fq-c1').dateNote;
    }
    if (raw.gradePlans && typeof raw.gradePlans === 'object') {
      SUBJECTS.forEach(subject => (raw.gradePlans[subject.id] || []).forEach(item => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(item?.date || '')) || next.events.some(event => event.sourceId === item.id)) return;
        next.events.push({ id: uid('event'), sourceId: item.id || null, title: String(item.name || 'Evaluación'), subject: subject.id, type: 'Prueba', date: item.date, time: '' });
      }));
    }
    next.errors = next.errors.filter(item => item && typeof item === 'object').map(item => ({
      ...item,
      id: item.id || uid('error'),
      date: dateOrToday(item.date),
      subject: subjectIds.has(item.subject) ? item.subject : (LESSONS[item.lesson]?.subject || 'organica'),
      lessonId: LESSONS[item.lessonId] ? item.lessonId : (LESSONS[item.lesson] ? item.lesson : null),
      blocker: item.blocker || 'concept',
      observable: String(item.observable || item.answer || 'Error importado'),
      reasoning: String(item.reasoning || ''),
      diagnosis: String(item.diagnosis || item.rule || item.aiReply?.fix || 'Revisar el primer eslabón del razonamiento.'),
      status: item.status === 'resolved' ? 'resolved' : 'open'
    }));
    for (const key of ['mastery', 'practice', 'guides', 'exams', 'labs']) {
      next[key] = Object.fromEntries(Object.entries(next[key]).filter(([, item]) => item && typeof item === 'object' && !Array.isArray(item)));
    }
    if (raw.classMastery && typeof raw.classMastery === 'object') {
      Object.entries(raw.classMastery).forEach(([id, item]) => {
        if (!LESSONS[id] || !item || typeof item !== 'object' || next.mastery[id]) return;
        next.mastery[id] = { ...item, status: item.status === 'dominado' ? 'dominado' : 'inestable', dueAt: item.dueAt || item.reviewDue || todayKey(addDays(new Date(), 2)), attempts: Number(item.attempts) || 0, bestScore: Number(item.bestScore ?? item.score) || 0 };
      });
    }
    if (Array.isArray(raw.practiceCompleted)) {
      raw.practiceCompleted.forEach(id => { if (!next.practice[id]) next.practice[id] = { attempts: 1, checked: true, correct: true, lastAttempt: todayKey() }; });
    }
    // Mascota pixel (docs/mascota/SPEC.md · Fase 6): nombre, especie y vestuario (4 ranuras). Solo local.
    {
      const m = next.mascot || {}, outfit = {};
      ['cabeza', 'cara', 'cuello', 'mano'].forEach(slot => { if (typeof m.outfit?.[slot] === 'string' && /^\w{1,20}$/.test(m.outfit[slot])) outfit[slot] = m.outfit[slot]; });
      const kind = ['matraz', 'atomo', 'slime'].includes(m.kind) ? m.kind : 'matraz';
      // owned = mascotas que tienes: la inicial es gratis y para siempre; las otras se consiguen en la Tienda.
      const owned = [...new Set([kind, ...(Array.isArray(m.owned) ? m.owned : []).filter(k => ['matraz', 'atomo', 'slime'].includes(k))])];
      next.mascot = { name: String(m.name || '').trim().slice(0, 24) || 'Nexo', kind, owned, outfit };
    }
    // Tienda y cofres (docs/economia/SPEC.md): accesorios que tienes, polvo y cofres sin abrir.
    { next.shop = raw.shop; const s = window.NexoTienda.shopOf(next); s.owned = s.owned.filter(id => id in window.NexoTienda.RARITY_OF); }
    // Tutorial (docs/tutorial/SPEC.md): pending = lo verá solo; skipped/done = solo desde Ajustes. Datos viejos con progreso cuentan como ya vistos.
    {
      const tu = raw.tutorial && typeof raw.tutorial === 'object' ? raw.tutorial : null;
      // Una cuenta que ya eligió mascota (viaja en la nube) no repite el tutorial en otro dispositivo.
      const hasProgress = (next.sessions?.length || 0) + (next.completedLessons?.length || 0) + Object.keys(next.practice || {}).length > 0 || !!raw.mascot?.kind;
      const sections = {}; ['clases', 'juegos', 'organizacion', 'perfil'].forEach(k => { if (tu?.sections?.[k]) sections[k] = true; });
      next.tutorial = tu && ['pending', 'skipped', 'done'].includes(tu.status) ? { status: tu.status, rewarded: !!tu.rewarded, sections, news: Math.max(0, Math.floor(Number(tu.news)) || 0) }
        : hasProgress ? { status: 'done', rewarded: true, sections: {}, news: 0 } : { status: 'pending', rewarded: false, sections: {}, news: 0 };
    }
    if (!DATA.backgrounds.some(item => item.id === next.settings.background)) next.settings.background = base.settings.background;
    next.lessonSession = null; // las clases se están rehaciendo: no hay avance de clase que conservar
    next.meta = { ...base.meta, ...next.meta };
    // Borrón y cuenta nueva de la tienda (4 oct 2026): una sola vez, átomos a cero y sin artículos.
    if (!next.meta.shopReset202610) { next.coins = 0; next.inventory = []; next.settings.focusMode = false; next.meta.shopReset202610 = true; }
    next.completedLessons.forEach(id => {
      if (LESSONS[id] && !next.mastery[id]) next.mastery[id] = { status: 'inestable', bestScore: 0, attempts: 0, understoodAt: todayKey(), dueAt: todayKey(addDays(new Date(), 2)) };
    });
    return next;
  }

  function isValidImport(value) {
    return value && typeof value === 'object' && Array.isArray(value.sessions) && Array.isArray(value.errors) && value.mascot && typeof value.mascot === 'object';
  }

  function loadState() {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    try {
      const parsed = JSON.parse(raw);
      const needsMigration = (Number(parsed.version) || 0) < SCHEMA_VERSION;
      if (needsMigration) {
        if ((Number(parsed.version)||0)<16) storage.preserveBeforeMigration(raw);
        if ((Number(parsed.version)||0)<17) storage.preserveBeforeV12(raw);
        if ((Number(parsed.version)||0)<18) storage.preserveBeforeV13(raw);
        storage.preserveBeforeV14(raw);
      }
      const normalized = normalizeState(window.NexoMigrations.migrate(parsed, SCHEMA_VERSION));
      if (needsMigration) { storage.schedule(normalized, { backup: false }); storage.flush(); }
      return normalized;
    }
    catch (error) {
      const backup = storage.getItem(BACKUP_KEY);
      if (backup) {
        try { recoveryNotice = 'El guardado principal estaba dañado; recuperé la copia automática anterior.'; return normalizeState(JSON.parse(backup)); }
        catch (_) { /* continúa con estado limpio */ }
      }
      recoveryNotice = 'No pude leer el guardado. Inicié una copia limpia sin borrar el archivo dañado; puedes importar un respaldo desde Ajustes.';
      return defaultState();
    }
  }

  let state = loadState();

  function saveState({ backup = true } = {}) {
    try {
      state.meta.updatedAt = new Date().toISOString();
      if (cloud.authenticated) {
        state.coins = cloud.balance;
        state.inventory = [...cloud.inventory];
        cloud.save(state);
      } else storage.schedule(state, { backup });
    }
    catch (_) { recoveryNotice = 'El navegador no pudo guardar este último cambio. Exporta un respaldo desde Ajustes antes de continuar.'; }
    updateChrome();
  }

  function showToast(message, actionLabel = '', action = null) {
    clearTimeout(toastTimer);
    undoAction = action;
    toast.innerHTML = `<span>${esc(message)}</span>${actionLabel ? `<button data-action="toast-action">${esc(actionLabel)}</button>` : ''}`;
    toast.classList.add('show');
    toastTimer = setTimeout(() => { toast.classList.remove('show'); undoAction = null; }, action ? 6500 : 3000);
  }

  function removeWithUndo(collection, id, label) {
    const index = collection.findIndex(item => item.id === id);
    if (index < 0) return;
    const [removed] = collection.splice(index, 1);
    saveState();
    renderRoute(false);
    showToast(`${label} eliminado.`, 'Deshacer', () => {
      collection.splice(Math.min(index, collection.length), 0, removed);
      saveState(); renderRoute(false); showToast(`${label} recuperado.`);
    });
  }

  function updateChrome() {
    const level = Math.floor(state.xp / 100) + 1;
    document.querySelectorAll('.level-chip').forEach(node => { node.textContent = `Nv. ${level}`; });
    const coins = document.querySelector('#railCoins'); if (coins) coins.textContent = Math.floor(state.coins);
    const headerCoins = document.querySelector('#headerCoins'); if (headerCoins && headerCoins.dataset.n !== String(Math.floor(state.coins))) { headerCoins.dataset.n = String(Math.floor(state.coins)); headerCoins.innerHTML = pixelText(headerCoins.dataset.n, { shadow: true }); }
    document.body.classList.toggle('reduce-motion', !state.settings.motion);
    window.NexoPerformance?.apply(state.settings);
    window.NexoAudio?.configure(state.settings);
    document.body.classList.toggle('focus-mode', Boolean(state.settings.focusMode && state.timer.status === 'running'));
  }

  function timerElapsedMs() {
    const running = state.timer.status === 'running' && state.timer.startedAt ? Date.now() - Number(state.timer.startedAt) : 0;
    return Math.max(0, Number(state.timer.elapsedBeforeMs || 0) + running);
  }

  const { sessionReward, sessionXp } = window.NexoEconomy;

  function streak() {
    const dates = new Set([...state.sessions.filter(s => sessionSeconds(s) >= 300).map(s => s.date), ...(state.boosts.protectedDates || [])]);
    let cursor = new Date();
    if (!dates.has(todayKey(cursor))) cursor = addDays(cursor, -1);
    let count = 0;
    while (dates.has(todayKey(cursor))) { count += 1; cursor = addDays(cursor, -1); }
    return count;
  }

  // Lo que la mascota sabe de tu semestre para reaccionar en la habitación del Perfil (mascot/reacciones.js).
  window.NexoReacciones?.bind(() => {
    const today = todayKey(), DAY = 864e5, daysTo = d => Math.round((parseDay(d) - parseDay(today)) / DAY);
    const exam = window.NexoTodayPlan?.hourglasses(state.events, today, 14)[0];
    const last = state.sessions.filter(s => sessionSeconds(s) >= 300).map(s => s.date).sort().at(-1);
    const fresh = Object.values(state.grades).flatMap(plan => plan.components || [])
      .filter(c => c.date && Number(c.grade) >= 1 && daysTo(c.date) <= 0 && daysTo(c.date) >= -10).sort((a, b) => b.date.localeCompare(a.date))[0];
    return { days: exam ? exam.days : null, away: last ? -daysTo(last) : null, streak: streak(), grade: fresh ? Number(fresh.grade) : null };
  });
  function applyStreakProtection() {
    const yesterday = todayKey(addDays(new Date(), -1));
    const before = todayKey(addDays(new Date(), -2));
    const dates = new Set(state.sessions.filter(s => sessionSeconds(s) >= 300).map(s => s.date));
    if (!dates.has(yesterday) && dates.has(before) && state.boosts.streakShields > 0 && !state.boosts.protectedDates.includes(yesterday)) {
      state.boosts.streakShields -= 1;
      state.boosts.protectedDates.push(yesterday);
      saveState();
      recoveryNotice = 'Tu Escudo de racha protegió el día de ayer.';
    }
  }

  function masteryStatus(id) { return ORGANIC[id] ? (state.organicProgress?.[id]?.status || 'pendiente') : (state.mastery[id]?.status || 'pendiente'); }
  function understood(id) { return ORGANIC[id] ? ['inestable', 'dominado'].includes(masteryStatus(id)) : (state.completedLessons.includes(id) || ['inestable', 'dominado'].includes(masteryStatus(id))); }
  function isUnlocked(subjectId, id) {
    if (subjectId === 'organica') return true;
    if (state.routeMode[subjectId] === 'urgent') return true;
    const ids = allLessons(subjectId), index = ids.indexOf(id);
    return index <= 0 || understood(ids[index - 1]) || understood(id);
  }
  function subjectProgress(subjectId) {
    const ids = allLessons(subjectId);
    return { understood: ids.filter(understood).length, mastered: ids.filter(id => masteryStatus(id) === 'dominado').length, total: ids.length };
  }
  function dueReviews() {
    const today = todayKey();
    return Object.entries(state.mastery)
      .filter(([id, item]) => LESSONS[id] && item.status === 'inestable' && item.dueAt && item.dueAt <= today)
      .sort((a, b) => a[1].dueAt.localeCompare(b[1].dueAt));
  }

  function reward(id) { return DATA.rewards.find(item => item.id === id); }
  // La mascota se está rehaciendo (docs/mascota/SPEC.md): por ahora no se dibuja en ninguna pantalla.
  function avatarMarkup() { return ''; }
  function petBind() {
    window.NexoPet?.bind({
      get: () => state.mascot,
      set: patch => { Object.assign(state.mascot, patch); saveState({ backup: false }); window.NexoPet.renderDock(document.getElementById('companionPresence')); },
      motion: () => state.settings.mascotMotion,
      studying: () => state.timer.status === 'running',
      shop: { state: () => state, save: () => { saveState({ backup: false }); updateChrome(); }, locked: () => cloud.authenticated, today: todayKey }
    });
  }
  function renderCompanionPresence() {
    const dock=document.getElementById('companionPresence');
    if(!dock)return;
    petBind();
    if(window.NexoPet)window.NexoPet.renderDock(dock);else{dock.hidden=true;dock.replaceChildren();}
  }

  function statusChip(status) {
    const labels = { pendiente: 'Pendiente', inestable: 'En práctica', dominado: 'Dominado' };
    return `<span class="status-chip ${status}">${labels[status] || labels.pendiente}</span>`;
  }
  function confidenceFor(id) {
    if (id === 'org-01') return { level: 'verified', label: 'Nexo · fuentes cotejadas', detail: 'Clase original de Nexo: diapositivas de Aminas (2025), páginas 5 y 17–27; guía 1a (2021), ejercicio 4. La PEP 2026 aún no se ha verificado.' };
    if (/^org-0[2-5]$/.test(id)) return { level: 'probable', label: 'Nexo · material docente', detail: 'Explicación elaborada por Nexo con diapositivas y guías de cátedra disponibles en Material Nexo. Revisa la pestaña Material de la clase; la PEP 2026 aún no se ha verificado.' };
    if (/^org-/.test(id)) return { level: 'probable', label: 'Nexo · material 2025', detail: 'Explicación elaborada por Nexo con diapositivas y guías 2025. El tramo exacto de la evaluación 2026 no está confirmado.' };
    if (/^fq-0[7-9]/.test(id)) return { level: 'probable', label: 'Nexo · prueba anterior', detail: 'Explicación generada por Nexo; se observó contenido relacionado en la prueba del 21-01-2026, pero eso no valida esta clase completa ni la PEP actual.' };
    return { level: 'probable', label: 'Nexo · revisar con cátedra', detail: 'Explicación generada por Nexo. La coincidencia de esta clase completa con el programa y las clases actuales todavía no está cotejada.' };
  }

  function pageHeader(eyebrow, title, lede, extra = '') {
    return `<header class="page-header"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</div>${extra}</header>`;
  }
  function emptyState(title, text, action = '') { return `<div class="empty-state"><span aria-hidden="true">○</span><h3>${title}</h3><p>${text}</p>${action}</div>`; }
  function progressBar(value, label) {
    const safe = clamp(Math.round(value), 0, 100);
    return `<div class="progress-wrap"><div class="progress-label"><span>${label}</span><strong>${safe}%</strong></div><div class="progress-track" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${safe}"><span style="width:${safe}%"></span></div></div>`;
  }

  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean).map(decodeURIComponent);
    return parts.length ? parts : ['home'];
  }
  // La primera vez (cuenta nueva) el Inicio lleva al tutorial. Navegadores automatizados (pruebas) no lo ven.
  const tutorialDue = () => state.tutorial?.status === 'pending' && !navigator.webdriver && !window.NexoRecorrido?.active;
  // Pantalla de entrada (docs/cuentas/SPEC.md): con la nube activa y sin sesión, la primera vez ofrece Google o invitado antes del tutorial.
  // Se espera a saber si hay sesión (cloudListo) para no mostrarla a quien ya entró.
  const ENTRADA_KEY = 'nexo-entrada-vista';
  let cloudListo = !cloud.enabled;
  const marcarCloudListo = () => { if (cloudListo) return; cloudListo = true; if (['home', 'entrada'].includes(parseRoute()[0])) renderRoute(false); };
  const entradaDue = () => {
    if (!cloud.enabled || cloud.authenticated || navigator.webdriver) return false;
    try { return !localStorage.getItem(ENTRADA_KEY); } catch (_) { return false; }
  };
  // Avisos del Grimorio (dist/tutorial/avisos.js, carga perezosa): primera vez en cada sección si saltaste el tutorial, y novedades.
  const withAvisos = fn => {
    if (window.NexoAvisos) return fn(window.NexoAvisos);
    const sc = document.createElement('script'); sc.src = 'tutorial/avisos.js?v=4'; sc.onload = () => fn(window.NexoAvisos); document.head.append(sc);
  };
  const checkAvisos = route => {
    if (navigator.webdriver || !state.tutorial || state.tutorial.status === 'pending' || route[0] === 'lesson') return;
    withAvisos(a => { if (parseRoute().join('/') === route.join('/')) a.check(route, state.tutorial, () => saveState({ backup: false })); });
  };
  function routeTo(...parts) {
    const target = `#/${parts.map(encodeURIComponent).join('/')}`;
    if (location.hash === target) renderRoute(); else location.hash = target;
  }
  function setActiveNav(route) {
    const primary = ['subject', 'lesson', 'subjects','library','knowledge','inspector'].includes(route[0]) ? 'learn'
      : ['practice','reviews','rescue','station','study'].includes(route[0]) ? 'learn'
      : ['planner','hub','timer'].includes(route[0]) ? 'planner'
      : ['profile', 'mascot', 'stats', 'settings','history'].includes(route[0]) ? 'profile' : route[0];
    document.querySelectorAll('.nav-btn, .profile-orb').forEach(button => {
      const active = button.dataset.route === primary;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
  }
  // Transición entre secciones (portal que se abre desde donde tocaste): ver NexoPixelUI.transition. El grimorio, el tutorial y las clases tienen la suya.
  function renderRoute(moveFocus = true) {
    const from = app.dataset.renderedRoute || '', to = parseRoute().join('/');
    const own = route => ['tutorial', 'lesson'].includes(route.split('/')[0]) || (route.split('/')[0] === 'learn' && route.split('/')[1] === 'course');
    if (!from || from === to || own(from) || own(to) || !window.NexoPixelUI) return paintRoute(moveFocus);
    window.NexoPixelUI.transition(() => paintRoute(moveFocus));
  }
  function paintRoute(moveFocus) {
    const previousRoute=app.dataset.renderedRoute;
    window.NexoAnimation?.prepare(app);
    if (document.body.classList.contains('in-classroom')) window.NexoAmbientTime?.stopPreview?.(); // la ventana de la torre puede haber cambiado la hora
    document.body.classList.remove('in-classroom');
    clearInterval(timerTicker);
    window.NexoWorkbench?.cleanup();
    window.NexoWillowView?.cleanup();
    window.NexoMascotController?.cleanup();
    window.NexoPet?.cleanup();
    const route = parseRoute();
    const routeChanged=previousRoute!==route.join('/');
    if(routeChanged)window.NexoActiveStudy?.stop();
    if (routeChanged) {
      if (route[0]==='lesson') cloud.track('lesson_started',{lesson_id:route[1]});
      if (route[0]==='shop') cloud.track('shop_opened');
      if (route[0]==='hub' && route[1]==='calendar') cloud.track('calendar_opened');
    }
    document.body.dataset.nexoRoute = route.join('/');
    const roomTheme=window.NexoRooms.apply(route[0] === 'lesson' ? ['subject', LESSONS[route[1]]?.subject] : route);
    window.NexoAmbientEvents?.apply(roomTheme.id,cloud.user?.id||'local');
    window.NexoAudio?.setRoom(route);
    setActiveNav(route);
    closeMore();
    const renderers = {
      home: () => (!cloudListo ? (app.innerHTML = '<section class="page"><p class="eyebrow">Abriendo la torre…</p></section>')
        : entradaDue() ? routeTo('entrada') : tutorialDue() ? routeTo('tutorial') : renderHome()),
      entrada: () => { // docs/cuentas/SPEC.md · se carga solo al abrirla
        if (!cloudListo || !entradaDue()) return routeTo('home');
        const go = () => { if (parseRoute()[0] === 'entrada') window.NexoEntrada.render(app, {
          google: () => cloud.signInWithGoogle({ volver: 'home' }),
          guest: () => { try { localStorage.setItem(ENTRADA_KEY, '1'); } catch (_) {} routeTo('home'); }
        }); };
        if (window.NexoEntrada) go(); else { const sc = document.createElement('script'); sc.src = 'cuentas/entrada.js?v=5'; sc.onload = go; document.head.append(sc); }
      },
      learn: () => route[1] === 'course'
        ? (route[3] === 'lesson' ? (LESSONS[route[4]]?.subject===route[2] ? renderLesson(route[4]) : renderSubjects())
          : route[3] === 'concept' ? renderAcademicExplorer('knowledge',route[4])
            : route[3] === 'evaluation' ? renderPreparationMap(route[2],route[4],route[5])
              : renderEvaluations(route[2]))
        : route[1] === 'map' ? renderAcademicExplorer('knowledge')
          : route[1] === 'library' ? renderAcademicLibrary() : renderSubjects(),
      train: () => routeTo(route[1] === 'reviews' ? 'reviews' : 'learn'),
      games: renderGames,
      subjects: renderSubjects,
      hub: () => window.NexoEstudio && ['calendar','grades'].includes(route[1]) ? routeTo('planner', window.NexoEstudio.legacy[route[1]]) : renderHub(route[1] || 'timer'),
      profile: () => window.NexoEstudio && ['grades','absences'].includes(route[1]) ? routeTo('planner','notas') : renderProfile(({avatar:'mascot',collection:'mascot',progress:'stats'})[route[1]]||route[1]),
      subject: () => renderSubject(route[1]),
      lesson: () => renderLesson(route[1]),
      practice: () => renderPractice(route[1] || 'exercises', route[2]),
      planner: () => window.NexoEstudio ? window.NexoEstudio.render(app, route[1], orgBridge()) : renderPlanner(route[1] || 'calendar'),
      timer: renderHome,
      stats: renderStats,
      history: () => window.NexoHistory.render(app,cloud,state),
      library: renderAcademicLibrary,
      knowledge: () => renderAcademicExplorer('knowledge'),
      reviews: () => renderAcademicExplorer('reviews'),
      rescue: () => renderAcademicRescue(route[1]||'org.lone-pair'),
      station: () => renderStation(route[1], route[2]),
      duelo: renderDuel,
      study: renderStudy,
      inspector: () => renderAcademicExplorer('inspector'),
      'ui-lab': () => renderWorkbench('ui-lab'),
      review: () => renderWorkbench('review'),
      performance: () => renderWorkbench('performance'),
      shop: renderShop,
      mascot: renderMascot,
      torre: () => renderTower(route[1] || 'organica'),
      settings: renderSettings,
      tutorial: () => { // docs/tutorial/SPEC.md · #/tutorial/test = prueba sin guardar nada; se carga solo al abrirla
        const mode = route[1] === 'test' ? 'test' : state.tutorial.status === 'pending' ? 'first' : 'replay';
        const REWARD = 150, api = {
          pet: () => ({ kind: state.mascot.kind, name: state.mascot.name }),
          setPet: (kind, name) => { Object.assign(state.mascot, { kind, name, owned: [...new Set([kind, ...(state.mascot.owned || [])])] }); saveState({ backup: false }); window.NexoPet?.renderDock?.(document.getElementById('companionPresence')); },
          canReward: () => !cloud.authenticated && !state.tutorial.rewarded,
          reward: () => { if (cloud.authenticated || state.tutorial.rewarded) return 0; state.coins += REWARD; state.tutorial.rewarded = true; saveState(); updateChrome(); return REWARD; },
          reward_amount: REWARD,
          skip: () => { if (state.tutorial.status === 'pending') { state.tutorial.status = 'skipped'; saveState({ backup: false }); withAvisos(a => { state.tutorial.news = a.VERSION; saveState({ backup: false }); }); } },
          finish: () => { state.tutorial.status = 'done'; saveState({ backup: false }); withAvisos(a => { state.tutorial.news = Math.max(state.tutorial.news || 0, a.VERSION); saveState({ backup: false }); }); }
        };
        const go = () => { if (parseRoute()[0] === 'tutorial') window.NexoTutorial.render(app, { mode, api: mode === 'test' ? null : api, sound: () => !!state.settings?.sound, exit: () => routeTo('home') }); };
        if (window.NexoTutorial) go(); else { const sc = document.createElement('script'); sc.src = 'tutorial/tutorial.js?v=18'; sc.onload = go; document.head.append(sc); }
      }
    };
    try { (renderers[route[0]] || renderHome)(); app.dataset.renderedRoute = route.join('/'); }
    catch (error) {
      recoveryNotice='Una vista falló al abrirse. Tus cambios locales siguen disponibles.';
      cloud.track('app_error');
      app.innerHTML = `<section class="page"><div class="panel error-boundary"><p class="eyebrow">RECUPERACIÓN DE VISTA</p><h1>Esta sección no pudo abrirse</h1><p>Tu progreso sigue guardado. Vuelve al inicio y, si se repite, exporta un respaldo desde Ajustes.</p><div class="button-row"><button class="primary-btn" data-route="home">Volver al inicio</button><button class="secondary-btn" data-route="settings">Abrir respaldo</button></div></div></section>`;
    }
    window.NexoAnimation?.navigate(app,previousRoute,route.join('/'));
    updateChrome();
    renderCompanionPresence(route);
    if (routeChanged) checkAvisos(route);
    document.documentElement.classList.add('nexo-ready');
    if(routeChanged)window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    if (moveFocus) requestAnimationFrame(() => {
      const detail=route[0]==='learn'&&route[3]==='evaluation'&&route[5]?app.querySelector('.preparation-detail'):null;
      (detail||app).focus({preventScroll:true});
      if(detail&&matchMedia('(max-width: 700px)').matches)detail.scrollIntoView({block:'start',behavior:'auto'});
    });
  }

  function renderHome() { return renderHomeRpg(); }

  function renderGames() {
    // La escena del Arcade la pone world/torre-mundo.js; cada tarjeta tiene su máquina en la sala (data-game-card).
    app.innerHTML = `<section class="page games-room">${pageHeader('ARCADE ARCANO','Juegos','Elige una máquina o cruza el portal')}<div class="games-grid">${[['memory','Memory Lab'],['hunter','Error Hunter'],['blitz','Blitz']].map(([id,name])=>`<article class="game-placeholder" data-game-card="${id}"><span aria-hidden="true">◇</span><h2>${name}</h2><p>Próximamente</p></article>`).join('')}<article class="game-placeholder" data-game-card="campaign"><span aria-hidden="true">♛</span><h2>Juego nuevo</h2><p>Próximamente</p></article></div></section>`;
  }

  function rankedCommitments(day) {
    const weaknesses = Object.fromEntries(SUBJECTS.map(subject => [subject.id,
      state.errors.filter(error => error.subject === subject.id && error.status !== 'resolved').length]));
    const prerequisites = Object.fromEntries(state.events.map(event => [event.id,
      (event.dependencies || []).filter(id => !LESSONS[id] || !understood(id)).length]));
    return window.NexoPriority.rank(state.events, { today: typeof day === 'string' ? day : todayKey(), weaknesses, prerequisites });
  }

  function priorityCard(item) {
    const { event, reasons } = item;
    const subject = subjectFor(event.subject);
    return `<article class="priority-card" style="--course:${subject.color}"><div class="priority-card-top"><span>${esc(subject.short)}</span><time datetime="${esc(event.date)}">${formatDate(event.date)}</time></div><h3>${esc(event.title)}</h3><p>${reasons.map(esc).join(' · ')}</p><button data-route="planner" data-route-sub="calendar">Ver en calendario →</button></article>`;
  }

  // Organización (UPDATE 02): planner/estudio.js y planner/avisos.js leen y guardan el estado por aquí.
  const orgBridge = () => ({ state, save: () => saveState({ backup: false }), today: () => todayKey(), ranked: day => rankedCommitments(day),
    subjects: SUBJECTS, subjectFor, go: routeTo, toast: showToast, uid, gradeConfig, syncGrade: syncGradeEvent, exportIcs });

  function todayStudyMinutes() {
    return Math.round(state.sessions.filter(session => session.date === todayKey())
      .reduce((sum, session) => sum + sessionSeconds(session), 0) / 60);
  }

  function renderHomeRpg() {
    const subject = subjectFor(ui.homeSubject);
    const ranked = rankedCommitments();
    const evaluations = ranked.filter(item => ['exam','Prueba','control'].includes(item.event.type)).slice(0,3);
    const todayEvents = state.events.filter(event => event.date === todayKey() && event.status !== 'done');
    const studied = todayStudyMinutes(), goal = state.settings.dailyGoalMinutes;
    const saved = LESSONS[state.lessonSession?.id];
    const continuingSubject = saved ? subjectFor(saved.subject) : subject;
    const pepIndex = Math.max(0, continuingSubject.peps.findIndex(pep => pep.lessons.includes(saved?.id || allLessons(continuingSubject.id).find(id => !understood(id)))));
    const pep = continuingSubject.peps[pepIndex];
    const scene=window.NexoRooms.homeScene;
    const profile=window.NexoHomeScene.getProfile(),composition=window.NexoHomeScene.render(profile);
    const sceneBackground=new URL(composition.backgroundAsset,document.baseURI).href;
    const zones=Object.values(scene.anchors).map(anchor=>`<span class="home-scene-zone" data-scene-zone="${anchor.zone}" style="left:${anchor.bounds[0]*100}%;top:${anchor.bounds[1]*100}%;width:${anchor.bounds[2]*100}%;height:${anchor.bounds[3]*100}%" aria-hidden="true"></span>`).join('');
    app.innerHTML = `<section class="page rpg-home refuge-page">
      ${recoveryNotice ? `<div class="notice warning"><b>Respaldo</b><span>${esc(recoveryNotice)}</span><button data-route="profile" data-route-sub="settings">Revisar</button></div>` : ''}
      <div class="refuge">
        <div class="refuge-room" aria-label="Habitación con ventana, biblioteca, escritorio y rincón de descanso">
          <div class="home-pan" data-pan="start">
          <div class="home-art-plane ${composition.debug?'scene-debug':''}" data-scene-id="${profile.sceneId}" style="--room-art:url('${sceneBackground}');--scene-aspect:${profile.referenceWidth}/${profile.referenceHeight};--mascot-depth:${profile.layers.mascot}">
            ${composition.markup}
            ${zones}
          </div>
          </div>
          <span class="home-pan-hint" aria-hidden="true">Desliza para explorar ⟷</span>
          ${homeClockMarkup(evaluations[0], studied)}
          <div class="home-room-hud"><span class="streak-hud">✦ ${streak()} días de racha</span></div>
        </div>
        <div class="refuge-signs">
          <div class="signs-beam" aria-hidden="true"></div>
          <section class="sign sign-pruebas evaluation-board pu-panel" aria-labelledby="priorityTitle">
            <i class="sign-chain sign-chain-l" aria-hidden="true"></i><i class="sign-chain sign-chain-r" aria-hidden="true"></i><i class="pu-ivy sign-ivy-l" aria-hidden="true"></i>
            <h2 class="sign-title" id="priorityTitle">${pixelText('Próximas pruebas')}</h2>
            <div class="sign-paper pu-paper"><i class="pu-seal pu-seal-1" aria-hidden="true"></i>
              ${evaluations.length ? `<ol class="evaluation-notes">${evaluations.map((item,index) => {const course=subjectFor(item.event.subject);return `<li class="evaluation-note ${index===0?'next-evaluation':''}"><div><span>${esc(course.name)}</span><time datetime="${esc(item.event.date)}">${formatDate(item.event.date)}</time></div><h3>${pixelText(esc(item.event.title),{shadow:false})}</h3><p>${item.reasons.map(esc).join(' · ')}</p>${item.event.dateNote||item.event.weekdayUncertain?`<small>${esc(item.event.dateNote||'Fecha por confirmar con cátedra.')}</small>`:''}<button class="paper-link" data-route="planner" data-route-sub="calendar">Ver evaluación en Bitácora →</button></li>`;}).join('')}</ol>` : '<p class="paper-empty">Sin pruebas pendientes en tu calendario.</p>'}
            </div>
            <button class="pu-btn sign-link" data-route="planner" data-route-sub="calendar">${pixelText('Abrir mi calendario →',{shadow:false})}</button>
          </section>
          <section class="sign sign-dia day-paper pu-panel" aria-labelledby="dayTitle">
            <i class="sign-chain sign-chain-l" aria-hidden="true"></i><i class="sign-chain sign-chain-r" aria-hidden="true"></i><i class="pu-ivy pu-ivy-b sign-ivy-r" aria-hidden="true"></i>
            <h2 class="sign-title" id="dayTitle">${pixelText('Tu día')}</h2>
            <div class="sign-paper pu-paper"><i class="pu-seal pu-seal-2" aria-hidden="true"></i>
              <div class="day-goal"><span>${pixelText('Meta',{shadow:false})}</span><strong>${pixelText(`${studied} / ${goal} min`,{shadow:false})}</strong><div class="goal-bar pu-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${Math.min(studied,goal)}" aria-label="${studied} de ${goal} minutos estudiados hoy"><i style="width:${Math.min(100,Math.round(100*studied/Math.max(1,goal)))}%"></i></div></div>
              <ul class="day-agenda">${todayEvents.length ? todayEvents.slice(0,3).map(event=>`<li><span aria-hidden="true">◇</span><div><b>${pixelText(event.title,{shadow:false})}</b><small>${esc(subjectFor(event.subject).name)}${event.time?` · ${esc(event.time)}`:''}</small></div></li>`).join('') : '<li><span aria-hidden="true">☼</span><div><b>Sin compromisos hoy</b><small>Tu calendario está libre para estudiar a tu ritmo.</small></div></li>'}</ul>
            </div>
            <button class="pu-btn sign-link" data-route="reviews">${pixelText(`${dueReviews().length} repasos pendientes →`,{shadow:false})}</button>
          </section>
          <section class="sign sign-continuar continue-volume pu-panel" aria-labelledby="continueTitle">
            <i class="sign-chain sign-chain-l" aria-hidden="true"></i><i class="sign-chain sign-chain-r" aria-hidden="true"></i><i class="pu-ivy sign-ivy-l" aria-hidden="true"></i>
            <h2 class="sign-title" id="continueTitle">${pixelText('Continuar')}</h2>
            <div class="sign-paper pu-paper"><i class="pu-seal pu-seal-3" aria-hidden="true"></i>
              <p class="continue-where"><b>${pixelText(continuingSubject.name,{shadow:false})}</b><span>${esc(pep?.name||'Selecciona una evaluación')}</span></p>
              ${saved?`<button class="paper-link saved-lesson" data-open-lesson="${state.lessonSession.id}">Retomar clase guardada: ${esc(saved.title)} →</button>`:''}
            </div>
            <div class="volume-actions"><button class="pu-btn pu-btn-wide" data-grimoire-route="learn/course/${continuingSubject.id}/evaluation/pep-${pepIndex+1}">${pixelText('Preparar prueba →',{shadow:false})}</button><button class="pu-btn sign-link" data-route="learn">${pixelText('Elegir otro ramo',{shadow:false})}</button></div>
          </section>
        </div>
        <footer class="refuge-caption">Un lugar donde el conocimiento florece.</footer>
      </div>
    </section>`;
    window.NexoHomeScene.enhancePan?.(app);
    petBind(); window.NexoPet?.mountHome(app.querySelector('.home-art-plane')); window.NexoPet?.checkWeather();
    window.NexoOrgAvisos?.home(app, orgBridge());
    startHomeClock();
  }

  // Reloj de la torre en el Inicio: hora y momento del día, cronómetro de estudio, minutos de hoy y próxima evaluación.
  const dayMoment = hour => hour < 6 ? 'madrugada' : hour < 12 ? 'mañana' : hour < 19 ? 'tarde' : 'noche';
  const GREETINGS = { madrugada: 'Noche larga', mañana: 'Buen día', tarde: 'Buena tarde', noche: 'Buena noche' };
  const pixelText = (text, options) => window.NexoPixelText.render(text, options);
  // Tamaño del reloj a gusto: 1 mini · 2 normal · 3 grande · 4 enorme (píxeles enteros, ver update01.css), se recuerda en este dispositivo (no viaja con la cuenta).
  const CLOCK_SCALES = [1, 2, 3, 4];
  const clockScale = () => { try { const v = Number(localStorage.getItem('nexo.clockSize')); return CLOCK_SCALES.includes(v) ? v : 2; } catch (_) { return 1; } };
  function resizeClock(step) {
    const next = CLOCK_SCALES[Math.max(0, Math.min(CLOCK_SCALES.length - 1, CLOCK_SCALES.indexOf(clockScale()) + step))];
    try { localStorage.setItem('nexo.clockSize', String(next)); } catch (_) { /* sin almacenamiento: vale solo hasta recargar */ }
    if (document.querySelector('.home-clock')) document.querySelector('.home-clock').dataset.cs = next;
    document.querySelectorAll('[data-clock-size]').forEach(button => { button.disabled = button.dataset.clockSize === '-1' ? next === CLOCK_SCALES[0] : next === CLOCK_SCALES[CLOCK_SCALES.length - 1]; });
  }
  function homeClockMarkup(nextEvaluation, studiedMinutes) {
    const timer = state.timer, running = timer.status === 'running', paused = timer.status === 'paused';
    const days = nextEvaluation ? daysBetween(todayKey(), nextEvaluation.event.date) : null;
    const countdown = days === null ? 'Sin pruebas a la vista' : `${nextEvaluation.event.title} · ${days <= 0 ? 'hoy' : days === 1 ? 'mañana' : `${days} días`}`;
    const pt = (text, shadow = false) => pixelText(text, { shadow });
    return `<aside class="home-clock ${running ? 'is-running' : ''}" data-cs="${clockScale()}" aria-label="Reloj de estudio">
      <i class="hc-gear" aria-hidden="true"></i><i class="hc-orb" aria-hidden="true"></i><i class="hc-leaf hc-leaf-l" aria-hidden="true"></i><i class="hc-leaf hc-leaf-r" aria-hidden="true"></i><i class="hc-pendulum" aria-hidden="true"></i><i class="hc-flask" aria-hidden="true"></i>
      <div class="hc-now"><div class="hc-hour" data-hc-time role="text"></div><div class="hc-greet" data-hc-moment></div></div>
      <div class="hc-timer"><div class="hc-label">${pt(`${running ? 'Estudiando' : paused ? 'En pausa' : 'Cronómetro'} · ${subjectFor(timer.subject).short}`)}</div><div class="hc-digits" id="homeTimer" role="timer">${pixelDigits(formatClock(timerElapsedMs()))}</div></div>
      <div class="hc-controls">${running ? `<button class="hc-btn pu-btn" data-action="timer-pause" aria-label="Pausar">${pt('Pausar')}</button>` : `<button class="hc-btn hc-primary pu-btn" data-action="timer-start" aria-label="${paused ? 'Seguir' : 'Estudiar'}">${pt(paused ? 'Seguir' : 'Estudiar')}</button>`}${timerElapsedMs() >= 1000 ? `<button class="hc-btn pu-btn" data-action="timer-finish" aria-label="Terminar">${pt('Terminar')}</button>` : ''}</div>
      <div class="hc-meta"><span class="hc-plate">${pt(`Hoy · ${studiedMinutes} min`)}</span><span class="hc-plate hc-plate-exam">${pt(countdown)}</span><span class="hc-size" role="group" aria-label="Tamaño del reloj"><button class="pu-btn" data-clock-size="-1" aria-label="Achicar reloj" ${clockScale() === CLOCK_SCALES[0] ? 'disabled' : ''}>${pt('-')}</button><button class="pu-btn" data-clock-size="1" aria-label="Agrandar reloj" ${clockScale() === CLOCK_SCALES[CLOCK_SCALES.length - 1] ? 'disabled' : ''}>${pt('+')}</button></span></div>
    </aside>`;
  }
  // Chispas de latón, cristal y hoja al terminar una sesión: viven en el body porque el Inicio se vuelve a pintar al guardar.
  function sparkBurst(origin) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('reduce-motion')) return;
    const box = origin.getBoundingClientRect(), layer = document.createDocumentFragment(), made = [];
    for (let i = 0; i < 22; i += 1) {
      const spark = document.createElement('b'), angle = Math.PI * 2 * i / 22 + Math.random() * 0.5, dist = 50 + Math.random() * 70;
      spark.className = 'hc-spark';
      spark.style.cssText = `left:${box.left + box.width / 2}px;top:${box.top + box.height / 2}px;--dx:${Math.cos(angle) * dist}px;--dy:${Math.sin(angle) * dist - 30}px;animation-delay:${Math.random() * 90}ms`;
      layer.appendChild(spark); made.push(spark);
    }
    document.body.appendChild(layer);
    setTimeout(() => made.forEach(spark => spark.remove()), 1100);
  }
  function startHomeClock() {
    clearInterval(timerTicker);
    const tick = () => {
      const now = new Date(), time = document.querySelector('[data-hc-time]');
      if (!time) return;
      const clock = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }), moment = dayMoment(now.getHours());
      if (time.dataset.t !== clock) { time.dataset.t = clock; time.innerHTML = pixelDigits(clock); time.setAttribute('aria-label', clock); }
      const greet = document.querySelector('[data-hc-moment]');
      if (greet.dataset.m !== moment) { greet.dataset.m = moment; greet.innerHTML = pixelText(GREETINGS[moment], { shadow: false }); }
      const digits = document.querySelector('#homeTimer');
      const elapsed = formatClock(timerElapsedMs());
      if (digits && state.timer.status === 'running' && digits.dataset.t !== elapsed) { digits.dataset.t = elapsed; digits.innerHTML = pixelDigits(elapsed); digits.setAttribute('aria-label', elapsed); }
    };
    tick();
    timerTicker = setInterval(tick, 250); // cada cuarto de segundo para que los segundos cambien justo en su momento; solo se repinta si cambió el texto
  }

  function lessonQuickRow(id) {
    const lesson = LESSONS[id], subject = lessonSubject(id);
    return `<button class="compact-row" data-open-lesson="${id}"><span class="subject-dot" style="--course:${subject.color}">${subject.short}</span><div><b>${esc(lesson.title)}</b><small>${esc(lesson.central)}</small></div><i>${window.NexoClassCatalog?.[id] ? 'Entrar al aula →' : 'Próximamente'}</i></button>`;
  }
  function eventRow(event) {
    const subject = subjectFor(event.subject), diff = daysBetween(todayKey(), event.date);
    return `<div class="compact-row static"><span class="date-box"><b>${parseDay(event.date).getDate()}</b><small>${new Intl.DateTimeFormat('es-CL', { month: 'short' }).format(parseDay(event.date))}</small></span><div><b>${esc(event.title)}</b><small>${subject.name} · ${diff < 0 ? 'pasó' : diff === 0 ? 'hoy' : `faltan ${diff} días`}</small></div></div>`;
  }

  function grimoireShell(subject, title, subtitle, content, aside, pageLabel) {
    const courses = SUBJECTS.map(item => `<button class="grimoire-tab ${subject?.id===item.id?'active':''}" data-grimoire-route="learn/course/${item.id}" ${subject?.id===item.id?'aria-current="page"':''} title="${esc(item.name)}"><span aria-hidden="true">${window.NexoRooms.courses[item.id]?.symbol||item.icon}</span><span>${esc(item.short)}</span></button>`).join('');
    const position=subject?SUBJECTS.findIndex(item=>item.id===subject.id):0;
    const previous=SUBJECTS[position-1],next=SUBJECTS[position+1];
    const overview=subject&&!pageLabel.startsWith('III')?`<ol class="course-outline">${subject.peps.map((pep,index)=>`<li><span>${String(index+1).padStart(2,'0')}</span><b>${esc(pep.name.split(' · ').slice(1).join(' · ')||pep.name)}</b></li>`).join('')}</ol>`:'';
    const pagination=`<nav class="folio-navigation" aria-label="Pasar páginas de ramo"><button class="ink-link" ${previous?`data-grimoire-route="learn/course/${previous.id}"`:'disabled'}>Ramo anterior${previous?`<small>${esc(previous.name)}</small>`:''}</button><span>${position+1} / ${SUBJECTS.length}</span><button class="ink-link" ${next?`data-grimoire-route="learn/course/${next.id}"`:'disabled'}>Ramo siguiente${next?`<small>${esc(next.name)}</small>`:''}</button></nav>`;
    return `<section class="page grimoire-scene"><nav class="grimoire-wayfinding" aria-label="Ubicación en el grimorio"><button class="wood-link" data-route="home">Volver al refugio</button><button class="wood-link" data-route="learn">Índice de ramos</button><button class="wood-link" data-route="learn" data-route-sub="library">Biblioteca</button></nav><div class="grimoire" data-book-course="${subject?.id||'index'}" style="--book-accent:${subject?window.NexoRooms.courses[subject.id]?.accent:'#5e7047'}"><nav class="grimoire-tabs" aria-label="Marcadores de ramo">${courses}</nav><span class="book-spine" aria-hidden="true"></span><div class="grimoire-spread"><header class="grimoire-frontispiece"><p class="eyebrow">NEXO · CUADERNO DE ESTUDIO</p><div class="grimoire-crest" aria-hidden="true">${subject?window.NexoRooms.courses[subject.id]?.symbol||subject.icon:'✧'}</div><h2>${subject?esc(subject.name):'El grimorio del conocimiento'}</h2><p>${subject?esc(subject.description):'Cuatro ramos, un lugar para volver a tus preguntas.'}</p>${overview}${aside}<span class="folio-mark" aria-hidden="true">✦</span></header><div class="grimoire-folio"><p class="eyebrow">${esc(pageLabel)}</p><h1>${esc(title)}</h1><p class="folio-intro">${esc(subtitle)}</p>${content}<footer class="folio-footer">${subject?esc(subject.short):'NEXO'} · ${esc(pageLabel)}</footer></div></div>${pagination}</div></section>`;
  }

  // Aprender = el Sótano de los Cristales (dist/aprender/, docs/aprender-pasillo/SPEC.md). Carga bajo demanda.
  function aprenderContext() {
    return { getState: () => state, subjects: SUBJECTS, lessonTitle: id => LESSONS[id]?.title || id,
      loadClass: id => loadClassroom(id),
      openLesson: (id, mission) => {
        if (mission) { // abrir la clase directo en esa misión (como el botón "Misión" del aula)
          const session = (state.classSessions ||= {})[id] ||= {};
          session.path = 'misiones'; session.mission = mission; session.beat = (session.far?.[mission] || 0) > 1 ? session.far[mission] : 1; session.panel = null;
          saveState({ backup: false });
        }
        openLesson(id);
      } };
  }
  function renderSubjects() {
    if (window.NexoAprender) return window.NexoAprender.render(app, aprenderContext());
    app.innerHTML = '<section class="page"><div class="app-loader" role="status"><span></span><p>Bajando al sótano…</p></div></section>';
    Promise.all([window.NexoLoader.style('./aprender/sotano.css?v=4d21dcc9'), window.NexoLoader.script('./aprender/estado.js?v=59f4873c').then(() => window.NexoLoader.script('./aprender/sotano.js?v=2f0d6eab'))])
      .then(() => { if (['learn', 'subjects'].includes(parseRoute()[0])) renderRoute(false); })
      .catch(() => { app.innerHTML = '<section class="page"><div class="panel error-boundary"><h1>No se pudo abrir el sótano</h1><p>Revisa tu conexión y vuelve a intentarlo.</p><button class="primary-btn" data-route="learn">Reintentar</button></div></section>'; });
  }

  function evaluationDates(evaluation) {
    return evaluation.events.length ? evaluation.events.map(event=>`<span class="evaluation-date"><time datetime="${esc(event.date)}">${formatDate(event.date)}</time>${event.status==='done'?' · Registrada como terminada':''}${event.dateNote||event.weekdayUncertain?`<small>${esc(event.dateNote||'Fecha por confirmar con cátedra.')}</small>`:''}</span>`).join('') : '<span class="evaluation-date">Sin fecha vinculada en tu calendario</span>';
  }

  function renderEvaluations(subjectId) {
    const subject=SUBJECTS.find(item=>item.id===subjectId);
    if(!subject) return renderSubjects();
    const evaluations=window.NexoPreparation.evaluations(subject,state.events);
    const content=`<div class="grimoire-evaluations">${evaluations.map(evaluation=>{
      const registered=evaluation.lessons.filter(understood).length;
      return `<button class="evaluation-chapter" data-grimoire-course="${subject.id}" data-grimoire-evaluation="${esc(evaluation.id)}"><span class="chapter-label">${esc(evaluation.kind)}</span><h2>${esc(evaluation.name)}</h2>${evaluationDates(evaluation)}<span class="chapter-summary">${evaluation.lessons.length?`${registered}/${evaluation.lessons.length} temas con registro · Abrir mapa →`:'Temario por vincular · Ver evaluación →'}</span></button>`;
    }).join('')}</div>`;
    app.innerHTML=grimoireShell(subject,'Evaluaciones y capítulos','Elige una evaluación para abrir su mapa de preparación.',content,`<button class="ink-link" data-route="subject" data-route-sub="${subject.id}">Consultar clases anteriores</button>`,'II · CAPÍTULOS');
  }

  function renderPreparationMap(subjectId,evaluationId,selectedId) {
    const subject=SUBJECTS.find(item=>item.id===subjectId);
    if(!subject) return renderSubjects();
    const evaluation=window.NexoPreparation.evaluations(subject,state.events).find(item=>item.id===evaluationId);
    if(!evaluation) return renderEvaluations(subjectId);
    const ids=evaluation.lessons.filter(id=>LESSONS[id]);
    ids.filter(id=>window.NexoClassCatalog?.[id]).forEach(id=>loadClassroom(id).catch(()=>{})); // precarga: entrar al aula es instantáneo
    const selected=ids.includes(selectedId)?selectedId:null;
    const registered=ids.filter(understood).length;
    const points=window.NexoPreparation.layout(ids.length);
    const height=Math.max(250,ids.length*140+40);
    const path=points.map((point,index)=>index===0?`M ${point.x} ${point.y}`:`C ${points[index-1].x} ${point.y-75}, ${point.x} ${point.y-65}, ${point.x} ${point.y}`).join(' ');
    const nodes=ids.map((id,index)=>{
      const status=masteryStatus(id),recorded=understood(id),lesson=LESSONS[id];
      const label=status==='dominado'?'Autoverificación registrada':recorded?'Comprensión registrada':'Por preparar';
      return `<li class="preparation-stop" style="--map-x:${points[index].x}%"><button class="preparation-node ${recorded?'recorded':''}" data-grimoire-course="${subject.id}" data-grimoire-evaluation="${esc(evaluation.id)}" data-grimoire-node="${id}" ${selected===id?'aria-current="step"':''}><span class="map-node-seal" aria-hidden="true">${recorded?'✓':index+1}</span><span class="map-node-label"><b>${esc(lesson.title)}</b><small>${label}</small></span></button></li>`;
    }).join('');
    const detail=selected?`<section class="preparation-detail" aria-labelledby="preparationDetailTitle"><p class="eyebrow">ETAPA ${ids.indexOf(selected)+1}</p><h2 id="preparationDetailTitle">${esc(LESSONS[selected].title)}</h2><p>${esc(LESSONS[selected].central||'Consulta el material disponible para este tema.')}</p>${window.NexoClassCatalog?.[selected]?`<button class="primary-btn" data-open-lesson="${selected}">Entrar al aula →</button>`:'<p class="legacy-note"><b>Disponible próximamente.</b> Estamos rehaciendo esta clase desde cero.</p>'}</section>`:'<p class="grimoire-margin-note">Sigue el sendero.<br>Selecciona un tema para ver su material y registro.</p>';
    const map=ids.length?`<div class="preparation-map" style="--map-height:${height}px"><svg class="preparation-path" viewBox="0 0 100 ${height}" preserveAspectRatio="none" aria-hidden="true"><path d="${path}" /></svg><span class="map-compass" aria-hidden="true">✥<small>N</small></span><ol class="preparation-stops">${nodes}</ol><span class="map-destination" aria-hidden="true">✦</span></div><p class="map-legend">✓ Con registro de comprensión · números: orden sugerido</p>`:`<section class="preparation-empty"><span aria-hidden="true">✥</span><h2>Temario por vincular</h2><p>Esta evaluación está en tu calendario, pero todavía no tiene un recorrido asociado. Consulta su temario en Bitácora.</p><button class="ink-link" data-route="planner" data-route-sub="calendar">Abrir Bitácora →</button></section>`;
    app.innerHTML=grimoireShell(subject,evaluation.name,ids.length?'Un sendero de temas para orientar tu preparación.':'El mapa estará disponible cuando se vincule su temario.',`<button class="ink-link" data-grimoire-route="learn/course/${subject.id}">← Cambiar evaluación</button>${evaluationDates(evaluation)}${map}`,`<div class="map-record"><strong>${registered} / ${ids.length}</strong><span>temas con registro de comprensión</span><p>Registro histórico; no certifica dominio de la evaluación.</p></div>${detail}`,'III · MAPA');
    if(selected) {
      // Detail remains in normal flow; on mobile bring it into view after node selection.
      const detailElement=app.querySelector('.preparation-detail');
      detailElement?.setAttribute('tabindex','-1');
    }
  }

  function renderSubject(subjectId) {
    const subject = SUBJECTS.find(s => s.id === subjectId);
    if (!subject) return routeTo('subjects');
    const progress = subjectProgress(subject.id), mode = state.routeMode[subject.id] || 'progression';
    app.innerHTML = `<section class="page subject-page" style="--course:${subject.color}">
      <button class="back-btn" data-route="subjects">← Todos los ramos</button>
      <div class="subject-hero"><div><p class="eyebrow">${subject.short} · PRIORIDAD ${subject.priority}</p><h1>${subject.name}</h1><p>${subject.description}</p><div class="hero-stats"><b>${progress.understood}/${progress.total} comprendidas</b><b>${progress.mastered}/${progress.total} ${subject.id === 'organica' ? 'autoverificadas' : 'dominadas'}</b></div></div><span class="hero-icon" aria-hidden="true">${subject.icon}</span></div>
      <section class="route-switch panel" aria-labelledby="routeModeTitle"><div><p class="eyebrow">MODO DE ACCESO</p><h2 id="routeModeTitle">¿Construir base o ir directo a una prueba?</h2></div><div class="segmented" role="tablist" aria-label="Modo de acceso a las clases"><button role="tab" aria-selected="${mode === 'progression'}" class="${mode === 'progression' ? 'active' : ''}" data-route-mode="progression" data-subject="${subject.id}">Ruta progresiva</button><button role="tab" aria-selected="${mode === 'urgent'}" class="${mode === 'urgent' ? 'active' : ''}" data-route-mode="urgent" data-subject="${subject.id}">Prueba encima</button></div><p>${subject.id === 'organica' ? (mode === 'progression' ? 'El orden sugiere las bases necesarias, pero todas las clases se pueden abrir. En cada una eliges lectura completa, ejercicio directo o repaso.' : 'Entra a cualquier problema. Si aparece un bloqueo, vuelve al concepto preciso y reintenta sin pista.') : mode === 'progression' ? 'Las clases se abren en orden para que cada idea tenga base. La siguiente se libera con comprensión demostrada.' : 'Todas las clases quedan accesibles. Cada una ofrece una entrada compacta que conserva la teoría mínima y obliga a explicar el ejercicio.'}</p></section>
      <div class="pep-board">${subject.peps.map((pep, pepIndex) => `<section class="pep-column"><header><span>0${pepIndex + 1}</span><div><p>${pep.name.includes('PEP') ? 'EVALUACIÓN' : 'BLOQUE'}</p><h2>${pep.name}</h2></div></header><div class="lesson-list">${pep.lessons.map((id, index) => lessonNode(id, index, mode)).join('')}</div></section>`).join('')}</div>
      ${subject.id==='organica'?'<section class="panel"><h2>Estudiar hoy · Aminas</h2><p>Sesión corta que elige qué practicar según tus repasos y errores. Las pistas cuentan como ayuda.</p><div class="button-row"><button data-route="study" class="primary-btn">Estudiar ahora</button></div></section><section class="panel"><h2>Mapa de conocimiento · Aminas</h2><p>Explora conceptos, prerequisitos, evidencia y revisiones del piloto org-01.</p><div class="button-row"><button data-route="knowledge" class="secondary-btn">Abrir mapa</button><button data-route="reviews" class="secondary-btn">Revisiones</button></div></section>':''}
      <section class="panel lab-preview"><div><p class="eyebrow">LABORATORIO</p><h2>Preparación práctica del ramo</h2><p>Checklist prelab, cálculos, seguridad, datos crudos y cierre de informe. Lo que dependa del manual actual aparece explícitamente como pendiente.</p></div><button class="secondary-btn" data-route="practice" data-route-sub="labs" data-filter-subject="${subject.id}">Abrir laboratorio</button></section>
    </section>`;
  }

  function lessonNode(id, index, routeMode, pepLabel = '') {
    const lesson = LESSONS[id], unlocked = isUnlocked(lesson.subject, id), status = masteryStatus(id), confidence = confidenceFor(id);
    return `<button class="lesson-node ${status} ${unlocked ? '' : 'locked'}" data-open-lesson="${id}" ${unlocked ? '' : 'disabled'}><span class="node-index">${status === 'dominado' ? '✓' : unlocked ? index + 1 : '⌁'}</span><span class="node-copy">${pepLabel?`<span class="home-lesson-pep">${esc(pepLabel)}</span>`:''}<b>${esc(lesson.title)}</b><small>${ORGANIC[id] && status === 'dominado' ? '<span class="status-chip dominado">Autoverificado</span>' : statusChip(status)} · ${lesson.duration || 35} min</small><em class="source-badge ${confidence.level}" title="${esc(confidence.detail)}">${confidence.label}</em></span><i>${window.NexoClassCatalog?.[id] ? 'Entrar al aula →' : 'Próximamente'}</i></button>`;
  }

  let lessonReturnHash = '';
  function openLesson(id) {
    if (!LESSONS[id]) return;
    if (!location.hash.includes('/lesson/')) lessonReturnHash = location.hash; // al salir del aula se vuelve al mismo mapa
    routeTo('lesson', id);
  }

  let academicFoundation=null;
  let mascotAcademicSubscribed=false;
  function loadAcademicFoundation() {
    if(!academicFoundation)academicFoundation=['model','graph','diagnosis','knowledge','ranks','classifiers','sources','reviews','structured','engine','pending','library','inspector','explorer','rescue']
      .reduce((promise,name)=>promise.then(()=>window.NexoLoader.script(`./academic/${name}.js?v=528c3a29`)),Promise.resolve())
      .then(()=>{if(!mascotAcademicSubscribed){window.NexoAcademicEngine.subscribe(event=>
        window.NexoMascotController.react(event,app));mascotAcademicSubscribed=true;}})
      .catch(error=>{academicFoundation=null;throw error;});
    return academicFoundation;
  }
  window.NexoAcademicLoad=loadAcademicFoundation;
  function renderAcademicLibrary() {
    if(window.NexoAcademicLibrary)return window.NexoAcademicLibrary.render(app,{
      getState:()=>state,saveState,showToast,track:(...args)=>cloud.track(...args)});
    app.innerHTML='<section class="page"><p role="status">Abriendo Biblioteca…</p></section>';
    loadAcademicFoundation().then(()=>{const route=parseRoute();if(route[0]==='library'||route.join('/')==='learn/library')renderRoute(false);})
      .catch(()=>{app.innerHTML='<section class="page"><h1>Biblioteca no disponible</h1><button data-route="library">Reintentar</button></section>';});
  }
  /* Estación de clase (docs/clases-v2/SPEC.md): Adivina → Clase → Práctica → Demuestra. El punto de Demuestra entra a la evidencia de la clase. */
  function renderStation(id, missionId) {
    const cls = window.NexoClasses?.[id], failed = () => { app.innerHTML = '<section class="page"><div class="panel error-boundary"><h1>No se pudo abrir la estación</h1><button class="primary-btn" data-route="home">Volver al inicio</button></div></section>'; };
    if (!cls?.stations?.includes(missionId)) {
      app.innerHTML = '<section class="page"><p role="status">Abriendo la estación…</p></section>';
      loadClassroom(id).then(() => { if (window.NexoClasses?.[id]?.stations?.includes(missionId) && parseRoute()[0] === 'station') renderRoute(false); else failed(); }).catch(failed);
      return;
    }
    if (!window.NexoStation) {
      app.innerHTML = '<section class="page"><p role="status">Abriendo la estación…</p></section>';
      Promise.all([window.NexoLoader.style('./classes/estacion.css'), window.NexoLoader.script('./mascot/pixelmascotas.js'), window.NexoLoader.script('./classes/estacion-art.js')])
        .then(() => window.NexoLoader.script('./classes/estacion.js')).then(() => { if (parseRoute()[0] === 'station') renderRoute(false); }).catch(failed);
      return;
    }
    app.innerHTML = '<section class="page station-page"><div id="stationHost"></div></section>';
    window.NexoStation.mount(app.querySelector('#stationHost'), { cls, mission: missionId, pet: state.mascot, fullscreen: true, onExit: () => { location.hash = `#/lesson/${id}`; }, onResult: result => {
      const E = window.NexoClassEvidence; if (!E) return;
      const rec = E.record(state, id, { itemId: result.itemId, conceptId: 'am.orden', missionId, stage: 'transfer', step: 5, correct: result.correct, hint: false, retry: false, transfer: true, at: result.at });
      saveState({ backup: false });
      E.schedule(state, id, rec).then(() => saveState({ backup: false })).catch(() => {});
    } });
  }
  function renderAcademicRescue(conceptId) {
    if(window.NexoAcademicRescue)return window.NexoAcademicRescue.render(app,
      {getState:()=>state,saveState,showToast,track:(...args)=>cloud.track(...args)},conceptId);
    app.innerHTML='<section class="page"><p role="status">Abriendo Rescate…</p></section>';
    loadAcademicFoundation().then(()=>{if(parseRoute().join('/')===`rescue/${conceptId}`)renderRoute(false);})
      .catch(()=>{app.innerHTML='<section class="page"><h1>Rescate no disponible</h1><button data-route="knowledge">Volver al mapa</button></section>';});
  }
  function renderStudy() {
    const context={getState:()=>state,saveState,showToast};
    if(window.NexoStudyUI)return window.NexoStudyUI.render(app,context);
    app.innerHTML='<section class="page"><p role="status">Abriendo el motor de estudio…</p></section>';
    loadAcademicFoundation()
      .then(()=>['./vendor/fsrs/index.umd.js','./study/content.js','./study/engine.js','./study/ui.js']
        .reduce((promise,src)=>promise.then(()=>window.NexoLoader.script(src)),Promise.resolve()))
      .then(()=>{if(parseRoute()[0]==='study')renderRoute(false);})
      .catch(()=>{app.innerHTML='<section class="page"><h1>Motor de estudio no disponible</h1><button data-route="study">Reintentar</button></section>';});
  }
  function renderDuel() {
    const context={getState:()=>state,saveState,showToast,loadClass:loadClassroom,loadAcademic:loadAcademicFoundation};
    if(window.NexoDuelUI)return window.NexoDuelUI.render(app,context);
    app.innerHTML='<section class="page"><p role="status">Buscando un bicho…</p></section>';
    loadAcademicFoundation()
      .then(()=>['./game/duel.js','./game/director.js','./game/encounter.js','./game/duel-music.js','./game/duel-ui.js']
        .reduce((promise,src)=>promise.then(()=>window.NexoLoader.script(src)),Promise.resolve()))
      .then(()=>{if(parseRoute()[0]==='duelo')renderRoute(false);})
      .catch(()=>{app.innerHTML='<section class="page"><h1>Duelo no disponible</h1><button data-route="duelo">Reintentar</button></section>';});
  }
  function renderAcademicExplorer(view,conceptId) {
    if(window.NexoAcademicExplorer) {
      if(view==='inspector')return window.NexoAcademicInspector.render(app);
      return window.NexoAcademicExplorer[view==='reviews'?'renderReviews':'renderMap'](app,{
        getState:()=>state,getReservations:()=>cloud.reservations,
        track:(...args)=>cloud.track(...args)},conceptId);
    }
    app.innerHTML='<section class="page"><p role="status">Abriendo contenido académico…</p></section>';
    loadAcademicFoundation().then(()=>{const route=parseRoute();if(route[0]===view||route[0]==='learn')renderRoute(false);})
      .catch(()=>{app.innerHTML='<section class="page"><h1>Contenido no disponible</h1><button data-route="subjects">Volver a Ramos</button></section>';});
  }
  function renderWorkbench(view) {
    if (new URLSearchParams(location.search).get('nexoDev') !== '1') return renderHome();
    if(view==='ui-lab'&&!window.NexoArcaneRanks){
      app.innerHTML='<section class="page"><p role="status">Abriendo componentes…</p></section>';
      Promise.all([loadAcademicFoundation(),window.NexoLoader.script('./dev/workbench.js?v=6bcdb09f')])
        .then(()=>{if(parseRoute()[0]===view)renderRoute(false);})
        .catch(()=>{app.innerHTML='<section class="page"><h1>UI Lab no disponible</h1></section>';});
      return;
    }
    if (window.NexoWorkbench) {
      if (view === 'ui-lab') return window.NexoWorkbench.renderUiLab(app, { avatarMarkup });
      if (view === 'performance') return window.NexoWorkbench.renderPerformance(app);
      return window.NexoWorkbench.renderReview(app);
    }
    app.innerHTML='<section class="page"><p role="status">Abriendo herramientas de revisión…</p></section>';
    window.NexoLoader.script('./dev/workbench.js?v=6bcdb09f')
      .then(() => { if (parseRoute()[0] === view) renderRoute(false); })
      .catch(() => { if (parseRoute()[0] === view) app.innerHTML='<section class="page"><h1>Revisión no disponible</h1><button data-route="home">Volver al inicio</button></section>'; });
  }
  // Aula nueva: classes/catalog.js dice qué clases ya tienen contenido; las demás muestran "Disponible próximamente".
  const classroomLoads = new Map();
  function loadClassroom(id) {
    if (classroomLoads.has(id)) return classroomLoads.get(id);
    const promise = Promise.resolve(window.NexoClassCatalog || window.NexoLoader.script('./classes/catalog.js?v=8dec702d')).then(() => {
      const file = window.NexoClassCatalog?.[id];
      if (!file) return false;
      return Promise.all([window.NexoLoader.script('./classes/player.js?v=d54f576f'),
        window.NexoLoader.script('./classes/willow-tower.js?v=09c21b87').catch(() => null), // Torre del Sauce (etapa 10); sin ella, quedan las hojas en lista
        window.NexoLoader.script(`./classes/${file}?v=19`),
        // Motor de evidencia y repaso espaciado (FSRS); si no cargan, la clase funciona igual sin agendar repasos.
        window.NexoLoader.script('./classes/evidence.js?v=308f7a40'), window.NexoLoader.script('./classes/molecule.js?v=b3b2e5aa'), window.NexoLoader.script('./classes/editor.js?v=df0be94e'), window.NexoLoader.script('./academic/class-bridge.js?v=34abe0b8').catch(() => null), window.NexoLoader.script('./academic/reviews.js?v=0273ea6c').catch(() => null)])
        .then(() => Promise.all([window.NexoLoader.script(`./classes/slides/${id}.js?v=268941af`).catch(() => null), // diapositivas reales, si ya se convirtieron
          window.NexoLoader.script(`./classes/${id}-gen.js?v=33f747c1`).catch(() => null)])) // generadores de ejercicios (etapa 8), si la clase los tiene
        .then(() => true);
    });
    promise.catch(() => classroomLoads.delete(id));
    classroomLoads.set(id, promise);
    return promise;
  }

  function renderLesson(id) {
    const source = LESSONS[id];
    if (!source) return routeTo('subjects');
    const subject = subjectFor(source.subject);
    if (!classroomLoads.has(id)) {
      app.innerHTML = '<section class="page"><div class="app-loader" role="status"><span></span><p>Abriendo el aula…</p></div></section>';
      const onLessonRoute = () => { const route = parseRoute(); return route.join('/') === `lesson/${id}` ||
        (route[0] === 'learn' && route[1] === 'course' && route[3] === 'lesson' && route[4] === id); };
      loadClassroom(id).then(() => { if (onLessonRoute()) renderRoute(false); })
        .catch(() => { if (onLessonRoute()) app.innerHTML = '<section class="page"><div class="panel error-boundary"><h1>No se pudo abrir el aula</h1><p>Revisa tu conexión y vuelve a intentarlo.</p><button class="primary-btn" data-route="home">Volver al refugio</button></div></section>'; });
      return;
    }
    app.innerHTML = `<section class="page lesson-soon" style="--course:${subject.color}">
      <button class="back-btn" data-open-subject="${subject.id}">← Ruta de ${subject.name}</button>
      <div class="panel lesson-soon-card"><p class="eyebrow">${esc(subject.short)} · CLASE</p><h1>${esc(source.title)}</h1><p><b>Disponible próximamente</b></p><p>Estamos rehaciendo el aula dentro de la Cámara del ramo. Vuelve pronto.</p><div class="button-row">${(window.NexoClasses?.[id]?.stations || []).map(sid => `<a class="primary-btn" href="#/station/${id}/${sid}">Probar la estación nueva</a>`).join('')}<button class="${window.NexoClasses?.[id]?.stations?.length ? 'secondary-btn' : 'primary-btn'}" data-open-subject="${subject.id}">Volver a ${subject.name}</button><button class="secondary-btn" data-route="home">Ir al refugio</button></div></div>
    </section>`;
  }

  /* La torre de cada ramo (etapa 10): un lugar propio donde el sauce crece con lo que demuestras. */
  function renderTower(subjectId) {
    const subject = SUBJECTS.find(x => x.id === subjectId) || SUBJECTS[0];
    const lessonIds = (subject.peps || []).flatMap(p => p.lessons || []);
    if (!window.NexoWillowView) app.innerHTML = '<section class="page"><div class="app-loader" role="status"><span></span><p>Subiendo a la torre…</p></div></section>';
    // La torre junta las clases de la PEP 1 del ramo que ya existen (Orgánica: Aminas, Aromaticidad y SEA).
    const pepIds = (subject.peps?.[0]?.lessons || lessonIds);
    Promise.resolve(window.NexoClassCatalog || window.NexoLoader.script('./classes/catalog.js?v=8dec702d')).then(() => {
      const ids = pepIds.filter(l => window.NexoClassCatalog?.[l]);
      return Promise.all([window.NexoLoader.style('./classes/willow.css?v=5a60c6e7'), window.NexoLoader.script('./classes/willow-tower.js?v=09c21b87'), ...ids.map(loadClassroom)])
        .then(() => window.NexoLoader.script('./classes/willow-view.js?v=291be729')).then(() => ids);
    }).then(ids => {
      const id = ids[0];
      const route = parseRoute(); if (route[0] !== 'torre' || (route[1] || 'organica') !== subjectId) return;
      window.NexoWillowView.render(app, { subject: { id: subject.id, name: subject.name, color: subject.color }, cls: id ? window.NexoClasses?.[id] : null, classes: ids.map(x => window.NexoClasses?.[x]).filter(Boolean),
        getState: () => state, saveState: () => saveState({ backup: false }), subjectName: sid => subjectFor(sid).name,
        go: sid => routeTo('torre', sid), back: () => routeTo('home'), rerender: () => renderTower(subjectId),
        openClass: (cid, intent) => { if (!state.classSessions || typeof state.classSessions !== 'object') state.classSessions = {}; (state.classSessions[cid] ||= {}).intent = intent; saveState({ backup: false }); routeTo('lesson', cid); } });
    }).catch(() => { app.innerHTML = '<section class="page"><div class="panel error-boundary"><h1>No se pudo abrir la torre</h1><p>Revisa tu conexión y vuelve a intentarlo.</p></div></section>'; });
  }

  function stageIntro(kicker, title, text) { return `<div class="stage-intro"><p class="eyebrow">${kicker}</p><h2 id="stageTitle">${title}</h2><p>${text}</p></div>`; }
  function textEvidenceScore(text, keys, max) {
    const normalized = String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const hits = [...new Set(keys)].filter(key => normalized.includes(key)).length;
    const relation = /porque|provoca|por eso|entonces|debido|aument|dismin|forma|rompe|favore|permite/.test(normalized) ? 1 : 0;
    const completeness = clamp((hits / Math.max(2, Math.min(keys.length, 4))) * .75 + relation * .25, 0, 1);
    return Math.round(max * completeness);
  }



  const LABS = [
    { id: 'lab-org-1', subject: 'organica', title: 'Prelab de síntesis y transformación', status: 'provisional', objective: 'Traducir el procedimiento en función de cada reactivo y anticipar cambios observables.', calculation: 'Reactivo limitante, equivalentes, mmol, rendimiento teórico y porcentaje de rendimiento.', safety: 'Completa peligros, incompatibilidades, campana y residuos con la SDS y el manual vigente.', evidence: ['Esquema de reacción y mecanismo esperado', 'Tabla mmol/equivalentes', 'Observaciones separadas de interpretación', 'Cálculo de rendimiento y fuentes de pérdida'] },
    { id: 'lab-org-2', subject: 'organica', title: 'Purificación e identificación', status: 'provisional', objective: 'Elegir una separación desde propiedades físicas y justificar pureza.', calculation: 'Rf, recuperación de masa y comparación de intervalo de fusión o señal instrumental.', safety: 'Solventes, inflamabilidad, presión y descarte según el montaje real.', evidence: ['Dibujo del montaje', 'Criterio de elección de solvente', 'Datos crudos sin corregir', 'Conclusión limitada por la evidencia'] },
    { id: 'lab-ana-1', subject: 'analitica', title: 'Preparación, alícuota y estandarización', status: 'provisional', objective: 'Mantener trazabilidad desde la muestra hasta la concentración informada.', calculation: 'Masa, pureza, aforo, alícuota, estequiometría y factor de dilución.', safety: 'Rotulación, material volumétrico limpio y descarte indicado por el manual.', evidence: ['Mapa de recipientes', 'Reacción balanceada', 'Unidades en cada paso', 'Promedio, dispersión y decisión'] },
    { id: 'lab-ana-2', subject: 'analitica', title: 'Curva de titulación y punto final', status: 'provisional', objective: 'Distinguir equivalencia química de la señal experimental.', calculation: 'Moles antes/durante/después de equivalencia y concentración de la muestra original.', safety: 'Indicador, titulante y muestra según SDS.', evidence: ['Tabla de volúmenes', 'Curva con ejes/unidades', 'Criterio del punto final', 'Sesgo probable y dirección'] },
    { id: 'lab-fq-1', subject: 'fisico', title: 'Equilibrio y electroquímica', status: 'provisional', objective: 'Conectar medición macroscópica con Q, K, actividad o potencial.', calculation: 'Convención de reacción, n, Q, unidades, propagación simple y predicción de signo.', safety: 'Electrodos, soluciones y residuos según manual vigente.', evidence: ['Sistema y variables', 'Modelo con supuestos', 'Gráfico o celda rotulada', 'Interpretación física del resultado'] },
    { id: 'lab-fq-2', subject: 'fisico', title: 'Cinética y ajuste', status: 'provisional', objective: 'Obtener una velocidad u orden desde datos sin forzar una recta.', calculation: 'Conversión de tiempo, velocidad, regresión, unidades de k y comparación de ajustes.', safety: 'Temperatura, reactivos y disposición definidos por el protocolo actual.', evidence: ['Datos crudos', 'Transformación declarada', 'Gráfico con residuales o R²', 'Limitación experimental'] },
    { id: 'lab-fis-1', subject: 'fisio', title: 'Caso fisiopatológico guiado', status: 'provisional', objective: 'Reconstruir variable normal, lesión, compensación, manifestación y blanco farmacológico.', calculation: 'Cuando corresponda: presión, ventilación, filtración o concentración con unidad clínica.', safety: 'Material educativo; no convertir el caso en diagnóstico personal.', evidence: ['Cadena causal', 'Dato que apoya cada eslabón', 'Diferencial cercano', 'Fármaco: blanco → variable → efecto'] },
    { id: 'lab-fis-2', subject: 'fisio', title: 'Registro de señales y discusión', status: 'provisional', objective: 'Separar dato observado, mecanismo inferido y conclusión.', calculation: 'Promedio, cambio relativo y rango de referencia sólo si la guía lo entrega.', safety: 'Privacidad de datos y límites de interpretación.', evidence: ['Tabla original', 'Gráfico legible', 'Mecanismo esperado', 'Alternativas y limitaciones'] }
  ];

  // Los ejercicios se están rehaciendo junto con las clases: la biblioteca queda vacía a propósito.
  const EXERCISES = [];

  function renderPractice(tab = 'exercises', detailId = '') {
    const tabs = [
      ['exercises', 'Ejercicios'], ['guides', 'Guías'], ['errors', 'Errores'], ['exams', 'Pruebas antiguas'], ['labs', 'Laboratorio']
    ].filter(([id]) => !(id === 'exams' && window.NEXO_PUBLIC_CONFIG?.beta)); // la beta no lleva pautas ni pruebas de profes
    const validTab = tabs.some(([id]) => id === tab) ? tab : 'exercises';
    app.innerHTML = `<section class="page practice-page">${pageHeader('CENTRO DE ESTUDIO', 'Practicar con una razón', 'Ejercicios progresivos, guías reconstruibles, errores reintentables y pruebas reales sin fingir que lo histórico es el calendario actual.')}
      <nav class="tabs" role="tablist" aria-label="Secciones de estudio">${tabs.map(([id, label]) => `<button role="tab" aria-selected="${validTab === id}" class="${validTab === id ? 'active' : ''}" data-practice-tab="${id}">${label}${id === 'errors' && state.errors.filter(e => e.status !== 'resolved').length ? `<span>${state.errors.filter(e => e.status !== 'resolved').length}</span>` : ''}</button>`).join('')}</nav>
      <div class="tab-panel" role="tabpanel">${validTab === 'exercises' ? renderExercises(detailId) : validTab === 'guides' ? renderGuides(detailId) : validTab === 'errors' ? renderErrors(detailId) : validTab === 'exams' ? renderExams(detailId) : renderLabs(detailId)}</div>
    </section>`;
  }

  function practiceFilters({ level = true } = {}) {
    return `<div class="filter-bar"><label><span>Ramo</span><select data-ui-filter="practiceSubject"><option value="all">Todos</option>${SUBJECTS.map(s => `<option value="${s.id}" ${ui.practiceSubject === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select></label>${level ? `<label><span>Nivel</span><select data-ui-filter="practiceLevel"><option value="all">Todos</option>${[['basic', 'Básico'], ['intermediate', 'Intermedio'], ['pep', 'Nivel PEP']].map(([id, name]) => `<option value="${id}" ${ui.practiceLevel === id ? 'selected' : ''}>${name}</option>`).join('')}</select></label>` : ''}</div>`;
  }

  function renderExercises() {
    return `<section class="empty-state" aria-labelledby="exercisesSoon"><span class="empty-state-mark" aria-hidden="true">✧</span><p class="eyebrow">EJERCICIOS</p><h2 id="exercisesSoon">Disponible próximamente</h2><p>Estamos escribiendo ejercicios nuevos junto con cada clase, para que midan si aprendiste de verdad. Mientras tanto puedes revisar tus guías y errores${window.NEXO_PUBLIC_CONFIG?.beta ? '' : ' y pruebas antiguas'}.</p><div class="button-row"><button class="primary-btn" data-practice-tab="guides">Ver guías</button>${window.NEXO_PUBLIC_CONFIG?.beta ? '' : '<button class="secondary-btn" data-practice-tab="exams">Pruebas antiguas</button>'}</div></section>`;
  }

  function exerciseCard(item) {
    const progress = state.practice[item.id] || {}, lesson = LESSONS[item.lessonId];
    return `<button class="exercise-card" data-open-exercise="${item.id}"><div><span class="level-tag ${item.level}">${item.level === 'basic' ? 'BÁSICO' : item.level === 'intermediate' ? 'INTERMEDIO' : 'NIVEL PEP'}</span>${progress.correct ? '<span class="done-mark">✓</span>' : ''}</div><h3>${esc(item.title)}</h3><p>${esc(item.prompt)}</p><footer><span>${item.format === 'text' ? 'Respuesta razonada' : 'Selección + explicación'}</span><b>${lesson ? lesson.title : 'Práctica transversal'} →</b></footer></button>`;
  }

  function exerciseRunner(item) {
    const subject = subjectFor(item.subject), progress = state.practice[item.id] || {}, answer = progress.draft || '';
    return `<section class="exercise-runner" style="--course:${subject.color}"><button class="back-btn" data-practice-tab="exercises">← Biblioteca de ejercicios</button><div class="runner-head"><div><span class="level-tag ${item.level}">${item.level === 'basic' ? 'BÁSICO' : item.level === 'intermediate' ? 'INTERMEDIO' : 'NIVEL PEP'}</span><h2>${esc(item.title)}</h2><p>${esc(item.prompt)}</p></div><div class="attempt-badge"><b>${progress.attempts || 0}</b><span>intentos</span></div></div>${item.format === 'text' ? `<form data-exercise-text="${item.id}"><label class="field"><span>Tu reconstrucción</span><textarea data-exercise-draft="${item.id}" placeholder="Identifico… aplico… por eso… compruebo…">${esc(answer)}</textarea></label><div class="button-row"><button type="button" class="secondary-btn" data-action="exercise-hint" data-exercise-id="${item.id}">${progress.hintOpen ? 'Ocultar pista' : 'Necesito una pista'}</button><button class="primary-btn" type="submit" ${answer.trim().length < 60 ? 'disabled' : ''}>Revisar razonamiento</button></div>${progress.hintOpen ? `<div class="hint-box"><b>Pista</b><p>${esc(item.hint)}</p></div>` : ''}${exerciseFeedback(progress, item)}</form>` : `<form data-exercise-choice="${item.id}"><fieldset class="choices-field"><legend class="sr-only">Alternativas</legend>${item.choices.map((choice, index) => `<label class="choice ${progress.checked ? (index === item.answer ? 'correct' : Number(progress.selected) === index ? 'wrong' : '') : ''}"><input type="radio" name="answer" value="${index}" ${Number(progress.selected) === index ? 'checked' : ''} ${progress.checked ? 'disabled' : ''}><span>${String.fromCharCode(65 + index)}</span><b>${esc(choice)}</b></label>`).join('')}</fieldset><label class="field"><span>Justificación breve</span><textarea data-exercise-draft="${item.id}" placeholder="La elegiría porque…">${esc(answer)}</textarea></label><div class="button-row"><button type="button" class="secondary-btn" data-action="exercise-hint" data-exercise-id="${item.id}">${progress.hintOpen ? 'Ocultar pista' : 'Necesito una pista'}</button><button class="primary-btn" type="submit" ${progress.selected === undefined || answer.trim().length < 25 ? 'disabled' : ''}>Comprobar</button></div>${progress.hintOpen ? `<div class="hint-box"><b>Pista</b><p>${esc(item.hint || item.lookFor)}</p></div>` : ''}${exerciseFeedback(progress, item)}${progress.checked && !progress.correct ? `<button type="button" class="text-btn" data-action="exercise-retry" data-exercise-id="${item.id}">Intentar variante otra vez</button>` : ''}</form>`}<aside class="notice"><b>Después de responder</b><span>No copies la explicación completa. Registra el primer eslabón que falló y resuelve una variante comparable.</span></aside></section>`;
  }

  function exerciseFeedback(progress, item) {
    if (!progress.checked) return '';
    return `<div class="feedback ${progress.correct ? 'correct' : 'wrong'}"><b>${progress.correct ? (progress.firstCorrect ? 'Correcto al primer intento' : 'Corregiste el patrón') : 'Todavía no es consistente'}</b><p>${esc(progress.correct ? item.why : item.lookFor)}</p>${progress.textScore !== undefined ? `<small>Coincidencia causal local: ${progress.textScore}/100. Es una pauta de apoyo, no una corrección humana.</small>` : ''}</div>`;
  }

  function renderGuides(detailId) {
    const guide = DATA.guides.find(item => item.id === detailId);
    if (guide) {
      const progress = state.guides[guide.id] || {};
      return `<section class="guide-view"><button class="back-btn" data-practice-tab="guides">← Guías</button>${stageIntro(guide.pep, esc(guide.title), esc(guide.question))}<div class="guide-map">${guide.route.map((item, index) => `<span><b>${index + 1}</b>${esc(item)}</span>`).join('<i>→</i>')}</div><div class="guide-columns"><section><h3>Dibujo de una página</h3><p>${esc(guide.draw)}</p><h3>Control antes de cerrar</h3><ul>${guide.check.map(item => `<li>${esc(item)}</li>`).join('')}</ul></section><section><h3>Cómo aparece en prueba</h3><p>${esc(guide.exam)}</p><label class="field"><span>Reconstrucción propia</span><textarea data-guide-draft="${guide.id}" placeholder="Sin mirar la ruta, reconstruyo…">${esc(progress.draft || '')}</textarea></label><button class="primary-btn" data-action="guide-complete" data-guide-id="${guide.id}" ${(progress.draft || '').trim().length >= 100 ? '' : 'disabled'}>${progress.completed ? 'Actualizar evidencia' : 'Guardar reconstrucción'}</button></section></div></section>`;
    }
    const filtered = DATA.guides.filter(item => ui.practiceSubject === 'all' || item.subject === ui.practiceSubject);
    return `<section>${practiceFilters({ level: false })}<div class="guide-grid">${filtered.map(item => { const p = state.guides[item.id]; return `<button class="guide-card" data-open-guide="${item.id}"><span>${esc(item.pep)}</span><h2>${esc(item.title)}</h2><p>${esc(item.question)}</p><div>${item.route.map(step => `<small>${esc(step)}</small>`).join('')}</div><footer>${p?.completed ? '✓ Reconstruida' : 'Abrir guía →'}</footer></button>`; }).join('')}</div></section>`;
  }

  function diagnoseError(input) {
    const rules = {
      first_step: 'El bloqueo está antes del procedimiento. Vuelve a nombrar el sistema, el dato inicial y la primera transformación permitida.',
      formula: 'La fórmula está sustituyendo al modelo. Escribe primero qué magnitudes se relacionan, qué se conserva y qué unidades debe tener el resultado.',
      interpretation: 'El cálculo puede estar bien, pero falta cerrar la cadena. Predice signo/tendencia y escribe qué significa el valor en el sistema.',
      concept: 'Hay una etiqueta sin criterio observable. Compara el concepto con su vecino usando una diferencia causal, no una definición aislada.',
      attention: 'Parece un error de control. Añade una pausa obligatoria para revisar carga/átomos, recipiente/unidad, signo/límite o causa/manifestación.'
    };
    const subjectRules = {
      organica: 'Marca fuente electrónica, destino, enlace que se rompe y cargas después de cada flecha.',
      analitica: 'Dibuja muestra → matraz → alícuota → medición y coloca volúmenes/unidades sobre las flechas.',
      fisico: 'Declara sistema, supuestos, ecuación simbólica, unidades y predicción de signo antes de sustituir.',
      fisio: 'Reconstruye variable normal → alteración → compensación → manifestación; agrega el fármaco al final.'
    };
    return `${rules[input.blocker] || rules.concept} ${subjectRules[input.subject] || ''}`;
  }

  function renderErrors(detailId) {
    const edit = state.errors.find(error => error.id === detailId);
    const openErrors = state.errors.filter(error => error.status !== 'resolved').length;
    const filtered = state.errors.filter(error => {
      const search = ui.errorSearch.toLowerCase();
      return (ui.practiceSubject === 'all' || error.subject === ui.practiceSubject) && (!search || `${error.observable} ${error.reasoning} ${error.diagnosis} ${LESSONS[error.lessonId]?.title || ''}`.toLowerCase().includes(search));
    });
    return `<section class="errors-view"><div class="errors-top"><div><h2>Bitácora de errores</h2><p>${openErrors} activos. El objetivo no es coleccionarlos: cada uno debe terminar en una regla y una variante.</p></div><button class="primary-btn" data-action="new-error">Anotar error</button></div>
      ${edit || detailId === 'new' ? errorForm(edit) : ''}
      <div class="filter-bar"><label><span>Ramo</span><select data-ui-filter="practiceSubject"><option value="all">Todos</option>${SUBJECTS.map(s => `<option value="${s.id}" ${ui.practiceSubject === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select></label><label class="grow"><span>Buscar</span><input type="search" data-error-search value="${esc(ui.errorSearch)}" placeholder="Tema, razonamiento o regla"></label></div>
      ${filtered.length ? `<div class="error-list">${filtered.map(errorCard).join('')}</div>` : emptyState('No hay errores con este filtro', 'Cuando te equivoques, registra el primer paso que no pudiste justificar.', `<button class="primary-btn" data-action="new-error">Anotar el primero</button>`)}</section>`;
  }

  function errorForm(error = null) {
    const current = error || { subject: ui.practiceSubject === 'all' ? 'organica' : ui.practiceSubject, blocker: 'first_step', status: 'open' };
    return `<form class="panel error-form" data-error-form="${error?.id || ''}"><div class="section-head"><div><p class="eyebrow">${error ? 'EDITAR' : 'NUEVO ERROR'}</p><h3>Localiza el primer eslabón</h3></div><button type="button" class="text-btn" data-practice-tab="errors">Cerrar</button></div><div class="form-grid"><label class="field"><span>Ramo</span><select name="subject">${SUBJECTS.map(s => `<option value="${s.id}" ${current.subject === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select></label><label class="field"><span>Tipo de bloqueo</span><select name="blocker">${[['first_step', 'No vi el primer paso'], ['formula', 'Busqué fórmula sin modelo'], ['interpretation', 'Calculé pero no interpreté'], ['concept', 'Confundí conceptos cercanos'], ['attention', 'Error de control/atención']].map(([id, label]) => `<option value="${id}" ${current.blocker === id ? 'selected' : ''}>${label}</option>`).join('')}</select></label></div><label class="field"><span>¿Qué hiciste o respondiste?</span><textarea name="observable" required>${esc(current.observable || '')}</textarea></label><label class="field"><span>¿Qué estabas pensando?</span><textarea name="reasoning" required>${esc(current.reasoning || '')}</textarea></label><button class="primary-btn" type="submit">${error ? 'Actualizar y rediagnosticar' : 'Guardar y diagnosticar'}</button><p class="microcopy">La revisión es una hipótesis local basada en lo que escribiste; no pretende adivinar una causa invisible.</p></form>`;
  }

  function errorCard(error) {
    const subject = subjectFor(error.subject), lesson = LESSONS[error.lessonId];
    return `<article class="error-card ${error.status}"><header><span style="--course:${subject.color}">${subject.short}</span><div><b>${lesson ? esc(lesson.title) : 'Error transversal'}</b><small>${formatDate(error.date)} · ${error.status === 'resolved' ? 'cerrado' : error.status === 'review' ? 'en revisión' : 'abierto'}</small></div></header><p><strong>Observable:</strong> ${esc(error.observable)}</p>${error.reasoning ? `<p><strong>Razonamiento:</strong> ${esc(error.reasoning)}</p>` : ''}<div class="diagnosis"><b>Hipótesis local</b><p>${esc(error.diagnosis)}</p></div><footer><button class="text-btn" data-edit-error="${error.id}">Editar</button>${lesson ? `<button class="secondary-btn" data-open-lesson="${lesson ? error.lessonId : ''}" data-mode="mastery">Probar variante</button>` : ''}<button class="secondary-btn" data-action="toggle-error-status" data-error-id="${error.id}">${error.status === 'resolved' ? 'Reabrir' : 'Marcar revisado'}</button><button class="text-btn danger" data-delete-error="${error.id}">Eliminar</button></footer></article>`;
  }

  function renderExams(detailId) {
    const exam = DATA.exams.find(item => item.id === detailId);
    if (exam) return examViewer(exam);
    const filtered = DATA.exams.filter(item => ui.examSubject === 'all' || item.subject === ui.examSubject);
    return `<section><div class="filter-bar"><label><span>Ramo</span><select data-ui-filter="examSubject"><option value="all">Todos</option>${SUBJECTS.map(s => `<option value="${s.id}" ${ui.examSubject === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select></label></div><aside class="notice warning"><b>Jerarquía de fuentes</b><span>2025–enero 2026 define mejor la forma de preguntar. Las pruebas históricas sirven para practicar patrones, no para asegurar el temario ni las fechas actuales.</span></aside><div class="exam-grid">${filtered.map(item => { const p = state.exams[item.id] || {}; return `<button class="exam-card" data-open-exam="${item.id}"><div><span>${esc(item.year)}</span><b>${p.status === 'finished' ? '✓ Intentada' : p.startedAt ? 'En curso' : 'Sin intentar'}</b></div><h2>${esc(item.title)}</h2><p>${esc(item.focus)}</p><footer>${item.kind === 'pdf' ? 'PDF' : 'Fotografía'} · abrir práctica →</footer></button>`; }).join('')}</div></section>`;
  }

  function examViewer(exam) {
    const p = state.exams[exam.id] || {}, running = Boolean(p.startedAt && p.status !== 'finished');
    return `<section class="exam-view"><button class="back-btn" data-practice-tab="exams">← Pruebas antiguas</button>${stageIntro(exam.year, esc(exam.title), esc(exam.focus))}<div class="exam-workspace"><section class="panel"><h3>Modo simulacro</h3><p>Empieza el intento sin abrir el documento corregido o la pauta. Registra después el tiempo, los errores y qué clase necesitas.</p><div class="button-row">${!p.startedAt ? `<button class="primary-btn" data-action="exam-start" data-exam-id="${exam.id}">Iniciar intento</button>` : running ? `<button class="primary-btn" data-action="exam-finish" data-exam-id="${exam.id}">Finalizar intento · ${formatClock(Date.now() - new Date(p.startedAt).getTime())}</button>` : `<button class="secondary-btn" data-action="exam-restart" data-exam-id="${exam.id}">Nuevo intento</button>`}<button class="secondary-btn" data-action="exam-toggle-document" data-exam-id="${exam.id}">${p.documentOpen ? 'Ocultar documento' : 'Mostrar documento'}</button></div><label class="field"><span>Notas del intento</span><textarea data-exam-notes="${exam.id}" placeholder="Qué pude resolver, dónde me trabé, error que se repitió…">${esc(p.notes || '')}</textarea></label></section><section class="exam-document ${p.documentOpen ? 'open' : ''}">${p.documentOpen ? (exam.kind === 'pdf' ? `<object data="./assets/exams/${exam.file}" type="application/pdf"><p>No se pudo incrustar el PDF. <a href="./assets/exams/${exam.file}" target="_blank" rel="noopener">Abrir archivo</a></p></object>` : `<img src="./assets/exams/${exam.file}" alt="${esc(exam.title)}" loading="lazy" decoding="async" onerror="this.closest('.exam-document').classList.add('asset-error')"><p class="asset-fallback">No se pudo cargar la imagen. Revisa el archivo desde Ajustes o vuelve a intentar.</p>`) : emptyState('Documento oculto', 'Así puedes preparar el espacio y el tiempo antes de exponerte a la pauta.')}</section></div></section>`;
  }

  function renderLabs(detailId) {
    const lab = LABS.find(item => item.id === detailId);
    if (lab) {
      const p = state.labs[lab.id] || { checks: [] };
      return `<section class="lab-view"><button class="back-btn" data-practice-tab="labs">← Laboratorios</button>${stageIntro('PRELAB · ESTRUCTURA PROVISIONAL', esc(lab.title), esc(lab.objective))}<aside class="notice warning"><b>Pendiente del manual actual</b><span>No reemplaza concentraciones, cantidades, riesgos ni protocolo del semestre. Úsalo para ordenar el razonamiento y completa esos datos cuando recibas la guía vigente.</span></aside><div class="lab-grid"><section class="panel"><h3>Cálculo previo</h3><p>${esc(lab.calculation)}</p><h3>Seguridad</h3><p>${esc(lab.safety)}</p><label class="field"><span>Cálculos / supuestos</span><textarea data-lab-draft="${lab.id}" data-lab-field="calculations">${esc(p.calculations || '')}</textarea></label></section><section class="panel"><h3>Evidencias que debes salir teniendo</h3><div class="checklist">${lab.evidence.map((item, index) => `<label><input type="checkbox" data-lab-check="${lab.id}" value="${index}" ${p.checks?.includes(index) ? 'checked' : ''}><span>${esc(item)}</span></label>`).join('')}</div><label class="field"><span>Datos crudos / observaciones</span><textarea data-lab-draft="${lab.id}" data-lab-field="observations">${esc(p.observations || '')}</textarea></label></section></div></section>`;
    }
    const filtered = LABS.filter(item => ui.practiceSubject === 'all' || item.subject === ui.practiceSubject);
    return `<section>${practiceFilters({ level: false })}<div class="lab-library">${filtered.map(item => { const p = state.labs[item.id] || {}; const done = (p.checks || []).length; return `<button class="lab-card" data-open-lab="${item.id}"><span>${subjectFor(item.subject).short}</span><h2>${esc(item.title)}</h2><p>${esc(item.objective)}</p>${progressBar(done / item.evidence.length * 100, `${done}/${item.evidence.length} evidencias`)}<footer>Manual actual pendiente · abrir →</footer></button>`; }).join('')}</div></section>`;
  }

  function gradeConfig(subjectId) {
    const fallback = defaultGrades()[subjectId];
    const current = state.grades[subjectId];
    if (!current || !Array.isArray(current.components)) state.grades[subjectId] = fallback;
    else {
      current.groups = Object.fromEntries(Object.entries(fallback.groups).map(([id,group])=>[id,{...group,...(current.groups?.[id]||{})}]));
      current.target = clamp(Number(current.target) || 4, 4, 7);
      current.rounding = '2';
    }
    return state.grades[subjectId];
  }

  function calculateGrade(config) {
    return window.NexoGrades.calculate(config,ui.gradeGroup);
  }

  function renderPlanner(tab = 'calendar', embedded = false) {
    const valid = tab === 'calendar' ? 'calendar' : 'grades';
    app.innerHTML = `<section class="page planner-page planner-v10 storybook-v10">
      ${embedded ? '' : `<nav class="tabs planner-tabs-v10" role="tablist" aria-label="Bitácora académica"><button role="tab" aria-selected="${valid === 'calendar'}" class="${valid === 'calendar' ? 'active' : ''}" data-planner-tab="calendar">▦ Calendario</button><button role="tab" aria-selected="${valid === 'grades'}" class="${valid === 'grades' ? 'active' : ''}" data-planner-tab="grades">⚖ Ponderaciones</button></nav>`}
      <div class="tab-panel" role="tabpanel">${valid === 'grades' ? renderGrades() : renderCalendarInteractive()}</div>
    </section>`;
  }

  function renderHub(tab = 'timer') {
    const active = ['timer', 'calendar', 'grades'].includes(tab) ? tab : 'timer';
    if (active === 'timer') renderHome();
    else renderPlanner(active, true);
    const page = app.querySelector('.page');
    page.classList.add('rpg-inner');
    page.insertAdjacentHTML('afterbegin', `<nav class="rpg-tabs" role="tablist" aria-label="Reloj, calendario y ponderaciones">
      ${[['timer','Reloj'],['calendar','Calendario'],['grades','Ponderaciones']].map(([id,label]) => `<button role="tab" aria-selected="${active === id}" class="${active === id ? 'active' : ''}" data-hub-tab="${id}">${label}</button>`).join('')}
    </nav>`);
  }

  // Perfil = carta de jugador (perfil/carta.js). Sin sección = la carta y 3 botones; con sección, madera + pergamino con "← Mi carta".
  function profileCardData() {
    const pet = state.mascot, totalSec = state.sessions.reduce((sum, item) => sum + sessionSeconds(item), 0), run = streak();
    const engine = window.NexoAcademicEngine, ranks = window.NexoArcaneRanks;
    let level = 0;
    try { if (engine && ranks) level = Math.max(0, ...engine.model.concepts.map(c => ranks.forState(state, c.id, engine.model).level)); } catch (_) { level = 0; }
    return {
      name: pet.name && pet.name !== 'Nexo' ? pet.name : (window.NexoPet?.names?.[pet.kind] || 'Nexo'),
      rank: { level, name: ranks?.ranks[level]?.name || 'Sin rango' }, streak: run, minutes: Math.round(totalSec / 60),
      badges: [run >= 3, run >= 7, totalSec >= 36000, Object.values(state.mastery).some(m => m?.status === 'dominado'),
        state.claimedChallenges.length > 0, Object.values(pet.outfit || {}).some(Boolean)]
    };
  }
  function renderProfile(tab = '') {
    const active = ['mascot', 'grades', 'absences', 'stats', 'settings'].includes(tab) ? tab : '';
    if (!active) { petBind(); return window.NexoCarta.render(app, profileCardData()); }
    if (active === 'stats') renderStats();
    else if (active === 'grades') renderProfileGrades();
    else if (active === 'absences') renderProfileAbsences();
    else if (active === 'settings') renderSettings();
    else renderMascot();
    const page = app.querySelector('.page');
    page.classList.add('rpg-inner', 'profile-page');
    window.NexoCarta.wrapSection(page, active);
  }

  function renderProfileGrades() {
    const subject = subjectFor(ui.profileSubject);
    const rows = gradeConfig(subject.id).components.filter(item => item.group === ui.profileGroup);
    app.innerHTML = `<section class="page profile-record-page" style="--course:${subject.color}">
      <h1>Notas</h1>
      ${profileSubjectTabs(subject.id, 'profile-grade-subject')}
      <section class="panel profile-record-panel">
        <div class="profile-record-head"><h2>${esc(subject.name)}</h2><button class="secondary-btn" data-profile-add-grade>+ Añadir</button></div>
        <nav class="profile-group-tabs" role="tablist" aria-label="Teoría o laboratorio"><button role="tab" aria-selected="${ui.profileGroup === 'theory'}" class="${ui.profileGroup === 'theory' ? 'active' : ''}" data-profile-grade-group="theory">Teoría</button><button role="tab" aria-selected="${ui.profileGroup === 'lab'}" class="${ui.profileGroup === 'lab' ? 'active' : ''}" data-profile-grade-group="lab">Laboratorio</button></nav>
        <div class="profile-grade-head"><span>Evaluación</span><span>Nota</span><span></span></div>
        <div class="profile-grade-list">${rows.length ? rows.map(item => {
          const value = item.grade === '' ? '' : Number(String(item.grade).replace(',', '.'));
          return `<div class="profile-grade-row"><input aria-label="Evaluación" maxlength="80" data-profile-grade-id="${esc(item.id)}" data-profile-grade-field="name" value="${esc(item.name)}"><input aria-label="Nota de ${esc(item.name)}" type="text" inputmode="decimal" placeholder="—" data-profile-grade-id="${esc(item.id)}" data-profile-grade-field="grade" value="${Number.isFinite(value) ? value.toFixed(2) : ''}"><button class="icon-btn danger" data-profile-delete-grade="${esc(item.id)}" aria-label="Eliminar ${esc(item.name)}">×</button></div>`;
        }).join('') : '<p class="profile-record-empty">Sin notas.</p>'}</div>
      </section>
    </section>`;
  }

  function renderProfileAbsences() {
    const subject = subjectFor(ui.absenceSubject);
    const rows = state.absences.filter(item => item.subject === subject.id).sort((a, b) => b.date.localeCompare(a.date));
    app.innerHTML = `<section class="page profile-record-page" style="--course:${subject.color}">
      <h1>Inasistencias</h1>
      ${profileSubjectTabs(subject.id, 'absence-subject', id => state.absences.filter(item => item.subject === id).length)}
      <section class="panel profile-record-panel">
        <div class="profile-record-head"><h2>${esc(subject.name)}</h2><span class="profile-absence-total">${rows.length}</span></div>
        <form class="profile-absence-form" data-absence-form>
          <label><span>Fecha</span><input type="date" name="date" value="${todayKey()}" required></label>
          <label><span>Clase</span><select name="group"><option value="theory">Teoría</option><option value="lab">Laboratorio</option></select></label>
          <button class="primary-btn" type="submit">+ Añadir</button>
        </form>
        <div class="profile-absence-list">${rows.length ? rows.map(item => `<div class="profile-absence-row"><time datetime="${esc(item.date)}">${formatDate(item.date)}</time><span>${item.group === 'lab' ? 'Laboratorio' : 'Teoría'}</span><button class="icon-btn danger" data-delete-absence="${esc(item.id)}" aria-label="Eliminar inasistencia del ${formatDate(item.date)}">×</button></div>`).join('') : '<p class="profile-record-empty">Sin inasistencias.</p>'}</div>
      </section>
    </section>`;
  }

  function renderGrades() {
    const subject = subjectFor(ui.gradeSubject), config = gradeConfig(subject.id), result = calculateGrade(config);
    const visible = config.components.filter(item => item.group === ui.gradeGroup);
    const groupName = ui.gradeGroup === 'lab' ? 'Laboratorio' : 'Teoría';
    return `<section class="grades-view" style="--course:${subject.color}"><div class="subject-tabs" role="tablist" aria-label="Ramo para calcular">${SUBJECTS.map(s => `<button role="tab" aria-selected="${s.id === subject.id}" class="${s.id === subject.id ? 'active' : ''}" data-grade-subject="${s.id}">${s.short}</button>`).join('')}</div>
      <div class="component-tabs-v10" role="tablist" aria-label="Componente del ramo"><button role="tab" aria-selected="${ui.gradeGroup === 'theory'}" class="${ui.gradeGroup === 'theory' ? 'active' : ''}" data-grade-group-tab="theory">▤ Teoría</button><button role="tab" aria-selected="${ui.gradeGroup === 'lab'}" class="${ui.gradeGroup === 'lab' ? 'active' : ''}" data-grade-group-tab="lab">⚗ Laboratorio</button></div>
      <div class="grade-layout"><section class="panel grade-workspace-v10"><div class="section-head"><div><p class="eyebrow">${subject.name} · ${groupName}</p><h2>Distribución de la nota</h2></div><button class="secondary-btn" data-action="add-grade-row">+ Añadir evaluación</button></div>
        <div class="grade-settings"><label class="field"><span>Nota de aprobación</span><input type="number" min="4" max="7" step="0.01" data-grade-config="target" value="${Number(config.target).toFixed(2)}"></label><label class="field"><span>Aporte de ${groupName.toLowerCase()} al ramo (%)</span><input type="number" min="0" max="100" step="0.01" data-grade-course-weight="${ui.gradeGroup}" value="${config.groups[ui.gradeGroup].courseWeight ?? ''}" placeholder="Sin dato"></label></div>
        <div class="group-minima"><label class="field"><span>Mínimo Teoría (si existe)</span><input type="number" min="1" max="7" step="0.1" data-grade-group="theory" value="${esc(config.groups.theory.minimum)}" placeholder="Sin mínimo"></label><label class="field"><span>Mínimo Laboratorio (si existe)</span><input type="number" min="1" max="7" step="0.1" data-grade-group="lab" value="${esc(config.groups.lab.minimum)}" placeholder="Sin mínimo"></label></div>
        <div class="grade-table"><div class="grade-row grade-row-v10 head"><span>Evaluación</span><span>%</span><span>Nota</span><span>Fecha</span><span></span></div>${visible.map(item => `<div class="grade-row grade-row-v10"><input aria-label="Nombre de evaluación" data-grade-row="${item.id}" data-grade-field="name" value="${esc(item.name)}"><input aria-label="Ponderación" type="number" min="0" max="100" step="0.01" data-grade-row="${item.id}" data-grade-field="weight" value="${item.weight === '' ? '' : Number(item.weight).toFixed(2)}" placeholder="0.00"><input aria-label="Nota" type="number" min="1" max="7" step="0.01" data-grade-row="${item.id}" data-grade-field="grade" value="${item.grade === '' ? '' : Number(item.grade).toFixed(2)}" placeholder="—"><input aria-label="Fecha" type="date" data-grade-row="${item.id}" data-grade-field="date" value="${esc(item.date || '')}"><button class="icon-btn danger" data-delete-grade="${item.id}" aria-label="Eliminar ${esc(item.name)}">×</button></div>`).join('')}</div>
      </section><aside class="panel grade-result"><p class="eyebrow">RESULTADO</p>${gradeResultMarkup(result, config)}${pepExamWarning(config)}</aside></div></section>`;
  }

  function pepExamWarning(config) {
    const red = config.components.filter(item => /^PEP\s*\d/i.test(item.name) && item.grade !== '' && Number(String(item.grade).replace(',', '.')) < 4);
    return red.length ? `<div class="feedback wrong"><b>Corresponde examen</b><p>${red.map(item => esc(item.name)).join(', ')} bajo 4.00. Aunque el promedio ponderado alcance 4.00, aplica la condición de PEP roja reportada para este semestre.</p></div>` : '';
  }
  function gradeResultMarkup(result, config) {
    const decimals = 2;
    if (!result.components.filter(item=>item.group===ui.gradeGroup).length) return emptyState('Faltan ponderaciones', 'Escribe al menos un porcentaje para este componente.');
    const weightClass = Math.abs(result.totalWeight - 100) < .01 ? 'ok' : 'warn';
    const requiredText = Math.abs(result.totalWeight-100)>.01 ? 'Completa la ponderación de este componente' : result.required === null ? (result.projected !== null ? `Resultado de ${ui.gradeGroup==='lab'?'laboratorio':'teoría'}: ${result.projected.toFixed(decimals)}` : 'Faltan notas') : result.required > 7 ? `No alcanza: requerirías ${result.required.toFixed(decimals)}` : result.required < 1 ? `Ya superas el objetivo; mínimo reglamentario ${Math.max(1, result.required).toFixed(decimals)}` : `Necesitas promedio ${result.required.toFixed(decimals)} en el ${result.pendingWeight.toFixed(2)}% pendiente`;
    return `<div class="grade-big"><span class="${weightClass}">Ponderación de ${ui.gradeGroup==='lab'?'laboratorio':'teoría'}: ${result.totalWeight.toFixed(2)}%</span><strong>${requiredText}</strong><small>${result.current === null ? 'Sin promedio actual' : `Promedio de evaluaciones con nota: ${result.current.toFixed(decimals)}`}</small></div><div class="group-results">${result.groupResults.map(group => `<div><span>${esc(group.name)}${group.courseWeight===null?'':` · ${group.courseWeight.toFixed(2)}% del ramo`}</span><b>${group.grade===null?(group.current===null?'Sin notas':`${group.current.toFixed(decimals)} parcial`):group.grade.toFixed(decimals)}</b><small>${group.minimum ? (group.grade === null ? `mínimo ${Number(group.minimum).toFixed(2)}` : group.grade >= group.minimum ? `cumple mínimo ${Number(group.minimum).toFixed(2)}` : `no cumple mínimo ${Number(group.minimum).toFixed(2)}`) : 'sin mínimo separado'}</small></div>`).join('')}</div>${result.courseGrade===null?'':`<div class="grade-course-final"><span>Nota del ramo</span><strong>${result.courseGrade.toFixed(decimals)}</strong></div>`}${result.groupResults.some(group=>group.invalidCourseWeight)?`<div class="feedback wrong"><b>Revisa el aporte al ramo</b><p>Debe estar entre 0.00% y 100.00%.</p></div>`:''}${result.groupResults.every(group=>group.courseWeight!==null)&&Math.abs(result.courseWeightTotal-100)>.01?`<div class="feedback wrong"><b>Teoría y laboratorio deben sumar 100%</b><p>Ahora suman ${result.courseWeightTotal.toFixed(2)}%.</p></div>`:''}${result.invalidGrades?.length ? `<div class="feedback wrong"><b>Revisa estas notas</b><p>${result.invalidGrades.map(esc).join(', ')}: deben estar entre 1.00 y 7.00.</p></div>` : ''}${result.invalidWeights?.length ? `<div class="feedback wrong"><b>Revisa estas ponderaciones</b><p>${result.invalidWeights.map(esc).join(', ')}: deben estar entre 0.00% y 100.00%.</p></div>` : ''}${Math.abs(result.totalWeight - 100) > .01 ? `<div class="feedback wrong"><b>La ponderación de ${ui.gradeGroup==='lab'?'laboratorio':'teoría'} no suma 100%</b><p>Ahora suma ${result.totalWeight.toFixed(2)}%.</p></div>` : ''}`;
  }
  function refreshGradeResult() {
    const container = document.querySelector('.grade-result');
    if (!container || !ui.gradeSubject) return;
    const config = gradeConfig(ui.gradeSubject);
    container.innerHTML = `<p class="eyebrow">RESULTADO</p>${gradeResultMarkup(calculateGrade(config), config)}${pepExamWarning(config)}`;
  }
  function syncGradeEvent(item, subjectId) {
    const existing = state.events.find(event => event.sourceId === item.id || event.id === item.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(item.date || ''))) {
      state.events = state.events.filter(event => event.sourceId !== item.id && event.id !== item.id);
      return;
    }
    const payload = {
      sourceId: item.id,
      title: item.name || 'Evaluación',
      subject: subjectId,
      type: item.group === 'lab' ? 'lab' : 'exam',
      date: item.date,
      time: existing?.time || '',
      source: existing?.source || 'ponderaciones'
    };
    if (existing) Object.assign(existing, payload);
    else state.events.push({ id: uid('event'), ...payload });
  }

  function upcomingEvents() {
    return state.events.slice().sort((a, b) => `${a.date}${a.time || ''}`.localeCompare(`${b.date}${b.time || ''}`)).filter(event => event.status !== 'done' && daysBetween(todayKey(), event.date) >= -7);
  }
  function conflictsFor(event) { return state.events.filter(other => other.id !== event.id && other.date === event.date); }
  function renderCalendar() {
    const events = upcomingEvents(), next = events.filter(event => event.date >= todayKey());
    return `<section class="calendar-view"><div class="calendar-layout"><form class="panel event-form" data-event-form><p class="eyebrow">NUEVA FECHA</p><h2>Agregar evaluación o laboratorio</h2><label class="field"><span>Título</span><input name="title" required placeholder="PEP 1 / Control / Laboratorio"></label><div class="form-grid"><label class="field"><span>Ramo</span><select name="subject">${SUBJECTS.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select></label><label class="field"><span>Tipo</span><select name="type"><option value="exam">Evaluación</option><option value="lab">Laboratorio</option><option value="deadline">Entrega</option><option value="study">Bloque de estudio</option></select></label><label class="field"><span>Fecha</span><input name="date" type="date" min="${todayKey()}" required></label><label class="field"><span>Hora (opcional)</span><input name="time" type="time"></label></div><label class="toggle"><input type="checkbox" name="weekly"><span>Repetir semanalmente por 8 semanas (útil para laboratorio)</span></label><button class="primary-btn" type="submit">Guardar fecha</button></form>
      <section class="panel"><div class="section-head"><div><p class="eyebrow">PRÓXIMAS</p><h2>${next.length} fechas por delante</h2></div><div class="button-row"><button class="secondary-btn" data-action="export-ics" ${next.length ? '' : 'disabled'}>Exportar .ics</button><button class="text-btn" data-action="enable-notifications">Avisos del navegador</button></div></div>${events.length ? `<div class="event-list">${events.map(event => { const subject = subjectFor(event.subject), diff = daysBetween(todayKey(), event.date), conflicts = conflictsFor(event); return `<article class="event-card ${diff < 0 ? 'past' : diff <= 3 ? 'soon' : ''}"><span class="date-box"><b>${parseDay(event.date).getDate()}</b><small>${new Intl.DateTimeFormat('es-CL', { month: 'short' }).format(parseDay(event.date))}</small></span><div><h3>${esc(event.title)}</h3><p>${subject.name} · ${event.time || 'sin hora'} · ${diff < 0 ? `hace ${Math.abs(diff)} días` : diff === 0 ? 'hoy' : `faltan ${diff} días`}</p>${conflicts.length ? `<small class="conflict">Coincide con ${conflicts.map(c => esc(c.title)).join(', ')}</small>` : ''}</div><button class="icon-btn danger" data-delete-event="${event.id}" aria-label="Eliminar ${esc(event.title)}">×</button></article>`; }).join('')}</div>` : emptyState('Calendario vacío', 'Ingresa las fechas oficiales apenas las entreguen; aparecerán también en Inicio.')}</section></div></section>`;
  }

  function calendarEventRows(events) {
    return events.map(event => {
      const subject = subjectFor(event.subject);
      return `<article class="calendar-event ${event.status === 'done' ? 'is-done' : ''}"><span class="subject-dot" style="--course:${subject.color}">${subject.short}</span><div><b>${esc(event.title)}</b><small>${esc(subject.name)} · ${formatDate(event.date)}${event.time ? ` · ${esc(event.time)}` : ''} · ${event.status === 'done' ? 'Hecho' : 'Pendiente'}</small>${event.topic ? `<p>${esc(event.topic)}</p>` : ''}${event.prepMinutes ? `<small>Preparación pendiente: ${event.prepMinutes} min</small>` : ''}${event.notes ? `<p>${esc(event.notes)}</p>` : ''}${event.type === 'lab' ? labEventStages(event) : ''}${event.weekdayUncertain ? '<small class="date-warning">La fecha numérica no coincide con el día de semana informado; confirmar.</small>' : ''}${event.dateNote ? `<small class="date-warning">${esc(event.dateNote)}</small>` : ''}</div><button class="icon-btn" data-calendar-toggle="${esc(event.id)}" aria-label="${event.status === 'done' ? 'Marcar pendiente' : 'Marcar hecho'}: ${esc(event.title)}" title="${event.status === 'done' ? 'Reabrir' : 'Hecho'}">${event.status === 'done' ? '↺' : '✓'}</button><button class="icon-btn" data-calendar-edit="${esc(event.id)}" aria-label="Editar ${esc(event.title)}">✎</button><button class="icon-btn danger" data-calendar-delete="${esc(event.id)}" aria-label="Eliminar ${esc(event.title)}">×</button></article>`;
    }).join('');
  }

  function labEventStages(event) {
    const lab = window.NexoLabPlan.normalize(event.lab);
    const checklist = lab.during.checklist.length ? `<ul>${lab.during.checklist.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : '';
    return `<div class="lab-event-stages"><div><b>Antes</b>${lab.manual ? `<small>Manual: ${esc(lab.manual)}</small>` : ''}<button type="button" data-lab-toggle="${esc(event.id)}" data-lab-stage="prelab" aria-pressed="${lab.prelab.done}">${lab.prelab.done ? '✓ Pre-lab listo' : 'Pre-lab pendiente'}${lab.prelab.dueDate ? ` · ${formatDate(lab.prelab.dueDate)}` : ''}</button></div><div><b>Durante</b>${checklist || '<small>Sin checklist.</small>'}</div><div><b>Después</b><button type="button" data-lab-toggle="${esc(event.id)}" data-lab-stage="report" aria-pressed="${lab.after.reportDone}">${lab.after.reportDone ? '✓ Informe listo' : 'Informe pendiente'}${lab.after.reportDueDate ? ` · ${formatDate(lab.after.reportDueDate)}` : ''}</button></div></div>`;
  }

  function eventEditorDetails(edit) {
    const priority = Number(edit?.priority) || 2;
    const classes = SUBJECTS.map(subject => `<fieldset><legend>${esc(subject.name)}</legend>${Object.values(LESSONS).filter(lesson=>lesson.subject===subject.id).map(lesson=>`<label><input type="checkbox" name="dependencies" value="${esc(lesson.id)}" ${(edit?.dependencies||[]).includes(lesson.id)?'checked':''}><span>${esc(lesson.title)}</span></label>`).join('')}</fieldset>`).join('');
    const lab = window.NexoLabPlan.normalize(edit?.lab);
    return `<div class="event-detail-grid"><label class="field"><span>Importancia</span><select name="priority">${[[1,'Normal'],[2,'Alta'],[3,'Muy alta']].map(([value,label])=>`<option value="${value}" ${priority===value?'selected':''}>${label}</option>`).join('')}</select></label><label class="field"><span>Duración estimada (min)</span><input name="durationMinutes" type="number" min="0" max="1440" value="${Number(edit?.durationMinutes)||0}"></label><label class="field"><span>Preparación pendiente (min)</span><input name="prepMinutes" type="number" min="0" max="2000" value="${Number(edit?.prepMinutes)||0}"></label></div><fieldset class="lab-editor" data-lab-editor ${edit?.type==='lab'?'':'hidden'}><legend>Laboratorio</legend><div class="event-detail-grid"><label class="field"><span>Manual o referencia</span><input name="labManual" maxlength="300" value="${esc(lab.manual)}"></label><label class="field"><span>Pre-lab: fecha límite</span><input name="labPrelabDate" type="date" value="${esc(lab.prelab.dueDate)}"></label><label class="field"><span>Informe: fecha límite</span><input name="labReportDate" type="date" value="${esc(lab.after.reportDueDate)}"></label></div><label class="field"><span>Checklist durante el laboratorio (uno por línea)</span><textarea name="labChecklist" maxlength="1000">${esc(lab.during.checklist.join('\n'))}</textarea></label></fieldset><details class="event-prerequisites"><summary>Clases que necesitas antes${edit?.dependencies?.length?` (${edit.dependencies.length})`:''}</summary><div>${classes}</div></details><label class="field"><span>Notas</span><textarea name="notes" maxlength="2000">${esc(edit?.notes||'')}</textarea></label>`;
  }

  function renderCalendarInteractive() {
    if (!ui.calendarMonth) ui.calendarMonth = todayKey().slice(0, 7);
    if (!ui.calendarDate) ui.calendarDate = todayKey();
    const [year, month] = ui.calendarMonth.split('-').map(Number);
    const first = new Date(year, month - 1, 1);
    const days = new Date(year, month, 0).getDate();
    const offset = (first.getDay() + 6) % 7;
    const count = Math.ceil((offset + days) / 7) * 7;
    const heading = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(first).toUpperCase();
    const selectedEvents = state.events.filter(event => event.date === ui.calendarDate).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const upcoming = upcomingEvents().filter(event => event.date >= todayKey());
    const edit = state.events.find(event => event.id === ui.editEventId);
    const studied = todayStudyMinutes(), goal = state.settings.dailyGoalMinutes;
    const tiles = Array.from({ length: count }, (_, index) => {
      const number = index - offset + 1;
      if (number < 1 || number > days) return '<span class="calendar-empty" aria-hidden="true"></span>';
      const date = `${year}-${String(month).padStart(2, '0')}-${String(number).padStart(2, '0')}`;
      const events = state.events.filter(event => event.date === date);
      return `<button class="calendar-day ${date === todayKey() ? 'today' : ''} ${date === ui.calendarDate ? 'selected' : ''}" data-calendar-day="${date}" aria-label="${number} de ${heading.toLowerCase()}; ${events.length} evento${events.length === 1 ? '' : 's'}" aria-pressed="${date === ui.calendarDate}"><b>${number}</b><span class="calendar-day-events">${events.slice(0, 2).map(event => `<i>${esc(event.title)}</i>`).join('')}${events.length > 2 ? `<i>+${events.length - 2}</i>` : ''}</span></button>`;
    }).join('');
    return `<section class="calendar-interactive">
      <section class="study-plan panel"><div><h2>Plan de hoy</h2><p>${studied} / ${goal} min de estudio</p></div><label>Meta diaria (min)<input data-daily-goal type="number" min="15" max="600" step="5" value="${goal}"></label><progress value="${Math.min(studied,goal)}" max="${goal}" aria-label="${studied} de ${goal} minutos estudiados hoy"></progress></section>
      <section class="calendar-board" aria-label="Calendario mensual">
        <div class="calendar-art"><div class="calendar-month-bar"><button data-calendar-prev aria-label="Mes anterior">‹</button><h2>${heading}</h2><button data-calendar-next aria-label="Mes siguiente">›</button></div></div>
        <div class="calendar-grid"><div class="calendar-weekdays">${['LUNES','MARTES','MIÉRCOLES','JUEVES','VIERNES','SÁBADO','DOMINGO'].map(day => `<b>${day}</b>`).join('')}</div><div class="calendar-days">${tiles}</div></div>
      </section>
      <section class="calendar-selected panel"><div class="section-head"><div><p class="eyebrow">DÍA SELECCIONADO</p><h2>${formatDate(ui.calendarDate)}</h2></div><button class="secondary-btn" data-calendar-new>+ Agregar evento</button></div>${selectedEvents.length ? calendarEventRows(selectedEvents) : '<p class="calendar-empty-message">Sin eventos este día.</p>'}</section>
      <section class="calendar-editor panel"><h2>${edit ? 'Editar evento' : 'Agregar evento'}</h2><form data-event-form><label class="field"><span>Título</span><input name="title" required value="${esc(edit?.title || '')}" placeholder="PEP, control o entrega"></label><div class="form-grid"><label class="field"><span>Ramo</span><select name="subject">${SUBJECTS.map(s => `<option value="${s.id}" ${s.id === (edit?.subject || 'organica') ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label><label class="field"><span>Tipo</span><select name="type">${[['class','Clase'],['exam','PEP o control'],['lab','Laboratorio'],['prelab','Pre-lab'],['report','Informe'],['task','Tarea'],['deadline','Entrega'],['review','Revisión'],['study','Estudio'],['manual','Otro']].map(([id,name]) => `<option value="${id}" ${id === (edit?.type || 'exam') ? 'selected' : ''}>${name}</option>`).join('')}</select></label><label class="field"><span>Fecha</span><input name="date" type="date" required value="${esc(edit?.date || ui.calendarDate)}"></label><label class="field"><span>Hora</span><input name="time" type="time" value="${esc(edit?.time || '')}"></label></div>${eventEditorDetails(edit)}${edit ? '' : '<label class="toggle"><input type="checkbox" name="weekly"><span>Repetir semanalmente por 8 semanas</span></label>'}<div class="button-row"><button class="primary-btn" type="submit">${edit ? 'Guardar cambios' : 'Guardar evento'}</button>${edit ? '<button class="secondary-btn" type="button" data-calendar-cancel>Cancelar edición</button>' : ''}</div></form></section>
      <section class="calendar-upcoming panel"><div class="section-head"><h2>Próximas evaluaciones</h2><button class="secondary-btn" data-action="export-ics" ${upcoming.length ? '' : 'disabled'}>Exportar .ics</button></div>${upcoming.length ? calendarEventRows(upcoming) : '<p>Sin fechas próximas.</p>'}</section>
    </section>`;
  }

  function sessionsInRange(range) {
    if (range === 'all') return state.sessions;
    const threshold = todayKey(addDays(new Date(), -(Number(range) - 1)));
    return state.sessions.filter(session => session.date >= threshold);
  }
  function renderStats() {
    const sessions = sessionsInRange(ui.statsRange), seconds = sessions.reduce((sum, item) => sum + sessionSeconds(item), 0);
    const totals = SUBJECTS.map(subject => ({ subject, seconds: sessions.filter(s => s.subject === subject.id).reduce((sum, s) => sum + sessionSeconds(s), 0) }));
    const max = Math.max(1, ...totals.map(item => item.seconds));
    const practices = Object.values(state.practice).filter(item => item && (!ui.statsRange || ui.statsRange === 'all' || !item.lastAttempt || item.lastAttempt >= todayKey(addDays(new Date(), -(Number(ui.statsRange) - 1)))));
    const attempted = practices.filter(item => item.attempts > 0), firstCorrect = attempted.filter(item => item.firstCorrect).length;
    const modes = Object.entries(sessions.reduce((acc, item) => { const mode = item.mode || 'Estudio'; acc[mode] = (acc[mode] || 0) + sessionSeconds(item); return acc; }, {})).sort((a, b) => b[1] - a[1]);
    const weeklySeconds = sessionsInRange('7').reduce((sum, item) => sum + sessionSeconds(item), 0), goal = Number(state.weeklyGoal) || 300;
    app.innerHTML = `<section class="page stats-page"><h1 class="stats-title">Estadísticas</h1>
      <div class="filter-bar"><div class="segmented" role="tablist" aria-label="Rango de estadísticas">${[['7', '7 días'], ['30', '30 días'], ['all', 'Todo']].map(([id, label]) => `<button role="tab" aria-selected="${ui.statsRange === id}" class="${ui.statsRange === id ? 'active' : ''}" data-stats-range="${id}">${label}</button>`).join('')}</div><label><span>Meta semanal (min)</span><input type="number" min="30" max="3000" step="15" data-weekly-goal value="${goal}"></label></div>
      <div class="stat-kpis"><article><span>Tiempo</span><strong>${Math.round(seconds / 60)}</strong><small>minutos en el rango</small></article><article><span>Sesiones</span><strong>${sessions.length}</strong><small>${sessions.length ? `${Math.round(seconds / 60 / sessions.length)} min promedio` : 'sin registros'}</small></article><article><span>Primer intento</span><strong>${attempted.length ? Math.round(firstCorrect / attempted.length * 100) : 0}%</strong><small>${firstCorrect}/${attempted.length} ejercicios</small></article><article><span>Memoria</span><strong>${dueReviews().length}</strong><small>repasos vencidos</small></article></div>
      <div class="stats-grid"><section class="panel"><h2>Balance por ramo</h2><div class="bar-chart" aria-label="Minutos por ramo">${totals.map(item => `<div><span>${item.subject.short}</span><div><i style="width:${item.seconds / max * 100}%;--course:${item.subject.color}"></i></div><b>${Math.round(item.seconds / 60)} min</b></div>`).join('')}</div><table class="data-table"><caption>Detalle accesible del tiempo</caption><thead><tr><th>Ramo</th><th>Minutos</th><th>Sesiones</th></tr></thead><tbody>${totals.map(item => `<tr><td>${item.subject.name}</td><td>${Math.round(item.seconds / 60)}</td><td>${sessions.filter(s => s.subject === item.subject.id).length}</td></tr>`).join('')}</tbody></table></section>
      <section class="panel"><h2>Meta de la semana</h2>${progressBar(weeklySeconds / 60 / goal * 100, `${Math.round(weeklySeconds / 60)} de ${goal} min`)}<h3>Cómo estudiaste</h3><div class="mode-list">${modes.length ? modes.map(([mode, value]) => `<div><span>${esc(mode)}</span><b>${Math.round(value / 60)} min</b></div>`).join('') : '<p>Sin sesiones en este rango.</p>'}</div></section>
      <section class="panel"><h2>Aprendizaje</h2><div class="learning-grid"><div><strong>${Object.values(state.mastery).filter(m => m?.status === 'dominado').length}</strong><span>clases dominadas</span></div><div><strong>${Object.values(state.mastery).filter(m => m?.status === 'inestable').length}</strong><span>en práctica</span></div><div><strong>${state.errors.filter(e => e.status !== 'resolved').length}</strong><span>errores abiertos</span></div><div><strong>${state.errors.filter(e => e.status === 'resolved').length}</strong><span>errores cerrados</span></div></div></section></div>
      <section class="panel"><div class="section-head"><div><p class="eyebrow">SESIONES</p><h2>Historial reciente</h2></div><button class="secondary-btn" data-route="history">Ver historial paginado</button></div>${sessions.length ? `<div class="session-list">${sessions.slice(0, 30).map(session => `<div class="session-row"><span class="subject-dot" style="--course:${subjectFor(session.subject).color}">${subjectFor(session.subject).short}</span><div><b>${subjectFor(session.subject).name}</b><small>${esc(session.mode || 'Estudio')} · ${formatDate(session.date)}</small></div><strong>${formatClock(sessionSeconds(session) * 1000)}</strong><button class="icon-btn danger" data-delete-session="${session.id}" aria-label="Eliminar sesión">×</button></div>`).join('')}</div>` : emptyState('Aún no hay sesiones', 'El Reloj de estudio alimenta este historial.')}</section>
    </section>`;
  }

  function challengeDefinitions() {
    const today = todayKey(), weekStart = todayKey(addDays(new Date(), -6));
    const todaySeconds = state.sessions.filter(s => s.date === today).reduce((sum, s) => sum + sessionSeconds(s), 0);
    const reviewed = Object.values(state.mastery).filter(m => m.lastAttempt === today).length;
    const exercises = Object.values(state.practice).filter(p => p.lastAttempt === today && p.correct).length;
    const balanced = new Set(state.sessions.filter(s => s.date >= weekStart && sessionSeconds(s) >= 300).map(s => s.subject)).size;
    return [
      { id: 'focus25', period: today, title: 'Enfoque de 25 minutos', detail: 'Acumula 25 minutos reales hoy.', value: Math.floor(todaySeconds / 60), target: 25, reward: 15 },
      { id: 'review1', period: today, title: 'Cerrar un repaso', detail: 'Completa un intento de Dominio hoy.', value: reviewed, target: 1, reward: 20 },
      { id: 'practice5', period: today, title: 'Cinco variantes', detail: 'Resuelve correctamente cinco ejercicios hoy.', value: exercises, target: 5, reward: 25 },
      { id: 'balance3', period: weekStart, title: 'Semana equilibrada', detail: 'Registra al menos 5 min en tres ramos distintos durante 7 días.', value: balanced, target: 3, reward: 30 }
    ];
  }
  function challengeKey(item) { return `${item.id}:${item.period}`; }
  function renderChallenges() {
    return `<div class="challenge-grid">${challengeDefinitions().map(item => { const claimed = state.claimedChallenges.includes(challengeKey(item)), complete = item.value >= item.target; return `<article class="challenge-card ${complete ? 'complete' : ''}"><div><span>DESAFÍO ${item.id === 'balance3' ? 'SEMANAL' : 'DIARIO'}</span><b>${cloud.authenticated ? 'En seguimiento' : `+${item.reward} átomos`}</b></div><h2>${esc(item.title)}</h2><p>${esc(item.detail)}</p>${progressBar(item.value / item.target * 100, `${Math.min(item.value, item.target)} de ${item.target}`)}<button class="primary-btn" data-claim-challenge="${item.id}" ${cloud.authenticated || !complete || claimed ? 'disabled' : ''}>${cloud.authenticated ? 'Sin recompensa cloud' : claimed ? 'Cobrado' : complete ? 'Cobrar recompensa' : 'Aún no cumplido'}</button></article>`; }).join('')}</div>`;
  }

  // La tienda y la mascota se están rehaciendo desde cero (docs/mascota/SPEC.md).
  function comingSoon(eyebrow,id,title,text) {
    return `<section class="empty-state" aria-labelledby="${id}"><span class="empty-state-mark" aria-hidden="true">✧</span><p class="eyebrow">${eyebrow}</p><h2 id="${id}">${title}</h2><p>${text}</p></section>`;
  }
  // Cofres por hitos (docs/economia/SPEC.md): jefes vencidos del juego, guías completadas y rachas.
  function awardHitos() {
    let bosses = [];
    try { const rec = JSON.parse(localStorage.getItem('nexo-pep1-campana') || '{}').record || {}; bosses = Object.keys(rec); } catch (_) {}
    const guides = Object.keys(state.guides).filter(id => state.guides[id]?.completed);
    const got = window.NexoTienda.claimMilestones(state, { bosses, guides, streak: streak() });
    if (got.length) { saveState({ backup: false }); showToast(got.length === 1 ? 'Ganaste un cofre por tu logro ✦' : 'Ganaste ' + got.length + ' cofres por tus logros ✦'); }
  }
  function renderShop() {
    petBind(); awardHitos();
    app.innerHTML=`<section class="page forge-page tienda-page"><div class="tienda-head"><div><p class="eyebrow">MERCADO ARCANO</p><h2 aria-label="Tienda del alquimista">${window.NexoPixelText?window.NexoPixelText.render('Tienda del alquimista'):'Tienda del alquimista'}</h2></div><div class="tienda-wallet" id="shopWallet"></div></div>
      <div class="tienda-mesa"><div class="pu-panel"><div class="tienda-cofre"><img id="shopChest" src="./assets/tienda/cofre-cerrado.png" alt="Cofre del alquimista"><div id="shopTop"></div></div></div>
        <div class="pu-panel"><div class="pu-paper tienda-pet"><canvas id="petShopPreview" width="40" height="44" aria-label="Vista previa de tu compañero"></canvas><small>Prueba un accesorio y mira cómo le queda a tu compañero.</small></div></div></div>
      <div class="tienda-tipos" id="shopTypes"></div>
      <div class="pu-paper tienda-odds" id="shopOdds"></div>
      <div class="tienda-estantes" id="petShop"></div></section>`+
      `<details class="forge-challenges"><summary>Desafíos de estudio</summary>${renderChallenges()}</details>`;
    window.NexoPet?.wireShop(app);
  }
  function renderMascot() {
    petBind();
    app.innerHTML=`<section class="page"><p class="eyebrow">TU COMPAÑERO</p><h2>Vestuario</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px">
        <div class="panel"><h3>Elige tu compañero</h3><div id="petPick" style="display:flex;gap:10px;flex-wrap:wrap"></div>
          <p><label>Nombre <input id="petName" maxlength="20" autocomplete="off"></label></p>
          <h3>Vestuario</h3><div id="petWardrobe" style="display:flex;gap:8px;flex-wrap:wrap"></div>
          <p><small>Cuatro ranuras (cabeza, cara, cuello, mano). Más accesorios en la Tienda.</small></p></div>
        <div class="panel" style="display:flex;justify-content:center;align-items:center;background:radial-gradient(circle at 50% 40%,#f3e6c8,#d8c39a)"><canvas id="petBig" width="40" height="44" style="width:240px;height:264px;image-rendering:pixelated" aria-label="Así se ve tu compañero"></canvas></div>
      </div></section>`;
    window.NexoPet?.wireProfile(app);
  }

  function renderSettings() {
    const backup = storage.getItem(BACKUP_KEY);
    const sync = cloud.statusInfo();
    const syncLabel = {guest:'En este dispositivo',synced:'✓ Sincronizado',pending:'☁ Guardado localmente · pendiente',
      syncing:'☁ Sincronizando…',conflict:'⚠ Conflicto: ambas versiones conservadas',failed:'⚠ Pendiente de conexión'}[sync.status] || 'Preparando…';
    const guestHasProgress = Boolean(storage.getItem(STORAGE_KEY));
    const performanceSelect=(key,label,options)=>`<label class="field"><span>${esc(label)}</span><select data-performance-setting="${key}">${options.map(([value,name])=>`<option value="${value}" ${state.settings[key]===value?'selected':''}>${esc(name)}</option>`).join('')}</select></label>`;
    const accountPanel = !cloud.enabled
      ? '<p>Progreso guardado en este dispositivo.</p>'
      : cloud.authenticated
        ? `<p><b>${esc(cloud.user.email || 'Cuenta Nexo')}</b></p><p id="syncStatus" role="status">${esc(syncLabel)}</p>
          ${sync.lastSync ? `<small>Última sincronización: ${esc(new Intl.DateTimeFormat('es-CL',{dateStyle:'short',timeStyle:'short'}).format(new Date(sync.lastSync)))}</small>` : ''}
          ${guestHasProgress && !cloud.guestMigrated ? '<button class="secondary-btn" data-action="claim-guest">Incorporar progreso de invitado</button>' : ''}
          ${sync.conflicts ? '<button class="secondary-btn" data-action="export-conflicts">Exportar conflictos</button>' : ''}
          ${cloud.conflicts.map(conflict=>`<div class="notice"><b>Conflicto en ${esc(conflict.key)}</b>
            <span>Se conservaron ambas versiones; puedes exportarlas antes de elegir.</span>
            <button class="secondary-btn" data-resolve-conflict="${esc(conflict.key)}" data-choice="cloud">Mantener versión de la cuenta</button>
            <button class="secondary-btn" data-resolve-conflict="${esc(conflict.key)}" data-choice="local">Usar versión de este dispositivo</button></div>`).join('')}
          <div class="button-stack"><button class="secondary-btn" data-action="sync-now">Sincronizar ahora</button>
          <button class="secondary-btn" data-action="logout">Cerrar sesión</button>
          <button class="text-btn danger" data-action="delete-account">Eliminar mi cuenta</button></div>`
        : `<p>Como invitado, tus cambios quedan en este dispositivo. Al crear cuenta se sincroniza el progreso académico; los átomos y compras anteriores quedan en un respaldo verificable, pero no se convierten en saldo o artículos cloud gastables.</p>
          ${cloud.googleOAuthEnabled ? '<button class="primary-btn" data-action="google-login">Continuar con Google</button>' : ''}
          <p id="syncStatus" role="status">${esc(syncLabel)}</p>`;
    app.innerHTML = `<section class="page settings-page">${pageHeader('AJUSTES Y RESPALDO', 'Tus datos siguen siendo tuyos', cloud.authenticated ? 'Tus cambios se guardan primero aquí y se sincronizan con tu cuenta.' : 'Puedes estudiar como invitado y crear una cuenta cuando quieras.')}
      <section class="panel"><p class="eyebrow">CUENTA</p><h2>Cuenta y sincronización</h2>${accountPanel}</section>
      <div class="settings-grid"><section class="panel"><p class="eyebrow">EXPERIENCIA</p><h2>Comodidad</h2>
        <label class="toggle"><input type="checkbox" data-setting="sound" ${state.settings.sound ? 'checked' : ''}><span><b>Efectos de sonido</b><small>Apagados por defecto.</small></span></label>
        <label class="field"><span>Volumen de efectos</span><input type="range" min="0" max="100" step="5" data-setting-volume="sfxVolume" value="${Math.round(state.settings.sfxVolume * 100)}" aria-label="Volumen de efectos"></label>
        <label class="toggle"><input type="checkbox" data-setting="ambient" ${state.settings.ambient ? 'checked' : ''}><span><b>Ambiente</b><small>Suave en Inicio, Bitácora y Perfil; silencio en clases.</small></span></label>
        <label class="field"><span>Volumen de ambiente</span><input type="range" min="0" max="100" step="5" data-setting-volume="ambientVolume" value="${Math.round(state.settings.ambientVolume * 100)}" aria-label="Volumen de ambiente"></label>
        <label class="toggle"><input type="checkbox" data-setting="music" ${state.settings.music ? 'checked' : ''}><span><b>Música</b><small>Pista instrumental opcional; se detiene durante las clases.</small></span></label>
        <label class="field"><span>Volumen de música</span><input type="range" min="0" max="100" step="5" data-setting-volume="musicVolume" value="${Math.round(state.settings.musicVolume * 100)}" aria-label="Volumen de música"></label>
        <label class="toggle"><input type="checkbox" data-setting="motion" ${state.settings.motion ? 'checked' : ''}><span><b>Animaciones suaves</b><small>Desactívalas si prefieres menos movimiento.</small></span></label><label class="toggle"><input type="checkbox" data-setting="focusMode" ${state.settings.focusMode ? 'checked' : ''} ${state.inventory.includes('focus-mode') ? '' : 'disabled'}><span><b>Modo sin distracciones</b><small>${state.inventory.includes('focus-mode') ? 'Oculta paneles secundarios mientras corre el cronómetro.' : 'Se desbloquea en Tienda.'}</small></span></label></section>
      <section class="panel"><p class="eyebrow">TUTORIALES</p><h2>Vuelve a ver al Grimorio</h2><p>${state.tutorial?.status === 'done' ? 'Ya lo completaste.' : 'Aún no lo completas.'}${cloud.authenticated || state.tutorial?.rewarded ? '' : ' Al completarlo ganas monedas, una sola vez.'}</p><button class="secondary-btn" data-route="tutorial">Ver el tutorial</button></section>
      <section class="panel"><p class="eyebrow">PORTABILIDAD</p><h2>Respaldo manual</h2><p>El archivo incluye sesiones, errores, notas, inasistencias, clases, calendario y personalización. No contiene contraseñas.</p><div class="button-stack"><button class="primary-btn" data-action="export-data">Exportar progreso .json</button><button class="secondary-btn" data-action="import-data">Importar progreso</button><button class="secondary-btn" data-action="restore-backup" ${backup ? '' : 'disabled'}>Restaurar copia automática</button></div><small>Última copia automática: ${state.meta.lastBackupAt ? new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(state.meta.lastBackupAt)) : 'todavía no existe'}</small></section>
      <section class="panel danger-zone"><p class="eyebrow">ZONA DE CUIDADO</p><h2>Reiniciar la app</h2><p>${cloud.authenticated ? 'Para eliminar datos sincronizados usa la opción Eliminar mi cuenta.' : 'Antes de borrar todo, exporta un archivo. El reinicio exige una segunda confirmación y conserva una copia recuperable.'}</p><button class="text-btn danger" data-action="reset-app" ${cloud.authenticated ? 'disabled' : ''}>Borrar progreso y comenzar de nuevo</button></section></div>
      <section class="panel performance-settings"><p class="eyebrow">RENDIMIENTO</p><h2>Gráficos y movimiento</h2><div class="performance-settings-grid">
      ${performanceSelect('graphicsQuality','Calidad gráfica',[['auto','Automática'],['low','Baja'],['balanced','Equilibrada'],['high','Alta']])}
      ${performanceSelect('particles','Partículas',[['none','Sin partículas'],['low','Bajas'],['high','Altas']])}
      ${performanceSelect('ambientMotion','Movimiento ambiental',[['reduced','Reducido'],['normal','Normal'],['rich','Rico']])}
      ${performanceSelect('mascotMotion','Movimiento de mascota',[['reduced','Reducido'],['full','Completo']])}
      </div></section>
      <section class="panel"><p class="eyebrow">PRIVACIDAD Y DATOS</p><h2>Tu información</h2>
      <p>Como invitado, el progreso queda en este navegador. Con cuenta, se sincronizan progreso, sesiones, notas, calendario y preferencias. Las compras y el saldo están protegidos en el servidor; el saldo antiguo se conserva como respaldo y no se convierte en moneda gastable.</p>
      <label class="toggle"><input type="checkbox" data-setting="analytics" ${state.settings.analytics ? 'checked' : ''}><span><b>Ayudar a mejorar Nexo con analytics</b><small>Opcional y desactivado inicialmente. Eventos de uso y metadatos técnicos del navegador; no enviamos notas, respuestas abiertas, correo ni grabaciones.</small></span></label>
      ${cloud.authenticated ? '<p>Si solicitas eliminar tu cuenta, también se borran sus registros en la base de datos. Exporta antes una copia si la necesitas.</p>' : ''}
      </section>
    </section>`;
  }

  let modalConfirm = null;
  function openModal({ title, body, confirmLabel = '', cancelLabel = 'Cancelar', onConfirm = null, tone = '' }) {
    lastFocus = document.activeElement;
    modalConfirm = onConfirm;
    modalRoot.innerHTML = `<div class="modal-backdrop" data-action="modal-close"><section class="modal ${tone}" role="dialog" aria-modal="true" aria-labelledby="modalTitle" tabindex="-1" data-modal-panel><button class="modal-close" data-action="modal-close" aria-label="Cerrar">×</button><h2 id="modalTitle">${esc(title)}</h2><div class="modal-body">${body}</div><footer>${cancelLabel ? `<button class="secondary-btn" data-action="modal-close">${esc(cancelLabel)}</button>` : ''}${confirmLabel ? `<button class="primary-btn" data-action="modal-confirm">${esc(confirmLabel)}</button>` : ''}</footer></section></div>`;
    window.NexoAnimation?.reveal(modalRoot.querySelector('[data-modal-panel]'));
    requestAnimationFrame(() => modalRoot.querySelector('[data-modal-panel]')?.focus());
  }
  function closeModal() {
    modalRoot.innerHTML = '';
    modalConfirm = null;
    lastFocus?.focus?.();
    lastFocus = null;
  }
  function confirmAction(title, text, confirmLabel, action, tone = 'danger-modal') {
    openModal({ title, body: `<p>${esc(text)}</p>`, confirmLabel, onConfirm: action, tone });
  }

  function playSuccess() {
    window.NexoAudio?.playFeedback(state.settings);
  }


  function timerStart() {
    if (state.timer.status === 'idle') { state.timer.subject = document.querySelector('#timerSubject')?.value || state.timer.subject; state.timer.elapsedBeforeMs = 0; }
    if (cloud.authenticated) {
      const promise = state.timer.serverId
        ? cloud.resumeTimer(state.timer.serverId).then(() => state.timer.serverId)
        : cloud.startTimer(state.timer.subject);
      promise.then(id => {
        if (state.timer.status==='idle') return cloud.cancelTimer(id).catch(()=>{});
        state.timer.serverId=id; saveState({backup:false});
      })
        .catch(() => showToast('El cronómetro sigue local; esta sesión no dará átomos si no se conecta.'));
    }
    state.timer.status = 'running'; state.timer.startedAt = Date.now(); saveState({ backup: false }); renderRoute(false);
    if (parseRoute()[0] === 'home') window.NexoPet?.celebrate(0);
    cloud.track('study_session_started',{subject_id:state.timer.subject});
  }
  function timerPause() {
    if (parseRoute()[0] === 'home') window.NexoPet?.celebrate(0);
    if (state.timer.status !== 'running') return;
    if (cloud.authenticated && state.timer.serverId) cloud.pauseTimer(state.timer.serverId).catch(() => showToast('Pausa guardada aquí; revisa la conexión.'));
    state.timer.elapsedBeforeMs = timerElapsedMs(); state.timer.startedAt = null; state.timer.status = 'paused'; saveState({ backup: false }); renderRoute(false);
  }
  function timerFinish() {
    const secondsRaw = Math.floor(timerElapsedMs() / 1000); if (secondsRaw < 1) return;
    const commit = async seconds => {
      let rewardValue = cloud.authenticated ? 0 : sessionReward(seconds);
      let sessionId = uid('session'), confirmedSeconds=seconds, serverConfirmed=false;
      if (cloud.authenticated && state.timer.serverId) {
        try {
          const result=await cloud.finishTimer(state.timer.serverId);
          rewardValue=Number(result.reward)||0; confirmedSeconds=Number(result.seconds)||seconds;
          sessionId=result.session_id; serverConfirmed=true;
        } catch (_) { showToast('Sesión guardada aquí; la recompensa requiere confirmación de red.'); }
      }
      if (!state.sessions.some(item=>item.id===sessionId)) {
        state.sessions.unshift({
          id:sessionId,date:todayKey(),subject:state.timer.subject,mode:'Cronómetro',
          seconds:confirmedSeconds,source:serverConfirmed?'server_timer':'manual'
        });
        state.xp += sessionXp(confirmedSeconds);
      }
      if (!cloud.authenticated) rewardValue = window.NexoTienda.earn(state, 'sesion', todayKey(), rewardValue);
      state.timer = { status: 'idle', subject: state.timer.subject, startedAt: null, elapsedBeforeMs: 0 };
      saveState(); playSuccess(); renderRoute(false); window.NexoPet?.celebrate(rewardValue);
      showToast(`Sesión guardada · ${formatClock(confirmedSeconds * 1000)}${rewardValue ? ` · +${rewardValue} átomos` : ' · sin átomos pendientes'}`);
      cloud.track('study_session_completed',{subject_id:state.timer.subject,seconds:confirmedSeconds});
    };
    if (secondsRaw > 14400) return confirmAction('Sesión muy larga', 'El cronómetro supera 4 horas. Para evitar un registro accidental, se guardará un máximo de 4 horas. Puedes cancelar y corregirlo.', 'Guardar 4 horas', () => { closeModal(); commit(14400); });
    commit(secondsRaw);
  }
  function timerReset() {
    if (timerElapsedMs() < 1000) return;
    confirmAction('Descartar esta sesión', 'El tiempo actual no se añadirá a las estadísticas ni dará recompensa.', 'Descartar', () => {
      if (cloud.authenticated && state.timer.serverId) cloud.cancelTimer(state.timer.serverId).catch(()=>{});
      state.timer = { status: 'idle', subject: state.timer.subject, startedAt: null, elapsedBeforeMs: 0 }; saveState(); closeModal(); renderRoute(false); showToast('Sesión descartada.');
    });
  }

  function addPracticeError(item, observable, diagnosis) {
    state.errors.unshift({ id: uid('error'), date: todayKey(), subject: item.subject, lessonId: item.lessonId || null, blocker: 'concept', observable, reasoning: state.practice[item.id]?.draft || '', diagnosis, status: 'open', dueAt: todayKey(addDays(new Date(), 1)), source: 'exercise', exerciseId: item.id });
  }
  function recordChoiceExercise(item, form) {
    const progress = state.practice[item.id] || { attempts: 0 };
    const hadCorrect = Boolean(progress.correct || progress.firstCorrect || progress.solvedAt || progress.rewarded);
    const answer = new FormData(form).get('answer'); if (answer === null) return;
    const firstAttempt = progress.attempts === 0;
    progress.selected = Number(answer); progress.attempts += 1; progress.checked = true; progress.correct = progress.selected === item.answer;
    progress.firstCorrect = Boolean(progress.firstCorrect || (firstAttempt && progress.correct && !progress.hintUsed));
    progress.lastAttempt = todayKey(); progress.solvedAt = progress.correct ? todayKey() : progress.solvedAt;
    if (!progress.correct) addPracticeError(item, item.choices[progress.selected], item.lookFor);
    else if (!hadCorrect) { if (!cloud.authenticated) window.NexoTienda.earn(state, firstAttempt && !progress.hintUsed ? 'sinAyuda' : 'conAyuda', todayKey()); state.xp += 5; progress.rewarded = true; playSuccess(); }
    state.practice[item.id] = progress; saveState(); renderRoute(false);
    cloud.track(progress.correct?'exercise_attempted':'exercise_failed',{exercise_id:item.id,correct:progress.correct,attempt:progress.attempts});
  }
  function recordTextExercise(item) {
    const progress = state.practice[item.id] || { attempts: 0 }, firstAttempt = progress.attempts === 0;
    const hadCorrect = Boolean(progress.correct || progress.firstCorrect || progress.solvedAt || progress.rewarded);
    const score = textEvidenceScore(progress.draft || '', item.keys || [], 100);
    progress.attempts += 1; progress.checked = true; progress.textScore = score; progress.correct = score >= 65;
    progress.firstCorrect = Boolean(progress.firstCorrect || (firstAttempt && progress.correct && !progress.hintUsed)); progress.lastAttempt = todayKey();
    if (!progress.correct) addPracticeError(item, `Respuesta abierta ${score}/100`, `Incluye la cadena ${item.lookFor} y conecta los pasos con “porque”, “provoca” o “por eso”.`);
    else if (!hadCorrect) { if (!cloud.authenticated) window.NexoTienda.earn(state, firstAttempt && !progress.hintUsed ? 'sinAyuda' : 'conAyuda', todayKey()); state.xp += 6; progress.rewarded = true; playSuccess(); }
    state.practice[item.id] = progress; saveState(); renderRoute(false);
    cloud.track(progress.correct?'exercise_attempted':'exercise_failed',{exercise_id:item.id,correct:progress.correct,attempt:progress.attempts});
  }

  function saveErrorForm(form) {
    const data = Object.fromEntries(new FormData(form));
    const id = form.dataset.errorForm;
    const value = { id: id || uid('error'), date: id ? (state.errors.find(e => e.id === id)?.date || todayKey()) : todayKey(), subject: data.subject, blocker: data.blocker, observable: data.observable.trim(), reasoning: data.reasoning.trim(), diagnosis: diagnoseError(data), status: id ? (state.errors.find(e => e.id === id)?.status || 'open') : 'open', dueAt: todayKey(addDays(new Date(), 1)), source: id ? (state.errors.find(e => e.id === id)?.source || 'manual') : 'manual' };
    if (id) state.errors[state.errors.findIndex(e => e.id === id)] = value; else state.errors.unshift(value);
    saveState(); routeTo('practice', 'errors'); showToast(id ? 'Error actualizado.' : 'Error guardado con una hipótesis de corrección.');
  }

  function saveEventForm(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const details = {
      priority: clamp(Number(data.priority)||2,1,3),
      durationMinutes: clamp(Number(data.durationMinutes)||0,0,1440),
      prepMinutes: clamp(Number(data.prepMinutes)||0,0,2000),
      dependencies: new FormData(form).getAll('dependencies').filter(value=>LESSONS[value]).slice(0,20),
      notes: String(data.notes||'').trim().slice(0,2000),
      lab: data.type === 'lab' ? window.NexoLabPlan.fromForm(formData, state.events.find(item=>item.id===ui.editEventId)?.lab) : undefined
    };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.date||'')) || todayKey(parseDay(data.date)) !== data.date)
      return showToast('Revisa la fecha del evento.');
    if (ui.editEventId) {
      const event = state.events.find(item => item.id === ui.editEventId);
      if (!event) { ui.editEventId = ''; return renderRoute(false); }
      const dateChanged = event.date !== data.date;
      Object.assign(event, { title: data.title.trim(), subject: data.subject, type: data.type, date: data.date, time: data.time || '', ...details });
      if (dateChanged) { delete event.weekdayUncertain; delete event.dateNote; event.source='manual'; }
      const row = Object.values(state.grades).flatMap(plan => plan.components || []).find(item => item.id === event.sourceId || item.id === event.id);
      if (row) { row.date = data.date; row.name = data.title.trim(); }
      ui.calendarDate = data.date; ui.calendarMonth = data.date.slice(0, 7); ui.editEventId = '';
      saveState(); renderRoute(false); return showToast('Evento actualizado.');
    }
    const dates = [data.date];
    if (data.weekly === 'on') for (let i = 1; i < 8; i += 1) dates.push(todayKey(addDays(parseDay(data.date), i * 7)));
    dates.forEach((date, index) => state.events.push({ id: uid('event'), title: index ? `${data.title} · semana ${index + 1}` : data.title, subject: data.subject, type: data.type, date, time: data.time || '', series: data.weekly === 'on' ? `${data.title}-${data.date}` : null, status: 'planned', source: 'manual', ...details }));
    ui.calendarDate = data.date; ui.calendarMonth = data.date.slice(0, 7);
    saveState(); renderRoute(false); showToast(data.weekly === 'on' ? 'Serie de 8 fechas guardada.' : 'Fecha guardada.');
  }

  async function exportJson() {
    let snapshot=state;
    if (cloud.authenticated) {
      try { snapshot=await cloud.exportAccountData(state); }
      catch (_) { showToast('No pudimos consultar el historial cloud. Exportaremos la copia disponible en este dispositivo.'); }
    }
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `nexo-respaldo-${todayKey()}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Respaldo exportado.');
  }
  function exportIcs() {
    const events = state.events.filter(event => event.date >= todayKey());
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nexo Estudio//ES'];
    events.forEach(event => {
      const date = event.date.replaceAll('-', ''), time = event.time ? event.time.replace(':', '') + '00' : '';
      const end = window.NexoCalendarModel.validTime(event.endTime) ? event.endTime.replace(':', '') + '00' : '';
      lines.push('BEGIN:VEVENT', `UID:${event.id}@nexo-estudio`, `DTSTAMP:${todayKey().replaceAll('-', '')}T120000`, time ? `DTSTART:${date}T${time}` : `DTSTART;VALUE=DATE:${date}`, ...(time && end ? [`DTEND:${date}T${end}`] : []), `SUMMARY:${event.title.replace(/[;,]/g, ' ')}`, `DESCRIPTION:${subjectFor(event.subject).name} · ${event.type}`, 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' }), url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `nexo-calendario-${todayKey()}.ics`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function enableNotifications() {
    if (!('Notification' in window)) return showToast('Este navegador no permite avisos. Usa la exportación .ics.');
    Notification.requestPermission().then(permission => {
      if (permission !== 'granted') return showToast('Los avisos no fueron habilitados.');
      const next = upcomingEvents().find(event => event.date >= todayKey() && daysBetween(todayKey(), event.date) <= 3);
      if (next) new Notification('Nexo · Próxima fecha', { body: `${next.title} · ${formatDate(next.date)}` });
      showToast('Avisos habilitados para este navegador.');
    });
  }

  function updateInteractiveButtons(origin) {
    const form = origin.closest('form'); if (!form) return;
    const submit = form.querySelector('button[type="submit"]');
    if (form.dataset.questionForm && submit) {
      const selected = form.querySelector('input[name="answer"]:checked');
      const reason = form.querySelector('textarea'); submit.disabled = !selected || (reason && reason.value.trim().length < 30);
    }
    if (form.dataset.exerciseChoice && submit) {
      submit.disabled = !form.querySelector('input[name="answer"]:checked') || (form.querySelector('textarea')?.value.trim().length || 0) < 25;
    }
    if (form.dataset.exerciseText && submit) submit.disabled = (form.querySelector('textarea')?.value.trim().length || 0) < 60;
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('button, [data-route]'); if (!button) return;
    if(button.dataset.sceneHotspot&&!button.dataset.route)return window.NexoHomeScene.activate(button.dataset.sceneHotspot,app);
    if (button.closest('.modal-backdrop') && button.classList.contains('modal-backdrop') && event.target !== button) return;
    if (button.dataset.devRoute && new URLSearchParams(location.search).get('nexoDev') === '1') return routeTo(...button.dataset.devRoute.split('/'));
    if (button.dataset.grimoireNode && window.NexoClassCatalog?.[button.dataset.grimoireNode]) return openLesson(button.dataset.grimoireNode); // tema con aula: directo, sin paso extra
    if (button.dataset.grimoireEvaluation) return routeTo('learn','course',button.dataset.grimoireCourse,'evaluation',button.dataset.grimoireEvaluation,...(button.dataset.grimoireNode?[button.dataset.grimoireNode]:[]));
    if (button.dataset.grimoireRoute) return routeTo(...button.dataset.grimoireRoute.split('/'));
    if (button.dataset.route) return routeTo(button.dataset.route, ...(button.dataset.routeSub ? [button.dataset.routeSub] : []));
    if(button.dataset.rescueNext!==undefined)return window.NexoAcademicRescue?.next();
    if(button.dataset.rescueRetry!==undefined)return window.NexoAcademicRescue?.retry();
    if (button.dataset.action === 'toggle-more') return toggleMore(button);
    if (button.dataset.openSubject) return routeTo('subject', button.dataset.openSubject);
    if (button.dataset.openLesson) return openLesson(button.dataset.openLesson, button.dataset.mode || null);
    if (button.dataset.routeMode) { state.routeMode[button.dataset.subject] = button.dataset.routeMode; saveState(); return renderRoute(false); }
    if (button.dataset.practiceTab) return routeTo('practice', button.dataset.practiceTab);
    if (button.dataset.openExercise) return routeTo('practice', 'exercises', button.dataset.openExercise);
    if (button.dataset.openGuide) return routeTo('practice', 'guides', button.dataset.openGuide);
    if (button.dataset.editError) return routeTo('practice', 'errors', button.dataset.editError);
    if (button.dataset.openExam) return routeTo('practice', 'exams', button.dataset.openExam);
    if (button.dataset.openLab) return routeTo('practice', 'labs', button.dataset.openLab);
    if (button.dataset.plannerTab) return routeTo('planner', button.dataset.plannerTab);
    if (button.dataset.homeSubject) {
      ui.homeSubject = button.dataset.homeSubject;
      renderHomeRpg();
      app.querySelector(`[data-home-subject="${ui.homeSubject}"]`)?.focus({ preventScroll: true });
      return;
    }
    if (button.dataset.hubTab) return routeTo('hub', button.dataset.hubTab);
    if (button.dataset.profileTab) return routeTo('profile', button.dataset.profileTab);
    if (button.dataset.profileClose !== undefined) return routeTo('profile');
    if (button.dataset.profileGradeSubject) { ui.profileSubject = button.dataset.profileGradeSubject; return renderRoute(false); }
    if (button.dataset.profileGradeGroup) { ui.profileGroup = button.dataset.profileGradeGroup; return renderRoute(false); }
    if (button.dataset.absenceSubject) { ui.absenceSubject = button.dataset.absenceSubject; return renderRoute(false); }
    if (button.dataset.profileAddGrade !== undefined) {
      gradeConfig(ui.profileSubject).components.push({ id: uid('grade'), name: 'Nueva evaluación', group: ui.profileGroup, weight: '', grade: '', date: '' });
      saveState(); return renderRoute(false);
    }
    if (button.dataset.profileDeleteGrade) return removeGrade(button.dataset.profileDeleteGrade, ui.profileSubject);
    if (button.dataset.deleteAbsence) return removeWithUndo(state.absences, button.dataset.deleteAbsence, 'Inasistencia');
    if (button.dataset.clockSize) return resizeClock(Number(button.dataset.clockSize));
    if (button.dataset.action === 'timer-start') return timerStart();
    if (button.dataset.action === 'timer-pause') return timerPause();
    if (button.dataset.action === 'timer-finish') { if (button.closest('.home-clock')) sparkBurst(button); return timerFinish(); }
    if (button.dataset.action === 'timer-reset') return timerReset();
    if (button.dataset.action === 'exercise-hint') { const p = state.practice[button.dataset.exerciseId] || { attempts: 0 }; p.hintOpen = !p.hintOpen; if (p.hintOpen) p.hintUsed = true; state.practice[button.dataset.exerciseId] = p; saveState({ backup: false }); return renderRoute(false); }
    if (button.dataset.action === 'exercise-retry') { const p = state.practice[button.dataset.exerciseId] || {}; p.checked = false; delete p.selected; state.practice[button.dataset.exerciseId] = p; saveState({ backup: false }); return renderRoute(false); }
    if (button.dataset.action === 'guide-complete') { const id = button.dataset.guideId; state.guides[id] = { ...(state.guides[id] || {}), completed: true, completedAt: todayKey() }; state.guides[id].rewarded = true; awardHitos(); saveState(); playSuccess(); return renderRoute(false); }
    if (button.dataset.action === 'new-error') return routeTo('practice', 'errors', 'new');
    if (button.dataset.action === 'toggle-error-status') { const item = state.errors.find(e => e.id === button.dataset.errorId); if (item) { item.status = item.status === 'resolved' ? 'open' : 'resolved'; item.reviewedAt = todayKey(); saveState(); renderRoute(false); } return; }
    if (button.dataset.deleteError) return removeWithUndo(state.errors, button.dataset.deleteError, 'Error');
    if (button.dataset.openExam) return routeTo('practice', 'exams', button.dataset.openExam);
    if (button.dataset.action === 'exam-start' || button.dataset.action === 'exam-restart') { state.exams[button.dataset.examId] = { ...(state.exams[button.dataset.examId] || {}), startedAt: new Date().toISOString(), status: 'running', documentOpen: false }; saveState(); return renderRoute(false); }
    if (button.dataset.action === 'exam-finish') { const p = state.exams[button.dataset.examId] || {}; p.elapsedSeconds = Math.max(0, Math.round((Date.now() - new Date(p.startedAt).getTime()) / 1000)); p.status = 'finished'; p.finishedAt = todayKey(); state.exams[button.dataset.examId] = p; saveState(); return renderRoute(false); }
    if (button.dataset.action === 'exam-toggle-document') { const p = state.exams[button.dataset.examId] || {}; p.documentOpen = !p.documentOpen; state.exams[button.dataset.examId] = p; saveState({ backup: false }); return renderRoute(false); }
    if (button.dataset.gradeSubject) { ui.gradeSubject = button.dataset.gradeSubject; return renderRoute(false); }
    if (button.dataset.gradeGroupTab) { ui.gradeGroup = button.dataset.gradeGroupTab; return renderRoute(false); }
    if (button.dataset.action === 'add-grade-row') { gradeConfig(ui.gradeSubject).components.push({ id: uid('grade'), name: 'Nueva evaluación', group: ui.gradeGroup, weight: '', grade: '', date: '' }); saveState(); return renderRoute(false); }
    if (button.dataset.deleteGrade) return removeGrade(button.dataset.deleteGrade);
    if (button.dataset.calendarPrev !== undefined || button.dataset.calendarNext !== undefined) {
      const [year, month] = (ui.calendarMonth || todayKey().slice(0, 7)).split('-').map(Number);
      const date = new Date(year, month - 1 + (button.dataset.calendarPrev !== undefined ? -1 : 1), 1);
      ui.calendarDate = todayKey(date); ui.calendarMonth = ui.calendarDate.slice(0, 7); ui.editEventId = ''; return renderRoute(false);
    }
    if (button.dataset.calendarDay) { ui.calendarDate = button.dataset.calendarDay; ui.editEventId = ''; return renderRoute(false); }
    if (button.dataset.calendarToggle) {
      const item = state.events.find(event => event.id === button.dataset.calendarToggle);
      if (!item) return;
      item.status = item.status === 'done' ? 'planned' : 'done';
      saveState(); renderRoute(false); return;
    }
    if (button.dataset.labToggle) {
      const item = state.events.find(event => event.id === button.dataset.labToggle && event.type === 'lab');
      if (!item) return;
      item.lab = window.NexoLabPlan.normalize(item.lab);
      if (button.dataset.labStage === 'prelab') item.lab.prelab.done = !item.lab.prelab.done;
      if (button.dataset.labStage === 'report') item.lab.after.reportDone = !item.lab.after.reportDone;
      saveState(); renderRoute(false); return;
    }
    if (button.dataset.calendarEdit) { const item = state.events.find(event => event.id === button.dataset.calendarEdit); if (!item) return; ui.editEventId = item.id; ui.calendarDate = item.date; ui.calendarMonth = item.date.slice(0, 7); return renderRoute(false); }
    if (button.dataset.calendarNew !== undefined || button.dataset.calendarCancel !== undefined) { ui.editEventId = ''; return renderRoute(false); }
    if (button.dataset.calendarDelete) {
      const index = state.events.findIndex(item => item.id === button.dataset.calendarDelete); if (index < 0) return;
      const [removed] = state.events.splice(index, 1);
      const row = state.grades[removed.subject]?.components?.find(item => item.id === removed.sourceId || item.id === removed.id);
      const oldDate = row?.date; if (row) row.date = '';
      if (ui.editEventId === removed.id) ui.editEventId = '';
      saveState(); renderRoute(false); return showToast('Evento eliminado.', 'Deshacer', () => { state.events.splice(index, 0, removed); if (row) row.date = oldDate; saveState(); renderRoute(false); });
    }
    if (button.dataset.deleteEvent) return removeWithUndo(state.events, button.dataset.deleteEvent, 'Fecha');
    if (button.dataset.action === 'export-ics') return exportIcs();
    if (button.dataset.action === 'enable-notifications') return enableNotifications();
    if (button.dataset.statsRange) { ui.statsRange = button.dataset.statsRange; return renderRoute(false); }
    if (button.dataset.buyUtility) return buyUtility(button.dataset.buyUtility);
    if (button.dataset.background) { state.settings.background = button.dataset.background; saveState(); return renderRoute(false); }
    if (button.dataset.claimChallenge) return claimChallenge(button.dataset.claimChallenge);
    if (button.dataset.action === 'sync-now') return cloud.pull();
    if (button.dataset.action === 'google-login') return cloud.signInWithGoogle()
      .catch(error=>showToast(window.NexoCloudSafeError(error)));
    if (button.dataset.action === 'logout') return cloud.signOut().catch(error=>showToast(window.NexoCloudSafeError(error)));
    if (button.dataset.action === 'claim-guest') return cloud.claimGuest(loadState())
      .then(()=>{ localStorage.removeItem('nexo-claim-after-auth-v13'); renderRoute(false); showToast('Progreso académico incorporado a tu cuenta.'); })
      .catch(error=>showToast(window.NexoCloudSafeError(error)));
    if (button.dataset.action === 'export-conflicts') {
      const blob=new Blob([JSON.stringify(cloud.conflicts,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob), link=document.createElement('a');
      link.href=url; link.download='nexo-conflictos-v12.json'; link.click();
      setTimeout(()=>URL.revokeObjectURL(url),5000); return;
    }
    if (button.dataset.resolveConflict) return cloud.resolveConflict(button.dataset.resolveConflict,button.dataset.choice)
      .then(()=>{renderRoute(false);showToast('Conflicto resuelto. Ambas versiones quedaron archivadas.');})
      .catch(error=>showToast(window.NexoCloudSafeError(error)));
    if (button.dataset.action === 'delete-account') return confirmAction('Eliminar mi cuenta',
      'Se borrarán la cuenta y los datos sincronizados. Exporta antes una copia si la necesitas.',
      'Eliminar definitivamente',() => cloud.deleteAccount()
        .then(()=>{closeModal();routeTo('home');showToast('Cuenta eliminada.');})
        .catch(error=>showToast(window.NexoCloudSafeError(error))));
    if (button.dataset.action === 'export-data') return exportJson();
    if (button.dataset.action === 'import-data') return importFile.click();
    if (button.dataset.action === 'restore-backup') return restoreBackup();
    if (button.dataset.action === 'reset-app') return resetApp();
    if (button.dataset.action === 'modal-close') return closeModal();
    if (button.dataset.action === 'modal-confirm') { const action = modalConfirm; if (action) action(); return; }
    if (button.dataset.action === 'toast-action' && undoAction) { const action = undoAction; undoAction = null; return action(); }
  });

  document.addEventListener('change', event => {
    const target = event.target;
    if (target.matches('[data-event-form] select[name="type"]')) {
      const labEditor = target.closest('form').querySelector('[data-lab-editor]');
      if (labEditor) labEditor.hidden = target.value !== 'lab';
      return;
    }
    if (target.dataset.dailyGoal !== undefined) {
      state.settings.dailyGoalMinutes = clamp(Number(target.value)||120,15,600);
      saveState(); renderRoute(false); return;
    }
    if (target.id === 'timerSubject') { state.timer.subject = target.value; saveState({ backup: false }); }
    if (target.dataset.setting) { state.settings[target.dataset.setting] = target.checked; saveState(); updateChrome(); if (target.dataset.setting === 'analytics') cloud.analyticsConsent(target.checked); if (['sound','ambient','music'].includes(target.dataset.setting)) { window.NexoAudio.configure(state.settings); window.NexoAudio.activate(); } if (target.dataset.setting === 'motion') renderRoute(false); }
    if (target.dataset.performanceSetting) {
      const key=target.dataset.performanceSetting;
      const values={graphicsQuality:['auto','low','balanced','high'],particles:['none','low','high'],ambientMotion:['reduced','normal','rich'],mascotMotion:['reduced','full']};
      if(values[key]?.includes(target.value)) { state.settings[key]=target.value; saveState(); renderRoute(false); }
      return;
    }
    if (target.dataset.settingVolume !== undefined) { const key=target.dataset.settingVolume; if(['sfxVolume','ambientVolume','musicVolume'].includes(key)) { state.settings[key]=clamp(Number(target.value)/100,0,1); if(key==='sfxVolume')state.settings.volume=state.settings.sfxVolume; saveState(); window.NexoAudio.configure(state.settings); window.NexoAudio.activate(); updateChrome(); } }
    if (target.dataset.uiFilter) { ui[target.dataset.uiFilter] = target.value; renderRoute(false); }
    const exerciseForm = target.closest('[data-exercise-choice]');
    if (exerciseForm && target.name === 'answer') { const id = exerciseForm.dataset.exerciseChoice, p = state.practice[id] || { attempts: 0 }; p.selected = Number(target.value); state.practice[id] = p; saveState({ backup: false }); updateInteractiveButtons(target); }
    if (target.dataset.labCheck) { const id = target.dataset.labCheck, p = state.labs[id] || { checks: [] }; const value = Number(target.value); p.checks = target.checked ? [...new Set([...(p.checks || []), value])] : (p.checks || []).filter(item => item !== value); state.labs[id] = p; saveState({ backup: false }); }
    if (target.dataset.gradeConfig) { gradeConfig(ui.gradeSubject)[target.dataset.gradeConfig] = target.value; saveState({ backup: false }); refreshGradeResult(); }
    if (target.dataset.gradeGroup) { gradeConfig(ui.gradeSubject).groups[target.dataset.gradeGroup].minimum = target.value; saveState({ backup: false }); refreshGradeResult(); }
    if (target.dataset.gradeCourseWeight) { gradeConfig(ui.gradeSubject).groups[target.dataset.gradeCourseWeight].courseWeight = target.value; saveState({ backup: false }); refreshGradeResult(); }
    if (target.dataset.gradeRow) { const row = gradeConfig(ui.gradeSubject).components.find(item => item.id === target.dataset.gradeRow); if (row) { row[target.dataset.gradeField] = target.value; syncGradeEvent(row, ui.gradeSubject); saveState({ backup: false }); refreshGradeResult(); } }
    if (target.dataset.profileGradeId) {
      const row = gradeConfig(ui.profileSubject).components.find(item => item.id === target.dataset.profileGradeId);
      if (!row) return;
      if (target.dataset.profileGradeField === 'grade') {
        const raw = target.value.trim().replace(',', '.');
        const grade = Number(raw);
        if (raw && (!Number.isFinite(grade) || grade < 1 || grade > 7)) {
          target.value = row.grade === '' ? '' : Number(String(row.grade).replace(',', '.')).toFixed(2);
          return showToast('La nota debe estar entre 1.00 y 7.00.');
        }
        row.grade = raw ? grade.toFixed(2) : '';
        target.value = row.grade;
      } else {
        row.name = target.value.trim() || 'Nueva evaluación';
        target.value = row.name;
      }
      syncGradeEvent(row, ui.profileSubject);
      saveState();
      showToast('Nota guardada.');
    }
  });

  document.addEventListener('input', event => {
    const target = event.target;
    if (target.dataset.exerciseDraft) { const p = state.practice[target.dataset.exerciseDraft] || { attempts: 0 }; p.draft = target.value; state.practice[target.dataset.exerciseDraft] = p; saveState({ backup: false }); updateInteractiveButtons(target); }
    if (target.dataset.guideDraft) { const p = state.guides[target.dataset.guideDraft] || {}; p.draft = target.value; state.guides[target.dataset.guideDraft] = p; saveState({ backup: false }); const button = target.closest('.guide-view')?.querySelector('[data-action="guide-complete"]'); if (button) button.disabled = target.value.trim().length < 100; }
    if (target.dataset.errorSearch !== undefined) { ui.errorSearch = target.value; clearTimeout(window.__errorSearchTimer); window.__errorSearchTimer = setTimeout(() => renderRoute(false), 250); }
    if (target.dataset.examNotes) { const p = state.exams[target.dataset.examNotes] || {}; p.notes = target.value; state.exams[target.dataset.examNotes] = p; saveState({ backup: false }); }
    if (target.dataset.labDraft) { const p = state.labs[target.dataset.labDraft] || { checks: [] }; p[target.dataset.labField] = target.value; state.labs[target.dataset.labDraft] = p; saveState({ backup: false }); }
    if (target.dataset.mascotName !== undefined) { state.mascot.name = target.value.trim() || 'Nexo'; saveState({ backup: false }); }
    if (target.dataset.weeklyGoal !== undefined) { state.weeklyGoal = clamp(Number(target.value) || 300, 30, 3000); saveState({ backup: false }); }
    if (target.dataset.gradeRow) { const row = gradeConfig(ui.gradeSubject).components.find(item => item.id === target.dataset.gradeRow); if (row) { row[target.dataset.gradeField] = target.value; syncGradeEvent(row, ui.gradeSubject); saveState({ backup: false }); refreshGradeResult(); } }
    if (target.dataset.gradeConfig) { gradeConfig(ui.gradeSubject)[target.dataset.gradeConfig] = target.value; saveState({ backup: false }); refreshGradeResult(); }
    if (target.dataset.gradeGroup) { gradeConfig(ui.gradeSubject).groups[target.dataset.gradeGroup].minimum = target.value; saveState({ backup: false }); refreshGradeResult(); }
    if (target.dataset.gradeCourseWeight) { gradeConfig(ui.gradeSubject).groups[target.dataset.gradeCourseWeight].courseWeight = target.value; saveState({ backup: false }); refreshGradeResult(); }
  });

  document.addEventListener('submit', event => {
    event.preventDefault(); const form = event.target;
    if(form.dataset.rescueCase)return window.NexoAcademicRescue?.answer(form)
      .catch(()=>showToast('No se pudo guardar el intento de Rescate.'));
    if (form.dataset.structuredCase) {
      const id=form.dataset.structuredCase, checker=window.NexoAcademicStructured;
      if(!checker?.byId(id))return showToast('No se pudo comprobar este caso.');
      const answers=Object.fromEntries(new FormData(form).entries());
      const result=checker.evaluate(id,answers);
      state.organicProgress['org-01'] ||= {};
      const records=state.organicProgress['org-01'].structured ||= {};
      const previous=records[id]||{};
      if(previous.result?.outcome==='correct')return;
      const attempts=(Number(previous.attempts)||0)+1;
      if(result.outcome==='correct'&&attempts>1)result.kind='error_repaired';
      records[id]={answers,result,attempts};
      const diagnosisConcept=state.organicProgress['org-01'].activeDiagnostic;
      const diagnostic=Boolean(diagnosisConcept&&state.organicProgress['org-01'].diagnosticExerciseIds?.includes(id)&&attempts===1);
      const attemptId=uid(`structured-${id}`);
      window.NexoAcademicEngine.recordAttempt({getState:()=>state,saveState,
        track:(...args)=>cloud.track(...args)},{id:attemptId,exerciseId:`org-01:${id}`,
        structuredAnswers:answers,assistanceUsed:attempts>1,attemptNumber:attempts,
        diagnostic,diagnosticConceptId:diagnostic?diagnosisConcept:null,
        activityType:'lesson',activityId:'org-01'})
        .then(()=>{saveState();renderRoute(false);document.querySelector(`[data-structured-case="${id}"]`)?.scrollIntoView({block:'center'});})
        .catch(()=>showToast('No se pudo guardar la corrección. Inténtalo de nuevo.'));
      return;
    }
    if (form.dataset.exerciseChoice) return recordChoiceExercise(EXERCISES.find(item => item.id === form.dataset.exerciseChoice), form);
    if (form.dataset.exerciseText) return recordTextExercise(EXERCISES.find(item => item.id === form.dataset.exerciseText));
    if (form.dataset.errorForm !== undefined) return saveErrorForm(form);
    if (form.dataset.eventForm !== undefined) return saveEventForm(form);
    if (form.dataset.absenceForm !== undefined) {
      const values = new FormData(form);
      const date = String(values.get('date') || '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || todayKey(parseDay(date)) !== date) return showToast('Revisa la fecha.');
      state.absences.push({ id: uid('absence'), subject: ui.absenceSubject, group: values.get('group') === 'lab' ? 'lab' : 'theory', date });
      saveState(); renderRoute(false); return showToast('Inasistencia guardada.');
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modalRoot.innerHTML) return closeModal();
    if (event.key === 'Escape' && app.querySelector('.perfil-seccion')) return routeTo('profile');
    const tabs = event.target.closest('[role="tablist"]');
    if (tabs && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      const list = [...tabs.querySelectorAll('[role="tab"]:not([disabled])')], index = list.indexOf(event.target); if (index < 0) return;
      event.preventDefault(); const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? list.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length; list[nextIndex].focus(); list[nextIndex].click();
    }
    const modal = modalRoot.querySelector('[data-modal-panel]');
    if (modal && event.key === 'Tab') {
      const focusable = [...modal.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])')];
      if (!focusable.length) return event.preventDefault();
      const first = focusable[0], last = focusable.at(-1);
      if (!modal.contains(document.activeElement) || document.activeElement === modal) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  function removeGrade(id, subjectId = ui.gradeSubject) {
    const rows = gradeConfig(subjectId).components, index = rows.findIndex(item => item.id === id); if (index < 0) return;
    const [row] = rows.splice(index, 1);
    const linked = state.events.find(event => event.sourceId === id);
    state.events = state.events.filter(event => event.sourceId !== id);
    saveState(); renderRoute(false); showToast('Evaluación eliminada.', 'Deshacer', () => {
      rows.splice(index, 0, row);
      if (linked) state.events.push(linked);
      saveState(); renderRoute(false);
    });
  }
  function buyUtility(id) {
    const item = reward(id); if (!item || state.coins < item.price) return;
    if (cloud.authenticated) {
      if (item.kind !== 'feature') return showToast('Los consumibles requieren validación del servidor y están pausados para cuentas.');
      return cloud.purchase(id).then(() => {
        state.coins=cloud.balance; state.inventory=[...cloud.inventory]; saveState(); playSuccess();
        renderRoute(false); showToast(`${item.name} adquirido.`);
      }).catch(error=>showToast(window.NexoCloudSafeError(error)));
    }
    if (item.kind === 'feature') { if (state.inventory.includes(id)) return; state.coins -= item.price; state.inventory.push(id); }
    else { if (state.boosts.streakShields >= 2) return; state.coins -= item.price; state.boosts.streakShields += 1; }
    saveState(); playSuccess(); renderRoute(false); showToast(`${item.name} adquirido.`);
  }
  function claimChallenge(id) {
    if (cloud.authenticated) return showToast('Las recompensas de desafíos requieren validación del servidor y están pausadas para cuentas.');
    const item = challengeDefinitions().find(challenge => challenge.id === id); if (!item || item.value < item.target || state.claimedChallenges.includes(challengeKey(item))) return;
    state.claimedChallenges.push(challengeKey(item)); state.coins += item.reward; state.xp += item.reward; saveState(); playSuccess(); renderRoute(false); showToast(`Desafío verificado · +${item.reward} átomos.`);
  }
  function restoreBackup() {
    if (cloud.authenticated) return showToast('Exporta tu cuenta e importa datos académicos. El respaldo local no reemplaza compras ni saldo cloud.');
    const raw = storage.getItem(BACKUP_KEY); if (!raw) return;
    confirmAction('Restaurar copia automática', 'El estado actual será reemplazado por la copia anterior. Antes se conservará como respaldo recuperable.', 'Restaurar', () => {
      try { const parsed = JSON.parse(raw); if (!isValidImport(parsed)) throw new Error('invalid'); const current = storage.getItem(STORAGE_KEY); if (current) storage.setItem(BACKUP_KEY, current); state = normalizeState(window.NexoMigrations.migrate(parsed, SCHEMA_VERSION)); saveState({ backup: true }); closeModal(); routeTo('home'); showToast('Copia restaurada.'); } catch (_) { closeModal(); showToast('La copia automática no es válida.'); }
    });
  }
  function resetApp() {
    if (cloud.authenticated) return showToast('Para borrar los datos sincronizados utiliza “Eliminar mi cuenta”.');
    confirmAction('Borrar todo el progreso', 'Se reiniciarán sesiones, clases, errores, notas, calendario, inventario y mascota. La copia actual quedará disponible como respaldo.', 'Sí, borrar todo', () => {
      const current = storage.getItem(STORAGE_KEY); if (current) storage.setItem(BACKUP_KEY, current); state = defaultState(); saveState({ backup: false }); storage.flush(); closeModal(); routeTo('home'); showToast('La app volvió a su estado inicial.');
    });
  }
  function toggleMore(button) {
    const sheet = document.querySelector('#moreSheet'), open = sheet.hidden;
    sheet.hidden = !open; button.setAttribute('aria-expanded', String(open)); if (open) sheet.querySelector('button')?.focus();
  }
  function closeMore() {
    const sheet = document.querySelector('#moreSheet'), button = document.querySelector('[data-action="toggle-more"]');
    if (sheet) sheet.hidden = true; if (button) button.setAttribute('aria-expanded', 'false');
  }

  importFile.addEventListener('change', async () => {
    const file = importFile.files?.[0]; if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()); if (!isValidImport(parsed)) throw new Error('invalid');
      const current = storage.getItem(STORAGE_KEY); if (current) storage.setItem(BACKUP_KEY, current);
      if (cloud.authenticated) {
        parsed.coins=cloud.balance; parsed.inventory=[...cloud.inventory];
        await cloud.importAcademic(parsed);
        showToast('Datos académicos importados. El saldo y las compras protegidas no cambian.');
      } else { state = normalizeState(parsed); saveState({ backup: false }); routeTo('home'); showToast('Progreso importado correctamente.'); }
    } catch (_) { showToast('Ese archivo no parece un respaldo válido de Nexo.'); }
    importFile.value = '';
  });

  function registerWebMcpTools() {
    const context = document.modelContext; if (!context?.registerTool) return;
    const safeSubject = id => { if (!SUBJECTS.some(s => s.id === id)) throw new Error('Ramo desconocido'); return id; };
    Promise.resolve(context.registerTool({ name: 'get_study_overview', title: 'Ver panorama de estudio', description: 'Devuelve minutos, repasos vencidos y errores abiertos sin modificar datos.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true }, execute() { return { todayMinutes: Math.round(state.sessions.filter(s => s.date === todayKey()).reduce((sum, s) => sum + sessionSeconds(s), 0) / 60), dueReviews: dueReviews().map(([id]) => ({ id, title: LESSONS[id].title })), openErrors: state.errors.filter(e => e.status !== 'resolved').length }; } })).catch(() => {});
    Promise.resolve(context.registerTool({ name: 'record_study_session', title: 'Registrar sesión de estudio', description: 'Registra manualmente una sesión entre 5 y 240 minutos. Solo el cronómetro verificado entrega átomos.', inputSchema: { type: 'object', properties: { subject: { type: 'string', enum: SUBJECTS.map(s => s.id) }, minutes: { type: 'integer', minimum: 5, maximum: 240 }, mode: { type: 'string', enum: ['Comprender', 'Practicar', 'Simulacro', 'Laboratorio'] } }, required: ['subject', 'minutes', 'mode'], additionalProperties: false }, annotations: { readOnlyHint: false }, execute(input) { safeSubject(input.subject); const seconds = input.minutes * 60; state.sessions.unshift({ id: uid('session'), date: todayKey(), subject: input.subject, mode: input.mode, seconds, source: 'manual' }); saveState(); renderRoute(false); return { saved: true, coinsEarned: 0 }; } })).catch(() => {});
    Promise.resolve(context.registerTool({ name: 'log_study_error', title: 'Registrar error de estudio', description: 'Guarda un error observable y genera una hipótesis local de corrección.', inputSchema: { type: 'object', properties: { subject: { type: 'string', enum: SUBJECTS.map(s => s.id) }, observable: { type: 'string', minLength: 5 }, reasoning: { type: 'string', minLength: 5 }, blocker: { type: 'string', enum: ['first_step', 'formula', 'interpretation', 'concept', 'attention'] } }, required: ['subject', 'observable', 'reasoning', 'blocker'], additionalProperties: false }, annotations: { readOnlyHint: false }, execute(input) { safeSubject(input.subject); const error = { id: uid('error'), date: todayKey(), ...input, diagnosis: diagnoseError(input), status: 'open', dueAt: todayKey(addDays(new Date(), 1)), source: 'assistant' }; state.errors.unshift(error); saveState(); renderRoute(false); return { saved: true, errorId: error.id, diagnosis: error.diagnosis }; } })).catch(() => {});
  }

  applyStreakProtection();
  window.NexoAmbientTime.start();
  window.NexoAmbientEvents.start();
  window.NexoPerformance.start();
  window.NexoActiveStudy.configure({getState:()=>state,saveState,
    startCloudFocus:id=>cloud.startAcademicFocus(id),
    pingCloudFocus:id=>cloud.pingAcademicFocus(id),
    finishCloudFocus:id=>cloud.finishAcademicFocus(id)});
  updateChrome();
  window.addEventListener('hashchange', () => renderRoute());
  if (!location.hash) history.replaceState(null, '', '#/home');
  renderRoute(false);
  registerWebMcpTools();
  cloud.init({
    getDefault: defaultState,
    getCurrent: () => state,
    onState(next,{cached}={}) {
      state=normalizeState(next); updateChrome(); renderRoute(false);
      const volver = sessionStorage.getItem('nexo-google-return');
      if (!cached && cloud.authenticated && volver) {
        sessionStorage.removeItem('nexo-google-return');
        routeTo(...volver.split('/'));
      }
      marcarCloudListo();
      let claim=null;
      try { claim=JSON.parse(localStorage.getItem('nexo-claim-after-auth-v13')||'null'); } catch (_) {}
      if (!cached && cloud.claimMatches(claim)
        && storage.getItem(STORAGE_KEY)) {
        cloud.claimGuest(loadState()).then(()=>{
          localStorage.removeItem('nexo-claim-after-auth-v13');
          renderRoute(false);showToast('Tu progreso académico ya está en tu cuenta.');
        })
          .catch(error=>showToast(window.NexoCloudSafeError(error)));
      }
      cloud.analyticsConsent(Boolean(state.settings.analytics));
    },
    onGuest() { state=loadState(); cloud.analyticsConsent(Boolean(state.settings.analytics)); updateChrome(); renderRoute(false); marcarCloudListo(); },
    onStatus(info) {
      const node=document.querySelector('#syncStatus');
      if (node) node.textContent=info.status==='synced'?'✓ Sincronizado':
        info.status==='syncing'?'☁ Sincronizando…':
        info.status==='conflict'?'⚠ Conflicto: ambas versiones conservadas':
        info.status==='failed'?'⚠ Pendiente de conexión':
        info.status==='pending'?'☁ Guardado localmente · pendiente':'En este dispositivo';
    }
  }).catch(()=>{}).finally(marcarCloudListo);
  setTimeout(marcarCloudListo, 4000); // sin red o con la nube lenta, no dejar la puerta cerrada
  cloud.track('app_opened');
})();
