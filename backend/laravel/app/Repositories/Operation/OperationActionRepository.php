<?php

namespace App\Repositories\Operation;

use App\Models\Operation\OperationAction;

class OperationActionRepository
{
    public function create(array $data): OperationAction
    {
        return OperationAction::create($data);
    }

    public function byIncident(string $incidentId)
    {
        return OperationAction::where('incident_id', $incidentId)->orderByDesc('created_at')->get();
    }
}
