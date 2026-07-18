<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('trip_code')->unique();
            $table->uuid('booking_id')->nullable();
            $table->uuid('driver_id');
            $table->uuid('customer_id');
            $table->uuid('vehicle_id')->nullable();
            $table->uuid('dispatch_job_id')->nullable();
            $table->string('status')->index();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('arrived_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->float('estimated_distance')->nullable();
            $table->float('actual_distance')->nullable();
            $table->integer('estimated_duration')->nullable();
            $table->integer('actual_duration')->nullable();
            $table->float('estimated_fare')->nullable();
            $table->float('final_fare')->nullable();
            $table->integer('waiting_time')->nullable();
            $table->text('route_polyline')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('driver_id');
            $table->index('customer_id');
            $table->index('booking_id');
            $table->index('dispatch_job_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};