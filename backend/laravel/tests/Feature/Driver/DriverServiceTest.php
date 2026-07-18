<?php

namespace Tests\Feature\Driver;

use App\Models\Driver;
use App\Models\User;
use App\Repositories\DriverDocumentRepository;
use App\Repositories\DriverRepository;
use App\Repositories\DriverStatusHistoryRepository;
use App\Repositories\VehicleRepository;
use App\Services\DriverLocationService;
use App\Services\DriverService;
use App\Services\DriverVerificationService;
use App\Services\VehicleAssignmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DriverServiceTest extends TestCase
{
    use RefreshDatabase;

    private function approvedDriver(array $overrides = []): Driver
    {
        $user = User::factory()->create(['status' => User::STATUS_ACTIVE]);

        return Driver::create(array_merge([
            'user_id' => $user->id,
            'status' => Driver::STATUS_PENDING,
            'verification_status' => Driver::STATUS_PENDING,
        ], $overrides));
    }

    public function test_approve_sets_status_and_history(): void
    {
        $driver = $this->approvedDriver();
        $service = new DriverService(
            new DriverRepository(),
            new DriverStatusHistoryRepository(),
            new VehicleRepository()
        );

        $approved = $service->approve($driver, $driver->user_id);

        $this->assertSame(Driver::STATUS_APPROVED, $approved->status);
        $this->assertSame(Driver::STATUS_APPROVED, $approved->verification_status);
    }

    public function test_rejected_driver_cannot_go_online(): void
    {
        $driver = $this->approvedDriver(['status' => Driver::STATUS_REJECTED, 'verification_status' => Driver::STATUS_REJECTED]);
        $service = new DriverService(
            new DriverRepository(),
            new DriverStatusHistoryRepository(),
            new VehicleRepository()
        );

        $this->expectException(\InvalidArgumentException::class);
        $service->goOnline($driver);
    }

    public function test_suspended_driver_cannot_go_online(): void
    {
        $driver = $this->approvedDriver(['status' => Driver::STATUS_SUSPENDED, 'verification_status' => Driver::STATUS_APPROVED]);
        $service = new DriverService(
            new DriverRepository(),
            new DriverStatusHistoryRepository(),
            new VehicleRepository()
        );

        $this->expectException(\InvalidArgumentException::class);
        $service->goOnline($driver);
    }

    public function test_driver_location_rejects_unapproved_driver(): void
    {
        $driver = $this->approvedDriver(['status' => Driver::STATUS_PENDING, 'verification_status' => Driver::STATUS_PENDING]);
        $service = new DriverLocationService(
            new DriverRepository(),
            new DriverDocumentRepository(),
            new \App\Repositories\LocationRepository()
        );

        $this->expectException(\InvalidArgumentException::class);
        $service->recordLocation($driver->id, 1.0, 1.0);
    }
}
