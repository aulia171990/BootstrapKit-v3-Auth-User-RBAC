<?php

namespace Tests\Feature\Pricing;

use App\Models\PricingRule;
use App\Repositories\PricingRuleRepository;
use App\Repositories\SurgeRuleRepository;
use App\Services\FareEstimatorService;
use App\Services\PricingEngineService;
use App\Services\PricingRuleResolver;
use App\Services\SurgePricingService;
use App\Services\WaitingFeeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_engine_estimate_uses_active_rule(): void
    {
        $rule = PricingRule::create([
            'city' => 'jakarta',
            'service_type' => 'ride',
            'vehicle_type' => 'car',
            'base_fare' => 10000,
            'minimum_fare' => 15000,
            'per_km_rate' => 3500,
            'per_minute_rate' => 500,
            'currency' => 'IDR',
            'active' => true,
            'effective_from' => now()->subDay(),
            'effective_until' => now()->addDay(),
        ]);

        $service = new PricingEngineService(
            new \App\Repositories\PricingRuleRepository(),
            new \App\Repositories\SurgeRuleRepository(),
            new \App\Repositories\PricingLogRepository(),
        );

        $result = $service->estimate(new \App\DTOs\Pricing\CalculationInput(
            city: 'jakarta',
            serviceType: 'ride',
            vehicleType: 'car',
            distanceKm: 2,
            durationMinutes: 10,
        ));

        $this->assertSame('IDR', $result->currency);
        $this->assertGreaterThanOrEqual((float) $rule->minimum_fare, $result->finalFare);
    }

    public function test_resolver_returns_active_rule(): void
    {
        $rule = PricingRule::create([
            'city' => 'jakarta',
            'service_type' => 'ride',
            'vehicle_type' => 'car',
            'base_fare' => 10000,
            'minimum_fare' => 15000,
            'per_km_rate' => 3500,
            'per_minute_rate' => 500,
            'currency' => 'IDR',
            'active' => true,
            'effective_from' => now()->subDay(),
            'effective_until' => now()->addDay(),
        ]);

        $resolver = new PricingRuleResolver();
        $resolved = $resolver->resolve('jakarta', 'ride', 'car', now());

        $this->assertNotNull($resolved);
        $this->assertSame($rule->id, $resolved->id);
    }

    public function test_surge_service_returns_multiplier(): void
    {
        $service = new SurgePricingService(new SurgeRuleRepository());
        $result = $service->currentMultiplier('jakarta', 'ride', 'car');

        $this->assertArrayHasKey('active', $result);
        $this->assertArrayHasKey('multiplier', $result);
    }

    public function test_waiting_fee_respects_free_minutes(): void
    {
        $service = new WaitingFeeService(new \App\Repositories\PricingRuleRepository());

        $result = $service->calculate('jakarta', 'ride', 'car', 3);

        $this->assertSame(3, $result['waiting_minutes']);
        $this->assertSame(0.0, $result['fee']);
    }
}
