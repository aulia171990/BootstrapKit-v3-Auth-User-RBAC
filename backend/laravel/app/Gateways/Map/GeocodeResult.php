<?php

namespace App\Gateways\Map;

final class GeocodeResult
{
    public function __construct(
        public bool $success,
        public ?string $query,
        public ?string $displayName,
        public ?float $lat,
        public ?float $lng,
        public ?array $addressComponents = null,
        public ?array $raw = null,
        public ?string $failureReason = null,
    ) {}
}
