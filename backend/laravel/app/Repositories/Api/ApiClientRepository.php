<?php

namespace App\Repositories\Api;

use App\Models\Api\ApiClient;

class ApiClientRepository
{
    public function create(array $data): ApiClient
    {
        return ApiClient::create($data);
    }

    public function find(string $id): ?ApiClient
    {
        return ApiClient::find($id);
    }

    public function findActive(string $id): ?ApiClient
    {
        return ApiClient::where('id', $id)->where('is_active', true)->first();
    }
}
