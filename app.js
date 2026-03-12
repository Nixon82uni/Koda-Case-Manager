import { createClient } from '@supabase/supabase-js';

// ==========================================
// KODA CASE MANAGER - APP.JS
// Lógica Funcional con Supabase (Vite / Vercel)
// ==========================================

// Importar configuración de Supabase desde las variables de entorno inyectadas por Vite o Vercel
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn("Faltan credenciales de Supabase en las variables de entorno. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Vercel (o en un archivo .env). La app usará la UI estática.");
        return;
    }

    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase inicializado correctamente desde variables de entorno.");
        await loadDashboardCases();
        await updateGlobalStats(); // Cargar estadísticas de arriba
    } catch(err) {
        console.error("Fallo al inicializar Supabase. Revisa tus credenciales.", err);
    }
});

// ==========================================
// 1. CARGA DE CASOS EN DASHBOARD
// ==========================================
async function loadDashboardCases(filter = 'all') {
    if(!supabase) return;

    try {
        let query = supabase.from('casos').select('*').order('fecha_apertura', { ascending: false });
        
        if(filter !== 'all') {
            query = query.eq('categoria_tramite', filter);
        }

        const { data: casos, error } = await query;

        if (error) throw error;

        renderCasesTable(casos);
    } catch (err) {
        console.error("Error cargando casos:", err);
    }
}

function renderCasesTable(casos) {
    const tableContainer = document.querySelector('.cases-table');
    if(!tableContainer) return;

    // Mantener la cabecera (primer hijo)
    const headerHtml = tableContainer.querySelector('.table-head').outerHTML;
    let html = headerHtml;

    if(!casos || casos.length === 0) {
        html += `<div style="padding:20px; text-align:center; color:var(--muted)">No hay casos en esta categoría.</div>`;
        tableContainer.innerHTML = html;
        return;
    }

    casos.forEach(caso => {
        // Determinar estilo de badge por tipo
        let badgeClass = 'badge-family';
        if(caso.categoria_tramite === 'Employment') badgeClass = 'badge-employment';
        if(caso.categoria_tramite === 'DACA') badgeClass = 'badge-daca';
        if(caso.categoria_tramite === 'TPS') badgeClass = 'badge-tps';

        // Determinar status dot
        let dotClass = 'dot-gray';
        if(caso.estado === 'Urgente') dotClass = 'dot-red';
        if(caso.estado === 'En proceso') dotClass = 'dot-yellow';
        if(caso.estado === 'Al día') dotClass = 'dot-green';

        html += `
        <div class="case-row" onclick="openCaseDetails('${caso.id}')">
            <div>
                <div class="client-name">${caso.nombre_cliente}</div>
                <div class="client-sub">#${caso.numero_caso} · ${caso.tipo_tramite}</div>
            </div>
            <div><span class="case-type-badge ${badgeClass}">${caso.categoria_tramite || caso.tipo_tramite}</span></div>
            <div><span class="status-dot"><span class="dot ${dotClass}"></span>${caso.estado}</span></div>
            <div class="progress-cell">
                <div class="prog-label">Cargando...</div>
                <div class="progress-bar"><div class="progress-fill" style="width:0%;background:var(--border)"></div></div>
            </div>
            <div>
                <div class="paralegal-avatar-sm">${caso.paralegal_asignado ? caso.paralegal_asignado.substring(0,2).toUpperCase() : 'NA'}</div>
            </div>
            <div style="font-size:11.5px;color:var(--muted)">Reciente</div>
            <div><button class="action-btn" onclick="event.stopPropagation(); abiertoPorBoton('${caso.id}')">Ver →</button></div>
        </div>
        `;
    });

    tableContainer.innerHTML = html;
    
    // Luego de pintar, cargar el progreso (documentos_koda) de cada caso
    casos.forEach(c => updateCaseProgressRow(c.id));
}

// Filtro interactivo
window.filterCases = function(el, type) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    
    let bdType = type;
    if(type === 'family') bdType = 'Family';
    if(type === 'employment') bdType = 'Employment';
    if(type === 'daca') bdType = 'DACA';
    if(type === 'tps') bdType = 'TPS';

    if(!supabase) return;
    
    loadDashboardCases(type === 'all' ? 'all' : bdType);
}

// ==========================================
// 1.5 ESTADÍSTICAS GLOBALES
// ==========================================
async function updateGlobalStats() {
    if(!supabase) return;
    
    try {
        // 1. Casos Activos y Aprobados (Asumimos "Completado" o "Cerrado" como aprobado, o todos los no-cerrados como activos)
        // Para este prototipo, contaremos todos como activos, excepto los que tengan un estado específico.
        const { data: todosLosCasos, error: errCasos } = await supabase.from('casos').select('id, estado');
        if(errCasos) throw errCasos;
        
        const casosActivos = todosLosCasos.filter(c => c.estado !== 'Cerrado' && c.estado !== 'Completado');
        const casosAprobados = todosLosCasos.filter(c => c.estado === 'Completado' || c.estado === 'Aprobado');
        
        const activelCount = casosActivos.length;
        const approvedCount = casosAprobados.length;
        
        // 2. Documentos Pendientes y Urgentes
        const { data: todosLosDocs, error: errDocs } = await supabase.from('documentos_koda').select('estado');
        if(errDocs) throw errDocs;
        
        const docsPendientes = todosLosDocs.filter(d => d.estado !== 'Recibido');
        const docsUrgentes = docsPendientes.filter(d => d.estado === 'Urgente');
        const docsRecibidos = todosLosDocs.filter(d => d.estado === 'Recibido');
        
        // 3. Progreso Global
        let pctGlobal = 0;
        if(todosLosDocs.length > 0) {
            pctGlobal = Math.round((docsRecibidos.length / todosLosDocs.length) * 100);
        }
        
        // DOM Updates
        
        // Sidebar Badges
        const badgeDashboard = document.getElementById('nav-badge-dashboard');
        const badgeMisCasos = document.getElementById('nav-badge-miscasos');
        
        if(badgeDashboard) badgeDashboard.textContent = todosLosCasos.length.toString();
        // Asumiendo que "Mis Casos" es una fracción simulada si no hay paralegal en sesión (simulamos 30% asignados)
        if(badgeMisCasos) badgeMisCasos.textContent = Math.max(1, Math.floor(todosLosCasos.length * 0.3)).toString();
        
        // Top Stats
        const statCasos = document.getElementById('stat-casos-activos');
        const statCasosDelta = document.getElementById('stat-casos-delta');
        
        const statDocs = document.getElementById('stat-docs-pend');
        const statDocsDelta = document.getElementById('stat-docs-urgentes');
        
        const statProg = document.getElementById('stat-progreso-global');
        const statProgDelta = document.getElementById('stat-progreso-txt');
        
        const statApr = document.getElementById('stat-aprobados');
        
        if(statCasos) statCasos.textContent = activelCount.toString();
        if(statCasosDelta) {
            statCasosDelta.textContent = `↑ ${activelCount > 0 ? 1 : 0} nuevos`; 
            statCasosDelta.className = 'stat-delta up';
        }
        
        if(statDocs) statDocs.textContent = docsPendientes.length.toString();
        if(statDocsDelta) {
            statDocsDelta.textContent = docsUrgentes.length > 0 ? `⚠ ${docsUrgentes.length} urgentes` : 'Todo normal';
            statDocsDelta.className = docsUrgentes.length > 0 ? 'stat-delta warn' : 'stat-delta up';
        }
        
        if(statProg) statProg.textContent = `${pctGlobal}%`;
        if(statProgDelta) statProgDelta.textContent = `De ${todosLosDocs.length} documentos totales`;
        
        if(statApr) statApr.textContent = approvedCount.toString();
        
    } catch(err) {
        console.error("Error cargando estadísticas", err);
    }
}

// ==========================================
// 2. DETALLE DE CASO
// ==========================================

let currentActiveCaseId = null;

window.openCaseDetails = async function(casoId) {
    if(!supabase) return openCase(casoId); // Fallback al mock original
    
    currentActiveCaseId = casoId;
    
    // Cerrar paneles abiertos o limpiar UI anterior (el HTML actual usa IDs fijos, lo adaptaremos)
    // Para simplificar la mezcla con el HTML existente, clonaremos/usaremos un panel maestro.
    
    try {
        // 1. Obtener datos del caso
        const { data: caso } = await supabase.from('casos').select('*').eq('id', casoId).single();
        if(!caso) return;
        
        // 2. Crear o actualizar panel en el DOM
        renderCasePanel(caso);
        
        // 3. Cargar sub-datos
        await loadCaseDocuments(casoId);
        await loadCaseNotes(casoId);
        await calculateTimeline(caso);
        
        // 4. Mostrar panel
        openCase(`dynamic-${casoId}`);
        
    } catch(err) {
        console.error("Error abriendo caso:", err);
    }
}

window.abiertoPorBoton = function(casoId) {
    openCaseDetails(casoId);
}

// ==========================================
// AUTO-LLENADO DE PLANTILLAS 
// (Se llamaría al crear un nuevo caso)
// ==========================================
async function autoFillDocuments(casoId, tipoTramite) {
    try {
        // Buscar plantilla
        const { data: docs } = await supabase.from('plantillas_documentos').select('*').eq('tipo_tramite', tipoTramite);
        
        if(docs && docs.length > 0) {
            const inserts = docs.map(d => ({
                caso_id: casoId,
                nombre_documento: d.nombre_documento,
                orden: d.orden
            }));
            
            await supabase.from('documentos_koda').insert(inserts);
        }
    } catch(e) {
        console.error("Error autollenando plantilla", e);
    }
}

// ==========================================
// 3. GESTIÓN DE DOCUMENTOS (CHECKLIST)
// ==========================================
async function loadCaseDocuments(casoId) {
    const { data: docs } = await supabase.from('documentos_koda').select('*').eq('caso_id', casoId).order('orden', {ascending: true});
    
    const container = document.getElementById(`dynamic-${casoId}-docs`);
    if(!container) return;
    
    if(!docs || docs.length === 0) {
        container.innerHTML = `<div class="doc-item"><div class="doc-name">No hay documentos requeridos.</div></div>`;
        return;
    }
    
    let html = '';
    docs.forEach(doc => {
        const isRecibido = doc.estado === 'Recibido';
        const isUrgente = doc.estado === 'Urgente';
        
        let statusColor = 'var(--muted)';
        let statusText = '⏳ Pendiente';
        
        if(isRecibido) { statusColor = 'var(--success)'; statusText = '✓ Recibido'; }
        if(isUrgente) { statusColor = 'var(--danger)'; statusText = '✕ Urgente'; }
        
        const dropboxIconStyle = doc.link_dropbox ? 'opacity:1;color:var(--accent)' : 'opacity:0.3;color:var(--muted)';
        const dropboxHref = doc.link_dropbox ? doc.link_dropbox : '#';
        
        html += `
        <div class="doc-item" onclick="toggleDocAction('${doc.id}', ${!isRecibido}, '${casoId}')">
            <div class="doc-checkbox ${isRecibido ? 'checked' : ''}">${isRecibido ? '✓' : ''}</div>
            <div class="doc-name ${isRecibido ? 'checked' : ''}">${doc.nombre_documento}</div>
            <a href="${dropboxHref}" target="${doc.link_dropbox ? '_blank' : '_self'}" class="dropbox-link" onclick="event.stopPropagation(); promptDropboxLink('${doc.id}', '${doc.link_dropbox || ''}', '${casoId}')" title="Vincular/Abrir Dropbox" style="${dropboxIconStyle}">
              <span style="font-size:14px;">⎘</span>
            </a>
            <span class="doc-status" style="color:${statusColor}">${statusText}</span>
        </div>
        `;
    });
    
    container.innerHTML = html;
}

window.toggleDocAction = async function(docId, setRecibido, casoId) {
    const nuevoEstado = setRecibido ? 'Recibido' : 'Pendiente';
    
    try {
        await supabase.from('documentos_koda').update({ estado: nuevoEstado }).eq('id', docId);
        
        // Recargar vista documentos
        await loadCaseDocuments(casoId);
        
        // Actualizar barra de progreso del registro en el dashboard
        updateCaseProgressRow(casoId);
        
        // Actualizar estadísticas globales
        updateGlobalStats();
        
    } catch(e) {
        console.error("Error toggle doc", e);
    }
}

window.promptDropboxLink = async function(docId, currentLink, casoId) {
    const url = prompt("Introduce el enlace de Dropbox para este documento:", currentLink !== 'null' ? currentLink : '');
    
    if(url !== null) { // Si no dio cancelar
        try {
            await supabase.from('documentos_koda').update({ link_dropbox: url }).eq('id', docId);
            await loadCaseDocuments(casoId);
        } catch(e) {
            console.error("Error guardando dropbox link", e);
        }
    }
}

async function updateCaseProgressRow(casoId) {
    if(!supabase) return;
    try {
        const { data: docs } = await supabase.from('documentos_koda').select('estado').eq('caso_id', casoId);
        if(!docs || docs.length === 0) return;
        
        const total = docs.length;
        const recibidos = docs.filter(d => d.estado === 'Recibido').length;
        const pct = Math.round((recibidos/total) * 100);
        
        // Intentar encontrar la barra en el DOM para actualizarla dinámicamente
        // Nota: esto requiere que la fila tenga un identificador adecuado, que en renderCasesTable está implícito en el onclick, pero mejorándolo usaríamos data-id en la fila.
        // Haremos un query select basándonos en el onclick.
        const row = document.querySelector(`.case-row[onclick="openCaseDetails('${casoId}')"]`);
        if(row) {
            const label = row.querySelector('.prog-label');
            const bar = row.querySelector('.progress-fill');
            if(label) label.textContent = `Docs: ${recibidos}/${total} · ${pct}%`;
            if(bar) {
                bar.style.width = `${pct}%`;
                bar.style.background = pct === 100 ? 'var(--success)' : (pct < 30 ? 'var(--danger)' : 'var(--accent)');
            }
        }
        
    } catch(e) {
        console.error("Error actualizando progress bar", e);
    }
}

// ==========================================
// 4. GESTIÓN DE NOTAS
// ==========================================
async function loadCaseNotes(casoId) {
    const { data: notas } = await supabase.from('notas_koda').select('*').eq('caso_id', casoId).order('created_at', {ascending: false});
    
    const container = document.getElementById(`dynamic-${casoId}-notes-list`);
    if(!container) return;
    
    if(!notas || notas.length === 0) {
        container.innerHTML = `<div class="note-item"><div class="note-text" style="color:var(--muted)">No hay notas aún.</div></div>`;
        return;
    }
    
    let html = '';
    notas.forEach(nota => {
        const isImportant = nota.nivel_importancia === 'importante';
        const dateStr = new Date(nota.created_at).toLocaleDateString() + ' ' + new Date(nota.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        html += `
        <div class="note-item ${isImportant ? 'important' : ''}">
            <div class="note-meta">${nota.autor} · ${dateStr} ${isImportant ? '· ⚠ Importante' : ''}</div>
            <div class="note-text">${nota.contenido}</div>
        </div>
        `;
    });
    
    container.innerHTML = html;
}

window.guardarNota = async function(casoId, btnElement) {
    const container = document.getElementById(`dynamic-${casoId}-notes-input`);
    const isImportant = container.dataset.important === 'true';
    const textarea = container.querySelector('textarea');
    const contenido = textarea.value.trim();
    
    if(!contenido) return;
    
    btnElement.textContent = "Guardando...";
    btnElement.disabled = true;
    
    try {
        await supabase.from('notas_koda').insert({
            caso_id: casoId,
            autor: 'Usuario Local', // Hardcoded for prototype
            nivel_importancia: isImportant ? 'importante' : 'normal',
            contenido: contenido
        });
        
        textarea.value = '';
        container.dataset.important = 'false';
        container.querySelector('.btn-ghost').style.borderColor = 'var(--border)';
        
        await loadCaseNotes(casoId);
    } catch(e) {
        console.error("Error guardando nota", e);
    } finally {
        btnElement.textContent = "Guardar nota";
        btnElement.disabled = false;
    }
}

window.toggleNotaImportante = function(btnElement, containerId) {
    const container = document.getElementById(containerId);
    const curr = container.dataset.important === 'true';
    container.dataset.important = (!curr).toString();
    
    if(!curr) {
        btnElement.style.borderColor = 'var(--danger)';
        btnElement.style.color = 'var(--danger)';
    } else {
        btnElement.style.borderColor = 'var(--border)';
        btnElement.style.color = 'var(--muted)';
    }
}

// ==========================================
// 5. ESTIMACIÓN VISA BULLETIN
// ==========================================
async function calculateTimeline(caso) {
    const container = document.getElementById(`dynamic-${caso.id}-timeline`);
    if(!container) return;
    
    if(!caso.priority_date) {
        container.innerHTML = `<div class="bulletin-case"><div class="bulletin-case-title">Sin Priority Date configurada para realizar estimaciones.</div></div>`;
        return;
    }
    
    try {
        // Consultar bulletin más reciente para su categoría
        const { data: bulletins } = await supabase.from('visa_bulletin').select('*').eq('categoria', caso.tipo_tramite).order('mes_boletin', {ascending: false}).limit(1);
        
        if(!bulletins || bulletins.length === 0) {
            container.innerHTML = `<div class="bulletin-case"><div class="bulletin-case-title">No hay datos de Visa Bulletin para la categoría ${caso.tipo_tramite}</div></div>`;
            return;
        }
        
        const bulletin = bulletins[0];
        
        const pd = new Date(caso.priority_date);
        const fad = new Date(bulletin.final_action_date);
        
        // Dif en meses (aproximada) 
        // Si fad >= pd, ya es corriente.
        // Si no, calcular diff. 
        let mesesFaltantes = (pd.getFullYear() - fad.getFullYear()) * 12;
        mesesFaltantes -= fad.getMonth();
        mesesFaltantes += pd.getMonth();
        
        let estimacionHtml = '';
        let pdDisplay = pd.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric'}).toUpperCase();
        let fadDisplay = fad.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric'}).toUpperCase();
        
        if (mesesFaltantes <= 0) {
            estimacionHtml = `<div style="font-size:16px;font-family:'DM Mono',monospace;color:var(--success)">CORRIENTE</div>`;
        } else {
            estimacionHtml = `<div style="font-size:16px;font-family:'DM Mono',monospace;color:var(--accent)">~${mesesFaltantes} meses</div>`;
        }
        
        // Progreso bar heurístico simple
        let pctVis = 100;
        if(mesesFaltantes > 0) {
            // Asumimos un max de 120 meses (10 años) para capar el visual
            pctVis = Math.max(5, 100 - ((mesesFaltantes / 120) * 100));
        }

        html = `
        <div class="bulletin-case">
            <div class="bulletin-case-title">Categoría: ${caso.tipo_tramite}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:14px">
              <div>
                <div style="font-size:10px;font-family:'DM Mono',monospace;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Priority Date</div>
                <div style="font-size:16px;font-family:'DM Mono',monospace;color:var(--accent)">${pdDisplay}</div>
              </div>
              <div>
                <div style="font-size:10px;font-family:'DM Mono',monospace;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">FAD Actual</div>
                <div style="font-size:16px;font-family:'DM Mono',monospace;color:var(--text)">${fadDisplay}</div>
              </div>
              <div>
                <div style="font-size:10px;font-family:'DM Mono',monospace;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Estimado disponible</div>
                ${estimacionHtml}
              </div>
            </div>
            
            <div class="progress-bar" style="height:8px;border-radius:4px">
              <div class="progress-fill" style="width:${pctVis}%;background:var(--accent)"></div>
            </div>
            
            <div style="font-size:11px;color:var(--muted);margin-top:6px">
                Calculado contra el boletín de ${new Date(bulletin.mes_boletin).toLocaleDateString('es-ES', {month:'long', year:'numeric'})}.
            </div>
        </div>
        `;
        
        container.innerHTML = html;
        
    } catch(e) {
        console.error("Error calculando timeline", e);
    }
}

// ==========================================
// RENDERIZADO DEL PANEL MAESTRO DINÁMICO
// ==========================================
function renderCasePanel(caso) {
    let panelHtml = `
    <div class="detail-panel" id="panel-dynamic-${caso.id}">
      <div class="panel-header">
        <div>
          <div class="panel-name">${caso.nombre_cliente}</div>
          <div class="panel-meta">#${caso.numero_caso} · ${caso.tipo_tramite} · Abierto ${new Date(caso.fecha_apertura).toLocaleDateString()}</div>
        </div>
        <button class="close-btn" onclick="closeCase('dynamic-${caso.id}')">✕</button>
      </div>

      <div class="panel-tabs">
        <div class="tab active" onclick="switchTab(this,'dynamic-${caso.id}','docs')">📄 Documentos</div>
        <div class="tab" onclick="switchTab(this,'dynamic-${caso.id}','notes')">💬 Notas</div>
        <div class="tab" onclick="switchTab(this,'dynamic-${caso.id}','timeline')">⏱ Bulletin / Estimado</div>
      </div>

      <div class="panel-body">
        <!-- DOCS TAB -->
        <div class="tab-content active" id="dynamic-${caso.id}-docs">
            Cargando documentos...
        </div>

        <!-- NOTES TAB -->
        <div class="tab-content" id="dynamic-${caso.id}-notes">
            <div id="dynamic-${caso.id}-notes-list" style="margin-bottom: 20px;">Cargando notas...</div>
            
            <div class="note-input-area" id="dynamic-${caso.id}-notes-input" data-important="false">
                <textarea class="note-textarea" placeholder="Agregar nota..."></textarea>
                <div style="display:flex;gap:8px;margin-top:8px">
                  <button class="btn btn-primary" style="font-size:12px;padding:7px 14px" onclick="guardarNota('${caso.id}', this)">Guardar nota</button>
                  <button class="btn btn-ghost" style="font-size:12px;padding:7px 14px" onclick="toggleNotaImportante(this, 'dynamic-${caso.id}-notes-input')">⚠ Marcar importante</button>
                </div>
            </div>
        </div>

        <!-- TIMELINE TAB -->
        <div class="tab-content" id="dynamic-${caso.id}-timeline">
            Cargando estimación Visa Bulletin...
        </div>
      </div>
    </div>
    `;
    
    // Inyectarlo en la vista si no existe, o reemplazarlo
    let container = document.getElementById(`panel-dynamic-${caso.id}`);
    const contentArea = document.querySelector('.content');
    
    if(container) {
        container.outerHTML = panelHtml;
    } else {
        // Añadirlo al final
        contentArea.insertAdjacentHTML('beforeend', panelHtml);
    }
}
