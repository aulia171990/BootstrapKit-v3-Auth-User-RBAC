<?php

namespace App\DTOs\Map;

final class DistanceMatrixRequest
{
    /**
     * @param array<int, Coordinate> $origins
     * @param array<int, Coordinate> $destinations
     */
    public function __construct(
        public array $origins,
        public array $destinations,
        public ?array $options = null,
    ) {}
}
