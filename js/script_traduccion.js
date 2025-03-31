// ======================================================
// js/script_traduccion.js (AISLADO y MODULARIZADO)
// Lógica para el Juego de Práctica de Vocabulario
// ======================================================

const TraduccionGame = (() => {
    'use strict'; // Habilitar modo estricto

    // --- Variables del Módulo (Privadas) ---
    let btnModoIngEsp, btnModoEspIng, btnCopiar, btnBorrar, btnMostrarLista,
        modoActualDisplay, areaJuego, listaPalabrasDiv, contenidoListaDiv,
        listaInfoP, estadoGeneracionDiv, unidadesBotonesContainer, btnSelectAll,
        btnDeselectAll, numPalabrasSlider, numPalabrasInput, numPalabrasValorSpan,
        containerElement; // Referencias a elementos DOM
    let modo = 'ing-esp'; // Estado: modo de traducción actual
    let palabrasActuales = []; // Estado: palabras seleccionadas para la ronda actual
    const textoInicial = '<p class="info-message">Selecciona unidades, número de palabras y modo, luego haz clic en "Generar Palabras".</p>'; // Texto inicial mejorado

    // --- Comprobación de Datos Esenciales ---
    if (typeof listaIngEsp === 'undefined' || typeof listaEspIng === 'undefined') {
        console.error("TRADUCCION GAME ERROR: 'listaIngEsp' o 'listaEspIng' no están definidas. Asegúrate de que 'palabras.js' se haya cargado antes.");
        // Retornar objeto no operativo
        return {
            init: (container) => {
                console.error("TraduccionGame no puede inicializar: Listas de palabras no encontradas.");
                const feedback = container.querySelector('#traduccion-estado-generacion'); // Intentar buscar feedback div
                if (feedback) feedback.innerHTML = "<p class='error-message'>Error crítico: No se pudo cargar la lista de palabras.</p>";
            },
            reset: () => {}
        };
    }

    // --- Funciones Privadas del Módulo ---

    /** Obtiene la lista de palabras fuente según el modo actual */
    function obtenerListaFuente() {
        return modo === 'ing-esp' ? listaIngEsp : listaEspIng;
    }

    /** Obtiene las claves ('eng', 'esp') para mostrar y traducir según el modo */
    function obtenerClaves() {
        return modo === 'ing-esp' ? { mostrar: 'eng', traducir: 'esp' } : { mostrar: 'esp', traducir: 'eng' };
    }

    // --- Lógica Selección de Unidades ---
    /** Obtiene todas las unidades únicas disponibles de ambas listas */
    function obtenerUnidadesDisponibles() {
        const unidades = new Set();
        // Recorrer ambas listas para asegurar que se capturan todas las unidades
        listaIngEsp.forEach(p => { if (p && p.unit) unidades.add(p.unit); });
        listaEspIng.forEach(p => { if (p && p.unit) unidades.add(p.unit); });
        // Ordenar unidades numéricamente por "File X"
        return Array.from(unidades).sort((a, b) => {
            const matchA = a.match(/File (\d+)/);
            const matchB = b.match(/File (\d+)/);
            if (matchA && matchB) return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
            return a.localeCompare(b); // Orden alfabético para otros casos
        });
    }

    /** Renderiza los botones para seleccionar unidades */
    function renderizarBotonesUnidades() {
        if (!unidadesBotonesContainer) return; // Salir si el contenedor no existe
        unidadesBotonesContainer.innerHTML = ''; // Limpiar contenedor
        const unidades = obtenerUnidadesDisponibles();
        unidades.forEach(unidad => {
            const button = document.createElement('button');
            button.classList.add('unidad-btn', 'selected'); // Empezar seleccionadas por defecto
            button.textContent = unidad;
            button.dataset.unidad = unidad; // Guardar unidad en data attribute
            // El listener se añade por delegación en init
            unidadesBotonesContainer.appendChild(button);
        });
    }

    /** Manejador para clics en botones de unidad (usado con delegación) */
    function handleUnidadButtonClick(event) {
         if (event.target.classList.contains('unidad-btn')) {
             event.target.classList.toggle('selected'); // Cambiar estado seleccionado
             resetGameArea(); // Limpiar área de juego si cambian las unidades
         }
    }

    /** Selecciona o deselecciona todos los botones de unidad */
    function toggleAllUnidades(seleccionar) {
        if (!unidadesBotonesContainer) return;
        const botones = unidadesBotonesContainer.querySelectorAll('.unidad-btn');
        botones.forEach(btn => {
            if (seleccionar) btn.classList.add('selected');
            else btn.classList.remove('selected');
        });
        resetGameArea(); // Limpiar área de juego al cambiar todas las unidades
    }

    /** Devuelve un array con los nombres de las unidades seleccionadas */
    function obtenerUnidadesSeleccionadas() {
        const unidades = [];
        if (!unidadesBotonesContainer) return unidades;
        const botonesSeleccionados = unidadesBotonesContainer.querySelectorAll('.unidad-btn.selected');
        botonesSeleccionados.forEach(btn => { unidades.push(btn.dataset.unidad); });
        return unidades;
    }

    // --- Lógica Slider/Input Número de Palabras ---
    /** Sincroniza el valor del slider, input numérico y span */
    function sincronizarNumPalabras(sourceElement) {
        // Validar que todos los elementos existan
        if (!numPalabrasSlider || !numPalabrasInput || !numPalabrasValorSpan) {
            console.warn("TraduccionGame: Elementos del slider/input no encontrados.");
            return;
        }
        let valor = parseInt(sourceElement.value, 10);
        const min = parseInt(numPalabrasSlider.min, 10);
        const max = parseInt(numPalabrasSlider.max, 10);

        // Manejar valor inválido o fuera de rango
        if (isNaN(valor)) valor = parseInt(numPalabrasSlider.value, 10) || min; // Usar valor actual o min
        valor = Math.max(min, Math.min(valor, max)); // Asegurar que esté dentro de min/max

        // Actualizar elementos
        numPalabrasSlider.value = valor;
        numPalabrasInput.value = valor;
        numPalabrasValorSpan.textContent = valor;

        // Asegurar que el input numérico refleje el valor corregido si es necesario
        if (sourceElement.type === 'number' && sourceElement.value !== valor.toString()) {
            requestAnimationFrame(() => { numPalabrasInput.value = valor; });
        }
        resetGameArea(); // Limpiar área de juego si cambia el número de palabras
    }

    /** Baraja un array (Fisher-Yates) */
    function barajarArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- Generación de Palabras para la Ronda ---
    /** Filtra, selecciona y muestra las palabras en el área de juego */
    function generarPalabras() {
        // Validar elementos necesarios
        if (!areaJuego || !estadoGeneracionDiv) {
            console.error("TraduccionGame: areaJuego o estadoGeneracionDiv no encontrados.");
            return;
        }
        resetGameArea(); // Limpiar área y estado antes de generar

        // --- Obtener Configuración ---
        const unidadesSeleccionadas = obtenerUnidadesSeleccionadas();
        if (unidadesSeleccionadas.length === 0) {
            areaJuego.innerHTML = '<p class="error-message">⚠️ Debes seleccionar al menos una unidad para generar palabras.</p>';
            return;
        }

        let numPalabrasSolicitadas = 10; // Valor por defecto
         if (numPalabrasInput) {
            numPalabrasSolicitadas = parseInt(numPalabrasInput.value, 10);
            // Revalidar por si acaso
            const min = parseInt(numPalabrasInput.min, 10);
            const max = parseInt(numPalabrasInput.max, 10);
            if(isNaN(numPalabrasSolicitadas) || numPalabrasSolicitadas < min || numPalabrasSolicitadas > max) {
                numPalabrasSolicitadas = 10;
                sincronizarNumPalabras(numPalabrasInput); // Corregir y actualizar UI
            }
         }

        // --- Filtrar y Seleccionar Palabras ---
        let listaFiltrada = obtenerListaFuente();
        listaFiltrada = listaFiltrada.filter(palabra => palabra?.unit && unidadesSeleccionadas.includes(palabra.unit)); // Filtrar por unidades seleccionadas

        let numPalabrasASeleccionar = numPalabrasSolicitadas;
        let mensajeEstado = `Solicitadas: ${numPalabrasSolicitadas}. `;

        // Manejar casos sin palabras o menos palabras de las solicitadas
        if (listaFiltrada.length === 0) {
            const unidadesTexto = unidadesSeleccionadas.join(', ');
            areaJuego.innerHTML = `<p class="info-message">ℹ️ No hay palabras disponibles para las unidades (${unidadesTexto}) en el modo ${modo === 'ing-esp' ? 'Ing->Esp' : 'Esp->Ing'}.</p>`;
            estadoGeneracionDiv.textContent = '';
            return;
        } else if (listaFiltrada.length < numPalabrasSolicitadas) {
            numPalabrasASeleccionar = listaFiltrada.length;
            mensajeEstado += `Mostrando ${numPalabrasASeleccionar} (todas las disponibles).`;
        } else {
            mensajeEstado += `Mostrando ${numPalabrasASeleccionar}.`;
        }
        estadoGeneracionDiv.textContent = mensajeEstado;

        // Seleccionar y guardar palabras para la ronda
        const palabrasSeleccionadas = barajarArray([...listaFiltrada]).slice(0, numPalabrasASeleccionar);
        palabrasActuales = palabrasSeleccionadas; // Guardar estado

        // --- Renderizar Filas en el DOM ---
        const claves = obtenerClaves();
        const fragment = document.createDocumentFragment(); // Optimizar renderizado
        palabrasSeleccionadas.forEach((palabra, index) => {
            // Crear fila y elementos (validando datos de palabra)
            const fila = document.createElement('div');
            fila.classList.add('fila-palabra');
            fila.id = `traduccion-fila-${index}`; // ID específico con prefijo implícito

            const palabraMostradaDiv = document.createElement('div');
            palabraMostradaDiv.classList.add('palabra-mostrada');
            palabraMostradaDiv.textContent = palabra?.[claves.mostrar] ?? 'Error_Dato'; // Usar ?? para fallback

            const unidadDiv = document.createElement('div');
            unidadDiv.classList.add('unidad');
            unidadDiv.textContent = palabra?.unit ? `(${palabra.unit})` : '';

            const inputRespuesta = document.createElement('input');
            inputRespuesta.type = 'text';
            inputRespuesta.classList.add('respuesta-usuario');
            inputRespuesta.id = `traduccion-respuesta-${index}`; // ID específico
            inputRespuesta.dataset.correcta = palabra?.[claves.traducir] ?? ''; // Guardar respuesta correcta
            inputRespuesta.placeholder = `Escribe ${claves.traducir === 'eng' ? 'en Inglés' : 'en Español'}...`;
            // Listener se añade por delegación en init

            const resultadoDiv = document.createElement('div');
            resultadoDiv.classList.add('resultado');
            resultadoDiv.id = `traduccion-resultado-${index}`; // ID específico

            // Añadir elementos a la fila
            fila.appendChild(palabraMostradaDiv);
            fila.appendChild(unidadDiv);
            fila.appendChild(inputRespuesta);
            fila.appendChild(resultadoDiv);
            fragment.appendChild(fila); // Añadir fila al fragmento
        });
        areaJuego.appendChild(fragment); // Añadir todas las filas al DOM de una vez

        // Ocultar lista si estaba visible al generar nuevas palabras
        if(listaPalabrasDiv) listaPalabrasDiv.classList.add('hidden');
    }

    // --- Comprobar Respuesta Individual (usado con delegación) ---
    /** Comprueba la respuesta del input y actualiza el div de resultado */
    function comprobarRespuesta(evento) {
        const input = evento.target;
        // Asegurarse de que el evento viene de un input de respuesta de este juego
        if (!input || !input.classList.contains('respuesta-usuario') || !input.id.startsWith('traduccion-respuesta-')) {
            return;
        }

        const respuestaUsuario = input.value.trim();
        const respuestaCorrecta = input.dataset.correcta ? input.dataset.correcta.trim() : '';
        const index = input.id.split('-')[2]; // Obtener índice del ID
        const resultadoDiv = containerElement.querySelector(`#traduccion-resultado-${index}`); // Buscar dentro del contenedor

        if (!resultadoDiv) return; // Salir si no se encuentra el div de resultado

        // Limpiar resultado si el input está vacío
        if (respuestaUsuario === '') {
            resultadoDiv.textContent = '';
            resultadoDiv.className = 'resultado'; // Resetear clases
            return;
        }

        // Normalizar para comparación insensible a mayúsculas/minúsculas y acentos
        const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Comparar respuestas normalizadas
        if (normalize(respuestaUsuario) === normalize(respuestaCorrecta)) {
            resultadoDiv.textContent = 'SÍ';
            resultadoDiv.className = 'resultado resultado-correcto';
        } else {
            resultadoDiv.textContent = 'NO';
            resultadoDiv.className = 'resultado resultado-incorrecto';
        }
    }

    // --- Borrar Contenido de Inputs y Resultados ---
    /** Limpia los campos de respuesta y los indicadores de resultado */
    function borrarRespuestas() {
        if (!areaJuego) return;
        const inputs = areaJuego.querySelectorAll('.respuesta-usuario');
        const resultados = areaJuego.querySelectorAll('.resultado');
        inputs.forEach(input => input.value = ''); // Vaciar inputs
        resultados.forEach(resultado => {
            if(resultado) {
                resultado.textContent = ''; // Limpiar texto (SÍ/NO)
                resultado.className = 'resultado'; // Quitar clases de color
            }
        });
        // Opcional: dar foco al primer input
        // if (inputs.length > 0) inputs[0].focus();
    }

     // --- Limpiar Área de Juego y Estado Interno ---
     /** Resetea el área de juego a su estado inicial */
     function resetGameArea() {
         if (areaJuego) areaJuego.innerHTML = textoInicial; // Mostrar mensaje inicial
         if (estadoGeneracionDiv) estadoGeneracionDiv.textContent = ''; // Limpiar mensaje de estado
         if (listaPalabrasDiv) listaPalabrasDiv.classList.add('hidden'); // Asegurar que la lista esté oculta
         palabrasActuales = []; // Resetear array de palabras actuales
     }

    // --- Mostrar/Ocultar Lista de Referencia ---
    /** Alterna la visibilidad de la lista y la puebla con las palabras relevantes */
    function toggleLista() {
        // Validar elementos necesarios
        if (!listaPalabrasDiv || !listaInfoP || !contenidoListaDiv) return;

        listaPalabrasDiv.classList.toggle('hidden'); // Alternar visibilidad
        listaInfoP.textContent = ''; // Limpiar info previa

        // Si la lista se va a mostrar, llenarla
        if (!listaPalabrasDiv.classList.contains('hidden')) {
            contenidoListaDiv.innerHTML = ''; // Limpiar contenido anterior
            let listaFuente = obtenerListaFuente();
            const claves = obtenerClaves();
            const unidadesSeleccionadasLista = obtenerUnidadesSeleccionadas();
            let infoUnidades = "Ninguna unidad seleccionada";
            let todasLasUnidades = obtenerUnidadesDisponibles();

            // Filtrar lista según unidades seleccionadas
            if (unidadesSeleccionadasLista.length > 0) {
                listaFuente = listaFuente.filter(palabra => palabra?.unit && unidadesSeleccionadasLista.includes(palabra.unit));
                if (unidadesSeleccionadasLista.length === todasLasUnidades.length) infoUnidades = "Todas las unidades";
                else infoUnidades = `Unidades: ${unidadesSeleccionadasLista.join(', ')}`;
            } else {
                listaFuente = []; // Lista vacía si no hay unidades seleccionadas
            }
            listaInfoP.textContent = `Mostrando lista para: ${infoUnidades}. (${listaFuente.length} palabras)`; // Mostrar info y contador

            // Poblar la lista si hay palabras
            if (listaFuente && listaFuente.length > 0) {
                // Ordenar alfabéticamente por la palabra mostrada
                const listaOrdenada = [...listaFuente].sort((a, b) => {
                    const valA = a?.[claves.mostrar] ?? '';
                    const valB = b?.[claves.mostrar] ?? '';
                    // Comparación local, insensible a mayúsculas/acentos
                    return valA.localeCompare(valB, undefined, { sensitivity: 'base' });
                });

                const fragment = document.createDocumentFragment(); // Usar fragmento para eficiencia
                listaOrdenada.forEach(palabra => {
                    const p = document.createElement('p');
                    const pMostrada = palabra?.[claves.mostrar] ?? '?';
                    const pUnit = palabra?.unit ?? '?';
                    const pTraducida = palabra?.[claves.traducir] ?? '?';
                    // Usar innerHTML para formateo simple (negrita, span)
                    p.innerHTML = `<strong>${pMostrada}</strong> <span class="unidad-lista">(${pUnit})</span> = ${pTraducida}`;
                    fragment.appendChild(p);
                });
                contenidoListaDiv.appendChild(fragment); // Añadir todo al DOM

            } else if (unidadesSeleccionadasLista.length > 0) {
                contenidoListaDiv.innerHTML = '<p>No hay palabras para mostrar con la selección actual de unidades.</p>';
            } else {
                contenidoListaDiv.innerHTML = '<p>Selecciona al menos una unidad para ver la lista de referencia.</p>';
            }
            // Scroll al inicio de la lista al mostrarla
             // contenidoListaDiv.scrollTop = 0;
             // listaPalabrasDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Opcional
        }
    }

    // --- Cambiar Modo de Traducción ---
    /** Actualiza el modo (ing-esp / esp-ing) y resetea el área de juego */
    function cambiarModo(nuevoModo) {
        if (modo === nuevoModo) return; // No hacer nada si ya está en ese modo
        modo = nuevoModo; // Actualizar estado interno
        if(modoActualDisplay) modoActualDisplay.textContent = `Modo: ${modo === 'ing-esp' ? 'Inglés -> Español' : 'Español -> Inglés'}`;
        resetGameArea(); // Limpiar área de juego al cambiar de modo
    }


    // --- Funciones Públicas del Módulo ---

    /**
     * Inicializa el juego de traducción. Busca elementos DOM y añade listeners.
     * @param {HTMLElement} container - El elemento contenedor principal del juego.
     */
    function init(container) {
        console.log("TraduccionGame: Inicializando...");
        containerElement = container; // Guardar referencia al contenedor

        // --- Encontrar Elementos DOM (Usando IDs prefijados) ---
        btnModoIngEsp = containerElement.querySelector('#traduccion-btn-modo-ing-esp');
        btnModoEspIng = containerElement.querySelector('#traduccion-btn-modo-esp-ing');
        btnCopiar = containerElement.querySelector('#traduccion-btn-copiar');
        btnBorrar = containerElement.querySelector('#traduccion-btn-borrar');
        btnMostrarLista = containerElement.querySelector('#traduccion-btn-mostrar-lista');
        modoActualDisplay = containerElement.querySelector('#traduccion-modo-actual');
        areaJuego = containerElement.querySelector('#traduccion-area-juego');
        listaPalabrasDiv = containerElement.querySelector('#traduccion-lista-palabras');
        contenidoListaDiv = containerElement.querySelector('#traduccion-contenido-lista');
        listaInfoP = containerElement.querySelector('#traduccion-lista-info');
        estadoGeneracionDiv = containerElement.querySelector('#traduccion-estado-generacion');
        unidadesBotonesContainer = containerElement.querySelector('#traduccion-unidades-botones-container');
        btnSelectAll = containerElement.querySelector('#traduccion-btn-select-all');
        btnDeselectAll = containerElement.querySelector('#traduccion-btn-deselect-all');
        numPalabrasSlider = containerElement.querySelector('#traduccion-num-palabras-slider');
        numPalabrasInput = containerElement.querySelector('#traduccion-num-palabras-input');
        numPalabrasValorSpan = containerElement.querySelector('#traduccion-num-palabras-valor');

        // --- Validar Elementos Esenciales ---
        if (!btnModoIngEsp || !btnCopiar || !areaJuego || !unidadesBotonesContainer || !numPalabrasSlider || !numPalabrasInput || !numPalabrasValorSpan) {
             console.error("TraduccionGame Init Error: No se encontraron uno o más elementos DOM esenciales dentro de:", containerElement);
             if(areaJuego) areaJuego.innerHTML = "<p class='error-message'>Error al cargar la interfaz del juego de vocabulario.</p>";
             // Podríamos deshabilitar botones si se encuentran
             if(btnCopiar) btnCopiar.disabled = true;
             return; // Detener inicialización
        }

        // --- Añadir Event Listeners (Una sola vez) ---
        btnModoIngEsp.addEventListener('click', () => cambiarModo('ing-esp'));
        btnModoEspIng.addEventListener('click', () => cambiarModo('esp-ing'));
        btnCopiar.addEventListener('click', generarPalabras);
        btnBorrar.addEventListener('click', borrarRespuestas);
        btnMostrarLista.addEventListener('click', toggleLista);
        btnSelectAll.addEventListener('click', () => toggleAllUnidades(true));
        btnDeselectAll.addEventListener('click', () => toggleAllUnidades(false));
        numPalabrasSlider.addEventListener('input', () => sincronizarNumPalabras(numPalabrasSlider));
        numPalabrasInput.addEventListener('input', () => sincronizarNumPalabras(numPalabrasInput));
        numPalabrasInput.addEventListener('change', () => sincronizarNumPalabras(numPalabrasInput)); // Captura Enter o pérdida de foco

        // Listener para botones de unidad (Delegación)
        unidadesBotonesContainer.addEventListener('click', handleUnidadButtonClick);

        // Listener para inputs de respuesta (Delegación en areaJuego)
        areaJuego.addEventListener('input', comprobarRespuesta); // Usar 'input' para respuesta en tiempo real


        // --- Inicialización Final ---
        renderizarBotonesUnidades(); // Crear botones de unidades
        sincronizarNumPalabras(numPalabrasSlider); // Establecer valor inicial slider/input
        reset(); // Llamar a reset para estado inicial limpio
        console.log("TraduccionGame: Inicializado correctamente.");
    }

    /**
     * Resetea el estado del juego de traducción. Se llama al salir del juego.
     * Limpia el área de juego, resetea el modo y las palabras actuales.
     */
    function reset() {
        console.log("TraduccionGame: Reseteando...");
        // Resetear estado interno
        modo = 'ing-esp'; // Volver al modo por defecto
        palabrasActuales = [];

        // Resetear UI
        resetGameArea(); // Limpia área de juego y muestra texto inicial
        if (modoActualDisplay) modoActualDisplay.textContent = `Modo: Inglés -> Español`; // Resetear texto modo

        // Opcional: Resetear configuración a valores por defecto
        // if (unidadesBotonesContainer) toggleAllUnidades(true); // Reseleccionar todas las unidades
        // if (numPalabrasSlider) {
        //     numPalabrasSlider.value = 10; // Resetear slider
        //     sincronizarNumPalabras(numPalabrasSlider); // Actualizar input/span
        // }
    }

    // --- Exponer Funciones Públicas ---
    return {
        init: init,   // Función para inicializar
        reset: reset  // Función para resetear
    };

})(); // Fin del IIFE que crea el módulo TraduccionGame
