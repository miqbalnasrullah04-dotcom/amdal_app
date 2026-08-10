<?php

namespace App\Services;

use App\Models\User;
use App\Models\MembershipTransaction;
use App\Models\PointTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Exception;

class MembershipService
{
    const PREMIUM_PRICE = 200000; // Harga premium 200rb per tahun (sesuai Package)
    const PREMIUM_POINTS_REWARD = 500; // Point yang diberikan saat upgrade/renewal
    const PREMIUM_DURATION_MONTHS = 12; // Durasi premium dalam bulan

    /**
     * Calculate level from points (static method untuk consistency)
     */
    private function calculateLevelFromPoints(int $points): string
    {
        if ($points >= 2000) {
            return 'platinum';
        } elseif ($points >= 1000) {
            return 'gold';
        } elseif ($points >= 500) {
            return 'silver';
        } else {
            return 'basic';
        }
    }

    /**
     * Get membership status for user
     */
    public function getMembershipStatus(User $user): array
    {
        $nextLevelInfo = $user->getNextLevelInfo();

        return [
            'package' => $user->package,
            'is_premium' => $user->isPremium(),
            'premium_started_at' => $user->premium_started_at,
            'premium_expires_at' => $user->premium_expires_at,
            'remaining_days' => $user->getPremiumRemainingDays(),
            'points' => $user->points,
            'membership_level' => $user->membership_level,
            'level_display_name' => $user->getLevelDisplayName(),
            'level_badge_color' => $user->getLevelBadgeColor(),
            'discount_percentage' => $user->getDiscountPercentage(),
            'next_level' => $nextLevelInfo['next_level'],
            'points_needed' => $nextLevelInfo['points_needed'],
            'progress_percentage' => $nextLevelInfo['progress_percentage'],
        ];
    }

    /**
     * Calculate premium price with discount
     */
    public function calculatePremiumPrice(User $user): array
    {
        $originalPrice = self::PREMIUM_PRICE;
        $discountPercentage = $user->getDiscountPercentage();
        $discountAmount = $originalPrice * ($discountPercentage / 100);
        $totalPrice = $originalPrice - $discountAmount;

        return [
            'original_price' => $originalPrice,
            'discount_percentage' => $discountPercentage,
            'discount_amount' => $discountAmount,
            'total_price' => $totalPrice,
        ];
    }

    /**
     * Upgrade user to premium (first time)
     */
    public function upgradeToPremium(User $user): MembershipTransaction
    {
        if ($user->isPremium()) {
            throw new Exception('User sudah memiliki paket Premium yang aktif');
        }

        $pricing = $this->calculatePremiumPrice($user);
        $startedAt = Carbon::now();
        $expiresAt = $startedAt->clone()->addMonths(self::PREMIUM_DURATION_MONTHS);

        DB::beginTransaction();
        try {
            // Create membership transaction
            $transaction = MembershipTransaction::create([
                'user_id' => $user->id,
                'package' => 'premium',
                'type' => 'upgrade',
                'price' => $pricing['original_price'],
                'discount' => $pricing['discount_percentage'],
                'total_price' => $pricing['total_price'],
                'started_at' => $startedAt,
                'expires_at' => $expiresAt,
                'payment_status' => 'pending',
            ]);

            DB::commit();
            return $transaction;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Renew premium membership
     */
    public function renewPremium(User $user): MembershipTransaction
    {
        if (!$user->isPremium()) {
            throw new Exception('User harus memiliki paket Premium aktif untuk melakukan perpanjangan');
        }

        $pricing = $this->calculatePremiumPrice($user);

        // Perpanjangan dimulai dari tanggal expired yang sekarang
        $startedAt = $user->premium_expires_at;
        $expiresAt = $startedAt->clone()->addMonths(self::PREMIUM_DURATION_MONTHS);

        DB::beginTransaction();
        try {
            // Create membership transaction
            $transaction = MembershipTransaction::create([
                'user_id' => $user->id,
                'package' => 'premium',
                'type' => 'renewal',
                'price' => $pricing['original_price'],
                'discount' => $pricing['discount_percentage'],
                'total_price' => $pricing['total_price'],
                'started_at' => $startedAt,
                'expires_at' => $expiresAt,
                'payment_status' => 'pending',
            ]);

            DB::commit();
            return $transaction;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Process successful payment for membership transaction
     */
    public function processSuccessfulPayment(MembershipTransaction $transaction): void
    {
        if ($transaction->payment_status !== 'pending') {
            throw new Exception('Transaksi sudah diproses sebelumnya');
        }

        DB::beginTransaction();
        try {
            // Update transaction status
            $transaction->update(['payment_status' => 'paid']);

            $user = $transaction->user;

            // Update user membership
            $updateData = [
                'package' => 'premium',
                'premium_expires_at' => $transaction->expires_at,
            ];

            // Set premium_started_at only for first upgrade
            if ($transaction->type === 'upgrade') {
                $updateData['premium_started_at'] = $transaction->started_at;
            }

            $user->update($updateData);

            // Add points and update level atomically
            $oldPoints = $user->points;
            $newPoints = $oldPoints + self::PREMIUM_POINTS_REWARD;
            $newLevel = $this->calculateLevelFromPoints($newPoints);

            $user->update([
                'points' => $newPoints,
                'membership_level' => $newLevel,
            ]);

            // Create point transaction record
            $user->pointTransactions()->create([
                'type' => $transaction->type === 'upgrade' ? 'upgrade_premium' : 'renewal_premium',
                'points' => self::PREMIUM_POINTS_REWARD,
                'description' => $transaction->type === 'upgrade' ? 'Upgrade ke Premium' : 'Perpanjangan Premium',
            ]);

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Process failed payment for membership transaction
     */
    public function processFailedPayment(MembershipTransaction $transaction): void
    {
        $transaction->update(['payment_status' => 'failed']);
    }

    /**
     * Cancel membership transaction
     */
    public function cancelTransaction(MembershipTransaction $transaction): void
    {
        if ($transaction->payment_status === 'paid') {
            throw new Exception('Transaksi yang sudah dibayar tidak dapat dibatalkan');
        }

        $transaction->update(['payment_status' => 'cancelled']);
    }

    /**
     * Check and expire premium memberships
     */
    public function checkExpiredMemberships(): int
    {
        $expiredCount = 0;

        $expiredUsers = User::where('package', 'premium')
            ->where('premium_expires_at', '<', Carbon::now())
            ->get();

        foreach ($expiredUsers as $user) {
            $user->update(['package' => 'free']);
            $expiredCount++;
        }

        return $expiredCount;
    }

    /**
     * Get point transaction history for user
     */
    public function getPointHistory(User $user, int $limit = 10): array
    {
        $transactions = $user->pointTransactions()
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return $transactions->map(function ($transaction) {
            return [
                'id' => $transaction->id,
                'type' => $transaction->type,
                'points' => $transaction->points,
                'description' => $transaction->description,
                'formatted_description' => $transaction->formatted_description,
                'created_at' => $transaction->created_at,
            ];
        })->toArray();
    }

    /**
     * Get membership transaction history for user
     */
    public function getMembershipHistory(User $user, int $limit = 10): array
    {
        $transactions = $user->membershipTransactions()
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return $transactions->map(function ($transaction) {
            return [
                'id' => $transaction->id,
                'package' => $transaction->package,
                'type' => $transaction->type,
                'formatted_type' => $transaction->formatted_type,
                'price' => $transaction->price,
                'discount' => $transaction->discount,
                'discount_amount' => $transaction->discount_amount,
                'total_price' => $transaction->total_price,
                'started_at' => $transaction->started_at,
                'expires_at' => $transaction->expires_at,
                'payment_status' => $transaction->payment_status,
                'is_active' => $transaction->is_active,
                'remaining_days' => $transaction->remaining_days,
                'created_at' => $transaction->created_at,
            ];
        })->toArray();
    }

    /**
     * Get statistics for admin
     */
    public function getAdminStatistics(): array
    {
        return [
            'total_users' => User::count(),
            'free_users' => User::where('package', 'free')->count(),
            'premium_users' => User::where('package', 'premium')
                ->where('premium_expires_at', '>', Carbon::now())
                ->count(),
            'expired_premium_users' => User::where('package', 'premium')
                ->where('premium_expires_at', '<=', Carbon::now())
                ->count(),
            'total_premium_revenue' => MembershipTransaction::where('payment_status', 'paid')->sum('total_price'),
            'monthly_premium_revenue' => MembershipTransaction::where('payment_status', 'paid')
                ->whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->sum('total_price'),
            'level_distribution' => [
                'basic' => User::where('membership_level', 'basic')->count(),
                'silver' => User::where('membership_level', 'silver')->count(),
                'gold' => User::where('membership_level', 'gold')->count(),
                'platinum' => User::where('membership_level', 'platinum')->count(),
            ],
        ];
    }
}
