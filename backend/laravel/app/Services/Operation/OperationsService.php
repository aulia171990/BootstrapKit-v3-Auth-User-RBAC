<?php

namespace App\Services\Operation;

class OperationsService
{
    public function __construct(
        private ?IncidentService $incidents = null,
        private ?SOSService $sos = null,
        private ?ManualDispatchService $manualDispatch = null,
        private ?LiveMonitorService $monitor = null,
    ) {
        $this->incidents ??= app(IncidentService::class);
        $this->sos ??= app(SOSService::class);
        $this->manualDispatch ??= app(ManualDispatchService::class);
        $this->monitor ??= app(LiveMonitorService::class);
    }

    public function dashboard(): array
    {
        return $this->monitor->snapshot();
    }

    public function incidents(array $filters, int $perPage = 20)
    {
        return app(\App\Repositories\Operation\OperationIncidentRepository::class)->paginate($filters, $perPage);
    }

    public function actions(string $incidentId)
    {
        return app(\App\Repositories\Operation\OperationActionRepository::class)->byIncident($incidentId);
    }

    public function alerts(int $perPage = 50)
    {
        return app(\App\Repositories\Operation\OperationAlertRepository::class)->paginate($perPage);
    }
}
