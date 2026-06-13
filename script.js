// =========================================
// LÓGICA DE SCROLL PREMIUM (ANTI RACE-CONDITION)
// =========================================
function desplazarToolbar(direccion) {
    const container = document.getElementById('toolbar-content');
    const scrollAmount = 350; 
    container.scrollBy({ left: direccion * scrollAmount, behavior: 'smooth' });
}

function actualizarFlechasScroll() {
    const container = document.getElementById('toolbar-content');
    const btnLeft = document.getElementById('scroll-left');
    const btnRight = document.getElementById('scroll-right');
    
    if (!container || !btnLeft || !btnRight) return;

    if (container.scrollLeft > 10) {
        btnLeft.classList.remove('oculto');
    } else {
        btnLeft.classList.add('oculto');
    }

    const maxScroll = container.scrollWidth - container.clientWidth;
    if (container.scrollLeft >= maxScroll - 10 && maxScroll > 0) {
        btnRight.classList.add('oculto');
    } else if (maxScroll > 0) {
        btnRight.classList.remove('oculto');
    } else {
        btnRight.classList.add('oculto');
    }
}

window.addEventListener('load', () => {
    const container = document.getElementById('toolbar-content');
    if (container) {
        container.addEventListener('scroll', actualizarFlechasScroll);
        
        const observer = new ResizeObserver(() => {
            actualizarFlechasScroll();
        });
        observer.observe(container);
        
        setTimeout(actualizarFlechasScroll, 100);
        setTimeout(actualizarFlechasScroll, 500);
        setTimeout(actualizarFlechasScroll, 1500);
    }
});

// =========================================
// REGISTRO DE SERVICE WORKER (PWA - OFFLINE)
// =========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('PWA Lista y funcionando offline'))
            .catch(err => console.log('Error al registrar PWA', err));
    });
}

// =========================================
// SISTEMA PREMIUM (TEMAS Y TOASTS)
// =========================================
function cargarTema() {
    const temaGuardado = localStorage.getItem('cmude_tema') || 'light';
    document.documentElement.setAttribute('data-theme', temaGuardado);
}
cargarTema(); 

function toggleTema() {
    const temaActual = document.documentElement.getAttribute('data-theme');
    const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nuevoTema);
    localStorage.setItem('cmude_tema', nuevoTema);
    mostrarToast(nuevoTema === 'dark' ? '🌙 Modo Oscuro activado' : '☀️ Modo Claro activado', 'info');
}

function mostrarToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerText = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); 
    }, 3000);
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-color')) {
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        let ripple = document.createElement('span');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple-efecto');
        e.target.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
});

document.execCommand('defaultParagraphSeparator', false, 'div');

function cambiarFormato(formato) {
    document.body.classList.remove('formato-bp', 'formato-altas', 'formato-masters');
    document.body.classList.add('formato-' + formato);
    
    if (formato === 'masters') {
        mostrarToast('👑 Formato cambiado a Másters', 'success');
    } else if (formato === 'altas') { 
        mostrarToast('⚔️ Formato cambiado a Altas', 'success');
    } else {
        mostrarToast('🏆 Formato cambiado a BP', 'success');
    }
}

// =========================================
// SISTEMA DE EDICIÓN RICH-TEXT (NOTION STYLE)
// =========================================
document.addEventListener('paste', function(e) {
    if (e.target.classList && e.target.classList.contains('apuntes') && 
        !e.target.classList.contains('resumen-verde') && 
        !e.target.classList.contains('call-box') && 
        !e.target.classList.contains('caja-eva')) {
        e.preventDefault();
        let text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
    }
});

document.addEventListener('selectionchange', () => {
    const toolbar = document.getElementById('format-toolbar');
    if (!toolbar) return;
    
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        
        const isInsideApuntes = container.nodeType === 3 ? 
            container.parentNode.closest('.apuntes') : 
            container.closest('.apuntes');
            
        if (isInsideApuntes && !isInsideApuntes.classList.contains('resumen-verde')) {
            const rect = range.getBoundingClientRect();
            const scrollY = window.scrollY || window.pageYOffset;
            const scrollX = window.scrollX || window.pageXOffset;
            
            let topPos = rect.top + scrollY - 45;
            let leftPos = rect.left + scrollX + (rect.width / 2) - (toolbar.offsetWidth / 2);
            
            if (leftPos < 10) leftPos = 10;
            if (leftPos + toolbar.offsetWidth > window.innerWidth - 10) {
                leftPos = window.innerWidth - toolbar.offsetWidth - 10;
            }
            
            toolbar.style.top = `${topPos}px`; 
            toolbar.style.left = `${leftPos}px`;
            
            toolbar.classList.add('visible');
            return;
        }
    }
    
    toolbar.classList.remove('visible');
});

function formatText(command, e) {
    e.preventDefault(); 
    document.execCommand(command, false, null);
}

function formatColor(color, e) {
    e.preventDefault();
    document.execCommand('foreColor', false, color);
}

function formatNormalColor(e) {
    e.preventDefault();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const defaultColor = isDark ? '#f8fafc' : '#1e293b'; 
    document.execCommand('foreColor', false, defaultColor);
}

function togglePanel(id) { document.getElementById(id).classList.toggle('oculto'); }
function toggleCaja(tipo) { document.body.classList.toggle('hide-' + tipo); }

function cambiarPOI(btn, cantidad) {
    const spanValor = btn.parentElement.querySelector('.poi-valor');
    let valor = parseInt(spanValor.innerText);
    valor += cantidad;
    if (valor < 0) valor = 0; 
    spanValor.innerText = valor;
}

function toggleFlecha(origen, destino, btnElement) {
    btnElement.classList.toggle('activa');
    if (btnElement.classList.contains('activa')) {
        const botonInverso = document.getElementById(`flecha-${destino}-${origen}`);
        if (botonInverso) botonInverso.classList.remove('activa');
    }
}

// =========================================
// CRONÓMETRO DUAL Y CAMPANAS
// =========================================
let segundos = 0;
let timerInterval = null;
let corriendo = false;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function cambiarModoTimer() {
    resetTimer();
    const modo = document.getElementById('modo-timer').value;
    let modoTexto = '';
    if (modo === 'orador') modoTexto = 'Orador (7:15m)';
    else if (modo === 'deliberacion') modoTexto = 'Deliberación (20m)';
    else if (modo === 'feedback') modoTexto = 'Feedback (15m)';
    mostrarToast(`⏱️ Modo cambiado a: ${modoTexto}`, 'info');
}

function tocarCampana(veces) {
    let i = 0;
    function sonar() {
        if (i >= veces) return;
        const osc = audioCtx.createOscillator();
        const ganancia = audioCtx.createGain();
        osc.connect(ganancia);
        ganancia.connect(audioCtx.destination);
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); 
        ganancia.gain.setValueAtTime(0, audioCtx.currentTime);
        ganancia.gain.linearRampToValueAtTime(1.5, audioCtx.currentTime + 0.05);
        ganancia.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 1.5);
        i++;
        setTimeout(sonar, 800); 
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    sonar();
}

function actualizarPantallaTimer() {
    let min = Math.floor(segundos / 60);
    let seg = segundos % 60;
    const display = document.getElementById('tiempo-display');
    display.classList.remove('reloj-latido');
    void display.offsetWidth; 
    display.classList.add('reloj-latido');
    display.innerText = (min < 10 ? "0" + min : min) + ":" + (seg < 10 ? "0" + seg : seg);
}

function toggleTimer() {
    const btn = document.getElementById('btn-timer');
    const modo = document.getElementById('modo-timer').value;
    
    if (corriendo) {
        clearInterval(timerInterval);
        btn.innerHTML = "▶ Play";
        btn.style.backgroundColor = "#27ae60";
        corriendo = false;
    } else {
        timerInterval = setInterval(() => {
            segundos++;
            actualizarPantallaTimer();
            if (modo === 'orador') {
                if (segundos === 60) tocarCampana(1);       
                if (segundos === 360) tocarCampana(1);      
                if (segundos === 420) tocarCampana(2);      
                if (segundos === 435) tocarCampana(4); 
            } else if (modo === 'feedback') {
                if (segundos === 900) tocarCampana(3); 
            }
        }, 1000);
        btn.innerHTML = "⏸ Pause";
        btn.style.backgroundColor = "#f39c12";
        corriendo = true;
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    segundos = 0;
    actualizarPantallaTimer();
    corriendo = false;
    const btn = document.getElementById('btn-timer');
    btn.innerHTML = "▶ Play";
    btn.style.backgroundColor = "#27ae60";
}

// =========================================
// SISTEMA DE JUECES DINÁMICOS Y AUTO-ORDEN
// =========================================
let contadorPanelistas = 1;

function agregarJuez(tipo) {
    const container = document.getElementById('otros-jueces-container');
    const nombre = tipo === 'panelista' ? `Panelista ${contadorPanelistas++}` : 'Trainee';

    const html = `
        <div class="juez-container">
            <div class="juez-header">
                <span contenteditable="true" class="juez-nombre">${nombre}</span>
                <button onclick="this.parentElement.parentElement.remove(); guardarDatos();" class="btn-eliminar-juez" title="Eliminar Juez">✖</button>
            </div>
            <ul class="lista-ranking-horizontal">
                <li class="item-ranking-hz" draggable="true">1. AG</li>
                <li class="item-ranking-hz" draggable="true">2. AO</li>
                <li class="item-ranking-hz" draggable="true">3. BG</li>
                <li class="item-ranking-hz" draggable="true">4. BO</li>
            </ul>
        </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = html;
    container.appendChild(div.firstElementChild);
    inicializarDragAndDrop(); 
    guardarDatos();
}

function autoOrdenarCall() {
    const equipos = { 'AG': 0, 'AO': 0, 'BG': 0, 'BO': 0 };
    const flechasActivas = document.querySelectorAll('.flecha-btn.activa');

    flechasActivas.forEach(btn => {
        const partes = btn.id.split('-');
        const ganador = partes[1];
        if (equipos[ganador] !== undefined) {
            equipos[ganador]++;
        }
    });

    const sortedTeams = Object.keys(equipos).sort((a, b) => equipos[b] - equipos[a]);
    const lista = document.getElementById('lista-ranking');
    const items = Array.from(lista.querySelectorAll('.item-ranking'));

    sortedTeams.forEach(equipo => {
        const item = items.find(el => el.getAttribute('data-equipo') === equipo);
        if (item) lista.appendChild(item); 
    });

    actualizarPosicionesRanking();
    mostrarToast('🪄 Call ordenado automáticamente según tus flechas', 'success');
}

// =========================================
// DRAG AND DROP (Vertical y Horizontal)
// =========================================
function inicializarDragAndDrop() {
    const listas = document.querySelectorAll('#lista-ranking, .lista-ranking-horizontal');

    listas.forEach(lista => {
        const items = lista.querySelectorAll('.item-ranking, .item-ranking-hz');

        items.forEach(item => {
            if(item.isDragInitialized) return;
            item.isDragInitialized = true;

            item.addEventListener('dragstart', () => {
                setTimeout(() => item.classList.add('dragging'), 0);
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                actualizarPosicionesRankingContext(lista);
                guardarDatos();
            });
        });

        if(lista.isDragInitialized) return;
        lista.isDragInitialized = true;

        lista.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            if(!draggable) return;

            const isListHz = lista.classList.contains('lista-ranking-horizontal');
            const isItemHz = draggable.classList.contains('item-ranking-hz');
            if (isListHz !== isItemHz) return;

            const afterElement = obtenerElementoPosterior(lista, isListHz ? e.clientX : e.clientY, isListHz);

            if (afterElement == null) {
                lista.appendChild(draggable);
            } else {
                lista.insertBefore(draggable, afterElement);
            }
        });
    });
}

function obtenerElementoPosterior(contenedor, coord, isHorizontal) {
    const claseItems = isHorizontal ? '.item-ranking-hz:not(.dragging)' : '.item-ranking:not(.dragging)';
    const draggables = [...contenedor.querySelectorAll(claseItems)];
    
    return draggables.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = isHorizontal ? 
            coord - box.left - box.width / 2 : 
            coord - box.top - box.height / 2;
            
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function actualizarPosicionesRankingContext(lista) {
    const isHorizontal = lista.classList.contains('lista-ranking-horizontal');
    const items = lista.querySelectorAll(':scope > li');
    
    items.forEach((item, index) => {
        if (isHorizontal) {
            const textoLimpio = item.innerText.replace(/^\d+\.\s*/, '');
            item.innerText = `${index + 1}. ${textoLimpio}`;
        } else {
            const posicionSpan = item.querySelector('.posicion');
            if (posicionSpan) posicionSpan.innerText = index + 1;
        }
    });
}

function actualizarPosicionesRanking() {
    const listaPrincipal = document.getElementById('lista-ranking');
    if(listaPrincipal) actualizarPosicionesRankingContext(listaPrincipal);
}

function validarCall() {
    const items = document.querySelectorAll('#lista-ranking .item-ranking');
    const ranking = Array.from(items).map(item => item.getAttribute('data-equipo'));
    const flechasActivas = document.querySelectorAll('.flecha-btn.activa');
    let hayChoques = false;

    flechasActivas.forEach(btn => {
        const partes = btn.id.split('-');
        const ganador = partes[1]; 
        const perdedor = partes[2]; 

        const indiceGanador = ranking.indexOf(ganador);
        const indicePerdedor = ranking.indexOf(perdedor);

        if(indiceGanador > indicePerdedor) { 
            mostrarToast(`⚠️ Choque: Marcaste que ${ganador} gana a ${perdedor}, pero ${perdedor} está más arriba.`, 'error');
            hayChoques = true;
        }
    });

    if(!hayChoques) {
        mostrarToast('✅ Call validado: Tu ranking coincide perfecto con tus flechas.', 'success');
    }
}

// =========================================
// MATRIZ DE DELIBERACIÓN Y SPK
// =========================================
function generarMatriz() {
    const bancadas = document.querySelectorAll('.bancada');
    const nombresBancadas = ["Alta de Gobierno (AG)", "Alta de Oposición (AO)", "Baja de Gobierno (BG)", "Baja de Oposición (BO)"];
    const contenedorMatriz = document.getElementById('matriz-deliberacion');
    contenedorMatriz.innerHTML = ''; 
    
    const btnCopiar = document.createElement('button');
    btnCopiar.className = 'btn-copiar-matriz matriz-animada';
    btnCopiar.innerHTML = '📋 Copiar Resumen para Feedback';
    btnCopiar.onclick = copiarMatrizParaFeedback;
    contenedorMatriz.appendChild(btnCopiar);
    
    bancadas.forEach((bancada, index) => {
        if (window.getComputedStyle(bancada).display === 'none') return;
        
        let totalSPK = 0;
        const spkInputs = bancada.querySelectorAll('.spk-orador');
        spkInputs.forEach(input => {
            const fila = input.closest('.orador-fila');
            if (window.getComputedStyle(fila).display !== 'none') {
                const val = parseInt(input.innerText.trim());
                if (!isNaN(val)) {
                    totalSPK += val;
                }
            }
        });

        const totalSPKHtml = totalSPK > 0 
            ? `<span style="float: right; background-color: #8e44ad; color: white; padding: 2px 10px; border-radius: 12px; font-size: 14px; box-shadow: var(--shadow-sm);">⭐ SPK Total: ${totalSPK}</span>` 
            : '';

        const resumen = bancada.querySelector('.resumen-verde').innerHTML.trim();
        const pos = bancada.querySelector('.eva-positiva').innerHTML.trim();
        const obs = bancada.querySelector('.eva-obs').innerHTML.trim();
        const neg = bancada.querySelector('.eva-negativa').innerHTML.trim();
        
        const flechasActivas = bancada.querySelectorAll('.flecha-btn.activa');
        let flechasHTML = '<div style="margin-bottom: 20px; text-align: center;">';
        if (flechasActivas.length > 0) {
            flechasActivas.forEach(flecha => {
                flechasHTML += `<span class="flecha-gana">${flecha.innerText}</span>`;
            });
        } else {
            flechasHTML += `<span style="font-size: 13px; color: var(--text-muted); font-style: italic;">Sin victorias marcadas</span>`;
        }
        flechasHTML += '</div>';

        let seccionesHTML = '';
        if (resumen && resumen !== '<br>') { seccionesHTML += `<div class="matriz-seccion" style="border-top: 4px solid #27ae60; background-color: var(--resumen-bg);"><strong style="color: #27ae60; display: block; margin-bottom: 8px; font-size: 16px;">📝 Resumen del Caso</strong><span style="color: var(--text-main);">${resumen}</span></div>`; }
        if (pos && pos !== '<br>') { seccionesHTML += `<div class="matriz-seccion" style="border-top: 4px solid #2ecc71;"><strong style="color: #2ecc71; display: block; margin-bottom: 8px; font-size: 15px;">+ A favor</strong><span style="color: var(--text-main);">${pos}</span></div>`; }
        if (obs && obs !== '<br>') { seccionesHTML += `<div class="matriz-seccion" style="border-top: 4px solid #bdc3c7;"><strong style="color: var(--text-muted); display: block; margin-bottom: 8px; font-size: 15px;">* Observaciones</strong><span style="color: var(--text-main);">${obs}</span></div>`; }
        if (neg && neg !== '<br>') { seccionesHTML += `<div class="matriz-seccion" style="border-top: 4px solid #e74c3c;"><strong style="color: #e74c3c; display: block; margin-bottom: 8px; font-size: 15px;">- En contra / Refutaciones</strong><span style="color: var(--text-main);">${neg}</span></div>`; }

        if (!seccionesHTML) { seccionesHTML = `<div style="text-align: center; color: var(--text-muted); padding: 15px; font-style: italic;">Sin apuntes en esta bancada</div>`; }
        
        const cuadro = document.createElement('div');
        cuadro.className = 'cuadro-matriz matriz-animada';
        cuadro.innerHTML = `<h3 style="overflow: hidden;">${nombresBancadas[index]} ${totalSPKHtml}</h3>${flechasHTML}${seccionesHTML}`;
        contenedorMatriz.appendChild(cuadro);
    });
    
    contenedorMatriz.style.display = 'grid';
    contenedorMatriz.scrollIntoView({ behavior: 'smooth', block: 'start' });
    mostrarToast('📊 Matriz actualizada y centrada', 'success');
}

function copiarMatrizParaFeedback() {
    const cuadros = document.querySelectorAll('.cuadro-matriz');
    let textoPlano = "🏆 RESUMEN DE DELIBERACIÓN\n\n";
    cuadros.forEach(cuadro => {
        const titulo = cuadro.querySelector('h3').innerText;
        textoPlano += `--- ${titulo} ---\n`;
        const flechas = cuadro.querySelectorAll('.flecha-gana');
        if (flechas.length > 0) {
            let victorias = [];
            flechas.forEach(f => victorias.push(f.innerText));
            textoPlano += "Victorias marcadas: " + victorias.join(" | ") + "\n";
        }
        const secciones = cuadro.querySelectorAll('.matriz-seccion');
        secciones.forEach(sec => { textoPlano += `${sec.innerText}\n`; });
        textoPlano += "\n";
    });
    navigator.clipboard.writeText(textoPlano).then(() => { mostrarToast('📋 Copiado al portapapeles con éxito', 'success'); })
    .catch(err => { mostrarToast('❌ Error al copiar', 'error'); });
}

// CONTROL DE MODALES
function toggleModalSPK() {
    const modal = document.getElementById('modal-spk');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}
function abrirModalLimpieza() { document.getElementById('modal-confirmacion').style.display = 'flex'; }
function cerrarModalLimpieza() { document.getElementById('modal-confirmacion').style.display = 'none'; }

window.onclick = function(event) {
    const modalSpk = document.getElementById('modal-spk');
    const modalConf = document.getElementById('modal-confirmacion');
    if (event.target === modalSpk) modalSpk.style.display = 'none';
    if (event.target === modalConf) modalConf.style.display = 'none';
}

// =========================================
// MAGIA DE AUTOGUARDADO (AMPLIADO)
// =========================================
function guardarDatos() {
    const backup = {};
    document.querySelectorAll('[contenteditable="true"]:not(.juez-nombre)').forEach((elemento, index) => { backup['texto_' + index] = elemento.innerHTML; });
    document.querySelectorAll('.flecha-btn').forEach((elemento, index) => { backup['flecha_' + index] = elemento.classList.contains('activa'); });
    document.querySelectorAll('.poi-valor').forEach((elemento, index) => { backup['poi_' + index] = elemento.innerText; });
    backup['formato'] = document.getElementById('selector-formato').value;
    
    const rankingList = document.getElementById('lista-ranking');
    if(rankingList) backup['ranking'] = rankingList.innerHTML;

    const otrosJueces = document.getElementById('otros-jueces-container');
    if(otrosJueces) backup['otros_jueces'] = otrosJueces.innerHTML;
    
    const apuntesLibres = document.getElementById('apuntes-libres-footer');
    if(apuntesLibres) backup['apuntes_libres'] = apuntesLibres.innerHTML;
    
    localStorage.setItem('cmude_backup', JSON.stringify(backup));
}

function cargarDatos() {
    const guardado = localStorage.getItem('cmude_backup');
    if (guardado) {
        const backup = JSON.parse(guardado);
        let hayDatosRestaurados = false;
        
        document.querySelectorAll('[contenteditable="true"]:not(.juez-nombre)').forEach((elemento, index) => {
            if (backup['texto_' + index] !== undefined && backup['texto_' + index] !== '') {
                elemento.innerHTML = backup['texto_' + index];
                hayDatosRestaurados = true;
            }
        });
        document.querySelectorAll('.flecha-btn').forEach((elemento, index) => { if (backup['flecha_' + index]) elemento.classList.add('activa'); });
        document.querySelectorAll('.poi-valor').forEach((elemento, index) => { if (backup['poi_' + index] !== undefined) elemento.innerText = backup['poi_' + index]; });
        
        if (backup['formato']) {
            document.getElementById('selector-formato').value = backup['formato'];
            cambiarFormato(backup['formato']);
        }
        
        if (backup['ranking']) {
            const rankingList = document.getElementById('lista-ranking');
            if(rankingList) rankingList.innerHTML = backup['ranking'];
        }

        if (backup['otros_jueces']) {
            const otrosJueces = document.getElementById('otros-jueces-container');
            if(otrosJueces) otrosJueces.innerHTML = backup['otros_jueces'];
            const cantPanelistas = document.querySelectorAll('.juez-nombre').length;
            if(cantPanelistas > 0) contadorPanelistas = cantPanelistas + 1;
        }

        if (backup['apuntes_libres']) {
            const apuntesLibres = document.getElementById('apuntes-libres-footer');
            if(apuntesLibres) apuntesLibres.innerHTML = backup['apuntes_libres'];
        }

        if(hayDatosRestaurados) {
            setTimeout(() => mostrarToast('♻️ Notas anteriores restauradas de forma automática', 'info'), 500);
        }
    }
    inicializarDragAndDrop(); 
}

function ejecutarLimpieza() {
    clearInterval(intervaloGuardado);
    localStorage.removeItem('cmude_backup');
    document.querySelectorAll('[contenteditable="true"]').forEach(el => el.innerHTML = '');
    document.querySelectorAll('.flecha-btn').forEach(el => el.classList.remove('activa'));
    document.querySelectorAll('.poi-valor').forEach(el => el.innerText = '0');
    window.location.href = window.location.pathname; 
}

window.onload = cargarDatos;
let intervaloGuardado = setInterval(guardarDatos, 2000);