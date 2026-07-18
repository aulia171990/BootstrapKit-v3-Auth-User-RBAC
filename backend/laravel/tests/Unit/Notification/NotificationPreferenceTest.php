<?php

namespace Tests\Unit\Notification;

use App\Models\User;
use App\Repositories\Notification\NotificationPreferenceRepository;
use App\Services\Notification\NotificationPreferenceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationPreferenceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate')->assertSuccessful();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    public function test_notification_preferences_can_be_managed(): void
    {
        $user = User::factory()->create();
        $service = new NotificationPreferenceService(new NotificationPreferenceRepository());
        $service->upsert((string) $user->id, 'email', true);
        $service->upsert((string) $user->id, 'sms', false, ['phone_number' => '628']);

        $this->assertEquals([
            ['channel' => 'email', 'enabled' => true, 'settings' => null],
            ['channel' => 'sms', 'enabled' => false, 'settings' => ['phone_number' => '628']],
        ], $service->all((string) $user->id));
    }
}
