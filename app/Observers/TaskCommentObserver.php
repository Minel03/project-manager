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

        // Detect mentions like @username
        preg_match_all('/@([a-zA-Z0-9_.]+)/', $comment->comment, $matches);
        
        if (!empty($matches[1])) {
            $usernames = array_unique($matches[1]);
            $users = \App\Models\User::whereIn('name', $usernames)
                ->where('id', '!=', $comment->user_id) // Don't notify self
                ->get();

            foreach ($users as $user) {
                $user->notify(new \App\Notifications\CommentMention($comment->task, $comment->user));
            }
        }
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
