<?php

namespace App\Services;

use App\Models\User;
use App\Models\PointHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PointService
{
    /**
     * Konstanta untuk activity types dan poin yang diberikan
     */
    const POINTS = [
        'register' => 20,
        'verify_email' => 10,
        'complete_profile' => 50,
        'upload_cv' => 20,
        'upload_certificate' => 15,
        'add_experience' => 10,
        'add_publication' => 20,
        'upgrade_premium' => 100,
    ];

    /**
     * Level berdasarkan total poin
     */
    const LEVELS = [
        'Bronze' => ['min' => 0, 'max' => 99, 'color' => '#CD7F32', 'icon' => 'workspace_premium'],
        'Silver' => ['min' => 100, 'max' => 299, 'color' => '#C0C0C0', 'icon' => 'workspace_premium'],
        'Gold' => ['min' => 300, 'max' => 699, 'color' => '#FFD700', 'icon' => 'workspace_premium'],
        'Platinum' => ['min' => 700, 'max' => 1499, 'color' => '#E5E4E2', 'icon' => 'military_tech'],
        'Diamond' => ['min' => 1500, 'max' => PHP_INT_MAX, 'color' => '#B9F2FF', 'icon' => 'diamond'],
    ];

    /**
     * Award points ke user untuk aktivitas tertentu
     * 
     * @param User|int $user User instance atau user_id
     * @param string $activityType Tipe aktivitas dari const POINTS
     * @param string|null $description Deskripsi opsional
     * @return PointHistory|null
     */
    public function awardPoints($user, string $activityType, ?string $description = null): ?PointHistory
    {
        try {
            // Get user instance jika diberikan ID
            if (is_numeric($user)) {
                $user = User::find($user);
            }

            if (!$user) {
                Log::warning("PointService: User not found");
                return null;
            }

            // Validasi activity type
            if (!isset(self::POINTS[$activityType])) {
                Log::warning("PointService: Invalid activity type: {$activityType}");
                return null;
            }

            $points = self::POINTS[$activityType];

            // Cek apakah sudah pernah dapat poin untuk aktivitas yang sama (prevent duplicate)
            // Kecuali untuk aktivitas yang bisa berulang (certificate, experience, publication)
            $repeatableActivities = ['upload_certificate', 'add_experience', 'add_publication'];
            
            if (!in_array($activityType, $repeatableActivities)) {
                $existing = PointHistory::where('user_id', $user->id)
                    ->where('activity_type', $activityType)
                    ->first();

                if ($existing) {
                    Log::info("PointService: User {$user->id} already has points for {$activityType}");
                    return null;
                }
            }

            return DB::transaction(function () use ($user, $activityType, $points, $description) {
                // Buat record di points_history
                $history = PointHistory::create([
                    'user_id' => $user->id,
                    'points' => $points,
                    'activity_type' => $activityType,
                    'description' => $description ?? $this->getDefaultDescription($activityType),
                ]);

                // Update total_points user
                $user->increment('total_points', $points);

                Log::info("PointService: Awarded {$points} points to user {$user->id} for {$activityType}");

                return $history;
            });
        } catch (\Exception $e) {
            Log::error("PointService: Error awarding points - " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get level berdasarkan total poin
     * 
     * @param int $totalPoints
     * @return array ['name' => 'Gold', 'min' => 300, 'max' => 699, 'color' => '#FFD700', 'icon' => 'workspace_premium']
     */
    public static function getLevel(int $totalPoints): array
    {
        foreach (self::LEVELS as $levelName => $levelData) {
            if ($totalPoints >= $levelData['min'] && $totalPoints <= $levelData['max']) {
                return array_merge(['name' => $levelName], $levelData);
            }
        }

        // Default ke Bronze jika tidak ketemu
        return array_merge(['name' => 'Bronze'], self::LEVELS['Bronze']);
    }

    /**
     * Get progress ke level berikutnya (dalam %)
     * 
     * @param int $totalPoints
     * @return array ['current_level' => 'Silver', 'next_level' => 'Gold', 'progress' => 45, 'points_needed' => 110]
     */
    public static function getLevelProgress(int $totalPoints): array
    {
        $currentLevel = self::getLevel($totalPoints);
        $currentLevelName = $currentLevel['name'];

        // Cari next level
        $levelNames = array_keys(self::LEVELS);
        $currentIndex = array_search($currentLevelName, $levelNames);
        
        if ($currentIndex === false || $currentIndex >= count($levelNames) - 1) {
            // Sudah max level (Diamond)
            return [
                'current_level' => $currentLevelName,
                'next_level' => null,
                'progress' => 100,
                'points_needed' => 0,
            ];
        }

        $nextLevelName = $levelNames[$currentIndex + 1];
        $nextLevel = self::LEVELS[$nextLevelName];

        // Hitung progress
        $currentMin = $currentLevel['min'];
        $nextMin = $nextLevel['min'];
        $pointsInRange = $totalPoints - $currentMin;
        $rangeSize = $nextMin - $currentMin;
        $progress = ($pointsInRange / $rangeSize) * 100;
        $pointsNeeded = $nextMin - $totalPoints;

        return [
            'current_level' => $currentLevelName,
            'next_level' => $nextLevelName,
            'progress' => round($progress, 1),
            'points_needed' => max(0, $pointsNeeded),
        ];
    }

    /**
     * Get deskripsi default untuk activity type
     */
    private function getDefaultDescription(string $activityType): string
    {
        $descriptions = [
            'register' => 'Registrasi akun baru',
            'verify_email' => 'Verifikasi alamat email',
            'complete_profile' => 'Melengkapi profil 100%',
            'upload_cv' => 'Mengunggah CV/Resume',
            'upload_certificate' => 'Mengunggah sertifikat',
            'add_experience' => 'Menambahkan pengalaman kerja',
            'add_publication' => 'Menambahkan publikasi',
            'upgrade_premium' => 'Upgrade ke member Premium',
        ];

        return $descriptions[$activityType] ?? 'Mendapatkan poin';
    }

    /**
     * Check apakah profil sudah lengkap 100%
     * 
     * @param \App\Models\Expert $expert
     * @return bool
     */
    public static function isProfileComplete($expert): bool
    {
        if (!$expert) {
            return false;
        }

        // Kriteria profil lengkap:
        // - Ada nama
        // - Ada email
        // - Ada phone
        // - Ada bidang keahlian (field_of_expertise)
        // - Ada deskripsi
        // - Ada foto profil
        // - Minimal 1 pendidikan
        // - Minimal 1 pengalaman

        $hasBasicInfo = !empty($expert->name) 
            && !empty($expert->email) 
            && !empty($expert->phone)
            && !empty($expert->field_of_expertise)
            && !empty($expert->description)
            && !empty($expert->photo);

        $hasEducation = $expert->educations()->count() > 0;
        $hasExperience = $expert->experiences()->count() > 0;

        return $hasBasicInfo && $hasEducation && $hasExperience;
    }
}
