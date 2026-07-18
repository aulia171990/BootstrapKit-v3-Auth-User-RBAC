<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_availability', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('driver_id')->constrained('drivers')->cascadeOnDelete();
            $table->string('status')->default('available');
            $table->float('last_latitude')->nullable();
            $table->float('last_longitude')->nullable();
            $table->integer('active_trips')->default(0);
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->index(['driver_id', 'status']);
            $table->index(['last_seen_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_availability');
    }
};
