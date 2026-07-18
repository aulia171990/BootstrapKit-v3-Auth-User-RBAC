<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trip_status_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('trip_id');
            $table->string('from_status')->nullable();
            $table->string('to_status')->nullable();
            $table->string('actor_type')->nullable();
            $table->uuid('actor_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('occurred_at')->nullable();
            $table->timestamps();

            $table->index('trip_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_status_history');
    }
};