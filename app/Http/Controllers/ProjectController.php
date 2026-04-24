<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Project;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::where('is_archived', false)
            ->when(\Illuminate\Support\Facades\Auth::user()?->role !== 'admin', function ($query) {
                $query->whereHas('tasks.assignees', function($q) {
                    $q->where('users.id', \Illuminate\Support\Facades\Auth::id());
                });
            })
            ->withCount(['tasks', 'tasks as completed_tasks_count' => function ($query) {
                $query->where('status', 'done');
            }])->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects
        ]);
    }

    public function archive(Project $project)
    {
        $project->update(['is_archived' => !$project->is_archived]);
        return back();
    }

    public function create()
    {
        $teams = \App\Models\Team::all();
        return Inertia::render('Projects/Create', ['teams' => $teams]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'team_id'     => 'required|exists:teams,id',
        ]);

        Project::create($validated);

        return redirect()->route('projects.index');
    }

    public function show(Project $project)
    {
        $project->load(['tasks' => function ($query) {
            $query->when(\Illuminate\Support\Facades\Auth::user()?->role !== 'admin', function ($q) {
                $q->whereHas('assignees', function($q2) {
                    $q2->where('users.id', \Illuminate\Support\Facades\Auth::id());
                });
            })->with(['assignees', 'timeLogs']);
        }]);
        
        // Analytics Data
        $timeDistribution = $project->tasks->map(function ($task) {
            return [
                'name' => $task->title,
                'value' => $task->timeLogs->sum('duration') ?: 0
            ];
        })->filter(fn($item) => $item['value'] > 0)->values();

        $statusCounts = [
            ['name' => 'To Do', 'value' => $project->tasks->where('status', 'todo')->count()],
            ['name' => 'In Progress', 'value' => $project->tasks->where('status', 'in_progress')->count()],
            ['name' => 'Done', 'value' => $project->tasks->where('status', 'done')->count()],
        ];

        // Last 14 days activity
        $dailyTime = [];
        for ($i = 13; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $duration = \App\Models\TimeLog::whereIn('task_id', $project->tasks->pluck('id'))
                ->whereDate('start_time', $date)
                ->sum('duration');
            
            $dailyTime[] = [
                'date' => now()->subDays($i)->format('M d'),
                'minutes' => (int)$duration
            ];
        }

        $activities = \App\Models\Activity::with('user')
            ->where('project_id', $project->id)
            ->latest()
            ->limit(20)
            ->get();

        return Inertia::render('Projects/Show', [
            'project' => $project->loadCount(['tasks', 'tasks as completed_tasks_count' => function ($query) {
                $query->where('status', 'done');
            }]),
            'analytics' => [
                'timeDistribution' => $timeDistribution,
                'statusCounts' => $statusCounts,
                'dailyTime' => $dailyTime,
            ],
            'activities' => $activities,
            'team' => $project->team ? $project->team->load('users') : null,
            'availableUsers' => \App\Models\User::all(),
        ]);
    }
}
