<?php

namespace Tests\Feature\Customer;

use App\Models\Customer\CustomerProfile;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class CustomerFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate')->assertSuccessful();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
        app('cache')->flush();
    }

    private function actingAsCustomer(): User
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::where('name', 'customer')->first()->id);
        CustomerProfile::create([
            'user_id' => $user->id,
            'verification_status' => 'pending',
            'status' => 'active',
            'referral_code' => strtoupper(\Illuminate\Support\Str::random(6)),
        ]);
        return $user;
    }

    private function token(User $user): string
    {
        return JWTAuth::fromUser($user);
    }

    public function test_customer_can_read_profile(): void
    {
        $user = $this->actingAsCustomer();
        $this->withHeader('Authorization', 'Bearer ' . $this->token($user))
            ->getJson('/api/v1/customer/profile')
            ->assertStatus(200)
            ->assertJsonPath('data.user_id', (string) $user->id);
    }

    public function test_customer_can_update_profile(): void
    {
        $user = $this->actingAsCustomer();
        $this->withHeader('Authorization', 'Bearer ' . $this->token($user))
            ->putJson('/api/v1/customer/profile', [
                'display_name' => 'Customer Test',
                'language' => 'id',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.display_name', 'Customer Test');
    }

    public function test_customer_can_create_and_list_addresses(): void
    {
        $user = $this->actingAsCustomer();
        $token = $this->token($user);
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/customer/addresses', [
                'label' => 'home',
                'address' => 'Jl. Test 1',
                'city' => 'Jakarta',
                'is_default' => true,
            ])->assertStatus(201);
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/customer/addresses')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_customer_can_create_favorite_place(): void
    {
        $user = $this->actingAsCustomer();
        $this->withHeader('Authorization', 'Bearer ' . $this->token($user))
            ->postJson('/api/v1/customer/favorites', [
                'name' => 'Office',
                'address' => 'Jl. Office 1',
                'type' => 'office',
                'latitude' => -6.1,
                'longitude' => 106.8,
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.name', 'Office');
    }

    public function test_customer_can_update_preferences(): void
    {
        $user = $this->actingAsCustomer();
        $this->withHeader('Authorization', 'Bearer ' . $this->token($user))
            ->putJson('/api/v1/customer/preferences', [
                'preferred_vehicle' => 'car',
                'air_conditioning' => true,
                'pet_friendly' => true,
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.preferred_vehicle', 'car');
    }
}
