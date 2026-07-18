<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('review_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('rating_id')->index();
            $table->uuid('review_id')->nullable()->index();
            $table->uuid('reporter_user_id')->index();
            $table->string('reason')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('open'); // open, reviewed, dismissed
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->foreign('rating_id')
                ->references('id')->on('ratings')
                ->cascadeOnDelete();

            $table->foreign('review_id')
                ->references('id')->on('reviews')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_reports');
    }
};
