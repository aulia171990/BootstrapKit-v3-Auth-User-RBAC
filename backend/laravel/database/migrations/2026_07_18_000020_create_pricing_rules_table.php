<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('service_type')->nullable();
            $table->string('vehicle_type')->nullable();
            $table->string('city')->index();
            $table->decimal('base_fare', 10, 2);
            $table->decimal('minimum_fare', 10, 2);
            $table->decimal('per_km_rate', 10, 4);
            $table->decimal('per_minute_rate', 10, 4);
            $table->string('currency', 3)->default('IDR');
            $table->boolean('active')->default(true);
            $table->timestamp('effective_from')->nullable();
            $table->timestamp('effective_until')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_rules');
    }
};
