<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->string('driver_code')->nullable()->after('user_id');
            $table->string('verification_status')->default('pending')->after('driver_code');
            $table->integer('completed_trips')->default(0)->after('verification_status');
            $table->integer('cancelled_trips')->default(0)->after('completed_trips');
            $table->float('acceptance_rate')->nullable()->after('cancelled_trips');
            $table->string('online_status')->nullable()->after('acceptance_rate');
            $table->timestamp('last_online_at')->nullable()->after('online_status');

            $table->index('verification_status');
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropIndex(['verification_status']);
            $table->dropColumn([
                'driver_code',
                'verification_status',
                'completed_trips',
                'cancelled_trips',
                'acceptance_rate',
                'online_status',
                'last_online_at',
            ]);
        });
    }
};
