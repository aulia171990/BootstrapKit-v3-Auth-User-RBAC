<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operation_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type')->index(); // sos, dispatch_failed, payment_failed, driver_offline, trip_cancelled
            $table->string('severity')->default('medium'); // low, medium, high, critical
            $table->string('title');
            $table->text('body')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->uuid('acknowledged_by')->nullable()->index();
            $table->timestamps();

            $table->foreign('acknowledged_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operation_alerts');
    }
};
