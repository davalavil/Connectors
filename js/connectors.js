// js/connectors.js

// Lista de conectores y sus traducciones
// Cada objeto debe tener un 'id' único, 'en' (inglés) y 'es' (español)
const conectoresOriginal = [
    // --- Lista Original (con correcciones menores) ---
    { id: 1, en: 'However', es: 'sin embargo' },
    { id: 2, en: 'Whatever', es: 'lo que' },
    { id: 3, en: 'Although', es: 'a pesar de, aunque' },
    { id: 4, en: 'So', es: 'entonces, así que' }, // Añadida alternativa común
    { id: 5, en: 'Therefore', es: 'por lo tanto' },
    { id: 6, en: 'As soon as', es: 'tan pronto como' },
    { id: 7, en: 'Instead of', es: 'en lugar de' },
    { id: 8, en: 'Then', es: 'luego, entonces' }, // Añadida alternativa
    { id: 9, en: 'Once', es: 'una vez (que)' }, // Aclaración
    { id: 10, en: 'While', es: 'mientras' },
    { id: 11, en: 'But', es: 'pero' },
    { id: 12, en: 'Because', es: 'porque' },
    { id: 13, en: 'Even', es: 'incluso' },
    { id: 14, en: 'Also', es: 'también' }, // Corregido acento
    { id: 15, en: 'Still', es: 'aún, todavía' }, // Añadida alternativa
    { id: 16, en: 'Above all', es: 'sobre todo' }, // Corregido (separado)
    { id: 17, en: 'Either', es: 'o / tampoco' }, // Traducción más general
    { id: 18, en: 'Neither', es: 'ni' },
    { id: 19, en: 'That', es: 'que / ese / esa' }, // Añadida alternativa
    { id: 20, en: 'For a while', es: 'por un momento, durante un tiempo' }, // Corregido y ampliado
    { id: 21, en: 'Meanwhile', es: 'mientras tanto' },
    { id: 22, en: 'For', es: 'para, por, durante' }, // Añadidos significados comunes
    { id: 23, en: 'Moreover', es: 'además' }, // Simplificado (más común)
    { id: 24, en: 'Because Of', es: 'debido a, a causa de' }, // Añadida alternativa
    { id: 25, en: 'Due to', es: 'debido a' },
    { id: 26, en: 'Furthermore', es: 'además, por otra parte' }, // Añadida alternativa común
    { id: 27, en: 'Such as', es: 'tal(es) como' }, // Plural
    { id: 28, en: 'In fact', es: 'de hecho' },
    { id: 29, en: 'Too', es: 'también, demasiado' }, // Añadido significado común

    // --- Nuevos Conectores Añadidos ---
    { id: 30, en: 'If', es: 'si (condicional)' },
    { id: 31, en: 'Unless', es: 'a menos que' },
    { id: 32, en: 'As long as', es: 'siempre que, con tal de que' },
    { id: 33, en: 'In case', es: 'en caso de (que), por si' },
    { id: 34, en: 'In order to', es: 'para, con el fin de' },
    { id: 35, en: 'So that', es: 'para que' },
    { id: 36, en: 'Despite / In spite of', es: 'a pesar de' }, // Agrupados, misma traducción
    { id: 37, en: 'Besides', es: 'además (de)' },
    { id: 38, en: 'Both...and', es: 'tanto...como' }, // Correlativo
    { id: 39, en: 'Whereas', es: 'mientras que' },
    { id: 40, en: 'As a result', es: 'como resultado, en consecuencia' },
    { id: 41, en: 'For example', es: 'por ejemplo' },
    { id: 42, en: 'After', es: 'después (de)' },
    { id: 43, en: 'Before', es: 'antes (de)' },
    { id: 44, en: 'Not only...but also', es: 'no solo...sino también' } // Correlativo

];

// Puedes añadir más conectores aquí siguiendo el mismo formato:
// { id: 45, en: 'Next', es: 'Siguiente, Luego' },
