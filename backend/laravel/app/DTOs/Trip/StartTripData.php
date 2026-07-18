<?php

namespace App\DTOs\Trip;

final class StartTripData
{
    public function __construct(
        public ?string $note = null,
        public ?float $odometerStart = null,
    ) {}

    public static function fromRequest($request): self
    {
        return new self(
            $request->input('note'),
            $request->input('odometer_start'),
        );
    }
}