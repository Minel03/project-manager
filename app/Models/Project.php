<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $guarded = [];

    protected $appends = ['progress_percentage'];

    public function getProgressPercentageAttribute()
    {
        $total = $this->tasks()->count();
        if ($total === 0) return 0;
        
        $completed = $this->tasks()->where('status', 'done')->count();
        return round(($completed / $total) * 100);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
