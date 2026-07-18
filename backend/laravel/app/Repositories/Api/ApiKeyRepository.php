<?php

namespace App\Repositories\Api;

use App\Models\Api\ApiKey;

class ApiKeyRepository
{
    public function create(array $data): ApiKey
    {
        return ApiKey::create($data);
    }

    public function findActive(string $id): ?ApiKey
    {
        return ApiKey::where('id', $id)->where('is_active', true)->first();
    }

    public function findByIdAndHash(string $id, string $keyHash): ?ApiKey
    {
        return ApiKey::where('id', $id)->where('hashed_secret', $keyHash)->first();
    }

    public function markRevoked(string $id, array $data): int
    {
        return ApiKey::where('id', $id)->update($data);
    }
}
