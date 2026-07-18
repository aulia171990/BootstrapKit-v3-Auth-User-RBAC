<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Api\ApiClientService;
use App\Services\Api\ApiKeyService;
use App\Services\Api\WebhookService;
use App\Services\Api\OAuthService;
use Illuminate\Http\Request;

class ApiGatewayController extends Controller
{
    public function __construct(
        private ApiClientService $clients,
        private ApiKeyService $apiKeys,
        private WebhookService $webhooks,
        private OAuthService $oauth,
    ) {}

    public function clients(): array
    {
        return \App\Models\Api\ApiClient::all()->toArray();
    }

    public function createClient(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'allowed_scopes' => ['nullable', 'array'],
            'allowed_ips' => ['nullable', 'array'],
            'rate_limit' => ['nullable', 'integer', 'min:1'],
            'owner_id' => ['nullable', 'integer'],
        ]);

        $ownerId = $validated['owner_id'] ?? $request->user()->id;

        $client = $this->clients->create($validated, $ownerId);

        return ApiResponse::success($client, 'API client created', 201);
    }

    public function createKey(Request $request)
    {
        $validated = $request->validate([
            'client_id' => ['required', 'string'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $key = $this->apiKeys->create($validated);

        return ApiResponse::success($key, 'API key created', 201);
    }

    public function webhooks(): array
    {
        return \App\Models\Api\ApiWebhook::all()->toArray();
    }

    public function createWebhook(Request $request)
    {
        $validated = $request->validate([
            'client_id' => ['required', 'string'],
            'url' => ['required', 'url'],
            'events' => ['required', 'array'],
            'secret' => ['nullable', 'string'],
        ]);

        $webhook = $this->webhooks->register($validated['client_id'], $validated);

        return ApiResponse::success($webhook, 'Webhook created', 201);
    }

    public function issueToken(Request $request)
    {
        $validated = $request->validate([
            'client_id' => ['required', 'string'],
            'key' => ['required', 'string'],
            'scopes' => ['nullable', 'array'],
        ]);

        try {
            $token = $this->oauth->issueToken(
                $validated['client_id'],
                $validated['key'],
                $validated['scopes'] ?? []
            );
        } catch (\App\Exceptions\Api\ApiGatewayException $e) {
            return ApiResponse::error($e->getMessage(), 401);
        }

        return ApiResponse::success($token, 'Token issued', 201);
    }
}
