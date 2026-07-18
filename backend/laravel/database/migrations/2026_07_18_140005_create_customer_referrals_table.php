<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_referrals', function (Blueprint $table) {
            $table->id();
            $table->uuid('customer_profile_id');
            $table->foreign('customer_profile_id')->references('id')->on('customer_profiles')->cascadeOnDelete();
            $table->string('code')->index();
            $table->uuid('referred_customer_profile_id')->nullable();
            $table->foreign('referred_customer_profile_id')->references('id')->on('customer_profiles')->nullOnDelete();
            $table->timestamp('redeemed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_referrals');
    }
};
