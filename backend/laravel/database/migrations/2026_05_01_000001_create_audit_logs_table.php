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
            $table->uuid('user_id')->nullable();
            $table->string('action');
            $table->string('ip_address', 45)->nullable()->index();
            $table->string('actor_email')->nullable();
            $table->jsonb('context')->nullable();
            $table->timestamp('created_at')->nullable()->index();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
