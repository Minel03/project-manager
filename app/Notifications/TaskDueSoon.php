<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskDueSoon extends Notification
{
    use Queueable;

    protected $task;

    public function __construct(Task $task)
    {
        $this->task = $task;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'task_id' => $this->task->id,
            'title' => 'Deadline Approaching',
            'message' => "The task '{$this->task->title}' is due in less than 24 hours.",
            'type' => 'task_due_soon',
            'url' => "/tasks/{$this->task->id}",
        ];
    }
}
