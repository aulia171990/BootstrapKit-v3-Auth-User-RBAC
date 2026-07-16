<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;

/*
| API v1 — Ojol Online
| Prefix "api" + grup middleware "api" sudah diset di RouteServiceProvider.
*/

Route::prefix('v1')->group(function () {
    // ── Auth (terbuka) ──
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login',    [AuthController::class, 'login']);

    // ── Butuh token ──
    Route::middleware('auth.api')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me',      [AuthController::class, 'me']);

        // ── Driver module ──
        // Route spesifik HARUS didefinisikan SEBELUM apiResource agar tidak
        // bentrok dengan parameter {driver}.
        Route::post('/drivers/location', [App\Http\Controllers\Driver\DriverController::class, 'updateLocation']);
        Route::get('/drivers/nearby',    [App\Http\Controllers\Driver\DriverController::class, 'nearby']);
        Route::apiResource('drivers', App\Http\Controllers\Driver\DriverController::class)
            ->only(['index', 'store', 'show', 'update']);

        // ── Order module ──
        Route::apiResource('orders', App\Http\Controllers\Order\OrderController::class)
            ->only(['index', 'store', 'show']);
        Route::post('/orders/{order}/accept', [App\Http\Controllers\Order\OrderController::class, 'accept']);
        Route::patch('/orders/{order}/status', [App\Http\Controllers\Order\OrderController::class, 'updateStatus']);
        Route::get('/orders/{order}/track', [App\Http\Controllers\Order\OrderController::class, 'track']);
        // Driver push posisi live selama trip (realtime tracking).
        Route::post('/orders/{order}/location', [App\Http\Controllers\Order\OrderController::class, 'updateLocation']);

        // ── Payment module ──
        Route::post('/orders/{order}/pay', [App\Http\Controllers\Payment\PaymentController::class, 'pay']);
        Route::get('/orders/{order}/payment', [App\Http\Controllers\Payment\PaymentController::class, 'show']);
    });
});
