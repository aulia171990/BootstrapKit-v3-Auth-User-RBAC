<?php

namespace App\Repositories;

use App\Models\BookingStatusHistory;

class BookingHistoryRepository
{
    public function record(string $bookingId, string $status, ?string $note = null): BookingStatusHistory
    {
        return BookingStatusHistory::create([
            'booking_id' => $bookingId,
            'status' => $status,
            'note' => $note,
        ]);
    }

    public function forBooking(string $bookingId): array
    {
        return BookingStatusHistory::where('booking_id', $bookingId)
            ->orderByDesc('created_at')
            ->get()
            ->all();
    }
}
