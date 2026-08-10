<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class SyncMembershipLevels extends Command
{
    protected $signature = 'membership:sync-levels';
    protected $description = 'Sync all user membership levels based on their current points';

    public function handle()
    {
        $this->info('🔄 Synchronizing membership levels for all users...');

        $users = User::all();
        $updated = 0;

        foreach ($users as $user) {
            $oldLevel = $user->membership_level;
            $newLevel = $user->calculateLevel();

            if ($oldLevel !== $newLevel) {
                $user->membership_level = $newLevel;
                $user->save();
                $updated++;

                $this->line("Updated {$user->name}: {$oldLevel} → {$newLevel} (Points: {$user->points})");
            }
        }

        $this->info("✅ Synchronization complete! Updated {$updated} users out of {$users->count()} total users.");

        return 0;
    }
}
