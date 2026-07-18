<?php

namespace App\Jobs;

use App\Models\Booking;
use App\Services\DispatchService;

class StartDispatchJob
{
    /**
     * @param array<string,mixed> $context
     */
    public function __construct(
        public string $bookingId,
        public array $context = [],
    ) {}

    public function handle(DispatchService $dispatch): void
    {
        $booking = Booking::findOrFail($this->bookingId);

        $dispatch->start($booking, $this->context);
    }
}
