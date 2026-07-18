<?php

namespace App\Services\Api;

use App\Repositories\Api\ApiClientRepository;
use App\Repositories\Api\ApiKeyRepository;
use App\Repositories\Api\ApiScopeRepository;
use App\Repositories\Api\ApiTokenRepository;
use App\Repositories\Api\ApiWebhookRepository;
use App\Exceptions\Api\ApiGatewayException;
use App\Events\Api\ApiClientCreated;
use App\Events\Api\WebhookDeliveryFailed;

class ApiGatewayService
{
    public function __construct(
        private ApiClientRepository $clients,
        private ApiKeyRepository $keys,
        private ApiScopeRepository $scopes,
        private ApiTokenRepository $tokens,
        private ApiWebhookRepository $webhooks,
        private ApiClientService $clientService,
        private OAuthService $oauth,
        private WebhookService $webhookService,
    ) {}

    public function registerClient(array $data, int $ownerId)
    {
        return $this->clientService->create($data, $ownerId);
    }

    public function authorizeClient(string $clientId, string $rawKey = '', array $scopes = [])
    {
        return $this->oauth->issueToken($clientId, $rawKey, $scopes);
    }

    public function metrics(string $clientId): array
    {
        return [
            'client_id' => $clientId,
            'requests_today' => 0,
            'errors_today' => 0,
        ];
    }

    public function webhookRegister(string $clientId, array $data)
    {
        return $this->webhookService->register($clientId, $data);
    }
}
