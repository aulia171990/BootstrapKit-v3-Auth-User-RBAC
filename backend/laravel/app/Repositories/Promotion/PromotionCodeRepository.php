<?php

namespace App\Repositories\Promotion;

use App\Models\Promotion\PromotionCode;

class PromotionCodeRepository
{
    public function create(string $promotionId, array $data): PromotionCode
    {
        return PromotionCode::create(array_merge($data, ['promotion_id' => $promotionId]));
    }

    public function findValid(string $code): ?PromotionCode
    {
        return PromotionCode::where('code', $code)
            ->where(function ($q) {
                $q->whereNull('max_single_uses')->orWhereColumn('current_uses', '<', 'max_single_uses');
            })->first();
    }
}
