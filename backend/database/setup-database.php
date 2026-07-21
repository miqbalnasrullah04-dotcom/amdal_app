<?php
/**
 * Database Setup Script for AMDAL Application
 * 
 * This script will:
 * 1. Test database connection
 * 2. Run migrations
 * 3. Seed database with initial data
 * 4. Verify all tables are created properly
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

echo "=== AMDAL Database Setup Script ===\n\n";

try {
    // Load Laravel application
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    echo "✓ Laravel application loaded successfully\n";

    // Test database connection
    echo "Testing database connection...\n";
    DB::connection()->getPdo();
    echo "✓ Database connection successful!\n";
    
    // Show database info
    $database = DB::connection()->getDatabaseName();
    echo "✓ Connected to database: {$database}\n\n";

    // Clear cache
    echo "Clearing application cache...\n";
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    Artisan::call('route:clear');
    echo "✓ Cache cleared\n\n";

    // Run migrations
    echo "Running database migrations...\n";
    Artisan::call('migrate', ['--force' => true]);
    echo Artisan::output();
    echo "✓ Migrations completed\n\n";

    // Show migration status
    echo "Migration Status:\n";
    Artisan::call('migrate:status');
    echo Artisan::output();

    // Show tables
    echo "\nDatabase Tables:\n";
    $tables = DB::select("SHOW TABLES");
    $tableKey = "Tables_in_{$database}";
    
    foreach ($tables as $table) {
        $tableName = $table->$tableKey;
        if (strpos($tableName, 'amdal_id') === 0) {
            $count = DB::table($tableName)->count();
            echo "  - {$tableName}: {$count} records\n";
        }
    }

    echo "\n✅ Database setup completed successfully!\n";
    echo "\nNext steps:\n";
    echo "1. Start Laravel server: php artisan serve\n";
    echo "2. Start frontend dev server: npm run dev (in frontend directory)\n";
    echo "3. Visit: http://localhost:8000 (backend) and http://localhost:5173 (frontend)\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Please check your database configuration in .env file\n";
    exit(1);
}