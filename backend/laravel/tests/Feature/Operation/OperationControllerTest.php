<?php

namespace Tests\Feature\Operation;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OperationControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_returns_snapshot(): void
    {
        $admin = User::factory()->create(['email_verified' => true]);
        $admin->roles()->attach(Role::where('name', 'admin')->firstOrFail()->id);

        $response = $this->actingAs($admin)->get('/api/v1/operations/dashboard');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['active_trips', 'recent_alerts'],
            ]);
    }

    public function test_guest_cannot_access_dashboard(): void
    {
        $response = $this->get('/api/v1/operations/dashboard');
        $response->assertStatus(401);
    }

    public function test_incidents_are_paginated(): void
    {
        $admin = User::factory()->create(['email_verified' => true]);
        $admin->roles()->attach(Role::where('name', 'admin')->firstOrFail()->id);

        $response = $this->actingAs($admin)->get('/api/v1/operations/incidents');
        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_sos_endpoint_returns_active_sos(): void
    {
        $admin = User::factory()->create(['email_verified' => true]);
        $admin->roles()->attach(Role::where('name', 'admin')->firstOrFail()->id);

        $response = $this->actingAs($admin)->get('/api/v1/operations/sos');
        $response->assertStatus(200);
    }
}
