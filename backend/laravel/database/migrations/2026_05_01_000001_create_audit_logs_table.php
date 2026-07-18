<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Security/account audit trail. One immutable row per significant account
     * event (login, logout, register, password change, failed login, email
     * verification, token refresh). Captures the actor, action, source IP, and
     * free-form context for forensics and compliance.
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');          // login | logout | register | password_change | failed_login | email_verification | token_refresh
            $table->string('ip_address', 45)->nullable()->index();
            $table->string('actor_email')->nullable(); // denormalised for quick search when user_id is null
            $table->jsonb('context')->nullable();       // device/platform/ua, outcome, extra
            $table->timestamp('created_at')->nullable()->index();
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
