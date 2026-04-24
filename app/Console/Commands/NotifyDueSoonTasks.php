<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Notifications\TaskDueSoon;
use Illuminate\Console\Command;
use Carbon\Carbon;

class NotifyDueSoonTasks extends Command
{
    protected $signature = 'tasks:notify-due';
    protected $description = 'Notify users about tasks due in the next 24 hours';

    public function handle()
    {
        $soon = Carbon::now()->addHours(24);
        
        $tasks = Task::with('assignees')
            ->where('status', '!=', 'done')
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<=', $soon->toDateString())
            ->whereDate('due_date', '>=', Carbon::today()->toDateString())
            ->get();

        $this->info("Found " . $tasks->count() . " tasks due soon.");

        foreach ($tasks as $task) {
            $this->info("Processing task: {$task->title} with " . $task->assignees->count() . " assignees.");
            foreach ($task->assignees as $user) {
                // Prevent duplicate notifications within 24 hours
                $alreadyNotified = $user->notifications()
                    ->where('data->task_id', $task->id)
                    ->where('type', \App\Notifications\TaskDueSoon::class)
                    ->where('created_at', '>', \Carbon\Carbon::now()->subDay())
                    ->exists();

                if (!$alreadyNotified) {
                    $user->notify(new \App\Notifications\TaskDueSoon($task));
                    $this->info("Notified {$user->name} about task: {$task->title}");
                }
            }
        }

        return Command::SUCCESS;
    }
}
