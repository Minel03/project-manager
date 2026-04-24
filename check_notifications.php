<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

foreach(DB::table('notifications')->latest()->limit(10)->get() as $n) {
    echo "ID: {$n->id} | User: {$n->notifiable_id} | Read At: " . ($n->read_at ?: 'NULL') . "\n";
}
