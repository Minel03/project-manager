<?php

namespace App\Http\Controllers;

use App\Models\TimeLog;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TimeLogController extends Controller
{
    public function start(Request $request, Task $task)
    {
        if ($task->status === 'done') {
            return back()->with('error', 'Cannot start timer on a completed task.');
        }
        // Stop any running timers for this user
        $running = TimeLog::where('user_id', Auth::id())->whereNull('end_time')->get();
        foreach($running as $log) {
            $log->end_time = Carbon::now();
            $log->duration = Carbon::parse($log->start_time)->diffInMinutes($log->end_time);
            $log->save();
        }

        TimeLog::create([
            'user_id' => Auth::id(),
            'task_id' => $task->id,
            'start_time' => Carbon::now(),
        ]);

        return back();
    }

    public function stop(Request $request, Task $task)
    {
        $log = TimeLog::where('user_id', Auth::id())
            ->where('task_id', $task->id)
            ->whereNull('end_time')
            ->firstOrFail();

        $log->end_time = Carbon::now();
        $log->duration = Carbon::parse($log->start_time)->diffInMinutes($log->end_time);
        $log->save();

        return back();
    }
}
