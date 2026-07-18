<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('trip_id')->nullable()->index();
            $table->uuid('rater_user_id')->index();
            $table->uuid('rated_user_id')->index();
            $table->unsignedTinyInteger('score'); // 1..5
            $table->text('comment')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->json('category_scores')->nullable();
            $table->string('status')->default('active'); // active, reported, hidden
            $table->timestamp('reported_at')->nullable();
            $table->timestamp('moderated_at')->nullable();
            $table->timestamps();

            $table->foreign('rater_user_id')
                ->references('id')->on('users')
                ->cascadeOnDelete();

            $table->foreign('rated_user_id')
                ->references('id')->on('users')
                ->cascadeOnDelete();

            $table->unique(['trip_id', 'rater_user_id', 'rated_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
