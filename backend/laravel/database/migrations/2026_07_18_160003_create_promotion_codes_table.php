<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotion_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('promotion_id')->index();
            $table->string('code')->index();
            $table->string('type')->default('public'); // public, single_use, bulk
            $table->unsignedInteger('max_single_uses')->nullable();
            $table->unsignedInteger('current_uses')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('promotion_id')
                ->references('id')->on('promotions')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_codes');
    }
};
