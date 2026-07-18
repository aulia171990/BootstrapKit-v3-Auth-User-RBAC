<?php

namespace App\DTOs\Map;

final class MapSearchRequest
{
    public function __construct(
        public string $query,
        public ?array $context = null,
    ) {}
}
