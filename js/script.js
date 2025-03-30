// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Comprobación Inicial ---
    if (typeof conectoresOriginal === 'undefined') {
        console.error("ERROR: El archivo 'connectors.js' no se ha cargado correctamente o la variable 'conectoresOriginal' no está definida.");
        alert("Error al cargar los datos del juego. Revisa la consola.");
        return;
    }

    // --- Variables Globales ---
    let currentGameMode = null; // 'matching' or 'fill-blanks'
    let timerInterval = null;
    let timeLeft = 0;
    let currentConnectors = []; // Array de conectores para el juego actual
    let score = 0; // Score dinámico durante el juego (fill-blanks)
    let fillBlanksFinalized = false; // Bandera para saber si el juego de rellenar ya finalizó

    // --- Elementos del DOM Comunes ---
    const gameSelectionDiv = document.getElementById('game-selection');
    const backToSelectionButtons = document.querySelectorAll('.back-to-selection');

    // --- Elementos DOM Juego Emparejar (Matching) ---
    const matchingContainer = document.getElementById('matching-container');
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
    let draggedElement = null;

    // --- Elementos DOM Juego Rellenar (Fill Blanks) ---
    const fillBlanksContainer = document.getElementById('fill-blanks-container');
    const fillBlanksSetupDiv = document.getElementById('fill-blanks-setup');
    const fillBlanksGameDiv = document.getElementById('fill-blanks-game');
    const translationDirectionSelect = document.getElementById('translation-direction');
    const fillBlanksTimeSelect = document.getElementById('fill-blanks-time-select');
    const startFillBlanksBtn = document.getElementById('start-fill-blanks-btn');
    const fillBlanksTimerSpan = document.getElementById('fill-blanks-time-left');
    const fillBlanksScoreSpan = document.getElementById('fill-blanks-current-score'); // Score dinámico
    const fillBlanksTotalSpan = document.getElementById('fill-blanks-total');
    const fillBlanksTableBody = document.querySelector('#fill-blanks-table tbody');
    const checkAnswersBtn = document.getElementById('check-answers-btn');
    const restartFillBlanksBtn = document.getElementById('restart-fill-blanks-btn');
    let translationDirection = 'en-es'; // 'en-es' or 'es-en'

    // --- Funciones de Utilidad ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // --- Funciones de Control de Visibilidad ---
    function showScreen(screen) {
        // Ocultar todo primero
        gameSelectionDiv.classList.add('hidden');
        matchingContainer.classList.add('hidden');
        fillBlanksContainer.classList.add('hidden');
        matchingSetupDiv.classList.add('hidden');
        matchingGameDiv.classList.add('hidden');
        fillBlanksSetupDiv.classList.add('hidden');
        fillBlanksGameDiv.classList.add('hidden');
        resultsOverlay.classList.add('hidden');

        // Mostrar la pantalla correcta
        if (screen === 'selection') {
            gameSelectionDiv.classList.remove('hidden');
        } else if (screen === 'matching-setup') {
            matchingContainer.classList.remove('hidden');
            matchingSetupDiv.classList.remove('hidden');
        } else if (screen === 'matching-game') {
            matchingContainer.classList.remove('hidden');
            matchingGameDiv.classList.remove('hidden');
        } else if (screen === 'fill-blanks-setup') {
            fillBlanksContainer.classList.remove('hidden');
            fillBlanksSetupDiv.classList.remove('hidden');
        } else if (screen === 'fill-blanks-game') {
            fillBlanksContainer.classList.remove('hidden');
            fillBlanksGameDiv.classList.remove('hidden');
        }
    }

    // --- Funciones del Temporizador (Compartidas) ---
    function updateTimerDisplay() {
        const formattedTime = formatTime(timeLeft);
        if (currentGameMode === 'matching') {
            matchingTimerSpan.textContent = formattedTime;
        } else if (currentGameMode === 'fill-blanks') {
            fillBlanksTimerSpan.textContent = formattedTime;
        }
    }

    function startTimer(duration) {
        if (timerInterval) clearInterval(timerInterval);
        timeLeft = duration;
        updateTimerDisplay();

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                handleTimeUp();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    function handleTimeUp() {
        console.log("Time's up!");
        if (currentGameMode === 'matching') {
            showMatchingResults(false); // Indicar que no ganó (por tiempo)
        } else if (currentGameMode === 'fill-blanks') {
            if (!fillBlanksFinalized) {
                 finalizeFillBlanksGame(); // Llamar a la función finalizadora
            }
        }
    }

    // --- Lógica Juego Emparejar (Matching) ---
    // ... (Sin cambios) ...
    function renderMatchingWords() {
        wordArea.innerHTML = '';
        const wordsToRender = [];
        currentConnectors = shuffleArray([...conectoresOriginal]);
        score = 0; // Score para matching
        currentScoreSpan.textContent = score;
        totalPairsSpan.textContent = currentConnectors.length;

        currentConnectors.forEach(pair => {
            wordsToRender.push({ id: pair.id, lang: 'en', text: pair.en });
            wordsToRender.push({ id: pair.id, lang: 'es', text: pair.es });
        });

        shuffleArray(wordsToRender);

        wordsToRender.forEach(word => {
            const pill = document.createElement('div');
            pill.classList.add('word-pill', `lang-${word.lang}`);
            pill.textContent = word.text;
            pill.draggable = true;
            pill.dataset.id = word.id;
            pill.dataset.lang = word.lang;
            pill.addEventListener('dragstart', handleDragStart);
            pill.addEventListener('dragend', handleDragEnd);
            wordArea.appendChild(pill);
        });

        wordArea.addEventListener('dragover', handleDragOver);
        wordArea.addEventListener('drop', handleDrop);
    }
    function handleDragStart(event) {
        if (!timerInterval && timeLeft > 0 && currentGameMode === 'matching') return; // Solo si timer activo
        if (event.target.classList.contains('correct-match') || event.target.style.visibility === 'hidden') return;

        draggedElement = event.target;
        event.dataTransfer.setData('text/plain', event.target.dataset.id);
        event.dataTransfer.effectAllowed = 'move';
        setTimeout(() => { if(draggedElement) draggedElement.classList.add('dragging'); }, 0);
    }
    function handleDragEnd(event) {
        if (draggedElement) draggedElement.classList.remove('dragging');
        draggedElement = null;
        setTimeout(() => {
            wordArea.querySelectorAll('.incorrect-match').forEach(el => el.classList.remove('incorrect-match'));
        }, 100);
    }
    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }
    function handleDrop(event) {
        event.preventDefault();
        if (!draggedElement) return;
        const dropTarget = event.target;
        if (dropTarget.classList.contains('word-pill') &&
            !dropTarget.classList.contains('correct-match') &&
            dropTarget.style.visibility !== 'hidden' &&
            dropTarget !== draggedElement)
        {
            const draggedId = draggedElement.dataset.id;
            const draggedLang = draggedElement.dataset.lang;
            const targetId = dropTarget.dataset.id;
            const targetLang = dropTarget.dataset.lang;
            if (draggedId === targetId && draggedLang !== targetLang) {
                draggedElement.classList.add('correct-match');
                dropTarget.classList.add('correct-match');
                draggedElement.classList.remove('dragging');
                draggedElement.draggable = false;
                dropTarget.draggable = false;
                setTimeout(() => {
                    if (draggedElement && draggedElement.classList.contains('correct-match')) draggedElement.style.visibility = 'hidden';
                    if (dropTarget && dropTarget.classList.contains('correct-match')) dropTarget.style.visibility = 'hidden';
                }, 500);
                score++; // Actualizar score de matching
                currentScoreSpan.textContent = score;
                if (score === currentConnectors.length) {
                    stopTimer();
                    setTimeout(() => showMatchingResults(true), 600);
                }
            } else {
                if(draggedElement) draggedElement.classList.add('incorrect-match');
                dropTarget.classList.add('incorrect-match');
                setTimeout(() => {
                    if (draggedElement) draggedElement.classList.remove('incorrect-match');
                    if (!dropTarget.classList.contains('correct-match')) dropTarget.classList.remove('incorrect-match');
                }, 500);
            }
        }
        if (draggedElement) draggedElement.classList.remove('dragging');
    }
    function showMatchingResults(won) {
        stopTimer();
        correctPairsList.innerHTML = '';
        conectoresOriginal.forEach(pair => {
            const div = document.createElement('div');
            div.textContent = `${pair.en} = ${pair.es}`;
            correctPairsList.appendChild(div);
        });
        let resultTitle = "Resultados";
        if (won) resultTitle = "¡Felicidades, has ganado!";
        else if (timeLeft <= 0) resultTitle = "¡Se acabó el tiempo!";
        else resultTitle = "Te has rendido";
        resultsOverlay.querySelector('h2').textContent = resultTitle;
        resultsOverlay.classList.remove('hidden');
        giveUpBtn.disabled = true;
        restartMatchingBtn.disabled = false;
    }
    function initializeMatchingGame() {
        currentGameMode = 'matching';
        const selectedMinutes = parseInt(matchingTimeSelect.value, 10);
        score = 0; // Resetear score para matching
        draggedElement = null;
        renderMatchingWords();
        showScreen('matching-game');
        giveUpBtn.disabled = false;
        restartMatchingBtn.disabled = true;
        resultsOverlay.classList.add('hidden');
        startTimer(selectedMinutes * 60);
    }
     function resetMatchingGame(goToSetup = false) {
        stopTimer();
        wordArea.innerHTML = '';
        score = 0;
        currentScoreSpan.textContent = '0';
        totalPairsSpan.textContent = '0';
        matchingTimerSpan.textContent = '--:--';
        resultsOverlay.classList.add('hidden');
        giveUpBtn.disabled = false;
        restartMatchingBtn.disabled = false;
        wordArea.removeEventListener('dragover', handleDragOver);
        wordArea.removeEventListener('drop', handleDrop);
        if (goToSetup) {
             showScreen('matching-setup');
        } else {
            initializeMatchingGame();
        }
    }


    // --- Lógica Juego Rellenar (Fill Blanks) ---

    function renderFillBlanksTable() {
        fillBlanksTableBody.innerHTML = '';
        currentConnectors = shuffleArray([...conectoresOriginal]);
        score = 0; // Score dinámico para fill-blanks
        fillBlanksScoreSpan.textContent = score;
        fillBlanksTotalSpan.textContent = currentConnectors.length;
        translationDirection = translationDirectionSelect.value;
        fillBlanksFinalized = false; // Asegurar que no está finalizado

        currentConnectors.forEach(pair => {
            const row = document.createElement('tr');
            row.dataset.id = pair.id;

            const sourceCell = document.createElement('td');
            sourceCell.textContent = (translationDirection === 'en-es') ? pair.en : pair.es;

            const inputCell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = (translationDirection === 'en-es') ? 'Escribe en Español...' : 'Escribe en Inglés...';
            input.dataset.id = pair.id;
            // Listener para feedback instantáneo
            input.addEventListener('blur', handleFillBlanksInputBlur);
            inputCell.appendChild(input);

            const feedbackCell = document.createElement('td');
            feedbackCell.classList.add('feedback'); // Añadir clase base
            feedbackCell.textContent = '-'; // Estado inicial

            row.appendChild(sourceCell);
            row.appendChild(inputCell);
            row.appendChild(feedbackCell);

            fillBlanksTableBody.appendChild(row);
        });
         console.log("Tabla de Rellenar renderizada.");
    }

    function checkAnswer(userInput, correctAnswer) {
        const normalizedInput = userInput.trim().toLowerCase();
        if (!normalizedInput) return false;

        const correctOptions = correctAnswer.split(/[,/]/).map(opt => opt.trim().toLowerCase());

        if (translationDirection === 'en-es') {
            const normalizedInputNoAccents = normalizedInput
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
             if (correctOptions.some(opt => opt.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalizedInputNoAccents)) {
                 return true;
             }
        }

        return correctOptions.includes(normalizedInput);
    }

    // Feedback instantáneo al perder el foco
    function handleFillBlanksInputBlur(event) {
        if (fillBlanksFinalized) return; // No hacer nada si ya finalizó
        checkSingleAnswerAndUpdate(event.target);
    }

    // Actualiza UNA fila y el score dinámico
    function checkSingleAnswerAndUpdate(inputElement) {
        const row = inputElement.closest('tr');
        if (!row) return;
        const feedbackCell = row.querySelector('td.feedback');
        const id = row.dataset.id;
        const connectorPair = conectoresOriginal.find(p => p.id == id);

        if (!connectorPair || !feedbackCell) return;

        const userAnswer = inputElement.value;
        const correctAnswer = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en;

        const wasCorrectBefore = feedbackCell.classList.contains('correct');
        const isCorrectNow = checkAnswer(userAnswer, correctAnswer);

        let feedbackChanged = false;

        // Actualizar UI de la celda
        if (isCorrectNow) {
            if (!wasCorrectBefore || feedbackCell.textContent !== 'Correcto') {
                feedbackCell.textContent = 'Correcto';
                feedbackCell.className = 'feedback correct'; // Asegura clases correctas
                feedbackChanged = true;
            }
        } else {
            if (userAnswer.trim() !== '') {
                if (wasCorrectBefore || feedbackCell.textContent !== 'Incorrecto') {
                    feedbackCell.textContent = 'Incorrecto';
                    feedbackCell.className = 'feedback incorrect';
                    feedbackChanged = true;
                }
            } else {
                if (wasCorrectBefore || feedbackCell.textContent !== '-') {
                    feedbackCell.textContent = '-';
                    feedbackCell.className = 'feedback'; // Resetear a clase base
                    feedbackChanged = true;
                }
            }
        }

        // Actualizar score dinámico
        if (feedbackChanged) {
            if (isCorrectNow && !wasCorrectBefore) {
                score++;
            } else if (!isCorrectNow && wasCorrectBefore) {
                score--;
            }
            score = Math.max(0, score); // Evitar score negativo
            fillBlanksScoreSpan.textContent = score;
             // console.log(`Blur - Fila ID ${id}, Correcto: ${isCorrectNow}, Score dinámico: ${score}`);
        }
    }

    // *** FUNCIÓN FINALIZADORA (BOTÓN / TIEMPO) ***
    // Recorre TODO, establece feedback FINAL, calcula score FINAL, deshabilita.
    function finalizeFillBlanksGame() {
        if (fillBlanksFinalized) {
            console.log("Intento de finalizar un juego ya finalizado.");
            return;
        }
        fillBlanksFinalized = true;
        stopTimer();
        console.log("--- Finalizando Juego Rellenar ---");

        let finalScore = 0; // Recalcular score final desde CERO.
        const rows = fillBlanksTableBody.querySelectorAll('tr');

        if (rows.length === 0) {
            console.warn("No se encontraron filas en la tabla para finalizar.");
            return; // Salir si no hay filas
        }

        rows.forEach((row, index) => {
            const input = row.querySelector('input[type="text"]');
            const feedbackCell = row.querySelector('td.feedback'); // Selecciona el TD con clase feedback
            const id = row.dataset.id;
            const connectorPair = conectoresOriginal.find(p => p.id == id);

            // Asegurarse que todos los elementos existen
            if (!input) { console.error(`Fila ${index}: No se encontró input.`); return; }
            if (!feedbackCell) { console.error(`Fila ${index}: No se encontró feedbackCell.`); return; }
            if (!connectorPair) { console.error(`Fila ${index}: No se encontró conector con ID ${id}.`); return; }

            const userAnswer = input.value;
            const correctAnswer = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en;
            const isCorrect = checkAnswer(userAnswer, correctAnswer);
             // console.log(`Fila ${index} (ID ${id}): User='${userAnswer}', Correct='${correctAnswer}', Result=${isCorrect}`);

            // --- Forzar actualización FINAL de la celda de feedback ---
            if (isCorrect) {
                feedbackCell.textContent = 'Correcto';
                feedbackCell.className = 'feedback correct'; // Forzar clases
                finalScore++; // Incrementar score final
            } else {
                if (userAnswer.trim() !== '') {
                    feedbackCell.textContent = 'Incorrecto';
                    feedbackCell.className = 'feedback incorrect'; // Forzar clases
                     // Opcional: Mostrar respuesta correcta en tooltip
                     // feedbackCell.title = `Correcto: ${correctAnswer.split(/[,/]/)[0]}`;
                } else {
                    feedbackCell.textContent = '-';
                    feedbackCell.className = 'feedback'; // Forzar clase base
                }
            }

            // --- Deshabilitar input ---
            input.disabled = true;
        });

        // Actualizar el score mostrado con el score FINAL recalculado
        score = finalScore; // Sobrescribir el score dinámico con el final
        fillBlanksScoreSpan.textContent = score;
        console.log(`Final Score Calculado: ${score} / ${currentConnectors.length}`);

        // Deshabilitar botón y quitar foco
        checkAnswersBtn.disabled = true;
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        alert(`Comprobación finalizada.\nPuntuación final: ${score} / ${currentConnectors.length}`);
        console.log("--- Juego Rellenar Finalizado ---");
    }


    function initializeFillBlanksGame() {
        currentGameMode = 'fill-blanks';
        const selectedMinutes = parseInt(fillBlanksTimeSelect.value, 10);
        score = 0; // Resetear score dinámico
        fillBlanksFinalized = false; // Muy importante resetear bandera
        renderFillBlanksTable(); // Renderiza la tabla
        showScreen('fill-blanks-game'); // Muestra la pantalla del juego
        checkAnswersBtn.disabled = false; // Habilitar botón Comprobar
        restartFillBlanksBtn.disabled = false; // Habilitar botón Reiniciar
        fillBlanksScoreSpan.textContent = score; // Mostrar score 0
        // Asegurar que inputs estén habilitados (aunque render lo hace)
        fillBlanksTableBody.querySelectorAll('input[type="text"]').forEach(input => input.disabled = false);
        startTimer(selectedMinutes * 60); // Iniciar timer
    }

    function resetFillBlanksGame(goToSetup = false) {
        stopTimer(); // Parar timer si está activo
        fillBlanksTableBody.innerHTML = ''; // Limpiar tabla visualmente
        score = 0; // Resetear variable score
        fillBlanksScoreSpan.textContent = '0'; // Resetear marcador visual
        fillBlanksTotalSpan.textContent = '0'; // Resetear total visual
        fillBlanksTimerSpan.textContent = '--:--'; // Resetear timer visual
        checkAnswersBtn.disabled = true; // Deshabilitar botón comprobar
        restartFillBlanksBtn.disabled = true; // Deshabilitar botón reiniciar
        fillBlanksFinalized = false; // Resetear bandera

         if (goToSetup) {
             showScreen('fill-blanks-setup'); // Volver a la pantalla de configuración
        } else {
            initializeFillBlanksGame(); // Reiniciar con la misma configuración
        }
    }


    // --- Event Listeners ---

    // Selección de Juego
    document.getElementById('select-matching-btn').addEventListener('click', () => showScreen('matching-setup'));
    document.getElementById('select-fill-blanks-btn').addEventListener('click', () => showScreen('fill-blanks-setup'));

    // Botones "Volver a Selección"
    backToSelectionButtons.forEach(button => {
        button.addEventListener('click', () => {
            stopTimer();
            showScreen('selection');
        });
    });

    // Setup y Start Juego Emparejar
    startMatchingBtn.addEventListener('click', initializeMatchingGame);
    giveUpBtn.addEventListener('click', () => showMatchingResults(false));
    playAgainMatchingBtn.addEventListener('click', () => resetMatchingGame(true));
    restartMatchingBtn.addEventListener('click', () => resetMatchingGame(false));

    // Setup y Start Juego Rellenar
    startFillBlanksBtn.addEventListener('click', initializeFillBlanksGame);
    // El botón "Comprobar Respuestas" llama a la función finalizadora
    checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    restartFillBlanksBtn.addEventListener('click', () => resetFillBlanksGame(false));

    // --- Inicialización General ---
    showScreen('selection'); // Mostrar la pantalla de selección al inicio

}); // Fin DOMContentLoaded
