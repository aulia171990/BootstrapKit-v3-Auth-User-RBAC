<?php

namespace App\Repositories\Rating;

class RatingSummaryRepository
{
    public function upsert(string $userId, array $data): void
    {
        \Illuminate\Support\Facades\DB::table('rating_summaries')->updateOrInsert(
            ['user_id' => $userId],
            array_merge($data, ['updated_at' => now()]),
        );
    }

    /**
     * @return array<string,mixed>|null
     */
    public function find(string $userId): ?array
    {
        $row = \Illuminate\Support\Facades\DB::table('rating_summaries')->where('user_id', $userId)->first();

        return $row ? (array) $row : null;
    }
}
