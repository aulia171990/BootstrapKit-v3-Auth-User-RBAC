<?php

namespace App\Jobs;

use App\Services\DispatchRetryService;

class HandleDriverResponse
{
    public function __construct(
        public string $dispatchJobId,
        public string $driverId,
        public string $response,
    ) {}

    public function handle(DispatchRetryService $retry): void
    {
        $retry->recordResponse($this->dispatchJobId, $this->driverId, $this->response);
    }
}
