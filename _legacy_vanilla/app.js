/* ═══════════════════════════════════════════
   Data Model – Grouped by PROJECT
   ═══════════════════════════════════════════ */
const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const PRIORITY_LABELS = { critical: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja' };

const defaultProjects = [
    {
        key: "escudo",
        name: "Escudo Verde",
        icon: "ri-shield-line",
        color: "#f59e0b",
        priority: "high",
        desc: "Seguridad civil y mitigación de incendios mediante guardarrayas y barreras vivas.",
        activities: [
            { text: "Mecanización de guardarrayas (tractor)", days: 2, done: false, startTime: "07:00", endTime: "15:00" },
            { text: "Eliminación de biomasa seca combustible", days: 1, done: false, startTime: "08:00", endTime: "14:00" },
            { text: "Marcaje y apertura de cepas en perímetro", days: 2, done: false, startTime: "07:00", endTime: "13:00" },
            { text: "Insolación del suelo (desinfección solar)", days: 3, done: false, startTime: "", endTime: "" },
            { text: "Plantación de Nopal/Agave en borde interior", days: 2, done: false, startTime: "06:00", endTime: "12:00" },
            { text: "Trasplante de árboles al perímetro", days: 3, done: false, startTime: "07:00", endTime: "14:00" }
        ]
    },
    {
        key: "vivero",
        name: "Vivero Integral",
        icon: "ri-seedling-line",
        color: "#10b981",
        priority: "critical",
        desc: "Producción propia de planta forestal y forrajera (Moringa, Cocoite, Amapa).",
        activities: [
            { text: "Habilitación del espacio físico", days: 2, done: false, startTime: "08:00", endTime: "16:00" },
            { text: "Armado de mesas de trabajo", days: 1, done: false, startTime: "08:00", endTime: "14:00" },
            { text: "Instalación de estructura de sombra", days: 1, done: false, startTime: "07:00", endTime: "13:00" },
            { text: "Preparación de sustrato", days: 1, done: false, startTime: "08:00", endTime: "12:00" },
            { text: "Llenado de bolsas/charolas", days: 2, done: false, startTime: "07:00", endTime: "14:00" },
            { text: "Siembra de Moringa y Crotalaria", days: 1, done: false, startTime: "06:00", endTime: "11:00" },
            { text: "Esquejado de Cocoite y Botón de Oro", days: 3, done: false, startTime: "07:00", endTime: "13:00" },
            { text: "Riego y control de plántulas", days: 7, done: false, startTime: "06:00", endTime: "10:00" }
        ]
    },
    {
        key: "aeroponia",
        name: "Aeroponía",
        icon: "ri-droplet-line",
        color: "#00ccff",
        priority: "critical",
        desc: "Validación tecnológica de cultivos intensivos en torres verticales.",
        activities: [
            { text: "Lavado exhaustivo de tambos de 200L", days: 1, done: false, startTime: "08:00", endTime: "14:00" },
            { text: "Desinfección con cloro diluido", days: 1, done: false, startTime: "09:00", endTime: "12:00" },
            { text: "Corte de tubos PVC en estación de corte", days: 2, done: false, startTime: "07:00", endTime: "15:00" },
            { text: "Perforado de orificios para canastillas", days: 2, done: false, startTime: "07:00", endTime: "15:00" },
            { text: "Pegado y armado de 80 torres verticales", days: 4, done: false, startTime: "07:00", endTime: "16:00" },
            { text: "Enterrado de tambos (reservorios)", days: 2, done: false, startTime: "07:00", endTime: "14:00" },
            { text: "Nivelación del sistema", days: 1, done: false, startTime: "08:00", endTime: "13:00" },
            { text: "Conexión de bombas y nebulizadores", days: 3, done: false, startTime: "08:00", endTime: "16:00" },
            { text: "Pruebas de fuga y configuración timers", days: 2, done: false, startTime: "09:00", endTime: "15:00" }
        ]
    },
    {
        key: "maracuya",
        name: "Maracuyá",
        icon: "ri-node-tree",
        color: "#a855f7",
        priority: "medium",
        desc: "Cultivo demostrativo de alto valor en estructura de ramada.",
        activities: [
            { text: "Instalación de postes de madera", days: 2, done: false, startTime: "07:00", endTime: "14:00" },
            { text: "Tendido de alambre galvanizado", days: 1, done: false, startTime: "08:00", endTime: "13:00" },
            { text: "Tensores y anclajes", days: 1, done: false, startTime: "08:00", endTime: "12:00" },
            { text: "Instalación de riego localizado", days: 2, done: false, startTime: "07:00", endTime: "15:00" },
            { text: "Siembra de plántulas de Maracuyá", days: 1, done: false, startTime: "06:00", endTime: "11:00" }
        ]
    },
    {
        key: "gestion",
        name: "Gestión y Control",
        icon: "ri-settings-3-line",
        color: "#6366f1",
        priority: "medium",
        desc: "Seguridad, automatización, pruebas y puesta en marcha.",
        activities: [
            { text: "Firma de acuerdos", days: 1, done: false, startTime: "10:00", endTime: "12:00" },
            { text: "Taller de seguridad (EPP)", days: 1, done: false, startTime: "08:00", endTime: "14:00" },
            { text: "Automatización y pruebas de fuga", days: 2, done: false, startTime: "08:00", endTime: "16:00" },
            { text: "Protocolo de cierre pre-vacacional", days: 1, done: false, startTime: "09:00", endTime: "13:00" },
            { text: "Puesta en Marcha Integral", days: 3, done: false, startTime: "07:00", endTime: "17:00" },
            { text: "Evaluación de germinación en Vivero", days: 1, done: false, startTime: "08:00", endTime: "12:00" }
        ]
    }
];

let projects = [];

/* ═══════════════════════════════════════════
   State / Persistence (MySQL)
   ═══════════════════════════════════════════ */
// const STORAGE_KEY = 'itnn_living_lab_v4'; // Legacy LocalStorage Key

async function loadData() {
    try {
        const response = await fetch('api.php');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        if (data && data.length > 0) {
            projects = data;
        } else {
            console.log('Database empty, loading defaults...');
            projects = structuredClone(defaultProjects);
            saveData(); // Save defaults to DB if empty
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to defaults on error
        projects = structuredClone(defaultProjects);
    }
    // Render after load
    renderGlobalGantt();
    updateKPIs();
    buildNav();
}

async function saveData() {
    try {
        await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projects)
        });
        console.log('Data saved to MySQL');
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error al guardar en base de datos. Ver consola.');
    }
}

function resetData() {
    if (!confirm('¿Reiniciar todo el progreso? Se borrarán los datos de la base de datos y se restaurarán los valores por defecto.')) return;
    projects = structuredClone(defaultProjects);
    saveData();
    selectProject('all', document.querySelector('[data-project="all"]'));
}

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */
function totalDays(proj) {
    return proj.activities.reduce((s, a) => s + a.days, 0);
}

function completedDays(proj) {
    return proj.activities.filter(a => a.done).reduce((s, a) => s + a.days, 0);
}

function projectProgress(proj) {
    const td = totalDays(proj);
    return td === 0 ? 0 : Math.round((completedDays(proj) / td) * 100);
}

function globalProgress() {
    let td = 0, cd = 0;
    projects.forEach(p => { td += totalDays(p); cd += completedDays(p); });
    return td === 0 ? 0 : Math.round((cd / td) * 100);
}

function globalTotalDays() {
    return projects.reduce((s, p) => s + totalDays(p), 0);
}

function sortedProjects() {
    // Ensure priority exists (migration safety)
    return [...projects].sort((a, b) => {
        const pA = a.priority || 'medium';
        const pB = b.priority || 'medium';
        return (PRIORITY_ORDER[pA] ?? 2) - (PRIORITY_ORDER[pB] ?? 2);
    });
}


function formatSchedule(act) {
    if (act.startTime && act.endTime) return `${act.startTime} – ${act.endTime}`;
    if (act.startTime) return `Desde ${act.startTime}`;
    if (act.endTime) return `Hasta ${act.endTime}`;
    return '';
}

/* ═══════════════════════════════════════════
   Navigation
   ═══════════════════════════════════════════ */
function buildNav() {
    const nav = document.getElementById('project-nav');
    const globalLink = nav.querySelector('[data-project="all"]');
    nav.innerHTML = '';
    nav.appendChild(globalLink);

    sortedProjects().forEach(p => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'nav-item';
        a.dataset.project = p.key;
        a.onclick = (e) => { e.preventDefault(); selectProject(p.key, a); };
        a.innerHTML = `
            <span class="nav-dot" style="background:${p.color}"></span>
            <span style="flex:1">${p.name}</span>
            <span class="nav-priority ${p.priority}" title="${PRIORITY_LABELS[p.priority]}"></span>
            <span class="nav-progress">${projectProgress(p)}%</span>
        `;
        nav.appendChild(a);
    });
}

function selectProject(key, navEl) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (navEl) navEl.classList.add('active');

    if (key === 'all') {
        document.getElementById('view-title').textContent = 'Vista Global';
        document.getElementById('view-global').style.display = '';
        document.getElementById('view-detail').style.display = 'none';
        renderGlobalGantt();
    } else {
        const proj = projects.find(p => p.key === key);
        if (!proj) return;
        document.getElementById('view-title').textContent = proj.name;
        document.getElementById('view-global').style.display = 'none';
        document.getElementById('view-detail').style.display = '';
        renderDetailView(proj);
    }
    updateKPIs();
    buildNav();
    const activeLink = document.querySelector(`[data-project="${key}"]`);
    if (activeLink) activeLink.classList.add('active');
}

function updateKPIs() {
    document.getElementById('kpi-progress').textContent = globalProgress() + '%';
    document.getElementById('kpi-total-days').textContent = globalTotalDays();
}

/* ═══════════════════════════════════════════
   Global Gantt (Projects as rows, days axis)
   ═══════════════════════════════════════════ */
function renderGlobalGantt() {
    const container = document.getElementById('gantt-global');
    const sorted = sortedProjects();
    const maxDays = Math.max(...sorted.map(p => totalDays(p)), 1);
    const axisDays = maxDays + 3;

    let headerCells = '<th>Proyecto</th>';
    for (let d = 1; d <= axisDays; d++) {
        const cls = d % 5 === 0 ? 'week-start' : '';
        headerCells += `<th class="day-col ${cls}">${d}</th>`;
    }

    let rows = '';
    sorted.forEach(p => {
        const td = totalDays(p);
        const pct = projectProgress(p);

        let cells = `<td>
            <div class="gantt-label-cell">
                <span class="dot" style="background:${p.color}"></span>
                <span>${p.name}</span>
                <span class="priority-badge ${p.priority}">${PRIORITY_LABELS[p.priority]}</span>
            </div>
        </td>`;

        for (let d = 1; d <= axisDays; d++) {
            if (d === 1 && td > 0) {
                cells += `<td class="gantt-bar-cell day-col" colspan="${td}">
                    <div class="bar-fill" style="left:0;right:0;background:${p.color}">
                        <div class="bar-progress" style="width:${pct}%"></div>
                        ${td} días
                    </div>
                </td>`;
                d += td - 1;
            } else {
                const cls = d % 5 === 0 ? 'week-start' : '';
                cells += `<td class="day-col ${cls}"></td>`;
            }
        }

        rows += `<tr onclick="selectProject('${p.key}', document.querySelector('[data-project=\\'${p.key}\\']'))">${cells}</tr>`;
    });

    container.innerHTML = `
        <table class="gantt-table fade-in">
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

/* ═══════════════════════════════════════════
   Detail View (Activities as rows)
   ═══════════════════════════════════════════ */
function renderDetailView(proj) {
    const pct = projectProgress(proj);
    document.getElementById('detail-header').innerHTML = `
        <div class="detail-icon" style="background:${proj.color}20;color:${proj.color}"><i class="${proj.icon}"></i></div>
        <div class="detail-meta">
            <h2>${proj.name} <span class="priority-badge ${proj.priority}">${PRIORITY_LABELS[proj.priority]}</span></h2>
            <p>${proj.desc}</p>
        </div>
        <div style="display:flex; gap:8px; align-items:center; margin-left:auto">
            <button class="btn-edit-project" onclick="openEditModal('${proj.key}')"><i class="ri-edit-line"></i> Editar</button>
            <div class="detail-progress" style="margin-left:0">
                <div class="big-pct" style="color:${proj.color}">${pct}%</div>
                <div class="label">${completedDays(proj)} / ${totalDays(proj)} días</div>
            </div>
        </div>
    `;
    document.getElementById('detail-header').classList.add('fade-in');

    // Activity Gantt
    const maxDays = Math.max(...proj.activities.map(a => a.days), 1);
    const axisDays = maxDays + 2;

    let headerCells = '<th>Actividad</th>';
    for (let d = 1; d <= axisDays; d++) {
        headerCells += `<th class="day-col">${d}</th>`;
    }

    let rows = '';
    proj.activities.forEach((act, i) => {
        const barColor = act.done ? 'var(--success)' : proj.color;
        const opacity = act.done ? '0.5' : '0.85';
        const sched = formatSchedule(act);
        const schedLabel = sched ? ` · ${sched}` : '';

        let cells = `<td>
            <div class="gantt-label-cell">
                <span class="dot" style="background:${barColor};opacity:${opacity}"></span>
                <span style="${act.done ? 'text-decoration:line-through;opacity:.5' : ''}">${act.text}${schedLabel ? `<span style="color:var(--secondary);font-size:.75rem">${schedLabel}</span>` : ''}</span>
            </div>
        </td>`;

        for (let d = 1; d <= axisDays; d++) {
            if (d === 1 && act.days > 0) {
                cells += `<td class="gantt-bar-cell day-col" colspan="${act.days}">
                    <div class="bar-fill" style="left:0;right:0;background:${barColor};opacity:${opacity}">
                        ${act.days}d
                    </div>
                </td>`;
                d += act.days - 1;
            } else {
                cells += `<td class="day-col"></td>`;
            }
        }

        rows += `<tr class="${act.done ? 'done-row' : ''}" onclick="toggleActivity('${proj.key}', ${i})">${cells}</tr>`;
    });

    document.getElementById('gantt-detail').innerHTML = `
        <table class="gantt-table fade-in">
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;

    // Checklist with schedule display
    const checkHtml = proj.activities.map((act, i) => {
        const sched = formatSchedule(act);
        return `
        <li class="checklist-item ${act.done ? 'checked' : ''}" onclick="toggleActivity('${proj.key}', ${i})">
            <div class="check-circle"></div>
            <span>${act.text}</span>
            <div class="checklist-badges">
                ${sched ? `<span class="schedule-badge"><i class="ri-time-line"></i>${sched}</span>` : ''}
                <span class="days-badge">${act.days} día${act.days > 1 ? 's' : ''}</span>
            </div>
        </li>`;
    }).join('');

    // Priority changer + actions
    const priorityBtns = Object.keys(PRIORITY_LABELS).map(k =>
        `<button type="button" class="priority-btn ${k} ${proj.priority === k ? 'active' : ''}" onclick="changePriority('${proj.key}','${k}')">${PRIORITY_LABELS[k]}</button>`
    ).join('');

    document.getElementById('checklist-panel').innerHTML = `
        <h3><i class="ri-checkbox-circle-line"></i> Checklist de Actividades</h3>
        <ul class="checklist fade-in">${checkHtml}</ul>
        <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--border); display:flex; align-items:center; gap:1rem; flex-wrap:wrap">
            <span style="font-size:.85rem; color:var(--text-muted)">Importancia:</span>
            <div class="priority-selector">${priorityBtns}</div>
            <div style="margin-left:auto; display:flex; gap:8px">
                <button class="btn-edit-project" onclick="openEditModal('${proj.key}')">
                    <i class="ri-edit-line"></i> Editar Proyecto
                </button>
                <button class="btn-delete-project" onclick="deleteProject('${proj.key}')">
                    <i class="ri-delete-bin-line"></i> Eliminar
                </button>
            </div>
        </div>
    `;
}

/* ═══════════════════════════════════════════
   Toggle Activity
   ═══════════════════════════════════════════ */
function toggleActivity(projKey, index) {
    const proj = projects.find(p => p.key === projKey);
    if (!proj) return;
    proj.activities[index].done = !proj.activities[index].done;
    saveData();
    renderDetailView(proj);
    updateKPIs();
    buildNav();
    const activeLink = document.querySelector(`[data-project="${projKey}"]`);
    if (activeLink) activeLink.classList.add('active');
}

/* ═══════════════════════════════════════════
   Change Priority (inline)
   ═══════════════════════════════════════════ */
function changePriority(projKey, newPriority) {
    const proj = projects.find(p => p.key === projKey);
    if (!proj) return;
    proj.priority = newPriority;
    saveData();
    renderDetailView(proj);
    buildNav();
    const activeLink = document.querySelector(`[data-project="${projKey}"]`);
    if (activeLink) activeLink.classList.add('active');
}

/* ═══════════════════════════════════════════
   Delete Project
   ═══════════════════════════════════════════ */
function deleteProject(projKey) {
    const proj = projects.find(p => p.key === projKey);
    if (!proj) return;
    if (!confirm(`¿Eliminar el proyecto "${proj.name}"? Esta acción no se puede deshacer.`)) return;
    projects = projects.filter(p => p.key !== projKey);
    saveData();
    selectProject('all', document.querySelector('[data-project="all"]'));
}

/* ═══════════════════════════════════════════
   Modal: Create / Edit Project
   ═══════════════════════════════════════════ */
let modalState = { color: '#00ccff', icon: 'ri-flask-line', priority: 'medium', mode: 'create', editKey: null };

function openModal() {
    modalState = { color: '#00ccff', icon: 'ri-flask-line', priority: 'medium', mode: 'create', editKey: null };
    document.getElementById('inp-name').value = '';
    document.getElementById('inp-desc').value = '';
    document.getElementById('activities-list').innerHTML = '';

    // Reset pickers
    document.querySelectorAll('#color-picker .color-dot').forEach(d => d.classList.remove('active'));
    document.querySelector('.color-dot[data-color="#00ccff"]').classList.add('active');
    document.querySelectorAll('#icon-picker .icon-opt').forEach(d => d.classList.remove('active'));
    document.querySelector('.icon-opt[data-icon="ri-flask-line"]').classList.add('active');
    document.querySelectorAll('#priority-selector .priority-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('#priority-selector .priority-btn.medium').classList.add('active');

    // Modal title
    document.getElementById('modal-title').innerHTML = '<i class="ri-add-circle-line"></i> Nuevo Proyecto';
    document.getElementById('modal-save-btn').innerHTML = '<i class="ri-save-line"></i> Crear Proyecto';

    // Add 3 empty activity rows
    addActivityRow();
    addActivityRow();
    addActivityRow();

    document.getElementById('modal-overlay').classList.add('open');
}

function openEditModal(projKey) {
    const proj = projects.find(p => p.key === projKey);
    if (!proj) return;

    modalState = {
        color: proj.color,
        icon: proj.icon,
        priority: proj.priority,
        mode: 'edit',
        editKey: projKey
    };

    // Fill form fields
    document.getElementById('inp-name').value = proj.name;
    document.getElementById('inp-desc').value = proj.desc;

    // Set color picker
    document.querySelectorAll('#color-picker .color-dot').forEach(d => {
        d.classList.toggle('active', d.dataset.color === proj.color);
    });

    // Set icon picker
    document.querySelectorAll('#icon-picker .icon-opt').forEach(d => {
        d.classList.toggle('active', d.dataset.icon === proj.icon);
    });

    // Set priority
    document.querySelectorAll('#priority-selector .priority-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.val === proj.priority);
    });

    // Fill activities
    document.getElementById('activities-list').innerHTML = '';
    proj.activities.forEach(act => {
        addActivityRow(act.text, act.days, act.startTime || '', act.endTime || '', act.done);
    });

    // Modal title for edit mode
    document.getElementById('modal-title').innerHTML = '<i class="ri-edit-line"></i> Editar Proyecto';
    document.getElementById('modal-save-btn').innerHTML = '<i class="ri-save-line"></i> Guardar Cambios';

    document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
}

function setPriority(val) {
    modalState.priority = val;
    document.querySelectorAll('#priority-selector .priority-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`#priority-selector .priority-btn.${val}`).classList.add('active');
}

function setColor(el) {
    modalState.color = el.dataset.color;
    document.querySelectorAll('#color-picker .color-dot').forEach(d => d.classList.remove('active'));
    el.classList.add('active');
}

function setIcon(el) {
    modalState.icon = el.dataset.icon;
    document.querySelectorAll('#icon-picker .icon-opt').forEach(d => d.classList.remove('active'));
    el.classList.add('active');
}

function addActivityRow(name = '', days = 1, startTime = '', endTime = '', done = false) {
    const list = document.getElementById('activities-list');
    const row = document.createElement('div');
    row.className = 'activity-row';
    row.dataset.done = done ? '1' : '0';
    row.innerHTML = `
        <input type="text" class="act-name" placeholder="Nombre de la actividad" value="${escapeAttr(name)}">
        <input type="number" class="act-days" placeholder="Días" min="1" value="${days}">
        <input type="time" class="act-time act-start" value="${startTime}" title="Hora inicio">
        <input type="time" class="act-time act-end" value="${endTime}" title="Hora fin">
        <button type="button" class="btn-remove-act" onclick="this.parentElement.remove()"><i class="ri-close-circle-line"></i></button>
    `;
    list.appendChild(row);
}

function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function saveProject() {
    const name = document.getElementById('inp-name').value.trim();
    const desc = document.getElementById('inp-desc').value.trim();

    if (!name) { alert('El nombre del proyecto es obligatorio.'); return; }

    // Gather activities
    const rows = document.querySelectorAll('#activities-list .activity-row');
    const activities = [];
    rows.forEach(row => {
        const txt = row.querySelector('.act-name').value.trim();
        const days = parseInt(row.querySelector('.act-days').value) || 1;
        const startTime = row.querySelector('.act-start').value || '';
        const endTime = row.querySelector('.act-end').value || '';
        const done = row.dataset.done === '1';
        if (txt) {
            activities.push({ text: txt, days, done, startTime, endTime });
        }
    });

    if (activities.length === 0) { alert('Agrega al menos una actividad.'); return; }

    if (modalState.mode === 'edit') {
        // ─── UPDATE existing project ───
        const proj = projects.find(p => p.key === modalState.editKey);
        if (!proj) return;
        proj.name = name;
        proj.desc = desc || 'Sin descripción.';
        proj.icon = modalState.icon;
        proj.color = modalState.color;
        proj.priority = modalState.priority;
        proj.activities = activities;
        saveData();
        closeModal();
        selectProject(proj.key, document.querySelector(`[data-project="${proj.key}"]`));
    } else {
        // ─── CREATE new project ───
        const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') + '_' + Date.now().toString(36);
        const newProj = {
            key,
            name,
            icon: modalState.icon,
            color: modalState.color,
            priority: modalState.priority,
            desc: desc || 'Sin descripción.',
            activities
        };
        projects.push(newProj);
        saveData();
        closeModal();
        selectProject('all', document.querySelector('[data-project="all"]'));
    }
}

/* ═══════════════════════════════════════════
   Init
   ═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});
