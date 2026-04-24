<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Only create if admin doesn't already exist
        if (!User::where('email', env('ADMIN_EMAIL', 'admin@admin.com'))->exists()) {
            User::create([
                'name'              => env('ADMIN_NAME', 'Admin'),
                'email'             => env('ADMIN_EMAIL', 'admin@admin.com'),
                'password'          => Hash::make(env('ADMIN_PASSWORD', 'password')),
                'role'              => 'admin',
                'email_verified_at' => now(),
            ]);
        }
    }
}
