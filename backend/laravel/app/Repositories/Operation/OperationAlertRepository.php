<?php

namespace App\Repositories\Operation;

use App\Models\Operation\OperationAlert;

class OperationAlertRepository
{
    public function create(array $data): OperationAlert
    {
        return OperationAlert::create($data);
    }

    public function paginate(int $perPage = 50)
    {
        return OperationAlert::orderByDesc('created_at')->paginate($perPage);
    }
}
