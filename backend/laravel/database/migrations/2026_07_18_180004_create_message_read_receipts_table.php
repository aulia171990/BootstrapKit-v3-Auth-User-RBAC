<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_read_receipts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('message_id')->index();
            $table->uuid('user_id')->index();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->foreign('message_id')
                ->references('id')->on('messages')
                ->cascadeOnDelete();

            $table->foreign('user_id')
                ->references('id')->on('users')
                ->cascadeOnDelete();

            $table->unique(['message_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_read_receipts');
    }
};
