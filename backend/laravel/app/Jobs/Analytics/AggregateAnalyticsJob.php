<?php

namespace App\Jobs\Analytics;

use App\Events\Analytics\AnalyticsAggregated;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AggregateAnalyticsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public string $date) {}

    public function handle(): void
    {
        if (class_exists(AnalyticsAggregated::class)) {
            AnalyticsAggregated::dispatch($this->date);
        }
    }
}
