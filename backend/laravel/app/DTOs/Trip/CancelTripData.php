<?php

namespace App\DTOs\Trip;

final class CancelTripData
{
    public function __construct(
        public ?string $reason = null,
    ) {}

    public static function fromRequest($request): self
    {
        return new self($request->input('reason'));
    }
}