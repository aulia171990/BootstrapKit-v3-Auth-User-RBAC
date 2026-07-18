<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\ChargePaymentRequest;
use App\Http\Requests\Payment\RefundPaymentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private \App\Services\Payment\PaymentMethodService $methodService,
        private \App\Services\Payment\PaymentEngineService $engine,
        private \App\Services\Payment\PaymentRefundService $refundService,
        private \App\Services\Payment\PaymentWebhookService $webhookService,
    ) {}

    public function methods(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->methodService->available()], 200);
    }

    public function charge(ChargePaymentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        return response()->json(['success' => true, 'data' => ['status' => 'pending', 'reference' => uniqid()]], 201);
    }

    public function refund(RefundPaymentRequest $request): JsonResponse
    {
        $this->refundService->execute($request->input('reference'), $request->input('reason'));

        return response()->json(['success' => true, 'data' => ['status' => 'accepted']], 200);
    }

    public function webhook(Request $request): JsonResponse
    {
        $log = $this->webhookService->ingest(
            $request->header('X-Provider', 'unknown'),
            $request->header('X-Event', 'unknown'),
            json_encode($request->all()),
            $request->header('X-Signature'),
        );

        return response()->json(['success' => true, 'data' => ['id' => $log->id]], 200);
    }
}
