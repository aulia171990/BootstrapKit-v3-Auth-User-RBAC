<?php

namespace App\Gateways\Map;

interface MapProviderInterface
{
    public function searchAddress(string $query, ?array $context = null): GeocodeResult;

    public function reverseGeocode(float $lat, float $lng, ?array $context = null): GeocodeResult;

    public function forwardGeocode(string $address, ?array $context = null): GeocodeResult;

    public function calculateRoute(array $waypoints, ?array $options = null): RouteResult;

    public function distanceMatrix(array $origins, array $destinations, ?array $options = null): DistanceMatrixResult;

    public function calculateETA(float $fromLat, float $fromLng, float $toLat, float $toLng, ?string $mode = null): int;
}
