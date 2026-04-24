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
        $isAdmin = \Illuminate\Support\Facades\Auth::user()?->role === 'admin';
        $userId = \Illuminate\Support\Facades\Auth::id();

        $projects = Project::where('is_archived', false)
            ->when(!$isAdmin, function ($query) use ($userId) {
                $query->whereHas('tasks.assignees', function($q) use ($userId) {
                    $q->where('users.id', $userId);
                });
            })
            ->withCount(['tasks' => function($q) use ($isAdmin, $userId) {
                $q->when(!$isAdmin, function($q2) use ($userId) {
                    $q2->whereHas('assignees', function($q3) use ($userId) {
                        $q3->where('users.id', $userId);
                    });
                });
            }, 'tasks as completed_count' => function($q) use ($isAdmin, $userId) {
                $q->where('status', 'done')
                  ->when(!$isAdmin, function($q2) use ($userId) {
                      $q2->whereHas('assignees', function($q3) use ($userId) {
                          $q3->where('users.id', $userId);
                      });
                  });
            }])
            ->get();

        $taskQuery = Task::when(!$isAdmin, function ($query) use ($userId) {
            $query->whereHas('assignees', function($q) use ($userId) {
                $q->where('users.id', $userId);
            });
        });

        $statusData = [
            ['name' => 'To Do', 'value' => (clone $taskQuery)->where('status', 'todo')->count(), 'color' => '#6366f1'],
            ['name' => 'In Progress', 'value' => (clone $taskQuery)->where('status', 'in_progress')->count(), 'color' => '#f59e0b'],
            ['name' => 'Done', 'value' => (clone $taskQuery)->where('status', 'done')->count(), 'color' => '#10b981'],
        ];

        $weeklyProgress = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = \App\Models\Activity::where('type', 'task_completed')
                ->whereDate('created_at', $date->format('Y-m-d'))
                ->when(!$isAdmin, function($q) use ($userId) {
                    $q->where('user_id', $userId);
                })
                ->count();
            $weeklyProgress[] = [
                'day' => $date->format('D'),
                'completed' => $count
            ];
        }

        $activities = \App\Models\Activity::with(['user', 'project', 'task'])
            ->when(!$isAdmin, function($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->latest()
            ->take(8)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalProjects' => $projects->count(),
                'totalTasks' => (clone $taskQuery)->count(),
                'completedTasks' => (clone $taskQuery)->where('status', 'done')->count(),
            ],
            'projects' => $projects,
            'statusData' => $statusData,
            'weeklyProgress' => $weeklyProgress,
            'recentActivity' => $activities
        ]);
    }
}
