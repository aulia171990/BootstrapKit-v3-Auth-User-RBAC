<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_favorite_places', function (Blueprint $table) {
            $table->id();
            $table->uuid('customer_profile_id');
            $table->foreign('customer_profile_id')->references('id')->on('customer_profiles')->cascadeOnDelete();
            $table->string('name');
            $table->string('address');
            $table->string('type')->default('custom'); // home|office|custom
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_favorite_places');
    }
};
