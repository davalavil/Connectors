// ==========================================================
// js/script.js (PRINCIPAL - v4 CORREGIDO SyntaxError L315)
// Orquesta la selección, visualización e inicialización/reset
// de todos los juegos.
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Inicializando Script Principal v4 (SyntaxError L315 Corregido)...");

    // --- Comprobación Inicial de Datos y Módulos ---
    let dataErrorOriginal = false;
    let moduleError = false;
    if (typeof conectoresOriginal === 'undefined') { console.error("SCRIPT PRINCIPAL ERROR: 'conectoresOriginal' no definida."); dataErrorOriginal = true; }
    if (typeof verbPatternData === 'undefined') { console.error("SCRIPT PRINCIPAL ERROR: 'verbPatternData' no definida."); dataErrorOriginal = true; }
    if (typeof Sortable === 'undefined') { console.warn("SCRIPT PRINCIPAL ADVERTENCIA: Librería 'SortableJS' no encontrada."); }
    if (typeof VerbsGame === 'undefined') { console.error("SCRIPT PRINCIPAL ERROR: Módulo 'VerbsGame' no encontrado."); moduleError = true; }
    if (typeof TraduccionGame === 'undefined') { console.error("SCRIPT PRINCIPAL ERROR: Módulo 'TraduccionGame' no encontrado."); moduleError = true; }
    if (dataErrorOriginal || moduleError) { alert("Error crítico al cargar datos o módulos de juego. Revisa la consola (F12). Algunos juegos pueden no funcionar."); }

    // --- Variables Globales del Orquestador ---
    let currentGameMode = null;
    let timerInterval = null;
    let timeLeft = 0;
    let verbPatternQuestionTimer = null;

    // --- Variables Específicas de Juegos Originales ---
    let score = 0;
    let fillBlanksScore = 0;
    let fillBlanksIncorrectScore = 0;
    let fillBlanksFinalized = false;
    let sortableInstance = null;
    let verbPatternScore = 0;
    let verbPatternIncorrectScore = 0;
    let currentVerbPatterns = [];
    let currentPatternIndex = -1;
    let verbPatternTimePerQuestion = 15;
    let verbPatternQuestionTimeLeft = 0;
    let userCanAnswer = false;
    let translationDirection = 'en-es';
    let currentConnectors = [];

    // --- Elementos del DOM Comunes ---
    const mainTitle = document.getElementById('main-title');
    const gameSelectionDiv = document.getElementById('game-selection');
    const backToSelectionButtons = document.querySelectorAll('.back-to-selection');

    // --- Contenedores Principales de Juegos ---
    const matchingContainer = document.getElementById('matching-container');
    const fillBlanksContainer = document.getElementById('fill-blanks-container');
    const verbPatternContainer = document.getElementById('verb-pattern-container');
    const verbsGameContainer = document.getElementById('verbs-game-container');
    const traduccionGameContainer = document.getElementById('traduccion-game-container');
    const allGameContainers = [ gameSelectionDiv, matchingContainer, fillBlanksContainer, verbPatternContainer, verbsGameContainer, traduccionGameContainer ];

    // --- Elementos DOM Juegos Originales ---
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
    const verbPatternAnswerButtons = verbPatternOptionsDiv?.querySelectorAll('.answer-button');

    // --- Funciones de Utilidad ---
    function shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; } return array; }
    function formatTime(seconds) { const minutes = Math.floor(seconds / 60); const remainingSeconds = seconds % 60; return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`; }

    // --- Función Central de Control de Visibilidad ---
    function showScreen(screenId) {
        console.log(`Intentando mostrar pantalla: ${screenId}`);
        allGameContainers.forEach(container => { if (container) container.classList.add('hidden'); });
        [matchingSetupDiv, matchingGameDiv, fillBlanksSetupDiv, fillBlanksGameDiv, verbPatternSetupDiv, verbPatternGameDiv, resultsOverlay].forEach(subSection => { if (subSection) subSection.classList.add('hidden'); });

        currentGameMode = screenId;
        let titleText = "Juegos de Inglés";
        let targetContainer = null;

        switch (screenId) {
            case 'selection': targetContainer = gameSelectionDiv; titleText = "Selección de Juego"; break;
            case 'matching-setup': targetContainer = matchingContainer; if(matchingSetupDiv) matchingSetupDiv.classList.remove('hidden'); titleText = "Emparejar Conectores - Config."; break;
            case 'matching-game': targetContainer = matchingContainer; if(matchingGameDiv) matchingGameDiv.classList.remove('hidden'); titleText = "Emparejar Conectores"; break;
            case 'fill-blanks-setup': targetContainer = fillBlanksContainer; if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.remove('hidden'); titleText = "Rellenar Conectores - Config."; break;
            case 'fill-blanks-game': targetContainer = fillBlanksContainer; if(fillBlanksGameDiv) fillBlanksGameDiv.classList.remove('hidden'); titleText = "Rellenar Conectores"; break;
            case 'verb-pattern-setup': targetContainer = verbPatternContainer; if(verbPatternSetupDiv) verbPatternSetupDiv.classList.remove('hidden'); titleText = "Gerundios/Infinitivos - Config."; break;
            case 'verb-pattern-game': targetContainer = verbPatternContainer; if(verbPatternGameDiv) verbPatternGameDiv.classList.remove('hidden'); titleText = "Gerundios/Infinitivos"; break;
            case 'verbs':
                targetContainer = verbsGameContainer; titleText = "Práctica de Verbos";
                if (targetContainer && typeof VerbsGame?.init === 'function') { VerbsGame.init(targetContainer); }
                else if (!targetContainer) { console.error("showScreen: Contenedor 'verbsGameContainer' no encontrado."); }
                else { console.error("showScreen: Módulo 'VerbsGame.init' no disponible."); if(targetContainer) targetContainer.innerHTML = "<p class='error-message'>Error: No se pudo cargar el juego de Verbos.</p>"; }
                break;
            case 'traduccion':
                 targetContainer = traduccionGameContainer; titleText = "Práctica de Vocabulario";
                 if (targetContainer && typeof TraduccionGame?.init === 'function') { TraduccionGame.init(targetContainer); }
                 else if (!targetContainer) { console.error("showScreen: Contenedor 'traduccionGameContainer' no encontrado."); }
                 else { console.error("showScreen: Módulo 'TraduccionGame.init' no disponible."); if(targetContainer) targetContainer.innerHTML = "<p class='error-message'>Error: No se pudo cargar el juego de Vocabulario.</p>"; }
                break;
            default:
                 console.warn("showScreen: ID de pantalla desconocido:", screenId); targetContainer = gameSelectionDiv; currentGameMode = 'selection'; titleText = "Selección de Juego";
        }

        if (targetContainer) { targetContainer.classList.remove('hidden'); console.log(`Contenedor ${targetContainer.id || 'gameSelectionDiv'} mostrado.`); }
        else { console.error(`showScreen: No se pudo encontrar/mostrar el contenedor para '${screenId}'`); if(gameSelectionDiv) gameSelectionDiv.classList.remove('hidden'); currentGameMode = 'selection'; }
        if(mainTitle) { mainTitle.textContent = titleText; }
    }

     // --- Función para Resetear/Limpiar el Juego Anterior ---
     function resetPreviousGame(gameModeToReset) {
         console.log(`Intentando resetear juego anterior: ${gameModeToReset}`);
         stopTimer(); stopQuestionTimer();
         switch (gameModeToReset) {
             case 'matching-setup': case 'matching-game': resetMatchingGame(); break;
             case 'fill-blanks-setup': case 'fill-blanks-game': resetFillBlanksGame(); break;
             case 'verb-pattern-setup': case 'verb-pattern-game': cleanUpVerbPatternGame(); break;
             case 'verbs': if (typeof VerbsGame?.reset === 'function') VerbsGame.reset(); else console.warn("resetPreviousGame: No se pudo resetear 'VerbsGame'."); break;
             case 'traduccion': if (typeof TraduccionGame?.reset === 'function') TraduccionGame.reset(); else console.warn("resetPreviousGame: No se pudo resetear 'TraduccionGame'."); break;
             default: console.log(`resetPreviousGame: No se requiere reset para ${gameModeToReset}`); break;
         }
         console.log(`Reseteo para ${gameModeToReset} completado (si aplica).`);
     }

    // --- Funciones del Temporizador General ---
    function updateTimerDisplay() { const formattedTime = formatTime(timeLeft); if (currentGameMode === 'matching-game' && matchingTimerSpan) matchingTimerSpan.textContent = formattedTime; else if (currentGameMode === 'fill-blanks-game' && fillBlanksTimerSpan) fillBlanksTimerSpan.textContent = formattedTime; }
    function startTimer(durationSeconds) { if (timerInterval) clearInterval(timerInterval); timeLeft = durationSeconds; updateTimerDisplay(); timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); if (timeLeft <= 0) { clearInterval(timerInterval); timerInterval = null; handleTimeUp(); } }, 1000); }
    function stopTimer() { clearInterval(timerInterval); timerInterval = null; }
    function handleTimeUp() { if (currentGameMode === 'matching-game') showMatchingResults(false); else if (currentGameMode === 'fill-blanks-game' && !fillBlanksFinalized) finalizeFillBlanksGame(); }

    // --- LÓGICA JUEGO EMPAREJAR (Matching) ---
    function checkMatch(p1, p2) { if (!p1 || !p2 || !p1.dataset || !p2.dataset || p1.classList.contains('correct-match') || p2.classList.contains('correct-match') || p1.style.display === 'none' || p2.style.display === 'none') return false; const id1 = p1.dataset.id; const lang1 = p1.dataset.lang; const id2 = p2.dataset.id; const lang2 = p2.dataset.lang; return id1 === id2 && lang1 !== lang2; }
    function applyCorrectMatch(p1, p2) { p1.classList.add('correct-match'); p2.classList.add('correct-match'); setTimeout(() => { p1.style.display = 'none'; p2.style.display = 'none'; score++; if(currentScoreSpan) currentScoreSpan.textContent = score; const remaining = wordArea?.querySelectorAll('.word-pill:not([style*="display: none"])').length ?? 0; if (remaining === 0) { stopTimer(); setTimeout(() => showMatchingResults(true), 300); } }, 160); }
    function applyIncorrectMatchFeedback(p) { if (!p || p.classList.contains('correct-match') || p.style.display === 'none') return; p.classList.add('incorrect-match'); setTimeout(() => { if (p) p.classList.remove('incorrect-match'); }, 500); }
    function renderMatchingWords() { if(!wordArea || !currentScoreSpan || !totalPairsSpan) return; wordArea.innerHTML = ''; const words = []; if (typeof conectoresOriginal !== 'undefined') currentConnectors = shuffleArray([...conectoresOriginal]); else { wordArea.innerHTML = "<p class='error-message'>Error: Conectores no cargados.</p>"; return; } score = 0; currentScoreSpan.textContent = score; totalPairsSpan.textContent = currentConnectors.length; currentConnectors.forEach(p => { words.push({ id: p.id, lang: 'en', text: p.en }); words.push({ id: p.id, lang: 'es', text: p.es }); }); shuffleArray(words).forEach(w => { const el = document.createElement('div'); el.className = `word-pill lang-${w.lang}`; el.textContent = w.text; el.dataset.id = w.id; el.dataset.lang = w.lang; wordArea.appendChild(el); }); if (sortableInstance) sortableInstance.destroy(); if (typeof Sortable !== 'undefined') { sortableInstance = Sortable.create(wordArea, { animation: 150, ghostClass: 'dragging', forceFallback: true, onEnd: (evt) => { const item = evt.item; if (!timerInterval && timeLeft > 0 || resultsOverlay?.classList.contains('hidden') === false) return; const prev = item.previousElementSibling, next = item.nextElementSibling; let match = false, target = null; if (prev && prev.style.display !== 'none' && checkMatch(item, prev)) { match = true; target = prev; } if (!match && next && next.style.display !== 'none' && checkMatch(item, next)) { match = true; target = next; } if (match && target) applyCorrectMatch(item, target); else applyIncorrectMatchFeedback(item); } }); } else console.warn("Sortable no disponible."); }
    function showMatchingResults(won) { stopTimer(); if (sortableInstance) sortableInstance.option('disabled', true); if(!resultsOverlay || !correctPairsList || !giveUpBtn || !restartMatchingBtn) return; correctPairsList.innerHTML = ''; (currentConnectors ?? []).forEach(p => { const d = document.createElement('div'); d.textContent = `${p.en} = ${p.es}`; correctPairsList.appendChild(d); }); let t = "Resultados"; if (won) t = "¡Felicidades!"; else if (timeLeft <= 0) t = "¡Tiempo Agotado!"; else t = "Te has rendido"; const h2 = resultsOverlay.querySelector('h2'); if(h2) h2.textContent = t; resultsOverlay.classList.remove('hidden'); if(giveUpBtn) giveUpBtn.disabled = true; if(restartMatchingBtn) restartMatchingBtn.disabled = false; }
    function initializeMatchingGame() { if(!matchingTimeSelect || !giveUpBtn || !restartMatchingBtn) return; score = 0; renderMatchingWords(); const minutes = parseInt(matchingTimeSelect.value, 10); startTimer(minutes * 60); showScreen('matching-game'); if(giveUpBtn) giveUpBtn.disabled = false; if(restartMatchingBtn) restartMatchingBtn.disabled = true; if(resultsOverlay) resultsOverlay.classList.add('hidden'); if (sortableInstance) sortableInstance.option('disabled', false); }
    function resetMatchingGame() { stopTimer(); if(wordArea) wordArea.innerHTML = ''; score = 0; if(currentScoreSpan) currentScoreSpan.textContent = '0'; if(totalPairsSpan) totalPairsSpan.textContent = '0'; if(matchingTimerSpan) matchingTimerSpan.textContent = '--:--'; if(resultsOverlay) resultsOverlay.classList.add('hidden'); if(giveUpBtn) giveUpBtn.disabled = false; if(restartMatchingBtn) restartMatchingBtn.disabled = false; if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; } }

    // --- LÓGICA JUEGO RELLENAR (Fill Blanks) ---
    function renderFillBlanksTable() { if(!fillBlanksTableBody || !fillBlanksScoreSpan || !fillBlanksIncorrectScoreSpan || !fillBlanksTotalSpan || !translationDirectionSelect) return; fillBlanksTableBody.innerHTML = ''; if (typeof conectoresOriginal !== 'undefined') currentConnectors = shuffleArray([...conectoresOriginal]); else { fillBlanksTableBody.innerHTML = "<tr><td colspan='3' class='error-message'>Error: Conectores no cargados.</td></tr>"; return; } fillBlanksScore = 0; fillBlanksIncorrectScore = 0; fillBlanksScoreSpan.textContent = fillBlanksScore; fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; fillBlanksTotalSpan.textContent = currentConnectors.length; translationDirection = translationDirectionSelect.value; fillBlanksFinalized = false; currentConnectors.forEach((pair, index) => { const row = fillBlanksTableBody.insertRow(); row.dataset.id = pair.id; row.insertCell().textContent = (translationDirection === 'en-es') ? pair.en : pair.es; const inputCell = row.insertCell(); const input = document.createElement('input'); input.type = 'text'; input.placeholder = (translationDirection === 'en-es') ? 'Español...' : 'Inglés...'; input.dataset.id = pair.id; input.dataset.index = index; input.disabled = false; input.addEventListener('blur', handleFillBlanksInputBlur); inputCell.appendChild(input); const feedbackCell = row.insertCell(); feedbackCell.className = 'feedback'; feedbackCell.textContent = '-'; }); }
    function checkAnswer(userInput, correctAnswer) { const normInput = userInput.trim().toLowerCase(); if (!normInput) return false; const correctOpts = (correctAnswer || '').toLowerCase().split(/[,/]/).map(opt => opt.trim()).filter(Boolean); if (correctOpts.length === 0) return false; const normInputNoAcc = normInput.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); const correctOptsNoAcc = correctOpts.map(opt => opt.normalize("NFD").replace(/[\u0300-\u036f]/g, "")); return correctOpts.includes(normInput) || correctOptsNoAcc.includes(normInputNoAcc); }
    function handleFillBlanksInputBlur(event) { if (!fillBlanksFinalized) checkSingleAnswerAndUpdate(event.target); }
    function checkSingleAnswerAndUpdate(inputEl) { const row = inputEl.closest('tr'); if (!row || !fillBlanksScoreSpan || !fillBlanksIncorrectScoreSpan) return; const fbCell = row.cells[2]; const id = row.dataset.id; const pair = conectoresOriginal?.find(p => p.id == id); if (!pair || !fbCell) return; const userAns = inputEl.value; const correctAns = (translationDirection === 'en-es') ? pair.es : pair.en; const isCorr = checkAnswer(userAns, correctAns); const isIncorr = !isCorr && userAns.trim() !== ''; fbCell.classList.remove('correct', 'incorrect'); if (isCorr) { fbCell.textContent = 'Correcto'; fbCell.classList.add('correct'); } else if (isIncorr) { fbCell.textContent = 'Incorrecto'; fbCell.classList.add('incorrect'); } else { fbCell.textContent = '-'; } const totalCorr = fillBlanksTableBody?.querySelectorAll('td.feedback.correct').length ?? 0; const totalIncorr = fillBlanksTableBody?.querySelectorAll('td.feedback.incorrect').length ?? 0; fillBlanksScore = totalCorr; fillBlanksIncorrectScore = totalIncorr; fillBlanksScoreSpan.textContent = fillBlanksScore; fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; }
    function finalizeFillBlanksGame() { if (fillBlanksFinalized) return; fillBlanksFinalized = true; stopTimer(); let finalC = 0, finalI = 0; const rows = fillBlanksTableBody?.querySelectorAll('tr'); if (!rows || rows.length === 0) { if(checkAnswersBtn) checkAnswersBtn.disabled = true; return; } rows.forEach((row) => { const input = row.querySelector('input[type="text"]'); const fbCell = row.cells[2]; const id = row.dataset.id; const pair = conectoresOriginal?.find(p => p.id == id); if (!input || !fbCell || !pair) return; const userAns = input.value; const answer = (translationDirection === 'en-es') ? pair.es : pair.en; const isCorr = checkAnswer(userAns, answer); const isIncorr = !isCorr && userAns.trim() !== ''; input.value = answer; input.disabled = true; fbCell.classList.remove('correct', 'incorrect'); if (isCorr) { fbCell.textContent = 'Correcto'; fbCell.classList.add('correct'); finalC++; } else if (isIncorr) { fbCell.textContent = 'Incorrecto'; fbCell.classList.add('incorrect'); finalI++; } else { fbCell.textContent = '-'; } }); fillBlanksScore = finalC; fillBlanksIncorrectScore = finalI; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = fillBlanksScore; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; if(checkAnswersBtn) checkAnswersBtn.disabled = true; if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); }
    function initializeFillBlanksGame() { if(!fillBlanksTimeSelect || !checkAnswersBtn || !restartFillBlanksBtn) return; fillBlanksScore = 0; fillBlanksIncorrectScore = 0; fillBlanksFinalized = false; renderFillBlanksTable(); const minutes = parseInt(fillBlanksTimeSelect.value, 10); startTimer(minutes * 60); showScreen('fill-blanks-game'); if(checkAnswersBtn) checkAnswersBtn.disabled = false; if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = false; }
    function resetFillBlanksGame() { stopTimer(); if(fillBlanksTableBody) fillBlanksTableBody.innerHTML = ''; fillBlanksScore = 0; fillBlanksIncorrectScore = 0; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = '0'; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = '0'; if(fillBlanksTotalSpan) fillBlanksTotalSpan.textContent = '0'; if(fillBlanksTimerSpan) fillBlanksTimerSpan.textContent = '--:--'; if(checkAnswersBtn) checkAnswersBtn.disabled = true; if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = true; fillBlanksFinalized = false; }

    // --- LÓGICA JUEGO GERUNDIOS/INF (Verb Patterns - ESTRUCTURA CORREGIDA) ---
    function updateVerbPatternScores() { if(verbPatternCorrectSpan) verbPatternCorrectSpan.textContent = verbPatternScore; if(verbPatternIncorrectSpan) verbPatternIncorrectSpan.textContent = verbPatternIncorrectScore; if(verbPatternQCountSpan) verbPatternQCountSpan.textContent = Math.max(0, currentPatternIndex + 1); }
    function stopQuestionTimer() { clearInterval(verbPatternQuestionTimer); verbPatternQuestionTimer = null; }
    function startQuestionTimer() { stopQuestionTimer(); verbPatternQuestionTimeLeft = verbPatternTimePerQuestion; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; userCanAnswer = true; verbPatternAnswerButtons?.forEach(b => b.disabled = false); if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } verbPatternQuestionTimer = setInterval(() => { verbPatternQuestionTimeLeft--; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; if (verbPatternQuestionTimeLeft <= 0) handleQuestionTimeout(); }, 1000); }
    function handleQuestionTimeout() { stopQuestionTimer(); userCanAnswer = false; verbPatternAnswerButtons?.forEach(b => b.disabled = true); verbPatternIncorrectScore++; updateVerbPatternScores(); if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = "¡Tiempo agotado!"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; } const currentPattern = currentVerbPatterns?.[currentPatternIndex]; if(currentPattern) showCorrectAnswerFeedback(currentPattern.category); setTimeout(displayNextVerbPatternQuestion, 2500); }
    function showCorrectAnswerFeedback(correctCategory) { verbPatternAnswerButtons?.forEach(b => { b.style.border = ''; if(b.dataset.answer === correctCategory) b.style.border = '2px solid var(--success-color)'; }); }
    // ***** ESTRUCTURA IF/ELSE CORREGIDA *****
    function handleVerbPatternAnswer(event) {
        if (!userCanAnswer) return;
        stopQuestionTimer();
        userCanAnswer = false;
        verbPatternAnswerButtons?.forEach(b => { b.disabled = true; b.style.border = ''; });
        const selectedButton = event.target;
        const selectedAnswer = selectedButton.dataset.answer;
        const currentPattern = currentVerbPatterns?.[currentPatternIndex];
        if(!currentPattern || !verbPatternFeedbackDiv) return;
        const correctAnswer = currentPattern.category;

        if (selectedAnswer === correctAnswer) {
            verbPatternScore++;
            verbPatternFeedbackDiv.textContent = "¡Correcto!";
            verbPatternFeedbackDiv.className = 'verb-pattern-feedback correct';
            selectedButton.style.border = '2px solid var(--success-color)';
        } else {
            verbPatternIncorrectScore++;
            const categoryMap = { 'gerund': 'Gerundio (-ing)', 'infinitive_to': 'Infinitivo (con TO)', 'infinitive_no_to': 'Infinitivo (sin TO)', 'both': 'Ambos' };
            verbPatternFeedbackDiv.textContent = `Incorrecto. Era: ${categoryMap[correctAnswer] || correctAnswer}`;
            verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect';
            selectedButton.style.border = '2px solid var(--danger-color)';
            showCorrectAnswerFeedback(correctAnswer);
        } // <<<--- AQUÍ TERMINA EL ELSE

        // Estas líneas se ejecutan después del if/else
        updateVerbPatternScores();
        setTimeout(displayNextVerbPatternQuestion, 1800);
    } // <<<--- AQUÍ TERMINA LA FUNCIÓN
    // ***** FIN ESTRUCTURA CORREGIDA *****
    function displayNextVerbPatternQuestion() { currentPatternIndex++; verbPatternAnswerButtons?.forEach(b => { b.disabled = true; b.style.border = ''; }); if (currentPatternIndex < currentVerbPatterns.length) { const p = currentVerbPatterns[currentPatternIndex]; if(verbPatternTermDiv) verbPatternTermDiv.textContent = p.term; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = p.explanation || ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } updateVerbPatternScores(); startQuestionTimer(); } else { if(verbPatternTermDiv) verbPatternTermDiv.textContent = "¡Juego Terminado!"; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = `Resultado: ${verbPatternScore} Aciertos, ${verbPatternIncorrectScore} Errores.`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '-'; verbPatternAnswerButtons?.forEach(b => b.disabled = true); if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Volver a Selección"; } }
    function cleanUpVerbPatternGame() { stopQuestionTimer(); verbPatternScore = 0; verbPatternIncorrectScore = 0; currentPatternIndex = -1; userCanAnswer = false; if(verbPatternTermDiv) verbPatternTermDiv.textContent = '...'; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '--'; if(verbPatternQCountSpan) verbPatternQCountSpan.textContent = '0'; if(verbPatternCorrectSpan) verbPatternCorrectSpan.textContent = '0'; if(verbPatternIncorrectSpan) verbPatternIncorrectSpan.textContent = '0'; verbPatternAnswerButtons?.forEach(b => { b.disabled = true; b.style.border = ''; }); if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Salir del Juego"; }
    function initializeVerbPatternGame() { if(!verbPatternTimeSelect || !verbPatternQTotalSpan || !verbPatternQuitBtn) return; verbPatternTimePerQuestion = parseInt(verbPatternTimeSelect.value, 10); cleanUpVerbPatternGame(); if (typeof verbPatternData !== 'undefined') currentVerbPatterns = shuffleArray([...verbPatternData]); else { console.error("VerbPattern Init: Datos no cargados."); currentVerbPatterns = []; } if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = currentVerbPatterns.length; updateVerbPatternScores(); if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Salir del Juego"; showScreen('verb-pattern-game'); if (currentVerbPatterns.length > 0) displayNextVerbPatternQuestion(); else { if(verbPatternTermDiv) verbPatternTermDiv.textContent = "Error datos"; verbPatternAnswerButtons?.forEach(b => b.disabled = true); } }

    // ===================================
    // --- EVENT LISTENERS GLOBALES ---
    // ===================================
    function addSafeListener(element, eventType, handlerFn, screenId) { if (element) { element.addEventListener(eventType, () => handlerFn(screenId)); /* console.log(`Listener '${eventType}' añadido a #${element.id}`); */ } else console.error(`Botón con ID para pantalla '${screenId}' no encontrado.`); }
    const btnSelectMatching = document.getElementById('select-matching-btn');
    const btnSelectFillBlanks = document.getElementById('select-fill-blanks-btn');
    const btnSelectVerbPattern = document.getElementById('select-verb-pattern-btn');
    const btnSelectVerbsGame = document.getElementById('select-verbs-game-btn');
    const btnSelectTraduccionGame = document.getElementById('select-traduccion-game-btn');
    addSafeListener(btnSelectMatching, 'click', showScreen, 'matching-setup');
    addSafeListener(btnSelectFillBlanks, 'click', showScreen, 'fill-blanks-setup');
    addSafeListener(btnSelectVerbPattern, 'click', showScreen, 'verb-pattern-setup');
    addSafeListener(btnSelectVerbsGame, 'click', showScreen, 'verbs');
    addSafeListener(btnSelectTraduccionGame, 'click', showScreen, 'traduccion');

    if (backToSelectionButtons.length > 0) { backToSelectionButtons.forEach((button, index) => { button.addEventListener('click', () => { const previousMode = currentGameMode; console.log(`Botón 'Volver' [${index}] clickeado desde modo: ${previousMode}`); if (previousMode && previousMode !== 'selection') resetPreviousGame(previousMode); showScreen('selection'); }); }); }
    else console.warn("No se encontraron botones '.back-to-selection'.");

    addSafeListener(startMatchingBtn, 'click', initializeMatchingGame, 'start-matching');
    addSafeListener(startFillBlanksBtn, 'click', initializeFillBlanksGame, 'start-fill-blanks');
    addSafeListener(startVerbPatternBtn, 'click', initializeVerbPatternGame, 'start-verb-pattern');
    if (giveUpBtn) giveUpBtn.addEventListener('click', () => showMatchingResults(false));
    if (playAgainMatchingBtn) playAgainMatchingBtn.addEventListener('click', () => { if(resultsOverlay) resultsOverlay.classList.add('hidden'); showScreen('matching-setup'); });
    if (restartMatchingBtn) restartMatchingBtn.addEventListener('click', () => { if(resultsOverlay) resultsOverlay.classList.add('hidden'); resetMatchingGame(); initializeMatchingGame(); });
    if (checkAnswersBtn) checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    if (restartFillBlanksBtn) restartFillBlanksBtn.addEventListener('click', () => { resetFillBlanksGame(); initializeFillBlanksGame(); });
    if (verbPatternOptionsDiv) { verbPatternOptionsDiv.addEventListener('click', (event) => { if (event.target.classList.contains('answer-button') && !event.target.disabled && userCanAnswer && currentGameMode === 'verb-pattern-game') handleVerbPatternAnswer(event); }); }

    // =============================
    // --- INICIALIZACIÓN GENERAL ---
    // =============================
    showScreen('selection');
    console.log("Script Principal: Inicialización v4 completada.");

}); // Fin DOMContentLoaded
