<?php

namespace App\Repositories;

use App\Models\PricingCalculationLog;

class PricingLogRepository
{
    public function create(array $data): PricingCalculationLog
    {
        return PricingCalculationLog::create($data);
    }

    public function log(array $data): PricingCalculationLog
    {
        return $this->create($data);
    }

    public function recent(array $filters = [], int $limit = 100)
    {
        return PricingCalculationLog::query()
            ->when($filters['booking_id'] ?? null, fn ($q, $v) => $q->where('booking_id', $v))
            ->when($filters['trip_id'] ?? null, fn ($q, $v) => $q->where('trip_id', $v))
            ->when($filters['pricing_rule_id'] ?? null, fn ($q, $v) => $q->where('pricing_rule_id', $v))
            ->orderByDesc('calculated_at')
            ->limit($limit)
            ->get();
    }
}
