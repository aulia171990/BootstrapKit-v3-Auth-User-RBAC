<?php

namespace App\Services\Admin;

use App\Enums\RoleEnum;
use App\Models\AuditLog;
use App\Models\Driver;
use App\Models\Payment\PaymentTransaction;
use App\Models\Trip;
use App\Models\User;
use App\Models\Wallet\Wallet;
use App\Repositories\BookingRepository;
use App\Repositories\DispatchRepository;
use App\Repositories\DriverRepository;
use App\Repositories\Promotion\PromotionRepository;
use App\Repositories\TripRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    private int $ttl = 90;

    public function __construct(
        private DriverRepository $drivers,
        private TripRepository $trips,
        private BookingRepository $bookings,
        private DispatchRepository $dispatches,
        private UserRepository $users,
        private PromotionRepository $promotions,
    ) {}

    public function stats(): array
    {
        $cacheKey = 'admin:dashboard:stats';

        return Cache::remember($cacheKey, $this->ttl, function () {
            $todayStart = now()->startOfDay();
            $todayEnd = now()->endOfDay();

            $todayTrips = Trip::whereBetween('created_at', [$todayStart, $todayEnd])->count();
            $completedTrips = Trip::where('status', 'completed')->count();
            $cancelledTrips = Trip::where('status', 'cancelled')->count();
            $activeTrips = Trip::whereIn('status', ['assigned', 'accepted', 'in_progress'])->count();

            $revenue = PaymentTransaction::where('status', 'success')->sum('amount') ?? 0;
            $pendingPayments = PaymentTransaction::where('status', 'pending')->count();

            $onlineDrivers = Driver::where('status', 'available')->count();

            return [
                'today_trips' => $todayTrips,
                'online_drivers' => $onlineDrivers,
                'active_trips' => $activeTrips,
                'completed_trips' => $completedTrips,
                'cancelled_trips' => $cancelledTrips,
                'revenue_summary' => (float) $revenue,
                'pending_payments' => (int) $pendingPayments,
            ];
        });
    }

    public function recentAlerts(int $limit = 20): array
    {
        return AuditLog::query()->orderByDesc('created_at')->limit($limit)->get()->toArray();
    }

    public function health(): array
    {
        return [
            'app' => 'OK',
            'db' => Cache::remember('admin:health:db', 60, fn () => DB::connection()->getDatabaseName()),
        ];
    }

    public function summary(): array
    {
        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();

        return [
            'users' => User::count(),
            'drivers' => Driver::count(),
            'trips_today' => Trip::whereBetween('created_at', [$todayStart, $todayEnd])->count(),
            'payments_today' => PaymentTransaction::whereBetween('created_at', [$todayStart, $todayEnd])->count('id'),
            'wallet_volume' => (float) Wallet::sum('balance') ?? 0,
        ];
    }
}
