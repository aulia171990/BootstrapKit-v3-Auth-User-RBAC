<?php

namespace App\Services\Promotion;

use App\Events\ReferralRewardGranted;
use App\Models\Promotion\Promotion;
use Illuminate\Support\Str;

final class ReferralRewardService
{
    public function createReward(string $actorUserId, ?string $refereeUserId = null): Promotion
    {
        $promotion = app(\App\Repositories\Promotion\PromotionRepository::class)->create([
            'name' => 'Referral Reward',
            'type' => 'referral_reward',
            'status' => 'active',
            'discount_type' => 'fixed',
            'discount_value' => 0,
            'starts_at' => now(),
            'expires_at' => now()->addDays(30),
            'max_usage_per_user' => 1,
        ]);

        ReferralRewardGranted::dispatch($actorUserId, $refereeUserId, $promotion->id);

        return $promotion;
    }
}
