<?php

namespace App\Services;

use App\Repositories\SurgeRuleRepository;

class SurgePricingService
{
    public function __construct(private SurgeRuleRepository $surgeRules) {}

    public function currentMultiplier(string $city, ?string $serviceType, ?string $vehicleType): array
    {
        $rule = $this->surgeRules->findActive($city, $serviceType, $vehicleType, now()->toDateTimeString());

        return [
            'active' => (bool) $rule,
            'type' => $rule?->type,
            'multiplier' => $rule ? min((float) $rule->multiplier, (float) ($rule->max_multiplier ?? $rule->multiplier)) : 1.0,
        ];
    }
}
