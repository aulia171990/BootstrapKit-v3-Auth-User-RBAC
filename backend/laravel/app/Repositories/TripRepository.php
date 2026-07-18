<?php

namespace App\Repositories;

use App\Models\Trip;

class TripRepository
{
    public function create(array $data): Trip
    {
        return Trip::create($data);
    }

    public function findOrFail(string $id): Trip
    {
        return Trip::findOrFail($id);
    }

    public function update(Trip $trip, array $data): Trip
    {
        $trip->fill($data);
        $trip->save();

        return $trip;
    }

    public function paginate(int $perPage = 20): \Illuminate\Pagination\LengthAwarePaginator
    {
        return Trip::query()->orderByDesc('created_at')->paginate($perPage);
    }
}