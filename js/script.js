// ===========================================================
// js/script.js (PRINCIPAL - ORQUESTADOR DE JUEGOS - v1.1)
// Maneja la selección de juegos, visibilidad y control
// de los módulos de juego específicos.
// v1.1: Revisiones en lógica SortableJS para Matching Game.
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {
    'use strict'; // Habilitar modo estricto

    // --- Comprobación Inicial de Datos (Juegos Originales) ---
    let dataError = false;
    if (typeof conectoresOriginal === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: 'conectoresOriginal' no definida (connectors.js). Juegos de Conectores podrían fallar.");
        dataError = true;
    }
    if (typeof verbPatternData === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: 'verbPatternData' no definida (verbPatterns.js). Juego de Patrones Verbales podría fallar.");
        dataError = true;
    }
    if (typeof Sortable === 'undefined') {
        console.warn("SCRIPT PRINCIPAL ADVERTENCIA: Librería SortableJS no encontrada. El juego de Emparejar Conectores no funcionará correctamente.");
        // No es un error crítico para toda la app
    } else {
        console.log("SortableJS cargado correctamente."); // Confirmar carga
    }

    if (dataError) {
        // alert("Advertencia: No se pudieron cargar los datos para algunos juegos. Revisa la consola.");
    }
     if (typeof VerbsGame === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: Módulo 'VerbsGame' no encontrado (script_verbs.js). Juego de Verbos no funcionará.");
     }
     if (typeof TraduccionGame === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: Módulo 'TraduccionGame' no encontrado (script_traduccion.js). Juego de Vocabulario no funcionará.");
     }


    // --- Variables Globales del Orquestador ---
    let currentGameMode = null;
    let timerInterval = null;
    let timeLeft = 0;

    // --- Variables Específicas de Juegos Originales ---
    // Matching Game
    let scoreMatching = 0; // Usar nombre específico
    let sortableInstance = null;
    // Fill Blanks Game
    let currentConnectorsFill = [];
    let scoreFillBlanks = 0;
    let fillBlanksIncorrectScore = 0;
    let fillBlanksFinalized = false;
    let translationDirection = 'en-es';
    // Verb Patterns Game
    let currentVerbPatterns = [];
    let currentPatternIndex = -1;
    let scoreVerbPattern = 0;
    let verbPatternIncorrectScore = 0;
    let verbPatternTimePerQuestion = 15;
    let verbPatternQuestionTimer = null;
    let verbPatternQuestionTimeLeft = 0;
    let userCanAnswerVerbPattern = false;


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

    // --- Elementos DOM Juego Emparejar (Matching) ---
    const matchingSetupDiv = document.getElementById('matching-setup');
    const matchingGameDiv = document.getElementById('matching-game');
    const matchingTimeSelect = document.getElementById('matching-time-select');
    const startMatchingBtn = document.getElementById('start-matching-btn');
    const wordArea = document.getElementById('word-area'); // Contenedor pills
    const currentScoreSpan = document.getElementById('current-score');
    const totalPairsSpan = document.getElementById('total-pairs');
    const matchingTimerSpan = document.getElementById('time-left');
    const giveUpBtn = document.getElementById('give-up-btn');
    const restartMatchingBtn = document.getElementById('restart-matching-btn');
    const resultsOverlay = document.getElementById('results-overlay');
    const correctPairsList = document.getElementById('correct-pairs-list');
    const playAgainMatchingBtn = document.getElementById('play-again-matching-btn');

    // --- (Resto de selectores DOM para otros juegos - sin cambios) ---
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

     // Validar que todos los contenedores principales existen
     const containers = [gameSelectionDiv, matchingContainer, fillBlanksContainer, verbPatternContainer, verbsGameContainer, traduccionGameContainer, mainTitle];
     if (containers.some(el => !el)) {
         console.error("SCRIPT PRINCIPAL ERROR CRÍTICO: Falta uno o más contenedores principales o el título. La aplicación no puede continuar.");
         document.body.innerHTML = '<h1 style="color:red; text-align:center; margin-top: 50px;">Error Crítico: Faltan elementos HTML esenciales.</h1>';
         return; // Detener ejecución
     }


    // --- Funciones de Utilidad (Sin cambios) ---
    function shuffleArray(array) { const shuffled = [...array]; for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; } return shuffled; }
    function formatTime(seconds) { const minutes = Math.floor(seconds / 60); const remainingSeconds = seconds % 60; return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`; }

    // --- Función de Control de Visibilidad (Orquestador - Sin cambios) ---
    function showScreen(screenId) { /* ... (código original sin cambios) ... */ console.log(`Navegando a pantalla: ${screenId}`); gameSelectionDiv.classList.add('hidden'); matchingContainer.classList.add('hidden'); fillBlanksContainer.classList.add('hidden'); verbPatternContainer.classList.add('hidden'); verbsGameContainer.classList.add('hidden'); traduccionGameContainer.classList.add('hidden'); if(matchingSetupDiv) matchingSetupDiv.classList.add('hidden'); if(matchingGameDiv) matchingGameDiv.classList.add('hidden'); if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.add('hidden'); if(fillBlanksGameDiv) fillBlanksGameDiv.classList.add('hidden'); if(verbPatternSetupDiv) verbPatternSetupDiv.classList.add('hidden'); if(verbPatternGameDiv) verbPatternGameDiv.classList.add('hidden'); if(resultsOverlay) resultsOverlay.classList.add('hidden'); let titleText = "Selección de Juego"; let containerToShow = null; switch (screenId) { case 'selection': containerToShow = gameSelectionDiv; titleText = "Selección de Juego"; break; case 'matching-setup': containerToShow = matchingContainer; if(matchingSetupDiv) matchingSetupDiv.classList.remove('hidden'); titleText = "Emparejar Conectores"; break; case 'fill-blanks-setup': containerToShow = fillBlanksContainer; if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.remove('hidden'); titleText = "Rellenar Conectores"; break; case 'verb-pattern-setup': containerToShow = verbPatternContainer; if(verbPatternSetupDiv) verbPatternSetupDiv.classList.remove('hidden'); titleText = "Gerundios e Infinitivos"; break; case 'matching-game': containerToShow = matchingContainer; if(matchingGameDiv) matchingGameDiv.classList.remove('hidden'); titleText = "Emparejar Conectores"; break; case 'fill-blanks-game': containerToShow = fillBlanksContainer; if(fillBlanksGameDiv) fillBlanksGameDiv.classList.remove('hidden'); titleText = "Rellenar Conectores"; break; case 'verb-pattern-game': containerToShow = verbPatternContainer; if(verbPatternGameDiv) verbPatternGameDiv.classList.remove('hidden'); titleText = "Gerundios e Infinitivos"; break; case 'verbs': containerToShow = verbsGameContainer; titleText = "Práctica de Verbos"; if (typeof VerbsGame !== 'undefined' && VerbsGame.init) { VerbsGame.init(verbsGameContainer); } else { console.error("Intento de iniciar VerbsGame, pero el módulo o init no están definidos."); verbsGameContainer.innerHTML = "<p class='error-message'>Error al cargar el juego de Verbos.</p>"; verbsGameContainer.classList.remove('hidden'); containerToShow = null; } break; case 'traduccion': containerToShow = traduccionGameContainer; titleText = "Práctica de Vocabulario"; if (typeof TraduccionGame !== 'undefined' && TraduccionGame.init) { TraduccionGame.init(traduccionGameContainer); } else { console.error("Intento de iniciar TraduccionGame, pero el módulo o init no están definidos."); traduccionGameContainer.innerHTML = "<p class='error-message'>Error al cargar el juego de Vocabulario.</p>"; traduccionGameContainer.classList.remove('hidden'); containerToShow = null; } break; default: console.warn("showScreen llamado con ID de pantalla desconocido:", screenId); containerToShow = gameSelectionDiv; screenId = 'selection'; } if (containerToShow) { containerToShow.classList.remove('hidden'); } else if (screenId !== 'verbs' && screenId !== 'traduccion') { console.error(`Contenedor para screenId '${screenId}' no encontrado.`); gameSelectionDiv.classList.remove('hidden'); screenId = 'selection'; } if(mainTitle) mainTitle.textContent = titleText; currentGameMode = screenId; window.scrollTo({ top: 0, behavior: 'smooth' }); }

     // --- Función para Resetear Juego Anterior (Sin cambios) ---
     function resetPreviousGame(gameModeToReset) { /* ... (código original sin cambios) ... */ console.log(`Intentando resetear juego: ${gameModeToReset}`); stopTimer(); stopQuestionTimer(); switch (gameModeToReset) { case 'matching': case 'matching-setup': case 'matching-game': resetMatchingGame(true); break; case 'fill-blanks': case 'fill-blanks-setup': case 'fill-blanks-game': resetFillBlanksGame(true); break; case 'verb-pattern': case 'verb-pattern-setup': case 'verb-pattern-game': resetVerbPatternGame(true); break; case 'verbs': if (typeof VerbsGame !== 'undefined' && VerbsGame.reset) { console.log("Llamando a VerbsGame.reset()"); VerbsGame.reset(); } else { console.warn("No se pudo resetear VerbsGame: Módulo o reset() no definidos."); } break; case 'traduccion': if (typeof TraduccionGame !== 'undefined' && TraduccionGame.reset) { console.log("Llamando a TraduccionGame.reset()"); TraduccionGame.reset(); } else { console.warn("No se pudo resetear TraduccionGame: Módulo o reset() no definidos."); } break; case 'selection': break; default: console.warn(`Intento de resetear un modo de juego desconocido: ${gameModeToReset}`); } console.log(`Reseteo completado para ${gameModeToReset}`); }

    // --- Funciones del Temporizador General (Sin cambios) ---
    function updateTimerDisplay() { /* ... (código original sin cambios) ... */ const formattedTime = formatTime(timeLeft); if (currentGameMode === 'matching' || currentGameMode === 'matching-game') { if(matchingTimerSpan) matchingTimerSpan.textContent = formattedTime; } else if (currentGameMode === 'fill-blanks' || currentGameMode === 'fill-blanks-game') { if(fillBlanksTimerSpan) fillBlanksTimerSpan.textContent = formattedTime; } }
    function startTimer(durationSeconds) { /* ... (código original sin cambios) ... */ stopTimer(); timeLeft = durationSeconds; updateTimerDisplay(); timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); if (timeLeft <= 0) { handleTimeUp(); } }, 1000); }
    function stopTimer() { /* ... (código original sin cambios) ... */ clearInterval(timerInterval); timerInterval = null; }
    function handleTimeUp() { /* ... (código original sin cambios) ... */ console.log("Temporizador General: ¡Tiempo agotado!"); stopTimer(); if (currentGameMode === 'matching' || currentGameMode === 'matching-game') { showMatchingResults(false); } else if (currentGameMode === 'fill-blanks' || currentGameMode === 'fill-blanks-game') { if (!fillBlanksFinalized) { finalizeFillBlanksGame(); } } }


    // ===========================================
    // === LÓGICA JUEGO EMPAREJAR (MATCHING) =====
    // ===========================================
    /**
     * Comprueba si dos elementos 'pill' son un par correcto.
     * @param {HTMLElement} p1 - Primera píldora.
     * @param {HTMLElement} p2 - Segunda píldora.
     * @returns {boolean} - True si son un par correcto y válido.
     */
    function checkMatch(p1, p2) {
        // Validaciones iniciales
        if (!p1 || !p2 || !p1.dataset || !p2.dataset || !p1.dataset.id || !p2.dataset.id) {
            // console.log("checkMatch: Elemento(s) inválido(s) o sin dataset ID.");
            return false;
        }
        // Ignorar si alguno ya está emparejado o escondido
        if (p1.classList.contains('correct-match') || p2.classList.contains('correct-match') || p1.style.display === 'none' || p2.style.display === 'none') {
            // console.log("checkMatch: Uno o ambos ya están emparejados/ocultos.");
            return false;
        }

        const id1 = p1.dataset.id;
        const lang1 = p1.dataset.lang;
        const id2 = p2.dataset.id;
        const lang2 = p2.dataset.lang;

        // Deben tener el mismo ID y diferente idioma
        const isMatch = (id1 === id2 && lang1 !== lang2);
        // console.log(`checkMatch: ${p1.textContent} (${id1}, ${lang1}) vs ${p2.textContent} (${id2}, ${lang2}) -> ${isMatch}`);
        return isMatch;
    }

    /** Aplica estilos y lógica para un par correcto */
    function applyCorrectMatch(p1, p2) {
        console.log("MATCH CORRECTO:", p1.textContent, "&", p2.textContent);
        p1.classList.add('correct-match');
        p2.classList.add('correct-match');
        // Deshabilitar interacción inmediatamente
        p1.style.pointerEvents = 'none';
        p2.style.pointerEvents = 'none';

        // Ocultar después de una pequeña pausa para ver la animación
        setTimeout(() => {
            p1.style.display = 'none';
            p2.style.display = 'none';
            scoreMatching++; // Incrementar score específico
            if(currentScoreSpan) currentScoreSpan.textContent = scoreMatching;

            // Comprobar si se completaron todas las parejas
            const remaining = wordArea ? wordArea.querySelectorAll('.word-pill:not([style*="display: none"])').length : 0;
            if (remaining === 0) {
                console.log("Matching: ¡Todas las parejas encontradas!");
                stopTimer(); // Detener tiempo
                setTimeout(() => showMatchingResults(true), 300); // Mostrar resultados como "ganado"
            }
        }, 600); // Aumentar tiempo para que se vea el verde antes de ocultar
    }

    /** Aplica feedback visual para un intento incorrecto */
    function applyIncorrectMatchFeedback(p) {
        if (!p || p.classList.contains('correct-match') || p.style.display === 'none') return;
        console.log("MATCH INCORRECTO para:", p.textContent);
        p.classList.add('incorrect-match'); // Añadir clase para animación shake (CSS)
        // Quitar la clase después de la animación
        setTimeout(() => {
            if (p) p.classList.remove('incorrect-match');
        }, 500); // Duración debe coincidir con animación CSS
    }

    /** Renderiza las píldoras en el área de juego e inicializa SortableJS */
    function renderMatchingWords() {
        if (!wordArea || !currentScoreSpan || !totalPairsSpan || typeof conectoresOriginal === 'undefined') {
            console.error("Matching Error en renderMatchingWords: Faltan elementos DOM o datos 'conectoresOriginal'.");
            if(wordArea) wordArea.innerHTML = "<p class='error-message'>Error al cargar palabras.</p>";
            return;
        }
        console.log("Renderizando palabras para Matching Game...");
        wordArea.innerHTML = ''; // Limpiar área
        const wordsToRender = [];
        const currentConnectors = shuffleArray(conectoresOriginal);
        scoreMatching = 0; // Resetear score
        currentScoreSpan.textContent = scoreMatching;
        totalPairsSpan.textContent = currentConnectors.length;

        currentConnectors.forEach(pair => {
            wordsToRender.push({ id: pair.id, lang: 'en', text: pair.en });
            wordsToRender.push({ id: pair.id, lang: 'es', text: pair.es });
        });
        shuffleArray(wordsToRender); // Barajar píldoras

        // Crear y añadir píldoras al DOM
        wordsToRender.forEach(word => {
            const pill = document.createElement('div');
            pill.classList.add('word-pill', `lang-${word.lang}`);
            pill.textContent = word.text;
            pill.dataset.id = word.id; // ID para emparejar
            pill.dataset.lang = word.lang; // Idioma
            wordArea.appendChild(pill);
        });
        console.log(`${wordsToRender.length} píldoras renderizadas.`);

        // --- Inicializar SortableJS ---
        if (sortableInstance) sortableInstance.destroy(); // Destruir instancia anterior
        if (typeof Sortable !== 'undefined') {
            console.log("Inicializando SortableJS en #word-area");
            try {
                sortableInstance = Sortable.create(wordArea, {
                    animation: 150, // Animación suave al mover
                    ghostClass: 'sortable-ghost', // Clase para el placeholder fantasma
                    chosenClass: 'sortable-chosen', // Clase para el elemento arrastrado
                    dragClass: 'sortable-drag',   // Clase mientras se arrastra
                    forceFallback: true,       // Mejora compatibilidad táctil/navegadores
                    onEnd: function (evt) {    // Callback al soltar un elemento
                        console.log("SortableJS onEnd event fired."); // DEBUG
                        const movedItem = evt.item; // El elemento que se movió
                        const oldIndex = evt.oldIndex;
                        const newIndex = evt.newIndex;

                        // Ignorar si el juego no está en curso o ya mostró resultados
                        if (currentGameMode !== 'matching-game' || resultsOverlay?.classList.contains('hidden') === false) {
                             console.log("onEnd: Ignorando evento (juego no activo o resultados visibles).");
                             // Podríamos intentar revertir el movimiento si es necesario, pero Sortable suele manejarlo
                             return;
                        }
                        if (!timerInterval && timeLeft <= 0) { // Doble check por si el timer se paró justo antes
                            console.log("onEnd: Ignorando evento (tiempo agotado).");
                            return;
                        }


                        // Encontrar vecinos DESPUÉS de que Sortable actualice el DOM
                        const prevSibling = movedItem.previousElementSibling;
                        const nextSibling = movedItem.nextElementSibling;
                        let matchFound = false;
                        let targetPill = null;

                        console.log(`Elemento movido: ${movedItem.textContent}`);
                        if (prevSibling) console.log(`Vecino anterior: ${prevSibling.textContent}`); else console.log("Sin vecino anterior.");
                        if (nextSibling) console.log(`Vecino siguiente: ${nextSibling.textContent}`); else console.log("Sin vecino siguiente.");

                        // Comprobar match con vecino anterior (si existe y es visible)
                        if (prevSibling && prevSibling.style.display !== 'none' && checkMatch(movedItem, prevSibling)) {
                            matchFound = true; targetPill = prevSibling;
                            console.log("Match encontrado con vecino anterior.");
                        }
                        // Comprobar match con vecino siguiente (si no hubo match antes y existe/es visible)
                        if (!matchFound && nextSibling && nextSibling.style.display !== 'none' && checkMatch(movedItem, nextSibling)) {
                            matchFound = true; targetPill = nextSibling;
                            console.log("Match encontrado con vecino siguiente.");
                        }

                        if (matchFound && targetPill) {
                            applyCorrectMatch(movedItem, targetPill); // Aplicar match correcto
                        } else {
                            console.log("No se encontró match con vecinos inmediatos.");
                            applyIncorrectMatchFeedback(movedItem); // Aplicar feedback incorrecto
                        }
                    }
                });
                console.log("SortableJS inicializado con éxito.");
            } catch (error) {
                 console.error("Error al inicializar SortableJS:", error);
                 wordArea.innerHTML = "<p class='error-message'>Error al iniciar la funcionalidad de arrastrar.</p>";
            }
        } else {
            console.warn("SortableJS no está definido. El juego de emparejar será solo visual (no interactivo).");
            wordArea.innerHTML += "<p style='color:orange; text-align:center;'>Advertencia: La función de arrastrar no está disponible.</p>";
        }
    }

    /** Muestra el overlay de resultados del juego de Matching */
    function showMatchingResults(won) { /* ... (código original sin cambios, asegurando refs DOM) ... */ stopTimer(); if (sortableInstance) sortableInstance.option('disabled', true); if (!resultsOverlay || !correctPairsList) return; correctPairsList.innerHTML = ''; if (typeof conectoresOriginal !== 'undefined') { conectoresOriginal.forEach(pair => { const div = document.createElement('div'); div.textContent = `${pair.en} = ${pair.es}`; correctPairsList.appendChild(div); }); } let resultTitle = "Resultados"; if (won) resultTitle = "¡Felicidades, todas correctas!"; else if (timeLeft <= 0) resultTitle = "¡Tiempo Agotado!"; else resultTitle = "Te has rendido"; const titleElement = resultsOverlay.querySelector('h2'); if(titleElement) titleElement.textContent = resultTitle; resultsOverlay.classList.remove('hidden'); if(giveUpBtn) giveUpBtn.disabled = true; if(restartMatchingBtn) restartMatchingBtn.disabled = false; }

    /** Inicializa una nueva partida de Matching */
    function initializeMatchingGame() { /* ... (código original sin cambios, usa scoreMatching) ... */ scoreMatching = 0; renderMatchingWords(); const selectedMinutes = parseInt(matchingTimeSelect.value, 10); startTimer(selectedMinutes * 60); showScreen('matching-game'); if(giveUpBtn) giveUpBtn.disabled = false; if(restartMatchingBtn) restartMatchingBtn.disabled = true; if(resultsOverlay) resultsOverlay.classList.add('hidden'); if (sortableInstance) sortableInstance.option('disabled', false); }

    /** Resetea el estado del juego de Matching */
    function resetMatchingGame(goToSetup) { /* ... (código original sin cambios, usa scoreMatching) ... */ stopTimer(); if(wordArea) wordArea.innerHTML = ''; scoreMatching = 0; if(currentScoreSpan) currentScoreSpan.textContent = '0'; if(totalPairsSpan) totalPairsSpan.textContent = '0'; if(matchingTimerSpan) matchingTimerSpan.textContent = '--:--'; if(resultsOverlay) resultsOverlay.classList.add('hidden'); if(giveUpBtn) giveUpBtn.disabled = true; if(restartMatchingBtn) restartMatchingBtn.disabled = true; if (sortableInstance) { sortableInstance.destroy(); sortableInstance = null; } }

    // --- (FIN LÓGICA MATCHING) ---


    // --- Lógica Juego Rellenar (Fill Blanks) ---
    // (Funciones internas sin cambios funcionales, asegurando refs DOM y scores específicos)
    function renderFillBlanksTable() { /* ... (código original sin cambios, usa scoreFillBlanks) ... */ if (!fillBlanksTableBody || typeof conectoresOriginal === 'undefined') { console.error("FillBlanks Error: Falta tbody o datos 'conectoresOriginal'."); return; } fillBlanksTableBody.innerHTML = ''; currentConnectorsFill = shuffleArray(conectoresOriginal); scoreFillBlanks = 0; fillBlanksIncorrectScore = 0; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = scoreFillBlanks; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; if(fillBlanksTotalSpan) fillBlanksTotalSpan.textContent = currentConnectorsFill.length; translationDirection = translationDirectionSelect.value; fillBlanksFinalized = false; currentConnectorsFill.forEach((pair, index) => { const row = fillBlanksTableBody.insertRow(); row.dataset.id = pair.id; const sourceCell = row.insertCell(); sourceCell.textContent = (translationDirection === 'en-es') ? pair.en : pair.es; const inputCell = row.insertCell(); const input = document.createElement('input'); input.type = 'text'; input.placeholder = (translationDirection === 'en-es') ? 'Escribe en Español...' : 'Escribe en Inglés...'; input.dataset.id = pair.id; input.dataset.index = index; input.disabled = false; input.addEventListener('blur', handleFillBlanksInputBlur); inputCell.appendChild(input); const feedbackCell = row.insertCell(); feedbackCell.className = 'feedback'; feedbackCell.textContent = '-'; }); }
    function checkAnswerFillBlanks(userInput, correctAnswer) { /* ... (código original sin cambios) ... */ const normalizedInput = userInput.trim().toLowerCase(); if (!normalizedInput) return false; const correctOptions = correctAnswer.toLowerCase().split(/[,/]/).map(opt => opt.trim()).filter(opt => opt.length > 0); if (correctOptions.length === 0) return false; const normalizeForCompare = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); const normalizedInputNoAccents = normalizeForCompare(normalizedInput); const correctOptionsNoAccents = correctOptions.map(normalizeForCompare); return correctOptions.includes(normalizedInput) || correctOptionsNoAccents.includes(normalizedInputNoAccents); }
    function handleFillBlanksInputBlur(event) { /* ... (código original sin cambios) ... */ if (!fillBlanksFinalized) checkSingleAnswerAndUpdate(event.target); }
    function checkSingleAnswerAndUpdate(inputElement) { /* ... (código original sin cambios, usa scoreFillBlanks) ... */ const row = inputElement.closest('tr'); if (!row) return; const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal.find(p => p.id == id); if (!connectorPair || !feedbackCell) return; const userAnswer = inputElement.value; const correctAnswer = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrectNow = checkAnswerFillBlanks(userAnswer, correctAnswer); const isIncorrectNow = !isCorrectNow && userAnswer.trim() !== ''; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrectNow) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); } else if (isIncorrectNow) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); } else { feedbackCell.textContent = '-'; } if (!feedbackCell.classList.contains('feedback')) feedbackCell.classList.add('feedback'); const currentTotalCorrect = fillBlanksTableBody ? fillBlanksTableBody.querySelectorAll('td.feedback.correct').length : 0; const currentTotalIncorrect = fillBlanksTableBody ? fillBlanksTableBody.querySelectorAll('td.feedback.incorrect').length : 0; scoreFillBlanks = currentTotalCorrect; fillBlanksIncorrectScore = currentTotalIncorrect; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = scoreFillBlanks; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; }
    function finalizeFillBlanksGame() { /* ... (código original sin cambios, usa scoreFillBlanks) ... */ if (fillBlanksFinalized) return; fillBlanksFinalized = true; stopTimer(); console.log("Finalizando Fill Blanks..."); let finalCorrect = 0; let finalIncorrect = 0; const rows = fillBlanksTableBody ? fillBlanksTableBody.querySelectorAll('tr') : []; if (rows.length === 0) { if(checkAnswersBtn) checkAnswersBtn.disabled = true; return; } rows.forEach((row) => { const input = row.querySelector('input[type="text"]'); const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal.find(p => p.id == id); if (!input || !feedbackCell || !connectorPair) return; const userAnswer = input.value; const correctAnswerString = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrect = checkAnswerFillBlanks(userAnswer, correctAnswerString); const isIncorrect = !isCorrect && userAnswer.trim() !== ''; input.value = correctAnswerString; input.disabled = true; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrect) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); finalCorrect++; } else if (isIncorrect) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); finalIncorrect++; } else { feedbackCell.textContent = '-'; } if (!feedbackCell.classList.contains('feedback')) feedbackCell.classList.add('feedback'); }); scoreFillBlanks = finalCorrect; fillBlanksIncorrectScore = finalIncorrect; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = scoreFillBlanks; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; if(checkAnswersBtn) checkAnswersBtn.disabled = true; if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); console.log("Fill Blanks Finalizado."); }
    function initializeFillBlanksGame() { /* ... (código original sin cambios, usa scoreFillBlanks) ... */ scoreFillBlanks = 0; fillBlanksIncorrectScore = 0; fillBlanksFinalized = false; renderFillBlanksTable(); const selectedMinutes = parseInt(fillBlanksTimeSelect.value, 10); startTimer(selectedMinutes * 60); showScreen('fill-blanks-game'); if(checkAnswersBtn) checkAnswersBtn.disabled = false; if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = false; }
    function resetFillBlanksGame(goToSetup) { /* ... (código original sin cambios, usa scoreFillBlanks) ... */ stopTimer(); if(fillBlanksTableBody) fillBlanksTableBody.innerHTML = ''; scoreFillBlanks = 0; fillBlanksIncorrectScore = 0; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = '0'; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = '0'; if(fillBlanksTotalSpan) fillBlanksTotalSpan.textContent = '0'; if(fillBlanksTimerSpan) fillBlanksTimerSpan.textContent = '--:--'; if(checkAnswersBtn) checkAnswersBtn.disabled = true; if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = true; fillBlanksFinalized = false; }
    // --- (FIN LÓGICA FILL BLANKS) ---


    // --- Lógica Juego Gerundios/Infinitivos (Verb Patterns) ---
    // (Funciones internas sin cambios funcionales, asegurando refs DOM y scores específicos)
    function updateVerbPatternScores() { /* ... (código original sin cambios, usa scoreVerbPattern) ... */ if(verbPatternCorrectSpan) verbPatternCorrectSpan.textContent = scoreVerbPattern; if(verbPatternIncorrectSpan) verbPatternIncorrectSpan.textContent = verbPatternIncorrectScore; if(verbPatternQCountSpan) verbPatternQCountSpan.textContent = Math.max(0, currentPatternIndex + 1); }
    function stopQuestionTimer() { /* ... (código original sin cambios) ... */ clearInterval(verbPatternQuestionTimer); verbPatternQuestionTimer = null; }
    function startQuestionTimer() { /* ... (código original sin cambios) ... */ stopQuestionTimer(); verbPatternQuestionTimeLeft = verbPatternTimePerQuestion; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; userCanAnswerVerbPattern = true; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = false); if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } verbPatternQuestionTimer = setInterval(() => { verbPatternQuestionTimeLeft--; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; if (verbPatternQuestionTimeLeft <= 0) { handleQuestionTimeout(); } }, 1000); }
    function handleQuestionTimeout() { /* ... (código original sin cambios) ... */ console.log("VerbPattern: Tiempo Agotado!"); stopQuestionTimer(); userCanAnswerVerbPattern = false; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = true); verbPatternIncorrectScore++; updateVerbPatternScores(); if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = "¡Tiempo agotado! (Error)"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; } const currentPattern = currentVerbPatterns?.[currentPatternIndex]; if(currentPattern) showCorrectAnswerFeedback(currentPattern.category); setTimeout(displayNextVerbPatternQuestion, 2500); }
    function showCorrectAnswerFeedback(correctCategory) { /* ... (código original sin cambios) ... */ if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => { button.style.border = ''; if(button.dataset.answer === correctCategory) button.style.border = '3px solid green'; }); }
    function handleVerbPatternAnswer(event) { /* ... (código original sin cambios, usa scoreVerbPattern) ... */ if (!userCanAnswerVerbPattern) return; stopQuestionTimer(); userCanAnswerVerbPattern = false; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => { button.disabled = true; button.style.border = ''; }); const selectedButton = event.target; const selectedAnswer = selectedButton.dataset.answer; const currentPattern = currentVerbPatterns?.[currentPatternIndex]; if (!currentPattern) return; const correctAnswer = currentPattern.category; let isCorrect = selectedAnswer === correctAnswer; if (isCorrect) { scoreVerbPattern++; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = "¡Correcto!"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback correct'; } selectedButton.style.border = '3px solid green'; } else { verbPatternIncorrectScore++; const categoryMap = { 'gerund': 'Gerundio (-ing)', 'infinitive_to': 'Infinitivo (con TO)', 'infinitive_no_to': 'Infinitivo (sin TO)', 'both': 'Ambos' }; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = `Incorrecto. Era: ${categoryMap[correctAnswer] || correctAnswer}`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; } selectedButton.style.border = '3px solid red'; showCorrectAnswerFeedback(correctAnswer); } updateVerbPatternScores(); setTimeout(displayNextVerbPatternQuestion, isCorrect ? 1200 : 2500); }
    function displayNextVerbPatternQuestion() { /* ... (código original sin cambios) ... */ currentPatternIndex++; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => { button.disabled = true; button.style.border = ''; }); if (currentPatternIndex < currentVerbPatterns.length) { const pattern = currentVerbPatterns[currentPatternIndex]; if(verbPatternTermDiv) verbPatternTermDiv.textContent = pattern.term; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = pattern.explanation || ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } updateVerbPatternScores(); startQuestionTimer(); } else { console.log("VerbPattern: Juego Terminado!"); if(verbPatternTermDiv) verbPatternTermDiv.textContent = "¡Juego Terminado!"; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = `Resultado Final: ${scoreVerbPattern} Aciertos, ${verbPatternIncorrectScore} Errores.`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '-'; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = true); if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Volver a Selección"; } }
    function resetVerbPatternGame(goToSetup) { /* ... (código original sin cambios, usa scoreVerbPattern) ... */ stopQuestionTimer(); scoreVerbPattern = 0; verbPatternIncorrectScore = 0; currentPatternIndex = -1; if(verbPatternTermDiv) verbPatternTermDiv.textContent = '...'; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = ''; if(verbPatternFeedbackDiv) verbPatternFeedbackDiv.textContent = ''; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '--'; if(verbPatternCorrectSpan) verbPatternCorrectSpan.textContent = '0'; if(verbPatternIncorrectSpan) verbPatternIncorrectSpan.textContent = '0'; if(verbPatternQCountSpan) verbPatternQCountSpan.textContent = '0'; if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = '0'; if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Salir del Juego"; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(b => { b.disabled = true; b.style.border = ''; }); }
    function initializeVerbPatternGame() { /* ... (código original sin cambios, usa scoreVerbPattern) ... */ verbPatternTimePerQuestion = parseInt(verbPatternTimeSelect.value, 10); scoreVerbPattern = 0; verbPatternIncorrectScore = 0; currentPatternIndex = -1; if (typeof verbPatternData !== 'undefined' && verbPatternData.length > 0) { currentVerbPatterns = shuffleArray(verbPatternData); if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = currentVerbPatterns.length; } else { console.error("VerbPattern Error: No se pudieron cargar los datos 'verbPatternData'."); if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = '0'; currentVerbPatterns = []; } updateVerbPatternScores(); if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Salir del Juego"; showScreen('verb-pattern-game'); if (currentVerbPatterns.length > 0) { displayNextVerbPatternQuestion(); } else { if(verbPatternTermDiv) verbPatternTermDiv.textContent = "Error al cargar datos"; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = true); } }
    // --- (FIN LÓGICA VERB PATTERNS) ---


    // --- Event Listeners (SETUP Global) ---

    // 1. Botones de Selección de Juego
    const selectMatchingBtn = document.getElementById('select-matching-btn');
    if(selectMatchingBtn) selectMatchingBtn.addEventListener('click', () => showScreen('matching-setup'));
    const selectFillBlanksBtn = document.getElementById('select-fill-blanks-btn');
    if(selectFillBlanksBtn) selectFillBlanksBtn.addEventListener('click', () => showScreen('fill-blanks-setup'));
    const selectVerbPatternBtn = document.getElementById('select-verb-pattern-btn');
    if (selectVerbPatternBtn) selectVerbPatternBtn.addEventListener('click', () => showScreen('verb-pattern-setup'));
    const selectVerbsGameBtn = document.getElementById('select-verbs-game-btn');
    if (selectVerbsGameBtn) selectVerbsGameBtn.addEventListener('click', () => showScreen('verbs'));
    else console.error("Botón 'select-verbs-game-btn' no encontrado.");
    const selectTraduccionGameBtn = document.getElementById('select-traduccion-game-btn');
    if (selectTraduccionGameBtn) selectTraduccionGameBtn.addEventListener('click', () => showScreen('traduccion'));
    else console.error("Botón 'select-traduccion-game-btn' no encontrado.");


    // 2. Botones "Volver a Selección" (Centralizado)
    // Asegurarse que el selector es correcto y los botones existen
    if (backToSelectionButtons.length > 0) {
        backToSelectionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const gameModeBeingLeft = currentGameMode; // Capturar modo antes de cambiar
                console.log(`Botón 'Volver' presionado desde: ${gameModeBeingLeft}`);
                if (gameModeBeingLeft && gameModeBeingLeft !== 'selection') {
                    resetPreviousGame(gameModeBeingLeft); // Resetear el juego actual
                }
                showScreen('selection'); // Mostrar pantalla de selección
            });
        });
    } else {
        console.warn("No se encontraron botones con la clase '.back-to-selection'.");
    }


    // 3. Listeners específicos de Inicio de cada juego original
    if(startMatchingBtn) startMatchingBtn.addEventListener('click', initializeMatchingGame);
    else console.error("Botón 'start-matching-btn' no encontrado.");
    if(startFillBlanksBtn) startFillBlanksBtn.addEventListener('click', initializeFillBlanksGame);
    else console.error("Botón 'start-fill-blanks-btn' no encontrado.");
    if(startVerbPatternBtn) startVerbPatternBtn.addEventListener('click', initializeVerbPatternGame);
    else console.error("Botón 'start-verb-pattern-btn' no encontrado.");

    // 4. Listeners para acciones DENTRO de los juegos originales
    // Matching
    if(giveUpBtn) giveUpBtn.addEventListener('click', () => showMatchingResults(false));
    if(playAgainMatchingBtn) playAgainMatchingBtn.addEventListener('click', () => {
        if(resultsOverlay) resultsOverlay.classList.add('hidden');
        resetMatchingGame(true);
        showScreen('matching-setup');
    });
    if(restartMatchingBtn) restartMatchingBtn.addEventListener('click', () => {
        if(resultsOverlay) resultsOverlay.classList.add('hidden');
        resetMatchingGame(false);
        initializeMatchingGame();
    });

    // Fill Blanks
    if(checkAnswersBtn) checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    if(restartFillBlanksBtn) restartFillBlanksBtn.addEventListener('click', () => {
         resetFillBlanksGame(false);
         initializeFillBlanksGame();
    });

    // Verb Patterns (El botón Quit/Salir usa la clase .back-to-selection y su listener)
    // Listener para botones de respuesta (DELEGACIÓN)
     if(verbPatternOptionsDiv) {
        verbPatternOptionsDiv.addEventListener('click', (event) => {
            if (event.target.classList.contains('answer-button') && !event.target.disabled && userCanAnswerVerbPattern && (currentGameMode === 'verb-pattern-game')) {
                handleVerbPatternAnswer(event);
            }
        });
     } else {
         console.error("Contenedor '#verb-pattern-options' no encontrado.");
     }


    // --- Inicialización General de la Aplicación ---
    console.log("Aplicación inicializada. Mostrando selección de juego.");
    showScreen('selection'); // Mostrar la pantalla de selección al cargar

}); // Fin DOMContentLoaded
