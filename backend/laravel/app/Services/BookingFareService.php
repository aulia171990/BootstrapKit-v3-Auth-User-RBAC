<?php

namespace App\Services;

use App\Models\Booking;
use App\Repositories\FareRepository;

class BookingFareService
{
    public function __construct(private FareRepository $fares) {}

    public function calculate(Booking $booking, array $context = []): array
    {
        return $this->fares->calculate(
            (float) $booking->estimated_distance,
            (int) $booking->estimated_duration,
            $context
        );
    }
}
