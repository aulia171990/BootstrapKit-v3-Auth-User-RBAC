<?php

namespace App\DTOs\Map;

final class RouteRequest
{
    /**
     * @param array<int, Coordinate> $waypoints
     */
    public function __construct(
        public array $waypoints,
        public ?array $options = null,
    ) {}
}
