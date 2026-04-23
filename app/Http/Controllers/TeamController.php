<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index()
    {
        return Inertia::render('Teams/Index', [
            'teams' => Team::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Teams/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Team::create($validated);

        return redirect()->route('teams.index');
    }

    public function show(Team $team)
    {
        return Inertia::render('Teams/Show', [
            'team' => $team->load('users'),
            'availableUsers' => \App\Models\User::whereNotIn('id', $team->users->pluck('id'))->get()
        ]);
    }

    public function addMember(Request $request, Team $team)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'nullable|string'
        ]);

        $team->users()->attach($validated['user_id'], ['role' => $validated['role'] ?? 'member']);

        return back();
    }

    public function removeMember(Team $team, \App\Models\User $user)
    {
        $team->users()->detach($user->id);
        return back();
    }
}
