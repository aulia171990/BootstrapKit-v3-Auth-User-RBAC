<?php

namespace App\Repositories;

use App\Models\DriverAssignment;

class AssignmentRepository
{
    public function create(array $data): DriverAssignment
    {
        return DriverAssignment::create($data);
    }

    public function findByBookingId(string $bookingId): ?DriverAssignment
    {
        return DriverAssignment::where('booking_id', $bookingId)->first();
    }

    public function update(DriverAssignment $assignment, array $data): DriverAssignment
    {
        $assignment->forceFill($data)->save();

        return $assignment->fresh();
    }
}
