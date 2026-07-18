<?php

namespace App\Services\Operation;

use App\Jobs\Operation\NotifyOperationAlertJob;
use App\Repositories\Operation\OperationAlertRepository;
use App\Repositories\Operation\OperationIncidentRepository;

class SOSService
{
    public function __construct(
        private OperationIncidentRepository $incidents,
        private OperationAlertRepository $alerts,
    ) {}

    public function listActive(): array
    {
        return $this->incidents->paginate(['type' => 'sos', 'status' => 'open'])->toArray();
    }

    public function acknowledge(string $incidentId, ?string $acknowledgedBy = null): void
    {
        $incident = $this->incidents->update($incidentId, [
            'status' => 'acknowledged',
            'acknowledged_at' => now(),
        ] + ($acknowledgedBy ? ['assigned_to' => $acknowledgedBy] : []));
    }
}
