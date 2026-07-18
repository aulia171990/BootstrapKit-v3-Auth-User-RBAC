<?php

namespace Tests\Feature\Wallet;

use App\Models\Wallet\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletControllerTest extends TestCase
{
    use RefreshDatabase;

    // Note: this project uses JWT + a custom AuthenticateApi middleware.
    // Unauthenticated requests typically return 401, not 403, so these
    // sanity checks assert 401 until full wallet auth wiring is completed.

    public function test_balance_requires_auth(): void
    {
        $this->getJson('/api/v1/wallet/balance')->assertStatus(401);
    }

    public function test_transactions_requires_auth(): void
    {
        $this->getJson('/api/v1/wallet/transactions')->assertStatus(401);
    }

    public function test_ledger_requires_auth(): void
    {
        $this->getJson('/api/v1/wallet/ledger')->assertStatus(401);
    }

    public function test_topup_requires_auth(): void
    {
        $this->postJson('/api/v1/wallet/topup', ['amount' => 10000])->assertStatus(401);
    }

    public function test_withdraw_requires_auth(): void
    {
        $this->postJson('/api/v1/wallet/withdraw', ['amount' => 5000])->assertStatus(401);
    }

    public function test_transfer_requires_auth(): void
    {
        $this->postJson('/api/v1/wallet/transfer', ['amount' => 1000, 'to_owner_id' => 'x'])->assertStatus(401);
    }

    public function test_refund_requires_auth(): void
    {
        $this->postJson('/api/v1/wallet/refund', ['amount' => 1000, 'original_transaction_id' => 'x'])->assertStatus(401);
    }

    public function test_history_requires_auth(): void
    {
        $this->getJson('/api/v1/wallet/history')->assertStatus(401);
    }
}
