<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('daily_customer_statistics')) {
            Schema::create('daily_customer_statistics', function (Blueprint $table) {
                $table->id();
                $table->date('stat_date')->index();
                $table->unsignedInteger('new_customers')->default(0);
                $table->unsignedInteger('active_customers')->default(0);
                $table->unsignedInteger('repeat_customers')->default(0);
                $table->decimal('average_spend', 12, 2)->nullable();
                $table->timestamps();

                $table->unique(['stat_date']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_customer_statistics');
    }
};
