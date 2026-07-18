<?php

namespace App\Repositories\Promotion;

use App\Models\Promotion\PromotionRedemption;

class PromotionRedemptionRepository
{
    public function create(array $data): PromotionRedemption
    {
        return PromotionRedemption::create($data);
    }

    public function userRedemptions(string $userId, ?string $promotionId = null, int $limit = 20)
    {
        $q = PromotionRedemption::where('user_id', $userId)->orderByDesc('created_at');
        if ($promotionId) {
            $q->where('promotion_id', $promotionId);
        }

        return $q->limit($limit)->get()->all();
    }
}
