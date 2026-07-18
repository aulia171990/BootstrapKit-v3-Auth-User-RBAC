<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('driver_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // KTP, SIM, STNK, SKCK, profile_photo, selfie_verification, insurance
            $table->string('verification_status')->default('pending'); // pending, approved, rejected
            $table->string('file_path')->nullable();
            $table->date('expiry_date')->nullable();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['driver_id', 'type', 'verification_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_documents');
    }
};
