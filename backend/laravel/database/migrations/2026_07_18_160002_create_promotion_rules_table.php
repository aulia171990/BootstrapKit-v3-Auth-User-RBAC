<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotion_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('promotion_id')->index();
            $table->string('type'); // min_fare, max_discount, max_usage, per_user_limit, daily_limit, city_restriction, vehicle_type_restriction, service_type_restriction, customer_segment, payment_method_restriction
            $table->string('operator'); // eq, neq, gt, gte, lt, lte, in, not_in, between, contains
            $table->json('value')->nullable();
            $table->json('comparison_value')->nullable();
            $table->unsignedSmallInteger('priority')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->foreign('promotion_id')
                ->references('id')->on('promotions')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_rules');
    }
};
