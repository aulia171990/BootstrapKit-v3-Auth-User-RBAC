<?php

namespace App\Jobs;

use App\Services\DriverMatchingService;

class SendDriverOffer
{
    public function __construct(
        public string $dispatchJobId,
        public string $driverId,
    ) {}

    public function handle(DriverMatchingService $matcher): void
    {
        $matcher->sendOffer($this->dispatchJobId, $this->driverId);
    }
}
