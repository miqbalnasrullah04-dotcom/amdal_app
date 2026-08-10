<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SyncMembershipLevel
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Sync membership level for authenticated user
        if ($user = $request->user()) {
            $this->syncUserMembership($user);
        }

        return $next($request);
    }

    /**
     * Sync user membership level and premium status
     */
    private function syncUserMembership($user): void
    {
        $needsUpdate = false;
        $updates = [];

        // Check if level needs updating based on points
        $calculatedLevel = $user->calculateLevel();
        if ($user->membership_level !== $calculatedLevel) {
            $updates['membership_level'] = $calculatedLevel;
            $needsUpdate = true;
        }

        // Check if premium should be expired
        if ($user->package === 'premium' && !$user->isPremium()) {
            $updates['package'] = 'free';
            $needsUpdate = true;
        }

        // Update if needed
        if ($needsUpdate) {
            $user->update($updates);
        }
    }
}
