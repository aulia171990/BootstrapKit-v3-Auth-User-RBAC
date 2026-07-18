<?php

namespace App\Services\Map;

use App\DTOs\Map\Coordinate;
use App\DTOs\Map\RouteRequest;
use App\Gateways\Map\MapProviderInterface;
use App\Gateways\Map\RouteResult;

class RoutingService
{
    public function __construct(private MapProviderInterface $provider) {}

    public function calculate(RouteRequest $request): RouteResult
    {
        $waypoints = [];
        foreach ($request->waypoints as $point) {
            $waypoints[] = ['lat' => $point->lat, 'lng' => $point->lng];
        }

        return $this->provider->calculateRoute($waypoints, $request->options);
    }

    public function encodePolyline(array $coordinates): string
    {
        $request = new RouteRequest(array_map(
            fn (array $c) => new Coordinate((float) $c['lat'], (float) $c['lng']),
            $coordinates,
        ));

        return $this->calculate($request)->polyline ?? '';
    }

    public function decodePolyline(string $polyline): array
    {
        if ($polyline === '') {
            return [];
        }

        $decoded = [];
        $index = 0;
        $lat = 0;
        $lng = 0;
        $length = strlen($polyline);

        while ($index < $length) {
            $lat += $this->decodeValue($polyline, $index);
            $lng += $this->decodeValue($polyline, $index);
            $decoded[] = ['lat' => $lat / 1e5, 'lng' => $lng / 1e5];
        }

        return $decoded;
    }

    private function decodeValue(string $polyline, int &$index): int
    {
        $result = 0;
        $shift = 0;
        $length = strlen($polyline);

        while ($index < $length) {
            $b = ord($polyline[$index++]) - 63;
            $result |= ($b & 0x1f) << $shift;
            $shift += 5;

            if ($b < 0x20) {
                break;
            }
        }

        return ($result & 1) ? ~($result >> 1) : ($result >> 1);
    }
}
