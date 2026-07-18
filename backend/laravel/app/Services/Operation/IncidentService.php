<?php

namespace App\Services\Operation;

use App\Events\Operation\IncidentCreated;
use App\Exceptions\Operation\OperationException;
use App\Jobs\Operation\NotifyOperationAlertJob;
use App\Models\Operation\OperationIncident;
use App\Repositories\Operation\OperationActionRepository;
use App\Repositories\Operation\OperationIncidentRepository;
use App\Services\Notification\NotificationService;
use Illuminate\Support\Facades\DB;

class IncidentService
{
    public function __construct(
        private OperationIncidentRepository $incidents,
        private OperationActionRepository $actions,
        private NotificationService $notifications,
    ) {}

    public function create(array $data): OperationIncident
    {
        return DB::transaction(function () use ($data) {
            $incident = $this->incidents->create($data);
            IncidentCreated::dispatch($incident);

            return $incident;
        });
    }

    public function update(string $incidentId, array $data, ?string $actorId = null): OperationIncident
    {
        $incident = $this->incidents->update($this->incidents, array_merge($data, ['assigned_to' => $actorId ?? $data['assigned_to']]));

        $this->actions->create([
            'incident_id' => $incidentId,
            'actor_id' => $actorId,
            'action' => $data['action'] ?? 'update',
            'notes' => $data['notes'] ?? null,
            'context' => $data,
        ]);

        return $incident;
    }
}
