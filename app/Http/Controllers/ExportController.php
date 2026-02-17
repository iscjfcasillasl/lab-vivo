<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ExportController extends Controller
{
    /**
     * Export a single project to CSV (Excel compatible)
     * 
     * @param int $id Project ID
     * @return \Illuminate\Http\Response
     */
    public function exportProject($id)
    {
        $project = Project::with(['activities.creator', 'activities.logs'])->findOrFail($id);
        
        $filename = "proyecto_{$project->key}_{$id}.csv";
        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename={$filename}",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() use ($project) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header Row
            fputcsv($file, [
                'Proyecto', 
                'Descripción', 
                'Icono', 
                'Color', 
                'Actividad', 
                'Prioridad', 
                'Días Estimados', 
                'Progreso (%)', 
                'Estado', 
                'Inicio', 
                'Fin', 
                'Creado Por', 
                'Justificación Reciente'
            ]);

            foreach ($project->activities as $activity) {
                // Get most recent justification if any
                $lastLog = $activity->logs->last();
                $justification = $lastLog ? $lastLog->justification : '';

                fputcsv($file, [
                    $project->name,
                    $project->description,
                    $project->icon,
                    $project->color,
                    $activity->text,
                    ucfirst($activity->priority),
                    $activity->days,
                    $activity->progress,
                    $activity->done ? 'Completado' : 'Pendiente',
                    $activity->start_time,
                    $activity->end_time,
                    $activity->creator ? $activity->creator->name : 'N/A',
                    $justification
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    /**
     * Export all projects to CSV (Excel compatible)
     * 
     * @return \Illuminate\Http\Response
     */
    public function exportAllProjects()
    {
        $projects = Project::with(['activities.creator', 'activities.logs'])->get();
        
        $filename = "todos_los_proyectos_" . date('Y-m-d') . ".csv";
        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename={$filename}",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() use ($projects) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header Row
            fputcsv($file, [
                'ID Proyecto',
                'Proyecto', 
                'Descripción', 
                'Icono', 
                'Color', 
                'Actividad', 
                'Prioridad', 
                'Días Estimados', 
                'Progreso (%)', 
                'Estado', 
                'Inicio', 
                'Fin', 
                'Creado Por', 
                'Justificación Reciente'
            ]);

            foreach ($projects as $project) {
                if ($project->activities->isEmpty()) {
                    // Export project even if no activities
                    fputcsv($file, [
                        $project->id,
                        $project->name,
                        $project->description,
                        $project->icon,
                        $project->color,
                        '(Sin actividades)',
                        '', '', '', '', '', '', '', ''
                    ]);
                } else {
                    foreach ($project->activities as $activity) {
                        $lastLog = $activity->logs->last();
                        $justification = $lastLog ? $lastLog->justification : '';
    
                        fputcsv($file, [
                            $project->id,
                            $project->name,
                            $project->description,
                            $project->icon,
                            $project->color,
                            $activity->text,
                            ucfirst($activity->priority),
                            $activity->days,
                            $activity->progress,
                            $activity->done ? 'Completado' : 'Pendiente',
                            $activity->start_time,
                            $activity->end_time,
                            $activity->creator ? $activity->creator->name : 'N/A',
                            $justification
                        ]);
                    }
                }
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }
}
