<?php

namespace App\Observers;

use App\Models\TaskComment;
use App\Models\ActivityLog;

class TaskCommentObserver
{
    /**
     * Handle the TaskComment "created" event.
     */
    public function created(TaskComment $comment): void
    {
        ActivityLog::create([
            'user_id' => $comment->user_id,
            'task_id' => $comment->task_id,
            'project_id' => $comment->task->project_id,
            'action' => 'added comment',
            'details' => "Commented: " . \Illuminate\Support\Str::limit($comment->comment, 50)
        ]);
    }

    /**
     * Handle the TaskComment "updated" event.
     */
    public function updated(TaskComment $taskComment): void
    {
        //
    }

    /**
     * Handle the TaskComment "deleted" event.
     */
    public function deleted(TaskComment $taskComment): void
    {
        //
    }

    /**
     * Handle the TaskComment "restored" event.
     */
    public function restored(TaskComment $taskComment): void
    {
        //
    }

    /**
     * Handle the TaskComment "force deleted" event.
     */
    public function forceDeleted(TaskComment $taskComment): void
    {
        //
    }
}
