<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('display_name')->nullable();
            $table->string('gender')->nullable(); // male|female|other
            $table->date('date_of_birth')->nullable();
            $table->string('language')->default('id');
            $table->string('avatar_url')->nullable();
            $table->string('referral_code')->nullable()->unique();
            $table->string('verification_status')->default('pending'); // pending|verified|rejected
            $table->string('status')->default('active'); // active|blocked|suspended
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_profiles');
    }
};
