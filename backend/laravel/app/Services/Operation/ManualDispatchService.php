<?php

namespace App\Services\Operation;

use App\Jobs\Operation\NotifyOperationAlertJob;
use App\Models\Operation\OperationAction;
use App\Repositories\Operation\OperationActionRepository;
use Illuminate\Support\Facades\DB;

class ManualDispatchService
{
    public function __construct(
        private OperationActionRepository $actions,
    ) {}

    public function dispatch(array $payload, string $actorId): OperationAction
    {
        return DB::transaction(function () use ($payload, $actorId) {
            if (! empty($payload['booking_id'])) {
                app(\App\Services\DispatchService::class)->start(
                    \App\Models\Booking::findOrFail($payload['booking_id'])
                );
            }

            return $this->actions->create([
                'incident_id' => $payload['trip_id'] ?? null,
                'actor_id' => $actorId,
                'action' => 'manual_dispatch',
                'notes' => $payload['notes'] ?? null,
                'context' => $payload,
            ]);
        });
    }
}
