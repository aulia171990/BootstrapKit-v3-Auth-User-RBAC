<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('rating_id')->index();
            $table->uuid('reporter_user_id')->nullable()->index();
            $table->string('reason')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('open'); // open, reviewed, dismissed
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->foreign('rating_id')
                ->references('id')->on('ratings')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
