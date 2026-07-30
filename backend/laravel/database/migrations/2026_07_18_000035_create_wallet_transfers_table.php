<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transfers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('from_wallet_id')->nullable()->constrained('wallets')->nullOnDelete();
            $table->foreignId('to_wallet_id')->nullable()->constrained('wallets')->nullOnDelete();
            $table->foreignId('wallet_transaction_id')->nullable()->constrained('wallet_transactions')->nullOnDelete();
            $table->string('type'); // customer_to_customer|platform_to_driver|driver_to_platform|internal_transfer
            $table->decimal('amount', 15, 2);
            $table->string('currency')->default('IDR');
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transfers');
    }
};
