<?php

namespace App\Services\Map;

use App\DTOs\Map\MapSearchRequest;
use App\Gateways\Map\GeocodeResult;
use App\Gateways\Map\MapProviderInterface;

class GeocodingService
{
    public function __construct(private MapProviderInterface $provider) {}

    public function search(MapSearchRequest $request): GeocodeResult
    {
        return $this->provider->searchAddress($request->query, $request->context);
    }

    public function reverse(float $lat, float $lng): GeocodeResult
    {
        return $this->provider->reverseGeocode($lat, $lng);
    }

    public function forward(string $address): GeocodeResult
    {
        return $this->provider->forwardGeocode($address);
    }
}
