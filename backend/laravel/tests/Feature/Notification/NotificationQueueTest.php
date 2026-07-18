<?php

namespace Tests\Feature\Notification;

use App\Jobs\Notification\BulkDispatchJob;
use App\Jobs\Notification\EnqueueDeliveryJob;
use App\Models\Notification\Notification;
use App\Models\Notification\NotificationDelivery;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class NotificationQueueTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate')->assertSuccessful();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    public function test_enqueue_delivery_job_updates_status(): void
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::where('name', 'customer')->first()->id);
        $notification = Notification::create(['user_id' => $user->id, 'type' => 'in_app', 'title' => 'X']);

        $delivery = NotificationDelivery::create([
            'notification_id' => $notification->id,
            'channel' => 'in_app',
        ]);

        EnqueueDeliveryJob::dispatch((string) $delivery->id, (string) $notification->id, 'in_app');

        $this->assertDatabaseHas('notification_deliveries', [
            'id' => $delivery->id,
            'status' => 'delivered',
        ]);
    }

    public function test_bulk_dispatch_enqueues_for_multiple(): void
    {
        $notifications = [
            Notification::create(['user_id' => User::factory()->create()->id, 'type' => 'in_app', 'title' => 'A']),
            Notification::create(['user_id' => User::factory()->create()->id, 'type' => 'in_app', 'title' => 'B']),
        ];

        BulkDispatchJob::dispatch($notifications);

        $this->assertEquals(2, NotificationDelivery::count());
    }
}
