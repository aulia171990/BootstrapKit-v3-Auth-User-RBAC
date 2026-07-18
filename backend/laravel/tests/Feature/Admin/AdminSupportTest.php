<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSupportTest extends TestCase
{
    use RefreshDatabase;

    public function test_support_endpoint_is_registered(): void
    {
        $admin = User::factory()->create(['email_verified' => true]);
        $admin->roles()->attach(\App\Models\Role::where('name', 'admin')->firstOrFail()->id);

        $response = $this->actingAs($admin)->get('/api/v1/admin/support/live-trips');
        $response->assertStatus(200);
    }
}
