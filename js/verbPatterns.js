// js/verbPatterns.js

const verbPatternData = [
    // GERUNDS
    { id: 1, term: 'Después preposiciones (e.g., after, before, without...)', category: 'gerund', explanation: 'After prepositions, use gerund' },
    { id: 2, term: 'Después phrasal verbs (e.g., give up, carry on...)', category: 'gerund', explanation: 'After most phrasal verbs, use gerund' },
    { id: 3, term: 'Sujeto de una oración (e.g., Swimming is fun)', category: 'gerund', explanation: 'Gerund as the subject of a sentence' },
    { id: 4, term: 'admit', category: 'gerund', explanation: 'admitir' },
    { id: 5, term: 'avoid', category: 'gerund', explanation: 'evitar' },
    { id: 6, term: 'be worth', category: 'gerund', explanation: 'valer la pena' },
    { id: 7, term: "can't help", category: 'gerund', explanation: 'no poder evitar' },
    { id: 8, term: "can't stand", category: 'gerund', explanation: 'no soportar' },
    { id: 9, term: 'carry on', category: 'gerund', explanation: 'continuar (phrasal)' },
    { id: 10, term: 'deny', category: 'gerund', explanation: 'negar' },
    { id: 11, term: 'dislike', category: 'gerund', explanation: 'disgustar' },
    { id: 12, term: 'enjoy', category: 'gerund', explanation: 'disfrutar' },
    { id: 13, term: 'fancy', category: 'gerund', explanation: 'apetecer' },
    { id: 14, term: 'feel like', category: 'gerund', explanation: 'tener ganas de' },
    { id: 15, term: 'finish', category: 'gerund', explanation: 'terminar' },
    { id: 16, term: 'give up', category: 'gerund', explanation: 'rendirse, dejar de (phrasal)' },
    { id: 17, term: 'go on', category: 'gerund', explanation: 'seguir, continuar (phrasal - meaning continue doing sth)' },
    { id: 18, term: 'hate (general sense, AmE prefer)', category: 'gerund', explanation: 'odiar (sentido general, preferido en AmE)' },
    { id: 19, term: 'imagine', category: 'gerund', explanation: 'imaginar' },
    { id: 20, term: 'involve', category: 'gerund', explanation: 'implicar, suponer' },
    { id: 21, term: 'keep (on)', category: 'gerund', explanation: 'seguir, continuar' },
    { id: 22, term: 'like (general sense, AmE prefer)', category: 'gerund', explanation: 'gustar (sentido general, preferido en AmE)' },
    { id: 23, term: 'look forward to', category: 'gerund', explanation: 'esperar con ilusión' },
    { id: 24, term: 'love (general sense, AmE prefer)', category: 'gerund', explanation: 'encantar (sentido general, preferido en AmE)' },
    { id: 25, term: 'mind', category: 'gerund', explanation: 'importar (en negativas/preguntas)' },
    { id: 26, term: 'miss', category: 'gerund', explanation: 'echar de menos (hacer algo)' },
    { id: 27, term: 'postpone', category: 'gerund', explanation: 'posponer' },
    { id: 28, term: 'practice (practise UK)', category: 'gerund', explanation: 'practicar' },
    { id: 29, term: 'prefer (general sense, AmE prefer)', category: 'gerund', explanation: 'preferir (sentido general, preferido en AmE)' },
    { id: 30, term: 'recommend', category: 'gerund', explanation: 'recomendar' },
    { id: 31, term: 'regret (about a past action)', category: 'gerund', explanation: 'lamentar (acción pasada)' },
    { id: 32, term: 'risk', category: 'gerund', explanation: 'arriesgar(se)' },
    { id: 33, term: 'spend time', category: 'gerund', explanation: 'pasar tiempo (haciendo algo)' },
    { id: 34, term: 'stop (finish an action)', category: 'gerund', explanation: 'dejar de (hacer algo)' },
    { id: 35, term: 'suggest', category: 'gerund', explanation: 'sugerir' },

    // INFINITIVE WITH TO
    { id: 36, term: 'Después adjetivos (e.g., easy to do, nice to see you)', category: 'infinitive_to', explanation: 'After many adjectives' },
    { id: 37, term: 'Expresar propósito (e.g., I study to learn)', category: 'infinitive_to', explanation: 'To express purpose' },
    { id: 38, term: 'afford', category: 'infinitive_to', explanation: 'permitirse económicamente' },
    { id: 39, term: 'agree', category: 'infinitive_to', explanation: 'estar de acuerdo' },
    { id: 40, term: 'appear', category: 'infinitive_to', explanation: 'parecer' },
    { id: 41, term: 'arrange', category: 'infinitive_to', explanation: 'organizar, preparar' },
    { id: 42, term: 'be able', category: 'infinitive_to', explanation: 'ser capaz, poder' },
    { id: 43, term: "can't wait", category: 'infinitive_to', explanation: 'estar deseando' },
    { id: 44, term: 'choose', category: 'infinitive_to', explanation: 'elegir' },
    { id: 45, term: 'decide', category: 'infinitive_to', explanation: 'decidir' },
    { id: 46, term: 'deserve', category: 'infinitive_to', explanation: 'merecer' },
    { id: 47, term: 'expect', category: 'infinitive_to', explanation: 'esperar (que algo ocurra)' },
    { id: 48, term: 'forget (fail to do something)', category: 'infinitive_to', explanation: 'olvidar (hacer algo que se debía)' },
    { id: 49, term: 'happen', category: 'infinitive_to', explanation: 'resultar que, suceder que' },
    { id: 50, term: 'hate (specific situation, often with would)', category: 'infinitive_to', explanation: 'odiar (situación específica, a menudo con would)' },
    { id: 51, term: 'help', category: 'infinitive_to', explanation: 'ayudar' }, // También puede ir sin TO (bare infinitive)
    { id: 52, term: 'hesitate', category: 'infinitive_to', explanation: 'dudar, vacilar' },
    { id: 53, term: 'hope', category: 'infinitive_to', explanation: 'esperar (con deseo)' },
    { id: 54, term: 'learn', category: 'infinitive_to', explanation: 'aprender' },
    { id: 55, term: 'like (specific situation, often with would)', category: 'infinitive_to', explanation: 'gustar (situación específica, a menudo con would)' },
    { id: 56, term: 'love (specific situation, often with would)', category: 'infinitive_to', explanation: 'encantar (situación específica, a menudo con would)' },
    { id: 57, term: 'make (passive voice, e.g., was made to wait)', category: 'infinitive_to', explanation: 'hacer (voz pasiva)' },
    { id: 58, term: 'manage', category: 'infinitive_to', explanation: 'conseguir, apañarse para' },
    { id: 59, term: 'need (someone needs to do)', category: 'infinitive_to', explanation: 'necesitar (que alguien haga algo)' },
    { id: 60, term: 'offer', category: 'infinitive_to', explanation: 'ofrecer(se)' },
    { id: 61, term: 'plan', category: 'infinitive_to', explanation: 'planear' },
    { id: 62, term: 'prefer (specific situation, often with would)', category: 'infinitive_to', explanation: 'preferir (situación específica, a menudo con would)' },
    { id: 63, term: 'pretend', category: 'infinitive_to', explanation: 'fingir' },
    { id: 64, term: 'promise', category: 'infinitive_to', explanation: 'prometer' },
    { id: 65, term: 'refuse', category: 'infinitive_to', explanation: 'negarse a' },
    { id: 66, term: 'remember (task for the future)', category: 'infinitive_to', explanation: 'acordarse de (hacer algo futuro)' },
    { id: 67, term: 'seem', category: 'infinitive_to', explanation: 'parecer' },
    { id: 68, term: 'teach (how to)', category: 'infinitive_to', explanation: 'enseñar (a hacer algo)' },
    { id: 69, term: 'tend', category: 'infinitive_to', explanation: 'tender a' },
    { id: 70, term: 'threaten', category: 'infinitive_to', explanation: 'amenazar (con)' },
    { id: 71, term: 'want', category: 'infinitive_to', explanation: 'querer' },
    { id: 72, term: 'would like', category: 'infinitive_to', explanation: 'gustaría' },
    { id: 73, term: 'advise + object', category: 'infinitive_to', explanation: 'aconsejar a alguien que' },
    { id: 74, term: 'allow + object', category: 'infinitive_to', explanation: 'permitir a alguien que' },
    { id: 75, term: 'ask + object', category: 'infinitive_to', explanation: 'pedir a alguien que' },
    { id: 76, term: 'invite + object', category: 'infinitive_to', explanation: 'invitar a alguien a' },
    { id: 77, term: 'need + object', category: 'infinitive_to', explanation: 'necesitar que alguien' },
    { id: 78, term: 'order + object', category: 'infinitive_to', explanation: 'ordenar a alguien que' },
    { id: 79, term: 'persuade + object', category: 'infinitive_to', explanation: 'persuadir a alguien para' },
    { id: 80, term: 'teach + object', category: 'infinitive_to', explanation: 'enseñar a alguien a' },
    { id: 81, term: 'tell + object', category: 'infinitive_to', explanation: 'decir a alguien que' },
    { id: 82, term: 'want + object', category: 'infinitive_to', explanation: 'querer que alguien' },

    // INFINITIVE WITHOUT TO (Bare Infinitive)
    { id: 83, term: 'Verbos Modales (can, could, may, might, must, shall, should, will, would)', category: 'infinitive_no_to', explanation: 'After modal verbs' },
    { id: 84, term: 'let + object', category: 'infinitive_no_to', explanation: 'dejar, permitir (a alguien hacer)' },
    { id: 85, term: 'make + object (causative/active voice)', category: 'infinitive_no_to', explanation: 'hacer (que alguien haga - voz activa)' },
    { id: 86, term: 'had better', category: 'infinitive_no_to', explanation: 'sería mejor (que)' },
    { id: 87, term: 'would rather', category: 'infinitive_no_to', explanation: 'preferiría' },
    { id: 88, term: 'help + object (optional to)', category: 'infinitive_no_to', explanation: 'ayudar (a alguien a) - TO opcional' }, // Help puede ir con o sin TO

    // BOTH (Gerund or Infinitive with TO, sometimes with meaning change)
    { id: 89, term: 'start', category: 'both', explanation: 'empezar (poca diferencia de significado)' },
    { id: 90, term: 'begin', category: 'both', explanation: 'comenzar (poca diferencia de significado)' },
    { id: 91, term: 'continue', category: 'both', explanation: 'continuar (poca diferencia de significado)' },
    { id: 92, term: 'remember (memory of a past action)', category: 'gerund', explanation: 'recordar (haber hecho algo pasado)' }, // Separado de remember to do
    { id: 93, term: 'forget (memory of a past event)', category: 'gerund', explanation: 'olvidar (algo que pasó)' }, // Separado de forget to do
    { id: 94, term: 'try (make an effort)', category: 'infinitive_to', explanation: 'intentar (algo difícil)' }, // Separado de try doing
    { id: 95, term: 'try (experiment)', category: 'gerund', explanation: 'probar (a hacer algo, experimentar)' }, // Separado de try to do
    { id: 96, term: 'need (passive sense, sth needs doing)', category: 'gerund', explanation: 'necesitar (ser reparado/hecho - pasivo)' }, // Separado de need to do
    { id: 97, term: 'stop (interrupt an action to do sth else)', category: 'infinitive_to', explanation: 'parar(se) para (hacer otra cosa)' }, // Separado de stop doing

    // NOTA: Los verbos like, love, hate, prefer ya están duplicados arriba con sus condiciones específicas.
    // La categoría 'both' aquí es para verbos donde AMBAS formas son comunes SIN gran cambio de significado (start, begin, continue)
];
