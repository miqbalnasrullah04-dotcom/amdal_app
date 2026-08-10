<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('package', ['free', 'premium'])->default('free')->after('total_points')->comment('Paket membership user');
            $table->timestamp('premium_started_at')->nullable()->after('package')->comment('Tanggal mulai premium');
            $table->timestamp('premium_expires_at')->nullable()->after('premium_started_at')->comment('Tanggal berakhir premium');
            $table->integer('points')->default(0)->after('premium_expires_at')->comment('Point membership (berbeda dengan total_points)');
            $table->enum('membership_level', ['basic', 'silver', 'gold', 'platinum'])->default('basic')->after('points')->comment('Level membership berdasarkan points');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'package',
                'premium_started_at',
                'premium_expires_at',
                'points',
                'membership_level'
            ]);
        });
    }
};
