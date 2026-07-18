<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_devices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');

            // Client-supplied stable identifier (e.g. a device UUID the app
            // persists). Lets the same physical device reconnect without
            // spawning a new row every login.
            $table->string('device_id', 191);

            $table->string('platform', 64)->nullable();   // ios | android | web
            $table->string('ip_address', 45)->nullable();
            $text = $table->text('user_agent');           // ->text() = no length
            $text->nullable();

            // SHA-256 of the opaque refresh token issued for THIS device/session.
            // Lets us revoke the user_devices row together with its refresh token.
            $table->string('refresh_token', 64)->nullable()->index();

            $table->timestamp('last_seen')->nullable();
            $table->timestamp('revoked_at')->nullable();

            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            // One active row per (user, device_id).
            $table->unique(['user_id', 'device_id'], 'user_devices_user_device_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_devices');
    }
};
