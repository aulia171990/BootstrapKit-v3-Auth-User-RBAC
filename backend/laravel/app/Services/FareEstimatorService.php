<?php

namespace App\Services;

use App\DTOs\Pricing\CalculationInput;

class FareEstimatorService
{
    public function __construct(private PricingEngineService $engine) {}

    public function estimate(array $payload): array
    {
        $input = CalculationInput::fromArray($payload);

        return $this->engine->estimate($input)->toArray();
    }
}
