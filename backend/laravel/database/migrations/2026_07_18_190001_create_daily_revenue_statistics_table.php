<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('daily_revenue_statistics')) {
            Schema::create('daily_revenue_statistics', function (Blueprint $table) {
                $table->id();
                $table->date('stat_date')->index();
                $table->decimal('total_revenue', 14, 2)->default(0);
                $table->decimal('total_refunds', 14, 2)->default(0);
                $table->decimal('platform_fee', 14, 2)->default(0);
                $table->decimal('driver_payout', 14, 2)->default(0);
                $table->decimal('promotion_spend', 14, 2)->default(0);
                $table->unsignedInteger('payment_count')->default(0);
                $table->timestamps();

                $table->unique(['stat_date']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_revenue_statistics');
    }
};
