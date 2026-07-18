<?php

namespace App\DTOs\Trip;

final class CompleteTripData
{
    public function __construct(
        public ?float $actualDistance = null,
        public ?int $actualDuration = null,
        public ?float $finalFare = null,
        public ?string $note = null,
    ) {}

    public static function fromRequest($request): self
    {
        return new self(
            $request->input('actual_distance'),
            $request->input('actual_duration'),
            $request->input('final_fare'),
            $request->input('note'),
        );
    }
}