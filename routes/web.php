<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExportController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/login', [AuthController::class, 'login'])->name('login');
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle'])->name('google.login');
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');
Route::get('/pending-approval', [AuthController::class, 'pendingApproval'])->name('pending-approval');

Route::middleware(['auth', 'approved'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // API Endpoints
    Route::get('/api/projects', [DashboardController::class, 'getProjects']);
    Route::post('/api/projects', [DashboardController::class, 'createProject']);
    Route::put('/api/projects/{id}', [DashboardController::class, 'updateProject']);
    Route::delete('/api/projects/{id}', [DashboardController::class, 'deleteProject']);

    // Activities
    Route::post('/api/projects/{projectId}/activities', [DashboardController::class, 'createActivity']);
    Route::put('/api/activities/{id}', [DashboardController::class, 'updateActivity']);
    Route::put('/api/activities/{id}/progress', [DashboardController::class, 'updateActivityProgress']);
    Route::delete('/api/activities/{id}', [DashboardController::class, 'deleteActivity']);

    // Activity Logs
    Route::get('/api/activities/{id}/logs', [DashboardController::class, 'getActivityLogs']);

    // User Management (Superadmin only)
    Route::get('/api/users', [DashboardController::class, 'getUsers']);
    Route::put('/api/users/{id}/status', [DashboardController::class, 'updateUserStatus']);

    // Legacy bulk save (superadmin only)
    Route::post('/api/projects/bulk', [DashboardController::class, 'saveProjects']);

    // Export Routes
    Route::get('/api/projects/export/all', [ExportController::class, 'exportAllProjects'])->name('projects.export.all');
    Route::get('/api/projects/{id}/export', [ExportController::class, 'exportProject'])->name('projects.export.single');
});
