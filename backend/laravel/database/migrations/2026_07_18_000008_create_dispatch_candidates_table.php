<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispatch_candidates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('dispatch_job_id')->constrained('dispatch_jobs')->cascadeOnDelete();
            $table->foreignUuid('driver_id')->constrained('drivers')->cascadeOnDelete();
            $table->double('distance', 8, 2)->nullable();
            $table->integer('estimated_arrival')->nullable();
            $table->float('driver_rating')->nullable();
            $table->float('acceptance_rate')->nullable();
            $table->float('score')->nullable();
            $table->timestamp('offer_sent_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->string('response')->nullable();
            $table->timestamps();

            $table->unique(['dispatch_job_id', 'driver_id']);
            $table->index(['dispatch_job_id', 'score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispatch_candidates');
    }
};
