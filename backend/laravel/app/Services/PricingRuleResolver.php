<?php

namespace App\Services;

use App\Models\PricingRule;
use App\Repositories\PricingRuleRepository;

class PricingRuleResolver
{
    public function resolve(string $city, ?string $serviceType, ?string $vehicleType, ?\DateTimeInterface $at = null): ?PricingRule
    {
        return app(PricingRuleRepository::class)->findActive(
            $city,
            $serviceType,
            $vehicleType,
            $at ? $at->format('Y-m-d H:i:s') : null,
        );
    }
}
