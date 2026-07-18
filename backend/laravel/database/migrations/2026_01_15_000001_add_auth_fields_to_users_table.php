<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Production-hardening columns for the users table:
     * password-verification state, brute-force lockout counters,
     * and audit/last-login tracking.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('email_verified')->default(false)->after('password');
            $table->boolean('phone_verified')->default(false)->after('email_verified');
            $table->timestamp('last_login_at')->nullable()->after('phone_verified');
            $table->unsignedTinyInteger('failed_login_attempts')->default(0)->after('last_login_at');
            $table->timestamp('locked_until')->nullable()->after('failed_login_attempts');
            $table->string('security_stamp')->nullable()->after('locked_until');
            $table->rememberToken()->after('security_stamp');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'email_verified',
                'phone_verified',
                'last_login_at',
                'failed_login_attempts',
                'locked_until',
                'remember_token',
            ]);
        });
    }
};
