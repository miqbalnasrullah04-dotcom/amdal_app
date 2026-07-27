<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PointHistory;
use App\Models\User;
use App\Services\PointService;
use Illuminate\Http\Request;

class PointController extends Controller
{
    /**
     * Get riwayat poin user yang sedang login
     */
    public function myHistory(Request $request)
    {
        $user = $request->user();

        $history = PointHistory::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $level = PointService::getLevel($user->total_points);
        $progress = PointService::getLevelProgress($user->total_points);

        return response()->json([
            'total_points' => $user->total_points,
            'level' => $level,
            'progress' => $progress,
            'history' => $history,
        ]);
    }

    /**
     * Get leaderboard (top users berdasarkan total poin)
     */
    public function leaderboard(Request $request)
    {
        $limit = $request->input('limit', 10);

        $topUsers = User::where('role', 'user')
            ->where('total_points', '>', 0)
            ->orderBy('total_points', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($user) {
                $level = PointService::getLevel($user->total_points);
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'total_points' => $user->total_points,
                    'level' => $level,
                ];
            });

        return response()->json($topUsers);
    }

    /**
     * Get stats poin untuk dashboard admin
     */
    public function stats()
    {
        $totalPoints = User::where('role', 'user')->sum('total_points');
        $totalUsers = User::where('role', 'user')->count();
        $avgPoints = $totalUsers > 0 ? round($totalPoints / $totalUsers, 2) : 0;

        // Count users per level
        $users = User::where('role', 'user')->get();
        $levelCounts = [
            'Bronze' => 0,
            'Silver' => 0,
            'Gold' => 0,
            'Platinum' => 0,
            'Diamond' => 0,
        ];

        foreach ($users as $user) {
            $level = PointService::getLevel($user->total_points);
            if (isset($levelCounts[$level['name']])) {
                $levelCounts[$level['name']]++;
            }
        }

        return response()->json([
            'total_points_distributed' => $totalPoints,
            'total_users' => $totalUsers,
            'average_points' => $avgPoints,
            'level_distribution' => $levelCounts,
        ]);
    }
}
