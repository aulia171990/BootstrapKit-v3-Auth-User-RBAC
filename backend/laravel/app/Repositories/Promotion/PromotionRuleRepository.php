<?php

namespace App\Repositories\Promotion;

use App\Models\Promotion\PromotionRule;

class PromotionRuleRepository
{
    public function create(string $promotionId, array $data): PromotionRule
    {
        return PromotionRule::create(array_merge($data, ['promotion_id' => $promotionId]));
    }
}
