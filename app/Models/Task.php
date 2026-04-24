<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
        ];
    }

    protected $appends = ['is_timer_running', 'total_minutes'];

    public function getIsTimerRunningAttribute()
    {
        return $this->timeLogs()->where('user_id', \Illuminate\Support\Facades\Auth::id())->whereNull('end_time')->exists();
    }

    public function getTotalMinutesAttribute()
    {
        return (int) $this->timeLogs()->sum('duration');
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function assignees()
    {
        return $this->belongsToMany(User::class);
    }

    public function comments()
    {
        return $this->hasMany(TaskComment::class);
    }

    public function timeLogs()
    {
        return $this->hasMany(TimeLog::class);
    }

    public function blockedBy()
    {
        return $this->belongsTo(Task::class, 'blocked_by_id');
    }

    public function blocking()
    {
        return $this->hasMany(Task::class, 'blocked_by_id');
    }

    public function attachments()
    {
        return $this->hasMany(TaskAttachment::class);
    }

    public function checklists()
    {
        return $this->hasMany(TaskChecklist::class);
    }
}
