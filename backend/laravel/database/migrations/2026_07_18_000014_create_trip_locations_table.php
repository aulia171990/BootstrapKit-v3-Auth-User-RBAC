<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trip_locations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('trip_id');
            $table->float('latitude');
            $table->float('longitude');
            $table->float('heading')->nullable();
            $table->float('speed')->nullable();
            $table->integer('accuracy')->nullable();
            $table->timestamp('recorded_at')->nullable();

            $table->index('trip_id');
            $table->index(['trip_id', 'recorded_at']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_locations');
    }
};