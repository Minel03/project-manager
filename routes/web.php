<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TimeLogController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/profile/{user}', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('projects/{project}/archive', [ProjectController::class, 'archive'])->name('projects.archive');
    Route::resource('projects', ProjectController::class);
    Route::resource('tasks', TaskController::class);
    Route::post('tasks/{task}/comments', [TaskController::class, 'addComment'])->name('tasks.comments.add');
    Route::post('tasks/{task}/attachments', [TaskController::class, 'uploadAttachment'])->name('tasks.attachments.add');
    Route::post('tasks/{task}/checklists', [TaskController::class, 'addChecklist'])->name('tasks.checklists.add');
    Route::post('checklists/{checklist}/toggle', [TaskController::class, 'toggleChecklist'])->name('tasks.checklists.toggle');
    Route::delete('checklists/{checklist}', [TaskController::class, 'deleteChecklist'])->name('tasks.checklists.delete');
    Route::delete('tasks/{task}/checklists/completed', [TaskController::class, 'deleteCompletedChecklists'])->name('tasks.checklists.deleteCompleted');
    Route::post('checklists/bulk-delete', [TaskController::class, 'bulkDeleteChecklists'])->name('tasks.checklists.bulkDelete');
    Route::post('tasks/{task}/ai-breakdown', [TaskController::class, 'aiBreakdown'])->name('tasks.ai_breakdown');
    Route::resource('teams', TeamController::class);
    Route::post('teams/{team}/members', [TeamController::class, 'addMember'])->name('teams.members.add');
    Route::delete('teams/{team}/members/{user}', [TeamController::class, 'removeMember'])->name('teams.members.remove');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    // Renamed this to avoid conflict with resource-like names
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');

    Route::post('tasks/{task}/timer/start', [TimeLogController::class, 'start'])->name('tasks.timer.start');
    Route::post('tasks/{task}/timer/stop', [TimeLogController::class, 'stop'])->name('tasks.timer.stop');

    Route::get('search', [SearchController::class, 'search'])->name('search');
    Route::get('calendar', [CalendarController::class, 'index'])->name('calendar.index');

    // Admin only routes
    Route::middleware(['admin'])->group(function () {
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
