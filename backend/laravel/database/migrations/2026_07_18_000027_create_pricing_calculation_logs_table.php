<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_calculation_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('pricing_rule_id')->nullable();
            $table->uuid('booking_id')->nullable();
            $table->string('trip_id')->nullable();
            $table->uuid('request_id')->nullable();
            $table->text('input')->nullable();
            $table->json('components');
            $table->decimal('final_fare', 10, 2);
            $table->string('currency', 3)->default('IDR');
            $table->integer('calculation_time_ms')->nullable();
            $table->timestamp('calculated_at')->index();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_calculation_logs');
    }
};
