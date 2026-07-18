<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    // Customer membayar order (cash dulu; cashless menyusul)
    public function pay(Request $request, Order $order)
    {
        if ($order->customer_id !== $request->user()->id) {
            return ApiResponse::error('Bukan order Anda', 403);
        }

        if ($order->status !== Order::STATUS_COMPLETED) {
            return ApiResponse::error('Order belum selesai', 422);
        }

        if ($order->payment && $order->payment->status === Payment::STATUS_PAID) {
            return ApiResponse::error('Sudah dibayar', 422);
        }

        $validator = Validator::make($request->all(), [
            'method' => 'required|in:cash,cashless',
        ]);

        if ($validator->fails()) {
            return ApiResponse::validation($validator->errors()->toArray());
        }

        $payment = Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'method' => $request->method,
                'amount' => $order->price,
                'status' => Payment::STATUS_PAID,
                'paid_at' => now(),
            ]
        );

        return ApiResponse::created($payment, 'Pembayaran berhasil');
    }

    // Lihat status pembayaran order
    public function show(Request $request, Order $order)
    {
        $user = $request->user();
        $isOwner = $order->customer_id === $user->id;
        $isDriver = $order->driver_id && $user->driver?->id === $order->driver_id;
        $isAdmin = $user->roles()->where('name', 'admin')->exists();

        if (! ($isOwner || $isDriver || $isAdmin)) {
            return ApiResponse::error('Akses ditolak', 403);
        }

        return ApiResponse::success(
            $order->payment ?? (object) ['status' => Payment::STATUS_UNPAID]
        );
    }
}
