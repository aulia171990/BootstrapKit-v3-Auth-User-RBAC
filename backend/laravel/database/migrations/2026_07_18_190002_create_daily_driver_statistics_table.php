<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('daily_driver_statistics')) {
            Schema::create('daily_driver_statistics', function (Blueprint $table) {
                $table->id();
                $table->date('stat_date')->index();
                $table->unsignedInteger('total_drivers')->default(0);
                $table->unsignedInteger('online_drivers')->default(0);
                $table->unsignedInteger('active_drivers')->default(0);
                $table->decimal('average_acceptance_rate', 5, 2)->nullable();
                $table->decimal('average_completion_rate', 5, 2)->nullable();
                $table->decimal('average_rating', 4, 2)->nullable();
                $table->decimal('total_earnings', 14, 2)->default(0);
                $table->timestamps();

                $table->unique(['stat_date']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_driver_statistics');
    }
};
