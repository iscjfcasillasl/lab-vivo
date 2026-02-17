/* ═══════════════════════════════════════════
   Data Model – Grouped by PROJECT
   ═══════════════════════════════════════════ */
const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const PRIORITY_LABELS = { critical: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja' };

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

function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

async function apiCall(url, method = 'GET', body = null) {
    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCsrfToken(),
            'Accept': 'application/json',
        }
    };
    if (body) opts.body = JSON.stringify(body);

    const response = await fetch(url, opts);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.message || 'Error del servidor');
    }
    return data;
}

async function loadData() {
    try {
        const data = await apiCall(API_PROJECTS_URL + '?t=' + Date.now());
        projects = data && data.length > 0 ? data : [];
    } catch (error) {
        console.error('Error loading data:', error);
        projects = [];
    }

    if (currentView.type === 'all') {
        selectProject('all');
    } else {
        selectProject(currentView.projectKey);
    }
}

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */
function totalDays(proj) {
    return (proj.activities || []).reduce((s, a) => s + (parseInt(a.days) || 0), 0);
}

function completedDays(proj) {
    return (proj.activities || []).reduce((s, a) => s + ((parseInt(a.days) || 0) * (a.progress || 0) / 100), 0);
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

function canEditActivity(act) {
    return CURRENT_USER.isSuperAdmin || act.created_by === CURRENT_USER.id;
}

function canDeleteActivity(act) {
    return CURRENT_USER.isSuperAdmin || act.created_by === CURRENT_USER.id;
}

function canDeleteProject() {
    return CURRENT_USER.isSuperAdmin === true;
}

function canEditProject() {
    return CURRENT_USER.isSuperAdmin === true;
}

/* ═══════════════════════════════════════════
   Navigation
   ═══════════════════════════════════════════ */
function buildNav() {
    const nav = document.getElementById('project-nav');
    const globalLink = nav.querySelector('[data-project="all"]');
    const usersLink = nav.querySelector('[data-project="users"]'); // Keep the users link

    nav.innerHTML = '';
    if (globalLink) nav.appendChild(globalLink);
    if (usersLink) nav.appendChild(usersLink);

    sortedProjects().forEach(p => {
        const div = document.createElement('div');
        div.className = 'nav-item';
        div.style.cursor = 'pointer';
        div.dataset.project = p.key || p.id;
        div.onclick = () => { selectProject(p.key || p.id, div); };

        div.innerHTML = `
            <i class="${p.icon || 'ri-circle-fill'}" style="color:${p.color}; font-size:1.1rem; width:20px; text-align:center"></i>
            <span style="flex:1">${p.name}</span>
            <span class="nav-progress">${projectProgress(p)}%</span>
        `;
        nav.appendChild(div);
    });
}

function selectProject(key, navEl) {
    if (key === 'all') {
        currentView = { type: 'all', projectKey: null };
    } else {
        currentView = { type: 'detail', projectKey: key };
    }

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeEl = navEl || document.querySelector(`.nav-item[data-project="${key}"]`);
    if (activeEl) activeEl.classList.add('active');

    // Hide all views first
    document.getElementById('view-global').style.display = 'none';
    document.getElementById('view-detail').style.display = 'none';
    const viewUsers = document.getElementById('view-users');
    if (viewUsers) viewUsers.style.display = 'none';

    if (key === 'all') {
        document.getElementById('view-title').textContent = 'Vista Global';
        document.getElementById('view-global').style.display = '';
        renderGlobalGantt();
    } else {
        const proj = projects.find(p => (p.key || p.id) == key);
        if (!proj) {
            selectProject('all');
            return;
        }
        document.getElementById('view-title').textContent = proj.name;
        document.getElementById('view-detail').style.display = '';
        renderDetailView(proj);
        renderProjectLogs(proj);
    }
    updateKPIs();
    buildNav();
}

async function showUserManagement(navEl) {
    currentView = { type: 'users', projectKey: 'users' };

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (navEl) navEl.classList.add('active');

    document.getElementById('view-global').style.display = 'none';
    document.getElementById('view-detail').style.display = 'none';
    document.getElementById('view-users').style.display = '';
    document.getElementById('view-title').textContent = 'Gestión de Usuarios';

    await loadUsers();
}

async function loadUsers() {
    try {
        const users = await apiCall(`${API_BASE}/users`);
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = users.map(user => {
            const statusClass = user.approved ? 'priority-badge low' : 'priority-badge critical';
            const statusText = user.approved ? 'Aprobado' : 'Pendiente';
            const isSelf = user.id === CURRENT_USER.id;

            return `
                <tr>
                    <td style="text-align:left">
                        <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
                            <img src="${user.avatar || 'https://ui-avatars.com/api/?name=' + user.name}" style="width:32px;height:32px;border-radius:50%">
                            <span style="font-weight:600">${user.name}</span>
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td style="font-size:0.8rem;opacity:0.7">${new Date(user.created_at).toLocaleDateString('es-MX')}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                    <td><span style="text-transform:uppercase;font-size:0.7rem;font-weight:700;opacity:0.6">${user.role}</span></td>
                    <td>
                        <div style="display:flex;gap:8px;justify-content:center">
                            ${!user.approved ? `
                                <button onclick="approveUser(${user.id})" class="btn-edit-project" style="background:var(--success); color:#fff; border:none; padding:6px 12px; font-size:0.8rem">
                                    <i class="ri-check-line"></i> Aprobar
                                </button>
                            ` : ''}
                            ${!isSelf ? `
                                <button onclick="deleteUser(${user.id})" class="btn-delete-project" style="padding:6px;width:32px;height:32px;display:flex;align-items:center;justify-content:center">
                                    <i class="ri-delete-bin-line"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        alert('error cargando usuarios: ' + error.message);
    }
}

async function approveUser(userId) {
    if (!confirm('¿Aprobar acceso para este usuario?')) return;
    try {
        await apiCall(`${API_BASE}/users/${userId}/approve`, 'PUT');
        await loadUsers();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function rejectUser(userId) {
    if (!confirm('¿Rechazar y eliminar este usuario?')) return;
    try {
        await apiCall(`${API_BASE}/users/${userId}`, 'DELETE');
        await loadUsers();
    } catch (error) {
        alert('Error: ' + error.message);
    }
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

    // Project header with permission-aware buttons
    let editBtns = '';
    if (canEditProject()) {
        editBtns += `<button class="btn-edit-project" onclick="openEditModal('${key}')"><i class="ri-settings-line"></i> Proyecto</button>`;
    }
    if (canDeleteProject()) {
        editBtns += `<button class="btn-delete-project" onclick="deleteProject(${proj.id})" style="padding: 10px; height: 42px; width: 42px; display: flex; align-items: center; justify-content: center;"><i class="ri-delete-bin-line"></i></button>`;
    }

    document.getElementById('detail-header').innerHTML = `
        <div class="detail-icon" style="background:${proj.color}20;color:${proj.color}"><i class="${proj.icon}"></i></div>
        <div class="detail-meta">
            <h2>${proj.name}</h2>
            <p>${proj.description || proj.desc || ''}</p>
        </div>
        <div style="display:flex; gap:8px; align-items:center; margin-left:auto">
            ${editBtns}
            <button class="btn-vibrant" onclick="openAddActivityModal(${proj.id})"><i class="ri-add-line"></i> Actividad</button>
            <div class="detail-progress" style="margin-left:8px">
                <div class="big-pct" style="color:${proj.color}">${pct}%</div>
                <div class="label">${Math.round(completedDays(proj))} / ${totalDays(proj)} d</div>
            </div>
        </div>
    `;
    document.getElementById('detail-header').classList.add('fade-in');

    const sortedActivities = [...(proj.activities || [])].sort((a, b) =>
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
        const sched = formatSchedule(act);
        const schedLabel = sched ? ` · ${sched}` : '';
        const prio = act.priority || 'medium';
        const creatorName = act.creator ? act.creator.name : 'Sistema';
        const isOwner = act.created_by === CURRENT_USER.id;

        let ownerBadge = '';
        if (isOwner) {
            ownerBadge = `<span style="font-size:0.55rem;background:var(--primary);color:white;padding:1px 5px;border-radius:3px;margin-left:4px">MÍA</span>`;
        }

        let cells = `<td>
            <div class="gantt-label-cell" style="cursor:pointer" onclick="openActivityModal(${proj.id}, ${act.id})">
                <span class="dot" style="background:${barColor}"></span>
                <span style="${act.progress >= 100 ? 'text-decoration:line-through;opacity:.5' : ''}">
                    ${act.text}${schedLabel ? `<span style="color:var(--secondary);font-size:.75rem">${schedLabel}</span>` : ''} 
                    <span class="priority-badge ${prio}" style="font-size:0.6rem">${PRIORITY_LABELS[prio]}</span>
                    ${ownerBadge}
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
        rows += `<tr onclick="openActivityModal(${proj.id}, ${act.id})">${cells}</tr>`;
    });

    document.getElementById('gantt-detail').innerHTML = `
        <table class="gantt-table fade-in">
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

/* ═══════════════════════════════════════════
   Project Logs (Cumulative justifications)
   ═══════════════════════════════════════════ */
function renderProjectLogs(proj) {
    const container = document.getElementById('activity-logs-container');
    const allLogs = [];

    (proj.activities || []).forEach(act => {
        (act.logs || []).forEach(log => {
            allLogs.push({ ...log, activityText: act.text });
        });
    });

    allLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (allLogs.length === 0) {
        container.innerHTML = '<p style="text-align:center;opacity:0.5;font-size:0.85rem">Sin registros de cambios aún</p>';
        return;
    }

    const actionLabels = {
        'created': '🆕 Creó actividad',
        'progress_update': '📊 Actualizó avance',
        'edited': '✏️ Editó detalles',
        'deleted': '🗑️ Eliminó actividad'
    };

    container.innerHTML = allLogs.slice(0, 50).map(log => {
        const date = new Date(log.created_at);
        const dateStr = date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        const userName = log.user ? log.user.name : 'Desconocido';
        const userAvatar = log.user && log.user.avatar
            ? `<img src="${log.user.avatar}" style="width:22px;height:22px;border-radius:50%;object-fit:cover" alt="">`
            : `<i class="ri-user-line" style="font-size:0.9rem"></i>`;

        let progressInfo = '';
        if (log.action === 'progress_update' && log.old_progress !== null) {
            const color = log.new_progress > log.old_progress ? 'var(--success)' : 'var(--warning)';
            progressInfo = `<span style="color:${color};font-weight:600;font-size:0.75rem">${log.old_progress}% → ${log.new_progress}%</span>`;
        }

        return `
            <div style="display:flex;gap:10px;padding:10px;border-bottom:1px solid rgba(255,255,255,0.05);align-items:flex-start">
                <div style="flex-shrink:0;margin-top:2px">${userAvatar}</div>
                <div style="flex:1;min-width:0">
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                        <span style="font-weight:600;font-size:0.8rem">${userName}</span>
                        <span style="font-size:0.7rem;opacity:0.5">${actionLabels[log.action] || log.action}</span>
                        ${progressInfo}
                    </div>
                    <div style="font-size:0.75rem;opacity:0.7;margin-top:2px">📌 ${log.activityText || 'Actividad'}</div>
                    <div style="font-size:0.8rem;margin-top:4px;padding:6px 10px;background:rgba(255,255,255,0.03);border-radius:6px;border-left:3px solid var(--primary)">${log.justification}</div>
                    <div style="font-size:0.65rem;opacity:0.4;margin-top:4px">${dateStr} · ${timeStr}</div>
                </div>
            </div>
        `;
    }).join('');
}

/* ═══════════════════════════════════════════
   Activity Edit Modal Logic
   ═══════════════════════════════════════════ */
let activityModalState = { projectId: null, activityId: null, activity: null };

function openActivityModal(projectId, activityId) {
    const proj = projects.find(p => p.id == projectId);
    if (!proj) return;
    const act = proj.activities.find(a => a.id == activityId);
    if (!act) return;

    activityModalState = { projectId, activityId, activity: act };

    const canEdit = canEditActivity(act);
    const nameInput = document.getElementById('act-edit-name');
    nameInput.value = act.text;
    nameInput.readOnly = !canEdit;
    nameInput.style.opacity = canEdit ? '1' : '0.7';

    document.getElementById('act-edit-start').value = act.start_time || act.startTime || '';
    document.getElementById('act-edit-end').value = act.end_time || act.endTime || '';
    document.getElementById('act-edit-progress').value = act.progress || 0;
    document.getElementById('act-edit-progress-val').innerText = act.progress || 0;
    document.getElementById('act-edit-status').value = getStatus(act.progress);
    document.getElementById('act-edit-priority').value = act.priority || 'medium';
    document.getElementById('act-edit-days').value = act.days || 1;
    document.getElementById('act-edit-justification').value = '';

    // Show ownership info
    const ownerInfo = document.getElementById('act-owner-info');
    const creatorName = act.creator ? act.creator.name : 'Sistema';
    const creatorEmail = act.creator ? act.creator.email : '';
    const isOwner = act.created_by === CURRENT_USER.id;
    ownerInfo.innerHTML = `
        <i class="ri-user-line"></i>
        <span>Creada por: <strong>${creatorName}</strong> ${creatorEmail ? `(${creatorEmail})` : ''}</span>
        ${isOwner ? '<span style="background:var(--primary);color:white;padding:2px 6px;border-radius:4px;font-size:0.65rem;font-weight:600;margin-left:auto">TÚ</span>' : ''}
    `;

    // Enable/disable fields based on permissions
    document.getElementById('act-edit-days').disabled = !canEdit;
    document.getElementById('act-edit-start').disabled = !canEdit;
    document.getElementById('act-edit-end').disabled = !canEdit;
    document.getElementById('act-edit-priority').disabled = !canEdit;

    // Show/hide delete button
    document.getElementById('act-delete-btn').style.display = canDeleteActivity(act) ? '' : 'none';

    // Show mini logs
    const logsSection = document.getElementById('act-modal-logs-section');
    const logsContainer = document.getElementById('act-modal-logs');
    if (act.logs && act.logs.length > 0) {
        logsSection.style.display = '';
        logsContainer.innerHTML = act.logs.slice(0, 10).map(log => {
            const date = new Date(log.created_at);
            const dateStr = date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
            const timeStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            const userName = log.user ? log.user.name : '?';
            let progressBadge = '';
            if (log.action === 'progress_update') {
                progressBadge = `<span style="font-size:0.65rem;color:var(--success)">${log.old_progress}%→${log.new_progress}%</span>`;
            }
            return `<div style="padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:0.75rem">
                <strong>${userName}</strong> ${progressBadge} <span style="opacity:0.5">${dateStr} ${timeStr}</span>
                <div style="opacity:0.7;margin-top:2px">${log.justification}</div>
            </div>`;
        }).join('');
    } else {
        logsSection.style.display = 'none';
    }

    document.getElementById('activity-modal-overlay').classList.add('open');
}

function closeActivityModal() {
    document.getElementById('activity-modal-overlay').classList.remove('open');
}

async function saveActivityEdit() {
    const { projectId, activityId, activity } = activityModalState;
    if (!activity) return;

    const justification = document.getElementById('act-edit-justification').value.trim();
    if (!justification || justification.length < 5) {
        alert('⚠️ Debes proporcionar una justificación de al menos 5 caracteres.');
        document.getElementById('act-edit-justification').focus();
        return;
    }

    const newProgress = parseInt(document.getElementById('act-edit-progress').value) || 0;
    const oldProgress = activity.progress || 0;

    try {
        // Update progress if changed
        if (newProgress !== oldProgress) {
            await apiCall(`${API_BASE}/activities/${activityId}/progress`, 'PUT', {
                progress: newProgress,
                justification: justification,
            });
        }

        // Update other details if user is owner/admin
        if (canEditActivity(activity)) {
            await apiCall(`${API_BASE}/activities/${activityId}`, 'PUT', {
                text: document.getElementById('act-edit-name').value.trim(),
                days: parseInt(document.getElementById('act-edit-days').value) || 1,
                start_time: document.getElementById('act-edit-start').value || null,
                end_time: document.getElementById('act-edit-end').value || null,
                priority: document.getElementById('act-edit-priority').value,
                justification: justification,
            });
        } else if (newProgress === oldProgress) {
            // If nothing changed, at least tell user
            alert('No tienes permisos para editar los detalles de esta actividad.');
            return;
        }

        closeActivityModal();
        await loadData();
    } catch (error) {
        alert('❌ ' + error.message);
    }
}

async function deleteActivityFromModal() {
    const { activityId, activity } = activityModalState;
    if (!activity) return;

    if (!canDeleteActivity(activity)) {
        alert('❌ Solo puedes eliminar actividades que tú hayas creado.');
        return;
    }

    if (!confirm('¿Eliminar esta actividad? Esta acción no se puede deshacer.')) return;

    try {
        await apiCall(`${API_BASE}/activities/${activityId}`, 'DELETE');
        closeActivityModal();
        await loadData();
    } catch (error) {
        alert('❌ ' + error.message);
    }
}

async function deleteProject(projectId) {
    if (!canDeleteProject()) {
        alert('❌ Solo el administrador puede eliminar proyectos.');
        return;
    }
    if (!confirm('¿Eliminar proyecto y todas sus actividades?')) return;

    try {
        await apiCall(`${API_PROJECTS_URL}/${projectId}`, 'DELETE');
        selectProject('all', document.querySelector('[data-project="all"]'));
        await loadData();
    } catch (error) {
        alert('❌ ' + error.message);
    }
}

/* ═══════════════════════════════════════════
   Add Activity Modal (Quick add to a project)
   ═══════════════════════════════════════════ */
function openAddActivityModal(projectId) {
    // Use the main activity modal but in "create" mode
    activityModalState = { projectId, activityId: null, activity: null };

    document.getElementById('act-edit-name').value = '';
    document.getElementById('act-edit-name').readOnly = false;
    document.getElementById('act-edit-name').style.opacity = '1';
    document.getElementById('act-edit-start').value = '';
    document.getElementById('act-edit-end').value = '';
    document.getElementById('act-edit-progress').value = 0;
    document.getElementById('act-edit-progress-val').innerText = 0;
    document.getElementById('act-edit-status').value = 'pending';
    document.getElementById('act-edit-priority').value = 'medium';
    document.getElementById('act-edit-days').value = 1;
    document.getElementById('act-edit-justification').value = '';

    // Enable all
    document.getElementById('act-edit-days').disabled = false;
    document.getElementById('act-edit-start').disabled = false;
    document.getElementById('act-edit-end').disabled = false;
    document.getElementById('act-edit-priority').disabled = false;

    // Owner info
    document.getElementById('act-owner-info').innerHTML = `
        <i class="ri-add-circle-line" style="color:var(--success)"></i>
        <span style="color:var(--success);font-weight:600">Nueva Actividad</span>
    `;

    // Hide delete & logs
    document.getElementById('act-delete-btn').style.display = 'none';
    document.getElementById('act-modal-logs-section').style.display = 'none';

    document.getElementById('activity-modal-overlay').classList.add('open');
}

// Override saveActivityEdit to handle both create and edit
const originalSaveActivityEdit = saveActivityEdit;
saveActivityEdit = async function () {
    const { projectId, activityId } = activityModalState;

    // If no activityId, it's a CREATE
    if (!activityId) {
        const name = document.getElementById('act-edit-name').value.trim();
        const justification = document.getElementById('act-edit-justification').value.trim();

        if (!name) {
            alert('⚠️ El nombre de la actividad es obligatorio.');
            document.getElementById('act-edit-name').focus();
            return;
        }
        if (!justification || justification.length < 5) {
            alert('⚠️ Debes proporcionar una justificación de al menos 5 caracteres.');
            document.getElementById('act-edit-justification').focus();
            return;
        }

        try {
            await apiCall(`${API_PROJECTS_URL}/${projectId}/activities`, 'POST', {
                text: name,
                days: parseInt(document.getElementById('act-edit-days').value) || 1,
                priority: document.getElementById('act-edit-priority').value,
                start_time: document.getElementById('act-edit-start').value || null,
                end_time: document.getElementById('act-edit-end').value || null,
                progress: parseInt(document.getElementById('act-edit-progress').value) || 0,
                justification: justification,
            });

            closeActivityModal();
            // Reset name field to readonly for next edit opens
            document.getElementById('act-edit-name').readOnly = true;
            document.getElementById('act-edit-name').style.opacity = '0.7';
            await loadData();
        } catch (error) {
            alert('❌ ' + error.message);
        }
        return;
    }

    // Otherwise it's an EDIT — use original logic
    return originalSaveActivityEdit();
};

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

    const defaultColor = document.querySelector('.color-item[data-color="#00ccff"]');
    if (defaultColor) setColor(defaultColor);

    document.getElementById('modal-overlay').classList.add('open');
}

function openEditModal(key) {
    if (!canEditProject()) {
        alert('❌ Solo el administrador puede editar proyectos.');
        return;
    }

    const proj = projects.find(p => (p.key || p.id) == key);
    if (!proj) return;
    modalState = { mode: 'edit', editKey: key, projectId: proj.id };
    document.getElementById('inp-name').value = proj.name;
    document.getElementById('inp-desc').value = proj.description || proj.desc || '';
    document.getElementById('activities-list').innerHTML = '';

    // In edit mode, don't show activity rows (activities are managed individually now)
    document.getElementById('modal-save-btn').innerHTML = '<i class="ri-save-line"></i> Guardar Cambios';

    const colorEl = document.querySelector(`.color-item[data-color="${proj.color}"]`);
    if (colorEl) {
        setColor(colorEl);
    } else if (proj.color) {
        setCustomColor(proj.color);
    }

    const iconID = proj.icon || 'ri-flask-line';
    const iconList = [
        { id: 'ri-flask-line', name: 'Ciencia' }, { id: 'ri-plant-line', name: 'Botánica' },
        { id: 'ri-shield-line', name: 'Seguridad' }, { id: 'ri-seedling-line', name: 'Cultivo' },
        { id: 'ri-database-2-line', name: 'Datos' }, { id: 'ri-server-line', name: 'Servidor' },
        { id: 'ri-robot-line', name: 'IA' }, { id: 'ri-code-s-slash-line', name: 'Código' },
        { id: 'ri-leaf-line', name: 'Ecología' }, { id: 'ri-tools-line', name: 'Taller' },
        { id: 'ri-lightbulb-line', name: 'Innovación' }, { id: 'ri-rocket-line', name: 'Proyecto' },
        { id: 'ri-water-flash-line', name: 'Hidráulica' }, { id: 'ri-sun-line', name: 'Energía' },
        { id: 'ri-microscope-line', name: 'Laboratorio' }, { id: 'ri-radar-line', name: 'Monitoreo' }
    ];
    const iconData = iconList.find(i => i.id === iconID) || iconList[0];
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

async function saveProject() {
    const name = document.getElementById('inp-name').value.trim();
    const desc = document.getElementById('inp-desc').value.trim();

    if (!name) {
        alert('⚠️ El nombre del proyecto es obligatorio.');
        return;
    }

    const activeColorItem = document.querySelector('.color-item.active');
    const color = activeColorItem ? (activeColorItem.dataset.color || document.getElementById('custom-color').value) : '#00ccff';
    const icon = document.getElementById('inp-icon').value;

    try {
        if (modalState.mode === 'edit') {
            await apiCall(`${API_PROJECTS_URL}/${modalState.projectId}`, 'PUT', {
                name, description: desc, color, icon
            });
        } else {
            // Create project first
            const result = await apiCall(API_PROJECTS_URL, 'POST', {
                name, description: desc, color, icon
            });

            // Then create activities
            const rows = document.querySelectorAll('#activities-list .activity-row');
            for (const row of rows) {
                const text = row.querySelector('.act-name').value.trim();
                if (!text) continue;

                await apiCall(`${API_PROJECTS_URL}/${result.project.id}/activities`, 'POST', {
                    text,
                    priority: row.querySelector('.act-prio').value,
                    days: parseInt(row.querySelector('.act-days').value) || 1,
                    start_time: row.querySelector('.act-start').value || null,
                    end_time: row.querySelector('.act-end').value || null,
                    progress: parseInt(row.querySelector('.act-progress').value) || 0,
                    justification: 'Creación inicial del proyecto',
                });
            }
        }

        closeModal();
        await loadData();
    } catch (error) {
        alert('❌ ' + error.message);
    }
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

// Profile Dropdown Toggle
function toggleProfileDropdown(e) {
    if (e) e.stopPropagation();
    document.getElementById('profile-dropdown').classList.toggle('open');
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme, false);
}

function setTheme(mode, save = true) {
    const root = document.documentElement;
    const themePills = document.querySelectorAll('.theme-pill');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Reset pills
    themePills.forEach(p => p.classList.remove('active'));

    if (save) localStorage.setItem('theme', mode);

    let activeMode = mode;
    if (mode === 'system') {
        activeMode = systemDark ? 'dark' : 'light';
    }

    root.setAttribute('data-theme', activeMode);

    // Style active pill
    const activePill = document.getElementById(`theme-${mode}`);
    if (activePill) {
        activePill.classList.add('active');
    }
}

// Watch for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem('theme') === 'system') {
        setTheme('system', false);
    }
});

// Close dropdowns on outside click
document.addEventListener('click', () => {
    document.getElementById('icon-dropdown')?.classList.remove('open');
    document.getElementById('profile-dropdown')?.classList.remove('open');
});

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadData();
});
