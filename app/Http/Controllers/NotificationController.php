<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        return response()->json(Auth::user()->notifications()->latest()->limit(20)->get());
    }

    public function markAsRead($id)
    {
        Auth::user()->notifications()->findOrFail($id)->markAsRead();
        return response()->json(['success' => true]);
    }

    public function markAllAsRead()
    {
        Auth::user()->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    }
}
