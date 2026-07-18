<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('campaign_id')->nullable();
            $table->string('code')->nullable()->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type'); // voucher, coupon, cashback, referral_reward, first_ride, free_delivery, percentage_discount, fixed_discount, platform_campaign, driver_campaign
            $table->string('status')->default('draft'); // draft, active, paused, expired
            $table->string('discount_type')->default('fixed'); // percentage, fixed, cashback
            $table->unsignedBigInteger('discount_value')->default(0);
            $table->string('currency')->default('IDR');
            $table->unsignedBigInteger('min_fare')->default(0);
            $table->unsignedBigInteger('max_discount')->nullable();
            $table->unsignedInteger('max_usage')->nullable();
            $table->unsignedInteger('max_usage_per_user')->nullable();
            $table->unsignedInteger('daily_limit')->nullable();
            $table->json('city_restriction')->nullable();
            $table->json('vehicle_type_restriction')->nullable();
            $table->json('service_type_restriction')->nullable();
            $table->json('customer_segment')->nullable();
            $table->json('payment_method_restriction')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('campaign_id')
                ->references('id')->on('promotion_campaigns')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
