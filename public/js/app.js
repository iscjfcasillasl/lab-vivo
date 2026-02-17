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
        window.currentProjectId = proj.id;
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
            // Determine status display
            let statusLabel = 'Sin Acceso';
            let badgeColor = 'var(--warning)';
            let status = user.status || (user.approved ? 'active' : 'pending');

            if (status === 'active') {
                statusLabel = 'Activo';
                badgeColor = 'var(--success)';
            } else if (status === 'suspended') {
                statusLabel = 'Suspendido';
                badgeColor = 'var(--danger)';
            } else {
                status = 'pending'; // normalize
            }

            const isSelf = user.id === CURRENT_USER.id;

            // Build actions
            let actions = '<span style="opacity:0.5;font-size:0.8rem">Sin acciones</span>';
            if (!isSelf) {
                // Button styles
                const btnCommon = "padding:6px 12px;border-radius:4px;display:inline-flex;align-items:center;border:none;color:white;cursor:pointer;gap:5px;font-size:0.8rem;transition:0.2s";

                if (status === 'active') {
                    // Active -> Suspender (Suspended) OR Revocar (Pending)
                    actions = `<div style="display:flex;gap:5px">
                        <button onclick="changeUserStatus(${user.id}, 'suspended')" title="Suspender" style="${btnCommon};background:var(--danger)"><i class="ri-prohibited-line"></i> Suspender</button>
                        <button onclick="changeUserStatus(${user.id}, 'pending')" title="Revocar" style="${btnCommon};background:var(--warning)"><i class="ri-close-circle-line"></i> Revocar</button>
                     </div>`;
                } else if (status === 'suspended') {
                    // Suspended -> Reactivar (Active)
                    actions = `<div style="display:flex;gap:5px">
                        <button onclick="changeUserStatus(${user.id}, 'active')" title="Reactivar" style="${btnCommon};background:var(--success)"><i class="ri-check-line"></i> Reactivar</button>
                     </div>`;
                } else {
                    // Pending -> Aprobar (Active) OR No Aprobar (Suspended)
                    actions = `<div style="display:flex;gap:5px">
                        <button onclick="changeUserStatus(${user.id}, 'active')" title="Aprobar" style="${btnCommon};background:var(--success)"><i class="ri-check-line"></i> Aprobar</button>
                        <button onclick="changeUserStatus(${user.id}, 'suspended')" title="No Aprobar" style="${btnCommon};background:var(--danger)"><i class="ri-close-line"></i> No Aprobar</button>
                     </div>`;
                }
            } else {
                actions = '<span style="opacity:0.5;font-size:0.8rem">Tú</span>';
            }

            return `
                <tr>
                    <td style="text-align:left">
                        <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
                            <img src="${user.avatar || 'https://ui-avatars.com/api/?name=' + user.name}" 
                                 onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=${user.name}'"
                                 style="width:32px;height:32px;border-radius:50%">
                            <span style="font-weight:600">${user.name}</span>
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td style="font-size:0.8rem;opacity:0.7">${new Date(user.created_at).toLocaleDateString('es-MX')}</td>
                    <td><span class="priority-badge" style="background:${badgeColor}20; color:${badgeColor}; font-size:0.75rem">${statusLabel}</span></td>
                    <td><span style="text-transform:uppercase;font-size:0.7rem;font-weight:700;opacity:0.6">${user.role}</span></td>
                    <td>
                        <div style="display:flex;gap:8px;justify-content:center">
                            ${actions}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        alert('error cargando usuarios: ' + error.message);
    }
}

async function changeUserStatus(userId, newStatus) {
    const actionName = newStatus === 'active' ? 'activar' : 'suspender';
    if (!confirm(`¿Estás seguro de ${actionName} a este usuario?`)) return;

    try {
        await apiCall(`${API_BASE}/users/${userId}/status`, 'PUT', { status: newStatus });
        await loadUsers();
    } catch (error) {
        alert('Error: ' + error.message);
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

async function deleteUser(userId) {
    if (!confirm('¿Eliminar este usuariopermanentemente?')) return;
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
    document.querySelectorAll('.export-dropdown').forEach(dd => dd.classList.remove('open'));
});

/* ═══════════════════════════════════════════
   Export Dropdown Toggle
   ═══════════════════════════════════════════ */
function toggleExportDropdown(e, id) {
    e.stopPropagation();
    // Close all dropdowns first
    document.querySelectorAll('.export-dropdown').forEach(dd => dd.classList.remove('open'));
    const dd = document.getElementById(`export-dd-${id}`);
    if (dd) dd.classList.toggle('open');
}

/* ═══════════════════════════════════════════
   Export Loading Overlay
   ═══════════════════════════════════════════ */
function showExportLoading(text, sub) {
    document.getElementById('export-loading-text').textContent = text || 'Generando exportación...';
    document.getElementById('export-loading-sub').textContent = sub || 'Esto puede tomar unos segundos';
    document.getElementById('export-loading').classList.add('active');
}

function hideExportLoading() {
    document.getElementById('export-loading').classList.remove('active');
}

/* ═══════════════════════════════════════════
   Helpers for Export
   ═══════════════════════════════════════════ */
function hexToArgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    return 'FF' + hex.toUpperCase();
}

function lightenHex(hex, factor = 0.85) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);
    return 'FF' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function priorityColor(priority) {
    switch (priority) {
        case 'critical': return { bg: 'FFFEE2E2', fg: 'FFDC2626' };
        case 'high': return { bg: 'FFFFFBEB', fg: 'FFD97706' };
        case 'medium': return { bg: 'FFEEF2FF', fg: 'FF6366F1' };
        case 'low': return { bg: 'FFF0FDF4', fg: 'FF16A34A' };
        default: return { bg: 'FFF5F5F5', fg: 'FF666666' };
    }
}

function progressBarText(pct) {
    const filled = Math.round(pct / 5);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${pct}%`;
}

/* ═══════════════════════════════════════════
   XLSX Export with ExcelJS
   ═══════════════════════════════════════════ */
async function exportXLSX(target) {
    document.querySelectorAll('.export-dropdown').forEach(dd => dd.classList.remove('open'));
    showExportLoading('Generando archivo Excel...', 'Descargando datos del servidor...');

    try {
        await new Promise(r => setTimeout(r, 500)); // Show loading briefly

        if (target === 'all') {
            window.location.href = `${API_BASE}/projects/export/all`;
        } else {
            if (!target) {
                alert('No se ha seleccionado ningún proyecto.');
                hideExportLoading();
                return;
            }
            window.location.href = `${API_BASE}/projects/${target}/export`;
        }

        // Hide loading after a delay since download doesn't trigger load event
        setTimeout(hideExportLoading, 2000);
    } catch (err) {
        console.error('Export error:', err);
        alert('❌ Error al exportar: ' + err.message);
        hideExportLoading();
    }
}

function buildSummarySheet(workbook) {
    const ws = workbook.addWorksheet('Resumen General', {
        properties: { tabColor: { argb: 'FF00FF9D' } }
    });

    // Column widths
    ws.columns = [
        { width: 5 },   // A: #
        { width: 30 },  // B: Nombre
        { width: 40 },  // C: Descripción
        { width: 12 },  // D: Actividades
        { width: 12 },  // E: Días Total
        { width: 14 },  // F: Progreso %
        { width: 28 },  // G: Barra de Progreso
        { width: 14 },  // H: Estado
    ];

    // ── Title ──
    ws.mergeCells('A1:H1');
    const titleCell = ws.getCell('A1');
    titleCell.value = '📊 LABORATORIO VIVO ITNN — Resumen de Proyectos';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 40;

    // ── KPIs Row ──
    ws.mergeCells('A2:H2');
    const kpiCell = ws.getCell('A2');
    kpiCell.value = `Avance Global: ${globalProgress()}%  |  Proyectos: ${projects.length}  |  Días Totales: ${globalTotalDays()}  |  Fecha: ${new Date().toLocaleDateString('es-MX')}`;
    kpiCell.font = { size: 10, italic: true, color: { argb: 'FF94A3B8' } };
    kpiCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    kpiCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 28;

    // ── Global Progress Bar Row ──
    ws.mergeCells('A3:H3');
    const globalBarCell = ws.getCell('A3');
    globalBarCell.value = progressBarText(globalProgress());
    globalBarCell.font = { size: 12, bold: true, color: { argb: 'FF10B981' }, name: 'Consolas' };
    globalBarCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    globalBarCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(3).height = 30;

    // Empty row
    ws.getRow(4).height = 10;

    // ── Headers ──
    const headers = ['#', 'Proyecto', 'Descripción', 'Actividades', 'Días', 'Progreso', 'Barra de Progreso', 'Estado'];
    const headerRow = ws.getRow(5);
    headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            bottom: { style: 'medium', color: { argb: 'FF00FF9D' } }
        };
    });
    headerRow.height = 28;

    // ── Data Rows ──
    (sortedProjects() || []).forEach((p, idx) => {
        const pct = projectProgress(p);
        const actCount = (p.activities || []).length;
        const td = totalDays(p);
        const row = ws.getRow(6 + idx);

        row.getCell(1).value = idx + 1;
        row.getCell(2).value = p.name;
        row.getCell(3).value = p.description || '';
        row.getCell(4).value = actCount;
        row.getCell(5).value = td;
        row.getCell(6).value = pct / 100; // as fraction for percentage format
        row.getCell(7).value = progressBarText(pct);
        row.getCell(8).value = pct >= 100 ? '✅ Completado' : (pct > 0 ? '🔄 En Progreso' : '⏳ Pendiente');

        // Style the progress bar cell
        row.getCell(7).font = { name: 'Consolas', size: 9, color: { argb: pct >= 100 ? 'FF10B981' : (pct > 60 ? 'FF00CCFF' : (pct > 30 ? 'FFF59E0B' : 'FFEF4444')) } };

        // Style the percentage cell
        row.getCell(6).numFmt = '0%';
        row.getCell(6).font = { bold: true, size: 11, color: { argb: hexToArgb(p.color || '#00ccff') } };

        // Project color indicator
        row.getCell(2).font = { bold: true, size: 10, color: { argb: hexToArgb(p.color || '#00ccff') } };
        row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightenHex(p.color || '#00ccff', 0.9) } };

        // Alternate row background
        const bgColor = idx % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF';
        for (let c = 1; c <= 8; c++) {
            if (c !== 2) {
                row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            }
            row.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(c).border = {
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
        }
        row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
        row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

        row.height = 30;
    });

    // Conditional formatting: data bar for progress column
    const lastDataRow = 5 + projects.length;
    ws.addConditionalFormatting({
        ref: `F6:F${lastDataRow}`,
        rules: [{
            type: 'dataBar',
            minLength: 0,
            maxLength: 100,
            gradient: true,
            border: false,
            negativeBarBorderColorSameAsPositive: true,
            axisPosition: 'none'
        }]
    });
}

function buildProjectSheet(workbook, proj, isStandalone = false) {
    const sheetName = sanitizeSheetName(proj.name);
    const ws = workbook.addWorksheet(sheetName, {
        properties: { tabColor: { argb: hexToArgb(proj.color || '#00ccff') } }
    });

    const pct = projectProgress(proj);
    const acts = [...(proj.activities || [])].sort((a, b) =>
        (PRIORITY_ORDER[a.priority || 'medium'] ?? 2) - (PRIORITY_ORDER[b.priority || 'medium'] ?? 2)
    );

    // Column widths
    ws.columns = [
        { width: 5 },   // A: #
        { width: 35 },  // B: Actividad
        { width: 12 },  // C: Prioridad
        { width: 10 },  // D: Días
        { width: 12 },  // E: Progreso %
        { width: 28 },  // F: Barra de Progreso
        { width: 14 },  // G: Estado
        { width: 14 },  // H: Inicio
        { width: 14 },  // I: Fin
        { width: 20 },  // J: Creado Por
        { width: 40 },  // K: Última Justificación
    ];

    const projColor = hexToArgb(proj.color || '#00ccff');
    const projColorLight = lightenHex(proj.color || '#00ccff', 0.9);

    // ── Project Title ──
    ws.mergeCells('A1:K1');
    const titleCell = ws.getCell('A1');
    titleCell.value = `${proj.name}`;
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: projColor } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 40;

    // ── Project Info ──
    ws.mergeCells('A2:K2');
    const infoCell = ws.getCell('A2');
    infoCell.value = `${proj.description || 'Sin descripción'}  |  Avance: ${pct}%  |  Días: ${totalDays(proj)}  |  Actividades: ${acts.length}`;
    infoCell.font = { size: 10, italic: true, color: { argb: 'FF64748B' } };
    infoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: projColorLight } };
    infoCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 26;

    // ── Progress Bar Row ──
    ws.mergeCells('A3:K3');
    const barCell = ws.getCell('A3');
    barCell.value = progressBarText(pct);
    barCell.font = { size: 14, bold: true, color: { argb: projColor }, name: 'Consolas' };
    barCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    barCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(3).height = 32;

    // Empty row
    ws.getRow(4).height = 8;

    // ── Headers ──
    const headers = ['#', 'Actividad', 'Prioridad', 'Días', 'Progreso', 'Barra de Progreso', 'Estado', 'Inicio', 'Fin', 'Creado Por', 'Justificación'];
    const headerRow = ws.getRow(5);
    headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h;
        cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            bottom: { style: 'medium', color: { argb: projColor } }
        };
    });
    headerRow.height = 28;

    // ── Activity Rows ──
    (acts || []).forEach((act, idx) => {
        const row = ws.getRow(6 + idx);
        const prio = act.priority || 'medium';
        const prioColors = priorityColor(prio);
        const actPct = act.progress || 0;
        const lastLog = (act.logs && act.logs.length > 0) ? act.logs[act.logs.length - 1] : null;
        const creatorName = act.creator ? act.creator.name : 'N/A';

        row.getCell(1).value = idx + 1;
        row.getCell(2).value = act.text;
        row.getCell(3).value = PRIORITY_LABELS[prio] || prio;
        row.getCell(4).value = act.days || 1;
        row.getCell(5).value = actPct / 100; // fraction for percentage
        row.getCell(6).value = progressBarText(actPct);
        row.getCell(7).value = actPct >= 100 ? '✅ Completado' : (actPct > 0 ? '🔄 En Progreso' : '⏳ Pendiente');
        row.getCell(8).value = (act.start_time || act.startTime || '—');
        row.getCell(9).value = (act.end_time || act.endTime || '—');
        row.getCell(10).value = creatorName;
        row.getCell(11).value = lastLog ? lastLog.justification : '';

        // Style priority cell
        row.getCell(3).font = { bold: true, size: 9, color: { argb: prioColors.fg } };
        row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: prioColors.bg } };

        // Style progress percentage
        row.getCell(5).numFmt = '0%';
        row.getCell(5).font = { bold: true, size: 11, color: { argb: actPct >= 100 ? 'FF10B981' : (actPct > 50 ? 'FF00CCFF' : (actPct > 0 ? 'FFF59E0B' : 'FFEF4444')) } };

        // Style progress bar text
        row.getCell(6).font = { name: 'Consolas', size: 9, color: { argb: actPct >= 100 ? 'FF10B981' : (actPct > 50 ? 'FF00CCFF' : (actPct > 0 ? 'FFF59E0B' : 'FFEF4444')) } };

        // Alternate row
        const bgColor = idx % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF';
        for (let c = 1; c <= 11; c++) {
            if (c !== 3) {
                row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
            }
            row.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(c).border = {
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
        }
        row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
        row.getCell(11).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

        // Strikethrough if completed
        if (actPct >= 100) {
            row.getCell(2).font = { size: 10, color: { argb: 'FF94A3B8' }, strike: true };
        }

        row.height = 30;
    });

    // Conditional formatting: data bar for progress column
    const lastRow = 5 + acts.length;
    if (acts.length > 0) {
        ws.addConditionalFormatting({
            ref: `E6:E${lastRow}`,
            rules: [{
                type: 'dataBar',
                minLength: 0,
                maxLength: 100,
                gradient: true,
                border: false,
                negativeBarBorderColorSameAsPositive: true,
                axisPosition: 'none'
            }]
        });
    }

    // ── Gantt-like Visual at the bottom ──
    const ganttStartRow = lastRow + 3;
    ws.mergeCells(`A${ganttStartRow}:K${ganttStartRow}`);
    const ganttTitle = ws.getCell(`A${ganttStartRow}`);
    ganttTitle.value = '📊 Diagrama Gantt Visual (Barra de Progreso por Actividad)';
    ganttTitle.font = { size: 12, bold: true, color: { argb: 'FF0F172A' } };
    ganttTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    ganttTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(ganttStartRow).height = 30;

    // Gantt header
    const maxDays = Math.max(...acts.map(a => parseInt(a.days) || 1), 1);
    const ganttHeaderRow = ws.getRow(ganttStartRow + 1);
    ganttHeaderRow.getCell(1).value = '#';
    ganttHeaderRow.getCell(2).value = 'Actividad';
    for (let d = 1; d <= Math.min(maxDays + 2, 30); d++) {
        ganttHeaderRow.getCell(2 + d).value = `D${d}`;
        ganttHeaderRow.getCell(2 + d).font = { size: 8, bold: true, color: { argb: 'FF94A3B8' } };
        ganttHeaderRow.getCell(2 + d).alignment = { horizontal: 'center' };
    }
    ganttHeaderRow.getCell(1).font = { bold: true, size: 9, color: { argb: 'FF64748B' } };
    ganttHeaderRow.getCell(2).font = { bold: true, size: 9, color: { argb: 'FF64748B' } };

    // Gantt bars
    acts.forEach((act, idx) => {
        const row = ws.getRow(ganttStartRow + 2 + idx);
        row.getCell(1).value = idx + 1;
        row.getCell(2).value = act.text;
        row.getCell(2).font = { size: 9 };
        row.getCell(2).alignment = { horizontal: 'left' };

        const days = parseInt(act.days) || 1;
        const actPct = act.progress || 0;
        const filledDays = Math.round(days * actPct / 100);

        for (let d = 1; d <= Math.min(days, 30); d++) {
            const cell = row.getCell(2 + d);
            if (d <= filledDays) {
                // Filled portion
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: projColor } };
                cell.value = '';
            } else {
                // Empty portion
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: projColorLight } };
                cell.value = '';
            }
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                left: d === 1 ? { style: 'thin', color: { argb: projColor } } : undefined,
                right: d === days ? { style: 'thin', color: { argb: projColor } } : undefined,
            };
        }

        // Progress label after bar
        const labelCell = row.getCell(2 + Math.min(days, 30) + 1);
        labelCell.value = `${actPct}%`;
        labelCell.font = { size: 8, bold: true, color: { argb: actPct >= 100 ? 'FF10B981' : projColor } };

        row.height = 22;
    });
}

/* ═══════════════════════════════════════════
   PDF Export with html2canvas + jsPDF
   ═══════════════════════════════════════════ */
async function exportPDF(target) {
    document.querySelectorAll('.export-dropdown').forEach(dd => dd.classList.remove('open'));
    showExportLoading('Generando archivo PDF...', 'Construyendo documento con gráficos');

    try {
        await new Promise(r => setTimeout(r, 100));

        const { jsPDF } = window.jspdf;

        if (target === 'all') {
            buildAllProjectsPDF(jsPDF);
        } else {
            const proj = projects.find(p => p.id == target);
            if (!proj) { hideExportLoading(); return; }
            buildSingleProjectPDF(jsPDF, proj);
        }
    } catch (err) {
        console.error('Export PDF error:', err);
        alert('❌ Error al generar el PDF: ' + err.message);
    }
    hideExportLoading();
}

/* ── PDF Color Helpers ── */
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    };
}

function pdfPriorityColor(prio) {
    switch (prio) {
        case 'critical': return { r: 220, g: 38, b: 38 };
        case 'high': return { r: 217, g: 119, b: 6 };
        case 'medium': return { r: 99, g: 102, b: 241 };
        case 'low': return { r: 22, g: 163, b: 74 };
        default: return { r: 100, g: 116, b: 139 };
    }
}

function pdfProgressColor(pct) {
    if (pct >= 100) return { r: 16, g: 185, b: 129 };
    if (pct > 60) return { r: 14, g: 165, b: 233 };
    if (pct > 30) return { r: 245, g: 158, b: 11 };
    return { r: 239, g: 68, b: 68 };
}

/* ── Draw a PDF page header ── */
function drawPDFHeader(pdf, title, subtitle, pageNum, totalPages) {
    const pw = pdf.internal.pageSize.getWidth();
    // Header bar
    pdf.setFillColor(241, 245, 249);
    pdf.rect(0, 0, pw, 20, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.line(0, 20, pw, 20);

    // Title
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(title, 10, 9);

    // Subtitle
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(subtitle || `Exportado: ${new Date().toLocaleString('es-MX')}`, 10, 15);

    // Page number
    if (totalPages) {
        pdf.text(`Pág. ${pageNum}/${totalPages}`, pw - 10, 9, { align: 'right' });
    }

    // Logo text
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(148, 163, 184);
    pdf.text('Laboratorio Vivo ITNN', pw - 10, 15, { align: 'right' });

    return 25; // content start Y
}

/* ── Draw a progress bar as filled rectangle ── */
function drawProgressBar(pdf, x, y, width, height, pct, color) {
    // Background
    pdf.setFillColor(226, 232, 240);
    pdf.roundedRect(x, y, width, height, 1, 1, 'F');
    // Fill
    if (pct > 0) {
        const fillW = Math.max((width * Math.min(pct, 100)) / 100, 2);
        pdf.setFillColor(color.r, color.g, color.b);
        pdf.roundedRect(x, y, fillW, height, 1, 1, 'F');
    }
    // Label
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text(`${pct}%`, x + width / 2, y + height / 2 + 1.5, { align: 'center' });
}

/* ── Draw a Gantt bar ── */
function drawGanttBar(pdf, x, y, totalWidth, days, pct, projColor, maxDays) {
    const barW = Math.max((totalWidth * days) / maxDays, 4);
    const filledW = (barW * Math.min(pct, 100)) / 100;

    // Background bar
    const lightColor = { r: Math.min(projColor.r + 180, 245), g: Math.min(projColor.g + 180, 245), b: Math.min(projColor.b + 180, 245) };
    pdf.setFillColor(lightColor.r, lightColor.g, lightColor.b);
    pdf.roundedRect(x, y, barW, 5, 1, 1, 'F');

    // Filled bar
    if (pct > 0) {
        pdf.setFillColor(projColor.r, projColor.g, projColor.b);
        pdf.roundedRect(x, y, Math.max(filledW, 2), 5, 1, 1, 'F');
    }

    // Label
    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text(`${days}d · ${pct}%`, x + barW + 2, y + 3.5);
}

/* ═══════════════════════════════════════════
   Build PDF for ALL projects
   ═══════════════════════════════════════════ */
function buildAllProjectsPDF(jsPDF) {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    let y = drawPDFHeader(pdf, 'Resumen General de Proyectos', `Avance Global: ${globalProgress()}%  |  Proyectos: ${projects.length}  |  Días: ${globalTotalDays()}`);

    // ── KPI Cards ──
    const kpiW = 55;
    const kpiH = 16;
    const kpiGap = 8;
    const kpiStartX = (pw - (4 * kpiW + 3 * kpiGap)) / 2;
    const kpis = [
        { label: 'Avance Global', value: `${globalProgress()}%`, color: { r: 16, g: 185, b: 129 } },
        { label: 'Proyectos', value: `${projects.length}`, color: { r: 14, g: 165, b: 233 } },
        { label: 'Tareas Pendientes', value: `${projects.reduce((s, p) => s + (p.activities || []).filter(a => (a.progress || 0) < 100).length, 0)}`, color: { r: 245, g: 158, b: 11 } },
        { label: 'Días Totales', value: `${globalTotalDays()}`, color: { r: 99, g: 102, b: 241 } },
    ];

    kpis.forEach((kpi, i) => {
        const kx = kpiStartX + i * (kpiW + kpiGap);
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(kx, y, kpiW, kpiH, 2, 2, 'FD');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        pdf.text(kpi.label, kx + kpiW / 2, y + 5, { align: 'center' });
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(kpi.color.r, kpi.color.g, kpi.color.b);
        pdf.text(kpi.value, kx + kpiW / 2, y + 13, { align: 'center' });
    });

    y += kpiH + 6;

    // ── Global Progress Bar ──
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('Progreso General', 10, y + 3);
    drawProgressBar(pdf, 55, y, pw - 65, 5, globalProgress(), { r: 16, g: 185, b: 129 });
    y += 10;

    // ── Projects Table ──
    const colX = [10, 15, 85, 110, 135, 160, pw - 10];
    const colHeaders = ['#', 'Proyecto', 'Actividades', 'Días', 'Progreso', 'Estado'];

    // Table header
    pdf.setFillColor(30, 41, 59);
    pdf.rect(10, y, pw - 20, 7, 'F');
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    colHeaders.forEach((h, i) => {
        pdf.text(h, colX[i] + (i === 0 ? 1 : 2), y + 5);
    });
    y += 7;

    // Table rows
    const sorted = sortedProjects();
    sorted.forEach((p, idx) => {
        if (y > ph - 20) {
            pdf.addPage();
            y = drawPDFHeader(pdf, 'Resumen General de Proyectos (cont.)', null);
        }

        const pct = projectProgress(p);
        const bgColor = idx % 2 === 0 ? { r: 248, g: 250, b: 252 } : { r: 255, g: 255, b: 255 };
        pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
        pdf.rect(10, y, pw - 20, 10, 'F');

        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30, 41, 59);
        pdf.text(`${idx + 1}`, colX[0] + 1, y + 6.5);

        // Project name with color dot
        const pc = hexToRgb(p.color || '#00ccff');
        pdf.setFillColor(pc.r, pc.g, pc.b);
        pdf.circle(colX[1] + 2, y + 5, 1.5, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 41, 59);
        pdf.text(p.name.substring(0, 35), colX[1] + 6, y + 6.5);

        pdf.setFont('helvetica', 'normal');
        pdf.text(`${(p.activities || []).length}`, colX[2] + 2, y + 6.5);
        pdf.text(`${totalDays(p)}`, colX[3] + 2, y + 6.5);

        // Progress bar in cell
        drawProgressBar(pdf, colX[4], y + 2, 22, 4.5, pct, pdfProgressColor(pct));

        // Status
        pdf.setFontSize(6);
        pdf.text(pct >= 100 ? 'Completado' : (pct > 0 ? 'En Progreso' : 'Pendiente'), colX[5] + 2, y + 6.5);

        y += 10;
    });

    // ── Gantt Chart Section ──
    y += 6;
    if (y > ph - 45) {
        pdf.addPage();
        y = drawPDFHeader(pdf, 'Diagrama Gantt — Todos los Proyectos', null);
    }

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('Diagrama Gantt por Proyecto', 10, y);
    y += 5;

    const maxDays = Math.max(...sorted.map(p => totalDays(p)), 1);
    const ganttLabelW = 70;
    const ganttBarArea = pw - ganttLabelW - 20;

    sorted.forEach((p, idx) => {
        if (y > ph - 15) {
            pdf.addPage();
            y = drawPDFHeader(pdf, 'Diagrama Gantt (cont.)', null);
        }

        const pct = projectProgress(p);
        const pc = hexToRgb(p.color || '#00ccff');

        // Label
        pdf.setFillColor(pc.r, pc.g, pc.b);
        pdf.circle(12, y + 2.5, 1.5, 'F');
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 41, 59);
        pdf.text(p.name.substring(0, 30), 16, y + 3.5);

        // Gantt bar
        drawGanttBar(pdf, ganttLabelW, y, ganttBarArea, totalDays(p), pct, pc, maxDays);

        y += 8;
    });

    // Footer
    pdf.setFontSize(6);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Generado por Laboratorio Vivo ITNN Dashboard', pw / 2, ph - 4, { align: 'center' });

    pdf.save(`Todos_Proyectos_${formatDateFile()}.pdf`);
}

/* ═══════════════════════════════════════════
   Build PDF for SINGLE project
   ═══════════════════════════════════════════ */
function buildSingleProjectPDF(jsPDF, proj) {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const pct = projectProgress(proj);
    const pc = hexToRgb(proj.color || '#00ccff');

    let y = drawPDFHeader(pdf, proj.name, proj.description || 'Sin descripción');

    // ── Project Summary Bar ──
    pdf.setFillColor(pc.r, pc.g, pc.b);
    pdf.roundedRect(10, y, pw - 20, 14, 2, 2, 'F');
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text(proj.name, 16, y + 6);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Avance: ${pct}%  |  Días: ${totalDays(proj)}  |  Actividades: ${(proj.activities || []).length}`, 16, y + 11);

    // Progress bar inside the colored banner
    // Progress bar inside the colored banner
    const barX = pw - 80;
    // Track (Light Grey)
    pdf.setFillColor(200, 200, 200);
    pdf.roundedRect(barX, y + 4, 60, 5, 1, 1, 'F');
    const filledW = (60 * Math.min(pct, 100)) / 100;
    // Fill (White)
    if (filledW > 0) {
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(barX, y + 4, Math.max(filledW, 2), 5, 1, 1, 'F');
    }
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(pc.r, pc.g, pc.b);
    pdf.text(`${pct}%`, barX + 30, y + 8, { align: 'center' });

    y += 20;

    // ── Activities Table ──
    const acts = [...(proj.activities || [])].sort((a, b) =>
        (PRIORITY_ORDER[a.priority || 'medium'] ?? 2) - (PRIORITY_ORDER[b.priority || 'medium'] ?? 2)
    );

    const tColX = [10, 15, 95, 118, 138, 160, 185, 210, pw - 10];
    const tHeaders = ['#', 'Actividad', 'Prioridad', 'Días', 'Progreso', 'Estado', 'Inicio', 'Fin'];

    // Table header
    pdf.setFillColor(30, 41, 59);
    pdf.rect(10, y, pw - 20, 7, 'F');
    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    tHeaders.forEach((h, i) => {
        pdf.text(h, tColX[i] + (i === 0 ? 1 : 2), y + 5);
    });
    y += 7;

    // Activity rows
    acts.forEach((act, idx) => {
        if (y > ph - 25) {
            pdf.addPage();
            y = drawPDFHeader(pdf, `${proj.name} — Actividades (cont.)`, null);
        }

        const actPct = act.progress || 0;
        const prio = act.priority || 'medium';
        const prioC = pdfPriorityColor(prio);
        const bgColor = idx % 2 === 0 ? { r: 248, g: 250, b: 252 } : { r: 255, g: 255, b: 255 };

        pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
        pdf.rect(10, y, pw - 20, 10, 'F');

        pdf.setFontSize(6.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30, 41, 59);

        // #
        pdf.text(`${idx + 1}`, tColX[0] + 1, y + 6.5);

        // Activity name
        pdf.setFont('helvetica', actPct >= 100 ? 'normal' : 'bold');
        if (actPct >= 100) pdf.setTextColor(148, 163, 184);
        else pdf.setTextColor(30, 41, 59);
        pdf.text(act.text.substring(0, 40), tColX[1] + 2, y + 6.5);

        // Priority badge
        pdf.setFillColor(prioC.r, prioC.g, prioC.b);
        pdf.roundedRect(tColX[2] + 1, y + 2.5, 18, 4.5, 1, 1, 'F');
        pdf.setFontSize(5.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 255, 255);
        pdf.text(PRIORITY_LABELS[prio] || prio, tColX[2] + 10, y + 5.5, { align: 'center' });

        // Days
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30, 41, 59);
        pdf.setFontSize(6.5);
        pdf.text(`${act.days || 1}`, tColX[3] + 2, y + 6.5);

        // Progress bar
        drawProgressBar(pdf, tColX[4] + 1, y + 2.5, 18, 4.5, actPct, pdfProgressColor(actPct));

        // Status
        pdf.setFontSize(5.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30, 41, 59);
        const statusText = actPct >= 100 ? 'Completado' : (actPct > 0 ? 'En Progreso' : 'Pendiente');
        pdf.text(statusText, tColX[5] + 2, y + 6.5);

        // Start / End times
        pdf.setFontSize(6);
        pdf.text(act.start_time || act.startTime || '—', tColX[6] + 2, y + 6.5);
        pdf.text(act.end_time || act.endTime || '—', tColX[7] + 2, y + 6.5);

        y += 10;
    });

    // ── Gantt Diagram ──
    y += 8;
    if (y > ph - 40) {
        pdf.addPage();
        y = drawPDFHeader(pdf, `${proj.name} — Diagrama Gantt`, null);
    }

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('Diagrama Gantt de Actividades', 10, y);
    y += 3;

    // Separator line
    pdf.setDrawColor(226, 232, 240);
    pdf.line(10, y, pw - 10, y);
    y += 4;

    const maxDays = Math.max(...acts.map(a => parseInt(a.days) || 1), 1);
    const ganttLabelW = 80;
    const ganttBarArea = pw - ganttLabelW - 25;

    // Day axis header
    pdf.setFontSize(5);
    pdf.setTextColor(148, 163, 184);
    const dayStep = maxDays > 20 ? 5 : (maxDays > 10 ? 2 : 1);
    for (let d = dayStep; d <= maxDays; d += dayStep) {
        const dx = ganttLabelW + (ganttBarArea * d / maxDays);
        pdf.text(`${d}`, dx, y, { align: 'center' });
        // Grid line
        pdf.setDrawColor(240, 240, 240);
        pdf.line(dx, y + 1, dx, y + 1 + acts.length * 8);
    }
    y += 3;

    acts.forEach((act, idx) => {
        if (y > ph - 12) {
            pdf.addPage();
            y = drawPDFHeader(pdf, `${proj.name} — Gantt (cont.)`, null);
            y += 2;
        }

        const actPct = act.progress || 0;

        // Label
        pdf.setFontSize(6);
        pdf.setFont('helvetica', actPct >= 100 ? 'normal' : 'bold');
        pdf.setTextColor(actPct >= 100 ? 148 : 30, actPct >= 100 ? 163 : 41, actPct >= 100 ? 184 : 59);
        pdf.text(`${idx + 1}. ${act.text.substring(0, 35)}`, 12, y + 3.5);

        // Gantt bar
        drawGanttBar(pdf, ganttLabelW, y, ganttBarArea, parseInt(act.days) || 1, actPct, pc, maxDays);

        y += 8;
    });

    // Footer
    pdf.setFontSize(6);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Generado por Laboratorio Vivo ITNN Dashboard', pw / 2, ph - 4, { align: 'center' });

    pdf.save(`Proyecto_${sanitizeFilename(proj.name)}_${formatDateFile()}.pdf`);
}

/* ═══════════════════════════════════════════
   Export Utility Functions
   ═══════════════════════════════════════════ */
function downloadBuffer(buffer, filename) {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s_-]/g, '').replace(/\s+/g, '_').substring(0, 50);
}

function sanitizeSheetName(name) {
    return name.replace(/[\\/*?:\[\]]/g, '').substring(0, 31);
}

function formatDateFile() {
    return new Date().toISOString().split('T')[0];
}

// Legacy compatibility
function exportToExcel(projectId) {
    exportXLSX(projectId);
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadData();
});
