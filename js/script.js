// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Comprobación Inicial de Datos ---
    let dataError = false;
    if (typeof conectoresOriginal === 'undefined') {
        console.error("ERROR: El archivo 'connectors.js' no se ha cargado correctamente o la variable 'conectoresOriginal' no está definida.");
        dataError = true;
    }
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
        return;
    }

    // --- Variables Globales ---
    let currentGameMode = null;
    let timerInterval = null; // Timer general
    let timeLeft = 0;
    let currentConnectors = [];
    let score = 0;
    let fillBlanksIncorrectScore = 0;
    let fillBlanksFinalized = false;
    let sortableInstance = null;
    let currentVerbPatterns = [];
    let currentPatternIndex = -1;
    let verbPatternTimePerQuestion = 15;
    let verbPatternQuestionTimer = null; // Timer de pregunta
    let verbPatternQuestionTimeLeft = 0;
    let verbPatternIncorrectScore = 0;
    let userCanAnswer = false;

    // --- Elementos del DOM Comunes ---
    const mainTitle = document.getElementById('main-title'); // <<< Referencia al H1
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
    const resultsOverlay = document.getElementById('results-overlay'); // Overlay
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

    // --- Elementos DOM Juego Gerundios/Infinitivos ---
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

    // --- Función de Control de Visibilidad (Con Título Dinámico) ---
    function showScreen(screen) {
        gameSelectionDiv.classList.add('hidden'); matchingContainer.classList.add('hidden'); fillBlanksContainer.classList.add('hidden'); verbPatternContainer.classList.add('hidden');
        matchingSetupDiv.classList.add('hidden'); matchingGameDiv.classList.add('hidden'); fillBlanksSetupDiv.classList.add('hidden'); fillBlanksGameDiv.classList.add('hidden'); verbPatternSetupDiv.classList.add('hidden'); verbPatternGameDiv.classList.add('hidden');
        resultsOverlay.classList.add('hidden'); // Asegurar que el overlay matching esté oculto

        let titleText = "Selección de Juego";

        if (screen === 'selection') { gameSelectionDiv.classList.remove('hidden'); titleText = "Selección de Juego"; }
        else if (screen === 'matching-setup') { matchingContainer.classList.remove('hidden'); matchingSetupDiv.classList.remove('hidden'); titleText = "Emparejar Conectores"; }
        else if (screen === 'matching-game') { matchingContainer.classList.remove('hidden'); matchingGameDiv.classList.remove('hidden'); titleText = "Emparejar Conectores"; }
        else if (screen === 'fill-blanks-setup') { fillBlanksContainer.classList.remove('hidden'); fillBlanksSetupDiv.classList.remove('hidden'); titleText = "Rellenar Conectores"; }
        else if (screen === 'fill-blanks-game') { fillBlanksContainer.classList.remove('hidden'); fillBlanksGameDiv.classList.remove('hidden'); titleText = "Rellenar Conectores"; }
        else if (screen === 'verb-pattern-setup') { verbPatternContainer.classList.remove('hidden'); verbPatternSetupDiv.classList.remove('hidden'); titleText = "Gerundios e Infinitivos"; }
        else if (screen === 'verb-pattern-game') { verbPatternContainer.classList.remove('hidden'); verbPatternGameDiv.classList.remove('hidden'); titleText = "Gerundios e Infinitivos"; }

         if(mainTitle) { mainTitle.textContent = titleText; }
    }

    // --- Funciones del Temporizador General (Compartidas) ---
    function updateTimerDisplay() { const formattedTime = formatTime(timeLeft); if (currentGameMode === 'matching') { matchingTimerSpan.textContent = formattedTime; } else if (currentGameMode === 'fill-blanks') { fillBlanksTimerSpan.textContent = formattedTime; } }
    function startTimer(duration) { if (timerInterval) clearInterval(timerInterval); timeLeft = duration; updateTimerDisplay(); timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); if (timeLeft <= 0) { clearInterval(timerInterval); timerInterval = null; handleTimeUp(); } }, 1000); }
    function stopTimer() { clearInterval(timerInterval); timerInterval = null; }
    function handleTimeUp() { console.log("Time's up! (General Timer)"); if (currentGameMode === 'matching') { showMatchingResults(false); } else if (currentGameMode === 'fill-blanks') { if (!fillBlanksFinalized) { finalizeFillBlanksGame(); } } }

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

    // --- Lógica Juego Gerundios/Infinitivos (Verb Patterns) ---
    function updateVerbPatternScores() { verbPatternCorrectSpan.textContent = score; verbPatternIncorrectSpan.textContent = verbPatternIncorrectScore; verbPatternQCountSpan.textContent = Math.max(0, currentPatternIndex + 1); }
    function stopQuestionTimer() { clearInterval(verbPatternQuestionTimer); verbPatternQuestionTimer = null; }
    function startQuestionTimer() { stopQuestionTimer(); verbPatternQuestionTimeLeft = verbPatternTimePerQuestion; verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; userCanAnswer = true; verbPatternAnswerButtons.forEach(button => button.disabled = false); verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; verbPatternQuestionTimer = setInterval(() => { verbPatternQuestionTimeLeft--; verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; if (verbPatternQuestionTimeLeft <= 0) { handleQuestionTimeout(); } }, 1000); }
    function handleQuestionTimeout() { console.log("Question Timeout!"); stopQuestionTimer(); userCanAnswer = false; verbPatternAnswerButtons.forEach(button => button.disabled = true); verbPatternIncorrectScore++; updateVerbPatternScores(); verbPatternFeedbackDiv.textContent = "¡Tiempo agotado! (Error)"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; const currentPattern = currentVerbPatterns[currentPatternIndex]; showCorrectAnswerFeedback(currentPattern.category); setTimeout(displayNextVerbPatternQuestion, 2500); }
    function showCorrectAnswerFeedback(correctCategory) { verbPatternAnswerButtons.forEach(button => { button.style.border = ''; if(button.dataset.answer === correctCategory) { button.style.border = '2px solid green'; } }); }
    function handleVerbPatternAnswer(event) { if (!userCanAnswer) return; stopQuestionTimer(); userCanAnswer = false; verbPatternAnswerButtons.forEach(button => { button.disabled = true; button.style.border = ''; }); const selectedButton = event.target; const selectedAnswer = selectedButton.dataset.answer; const currentPattern = currentVerbPatterns[currentPatternIndex]; const correctAnswer = currentPattern.category; if (selectedAnswer === correctAnswer) { score++; verbPatternFeedbackDiv.textContent = "¡Correcto!"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback correct'; selectedButton.style.border = '2px solid green'; } else { verbPatternIncorrectScore++; const categoryMap = { 'gerund': 'Gerundio (-ing)', 'infinitive_to': 'Infinitivo (con TO)', 'infinitive_no_to': 'Infinitivo (sin TO)', 'both': 'Ambos' }; verbPatternFeedbackDiv.textContent = `Incorrecto. Era: ${categoryMap[correctAnswer] || correctAnswer}`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; selectedButton.style.border = '2px solid red'; showCorrectAnswerFeedback(correctAnswer); } updateVerbPatternScores(); setTimeout(displayNextVerbPatternQuestion, 1800); }
    function displayNextVerbPatternQuestion() { currentPatternIndex++; verbPatternAnswerButtons.forEach(button => { button.disabled = true; button.style.border = ''; }); if (currentPatternIndex < currentVerbPatterns.length) { const pattern = currentVerbPatterns[currentPatternIndex]; verbPatternTermDiv.textContent = pattern.term; verbPatternExplanationDiv.textContent = pattern.explanation || ''; verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; updateVerbPatternScores(); startQuestionTimer(); } else { console.log("Juego de Gerundios/Infinitivos terminado!"); verbPatternTermDiv.textContent = "¡Juego Terminado!"; verbPatternExplanationDiv.textContent = ''; verbPatternFeedbackDiv.textContent = `Resultado Final: ${score} Aciertos, ${verbPatternIncorrectScore} Errores.`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; verbPatternQTimerSpan.textContent = '-'; verbPatternAnswerButtons.forEach(button => button.disabled = true); verbPatternQuitBtn.textContent = "Volver a Selección"; } }
    function quitVerbPatternGame() { stopQuestionTimer(); showScreen('selection'); }
    function initializeVerbPatternGame() { currentGameMode = 'verb-pattern'; verbPatternTimePerQuestion = parseInt(verbPatternTimeSelect.value, 10); score = 0; verbPatternIncorrectScore = 0; currentPatternIndex = -1; if (typeof verbPatternData !== 'undefined' && verbPatternData.length > 0) { currentVerbPatterns = shuffleArray([...verbPatternData]); verbPatternQTotalSpan.textContent = currentVerbPatterns.length; } else { console.error("No se pudieron cargar los datos para el juego de Gerundios/Infinitivos."); verbPatternQTotalSpan.textContent = '0'; currentVerbPatterns = []; } updateVerbPatternScores(); verbPatternQuitBtn.textContent = "Salir del Juego"; showScreen('verb-pattern-game'); if (currentVerbPatterns.length > 0) { displayNextVerbPatternQuestion(); } else { verbPatternTermDiv.textContent = "Error al cargar datos"; verbPatternAnswerButtons.forEach(button => button.disabled = true); } }

    // --- Event Listeners ---
    document.getElementById('select-matching-btn').addEventListener('click', () => showScreen('matching-setup'));
    document.getElementById('select-fill-blanks-btn').addEventListener('click', () => showScreen('fill-blanks-setup'));
    const selectVerbPatternBtn = document.getElementById('select-verb-pattern-btn'); if (selectVerbPatternBtn) { selectVerbPatternBtn.addEventListener('click', () => showScreen('verb-pattern-setup')); } else { console.error("Botón 'select-verb-pattern-btn' no encontrado en el HTML."); }
    backToSelectionButtons.forEach(button => { button.addEventListener('click', () => { stopTimer(); stopQuestionTimer(); showScreen('selection'); }); });
    startMatchingBtn.addEventListener('click', initializeMatchingGame); giveUpBtn.addEventListener('click', () => showMatchingResults(false));
    playAgainMatchingBtn.addEventListener('click', () => resetMatchingGame(true)); restartMatchingBtn.addEventListener('click', () => resetMatchingGame(false));
    startFillBlanksBtn.addEventListener('click', initializeFillBlanksGame); checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    restartFillBlanksBtn.addEventListener('click', () => resetFillBlanksGame(false));
    startVerbPatternBtn.addEventListener('click', initializeVerbPatternGame);
    verbPatternQuitBtn.addEventListener('click', quitVerbPatternGame);
    verbPatternOptionsDiv.addEventListener('click', (event) => { if (event.target.classList.contains('answer-button') && !event.target.disabled && userCanAnswer) { handleVerbPatternAnswer(event); } });

    // --- Inicialización General ---
    showScreen('selection'); // Empezar mostrando la selección

}); // Fin DOMContentLoaded
