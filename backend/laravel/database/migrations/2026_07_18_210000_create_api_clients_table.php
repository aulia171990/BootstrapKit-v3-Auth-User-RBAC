<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('api_clients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type')->default('partner');
            $table->string('scopes')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('api_keys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('api_client_id')->constrained('api_clients')->cascadeOnDelete();
            $table->string('prefix', 20)->index();
            $table->text('hashed_secret');
            $table->json('scopes')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('api_scopes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('module');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('api_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('api_key_id')->constrained('api_keys')->cascadeOnDelete();
            $table->string('tokenable_type')->nullable();
            $table->uuid('tokenable_id')->nullable();
            $table->json('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('api_webhooks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('api_client_id')->constrained('api_clients')->cascadeOnDelete();
            $table->string('url');
            $table->string('events')->default('[]');
            $table->string('secret')->nullable();
            $table->json('headers')->nullable();
            $table->timestamp('last_delivered_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('api_webhook_deliveries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('api_webhook_id')->constrained('api_webhooks')->cascadeOnDelete();
            $table->string('event');
            $table->string('status');
            $table->unsignedInteger('attempt')->default(1);
            $table->string('error')->nullable();
            $table->text('response')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('next_attempt_at')->nullable();
            $table->timestamps();
        });

        Schema::create('api_rate_limits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('api_client_id')->nullable()->constrained('api_clients')->nullOnDelete();
            $table->string('subject_type');
            $table->string('subject_id');
            $table->string('route');
            $table->unsignedInteger('limit');
            $table->unsignedInteger('remaining')->default(0);
            $table->timestamp('resets_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('api_rate_limits');
        Schema::dropIfExists('api_webhook_deliveries');
        Schema::dropIfExists('api_webhooks');
        Schema::dropIfExists('api_tokens');
        Schema::dropIfExists('api_scopes');
        Schema::dropIfExists('api_keys');
        Schema::dropIfExists('api_clients');
    }
};
