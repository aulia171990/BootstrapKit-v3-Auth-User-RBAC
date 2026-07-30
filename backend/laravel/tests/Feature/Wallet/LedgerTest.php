<?php

namespace Tests\Feature\Wallet;

use App\DTOs\Wallet\LedgerEntry;
use App\Services\Wallet\LedgerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LedgerTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function ledger_is_balanced_for_debit_and_credit(): void
    {
        $wallet = \App\Models\Wallet\Wallet::create([
            'owner_type' => 'User', 'owner_id' => 'user-1',
            'wallet_type' => 'customer', 'currency' => 'IDR',
        ]);

        $service = new LedgerService(new \App\Repositories\Wallet\LedgerRepository());
        $tx = 'tx-'.uniqid();

        $service->createEntry($wallet->id, new LedgerEntry($tx, 'debit', 200));
        $service->createEntry($wallet->id, new LedgerEntry($tx, 'credit', 200));

        $this->assertSame(200, $service->sumDebits($wallet->id));
        $this->assertSame(200, $service->sumCredits($wallet->id));
    }
}
