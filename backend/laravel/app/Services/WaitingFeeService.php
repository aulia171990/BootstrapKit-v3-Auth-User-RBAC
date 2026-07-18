<?php

namespace App\Services;

use App\Models\PricingWaitingRule;
use App\Repositories\PricingRuleRepository;

class WaitingFeeService
{
    public function __construct(private PricingRuleRepository $rules) {}

    public function calculate(string $city, ?string $serviceType, ?string $vehicleType, int $waitingMinutes): array
    {
        $rule = PricingWaitingRule::query()
            ->where('city', $city)
            ->where('active', true)
            ->when($serviceType, fn ($q) => $q->where('service_type', $serviceType)->orWhere('service_type', null))
            ->when($vehicleType, fn ($q) => $q->where('vehicle_type', $vehicleType)->orWhere('vehicle_type', null))
            ->orderByDesc('created_at')
            ->first();

        $freeMinutes = $rule?->free_minutes ?? 0;
        $perMinuteRate = (float) ($rule?->per_minute_rate ?? 0);
        $maxFee = $rule?->max_fee;

        $billable = max(0, $waitingMinutes - $freeMinutes);
        $fee = (float) round($billable * $perMinuteRate, 2);
        $finalFee = $maxFee !== null ? min($fee, (float) $maxFee) : $fee;

        return [
            'waiting_minutes' => $waitingMinutes,
            'free_minutes' => $freeMinutes,
            'billable_minutes' => $billable,
            'per_minute_rate' => $perMinuteRate,
            'fee' => $finalFee,
        ];
    }
}
