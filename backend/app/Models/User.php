<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Carbon\Carbon;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'otp_code',
        'otp_expires_at',
        'reset_token',
        'reset_token_expires_at',
        'email_verified_at',
        'total_points',
        'package',
        'premium_started_at',
        'premium_expires_at',
        'points',
        'membership_level',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'otp_expires_at' => 'datetime',
            'reset_token_expires_at' => 'datetime',
            'premium_started_at' => 'datetime',
            'premium_expires_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Relasi ke PointHistory (legacy)
     */
    public function pointsHistory()
    {
        return $this->hasMany(PointHistory::class);
    }

    /**
     * Relasi ke PointTransaction
     */
    public function pointTransactions()
    {
        return $this->hasMany(PointTransaction::class);
    }

    /**
     * Relasi ke MembershipTransaction
     */
    public function membershipTransactions()
    {
        return $this->hasMany(MembershipTransaction::class);
    }

    /**
     * Check if user is currently premium
     */
    public function isPremium(): bool
    {
        return $this->package === 'premium' &&
               $this->premium_expires_at &&
               $this->premium_expires_at->isFuture();
    }

    /**
     * Calculate membership level based on points
     */
    public function calculateLevel(): string
    {
        if ($this->points >= 2000) {
            return 'platinum';
        } elseif ($this->points >= 1000) {
            return 'gold';
        } elseif ($this->points >= 500) {
            return 'silver';
        } else {
            return 'basic';
        }
    }

    /**
     * Get discount percentage for premium renewal based on level
     */
    public function getDiscountPercentage(): int
    {
        return match($this->membership_level) {
            'platinum' => 15,
            'gold' => 10,
            'silver' => 5,
            'basic' => 0,
            default => 0,
        };
    }

    /**
     * Get next level info
     */
    public function getNextLevelInfo(): array
    {
        $levels = [
            'basic' => ['next' => 'silver', 'required_points' => 500],
            'silver' => ['next' => 'gold', 'required_points' => 1000],
            'gold' => ['next' => 'platinum', 'required_points' => 2000],
            'platinum' => ['next' => null, 'required_points' => null],
        ];

        $currentLevel = $this->membership_level;
        $nextLevel = $levels[$currentLevel] ?? null;

        if (!$nextLevel || !$nextLevel['next']) {
            return [
                'next_level' => null,
                'points_needed' => 0,
                'progress_percentage' => 100,
            ];
        }

        $pointsNeeded = $nextLevel['required_points'] - $this->points;

        // Calculate progress percentage
        $previousLevelPoints = match($currentLevel) {
            'basic' => 0,
            'silver' => 500,
            'gold' => 1000,
            default => 0,
        };

        $levelRange = $nextLevel['required_points'] - $previousLevelPoints;
        $currentProgress = $this->points - $previousLevelPoints;
        $progressPercentage = $levelRange > 0 ? min(100, ($currentProgress / $levelRange) * 100) : 0;

        return [
            'next_level' => $nextLevel['next'],
            'points_needed' => max(0, $pointsNeeded),
            'progress_percentage' => $progressPercentage,
        ];
    }

    /**
     * Get remaining premium days
     */
    public function getPremiumRemainingDays(): int
    {
        if (!$this->isPremium()) {
            return 0;
        }

        return Carbon::now()->diffInDays($this->premium_expires_at);
    }

    /**
     * Update membership level based on current points
     */
    public function updateMembershipLevel(): void
    {
        $newLevel = $this->calculateLevel();
        if ($this->membership_level !== $newLevel) {
            $this->membership_level = $newLevel;
            $this->saveQuietly(); // Use saveQuietly to avoid triggering events
        }
    }

    /**
     * Add points to user
     */
    public function addPoints(int $points, string $type, string $description): void
    {
        $this->increment('points', $points);

        // Create point transaction
        $this->pointTransactions()->create([
            'type' => $type,
            'points' => $points,
            'description' => $description,
        ]);

        // Update membership level
        $this->updateMembershipLevel();
    }

    /**
     * Get level badge color
     */
    public function getLevelBadgeColor(): string
    {
        return match($this->membership_level) {
            'platinum' => '#8B5CF6', // Purple
            'gold' => '#F59E0B', // Gold
            'silver' => '#6B7280', // Silver
            'basic' => '#9CA3AF', // Gray
            default => '#9CA3AF',
        };
    }

    /**
     * Get level display name
     */
    public function getLevelDisplayName(): string
    {
        return match($this->membership_level) {
            'platinum' => 'Platinum',
            'gold' => 'Gold',
            'silver' => 'Silver',
            'basic' => 'Basic',
            default => 'Basic',
        };
    }
}
