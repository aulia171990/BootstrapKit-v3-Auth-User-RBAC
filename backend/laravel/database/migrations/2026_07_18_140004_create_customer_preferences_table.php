<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_preferences', function (Blueprint $table) {
            $table->id();
            $table->uuid('customer_profile_id')->unique();
            $table->foreign('customer_profile_id')->references('id')->on('customer_profiles')->cascadeOnDelete();
            $table->string('preferred_vehicle')->nullable();
            $table->boolean('accessibility')->default(false);
            $table->boolean('quiet_ride')->default(false);
            $table->boolean('air_conditioning')->default(true);
            $table->string('music_preference')->nullable();
            $table->boolean('pet_friendly')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_preferences');
    }
};
