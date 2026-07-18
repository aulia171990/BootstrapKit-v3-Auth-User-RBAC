<?php

namespace App\Repositories;

use App\Models\TripLocation;

class TripLocationRepository
{
    public function create(array $data): TripLocation
    {
        return TripLocation::create($data);
    }
}