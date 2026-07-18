<?php

namespace App\Services;

use App\Models\PricingTollRule;

class TollFeeService
{
    public function total(array $tollGateCodes, string $city): array
    {
        $rules = PricingTollRule::query()
            ->where('city', $city)
            ->where('active', true)
            ->whereIn('road_or_gate', $tollGateCodes)
            ->get();

        $total = 0;
        foreach ($rules as $rule) {
            $total += (float) $rule->amount;
        }

        return [
            'toll_count' => count($tollGateCodes),
            'matched_count' => $rules->count(),
            'total' => (float) round($total, 2),
            'items' => $rules->map(fn ($r) => [
                'road_or_gate' => $r->road_or_gate,
                'amount' => (float) $r->amount,
            ])->all(),
        ];
    }
}
