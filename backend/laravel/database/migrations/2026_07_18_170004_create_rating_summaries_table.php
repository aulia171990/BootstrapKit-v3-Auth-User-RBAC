<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rating_summaries', function (Blueprint $table) {
            $table->uuid('user_id')->primary();
            $table->unsignedInteger('rating_count')->default(0);
            $table->json('distribution')->nullable();
            $table->json('category_averages')->nullable();
            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')->on('users')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rating_summaries');
    }
};
