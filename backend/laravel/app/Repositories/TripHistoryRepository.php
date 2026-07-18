<?php

namespace App\Repositories;

use App\Models\TripStatusHistory;

class TripHistoryRepository
{
    public function create(array $data): TripStatusHistory
    {
        return TripStatusHistory::create($data);
    }
}