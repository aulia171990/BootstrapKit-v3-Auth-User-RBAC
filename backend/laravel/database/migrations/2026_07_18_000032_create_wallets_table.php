<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->string('owner_type');
            $table->string('owner_id');
            $table->string('wallet_type');
            $table->string('currency')->default('IDR');
            $table->string('status')->default('active');
            $table->decimal('available_balance', 15, 2)->default(0);
            $table->decimal('held_balance', 15, 2)->default(0);
            $table->timestamps();

            $table->unique(['owner_type', 'owner_id', 'wallet_type', 'currency']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
