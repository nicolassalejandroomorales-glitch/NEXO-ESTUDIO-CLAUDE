/* Generated once from the last published v9 data, then maintained as canonical content. */
const NEXO_DATA = {
  "subjects": [
    {
      "id": "organica",
      "name": "Orgánica II",
      "short": "ORG",
      "icon": "⌬",
      "color": "#ffbd59",
      "priority": 1,
      "description": "Mover electrones, justificar mecanismos y reconstruir síntesis.",
      "peps": [
        {
          "name": "PEP 1 · Aminas y aromáticos",
          "lessons": [
            "org-01",
            "org-02",
            "org-03",
            "org-04",
            "org-05"
          ]
        },
        {
          "name": "PEP 2 · Carbonilos",
          "lessons": [
            "org-06",
            "org-07",
            "org-08",
            "org-09"
          ]
        },
        {
          "name": "PEP 3 · Ácidos, enolatos y C–C",
          "lessons": [
            "org-10",
            "org-11",
            "org-12",
            "org-13"
          ]
        }
      ]
    },
    {
      "id": "analitica",
      "name": "Química Analítica",
      "short": "ANA",
      "icon": "⚗",
      "color": "#36e3d2",
      "priority": 2,
      "description": "Traducir muestras, alícuotas y reacciones a una decisión química.",
      "peps": [
        {
          "name": "PEP 1 · Datos y ácido–base",
          "lessons": [
            "ana-01",
            "ana-02",
            "ana-03"
          ]
        },
        {
          "name": "PEP 2 · Redox y complejometría",
          "lessons": [
            "ana-04",
            "ana-05",
            "ana-06"
          ]
        },
        {
          "name": "PEP 3 · Precipitación y gravimetría",
          "lessons": [
            "ana-07",
            "ana-08",
            "ana-09"
          ]
        }
      ]
    },
    {
      "id": "fisico",
      "name": "Fisicoquímica II",
      "short": "FQ",
      "icon": "∿",
      "color": "#8c7cff",
      "priority": 3,
      "description": "Elegir el modelo, conservar unidades y explicar el resultado físico.",
      "peps": [
        {
          "name": "PEP 1 · Equilibrios",
          "lessons": [
            "fq-01",
            "fq-02",
            "fq-03"
          ]
        },
        {
          "name": "PEP 2 · Superficies y transporte",
          "lessons": [
            "fq-04",
            "fq-05",
            "fq-06"
          ]
        },
        {
          "name": "PEP 3 · Cinética y fotoquímica",
          "lessons": [
            "fq-07",
            "fq-08",
            "fq-09"
          ]
        }
      ]
    },
    {
      "id": "fisio",
      "name": "Fisiopatología",
      "short": "FIS",
      "icon": "✚",
      "color": "#ff6d8d",
      "priority": 4,
      "description": "Construir cadenas causales y distinguir cuadros que se parecen.",
      "peps": [
        {
          "name": "PEP 1 · Nervioso, respiratorio y digestivo",
          "lessons": [
            "fis-01",
            "fis-02",
            "fis-06",
            "fis-09"
          ]
        },
        {
          "name": "PEP 2 · Endocrino y cardiovascular",
          "lessons": [
            "fis-03",
            "fis-04",
            "fis-05"
          ]
        },
        {
          "name": "PEP 2 · Renal",
          "lessons": [
            "fis-07",
            "fis-08"
          ]
        }
      ]
    }
  ],
  "lessons": {
    "org-01": {
      "subject": "organica",
      "title": "El lenguaje de los electrones",
      "duration": 35,
      "reward": 45,
      "central": "¿Cómo predigo qué enlace se forma sin memorizar el producto?",
      "map": [
        "Fuente de electrones",
        "Destino pobre en electrones",
        "Flecha curva",
        "Nuevo enlace + cargas"
      ],
      "visual": "<div class=\"electron-map\" aria-label=\"Mapa del movimiento electrónico\"><div class=\"chem-node source\"><small>fuente</small><strong>:O⁻</strong><span>par disponible</span></div><div class=\"flow-arrow\"><span>electrones</span>⟶</div><div class=\"chem-node target\"><small>destino</small><strong>CH₃—Br</strong><span>carbono δ+</span></div></div>",
      "explanation": "Una flecha curva no dice que un átomo viaje: muestra el desplazamiento de un par de electrones. Siempre debe nacer en un enlace o par libre y terminar donde ese par formará un enlace o quedará localizado.",
      "example": "En CH₃O⁻ + CH₃Br, el oxígeno tiene un par disponible. El carbono unido a Br es pobre en electrones. El par de O forma C—O y, al mismo tiempo, C—Br se rompe hacia Br.",
      "note": "Toda flecha nace en electrones. Antes de dibujarla identifica fuente, destino y enlace que debe romperse.",
      "dont": "No memorices “metóxido + bromometano = éter” como una foto aislada.",
      "question": "En la primera flecha de CH₃O⁻ + CH₃Br, ¿desde dónde debe comenzar?",
      "choices": [
        "Desde el átomo de carbono de CH₃Br",
        "Desde un par libre del oxígeno",
        "Desde el símbolo de carga negativa",
        "Desde el enlace C—Br hacia el oxígeno"
      ],
      "answer": 1,
      "feedback": "El par libre es el objeto que realmente se mueve. La carga te avisa que hay densidad electrónica, pero la flecha no nace del signo “−”.",
      "errorRule": "La flecha salió desde un átomo o una carga, no desde el par electrónico.",
      "foundations": [
        {
          "title": "Electrones antes que nombres",
          "body": "Un mecanismo describe redistribución de electrones. Identifica pares libres, enlaces π, cargas y enlaces polarizados antes de nombrar la reacción."
        },
        {
          "title": "Nucleófilo y electrófilo son roles",
          "body": "El nucleófilo aporta el par; el electrófilo recibe densidad. Una especie puede cambiar de rol según su compañero y el medio."
        },
        {
          "title": "La flecha conserva materia y carga",
          "body": "La punta indica dónde termina el par. Después de cada flecha revisa octetos, cargas formales y qué enlace tuvo que romperse."
        }
      ],
      "comparison": {
        "leftTitle": "Flecha curva",
        "left": "Mueve un par de electrones y explica formación o ruptura de enlaces.",
        "rightTitle": "Flecha de reacción",
        "right": "Conecta reactivos con productos; no describe el recorrido electrónico."
      },
      "application": "Antes de resolver una transformación completa, haz un inventario de fuentes y destinos. Esa pausa reduce productos dibujados por intuición.",
      "trap": "En pruebas reales se pierde el mecanismo desde la primera flecha: hacerla nacer del signo negativo o del átomo, en vez del par o enlace que se mueve."
    },
    "org-02": {
      "subject": "organica",
      "title": "Ácido–base y pKa como dirección",
      "duration": 40,
      "reward": 50,
      "central": "¿Hacia qué lado se favorece una transferencia de protón?",
      "map": [
        "Base usa un par",
        "Ácido pierde H⁺",
        "Se forman conjugados",
        "Favorece el ácido más débil"
      ],
      "visual": "<div class=\"balance-visual\"><div><small>reactivos</small><strong>B: + H—A</strong><span>base + ácido</span></div><div class=\"balance-beam\">⇌</div><div><small>productos</small><strong>B—H⁺ + A⁻</strong><span>ácidos/bases conjugados</span></div></div>",
      "explanation": "La base dona un par al protón; el enlace H—A devuelve sus electrones a A. Para estimar la dirección compara los ácidos de ambos lados: el equilibrio prefiere formar el ácido con pKa mayor, es decir, el ácido más débil.",
      "example": "HO⁻ desprotona un ácido carboxílico porque el ácido carboxílico (pKa cercano a 5) es mucho más fuerte que H₂O (pKa cercano a 16). Se forma la base conjugada estabilizada por resonancia.",
      "note": "El equilibrio favorece el lado cuyo ácido tiene mayor pKa. Dibuja siempre las bases conjugadas.",
      "dont": "No uses “más oxígenos = más ácido” sin revisar resonancia, inducción y átomo que porta la carga.",
      "question": "Si el ácido de los reactivos tiene pKa 5 y el ácido de los productos pKa 16, ¿qué lado se favorece?",
      "choices": [
        "Reactivos, porque 5 es menor",
        "Productos, porque contienen el ácido más débil",
        "Quedan exactamente 50:50",
        "No se puede razonar con pKa"
      ],
      "answer": 1,
      "feedback": "El equilibrio se desplaza hacia el ácido más débil: el de pKa 16. La diferencia de 11 unidades indica una preferencia enorme por productos.",
      "errorRule": "Se eligió el ácido más fuerte como producto favorecido; el equilibrio busca el ácido de mayor pKa.",
      "foundations": [
        {
          "title": "Brønsted y Lewis se conectan",
          "body": "Una base de Brønsted capta H⁺ porque, en lenguaje de Lewis, dona un par. El enlace H—A se rompe hacia A."
        },
        {
          "title": "Los conjugados difieren en un protón",
          "body": "Ácido y base conjugada deben conservar el esqueleto. Si cambias más átomos, ya no estás escribiendo el par conjugado."
        },
        {
          "title": "pKa mide la fuerza del ácido",
          "body": "Menor pKa significa ácido más fuerte. El equilibrio favorece formar el ácido y la base más débiles."
        },
        {
          "title": "La diferencia importa",
          "body": "De forma aproximada, K≈10^(pKa del ácido producto − pKa del ácido reactivo). Once unidades no son una preferencia pequeña."
        }
      ],
      "comparison": {
        "leftTitle": "Fuerza de ácido",
        "left": "Se compara con pKa: menor pKa, más fácil perder H⁺.",
        "rightTitle": "Dirección del equilibrio",
        "right": "Se decide buscando el lado que contiene el ácido de mayor pKa."
      },
      "application": "Este razonamiento decide si una base puede formar un enolato, desprotonar una amina protonada o dejar intacto un alcohol.",
      "trap": "Comparar las bases visualmente y olvidar comparar los ácidos de ambos lados invierte con frecuencia la dirección."
    },
    "org-03": {
      "subject": "organica",
      "title": "Aminas: ¿par libre disponible?",
      "duration": 45,
      "reward": 55,
      "central": "¿Por qué dos nitrógenos con par libre pueden tener basicidades tan distintas?",
      "map": [
        "Localiza el par",
        "Busca resonancia",
        "Imagina BH⁺",
        "Compara estabilización perdida"
      ],
      "visual": "<div class=\"availability-visual\"><div class=\"availability high\"><b>Etilamina</b><span>par localizado</span><strong>disponible</strong></div><div class=\"availability mid\"><b>Anilina</b><span>par conjugado con anillo</span><strong>menos disponible</strong></div><div class=\"availability low\"><b>Acetamida</b><span>par conjugado con C=O</span><strong>muy poco disponible</strong></div></div>",
      "explanation": "La basicidad depende de cuánto cuesta usar el par. En una amina alifática está localizado. En anilina se deslocaliza hacia el anillo. En una amida se acopla fuertemente con el carbonilo; protonar el N destruye esa estabilización.",
      "example": "Orden cualitativo habitual: etilamina > anilina >> acetamida. No se cuenta cuántas estructuras de resonancia hay: se pregunta qué estabilización pierde la especie al protonarse.",
      "note": "Compara disponibilidad del par y estabilidad de B frente a BH⁺.",
      "dont": "No concluyas que todo nitrógeno neutro es una base semejante.",
      "question": "¿Cuál tiene el par de nitrógeno menos disponible para captar H⁺?",
      "choices": [
        "Etilamina",
        "Anilina",
        "Acetamida",
        "Las tres por igual"
      ],
      "answer": 2,
      "feedback": "En la acetamida el par del N estabiliza el carbonilo por resonancia. Usarlo para unirse a H⁺ sacrifica una estabilización especialmente importante.",
      "errorRule": "Se comparó el tipo de átomo, pero no la deslocalización del par libre.",
      "foundations": [
        {
          "title": "Basicidad no es “tener nitrógeno”",
          "body": "La pregunta es cuán disponible está el par y cuán estable queda la especie protonada. El mismo átomo puede comportarse muy distinto."
        },
        {
          "title": "Resonancia puede secuestrar el par",
          "body": "En anilina el par conversa con el anillo; en una amida conversa con el carbonilo, una interacción especialmente estabilizante."
        },
        {
          "title": "Inducción también modifica densidad",
          "body": "Grupos atractores retiran densidad y suelen disminuir basicidad; grupos donadores pueden aumentarla. El efecto cae con la distancia."
        },
        {
          "title": "Basicidad y nucleofilicidad no son sinónimos",
          "body": "Basicidad es equilibrio con H⁺; nucleofilicidad es rapidez de ataque y depende además de solvente, impedimento y polarizabilidad."
        }
      ],
      "comparison": {
        "leftTitle": "Anilina",
        "left": "Par deslocalizado hacia un anillo aromático; es menos básico que una amina alifática.",
        "rightTitle": "Amida",
        "right": "Par fuertemente conjugado con C=O; protonar N sacrifica mucha estabilización."
      },
      "application": "Para ordenar aminas, dibuja B y BH⁺. Compara la estabilización que existe antes y después de captar H⁺, no el número bruto de resonantes.",
      "trap": "Contar estructuras de resonancia sin preguntar si son importantes, equivalentes o si se pierden al protonar."
    },
    "org-04": {
      "subject": "organica",
      "title": "Aromaticidad: el circuito completo",
      "duration": 40,
      "reward": 50,
      "central": "¿Cuándo un anillo obtiene estabilización aromática?",
      "map": [
        "Cíclico",
        "Plano",
        "Conjugado",
        "4n+2 electrones π"
      ],
      "visual": "<div class=\"ring-check\"><span>cíclico</span><i>+</i><span>plano</span><i>+</i><span>conjugado</span><i>+</i><span>4n+2 π</span></div>",
      "explanation": "Hückel se aplica solo después de verificar un circuito cíclico, plano y completamente conjugado. Si falta un orbital p en el camino, contar electrones no rescata al sistema.",
      "example": "Benceno posee seis electrones π: 4(1)+2. Un anillo conjugado con cuatro electrones π sería antiaromático si permanece plano; si pierde conjugación o planitud, será no aromático.",
      "note": "Primero geometría y conjugación; al final cuenta electrones π.",
      "dont": "No apliques 4n+2 a cualquier molécula con dobles enlaces.",
      "question": "Un anillo cíclico con 6 e⁻ π pero un carbono sp³ interrumpe el circuito. ¿Cómo se clasifica?",
      "choices": [
        "Aromático",
        "Antiaromático",
        "No aromático",
        "Siempre catiónico"
      ],
      "answer": 2,
      "feedback": "El carbono sp³ corta la conjugación continua. Sin circuito completo, no se llega siquiera a aplicar la regla 4n+2.",
      "errorRule": "Se contó electrones antes de comprobar conjugación continua.",
      "foundations": [
        {
          "title": "Primero existe un circuito",
          "body": "Debe ser cíclico, aproximadamente plano y tener un orbital p disponible en cada átomo del recorrido."
        },
        {
          "title": "Después se cuentan electrones π",
          "body": "Un doble enlace aporta dos; un par libre o una carga puede aportar según el orbital que ocupe. No cuentes enlaces σ."
        },
        {
          "title": "4n+2 estabiliza",
          "body": "Con 2, 6, 10… electrones π el circuito puede ser aromático. Con 4n, si sigue plano y conjugado, es antiaromático."
        },
        {
          "title": "No aromático no significa antiaromático",
          "body": "Si se rompe planitud o conjugación, el sistema evita el circuito desestabilizante y se clasifica como no aromático."
        }
      ],
      "comparison": {
        "leftTitle": "Antiaromático",
        "left": "Cíclico, plano, conjugado y con 4n electrones π: el circuito existe y desestabiliza.",
        "rightTitle": "No aromático",
        "right": "Falta al menos un requisito previo; por eso Hückel no se aplica."
      },
      "application": "Usa una lista de control fija y marca sobre el anillo cuál orbital p aporta cada átomo antes de sumar electrones.",
      "trap": "Ver “seis electrones” y responder aromático aunque un carbono sp³ haya cortado la conjugación."
    },
    "org-05": {
      "subject": "organica",
      "title": "SEA: activación y orientación",
      "duration": 50,
      "reward": 60,
      "central": "¿Dónde ataca un anillo sustituido y por qué?",
      "map": [
        "Generar E⁺",
        "Ataque del anillo",
        "Complejo σ",
        "Recuperar aromaticidad"
      ],
      "visual": "<div class=\"sea-visual\"><strong>anillo π</strong><span>→ E⁺ →</span><strong>complejo σ</strong><span>→ −H⁺ →</span><strong>aromático</strong></div>",
      "explanation": "La sustitución electrofílica aromática sacrifica temporalmente aromaticidad para formar C—E y después la recupera eliminando H⁺. El sustituyente cambia tanto la rapidez como la estabilidad relativa de los complejos σ orto, meta y para.",
      "example": "Un grupo donador por resonancia suele activar y dirigir orto/para; un grupo fuertemente atractor suele desactivar y dirigir meta. Los halógenos son la excepción clásica: desactivan, pero dirigen orto/para.",
      "note": "Justifica el director comparando complejos σ, no recitando una lista.",
      "dont": "No confundas “activar/desactivar” con “orto/para/meta”: son dos preguntas distintas.",
      "question": "¿Qué paso devuelve la aromaticidad al final de una SEA?",
      "choices": [
        "Captura de un electrón",
        "Pérdida de H⁺ del complejo σ",
        "Entrada de un nucleófilo",
        "Ruptura completa del anillo"
      ],
      "answer": 1,
      "feedback": "Una base retira H⁺; los electrones del enlace C—H reconstruyen el sistema π aromático.",
      "errorRule": "No se identificó la recuperación de aromaticidad como fuerza impulsora final.",
      "foundations": [
        {
          "title": "La SEA comienza creando E⁺",
          "body": "El reactivo y el catalizador generan o activan un electrófilo suficientemente fuerte para reaccionar con el anillo."
        },
        {
          "title": "El paso costoso rompe aromaticidad",
          "body": "El anillo dona un par π, forma C—E y queda como complejo σ. Comparar su estabilización predice orientación."
        },
        {
          "title": "Activación y dirección son dos ejes",
          "body": "Un sustituyente puede acelerar o frenar la reacción y, por otra razón relacionada, favorecer orto/para o meta."
        },
        {
          "title": "La desprotonación cierra el ciclo",
          "body": "Una base quita H⁺ y el enlace C—H reconstruye el sistema π. Recuperar aromaticidad impulsa el cierre."
        }
      ],
      "comparison": {
        "leftTitle": "Donador por resonancia",
        "left": "Suele estabilizar complejos σ orto/para y activar el anillo.",
        "rightTitle": "Atractor por resonancia",
        "right": "Suele desestabilizar orto/para, desactivar y dirigir meta. Halógenos son la excepción clásica."
      },
      "application": "Para un anillo sustituido, dibuja sólo los complejos σ que cambian entre orto, meta y para. La diferencia relevante aparece donde queda la carga positiva.",
      "trap": "Memorizar una tabla de directores sin separar rapidez de orientación impide justificar excepciones y anillos con más de un sustituyente."
    },
    "org-06": {
      "subject": "organica",
      "title": "Carbonilo: mapa de polarización",
      "duration": 30,
      "reward": 35,
      "central": "¿Por qué el carbono del C=O es electrofílico?",
      "map": [
        "Dipolo C=O",
        "Ataque Nu:",
        "Intermedio tetraédrico",
        "Protonación"
      ],
      "visual": "<div class=\"concept-chain\"><span>Dipolo C=O</span><i>›</i><span>Ataque Nu:</span><i>›</i><span>Intermedio tetraédrico</span><i>›</i><span>Protonación</span></div>",
      "explanation": "El oxígeno retira densidad y deja al carbono parcialmente positivo.",
      "example": "El nucleófilo debe atacar al carbono del carbonilo.",
      "note": "El nucleófilo debe atacar al carbono del carbonilo.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Por qué el carbono del C=O es electrofílico?",
      "choices": [
        "Al oxígeno δ−",
        "Al carbono δ+",
        "A cualquier H",
        "Al grupo alquilo"
      ],
      "answer": 1,
      "feedback": "Al carbono δ+ es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "org-07": {
      "subject": "organica",
      "title": "Adición nucleofílica",
      "duration": 30,
      "reward": 35,
      "central": "¿Qué cambia cuando Nu: se une al carbonilo?",
      "map": [
        "Atacar C",
        "Mover π a O",
        "Protonar O",
        "Producto tetraédrico"
      ],
      "visual": "<div class=\"concept-chain\"><span>Atacar C</span><i>›</i><span>Mover π a O</span><i>›</i><span>Protonar O</span><i>›</i><span>Producto tetraédrico</span></div>",
      "explanation": "La flecha del enlace π C=O se mueve hacia el oxígeno mientras se forma C—Nu.",
      "example": "Se forma un centro tetraédrico.",
      "note": "Se forma un centro tetraédrico.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué cambia cuando Nu: se une al carbonilo?",
      "choices": [
        "C permanece trigonal",
        "Se rompe todo C—O",
        "C pasa a tetraédrico",
        "Nu nunca forma enlace"
      ],
      "answer": 2,
      "feedback": "C pasa a tetraédrico es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "org-08": {
      "subject": "organica",
      "title": "Iminas, enaminas y enlaces C–C",
      "duration": 30,
      "reward": 35,
      "central": "¿Qué producto nitrogenado depende del tipo de amina?",
      "map": [
        "Adición",
        "Carbinolamina",
        "Pérdida de agua",
        "Imina o enamina"
      ],
      "visual": "<div class=\"concept-chain\"><span>Adición</span><i>›</i><span>Carbinolamina</span><i>›</i><span>Pérdida de agua</span><i>›</i><span>Imina o enamina</span></div>",
      "explanation": "Amina primaria suele dar imina; secundaria, enamina.",
      "example": "La pérdida de agua requiere pasos ácido–base.",
      "note": "La pérdida de agua requiere pasos ácido–base.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué producto nitrogenado depende del tipo de amina?",
      "choices": [
        "Primaria → imina",
        "Primaria → alcano",
        "Secundaria → amida",
        "Todas → alcohol"
      ],
      "answer": 0,
      "feedback": "Primaria → imina es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "org-09": {
      "subject": "organica",
      "title": "Oxidación, reducción y síntesis PEP 2",
      "duration": 30,
      "reward": 35,
      "central": "¿Cómo reconoces el cambio de nivel de oxidación?",
      "map": [
        "Cuenta C—O",
        "Cuenta C—H",
        "Elige reactivo",
        "Controla selectividad"
      ],
      "visual": "<div class=\"concept-chain\"><span>Cuenta C—O</span><i>›</i><span>Cuenta C—H</span><i>›</i><span>Elige reactivo</span><i>›</i><span>Controla selectividad</span></div>",
      "explanation": "Más enlaces C—O suele indicar oxidación; más C—H, reducción.",
      "example": "Primero define la transformación.",
      "note": "Primero define la transformación.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Cómo reconoces el cambio de nivel de oxidación?",
      "choices": [
        "Memorizar color",
        "Contar carbonos",
        "Ignorar producto",
        "Comparar C—O y C—H"
      ],
      "answer": 3,
      "feedback": "Comparar C—O y C—H es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "org-10": {
      "subject": "organica",
      "title": "Ácidos carboxílicos",
      "duration": 30,
      "reward": 35,
      "central": "¿Qué estabiliza al carboxilato?",
      "map": [
        "Desprotonar",
        "Dos oxígenos",
        "Resonancia",
        "Acidez"
      ],
      "visual": "<div class=\"concept-chain\"><span>Desprotonar</span><i>›</i><span>Dos oxígenos</span><i>›</i><span>Resonancia</span><i>›</i><span>Acidez</span></div>",
      "explanation": "La carga se distribuye entre dos oxígenos equivalentes.",
      "example": "La resonancia explica la acidez.",
      "note": "La resonancia explica la acidez.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué estabiliza al carboxilato?",
      "choices": [
        "Hibridación sp³",
        "Resonancia equivalente",
        "Un carbocatión",
        "Aromaticidad"
      ],
      "answer": 1,
      "feedback": "Resonancia equivalente es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "org-11": {
      "subject": "organica",
      "title": "Derivados de ácido y sustitución acílica",
      "duration": 30,
      "reward": 35,
      "central": "¿Por qué algunos derivados reaccionan más rápido?",
      "map": [
        "Ataque",
        "Intermedio",
        "Grupo saliente",
        "Reformar C=O"
      ],
      "visual": "<div class=\"concept-chain\"><span>Ataque</span><i>›</i><span>Intermedio</span><i>›</i><span>Grupo saliente</span><i>›</i><span>Reformar C=O</span></div>",
      "explanation": "Depende de electrofilia y capacidad del grupo saliente.",
      "example": "El intermedio colapsa y reconstruye C=O.",
      "note": "El intermedio colapsa y reconstruye C=O.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Por qué algunos derivados reaccionan más rápido?",
      "choices": [
        "Nunca hay intermedio",
        "Solo tamaño",
        "Capacidad del saliente",
        "Todos iguales"
      ],
      "answer": 2,
      "feedback": "Capacidad del saliente es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "org-12": {
      "subject": "organica",
      "title": "Enoles y enolatos",
      "duration": 30,
      "reward": 35,
      "central": "¿Qué hace especial al carbono alfa?",
      "map": [
        "Base",
        "Quitar Hα",
        "Resonancia",
        "Nuevo C—C"
      ],
      "visual": "<div class=\"concept-chain\"><span>Base</span><i>›</i><span>Quitar Hα</span><i>›</i><span>Resonancia</span><i>›</i><span>Nuevo C—C</span></div>",
      "explanation": "El enolato reparte carga entre oxígeno y carbono alfa.",
      "example": "El carbono alfa puede ser nucleófilo.",
      "note": "El carbono alfa puede ser nucleófilo.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué hace especial al carbono alfa?",
      "choices": [
        "Puede ser nucleófilo",
        "El O desaparece",
        "No hay resonancia",
        "Siempre rompe C=O"
      ],
      "answer": 0,
      "feedback": "Puede ser nucleófilo es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "org-13": {
      "subject": "organica",
      "title": "Aldol, Michael y Robinson",
      "duration": 30,
      "reward": 35,
      "central": "¿Cómo reconoces el enlace nuevo en retrosíntesis?",
      "map": [
        "Localiza C—C",
        "Desconecta",
        "Donor",
        "Aceptor"
      ],
      "visual": "<div class=\"concept-chain\"><span>Localiza C—C</span><i>›</i><span>Desconecta</span><i>›</i><span>Donor</span><i>›</i><span>Aceptor</span></div>",
      "explanation": "Marca primero el enlace C—C que debió formarse.",
      "example": "Robinson combina Michael y aldol.",
      "note": "Robinson combina Michael y aldol.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Cómo reconoces el enlace nuevo en retrosíntesis?",
      "choices": [
        "Por color",
        "Por solvente",
        "Por contar O",
        "Por el C—C estratégico"
      ],
      "answer": 3,
      "feedback": "Por el C—C estratégico es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "ana-01": {
      "subject": "analitica",
      "title": "El análisis químico y sus errores",
      "duration": 40,
      "reward": 45,
      "central": "¿Qué se mide realmente?",
      "map": [
        "Muestra",
        "Analito",
        "Preparación",
        "Resultado"
      ],
      "visual": "<div class=\"process-visual\"><div><b>MUESTRA</b><span>analito + matriz</span></div><i>→</i><div><b>PREPARAR</b><span>conservar y separar</span></div><i>→</i><div><b>MEDIR</b><span>señal + calibración</span></div><i>→</i><div><b>INFORMAR</b><span>valor + unidad</span></div></div>",
      "explanation": "Separar muestra, matriz y analito evita calcular la especie equivocada.",
      "example": "Escribe analito y unidad final.",
      "note": "Escribe analito y unidad final.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué se mide realmente?",
      "choices": [
        "El vaso",
        "El analito definido",
        "El indicador",
        "La bureta"
      ],
      "answer": 1,
      "feedback": "El analito definido es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica.",
      "foundations": [
        {
          "title": "Muestra, matriz y analito",
          "body": "La muestra es lo recibido, la matriz es todo lo que lo rodea y el analito es la especie o cantidad que se quiere informar."
        },
        {
          "title": "El resultado nace antes del instrumento",
          "body": "Muestreo, conservación, preparación y calibración pueden dominar el error aunque la lectura final sea precisa."
        },
        {
          "title": "Precisión y exactitud no son lo mismo",
          "body": "Precisión describe dispersión entre réplicas; exactitud, cercanía a un valor de referencia. Puede existir una sin la otra."
        },
        {
          "title": "La unidad define la respuesta",
          "body": "Concentración en el matraz, masa en la muestra y porcentaje del producto no son intercambiables. Escribe la magnitud final al comenzar."
        }
      ],
      "comparison": {
        "leftTitle": "Error aleatorio",
        "left": "Aumenta dispersión y suele hacerse visible entre réplicas.",
        "rightTitle": "Error sistemático",
        "right": "Desplaza resultados en una dirección; repetir muchas veces no lo elimina."
      },
      "application": "Antes de calcular, escribe una frase: “determinaré ___ en ___ y lo informaré en ___”. Esa frase dirige todas las conversiones.",
      "trap": "Entregar la concentración de la solución preparada cuando la pregunta solicita contenido en la muestra original."
    },
    "ana-02": {
      "subject": "analitica",
      "title": "Volumetría: de la bureta a la muestra",
      "duration": 50,
      "reward": 55,
      "central": "¿Cómo vuelvo desde la bureta a la muestra original?",
      "map": [
        "Muestra",
        "Dilución",
        "Alícuota",
        "Titulación"
      ],
      "visual": "<div class=\"vessel-visual\"><div class=\"sample-vial\"><b>muestra</b><span>m₀</span></div><i>→</i><div class=\"flask\"><b>matraz</b><span>V total</span></div><i>→</i><div class=\"pipette\"><b>alícuota</b><span>V aliq</span></div><i>→</i><div class=\"erlen\"><b>erlenmeyer</b><span>+ titulante</span></div></div>",
      "explanation": "Cada traslado cambia el volumen, no crea moles.",
      "example": "Dibuja recipientes primero.",
      "note": "Dibuja recipientes primero.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Cómo vuelvo desde la bureta a la muestra original?",
      "choices": [
        "Adivinar factor",
        "Sumar volúmenes",
        "Seguir transferencias",
        "Ignorar alícuota"
      ],
      "answer": 2,
      "feedback": "Seguir transferencias es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica.",
      "foundations": [
        {
          "title": "Una valoración necesita reacción útil",
          "body": "Debe ser rápida, conocida, suficientemente completa y con estequiometría clara."
        },
        {
          "title": "Equivalencia no es color",
          "body": "En equivalencia reaccionaron cantidades estequiométricas. El punto final es la señal experimental; su diferencia es error de indicador."
        },
        {
          "title": "Los moles viajan con la alícuota",
          "body": "Diluir cambia concentración, no los moles contenidos en el matraz. Extraer una alícuota sí toma sólo una fracción de ellos."
        },
        {
          "title": "La bureta informa titulante",
          "body": "Primero convierte volumen gastado a moles del titulante; luego usa la reacción para llegar a moles del analito."
        }
      ],
      "comparison": {
        "leftTitle": "Matraz aforado",
        "left": "Fija un volumen total y permite conocer el factor de dilución.",
        "rightTitle": "Pipeta aforada",
        "right": "Extrae una fracción exacta del matraz; no contiene toda la muestra."
      },
      "application": "Dibuja recipientes conectados: muestra → matraz → alícuota → erlenmeyer ← bureta. Anota bajo cada uno sólo volumen, concentración y moles pertinentes.",
      "trap": "Multiplicar o dividir por el factor de alícuota al revés porque se inició la regla de tres sin dibujar qué fracción llegó al erlenmeyer."
    },
    "ana-03": {
      "subject": "analitica",
      "title": "Curvas de titulación ácido-base",
      "duration": 50,
      "reward": 55,
      "central": "¿Qué especie domina en cada zona?",
      "map": [
        "Inicio",
        "Buffer",
        "Equivalencia",
        "Exceso"
      ],
      "visual": "<div class=\"curve-visual\"><div class=\"curve-axis\"><span>pH ↑</span><i></i><b>volumen de titulante →</b></div><div class=\"curve-zones\"><span>inicio</span><span>tampón<br><small>pH≈pKa</small></span><span>salto<br><small>equivalencia</small></span><span>exceso</span></div></div>",
      "explanation": "La curva nace de los equilibrios.",
      "example": "Distingue equivalencia de punto final.",
      "note": "Distingue equivalencia de punto final.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué especie domina en cada zona?",
      "choices": [
        "Siempre idénticos",
        "No hay equilibrio",
        "Solo color",
        "Equivalencia estequiométrica"
      ],
      "answer": 3,
      "feedback": "Equivalencia estequiométrica es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica.",
      "foundations": [
        {
          "title": "Cada zona es un problema distinto",
          "body": "Inicio, tampón, equivalencia y exceso contienen especies dominantes diferentes; por eso no existe una fórmula única para toda la curva."
        },
        {
          "title": "Un tampón contiene el par",
          "body": "Ácido débil y base conjugada resisten cambios porque consumen pequeñas adiciones. Henderson–Hasselbalch expresa ese cociente, no reemplaza el equilibrio."
        },
        {
          "title": "En equivalencia queda el conjugado",
          "body": "Valorar ácido débil con base fuerte deja A⁻, que se hidroliza y eleva el pH sobre 7."
        },
        {
          "title": "El indicador debe caer en el salto",
          "body": "Su intervalo de viraje debe coincidir con la zona vertical, no necesariamente estar centrado en pH 7."
        }
      ],
      "comparison": {
        "leftTitle": "Semiequivalencia",
        "left": "[HA]=[A⁻], por lo que pH=pKa en una valoración de ácido débil.",
        "rightTitle": "Equivalencia",
        "right": "Los moles reaccionaron estequiométricamente y el pH depende de la especie conjugada restante."
      },
      "application": "Antes de calcular pH, marca la zona y escribe la especie dominante. Sólo después elige balance, tampón, hidrólisis o exceso.",
      "trap": "Usar Henderson–Hasselbalch en equivalencia, cuando ya no quedan cantidades apreciables de ambos miembros del tampón."
    },
    "ana-04": {
      "subject": "analitica",
      "title": "Balance redox",
      "duration": 30,
      "reward": 35,
      "central": "¿Dónde fueron los electrones?",
      "map": [
        "Oxidación",
        "Reducción",
        "Electrones",
        "Medio"
      ],
      "visual": "<div class=\"concept-chain\"><span>Oxidación</span><i>›</i><span>Reducción</span><i>›</i><span>Electrones</span><i>›</i><span>Medio</span></div>",
      "explanation": "Las semirreacciones conservan masa y carga.",
      "example": "Iguala electrones antes de sumar.",
      "note": "Iguala electrones antes de sumar.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Dónde fueron los electrones?",
      "choices": [
        "Semirreacciones",
        "Regla de tres",
        "Indicador primero",
        "Volumen final"
      ],
      "answer": 0,
      "feedback": "Semirreacciones es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "ana-05": {
      "subject": "analitica",
      "title": "Permanganimetría y potencial",
      "duration": 30,
      "reward": 35,
      "central": "¿Es espontánea la reacción elegida?",
      "map": [
        "E°",
        "Nernst",
        "Estequiometría",
        "Punto final"
      ],
      "visual": "<div class=\"concept-chain\"><span>E°</span><i>›</i><span>Nernst</span><i>›</i><span>Estequiometría</span><i>›</i><span>Punto final</span></div>",
      "explanation": "El potencial indica dirección.",
      "example": "No mezcles electrones con moles.",
      "note": "No mezcles electrones con moles.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Es espontánea la reacción elegida?",
      "choices": [
        "Por nombre",
        "Comparando potenciales",
        "Por densidad",
        "Sin balancear"
      ],
      "answer": 1,
      "feedback": "Comparando potenciales es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "ana-06": {
      "subject": "analitica",
      "title": "EDTA y constante condicional",
      "duration": 30,
      "reward": 35,
      "central": "¿Por qué importa el pH?",
      "map": [
        "Ligando",
        "Protonación",
        "Kf condicional",
        "Indicador"
      ],
      "visual": "<div class=\"concept-chain\"><span>Ligando</span><i>›</i><span>Protonación</span><i>›</i><span>Kf condicional</span><i>›</i><span>Indicador</span></div>",
      "explanation": "El pH cambia la fracción activa de EDTA.",
      "example": "Usa Kf condicional.",
      "note": "Usa Kf condicional.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Por qué importa el pH?",
      "choices": [
        "Hace oro",
        "Elimina agua",
        "Cambia EDTA activo",
        "No influye"
      ],
      "answer": 2,
      "feedback": "Cambia EDTA activo es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "ana-07": {
      "subject": "analitica",
      "title": "Solubilidad y Kps",
      "duration": 30,
      "reward": 35,
      "central": "¿Cuándo comienza a precipitar?",
      "map": [
        "Kps",
        "Qsp",
        "Ion común",
        "Umbral"
      ],
      "visual": "<div class=\"concept-chain\"><span>Kps</span><i>›</i><span>Qsp</span><i>›</i><span>Ion común</span><i>›</i><span>Umbral</span></div>",
      "explanation": "Compara producto iónico con Kps.",
      "example": "Qsp > Kps precipita.",
      "note": "Qsp > Kps precipita.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Cuándo comienza a precipitar?",
      "choices": [
        "Q=0",
        "Q<K",
        "Q=1",
        "Qsp>Kps"
      ],
      "answer": 3,
      "feedback": "Qsp>Kps es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "ana-08": {
      "subject": "analitica",
      "title": "Mohr, Volhard y Fajans",
      "duration": 30,
      "reward": 35,
      "central": "¿Qué cambia entre los métodos?",
      "map": [
        "Directa",
        "Retroceso",
        "Indicador",
        "Medio"
      ],
      "visual": "<div class=\"concept-chain\"><span>Directa</span><i>›</i><span>Retroceso</span><i>›</i><span>Indicador</span><i>›</i><span>Medio</span></div>",
      "explanation": "El indicador y medio definen el método.",
      "example": "Identifica qué se valora directamente.",
      "note": "Identifica qué se valora directamente.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué cambia entre los métodos?",
      "choices": [
        "Solo nombre",
        "Estrategia",
        "Nada",
        "Masa molar"
      ],
      "answer": 1,
      "feedback": "Estrategia es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "ana-09": {
      "subject": "analitica",
      "title": "Gravimetría",
      "duration": 30,
      "reward": 35,
      "central": "¿Cómo conecta el precipitado con el analito?",
      "map": [
        "Precipitar",
        "Lavar",
        "Secar",
        "Factor"
      ],
      "visual": "<div class=\"concept-chain\"><span>Precipitar</span><i>›</i><span>Lavar</span><i>›</i><span>Secar</span><i>›</i><span>Factor</span></div>",
      "explanation": "La masa medida es del producto aislado.",
      "example": "Convierte al analito.",
      "note": "Convierte al analito.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Cómo conecta el precipitado con el analito?",
      "choices": [
        "Factor gravimétrico",
        "Promedio",
        "pH neutro",
        "Beer"
      ],
      "answer": 0,
      "feedback": "Factor gravimétrico es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "fq-01": {
      "subject": "fisico",
      "title": "Equilibrio químico: ξ, Q, K y ΔG",
      "duration": 45,
      "reward": 50,
      "central": "¿Hacia dónde avanza el sistema?",
      "map": [
        "Q actual",
        "K equilibrio",
        "Dirección",
        "ΔG"
      ],
      "visual": "<div class=\"qk-visual\"><div><small>Q &lt; K</small><strong>reactivos → productos</strong><span>ΔrG &lt; 0</span></div><i>Q = K<br><b>equilibrio</b></i><div><small>Q &gt; K</small><strong>productos → reactivos</strong><span>ΔrG inverso &lt; 0</span></div></div>",
      "explanation": "Q describe ahora; K el equilibrio.",
      "example": "Q<K favorece productos.",
      "note": "Q<K favorece productos.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Hacia dónde avanza el sistema?",
      "choices": [
        "Q siempre K",
        "K cambia con c",
        "Q<K hacia productos",
        "ΔG no importa"
      ],
      "answer": 2,
      "feedback": "Q<K hacia productos es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica.",
      "foundations": [
        {
          "title": "K describe un estado",
          "body": "A temperatura fija, K expresa la relación de actividades cuando el sistema llegó a equilibrio; no dice por sí sola qué tan rápido llega."
        },
        {
          "title": "Q describe el instante actual",
          "body": "Tiene la misma forma algebraica que K, pero usa la composición presente. Compararlos indica la dirección espontánea."
        },
        {
          "title": "ΔrG conecta composición y dirección",
          "body": "ΔrG=ΔrG°+RT ln Q. En equilibrio ΔrG=0 y aparece ΔrG°=−RT ln K."
        },
        {
          "title": "Las actividades evitan unidades falsas",
          "body": "Termodinámicamente K se construye con actividades adimensionales; concentración o presión son aproximaciones según el modelo."
        }
      ],
      "comparison": {
        "leftTitle": "Q<K",
        "left": "Faltan productos respecto del equilibrio; el avance directo disminuye G.",
        "rightTitle": "Q>K",
        "right": "Sobran productos; favorece el avance inverso hasta Q=K."
      },
      "application": "Calcula Q con la reacción tal como está escrita, compara sin redondear y recién entonces asigna el signo de ΔrG.",
      "trap": "Decir que K cambia al agregar reactivo. Cambia Q y la composición de equilibrio; K sólo cambia si cambia la temperatura."
    },
    "fq-02": {
      "subject": "fisico",
      "title": "Actividad y fuerza iónica",
      "duration": 45,
      "reward": 50,
      "central": "¿Cuándo la concentración deja de bastar?",
      "map": [
        "Iones",
        "Fuerza I",
        "γ",
        "Actividad"
      ],
      "visual": "<div class=\"ion-visual\"><div class=\"ion-cloud\"><span class=\"cation\">2+</span><i>−</i><i>−</i><i>−</i><i>−</i></div><div class=\"formula-stack\"><strong>I = ½ Σcᵢzᵢ²</strong><span>carga mayor → aporte mayor</span><strong>aᵢ = γᵢcᵢ/c°</strong></div></div>",
      "explanation": "Interacciones iónicas cambian la actividad efectiva.",
      "example": "a=γc.",
      "note": "a=γc.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Cuándo la concentración deja de bastar?",
      "choices": [
        "Gas ideal",
        "Solución iónica no ideal",
        "Vacío",
        "Nunca"
      ],
      "answer": 1,
      "feedback": "Solución iónica no ideal es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica.",
      "foundations": [
        {
          "title": "Los iones sienten su entorno",
          "body": "La concentración cuenta partículas; la actividad corrige qué tan efectivas resultan por interacciones electrostáticas."
        },
        {
          "title": "La carga pesa al cuadrado",
          "body": "I=½Σcᵢzᵢ². Un ion divalente aporta cuatro veces por mol que uno monovalente."
        },
        {
          "title": "Actividad es modelo más realidad",
          "body": "aᵢ=γᵢcᵢ/c°. En dilución ideal γ tiende a 1; al crecer fuerza iónica suele alejarse."
        },
        {
          "title": "Debye–Hückel tiene dominio",
          "body": "La ley límite sirve en soluciones suficientemente diluidas. Usarla fuera de rango produce precisión aparente, no validez."
        }
      ],
      "comparison": {
        "leftTitle": "Concentración",
        "left": "Cantidad analítica por volumen; es directamente preparable.",
        "rightTitle": "Actividad",
        "right": "Concentración efectiva termodinámica; depende además del coeficiente γ."
      },
      "application": "Para una mezcla, lista cada ion con concentración y carga. Calcula cada cᵢzᵢ² antes de sumar y aplicar ½.",
      "trap": "Olvidar el cuadrado de la carga o usar la concentración formal de la sal sin convertirla en concentraciones iónicas."
    },
    "fq-03": {
      "subject": "fisico",
      "title": "Nernst y celdas",
      "duration": 50,
      "reward": 55,
      "central": "¿Cómo cambia E fuera del estándar?",
      "map": [
        "Semirreacciones",
        "E°",
        "Q",
        "Nernst"
      ],
      "visual": "<div class=\"cell-visual\"><div><small>ÁNODO</small><strong>oxidación</strong><span>e⁻ salen</span></div><div class=\"wire\"><b>e⁻ →</b><i>puente salino</i></div><div><small>CÁTODO</small><strong>reducción</strong><span>e⁻ llegan</span></div><footer>E = E° − (RT/nF) ln Q</footer></div>",
      "explanation": "Q corrige el potencial estándar.",
      "example": "Balancea electrones antes de n.",
      "note": "Balancea electrones antes de n.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Cómo cambia E fuera del estándar?",
      "choices": [
        "Volumen",
        "Borrar Q",
        "Signo al azar",
        "n balanceado"
      ],
      "answer": 3,
      "feedback": "n balanceado es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica.",
      "foundations": [
        {
          "title": "Separar oxidación y reducción",
          "body": "Las semirreacciones hacen visible quién entrega y quién recibe electrones. Deben conservar masa y carga."
        },
        {
          "title": "Potencial es intensivo",
          "body": "Los E° no se multiplican por coeficientes estequiométricos. Se combinan como E°celda=E°cátodo−E°ánodo."
        },
        {
          "title": "E y ΔG comparten signo físico",
          "body": "ΔG=−nFE. Una celda galvánica espontánea en el sentido escrito tiene E positivo y ΔG negativo."
        },
        {
          "title": "Nernst corrige la composición",
          "body": "E=E°−(RT/nF)lnQ. Q debe construirse desde la reacción global balanceada."
        }
      ],
      "comparison": {
        "leftTitle": "E°",
        "left": "Potencial bajo condiciones estándar definidas.",
        "rightTitle": "E",
        "right": "Potencial en la composición y temperatura reales; incluye el término de Q."
      },
      "application": "Balancea electrones, escribe la reacción global, decide cátodo y ánodo, y sólo entonces calcula Q y n.",
      "trap": "Multiplicar E° por el número de electrones o insertar en Q especies sólidas puras, que tienen actividad aproximada 1."
    },
    "fq-04": {
      "subject": "fisico",
      "title": "Tensión superficial y capilaridad",
      "duration": 30,
      "reward": 35,
      "central": "¿Qué costo tiene crear superficie?",
      "map": [
        "Interfaz",
        "γ",
        "Trabajo",
        "Curvatura"
      ],
      "visual": "<div class=\"concept-chain\"><span>Interfaz</span><i>›</i><span>γ</span><i>›</i><span>Trabajo</span><i>›</i><span>Curvatura</span></div>",
      "explanation": "Crear área exige trabajo proporcional a γ.",
      "example": "Dibuja fuerzas.",
      "note": "Dibuja fuerzas.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué costo tiene crear superficie?",
      "choices": [
        "Trabajo superficial",
        "Kps",
        "pKa",
        "Fusión"
      ],
      "answer": 0,
      "feedback": "Trabajo superficial es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "fq-05": {
      "subject": "fisico",
      "title": "Adsorción e isotermas",
      "duration": 30,
      "reward": 35,
      "central": "¿Qué significa la meseta?",
      "map": [
        "Sitios",
        "Cobertura",
        "Presión",
        "Saturación"
      ],
      "visual": "<div class=\"concept-chain\"><span>Sitios</span><i>›</i><span>Cobertura</span><i>›</i><span>Presión</span><i>›</i><span>Saturación</span></div>",
      "explanation": "Langmuir supone monocapa y sitios equivalentes.",
      "example": "La meseta es saturación.",
      "note": "La meseta es saturación.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué significa la meseta?",
      "choices": [
        "Sin superficie",
        "Reacción nuclear",
        "Saturación",
        "T=0"
      ],
      "answer": 2,
      "feedback": "Saturación es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "fq-06": {
      "subject": "fisico",
      "title": "Difusión y transporte",
      "duration": 30,
      "reward": 35,
      "central": "¿Qué impulsa el flujo?",
      "map": [
        "Gradiente",
        "Área",
        "Distancia",
        "D"
      ],
      "visual": "<div class=\"concept-chain\"><span>Gradiente</span><i>›</i><span>Área</span><i>›</i><span>Distancia</span><i>›</i><span>D</span></div>",
      "explanation": "Fick conecta flujo con gradiente.",
      "example": "El signo menos va hacia menor concentración.",
      "note": "El signo menos va hacia menor concentración.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué impulsa el flujo?",
      "choices": [
        "Masa molar",
        "Gradiente",
        "Color",
        "Presión estándar"
      ],
      "answer": 1,
      "feedback": "Gradiente es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "fq-07": {
      "subject": "fisico",
      "title": "Velocidad y ley integrada",
      "duration": 30,
      "reward": 35,
      "central": "¿Qué orden explica los datos?",
      "map": [
        "Velocidad",
        "Orden",
        "Gráfico",
        "Vida media"
      ],
      "visual": "<div class=\"concept-chain\"><span>Velocidad</span><i>›</i><span>Orden</span><i>›</i><span>Gráfico</span><i>›</i><span>Vida media</span></div>",
      "explanation": "El orden se infiere de la dependencia con concentración.",
      "example": "Revisa unidades de k.",
      "note": "Revisa unidades de k.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué orden explica los datos?",
      "choices": [
        "Nombre",
        "Solo T",
        "Intuición",
        "Ajuste y unidades"
      ],
      "answer": 3,
      "feedback": "Ajuste y unidades es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "fq-08": {
      "subject": "fisico",
      "title": "Mecanismos y estado estacionario",
      "duration": 30,
      "reward": 35,
      "central": "¿Cómo elimino un intermediario?",
      "map": [
        "Pasos",
        "Intermediario",
        "dI/dt≈0",
        "Ley global"
      ],
      "visual": "<div class=\"concept-chain\"><span>Pasos</span><i>›</i><span>Intermediario</span><i>›</i><span>dI/dt≈0</span><i>›</i><span>Ley global</span></div>",
      "explanation": "Formación y consumo casi se compensan.",
      "example": "No es equilibrio.",
      "note": "No es equilibrio.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Cómo elimino un intermediario?",
      "choices": [
        "Formación≈consumo",
        "Concentración cero",
        "Detenida",
        "K=1"
      ],
      "answer": 0,
      "feedback": "Formación≈consumo es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "fq-09": {
      "subject": "fisico",
      "title": "Enzimas y fotoquímica",
      "duration": 30,
      "reward": 35,
      "central": "¿Qué rutas compiten?",
      "map": [
        "Estado",
        "Rutas",
        "Constantes",
        "Rendimiento"
      ],
      "visual": "<div class=\"concept-chain\"><span>Estado</span><i>›</i><span>Rutas</span><i>›</i><span>Constantes</span><i>›</i><span>Rendimiento</span></div>",
      "explanation": "El rendimiento depende de velocidades competidoras.",
      "example": "Interpreta la fracción.",
      "note": "Interpreta la fracción.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué rutas compiten?",
      "choices": [
        "Iguales",
        "Nunca compiten",
        "Ruta/suma de rutas",
        "Solo color"
      ],
      "answer": 2,
      "feedback": "Ruta/suma de rutas es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "fis-01": {
      "subject": "fisio",
      "title": "Motricidad y sistema nervioso vegetativo",
      "duration": 45,
      "reward": 50,
      "central": "¿Cómo un daño inicial se amplifica?",
      "map": [
        "Daño primario",
        "Excitotoxicidad",
        "Edema",
        "↑ PIC"
      ],
      "visual": "<div class=\"causal-visual brain\"><span>lesión / isquemia</span><i>↓ ATP</i><span>↑ glutamato</span><i>↑ Ca²⁺</i><span>edema</span><i>↑ PIC</i><span>↓ perfusión</span></div>",
      "explanation": "Isquemia, glutamato, Ca²⁺ y edema amplifican el daño.",
      "example": "Construye causa → cambio → signo.",
      "note": "Construye causa → cambio → signo.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Cómo un daño inicial se amplifica?",
      "choices": [
        "Más GABA",
        "Exceso de glutamato",
        "Menor Ca²⁺",
        "Más perfusión"
      ],
      "answer": 1,
      "feedback": "Exceso de glutamato es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica.",
      "foundations": [
        {
          "title": "Lesión primaria y secundaria",
          "body": "El impacto o isquemia inicial ocurre primero; luego aparecen procesos potencialmente amplificadores como falla energética, excitotoxicidad, edema e inflamación."
        },
        {
          "title": "Sin ATP fallan gradientes",
          "body": "La Na⁺/K⁺-ATPasa pierde función, la membrana se despolariza y entran Na⁺ y agua. También se altera el control de Ca²⁺."
        },
        {
          "title": "El mediador clave es glutamato",
          "body": "La liberación excesiva y menor recaptación activan receptores excitatorios; aumenta Ca²⁺ intracelular y se activan enzimas dañinas."
        },
        {
          "title": "El cráneo es un volumen limitado",
          "body": "Aumentar tejido, sangre o LCR eleva la presión intracraneal cuando se agota la compensación y puede reducir perfusión cerebral."
        }
      ],
      "comparison": {
        "leftTitle": "Daño primario",
        "left": "Mecánico o vascular inmediato; difícil de revertir una vez ocurrido.",
        "rightTitle": "Daño secundario",
        "right": "Cascada posterior y amplificadora; ofrece puntos de vigilancia y tratamiento."
      },
      "application": "Conecta el punto farmacológico sólo después del mecanismo: reducir demanda, edema o excitación tiene sentido según qué eslabón se intenta limitar.",
      "trap": "Atribuir excitotoxicidad a exceso de GABA. El protagonista excitatorio es glutamato; GABA es principalmente inhibidor."
    },
    "fis-02": {
      "subject": "fisio",
      "title": "Lesión cerebral aguda: isquemia, edema y PIC",
      "duration": 40,
      "reward": 45,
      "central": "¿Qué compartimento acumula agua?",
      "map": [
        "Barrera",
        "Extracelular",
        "Falla ATP",
        "Intracelular"
      ],
      "visual": "<div class=\"compartment-visual\"><div><b>VASOGÉNICO</b><span class=\"barrier broken\">barrera abierta</span><i>H₂O + proteína → espacio extracelular</i></div><div><b>CITOTÓXICO</b><span class=\"cell-swollen\">célula hinchada</span><i>falla ATP → Na⁺ + H₂O dentro</i></div></div>",
      "explanation": "Vasogénico: barrera; citotóxico: bombas.",
      "example": "Dibuja dos compartimentos.",
      "note": "Dibuja dos compartimentos.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué compartimento acumula agua?",
      "choices": [
        "Idénticos",
        "Solo extracelular",
        "Mecanismos distintos",
        "Sin agua"
      ],
      "answer": 2,
      "feedback": "Mecanismos distintos es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica.",
      "foundations": [
        {
          "title": "Vasogénico: falla la barrera",
          "body": "Aumenta permeabilidad vascular y salen proteínas y agua al espacio extracelular, sobre todo en sustancia blanca."
        },
        {
          "title": "Citotóxico: falla la célula",
          "body": "La pérdida de ATP detiene bombas iónicas; Na⁺ y agua entran a neuronas y glía con barrera inicialmente conservada."
        },
        {
          "title": "Pueden coexistir",
          "body": "En isquemia domina temprano el edema celular y más tarde puede sumarse disfunción de la barrera."
        },
        {
          "title": "Ambos ocupan volumen",
          "body": "Aunque el compartimento difiera, ambos pueden aumentar presión intracraneal y comprometer perfusión."
        }
      ],
      "comparison": {
        "leftTitle": "Vasogénico",
        "left": "Agua extracelular por barrera permeable; proteínas acompañan el filtrado.",
        "rightTitle": "Citotóxico",
        "right": "Agua intracelular por falla energética y de bombas; células se hinchan."
      },
      "application": "Dibuja capilar, espacio extracelular y célula. Mueve el agua en la dirección correspondiente y recién después asocia causas clínicas.",
      "trap": "Usar “edema cerebral” como una sola entidad y perder el compartimento donde está el agua y el mecanismo que la llevó allí."
    },
    "fis-03": {
      "subject": "fisio",
      "title": "Ejes endocrinos",
      "duration": 45,
      "reward": 50,
      "central": "¿La falla es primaria o central?",
      "map": [
        "Hormona final",
        "Trófica",
        "Feedback",
        "Lugar"
      ],
      "visual": "<div class=\"axis-visual\"><span>HIPOTÁLAMO<small>liberadora</small></span><i>↓</i><span>HIPÓFISIS<small>trófica</small></span><i>↓</i><span>ÓRGANO<small>hormona final</small></span><b>↖ feedback negativo</b></div>",
      "explanation": "Comparar ambas hormonas localiza la falla.",
      "example": "Primero mecanismo.",
      "note": "Primero mecanismo.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿La falla es primaria o central?",
      "choices": [
        "Comparar ambas",
        "Solo síntomas",
        "Ignorar feedback",
        "Memorizar color"
      ],
      "answer": 0,
      "feedback": "Comparar ambas es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica.",
      "foundations": [
        {
          "title": "El eje tiene jerarquía",
          "body": "Hipotálamo estimula hipófisis; la hormona trófica estimula el órgano blanco; la hormona final produce efectos periféricos."
        },
        {
          "title": "La hormona final retroalimenta",
          "body": "Al subir, inhibe niveles superiores. Al bajar, libera ese freno si hipotálamo e hipófisis funcionan."
        },
        {
          "title": "Falla primaria está en el órgano",
          "body": "Hormona final baja con hormona trófica alta: la hipófisis intenta compensar un órgano que no responde."
        },
        {
          "title": "Falla central pierde el estímulo",
          "body": "Hormona final baja con hormona trófica baja o inapropiadamente normal localiza el problema en hipófisis o hipotálamo."
        }
      ],
      "comparison": {
        "leftTitle": "Primaria",
        "left": "Órgano blanco falla; hormona final baja y trófica sube por pérdida de feedback.",
        "rightTitle": "Secundaria/central",
        "right": "Falta señal trófica; ambas están bajas o la trófica es inadecuadamente normal."
      },
      "application": "Para cada fármaco u hormona exógena, marca en qué nivel entra y predice qué señales superiores disminuirán por feedback.",
      "trap": "Mirar una hormona aislada. La localización exige comparar hormona trófica y final como pareja."
    },
    "fis-04": {
      "subject": "fisio",
      "title": "Hipertensión y compensación",
      "duration": 30,
      "reward": 35,
      "central": "¿Qué sostiene la presión elevada?",
      "map": [
        "Gasto",
        "Resistencia",
        "Riñón",
        "SRAA"
      ],
      "visual": "<div class=\"concept-chain\"><span>Gasto</span><i>›</i><span>Resistencia</span><i>›</i><span>Riñón</span><i>›</i><span>SRAA</span></div>",
      "explanation": "Presión depende de gasto y resistencia.",
      "example": "Fármacos después del mecanismo.",
      "note": "Fármacos después del mecanismo.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué sostiene la presión elevada?",
      "choices": [
        "Frecuencia",
        "Volumen",
        "Nada",
        "Gasto × resistencia"
      ],
      "answer": 3,
      "feedback": "Gasto × resistencia es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "fis-05": {
      "subject": "fisio",
      "title": "Isquemia e insuficiencia cardíaca",
      "duration": 30,
      "reward": 35,
      "central": "¿Cuándo daña la compensación?",
      "map": [
        "↓ gasto",
        "Simpático",
        "Retención",
        "Remodelado"
      ],
      "visual": "<div class=\"concept-chain\"><span>↓ gasto</span><i>›</i><span>Simpático</span><i>›</i><span>Retención</span><i>›</i><span>Remodelado</span></div>",
      "explanation": "La compensación ayuda al inicio y carga al corazón después.",
      "example": "Separa corto y largo plazo.",
      "note": "Separa corto y largo plazo.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Cuándo daña la compensación?",
      "choices": [
        "Nunca compensa",
        "Retiene y vasoconstriñe",
        "Elimina volumen",
        "Baja demanda"
      ],
      "answer": 1,
      "feedback": "Retiene y vasoconstriñe es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "fis-06": {
      "subject": "fisio",
      "title": "Respiratorio: ventilación e intercambio gaseoso",
      "duration": 30,
      "reward": 35,
      "central": "¿Qué patrón mecánico cambia?",
      "map": [
        "Resistencia",
        "Distensibilidad",
        "Volúmenes",
        "Intercambio"
      ],
      "visual": "<div class=\"concept-chain\"><span>Resistencia</span><i>›</i><span>Distensibilidad</span><i>›</i><span>Volúmenes</span><i>›</i><span>Intercambio</span></div>",
      "explanation": "Obstructivo dificulta flujo; restrictivo expansión.",
      "example": "Compara mecanismo.",
      "note": "Compara mecanismo.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué patrón mecánico cambia?",
      "choices": [
        "Sinónimos",
        "Solo edad",
        "Flujo vs expansión",
        "Sin cambio"
      ],
      "answer": 2,
      "feedback": "Flujo vs expansión es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "fis-07": {
      "subject": "fisio",
      "title": "Nefrítico vs nefrótico",
      "duration": 30,
      "reward": 35,
      "central": "¿Inflamación o pérdida masiva de proteína?",
      "map": [
        "Glomérulo",
        "Hematuria",
        "Proteinuria",
        "Edema"
      ],
      "visual": "<div class=\"concept-chain\"><span>Glomérulo</span><i>›</i><span>Hematuria</span><i>›</i><span>Proteinuria</span><i>›</i><span>Edema</span></div>",
      "explanation": "Nefrítico: inflamación; nefrótico: proteinuria intensa.",
      "example": "Relaciona lesión y signo.",
      "note": "Relaciona lesión y signo.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Inflamación o pérdida masiva de proteína?",
      "choices": [
        "Patrón urinario",
        "Nombre",
        "Ignorar edema",
        "Solo presión"
      ],
      "answer": 0,
      "feedback": "Patrón urinario es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "fis-08": {
      "subject": "fisio",
      "title": "IRA y electrolitos",
      "duration": 30,
      "reward": 35,
      "central": "¿Qué nace de perder filtración?",
      "map": [
        "↓ TFG",
        "Retención",
        "K⁺/H⁺",
        "Sobrecarga"
      ],
      "visual": "<div class=\"concept-chain\"><span>↓ TFG</span><i>›</i><span>Retención</span><i>›</i><span>K⁺/H⁺</span><i>›</i><span>Sobrecarga</span></div>",
      "explanation": "Se retienen solutos, agua, potasio y ácidos.",
      "example": "Deduce desde la función.",
      "note": "Deduce desde la función.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué nace de perder filtración?",
      "choices": [
        "Más filtración",
        "Menos volumen",
        "Alcalosis segura",
        "Retención"
      ],
      "answer": 3,
      "feedback": "Retención es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    },
    "fis-09": {
      "subject": "fisio",
      "title": "Digestivo: barrera, secreción, motilidad e hígado",
      "duration": 30,
      "reward": 35,
      "central": "¿Qué función explica el síntoma?",
      "map": [
        "Barrera",
        "Ácido",
        "Motilidad",
        "Absorción"
      ],
      "visual": "<div class=\"concept-chain\"><span>Barrera</span><i>›</i><span>Ácido</span><i>›</i><span>Motilidad</span><i>›</i><span>Absorción</span></div>",
      "explanation": "Un síntoma puede tener varios mecanismos.",
      "example": "No saltes a diagnóstico.",
      "note": "No saltes a diagnóstico.",
      "dont": "No marques dominio por reconocer una frase recién leída.",
      "question": "¿Qué función explica el síntoma?",
      "choices": [
        "Color",
        "Función alterada",
        "Azar",
        "Sin mecanismo"
      ],
      "answer": 1,
      "feedback": "Función alterada es la opción que conserva la cadena causal o química del bloque.",
      "errorRule": "Se eligió una etiqueta sin reconstruir el mecanismo que la justifica."
    }
  },
  "companions": [],
  "rewards": [],
  "exercises": [
    {
      "id": "org-b1",
      "subject": "organica",
      "level": "basic",
      "title": "Flecha que sí representa electrones",
      "prompt": "En CH₃O⁻ + CH₃Br, ¿cuál es la primera flecha correcta?",
      "choices": [
        "Del signo − al Br",
        "Del par libre de O al carbono unido a Br",
        "Del carbono al oxígeno",
        "Del enlace C—Br al carbono"
      ],
      "answer": 1,
      "why": "El par libre del oxígeno es la fuente y el carbono polarizado es el destino. Otra flecha simultánea lleva el enlace C—Br hacia Br.",
      "lookFor": "La flecha debe nacer en electrones, no en el átomo ni en el signo de carga.",
      "hint": "Marca primero fuente, destino y enlace que se rompe."
    },
    {
      "id": "org-b2",
      "subject": "organica",
      "level": "basic",
      "title": "Dirección ácido–base",
      "prompt": "Un ácido HA de pKa 5 reacciona con B⁻ y forma HB de pKa 16. ¿Qué lado se favorece?",
      "choices": [
        "Reactivos",
        "Productos",
        "Mitad y mitad",
        "No se puede predecir"
      ],
      "answer": 1,
      "why": "El equilibrio favorece el lado que contiene el ácido más débil, el de mayor pKa: HB.",
      "lookFor": "Compara los ácidos a ambos lados; no compares números sin identificar especies.",
      "hint": "Mayor pKa = ácido más débil."
    },
    {
      "id": "org-b3",
      "subject": "organica",
      "level": "basic",
      "title": "¿Se aplica Hückel?",
      "prompt": "Un anillo tiene 6 electrones π, pero un carbono sp³ interrumpe la conjugación. ¿Qué es?",
      "choices": [
        "Aromático",
        "Antiaromático",
        "No aromático",
        "Aromático sólo en ácido"
      ],
      "answer": 2,
      "why": "Sin conjugación cíclica continua no corresponde aplicar 4n+2. El sistema es no aromático.",
      "lookFor": "Primero verifica ciclo, planitud y conjugación; cuenta electrones al final.",
      "hint": "Un número correcto no compensa un circuito roto."
    },
    {
      "id": "org-i1",
      "subject": "organica",
      "level": "intermediate",
      "title": "Disponibilidad del par libre",
      "prompt": "¿Cuál nitrógeno es menos básico: etilamina, anilina o acetamida?",
      "choices": [
        "Etilamina",
        "Anilina",
        "Acetamida",
        "Son equivalentes"
      ],
      "answer": 2,
      "why": "El par de la amida está fuertemente conjugado con el carbonilo; protonar N sacrifica esa estabilización.",
      "lookFor": "Dibuja B y BH⁺ y pregunta qué resonancia se pierde al protonar.",
      "hint": "No cuentes estructuras: compara estabilización útil."
    },
    {
      "id": "org-i2",
      "subject": "organica",
      "level": "intermediate",
      "title": "Director y velocidad no son lo mismo",
      "prompt": "¿Qué descripción de Cl en clorobenceno es correcta?",
      "choices": [
        "Activa y dirige meta",
        "Desactiva y dirige orto/para",
        "Activa y dirige orto/para",
        "Desactiva y dirige meta"
      ],
      "answer": 1,
      "why": "El efecto inductivo del halógeno desactiva, pero su donación por resonancia estabiliza los complejos σ orto/para.",
      "lookFor": "Separa dos preguntas: rapidez relativa y posición favorecida.",
      "hint": "Los halógenos son la excepción clásica."
    },
    {
      "id": "org-i3",
      "subject": "organica",
      "level": "intermediate",
      "title": "Ataque al carbonilo",
      "prompt": "Cuando CN⁻ ataca una cetona, ¿qué cambio electrónico ocurre a la vez?",
      "choices": [
        "El enlace π C=O se desplaza hacia O",
        "Se rompe un enlace C—C",
        "O dona su par a CN⁻",
        "El carbono conserva geometría trigonal"
      ],
      "answer": 0,
      "why": "Formar C—CN exige aliviar el octeto del carbono: el par π pasa al oxígeno y aparece un intermedio tetraédrico.",
      "lookFor": "Revisa octeto y geometría después de cada flecha.",
      "hint": "Si formas un enlace en C, algo debe ocurrir con el π."
    },
    {
      "id": "org-p1",
      "subject": "organica",
      "level": "pep",
      "title": "PEP 1 · Orden de basicidad",
      "prompt": "Ordena de mayor a menor basicidad: ciclohexilamina, anilina, acetanilida.",
      "choices": [
        "Acetanilida > anilina > ciclohexilamina",
        "Ciclohexilamina > anilina > acetanilida",
        "Anilina > ciclohexilamina > acetanilida",
        "Las tres iguales"
      ],
      "answer": 1,
      "why": "El par está localizado en la amina alifática, conjugado moderadamente con el arilo en anilina y fuertemente con C=O en la amida.",
      "lookFor": "Justifica cada comparación por disponibilidad del par y costo de protonación.",
      "hint": "Piensa dónde “trabaja” actualmente el par libre."
    },
    {
      "id": "org-p2",
      "subject": "organica",
      "level": "pep",
      "title": "PEP 2 · Amina secundaria + cetona",
      "prompt": "Una cetona reacciona con una amina secundaria en catálisis ácida y pierde agua. ¿Producto característico?",
      "choices": [
        "Imina",
        "Enamina",
        "Amida",
        "Ácido carboxílico"
      ],
      "answer": 1,
      "why": "La amina secundaria no posee un segundo H en N para formar la imina neutra; la desprotonación alfa conduce a enamina.",
      "lookFor": "Distingue primaria/secundaria antes de dibujar el producto.",
      "hint": "Primaria suele dar imina; secundaria, enamina."
    },
    {
      "id": "org-p3",
      "subject": "organica",
      "level": "pep",
      "title": "PEP 3 · Firma de Robinson",
      "prompt": "¿Qué secuencia define mejor una anulación de Robinson?",
      "choices": [
        "Claisen y reducción",
        "Michael y aldol intramolecular con deshidratación",
        "Grignard y oxidación",
        "SEA y sustitución nucleofílica"
      ],
      "answer": 1,
      "why": "La adición conjugada crea el esqueleto 1,5-dicarbonílico y la aldol intramolecular cierra el anillo; luego suele deshidratar.",
      "lookFor": "Busca primero el enlace Michael y luego el cierre aldólico.",
      "hint": "Reconoce la lógica de dos enlaces C—C, no sólo el producto final."
    },
    {
      "id": "ana-b1",
      "subject": "analitica",
      "level": "basic",
      "title": "Primer paso de una titulación",
      "prompt": "Antes de usar M·V, ¿qué se debe escribir?",
      "choices": [
        "La reacción balanceada",
        "El color final",
        "La marca de bureta",
        "El promedio"
      ],
      "answer": 0,
      "why": "La reacción fija la proporción molar; sin ella, asumir 1:1 puede arruinar todo el cálculo.",
      "lookFor": "Escribe analito, reacción y unidad final antes de números.",
      "hint": "La estequiometría manda sobre la regla de tres."
    },
    {
      "id": "ana-b2",
      "subject": "analitica",
      "level": "basic",
      "title": "Equivalencia frente a punto final",
      "prompt": "¿Cuál afirmación es correcta?",
      "choices": [
        "Son siempre exactamente iguales",
        "Equivalencia es estequiométrica; punto final es la señal observada",
        "Punto final ocurre antes por definición",
        "Equivalencia depende del color"
      ],
      "answer": 1,
      "why": "La equivalencia es una condición química. El punto final es la señal experimental del indicador o instrumento y puede tener error.",
      "lookFor": "Separa fenómeno químico de señal de medición.",
      "hint": "Uno pertenece a la reacción; el otro, a cómo la detectas."
    },
    {
      "id": "ana-b3",
      "subject": "analitica",
      "level": "basic",
      "title": "Producto iónico y precipitación",
      "prompt": "Si Qsp supera Kps, el sistema está…",
      "choices": [
        "Insaturado y disuelve",
        "Sobresaturado y precipita",
        "Exactamente en equilibrio",
        "Sin iones"
      ],
      "answer": 1,
      "why": "Qsp>Kps significa que hay más producto iónico del compatible con equilibrio; se forma sólido hasta reducirlo.",
      "lookFor": "Compara Qsp con Kps antes de aplicar fórmulas de solubilidad.",
      "hint": "Mayor que el límite → precipita."
    },
    {
      "id": "ana-i1",
      "subject": "analitica",
      "level": "intermediate",
      "title": "Alícuota que representa una fracción",
      "prompt": "Se diluyen 10,00 mL de muestra a 100,0 mL y se titulan 20,00 mL de esa dilución. Esa alícuota representa…",
      "choices": [
        "20% de la muestra original",
        "2% de la muestra original",
        "50% de la muestra original",
        "Toda la muestra original"
      ],
      "answer": 0,
      "why": "La dilución conserva los moles originales en 100 mL; tomar 20 mL selecciona 20/100 de esos moles.",
      "lookFor": "Dibuja los dos recipientes y escribe la fracción transferida.",
      "hint": "Diluir no cambia moles totales; alicuotar sí selecciona una parte."
    },
    {
      "id": "ana-i2",
      "subject": "analitica",
      "level": "intermediate",
      "title": "Moles desde la bureta",
      "prompt": "25,00 mL de NaOH 0,1000 M neutralizan un ácido monoprótico. ¿Moles de ácido en el matraz?",
      "choices": [
        "2,500 mol",
        "0,2500 mol",
        "2,500×10⁻³ mol",
        "4,000×10⁻² mol"
      ],
      "answer": 2,
      "why": "n=0,1000 mol/L × 0,02500 L=2,500×10⁻³ mol. La relación es 1:1 sólo porque el ácido es monoprótico.",
      "lookFor": "Convierte mL a L y recién después usa la razón estequiométrica.",
      "hint": "0,02500 L, no 25 L."
    },
    {
      "id": "ana-i3",
      "subject": "analitica",
      "level": "intermediate",
      "title": "Por qué importa el pH en EDTA",
      "prompt": "Al disminuir mucho el pH, una titulación con EDTA puede debilitarse porque…",
      "choices": [
        "Aumenta siempre Y⁴⁻",
        "El EDTA se protona y baja su fracción ligante activa",
        "El metal desaparece",
        "Kf deja de existir"
      ],
      "answer": 1,
      "why": "La constante condicional incorpora la fracción de EDTA en forma capaz de coordinar; en medio ácido esa fracción disminuye.",
      "lookFor": "Distingue Kf intrínseca de Kf condicional.",
      "hint": "El pH cambia la especie disponible, no la definición de Kf."
    },
    {
      "id": "ana-p1",
      "subject": "analitica",
      "level": "pep",
      "title": "PEP · Reconstruir la muestra",
      "prompt": "Una alícuota de 25,00 mL tomada de un matraz de 250,0 mL contiene 0,400 mmol de analito. ¿Cuántos mmol había en el matraz?",
      "choices": [
        "0,0400",
        "0,400",
        "4,00",
        "40,0"
      ],
      "answer": 2,
      "why": "La alícuota es 1/10 del matraz, de modo que el total es diez veces 0,400 mmol.",
      "lookFor": "Deshaz el factor de alícuota en la dirección correcta.",
      "hint": "Pregunta qué fracción del recipiente grande tomaste."
    },
    {
      "id": "ana-p2",
      "subject": "analitica",
      "level": "pep",
      "title": "PEP · Gravimetría",
      "prompt": "Se pesa BaSO₄, pero se solicita masa de SO₄²⁻. ¿Qué operación conecta ambos?",
      "choices": [
        "Usar sólo la masa molar de Ba",
        "Multiplicar m(BaSO₄) por M(SO₄)/M(BaSO₄)",
        "Dividir por el volumen de lavado",
        "Restar la masa del crisol sin tarar"
      ],
      "answer": 1,
      "why": "La estequiometría es 1:1 en moles y el cociente de masas molares es el factor gravimétrico.",
      "lookFor": "Identifica qué se pesó y qué se debe reportar.",
      "hint": "La balanza mide precipitado; el informe pide analito."
    },
    {
      "id": "ana-p3",
      "subject": "analitica",
      "level": "pep",
      "title": "PEP · Exactitud y precisión",
      "prompt": "Tres réplicas son muy cercanas entre sí, pero todas están lejos del valor certificado. Son…",
      "choices": [
        "Exactas y precisas",
        "Precisas, no exactas",
        "Exactas, no precisas",
        "Ni siquiera repetibles"
      ],
      "answer": 1,
      "why": "La dispersión baja indica precisión; el sesgo respecto de la referencia revela falta de exactitud.",
      "lookFor": "Compara primero entre réplicas y después contra la referencia.",
      "hint": "Cercanía mutua y cercanía a la verdad son preguntas distintas."
    },
    {
      "id": "fq-b1",
      "subject": "fisico",
      "level": "basic",
      "title": "Q frente a K",
      "prompt": "Si Q<K para una reacción, ¿en qué dirección avanza espontáneamente hacia el equilibrio?",
      "choices": [
        "Hacia reactivos",
        "Hacia productos",
        "No cambia",
        "K debe disminuir"
      ],
      "answer": 1,
      "why": "Faltan productos respecto de la composición de equilibrio; la reacción avanza hacia la derecha.",
      "lookFor": "Q describe el estado actual; K depende de la temperatura.",
      "hint": "Compara antes de usar logaritmos."
    },
    {
      "id": "fq-b2",
      "subject": "fisico",
      "level": "basic",
      "title": "Actividad efectiva",
      "prompt": "La relación correcta para una especie iónica es…",
      "choices": [
        "a=γc",
        "a=c/γ siempre",
        "a=Kc",
        "a no tiene relación con c"
      ],
      "answer": 0,
      "why": "La actividad corrige la concentración mediante el coeficiente de actividad; según la convención puede incluir el estado estándar.",
      "lookFor": "Anota unidades y convención, no sólo símbolos.",
      "hint": "γ mide la desviación de idealidad."
    },
    {
      "id": "fq-b3",
      "subject": "fisico",
      "level": "basic",
      "title": "Signo de Fick",
      "prompt": "El signo menos en J=−D·dC/dx indica que…",
      "choices": [
        "D es negativo",
        "El flujo va hacia menor concentración",
        "La concentración siempre aumenta",
        "No existe difusión"
      ],
      "answer": 1,
      "why": "D es positivo; el signo expresa que el transporte espontáneo se opone al gradiente de concentración.",
      "lookFor": "Interpreta la dirección antes de reemplazar números.",
      "hint": "El flujo baja la desigualdad que lo impulsa."
    },
    {
      "id": "fq-i1",
      "subject": "fisico",
      "level": "intermediate",
      "title": "Nernst necesita n correcto",
      "prompt": "¿De dónde sale n en la ecuación de Nernst de una celda?",
      "choices": [
        "Del número de soluciones",
        "De los electrones de la reacción global balanceada",
        "Del coeficiente de actividad",
        "De la temperatura"
      ],
      "answer": 1,
      "why": "n es el número de electrones transferidos en la reacción global tal como fue balanceada.",
      "lookFor": "Balancea semirreacciones antes de calcular Q o E.",
      "hint": "No se elige por la carga aislada de un ion."
    },
    {
      "id": "fq-i2",
      "subject": "fisico",
      "level": "intermediate",
      "title": "Meseta de Langmuir",
      "prompt": "La meseta de una isoterma de Langmuir representa…",
      "choices": [
        "Ausencia de adsorbato",
        "Saturación de sitios de monocapa",
        "Reacción infinita",
        "Cambio de estado del gas"
      ],
      "answer": 1,
      "why": "Al ocuparse los sitios equivalentes disponibles, aumentar la presión ya no incrementa apreciablemente la cobertura.",
      "lookFor": "Conecta forma del gráfico con supuesto microscópico.",
      "hint": "Meseta = capacidad finita de superficie."
    },
    {
      "id": "fq-i3",
      "subject": "fisico",
      "level": "intermediate",
      "title": "Vida media de primer orden",
      "prompt": "Si k=0,231 min⁻¹, t½ es aproximadamente…",
      "choices": [
        "0,33 min",
        "3,00 min",
        "4,33 min",
        "23,1 min"
      ],
      "answer": 1,
      "why": "Para primer orden t½=ln2/k=0,693/0,231≈3,00 min.",
      "lookFor": "Confirma primero el orden y las unidades de k.",
      "hint": "La fórmula de vida media cambia con el orden."
    },
    {
      "id": "fq-p1",
      "subject": "fisico",
      "level": "pep",
      "title": "PEP 3 · Velocidad estequiométrica",
      "prompt": "Para CH₃N₂CH₃ → C₂H₆ + N₂, ¿qué relación de velocidades es correcta?",
      "choices": [
        "−d[azo]/dt=d[C₂H₆]/dt=d[N₂]/dt",
        "d[azo]/dt=d[N₂]/dt",
        "−2d[azo]/dt=d[C₂H₆]/dt",
        "Los signos son todos negativos"
      ],
      "answer": 0,
      "why": "Todos los coeficientes son 1: el reactivo disminuye y ambos productos aumentan a la misma velocidad estequiométrica.",
      "lookFor": "Incluye signo y coeficiente de cada especie.",
      "hint": "Consumo es negativo; aparición es positiva."
    },
    {
      "id": "fq-p2",
      "subject": "fisico",
      "level": "pep",
      "title": "PEP 3 · Michaelis–Menten",
      "prompt": "Cuando [S]≫Km, la velocidad inicial se aproxima a…",
      "choices": [
        "0",
        "Km",
        "Vmax",
        "Vmax/2"
      ],
      "answer": 2,
      "why": "v=Vmax[S]/(Km+[S]); si [S] domina el denominador, el cociente tiende a 1.",
      "lookFor": "Interpreta límites antes de calcular.",
      "hint": "La saturación desacopla v de nuevos aumentos de S."
    },
    {
      "id": "fq-p3",
      "subject": "fisico",
      "level": "pep",
      "title": "PEP 3 · Rendimiento cuántico",
      "prompt": "Desde S₁ compiten kf=5×10⁷, kCI=3×10⁷ y kCIS=2×10⁷ s⁻¹. Φf vale…",
      "choices": [
        "0,20",
        "0,50",
        "0,80",
        "5,0"
      ],
      "answer": 1,
      "why": "Φf=kf/(kf+kCI+kCIS)=5/(5+3+2)=0,50. Es la fracción de desactivaciones que emite fluorescencia.",
      "lookFor": "Una velocidad individual se divide por la suma de todas las rutas competitivas.",
      "hint": "El resultado debe quedar entre 0 y 1."
    },
    {
      "id": "fis-b1",
      "subject": "fisio",
      "level": "basic",
      "title": "Cadena causal del SNC",
      "prompt": "¿Qué neurotransmisor se asocia a excitotoxicidad tras isquemia cerebral?",
      "choices": [
        "GABA",
        "Glutamato",
        "Glicina inhibitoria",
        "Dopamina exclusivamente"
      ],
      "answer": 1,
      "why": "La falla energética altera gradientes y favorece liberación/acumulación de glutamato, entrada de Ca²⁺ y daño celular.",
      "lookFor": "Sigue la cadena energía → transportadores → receptor → Ca²⁺.",
      "hint": "No memorices “neurotransmisor”: ubícalo en la cadena."
    },
    {
      "id": "fis-b2",
      "subject": "fisio",
      "level": "basic",
      "title": "Edema citotóxico",
      "prompt": "El evento inicial más directo del edema citotóxico es…",
      "choices": [
        "Ruptura de barrera hematoencefálica",
        "Falla de bombas dependientes de ATP",
        "Aumento de albúmina plasmática",
        "Vasodilatación fisiológica"
      ],
      "answer": 1,
      "why": "Al fallar Na⁺/K⁺-ATPasa, Na⁺ y agua entran a la célula y ésta se hincha.",
      "lookFor": "Pregunta primero qué compartimento acumula agua.",
      "hint": "Citotóxico = célula hinchada por falla energética."
    },
    {
      "id": "fis-b3",
      "subject": "fisio",
      "level": "basic",
      "title": "Falla endocrina primaria",
      "prompt": "Si la glándula blanco falla, la hormona final baja y la hormona trófica suele…",
      "choices": [
        "Bajar por completo",
        "Subir por pérdida de retroalimentación negativa",
        "No cambiar nunca",
        "Desaparecer del plasma"
      ],
      "answer": 1,
      "why": "Al caer la hormona final se pierde el freno sobre hipófisis/hipotálamo, aumentando la señal trófica si el eje central funciona.",
      "lookFor": "Mira las hormonas como pareja, no aisladas.",
      "hint": "Dibuja flechas y feedback."
    },
    {
      "id": "fis-i1",
      "subject": "fisio",
      "level": "intermediate",
      "title": "Vasogénico vs citotóxico",
      "prompt": "¿Qué hallazgo favorece edema vasogénico?",
      "choices": [
        "Agua principalmente intracelular con barrera intacta",
        "Aumento de permeabilidad de barrera y líquido extracelular",
        "Falla aislada de ATPasa sin fuga vascular",
        "Ausencia de proteínas fuera del vaso"
      ],
      "answer": 1,
      "why": "La barrera dañada permite salida de líquido y proteínas al espacio extracelular.",
      "lookFor": "Distingue barrera rota de bomba celular fallida.",
      "hint": "Vaso-génico: el problema comienza en el vaso/barrera."
    },
    {
      "id": "fis-i2",
      "subject": "fisio",
      "level": "intermediate",
      "title": "Obstructivo vs restrictivo",
      "prompt": "Una reducción marcada de FEV₁/FVC orienta principalmente a…",
      "choices": [
        "Patrón obstructivo",
        "Patrón restrictivo puro",
        "Normalidad obligatoria",
        "Falla renal"
      ],
      "answer": 0,
      "why": "La obstrucción reduce desproporcionadamente el flujo espiratorio del primer segundo. En restricción, ambos volúmenes bajan y la razón suele conservarse o aumentar.",
      "lookFor": "Compara proporción, no sólo un volumen bajo.",
      "hint": "Obstrucción = problema de sacar aire rápido."
    },
    {
      "id": "fis-i3",
      "subject": "fisio",
      "level": "intermediate",
      "title": "Respuesta a bajo volumen efectivo",
      "prompt": "¿Qué respuesta compensa una caída del volumen arterial efectivo?",
      "choices": [
        "Supresión de renina",
        "Activación SRAA con retención de Na⁺ y agua",
        "Pérdida renal obligatoria de Na⁺",
        "Disminución de aldosterona"
      ],
      "answer": 1,
      "why": "La menor perfusión renal activa renina, angiotensina II y aldosterona para sostener presión y volumen.",
      "lookFor": "Separa compensación útil aguda de costo crónico.",
      "hint": "Riñón interpreta perfusión baja como necesidad de retener."
    },
    {
      "id": "fis-p1",
      "subject": "fisio",
      "level": "pep",
      "title": "PEP · Primaria o central",
      "prompt": "T4 baja con TSH alta sugiere principalmente…",
      "choices": [
        "Hipotiroidismo primario",
        "Hipotiroidismo secundario",
        "Hipertiroidismo primario",
        "Eje normal"
      ],
      "answer": 0,
      "why": "La tiroides falla; la hipófisis responde elevando TSH por pérdida de feedback.",
      "lookFor": "Localiza la lesión comparando hormona trófica y final.",
      "hint": "Órgano blanco bajo + señal alta = falla primaria."
    },
    {
      "id": "fis-p2",
      "subject": "fisio",
      "level": "pep",
      "title": "PEP · De isquemia a PIC",
      "prompt": "¿Cuál orden causal es más coherente?",
      "choices": [
        "↑ATP → menos glutamato → edema → ↑PIC",
        "Isquemia → ↓ATP → despolarización/glutamato → Ca²⁺ → edema → ↑PIC",
        "Edema → más perfusión → menos daño",
        "Glutamato → hiperpolarización protectora → recuperación"
      ],
      "answer": 1,
      "why": "La isquemia inicia una cascada de falla energética, excitotoxicidad, sobrecarga de Ca²⁺ y edema que puede elevar la presión intracraneana.",
      "lookFor": "Corrige el primer eslabón falso; lo demás cae después.",
      "hint": "Empieza por oxígeno/glucosa y ATP."
    },
    {
      "id": "fis-p3",
      "subject": "fisio",
      "level": "pep",
      "title": "PEP · Síndrome nefrítico vs nefrótico",
      "prompt": "La proteinuria masiva con hipoalbuminemia y edema orienta a…",
      "choices": [
        "Síndrome nefrótico",
        "Síndrome nefrítico puro",
        "Asma",
        "Hipertiroidismo"
      ],
      "answer": 0,
      "why": "La pérdida marcada de proteínas reduce presión oncótica y favorece edema; el nefrítico destaca inflamación, hematuria y caída de filtración.",
      "lookFor": "Une hallazgo → mecanismo → consecuencia.",
      "hint": "No uses sólo la palabra edema: busca la magnitud de proteinuria."
    }
  ],
  "guides": [
    {
      "id": "g-o1",
      "subject": "organica",
      "pep": "PEP 1",
      "title": "Aminas, aromaticidad y SEA",
      "question": "¿Dónde están los electrones y qué estabilización se gana o se pierde?",
      "route": [
        "Ácido–base y pKa",
        "Resonancia y par libre",
        "Aromaticidad",
        "Complejo σ y directores"
      ],
      "draw": "Una tabla B/BH⁺ y un mapa de los complejos σ orto–meta–para.",
      "check": [
        "Toda flecha nace en electrones",
        "Separa basicidad de nucleofilia",
        "Verifica conjugación antes de 4n+2",
        "Separa activación de orientación"
      ],
      "exam": "Ordenar basicidad, clasificar anillos, predecir producto y proponer síntesis aromática."
    },
    {
      "id": "g-o2",
      "subject": "organica",
      "pep": "PEP 2",
      "title": "Aldehídos, cetonas y síntesis",
      "question": "¿Qué nucleófilo ataca al carbono del C=O y qué sale del intermedio?",
      "route": [
        "Polarización",
        "Adición nucleofílica",
        "Imina/enamina",
        "Oxidación y reducción",
        "Enlace C—C"
      ],
      "draw": "Un carbonilo central con rutas a alcohol, imina, enamina, cianohidrina y alqueno.",
      "check": [
        "Marca C δ+ y O δ−",
        "Controla octeto al mover π",
        "Identifica amina primaria/secundaria",
        "Compara nivel C—O/C—H"
      ],
      "exam": "Productos, reactivos faltantes y secuencias multietapa como las fotos 2025."
    },
    {
      "id": "g-o3",
      "subject": "organica",
      "pep": "PEP 3",
      "title": "Ácidos, derivados y enolatos",
      "question": "¿Qué enlace C—C o C—heteroátomo explica el producto?",
      "route": [
        "Sustitución acílica",
        "Reactividad de derivados",
        "Hα y enolato",
        "Aldol",
        "Michael",
        "Robinson"
      ],
      "draw": "Escala de derivados de ácido y dos desconexiones: Michael + aldol.",
      "check": [
        "Comprueba grupo saliente",
        "Dibuja resonancia del enolato",
        "Distingue adición 1,2/1,4",
        "Marca el enlace nuevo"
      ],
      "exam": "Mapas de síntesis, Claisen, Michael y anulación de Robinson."
    },
    {
      "id": "g-a1",
      "subject": "analitica",
      "pep": "PEP 1",
      "title": "Proceso analítico y ácido–base",
      "question": "¿Qué se midió, en qué recipiente y en qué unidad se informa?",
      "route": [
        "Analito/matriz",
        "Reacción",
        "Dilución y alícuota",
        "Curva",
        "Error y decisión"
      ],
      "draw": "Muestra → matraz → pipeta → Erlenmeyer, con volúmenes sobre cada flecha.",
      "check": [
        "Balancea antes de M·V",
        "Distingue equivalencia/punto final",
        "Deshaz diluciones",
        "Termina con unidad y decisión"
      ],
      "exam": "Problemas contextualizados de fármacos con curva y control de calidad."
    },
    {
      "id": "g-a2",
      "subject": "analitica",
      "pep": "PEP 2",
      "title": "Redox y EDTA",
      "question": "¿Qué reacción es cuantitativa bajo estas condiciones?",
      "route": [
        "Semirreacciones",
        "Electrones",
        "Potencial",
        "Complejo metal–EDTA",
        "pH y Kf condicional"
      ],
      "draw": "Dos semirreacciones y un diagrama metal + Y⁴⁻ ⇌ MY.",
      "check": [
        "Conserva masa/carga",
        "No multiplica E° por coeficientes",
        "Ubica n global",
        "Revisa fracción activa de EDTA"
      ],
      "exam": "Permanganimetría, dureza y elección justificada de medio/indicador."
    },
    {
      "id": "g-a3",
      "subject": "analitica",
      "pep": "PEP 3",
      "title": "Precipitación y gravimetría",
      "question": "¿Cuándo aparece sólido y cómo su masa vuelve al analito?",
      "route": [
        "Qsp/Kps",
        "Ion común",
        "Método de titulación",
        "Precipitado puro",
        "Factor gravimétrico"
      ],
      "draw": "Eje Qsp con umbral Kps y flecha precipitado pesado → analito reportado.",
      "check": [
        "Escribe Q con potencias",
        "Distingue directa/retroceso",
        "No confunde precipitado con analito",
        "Tara y masa constante"
      ],
      "exam": "Mohr, Volhard, Fajans y gravimetría con decisión química."
    },
    {
      "id": "g-fq1",
      "subject": "fisico",
      "pep": "PEP 1",
      "title": "Equilibrio, actividad y electroquímica",
      "question": "¿Qué estado describe Q y hacia dónde lo lleva K?",
      "route": [
        "ΔG° y K",
        "Q",
        "Actividad",
        "Semirreacciones",
        "Nernst"
      ],
      "draw": "Dos balanzas Q<K y Q>K más una celda con ánodo/cátodo.",
      "check": [
        "K cambia sólo con T",
        "Usa actividad si no ideal",
        "Balancea n",
        "Define reacción antes del signo de E"
      ],
      "exam": "Cálculo largo + interpretación + celda no ideal, patrón 1S-2026."
    },
    {
      "id": "g-fq2",
      "subject": "fisico",
      "pep": "PEP 2",
      "title": "Superficies y transporte",
      "question": "¿Qué gradiente o creación de área explica el fenómeno?",
      "route": [
        "γ y trabajo",
        "Capilaridad",
        "Langmuir",
        "Fick",
        "Stokes–Einstein",
        "Conductividad"
      ],
      "draw": "Curva de Langmuir con meseta y perfil C(x) con flecha de flujo.",
      "check": [
        "Unidades de γ",
        "Radio vs diámetro",
        "Supuestos de monocapa",
        "Signo y dirección del flujo"
      ],
      "exam": "Problemas de gotas, adsorción, difusión y tamaño molecular."
    },
    {
      "id": "g-fq3",
      "subject": "fisico",
      "pep": "PEP 3",
      "title": "Cinética, enzimas y fotoquímica",
      "question": "¿Qué ruta y qué constante controlan la observación?",
      "route": [
        "Velocidad y orden",
        "Arrhenius",
        "Mecanismo/SST",
        "Michaelis–Menten",
        "Jablonski",
        "Rendimiento cuántico"
      ],
      "draw": "Perfil energético y diagrama S₁ con flechas kf, kCI y kCIS.",
      "check": [
        "Signo estequiométrico",
        "Unidades de k",
        "SST no es equilibrio",
        "Φ entre 0 y 1"
      ],
      "exam": "La prueba 21-01-2026 mezcla cálculo, gráfico, mecanismo e interpretación."
    },
    {
      "id": "g-fi1",
      "subject": "fisio",
      "pep": "PEP 1",
      "title": "Nervioso, respiratorio y digestivo",
      "question": "¿Dónde está la falla y qué cadena causal explica los signos?",
      "route": [
        "Localizar la lesión motora",
        "Simpático/parasimpático",
        "Isquemia → edema → PIC",
        "Obstructivo/restrictivo y A-a",
        "Agresión/defensa y diarrea"
      ],
      "draw": "Tres cadenas: isquemia → glutamato → Ca²⁺ → edema → PIC; hipoxemia → gradiente A-a; AINE → ↓ prostaglandinas → úlcera.",
      "check": [
        "Glutamato, no GABA, en excitotoxicidad",
        "PPC = PAM − PIC",
        "VEF₁/CVF < 0,70 es obstructivo",
        "Brecha osmolar: osmótica o secretora"
      ],
      "exam": "Casos clínicos: localizar, explicar el mecanismo y justificar el fármaco."
    },
    {
      "id": "g-fi2",
      "subject": "fisio",
      "pep": "PEP 2",
      "title": "Cardiovascular y respiratorio",
      "question": "¿Qué compensación sostiene el sistema y cuándo se vuelve dañina?",
      "route": [
        "Presión=GC×RVP",
        "SRAA",
        "Remodelado",
        "Obstrucción/restricción",
        "Intercambio gaseoso"
      ],
      "draw": "Corazón–vasos–riñón en triángulo y curvas flujo–volumen comparadas.",
      "check": [
        "Causa vs compensación",
        "Precarga/poscarga",
        "FEV₁/FVC",
        "Ventilación vs difusión"
      ],
      "exam": "Comparaciones de mecanismos con manifestaciones cercanas."
    },
    {
      "id": "g-fi3",
      "subject": "fisio",
      "pep": "Bloque 3",
      "title": "Renal y digestivo",
      "question": "¿Qué barrera, segmento o función explica el hallazgo?",
      "route": [
        "Glomérulo",
        "Túbulo",
        "Volumen/electrolitos",
        "Barrera digestiva",
        "Secreción",
        "Motilidad"
      ],
      "draw": "Nefrona simplificada y tubo digestivo con función alterada por tramo.",
      "check": [
        "Nefrítico vs nefrótico",
        "IRA prerrenal/renal/postrenal",
        "Diarrea secretora/osmótica",
        "Síntoma no equivale a mecanismo"
      ],
      "exam": "Cadenas causales y distractores de “todas las anteriores”."
    }
  ],
  "exams": [
    {
      "id": "e-fq1",
      "subject": "fisico",
      "year": "21 ene 2026",
      "title": "PEP 3 · Velocidad de reacción",
      "file": "01_fq2_cinetica_velocidad_azometano.jpg",
      "focus": "Velocidad estequiométrica, perfiles concentración–tiempo y velocidad promedio."
    },
    {
      "id": "e-fq2",
      "subject": "fisico",
      "year": "21 ene 2026",
      "title": "PEP 3 · Cinética enzimática",
      "file": "02_fq2_cinetica_enzimatica_michaelis_menten.jpg",
      "focus": "Michaelis–Menten, Vmax, mecanismo, perfil energético y Arrhenius."
    },
    {
      "id": "e-fq3",
      "subject": "fisico",
      "year": "21 ene 2026",
      "title": "PEP 3 · Mecanismo radicalario",
      "file": "03_fq2_mecanismo_radicalario_estado_estacionario.jpg",
      "focus": "Cadena, productos mayoritarios, perfiles y estado estacionario."
    },
    {
      "id": "e-fq4",
      "subject": "fisico",
      "year": "21 ene 2026",
      "title": "PEP 3 · Fotoquímica",
      "file": "04_fq2_fotoquimica_jablonski_rendimiento_cuantico.jpg",
      "focus": "Jablonski, fluorescencia/fosforescencia y rendimiento cuántico."
    },
    {
      "id": "e-o1",
      "subject": "organica",
      "year": "2025",
      "title": "PEP 2 · Carbonilos corregida",
      "file": "05_org2_pep2_2025_productos_carbonilos_corregida.jpg",
      "focus": "Productos de carbonilos, Grignard, Wittig, iminas/enaminas y cianohidrinas."
    },
    {
      "id": "e-o2",
      "subject": "organica",
      "year": "2025",
      "title": "Condensación aldólica",
      "file": "06_org2_condensacion_aldolica.jpg",
      "focus": "Aldol inter/intramolecular y retrosíntesis de α,β-insaturados."
    },
    {
      "id": "e-o3",
      "subject": "organica",
      "year": "2025",
      "title": "Aminas y aromaticidad",
      "file": "07_org2_aminas_aromaticidad_productos.jpg",
      "focus": "Síntesis de aminas, Hückel y productos principales."
    },
    {
      "id": "e-o4",
      "subject": "organica",
      "year": "2025",
      "title": "Síntesis multietapa y Michael",
      "file": "08_org2_sintesis_multietapa_michael.jpg",
      "focus": "Derivados de ácido y precursores donores/aceptores de Michael."
    },
    {
      "id": "e-o5",
      "subject": "organica",
      "year": "2025",
      "title": "Enolatos, Claisen y Robinson",
      "file": "09_org2_enolatos_claisen_robinson.jpg",
      "focus": "Funcionalización alfa, Claisen y anulación de Robinson."
    },
    {
      "id": "e-o6",
      "subject": "organica",
      "year": "2025",
      "title": "Mapa de síntesis corregido",
      "file": "10_org2_mapa_sintesis_acidos_derivados.jpg",
      "focus": "Transformaciones multietapa y derivados de ácidos carboxílicos."
    },
    {
      "id": "e-o7",
      "subject": "organica",
      "year": "2025",
      "title": "Pauta control 2 · Carbonilos",
      "file": "11_org2_pauta_control2_carbonilos.jpg",
      "focus": "Ozonólisis, Friedel–Crafts, Grignard y formación de enamina."
    },
    {
      "id": "e-o8",
      "subject": "organica",
      "year": "2025",
      "title": "Derivados de ácido",
      "file": "12_org2_mapa_derivados_acido_carboxilico.jpg",
      "focus": "Oxidación, cloruro de acilo, amida, éster y reducciones selectivas."
    },
    {
      "id": "e-o9",
      "subject": "organica",
      "year": "2025",
      "title": "PEP 1 · Aminas y aromáticos",
      "file": "13_org2_pep1_2025_aminas_aromaticos.jpg",
      "focus": "SEA, síntesis, basicidad y aromaticidad en formato de desarrollo."
    },
    {
      "id": "e-a1",
      "subject": "analitica",
      "year": "Histórica",
      "title": "PEP 1 · Analítica",
      "file": "analitica_pep1_historica.pdf",
      "kind": "pdf",
      "focus": "Proceso analítico, ácido–base, alícuotas y decisiones de calidad."
    },
    {
      "id": "e-a2",
      "subject": "analitica",
      "year": "Histórica",
      "title": "PEP 2 · Analítica",
      "file": "analitica_pep2_historica.pdf",
      "kind": "pdf",
      "focus": "Evaluación para practicar el patrón persistente de volumetría y cálculo químico."
    },
    {
      "id": "e-fi1",
      "subject": "fisio",
      "year": "Histórica",
      "title": "PEP 1 · Fisiopatología",
      "file": "fisiopatologia_pep1_historica.pdf",
      "kind": "pdf",
      "focus": "Preguntas por sistemas para entrenar mecanismo, manifestación y distractores cercanos."
    },
    {
      "id": "e-fi2",
      "subject": "fisio",
      "year": "2023",
      "title": "PEP 2 · Fisiopatología",
      "file": "fisiopatologia_pep2_2023.pdf",
      "kind": "pdf",
      "focus": "Prueba real histórica; úsala para el estilo de alternativas, no para asegurar el temario vigente."
    }
  ],
  "backgrounds": [
    {
      "id": "studio",
      "name": "Gris estudio",
      "a": "#eceff1",
      "b": "#f8f9fa",
      "ink": "#17191c"
    },
    {
      "id": "paper",
      "name": "Papel blanco",
      "a": "#f5f5f4",
      "b": "#ffffff",
      "ink": "#17191c"
    },
    {
      "id": "ice",
      "name": "Hielo claro",
      "a": "#e8f0f2",
      "b": "#f8fbfc",
      "ink": "#142024"
    },
    {
      "id": "mist",
      "name": "Niebla azul",
      "a": "#e7edf2",
      "b": "#f7f9fb",
      "ink": "#17202a"
    },
    {
      "id": "mint",
      "name": "Menta tenue",
      "a": "#e7efec",
      "b": "#f8fbfa",
      "ink": "#17211d"
    },
    {
      "id": "sand",
      "name": "Arena fría",
      "a": "#eeeae3",
      "b": "#faf9f6",
      "ink": "#211e1a"
    },
    {
      "id": "lilac",
      "name": "Lavanda gris",
      "a": "#ebe9ef",
      "b": "#faf9fc",
      "ink": "#1d1b22"
    },
    {
      "id": "graphite",
      "name": "Grafito suave",
      "a": "#dfe3e5",
      "b": "#f2f4f5",
      "ink": "#141719"
    }
  ]
};
