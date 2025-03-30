// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Comprobación Inicial de Datos ---
    let dataError = false;
    if (typeof conectoresOriginal === 'undefined') {
        console.error("ERROR: El archivo 'connectors.js' no se ha cargado correctamente o la variable 'conectoresOriginal' no está definida.");
        dataError = true;
    }
    // <<< NUEVO: Comprobar datos verbPatterns >>>
    if (typeof verbPatternData === 'undefined') {
        console.error("ERROR: El archivo 'verbPatterns.js' no se ha cargado correctamente o la variable 'verbPatternData' no está definida.");
        dataError = true;
    }
    if (typeof Sortable === 'undefined') {
        console.error("ERROR: La librería SortableJS no se ha cargado correctamente.");
        // No marcamos como error crítico, pero el juego de emparejar no funcionará
    }
    if (dataError) {
        alert("Error crítico al cargar los datos de uno o más juegos. Revisa la consola.");
        // Podríamos deshabilitar botones o detener ejecución aquí
        return;
    }

    // --- Variables Globales ---
    let currentGameMode = null; // 'matching', 'fill-blanks', 'verb-pattern'
    let timerInterval = null; // Timer general del juego (si aplica)
    let timeLeft = 0; // Tiempo restante del juego general

    let currentConnectors = []; // Para juegos de conectores
    let score = 0; // Score principal (parejas, correctas fill/verb)
    let fillBlanksIncorrectScore = 0;
    let fillBlanksFinalized = false;
    let sortableInstance = null;

    // <<< NUEVO: Variables para Juego Gerundios/Infinitivos >>>
    let currentVerbPatterns = []; // Lista de patrones para la partida actual
    let currentPatternIndex = -1; // Índice del patrón actual
    let verbPatternTimePerQuestion = 15; // Segundos por defecto
    let verbPatternQuestionTimer = null; // Intervalo del timer de pregunta
    let verbPatternQuestionTimeLeft = 0; // Tiempo restante para la pregunta
    let verbPatternIncorrectScore = 0; // Errores en este juego
    let userCanAnswer = false; // Controla si se puede responder

    // --- Elementos del DOM Comunes ---
    const mainTitle = document.getElementById('main-title'); // Referencia al H1
    const gameSelectionDiv = document.getElementById('game-selection');
    const backToSelectionButtons = document.querySelectorAll('.back-to-selection');

    // --- Elementos DOM Juego Emparejar (Matching) ---
    const matchingContainer = document.getElementById('matching-container');
    const matchingSetupDiv = document.getElementById('matching-setup');
    const matchingGameDiv = document.getElementById('matching-game');
    const matchingTimeSelect = document.getElementById('matching-time-select');
    const startMatchingBtn = document.getElementById('start-matching-btn');
    const wordArea = document.getElementById('word-area');
    const currentScoreSpan = document.getElementById('current-score');
    const totalPairsSpan = document.getElementById('total-pairs');
    const matchingTimerSpan = document.getElementById('time-left');
    const giveUpBtn = document.getElementById('give-up-btn');
    const restartMatchingBtn = document.getElementById('restart-matching-btn');
    const resultsOverlay = document.getElementById('results-overlay');
    const correctPairsList = document.getElementById('correct-pairs-list');
    const playAgainMatchingBtn = document.getElementById('play-again-matching-btn');

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

    // <<< NUEVO: Elementos DOM Juego Gerundios/Infinitivos >>>
    const verbPatternContainer = document.getElementById('verb-pattern-container');
    const verbPatternSetupDiv = document.getElementById('verb-pattern-setup');
    const verbPatternGameDiv = document.getElementById('verb-pattern-game');
    const verbPatternTimeSelect = document.getElementById('verb-pattern-time-select');
    const startVerbPatternBtn = document.getElementById('start-verb-pattern-btn');
    const verbPatternTermDiv = document.getElementById('verb-pattern-term');
    const verbPatternExplanationDiv = document.getElementById('verb-pattern-explanation');
    const verbPatternQTimerSpan = document.getElementById('verb-pattern-q-time-left');
    const verbPatternCorrectSpan = document.getElementById('verb-pattern-correct');
    const verbPatternIncorrectSpan = document.getElementById('verb-pattern-incorrect');
    const verbPatternQCountSpan = document.getElementById('verb-pattern-q-count');
    const verbPatternQTotalSpan = document.getElementById('verb-pattern-q-total');
    const verbPatternOptionsDiv = document.getElementById('verb-pattern-options');
    const verbPatternFeedbackDiv = document.getElementById('verb-pattern-feedback');
    const verbPatternQuitBtn = document.getElementById('verb-pattern-quit-btn');
    const verbPatternAnswerButtons = verbPatternOptionsDiv.querySelectorAll('.answer-button');


    // --- Funciones de Utilidad ---
    function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; } return array; }
    function formatTime(seconds) { const minutes = Math.floor(seconds / 60); const remainingSeconds = seconds % 60; return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`; }

    // --- Función de Control de Visibilidad (Actualizada) ---
    function showScreen(screen) {
        // Ocultar todas las secciones principales primero
        gameSelectionDiv.classList.add('hidden');
        matchingContainer.classList.add('hidden');
        fillBlanksContainer.classList.add('hidden');
        verbPatternContainer.classList.add('hidden'); // <<< Ocultar nuevo contenedor
        // Asegurar que las sub-secciones también estén ocultas por defecto
        matchingSetupDiv.classList.add('hidden');
        matchingGameDiv.classList.add('hidden');
        fillBlanksSetupDiv.classList.add('hidden');
        fillBlanksGameDiv.classList.add('hidden');
        verbPatternSetupDiv.classList.add('hidden'); // <<< Ocultar setup G/I
        verbPatternGameDiv.classList.add('hidden'); // <<< Ocultar juego G/I
        resultsOverlay.classList.add('hidden'); // Ocultar overlay de resultados

        let titleText = "Selección de Juego"; // Título inicial más claro

        // Mostrar la pantalla correcta y establecer el título
        if (screen === 'selection') {
            gameSelectionDiv.classList.remove('hidden');
            titleText = "Selección de Juego";
        } else if (screen === 'matching-setup') {
            matchingContainer.classList.remove('hidden');
            matchingSetupDiv.classList.remove('hidden');
            titleText = "Emparejar Conectores";
        } else if (screen === 'matching-game') {
            matchingContainer.classList.remove('hidden');
            matchingGameDiv.classList.remove('hidden');
            titleText = "Emparejar Conectores";
        } else if (screen === 'fill-blanks-setup') {
            fillBlanksContainer.classList.remove('hidden');
            fillBlanksSetupDiv.classList.remove('hidden');
            titleText = "Rellenar Conectores";
        } else if (screen === 'fill-blanks-game') {
            fillBlanksContainer.classList.remove('hidden');
            fillBlanksGameDiv.classList.remove('hidden');
            titleText = "Rellenar Conectores";
        }
        // <<< NUEVO: Mostrar pantallas del juego G/I >>>
        else if (screen === 'verb-pattern-setup') {
            verbPatternContainer.classList.remove('hidden');
            verbPatternSetupDiv.classList.remove('hidden');
            titleText = "Gerundios e Infinitivos";
        } else if (screen === 'verb-pattern-game') {
            verbPatternContainer.classList.remove('hidden');
            verbPatternGameDiv.classList.remove('hidden');
            titleText = "Gerundios e Infinitivos";
        }

         // Actualizar el título principal H1
         if(mainTitle) { // Verificar que el elemento existe
             mainTitle.textContent = titleText;
         }
    }


    // --- Funciones del Temporizador General (Compartidas) ---
    function updateTimerDisplay() { const formattedTime = formatTime(timeLeft); if (currentGameMode === 'matching') { matchingTimerSpan.textContent = formattedTime; } else if (currentGameMode === 'fill-blanks') { fillBlanksTimerSpan.textContent = formattedTime; } /* Añadir verb-pattern si tuviera timer general */ }
    function startTimer(duration) { if (timerInterval) clearInterval(timerInterval); timeLeft = duration; updateTimerDisplay(); timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); if (timeLeft <= 0) { clearInterval(timerInterval); timerInterval = null; handleTimeUp(); } }, 1000); }
    function stopTimer() { clearInterval(timerInterval); timerInterval = null; } // Detiene el timer GENERAL
    function handleTimeUp() { console.log("Time's up! (General Timer)"); if (currentGameMode === 'matching') { showMatchingResults(false); } else if (currentGameMode === 'fill-blanks') { if (!fillBlanksFinalized) { finalizeFillBlanksGame(); } } /* Añadir verb-pattern si tuviera timer general */ }

    // --- Lógica Juego Emparejar (Matching) ---
    function checkMatch(p1, p2) { if (!p1 || !p2 || !p1.dataset || !p2.dataset) return false; if (p1.classList.contains('correct-match') || p2.classList.contains('correct-match') || p1.style.visibility === 'hidden' || p2.style.visibility === 'hidden') { return false; } const id1 = p1.dataset.id; const lang1 = p1.dataset.lang; const id2 = p2.dataset.id; const lang2 = p2.dataset.lang; return id1 === id2 && lang1 !== lang2; }
    function applyCorrectMatch(p1, p2) { console.log("Match:", p1.textContent,"&", p2.textContent); p1.classList.add('correct-match'); p2.classList.add('correct-match'); setTimeout(() => { p1.style.display = 'none'; p2.style.display = 'none'; score++; currentScoreSpan.textContent = score; const remaining = wordArea.querySelectorAll('.word-pill:not([style*="display: none"])').length; if (remaining === 0) { console.log("All pairs matched!"); stopTimer(); setTimeout(() => showMatchingResults(true), 300); } }, 160); }
    function applyIncorrectMatchFeedback(p) { if (!p) return; p.classList.add('incorrect-match'); setTimeout(() => { if (p) { p.classList.remove('incorrect-match'); } }, 500); }
    function renderMatchingWords() { wordArea.innerHTML = ''; const wordsToRender = []; currentConnectors = shuffleArray([...conectoresOriginal]); score = 0; currentScoreSpan.textContent = score; totalPairsSpan.textContent = currentConnectors.length; currentConnectors.forEach(pair => { wordsToRender.push({ id: pair.id, lang: 'en', text: pair.en }); wordsToRender.push({ id: pair.id, lang: 'es', text: pair.es }); }); shuffleArray(wordsToRender); wordsToRender.forEach(word => { const pill = document.createElement('div'); pill.classList.add('word-pill', `lang-${word.lang}`); pill.textContent = word.text; pill.dataset.id = word.id; pill.dataset.lang = word.lang; wordArea.appendChild(pill); }); if (sortableInstance) { sortableInstance.destroy(); } if (typeof Sortable !== 'undefined') { sortableInstance = Sortable.create(wordArea, { animation: 150, ghostClass: 'dragging', onEnd: function (evt) { const movedItem = evt.item; if ((!timerInterval && timeLeft > 0) || resultsOverlay.classList.contains('hidden') === false) { return; } const prevSibling = movedItem.previousElementSibling; const nextSibling = movedItem.nextElementSibling; let matchFound = false; let targetPill = null; if (prevSibling && checkMatch(movedItem, prevSibling)) { matchFound = true; targetPill = prevSibling; } if (!matchFound && nextSibling && checkMatch(movedItem, nextSibling)) { matchFound = true; targetPill = nextSibling; } if (matchFound && targetPill) { applyCorrectMatch(movedItem, targetPill); } else { console.log("No match with neighbors."); applyIncorrectMatchFeedback(movedItem); } } }); } else { console.error("Sortable not defined for matching game."); } }
    function showMatchingResults(won) { stopTimer(); if (sortableInstance) { sortableInstance.option('disabled', true); } correctPairsList.innerHTML = ''; conectoresOriginal.forEach(pair => { const div = document.createElement('div'); div.textContent = `${pair.en} = ${pair.es}`; correctPairsList.appendChild(div); }); let resultTitle = "Resultados"; if (won) resultTitle = "¡Felicidades!"; else if (timeLeft <= 0) resultTitle = "¡Tiempo Agotado!"; else resultTitle = "Te has rendido"; resultsOverlay.querySelector('h2').textContent = resultTitle; resultsOverlay.classList.remove('hidden'); giveUpBtn.disabled = true; restartMatchingBtn.disabled = false; }
    function initializeMatchingGame() { currentGameMode = 'matching'; const selectedMinutes = parseInt(matchingTimeSelect.value, 10); score = 0; renderMatchingWords(); showScreen('matching-game'); giveUpBtn.disabled = false; restartMatchingBtn.disabled = true; resultsOverlay.classList.add('hidden'); if (sortableInstance) { sortableInstance.option('disabled', false); } startTimer(selectedMinutes * 60); }
    function resetMatchingGame(goToSetup = false) { stopTimer(); wordArea.innerHTML = ''; score = 0; currentScoreSpan.textContent = '0'; totalPairsSpan.textContent = '0'; matchingTimerSpan.textContent = '--:--'; resultsOverlay.classList.add('hidden'); giveUpBtn.disabled = false; restartMatchingBtn.disabled = false; if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; } if (goToSetup) { showScreen('matching-setup'); } else { initializeMatchingGame(); } }

    // --- Lógica Juego Rellenar (Fill Blanks) ---
    function renderFillBlanksTable() { fillBlanksTableBody.innerHTML = ''; currentConnectors = shuffleArray([...conectoresOriginal]); score = 0; fillBlanksIncorrectScore = 0; fillBlanksScoreSpan.textContent = score; fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; fillBlanksTotalSpan.textContent = currentConnectors.length; translationDirection = translationDirectionSelect.value; fillBlanksFinalized = false; currentConnectors.forEach(pair => { const row = document.createElement('tr'); row.dataset.id = pair.id; const sourceCell = document.createElement('td'); sourceCell.textContent = (translationDirection === 'en-es') ? pair.en : pair.es; const inputCell = document.createElement('td'); const input = document.createElement('input'); input.type = 'text'; input.placeholder = (translationDirection === 'en-es') ? 'Escribe en Español...' : 'Escribe en Inglés...'; input.dataset.id = pair.id; input.disabled = false; input.addEventListener('blur', handleFillBlanksInputBlur); inputCell.appendChild(input); const feedbackCell = document.createElement('td'); feedbackCell.className = 'feedback'; feedbackCell.textContent = '-'; row.appendChild(sourceCell); row.appendChild(inputCell); row.appendChild(feedbackCell); fillBlanksTableBody.appendChild(row); }); }
    function checkAnswer(userInput, correctAnswer) { const normalizedInput = userInput.trim().toLowerCase(); if (!normalizedInput) return false; const correctOptions = correctAnswer.split(/[,/]/).map(opt => opt.trim().toLowerCase()); if (translationDirection === 'en-es') { const normalizedInputNoAccents = normalizedInput.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); if (correctOptions.some(opt => opt.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalizedInputNoAccents)) { return true; } } return correctOptions.includes(normalizedInput); }
    function handleFillBlanksInputBlur(event) { if (fillBlanksFinalized) return; checkSingleAnswerAndUpdate(event.target); }
    function checkSingleAnswerAndUpdate(inputElement) { const row = inputElement.closest('tr'); if (!row) return; const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal.find(p => p.id == id); if (!connectorPair || !feedbackCell) return; const userAnswer = inputElement.value; const correctAnswer = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const wasCorrectBefore = feedbackCell.classList.contains('correct'); const wasIncorrectBefore = feedbackCell.classList.contains('incorrect'); const isCorrectNow = checkAnswer(userAnswer, correctAnswer); const isIncorrectNow = !isCorrectNow && userAnswer.trim() !== ''; let scoreChanged = false; let incorrectScoreChanged = false; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrectNow) { if (!wasCorrectBefore || feedbackCell.textContent !== 'Correcto') { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); scoreChanged = true; } else { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); } } else if (isIncorrectNow) { if (!wasIncorrectBefore || feedbackCell.textContent !== 'Incorrecto') { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); incorrectScoreChanged = true; } else { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); } } else { if (wasCorrectBefore || wasIncorrectBefore || feedbackCell.textContent !== '-') { feedbackCell.textContent = '-'; if (wasIncorrectBefore) { incorrectScoreChanged = true; } if (wasCorrectBefore) { scoreChanged = true; } } else { feedbackCell.textContent = '-'; } } if (!feedbackCell.classList.contains('feedback')) { feedbackCell.classList.add('feedback'); } if (scoreChanged) { if (isCorrectNow && !wasCorrectBefore) { score++; } else if (!isCorrectNow && wasCorrectBefore) { score--; } score = Math.max(0, score); fillBlanksScoreSpan.textContent = score; } if (incorrectScoreChanged) { if (isIncorrectNow && !wasIncorrectBefore) { fillBlanksIncorrectScore++; } else if (!isIncorrectNow && wasIncorrectBefore) { fillBlanksIncorrectScore--; } fillBlanksIncorrectScore = Math.max(0, fillBlanksIncorrectScore); fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; } }
    function finalizeFillBlanksGame() { if (fillBlanksFinalized) { console.log("Finalize called on already finalized game."); return; } fillBlanksFinalized = true; stopTimer(); console.log("--- Finalizing Fill Blanks Game ---"); let finalCalculatedCorrectScore = 0; let finalCalculatedIncorrectScore = 0; const rows = fillBlanksTableBody.querySelectorAll('tr'); if (rows.length === 0) { console.warn("No rows found in table during finalization."); checkAnswersBtn.disabled = true; return; } console.log(`Finalizing ${rows.length} rows...`); rows.forEach((row, index) => { const input = row.querySelector('input[type="text"]'); const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal.find(p => p.id == id); if (!input || !feedbackCell || !connectorPair) { console.error(`Error finding elements for row ${index} (ID: ${id}). Skipping.`); return; } const userAnswer = input.value; const correctAnswerString = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrect = checkAnswer(userAnswer, correctAnswerString); const isIncorrect = !isCorrect && userAnswer.trim() !== ''; input.value = correctAnswerString; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrect) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); finalCalculatedCorrectScore++; } else if (isIncorrect) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); finalCalculatedIncorrectScore++; } else { feedbackCell.textContent = '-'; } if (!feedbackCell.classList.contains('feedback')) { feedbackCell.classList.add('feedback'); } input.disabled = true; }); score = finalCalculatedCorrectScore; fillBlanksIncorrectScore = finalCalculatedIncorrectScore; fillBlanksScoreSpan.textContent = score; fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; console.log(`Final Scores Calculated: Correct=${score}, Incorrect=${fillBlanksIncorrectScore} / Total=${currentConnectors.length}`); checkAnswersBtn.disabled = true; if (document.activeElement instanceof HTMLElement) { document.activeElement.blur(); } console.log("--- Fill Blanks Game Finalized (Inputs Filled, Scores Updated) ---"); }
    function initializeFillBlanksGame() { currentGameMode = 'fill-blanks'; const selectedMinutes = parseInt(fillBlanksTimeSelect.value, 10); score = 0; fillBlanksIncorrectScore = 0; fillBlanksFinalized = false; renderFillBlanksTable(); showScreen('fill-blanks-game'); checkAnswersBtn.disabled = false; restartFillBlanksBtn.disabled = false; fillBlanksTableBody.querySelectorAll('input[type="text"]').forEach(input => { input.disabled = false; input.style.backgroundColor = ''; }); startTimer(selectedMinutes * 60); }
    function resetFillBlanksGame(goToSetup = false) { stopTimer(); fillBlanksTableBody.innerHTML = ''; score = 0; fillBlanksIncorrectScore = 0; fillBlanksScoreSpan.textContent = '0'; fillBlanksIncorrectScoreSpan.textContent = '0'; fillBlanksTotalSpan.textContent = '0'; fillBlanksTimerSpan.textContent = '--:--'; checkAnswersBtn.disabled = true; restartFillBlanksBtn.disabled = true; fillBlanksFinalized = false; if (goToSetup) { showScreen('fill-blanks-setup'); } else { initializeFillBlanksGame(); } }

    // <<< --- NUEVO: Lógica Juego Gerundios/Infinitivos (Verb Patterns) --- >>>

    function updateVerbPatternScores() {
        verbPatternCorrectSpan.textContent = score; // Reutilizamos 'score' para aciertos
        verbPatternIncorrectSpan.textContent = verbPatternIncorrectScore;
        // +1 porque índice empieza en 0, asegurar que no sea negativo al inicio
        verbPatternQCountSpan.textContent = Math.max(0, currentPatternIndex + 1);
    }

    function stopQuestionTimer() {
        clearInterval(verbPatternQuestionTimer);
        verbPatternQuestionTimer = null;
    }

    function startQuestionTimer() {
        stopQuestionTimer(); // Limpiar anterior si existe
        verbPatternQuestionTimeLeft = verbPatternTimePerQuestion;
        verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft;
        userCanAnswer = true; // Permitir respuesta al iniciar timer
        verbPatternAnswerButtons.forEach(button => button.disabled = false); // Habilitar botones
        verbPatternFeedbackDiv.textContent = ''; // Limpiar feedback al iniciar timer
        verbPatternFeedbackDiv.className = 'verb-pattern-feedback';

        verbPatternQuestionTimer = setInterval(() => {
            verbPatternQuestionTimeLeft--;
            verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft;
            if (verbPatternQuestionTimeLeft <= 0) {
                handleQuestionTimeout();
            }
        }, 1000);
    }

    function handleQuestionTimeout() {
        console.log("Question Timeout!");
        stopQuestionTimer();
        userCanAnswer = false; // Bloquear respuesta
        verbPatternAnswerButtons.forEach(button => button.disabled = true); // Deshabilitar botones
        verbPatternIncorrectScore++; // Contar como error
        updateVerbPatternScores();
        verbPatternFeedbackDiv.textContent = "¡Tiempo agotado! (Error)";
        verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; // Estilo de error
        // Mostrar la respuesta correcta
        const currentPattern = currentVerbPatterns[currentPatternIndex];
        showCorrectAnswerFeedback(currentPattern.category);

        // Pasar a la siguiente pregunta después de un delay
        setTimeout(displayNextVerbPatternQuestion, 2500); // Delay más largo si agota tiempo
    }

    // Marca visualmente el botón de la respuesta correcta
    function showCorrectAnswerFeedback(correctCategory) {
         verbPatternAnswerButtons.forEach(button => {
            button.style.border = ''; // Limpiar bordes primero
            if(button.dataset.answer === correctCategory) {
                button.style.border = '2px solid green'; // Borde verde para la correcta
            }
        });
    }

    function handleVerbPatternAnswer(event) {
        if (!userCanAnswer) return; // Evitar respuestas múltiples o fuera de tiempo

        stopQuestionTimer();
        userCanAnswer = false; // Bloquear más respuestas para esta pregunta
        verbPatternAnswerButtons.forEach(button => {
            button.disabled = true; // Deshabilitar botones
            button.style.border = ''; // Limpiar bordes
        });

        const selectedButton = event.target;
        const selectedAnswer = selectedButton.dataset.answer;
        const currentPattern = currentVerbPatterns[currentPatternIndex];
        const correctAnswer = currentPattern.category;

        if (selectedAnswer === correctAnswer) {
            score++; // Incrementar aciertos
            verbPatternFeedbackDiv.textContent = "¡Correcto!";
            verbPatternFeedbackDiv.className = 'verb-pattern-feedback correct';
            selectedButton.style.border = '2px solid green'; // Marcar el botón correcto pulsado
        } else {
            verbPatternIncorrectScore++; // Incrementar errores
            // Mapear categoría a texto más legible para el feedback
            const categoryMap = {
                'gerund': 'Gerundio (-ing)',
                'infinitive_to': 'Infinitivo (con TO)',
                'infinitive_no_to': 'Infinitivo (sin TO)',
                'both': 'Ambos'
            };
            verbPatternFeedbackDiv.textContent = `Incorrecto. Era: ${categoryMap[correctAnswer] || correctAnswer}`;
            verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect';
            selectedButton.style.border = '2px solid red'; // Marcar el botón incorrecto pulsado
            // Resaltar también cuál era la correcta
             showCorrectAnswerFeedback(correctAnswer);
        }

        updateVerbPatternScores();

        // Pasar a la siguiente pregunta después de un delay
        setTimeout(displayNextVerbPatternQuestion, 1800); // 1.8 segundos para ver feedback
    }

    function displayNextVerbPatternQuestion() {
        currentPatternIndex++;
        verbPatternAnswerButtons.forEach(button => {
             button.disabled = true; // Asegurar que empiezan deshabilitados
             button.style.border = ''; // Limpiar borde del botón
        });

        if (currentPatternIndex < currentVerbPatterns.length) {
            const pattern = currentVerbPatterns[currentPatternIndex];
            verbPatternTermDiv.textContent = pattern.term;
            verbPatternExplanationDiv.textContent = pattern.explanation || ''; // Mostrar explicación si existe
            verbPatternFeedbackDiv.textContent = ''; // Limpiar feedback anterior
            verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; // Resetear clase feedback
            updateVerbPatternScores(); // Actualizar contador de pregunta
            startQuestionTimer(); // Iniciar timer para la nueva pregunta
        } else {
            // Fin del juego
            console.log("Juego de Gerundios/Infinitivos terminado!");
            verbPatternTermDiv.textContent = "¡Juego Terminado!";
            verbPatternExplanationDiv.textContent = '';
            verbPatternFeedbackDiv.textContent = `Resultado Final: ${score} Aciertos, ${verbPatternIncorrectScore} Errores.`;
            verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; // Quitar color de feedback
            verbPatternQTimerSpan.textContent = '-';
            verbPatternAnswerButtons.forEach(button => button.disabled = true); // Deshabilitar botones al final
            verbPatternQuitBtn.textContent = "Volver a Selección"; // Cambiar texto del botón Salir
        }
    }

     function quitVerbPatternGame() {
        stopQuestionTimer(); // Detener timer de pregunta
        // Opcional: guardar resultados si se implementa
        showScreen('selection'); // Volver a la pantalla de selección
    }

    function initializeVerbPatternGame() {
        currentGameMode = 'verb-pattern';
        verbPatternTimePerQuestion = parseInt(verbPatternTimeSelect.value, 10);
        score = 0; // Resetear aciertos
        verbPatternIncorrectScore = 0; // Resetear errores
        currentPatternIndex = -1; // Resetear índice
        // Asegurarse que verbPatternData existe antes de usarlo
        if (typeof verbPatternData !== 'undefined' && verbPatternData.length > 0) {
             currentVerbPatterns = shuffleArray([...verbPatternData]); // Cargar y barajar datos
             verbPatternQTotalSpan.textContent = currentVerbPatterns.length; // Establecer total
        } else {
            console.error("No se pudieron cargar los datos para el juego de Gerundios/Infinitivos.");
             verbPatternQTotalSpan.textContent = '0'; // Indicar 0 si no hay datos
             currentVerbPatterns = []; // Asegurar que esté vacío
             // Podríamos mostrar un mensaje de error aquí
        }


        // Actualizar totales y contadores iniciales
        updateVerbPatternScores(); // Pone aciertos/errores a 0 y pregunta a 0/total

        verbPatternQuitBtn.textContent = "Salir del Juego"; // Texto original del botón

        showScreen('verb-pattern-game'); // Mostrar pantalla del juego
        // Solo empezar si hay patrones que mostrar
        if (currentVerbPatterns.length > 0) {
             displayNextVerbPatternQuestion(); // Mostrar la primera pregunta
        } else {
             verbPatternTermDiv.textContent = "Error al cargar datos";
             verbPatternAnswerButtons.forEach(button => button.disabled = true);
        }
    }

    // --- Event Listeners ---
    document.getElementById('select-matching-btn').addEventListener('click', () => showScreen('matching-setup'));
    document.getElementById('select-fill-blanks-btn').addEventListener('click', () => showScreen('fill-blanks-setup'));
    // <<< NUEVO: Listener para selección del juego G/I >>>
    // Asegurarse que el botón existe antes de añadir listener
    const selectVerbPatternBtn = document.getElementById('select-verb-pattern-btn');
    if (selectVerbPatternBtn) {
        selectVerbPatternBtn.addEventListener('click', () => showScreen('verb-pattern-setup'));
    } else {
        console.error("Botón 'select-verb-pattern-btn' no encontrado en el HTML.");
    }


    backToSelectionButtons.forEach(button => { button.addEventListener('click', () => { stopTimer(); stopQuestionTimer(); /* Detener ambos timers */ showScreen('selection'); }); });

    // Matching Game Listeners
    startMatchingBtn.addEventListener('click', initializeMatchingGame); giveUpBtn.addEventListener('click', () => showMatchingResults(false));
    playAgainMatchingBtn.addEventListener('click', () => resetMatchingGame(true)); restartMatchingBtn.addEventListener('click', () => resetMatchingGame(false));

    // Fill Blanks Game Listeners
    startFillBlanksBtn.addEventListener('click', initializeFillBlanksGame); checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    restartFillBlanksBtn.addEventListener('click', () => resetFillBlanksGame(false));

    // <<< NUEVO: Verb Pattern Game Listeners >>>
    startVerbPatternBtn.addEventListener('click', initializeVerbPatternGame);
    verbPatternQuitBtn.addEventListener('click', quitVerbPatternGame);
    // Añadir listener a los botones de respuesta (delegación en el contenedor)
    verbPatternOptionsDiv.addEventListener('click', (event) => {
        // Asegurarse que el clic fue en un botón habilitado
        if (event.target.classList.contains('answer-button') && !event.target.disabled && userCanAnswer) {
            handleVerbPatternAnswer(event);
        }
    });


    // --- Inicialización General ---
    showScreen('selection'); // <<< Empezar mostrando la selección y el título por defecto

}); // Fin DOMContentLoaded
