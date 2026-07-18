<?php

namespace App\Services;

use App\Models\Booking;
use App\Repositories\BookingRepository;
use App\Repositories\BookingHistoryRepository;

class BookingHistoryService
{
    public function __construct(
        private BookingRepository $bookings,
        private BookingHistoryRepository $history,
    ) {}

    public function history(string $bookingId): array
    {
        $this->bookings->findOrFail($bookingId);

        return $this->history->forBooking($bookingId);
    }

    public function upcomingForCustomer(int $customerId): array
    {
        return $this->bookings->upcomingForCustomer($customerId);
    }
}
