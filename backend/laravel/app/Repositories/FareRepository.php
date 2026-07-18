<?php

namespace App\Repositories;

use App\DTOs\Pricing\CalculationInput;
use App\Models\BookingFare;

class FareRepository
{
    public function create(array $data): BookingFare
    {
        return BookingFare::create($data);
    }

    public function calculate(float $distanceKm, int $durationMinutes, array $context = []): array
    {
        $engine = app(PricingEngineService::class);

        $input = CalculationInput::fromArray(array_merge([
            'city' => $context['city'] ?? 'default',
            'service_type' => $context['service_type'] ?? null,
            'vehicle_type' => $context['vehicle_type'] ?? null,
            'distance_km' => $distanceKm,
            'duration_minutes' => $durationMinutes,
        ], $context));

        return $engine->estimate($input)->toArray();
    }
}
