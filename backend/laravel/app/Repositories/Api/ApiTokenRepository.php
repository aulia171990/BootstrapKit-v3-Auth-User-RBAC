<?php

namespace App\Repositories\Api;

use App\Models\Api\ApiToken;

class ApiTokenRepository
{
    public function create(array $data): ApiToken
    {
        return ApiToken::create($data);
    }

    public function find(string $id): ?ApiToken
    {
        return ApiToken::find($id);
    }

    public function findActiveForApiKey(string $apiKeyId): ?ApiToken
    {
        return ApiToken::where('api_key_id', $apiKeyId)
            ->whereNull('expires_at')
            ->orderByDesc('last_used_at')
            ->first();
    }

    public function update(string $id, array $data): ApiToken
    {
        $token = ApiToken::where('id', $id)->firstOrFail();
        $token->update($data);

        return $token;
    }
}
