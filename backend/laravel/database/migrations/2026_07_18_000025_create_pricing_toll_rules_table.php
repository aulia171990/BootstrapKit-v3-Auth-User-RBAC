<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_toll_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('city')->index();
            $table->string('road_or_gate');
            $table->enum('type', ['manual', 'automatic']);
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('IDR');
            $table->boolean('active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_toll_rules');
    }
};
