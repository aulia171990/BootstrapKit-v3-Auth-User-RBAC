<?php

namespace Tests\Feature\Promotion;

use App\Exceptions\Promotion\PromotionException;
use App\Models\User;
use App\Repositories\Promotion\PromotionRepository;
use App\Services\Promotion\PromotionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromotionControllerTest extends TestCase
{
    use RefreshDatabase;

    private PromotionService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(PromotionService::class);
    }

    public function test_promotion_engine_can_create_and_calculate_discount(): void
    {
        $userId = User::factory()->create()->id;
        $promotion = $this->service->create([
            'name' => 'Test Promo',
            'type' => 'percentage_discount',
            'status' => 'active',
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'starts_at' => now()->subDay(),
        ]);

        $discount = $this->service->apply($promotion->id, ['fare' => 10000, 'user_id' => $userId]);

        $this->assertSame(1000, $discount['discount_amount']);
        $this->assertSame(9000, $discount['final_fare']);
    }

    public function test_promotion_validation_rejects_max_discount_overflow(): void
    {
        $userId = User::factory()->create()->id;
        $promotion = $this->service->create([
            'name' => 'Fixed Cap',
            'type' => 'fixed_discount',
            'status' => 'active',
            'discount_type' => 'fixed',
            'discount_value' => 1000,
            'max_discount' => 500,
            'starts_at' => now()->subDay(),
        ]);

        $discount = $this->service->apply($promotion->id, ['fare' => 10000, 'user_id' => $userId]);

        $this->assertSame(500, $discount['discount_amount']);
    }

    public function test_promotion_expires_inactive_after_time_limit(): void
    {
        $promotion = $this->service->create([
            'name' => 'Expired',
            'type' => 'voucher',
            'status' => 'active',
            'discount_type' => 'fixed',
            'discount_value' => 1000,
            'expires_at' => now()->subDay(),
        ]);

        $this->expectException(PromotionException::class);
        $this->service->apply($promotion->id, ['fare' => 1000, 'user_id' => User::factory()->create()->id]);
    }
}
