<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class TaskObserver
{
    public function created(Task $task): void
    {
        ActivityLog::create([
            'user_id' => Auth::id() ?? 1,
            'task_id' => $task->id,
            'project_id' => $task->project_id,
            'action' => 'created task',
            'details' => "Created task: {$task->title}"
        ]);
    }

    public function updated(Task $task): void
    {
        $action = 'updated task';
        $details = "Updated task: {$task->title}";

        if ($task->isDirty('status')) {
            $action = 'changed status';
            $details = "Moved task to " . str_replace('_', ' ', $task->status);
        } elseif ($task->isDirty('priority')) {
            $action = 'changed priority';
            $details = "Set priority to {$task->priority}";
        }

        ActivityLog::create([
            'user_id' => Auth::id() ?? 1,
            'task_id' => $task->id,
            'project_id' => $task->project_id,
            'action' => $action,
            'details' => $details
        ]);
    }

    public function deleted(Task $task): void
    {
        ActivityLog::create([
            'user_id' => Auth::id() ?? 1,
            'project_id' => $task->project_id,
            'action' => 'deleted task',
            'details' => "Deleted task: {$task->title}"
        ]);
    }
}
