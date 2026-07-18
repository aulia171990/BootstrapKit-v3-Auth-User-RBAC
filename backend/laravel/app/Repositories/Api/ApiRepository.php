<?php

namespace App\Repositories\Api;

use Illuminate\Database\Eloquent\Model;

class ApiRepository
{
    public function create(string $model, array $data): Model
    {
        return $model::create($data);
    }

    public function find(string $model, string $id): ?Model
    {
        return $model::find($id);
    }

    public function query(string $model)
    {
        return $model::query();
    }
}
