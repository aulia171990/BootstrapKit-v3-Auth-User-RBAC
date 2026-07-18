<?php

namespace App\Services;

use App\Models\PricingAirportRule;

class AirportFeeService
{
    public function resolve(?string $airportCode, string $city, string $type = 'pickup'): array
    {
        if (! $airportCode) {
            return ['fee' => 0, 'type' => $type];
        }

        $rule = PricingAirportRule::query()
            ->where('city', $city)
            ->where('airport_code', $airportCode)
            ->where('active', true)
            ->first();

        if (! $rule) {
            return ['fee' => 0, 'type' => $type];
        }

        $field = match ($type) {
            'dropoff' => 'dropoff_fee',
            default => 'pickup_fee',
        };

        return [
            'fee' => (float) ($rule->$field ?? 0),
            'type' => $type,
            'airport_code' => $airportCode,
        ];
    }
}
