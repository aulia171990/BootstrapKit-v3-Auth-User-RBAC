<?php

namespace Tests\Feature\Driver;

use App\Models\AuditLog;
use App\Models\Driver;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class DriverFeatureTest extends TestCase
{
    use RefreshDatabase;

    private function createAdminUser(): User
    {
        $role = Role::create(['name' => 'admin']);
        foreach (['dashboard.view', 'driver.manage', 'driver.view', 'driver.approve', 'driver.reject', 'driver.suspend'] as $code) {
            $perm = \App\Models\Permission::firstOrCreate(['code' => $code], ['code' => $code, 'name' => $code]);
            $role->permissions()->syncWithoutDetaching([$perm->id]);
        }

        $user = User::factory()->create(['email_verified' => true]);
        $user->roles()->attach($role->id);
        return $user;
    }

    private function createDriverUser(): User
    {
        $role = Role::create(['name' => 'driver']);
        foreach (['order.accept', 'driver.location'] as $code) {
            $perm = \App\Models\Permission::firstOrCreate(['code' => $code], ['code' => $code, 'name' => $code]);
            $role->permissions()->syncWithoutDetaching([$perm->id]);
        }

        $user = User::factory()->create(['email_verified' => true]);
        $user->roles()->attach($role->id);
        return $user;
    }

    public function test_admin_can_list_drivers(): void
    {
        $admin = $this->createAdminUser();
        $token = JWTAuth::fromUser($admin);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/drivers')
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    public function test_driver_cannot_approve_driver(): void
    {
        $driver = $this->createDriverUser();
        $token = JWTAuth::fromUser($driver);

        // Create a driver profile for the admin user so the approval endpoint
        // has a target to act on.
        $targetUser = User::factory()->create();
        $target = Driver::create([
            'user_id' => $targetUser->id,
            'status' => 'pending',
            'verification_status' => 'pending',
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/drivers/' . $target->id . '/approve')
            ->assertStatus(403);
    }

    public function test_admin_can_approve_driver(): void
    {
        $target = Driver::create([
            'user_id' => User::factory()->create()->id,
            'status' => 'pending',
            'verification_status' => 'pending',
        ]);

        $admin = $this->createAdminUser();
        $token = JWTAuth::fromUser($admin);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/drivers/' . $target->id . '/approve', ['note' => 'ok'])
            ->assertStatus(200)
            ->assertJsonPath('data.verification_status', 'approved');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'driver_approved',
            'context->driver_id' => $target->id,
        ]);
    }

    public function test_admin_can_reject_driver(): void
    {
        $target = Driver::create([
            'user_id' => User::factory()->create()->id,
            'status' => 'pending',
            'verification_status' => 'pending',
        ]);

        $admin = $this->createAdminUser();
        $token = JWTAuth::fromUser($admin);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/drivers/' . $target->id . '/reject', ['note' => 'dokumen kurang'])
            ->assertStatus(200)
            ->assertJsonPath('data.verification_status', 'rejected');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'driver_rejected',
            'context->driver_id' => $target->id,
        ]);
    }

    public function test_admin_can_suspend_driver(): void
    {
        $target = Driver::create([
            'user_id' => User::factory()->create()->id,
            'status' => 'pending',
            'verification_status' => 'pending',
        ]);

        $admin = $this->createAdminUser();
        $token = JWTAuth::fromUser($admin);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/drivers/' . $target->id . '/suspend', ['note' => 'melanggar SOP'])
            ->assertStatus(200)
            ->assertJsonPath('data.verification_status', 'suspended');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'driver_suspended',
            'context->driver_id' => $target->id,
        ]);
    }

    public function test_owner_can_go_online_and_offline(): void
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $target = Driver::create([
            'user_id' => $user->id,
            'verification_status' => 'approved',
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/drivers/' . $target->id . '/online')
            ->assertStatus(200);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/drivers/' . $target->id . '/offline')
            ->assertStatus(200);
    }

    public function test_owner_can_upload_document(): void
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $target = Driver::create(['user_id' => $user->id]);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/drivers/' . $target->id . '/documents', [
                'type' => 'license',
                'file_path' => '/tmp/license.png',
                'expiry_date' => now()->addYear()->toDateString(),
            ])->assertStatus(201);

        $this->assertDatabaseHas('driver_documents', [
            'driver_id' => $target->id,
            'type' => 'license',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'document_uploaded',
            'context->driver_id' => $target->id,
        ]);
    }

    public function test_driver_can_get_own_profile(): void
    {
        $user = User::factory()->create(['email_verified' => true]);
        $token = JWTAuth::fromUser($user);

        $driver = Driver::create([
            'user_id' => $user->id,
            'status' => 'active',
            'verification_status' => 'approved',
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/driver/profile')
            ->assertStatus(200)
            ->assertJsonPath('data.id', $driver->id)
            ->assertJsonStructure(['success', 'data' => ['id', 'user', 'status']]);
    }

    public function test_driver_profile_returns_404_when_no_driver_record(): void
    {
        $user = User::factory()->create(['email_verified' => true]);
        $token = JWTAuth::fromUser($user);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/driver/profile')
            ->assertStatus(404)
            ->assertJsonPath('message', 'Profil driver belum dibuat');
    }

    public function test_driver_can_update_own_profile(): void
    {
        $user = User::factory()->create(['email_verified' => true]);
        $token = JWTAuth::fromUser($user);

        $driver = Driver::create([
            'user_id' => $user->id,
            'status' => 'active',
            'verification_status' => 'approved',
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/driver/profile', [
                'license_plate' => 'B 1234 XYZ',
                'vehicle_type' => 'motor',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.license_plate', 'B 1234 XYZ');

        $this->assertDatabaseHas('drivers', [
            'id' => $driver->id,
            'license_plate' => 'B 1234 XYZ',
            'vehicle_type' => 'motor',
        ]);
    }

    public function test_driver_profile_requires_authentication(): void
    {
        $this->getJson('/api/v1/driver/profile')
            ->assertStatus(401);

        $this->putJson('/api/v1/driver/profile', ['license_plate' => 'B 1234 XYZ'])
            ->assertStatus(401);
    }
}
