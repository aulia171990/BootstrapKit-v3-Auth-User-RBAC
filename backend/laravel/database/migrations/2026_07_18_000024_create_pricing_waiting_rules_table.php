<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_waiting_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('city')->index();
            $table->string('service_type')->nullable();
            $table->string('vehicle_type')->nullable();
            $table->integer('free_minutes')->default(0);
            $table->decimal('per_minute_rate', 10, 2);
            $table->decimal('max_fee', 10, 2)->nullable();
            $table->boolean('active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_waiting_rules');
    }
};
