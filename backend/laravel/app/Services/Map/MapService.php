<?php

namespace App\Services\Map;

use App\Gateways\Map\MapProviderInterface;

class MapService
{
    public function __construct(
        private GeocodingService $geocoding,
        private RoutingService $routing,
        private DistanceService $distance,
        private ETAService $eta,
    ) {}

    public function geocoding(): GeocodingService
    {
        return $this->geocoding;
    }

    public function routing(): RoutingService
    {
        return $this->routing;
    }

    public function distance(): DistanceService
    {
        return $this->distance;
    }

    public function eta(): ETAService
    {
        return $this->eta;
    }
}
