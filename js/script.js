// ===========================================================
// js/script.js (PRINCIPAL - ORQUESTADOR DE JUEGOS - v1.5)
// Maneja la selección de juegos, visibilidad y control
// v1.5: Simplificar showScreen, mover gestión setup/game a init/reset.
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --- Comprobación Inicial de Datos ---
    // ... (igual que v1.4) ...
    let dataError = false;
    if (typeof conectoresOriginal === 'undefined') { console.error("ERROR: 'conectoresOriginal' no definida..."); dataError = true; }
    if (typeof verbPatternData === 'undefined') { console.error("ERROR: 'verbPatternData' no definida..."); dataError = true; }
    if (typeof Sortable === 'undefined') { console.warn("ADVERTENCIA: SortableJS no encontrada..."); } else { console.log("SortableJS library found."); }
    if (typeof VerbsGame === 'undefined') { console.error("ERROR: Módulo 'VerbsGame' no encontrado...");}
    if (typeof TraduccionGame === 'undefined') { console.error("ERROR: Módulo 'TraduccionGame' no encontrado...");}

    // --- Variables Globales ---
    // ... (igual que v1.4) ...
    let currentGameMode = null; let timerInterval = null; let timeLeft = 0;
    let scoreMatching = 0; let sortableInstance = null;
    let currentConnectorsFill = []; let scoreFillBlanks = 0; let fillBlanksIncorrectScore = 0; let fillBlanksFinalized = false; let translationDirection = 'en-es';
    let currentVerbPatterns = []; let currentPatternIndex = -1; let scoreVerbPattern = 0; let verbPatternIncorrectScore = 0; let verbPatternTimePerQuestion = 15; let verbPatternQuestionTimer = null; let verbPatternQuestionTimeLeft = 0; let userCanAnswerVerbPattern = false;


    // --- Elementos del DOM ---
    // ... (igual que v1.4) ...
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


    // --- Función de Control de Visibilidad (Orquestador - SIMPLIFICADA) ---
    function showScreen(screenId) {
        console.log(`Navegando a pantalla: ${screenId}`);

        // 1. Ocultar TODOS los contenedores principales
        gameSelectionDiv.classList.add('hidden');
        matchingContainer.classList.add('hidden');
        fillBlanksContainer.classList.add('hidden');
        verbPatternContainer.classList.add('hidden');
        verbsGameContainer.classList.add('hidden');
        traduccionGameContainer.classList.add('hidden');
        // Ocultar overlay de matching por si acaso
        if(resultsOverlay) resultsOverlay.classList.add('hidden');

        // 2. Determinar título y contenedor principal a mostrar
        let titleText = "Selección de Juego";
        let containerToShow = null;
        let needsInit = false; // Flag para saber si hay que llamar a .init()

        switch (screenId) {
            case 'selection':
                containerToShow = gameSelectionDiv;
                titleText = "Selección de Juego";
                break;
            // Setup de juegos originales -> Mostrar su contenedor principal
            case 'matching-setup':
                containerToShow = matchingContainer;
                titleText = "Emparejar Conectores";
                // Asegurar que se muestra el setup y no el juego
                 if(matchingSetupDiv) matchingSetupDiv.classList.remove('hidden');
                 if(matchingGameDiv) matchingGameDiv.classList.add('hidden');
                break;
            case 'fill-blanks-setup':
                containerToShow = fillBlanksContainer;
                titleText = "Rellenar Conectores";
                 if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.remove('hidden');
                 if(fillBlanksGameDiv) fillBlanksGameDiv.classList.add('hidden');
                break;
            case 'verb-pattern-setup':
                containerToShow = verbPatternContainer;
                titleText = "Gerundios e Infinitivos";
                 if(verbPatternSetupDiv) verbPatternSetupDiv.classList.remove('hidden');
                 if(verbPatternGameDiv) verbPatternGameDiv.classList.add('hidden');
                break;
            // Juegos importados -> Mostrar su contenedor principal y marcar para init
            case 'verbs':
                containerToShow = verbsGameContainer;
                titleText = "Práctica de Verbos";
                needsInit = true; // Marcar para llamar a VerbsGame.init()
                break;
            case 'traduccion':
                containerToShow = traduccionGameContainer;
                titleText = "Práctica de Vocabulario";
                needsInit = true; // Marcar para llamar a TraduccionGame.init()
                break;
            // Pantallas de juego activas (para los originales, solo muestra el contenedor padre)
            // La lógica de mostrar/ocultar setup/game se hará en initialize...
             case 'matching-game':
                 containerToShow = matchingContainer;
                 titleText = "Emparejar Conectores";
                 break;
             case 'fill-blanks-game':
                 containerToShow = fillBlanksContainer;
                 titleText = "Rellenar Conectores";
                 break;
             case 'verb-pattern-game':
                 containerToShow = verbPatternContainer;
                 titleText = "Gerundios e Infinitivos";
                 break;
            default:
                 console.warn("showScreen ID desconocido:", screenId);
                 containerToShow = gameSelectionDiv; // Fallback a selección
                 screenId = 'selection';
        }

        // 3. Mostrar el contenedor principal correcto
        if (containerToShow) {
            containerToShow.classList.remove('hidden');
        } else {
             console.error(`Contenedor principal para '${screenId}' no encontrado.`);
             gameSelectionDiv.classList.remove('hidden'); // Mostrar selección como fallback seguro
             screenId = 'selection';
        }

        // 4. Llamar a .init() para juegos importados SI es necesario
        if (needsInit) {
            if (screenId === 'verbs') {
                if (typeof VerbsGame?.init === 'function') { VerbsGame.init(verbsGameContainer); }
                else { console.error("Error VerbsGame.init no disponible."); containerToShow.innerHTML = "<p>Error</p>"; }
            } else if (screenId === 'traduccion') {
                if (typeof TraduccionGame?.init === 'function') { TraduccionGame.init(traduccionGameContainer); }
                else { console.error("Error TraduccionGame.init no disponible."); containerToShow.innerHTML = "<p>Error</p>"; }
            }
        }

        // 5. Actualizar título y estado
        if(mainTitle) mainTitle.textContent = titleText;
        currentGameMode = screenId; // Actualizar modo actual

        // 6. Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }


     // --- Función para Resetear Juego Anterior ---
     function resetPreviousGame(gameModeToReset) {
         console.log(`Intentando resetear juego: ${gameModeToReset}`);
         stopTimer(); stopQuestionTimer();
         switch (gameModeToReset) {
             case 'matching': case 'matching-setup': case 'matching-game': resetMatchingGame(true); break; // El true indica que muestre setup
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
    function checkMatch(p1, p2) { if (!p1?.dataset?.id || !p2?.dataset?.id) return false; if (p1.classList.contains('correct-match') || p2.classList.contains('correct-match') || p1.style.display === 'none' || p2.style.display === 'none') return false; return (p1.dataset.id === p2.dataset.id && p1.dataset.lang !== p2.dataset.lang); }
    function applyCorrectMatch(p1, p2) { console.log("MATCH CORRECTO:", p1.textContent, "&", p2.textContent); p1.classList.add('correct-match'); p2.classList.add('correct-match'); p1.style.pointerEvents = 'none'; p2.style.pointerEvents = 'none'; setTimeout(() => { p1.style.display = 'none'; p2.style.display = 'none'; scoreMatching++; if(currentScoreSpan) currentScoreSpan.textContent = scoreMatching; const remaining = wordArea?.querySelectorAll('.word-pill:not([style*="display: none"])').length ?? 0; if (remaining === 0) { console.log("Matching: ¡Todas las parejas encontradas!"); stopTimer(); setTimeout(() => showMatchingResults(true), 300); } }, 600); }
    function applyIncorrectMatchFeedback(p) { if (!p || p.classList.contains('correct-match') || p.style.display === 'none') return; console.log("MATCH INCORRECTO para:", p.textContent); p.classList.add('incorrect-match'); setTimeout(() => p?.classList.remove('incorrect-match'), 500); }
    function renderMatchingWords() { /* ... (código v1.4 sin cambios internos, pero ahora confía en que showScreen muestre el contenedor) ... */ if (!wordArea || !currentScoreSpan || !totalPairsSpan || typeof conectoresOriginal === 'undefined') { console.error("Matching Error en renderMatchingWords..."); if(wordArea) wordArea.innerHTML = "..."; return; } console.log("Renderizando palabras Matching (v1.5)..."); wordArea.innerHTML = ''; const englishTerms = []; const spanishTerms = []; const currentConnectors = shuffleArray(conectoresOriginal); currentConnectors.forEach(pair => { englishTerms.push({ id: pair.id, lang: 'en', text: pair.en }); spanishTerms.push({ id: pair.id, lang: 'es', text: pair.es }); }); const wordsToRender = [...englishTerms, ...spanishTerms]; shuffleArray(wordsToRender); scoreMatching = 0; currentScoreSpan.textContent = scoreMatching; totalPairsSpan.textContent = currentConnectors.length; wordsToRender.forEach(word => { const pill = document.createElement('div'); pill.classList.add('word-pill', `lang-${word.lang}`); pill.textContent = word.text; pill.dataset.id = word.id; pill.dataset.lang = word.lang; wordArea.appendChild(pill); }); console.log(`${wordsToRender.length} píldoras renderizadas.`); if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; } console.log("Programando inicialización de SortableJS..."); setTimeout(() => { console.log("Ejecutando inicialización SortableJS..."); if (typeof Sortable !== 'undefined') { console.log("Sortable DEFINIDO. Inicializando..."); try { sortableInstance = Sortable.create(wordArea, { animation: 150, ghostClass: 'sortable-ghost', chosenClass: 'sortable-chosen', dragClass: 'sortable-drag', forceFallback: true, filter: '.correct-match', preventOnFilter: true, onStart: (evt) => console.log("DEBUG: Sortable onStart:", evt.item.textContent), onEnd: (evt) => { console.log("DEBUG: Sortable onEnd fired."); const movedItem = evt.item; if (!movedItem || currentGameMode !== 'matching-game' || resultsOverlay?.classList.contains('hidden') === false || (!timerInterval && timeLeft <= 0)) { console.log("onEnd: Ignorando."); return; } const prev = movedItem.previousElementSibling, next = movedItem.nextElementSibling; let match = false, target = null; if (prev && prev.style.display !== 'none' && checkMatch(movedItem, prev)) { match = true; target = prev; } if (!match && next && next.style.display !== 'none' && checkMatch(movedItem, next)) { match = true; target = next; } if (match && target) applyCorrectMatch(movedItem, target); else applyIncorrectMatchFeedback(movedItem); } }); console.log("SortableJS inicializado con éxito (v1.5)."); } catch (error) { console.error("Error CRÍTICO al inicializar SortableJS:", error); if(wordArea) wordArea.innerHTML += "..."; sortableInstance = null; } } else { console.error("Error FATAL: SortableJS NO DEFINIDO después de setTimeout."); if(wordArea) wordArea.innerHTML += "..."; } }, 10); }
    function showMatchingResults(won) { /* ... (código v1.4 sin cambios) ... */ }
    /** Inicializa una nueva partida de Matching - MODIFICADO **/
    function initializeMatchingGame() {
        console.log("Inicializando Matching Game...");
        scoreMatching = 0; // Resetear score
        renderMatchingWords(); // Renderizar píldoras e inicializar Sortable
        const selectedMinutes = parseInt(matchingTimeSelect.value, 10);
        startTimer(selectedMinutes * 60); // Iniciar temporizador

        // --- CAMBIO: Gestionar visibilidad setup/game aquí ---
        if(matchingSetupDiv) matchingSetupDiv.classList.add('hidden');
        if(matchingGameDiv) matchingGameDiv.classList.remove('hidden');
        showScreen('matching-game'); // Asegurar que el contenedor padre es visible y actualizar título/estado

        // Asegurar estado inicial botones juego
        if(giveUpBtn) giveUpBtn.disabled = false;
        if(restartMatchingBtn) restartMatchingBtn.disabled = true;
        if(resultsOverlay) resultsOverlay.classList.add('hidden');
        if (sortableInstance) sortableInstance.option('disabled', false); // Habilitar arrastre
    }
    /** Resetea el estado del juego de Matching - MODIFICADO **/
    function resetMatchingGame(goToSetup) {
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
        // --- CAMBIO: Mostrar setup si aplica ---
        if(goToSetup) {
             if(matchingGameDiv) matchingGameDiv.classList.add('hidden');
             if(matchingSetupDiv) matchingSetupDiv.classList.remove('hidden');
        }
    }
    // --- (FIN LÓGICA MATCHING) ---


    // --- Lógica Juego Rellenar (Fill Blanks) ---
    function renderFillBlanksTable() { /* ... (código v1.4 sin cambios) ... */ }
    function checkAnswerFillBlanks(userInput, correctAnswer) { /* ... (código v1.4 sin cambios) ... */ }
    function handleFillBlanksInputBlur(event) { /* ... (código v1.4 sin cambios) ... */ }
    function checkSingleAnswerAndUpdate(inputElement) { /* ... (código v1.4 sin cambios) ... */ }
    function finalizeFillBlanksGame() { /* ... (código v1.4 sin cambios) ... */ }
    /** Inicializa una nueva partida de Fill Blanks - MODIFICADO **/
    function initializeFillBlanksGame() {
        console.log("Inicializando Fill Blanks Game...");
        scoreFillBlanks = 0; fillBlanksIncorrectScore = 0;
        fillBlanksFinalized = false;
        renderFillBlanksTable(); // Renderizar tabla
        const selectedMinutes = parseInt(fillBlanksTimeSelect.value, 10);
        startTimer(selectedMinutes * 60); // Iniciar timer

        // --- CAMBIO: Gestionar visibilidad setup/game aquí ---
        if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.add('hidden');
        if(fillBlanksGameDiv) fillBlanksGameDiv.classList.remove('hidden');
        showScreen('fill-blanks-game'); // Asegurar contenedor padre visible y actualizar estado

        if(checkAnswersBtn) checkAnswersBtn.disabled = false;
        if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = false;
    }
    /** Resetea el estado del juego de Fill Blanks - MODIFICADO **/
    function resetFillBlanksGame(goToSetup) {
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
        // --- CAMBIO: Mostrar setup si aplica ---
        if(goToSetup) {
             if(fillBlanksGameDiv) fillBlanksGameDiv.classList.add('hidden');
             if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.remove('hidden');
        }
    }
    // --- (FIN LÓGICA FILL BLANKS) ---


    // --- Lógica Juego Gerundios/Infinitivos (Verb Patterns) ---
    function updateVerbPatternScores() { /* ... (código v1.4 sin cambios) ... */ }
    function stopQuestionTimer() { /* ... (código v1.4 sin cambios) ... */ }
    function startQuestionTimer() { /* ... (código v1.4 sin cambios) ... */ }
    function handleQuestionTimeout() { /* ... (código v1.4 sin cambios) ... */ }
    function showCorrectAnswerFeedback(correctCategory) { /* ... (código v1.4 sin cambios) ... */ }
    function handleVerbPatternAnswer(event) { /* ... (código v1.4 sin cambios) ... */ }
    function displayNextVerbPatternQuestion() { /* ... (código v1.4 sin cambios) ... */ }
    /** Resetea el estado del juego de Verb Patterns - MODIFICADO **/
    function resetVerbPatternGame(goToSetup) {
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
        // --- CAMBIO: Mostrar setup si aplica ---
        if(goToSetup) {
             if(verbPatternGameDiv) verbPatternGameDiv.classList.add('hidden');
             if(verbPatternSetupDiv) verbPatternSetupDiv.classList.remove('hidden');
        }
    }
    /** Inicializa una nueva partida de Verb Patterns - MODIFICADO **/
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

        // --- CAMBIO: Gestionar visibilidad setup/game aquí ---
        if(verbPatternSetupDiv) verbPatternSetupDiv.classList.add('hidden');
        if(verbPatternGameDiv) verbPatternGameDiv.classList.remove('hidden');
        showScreen('verb-pattern-game'); // Asegurar contenedor padre visible y actualizar estado

        if (currentVerbPatterns.length > 0) {
             displayNextVerbPatternQuestion(); // Empezar primera pregunta
        } else {
             if(verbPatternTermDiv) verbPatternTermDiv.textContent = "Error al cargar datos";
             if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = true);
        }
    }
    // --- (FIN LÓGICA VERB PATTERNS) ---


    // --- Event Listeners (SETUP Global) ---
    // (Listeners sin cambios respecto a v1.4)
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
    console.log("Aplicación inicializada (v1.5). Mostrando selección de juego.");
    showScreen('selection');

}); // Fin DOMContentLoaded
