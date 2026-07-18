<?php

namespace App\Services;

use App\DTOs\Pricing\CalculationInput;
use App\DTOs\Pricing\FareComponent;
use App\DTOs\Pricing\FareResult;
use App\Repositories\PricingLogRepository;
use App\Repositories\PricingRuleRepository;
use App\Repositories\SurgeRuleRepository;

class PricingEngineService
{
    public function __construct(
        private PricingRuleRepository $rules,
        private SurgeRuleRepository $surgeRules,
        private PricingLogRepository $logs,
    ) {}

    public function estimate(CalculationInput $input): FareResult
    {
        $context = $input->toContext();

        $rule = $this->rules->findActive(
            $context['city'],
            $context['service_type'] ?? null,
            $context['vehicle_type'] ?? null,
            now()->toDateTimeString(),
        );

        if (! $rule) {
            throw new \RuntimeException('Pricing rule not found');
        }

        $components = [
            'base_fare' => $this->resolveBase($rule),
            'distance_fare' => $this->resolveDistance($rule, $context),
            'duration_fare' => $this->resolveDuration($rule, $context),
            'minimum_fare' => $this->resolveMinimum($rule),
            'waiting_fee' => $this->resolveWaiting($context),
            'toll' => $this->resolveToll($context),
            'airport_fee' => $this->resolveAirport($context),
            'surge' => $this->resolveSurge($rule, $context),
            'platform_fee' => $this->resolvePlatform($context),
            'insurance_fee' => $this->resolveInsurance($context),
            'promo_discount' => $this->resolvePromo($context),
            'voucher_discount' => $this->resolveVoucher($context),
            'cashback' => 0,
            'tax' => $this->resolveTax($context),
            'round_adjustment' => 0,
        ];

        $result = FareResult::fromComponents($components, $rule->currency);

        $record = [
            'pricing_rule_id' => $rule->id,
            'booking_id' => $context['booking_id'] ?? null,
            'trip_id' => $context['trip_id'] ?? null,
            'request_id' => $context['request_id'] ?? null,
            'components' => $components,
            'final_fare' => $result->finalFare,
            'currency' => $rule->currency,
            'input' => $context,
            'calculated_at' => now(),
        ];

        $this->logs->log($record);

        return $result;
    }

    private function resolveBase($rule): FareComponent
    {
        return new FareComponent('base_fare', (float) $rule->base_fare, 'Base fare');
    }

    private function resolveDistance($rule, array $context): FareComponent
    {
        $distanceKm = (float) ($context['distance_km'] ?? 0);

        return new FareComponent('distance_fare', (float) round($distanceKm * $rule->per_km_rate, 2), 'Distance fare');
    }

    private function resolveDuration($rule, array $context): FareComponent
    {
        $minutes = (int) ($context['duration_minutes'] ?? 0);

        return new FareComponent('duration_fare', (float) round($minutes * $rule->per_minute_rate, 2), 'Duration fare');
    }

    private function resolveMinimum($rule): FareComponent
    {
        return new FareComponent('minimum_fare', (float) $rule->minimum_fare, 'Minimum fare');
    }

    private function resolveWaiting(array $context): FareComponent
    {
        return new FareComponent('waiting_fee', (float) ($context['waiting_fee'] ?? 0), 'Waiting fee');
    }

    private function resolveToll(array $context): FareComponent
    {
        return new FareComponent('toll', (float) ($context['toll'] ?? 0), 'Toll');
    }

    private function resolveAirport(array $context): FareComponent
    {
        return new FareComponent('airport_fee', (float) ($context['airport_fee'] ?? 0), 'Airport fee');
    }

    private function resolveSurge($rule, array $context): FareComponent
    {
        $surgeRule = $this->surgeRules->findActive(
            $rule->city,
            $rule->service_type,
            $rule->vehicle_type,
            now()->toDateTimeString(),
        );

        if (! $surgeRule || ($context['surge_multiplier_override'] ?? null)) {
            $multiplier = (float) ($context['surge_multiplier_override'] ?? 1);
        } else {
            $multiplier = min((float) $surgeRule->multiplier, (float) ($surgeRule->max_multiplier ?? $surgeRule->multiplier));
        }

        $base = (float) $rule->base_fare + (float) ($context['distance_fare'] ?? 0) + (float) ($context['duration_fare'] ?? 0);
        $value = (float) round($base * max(0, $multiplier - 1), 2);

        return new FareComponent('surge', $value, 'Surge');
    }

    private function resolvePlatform(array $context): FareComponent
    {
        return new FareComponent('platform_fee', (float) ($context['platform_fee'] ?? 0), 'Platform fee');
    }

    private function resolveInsurance(array $context): FareComponent
    {
        return new FareComponent('insurance_fee', (float) ($context['insurance_fee'] ?? 0), 'Insurance fee');
    }

    private function resolvePromo(array $context): FareComponent
    {
        return new FareComponent('promo_discount', (float) ($context['promo_discount'] ?? 0), 'Promo discount');
    }

    private function resolveVoucher(array $context): FareComponent
    {
        return new FareComponent('voucher_discount', (float) ($context['voucher_discount'] ?? 0), 'Voucher discount');
    }

    private function resolveTax(array $context): FareComponent
    {
        $rate = (float) ($context['tax_rate'] ?? 0.11);

        return new FareComponent('tax', (float) ($context['tax_amount'] ?? 0), 'Tax');
    }
}
