<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Task;
use App\Models\Project;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index()
    {
        return Inertia::render('Tasks/Index', [
            'tasks' => Task::with(['assignees'])
                ->withCount(['checklists', 'checklists as completed_checklists_count' => function ($query) {
                    $query->where('is_completed', true);
                }])->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Tasks/Create', [
            'projects' => Project::all(),
            'users' => \App\Models\User::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'required|exists:projects,id',
            'status' => 'required|in:todo,in_progress,done',
            'assignees' => 'nullable|array',
            'assignees.*' => 'exists:users,id',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
        ]);

        $task = Task::create(collect($validated)->except('assignees')->toArray());
        
        if (isset($validated['assignees'])) {
            $task->assignees()->sync($validated['assignees']);
        }

        return redirect()->route('tasks.index');
    }

    public function show(Task $task)
    {
        return Inertia::render('Tasks/Show', [
            'task' => $task->load(['assignees', 'project', 'comments.user', 'attachments', 'checklists']),
            'users' => \App\Models\User::all()
        ]);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:todo,in_progress,done',
            'assignees' => 'nullable|array',
            'assignees.*' => 'exists:users,id',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
        ]);

        $task->update(collect($validated)->except('assignees')->toArray());

        if ($request->has('assignees')) {
            $task->assignees()->sync($validated['assignees'] ?? []);
        }

        return back();
    }

    public function addComment(Request $request, Task $task)
    {
        $validated = $request->validate([
            'comment' => 'required|string'
        ]);

        $task->comments()->create([
            'user_id' => \Illuminate\Support\Facades\Auth::id() ?? 1,
            'comment' => $validated['comment']
        ]);

        return back();
    }

    public function uploadAttachment(Request $request, Task $task)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        
        try {
            $response = cloudinary()->uploadApi()->upload($file->getRealPath());
            $uploadedFileUrl = $response['secure_url'];
            
            $task->attachments()->create([
                'user_id' => \Illuminate\Support\Facades\Auth::id() ?? 1,
                'file_name' => $file->getClientOriginalName(),
                'file_url' => $uploadedFileUrl
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Failed to upload to Cloudinary. Check your .env credentials.']);
        }

        return back();
    }

    public function addChecklist(Request $request, Task $task)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:255'
        ]);

        $task->checklists()->create($validated);

        return back();
    }

    public function toggleChecklist(\App\Models\TaskChecklist $checklist)
    {
        $checklist->update(['is_completed' => !$checklist->is_completed]);
        return back();
    }

    public function deleteChecklist(\App\Models\TaskChecklist $checklist)
    {
        $checklist->delete();
        return back();
    }
}
