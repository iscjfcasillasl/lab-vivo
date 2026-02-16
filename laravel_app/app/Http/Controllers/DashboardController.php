<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        return view('dashboard');
    }

    public function getProjects()
    {
        // Return projects with activities, ordered by ID or Name
        // In frontend, sorting might be done by Priority of contained activities?
        // Let's just return all.
        return Project::with('activities')->get();
    }

    public function saveProjects(Request $request)
    {
        $projectsData = $request->json()->all();

        DB::beginTransaction();
        try {
            // Full replacement strategy for simplicity as per existing logic
            // Note: In a real high-concurrency app, we'd do smart updates.
            // Here we wipe and recreate to ensure sync with frontend state.
            // But we must be careful with IDs if frontend preserves them.
            // If frontend sends 'id', we should try to keep it or just map by key?
            // The vanilla app used 'key'. Laravel uses 'id'.
            // I will wipe all and recreate.
            
            // Delete all projects and cascades to activities
            Project::query()->delete(); 

            foreach ($projectsData as $pData) {
                $project = Project::create([
                    'name' => $pData['name'],
                    'description' => $pData['desc'] ?? $pData['description'] ?? null,
                    'color' => $pData['color'],
                    'icon' => $pData['icon'],
                    'key' => $pData['key'] ?? null,
                ]);

                if (isset($pData['activities']) && is_array($pData['activities'])) {
                    foreach ($pData['activities'] as $aData) {
                        $project->activities()->create([
                            'text' => $aData['text'] ?? ($aData['name'] ?? 'Actividad'),
                            'days' => $aData['days'] ?? 1,
                            'done' => ($aData['progress'] ?? 0) >= 100, // Sync done status with progress
                            'progress' => $aData['progress'] ?? 0,
                            'start_time' => $aData['startTime'] ?? $aData['start_time'] ?? null,
                            'end_time' => $aData['endTime'] ?? $aData['end_time'] ?? null,
                            'priority' => $aData['priority'] ?? 'medium',
                        ]);
                    }
                }
            }

            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
