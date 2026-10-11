/* Orgánica II · PEP 1 · Aminas. Borrador de la Misión 1 (el par libre).
   Fuente: diapositivas de cátedra "Aminas", Dr. Javier Echeverría, USACH 2025-2S (diap. 2, 5 y 11),
   y el apunte propio "1.1 Compuestos nitrogenados - Aminas" (Obsidian). Las demás misiones se agregan aquí. */
(() => {
  'use strict';
  const SRC = 'catedra-aminas';
  const misconceptions = {
    'carbon-rule': {
      label: 'Clasificaste por el carbono, como en los alcoholes',
      why: 'En los alcoholes se mira el carbono que lleva el –OH. En las aminas no: se cuentan los grupos de carbono unidos directamente al nitrógeno.',
      prereq: { title: 'Qué es una amina y cómo se clasifica', mission: 'm1', block: 'b1' }
    },
    'count-groups': {
      label: 'Contaste mal los grupos unidos al N',
      why: 'Marca el N y cuenta solo los enlaces N–C. Cada grupo R unido al N suma uno; los H no cuentan.',
      prereq: { title: 'Qué es una amina y cómo se clasifica', mission: 'm1', block: 'b1' }
    },
    'nh-acid': {
      label: 'Confundiste quién acepta el protón',
      why: 'Una base acepta un H⁺ usando un par de electrones. Los H del N no aceptan nada: lo que usa la amina es su par libre.',
      prereq: { title: 'El par libre: base y nucleófilo', mission: 'm1', block: 'b2' }
    },
    'flat-n': {
      label: 'Olvidaste que el par libre ocupa espacio',
      why: 'El N es sp³: tiene 3 enlaces y 1 par libre en 4 orbitales. El par libre empuja a los enlaces y la forma queda piramidal, no plana.',
      prereq: { title: 'Hibridación sp³ (Orgánica I)', mission: 'm1', block: 'b3' }
    },
    'tetra-shape': {
      label: 'Mezclaste la forma de los electrones con la forma de la molécula',
      why: 'Los 4 pares (3 enlaces + 1 libre) se ordenan en tetraedro, pero la forma de la molécula se describe solo con los átomos: queda una pirámide trigonal de unos 108°.',
      prereq: { title: 'Hibridación sp³ (Orgánica I)', mission: 'm1', block: 'b3' }
    },
    'n-binds-cl': {
      label: 'Confundiste base con nucleófilo',
      why: 'Frente a HCl la amina actúa como base: su par libre capta el H⁺ y queda un ion amonio con el Cl⁻ como contraión. No se forma un enlace N–Cl.',
      prereq: { title: 'El par libre: base y nucleófilo', mission: 'm1', block: 'b2' }
    },
    'lone-pair-not-group': {
      label: 'El par libre sí cuenta como cuarto "grupo"',
      why: 'Con tres grupos distintos más el par libre, el N es un centro quiral. El problema no es ese: es que la inversión piramidal es tan rápida que los enantiómeros se convierten uno en otro.',
      prereq: { title: 'Geometría del nitrógeno', mission: 'm1', block: 'b3' }
    },
    'neutral-in-acid': {
      label: 'Olvidaste que en medio ácido la amina se protona',
      why: 'Con muchos H⁺ alrededor, el par libre de la amina capta uno: la forma mayoritaria es el ion amonio R–NH₃⁺.',
      prereq: { title: 'El par libre: base y nucleófilo', mission: 'm1', block: 'b2' }
    }
  };


  const NH3_SVG = `<svg viewBox="0 0 200 130" role="img" aria-label="Estructura de Lewis del amoníaco: N con tres enlaces a H y un par libre arriba" class="cr-svg">
    <g fill="currentColor" font-family="Georgia, serif" font-size="26" text-anchor="middle">
      <text x="100" y="78">N</text><text x="35" y="78">H</text><text x="165" y="78">H</text><text x="100" y="124">H</text></g>
    <g stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="50" y1="69" x2="85" y2="69"/><line x1="115" y1="69" x2="150" y2="69"/><line x1="100" y1="84" x2="100" y2="102"/></g>
    <g fill="#b0721a"><circle cx="92" cy="40" r="5"/><circle cx="108" cy="40" r="5"/></g>
    <text x="140" y="30" font-size="13" fill="#8a5d17" font-family="sans-serif">par libre</text></svg>`;
  const PROTON_SVG = `<svg viewBox="0 0 420 130" role="img" aria-label="Protonación: el amoníaco usa su par libre para captar un H+ y forma el ion amonio con carga +1" class="cr-svg">
    <g fill="currentColor" font-family="Georgia, serif" font-size="22" text-anchor="middle">
      <text x="70" y="72">N</text><text x="22" y="72">H</text><text x="118" y="72">H</text><text x="70" y="116">H</text>
      <text x="170" y="72">+</text><text x="205" y="72">H⁺</text><text x="245" y="72">→</text>
      <text x="335" y="72">N</text><text x="290" y="72">H</text><text x="380" y="72">H</text><text x="335" y="116">H</text><text x="335" y="28">H</text>
      <text x="405" y="36" font-size="20">+</text></g>
    <g stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="33" y1="64" x2="58" y2="64"/><line x1="82" y1="64" x2="107" y2="64"/><line x1="70" y1="78" x2="70" y2="96"/>
      <line x1="301" y1="64" x2="323" y2="64"/><line x1="347" y1="64" x2="369" y2="64"/><line x1="335" y1="78" x2="335" y2="96"/><line x1="335" y1="34" x2="335" y2="50"/></g>
    <g fill="#b0721a"><circle cx="63" cy="40" r="4"/><circle cx="77" cy="40" r="4"/></g>
    <path d="M80 34 C 120 6, 175 10, 196 50" fill="none" stroke="#b0721a" stroke-width="2" marker-end="url(#crArrow)"/>
    <defs><marker id="crArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#b0721a"/></marker></defs></svg>`;

  const choice = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });

  window.NexoClasses = window.NexoClasses || {};
  window.NexoClasses['org-01'] = {
    id: 'org-01',
    subject: 'organica',
    title: 'Aminas',
    evaluation: 'PEP 1',
    status: 'borrador',
    /* Meta de la clase: los puntos de la prueba que esta clase te prepara a asegurar (pauta PEP 1 2025,
       dist/assets/exams/13_org2_pep1_2025_aminas_aromaticos.jpg). Un punto cuenta cuando aciertas sin ayuda
       el caso estilo prueba (transferencia) de las misiones que lo preparan. */
    goal: {
      total: 15,
      text: 'Asegurar los 6 puntos de Aminas de la PEP 1',
      questions: [
        { id: 'P3', label: 'Ordenar por basicidad', points: 1, missions: ['m4', 'm5'] },
        { id: 'P4', label: 'Proponer aminas y reactivos', points: 3, missions: ['m6', 'm7'] },
        { id: 'P6', label: 'Predecir productos (Gabriel, Hofmann)', points: 2, missions: ['m6', 'm7'] }
      ],
      rest: [{ label: 'Aromáticos (P1, P2 y P5)', points: 9, note: 'clase en preparación' }]
    },
    sources: {
      [SRC]: { title: 'Clase de cátedra · Aminas', author: 'Dr. Javier Echeverría', detail: 'Química Orgánica II, USACH, 2025-2S', authority: 'Material oficial del curso' }
    },
    misconceptions,
    glossary: [
      { term: 'Electrones de valencia', mission: 'm1', def: 'Los electrones de la capa más externa; son los que forman enlaces. El N (grupo 15) tiene 5.',
        simple: 'Son los electrones «de afuera» del átomo, los únicos que participan cuando se une con otros. El N tiene 5: usa 3 para enlazarse y le sobran 2.',
        simpler: 'Si el átomo fuera una persona, los electrones de valencia serían sus manos: con ellas se toma de la mano con otros átomos.' },
      { term: 'Par libre', mission: 'm1', def: 'Dos electrones de un mismo átomo que no forman enlace. En el N de una amina hay uno.',
        simple: 'Son 2 electrones del N que no están unidos a nada. Como están libres, el N los puede usar para agarrar algo nuevo, como un H⁺.',
        simpler: 'Es una mano libre del nitrógeno. Con esa mano agarra cosas: por eso las aminas reaccionan.' },
      { term: 'Base de Brønsted', mission: 'm1', def: 'Especie que acepta un protón (H⁺). Para hacerlo entrega un par de electrones.',
        simple: 'Una base es algo que atrapa un H⁺. La amina lo atrapa con su par libre.',
        simpler: 'El H⁺ es una pelota que anda suelta; la base es quien la atrapa.' },
      { term: 'Ácido conjugado', mission: 'm1', def: 'Lo que queda cuando una base captó su H⁺. El de una amina es un ion amonio (R–NH₃⁺).',
        simple: 'Cuando la amina atrapa el H⁺ se transforma en ion amonio (R–NH₃⁺). Esa forma «con el H⁺ puesto» es su ácido conjugado, porque ahora podría devolverlo.',
        simpler: 'Es la amina después de atrapar la pelota. Si la suelta, vuelve a ser amina.' },
      { term: 'Nucleófilo', mission: 'm1', def: 'Especie que usa un par de electrones para atacar un átomo pobre en electrones, normalmente un carbono δ+.',
        simple: 'Algo rico en electrones que busca un átomo con carga positiva parcial (δ+), casi siempre un carbono, para formar un enlace nuevo.',
        simpler: '«Nucleófilo» significa «amante de núcleos», o sea, de lo positivo: va directo a lo positivo como un imán.' },
      { term: 'Grupo R (alquilo / arilo)', mission: 'm1', def: 'Cualquier grupo de carbono: metilo CH₃–, etilo CH₃CH₂–, fenilo C₆H₅– (arilo, un anillo aromático).',
        simple: 'La R es un comodín: significa «aquí va algún grupo de carbonos». Puede ser una cadena (alquilo) o un anillo aromático (arilo).',
        simpler: 'Es como la «x» en matemáticas: R puede ser cualquier pedazo de carbono.' },
      { term: 'Hibridación sp³', mission: 'm1', def: 'Cuatro grupos de electrones alrededor de un átomo se ordenan en tetraedro (unos 109,5°).',
        simple: 'Cuando el N tiene 4 cosas alrededor (3 enlaces y su par libre), se ordenan lo más lejos posible entre sí y forman un tetraedro, una pirámide de base triangular.',
        simpler: 'Son 4 globos amarrados a un mismo punto: solos se acomodan apuntando en 4 direcciones distintas.' },
      { term: 'Quiral', mission: 'm1', def: 'Que no se puede superponer con su imagen en el espejo, como tus manos.',
        simple: 'Una molécula es quiral cuando su reflejo en el espejo es distinto a ella y no hay forma de girarla para que calcen.',
        simpler: 'Como tus manos: la izquierda es el reflejo de la derecha, pero un guante derecho no le queda a la izquierda.' },
      { term: 'Enantiómeros', mission: 'm1', def: 'Las dos formas "espejo" de una molécula quiral.',
        simple: 'Son las dos versiones espejo de una molécula quiral: misma fórmula y mismos enlaces, pero en 3D son reflejos.',
        simpler: 'Son la mano derecha y la mano izquierda de una misma molécula.' },
      { term: 'Mezcla racémica', mission: 'm1', def: 'Mitad de cada enantiómero. No desvía la luz polarizada.',
        simple: 'Es 50 % de cada enantiómero. Uno gira la luz polarizada hacia un lado y el otro hacia el lado contrario, así que se anulan.',
        simpler: 'Un equipo con la mitad empujando a la izquierda y la mitad a la derecha: no se mueve.' },
      { term: 'Sal de amonio', mission: 'm3', def: 'Amina protonada (catión) junto a un anión, por ejemplo R–NH₃⁺ Cl⁻. Las de 4 grupos R son cuaternarias.',
        simple: 'Cuando una amina atrapa el H⁺ de un ácido (como HCl) queda con carga + y se junta con el anión (Cl⁻): eso es una sal. Si el N tiene 4 grupos de carbono es cuaternaria y ya no tiene par libre.',
        simpler: 'Es la amina «vestida» de sal: con carga, sólida y soluble en agua, como la sal de mesa.' }
    ],
    curiosities: [
      { text: 'El olor a pescado se debe a aminas pequeñas como la trimetilamina, que se forman cuando las enzimas descomponen proteínas del pescado.', slide: 13 },
      { text: 'La putrescina y la cadaverina son aminas con olor desagradable que se forman en la descomposición de la carne.', slide: 13 },
      { text: 'Los alcaloides, como la morfina, la cocaína y la nicotina, son aminas naturales aisladas de plantas.', slide: 4 },
      { text: 'La efedrina pura funde a 79 °C, huele a pescado y se oxida al aire. Su clorhidrato funde a 217 °C y casi no tiene olor: por eso los fármacos se venden como sales.', slide: 16 },
      { text: 'El bupropión se creó como antidepresivo y resultó ayudar a dejar de fumar.', slide: 14 }
    ],
    /* Texto de las diapositivas de cátedra que usa la clase (se proyecta mientras no estén las imágenes).
       Cuando existan, las imágenes van en assets/classes/org-01/slides/NN.webp y se listan en slideImages. */
    slideImages: {},
    slides: {
      2: { title: 'Aminas · Introducción', bullets: ['Aminas son derivados orgánicos del amoníaco donde uno de los H unidos al N es reemplazado por uno o más grupos alquilo o arilo (R).', 'Clasificación: primarias, secundarias o terciarias, dependiendo del número de grupos unidos al N.'] },
      4: { title: 'Aminas · Introducción', bullets: ['Aminas naturales aisladas de plantas o animales se llaman alcaloides.', 'Muchas aminas desempeñan papeles vitales en la neuroquímica.'] },
      9: { title: 'Aminas · Nomenclatura', bullets: ['Las sales de amonio cuaternario tienen 4 enlaces alquilo o arilo con un N.', 'El N tiene carga positiva (+), como en sales de amonio simples como el cloruro de amonio.', 'En heterociclos nitrogenados, al N generalmente se le asigna la posición 1.'] },
      13: { title: 'Aminas · Otras características', bullets: ['Aminas de bajo peso molecular, como la trimetilamina, suelen tener olor a pescado.', 'El olor del pescado lo causan aminas que se producen cuando las enzimas descomponen ciertas proteínas.', 'Ejemplos: putrescina y cadaverina.'] },
      14: { title: 'Aminas · Ejemplo aplicado a fármacos', bullets: ['La mayoría de los fármacos producen más de una respuesta fisiológica.', 'El bupropión se desarrolló como antidepresivo, pero ayuda a dejar de fumar.', 'El sildenafil se diseñó para tratar la angina.'] },
      5: { title: 'Aminas · Reactividad', bullets: ['El N de una amina posee un par electrónico solitario o libre: una región de alta densidad de electrones (mapa de potencial electrostático de la trimetilamina).', 'El par solitario es responsable de la mayoría de las reacciones de las aminas.', 'El par electrónico libre puede funcionar como una base o como un nucleófilo.'] },
      11: { title: 'Aminas · Geometría', bullets: ['El N de una amina se hibrida típicamente sp³ y el par solitario ocupa un orbital sp³.', 'El N exhibe geometría piramidal trigonal, con ángulos de enlace de unos 108°.', 'Aminas con tres grupos alquilo diferentes son quirales.', 'La inversión piramidal ocurre con bastante rapidez y produce una mezcla racémica de enantiómeros.'] },
      12: { title: 'Aminas · Solubilidad y puntos de ebullición', bullets: ['El punto de ebullición aumenta cuando aumenta la capacidad de formar enlaces de H.', 'Las aminas primarias tienen típicamente puntos de ebullición más altos; las terciarias, más bajos.'] },
      16: { title: 'Aminas · Sales', bullets: ['Medicamentos y aminas bioactivas se almacenan y usan principalmente como sus sales.', 'Las sales de amina son menos propensas a la oxidación y son solubles en agua.', 'La sal de clorhidrato es preferible para compuestos de medicamentos.'] }
    },
    missions: [
      {
        id: 'm1',
        title: 'El par libre',
        subtitle: 'Qué es una amina, cómo se clasifica y por qué todo depende de su par de electrones',
        minutes: 12,
        slides: '2, 5 y 11',
        stages: {
          diagnostic: [
            choice('m1-d1', '¿Qué tipo de amina es la terc-butilamina, (CH₃)₃C–NH₂?', [
              { text: 'Primaria', correct: true },
              { text: 'Terciaria', misconception: 'carbon-rule' },
              { text: 'Secundaria', misconception: 'count-groups' }
            ], { explain: 'El N está unido a un solo grupo de carbono (el terc-butilo): es primaria. Que ese carbono sea terciario no importa.', slide: 2, hint: 'Mira el nitrógeno, no el carbono. ¿Cuántos carbonos tocan al N?' }),
            choice('m1-d2', '¿Qué parte de una amina le permite actuar como base?', [
              { text: 'Los H unidos al nitrógeno', misconception: 'nh-acid' },
              { text: 'El par de electrones libre del nitrógeno', correct: true },
              { text: 'El enlace C–N', note: 'Esos electrones ya están ocupados en el enlace con el carbono; no quedan libres para un H⁺.' }
            ], { explain: 'El par libre del N es una zona de alta densidad electrónica: puede captar un H⁺ (base) o atacar un centro con carga parcial positiva (nucleófilo).', slide: 5, hint: 'Para captar un H⁺, la base necesita electrones que entregarle.' }),
            choice('m1-d3', '¿Qué forma tiene la molécula alrededor del N en la trimetilamina, (CH₃)₃N?', [
              { text: 'Plana trigonal, 120°', misconception: 'flat-n' },
              { text: 'Tetraédrica, 109,5°', misconception: 'tetra-shape' },
              { text: 'Piramidal trigonal, unos 108°', correct: true }
            ], { explain: 'El N es sp³ y el par libre ocupa un orbital sp³. La forma de los átomos es piramidal trigonal con ángulos de unos 108°.', slide: 11, hint: 'Cuenta 3 enlaces + 1 par libre. ¿Qué forma queda si solo miras los átomos?' })
          ],
          fundamentals: [
            { id: 'f1', title: 'Desde cero: el nitrógeno y sus 5 electrones', svg: NH3_SVG,
              body: 'El nitrógeno está en el grupo 15: tiene **5 electrones de valencia**. Para completar su octeto comparte 3 de ellos formando **3 enlaces**, y le sobran 2 electrones que no comparte con nadie.',
              deeper: 'Míralo en el amoníaco, NH₃: tres enlaces N–H (cada uno son 2 electrones compartidos) y arriba dos puntos, que son los 2 electrones que sobran. 3 enlaces × 2 = 6 electrones compartidos + 2 propios = 8: octeto completo. Esos 2 electrones propios son el famoso **par libre**.' },
            { id: 'f2', title: 'Desde cero: qué es un par libre',
              body: 'Un par libre son **2 electrones de un mismo átomo que no forman enlace**. Como son carga negativa concentrada, atraen a cosas positivas.',
              deeper: 'Piensa en el N como alguien con una mano libre. Con esa mano puede agarrar un protón (H⁺, que es carga positiva pura) o puede "tocar" un carbono que esté un poco positivo (δ+). Todo lo que hacen las aminas sale de esa mano libre.' },
            { id: 'f3', title: 'Desde cero: qué es una base', svg: PROTON_SVG,
              body: 'En la definición de Brønsted–Lowry, un **ácido entrega un H⁺** y una **base lo acepta**. El H⁺ no trae electrones, así que la base pone los 2 del nuevo enlace: usa su par libre.',
              deeper: 'NH₃ + H⁺ → NH₄⁺. Antes, el N tenía 3 enlaces y 1 par libre. Después tiene 4 enlaces y ningún par libre. Su carga formal pasa a +1 (5 electrones de valencia − 0 sin compartir − 4 enlaces = +1). Por eso el ion amonio lleva un "+".' },
            { id: 'f4', deeper: 'La R es como la «x» de matemáticas: un espacio donde va cualquier pedazo de carbono. Si ves R–NH₂, lee «algún carbono con un NH₂». Si ese carbono es parte de una cadena, es **alquilo**; si es parte de un anillo aromático, es **arilo** (como en la anilina).', title: 'Desde cero: qué significa "R"',
              body: 'En orgánica, **R** es cualquier grupo de carbono. Puede ser una cadena (alquilo, como metilo CH₃– o etilo CH₃CH₂–) o un anillo aromático (arilo, como el fenilo C₆H₅–).',
              rows: [['CH₃–', 'metilo (alquilo)'], ['CH₃CH₂–', 'etilo (alquilo)'], ['C₆H₅–', 'fenilo (arilo)']] },
            { id: 'f5', title: 'Desde cero: hibridación sp³ en un minuto',
              body: 'Cuando un átomo tiene **4 grupos de electrones** a su alrededor (enlaces o pares libres), los separa lo más posible: en forma de tetraedro, a unos 109,5°.',
              deeper: 'El N de una amina tiene 3 enlaces + 1 par libre = 4 grupos, así que es sp³. Si solo miras dónde están los átomos (no el par libre), la forma es una pirámide de base triangular. El par libre empuja un poco más que un enlace, así que los ángulos quedan en unos 107–108°, un poco menos que 109,5°.' }
          ],
          explain: [
            { id: 'b1', deeper: 'Receta para clasificar: 1) encuentra el N; 2) mira quiénes están unidos directamente a él; 3) cuenta cuántos son carbonos. Uno → primaria (CH₃NH₂, metilamina). Dos → secundaria ((CH₃)₂NH, dimetilamina). Tres → terciaria ((CH₃)₃N, trimetilamina). Si fueran cuatro carbonos, el N quedaría con carga +: sería una sal de amonio cuaternario (diap. 9).', title: 'Una amina es amoníaco "disfrazado"', slide: 2,
              body: 'Si a una molécula de NH₃ le reemplazas uno o más H por grupos de carbono (R, alquilo o arilo), obtienes una amina. Se clasifica contando cuántos grupos R están unidos **al nitrógeno**.',
              rows: [['NH₃', 'amoníaco'], ['R–NH₂', 'primaria (1°)'], ['R₂NH', 'secundaria (2°)'], ['R₃N', 'terciaria (3°)']] },
            { id: 'b2', deeper: 'Base y nucleófilo usan el mismo par libre; lo que cambia es a quién atacan. Como base, atacan un H⁺: CH₃NH₂ + HCl → CH₃NH₃⁺ Cl⁻. Como nucleófilo, atacan un carbono pobre en electrones, como el C unido al yodo en el CH₃I: (CH₃)₃N + CH₃I → (CH₃)₄N⁺ I⁻, una sal de amonio cuaternario.', title: 'El par libre lo hace todo', slide: 5,
              body: 'El N tiene un par de electrones que no forma enlace. Con él, la amina puede hacer dos cosas:',
              rows: [['Base', 'R₃N + H⁺ ⇌ R₃NH⁺ (capta un protón)'], ['Nucleófilo', 'R₃N + R′–X → R₃N⁺–R′ + X⁻ (ataca un carbono)']],
              note: 'Casi todas las reacciones de las aminas que verás en esta clase nacen de este par.' },
            { id: 'b3', deeper: 'Imagina una pirámide baja: el N arriba, los 3 grupos en la base y el par libre apuntando hacia afuera. La inversión piramidal es esa pirámide dándose vuelta (pasa por una forma plana), como un paraguas con el viento. En el amoníaco ocurre unas 24 mil millones de veces por segundo; en aminas simples, millones de veces. Por eso no alcanzas a separar los dos enantiómeros.', title: 'Un nitrógeno con forma de pirámide', slide: 11,
              body: 'El N es sp³ y su par libre ocupa uno de los 4 orbitales. Por eso la molécula es piramidal trigonal, con ángulos de unos 108°.',
              note: 'Si el N tiene tres grupos distintos, es un centro quiral. Pero la inversión piramidal ocurre tan rápido que los dos enantiómeros se transforman uno en otro: queda una mezcla racémica que no se puede separar.' }
          ],
          worked: {
            prompt: 'Dietilamina, (CH₃CH₂)₂NH, se mezcla con HCl. ¿Qué tipo de amina es y qué se forma?',
            steps: [
              { text: 'Cuenta los grupos de carbono unidos al N: dos etilos. Es una amina **secundaria**.' },
              { text: 'Ubica el par libre: está en el N, en un orbital sp³.' },
              { text: 'El HCl entrega un H⁺. El par libre del N lo capta: la amina actúa como **base**.', ask: '¿Qué hace el par libre con el H⁺?' },
              { text: 'Queda (CH₃CH₂)₂NH₂⁺ Cl⁻, una sal de amonio (cloruro de dietilamonio). El N tiene 4 enlaces y ningún par libre: carga +1.', ask: '¿Cómo queda la carga del N?' }
            ]
          },
          practice: [
            choice('m1-p1', '¿Qué tipo de amina es (CH₃)₂N–CH₂CH₃?', [
              { text: 'Secundaria', misconception: 'count-groups' },
              { text: 'Terciaria', correct: true },
              { text: 'Primaria', note: 'Primaria tendría un solo grupo R y dos H en el N.' }
            ], { explain: 'El N está unido a tres grupos de carbono (dos metilos y un etilo) y a ningún H: es terciaria.', slide: 2, hint: 'Cuenta todos los grupos unidos al N, incluido el etilo.' }),
            choice('m1-p2', 'La trimetilamina reacciona con HCl. ¿Qué se forma?', [
              { text: '(CH₃)₃NH⁺ Cl⁻', correct: true },
              { text: '(CH₃)₃N⁺–Cl', misconception: 'n-binds-cl' },
              { text: '(CH₃)₂NH + CH₃Cl', note: 'Eso sería romper un enlace C–N. El HCl no hace eso: solo entrega su H⁺.' }
            ], { explain: 'La amina actúa como base: su par libre capta el H⁺ del HCl. Se forma el ion trimetilamonio con Cl⁻ como contraión.', slide: 5, hint: '¿Qué parte del HCl puede captar un par de electrones?' }),
            choice('m1-p3', 'Una amina con tres grupos distintos en el N es quiral, pero sus enantiómeros no se pueden separar. ¿Por qué?', [
              { text: 'Porque el par libre no cuenta como grupo, así que no hay centro quiral', misconception: 'lone-pair-not-group' },
              { text: 'Porque la inversión piramidal los interconvierte muy rápido', correct: true },
              { text: 'Porque el N es plano y no tiene forma 3D' , misconception: 'flat-n' }
            ], { explain: 'La pirámide del N se "da vuelta" como un paraguas con el viento, muy rápido. Los dos enantiómeros se convierten uno en otro y queda una mezcla racémica.', slide: 11, hint: 'Piensa en un paraguas que se da vuelta.' })
          ],
          challenge: [
            choice('m1-c1', 'Desafío: ¿cuál de estas aminas NO puede formar puentes de hidrógeno entre sus propias moléculas?', [
              { text: 'Propilamina, CH₃CH₂CH₂NH₂', note: 'Es primaria: tiene dos enlaces N–H, así que sí dona puentes de H.' },
              { text: 'Etilmetilamina, CH₃CH₂NHCH₃', note: 'Es secundaria: le queda un enlace N–H para donar un puente de H.' },
              { text: 'Trimetilamina, (CH₃)₃N', correct: true }
            ], { explain: 'Para donar un puente de H hace falta un enlace N–H. La trimetilamina es terciaria y no tiene ninguno: solo puede aceptar puentes de H.', slide: 12, hint: '¿Cuál no tiene ningún H unido al N?' })
          ],
          transfer: [
            choice('m1-t1', 'La anfetamina es C₆H₅–CH₂–CH(CH₃)–NH₂. ¿Qué tipo de amina es?', [
              { text: 'Secundaria, porque el carbono unido al N es secundario', misconception: 'carbon-rule' },
              { text: 'Primaria', correct: true },
              { text: 'Terciaria', note: 'Terciaria necesitaría tres grupos de carbono unidos al N; aquí hay uno.' }
            ], { explain: 'El N está unido a un solo grupo de carbono. Es primaria, aunque ese carbono esté unido a otros dos carbonos.', slide: 2, hint: 'Ya lo viste en el diagnóstico: ¿qué se mira, el N o el C?' }),
            choice('m1-t2', 'En el estómago (medio muy ácido), ¿cómo está mayoritariamente la anfetamina?', [
              { text: 'Neutra, como R–NH₂', misconception: 'neutral-in-acid' },
              { text: 'Protonada, como R–NH₃⁺', correct: true },
              { text: 'Desprotonada, como R–NH⁻', note: 'Quitarle un H al N requiere una base fortísima, no un medio ácido.' }
            ], { explain: 'En medio ácido abundan los H⁺ y el par libre de la amina capta uno. Por eso muchos fármacos con aminas se venden como sales (clorhidratos), que son su forma protonada (diap. 16).', slide: 5, hint: 'Hay muchos H⁺ alrededor. ¿Qué hace el par libre?' })
          ]
        }
      }
    ]
  };
})();

/* ───────── Misiones 2 a 8: todo Aminas para la PEP 1 ─────────
   Fuente: diapositivas de cátedra "Aminas" (Dr. J. Echeverría, USACH 2025-2S) y PEP 1 2025 (pauta).
   Valores de pKa del ácido conjugado (pKaH) de tablas estándar de química orgánica. */
(() => {
  'use strict';
  const cls = window.NexoClasses['org-01'];
  const SRC = 'catedra-aminas';
  const q = (id, prompt, options, extra = {}) => ({ id, type: 'choice', prompt, options, source: SRC, ...extra });
  const order = (id, prompt, cards, answer, extra = {}) => ({ id, type: 'order', prompt, cards: cards.map(([cid, text]) => ({ id: cid, text })), answer, source: SRC, ...extra });
  const classify = (id, prompt, buckets, cards, extra = {}) => ({ id, type: 'classify', prompt, buckets: buckets.map(([bid, label]) => ({ id: bid, label })), cards: cards.map(([cid, text, bucket]) => ({ id: cid, text, bucket })), source: SRC, ...extra });
  const match = (id, prompt, pairs, extra = {}) => ({ id, type: 'match', prompt, pairs: pairs.map(([left, right]) => ({ left, right })), source: SRC, ...extra });
  const pick = (id, prompt, molecules, targets, answer, extra = {}) => ({ id, type: 'pick', prompt, molecules, targets, answer, source: SRC, ...extra });
  // Respuesta escrita (escalón 5): escribes, ves la respuesta modelo y marcas qué ideas tenías.
  const write = (id, prompt, model, rubric, extra = {}) => ({ id, type: 'write', prompt, model, rubric, source: SRC, ...extra });

  Object.assign(cls.misconceptions, {
    'forgot-di': { label: 'Olvidaste contar los grupos repetidos', why: 'Si el mismo grupo aparece dos veces se usa "di" (dietil), tres veces "tri". Cuenta cada grupo unido al N.', prereq: { title: 'Nombrar secundarias y terciarias', mission: 'm2', block: 'b24' } },
    'amine-priority': { label: 'Le diste prioridad a la amina', why: 'El alcohol (y el ácido carboxílico) tienen más prioridad que la amina: dan el sufijo, y el NH₂ se nombra como prefijo "amino".', prereq: { title: 'Prioridad de grupos funcionales', mission: 'm2', block: 'f22' } },
    'alpha-order': { label: 'Los grupos van en orden alfabético', why: 'En una alquilamina los grupos se escriben en orden alfabético: etil antes que metil, metil antes que propil.', prereq: { title: 'Nombrar secundarias y terciarias', mission: 'm2', block: 'b24' } },
    'n-locant': { label: 'Los grupos sobre el N llevan "N-"', why: 'Un grupo unido al nitrógeno (no a un carbono de la cadena) se indica con el localizador N, no con un número.', prereq: { title: 'Nombrar secundarias y terciarias', mission: 'm2', block: 'b24' } },
    'parent-complex': { label: 'La cadena principal es el grupo más complejo', why: 'Cuando un grupo es más complejo que los otros, ese da el nombre base (alcanamina); los simples van como N-sustituyentes.', prereq: { title: 'Nombrar secundarias y terciarias', mission: 'm2', block: 'b24' } },
    'tertiary-donor': { label: 'Una terciaria no dona puentes de H', why: 'Para donar un puente de hidrógeno hace falta un enlace N–H. La terciaria no tiene: sus moléculas se atraen menos y hierve más bajo.', prereq: { title: 'Puentes de hidrógeno', mission: 'm3', block: 'f31' } },
    'size-solubility': { label: 'Más carbonos, menos soluble', why: 'La parte NH₂ se lleva bien con el agua, pero la cadena de carbonos no. Sobre unos 5 carbonos la cadena gana y la amina es poco soluble.', prereq: { title: 'Lo semejante disuelve lo semejante', mission: 'm3', block: 'f32' } },
    'salt-organic': { label: 'Una sal no se queda en el solvente orgánico', why: 'Al protonarse, la amina queda como ion (R–NH₃⁺Cl⁻). Los iones se disuelven en agua, no en éter.', prereq: { title: 'Sales y extracción', mission: 'm3', block: 'b34' } },
    'pka-inverted': { label: 'Invertiste el sentido del pKa', why: 'Se compara el pKa del ácido conjugado (el ion amonio). Mientras MÁS ALTO, más le cuesta soltar el H⁺, y por lo tanto MÁS básica es la amina.', prereq: { title: 'Ka y pKa', mission: 'm4', block: 'f41' } },
    'strong-side': { label: 'El equilibrio va hacia el lado débil', why: 'En una reacción ácido–base el equilibrio favorece al ácido más débil (el de pKa mayor), no al más fuerte.', prereq: { title: 'El lado débil gana', mission: 'm4', block: 'f42' } },
    'sum14': { label: 'pKa y pKb se complementan', why: 'Para un par conjugado en agua a 25 °C, pKa + pKb = 14. Si el pKa es 10,6, el pKb es 3,4.', prereq: { title: 'Pares conjugados', mission: 'm4', block: 'f43' } },
    'aromatic-more': { label: 'El anillo aromático le quita basicidad al N', why: 'En la anilina el par libre del N se deslocaliza en el anillo: está menos disponible para captar un H⁺. Las arilaminas son mucho menos básicas que las alquilaminas.', prereq: { title: 'Resonancia', mission: 'm5', block: 'f51' } },
    'pyrrole-pair': { label: 'El par del pirrol es parte del sexteto aromático', why: 'En el pirrol el par libre del N forma parte de los 6 electrones π aromáticos. Protonarlo destruiría la aromaticidad: por eso es una base extremadamente débil.', prereq: { title: 'Aromaticidad en un minuto', mission: 'm5', block: 'f52' } },
    'amide-basic': { label: 'El N de una amida no es básico', why: 'En una amida el par del N está muy deslocalizado hacia el C=O. Ese N casi no tiene densidad electrónica: no actúa como base ni como nucleófilo.', prereq: { title: 'Resonancia', mission: 'm5', block: 'f51' } },
    'subst-effect': { label: 'Mezclaste el efecto de los sustituyentes', why: 'Un donador (–OCH₃ en para) aumenta un poco la basicidad de la anilina; un aceptor (–NO₂) la baja mucho. La alquilamina sin anillo es la más básica de todas.', prereq: { title: 'Sustituyentes en el anillo', mission: 'm5', block: 'b53' } },
    'hybrid-s': { label: 'Más carácter s, menos básico', why: 'Un orbital con más carácter s retiene más sus electrones: sp³ (alquilamina) > sp² (piridina) > sp (nitrilo) en basicidad.', prereq: { title: 'Hibridación y basicidad', mission: 'm5', block: 'b55' } },
    'overalkylation': { label: 'La amina producto sigue reaccionando', why: 'La amina que se forma también es nucleófila (incluso más que el NH₃), así que vuelve a atacar al R–X: se obtiene una mezcla de 1°, 2°, 3° y sal cuaternaria.', prereq: { title: 'Alquilación del amoníaco', mission: 'm6', block: 'b61' } },
    'gabriel-poly': { label: 'Gabriel no sobrealquila', why: 'El N de la N-alquilftalimida ya no tiene H y su par está deslocalizado por los dos C=O: no reacciona otra vez. Por eso Gabriel da solo la amina primaria.', prereq: { title: 'Síntesis de Gabriel', mission: 'm6', block: 'b63' } },
    'gabriel-stop': { label: 'Falta liberar la amina', why: 'La N-alquilftalimida es el intermedio. Hay que tratarla con hidrazina (o hidrolizar) para liberar R–NH₂.', prereq: { title: 'Síntesis de Gabriel', mission: 'm6', block: 'b63' } },
    'zaitsev-hofmann': { label: 'En Hofmann gana el alqueno MENOS sustituido', why: 'El grupo saliente –N(CH₃)₃⁺ es muy voluminoso: el estado de transición hacia el alqueno más sustituido tiene una interacción gauche que lo encarece. Se forma más rápido el menos sustituido (control cinético).', prereq: { title: 'Eliminación de Hofmann', mission: 'm7', block: 'b72' } },
    'tertiary-acyl': { label: 'Para formar amida el N necesita un H', why: 'En la acilación el N reemplaza a su H por el grupo acilo. Una amina terciaria no tiene H en el N: no forma amida.', prereq: { title: 'Acilación', mission: 'm7', block: 'b71' } },
    'tertiary-acylation': { label: 'Una amina 3° no forma amida', why: 'La acilación cambia un H del N por el grupo acilo. Una amina terciaria no tiene H en el N: no puede formar la amida neutra.', prereq: { title: 'Aminas 1°, 2° y 3°', mission: 'm1', block: 'b1' } },
    'e1-not-e2': { label: 'Eso es una E1, no una E2', why: 'Si primero sale el grupo y después la base saca el H, son dos pasos: eso es E1. La E2 ocurre en un solo paso, todo al mismo tiempo.', prereq: { title: 'Eliminación E2', mission: 'm7', block: 'f71' } },
    'nitration-confusion': { label: 'Eso nitra el anillo, no forma el diazonio', why: 'HNO₃/H₂SO₄ introduce un –NO₂ en el benceno. Para pasar de –NH₂ a –N₂⁺ se usa NaNO₂ con HCl, en frío (0–5 °C).', prereq: { title: 'Sales de diazonio', mission: 'm7', block: 'b73' } },
    'ir-peaks': { label: 'Cuenta los enlaces N–H', why: 'Cada tipo de amina da tantas señales N–H como permite su estructura: la 1° (NH₂) da dos picos (estiramiento simétrico y asimétrico), la 2° uno, la 3° ninguno.', prereq: { title: 'IR de aminas', mission: 'm8', block: 'b81' } },
    'n-rule': { label: 'Regla del nitrógeno', why: 'Un número impar de N da masa molecular impar; ningún N o un número par de N da masa par.', prereq: { title: 'Masa par o impar', mission: 'm8', block: 'f82' } }
  });

  Object.assign(cls.slides, {
    6: { title: 'Aminas · Nomenclatura (primarias)', bullets: ['Si el grupo alquilo es simple, se nombran como alquilamina: sustituyente + sufijo -amina.', 'Si es más complejo, se nombran como alcanamina: como un alcohol, con -amina en lugar de -ol.', 'Cuando hay otro grupo funcional, el amino se nombra como sustituyente y el otro grupo (excepto halógenos) da el sufijo.'] },
    7: { title: 'Aminas · Nomenclatura (arilaminas)', bullets: ['Las aminas aromáticas se nombran como derivados de la anilina.', 'La numeración empieza en el C unido al grupo amino y sigue en la dirección que da el número más bajo al primer punto de diferencia (2-fluoro en lugar de 3-etil).'] },
    8: { title: 'Aminas · Nomenclatura (secundarias y terciarias)', bullets: ['Si todos los grupos son simples, se nombran en orden alfabético con di-, tri-, tetra- si se repiten.', 'Si un grupo es complejo, se nombra como alcanamina con ese grupo como parental y los simples como sustituyentes con el localizador "N".'] },
    10: { title: 'Aminas · Ejercicios de nomenclatura', bullets: ['Ejercicio 1 y 2: asignar nombre a compuestos.', 'Ejercicio 3: dibujar la estructura a partir del nombre.'] },
    15: { title: 'Aminas · Sales de amonio cuaternario', bullets: ['Cuatro grupos alquilo o arilo unidos al N, que queda con carga positiva.'] },
    17: { title: 'Aminas · Basicidad', bullets: ['Las aminas son bases más fuertes que alcoholes o éteres y se protonan incluso con ácidos débiles.', 'Trietilamina + ácido acético: pKa 4,76 (ácido acético) frente a 10,76 (ion amonio).', 'El equilibrio favorece al ácido más débil: la amina queda casi toda protonada (1 de cada 1.000.000 neutra).', 'pKa alto del ion amonio = amina fuertemente básica.'] },
    18: { title: 'Aminas · Basicidad', bullets: ['La basicidad se cuantifica con el pKa del ion amonio correspondiente.', 'pKa alto: fuertemente básica. pKa bajo: débilmente básica.'] },
    19: { title: 'Aminas · Sales', bullets: ['La protonación de una amina da una sal de amina (ion amonio + anión del ácido).', 'La formación de sales puede usarse como método de aislación.'] },
    20: { title: 'Aminas · Ka y Kb', bullets: ['A veces no se informan Kb o pKb, sino Ka o pKa del ácido conjugado (el ion amonio).', 'Ka del ion amonio × Kb de la amina = Kw. Válido para cualquier par ácido–base conjugado.'] },
    22: { title: 'Efectos en la basicidad · Resonancia', bullets: ['En la p-nitroanilina el par libre está ampliamente deslocalizado.', 'Las amidas son un caso extremo: el par del N está muy deslocalizado; el N casi no tiene densidad electrónica y no actúa como base ni nucleófilo.'] },
    23: { title: 'Efectos en la basicidad · Resonancia', bullets: ['Arilaminas: bases mucho más débiles que las aminas alifáticas.', 'La resonancia estabiliza la amina libre; esa estabilización se pierde en el ion anilinio, así que el equilibrio se desplaza a la izquierda.'] },
    24: { title: 'Efectos en la basicidad · Sustituyentes', bullets: ['Grupos donadores (metoxi) aumentan ligeramente la basicidad de arilaminas.', 'Grupos aceptores (nitro) la disminuyen significativamente.'] },
    25: { title: 'Efectos en la basicidad · Deslocalización', bullets: ['Iones amonio de alquilaminas: pKa 10–11. Los de arilaminas son más ácidos (pKa menor).', 'En la arilamina el par ocupa un orbital p deslocalizado por el sistema aromático; se pierde al protonar.'] },
    26: { title: 'Efectos en la basicidad · Pirrol y piridina', bullets: ['En el pirrol el par libre participa en la aromaticidad: protonarlo la destruiría, es una base extremadamente débil.', 'En la piridina el par está localizado y no participa: puede actuar como base sin perder aromaticidad.', 'La piridina es unas 100.000 veces (5 órdenes de magnitud) más básica que el pirrol.'] },
    27: { title: 'Efectos en la basicidad · Hibridación', bullets: ['Orbitales con más carácter s retienen más sus electrones.', 'Piridina: par en orbital sp², menos disponible que el sp³ de una amina alifática.', 'Nitrilos (sp) son bases muy débiles: el acetonitrilo tiene pKb 24.'] },
    28: { title: 'Ejercicios de basicidad', bullets: ['Ejercicio 4: en cada par, identificar la base más fuerte.', 'Ejercicio 5: clasificar compuestos por basicidad.'] },
    29: { title: 'Síntesis de aminas', bullets: ['A partir de un haluro de alquilo.', 'A partir de un ácido carboxílico.', 'Preparación de anilina y derivados desde el benceno.'] },
    30: { title: 'Síntesis · Alquilación del amoníaco', bullets: ['NH₃ + R–X: la reacción puede continuar a aminas 2°, 3° y sal cuaternaria (polialquilación). Un exceso de NH₃ favorece la primaria.'] },
    31: { title: 'Síntesis · Azida y Gabriel', bullets: ['Azida: R–X + NaN₃ → R–N₃, luego reducción (LiAlH₄) → R–NH₂.', 'Gabriel: ftalimida potásica + R–X, luego hidrazina o hidrólisis → R–NH₂.', 'Ambas evitan la polialquilación.'] },
    32: { title: 'Síntesis · Aminación reductiva', bullets: ['Aldehído o cetona + NH₃ o amina, con un agente reductor (por ejemplo NaBH₃CN).', 'Con NH₃ da amina 1°; con amina 1° da 2°; con amina 2° da 3°.'] },
    33: { title: 'Resumen de estrategias de síntesis', bullets: ['Haluros (azida, Gabriel), carbonilos (aminación reductiva), amidas (LiAlH₄) y nitroarenos (reducción a anilina).'] },
    34: { title: 'Reacciones · Acilación', bullets: ['Aminas 1° y 2° reaccionan con haluros de acilo o anhídridos y forman amidas.'] },
    35: { title: 'Reacciones · Eliminación de Hofmann', bullets: ['Metilación exhaustiva (CH₃I en exceso) → sal de amonio cuaternario; Ag₂O, H₂O y calor → alqueno + N(CH₃)₃.'] },
    36: { title: 'Eliminación de Hofmann · Regioquímica', bullets: ['Las E2 suelen dar el alqueno más sustituido, pero en Hofmann el producto principal es el MENOS sustituido.', 'Argumento estérico: el grupo saliente es muy voluminoso; la conformación anticoplanar hacia el más sustituido tiene una interacción gauche.'] },
    37: { title: 'Eliminación de Hofmann · Control cinético', bullets: ['El estado de transición hacia el alqueno menos sustituido es de menor energía: se forma más rápido aunque no sea el más estable.'] },
    39: { title: 'Reacciones de iones aril diazonio', bullets: ['Muchos reactivos reemplazan el grupo diazo: permite introducir gran variedad de grupos en el anillo aromático.'] },
    40: { title: 'Diazonio · Sandmeyer y Schiemann', bullets: ['Sandmeyer: CuCl, CuBr o CuCN reemplazan el –N₂⁺ por –Cl, –Br o –CN.', 'Schiemann: HBF₄ y calor dan Ar–F.', 'Otras: H₂O y calor dan fenol; KI da Ar–I.'] },
    44: { title: 'Espectroscopía IR de aminas', bullets: ['1° y 2° muestran señales N–H entre 3350 y 3500 cm⁻¹, menos intensas que las O–H.', '1°: dos picos (simétrico y asimétrico). 2°: uno. 3°: ninguno.', 'Las 3° se detectan tratándolas con HCl: el N–H resultante da señal entre 2200 y 3000 cm⁻¹.'] },
    45: { title: 'RMN ¹H de aminas', bullets: ['H unido al N: señal ancha entre 0,5 y 5,0 ppm.', 'H α al N: entre 2 y 3 ppm; el efecto disminuye con la distancia (β ~1,5; γ ~0,9 ppm).'] },
    46: { title: 'RMN ¹³C de aminas', bullets: ['C α al N: entre 30 y 50 ppm, unos 20 ppm campo abajo por el desapantallamiento del N.'] },
    47: { title: 'Espectrometría de masas', bullets: ['Regla del nitrógeno: un número impar de N da un ion molecular de masa impar.', 'Las aminas sufren escisión α: radical + catión estabilizado por resonancia.'] }
  });

  cls.glossary.push(
    { term: 'Alquilamina / alcanamina', mission: 'm2', def: 'Dos formas de nombrar: grupo + "amina" (etilamina) o alcano con -amina (2-butanamina).',
      simple: 'Hay dos formas válidas de nombrar una amina: decir el grupo y agregar «amina» (etilamina), o tomar el alcano y cambiar la -o final por -amina (etanamina).',
      simpler: 'Es como decir «el auto de Juan» o «Juan, el del auto»: lo mismo, dicho de dos maneras.' },
    { term: 'Anilina', mission: 'm2', def: 'C₆H₅–NH₂, la amina aromática base. Sus derivados se nombran a partir de ella.',
      simple: 'Es un anillo de benceno con un NH₂ pegado. Es la amina aromática más simple, y las demás se nombran como «anilinas con algo».',
      simpler: 'Es el apellido de la familia: 3-cloroanilina es «anilina con un Cl en el carbono 3».' },
    { term: 'pKa del ion amonio (pKaH)', mission: 'm4', def: 'Mide la basicidad de una amina: mientras más alto, más básica.',
      simple: 'Para saber qué tan básica es una amina se mira el pKa de su forma protonada (R–NH₃⁺). Si es alto, el ion no suelta el H⁺: la amina lo agarra fuerte y es más básica.',
      simpler: 'Número alto = la amina agarra fuerte el H⁺ = más básica.' },
    { term: 'pKa + pKb = 14', mission: 'm4', def: 'Relación entre un ácido y su base conjugada en agua a 25 °C (Ka·Kb = Kw).',
      simple: 'Si conoces el pKb de la amina, el pKa de su ion amonio es 14 menos ese valor (en agua, a 25 °C). Sirve para pasar de un dato al otro.',
      simpler: 'Los dos números siempre suman 14: si te dan uno, restas y tienes el otro.' },
    { term: 'Resonancia / deslocalización', mission: 'm5', def: 'Electrones repartidos en varios átomos; un par repartido está menos disponible para captar H⁺.',
      simple: 'A veces un par de electrones no se queda en un átomo, sino que se reparte entre varios (por ejemplo, entre el N y el anillo). Repartido, está menos disponible para atrapar un H⁺: la amina es menos básica.',
      simpler: 'Es como tener la plata repartida en varias cuentas: es la misma plata, pero tienes menos a mano para gastar al tiro.' },
    { term: 'Aromaticidad (Hückel)', mission: 'm5', def: 'Anillo plano, conjugado y con 4n + 2 electrones π: muy estable.',
      simple: 'Un anillo es aromático si es plano, todos sus átomos tienen un orbital p conectado y tiene 2, 6, 10… electrones π (4n + 2). Eso lo hace muy estable, y no quiere perder esa estabilidad.',
      simpler: 'Es un club exclusivo de anillos súper estables. Si un par de electrones ya es parte del club (como en el pirrol), no lo suelta para atrapar un H⁺.' },
    { term: 'Efecto inductivo', mission: 'm5', def: 'Atracción o donación de densidad electrónica a través de enlaces σ.',
      simple: 'Un átomo electronegativo (O, Cl, el N de un NO₂) tira de los electrones a través de los enlaces y se los quita al N, que entonces atrapa peor un H⁺. Los alquilos hacen lo contrario: empujan electrones hacia el N.',
      simpler: 'Es un tira y afloja de electrones: si un vecino tira para su lado, al N le quedan menos.' },
    { term: 'Carácter s', mission: 'm5', def: 'Proporción de orbital s en un híbrido: sp (50 %) > sp² (33 %) > sp³ (25 %). Más carácter s retiene más los electrones.',
      simple: 'Los orbitales s están más cerca del núcleo. Un N sp (50 % s) tiene su par más pegado al núcleo que uno sp³ (25 % s), así que lo comparte peor: es menos básico.',
      simpler: 'Mientras más «s», más apretado tiene el N su par y menos lo presta. Orden: sp³ > sp² > sp.' },
    { term: 'SN2', mission: 'm6', def: 'Sustitución en un paso: el nucleófilo entra por detrás y el grupo saliente sale.',
      simple: 'El nucleófilo ataca al carbono por el lado contrario al grupo saliente y, en el mismo instante, ese grupo se va. Todo pasa en un solo paso.',
      simpler: 'Como el juego de las sillas: uno se sienta justo cuando el otro se para.' },
    { term: 'Polialquilación', mission: 'm6', def: 'Cuando la amina formada sigue reaccionando con el haluro y se obtiene una mezcla.',
      simple: 'Al hacer reaccionar NH₃ con R–X, la amina que se forma sigue siendo nucleófila (más que el NH₃) y vuelve a atacar. Terminas con una mezcla de 1°, 2°, 3° y sal cuaternaria.',
      simpler: 'Querías poner un solo R y la reacción no para: como pedir una papa frita y que te sigan sirviendo.' },
    { term: 'Síntesis de Gabriel', mission: 'm6', def: 'Ftalimida + KOH, R–X, luego hidrazina: da solo la amina primaria.',
      simple: 'Un truco para obtener solo la amina primaria: el N de la ftalimida puede alquilarse una sola vez, y al final la hidrazina lo libera como R–NH₂.',
      simpler: 'Es un molde que deja pasar un solo R: siempre sale una amina primaria y nada más.' },
    { term: 'Aminación reductiva', mission: 'm6', def: 'Carbonilo + NH₃ o amina + reductor (NaBH₃CN): forma una amina.',
      simple: 'Juntas un aldehído o cetona con NH₃ o una amina: se forma una imina (C=N) y el reductor la convierte en amina (C–N). El C del carbonilo termina unido al N.',
      simpler: 'Le pegas un nitrógeno donde antes había un oxígeno.' },
    { term: 'Eliminación de Hofmann', mission: 'm7', def: 'CH₃I en exceso, Ag₂O y calor: da el alqueno menos sustituido.',
      simple: 'La amina se convierte en sal de amonio cuaternario (CH₃I en exceso), se cambia el anión por OH⁻ (Ag₂O) y se calienta: sale un alqueno. Como el grupo que sale es muy voluminoso, la base saca el H más accesible y se forma el alqueno menos sustituido.',
      simpler: 'El grupo que sale es grande y torpe: saca el H más fácil de alcanzar, el de la orilla.' },
    { term: 'Sal de diazonio', mission: 'm7', def: 'Ar–N₂⁺, formada con NaNO₂/HCl en frío; el N₂ es un grupo saliente excelente.',
      simple: 'Si tratas una amina aromática (Ar–NH₂) con NaNO₂ y HCl en frío, el NH₂ se convierte en –N₂⁺. Ese grupo se va como gas N₂ con mucha facilidad, y en su lugar puedes poner casi cualquier cosa.',
      simpler: 'Es un comodín en el anillo: lo cambias por Cl, Br, CN, F, OH o I según lo que necesites.' },
    { term: 'Sandmeyer / Schiemann', mission: 'm7', def: 'Sales de cobre(I) dan Ar–Cl, Ar–Br, Ar–CN; HBF₄ y calor dan Ar–F.',
      simple: 'Son las reacciones que reemplazan el –N₂⁺ de una sal de diazonio: con CuCl, CuBr o CuCN (Sandmeyer) entra Cl, Br o CN; con HBF₄ y calor (Schiemann) entra F.',
      simpler: 'Sandmeyer usa cobre para poner Cl, Br o CN; Schiemann es el que pone el F.' },
    { term: 'Regla del nitrógeno', mission: 'm8', def: 'Número impar de N → masa molecular impar.',
      simple: 'El N pesa 14 pero forma 3 enlaces, un número impar. Por eso, si una molécula tiene un número impar de N, su masa molecular sale impar.',
      simpler: 'Masa impar en el espectro de masas = sospecha de un nitrógeno.' },
    { term: 'Escisión α', mission: 'm8', def: 'Ruptura típica de aminas en masas: radical + catión estabilizado.',
      simple: 'En el espectrómetro de masas, la amina se rompe en el enlace C–C vecino al carbono unido al N. Queda un catión con el N, estabilizado por resonancia, que da una señal fuerte.',
      simpler: 'La amina se corta «al lado del vecino» del N, porque el pedazo con el N queda estable.' }
  );

  /* ── Escenas de moléculas para la misión 7 (piloto de la clase viva). Coordenadas en el lienzo del editor (420 × 260). ── */
  const A = (id, el, x, y, q = 0, extra = {}) => ({ id, el, x, y, q, ...extra });
  const B = (a, b, o = 1) => ({ a, b, o });
  const ring = (cx, cy, r, p) => { const atoms = [...Array(6)].map((_, i) => A(`${p}${i}`, 'C', cx + r * Math.cos(i * Math.PI / 3), cy + r * Math.sin(i * Math.PI / 3), 0, { hide: true }));
    return { atoms, bonds: atoms.map((a, i) => B(a.id, atoms[(i + 1) % 6].id, i % 2 ? 1 : 2)) }; };
  const benz = ring(150, 140, 40, 'r');
  const PARACETAMOL = { atoms: [...benz.atoms, A('oh', 'O', 65, 140), A('nh', 'N', 235, 140), A('co', 'C', 275, 115, 0, { hide: true }), A('o', 'O', 275, 68), A('me', 'C', 320, 140)],
    bonds: [...benz.bonds, B('r3', 'oh'), B('r0', 'nh'), B('nh', 'co'), B('co', 'o', 2), B('co', 'me')] };
  const ACYL1 = { scene: { atoms: [A('c1', 'C', 45, 150), A('n', 'N', 115, 150), A('c2', 'C', 250, 150), A('o', 'O', 250, 70), A('c3', 'C', 320, 190), A('cl', 'Cl', 195, 205)],
    bonds: [B('c1', 'n'), B('c2', 'o', 2), B('c2', 'c3'), B('c2', 'cl')] }, lonePairs: { n: 1, o: 2, cl: 3 }, lpAngle: { n: -40 } };
  const ACYL2 = { scene: { atoms: [A('c1', 'C', 45, 150), A('n', 'N', 120, 150, 1), A('c2', 'C', 220, 150), A('o', 'O', 220, 70, -1), A('c3', 'C', 290, 185), A('cl', 'Cl', 220, 235)],
    bonds: [B('c1', 'n'), B('n', 'c2'), B('c2', 'o'), B('c2', 'c3'), B('c2', 'cl')] }, lonePairs: { o: 3, cl: 3 }, lpAngle: { o: -90 } };
  const AMIDE = { scene: { atoms: [A('c1', 'C', 45, 150), A('n', 'N', 120, 150), A('c2', 'C', 220, 150), A('o', 'O', 220, 70), A('c3', 'C', 290, 185)],
    bonds: [B('c1', 'n'), B('n', 'c2'), B('c2', 'o', 2), B('c2', 'c3')] }, lonePairs: { n: 1 }, lpAngle: { n: 90 } };
  const chain = (extra = [], extraBonds = [], double = null) => ({ atoms: [A('c1', 'C', 80, 175), A('c2', 'C', 140, 140), A('c3', 'C', 200, 175), A('c4', 'C', 260, 140), ...extra],
    bonds: [B('c1', 'c2', double === 1 ? 2 : 1), B('c2', 'c3', double === 2 ? 2 : 1), B('c3', 'c4'), ...extraBonds] });
  const QUAT = chain([A('n', 'N', 140, 75, 1, { label: 'N(CH₃)₃⁺' })], [B('c2', 'n')]);
  const HOF2 = { scene: chain([A('n', 'N', 140, 75, 1, { label: 'N(CH₃)₃⁺' }), A('h1', 'H', 45, 215), A('oh', 'O', 100, 285, -1)], [B('c2', 'n'), B('c1', 'h1')]),
    lonePairs: { oh: 3 }, lpAngle: { oh: -130 } };
  const BUTENE1 = chain([], [], 1), BUTENE2 = chain([], [], 2), BUTANE = chain();
  const DIETHYL = { atoms: [A('n', 'N', 150, 110), A('a1', 'C', 100, 140), A('a2', 'C', 50, 110), A('b1', 'C', 200, 140), A('b2', 'C', 250, 110)], bonds: [B('n', 'a1'), B('a1', 'a2'), B('n', 'b1'), B('b1', 'b2')] };
  const TRIETHYL = { atoms: [...DIETHYL.atoms, A('e1', 'C', 150, 50), A('e2', 'C', 200, 20)], bonds: [...DIETHYL.bonds, B('n', 'e1'), B('e1', 'e2')] };
  const BROMO = chain([A('br', 'Br', 140, 75)], [B('c2', 'br')]);

  /* Escenas de las misiones 4 y 5 */
  const lido = ring(110, 140, 40, 'r');
  const LIDOCAINE = { atoms: [...lido.atoms, A('m1', 'C', 130, 210), A('m2', 'C', 130, 70), A('na', 'N', 200, 140), A('co', 'C', 245, 115, 0, { hide: true }), A('o', 'O', 245, 62),
    A('ch', 'C', 290, 140, 0, { hide: true }), A('nb', 'N', 335, 115), A('e1', 'C', 335, 62, 0, { hide: true }), A('e2', 'C', 380, 37), A('f1', 'C', 380, 140, 0, { hide: true }), A('f2', 'C', 410, 115)],
    bonds: [...lido.bonds, B('r1', 'm1'), B('r5', 'm2'), B('r0', 'na'), B('na', 'co'), B('co', 'o', 2), B('co', 'ch'), B('ch', 'nb'), B('nb', 'e1'), B('e1', 'e2'), B('nb', 'f1'), B('f1', 'f2')] };
  const PROTON = { scene: { atoms: [A('n', 'N', 110, 140), A('a1', 'C', 70, 115), A('a2', 'C', 30, 140), A('b1', 'C', 95, 190), A('b2', 'C', 55, 215), A('c1', 'C', 95, 85), A('c2', 'C', 55, 60),
      A('h', 'H', 210, 140), A('o1', 'O', 260, 140), A('c', 'C', 300, 110), A('o2', 'O', 300, 55), A('me', 'C', 345, 140)],
    bonds: [B('n', 'a1'), B('a1', 'a2'), B('n', 'b1'), B('b1', 'b2'), B('n', 'c1'), B('c1', 'c2'), B('h', 'o1'), B('o1', 'c'), B('c', 'o2', 2), B('c', 'me')] }, lonePairs: { n: 1, o1: 2, o2: 2 }, lpAngle: { n: 0 } };
  const nic = ring(110, 150, 40, 'r'); nic.atoms[3] = { ...nic.atoms[3], el: 'N', hide: false };
  const NICOTINE = { atoms: [...nic.atoms, A('p0', 'C', 175, 80, 0, { hide: true }), A('pn', 'N', 230, 60), A('pm', 'C', 245, 12), A('p2', 'C', 265, 100, 0, { hide: true }), A('p3', 'C', 245, 145, 0, { hide: true }), A('p4', 'C', 195, 130, 0, { hide: true })],
    bonds: [...nic.bonds, B('r5', 'p0'), B('p0', 'pn'), B('pn', 'pm'), B('pn', 'p2'), B('p2', 'p3'), B('p3', 'p4'), B('p4', 'p0')] };
  const an = ring(150, 140, 40, 'r');
  const ANILINE = { atoms: [...an.atoms, A('n', 'N', 235, 140)], bonds: [...an.bonds, B('r0', 'n')] };
  const showC = (atoms, id, q) => atoms.map(a => a.id === id ? { ...a, hide: false, q } : a);
  const setBond = (bonds, x, y, o) => bonds.map(b => (b.a === x && b.b === y) || (b.a === y && b.b === x) ? { ...b, o } : b);
  const ANIL_R1 = { scene: ANILINE, arrows: [['lp:n', 'b:6'], ['b:0', 'a:r1']], lonePairs: { n: 1 }, lpAngle: { n: 0 } };
  const ANIL_R2 = { scene: { atoms: showC(ANILINE.atoms, 'r1', -1).map(a => a.id === 'n' ? { ...a, q: 1 } : a), bonds: setBond(setBond(ANILINE.bonds, 'r0', 'n', 2), 'r0', 'r1', 1) },
    arrows: [['lp:r1', 'b:1'], ['b:2', 'a:r3']], lonePairs: { r1: 1 }, lpAngle: { r1: 90 } };
  const ANIL_R3 = { scene: { atoms: showC(ANILINE.atoms, 'r3', -1).map(a => a.id === 'n' ? { ...a, q: 1 } : a),
    bonds: setBond(setBond(setBond(setBond(ANILINE.bonds, 'r0', 'n', 2), 'r0', 'r1', 1), 'r1', 'r2', 2), 'r2', 'r3', 1) }, arrows: [], lonePairs: { r3: 1 }, lpAngle: { r3: 180 } };
  const cy = ring(150, 140, 40, 'r');
  const CYCLOHEXYLAMINE = { atoms: [...cy.atoms, A('n', 'N', 235, 140)], bonds: [...cy.bonds.map(b => ({ ...b, o: 1 })), B('r0', 'n')] };
  const PENT = (cx, cy0, r) => [...Array(5)].map((_, i) => ({ x: cx + r * Math.cos(-Math.PI / 2 + i * 2 * Math.PI / 5), y: cy0 + r * Math.sin(-Math.PI / 2 + i * 2 * Math.PI / 5) }));
  const pp = PENT(150, 135, 45);
  const PYRROLE = { atoms: [A('n', 'N', pp[0].x, pp[0].y), ...pp.slice(1).map((p, i) => A(`c${i + 1}`, 'C', p.x, p.y, 0, { hide: true }))],
    bonds: [B('n', 'c1'), B('c1', 'c2', 2), B('c2', 'c3'), B('c3', 'c4', 2), B('c4', 'n')] };
  const py = ring(150, 140, 42, 'r'); py.atoms[0] = { ...py.atoms[0], el: 'N', hide: false };
  const PYRIDINE = { atoms: py.atoms, bonds: py.bonds };

  /* Escenas de la misión 6 */
  const AMINOPHENOL = { atoms: [...benz.atoms, A('oh', 'O', 65, 140), A('n', 'N', 235, 140)], bonds: [...benz.bonds, B('r3', 'oh'), B('r0', 'n')] };
  const AZ1 = { scene: { atoms: [A('na', 'N', 30, 150, -1), A('nb', 'N', 75, 150, 1), A('nc', 'N', 120, 150, -1), A('c1', 'C', 205, 150), A('br', 'Br', 290, 150), A('c2', 'C', 205, 75), A('c3', 'C', 265, 45)],
    bonds: [B('na', 'nb', 2), B('nb', 'nc', 2), B('c1', 'br'), B('c1', 'c2'), B('c2', 'c3')] }, lonePairs: { na: 2, nc: 2, br: 3 }, lpAngle: { nc: 0 } };
  const AZ2 = { atoms: [A('na', 'N', 30, 150, -1), A('nb', 'N', 75, 150, 1), A('nc', 'N', 120, 150), A('c1', 'C', 185, 115), A('c2', 'C', 250, 150), A('c3', 'C', 315, 115), A('br', 'Br', 330, 215, -1)],
    bonds: [B('na', 'nb', 2), B('nb', 'nc', 2), B('nc', 'c1'), B('c1', 'c2'), B('c2', 'c3')] };
  const AZ3 = { atoms: [A('n', 'N', 90, 150), A('c1', 'C', 155, 115), A('c2', 'C', 220, 150), A('c3', 'C', 285, 115), A('m1', 'N', 290, 215), A('m2', 'N', 340, 215)],
    bonds: [B('n', 'c1'), B('c1', 'c2'), B('c2', 'c3'), B('m1', 'm2', 3)] };
  const RA_BASE = [A('o', 'O', 170, 55), A('c', 'C', 170, 130), A('m1', 'C', 110, 165), A('m2', 'C', 230, 165)];
  const RA1 = { scene: { atoms: [...RA_BASE, A('n', 'N', 320, 80)], bonds: [B('c', 'o', 2), B('c', 'm1'), B('c', 'm2')] }, lonePairs: { n: 1, o: 2 }, lpAngle: { n: 180 } };
  const RA1B = { atoms: [...RA1.scene.atoms, A('me', 'C', 375, 115)], bonds: [...RA1.scene.bonds, B('n', 'me')] };
  const IMINE = [A('n', 'N', 170, 55), A('c', 'C', 170, 130), A('m1', 'C', 110, 165), A('m2', 'C', 230, 165)];
  const RA2 = { atoms: [...IMINE, A('w', 'O', 320, 80, 0, { label: 'H₂O' })], bonds: [B('c', 'n', 2), B('c', 'm1'), B('c', 'm2')] };
  const RA3 = { scene: { atoms: [...IMINE, A('hy', 'H', 310, 85, -1, { label: 'H⁻' })], bonds: [B('c', 'n', 2), B('c', 'm1'), B('c', 'm2')] }, lonePairs: { n: 1, hy: 1 }, lpAngle: { hy: 180 } };
  const RA4 = { atoms: IMINE, bonds: [B('c', 'n'), B('c', 'm1'), B('c', 'm2')] };
  const ACETONE = { atoms: [A('c', 'C', 210, 130), A('o', 'O', 210, 60), A('m1', 'C', 150, 165), A('m2', 'C', 270, 165)], bonds: [B('c', 'o', 2), B('c', 'm1'), B('c', 'm2')] };
  const ISOPROPYLAMINE = { atoms: [A('c', 'C', 210, 130), A('n', 'N', 210, 60), A('m1', 'C', 150, 165), A('m2', 'C', 270, 165)], bonds: [B('c', 'n'), B('c', 'm1'), B('c', 'm2')] };
  const ACETONE_IMINE = { atoms: ISOPROPYLAMINE.atoms, bonds: [B('c', 'n', 2), B('c', 'm1'), B('c', 'm2')] };
  const BRPROP = { atoms: [A('c1', 'C', 120, 150), A('c2', 'C', 180, 115), A('c3', 'C', 240, 150), A('br', 'Br', 300, 115)], bonds: [B('c1', 'c2'), B('c2', 'c3'), B('c3', 'br')] };
  const PROPAMINE = { atoms: [A('c1', 'C', 120, 150), A('c2', 'C', 180, 115), A('c3', 'C', 240, 150), A('n', 'N', 300, 115)], bonds: [B('c1', 'c2'), B('c2', 'c3'), B('c3', 'n')] };
  const ACETAMIDE = { atoms: [A('c1', 'C', 120, 150), A('c2', 'C', 190, 115), A('o', 'O', 190, 45), A('n', 'N', 260, 150)], bonds: [B('c1', 'c2'), B('c2', 'o', 2), B('c2', 'n')] };
  const ETHYLAMINE = { atoms: [A('c1', 'C', 120, 150), A('c2', 'C', 190, 115), A('n', 'N', 260, 150)], bonds: [B('c1', 'c2'), B('c2', 'n')] };

  cls.missions.push(
  /* ── Misión 2 ── */
  {
    id: 'm2', title: 'Nombrar aminas', subtitle: 'Alquilaminas, alcanaminas, anilinas y sales: el nombre correcto a la primera', minutes: 15, slides: '6–10', pep: 'base de todo',
    stages: {
      diagnostic: [
        q('m2-d1', '¿Cómo se llama CH₃CH₂NH₂?', [{ text: 'Etilamina', correct: true }, { text: 'Dietilamina', misconception: 'forgot-di' }, { text: 'Etanol', note: 'Etanol es CH₃CH₂OH: tiene –OH, no –NH₂.' }], { explain: 'Un grupo etilo unido a un NH₂: etilamina (también se acepta etanamina).', slide: 6 }),
        q('m2-d2', 'En una molécula con –OH y –NH₂, ¿qué grupo da el sufijo del nombre?', [{ text: 'El –NH₂ (sufijo -amina)', misconception: 'amine-priority' }, { text: 'El –OH (sufijo -ol)', correct: true }, { text: 'Ninguno, se nombran los dos como prefijos', note: 'Siempre hay un grupo principal que da el sufijo.' }], { explain: 'El alcohol tiene más prioridad que la amina: da el sufijo -ol, y el NH₂ va como prefijo "amino".', slide: 6 })
      ],
      fundamentals: [
        { id: 'f21', deeper: 'Los prefijos son un conteo: **met** (1), **et** (2), **prop** (3), **but** (4); desde 5 se usan los números griegos: **pent**, **hex**. Después pones el final según el papel: si la cadena «cuelga» de algo, termina en **-ilo** (etilo); si es la cadena principal, en **-ano** (etano). CH₃CH₂–NH₂ = grupo etilo + amina = **etilamina**.', title: 'Desde cero: cómo se nombra una cadena', body: 'Las cadenas se nombran según su número de carbonos. Como grupo unido a algo terminan en **-ilo** (metilo, etilo); como cadena principal, en **-ano** (metano, etano).',
          rows: [['1 C', 'met-'], ['2 C', 'et-'], ['3 C', 'prop-'], ['4 C', 'but-'], ['5 C', 'pent-'], ['6 C', 'hex-']] },
        { id: 'f22', title: 'Desde cero: prioridad de grupos funcionales', body: 'Cuando una molécula tiene varios grupos, uno **manda** y da el sufijo; los demás van como prefijos. Para esta clase basta saber que **ácido carboxílico > alcohol > amina**.',
          deeper: 'Ejemplo: H₂N–CH₂CH₂CH₂CH₂–OH. Manda el alcohol, así que el nombre termina en -ol y el NH₂ se llama "amino": 4-amino-1-butanol. Ojo: los halógenos nunca mandan; se nombran como prefijos (cloro, bromo).', slide: 6 }
      ],
      explain: [
        { id: 'b21', title: 'Aminas primarias: dos formas de nombrar', slide: 6, body: 'Si el grupo es simple, se nombra como **alquilamina**: el grupo + "amina". Si es más complejo, como **alcanamina**: igual que un alcohol, pero con -amina en vez de -ol.',
          rows: [['CH₃CH₂NH₂', 'etilamina'], ['(CH₃)₂CH–NH₂', 'isopropilamina'], ['C₆H₁₁–NH₂', 'ciclohexilamina'], ['CH₃CH(NH₂)CH₂CH₃', '2-butanamina']],
          deeper: 'Para una alcanamina: 1) busca la cadena más larga que contenga el C unido al N; 2) numérala desde el extremo más cercano al N; 3) el nombre del alcano pierde la "o" y gana "-amina", con el número del C que lleva el N: 2-butanamina.' },
        { id: 'b22', deeper: 'Los grupos funcionales tienen jerarquía, como un equipo: el capitán pone el apellido (el sufijo) y los demás van adelante como prefijos. El –OH y el –COOH le ganan al –NH₂. Por eso H₂N–CH₂CH₂CH₂CH₂–OH es un **alcohol** (butanol) que lleva un **amino** en el C4: 4-amino-1-butanol.', title: 'Cuando hay otro grupo que manda', slide: 6, body: 'Si hay un grupo con más prioridad (alcohol, ácido), ese da el sufijo y el NH₂ se nombra como **amino**.',
          rows: [['H₂N–(CH₂)₄–OH', '4-amino-1-butanol'], ['H₂N–C₆H₄–COOH (para)', 'ácido p-aminobenzoico']] },
        { id: 'b23', deeper: 'Parte siempre desde la anilina: el C que lleva el NH₂ es el **1**. Luego cuenta hacia el lado donde aparece primero otro sustituyente. Con F en el C2 y etilo en el C5 queda **5-etil-2-fluoroanilina** (los prefijos van en orden alfabético: etil antes que fluoro).', title: 'Arilaminas: todo gira en torno a la anilina', slide: 7, body: 'Las aminas aromáticas se nombran como **derivados de la anilina** (C₆H₅–NH₂). El C que lleva el NH₂ es el 1, y se numera hacia donde el primer sustituyente quede con el número más bajo.',
          rows: [['Cl en posición 3', '3-cloroanilina (m-cloroanilina)'], ['F en 2 y etilo en 5', '5-etil-2-fluoroanilina']],
          note: 'En la segunda: numerando hacia el F los localizadores son 2 y 5; hacia el otro lado, 3 y 6. Gana el que tiene el número más bajo en la primera diferencia: 2.' },
        { id: 'b24', title: 'Secundarias y terciarias', slide: 8, body: 'Si todos los grupos son simples, se nombran en **orden alfabético**, con di- o tri- si se repiten. Si uno es complejo, ese es la cadena principal (alcanamina) y los simples van con el localizador **N-**.',
          rows: [['CH₃–NH–CH₂CH₃', 'etilmetilamina'], ['(CH₃CH₂)₃N', 'trietilamina'], ['CH₃(CH₂)₅–N(CH₃)CH₂CH₃', 'N-etil-N-metil-1-hexanamina']],
          deeper: 'El "N-" dice que el grupo está pegado al nitrógeno y no a un carbono de la cadena. En N-etil-N-metil-1-hexanamina: la cadena es el hexilo (el grupo más complejo), el N está en el C1, y sobre el N hay un etilo y un metilo.' },
        { id: 'b25', deeper: 'Si el N tiene **4 carbonos** pegados, ya no le queda par libre y queda con carga **+**. Se nombra como una sal: primero el anión, luego «de» y el catión terminado en **-amonio**. (CH₃CH₂)₄N⁺ I⁻ = yoduro + cuatro etilos en el N = **yoduro de tetraetilamonio**.', title: 'Sales cuaternarias y heterociclos', slide: 9, body: 'Si el N tiene 4 grupos de carbono queda con carga + y es una **sal de amonio cuaternario**: se nombra el catión "-amonio" y su anión. En los anillos con N, el N es la posición 1.',
          rows: [['(CH₃CH₂)₄N⁺ I⁻', 'yoduro de tetraetilamonio'], ['N-butilpiridinio + Br⁻', 'bromuro de N-butilpiridinio']] }
      ],
      worked: {
        prompt: 'Nombra CH₃–CH(NH₂)–CH₂–CH₃.',
        steps: [
          { text: 'Busca la cadena más larga que incluya el C que lleva el N: 4 carbonos, **butano**.' },
          { text: 'Numera desde el extremo más cercano al N: el N queda en el **C2**.', ask: '¿Desde qué extremo numeras?' },
          { text: 'Cambia la "o" final por "-amina" y pon el número: **2-butanamina** (también sec-butilamina).' },
          { text: 'El C2 tiene H, CH₃, CH₂CH₃ y NH₂: cuatro grupos distintos, es **quiral**. Si te dan la configuración, va al comienzo: (R)-2-butanamina.', ask: '¿Ese carbono es un centro quiral?' }
        ]
      },
      practice: [
        q('m2-p1', '¿Cómo se llama (CH₃CH₂)₂NH?', [{ text: 'Dietilamina', correct: true }, { text: 'Etilamina', misconception: 'forgot-di' }, { text: 'Trietilamina', note: 'Trietilamina tiene tres etilos y ningún H en el N.' }], { explain: 'Dos grupos etilo en el N: dietilamina (secundaria).', slide: 8, hint: 'Cuenta los etilos unidos al N.' }),
        match('m2-p2', 'Une cada estructura con su nombre.', [['CH₃NH₂', 'Metilamina'], ['(CH₃)₃N', 'Trimetilamina'], ['C₆H₅–NH₂', 'Anilina'], ['CH₃–NH–CH₂CH₃', 'Etilmetilamina'], ['(CH₃CH₂)₄N⁺ I⁻', 'Yoduro de tetraetilamonio']], { explain: 'Grupos simples en orden alfabético con di-/tri-; la amina aromática es anilina; con 4 grupos es sal de amonio cuaternario.', slide: 8, hint: 'Empieza por los que reconozcas al tiro: anilina y la sal con carga +.' }),
        q('m2-p3', 'H₂N–CH₂–CH₂–CH₂–CH₂–OH se llama…', [{ text: '4-hidroxi-1-butanamina', misconception: 'amine-priority' }, { text: '4-amino-1-butanol', correct: true }, { text: '1-amino-4-butanol', note: 'Se numera desde el grupo que manda (el OH), que queda en el C1.' }], { explain: 'Manda el alcohol: sufijo -ol en C1; el NH₂ es "amino" en C4.', slide: 6, hint: '¿Quién manda: el alcohol o la amina?' }),
        q('m2-p4', 'Anilina con un Cl en la posición meta (3). ¿Su nombre?', [{ text: '3-cloroanilina', correct: true }, { text: '1-amino-3-clorobenceno', note: 'Describe bien la molécula, pero las arilaminas se nombran como derivados de la anilina.' }, { text: '5-cloroanilina', note: 'Se numera hacia donde el sustituyente queda con el número más bajo: 3, no 5.' }], { explain: 'El C con NH₂ es el 1; el Cl queda en el 3: 3-cloroanilina (m-cloroanilina).', slide: 7, hint: 'La anilina es el nombre base; numera desde el C del NH₂.' })
      ],
      challenge: [
        q('m2-c1', 'CH₃(CH₂)₅–N(CH₃)–CH₂CH₃ se llama…', [{ text: 'N-etil-N-metil-1-hexanamina', correct: true }, { text: '1-etil-1-metilhexanamina', misconception: 'n-locant' }, { text: 'N-hexil-N-metiletanamina', misconception: 'parent-complex' }], { explain: 'El hexilo es el grupo más complejo: es la cadena principal. El etilo y el metilo están sobre el N: llevan "N-".', slide: 8, hint: '¿Cuál es el grupo más complejo? Ese da el nombre base.' })
      ],
      transfer: [
        q('m2-t1', '¿Cómo se llama CH₃CH₂CH₂–NH–CH₃?', [{ text: 'Propilmetilamina', misconception: 'alpha-order' }, { text: 'Metilpropilamina', correct: true }, { text: 'Butilamina', note: 'Tiene 4 carbonos en total, pero repartidos en dos grupos sobre el N: es secundaria.' }], { explain: 'Dos grupos simples, en orden alfabético: metil antes que propil.', slide: 8 }),
        pick('m2-t2', 'En el ácido p-aminobenzoico, toca el grupo que da el sufijo del nombre.', [[{ t: 'H₂N', target: 'amino' }, { t: '–C₆H₄–' }, { t: 'COOH', target: 'acid' }]],
          { amino: { label: 'El grupo –NH₂', misconception: 'amine-priority' }, acid: { label: 'El grupo –COOH' } }, 'acid', { explain: 'El ácido carboxílico tiene la mayor prioridad: da el nombre "ácido …benzoico", y el NH₂ va como prefijo "amino".', slide: 6, captions: ['Ácido p-aminobenzoico'] })
      ]
    }
  },
  /* ── Misión 3 ── */
  {
    id: 'm3', title: 'Propiedades y sales', subtitle: 'Por qué unas aminas hierven más, cuáles se disuelven en agua y por qué los fármacos son sales', minutes: 12, slides: '12–16, 19', pep: 'teoría',
    stages: {
      diagnostic: [
        q('m3-d1', '¿Cuál hierve a mayor temperatura: propilamina o trimetilamina (misma masa)?', [{ text: 'Propilamina', correct: true }, { text: 'Trimetilamina', misconception: 'tertiary-donor' }, { text: 'Igual, porque tienen la misma masa', note: 'Misma masa, pero distinta capacidad de formar puentes de H.' }], { explain: 'La propilamina (1°) forma puentes de H entre sus moléculas; la trimetilamina (3°) no puede donarlos.', slide: 12 }),
        q('m3-d2', 'La octilamina (8 carbonos) en agua es…', [{ text: 'Poco soluble', correct: true }, { text: 'Muy soluble, como toda amina', misconception: 'size-solubility' }, { text: 'Insoluble porque no tiene N–H', note: 'Sí tiene N–H (es primaria). El problema es la cadena larga.' }], { explain: 'Con más de unos 5 carbonos la parte apolar domina: la octilamina es escasamente soluble.', slide: 12 })
      ],
      fundamentals: [
        { id: 'f31', title: 'Desde cero: puentes de hidrógeno', body: 'Un H unido a N, O o F queda con carga parcial **δ+** y es atraído por un **par libre** de otra molécula. Para **donar** un puente de H se necesita un enlace N–H u O–H; para **aceptarlo** basta un par libre.',
          deeper: 'Una amina 1° (R–NH₂) tiene dos N–H: dona y acepta. Una 2° (R₂NH) tiene uno. Una 3° (R₃N) no tiene ninguno: solo acepta. Por eso entre moléculas de amina terciaria las atracciones son más débiles.' },
        { id: 'f32', deeper: 'Piensa en el agua como un grupo de amigos tomados de la mano (puentes de H). El NH₂ sabe tomarse de la mano, así que lo aceptan; la cadena de carbonos no sabe y estorba. Si la cadena es corta, el NH₂ alcanza a «convencer» al agua; si es larga, gana el estorbo y la amina no se disuelve.', title: 'Desde cero: lo semejante disuelve lo semejante', body: 'El agua es polar. El grupo NH₂ también, y forma puentes de H con el agua. La cadena de carbonos es apolar y "molesta" al agua. Mientras más larga la cadena, menos soluble.' }
      ],
      explain: [
        { id: 'b31', deeper: 'Regla práctica: **cuenta los carbonos**. Hasta unos 5, el NH₂ alcanza para que la amina se disuelva en agua. Con más, gana la parte «aceitosa». Etilamina (2 C): soluble. Octilamina (8 C): casi nada.', title: 'Solubilidad', slide: 12, body: 'Las aminas se parecen a los alcoholes: con menos de unos 5 carbonos son **solubles** en agua; con más, **escasamente solubles**.', rows: [['Etilamina (2 C)', 'soluble'], ['Octilamina (8 C)', 'poco soluble']] },
        { id: 'b32', deeper: 'Para hervir, las moléculas tienen que separarse, y si están tomadas de la mano con puentes de H cuesta más. Una amina **1°** tiene 2 H en el N (más puentes), una **2°** tiene 1 y una **3°** ninguno. Por eso, con la misma fórmula, la 1° hierve más alto que la 2°, y la 2° más que la 3°.', title: 'Puntos de ebullición', slide: 12, body: 'Más capacidad de formar puentes de H entre moléculas → más energía para separarlas → **mayor punto de ebullición**. Entre isómeros: 1° > 2° > 3°.',
          rows: [['Propilamina (1°)', '48 °C'], ['Etilmetilamina (2°)', '37 °C'], ['Trimetilamina (3°)', '3 °C']], note: 'Las tres son C₃H₉N: misma masa. La diferencia es solo cuántos N–H tienen.' },
        { id: 'b33', deeper: 'Las aminas chicas se evaporan fácil y llegan rápido a tu nariz: el olor a pescado es **trimetilamina**. Cuando las proteínas se descomponen, algunos aminoácidos pierden CO₂ y quedan aminas como la **putrescina** y la **cadaverina**.', title: 'Olor', slide: 13, body: 'Las aminas pequeñas, como la trimetilamina, huelen a **pescado**. La putrescina y la cadaverina aparecen cuando se descomponen proteínas.' },
        { id: 'b34', title: 'Sales y extracción', slide: 16, body: 'Al protonar una amina con un ácido se forma una **sal** (R–NH₃⁺ Cl⁻): iónica, soluble en agua, sin olor y más estable. Por eso los fármacos se venden como clorhidratos. Y sirve para **separar** aminas de compuestos neutros.',
          deeper: 'Extracción: amina + compuesto neutro en éter. Agregas HCl acuoso: la amina se protona, se vuelve ion y se va al agua; el neutro se queda en el éter. Separas las capas. Al agua le agregas NaOH: la amina pierde el H⁺, vuelve a ser neutra y sale del agua.' }
      ],
      worked: {
        prompt: 'Tienes ciclohexilamina mezclada con naftaleno (neutro), ambos disueltos en éter. Sepáralos.',
        steps: [
          { text: 'Agrega HCl acuoso: la amina (base) capta el H⁺ y queda como **cloruro de ciclohexilamonio**, un ion.', ask: '¿Qué le pasa a la amina cuando agregas HCl?' },
          { text: 'Los iones se disuelven en agua: la sal pasa a la **fase acuosa**; el naftaleno se queda en el **éter**. Separas las dos capas.' },
          { text: 'A la fase acuosa le agregas **NaOH**: le quita el H⁺ al ion amonio y la amina vuelve a ser neutra, poco soluble en agua. La recuperas.', ask: '¿Cómo recuperas la amina libre?' }
        ]
      },
      practice: [
        order('m3-p1', 'Ordena estos isómeros C₃H₉N de menor a mayor punto de ebullición.', [['tri', 'Trimetilamina (3°)'], ['etme', 'Etilmetilamina (2°)'], ['prop', 'Propilamina (1°)']], ['tri', 'etme', 'prop'],
          { direction: 'De menor a mayor punto de ebullición.', explain: 'Trimetilamina 3 °C < etilmetilamina 37 °C < propilamina 48 °C: más N–H, más puentes de H.', misconception: 'tertiary-donor', slide: 12, hint: 'Cuenta cuántos N–H tiene cada una.' }),
        classify('m3-p2', 'Clasifica según su solubilidad en agua.', [['sol', 'Soluble'], ['poco', 'Poco soluble']], [['me', 'Metilamina', 'sol'], ['et', 'Etilamina', 'sol'], ['bu', 'Butilamina', 'sol'], ['oc', 'Octilamina', 'poco'], ['de', 'Decilamina', 'poco']],
          { explain: 'Hasta unos 5 carbonos son solubles; con cadenas largas (8, 10 C) la parte apolar gana.', misconception: 'size-solubility', slide: 12, hint: 'Fíjate en el número de carbonos.' }),
        q('m3-p3', '¿Por qué los fármacos con aminas se venden como clorhidratos?', [{ text: 'Son más estables, solubles en agua y casi sin olor', correct: true }, { text: 'Porque así son más básicos', note: 'La sal ya está protonada: no es más básica.' }, { text: 'Porque son más volátiles', note: 'Al revés: las sales son sólidos iónicos de punto de fusión alto.' }], { explain: 'La sal resiste la oxidación, se disuelve en agua (jarabes, inyectables) y no huele. Ejemplo: efedrina funde a 79 °C y huele; su clorhidrato funde a 217 °C y casi no huele.', slide: 16, hint: 'Piensa en la efedrina y su clorhidrato.' })
      ],
      transfer: [
        q('m3-t1', 'Una amina y un compuesto neutro están en éter. Agregas HCl acuoso y separas las capas. ¿Dónde está la amina?', [{ text: 'En la fase acuosa, como R–NH₃⁺ Cl⁻', correct: true }, { text: 'En el éter, sin cambios', misconception: 'salt-organic' }, { text: 'Se evaporó con el éter', note: 'Al protonarse se vuelve una sal iónica, nada volátil.' }], { explain: 'Protonada es un ion: se disuelve en agua y se separa del compuesto neutro.', slide: 19 }),
        q('m3-t2', '¿Cómo recuperas la amina libre desde esa fase acuosa?', [{ text: 'Agregando NaOH', correct: true }, { text: 'Agregando más HCl', note: 'Eso la mantiene protonada.' }, { text: 'Calentando hasta evaporar el agua', note: 'Obtendrías la sal, no la amina libre.' }], { explain: 'La base fuerte le quita el H⁺ al ion amonio: la amina vuelve a ser neutra y sale del agua.', slide: 19 })
      ]
    }
  },
  /* ── Misión 4 (etapa 6: modelo de la clase viva) ── */
  {
    id: 'm4', title: 'Basicidad I: medirla con el pKa', subtitle: 'Cómo se compara la basicidad usando el pKa del ion amonio y hacia dónde va un equilibrio ácido–base', minutes: 25, slides: '17–20', pep: 'base de la pregunta 3',
    stages: {
      hook: { title: 'El anestésico del dentista se vende como sal', scene: LIDOCAINE, smiles: 'CCN(CC)CC(=O)Nc1c(C)cccc1C',
        sage: 'Aprendiz… la última vez que te pusieron anestesia, te inyectaron esta molécula.',
        text: 'La **lidocaína** se vende como **clorhidrato**: una sal, soluble en agua. Tiene dos N, pero solo uno atrapa el H⁺ del HCl: el de la **amina terciaria** (el otro es una amida, misión 5). En tu cuerpo, a pH 7,4, una parte vuelve a la forma neutra, que es la que cruza la membrana del nervio. Quién se protona y cuánto lo decide el **pKa**.' },
      diagnostic: [
        q('m4-d1', 'Un pKa alto del ion amonio (R–NH₃⁺) significa que la amina es…', [{ text: 'Fuertemente básica', correct: true }, { text: 'Débilmente básica', misconception: 'pka-inverted' }, { text: 'No se puede saber con el pKa', note: 'Justamente así se mide la basicidad de una amina.' }], { explain: 'Si al ion amonio le cuesta soltar el H⁺ (pKa alto), es porque la amina lo retiene bien: es una base fuerte.', slide: 18 }),
        q('m4-d2', 'En una reacción ácido–base, el equilibrio favorece…', [{ text: 'La formación del ácido más débil', correct: true }, { text: 'La formación del ácido más fuerte', misconception: 'strong-side' }, { text: 'Siempre a los reactivos', note: 'Depende de los pKa de cada lado.' }], { explain: 'El equilibrio va hacia el lado del ácido más débil (pKa mayor).', slide: 17 })
      ],
      fundamentals: [
        { id: 'f41', title: 'Desde cero: Ka y pKa', body: 'El **Ka** mide cuánto suelta un ácido su H⁺. El **pKa = −log Ka**: un pKa **bajo** es un ácido fuerte; un pKa **alto**, un ácido débil. Cada unidad de pKa es un factor 10.',
          deeper: 'Ácido acético, pKa 4,76; ion amonio de la trietilamina, pKa 10,76. Diferencia: 6 unidades = 10⁶. El ácido acético es un millón de veces más ácido.' },
        { id: 'f42', deeper: 'Imagina dos especies peleando por un H⁺. Se lo queda la que lo agarra más fuerte, y esa forma el **ácido más débil** (el que menos quiere soltarlo, de pKa más alto). Por eso el equilibrio siempre termina del lado del ácido con **pKa mayor**.', title: 'Desde cero: el lado débil gana', body: 'En HA + B ⇌ A⁻ + BH⁺ compiten dos ácidos: HA y BH⁺. El equilibrio se desplaza hacia el lado del **ácido más débil** (el de pKa mayor), que es el que menos quiere soltar su H⁺.' },
        { id: 'f43', deeper: 'Toda base tiene su «pareja ácida»: ella misma con un H⁺ más. Si la base es fuerte, su pareja ácida es débil, y al revés. En números, en agua: **pKa + pKb = 14**. Si el ion metilamonio tiene pKa 10,6, la metilamina tiene pKb 14 − 10,6 = **3,4**.', title: 'Desde cero: pares conjugados', body: 'Base + H⁺ → ácido conjugado. Para un par conjugado en agua a 25 °C: **Ka · Kb = Kw = 1,0 × 10⁻¹⁴**, es decir, **pKa + pKb = 14**.', rows: [['pKa del ion amonio', '10,6'], ['pKb de la amina', '14 − 10,6 = 3,4']] }
      ],
      explain: [],
      transfer: [
        q('m4-t1', 'Trietilamina en presencia de ácido acético. ¿En qué forma está mayoritariamente?', [{ text: 'Protonada, como ion trietilamonio', correct: true }, { text: 'Mitad y mitad', note: 'Con 6 unidades de diferencia de pKa no hay empate.' }, { text: 'Casi toda neutra', misconception: 'strong-side' }], { explain: 'El ion amonio (pKa 10,76) es un ácido mucho más débil que el acético (4,76): el equilibrio está desplazado a la sal. Solo 1 de cada millón queda neutra.', slide: 17 }),
        q('m4-t2', 'Un ácido HA (pKa 5) reacciona con una amina cuyo ion amonio tiene pKa 9. El equilibrio está…', [{ text: 'Desplazado hacia la sal (productos)', correct: true }, { text: 'Desplazado hacia los reactivos', misconception: 'strong-side' }, { text: 'Exactamente en el medio', note: 'Hay 4 unidades de diferencia: K = 10⁴.' }], { explain: 'El ion amonio (pKa 9) es el ácido más débil: se favorece su formación, con K = 10^(9−5) = 10⁴.', slide: 17 }),
        write('m4-w1', 'Explícalo con tus palabras: ¿por qué la trietilamina queda casi toda protonada en ácido acético?',
          'Comparo los dos ácidos del equilibrio: el ácido acético (pKa 4,76) y el ion trietilamonio (pKa 10,76). El equilibrio favorece al ácido más débil, el de pKa mayor: el ion trietilamonio. Como la diferencia es de 6 unidades (K = 10⁶), casi toda la amina queda protonada.',
          ['Comparé los pKa de los dos ácidos (4,76 y 10,76)', 'Dije que el equilibrio favorece al ácido más débil (el de pKa mayor)', 'Concluí que la amina queda como ion trietilamonio'],
          { explain: 'El H⁺ termina donde lo agarran más fuerte: en el lado del ácido más débil.', slide: 17 })
      ]
    },
    parts: [
      { id: 'r1', intro: 'Parte 1: **medir la basicidad con un número**. El pKa del ion amonio te dice qué tan fuerte agarra la amina su H⁺.',
        pretest: q('m4-pre1', 'Una amina retiene muy bien el H⁺ que atrapa. ¿El pKa de su ion amonio será alto o bajo?', [{ text: 'Alto', correct: true }, { text: 'Bajo', note: 'Un pKa bajo es soltar el H⁺ con facilidad: lo contrario.' }, { text: 'No tiene relación', note: 'Justamente así se mide la basicidad.' }],
          { explain: 'Le cuesta soltar el H⁺ → pKa alto → amina fuertemente básica.', slide: 18, concept: 'am.pka' }),
        explain: [
          { id: 'b41', deeper: 'Pregúntale al ion amonio: «¿te cuesta soltar tu H⁺?». Si su pKa es **alto** (10–11), le cuesta mucho: la amina lo agarra fuerte, es una base **fuerte**. Si el pKa es **bajo** (4,6 en la anilina), lo suelta fácil: la amina es una base **débil**.', title: 'La basicidad se mide con el pKa del ion amonio', slide: 18, body: 'En vez de dar el Kb de la amina, normalmente se da el **pKa de su ácido conjugado** (el ion amonio, a veces escrito pKaH). Mientras **más alto**, **más básica** la amina.',
          rows: [['NH₄⁺ (amoníaco)', 'pKa 9,25'], ['CH₃NH₃⁺ (metilamina)', 'pKa 10,66'], ['C₆H₅NH₃⁺ (anilina)', 'pKa 4,6']] },
          { id: 'b43', deeper: 'pKa y pKb miden lo mismo desde dos lados. Si te dan el pKb de la amina, réstalo de 14 y tienes el pKa del ion amonio: pKb 3,36 → pKa **10,64**. Así comparas todas las aminas en una sola escala.', title: 'Ka y Kb', slide: 20, body: 'Si te dan Kb (o pKb) de la amina, puedes pasar al pKa del ion amonio con **pKa + pKb = 14**. Vale para cualquier par ácido–base conjugado.' }
        ],
        practice: [
          q('m4-p1', 'Amina A: pKa del ion amonio 10,7. Amina B: 4,6. ¿Cuál es más básica?', [{ text: 'A', correct: true }, { text: 'B', misconception: 'pka-inverted' }, { text: 'Igual de básicas', note: 'Hay 6 unidades de diferencia: un millón de veces.' }], { explain: 'Mayor pKa del ion amonio = base más fuerte. A podría ser una alquilamina; B se parece a la anilina.', slide: 18, hint: 'pKa alto del ion amonio = le cuesta soltar el H⁺.' , concept: 'am.pka' }),
          q('m4-p2', 'El pKa de un ion amonio es 10,6. ¿Cuál es el pKb de la amina?', [{ text: '3,4', correct: true }, { text: '10,6', note: 'Ese es el pKa del ácido conjugado, no el pKb.' }, { text: '24,6', misconception: 'sum14' }], { explain: 'pKa + pKb = 14 → pKb = 14 − 10,6 = 3,4.', slide: 20, hint: 'pKa + pKb = 14.' , concept: 'am.pka' }),
          order('m4-p3', 'Ordena de menor a mayor basicidad usando el pKa de su ion amonio.', [['an', 'Anilina (4,6)'], ['nh3', 'Amoníaco (9,25)'], ['me', 'Metilamina (10,66)']], ['an', 'nh3', 'me'],
          { direction: 'De menor a mayor basicidad.', explain: 'Mayor pKa del ion amonio = más básica: anilina < amoníaco < metilamina.', misconception: 'pka-inverted', slide: 18, hint: 'Ordena por el número entre paréntesis.' , concept: 'am.pka' }),
          { id: 'm4-a1', type: 'arrows', source: SRC, concept: 'am.pka', slide: 17, ...PROTON, answer: [['lp:n', 'a:h'], ['b:6', 'a:o1']],
            prompt: 'Trietilamina + ácido acético. Dibuja las 2 flechas: la amina atrapa el H⁺ del ácido.',
            notes: { 'lp:n>a:c': 'Eso sería atacar al C=O (como en la acilación). Con un ácido carboxílico gana lo más rápido: atrapar el H⁺ del O–H.', 'lp:n>a:o1': 'El N no ataca al O: busca el H que está unido al O.',
              'b:6>a:h': 'El enlace O–H se rompe hacia el O, que se lleva los electrones: queda acetato, CH₃COO⁻.', 'lp:o1>a:h': 'El O ya está unido a ese H: el que ataca es el N de la amina.' },
            explain: 'El par del N atrapa el H y el enlace O–H se rompe hacia el O: se forman el ion trietilamonio y el acetato.',
            hint: 'Una flecha sale del par libre del N hacia el H. La otra rompe el enlace O–H.' }
        ],
        rule: { title: 'Regla del pKa', concept: 'am.pka', steps: ['Busca el pKa del **ion amonio** (pKaH), no el de la amina.', '**Mayor pKaH → base más fuerte.** Anilina 4,6 < amoníaco 9,25 < metilamina 10,66.', 'Si te dan pKb: **pKa = 14 − pKb**.'] } },
      { id: 'r2', intro: 'Parte 2: **hacia dónde va el equilibrio**. Cuando mezclas una amina con un ácido, ¿quién se queda con el H⁺?',
        pretest: q('m4-pre2', 'Mezclas una amina con ácido acético. ¿Qué crees que pasa?', [{ text: 'La amina se protona casi entera', correct: true }, { text: 'No pasa nada: el acético es un ácido débil', note: 'Débil comparado con el HCl, pero mucho más ácido que el ion amonio.' }, { text: 'Queda mitad y mitad', note: 'Los pKa son muy distintos: no hay empate.' }],
          { explain: 'El H⁺ termina en la amina: el ion amonio es el ácido más débil.', slide: 17, concept: 'am.equilibrio' }),
        explain: [
          { id: 'b42', deeper: 'Compara los dos pKa: acético 4,76 contra trietilamonio 10,76. Son 6 unidades y cada una vale un factor 10: la constante del equilibrio es **10⁶**. El H⁺ se va con quien lo agarra más fuerte (la amina), así que el equilibrio queda muy desplazado hacia la sal. La diapositiva lo resume como «1 de cada 1.000.000 queda neutra».', title: 'Trietilamina + ácido acético', slide: 17, body: 'Los ácidos en juego: ácido acético (pKa 4,76) e ion trietilamonio (pKa 10,76). El equilibrio favorece al ácido más débil, el ion amonio: la amina queda **casi toda protonada**, solo 1 de cada 1.000.000 moléculas queda neutra.',
          note: 'Por eso las aminas se protonan incluso con ácidos débiles: son bases más fuertes que alcoholes o éteres.' }
        ],
        practice: [
          { id: 'm4-poe1', type: 'poe', source: SRC, concept: 'am.equilibrio', slide: 17,
            prompt: 'Predice, observa y explica: metilamina (pKa del ion amonio 10,6) en distintos pH.',
            predict: 'Si el pH baja de 12 a 7, ¿qué crees que le pasa a la metilamina?',
            options: [{ text: 'Se protona casi entera: queda como CH₃NH₃⁺', correct: true }, { text: 'Se queda neutra', note: 'Por debajo de su pKa domina la forma con H⁺.' }, { text: 'Se descompone', note: 'Solo gana o pierde un H⁺: no se rompe.' }],
            sim: { name: 'pH', unit: '', min: 2, max: 13, step: 0.5, start: 12, threshold: 10.6, look: 'ph', label: 'Mueve el pH y mira la amina.',
              below: '**Protonada**: casi toda como CH₃NH₃⁺. Por debajo del pKa (10,6) domina la forma con H⁺. Así está en tu sangre (pH 7,4).', above: 'Sobre el pKa (10,6) domina la **amina neutra**, CH₃NH₂.' },
            explain: 'Cuando el pH está por debajo del pKa del ion amonio, la amina está mayoritariamente protonada; por encima, neutra. A pH = pKa, mitad y mitad.',
            hint: 'Compara el pH con el pKa del ion amonio: ¿cuál es mayor?' },
          { id: 'm4-fx1', type: 'spot', source: SRC, concept: 'am.equilibrio', slide: 17,
            prompt: 'Un aprendiz analizó trietilamina + ácido acético. Revisa su hoja: ¿en qué paso se equivocó?',
            steps: ['Identifica los ácidos: CH₃COOH (pKa 4,76) y Et₃NH⁺ (pKa 10,76)', 'Compara: 4,76 es menor que 10,76', 'Concluye: gana el lado del ácido más fuerte, la izquierda', 'Dice que la amina queda casi toda neutra'], wrong: 2,
            stepNotes: { 0: 'Bien: esos son los dos ácidos en juego.', 1: 'Bien comparado.', 3: 'Esa conclusión viene del error anterior.' },
            fix: { question: '¿Qué debió concluir?', options: [{ text: 'Gana el lado del ácido más débil (pKa mayor): la derecha', correct: true }, { text: 'Gana el lado con más moléculas', note: 'No se cuentan moléculas: se comparan los pKa.' }, { text: 'Quedan mitad y mitad', note: '6 unidades de pKa son un millón a uno.' }] },
            explain: 'El equilibrio favorece al ácido más débil, el ion trietilamonio (10,76): la amina queda casi toda protonada.', hint: '¿El equilibrio favorece al ácido fuerte o al débil?' },
          q('m4-q5', 'HA (pKa 3) + una amina cuyo ion amonio tiene pKa 10. ¿Cuánto vale Keq?', [{ text: '10⁷', correct: true }, { text: '10⁻⁷', note: 'Va al revés: pKa del ácido producto (10) menos el del reactivo (3) = +7.' }, { text: '7', note: 'La diferencia es el exponente: Keq = 10 elevado a 7.' }],
            { explain: 'Keq = 10^(10 − 3) = 10⁷: muy desplazado hacia la sal.', slide: 17, hint: 'Keq = 10 elevado a (pKa del ácido producto − pKa del ácido reactivo).', concept: 'am.equilibrio' })
        ],
        rule: { title: 'Regla del lado débil', concept: 'am.equilibrio', steps: ['Encuentra los **dos ácidos**: uno a cada lado de la flecha.', 'Gana el lado del ácido con **pKa mayor** (el más débil).', 'Cuánto: **Keq = 10^(pKa del ácido producto − pKa del ácido reactivo)**.'] } }
    ]
  },
  /* ── Misión 5 (etapa 6: modelo de la clase viva) ── */
  {
    id: 'm5', title: 'Basicidad II: qué la sube y qué la baja', subtitle: 'Resonancia, sustituyentes, heterociclos e hibridación: la pregunta 3 de la PEP', minutes: 30, slides: '21–28', pep: 'pregunta 3 (1,0 pt)',
    stages: {
      hook: { title: 'La nicotina tiene dos nitrógenos', scene: NICOTINE, smiles: 'CN1CCCC1c1cccnc1',
        sage: 'Aprendiz… esta molécula tiene dos N. Solo uno se protona en tu sangre. ¿Cuál?',
        text: 'La **nicotina** tiene un N en un anillo aromático (**piridina**, sp²) y otro en un anillo saturado (**pirrolidina**, sp³). El de la pirrolidina es mucho más básico (pKa de su ion amonio ≈ 8; el de la piridina ≈ 3): es el que se protona en la sangre. Al final de esta misión vas a ordenar por basicidad como en la **pregunta 3 de la PEP**.' },
      diagnostic: [
        q('m5-d1', '¿Cuál es más básica: ciclohexilamina o anilina?', [{ text: 'Ciclohexilamina', correct: true }, { text: 'Anilina', misconception: 'aromatic-more' }, { text: 'Igual, ambas son aminas primarias', note: 'Ser primarias no basta: importa si el par está deslocalizado.' }], { explain: 'En la anilina el par del N se deslocaliza en el anillo. Ciclohexilamina: pKa del ion amonio 10,6; anilina: 4,6.', slide: 23 }),
        q('m5-d2', '¿Cuál es más básica: piridina o pirrol?', [{ text: 'Piridina', correct: true }, { text: 'Pirrol', misconception: 'pyrrole-pair' }, { text: 'Igual, ambos son aromáticos con N', misconception: 'pyrrole-pair' }], { explain: 'El par de la piridina no participa en la aromaticidad; el del pirrol sí. La piridina es unas 10⁵ veces más básica.', slide: 26 })
      ],
      fundamentals: [
        { id: 'f51', title: 'Desde cero: resonancia', body: 'Cuando un par libre está junto a enlaces π con orbitales p alineados, sus electrones pueden **repartirse** sobre varios átomos. Repartir = **estabilizar**. Un par repartido está menos disponible para captar un H⁺.',
          deeper: 'En la anilina el N está pegado al anillo: su par se mete en el sistema π del benceno. Para protonar el N hay que "sacar" ese par del anillo y se pierde la estabilización. Por eso la anilina prefiere no protonarse: es menos básica.', slide: 23 },
        { id: 'f52', title: 'Desde cero: aromaticidad en un minuto', body: 'Un anillo **plano**, **conjugado** y con **4n + 2 electrones π** (2, 6, 10…, regla de Hückel) es aromático: muy estable. Perder la aromaticidad cuesta mucha energía.',
          deeper: 'Pirrol: anillo de 5 con un N–H. Para llegar a 6 electrones π necesita los 2 del par libre del N. Si protonas ese N, el par se va al enlace con el H⁺ y el anillo deja de ser aromático. Piridina: anillo de 6 como el benceno; ya tiene 6 electrones π sin el par del N, que queda libre "afuera" en un orbital sp².' },
        { id: 'f53', deeper: 'Piensa en los electrones como una frazada que comparten los átomos. Un grupo **electronegativo** (O, Cl, NO₂) tira la frazada para su lado y deja al N con menos: le cuesta más atrapar un H⁺ (**menos básico**). Un **alquilo** empuja un poco de frazada hacia el N (**más básico**).', title: 'Desde cero: efecto inductivo', body: 'Átomos o grupos **electronegativos** (O, Cl, NO₂) atraen densidad electrónica a través de los enlaces σ y la sacan del N: bajan la basicidad. Los grupos alquilo **donan** un poco: la suben.' }
      ],
      explain: [],
      challenge: [
        order('m5-c1', 'Desafío: ordena de menor a mayor basicidad.', [['cn', 'Acetonitrilo (N sp)'], ['py', 'Piridina (N sp²)'], ['et3n', 'Trietilamina (N sp³)']], ['cn', 'py', 'et3n'],
          { direction: 'De menor a mayor basicidad.', explain: 'Más carácter s, menos básico: sp (acetonitrilo, pKb 24) < sp² (piridina, 5,2) < sp³ (trietilamina, 10,75).', misconception: 'hybrid-s', slide: 27, hint: 'Más carácter s retiene más los electrones.' })
      ],
      transfer: [
        order('m5-t1', 'Estilo PEP: ordena de menor a mayor basicidad.', [['pyrrole', 'Pirrol'], ['pyridine', 'Piridina'], ['piperidine', 'Piperidina (anillo saturado con N–H)']], ['pyrrole', 'pyridine', 'piperidine'],
          { direction: 'De menor a mayor basicidad.', explain: 'Pirrol (par en el sexteto aromático) < piridina (sp², pKa 5,2) < piperidina (sp³, pKa ≈ 11).', misconception: 'pyrrole-pair', slide: 26 }),
        q('m5-t2', '¿Por qué el pirrol casi no es básico?', [{ text: 'Porque protonar su N destruiría la aromaticidad', correct: true }, { text: 'Porque su N no tiene par libre', note: 'Sí lo tiene, pero ese par forma parte del sexteto aromático.' }, { text: 'Porque su N es sp³', misconception: 'pyrrole-pair' }], { explain: 'Su par libre es uno de los 6 electrones π. Usarlo para captar un H⁺ rompe la aromaticidad: cuesta demasiado.', slide: 26 }),
        write('m5-w1', 'Explícalo con tus palabras: ¿por qué la anilina es mucho menos básica que la ciclohexilamina?',
          'En la anilina el par libre del N está deslocalizado en el anillo por resonancia, así que está menos disponible para captar un H⁺. Además, al protonarla se pierde esa estabilización. En la ciclohexilamina el par queda localizado en el N. Por eso el pKa del ion anilinio es 4,6 y el del ciclohexilamonio 10,6.',
          ['Dije que el par libre de la anilina se reparte en el anillo (resonancia)', 'Dije que así está menos disponible para captar un H⁺', 'Comparé con la ciclohexilamina, donde el par queda en el N'],
          { explain: 'Un par repartido es un par menos disponible.', slide: 23 })
      ]
    },
    parts: [
      { id: 'r1', intro: 'Parte 1: **cuando el par se reparte**. La resonancia le quita al N su par disponible.',
        pretest: q('m5-pre1', 'La anilina tiene su NH₂ pegado a un benceno. Comparada con la ciclohexilamina, ¿crees que es más o menos básica?', [{ text: 'Menos básica', correct: true }, { text: 'Más básica', note: 'El anillo no le regala electrones al N: se los lleva.' }, { text: 'Igual', note: 'Ser 1° no basta: importa dónde está el par.' }],
          { explain: 'El par del N de la anilina se reparte por el anillo: está menos disponible.', slide: 23, concept: 'am.resonancia' }),
        explain: [
          { id: 'b51', deeper: 'En la anilina, el par libre del N no se queda en el N: se **reparte por el anillo** (resonancia). Repartido, está menos disponible para atrapar un H⁺. En la ciclohexilamina el par se queda en el N, listo para usarse. Por eso la anilina es **un millón de veces** menos básica (pKa 4,6 contra 10,6).', title: 'Resonancia: arilaminas débiles', slide: 25, body: 'En las arilaminas el par del N está deslocalizado por el anillo, así que el ion amonio es más ácido (pKa menor) que el de una alquilamina.', rows: [['Ciclohexilamina', 'pKa 10,6'], ['Anilina', 'pKa 4,6']] },
          { id: 'b51m', title: 'El par de la anilina, paso a paso', slide: 23, body: 'Mira cómo el par del N se mete en el anillo.',
            deeper: 'El par libre del N empuja hacia el anillo y forma un doble enlace C=N; para no pasarse de enlaces, un doble enlace del anillo mueve sus electrones hacia un carbono vecino, que queda con carga −. Ese "−" puede seguir moviéndose hasta la posición para. El par ya no está solo en el N: está repartido. Para atrapar un H⁺ habría que juntarlo otra vez, y eso cuesta.',
            frames: [
              { ...ANIL_R1, caption: '**Paso 1.** El par libre del N forma un doble enlace con el anillo; los electrones de un C=C del anillo se van al carbono **orto**.' },
              { ...ANIL_R2, caption: '**Paso 2.** Ahora el N tiene carga + y el carbono orto carga −. Ese par puede moverse otra vez, hacia la posición **para**.' },
              { ...ANIL_R3, caption: '**Resultado.** El par del N está repartido por el anillo (orto y para). Menos disponible para el H⁺: la anilina es un millón de veces menos básica que la ciclohexilamina.' }
            ] },
          { id: 'b52', deeper: 'En una amida el N está pegado a un **C=O**, un gran «ladrón» de electrones. El par libre del N se va hacia el oxígeno por resonancia. Resultado: el N casi no tiene par disponible, así que **no atrapa H⁺** (no es básico) **ni ataca carbonos** (no es nucleófilo).', title: 'Amidas: el caso extremo', slide: 22, body: 'En una amida (R–CO–NH₂) el par del N se deslocaliza hacia el C=O. El N casi no tiene densidad electrónica: **no es básico ni nucleófilo**.' },
          { id: 'b53', deeper: 'El anillo es un puente entre el sustituyente y el N. Si el sustituyente **da** electrones (–OCH₃), le llegan un poco al N y la amina es algo más básica. Si los **quita** con fuerza (–NO₂), le roba todavía más al N: la p-nitroanilina (pKa 1,0) es unas **4.000 veces** menos básica que la anilina.', title: 'Sustituyentes en el anillo', slide: 24, body: 'Un **donador** (–OCH₃) devuelve densidad al anillo y sube un poco la basicidad. Un **aceptor** (–NO₂) saca todavía más densidad del N y la baja mucho.',
          rows: [['p-Metoxianilina', 'pKa 5,3'], ['Anilina', 'pKa 4,6'], ['p-Nitroanilina', 'pKa 1,0']] }
        ],
        practice: [
          q('m5-tw1', 'Casos gemelos: las dos son aminas primarias con un anillo de 6. ¿Cuál es más básica?', [{ text: 'B, la ciclohexilamina: su par no se reparte', correct: true }, { text: 'A, la anilina: el anillo le da electrones', misconception: 'aromatic-more' }, { text: 'Iguales: ambas son 1°', note: 'Ser 1° no basta: importa si el par está deslocalizado.' }],
            { figures: [{ scene: ANILINE, lonePairs: { n: 1 }, lpAngle: { n: 0 }, caption: 'A: anilina' }, { scene: CYCLOHEXYLAMINE, lonePairs: { n: 1 }, lpAngle: { n: 0 }, caption: 'B: ciclohexilamina' }],
              explain: 'Lo único que cambia es si el anillo es aromático. En la anilina el par entra al anillo (pKaH 4,6); en la ciclohexilamina queda en el N (10,6).', slide: 23, hint: '¿En cuál puede repartirse el par del N?', concept: 'am.resonancia' }),
          order('m5-p1', 'Ordena de menor a mayor basicidad.', [['nitro', 'p-Nitroanilina'], ['an', 'Anilina'], ['meo', 'p-Metoxianilina'], ['cy', 'Ciclohexilamina']], ['nitro', 'an', 'meo', 'cy'],
          { direction: 'De menor a mayor basicidad.', explain: 'p-Nitroanilina (1,0) < anilina (4,6) < p-metoxianilina (5,3) < ciclohexilamina (10,6).', misconception: 'subst-effect', slide: 24, hint: 'Primero separa la que no tiene anillo; después mira donador y aceptor.' , concept: 'am.resonancia' }),
          pick('m5-p3', 'En H₂N–CH₂–CH₂–NH–CO–CH₃, toca el nitrógeno más básico.', [[{ t: 'H₂N', target: 'amine' }, { t: '–CH₂–CH₂–' }, { t: 'NH', target: 'amide' }, { t: '–CO–CH₃' }]],
          { amine: { label: 'El NH₂ (amina)' }, amide: { label: 'El NH de la amida', misconception: 'amide-basic' } }, 'amine',
          { explain: 'El NH₂ es una amina alifática con su par libre disponible. El NH pegado al C=O es una amida: su par está deslocalizado y no es básico.', slide: 22, captions: ['N-(2-aminoetil)acetamida'], hint: '¿Cuál N está pegado a un C=O?' , concept: 'am.resonancia' })
        ],
        rule: { title: 'Regla de la resonancia', concept: 'am.resonancia', steps: ['¿El par del N puede repartirse en un **anillo aromático** o hacia un **C=O**?', 'Si sí → **menos básica**: alquilamina ≫ arilamina ≫ amida.', 'En el anillo: **donadores** (–OCH₃) suben un poco; **aceptores** (–NO₂) bajan mucho.'] } },
      { id: 'r2', intro: 'Parte 2: **nitrógenos en anillos**. Pirrol, piridina y la hibridación del N.',
        pretest: q('m5-pre2', 'Pirrol y piridina tienen un N en un anillo aromático. ¿Crees que son igual de básicos?', [{ text: 'No: la piridina es mucho más básica', correct: true }, { text: 'Sí, ambos tienen un N con par', note: 'El par del pirrol está ocupado en la aromaticidad.' }, { text: 'No: el pirrol es más básico', note: 'Al revés: protonar el pirrol rompería su aromaticidad.' }],
          { explain: 'El par del pirrol es parte de los 6 electrones π; el de la piridina queda afuera.', slide: 26, concept: 'am.heterociclos' }),
        explain: [
          { id: 'b54', deeper: 'Los dos tienen el N en un anillo aromático, pero el par libre está en lugares distintos. En el **pirrol**, el par es parte de los 6 electrones aromáticos: si lo usara para atrapar un H⁺, el anillo dejaría de ser aromático, y no le conviene. En la **piridina**, el par apunta hacia afuera del anillo y no participa en la aromaticidad: puede atrapar un H⁺ sin perder nada.', title: 'Pirrol y piridina', slide: 26, body: 'En el **pirrol** el par libre es parte del sexteto aromático: protonarlo destruiría la aromaticidad, así que es una base extremadamente débil. En la **piridina** el par está en un orbital sp², fuera del sistema π: se puede protonar sin perder la aromaticidad.', note: 'La piridina es unas 100.000 veces más básica que el pirrol.' },
          { id: 'b55', deeper: 'Más carácter **s** = electrones más cerca del núcleo = más «apretados». El N **sp³** (25 % s) los tiene sueltos y los presta fácil; el **sp²** (33 %) un poco menos; el **sp** (50 %) casi nada. Por eso: alquilamina (sp³) > piridina (sp²) > nitrilo (sp).', title: 'Hibridación y basicidad', slide: 27, body: 'Un orbital con más carácter s mantiene sus electrones más cerca del núcleo: están menos disponibles. Basicidad: **sp³ > sp² > sp**.',
          rows: [['Alquilamina (N sp³)', 'pKa 10–11'], ['Piridina (N sp²)', 'pKa 5,2'], ['Acetonitrilo (N sp)', 'pKb 24: muy débil']] }
        ],
        practice: [
          q('m5-tw2', 'Casos gemelos: dos anillos aromáticos con un N. ¿Cuál es más básico?', [{ text: 'B, la piridina: su par queda fuera de los 6 π', correct: true }, { text: 'A, el pirrol: tiene N–H', misconception: 'pyrrole-pair' }, { text: 'Iguales: ambos son aromáticos con N', misconception: 'pyrrole-pair' }],
            { figures: [{ scene: PYRROLE, lonePairs: { n: 1 }, lpAngle: { n: -90 }, caption: 'A: pirrol' }, { scene: PYRIDINE, lonePairs: { r0: 1 }, lpAngle: { r0: 0 }, caption: 'B: piridina' }],
              explain: 'En el pirrol los 2 electrones del N completan el sexteto aromático. En la piridina el sexteto ya está completo y el par apunta hacia afuera, en un orbital sp².', slide: 26, hint: 'Cuenta los electrones π de cada anillo sin el par del N.', concept: 'am.heterociclos' }),
          pick('m5-p2', 'La nicotina tiene dos nitrógenos. Toca el más básico.', [[{ t: 'N del anillo de seis (aromático)', target: 'pyr' }], [{ t: 'N–CH₃ del anillo de cinco (saturado)', target: 'pyrr' }]],
          { pyr: { label: 'N de la piridina', misconception: 'hybrid-s' }, pyrr: { label: 'N de la pirrolidina' } }, 'pyrr',
          { explain: 'El N de la pirrolidina es sp³ con su par libre localizado (su ion amonio tiene pKa ≈ 8). El de la piridina es sp²: su par está más retenido (pKa ≈ 3 en la nicotina). Justo lo que pregunta la PEP: "¿cuál N es más básico?"', slide: 27, captions: ['Nicotina'], hint: '¿Cuál de los dos N es como el de una amina común, y cuál como el de la piridina?' , concept: 'am.heterociclos' }),
          { id: 'm5-fx1', type: 'spot', source: SRC, concept: 'am.heterociclos', slide: 26,
            prompt: 'Un aprendiz ordenó pirrol, piridina y piperidina por basicidad. Revisa su hoja: ¿en qué paso se equivocó?',
            steps: ['Pirrol: su N tiene par libre, así que es bastante básico', 'Piridina: N sp² con el par afuera del anillo', 'Piperidina: N sp³, como una amina común', 'Orden: piridina < pirrol < piperidina'], wrong: 0,
            stepNotes: { 1: 'Bien: ese par está disponible, aunque más retenido que en un sp³.', 2: 'Bien: es la más básica de las tres.', 3: 'Ese orden sale del error del primer paso.' },
            fix: { question: '¿Qué debió decir del pirrol?', options: [{ text: 'Su par es parte de los 6 electrones π: casi no es básico', correct: true }, { text: 'Su N es sp³', note: 'En el pirrol el N es sp²: su par está en un orbital p del anillo.' }, { text: 'Es el más básico porque tiene N–H', note: 'Tener N–H no da basicidad: lo que importa es el par.' }] },
            explain: 'Orden correcto: pirrol < piridina < piperidina.', hint: '¿El par del pirrol está libre o forma parte de la aromaticidad?' },
          classify('m5-p4', '¿Este factor sube o baja la basicidad del N?', [['up', 'Sube la basicidad'], ['down', 'Baja la basicidad']],
          [['res', 'Par libre deslocalizado en un anillo aromático', 'down'], ['no2', 'Grupo –NO₂ en el anillo', 'down'], ['sp', 'N con hibridación sp', 'down'], ['ome', 'Grupo –OCH₃ en para', 'up'], ['alk', 'Grupo alquilo unido al N (frente al NH₃)', 'up'], ['amide', 'N unido a un C=O (amida)', 'down']],
          { explain: 'Todo lo que deja el par menos disponible (resonancia, aceptores, más carácter s, amidas) baja la basicidad; los donadores la suben.', misconception: 'subst-effect', slide: 24, hint: 'Pregúntate: ¿el par queda más libre o más retenido?' , concept: 'am.orden' })
        ],
        rule: { title: 'Regla del par en el anillo', concept: 'am.heterociclos', steps: ['Si el par del N es parte de los **6 π** (pirrol) → casi **no básico**.', 'Si queda **afuera en sp²** (piridina) → básico, pero menos que un sp³.', 'Hibridación: **sp³ > sp² > sp**.'] } },
      { id: 'r3', intro: 'Parte 3: **el agua cambia el orden**. ¿Más grupos alquilo siempre es más básico?',
        pretest: q('m5-pre3', 'Los grupos alquilo donan electrones al N. ¿Crees que en agua la trimetilamina es la más básica de las metilaminas?', [{ text: 'No: en agua la dimetilamina gana', correct: true }, { text: 'Sí: tiene más grupos donadores', note: 'Eso vale en fase gaseosa. En agua importa también cómo se solvata el ion.' }],
          { explain: 'En agua: dimetilamina > metilamina > trimetilamina.', slide: 25, concept: 'am.orden' }),
        explain: [
          { id: 'b56', deeper: 'Hay dos efectos peleando. **1.** Cada alquilo empuja electrones al N: más grupos, más básica. **2.** En agua, el ion amonio se estabiliza con puentes de H usando los H del N: más grupos, menos H, menos estabilizado. La **secundaria** queda con el mejor balance; la terciaria dona más, pero casi no se estabiliza en agua.', title: 'En agua: 2° > 1° > 3°', slide: 25, body: 'Los alquilos donan densidad (suben la basicidad), pero en agua también importa cuánto se estabiliza el ion amonio con puentes de H. El balance deja a las secundarias arriba.',
          rows: [['Dimetilamina', 'pKa 10,73'], ['Metilamina', 'pKa 10,66'], ['Trimetilamina', 'pKa 9,80']], note: 'Este orden viene de tu apunte y de tablas estándar; la diapositiva 25 da el rango 10–11 para alquilaminas.' }
        ],
        practice: [
          order('m5-o3', 'En agua: ordena de menor a mayor basicidad.', [['nh3', 'Amoníaco (9,25)'], ['tri', 'Trimetilamina (9,80)'], ['mono', 'Metilamina (10,66)'], ['di', 'Dimetilamina (10,73)']], ['nh3', 'tri', 'mono', 'di'],
            { direction: 'De menor a mayor basicidad.', explain: 'NH₃ < trimetilamina < metilamina < dimetilamina: la 2° tiene el mejor balance entre donación y solvatación.', slide: 25, hint: 'Ordena por el pKa del ion amonio (entre paréntesis).', concept: 'am.orden' }),
          q('m5-q3', '¿Por qué la trimetilamina queda detrás de la metilamina en agua?', [{ text: 'Su ion amonio tiene un solo N–H y se estabiliza peor con el agua', correct: true }, { text: 'Los metilos atraen electrones', note: 'Los alquilos donan electrones; el problema es la solvatación.' }, { text: 'Es plana', note: 'Es piramidal, como todas las aminas simples.' }],
            { explain: 'El ion trimetilamonio tiene un solo N–H para formar puentes de H con el agua: se solvata peor y su amina es menos básica en agua.', slide: 25, hint: 'Piensa en los puentes de H entre el ion amonio y el agua.', concept: 'am.orden' }),
          write('m5-w2', 'Explícalo con tus palabras: ¿por qué en agua la dimetilamina es más básica que la trimetilamina?',
            'Los grupos metilo donan electrones al N y eso sube la basicidad, pero en agua también importa cómo se estabiliza el ion amonio con puentes de hidrógeno. El ion dimetilamonio tiene dos N–H y se solvata bien; el trimetilamonio tiene uno solo y se solvata peor. Por eso, en agua, la dimetilamina gana.',
            ['Dije que los alquilos donan electrones (suben la basicidad)', 'Dije que en agua el ion amonio se estabiliza con puentes de H en sus N–H', 'Concluí que el ion de la terciaria se solvata peor'],
            { explain: 'Donación + solvatación: la 2° tiene el mejor balance.', slide: 25, hint: 'Hay dos efectos: uno sube y otro baja. ¿Cuál pierde la terciaria?', concept: 'am.orden',
              keywords: [{ label: 'Donan electrones', any: ['donan', 'dona', 'inductiv', 'empujan'] }, { label: 'Puentes de H / solvatación', any: ['puente', 'solvat', 'agua', 'estabiliz'] }, { label: 'Menos N–H en la 3°', any: ['un solo', 'menos h', 'menos n-h', 'menos n–h', 'solo un h', 'un n-h', 'un n–h'] }] })
        ],
        rule: { title: 'Regla del agua', concept: 'am.orden', steps: ['En agua: **2° > 1° > 3° > NH₃** (dimetil 10,73 > metil 10,66 > trimetil 9,80 > NH₃ 9,25).', 'Los alquilos **donan** (suben), pero el ion de la 3° se **solvata peor** (baja).', 'Si la PEP dice "en solución acuosa", usa este orden.'] } }
    ]
  },
  /* ── Misión 6 (etapa 6: al modelo de la clase viva, como la misión 7) ── */
  {
    id: 'm6', title: 'Síntesis de aminas', subtitle: 'Tres recetas para fabricar aminas sin perder el control: las preguntas 4 y 6 de la PEP', minutes: 35, slides: '29–33', pep: 'preguntas 4 y 6',
    stages: {
      hook: { title: 'El paracetamol necesita una amina que hay que fabricar', scene: AMINOPHENOL, smiles: 'Nc1ccc(O)cc1',
        sage: 'Aprendiz… ¿te acuerdas del paracetamol? Antes de acilarlo, alguien tuvo que fabricar esta amina.',
        text: 'El paracetamol se hace desde el **p-aminofenol**. ¿De dónde sale ese –NH₂? Se puede obtener **reduciendo un grupo nitro**: p-nitrofenol + H₂ con catalizador (o Fe/HCl) → p-aminofenol. Es la receta 3 de hoy. Las recetas 1 y 2 te enseñan a poner un N en una cadena de carbonos **sin que se descontrole**.' },
      diagnostic: [
        q('m6-d1', '¿Qué problema tiene preparar una amina primaria con NH₃ + R–X?', [{ text: 'Sigue reaccionando y da mezcla de aminas', correct: true }, { text: 'El NH₃ no reacciona con haluros', note: 'Sí reacciona: es nucleófilo.' }, { text: 'Solo funciona con anillos aromáticos', note: 'Funciona con haluros de alquilo (SN2), no con anillos.' }], { explain: 'La amina formada también ataca al R–X: polialquilación.', slide: 30, concept: 'am.alquilacion' }),
        q('m6-d2', '¿Qué hace el LiAlH₄?', [{ text: 'Reduce (agrega H)', correct: true }, { text: 'Oxida', note: 'Es justo lo contrario: es un reductor fuerte.' }, { text: 'Deshidrata alcoholes', note: 'Eso lo hace un ácido fuerte con calor.' }], { explain: 'LiAlH₄ es un reductor fuerte: convierte azidas y amidas en aminas.', slide: 31, concept: 'am.reduccion' }),
        q('m6-d3', 'Una cetona + NH₃ + NaBH₃CN da…', [{ text: 'Una amina primaria', correct: true }, { text: 'Una amida', note: 'No se forma C=O nuevo: el C=O pasa a C–N.' }, { text: 'Un alcohol solamente', note: 'El NaBH₃CN es suave: reduce la imina que se forma, no tanto la cetona.' }], { explain: 'Aminación reductiva: con NH₃ sale una amina 1°.', slide: 32, concept: 'am.reduccion' })
      ],
      fundamentals: [
        { id: 'f61', title: 'Desde cero: SN2 en un minuto', body: 'Un **nucleófilo** ataca al C unido a un grupo saliente (Cl, Br, I) por el lado opuesto y lo desplaza **en un solo paso**. Funciona mejor en carbonos primarios.', deeper: 'Ejemplo: N₃⁻ + CH₃CH₂CH₂Br → CH₃CH₂CH₂N₃ + Br⁻. El nucleófilo entra por un lado y el Br sale por el otro, al mismo tiempo. Con carbonos muy tapados (3°) no se puede: gana la eliminación.', slide: 30 },
        { id: 'f62', title: 'Desde cero: reducir', body: '**Reducir** es agregar H o quitar O. Los reductores que vas a usar: **LiAlH₄** (fuerte), **NaBH₃CN** (suave), **H₂ con catalizador** y **Fe o Sn con HCl**.', deeper: 'Truco para reconocer una reducción: **cuenta los H y los O**. Si la molécula ganó H o perdió O, se redujo. Ar–NO₂ → Ar–NH₂ perdió 2 O y ganó 2 H. R–CO–NH₂ → R–CH₂–NH₂ perdió el O y ganó 2 H.', slide: 33 }
      ],
      explain: [],
      challenge: [
        q('m6-c1', 'Benzaldehído + metilamina + NaBH₃CN. ¿Producto?', [{ text: 'N-Metilbencilamina, C₆H₅CH₂–NH–CH₃', correct: true }, { text: 'Bencilamina, C₆H₅CH₂–NH₂', note: 'Para la primaria se usaría NH₃.' }, { text: 'N,N-Dimetilbencilamina', note: 'Se necesitaría dimetilamina.' }], { explain: 'El N gana un grupo más del que tenía: de 1° (metilamina) a 2°.', slide: 32, hint: 'El C del aldehído queda unido al N, y el N gana un grupo.', concept: 'am.reduccion' })
      ],
      transfer: [
        q('m6-t1', 'Ftalimida + 1) KOH, 2) CH₃CH₂CH₂Br, 3) H₂NNH₂. ¿Producto?', [{ text: 'Propilamina', correct: true }, { text: 'Dipropilamina', misconception: 'gabriel-poly' }, { text: 'N-Propilftalimida', misconception: 'gabriel-stop' }], { explain: 'Gabriel da solo la amina primaria: CH₃CH₂CH₂NH₂.', slide: 31, concept: 'am.alquilacion' }),
        q('m6-t2', 'Estilo PEP (pregunta 4b): ¿cómo preparas C₆H₅–CH₂–N(CH₃)₂?', [{ text: 'Benzaldehído + dimetilamina + NaBH₃CN', correct: true }, { text: 'Bencilamina + CH₃I en exceso', misconception: 'overalkylation' }, { text: 'Benceno + dimetilamina', note: 'El benceno no reacciona así con aminas: no hay grupo saliente.' }], { explain: 'Aminación reductiva: el C del aldehído queda unido al N de la dimetilamina, que pasa de 2° a 3°.', slide: 32, concept: 'am.reduccion' }),
        write('m6-w1', 'Tu compañero pregunta: «¿por qué no hago propilamina mezclando 1-bromopropano con NH₃, si es lo más directo?». Explícaselo y dile qué hacer.',
          'Porque la propilamina que se forma también tiene par libre y ataca a otro 1-bromopropano: se forma una mezcla de propilamina, dipropilamina, tripropilamina y sal cuaternaria. Para obtenerla pura conviene la síntesis de Gabriel (ftalimida con KOH, el bromuro y después hidrazina) o la vía azida (NaN₃ y luego LiAlH₄), que ponen el N una sola vez.',
          ['Dije que la amina producto también es nucleófila y sigue reaccionando', 'Dije que se obtiene una mezcla de aminas', 'Propuse Gabriel o la vía azida'],
          { explain: 'Sobrealquilación: la amina producto compite por el R–X. Gabriel o azida la evitan.', slide: 31, concept: 'am.alquilacion', teach: true,
            keywords: [{ label: 'Sigue reaccionando', any: ['sigue', 'vuelve a atacar', 'tambien ataca', 'tambien es nucleofil', 'otra vez', 'compite'] }, { label: 'Mezcla', any: ['mezcla', 'dipropil', 'tripropil', 'secundaria', 'terciaria', 'cuaternari'] }, { label: 'Gabriel o azida', any: ['gabriel', 'ftalimida', 'azida', 'nan3', 'nan₃'] }] }),
        write('m6-t3', 'Estilo PEP (pregunta 4): propón cómo obtener anilina partiendo de benceno. Escribe los reactivos de cada paso y qué se forma.',
          'Paso 1: nitración del benceno con HNO₃ y H₂SO₄, que da nitrobenceno. Paso 2: reducción del grupo nitro con Fe/HCl (o Sn/HCl, o H₂/Pt), que da la sal de anilinio; con NaOH se libera la anilina, C₆H₅–NH₂. No se puede hacer con NH₃ directo porque el benceno no hace SN2.',
          ['Nitré el benceno con HNO₃ / H₂SO₄ (nitrobenceno)', 'Reduje con Fe/HCl, Sn/HCl o H₂/Pt', 'Llegué a la anilina (y mencioné liberarla con base o por qué no sirve el NH₃)'],
          { explain: 'Nitrar y reducir: la forma típica de poner un NH₂ en un anillo.', slide: 33, concept: 'am.reduccion', paper: true,
            keywords: [{ label: 'Nitrar', any: ['hno3', 'hno₃', 'nitra', 'nitrobenceno'] }, { label: 'Reducir', any: ['fe', 'sn', 'h2', 'h₂', 'reduc'] }, { label: 'Anilina', any: ['anilina', 'c6h5nh2', 'c₆h₅–nh₂', 'nh2', 'nh₂'] }] })
      ]
    },
    parts: [
      { id: 'r1', intro: 'Receta 1: **poner un N en una cadena sin que se descontrole**. El camino directo (NH₃) se descontrola; la azida y Gabriel no.',
        pretest: q('m6-pre1', 'Mezclas bromoetano con un poco de NH₃ y calientas. ¿Qué crees que obtienes?', [{ text: 'Una mezcla: etilamina, dietilamina, trietilamina y sal cuaternaria', correct: true }, { text: 'Solo etilamina, limpia', note: 'Eso sería lo ideal, pero la etilamina también ataca al bromoetano.' }, { text: 'Nada: el NH₃ no reacciona', note: 'Sí reacciona: tiene un par libre.' }],
          { explain: 'La amina que se forma también es nucleófila y sigue atacando.', slide: 30, concept: 'am.alquilacion' }),
        explain: [
          { id: 'b61', title: 'Alquilación del amoníaco', slide: 30, body: 'NH₃ + R–X → R–NH₂, pero la amina producto también es nucleófila (incluso más) y vuelve a atacar: se obtiene una **mezcla** de 1°, 2°, 3° y sal cuaternaria. Un gran exceso de NH₃ favorece la primaria.',
            deeper: 'El NH₃ ataca al R–X y forma R–NH₂. El problema: esa amina nueva **también tiene par libre**, y es mejor nucleófila que el NH₃ (el R le dona electrones). Entonces compite por el R–X que queda y forma R₂NH, después R₃N y al final R₄N⁺. Para que gane la primaria se usa **mucho NH₃**: así es más probable que el R–X choque con NH₃ que con la amina.' },
          { id: 'b62', title: 'Síntesis de azida', slide: 31, body: '**R–X + NaN₃ → R–N₃** (SN2) y luego **LiAlH₄ → R–NH₂**. La azida entra una sola vez: no hay polialquilación.',
            deeper: 'La azida (N₃⁻) ataca una vez y queda como R–N₃, que **ya no es nucleófila**: no puede volver a atacar. Entra un solo R. Después el LiAlH₄ reduce el R–N₃ a R–NH₂ y se libera N₂. Resultado: **amina primaria limpia**.' },
          { id: 'b62m', title: 'La azida, paso a paso', slide: 31, body: 'Mira cómo entra el N una sola vez.',
            deeper: 'La azida es como un gancho con tres N. El N de la punta ataca al carbono del bromuro (SN2) y el Br se va. El R–N₃ que queda ya no tiene un par "con ganas" de atacar otra vez. Al final, el LiAlH₄ rompe la azida: sale N₂ (gas) y queda R–NH₂.',
            frames: [
              { ...AZ1, arrows: [['lp:nc', 'a:c1'], ['b:2', 'a:br']], caption: '**Paso 1 (SN2).** El N de la punta de la azida ataca al carbono unido al Br, por el lado opuesto. Al mismo tiempo, el enlace C–Br se rompe y sale Br⁻.' },
              { scene: AZ2, arrows: [], caption: '**Resultado del paso 1.** Queda la propilazida, CH₃CH₂CH₂–N₃. Ya no es nucleófila: no ataca a otro bromuro. No hay mezcla.' },
              { scene: AZ3, arrows: [], caption: '**Paso 2 (LiAlH₄).** La azida se reduce: se libera N₂ (gas) y queda la **propilamina**, CH₃CH₂CH₂–NH₂, limpia.' }
            ] },
          { id: 'b63', title: 'Síntesis de Gabriel', slide: 31, body: 'Ftalimida + KOH → **N⁻** (nucleófilo). + R–X (SN2) → **N-alquilftalimida**. + hidrazina (H₂N–NH₂) o hidrólisis → **R–NH₂** (amina primaria).',
            deeper: 'Por qué no sobrealquila: en la N-alquilftalimida el N ya no tiene H y su par está deslocalizado entre los dos C=O. No ataca a otro R–X. Al final la hidrazina corta los enlaces C–N del anillo y libera R–NH₂.' }
        ],
        practice: [
          { id: 'm6-a1', type: 'arrows', source: SRC, concept: 'am.alquilacion', slide: 31, ...AZ1, answer: [['lp:nc', 'a:c1'], ['b:2', 'a:br']],
            prompt: 'Dibuja las 2 flechas de la SN2: la azida ataca al 1-bromopropano.',
            notes: { 'lp:nc>a:br': 'La azida no ataca al Br: el Br ya tiene sus electrones. Ataca al carbono unido al Br (δ+).', 'b:2>a:c1': 'El enlace C–Br se rompe hacia el Br, que se lleva los electrones como Br⁻.',
              'lp:na>a:c1': 'Casi: ataca el N de la punta que está más cerca del carbono, el del lado derecho.', 'lp:nc>a:c2': 'El carbono que recibe el ataque es el que tiene el Br, no su vecino.' },
            explain: 'El par del N terminal ataca al C unido al Br y, al mismo tiempo, el enlace C–Br se rompe: sale Br⁻. Un solo paso (SN2).',
            hint: 'Una flecha nace en un par libre de la azida y llega al carbono δ+. La otra rompe el enlace con el grupo saliente.' },
          q('m6-p1', '¿Por qué NH₃ + R–X da mezcla de aminas?', [{ text: 'La amina formada también es nucleófila y sigue reaccionando', correct: true }, { text: 'El NH₃ se descompone', note: 'No se descompone: actúa como nucleófilo.' }, { text: 'Se forma un alqueno', note: 'La eliminación puede competir, pero no explica la mezcla de aminas.' }],
            { explain: 'Sobrealquilación: cada amina formada vuelve a atacar al R–X.', slide: 30, hint: 'Piensa en lo que tiene la amina recién formada: ¿le queda par libre?', concept: 'am.alquilacion' }),
          order('m6-p3', 'Ordena los pasos de la síntesis de Gabriel.', [['koh', 'Ftalimida + KOH (forma el N⁻)'], ['sn2', 'N⁻ + R–Br (SN2)'], ['hyd', 'Hidrazina (libera R–NH₂)']], ['koh', 'sn2', 'hyd'],
            { direction: 'Del primer al último paso.', explain: 'Primero se genera el nucleófilo, luego la alquilación y al final se libera la amina.', slide: 31, hint: '¿Qué necesitas antes de poder atacar al R–Br?', concept: 'am.alquilacion' }),
          { id: 'm6-rc1', type: 'recipe', source: SRC, concept: 'am.alquilacion', slide: 31,
            prompt: 'El caldero pide **propilamina pura** por la vía de **Gabriel**. Elige los ingredientes en orden.', base: '1-Bromopropano (CH₃CH₂CH₂Br)', target: 'propilamina pura',
            ingredients: [{ id: 'ftk', label: 'Ftalimida + KOH' }, { id: 'hyd', label: 'Hidrazina (H₂N–NH₂)' }, { id: 'nh3', label: 'NH₃' }, { id: 'lah', label: 'LiAlH₄' }, { id: 'mei', label: 'CH₃I' }, { id: 'nab', label: 'NaBH₃CN' }],
            answer: ['ftk', 'hyd'],
            notes: { nh3: 'Con NH₃ directo vuelves al problema: mezcla de aminas.', lah: 'El LiAlH₄ es para la vía azida (reduce R–N₃) o para amidas; en Gabriel la amina se libera con hidrazina.', mei: 'El CH₃I metila: no es parte de Gabriel.', nab: 'El NaBH₃CN es de la aminación reductiva (necesita un C=O).' },
            orderNote: 'Primero el N⁻ de la ftalimida ataca al bromuro; recién después la hidrazina libera la amina.',
            explain: 'Ftalimida/KOH hace la SN2 con el bromuro y la hidrazina libera CH₃CH₂CH₂NH₂.', hint: 'Paso 1: el nucleófilo que entra una sola vez. Paso 2: el que libera la amina.' },
          { id: 'm6-fx1', type: 'spot', source: SRC, concept: 'am.alquilacion', slide: 30,
            prompt: 'Un aprendiz quiso preparar propilamina pura. Revisa su hoja: ¿en qué paso se equivocó?',
            steps: ['Toma 1-bromopropano', 'Le agrega 1 equivalente de NH₃ y calienta', 'Separa el producto', 'Espera obtener propilamina pura'], wrong: 1,
            stepNotes: { 0: 'Ese paso está bien: es el haluro que necesita.', 2: 'Separar está bien; el problema es lo que hay en el matraz.', 3: 'Eso es lo que esperaba; el error está antes.' },
            fix: { question: '¿Qué debió hacer en ese paso?', options: [{ text: 'Usar Gabriel (ftalimida/KOH y luego hidrazina) o la vía azida', correct: true }, { text: 'Agregar más 1-bromopropano', note: 'Más R–X empeora la sobrealquilación.' }, { text: 'Agregar HCl', note: 'El HCl protona al NH₃ y le quita el par: no reacciona.' }] },
            explain: 'Con 1 equivalente de NH₃ la propilamina compite por el bromuro y sale una mezcla. Gabriel o azida lo evitan.', hint: '¿Qué hace la propilamina recién formada con el bromuro que queda?' },
          { id: 'm6-b1', type: 'build', source: SRC, concept: 'am.alquilacion', slide: 31, smiles: 'CCCN',
            prompt: 'Dibuja el producto de Gabriel con 1-bromopropano. Ya tienes el bromuro: cambia lo que corresponde.',
            start: BRPROP, target: PROPAMINE,
            explain: 'El N reemplaza al Br: CH₃CH₂CH₂–NH₂, propilamina.', hint: 'Elige N en las herramientas y toca dos veces el Br para cambiarlo.' }
        ] },
      { id: 'r2', intro: 'Receta 2: **del C=O al C–N**. Un aldehído o una cetona + una amina + un reductor suave: la aminación reductiva.',
        pretest: q('m6-pre2', 'Acetona + NH₃ + un reductor. ¿Dónde crees que queda el N?', [{ text: 'En el carbono que tenía el C=O', correct: true }, { text: 'En un CH₃ de la punta', note: 'Los CH₃ no reaccionan: el que tiene δ+ es el C del C=O.' }, { text: 'No se une: el NH₃ no reacciona con cetonas', note: 'Sí: el par del N ataca al C del C=O.' }],
          { explain: 'El N ataca al C del C=O; al final ese carbono queda unido al N.', slide: 32, concept: 'am.reduccion' }),
        explain: [
          { id: 'b64', title: 'Aminación reductiva', slide: 32, body: 'Aldehído o cetona + NH₃ o una amina, con un reductor (NaBH₃CN o H₂/catalizador). Se forma una imina que se reduce a amina. El tipo de producto depende de lo que pongas.',
            deeper: '**Paso 1:** el N ataca al C=O y, al perder agua, se forma una **imina** (C=N). **Paso 2:** el reductor convierte el C=N en C–N. Para predecir el producto: el C del carbonilo queda unido al N, y el N gana **un grupo más** del que tenía (NH₃ → 1°, 1° → 2°, 2° → 3°).',
            rows: [['Con NH₃', 'amina 1°'], ['Con amina 1°', 'amina 2°'], ['Con amina 2°', 'amina 3°']] },
          { id: 'b64m', title: 'Aminación reductiva, paso a paso', slide: 32, body: 'Mira cómo el C=O termina como C–N.',
            deeper: 'Primero el N se "casa" con el carbono del C=O y el O se va como agua: queda una imina (C=N). Después el reductor le entrega un H⁻ (hidruro) a ese carbono y el doble enlace C=N se vuelve simple. Resultado: el carbono que era C=O ahora lleva el N.',
            frames: [
              { ...RA1, arrows: [['lp:n', 'a:c'], ['b:0', 'a:o']], caption: '**Paso 1.** El par del N ataca al carbono δ+ del C=O; los electrones del C=O suben al oxígeno.' },
              { scene: RA2, arrows: [], caption: '**Paso 2.** Tras unos cambios de H⁺, sale una molécula de **agua** y queda la **imina** (C=N).' },
              { ...RA3, arrows: [['lp:hy', 'a:c'], ['b:0', 'a:n']], caption: '**Paso 3.** El reductor (NaBH₃CN) entrega un hidruro, H⁻, al carbono de la imina; los electrones del C=N pasan al N.' },
              { scene: RA4, arrows: [], caption: '**Resultado.** Isopropilamina (propan-2-amina): el C que era C=O ahora lleva el NH₂.' }
            ] }
        ],
        practice: [
          q('m6-tw1', 'Casos gemelos: la misma acetona, distinta amina. ¿Qué amina sale en cada caso (con NaBH₃CN)?', [{ text: 'A da una amina 1° y B una amina 2°', correct: true }, { text: 'Las dos dan amina 1°', note: 'El CH₃ de la metilamina se queda en el N: B gana un grupo.' }, { text: 'Las dos dan amina 2°', note: 'Con NH₃ el N solo gana el grupo del carbonilo: queda 1°.' }],
            { figures: [{ scene: RA1.scene, lonePairs: { n: 1 }, lpAngle: { n: -90 }, caption: 'A: acetona + NH₃' }, { scene: RA1B, lonePairs: { n: 1 }, lpAngle: { n: -90 }, caption: 'B: acetona + CH₃NH₂' }],
              explain: 'El N gana un grupo más del que tenía: NH₃ → 1° (isopropilamina); CH₃NH₂ → 2° (N-metilisopropilamina).', slide: 32, hint: 'Cuenta los grupos de carbono del N antes y después.', concept: 'am.reduccion' }),
          classify('m6-cl1', '¿Qué tipo de amina sale de cada aminación reductiva (con NaBH₃CN)?', [['p', 'Amina 1°'], ['s', 'Amina 2°'], ['t', 'Amina 3°']],
            [['c1', 'Acetona + NH₃', 'p'], ['c2', 'Benzaldehído + CH₃NH₂', 's'], ['c3', 'Ciclohexanona + (CH₃)₂NH', 't'], ['c4', 'Benzaldehído + NH₃', 'p'], ['c5', 'Acetona + etilamina', 's']],
            { explain: 'El N gana un grupo: NH₃ → 1°, amina 1° → 2°, amina 2° → 3°.', slide: 32, hint: 'Mira cuántos carbonos tiene el N al principio y súmale uno.', concept: 'am.reduccion' }),
          { id: 'm6-rc2', type: 'recipe', source: SRC, concept: 'am.reduccion', slide: 32,
            prompt: 'El caldero pide **N-metilciclohexilamina** desde ciclohexanona. Elige los ingredientes en orden.', base: 'Ciclohexanona', target: 'N-metilciclohexilamina',
            ingredients: [{ id: 'mna', label: 'CH₃NH₂ (metilamina)' }, { id: 'nab', label: 'NaBH₃CN' }, { id: 'nh3', label: 'NH₃' }, { id: 'mei', label: 'CH₃I' }, { id: 'hcl', label: 'HCl concentrado' }],
            answer: ['mna', 'nab'],
            notes: { nh3: 'Con NH₃ saldría ciclohexilamina (1°), sin el metilo en el N.', mei: 'Metilar después con CH₃I se descontrola (sobrealquilación).', hcl: 'El HCl protonaría la amina y la dejaría sin par para atacar.' },
            orderNote: 'Primero la amina forma la imina con la cetona; recién después el reductor la convierte en amina.',
            explain: 'Ciclohexanona + metilamina → imina; NaBH₃CN la reduce a N-metilciclohexilamina.', hint: 'Paso 1: la amina que aporta el grupo del N. Paso 2: el reductor suave.' },
          { id: 'm6-b2', type: 'build', source: SRC, concept: 'am.reduccion', slide: 32, smiles: 'CC(C)N',
            prompt: 'Dibuja el producto de acetona + NH₃ + NaBH₃CN. Ya tienes la acetona: transfórmala.',
            start: ACETONE, target: ISOPROPYLAMINE,
            near: [{ graph: ACETONE_IMINE, note: 'Esa es la imina, el intermediario. Falta reducirla: el C=N pasa a C–N.' }],
            explain: 'El C=O termina como C–NH₂: isopropilamina, (CH₃)₂CH–NH₂.', hint: 'Cambia el O por un N (elige N y toca el O dos veces) y deja el enlace simple (toca el enlace hasta que quede de una línea).' }
        ] },
      { id: 'r3', intro: 'Receta 3: **reducir para llegar a la amina**. Una amida pierde su C=O; un nitrobenceno se vuelve anilina. Así se puede hacer el p-aminofenol del paracetamol.',
        pretest: q('m6-pre3', 'Si a un grupo –NO₂ le quitas los O y le pones H, ¿qué queda?', [{ text: '–NH₂', correct: true }, { text: '–OH', note: 'El N se queda: lo que se van son los O.' }, { text: '–N₂⁺', note: 'Ese es el diazonio, de la misión 7.' }],
          { explain: 'Reducir el nitro: –NO₂ → –NH₂.', slide: 33, concept: 'am.reduccion' }),
        explain: [
          { id: 'b65', title: 'Otras rutas: amidas y nitroarenos', slide: 33, body: 'Una **amida + LiAlH₄** da R–CH₂–NH₂ (el C=O se vuelve CH₂). Un **nitrobenceno** se reduce a **anilina** con H₂/Pt, Fe/HCl o Sn/HCl.',
            deeper: 'Dos caminos más. Con una **amida**, el LiAlH₄ convierte el C=O en CH₂ y el N se queda donde estaba: R–CO–NH₂ → R–CH₂–NH₂. Con un **nitrobenceno**, la reducción le quita los O al NO₂ y le pone H: Ar–NO₂ → Ar–NH₂. Es la forma típica de poner un NH₂ en un anillo.' }
        ],
        practice: [
          q('m6-p4', 'Benzamida (C₆H₅–CO–NH₂) + LiAlH₄, luego agua. ¿Producto?', [{ text: 'Bencilamina, C₆H₅–CH₂–NH₂', correct: true }, { text: 'Ácido benzoico', note: 'Eso sería una hidrólisis, no una reducción.' }, { text: 'Anilina, C₆H₅–NH₂', note: 'El carbono del C=O no se pierde: queda como CH₂ entre el anillo y el N.' }],
            { explain: 'El C=O de la amida se vuelve CH₂: C₆H₅–CH₂–NH₂.', slide: 33, hint: 'El N se queda; el O se va y en su lugar entran 2 H.', concept: 'am.reduccion' }),
          { id: 'm6-rc3', type: 'recipe', source: SRC, concept: 'am.reduccion', slide: 33,
            prompt: 'El caldero pide **anilina** partiendo de **benceno**. Elige los ingredientes en orden.', base: 'Benceno', target: 'anilina',
            ingredients: [{ id: 'nit', label: 'HNO₃ / H₂SO₄' }, { id: 'fe', label: 'Fe / HCl' }, { id: 'naoh', label: 'NaOH' }, { id: 'diaz', label: 'NaNO₂ / HCl, 0–5 °C' }, { id: 'lah', label: 'LiAlH₄' }, { id: 'nh3', label: 'NH₃' }],
            answer: ['nit', 'fe', 'naoh'],
            notes: { diaz: 'La diazotación es para una anilina que ya existe (misión 7).', lah: 'Con nitroarenos el LiAlH₄ da compuestos azo, no anilina.', nh3: 'El benceno no hace SN2: el NH₃ no puede reemplazar un H del anillo.' },
            orderNote: 'Primero hay que poner el N (nitrar), después reducirlo y al final liberar la amina de su sal.',
            explain: 'Nitrar (HNO₃/H₂SO₄) → nitrobenceno; reducir (Fe/HCl) → sal de anilinio; NaOH → anilina.', hint: 'Paso 1: poner el N en el anillo. Paso 2: reducirlo. Paso 3: sacarlo de la sal.' },
          { id: 'm6-fx2', type: 'spot', source: SRC, concept: 'am.reduccion', slide: 33,
            prompt: 'Un aprendiz quiso preparar etilamina desde acetamida. Revisa su hoja: ¿en qué paso se equivocó?',
            steps: ['Toma acetamida, CH₃–CO–NH₂', 'Le agrega NaBH₄', 'Agrega agua', 'Espera obtener etilamina, CH₃–CH₂–NH₂'], wrong: 1,
            stepNotes: { 0: 'La acetamida sirve: tiene el N y los 2 carbonos.', 2: 'El agua al final está bien (destruye el exceso de reductor).', 3: 'El producto esperado es correcto; el error está antes.' },
            fix: { question: '¿Qué reductor necesitaba?', options: [{ text: 'LiAlH₄', correct: true }, { text: 'NaBH₃CN', note: 'Ese reduce iminas, no amidas.' }, { text: 'Fe / HCl', note: 'Ese reduce nitrocompuestos.' }] },
            explain: 'El NaBH₄ es muy suave para una amida: se necesita LiAlH₄.', hint: 'Las amidas son difíciles de reducir: ¿qué reductor es el fuerte?' },
          { id: 'm6-b3', type: 'build', source: SRC, concept: 'am.reduccion', slide: 33, smiles: 'CCN',
            prompt: 'Dibuja el producto de acetamida + LiAlH₄. Ya tienes la acetamida: transfórmala.',
            start: ACETAMIDE, target: ETHYLAMINE,
            explain: 'El C=O se vuelve CH₂: CH₃–CH₂–NH₂, etilamina.', hint: 'Elige "Borrar" y toca el O: el carbono completa sus enlaces con H.' },
          match('m6-p2', 'Repaso de la misión: une cada reactivo con lo que logra.', [['NaN₃, luego LiAlH₄', 'R–X → R–NH₂ (vía azida)'], ['Ftalimida/KOH, R–X, luego H₂NNH₂', 'Gabriel: amina primaria'], ['Cetona + NH₃ + NaBH₃CN', 'Aminación reductiva'], ['Fe/HCl sobre nitrobenceno', 'Anilina'], ['LiAlH₄ sobre una amida', 'R–CH₂–NH₂']],
            { explain: 'Haluros: azida o Gabriel. Carbonilos: aminación reductiva. Amidas y nitroarenos: reducción.', slide: 33, hint: 'Parte por los nombres que conoces: Gabriel y aminación reductiva.', concept: 'am.reduccion' })
        ] }
    ]
  },
  /* ── Misión 7 ── */
  {
    id: 'm7', title: 'Reacciones de aminas', subtitle: 'Tres recetas: acilación, sales de diazonio y eliminación de Hofmann', minutes: 35, slides: '34–40', pep: 'preguntas 4 y 6',
    stages: {
      hook: { title: 'El paracetamol se fabrica con una reacción de esta misión', scene: PARACETAMOL, smiles: 'CC(=O)Nc1ccc(O)cc1',
        sage: 'Aprendiz… antes de empezar, mira algo que seguro tienes en tu casa.',
        text: 'El paracetamol se fabrica **acilando** el p-aminofenol con anhídrido acético: el –NH₂ se convierte en una amida (–NH–CO–CH₃). Es la receta 1 de hoy. Al final de la misión sabrás cómo funciona y por qué una amina 3° no podría hacerlo.' },
      diagnostic: [
        q('m7-d1', 'En una E2 común, ¿qué alqueno suele predominar?', [{ text: 'El más sustituido (Zaitsev)', correct: true }, { text: 'El menos sustituido', note: 'Eso pasa en casos especiales, como Hofmann.' }, { text: 'Siempre mitad y mitad', note: 'Hay preferencia según estabilidad y estérico.' }], { explain: 'Normalmente gana el alqueno más sustituido. Hofmann es la excepción que veremos.', slide: 36, concept: 'am.hofmann' }),
        q('m7-d2', '¿Qué reactivo convierte la anilina en sal de bencenodiazonio?', [{ text: 'NaNO₂ con HCl, en frío', correct: true }, { text: 'HNO₃ / H₂SO₄', misconception: 'nitration-confusion' }, { text: 'CuCl', note: 'El CuCl se usa después, sobre la sal de diazonio.' }], { explain: 'NaNO₂/HCl a 0–5 °C transforma Ar–NH₂ en Ar–N₂⁺.', slide: 39, concept: 'am.diazonio' }),
        q('m7-d3', '¿Cuál de estas aminas forma una amida con cloruro de acetilo?', [{ text: 'Dietilamina', correct: true }, { text: 'Trietilamina', misconception: 'tertiary-acylation' }, { text: 'Ninguna: las aminas no reaccionan con cloruros de ácido', note: 'Sí reaccionan: es la acilación.' }], { explain: 'La dietilamina es secundaria: tiene un H en el N para cambiar por el acilo.', slide: 34, concept: 'am.acilacion' })
      ],
      fundamentals: [
        { id: 'f69', title: 'Desde cero: leer una flecha curva', slide: 34,
          body: 'Una flecha curva muestra el viaje de **dos electrones**. Nace donde están los electrones (un **par libre** o un **enlace**) y apunta adonde llegan (un **átomo**, o entre dos átomos para formar un enlace). Nunca nace de un H⁺ ni de una carga positiva: ahí no hay electrones para dar.',
          deeper: 'Piensa en la flecha como una pelota que se lanza: sale de la mano que la tiene (el par libre o el enlace) y llega a la mano que la necesita (el átomo pobre en electrones). Si una flecha sale de un H⁺, es como lanzar una pelota que no tienes.' },
        { id: 'f70', title: 'Desde cero: el carbono del C=O es δ+', slide: 34,
          body: 'El oxígeno es más electronegativo que el carbono: en un C=O los electrones se van hacia el O. El O queda **δ−** y el C queda **δ+**, pobre en electrones. Si además el C tiene un Cl, queda todavía más pobre. Por eso los nucleófilos, como el N de una amina, atacan al **carbono** del C=O.',
          deeper: 'Imagina una cuerda tirada desde los dos lados: el O tira más fuerte y se queda con más electrones. El C queda "con hambre" de electrones, y el par libre del N va justo ahí.' },
        { id: 'f71', deeper: 'Tres cosas pasan **al mismo tiempo**: la base saca un H del carbono vecino, esos electrones forman el doble enlace C=C y el grupo saliente se va con su par. Para que funcione, el H y el grupo saliente deben estar en **lados opuestos** (anti), como dos personas en los extremos de una cuerda.', title: 'Desde cero: eliminación E2', body: 'Una base quita un H del carbono **vecino** al que lleva el grupo saliente, se forma un doble enlace y el grupo sale, todo **en un paso**. El H y el grupo saliente deben estar **anticoplanares** (en lados opuestos).' },
        { id: 'f72', deeper: 'Un buen grupo saliente es uno que queda **estable** cuando se va con los electrones: I⁻, Br⁻, H₂O, N₂. El NH₂⁻ es una base fortísima e inestable: no quiere salir. El truco de Hofmann es convertir el N en **–N(CH₃)₃⁺**, que sale como trimetilamina neutra y estable.', title: 'Desde cero: buen grupo saliente', body: 'Sale bien un grupo que queda estable con el par de electrones: I⁻, Br⁻, H₂O, N₂. El NH₂⁻ es pésimo. Por eso, para eliminar una amina, primero se convierte en –N(CH₃)₃⁺, que sale como N(CH₃)₃ neutra.' }
      ],
      explain: [],
      practice: [],
      challenge: [
        order('m7-c1', 'Desafío: ordena la secuencia para obtener clorobenceno desde anilina.', [['diaz', 'Anilina + NaNO₂/HCl, 0–5 °C'], ['salt', 'Se forma la sal de bencenodiazonio'], ['cu', 'Se agrega CuCl (Sandmeyer)'], ['prod', 'Clorobenceno + N₂']], ['diaz', 'salt', 'cu', 'prod'],
          { direction: 'Del primer al último paso.', explain: 'Diazotación, sal de diazonio, Sandmeyer con CuCl y sale N₂.', slide: 40, hint: 'Primero hay que fabricar el buen grupo saliente.', concept: 'am.diazonio' })
      ],
      transfer: [
        q('m7-t1', '2-Butanamina + 1) CH₃I exceso 2) Ag₂O, H₂O, calor. ¿Producto principal?', [{ text: '1-Buteno', correct: true }, { text: '2-Buteno', misconception: 'zaitsev-hofmann' }, { text: '2-Butanol', note: 'No es una sustitución: es una eliminación E2.' }], { explain: 'Hofmann: el alqueno menos sustituido.', slide: 36, concept: 'am.hofmann' }),
        q('m7-t2', 'Estilo PEP (pregunta 4a): desde anilina, ¿cómo obtienes la sal C₆H₅N₂⁺?', [{ text: 'NaNO₂ / HCl en frío', correct: true }, { text: 'HNO₃ / H₂SO₄', misconception: 'nitration-confusion' }, { text: 'CH₃I en exceso', note: 'Eso metila el N; no forma diazonio.' }], { explain: 'La diazotación con NaNO₂/HCl (0–5 °C) es la respuesta de la pauta.', slide: 39, concept: 'am.diazonio' }),
        write('m7-w1', 'Tu compañero pregunta: «¿por qué la trietilamina no forma amida con cloruro de acetilo, si la dietilamina sí?». Explícaselo con tus palabras.',
          'Para formar la amida, el N ataca al C=O y después cambia uno de sus H por el grupo acilo. Una amina terciaria no tiene H en el N, así que no puede completar ese cambio y no se forma la amida neutra.',
          ['Dije que la amina terciaria no tiene H en el N', 'Expliqué que en la acilación el N cambia un H por el grupo acilo', 'Concluí que sin ese H no se forma la amida'],
          { explain: 'Acilar es cambiar un H del N por un acilo: sin H no hay cambio.', slide: 34, concept: 'am.acilacion', teach: true,
            keywords: [{ label: 'No tiene H en el N', any: ['no tiene h', 'sin h', 'no tiene hidrogeno', 'no hay h', 'ningun h', 'no posee h'] }, { label: 'Cambia o reemplaza un H', any: ['cambia', 'reemplaza', 'sustituye', 'intercambia', 'pierde un h', 'saca un h'] }, { label: 'Grupo acilo', any: ['acilo', 'acetilo', 'c=o', 'carbonilo', 'co-ch3'] }] }),
        write('m7-t3', 'Estilo PEP (pregunta 6): 2-butanamina + 1) CH₃I en exceso, 2) Ag₂O / H₂O, 3) calor. Escribe qué hace cada paso, el producto principal y por qué.',
          'Paso 1: el CH₃I en exceso metila el N tres veces y queda la sal de amonio cuaternario (–N(CH₃)₃⁺ I⁻). Paso 2: el Ag₂O con agua cambia el I⁻ por OH⁻. Paso 3: con calor ocurre una E2 y sale N(CH₃)₃. El producto principal es el 1-buteno, el alqueno menos sustituido, porque el grupo saliente es muy voluminoso (eliminación de Hofmann).',
          ['El CH₃I en exceso forma la sal de amonio cuaternario', 'El Ag₂O / H₂O cambia el contraión por OH⁻', 'El producto principal es el 1-buteno', 'Es el menos sustituido por el grupo saliente voluminoso (Hofmann)'],
          { explain: 'Hofmann: metilación exhaustiva, OH⁻ como base y E2 hacia el alqueno menos sustituido.', slide: 36, concept: 'am.hofmann', paper: true })
      ]
    },
    parts: [
      { id: 'r1', intro: 'Receta 1: **la acilación**. Convierte una amina en amida, como en el paracetamol.',
        pretest: q('m7-pre1', '¿Dónde crees que ataca el nitrógeno de la amina en el cloruro de acetilo?', [{ text: 'En el carbono del C=O', correct: true }, { text: 'En el oxígeno' }, { text: 'En el cloro' }],
          { figures: [{ ...ACYL1, caption: 'Metilamina + cloruro de acetilo' }], explain: 'El carbono del C=O está unido a dos átomos electronegativos (O y Cl): es δ+, pobre en electrones. Ahí va el par libre del N.', slide: 34, concept: 'am.acilacion' }),
        explain: [
          { id: 'b71', deeper: 'El N ataca al C=O del cloruro de ácido y el Cl se va. El N **cambia uno de sus H** por el grupo acilo (R–C=O). Para eso necesita tener al menos un H: las aminas **1° y 2°** pueden; la **3°** no tiene H que cambiar. El HCl que se forma lo atrapa otra amina o una base.', title: 'Acilación: de amina a amida', slide: 34, body: 'Una amina **1° o 2°** + cloruro de ácido (o anhídrido) → **amida** + HCl. El N cambia su H por el grupo acilo. Una terciaria no tiene H en el N: no forma amida.', rows: [['CH₃CH₂NH₂ + CH₃COCl', 'CH₃CH₂NH–COCH₃ + HCl']] },
          { id: 'b71m', title: 'El mecanismo, paso a paso', slide: 34,
            body: 'Mira cómo viajan los electrones. Puedes avanzar, retroceder o reproducirlo solo.',
            deeper: 'Son dos movimientos: **entra** el N (y el C=O se abre) y **sale** el Cl (y el C=O se vuelve a cerrar). Por eso se llama adición–eliminación. Al final, el N cede un H⁺ y queda la amida neutra.',
            frames: [
              { ...ACYL1, arrows: [['lp:n', 'a:c2'], ['b:1', 'a:o']], caption: '**Paso 1.** El par libre del N ataca al carbono δ+ del C=O. Al mismo tiempo, los electrones del C=O suben al oxígeno.' },
              { ...ACYL2, arrows: [['lp:o', 'b:2'], ['b:4', 'a:cl']], caption: '**Paso 2.** El O⁻ devuelve su par y se vuelve a formar el C=O. El enlace C–Cl se rompe y sale Cl⁻.' },
              { ...AMIDE, arrows: [], caption: '**Paso 3.** Otra amina (o una base) quita el H⁺ del N. Queda la **amida** neutra, N-metilacetamida, y HCl atrapado como sal.' }
            ] }
        ],
        practice: [
          { id: 'm7-a0', type: 'arrows', source: SRC, concept: 'am.acilacion', slide: 34, step: 3, ...ACYL1, given: [['lp:n', 'a:c2']], answer: [['b:1', 'a:o']],
            prompt: 'Te dejé puesta la primera flecha. Dibuja la que falta: cuando llega el N, ¿adónde se van los electrones del C=O?',
            notes: { 'b:1>a:c2': 'Los electrones del C=O se van hacia el O, que es más electronegativo, no hacia el C.', 'b:3>a:cl': 'Eso pasa después, en el paso 2. Ahora el C=O se abre hacia el O.' },
            explain: 'Cuando el N se une al carbono, el C no puede quedar con 5 enlaces: el enlace π del C=O se abre y sus electrones suben al O.', hint: 'El carbono no puede tener 5 enlaces. ¿Qué enlace se abre, y hacia el átomo más electronegativo?' },
          { id: 'm7-a1', type: 'arrows', source: SRC, concept: 'am.acilacion', slide: 34, ...ACYL1, answer: [['lp:n', 'a:c2'], ['b:1', 'a:o']],
            prompt: 'Ahora sin ayuda: dibuja las 2 flechas del primer paso de la acilación.',
            notes: { 'lp:n>a:o': 'El N no ataca al O: el O es rico en electrones (δ−). El N busca al carbono del C=O, que es δ+.',
              'lp:n>a:cl': 'El Cl sale después, en el segundo paso. Primero el N ataca al carbono del C=O.',
              'b:3>a:cl': 'Eso pasa en el segundo paso, cuando vuelve a formarse el C=O. En el primero, los electrones del C=O suben al O.',
              'b:1>a:c2': 'Los electrones del C=O se van hacia el O, que es más electronegativo, no hacia el C.' },
            explain: 'El par libre del N ataca al carbono δ+ del C=O y los electrones del enlace C=O suben al oxígeno.',
            hint: 'El N busca el átomo más pobre en electrones. Cuando llega, el C=O tiene que soltar un par: ¿hacia dónde?' },
          { id: 'm7-a2', type: 'arrows', source: SRC, concept: 'am.acilacion', slide: 34, ...ACYL2, answer: [['lp:o', 'b:2'], ['b:4', 'a:cl']],
            prompt: 'Paso 2: el intermediario se desarma. Dibuja las 2 flechas: se vuelve a formar el C=O y sale el cloruro.',
            notes: { 'lp:o>a:c2': 'Casi: el par del O vuelve a formar el enlace C=O, así que la flecha llega al enlace C–O, no al átomo de C.',
              'b:4>a:c2': 'El enlace C–Cl se rompe hacia el Cl, que se lleva los electrones y sale como Cl⁻.', 'lp:cl>a:c2': 'El Cl no ataca: es el que se va. Sus electrones se quedan con él.',
              'b:1>a:n': 'El N se queda unido al carbono: es parte del producto. El que sale es el Cl.' },
            explain: 'El O⁻ devuelve su par al enlace C–O (vuelve el C=O) y, para que el C no tenga 5 enlaces, el enlace C–Cl se rompe: sale Cl⁻, un buen grupo saliente.',
            hint: 'Una flecha nace en el O⁻ y forma de nuevo el doble enlace. La otra rompe el enlace con el mejor grupo saliente.' },
          q('m7-tw1', 'Casos gemelos: las dos aminas se parecen mucho. ¿Cuál forma amida con cloruro de acetilo?', [{ text: 'Solo la dietilamina', correct: true }, { text: 'Solo la trietilamina', note: 'Al revés: la trietilamina no tiene H en el N.' }, { text: 'Las dos', misconception: 'tertiary-acylation' }],
            { figures: [{ scene: DIETHYL, lonePairs: { n: 1 }, caption: 'Dietilamina (2°)' }, { scene: TRIETHYL, lonePairs: { n: 1 }, lpAngle: { n: 90 }, caption: 'Trietilamina (3°)' }],
              explain: 'La única diferencia es un H en el N. La dietilamina lo tiene y puede cambiarlo por el acilo; la trietilamina no.', slide: 34, hint: 'Mira el N de cada una: ¿cuál tiene un H para cambiar?', concept: 'am.acilacion' }),
          { id: 'm7-b1', type: 'build', source: SRC, concept: 'am.acilacion', slide: 34, smiles: 'CCCNC(C)=O',
            prompt: 'Dibuja la amida que se forma con propilamina + cloruro de acetilo. Ya tienes la propilamina; agrégale lo que falta.',
            start: { atoms: [A('a', 'C', 60, 160), A('b', 'C', 115, 125), A('c', 'C', 170, 160), A('n', 'N', 225, 125)], bonds: [B('a', 'b'), B('b', 'c'), B('c', 'n')] },
            target: { atoms: [A('a', 'C', 60, 160), A('b', 'C', 115, 125), A('c', 'C', 170, 160), A('n', 'N', 225, 125), A('d', 'C', 280, 160), A('o', 'O', 280, 220), A('e', 'C', 335, 125)],
              bonds: [B('a', 'b'), B('b', 'c'), B('c', 'n'), B('n', 'd'), B('d', 'o', 2), B('d', 'e')] },
            explain: 'El N cambia uno de sus H por el grupo acetilo (CH₃–C=O) y el Cl se va. Producto: N-propilacetamida, CH₃CH₂CH₂–NH–CO–CH₃.',
            hint: 'Al N se le une el carbono del C=O. Ese carbono lleva un O con doble enlace y un CH₃. El Cl no queda en el producto.' }
        ],
        recipe: { title: 'Poción de amida', base: 'Amina **1° o 2°** (R–NH₂, R₂NH)', reagents: 'Cloruro de ácido R–CO–Cl (o anhídrido)', condition: 'Una base (o más amina) atrapa el HCl', result: '**Amida** R–NH–CO–R′', note: 'Una amina 3° no sirve: no tiene H en el N.' } },

      { id: 'r2', intro: 'Receta 2: **las sales de diazonio**. Un truco para cambiar el NH₂ de un anillo por casi cualquier cosa.',
        pretest: q('m7-pre2', 'Un grupo que puede salir de la molécula como gas N₂…', [{ text: 'Sale con mucha facilidad', correct: true }, { text: 'Casi nunca sale' }, { text: 'Solo sale si se agrega más HCl' }],
          { explain: 'El N₂ es muy estable y se escapa como gas: es de los mejores grupos salientes que existen. Por eso la sal de diazonio es tan útil.', slide: 39, concept: 'am.diazonio' }),
        explain: [
          { id: 'b73', deeper: '**Paso 1:** conviertes el NH₂ del anillo en –N₂⁺ con NaNO₂ y HCl **en hielo** (a temperatura ambiente se descompone). **Paso 2:** como el N₂ quiere irse como gas, lo reemplazas por lo que necesites: Cu con Cl, Br o CN (Sandmeyer); HBF₄ y calor para F; agua caliente para OH; KI para I.', title: 'Sales de diazonio', slide: 40, body: 'Ar–NH₂ + NaNO₂/HCl (0–5 °C) → **Ar–N₂⁺**. El N₂ es un grupo saliente excelente: muchos reactivos lo reemplazan.',
            rows: [['CuCl / CuBr / CuCN (Sandmeyer)', 'Ar–Cl / Ar–Br / Ar–CN'], ['HBF₄, calor (Schiemann)', 'Ar–F'], ['H₂O, calor', 'Ar–OH (fenol)'], ['KI', 'Ar–I']] },
          { id: 'b74', title: 'Por qué en hielo', slide: 39,
            body: 'Las sales de arildiazonio se preparan y se usan **en frío (0–5 °C)**. Si se calientan en agua, pierden N₂ y el agua entra en su lugar: se forma **fenol**. Por eso la diazotación siempre se hace en un baño de hielo.',
            deeper: 'La sal de diazonio es como un globo inflado: mientras está frío aguanta, pero con calor el N₂ "se escapa" y deja el anillo libre para que el agua lo ocupe. Si quieres fenol, calientas a propósito; si quieres otra cosa, la mantienes fría hasta agregar el reactivo.' }
        ],
        practice: [
          { id: 'm7-poe1', type: 'poe', source: SRC, concept: 'am.diazonio', slide: 39,
            prompt: 'Predice, observa y explica: ¿qué le pasa a una sal de bencenodiazonio en agua si la calientas?',
            predict: 'Antes de mover el termómetro: ¿qué crees que pasará sobre 5 °C?',
            options: [{ text: 'Se descompone: burbujea N₂ y se forma fenol', correct: true }, { text: 'No pasa nada: es muy estable' }, { text: 'Vuelve a formarse la anilina' }],
            sim: { name: 'Temperatura', unit: '°C', min: 0, max: 40, step: 1, start: 2, threshold: 5, label: 'Mueve el termómetro y mira el matraz.',
              below: 'La sal de bencenodiazonio se mantiene **estable** en el frío.', above: '¡Burbujea **N₂**! La sal se descompone y el agua entra en su lugar: se forma **fenol** (C₆H₅–OH).' },
            explain: 'Sobre unos 5 °C la sal de diazonio pierde N₂ (gas) y el agua la reemplaza: fenol. Por eso se trabaja en hielo.',
            hint: 'El N₂ es un grupo saliente buenísimo… ¿qué lo detiene? El frío.' },
          { id: 'm7-rc1', type: 'recipe', source: SRC, concept: 'am.diazonio', slide: 40,
            prompt: 'El caldero pide: **clorobenceno** desde anilina. Elige los ingredientes en orden.', base: 'Anilina (C₆H₅–NH₂)', target: 'clorobenceno',
            ingredients: [{ id: 'nitro', label: 'HNO₃ / H₂SO₄' }, { id: 'diaz', label: 'NaNO₂ / HCl, 0–5 °C' }, { id: 'cucl', label: 'CuCl' }, { id: 'cubr', label: 'CuBr' }, { id: 'hbf4', label: 'HBF₄, calor' }, { id: 'mei', label: 'CH₃I en exceso' }, { id: 'heat', label: 'H₂O, calor' }],
            answer: ['diaz', 'cucl'],
            notes: { nitro: 'HNO₃/H₂SO₄ nitra el anillo (pone un –NO₂): no forma la sal de diazonio.', cubr: 'CuBr pone Br, no Cl: saldría bromobenceno.', hbf4: 'HBF₄ y calor ponen F (Schiemann): saldría fluorobenceno.',
              mei: 'CH₃I metila el N; no lo convierte en un grupo saliente para el anillo.', heat: 'Agua caliente sobre la sal de diazonio da fenol, no clorobenceno.' },
            orderNote: 'Primero hay que fabricar el grupo saliente: sin la sal de diazonio, el CuCl no tiene nada que reemplazar.',
            explain: 'Diazotación (NaNO₂/HCl en frío) y después Sandmeyer con CuCl: sale N₂ y entra el Cl.', hint: 'Paso 1: fabricar el mejor grupo saliente. Paso 2: el cobre que trae el Cl.' },
          { id: 'm7-rc2', type: 'recipe', source: SRC, concept: 'am.diazonio', slide: 40,
            prompt: 'Otro pedido: **fluorobenceno** desde anilina.', base: 'Anilina (C₆H₅–NH₂)', target: 'fluorobenceno',
            ingredients: [{ id: 'diaz', label: 'NaNO₂ / HCl, 0–5 °C' }, { id: 'cucl', label: 'CuCl' }, { id: 'hbf4', label: 'HBF₄, calor' }, { id: 'ki', label: 'KI' }, { id: 'nitro', label: 'HNO₃ / H₂SO₄' }],
            answer: ['diaz', 'hbf4'],
            notes: { cucl: 'CuCl pone Cl (Sandmeyer). Para el flúor se usa HBF₄ con calor (Schiemann).', ki: 'KI pone I: saldría yodobenceno.', nitro: 'HNO₃/H₂SO₄ nitra el anillo: no forma la sal de diazonio.' },
            orderNote: 'Primero la sal de diazonio; después el reactivo que reemplaza al N₂.',
            explain: 'El flúor no entra con cobre: se usa la reacción de Schiemann, HBF₄ y calor sobre la sal de diazonio.', hint: 'El flúor tiene su propia reacción, con un nombre distinto a Sandmeyer.' },
          match('m7-p2', 'Une cada reactivo con el producto que forma desde una sal de arildiazonio.', [['CuCl', 'Ar–Cl'], ['CuCN', 'Ar–CN'], ['HBF₄, calor', 'Ar–F'], ['H₂O, calor', 'Ar–OH (fenol)'], ['KI', 'Ar–I']],
            { explain: 'Sandmeyer usa sales de cobre(I); Schiemann, HBF₄ para el flúor; agua caliente da fenol; KI da el yoduro.', slide: 40, hint: 'Sandmeyer = cobre.', concept: 'am.diazonio' }),
          { id: 'm7-fx1', type: 'spot', source: SRC, concept: 'am.diazonio', slide: 40,
            prompt: 'Un aprendiz quiso preparar clorobenceno desde anilina. Revisa su hoja: ¿en qué paso se equivocó?',
            steps: ['Anilina + NaNO₂ / HCl a 0–5 °C', 'Se forma la sal de bencenodiazonio, C₆H₅–N₂⁺', 'Agrega HBF₄ y calienta', 'Obtiene clorobenceno, C₆H₅–Cl'], wrong: 2,
            stepNotes: { 0: 'Ese paso está bien: así se forma la sal de diazonio.', 1: 'Correcto: esa es la sal que se forma.', 3: 'Ese es el resultado que él creyó obtener; el error está antes.' },
            fix: { question: '¿Qué debió usar en ese paso?', options: [{ text: 'CuCl (Sandmeyer)', correct: true }, { text: 'Más HBF₄', note: 'HBF₄ pone F, no Cl.' }, { text: 'HNO₃ / H₂SO₄', note: 'Eso nitra el anillo.' }] },
            explain: 'HBF₄ y calor ponen F (Schiemann): habría obtenido fluorobenceno. Para el Cl se usa CuCl.', hint: '¿Qué pone el HBF₄? ¿Era eso lo que quería?' }
        ],
        recipe: { title: 'Poción de diazonio', base: 'Amina aromática Ar–NH₂', reagents: 'NaNO₂ + HCl', condition: '**0–5 °C** (en hielo)', result: 'Sal de diazonio **Ar–N₂⁺**',
          note: 'Después: CuCl → Ar–Cl · CuBr → Ar–Br · CuCN → Ar–CN · HBF₄, calor → Ar–F · H₂O, calor → Ar–OH · KI → Ar–I.' } },

      { id: 'r3', intro: 'Receta 3: **la eliminación de Hofmann**. Una amina se transforma en alqueno… pero no en el que esperarías.',
        explain: [
          { id: 'b72', title: 'Eliminación de Hofmann', slide: 35, body: '1) **CH₃I en exceso**: la amina se metila hasta sal de amonio cuaternario. 2) **Ag₂O, H₂O**: el contraión pasa a OH⁻. 3) **Calor**: E2 que da un alqueno + N(CH₃)₃. El producto principal es el alqueno **MENOS** sustituido.',
            deeper: 'Por qué al revés de Zaitsev: el grupo saliente –N(CH₃)₃⁺ es enorme. En la conformación anticoplanar que lleva al alqueno más sustituido aparece una interacción gauche que sube la energía del estado de transición. El camino al menos sustituido es más barato y más rápido: control cinético (diap. 36–37).' },
          { id: 'b72m', title: 'Hofmann, paso a paso', slide: 36,
            body: 'Mira cómo la base elige el H más fácil de alcanzar.',
            deeper: 'El N(CH₃)₃⁺ es como un vecino gigante: la base no se acerca al H que está "a su lado" en el CH₂, y prefiere el H del CH₃ de la punta. Por eso el doble enlace queda en la orilla: 1-buteno.',
            frames: [
              { scene: QUAT, arrows: [], caption: '**Paso 1.** CH₃I en exceso metila el N tres veces: queda –N(CH₃)₃⁺, una sal de amonio cuaternario. **Paso 2.** Ag₂O / H₂O cambia el I⁻ por OH⁻.' },
              { ...HOF2, arrows: [['lp:oh', 'a:h1'], ['b:4', 'b:0'], ['b:3', 'a:n']], caption: '**Paso 3 (con calor).** El OH⁻ saca un H del CH₃ (el más accesible), esos electrones forman el C=C y sale N(CH₃)₃. Todo en un paso: E2.' },
              { scene: { atoms: [...BUTENE1.atoms, A('n', 'N', 340, 150, 0, { label: 'N(CH₃)₃' }), A('w', 'O', 340, 215, 0, { label: 'H₂O' })], bonds: BUTENE1.bonds }, arrows: [],
                caption: '**Resultado.** 1-buteno, el alqueno **menos** sustituido, más trimetilamina y agua.' }
            ] }
        ],
        practice: [
          q('m7-e2', 'Repaso rápido antes de seguir: en una E2, ¿qué pasa?', [{ text: 'En un solo paso: la base saca un H del C vecino, se forma el C=C y sale el grupo saliente', correct: true }, { text: 'Primero sale el grupo saliente y después la base saca el H', misconception: 'e1-not-e2' }, { text: 'La base ataca al carbono y reemplaza al grupo saliente', note: 'Eso es una sustitución (SN2), no una eliminación.' }],
            { explain: 'La E2 es concertada: todo ocurre al mismo tiempo, con el H y el grupo saliente en lados opuestos.', slide: 35, hint: 'La "2" de E2 significa que en el paso clave participan dos especies a la vez: la base y el sustrato.', concept: 'base.sn-e' }),
          q('m7-tw2', 'Casos gemelos: la misma cadena, distinto grupo saliente. ¿Qué alqueno predomina en cada caso?', [{ text: 'A da 1-buteno (Hofmann) y B da 2-buteno (Zaitsev)', correct: true }, { text: 'Los dos dan 2-buteno', misconception: 'zaitsev-hofmann' }, { text: 'Los dos dan 1-buteno', note: 'Con un grupo saliente pequeño, como Br, gana Zaitsev: el alqueno más sustituido.' }],
            { figures: [{ scene: QUAT, caption: 'A: –N(CH₃)₃⁺ con OH⁻ y calor' }, { scene: BROMO, lonePairs: { br: 3 }, caption: 'B: –Br con CH₃CH₂O⁻ y calor' }],
              explain: 'Lo único que cambia es el grupo saliente. El voluminoso –N(CH₃)₃⁺ empuja hacia el alqueno menos sustituido; el Br, pequeño, deja ganar al más estable.', slide: 36, hint: 'Compara el tamaño de los grupos salientes.', concept: 'am.hofmann' }),
          order('m7-p1', 'Ordena los pasos de la eliminación de Hofmann, del primero al último.',
            [['ag', 'Ag₂O, H₂O: el I⁻ se cambia por OH⁻'], ['me', 'CH₃I en exceso: la amina queda como sal de amonio cuaternario'], ['heat', 'Calor: E2, sale N(CH₃)₃ y se forma el alqueno menos sustituido']],
            ['me', 'ag', 'heat'], { explain: 'Primero metilar (para tener un buen grupo saliente), después poner la base OH⁻ y al final calentar para la E2.', slide: 35, hint: 'Sin metilar, el –NH₂ no puede salir. ¿Qué tiene que pasar primero?', concept: 'am.hofmann' }),
          { id: 'm7-b2', type: 'build', source: SRC, concept: 'am.hofmann', slide: 36, smiles: 'C=CCC',
            prompt: 'Dibuja el producto principal de la eliminación de Hofmann de la 2-butanamina. Ya tienes la cadena de 4 carbonos: pon el doble enlace donde corresponde.',
            start: BUTANE, target: BUTENE1,
            near: [{ graph: BUTENE2, note: 'Ese es el 2-buteno, el producto de Zaitsev. En Hofmann el grupo saliente es grande y la base saca el H del CH₃: el doble enlace queda en la punta.' }],
            explain: 'Hofmann da el alqueno menos sustituido: el doble enlace en la punta de la cadena, 1-buteno (CH₂=CH–CH₂–CH₃).',
            hint: 'Toca un enlace para hacerlo doble. ¿De qué carbono sacó el H la base: del CH₃ de la punta o del CH₂?' }
        ],
        recipe: { title: 'Poción de Hofmann', base: 'Amina con H en el carbono vecino', reagents: '1) CH₃I en exceso · 2) Ag₂O, H₂O', condition: 'Calor', result: 'Alqueno **menos** sustituido + N(CH₃)₃',
          note: 'Al revés de Zaitsev, porque –N(CH₃)₃⁺ es muy voluminoso.' } }
    ]
  },
  /* ── Misión 8 ── */
  {
    id: 'm8', title: 'Espectroscopía de aminas', subtitle: 'Reconocer aminas en IR, RMN y masas', minutes: 12, slides: '44–47', pep: 'teoría',
    stages: {
      diagnostic: [
        q('m8-d1', '¿Cuántos picos N–H da una amina primaria en IR (3350–3500 cm⁻¹)?', [{ text: 'Dos', correct: true }, { text: 'Uno', misconception: 'ir-peaks' }, { text: 'Ninguno', misconception: 'ir-peaks' }], { explain: 'El NH₂ tiene estiramiento simétrico y asimétrico: dos picos.', slide: 44 }),
        q('m8-d2', 'Una masa molecular impar sugiere…', [{ text: 'Un número impar de átomos de N', correct: true }, { text: 'Que no hay nitrógeno', misconception: 'n-rule' }, { text: 'Un error de medición', note: 'Es normal y muy informativo: regla del nitrógeno.' }], { explain: 'Regla del nitrógeno: número impar de N → masa impar.', slide: 47 })
      ],
      fundamentals: [
        { id: 'f81', deeper: 'Piensa en los enlaces como **resortes**. Cada resorte vibra a su ritmo: los livianos y rígidos (N–H, O–H) vibran rápido, a números de onda altos. La luz IR que coincide con ese ritmo se absorbe y aparece como un **pico**. Mirando dónde están los picos, sabes qué enlaces hay.', title: 'Desde cero: IR', body: 'Cada enlace **vibra** a una frecuencia propia. El IR mide qué frecuencias absorbe la molécula: así reconoce grupos funcionales. Los N–H aparecen entre 3350 y 3500 cm⁻¹.' },
        { id: 'f82', deeper: 'C (12) y O (16) pesan número par. El N también (14), pero forma **3 enlaces**, un número impar, y eso obliga a que la molécula tenga un número **impar de H**. Un H impar hace la suma impar. Por eso un N (o 3, o 5…) da masa **impar**.', title: 'Desde cero: masa par o impar', body: 'Con C = 12, H = 1, O = 16 y N = 14, una molécula sin N (o con un número par de N) tiene masa **par**. Con un número impar de N, la masa es **impar**.', rows: [['C₄H₁₁N (butilamina)', '4·12 + 11 + 14 = 73, impar'], ['C₄H₁₀O (butanol)', '4·12 + 10 + 16 = 74, par']] }
      ],
      explain: [
        { id: 'b81', deeper: 'Cuenta los H del N y tendrás los picos. La **1°** (NH₂) tiene dos H, que vibran juntos o alternados: **dos picos**. La **2°** (NH) tiene uno: **un pico**. La **3°** no tiene H en el N: **ninguno** en esa zona.', title: 'IR de aminas', slide: 44, body: 'Primarias: **dos picos** N–H (3350–3500 cm⁻¹). Secundarias: **uno**. Terciarias: **ninguno**. Las N–H son menos intensas que las O–H.', note: 'Para detectar una terciaria se trata con HCl: el N–H⁺ resultante da señal entre 2200 y 3000 cm⁻¹.' },
        { id: 'b82', deeper: 'El N es electronegativo: le quita densidad a los H cercanos y estos aparecen a **más ppm**. Mientras más cerca del N, más efecto: H α ≈ 2,7 ppm, β ≈ 1,5 y γ ≈ 0,9 (ya casi como un alcano). El H del propio N da una **señal ancha** que cambia según la concentración.', title: 'RMN', slide: 45, body: 'En ¹H-RMN, el H unido al N da una **señal ancha** entre 0,5 y 5 ppm, y los H α al N aparecen entre **2 y 3 ppm**. En ¹³C-RMN, el C α aparece entre **30 y 50 ppm**.', rows: [['H α', '≈ 2,7 ppm'], ['H β', '≈ 1,5 ppm'], ['H γ', '≈ 0,9 ppm (sin efecto)']] },
        { id: 'b83', deeper: 'Dos pistas para reconocer una amina en masas. **1.** Si el ion molecular tiene masa **impar**, sospecha de un N. **2.** La molécula se corta en el enlace C–C **vecino al C unido al N**, porque el pedazo con el N queda como un catión estable (C=N⁺). Ese fragmento suele ser el pico más alto.', title: 'Espectrometría de masas', slide: 47, body: '**Regla del nitrógeno**: número impar de N → ion molecular de masa impar. Las aminas se rompen por **escisión α**: un radical y un catión estabilizado por resonancia.' }
      ],
      worked: {
        prompt: 'Un compuesto da M⁺ = 73 y en IR muestra dos picos cerca de 3400 cm⁻¹. ¿Qué es?',
        steps: [
          { text: 'Masa impar → número **impar de N** (lo más simple: uno).', ask: '¿Qué te dice una masa impar?' },
          { text: 'Dos picos N–H → **amina primaria**.' },
          { text: 'C₄H₁₁N = 48 + 11 + 14 = **73**. Es una amina primaria de 4 carbonos, por ejemplo **butilamina**.' }
        ]
      },
      practice: [
        classify('m8-p1', 'Clasifica cada pista o compuesto como amina 1°, 2° o 3°.', [['p1', 'Primaria'], ['p2', 'Secundaria'], ['p3', 'Terciaria']],
          [['two', 'Dos picos a 3350–3500 cm⁻¹', 'p1'], ['one', 'Un pico a 3350–3500 cm⁻¹', 'p2'], ['none', 'Sin señal a 3350–3500 cm⁻¹', 'p3'], ['et', 'Etilamina', 'p1'], ['det', 'Dietilamina', 'p2'], ['tet', 'Trietilamina', 'p3']],
          { explain: 'Picos N–H = cuántos N–H tiene: 1° dos, 2° uno, 3° ninguno.', misconception: 'ir-peaks', slide: 44, hint: 'Cuenta los H unidos al N.' }),
        q('m8-p2', 'Un compuesto tiene M⁺ = 59. ¿Qué indica?', [{ text: 'Número impar de N (por ejemplo C₃H₉N)', correct: true }, { text: 'No tiene nitrógeno', misconception: 'n-rule' }, { text: 'Tiene dos N', note: 'Dos N darían masa par.' }], { explain: '59 es impar: un número impar de N. C₃H₉N = 36 + 9 + 14 = 59 (propilamina u otra).', slide: 47, hint: 'Regla del nitrógeno.' }),
        match('m8-p3', 'Une cada núcleo con dónde aparece.', [['H α al N (¹H)', '2–3 ppm'], ['H unido al N (¹H)', 'Señal ancha, 0,5–5 ppm'], ['C α al N (¹³C)', '30–50 ppm']],
          { explain: 'El N desapantalla a sus vecinos: H α 2–3 ppm, C α 30–50 ppm; el N–H es ancho y variable.', slide: 45, hint: 'El que dice ¹³C va con el rango más grande.' })
      ],
      transfer: [
        q('m8-t1', 'Una amina C₃H₉N no muestra señal entre 3350 y 3500 cm⁻¹. ¿Cuál es?', [{ text: 'Trimetilamina', correct: true }, { text: 'Propilamina', misconception: 'ir-peaks' }, { text: 'Etilmetilamina', misconception: 'ir-peaks' }], { explain: 'Sin N–H → terciaria. De C₃H₉N, la única terciaria es (CH₃)₃N.', slide: 44 })
      ]
    }
  }
  );

  /* Conceptos: las hojas del árbol vivo (docs/clase-viva/DISENO.md §3). "needs" son sus prerrequisitos;
     los que empiezan con "base." son raíces que enseñará la clase base. */
  cls.concepts = [
    { id: 'base.lewis', title: 'Lewis y par libre', root: true },
    { id: 'base.carga', title: 'Cargas formales', root: true, needs: ['base.lewis'] },
    { id: 'base.acido-base', title: 'Ácido-base y pKa', root: true, needs: ['base.lewis'] },
    { id: 'base.sn-e', title: 'SN2 y E2', root: true, needs: ['base.lewis'] },
    { id: 'am.par-libre', mission: 'm1', title: 'El par libre: base y nucleófilo', needs: ['base.lewis', 'base.carga'] },
    { id: 'am.clasificacion', mission: 'm1', title: 'Aminas 1°, 2°, 3° y sales', needs: ['am.par-libre'] },
    { id: 'am.geometria', mission: 'm1', title: 'Forma e inversión del N', needs: ['am.par-libre'] },
    { id: 'am.nombres', mission: 'm2', title: 'Nombrar alquilaminas', needs: ['am.clasificacion'] },
    { id: 'am.nombres-aril', mission: 'm2', title: 'Anilinas y prioridad de grupos', needs: ['am.nombres'] },
    { id: 'am.fisicas', mission: 'm3', title: 'Ebullición y solubilidad', needs: ['am.clasificacion'] },
    { id: 'am.sales', mission: 'm3', title: 'Sales y extracción', needs: ['am.par-libre', 'base.acido-base'] },
    { id: 'am.pka', mission: 'm4', title: 'Basicidad con el pKa', needs: ['base.acido-base'] },
    { id: 'am.equilibrio', mission: 'm4', title: 'Hacia dónde va el equilibrio', needs: ['am.pka'] },
    { id: 'am.resonancia', mission: 'm5', title: 'Resonancia y sustituyentes', needs: ['am.pka'] },
    { id: 'am.heterociclos', mission: 'm5', title: 'Heterociclos e hibridación', needs: ['am.pka'] },
    { id: 'am.orden', mission: 'm5', title: 'Ordenar por basicidad (P3)', needs: ['am.resonancia', 'am.heterociclos'] },
    { id: 'am.alquilacion', mission: 'm6', title: 'Alquilación, azida y Gabriel', needs: ['am.par-libre', 'base.sn-e'] },
    { id: 'am.reduccion', mission: 'm6', title: 'Reducciones y aminación reductiva', needs: ['am.par-libre'] },
    { id: 'am.acilacion', mission: 'm7', title: 'Acilación: de amina a amida', needs: ['am.par-libre', 'am.clasificacion'] },
    { id: 'am.hofmann', mission: 'm7', title: 'Eliminación de Hofmann', needs: ['base.sn-e'] },
    { id: 'am.diazonio', mission: 'm7', title: 'Sales de diazonio', needs: ['am.par-libre'] },
    { id: 'am.espectro', mission: 'm8', title: 'IR, RMN y masas', needs: ['am.clasificacion'] }
  ];
  const CONCEPT_OF = {
    'm1-d1': 'am.clasificacion', 'm1-d2': 'am.par-libre', 'm1-d3': 'am.geometria', 'm1-p1': 'am.clasificacion', 'm1-p2': 'am.par-libre',
    'm1-p3': 'am.geometria', 'm1-c1': 'am.clasificacion', 'm1-t1': 'am.clasificacion', 'm1-t2': 'am.par-libre',
    'm2-d1': 'am.nombres', 'm2-d2': 'am.nombres-aril', 'm2-p1': 'am.nombres', 'm2-p2': 'am.nombres', 'm2-p3': 'am.nombres-aril',
    'm2-p4': 'am.nombres-aril', 'm2-c1': 'am.nombres', 'm2-t1': 'am.nombres', 'm2-t2': 'am.nombres-aril',
    'm3-d1': 'am.fisicas', 'm3-d2': 'am.fisicas', 'm3-p1': 'am.fisicas', 'm3-p2': 'am.fisicas', 'm3-p3': 'am.sales', 'm3-t1': 'am.sales', 'm3-t2': 'am.sales',
    'm4-d1': 'am.pka', 'm4-d2': 'am.equilibrio', 'm4-p1': 'am.pka', 'm4-p2': 'am.pka', 'm4-p3': 'am.pka', 'm4-t1': 'am.equilibrio',
    'm4-t2': 'am.equilibrio', 'm4-w1': 'am.equilibrio',
    'm5-d1': 'am.resonancia', 'm5-d2': 'am.heterociclos', 'm5-p1': 'am.orden', 'm5-p2': 'am.heterociclos', 'm5-p3': 'am.resonancia',
    'm5-p4': 'am.resonancia', 'm5-c1': 'am.orden', 'm5-t1': 'am.orden', 'm5-t2': 'am.heterociclos', 'm5-w1': 'am.resonancia',
    'm6-d1': 'am.alquilacion', 'm6-d2': 'am.reduccion', 'm6-p1': 'am.alquilacion', 'm6-p2': 'am.reduccion', 'm6-p3': 'am.alquilacion',
    'm6-c1': 'am.reduccion', 'm6-t1': 'am.alquilacion', 'm6-t2': 'am.reduccion',
    'm7-d1': 'am.hofmann', 'm7-d2': 'am.diazonio', 'm7-p1': 'am.hofmann', 'm7-p2': 'am.diazonio', 'm7-p3': 'am.acilacion',
    'm7-c1': 'am.diazonio', 'm7-t1': 'am.hofmann', 'm7-t2': 'am.diazonio', 'm7-w1': 'am.acilacion',
    'm8-d1': 'am.espectro', 'm8-d2': 'am.espectro', 'm8-p1': 'am.espectro', 'm8-p2': 'am.espectro', 'm8-p3': 'am.espectro', 'm8-t1': 'am.espectro'
  };
  /* Actividades de dibujo (etapa 2): construir moléculas y trazar flechas de mecanismo.
     Las estructuras se revisan con RDKit en tools/molecule-test.cjs ("smiles" es la respuesta en notación química). */
  const mission = id => cls.missions.find(m => m.id === id);
  const atom = (id, el, x, y, q = 0) => ({ id, el, x, y, q });
  mission('m1').stages.practice.push(
    { id: 'm1-a1', type: 'arrows', source: SRC, concept: 'am.par-libre', slide: 5,
      prompt: 'La metilamina atrapa el H⁺ del HCl. Dibuja las 2 flechas del mecanismo.',
      scene: { atoms: [atom('c', 'C', 80, 140), atom('n', 'N', 150, 140), atom('h', 'H', 265, 140), atom('cl', 'Cl', 335, 140)], bonds: [{ a: 'c', b: 'n', o: 1 }, { a: 'h', b: 'cl', o: 1 }] },
      lonePairs: { n: 1, cl: 3 }, lpAngle: { n: -90 },
      answer: [['lp:n', 'a:h'], ['b:1', 'a:cl']],
      notes: { 'lp:n>a:cl': 'El N no ataca al Cl: el Cl ya tiene sus electrones completos. El N busca el H, que es el que sale como H⁺.',
        'b:1>a:h': 'Cuando se rompe el enlace H–Cl, los electrones se van con el Cl, que es más electronegativo. Así queda Cl⁻.',
        'lp:n>b:1': 'Casi: el par del N ataca al H (al átomo), y el enlace H–Cl se rompe aparte.',
        'lp:cl>a:h': 'El Cl ya está unido a ese H: sus pares no atacan. El que ataca es el N de la amina.' },
      explain: 'El par libre del N ataca al H y, al mismo tiempo, el enlace H–Cl se rompe: sus electrones se van al Cl. Resultado: CH₃–NH₃⁺ y Cl⁻.',
      hint: 'Las flechas salen de electrones (el par libre del N o el enlace H–Cl) y llegan a quien los recibe.' },
    { id: 'm1-b1', type: 'build', source: SRC, concept: 'base.carga', slide: 5, smiles: 'C[NH3+]',
      prompt: 'Dibuja lo que se forma: la metilamina después de atrapar el H⁺. Ya tienes la metilamina; complétala.',
      start: { atoms: [atom('c', 'C', 150, 130), atom('n', 'N', 240, 130)], bonds: [{ a: 'c', b: 'n', o: 1 }] },
      target: { atoms: [atom('c', 'C', 150, 130), atom('n', 'N', 240, 130, 1)], bonds: [{ a: 'c', b: 'n', o: 1 }] },
      explain: 'Al atrapar el H⁺, el N queda con 4 enlaces (3 H y el C) y sin par libre. Carga formal: 5 − 0 − 4 = +1. Se escribe CH₃–NH₃⁺.',
      hint: 'Con 4 enlaces el N queda con carga. Elige el botón ± y toca el N.' });
  /* ── Etapa 4 (docs/etapa-4-diagnostico/SPEC.md) ── */
  // Receta 2 sin pregunta escrita no podía pasar de brote: ahora tiene una.
  mission('m7').parts.find(p => p.id === 'r2').practice.push(
    write('m7-w2', 'Explícalo con tus palabras: ¿por qué la diazotación se hace en hielo (0–5 °C)?',
      'La sal de diazonio es inestable: si se calienta pierde N₂, un gas muy estable que sale con mucha facilidad, y el agua entra en su lugar formando fenol. En frío la sal dura lo suficiente para usarla después con CuCl, CuBr, KI u otro reactivo.',
      ['Dije que la sal de diazonio se descompone si se calienta', 'Dije que sale N₂ (un gas)', 'Dije que con agua caliente se forma fenol, o que en frío la sal se puede usar después'],
      { explain: 'En frío la sal de diazonio aguanta; con calor suelta N₂ y el agua la convierte en fenol.', slide: 39, concept: 'am.diazonio',
        hint: 'Recuerda el termómetro: ¿qué burbujeaba sobre 5 °C?',
        keywords: [{ label: 'Se descompone con calor', any: ['descompone', 'inestable', 'se rompe', 'calor', 'calienta', 'temperatura'] }, { label: 'Sale N₂ (gas)', any: ['n2', 'n₂', 'nitrogeno gaseoso', 'gas', 'burbuj'] }, { label: 'Fenol', any: ['fenol', 'agua entra', 'ar-oh', 'c6h5oh'] }] }));

  /* Clase base "Repaso desde cero" (opcional): las raíces del árbol. Material propio de Orgánica I, sin diapositivas de cátedra. */
  const BASE = 'repaso-base';
  cls.sources[BASE] = { title: 'Repaso desde cero', author: 'Nexo', detail: 'Bases de Química Orgánica I', authority: 'Texto propio; valores de pKa de tabla habituales' };
  const bq = (id, concept, prompt, options, extra) => q(id, prompt, options, { source: BASE, concept, ...extra });
  const bw = (id, concept, prompt, model, rubric, extra) => write(id, prompt, model, rubric, { source: BASE, concept, ...extra });
  const E2 = { scene: { atoms: [A('h', 'H', 140, 80), A('c1', 'C', 140, 150), A('c2', 'C', 230, 150), A('br', 'Br', 230, 230), A('o', 'O', 45, 60, -1)],
    bonds: [B('h', 'c1'), B('c1', 'c2'), B('c2', 'br')] }, lonePairs: { o: 3, br: 3 }, lpAngle: { o: 0 } };
  cls.base = [
    { id: 'z1', concept: 'base.lewis', title: 'Lewis y par libre', subtitle: 'Cuántos enlaces hace cada átomo y qué es un par libre', minutes: 6,
      stages: {
        explain: [
          { id: 'z1b1', title: 'Cuántos enlaces hace cada átomo', body: 'Cada átomo busca completar **8 electrones** (el H, solo 2). Por eso, en una molécula neutra: **C hace 4 enlaces**, **N hace 3** y guarda **1 par libre**, **O hace 2** y guarda **2 pares**, el **H** y los **halógenos** (Cl, Br) hacen **1** (los halógenos guardan 3 pares).',
            deeper: 'Cuenta así: el N trae 5 electrones de valencia. Usa 3 para sus 3 enlaces y le sobran 2: esos 2 juntos son el par libre. El O trae 6: usa 2 en enlaces y le sobran 4, o sea 2 pares.' },
          { id: 'z1b2', title: 'El par libre: lo que hace a la amina', body: 'Un **par libre** son 2 electrones que no forman enlace. Están "disponibles": con ellos el N de una amina **atrapa un H⁺** (actúa como base) o **ataca a un carbono** (actúa como nucleófilo). Casi toda la química de las aminas sale de ese par.',
            deeper: 'Imagina el par libre como una mano libre del N. Con esa mano puede agarrar un H⁺ o a un carbono que tenga carga parcial positiva. Si la mano está ocupada (por ejemplo, en el ion amonio), ya no puede.' }
        ],
        practice: [
          bq('z1-p1', 'base.lewis', '¿Cuántos pares libres tiene el N del amoníaco, NH₃?', [{ text: '1', correct: true }, { text: '0', note: 'El N tiene 5 electrones de valencia: 3 van en los enlaces N–H y le quedan 2, que forman 1 par libre.' }, { text: '2', note: 'Ese es el O del agua. El N, con 3 enlaces, se queda con 1 solo par.' }],
            { explain: '5 electrones de valencia − 3 usados en enlaces = 2 electrones = 1 par libre.', hint: 'El N trae 5 electrones. ¿Cuántos usa en sus 3 enlaces?' }),
          bq('z1-p2', 'base.lewis', '¿Cuántos pares libres tiene el O del agua, H₂O?', [{ text: '2', correct: true }, { text: '1', note: 'El O trae 6 electrones: usa 2 en los enlaces O–H y le quedan 4, o sea 2 pares.' }, { text: '3', note: 'Con 3 pares y 1 enlace sería un O⁻, como en el hidróxido.' }],
            { explain: '6 − 2 = 4 electrones sin compartir = 2 pares libres.', hint: 'El O trae 6 electrones de valencia.' }),
          { id: 'z1-b1', type: 'build', source: BASE, concept: 'base.lewis', smiles: 'CN',
            prompt: 'Dibuja la metilamina, CH₃–NH₂. Ya tienes el carbono: agrégale el nitrógeno (los H van solos).',
            start: { atoms: [A('c', 'C', 150, 130)], bonds: [] }, target: { atoms: [A('c', 'C', 150, 130), A('n', 'N', 240, 130)], bonds: [B('c', 'n')] },
            explain: 'Un C unido a un N. El C completa sus 4 enlaces con 3 H y el N sus 3 enlaces con 2 H; al N le queda un par libre.',
            hint: 'Elige N en las herramientas, toca el C y después un espacio vacío al lado.' }
        ],
        transfer: [
          bw('z1-w1', 'base.lewis', '¿Por qué el N de una amina puede atrapar un H⁺? Explícalo con tus palabras.',
            'Porque el N tiene un par libre: dos electrones que no están en ningún enlace. Con ese par forma un enlace nuevo con el H⁺, que no trae electrones. Por eso la amina es una base.',
            ['Dije que el N tiene un par libre', 'Dije que con ese par forma el enlace con el H⁺', 'Dije que eso la hace una base'],
            { explain: 'El par libre es lo que se "presta" para formar el enlace con el H⁺.',
              keywords: [{ label: 'Par libre', any: ['par libre', 'par de electrones', 'par electronico', 'electrones libres', 'par no enlazante'] }, { label: 'Forma un enlace con el H⁺', any: ['enlace', 'une', 'atrapa', 'acepta', 'capta', 'comparte'] }, { label: 'Es una base', any: ['base', 'basica', 'basico'] }] })
        ]
      } },
    { id: 'z2', concept: 'base.carga', title: 'Cargas formales', subtitle: 'De dónde sale el + del ion amonio', minutes: 6,
      stages: {
        explain: [
          { id: 'z2b1', title: 'La cuenta de la carga formal', body: '**Carga formal = electrones de valencia − (electrones de sus pares libres + número de enlaces).** Ejemplo, el N del ion amonio NH₄⁺: 5 − (0 + 4) = **+1**. El N del amoníaco NH₃: 5 − (2 + 3) = **0**.',
            deeper: 'Piensa que cada enlace es "mitad tuyo": te toca 1 electrón por enlace. Los pares libres son enteros tuyos. Si te tocan menos electrones de los que traías, quedas positivo; si te tocan más, negativo.' },
          { id: 'z2b2', title: 'Atajos que vas a usar siempre', body: '**N**: 3 enlaces + 1 par → 0 · **4 enlaces, sin par → +1**. **O**: 2 enlaces + 2 pares → 0 · **1 enlace + 3 pares → −1** · 3 enlaces + 1 par → +1. **C**: 4 enlaces → 0 · 3 enlaces y sin par → +1 (carbocatión).',
            deeper: 'No hace falta memorizar la tabla: si un átomo tiene un enlace de más que lo normal (N con 4), lleva +; si tiene uno de menos y un par extra (O con 1), lleva −.' }
        ],
        practice: [
          bq('z2-p1', 'base.carga', '¿Qué carga formal tiene el N del ion amonio, NH₄⁺?', [{ text: '+1', correct: true }, { text: '0', note: 'Con 4 enlaces y sin par libre: 5 − (0 + 4) = +1.' }, { text: '−1', note: 'Al revés: le tocan 4 electrones y traía 5, así que quedó con uno de menos: positivo.' }],
            { explain: '5 − (0 + 4) = +1.', hint: 'Cuenta sus enlaces y sus pares libres.' }),
          bq('z2-p2', 'base.carga', '¿Qué carga formal tiene el O del ion hidróxido, OH⁻?', [{ text: '−1', correct: true }, { text: '0', note: 'Tiene 1 enlace y 3 pares: 6 − (6 + 1) = −1.' }, { text: '+1', note: 'Le tocan 7 electrones y traía 6: tiene uno de más, así que es negativo.' }],
            { explain: '6 − (6 + 1) = −1.', hint: 'El O trae 6. En el OH⁻ tiene 1 enlace y 3 pares libres.' }),
          bq('z2-p3', 'base.carga', 'En el ion metilamonio, CH₃–NH₃⁺, ¿qué átomo lleva la carga +?', [{ text: 'El N', correct: true }, { text: 'El C', note: 'El C tiene sus 4 enlaces normales: 4 − (0 + 4) = 0.' }, { text: 'Un H', note: 'Cada H tiene su único enlace: carga 0.' }],
            { explain: 'El N tiene 4 enlaces y ningún par libre: 5 − (0 + 4) = +1.', hint: '¿Qué átomo tiene un enlace más de lo normal?' })
        ],
        transfer: [
          bw('z2-w1', 'base.carga', 'Explica por qué el N del ion metilamonio, CH₃–NH₃⁺, tiene carga +1.',
            'El N trae 5 electrones de valencia. En el metilamonio tiene 4 enlaces (3 con H y 1 con el C) y ningún par libre, así que le tocan 4 electrones: 5 − (0 + 4) = +1. Usó su par libre para atrapar el H⁺.',
            ['Dije que el N trae 5 electrones de valencia', 'Dije que tiene 4 enlaces y ningún par libre', 'Hice la cuenta 5 − 4 = +1 (o dije que usó su par libre en el H⁺)'],
            { explain: 'Valencia 5, le tocan 4: carga +1.',
              keywords: [{ label: '5 electrones de valencia', any: ['5 electrones', 'cinco electrones', 'valencia'] }, { label: '4 enlaces', any: ['4 enlaces', 'cuatro enlaces'] }, { label: 'Sin par libre', any: ['sin par', 'ningun par', 'no tiene par', 'no le queda', 'uso su par', 'usa su par', 'uso el par'] }] })
        ]
      } },
    { id: 'z3', concept: 'base.acido-base', title: 'Ácido-base y pKa', subtitle: 'Quién suelta el H⁺ y hacia dónde va el equilibrio', minutes: 7,
      stages: {
        explain: [
          { id: 'z3b1', title: 'Ácido, base y pKa', body: 'Un **ácido** entrega un H⁺; una **base** lo recibe usando un par libre. El **pKa** mide qué tanto suelta un ácido su H⁺: **menor pKa, ácido más fuerte**. Ácido acético: pKa ≈ 4,8. Agua: pKa ≈ 15,7. Ion metilamonio CH₃NH₃⁺: pKa ≈ 10,6.',
            deeper: 'El pKa es como la "resistencia" a soltar el H⁺. Un pKa chico es poca resistencia: lo suelta fácil, o sea, es un ácido fuerte. Un pKa grande es mucha resistencia: ácido débil.' },
          { id: 'z3b2', title: 'Para bases: mira el ácido conjugado', body: 'Para comparar **bases** se mira el pKa de su **ácido conjugado** (el que se forma al atrapar el H⁺). **Mayor pKa del conjugado, base más fuerte**: le cuesta más soltar el H⁺ que atrapó. Y en una reacción ácido-base, el equilibrio va hacia el lado del **ácido más débil** (mayor pKa).',
            deeper: 'Si una base atrapa el H⁺ y después no lo quiere soltar (su conjugado tiene pKa alto), es una base fuerte. Por eso la metilamina (conjugado con pKa 10,6) es mucho más básica que la anilina (conjugado con pKa 4,6).' }
        ],
        practice: [
          bq('z3-p1', 'base.acido-base', '¿Cuál es el ácido más fuerte?', [{ text: 'Ácido acético, pKa 4,8', correct: true }, { text: 'Ion metilamonio, pKa 10,6', note: 'Menor pKa es ácido más fuerte: 4,8 es menor que 10,6.' }, { text: 'Agua, pKa 15,7', note: 'El agua es el ácido más débil de los tres: su pKa es el mayor.' }],
            { explain: 'Menor pKa, más fácil suelta el H⁺.', hint: 'En el pKa, el número chico gana como ácido.' }),
          bq('z3-p2', 'base.acido-base', '¿Cuál es la base conjugada del ion metilamonio, CH₃NH₃⁺?', [{ text: 'CH₃NH₂', correct: true }, { text: 'CH₃NH₄²⁺', note: 'Eso sería agregar otro H⁺. La base conjugada es lo que queda al quitarle un H⁺.' }, { text: 'CH₃⁻', note: 'Se quita un H⁺ del N, no se rompe el enlace C–N.' }],
            { explain: 'Quitar un H⁺: CH₃NH₃⁺ → CH₃NH₂.', hint: 'Base conjugada = el ácido sin un H⁺.' }),
          bq('z3-p3', 'base.acido-base', 'CH₃COOH + CH₃NH₂ ⇌ CH₃COO⁻ + CH₃NH₃⁺. Con pKa 4,8 (ácido acético) y 10,6 (metilamonio), ¿hacia dónde va el equilibrio?', [{ text: 'Hacia la derecha: queda el ácido más débil, CH₃NH₃⁺', correct: true }, { text: 'Hacia la izquierda: queda el ácido acético', misconception: 'strong-side' }, { text: 'Queda justo en la mitad', note: 'Los pKa son muy distintos (casi 6 unidades): el equilibrio está muy desplazado.' }],
            { explain: 'El equilibrio favorece al ácido más débil (mayor pKa): el metilamonio, a la derecha.', hint: 'Busca de qué lado está el ácido con pKa mayor.' })
        ],
        transfer: [
          bw('z3-w1', 'base.acido-base', '¿Cómo usas el pKa para decidir cuál de dos aminas es más básica? Explícalo con tus palabras.',
            'Miro el pKa del ácido conjugado de cada amina, o sea, del ion amonio que se forma al atrapar el H⁺. La amina cuyo conjugado tiene el pKa mayor es la más básica, porque a ese ion le cuesta más soltar el H⁺.',
            ['Dije que se mira el pKa del ácido conjugado (ion amonio)', 'Dije que mayor pKa del conjugado es base más fuerte', 'Expliqué que le cuesta más soltar el H⁺'],
            { explain: 'Base más fuerte = conjugado con pKa más alto.',
              keywords: [{ label: 'Ácido conjugado', any: ['conjugado', 'ion amonio', 'amonio', 'protonada'] }, { label: 'Mayor pKa', any: ['mayor', 'mas alto', 'alto'] }, { label: 'Más básica', any: ['basica', 'base mas fuerte', 'mas fuerte'] }] })
        ]
      } },
    { id: 'z4', concept: 'base.sn-e', title: 'SN2, E2 y el solvente', subtitle: 'Sustituir o eliminar: la ruta de decisión', minutes: 8,
      stages: {
        explain: [
          { id: 'z4b1', title: 'SN2 y E2: un solo paso', body: '**SN2**: el nucleófilo ataca al **carbono** por atrás mientras sale el grupo saliente, todo en un paso. Le gustan los carbonos **metilo o primarios**. **E2**: una base saca un **H del carbono vecino** mientras sale el grupo saliente y se forma un **C=C**, también en un paso. Le gustan las **bases fuertes**, las **voluminosas** y el **calor**. Normalmente gana el alqueno más sustituido (Zaitsev).',
            deeper: 'Misma pelea, distinto blanco: en la SN2 el atacante va al carbono y lo reemplaza; en la E2 va al H de al lado y deja un doble enlace. Si el carbono está muy tapado o la base es grande, le cuesta llegar al carbono y prefiere el H: gana la E2.' },
          { id: 'z4b2', title: 'El solvente', body: '**Polar aprótico** (DMSO, DMF, acetona): no tiene H unidos a O o N, deja al nucleófilo "desnudo" y **acelera la SN2**. **Polar prótico** (agua, alcoholes): rodea al nucleófilo con puentes de hidrógeno, lo frena y estabiliza iones, favoreciendo **SN1/E1** con carbonos terciarios.',
            deeper: 'Un solvente prótico es como abrazar al nucleófilo: lo deja sin brazos para atacar. El aprótico no lo abraza, así que ataca rápido. Por eso para una SN2 se elige DMSO o acetona.' }
        ],
        practice: [
          bq('z4-p1', 'base.sn-e', 'En una SN2, ¿qué ocurre?', [{ text: 'El nucleófilo ataca al carbono mientras sale el grupo saliente, en un solo paso', correct: true }, { text: 'Primero sale el grupo saliente y se forma un carbocatión', note: 'Eso es SN1: dos pasos, con carbocatión.' }, { text: 'Una base saca un H y se forma un doble enlace', note: 'Eso es una eliminación (E2), no una sustitución.' }],
            { explain: 'SN2: sustitución, nucleofílica, bimolecular, en un paso y con ataque por atrás.', hint: 'La "S" es de sustitución y el "2" dice que participan dos especies a la vez.' }),
          bq('z4-p2', 'base.sn-e', '¿Qué solvente acelera una SN2?', [{ text: 'DMSO (polar aprótico)', correct: true }, { text: 'Agua (polar prótico)', note: 'El agua rodea al nucleófilo con puentes de H y lo frena.' }, { text: 'Hexano (apolar)', note: 'No disuelve bien las sales que traen al nucleófilo.' }],
            { explain: 'El polar aprótico deja al nucleófilo libre para atacar.', hint: '¿Cuál no tiene H unidos a O que "abracen" al nucleófilo?' }),
          { id: 'z4-a1', type: 'arrows', source: BASE, concept: 'base.sn-e', ...E2, answer: [['lp:o', 'a:h'], ['b:0', 'b:1'], ['b:2', 'a:br']],
            prompt: 'E2 del bromoetano con OH⁻. Dibuja las 3 flechas: la base saca el H, se forma el C=C y sale el Br⁻.',
            notes: { 'lp:o>a:c1': 'En una E2 la base no ataca al carbono (eso sería SN2): saca el H del carbono vecino.', 'lp:o>a:c2': 'Atacar al carbono con el Br es una SN2. En la E2 la base va por el H del otro carbono.',
              'b:2>a:c2': 'El enlace C–Br se rompe hacia el Br, que se lleva los electrones y sale como Br⁻.', 'b:0>a:c1': 'Los electrones del C–H no se quedan en el C: van a formar el doble enlace C=C.' },
            explain: 'El OH⁻ saca el H; los electrones del C–H forman el enlace π del C=C; el enlace C–Br se rompe y sale Br⁻. Todo a la vez.',
            hint: 'Tres flechas: del par del O al H, del enlace C–H al enlace C–C, y del enlace C–Br al Br.' }
        ],
        transfer: [
          bw('z4-w1', 'base.sn-e', '¿En qué se diferencian una SN2 y una E2? Explícalo con tus palabras.',
            'En la SN2 el nucleófilo ataca al carbono que tiene el grupo saliente y lo reemplaza: es una sustitución. En la E2 la base saca un H del carbono vecino y se forma un doble enlace C=C: es una eliminación. Las dos ocurren en un solo paso; una base voluminosa o un carbono muy sustituido favorecen la E2.',
            ['Dije que en la SN2 el nucleófilo ataca al carbono y sustituye', 'Dije que en la E2 la base saca un H y se forma un C=C', 'Dije que ambas son en un paso o qué favorece a cada una'],
            { explain: 'SN2 reemplaza en el carbono; E2 saca un H vecino y deja un doble enlace.',
              keywords: [{ label: 'Ataca al carbono / sustituye', any: ['sustitu', 'reemplaza', 'ataca al carbono'] }, { label: 'Saca un H', any: ['saca un h', 'quita un h', 'saca el h', 'quita el h', 'hidrogeno'] }, { label: 'Doble enlace', any: ['doble enlace', 'c=c', 'alqueno'] }] })
        ]
      } }
  ];

  /* Errores que guían: de qué raíz viene cada error y un caso corto para corregirlo en el momento. */
  const check = (key, base, item) => Object.assign(cls.misconceptions[key], { base, check: { source: SRC, ...item } });
  check('nh-acid', 'base.lewis', q('fix-nh-acid', 'Caso corto: en la reacción NH₃ + H⁺ → NH₄⁺, ¿qué forma el enlace nuevo con el H⁺?', [{ text: 'El par libre del N', correct: true }, { text: 'Un enlace N–H que ya existía', note: 'Los N–H ya están ocupados: el enlace nuevo lo pone el par libre.' }, { text: 'Los electrones del H⁺', note: 'El H⁺ no trae electrones: es solo un protón.' }],
    { explain: 'El H⁺ no trae electrones: los pone el par libre del N.', slide: 5, concept: 'am.par-libre', hint: 'El H⁺ llega sin electrones. ¿Quién los pone?' }));
  check('tertiary-acylation', 'base.lewis', q('fix-tert-acyl', 'Caso corto: ¿cuál de estas aminas tiene H en el N?', [{ text: 'CH₃–NH–CH₃', correct: true }, { text: '(CH₃)₃N', note: 'Tres grupos CH₃ en el N y ningún H: es terciaria.' }, { text: '(CH₃)₄N⁺', note: 'Sal cuaternaria: cuatro grupos, ningún H.' }],
    { explain: 'Solo la dimetilamina (2°) tiene un H en el N, y por eso puede acilarse.', slide: 34, concept: 'am.acilacion', hint: 'Cuenta qué hay unido a cada N.' }));
  check('zaitsev-hofmann', 'base.sn-e', q('fix-hofmann', 'Caso corto: el grupo saliente es –N(CH₃)₃⁺, muy voluminoso. ¿Qué H prefiere sacar la base?', [{ text: 'El del CH₃ de la punta, el más accesible', correct: true }, { text: 'El del CH₂ interior, para formar el alqueno más sustituido', note: 'Ese H queda tapado por el grupo voluminoso: la base llega peor.' }, { text: 'Ninguno: el grupo voluminoso impide la eliminación', note: 'La eliminación ocurre igual; solo cambia qué H se saca.' }],
    { explain: 'El H más accesible es el del CH₃: por eso Hofmann da el alqueno menos sustituido.', slide: 36, concept: 'am.hofmann', hint: 'Piensa en cuál H está más lejos del grupo grande.' }));
  check('pka-inverted', 'base.acido-base', q('fix-pka', 'Caso corto: el ion A tiene pKa 10,6 y el ion B tiene pKa 4,6. ¿A cuál le cuesta más soltar su H⁺?', [{ text: 'Al de pKa 10,6', correct: true }, { text: 'Al de pKa 4,6', note: 'Menor pKa es soltar el H⁺ con más facilidad.' }],
    { explain: 'Mayor pKa, más le cuesta soltar el H⁺: su amina es la base más fuerte.', slide: 20, concept: 'am.pka', hint: 'Recuerda: pKa chico = ácido fuerte = suelta fácil.' }));
  for (const [key, base] of [['count-groups', 'base.lewis'], ['carbon-rule', 'base.lewis'], ['strong-side', 'base.acido-base'], ['e1-not-e2', 'base.sn-e'], ['overalkylation', 'base.sn-e']])
    if (cls.misconceptions[key]) cls.misconceptions[key].base ||= base;

  /* Diagnóstico "¿Por dónde empiezo?": escalera de 3 niveles (1 bases, 2 aminas, 3 reacciones). Preguntas propias. */
  const dx = (id, concept, prompt, options, extra = {}) => q(id, prompt, options, { concept, ...extra });
  cls.diagnosis = { start: 2, max: 7, items: [
    { level: 1, item: dx('dx-lewis', 'base.lewis', '¿Cuántos pares libres tiene el N del amoníaco, NH₃?', [{ text: '1', correct: true }, { text: '0', note: 'El N trae 5 electrones: 3 en enlaces y 2 en un par libre.' }, { text: '2', note: 'Ese es el O del agua.' }], { explain: '5 − 3 = 2 electrones: un par libre.', slide: 5 }) },
    { level: 1, item: dx('dx-carga', 'base.carga', '¿Qué carga formal tiene el N del ion amonio, NH₄⁺?', [{ text: '+1', correct: true }, { text: '0', note: '4 enlaces y sin par: 5 − 4 = +1.' }, { text: '−1', note: 'Le falta un electrón respecto a los 5 que trae: es +.' }], { explain: '5 − (0 + 4) = +1.', slide: 5 }) },
    { level: 1, item: dx('dx-acido', 'base.acido-base', 'Entre un ácido de pKa 4,8 y otro de pKa 10,6, ¿cuál es más fuerte?', [{ text: 'El de pKa 4,8', correct: true }, { text: 'El de pKa 10,6', note: 'Al revés: menor pKa, suelta el H⁺ con más facilidad.' }, { text: 'Son iguales', note: 'Casi 6 unidades de pKa son un millón de veces de diferencia.' }], { explain: 'Menor pKa, ácido más fuerte.', slide: 20 }) },
    { level: 1, item: dx('dx-sne', 'base.sn-e', 'En una E2, ¿qué ocurre?', [{ text: 'En un paso, la base saca un H vecino, se forma el C=C y sale el grupo saliente', correct: true }, { text: 'Primero sale el grupo saliente y después la base saca el H', misconception: 'e1-not-e2' }, { text: 'La base reemplaza al grupo saliente en el carbono', note: 'Eso es una SN2.' }], { explain: 'E2: eliminación en un solo paso.', slide: 35 }) },
    { level: 2, item: dx('dx-parlibre', 'am.par-libre', '¿Qué usa una amina para atrapar un H⁺?', [{ text: 'El par libre del N', correct: true }, { text: 'Los H unidos al N', misconception: 'nh-acid' }, { text: 'El enlace C–N', note: 'Ese enlace no se rompe: lo que se usa es el par libre.' }], { explain: 'El par libre del N forma el enlace con el H⁺.', slide: 5 }) },
    { level: 2, item: dx('dx-clasif', 'am.clasificacion', 'La dimetilamina, (CH₃)₂NH, es una amina…', [{ text: 'Secundaria', correct: true }, { text: 'Primaria', misconception: 'count-groups' }, { text: 'Terciaria', misconception: 'count-groups' }], { explain: 'Dos grupos de carbono unidos al N: secundaria.', slide: 8 }) },
    { level: 2, item: dx('dx-pka', 'am.pka', 'Metilamina (pKa del conjugado 10,6) y anilina (pKa del conjugado 4,6): ¿cuál es más básica?', [{ text: 'La metilamina', correct: true }, { text: 'La anilina', misconception: 'pka-inverted' }, { text: 'Son iguales', note: 'Sus conjugados difieren en 6 unidades de pKa.' }], { explain: 'Mayor pKa del conjugado, base más fuerte.', slide: 17 }) },
    { level: 3, item: dx('dx-reson', 'am.resonancia', '¿Por qué la anilina es mucho menos básica que la ciclohexilamina?', [{ text: 'Su par libre se deslocaliza en el anillo aromático', correct: true }, { text: 'El anillo le entrega electrones al N y lo satura', note: 'Es al revés: el par del N se reparte hacia el anillo.' }, { text: 'Porque tiene menos H en el N', note: 'Las dos tienen NH₂: la diferencia es la resonancia.' }], { explain: 'El par del N entra en resonancia con el anillo y queda menos disponible.', slide: 22 }) },
    { level: 3, item: dx('dx-alquil', 'am.alquilacion', 'Si haces reaccionar NH₃ con bromoetano, ¿qué problema aparece?', [{ text: 'Una mezcla: la amina que se forma vuelve a reaccionar', correct: true }, { text: 'Se obtiene solo etilamina pura', misconception: 'overalkylation' }, { text: 'No reacciona: el NH₃ no es nucleófilo', note: 'Sí lo es: tiene un par libre.' }], { explain: 'Sobrealquilación: la amina producto también es nucleófila.', slide: 30 }) },
    { level: 3, item: dx('dx-acil', 'am.acilacion', '¿Cuál de estas aminas NO forma amida con cloruro de acetilo?', [{ text: 'Trietilamina', correct: true }, { text: 'Dietilamina', misconception: 'tertiary-acylation' }, { text: 'Metilamina', note: 'Es primaria: tiene dos H en el N y se acila sin problema.' }], { explain: 'La terciaria no tiene H en el N para cambiarlo por el acilo.', slide: 34 }) },
    { level: 3, item: dx('dx-hofmann', 'am.hofmann', 'Eliminación de Hofmann de la 2-butanamina: ¿producto principal?', [{ text: '1-Buteno', correct: true }, { text: '2-Buteno', misconception: 'zaitsev-hofmann' }, { text: 'Butano', note: 'Es una eliminación: se forma un alqueno.' }], { explain: 'Hofmann da el alqueno menos sustituido.', slide: 36 }) },
    { level: 3, item: dx('dx-diaz', 'am.diazonio', 'Para pasar de anilina a clorobenceno se usa…', [{ text: 'NaNO₂/HCl en frío y después CuCl', correct: true }, { text: 'CuCl directamente', note: 'Primero hay que convertir el –NH₂ en un buen grupo saliente (sal de diazonio).' }, { text: 'HCl concentrado y calor', note: 'Eso solo protona la amina: forma una sal, no clorobenceno.' }], { explain: 'Diazotación y después Sandmeyer con CuCl.', slide: 40 }) }
  ] };

  /* ── Etapa 5: el grimorio (docs/etapa-5-grimorio/SPEC.md) ── */
  /* Formulario: fuentes en orden cátedra → McMurry (LibreTexts). Cada calculadora devuelve texto con **negritas**. */
  const LT = 'https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map:_Organic_Chemistry_(McMurry)';
  const num = (x, d = 2) => Number(x).toLocaleString('es-CL', { maximumFractionDigits: d });
  const sci = x => { if (!isFinite(x) || x <= 0) return '—'; const e = Math.floor(Math.log10(x)); return `${num(x / 10 ** e, 1)} × 10^${e}`.replace(/\^(-?\d+)/, (_, n) => n.split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(c)] || '⁻').join('')); };
  cls.formulas = [
    { id: 'f-pka', title: 'pKa', formula: 'pKa = −log Ka', concepts: ['am.pka', 'base.acido-base'],
      vars: [['Ka', 'Constante de acidez: [A⁻][H₃O⁺] / [HA]. Mide cuánto se disocia el ácido', 'sin unidad (en la práctica)'], ['pKa', 'El mismo dato en escala logarítmica', 'sin unidad']],
      what: 'Comparar qué tan fácil suelta su H⁺ un ácido. **Menor pKa, ácido más fuerte.**',
      when: 'Siempre que compares ácidos. En aminas se usa el pKa del **ion amonio** (su ácido conjugado) para medir basicidad.',
      example: 'Ion metilamonio: Ka ≈ 2,5 × 10⁻¹¹ → pKa = −log(2,5 × 10⁻¹¹) ≈ **10,6**.',
      deeper: 'El logaritmo comprime números enormes: cada unidad de pKa es un factor **10** en Ka. Un ácido de pKa 4 suelta su H⁺ 10 000 veces más que uno de pKa 8. Por eso basta restar pKa para comparar.',
      sources: [{ label: 'Cátedra · diap. 18 y 20', slide: 20 }, { label: 'McMurry (LibreTexts) · 2.8 Acid and Base Strength', url: `${LT}/02:_Polar_Covalent_Bonds_Acids_and_Bases/2.08:_Acid_and_Base_Strength` }],
      calc: { inputs: [{ id: 'pka', label: 'pKa', value: 10.6, step: 0.1 }], run: v => `Ka = **${sci(10 ** -v.pka)}**` } },
    { id: 'f-pkb', title: 'pKa + pKb = 14', formula: 'Ka · Kb = Kw  →  pKa + pKb = 14', concepts: ['am.pka'],
      vars: [['Ka', 'Del ácido conjugado (el ion amonio)', 'sin unidad'], ['Kb', 'De la base (la amina)', 'sin unidad'], ['Kw', 'Producto iónico del agua: 1,0 × 10⁻¹⁴ a 25 °C', 'sin unidad']],
      what: 'Pasar del pKb de una amina al pKa de su ion amonio (o al revés).',
      when: 'Cuando te dan **Kb o pKb** y quieres comparar con pKa. Vale para cualquier par ácido–base conjugado, en agua a 25 °C.',
      example: 'Una amina con pKb = 3,4 → pKa del ion amonio = 14 − 3,4 = **10,6**.',
      deeper: 'Si el ion amonio suelta poco su H⁺ (pKa alto), es porque la amina lo retiene bien: es una base fuerte (pKb bajo). Los dos números son caras de la misma moneda y suman 14 porque Ka·Kb = Kw.',
      sources: [{ label: 'Cátedra · diap. 20', slide: 20 }, { label: 'McMurry (LibreTexts) · 24.3 Basicity of Amines', url: `${LT}/24:_Amines_and_Heterocycles/24.03:_Basicity_of_Amines` }],
      calc: { inputs: [{ id: 'pkb', label: 'pKb de la amina', value: 3.4, step: 0.1 }], run: v => `pKa del ion amonio = **${num(14 - v.pkb)}**` } },
    { id: 'f-keq', title: 'Hacia dónde va el equilibrio', formula: 'Keq = 10^ΔpKa   (ΔpKa = pKa del ácido producto − pKa del ácido reactivo)', concepts: ['am.equilibrio', 'base.acido-base', 'am.sales'],
      vars: [['pKa del ácido reactivo', 'El ácido que está a la izquierda (el que entrega el H⁺)', 'sin unidad'], ['pKa del ácido producto', 'El ácido que se forma a la derecha (por ejemplo, el ion amonio)', 'sin unidad'], ['Keq', 'Constante de equilibrio', 'sin unidad']],
      what: 'Saber hacia qué lado va una reacción ácido–base y **cuánto**. El equilibrio favorece el lado del **ácido más débil** (pKa mayor).',
      when: 'Al mezclar una amina con un ácido (sales, extracción) o comparar dos bases.',
      example: 'Ácido acético (pKa 4,76) + trietilamina → ion trietilamonio (pKa 10,76). Keq = 10^(10,76 − 4,76) = **10⁶**: por cada amina libre hay un millón protonadas (diap. 17).',
      deeper: 'Si Keq > 1 gana la derecha. La resta de pKa te da directo cuántas potencias de 10 gana un lado: 6 unidades es un millón a uno. Si el ácido producto fuera más fuerte (pKa menor), la resta sería negativa y ganaría la izquierda.',
      sources: [{ label: 'Cátedra · diap. 17', slide: 17 }, { label: 'McMurry (LibreTexts) · 2.9 Predicting Acid–Base Reactions from pKa Values', url: `${LT}/02:_Polar_Covalent_Bonds_Acids_and_Bases/2.09:_Predicting_Acid-Base_Reactions_from_pKa_Values` }],
      calc: { inputs: [{ id: 'r', label: 'pKa del ácido reactivo', value: 4.76, step: 0.01 }, { id: 'p', label: 'pKa del ácido producto', value: 10.76, step: 0.01 }],
        run: v => { const d = v.p - v.r; return `Keq = **${sci(10 ** d)}** → ${d > 0 ? 'gana la **derecha** (productos)' : d < 0 ? 'gana la **izquierda** (reactivos)' : 'quedan **parejos**'}.`; } } },
    { id: 'f-hh', title: 'Henderson-Hasselbalch', formula: 'pH = pKa + log([B] / [BH⁺])', concepts: ['am.sales', 'am.equilibrio'],
      vars: [['pH', 'Acidez del medio', 'sin unidad'], ['pKa', 'Del ion amonio BH⁺', 'sin unidad'], ['[B]', 'Concentración de amina libre (neutra)', 'mol/L'], ['[BH⁺]', 'Concentración de amina protonada (ion amonio)', 'mol/L']],
      what: 'Saber qué **fracción** de una amina está protonada a un pH dado: % protonada = 100 / (1 + 10^(pH − pKa)).',
      when: 'Extracción ácido–base (la sal se va al agua), y fármacos: a pH 7,4 casi todas las alquilaminas están como ion amonio. **No sale en las diapositivas**: es la herramienta que hay detrás de la misión 3.',
      example: 'Metilamina (pKa 10,6) en sangre (pH 7,4): 100 / (1 + 10^(7,4 − 10,6)) ≈ **99,9 % protonada**.',
      deeper: 'Cuando pH = pKa, la mitad está protonada. Cada unidad de pH por debajo del pKa multiplica por 10 la proporción protonada. Por eso con HCl diluido una amina pasa casi entera al agua como sal, y con NaOH vuelve a la capa orgánica.',
      sources: [{ label: 'McMurry (LibreTexts) · 24.6 Biological Amines and the Henderson-Hasselbalch Equation', url: `${LT}/24:_Amines_and_Heterocycles/24.06:_Biological_Amines_and_the_Henderson-Hasselbalch_Equation` }, { label: 'Cátedra · diap. 14 (fármacos) y 16 (sales)', slide: 14 }],
      calc: { inputs: [{ id: 'ph', label: 'pH', value: 7.4, step: 0.1 }, { id: 'pka', label: 'pKa del ion amonio', value: 10.6, step: 0.1 }],
        run: v => `Protonada: **${num(100 / (1 + 10 ** (v.ph - v.pka)), 2)} %** · libre: ${num(100 - 100 / (1 + 10 ** (v.ph - v.pka)), 2)} %` } },
    { id: 'f-cf', title: 'Carga formal', formula: 'CF = V − (N + E)', concepts: ['base.carga', 'am.par-libre', 'am.clasificacion'],
      vars: [['V', 'Electrones de valencia del átomo libre (C 4, N 5, O 6)', 'electrones'], ['N', 'Electrones no enlazantes (2 por cada par libre)', 'electrones'], ['E', 'Número de enlaces (uno por enlace; un doble cuenta 2)', 'enlaces']],
      what: 'Saber qué átomo lleva la carga en un ion: por ejemplo, el + del ion amonio.',
      when: 'Al dibujar Lewis, sales de amonio, mecanismos e intermediarios (iminio, diazonio, carbocationes).',
      example: 'N del ion amonio NH₄⁺: 5 − (0 + 4) = **+1**. N del amoníaco: 5 − (2 + 3) = **0**.',
      deeper: 'Cada enlace es "mitad tuyo": te toca 1 electrón por enlace; los pares libres son enteros tuyos. Si te tocan menos electrones de los que traías, quedas positivo.',
      sources: [{ label: 'Cátedra · diap. 5 y 15', slide: 15 }, { label: 'LibreTexts · Formal Charge', url: 'https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps/Supplemental_Modules_(Physical_and_Theoretical_Chemistry)/Physical_Properties_of_Matter/Atomic_and_Molecular_Properties/Formal_Charges/Formal_Charge' }],
      calc: { inputs: [{ id: 'v', label: 'V (valencia)', value: 5, step: 1 }, { id: 'n', label: 'N (e⁻ no enlazantes)', value: 0, step: 2 }, { id: 'e', label: 'E (enlaces)', value: 4, step: 1 }],
        run: v => { const q = v.v - (v.n + v.e); return `Carga formal = **${q > 0 ? '+' : q < 0 ? '−' : ''}${Math.abs(q)}**`; } } },
    { id: 'f-nrule', title: 'Regla del nitrógeno', formula: 'M impar  ⇔  número impar de N', concepts: ['am.espectro'],
      vars: [['M', 'Masa nominal del ion molecular (m/z del M⁺)', 'u']],
      what: 'Sospechar una amina (o un número impar de N) mirando el espectro de masas.',
      when: 'Espectrometría de masas: si el ion molecular tiene masa **impar**, la molécula tiene 1, 3, 5… átomos de N.',
      example: 'Butilamina, C₄H₁₁N: M = 73, impar → un N. Butano, C₄H₁₀: M = 58, par.',
      deeper: 'El N tiene masa par (14) pero hace 3 enlaces: obliga a un número impar de H, y ese H extra deja la masa impar. Con 0 o 2 N, la masa vuelve a ser par.',
      sources: [{ label: 'Cátedra · diap. 47', slide: 47 }, { label: 'McMurry (LibreTexts) · 24.11 Spectroscopy of Amines', url: `${LT}/24:_Amines_and_Heterocycles/24.11:_Spectroscopy_of_Amines` }],
      calc: { inputs: [{ id: 'm', label: 'Masa del ion molecular', value: 73, step: 1 }], run: v => (Math.round(v.m) % 2 ? 'Masa **impar** → número **impar** de N (1, 3…)' : 'Masa **par** → **0 o un número par** de N') } },
    { id: 'f-ir', title: 'Picos N–H en el IR', formula: '1° → 2 picos · 2° → 1 pico · 3° → ninguno  (3350–3500 cm⁻¹)', concepts: ['am.espectro', 'am.clasificacion'],
      vars: [['cm⁻¹', 'Número de onda de la absorción', 'cm⁻¹']],
      what: 'Distinguir aminas 1°, 2° y 3° con un espectro IR.',
      when: 'Identificar una amina desconocida. Las señales N–H son menos intensas que las O–H.',
      example: 'Propilamina (1°): dos picos. Etilmetilamina (2°): uno. Trimetilamina (3°): ninguno; se detecta con HCl (aparece N–H⁺ entre 2200 y 3000 cm⁻¹).',
      deeper: 'Una amina 1° tiene dos enlaces N–H que vibran juntos de dos maneras (simétrica y asimétrica): dos picos. La 2° tiene un solo N–H: un pico. La 3° no tiene N–H.',
      sources: [{ label: 'Cátedra · diap. 44', slide: 44 }, { label: 'McMurry (LibreTexts) · 24.11 Spectroscopy of Amines', url: `${LT}/24:_Amines_and_Heterocycles/24.11:_Spectroscopy_of_Amines` }] },
    { id: 'f-huckel', title: 'Regla de Hückel', formula: 'aromático: cíclico, plano, conjugado y con 4n + 2 electrones π', concepts: ['am.heterociclos', 'am.orden', 'am.resonancia'],
      vars: [['n', '0, 1, 2… (un número entero)', '—'], ['4n + 2', '2, 6, 10… electrones π', 'electrones']],
      what: 'Decidir si un anillo es aromático, y por eso si el par libre de un N "está ocupado" en la aromaticidad.',
      when: 'Basicidad de heterociclos: en el **pirrol** el par del N es parte de los 6 π (no básico); en la **piridina** no (sí básico).',
      example: 'Pirrol: 4 electrones π de los dos C=C + 2 del par del N = **6** (n = 1) → aromático; protonarlo destruiría el sexteto.',
      deeper: 'Con 4n + 2 electrones π se llenan justo los orbitales de enlace del anillo: una capa cerrada, muy estable. Por eso el pirrol no "presta" su par: perdería esa estabilidad.',
      sources: [{ label: 'Cátedra · diap. 26', slide: 26 }, { label: 'McMurry (LibreTexts) · 15.3 Aromaticity and the Hückel 4n + 2 Rule', url: 'https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Organic_Chemistry_(McMurry)/15:_Benzene_and_Aromaticity/15.03:_Aromaticity_and_the_Huckel_4n__2_Rule' }],
      calc: { inputs: [{ id: 'pi', label: 'Electrones π del anillo', value: 6, step: 1 }], run: v => ((v.pi - 2) % 4 === 0 && v.pi >= 2 ? `**${v.pi}** = 4·${(v.pi - 2) / 4} + 2 → cumple Hückel (si es cíclico, plano y conjugado)` : `**${v.pi}** no es 4n + 2 → no aromático${v.pi % 4 === 0 && v.pi > 0 ? ' (con 4n puede ser antiaromático)' : ''}`) } }
  ];

  /* Recetario: se completa con tu evidencia (misma que las hojas del árbol). */
  cls.recipes = [
    { id: 'rc-alquil', mission: 'm6', concept: 'am.alquilacion', slide: 30, title: 'Alquilación del amoníaco', base: 'NH₃ (en gran exceso)', reagents: 'Haluro de alquilo R–X', condition: 'SN2; mucho NH₃ para favorecer la 1°', result: 'R–NH₂… y una **mezcla** de 2°, 3° y sal cuaternaria', note: 'La amina producto también ataca: polialquilación.' },
    { id: 'rc-azida', mission: 'm6', concept: 'am.alquilacion', slide: 31, title: 'Vía azida', base: 'Haluro de alquilo R–X', reagents: '1) NaN₃ · 2) LiAlH₄', condition: 'SN2 y después reducción', result: 'Amina **1°** R–NH₂, sin polialquilación', note: 'La azida entra una sola vez.' },
    { id: 'rc-gabriel', mission: 'm6', concept: 'am.alquilacion', slide: 31, title: 'Síntesis de Gabriel', base: 'Haluro de alquilo R–X (1°)', reagents: '1) Ftalimida + KOH · 2) hidrazina (H₂N–NH₂) o hidrólisis', condition: 'SN2 con el N⁻ de la ftalimida', result: 'Amina **1°** pura R–NH₂', note: 'La N-alquilftalimida no vuelve a reaccionar: no sobrealquila.' },
    { id: 'rc-aminred', mission: 'm6', concept: 'am.reduccion', slide: 32, title: 'Aminación reductiva', base: 'Aldehído o cetona', reagents: 'NH₃ o una amina + NaBH₃CN (o H₂/catalizador)', condition: 'Se forma una imina que se reduce en el mismo matraz', result: 'Con NH₃ → 1° · con 1° → 2° · con 2° → 3°', note: 'Agrega un grupo al N sin sobrealquilar.' },
    { id: 'rc-amida', mission: 'm6', concept: 'am.reduccion', slide: 33, title: 'Reducción de amidas', base: 'Amida R–CO–NH₂', reagents: 'LiAlH₄ (y después agua)', condition: 'Reducción fuerte', result: 'R–CH₂–NH₂: el C=O se vuelve CH₂', note: 'Desde un ácido carboxílico: primero la amida, después LiAlH₄.' },
    { id: 'rc-nitro', mission: 'm6', concept: 'am.reduccion', slide: 33, title: 'Reducción de nitroarenos', base: 'Nitrobenceno Ar–NO₂', reagents: 'H₂/Pt, Fe/HCl o Sn/HCl', condition: 'Reducción del grupo nitro', result: '**Anilina** Ar–NH₂', note: 'Así se prepara la anilina desde el benceno (nitrar y reducir).' },
    { id: 'rc-acil', mission: 'm7', concept: 'am.acilacion', slide: 34, ...mission('m7').parts.find(p => p.id === 'r1').recipe },
    { id: 'rc-diaz', mission: 'm7', concept: 'am.diazonio', slide: 39, ...mission('m7').parts.find(p => p.id === 'r2').recipe },
    { id: 'rc-sandmeyer', mission: 'm7', concept: 'am.diazonio', slide: 40, title: 'Sandmeyer y compañía', base: 'Sal de diazonio Ar–N₂⁺', reagents: 'CuCl · CuBr · CuCN · KI · HBF₄ · H₂O', condition: 'Calor suave (sale N₂)', result: 'Ar–Cl · Ar–Br · Ar–CN · Ar–I · Ar–F · Ar–OH', note: 'El N₂ es un grupo saliente buenísimo: casi cualquier cosa lo reemplaza.' },
    { id: 'rc-hofmann', mission: 'm7', concept: 'am.hofmann', slide: 35, ...mission('m7').parts.find(p => p.id === 'r3').recipe }
  ];

  for (const [part, rid] of [['r1', 'rc-gabriel'], ['r2', 'rc-aminred'], ['r3', 'rc-nitro']]) mission('m6').parts.find(p => p.id === part).recipe = cls.recipes.find(r => r.id === rid);

  /* ── Más ayuda (a pedido de Niquito, 5 oct): si la explicación simple no alcanza → mini clase; si quieres más → a profundidad.
     Cada bloque de lección sabe de qué concepto es (BLOCK_CONCEPT); las mini clases y las clases a fondo van por concepto. ── */
  const BLOCK_CONCEPT = {
    f1: 'base.lewis', f2: 'base.lewis', f3: 'base.acido-base', f4: 'am.clasificacion', f5: 'am.geometria', b1: 'am.clasificacion', b2: 'am.par-libre', b3: 'am.geometria',
    f21: 'am.nombres', f22: 'am.nombres-aril', b21: 'am.nombres', b22: 'am.nombres-aril', b23: 'am.nombres-aril', b24: 'am.nombres', b25: 'am.nombres',
    f31: 'am.fisicas', f32: 'am.fisicas', b31: 'am.fisicas', b32: 'am.fisicas', b33: 'am.fisicas', b34: 'am.sales',
    f41: 'base.acido-base', f42: 'am.equilibrio', f43: 'am.pka', b41: 'am.pka', b42: 'am.equilibrio', b43: 'am.pka',
    f51: 'am.resonancia', f52: 'am.heterociclos', f53: 'am.resonancia', b51: 'am.resonancia', b51m: 'am.resonancia', b52: 'am.resonancia', b53: 'am.resonancia', b54: 'am.heterociclos', b55: 'am.heterociclos', b56: 'am.orden',
    f61: 'base.sn-e', f62: 'am.reduccion', b61: 'am.alquilacion', b62: 'am.alquilacion', b62m: 'am.alquilacion', b63: 'am.alquilacion', b64: 'am.reduccion', b64m: 'am.reduccion', b65: 'am.reduccion',
    f69: 'base.lewis', f70: 'am.acilacion', f71: 'base.sn-e', f72: 'base.sn-e', b71: 'am.acilacion', b71m: 'am.acilacion', b73: 'am.diazonio', b74: 'am.diazonio', b72: 'am.hofmann', b72m: 'am.hofmann',
    f81: 'am.espectro', f82: 'am.espectro', b81: 'am.espectro', b82: 'am.espectro', b83: 'am.espectro'
  };
  for (const m of cls.missions) for (const blk of [...(m.stages.fundamentals || []), ...(m.stages.explain || []), ...(m.parts || []).flatMap(p => p.explain || [])]) blk.concept ||= BLOCK_CONCEPT[blk.id];
  for (const m of cls.base) for (const blk of m.stages.explain) blk.concept ||= m.concept;

  const mc = (prompt, options, explain) => ({ prompt, options, explain });
  /* Mini clase (2 minutos): una idea con imagen, 3 pasos con ejemplo y una pregunta de control. No cuenta como evidencia: es andamiaje. */
  cls.mini = {
    'base.lewis': { idea: 'Piensa en cada átomo como alguien con un número fijo de manos: el C tiene 4, el N 3 (y guarda un par), el O 2 (y guarda dos pares), el H 1.',
      steps: ['Cuenta los electrones de valencia: el N trae **5**.', 'Cada enlace usa 1 de los suyos: con 3 enlaces el N usó 3 y le quedan **2**, es decir, **un par libre**.', 'En CH₃–NH₂ el N tiene 3 enlaces (C, H, H) y su par libre listo para usar.'],
      check: mc('¿Cuántos enlaces hace un O neutro?', [{ text: '2', correct: true }, { text: '1', note: 'Con 1 enlace y 3 pares el O queda con carga −1 (como en el OH⁻).' }, { text: '3', note: 'Con 3 enlaces el O queda con carga +1 (como en el H₃O⁺).' }], 'El O trae 6 electrones: 2 en enlaces y 4 en dos pares libres.') },
    'base.carga': { idea: 'La carga formal compara lo que un átomo **trae** con lo que le **toca** dentro de la molécula. Si le toca menos, queda +; si le toca más, queda −.',
      steps: ['Lo que trae: sus electrones de valencia (N = 5, O = 6, C = 4).', 'Lo que le toca: sus pares libres enteros + **1 por cada enlace**.', 'Resta: N del NH₄⁺ → 5 − (0 + 4) = **+1**.'],
      check: mc('El O del H₃O⁺ tiene 3 enlaces y 1 par libre. ¿Su carga formal?', [{ text: '+1', correct: true }, { text: '0', note: '6 − (2 + 3) = +1: le toca un electrón menos de los que trae.' }, { text: '−1', note: 'Al revés: le tocan 5 y trae 6, queda positivo.' }], '6 − (2 + 3) = +1.') },
    'base.acido-base': { idea: 'Un ácido **regala** un H⁺; una base lo **recibe** usando un par de electrones. Es pasarse un protón de mano en mano.',
      steps: ['Busca el H⁺ que cambia de dueño.', 'Quien lo pierde es el **ácido**; quien lo gana es la **base**.', 'CH₃NH₂ + HCl → CH₃NH₃⁺ + Cl⁻: el HCl es el ácido y la amina la base.'],
      check: mc('En NH₃ + H₂O ⇌ NH₄⁺ + OH⁻, ¿quién actúa como base?', [{ text: 'NH₃', correct: true }, { text: 'H₂O', note: 'El agua entrega su H⁺: aquí es el ácido.' }, { text: 'NH₄⁺', note: 'Ese es el ácido conjugado que se forma.' }], 'El NH₃ recibe el H⁺ con su par libre.') },
    'base.sn-e': { idea: 'Llega un atacante con un par de electrones a una molécula que tiene un grupo con ganas de irse. Si ataca al **carbono**, lo reemplaza (SN2). Si le quita un **H al vecino**, se forma un doble enlace (E2).',
      steps: ['Encuentra el grupo saliente (Br, Cl, I, –N(CH₃)₃⁺).', '¿El atacante va al carbono o al H del carbono de al lado?', 'Carbono → sustitución. H vecino → eliminación con C=C.'],
      check: mc('OH⁻ + CH₃–Br → CH₃–OH + Br⁻ es una…', [{ text: 'SN2', correct: true }, { text: 'E2', note: 'No se formó ningún doble enlace: el OH⁻ reemplazó al Br.' }, { text: 'Reacción ácido–base', note: 'No se movió un H⁺: el OH⁻ se unió al carbono.' }], 'El OH⁻ atacó al carbono y salió el Br⁻: sustitución.') },
    'am.par-libre': { idea: 'El par libre es la **mano libre** del N: con ella agarra un H⁺ (actúa como base) o ataca a un carbono con δ+ (actúa como nucleófilo).',
      steps: ['Encuentra el N y su par libre.', 'Si el par agarra un **H⁺** → la amina es **base**.', 'Si el par ataca a un **carbono** → la amina es **nucleófilo**.'],
      check: mc('CH₃NH₂ + CH₃I → (CH₃)₂NH₂⁺ I⁻. Aquí la amina actúa como…', [{ text: 'Nucleófilo', correct: true }, { text: 'Base', note: 'No atrapó un H⁺: atacó al carbono del CH₃I.' }, { text: 'Ácido', note: 'No entregó ningún H⁺.' }], 'Su par libre atacó a un carbono: nucleófilo.') },
    'am.clasificacion': { idea: 'Cuenta cuántos carbonos le **dan la mano** al nitrógeno. Los H no cuentan.',
      steps: ['Encuentra el N.', 'Cuenta los carbonos unidos **directamente** a él.', '1 → primaria, 2 → secundaria, 3 → terciaria, 4 → sal de amonio cuaternario.'],
      check: mc('La dietilamina, (CH₃CH₂)₂NH, es…', [{ text: 'Secundaria', correct: true }, { text: 'Primaria', note: 'Hay dos grupos etilo unidos al N.' }, { text: 'Terciaria', note: 'El N todavía tiene un H: solo dos carbonos lo tocan.' }], 'Dos carbonos unidos al N: secundaria.') },
    'am.geometria': { idea: 'Imagina una **pirámide baja**: el N arriba, tres grupos abajo y el par libre apuntando hacia afuera como un paraguas.',
      steps: ['3 enlaces + 1 par = 4 zonas de electrones → se ordenan en tetraedro.', 'Pero la forma se nombra solo con los átomos: queda una **pirámide trigonal**.', 'El ángulo es de unos 108° y la pirámide se invierte rapidísimo, como un paraguas con viento.'],
      check: mc('¿Qué forma tiene la trimetilamina, (CH₃)₃N?', [{ text: 'Piramidal trigonal', correct: true }, { text: 'Plana trigonal', note: 'El par libre empuja los enlaces hacia abajo: no queda plana.' }, { text: 'Tetraédrica', note: 'Tetraédrica es la de los 4 pares de electrones; con los átomos solos es una pirámide.' }], '3 grupos + 1 par libre: pirámide trigonal.') },
    'am.nombres': { idea: 'El nombre se arma como una dirección: **grupos del N** (con "N-", en orden alfabético) + **cadena principal** + **"amina"**.',
      steps: ['Busca la cadena más larga que lleva el N: da la raíz (propan-, butan-…).', 'Los otros grupos unidos al N van con el localizador **N-**.', 'CH₃–NH–CH₂CH₂CH₃ → **N-metilpropan-1-amina**.'],
      check: mc('CH₃CH₂–NH₂ se llama…', [{ text: 'Etanamina (etilamina)', correct: true }, { text: 'Metanamina', note: 'Tiene dos carbonos: etan-.' }, { text: 'N-etilamina', note: 'El N- se usa para grupos extra sobre el N, no para la cadena principal.' }], 'Dos carbonos con el NH₂: etanamina.') },
    'am.nombres-aril': { idea: 'Si el NH₂ está en un benceno, la base del nombre es **anilina**. Si hay un grupo más importante (–OH, –COOH), ese manda y el NH₂ pasa a ser "**amino**".',
      steps: ['¿El NH₂ está pegado a un benceno? → anilina.', '¿Hay –OH o –COOH? → ellos dan el nombre y el NH₂ es prefijo amino-.', 'HO–C₆H₄–NH₂ (para) → **4-aminofenol**, el del paracetamol.'],
      check: mc('C₆H₅–NH–CH₃ se llama…', [{ text: 'N-metilanilina', correct: true }, { text: '4-metilanilina', note: 'Ese tiene el CH₃ en el anillo, no en el N.' }, { text: 'Metilamina', note: 'Falta el anillo en ese nombre.' }], 'El CH₃ está en el N: N-metilanilina.') },
    'am.fisicas': { idea: 'Los N–H son **ganchos** (puentes de hidrógeno) que pegan moléculas entre sí y con el agua.',
      steps: ['Aminas 1° y 2° tienen N–H → se enganchan → hierven más alto.', 'Las 3° no tienen N–H → se pegan menos → hierven más bajo.', 'Con pocos carbonos son solubles en agua; con muchos, la cadena de carbonos gana.'],
      check: mc('Misma fórmula (C₃H₉N): ¿cuál hierve más alto?', [{ text: 'Propilamina (1°)', correct: true }, { text: 'Trimetilamina (3°)', note: 'Sin N–H no forma puentes de H entre sus moléculas: hierve a unos 3 °C.' }], 'La propilamina tiene dos N–H: hierve a unos 48 °C.') },
    'am.sales': { idea: 'Con un ácido, la amina se vuelve un **ion** (una sal). Los iones aman el agua y no se disuelven en éter.',
      steps: ['Amina + HCl → R–NH₃⁺ Cl⁻ (sal).', 'La sal se va a la capa de **agua**.', 'Con NaOH vuelve a ser amina neutra y regresa al **éter**.'],
      check: mc('Para pasar una amina del éter al agua agregas…', [{ text: 'HCl diluido', correct: true }, { text: 'NaOH', note: 'Una base deja la amina neutra: se queda en el éter.' }, { text: 'Más éter', note: 'Eso no cambia nada: sigue neutra.' }], 'El HCl la protona: la sal se va al agua.') },
    'am.pka': { idea: 'El pKa del ion amonio mide qué tanto **se aferra** la amina al H⁺ que atrapó. Más alto, más se aferra: más básica.',
      steps: ['Busca el pKa del **ion amonio** (a veces se escribe pKaH).', 'Compara: el **mayor** es la base más fuerte.', 'Metilamina (10,6) > anilina (4,6): la metilamina es mucho más básica.'],
      check: mc('Amina A: pKaH 9. Amina B: pKaH 11. ¿Cuál es más básica?', [{ text: 'B', correct: true }, { text: 'A', note: 'Al revés: mayor pKa del ion amonio, base más fuerte.' }], 'B se aferra más a su H⁺.') },
    'am.equilibrio': { idea: 'Es una **pelea por el H⁺**: el equilibrio queda del lado donde está el ácido más débil (el que menos quiere soltarlo).',
      steps: ['Identifica los dos ácidos: uno a cada lado de la flecha.', 'Compara sus pKa.', 'Gana el lado del ácido con pKa **mayor**.'],
      check: mc('CH₃COOH (pKa 4,8) + CH₃NH₂ ⇌ CH₃COO⁻ + CH₃NH₃⁺ (pKa 10,6). ¿Hacia dónde va?', [{ text: 'A la derecha', correct: true }, { text: 'A la izquierda', note: 'El ácido más débil (10,6) está a la derecha: ese lado gana.' }], 'Gana el lado del ácido más débil: la derecha.') },
    'am.resonancia': { idea: 'Si el par libre del N puede **pasearse** por un anillo o hacia un C=O, está menos disponible para atrapar un H⁺.',
      steps: ['¿El N está pegado a un anillo aromático o a un C=O?', 'Si sí, su par se reparte por resonancia.', 'Menos par disponible → menos básica: anilina < ciclohexilamina; una amida casi no es básica.'],
      check: mc('¿Cuál es menos básica?', [{ text: 'Anilina', correct: true }, { text: 'Ciclohexilamina', note: 'Su par no tiene dónde deslocalizarse: es la más básica de las dos.' }], 'En la anilina el par se reparte por el anillo.') },
    'am.heterociclos': { idea: 'En un anillo con N pregunta: ¿el par del N es parte del **equipo aromático** o está libre afuera del anillo?',
      steps: ['Cuenta los electrones π del anillo.', 'Si el par del N hace falta para llegar a 6 → está ocupado (pirrol, no básico).', 'Si no hace falta y apunta hacia afuera → está libre (piridina, básica).'],
      check: mc('¿Cuál es más básica?', [{ text: 'Piridina', correct: true }, { text: 'Pirrol', note: 'Su par forma parte de los 6 electrones aromáticos: protonarlo rompería la aromaticidad.' }], 'En la piridina el par queda fuera del anillo, en un orbital sp².') },
    'am.orden': { idea: 'Para ordenar por basicidad revisa en este orden: **resonancia**, **hibridación** y **grupos que donan o atraen** electrones.',
      steps: ['Resonancia con C=O o con un anillo baja mucho la basicidad.', 'sp³ > sp² > sp.', 'Grupos donadores la suben un poco; atractores como –NO₂ la bajan mucho.'],
      check: mc('De menor a mayor basicidad:', [{ text: 'Acetamida < anilina < metilamina', correct: true }, { text: 'Anilina < acetamida < metilamina', note: 'La amida es la menos básica: su par está muy deslocalizado hacia el C=O.' }, { text: 'Metilamina < anilina < acetamida', note: 'Está al revés: la alquilamina es la más básica.' }], 'Amida (casi nada) < arilamina < alquilamina.') },
    'am.alquilacion': { idea: 'El N ataca con su par al carbono de un R–X y bota al X⁻ (SN2). El problema: la amina que se forma también tiene par libre y **sigue atacando**.',
      steps: ['NH₃ + R–X → R–NH₂.', 'R–NH₂ vuelve a atacar → mezcla de 1°, 2°, 3° y sal cuaternaria.', 'Para una sola alquilación: **azida** (NaN₃ y luego LiAlH₄) o **Gabriel**.'],
      check: mc('¿Qué ruta da propilamina pura desde 1-bromopropano?', [{ text: 'Gabriel (ftalimida + KOH, luego hidrazina)', correct: true }, { text: 'Un poco de NH₃', note: 'Con poco NH₃ la sobrealquilación es peor: el producto compite por el R–X.' }, { text: 'HCl', note: 'El HCl no pone ningún N.' }], 'Gabriel pone el N una sola vez.') },
    'am.reduccion': { idea: 'Reducir es **agregar H o quitar O**: un C=O puede volverse CH₂, un C=N un CH–N y un NO₂ un NH₂.',
      steps: ['Aldehído o cetona + amina → imina (C=N).', 'NaBH₃CN reduce el C=N → amina (aminación reductiva).', 'Amida + LiAlH₄ → el C=O pasa a CH₂. Ar–NO₂ + Fe/HCl → Ar–NH₂.'],
      check: mc('Acetona + NH₃ + NaBH₃CN da…', [{ text: 'Propan-2-amina (isopropilamina)', correct: true }, { text: 'Propanamida', note: 'No se forma C=O nuevo: el C=O se convierte en C–N.' }, { text: 'Nada: la acetona no reacciona', note: 'Forma una imina con el NH₃, que se reduce.' }], 'El C=O de la acetona termina como CH–NH₂.') },
    'am.acilacion': { idea: 'La amina **intercambia** un H de su N por un grupo acilo (CH₃–C=O). Si no tiene H en el N, no puede intercambiar.',
      steps: ['El par del N ataca al C=O del cloruro de ácido.', 'Sale Cl⁻ y luego el N pierde un H⁺.', 'Queda la amida R–NH–CO–R′.'],
      check: mc('CH₃NH₂ + CH₃COCl da…', [{ text: 'N-metilacetamida, CH₃–NH–CO–CH₃', correct: true }, { text: 'CH₃–NH₃⁺ Cl⁻ solamente', note: 'Eso pasa con la segunda amina que atrapa el HCl, pero la primera forma la amida.' }, { text: 'Nada', note: 'Es una amina primaria: tiene H en el N y se acila.' }], 'El N cambia un H por el acetilo.') },
    'am.hofmann': { idea: 'Convierte el –NH₂ en un grupo saliente **gigante** (–N(CH₃)₃⁺) y luego elimina: por ser tan grande, la base saca el H más fácil de alcanzar.',
      steps: ['CH₃I en exceso → sal de amonio cuaternario.', 'Ag₂O, H₂O → el contraión pasa a OH⁻.', 'Calor → E2 → alqueno **menos** sustituido.'],
      check: mc('Hofmann de la 2-butanamina: producto principal', [{ text: '1-Buteno', correct: true }, { text: '2-Buteno', note: 'Ese sería el de Zaitsev. El grupo saliente gigante hace ganar al menos sustituido.' }], 'La base saca el H del CH₃ de la punta.') },
    'am.diazonio': { idea: 'Convierte el NH₂ de una anilina en **–N₂⁺**, el mejor grupo saliente que existe (sale como gas N₂), y cámbialo por lo que quieras.',
      steps: ['NaNO₂ + HCl a 0–5 °C → Ar–N₂⁺.', 'Agrega el reactivo: CuCl, CuBr, CuCN, KI, HBF₄ o agua caliente.', 'Sale N₂ y entra Cl, Br, CN, I, F u OH.'],
      check: mc('Para Ar–Br desde Ar–N₂⁺ usas…', [{ text: 'CuBr', correct: true }, { text: 'CuCl', note: 'Ese pone Cl.' }, { text: 'KI', note: 'Ese pone I.' }], 'Sandmeyer con CuBr.') },
    'am.espectro': { idea: 'Tres pistas: el **IR** cuenta los N–H, el **espectro de masas** mira si M es impar y la **RMN** mira los H cerca del N.',
      steps: ['IR: dos picos N–H → 1°; uno → 2°; ninguno → 3°.', 'Masas: M impar → número impar de N.', 'RMN ¹H: los H del C unido al N salen cerca de 2,3–3 ppm; el N–H es una señal ancha.'],
      check: mc('C₃H₉N, ion molecular 59, sin picos N–H en el IR:', [{ text: 'Trimetilamina', correct: true }, { text: 'Propilamina', note: 'Es primaria: tendría dos picos N–H.' }, { text: 'Etilmetilamina', note: 'Es secundaria: tendría un pico N–H.' }], 'Sin N–H y con un N: amina terciaria.') }
  };

  /* Ver a profundidad: la clase más profunda de un tema (por qué pasa de verdad, con números), un desafío y fuentes. */
  const IUPAC_KA = { label: 'IUPAC Gold Book · acidity constant', url: 'https://goldbook.iupac.org/terms/view/A00080' };
  cls.deep = {
    'base.acido-base': { title: 'Ácidos y bases a fondo', sections: [
        ['Brønsted y Lewis', 'Brønsted: ácido = dador de H⁺, base = aceptor de H⁺. Lewis lo amplía: base = dador de un **par de electrones**, ácido = aceptor. Una amina es base de las dos maneras: su par libre recibe un H⁺ (Brønsted) o se une a un BF₃ (Lewis).'],
        ['Una tabla de pKa para orientarte', 'HCl ≈ −7 · H₃O⁺ ≈ −1,7 · ácido acético 4,76 · ion amonio NH₄⁺ 9,25 · ion metilamonio 10,6 · agua 15,7. Cualquier base cuyo ácido conjugado tenga pKa mayor que el del ácido de la izquierda le quitará el H⁺.'],
        ['El agua pone el techo', 'En agua, ningún ácido más fuerte que el H₃O⁺ sobrevive: todos le pasan su H⁺ al agua (efecto nivelador). Por eso el HCl y el HNO₃ "son igual de fuertes" en agua.']],
      challenge: mc('¿Qué ácido protona casi por completo a la metilamina (pKaH 10,6) en agua?', [{ text: 'Ácido acético (pKa 4,76)', correct: true }, { text: 'Ninguno: las aminas son bases débiles', note: 'Débil no significa que no reaccione: con ΔpKa ≈ 6 el equilibrio va un millón a uno.' }, { text: 'Solo el HCl', note: 'Basta un ácido con pKa bastante menor que 10,6.' }], 'ΔpKa = 10,6 − 4,76 ≈ 6 → Keq ≈ 10⁶.'),
      sources: [{ label: 'Cátedra · diap. 17', slide: 17 }, IUPAC_KA, { label: 'McMurry (LibreTexts) · 2.9', url: 'https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map:_Organic_Chemistry_(McMurry)/02:_Polar_Covalent_Bonds_Acids_and_Bases/2.09:_Predicting_Acid-Base_Reactions_from_pKa_Values' }] },
    'am.pka': { title: 'Qué decide el pKa de una amina', sections: [
        ['El pKa es energía', 'ΔG° = 2,303·R·T·pKa. A 25 °C, **cada unidad de pKa son unos 5,7 kJ/mol**. Entre la metilamina (10,6) y la anilina (4,6) hay 6 unidades: unos 34 kJ/mol de diferencia en lo que cuesta quitarle el H⁺ al ion amonio.'],
        ['Efecto inductivo', 'Los grupos alquilo donan densidad electrónica y estabilizan la carga + del ion amonio. En fase gaseosa el orden es 3° > 2° > 1° > NH₃.'],
        ['El agua cambia el orden', 'En agua el ion amonio se estabiliza con puentes de H en sus N–H. El ion de una amina 3° tiene un solo N–H: se solvata peor. Resultado en agua: **2° > 1° > 3°** (lo ves en la misión 5).'],
        ['Hibridación y resonancia', 'Más carácter s retiene más el par (sp³ > sp² > sp). Y si el par se deslocaliza (anilina, amida), el ion amonio pierde esa estabilización: pKa mucho menor.']],
      challenge: mc('¿Por qué la trimetilamina es menos básica que la dimetilamina en agua, si tiene más grupos donadores?', [{ text: 'Su ion amonio tiene un solo N–H y se solvata peor', correct: true }, { text: 'Porque los metilos atraen electrones', note: 'Los alquilos donan, no atraen: por eso en fase gaseosa la 3° es la más básica.' }, { text: 'Porque es plana', note: 'Es piramidal, como todas las aminas simples.' }], 'La solvatación por puentes de H del ion amonio pesa más que el efecto inductivo en agua.'),
      sources: [{ label: 'Cátedra · diap. 18 y 27', slide: 18 }, IUPAC_KA, { label: 'McMurry (LibreTexts) · 24.3 Basicity of Amines', url: 'https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map:_Organic_Chemistry_(McMurry)/24:_Amines_and_Heterocycles/24.03:_Basicity_of_Amines' }] },
    'am.equilibrio': { title: 'Equilibrios ácido–base con números', sections: [
        ['De dónde sale la regla', 'Para HA + B ⇌ A⁻ + BH⁺: Keq = Ka(HA) / Ka(BH⁺) = 10^(pKa(BH⁺) − pKa(HA)). Por eso gana el lado del ácido más débil.'],
        ['Cuánto reacciona', 'Si partes con cantidades iguales: Keq = 100 (ΔpKa = 2) → reacciona ~91 %. Keq = 10⁴ → ~99 %. Keq = 10⁶ → prácticamente todo.'],
        ['Para qué te sirve', 'Extracción: con HCl (pKa −7) cualquier amina pasa a sal y se va al agua. Fármacos: muchos se venden como clorhidratos (sales), más solubles y estables.']],
      challenge: mc('Con cantidades iguales y ΔpKa = 2, ¿qué fracción reacciona?', [{ text: 'Cerca del 91 %', correct: true }, { text: 'El 100 %', note: 'Keq = 100 es grande, pero no infinita: x/(1−x) = 10 → x ≈ 0,91.' }, { text: 'El 50 %', note: 'Eso sería con Keq = 1 (ΔpKa = 0).' }], 'x²/(1−x)² = 100 → x/(1−x) = 10 → x ≈ 0,91.'),
      sources: [{ label: 'Cátedra · diap. 17', slide: 17 }, { label: 'McMurry (LibreTexts) · 2.9', url: 'https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map:_Organic_Chemistry_(McMurry)/02:_Polar_Covalent_Bonds_Acids_and_Bases/2.09:_Predicting_Acid-Base_Reactions_from_pKa_Values' }] },
    'am.resonancia': { title: 'Resonancia y basicidad, con números', sections: [
        ['La anilina', 'El par del N se reparte por el anillo: hay estructuras de resonancia con carga − en las posiciones orto y para. pKaH de la anilina ≈ 4,6 frente a 10,6 de la ciclohexilamina: **un millón de veces** menos básica.'],
        ['Los sustituyentes', 'Un –OCH₃ en para dona electrones y la sube un poco (p-anisidina ≈ 5,3). Un –NO₂ en para atrae el par por resonancia y la baja muchísimo (p-nitroanilina ≈ 1,0).'],
        ['La amida, el extremo', 'En la amida el par está deslocalizado hacia el C=O (el enlace C–N tiene carácter doble). El ácido conjugado de una amida tiene pKa ≈ −0,5 y, además, se protona en el O, no en el N.']],
      challenge: mc('¿Por qué un –NO₂ en para baja tanto la basicidad de la anilina?', [{ text: 'Por resonancia, el par del N se deslocaliza hasta los O del nitro', correct: true }, { text: 'Porque el NO₂ es voluminoso', note: 'El efecto no es estérico: está en para, lejos del N.' }, { text: 'Porque dona electrones', note: 'Al contrario: es un fuerte atractor.' }], 'La deslocalización llega hasta el grupo nitro.'),
      sources: [{ label: 'Cátedra · diap. 22 a 24', slide: 22 }, { label: 'McMurry (LibreTexts) · 24.4 Basicity of Arylamines', url: 'https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map:_Organic_Chemistry_(McMurry)/24:_Amines_and_Heterocycles/24.04:_Basicity_of_Arylamines' }] },
    'base.sn-e': { title: 'La ruta de decisión SN1 · SN2 · E1 · E2', sections: [
        ['El sustrato', 'Metilo y 1°: SN2 (salvo base muy voluminosa → E2). 2°: SN2 con buen nucleófilo poco básico en solvente aprótico; E2 con base fuerte. 3°: nunca SN2; E2 con base fuerte, SN1/E1 con base débil en solvente prótico.'],
        ['Nucleófilo o base', 'I⁻, Br⁻, N₃⁻, CN⁻: buenos nucleófilos, poco básicos → sustitución. OH⁻, CH₃O⁻: fuertes, sirven para las dos. (CH₃)₃CO⁻: base voluminosa → eliminación.'],
        ['Solvente y temperatura', 'Aprótico polar (DMSO, acetona) acelera la SN2. Prótico (agua, alcoholes) estabiliza carbocationes → SN1/E1. El **calor** favorece la eliminación.'],
        ['Estereoquímica', 'SN2: ataque por atrás, **inversión**. E2: el H y el grupo saliente **antiperiplanares** (180°).']],
      challenge: mc('2-bromo-2-metilpropano + CH₃O⁻ en CH₃OH, con calor. ¿Qué predomina?', [{ text: 'E2: 2-metilpropeno', correct: true }, { text: 'SN2: éter metílico', note: 'Un carbono 3° no permite el ataque por atrás.' }, { text: 'SN1', note: 'Con una base fuerte y calor gana la E2.' }], 'Sustrato 3° + base fuerte + calor → E2.'),
      sources: [{ label: 'Cátedra · diap. 35', slide: 35 }, { label: 'McMurry (LibreTexts) · libro completo (cap. 11: sustituciones y eliminaciones)', url: 'https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map:_Organic_Chemistry_(McMurry)' }] },
    'am.alquilacion': { title: 'Alquilar el nitrógeno sin perder el control', sections: [
        ['Por qué se sobrealquila', 'La amina producto tiene su par y además los grupos alquilo la hacen tan buen nucleófilo como el NH₃ o mejor: compite por el R–X y la reacción no se detiene en la 1°.'],
        ['La azida', 'N₃⁻ es un nucleófilo excelente y la alquilazida R–N₃ ya no es nucleófila: entra una sola vez. LiAlH₄ (o H₂/Pd) la reduce a R–NH₂ liberando N₂.'],
        ['Gabriel', 'El N–H de la ftalimida es ácido (pKa ≈ 8,3) porque queda entre dos C=O; el KOH lo desprotona. El N⁻ hace la SN2 y la N-alquilftalimida, sin H y con el par deslocalizado, no sigue. Hidrazina (o hidrólisis) libera la amina 1°.'],
        ['Límites de la SN2', 'Funciona con haluros metílicos y 1° (2° con dificultad). Con 3° gana la eliminación y con haluros de arilo no hay SN2: por eso la anilina se hace por otra vía (nitrar y reducir).']],
      challenge: mc('¿Sirve Gabriel con bromuro de terc-butilo para hacer terc-butilamina?', [{ text: 'No: un haluro 3° no hace SN2 (eliminaría)', correct: true }, { text: 'Sí, igual que con un haluro 1°', note: 'El ataque por atrás está bloqueado en un carbono 3°.' }, { text: 'Sí, pero da amina 2°', note: 'Gabriel siempre da 1°; el problema es que la SN2 no ocurre.' }], 'La SN2 necesita un carbono accesible.'),
      sources: [{ label: 'Cátedra · diap. 30 y 31', slide: 31 }, { label: 'McMurry (LibreTexts) · cap. 24 Amines', url: 'https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map:_Organic_Chemistry_(McMurry)/24:_Amines_and_Heterocycles' }] },
    'am.reduccion': { title: 'Reducciones que dan aminas', sections: [
        ['Aminación reductiva, paso a paso', 'Carbonilo + amina → hemiaminal → pierde agua (catálisis ácida suave, pH ≈ 5–6) → imina o ion iminio. El **NaBH₃CN** es un hidruro suave: reduce el iminio más rápido que la cetona y aguanta el medio ácido.'],
        ['Amida + LiAlH₄', 'A diferencia de un éster (que da alcohol), la amida pierde el O como aluminato, se forma un ion iminio y se reduce otra vez: el C=O termina como **CH₂** y el N se queda.'],
        ['Nitroarenos', 'Ar–NO₂ → Ar–NH₂ es una reducción de 6 electrones. Con Fe/HCl o Sn/HCl la anilina sale como sal; se libera con base (NaOH).']],
      challenge: mc('¿Qué combinación da N-metilciclohexilamina?', [{ text: 'Ciclohexanona + CH₃NH₂ + NaBH₃CN', correct: true }, { text: 'Ciclohexanona + NH₃ + NaBH₃CN', note: 'Eso da ciclohexilamina (1°), sin el metilo en el N.' }, { text: 'Ciclohexanol + CH₃NH₂', note: 'Un alcohol no forma imina.' }], 'La amina que pongas aporta los grupos del N.'),
      sources: [{ label: 'Cátedra · diap. 32 y 33', slide: 32 }, { label: 'McMurry (LibreTexts) · cap. 24 Amines', url: 'https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map:_Organic_Chemistry_(McMurry)/24:_Amines_and_Heterocycles' }] },
    'am.acilacion': { title: 'Acilación a fondo', sections: [
        ['Sustitución nucleofílica en el acilo', 'Adición–eliminación: el N ataca al C=O, se forma un intermediario tetraédrico y vuelve el C=O expulsando al mejor grupo saliente (Cl⁻ mejor que un carboxilato).'],
        ['Dos equivalentes', 'Se libera HCl, que protonaría a la amina y la dejaría sin par: por eso se usan **2 equivalentes de amina** o una base (piridina, NaOH).'],
        ['Se detiene en la amida', 'El par del N de la amida está deslocalizado hacia el C=O: ya no es nucleófilo, así que no se acila dos veces.'],
        ['Para qué se usa', 'Proteger la anilina: la acetanilida es menos activante y deja hacer una sola sustitución (por ejemplo, bromar en para) y después se hidroliza de vuelta (diap. 34).']],
      challenge: mc('¿Por qué se usan 2 equivalentes de amina con el cloruro de acetilo?', [{ text: 'Uno forma la amida y el otro atrapa el HCl', correct: true }, { text: 'Para acilar dos veces', note: 'La amida no se vuelve a acilar.' }, { text: 'Porque la amina es débil', note: 'El motivo es el HCl que se libera.' }], 'El segundo equivalente funciona como base.'),
      sources: [{ label: 'Cátedra · diap. 34', slide: 34 }, { label: 'McMurry (LibreTexts) · cap. 24 Amines', url: 'https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map:_Organic_Chemistry_(McMurry)/24:_Amines_and_Heterocycles' }] },
    'am.hofmann': { title: 'Hofmann a fondo', sections: [
        ['E2 antiperiplanar', 'El H y el grupo saliente deben estar a 180°. Con –N(CH₃)₃⁺, la conformación que lleva al alqueno más sustituido tiene interacciones gauche con el grupo enorme: cuesta más.'],
        ['Un estado de transición "tipo carbanión"', 'El –N(CH₃)₃⁺ sale con dificultad, así que la ruptura C–H va adelantada: gana el H más ácido y más accesible, el de un CH₃ (primario).'],
        ['Control cinético', 'El 1-alqueno es menos estable, pero se forma más rápido. Hofmann se usó para deducir estructuras de alcaloides (metilación exhaustiva).']],
      challenge: mc('Hofmann de la 2-pentanamina: producto principal', [{ text: '1-Penteno', correct: true }, { text: '2-Penteno', note: 'Ese es el de Zaitsev.' }, { text: 'Pentano', note: 'Es una eliminación: se forma un alqueno.' }], 'Gana el H del CH₃ terminal.'),
      sources: [{ label: 'Cátedra · diap. 35 a 37', slide: 36 }, { label: 'McMurry (LibreTexts) · cap. 24 Amines', url: 'https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map:_Organic_Chemistry_(McMurry)/24:_Amines_and_Heterocycles' }] },
    'am.diazonio': { title: 'Sales de diazonio a fondo', sections: [
        ['Cómo se forman', 'NaNO₂ + HCl → HNO₂ → **NO⁺** (ion nitrosonio, el electrófilo). El N de la anilina ataca al NO⁺; tras pasos de pérdida y ganancia de H⁺ sale agua y queda Ar–N≡N⁺.'],
        ['Por qué solo aromáticas', 'El Ar–N₂⁺ se estabiliza por resonancia con el anillo y aguanta en frío. Un alquil-diazonio pierde N₂ al instante y da un carbocatión: mezcla de productos.'],
        ['Sandmeyer y compañía', 'Con Cu(I) el reemplazo va por radicales (transferencia de un electrón). HBF₄ y calor da Ar–F (Schiemann); agua caliente, Ar–OH; KI, Ar–I sin cobre.']],
      challenge: mc('¿Por qué una alquilamina 1° + HNO₂ no da una sal de diazonio útil?', [{ text: 'El alquil-diazonio pierde N₂ al instante y forma un carbocatión', correct: true }, { text: 'Porque no reacciona con HNO₂', note: 'Sí reacciona; el problema es que el producto no dura.' }, { text: 'Porque da una amida', note: 'No hay C=O que forme amida.' }], 'Sin el anillo que lo estabilice, el diazonio se rompe.'),
      sources: [{ label: 'Cátedra · diap. 39 y 40', slide: 39 }, { label: 'McMurry (LibreTexts) · cap. 24 Amines', url: 'https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Map:_Organic_Chemistry_(McMurry)/24:_Amines_and_Heterocycles' }] }
  };
  // Fuentes IUPAC del formulario (verificadas por búsqueda; el sitio de la IUPAC no se puede abrir desde esta sesión).
  const addSrc = (id, src, at = 1) => cls.formulas.find(f => f.id === id).sources.splice(at, 0, src);
  addSrc('f-pka', IUPAC_KA);
  addSrc('f-huckel', { label: 'IUPAC Gold Book · Hückel (4n + 2) rule', url: 'https://goldbook.iupac.org/terms/view/H02867' });
  addSrc('f-cf', { label: 'IUPAC · Glossary of terms used in physical organic chemistry (1994)', url: 'https://publications.iupac.org/pac/66/5/1077/index.html' });
  cls.formulas.find(f => f.id === 'f-cf').deeper += ' Ojo (IUPAC): la carga formal no es la carga real. En el NH₄⁺ el N lleva la carga formal +1, pero los cálculos dicen que en realidad el N es algo negativo y los H son positivos.';
  cls.formulas.find(f => f.id === 'f-huckel').deeper += ' La IUPAC la define para sistemas monocíclicos planos y advierte que en general vale para n = 0 a 5; con 4n electrones π el sistema es antiaromático.';

  for (const m of cls.missions) for (const stage of ['diagnostic', 'practice', 'challenge', 'transfer'])
    for (const item of m.stages[stage] || []) item.concept ||= CONCEPT_OF[item.id];
  /* ── Etapa 6: misiones 1, 2, 3 y 8 al modelo de la clase viva. Se reusan las lecciones y actividades de siempre
     (por su id) y se reparten en partes con "adivina antes", actividades nuevas y una regla del sabio. ── */
  const dopa = ring(150, 140, 40, 'r');
  // Dopamina: cadena en r0, OH en r3 (para) y r4 (meta). RDKit lo revisa en tools/molecule-test.cjs.
  const DOPAMINE = { atoms: [...dopa.atoms, A('o1', 'O', 105, 62), A('o2', 'O', 60, 140), A('ca', 'C', 235, 115, 0, { hide: true }), A('cb', 'C', 285, 140, 0, { hide: true }), A('n', 'N', 335, 115)],
    bonds: [...dopa.bonds, B('r4', 'o1'), B('r3', 'o2'), B('r0', 'ca'), B('ca', 'cb'), B('cb', 'n')] };
  const TRIMETHYL = { atoms: [A('n', 'N', 200, 130), A('c1', 'C', 140, 165), A('c2', 'C', 260, 165), A('c3', 'C', 200, 60)], bonds: [B('n', 'c1'), B('n', 'c2'), B('n', 'c3')] };
  const NMEANILINE = { atoms: [...ANILINE.atoms, A('me', 'C', 300, 115)], bonds: [...ANILINE.bonds, B('n', 'me')] };
  const restructure = (mId, hook, parts) => {
    const m = mission(mId), pool = [...(m.stages.practice || [])], blocks = [...(m.stages.explain || [])];
    const take = (list, id) => { const i = list.findIndex(x => x.id === id); if (i < 0) throw new Error(`${mId}: no existe ${id}`); return list.splice(i, 1)[0]; };
    m.stages.hook = hook;
    m.parts = parts.map(p => ({ ...p, explain: p.explain.map(id => take(blocks, id)), practice: p.practice.map(x => (typeof x === 'string' ? take(pool, x) : x)),
      ...(p.worked ? { worked: m.stages.worked } : {}) }));
    if (blocks.length || pool.length) throw new Error(`${mId}: quedaron sin parte ${[...blocks, ...pool].map(x => x.id)}`);
    m.stages.explain = []; m.stages.practice = []; delete m.stages.worked;
    m.minutes = Math.max(m.minutes, 22);
  };
  const rl = (title, concept, steps) => ({ title, concept, steps });

  restructure('m1', { title: 'Tu cerebro funciona con aminas', scene: DOPAMINE, smiles: 'NCCc1ccc(O)c(O)c1',
      sage: 'Aprendiz… esta molécula está ahora mismo en tu cerebro.',
      text: 'La **dopamina** es una amina: un NH₂ en la punta de una cadena. Ese N tiene un **par libre** que, a pH 7,4, atrapa un H⁺: casi toda la dopamina de tu cuerpo está como ion amonio. Hoy aprendes qué es una amina, cómo se clasifica y por qué ese par libre lo decide todo.' }, [
    { id: 'r1', intro: 'Parte 1: **qué es una amina y cómo se clasifica**.', worked: false,
      pretest: q('m1-pre1', 'Para decir si una amina es 1°, 2° o 3°, ¿qué crees que se mira?', [{ text: 'Cuántos carbonos están unidos al N', correct: true }, { text: 'Qué tipo de carbono lleva el N, como en los alcoholes', misconception: 'carbon-rule' }, { text: 'Cuántos carbonos tiene la molécula', note: 'El tamaño no importa: solo lo que toca al N.' }],
        { explain: 'Se cuentan los grupos de carbono unidos directamente al N.', slide: 2, concept: 'am.clasificacion' }),
      explain: ['b1'],
      practice: ['m1-p1',
        classify('m1-cl1', 'Clasifica cada amina.', [['p', 'Primaria (1°)'], ['s', 'Secundaria (2°)'], ['t', 'Terciaria (3°)'], ['q', 'Sal cuaternaria']],
          [['a', 'CH₃CH₂–NH₂', 'p'], ['b', '(CH₃)₂NH', 's'], ['c', '(CH₃)₃N', 't'], ['d', '(CH₃)₄N⁺ Cl⁻', 'q'], ['e', '(CH₃)₃C–NH₂', 'p'], ['f', 'C₆H₅–NH–CH₃', 's']],
          { explain: 'Cuenta los carbonos unidos al N: 1 → 1°, 2 → 2°, 3 → 3°, 4 → sal cuaternaria. La terc-butilamina es 1°: el N toca un solo carbono.', slide: 2, hint: 'No mires el carbono: mira el N y cuenta quién lo toca.', concept: 'am.clasificacion', misconception: 'count-groups' }),
        pick('m1-pk1', 'En la anfetamina, toca lo que debes mirar para clasificarla.', [[{ t: 'C₆H₅–CH₂–' }, { t: 'CH(CH₃)', target: 'c' }, { t: '–' }, { t: 'NH₂', target: 'n' }]],
          { c: { label: 'El carbono que lleva el N', misconception: 'carbon-rule' }, n: { label: 'El nitrógeno' } }, 'n',
          { explain: 'Se mira el N: tiene un solo grupo de carbono. La anfetamina es una amina primaria, aunque ese carbono sea secundario.', slide: 2, captions: ['Anfetamina'], hint: '¿Clasificas mirando el carbono o el nitrógeno?', concept: 'am.clasificacion' })],
      rule: rl('Regla para clasificar', 'am.clasificacion', ['Encuentra el **N**.', 'Cuenta los **carbonos unidos directamente** al N (los H no cuentan).', '1 → **1°** · 2 → **2°** · 3 → **3°** · 4 (con carga +) → **sal cuaternaria**.']) },
    { id: 'r2', intro: 'Parte 2: **el par libre lo hace todo**. Base o nucleófilo: depende de a quién ataca.', worked: true,
      pretest: q('m1-pre2', 'Mezclas metilamina con HCl. ¿Qué crees que pasa?', [{ text: 'El N atrapa el H⁺ y se forma una sal', correct: true }, { text: 'El N se une al Cl', misconception: 'n-binds-cl' }, { text: 'No pasa nada', note: 'El par libre del N reacciona con el H⁺ del HCl.' }],
        { explain: 'El par libre atrapa el H⁺: CH₃NH₃⁺ Cl⁻.', slide: 5, concept: 'am.par-libre' }),
      explain: ['b2'],
      practice: ['m1-p2', 'm1-a1', 'm1-b1'],
      rule: rl('Regla del par libre', 'am.par-libre', ['El par libre del N ataca lo que tenga **carga + o δ+**.', 'Si atrapa un **H⁺** → actúa como **base** (sal de amonio).', 'Si ataca un **carbono** δ+ → actúa como **nucleófilo** (alquilación, acilación).']) },
    { id: 'r3', intro: 'Parte 3: **la forma del nitrógeno**. Una pirámide que se da vuelta como un paraguas.', worked: false,
      pretest: q('m1-pre3', 'La trimetilamina tiene 3 grupos en el N. ¿Crees que la molécula es plana?', [{ text: 'No: es una pirámide baja', correct: true }, { text: 'Sí: tres grupos se ordenan en un triángulo plano', misconception: 'flat-n' }],
        { explain: 'El par libre empuja los enlaces hacia abajo: pirámide trigonal de unos 108°.', slide: 11, concept: 'am.geometria' }),
      explain: ['b3'],
      practice: ['m1-p3',
        match('m1-mt1', 'Une cada nitrógeno con su forma.', [['N de una amina, R₃N', 'sp³, piramidal, unos 108°'], ['N del ion amonio, R₄N⁺', 'sp³, tetraédrico, 109,5°'], ['N de la piridina', 'sp², en un anillo plano, unos 120°']],
          { explain: 'Con par libre el N es piramidal; sin par (4 enlaces) es tetraédrico; en la piridina es sp² y plano.', slide: 11, hint: 'Cuenta enlaces y pares libres de cada N.', concept: 'am.geometria' }),
        write('m1-w1', 'Explícalo con tus palabras: ¿por qué no se pueden separar los dos enantiómeros de una amina con tres grupos distintos en el N?',
          'Porque el N es piramidal y la pirámide se invierte muy rápido, como un paraguas que se da vuelta con el viento (inversión piramidal). Así, un enantiómero se convierte en el otro todo el tiempo y queda una mezcla racémica que no se puede separar.',
          ['Dije que el N es piramidal (sp³, con el par libre)', 'Dije que la pirámide se invierte muy rápido (inversión piramidal)', 'Concluí que los enantiómeros se interconvierten y no se separan'],
          { explain: 'La inversión piramidal interconvierte los enantiómeros.', slide: 11, hint: 'Piensa en el paraguas.', concept: 'am.geometria',
            keywords: [{ label: 'Pirámide', any: ['piramid', 'sp3', 'sp³'] }, { label: 'Se invierte', any: ['invier', 'da vuelta', 'voltea', 'paraguas'] }, { label: 'Se interconvierten', any: ['interconvier', 'convierte', 'racemic', 'mezcla'] }] })],
      rule: rl('Regla de la forma', 'am.geometria', ['3 enlaces + 1 par = 4 zonas → **sp³**.', 'Con los átomos solos: **pirámide trigonal**, unos 108°.', 'La pirámide se **invierte** muy rápido: los enantiómeros no se separan.']) }
  ]);

  restructure('m2', { title: 'La etiqueta del frasco', scene: AMINOPHENOL, smiles: 'Nc1ccc(O)cc1',
      sage: 'Aprendiz… en el laboratorio el frasco dice "4-aminofenol". ¿Por qué no "4-hidroxianilina"?',
      text: 'Esta molécula (la base del paracetamol) tiene un –OH y un –NH₂. El nombre lo decide la **prioridad**: el –OH manda (fenol) y el –NH₂ pasa a ser el prefijo **amino-**. Hoy aprendes a nombrar aminas para no equivocarte en la prueba ni con un frasco real.' }, [
    { id: 'r1', intro: 'Parte 1: **alquilaminas, alcanaminas y sales**.', worked: true,
      pretest: q('m2-pre1', '¿Cómo crees que se llama CH₃–NH–CH₃?', [{ text: 'Dimetilamina', correct: true }, { text: 'Metilmetilamina', misconception: 'forgot-di' }, { text: 'Etilamina', note: 'Tiene dos grupos metilo separados por el N, no un etilo.' }],
        { explain: 'Dos metilos iguales → di: dimetilamina.', slide: 8, concept: 'am.nombres' }),
      explain: ['b21', 'b24', 'b25'],
      practice: ['m2-p1', 'm2-p2',
        { id: 'm2-fx1', type: 'spot', source: SRC, concept: 'am.nombres', slide: 8,
          prompt: 'Un aprendiz nombró (CH₃)₂N–CH₂CH₂CH₃. Revisa su hoja: ¿en qué paso se equivocó?',
          steps: ['Cadena principal: el propilo (el grupo más complejo) → propan-1-amina', 'Los dos metilos están en el N', 'Escribe: 2-dimetilpropan-1-amina'], wrong: 2,
          stepNotes: { 0: 'Bien: el grupo más complejo da la cadena principal.', 1: 'Bien: los metilos están unidos al N.' },
          fix: { question: '¿Cómo debió escribirlo?', options: [{ text: 'N,N-dimetilpropan-1-amina', correct: true }, { text: '1,1-dimetilpropanamina', note: 'Los números son para carbonos de la cadena; estos grupos están en el N.' }, { text: 'Trimetilpropilamina', note: 'Hay dos metilos, no tres.' }] },
          explain: 'Los grupos sobre el N llevan el localizador N: N,N-dimetilpropan-1-amina.', hint: '¿Dónde están los metilos: en un carbono o en el N?', misconception: 'n-locant' }],
      rule: rl('Regla del nombre (alquilaminas)', 'am.nombres', ['¿Grupos simples? → **alquilamina** en orden alfabético, con di-/tri-.', '¿Un grupo complejo? → ese da la cadena: **alcan-#-amina**.', 'Los grupos en el N llevan **N-** (N,N-dimetil…). Con 4 grupos: sal de **-amonio**.']) },
    { id: 'r2', intro: 'Parte 2: **anilinas y quién manda**.', worked: false,
      pretest: q('m2-pre2', 'Una molécula tiene –OH y –NH₂. ¿Cuál crees que da el sufijo del nombre?', [{ text: 'El –OH', correct: true }, { text: 'El –NH₂', misconception: 'amine-priority' }],
        { explain: 'El alcohol tiene más prioridad: el NH₂ queda como amino-.', slide: 6, concept: 'am.nombres-aril' }),
      explain: ['b22', 'b23'],
      practice: ['m2-p3', 'm2-p4',
        { id: 'm2-b1', type: 'build', source: SRC, concept: 'am.nombres-aril', slide: 7, smiles: 'CNc1ccccc1',
          prompt: 'Dibuja la **N-metilanilina**. Ya tienes la anilina: agrégale lo que falta.',
          start: ANILINE, target: NMEANILINE,
          near: [{ graph: { atoms: [...ANILINE.atoms.map(a => a.id === 'r2' ? { ...a, hide: false } : a), A('me', 'C', 175, 230)], bonds: [...ANILINE.bonds, B('r2', 'me')] }, note: 'Ese CH₃ quedó en el anillo (sería una metilanilina). La "N-" dice que va en el nitrógeno.' }],
          explain: 'N-metil significa que el CH₃ está en el N: C₆H₅–NH–CH₃.', hint: 'Toca el N para seleccionarlo y después un espacio vacío al lado.' },
        classify('m2-cl1', '¿El NH₂ va como sufijo (-amina / anilina) o como prefijo (amino-)?', [['suf', 'Sufijo: -amina o anilina'], ['pre', 'Prefijo: amino-']],
          [['a', 'H₂N–CH₂CH₂–OH', 'pre'], ['b', 'CH₃CH₂CH₂–NH₂', 'suf'], ['c', 'H₂N–C₆H₄–COOH', 'pre'], ['d', 'Cl–C₆H₄–NH₂', 'suf']],
          { explain: 'Si hay –OH o –COOH, ellos mandan y el NH₂ es amino-. Un halógeno no manda: el nombre sigue siendo anilina o amina.', slide: 6, hint: 'Busca si hay un –OH o un –COOH.', concept: 'am.nombres-aril', misconception: 'amine-priority' })],
      rule: rl('Regla de quién manda', 'am.nombres-aril', ['Prioridad: **ácido > alcohol > amina**.', 'Si manda otro grupo, el NH₂ es **amino-**.', 'En el benceno: derivado de la **anilina**, el C del NH₂ es el 1.']) }
  ]);

  const EXTRACT = { id: 'rc-extraccion', mission: 'm3', concept: 'am.sales', slide: 16, title: 'Poción de extracción', base: 'Amina + compuesto neutro, en éter',
    reagents: '1) HCl acuoso · 2) separar capas · 3) NaOH a la capa acuosa · 4) extraer con éter', condition: 'Embudo de decantación', result: 'La amina sola, de vuelta en éter',
    note: 'Con HCl la amina pasa al agua como sal; el compuesto neutro se queda en el éter. Con NaOH vuelve a ser neutra y regresa al éter.' };
  cls.recipes.push(EXTRACT);
  restructure('m3', { title: 'El limón y el pescado', scene: TRIMETHYL, smiles: 'CN(C)C',
      sage: 'Aprendiz… ¿por qué al pescado se le echa limón?',
      text: 'El olor a pescado viene de aminas pequeñas como la **trimetilamina**, que es volátil (se evapora fácil). El ácido del limón la **protona**: se vuelve una sal, iónica y nada volátil. Ya no llega a tu nariz. Hoy: por qué unas aminas hierven más que otras, cuáles se disuelven en agua y cómo una sal sirve para separar y para vender fármacos.' }, [
    { id: 'r1', intro: 'Parte 1: **puentes de H: ebullición y solubilidad**.', worked: false,
      pretest: q('m3-pre1', 'Propilamina y trimetilamina tienen la misma fórmula (C₃H₉N). ¿Cuál crees que hierve más alto?', [{ text: 'La propilamina', correct: true }, { text: 'La trimetilamina', misconception: 'tertiary-donor' }, { text: 'Igual: misma fórmula', note: 'La fórmula no basta: importan los N–H.' }],
        { explain: 'La propilamina tiene N–H y forma puentes de H: unos 48 °C frente a 3 °C.', slide: 12, concept: 'am.fisicas' }),
      explain: ['b31', 'b32', 'b33'],
      practice: ['m3-p1', 'm3-p2',
        q('m3-tw1', 'Casos gemelos: misma fórmula, C₃H₉N. ¿Por qué A hierve a unos 48 °C y B a unos 3 °C?', [{ text: 'A tiene N–H y forma puentes de H entre sus moléculas; B no', correct: true }, { text: 'B es más pesada', note: 'Tienen la misma fórmula: pesan lo mismo.' }, { text: 'A es terciaria', misconception: 'tertiary-donor' }],
          { figures: [{ scene: PROPAMINE, caption: 'A: propilamina (1°)' }, { scene: TRIMETHYL, caption: 'B: trimetilamina (3°)' }],
            explain: 'Sin N–H, la trimetilamina no dona puentes de H: sus moléculas se separan con poca energía.', slide: 12, hint: 'Busca los H unidos al N.', concept: 'am.fisicas' })],
      rule: rl('Regla de los puentes de H', 'am.fisicas', ['Más **N–H** → más puentes de H → **mayor ebullición** (1° > 2° > 3°).', 'Hasta unos **5 carbonos**, solubles en agua; con más, poco solubles.', 'Una 3° acepta puentes de H del agua, pero no dona.']) },
    { id: 'r2', intro: 'Parte 2: **sales y extracción**. El truco del HCl.', worked: true,
      pretest: q('m3-pre2', 'Una amina está disuelta en éter y le agregas HCl acuoso. ¿A dónde crees que se va?', [{ text: 'Al agua, como sal', correct: true }, { text: 'Se queda en el éter', misconception: 'salt-organic' }],
        { explain: 'Protonada es un ion: se va a la capa acuosa.', slide: 16, concept: 'am.sales' }),
      explain: ['b34'],
      practice: ['m3-p3',
        { id: 'm3-rc1', type: 'recipe', source: SRC, concept: 'am.sales', slide: 16,
          prompt: 'El caldero pide **separar la ciclohexilamina del naftaleno** (los dos en éter). Elige los pasos en orden.', base: 'Ciclohexilamina + naftaleno en éter', target: 'la amina sola',
          ingredients: [{ id: 'hcl', label: 'HCl acuoso' }, { id: 'sep', label: 'Separar la capa acuosa' }, { id: 'naoh', label: 'NaOH a la capa acuosa' }, { id: 'eter', label: 'Extraer con éter y evaporar' }, { id: 'calor', label: 'Calentar fuerte' }, { id: 'nacl', label: 'NaCl' }],
          answer: ['hcl', 'sep', 'naoh', 'eter'],
          notes: { calor: 'Calentar no separa: los dos siguen juntos en el éter.', nacl: 'La sal común no protona la amina: no la cambia de capa.' },
          orderNote: 'Primero hay que volver iónica a la amina (HCl), separarla, devolverla a neutra (NaOH) y recién ahí sacarla con éter.',
          explain: 'HCl → la amina pasa al agua como sal; separas; NaOH → vuelve a ser neutra; éter → la recuperas sola.', hint: 'Piensa: ¿qué la vuelve soluble en agua y qué la devuelve al éter?' },
        { id: 'm3-fx1', type: 'spot', source: SRC, concept: 'am.sales', slide: 16,
          prompt: 'Un aprendiz quiso pasar una amina del éter al agua. Revisa su hoja: ¿en qué paso se equivocó?',
          steps: ['Tiene la amina disuelta en éter', 'Agrega NaOH acuoso y agita', 'Separa la capa acuosa', 'Espera encontrar la amina en el agua'], wrong: 1,
          stepNotes: { 0: 'Bien: así parte.', 2: 'Separar está bien; el problema es el reactivo.', 3: 'Esa expectativa viene del error anterior.' },
          fix: { question: '¿Qué debió agregar?', options: [{ text: 'HCl acuoso', correct: true }, { text: 'Más éter', note: 'Más éter no cambia nada.' }, { text: 'Agua pura', note: 'Una amina grande neutra casi no se disuelve en agua.' }] },
          explain: 'Con NaOH la amina sigue neutra y se queda en el éter. Se necesita un ácido (HCl) para volverla sal.', hint: 'Para ir al agua, la amina tiene que tener carga.', misconception: 'salt-organic' }],
      recipe: EXTRACT }
  ]);

  restructure('m8', { title: 'Un frasco sin etiqueta',
      sage: 'Aprendiz… en el laboratorio apareció un frasco sin etiqueta que huele a pescado. ¿Es una amina? ¿De qué tipo?',
      text: 'Tienes tres detectives: el **espectro de masas** dice si hay un número impar de N (regla del nitrógeno), el **IR** cuenta los enlaces N–H (dos picos, uno o ninguno) y la **RMN** muestra los H cerca del N. Con los tres, el frasco ya no tiene secretos.' }, [
    { id: 'r1', intro: 'Parte 1: **el IR cuenta los N–H**.', worked: false,
      pretest: q('m8-pre1', 'Una amina terciaria, ¿cuántos picos N–H crees que muestra en el IR?', [{ text: 'Ninguno', correct: true }, { text: 'Uno', misconception: 'ir-peaks' }, { text: 'Tres, uno por grupo', note: 'Los picos son de enlaces N–H, no de grupos de carbono.' }],
        { explain: 'Sin N–H no hay estiramiento N–H.', slide: 44, concept: 'am.espectro' }),
      explain: ['b81'],
      practice: ['m8-p1',
        q('m8-q1', 'Un compuesto C₄H₁₁N muestra **un** pico cerca de 3350 cm⁻¹. ¿Qué tipo de amina es?', [{ text: 'Secundaria', correct: true }, { text: 'Primaria', misconception: 'ir-peaks' }, { text: 'Terciaria', note: 'Una terciaria no tiene N–H: no daría ningún pico.' }],
          { explain: 'Un pico N–H = un solo enlace N–H = amina 2°, por ejemplo la dietilamina.', slide: 44, hint: 'Dos picos 1°, uno 2°, ninguno 3°.', concept: 'am.espectro' }),
        { id: 'm8-fx1', type: 'spot', source: SRC, concept: 'am.espectro', slide: 44,
          prompt: 'Un aprendiz analizó un compuesto sin picos entre 3350 y 3500 cm⁻¹. Revisa su hoja: ¿en qué paso se equivocó?',
          steps: ['El espectro de masas da M⁺ = 59: tiene un N', 'No hay picos N–H en el IR', 'Concluye: no es una amina', 'Descarta la trimetilamina'], wrong: 2,
          stepNotes: { 0: 'Bien: masa impar, número impar de N.', 1: 'Bien leído.', 3: 'Esa conclusión viene del error anterior.' },
          fix: { question: '¿Qué debió concluir?', options: [{ text: 'Puede ser una amina terciaria, que no tiene N–H', correct: true }, { text: 'Es un alcohol', note: 'Un alcohol daría una banda O–H ancha y fuerte.' }, { text: 'El IR está malo', note: 'El IR está bien: las 3° no tienen N–H.' }] },
          explain: 'Sin picos N–H puede ser una amina 3°. Para confirmarlo, se trata con HCl: aparece el N–H⁺ entre 2200 y 3000 cm⁻¹.', hint: '¿Qué amina no tiene N–H?', misconception: 'ir-peaks' }],
      rule: rl('Regla del IR', 'am.espectro', ['3350–3500 cm⁻¹: **2 picos → 1°**, **1 pico → 2°**, **ninguno → 3°**.', 'Las N–H son más finas y débiles que la banda ancha O–H.', 'Para confirmar una 3°: con HCl aparece N–H⁺ (2200–3000 cm⁻¹).']) },
    { id: 'r2', intro: 'Parte 2: **masas y RMN**: la regla del nitrógeno y los H cerca del N.', worked: true,
      pretest: q('m8-pre2', 'Un compuesto tiene ion molecular de masa 73. ¿Qué crees que sugiere?', [{ text: 'Que tiene un número impar de N', correct: true }, { text: 'Que no tiene N', misconception: 'n-rule' }],
        { explain: 'Regla del nitrógeno: masa impar → número impar de N.', slide: 47, concept: 'am.espectro' }),
      explain: ['b82', 'b83'],
      practice: ['m8-p2', 'm8-p3',
        order('m8-o1', 'Ordena los pasos para identificar el frasco sin etiqueta.', [['ms', 'Masas: ¿M⁺ impar? → tiene N'], ['ir', 'IR: cuenta los picos N–H → 1°, 2° o 3°'], ['rmn', 'RMN: H α al N entre 2 y 3 ppm → confirma la estructura']], ['ms', 'ir', 'rmn'],
          { direction: 'Del primero al último.', explain: 'Primero si hay N (masas), luego el tipo de amina (IR) y al final la estructura exacta (RMN).', slide: 45, hint: 'De lo más general (¿tiene N?) a lo más fino (¿dónde están los H?).', concept: 'am.espectro' })],
      rule: rl('Regla de los tres detectives', 'am.espectro', ['**Masas**: M⁺ impar → número impar de N.', '**IR**: picos N–H → 1°, 2° o 3°.', '**RMN ¹H**: H α al N en 2–3 ppm; el N–H, señal ancha.']) }
  ]);
  mission('m8').stages.transfer.push(write('m8-w1', 'Estilo prueba: ¿cómo distingues propilamina de trimetilamina (las dos C₃H₉N) con un IR? Explícalo.',
    'La propilamina es una amina primaria: tiene dos enlaces N–H y muestra dos picos entre 3350 y 3500 cm⁻¹. La trimetilamina es terciaria: no tiene N–H, así que no muestra ningún pico en esa zona. Las dos tienen M⁺ = 59 (impar, un N), así que el espectro de masas no las distingue.',
    ['Dije que la propilamina (1°) muestra dos picos N–H', 'Dije que la trimetilamina (3°) no muestra ninguno', 'Mencioné la zona 3350–3500 cm⁻¹ o que masas no las distingue'],
    { explain: 'Dos picos contra ninguno: el IR las separa.', slide: 44, concept: 'am.espectro',
      keywords: [{ label: 'Dos picos', any: ['dos picos', '2 picos', 'dos señales'] }, { label: 'Ninguno en la 3°', any: ['ningun', 'no tiene n-h', 'no tiene n–h', 'sin n-h', 'sin n–h', 'sin picos'] }, { label: 'Zona N–H', any: ['3350', '3500', '3400'] }] }));

})();
