// ===========================================================
// js/script.js (PRINCIPAL - ORQUESTADOR DE JUEGOS)
// Maneja la selección de juegos, visibilidad y control
// de los módulos de juego específicos.
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {
    'use strict'; // Habilitar modo estricto

    // --- Comprobación Inicial de Datos (Juegos Originales) ---
    let dataError = false;
    // Verificar datos para juegos originales que dependen de variables globales
    if (typeof conectoresOriginal === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: 'conectoresOriginal' no definida (connectors.js). Juegos de Conectores podrían fallar.");
        dataError = true;
    }
    if (typeof verbPatternData === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: 'verbPatternData' no definida (verbPatterns.js). Juego de Patrones Verbales podría fallar.");
        dataError = true;
    }
    // Los datos de Verbs y Traduccion son comprobados internamente por sus módulos
    if (typeof Sortable === 'undefined') {
        console.warn("SCRIPT PRINCIPAL ADVERTENCIA: Librería SortableJS no encontrada. El juego de Emparejar Conectores no funcionará correctamente.");
        // No es un error crítico para toda la app
    }

    if (dataError) {
        // Podríamos mostrar un aviso general, pero la app seguirá intentando funcionar
        // alert("Advertencia: No se pudieron cargar los datos para algunos juegos. Revisa la consola.");
    }
    // Verificar que los módulos de los juegos importados existen
     if (typeof VerbsGame === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: Módulo 'VerbsGame' no encontrado (script_verbs.js). Juego de Verbos no funcionará.");
        // Deshabilitar botón correspondiente si se desea
     }
     if (typeof TraduccionGame === 'undefined') {
        console.error("SCRIPT PRINCIPAL ERROR: Módulo 'TraduccionGame' no encontrado (script_traduccion.js). Juego de Vocabulario no funcionará.");
        // Deshabilitar botón correspondiente si se desea
     }


    // --- Variables Globales del Orquestador ---
    let currentGameMode = null; // Identificador del juego activo o 'selection'
    let timerInterval = null; // Timer general (usado por matching y fill-blanks)
    let timeLeft = 0; // Tiempo restante para timer general

    // --- Variables Específicas de Juegos Originales ---
    // (Mantenidas aquí por simplicidad, podrían moverse a sus propios módulos si crecen más)
    // Matching Game
    let scoreMatching = 0;
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
    const verbsGameContainer = document.getElementById('verbs-game-container'); // Juego Verbos
    const traduccionGameContainer = document.getElementById('traduccion-game-container'); // Juego Traducción

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


    // --- Funciones de Utilidad ---
    function shuffleArray(array) {
        // Copia superficial para no modificar el array original si viene de fuera
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }


    // --- Función de Control de Visibilidad (Orquestador) ---
    function showScreen(screenId) {
        console.log(`Navegando a pantalla: ${screenId}`); // Log de navegación

        // 1. Ocultar TODOS los contenedores principales de juego/selección
        gameSelectionDiv.classList.add('hidden');
        matchingContainer.classList.add('hidden');
        fillBlanksContainer.classList.add('hidden');
        verbPatternContainer.classList.add('hidden');
        verbsGameContainer.classList.add('hidden');
        traduccionGameContainer.classList.add('hidden');

        // 2. Ocultar secciones internas (setup/game) y overlays
        // (Se hace por seguridad, aunque los contenedores padres ya estén ocultos)
        if(matchingSetupDiv) matchingSetupDiv.classList.add('hidden');
        if(matchingGameDiv) matchingGameDiv.classList.add('hidden');
        if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.add('hidden');
        if(fillBlanksGameDiv) fillBlanksGameDiv.classList.add('hidden');
        if(verbPatternSetupDiv) verbPatternSetupDiv.classList.add('hidden');
        if(verbPatternGameDiv) verbPatternGameDiv.classList.add('hidden');
        if(resultsOverlay) resultsOverlay.classList.add('hidden'); // Overlay específico matching

        // 3. Determinar título y contenedor a mostrar
        let titleText = "Selección de Juego";
        let containerToShow = null;

        switch (screenId) {
            case 'selection':
                containerToShow = gameSelectionDiv;
                titleText = "Selección de Juego";
                break;
            // --- Juegos Originales (Mostrar Setup) ---
            case 'matching-setup':
                containerToShow = matchingContainer;
                if(matchingSetupDiv) matchingSetupDiv.classList.remove('hidden'); // Mostrar setup
                titleText = "Emparejar Conectores";
                break;
            case 'fill-blanks-setup':
                containerToShow = fillBlanksContainer;
                if(fillBlanksSetupDiv) fillBlanksSetupDiv.classList.remove('hidden');
                titleText = "Rellenar Conectores";
                break;
            case 'verb-pattern-setup':
                containerToShow = verbPatternContainer;
                if(verbPatternSetupDiv) verbPatternSetupDiv.classList.remove('hidden');
                titleText = "Gerundios e Infinitivos";
                break;
             // --- Juegos Originales (Mostrar Pantalla de Juego) ---
             // Nota: La inicialización real ocurre en funciones separadas (initialize...)
            case 'matching-game':
                containerToShow = matchingContainer;
                if(matchingGameDiv) matchingGameDiv.classList.remove('hidden'); // Mostrar juego
                titleText = "Emparejar Conectores";
                break;
            case 'fill-blanks-game':
                containerToShow = fillBlanksContainer;
                if(fillBlanksGameDiv) fillBlanksGameDiv.classList.remove('hidden');
                titleText = "Rellenar Conectores";
                break;
            case 'verb-pattern-game':
                containerToShow = verbPatternContainer;
                if(verbPatternGameDiv) verbPatternGameDiv.classList.remove('hidden');
                titleText = "Gerundios e Infinitivos";
                break;
            // --- Juegos Importados (Mostrar Contenedor e Inicializar) ---
            case 'verbs':
                containerToShow = verbsGameContainer;
                titleText = "Práctica de Verbos";
                // Llamar a init del módulo VerbsGame SI EXISTE
                if (typeof VerbsGame !== 'undefined' && VerbsGame.init) {
                    VerbsGame.init(verbsGameContainer);
                } else {
                     console.error("Intento de iniciar VerbsGame, pero el módulo o init no están definidos.");
                     verbsGameContainer.innerHTML = "<p class='error-message'>Error al cargar el juego de Verbos.</p>"; // Mostrar error
                     verbsGameContainer.classList.remove('hidden'); // Mostrar el contenedor con el error
                     containerToShow = null; // Evitar que se quite .hidden abajo si hay error
                }
                break;
            case 'traduccion':
                containerToShow = traduccionGameContainer;
                titleText = "Práctica de Vocabulario";
                 // Llamar a init del módulo TraduccionGame SI EXISTE
                 if (typeof TraduccionGame !== 'undefined' && TraduccionGame.init) {
                    TraduccionGame.init(traduccionGameContainer);
                 } else {
                     console.error("Intento de iniciar TraduccionGame, pero el módulo o init no están definidos.");
                     traduccionGameContainer.innerHTML = "<p class='error-message'>Error al cargar el juego de Vocabulario.</p>";
                     traduccionGameContainer.classList.remove('hidden');
                     containerToShow = null;
                 }
                break;
            default:
                 console.warn("showScreen llamado con ID de pantalla desconocido:", screenId);
                 containerToShow = gameSelectionDiv; // Volver a selección por defecto
                 screenId = 'selection'; // Corregir ID para estado
        }

        // 4. Mostrar el contenedor correcto (si se encontró uno)
        if (containerToShow) {
            containerToShow.classList.remove('hidden');
        } else if (screenId !== 'verbs' && screenId !== 'traduccion') { // Si no se encontró contenedor y no fue por error en init
             console.error(`Contenedor para screenId '${screenId}' no encontrado.`);
             gameSelectionDiv.classList.remove('hidden'); // Mostrar selección como fallback
             screenId = 'selection';
        }


        // 5. Actualizar título principal
        if(mainTitle) mainTitle.textContent = titleText;

        // 6. Actualizar estado global
        currentGameMode = screenId;

        // 7. Scroll al inicio (opcional, útil al cambiar de juego)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

     // --- Función para Resetear Estado del Juego Anterior ---
     function resetPreviousGame(gameModeToReset) {
         console.log(`Intentando resetear juego: ${gameModeToReset}`);

         // Detener temporizadores siempre
         stopTimer();
         stopQuestionTimer();

         switch (gameModeToReset) {
             // Casos para juegos originales (llaman a sus funciones de reset)
             case 'matching':
             case 'matching-setup': // Resetear también desde setup por si acaso
             case 'matching-game':
                 resetMatchingGame(true); // El true indica que no reinicie auto, solo limpie
                 break;
             case 'fill-blanks':
             case 'fill-blanks-setup':
             case 'fill-blanks-game':
                 resetFillBlanksGame(true);
                 break;
             case 'verb-pattern':
             case 'verb-pattern-setup':
             case 'verb-pattern-game':
                 resetVerbPatternGame(true);
                 break;
             // Casos para juegos importados (llaman a reset de sus módulos)
             case 'verbs':
                 if (typeof VerbsGame !== 'undefined' && VerbsGame.reset) {
                     console.log("Llamando a VerbsGame.reset()");
                     VerbsGame.reset();
                 } else {
                     console.warn("No se pudo resetear VerbsGame: Módulo o reset() no definidos.");
                 }
                 break;
             case 'traduccion':
                 if (typeof TraduccionGame !== 'undefined' && TraduccionGame.reset) {
                     console.log("Llamando a TraduccionGame.reset()");
                     TraduccionGame.reset();
                 } else {
                     console.warn("No se pudo resetear TraduccionGame: Módulo o reset() no definidos.");
                 }
                 break;
             case 'selection':
                 // No hay nada que resetear en la pantalla de selección
                 break;
             default:
                 console.warn(`Intento de resetear un modo de juego desconocido: ${gameModeToReset}`);
         }
         console.log(`Reseteo completado para ${gameModeToReset}`);
     }


    // --- Funciones del Temporizador General (Compartidas Matching/FillBlanks) ---
    function updateTimerDisplay() {
        const formattedTime = formatTime(timeLeft);
        // Actualizar el span del juego activo que usa este timer
        if (currentGameMode === 'matching' || currentGameMode === 'matching-game') {
            if(matchingTimerSpan) matchingTimerSpan.textContent = formattedTime;
        } else if (currentGameMode === 'fill-blanks' || currentGameMode === 'fill-blanks-game') {
            if(fillBlanksTimerSpan) fillBlanksTimerSpan.textContent = formattedTime;
        }
    }
    function startTimer(durationSeconds) {
        stopTimer(); // Limpiar intervalo anterior si existe
        timeLeft = durationSeconds;
        updateTimerDisplay(); // Mostrar tiempo inicial
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                handleTimeUp(); // Llama a la función cuando el tiempo se agota
            }
        }, 1000); // Ejecutar cada segundo
    }
    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null; // Poner a null para indicar que no está activo
    }
    function handleTimeUp() {
        console.log("Temporizador General: ¡Tiempo agotado!");
        stopTimer(); // Asegurar que se detiene
        // Ejecutar acción según el juego activo
        if (currentGameMode === 'matching' || currentGameMode === 'matching-game') {
            showMatchingResults(false); // Mostrar resultados como "perdido por tiempo"
        } else if (currentGameMode === 'fill-blanks' || currentGameMode === 'fill-blanks-game') {
            if (!fillBlanksFinalized) {
                finalizeFillBlanksGame(); // Finalizar y mostrar resultados
            }
        }
    }


    // --- Lógica Juego Emparejar (Matching) ---
    // (Las funciones internas permanecen mayormente igual, solo aseguramos referencias DOM)
    function checkMatch(p1, p2) { /* ... (código original sin cambios) ... */ if (!p1 || !p2 || !p1.dataset || !p2.dataset) return false; if (p1.classList.contains('correct-match') || p2.classList.contains('correct-match') || p1.style.display === 'none' || p2.style.display === 'none') { return false; } const id1 = p1.dataset.id; const lang1 = p1.dataset.lang; const id2 = p2.dataset.id; const lang2 = p2.dataset.lang; return id1 === id2 && lang1 !== lang2; }
    function applyCorrectMatch(p1, p2) { /* ... (código original sin cambios) ... */ p1.classList.add('correct-match'); p2.classList.add('correct-match'); setTimeout(() => { p1.style.display = 'none'; p2.style.display = 'none'; scoreMatching++; if(currentScoreSpan) currentScoreSpan.textContent = scoreMatching; const remaining = wordArea ? wordArea.querySelectorAll('.word-pill:not([style*="display: none"])').length : 0; if (remaining === 0) { console.log("Matching: ¡Todas las parejas encontradas!"); stopTimer(); setTimeout(() => showMatchingResults(true), 300); } }, 160); }
    function applyIncorrectMatchFeedback(p) { /* ... (código original sin cambios) ... */ if (!p || p.classList.contains('correct-match') || p.style.display === 'none') return; p.classList.add('incorrect-match'); setTimeout(() => { if (p) p.classList.remove('incorrect-match'); }, 500); }
    function renderMatchingWords() {
        if (!wordArea || !currentScoreSpan || !totalPairsSpan || typeof conectoresOriginal === 'undefined') {
            console.error("Matching Error: Faltan elementos DOM o datos 'conectoresOriginal'.");
            return;
        }
        wordArea.innerHTML = '';
        const wordsToRender = [];
        const currentConnectors = shuffleArray(conectoresOriginal); // Usar datos globales
        scoreMatching = 0; // Resetear score específico
        currentScoreSpan.textContent = scoreMatching;
        totalPairsSpan.textContent = currentConnectors.length;

        currentConnectors.forEach(pair => {
            wordsToRender.push({ id: pair.id, lang: 'en', text: pair.en });
            wordsToRender.push({ id: pair.id, lang: 'es', text: pair.es });
        });
        shuffleArray(wordsToRender); // Barajar píldoras

        wordsToRender.forEach(word => {
            const pill = document.createElement('div');
            pill.classList.add('word-pill', `lang-${word.lang}`);
            pill.textContent = word.text;
            pill.dataset.id = word.id;
            pill.dataset.lang = word.lang;
            wordArea.appendChild(pill);
        });

        // Inicializar SortableJS si está disponible
        if (sortableInstance) sortableInstance.destroy(); // Destruir instancia anterior
        if (typeof Sortable !== 'undefined') {
            sortableInstance = Sortable.create(wordArea, {
                animation: 150,
                ghostClass: 'sortable-ghost', // Usar clase definida en CSS principal
                chosenClass: 'sortable-chosen', // Opcional
                dragClass: 'sortable-drag',   // Opcional
                forceFallback: true, // Puede mejorar compatibilidad
                onEnd: function (evt) { // Se ejecuta al soltar una píldora
                    const movedItem = evt.item;
                    // Ignorar si el juego no está activo o ya terminó
                    if (!timerInterval || resultsOverlay?.classList.contains('hidden') === false) return;

                    const prevSibling = movedItem.previousElementSibling;
                    const nextSibling = movedItem.nextElementSibling;
                    let matchFound = false;
                    let targetPill = null;

                    // Comprobar con vecino anterior (si existe y es visible)
                    if (prevSibling && prevSibling.style.display !== 'none' && checkMatch(movedItem, prevSibling)) {
                        matchFound = true; targetPill = prevSibling;
                    }
                    // Comprobar con vecino siguiente (si no hubo match antes y existe/es visible)
                    if (!matchFound && nextSibling && nextSibling.style.display !== 'none' && checkMatch(movedItem, nextSibling)) {
                        matchFound = true; targetPill = nextSibling;
                    }

                    if (matchFound && targetPill) {
                        applyCorrectMatch(movedItem, targetPill); // Aplicar animación correcta
                    } else {
                        applyIncorrectMatchFeedback(movedItem); // Aplicar animación incorrecta
                    }
                }
            });
        } else {
            console.warn("SortableJS no está definido. El juego de emparejar será solo visual.");
        }
    }
    function showMatchingResults(won) {
        stopTimer(); // Detener temporizador
        if (sortableInstance) sortableInstance.option('disabled', true); // Deshabilitar arrastre
        if (!resultsOverlay || !correctPairsList) return;

        // Poblar lista de resultados
        correctPairsList.innerHTML = ''; // Limpiar lista
        if (typeof conectoresOriginal !== 'undefined') {
             conectoresOriginal.forEach(pair => {
                 const div = document.createElement('div');
                 div.textContent = `${pair.en} = ${pair.es}`;
                 correctPairsList.appendChild(div);
             });
        }

        // Determinar título del overlay
        let resultTitle = "Resultados";
        if (won) resultTitle = "¡Felicidades, todas correctas!";
        else if (timeLeft <= 0) resultTitle = "¡Tiempo Agotado!";
        else resultTitle = "Te has rendido";
        const titleElement = resultsOverlay.querySelector('h2');
        if(titleElement) titleElement.textContent = resultTitle;

        // Mostrar overlay y ajustar botones
        resultsOverlay.classList.remove('hidden');
        if(giveUpBtn) giveUpBtn.disabled = true;
        if(restartMatchingBtn) restartMatchingBtn.disabled = false; // Habilitar reiniciar
    }
    function initializeMatchingGame() {
        // No seteamos currentGameMode aquí, se hace en showScreen
        scoreMatching = 0; // Resetear score
        renderMatchingWords(); // Renderizar píldoras
        const selectedMinutes = parseInt(matchingTimeSelect.value, 10);
        startTimer(selectedMinutes * 60); // Iniciar temporizador
        showScreen('matching-game'); // Mostrar pantalla del juego
        // Asegurar estado inicial botones
        if(giveUpBtn) giveUpBtn.disabled = false;
        if(restartMatchingBtn) restartMatchingBtn.disabled = true; // Deshabilitado hasta que termine
        if(resultsOverlay) resultsOverlay.classList.add('hidden');
        if (sortableInstance) sortableInstance.option('disabled', false); // Habilitar arrastre
    }
    function resetMatchingGame(goToSetup) {
        stopTimer(); // Detener timer si está activo
        if(wordArea) wordArea.innerHTML = ''; // Limpiar área
        scoreMatching = 0; // Resetear score
        if(currentScoreSpan) currentScoreSpan.textContent = '0';
        if(totalPairsSpan) totalPairsSpan.textContent = '0';
        if(matchingTimerSpan) matchingTimerSpan.textContent = '--:--';
        if(resultsOverlay) resultsOverlay.classList.add('hidden'); // Ocultar resultados
        if(giveUpBtn) giveUpBtn.disabled = false; // Habilitar rendirse (se deshabilita al empezar)
        if(restartMatchingBtn) restartMatchingBtn.disabled = true; // Deshabilitar reiniciar
        if (sortableInstance) { // Destruir instancia Sortable
             sortableInstance.destroy();
             sortableInstance = null;
        }
        // NO volvemos a setup automáticamente aquí, eso lo decide el listener del botón
    }

    // --- Lógica Juego Rellenar (Fill Blanks) ---
    // (Las funciones internas permanecen igual, asegurando referencias DOM)
    function renderFillBlanksTable() {
        if (!fillBlanksTableBody || typeof conectoresOriginal === 'undefined') {
             console.error("FillBlanks Error: Falta tbody o datos 'conectoresOriginal'."); return;
        }
        fillBlanksTableBody.innerHTML = '';
        currentConnectorsFill = shuffleArray(conectoresOriginal); // Usar datos globales
        scoreFillBlanks = 0; fillBlanksIncorrectScore = 0; // Resetear scores
        if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = scoreFillBlanks;
        if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore;
        if(fillBlanksTotalSpan) fillBlanksTotalSpan.textContent = currentConnectorsFill.length;
        translationDirection = translationDirectionSelect.value; // Obtener dirección
        fillBlanksFinalized = false; // Marcar como no finalizado

        currentConnectorsFill.forEach((pair, index) => {
            const row = fillBlanksTableBody.insertRow();
            row.dataset.id = pair.id; // Guardar ID en la fila

            const sourceCell = row.insertCell(); // Celda palabra original
            sourceCell.textContent = (translationDirection === 'en-es') ? pair.en : pair.es;

            const inputCell = row.insertCell(); // Celda input
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = (translationDirection === 'en-es') ? 'Escribe en Español...' : 'Escribe en Inglés...';
            input.dataset.id = pair.id; // ID para buscar respuesta
            input.dataset.index = index; // Índice para encontrar la fila si es necesario
            input.disabled = false; // Habilitado al inicio
            input.addEventListener('blur', handleFillBlanksInputBlur); // Listener blur
            inputCell.appendChild(input);

            const feedbackCell = row.insertCell(); // Celda feedback
            feedbackCell.className = 'feedback'; // Clase para estilo
            feedbackCell.textContent = '-'; // Placeholder inicial

        });
    }
    function checkAnswerFillBlanks(userInput, correctAnswer) { /* ... (código original, mejorado) ... */ const normalizedInput = userInput.trim().toLowerCase(); if (!normalizedInput) return false; const correctOptions = correctAnswer.toLowerCase().split(/[,/]/).map(opt => opt.trim()).filter(opt => opt.length > 0); if (correctOptions.length === 0) return false; const normalizeForCompare = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); const normalizedInputNoAccents = normalizeForCompare(normalizedInput); const correctOptionsNoAccents = correctOptions.map(normalizeForCompare); return correctOptions.includes(normalizedInput) || correctOptionsNoAccents.includes(normalizedInputNoAccents); }
    function handleFillBlanksInputBlur(event) { if (!fillBlanksFinalized) checkSingleAnswerAndUpdate(event.target); }
    function checkSingleAnswerAndUpdate(inputElement) { /* ... (código original, ajustado para usar scoreFillBlanks) ... */ const row = inputElement.closest('tr'); if (!row) return; const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal.find(p => p.id == id); if (!connectorPair || !feedbackCell) return; const userAnswer = inputElement.value; const correctAnswer = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrectNow = checkAnswerFillBlanks(userAnswer, correctAnswer); const isIncorrectNow = !isCorrectNow && userAnswer.trim() !== ''; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrectNow) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); } else if (isIncorrectNow) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); } else { feedbackCell.textContent = '-'; } if (!feedbackCell.classList.contains('feedback')) feedbackCell.classList.add('feedback'); const currentTotalCorrect = fillBlanksTableBody ? fillBlanksTableBody.querySelectorAll('td.feedback.correct').length : 0; const currentTotalIncorrect = fillBlanksTableBody ? fillBlanksTableBody.querySelectorAll('td.feedback.incorrect').length : 0; scoreFillBlanks = currentTotalCorrect; fillBlanksIncorrectScore = currentTotalIncorrect; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = scoreFillBlanks; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; }
    function finalizeFillBlanksGame() { /* ... (código original, ajustado para usar scoreFillBlanks) ... */ if (fillBlanksFinalized) return; fillBlanksFinalized = true; stopTimer(); console.log("Finalizando Fill Blanks..."); let finalCorrect = 0; let finalIncorrect = 0; const rows = fillBlanksTableBody ? fillBlanksTableBody.querySelectorAll('tr') : []; if (rows.length === 0) { if(checkAnswersBtn) checkAnswersBtn.disabled = true; return; } rows.forEach((row) => { const input = row.querySelector('input[type="text"]'); const feedbackCell = row.cells[2]; const id = row.dataset.id; const connectorPair = conectoresOriginal.find(p => p.id == id); if (!input || !feedbackCell || !connectorPair) return; const userAnswer = input.value; const correctAnswerString = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en; const isCorrect = checkAnswerFillBlanks(userAnswer, correctAnswerString); const isIncorrect = !isCorrect && userAnswer.trim() !== ''; input.value = correctAnswerString; input.disabled = true; feedbackCell.classList.remove('correct', 'incorrect'); if (isCorrect) { feedbackCell.textContent = 'Correcto'; feedbackCell.classList.add('correct'); finalCorrect++; } else if (isIncorrect) { feedbackCell.textContent = 'Incorrecto'; feedbackCell.classList.add('incorrect'); finalIncorrect++; } else { feedbackCell.textContent = '-'; } if (!feedbackCell.classList.contains('feedback')) feedbackCell.classList.add('feedback'); }); scoreFillBlanks = finalCorrect; fillBlanksIncorrectScore = finalIncorrect; if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = scoreFillBlanks; if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = fillBlanksIncorrectScore; if(checkAnswersBtn) checkAnswersBtn.disabled = true; if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); console.log("Fill Blanks Finalizado."); }
    function initializeFillBlanksGame() {
        scoreFillBlanks = 0; fillBlanksIncorrectScore = 0; // Resetear scores
        fillBlanksFinalized = false; // Marcar como no finalizado
        renderFillBlanksTable(); // Renderizar tabla
        const selectedMinutes = parseInt(fillBlanksTimeSelect.value, 10);
        startTimer(selectedMinutes * 60); // Iniciar timer
        showScreen('fill-blanks-game'); // Mostrar pantalla
        // Habilitar botones
        if(checkAnswersBtn) checkAnswersBtn.disabled = false;
        if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = false;
    }
    function resetFillBlanksGame(goToSetup) {
        stopTimer(); // Detener timer
        if(fillBlanksTableBody) fillBlanksTableBody.innerHTML = ''; // Limpiar tabla
        scoreFillBlanks = 0; fillBlanksIncorrectScore = 0; // Resetear scores
        if(fillBlanksScoreSpan) fillBlanksScoreSpan.textContent = '0';
        if(fillBlanksIncorrectScoreSpan) fillBlanksIncorrectScoreSpan.textContent = '0';
        if(fillBlanksTotalSpan) fillBlanksTotalSpan.textContent = '0';
        if(fillBlanksTimerSpan) fillBlanksTimerSpan.textContent = '--:--';
        if(checkAnswersBtn) checkAnswersBtn.disabled = true; // Deshabilitar comprobar
        if(restartFillBlanksBtn) restartFillBlanksBtn.disabled = true; // Deshabilitar reiniciar
        fillBlanksFinalized = false;
        // No volvemos a setup aquí
    }


    // --- Lógica Juego Gerundios/Infinitivos (Verb Patterns) ---
    // (Funciones internas permanecen igual, asegurando referencias DOM)
    function updateVerbPatternScores() { if(verbPatternCorrectSpan) verbPatternCorrectSpan.textContent = scoreVerbPattern; if(verbPatternIncorrectSpan) verbPatternIncorrectSpan.textContent = verbPatternIncorrectScore; if(verbPatternQCountSpan) verbPatternQCountSpan.textContent = Math.max(0, currentPatternIndex + 1); }
    function stopQuestionTimer() { clearInterval(verbPatternQuestionTimer); verbPatternQuestionTimer = null; }
    function startQuestionTimer() { stopQuestionTimer(); verbPatternQuestionTimeLeft = verbPatternTimePerQuestion; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; userCanAnswerVerbPattern = true; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = false); if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } verbPatternQuestionTimer = setInterval(() => { verbPatternQuestionTimeLeft--; if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = verbPatternQuestionTimeLeft; if (verbPatternQuestionTimeLeft <= 0) { handleQuestionTimeout(); } }, 1000); }
    function handleQuestionTimeout() { console.log("VerbPattern: Tiempo Agotado!"); stopQuestionTimer(); userCanAnswerVerbPattern = false; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = true); verbPatternIncorrectScore++; updateVerbPatternScores(); if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = "¡Tiempo agotado! (Error)"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; } const currentPattern = currentVerbPatterns?.[currentPatternIndex]; if(currentPattern) showCorrectAnswerFeedback(currentPattern.category); setTimeout(displayNextVerbPatternQuestion, 2500); }
    function showCorrectAnswerFeedback(correctCategory) { if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => { button.style.border = ''; if(button.dataset.answer === correctCategory) button.style.border = '3px solid green'; }); } // Borde más grueso
    function handleVerbPatternAnswer(event) { if (!userCanAnswerVerbPattern) return; stopQuestionTimer(); userCanAnswerVerbPattern = false; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => { button.disabled = true; button.style.border = ''; }); const selectedButton = event.target; const selectedAnswer = selectedButton.dataset.answer; const currentPattern = currentVerbPatterns?.[currentPatternIndex]; if (!currentPattern) return; const correctAnswer = currentPattern.category; let isCorrect = selectedAnswer === correctAnswer; if (isCorrect) { scoreVerbPattern++; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = "¡Correcto!"; verbPatternFeedbackDiv.className = 'verb-pattern-feedback correct'; } selectedButton.style.border = '3px solid green'; } else { verbPatternIncorrectScore++; const categoryMap = { 'gerund': 'Gerundio (-ing)', 'infinitive_to': 'Infinitivo (con TO)', 'infinitive_no_to': 'Infinitivo (sin TO)', 'both': 'Ambos' }; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = `Incorrecto. Era: ${categoryMap[correctAnswer] || correctAnswer}`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback incorrect'; } selectedButton.style.border = '3px solid red'; showCorrectAnswerFeedback(correctAnswer); } updateVerbPatternScores(); setTimeout(displayNextVerbPatternQuestion, isCorrect ? 1200 : 2500); } // Menos tiempo si acierta
    function displayNextVerbPatternQuestion() { currentPatternIndex++; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => { button.disabled = true; button.style.border = ''; }); if (currentPatternIndex < currentVerbPatterns.length) { const pattern = currentVerbPatterns[currentPatternIndex]; if(verbPatternTermDiv) verbPatternTermDiv.textContent = pattern.term; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = pattern.explanation || ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = ''; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } updateVerbPatternScores(); startQuestionTimer(); } else { console.log("VerbPattern: Juego Terminado!"); if(verbPatternTermDiv) verbPatternTermDiv.textContent = "¡Juego Terminado!"; if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = ''; if(verbPatternFeedbackDiv) { verbPatternFeedbackDiv.textContent = `Resultado Final: ${scoreVerbPattern} Aciertos, ${verbPatternIncorrectScore} Errores.`; verbPatternFeedbackDiv.className = 'verb-pattern-feedback'; } if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '-'; if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = true); if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Volver a Selección"; } }
    function resetVerbPatternGame(goToSetup) { // Renombrado de quitVerbPatternGame
        stopQuestionTimer();
        scoreVerbPattern = 0; verbPatternIncorrectScore = 0; currentPatternIndex = -1; // Resetear estado
        if(verbPatternTermDiv) verbPatternTermDiv.textContent = '...'; // Limpiar UI
        if(verbPatternExplanationDiv) verbPatternExplanationDiv.textContent = '';
        if(verbPatternFeedbackDiv) verbPatternFeedbackDiv.textContent = '';
        if(verbPatternQTimerSpan) verbPatternQTimerSpan.textContent = '--';
        if(verbPatternCorrectSpan) verbPatternCorrectSpan.textContent = '0';
        if(verbPatternIncorrectSpan) verbPatternIncorrectSpan.textContent = '0';
        if(verbPatternQCountSpan) verbPatternQCountSpan.textContent = '0';
        if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = '0';
        if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Salir del Juego"; // Restaurar texto botón
        if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(b => { b.disabled = true; b.style.border = ''; });
        // No volvemos a setup aquí
    }
    function initializeVerbPatternGame() {
        verbPatternTimePerQuestion = parseInt(verbPatternTimeSelect.value, 10);
        scoreVerbPattern = 0; verbPatternIncorrectScore = 0; currentPatternIndex = -1; // Resetear estado
        if (typeof verbPatternData !== 'undefined' && verbPatternData.length > 0) {
             currentVerbPatterns = shuffleArray(verbPatternData); // Barajar datos
             if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = currentVerbPatterns.length;
        } else {
             console.error("VerbPattern Error: No se pudieron cargar los datos 'verbPatternData'.");
             if(verbPatternQTotalSpan) verbPatternQTotalSpan.textContent = '0';
             currentVerbPatterns = [];
        }
        updateVerbPatternScores(); // Poner scores a 0
        if(verbPatternQuitBtn) verbPatternQuitBtn.textContent = "Salir del Juego"; // Asegurar texto botón
        showScreen('verb-pattern-game'); // Mostrar pantalla
        if (currentVerbPatterns.length > 0) {
             displayNextVerbPatternQuestion(); // Empezar primera pregunta
        } else {
             if(verbPatternTermDiv) verbPatternTermDiv.textContent = "Error al cargar datos";
             if(verbPatternAnswerButtons) verbPatternAnswerButtons.forEach(button => button.disabled = true);
        }
    }


    // --- Event Listeners (SETUP) ---

    // 1. Botones de Selección de Juego
    const selectMatchingBtn = document.getElementById('select-matching-btn');
    if(selectMatchingBtn) selectMatchingBtn.addEventListener('click', () => showScreen('matching-setup'));
    const selectFillBlanksBtn = document.getElementById('select-fill-blanks-btn');
    if(selectFillBlanksBtn) selectFillBlanksBtn.addEventListener('click', () => showScreen('fill-blanks-setup'));
    const selectVerbPatternBtn = document.getElementById('select-verb-pattern-btn');
    if (selectVerbPatternBtn) selectVerbPatternBtn.addEventListener('click', () => showScreen('verb-pattern-setup'));
    // NUEVOS LISTENERS para juegos importados
    const selectVerbsGameBtn = document.getElementById('select-verbs-game-btn');
    if (selectVerbsGameBtn) selectVerbsGameBtn.addEventListener('click', () => showScreen('verbs'));
    else console.error("Botón 'select-verbs-game-btn' no encontrado.");
    const selectTraduccionGameBtn = document.getElementById('select-traduccion-game-btn');
    if (selectTraduccionGameBtn) selectTraduccionGameBtn.addEventListener('click', () => showScreen('traduccion'));
    else console.error("Botón 'select-traduccion-game-btn' no encontrado.");


    // 2. Botones "Volver a Selección" (Usando delegación o querySelectorAll)
    backToSelectionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const gameModeBeingLeft = currentGameMode; // Capturar modo actual
            if (gameModeBeingLeft && gameModeBeingLeft !== 'selection') {
                resetPreviousGame(gameModeBeingLeft); // Resetear estado del juego que se abandona
            }
            showScreen('selection'); // Mostrar pantalla de selección
        });
    });

    // 3. Listeners específicos de Inicio de cada juego original
    if(startMatchingBtn) startMatchingBtn.addEventListener('click', initializeMatchingGame);
    if(startFillBlanksBtn) startFillBlanksBtn.addEventListener('click', initializeFillBlanksGame);
    if(startVerbPatternBtn) startVerbPatternBtn.addEventListener('click', initializeVerbPatternGame);

    // 4. Listeners para acciones DENTRO de los juegos originales
    // Matching
    if(giveUpBtn) giveUpBtn.addEventListener('click', () => showMatchingResults(false));
    if(playAgainMatchingBtn) playAgainMatchingBtn.addEventListener('click', () => {
        if(resultsOverlay) resultsOverlay.classList.add('hidden'); // Ocultar overlay
        resetMatchingGame(true); // Limpiar estado
        showScreen('matching-setup'); // Volver al setup
    });
    if(restartMatchingBtn) restartMatchingBtn.addEventListener('click', () => {
        if(resultsOverlay) resultsOverlay.classList.add('hidden'); // Ocultar overlay si estaba visible
        resetMatchingGame(false); // Limpiar estado
        initializeMatchingGame(); // Reiniciar inmediatamente
    });

    // Fill Blanks
    if(checkAnswersBtn) checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    if(restartFillBlanksBtn) restartFillBlanksBtn.addEventListener('click', () => {
         resetFillBlanksGame(false); // Limpiar estado
         initializeFillBlanksGame(); // Reiniciar inmediatamente
    });

    // Verb Patterns (El botón Quit/Salir ya está cubierto por backToSelectionButtons)
    // Listener para botones de respuesta (DELEGACIÓN)
     if(verbPatternOptionsDiv) {
        verbPatternOptionsDiv.addEventListener('click', (event) => {
            // Asegurar que se hizo clic en un botón habilitado y el juego está activo
            if (event.target.classList.contains('answer-button') && !event.target.disabled && userCanAnswerVerbPattern && (currentGameMode === 'verb-pattern-game')) {
                handleVerbPatternAnswer(event);
            }
        });
     }


    // --- Inicialización General de la Aplicación ---
    console.log("Aplicación inicializada. Mostrando selección de juego.");
    showScreen('selection'); // Mostrar la pantalla de selección al cargar

}); // Fin DOMContentLoaded
