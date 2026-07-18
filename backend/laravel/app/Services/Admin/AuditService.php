<?php

namespace App\Services\Admin;

use App\Models\AuditLog;

class AuditService
{
    public function paginated(int $perPage = 20, ?string $action = null)
    {
        $query = AuditLog::query()->orderByDesc('created_at');

        if ($action) {
            $query->where('action', $action);
        }

        return $query->paginate($perPage);
    }
}
