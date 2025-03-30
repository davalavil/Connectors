document.addEventListener('DOMContentLoaded', () => {
    // --- Datos del Juego ---
    const conectoresOriginal = [
        { id: 1, en: 'However', es: 'sin embargo' },
        { id: 2, en: 'Whatever', es: 'lo que' },
        { id: 3, en: 'Although', es: 'a pesar de, aunque' }, // Considerar separar si son conceptos distintos para el juego
        { id: 4, en: 'So', es: 'entonces' },
        { id: 5, en: 'Therefore', es: 'por lo tanto' },
        { id: 6, en: 'As soon as', es: 'tan pronto como' },
        { id: 7, en: 'Instead of', es: 'en lugar de' },
        { id: 8, en: 'Then', es: 'luego' },
        { id: 9, en: 'Once', es: 'una vez' },
        { id: 10, en: 'While', es: 'mientras' },
        { id: 11, en: 'But', es: 'pero' },
        { id: 12, en: 'Because', es: 'porque' },
        { id: 13, en: 'Even', es: 'incluso' },
        { id: 14, en: 'Also', es: 'tambien' }, // Nota: typo común es 'también'
        { id: 15, en: 'Still', es: 'aún' },
        { id: 16, en: 'Above all', es: 'sobretodo , principalmente' }, // Considerar 'sobre todo' (separado)
        { id: 17, en: 'Either', es: 'ni tampoco' }, // 'Either' tiene más usos, 'ni tampoco' es más específico de 'neither...nor' o respuesta negativa. Revisar contexto deseado.
        { id: 18, en: 'Neither', es: 'ni' },
        { id: 19, en: 'That', es: 'que / ese' },
        { id: 20, en: 'For while', es: 'por un momento' }, // Podría ser 'For a while'
        { id: 21, en: 'Meanwhile', es: 'mientras tanto' },
        { id: 22, en: 'For', es: 'para' }, // 'For' tiene muchos significados.
        { id: 23, en: 'Moreover', es: 'además de' }, // 'Además' o 'además de'
        { id: 24, en: 'Because Of', es: 'debido a' },
        { id: 25, en: 'Due to', es: 'debido a' },
        { id: 26, en: 'Furthermore', es: 'por otra parte' }, // También 'además'
        { id: 27, en: 'Such as', es: 'tal como' },
        { id: 28, en: 'In fact', es: 'de hecho' },
        { id: 29, en: 'Too', es: 'tambien' } // También 'demasiado'. Cuidado con 'Also' y 'Too'.
    ];
    let conectores = [...conectoresOriginal]; // Copia para poder reiniciar
    let currentScore = 0;
    let totalPairs = conectores.length;
    let draggedElement = null; // Para guardar el elemento que se está arrastrando
    let timerInterval = null;
    let timeLeft = 600; // Tiempo por defecto en segundos (10 minutos)

    // --- Elementos del DOM ---
    const wordArea = document.getElementById('word-area');
    const currentScoreSpan = document.getElementById('current-score');
    const totalPairsSpan = document.getElementById('total-pairs');
    const timeLeftSpan = document.getElementById('time-left');
    const giveUpBtn = document.getElementById('give-up-btn');
    const resultsOverlay = document.getElementById('results-overlay');
    const correctPairsList = document.getElementById('correct-pairs-list');
    const playAgainBtn = document.getElementById('play-again-btn');
    const setupOverlay = document.getElementById('setup-overlay');
    const startGameBtn = document.getElementById('start-game-btn');
    const timeSelect = document.getElementById('time-select');

    // --- Funciones del Juego ---

    // Barajar un array (Algoritmo Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Intercambio de elementos
        }
    }

    // Crear y mostrar las píldoras de palabras
    function renderWords() {
        wordArea.innerHTML = ''; // Limpiar área antes de añadir nuevas palabras
        const wordsToRender = [];

        conectores.forEach(pair => {
            wordsToRender.push({ id: pair.id, lang: 'en', text: pair.en });
            wordsToRender.push({ id: pair.id, lang: 'es', text: pair.es });
        });

        shuffleArray(wordsToRender); // Barajar todas las píldoras juntas

        wordsToRender.forEach(word => {
            const pill = document.createElement('div');
            pill.classList.add('word-pill', `lang-${word.lang}`);
            pill.textContent = word.text;
            pill.draggable = true; // Hacer el elemento arrastrable
            pill.dataset.id = word.id; // Guardar el ID en el dataset
            pill.dataset.lang = word.lang; // Guardar el idioma en el dataset

            // Añadir event listeners para drag & drop
            pill.addEventListener('dragstart', handleDragStart);
            pill.addEventListener('dragend', handleDragEnd);

            wordArea.appendChild(pill);
        });

         // Añadir listeners al contenedor para drop (más fiable que en cada píldora)
         wordArea.addEventListener('dragover', handleDragOver);
         wordArea.addEventListener('drop', handleDrop);

        // Actualizar contadores
        totalPairs = conectoresOriginal.length; // Usar original para el total
        totalPairsSpan.textContent = totalPairs;
        currentScore = 0;
        currentScoreSpan.textContent = currentScore;
    }

    // --- Funciones de Drag & Drop ---
    function handleDragStart(event) {
        // Solo permitir arrastrar si el juego está activo (timer corriendo)
        if (!timerInterval) return;

        draggedElement = event.target; // Guardar el elemento que se arrastra
        event.dataTransfer.setData('text/plain', event.target.dataset.id); // Necesario para Firefox
        event.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            event.target.classList.add('dragging'); // Añadir estilo después de un instante
        }, 0);
    }

    function handleDragEnd(event) {
        // Limpiar estilos y la variable de referencia
        if (draggedElement) {
             draggedElement.classList.remove('dragging');
        }
        draggedElement = null;
        // Quitar clase de feedback incorrecto si la hubiera
        const incorrectElements = wordArea.querySelectorAll('.incorrect-match');
        incorrectElements.forEach(el => el.classList.remove('incorrect-match'));
    }

    function handleDragOver(event) {
        event.preventDefault(); // Necesario para permitir el drop
         event.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(event) {
        event.preventDefault(); // Evita comportamiento por defecto (abrir como enlace, etc.)
        if (!draggedElement) return; // Si no hay elemento arrastrándose, salir

        const dropTarget = event.target;

        // Asegurarse que se suelta sobre OTRA píldora de palabra, no sobre el fondo o sobre sí misma
        if (dropTarget.classList.contains('word-pill') && dropTarget !== draggedElement) {
            const draggedId = draggedElement.dataset.id;
            const draggedLang = draggedElement.dataset.lang;
            const targetId = dropTarget.dataset.id;
            const targetLang = dropTarget.dataset.lang;

            // Comprobar si la pareja es correcta: mismo ID, diferente idioma
            if (draggedId === targetId && draggedLang !== targetLang) {
                // ¡Pareja Correcta!
                draggedElement.classList.add('correct-match');
                dropTarget.classList.add('correct-match');

                // Deshabilitar drag & drop para estos elementos
                draggedElement.draggable = false;
                dropTarget.draggable = false;

                // Esperar a que termine la animación CSS para ocultarlos del todo
                setTimeout(() => {
                    draggedElement.style.visibility = 'hidden'; // Ocultar en lugar de remover para mantener layout estable
                    dropTarget.style.visibility = 'hidden';
                }, 500); // Tiempo igual a la transición en CSS

                currentScore++;
                currentScoreSpan.textContent = currentScore;

                // Comprobar si se ha ganado
                if (currentScore === totalPairs) {
                    endGame(true); // Ganó
                }
            } else {
                // Pareja Incorrecta
                draggedElement.classList.add('incorrect-match');
                dropTarget.classList.add('incorrect-match');
                // Quitar la clase después de un momento
                setTimeout(() => {
                     if (draggedElement) draggedElement.classList.remove('incorrect-match');
                     dropTarget.classList.remove('incorrect-match');
                }, 500);
            }
        }
         // Si se suelta fuera de una píldora válida, dragend se encargará de limpiar
    }

    // --- Funciones del Temporizador ---
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function updateTimerDisplay() {
        timeLeftSpan.textContent = formatTime(timeLeft);
    }

    function startTimer() {
        // Evitar múltiples intervalos si ya existe uno
        if (timerInterval) clearInterval(timerInterval);

        updateTimerDisplay(); // Mostrar tiempo inicial

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                endGame(false); // Se acabó el tiempo
            }
        }, 1000); // Cada segundo
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // --- Funciones de Control del Juego ---
    function showResults(won) {
        stopTimer();
        correctPairsList.innerHTML = ''; // Limpiar lista anterior

        conectoresOriginal.forEach(pair => {
            const div = document.createElement('div');
            div.textContent = `${pair.en} = ${pair.es}`;
            correctPairsList.appendChild(div);
        });

        resultsOverlay.querySelector('h2').textContent = won ? "¡Felicidades!" : (timeLeft <= 0 ? "¡Tiempo Agotado!" : "Te Rendiste");
        resultsOverlay.classList.remove('hidden');
    }

    function endGame(won) {
        stopTimer();
        // Deshabilitar drag de píldoras restantes
        wordArea.querySelectorAll('.word-pill').forEach(pill => pill.draggable = false);
        showResults(won);
    }

    function giveUp() {
        if (timerInterval) { // Solo rendirse si el juego está en curso
             endGame(false);
        }
    }

    function resetGame() {
        conectores = [...conectoresOriginal]; // Restaurar lista completa
        resultsOverlay.classList.add('hidden');
        setupOverlay.classList.remove('hidden'); // Mostrar pantalla de configuración
        wordArea.innerHTML = ''; // Limpiar palabras
        currentScore = 0;
        currentScoreSpan.textContent = '0';
        totalPairsSpan.textContent = conectores.length;
        timeLeftSpan.textContent = '--:--'; // Resetear display timer
         stopTimer(); // Asegurarse que el timer está parado
    }

     function initializeGame() {
         setupOverlay.classList.add('hidden'); // Ocultar configuración
         const selectedMinutes = parseInt(timeSelect.value, 10);
         timeLeft = selectedMinutes * 60; // Establecer tiempo seleccionado
         renderWords();
         startTimer();
     }

    // --- Event Listeners ---
    giveUpBtn.addEventListener('click', giveUp);
    playAgainBtn.addEventListener('click', resetGame);
    startGameBtn.addEventListener('click', initializeGame);


    // --- Inicio ---
    // Mostrar la configuración inicial al cargar
    setupOverlay.classList.remove('hidden');
    // renderWords(); // No renderizar hasta que se pulse "Empezar"
    // updateTimerDisplay(); // Muestra el tiempo inicial antes de empezar

}); // Fin del DOMContentLoaded
