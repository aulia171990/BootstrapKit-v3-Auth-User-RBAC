<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class AdminSupportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    public function test_support_endpoint_is_registered(): void
    {
        $admin = User::where('email', 'admin@ojol.test')->first();
        $token = JWTAuth::fromUser($admin);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get('/api/v1/admin/support/live-trips')
            ->assertStatus(200);
    }
}
