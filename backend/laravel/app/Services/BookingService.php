<?php

namespace App\Services;

use App\Events\BookingCancelled;
use App\Events\BookingCompleted;
use App\Events\BookingCreated;
use App\Events\BookingExpired;
use App\Events\BookingScheduled;
use App\Events\BookingUpdated;
use App\Models\Booking;
use App\Repositories\BookingRepository;
use App\Repositories\BookingHistoryRepository;
use App\Services\DispatchQueueBridge;
use Illuminate\Support\Facades\Queue;

class BookingService
{
    public function __construct(
        private BookingRepository $bookings,
        private BookingHistoryRepository $history,
        private ?DispatchQueueBridge $dispatch = null,
    ) {}

    public function create(array $data, int $customerId): Booking
    {
        $booking = $this->bookings->create(array_merge($data, ['customer_id' => $customerId]));
        $this->history->record($booking->id, Booking::STATUS_DRAFT, 'Booking dibuat');

        BookingCreated::dispatch($booking);

        if ($this->dispatch && config('dispatch.enabled', true)) {
            Queue::connection('database')->push(new \App\Jobs\StartDispatchJob((string) $booking->getKey()));
        }

        return $booking;
    }

    public function update(Booking $booking, array $data): Booking
    {
        $booking = $this->bookings->update($booking, $data);
        $this->history->record($booking->id, $booking->status, 'Booking diperbarui');
        BookingUpdated::dispatch($booking);

        return $booking;
    }

    public function cancel(Booking $booking, ?string $reason = null, ?string $cancelledBy = null): Booking
    {
        $this->assertCancellable($booking);

        $now = now();
        $booking = $this->bookings->cancel($booking, $reason, $cancelledBy, $now);

        $this->history->record($booking->id, Booking::STATUS_CANCELLED, 'Booking dibatalkan');
        BookingCancelled::dispatch($booking);

        return $booking;
    }

    public function schedule(Booking $booking, \DateTimeInterface $scheduledAt): Booking
    {
        if ($scheduledAt->getTimestamp() <= now()->getTimestamp()) {
            throw new \InvalidArgumentException('Scheduled booking cannot be in the past.');
        }

        $booking = $this->bookings->update($booking, [
            'scheduled_at' => $scheduledAt,
            'status' => Booking::STATUS_SCHEDULED,
        ]);

        $this->history->record($booking->id, Booking::STATUS_SCHEDULED, 'Booking dijadwalkan');
        BookingScheduled::dispatch($booking);

        return $booking;
    }

    public function expire(Booking $booking): Booking
    {
        $booking = $this->bookings->update($booking, [
            'status' => Booking::STATUS_EXPIRED,
        ]);

        $this->history->record($booking->id, Booking::STATUS_EXPIRED, 'Booking expired');
        BookingExpired::dispatch($booking);

        return $booking;
    }

    public function complete(Booking $booking): Booking
    {
        $booking = $this->bookings->complete($booking);

        $this->history->record($booking->id, Booking::STATUS_COMPLETED, 'Booking completed');
        BookingCompleted::dispatch($booking);

        return $booking;
    }

    protected function assertCancellable(Booking $booking): void
    {
        if (in_array($booking->status, [
            Booking::STATUS_COMPLETED,
            Booking::STATUS_CANCELLED,
            Booking::STATUS_EXPIRED,
        ], true)) {
            throw new \InvalidArgumentException('Booking cannot be cancelled.');
        }
    }
}
