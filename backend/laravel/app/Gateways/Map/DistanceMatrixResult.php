<?php

namespace App\Gateways\Map;

final class DistanceMatrixResult
{
    public function __construct(
        public bool $success,
        public array $rows,
        public ?array $raw = null,
        public ?string $failureReason = null,
    ) {}
}
