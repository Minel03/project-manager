<?php
namespace App\Http\Controllers;

use App\Models\Task;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index()
    {
        $tasks = Task::with('project')
            ->whereNotNull('due_date')
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'start' => $task->due_date,
                    'url' => "/tasks/{$task->id}",
                    'backgroundColor' => $task->status === 'done' ? '#10b981' : ($task->priority === 'high' || $task->priority === 'urgent' ? '#ef4444' : '#6366f1'),
                    'borderColor' => 'transparent',
                    'extendedProps' => [
                        'project' => $task->project->name ?? 'No Project',
                        'status' => $task->status
                    ]
                ];
            });

        return Inertia::render('Calendar/Index', [
            'events' => $tasks
        ]);
    }
}
