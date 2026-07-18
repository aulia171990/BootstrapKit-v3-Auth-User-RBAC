<?php

namespace App\DTOs\Trip;

final class CreateTripData
{
    public function __construct(
        public string $bookingId,
        public string $driverId,
        public ?string $customerId = null,
        public ?string $vehicleId = null,
        public ?string $dispatchJobId = null,
        public ?float $estimatedDistance = null,
        public ?int $estimatedDuration = null,
        public ?float $estimatedFare = null,
        public ?string $notes = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            (string) ($data['booking_id'] ?? ''),
            (string) ($data['driver_id'] ?? ''),
            (string) ($data['customer_id'] ?? ''),
            (string) ($data['vehicle_id'] ?? ''),
            (string) ($data['dispatch_job_id'] ?? ''),
            $data['estimated_distance'] ?? null,
            $data['estimated_duration'] ?? null,
            $data['estimated_fare'] ?? null,
            $data['notes'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'booking_id' => $this->bookingId,
            'driver_id' => $this->driverId,
            'customer_id' => $this->customerId,
            'vehicle_id' => $this->vehicleId,
            'dispatch_job_id' => $this->dispatchJobId,
            'estimated_distance' => $this->estimatedDistance,
            'estimated_duration' => $this->estimatedDuration,
            'estimated_fare' => $this->estimatedFare,
            'notes' => $this->notes,
        ];
    }
}