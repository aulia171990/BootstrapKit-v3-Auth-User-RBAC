<?php

namespace App\Repositories;

use App\Models\PricingRule;

class PricingRuleRepository
{
    public function create(array $data): PricingRule
    {
        return PricingRule::create($data);
    }

    public function update(PricingRule $rule, array $data): PricingRule
    {
        $rule->update($data);

        return $rule->fresh();
    }

    public function findActive(string $city, ?string $serviceType, ?string $vehicleType, ?string $effectiveAt = null): ?PricingRule
    {
        $query = PricingRule::query()
            ->where('city', $city)
            ->where('active', true);

        if ($serviceType) {
            $query->where(function ($q) use ($serviceType) {
                $q->where('service_type', $serviceType)->orWhere('service_type', null);
            });
        }

        if ($vehicleType) {
            $query->where(function ($q) use ($vehicleType) {
                $q->where('vehicle_type', $vehicleType)->orWhere('vehicle_type', null);
            });
        }

        if ($effectiveAt) {
            $query->where(function ($q) use ($effectiveAt) {
                $q->whereNull('effective_from')->orWhere('effective_from', '<=', $effectiveAt);
            })->where(function ($q) use ($effectiveAt) {
                $q->whereNull('effective_until')->orWhere('effective_until', '>=', $effectiveAt);
            });
        }

        return $query->orderByDesc('created_at')->first();
    }
}
