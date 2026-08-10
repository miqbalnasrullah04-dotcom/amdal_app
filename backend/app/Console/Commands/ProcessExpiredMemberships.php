<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\MembershipService;

class ProcessExpiredMemberships extends Command
{
    protected $signature = 'membership:process-expired';
    protected $description = 'Process expired premium memberships and sync levels';

    protected $membershipService;

    public function __construct(MembershipService $membershipService)
    {
        parent::__construct();
        $this->membershipService = $membershipService;
    }

    public function handle()
    {
        $this->info('🔄 Processing expired memberships...');

        try {
            $expiredCount = $this->membershipService->checkExpiredMemberships();

            if ($expiredCount > 0) {
                $this->info("✅ Processed {$expiredCount} expired memberships");

                // Also sync levels for all users
                $this->call('membership:sync-levels');
            } else {
                $this->info('✅ No expired memberships found');
            }

            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Error processing expired memberships: ' . $e->getMessage());
            return 1;
        }
    }
}
