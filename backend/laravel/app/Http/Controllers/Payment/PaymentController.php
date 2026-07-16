<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
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
            return response()->json(['success' => false, 'message' => 'Bukan order Anda'], 403);
        }

        if ($order->status !== Order::STATUS_COMPLETED) {
            return response()->json(['success' => false, 'message' => 'Order belum selesai'], 422);
        }

        if ($order->payment && $order->payment->status === Payment::STATUS_PAID) {
            return response()->json(['success' => false, 'message' => 'Sudah dibayar'], 422);
        }

        $validator = Validator::make($request->all(), [
            'method' => 'required|in:cash,cashless',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors(),
            ], 422);
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

        return response()->json(['success' => true, 'message' => 'Pembayaran berhasil', 'data' => $payment], 201);
    }

    // Lihat status pembayaran order
    public function show(Request $request, Order $order)
    {
        $user = $request->user();
        $isOwner = $order->customer_id === $user->id;
        $isDriver = $order->driver_id && $user->driver?->id === $order->driver_id;
        $isAdmin = $user->roles()->where('name', 'admin')->exists();

        if (! ($isOwner || $isDriver || $isAdmin)) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $order->payment ?? (object) ['status' => Payment::STATUS_UNPAID],
        ]);
    }
}
