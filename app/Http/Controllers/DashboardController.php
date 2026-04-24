<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Project;
use App\Models\Task;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $projects = Project::where('is_archived', false)
            ->withCount(['tasks', 'tasks as completed_count' => function($q) {
                $q->where('status', 'done');
            }])
            ->get();

        $statusData = [
            ['name' => 'To Do', 'value' => Task::where('status', 'todo')->count(), 'color' => '#6366f1'],
            ['name' => 'In Progress', 'value' => Task::where('status', 'in_progress')->count(), 'color' => '#f59e0b'],
            ['name' => 'Done', 'value' => Task::where('status', 'done')->count(), 'color' => '#10b981'],
        ];

        $weeklyProgress = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = \App\Models\Activity::where('type', 'task_completed')
                ->whereDate('created_at', $date->format('Y-m-d'))
                ->count();
            $weeklyProgress[] = [
                'day' => $date->format('D'),
                'completed' => $count
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'totalProjects' => $projects->count(),
                'totalTasks' => Task::count(),
                'completedTasks' => Task::where('status', 'done')->count(),
            ],
            'projects' => $projects,
            'statusData' => $statusData,
            'weeklyProgress' => $weeklyProgress,
            'recentActivity' => \App\Models\Activity::with(['user', 'project', 'task'])
                ->latest()
                ->take(8)
                ->get()
        ]);
    }
}
