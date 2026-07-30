<?php

namespace App\Services\Admin;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DriverManagementService
{
    public function index(int $perPage = 20)
    {
        return \App\Models\Driver::with('user')->paginate($perPage);
    }

    public function approve(string $driverId): void
    {
        // Placeholder driver approval hook. Use existing DriverService when available.
        DB::transaction(function () use ($driverId) {
            // Example: update driver profile via repository/service if implemented.
        });
    }
}
