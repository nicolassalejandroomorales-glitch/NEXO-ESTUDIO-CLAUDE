/* V14 pilot metadata: mapped only to statements and exercises already in org-01. */
(() => {
  'use strict';
  const course={id:'organica',title:'Química Orgánica II',version:1};
  const lesson={id:'org-01',courseId:course.id,title:'Aminas: protonación y basicidad',version:1};
  const concepts=[
    ['org.lone-pair','Pares libres y carga','Distinguir un par disponible y la carga de N al protonar.'],
    ['org.protonation','Protonación de aminas','Comparar B y BH⁺ y dibujar el nuevo enlace N–H.'],
    ['org.aromatic-pair','Par de N en heterociclos aromáticos','Distinguir el par piridínico del pirrólico en un sexteto π.'],
    ['org.resonance','Conjugación del par libre','Reconocer cuándo un camino continuo de orbitales permite deslocalización.'],
    ['org.basicity','Basicidad relativa','Justificar tendencias considerando base y ácido conjugado en un mismo medio.'],
    ['org.induction','Efecto inductivo','Seguir polarización por enlaces σ y distinguirla de resonancia.'],
    ['org.substituent','Sustituyentes y densidad electrónica','Separar efectos compartidos de los que discriminan anilinas.'],
    ['org.pka','pKa del ácido conjugado','Usar el sentido de pKa sin invertir una comparación de basicidad.'],
    ['org.alkylation','Alquilación de aminas','Seguir cada sustitución con CH₃I hasta el amonio cuaternario.'],
    ['org.hofmann','Eliminación de Hofmann','Pasar de un amonio cuaternario al alqueno y la amina, eligiendo el H β.']
  ].map(([id,title,description])=>({id,courseId:course.id,lessonIds:[lesson.id],title,description,version:1,tags:['aminas'],active:true}));
  const skills=['identify','draw','compare','justify','predict','calculate','transfer'].map(id=>({id,title:{identify:'Identificar',draw:'Dibujar',compare:'Comparar',justify:'Justificar',predict:'Predecir',calculate:'Calcular',transfer:'Transferir'}[id],version:1}));
  const prerequisites=[
    ['org.lone-pair','org.protonation','required'],['org.lone-pair','org.resonance','required'],
    ['org.lone-pair','org.aromatic-pair','required'],['org.resonance','org.basicity','recommended'],
    ['org.protonation','org.basicity','required'],['org.aromatic-pair','org.basicity','recommended'],
    ['org.induction','org.substituent','required'],['org.substituent','org.basicity','recommended'],
    ['org.pka','org.basicity','recommended'],
    ['org.protonation','org.alkylation','required'],['org.alkylation','org.hofmann','required']
  ].map(([from,to,strength])=>({from,to,strength}));
  // Banco del motor de estudio (dist/study/content.js): habilidad → conceptos y actividades [id local:nivel].
  const studyBank={pair:{concepts:['org.lone-pair'],items:['pair-1:1','pair-2:2','pair-3:2','pair-4:3']},
    resonance:{concepts:['org.resonance','org.basicity'],items:['res-1:1','res-2:2','res-3:2','res-4:3','res-5:2','res-6:2','res-7:3','res-8:3']},
    pka:{concepts:['org.pka','org.basicity'],items:['pka-1:1','pka-2:2','pka-3:2','pka-4:3']},
    protonation:{concepts:['org.protonation','org.lone-pair'],items:['prot-1:1','prot-2:2','prot-3:2','prot-4:3']},
    alkylation:{concepts:['org.alkylation','org.protonation'],items:['alk-1:1','alk-2:2','alk-3:2','alk-4:3','alk-5:3']},
    hofmann:{concepts:['org.hofmann','org.alkylation'],items:['hof-1:1','hof-2:2','hof-3:2','hof-4:3','hof-5:3','hof-6:3','hof-7:3','hof-8:3']}};
  const families=[
    {id:'org.protonation.charge',conceptIds:['org.protonation','org.lone-pair'],skillIds:['draw','identify'],difficulty:1,generatorType:'curated'},
    {id:'org.heterocycle.pair',conceptIds:['org.aromatic-pair','org.basicity'],skillIds:['identify','justify'],difficulty:2,generatorType:'curated'},
    {id:'org.basicity.resonance',conceptIds:['org.resonance','org.basicity'],skillIds:['compare','justify'],difficulty:2,generatorType:'curated'},
    {id:'org.basicity.substituent',conceptIds:['org.substituent','org.basicity'],skillIds:['compare','justify'],difficulty:2,generatorType:'curated'},
    {id:'org.basicity.induction',conceptIds:['org.induction','org.basicity'],skillIds:['compare','justify'],difficulty:2,generatorType:'curated'},
    {id:'org.basicity.integrated',conceptIds:['org.basicity','org.resonance','org.induction'],skillIds:['transfer','justify'],difficulty:3,generatorType:'curated'},
    {id:'org.heterocycle.transfer',conceptIds:['org.aromatic-pair','org.basicity'],skillIds:['identify','justify','transfer'],difficulty:3,generatorType:'curated'},
    {id:'org.pka.equilibrium',conceptIds:['org.pka','org.basicity'],skillIds:['calculate','predict'],difficulty:3,generatorType:'curated'}
  ].concat(Object.entries(studyBank).map(([skill,row])=>({id:`org.study.${skill}`,conceptIds:row.concepts,
    skillIds:['identify','justify'],difficulty:2,generatorType:'curated'})))
  .map(f=>({...f,version:1,validator:f.id.startsWith('org.study.')?'study_bank':'self_rubric',misconceptionIds:[],active:true,
    transferLevel:f.difficulty===3?'novel_context':'standard',examStyle:f.difficulty===3}));
  const misconceptions=[
    ['org.charge.disappears','L-CARGA','Olvidar el H nuevo o la carga positiva del N protonado.'],
    ['org.pyridine-pyrrole.same-pair','AR-PAR','Tratar el par piridínico y el pirrólico como equivalentes.'],
    ['org.resonance.crosses-sp3','RES-CAMINO','Extender conjugación del par a través de un CH₂ sp³.'],
    ['org.methoxy.only-inductive','SUB-EFECTO','Omitir la donación por resonancia del metoxi al comparar anilinas.'],
    ['org.aromaticity.absolute-rule','AR-ABSOLUTO','Usar «aromático» como regla universal de basicidad.'],
    ['org.pka.inverted','PKA-SIGNO','Invertir la dirección del pKa al comparar bases.'],
    ['org.induction-is-resonance','IND-RESONANCIA','Llamar resonancia a un efecto transmitido por enlaces σ.']
  ].map(([id,legacyCode,feedback])=>({id,legacyCode,feedback,version:1,classification:'requires_explicit_evidence'}));
  const mapping={b01:'org.protonation.charge',b02:'org.heterocycle.pair',b03:'org.basicity.resonance',
    b04:'org.basicity.substituent',b05:'org.heterocycle.pair',b06:'org.basicity.integrated',
    b07:'org.basicity.integrated',b08:'org.pka.equilibrium',b09:'org.basicity.resonance',
    b10:'org.basicity.induction',b11:'org.heterocycle.pair',variant:'org.heterocycle.pair',
    transfer:'org.basicity.integrated',
    'sv-protonation':'org.protonation.charge','sv-heterocycle':'org.heterocycle.pair',
    'sv-resonance':'org.basicity.resonance','sv-induction':'org.basicity.induction',
    'sv-pka':'org.pka.equilibrium','sv-pep-order':'org.basicity.integrated',
    'sv-pep-hetero':'org.heterocycle.transfer'};
  const misconceptionByExercise={b01:'org.charge.disappears',b02:'org.pyridine-pyrrole.same-pair',
    b03:'org.resonance.crosses-sp3',b04:'org.methoxy.only-inductive',
    b05:'org.pyridine-pyrrole.same-pair',b06:'org.aromaticity.absolute-rule',
    b08:'org.pka.inverted',b10:'org.induction-is-resonance'};
  const responseTypes=['multiple_choice','numeric','math_expression','chemical_structure',
    'ordering','matching','structured_reasoning','structured_fields','short_text','diagram'];
  const studyExercises=Object.entries(studyBank).flatMap(([skill,row])=>row.items.map(entry=>{
    const [local,level]=entry.split(':'),family=`org.study.${skill}`;
    return {id:`org-01:study-${local}`,lessonId:lesson.id,familyId:family,conceptIds:row.concepts,
      skillIds:['identify','justify'],difficulty:Number(level),expectedResponseType:'structured_fields',
      validator:'study_bank',version:1,active:true,misconceptionIds:[],examStyle:Number(level)===3,
      transfer:Number(level)===3};
  }));
  const exercises=Object.entries(mapping).map(([localId,familyId])=>({
    id:`org-01:${localId}`,lessonId:lesson.id,familyId,
    conceptIds:families.find(f=>f.id===familyId).conceptIds,
    skillIds:families.find(f=>f.id===familyId).skillIds,
    difficulty:families.find(f=>f.id===familyId).difficulty,
    expectedResponseType:localId.startsWith('sv-')?'structured_fields':'structured_reasoning',
    validator:localId.startsWith('sv-')?'structured_validator':'self_rubric',version:1,active:true,
    misconceptionIds:misconceptionByExercise[localId]?[misconceptionByExercise[localId]]:[],
    examStyle:['b07','b08','transfer','sv-pka','sv-pep-order','sv-pep-hetero'].includes(localId),
    transfer:['b05','b06','b07','transfer','sv-pka','sv-pep-order','sv-pep-hetero'].includes(localId)
  })).concat(studyExercises);
  const sources=[
    {id:'org01.lecture-pair',type:'ppt',title:'Aminas · cátedra 2025',location:{page:5,topic:'reactividad del par libre'},url:null,private:true,authority:'course_official',version:1},
    {id:'org01.lecture-acid-base',type:'ppt',title:'Aminas · cátedra 2025',location:{pageStart:17,pageEnd:20,topic:'protonación y pKa'},url:null,private:true,authority:'course_official',version:1},
    {id:'org01.lecture-resonance',type:'ppt',title:'Aminas · cátedra 2025',location:{pageStart:22,pageEnd:25,topic:'resonancia y sustituyentes'},url:null,private:true,authority:'course_official',version:1},
    {id:'org01.lecture-heterocycles',type:'ppt',title:'Aminas · cátedra 2025',location:{pageStart:26,pageEnd:27,topic:'pirrol, piridina e hibridación'},url:null,private:true,authority:'course_official',version:1},
    {id:'org01.guide-oficial',type:'guide',title:'Guía oficial: Aminas · Orgánica II, QyF',location:{page:2,exercise:3,topic:'metilación exhaustiva y Hofmann'},url:'https://drive.google.com/file/d/1SYyxKMpPfSisVN9nIKomUt7Zmeae6LbQ/view',private:false,authority:'course_official',version:1},
    {id:'org01.guide-1a',type:'guide',title:'Guía de aminas · edición 2021 (en Classroom)',location:{page:1,exercise:4},url:null,private:true,authority:'supplementary',version:1},
    {id:'openstax.amines-basicity',type:'web',title:'OpenStax · Basicity of Amines §24.3',location:{section:'24.3'},url:'https://openstax.org/books/organic-chemistry/pages/24-3-basicity-of-amines',private:false,authority:'supplementary',version:1},
    {id:'openstax.arylamines',type:'web',title:'OpenStax · Basicity of Arylamines §24.4',location:{section:'24.4'},url:'https://openstax.org/books/organic-chemistry/pages/24-4-basicity-of-arylamines',private:false,authority:'supplementary',version:1},
    {id:'openstax.heterocycles',type:'web',title:'OpenStax · Heterocyclic Amines §24.9',location:{section:'24.9'},url:'https://openstax.org/books/organic-chemistry/pages/24-9-heterocyclic-amines',private:false,authority:'supplementary',version:1}
  ];
  const conceptSources=[
    ['org.lone-pair','org01.lecture-pair'],
    ['org.protonation','org01.lecture-acid-base'],['org.pka','org01.lecture-acid-base'],
    ['org.basicity','org01.lecture-acid-base'],['org.basicity','org01.guide-1a'],
    ['org.basicity','openstax.amines-basicity'],
    ['org.resonance','org01.lecture-resonance'],['org.resonance','openstax.arylamines'],
    ['org.induction','org01.lecture-resonance'],['org.substituent','org01.lecture-resonance'],
    ['org.alkylation','org01.guide-oficial'],['org.hofmann','org01.guide-oficial'],
    ['org.aromatic-pair','org01.lecture-heterocycles'],['org.aromatic-pair','openstax.heterocycles']
  ].map(([conceptId,sourceId])=>({conceptId,sourceId}));
  for(const exercise of exercises)exercise.sourceIds=[...new Set(conceptSources
    .filter(link=>exercise.conceptIds.includes(link.conceptId)).map(link=>link.sourceId))];
  const byId=(list,id)=>list.find(item=>item.id===id)||null;
  function validate() {
    const ids=list=>new Set(list.map(x=>x.id));
    for(const list of [concepts,skills,families,misconceptions,exercises,sources])
      if(ids(list).size!==list.length||list.some(x=>!x.id||!Number.isInteger(x.version)))throw new Error('duplicate_or_unversioned_id');
    for(const edge of prerequisites)if(!byId(concepts,edge.from)||!byId(concepts,edge.to)||!['required','recommended'].includes(edge.strength))throw new Error('unknown_prerequisite');
    for(const family of families)if(family.conceptIds.some(id=>!byId(concepts,id))||family.skillIds.some(id=>!byId(skills,id)))throw new Error('invalid_family');
    for(const exercise of exercises)if(!byId(families,exercise.familyId)||
      exercise.conceptIds.some(id=>!byId(concepts,id))||exercise.skillIds.some(id=>!byId(skills,id))||
      exercise.misconceptionIds.some(id=>!byId(misconceptions,id))||
      exercise.sourceIds.some(id=>!byId(sources,id))||
      !responseTypes.includes(exercise.expectedResponseType))throw new Error('invalid_exercise');
    for(const link of conceptSources)if(!byId(concepts,link.conceptId)||!byId(sources,link.sourceId))throw new Error('invalid_source_link');
    return true;
  }
  for(const family of families)family.misconceptionIds=[...new Set(exercises.filter(x=>x.familyId===family.id)
    .flatMap(x=>x.misconceptionIds))];
  /* Las clases amplían el catálogo al reproducirse (academic/class-bridge.js). Lo repetido se ignora; si el
     resultado no valida, se deshace todo. "revision" avisa al motor para reconstruir el grafo de prerrequisitos. */
  function extend(patch) {
    const lists={concepts,prerequisites,families,misconceptions,exercises,sources,conceptSources};
    const key=(name,x)=>name==='prerequisites'?`${x.from}>${x.to}`:name==='conceptSources'?`${x.conceptId}>${x.sourceId}`:x.id;
    const added=[];
    for(const [name,items] of Object.entries(patch))if(lists[name])for(const item of items){
      const list=lists[name];
      if(list.some(x=>key(name,x)===key(name,item)))continue;
      list.push(item);added.push([list,item]);
    }
    if(!added.length)return false;
    try {validate();window.NexoPrerequisites?.create(concepts,prerequisites);} catch (error) {
      for(const [list,item] of added.reverse())list.splice(list.lastIndexOf(item),1);
      throw error;
    }
    model.revision+=1;return true;
  }
  const model={course,lesson,concepts,skills,prerequisites,families,misconceptions,exercises,
    responseTypes,sources,conceptSources,byId,validate,extend,revision:0};
  window.NexoAcademicModel=model;
})();
