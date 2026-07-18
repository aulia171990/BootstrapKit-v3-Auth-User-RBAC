<?php

namespace Tests\Feature\Api;

use App\Models\Api\ApiClient;
use App\Models\Api\ApiKey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class ApiGatewayTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate')->assertSuccessful();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
        app('cache')->flush();
    }

    private function bearer(string $token): static
    {
        return $this->withHeader('Authorization', 'Bearer ' . $token);
    }

    private function login(string $email = 'admin@ojol.test', string $password = 'password'): string
    {
        return $this->postJson('/api/v1/auth/login', [
            'email' => $email,
            'password' => $password,
        ])->json('data.token');
    }

    public function test_register_api_client_returns_success_envelope(): void
    {
        $token = $this->login();

        $response = $this->bearer($token)->postJson('/api/v1/api/clients', [
            'name' => 'Partner Alpha',
            'rate_limit' => 1000,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Partner Alpha');
    }

    public function test_issue_token_rejects_invalid_key(): void
    {
        $token = $this->login();

        $client = ApiClient::create([
            'name' => 'Partner X',
            'owner_id' => User::first()->id,
            'status' => 'active',
            'allowed_scopes' => ['orders.read'],
            'allowed_ips' => [],
            'rate_limit' => 1000,
        ]);

        $response = $this->bearer($token)->postJson('/api/v1/api/tokens', [
            'client_id' => $client->id,
            'key' => 'invalid-key',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }
}
