<?php

namespace App\Services\Promotion;

use App\Events\Promotion\PromotionApplied;
use App\Events\Promotion\PromotionCreated;
use App\Events\Promotion\PromotionExpired;
use App\Events\Promotion\PromotionRedeemed;
use App\Exceptions\Promotion\PromotionException;
use App\Jobs\Promotion\AutoExpirePromotionJob;
use App\Jobs\Promotion\PromotionNotificationJob;
use App\Models\Promotion\Promotion;
use App\Models\Promotion\PromotionRedemption;
use App\Models\Promotion\PromotionUsage;
use App\Notifications\Channels\NotificationChannelInterface;
use App\Repositories\Promotion\PromotionRepository;
use App\Repositories\Promotion\PromotionUsageRepository;
use Illuminate\Cache\CacheManager;
use Illuminate\Support\Facades\DB;

class PromotionService
{
    public function __construct(
        private PromotionRepository $promotions,
        private PromotionUsageRepository $usage,
        private CacheManager $cache,
    ) {}

    public function create(array $data): Promotion
    {
        $promotion = $this->promotions->create($data);

        if ('active' === ($promotion->status ?? 'draft') && $promotion->expires_at) {
            AutoExpirePromotionJob::dispatch($promotion->id, $promotion->expires_at->toDateTimeString());
        }

        if (class_exists(PromotionCreated::class)) {
            PromotionCreated::dispatch($promotion);
        }

        return $promotion;
    }

    public function find(string $id): ?Promotion
    {
        $cache = $this->cache;

        try {
            $promotion = $cache->tags(['promotions'])->remember("promotion:{$id}", 3600, function () use ($id) {
                return $this->resolveByIdentifier($id);
            });
        } catch (\BadMethodCallException $e) {
            $promotion = $cache->remember("promotion:{$id}", 3600, function () use ($id) {
                return $this->resolveByIdentifier($id);
            });
        }

        return $promotion;
    }

    private function resolveByIdentifier(string $identifier): ?Promotion
    {
        if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $identifier)) {
            return Promotion::where('status', 'active')
                ->where(function ($q) {
                    $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
                })->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
                })->find($identifier);
        }

        return $this->promotions->findActiveByCode($identifier);
    }

    public function validate(string $promotionId, array $context = []): Promotion
    {
        $promotion = $this->find($promotionId);

        if (! $promotion) {
            throw new PromotionException('Promotion not found.');
        }

        if (($promotion->status ?? null) !== 'active') {
            throw new PromotionException('Promotion is not active.');
        }

        if ($promotion->starts_at && $promotion->starts_at->isFuture()) {
            throw new PromotionException('Promotion is not available yet.');
        }

        if ($promotion->expires_at && $promotion->expires_at->isPast()) {
            if (class_exists(PromotionExpired::class)) {
                PromotionExpired::dispatch($promotion);
            }
            throw new PromotionException('Promotion has expired.');
        }

        $user = $context['user_id'] ?? null;
        $fare = (int) ($context['fare'] ?? 0);
        $city = $context['city'] ?? null;
        $vehicleType = $context['vehicle_type'] ?? null;
        $serviceType = $context['service_type'] ?? null;
        $paymentMethod = $context['payment_method'] ?? null;

        if ($promotion->min_fare && $promotion->min_fare > $fare) {
            throw new PromotionException('Minimum fare not met for this promotion.');
        }

        if ($promotion->city_restriction && ! in_array($city, $promotion->city_restriction, true)) {
            throw new PromotionException('Promotion is not available in this city.');
        }

        if ($promotion->vehicle_type_restriction && ! in_array($vehicleType, $promotion->vehicle_type_restriction, true)) {
            throw new PromotionException('Promotion is not available for this vehicle.');
        }

        if ($promotion->service_type_restriction && ! in_array($serviceType, $promotion->service_type_restriction, true)) {
            throw new PromotionException('Promotion is not available for this service.');
        }

        if ($promotion->payment_method_restriction && ! in_array($paymentMethod, $promotion->payment_method_restriction, true)) {
            throw new PromotionException('Promotion is not available with this payment method.');
        }

        if ($user) {
            if ($promotion->max_usage_per_user && $this->usage->todayCount($promotion->id, $user) >= $promotion->max_usage_per_user) {
                throw new PromotionException('Promotion daily limit per user exceeded.');
            }
        }

        return $promotion;
    }

    /**
     * @return array<string,mixed>
     */
    public function calculateDiscount(Promotion $promotion, int $baseFare): array
    {
        $discountAmount = 0;

        if ('percentage' === $promotion->discount_type && $promotion->discount_value > 0) {
            $discountAmount = (int) round($baseFare * ($promotion->discount_value / 100));
        } elseif ('fixed' === $promotion->discount_type && $promotion->discount_value > 0) {
            $discountAmount = (int) $promotion->discount_value;
        }

        if ($promotion->max_discount && $discountAmount > $promotion->max_discount) {
            $discountAmount = (int) $promotion->max_discount;
        }

        $finalFare = max(0, $baseFare - $discountAmount);

        return [
            'promotion_id' => $promotion->id,
            'code' => $promotion->code,
            'type' => $promotion->type,
            'discount_type' => $promotion->discount_type,
            'discount_value' => $promotion->discount_value,
            'discount_amount' => $discountAmount,
            'base_fare' => $baseFare,
            'final_fare' => $finalFare,
            'currency' => $promotion->currency,
        ];
    }

    public function apply(string $promotionId, array $context = []): array
    {
        $promotion = $this->validate($promotionId, $context);
        $discount = $this->calculateDiscount($promotion, (int) ($context['fare'] ?? 0));

        $this->usage->increment($promotion->id, (string) $context['user_id'], $context['booking_id'] ?? null);

        if (class_exists(PromotionApplied::class)) {
            PromotionApplied::dispatch($promotion, $discount, $context);
        }
        if (class_exists(PromotionNotificationJob::class)) {
            PromotionNotificationJob::dispatch($context['user_id'] ?? null, $promotion->id);
        }

        return $discount;
    }

    public function redeem(string $promotionId, array $payload = []): PromotionRedemption
    {
        return DB::transaction(function () use ($promotionId, $payload) {
            $promotion = $this->find($promotionId);

            if (! $promotion) {
                throw new PromotionException('Promotion not found.');
            }

            $this->validate($promotion->id, $payload);

            $redemption = app(\App\Repositories\Promotion\PromotionRedemptionRepository::class)->create([
                'promotion_id' => $promotion->id,
                'promotion_code_id' => $payload['promotion_code_id'] ?? null,
                'user_id' => $payload['user_id'],
                'booking_id' => $payload['booking_id'] ?? null,
                'payment_id' => $payload['payment_id'] ?? null,
                'trip_id' => $payload['trip_id'] ?? null,
                'order_id' => $payload['order_id'] ?? null,
                'wallet_transaction_id' => $payload['wallet_transaction_id'] ?? null,
                'amount_used' => (int) ($payload['amount_used'] ?? 0),
                'currency' => $promotion->currency,
                'discount_type' => $promotion->discount_type,
                'status' => 'used',
                'context' => $payload,
                'confirmed_at' => now(),
            ]);

            if (class_exists(PromotionRedeemed::class)) {
                PromotionRedeemed::dispatch($promotion, $redemption);
            }

            return $redemption;
        });
    }
}
