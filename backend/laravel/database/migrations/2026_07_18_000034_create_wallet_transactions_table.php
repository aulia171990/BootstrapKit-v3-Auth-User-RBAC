<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // topup|payment|settlement|refund|withdrawal|transfer|adjustment|cashback|bonus|penalty|promo_credit|manual_correction
            $table->string('status')->default('pending'); // pending|completed|failed|cancelled|processing|rejected
            $table->decimal('amount', 15, 2);
            $table->string('currency')->default('IDR');
            $table->string('reference_type')->nullable();
            $table->string('reference_id')->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->string('failure_reason')->nullable();
            $table->timestamps();

            $table->index(['wallet_id', 'type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
