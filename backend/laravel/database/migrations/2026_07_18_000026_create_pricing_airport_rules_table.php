<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_airport_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('airport_code')->index();
            $table->string('city')->index();
            $table->string('airport_name')->nullable();
            $table->decimal('surcharge', 10, 2)->nullable();
            $table->decimal('pickup_fee', 10, 2)->nullable();
            $table->decimal('dropoff_fee', 10, 2)->nullable();
            $table->string('currency', 3)->default('IDR');
            $table->boolean('active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_airport_rules');
    }
};
