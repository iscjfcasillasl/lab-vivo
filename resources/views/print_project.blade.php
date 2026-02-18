<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proyecto: {{ $project->name }}</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    <style>
        :root {
            --primary: {{ $project->color }};
            --text-main: #1f2937;
            --text-muted: #6b7280;
            --border: #e5e7eb;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: 'Outfit', sans-serif;
            color: var(--text-main);
            background: #fff;
            line-height: 1.5;
            padding: 40px;
            max-width: 1000px;
            margin: 0 auto;
        }

        .header {
            margin-bottom: 2rem;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 1rem;
        }

        .header h1 {
            font-size: 2rem;
            color: var(--primary);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .header p {
            font-size: 1rem;
            color: var(--text-muted);
        }

        .meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
            background: #f9fafb;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid var(--border);
        }

        .meta-item label {
            display: block;
            font-size: 0.75rem;
            text-transform: uppercase;
            color: var(--text-muted);
            font-weight: 700;
            margin-bottom: 2px;
        }

        .meta-item span {
            font-size: 1rem;
            font-weight: 500;
        }

        .phase-section {
            margin-bottom: 2rem;
            page-break-inside: avoid;
        }

        .phase-header {
            background: #f3f4f6;
            padding: 0.75rem 1rem;
            border-left: 4px solid var(--primary);
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .phase-title {
            font-weight: 700;
            font-size: 1.1rem;
        }

        .phase-desc {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-top: 2px;
            font-weight: 400;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }

        th {
            text-align: left;
            padding: 8px 12px;
            background: #fff;
            border-bottom: 2px solid var(--border);
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            font-size: 0.75rem;
        }

        td {
            padding: 10px 12px;
            border-bottom: 1px solid var(--border);
            vertical-align: top;
        }
        
        tr:last-child td { border-bottom: none; }

        .priority-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.65rem;
            font-weight: 700;
            text-transform: uppercase;
            background: #eee;
            color: #555;
        }
        .priority-critical { background: #fee2e2; color: #ef4444; }
        .priority-high { background: #fef3c7; color: #f59e0b; }
        .priority-medium { background: #e0e7ff; color: #6366f1; }
        .priority-low { background: #f3f4f6; color: #6b7280; }

        .progress-bar {
            background: #e5e7eb;
            height: 6px;
            border-radius: 3px;
            width: 60px;
            display: inline-block;
            vertical-align: middle;
            margin-right: 6px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: var(--primary);
        }

        .print-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--primary);
            color: #fff;
            border: none;
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 8px;
            transition: 0.2s;
            z-index: 1000;
        }

        .print-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }

        @media print {
            .print-btn { display: none; }
            body { padding: 0; max-width: none; }
            .phase-section { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()"><i class="ri-printer-line"></i> Imprimir / Guardar PDF</button>

    <div class="header">
        <h1><i class="{{ $project->icon }}"></i> {{ $project->name }}</h1>
        <p>{{ $project->description }}</p>
    </div>

    <div class="meta-grid">
        <div class="meta-item">
            <label>Estado General</label>
            <span>
                <?php 
                    $totalActs = $project->activities->count();
                    $doneActs = $project->activities->where('progress', '>=', 100)->count();
                    echo $totalActs > 0 ? round(($doneActs / $totalActs) * 100) . '%' : '0%';
                ?> Completado
            </span>
        </div>
        <div class="meta-item">
            <label>Total Actividades</label>
            <span>{{ $totalActs }}</span>
        </div>
        <div class="meta-item">
            <label>Horas / Días Estimados</label>
            <span>{{ $project->activities->sum('days') }} días</span>
        </div>
        <div class="meta-item">
            <label>Generado el</label>
            <span>{{ date('d-m-Y H:i') }}</span>
        </div>
    </div>

    @foreach($project->phases as $phase)
        <div class="phase-section">
            <div class="phase-header">
                <div>
                    <div class="phase-title">{{ $phase->name }}</div>
                    @if($phase->description)
                        <div class="phase-desc">{{ $phase->description }}</div>
                    @endif
                </div>
                <div style="font-size:0.8rem; font-weight:600; opacity:0.7">
                    {{ $phase->activities->count() }} Actividades
                </div>
            </div>

            @if($phase->activities->count() > 0)
                <table>
                    <thead>
                        <tr>
                            <th style="width:40%">Actividad</th>
                            <th style="width:15%">Prioridad</th>
                            <th style="width:15%">Duración</th>
                            <th style="width:20%">Avance</th>
                            <th style="width:10%">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($phase->activities as $act)
                            <tr>
                                <td>
                                    <div style="font-weight:500">{{ $act->text }}</div>
                                    @if($act->description)
                                        <div style="font-size:0.8rem; color:#666; margin-top:2px">{{ $act->description }}</div>
                                    @endif
                                    @if($act->achievements)
                                        <div style="font-size:0.75rem; color:{{ $project->color }}; margin-top:4px; font-style:italic">
                                            <i class="ri-trophy-line"></i> {{ Str::limit($act->achievements, 80) }}
                                        </div>
                                    @endif
                                </td>
                                <td>
                                    <span class="priority-badge priority-{{ $act->priority }}">
                                        {{ ucfirst($act->priority) }}
                                    </span>
                                </td>
                                <td>
                                    {{ $act->days }} días
                                    @if($act->start_time)
                                        <div style="font-size:0.7rem; color:#888">{{ substr($act->start_time, 0, 5) }} - {{ substr($act->end_time, 0, 5) }}</div>
                                    @endif
                                </td>
                                <td>
                                    <div class="progress-bar">
                                        @php
                                            $prioColor = match($act->priority) {
                                                'critical' => '#ef4444',
                                                'high' => '#f59e0b',
                                                'medium' => $project->color, // Use project theme for medium
                                                default => '#9ca3af'
                                            };
                                            if($act->progress >= 100) $prioColor = '#10b981';
                                        @endphp
                                        <div class="progress-fill" style="width: {{ $act->progress }}%; background: {{ $prioColor }}"></div>
                                    </div>
                                    <span style="font-size:0.8rem; font-weight:600">{{ $act->progress }}%</span>
                                </td>
                                <td>
                                    @if($act->progress >= 100)
                                        <span style="color:#10b981; font-weight:600; font-size:0.8rem"><i class="ri-checkbox-circle-line"></i> Hecho</span>
                                    @else
                                        <span style="color:#6b7280; font-size:0.8rem">Pendiente</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <p style="text-align:center; padding:1rem; color:#999; font-size:0.85rem; font-style:italic">Sin actividades en esta fase.</p>
            @endif
        </div>
    @endforeach

    <div style="margin-top:3rem; padding-top:1rem; border-top:1px solid #eee; text-align:center; color:#999; font-size:0.8rem">
        Generado por Laboratorio Vivo ITNN System
    </div>
</body>
</html>
