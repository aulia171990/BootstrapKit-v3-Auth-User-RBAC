<?php

namespace App\Services\Analytics;

use App\Jobs\Analytics\AggregateAnalyticsJob;
use Illuminate\Support\Facades\Date;

class AggregationService
{
    public function runDaily(?string $date = null): void
    {
        $date = $date ? Date::parse($date)->toDateString() : now()->subDay()->toDateString();
        AggregateAnalyticsJob::dispatch($date);
    }
}
