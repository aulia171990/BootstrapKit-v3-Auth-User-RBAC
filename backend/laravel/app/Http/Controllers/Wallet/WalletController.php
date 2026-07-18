<?php

namespace App\Http\Controllers\Wallet;

use App\Http\Controllers\Controller;
use App\Http\Requests\Wallet\BalanceRequest;
use App\Http\Requests\Wallet\LedgerRequest;
use App\Http\Requests\Wallet\RefundRequest;
use App\Http\Requests\Wallet\TopupRequest;
use App\Http\Requests\Wallet\TransferRequest;
use App\Http\Requests\Wallet\WithdrawRequest;
use App\Http\Requests\Wallet\HistoryRequest;
use Illuminate\Http\JsonResponse;

class WalletController extends Controller
{
    public function __construct(
        private \App\Services\Wallet\WalletService $wallets,
        private \App\Services\Wallet\BalanceService $balances,
        private \App\Services\Wallet\TopupService $topups,
        private \App\Services\Wallet\WithdrawalService $withdrawals,
        private \App\Services\Wallet\TransferService $transfers,
        private \App\Services\Wallet\RefundService $refunds,
    ) {}

    public function balance(BalanceRequest $request): JsonResponse
    {
        $wallet = $this->wallets->getOrCreate(
            (string) $request->user()->id,
            'User',
            'customer',
            'IDR',
        );

        $balance = $this->balances->calculate($wallet->id);

        return response()->json(['success' => true, 'data' => $balance], 200);
    }

    public function ledger(LedgerRequest $request): JsonResponse
    {
        $wallet = $this->wallets->getOrCreate(
            (string) $request->user()->id,
            'User',
            'customer',
            'IDR',
        );

        $entries = $wallet->ledgerEntries()->orderByDesc('created_at')->limit(100)->get();

        return response()->json(['success' => true, 'data' => $entries], 200);
    }

    public function topup(TopupRequest $request): JsonResponse
    {
        $wallet = $this->wallets->getOrCreate(
            (string) $request->user()->id,
            'User',
            'customer',
            'IDR',
        );

        $topup = $this->topups->execute(new \App\DTOs\Wallet\TransactionRequest(
            $wallet->id,
            'topup',
            (int) $request->input('amount'),
            'IDR',
            'WalletTopup',
            $request->user()->id,
        ));

        return response()->json(['success' => true, 'data' => ['transaction_id' => $topup->id, 'status' => $topup->status]], 201);
    }

    public function withdraw(WithdrawRequest $request): JsonResponse
    {
        $wallet = $this->wallets->getOrCreate(
            (string) $request->user()->id,
            'User',
            'customer',
            'IDR',
        );

        $withdrawal = $this->withdrawals->request(new \App\DTOs\Wallet\TransactionRequest(
            $wallet->id,
            'withdrawal',
            (int) $request->input('amount'),
            'IDR',
            'WalletWithdrawal',
            null,
        ));

        return response()->json(['success' => true, 'data' => ['transaction_id' => $withdrawal->id, 'status' => $withdrawal->status]], 200);
    }

    public function transfer(TransferRequest $request): JsonResponse
    {
        $request->validate();

        $from = $this->wallets->getOrCreate(
            (string) $request->user()->id,
            'User',
            'customer',
            'IDR',
        );

        $to = $this->wallets->getOrCreate(
            (string) $request->input('to_owner_id', $request->user()->id),
            'User',
            'customer',
            'IDR',
        );

        $transfer = $this->transfers->execute(
            $from,
            $to,
            new \App\DTOs\Wallet\TransferRequest(
                $from->id,
                $to->id,
                (int) $request->input('amount'),
                'IDR',
                'customer_to_customer',
            ),
        );

        return response()->json(['success' => true, 'data' => ['transfer_id' => $transfer->id, 'amount' => $transfer->amount]], 200);
    }

    public function refund(RefundRequest $request): JsonResponse
    {
        $wallet = $this->wallets->getOrCreate(
            (string) $request->user()->id,
            'User',
            'customer',
            'IDR',
        );

        $refund = $this->refunds->request(new \App\DTOs\Wallet\TransactionRequest(
            $wallet->id,
            'refund',
            (int) $request->input('amount'),
            'IDR',
            'WalletRefund',
            $request->input('original_transaction_id'),
        ));

        return response()->json(['success' => true, 'data' => ['transaction_id' => $refund->id]], 200);
    }

    public function history(HistoryRequest $request): JsonResponse
    {
        $wallet = $this->wallets->getOrCreate(
            (string) $request->user()->id,
            'User',
            'customer',
            'IDR',
        );

        $transactions = $wallet->transactions()->orderByDesc('created_at')->limit(50)->get();

        return response()->json(['success' => true, 'data' => $transactions], 200);
    }

    public function transactions(): JsonResponse
    {
        return $this->history(request());
    }
}
