<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $role = Role::create(['name' => 'admin']);
        foreach (['dashboard.view', 'driver.manage', 'driver.approve', 'driver.reject', 'driver.suspend'] as $code) {
            $perm = \App\Models\Permission::firstOrCreate(['code' => $code], ['code' => $code, 'name' => $code]);
            $role->permissions()->syncWithoutDetaching([$perm->id]);
        }

        $user = User::factory()->create(['email_verified' => true]);
        $user->roles()->attach($role->id);
        return $user;
    }

    public function test_driver_management_endpoint_is_registered(): void
    {
        $admin = $this->createAdminUser();
        $token = JWTAuth::fromUser($admin);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get('/api/v1/admin/drivers')
            ->assertStatus(200);
    }

    public function test_unauthorized_user_is_rejected(): void
    {
        $user = User::factory()->create(['email_verified' => true]);
        $token = JWTAuth::fromUser($user);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->get('/api/v1/admin/drivers')
            ->assertStatus(403);
    }
}
