<?php

namespace Tests\Feature\Pricing;

use App\Models\PricingRule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class PricingControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_estimate_requires_permission(): void
    {
        $response = $this->postJson('/api/v1/pricing/estimate', [
            'city' => 'jakarta',
            'distance_km' => 2,
            'duration_minutes' => 10,
        ]);

        $response->assertStatus(401);
    }

    public function test_rules_list_returns_paginated_rules(): void
    {
        foreach (range(1, 3) as $i) {
            \App\Models\PricingRule::create([
                'city' => 'jakarta',
                'base_fare' => 10000,
                'minimum_fare' => 15000,
                'per_km_rate' => 3500,
                'per_minute_rate' => 500,
                'currency' => 'IDR',
                'active' => true,
            ]);
        }

        $user = $this->adminUser();
        $token = JWTAuth::fromUser($user);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/pricing/rules');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'meta']);
    }

    private function adminUser(): \App\Models\User
    {
        $user = \App\Models\User::factory()->create();
        $adminRole = \App\Models\Role::where('name', 'admin')->first();
        if ($adminRole) {
            $user->roles()->attach($adminRole->id);
        }

        return $user;
    }
}
