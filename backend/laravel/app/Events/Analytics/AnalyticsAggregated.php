<?php

namespace App\Events\Analytics;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AnalyticsAggregated
{
    use Dispatchable, SerializesModels;

    public function __construct(public string $date) {}
}
