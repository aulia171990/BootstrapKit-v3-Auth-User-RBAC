<?php

namespace Tests\Feature\Notification;

use App\Models\Notification\Notification;
use App\Models\Notification\NotificationPreference;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate')->assertSuccessful();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    private function actingAsAuthorizedUser(): User
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::where('name', 'customer')->first()->id);

        return $user;
    }

    private function token(User $user): string
    {
        return JWTAuth::fromUser($user);
    }

    public function test_user_can_list_notifications(): void
    {
        $user = $this->actingAsAuthorizedUser();
        Notification::create(['user_id' => $user->id, 'type' => 'in_app', 'title' => 'Test']);

        $this->withHeader('Authorization', 'Bearer ' . $this->token($user))
            ->getJson('/api/v1/notification/notifications')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.items');
    }

    public function test_user_can_get_unread_count(): void
    {
        $user = $this->actingAsAuthorizedUser();
        Notification::create(['user_id' => $user->id, 'type' => 'in_app', 'title' => 'A']);
        Notification::create(['user_id' => $user->id, 'type' => 'in_app', 'title' => 'B', 'read_at' => now()]);

        $this->withHeader('Authorization', 'Bearer ' . $this->token($user))
            ->getJson('/api/v1/notification/notifications/unread')
            ->assertStatus(200)
            ->assertJsonPath('data.unread_count', 1);
    }

    public function test_user_can_mark_single_read(): void
    {
        $user = $this->actingAsAuthorizedUser();
        $notification = Notification::create(['user_id' => $user->id, 'type' => 'in_app', 'title' => 'A']);

        $this->withHeader('Authorization', 'Bearer ' . $this->token($user))
            ->postJson('/api/v1/notification/notifications/read', ['notification_id' => $notification->id])
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertNotNull(Notification::find($notification->id)->read_at);
    }

    public function test_user_can_mark_all_read(): void
    {
        $user = $this->actingAsAuthorizedUser();
        Notification::create(['user_id' => $user->id, 'type' => 'in_app', 'title' => 'A']);
        Notification::create(['user_id' => $user->id, 'type' => 'in_app', 'title' => 'B']);

        $this->withHeader('Authorization', 'Bearer ' . $this->token($user))
            ->postJson('/api/v1/notification/notifications/read-all')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertEquals(0, Notification::where('user_id', $user->id)->whereNull('read_at')->count());
    }

    public function test_preferences_can_be_updated(): void
    {
        $user = $this->actingAsAuthorizedUser();
        NotificationPreference::create(['user_id' => $user->id, 'channel' => 'in_app', 'enabled' => true]);

        $this->withHeader('Authorization', 'Bearer ' . $this->token($user))
            ->putJson('/api/v1/notification/preferences', [
                'preferences' => [
                    ['channel' => 'in_app', 'enabled' => false],
                ],
            ])->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('notification_preferences', [
            'user_id' => $user->id,
            'channel' => 'in_app',
            'enabled' => false,
        ]);
    }
}
