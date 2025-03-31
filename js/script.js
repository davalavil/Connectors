// ===========================================================
// js/script.js (PRINCIPAL - ORQUESTADOR DE JUEGOS - v1.7)
// Maneja selección, visibilidad y control.
// v1.7: Aplicar barajado MÚLTIPLE a píldoras en Matching Game
//       para aumentar dificultad/dispersión percibida.
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
    function showScreen(screenId) { /* ... (código v1.6 sin cambios) ... */ console.log(`Navegando a pantalla: ${screenId}`); gameSelectionDiv.classList.add('hidden'); matchingContainer.classList.add('hidden'); fillBlanksContainer.classList.add('hidden'); verbPatternContainer.classList.add('hidden'); verbsGameContainer.classList.add('hidden'); traduccionGameContainer.classList.add('hidden'); if(matchingSetupDiv) matchingSetupDiv.classList.add('hidden'); if(matchingGameDiv) matchingGameDiv.classList.add('hidden'); if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.add('hidden'); if(fillBlanksGameDiv) fillBlanksGameDiv.classList.add('hidden'); if(verbPatternSetupDiv) verbPatternSetupDiv.classList.add('hidden'); if(verbPatternGameDiv) verbPatternGameDiv.classList.add('hidden'); if(resultsOverlay) resultsOverlay.classList.add('hidden'); let titleText = "Selección de Juego"; let needsInit = false; let containerToShow = null; switch (screenId) { case 'selection': containerToShow = gameSelectionDiv; titleText = "Selección de Juego"; break; case 'matching-setup': containerToShow = matchingContainer; if(matchingSetupDiv) matchingSetupDiv.classList.remove('hidden'); titleText = "Emparejar Conectores"; break; case 'fill-blanks-setup': containerToShow = fillBlanksContainer; if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.remove('hidden'); titleText = "Rellenar Conectores"; break; case 'verb-pattern-setup': containerToShow = verbPatternContainer; if(verbPatternSetupDiv) verbPatternSetupDiv.classList.remove('hidden'); titleText = "Gerundios e Infinitivos"; break; case 'matching-game': containerToShow = matchingContainer; if(matchingGameDiv) matchingGameDiv.classList.remove('hidden'); titleText = "Emparejar Conectores"; break; case 'fill-blanks-game': containerToShow = fillBlanksContainer; if(fillBlanksGameDiv) fillBlanksGameDiv.classList.remove('hidden'); titleText = "Rellenar Conectores"; break; case 'verb-pattern-game': containerToShow = verbPatternContainer; if(verbPatternGameDiv) verbPatternGameDiv.classList.remove('hidden'); titleText = "Gerundios e Infinitivos"; break; case 'verbs': containerToShow = verbsGameContainer; titleText = "Práctica de Verbos"; needsInit = true; break; case 'traduccion': containerToShow = traduccionGameContainer; titleText = "Práctica de Vocabulario"; needsInit = true; break; default: console.warn("showScreen ID desconocido:", screenId); containerToShow = gameSelectionDiv; screenId = 'selection'; } if (needsInit) { if (screenId === 'verbs') { if (typeof VerbsGame?.init === 'function') { VerbsGame.init(verbsGameContainer); } else { console.error("Error VerbsGame.init"); containerToShow = gameSelectionDiv; screenId = 'selection'; } } else if (screenId === 'traduccion') { if (typeof TraduccionGame?.init === 'function') { TraduccionGame.init(traduccionGameContainer); } else { console.error("Error TraduccionGame.init"); containerToShow = gameSelectionDiv; screenId = 'selection'; } } } if (containerToShow) { containerToShow.classList.remove('hidden'); } else { console.error(`Contenedor para '${screenId}' no encontrado.`); gameSelectionDiv.classList.remove('hidden'); screenId = 'selection'; } if(mainTitle) mainTitle.textContent = titleText; currentGameMode = screenId; window.scrollTo({ top: 0, behavior: 'smooth' }); }

     // --- Función para Resetear Juego Anterior ---
     function resetPreviousGame(gameModeToReset) { /* ... (código v1.6 sin cambios) ... */ console.log(`Intentando resetear juego: ${gameModeToReset}`); stopTimer(); stopQuestionTimer(); switch (gameModeToReset) { case 'matching': case 'matching-setup': case 'matching-game': resetMatchingGame(true); break; case 'fill-blanks': case 'fill-blanks-setup': case 'fill-blanks-game': resetFillBlanksGame(true); break; case 'verb-pattern': case 'verb-pattern-setup': case 'verb-pattern-game': resetVerbPatternGame(true); break; case 'verbs': if (typeof VerbsGame?.reset === 'function') { VerbsGame.reset(); } else { console.warn("VerbsGame.reset no disponible."); } break; case 'traduccion': if (typeof TraduccionGame?.reset === 'function') { TraduccionGame.reset(); } else { console.warn("TraduccionGame.reset no disponible."); } break; case 'selection': break; default: console.warn(`Intento de resetear modo desconocido: ${gameModeToReset}`); } console.log(`Reseteo completado para ${gameModeToReset}`); }

    // --- Funciones del Temporizador General ---
    function updateTimerDisplay() { /* ... (código v1.6 sin cambios) ... */ }
    function startTimer(durationSeconds) { /* ... (código v1.6 sin cambios) ... */ }
    function stopTimer() { /* ... (código v1.6 sin cambios) ... */ }
    function handleTimeUp() { /* ... (código v1.6 sin cambios) ... */ }


    // ===========================================
    // === LÓGICA JUEGO EMPAREJAR (MATCHING) =====
    // ===========================================
    function checkMatch(p1, p2) { /* ... (código v1.6 sin cambios) ... */ }
    function applyCorrectMatch(p1, p2) { /* ... (código v1.6 sin cambios) ... */ }
    function applyIncorrectMatchFeedback(p) { /* ... (código v1.6 sin cambios) ... */ }

    /** Renderiza píldoras con BARAJADO MÚLTIPLE e inicializa SortableJS **/
    function renderMatchingWords() {
        if (!wordArea || !currentScoreSpan || !totalPairsSpan || typeof conectoresOriginal === 'undefined') {
            console.error("Matching Error en renderMatchingWords..."); if(wordArea) wordArea.innerHTML = "..."; return;
        }
        console.log("Renderizando palabras Matching (v1.7 - Multi-Shuffle)...");
        wordArea.innerHTML = '';

        const englishTerms = [];
        const spanishTerms = [];
        const currentConnectors = shuffleArray(conectoresOriginal); // Barajar pares primero

        currentConnectors.forEach(pair => {
            englishTerms.push({ id: pair.id, lang: 'en', text: pair.en });
            spanishTerms.push({ id: pair.id, lang: 'es', text: pair.es });
        });

        let wordsToRender = [...englishTerms, ...spanishTerms]; // Concatenar

        // ***** CAMBIO PRINCIPAL: Barajar la lista final MÚLTIPLES VECES *****
        const shufflePasses = 5; // Número de veces que se baraja la lista final
        console.log(`Barajando la lista final ${shufflePasses} veces...`);
        for (let i = 0; i < shufflePasses; i++) {
            wordsToRender = shuffleArray(wordsToRender); // Reasignar el resultado barajado
        }
        console.log("Lista final barajada múltiples veces.");

        scoreMatching = 0;
        currentScoreSpan.textContent = scoreMatching;
        totalPairsSpan.textContent = currentConnectors.length;

        // Crear y añadir píldoras al DOM (igual que antes)
        wordsToRender.forEach(word => {
             const pill = document.createElement('div');
             pill.classList.add('word-pill', `lang-${word.lang}`);
             pill.textContent = word.text;
             pill.dataset.id = word.id;
             pill.dataset.lang = word.lang;
             wordArea.appendChild(pill);
         });
        console.log(`${wordsToRender.length} píldoras renderizadas.`);

        // Inicializar SortableJS (con setTimeout, igual que antes)
        if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; }
        console.log("Programando inicialización de SortableJS con setTimeout(..., 10)");
        setTimeout(() => {
            console.log("Ejecutando inicialización SortableJS...");
            if (typeof Sortable !== 'undefined') {
                console.log("Sortable DEFINIDO. Inicializando...");
                try {
                    sortableInstance = Sortable.create(wordArea, {
                        animation: 150, ghostClass: 'sortable-ghost', chosenClass: 'sortable-chosen',
                        dragClass: 'sortable-drag', forceFallback: true, filter: '.correct-match',
                        preventOnFilter: true,
                        onStart: (evt) => console.log("DEBUG: Sortable onStart:", evt.item.textContent),
                        onEnd: (evt) => { /* ... (lógica onEnd sin cambios) ... */ console.log("DEBUG: Sortable onEnd fired."); const movedItem = evt.item; if (!movedItem || currentGameMode !== 'matching-game' || resultsOverlay?.classList.contains('hidden') === false || (!timerInterval && timeLeft <= 0)) { console.log("onEnd: Ignorando."); return; } const prev = movedItem.previousElementSibling, next = movedItem.nextElementSibling; let match = false, target = null; if (prev && prev.style.display !== 'none' && checkMatch(movedItem, prev)) { match = true; target = prev; } if (!match && next && next.style.display !== 'none' && checkMatch(movedItem, next)) { match = true; target = next; } if (match && target) applyCorrectMatch(movedItem, target); else applyIncorrectMatchFeedback(movedItem); }
                    });
                    console.log("SortableJS inicializado con éxito (v1.7).");
                } catch (error) { console.error("Error CRÍTICO al inicializar SortableJS:", error); if(wordArea) wordArea.innerHTML += "..."; sortableInstance = null; }
            } else { console.error("Error FATAL: SortableJS NO DEFINIDO después de setTimeout."); if(wordArea) wordArea.innerHTML += "..."; }
        }, 10);
    } // Fin renderMatchingWords

    function showMatchingResults(won) { /* ... (código v1.6 sin cambios) ... */ }
    function initializeMatchingGame() { /* ... (código v1.6 sin cambios) ... */ }
    function resetMatchingGame(goToSetup) { /* ... (código v1.6 sin cambios) ... */ }
    // --- (FIN LÓGICA MATCHING) ---


    // --- Lógica Juego Rellenar (Fill Blanks) ---
    // (Funciones sin cambios respecto a v1.6)
    function renderFillBlanksTable() { /* ... */ }
    function checkAnswerFillBlanks(userInput, correctAnswer) { /* ... */ }
    function handleFillBlanksInputBlur(event) { /* ... */ }
    function checkSingleAnswerAndUpdate(inputElement) { /* ... */ }
    function finalizeFillBlanksGame() { /* ... */ }
    function initializeFillBlanksGame() { /* ... */ }
    function resetFillBlanksGame(goToSetup) { /* ... */ }
    // --- (FIN LÓGICA FILL BLANKS) ---


    // --- Lógica Juego Gerundios/Infinitivos (Verb Patterns) ---
    // (Funciones sin cambios respecto a v1.6)
    function updateVerbPatternScores() { /* ... */ }
    function stopQuestionTimer() { /* ... */ }
    function startQuestionTimer() { /* ... */ }
    function handleQuestionTimeout() { /* ... */ }
    function showCorrectAnswerFeedback(correctCategory) { /* ... */ }
    function handleVerbPatternAnswer(event) { /* ... */ }
    function displayNextVerbPatternQuestion() { /* ... */ }
    function resetVerbPatternGame(goToSetup) { /* ... */ }
    function initializeVerbPatternGame() { /* ... */ }
    // --- (FIN LÓGICA VERB PATTERNS) ---


    // --- Event Listeners (SETUP Global) ---
    // (Listeners sin cambios respecto a v1.6)
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

    // 4. Listeners Acciones DENTRO de Juegos Originales
    if(giveUpBtn) giveUpBtn.addEventListener('click', () => showMatchingResults(false));
    if(playAgainMatchingBtn) playAgainMatchingBtn.addEventListener('click', () => { if(resultsOverlay) resultsOverlay.classList.add('hidden'); resetMatchingGame(true); showScreen('matching-setup'); });
    if(restartMatchingBtn) restartMatchingBtn.addEventListener('click', () => { if(resultsOverlay) resultsOverlay.classList.add('hidden'); resetMatchingGame(false); initializeMatchingGame(); }); // Reinicia directo
    if(checkAnswersBtn) checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    if(restartFillBlanksBtn) restartFillBlanksBtn.addEventListener('click', () => { resetFillBlanksGame(false); initializeFillBlanksGame(); }); // Reinicia directo
    if(verbPatternOptionsDiv) { verbPatternOptionsDiv.addEventListener('click', (event) => { if (event.target.classList.contains('answer-button') && !event.target.disabled && userCanAnswerVerbPattern && (currentGameMode === 'verb-pattern-game')) { handleVerbPatternAnswer(event); } }); } else { console.error("Contenedor '#verb-pattern-options' no encontrado."); }

    // --- Inicialización General ---
    console.log("Aplicación inicializada (v1.7). Mostrando selección de juego.");
    showScreen('selection');

}); // Fin DOMContentLoaded
