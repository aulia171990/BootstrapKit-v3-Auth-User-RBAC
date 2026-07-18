<?php

namespace App\Services;

use App\Events\BookingCreated;
use App\Jobs\StartDispatchJob;

class DispatchQueueBridge
{
    public function handleBookingCreated(BookingCreated $event): void
    {
        if (! config('dispatch.enabled', true)) {
            return;
        }

        if (! method_exists($event->booking, 'status')) {
            return;
        }

        $status = $event->booking->status;

        if (! in_array($status, (array) config('dispatch.eligible_statuses', ['searching']), true)) {
            return;
        }

        if (in_array($status, (array) config('dispatch.disabled_statuses', []), true)) {
            return;
        }

        StartDispatchJob::dispatch((string) $event->booking->getKey());
    }
}
