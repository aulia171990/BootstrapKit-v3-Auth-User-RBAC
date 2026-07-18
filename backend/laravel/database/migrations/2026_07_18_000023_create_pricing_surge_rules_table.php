<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_surge_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type'); // peak_hour | rain | holiday | high_demand | low_supply | special_event | airport | festival
            $table->string('city')->index();
            $table->string('service_type')->nullable();
            $table->string('vehicle_type')->nullable();
            $table->json('conditions')->nullable();
            $table->decimal('multiplier', 4, 2);
            $table->decimal('max_multiplier', 4, 2)->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_surge_rules');
    }
};
