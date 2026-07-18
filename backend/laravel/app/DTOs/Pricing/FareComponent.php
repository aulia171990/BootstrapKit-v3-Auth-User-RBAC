<?php

namespace App\DTOs\Pricing;

final class FareComponent
{
    public function __construct(
        public string $code,
        public float $amount,
        public string $label,
    ) {}
}
