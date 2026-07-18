<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_bank_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('driver_id')->constrained()->cascadeOnDelete();
            $table->string('bank_name');
            $table->string('account_number');
            $table->string('account_holder_name');
            $table->string('account_holder_id')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->index(['driver_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_bank_accounts');
    }
};
