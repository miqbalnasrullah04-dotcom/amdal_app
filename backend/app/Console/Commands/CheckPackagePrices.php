<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Package;

class CheckPackagePrices extends Command
{
    protected $signature = 'check:package-prices';
    protected $description = 'Check current package prices';

    public function handle()
    {
        $this->info('Current Package Prices:');
        $this->line(str_repeat('-', 40));
        
        $packages = Package::all();
        
        if ($packages->isEmpty()) {
            $this->line('No packages found');
            return;
        }
        
        foreach ($packages as $package) {
            $this->line($package->name . ' - Rp ' . number_format($package->price));
        }
        
        $this->line('');
        $this->info('Premium packages (price > 0):');
        $premiumPackages = $packages->where('price', '>', 0);
        
        foreach ($premiumPackages as $package) {
            $this->line('- ' . $package->name . ': Rp ' . number_format($package->price));
        }
        
        return 0;
    }
}