<?php

namespace App\Repositories\Promotion;

use App\Models\Promotion\Promotion;

class PromotionRepository
{
    public function create(array $data): Promotion
    {
        return Promotion::create($data);
    }

    public function findActiveByCode(string $code): ?Promotion
    {
        return Promotion::where('code', $code)
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>=', now());
            })
            ->first();
    }

    public function paginateActive(int $perPage = 20): \Illuminate\Contracts\Pagination\Paginator
    {
        return Promotion::where('status', 'active')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function usages(string $promotionId): int
    {
        return (int) \App\Models\Promotion\PromotionUsage::where('promotion_id', $promotionId)->sum('count');
    }

    public function userUsages(string $promotionId, string $userId): int
    {
        return (int) \App\Models\Promotion\PromotionUsage::where('promotion_id', $promotionId)
            ->where('user_id', $userId)
            ->where('date', now()->toDateString())
            ->sum('count');
    }
}
