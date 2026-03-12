import { createClient } from '@supabase/supabase-js';

// ==========================================
// KODA CASE MANAGER - APP.JS
// Lógica Funcional con Supabase (Vite / Vercel)
// ==========================================

// Importar configuración de Supabase desde las variables de entorno inyectadas por Vite o Vercel
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;

// ==========================================
// ESTADO DE LA SESIÓN LOCAL (Mock Login)
// ==========================================
let currentUserRole = 'Admin'; 
let currentUserId = 'ML'; // Initials of the paralegal/admin

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn("Faltan credenciales de Supabase en las variables de entorno. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Vercel (o en un archivo .env). La app usará la UI estática.");
        return;
    }

    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase inicializado correctamente desde variables de entorno.");
        
        applyRoleRestrictions();
        await loadDashboardCases('all');
        await updateGlobalStats(); // Cargar estadísticas de arriba
    } catch(err) {
        console.error("Fallo al inicializar Supabase. Revisa tus credenciales.", err);
    }
});

// ==========================================
// 1. CARGA DE CASOS EN DASHBOARD
// ==========================================

function applyRoleRestrictions() {
    const navTodos = document.getElementById('nav-todos');
    const avatar = document.getElementById('current-user-avatar');
    const name = document.getElementById('current-user-name');
    const roleTxt = document.getElementById('current-user-role');
    
    if(currentUserRole === 'Paralegal') {
        if(navTodos) navTodos.style.display = 'none'; // Paralegals don't see all cases
        roleTxt.textContent = 'Paralegal';
        // Go default to 'mis-casos'
        window.setNav(document.getElementById('nav-miscasos'), 'mis-casos');
    } else {
        if(navTodos) navTodos.style.display = 'flex';
        roleTxt.textContent = 'Admin';
    }
    avatar.textContent = currentUserId;
}

// Function triggered by clicking the profile in sidebar (para dev/demo)
window.toggleRole = function() {
    currentUserRole = currentUserRole === 'Admin' ? 'Paralegal' : 'Admin';
    applyRoleRestrictions();
    // Default redirect on role switch
    if(currentUserRole === 'Admin') {
        window.setNav(document.getElementById('nav-dashboard'), 'dashboard');
    } else {
        window.setNav(document.getElementById('nav-miscasos'), 'mis-casos');
    }
}

// Global filter state
let currentCategoryFilter = 'all'; 
let currentNavView = 'dashboard'; // 'dashboard' (todos) o 'mis-casos'

async function loadDashboardCases(category = 'all', skipStats = false) {
    if(!supabase) return;
    
    currentCategoryFilter = category;

    try {
        let query = supabase.from('casos').select('*').order('created_at', { ascending: false });
        
        // Filter by Tab (Nav View)
        if(currentNavView === 'mis-casos') {
            query = query.eq('paralegal_asignado', currentUserId);
        }
        
        // Filter by Category Button
        if(category !== 'all') {
            query = query.eq('categoria_tramite', category);
        }

        const { data: casos, error } = await query;

        if (error) throw error;

        renderCasesTable(casos);
        
        // Cambiar titulo
        const title = document.getElementById('page-main-title');
        if(title) {
            if(currentNavView === 'mis-casos') title.textContent = 'Mis Casos Asignados';
            else title.textContent = 'Dashboard (Todos los Casos)';
        }
        
        if(!skipStats) await updateGlobalStats();
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
                <div class="prog-label">Cargando docs...</div>
                <div class="progress-bar"><div class="progress-fill" style="width:0%;background:var(--border)"></div></div>
            </div>
            <div>
                <div class="paralegal-avatar-sm">${caso.paralegal_asignado ? caso.paralegal_asignado.toUpperCase() : 'NA'}</div>
            </div>
            <div style="font-size:11.5px;color:var(--muted)">${new Date(caso.created_at).toLocaleDateString()}</div>
            <div><button class="action-btn" onclick="event.stopPropagation(); abiertoPorBoton('${caso.id}')">Ver →</button></div>
        </div>
        `;
    });

    tableContainer.innerHTML = html;
    
    // Luego de pintar, cargar el progreso (documentos_koda) de cada caso
    casos.forEach(c => updateCaseProgressRow(c.id));
}

window.setNav = function(el, view) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(el) el.classList.add('active');
    
    // Si la vista es dashboard o mis-casos o todos, navegamos
    if(view === 'dashboard' || view === 'todos' || view === 'mis-casos') {
        currentNavView = view === 'todos' ? 'dashboard' : view;
        loadDashboardCases(currentCategoryFilter, true); 
    }
}

// Filtro interactivo de Pastillas (Categorias)
window.filterCases = function(el, type) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    
    let bdType = type;
    if(type === 'family') bdType = 'Family';
    if(type === 'employment') bdType = 'Employment';
    if(type === 'daca') bdType = 'DACA';
    if(type === 'tps') bdType = 'TPS';

    if(!supabase) return;
    
    loadDashboardCases(bdType, true);
}

// ==========================================
// 1.5 ESTADÍSTICAS GLOBALES
// ==========================================
async function updateGlobalStats() {
    if(!supabase) return;
    
    try {
        // 1. Casos Activos y En Inmigración (Aprobados)
        // Casos activos son los que no tienen receipt number
        const { data: todosLosCasos, error: errCasos } = await supabase.from('casos').select('id, receipt_number, paralegal_asignado');
        if(errCasos) throw errCasos;
        
        let targetCasos = todosLosCasos;
        
        // Si es paralegal, sus badge stats son relativos a él
        if(currentUserRole === 'Paralegal') {
            targetCasos = todosLosCasos.filter(c => c.paralegal_asignado === currentUserId);
        }
        
        const casosActivos = targetCasos.filter(c => !c.receipt_number || c.receipt_number.trim() === '');
        const casosEnInmigracion = targetCasos.filter(c => c.receipt_number && c.receipt_number.trim() !== '');
        
        const activelCount = casosActivos.length;
        const approvedCount = casosEnInmigracion.length;
        
        // Solo cogemos documentos de los casos target
        const targetCasoIds = targetCasos.map(c => c.id);
        
        // 2. Documentos Pendientes y Urgentes
        let docsPendientes = [];
        let docsUrgentes = [];
        let docsRecibidos = [];
        let todosLosDocsLength = 0;
        
        if(targetCasoIds.length > 0) {
            const { data: todosLosDocs, error: errDocs } = await supabase.from('documentos_koda').select('estado').in('caso_id', targetCasoIds);
            if(errDocs) throw errDocs;
            
            docsPendientes = todosLosDocs.filter(d => d.estado !== 'Aprobado');
            docsUrgentes = docsPendientes.filter(d => d.estado === 'Urgente');
            docsRecibidos = todosLosDocs.filter(d => d.estado === 'Aprobado');
            todosLosDocsLength = todosLosDocs.length;
        }
        
        // 3. Progreso Global
        let pctGlobal = 0;
        if(todosLosDocsLength > 0) {
            pctGlobal = Math.round((docsRecibidos.length / todosLosDocsLength) * 100);
        }
        
        // DOM Updates
        
        // Sidebar Badges
        const badgeDashboard = document.getElementById('nav-badge-dashboard');
        const badgeMisCasos = document.getElementById('nav-badge-miscasos');
        
        const adminTotal = todosLosCasos.length;
        const misTotal = todosLosCasos.filter(c => c.paralegal_asignado === currentUserId).length;
        
        if(badgeDashboard) badgeDashboard.textContent = adminTotal.toString();
        if(badgeMisCasos) badgeMisCasos.textContent = misTotal.toString();
        
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
        if(statProgDelta) statProgDelta.textContent = `De ${todosLosDocsLength} doc requeridos`;
        
        if(statApr) statApr.textContent = approvedCount.toString();
        
    } catch(err) {
        console.error("Error cargando estadísticas", err);
    }
}

let currentActiveCaseId = null;

// The function called from HTML button
window.abiertoPorBoton = function(casoId) {
    if(!supabase) {
        alert("Modo Mock: Conecta Supabase primero.");
        return;
    }
    openCaseDetails(casoId);
}

window.openCaseDetails = async function(casoId) {
    if(!supabase) return;
    currentActiveCaseId = casoId;
    
    const panel = document.getElementById('panel-garcia');
    if(!panel) return;
    
    // Reset tabs
    document.querySelectorAll('.panel-tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector('.panel-tabs .tab:nth-child(1)').classList.add('active');
    document.getElementById('garcia-docs').classList.add('active');
    
    panel.classList.add('open');
    
    try {
        // Fetch Case details
        const { data: caso, error } = await supabase.from('casos').select('*').eq('id', casoId).single();
        if(error) throw error;
        
        // Update Header
        document.getElementById('caso-nombre').textContent = caso.nombre_cliente;
        document.getElementById('caso-meta').textContent = `#${caso.numero_caso} · ${caso.categoria_tramite || ''} · Abierto ${new Date(caso.created_at).toLocaleDateString()}`;
        document.getElementById('panel-receipt').value = caso.receipt_number || '';
        
        // Cargar Tabs
        await loadCaseDocuments(casoId);
        await loadCaseForms(caso.tipo_tramite);
        await loadCaseNotes(casoId);
        await calculateTimeline(caso);
        
    } catch(err) {
        console.error("Error abriendo detalle:", err);
    }
}

window.closeCaseDetail = function() {
    const panel = document.getElementById('panel-garcia');
    if(panel) panel.classList.remove('open');
    currentActiveCaseId = null;
    updateGlobalStats();
}

window.guardarReceiptNumber = async function() {
    if(!currentActiveCaseId || !supabase) return;
    
    const input = document.getElementById('panel-receipt');
    const val = input.value.trim();
    
    try {
        const { error } = await supabase.from('casos').update({ receipt_number: val }).eq('id', currentActiveCaseId);
        if(error) throw error;
        
        alert("Receipt Number guardado.");
        loadDashboardCases(currentCategoryFilter, true); // Actualizar tablero detras
    } catch(err) {
        console.error(err);
        alert("Error guardando receipt number");
    }
}

window.eliminarCasoActual = async function() {
    if(!currentActiveCaseId || !supabase) return;
    
    if(!confirm("¿Está seguro que desea eliminar este expediente y todos sus documentos relacionados? Esta acción no se puede deshacer.")) {
        return;
    }
    
    try {
        const { error } = await supabase.from('casos').delete().eq('id', currentActiveCaseId);
        if(error) throw error;
        
        alert("Expediente eliminado correctamente.");
        window.closeCaseDetail();
        loadDashboardCases(currentCategoryFilter, false); 
        updateGlobalStats();
    } catch(err) {
        console.error("Error eliminando caso", err);
        alert("Ocurrió un error al intentar eliminar el expediente.");
    }
}

// ==========================================
// CREADOR DE CASOS (MODAL)
// ==========================================
window.abrirModalNuevoCaso = function() {
    document.getElementById('modal-nuevo-caso').style.display = 'flex';
}

window.cerrarModalNuevoCaso = function() {
    document.getElementById('modal-nuevo-caso').style.display = 'none';
    document.getElementById('nc-nombre').value = '';
    document.getElementById('nc-priority').value = '';
}

window.crearCasoSubmit = async function() {
    if(!supabase) return alert("Supabase no configurado");
    
    const nombre = document.getElementById('nc-nombre').value.trim();
    const tipo = document.getElementById('nc-tipo').value;
    const paralegal = document.getElementById('nc-paralegal').value;
    const priority = document.getElementById('nc-priority').value;
    const btn = document.getElementById('btn-crear-caso');
    
    if(!nombre) return alert("El nombre es requerido");
    
    // Auto generar un número de caso KODA-202X
    const year = new Date().getFullYear();
    const randomHex = Math.floor(Math.random()*16777215).toString(16).toUpperCase().padStart(4, '0');
    const numCaso = `KODA-${year}-${randomHex}`;
    
    btn.disabled = true;
    btn.textContent = 'Creando...';
    
    try {
        const { data: newCase, error } = await supabase.from('casos').insert({
            nombre_cliente: nombre,
            numero_caso: numCaso,
            tipo_tramite: tipo,
            categoria_tramite: (tipo==='F2A'||tipo==='I-130'||tipo==='I-485')?'Family' : (tipo==='EB-2'?'Employment':tipo),
            estado: 'Nuevo',
            priority_date: priority || null,
            paralegal_asignado: paralegal
        }).select('id').single();
        
        if(error) throw error;
        
        // Autollenar la plantilla de documentos
        await autoFillDocuments(newCase.id, tipo);
        
        cerrarModalNuevoCaso();
        await loadDashboardCases(currentCategoryFilter);
        
        // Abrir caso nuevo
        openCaseDetails(newCase.id);
        
    } catch(err) {
        console.error("Error al crear caso", err);
        alert("Ocurrió un error al crear el caso");
    } finally {
        btn.disabled = false;
        btn.textContent = 'Crear Caso y Plantilla';
    }
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
    
    const container = document.getElementById(`garcia-docs`);
    if(!container) return;
    
    container.innerHTML = `<div class="doc-section-title">Checklist de Documentos Requeridos</div>`;
    
    if(!docs || docs.length === 0) {
        container.innerHTML += `<div class="doc-item"><div class="doc-name">No hay documentos requeridos.</div></div>`;
        return;
    }
    
    let html = '';
    docs.forEach(doc => {
        const isRecibido = doc.estado === 'Aprobado';
        const isTraduccion = doc.estado === 'Necesita Traducción';
        const isUrgente = doc.estado === 'Urgente'; // Legacy
        
        let statusColor = 'var(--muted)';
        let statusText = '⏳ Pendiente';
        
        if(isRecibido) { statusColor = 'var(--success)'; statusText = '✓ Aprobado'; }
        else if(isTraduccion) { statusColor = 'var(--accent3)'; statusText = '⚖ Requiere Traducción'; }
        else if(isUrgente) { statusColor = 'var(--danger)'; statusText = '✕ Urgente'; }
        
        let linkHtml = '';
        if(doc.link_dropbox) {
             linkHtml = `<a href="${doc.link_dropbox}" target="_blank" class="btn btn-ghost" style="padding:4px 8px; font-size:11px; margin-right:8px;" onclick="event.stopPropagation();">Abrir Archivo ↗</a>
                         <button style="background:none; border:none; color:var(--muted); cursor:pointer; font-size:12px; margin-right:8px;" onclick="event.stopPropagation(); promptDropboxLink('${doc.id}', '${doc.link_dropbox}', '${casoId}')">✎</button>`;
        } else {
             linkHtml = `<button class="btn btn-ghost" style="padding:4px 8px; font-size:11px; color:var(--muted); margin-right:8px;" onclick="event.stopPropagation(); promptDropboxLink('${doc.id}', '', '${casoId}')">🔗 Agregar Dropbox</button>`;
        }
        
        html += `
        <div class="doc-item" onclick="toggleDocAction('${doc.id}', '${doc.estado}', '${casoId}')">
            <div class="doc-checkbox ${isRecibido ? 'checked' : ''}">${isRecibido ? '✓' : ''}</div>
            <div class="doc-name ${isRecibido ? 'checked' : ''}" style="flex:1;">${doc.nombre_documento}</div>
            ${linkHtml}
            <span class="doc-status" style="color:${statusColor}; min-width:80px; text-align:right;">${statusText}</span>
        </div>
        `;
    });
    
    container.innerHTML += html;
}

window.toggleDocAction = async function(docId, estadoActual, casoId) {
    let nuevoEstado = 'Pendiente';
    if(estadoActual === 'Pendiente' || estadoActual === 'Urgente') nuevoEstado = 'Necesita Traducción';
    else if(estadoActual === 'Necesita Traducción') nuevoEstado = 'Aprobado';
    else if(estadoActual === 'Aprobado') nuevoEstado = 'Pendiente';
    
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

// ==========================================
// FORMULARIOS (Simples / Desconectados)
// ==========================================
async function loadCaseForms(tipoTramite) {
    // Simula una lógica donde dependiendo del tipo de trámite, sugiere qué formularios llenar en eImmigration
    const container = document.getElementById('forms-container');
    if(!container) return;
    
    let formsToRender = [];
    
    if(tipoTramite === 'F2A' || tipoTramite === 'I-130') formsToRender = ['I-130 - Petition for Alien Relative', 'I-130A - Supplemental Info'];
    if(tipoTramite === 'I-485' || tipoTramite === 'F2A') formsToRender.push('I-485 - App for Permanent Residence', 'I-864 - Affidavit of Support', 'I-765 - Employment Auth (Opcional)', 'I-131 - Advance Parole (Opcional)');
    if(tipoTramite === 'N-400') formsToRender = ['N-400 - Application for Naturalization'];
    if(tipoTramite === 'DACA') formsToRender = ['I-821D - Consideration of DACA', 'I-765 - Employment Auth'];
    if(tipoTramite === 'TPS') formsToRender = ['I-821 - Application for TPS', 'I-765 - Employment Auth'];
    
    if(formsToRender.length === 0) formsToRender = ['Formulario Principal del Trámite'];
    
    let html = '';
    formsToRender.forEach(f => {
        html += `
        <div class="doc-item" onclick="toggleSimpleForm(this)">
            <div class="doc-checkbox"></div>
            <div class="doc-name">${f}</div>
        </div>
        `;
    });
    container.innerHTML = html;
}

window.toggleSimpleForm = function(el) {
    // Solo visual (DOM) para asistir al paralegal
    const box = el.querySelector('.doc-checkbox');
    const name = el.querySelector('.doc-name');
    
    if(box.classList.contains('checked')){
        box.classList.remove('checked'); box.textContent = '';
        name.classList.remove('checked');
    } else {
        box.classList.add('checked'); box.textContent = '✓';
        name.classList.add('checked');
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
        const recibidos = docs.filter(d => d.estado === 'Aprobado').length;
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
    
    const container = document.getElementById(`garcia-notes-list`);
    if(!container) return;
    
    if(!notas || notas.length === 0) {
        container.innerHTML = `<div class="note-item"><div class="note-text" style="color:var(--muted)">No hay notas aún. Asegúrate de enfocar las notas en el requerimiento de documentos.</div></div>`;
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

window.guardarNota = async function(btnElement) {
    if(!currentActiveCaseId) return;
    const casoId = currentActiveCaseId;
    
    const container = document.getElementById(`garcia-notes-input`);
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

window.toggleNotaImportante = function(btnElement) {
    const container = document.getElementById('garcia-notes-input');
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
    const container = document.getElementById(`garcia-timeline`);
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
        
        // Agergar logica de Retroceso ("Over estimated time") si la BD tuviese un campo 'retroceso' o al comparar meses pasados.
        // Simularemos esta logica para el UI con un check basico en FAD vs mes actual si quisieramos, o checkenado flag hardcodeado
        
        const pd = new Date(caso.priority_date);
        const fad = new Date(bulletin.final_action_date);
        
        // Dif en meses (aproximada) 
        let mesesFaltantes = (pd.getFullYear() - fad.getFullYear()) * 12;
        mesesFaltantes -= fad.getMonth();
        mesesFaltantes += pd.getMonth();
        
        let estimacionHtml = '';
        let pdDisplay = pd.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric'}).toUpperCase();
        let fadDisplay = fad.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric'}).toUpperCase();
        
        // ALERTA DE RETROCESO
        // Hardcoded simulation: si fad es del 2021 o anterior (en este repo), lo marcamos como retroceso
        const isRetroceso = fad.getFullYear() < 2022; 
        
        if (isRetroceso) {
            estimacionHtml = `
              <div style="font-size:16px;font-family:'DM Mono',monospace;color:var(--danger);animation:pulse 2s infinite">
                 ⚠ OVER ESTIMATED TIME
                 <div style="font-size:10px;color:var(--muted)">Retroceso de FAD</div>
              </div>`;
        } else if (mesesFaltantes <= 0) {
            estimacionHtml = `<div style="font-size:16px;font-family:'DM Mono',monospace;color:var(--success)">CORRIENTE</div>`;
        } else {
            estimacionHtml = `<div style="font-size:16px;font-family:'DM Mono',monospace;color:var(--accent)">~${mesesFaltantes} meses</div>`;
        }
        
        // Progreso bar heurístico simple
        let pctVis = 100;
        let barColor = 'var(--accent)';
        if(isRetroceso) {
            pctVis = 100;
            barColor = 'var(--danger)';
        } else if(mesesFaltantes > 0) {
            pctVis = Math.max(5, 100 - ((mesesFaltantes / 120) * 100));
        }

        let html = `
        <div class="bulletin-case" style="${isRetroceso ? 'border-color:rgba(239,68,68,0.3)' : ''}">
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
                <div style="font-size:10px;font-family:'DM Mono',monospace;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Estado/Estimado</div>
                ${estimacionHtml}
              </div>
            </div>
            
            <div class="progress-bar" style="height:8px;border-radius:4px">
              <div class="progress-fill" style="width:${pctVis}%;background:${barColor}"></div>
            </div>
        </div>
        `;
        
        container.innerHTML = html;
        
    } catch(e) {
        console.error("Error calculando timeline", e);
    }
}

// ==========================================
// COMPATIBILIDAD UI
// ==========================================
window.switchTab = function(el, panelPrefix, tabId) {
    const targId = (tabId === 'forms') ? 'panel-forms' : `garcia-${tabId}`;
    let domTarg = document.getElementById(targId);
    if(!domTarg && tabId==='timeline') domTarg = document.getElementById('garcia-timeline');
    
    const panel = el.closest('.detail-panel') || document.getElementById('panel-garcia');
    if(!panel) return;

    panel.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    panel.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    el.classList.add('active');
    if(domTarg) domTarg.classList.add('active');
}

window.openCase = function() {} // Deprecated
window.closeCase = function() {} // Deprecated
