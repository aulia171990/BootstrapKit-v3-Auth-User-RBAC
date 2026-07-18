<?php

namespace App\DTOs\Trip;

final class SOSData
{
    public function __construct(
        public ?string $note = null,
    ) {}

    public static function fromRequest($request): self
    {
        return new self($request->input('note'));
    }
}