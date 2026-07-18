<?php

namespace App\DTOs\Map;

final class ETACalculationRequest
{
    public function __construct(
        public Coordinate $from,
        public Coordinate $to,
        public ?string $mode = 'driving',
    ) {}
}
