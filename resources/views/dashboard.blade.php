<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Laboratorio Vivo ITNN | Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}?v={{ time() }}">
</head>
<body>
    <script>
        (function() {
            const savedTheme = localStorage.getItem('theme') || 'system';
            let activeMode = savedTheme;
            if (savedTheme === 'system') {
                activeMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            document.documentElement.setAttribute('data-theme', activeMode);
        })();
    </script>
    <div class="app-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="logo-area">
                <i class="ri-plant-line logo-icon"></i>
                <h1>Laboratorio<br><span>Vivo ITNN</span></h1>
            </div>
            <nav class="nav-menu" id="project-nav">
                <div class="nav-item active" data-project="all" onclick="selectProject('all', this)" style="cursor:pointer">
                    <i class="ri-dashboard-line"></i> Vista Global
                </div>
                @if($isSuperAdmin)
                <div class="nav-item" data-project="users" onclick="showUserManagement(this)" style="cursor:pointer">
                    <i class="ri-group-line"></i> Gestión de Usuarios
                </div>
                @endif
            </nav>

            <div class="sidebar-footer">
                <button class="btn-add" onclick="openModal()">
                    <i class="ri-add-circle-line"></i> Nuevo Proyecto
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <div style="display:none" id="view-title"></div>
            <header class="top-bar">
                <div class="kpi-bar">
                    <div class="kpi-pill">
                        <i class="ri-checkbox-circle-line"></i> 
                        <label>Avance:</label>
                        <span id="kpi-progress">0%</span>
                    </div>
                    <div class="kpi-pill">
                        <i class="ri-list-check"></i> 
                        <label>Tareas:</label>
                        <span id="kpi-pending-tasks">0</span>
                    </div>
                    <div class="kpi-pill">
                        <i class="ri-folder-info-line"></i> 
                        <label>Proyectos:</label>
                        <span id="kpi-total-projects">0</span>
                    </div>
                    <div class="kpi-pill">
                        <i class="ri-time-line"></i> 
                        <label>Días:</label>
                        <span id="kpi-total-days">0</span>
                    </div>
                </div>

                <div class="profile-action" onclick="toggleProfileDropdown(event)">
                    @if(Auth::user()->avatar)
                        <img src="{{ Auth::user()->avatar }}" style="width:32px;height:32px;border-radius:10px;object-fit:cover" alt="avatar">
                    @else
                        <div style="width:32px;height:32px;border-radius:10px;background:var(--bg-dark);display:flex;align-items:center;justify-content:center">
                            <i class="ri-user-line"></i>
                        </div>
                    @endif
                    <div style="text-align: left; line-height: 1.2;">
                        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">{{ Auth::user()->name }}</div>
                        <div style="font-size: 0.65rem; color: var(--text-muted);">{{ $isSuperAdmin ? 'Administrador' : 'Usuario' }}</div>
                    </div>
                    <i class="ri-arrow-down-s-line" style="font-size: 1.1rem; color: var(--text-muted);"></i>

                        <!-- Dropdown Menu -->
                        <div class="profile-dropdown" id="profile-dropdown">
                            <div class="profile-header">
                                <div style="font-size: 0.85rem; font-weight: 700;">{{ Auth::user()->name }}</div>
                                <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 4px;">{{ Auth::user()->email }}</div>
                                @if($isSuperAdmin)
                                    <span style="background:var(--primary);color:white;font-size:0.6rem;padding:2px 8px;border-radius:20px;font-weight:700">SUPERADMIN</span>
                                @endif
                            </div>

                            <div style="font-size: 0.65rem; font-weight: 800; color: var(--text-muted); padding: 5px 12px; text-transform: uppercase; letter-spacing: 1px;">Apariencia</div>
                            <div class="theme-pill-selector">
                                <button onclick="setTheme('light')" class="theme-pill" id="theme-light">
                                    <i class="ri-sun-line"></i>
                                </button>
                                <button onclick="setTheme('dark')" class="theme-pill" id="theme-dark">
                                    <i class="ri-moon-line"></i>
                                </button>
                                <button onclick="setTheme('system')" class="theme-pill" id="theme-system">
                                    <i class="ri-computer-line"></i>
                                </button>
                            </div>

                            <div style="height: 1px; background: var(--border); margin: 8px 0;"></div>

                            <div onclick="event.preventDefault(); document.getElementById('logout-form').submit();" class="profile-item" style="color: #ef4444; cursor:pointer">
                                <span>Cerrar Sesión</span>
                                <i class="ri-logout-box-r-line"></i>
                            </div>
                            <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                                @csrf
                            </form>
                        </div>
                    </div>
            </header>

            <!-- Global Gantt View -->
            <div id="view-global" style="margin-top: 1.5rem;">
                <section class="card gantt-section">
                    <div class="section-header">
                        <h2><i class="ri-bar-chart-horizontal-line"></i> Cronograma por Proyecto</h2>
                        <p class="subtitle">Haz clic en un proyecto para ver sus actividades</p>
                    </div>
                    <div class="gantt-wrapper" id="gantt-global"></div>
                </section>
            </div>

            <!-- Project Detail View -->
            <div id="view-detail" style="display:none; margin-top: 1.5rem;">
                <div class="detail-header-card card" id="detail-header"></div>
                <section class="card gantt-section" style="margin-top:1.5rem">
                    <div class="section-header">
                        <h2><i class="ri-list-check-2"></i> Actividades del Proyecto</h2>
                        <p class="subtitle">Haz clic en una actividad para editar su progreso y horario</p>
                    </div>
                    <div class="gantt-wrapper" id="gantt-detail"></div>
                </section>

                <!-- Activity Logs Section -->
                <section class="card" style="margin-top:1.5rem" id="logs-section">
                    <div class="section-header">
                        <h2><i class="ri-history-line"></i> Historial de Cambios</h2>
                        <p class="subtitle">Registro acumulativo de justificaciones y avances del proyecto</p>
                    </div>
                    <div id="activity-logs-container" style="max-height:400px;overflow-y:auto;padding:1rem"></div>
                </section>
            </div>

            <!-- User Management View -->
            <div id="view-users" style="display:none; margin-top: 1.5rem;">
                <section class="card">
                    <div class="section-header">
                        <h2><i class="ri-group-line"></i> Gestión de Usuarios</h2>
                        <p class="subtitle">Aprueba o rechaza solicitudes de acceso a la plataforma</p>
                    </div>
                    <div class="table-responsive" style="margin-top:1.5rem">
                        <table class="gantt-table" style="width:100%">
                            <thead>
                                <tr>
                                    <th style="text-align:left">Usuario</th>
                                    <th>Email</th>
                                    <th>Registro</th>
                                    <th>Estado</th>
                                    <th>Rol</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="users-table-body">
                                <!-- Users will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    </div>

    <!-- Modal: Editar Actividad Individual -->
    <div class="modal-overlay" id="activity-modal-overlay" onclick="closeActivityModal()">
        <div class="modal" style="width:560px" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h2><i class="ri-edit-box-line"></i> Editar Actividad</h2>
                <button class="modal-close" onclick="closeActivityModal()"><i class="ri-close-line"></i></button>
            </div>
            <div class="modal-body">
                <div id="act-owner-info" style="margin-bottom:12px;padding:8px 12px;border-radius:8px;background:rgba(255,255,255,0.03);font-size:0.75rem;display:flex;align-items:center;gap:8px">
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex:2">
                        <label>Nombre de la Actividad</label>
                        <input type="text" id="act-edit-name" readonly style="opacity:0.7">
                    </div>
                    <div class="form-group" style="flex:1">
                        <label>Días (Duración)</label>
                        <input type="number" id="act-edit-days" min="1" class="form-control" style="width:100%; padding:10px; background:var(--bg-dark); color:white; border:1px solid var(--border); border-radius:8px">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Hora Inicio</label>
                        <input type="time" id="act-edit-start">
                    </div>
                    <div class="form-group">
                        <label>Hora Fin</label>
                        <input type="time" id="act-edit-end">
                    </div>
                </div>
                <div class="form-group">
                    <label>Progreso: <span id="act-edit-progress-val">0</span>%</label>
                    <input type="range" id="act-edit-progress" min="0" max="100" step="5" style="width:100%" 
                        oninput="
                            document.getElementById('act-edit-progress-val').innerText = this.value;
                            const statusEl = document.getElementById('act-edit-status');
                            if (this.value >= 100) statusEl.value = 'done';
                            else if (this.value > 0) statusEl.value = 'progress';
                            else statusEl.value = 'pending';
                        ">
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select id="act-edit-status" class="form-control" style="width:100%; padding:10px; background:var(--bg-dark); color:white; border:1px solid var(--border); border-radius:8px"
                        onchange="
                            const progEl = document.getElementById('act-edit-progress');
                            const valEl = document.getElementById('act-edit-progress-val');
                            if (this.value === 'done') { progEl.value = 100; valEl.innerText = 100; }
                            else if (this.value === 'pending') { progEl.value = 0; valEl.innerText = 0; }
                            else if (this.value === 'progress' && progEl.value == 0) { progEl.value = 10; valEl.innerText = 10; }
                        ">
                        <option value="pending">Pendiente</option>
                        <option value="progress">En Progreso</option>
                        <option value="done">Completada</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Prioridad</label>
                    <select id="act-edit-priority" class="form-control" style="width:100%; padding:10px; background:var(--bg-dark); color:white; border:1px solid var(--border); border-radius:8px">
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="critical">Crítica</option>
                    </select>
                </div>
                <div class="form-group">
                    <label style="color:var(--warning)"><i class="ri-file-text-line"></i> Justificación del cambio <span style="color:var(--danger);font-size:0.7rem">(obligatorio)</span></label>
                    <textarea id="act-edit-justification" rows="3" placeholder="Describe el avance realizado o la razón del cambio..." style="width:100%; padding:10px; background:var(--bg-dark); color:white; border:1px solid var(--border); border-radius:8px; resize:vertical; font-family:inherit; font-size:0.85rem"></textarea>
                </div>

                <!-- Mini log inside modal -->
                <div class="form-group" id="act-modal-logs-section" style="display:none">
                    <label><i class="ri-history-line"></i> Historial Reciente</label>
                    <div id="act-modal-logs" style="max-height:200px;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:8px;padding:8px"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeActivityModal()">Cancelar</button>
                <button id="act-delete-btn" class="btn-cancel" style="background:var(--danger);color:white;display:none" onclick="deleteActivityFromModal()"><i class="ri-delete-bin-line"></i> Eliminar</button>
                <button class="btn-save" onclick="saveActivityEdit()"><i class="ri-save-line"></i> Guardar Actividad</button>
            </div>
        </div>
    </div>

    <!-- Modal: Nuevo Proyecto -->
    <div class="modal-overlay" id="modal-overlay" onclick="closeModal()">
        <div class="modal" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h2 id="modal-title"><i class="ri-add-circle-line"></i> Nuevo Proyecto</h2>
                <button class="modal-close" onclick="closeModal()"><i class="ri-close-line"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group flex-1">
                        <label>Nombre del Proyecto</label>
                        <input type="text" id="inp-name" placeholder="Ej: Sistema de Riego">
                    </div>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea id="inp-desc" rows="2" placeholder="Breve descripción del proyecto..."></textarea>
                </div>
                <div class="form-group" style="width: 100%">
                    <label>Color del Proyecto</label>
                    <div class="picker-container">
                        <div class="color-list" id="color-picker">
                            <script>
                                const colorPresets = [
                                    {hex: '#00ccff', name: 'Cyan'}, {hex: '#10b981', name: 'Esmeralda'},
                                    {hex: '#f59e0b', name: 'Ambar'}, {hex: '#a855f7', name: 'Violeta'},
                                    {hex: '#ec4899', name: 'Rosa'}, {hex: '#6366f1', name: 'Indigo'},
                                    {hex: '#ef4444', name: 'Rojo'}, {hex: '#14b8a6', name: 'Turquesa'},
                                    {hex: '#f97316', name: 'Naranja'}, {hex: '#8b5cf6', name: 'Purpura'}
                                ];
                                document.write(colorPresets.map(c => `
                                    <div class="color-item" onclick="setColor(this)" data-color="${c.hex}">
                                        <div class="color-dot-lg" style="background:${c.hex}"></div>
                                        <span>${c.name}</span>
                                    </div>
                                `).join(''));
                            </script>
                            <div class="color-item custom-color-btn" onclick="openCustomColor(this)">
                                <input type="color" id="custom-color" class="custom-color-input" style="display:none" oninput="setCustomColor(this.value)">
                                <div class="color-dot-lg" style="background:conic-gradient(red, yellow, lime, aqua, blue, magenta, red); border:2px dashed rgba(255,255,255,0.3)"></div>
                                <span>Custom</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Icono del Proyecto</label>
                    <div class="icon-select-container">
                        <div class="icon-select-trigger" id="icon-select-trigger" onclick="toggleIconDropdown(event)">
                            <i id="selected-icon-img" class="ri-flask-line"></i>
                            <span id="selected-icon-name">Ciencia</span>
                            <i class="ri-arrow-down-s-line"></i>
                        </div>
                        <div class="icon-dropdown" id="icon-dropdown">
                            <script>
                                const availableIcons = [
                                    {id: 'ri-flask-line', name: 'Ciencia'}, {id: 'ri-plant-line', name: 'Botánica'},
                                    {id: 'ri-shield-line', name: 'Seguridad'}, {id: 'ri-seedling-line', name: 'Cultivo'},
                                    {id: 'ri-database-2-line', name: 'Datos'}, {id: 'ri-server-line', name: 'Servidor'},
                                    {id: 'ri-robot-line', name: 'IA'}, {id: 'ri-code-s-slash-line', name: 'Código'},
                                    {id: 'ri-leaf-line', name: 'Ecología'}, {id: 'ri-tools-line', name: 'Taller'},
                                    {id: 'ri-lightbulb-line', name: 'Innovación'}, {id: 'ri-rocket-line', name: 'Proyecto'},
                                    {id: 'ri-water-flash-line', name: 'Hidráulica'}, {id: 'ri-sun-line', name: 'Energía'},
                                    {id: 'ri-microscope-line', name: 'Laboratorio'}, {id: 'ri-radar-line', name: 'Monitoreo'}
                                ];
                                document.write(availableIcons.map(i => `
                                    <div class="icon-dropdown-item" onclick="setIcon('${i.id}', '${i.name}', this)">
                                        <i class="${i.id}"></i>
                                        <span>${i.name}</span>
                                    </div>
                                `).join(''));
                            </script>
                        </div>
                    </div>
                    <input type="hidden" id="inp-icon" value="ri-flask-line">
                </div>
                <div class="form-group">
                    <label>Actividades <span class="label-hint">(nombre, prioridad, días, horario)</span></label>
                    <div class="act-header-row">
                        <span class="col-name">Actividad</span>
                        <span class="col-prio">Prio</span>
                        <span class="col-days">Días</span>
                        <span class="col-time">Avance %</span>
                        <span class="col-time">Inicio</span>
                        <span class="col-time">Fin</span>
                        <span class="col-del"></span>
                    </div>
                    <div id="activities-list"></div>
                    <button type="button" class="btn-add-activity" onclick="addActivityRow()"><i class="ri-add-line"></i> Agregar Actividad</button>
                </div>

            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
                <button class="btn-save" id="modal-save-btn" onclick="saveProject()"><i class="ri-save-line"></i> Crear Proyecto</button>
            </div>
        </div>
    </div>

    <script>
        // Current user info injected from Laravel
        const CURRENT_USER = {
            id: {{ Auth::id() }},
            email: "{{ Auth::user()->email }}",
            name: "{{ Auth::user()->name }}",
            isSuperAdmin: {{ $isSuperAdmin ? 'true' : 'false' }}
        };
        const API_BASE = "{{ url('/api') }}";
        const API_PROJECTS_URL = API_BASE + "/projects";
    </script>
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
