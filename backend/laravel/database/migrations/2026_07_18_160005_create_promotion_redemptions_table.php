<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotion_redemptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('promotion_id')->index();
            $table->uuid('promotion_code_id')->nullable()->index();
            $table->uuid('user_id')->index();
            $table->uuid('booking_id')->nullable()->index();
            $table->uuid('payment_id')->nullable()->index();
            $table->uuid('trip_id')->nullable()->index();
            $table->uuid('order_id')->nullable()->index();
            $table->uuid('wallet_transaction_id')->nullable()->index();
            $table->unsignedBigInteger('amount_used')->default(0);
            $table->string('currency')->default('IDR');
            $table->string('discount_type')->default('fixed'); // fixed, percentage, cashback
            $table->string('status')->default('used'); // used, reversed, refunded
            $table->json('context')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('reversed_at')->nullable();
            $table->timestamps();

            $table->foreign('promotion_id')
                ->references('id')->on('promotions')
                ->cascadeOnDelete();

            $table->foreign('promotion_code_id')
                ->references('id')->on('promotion_codes')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_redemptions');
    }
};
