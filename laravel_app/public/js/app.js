/* ═══════════════════════════════════════════
   Data Model – Grouped by PROJECT
   ═══════════════════════════════════════════ */
const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const PRIORITY_LABELS = { critical: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja' };

/* Transformed Default Data (Priority moved to Activities) */
const defaultProjects = [
    {
        key: "escudo", name: "Escudo Verde", icon: "ri-shield-line", color: "#f59e0b",
        description: "Seguridad civil y mitigación de incendios mediante guardarrayas y barreras vivas.",
        activities: [
            { text: "Mecanización de guardarrayas (tractor)", priority: "high", days: 2, startTime: "07:00", endTime: "15:00", progress: 0, done: false },
            { text: "Eliminación de biomasa seca combustible", priority: "high", days: 1, startTime: "08:00", endTime: "14:00", progress: 0, done: false }
        ]
    },
    {
        key: "vivero", name: "Vivero Integral", icon: "ri-seedling-line", color: "#10b981",
        description: "Producción propia de planta forestal y forrajera (Moringa, Cocoite, Amapa).",
        activities: [
            { text: "Habilitación del espacio físico", priority: "critical", days: 2, startTime: "08:00", endTime: "16:00", progress: 100, done: true },
            { text: "Armado de mesas de trabajo", priority: "critical", days: 1, startTime: "08:00", endTime: "14:00", progress: 40, done: false }
        ]
    }
];

/* ═══════════════════════════════════════════
   State / Persistence
   ═══════════════════════════════════════════ */
let projects = [];
let currentView = { type: 'all', projectKey: null };

function getStatus(progress) {
    if (progress >= 100) return 'done';
    if (progress > 0) return 'progress';
    return 'pending';
}

async function loadData() {
    try {
        const response = await fetch(API_PROJECTS_URL + '?t=' + Date.now(), { cache: 'no-store' });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        if (data && data.length > 0) {
            projects = data;
        } else {
            console.log('Database empty, loading defaults...');
            projects = JSON.parse(JSON.stringify(defaultProjects));
            await saveData();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        projects = [];
    }

    // Refresh current view
    if (currentView.type === 'all') {
        selectProject('all');
    } else {
        selectProject(currentView.projectKey);
    }
}

async function saveData() {
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    try {
        const response = await fetch(API_PROJECTS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token
            },
            body: JSON.stringify(projects)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Error del servidor');
        }
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error al guardar: ' + error.message);
        throw error;
    }
}

function resetData() {
    if (!confirm('¿Reiniciar todo con datos por defecto?')) return;
    projects = JSON.parse(JSON.stringify(defaultProjects));
    saveData().then(() => loadData());
}

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */
function totalDays(proj) {
    return proj.activities.reduce((s, a) => s + (parseInt(a.days) || 0), 0);
}

function completedDays(proj) {
    return proj.activities.reduce((s, a) => s + ((parseInt(a.days) || 0) * (a.progress || 0) / 100), 0);
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

function getProjectPriorityVal(proj) {
    if (!proj.activities || proj.activities.length === 0) return 99;
    return Math.min(...proj.activities.map(a => PRIORITY_ORDER[a.priority || 'medium'] ?? 2));
}

function sortedProjects() {
    return [...projects].sort((a, b) => getProjectPriorityVal(a) - getProjectPriorityVal(b));
}

function formatSchedule(act) {
    const start = act.start_time || act.startTime;
    const end = act.end_time || act.endTime;
    if (start && end) return `${start.substring(0, 5)} – ${end.substring(0, 5)}`;
    if (start) return `Desde ${start.substring(0, 5)}`;
    if (end) return `Hasta ${end.substring(0, 5)}`;
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
        a.dataset.project = p.key || p.id;
        a.onclick = (e) => { e.preventDefault(); selectProject(p.key || p.id, a); };

        a.innerHTML = `
            <i class="${p.icon || 'ri-circle-fill'}" style="color:${p.color}; font-size:1.1rem; width:20px; text-align:center"></i>
            <span style="flex:1">${p.name}</span>
            <span class="nav-progress">${projectProgress(p)}%</span>
        `;
        nav.appendChild(a);
    });
}

function selectProject(key, navEl) {
    if (key === 'all') {
        currentView = { type: 'all', projectKey: null };
    } else {
        currentView = { type: 'detail', projectKey: key };
    }

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // If navEl is not provided, try to find it
    const activeEl = navEl || document.querySelector(`.nav-item[data-project="${key}"]`);
    if (activeEl) activeEl.classList.add('active');

    if (key === 'all') {
        document.getElementById('view-title').textContent = 'Vista Global';
        document.getElementById('view-global').style.display = '';
        document.getElementById('view-detail').style.display = 'none';
        renderGlobalGantt();
    } else {
        const proj = projects.find(p => (p.key || p.id) == key);
        if (!proj) {
            selectProject('all');
            return;
        }
        document.getElementById('view-title').textContent = proj.name;
        document.getElementById('view-global').style.display = 'none';
        document.getElementById('view-detail').style.display = '';
        renderDetailView(proj);
    }
    updateKPIs();
    buildNav();
}

function updateKPIs() {
    let pendingCount = 0;
    projects.forEach(p => {
        if (p.activities) {
            pendingCount += p.activities.filter(a => (a.progress || 0) < 100).length;
        }
    });

    document.getElementById('kpi-progress').textContent = globalProgress() + '%';
    document.getElementById('kpi-total-days').textContent = globalTotalDays();
    document.getElementById('kpi-total-projects').textContent = projects.length;
    document.getElementById('kpi-pending-tasks').textContent = pendingCount;
}

/* ═══════════════════════════════════════════
   Global Gantt
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
        const key = p.key || p.id;

        let cells = `<td>
            <div class="gantt-label-cell">
                <i class="${p.icon || 'ri-circle-fill'}" style="color:${p.color}; font-size:1.1rem; min-width:20px; text-align:center"></i>
                <span>${p.name}</span>
            </div>
        </td>`;

        for (let d = 1; d <= axisDays; d++) {
            if (d === 1 && td > 0) {
                cells += `<td class="gantt-bar-cell day-col" colspan="${td}">
                    <div class="bar-fill" style="left:0;right:0;background:${p.color}20;border:1px solid ${p.color}40">
                        <div class="bar-progress" style="width:${pct}%;background:${p.color}"></div>
                        <span style="position:relative;z-index:2">${pct}% (${td}d)</span>
                    </div>
                </td>`;
                d += td - 1;
            } else {
                const cls = d % 5 === 0 ? 'week-start' : '';
                cells += `<td class="day-col ${cls}"></td>`;
            }
        }

        rows += `<tr onclick="selectProject('${key}', document.querySelector('[data-project=\\'${key}\\']'))">${cells}</tr>`;
    });

    container.innerHTML = `
        <table class="gantt-table fade-in">
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

/* ═══════════════════════════════════════════
   Detail View
   ═══════════════════════════════════════════ */
function renderDetailView(proj) {
    const pct = projectProgress(proj);
    const key = proj.key || proj.id;

    document.getElementById('detail-header').innerHTML = `
        <div class="detail-icon" style="background:${proj.color}20;color:${proj.color}"><i class="${proj.icon}"></i></div>
        <div class="detail-meta">
            <h2>${proj.name}</h2>
            <p>${proj.description || proj.desc || ''}</p>
        </div>
        <div style="display:flex; gap:8px; align-items:center; margin-left:auto">
            <button class="btn-edit-project" onclick="openEditModal('${key}')"><i class="ri-settings-line"></i> Proyecto</button>
            <button class="btn-delete-project" onclick="deleteProject('${key}')" style="padding: 10px; height: 42px; width: 42px; display: flex; align-items: center; justify-content: center;"><i class="ri-delete-bin-line"></i></button>
            <div class="detail-progress" style="margin-left:8px">
                <div class="big-pct" style="color:${proj.color}">${pct}%</div>
                <div class="label">${Math.round(completedDays(proj))} / ${totalDays(proj)} d</div>
            </div>
        </div>
    `;
    document.getElementById('detail-header').classList.add('fade-in');

    const sortedActivities = [...proj.activities].sort((a, b) =>
        (PRIORITY_ORDER[a.priority || 'medium'] ?? 2) - (PRIORITY_ORDER[b.priority || 'medium'] ?? 2)
    );

    const maxDays = Math.max(...sortedActivities.map(a => parseInt(a.days) || 1), 1);
    const axisDays = maxDays + 2;

    let headerCells = '<th>Actividad</th>';
    for (let d = 1; d <= axisDays; d++) {
        headerCells += `<th class="day-col">${d}</th>`;
    }

    let rows = '';
    sortedActivities.forEach((act) => {
        const barColor = act.progress >= 100 ? 'var(--success)' : (act.progress > 0 ? 'var(--secondary)' : proj.color);
        const originalIndex = proj.activities.indexOf(act);
        const sched = formatSchedule(act);
        const schedLabel = sched ? ` · ${sched}` : '';
        const prio = act.priority || 'medium';

        let cells = `<td>
            <div class="gantt-label-cell" style="cursor:pointer" onclick="openActivityModal('${key}', ${originalIndex})">
                <span class="dot" style="background:${barColor}"></span>
                <span style="${act.progress >= 100 ? 'text-decoration:line-through;opacity:.5' : ''}">
                    ${act.text}${schedLabel ? `<span style="color:var(--secondary);font-size:.75rem">${schedLabel}</span>` : ''} 
                    <span class="priority-badge ${prio}" style="font-size:0.6rem">${PRIORITY_LABELS[prio]}</span>
                </span>
            </div>
        </td>`;

        for (let d = 1; d <= axisDays; d++) {
            if (d === 1 && act.days > 0) {
                cells += `<td class="gantt-bar-cell day-col" colspan="${act.days}">
                    <div class="bar-fill" style="left:0;right:0;background:${proj.color}20; border: 1px solid ${proj.color}40">
                        <div class="bar-progress" style="width:${act.progress || 0}%; background:${barColor}"></div>
                        <span style="position:relative; z-index:2">${act.progress || 0}%</span>
                    </div>
                </td>`;
                d += act.days - 1;
            } else {
                cells += `<td class="day-col"></td>`;
            }
        }
        rows += `<tr onclick="openActivityModal('${key}', ${originalIndex})">${cells}</tr>`;
    });

    document.getElementById('gantt-detail').innerHTML = `
        <table class="gantt-table fade-in">
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

/* ═══════════════════════════════════════════
   Activity Edit Modal Logic
   ═══════════════════════════════════════════ */
let activityModalState = { projectKey: null, actIndex: null };

function openActivityModal(pKey, idx) {
    const proj = projects.find(p => (p.key || p.id) == pKey);
    if (!proj || !proj.activities[idx]) return;

    activityModalState = { projectKey: pKey, actIndex: idx };
    const act = proj.activities[idx];

    document.getElementById('act-edit-name').value = act.text;
    document.getElementById('act-edit-start').value = act.start_time || act.startTime || '';
    document.getElementById('act-edit-end').value = act.end_time || act.endTime || '';
    document.getElementById('act-edit-progress').value = act.progress || 0;
    document.getElementById('act-edit-progress-val').innerText = act.progress || 0;
    document.getElementById('act-edit-status').value = getStatus(act.progress);
    document.getElementById('act-edit-priority').value = act.priority || 'medium';
    document.getElementById('act-edit-days').value = act.days || 1;

    document.getElementById('activity-modal-overlay').classList.add('open');
}

function closeActivityModal() {
    document.getElementById('activity-modal-overlay').classList.remove('open');
}

function saveActivityEdit() {
    const { projectKey, actIndex } = activityModalState;
    const proj = projects.find(p => (p.key || p.id) == projectKey);
    if (!proj) return;

    const act = proj.activities[actIndex];
    act.startTime = document.getElementById('act-edit-start').value;
    act.endTime = document.getElementById('act-edit-end').value;

    const progress = parseInt(document.getElementById('act-edit-progress').value) || 0;
    const priority = document.getElementById('act-edit-priority').value;
    const days = parseInt(document.getElementById('act-edit-days').value) || 1;

    act.progress = progress;
    act.priority = priority;
    act.days = days;
    act.done = progress >= 100;

    saveData().then(() => {
        closeActivityModal();
        renderDetailView(proj);
        updateKPIs();
        buildNav();
    });
}

function deleteProject(projKey) {
    if (!confirm('¿Eliminar proyecto?')) return;
    projects = projects.filter(p => (p.key || p.id) != projKey);
    saveData();
    selectProject('all', document.querySelector('[data-project="all"]'));
}

/* ═══════════════════════════════════════════
   Main Project Modal
   ═══════════════════════════════════════════ */
let modalState = { mode: 'create', editKey: null };

function openModal() {
    modalState = { mode: 'create', editKey: null };
    document.getElementById('inp-name').value = '';
    document.getElementById('inp-desc').value = '';
    document.getElementById('activities-list').innerHTML = '';
    document.getElementById('modal-title').innerText = 'Nuevo Proyecto';
    document.getElementById('modal-save-btn').innerHTML = '<i class="ri-add-line"></i> Crear Proyecto';
    addActivityRow();
    addActivityRow();

    // Default selection
    const defaultColor = document.querySelector('.color-item[data-color="#00ccff"]');
    if (defaultColor) setColor(defaultColor);
    const defaultIcon = document.querySelector('.icon-list-item[data-icon="ri-flask-line"]');
    if (defaultIcon) setIcon(defaultIcon);

    document.getElementById('modal-overlay').classList.add('open');
}

function openEditModal(key) {
    const proj = projects.find(p => (p.key || p.id) == key);
    if (!proj) return;
    modalState = { mode: 'edit', editKey: key };
    document.getElementById('inp-name').value = proj.name;
    document.getElementById('inp-desc').value = proj.description || proj.desc || '';
    document.getElementById('activities-list').innerHTML = '';
    proj.activities.forEach(act => {
        addActivityRow(act.text, act.priority, act.days, act.start_time || act.startTime, act.end_time || act.endTime, act.progress);
    });
    document.getElementById('modal-save-btn').innerHTML = '<i class="ri-save-line"></i> Guardar Cambios';

    // Highlight existing color/icon
    const colorEl = document.querySelector(`.color-item[data-color="${proj.color}"]`);
    if (colorEl) {
        setColor(colorEl);
    } else if (proj.color) {
        setCustomColor(proj.color);
    }

    const iconID = proj.icon || 'ri-flask-line';
    const availableIcons = [
        { id: 'ri-flask-line', name: 'Ciencia' }, { id: 'ri-plant-line', name: 'Botánica' },
        { id: 'ri-shield-line', name: 'Seguridad' }, { id: 'ri-seedling-line', name: 'Cultivo' },
        { id: 'ri-database-2-line', name: 'Datos' }, { id: 'ri-server-line', name: 'Servidor' },
        { id: 'ri-robot-line', name: 'IA' }, { id: 'ri-code-s-slash-line', name: 'Código' },
        { id: 'ri-leaf-line', name: 'Ecología' }, { id: 'ri-tools-line', name: 'Taller' },
        { id: 'ri-lightbulb-line', name: 'Innovación' }, { id: 'ri-rocket-line', name: 'Proyecto' },
        { id: 'ri-water-flash-line', name: 'Hidráulica' }, { id: 'ri-sun-line', name: 'Energía' },
        { id: 'ri-microscope-line', name: 'Laboratorio' }, { id: 'ri-radar-line', name: 'Monitoreo' }
    ];
    const iconData = availableIcons.find(i => i.id === iconID) || availableIcons[0];
    setIcon(iconData.id, iconData.name);

    document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }

function addActivityRow(name = '', prio = 'medium', days = 1, start = '', end = '', progress = 0) {
    const list = document.getElementById('activities-list');
    const row = document.createElement('div');
    row.className = 'activity-row';
    row.innerHTML = `
        <input type="text" class="act-name col-name" placeholder="Actividad" value="${name.replace(/"/g, '&quot;')}">
        <select class="act-prio col-prio">
            <option value="low" ${prio === 'low' ? 'selected' : ''}>Baja</option>
            <option value="medium" ${prio === 'medium' ? 'selected' : ''}>Media</option>
            <option value="high" ${prio === 'high' ? 'selected' : ''}>Alta</option>
            <option value="critical" ${prio === 'critical' ? 'selected' : ''}>Crítica</option>
        </select>
        <input type="number" class="act-days col-days" min="1" value="${days}">
        <div class="col-time">
            <div class="progress-input-group">
                <input type="number" class="act-progress" min="0" max="100" value="${progress || 0}" onchange="this.value = Math.min(100, Math.max(0, this.value))">
                <span style="font-size:0.7rem; opacity:0.6">%</span>
            </div>
        </div>
        <input type="time" class="act-time act-start col-time" value="${start || ''}">
        <input type="time" class="act-time act-end col-time" value="${end || ''}">
        <div class="col-del">
            <button type="button" class="btn-remove-act" onclick="this.parentElement.parentElement.remove()"><i class="ri-close-circle-line"></i></button>
        </div>
    `;
    list.appendChild(row);
}

function saveProject() {
    const name = document.getElementById('inp-name').value;
    const desc = document.getElementById('inp-desc').value;

    // Improved color detection
    const activeColorItem = document.querySelector('.color-item.active');
    const color = activeColorItem ? (activeColorItem.dataset.color || document.getElementById('custom-color').value) : document.getElementById('custom-color').value;

    const icon = document.getElementById('inp-icon').value;
    const rows = document.querySelectorAll('#activities-list .activity-row');
    const activities = [];
    rows.forEach(row => {
        const text = row.querySelector('.act-name').value;
        const priority = row.querySelector('.act-prio').value;
        const days = row.querySelector('.act-days').value;
        const progress = parseInt(row.querySelector('.act-progress').value) || 0;
        const startTime = row.querySelector('.act-start').value;
        const endTime = row.querySelector('.act-end').value;
        if (text) activities.push({ text, priority, days, startTime, endTime, progress, done: progress >= 100 });
    });
    if (modalState.mode === 'edit') {
        const proj = projects.find(p => (p.key || p.id) == modalState.editKey);
        if (proj) {
            proj.name = name; proj.description = desc; proj.color = color; proj.icon = icon; proj.activities = activities;
        }
    } else {
        projects.push({ key: 'new_' + Date.now(), name, description: desc, color, icon, activities });
    }
    saveData().then(() => { closeModal(); loadData(); });
}

function setColor(el) {
    document.querySelectorAll('.color-item').forEach(d => d.classList.remove('active'));
    el.classList.add('active');
}

function openCustomColor(el) {
    document.getElementById('custom-color').click();
}

function setCustomColor(hex) {
    const btn = document.querySelector('.custom-color-btn');
    document.querySelectorAll('.color-item').forEach(d => d.classList.remove('active'));
    btn.classList.add('active');
    btn.querySelector('.color-dot-lg').style.background = hex;
    document.getElementById('custom-color').value = hex;
}

function toggleIconDropdown(e) {
    e.stopPropagation();
    document.getElementById('icon-dropdown').classList.toggle('open');
}

function setIcon(id, name, el) {
    document.getElementById('inp-icon').value = id;
    document.getElementById('selected-icon-img').className = id;
    document.getElementById('selected-icon-name').innerText = name;

    document.querySelectorAll('.icon-dropdown-item').forEach(item => item.classList.remove('active'));
    if (el) el.classList.add('active');

    document.getElementById('icon-dropdown').classList.remove('open');
}

// Close dropdowns on outside click
document.addEventListener('click', () => {
    document.getElementById('icon-dropdown')?.classList.remove('open');
});

document.addEventListener('DOMContentLoaded', loadData);
