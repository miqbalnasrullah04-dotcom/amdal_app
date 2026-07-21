<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class HealthCheckController extends Controller
{
    /**
     * Check application and database health
     */
    public function index()
    {
        try {
            $healthData = [
                'status' => 'healthy',
                'timestamp' => now()->toISOString(),
                'database' => $this->checkDatabase(),
                'cache' => $this->checkCache(),
                'storage' => $this->checkStorage(),
                'version' => config('app.version', '1.0.0')
            ];

            return response()->json($healthData, 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'timestamp' => now()->toISOString()
            ], 500);
        }
    }

    /**
     * Check database connection
     */
    private function checkDatabase()
    {
        try {
            DB::connection()->getPdo();
            
            // Count some basic tables
            $tables = [
                'users' => DB::table('users')->count(),
                'experts' => DB::table('experts')->count(),
                'categories' => DB::table('categories')->count(),
                'articles' => DB::table('articles')->count(),
                'partners' => DB::table('partners')->count()
            ];

            return [
                'status' => 'connected',
                'connection' => DB::connection()->getName(),
                'database' => DB::connection()->getDatabaseName(),
                'tables' => $tables
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'disconnected',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Check cache system
     */
    private function checkCache()
    {
        try {
            Cache::put('health_check', 'test', 60);
            $value = Cache::get('health_check');
            Cache::forget('health_check');

            return [
                'status' => $value === 'test' ? 'working' : 'failed',
                'driver' => config('cache.default')
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'failed',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Check storage system
     */
    private function checkStorage()
    {
        try {
            $path = storage_path('app');
            $writable = is_writable($path);

            return [
                'status' => $writable ? 'writable' : 'read-only',
                'path' => $path,
                'disk_space' => disk_free_space($path)
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'failed',
                'error' => $e->getMessage()
            ];
        }
    }
}