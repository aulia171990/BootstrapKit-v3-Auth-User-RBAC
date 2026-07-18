<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_driver_management_endpoint_is_registered(): void
    {
        $admin = User::factory()->create(['email_verified' => true]);
        $admin->roles()->attach(\App\Models\Role::where('name', 'admin')->firstOrFail()->id);

        $response = $this->actingAs($admin)->get('/api/v1/admin/drivers');
        $response->assertStatus(200);
    }

    public function test_unauthorized_user_is_rejected(): void
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->get('/api/v1/admin/drivers');
        $response->assertStatus(403);
    }
}
