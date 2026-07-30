<?php

namespace Tests\Feature\Wallet;

use App\Repositories\Wallet\WalletRepository;
use App\Services\Wallet\SettlementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SettlementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate')->assertSuccessful();
    }

    #[Test]
    public function settlement_service_does_not_fail_when_no_fare_given(): void
    {
        $service = new SettlementService();

        $platform = (new \App\Services\Wallet\WalletService(new WalletRepository()))->getOrCreate('Platform', 'platform', 'platform');
        $driver = (new \App\Services\Wallet\WalletService(new WalletRepository()))->getOrCreate('Driver', 'driver-1', 'driver');

        $service->settleTripPayment($platform, $driver, null);

        $this->assertTrue(true);
    }
}
