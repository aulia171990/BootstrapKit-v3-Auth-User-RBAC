<?php

namespace App\Repositories;

use App\Models\Booking;

class BookingRepository
{
    public function create(array $data): Booking
    {
        return Booking::create($data);
    }

    public function findOrFail(string $id): Booking
    {
        return Booking::findOrFail($id);
    }

    public function update(Booking $booking, array $data): Booking
    {
        $booking->forceFill($data)->save();

        return $booking->fresh();
    }

    public function cancel(Booking $booking, ?string $reason, ?string $cancelledBy, $cancelledAt): Booking
    {
        $booking->forceFill([
            'status' => Booking::STATUS_CANCELLED,
            'cancelled_at' => $cancelledAt,
            'cancelled_by' => $cancelledBy,
            'notes' => $reason ?? $booking->notes,
        ])->save();

        return $booking->fresh();
    }

    public function complete(Booking $booking): Booking
    {
        $booking->forceFill([
            'status' => Booking::STATUS_COMPLETED,
            'completed_at' => now(),
            'final_fare' => $booking->final_fare ?? $booking->estimated_fare,
        ])->save();

        return $booking->fresh();
    }

    public function upcomingForCustomer(int $customerId): array
    {
        return Booking::where('customer_id', $customerId)
            ->whereIn('status', [
                Booking::STATUS_DRAFT,
                Booking::STATUS_SEARCHING_DRIVER,
                Booking::STATUS_DRIVER_ASSIGNED,
                Booking::STATUS_DRIVER_ACCEPTED,
                Booking::STATUS_DRIVER_ARRIVED,
                Booking::STATUS_PASSENGER_ONBOARD,
                Booking::STATUS_IN_PROGRESS,
                Booking::STATUS_SCHEDULED,
            ])
            ->orderByDesc('requested_at')
            ->get()
            ->all();
    }
}
