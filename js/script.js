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
    let score = 0; // Usado para score dinámico en fill-blanks y score final en matching
    let fillBlanksFinalized = false;

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
    const fillBlanksScoreSpan = document.getElementById('fill-blanks-current-score'); // Score dinámico/final
    const fillBlanksTotalSpan = document.getElementById('fill-blanks-total');
    const fillBlanksTableBody = document.querySelector('#fill-blanks-table tbody');
    const checkAnswersBtn = document.getElementById('check-answers-btn');
    const restartFillBlanksBtn = document.getElementById('restart-fill-blanks-btn');
    let translationDirection = 'en-es';

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
            showMatchingResults(false);
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
        score = 0; // Reset score for matching game
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

        // Attach listeners to container only once
        wordArea.removeEventListener('dragover', handleDragOver); // Remove previous if any
        wordArea.removeEventListener('drop', handleDrop); // Remove previous if any
        wordArea.addEventListener('dragover', handleDragOver);
        wordArea.addEventListener('drop', handleDrop);
    }
    function handleDragStart(event) {
        if (!timerInterval && timeLeft > 0 && currentGameMode === 'matching') return; // Only if timer active
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
                score++; // Update matching game score
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
        // Ensure dragging class is removed if dropped outside a valid target
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
        score = 0; // Reset score for matching
        draggedElement = null;
        renderMatchingWords();
        showScreen('matching-game');
        giveUpBtn.disabled = false;
        restartMatchingBtn.disabled = true; // Disabled until game ends
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
        // Clean up listeners added to wordArea if necessary
        wordArea.removeEventListener('dragover', handleDragOver);
        wordArea.removeEventListener('drop', handleDrop);
        if (goToSetup) {
             showScreen('matching-setup');
        } else {
            initializeMatchingGame(); // Restart with same settings
        }
    }

    // --- Lógica Juego Rellenar (Fill Blanks) ---

    function renderFillBlanksTable() {
        fillBlanksTableBody.innerHTML = '';
        currentConnectors = shuffleArray([...conectoresOriginal]);
        score = 0; // Reset fill-blanks dynamic score
        fillBlanksScoreSpan.textContent = score;
        fillBlanksTotalSpan.textContent = currentConnectors.length;
        translationDirection = translationDirectionSelect.value;
        fillBlanksFinalized = false;

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
            input.disabled = false;
            input.addEventListener('blur', handleFillBlanksInputBlur);
            inputCell.appendChild(input);

            const feedbackCell = document.createElement('td');
            feedbackCell.className = 'feedback'; // Set base class ONLY
            feedbackCell.textContent = '-'; // Initial text

            row.appendChild(sourceCell);
            row.appendChild(inputCell);
            row.appendChild(feedbackCell);

            fillBlanksTableBody.appendChild(row);
        });
         console.log("Fill Blanks table rendered.");
    }

    function checkAnswer(userInput, correctAnswer) {
        const normalizedInput = userInput.trim().toLowerCase();
        if (!normalizedInput) return false;
        const correctOptions = correctAnswer.split(/[,/]/).map(opt => opt.trim().toLowerCase());
        if (translationDirection === 'en-es') {
            const normalizedInputNoAccents = normalizedInput.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (correctOptions.some(opt => opt.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalizedInputNoAccents)) {
                return true;
            }
        }
        return correctOptions.includes(normalizedInput);
    }

    // Handles instant feedback on input blur
    function handleFillBlanksInputBlur(event) {
        if (fillBlanksFinalized) return;
        checkSingleAnswerAndUpdate(event.target);
    }

    // Updates ONE row's feedback and the dynamic score
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

        // Update feedback cell UI
        if (isCorrectNow) {
            if (!wasCorrectBefore || feedbackCell.textContent !== 'Correcto') {
                feedbackCell.textContent = 'Correcto';
                feedbackCell.className = 'feedback correct';
                feedbackChanged = true;
            }
        } else {
            const newText = (userAnswer.trim() !== '') ? 'Incorrecto' : '-';
            const newClass = (userAnswer.trim() !== '') ? 'feedback incorrect' : 'feedback';
            if (feedbackCell.textContent !== newText || feedbackCell.className !== newClass) {
                feedbackCell.textContent = newText;
                feedbackCell.className = newClass;
                feedbackChanged = true;
            }
        }
        // Update dynamic score if correction status changed
        if (feedbackChanged) {
            if (isCorrectNow && !wasCorrectBefore) {
                score++;
            } else if (!isCorrectNow && wasCorrectBefore) {
                score--;
            }
            score = Math.max(0, score);
            fillBlanksScoreSpan.textContent = score;
        }
    }

    // *** FINAL CHECK FUNCTION (Button/Time Up) - REVISADA ***
    function finalizeFillBlanksGame() {
        if (fillBlanksFinalized) {
            console.log("Finalize called on already finalized game.");
            return;
        }
        fillBlanksFinalized = true;
        stopTimer();
        console.log("--- Finalizing Fill Blanks Game ---");

        let finalCalculatedScore = 0;
        const rows = fillBlanksTableBody.querySelectorAll('tr');

        if (rows.length === 0) {
            console.warn("No rows found in table during finalization.");
            checkAnswersBtn.disabled = true;
            return;
        }
        console.log(`Finalizing ${rows.length} rows...`);

        rows.forEach((row, index) => {
            const input = row.querySelector('input[type="text"]');
            // *** SELECCIONAR EL TD CORRECTO ***
            // El TD de feedback es el TERCER hijo (índice 2) de la fila TR
            const feedbackCell = row.cells[2]; // Usar índice de celda (más robusto)
            const id = row.dataset.id;
            const connectorPair = conectoresOriginal.find(p => p.id == id);

            // Safety checks
            if (!input || !feedbackCell || !connectorPair) {
                console.error(`Error finding elements for row ${index} (ID: ${id}). Skipping. Input: ${!!input}, Cell: ${!!feedbackCell}, Pair: ${!!connectorPair}`);
                return; // Skip this row
            }

            const userAnswer = input.value;
            const correctAnswer = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en;
            const isCorrect = checkAnswer(userAnswer, correctAnswer);

            // --- FORCE FINAL UI STATE ---
            // Limpiar clases previas y añadir las nuevas
            feedbackCell.classList.remove('correct', 'incorrect'); // Limpiar primero

            if (isCorrect) {
                feedbackCell.textContent = 'Correcto';
                feedbackCell.classList.add('correct'); // Añadir clase correcta
                finalCalculatedScore++;
            } else {
                if (userAnswer.trim() !== '') {
                    feedbackCell.textContent = 'Incorrecto';
                    feedbackCell.classList.add('incorrect'); // Añadir clase incorrecta
                } else {
                    feedbackCell.textContent = '-';
                    // No añadir clase extra si está vacío
                }
            }
            // Asegurarse de que la clase base 'feedback' siempre esté
            if (!feedbackCell.classList.contains('feedback')) {
                feedbackCell.classList.add('feedback');
            }


            // --- Disable input ---
            input.disabled = true;
            // Log detallado para depurar qué se está asignando
             // console.log(`Row ${index} (ID ${id}): Final State Set - Correct: ${isCorrect}, Text: '${feedbackCell.textContent}', Class: '${feedbackCell.className}'`);
        });

        // Update the score display with the FINAL calculated score
        score = finalCalculatedScore;
        fillBlanksScoreSpan.textContent = score;
        console.log(`Final Score Calculated: ${score} / ${currentConnectors.length}`);

        // Disable button and remove focus
        checkAnswersBtn.disabled = true;
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        alert(`Comprobación finalizada.\nPuntuación final: ${score} / ${currentConnectors.length}`);
        console.log("--- Fill Blanks Game Finalized ---");
    }


    function initializeFillBlanksGame() {
        currentGameMode = 'fill-blanks';
        const selectedMinutes = parseInt(fillBlanksTimeSelect.value, 10);
        score = 0; // Reset dynamic score
        fillBlanksFinalized = false; // Reset flag
        renderFillBlanksTable(); // Render table
        showScreen('fill-blanks-game'); // Show game screen
        checkAnswersBtn.disabled = false; // Enable check button
        restartFillBlanksBtn.disabled = false; // Enable restart button
        fillBlanksScoreSpan.textContent = score; // Show initial score 0
        // Ensure inputs are enabled
        fillBlanksTableBody.querySelectorAll('input[type="text"]').forEach(input => input.disabled = false);
        startTimer(selectedMinutes * 60); // Start the timer
    }

    function resetFillBlanksGame(goToSetup = false) {
        stopTimer(); // Stop any active timer
        fillBlanksTableBody.innerHTML = ''; // Clear the table content
        score = 0; // Reset score variable
        fillBlanksScoreSpan.textContent = '0'; // Reset score display
        fillBlanksTotalSpan.textContent = '0'; // Reset total display
        fillBlanksTimerSpan.textContent = '--:--'; // Reset timer display
        checkAnswersBtn.disabled = true; // Disable check button
        restartFillBlanksBtn.disabled = true; // Disable restart button
        fillBlanksFinalized = false; // Reset finalized flag

         if (goToSetup) {
             showScreen('fill-blanks-setup'); // Go back to setup screen
        } else {
            initializeFillBlanksGame(); // Restart with the same settings
        }
    }


    // --- Event Listeners ---

    // Selección de Juego
    document.getElementById('select-matching-btn').addEventListener('click', () => showScreen('matching-setup'));
    document.getElementById('select-fill-blanks-btn').addEventListener('click', () => showScreen('fill-blanks-setup'));

    // Botones "Volver a Selección"
    backToSelectionButtons.forEach(button => {
        button.addEventListener('click', () => {
            stopTimer(); // Ensure timer stops when going back
            showScreen('selection');
        });
    });

    // Setup y Start Juego Emparejar
    startMatchingBtn.addEventListener('click', initializeMatchingGame);
    giveUpBtn.addEventListener('click', () => showMatchingResults(false)); // Give up
    playAgainMatchingBtn.addEventListener('click', () => resetMatchingGame(true)); // Go to setup
    restartMatchingBtn.addEventListener('click', () => resetMatchingGame(false)); // Restart immediately

    // Setup y Start Juego Rellenar
    startFillBlanksBtn.addEventListener('click', initializeFillBlanksGame);
    // Button calls the FINALIZATION function
    checkAnswersBtn.addEventListener('click', finalizeFillBlanksGame);
    restartFillBlanksBtn.addEventListener('click', () => resetFillBlanksGame(false)); // Restart immediately

    // --- Inicialización General ---
    showScreen('selection'); // Start at the game selection screen

}); // Fin DOMContentLoaded
