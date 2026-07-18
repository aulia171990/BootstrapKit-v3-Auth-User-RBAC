<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispatch_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('dispatch_job_id')->constrained('dispatch_jobs')->cascadeOnDelete();
            $table->foreignUuid('driver_id')->constrained('drivers')->cascadeOnDelete();
            $table->integer('attempt')->default(1);
            $table->string('status')->default('offered');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->string('response')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['dispatch_job_id', 'driver_id', 'attempt']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispatch_attempts');
    }
};
