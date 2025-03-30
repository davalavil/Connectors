// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Comprobación Inicial ---
    if (typeof conectoresOriginal === 'undefined') {
        console.error("ERROR: El archivo 'connectors.js' no se ha cargado correctamente o la variable 'conectoresOriginal' no está definida.");
        alert("Error crítico al cargar los datos del juego. Revisa la consola.");
        return;
    }

    // --- Variables Globales ---
    let currentGameMode = null;
    let timerInterval = null;
    let timeLeft = 0;
    let currentConnectors = [];
    let score = 0;
    let fillBlanksIncorrectScore = 0;
    let fillBlanksFinalized = false;

    // --- Elementos del DOM Comunes ---
    const mainTitle = document.getElementById('main-title'); // <<< AÑADIDO: Referencia al H1
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
    let draggedElement = null;

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

    // --- **Función de Control de Visibilidad (MODIFICADA PARA TÍTULO)** ---
    function showScreen(screen) {
        // Ocultar todas las secciones principales primero
        gameSelectionDiv.classList.add('hidden');
        matchingContainer.classList.add('hidden');
        fillBlanksContainer.classList.add('hidden');
        // Asegurar que las sub-secciones también estén ocultas por defecto
        matchingSetupDiv.classList.add('hidden');
        matchingGameDiv.classList.add('hidden');
        fillBlanksSetupDiv.classList.add('hidden');
        fillBlanksGameDiv.classList.add('hidden');
        resultsOverlay.classList.add('hidden'); // Ocultar overlay de resultados

        let titleText = "Conectores"; // Título por defecto

        // Mostrar la pantalla correcta y establecer el título
        if (screen === 'selection') {
            gameSelectionDiv.classList.remove('hidden');
            titleText = "Conectores"; // O "Elige un Juego"
        } else if (screen === 'matching-setup') {
            matchingContainer.classList.remove('hidden');
            matchingSetupDiv.classList.remove('hidden');
            // Usamos el H2 interno para el setup, mantenemos título principal corto
            titleText = "Emparejar Conectores";
        } else if (screen === 'matching-game') {
            matchingContainer.classList.remove('hidden');
            matchingGameDiv.classList.remove('hidden');
            titleText = "Emparejar Conectores"; // Título durante el juego
        } else if (screen === 'fill-blanks-setup') {
            fillBlanksContainer.classList.remove('hidden');
            fillBlanksSetupDiv.classList.remove('hidden');
             // Usamos el H2 interno para el setup, mantenemos título principal corto
            titleText = "Rellenar Conectores";
        } else if (screen === 'fill-blanks-game') {
            fillBlanksContainer.classList.remove('hidden');
            fillBlanksGameDiv.classList.remove('hidden');
            titleText = "Rellenar Conectores"; // Título durante el juego
        }
         // Nota: El overlay de resultados no cambia el título principal H1

         // Actualizar el título principal H1
         if(mainTitle) { // Verificar que el elemento existe
             mainTitle.textContent = titleText;
         }
    }


    // --- Funciones del Temporizador (Compartidas) ---
    function updateTimerDisplay() { const formattedTime = formatTime(timeLeft); if (currentGameMode === 'matching') { matchingTimerSpan.textContent = formattedTime; } else if (currentGameMode === 'fill-blanks') { fillBlanksTimerSpan.textContent = formattedTime; } }
    function startTimer(duration) { if (timerInterval) clearInterval(timerInterval); timeLeft = duration; updateTimerDisplay(); timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); if (timeLeft <= 0) { clearInterval(timerInterval); timerInterval = null; handleTimeUp(); } }, 1000); }
    function stopTimer() { clearInterval(timerInterval); timerInterval = null; }
    function handleTimeUp() { console.log("Time's up!"); if (currentGameMode === 'matching') { showMatchingResults(false); } else if (currentGameMode === 'fill-blanks') { if (!fillBlanksFinalized) { finalizeFillBlanksGame(); } } }

    // --- Lógica Juego Emparejar (Matching) ---
     function renderMatchingWords() { wordArea.innerHTML = ''; const wordsToRender = []; currentConnectors = shuffleArray([...conectoresOriginal]); score = 0; currentScoreSpan.textContent = score; totalPairsSpan.textContent = currentConnectors.length; currentConnectors.forEach(pair => { wordsToRender.push({ id: pair.id, lang: 'en', text: pair.en }); wordsToRender.push({ id: pair.id, lang: 'es', text: pair.es }); }); shuffleArray(wordsToRender); wordsToRender.forEach(word => { const pill = document.createElement('div'); pill.classList.add('word-pill', `lang-${word.lang}`); pill.textContent = word.text; pill.draggable = true; pill.dataset.id = word.id; pill.dataset.lang = word.lang; pill.addEventListener('dragstart', handleDragStart); pill.addEventListener('dragend', handleDragEnd); wordArea.appendChild(pill); }); wordArea.removeEventListener('dragover', handleDragOver); wordArea.removeEventListener('drop', handleDrop); wordArea.addEventListener('dragover', handleDragOver); wordArea.addEventListener('drop', handleDrop); }
    function handleDragStart(event) { if (!timerInterval && timeLeft > 0 && currentGameMode === 'matching') return; if (event.target.classList.contains('correct-match') || event.target.style.visibility === 'hidden') return; draggedElement = event.target; event.dataTransfer.setData('text/plain', event.target.dataset.id); event.dataTransfer.effectAllowed = 'move'; setTimeout(() => { if(draggedElement) draggedElement.classList.add('dragging'); }, 0); }
    function handleDragEnd(event) { if (draggedElement) draggedElement.classList.remove('dragging'); draggedElement = null; setTimeout(() => { wordArea.querySelectorAll('.incorrect-match').forEach(el => el.classList.remove('incorrect-match')); }, 100); }
    function handleDragOver(event) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }
    function handleDrop(event) { event.preventDefault(); if (!draggedElement) return; const dropTarget = event.target; if (dropTarget.classList.contains('word-pill') && !dropTarget.classList.contains('correct-match') && dropTarget.style.visibility !== 'hidden' && dropTarget !== draggedElement) { const draggedId = draggedElement.dataset.id; const draggedLang = draggedElement.dataset.lang; const targetId = dropTarget.dataset.id; const targetLang = dropTarget.dataset.lang; if (draggedId === targetId && draggedLang !== targetLang) { draggedElement.classList.add('correct-match'); dropTarget.classList.add('correct-match'); draggedElement.classList.remove('dragging'); draggedElement.draggable = false; dropTarget.draggable = false; setTimeout(() => { if (draggedElement && draggedElement.classList.contains('correct-match')) draggedElement.style.visibility = 'hidden'; if (dropTarget && dropTarget.classList.contains('correct-match')) dropTarget.style.visibility = 'hidden'; }, 500); score++; currentScoreSpan.textContent = score; if (score === currentConnectors.length) { stopTimer(); setTimeout(() => showMatchingResults(true), 600); } } else { if(draggedElement) draggedElement.classList.add('incorrect-match'); dropTarget.classList.add('incorrect-match'); setTimeout(() => { if (draggedElement) draggedElement.classList.remove('incorrect-match'); if (!dropTarget.classList.contains('correct-match')) dropTarget.classList.remove('incorrect-match'); }, 500); } } if (draggedElement) draggedElement.classList.remove('dragging'); }
    function showMatchingResults(won) { stopTimer(); correctPairsList.innerHTML = ''; conectoresOriginal.forEach(pair => { const div = document.createElement('div'); div.textContent = `${pair.en} = ${pair.es}`; correctPairsList.appendChild(div); }); let resultTitle = "Resultados"; if (won) resultTitle = "¡Felicidades, has ganado!"; else if (timeLeft <= 0) resultTitle = "¡Se acabó el tiempo!"; else resultTitle = "Te has rendido"; resultsOverlay.querySelector('h2').textContent = resultTitle; resultsOverlay.classList.remove('hidden'); giveUpBtn.disabled = true; restartMatchingBtn.disabled = false; }
    function initializeMatchingGame() { currentGameMode = 'matching'; const selectedMinutes = parseInt(matchingTimeSelect.value, 10); score = 0; draggedElement = null; renderMatchingWords(); showScreen('matching-game'); giveUpBtn.disabled = false; restartMatchingBtn.disabled = true; resultsOverlay.classList.add('hidden'); startTimer(selectedMinutes * 60); }
    function resetMatchingGame(goToSetup = false) { stopTimer(); wordArea.innerHTML = ''; score = 0; currentScoreSpan.textContent = '0'; totalPairsSpan.textContent = '0'; matchingTimerSpan.textContent = '--:--'; resultsOverlay.classList.add('hidden'); giveUpBtn.disabled = false; restartMatchingBtn.disabled = false; wordArea.removeEventListener('dragover', handleDragOver); wordArea.removeEventListener('drop', handleDrop); if (goToSetup) { showScreen('matching-setup'); } else { initializeMatchingGame(); } }

    // --- Lógica Juego Rellenar (Fill Blanks) ---
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
    backToSelectionButtons.forEach(button => { button.addEventListener('click', () => { stopTimer(); showScreen('selection'); }); }); // <<< Asegurar que al volver, se muestre el título correcto
    startMatchingBtn.addEventListener('click', initializeMatchingGame); giveUpBtn.addEventListener('click', () => showMatchingResults(false));
    playAgainMatchingBtn.addEventListener('click', () => resetMatchingGame(true)); restartMatchingBtn.addEventListener('click', () => resetMatchingGame(false));
    startFillBlanksBtn.addEventListener('click', initializeFillBlanksGame); checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    restartFillBlanksBtn.addEventListener('click', () => resetFillBlanksGame(false));

    // --- Inicialización General ---
    showScreen('selection'); // <<< Empezar mostrando la selección y el título por defecto

}); // Fin DOMContentLoaded
