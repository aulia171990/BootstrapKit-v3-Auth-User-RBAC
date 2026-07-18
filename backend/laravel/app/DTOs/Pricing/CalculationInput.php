<?php

namespace App\DTOs\Pricing;

final class CalculationInput
{
    public function __construct(
        public string $city,
        public ?string $serviceType = null,
        public ?string $vehicleType = null,
        public float $distanceKm = 0,
        public int $durationMinutes = 0,
        public ?float $toll = null,
        public ?float $platformFee = null,
        public ?float $insuranceFee = null,
        public ?float $promoDiscount = null,
        public ?float $voucherDiscount = null,
        public ?float $taxAmount = null,
        public ?float $surgeMultiplierOverride = null,
        public ?string $bookingId = null,
        public ?string $tripId = null,
        public ?string $requestId = null,
        public ?string $airportCode = null,
        public ?string $pickupType = 'pickup',
        public int $waitingMinutes = 0,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            city: $data['city'],
            serviceType: $data['service_type'] ?? null,
            vehicleType: $data['vehicle_type'] ?? null,
            distanceKm: (float) ($data['distance_km'] ?? 0),
            durationMinutes: (int) ($data['duration_minutes'] ?? 0),
            toll: $data['toll'] ?? null,
            platformFee: $data['platform_fee'] ?? null,
            insuranceFee: $data['insurance_fee'] ?? null,
            promoDiscount: $data['promo_discount'] ?? null,
            voucherDiscount: $data['voucher_discount'] ?? null,
            taxAmount: $data['tax_amount'] ?? null,
            surgeMultiplierOverride: $data['surge_multiplier'] ?? null,
            bookingId: $data['booking_id'] ?? null,
            tripId: $data['trip_id'] ?? null,
            requestId: $data['request_id'] ?? null,
            airportCode: $data['airport_code'] ?? null,
            pickupType: $data['pickup_type'] ?? 'pickup',
            waitingMinutes: (int) ($data['waiting_minutes'] ?? 0),
        );
    }

    public function toContext(): array
    {
        return [
            'city' => $this->city,
            'service_type' => $this->serviceType,
            'vehicle_type' => $this->vehicleType,
            'distance_km' => $this->distanceKm,
            'duration_minutes' => $this->durationMinutes,
            'toll' => $this->toll,
            'platform_fee' => $this->platformFee,
            'insurance_fee' => $this->insuranceFee,
            'promo_discount' => $this->promoDiscount,
            'voucher_discount' => $this->voucherDiscount,
            'tax_amount' => $this->taxAmount,
            'distance_fare' => 0,
            'duration_fare' => 0,
            'surge_multiplier_override' => $this->surgeMultiplierOverride,
            'booking_id' => $this->bookingId,
            'trip_id' => $this->tripId,
            'request_id' => $this->requestId,
            'airport_code' => $this->airportCode,
            'pickup_type' => $this->pickupType,
            'waiting_minutes' => $this->waitingMinutes,
        ];
    }
}
