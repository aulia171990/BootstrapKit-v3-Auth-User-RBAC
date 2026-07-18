<?php

namespace App\Services\Api;

use App\Models\Api\ApiClient;
use App\Models\Api\ApiKey;
use App\Models\Api\ApiToken;
use App\Repositories\Api\ApiKeyRepository;
use App\Repositories\Api\ApiClientRepository;
use App\Repositories\Api\ApiScopeRepository;
use App\Repositories\Api\ApiTokenRepository;
use App\Exceptions\Api\ApiGatewayException;
use App\Events\Api\ApiKeyRotated;
use Illuminate\Support\Facades\Hash;

class OAuthService
{
    public function __construct(
        private ApiKeyRepository $keys,
        private ApiClientRepository $clients,
        private ApiScopeRepository $scopes,
        private ApiTokenRepository $tokens,
    ) {}

    public function issueToken(string $clientId, string $rawKey, array $scopes = []): ApiToken
    {
        $client = $this->clients->findActive($clientId);

        if (! $client) {
            throw ApiGatewayException::invalidApiKey();
        }

        $key = ApiKey::where('api_client_id', $clientId)
            ->whereHas('client', fn ($q) => $q->where('is_active', true))
            ->where('is_active', true)
            ->first();

        if (! $key || ! Hash::check($rawKey, $key->hashed_secret)) {
            throw ApiGatewayException::invalidApiKey();
        }

        return $this->tokens->create([
            'api_key_id' => $key->id,
            'tokenable_type' => $client->type,
            'tokenable_id' => $client->id,
            'abilities' => $scopes,
            'expires_at' => now()->addHours(2),
        ]);
    }

    public function rotateKey(string $keyId): void
    {
        $key = $this->keys->markRevoked($keyId, ['is_active' => false]);

        if ($key) {
            event(new ApiKeyRotated($key));
        }
    }
}
