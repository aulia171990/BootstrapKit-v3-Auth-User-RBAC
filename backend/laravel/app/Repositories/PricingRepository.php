<?php

namespace App\Repositories;

use App\Models\PricingCalculationLog;

class PricingRepository
{
    public function create(array $data): PricingCalculationLog
    {
        return PricingCalculationLog::create($data);
    }

    public function log(array $payload): PricingCalculationLog
    {
        return $this->create($payload);
    }
}
