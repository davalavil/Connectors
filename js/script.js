// ===========================================================
// js/script.js (PRINCIPAL - ORQUESTADOR DE JUEGOS - v1.3)
// Maneja la selección de juegos, visibilidad y control
// v1.3: Añadir setTimeout para inicialización de SortableJS.
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- Comprobación Inicial de Datos ---
    let dataError = false;
    if (typeof conectoresOriginal === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: 'conectoresOriginal' no definida (connectors.js). Juegos de Conectores podrían fallar.");
        dataError = true;
    }
    if (typeof verbPatternData === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: 'verbPatternData' no definida (verbPatterns.js). Juego de Patrones Verbales podría fallar.");
        dataError = true;
    }
    // Comprobación inicial de Sortable (solo para log)
    if (typeof Sortable === 'undefined') {
        console.warn("SCRIPT PRINCIPAL ADVERTENCIA (Inicial): Librería SortableJS NO DEFINIDA AÚN. Esperando carga...");
    } else {
        console.log("SortableJS library found (Inicial).");
    }
    // Resto de comprobaciones...
    if (typeof VerbsGame === 'undefined') { console.error("SCRIPT PRINCIPAL ERROR: Módulo 'VerbsGame' no encontrado...");}
    if (typeof TraduccionGame === 'undefined') { console.error("SCRIPT PRINCIPAL ERROR: Módulo 'TraduccionGame' no encontrado...");}


    // --- Variables Globales ---
    let currentGameMode = null;
    let timerInterval = null;
    let timeLeft = 0;
    let scoreMatching = 0;
    let sortableInstance = null;
    let currentConnectorsFill = [];
    let scoreFillBlanks = 0;
    let fillBlanksIncorrectScore = 0;
    let fillBlanksFinalized = false;
    let translationDirection = 'en-es';
    let currentVerbPatterns = [];
    let currentPatternIndex = -1;
    let scoreVerbPattern = 0;
    let verbPatternIncorrectScore = 0;
    let verbPatternTimePerQuestion = 15;
    let verbPatternQuestionTimer = null;
    let verbPatternQuestionTimeLeft = 0;
    let userCanAnswerVerbPattern = false;


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
    const wordArea = document.getElementById('word-area'); // <-- Contenedor clave
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


    // --- Función de Control de Visibilidad (Orquestador) ---
    function showScreen(screenId) {
        console.log(`Navegando a pantalla: ${screenId}`);
        gameSelectionDiv.classList.add('hidden'); matchingContainer.classList.add('hidden'); fillBlanksContainer.classList.add('hidden'); verbPatternContainer.classList.add('hidden'); verbsGameContainer.classList.add('hidden'); traduccionGameContainer.classList.add('hidden');
        if(matchingSetupDiv) matchingSetupDiv.classList.add('hidden'); if(matchingGameDiv) matchingGameDiv.classList.add('hidden'); if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.add('hidden'); if(fillBlanksGameDiv) fillBlanksGameDiv.classList.add('hidden'); if(verbPatternSetupDiv) verbPatternSetupDiv.classList.add('hidden'); if(verbPatternGameDiv) verbPatternGameDiv.classList.add('hidden'); if(resultsOverlay) resultsOverlay.classList.add('hidden');
        let titleText = "Selección de Juego"; let containerToShow = null;
        switch (screenId) {
            case 'selection': containerToShow = gameSelectionDiv; titleText = "Selección de Juego"; break;
            case 'matching-setup': containerToShow = matchingContainer; if(matchingSetupDiv) matchingSetupDiv.classList.remove('hidden'); titleText = "Emparejar Conectores"; break;
            case 'fill-blanks-setup': containerToShow = fillBlanksContainer; if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.remove('hidden'); titleText = "Rellenar Conectores"; break;
            case 'verb-pattern-setup': containerToShow = verbPatternContainer; if(verbPatternSetupDiv) verbPatternSetupDiv.classList.remove('hidden'); titleText = "Gerundios e Infinitivos"; break;
            case 'matching-game': containerToShow = matchingContainer; if(matchingGameDiv) matchingGameDiv.classList.remove('hidden'); titleText = "Emparejar Conectores"; break;
            case 'fill-blanks-game': containerToShow = fillBlanksContainer; if(fillBlanksGameDiv) fillBlanksGameDiv.classList.remove('hidden'); titleText = "Rellenar Conectores"; break;
            case 'verb-pattern-game': containerToShow = verbPatternContainer; if(verbPatternGameDiv) verbPatternGameDiv.classList.remove('hidden'); titleText = "Gerundios e Infinitivos"; break;
            case 'verbs': containerToShow = verbsGameContainer; titleText = "Práctica de Verbos"; if (typeof VerbsGame !== 'undefined' && VerbsGame.init) { VerbsGame.init(verbsGameContainer); } else { console.error("Error VerbsGame.init"); verbsGameContainer.innerHTML = "<p class='error-message'>Error al cargar juego.</p>"; verbsGameContainer.classList.remove('hidden'); containerToShow = null; } break;
            case 'traduccion': containerToShow = traduccionGameContainer; titleText = "Práctica de Vocabulario"; if (typeof TraduccionGame !== 'undefined' && TraduccionGame.init) { TraduccionGame.init(traduccionGameContainer); } else { console.error("Error TraduccionGame.init"); traduccionGameContainer.innerHTML = "<p class='error-message'>Error al cargar juego.</p>"; traduccionGameContainer.classList.remove('hidden'); containerToShow = null; } break;
            default: console.warn("showScreen ID desconocido:", screenId); containerToShow = gameSelectionDiv; screenId = 'selection';
        }
        if (containerToShow) { containerToShow.classList.remove('hidden'); } else if (screenId !== 'verbs' && screenId !== 'traduccion') { console.error(`Contenedor para '${screenId}' no encontrado.`); gameSelectionDiv.classList.remove('hidden'); screenId = 'selection'; }
        if(mainTitle) mainTitle.textContent = titleText; currentGameMode = screenId; window.scrollTo({ top: 0, behavior: 'smooth' });
    }

     // --- Función para Resetear Juego Anterior ---
     function resetPreviousGame(gameModeToReset) {
        console.log(`Intentando resetear juego: ${gameModeToReset}`);
        stopTimer(); stopQuestionTimer();
        switch (gameModeToReset) {
             case 'matching': case 'matching-setup': case 'matching-game': resetMatchingGame(true); break;
             case 'fill-blanks': case 'fill-blanks-setup': case 'fill-blanks-game': resetFillBlanksGame(true); break;
             case 'verb-pattern': case 'verb-pattern-setup': case 'verb-pattern-game': resetVerbPatternGame(true); break;
             case 'verbs': if (typeof VerbsGame?.reset === 'function') { console.log("Llamando a VerbsGame.reset()"); VerbsGame.reset(); } else { console.warn("VerbsGame.reset no disponible."); } break;
             case 'traduccion': if (typeof TraduccionGame?.reset === 'function') { console.log("Llamando a TraduccionGame.reset()"); TraduccionGame.reset(); } else { console.warn("TraduccionGame.reset no disponible."); } break;
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
    function checkMatch(p1, p2) { if (!p1?.dataset?.id || !p2?.dataset?.id) return false; if (p1.classList.contains('correct-match') || p2.classList.contains('correct-match') || p1.style.display === 'none' || p2.style.display === 'none') return false; return (p1.dataset.id === p2.dataset.id && p1.dataset.lang !== p2.dataset.lang); }
    function applyCorrectMatch(p1, p2) { console.log("MATCH CORRECTO:", p1.textContent, "&", p2.textContent); p1.classList.add('correct-match'); p2.classList.add('correct-match'); p1.style.pointerEvents = 'none'; p2.style.pointerEvents = 'none'; setTimeout(() => { p1.style.display = 'none'; p2.style.display = 'none'; scoreMatching++; if(currentScoreSpan) currentScoreSpan.textContent = scoreMatching; const remaining = wordArea?.querySelectorAll('.word-pill:not([style*="display: none"])').length ?? 0; if (remaining === 0) { console.log("Matching: ¡Todas las parejas encontradas!"); stopTimer(); setTimeout(() => showMatchingResults(true), 300); } }, 600); }
    function applyIncorrectMatchFeedback(p) { if (!p || p.classList.contains('correct-match') || p.style.display === 'none') return; console.log("MATCH INCORRECTO para:", p.textContent); p.classList.add('incorrect-match'); setTimeout(() => p?.classList.remove('incorrect-match'), 500); }

    /** Renderiza píldoras y (RE)INICIALIZA SortableJS - CON setTimeout **/
    function renderMatchingWords() {
        if (!wordArea || !currentScoreSpan || !totalPairsSpan || typeof conectoresOriginal === 'undefined') {
            console.error("Matching Error en renderMatchingWords: Faltan elementos DOM o datos 'conectoresOriginal'.");
            if(wordArea) wordArea.innerHTML = "<p class='error-message'>Error al cargar palabras.</p>";
            return;
        }
        console.log("Renderizando palabras para Matching Game...");
        wordArea.innerHTML = '';

        // Preparar y añadir píldoras (igual que antes)
        const wordsToRender = [];
        const currentConnectors = shuffleArray(conectoresOriginal);
        scoreMatching = 0;
        currentScoreSpan.textContent = scoreMatching;
        totalPairsSpan.textContent = currentConnectors.length;
        currentConnectors.forEach(pair => {
            wordsToRender.push({ id: pair.id, lang: 'en', text: pair.en });
            wordsToRender.push({ id: pair.id, lang: 'es', text: pair.es });
        });
        shuffleArray(wordsToRender);
        wordsToRender.forEach(word => { /* ... crear y añadir pill ... */
             const pill = document.createElement('div');
             pill.classList.add('word-pill', `lang-${word.lang}`);
             pill.textContent = word.text;
             pill.dataset.id = word.id;
             pill.dataset.lang = word.lang;
             wordArea.appendChild(pill);
         });
        console.log(`${wordsToRender.length} píldoras renderizadas en #word-area.`);
        const pillCount = wordArea.querySelectorAll('.word-pill').length;
        console.log(`DEBUG: Número de .word-pill encontradas: ${pillCount}`);

        // Destruir instancia anterior si existe
        if (sortableInstance) {
            console.log("Destruyendo instancia SortableJS anterior.");
            sortableInstance.destroy();
            sortableInstance = null;
        }

        // ******** CAMBIO PRINCIPAL: Usar setTimeout ********
        // Esperar un breve momento (e.g., 10ms) antes de inicializar SortableJS
        // para dar tiempo al navegador a procesar la carga de la librería externa.
        console.log("Programando inicialización de SortableJS con setTimeout(..., 10)");
        setTimeout(() => {
            console.log("Ejecutando inicialización de SortableJS dentro de setTimeout.");
            // Comprobar DE NUEVO si Sortable está definido AHORA
            if (typeof Sortable !== 'undefined') {
                console.log("Sortable está DEFINIDO dentro de setTimeout. Intentando inicializar...");
                try {
                    sortableInstance = Sortable.create(wordArea, {
                        animation: 150,
                        ghostClass: 'sortable-ghost',
                        chosenClass: 'sortable-chosen',
                        dragClass: 'sortable-drag',
                        forceFallback: true,
                        filter: '.correct-match',
                        preventOnFilter: true,
                        onStart: function(evt) {
                            console.log("DEBUG: SortableJS onStart - Drag iniciado para:", evt.item.textContent);
                        },
                        onEnd: function (evt) {
                            console.log("DEBUG: SortableJS onEnd event fired.");
                            const movedItem = evt.item;
                            if (!movedItem) { console.error("onEnd Error: evt.item es nulo."); return; }
                            if (currentGameMode !== 'matching-game' || resultsOverlay?.classList.contains('hidden') === false || (!timerInterval && timeLeft <= 0) ) {
                                console.log("onEnd: Ignorando evento (condiciones no cumplidas)."); return;
                            }
                            const prevSibling = movedItem.previousElementSibling;
                            const nextSibling = movedItem.nextElementSibling;
                            let matchFound = false; let targetPill = null;
                            if (prevSibling && prevSibling.style.display !== 'none' && checkMatch(movedItem, prevSibling)) { matchFound = true; targetPill = prevSibling; }
                            if (!matchFound && nextSibling && nextSibling.style.display !== 'none' && checkMatch(movedItem, nextSibling)) { matchFound = true; targetPill = nextSibling; }
                            if (matchFound && targetPill) { applyCorrectMatch(movedItem, targetPill); } else { applyIncorrectMatchFeedback(movedItem); }
                        }
                    });
                    console.log("SortableJS inicializado con éxito DESPUÉS de setTimeout. Instancia:", sortableInstance);
                } catch (error) {
                    console.error("Error CRÍTICO al inicializar SortableJS (dentro de setTimeout):", error);
                    if(wordArea) wordArea.innerHTML += "<p class='error-message'>¡Error fatal al activar la función de arrastrar!</p>";
                    sortableInstance = null;
                }
            } else {
                // Si sigue sin estar definido incluso después del timeout, el problema es más grave (carga fallida, etc.)
                console.error("Error FATAL: SortableJS sigue sin estar definido incluso después de setTimeout. La librería no se cargó correctamente.");
                if(wordArea) wordArea.innerHTML += "<p style='color:red; text-align:center; font-weight:bold;'>Error: La función de arrastrar y soltar no pudo cargarse.</p>";
            }
        }, 10); // Esperar 10 milisegundos

    } // Fin renderMatchingWords

    function showMatchingResults(won) { stopTimer(); if (sortableInstance) sortableInstance.option('disabled', true); if (!resultsOverlay || !correctPairsList) return; correctPairsList.innerHTML = ''; if (typeof conectoresOriginal !== 'undefined') { conectoresOriginal.forEach(pair => { const div = document.createElement('div'); div.textContent = `${pair.en} = ${pair.es}`; correctPairsList.appendChild(div); }); } let resultTitle = "Resultados"; if (won) resultTitle = "¡Felicidades, todas correctas!"; else if (timeLeft <= 0) resultTitle = "¡Tiempo Agotado!"; else resultTitle = "Te has rendido"; const titleElement = resultsOverlay.querySelector('h2'); if(titleElement) titleElement.textContent = resultTitle; resultsOverlay.classList.remove('hidden'); if(giveUpBtn) giveUpBtn.disabled = true; if(restartMatchingBtn) restartMatchingBtn.disabled = false; }
    function initializeMatchingGame() { scoreMatching = 0; renderMatchingWords(); const selectedMinutes = parseInt(matchingTimeSelect.value, 10); startTimer(selectedMinutes * 60); showScreen('matching-game'); if(giveUpBtn) giveUpBtn.disabled = false; if(restartMatchingBtn) restartMatchingBtn.disabled = true; if(resultsOverlay) resultsOverlay.classList.add('hidden'); if (sortableInstance) sortableInstance.option('disabled', false); }
    function resetMatchingGame(goToSetup) { stopTimer(); if(wordArea) wordArea.innerHTML = ''; scoreMatching = 0; if(currentScoreSpan) currentScoreSpan.textContent = '0'; if(totalPairsSpan) totalPairsSpan.textContent = '0'; if(matchingTimerSpan) matchingTimerSpan.textContent = '--:--'; if(resultsOverlay) resultsOverlay.classList.add('hidden'); if(giveUpBtn) giveUpBtn.disabled = true; if(restartMatchingBtn) restartMatchingBtn.disabled = true; if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; } }
    // --- (FIN LÓGICA MATCHING) ---


    // --- Lógica Juego Rellenar (Fill Blanks) ---
    function renderFillBlanksTable() { if (!fillBlanksTableBody || typeof conectoresOriginal === 'undefined') { console.error("FillBlanks Error: Falta tbody o datos."); return; } fillBlanksTableBody.innerHTML = ''; currentConnectorsFill = shuffleArray(conectoresOriginal); scoreFillBlanks = 0; fillBlanksIncorrectScore = 0; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = scoreFillBlanks; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; if(fillBlanksTotalSpan) fillBlanksTotalSpan.textContent = currentConnectorsFill.length; translationDirection = translationDirectionSelect.value; fillBlanksFinalized = false; currentConnectorsFill.forEach((pair, index) => { const row = fillBlanksTableBody.insertRow(); row.dataset.id = pair.id; const sourceCell = row.insertCell(); sourceCell.textContent = (translationDirection === 'en-es') ? pair.en : pair.es; const inputCell = row.insertCell(); const input = document.createElement('input'); input.type = 'text'; input.placeholder = (translationDirection === 'en-es') ? 'Escribe en Español...' : 'Escribe en Inglés...'; input.dataset.id = pair.id; input.dataset.index = index; input.disabled = false; input.addEventListener('blur', handleFillBlanksInputBlur); inputCell.appendChild(input); const feedbackCell = row.insertCell(); feedbackCell.className = 'feedback'; feedbackCell.textContent = '-'; }); }
    function checkAnswerFillBlanks(userInput, correctAnswer) { const normalizedInput = userInput.trim().toLowerCase(); if (!normalizedInput) return false; const correctOptions = correctAnswer.toLowerCase().split(/[,/]/).map(opt => opt.trim()).filter(opt => opt.length > 0); if (correctOptions.length === 0) return false; const normalizeForCompare = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); const normalizedInputNoAccents = normalizeForCompare(normalizedInput); const correctOptionsNoAccents = correctOptions.map(normalizeForCompare); return correctOptions.includes(normalizedInput) || correctOptionsNoAccents.includes(normalizedInputNoAccents); }
    function handleFillBlanksInputBlur(event) { if (!fillBlanksFinalized) checkSingleAnswerAndUpdate(event.target); }
    function checkSingleAnswerAndUpdate(inputElement) { const row = inputElement.closest('tr'); if (!row) return; const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal.find(p => p.id == id); if (!connectorPair || !feedbackCell) return; const userAnswer = inputElement.value; const correctAnswer = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrectNow = checkAnswerFillBlanks(userAnswer, correctAnswer); const isIncorrectNow = !isCorrectNow && userAnswer.trim() !== ''; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrectNow) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); } else if (isIncorrectNow) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); } else { feedbackCell.textContent = '-'; } if (!feedbackCell.classList.contains('feedback')) feedbackCell.classList.add('feedback'); const currentTotalCorrect = fillBlanksTableBody ? fillBlanksTableBody.querySelectorAll('td.feedback.correct').length : 0; const currentTotalIncorrect = fillBlanksTableBody ? fillBlanksTableBody.querySelectorAll('td.feedback.incorrect').length : 0; scoreFillBlanks = currentTotalCorrect; fillBlanksIncorrectScore = currentTotalIncorrect; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = scoreFillBlanks; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; }
    function finalizeFillBlanksGame() { if (fillBlanksFinalized) return; fillBlanksFinalized = true; stopTimer(); console.log("Finalizando Fill Blanks..."); let finalCorrect = 0; let finalIncorrect = 0; const rows = fillBlanksTableBody ? fillBlanksTableBody.querySelectorAll('tr') : []; if (rows.length === 0) { if(checkAnswersBtn) checkAnswersBtn.disabled = true; return; } rows.forEach((row) => { const input = row.querySelector('input[type="text"]'); const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal.find(p => p.id == id); if (!input || !feedbackCell || !connectorPair) return; const userAnswer = input.value; const correctAnswerString = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrect = checkAnswerFillBlanks(userAnswer, correctAnswerString); const isIncorrect = !isCorrect && userAnswer.trim() !== ''; input.value = correctAnswerString; input.disabled = true; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrect) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); finalCorrect++; } else if (isIncorrect) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); finalIncorrect++; } else { feedbackCell.textContent = '-'; } if (!feedbackCell.classList.contains('feedback')) feedbackCell.classList.add('feedback'); }); scoreFillBlanks = finalCorrect; fillBlanksIncorrectScore = finalIncorrect; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = scoreFillBlanks; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; if(checkAnswersBtn) checkAnswersBtn.disabled = true; if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); console.log("Fill Blanks Finalizado."); }
    function initializeFillBlanksGame() { scoreFillBlanks = 0; fillBlanksIncorrectScore = 0; fillBlanksFinalized = false; renderFillBlanksTable(); const selectedMinutes = parseInt(fillBlanksTimeSelect.value, 10); startTimer(selectedMinutes * 60); showScreen('fill-blanks-game'); if(checkAnswersBtn) checkAnswersBtn.disabled = false; if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = false; }
    function resetFillBlanksGame(goToSetup) { stopTimer(); if(fillBlanksTableBody) fillBlanksTableBody.innerHTML = ''; scoreFillBlanks = 0; fillBlanksIncorrectScore = 0; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = '0'; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = '0'; if(fillBlanksTotalSpan) fillBlanksTotalSpan.textContent = '0'; if(fillBlanksTimerSpan) fillBlanksTimerSpan.textContent = '--:--'; if(checkAnswersBtn) checkAnswersBtn.disabled = true; if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = true; fillBlanksFinalized = false; }
    // --- (FIN LÓGICA FILL BLANKS) ---


    // --- Lógica Juego Gerundios/Infinitivos (Verb Patterns) ---
    function updateVerbPatternScores() { if(verbPatternCorrectSpan) verbPatternCorrectSpan.textContent = scoreVerbPattern; if(verbPatternIncorrectSpan) verbPatternIncorrectSpan.textContent = verbPatternIncorrectScore; if(verbPatternQCountSpan) verbPatternQCountSpan.textContent = Math.max(0, currentPatternIndex + 1); }
    function stopQuestionTimer() { clearInterval(verbPatternQuestionTimer); verbPatternQuestionTimer = null; }
    function startQuestionTimer() { stopQuestionTimer(); verbPatternQuestionTimeLeft = verbPatternTimePerQuestion; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; userCanAnswerVerbPattern = true; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = false); if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } verbPatternQuestionTimer = setInterval(() => { verbPatternQuestionTimeLeft--; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; if (verbPatternQuestionTimeLeft <= 0) { handleQuestionTimeout(); } }, 1000); }
    function handleQuestionTimeout() { console.log("VerbPattern: Tiempo Agotado!"); stopQuestionTimer(); userCanAnswerVerbPattern = false; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = true); verbPatternIncorrectScore++; updateVerbPatternScores(); if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = "¡Tiempo agotado! (Error)"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; } const currentPattern = currentVerbPatterns?.[currentPatternIndex]; if(currentPattern) showCorrectAnswerFeedback(currentPattern.category); setTimeout(displayNextVerbPatternQuestion, 2500); }
    function showCorrectAnswerFeedback(correctCategory) { if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => { button.style.border = ''; if(button.dataset.answer === correctCategory) button.style.border = '3px solid green'; }); }
    function handleVerbPatternAnswer(event) { if (!userCanAnswerVerbPattern) return; stopQuestionTimer(); userCanAnswerVerbPattern = false; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => { button.disabled = true; button.style.border = ''; }); const selectedButton = event.target; const selectedAnswer = selectedButton.dataset.answer; const currentPattern = currentVerbPatterns?.[currentPatternIndex]; if (!currentPattern) return; const correctAnswer = currentPattern.category; let isCorrect = selectedAnswer === correctAnswer; if (isCorrect) { scoreVerbPattern++; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = "¡Correcto!"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback correct'; } selectedButton.style.border = '3px solid green'; } else { verbPatternIncorrectScore++; const categoryMap = { 'gerund': 'Gerundio (-ing)', 'infinitive_to': 'Infinitivo (con TO)', 'infinitive_no_to': 'Infinitivo (sin TO)', 'both': 'Ambos' }; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = `Incorrecto. Era: ${categoryMap[correctAnswer] || correctAnswer}`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; } selectedButton.style.border = '3px solid red'; showCorrectAnswerFeedback(correctAnswer); } updateVerbPatternScores(); setTimeout(displayNextVerbPatternQuestion, isCorrect ? 1200 : 2500); }
    function displayNextVerbPatternQuestion() { currentPatternIndex++; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => { button.disabled = true; button.style.border = ''; }); if (currentPatternIndex < currentVerbPatterns.length) { const pattern = currentVerbPatterns[currentPatternIndex]; if(verbPatternTermDiv) verbPatternTermDiv.textContent = pattern.term; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = pattern.explanation || ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } updateVerbPatternScores(); startQuestionTimer(); } else { console.log("VerbPattern: Juego Terminado!"); if(verbPatternTermDiv) verbPatternTermDiv.textContent = "¡Juego Terminado!"; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = `Resultado Final: ${scoreVerbPattern} Aciertos, ${verbPatternIncorrectScore} Errores.`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '-'; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = true); if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Volver a Selección"; } }
    function resetVerbPatternGame(goToSetup) { stopQuestionTimer(); scoreVerbPattern = 0; verbPatternIncorrectScore = 0; currentPatternIndex = -1; if(verbPatternTermDiv) verbPatternTermDiv.textContent = '...'; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = ''; if(verbPatternFeedbackDiv) verbPatternFeedbackDiv.textContent = ''; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '--'; if(verbPatternCorrectSpan) verbPatternCorrectSpan.textContent = '0'; if(verbPatternIncorrectSpan) verbPatternIncorrectSpan.textContent = '0'; if(verbPatternQCountSpan) verbPatternQCountSpan.textContent = '0'; if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = '0'; if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Salir del Juego"; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(b => { b.disabled = true; b.style.border = ''; }); }
    function initializeVerbPatternGame() { verbPatternTimePerQuestion = parseInt(verbPatternTimeSelect.value, 10); scoreVerbPattern = 0; verbPatternIncorrectScore = 0; currentPatternIndex = -1; if (typeof verbPatternData !== 'undefined' && verbPatternData.length > 0) { currentVerbPatterns = shuffleArray(verbPatternData); if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = currentVerbPatterns.length; } else { console.error("VerbPattern Error: No se pudieron cargar los datos 'verbPatternData'."); if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = '0'; currentVerbPatterns = []; } updateVerbPatternScores(); if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Salir del Juego"; showScreen('verb-pattern-game'); if (currentVerbPatterns.length > 0) { displayNextVerbPatternQuestion(); } else { if(verbPatternTermDiv) verbPatternTermDiv.textContent = "Error al cargar datos"; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = true); } }
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

    // 3. Listeners Inicio Juegos Originales
    if(startMatchingBtn) startMatchingBtn.addEventListener('click', initializeMatchingGame); else console.error("Botón 'start-matching-btn' no encontrado.");
    if(startFillBlanksBtn) startFillBlanksBtn.addEventListener('click', initializeFillBlanksGame); else console.error("Botón 'start-fill-blanks-btn' no encontrado.");
    if(startVerbPatternBtn) startVerbPatternBtn.addEventListener('click', initializeVerbPatternGame); else console.error("Botón 'start-verb-pattern-btn' no encontrado.");

    // 4. Listeners Acciones Juegos Originales
    if(giveUpBtn) giveUpBtn.addEventListener('click', () => showMatchingResults(false));
    if(playAgainMatchingBtn) playAgainMatchingBtn.addEventListener('click', () => { if(resultsOverlay) resultsOverlay.classList.add('hidden'); resetMatchingGame(true); showScreen('matching-setup'); });
    if(restartMatchingBtn) restartMatchingBtn.addEventListener('click', () => { if(resultsOverlay) resultsOverlay.classList.add('hidden'); resetMatchingGame(false); initializeMatchingGame(); });
    if(checkAnswersBtn) checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    if(restartFillBlanksBtn) restartFillBlanksBtn.addEventListener('click', () => { resetFillBlanksGame(false); initializeFillBlanksGame(); });
    if(verbPatternOptionsDiv) { verbPatternOptionsDiv.addEventListener('click', (event) => { if (event.target.classList.contains('answer-button') && !event.target.disabled && userCanAnswerVerbPattern && (currentGameMode === 'verb-pattern-game')) { handleVerbPatternAnswer(event); } }); } else { console.error("Contenedor '#verb-pattern-options' no encontrado."); }


    // --- Inicialización General de la Aplicación ---
    console.log("Aplicación inicializada (v1.3). Mostrando selección de juego.");
    showScreen('selection'); // Mostrar la pantalla de selección al cargar

}); // Fin DOMContentLoaded
