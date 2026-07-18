<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotion_usage', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('promotion_id')->index();
            $table->uuid('user_id')->index();
            $table->uuid('booking_id')->nullable()->index();
            $table->date('date');
            $table->unsignedInteger('count')->default(1);
            $table->timestamps();

            $table->foreign('promotion_id')
                ->references('id')->on('promotions')
                ->cascadeOnDelete();

            $table->foreign('user_id')
                ->references('id')->on('users')
                ->cascadeOnDelete();

            $table->unique(['promotion_id', 'user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_usage');
    }
};
