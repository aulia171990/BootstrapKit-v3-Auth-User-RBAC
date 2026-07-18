<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conversation_id')->index();
            $table->uuid('sender_id')->index();
            $table->text('body')->nullable();
            $table->string('type')->default('text'); // text, image, location, quick_reply, system, voice, document, video
            $table->json('payload')->nullable();
            $table->uuid('reply_to_id')->nullable()->index();
            $table->softDeletes();
            $table->timestamp('edited_at')->nullable();
            $table->timestamps();

            $table->foreign('conversation_id')
                ->references('id')->on('conversations')
                ->cascadeOnDelete();

            $table->foreign('sender_id')
                ->references('id')->on('users')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
