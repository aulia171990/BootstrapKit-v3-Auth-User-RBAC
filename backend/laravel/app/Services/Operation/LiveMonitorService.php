<?php

namespace App\Services\Operation;

use App\Models\Trip;
use App\Repositories\Operation\OperationIncidentRepository;
use App\Repositories\Operation\OperationAlertRepository;
use Illuminate\Cache\CacheManager;
use Illuminate\Support\Facades\Cache;

class LiveMonitorService
{
    public function __construct(
        private CacheManager $cache,
        private OperationIncidentRepository $incidents,
        private OperationAlertRepository $alerts,
    ) {}

    public function snapshot(): array
    {
        $key = 'operations:live:snapshot';

        return Cache::remember($key, 30, function () {
            return [
                'active_trips' => Trip::whereIn('status', ['assigned', 'accepted', 'in_progress'])->count(),
                'recent_alerts' => $this->alerts->paginate(20)->toArray(),
            ];
        });
    }
}
