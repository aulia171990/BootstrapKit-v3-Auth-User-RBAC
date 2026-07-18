<?php

namespace App\Services\Admin;

use App\Models\Trip;
use App\Repositories\PaymentRepository;
use App\Repositories\TripRepository;
use App\Repositories\UserRepository;
use App\Repositories\WalletRepository;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function __construct(
        private UserRepository $users,
        private TripRepository $trips,
        private PaymentRepository $payments,
        private WalletRepository $wallets,
    ) {}

    public function summary(): array
    {
        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();

        return [
            'users' => $this->users->totalCustomers(),
            'drivers' => $this->users->totalDrivers(),
            'trips_today' => Trip::whereBetween('created_at', [$todayStart, $todayEnd])->count(),
            'payments_today' => (int) DB::connection('default')->table('payments')->whereBetween('created_at', [$todayStart, $todayEnd])->count('id'),
            'wallet_volume' => (float) DB::connection('default')->table('ledger_entries')->sum('amount') ?? 0,
        ];
    }
}
