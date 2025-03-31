// ==========================================================
// js/script.js (PRINCIPAL - INTEGRADO CON 5 JUEGOS)
// Orquesta la selección, visualización e inicialización/reset
// de todos los juegos.
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Inicializando Script Principal...");

    // --- Comprobación Inicial de Datos (Juegos Originales + Sortable) ---
    let dataErrorOriginal = false;
    if (typeof conectoresOriginal === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: 'conectoresOriginal' no definida (falta connectors.js o variable errónea).");
        dataErrorOriginal = true;
    }
    if (typeof verbPatternData === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: 'verbPatternData' no definida (falta verbPatterns.js o variable errónea).");
        dataErrorOriginal = true;
    }
    // Los datos de Verbs y Traduccion se comprueban internamente en sus módulos
    if (typeof Sortable === 'undefined') {
        console.warn("SCRIPT PRINCIPAL ADVERTENCIA: Librería 'SortableJS' no encontrada. El juego de emparejar no funcionará correctamente.");
        // No bloqueamos, pero el juego afectado no irá.
    }
    if (dataErrorOriginal) {
        alert("Error crítico al cargar datos para los juegos de Conectores o Patrones Verbales. Revisa la consola (F12). Algunos juegos pueden no funcionar.");
        // Podríamos deshabilitar botones aquí si fuera necesario
    }
    // Comprobar si los módulos de juegos importados existen (esto indica si sus scripts se cargaron)
     if (typeof VerbsGame === 'undefined') {
          console.error("SCRIPT PRINCIPAL ERROR: Módulo 'VerbsGame' no encontrado (falta script_verbs.js o hubo un error).");
          // Podríamos deshabilitar el botón 'select-verbs-game-btn'
     }
      if (typeof TraduccionGame === 'undefined') {
          console.error("SCRIPT PRINCIPAL ERROR: Módulo 'TraduccionGame' no encontrado (falta script_traduccion.js o hubo un error).");
           // Podríamos deshabilitar el botón 'select-traduccion-game-btn'
     }

    // --- Variables Globales del Orquestador ---
    let currentGameMode = null; // 'selection', 'matching', 'fill-blanks', 'verb-pattern', 'verbs', 'traduccion', o estados intermedios como 'matching-setup'
    let timerInterval = null; // Timer general (usado por matching, fill-blanks)
    let timeLeft = 0; // Tiempo restante para el timer general

    // --- Variables Específicas de Juegos Originales (Mantenidas aquí por simplicidad) ---
    // (Idealmente, también estarían en módulos, pero se mantienen para compatibilidad)
    let currentConnectors = []; // Para matching y fill-blanks
    let score = 0; // Puntuación (cada juego debería gestionar la suya, pero se usa en originales)
    let fillBlanksIncorrectScore = 0; // Específica fill-blanks
    let fillBlanksFinalized = false; // Específica fill-blanks
    let sortableInstance = null; // Específica matching
    // --- Variables verb-pattern ---
    let currentVerbPatterns = [];
    let currentPatternIndex = -1;
    let verbPatternTimePerQuestion = 15;
    let verbPatternQuestionTimer = null; // Timer específico por pregunta
    let verbPatternQuestionTimeLeft = 0;
    let verbPatternIncorrectScore = 0; // Score errores G/I
    let verbPatternScore = 0; // Score aciertos G/I (Renombrado desde 'score' para evitar colisión)
    let userCanAnswer = false; // Estado G/I
    let translationDirection = 'en-es'; // Estado fill-blanks


    // --- Elementos del DOM Comunes ---
    const mainTitle = document.getElementById('main-title');
    const gameSelectionDiv = document.getElementById('game-selection');
    const backToSelectionButtons = document.querySelectorAll('.back-to-selection');

    // --- Contenedores Principales de Juegos ---
    const matchingContainer = document.getElementById('matching-container');
    const fillBlanksContainer = document.getElementById('fill-blanks-container');
    const verbPatternContainer = document.getElementById('verb-pattern-container');
    const verbsGameContainer = document.getElementById('verbs-game-container');       // Contenedor Juego Verbos
    const traduccionGameContainer = document.getElementById('traduccion-game-container'); // Contenedor Juego Traducción

    // --- Elementos DOM Juego Emparejar (Matching) ---
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

    // --- Elementos DOM Juego Gerundios/Infinitivos ---
    const verbPatternSetupDiv = document.getElementById('verb-pattern-setup');
    const verbPatternGameDiv = document.getElementById('verb-pattern-game');
    const verbPatternTimeSelect = document.getElementById('verb-pattern-time-select');
    const startVerbPatternBtn = document.getElementById('start-verb-pattern-btn');
    const verbPatternTermDiv = document.getElementById('verb-pattern-term');
    const verbPatternExplanationDiv = document.getElementById('verb-pattern-explanation');
    const verbPatternQTimerSpan = document.getElementById('verb-pattern-q-time-left');
    const verbPatternCorrectSpan = document.getElementById('verb-pattern-correct'); // Aciertos G/I
    const verbPatternIncorrectSpan = document.getElementById('verb-pattern-incorrect'); // Errores G/I
    const verbPatternQCountSpan = document.getElementById('verb-pattern-q-count');
    const verbPatternQTotalSpan = document.getElementById('verb-pattern-q-total');
    const verbPatternOptionsDiv = document.getElementById('verb-pattern-options');
    const verbPatternFeedbackDiv = document.getElementById('verb-pattern-feedback');
    const verbPatternQuitBtn = document.getElementById('verb-pattern-quit-btn');
    const verbPatternAnswerButtons = verbPatternOptionsDiv?.querySelectorAll('.answer-button'); // Añadir '?' por si optionsDiv no existe


    // --- Funciones de Utilidad ---
    /** Baraja un array in-place (Fisher-Yates) */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    /** Formatea segundos a MM:SS */
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // --- Función Central de Control de Visibilidad ---
    /**
     * Muestra la pantalla/juego solicitado, ocultando los demás.
     * Inicializa los juegos importados cuando se muestran.
     * @param {string} screen - Identificador de la pantalla a mostrar ('selection', 'matching-setup', 'verbs', 'traduccion', etc.)
     */
    function showScreen(screen) {
        console.log(`Mostrando pantalla: ${screen}`);
        // 1. Ocultar TODOS los contenedores principales de juego/selección
        [gameSelectionDiv, matchingContainer, fillBlanksContainer, verbPatternContainer, verbsGameContainer, traduccionGameContainer].forEach(container => {
            if (container) container.classList.add('hidden');
        });

        // 2. Ocultar sub-secciones (setup/game) de juegos originales (por si acaso)
        [matchingSetupDiv, matchingGameDiv, fillBlanksSetupDiv, fillBlanksGameDiv, verbPatternSetupDiv, verbPatternGameDiv, resultsOverlay].forEach(subSection => {
            if (subSection) subSection.classList.add('hidden');
        });

        // 3. Actualizar modo actual ANTES de inicializar (importante para reset)
        currentGameMode = screen;

        let titleText = "Juegos de Inglés"; // Título por defecto

        // 4. Mostrar contenedor y sección/juego correcto + Inicializar si es necesario
        switch (screen) {
            case 'selection':
                if(gameSelectionDiv) gameSelectionDiv.classList.remove('hidden');
                titleText = "Selección de Juego";
                break;

            // --- Juegos Originales (Muestran Setup o Juego) ---
            case 'matching-setup':
                if(matchingContainer) matchingContainer.classList.remove('hidden');
                if(matchingSetupDiv) matchingSetupDiv.classList.remove('hidden');
                titleText = "Emparejar Conectores - Config.";
                break;
            case 'matching-game':
                if(matchingContainer) matchingContainer.classList.remove('hidden');
                if(matchingGameDiv) matchingGameDiv.classList.remove('hidden');
                titleText = "Emparejar Conectores";
                // La inicialización real ocurre en initializeMatchingGame() al pulsar 'Start'
                break;
            case 'fill-blanks-setup':
                if(fillBlanksContainer) fillBlanksContainer.classList.remove('hidden');
                if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.remove('hidden');
                titleText = "Rellenar Conectores - Config.";
                break;
            case 'fill-blanks-game':
                if(fillBlanksContainer) fillBlanksContainer.classList.remove('hidden');
                if(fillBlanksGameDiv) fillBlanksGameDiv.classList.remove('hidden');
                titleText = "Rellenar Conectores";
                // La inicialización real ocurre en initializeFillBlanksGame() al pulsar 'Start'
                break;
            case 'verb-pattern-setup':
                if(verbPatternContainer) verbPatternContainer.classList.remove('hidden');
                if(verbPatternSetupDiv) verbPatternSetupDiv.classList.remove('hidden');
                titleText = "Gerundios/Infinitivos - Config.";
                break;
            case 'verb-pattern-game':
                if(verbPatternContainer) verbPatternContainer.classList.remove('hidden');
                if(verbPatternGameDiv) verbPatternGameDiv.classList.remove('hidden');
                titleText = "Gerundios/Infinitivos";
                // La inicialización real ocurre en initializeVerbPatternGame() al pulsar 'Start'
                break;

            // --- Juegos Importados (Mostrar Contenedor e Inicializar) ---
            case 'verbs':
                if (verbsGameContainer) {
                    verbsGameContainer.classList.remove('hidden');
                    titleText = "Práctica de Verbos";
                    // Intentar inicializar el módulo VerbsGame
                    if (typeof VerbsGame !== 'undefined' && typeof VerbsGame.init === 'function') {
                        VerbsGame.init(verbsGameContainer); // Pasar el contenedor
                    } else {
                         console.error("showScreen: Módulo 'VerbsGame' o 'VerbsGame.init' no está disponible.");
                         verbsGameContainer.innerHTML = "<p class='error-message'>Error: No se pudo cargar el juego de Verbos.</p>";
                    }
                } else { console.error("showScreen: Contenedor '#verbs-game-container' no encontrado."); }
                break;
            case 'traduccion':
                 if (traduccionGameContainer) {
                    traduccionGameContainer.classList.remove('hidden');
                    titleText = "Práctica de Vocabulario";
                    // Intentar inicializar el módulo TraduccionGame
                     if (typeof TraduccionGame !== 'undefined' && typeof TraduccionGame.init === 'function') {
                        TraduccionGame.init(traduccionGameContainer); // Pasar el contenedor
                    } else {
                         console.error("showScreen: Módulo 'TraduccionGame' o 'TraduccionGame.init' no está disponible.");
                         traduccionGameContainer.innerHTML = "<p class='error-message'>Error: No se pudo cargar el juego de Vocabulario.</p>";
                    }
                } else { console.error("showScreen: Contenedor '#traduccion-game-container' no encontrado."); }
                break;

            default:
                 console.warn("showScreen: Pantalla desconocida solicitada:", screen);
                 if(gameSelectionDiv) gameSelectionDiv.classList.remove('hidden'); // Volver a selección
                 currentGameMode = 'selection';
                 titleText = "Selección de Juego";
        }

        // 5. Actualizar título principal de la página
        if(mainTitle) { mainTitle.textContent = titleText; }

        // 6. Scroll al inicio (opcional, útil si los juegos son largos)
        // window.scrollTo({ top: 0, behavior: 'smooth' });
    }

     // --- Función para Resetear/Limpiar el Juego Anterior ---
     /**
      * Llama a la función de reset apropiada para el juego que se está abandonando.
      * También detiene los temporizadores activos.
      * @param {string} gameModeToReset - El valor de `currentGameMode` ANTES de cambiar a 'selection'.
      */
     function resetPreviousGame(gameModeToReset) {
         console.log(`Reseteando juego anterior: ${gameModeToReset}`);

         // Detener SIEMPRE ambos tipos de temporizadores al salir de CUALQUIER juego
         stopTimer(); // Detiene timer general (Matching, FillBlanks)
         stopQuestionTimer(); // Detiene timer por pregunta (VerbPatterns)

         switch (gameModeToReset) {
             // --- Juegos Originales ---
             case 'matching-setup': // Si se vuelve desde setup
             case 'matching':       // Alias posible
             case 'matching-game':
                 resetMatchingGame(true); // El 'true' es menos relevante aquí, lo importante es limpiar
                 break;
             case 'fill-blanks-setup':
             case 'fill-blanks':
             case 'fill-blanks-game':
                 resetFillBlanksGame(true);
                 break;
             case 'verb-pattern-setup':
             case 'verb-pattern':
             case 'verb-pattern-game':
                 // quitVerbPatternGame() ya hace la limpieza necesaria y *podría* llamar a showScreen('selection')
                 // Es mejor quitar esa llamada de quitVerbPatternGame y solo hacer limpieza
                 // Modifiquemos quitVerbPatternGame para que SOLO limpie
                 cleanUpVerbPatternGame(); // Nueva función solo de limpieza
                 break;

             // --- Juegos Importados ---
             case 'verbs':
                 if (typeof VerbsGame !== 'undefined' && typeof VerbsGame.reset === 'function') {
                     VerbsGame.reset();
                 } else { console.warn("resetPreviousGame: No se pudo resetear 'VerbsGame'."); }
                 break;
             case 'traduccion':
                 if (typeof TraduccionGame !== 'undefined' && typeof TraduccionGame.reset === 'function') {
                     TraduccionGame.reset();
                 } else { console.warn("resetPreviousGame: No se pudo resetear 'TraduccionGame'."); }
                 break;

             // No hacer nada si se estaba en 'selection' u otro estado inválido
             case 'selection':
             default:
                 console.log("resetPreviousGame: No se requiere reset para", gameModeToReset);
                 break;
         }
         // Asegurarse que el modo actual se limpia si no vamos a 'selection' (aunque ahora siempre vamos)
         // currentGameMode = null; // Se setea en showScreen
     }


    // --- Funciones del Temporizador General (Matching, Fill Blanks) ---
    function updateTimerDisplay() {
        const formattedTime = formatTime(timeLeft);
        // Actualizar el span del timer del juego ACTIVO que usa este timer
        if (currentGameMode === 'matching-game' && matchingTimerSpan) {
             matchingTimerSpan.textContent = formattedTime;
        } else if (currentGameMode === 'fill-blanks-game' && fillBlanksTimerSpan) {
             fillBlanksTimerSpan.textContent = formattedTime;
        }
    }
    function startTimer(durationSeconds) {
        if (timerInterval) clearInterval(timerInterval); // Limpiar anterior si existe
        timeLeft = durationSeconds;
        updateTimerDisplay(); // Mostrar tiempo inicial
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                handleTimeUp(); // Manejar fin de tiempo
            }
        }, 1000);
    }
    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        console.log("Timer General Detenido");
    }
    function handleTimeUp() {
        console.log("¡Tiempo Agotado! (Timer General)");
        if (currentGameMode === 'matching-game') {
            showMatchingResults(false); // Mostrar resultados matching (no ganó)
        } else if (currentGameMode === 'fill-blanks-game') {
            if (!fillBlanksFinalized) {
                finalizeFillBlanksGame(); // Finalizar y comprobar fill blanks
            }
        }
    }

    // =============================================================
    // --- LÓGICA JUEGO EMPAREJAR (Matching - Código Original) ---
    // (Se asume que funciona correctamente y usa las variables globales definidas arriba)
    // =============================================================
    function checkMatch(p1, p2) { if (!p1 || !p2 || !p1.dataset || !p2.dataset) return false; if (p1.classList.contains('correct-match') || p2.classList.contains('correct-match') || p1.style.display === 'none' || p2.style.display === 'none') { return false; } const id1 = p1.dataset.id; const lang1 = p1.dataset.lang; const id2 = p2.dataset.id; const lang2 = p2.dataset.lang; return id1 === id2 && lang1 !== lang2; }
    function applyCorrectMatch(p1, p2) { console.log("Match:", p1.textContent,"&", p2.textContent); p1.classList.add('correct-match'); p2.classList.add('correct-match'); setTimeout(() => { p1.style.display = 'none'; p2.style.display = 'none'; score++; if(currentScoreSpan) currentScoreSpan.textContent = score; const remaining = wordArea?.querySelectorAll('.word-pill:not([style*="display: none"])').length ?? 0; if (remaining === 0) { console.log("All pairs matched!"); stopTimer(); setTimeout(() => showMatchingResults(true), 300); } }, 160); }
    function applyIncorrectMatchFeedback(p) { if (!p || p.classList.contains('correct-match') || p.style.display === 'none') return; p.classList.add('incorrect-match'); setTimeout(() => { if (p) { p.classList.remove('incorrect-match'); } }, 500); }
    function renderMatchingWords() { if(!wordArea || !currentScoreSpan || !totalPairsSpan) return; wordArea.innerHTML = ''; const wordsToRender = []; if (typeof conectoresOriginal === 'undefined') { wordArea.innerHTML = "<p class='error-message'>Error: Lista de conectores no disponible.</p>"; return; } currentConnectors = shuffleArray([...conectoresOriginal]); score = 0; currentScoreSpan.textContent = score; totalPairsSpan.textContent = currentConnectors.length; currentConnectors.forEach(pair => { wordsToRender.push({ id: pair.id, lang: 'en', text: pair.en }); wordsToRender.push({ id: pair.id, lang: 'es', text: pair.es }); }); shuffleArray(wordsToRender); wordsToRender.forEach(word => { const pill = document.createElement('div'); pill.classList.add('word-pill', `lang-${word.lang}`); pill.textContent = word.text; pill.dataset.id = word.id; pill.dataset.lang = word.lang; wordArea.appendChild(pill); }); if (sortableInstance) { sortableInstance.destroy(); } if (typeof Sortable !== 'undefined') { sortableInstance = Sortable.create(wordArea, { animation: 150, ghostClass: 'dragging', forceFallback: true, onEnd: function (evt) { const movedItem = evt.item; if (!timerInterval && timeLeft > 0 || resultsOverlay?.classList.contains('hidden') === false) { return; } const prevSibling = movedItem.previousElementSibling; const nextSibling = movedItem.nextElementSibling; let matchFound = false; let targetPill = null; if (prevSibling && prevSibling.style.display !== 'none' && checkMatch(movedItem, prevSibling)) { matchFound = true; targetPill = prevSibling; } if (!matchFound && nextSibling && nextSibling.style.display !== 'none' && checkMatch(movedItem, nextSibling)) { matchFound = true; targetPill = nextSibling; } if (matchFound && targetPill) { applyCorrectMatch(movedItem, targetPill); } else { applyIncorrectMatchFeedback(movedItem); } } }); } else { console.warn("Sortable not defined for matching game."); } }
    function showMatchingResults(won) { stopTimer(); if (sortableInstance) { sortableInstance.option('disabled', true); } if(!resultsOverlay || !correctPairsList || !giveUpBtn || !restartMatchingBtn) return; correctPairsList.innerHTML = ''; (conectoresOriginal ?? []).forEach(pair => { const div = document.createElement('div'); div.textContent = `${pair.en} = ${pair.es}`; correctPairsList.appendChild(div); }); let resultTitle = "Resultados"; if (won) resultTitle = "¡Felicidades!"; else if (timeLeft <= 0) resultTitle = "¡Tiempo Agotado!"; else resultTitle = "Te has rendido"; const h2 = resultsOverlay.querySelector('h2'); if(h2) h2.textContent = resultTitle; resultsOverlay.classList.remove('hidden'); giveUpBtn.disabled = true; restartMatchingBtn.disabled = false; }
    function initializeMatchingGame() { console.log("Inicializando Matching Game..."); score = 0; // Resetear score específico matching if(!matchingTimeSelect || !giveUpBtn || !restartMatchingBtn) { console.error("Matching Init: Faltan elementos DOM"); return; } renderMatchingWords(); const selectedMinutes = parseInt(matchingTimeSelect.value, 10); startTimer(selectedMinutes * 60); showScreen('matching-game'); // Mostrar pantalla del juego giveUpBtn.disabled = false; restartMatchingBtn.disabled = true; if(resultsOverlay) resultsOverlay.classList.add('hidden'); if (sortableInstance) { sortableInstance.option('disabled', false); } }
    function resetMatchingGame(goToSetup = false) { console.log("Reseteando Matching Game..."); stopTimer(); if(wordArea) wordArea.innerHTML = ''; score = 0; if(currentScoreSpan) currentScoreSpan.textContent = '0'; if(totalPairsSpan) totalPairsSpan.textContent = '0'; if(matchingTimerSpan) matchingTimerSpan.textContent = '--:--'; if(resultsOverlay) resultsOverlay.classList.add('hidden'); if(giveUpBtn) giveUpBtn.disabled = false; // Re-habilitar por si acaso if(restartMatchingBtn) restartMatchingBtn.disabled = false; if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; } // No ir a setup aquí, se maneja en el listener de 'Volver' o 'Jugar de Nuevo'
     }


    // ===============================================================
    // --- LÓGICA JUEGO RELLENAR (Fill Blanks - Código Original) ---
    // (Se asume que funciona correctamente y usa las variables globales definidas arriba)
    // ===============================================================
    function renderFillBlanksTable() { if(!fillBlanksTableBody || !fillBlanksScoreSpan || !fillBlanksIncorrectScoreSpan || !fillBlanksTotalSpan || !translationDirectionSelect) return; fillBlanksTableBody.innerHTML = ''; if (typeof conectoresOriginal === 'undefined') { fillBlanksTableBody.innerHTML = "<tr><td colspan='3' class='error-message'>Error: Lista de conectores no disponible.</td></tr>"; return; } currentConnectors = shuffleArray([...conectoresOriginal]); score = 0; // Resetear score fill blanks fillBlanksIncorrectScore = 0; fillBlanksScoreSpan.textContent = score; fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; fillBlanksTotalSpan.textContent = currentConnectors.length; translationDirection = translationDirectionSelect.value; fillBlanksFinalized = false; currentConnectors.forEach((pair, index) => { const row = document.createElement('tr'); row.dataset.id = pair.id; const sourceCell = document.createElement('td'); sourceCell.textContent = (translationDirection === 'en-es') ? pair.en : pair.es; const inputCell = document.createElement('td'); const input = document.createElement('input'); input.type = 'text'; input.placeholder = (translationDirection === 'en-es') ? 'Escribe en Español...' : 'Escribe en Inglés...'; input.dataset.id = pair.id; input.dataset.index = index; input.disabled = false; input.addEventListener('blur', handleFillBlanksInputBlur); // Listener en cada input inputCell.appendChild(input); const feedbackCell = document.createElement('td'); feedbackCell.className = 'feedback'; feedbackCell.textContent = '-'; row.appendChild(sourceCell); row.appendChild(inputCell); row.appendChild(feedbackCell); fillBlanksTableBody.appendChild(row); }); }
    function checkAnswer(userInput, correctAnswer) { const normalizedInput = userInput.trim().toLowerCase(); if (!normalizedInput) return false; const correctOptions = (correctAnswer || '').toLowerCase().split(/[,/]/).map(opt => opt.trim()).filter(opt => opt.length > 0); if (correctOptions.length === 0) return false; const normalizedInputNoAccents = normalizedInput.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); const correctOptionsNoAccents = correctOptions.map(opt => opt.normalize("NFD").replace(/[\u0300-\u036f]/g, "")); return correctOptions.includes(normalizedInput) || correctOptionsNoAccents.includes(normalizedInputNoAccents); }
    function handleFillBlanksInputBlur(event) { if (fillBlanksFinalized) return; checkSingleAnswerAndUpdate(event.target); }
    function checkSingleAnswerAndUpdate(inputElement) { const row = inputElement.closest('tr'); if (!row || !fillBlanksScoreSpan || !fillBlanksIncorrectScoreSpan) return; const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal?.find(p => p.id == id); if (!connectorPair || !feedbackCell) return; const userAnswer = inputElement.value; const correctAnswer = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrectNow = checkAnswer(userAnswer, correctAnswer); const isIncorrectNow = !isCorrectNow && userAnswer.trim() !== ''; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrectNow) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); } else if (isIncorrectNow) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); } else { feedbackCell.textContent = '-'; } const currentTotalCorrect = fillBlanksTableBody?.querySelectorAll('td.feedback.correct').length ?? 0; const currentTotalIncorrect = fillBlanksTableBody?.querySelectorAll('td.feedback.incorrect').length ?? 0; score = currentTotalCorrect; // Actualizar score fill blanks fillBlanksIncorrectScore = currentTotalIncorrect; fillBlanksScoreSpan.textContent = score; fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; }
    function finalizeFillBlanksGame() { if (fillBlanksFinalized) { console.log("Finalize FillBlanks: Ya finalizado."); return; } fillBlanksFinalized = true; stopTimer(); console.log("--- Finalizando Fill Blanks Game ---"); let finalCorrectScore = 0; let finalIncorrectScore = 0; const rows = fillBlanksTableBody?.querySelectorAll('tr'); if (!rows || rows.length === 0) { console.warn("Finalize FillBlanks: No hay filas para finalizar."); if(checkAnswersBtn) checkAnswersBtn.disabled = true; return; } rows.forEach((row, index) => { const input = row.querySelector('input[type="text"]'); const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal?.find(p => p.id == id); if (!input || !feedbackCell || !connectorPair) { console.error(`Finalize FillBlanks: Error elementos fila ${index} (ID: ${id}).`); return; } const userAnswer = input.value; const correctAnswerString = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrect = checkAnswer(userAnswer, correctAnswerString); const isIncorrect = !isCorrect && userAnswer.trim() !== ''; input.value = correctAnswerString; input.disabled = true; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrect) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); finalCorrectScore++; } else if (isIncorrect) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); finalIncorrectScore++; } else { feedbackCell.textContent = '-'; } if (!feedbackCell.classList.contains('feedback')) feedbackCell.classList.add('feedback'); }); score = finalCorrectScore; // Actualizar score fill blanks fillBlanksIncorrectScore = finalIncorrectScore; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = score; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; if(checkAnswersBtn) checkAnswersBtn.disabled = true; if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); console.log(`--- Fill Blanks Finalizado: Correct=${score}, Incorrect=${fillBlanksIncorrectScore} ---`); }
    function initializeFillBlanksGame() { console.log("Inicializando Fill Blanks Game..."); score = 0; // Resetear scores fill blanks fillBlanksIncorrectScore = 0; fillBlanksFinalized = false; if(!fillBlanksTimeSelect || !checkAnswersBtn || !restartFillBlanksBtn) { console.error("FillBlanks Init: Faltan elementos DOM"); return; } renderFillBlanksTable(); const selectedMinutes = parseInt(fillBlanksTimeSelect.value, 10); startTimer(selectedMinutes * 60); showScreen('fill-blanks-game'); // Mostrar pantalla del juego checkAnswersBtn.disabled = false; restartFillBlanksBtn.disabled = false; }
    function resetFillBlanksGame(goToSetup = false) { console.log("Reseteando Fill Blanks Game..."); stopTimer(); if(fillBlanksTableBody) fillBlanksTableBody.innerHTML = ''; score = 0; fillBlanksIncorrectScore = 0; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = '0'; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = '0'; if(fillBlanksTotalSpan) fillBlanksTotalSpan.textContent = '0'; if(fillBlanksTimerSpan) fillBlanksTimerSpan.textContent = '--:--'; if(checkAnswersBtn) checkAnswersBtn.disabled = true; if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = true; fillBlanksFinalized = false; // No ir a setup aquí, se maneja en 'Volver' }

    // ======================================================================
    // --- LÓGICA JUEGO GERUNDIOS/INF (Verb Patterns - Código Original) ---
    // (Se asume que funciona y usa las variables globales definidas arriba, como verbPatternScore)
    // ======================================================================
    function updateVerbPatternScores() { if(verbPatternCorrectSpan) verbPatternCorrectSpan.textContent = verbPatternScore; if(verbPatternIncorrectSpan) verbPatternIncorrectSpan.textContent = verbPatternIncorrectScore; if(verbPatternQCountSpan) verbPatternQCountSpan.textContent = Math.max(0, currentPatternIndex + 1); }
    function stopQuestionTimer() { clearInterval(verbPatternQuestionTimer); verbPatternQuestionTimer = null; }
    function startQuestionTimer() { stopQuestionTimer(); verbPatternQuestionTimeLeft = verbPatternTimePerQuestion; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; userCanAnswer = true; verbPatternAnswerButtons?.forEach(button => button.disabled = false); if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } verbPatternQuestionTimer = setInterval(() => { verbPatternQuestionTimeLeft--; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; if (verbPatternQuestionTimeLeft <= 0) { handleQuestionTimeout(); } }, 1000); }
    function handleQuestionTimeout() { console.log("Question Timeout!"); stopQuestionTimer(); userCanAnswer = false; verbPatternAnswerButtons?.forEach(button => button.disabled = true); verbPatternIncorrectScore++; updateVerbPatternScores(); if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = "¡Tiempo agotado!"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; } const currentPattern = currentVerbPatterns?.[currentPatternIndex]; if(currentPattern) showCorrectAnswerFeedback(currentPattern.category); setTimeout(displayNextVerbPatternQuestion, 2500); // Siguiente pregunta tras pausa }
    function showCorrectAnswerFeedback(correctCategory) { verbPatternAnswerButtons?.forEach(button => { button.style.border = ''; if(button.dataset.answer === correctCategory) { button.style.border = '2px solid green'; } }); }
    function handleVerbPatternAnswer(event) { if (!userCanAnswer) return; stopQuestionTimer(); userCanAnswer = false; verbPatternAnswerButtons?.forEach(button => { button.disabled = true; button.style.border = ''; }); const selectedButton = event.target; const selectedAnswer = selectedButton.dataset.answer; const currentPattern = currentVerbPatterns?.[currentPatternIndex]; if(!currentPattern || !verbPatternFeedbackDiv) return; const correctAnswer = currentPattern.category; if (selectedAnswer === correctAnswer) { verbPatternScore++; verbPatternFeedbackDiv.textContent = "¡Correcto!"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback correct'; selectedButton.style.border = '2px solid green'; } else { verbPatternIncorrectScore++; const categoryMap = { 'gerund': 'Gerundio (-ing)', 'infinitive_to': 'Infinitivo (con TO)', 'infinitive_no_to': 'Infinitivo (sin TO)', 'both': 'Ambos' }; verbPatternFeedbackDiv.textContent = `Incorrecto. Era: ${categoryMap[correctAnswer] || correctAnswer}`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; selectedButton.style.border = '2px solid red'; showCorrectAnswerFeedback(correctAnswer); // Mostrar borde verde en la correcta } updateVerbPatternScores(); setTimeout(displayNextVerbPatternQuestion, 1800); // Siguiente pregunta tras pausa }
    function displayNextVerbPatternQuestion() { currentPatternIndex++; verbPatternAnswerButtons?.forEach(button => { button.disabled = true; button.style.border = ''; }); if (currentPatternIndex < currentVerbPatterns.length) { const pattern = currentVerbPatterns[currentPatternIndex]; if(verbPatternTermDiv) verbPatternTermDiv.textContent = pattern.term; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = pattern.explanation || ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } updateVerbPatternScores(); startQuestionTimer(); // Iniciar timer para esta pregunta } else { // Fin del juego console.log("Juego de Gerundios/Infinitivos terminado!"); if(verbPatternTermDiv) verbPatternTermDiv.textContent = "¡Juego Terminado!"; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = `Resultado Final: ${verbPatternScore} Aciertos, ${verbPatternIncorrectScore} Errores.`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; // Sin clase correct/incorrect } if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '-'; verbPatternAnswerButtons?.forEach(button => button.disabled = true); if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Volver a Selección"; // Cambiar texto botón } }
    // MODIFICADO: Solo limpia estado, no cambia pantalla
    function cleanUpVerbPatternGame() { console.log("Limpiando estado Verb Pattern Game..."); stopQuestionTimer(); verbPatternScore = 0; verbPatternIncorrectScore = 0; currentPatternIndex = -1; userCanAnswer = false; // Resetear scores y estado if(verbPatternTermDiv) verbPatternTermDiv.textContent = '...'; // Limpiar UI if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = ''; if(verbPatternFeedbackDiv) verbPatternFeedbackDiv.textContent = ''; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '--'; verbPatternAnswerButtons?.forEach(button => { button.disabled = true; button.style.border = ''; }); if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Salir del Juego"; // Restaurar texto original }
    function initializeVerbPatternGame() { console.log("Inicializando Verb Pattern Game..."); if(!verbPatternTimeSelect || !verbPatternQTotalSpan || !verbPatternQuitBtn) { console.error("VerbPattern Init: Faltan elementos DOM"); return; } verbPatternTimePerQuestion = parseInt(verbPatternTimeSelect.value, 10); cleanUpVerbPatternGame(); // Limpiar estado antes de empezar if (typeof verbPatternData !== 'undefined' && verbPatternData.length > 0) { currentVerbPatterns = shuffleArray([...verbPatternData]); verbPatternQTotalSpan.textContent = currentVerbPatterns.length; } else { console.error("VerbPattern Init: No se pudieron cargar los datos."); verbPatternQTotalSpan.textContent = '0'; currentVerbPatterns = []; } updateVerbPatternScores(); // Mostrar scores iniciales (0) verbPatternQuitBtn.textContent = "Salir del Juego"; showScreen('verb-pattern-game'); // Mostrar pantalla del juego if (currentVerbPatterns.length > 0) { displayNextVerbPatternQuestion(); // Mostrar primera pregunta } else { if(verbPatternTermDiv) verbPatternTermDiv.textContent = "Error al cargar datos"; verbPatternAnswerButtons?.forEach(button => button.disabled = true); } }


    // ===================================
    // --- EVENT LISTENERS GLOBALES ---
    // ===================================

    // --- Botones de Selección de Juego ---
    const selectMatchingBtn = document.getElementById('select-matching-btn');
    const selectFillBlanksBtn = document.getElementById('select-fill-blanks-btn');
    const selectVerbPatternBtn = document.getElementById('select-verb-pattern-btn');
    const selectVerbsGameBtn = document.getElementById('select-verbs-game-btn');     // Botón Juego Verbos
    const selectTraduccionGameBtn = document.getElementById('select-traduccion-game-btn'); // Botón Juego Traducción

    if (selectMatchingBtn) selectMatchingBtn.addEventListener('click', () => showScreen('matching-setup'));
    if (selectFillBlanksBtn) selectFillBlanksBtn.addEventListener('click', () => showScreen('fill-blanks-setup'));
    if (selectVerbPatternBtn) selectVerbPatternBtn.addEventListener('click', () => showScreen('verb-pattern-setup'));
    if (selectVerbsGameBtn) selectVerbsGameBtn.addEventListener('click', () => showScreen('verbs')); // Llama a showScreen con 'verbs'
    if (selectTraduccionGameBtn) selectTraduccionGameBtn.addEventListener('click', () => showScreen('traduccion')); // Llama a showScreen con 'traduccion'

    // --- Botones "Volver a Selección" (Todos los botones con esta clase) ---
    backToSelectionButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log(`Botón 'Volver' clickeado desde modo: ${currentGameMode}`);
            const gameToReset = currentGameMode; // Guardar el modo actual ANTES de cambiarlo
            // Asegurarse de que no estamos ya en 'selection' para evitar resets innecesarios
            if (gameToReset && gameToReset !== 'selection') {
                 resetPreviousGame(gameToReset); // Llamar a la función de reset/limpieza
            }
            showScreen('selection'); // Mostrar SIEMPRE la pantalla de selección
        });
    });

    // --- Listeners Botones "Start" (Juegos Originales) ---
    if (startMatchingBtn) startMatchingBtn.addEventListener('click', initializeMatchingGame);
    if (startFillBlanksBtn) startFillBlanksBtn.addEventListener('click', initializeFillBlanksGame);
    if (startVerbPatternBtn) startVerbPatternBtn.addEventListener('click', initializeVerbPatternGame);

    // --- Listeners Acciones Dentro de Juegos Originales ---
    // Matching
    if (giveUpBtn) giveUpBtn.addEventListener('click', () => showMatchingResults(false));
    if (playAgainMatchingBtn) playAgainMatchingBtn.addEventListener('click', () => {
        if(resultsOverlay) resultsOverlay.classList.add('hidden');
        showScreen('matching-setup'); // Volver a la configuración
    });
    if (restartMatchingBtn) restartMatchingBtn.addEventListener('click', () => {
        // Botón para reiniciar el MISMO juego inmediatamente (sin ir a setup)
        if(resultsOverlay) resultsOverlay.classList.add('hidden'); // Ocultar si estaba visible
        resetMatchingGame(false); // Resetear estado sin ir a setup
        initializeMatchingGame(); // Iniciar de nuevo
    });

    // Fill Blanks
    if (checkAnswersBtn) checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    if (restartFillBlanksBtn) restartFillBlanksBtn.addEventListener('click', () => {
         // Reiniciar el MISMO juego inmediatamente
         resetFillBlanksGame(false);
         initializeFillBlanksGame();
    });

    // Verb Patterns (Listener para botones de respuesta)
    if (verbPatternOptionsDiv) {
        verbPatternOptionsDiv.addEventListener('click', (event) => {
            // Asegurarse que solo se activa si el juego G/I está activo
            if (event.target.classList.contains('answer-button') && !event.target.disabled && userCanAnswer && currentGameMode === 'verb-pattern-game') {
                handleVerbPatternAnswer(event);
            }
        });
    }
     // El botón "Salir" (#verb-pattern-quit-btn) ahora usa la clase .back-to-selection,
     // así que su lógica de reset + ir a selección está cubierta por el listener general de esa clase.

    // =============================
    // --- INICIALIZACIÓN GENERAL ---
    // =============================
    showScreen('selection'); // Empezar mostrando la pantalla de selección de juego
    console.log("Script Principal: Inicialización completada.");

}); // Fin DOMContentLoaded
