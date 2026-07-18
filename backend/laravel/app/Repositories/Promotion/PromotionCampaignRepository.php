<?php

namespace App\Repositories\Promotion;

use App\Models\Promotion\PromotionCampaign;

class PromotionCampaignRepository
{
    public function create(array $data): PromotionCampaign
    {
        return PromotionCampaign::create($data);
    }

    public function findActive(string $code): ?PromotionCampaign
    {
        return PromotionCampaign::where('code', $code)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->first();
    }
}
