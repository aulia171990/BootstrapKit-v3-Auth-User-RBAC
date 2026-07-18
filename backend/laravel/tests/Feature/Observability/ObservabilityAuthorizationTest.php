<?php

namespace Tests\Feature\Observability;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class ObservabilityAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private function ensureBaseline(): void
    {
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            ['description' => 'Pengelola sistem']
        );

        $permission = Permission::firstOrCreate(
            ['code' => 'observability.metrics'],
            ['name' => 'View Metrics', 'module' => 'observability']
        );

        $adminRole->permissions()->syncWithoutDetaching([$permission->id]);
    }

    private function actingAsApi(User $user): self
    {
        return $this->withHeader('Authorization', 'Bearer '.JWTAuth::fromUser($user));
    }

    public function test_metrics_endpoint_requires_authentication(): void
    {
        $this->ensureBaseline();

        $response = $this->get('/api/v1/metrics');

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_metrics_endpoint_requires_authorization(): void
    {
        $this->ensureBaseline();
        $user = User::factory()->create(['email_verified' => true]);

        $this->actingAsApi($user)->get('/api/v1/metrics')
            ->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_metrics_endpoint_allows_authorized_user(): void
    {
        $this->ensureBaseline();
        $admin = User::factory()->create(['email_verified' => true]);
        $admin->roles()->attach(Role::where('name', 'admin')->firstOrFail()->id);

        $this->actingAsApi($admin)->get('/api/v1/metrics')
            ->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
