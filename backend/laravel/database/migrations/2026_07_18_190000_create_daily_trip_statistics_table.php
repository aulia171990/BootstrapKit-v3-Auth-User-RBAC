<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('daily_trip_statistics')) {
            Schema::create('daily_trip_statistics', function (Blueprint $table) {
                $table->id();
                $table->date('stat_date')->index();
                $table->unsignedInteger('total_trips')->default(0);
                $table->unsignedInteger('completed_trips')->default(0);
                $table->unsignedInteger('cancelled_trips')->default(0);
                $table->unsignedInteger('active_trips')->default(0);
                $table->unsignedInteger('online_drivers')->default(0);
                $table->unsignedInteger('active_customers')->default(0);
                $table->unsignedInteger('acceptance_count')->default(0);
                $table->unsignedInteger('completion_count')->default(0);
                $table->decimal('average_distance', 8, 2)->nullable();
                $table->unsignedInteger('average_duration_seconds')->nullable();
                $table->decimal('average_rating', 4, 2)->nullable();
                $table->timestamps();

                $table->unique(['stat_date']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_trip_statistics');
    }
};
