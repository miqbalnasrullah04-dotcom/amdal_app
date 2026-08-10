<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanOrphanedProofs extends Command
{
    protected $signature = 'orders:clean-orphaned-proofs';
    protected $description = 'Clean orders with proof_of_payment pointing to non-existent files';

    public function handle()
    {
        $this->info('Checking for orphaned proof files...');

        $orders = Order::whereNotNull('proof_of_payment')->get();
        $cleaned = 0;

        foreach ($orders as $order) {
            $filePath = $order->proof_of_payment;
            
            // Check if file exists in storage
            if (!Storage::disk('public')->exists($filePath)) {
                $this->warn("File not found for Order #{$order->id}: {$filePath}");
                
                // Set proof_of_payment to null
                $order->update(['proof_of_payment' => null]);
                $cleaned++;
            }
        }

        if ($cleaned > 0) {
            $this->info("✅ Cleaned {$cleaned} orders with missing proof files.");
        } else {
            $this->info("✅ All proof files are valid. No cleaning needed.");
        }

        return 0;
    }
}
