<?php

namespace App\Services;

use App\Repositories\BookingRepository;
use App\Repositories\BookingCancellationRepository;
use App\Repositories\BookingHistoryRepository;

class BookingCancellationService
{
    public function __construct(
        private BookingRepository $bookings,
        private BookingCancellationRepository $cancellations,
        private BookingHistoryRepository $history,
    ) {}

    public function cancel(string $bookingId, ?string $reason = null, ?string $cancelledBy = null): void
    {
        $booking = $this->bookings->findOrFail($bookingId);

        if (! $this->isCancellable($booking)) {
            throw new \InvalidArgumentException('Booking cannot be cancelled.');
        }

        $now = now();
        $this->cancellations->create([
            'booking_id' => $booking->id,
            'reason' => $reason,
            'cancelled_by' => $cancelledBy,
            'cancelled_at' => $now,
        ]);

        $this->bookings->update($booking, [
            'status' => \App\Models\Booking::STATUS_CANCELLED,
            'cancelled_at' => $now,
            'cancelled_by' => $cancelledBy,
            'notes' => $reason ?? $booking->notes,
        ]);

        $this->history->record($booking->id, \App\Models\Booking::STATUS_CANCELLED, 'Booking dibatalkan');
    }

    protected function isCancellable(\App\Models\Booking $booking): bool
    {
        return ! in_array($booking->status, [
            \App\Models\Booking::STATUS_COMPLETED,
            \App\Models\Booking::STATUS_CANCELLED,
            \App\Models\Booking::STATUS_EXPIRED,
        ], true);
    }
}
