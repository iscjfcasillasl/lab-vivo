<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resumen General de Proyectos - Laboratorio Vivo</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    <style>
        :root {
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
            margin-bottom: 3rem;
            text-align: center;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 2rem;
        }

        .header h1 {
            font-size: 2rem;
            color: #111;
            margin-bottom: 0.5rem;
        }

        .header h2 {
            font-size: 1.2rem;
            color: var(--text-muted);
            font-weight: 400;
        }

        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 12px;
        }

        th {
            text-align: left;
            padding: 12px 16px;
            color: var(--text-muted);
            font-weight: 600;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid var(--border);
        }

        td {
            padding: 20px 16px;
            background: #fff;
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
        }

        tr td:first-child {
            border-left: 1px solid var(--border);
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
        }

        tr td:last-child {
            border-right: 1px solid var(--border);
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
        }

        .project-cell {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .icon-box {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            flex-shrink: 0;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .progress-bar {
            height: 8px;
            background: #f3f4f6;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 6px;
            border: 1px solid #e5e7eb;
        }

        .progress-fill {
            height: 100%;
            border-radius: 4px;
        }

        .print-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1f2937;
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

        @media print {
            .print-btn { display: none; }
            body { padding: 0; max-width: none; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()"><i class="ri-printer-line"></i> Imprimir Reporte</button>

    <div class="header">
        <h1>📊 Estado General de Proyectos</h1>
        <h2>Laboratorio Vivo ITNN - Reporte Ejecutivo</h2>
        <p style="margin-top:0.5rem; font-size:0.9rem; color:#888">Generado el {{ date('d/m/Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:40%">Proyecto</th>
                <th style="width:20%">Estadísticas</th>
                <th style="width:15%">Duración Est.</th>
                <th style="width:25%">Progreso General</th>
            </tr>
        </thead>
        <tbody>
            @foreach($projects as $project)
                <tr>
                    <td>
                        <div class="project-cell">
                            <div class="icon-box" style="background: {{ $project->color }}20; color: {{ $project->color }}">
                                <i class="{{ $project->icon }}"></i>
                            </div>
                            <div>
                                <div style="font-weight:700; font-size:1rem; color:#111; margin-bottom:4px">{{ $project->name }}</div>
                                <div style="font-size:0.8rem; color:#666; line-height:1.3">{{ Str::limit($project->description, 60) }}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        @php
                            $totalActs = $project->activities->count();
                            $doneActs = $project->activities->where('progress', '>=', 100)->count();
                            $phasesCount = $project->phases->count();
                        @endphp
                        <div class="stats-grid">
                            <div><i class="ri-stack-line"></i> {{ $phasesCount }} Fases</div>
                            <div><i class="ri-list-check"></i> {{ $totalActs }} Activ.</div>
                            <div style="grid-column: span 2; color: #10b981"><i class="ri-checkbox-circle-line"></i> {{ $doneActs }} Completadas</div>
                        </div>
                    </td>
                    <td>
                        <div style="font-weight:600; font-size:0.9rem">{{ $project->activities->sum('days') }} Días</div>
                        <div style="font-size:0.75rem; color:#888">Calendario estimado</div>
                    </td>
                    <td>
                        @php
                            $pct = $totalActs > 0 ? round(($doneActs / $totalActs) * 100) : 0;
                        @endphp
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: {{ $pct }}%; background: {{ $project->color }}"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center">
                            <span style="font-weight:700; font-size:1rem; color:{{ $project->color }}">{{ $pct }}%</span>
                            <span style="font-size:0.75rem; color:#888">{{ $doneActs }}/{{ $totalActs }}</span>
                        </div>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top:3rem; text-align:center; font-size:0.85rem; color:#999">
        Documento para uso interno | Laboratorio Vivo ITNN
    </div>

</body>
</html>
