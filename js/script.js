// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Datos del Juego ---
    // La variable 'conectoresOriginal' ahora viene del archivo 'js/connectors.js'
    // Asegúrate de que 'connectors.js' se carga ANTES que este script en el HTML.

    if (typeof conectoresOriginal === 'undefined') {
        console.error("ERROR: El archivo 'connectors.js' no se ha cargado correctamente o la variable 'conectoresOriginal' no está definida.");
        alert("Error al cargar los datos del juego. Revisa la consola.");
        return; // Detener la ejecución si los datos no están disponibles
    }

    let conectores = [...conectoresOriginal]; // Copia para poder reiniciar
    let currentScore = 0;
    let totalPairs = conectores.length;
    let draggedElement = null; // Para guardar el elemento que se está arrastrando
    let timerInterval = null;
    let timeLeft = 600; // Tiempo por defecto en segundos (10 minutos) - Se actualizará con la selección del usuario

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

        conectores = [...conectoresOriginal]; // Asegurarse de usar la lista fresca al renderizar
        totalPairs = conectores.length; // Actualizar el total por si cambia en connectors.js
        totalPairsSpan.textContent = totalPairs;
        currentScore = 0; // Resetear puntuación
        currentScoreSpan.textContent = currentScore;


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
    }

    // --- Funciones de Drag & Drop ---
    function handleDragStart(event) {
        // Solo permitir arrastrar si el juego está activo (timer corriendo)
         // Permitir arrastrar incluso si el timer no ha empezado (pero no después de acabar)
        if (!timerInterval && timeLeft <= 0 && currentScore !== totalPairs) return; // No arrastrar si el tiempo acabó y no se ganó
        if (resultsOverlay.classList.contains('hidden') === false) return; // No arrastrar si se muestran resultados


        draggedElement = event.target; // Guardar el elemento que se arrastra
        event.dataTransfer.setData('text/plain', event.target.dataset.id); // Necesario para Firefox
        event.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            // Asegurarse que el elemento todavía existe antes de añadir la clase
            if(draggedElement) {
                draggedElement.classList.add('dragging');
            }
        }, 0);
    }

    function handleDragEnd(event) {
        // Limpiar estilos y la variable de referencia
        if (draggedElement) {
             draggedElement.classList.remove('dragging');
        }
        draggedElement = null;
        // Quitar clase de feedback incorrecto si la hubiera, con un pequeño retraso
        // para no quitarla inmediatamente si el drop fue incorrecto
        setTimeout(() => {
            const incorrectElements = wordArea.querySelectorAll('.incorrect-match');
            incorrectElements.forEach(el => el.classList.remove('incorrect-match'));
        }, 100);
    }

    function handleDragOver(event) {
        event.preventDefault(); // Necesario para permitir el drop
         event.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(event) {
        event.preventDefault(); // Evita comportamiento por defecto (abrir como enlace, etc.)
        if (!draggedElement) return; // Si no hay elemento arrastrándose, salir

        const dropTarget = event.target;

        // Asegurarse que se suelta sobre OTRA píldora de palabra,
        // que no esté ya emparejada (oculta o con clase correct-match),
        // y que no sea sobre sí misma
        if (dropTarget.classList.contains('word-pill') &&
            !dropTarget.classList.contains('correct-match') &&
             dropTarget.style.visibility !== 'hidden' &&
            dropTarget !== draggedElement)
        {
            const draggedId = draggedElement.dataset.id;
            const draggedLang = draggedElement.dataset.lang;
            const targetId = dropTarget.dataset.id;
            const targetLang = dropTarget.dataset.lang;

            // Comprobar si la pareja es correcta: mismo ID, diferente idioma
            if (draggedId === targetId && draggedLang !== targetLang) {
                // ¡Pareja Correcta!
                // Aplicar estilo inmediatamente
                draggedElement.classList.add('correct-match');
                dropTarget.classList.add('correct-match');
                 draggedElement.classList.remove('dragging'); // Quitar estilo dragging

                // Deshabilitar drag & drop para estos elementos
                draggedElement.draggable = false;
                dropTarget.draggable = false;

                // Esperar a que termine la animación CSS para ocultarlos
                setTimeout(() => {
                     // Comprobar si los elementos aún existen y tienen la clase antes de ocultar
                    if (draggedElement && draggedElement.classList.contains('correct-match')) {
                         draggedElement.style.visibility = 'hidden';
                    }
                     if (dropTarget && dropTarget.classList.contains('correct-match')) {
                         dropTarget.style.visibility = 'hidden';
                     }
                }, 500); // Tiempo igual a la transición en CSS

                currentScore++;
                currentScoreSpan.textContent = currentScore;

                // Comprobar si se ha ganado
                if (currentScore === totalPairs) {
                    endGame(true); // Ganó
                }
            } else {
                // Pareja Incorrecta
                if(draggedElement) draggedElement.classList.add('incorrect-match');
                dropTarget.classList.add('incorrect-match');
                // Quitar la clase después de la animación de 'shake'
                setTimeout(() => {
                     if (draggedElement) draggedElement.classList.remove('incorrect-match');
                     // Asegurarse que dropTarget no fue emparejado correctamente mientras tanto
                     if (!dropTarget.classList.contains('correct-match')) {
                        dropTarget.classList.remove('incorrect-match');
                     }
                }, 500); // Ajustar si la animación 'shake' dura diferente
            }
        }
        // Si se suelta fuera de una píldora válida, dragend se encargará de limpiar la clase 'dragging'
         // Ya no necesitamos limpiar 'dragging' aquí explícitamente
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
                timeLeft = 0; // Asegurarse de que no sea negativo
                updateTimerDisplay(); // Mostrar 00:00
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

        // Rellenar la lista de respuestas correctas
        conectoresOriginal.forEach(pair => {
            const div = document.createElement('div');
            div.textContent = `${pair.en} = ${pair.es}`;
            correctPairsList.appendChild(div);
        });

         // Determinar el título del resultado
        let resultTitle = "Resultados";
        if (won) {
            resultTitle = "¡Felicidades, has ganado!";
        } else if (timeLeft <= 0) {
            resultTitle = "¡Se acabó el tiempo!";
        } else {
            // Se rindió
            resultTitle = "Te has rendido";
        }
        resultsOverlay.querySelector('h2').textContent = resultTitle;


        // Mostrar el overlay de resultados
        resultsOverlay.classList.remove('hidden');

        // Opcional: Ocultar las palabras restantes que no se emparejaron
        wordArea.querySelectorAll('.word-pill').forEach(pill => {
             if (!pill.classList.contains('correct-match') && pill.style.visibility !== 'hidden') {
                 pill.style.opacity = '0.5'; // Atenuar las no emparejadas
                 pill.draggable = false; // Asegurarse de que no se puedan arrastrar
             }
         });
    }

    function endGame(won) {
        stopTimer();
        // Deshabilitar drag de píldoras restantes
        wordArea.querySelectorAll('.word-pill').forEach(pill => pill.draggable = false);
        // No llamar a showResults inmediatamente si se ganó, esperar un poco
        if (won) {
            setTimeout(() => showResults(true), 600); // Pequeña pausa tras el último acierto
        } else {
             showResults(false);
        }
    }

    function giveUp() {
        // Solo rendirse si el juego ha empezado y no se ha acabado
         if (timerInterval || (timeLeft > 0 && currentScore < totalPairs)) {
            endGame(false);
         }
    }

    function resetGame() {
        // Ocultar resultados y limpiar área de juego
        resultsOverlay.classList.add('hidden');
        wordArea.innerHTML = '';

        // Resetear variables de estado
        currentScore = 0;
        currentScoreSpan.textContent = '0';
        totalPairsSpan.textContent = conectoresOriginal.length; // Releer por si acaso
        timeLeftSpan.textContent = '--:--'; // Resetear display timer
        draggedElement = null;
        stopTimer(); // Asegurarse que el timer está parado

        // Mostrar la pantalla de configuración de nuevo
        setupOverlay.classList.remove('hidden');
    }

     function initializeGame() {
         setupOverlay.classList.add('hidden'); // Ocultar configuración

         // Leer tiempo seleccionado y establecerlo
         const selectedMinutes = parseInt(timeSelect.value, 10);
         timeLeft = selectedMinutes * 60;

         // Renderizar las palabras (esto resetea puntuación y total visualmente)
         renderWords();

         // Iniciar el temporizador
         startTimer();
     }

    // --- Event Listeners ---
    giveUpBtn.addEventListener('click', giveUp);
    playAgainBtn.addEventListener('click', resetGame);
    startGameBtn.addEventListener('click', initializeGame);


    // --- Inicio ---
    // Asegurarse de que el overlay de configuración esté visible al cargar
    setupOverlay.classList.remove('hidden');
    // Inicializar el display del total de pares
    totalPairsSpan.textContent = conectoresOriginal.length;
    // No llamar a renderWords ni startTimer aquí, esperar al botón "Empezar Juego"

}); // Fin del DOMContentLoaded
