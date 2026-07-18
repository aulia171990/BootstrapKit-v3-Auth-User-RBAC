<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operation_incidents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('trip_id')->nullable()->index();
            $table->uuid('driver_id')->nullable()->index();
            $table->uuid('customer_id')->nullable()->index();
            $table->string('type')->default('sos'); // sos, payment_failed, dispatch_failed, safety, other
            $table->string('status')->default('open'); // open, acknowledged, escalated, resolved, closed
            $table->string('priority')->default('high'); // low, medium, high, critical
            $table->text('description')->nullable();
            $table->uuid('assigned_to')->nullable()->index();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('assigned_to')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operation_incidents');
    }
};
