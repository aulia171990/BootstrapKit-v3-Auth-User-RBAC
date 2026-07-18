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

    // Refresh is public: it authenticates by the opaque refresh token, not by
    // an (often-expired) access token. Opt out of the global auth guard so
    // the middleware stack never requires an access token here.
    Route::post('/auth/refresh', [AuthController::class, 'refresh'])
        ->withoutMiddleware('auth.api');

    // Passwordless / recovery flows
    Route::post('/auth/otp/request', [AuthController::class, 'requestOtp']);
    Route::post('/auth/otp/login',   [AuthController::class, 'loginWithOtp']);
    Route::post('/auth/password/email',    [AuthController::class, 'requestPasswordReset']);
    Route::post('/auth/password/reset',    [AuthController::class, 'resetPassword']);

    // Email verification (public-ish: identifies by email+code; resend needs auth).
    Route::post('/auth/verify-email',        [AuthController::class, 'verifyEmail']);

    // ── Butuh token ──
    Route::middleware('auth.api')->group(function () {
        Route::post('/auth/logout',         [AuthController::class, 'logout']);
        Route::post('/auth/logout-all',     [AuthController::class, 'logoutAll']);
        Route::get('/auth/me',              [AuthController::class, 'me']);

        // Device management — list + revoke individual devices.
        Route::get('/auth/devices',            [AuthController::class, 'devices']);
        Route::delete('/auth/devices/{deviceId}', [AuthController::class, 'revokeDevice']);

        // Resend verification email — self-service, no verified gate.
        Route::post('/auth/resend-verification', [AuthController::class, 'resendEmailVerification']);

        // ── Driver module ──
        // Readable by any authed user (index/show), so keep them outside the
        // verified gate. Specific actions are declared below.
        Route::apiResource('drivers', App\Http\Controllers\Driver\DriverController::class)
            ->only(['index', 'show']);
        Route::post('/drivers/location', [App\Http\Controllers\Driver\DriverController::class, 'updateLocation']);
        Route::get('/drivers/nearby',    [App\Http\Controllers\Driver\DriverController::class, 'nearby']);

        // ── Order module ──
        // Readable by any authed user (index/show/track); mutations are gated.
        Route::apiResource('orders', App\Http\Controllers\Order\OrderController::class)
            ->only(['index', 'show']);
        Route::get('/orders/{order}/track', [App\Http\Controllers\Order\OrderController::class, 'track']);

        // ── Sensitive: require a verified email ──
        Route::middleware('verified')->group(function () {
            // Account self-service
            Route::post('/auth/password/change', [AuthController::class, 'changePassword']);

            // Driver mutations (store/update) — verified only.
            Route::apiResource('drivers', App\Http\Controllers\Driver\DriverController::class)
                ->only(['store', 'update']);

            // Order mutations — verified only.
            Route::apiResource('orders', App\Http\Controllers\Order\OrderController::class)
                ->only(['store']);
            Route::post('/orders/{order}/accept',     [App\Http\Controllers\Order\OrderController::class, 'accept']);
            Route::patch('/orders/{order}/status',    [App\Http\Controllers\Order\OrderController::class, 'updateStatus']);
            Route::post('/orders/{order}/location',   [App\Http\Controllers\Order\OrderController::class, 'updateLocation']);

            // ── Payment module ──
            Route::post('/orders/{order}/pay',      [App\Http\Controllers\Payment\PaymentController::class, 'pay']);
            Route::get('/orders/{order}/payment',   [App\Http\Controllers\Payment\PaymentController::class, 'show']);
        });
    });
});

// ── API documentation ──────────────────────────────────────────
// Raw OpenAPI 3.1 spec (consumable by Swagger UI / Redoc / codegen).
Route::get('/docs/openapi.yaml', function () {
    $path = base_path('openapi.yaml');
    abort_unless(file_exists($path), 404);

    return response()->make(file_get_contents($path), 200, [
        'Content-Type' => 'application/yaml',
    ]);
});

// Interactive Swagger UI viewer (loads the spec above).
Route::get('/docs', function () {
    $html = file_get_contents(resource_path('views/docs/swagger.blade.php'));
    // Strip the Blade-only @... directives if present; this file is plain HTML.
    return response()->make($html, 200, ['Content-Type' => 'text/html']);
});
