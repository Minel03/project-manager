<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskChecklist;
use App\Models\User;
use App\Notifications\TaskAssigned;
use App\Notifications\TaskDueSoon;
use App\Notifications\UserMentioned;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::with(['assignees', 'timeLogs'])
            ->withCount(['checklists', 'checklists as completed_checklists_count' => function ($query) {
                $query->where('is_completed', true);
            }])
            ->withSum('timeLogs as total_minutes', 'duration')
            ->get()
            ->map(function ($task) {
                $task->is_timer_running = $task->timeLogs->whereNull('end_time')
                    ->where('user_id', Auth::id())
                    ->isNotEmpty();

                return $task;
            });

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
        ]);
    }

    public function create()
    {
        return Inertia::render('Tasks/Create', [
            'projects' => Project::all(),
            'users' => User::all(),
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

        Activity::create([
            'user_id' => Auth::id() ?? 1,
            'project_id' => $task->project_id,
            'task_id' => $task->id,
            'type' => 'task_created',
            'description' => "created task '{$task->title}'",
        ]);

        if ($task->status === 'done') {
            Activity::create([
                'user_id' => Auth::id() ?? 1,
                'project_id' => $task->project_id,
                'task_id' => $task->id,
                'type' => 'task_completed',
                'description' => "completed task '{$task->title}' during creation",
            ]);
        }

        if (isset($validated['assignees'])) {
            $task->assignees()->sync($validated['assignees']);

            // If the task is due today or tomorrow, notify new assignees immediately
            $isDueSoon = $task->due_date && Carbon::parse($task->due_date)->isBetween(
                Carbon::today(),
                Carbon::today()->addDay()
            );

            if ($isDueSoon) {
                foreach ($task->assignees as $user) {
                    if ($user->id !== Auth::id()) {
                        $user->notify(new TaskDueSoon($task));
                    }
                }
            }
        }

        return redirect()->route('tasks.index');
    }

    public function show(Task $task)
    {
        return Inertia::render('Tasks/Show', [
            'task' => $task->load(['assignees', 'project', 'comments.user', 'attachments', 'checklists', 'blockedBy']),
            'users' => User::all(),
            'allTasks' => Task::where('project_id', $task->project_id)->get(['id', 'title']),
        ]);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:todo,in_progress,done',
            'assignees' => 'nullable|array',
            'assignees.*' => 'exists:users,id',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
            'blocked_by_id' => 'nullable|exists:tasks,id',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'done') {
            if ($task->blockedBy && $task->blockedBy->status !== 'done') {
                return back()->withErrors(['status' => "This task is blocked by '{$task->blockedBy->title}' and cannot be completed yet."]);
            }
        }

        $oldStatus = $task->status;
        $task->update(collect($validated)->except('assignees')->toArray());

        if (isset($validated['status']) && $oldStatus !== $validated['status']) {
            $type = $validated['status'] === 'done' ? 'task_completed' : 'status_updated';
            Activity::create([
                'user_id' => Auth::id() ?? 1,
                'project_id' => $task->project_id,
                'task_id' => $task->id,
                'type' => $type,
                'description' => "moved '{$task->title}' to ".str_replace('_', ' ', $validated['status']),
            ]);
        } elseif (isset($validated['title'])) {
            Activity::create([
                'user_id' => Auth::id() ?? 1,
                'project_id' => $task->project_id,
                'task_id' => $task->id,
                'type' => 'task_updated',
                'description' => "renamed task to '{$validated['title']}'",
            ]);
        }

        if ($request->has('assignees')) {
            $oldAssignees = $task->assignees()->pluck('users.id')->toArray();
            $task->assignees()->sync($validated['assignees'] ?? []);
            $newAssignees = array_diff($validated['assignees'] ?? [], $oldAssignees);

            $newlyAssignedUsers = User::whereIn('id', $newAssignees)->get();
            foreach ($newlyAssignedUsers as $user) {
                if ($user->id !== Auth::id()) {
                    $user->notify(new TaskAssigned($task));
                }
            }
        }

        // Check for "Due Soon" immediately after update
        $isDueSoon = $task->due_date && Carbon::parse($task->due_date)->isBetween(
            Carbon::today(),
            Carbon::today()->addDay()
        );

        if ($isDueSoon) {
            foreach ($task->assignees as $user) {
                // We notify everyone assigned if the deadline is now soon,
                // but only if they haven't been notified in the last 24h to avoid double alerts
                $alreadyNotified = $user->notifications()
                    ->where('data->task_id', $task->id)
                    ->where('type', TaskDueSoon::class)
                    ->where('created_at', '>', Carbon::now()->subDay())
                    ->exists();

                if (! $alreadyNotified && $user->id !== Auth::id()) {
                    $user->notify(new TaskDueSoon($task));
                }
            }
        }

        return back();
    }

    public function addComment(Request $request, Task $task)
    {
        $validated = $request->validate([
            'comment' => 'required|string',
        ]);

        $mentioner = $request->user();
        $task->comments()->create([
            'user_id' => $mentioner->id,
            'comment' => $validated['comment'],
        ]);

        // Detect Mentions (e.g., @John Doe)
        preg_match_all('/@([^@,\s]+(?:\s+[^@,\s]+)*)/', $validated['comment'], $matches);

        if (! empty($matches[1])) {
            $mentionedNames = array_map('trim', $matches[1]);
            $usersToNotify = User::whereIn('name', $mentionedNames)
                ->get();

            foreach ($usersToNotify as $user) {
                $user->notify(new UserMentioned($task, $mentioner));
            }
        }

        Activity::create([
            'user_id' => $mentioner->id,
            'project_id' => $task->project_id,
            'task_id' => $task->id,
            'type' => 'comment_added',
            'description' => "commented on '{$task->title}'",
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
                'user_id' => Auth::id() ?? 1,
                'file_name' => $file->getClientOriginalName(),
                'file_url' => $uploadedFileUrl,
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Failed to upload to Cloudinary. Check your .env credentials.']);
        }

        return back();
    }

    public function addChecklist(Request $request, Task $task)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:255',
        ]);

        $task->checklists()->create($validated);

        return back();
    }

    public function toggleChecklist(TaskChecklist $checklist)
    {
        $checklist->update(['is_completed' => ! $checklist->is_completed]);

        return back();
    }

    public function deleteChecklist(TaskChecklist $checklist)
    {
        $checklist->delete();

        return back();
    }

    public function deleteCompletedChecklists(Task $task)
    {
        $task->checklists()->where('is_completed', true)->delete();

        return back();
    }

    public function bulkDeleteChecklists(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:task_checklists,id',
        ]);

        TaskChecklist::whereIn('id', $validated['ids'])->delete();

        return back();
    }

    public function aiBreakdown(Task $task)
    {
        $apiKey = env('GROQ_API_KEY');

        if (! $apiKey) {
            return back()->withErrors(['ai' => 'Groq API Key not found in .env']);
        }

        try {
            $response = Http::withToken($apiKey)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.3-70b-versatile',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are an Expert Senior Project Manager. Your goal is to break down the user\'s task into a logical, professional, and highly actionable checklist. Each step must be clear, concise, and focused on tangible progress. Provide 5-8 sub-tasks that cover the entire workflow from initial preparation to final delivery. Use professional terminology. Return ONLY a raw JSON array of strings, no other conversational text.',
                        ],
                        [
                            'role' => 'user',
                            'content' => "Project: {$task->project->name}\nTask Title: {$task->title}\nDescription: {$task->description}",
                        ],
                    ],
                    'temperature' => 0.1,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $content = $data['choices'][0]['message']['content'];

                // Extract JSON if model returned extra text
                if (preg_match('/\[.*\]/s', $content, $matches)) {
                    $subtasks = json_decode($matches[0]);

                    if (is_array($subtasks)) {
                        // Clear existing uncompleted items to avoid duplicates
                        $task->checklists()->where('is_completed', false)->delete();

                        foreach ($subtasks as $item) {
                            $task->checklists()->create([
                                'content' => $item,
                                'is_completed' => false,
                            ]);
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Groq AI Breakdown failed: '.$e->getMessage());
        }

        Activity::create([
            'user_id' => Auth::id() ?? 1,
            'project_id' => $task->project_id,
            'task_id' => $task->id,
            'type' => 'ai_breakdown',
            'description' => "used AI to break down task '{$task->title}'",
        ]);

        return back();
    }
}
