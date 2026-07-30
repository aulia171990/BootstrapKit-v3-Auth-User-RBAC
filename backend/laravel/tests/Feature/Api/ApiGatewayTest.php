<?php

namespace Tests\Feature\Api;

use App\Models\Api\ApiClient;
use App\Models\Permission;
use App\Models\Role;
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
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
        app('cache')->flush();
    }

    private function actingAsGatewayUser(): User
    {
        $user = User::factory()->create();
        $role = Role::where('name', 'admin')->firstOrCreate(['name' => 'admin']);
        $permission = Permission::where('code', 'api.manage')->first();
        if (! $permission) {
            $permission = Permission::create(['code' => 'api.manage', 'name' => 'Manage API Gateway', 'group' => 'api']);
            $role->permissions()->attach($permission->id);
        }
        $user->roles()->attach($role->id);

        return $user;
    }

    private function token(User $user): string
    {
        return JWTAuth::fromUser($user);
    }

    public function test_register_api_client_returns_success_envelope(): void
    {
        $user = $this->actingAsGatewayUser();
        $token = $this->token($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/gateway/clients', [
                'name' => 'Partner Alpha',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Partner Alpha');
    }

    public function test_issue_token_rejects_invalid_key(): void
    {
        $user = $this->actingAsGatewayUser();
        $token = $this->token($user);

        $client = ApiClient::create([
            'name' => 'Partner X',
            'user_id' => $user->id,
            'is_active' => true,
            'allowed_scopes' => ['orders.read'],
            'allowed_ips' => [],
            'rate_limit' => 1000,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/gateway/oauth/token', [
                'client_id' => (string) $client->id,
                'key' => 'invalid-key',
            ]);

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }
}
