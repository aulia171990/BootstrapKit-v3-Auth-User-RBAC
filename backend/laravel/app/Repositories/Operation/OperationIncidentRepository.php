<?php

namespace App\Repositories\Operation;

use App\Models\Operation\OperationIncident;
use Illuminate\Cache\CacheManager;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OperationIncidentRepository
{
    public function __construct(private CacheManager $cache) {}

    public function create(array $data): OperationIncident
    {
        return OperationIncident::create($data);
    }

    public function find(string $id): ?OperationIncident
    {
        return OperationIncident::find($id);
    }

    public function update(OperationIncident $incident, array $data): OperationIncident
    {
        $incident->fill($data);
        $incident->save();

        return $incident;
    }

    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = OperationIncident::query();

        foreach ($filters as $key => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            $query->where($key, $value);
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }
}
