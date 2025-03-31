// ==========================================================
// js/script.js (PRINCIPAL - REVISADO y CORREGIDO v2)
// Orquesta la selección, visualización e inicialización/reset
// de todos los juegos. Añadidos logs y verificación de listeners.
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Inicializando Script Principal v2...");

    // --- Comprobación Inicial de Datos y Módulos ---
    let dataErrorOriginal = false;
    let moduleError = false;

    // Datos juegos originales
    if (typeof conectoresOriginal === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: 'conectoresOriginal' no definida.");
        dataErrorOriginal = true;
    }
    if (typeof verbPatternData === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: 'verbPatternData' no definida.");
        dataErrorOriginal = true;
    }
    // Librería externa
    if (typeof Sortable === 'undefined') {
        console.warn("SCRIPT PRINCIPAL ADVERTENCIA: Librería 'SortableJS' no encontrada.");
    }
    // Módulos juegos importados
    if (typeof VerbsGame === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: Módulo 'VerbsGame' no encontrado.");
        moduleError = true;
    }
    if (typeof TraduccionGame === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: Módulo 'TraduccionGame' no encontrado.");
        moduleError = true;
    }

    if (dataErrorOriginal || moduleError) {
        alert("Error crítico al cargar datos o módulos de juego. Revisa la consola (F12). Algunos juegos pueden no funcionar.");
    }

    // --- Variables Globales del Orquestador ---
    let currentGameMode = null;
    let timerInterval = null;
    let timeLeft = 0;
    let verbPatternQuestionTimer = null; // Timer específico G/I

    // --- Variables Específicas de Juegos Originales (Simplificado) ---
    // Estas variables ahora deberían ser manejadas principalmente DENTRO de sus respectivas funciones
    // de inicialización/reset, pero las mantenemos aquí para la lógica existente.
    let score = 0; // Puntuación genérica usada por Matching
    let fillBlanksScore = 0; // Puntuación correcta Fill Blanks
    let fillBlanksIncorrectScore = 0;
    let fillBlanksFinalized = false;
    let sortableInstance = null;
    let verbPatternScore = 0; // Puntuación correcta G/I
    let verbPatternIncorrectScore = 0;
    let currentVerbPatterns = []; // Lista G/I
    let currentPatternIndex = -1;
    let verbPatternTimePerQuestion = 15;
    let verbPatternQuestionTimeLeft = 0;
    let userCanAnswer = false; // Estado G/I
    let translationDirection = 'en-es'; // Estado fill-blanks
    let currentConnectors = []; // Lista Conectores

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

    // Colección de todos los contenedores de juego para facilitar ocultarlos
    const allGameContainers = [
        gameSelectionDiv, matchingContainer, fillBlanksContainer,
        verbPatternContainer, verbsGameContainer, traduccionGameContainer
    ];

    // --- Elementos DOM Juegos Originales (Verificar existencia) ---
    // Matching
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
    // Fill Blanks
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
    // Verb Patterns
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

    // --- Función Central de Control de Visibilidad (REVISADA) ---
    function showScreen(screenId) {
        console.log(`Intentando mostrar pantalla: ${screenId}`);
        // 1. Ocultar TODOS los contenedores principales
        allGameContainers.forEach(container => {
            if (container) {
                 container.classList.add('hidden');
            } else {
                // console.warn(`showScreen: Un contenedor es nulo/undefined`); // Debug si falta un contenedor
            }
        });

        // 2. Ocultar sub-secciones específicas (setup/game/overlay)
        [matchingSetupDiv, matchingGameDiv, fillBlanksSetupDiv, fillBlanksGameDiv, verbPatternSetupDiv, verbPatternGameDiv, resultsOverlay].forEach(subSection => {
            if (subSection) subSection.classList.add('hidden');
        });

        // 3. Actualizar modo actual
        currentGameMode = screenId;
        let titleText = "Juegos de Inglés"; // Título por defecto
        let targetContainer = null; // Contenedor a mostrar

        // 4. Determinar qué mostrar y si inicializar
        switch (screenId) {
            case 'selection':
                targetContainer = gameSelectionDiv;
                titleText = "Selección de Juego";
                break;
            // --- Juegos Originales ---
            case 'matching-setup':
                targetContainer = matchingContainer;
                if(matchingSetupDiv) matchingSetupDiv.classList.remove('hidden'); // Mostrar setup
                titleText = "Emparejar Conectores - Config.";
                break;
            case 'matching-game':
                targetContainer = matchingContainer;
                if(matchingGameDiv) matchingGameDiv.classList.remove('hidden'); // Mostrar juego
                titleText = "Emparejar Conectores";
                break;
            case 'fill-blanks-setup':
                targetContainer = fillBlanksContainer;
                if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.remove('hidden');
                titleText = "Rellenar Conectores - Config.";
                break;
            case 'fill-blanks-game':
                targetContainer = fillBlanksContainer;
                if(fillBlanksGameDiv) fillBlanksGameDiv.classList.remove('hidden');
                titleText = "Rellenar Conectores";
                break;
            case 'verb-pattern-setup':
                targetContainer = verbPatternContainer;
                if(verbPatternSetupDiv) verbPatternSetupDiv.classList.remove('hidden');
                titleText = "Gerundios/Infinitivos - Config.";
                break;
            case 'verb-pattern-game':
                targetContainer = verbPatternContainer;
                if(verbPatternGameDiv) verbPatternGameDiv.classList.remove('hidden');
                titleText = "Gerundios/Infinitivos";
                break;
            // --- Juegos Importados ---
            case 'verbs':
                targetContainer = verbsGameContainer;
                titleText = "Práctica de Verbos";
                // Intentar inicializar el módulo VerbsGame SI existe
                if (targetContainer && typeof VerbsGame !== 'undefined' && typeof VerbsGame.init === 'function') {
                    console.log("Llamando a VerbsGame.init()");
                    VerbsGame.init(targetContainer); // Pasar el contenedor
                } else if (!targetContainer) {
                     console.error("showScreen: Contenedor 'verbsGameContainer' no encontrado.");
                } else {
                     console.error("showScreen: Módulo 'VerbsGame' o 'VerbsGame.init' no está disponible.");
                     targetContainer.innerHTML = "<p class='error-message'>Error: No se pudo cargar el juego de Verbos.</p>";
                }
                break;
            case 'traduccion':
                 targetContainer = traduccionGameContainer;
                 titleText = "Práctica de Vocabulario";
                 // Intentar inicializar el módulo TraduccionGame SI existe
                 if (targetContainer && typeof TraduccionGame !== 'undefined' && typeof TraduccionGame.init === 'function') {
                    console.log("Llamando a TraduccionGame.init()");
                    TraduccionGame.init(targetContainer); // Pasar el contenedor
                 } else if (!targetContainer) {
                    console.error("showScreen: Contenedor 'traduccionGameContainer' no encontrado.");
                 } else {
                     console.error("showScreen: Módulo 'TraduccionGame' o 'TraduccionGame.init' no está disponible.");
                     targetContainer.innerHTML = "<p class='error-message'>Error: No se pudo cargar el juego de Vocabulario.</p>";
                 }
                break;
            default:
                 console.warn("showScreen: ID de pantalla desconocido:", screenId);
                 targetContainer = gameSelectionDiv; // Fallback a selección
                 currentGameMode = 'selection';
                 titleText = "Selección de Juego";
        }

        // 5. Mostrar el contenedor determinado (si se encontró)
        if (targetContainer) {
            targetContainer.classList.remove('hidden');
            console.log(`Contenedor ${targetContainer.id || 'gameSelectionDiv'} mostrado.`);
        } else {
            console.error(`showScreen: No se pudo encontrar/mostrar el contenedor para '${screenId}'`);
            if(gameSelectionDiv) gameSelectionDiv.classList.remove('hidden'); // Asegurar que algo se muestre
            currentGameMode = 'selection'; // Forzar modo selección
        }

        // 6. Actualizar título principal
        if(mainTitle) { mainTitle.textContent = titleText; }
    }

     // --- Función para Resetear/Limpiar el Juego Anterior (REVISADA) ---
     function resetPreviousGame(gameModeToReset) {
         console.log(`Intentando resetear juego anterior: ${gameModeToReset}`);

         // Detener SIEMPRE ambos tipos de temporizadores
         stopTimer(); // Timer general (Matching, FillBlanks)
         stopQuestionTimer(); // Timer por pregunta (VerbPatterns)

         switch (gameModeToReset) {
             // --- Juegos Originales ---
             case 'matching-setup': // Incluir setups por si se vuelve desde ahí
             case 'matching-game':
                 resetMatchingGame(); // Llamar a la función de reset específica
                 break;
             case 'fill-blanks-setup':
             case 'fill-blanks-game':
                 resetFillBlanksGame();
                 break;
             case 'verb-pattern-setup':
             case 'verb-pattern-game':
                 cleanUpVerbPatternGame(); // Llamar a la función de limpieza específica
                 break;

             // --- Juegos Importados ---
             case 'verbs':
                 if (typeof VerbsGame !== 'undefined' && typeof VerbsGame.reset === 'function') {
                     console.log("Llamando a VerbsGame.reset()");
                     VerbsGame.reset();
                 } else { console.warn("resetPreviousGame: No se pudo resetear 'VerbsGame'."); }
                 break;
             case 'traduccion':
                 if (typeof TraduccionGame !== 'undefined' && typeof TraduccionGame.reset === 'function') {
                    console.log("Llamando a TraduccionGame.reset()");
                     TraduccionGame.reset();
                 } else { console.warn("resetPreviousGame: No se pudo resetear 'TraduccionGame'."); }
                 break;

             // No hacer nada si se estaba en 'selection'
             case 'selection':
             default:
                 console.log(`resetPreviousGame: No se requiere reset explícito para ${gameModeToReset}`);
                 break;
         }
         console.log(`Reseteo para ${gameModeToReset} completado (si aplica).`);
     }


    // --- Funciones del Temporizador General (Matching, Fill Blanks) ---
    // (Sin cambios, pero asegurando que los spans existan)
    function updateTimerDisplay() { const formattedTime = formatTime(timeLeft); if (currentGameMode === 'matching-game' && matchingTimerSpan) { matchingTimerSpan.textContent = formattedTime; } else if (currentGameMode === 'fill-blanks-game' && fillBlanksTimerSpan) { fillBlanksTimerSpan.textContent = formattedTime; } }
    function startTimer(durationSeconds) { if (timerInterval) clearInterval(timerInterval); timeLeft = durationSeconds; updateTimerDisplay(); timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); if (timeLeft <= 0) { clearInterval(timerInterval); timerInterval = null; handleTimeUp(); } }, 1000); }
    function stopTimer() { clearInterval(timerInterval); timerInterval = null; /* console.log("Timer General Detenido"); */ }
    function handleTimeUp() { console.log("¡Tiempo Agotado! (Timer General)"); if (currentGameMode === 'matching-game') { showMatchingResults(false); } else if (currentGameMode === 'fill-blanks-game' && !fillBlanksFinalized) { finalizeFillBlanksGame(); } }

    // =============================================================
    // --- LÓGICA JUEGO EMPAREJAR (Matching - Código Original REVISADO LIGERAMENTE) ---
    // =============================================================
    function checkMatch(p1, p2) { if (!p1 || !p2 || !p1.dataset || !p2.dataset) return false; if (p1.classList.contains('correct-match') || p2.classList.contains('correct-match') || p1.style.display === 'none' || p2.style.display === 'none') { return false; } const id1 = p1.dataset.id; const lang1 = p1.dataset.lang; const id2 = p2.dataset.id; const lang2 = p2.dataset.lang; return id1 === id2 && lang1 !== lang2; }
    function applyCorrectMatch(p1, p2) { /* console.log("Match:", p1.textContent,"&", p2.textContent); */ p1.classList.add('correct-match'); p2.classList.add('correct-match'); setTimeout(() => { p1.style.display = 'none'; p2.style.display = 'none'; score++; if(currentScoreSpan) currentScoreSpan.textContent = score; const remaining = wordArea?.querySelectorAll('.word-pill:not([style*="display: none"])').length ?? 0; if (remaining === 0) { console.log("All pairs matched!"); stopTimer(); setTimeout(() => showMatchingResults(true), 300); } }, 160); }
    function applyIncorrectMatchFeedback(p) { if (!p || p.classList.contains('correct-match') || p.style.display === 'none') return; p.classList.add('incorrect-match'); setTimeout(() => { if (p) p.classList.remove('incorrect-match'); }, 500); }
    function renderMatchingWords() { if(!wordArea || !currentScoreSpan || !totalPairsSpan) { console.error("RenderMatching: Faltan elementos DOM."); return; } wordArea.innerHTML = ''; const wordsToRender = []; if (typeof conectoresOriginal === 'undefined' || conectoresOriginal.length === 0) { wordArea.innerHTML = "<p class='error-message'>Error: Lista de conectores no disponible.</p>"; return; } currentConnectors = shuffleArray([...conectoresOriginal]); score = 0; currentScoreSpan.textContent = score; totalPairsSpan.textContent = currentConnectors.length; currentConnectors.forEach(pair => { wordsToRender.push({ id: pair.id, lang: 'en', text: pair.en }); wordsToRender.push({ id: pair.id, lang: 'es', text: pair.es }); }); shuffleArray(wordsToRender); wordsToRender.forEach(word => { const pill = document.createElement('div'); pill.classList.add('word-pill', `lang-${word.lang}`); pill.textContent = word.text; pill.dataset.id = word.id; pill.dataset.lang = word.lang; wordArea.appendChild(pill); }); if (sortableInstance) sortableInstance.destroy(); if (typeof Sortable !== 'undefined') { sortableInstance = Sortable.create(wordArea, { animation: 150, ghostClass: 'dragging', forceFallback: true, onEnd: function (evt) { const movedItem = evt.item; if (!timerInterval && timeLeft > 0 || resultsOverlay?.classList.contains('hidden') === false) return; const prevSibling = movedItem.previousElementSibling; const nextSibling = movedItem.nextElementSibling; let matchFound = false, targetPill = null; if (prevSibling && prevSibling.style.display !== 'none' && checkMatch(movedItem, prevSibling)) { matchFound = true; targetPill = prevSibling; } if (!matchFound && nextSibling && nextSibling.style.display !== 'none' && checkMatch(movedItem, nextSibling)) { matchFound = true; targetPill = nextSibling; } if (matchFound && targetPill) applyCorrectMatch(movedItem, targetPill); else applyIncorrectMatchFeedback(movedItem); } }); } else console.warn("Sortable not defined for matching game."); }
    function showMatchingResults(won) { stopTimer(); if (sortableInstance) sortableInstance.option('disabled', true); if(!resultsOverlay || !correctPairsList || !giveUpBtn || !restartMatchingBtn) { console.error("ShowResults Matching: Faltan elementos DOM."); return; } correctPairsList.innerHTML = ''; (conectoresOriginal ?? []).forEach(pair => { const div = document.createElement('div'); div.textContent = `${pair.en} = ${pair.es}`; correctPairsList.appendChild(div); }); let resultTitle = "Resultados"; if (won) resultTitle = "¡Felicidades!"; else if (timeLeft <= 0) resultTitle = "¡Tiempo Agotado!"; else resultTitle = "Te has rendido"; const h2 = resultsOverlay.querySelector('h2'); if(h2) h2.textContent = resultTitle; resultsOverlay.classList.remove('hidden'); giveUpBtn.disabled = true; restartMatchingBtn.disabled = false; }
    function initializeMatchingGame() { console.log("Inicializando Matching Game..."); if(!matchingTimeSelect || !giveUpBtn || !restartMatchingBtn) { console.error("Matching Init: Faltan elementos DOM"); return; } score = 0; renderMatchingWords(); const selectedMinutes = parseInt(matchingTimeSelect.value, 10); startTimer(selectedMinutes * 60); showScreen('matching-game'); // Mostrar pantalla DESPUÉS de preparar giveUpBtn.disabled = false; restartMatchingBtn.disabled = true; if(resultsOverlay) resultsOverlay.classList.add('hidden'); if (sortableInstance) sortableInstance.option('disabled', false); }
    // MODIFICADO: resetMatchingGame solo limpia, no cambia pantalla
    function resetMatchingGame() { console.log("Reseteando Matching Game..."); stopTimer(); if(wordArea) wordArea.innerHTML = ''; score = 0; if(currentScoreSpan) currentScoreSpan.textContent = '0'; if(totalPairsSpan) totalPairsSpan.textContent = '0'; if(matchingTimerSpan) matchingTimerSpan.textContent = '--:--'; if(resultsOverlay) resultsOverlay.classList.add('hidden'); if(giveUpBtn) giveUpBtn.disabled = false; if(restartMatchingBtn) restartMatchingBtn.disabled = false; if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; } }


    // ===============================================================
    // --- LÓGICA JUEGO RELLENAR (Fill Blanks - Código Original REVISADO LIGERAMENTE) ---
    // ===============================================================
    function renderFillBlanksTable() { if(!fillBlanksTableBody || !fillBlanksScoreSpan || !fillBlanksIncorrectScoreSpan || !fillBlanksTotalSpan || !translationDirectionSelect) { console.error("RenderFillBlanks: Faltan elementos DOM."); return; } fillBlanksTableBody.innerHTML = ''; if (typeof conectoresOriginal === 'undefined' || conectoresOriginal.length === 0) { fillBlanksTableBody.innerHTML = "<tr><td colspan='3' class='error-message'>Error: Lista de conectores no disponible.</td></tr>"; return; } currentConnectors = shuffleArray([...conectoresOriginal]); fillBlanksScore = 0; fillBlanksIncorrectScore = 0; fillBlanksScoreSpan.textContent = fillBlanksScore; fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; fillBlanksTotalSpan.textContent = currentConnectors.length; translationDirection = translationDirectionSelect.value; fillBlanksFinalized = false; currentConnectors.forEach((pair, index) => { const row = document.createElement('tr'); row.dataset.id = pair.id; const sourceCell = document.createElement('td'); sourceCell.textContent = (translationDirection === 'en-es') ? pair.en : pair.es; const inputCell = document.createElement('td'); const input = document.createElement('input'); input.type = 'text'; input.placeholder = (translationDirection === 'en-es') ? 'Escribe en Español...' : 'Escribe en Inglés...'; input.dataset.id = pair.id; input.dataset.index = index; input.disabled = false; input.addEventListener('blur', handleFillBlanksInputBlur); inputCell.appendChild(input); const feedbackCell = document.createElement('td'); feedbackCell.className = 'feedback'; feedbackCell.textContent = '-'; row.appendChild(sourceCell); row.appendChild(inputCell); row.appendChild(feedbackCell); fillBlanksTableBody.appendChild(row); }); }
    function checkAnswer(userInput, correctAnswer) { const normalizedInput = userInput.trim().toLowerCase(); if (!normalizedInput) return false; const correctOptions = (correctAnswer || '').toLowerCase().split(/[,/]/).map(opt => opt.trim()).filter(opt => opt.length > 0); if (correctOptions.length === 0) return false; const normalizedInputNoAccents = normalizedInput.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); const correctOptionsNoAccents = correctOptions.map(opt => opt.normalize("NFD").replace(/[\u0300-\u036f]/g, "")); return correctOptions.includes(normalizedInput) || correctOptionsNoAccents.includes(normalizedInputNoAccents); }
    function handleFillBlanksInputBlur(event) { if (fillBlanksFinalized) return; checkSingleAnswerAndUpdate(event.target); }
    function checkSingleAnswerAndUpdate(inputElement) { const row = inputElement.closest('tr'); if (!row || !fillBlanksScoreSpan || !fillBlanksIncorrectScoreSpan) return; const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal?.find(p => p.id == id); if (!connectorPair || !feedbackCell) return; const userAnswer = inputElement.value; const correctAnswer = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrectNow = checkAnswer(userAnswer, correctAnswer); const isIncorrectNow = !isCorrectNow && userAnswer.trim() !== ''; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrectNow) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); } else if (isIncorrectNow) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); } else { feedbackCell.textContent = '-'; } const currentTotalCorrect = fillBlanksTableBody?.querySelectorAll('td.feedback.correct').length ?? 0; const currentTotalIncorrect = fillBlanksTableBody?.querySelectorAll('td.feedback.incorrect').length ?? 0; fillBlanksScore = currentTotalCorrect; fillBlanksIncorrectScore = currentTotalIncorrect; fillBlanksScoreSpan.textContent = fillBlanksScore; fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; }
    function finalizeFillBlanksGame() { if (fillBlanksFinalized) return; fillBlanksFinalized = true; stopTimer(); console.log("--- Finalizando Fill Blanks Game ---"); let finalCorrect = 0, finalIncorrect = 0; const rows = fillBlanksTableBody?.querySelectorAll('tr'); if (!rows || rows.length === 0) { console.warn("Finalize FillBlanks: No hay filas."); if(checkAnswersBtn) checkAnswersBtn.disabled = true; return; } rows.forEach((row) => { const input = row.querySelector('input[type="text"]'); const feedbackCell = row.cells[2]; const id = row.dataset.id; const pair = conectoresOriginal?.find(p => p.id == id); if (!input || !feedbackCell || !pair) return; const userAnswer = input.value; const answer = (translationDirection === 'en-es') ? pair.es : pair.en; const isCorrect = checkAnswer(userAnswer, answer); const isIncorrect = !isCorrect && userAnswer.trim() !== ''; input.value = answer; input.disabled = true; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrect) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); finalCorrect++; } else if (isIncorrect) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); finalIncorrect++; } else { feedbackCell.textContent = '-'; } }); fillBlanksScore = finalCorrect; fillBlanksIncorrectScore = finalIncorrect; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = fillBlanksScore; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; if(checkAnswersBtn) checkAnswersBtn.disabled = true; if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); console.log(`--- Fill Blanks Finalizado: Correct=${fillBlanksScore}, Incorrect=${fillBlanksIncorrectScore} ---`); }
    function initializeFillBlanksGame() { console.log("Inicializando Fill Blanks Game..."); if(!fillBlanksTimeSelect || !checkAnswersBtn || !restartFillBlanksBtn) { console.error("FillBlanks Init: Faltan elementos DOM"); return; } fillBlanksScore = 0; fillBlanksIncorrectScore = 0; fillBlanksFinalized = false; renderFillBlanksTable(); const selectedMinutes = parseInt(fillBlanksTimeSelect.value, 10); startTimer(selectedMinutes * 60); showScreen('fill-blanks-game'); if(checkAnswersBtn) checkAnswersBtn.disabled = false; if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = false; }
    // MODIFICADO: resetFillBlanksGame solo limpia, no cambia pantalla
    function resetFillBlanksGame() { console.log("Reseteando Fill Blanks Game..."); stopTimer(); if(fillBlanksTableBody) fillBlanksTableBody.innerHTML = ''; fillBlanksScore = 0; fillBlanksIncorrectScore = 0; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = '0'; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = '0'; if(fillBlanksTotalSpan) fillBlanksTotalSpan.textContent = '0'; if(fillBlanksTimerSpan) fillBlanksTimerSpan.textContent = '--:--'; if(checkAnswersBtn) checkAnswersBtn.disabled = true; if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = true; fillBlanksFinalized = false; }


    // ======================================================================
    // --- LÓGICA JUEGO GERUNDIOS/INF (Verb Patterns - Código Original REVISADO LIGERAMENTE) ---
    // ======================================================================
    function updateVerbPatternScores() { if(verbPatternCorrectSpan) verbPatternCorrectSpan.textContent = verbPatternScore; if(verbPatternIncorrectSpan) verbPatternIncorrectSpan.textContent = verbPatternIncorrectScore; if(verbPatternQCountSpan) verbPatternQCountSpan.textContent = Math.max(0, currentPatternIndex + 1); }
    function stopQuestionTimer() { clearInterval(verbPatternQuestionTimer); verbPatternQuestionTimer = null; }
    function startQuestionTimer() { stopQuestionTimer(); verbPatternQuestionTimeLeft = verbPatternTimePerQuestion; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; userCanAnswer = true; verbPatternAnswerButtons?.forEach(button => button.disabled = false); if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } verbPatternQuestionTimer = setInterval(() => { verbPatternQuestionTimeLeft--; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; if (verbPatternQuestionTimeLeft <= 0) handleQuestionTimeout(); }, 1000); }
    function handleQuestionTimeout() { console.log("Question Timeout!"); stopQuestionTimer(); userCanAnswer = false; verbPatternAnswerButtons?.forEach(button => button.disabled = true); verbPatternIncorrectScore++; updateVerbPatternScores(); if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = "¡Tiempo agotado!"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; } const currentPattern = currentVerbPatterns?.[currentPatternIndex]; if(currentPattern) showCorrectAnswerFeedback(currentPattern.category); setTimeout(displayNextVerbPatternQuestion, 2500); }
    function showCorrectAnswerFeedback(correctCategory) { verbPatternAnswerButtons?.forEach(button => { button.style.border = ''; if(button.dataset.answer === correctCategory) button.style.border = '2px solid var(--success-color)'; }); } // Usar variable CSS
    function handleVerbPatternAnswer(event) { if (!userCanAnswer) return; stopQuestionTimer(); userCanAnswer = false; verbPatternAnswerButtons?.forEach(button => { button.disabled = true; button.style.border = ''; }); const selectedButton = event.target; const selectedAnswer = selectedButton.dataset.answer; const currentPattern = currentVerbPatterns?.[currentPatternIndex]; if(!currentPattern || !verbPatternFeedbackDiv) return; const correctAnswer = currentPattern.category; if (selectedAnswer === correctAnswer) { verbPatternScore++; verbPatternFeedbackDiv.textContent = "¡Correcto!"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback correct'; selectedButton.style.border = '2px solid var(--success-color)'; } else { verbPatternIncorrectScore++; const categoryMap = { 'gerund': 'Gerundio (-ing)', 'infinitive_to': 'Infinitivo (con TO)', 'infinitive_no_to': 'Infinitivo (sin TO)', 'both': 'Ambos' }; verbPatternFeedbackDiv.textContent = `Incorrecto. Era: ${categoryMap[correctAnswer] || correctAnswer}`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; selectedButton.style.border = '2px solid var(--danger-color)'; showCorrectAnswerFeedback(correctAnswer); } updateVerbPatternScores(); setTimeout(displayNextVerbPatternQuestion, 1800); }
    function displayNextVerbPatternQuestion() { currentPatternIndex++; verbPatternAnswerButtons?.forEach(button => { button.disabled = true; button.style.border = ''; }); if (currentPatternIndex < currentVerbPatterns.length) { const pattern = currentVerbPatterns[currentPatternIndex]; if(verbPatternTermDiv) verbPatternTermDiv.textContent = pattern.term; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = pattern.explanation || ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } updateVerbPatternScores(); startQuestionTimer(); } else { console.log("Juego G/I terminado!"); if(verbPatternTermDiv) verbPatternTermDiv.textContent = "¡Juego Terminado!"; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = `Resultado Final: ${verbPatternScore} Aciertos, ${verbPatternIncorrectScore} Errores.`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '-'; verbPatternAnswerButtons?.forEach(button => button.disabled = true); if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Volver a Selección"; } }
    // MODIFICADO: cleanUpVerbPatternGame SÓLO limpia el estado y UI del juego
    function cleanUpVerbPatternGame() { console.log("Limpiando estado Verb Pattern Game..."); stopQuestionTimer(); verbPatternScore = 0; verbPatternIncorrectScore = 0; currentPatternIndex = -1; userCanAnswer = false; if(verbPatternTermDiv) verbPatternTermDiv.textContent = '...'; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '--'; if(verbPatternQCountSpan) verbPatternQCountSpan.textContent = '0'; // Resetear contadores
     if(verbPatternCorrectSpan) verbPatternCorrectSpan.textContent = '0'; if(verbPatternIncorrectSpan) verbPatternIncorrectSpan.textContent = '0'; verbPatternAnswerButtons?.forEach(button => { button.disabled = true; button.style.border = ''; }); if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Salir del Juego"; }
    function initializeVerbPatternGame() { console.log("Inicializando Verb Pattern Game..."); if(!verbPatternTimeSelect || !verbPatternQTotalSpan || !verbPatternQuitBtn) { console.error("VerbPattern Init: Faltan elementos DOM"); return; } verbPatternTimePerQuestion = parseInt(verbPatternTimeSelect.value, 10); cleanUpVerbPatternGame(); // Limpiar estado ANTES de empezar if (typeof verbPatternData !== 'undefined' && verbPatternData.length > 0) { currentVerbPatterns = shuffleArray([...verbPatternData]); if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = currentVerbPatterns.length; } else { console.error("VerbPattern Init: No se pudieron cargar los datos."); if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = '0'; currentVerbPatterns = []; } updateVerbPatternScores(); if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Salir del Juego"; showScreen('verb-pattern-game'); if (currentVerbPatterns.length > 0) displayNextVerbPatternQuestion(); else { if(verbPatternTermDiv) verbPatternTermDiv.textContent = "Error al cargar datos"; verbPatternAnswerButtons?.forEach(button => button.disabled = true); } }


    // ===================================
    // --- EVENT LISTENERS GLOBALES ---
    // ===================================

    // --- Botones de Selección de Juego ---
    // Se usan IDs específicos para cada botón
    const btnSelectMatching = document.getElementById('select-matching-btn');
    const btnSelectFillBlanks = document.getElementById('select-fill-blanks-btn');
    const btnSelectVerbPattern = document.getElementById('select-verb-pattern-btn');
    const btnSelectVerbsGame = document.getElementById('select-verbs-game-btn');
    const btnSelectTraduccionGame = document.getElementById('select-traduccion-game-btn');

    // Añadir listeners verificando que el botón existe
    if (btnSelectMatching) { btnSelectMatching.addEventListener('click', () => showScreen('matching-setup')); console.log("Listener añadido a btnSelectMatching"); }
    else { console.error("Botón 'select-matching-btn' no encontrado."); }

    if (btnSelectFillBlanks) { btnSelectFillBlanks.addEventListener('click', () => showScreen('fill-blanks-setup')); console.log("Listener añadido a btnSelectFillBlanks"); }
    else { console.error("Botón 'select-fill-blanks-btn' no encontrado."); }

    if (btnSelectVerbPattern) { btnSelectVerbPattern.addEventListener('click', () => showScreen('verb-pattern-setup')); console.log("Listener añadido a btnSelectVerbPattern"); }
    else { console.error("Botón 'select-verb-pattern-btn' no encontrado."); }

    if (btnSelectVerbsGame) { btnSelectVerbsGame.addEventListener('click', () => showScreen('verbs')); console.log("Listener añadido a btnSelectVerbsGame"); }
    else { console.error("Botón 'select-verbs-game-btn' no encontrado."); }

    if (btnSelectTraduccionGame) { btnSelectTraduccionGame.addEventListener('click', () => showScreen('traduccion')); console.log("Listener añadido a btnSelectTraduccionGame"); }
    else { console.error("Botón 'select-traduccion-game-btn' no encontrado."); }


    // --- Botones "Volver a Selección" (Todos los botones con esta clase) ---
    if (backToSelectionButtons.length > 0) {
        console.log(`Encontrados ${backToSelectionButtons.length} botones '.back-to-selection'. Añadiendo listeners...`);
        backToSelectionButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const previousMode = currentGameMode; // Guardar modo antes de cambiar
                console.log(`Botón 'Volver' [${index}] clickeado desde modo: ${previousMode}`);
                if (previousMode && previousMode !== 'selection') {
                     resetPreviousGame(previousMode); // Resetear el juego anterior
                } else {
                    console.log("'Volver' clickeado desde 'selection' o modo desconocido, no se resetea nada.");
                }
                showScreen('selection'); // Mostrar pantalla de selección
            });
        });
    } else {
        console.warn("No se encontraron botones con la clase '.back-to-selection'.");
    }

    // --- Listeners Botones "Start" (Juegos Originales) ---
    // Verificar si los botones existen antes de añadir listener
    if (startMatchingBtn) startMatchingBtn.addEventListener('click', initializeMatchingGame);
    else console.error("Botón 'start-matching-btn' no encontrado.");

    if (startFillBlanksBtn) startFillBlanksBtn.addEventListener('click', initializeFillBlanksGame);
    else console.error("Botón 'start-fill-blanks-btn' no encontrado.");

    if (startVerbPatternBtn) startVerbPatternBtn.addEventListener('click', initializeVerbPatternGame);
    else console.error("Botón 'start-verb-pattern-btn' no encontrado.");


    // --- Listeners Acciones Dentro de Juegos Originales ---
    // (Verificar existencia de elementos)
    // Matching
    if (giveUpBtn) giveUpBtn.addEventListener('click', () => showMatchingResults(false));
    if (playAgainMatchingBtn) playAgainMatchingBtn.addEventListener('click', () => {
        if(resultsOverlay) resultsOverlay.classList.add('hidden');
        showScreen('matching-setup'); // Volver a config
    });
    if (restartMatchingBtn) restartMatchingBtn.addEventListener('click', () => {
        if(resultsOverlay) resultsOverlay.classList.add('hidden');
        resetMatchingGame(); // Resetear sin ir a setup
        initializeMatchingGame(); // Iniciar de nuevo
    });
    // Fill Blanks
    if (checkAnswersBtn) checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    if (restartFillBlanksBtn) restartFillBlanksBtn.addEventListener('click', () => {
         resetFillBlanksGame();
         initializeFillBlanksGame();
    });
    // Verb Patterns (Listener para botones de respuesta)
    if (verbPatternOptionsDiv) {
        verbPatternOptionsDiv.addEventListener('click', (event) => {
            if (event.target.classList.contains('answer-button') && !event.target.disabled && userCanAnswer && currentGameMode === 'verb-pattern-game') {
                handleVerbPatternAnswer(event);
            }
        });
    } else {
        console.warn("Contenedor 'verb-pattern-options' no encontrado, listener de respuesta no añadido.");
    }
    // El botón "Salir" (#verb-pattern-quit-btn) usa la clase .back-to-selection, manejado arriba.


    // =============================
    // --- INICIALIZACIÓN GENERAL ---
    // =============================
    showScreen('selection'); // Empezar mostrando la pantalla de selección
    console.log("Script Principal: Inicialización completada y pantalla de selección mostrada.");

}); // Fin DOMContentLoaded
