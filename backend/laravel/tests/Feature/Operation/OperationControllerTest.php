<?php

namespace Tests\Feature\Operation;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class OperationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    public function test_dashboard_returns_snapshot(): void
    {
        $admin = User::where('email', 'admin@ojol.test')->first();
        $token = JWTAuth::fromUser($admin);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get('/api/v1/operations/dashboard')
            ->assertStatus(200)
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
        $admin = User::where('email', 'admin@ojol.test')->first();
        $token = JWTAuth::fromUser($admin);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get('/api/v1/operations/incidents')
            ->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_sos_endpoint_returns_active_sos(): void
    {
        $admin = User::where('email', 'admin@ojol.test')->first();
        $token = JWTAuth::fromUser($admin);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get('/api/v1/operations/sos')
            ->assertStatus(200);
    }
}
