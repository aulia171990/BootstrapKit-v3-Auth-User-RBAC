<?php

namespace App\Services\Map;

use App\DTOs\Map\ETACalculationRequest;
use App\Gateways\Map\MapProviderInterface;

class ETAService
{
    public function __construct(private MapProviderInterface $provider) {}

    public function calculate(ETACalculationRequest $request): int
    {
        return $this->provider->calculateETA(
            $request->from->lat,
            $request->from->lng,
            $request->to->lat,
            $request->to->lng,
            $request->mode,
        );
    }
}
