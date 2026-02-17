<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Activity;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        return view('dashboard', [
            'currentUser' => $user,
            'isSuperAdmin' => $user->isSuperAdmin(),
        ]);
    }

    /**
     * GET /api/projects — Return all projects with activities, logs, and creator info
     */
    public function getProjects()
    {
        $projects = Project::with([
            'activities.creator:id,name,email,avatar',
            'activities.logs' => function ($q) {
                $q->with('user:id,name,email,avatar')->latest()->take(50);
            }
        ])->get();

        return response()->json($projects);
    }

    /**
     * POST /api/projects — Create a new project (any authenticated user)
     */
    public function createProject(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'required|string|max:20',
            'icon' => 'nullable|string|max:50',
        ]);

        $project = Project::create([
            'name' => $request->name,
            'description' => $request->description,
            'color' => $request->color,
            'icon' => $request->icon ?? 'ri-flask-line',
            'key' => 'proj_' . time(),
        ]);

        return response()->json(['success' => true, 'project' => $project->load('activities')]);
    }

    /**
     * PUT /api/projects/{id} — Update project details (only superadmin or some basic fields)
     */
    public function updateProject(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        $user = Auth::user();

        // Only superadmin can edit project metadata
        if (!$user->isSuperAdmin()) {
            return response()->json(['error' => 'Solo el administrador puede modificar datos del proyecto.'], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'sometimes|string|max:20',
            'icon' => 'nullable|string|max:50',
        ]);

        $project->update($request->only(['name', 'description', 'color', 'icon']));

        return response()->json(['success' => true, 'project' => $project]);
    }

    /**
     * DELETE /api/projects/{id} — Only superadmin
     */
    public function deleteProject($id)
    {
        $user = Auth::user();
        if (!$user->isSuperAdmin()) {
            return response()->json(['error' => 'Solo el administrador puede eliminar proyectos.'], 403);
        }

        $project = Project::findOrFail($id);
        $project->delete();

        return response()->json(['success' => true]);
    }

    /**
     * POST /api/projects/{projectId}/activities — Add activity (any authenticated user)
     */
    public function createActivity(Request $request, $projectId)
    {
        $project = Project::findOrFail($projectId);
        $user = Auth::user();

        $request->validate([
            'text' => 'required|string|max:255',
            'days' => 'required|integer|min:1',
            'priority' => 'required|in:critical,high,medium,low',
            'start_time' => 'nullable|string',
            'end_time' => 'nullable|string',
            'progress' => 'integer|min:0|max:100',
            'justification' => 'required|string|min:5|max:1000',
        ]);

        $activity = $project->activities()->create([
            'text' => $request->text,
            'days' => $request->days,
            'priority' => $request->priority,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'progress' => $request->progress ?? 0,
            'done' => ($request->progress ?? 0) >= 100,
            'created_by' => $user->id,
        ]);

        // Log the creation
        ActivityLog::create([
            'activity_id' => $activity->id,
            'user_id' => $user->id,
            'action' => 'created',
            'old_progress' => null,
            'new_progress' => $request->progress ?? 0,
            'justification' => $request->justification,
        ]);

        return response()->json([
            'success' => true,
            'activity' => $activity->load(['creator:id,name,email,avatar', 'logs.user:id,name,email,avatar']),
        ]);
    }

    /**
     * PUT /api/activities/{id}/progress — Update progress with MANDATORY justification
     * Users can ONLY increase progress, never decrease what others set
     */
    public function updateActivityProgress(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);
        $user = Auth::user();

        $request->validate([
            'progress' => 'required|integer|min:0|max:100',
            'justification' => 'required|string|min:5|max:1000',
        ]);

        $newProgress = (int) $request->progress;
        $oldProgress = (int) $activity->progress;

        // Rule: Users cannot decrease progress set by others
        // Only the superadmin or the user who last set the progress can decrease it
        if ($newProgress < $oldProgress && !$user->isSuperAdmin()) {
            // Check who set the current progress
            $lastProgressLog = $activity->logs()
                ->where('action', 'progress_update')
                ->latest()
                ->first();

            if ($lastProgressLog && $lastProgressLog->user_id !== $user->id) {
                return response()->json([
                    'error' => 'No puedes reducir el avance registrado por otro usuario (' . $lastProgressLog->user->name . ').'
                ], 403);
            }
        }

        $activity->update([
            'progress' => $newProgress,
            'done' => $newProgress >= 100,
        ]);

        ActivityLog::create([
            'activity_id' => $activity->id,
            'user_id' => $user->id,
            'action' => 'progress_update',
            'old_progress' => $oldProgress,
            'new_progress' => $newProgress,
            'justification' => $request->justification,
        ]);

        return response()->json([
            'success' => true,
            'activity' => $activity->load(['creator:id,name,email,avatar', 'logs.user:id,name,email,avatar']),
        ]);
    }

    /**
     * PUT /api/activities/{id} — Update activity details (time, days, priority)
     * Only the creator or superadmin
     */
    public function updateActivity(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);
        $user = Auth::user();

        // Only the creator or superadmin can edit activity details
        if ($activity->created_by !== $user->id && !$user->isSuperAdmin()) {
            return response()->json([
                'error' => 'Solo el creador de la actividad o el administrador pueden editar sus detalles.'
            ], 403);
        }

        $request->validate([
            'text' => 'sometimes|string|max:255',
            'days' => 'sometimes|integer|min:1',
            'priority' => 'sometimes|in:critical,high,medium,low',
            'start_time' => 'nullable|string',
            'end_time' => 'nullable|string',
            'justification' => 'required|string|min:5|max:1000',
        ]);

        $activity->update($request->only(['text', 'days', 'priority', 'start_time', 'end_time']));

        ActivityLog::create([
            'activity_id' => $activity->id,
            'user_id' => $user->id,
            'action' => 'edited',
            'old_progress' => $activity->progress,
            'new_progress' => $activity->progress,
            'justification' => $request->justification,
        ]);

        return response()->json([
            'success' => true,
            'activity' => $activity->load(['creator:id,name,email,avatar', 'logs.user:id,name,email,avatar']),
        ]);
    }

    /**
     * DELETE /api/activities/{id} — Only creator or superadmin
     */
    public function deleteActivity(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);
        $user = Auth::user();

        if ($activity->created_by !== $user->id && !$user->isSuperAdmin()) {
            return response()->json([
                'error' => 'Solo puedes eliminar actividades que tú hayas creado.'
            ], 403);
        }

        $activity->delete();

        return response()->json(['success' => true]);
    }

    /**
     * GET /api/activities/{id}/logs — Get activity history logs
     */
    public function getActivityLogs($id)
    {
        $activity = Activity::findOrFail($id);
        $logs = $activity->logs()->with('user:id,name,email,avatar')->latest()->get();

        return response()->json($logs);
    }

    /**
     * GET /api/users — Return all users (superadmin only)
     */
    public function getUsers()
    {
        $user = Auth::user();
        if (!$user->isSuperAdmin()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        return response()->json(User::orderBy('approved')->orderBy('name')->get());
    }

    /**
     * PUT /api/users/{id}/status — Update user status (superadmin only)
     * Statuses: active, pending, suspended
     */
    public function updateUserStatus(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user->isSuperAdmin()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'status' => 'required|in:active,pending,suspended',
        ]);

        $targetUser = User::findOrFail($id);
        
        // Don't allow changing self status
        if ($targetUser->id === $user->id) {
            return response()->json(['error' => 'No puedes cambiar tu propio estado'], 400);
        }

        $newStatus = $request->status;
        $targetUser->update([
            'status' => $newStatus,
            'approved' => $newStatus === 'active', // Sync legacy field
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Legacy endpoint — kept for backward compatibility but now redirects to granular
     */
    public function saveProjects(Request $request)
    {
        $user = Auth::user();
        if (!$user->isSuperAdmin()) {
            return response()->json([
                'error' => 'Esta acción ya no está disponible. Usa los endpoints individuales.'
            ], 403);
        }

        // Only superadmin can do bulk save (legacy)
        $projectsData = $request->json()->all();

        DB::beginTransaction();
        try {
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
                            'done' => ($aData['progress'] ?? 0) >= 100,
                            'progress' => $aData['progress'] ?? 0,
                            'start_time' => $aData['startTime'] ?? $aData['start_time'] ?? null,
                            'end_time' => $aData['endTime'] ?? $aData['end_time'] ?? null,
                            'priority' => $aData['priority'] ?? 'medium',
                            'created_by' => $user->id,
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
