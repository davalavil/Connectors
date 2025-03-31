// js/verbs.js
// Lista completa de verbos proporcionada por el usuario.

const verbList = [
    // [Infinitive, Past Simple, Past Participle, Translation, Type]
    ["add", "added", "added", "agregar", "regular"],
    ["answer", "answered", "answered", "responder", "regular"],
    ["apologise", "apologised", "apologised", "pedir perdón", "regular"], // Nota: 'apologize' es más común en AmE
    ["arise", "arose", "arisen", "surgir", "irregular"],
    ["arrest", "arrested", "arrested", "arrestar", "regular"],
    ["arrive", "arrived", "arrived", "llegar", "regular"],
    ["ask", "asked", "asked", "preguntar", "regular"],
    ["attack", "attacked", "attacked", "atacar", "regular"],
    ["awake", "awoke", "awoken", "despertarse", "irregular"],
    ["be", "was / were", "been", "ser/estar", "irregular"], // Traducción ajustada
    ["beat", "beat", "beaten", "golpear", "irregular"],
    ["become", "became", "become", "convertirse", "irregular"],
    ["begin", "began", "begun", "comenzar", "irregular"],
    ["believe", "believed", "believed", "creer", "regular"],
    ["bend", "bent", "bent", "doblar", "irregular"],
    ["bet", "bet/betted", "bet/betted", "apostar", "irregular"],
    ["bid", "bid", "bid", "pujar", "irregular"],
    ["bite", "bit", "bitten", "morder", "irregular"],
    ["bleed", "bled", "bled", "sangrar", "irregular"],
    ["blow", "blew", "blown", "soplar", "irregular"],
    ["boil", "boiled", "boiled", "hervir", "regular"],
    ["book", "booked", "booked", "reservar", "regular"],
    ["borrow", "borrowed", "borrowed", "tomar prestado", "regular"],
    ["break", "broke", "broken", "romper", "irregular"],
    ["bring", "brought", "brought", "traer", "irregular"],
    ["build", "built", "built", "construir", "irregular"],
    ["burn", "burned, burnt", "burned, burnt", "quemar", "irregular"], // Coma separadora mantenida
    ["burst", "burst", "burst", "reventar", "irregular"],
    ["buy", "bought", "bought", "comprar", "irregular"],
    ["carry", "carried", "carried", "llevar", "regular"],
    ["catch", "caught", "caught", "atrapar", "irregular"],
    ["change", "changed", "changed", "cambiar", "regular"],
    ["choose", "chose", "chosen", "elegir", "irregular"],
    ["clean", "cleaned", "cleaned", "limpiar", "regular"],
    ["climb", "climbed", "climbed", "escalar", "regular"],
    ["cling", "clung", "clung", "agarrarse", "irregular"],
    ["collect", "collected", "collected", "coleccionar", "regular"],
    ["come", "came", "come", "venir", "irregular"],
    ["compose", "composed", "composed", "componer", "regular"],
    ["cook", "cooked", "cooked", "cocinar", "regular"],
    ["copy", "copied", "copied", "copiar", "regular"],
    ["cost", "cost", "cost", "costar", "irregular"],
    ["creep", "crept", "crept", "arrastrarse", "irregular"],
    ["cut", "cut", "cut", "cortar", "irregular"],
    ["dance", "danced", "danced", "bailar", "regular"],
    ["deal", "dealt", "dealt", "negociar", "irregular"],
    ["describe", "described", "described", "describir", "regular"],
    ["destroy", "destroyed", "destroyed", "destruir", "regular"],
    ["die", "died", "died", "morir", "regular"], // Morir es regular en inglés
    ["dig", "dug", "dug", "cavar", "irregular"],
    ["discover", "discovered", "discovered", "descubrir", "regular"],
    ["discuss", "discussed", "discussed", "discutir", "regular"],
    ["do", "did", "done", "hacer", "irregular"],
    ["draw", "drew", "drawn", "dibujar", "irregular"],
    ["dream", "dreamt/dreamed", "dreamt/dreamed", "soñar", "irregular"], // A veces considerado regular (dreamed)
    ["drink", "drank", "drunk", "beber", "irregular"],
    ["drive", "drove", "driven", "conducir", "irregular"],
    ["eat", "ate", "eaten", "comer", "irregular"],
    ["enjoy", "enjoyed", "enjoyed", "disfrutar", "regular"],
    ["fall", "fell", "fallen", "caer", "irregular"],
    ["feed", "fed", "fed", "alimentar", "irregular"],
    ["feel", "felt", "felt", "sentir", "irregular"],
    ["fight", "fought", "fought", "pelear", "irregular"],
    ["find", "found", "found", "encontrar", "irregular"],
    ["fit", "fit", "fit", "encajar", "irregular"], // A veces 'fitted' (regular), pero 'fit' es común
    ["flee", "fled", "fled", "huir", "irregular"],
    ["fly", "flew", "flown", "volar", "irregular"],
    ["forbid", "forbade", "forbidden", "prohibir", "irregular"],
    ["forget", "forgot", "forgotten", "olvidar", "irregular"],
    ["forgive", "forgave", "forgiven", "perdonar", "irregular"],
    ["forsake", "forsook", "forsaken", "abandonar", "irregular"],
    ["freeze", "froze", "frozen", "congelar", "irregular"],
    ["fry", "fried", "fried", "freír", "regular"],
    ["get", "got", "got/gotten", "conseguir/obtener", "irregular"], // Traducción ajustada, 'gotten' más común en AmE para PP
    ["give", "gave", "given", "dar", "irregular"],
    ["go", "went", "gone", "ir", "irregular"],
    ["grind", "ground", "ground", "moler", "irregular"],
    ["grow", "grew", "grown", "crecer", "irregular"],
    ["hang", "hung", "hung", "colgar", "irregular"], // Nota: 'hanged' se usa para ejecuciones
    ["happen", "happened", "happened", "suceder", "regular"],
    ["hate", "hated", "hated", "odiar", "regular"],
    ["have", "had", "had", "tener", "irregular"], // 'haber' también como auxiliar
    ["hear", "heard", "heard", "oír", "irregular"],
    ["help", "helped", "helped", "ayudar", "regular"],
    ["hide", "hid", "hidden", "esconderse", "irregular"],
    ["hit", "hit", "hit", "golpear", "irregular"],
    ["hold", "held", "held", "mantener/sostener", "irregular"], // Traducción ampliada
    ["hope", "hoped", "hoped", "esperar (deseo)", "regular"], // Diferenciar de wait
    ["hunt", "hunted", "hunted", "cazar", "regular"],
    ["hurt", "hurt", "hurt", "herir/doler", "irregular"], // Traducción ampliada
    ["imagine", "imagined", "imagined", "imaginar", "regular"],
    ["invent", "invented", "invented", "inventar", "regular"],
    ["invite", "invited", "invited", "invitar", "regular"],
    ["jump", "jumped", "jumped", "saltar", "regular"],
    ["keep", "kept", "kept", "mantener/guardar", "irregular"], // Traducción ampliada
    ["kill", "killed", "killed", "matar", "regular"],
    ["kneel", "knelt", "knelt", "arrodillarse", "irregular"], // También 'kneeled' (regular) es posible
    ["know", "knew", "known", "saber/conocer", "irregular"], // Traducción ampliada
    ["lead", "led", "led", "encabezar/guiar", "irregular"], // Traducción ampliada
    ["lean", "leant/leaned", "leant/leaned", "inclinarse/apoyarse", "irregular"], // Traducción ampliada
    ["leap", "leapt", "leapt", "saltar", "irregular"], // También 'leaped' (regular)
    ["learn", "learnt/learned", "learnt/learned", "aprender", "irregular"], // 'learned' es más común en AmE y como regular
    ["leave", "left", "left", "dejar/irse", "irregular"], // Traducción ampliada
    ["lend", "lent", "lent", "prestar", "irregular"],
    ["let", "let", "let", "dejar/permitir", "irregular"], // Traducción ampliada
    ["lie", "lay", "lain", "recostarse/yacer", "irregular"], // Traducción ampliada (el de estar tumbado)
    ["lie", "lied", "lied", "mentir", "regular"], // El de mentir es regular
    ["lift", "lifted", "lifted", "levantar", "regular"],
    ["light", "lit", "lit", "encender", "irregular"], // También 'lighted' (regular)
    ["like", "liked", "liked", "gustar", "regular"],
    ["listen", "listened", "listened", "escuchar", "regular"],
    ["live", "lived", "lived", "vivir", "regular"],
    ["look", "looked", "looked", "mirar", "regular"],
    ["lose", "lost", "lost", "perder", "irregular"],
    ["love", "loved", "loved", "amar", "regular"],
    ["make", "made", "made", "hacer/fabricar", "irregular"], // Traducción ampliada
    ["mean", "meant", "meant", "significar/querer decir", "irregular"], // Traducción ampliada
    ["meet", "met", "met", "conocer/reunirse", "irregular"], // Traducción ampliada
    ["miss", "missed", "missed", "perder/echar de menos", "regular"], // Traducción ampliada
    ["mistake", "mistook", "mistaken", "equivocar(se)", "irregular"], // Traducción ampliada
    ["offer", "offered", "offered", "ofrecer", "regular"],
    ["open", "opened", "opened", "abrir", "regular"],
    ["overcome", "overcame", "overcome", "vencer/superar", "irregular"], // Traducción ampliada
    ["overtake", "overtook", "overtaken", "adelantar/rebasar", "irregular"], // Traducción ampliada
    ["overthrow", "overthrew", "overthrown", "derrocar/volcar", "irregular"], // Traducción ampliada
    ["pack", "packed", "packed", "empaquetar", "regular"],
    ["pass", "passed", "passed", "pasar/aprobar", "regular"], // Traducción ampliada
    ["pay", "paid", "paid", "pagar", "irregular"],
    ["peel", "peeled", "peeled", "pelar", "regular"],
    ["plan", "planned", "planned", "planificar", "regular"],
    ["play", "played", "played", "jugar/tocar (instrumento)", "regular"], // Traducción ampliada
    ["pour", "poured", "poured", "verter/servir", "regular"], // Traducción ampliada
    ["prefer", "preferred", "preferred", "preferir", "regular"],
    ["prepare", "prepared", "prepared", "preparar", "regular"],
    ["prove", "proved", "proved/proven", "probar/demostrar", "irregular"], // Traducción ampliada, 'proven' común como adjetivo o PP
    ["push", "pushed", "pushed", "empujar", "regular"],
    ["put", "put", "put", "poner/colocar", "irregular"], // Traducción ampliada
    ["quit", "quit/quitted", "quit/quitted", "abandonar/dejar", "irregular"], // Traducción ampliada
    ["rain", "rained", "rained", "llover", "regular"],
    ["read", "read", "read", "leer", "irregular"], // Pronunciación cambia: /ri:d/, /red/, /red/
    ["reduce", "reduced", "reduced", "reducir", "regular"],
    ["remember", "remembered", "remembered", "recordar", "regular"],
    ["rent", "rented", "rented", "alquilar", "regular"],
    ["rescue", "rescued", "rescued", "rescatar", "regular"],
    ["return", "returned", "returned", "volver/devolver", "regular"], // Traducción ampliada
    ["ride", "rode", "ridden", "montar (bici, caballo)", "irregular"], // Traducción ampliada
    ["ring", "rang", "rung", "llamar/sonar", "irregular"], // Traducción ampliada
    ["rise", "rose", "risen", "subir/levantarse/aumentar", "irregular"], // Traducción ampliada
    ["run", "ran", "run", "correr", "irregular"],
    ["save", "saved", "saved", "ahorrar/guardar/salvar", "regular"], // Traducción ampliada
    ["say", "said", "said", "decir", "irregular"],
    ["scream", "screamed", "screamed", "gritar", "regular"],
    ["search", "searched", "searched", "buscar", "regular"],
    ["see", "saw", "seen", "ver", "irregular"],
    ["sell", "sold", "sold", "vender", "irregular"],
    ["send", "sent", "sent", "enviar", "irregular"],
    ["set", "set", "set", "fijar/establecer/poner", "irregular"], // Traducción ampliada
    ["sew", "sewed", "sewn/sewed", "coser", "irregular"],
    ["shake", "shook", "shaken", "sacudir/agitar", "irregular"], // Traducción ampliada
    ["shine", "shone", "shone", "brillar", "irregular"], // También 'shined' (regular) cuando significa 'lustrar'
    ["shoot", "shot", "shot", "disparar", "irregular"],
    ["show", "showed", "shown/showed", "mostrar/enseñar", "irregular"], // Traducción ampliada
    ["shrink", "shrank/shrunk", "shrunk", "encoger(se)", "irregular"], // Traducción ampliada
    ["shut", "shut", "shut", "cerrar", "irregular"],
    ["sing", "sang", "sung", "cantar", "irregular"],
    ["sink", "sank", "sunk", "hundir(se)", "irregular"], // Traducción ampliada
    ["sit", "sat", "sat", "sentarse", "irregular"],
    ["skate", "skated", "skated", "patinar", "regular"],
    ["ski", "skied", "skied", "esquiar", "regular"],
    ["sleep", "slept", "slept", "dormir", "irregular"],
    ["slide", "slid", "slid", "deslizar(se)", "irregular"], // Traducción ampliada
    ["smell", "smelt/smelled", "smelt/smelled", "oler", "irregular"],
    ["snore", "snored", "snored", "roncar", "regular"],
    ["sow", "sowed", "sown/sowed", "sembrar", "irregular"],
    ["speak", "spoke", "spoken", "hablar", "irregular"],
    ["speed", "sped", "sped", "acelerar", "irregular"], // También 'speeded' (regular)
    ["spell", "spelt/spelled", "spelt/spelled", "deletrear", "irregular"],
    ["spend", "spent", "spent", "gastar/pasar (tiempo)", "irregular"], // Traducción ampliada
    ["spill", "spilt/spilled", "spilt/spilled", "derramar", "irregular"],
    ["spit", "spat", "spat", "escupir", "irregular"],
    ["split", "split", "split", "partir/dividir", "irregular"], // Traducción ampliada
    ["spoil", "spoilt/spoiled", "spoilt/spoiled", "estropear/mimar", "irregular"], // Traducción ampliada
    ["spread", "spread", "spread", "extender(se)/difundir", "irregular"], // Traducción ampliada
    ["stand", "stood", "stood", "estar de pie/soportar", "irregular"], // Traducción ampliada
    ["start", "started", "started", "comenzar/empezar", "regular"],
    ["stay", "stayed", "stayed", "quedarse/permanecer", "regular"], // Traducción ampliada
    ["steal", "stole", "stolen", "robar", "irregular"],
    ["stick", "stuck", "stuck", "pegar/clavar/atascarse", "irregular"], // Traducción ampliada
    ["sting", "stung", "stung", "picar (insecto)", "irregular"], // Traducción ampliada
    ["stink", "stank/stunk", "stunk", "apestar", "irregular"],
    ["stop", "stopped", "stopped", "detener(se)/parar", "regular"], // Traducción ampliada
    ["strike", "struck", "struck/stricken", "golpear/declarar (huelga)", "irregular"], // Traducción ampliada, 'stricken' más como PP adjetival
    ["study", "studied", "studied", "estudiar", "regular"],
    ["survive", "survived", "survived", "sobrevivir", "regular"],
    ["swear", "swore", "sworn", "jurar/decir palabrotas", "irregular"], // Traducción ampliada
    ["sweep", "swept", "swept", "barrer", "irregular"],
    ["swim", "swam", "swum", "nadar", "irregular"],
    ["swing", "swung", "swung", "columpiarse/balancearse", "irregular"], // Traducción ampliada
    ["take", "took", "taken", "tomar/coger/llevar", "irregular"], // Traducción ampliada
    ["talk", "talked", "talked", "hablar/conversar", "regular"], // Traducción ampliada
    ["teach", "taught", "taught", "enseñar", "irregular"],
    ["tear", "tore", "torn", "romper/rasgar", "irregular"], // Traducción ampliada
    ["tell", "told", "told", "decir/contar", "irregular"], // Traducción ampliada
    ["think", "thought", "thought", "pensar/creer", "irregular"], // Traducción ampliada
    ["throw", "threw", "thrown", "lanzar/tirar", "irregular"], // Traducción ampliada
    ["thrust", "thrust", "thrust", "empujar (con fuerza)", "irregular"], // Traducción ampliada
    ["touch", "touched", "touched", "tocar", "regular"],
    ["tread", "trod", "trodden/trod", "pisar", "irregular"],
    ["try", "tried", "tried", "intentar/probar", "regular"], // Traducción ampliada
    ["understand", "understood", "understood", "entender/comprender", "irregular"], // Traducción ampliada
    ["use", "used", "used", "usar/utilizar", "regular"], // Traducción ampliada
    ["visit", "visited", "visited", "visitar", "regular"],
    ["wait", "waited", "waited", "esperar", "regular"],
    ["wake", "woke", "woken", "despertarse", "irregular"], // Similar a awake
    ["walk", "walked", "walked", "caminar/andar", "regular"], // Traducción ampliada
    ["want", "wanted", "wanted", "querer/desear", "regular"], // Traducción ampliada
    ["warn", "warned", "warned", "advertir", "regular"],
    ["wash", "washed", "washed", "lavar", "regular"],
    ["watch", "watched", "watched", "mirar (TV)/observar", "regular"], // Traducción ampliada
    ["wear", "wore", "worn", "llevar puesto/usar (ropa)", "irregular"], // Traducción ampliada
    ["weave", "wove", "woven", "tejer", "irregular"],
    ["weep", "wept", "wept", "llorar (literario)", "irregular"], // Traducción ampliada
    ["wet", "wet", "wet", "mojar", "irregular"], // También 'wetted' (regular)
    ["win", "won", "won", "ganar", "irregular"],
    ["work", "worked", "worked", "trabajar/funcionar", "regular"], // Traducción ampliada
    ["wring", "wrung", "wrung", "retorcer/escurrir", "irregular"], // Traducción ampliada
    ["write", "wrote", "written", "escribir", "irregular"]
];

// Nota: Algunos verbos tienen formas alternativas (ej. learnt/learned).
// El código actual en script.js maneja bien las alternativas separadas por '/'
// Si se usa coma (ej. burned, burnt), solo la primera forma será reconocida por defecto.
// Si se desean ambas formas separadas por coma, se necesitaría ajustar la lógica de comprobación.
