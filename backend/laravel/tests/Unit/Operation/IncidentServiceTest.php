<?php

namespace Tests\Unit\Operation;

use App\Models\User;
use App\Repositories\Operation\OperationActionRepository;
use App\Repositories\Operation\OperationIncidentRepository;
use App\Services\Operation\IncidentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IncidentServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_incident(): void
    {
        $service = new IncidentService(
            new OperationIncidentRepository(),
            new OperationActionRepository(),
            new \App\Services\Notification\NotificationService(),
        );

        $incident = $service->create([
            'type' => 'sos',
            'priority' => 'high',
            'status' => 'open',
        ]);

        $this->assertNotNull($incident->id);
        $this->assertSame('sos', $incident->type);
    }
}
