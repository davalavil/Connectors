// ==================================================
// js/script.js (PRINCIPAL - ORQUESTADOR INTEGRADO)
// Maneja la selección, visibilidad, inicialización
// y reseteo de TODOS los juegos.
// ==================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Cargado. Inicializando Script Principal...");

    // --- Comprobación Inicial de Datos y Módulos ---
    let dataOk = true;
    let modulesOk = true;

    // Datos juegos originales
    if (typeof conectoresOriginal === 'undefined') {
        console.error("ERROR CRÍTICO: 'conectoresOriginal' no definida (falta connectors.js o error).");
        dataOk = false;
    }
    if (typeof verbPatternData === 'undefined') {
        console.error("ERROR CRÍTICO: 'verbPatternData' no definida (falta verbPatterns.js o error).");
        dataOk = false;
    }
    // Librería externa
    if (typeof Sortable === 'undefined') {
        console.warn("ADVERTENCIA: Librería 'SortableJS' no cargada. El juego de emparejar no funcionará.");
        // No es crítico para toda la app, pero sí para ese juego.
    }
    // Módulos juegos importados (deben existir en este punto)
    if (typeof VerbsGame === 'undefined' || typeof VerbsGame.init !== 'function') {
        console.error("ERROR CRÍTICO: Módulo 'VerbsGame' no definido o no tiene 'init' (falta script_verbs.js o error).");
        modulesOk = false;
    }
    if (typeof TraduccionGame === 'undefined' || typeof TraduccionGame.init !== 'function') {
        console.error("ERROR CRÍTICO: Módulo 'TraduccionGame' no definido o no tiene 'init' (falta script_traduccion.js o error).");
        modulesOk = false;
    }

    // Mostrar alerta si faltan datos o módulos críticos
    if (!dataOk || !modulesOk) {
        alert("Error crítico al cargar componentes de la aplicación. Algunos juegos pueden no funcionar. Revisa la consola (F12) para más detalles.");
        // Podríamos deshabilitar botones específicos aquí si quisiéramos
    }

    // --- Variables Globales del Orquestador ---
    let currentGameMode = null; // 'selection', 'matching-setup', 'matching-game', 'fill-blanks-setup', ... 'verbs', 'traduccion'
    let timerInterval = null; // Timer general (usado por Matching y FillBlanks)
    let timeLeft = 0;        // Tiempo restante para el timer general

    // --- Variables Específicas de Juegos Originales (Mantenidas aquí por simplicidad) ---
    // (Idealmente, también podrían encapsularse, pero para no complicar más, se quedan)
    let currentConnectors = [];        // Usado por Matching y FillBlanks
    let matchingScore = 0;             // Puntuación específica Matching
    let fillBlanksScore = 0;           // Puntuación específica FillBlanks (correctas)
    let fillBlanksIncorrectScore = 0; // Puntuación específica FillBlanks (incorrectas)
    let fillBlanksFinalized = false;   // Estado específico FillBlanks
    let sortableInstance = null;       // Instancia Sortable para Matching
    let translationDirection = 'en-es'; // Dirección para FillBlanks

    // Verb Patterns
    let currentVerbPatterns = [];      // Datos para la ronda actual
    let currentPatternIndex = -1;      // Índice de la pregunta actual
    let verbPatternTimePerQuestion = 15; // Tiempo por pregunta (configurable)
    let verbPatternQuestionTimer = null; // Timer específico por pregunta
    let verbPatternQuestionTimeLeft = 0; // Tiempo restante pregunta
    let verbPatternCorrectScore = 0;   // Puntuación específica VerbPatterns (correctas)
    let verbPatternIncorrectScore = 0; // Puntuación específica VerbPatterns (incorrectas)
    let userCanAnswer = false;         // Flag para VerbPatterns (si el usuario puede responder)


    // --- Referencias a Elementos del DOM Comunes y Contenedores ---
    const mainTitle = document.getElementById('main-title');
    const gameSelectionDiv = document.getElementById('game-selection');
    const backToSelectionButtons = document.querySelectorAll('.back-to-selection');

    // Contenedores Principales de cada Juego
    const matchingContainer = document.getElementById('matching-container');
    const fillBlanksContainer = document.getElementById('fill-blanks-container');
    const verbPatternContainer = document.getElementById('verb-pattern-container');
    const verbsGameContainer = document.getElementById('verbs-game-container');         // Contenedor Verbs
    const traduccionGameContainer = document.getElementById('traduccion-game-container'); // Contenedor Traduccion

    // --- Referencias a Elementos Internos de Juegos ORIGINALES ---
    // (Los elementos de Verbs y Traduccion se buscan dentro de sus módulos init)

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
    const verbPatternQuitBtn = document.getElementById('verb-pattern-quit-btn'); // Este botón ahora tiene clase .back-to-selection
    const verbPatternAnswerButtons = verbPatternOptionsDiv.querySelectorAll('.answer-button');


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

    // --- Función Central de Control de Visibilidad e Inicialización ---
    /**
     * Muestra la pantalla/juego solicitado, oculta los demás, actualiza el título
     * y llama a la función `init` del módulo correspondiente si es un juego importado.
     * @param {string} screen - Identificador de la pantalla a mostrar
     *        ('selection', 'matching-setup', 'matching-game', 'fill-blanks-setup', ..., 'verbs', 'traduccion')
     */
    function showScreen(screen) {
        console.log(`Navegando a: ${screen}`); // Log para depuración

        // --- 1. Ocultar TODOS los contenedores principales ---
        // (Usar .hidden definido en style.css con !important)
        if (gameSelectionDiv) gameSelectionDiv.classList.add('hidden');
        if (matchingContainer) matchingContainer.classList.add('hidden');
        if (fillBlanksContainer) fillBlanksContainer.classList.add('hidden');
        if (verbPatternContainer) verbPatternContainer.classList.add('hidden');
        if (verbsGameContainer) verbsGameContainer.classList.add('hidden');         // Ocultar Verbs
        if (traduccionGameContainer) traduccionGameContainer.classList.add('hidden'); // Ocultar Traduccion

        // --- 2. Ocultar sub-secciones (setup/game) y overlays ---
        // (Es buena práctica ocultarlas siempre, aunque el contenedor padre ya esté oculto)
        if (matchingSetupDiv) matchingSetupDiv.classList.add('hidden');
        if (matchingGameDiv) matchingGameDiv.classList.add('hidden');
        if (fillBlanksSetupDiv) fillBlanksSetupDiv.classList.add('hidden');
        if (fillBlanksGameDiv) fillBlanksGameDiv.classList.add('hidden');
        if (verbPatternSetupDiv) verbPatternSetupDiv.classList.add('hidden');
        if (verbPatternGameDiv) verbPatternGameDiv.classList.add('hidden');
        if (resultsOverlay) resultsOverlay.classList.add('hidden'); // Ocultar overlay de matching

        // --- 3. Actualizar Estado y Título ---
        currentGameMode = screen; // Guardar el modo actual
        let titleText = "Selección de Juego"; // Título por defecto

        // --- 4. Mostrar Contenedor/Sección Correcta e Inicializar si es necesario ---
        try { // Usar try-catch para capturar errores al inicializar módulos
            switch (screen) {
                case 'selection':
                    if (gameSelectionDiv) gameSelectionDiv.classList.remove('hidden');
                    titleText = "Selección de Juego";
                    break;

                // --- Juegos Originales (Mostrar setup o juego) ---
                case 'matching-setup':
                    if (matchingContainer) matchingContainer.classList.remove('hidden');
                    if (matchingSetupDiv) matchingSetupDiv.classList.remove('hidden');
                    titleText = "Emparejar Conectores";
                    // La lógica de inicialización está en el botón Start
                    break;
                case 'matching-game': // Este caso se llama desde initializeMatchingGame
                    if (matchingContainer) matchingContainer.classList.remove('hidden');
                    if (matchingGameDiv) matchingGameDiv.classList.remove('hidden');
                    titleText = "Emparejar Conectores";
                    break;
                case 'fill-blanks-setup':
                    if (fillBlanksContainer) fillBlanksContainer.classList.remove('hidden');
                    if (fillBlanksSetupDiv) fillBlanksSetupDiv.classList.remove('hidden');
                    titleText = "Rellenar Conectores";
                    break;
                case 'fill-blanks-game': // Se llama desde initializeFillBlanksGame
                    if (fillBlanksContainer) fillBlanksContainer.classList.remove('hidden');
                    if (fillBlanksGameDiv) fillBlanksGameDiv.classList.remove('hidden');
                    titleText = "Rellenar Conectores";
                    break;
                case 'verb-pattern-setup':
                    if (verbPatternContainer) verbPatternContainer.classList.remove('hidden');
                    if (verbPatternSetupDiv) verbPatternSetupDiv.classList.remove('hidden');
                    titleText = "Gerundios e Infinitivos";
                    break;
                case 'verb-pattern-game': // Se llama desde initializeVerbPatternGame
                    if (verbPatternContainer) verbPatternContainer.classList.remove('hidden');
                    if (verbPatternGameDiv) verbPatternGameDiv.classList.remove('hidden');
                    titleText = "Gerundios e Infinitivos";
                    break;

                // --- Juegos Importados (Mostrar contenedor y llamar a init) ---
                case 'verbs':
                    if (verbsGameContainer) {
                        verbsGameContainer.classList.remove('hidden');
                        titleText = "Práctica de Verbos";
                        // Validar y llamar a init del módulo VerbsGame
                        if (typeof VerbsGame !== 'undefined' && VerbsGame.init) {
                            VerbsGame.init(verbsGameContainer); // Pasar el contenedor
                        } else if (modulesOk) { // Solo mostrar error si el módulo DEBERÍA estar cargado
                             console.error("showScreen: VerbsGame.init no encontrado al intentar mostrar 'verbs'.");
                             verbsGameContainer.innerHTML = "<p class='error-message'>Error al inicializar el juego de Verbos.</p>";
                        }
                    } else { console.error("showScreen: Contenedor '#verbs-game-container' no encontrado."); }
                    break;
                case 'traduccion':
                    if (traduccionGameContainer) {
                        traduccionGameContainer.classList.remove('hidden');
                        titleText = "Práctica de Vocabulario";
                        // Validar y llamar a init del módulo TraduccionGame
                        if (typeof TraduccionGame !== 'undefined' && TraduccionGame.init) {
                            TraduccionGame.init(traduccionGameContainer); // Pasar el contenedor
                        } else if (modulesOk) { // Solo mostrar error si el módulo DEBERÍA estar cargado
                             console.error("showScreen: TraduccionGame.init no encontrado al intentar mostrar 'traduccion'.");
                             traduccionGameContainer.innerHTML = "<p class='error-message'>Error al inicializar el juego de Vocabulario.</p>";
                        }
                    } else { console.error("showScreen: Contenedor '#traduccion-game-container' no encontrado."); }
                    break;

                default:
                     console.warn("showScreen: Pantalla desconocida solicitada:", screen);
                     if (gameSelectionDiv) gameSelectionDiv.classList.remove('hidden'); // Volver a selección
                     currentGameMode = 'selection';
                     titleText = "Selección de Juego";
            }
        } catch (error) {
            console.error(`Error durante showScreen para '${screen}':`, error);
            // Intentar volver a la selección de forma segura
            if (gameSelectionDiv) gameSelectionDiv.classList.remove('hidden');
             currentGameMode = 'selection';
             titleText = "Error - Selección";
             alert("Ocurrió un error al cargar el juego. Volviendo a la selección.");
        }

        // --- 5. Actualizar Título Principal ---
        if (mainTitle) { mainTitle.textContent = titleText; }

        // --- 6. Opcional: Scroll al inicio de la página ---
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

     // --- Función para Detener y Resetear el Juego Anterior ---
     /**
      * Detiene temporizadores y llama a la función reset del juego especificado.
      * @param {string} gameModeToReset - El identificador del juego a resetear.
      */
     function resetPreviousGame(gameModeToReset) {
         console.log(`Reseteando estado del juego: ${gameModeToReset}`);

         // Detener temporizadores globales y específicos
         stopTimer(); // Detiene timer general (Matching, FillBlanks)
         stopQuestionTimer(); // Detiene timer de pregunta (VerbPatterns)

         // Llamar a la función reset específica del juego
         switch (gameModeToReset) {
             // Casos para juegos originales (llaman a sus funciones de reset/quit)
             case 'matching':
             case 'matching-game':
                 // resetMatchingGame(true) limpia estado y prepara para setup
                 resetMatchingGame(true); // El 'true' indica ir a setup (aunque showScreen lo hará)
                 break;
             case 'fill-blanks':
             case 'fill-blanks-game':
                 resetFillBlanksGame(true);
                 break;
             case 'verb-pattern':
             case 'verb-pattern-game':
                 // quitVerbPatternGame() resetea estado y timers
                 quitVerbPatternGame(); // Esta función ya hace la limpieza necesaria
                 break;

             // Casos para juegos importados (llaman a reset del módulo)
             case 'verbs':
                 if (typeof VerbsGame !== 'undefined' && VerbsGame.reset) {
                     VerbsGame.reset();
                 } else if (modulesOk) { console.warn("resetPreviousGame: VerbsGame.reset no encontrado."); }
                 break;
             case 'traduccion':
                 if (typeof TraduccionGame !== 'undefined' && TraduccionGame.reset) {
                     TraduccionGame.reset();
                 } else if (modulesOk) { console.warn("resetPreviousGame: TraduccionGame.reset no encontrado."); }
                 break;

             // No hacer nada para 'selection', 'setup' o modos desconocidos
             case 'selection':
             case 'matching-setup':
             case 'fill-blanks-setup':
             case 'verb-pattern-setup':
                 // No necesitan reset explícito aquí
                 break;
             default:
                 console.log(`No se necesita reset específico para: ${gameModeToReset}`);
         }
     }


    // --- Funciones del Temporizador General (Matching, Fill Blanks) ---
    /** Actualiza el span del temporizador correspondiente al juego activo */
    function updateTimerDisplay() {
        const formattedTime = formatTime(timeLeft);
        // Identificar el span correcto según el juego activo (solo si está en modo 'game')
        if (currentGameMode === 'matching-game' && matchingTimerSpan) {
            matchingTimerSpan.textContent = formattedTime;
        } else if (currentGameMode === 'fill-blanks-game' && fillBlanksTimerSpan) {
            fillBlanksTimerSpan.textContent = formattedTime;
        }
    }
    /** Inicia o reinicia el temporizador general */
    function startTimer(durationInSeconds) {
        stopTimer(); // Asegurar que no haya otro timer corriendo
        timeLeft = durationInSeconds;
        updateTimerDisplay(); // Mostrar tiempo inicial
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                stopTimer(); // Detener al llegar a 0
                handleTimeUp(); // Manejar fin de tiempo
            }
        }, 1000); // Ejecutar cada segundo
    }
    /** Detiene el temporizador general */
    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null; // Limpiar referencia
    }
    /** Maneja el evento cuando el temporizador general llega a 0 */
    function handleTimeUp() {
        console.log("Temporizador General Finalizado!");
        if (currentGameMode === 'matching-game') {
            showMatchingResults(false); // Mostrar resultados de matching (no ganado)
        } else if (currentGameMode === 'fill-blanks-game') {
            if (!fillBlanksFinalized) {
                finalizeFillBlanksGame(); // Finalizar fill blanks si no se había hecho
            }
        }
    }

    // --- Lógica Juego Emparejar (Matching) ---
    // (Las funciones internas se mantienen igual, solo ajustamos init/reset)
    function checkMatch(p1, p2) { if (!p1 || !p2 || !p1.dataset || !p2.dataset) return false; if (p1.classList.contains('correct-match') || p2.classList.contains('correct-match') || p1.style.display === 'none' || p2.style.display === 'none') { return false; } const id1 = p1.dataset.id; const lang1 = p1.dataset.lang; const id2 = p2.dataset.id; const lang2 = p2.dataset.lang; return id1 === id2 && lang1 !== lang2; }
    function applyCorrectMatch(p1, p2) { p1.classList.add('correct-match'); p2.classList.add('correct-match'); setTimeout(() => { p1.style.display = 'none'; p2.style.display = 'none'; matchingScore++; currentScoreSpan.textContent = matchingScore; const remaining = wordArea.querySelectorAll('.word-pill:not([style*="display: none"])').length; if (remaining === 0) { stopTimer(); setTimeout(() => showMatchingResults(true), 300); } }, 160); }
    function applyIncorrectMatchFeedback(p) { if (!p || p.classList.contains('correct-match') || p.style.display === 'none') return; p.classList.add('incorrect-match'); setTimeout(() => { if (p) { p.classList.remove('incorrect-match'); } }, 500); }
    function renderMatchingWords() { wordArea.innerHTML = ''; const wordsToRender = []; currentConnectors = shuffleArray([...conectoresOriginal]); matchingScore = 0; currentScoreSpan.textContent = matchingScore; totalPairsSpan.textContent = currentConnectors.length; currentConnectors.forEach(pair => { wordsToRender.push({ id: pair.id, lang: 'en', text: pair.en }); wordsToRender.push({ id: pair.id, lang: 'es', text: pair.es }); }); shuffleArray(wordsToRender); wordsToRender.forEach(word => { const pill = document.createElement('div'); pill.classList.add('word-pill', `lang-${word.lang}`); pill.textContent = word.text; pill.dataset.id = word.id; pill.dataset.lang = word.lang; wordArea.appendChild(pill); }); if (sortableInstance) { sortableInstance.destroy(); } if (typeof Sortable !== 'undefined') { sortableInstance = Sortable.create(wordArea, { animation: 150, ghostClass: 'dragging', forceFallback: true, onEnd: function (evt) { const movedItem = evt.item; if (!timerInterval || timeLeft <= 0 || !resultsOverlay.classList.contains('hidden')) { return; } const prevSibling = movedItem.previousElementSibling; const nextSibling = movedItem.nextElementSibling; let matchFound = false; let targetPill = null; if (prevSibling && prevSibling.style.display !== 'none' && checkMatch(movedItem, prevSibling)) { matchFound = true; targetPill = prevSibling; } if (!matchFound && nextSibling && nextSibling.style.display !== 'none' && checkMatch(movedItem, nextSibling)) { matchFound = true; targetPill = nextSibling; } if (matchFound && targetPill) { applyCorrectMatch(movedItem, targetPill); } else { applyIncorrectMatchFeedback(movedItem); } } }); } else { console.error("Matching: Sortable no definido."); } }
    function showMatchingResults(won) { stopTimer(); if (sortableInstance) { sortableInstance.option('disabled', true); } correctPairsList.innerHTML = ''; conectoresOriginal.forEach(pair => { const div = document.createElement('div'); div.textContent = `${pair.en} = ${pair.es}`; correctPairsList.appendChild(div); }); let resultTitle = "Resultados"; if (won) resultTitle = "¡Felicidades!"; else if (timeLeft <= 0 && timerInterval === null) resultTitle = "¡Tiempo Agotado!"; else resultTitle = "Te has rendido"; resultsOverlay.querySelector('h2').textContent = resultTitle; resultsOverlay.classList.remove('hidden'); giveUpBtn.disabled = true; restartMatchingBtn.disabled = false; }
    function initializeMatchingGame() { console.log("Initializing Matching Game..."); matchingScore = 0; renderMatchingWords(); const selectedMinutes = parseInt(matchingTimeSelect.value, 10); startTimer(selectedMinutes * 60); showScreen('matching-game'); // Mostrar pantalla del juego giveUpBtn.disabled = false; restartMatchingBtn.disabled = true; resultsOverlay.classList.add('hidden'); if (sortableInstance) { sortableInstance.option('disabled', false); } }
    function resetMatchingGame(goToSetup = false) { console.log("Resetting Matching Game..."); stopTimer(); if(wordArea) wordArea.innerHTML = ''; matchingScore = 0; if(currentScoreSpan) currentScoreSpan.textContent = '0'; if(totalPairsSpan) totalPairsSpan.textContent = '0'; if(matchingTimerSpan) matchingTimerSpan.textContent = '--:--'; if(resultsOverlay) resultsOverlay.classList.add('hidden'); if(giveUpBtn) giveUpBtn.disabled = false; if(restartMatchingBtn) restartMatchingBtn.disabled = false; if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; } // No mostrar setup aquí, se maneja en el listener de volver/jugar de nuevo }


    // --- Lógica Juego Rellenar (Fill Blanks) ---
    // (Las funciones internas se mantienen igual, solo ajustamos init/reset)
    function renderFillBlanksTable() { fillBlanksTableBody.innerHTML = ''; currentConnectors = shuffleArray([...conectoresOriginal]); fillBlanksScore = 0; fillBlanksIncorrectScore = 0; fillBlanksScoreSpan.textContent = fillBlanksScore; fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; fillBlanksTotalSpan.textContent = currentConnectors.length; translationDirection = translationDirectionSelect.value; fillBlanksFinalized = false; const fragment = document.createDocumentFragment(); currentConnectors.forEach((pair, index) => { const row = document.createElement('tr'); row.dataset.id = pair.id; const sourceCell = document.createElement('td'); sourceCell.textContent = (translationDirection === 'en-es') ? pair.en : pair.es; const inputCell = document.createElement('td'); const input = document.createElement('input'); input.type = 'text'; input.placeholder = (translationDirection === 'en-es') ? 'Escribe en Español...' : 'Escribe en Inglés...'; input.dataset.id = pair.id; input.dataset.index = index; input.disabled = false; input.addEventListener('blur', handleFillBlanksInputBlur); inputCell.appendChild(input); const feedbackCell = document.createElement('td'); feedbackCell.className = 'feedback'; feedbackCell.textContent = '-'; row.appendChild(sourceCell); row.appendChild(inputCell); row.appendChild(feedbackCell); fragment.appendChild(row); }); fillBlanksTableBody.appendChild(fragment); }
    function checkAnswer(userInput, correctAnswer) { const normalizedInput = userInput.trim().toLowerCase(); if (!normalizedInput) return false; const correctOptions = correctAnswer.toLowerCase().split(/[,/]/).map(opt => opt.trim()).filter(opt => opt.length > 0); if (correctOptions.length === 0) return false; const normalizedInputNoAccents = normalizedInput.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); const correctOptionsNoAccents = correctOptions.map(opt => opt.normalize("NFD").replace(/[\u0300-\u036f]/g, "")); return correctOptions.includes(normalizedInput) || correctOptionsNoAccents.includes(normalizedInputNoAccents); }
    function handleFillBlanksInputBlur(event) { if (fillBlanksFinalized) return; checkSingleAnswerAndUpdate(event.target); }
    function checkSingleAnswerAndUpdate(inputElement) { const row = inputElement.closest('tr'); if (!row) return; const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal.find(p => p.id == id); if (!connectorPair || !feedbackCell) return; const userAnswer = inputElement.value; const correctAnswer = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrectNow = checkAnswer(userAnswer, correctAnswer); const isIncorrectNow = !isCorrectNow && userAnswer.trim() !== ''; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrectNow) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); } else if (isIncorrectNow) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); } else { feedbackCell.textContent = '-'; } if (!feedbackCell.classList.contains('feedback')) { feedbackCell.classList.add('feedback'); } const currentTotalCorrect = fillBlanksTableBody.querySelectorAll('td.feedback.correct').length; const currentTotalIncorrect = fillBlanksTableBody.querySelectorAll('td.feedback.incorrect').length; fillBlanksScore = currentTotalCorrect; fillBlanksIncorrectScore = currentTotalIncorrect; fillBlanksScoreSpan.textContent = fillBlanksScore; fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; }
    function finalizeFillBlanksGame() { if (fillBlanksFinalized) return; fillBlanksFinalized = true; stopTimer(); console.log("Finalizing Fill Blanks Game..."); let finalCorrect = 0; let finalIncorrect = 0; const rows = fillBlanksTableBody.querySelectorAll('tr'); if (rows.length === 0) { checkAnswersBtn.disabled = true; return; } rows.forEach((row) => { const input = row.querySelector('input[type="text"]'); const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal.find(p => p.id == id); if (!input || !feedbackCell || !connectorPair) return; const userAnswer = input.value; const correctAnswerString = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrect = checkAnswer(userAnswer, correctAnswerString); const isIncorrect = !isCorrect && userAnswer.trim() !== ''; input.value = correctAnswerString; input.disabled = true; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrect) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); finalCorrect++; } else if (isIncorrect) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); finalIncorrect++; } else { feedbackCell.textContent = '-'; } if (!feedbackCell.classList.contains('feedback')) feedbackCell.classList.add('feedback'); }); fillBlanksScore = finalCorrect; fillBlanksIncorrectScore = finalIncorrect; fillBlanksScoreSpan.textContent = fillBlanksScore; fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; checkAnswersBtn.disabled = true; if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); console.log("Fill Blanks Game Finalized."); }
    function initializeFillBlanksGame() { console.log("Initializing Fill Blanks Game..."); fillBlanksScore = 0; fillBlanksIncorrectScore = 0; fillBlanksFinalized = false; renderFillBlanksTable(); const selectedMinutes = parseInt(fillBlanksTimeSelect.value, 10); startTimer(selectedMinutes * 60); showScreen('fill-blanks-game'); checkAnswersBtn.disabled = false; restartFillBlanksBtn.disabled = false; }
    function resetFillBlanksGame(goToSetup = false) { console.log("Resetting Fill Blanks Game..."); stopTimer(); if(fillBlanksTableBody) fillBlanksTableBody.innerHTML = ''; fillBlanksScore = 0; fillBlanksIncorrectScore = 0; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = '0'; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = '0'; if(fillBlanksTotalSpan) fillBlanksTotalSpan.textContent = '0'; if(fillBlanksTimerSpan) fillBlanksTimerSpan.textContent = '--:--'; if(checkAnswersBtn) checkAnswersBtn.disabled = true; if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = true; fillBlanksFinalized = false; // No mostrar setup aquí }


    // --- Lógica Juego Gerundios/Infinitivos (Verb Patterns) ---
    // (Las funciones internas se mantienen igual, solo ajustamos init/reset/quit)
     function updateVerbPatternScores() { verbPatternCorrectSpan.textContent = verbPatternCorrectScore; verbPatternIncorrectSpan.textContent = verbPatternIncorrectScore; verbPatternQCountSpan.textContent = Math.max(0, currentPatternIndex + 1); }
     function stopQuestionTimer() { clearInterval(verbPatternQuestionTimer); verbPatternQuestionTimer = null; }
     function startQuestionTimer() { stopQuestionTimer(); verbPatternTimePerQuestion = parseInt(verbPatternTimeSelect.value, 10); // Actualizar tiempo por si cambió verbPatternQuestionTimeLeft = verbPatternTimePerQuestion; verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; userCanAnswer = true; verbPatternAnswerButtons.forEach(button => button.disabled = false); verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; verbPatternQuestionTimer = setInterval(() => { verbPatternQuestionTimeLeft--; verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; if (verbPatternQuestionTimeLeft <= 0) { handleQuestionTimeout(); } }, 1000); }
     function handleQuestionTimeout() { stopQuestionTimer(); userCanAnswer = false; verbPatternAnswerButtons.forEach(button => button.disabled = true); verbPatternIncorrectScore++; updateVerbPatternScores(); verbPatternFeedbackDiv.textContent = "¡Tiempo agotado! (Error)"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; if(currentPatternIndex >= 0 && currentPatternIndex < currentVerbPatterns.length) { const currentPattern = currentVerbPatterns[currentPatternIndex]; showCorrectAnswerFeedback(currentPattern.category); } setTimeout(displayNextVerbPatternQuestion, 2500); }
     function showCorrectAnswerFeedback(correctCategory) { verbPatternAnswerButtons.forEach(button => { button.style.border = ''; if(button.dataset.answer === correctCategory) { button.style.border = '2px solid var(--success-color)'; } }); } // Usar variable CSS
     function handleVerbPatternAnswer(event) { if (!userCanAnswer) return; stopQuestionTimer(); userCanAnswer = false; verbPatternAnswerButtons.forEach(button => { button.disabled = true; button.style.border = ''; }); const selectedButton = event.target; const selectedAnswer = selectedButton.dataset.answer; const currentPattern = currentVerbPatterns[currentPatternIndex]; const correctAnswer = currentPattern.category; if (selectedAnswer === correctAnswer) { verbPatternCorrectScore++; verbPatternFeedbackDiv.textContent = "¡Correcto!"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback correct'; selectedButton.style.border = '2px solid var(--success-color)'; } else { verbPatternIncorrectScore++; const categoryMap = { 'gerund': 'Gerundio (-ing)', 'infinitive_to': 'Infinitivo (con TO)', 'infinitive_no_to': 'Infinitivo (sin TO)', 'both': 'Ambos' }; verbPatternFeedbackDiv.textContent = `Incorrecto. Era: ${categoryMap[correctAnswer] || correctAnswer}`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; selectedButton.style.border = '2px solid var(--danger-color)'; showCorrectAnswerFeedback(correctAnswer); } updateVerbPatternScores(); setTimeout(displayNextVerbPatternQuestion, 1800); }
     function displayNextVerbPatternQuestion() { currentPatternIndex++; verbPatternAnswerButtons.forEach(button => { button.disabled = true; button.style.border = ''; }); if (currentPatternIndex < currentVerbPatterns.length) { const pattern = currentVerbPatterns[currentPatternIndex]; verbPatternTermDiv.textContent = pattern.term; verbPatternExplanationDiv.textContent = pattern.explanation || ''; verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; updateVerbPatternScores(); startQuestionTimer(); } else { console.log("Verb Patterns Game terminado!"); verbPatternTermDiv.textContent = "¡Juego Terminado!"; verbPatternExplanationDiv.textContent = ''; verbPatternFeedbackDiv.textContent = `Resultado Final: ${verbPatternCorrectScore} Aciertos, ${verbPatternIncorrectScore} Errores de ${currentVerbPatterns.length}.`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; // Clase neutra para resultado final verbPatternQTimerSpan.textContent = '-'; verbPatternAnswerButtons.forEach(button => button.disabled = true); verbPatternQuitBtn.textContent = "Volver a Selección"; } }
     // Función Quit ahora solo limpia estado interno, la navegación la hace el listener de .back-to-selection
     function quitVerbPatternGame() { console.log("Resetting Verb Patterns Game..."); stopQuestionTimer(); verbPatternCorrectScore = 0; verbPatternIncorrectScore = 0; currentPatternIndex = -1; currentVerbPatterns = []; // Limpiar array if(verbPatternTermDiv) verbPatternTermDiv.textContent = '...'; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = ''; if(verbPatternFeedbackDiv) verbPatternFeedbackDiv.textContent = ''; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '--'; if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Salir del Juego"; // Resetear texto botón if(verbPatternCorrectSpan) verbPatternCorrectSpan.textContent = '0'; if(verbPatternIncorrectSpan) verbPatternIncorrectSpan.textContent = '0'; if(verbPatternQCountSpan) verbPatternQCountSpan.textContent = '0'; if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = '0'; userCanAnswer = false; }
     function initializeVerbPatternGame() { console.log("Initializing Verb Patterns Game..."); verbPatternTimePerQuestion = parseInt(verbPatternTimeSelect.value, 10); verbPatternCorrectScore = 0; verbPatternIncorrectScore = 0; currentPatternIndex = -1; if (typeof verbPatternData !== 'undefined' && verbPatternData.length > 0) { currentVerbPatterns = shuffleArray([...verbPatternData]); verbPatternQTotalSpan.textContent = currentVerbPatterns.length; } else { console.error("VP Game: No se pudieron cargar los datos."); verbPatternQTotalSpan.textContent = '0'; currentVerbPatterns = []; } updateVerbPatternScores(); verbPatternQuitBtn.textContent = "Salir del Juego"; showScreen('verb-pattern-game'); if (currentVerbPatterns.length > 0) { displayNextVerbPatternQuestion(); } else { verbPatternTermDiv.textContent = "Error al cargar datos"; verbPatternAnswerButtons.forEach(button => button.disabled = true); } }


    // --- Event Listeners Globales ---

    // 1. Botones de Selección de Juego
    const selectMatchingBtn = document.getElementById('select-matching-btn');
    if (selectMatchingBtn) selectMatchingBtn.addEventListener('click', () => showScreen('matching-setup'));

    const selectFillBlanksBtn = document.getElementById('select-fill-blanks-btn');
    if (selectFillBlanksBtn) selectFillBlanksBtn.addEventListener('click', () => showScreen('fill-blanks-setup'));

    const selectVerbPatternBtn = document.getElementById('select-verb-pattern-btn');
    if (selectVerbPatternBtn) selectVerbPatternBtn.addEventListener('click', () => showScreen('verb-pattern-setup'));

    // NUEVOS: Listeners para botones de juegos importados
    const selectVerbsGameBtn = document.getElementById('select-verbs-game-btn');
    if (selectVerbsGameBtn) selectVerbsGameBtn.addEventListener('click', () => showScreen('verbs'));
    else console.error("Botón '#select-verbs-game-btn' no encontrado.");

    const selectTraduccionGameBtn = document.getElementById('select-traduccion-game-btn');
    if (selectTraduccionGameBtn) selectTraduccionGameBtn.addEventListener('click', () => showScreen('traduccion'));
    else console.error("Botón '#select-traduccion-game-btn' no encontrado.");


    // 2. Botones "Volver a Selección" (Usando delegación o querySelectorAll)
    backToSelectionButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log(`Botón 'Volver' presionado desde: ${currentGameMode}`);
            const gameToReset = currentGameMode; // Guardar modo ANTES de cambiar
            // Llamar a la función que resetea el juego específico
            resetPreviousGame(gameToReset);
            // Mostrar pantalla de selección DESPUÉS de resetear
            showScreen('selection');
        });
    });

    // 3. Listeners para iniciar los juegos ORIGINALES (desde sus setups)
    if (startMatchingBtn) startMatchingBtn.addEventListener('click', initializeMatchingGame);
    if (startFillBlanksBtn) startFillBlanksBtn.addEventListener('click', initializeFillBlanksGame);
    if (startVerbPatternBtn) startVerbPatternBtn.addEventListener('click', initializeVerbPatternGame);

    // 4. Listeners para acciones DENTRO de los juegos ORIGINALES
    // Matching
    if (giveUpBtn) giveUpBtn.addEventListener('click', () => showMatchingResults(false));
    if (playAgainMatchingBtn) playAgainMatchingBtn.addEventListener('click', () => {
        if (resultsOverlay) resultsOverlay.classList.add('hidden');
        showScreen('matching-setup'); // Volver al setup para reconfigurar
    });
    if (restartMatchingBtn) restartMatchingBtn.addEventListener('click', () => {
        if (resultsOverlay) resultsOverlay.classList.add('hidden');
        resetMatchingGame(false); // Resetear estado
        initializeMatchingGame(); // Reiniciar inmediatamente con misma config
    });

    // Fill Blanks
    if (checkAnswersBtn) checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    if (restartFillBlanksBtn) restartFillBlanksBtn.addEventListener('click', () => {
         resetFillBlanksGame(false);
         initializeFillBlanksGame(); // Reiniciar inmediatamente
    });

    // Verb Patterns (El botón Quit/Salir ya es manejado por .back-to-selection)
    // Listener para botones de respuesta (ya estaba en el código original)
    if (verbPatternOptionsDiv) {
        verbPatternOptionsDiv.addEventListener('click', (event) => {
             // Asegurarse que solo se active si el juego VP está activo
             if ((currentGameMode === 'verb-pattern' || currentGameMode === 'verb-pattern-game') &&
                 event.target.classList.contains('answer-button') &&
                 !event.target.disabled && userCanAnswer)
             {
                 handleVerbPatternAnswer(event);
             }
        });
    }


    // --- Inicialización General de la Aplicación ---
    console.log("Aplicación lista. Mostrando selección inicial.");
    showScreen('selection'); // Empezar mostrando la pantalla de selección

}); // Fin DOMContentLoaded
