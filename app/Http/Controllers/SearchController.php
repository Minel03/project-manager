<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q');
        if (!$query) return response()->json([]);

        $projects = Project::where('name', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name'])
            ->map(fn($p) => ['id' => "p-{$p->id}", 'title' => $p->name, 'type' => 'Project', 'url' => "/projects/{$p->id}"]);

        $tasks = Task::where('title', 'like', "%{$query}%")
            ->limit(10)
            ->get(['id', 'title'])
            ->map(fn($t) => ['id' => "t-{$t->id}", 'title' => $t->title, 'type' => 'Task', 'url' => "/tasks/{$t->id}"]);

        $users = User::where('name', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name'])
            ->map(fn($u) => ['id' => "u-{$u->id}", 'title' => $u->name, 'type' => 'User', 'url' => "/profile/{$u->id}"]);

        return response()->json($projects->concat($tasks)->concat($users));
    }
}
