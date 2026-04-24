<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserMentioned extends Notification
{
    protected $task;
    protected $mentioner;

    /**
     * Create a new notification instance.
     */
    public function __construct($task, $mentioner)
    {
        $this->task = $task;
        $this->mentioner = $mentioner;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('You were mentioned in a task')
            ->line("{$this->mentioner->name} mentioned you in the task: {$this->task->title}")
            ->action('View Task', url("/tasks/{$this->task->id}"))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Mention',
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'mentioner_name' => $this->mentioner->name,
            'message' => "{$this->mentioner->name} mentioned you in '{$this->task->title}'",
            'type' => 'mention',
            'url' => "/tasks/{$this->task->id}"
        ];
    }
}
