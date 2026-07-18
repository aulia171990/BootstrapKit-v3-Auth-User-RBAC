<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_availabilities', function (Blueprint $table) {
            $table->id();
            $table->uuid('driver_id')->unique();
            $table->string('status');
            $table->float('last_latitude')->nullable();
            $table->float('last_longitude')->nullable();
            $table->unsignedInteger('active_trips')->default(0);
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_availabilities');
    }
};
