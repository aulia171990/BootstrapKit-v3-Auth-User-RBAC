<?php

namespace App\Services;

use App\Repositories\PricingLogRepository;
use App\Repositories\PricingRuleRepository;

class PricingAuditService
{
    public function __construct(
        private PricingRuleRepository $rules,
        private PricingLogRepository $logs,
    ) {}

    public function recentCalculations(array $filters = [], int $limit = 100)
    {
        return $this->logs->recent($filters, $limit);
    }
}
