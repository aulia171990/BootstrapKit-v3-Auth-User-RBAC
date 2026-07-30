<?php

namespace Tests\Feature\Wallet;

use App\Repositories\Wallet\WalletRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class WalletServiceTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function wallet_service_creates_wallet_when_missing_and_returns_found(): void
    {
        $repo = new WalletRepository();
        $service = new \App\Services\Wallet\WalletService($repo);

        $wallet = $service->getOrCreate('User', 'user-1', 'customer');

        $this->assertSame('user-1', $wallet->owner_id);
        $this->assertSame('customer', $wallet->wallet_type);
    }
}
