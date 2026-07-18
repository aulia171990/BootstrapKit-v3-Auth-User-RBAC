<?php

namespace Tests\Unit\Api;

use App\Exceptions\Api\ApiGatewayException;
use App\Repositories\Api\ApiClientRepository;
use App\Repositories\Api\ApiKeyRepository;
use App\Repositories\Api\ApiScopeRepository;
use App\Repositories\Api\ApiTokenRepository;
use App\Services\Api\OAuthService;
use App\Models\User;
use App\Models\Api\ApiClient;
use App\Models\Api\ApiKey;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiGatewayServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate')->assertSuccessful();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    public function test_api_client_repository_can_persist_and_find_active_client(): void
    {
        $repo = app(ApiClientRepository::class);
        $client = $repo->create([
            'name' => 'Unit client',
            'user_id' => User::first()->id,
            'status' => 'active',
            'allowed_scopes' => ['trips:read'],
            'allowed_ips' => ['127.0.0.1'],
            'rate_limit' => 100,
        ]);

        $this->assertSame('active', $client->status);

        $found = $repo->findActive($client->id);
        $this->assertNotNull($found);
        $this->assertSame($client->id, $found->id);
    }

    public function test_oauth_service_throws_for_missing_client(): void
    {
        $this->expectException(ApiGatewayException::class);

        $service = new OAuthService(
            app(ApiKeyRepository::class),
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
