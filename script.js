document.execCommand('defaultParagraphSeparator', false, 'div');

function cambiarFormato(formato) {
    document.body.classList.remove('formato-bp', 'formato-altas', 'formato-masters');
    document.body.classList.add('formato-' + formato);
    
    const miCall = document.getElementById('mi-call-texto');
    const otrosCalls = document.getElementById('otros-calls-texto');
    
    if (formato === 'bp') {
        if (miCall.innerText.trim() === '>') miCall.innerText = '>>>';
        if (otrosCalls.innerText.includes('Principal: >')) {
            otrosCalls.innerHTML = 'Principal: &gt;&gt;&gt;<br>Panelista 1: &gt;&gt;&gt;<br>Panelista 2: &gt;&gt;&gt;<br>Trainee: &gt;&gt;&gt;';
        }
    } else { 
        if (miCall.innerText.trim() === '>>>') miCall.innerText = '>';
        if (otrosCalls.innerText.includes('Principal: >>>')) {
            otrosCalls.innerHTML = 'Principal: &gt;<br>Panelista 1: &gt;<br>Panelista 2: &gt;<br>Trainee: &gt;';
        }
    }
}

document.addEventListener('input', function(e) {
    if (e.target.classList && e.target.classList.contains('apuntes') && 
        !e.target.classList.contains('resumen-verde') && 
        !e.target.classList.contains('call-box')) {
        
        let sel = window.getSelection();
        if (!sel.rangeCount) return;
        
        let node = sel.anchorNode;
        let block = node.nodeType === 3 ? node.parentNode : node;
        let text = block.textContent.trim();
        
        if (text.startsWith('+')) {
            block.style.color = '#27ae60'; 
        } else if (text.startsWith('-')) {
            block.style.color = '#e74c3c'; 
        } else if (text.startsWith('*')) {
            block.style.color = '#7f8c8d'; 
        } else {
            block.style.color = '#3498db'; 
        }
    }
});

function togglePanel(id) {
    const panel = document.getElementById(id);
    panel.classList.toggle('oculto');
}

function toggleCaja(tipo) {
    document.body.classList.toggle('hide-' + tipo);
}

function cambiarColor(colorCodigo) {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('foreColor', false, colorCodigo);
}

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

let segundos = 0;
let timerInterval = null;
let corriendo = false;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

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
    document.getElementById('tiempo-display').innerText = 
        (min < 10 ? "0" + min : min) + ":" + (seg < 10 ? "0" + seg : seg);
}

function toggleTimer() {
    const btn = document.getElementById('btn-timer');
    if (corriendo) {
        clearInterval(timerInterval);
        btn.innerHTML = "▶ Play";
        btn.style.backgroundColor = "#27ae60";
        corriendo = false;
    } else {
        timerInterval = setInterval(() => {
            segundos++;
            actualizarPantallaTimer();
            if (segundos === 60) tocarCampana(1);       
            if (segundos === 360) tocarCampana(1);      
            if (segundos === 420) tocarCampana(2);      
            if (segundos === 435) tocarCampana(4);      
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

function generarMatriz() {
    const bancadas = document.querySelectorAll('.bancada');
    const nombresBancadas = ["Alta de Gobierno (AG)", "Alta de Oposición (AO)", "Baja de Gobierno (BG)", "Baja de Oposición (BO)"];
    const contenedorMatriz = document.getElementById('matriz-deliberacion');
    contenedorMatriz.innerHTML = ''; 
    
    bancadas.forEach((bancada, index) => {
        if (window.getComputedStyle(bancada).display === 'none') return;

        const pos = bancada.querySelector('.eva-positiva').innerHTML;
        const obs = bancada.querySelector('.eva-obs').innerHTML;
        const neg = bancada.querySelector('.eva-negativa').innerHTML;
        
        const flechasActivas = bancada.querySelectorAll('.flecha-btn.activa');
        let flechasHTML = '<div style="margin-bottom: 10px;">';
        if (flechasActivas.length > 0) {
            flechasActivas.forEach(flecha => {
                flechasHTML += `<span class="flecha-gana">${flecha.innerText}</span>`;
            });
        } else {
            flechasHTML += `<span style="font-size: 12px; color: #aaa;">Sin victorias marcadas</span>`;
        }
        flechasHTML += '</div>';
        
        const cuadro = document.createElement('div');
        cuadro.className = 'cuadro-matriz';
        
        cuadro.innerHTML = `
            <h3>${nombresBancadas[index]}</h3>
            ${flechasHTML}
            <div class="matriz-seccion seccion-positiva" style="border-left: 4px solid #2ecc71;">
                <strong>+ A favor:</strong><br>${pos ? pos : '<span style="color:#aaa;">(Vacío)</span>'}
            </div>
            <div class="matriz-seccion seccion-obs" style="border-left: 4px solid #bdc3c7;">
                <strong>* Observaciones:</strong><br>${obs ? obs : '<span style="color:#aaa;">(Vacío)</span>'}
            </div>
            <div class="matriz-seccion seccion-negativa" style="border-left: 4px solid #e74c3c;">
                <strong>- En contra / Refutaciones:</strong><br>${neg ? neg : '<span style="color:#aaa;">(Vacío)</span>'}
            </div>
        `;
        contenedorMatriz.appendChild(cuadro);
    });
    
    contenedorMatriz.style.display = 'grid';
}

function toggleModalSPK() {
    const modal = document.getElementById('modal-spk');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal-spk');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// =========================================
// MAGIA DE AUTOGUARDADO (ANTI-INFARTOS)
// =========================================

function guardarDatos() {
    const backup = {};
    
    // 1. Guarda todo el texto editable (Apuntes, Nombres, SPK)
    document.querySelectorAll('[contenteditable="true"]').forEach((elemento, index) => {
        backup['texto_' + index] = elemento.innerHTML;
    });
    
    // 2. Guarda las flechitas marcadas
    document.querySelectorAll('.flecha-btn').forEach((elemento, index) => {
        backup['flecha_' + index] = elemento.classList.contains('activa');
    });
    
    // 3. Guarda los contadores de POI
    document.querySelectorAll('.poi-valor').forEach((elemento, index) => {
        backup['poi_' + index] = elemento.innerText;
    });

    // 4. Guarda el formato de debate seleccionado
    backup['formato'] = document.getElementById('selector-formato').value;
    
    // Se guarda en el navegador
    localStorage.setItem('cmude_backup', JSON.stringify(backup));
}

function cargarDatos() {
    const guardado = localStorage.getItem('cmude_backup');
    if (guardado) {
        const backup = JSON.parse(guardado);
        
        // 1. Restaura textos
        document.querySelectorAll('[contenteditable="true"]').forEach((elemento, index) => {
            if (backup['texto_' + index] !== undefined) {
                elemento.innerHTML = backup['texto_' + index];
            }
        });
        
        // 2. Restaura flechas
        document.querySelectorAll('.flecha-btn').forEach((elemento, index) => {
            if (backup['flecha_' + index]) {
                elemento.classList.add('activa');
            }
        });
        
        // 3. Restaura POIs
        document.querySelectorAll('.poi-valor').forEach((elemento, index) => {
            if (backup['poi_' + index] !== undefined) {
                elemento.innerText = backup['poi_' + index];
            }
        });

        // 4. Restaura Formato
        if (backup['formato']) {
            document.getElementById('selector-formato').value = backup['formato'];
            cambiarFormato(backup['formato']);
        }
    }
}

function limpiarTodo() {
    if(confirm("⚠️ ¿Estás seguro de que deseas limpiar todo? Esto borrará todas las notas de la ronda y NO se puede deshacer.")) {
        // 1. Apagamos el autoguardado temporalmente para que no reviva los datos
        clearInterval(intervaloGuardado);
        
        // 2. Eliminamos el archivo de respaldo
        localStorage.removeItem('cmude_backup');
        
        // 3. Vaciamos la pantalla al instante por seguridad
        document.querySelectorAll('[contenteditable="true"]').forEach(el => el.innerHTML = '');
        document.querySelectorAll('.flecha-btn').forEach(el => el.classList.remove('activa'));
        document.querySelectorAll('.poi-valor').forEach(el => el.innerText = '0');
        
        // 4. Hacemos un reinicio limpio de la página
        window.location.href = window.location.pathname; 
    }
}

// Carga los datos apenas abres la página
window.onload = cargarDatos;

// Guardamos el intervalo en una variable para poder detenerlo cuando limpiemos
let intervaloGuardado = setInterval(guardarDatos, 2000);