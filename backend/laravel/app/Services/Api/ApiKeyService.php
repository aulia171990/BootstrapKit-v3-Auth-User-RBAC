<?php

namespace App\Services\Api;

use App\Models\Api\ApiKey;
use App\Repositories\Api\ApiKeyRepository;
use App\Events\Api\ApiKeyRotated;
use Illuminate\Support\Facades\Hash;

class ApiKeyService
{
    public function __construct(private ApiKeyRepository $keys) {}

    public function create(array $data): ApiKey
    {
        $plain = hash('sha256', (string) Str::random(40));

        return $this->keys->create([
            'api_client_id' => $data['api_client_id'],
            'hashed_secret' => Hash::make($plain),
            'prefix' => substr($plain, 0, 8),
            'scopes' => $data['scopes'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'is_active' => true,
        ]);
    }

    public function rotate(string $keyId): ApiKey
    {
        $key = ApiKey::where('id', $keyId)->firstOrFail();
        $plain = hash('sha256', (string) Str::random(40));

        $key->update([
            'hashed_secret' => Hash::make($plain),
            'prefix' => substr($plain, 0, 8),
            'is_active' => true,
        ]);

        event(new ApiKeyRotated($key));

        return $key;
    }
}
