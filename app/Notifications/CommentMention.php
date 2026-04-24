<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CommentMention extends Notification
{
    use Queueable;

    protected $task;
    protected $mentioner;

    public function __construct(Task $task, User $mentioner)
    {
        $this->task = $task;
        $this->mentioner = $mentioner;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'task_id' => $this->task->id,
            'title' => 'New Mention',
            'message' => "{$this->mentioner->name} mentioned you in a comment on: {$this->task->title}",
            'type' => 'comment_mention',
            'url' => "/tasks/{$this->task->id}",
        ];
    }
}
