<?php

namespace App\Services\Admin;

use App\Repositories\TripRepository;

class TripManagementService
{
    public function __construct(private TripRepository $trips) {}

    public function paginated(int $perPage = 20)
    {
        return $this->trips->paginate($perPage);
    }
}
