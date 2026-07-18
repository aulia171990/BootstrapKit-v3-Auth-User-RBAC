<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * IP logging + failed login tracking.
     *
     * Every authentication attempt (password login, OTP request, OTP login,
     * password reset request) is recorded here with its source IP so abuse can
     * be audited and rate-limited per-IP. `user_id` is nullable because the
     * account may be unknown / not yet resolved (anti-enumeration paths).
     */
    public function up(): void
    {
        Schema::create('login_attempts', function (Blueprint $table) {
            $table->id();
            $table->string('email')->nullable()->index();
            $table->string('ip_address', 45)->index();
            $table->boolean('success')->default(false);
            $table->uuid('user_id')->nullable();
            $table->string('type')->default('password'); // password | otp_request | otp_login | reset
            $table->timestamp('created_at')->nullable()->index();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_attempts');
    }
};
