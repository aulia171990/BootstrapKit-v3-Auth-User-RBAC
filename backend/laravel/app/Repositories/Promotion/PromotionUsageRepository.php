<?php

namespace App\Repositories\Promotion;

use App\Models\Promotion\PromotionUsage;
use Illuminate\Support\Facades\DB;

class PromotionUsageRepository
{
    public function increment(string $promotionId, string $userId, ?string $bookingId): void
    {
        $updated = DB::table('promotion_usage')
            ->where('promotion_id', $promotionId)
            ->where('user_id', $userId)
            ->where('date', now()->toDateString())
            ->update(['count' => DB::raw('count + 1'), 'updated_at' => now()]);

        if ($updated === 0) {
            PromotionUsage::create([
                'promotion_id' => $promotionId,
                'user_id' => $userId,
                'booking_id' => $bookingId,
                'date' => now()->toDateString(),
                'count' => 1,
            ]);
        }
    }

    public function todayCount(string $promotionId, string $userId): int
    {
        return (int) PromotionUsage::where('promotion_id', $promotionId)
            ->where('user_id', $userId)
            ->where('date', now()->toDateString())
            ->sum('count');
    }
}
