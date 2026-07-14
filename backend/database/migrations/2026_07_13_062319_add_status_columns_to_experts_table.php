<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('experts', function (Blueprint $table) {
            // profile_status: draft (belum lengkap) -> menunggu_verifikasi -> aktif -> ditolak
            $table->string('profile_status')->default('draft')->after('user_id');
            $table->text('reject_reason')->nullable()->after('profile_status');
            $table->foreignId('package_id')->nullable()->after('reject_reason')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('experts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('package_id');
            $table->dropColumn(['profile_status', 'reject_reason']);
        });
    }
};
