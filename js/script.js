// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Comprobación Inicial ---
    if (typeof conectoresOriginal === 'undefined') {
        console.error("ERROR: El archivo 'connectors.js' no se ha cargado correctamente o la variable 'conectoresOriginal' no está definida.");
        alert("Error crítico al cargar los datos del juego. Revisa la consola.");
        return;
    }
    // <<< NUEVO: Comprobar si Sortable está cargado >>>
    if (typeof Sortable === 'undefined') {
        console.error("ERROR: La librería SortableJS no se ha cargado correctamente.");
        alert("Error al cargar la funcionalidad de arrastrar. Revisa la consola.");
        // Podríamos deshabilitar el juego de emparejar aquí si quisiéramos
    }


    // --- Variables Globales ---
    let currentGameMode = null;
    let timerInterval = null;
    let timeLeft = 0;
    let currentConnectors = [];
    let score = 0;
    let fillBlanksIncorrectScore = 0;
    let fillBlanksFinalized = false;
    let sortableInstance = null; // <<< NUEVO: Para guardar la instancia de SortableJS

    // --- Elementos del DOM Comunes ---
    const mainTitle = document.getElementById('main-title');
    const gameSelectionDiv = document.getElementById('game-selection');
    const backToSelectionButtons = document.querySelectorAll('.back-to-selection');

    // --- Elementos DOM Juego Emparejar (Matching) ---
    const matchingContainer = document.getElementById('matching-container');
    const matchingSetupDiv = document.getElementById('matching-setup');
    const matchingGameDiv = document.getElementById('matching-game');
    const matchingTimeSelect = document.getElementById('matching-time-select');
    const startMatchingBtn = document.getElementById('start-matching-btn');
    const wordArea = document.getElementById('word-area'); // Contenedor para SortableJS
    const currentScoreSpan = document.getElementById('current-score');
    const totalPairsSpan = document.getElementById('total-pairs');
    const matchingTimerSpan = document.getElementById('time-left');
    const giveUpBtn = document.getElementById('give-up-btn');
    const restartMatchingBtn = document.getElementById('restart-matching-btn');
    const resultsOverlay = document.getElementById('results-overlay');
    const correctPairsList = document.getElementById('correct-pairs-list');
    const playAgainMatchingBtn = document.getElementById('play-again-matching-btn');
    // --- Eliminado: let draggedElement = null; ---

    // --- Elementos DOM Juego Rellenar (Fill Blanks) ---
    const fillBlanksContainer = document.getElementById('fill-blanks-container');
    const fillBlanksSetupDiv = document.getElementById('fill-blanks-setup');
    const fillBlanksGameDiv = document.getElementById('fill-blanks-game');
    const translationDirectionSelect = document.getElementById('translation-direction');
    const fillBlanksTimeSelect = document.getElementById('fill-blanks-time-select');
    const startFillBlanksBtn = document.getElementById('start-fill-blanks-btn');
    const fillBlanksTimerSpan = document.getElementById('fill-blanks-time-left');
    const fillBlanksScoreSpan = document.getElementById('fill-blanks-current-score');
    const fillBlanksIncorrectScoreSpan = document.getElementById('fill-blanks-incorrect-score');
    const fillBlanksTotalSpan = document.getElementById('fill-blanks-total');
    const fillBlanksTableBody = document.querySelector('#fill-blanks-table tbody');
    const checkAnswersBtn = document.getElementById('check-answers-btn');
    const restartFillBlanksBtn = document.getElementById('restart-fill-blanks-btn');
    let translationDirection = 'en-es';

    // --- Funciones de Utilidad ---
    function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; } return array; }
    function formatTime(seconds) { const minutes = Math.floor(seconds / 60); const remainingSeconds = seconds % 60; return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`; }

    // --- Función de Control de Visibilidad ---
    function showScreen(screen) {
        gameSelectionDiv.classList.add('hidden'); matchingContainer.classList.add('hidden'); fillBlanksContainer.classList.add('hidden');
        matchingSetupDiv.classList.add('hidden'); matchingGameDiv.classList.add('hidden'); fillBlanksSetupDiv.classList.add('hidden');
        fillBlanksGameDiv.classList.add('hidden'); resultsOverlay.classList.add('hidden');
        let titleText = "Conectores";
        if (screen === 'selection') { gameSelectionDiv.classList.remove('hidden'); titleText = "Conectores"; }
        else if (screen === 'matching-setup') { matchingContainer.classList.remove('hidden'); matchingSetupDiv.classList.remove('hidden'); titleText = "Emparejar Conectores"; }
        else if (screen === 'matching-game') { matchingContainer.classList.remove('hidden'); matchingGameDiv.classList.remove('hidden'); titleText = "Emparejar Conectores"; }
        else if (screen === 'fill-blanks-setup') { fillBlanksContainer.classList.remove('hidden'); fillBlanksSetupDiv.classList.remove('hidden'); titleText = "Rellenar Conectores"; }
        else if (screen === 'fill-blanks-game') { fillBlanksContainer.classList.remove('hidden'); fillBlanksGameDiv.classList.remove('hidden'); titleText = "Rellenar Conectores"; }
        if(mainTitle) { mainTitle.textContent = titleText; }
    }

    // --- Funciones del Temporizador (Compartidas) ---
    function updateTimerDisplay() { const formattedTime = formatTime(timeLeft); if (currentGameMode === 'matching') { matchingTimerSpan.textContent = formattedTime; } else if (currentGameMode === 'fill-blanks') { fillBlanksTimerSpan.textContent = formattedTime; } }
    function startTimer(duration) { if (timerInterval) clearInterval(timerInterval); timeLeft = duration; updateTimerDisplay(); timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); if (timeLeft <= 0) { clearInterval(timerInterval); timerInterval = null; handleTimeUp(); } }, 1000); }
    function stopTimer() { clearInterval(timerInterval); timerInterval = null; }
    function handleTimeUp() { console.log("Time's up!"); if (currentGameMode === 'matching') { showMatchingResults(false); } else if (currentGameMode === 'fill-blanks') { if (!fillBlanksFinalized) { finalizeFillBlanksGame(); } } }

    // --- Lógica Juego Emparejar (Matching) - MODIFICADA PARA SORTABLEJS ---

    // <<< NUEVO: Función auxiliar para comprobar pareja >>>
    function checkMatch(pill1, pill2) {
        if (!pill1 || !pill2 || !pill1.dataset || !pill2.dataset) return false; // Comprobar que son elementos válidos
        // Ignorar si alguna ya está emparejada/oculta
        if (pill1.classList.contains('correct-match') || pill2.classList.contains('correct-match') ||
            pill1.style.visibility === 'hidden' || pill2.style.visibility === 'hidden') {
            return false;
        }
        const id1 = pill1.dataset.id;
        const lang1 = pill1.dataset.lang;
        const id2 = pill2.dataset.id;
        const lang2 = pill2.dataset.lang;
        return id1 === id2 && lang1 !== lang2;
    }

    // <<< NUEVO: Función auxiliar para aplicar resultado correcto >>>
    function applyCorrectMatch(pill1, pill2) {
        console.log("Match found:", pill1.textContent, "&", pill2.textContent);
        pill1.classList.add('correct-match');
        pill2.classList.add('correct-match');

        // Deshabilitar la interacción con SortableJS para estos elementos (la forma más simple es ocultarlos)
        // Opcional: Podríamos intentar quitarlos de la instancia de sortable, pero ocultar es más fácil.
        setTimeout(() => {
            pill1.style.display = 'none'; // Usar display none para que no ocupen espacio
            pill2.style.display = 'none';

            score++; // score aquí es el de matching
            currentScoreSpan.textContent = score;

            // Comprobar victoria (contando los elementos restantes que NO están ocultos)
            const remainingPills = wordArea.querySelectorAll('.word-pill:not([style*="display: none"])').length;
            if (remainingPills === 0) {
            // if (score * 2 === currentConnectors.length * 2) { // Alternativa: si score es la mitad del total de píldoras
                console.log("¡Todas las parejas encontradas!");
                stopTimer();
                // Pequeña pausa antes de mostrar resultados
                setTimeout(() => showMatchingResults(true), 300);
            }
        }, 160); // Tiempo un poco mayor que la animación de SortableJS (150ms)
    }

     // <<< NUEVO: Función auxiliar para feedback incorrecto >>>
     function applyIncorrectMatchFeedback(pill) {
        if (!pill) return;
        pill.classList.add('incorrect-match');
        setTimeout(() => {
            // Solo quitar si todavía existe el elemento
            if (pill) {
                pill.classList.remove('incorrect-match');
            }
        }, 500); // Duración del shake
     }


    function renderMatchingWords() {
        wordArea.innerHTML = ''; // Limpiar área
        const wordsToRender = [];
        currentConnectors = shuffleArray([...conectoresOriginal]);
        score = 0; // Reset score para este juego
        currentScoreSpan.textContent = score;
        totalPairsSpan.textContent = currentConnectors.length;

        currentConnectors.forEach(pair => {
            wordsToRender.push({ id: pair.id, lang: 'en', text: pair.en });
            wordsToRender.push({ id: pair.id, lang: 'es', text: pair.es });
        });

        shuffleArray(wordsToRender);

        wordsToRender.forEach(word => {
            const pill = document.createElement('div');
            pill.classList.add('word-pill', `lang-${word.lang}`);
            pill.textContent = word.text;
            // --- Eliminado: pill.draggable = true; ---
            pill.dataset.id = word.id;
            pill.dataset.lang = word.lang;
            // --- Eliminados: Listeners dragstart/dragend ---
            wordArea.appendChild(pill);
        });

        // --- Eliminados: Listeners dragover/drop en wordArea ---

        // <<< NUEVO: Inicializar SortableJS >>>
        if (sortableInstance) {
            sortableInstance.destroy(); // Destruir instancia previa si existe
        }
        if (typeof Sortable !== 'undefined') { // Solo inicializar si la librería cargó
            sortableInstance = Sortable.create(wordArea, {
                animation: 150, // ms, animación suave
                ghostClass: 'dragging', // Reutilizar clase CSS para el fantasma
                // filter: '.correct-match', // Intentar que no se puedan mover las correctas (puede no funcionar bien)
                // preventOnFilter: true,

                // Evento que se dispara al soltar un elemento
                onEnd: function (evt) {
                    const movedItem = evt.item; // El elemento que se movió

                    // Comprobar si el juego está activo
                    if (!timerInterval && timeLeft > 0) { // Si el timer no está corriendo pero queda tiempo (no ha empezado?)
                         console.log("Intento de mover fuera de tiempo activo.");
                         // Cancelar el movimiento (más complejo, por ahora no lo hacemos)
                        return;
                    }
                     if(resultsOverlay.classList.contains('hidden') === false) { // Si se muestran resultados
                         return;
                     }


                    // --- Lógica de comprobación de vecinos ---
                    const prevSibling = movedItem.previousElementSibling;
                    const nextSibling = movedItem.nextElementSibling;
                    let matchFound = false;
                    let targetPill = null;

                    // Comprobar vecino anterior
                    if (prevSibling && checkMatch(movedItem, prevSibling)) {
                            matchFound = true;
                            targetPill = prevSibling;
                    }
                    // Comprobar vecino siguiente (solo si no se encontró antes)
                    if (!matchFound && nextSibling && checkMatch(movedItem, nextSibling)) {
                            matchFound = true;
                            targetPill = nextSibling;
                    }

                    // Aplicar resultado
                    if (matchFound && targetPill) {
                        applyCorrectMatch(movedItem, targetPill);
                    } else {
                        // Si no hay pareja vecina, aplicar feedback de error
                        console.log("No match with neighbors.");
                        applyIncorrectMatchFeedback(movedItem);
                    }
                }
            });
        } else {
             console.error("Sortable no está definido. El juego de emparejar no funcionará.");
             // Opcional: Mostrar un mensaje al usuario en la UI
        }
    }

    // --- ELIMINADAS FUNCIONES ANTIGUAS ---
    // function handleDragStart(event) { ... }
    // function handleDragEnd(event) { ... }
    // function handleDragOver(event) { ... }
    // function handleDrop(event) { ... }


    // Muestra los resultados (igual que antes)
    function showMatchingResults(won) {
        stopTimer();
        // <<< NUEVO: Deshabilitar SortableJS al mostrar resultados >>>
        if (sortableInstance) {
            sortableInstance.option('disabled', true);
        }
        correctPairsList.innerHTML = '';
        conectoresOriginal.forEach(pair => { const div = document.createElement('div'); div.textContent = `${pair.en} = ${pair.es}`; correctPairsList.appendChild(div); });
        let resultTitle = "Resultados"; if (won) resultTitle = "¡Felicidades, has ganado!"; else if (timeLeft <= 0) resultTitle = "¡Se acabó el tiempo!"; else resultTitle = "Te has rendido";
        resultsOverlay.querySelector('h2').textContent = resultTitle; resultsOverlay.classList.remove('hidden');
        giveUpBtn.disabled = true; restartMatchingBtn.disabled = false;
    }

    // Inicializa el juego (igual que antes, pero llama a renderMatchingWords actualizado)
    function initializeMatchingGame() {
        currentGameMode = 'matching';
        const selectedMinutes = parseInt(matchingTimeSelect.value, 10);
        score = 0; // score para matching
        // draggedElement = null; // ya no existe
        renderMatchingWords(); // <<< Llama a la función que ahora inicializa SortableJS
        showScreen('matching-game');
        giveUpBtn.disabled = false;
        restartMatchingBtn.disabled = true;
        resultsOverlay.classList.add('hidden');
        // <<< NUEVO: Habilitar SortableJS al iniciar (si fue deshabilitado) >>>
        if (sortableInstance) {
            sortableInstance.option('disabled', false);
        }
        startTimer(selectedMinutes * 60);
    }

     // Resetea el juego
     function resetMatchingGame(goToSetup = false) {
        stopTimer();
        wordArea.innerHTML = ''; // Limpiar área
        score = 0;
        currentScoreSpan.textContent = '0';
        totalPairsSpan.textContent = '0';
        matchingTimerSpan.textContent = '--:--';
        resultsOverlay.classList.add('hidden');
        giveUpBtn.disabled = false;
        restartMatchingBtn.disabled = false; // Permitir reiniciar
        // <<< NUEVO: Destruir la instancia de SortableJS para limpiar >>>
        if (sortableInstance) {
            sortableInstance.destroy();
            sortableInstance = null;
        }
        // --- Eliminado: Limpieza de listeners nativos ---

        if (goToSetup) {
             showScreen('matching-setup');
        } else {
            initializeMatchingGame(); // Reinicia (renderizará y creará nueva instancia sortable)
        }
    }

    // --- Lógica Juego Rellenar (Fill Blanks) ---
    // ... (Sin cambios en esta sección respecto a la versión anterior) ...
    function renderFillBlanksTable() { fillBlanksTableBody.innerHTML = ''; currentConnectors = shuffleArray([...conectoresOriginal]); score = 0; fillBlanksIncorrectScore = 0; fillBlanksScoreSpan.textContent = score; fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; fillBlanksTotalSpan.textContent = currentConnectors.length; translationDirection = translationDirectionSelect.value; fillBlanksFinalized = false; currentConnectors.forEach(pair => { const row = document.createElement('tr'); row.dataset.id = pair.id; const sourceCell = document.createElement('td'); sourceCell.textContent = (translationDirection === 'en-es') ? pair.en : pair.es; const inputCell = document.createElement('td'); const input = document.createElement('input'); input.type = 'text'; input.placeholder = (translationDirection === 'en-es') ? 'Escribe en Español...' : 'Escribe en Inglés...'; input.dataset.id = pair.id; input.disabled = false; input.addEventListener('blur', handleFillBlanksInputBlur); inputCell.appendChild(input); const feedbackCell = document.createElement('td'); feedbackCell.className = 'feedback'; feedbackCell.textContent = '-'; row.appendChild(sourceCell); row.appendChild(inputCell); row.appendChild(feedbackCell); fillBlanksTableBody.appendChild(row); }); }
    function checkAnswer(userInput, correctAnswer) { const normalizedInput = userInput.trim().toLowerCase(); if (!normalizedInput) return false; const correctOptions = correctAnswer.split(/[,/]/).map(opt => opt.trim().toLowerCase()); if (translationDirection === 'en-es') { const normalizedInputNoAccents = normalizedInput.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); if (correctOptions.some(opt => opt.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalizedInputNoAccents)) { return true; } } return correctOptions.includes(normalizedInput); }
    function handleFillBlanksInputBlur(event) { if (fillBlanksFinalized) return; checkSingleAnswerAndUpdate(event.target); }
    function checkSingleAnswerAndUpdate(inputElement) { const row = inputElement.closest('tr'); if (!row) return; const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal.find(p => p.id == id); if (!connectorPair || !feedbackCell) return; const userAnswer = inputElement.value; const correctAnswer = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const wasCorrectBefore = feedbackCell.classList.contains('correct'); const wasIncorrectBefore = feedbackCell.classList.contains('incorrect'); const isCorrectNow = checkAnswer(userAnswer, correctAnswer); const isIncorrectNow = !isCorrectNow && userAnswer.trim() !== ''; let scoreChanged = false; let incorrectScoreChanged = false; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrectNow) { if (!wasCorrectBefore || feedbackCell.textContent !== 'Correcto') { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); scoreChanged = true; } else { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); } } else if (isIncorrectNow) { if (!wasIncorrectBefore || feedbackCell.textContent !== 'Incorrecto') { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); incorrectScoreChanged = true; } else { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); } } else { if (wasCorrectBefore || wasIncorrectBefore || feedbackCell.textContent !== '-') { feedbackCell.textContent = '-'; if (wasIncorrectBefore) { incorrectScoreChanged = true; } if (wasCorrectBefore) { scoreChanged = true; } } else { feedbackCell.textContent = '-'; } } if (!feedbackCell.classList.contains('feedback')) { feedbackCell.classList.add('feedback'); } if (scoreChanged) { if (isCorrectNow && !wasCorrectBefore) { score++; } else if (!isCorrectNow && wasCorrectBefore) { score--; } score = Math.max(0, score); fillBlanksScoreSpan.textContent = score; } if (incorrectScoreChanged) { if (isIncorrectNow && !wasIncorrectBefore) { fillBlanksIncorrectScore++; } else if (!isIncorrectNow && wasIncorrectBefore) { fillBlanksIncorrectScore--; } fillBlanksIncorrectScore = Math.max(0, fillBlanksIncorrectScore); fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; } }
    function finalizeFillBlanksGame() { if (fillBlanksFinalized) { console.log("Finalize called on already finalized game."); return; } fillBlanksFinalized = true; stopTimer(); console.log("--- Finalizing Fill Blanks Game ---"); let finalCalculatedCorrectScore = 0; let finalCalculatedIncorrectScore = 0; const rows = fillBlanksTableBody.querySelectorAll('tr'); if (rows.length === 0) { console.warn("No rows found in table during finalization."); checkAnswersBtn.disabled = true; return; } console.log(`Finalizing ${rows.length} rows...`); rows.forEach((row, index) => { const input = row.querySelector('input[type="text"]'); const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal.find(p => p.id == id); if (!input || !feedbackCell || !connectorPair) { console.error(`Error finding elements for row ${index} (ID: ${id}). Skipping.`); return; } const userAnswer = input.value; const correctAnswerString = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrect = checkAnswer(userAnswer, correctAnswerString); const isIncorrect = !isCorrect && userAnswer.trim() !== ''; input.value = correctAnswerString; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrect) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); finalCalculatedCorrectScore++; } else if (isIncorrect) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); finalCalculatedIncorrectScore++; } else { feedbackCell.textContent = '-'; } if (!feedbackCell.classList.contains('feedback')) { feedbackCell.classList.add('feedback'); } input.disabled = true; }); score = finalCalculatedCorrectScore; fillBlanksIncorrectScore = finalCalculatedIncorrectScore; fillBlanksScoreSpan.textContent = score; fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; console.log(`Final Scores Calculated: Correct=${score}, Incorrect=${fillBlanksIncorrectScore} / Total=${currentConnectors.length}`); checkAnswersBtn.disabled = true; if (document.activeElement instanceof HTMLElement) { document.activeElement.blur(); } console.log("--- Fill Blanks Game Finalized (Inputs Filled, Scores Updated) ---"); }
    function initializeFillBlanksGame() { currentGameMode = 'fill-blanks'; const selectedMinutes = parseInt(fillBlanksTimeSelect.value, 10); score = 0; fillBlanksIncorrectScore = 0; fillBlanksFinalized = false; renderFillBlanksTable(); showScreen('fill-blanks-game'); checkAnswersBtn.disabled = false; restartFillBlanksBtn.disabled = false; fillBlanksTableBody.querySelectorAll('input[type="text"]').forEach(input => { input.disabled = false; input.style.backgroundColor = ''; }); startTimer(selectedMinutes * 60); }
    function resetFillBlanksGame(goToSetup = false) { stopTimer(); fillBlanksTableBody.innerHTML = ''; score = 0; fillBlanksIncorrectScore = 0; fillBlanksScoreSpan.textContent = '0'; fillBlanksIncorrectScoreSpan.textContent = '0'; fillBlanksTotalSpan.textContent = '0'; fillBlanksTimerSpan.textContent = '--:--'; checkAnswersBtn.disabled = true; restartFillBlanksBtn.disabled = true; fillBlanksFinalized = false; if (goToSetup) { showScreen('fill-blanks-setup'); } else { initializeFillBlanksGame(); } }

    // --- Event Listeners ---
    document.getElementById('select-matching-btn').addEventListener('click', () => showScreen('matching-setup'));
    document.getElementById('select-fill-blanks-btn').addEventListener('click', () => showScreen('fill-blanks-setup'));
    backToSelectionButtons.forEach(button => { button.addEventListener('click', () => { stopTimer(); showScreen('selection'); }); });
    startMatchingBtn.addEventListener('click', initializeMatchingGame); giveUpBtn.addEventListener('click', () => showMatchingResults(false));
    playAgainMatchingBtn.addEventListener('click', () => resetMatchingGame(true)); restartMatchingBtn.addEventListener('click', () => resetMatchingGame(false));
    startFillBlanksBtn.addEventListener('click', initializeFillBlanksGame); checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    restartFillBlanksBtn.addEventListener('click', () => resetFillBlanksGame(false));

    // --- Inicialización General ---
    showScreen('selection'); // Empezar mostrando la selección

}); // Fin DOMContentLoaded
