<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Isolated in-memory SQLite: migrate + seed roles + demo user.
        $this->artisan('migrate')->assertSuccessful();
        $this->seed(\Database\Seeders\RoleSeeder::class);

        if (! User::where('email', 'demo@example.com')->exists()) {
            $customer = Role::firstOrCreate(['name' => 'customer'], [
                'description' => 'Pengguna yang memesan layanan',
            ]);
            $user = User::create([
                'name'     => 'Demo User',
                'email'    => 'demo@example.com',
                'phone'    => '6281000000000',
                'password' => Hash::make('password'),
                'status'   => 1,
            ]);
            $user->roles()->attach($customer->id);
        }
    }

    public function test_login_endpoint_exists(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'demo@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => ['token', 'token_type', 'expires_in'],
        ]);
    }
}
