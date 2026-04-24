<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show(User $user)
    {
        $stats = [
            'total_tasks' => $user->tasks()->count(),
            'completed_tasks' => $user->tasks()->where('status', 'done')->count(),
            'pending_tasks' => $user->tasks()->where('status', '!=', 'done')->count(),
            'on_time_rate' => $this->calculateOnTimeRate($user),
        ];

        $activityData = \App\Models\Activity::where('user_id', $user->id)
            ->where('type', 'task_completed')
            ->where('created_at', '>=', now()->subYear())
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Profile/Show', [
            'profileUser' => $user,
            'stats' => $stats,
            'activityData' => $activityData
        ]);
    }

    private function calculateOnTimeRate($user)
    {
        $completedTasks = $user->tasks()
            ->where('tasks.status', 'done')
            ->whereNotNull('tasks.due_date')
            ->get();
            
        if ($completedTasks->isEmpty()) return 100;

        $onTimeCount = $completedTasks->filter(function ($task) {
            return $task->updated_at <= $task->due_date;
        })->count();

        return round(($onTimeCount / $completedTasks->count()) * 100);
    }
}
