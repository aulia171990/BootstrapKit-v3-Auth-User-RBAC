<?php

namespace Tests\Feature\Wallet;

use App\Repositories\Wallet\WalletRepository;
use App\Services\Wallet\WalletService;
use App\Services\Wallet\TransferService;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TransferTest extends TestCase
{
    #[Test]
    public function transfer_creates_transfer_record(): void
    {
        $repo = new WalletRepository();
        $walletA = (new WalletService($repo))->getOrCreate('User', 'user-a', 'customer');
        $walletB = (new WalletService($repo))->getOrCreate('User', 'user-b', 'customer');

        $tx = (new TransferService(new \App\Repositories\Wallet\TransferRepository()))
            ->execute($walletA, $walletB, new \App\DTOs\Wallet\TransferRequest($walletA->id, $walletB->id, 1500));

        $this->assertSame(1500, $tx->amount);
        $this->assertSame($walletA->id, $tx->from_wallet_id);
        $this->assertSame($walletB->id, $tx->to_wallet_id);
    }
}
