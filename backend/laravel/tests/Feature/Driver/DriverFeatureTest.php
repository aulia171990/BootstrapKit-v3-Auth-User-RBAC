<?php

namespace Tests\Feature\Driver;

use App\Models\AuditLog;
use App\Models\Driver;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PermissionSeeder::class);
    }

    public function test_admin_can_list_drivers(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test',
            'password' => 'password',
        ])->json('data.token');

        $this->withHeader('Authorization', 'Bearer ' . $login)
            ->getJson('/api/v1/drivers')
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    public function test_driver_cannot_approve_driver(): void
    {
        $driver = User::factory()->create();
        $driver->roles()->attach(Role::where('name', 'driver')->first()->id);
        $token = $this->postJson('/api/v1/auth/login', [
            'email' => $driver->email,
            'password' => 'password',
        ])->json('data.token');

        $target = Driver::create([
            'user_id' => User::factory()->create()->id,
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

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test',
            'password' => 'password',
        ])->json('data.token');

        $this->withHeader('Authorization', 'Bearer ' . $login)
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

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test',
            'password' => 'password',
        ])->json('data.token');

        $this->withHeader('Authorization', 'Bearer ' . $login)
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

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test',
            'password' => 'password',
        ])->json('data.token');

        $this->withHeader('Authorization', 'Bearer ' . $login)
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
        $token = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->json('data.token');

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
        $token = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->json('data.token');

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
}
