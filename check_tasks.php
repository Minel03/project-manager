<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Task;

foreach(Task::with('assignees')->where('status', '!=', 'done')->get() as $t) {
    echo "ID: {$t->id} | Title: {$t->title} | Due: " . ($t->due_date ? $t->due_date->toDateString() : 'NULL') . " | Assignees: {$t->assignees->count()}\n";
}
