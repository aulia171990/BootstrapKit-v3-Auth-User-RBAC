<?php

namespace App\DTOs\Map;

final class Coordinate
{
    public function __construct(
        public float $lat,
        public float $lng,
    ) {}
}
