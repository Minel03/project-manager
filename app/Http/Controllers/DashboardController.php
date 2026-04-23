<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Project;
use App\Models\Task;
use App\Models\ActivityLog;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard', [
            'projects' => Project::count(),
            'tasks' => Task::count(),
            'completedTasks' => Task::where('status', 'done')->count(),
            'recentActivity' => ActivityLog::with(['user', 'project', 'task'])->latest()->take(5)->get()
        ]);
    }
}
