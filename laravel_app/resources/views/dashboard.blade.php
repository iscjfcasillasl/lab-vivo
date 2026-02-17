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
</head>
<body>
    <div class="app-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="logo-area">
                <i class="ri-plant-line logo-icon"></i>
                <h1>Laboratorio<br><span>Vivo ITNN</span></h1>
            </div>
            <nav class="nav-menu" id="project-nav">
                <a href="#" class="nav-item active" data-project="all" onclick="selectProject('all', this)">
                    <i class="ri-dashboard-line"></i> Vista Global
                </a>
            </nav>
            <div class="sidebar-footer">
                <button class="btn-add" onclick="openModal()" style="margin-bottom:.5rem; width:100%; border-radius:12px; background:var(--primary-gradient); color:white; border:none; padding:12px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px">
                    <i class="ri-add-circle-line"></i> Nuevo Proyecto
                </button>
                <a href="{{ route('logout') }}" class="btn-reset" style="text-decoration:none; text-align:center; display:block">
                    <i class="ri-logout-box-line"></i> Cerrar Sesión
                </a>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="top-bar">
                <div class="breadcrumbs">
                    <span>Proyectos</span> <i class="ri-arrow-right-s-line"></i> <span class="current" id="view-title">Vista Global</span>
                </div>
                <div class="kpi-bar">
                    <div class="kpi-pill">
                        <i class="ri-checkbox-circle-line"></i> <span id="kpi-progress">0%</span> completado
                    </div>
                    <div class="kpi-pill">
                        <i class="ri-list-check"></i> <span id="kpi-pending-tasks">0</span> pendientes
                    </div>
                    <div class="kpi-pill">
                        <i class="ri-folder-info-line"></i> <span id="kpi-total-projects">0</span> proyectos
                    </div>
                    <div class="kpi-pill">
                        <i class="ri-time-line"></i> <span id="kpi-total-days">0</span> días totales
                    </div>
                    <button class="btn-add-sm" onclick="openModal()" title="Nuevo Proyecto" style="background:var(--primary); color:white; border:none; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s">
                        <i class="ri-add-line"></i>
                    </button>
                </div>
            </header>

            <!-- Global Gantt View -->
            <div id="view-global">
                <section class="card gantt-section">
                    <div class="section-header">
                        <h2><i class="ri-bar-chart-horizontal-line"></i> Cronograma por Proyecto</h2>
                        <p class="subtitle">Haz clic en un proyecto para ver sus actividades</p>
                    </div>
                    <div class="gantt-wrapper" id="gantt-global"></div>
                </section>
            </div>

            <!-- Project Detail View -->
            <div id="view-detail" style="display:none">
                <div class="detail-header-card card" id="detail-header"></div>
                <section class="card gantt-section" style="margin-top:1.5rem">
                    <div class="section-header">
                        <h2><i class="ri-list-check-2"></i> Actividades del Proyecto</h2>
                        <p class="subtitle">Haz clic en una actividad para editar su progreso y horario</p>
                    </div>
                    <div class="gantt-wrapper" id="gantt-detail"></div>
                </section>

            </div>
        </main>
    </div>

    <!-- Modal: Nuevo Proyecto -->
    <!-- Modal: Editar Actividad Individual -->
    <div class="modal-overlay" id="activity-modal-overlay" onclick="closeActivityModal()">
        <div class="modal" style="width:500px" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h2><i class="ri-edit-box-line"></i> Editar Actividad</h2>
                <button class="modal-close" onclick="closeActivityModal()"><i class="ri-close-line"></i></button>
            </div>
            <div class="modal-body">
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
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closeActivityModal()">Cancelar</button>
                <button class="btn-save" onclick="saveActivityEdit()"><i class="ri-save-line"></i> Guardar Actividad</button>
            </div>
        </div>
    </div>
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
                    <!-- Removed Project Priority Selector -->
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
        const API_PROJECTS_URL = "{{ url('/api/projects') }}";
    </script>
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
