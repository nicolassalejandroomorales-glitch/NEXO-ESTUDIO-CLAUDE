(function (root) {
  'use strict';
  const skills = [
    { id: 'pair', title: 'Par libre', short: 'La base de todo', prerequisites: [], lesson: 'Una amina neutra tiene un par libre en el nitrógeno. Para aceptar H⁺, ese par forma el nuevo enlace N–H. Un nitrógeno de amonio cuaternario tiene cuatro enlaces y carga positiva: no conserva el par libre de la amina.', steps: ['Localiza el nitrógeno.', 'Cuenta enlaces y comprueba la carga.', 'Identifica si hay un par que pueda formar un enlace nuevo.'] },
    { id: 'resonance', title: 'Resonancia y basicidad', short: 'Dónde está disponible el par', prerequisites: ['pair'], lesson: 'En la anilina, el N está unido directamente al anillo y su par puede conjugarse con él. En la bencilamina, un CH₂ interrumpe esa conjugación. En una amida, el par del N se deslocaliza hacia el carbonilo. Compara esa disponibilidad antes de aplicar reglas sobre grupos alquilo.', steps: ['Busca un sistema π junto al N.', 'Comprueba si hay conjugación continua.', 'Relaciona la deslocalización con la disponibilidad para protonarse.'] },
    { id: 'pka', title: 'Leer pKa de BH⁺', short: 'Comparar con datos', prerequisites: ['pair'], lesson: 'Los valores de este bloque son pKa de los ácidos conjugados BH⁺, en las mismas condiciones. Un BH⁺ con pKa mayor es un ácido más débil: su base B es más fuerte. No confundas ese valor con el pKb de la propia base.', steps: ['Identifica a qué especie pertenece el dato.', 'Comprueba que las condiciones sean comparables.', 'Mayor pKa de BH⁺ → mayor basicidad de B.'] },
    { id: 'protonation', title: 'Protonación', short: 'Usar el par libre', prerequisites: ['pair'], lesson: 'El par libre de la amina ataca al protón del ácido; los electrones del enlace H–Cl quedan en Cl. El N incorpora H y queda con carga positiva. Se forma una sal de amonio: no se crea un enlace C–N nuevo.', steps: ['Flecha del par libre del N hacia H.', 'Flecha del enlace H–Cl hacia Cl.', 'Comprueba el nuevo enlace N–H y la carga + en N.'] },
    { id: 'alkylation', title: 'Alquilación de aminas', short: 'Seguir cada sustitución', prerequisites: ['pair', 'protonation'], lesson: 'Con CH₃I, el par del N ataca al carbono del metilo y el enlace C–I se rompe hacia I⁻. La alquilación puede continuar. Bajo metilación exhaustiva se obtiene un amonio cuaternario, con cuatro grupos carbonados unidos a N. El contraión es I⁻.', steps: ['Conserva los grupos carbonados originales.', 'Añade metilos hasta completar cuatro enlaces C–N.', 'Escribe la carga positiva en N y el yoduro como contraión.'] },
    { id: 'hofmann', title: 'Eliminación de Hofmann', short: 'De amonio a alqueno', prerequisites: ['alkylation'], lesson: 'Tras metilación exhaustiva, Ag₂O/H₂O permite obtener el hidróxido de amonio cuaternario. Al calentar, una eliminación E2 puede formar un alqueno, una amina terciaria y agua. En los sustratos acíclicos simples de este bloque se favorece el alqueno menos sustituido. Es una tendencia contextual, no una regla universal para cualquier sustrato.', steps: ['Identifica el carbono α unido al N⁺.', 'Localiza carbonos β con hidrógenos.', 'Sigue Hβ → base; Cβ–H → Cα=Cβ; Cα–N → N.', 'Compara los alquenos posibles y justifica el mayoritario.'] }
  ];
  const sourceIds = ['course-guide', 'openstax'];
  const activities = [];
  function add(id, skill, family, level, title, prompt, diagram, resultOptions, correct, reasons, correctReason, explain, hint, errorSkill) {
    activities.push({ id, version: 1, skill, family, level, title, prompt, diagram, sourceIds,
      fields: [
        { key: 'answer', label: 'Tu decisión', options: resultOptions.map((label, i) => ({ id: String(i), label })), correct: String(correct), feedback: explain, errorSkill: errorSkill || skill },
        { key: 'reason', label: 'Elige el fundamento', options: reasons.map((label, i) => ({ id: String(i), label })), correct: String(correctReason), feedback: explain, errorSkill: errorSkill || skill }
      ], hint, explanation: explain,
      rubric: ['La decisión química coincide con el criterio.', 'El fundamento seleccionado explica esa decisión.'] });
  }
  add('pair-1', 'pair', 'neutral', 1, 'El punto de partida', '¿Qué especie puede aceptar H⁺ usando un par libre del nitrógeno?', ['CH₃–NH₂', '(CH₃)₄N⁺'], ['CH₃NH₂', '(CH₃)₄N⁺', 'Ambas de la misma forma'], 0,
    ['La metilamina neutra tiene un par libre en N.', 'El nitrógeno positivo siempre atrae y acepta otro protón.', 'El tamaño determina si puede aceptar H⁺.'], 0,
    'CH₃NH₂ tiene tres enlaces en N y un par libre. El amonio cuaternario tiene cuatro enlaces y carga positiva; no posee ese par disponible.', 'Cuenta los enlaces del N y revisa la carga.');
  add('pair-2', 'pair', 'tertiary', 2, 'Tres enlaces no son cuatro', 'Una trimetilamina neutra reacciona con HCl. ¿Qué puede hacer el N?', ['(CH₃)₃N + H–Cl'], ['No acepta H porque no tiene enlaces N–H.', 'Usa su par para formar un enlace N–H.', 'Rompe primero un enlace C–N.'], 1,
    ['Necesita tener previamente un N–H para actuar como base.', 'Los tres grupos metilo ya hacen cuaternario al N.', 'Tres enlaces y un par libre permiten aceptar H⁺.'], 2,
    'Una amina terciaria neutra todavía posee un par libre. Al protonarse forma (CH₃)₃NH⁺; no hace falta que tuviera un enlace N–H antes.', 'Distingue amina terciaria neutra de amonio cuaternario.');
  add('pair-3', 'pair', 'charged', 2, 'Después de protonar', 'Tras formar etilamonio, ¿qué cambió en el nitrógeno?', ['CH₃CH₂–NH₂ → CH₃CH₂–NH₃⁺'], ['Perdió un carbono.', 'Quedó con cuatro enlaces y carga positiva.', 'Conserva el mismo par libre además de los cuatro enlaces.'], 1,
    ['El par del N se convirtió en el nuevo enlace N–H.', 'El protón añadió también un electrón libre.', 'El N expulsó un H antes de unirse al nuevo H.'], 0,
    'El par que estaba libre participa ahora en el nuevo enlace N–H. El ion etilamonio tiene cuatro enlaces en N y carga +.', 'Piensa qué electrones forman el enlace nuevo.');
  add('pair-4', 'pair', 'lonepair-transfer', 3, 'Un caso distinto', 'El N de (C₂H₅)₃N es neutro y tiene tres enlaces simples. ¿Puede actuar como base de Lewis frente a H⁺?', ['(C₂H₅)₃N'], ['Sí.', 'No, porque no contiene N–H.', 'Sólo si pierde primero un grupo etilo.'], 0,
    ['Es básico porque cualquier molécula grande lo es.', 'El N neutro dispone de un par donador.', 'Cuatro enlaces C–N dejan un par libre.'], 1,
    'La trietilamina neutra posee tres enlaces C–N y un par libre donador. No tener N–H no impide aceptar un protón.', 'Comprueba enlaces y carga; no cuentes sólo los H.');

  add('res-1', 'resonance', 'aniline', 1, 'Un enlace cambia la comparación', 'En agua y condiciones comparables, ¿cuál de estas bases es más fuerte?', ['C₆H₅–NH₂ · anilina', 'C₆H₅–CH₂–NH₂ · bencilamina'], ['Anilina.', 'Bencilamina.', 'Tienen necesariamente la misma basicidad.'], 1,
    ['El par de la anilina se conjuga con el anillo; el CH₂ lo interrumpe en la bencilamina.', 'Cualquier anillo aromático hace más básica a una amina.', 'Una fórmula con más carbonos siempre es más básica.'], 0,
    'La bencilamina es más básica en esta comparación. En la anilina, la unión directa N–anillo permite deslocalizar el par; en la bencilamina un CH₂ separa ambos sistemas.', 'Busca si el N toca directamente el anillo.');
  add('res-2', 'resonance', 'amide', 2, 'Nitrógeno junto al carbonilo', '¿Cuál es más básica en agua: etilamina o acetamida?', ['CH₃CH₂–NH₂', 'CH₃–C(=O)–NH₂'], ['Acetamida.', 'Son equivalentes porque ambas tienen NH₂.', 'Etilamina.'], 2,
    ['El oxígeno hace que el par del N esté siempre más disponible.', 'En la amida, el par del N se deslocaliza hacia el carbonilo.', 'Todos los grupos NH₂ tienen igual basicidad.'], 1,
    'La etilamina es más básica. En la acetamida, el par del N participa en resonancia con el carbonilo y está mucho menos disponible. Una amida no se trata como una amina alifática.', 'Observa si N está unido directamente a C=O.');
  add('res-3', 'resonance', 'heterocycle', 2, 'Dos nitrógenos aromáticos', 'La piridina tiene un par libre fuera del sistema π; el par del pirrol aporta al sexteto aromático. ¿Cuál es más básica?', ['Piridina · par fuera del sexteto', 'Pirrol · par dentro del sexteto'], ['Piridina.', 'Pirrol.', 'La aromaticidad las hace idénticas.'], 0,
    ['Protonar el par del pirrol no afecta su participación aromática.', 'El par de piridina puede enlazarse a H⁺ sin retirar un par del sexteto.', 'Tener N–H garantiza mayor basicidad.'], 1,
    'La piridina es más básica. Su par libre no forma parte del sexteto; usar el par del pirrol para protonar N compromete su contribución aromática.', 'No basta con que el anillo sea aromático: ubica el par libre.');
  add('res-4', 'resonance', 'spacer', 3, '¿Sigue existiendo conjugación?', 'Se comparan anilina y 2-feniletilamina en agua. ¿Cuál es más básica?', ['C₆H₅–NH₂', 'C₆H₅–CH₂–CH₂–NH₂'], ['Anilina.', '2-feniletilamina.', 'No se puede reconocer ninguna diferencia estructural.'], 1,
    ['El grupo fenilo vuelve igualmente deslocalizados ambos pares.', 'Los carbonos saturados interrumpen la conjugación del par con el fenilo.', 'La base más fuerte siempre tiene menos enlaces simples.'], 1,
    'En esta comparación, la 2-feniletilamina es más básica: su N se comporta como amina alifática; los CH₂ interrumpen la conjugación directa con el anillo.', 'Sigue el camino entre el N y el anillo: ¿todos los átomos permiten conjugación?');

  const pkaData = [
    ['pka-1', 'numeric-a', 1, 'Dos datos, una decisión', 'A', 5, 'B', 10, 1],
    ['pka-2', 'numeric-b', 2, 'El dato pertenece a BH⁺', 'C', 11, 'D', 6, 0],
    ['pka-3', 'numeric-c', 2, 'Comparar sin memorizar nombres', 'E', 8.5, 'F', 4.5, 0],
    ['pka-4', 'numeric-d', 3, 'Una pareja nueva', 'G', 3, 'H', 9, 1]
  ];
  for (const [id, family, level, title, a, av, b, bv, correct] of pkaData) {
    add(id, 'pka', family, level, title, `Los pKa de los ácidos conjugados de ${a} y ${b}, medidos en el mismo disolvente y a la misma temperatura, son ${av} y ${bv}. ¿Qué base es más fuerte?`, [`pKa(${a}H⁺) = ${av}`, `pKa(${b}H⁺) = ${bv}`], [`Base ${a}.`, `Base ${b}.`, 'El menor pKa de BH⁺ siempre indica la base más fuerte.'], correct,
      ['Mayor pKa de BH⁺ significa un ácido conjugado más débil y una base B más fuerte.', 'El pKa indicado es lo mismo que el pKb de B.', 'Una base es más fuerte cuanto más fuerte es su ácido conjugado.'], 0,
      `La base ${correct === 0 ? a : b} es más fuerte: su ácido conjugado tiene el pKa mayor. Esta comparación usa datos en condiciones iguales; no se están comparando pKb.`, '¿El número corresponde a B o a su ácido conjugado BH⁺?');
  }

  const protonData = [
    ['prot-1', 'primary', 1, 'CH₃NH₂', 'CH₃NH₃⁺ Cl⁻', 'CH₃NH⁻ + H₂', '(CH₃)₂NH'],
    ['prot-2', 'secondary', 2, '(CH₃)₂NH', '(CH₃)₂NH₂⁺ Cl⁻', '(CH₃)₂N⁻ + H₂', '(CH₃)₃N'],
    ['prot-3', 'tertiary', 2, '(C₂H₅)₃N', '(C₂H₅)₃NH⁺ Cl⁻', '(C₂H₅)₃NH neutro', '(C₂H₅)₄N⁺ Cl⁻'],
    ['prot-4', 'benzyl', 3, 'C₆H₅CH₂NH₂', 'C₆H₅CH₂NH₃⁺ Cl⁻', 'C₆H₅CH₂NH⁻', 'C₆H₅CH₂NHCH₃']
  ];
  for (const [id, family, level, reagent, salt, wrong, carbon] of protonData) {
    const correctIndex = level % 3;
    const products = [wrong, carbon]; products.splice(correctIndex, 0, salt);
    add(id, 'protonation', family, level, '¿Dónde se une el protón?', `Predice el producto ácido–base de ${reagent} con HCl acuoso.`, [`${reagent} + H–Cl`], products, correctIndex,
      ['El ácido aporta un nuevo grupo metilo.', 'El par del N forma un enlace N–H y el enlace H–Cl se rompe hacia Cl.', 'El nitrógeno debe perder un electrón para protonarse.'], 1,
      `Se forma ${salt}. El N usa su par para enlazarse al H; Cl queda como contraión. El esqueleto carbonado se conserva.`, 'Conserva los grupos carbonados y añade H al N.');
  }

  const alkylData = [
    ['alk-1', 'primary', 1, 'CH₃CH₂NH₂', '[CH₃CH₂N(CH₃)₃]⁺ I⁻', 'CH₃CH₂NHCH₃, siempre como producto final', '[CH₃CH₂NH₃]⁺ I⁻'],
    ['alk-2', 'secondary', 2, '(CH₃CH₂)₂NH', '[(CH₃CH₂)₂N(CH₃)₂]⁺ I⁻', '(CH₃CH₂)₂NCH₃, sin posibilidad de seguir reaccionando', '[(CH₃CH₂)₂NH₂]⁺ I⁻'],
    ['alk-3', 'tertiary', 2, '(CH₃CH₂)₃N', '[(CH₃CH₂)₃NCH₃]⁺ I⁻', 'No puede reaccionar porque no tiene N–H', '[(CH₃CH₂)₃NH]⁺ I⁻'],
    ['alk-4', 'ethylmethyl', 3, 'CH₃CH₂NHCH₃', '[CH₃CH₂N(CH₃)₃]⁺ I⁻', 'CH₃CH₂N(CH₃)₂, necesariamente como producto final', '[CH₃CH₂N(CH₃)₄]⁺ I⁻']
  ];
  for (const [id, family, level, reagent, product, wrong, wrong2] of alkylData) {
    add(id, 'alkylation', family, level, 'Sigue hasta la metilación exhaustiva', `Partiendo de ${reagent}, se realiza metilación exhaustiva con CH₃I en exceso hasta obtener el amonio cuaternario. ¿Cuál es ese producto?`, [`${reagent} → CH₃I en exceso`], [wrong, product, wrong2], 1,
      ['Se conservan los grupos originales y se añaden metilos hasta cuatro enlaces C–N.', 'El yodometano sólo dona H⁺ al nitrógeno.', 'Cualquier N con tres carbonos unidos ya es un amonio cuaternario.'], 0,
      `El producto solicitado es ${product}. Se conservan los grupos originales; la secuencia de alquilaciones llega a cuatro grupos carbonados en N, con carga positiva y contraión I⁻.`, 'Cuenta los grupos que ya tiene el N; completa cuatro con metilos.');
  }

  const hofData = [
    ['hof-1', 'butyl', 1, '[CH₃CH₂CH₂CH₂N(CH₃)₃]⁺ OH⁻', 'but-1-eno', 'but-2-eno', 'Sólo hay un carbono β respecto del carbono unido a N: la eliminación forma but-1-eno.'],
    ['hof-2', 'pentan2', 2, '[CH₃CH(N(CH₃)₃)CH₂CH₂CH₃]⁺ OH⁻', 'pent-1-eno', 'pent-2-eno', 'Hay Hβ a ambos lados del carbono α. Son posibles pent-1-eno y pent-2-eno; en este caso simple predomina el alqueno terminal menos sustituido.'],
    ['hof-3', 'hexan2', 2, '[CH₃CH(N(CH₃)₃)CH₂CH₂CH₂CH₃]⁺ OH⁻', 'hex-1-eno', 'hex-2-eno', 'En esta eliminación de Hofmann acíclica simple se favorece hex-1-eno frente a hex-2-eno.'],
    ['hof-4', 'conditions', 3, 'Amina → CH₃I (exceso) → Ag₂O/H₂O → calor', 'Hidróxido de amonio cuaternario.', 'Amina protonada con HCl.', 'La secuencia obtiene el amonio cuaternario y cambia su contraión a OH⁻. Al calentar, la eliminación puede dar alqueno, amina terciaria y agua.']
  ];
  for (const [id, family, level, substrate, correct, wrong, explain] of hofData) {
    const conditions = id === 'hof-4';
    add(id, 'hofmann', family, level, conditions ? 'La función de cada etapa' : 'El carbono β decide', conditions ? '¿Qué especie se prepara inmediatamente antes de la etapa de calentamiento en la secuencia indicada?' : 'Al calentar este hidróxido de amonio cuaternario acíclico, ¿qué alqueno se espera como producto principal?', [substrate], [wrong, 'El producto más sustituido siempre es obligatorio.', correct], 2,
      conditions ? ['Ag₂O/H₂O permite obtener el contraión OH⁻ para la eliminación posterior.', 'Ag₂O añade un grupo metilo al N.', 'El calor protona el nitrógeno.'] : ['Se conserva el N unido al mismo carbono en el alqueno.', 'La eliminación pierde la amina terciaria; en este caso favorece el alqueno menos sustituido.', 'Toda eliminación favorece el alqueno más sustituido sin importar el sustrato.'], conditions ? 0 : 1,
      explain, conditions ? 'Separa metilación, cambio de contraión y calentamiento.' : 'Localiza Cα–N⁺ y los H en los carbonos vecinos.');
  }
  add('res-5','resonance','enamine-course',2,'Amina frente a enamina','Compara la basicidad del N en estos dos compuestos en condiciones comparables. ¿Cuál tiene el par más disponible para captar H⁺?', ['I: (CH₃)₂N–CH(CH₃)₂','II: (CH₃)₂N–C(CH₃)=CH₂'], ['II, la enamina.','I, la amina saturada.','Son idénticas porque el N tiene tres enlaces.'],1,
    ['El par de II se conjuga con el doble enlace vecino; en I no hay esa conjugación.','Un doble enlace siempre aumenta la basicidad del nitrógeno.','El N de II es un amonio cuaternario.'],0,
    'I tiene el par más disponible. En II, el N está junto a C=C y su par participa en conjugación. La pauta del ejercicio 1.a selecciona I.','Sigue el enlace desde N: ¿el siguiente carbono pertenece a un doble enlace?');
  add('res-6','resonance','amide-course',2,'El carbonilo está en el camino','Compara una amina con un grupo –OCH₃ sobre un carbono saturado vecino y una amida cíclica. ¿Cuál se espera más básica en el N?', ['I: N–C(H)(OCH₃), enlace simple','II: N–C(=O), una amida'], ['II: tener oxígeno siempre hace más básico al N.','Ambas: cualquier N con tres enlaces es igual de básico.','I: la amina.'],2,
    ['En II, el par del N se deslocaliza hacia C=O; un O separado por C saturado no produce la misma conjugación.','La carga positiva está dibujada en ambos nitrógenos.','Un grupo metoxi y un carbonilo son equivalentes para la resonancia.'],0,
    'I es más básica en esta comparación, de acuerdo con la pauta 1.b. En II la unión N–C=O forma una amida; la conjugación reduce la disponibilidad del par. No basta contar oxígenos.','Comprueba si existe N–C=O o N–C–O.');
  add('res-7','resonance','fused-course',3,'El anillo fusionado no cambia la pregunta','En la pareja 1.c de la guía, I tiene N de tipo pirrol e II tiene N de tipo piridina. ¿Cuál es más básica?', ['I: par del N dentro del sistema aromático','II: par del N fuera del sistema π aromático'], ['I.','II.','Las dos por igual porque ambas son aromáticas.'],1,
    ['En II se usa el par sin retirar del sistema aromático el par que lo completa.','Cualquier N con un grupo metilo gana frente a uno sin metilo.','Tener dos anillos elimina cualquier diferencia entre los pares libres.'],0,
    'II es más básica; coincide con la pauta 1.c. Clasifica el papel del par: pirrólico en I y piridínico en II. La fusión con un anillo bencénico no vuelve equivalentes ambos tipos.','Pregúntate si el par libre aporta al sistema aromático.');
  add('res-8','resonance','ranking-course',3,'Cuatro bases, un orden','Ordena de menor a mayor basicidad: pirrol, anilina, piridina y piperidina, en condiciones comparables.', ['Pirrol · Anilina · Piridina · Piperidina'], ['Pirrol < anilina < piridina < piperidina.','Piperidina < piridina < anilina < pirrol.','Anilina < piperidina < pirrol < piridina.'],0,
    ['Hay que considerar el papel del par en aromaticidad/resonancia y el tipo de N, no sólo contar carbonos.','Todas siguen una regla universal de tamaño molecular.','Todos los anillos aromáticos contienen el par del N en su sexteto.'],0,
    'La pauta del ejercicio 2 da pirrol < anilina < piridina < piperidina. En pirrol el par sostiene la aromaticidad; en anilina se conjuga con el anillo; en piridina queda fuera del sexteto y en piperidina el N es una amina saturada.','Separa primero N pirrólico, anilínico, piridínico y alifático.');
  add('alk-5','alkylation','ethylhexyl-course',3,'Conserva las dos cadenas originales','En la metilación exhaustiva de N-etilhexan-2-amina, ¿qué grupos quedan unidos al N del amonio cuaternario?', ['N inicial: hexan-2-ilo + etilo + H','Reactivo: CH₃I en exceso'], ['Hexan-2-ilo, etilo y dos metilos; N⁺.','Hexan-2-ilo y tres metilos; se pierde el etilo.','Hexan-2-ilo, etilo y tres metilos; N⁺.'],0,
    ['Se conservan las cadenas originales y se completa un total de cuatro enlaces C–N.','El yodometano sustituye cualquier etilo por metilo.','El N neutro necesita cinco grupos carbonados para dar el amonio.'],0,
    'Quedan hexan-2-ilo, etilo y dos metilos sobre N⁺, con I⁻ como contraión. Es el intermedio de la pauta 3.a. No se elimina la cadena etilo durante la metilación.','Antes de añadir metilos, cuenta cuántas cadenas carbonadas ya tenía el N.');
  add('hof-5','hofmann','major-ethyl-course',3,'Revisa todas las cadenas','El amonio de N-etilhexan-2-amina contiene hexan-2-ilo, etilo y dos metilos. Tras Ag₂O/H₂O y calor, ¿qué alqueno es mayoritario según la pauta?', ['Cadenas eliminables: etilo y hexan-2-ilo','Los metilos no tienen carbono β'], ['Hex-2-eno, por ser más sustituido.','Hex-1-eno, porque sólo se revisa la cadena más larga.','Eteno, procedente del etilo.'],2,
    ['Eteno es el alqueno menos sustituido de las rutas posibles; hay que examinar también la cadena etilo.','La cadena etilo se pierde ya durante la metilación.','Cualquier grupo metilo unido a N puede producir un alqueno de un carbono.'],0,
    'La pauta 3.c señala eteno como mayoritario. Esa ruta rompe el enlace N–etilo y deja N,N-dimetilhexan-2-amina. Elegir el alqueno terminal de la cadena larga omite una ruta todavía menos sustituida.','No mires sólo la cadena de seis carbonos: ¿qué alqueno produciría el etilo?');
  add('hof-6','hofmann','allproducts-course',3,'No confundas mayoritario con único','¿Qué familias de alquenos se pueden formar desde ese mismo amonio de N-etilhexan-2-amina?', ['Rutas desde etilo y desde ambos lados del Cα del hexan-2-ilo'], ['Sólo eteno.','Eteno, hex-1-eno y hex-2-eno.','Meteno, pent-1-eno y hex-3-eno.'],1,
    ['Cada ruta necesita un carbono β con H; los metilos sobre N no tienen Cβ.','El producto mayoritario impide por completo la formación de los minoritarios.','El doble enlace puede aparecer en cualquier lugar sin relación con el enlace C–N.'],0,
    'La pauta 3.b muestra eteno, hex-1-eno y hex-2-eno como familias de alquenos. Hex-2-eno admite isomería E/Z; aquí se pregunta por las posiciones y cadenas. Cada ruptura deja además su amina terciaria y agua.','Marca primero cada Cα unido al N, y después sus carbonos β.');
  add('hof-7','hofmann','bromopentane-course',3,'Entrar desde un halogenuro','La guía parte de 2-bromopentano, añade trimetilamina y después Ag₂O/calor. ¿Qué alqueno mayoritario indica la pauta?', ['CH₃–CH(Br)–CH₂–CH₂–CH₃','1) (CH₃)₃N   2) Ag₂O / calor'], ['Pent-2-eno.','Pent-1-eno.','Propeno.'],1,
    ['La secuencia genera un amonio cuaternario, que permite una eliminación de Hofmann hacia el alqueno menos sustituido de este caso.','La trimetilamina agrega un carbono a la cadena principal del alqueno.','Ag₂O transforma directamente el Br en un grupo metilo.'],0,
    'La pauta 4.a da pent-1-eno. Sigue el intermedio de amonio antes de aplicar la eliminación; la cadena del alqueno sigue teniendo cinco carbonos.','Reconoce primero para qué sirve añadir trimetilamina.');
  add('hof-8','hofmann','ringopening-course',3,'El nitrógeno forma parte de dos anillos','En la amina bicíclica de la guía, N es un átomo compartido entre dos anillos. Tras CH₃I en exceso, Ag₂O y calor, ¿qué transformación muestra la pauta?', ['Dos anillos comparten el enlace C–N','Metilación → hidróxido de amonio → calentamiento'], ['Los dos anillos quedan intactos y sólo desaparece la carga.','Se rompe un enlace C–N de un anillo, aparece un alqueno terminal y queda una amina terciaria N-metilada.','Se elimina necesariamente todo el nitrógeno de la molécula.'],1,
    ['Una eliminación puede abrir un anillo si el enlace C–N que se rompe pertenecía a él.','Una eliminación de Hofmann nunca rompe enlaces de un anillo.','El carbono del metilo sobre N se convierte por sí solo en un alqueno.'],0,
    'La pauta 4.b muestra apertura de un anillo, un doble enlace terminal y conservación del N dentro del otro anillo, ahora N-metilado. Dibuja el esqueleto después de romper el enlace: el N no desaparece de toda la molécula.','Colorea el enlace C–N que se rompe y sigue qué camino del anillo deja de estar cerrado.');
  const visuals = { 'res-1':'resonance','res-3':'heterocycles','res-5':'enamine','res-6':'amide','res-7':'heterocycles','res-8':'ranking','alk-5':'branchsalt','hof-5':'branches','hof-6':'branches','hof-7':'hofmann','hof-8':'ring' };
  for (const item of activities) if (visuals[item.id]) item.visual=visuals[item.id];
  const content = { version: 'aminas-control1-2', skills, activities,
    sources: [
      { id: 'course-guide', title: 'Guía oficial: Aminas · Orgánica II, QyF', url: 'https://drive.google.com/file/d/1SYyxKMpPfSisVN9nIKomUt7Zmeae6LbQ/view', note: 'Se revisaron visualmente sus dos páginas. Delimita comparaciones de basicidad, orden de cuatro bases y eliminaciones de Hofmann con varias cadenas y apertura de anillo. El recorrido añade bases y variantes originales para enseñar esos razonamientos.' },
      { id: 'course-solutions', title: 'Pauta oficial de la guía de Aminas', url: 'https://drive.google.com/file/d/1FnGaNtqiYJG57xqeq-vCw0Un9ZeiZ8jL/view', note: 'Revisada visualmente: comparaciones 1.a–c, orden del ejercicio 2, productos y mayoritario del ejercicio 3, y transformaciones 4.a–b. Los desafíos marcados «Guía» trabajan estos razonamientos con redacción y dibujos propios.' },
      { id: 'openstax', title: 'OpenStax · Organic Chemistry, capítulo 24', url: 'https://openstax.org/books/organic-chemistry/pages/24-3-basicity-of-amines', note: 'Apoyo conceptual externo al curso. Ver también 24.9 (heterociclos) y 24.7 (reacciones). Las explicaciones del piloto están redactadas de forma original.' }
    ] };
  if (typeof module !== 'undefined' && module.exports) module.exports = content;
  else root.NexoStudyContent = content;
})(typeof globalThis !== 'undefined' ? globalThis : this);
