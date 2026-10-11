/* =====================================================================
   CAMINO A LA PEP 1 · CONTENIDO (este es el archivo para editar preguntas y jefes)
   ---------------------------------------------------------------------
   Tipos de desafío:
     elegir     {q, ops:[...], ok:0, por}             (la correcta puede estar en cualquier índice; se mezclan)
     conectar   {q, pares:[[izquierda, derecha],...], por}
     ordenar    {q, items:[[nombre, detalle, mol?],...] en el orden correcto, extremos:['menor','mayor'], por}
     clasificar {q, cajas:[...], items:[[nombre, nºcaja, mol?],...], mostrar:6, por}
     ruta       {q, inicio, meta, pasos:[...] (o varias rutas válidas: [[...],[...]]), extra:[distractores], por}
     flecha     (mecanismo de protonación, solo Rey)
   Todos llevan `tema` (para que el error vuelva) y `pista`.
   Fuente: pauta PEP 1 2025 (dist/assets/exams/13_*.jpg y 07_*.jpg) y diapositivas de Aminas (Dr. J. Echeverría).
   ===================================================================== */
(function(){
const P1 = window.P1 = window.P1 || {};

P1.TEMAS = {
  clasificacion:'clasificación de aminas', estructura:'estructura del N', propiedades:'propiedades físicas',
  espectro:'espectroscopía', nomenclatura:'nomenclatura', sintesis:'síntesis de aminas', basicidad:'basicidad',
  huckel:'regla de Hückel', heterociclos:'heterociclos', sea:'sustitución electrofílica', directores:'efecto de sustituyentes',
  friedel:'Friedel-Crafts', rutas:'síntesis desde benceno', diazonio:'sales de diazonio', protonacion:'protonación',
  resonancia:'resonancia', induccion:'inducción', aromaticidad:'aromaticidad', hofmann:'eliminación de Hofmann'
};

/* Moléculas que se dibujan (anillos simples). Vértice 0 arriba, sentido horario; enlace i va del vértice i al i+1. */
P1.MOL = {
  benceno:{n:6,dobles:[0,2,4]},
  ciclobutadieno:{n:4,dobles:[0,2],rot:Math.PI/4},
  cot:{n:8,dobles:[0,2,4,6],rot:Math.PI/8},
  ciclopropenilo:{n:3,dobles:[1],carga:{0:'+'}},
  cp_anion:{n:5,dobles:[1,3],carga:{0:'−'},par:[0]},
  cp_cation:{n:5,dobles:[1,3],carga:{0:'+'}},
  ciclohexadieno:{n:6,dobles:[0,2]},
  tropilio:{n:7,dobles:[1,3,5],carga:{0:'+'}},
  piridina:{n:6,dobles:[0,2,4],het:{0:'N'}},
  pirrol:{n:5,dobles:[1,3],het:{0:'NH'}},
  piperidina:{n:6,het:{0:'NH'}},
  metilpiridina:{n:6,dobles:[0,2,4],het:{0:'N'},sus:{1:'CH₃'}},
  cloropiperidina:{n:6,het:{0:'NH'},sus:{2:'Cl'}},
  anilina:{n:6,dobles:[1,3,5],sus:{0:'NH₂'}},
  ciclohexilamina:{n:6,sus:{0:'NH₂'}},
  nitroanilina:{n:6,dobles:[1,3,5],sus:{0:'NH₂',3:'NO₂'}},
  toluidina:{n:6,dobles:[1,3,5],sus:{0:'NH₂',3:'CH₃'}},
  anisidina:{n:6,dobles:[1,3,5],sus:{0:'NH₂',3:'OCH₃'}},
  nitrobenceno:{n:6,dobles:[1,3,5],sus:{0:'NO₂'}},
  clorobenceno:{n:6,dobles:[1,3,5],sus:{0:'Cl'}},
  tolueno:{n:6,dobles:[1,3,5],sus:{0:'CH₃'}},
  fenol:{n:6,dobles:[1,3,5],sus:{0:'OH'}},
  benzamida:{n:6,dobles:[1,3,5],sus:{0:'CONH₂'}},
  clpropilbenceno:{n:6,dobles:[1,3,5],sus:{0:'Cl',3:'CH₂CH₂CH₃'}},
  mbromoanilina:{n:6,dobles:[1,3,5],sus:{0:'NH₂',2:'Br'}},
  pbromotolueno:{n:6,dobles:[1,3,5],sus:{0:'CH₃',3:'Br'}},
};

/* ---------------------------------------------------------------------
   JEFES
   --------------------------------------------------------------------- */
P1.JEFES = [
{
  id:'amina', nombre:'TRIMETILAMINA', titulo:'La amina apestosa', subtitulo:'(CH₃)₃N · Guardiana del Pantano',
  tema:'Aminas: estructura, propiedades y síntesis', vida:180, curaError:0, dificultad:.85, arena:'pantano', musica:'amina',
  pv:24, tes:2,
  fases:[{umbral:.5, linea:'¡Inversión piramidal! Mi par libre cambia de lado… y tú no sabes de cuál.'}],
  patrones:{1:['burbujas','lluvia','barrido'], 2:['burbujas','nube','metilos','barrido']},
  ataquePorTema:{clasificacion:'barrido',estructura:'metilos',propiedades:'burbujas',espectro:'lluvia',nomenclatura:'lluvia',sintesis:'metilos',basicidad:'nube'},
  lineas:{
    entrada:'Huele a pescado… soy yo. Tres metilos, un par libre y cero puentes de hidrógeno que darte.',
    burlas:['Mi par libre está listo para atacarte.','Soy terciaria: no dono puentes de H, solo problemas.','Huelo tu duda desde aquí.','Protóname si puedes.'],
    golpe:['¡Me protonaste un poquito!','¡Ugh, ese par libre era mío!','Mi olor… se debilita…'],
    derrota:'Me convierto en sal de amonio… sin olor… qué vergüenza.'
  }
},
{
  id:'ciclo', nombre:'CICLOBUTADIENO', titulo:'El antiaromático', subtitulo:'C₄H₄ · 4 electrones π de pura inestabilidad',
  tema:'Aromaticidad, Hückel y heterociclos', vida:200, curaError:4, dificultad:1, arena:'laboratorio', musica:'ciclo',
  pv:24, tes:2,
  fases:[{umbral:.5, linea:'¡4n, 4n, 4n! ¡Mis dobles enlaces ya no saben dónde estar!'}],
  patrones:{1:['rebote','barrido','alternancia'], 2:['rebote','alternancia','dimero','lluvia']},
  ataquePorTema:{huckel:'alternancia',heterociclos:'rebote',aromaticidad:'alternancia',basicidad:'dimero',resonancia:'barrido'},
  lineas:{
    entrada:'Soy plano, cíclico, conjugado… y tengo 4 electrones π. Nadie ha logrado aislarme. Tú tampoco.',
    burlas:['¡No soy inestable, tú eres inestable!','El benceno es mi primo exitoso. Lo odio.','Me voy a dimerizar contigo.','¿Hückel? No lo conozco.'],
    golpe:['¡Mis enlaces tiemblan!','¡Eso fue 4n + 2 de daño!','¡Me estoy deslocalizando… mal!'],
    derrota:'Me… dimerizo… adiós…'
  }
},
{
  id:'benceno', nombre:'BENCENO MALVADO', titulo:'El aromático supremo', subtitulo:'C₆H₆ · Señor de la Catedral',
  tema:'SEA, Friedel-Crafts, síntesis y diazonio', vida:220, curaError:6, dificultad:1.15, arena:'catedral', musica:'benceno',
  pv:24, tes:2,
  fases:[{umbral:.5, linea:'¡Resonancia furiosa! Mis electrones π giran contra ti.'}],
  patrones:{1:['espiral','hexagonos','laser'], 2:['espiral','laser','electrofilos','hexagonos']},
  ataquePorTema:{sea:'electrofilos',directores:'laser',friedel:'hexagonos',rutas:'espiral',diazonio:'laser',espectro:'hexagonos'},
  lineas:{
    entrada:'Seis carbonos, seis electrones π, cero piedad. Para pasar, tendrás que sustituirme.',
    burlas:['Mi anillo es tan estable que tus respuestas me hacen cosquillas.','¿Sustitución electrofílica? Empecemos por sustituirte a ti.','Sin catalizador no me tocas.','Kekulé me soñó. Yo te sueño reprobado.'],
    golpe:['¡Me rompiste la aromaticidad!','¡Un complejo sigma!','¡Ese electrófilo dolió!'],
    derrota:'Pierdo… mi… aromaticidad…'
  }
},
{
  id:'rey', nombre:'REY AMONIO', titulo:'El jefe final', subtitulo:'NH₄⁺ · Guardián de la Basicidad',
  tema:'Basicidad, Hofmann y repaso de toda la PEP', vida:280, curaError:8, dificultad:1.35, combo:true, arena:'trono', musica:'rey',
  pv:28, tes:2, final:true, repaso:.3,
  fases:[{umbral:.66, linea:'¡Basta! Desplegaré mi tetraedro completo.'},{umbral:.33, linea:'¡Mi corona! ¡Mi protón! ¡Todo el poder del NH₄⁺!'}],
  patrones:{1:['protones','anillo','cadena'], 2:['protones','anillo','cadena','tetra'], 3:['corona','anillo','cadena','tetra','protones']},
  ataquePorTema:{protonacion:'protones',resonancia:'anillo',aromaticidad:'anillo',induccion:'cadena',basicidad:'tetra',hofmann:'corona',heterociclos:'anillo'},
  lineas:{
    entrada:'Cuatro enlaces, carga +1 y corona puesta. Venciste a mis guardianes… pero nadie me quita mi protón.',
    burlas:['¿Eso fue un par libre o un suspiro?','Mi carga positiva ni se inmutó.','Los pares libres siempre terminan conmigo.','Un protón más y soy invencible.'],
    golpe:['¡Eso dolió como un buen pKa!','¡Ugh! Bien razonado…','Mi corona tiembla…'],
    derrota:'Mi protón… vuelve al disolvente… NH₄⁺ → NH₃ + H⁺. Estás listo para la PEP.'
  }
}
];

/* ---------------------------------------------------------------------
   BANCOS
   --------------------------------------------------------------------- */
const E=(tema,q,ops,por,ok=0)=>({tipo:'elegir',tema,q,ops,ok,por});

P1.BANCO = {};

/* ===== 1. TRIMETILAMINA: aminas ===== */
P1.BANCO.amina = [
  E('clasificacion','(CH₃)₂NH es una amina…',['Secundaria','Primaria','Terciaria','Cuaternaria'],'Se clasifica por el número de grupos orgánicos unidos al N: aquí hay dos.'),
  E('estructura','Hibridación y geometría del N en una amina alifática:',['sp³, piramidal trigonal','sp², trigonal plana','sp, lineal','sp³, tetraédrica sin par libre'],'El par libre ocupa un orbital sp³ y los ángulos quedan cerca de 108°.'),
  E('estructura','Las aminas son básicas y nucleofílicas gracias a…',['El par de electrones libre del N','Sus H ácidos','Que el N es menos electronegativo que el C','Que forman radicales fácilmente'],'El par libre puede aceptar un H⁺ (base) o atacar un centro electrófilo (nucleófilo).'),
  E('propiedades','A masa molar similar, ¿cuál tiene MENOR punto de ebullición?',['Trimetilamina (3°)','Propilamina (1°)','Etilmetilamina (2°)','Las tres igual'],'La amina 3° no tiene N–H: no puede donar puentes de hidrógeno entre sus moléculas.'),
  E('propiedades','Sobre la solubilidad de las aminas en agua:',['Las de menos de ~5 C son solubles por puentes de H','Todas son insolubles','Solo las terciarias son solubles','Ninguna forma puentes de H con el agua'],'Las aminas pequeñas forman puentes de H con el agua; sobre ~5 C domina la parte apolar.'),
  E('espectro','En IR, una amina PRIMARIA muestra entre 3350 y 3500 cm⁻¹…',['Dos picos N–H','Un pico N–H','Ningún pico','Una banda ancha de O–H'],'El NH₂ tiene estiramiento simétrico y asimétrico: dos picos. La 2° muestra uno y la 3° ninguno.'),
  E('nomenclatura','C₆H₅NH₂ se llama…',['Anilina','Bencilamina','Piridina','Fenilmetanamina'],'Ojo: la bencilamina es C₆H₅CH₂NH₂, con un CH₂ entre el anillo y el N.'),
  E('basicidad','Basicidad de aminas alifáticas en agua:',['2° > 1° > 3°','3° > 2° > 1°','1° > 2° > 3°','Todas iguales'],'Compiten el efecto donador de los alquilos y la solvatación del ion amonio; la 3° pierde solvatación.'),
  E('propiedades','¿Por qué muchos fármacos amínicos se venden como clorhidratos?',['Más estables, solubles en agua y sin olor','Para hacerlos más lipofílicos','Para aumentar su basicidad','Para que no se disuelvan'],'La sal de amonio es iónica: más soluble en agua, más estable y sin el olor de la base libre.'),
  E('basicidad','Si el ion amonio conjugado tiene pKa ALTO, la amina es…',['Una base fuerte','Una base débil','Un ácido fuerte','Neutra'],'pKa alto del ácido conjugado = cuesta quitarle el H⁺ = la amina retiene bien el protón: base fuerte.'),
  E('basicidad','Relación entre pKa (ion amonio) y pKb (amina) a 25 °C:',['pKa + pKb = 14','pKa + pKb = 7','pKa × pKb = 14','pKa = pKb'],'Ka × Kb = Kw = 1,0 × 10⁻¹⁴, por lo tanto pKa + pKb = 14.'),
  E('clasificacion','¿Cuál es una sal de amonio cuaternario?',['(CH₃)₄N⁺ I⁻','(CH₃)₃N','CH₃NH₂','(CH₃)₂NH'],'Cuatro grupos orgánicos sobre el N, que queda con carga positiva permanente.'),
  E('propiedades','Las aminas naturales de plantas, como la nicotina, se llaman…',['Alcaloides','Terpenos','Esteroides','Flavonoides'],'Ejemplos: morfina, cocaína, nicotina.'),
  E('propiedades','Para separar una amina de impurezas neutras se usa…',['HCl acuoso: la amina protonada pasa al agua','NaOH acuoso: la amina pasa al agua','Hexano puro','Destilación con KMnO₄'],'Protonada es soluble en agua; las impurezas neutras quedan en la fase orgánica. Después se libera con NaOH.'),
  E('sintesis','¿Qué método da aminas primarias SIN polialquilación?',['Síntesis de Gabriel','Alquilación directa con NH₃','Eliminación de Hofmann','Acilación con R–COCl'],'Gabriel (ftalimida) y la vía de la azida evitan que la amina siga alquilándose.'),
  E('sintesis','NH₃ + CH₃CH₂Br (en exceso) da…',['Una mezcla que termina en la sal (CH₃CH₂)₄N⁺ Br⁻','Solo etilamina pura','Etanol','Nada: el NH₃ no es nucleófilo'],'Cada amina formada es tan o más nucleófila que la anterior: se alquila una y otra vez (polialquilación). P4c de la PEP 2025.'),
  E('sintesis','R–C≡N + LiAlH₄ (luego H₂O) da…',['R–CH₂–NH₂ (amina 1° con un C más)','R–NH₂','R–COOH','R–CH₂OH'],'El nitrilo se reduce a amina primaria y conserva el C del CN.'),
  E('sintesis','Ciclohexanona + NH₃ + NaBH₃CN da…',['Ciclohexilamina','Ciclohexanol','Anilina','Ciclohexeno'],'Aminación reductiva: se forma la imina y el NaBH₃CN la reduce a amina.'),
  E('espectro','Regla del nitrógeno: un compuesto con UN átomo de N tiene masa molecular…',['Impar','Par','Siempre múltiplo de 14','No se puede saber'],'Número impar de N → M⁺ impar (ej. CH₃NH₂ = 31).'),
  E('nomenclatura','Nombre IUPAC de CH₃CH₂CH₂NH₂:',['Propan-1-amina','Propanamida','Propanonitrilo','N-propilamina'],'Cadena de 3 C con el grupo amino en C1: propan-1-amina (o propilamina).'),
  {tipo:'conectar',tema:'clasificacion',q:'Conecta cada compuesto con su clase',
    pares:[['CH₃CH₂NH₂','Amina 1°'],['(CH₃)₂NH','Amina 2°'],['(CH₃)₃N','Amina 3°'],['(CH₃)₄N⁺ I⁻','Sal cuaternaria']],
    pista:'Cuenta cuántos grupos orgánicos tiene el N.',por:'1°, 2° y 3° según los grupos orgánicos sobre el N; con 4 queda N⁺ permanente (sal cuaternaria).'},
  {tipo:'conectar',tema:'sintesis',q:'Conecta cada síntesis con lo que produce',
    pares:[['Ftalimida + KOH, R–X, luego H₂NNH₂','Amina 1° (Gabriel)'],['R–X + NaN₃, luego LiAlH₄','Amina 1° vía azida'],['Aldehído + amina + NaBH₃CN','Aminación reductiva'],['Ar–NO₂ + Fe/HCl','Anilina (reducción)']],
    pista:'Busca la pieza clave: ftalimida, azida, hidruro selectivo o un nitro.',por:'Gabriel y azida dan aminas 1° sin polialquilación; la aminación reductiva pasa por una imina; Fe/HCl reduce el nitro.'},
  {tipo:'conectar',tema:'espectro',q:'Conecta con lo que se ve en IR (3300–3500 cm⁻¹)',
    pares:[['Amina 1° (R–NH₂)','Dos picos agudos'],['Amina 2° (R₂NH)','Un pico'],['Amina 3° (R₃N)','Ningún pico N–H'],['Alcohol (R–OH)','Banda ancha']],
    pista:'Cuenta los enlaces N–H que pueden estirarse.',por:'Dos N–H → dos modos (simétrico y asimétrico); uno → un pico; ninguno → nada. El O–H con puentes de H da una banda ancha.'},
  {tipo:'conectar',tema:'sintesis',q:'PEP 1 2025, P4: conecta los reactivos con el producto',
    pares:[['Anilina + NaNO₂/HCl (0 °C)','Sal de bencenodiazonio'],['(CH₃)₂NH + PhCOCl, luego LiAlH₄','PhCH₂N(CH₃)₂'],['NH₃ + CH₃CH₂X en exceso','(CH₃CH₂)₄N⁺ X⁻'],['Ftalimida, KOH, CH₃CH₂CH₂Br, H₂NNH₂','Propilamina']],
    pista:'Una amida reducida con LiAlH₄ queda como amina; el exceso de halogenuro alquila hasta el final.',por:'Diazotación de la anilina; amida → amina con LiAlH₄; polialquilación hasta sal cuaternaria; Gabriel da amina 1°.'},
  {tipo:'ordenar',tema:'propiedades',q:'Punto de ebullición (masas parecidas)',extremos:['menor','mayor'],
    items:[['Trimetilamina','3 °C'],['Etilmetilamina','36 °C'],['Propilamina','48 °C'],['Propan-1-ol','97 °C']],
    pista:'Más N–H (u O–H) = más puentes de H entre moléculas.',por:'La 3° no dona puentes de H; la 1° tiene dos N–H; el O–H forma puentes más fuertes que el N–H.'},
  {tipo:'ordenar',tema:'basicidad',q:'Basicidad en agua',extremos:['menos básica','más básica'],
    items:[['NH₃','pKaH 9,25'],['(CH₃)₃N','pKaH 9,80'],['CH₃NH₂','pKaH 10,64'],['(CH₃)₂NH','pKaH 10,73']],
    pista:'Los alquilos donan densidad, pero la 3° se solvata peor.',por:'En agua: 2° > 1° > 3° > NH₃. La 3° pierde solvatación de su ion amonio aunque tenga más alquilos.'},
  {tipo:'clasificar',tema:'clasificacion',q:'Clasifica cada amina',cajas:['1°','2°','3°'],mostrar:6,
    items:[['Anilina',0,'anilina'],['Ciclohexilamina',0,'ciclohexilamina'],['Isopropilamina',0],['Piperidina',1,'piperidina'],['Dietilamina',1],['N-Metilanilina',1],['Trietilamina',2],['N,N-Dimetilanilina',2]],
    pista:'Mira solo el N: ¿cuántos C lo tocan?',por:'Se cuentan los C unidos al N. La piperidina es 2°: el N está unido a dos C del anillo.'},
  {tipo:'ruta',tema:'sintesis',q:'Propilamina sin polialquilación (Gabriel)',inicio:'Ftalimida',meta:'CH₃CH₂CH₂NH₂',
    pasos:['KOH','CH₃CH₂CH₂Br','H₂NNH₂'],extra:['NH₃ en exceso','LiAlH₄','NaNO₂/HCl'],
    pista:'Primero se forma el anión de la ftalimida, después se alquila y al final se libera la amina.',por:'KOH desprotona la ftalimida; el anión hace SN2 sobre el bromuro; la hidrazina libera la amina 1°. PEP 2025, P6b.'},
  {tipo:'ruta',tema:'sintesis',q:'Anilina desde benceno',inicio:'Benceno',inicioMol:'benceno',meta:'Anilina',metaMol:'anilina',
    pasos:['HNO₃/H₂SO₄','Fe/HCl'],extra:['NH₃/AlCl₃','NaNH₂','KMnO₄'],
    pista:'No se puede poner NH₂ directo: primero otro grupo con N.',por:'Nitración (NO₂⁺) y luego reducción del nitro a amino con Fe/HCl, Sn/HCl o H₂/Pt.'},
  {tipo:'ruta',tema:'sintesis',q:'PEP 2025 P4b: N,N-dimetilbencilamina',inicio:'(CH₃)₂NH',meta:'PhCH₂N(CH₃)₂',
    pasos:['PhCOCl','LiAlH₄'],extra:['NaBH₄','Br₂/FeBr₃','H₃O⁺'],
    pista:'Forma una amida y después redúcela hasta amina.',por:'La amina ataca al cloruro de benzoílo (amida); el LiAlH₄ reduce el C=O a CH₂. El NaBH₄ no reduce amidas.'}
];

/* ===== 2. CICLOBUTADIENO: aromaticidad ===== */
P1.BANCO.ciclo = [
  E('huckel','Regla de Hückel: anillo plano, cíclico y conjugado con 4n + 2 electrones π es…',['Aromático','Antiaromático','No aromático','Alifático'],'4n + 2 (2, 6, 10…) → aromático. 4n (4, 8…) y plano → antiaromático.'),
  E('huckel','El ciclobutadieno es…',['Antiaromático','Aromático','No aromático','Un heterociclo'],'Es plano y conjugado pero tiene 4 e π (4n): la deslocalización lo desestabiliza.'),
  E('huckel','El ciclooctatetraeno (8 e π) NO es antiaromático porque…',['Adopta forma de tina y deja de ser plano','Tiene 4n + 2 electrones π','Es aromático','No tiene dobles enlaces'],'Sin planaridad no hay traslape continuo de orbitales p: es no aromático.'),
  E('huckel','¿Cuál de estas especies es aromática?',['Anión ciclopentadienilo','Catión ciclopentadienilo','Ciclohexa-1,3-dieno','Ciclooctatetraeno'],'El anión aporta su par al sistema: 6 e π. El catión tendría 4 e π (antiaromático).'),
  E('huckel','El catión cicloheptatrienilo (tropilio) tiene…',['6 e π, aromático','8 e π, antiaromático','7 e π, no aromático','4 e π, antiaromático'],'Tres dobles enlaces = 6 e π; el C⁺ aporta un orbital p vacío y completa el anillo.'),
  E('heterociclos','¿Por qué el pirrol es una base extremadamente débil?',['Su par libre forma parte del sexteto aromático','Su N es sp³','Es antiaromático','No tiene par libre'],'Protonarlo destruiría la aromaticidad, así que el par libre no está disponible.'),
  E('heterociclos','En la piridina, el par libre del N…',['Está en un sp² en el plano y no participa de la aromaticidad','Está en un orbital p y participa de la aromaticidad','No existe','Está en un sp³'],'Por eso la piridina se protona sin perder aromaticidad y es básica.'),
  E('basicidad','Ordena de MÁS a MENOS básica:',['Ciclohexilamina > piridina > pirrol','Pirrol > piridina > ciclohexilamina','Piridina > ciclohexilamina > pirrol','Pirrol > ciclohexilamina > piridina'],'N sp³ alifático > N sp² (más carácter s) > pirrol (par comprometido en la aromaticidad).'),
  E('resonancia','La anilina comparada con la ciclohexilamina es…',['Menos básica: su par libre se deslocaliza en el anillo','Más básica gracias al anillo','Igual de básica','Un ácido fuerte'],'El par libre entra en resonancia con el anillo; el ion anilinio pierde esa estabilización.'),
  E('resonancia','Un –NO₂ en para de la anilina hace que su basicidad…',['Disminuya','Aumente','No cambie','Sea la de una amina 3°'],'Grupo atractor: deslocaliza aún más la densidad del N. Los donadores (–CH₃, –OCH₃) la aumentan un poco.'),
  E('resonancia','Las amidas casi no son básicas porque…',['El par libre del N está deslocalizado con el C=O','Su N es sp³','No tienen nitrógeno','Forman puentes de H muy fuertes'],'La resonancia con el carbonilo compromete el par libre.'),
  E('huckel','¿Cuántos electrones π tiene el naftaleno?',['10','6','8','12'],'Cinco dobles enlaces = 10 e π, que cumple 4n + 2 con n = 2.'),
  E('aromaticidad','El benceno no decolora Br₂/CCl₄ sin catalizador porque…',['La adición le haría perder la aromaticidad','Es un compuesto saturado','El Br₂ no es electrófilo','Por impedimento estérico'],'Adicionar sería desfavorable. Con FeBr₃ ocurre sustitución, que conserva el anillo aromático.'),
  E('heterociclos','Un nitrilo (N sp) comparado con una amina sp³ es…',['Una base mucho más débil','Una base mucho más fuerte','Igual de básico','Más básico que la piridina'],'Más carácter s = par libre más retenido = menor basicidad.'),
  E('heterociclos','En imidazol, ¿qué nitrógeno capta el H⁺?',['El N sin H (tipo piridina)','El N–H (tipo pirrol)','Ambos por igual','Ninguno'],'El par del N tipo piridina está fuera del sexteto; el del N–H forma parte de él.'),
  E('huckel','PEP 2025, P5: el azuleno (C₁₀H₈, anillos de 5 y 7) es…',['Aromático: 10 e π (4n + 2, n = 2)','Antiaromático: 8 e π','No aromático: tiene un C sp³','Antiaromático: 12 e π'],'Cinco dobles enlaces conjugados en el perímetro: 10 e π, plano → aromático (pauta 2025).'),
  {tipo:'clasificar',tema:'huckel',q:'PEP 2025, P5: clasifica con la regla de Hückel',cajas:['Aromático','Antiaromático','No aromático'],mostrar:6,
    items:[['Benceno',0,'benceno'],['Catión ciclopropenilo',0,'ciclopropenilo'],['Anión ciclopentadienilo',0,'cp_anion'],['Catión tropilio',0,'tropilio'],['Piridina',0,'piridina'],['Pirrol',0,'pirrol'],
           ['Ciclobutadieno',1,'ciclobutadieno'],['Catión ciclopentadienilo',1,'cp_cation'],['Ciclooctatetraeno (tina)',2,'cot'],['Ciclohexa-1,3-dieno',2,'ciclohexadieno']],
    pista:'Revisa en orden: ¿cíclico? ¿plano? ¿conjugado en todo el anillo? ¿cuántos e π?',por:'4n + 2 e π (2, 6, 10) con anillo plano y conjugado → aromático; 4n plano → antiaromático; si falla la conjugación o la planaridad → no aromático.'},
  {tipo:'conectar',tema:'huckel',q:'Conecta cada especie con sus electrones π',
    pares:[['Catión ciclopropenilo','2'],['Ciclobutadieno','4'],['Benceno','6'],['Naftaleno','10']],
    pista:'Cada doble enlace aporta 2; un C⁺ aporta 0 y un C⁻ con par aporta 2.',por:'2 y 6 y 10 son 4n + 2 (aromáticos); 4 es 4n (antiaromático si es plano).'},
  {tipo:'conectar',tema:'heterociclos',q:'¿Dónde está el par libre del N?',
    pares:[['Piridina','sp², en el plano del anillo'],['Pirrol','Orbital p, dentro del sexteto'],['Amina alifática','Orbital sp³'],['Nitrilo','Orbital sp, muy retenido']],
    pista:'Si el par es parte del anillo aromático, no está disponible para un H⁺.',por:'Cuanto más carácter s, más retenido el par (sp > sp² > sp³). El del pirrol es parte de la aromaticidad.'},
  {tipo:'conectar',tema:'huckel',q:'¿Qué condición de Hückel cumple o falla?',
    pares:[['Ciclooctatetraeno','No es plano (tina)'],['Ciclohexa-1,3-dieno','Tiene un C sp³: conjugación cortada'],['Ciclobutadieno','Plano pero con 4n e π'],['Benceno','Cumple todo: aromático']],
    pista:'Las condiciones son: cíclico, plano, conjugado y 4n + 2.',por:'Cada molécula falla en algo distinto, salvo el benceno.'},
  {tipo:'ordenar',tema:'basicidad',q:'Basicidad',extremos:['menos básica','más básica'],
    items:[['Pirrol','pKaH ≈ 0,4','pirrol'],['Anilina','pKaH 4,6','anilina'],['Piridina','pKaH 5,2','piridina'],['Ciclohexilamina','pKaH 10,6','ciclohexilamina']],
    pista:'Par en el sexteto < par deslocalizado en el anillo < par sp² < par sp³ libre.',por:'El pirrol pierde aromaticidad al protonarse; la anilina deslocaliza su par; la piridina tiene un par sp²; la ciclohexilamina, un par sp³ libre.'},
  {tipo:'ordenar',tema:'resonancia',q:'Basicidad de anilinas para-sustituidas',extremos:['menos básica','más básica'],
    items:[['p-Nitroanilina','pKaH 1,0','nitroanilina'],['Anilina','pKaH 4,6','anilina'],['p-Toluidina','pKaH 5,1','toluidina'],['p-Anisidina','pKaH 5,3','anisidina']],
    pista:'Atractor baja la basicidad; donador la sube un poco.',por:'–NO₂ retira densidad por resonancia; –CH₃ y –OCH₃ donan y suben levemente la basicidad.'}
];

/* ===== 3. BENCENO MALVADO: SEA y síntesis ===== */
P1.BANCO.benceno = [
  E('sea','En la SEA, el paso limitante es…',['La formación del complejo sigma','La pérdida del H⁺','La formación del catalizador','La regeneración del FeBr₃'],'Romper la aromaticidad para formar el ion arenio es lo más costoso.'),
  E('sea','El electrófilo de la nitración con HNO₃/H₂SO₄ es…',['NO₂⁺ (ion nitronio)','NO₂⁻','HNO₂','NO⁺'],'El H₂SO₄ protona al HNO₃, que pierde agua y forma NO₂⁺.'),
  E('directores','Un halógeno en el anillo (ej. clorobenceno) es…',['Desactivador, pero orto/para','Activador, orto/para','Desactivador, meta','Activador, meta'],'Retira por inducción (desactiva) pero dona por resonancia hacia orto/para (orienta).'),
  E('directores','La nitración del nitrobenceno da principalmente…',['m-Dinitrobenceno','o-Dinitrobenceno','p-Dinitrobenceno','Nada, nunca reacciona'],'–NO₂ es desactivador fuerte y meta-orientador.'),
  E('directores','Si un –OCH₃ y un –NO₂ dirigen a posiciones distintas, manda…',['El –OCH₃: los activadores dirigen más fuerte','El –NO₂, por ser desactivador fuerte','Ninguno: sale mezcla 1:1','El que esté en la posición 1'],'Jerarquía: –OH, –OR, –NR₂ > –R, –X > meta-orientadores.'),
  E('friedel','Benceno + 1-cloropropano / AlCl₃ da principalmente…',['Isopropilbenceno (cumeno)','Propilbenceno','No reacciona','Clorobenceno'],'El carbocatión primario se transpone al secundario antes de atacar.'),
  E('friedel','Para obtener propilbenceno SIN transposición conviene…',['Acilación con cloruro de propanoilo y luego Clemmensen','Alquilación con 1-cloropropano','Nitración y luego reducción','Sulfonación y desulfonación'],'El ion acilio no se transpone; después se reduce el C=O a CH₂.'),
  E('friedel','La alquilación de Friedel-Crafts FALLA con…',['Nitrobenceno','Tolueno','Anisol','Benceno'],'No funciona con anillos fuertemente desactivados (–NO₂, –SO₃H, cetonas).'),
  E('sea','¿Qué reacción de SEA es reversible?',['Sulfonación','Nitración','Bromación','Acilación de Friedel-Crafts'],'El –SO₃H se quita calentando en ácido diluido; sirve como grupo bloqueador.'),
  E('sea','Anilina + agua de bromo (sin catalizador) da…',['2,4,6-Tribromoanilina','m-Bromoanilina','Bromobenceno','No reacciona'],'El –NH₂ activa tanto que se broman todas las posiciones orto y para.'),
  E('diazonio','Para obtener Ar–F desde una sal de diazonio se usa…',['HBF₄ y calor (Schiemann)','CuF','KF en agua','F₂ / FeF₃'],'Se forma el tetrafluoroborato de diazonio, que al calentarse libera N₂ y BF₃.'),
  E('sea','La SNA (sustitución nucleofílica aromática) es fácil cuando el haluro de arilo tiene…',['–NO₂ en orto o para al halógeno','Donadores en meta','Alquilos en para','Ningún sustituyente'],'Los atractores en orto/para estabilizan el intermediario con carga negativa.'),
  E('directores','Frente a la nitración, el tolueno comparado con el benceno reacciona…',['~25 veces más rápido, orto/para','Más lento, en meta','Igual, en mezcla aleatoria','No reacciona'],'El metilo dona por inducción y estabiliza el complejo sigma.'),
  E('espectro','En ¹H RMN, dos protones aromáticos en orto acoplan con J ≈',['8 Hz','2 Hz','15 Hz','0 Hz'],'Orto ≈ 8 Hz y meta ≈ 2 Hz.'),
  E('espectro','En el espectro de masas de un alquilbenceno, el pico m/z 91 es…',['El ion tropilio (vía catión bencilo)','El ion fenilo','El ion molecular del tolueno','El ion nitronio'],'Ruptura bencílica y reordenamiento al tropilio aromático. Ojo: el tolueno pesa 92.'),
  E('sea','La yodación del benceno requiere…',['Un oxidante como HNO₃','FeI₃ como catalizador','Luz UV','AlCl₃'],'El HNO₃ oxida el I₂ a un electrófilo de yodo.'),
  E('rutas','PEP 2025, P1a: p-bromotolueno + 1) HNO₃/H₂SO₄ 2) Fe/HCl 3) CH₃COCl. Producto:',['–NHCOCH₃ en orto al CH₃ (amida)','–NHCOCH₃ en orto al Br','–COCH₃ unido al anillo (Friedel-Crafts)','–NH₂ libre en orto al CH₃'],'El CH₃ (activador) manda: el NO₂ entra en orto a él. Fe/HCl lo reduce a NH₂ y el CH₃COCl acila el N, no el anillo.'),
  E('rutas','PEP 2025, P1b: benceno + 1) CH₃CH₂CH₂Cl/AlCl₃ 2) SO₃/H₂SO₄ 3) CH₃COCl/AlCl₃ 4) H₃O⁺, calor. Producto:',['2-Isopropilacetofenona (orto)','4-Propilacetofenona','4-Isopropilacetofenona (para)','3-Isopropilacetofenona'],'Transposición a isopropilo; el SO₃H bloquea la posición para; la acilación entra en orto al iPr; el calor ácido quita el SO₃H.'),
  {tipo:'clasificar',tema:'directores',q:'Clasifica cada sustituyente en SEA',cajas:['Activador o/p','Desactivador o/p','Desactivador meta'],mostrar:6,
    items:[['–OH',0],['–OCH₃',0],['–NH₂',0],['–CH₃',0],['–NHCOCH₃',0],['–Cl',1],['–Br',1],['–NO₂',2],['–SO₃H',2],['–COCH₃',2],['–CN',2]],
    pista:'Par libre sobre el átomo unido al anillo → orto/para. Átomo con enlace múltiple a algo electronegativo → meta.',por:'Donadores (par libre o alquilo) activan y orientan o/p; halógenos desactivan pero orientan o/p; los grupos con C=O, N=O, S=O o C≡N desactivan y orientan meta.'},
  {tipo:'conectar',tema:'sea',q:'Conecta el reactivo con su electrófilo',
    pares:[['HNO₃ / H₂SO₄','NO₂⁺'],['Br₂ / FeBr₃','Br⁺ (Br–Br···FeBr₃)'],['RCOCl / AlCl₃','Ion acilio R–C≡O⁺'],['SO₃ / H₂SO₄','SO₃ (o HSO₃⁺)']],
    pista:'El ácido de Lewis o el H₂SO₄ fabrican un electrófilo más fuerte.',por:'Cada catalizador activa al reactivo hasta un electrófilo capaz de atacar al anillo aromático.'},
  {tipo:'conectar',tema:'diazonio',q:'Ar–N₂⁺ + reactivo → producto',
    pares:[['CuCl','Ar–Cl'],['CuCN','Ar–CN'],['HBF₄, calor','Ar–F'],['H₂O, calor','Ar–OH']],
    pista:'Sandmeyer usa sales de Cu(I); Schiemann, HBF₄.',por:'El N₂ es un excelente grupo saliente: se reemplaza por Cl, Br o CN (Cu(I)), F (Schiemann) u OH (agua caliente).'},
  {tipo:'conectar',tema:'diazonio',q:'Conecta la reacción con su nombre',
    pares:[['Ar–N₂⁺ + CuBr → Ar–Br','Sandmeyer'],['Ar–N₂⁺ + HBF₄, calor → Ar–F','Schiemann'],['Ar–CO–R + Zn(Hg)/HCl → Ar–CH₂–R','Clemmensen'],['Ftalimida + KOH + R–X → R–NH₂','Gabriel']],
    pista:'Dos son de diazonio, una reduce cetonas y otra fabrica aminas.',por:'Nombres que la PEP usa en los enunciados: conviene reconocerlos al tiro.'},
  {tipo:'ordenar',tema:'directores',q:'Reactividad frente a la SEA',extremos:['más lento','más rápido'],
    items:[['Nitrobenceno','–NO₂ desactivador fuerte','nitrobenceno'],['Clorobenceno','–Cl desactivador débil','clorobenceno'],['Tolueno','–CH₃ activador débil','tolueno'],['Fenol','–OH activador fuerte','fenol']],
    pista:'Más densidad electrónica en el anillo = ataca más rápido al electrófilo.',por:'Desactivadores fuertes < halógenos < alquilos < –OH/–OR/–NH₂.'},
  {tipo:'ruta',tema:'rutas',q:'PEP 2025, P2a: benzamida desde benceno',inicio:'Benceno',inicioMol:'benceno',meta:'Benzamida',metaMol:'benzamida',
    pasos:['CH₃Cl/AlCl₃','KMnO₄','SOCl₂','NH₃'],extra:['HNO₃/H₂SO₄','LiAlH₄','Zn(Hg)/HCl'],
    pista:'Pon un C en el anillo, oxídalo a ácido, actívalo y conviértelo en amida.',por:'Alquilación (tolueno) → KMnO₄ oxida a ácido benzoico → SOCl₂ da cloruro de ácido → NH₃ da la amida.'},
  {tipo:'ruta',tema:'rutas',q:'PEP 2025, P2b: 1-cloro-4-propilbenceno desde benceno',inicio:'Benceno',inicioMol:'benceno',meta:'1-Cloro-4-propilbenceno',metaMol:'clpropilbenceno',
    pasos:[['CH₃CH₂COCl/AlCl₃','Zn(Hg)/HCl','Cl₂/AlCl₃'],['Cl₂/AlCl₃','CH₃CH₂COCl/AlCl₃','Zn(Hg)/HCl']],extra:['CH₃CH₂CH₂Cl/AlCl₃','KMnO₄','HNO₃/H₂SO₄'],
    pista:'Si alquilas directo con cloruro de propilo, se transpone. Usa una acilación.',por:'Acilación (sin transposición) + Clemmensen dan propilbenceno; el Cl entra en para (los dos grupos son o/p). También vale clorar primero.'},
  {tipo:'ruta',tema:'rutas',q:'m-Bromoanilina desde benceno',inicio:'Benceno',inicioMol:'benceno',meta:'m-Bromoanilina',metaMol:'mbromoanilina',
    pasos:['HNO₃/H₂SO₄','Br₂/FeBr₃','Fe/HCl'],extra:['NaNO₂/HCl','NH₃','KMnO₄'],
    pista:'Necesitas un director meta mientras pones el Br.',por:'El –NO₂ dirige el Br a meta; recién al final se reduce a –NH₂. Si reduces antes, el –NH₂ manda a orto/para.'}
];

/* ===== 4. REY AMONIO: basicidad, Hofmann y repaso ===== */
P1.BANCO.rey = [
  {tipo:'elegir',tema:'resonancia',q:'¿Cuál es la base más fuerte en agua?',ops:['Bencilamina (Ph–CH₂–NH₂)','Anilina (Ph–NH₂)','Son iguales'],ok:0,
   por:'En anilina el par del N se deslocaliza en el anillo. El CH₂ sp³ de la bencilamina corta esa conjugación (pKaH ≈ 9,3 frente a 4,6).'},
  {tipo:'elegir',tema:'induccion',q:'¿Cuál es la base más fuerte?',ops:['CH₃CH₂NH₂','CF₃CH₂NH₂','Iguales'],ok:0,
   por:'CF₃ retira densidad por los enlaces σ (efecto inductivo): el par del N queda menos disponible para el H⁺.'},
  {tipo:'elegir',tema:'protonacion',q:'Metilamina + HCl → producto. ¿Carga formal del N?',ops:['+1','0','−1'],ok:0,
   por:'El N usa su par libre para formar el enlace N–H: queda con 4 enlaces y carga +1 (CH₃NH₃⁺ Cl⁻).'},
  {tipo:'elegir',tema:'induccion',q:'Si alejas el CF₃ un CH₂ más del nitrógeno, su efecto…',ops:['Se atenúa','Aumenta','No cambia'],ok:0,
   por:'El efecto inductivo decae rápido con la distancia: con un CH₂ más, la amina vuelve a ser más básica.'},
  {tipo:'elegir',tema:'hofmann',q:'Butan-2-amina + 1) CH₃I en exceso 2) Ag₂O, calor. Alqueno mayoritario:',ops:['But-1-eno','(E)-But-2-eno','(Z)-But-2-eno','Butano'],ok:0,
   por:'Eliminación de Hofmann: el grupo saliente –N(CH₃)₃⁺ es voluminoso y sale el H más accesible → alqueno MENOS sustituido.'},
  {tipo:'elegir',tema:'hofmann',q:'¿Para qué sirve el Ag₂O en la eliminación de Hofmann?',ops:['Cambia el I⁻ por OH⁻, la base que elimina','Oxida la amina','Es el electrófilo','Reduce el alqueno'],ok:0,
   por:'Ag₂O + H₂O precipita AgI y deja el hidróxido de amonio cuaternario; al calentar, el OH⁻ elimina (E2).'},
  {tipo:'flecha',tema:'protonacion'},
  {tipo:'ordenar',tema:'basicidad',q:'PEP 2025, P3: basicidad',extremos:['menos básica','más básica'],
    items:[['Piridina','N sp²','piridina'],['2-Metilpiridina','N sp² + CH₃ donador','metilpiridina'],['3-Cloropiperidina','N sp³ con Cl atractor','cloropiperidina'],['Piperidina','N sp³ libre','piperidina']],
    pista:'Primero separa sp² de sp³; después mira quién dona y quién retira densidad.',por:'Pauta 2025: d < b < c < a. Los N sp³ ganan a los sp²; el CH₃ sube un poco la basicidad y el Cl (efecto −I) la baja.'},
  {tipo:'ordenar',tema:'aromaticidad',q:'Basicidad',extremos:['menos básica','más básica'],
    items:[['Pirrol','pKaH ≈ 0,4','pirrol'],['Piridina','pKaH ≈ 5,2','piridina'],['Etilamina','pKaH ≈ 10,7']],
    pista:'Primero el par que sostiene un sexteto, luego el sp², al final el sp³ libre.',por:'Par comprometido en el sexteto < par sp² (más carácter s) < par sp³ libre.'},
  {tipo:'conectar',tema:'basicidad',q:'Conecta cada base con su pKaH',
    pares:[['Piperidina','11,1'],['NH₃','9,25'],['Piridina','5,2'],['Pirrol','0,4']],
    pista:'pKaH alto = base fuerte.',por:'sp³ alifática ≈ 10–11; NH₃ ≈ 9; piridina sp² ≈ 5; pirrol casi nada (par en el sexteto).'},
  {tipo:'conectar',tema:'resonancia',q:'Conecta cada caso con su explicación',
    pares:[['Anilina poco básica','Su par se deslocaliza en el anillo'],['Amida casi no básica','Su par conjuga con el C=O'],['Pirrol casi no básico','Su par es parte del sexteto aromático'],['Nitrilo poco básico','Su par está en un orbital sp']],
    pista:'En todos, el par libre está "ocupado" en algo distinto.',por:'Resonancia con el anillo, con el carbonilo, aromaticidad o hibridación: cuatro razones distintas para un par menos disponible.'},
  {tipo:'clasificar',tema:'basicidad',q:'Clasifica según su basicidad en agua',cajas:['Buena base (pKaH > 9)','Base débil (pKaH 4–6)','Casi nula (pKaH < 1)'],mostrar:6,
    items:[['Piperidina',0,'piperidina'],['Dimetilamina',0],['Ciclohexilamina',0,'ciclohexilamina'],['Anilina',1,'anilina'],['Piridina',1,'piridina'],['Pirrol',2,'pirrol'],['Acetamida',2]],
    pista:'sp³ libre → buena; deslocalizada o sp² → débil; par comprometido → casi nula.',por:'Aminas sp³ ~10–11; anilina 4,6 y piridina 5,2; pirrol y amidas casi no aceptan H⁺.'},
  {tipo:'ruta',tema:'hofmann',q:'Eliminación de Hofmann: de amina a alqueno',inicio:'R–CH₂CH₂–NH₂',meta:'R–CH=CH₂ (menos sustituido)',
    pasos:['CH₃I en exceso','Ag₂O, H₂O','Calor'],extra:['HCl','NaNO₂/HCl','LiAlH₄'],
    pista:'Haz del N un buen grupo saliente, cambia el contraión por una base y calienta.',por:'Metilación exhaustiva → sal cuaternaria; Ag₂O cambia I⁻ por OH⁻; el calor provoca la E2 hacia el alqueno menos sustituido.'}
];

})();
