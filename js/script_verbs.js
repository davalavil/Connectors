// ==================================================
// js/script_verbs.js (AISLADO y MODULARIZADO)
// Lógica para el Juego de Práctica de Verbos
// ==================================================

const VerbsGame = (() => {
    'use strict'; // Habilitar modo estricto

    // --- Variables del Módulo (Privadas) ---
    let tableBody, btnRandom, btnInfinitive, btnPastSimple, btnPastParticiple,
        btnTranslation, btnCheck, feedbackDiv, containerElement, controlesDiv; // Referencias a elementos DOM
    let currentMode = null; // Modo de juego actual ('random', 'infinitive', etc.)
    let verbsToDisplay = []; // Array de verbos mostrados en la tabla
    let originalVerbDataMap = new Map(); // Mapa para guardar datos originales { key: verbData }

    // --- Comprobación de Datos Esenciales ---
    if (typeof verbList === 'undefined') {
        console.error("VERBS GAME ERROR: La variable 'verbList' no está definida. Asegúrate de que 'verbs.js' se haya cargado antes que 'script_verbs.js'.");
        // Retornar un objeto con funciones no operativas para evitar errores posteriores
        return {
            init: (container) => {
                console.error("VerbsGame no puede inicializar: 'verbList' no encontrada.");
                const feedback = container.querySelector('#verbs-feedback'); // Intentar encontrar feedback div
                if (feedback) feedback.textContent = "Error crítico: No se pudo cargar la lista de verbos.";
            },
            reset: () => {} // Función reset vacía
        };
    }

    // --- Funciones Privadas del Módulo ---

    /** Baraja un array in-place usando el algoritmo Fisher-Yates */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Intercambio de elementos
        }
        return array;
    }

    /** Obtiene el nombre de la cabecera según el índice de columna */
    function getHeaderName(colIndex) {
        const headers = ["Infinitivo", "Pasado Simple", "Pasado Participio", "Traducción"];
        return headers[colIndex] || "Desconocido";
    }

    /**
     * En modo 'random', asegura que cada fila tenga al menos un campo de entrada.
     * Si una fila no tiene inputs, elige una columna aleatoria (0-3) y la convierte en input.
     */
    function ensureOneInputPerRow() {
        if (!tableBody) return; // Salir si la tabla no existe
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const inputsInRow = row.querySelectorAll('input[type="text"]');
            // Si no hay inputs y la fila tiene datos asociados
            if (inputsInRow.length === 0 && originalVerbDataMap.has(row.dataset.verbKey)) {
                const cells = row.querySelectorAll('td');
                // Necesitamos al menos 5 celdas (4 de datos + 1 de tipo/acción)
                if (cells.length < 5) return;

                let randomIndex;
                // Elegir una columna aleatoria entre 0 y 3 (las de datos)
                do { randomIndex = Math.floor(Math.random() * 4); } while (randomIndex >= 4);

                const cellToChange = cells[randomIndex];
                const verbKey = row.dataset.verbKey;
                const originalData = originalVerbDataMap.get(verbKey);

                if (!originalData) { console.error("EnsureInput: Datos no encontrados para key:", verbKey); return; }

                cellToChange.innerHTML = ''; // Limpiar contenido de la celda
                const input = document.createElement('input');
                input.type = 'text';
                input.dataset.colIndex = randomIndex; // Guardar índice
                input.setAttribute('aria-label', `Respuesta para ${getHeaderName(randomIndex)} del verbo ${originalData[0]}`);
                input.addEventListener('blur', handleInputBlur); // Añadir listener
                cellToChange.appendChild(input);
            }
        });
    }

    /**
     * Comprueba la respuesta de UN input individual.
     * Aplica clases 'correct', 'partial', 'incorrect'.
     * Ignora inputs con clase 'revealed'.
     * @param {HTMLInputElement} input - El elemento input a comprobar.
     * @returns {boolean} `true` si es correcto o parcial, `false` si es incorrecto, vacío o revelado.
     */
    function checkSingleInput(input) {
        if (!input || input.classList.contains('revealed')) {
            return false; // Ignorar si no es válido o ya está revelado
        }

        const userAnswer = input.value.trim();
        const cell = input.closest('td');
        const row = input.closest('tr');

        // Validaciones robustas para evitar errores si el DOM cambia inesperadamente
        if (!row || !cell || !row.dataset.verbKey || typeof input.dataset.colIndex === 'undefined') {
             console.error("CheckSingleInput Error: Información DOM incompleta para el input:", input);
             input.classList.remove('correct', 'incorrect', 'partial'); // Limpiar clases
             input.classList.add('incorrect'); // Marcar como incorrecto por defecto en caso de error
             return false;
        }

        const verbKey = row.dataset.verbKey;
        const colIndex = parseInt(input.dataset.colIndex, 10); // Base 10 para parseInt
        const originalData = originalVerbDataMap.get(verbKey);

        // Validar que los datos existen y el índice es correcto
        if (!originalData || colIndex < 0 || colIndex >= originalData.length) {
            console.error("CheckSingleInput Error: Datos originales no encontrados o índice inválido para key:", verbKey, "Índice:", colIndex);
            input.classList.remove('correct', 'incorrect', 'partial');
            input.classList.add('incorrect');
            return false;
        }

        const correctAnswerString = originalData[colIndex];

        // Normalización: minúsculas, quitar espacios extra, manejar '/' y ',' como separadores
        const normalizeString = (str) => typeof str === 'string'
            ? str.toLowerCase().split(/[/,]/).map(s => s.trim()).filter(s => s !== '').sort().join('/') // Ordenar opciones para comparación consistente
            : '';

        const normalizedUserAnswer = normalizeString(userAnswer);
        const normalizedCorrectAnswer = normalizeString(correctAnswerString);

        // Caso especial: si la respuesta correcta normalizada es vacía (error en datos?)
        if (normalizedCorrectAnswer === '') {
             console.warn("Respuesta correcta normalizada vacía para:", verbKey, colIndex);
             input.classList.remove('correct', 'partial');
             input.classList.add(normalizedUserAnswer === '' ? '' : 'incorrect'); // Incorrecto si el usuario escribió algo
             if(normalizedUserAnswer !== '') input.placeholder = `Correcto: ${correctAnswerString}`;
             return false;
        }

        const possibleAnswers = normalizedCorrectAnswer.split('/'); // Opciones válidas
        const userAnswers = normalizedUserAnswer.split('/'); // Opciones del usuario (raro, pero por si acaso)

        // Limpiar clases de estado y placeholders/tooltips
        input.classList.remove('correct', 'incorrect', 'partial');
        input.placeholder = '';
        input.title = '';

        let isConsideredCorrectOrPartial = false;

        if (normalizedUserAnswer === '') {
            // Input vacío: no marcar en blur, se marcará en checkAllAnswers
        } else if (possibleAnswers.includes(normalizedUserAnswer)) { // El usuario ha escrito una de las opciones válidas
            // Verde si solo hay una opción o si ha escrito todas las opciones separadas por / (y ordenadas)
            if (possibleAnswers.length === 1 || normalizedUserAnswer === normalizedCorrectAnswer) {
                 input.classList.add('correct');
            } else { // Amarillo si es una opción válida pero hay otras
                 input.classList.add('partial');
                 const otherOptions = possibleAnswers.filter(ans => ans !== normalizedUserAnswer).join(' / ');
                 if (otherOptions) { input.title = `También válido: ${otherOptions}`; }
            }
            isConsideredCorrectOrPartial = true;
        } else { // Rojo: La respuesta no coincide con ninguna opción válida
            input.classList.add('incorrect');
            input.placeholder = `Correcto: ${correctAnswerString}`; // Mostrar respuesta/s correcta/s original/es
            isConsideredCorrectOrPartial = false;
        }

        return isConsideredCorrectOrPartial;
    }

     /** Manejador para el evento 'blur' en los inputs */
    function handleInputBlur(event) {
        checkSingleInput(event.target); // Comprobar el input que perdió el foco
    }

    /**
     * Manejador para el clic en el botón de revelar (icono 'ojo').
     * Muestra la respuesta correcta en los inputs de la fila, los marca como 'revealed',
     * los deshabilita y deshabilita el propio botón de revelar.
     */
    function handleRevealClick(event) {
        const button = event.target.closest('button'); // Asegurar que es el botón
        if (!button || button.disabled) return; // Salir si no es botón o ya está deshabilitado

        const row = button.closest('tr');
        if (!row || !row.dataset.verbKey) return; // Salir si no se encuentra la fila o su clave

        const verbKey = row.dataset.verbKey;
        const originalData = originalVerbDataMap.get(verbKey);

        if (!originalData) { console.error("RevealClick Error: Datos no encontrados para key:", verbKey); return; }

        const inputsInRow = row.querySelectorAll('input[type="text"]');

        inputsInRow.forEach(input => {
            const colIndex = parseInt(input.dataset.colIndex, 10);
            // Validar índice antes de acceder a originalData
            if (!isNaN(colIndex) && colIndex >= 0 && colIndex < 4) { // Solo columnas 0 a 3
                const correctAnswer = originalData[colIndex];
                input.value = correctAnswer; // Mostrar respuesta
                input.classList.remove('correct', 'partial', 'incorrect'); // Limpiar otros estados
                input.classList.add('revealed'); // Marcar como revelado
                input.placeholder = ''; input.title = ''; // Limpiar ayudas
                input.disabled = true; // Deshabilitar input
            }
        });
        button.disabled = true; // Deshabilitar botón 'ojo'
        button.style.opacity = '0.5'; // Atenuar botón
    }

     /**
      * Comprueba TODAS las respuestas al pulsar el botón "Comprobar Respuestas".
      * Marca los inputs vacíos como incorrectos, calcula puntuación final,
      * deshabilita todos los inputs y el botón de comprobar.
      */
    function checkAllAnswers() {
        // Validar que los elementos necesarios existen y hay un modo activo
        if (!currentMode || !tableBody || !feedbackDiv) {
            if(feedbackDiv) feedbackDiv.textContent = 'Error: No se puede comprobar. Inicia un modo de juego.';
            return;
        }

        const inputs = tableBody.querySelectorAll('input[type="text"]');
        let correctOrPartialCount = 0;
        let revealedCount = 0;
        let totalInputs = 0; // Contar solo inputs válidos encontrados
        let incorrectCount = 0;

        inputs.forEach(input => {
            // Validar que el input pertenece a una fila válida antes de procesar
            const row = input.closest('tr');
            if (!row || !row.dataset.verbKey || typeof input.dataset.colIndex === 'undefined') {
                 console.warn("Saltando input inválido en checkAllAnswers:", input);
                 return; // Saltar este input
            }
            totalInputs++; // Incrementar contador de inputs válidos

            if (input.classList.contains('revealed')) {
                revealedCount++;
                input.disabled = true; // Asegurar deshabilitado
            } else {
                const isCorrectOrPartial = checkSingleInput(input); // Comprobar/Marcar input
                if (isCorrectOrPartial) {
                    correctOrPartialCount++;
                } else {
                    // Si no es correcto/parcial Y está vacío, marcar explícitamente como incorrecto
                    if (input.value.trim() === '') {
                        input.classList.add('incorrect');
                        // Intentar mostrar la respuesta correcta en el placeholder
                        const verbKey = row.dataset.verbKey;
                        const colIndex = parseInt(input.dataset.colIndex, 10);
                        const originalData = originalVerbDataMap.get(verbKey);
                        if (originalData && colIndex >= 0 && colIndex < 4) {
                            input.placeholder = `Respuesta: ${originalData[colIndex]}`;
                        }
                    }
                    incorrectCount++; // Contar como incorrecto (incluye vacíos)
                }
                input.disabled = true; // Deshabilitar tras comprobar
            }
        });

        if (totalInputs === 0 && currentMode) {
            feedbackDiv.textContent = 'No hay respuestas que comprobar en este modo/tabla.';
        } else {
            // Construir mensaje de feedback final
            let feedbackMsg = `Resultado: ${correctOrPartialCount} correcta(s)/parcial(es), ${incorrectCount} incorrecta(s)`;
            if (revealedCount > 0) {
                feedbackMsg += `, ${revealedCount} revelada(s)`;
            }
            feedbackMsg += ` de ${totalInputs} pregunta(s).`;
            feedbackDiv.textContent = feedbackMsg;
        }

         // Deshabilitar botones de modo y el de comprobar
         disableModeButtons(true);
         if(btnCheck) btnCheck.disabled = true;
         // Deshabilitar también los botones de revelar restantes
         containerElement.querySelectorAll('.reveal-button:not(:disabled)').forEach(btn => {
             btn.disabled = true;
             btn.style.opacity = '0.5';
         });
    }


    /**
     * Prepara e inicia el juego para un modo específico.
     * Limpia la tabla, selecciona verbos, genera filas e inputs.
     * @param {string} mode - El modo de juego ('random', 'infinitive', etc.).
     */
    function startGame(mode) {
        // Validar elementos esenciales
        if (!tableBody || !feedbackDiv || !controlesDiv) {
            console.error("VerbsGame startGame Error: Faltan elementos DOM (tabla, feedback o controles).");
            if(feedbackDiv) feedbackDiv.textContent = "Error: No se pudo iniciar el juego.";
            return;
        }

        currentMode = mode; // Establecer modo actual
        feedbackDiv.textContent = 'Generando tabla de verbos...'; // Mensaje temporal
        feedbackDiv.style.color = 'inherit'; // Resetear color feedback
        tableBody.innerHTML = ''; // Limpiar tabla anterior
        originalVerbDataMap.clear(); // Limpiar mapa de datos

        // Seleccionar y barajar verbos de la lista global
        // Asegurarse de que verbList sigue siendo accesible
        if (typeof verbList === 'undefined' || verbList.length === 0) {
             feedbackDiv.textContent = 'Error: La lista de verbos está vacía o no se encontró.';
             return;
        }
        verbsToDisplay = shuffleArray([...verbList]); // Usar copia barajada

        // --- Generar Filas ---
        verbsToDisplay.forEach((verbData, displayIndex) => {
            // Validar entrada de verbo
            if (!Array.isArray(verbData) || verbData.length < 5) {
                console.warn("Saltando entrada de verbo inválida en startGame:", verbData);
                return; // Saltar esta entrada
            }

            const originalKey = `${verbData[0]}-${displayIndex}`; // Clave única (infinitivo + índice)
            originalVerbDataMap.set(originalKey, verbData); // Guardar datos originales

            const row = tableBody.insertRow();
            row.dataset.verbKey = originalKey; // Asociar clave a la fila

            // Crear celdas (0 a 4)
            for (let colIndex = 0; colIndex < 5; colIndex++) {
                const cell = row.insertCell();
                const text = verbData[colIndex] || ''; // Texto de la celda o vacío

                if (colIndex === 4) { // Columna 5: Tipo + Botón Revelar
                    const typeText = document.createElement('span');
                    typeText.textContent = text; // 'regular' o 'irregular'
                    typeText.style.marginRight = '10px';
                    cell.appendChild(typeText);

                    const revealBtn = document.createElement('button');
                    revealBtn.innerHTML = '👁️';
                    revealBtn.classList.add('reveal-button'); // Clase CSS
                    revealBtn.title = 'Mostrar respuestas (no contará como acierto)';
                    revealBtn.setAttribute('aria-label', `Mostrar respuestas para ${verbData[0]}`);
                    revealBtn.addEventListener('click', handleRevealClick); // Añadir listener
                    cell.appendChild(revealBtn);
                } else { // Columnas 0 a 3: Datos del verbo
                    let makeInput = false; // Determinar si es un input o texto
                    switch (mode) {
                        case 'random':          makeInput = Math.random() < 0.4; break; // 40% probabilidad
                        case 'infinitive':      makeInput = (colIndex === 0); break;
                        case 'past_simple':     makeInput = (colIndex === 1); break;
                        case 'past_participle': makeInput = (colIndex === 2); break;
                        case 'translation':     makeInput = (colIndex === 3); break;
                    }

                    if (makeInput) { // Crear input
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.dataset.colIndex = colIndex;
                        input.setAttribute('aria-label', `Respuesta para ${getHeaderName(colIndex)} del verbo ${verbData[0]}`);
                        input.addEventListener('blur', handleInputBlur); // Añadir listener blur
                        cell.appendChild(input);
                    } else { // Mostrar texto
                        cell.textContent = text;
                    }
                }
            }
        });

        // Asegurar input en modo aleatorio después de crear todas las filas
        if (mode === 'random') {
            ensureOneInputPerRow();
        }

        // Mensaje final y habilitar/deshabilitar botones
        feedbackDiv.textContent = 'Rellena las casillas y pulsa "Comprobar Respuestas". Usa 👁️ para revelar una fila.';
        disableModeButtons(false); // Habilitar botones de modo
        if(btnCheck) btnCheck.disabled = false; // Habilitar botón comprobar
    }

    /** Habilita o deshabilita los botones de selección de modo */
    function disableModeButtons(disable) {
        // Usar referencias guardadas en init
        if(btnRandom) btnRandom.disabled = disable;
        if(btnInfinitive) btnInfinitive.disabled = disable;
        if(btnPastSimple) btnPastSimple.disabled = disable;
        if(btnPastParticiple) btnPastParticiple.disabled = disable;
        if(btnTranslation) btnTranslation.disabled = disable;
    }


    // --- Funciones Públicas del Módulo ---

    /**
     * Inicializa el juego de verbos. Se llama cuando se muestra este juego.
     * Encuentra los elementos DOM dentro del contenedor y añade listeners.
     * @param {HTMLElement} container - El elemento contenedor principal del juego de verbos.
     */
    function init(container) {
        console.log("VerbsGame: Inicializando...");
        containerElement = container; // Guardar referencia al contenedor

        // --- Encontrar Elementos DOM usando IDs PREFIJADOS ---
        // (Ajusta los selectores si no usaste prefijos)
        controlesDiv = containerElement.querySelector('#verbs-controles');
        tableBody = containerElement.querySelector('#verb-table-body'); // Asumiendo que #verb-table y tbody no necesitan prefijo
        feedbackDiv = containerElement.querySelector('#verbs-feedback');

        // Botones dentro de #verbs-controles
        if (controlesDiv) {
            btnRandom = controlesDiv.querySelector('#verbs-btn-random');
            btnInfinitive = controlesDiv.querySelector('#verbs-btn-infinitive');
            btnPastSimple = controlesDiv.querySelector('#verbs-btn-past-simple');
            btnPastParticiple = controlesDiv.querySelector('#verbs-btn-past-participle');
            btnTranslation = controlesDiv.querySelector('#verbs-btn-translation');
        } else {
            console.error("VerbsGame Init Error: Contenedor de controles '#verbs-controles' no encontrado.");
        }

        // Botón de comprobar (puede estar fuera de controlesDiv)
        btnCheck = containerElement.querySelector('#verbs-btn-check');

        // --- Validar que los elementos esenciales se encontraron ---
        if (!tableBody || !feedbackDiv || !controlesDiv || !btnRandom || !btnCheck) {
            console.error("VerbsGame Init Error: No se encontraron uno o más elementos DOM esenciales dentro de:", containerElement);
            if (feedbackDiv) feedbackDiv.textContent = "Error al cargar la interfaz del juego de verbos.";
            // Deshabilitar cualquier botón encontrado para prevenir interacción
            disableModeButtons(true);
            if(btnCheck) btnCheck.disabled = true;
            return; // Detener inicialización
        }

        // --- Añadir Event Listeners (Solo una vez en init) ---
        // Se asume que los botones no se recrean dinámicamente después de init
        btnRandom.addEventListener('click', () => startGame('random'));
        btnInfinitive.addEventListener('click', () => startGame('infinitive'));
        btnPastSimple.addEventListener('click', () => startGame('past_simple'));
        btnPastParticiple.addEventListener('click', () => startGame('past_participle'));
        btnTranslation.addEventListener('click', () => startGame('translation'));
        btnCheck.addEventListener('click', checkAllAnswers);

        // --- Establecer Estado Inicial ---
        reset(); // Llamar a reset para asegurar estado limpio inicial
        console.log("VerbsGame: Inicializado correctamente.");
    }

    /**
     * Resetea el estado del juego de verbos. Se llama al salir del juego.
     * Limpia la tabla, el feedback, y resetea variables internas.
     */
    function reset() {
        console.log("VerbsGame: Reseteando...");
        // Resetear variables de estado
        currentMode = null;
        verbsToDisplay = [];
        originalVerbDataMap.clear();

        // Limpiar DOM (solo si los elementos fueron encontrados en init)
        if (tableBody) tableBody.innerHTML = '';
        if (feedbackDiv) {
            feedbackDiv.textContent = 'Selecciona un modo de juego para empezar.';
            feedbackDiv.style.color = ''; // Resetear color
        }

        // Habilitar/Deshabilitar botones a estado inicial
        disableModeButtons(false); // Habilitar botones de modo
        if(btnCheck) btnCheck.disabled = true; // Deshabilitar comprobar

        // No es necesario quitar listeners si se añadieron solo en init
        // y los elementos persisten. Si los elementos se recrearan,
        // habría que gestionar la eliminación de listeners.
    }

    // --- Exponer Funciones Públicas ---
    // Se devuelven las funciones que el script principal necesita llamar
    return {
        init: init,   // Función para inicializar el juego
        reset: reset  // Función para resetear el juego al salir
    };

})(); // Fin del IIFE que crea el módulo VerbsGame
