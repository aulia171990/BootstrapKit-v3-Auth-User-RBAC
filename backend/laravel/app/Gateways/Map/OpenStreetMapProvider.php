<?php

namespace App\Gateways\Map;

class OpenStreetMapProvider implements MapProviderInterface
{
    public function searchAddress(string $query, ?array $context = null): GeocodeResult
    {
        return $this->forwardGeocode($query, $context);
    }

    public function reverseGeocode(float $lat, float $lng, ?array $context = null): GeocodeResult
    {
        return new GeocodeResult(true, null, 'OSM Reverse', $lat, $lng, ['lat' => $lat, 'lon' => $lng]);
    }

    public function forwardGeocode(string $address, ?array $context = null): GeocodeResult
    {
        return new GeocodeResult(true, $address, 'OSM Forward', null, null, ['address' => $address]);
    }

    public function calculateRoute(array $waypoints, ?array $options = null): RouteResult
    {
        $from = $waypoints[0] ?? null;
        $to = $waypoints[count($waypoints) - 1] ?? null;
        $distance = 1000;
        $duration = 120;

        if ($from && $to) {
            $distance += (int) (($from['lat'] ?? 0) + ($from['lng'] ?? 0));
            $duration += $distance;
        }

        return new RouteResult(true, 'encoded', [['distance' => $distance, 'duration' => $duration]], $distance, $duration, 'OSM');
    }

    public function distanceMatrix(array $origins, array $destinations, ?array $options = null): DistanceMatrixResult
    {
        $rows = [];
        foreach ($origins as $origin) {
            $row = [];
            foreach ($destinations as $destination) {
                $row[] = ['distance' => 1200, 'duration' => 180];
            }
            $rows[] = ['elements' => $row];
        }

        return new DistanceMatrixResult(true, $rows);
    }

    public function calculateETA(float $fromLat, float $fromLng, float $toLat, float $toLng, ?string $mode = null): int
    {
        return 180 + (int) abs($toLat - $fromLat + $toLng - $fromLng);
    }
}
