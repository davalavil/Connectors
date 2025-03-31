// ===========================================================
// js/script.js (PRINCIPAL - ORQUESTADOR DE JUEGOS - v1.6)
// Maneja selección, visibilidad y control.
// v1.6: Revertir lógica showScreen a v1.3 (maneja setup/game),
//       manteniendo fix SortableJS y mejora shuffle Matching.
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- Comprobación Inicial de Datos ---
    let dataError = false;
    if (typeof conectoresOriginal === 'undefined') { console.error("ERROR: 'conectoresOriginal' no definida..."); dataError = true; }
    if (typeof verbPatternData === 'undefined') { console.error("ERROR: 'verbPatternData' no definida..."); dataError = true; }
    if (typeof Sortable === 'undefined') { console.warn("ADVERTENCIA (Inicial): SortableJS NO DEFINIDA AÚN..."); } else { console.log("SortableJS library found (Inicial)."); }
    if (typeof VerbsGame === 'undefined') { console.error("ERROR: Módulo 'VerbsGame' no encontrado...");}
    if (typeof TraduccionGame === 'undefined') { console.error("ERROR: Módulo 'TraduccionGame' no encontrado...");}

    // --- Variables Globales ---
    let currentGameMode = null; let timerInterval = null; let timeLeft = 0;
    let scoreMatching = 0; let sortableInstance = null;
    let currentConnectorsFill = []; let scoreFillBlanks = 0; let fillBlanksIncorrectScore = 0; let fillBlanksFinalized = false; let translationDirection = 'en-es';
    let currentVerbPatterns = []; let currentPatternIndex = -1; let scoreVerbPattern = 0; let verbPatternIncorrectScore = 0; let verbPatternTimePerQuestion = 15; let verbPatternQuestionTimer = null; let verbPatternQuestionTimeLeft = 0; let userCanAnswerVerbPattern = false;

    // --- Elementos del DOM ---
    const mainTitle = document.getElementById('main-title');
    const gameSelectionDiv = document.getElementById('game-selection');
    const backToSelectionButtons = document.querySelectorAll('.back-to-selection');
    const matchingContainer = document.getElementById('matching-container');
    const fillBlanksContainer = document.getElementById('fill-blanks-container');
    const verbPatternContainer = document.getElementById('verb-pattern-container');
    const verbsGameContainer = document.getElementById('verbs-game-container');
    const traduccionGameContainer = document.getElementById('traduccion-game-container');
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

    // Validar contenedores...
    const containers = [gameSelectionDiv, matchingContainer, fillBlanksContainer, verbPatternContainer, verbsGameContainer, traduccionGameContainer, mainTitle];
    if (containers.some(el => !el)) { console.error("ERROR CRÍTICO: Falta contenedor..."); document.body.innerHTML = '...'; return; }


    // --- Funciones de Utilidad ---
    function shuffleArray(array) { const shuffled = [...array]; for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; } return shuffled; }
    function formatTime(seconds) { const minutes = Math.floor(seconds / 60); const remainingSeconds = seconds % 60; return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`; }


    // --- Función de Control de Visibilidad (Orquestador - Lógica v1.3 Restaurada) ---
    function showScreen(screenId) {
        console.log(`Navegando a pantalla: ${screenId}`);

        // 1. Ocultar todos los contenedores principales y sub-secciones
        gameSelectionDiv.classList.add('hidden');
        matchingContainer.classList.add('hidden');
        fillBlanksContainer.classList.add('hidden');
        verbPatternContainer.classList.add('hidden');
        verbsGameContainer.classList.add('hidden');
        traduccionGameContainer.classList.add('hidden');

        // Ocultar sub-secciones y overlays específicos
        if(matchingSetupDiv) matchingSetupDiv.classList.add('hidden');
        if(matchingGameDiv) matchingGameDiv.classList.add('hidden');
        if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.add('hidden');
        if(fillBlanksGameDiv) fillBlanksGameDiv.classList.add('hidden');
        if(verbPatternSetupDiv) verbPatternSetupDiv.classList.add('hidden');
        if(verbPatternGameDiv) verbPatternGameDiv.classList.add('hidden');
        if(resultsOverlay) resultsOverlay.classList.add('hidden');

        // 2. Determinar título y mostrar contenedor/sección correctos
        let titleText = "Selección de Juego";
        let needsInit = false; // Para juegos importados

        switch (screenId) {
            case 'selection':
                gameSelectionDiv.classList.remove('hidden');
                titleText = "Selección de Juego";
                break;
            // --- Juegos Originales ---
            case 'matching-setup':
                matchingContainer.classList.remove('hidden'); // Mostrar contenedor padre
                if(matchingSetupDiv) matchingSetupDiv.classList.remove('hidden'); // Mostrar setup
                titleText = "Emparejar Conectores";
                break;
            case 'matching-game':
                matchingContainer.classList.remove('hidden'); // Mostrar contenedor padre
                if(matchingGameDiv) matchingGameDiv.classList.remove('hidden'); // Mostrar juego
                titleText = "Emparejar Conectores";
                break;
            case 'fill-blanks-setup':
                fillBlanksContainer.classList.remove('hidden');
                if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.remove('hidden');
                titleText = "Rellenar Conectores";
                break;
            case 'fill-blanks-game':
                fillBlanksContainer.classList.remove('hidden');
                if(fillBlanksGameDiv) fillBlanksGameDiv.classList.remove('hidden');
                titleText = "Rellenar Conectores";
                break;
            case 'verb-pattern-setup':
                verbPatternContainer.classList.remove('hidden');
                if(verbPatternSetupDiv) verbPatternSetupDiv.classList.remove('hidden');
                titleText = "Gerundios e Infinitivos";
                break;
            case 'verb-pattern-game':
                verbPatternContainer.classList.remove('hidden');
                if(verbPatternGameDiv) verbPatternGameDiv.classList.remove('hidden');
                titleText = "Gerundios e Infinitivos";
                break;
            // --- Juegos Nuevos ---
            case 'verbs':
                verbsGameContainer.classList.remove('hidden'); // Mostrar contenedor padre
                titleText = "Práctica de Verbos";
                needsInit = true; // Marcar para llamar a VerbsGame.init()
                break;
            case 'traduccion':
                traduccionGameContainer.classList.remove('hidden'); // Mostrar contenedor padre
                titleText = "Práctica de Vocabulario";
                needsInit = true; // Marcar para llamar a TraduccionGame.init()
                break;
            default:
                 console.warn("showScreen ID desconocido:", screenId);
                 gameSelectionDiv.classList.remove('hidden'); // Volver a selección por defecto
                 screenId = 'selection';
        }

        // 3. Llamar a init para juegos importados SI es necesario
        if (needsInit) {
            if (screenId === 'verbs') {
                if (typeof VerbsGame?.init === 'function') { VerbsGame.init(verbsGameContainer); }
                else { console.error("Error VerbsGame.init no disponible."); verbsGameContainer.innerHTML = "<p>Error</p>"; }
            } else if (screenId === 'traduccion') {
                if (typeof TraduccionGame?.init === 'function') { TraduccionGame.init(traduccionGameContainer); }
                else { console.error("Error TraduccionGame.init no disponible."); traduccionGameContainer.innerHTML = "<p>Error</p>"; }
            }
        }

        // 4. Actualizar título y estado global
        if(mainTitle) mainTitle.textContent = titleText;
        currentGameMode = screenId;

        // 5. Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }


     // --- Función para Resetear Juego Anterior ---
     function resetPreviousGame(gameModeToReset) {
         console.log(`Intentando resetear juego: ${gameModeToReset}`);
         stopTimer(); stopQuestionTimer();
         switch (gameModeToReset) {
             case 'matching': case 'matching-setup': case 'matching-game': resetMatchingGame(true); break; // El true NO hace nada especial aquí ahora
             case 'fill-blanks': case 'fill-blanks-setup': case 'fill-blanks-game': resetFillBlanksGame(true); break;
             case 'verb-pattern': case 'verb-pattern-setup': case 'verb-pattern-game': resetVerbPatternGame(true); break;
             case 'verbs': if (typeof VerbsGame?.reset === 'function') { VerbsGame.reset(); } else { console.warn("VerbsGame.reset no disponible."); } break;
             case 'traduccion': if (typeof TraduccionGame?.reset === 'function') { TraduccionGame.reset(); } else { console.warn("TraduccionGame.reset no disponible."); } break;
             case 'selection': break; default: console.warn(`Intento de resetear modo desconocido: ${gameModeToReset}`);
         }
         console.log(`Reseteo completado para ${gameModeToReset}`);
     }


    // --- Funciones del Temporizador General ---
    function updateTimerDisplay() { const formattedTime = formatTime(timeLeft); if (currentGameMode === 'matching-game') { if(matchingTimerSpan) matchingTimerSpan.textContent = formattedTime; } else if (currentGameMode === 'fill-blanks-game') { if(fillBlanksTimerSpan) fillBlanksTimerSpan.textContent = formattedTime; } }
    function startTimer(durationSeconds) { stopTimer(); timeLeft = durationSeconds; updateTimerDisplay(); timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); if (timeLeft <= 0) { handleTimeUp(); } }, 1000); }
    function stopTimer() { clearInterval(timerInterval); timerInterval = null; }
    function handleTimeUp() { console.log("Temporizador General: ¡Tiempo agotado!"); stopTimer(); if (currentGameMode === 'matching-game') { showMatchingResults(false); } else if (currentGameMode === 'fill-blanks-game') { if (!fillBlanksFinalized) { finalizeFillBlanksGame(); } } }


    // ===========================================
    // === LÓGICA JUEGO EMPAREJAR (MATCHING) =====
    // ===========================================
    // (Funciones checkMatch, applyCorrectMatch, applyIncorrectMatchFeedback sin cambios de v1.4)
    function checkMatch(p1, p2) { if (!p1?.dataset?.id || !p2?.dataset?.id) return false; if (p1.classList.contains('correct-match') || p2.classList.contains('correct-match') || p1.style.display === 'none' || p2.style.display === 'none') return false; return (p1.dataset.id === p2.dataset.id && p1.dataset.lang !== p2.dataset.lang); }
    function applyCorrectMatch(p1, p2) { console.log("MATCH CORRECTO:", p1.textContent, "&", p2.textContent); p1.classList.add('correct-match'); p2.classList.add('correct-match'); p1.style.pointerEvents = 'none'; p2.style.pointerEvents = 'none'; setTimeout(() => { p1.style.display = 'none'; p2.style.display = 'none'; scoreMatching++; if(currentScoreSpan) currentScoreSpan.textContent = scoreMatching; const remaining = wordArea?.querySelectorAll('.word-pill:not([style*="display: none"])').length ?? 0; if (remaining === 0) { console.log("Matching: ¡Todas las parejas encontradas!"); stopTimer(); setTimeout(() => showMatchingResults(true), 300); } }, 600); }
    function applyIncorrectMatchFeedback(p) { if (!p || p.classList.contains('correct-match') || p.style.display === 'none') return; console.log("MATCH INCORRECTO para:", p.textContent); p.classList.add('incorrect-match'); setTimeout(() => p?.classList.remove('incorrect-match'), 500); }
    // (Función renderMatchingWords con mejora shuffle de v1.4 y fix Sortable de v1.3)
    function renderMatchingWords() { if (!wordArea || !currentScoreSpan || !totalPairsSpan || typeof conectoresOriginal === 'undefined') { console.error("Matching Error en renderMatchingWords..."); if(wordArea) wordArea.innerHTML = "..."; return; } console.log("Renderizando palabras Matching (v1.6)..."); wordArea.innerHTML = ''; const englishTerms = []; const spanishTerms = []; const currentConnectors = shuffleArray(conectoresOriginal); currentConnectors.forEach(pair => { englishTerms.push({ id: pair.id, lang: 'en', text: pair.en }); spanishTerms.push({ id: pair.id, lang: 'es', text: pair.es }); }); const wordsToRender = [...englishTerms, ...spanishTerms]; shuffleArray(wordsToRender); scoreMatching = 0; currentScoreSpan.textContent = scoreMatching; totalPairsSpan.textContent = currentConnectors.length; wordsToRender.forEach(word => { const pill = document.createElement('div'); pill.classList.add('word-pill', `lang-${word.lang}`); pill.textContent = word.text; pill.dataset.id = word.id; pill.dataset.lang = word.lang; wordArea.appendChild(pill); }); console.log(`${wordsToRender.length} píldoras renderizadas.`); if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; } console.log("Programando inicialización de SortableJS..."); setTimeout(() => { console.log("Ejecutando inicialización SortableJS..."); if (typeof Sortable !== 'undefined') { console.log("Sortable DEFINIDO. Inicializando..."); try { sortableInstance = Sortable.create(wordArea, { animation: 150, ghostClass: 'sortable-ghost', chosenClass: 'sortable-chosen', dragClass: 'sortable-drag', forceFallback: true, filter: '.correct-match', preventOnFilter: true, onStart: (evt) => console.log("DEBUG: Sortable onStart:", evt.item.textContent), onEnd: (evt) => { console.log("DEBUG: Sortable onEnd fired."); const movedItem = evt.item; if (!movedItem || currentGameMode !== 'matching-game' || resultsOverlay?.classList.contains('hidden') === false || (!timerInterval && timeLeft <= 0)) { console.log("onEnd: Ignorando."); return; } const prev = movedItem.previousElementSibling, next = movedItem.nextElementSibling; let match = false, target = null; if (prev && prev.style.display !== 'none' && checkMatch(movedItem, prev)) { match = true; target = prev; } if (!match && next && next.style.display !== 'none' && checkMatch(movedItem, next)) { match = true; target = next; } if (match && target) applyCorrectMatch(movedItem, target); else applyIncorrectMatchFeedback(movedItem); } }); console.log("SortableJS inicializado con éxito (v1.6)."); } catch (error) { console.error("Error CRÍTICO al inicializar SortableJS:", error); if(wordArea) wordArea.innerHTML += "..."; sortableInstance = null; } } else { console.error("Error FATAL: SortableJS NO DEFINIDO después de setTimeout."); if(wordArea) wordArea.innerHTML += "..."; } }, 10); }
    // (Función showMatchingResults sin cambios)
    function showMatchingResults(won) { stopTimer(); if (sortableInstance) sortableInstance.option('disabled', true); if (!resultsOverlay || !correctPairsList) return; correctPairsList.innerHTML = ''; if (typeof conectoresOriginal !== 'undefined') { conectoresOriginal.forEach(pair => { const div = document.createElement('div'); div.textContent = `${pair.en} = ${pair.es}`; correctPairsList.appendChild(div); }); } let resultTitle = "Resultados"; if (won) resultTitle = "¡Felicidades, todas correctas!"; else if (timeLeft <= 0) resultTitle = "¡Tiempo Agotado!"; else resultTitle = "Te has rendido"; const titleElement = resultsOverlay.querySelector('h2'); if(titleElement) titleElement.textContent = resultTitle; resultsOverlay.classList.remove('hidden'); if(giveUpBtn) giveUpBtn.disabled = true; if(restartMatchingBtn) restartMatchingBtn.disabled = false; }
    /** Inicializa una nueva partida de Matching - USA showScreen **/
    function initializeMatchingGame() {
        console.log("Inicializando Matching Game...");
        scoreMatching = 0;
        renderMatchingWords(); // Renderiza píldoras e inicia SortableJS
        const selectedMinutes = parseInt(matchingTimeSelect.value, 10);
        startTimer(selectedMinutes * 60);
        showScreen('matching-game'); // <<-- Llama a showScreen para mostrar la pantalla del juego
        // Habilitar/Deshabilitar botones del juego
        if(giveUpBtn) giveUpBtn.disabled = false;
        if(restartMatchingBtn) restartMatchingBtn.disabled = true;
        if(resultsOverlay) resultsOverlay.classList.add('hidden');
        if (sortableInstance) sortableInstance.option('disabled', false);
    }
    /** Resetea el estado del juego de Matching - NO cambia pantalla **/
    function resetMatchingGame(needsGoToSetup) { // Renombrado parámetro para claridad
        stopTimer();
        if(wordArea) wordArea.innerHTML = '';
        scoreMatching = 0;
        if(currentScoreSpan) currentScoreSpan.textContent = '0';
        if(totalPairsSpan) totalPairsSpan.textContent = '0';
        if(matchingTimerSpan) matchingTimerSpan.textContent = '--:--';
        if(resultsOverlay) resultsOverlay.classList.add('hidden');
        if(giveUpBtn) giveUpBtn.disabled = true;
        if(restartMatchingBtn) restartMatchingBtn.disabled = true;
        if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; }
        // La navegación a setup la hará el listener de "Volver" si es necesario
    }
    // --- (FIN LÓGICA MATCHING) ---


    // --- Lógica Juego Rellenar (Fill Blanks) ---
    // (Funciones internas sin cambios)
    function renderFillBlanksTable() { if (!fillBlanksTableBody || typeof conectoresOriginal === 'undefined') return; fillBlanksTableBody.innerHTML = ''; currentConnectorsFill = shuffleArray(conectoresOriginal); scoreFillBlanks = 0; fillBlanksIncorrectScore = 0; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = scoreFillBlanks; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; if(fillBlanksTotalSpan) fillBlanksTotalSpan.textContent = currentConnectorsFill.length; translationDirection = translationDirectionSelect.value; fillBlanksFinalized = false; currentConnectorsFill.forEach((pair, index) => { const row = fillBlanksTableBody.insertRow(); row.dataset.id = pair.id; const sourceCell = row.insertCell(); sourceCell.textContent = (translationDirection === 'en-es') ? pair.en : pair.es; const inputCell = row.insertCell(); const input = document.createElement('input'); input.type = 'text'; input.placeholder = (translationDirection === 'en-es') ? 'Escribe en Español...' : 'Escribe en Inglés...'; input.dataset.id = pair.id; input.dataset.index = index; input.disabled = false; input.addEventListener('blur', handleFillBlanksInputBlur); inputCell.appendChild(input); const feedbackCell = row.insertCell(); feedbackCell.className = 'feedback'; feedbackCell.textContent = '-'; }); }
    function checkAnswerFillBlanks(userInput, correctAnswer) { const normalizedInput = userInput.trim().toLowerCase(); if (!normalizedInput) return false; const correctOptions = correctAnswer.toLowerCase().split(/[,/]/).map(opt => opt.trim()).filter(opt => opt.length > 0); if (correctOptions.length === 0) return false; const normalizeForCompare = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); const normalizedInputNoAccents = normalizeForCompare(normalizedInput); const correctOptionsNoAccents = correctOptions.map(normalizeForCompare); return correctOptions.includes(normalizedInput) || correctOptionsNoAccents.includes(normalizedInputNoAccents); }
    function handleFillBlanksInputBlur(event) { if (!fillBlanksFinalized) checkSingleAnswerAndUpdate(event.target); }
    function checkSingleAnswerAndUpdate(inputElement) { const row = inputElement.closest('tr'); if (!row) return; const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal.find(p => p.id == id); if (!connectorPair || !feedbackCell) return; const userAnswer = inputElement.value; const correctAnswer = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrectNow = checkAnswerFillBlanks(userAnswer, correctAnswer); const isIncorrectNow = !isCorrectNow && userAnswer.trim() !== ''; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrectNow) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); } else if (isIncorrectNow) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); } else { feedbackCell.textContent = '-'; } if (!feedbackCell.classList.contains('feedback')) feedbackCell.classList.add('feedback'); const currentTotalCorrect = fillBlanksTableBody ? fillBlanksTableBody.querySelectorAll('td.feedback.correct').length : 0; const currentTotalIncorrect = fillBlanksTableBody ? fillBlanksTableBody.querySelectorAll('td.feedback.incorrect').length : 0; scoreFillBlanks = currentTotalCorrect; fillBlanksIncorrectScore = currentTotalIncorrect; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = scoreFillBlanks; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; }
    function finalizeFillBlanksGame() { if (fillBlanksFinalized) return; fillBlanksFinalized = true; stopTimer(); console.log("Finalizando Fill Blanks..."); let finalCorrect = 0; let finalIncorrect = 0; const rows = fillBlanksTableBody ? fillBlanksTableBody.querySelectorAll('tr') : []; if (rows.length === 0) { if(checkAnswersBtn) checkAnswersBtn.disabled = true; return; } rows.forEach((row) => { const input = row.querySelector('input[type="text"]'); const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal.find(p => p.id == id); if (!input || !feedbackCell || !connectorPair) return; const userAnswer = input.value; const correctAnswerString = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrect = checkAnswerFillBlanks(userAnswer, correctAnswerString); const isIncorrect = !isCorrect && userAnswer.trim() !== ''; input.value = correctAnswerString; input.disabled = true; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrect) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); finalCorrect++; } else if (isIncorrect) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); finalIncorrect++; } else { feedbackCell.textContent = '-'; } if (!feedbackCell.classList.contains('feedback')) feedbackCell.classList.add('feedback'); }); scoreFillBlanks = finalCorrect; fillBlanksIncorrectScore = finalIncorrect; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = scoreFillBlanks; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; if(checkAnswersBtn) checkAnswersBtn.disabled = true; if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); console.log("Fill Blanks Finalizado."); }
    /** Inicializa una nueva partida de Fill Blanks - USA showScreen **/
    function initializeFillBlanksGame() {
        console.log("Inicializando Fill Blanks Game...");
        scoreFillBlanks = 0; fillBlanksIncorrectScore = 0;
        fillBlanksFinalized = false;
        renderFillBlanksTable();
        const selectedMinutes = parseInt(fillBlanksTimeSelect.value, 10);
        startTimer(selectedMinutes * 60);
        showScreen('fill-blanks-game'); // <<-- Llama a showScreen para mostrar la pantalla del juego
        if(checkAnswersBtn) checkAnswersBtn.disabled = false;
        if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = false;
    }
     /** Resetea el estado del juego de Fill Blanks - NO cambia pantalla **/
    function resetFillBlanksGame(needsGoToSetup) {
        stopTimer();
        if(fillBlanksTableBody) fillBlanksTableBody.innerHTML = '';
        scoreFillBlanks = 0; fillBlanksIncorrectScore = 0;
        if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = '0';
        if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = '0';
        if(fillBlanksTotalSpan) fillBlanksTotalSpan.textContent = '0';
        if(fillBlanksTimerSpan) fillBlanksTimerSpan.textContent = '--:--';
        if(checkAnswersBtn) checkAnswersBtn.disabled = true;
        if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = true;
        fillBlanksFinalized = false;
    }
    // --- (FIN LÓGICA FILL BLANKS) ---


    // --- Lógica Juego Gerundios/Infinitivos (Verb Patterns) ---
    // (Funciones internas sin cambios)
    function updateVerbPatternScores() { if(verbPatternCorrectSpan) verbPatternCorrectSpan.textContent = scoreVerbPattern; if(verbPatternIncorrectSpan) verbPatternIncorrectSpan.textContent = verbPatternIncorrectScore; if(verbPatternQCountSpan) verbPatternQCountSpan.textContent = Math.max(0, currentPatternIndex + 1); }
    function stopQuestionTimer() { clearInterval(verbPatternQuestionTimer); verbPatternQuestionTimer = null; }
    function startQuestionTimer() { stopQuestionTimer(); verbPatternQuestionTimeLeft = verbPatternTimePerQuestion; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; userCanAnswerVerbPattern = true; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = false); if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } verbPatternQuestionTimer = setInterval(() => { verbPatternQuestionTimeLeft--; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; if (verbPatternQuestionTimeLeft <= 0) { handleQuestionTimeout(); } }, 1000); }
    function handleQuestionTimeout() { console.log("VerbPattern: Tiempo Agotado!"); stopQuestionTimer(); userCanAnswerVerbPattern = false; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = true); verbPatternIncorrectScore++; updateVerbPatternScores(); if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = "¡Tiempo agotado! (Error)"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; } const currentPattern = currentVerbPatterns?.[currentPatternIndex]; if(currentPattern) showCorrectAnswerFeedback(currentPattern.category); setTimeout(displayNextVerbPatternQuestion, 2500); }
    function showCorrectAnswerFeedback(correctCategory) { if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => { button.style.border = ''; if(button.dataset.answer === correctCategory) button.style.border = '3px solid green'; }); }
    function handleVerbPatternAnswer(event) { if (!userCanAnswerVerbPattern) return; stopQuestionTimer(); userCanAnswerVerbPattern = false; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => { button.disabled = true; button.style.border = ''; }); const selectedButton = event.target; const selectedAnswer = selectedButton.dataset.answer; const currentPattern = currentVerbPatterns?.[currentPatternIndex]; if (!currentPattern) return; const correctAnswer = currentPattern.category; let isCorrect = selectedAnswer === correctAnswer; if (isCorrect) { scoreVerbPattern++; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = "¡Correcto!"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback correct'; } selectedButton.style.border = '3px solid green'; } else { verbPatternIncorrectScore++; const categoryMap = { 'gerund': 'Gerundio (-ing)', 'infinitive_to': 'Infinitivo (con TO)', 'infinitive_no_to': 'Infinitivo (sin TO)', 'both': 'Ambos' }; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = `Incorrecto. Era: ${categoryMap[correctAnswer] || correctAnswer}`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; } selectedButton.style.border = '3px solid red'; showCorrectAnswerFeedback(correctAnswer); } updateVerbPatternScores(); setTimeout(displayNextVerbPatternQuestion, isCorrect ? 1200 : 2500); }
    function displayNextVerbPatternQuestion() { currentPatternIndex++; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => { button.disabled = true; button.style.border = ''; }); if (currentPatternIndex < currentVerbPatterns.length) { const pattern = currentVerbPatterns[currentPatternIndex]; if(verbPatternTermDiv) verbPatternTermDiv.textContent = pattern.term; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = pattern.explanation || ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } updateVerbPatternScores(); startQuestionTimer(); } else { console.log("VerbPattern: Juego Terminado!"); if(verbPatternTermDiv) verbPatternTermDiv.textContent = "¡Juego Terminado!"; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = `Resultado Final: ${scoreVerbPattern} Aciertos, ${verbPatternIncorrectScore} Errores.`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '-'; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = true); if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Volver a Selección"; } }
    /** Resetea el estado del juego de Verb Patterns - NO cambia pantalla **/
    function resetVerbPatternGame(needsGoToSetup) {
        stopQuestionTimer();
        scoreVerbPattern = 0; verbPatternIncorrectScore = 0; currentPatternIndex = -1;
        if(verbPatternTermDiv) verbPatternTermDiv.textContent = '...';
        if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = '';
        if(verbPatternFeedbackDiv) verbPatternFeedbackDiv.textContent = '';
        if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '--';
        if(verbPatternCorrectSpan) verbPatternCorrectSpan.textContent = '0';
        if(verbPatternIncorrectSpan) verbPatternIncorrectSpan.textContent = '0';
        if(verbPatternQCountSpan) verbPatternQCountSpan.textContent = '0';
        if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = '0';
        if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Salir del Juego";
        if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(b => { b.disabled = true; b.style.border = ''; });
    }
     /** Inicializa una nueva partida de Verb Patterns - USA showScreen **/
    function initializeVerbPatternGame() {
        console.log("Inicializando Verb Patterns Game...");
        verbPatternTimePerQuestion = parseInt(verbPatternTimeSelect.value, 10);
        scoreVerbPattern = 0; verbPatternIncorrectScore = 0; currentPatternIndex = -1;
        if (typeof verbPatternData !== 'undefined' && verbPatternData.length > 0) {
             currentVerbPatterns = shuffleArray(verbPatternData);
             if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = currentVerbPatterns.length;
        } else {
             console.error("VerbPattern Error: Datos no cargados.");
             if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = '0';
             currentVerbPatterns = [];
        }
        updateVerbPatternScores(); // Pone scores a 0
        if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Salir del Juego";
        showScreen('verb-pattern-game'); // <<-- Llama a showScreen para mostrar la pantalla del juego
        if (currentVerbPatterns.length > 0) {
             displayNextVerbPatternQuestion(); // Empezar primera pregunta
        } else {
             if(verbPatternTermDiv) verbPatternTermDiv.textContent = "Error al cargar datos";
             if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = true);
        }
    }
    // --- (FIN LÓGICA VERB PATTERNS) ---


    // --- Event Listeners (SETUP Global) ---
    // 1. Botones Selección Juego
    const selectMatchingBtn = document.getElementById('select-matching-btn'); if(selectMatchingBtn) selectMatchingBtn.addEventListener('click', () => showScreen('matching-setup')); else console.error("Botón 'select-matching-btn' no encontrado.");
    const selectFillBlanksBtn = document.getElementById('select-fill-blanks-btn'); if(selectFillBlanksBtn) selectFillBlanksBtn.addEventListener('click', () => showScreen('fill-blanks-setup')); else console.error("Botón 'select-fill-blanks-btn' no encontrado.");
    const selectVerbPatternBtn = document.getElementById('select-verb-pattern-btn'); if (selectVerbPatternBtn) selectVerbPatternBtn.addEventListener('click', () => showScreen('verb-pattern-setup')); else console.error("Botón 'select-verb-pattern-btn' no encontrado.");
    const selectVerbsGameBtn = document.getElementById('select-verbs-game-btn'); if (selectVerbsGameBtn) selectVerbsGameBtn.addEventListener('click', () => showScreen('verbs')); else console.error("Botón 'select-verbs-game-btn' no encontrado.");
    const selectTraduccionGameBtn = document.getElementById('select-traduccion-game-btn'); if (selectTraduccionGameBtn) selectTraduccionGameBtn.addEventListener('click', () => showScreen('traduccion')); else console.error("Botón 'select-traduccion-game-btn' no encontrado.");

    // 2. Botones "Volver a Selección"
     if (backToSelectionButtons.length > 0) { backToSelectionButtons.forEach(button => { button.addEventListener('click', () => { const gameModeBeingLeft = currentGameMode; console.log(`Botón 'Volver' presionado desde: ${gameModeBeingLeft}`); if (gameModeBeingLeft && gameModeBeingLeft !== 'selection') { resetPreviousGame(gameModeBeingLeft); } showScreen('selection'); }); }); } else { console.warn("No se encontraron botones con la clase '.back-to-selection'."); }

    // 3. Listeners Inicio Juegos Originales (Botones "Empezar...")
    if(startMatchingBtn) startMatchingBtn.addEventListener('click', initializeMatchingGame); else console.error("Botón 'start-matching-btn' no encontrado.");
    if(startFillBlanksBtn) startFillBlanksBtn.addEventListener('click', initializeFillBlanksGame); else console.error("Botón 'start-fill-blanks-btn' no encontrado.");
    if(startVerbPatternBtn) startVerbPatternBtn.addEventListener('click', initializeVerbPatternGame); else console.error("Botón 'start-verb-pattern-btn' no encontrado.");

    // 4. Listeners Acciones DENTRO de Juegos Originales
    if(giveUpBtn) giveUpBtn.addEventListener('click', () => showMatchingResults(false));
    if(playAgainMatchingBtn) playAgainMatchingBtn.addEventListener('click', () => { if(resultsOverlay) resultsOverlay.classList.add('hidden'); resetMatchingGame(true); showScreen('matching-setup'); });
    if(restartMatchingBtn) restartMatchingBtn.addEventListener('click', () => { if(resultsOverlay) resultsOverlay.classList.add('hidden'); resetMatchingGame(false); initializeMatchingGame(); }); // Reinicia directo
    if(checkAnswersBtn) checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    if(restartFillBlanksBtn) restartFillBlanksBtn.addEventListener('click', () => { resetFillBlanksGame(false); initializeFillBlanksGame(); }); // Reinicia directo
    if(verbPatternOptionsDiv) { verbPatternOptionsDiv.addEventListener('click', (event) => { if (event.target.classList.contains('answer-button') && !event.target.disabled && userCanAnswerVerbPattern && (currentGameMode === 'verb-pattern-game')) { handleVerbPatternAnswer(event); } }); } else { console.error("Contenedor '#verb-pattern-options' no encontrado."); }

    // --- Inicialización General ---
    console.log("Aplicación inicializada (v1.6). Mostrando selección de juego.");
    showScreen('selection');

}); // Fin DOMContentLoaded
