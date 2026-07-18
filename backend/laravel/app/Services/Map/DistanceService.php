<?php

namespace App\Services\Map;

use App\DTOs\Map\DistanceMatrixRequest;
use App\Gateways\Map\DistanceMatrixResult;
use App\Gateways\Map\MapProviderInterface;

class DistanceService
{
    public function __construct(private MapProviderInterface $provider) {}

    public function matrix(DistanceMatrixRequest $request): DistanceMatrixResult
    {
        $origins = [];
        foreach ($request->origins as $point) {
            $origins[] = ['lat' => $point->lat, 'lng' => $point->lng];
        }

        $destinations = [];
        foreach ($request->destinations as $point) {
            $destinations[] = ['lat' => $point->lat, 'lng' => $point->lng];
        }

        return $this->provider->distanceMatrix($origins, $destinations, $request->options);
    }
}
