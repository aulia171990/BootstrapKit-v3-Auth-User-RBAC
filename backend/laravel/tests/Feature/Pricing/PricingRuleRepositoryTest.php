<?php

namespace Tests\Feature\Pricing;

use App\Models\PricingRule;
use App\Repositories\PricingRuleRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingRuleRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_and_find_active_rule(): void
    {
        $repo = new PricingRuleRepository();

        $rule = $repo->create([
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

        $found = $repo->findActive('jakarta', 'ride', 'car', now()->toDateTimeString());

        $this->assertNotNull($found);
        $this->assertSame($rule->id, $found->id);
    }

    public function test_inactive_rule_is_excluded(): void
    {
        PricingRule::create([
            'city' => 'jakarta',
            'service_type' => 'ride',
            'vehicle_type' => 'car',
            'base_fare' => 10000,
            'minimum_fare' => 15000,
            'per_km_rate' => 3500,
            'per_minute_rate' => 500,
            'currency' => 'IDR',
            'active' => false,
        ]);

        $found = (new PricingRuleRepository())->findActive('jakarta', 'ride', 'car', now()->toDateTimeString());

        $this->assertNull($found);
    }
}
