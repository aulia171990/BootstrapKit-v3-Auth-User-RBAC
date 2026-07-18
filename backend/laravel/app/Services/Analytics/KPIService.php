<?php

namespace App\Services\Analytics;

use App\Models\Trip;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class KPIService
{
    public function today(?string $date = null): array
    {
        $date = $date ?: now()->toDateString();
        $key = "analytics:kpi:{$date}";

        return Cache::remember($key, 3600, function () use ($date) {
            $start = now()->parse($date)->startOfDay();
            $end = now()->parse($date)->endOfDay();

            $trips = Trip::whereBetween('created_at', [$start, $end]);
            $completed = (clone $trips)->where('status', 'completed')->count();
            $cancelled = (clone $trips)->where('status', 'cancelled')->count();
            $active = Trip::whereIn('status', ['assigned', 'accepted', 'in_progress'])->count();
            $total = $trips->count();
            $acceptanceRate = $total > 0 ? round(($total - $cancelled) / $total * 100, 2) : null;

            return [
                'date' => $date,
                'total_trips' => $total,
                'completed_trips' => $completed,
                'cancelled_trips' => $cancelled,
                'active_trips' => $active,
                'acceptance_rate' => $acceptanceRate,
                'online_drivers' => User::whereHas('roles', fn ($q) => $q->where('name', 'driver'))->count(),
                'active_customers' => User::whereHas('roles', fn ($q) => $q->where('name', 'customer'))->count(),
            ];
        });
    }
}
