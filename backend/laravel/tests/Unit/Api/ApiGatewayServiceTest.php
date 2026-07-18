<?php

namespace Tests\Unit\Api;

use App\Exceptions\Api\ApiGatewayException;
use App\Repositories\Api\ApiClientRepository;
use App\Repositories\Api\ApiScopeRepository;
use App\Repositories\Api\ApiTokenRepository;
use App\Services\Api\OAuthService;
use App\Models\Api\ApiClient;
use App\Models\Api\ApiKey;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiGatewayServiceTest extends TestCase
{
    public function test_oauth_service_can_issue_token(): void
    {
        $client = app(ApiClientRepository::class)->create([
            'name' => 'Test client',
            'owner_id' => 1,
            'status' => 'active',
            'allowed_ips' => [],
            'allowed_scopes' => ['trips:read'],
            'rate_limit' => 100,
        ]);

        app(ApiKeyRepository::class)->create([
            'client_id' => $client->id,
            'prefix' => 'abcdef',
            'key_hash' => Hash::make('secret-key'),
            'status' => 'active',
        ]);

        $service = new OAuthService(
            app(\App\Repositories\Api\ApiKeyRepository::class),
            app(ApiClientRepository::class),
            app(ApiScopeRepository::class),
            app(ApiTokenRepository::class),
        );

        $token = $service->issueToken($client->id, 'secret-key', ['trips:read']);

        $this->assertNotNull($token->id);
        $this->assertSame(['trips:read'], $token->scopes);
    }

    public function test_issue_token_fails_with_invalid_client(): void
    {
        $this->expectException(ApiGatewayException::class);

        $service = new OAuthService(
            app(\App\Repositories\Api\ApiKeyRepository::class),
            app(ApiClientRepository::class),
            app(ApiScopeRepository::class),
            app(ApiTokenRepository::class),
        );

        $service->issueToken('missing', 'secret-key', []);
    }

    public function test_api_rate_limit_service_allows_under_limit(): void
    {
        $service = new \App\Services\Api\RateLimitService(
            app(\Illuminate\Contracts\Cache\Repository::class)
        );

        $this->assertTrue($service->allow('test-key', 5, 60));
    }
}
