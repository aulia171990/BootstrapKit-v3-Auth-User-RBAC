<?php

namespace App\Repositories;

use App\Models\TripEvent;

class TripEventRepository
{
    public function create(array $data): TripEvent
    {
        return TripEvent::create($data);
    }
}