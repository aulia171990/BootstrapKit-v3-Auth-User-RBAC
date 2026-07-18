<?php

namespace App\Gateways\Map;

final class RouteResult
{
    public function __construct(
        public bool $success,
        public ?string $polyline,
        public ?array $legs = null,
        public ?int $distanceMeters = null,
        public ?int $durationSeconds = null,
        public ?string $summary = null,
        public ?array $raw = null,
        public ?string $failureReason = null,
    ) {}
}
