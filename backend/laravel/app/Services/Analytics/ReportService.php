<?php

namespace App\Services\Analytics;

use App\Models\Trip;
use Illuminate\Support\Facades\Cache;

class ReportService
{
    public function trips(string $range = 'daily', ?string $from = null, ?string $to = null): array
    {
        $key = "analytics:report:trips:{$range}:" . ($from ?? '') . ':' . ($to ?? '');

        return Cache::remember($key, 3600, function () use ($range, $from, $to) {
            $query = Trip::query();

            if ($from && $to) {
                $query->whereBetween('created_at', [now()->parse($from)->startOfDay(), now()->parse($to)->endOfDay()]);
            }

            return [
                'range' => $range,
                'total' => $query->count(),
                'completed' => (clone $query)->where('status', 'completed')->count(),
                'cancelled' => (clone $query)->where('status', 'cancelled')->count(),
            ];
        });
    }
}
