<?php

namespace App\Repositories;

use App\Models\BookingCancellation;

class BookingCancellationRepository
{
    public function create(array $data): BookingCancellation
    {
        return BookingCancellation::create($data);
    }
}
