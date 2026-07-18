<?php

namespace App\Repositories;

use App\Models\PricingSurgeRule;

class SurgeRuleRepository
{
    public function create(array $data): PricingSurgeRule
    {
        return PricingSurgeRule::create($data);
    }

    public function findActive(string $city, ?string $serviceType, ?string $vehicleType, ?string $at = null): ?PricingSurgeRule
    {
        $query = PricingSurgeRule::query()
            ->where('city', $city)
            ->where('active', true)
            ->where(function ($q) use ($at) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $at ?? now());
            })->where(function ($q) use ($at) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $at ?? now());
            });

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

        return $query->orderByDesc('created_at')->first();
    }
}
