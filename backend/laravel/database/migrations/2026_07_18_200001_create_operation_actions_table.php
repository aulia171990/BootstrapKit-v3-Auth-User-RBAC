<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('operation_actions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('incident_id')->nullable()->index();
            $table->uuid('actor_id')->index();
            $table->string('action'); // manual_dispatch, reassign_driver, cancel_trip, pause_dispatch, resume_dispatch, force_offline, acknowledge, escalate, resolve
            $table->text('notes')->nullable();
            $table->json('context')->nullable();
            $table->timestamps();

            $table->foreign('incident_id')->references('id')->on('operation_incidents')->cascadeOnDelete();
            $table->foreign('actor_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('operation_actions');
    }
};
