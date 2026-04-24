<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimeLog extends Model
{
    protected $fillable = [
        'user_id',
        'task_id',
        'start_time',
        'end_time',
        'duration',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
