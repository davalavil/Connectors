// js/script.js (Versión con estado "revelado" (gris) que no cuenta puntos)

// --- Referencias a Elementos del DOM ---
const tableBody = document.getElementById('verb-table-body');
const btnRandom = document.getElementById('btn-random');
const btnInfinitive = document.getElementById('btn-infinitive');
const btnPastSimple = document.getElementById('btn-past-simple');
const btnPastParticiple = document.getElementById('btn-past-participle');
const btnTranslation = document.getElementById('btn-translation');
const btnCheck = document.getElementById('btn-check');
const feedbackDiv = document.getElementById('feedback');
// const numVerbsInput = document.getElementById('num-verbs');

// --- Variables Globales ---
let currentMode = null;
let verbsToDisplay = [];
let originalVerbDataMap = new Map();

// --- Funciones ---

/** Baraja un array in-place */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/** Prepara e inicia el juego */
function startGame(mode) {
    currentMode = mode;
    feedbackDiv.innerHTML = '';
    tableBody.innerHTML = '';
    originalVerbDataMap.clear();

    verbsToDisplay = shuffleArray([...verbList]);

    verbsToDisplay.forEach((verbData, displayIndex) => {
        const originalKey = verbData[0] + '-' + displayIndex;
        originalVerbDataMap.set(originalKey, verbData);

        const row = tableBody.insertRow();
        row.dataset.verbKey = originalKey;

        verbData.forEach((text, colIndex) => {
            const cell = row.insertCell();
            let makeInput = false;

            if (colIndex === 4) { // Columna Tipo + Botón
                const typeText = document.createElement('span');
                typeText.textContent = text;
                cell.appendChild(typeText);

                const revealBtn = document.createElement('button');
                revealBtn.innerHTML = '👁️';
                revealBtn.classList.add('reveal-button');
                revealBtn.title = 'Mostrar respuestas (no contará como acierto)'; // Tooltip actualizado
                revealBtn.setAttribute('aria-label', `Mostrar respuestas para ${verbData[0]}`);
                revealBtn.addEventListener('click', handleRevealClick);
                cell.appendChild(revealBtn);

            } else { // Columnas Verbos/Traducción
                switch (mode) {
                    case 'random': makeInput = Math.random() < 0.4; break;
                    case 'infinitive': makeInput = (colIndex === 0); break;
                    case 'past_simple': makeInput = (colIndex === 1); break;
                    case 'past_participle': makeInput = (colIndex === 2); break;
                    case 'translation': makeInput = (colIndex === 3); break;
                }

                if (makeInput) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.dataset.colIndex = colIndex;
                    input.setAttribute('aria-label', `Respuesta para ${getHeaderName(colIndex)} del verbo ${verbData[0]}`);
                    input.addEventListener('blur', handleInputBlur);
                    cell.appendChild(input);
                } else {
                    cell.textContent = text;
                }
            }
        });
    });

    if (mode === 'random') { ensureOneInputPerRow(); }

    // Mensaje inicial actualizado
    feedbackDiv.textContent = 'Rellena las casillas. Verde/Amarillo: Acierto. Rojo: Fallo. Gris: Respuesta revelada (no puntúa). Usa 👁️ para revelar.';
    console.log(`Juego iniciado en modo: ${mode}. Verbos mostrados: ${verbsToDisplay.length}`);
}

/** Auxiliar para modo 'random' */
function ensureOneInputPerRow() {
    // ... (código sin cambios) ...
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const inputsInRow = row.querySelectorAll('input');
        if (inputsInRow.length === 0 && originalVerbDataMap.has(row.dataset.verbKey)) {
            const cells = row.querySelectorAll('td');
            let randomIndex;
            do { randomIndex = Math.floor(Math.random() * 4); } while (randomIndex === 4);

            const cellToChange = cells[randomIndex];
            const verbKey = row.dataset.verbKey;
            const originalData = originalVerbDataMap.get(verbKey);

            if (!originalData) { console.error("Asegurando input: Datos no encontrados:", verbKey); return; }

            cellToChange.innerHTML = '';
            const input = document.createElement('input');
            input.type = 'text';
            input.dataset.colIndex = randomIndex;
            input.setAttribute('aria-label', `Respuesta para ${getHeaderName(randomIndex)} del verbo ${originalData[0]}`);
            input.addEventListener('blur', handleInputBlur);
            cellToChange.appendChild(input);
            console.log(`Input asegurado en fila con clave ${verbKey}, columna ${randomIndex}`);
        }
    });
}

/** Devuelve nombre de cabecera */
function getHeaderName(colIndex) {
    // ... (código sin cambios) ...
    const headers = ["Infinitivo", "Pasado Simple", "Pasado Participio", "Traducción"];
    return headers[colIndex] || "Desconocido";
}

/** Manejador del evento 'blur' */
function handleInputBlur(event) {
    const input = event.target;
    // Solo comprobar si NO ha sido revelado previamente
    if (!input.classList.contains('revealed')) {
        checkSingleInput(input);
    }
}

/**
 * Comprueba UN input y aplica estilo (verde/amarillo/rojo).
 * IGNORA los inputs que ya tengan la clase 'revealed'.
 * @returns {boolean} `true` si es verde/amarillo, `false` si es rojo/revelado/error.
 */
function checkSingleInput(input) {
    // --- ¡NUEVO! Si ya está revelado, no hacer nada más y no contar como acierto ---
    if (input.classList.contains('revealed')) {
        return false;
    }

    const userAnswer = input.value.trim();
    const cell = input.closest('td');
    const row = input.closest('tr');

    if (!row || !cell || !row.dataset.verbKey || typeof input.dataset.colIndex === 'undefined') {
         console.error("CheckSingleInput: Info incompleta:", input);
         input.classList.remove('correct', 'incorrect', 'partial', 'revealed');
         input.classList.add('incorrect');
         return false;
    }

    const verbKey = row.dataset.verbKey;
    const colIndex = parseInt(input.dataset.colIndex);
    const originalData = originalVerbDataMap.get(verbKey);

    if (!originalData) {
        console.error("CheckSingleInput: Datos no encontrados:", verbKey);
        input.classList.remove('correct', 'incorrect', 'partial', 'revealed');
        input.classList.add('incorrect');
        return false;
    }

    const correctAnswerString = originalData[colIndex];
    const normalizeString = (str) => str.toLowerCase().split('/').map(s => s.trim()).filter(s => s !== '').join('/');
    const normalizedUserAnswer = normalizeString(userAnswer);
    const normalizedCorrectAnswer = normalizeString(correctAnswerString);
    const possibleAnswers = normalizedCorrectAnswer.split('/');
    const hasMultipleOptions = possibleAnswers.length > 1;

    input.classList.remove('correct', 'incorrect', 'partial'); // Quitar estados previos (pero no 'revealed')
    input.placeholder = '';
    input.title = '';

    let isConsideredCorrectOrPartial = false;

    if (normalizedUserAnswer === '') {
        // Vacío: no marcar en blur
    } else if (normalizedUserAnswer === normalizedCorrectAnswer) { // Verde
        input.classList.add('correct');
        isConsideredCorrectOrPartial = true;
    } else if (hasMultipleOptions && possibleAnswers.includes(normalizedUserAnswer)) { // Amarillo
        input.classList.add('partial');
        const otherOptions = possibleAnswers.filter(ans => ans !== normalizedUserAnswer).join(' / ');
        if (otherOptions) { input.title = `También válido: ${otherOptions}`; }
        isConsideredCorrectOrPartial = true;
    } else { // Rojo
        input.classList.add('incorrect');
        input.placeholder = `Correcto: ${correctAnswerString}`;
        isConsideredCorrectOrPartial = false;
    }

    return isConsideredCorrectOrPartial;
}


/**
 * Manejador para el clic en el botón de revelar (ojo).
 * Aplica el estado 'revealed' (gris) y deshabilita.
 */
function handleRevealClick(event) {
    const button = event.target.closest('button');
    if (!button) return;

    const row = button.closest('tr');
    if (!row || !row.dataset.verbKey) return;

    const verbKey = row.dataset.verbKey;
    const originalData = originalVerbDataMap.get(verbKey);

    if (!originalData) { console.error("RevealClick: Datos no encontrados:", verbKey); return; }

    console.log(`Revelando respuestas para: ${originalData[0]}`);
    const inputsInRow = row.querySelectorAll('input[type="text"]');

    inputsInRow.forEach(input => {
        if (typeof input.dataset.colIndex !== 'undefined') {
            const colIndex = parseInt(input.dataset.colIndex);
            const correctAnswer = originalData[colIndex]; // Usar la respuesta original completa

            input.value = correctAnswer; // Poner el valor correcto

            // --- Aplicar estado REVEALED ---
            input.classList.remove('correct', 'partial', 'incorrect'); // Quitar otros estados
            input.classList.add('revealed'); // Añadir clase gris
            input.placeholder = ''; // Limpiar placeholder
            input.title = ''; // Limpiar tooltip

            input.disabled = true; // Deshabilitar el input
        }
    });
    button.disabled = true; // Deshabilitar el botón revelar
}


/**
 * Comprueba TODAS las respuestas, contando aciertos y revelados por separado.
 */
function checkAllAnswers() {
     if (!currentMode) {
        feedbackDiv.textContent = 'Selecciona un modo de juego para empezar.';
        return;
    }
    const inputs = tableBody.querySelectorAll('input[type="text"]');
    let correctOrPartialCount = 0; // Contador para verdes/amarillos
    let revealedCount = 0; // --- NUEVO CONTADOR ---
    let totalInputs = inputs.length;
    let answeredInputs = 0;

    if (totalInputs === 0) {
        feedbackDiv.textContent = 'No hay nada que comprobar en este modo.';
        return;
    }

    inputs.forEach(input => {
        // Si está revelado, solo contar como revelado y pasar al siguiente
        if (input.classList.contains('revealed')) {
            revealedCount++; // Incrementar contador de revelados
            if (input.value.trim() !== '') { answeredInputs++; } // Contar como respondido si tiene valor
            return; // No seguir comprobando este input
        }

        // Si no está revelado, comprobar normalmente
        const isCorrectOrPartial = checkSingleInput(input);
        if (isCorrectOrPartial) {
            correctOrPartialCount++;
        }

        // Marcar vacíos como incorrectos (solo si no están revelados)
        if (input.value.trim() === '' && !isCorrectOrPartial) { // Ya sabemos que no es 'revealed'
             input.classList.add('incorrect');
             const row = input.closest('tr');
             const colIndex = parseInt(input.dataset.colIndex);
             const originalData = originalVerbDataMap.get(row?.dataset.verbKey);
             if (originalData && typeof originalData[colIndex] !== 'undefined') {
                 input.placeholder = `Respuesta: ${originalData[colIndex]}`;
             }
        }
        // Contar como respondido si tiene valor (y no fue revelado)
        if (input.value.trim() !== '') {
            answeredInputs++;
        }
    });

    // --- Mensaje de Feedback Actualizado ---
    let feedbackMsg = `Comprobación final: ${correctOrPartialCount} correctas (✓), `;
    if (revealedCount > 0) {
         feedbackMsg += `${revealedCount} reveladas (👁️), `;
    }
    feedbackMsg += `de ${totalInputs} casillas. (${answeredInputs} respondidas).`;

    feedbackDiv.textContent = feedbackMsg;
    feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


// --- Event Listeners (Configuración inicial) ---
btnRandom.addEventListener('click', () => startGame('random'));
btnInfinitive.addEventListener('click', () => startGame('infinitive'));
btnPastSimple.addEventListener('click', () => startGame('past_simple'));
btnPastParticiple.addEventListener('click', () => startGame('past_participle'));
btnTranslation.addEventListener('click', () => startGame('translation'));
btnCheck.addEventListener('click', checkAllAnswers);
btnCheck.textContent = 'Comprobar Todo / Ver Respuestas';

// --- Inicio ---
feedbackDiv.textContent = "Selecciona un modo de juego para empezar."; // Mensaje inicial estándar
