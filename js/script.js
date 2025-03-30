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
    let score = 0;

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
    const fillBlanksScoreSpan = document.getElementById('fill-blanks-current-score');
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
        return array; // Devolver el array barajado
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // --- Funciones de Control de Visibilidad ---
    function showScreen(screen) {
        gameSelectionDiv.classList.add('hidden');
        matchingContainer.classList.add('hidden');
        fillBlanksContainer.classList.add('hidden');
        matchingSetupDiv.classList.add('hidden');
        matchingGameDiv.classList.add('hidden');
        fillBlanksSetupDiv.classList.add('hidden');
        fillBlanksGameDiv.classList.add('hidden');
        resultsOverlay.classList.add('hidden'); // Asegurarse que el overlay esté oculto al cambiar

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
        if (timerInterval) clearInterval(timerInterval); // Limpiar intervalo anterior
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
        alert("¡Se acabó el tiempo!");
        if (currentGameMode === 'matching') {
            showMatchingResults(false); // Indicar que no ganó (por tiempo)
        } else if (currentGameMode === 'fill-blanks') {
            checkFillBlanksAnswers(); // Comprobar automáticamente al acabar el tiempo
            checkAnswersBtn.disabled = true; // Deshabilitar botón de comprobar
            // Opcional: Deshabilitar todos los inputs
             fillBlanksTableBody.querySelectorAll('input[type="text"]').forEach(input => input.disabled = true);
        }
    }

    // --- Lógica Juego Emparejar (Matching) ---

    function renderMatchingWords() {
        wordArea.innerHTML = '';
        const wordsToRender = [];
        currentConnectors = shuffleArray([...conectoresOriginal]); // Barajar para este juego
        score = 0;
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
        if (!timerInterval && timeLeft > 0) return; // No arrastrar si timer parado pero no acabado
        if (event.target.classList.contains('correct-match') || event.target.style.visibility === 'hidden') return; // No arrastrar si ya emparejada

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
                // Correct Match
                draggedElement.classList.add('correct-match');
                dropTarget.classList.add('correct-match');
                draggedElement.classList.remove('dragging');
                draggedElement.draggable = false;
                dropTarget.draggable = false;

                setTimeout(() => {
                    if (draggedElement && draggedElement.classList.contains('correct-match')) draggedElement.style.visibility = 'hidden';
                    if (dropTarget && dropTarget.classList.contains('correct-match')) dropTarget.style.visibility = 'hidden';
                }, 500);

                score++;
                currentScoreSpan.textContent = score;

                if (score === currentConnectors.length) {
                    stopTimer();
                    setTimeout(() => showMatchingResults(true), 600); // Ganó
                }
            } else {
                // Incorrect Match
                if(draggedElement) draggedElement.classList.add('incorrect-match');
                dropTarget.classList.add('incorrect-match');
                setTimeout(() => {
                    if (draggedElement) draggedElement.classList.remove('incorrect-match');
                    if (!dropTarget.classList.contains('correct-match')) dropTarget.classList.remove('incorrect-match');
                }, 500);
            }
        }
        // Ensure dragging class is removed even if dropped outside a valid target
        if (draggedElement) draggedElement.classList.remove('dragging');
    }

    function showMatchingResults(won) {
        stopTimer();
        correctPairsList.innerHTML = ''; // Limpiar lista
        conectoresOriginal.forEach(pair => { // Mostrar todos los originales
            const div = document.createElement('div');
            div.textContent = `${pair.en} = ${pair.es}`;
            correctPairsList.appendChild(div);
        });

        let resultTitle = "Resultados";
        if (won) resultTitle = "¡Felicidades, has ganado!";
        else if (timeLeft <= 0) resultTitle = "¡Se acabó el tiempo!";
        else resultTitle = "Te has rendido"; // Give up case
        resultsOverlay.querySelector('h2').textContent = resultTitle;

        resultsOverlay.classList.remove('hidden');
        giveUpBtn.disabled = true; // Deshabilitar rendirse una vez mostrados los resultados
        restartMatchingBtn.disabled = false; // Habilitar reiniciar
    }

    function initializeMatchingGame() {
        currentGameMode = 'matching';
        const selectedMinutes = parseInt(matchingTimeSelect.value, 10);
        score = 0;
        draggedElement = null;
        renderMatchingWords();
        showScreen('matching-game');
        giveUpBtn.disabled = false;
        restartMatchingBtn.disabled = true; // Deshabilitado hasta que acabe
        resultsOverlay.classList.add('hidden'); // Asegurar que esté oculto
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
        // Limpiar listeners de drag/drop del contenedor por si acaso
        wordArea.removeEventListener('dragover', handleDragOver);
        wordArea.removeEventListener('drop', handleDrop);

        if (goToSetup) {
             showScreen('matching-setup');
        } else {
            initializeMatchingGame(); // Reinicia con la misma configuración de tiempo
        }
    }

    // --- Lógica Juego Rellenar (Fill Blanks) ---

    function renderFillBlanksTable() {
        fillBlanksTableBody.innerHTML = ''; // Limpiar tabla
        currentConnectors = shuffleArray([...conectoresOriginal]); // Barajar para el juego
        score = 0;
        fillBlanksScoreSpan.textContent = score;
        fillBlanksTotalSpan.textContent = currentConnectors.length;
        translationDirection = translationDirectionSelect.value; // Leer dirección seleccionada

        currentConnectors.forEach(pair => {
            const row = document.createElement('tr');
            row.dataset.id = pair.id; // Guardar ID en la fila

            const sourceCell = document.createElement('td');
            sourceCell.textContent = (translationDirection === 'en-es') ? pair.en : pair.es;

            const inputCell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = (translationDirection === 'en-es') ? 'Escribe en Español...' : 'Escribe en Inglés...';
            input.dataset.id = pair.id; // También en el input por facilidad
            inputCell.appendChild(input);

            const feedbackCell = document.createElement('td');
            feedbackCell.classList.add('feedback');
            feedbackCell.textContent = '-'; // Estado inicial

            row.appendChild(sourceCell);
            row.appendChild(inputCell);
            row.appendChild(feedbackCell);

            fillBlanksTableBody.appendChild(row);
        });
    }

    // Normaliza y compara respuestas, maneja múltiples opciones separadas por coma/slash
    function checkAnswer(userInput, correctAnswer) {
        const normalizedInput = userInput.trim().toLowerCase();
        if (!normalizedInput) return false; // Respuesta vacía es incorrecta

        // Dividir respuestas correctas por coma o slash, quitar espacios extra
        const correctOptions = correctAnswer.split(/[,/]/).map(opt => opt.trim().toLowerCase());

        return correctOptions.includes(normalizedInput);
    }


    function checkFillBlanksAnswers() {
         if (!timerInterval && timeLeft <= 0 && score > 0) {
             // Si el tiempo acabó y ya se comprobaron, no hacer nada más
             // O si ya se comprobó manualmente antes de acabar el tiempo
            // Podríamos necesitar una bandera `alreadyChecked` si permitimos comprobar varias veces.
             // Por ahora, asumimos que solo se comprueba una vez (manualmente o al acabar tiempo).
         }

        score = 0; // Reiniciar contador para recalcular
        const rows = fillBlanksTableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const input = row.querySelector('input[type="text"]');
            const feedbackCell = row.querySelector('td.feedback');
            const id = row.dataset.id;
            const connectorPair = conectoresOriginal.find(p => p.id == id);

            if (connectorPair && input) {
                const userAnswer = input.value;
                const correctAnswer = (translationDirection === 'en-es') ? connectorPair.es : connectorPair.en;

                if (checkAnswer(userAnswer, correctAnswer)) {
                    feedbackCell.textContent = 'Correcto';
                    feedbackCell.className = 'feedback correct'; // Quita otras clases y pone estas
                    score++;
                } else {
                    feedbackCell.textContent = 'Incorrecto';
                    feedbackCell.className = 'feedback incorrect';
                    // Opcional: Mostrar la respuesta correcta si falló
                    // input.value += ` (Correcto: ${correctAnswer.split(/[,/]/)[0]})`; // Muestra la primera opción correcta
                }
                input.disabled = true; // Deshabilitar input después de comprobar
            }
        });

        fillBlanksScoreSpan.textContent = score; // Actualizar puntuación final
        checkAnswersBtn.disabled = true; // Deshabilitar botón tras comprobar
        stopTimer(); // Parar el timer si se comprueba manualmente antes de tiempo
    }


    function initializeFillBlanksGame() {
        currentGameMode = 'fill-blanks';
        const selectedMinutes = parseInt(fillBlanksTimeSelect.value, 10);
        score = 0;
        renderFillBlanksTable(); // Crea la tabla con la dirección correcta
        showScreen('fill-blanks-game');
        checkAnswersBtn.disabled = false; // Habilitar botón de comprobar
        restartFillBlanksBtn.disabled = false; // Habilitar botón de reiniciar
        fillBlanksTableBody.querySelectorAll('input[type="text"]').forEach(input => input.disabled = false); // Habilitar inputs
        startTimer(selectedMinutes * 60);
    }

    function resetFillBlanksGame(goToSetup = false) {
        stopTimer();
        fillBlanksTableBody.innerHTML = '';
        score = 0;
        fillBlanksScoreSpan.textContent = '0';
        fillBlanksTotalSpan.textContent = '0';
        fillBlanksTimerSpan.textContent = '--:--';
        checkAnswersBtn.disabled = true; // Deshabilitar hasta empezar nuevo juego
        restartFillBlanksBtn.disabled = true;

         if (goToSetup) {
             showScreen('fill-blanks-setup');
        } else {
            // Reinicia con misma configuración (dirección y tiempo)
            initializeFillBlanksGame();
        }
    }


    // --- Event Listeners ---

    // Selección de Juego
    document.getElementById('select-matching-btn').addEventListener('click', () => showScreen('matching-setup'));
    document.getElementById('select-fill-blanks-btn').addEventListener('click', () => showScreen('fill-blanks-setup'));

    // Botones "Volver a Selección"
    backToSelectionButtons.forEach(button => {
        button.addEventListener('click', () => {
            stopTimer(); // Parar cualquier timer activo
            showScreen('selection');
        });
    });

    // Setup y Start Juego Emparejar
    startMatchingBtn.addEventListener('click', initializeMatchingGame);
    giveUpBtn.addEventListener('click', () => showMatchingResults(false)); // Pasar false (no ganó)
    playAgainMatchingBtn.addEventListener('click', () => resetMatchingGame(true)); // Volver al setup
    restartMatchingBtn.addEventListener('click', () => resetMatchingGame(false)); // Reiniciar inmediatamente

    // Setup y Start Juego Rellenar
    startFillBlanksBtn.addEventListener('click', initializeFillBlanksGame);
    checkAnswersBtn.addEventListener('click', checkFillBlanksAnswers);
    restartFillBlanksBtn.addEventListener('click', () => resetFillBlanksGame(false)); // Reiniciar inmediatamente

    // --- Inicialización General ---
    showScreen('selection'); // Mostrar la pantalla de selección al inicio

}); // Fin DOMContentLoaded
