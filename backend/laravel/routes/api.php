<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;

/*
| API v1 — Ojol Online
| Prefix "api" + grup middleware "api" sudah diset di RouteServiceProvider.
*/

Route::prefix('v1')->group(function () {
    // ── Observability / Health ─────────────────────────────────────
    Route::get('/health', [App\Http\Controllers\Observability\ObservabilityController::class, 'health']);
    Route::get('/ready', [App\Http\Controllers\Observability\ObservabilityController::class, 'ready']);
    Route::get('/live', [App\Http\Controllers\Observability\ObservabilityController::class, 'live']);
    Route::middleware('auth.api')->group(function () {
        Route::middleware('permission:observability.metrics')->get('/metrics', [App\Http\Controllers\Observability\ObservabilityController::class, 'metrics']);
    });

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

        // ── Dispatch module ──
        Route::prefix('dispatch')->group(function () {
            Route::post('/{booking}', [App\Http\Controllers\Dispatch\DispatchController::class, 'start']);
            Route::get('/{dispatchJob}', [App\Http\Controllers\Dispatch\DispatchController::class, 'show']);
            Route::post('/{dispatchJob}/retry', [App\Http\Controllers\Dispatch\DispatchController::class, 'retry']);
            Route::post('/{dispatchJob}/cancel', [App\Http\Controllers\Dispatch\DispatchController::class, 'cancel']);
            Route::get('/jobs', [App\Http\Controllers\Dispatch\DispatchController::class, 'jobs']);
            Route::get('/history', [App\Http\Controllers\Dispatch\DispatchController::class, 'history']);
        });

        // ── Trip module ──
        Route::prefix('trips')->group(function () {
            Route::get('/', [App\Http\Controllers\Trip\TripController::class, 'index']);
            Route::get('/{trip}', [App\Http\Controllers\Trip\TripController::class, 'show']);
            Route::post('/{trip}/arrive', [App\Http\Controllers\Trip\TripController::class, 'arrive']);
            Route::post('/{trip}/pickup', [App\Http\Controllers\Trip\TripController::class, 'pickup']);
            Route::post('/{trip}/start', [App\Http\Controllers\Trip\TripController::class, 'start']);
            Route::post('/{trip}/pause', [App\Http\Controllers\Trip\TripController::class, 'pause']);
            Route::post('/{trip}/resume', [App\Http\Controllers\Trip\TripController::class, 'resume']);
            Route::post('/{trip}/complete', [App\Http\Controllers\Trip\TripController::class, 'complete']);
            Route::post('/{trip}/cancel', [App\Http\Controllers\Trip\TripController::class, 'cancel']);
            Route::post('/{trip}/sos', [App\Http\Controllers\Trip\TripController::class, 'sos']);
            Route::get('/{trip}/timeline', [App\Http\Controllers\Trip\TripController::class, 'timeline']);
            Route::get('/{trip}/locations', [App\Http\Controllers\Trip\TripController::class, 'locations']);
        });

        // ── Pricing module ──
        Route::prefix('pricing')->group(function () {
            Route::post('/estimate', [App\Http\Controllers\Pricing\PricingController::class, 'estimate']);
            Route::post('/calculate', [App\Http\Controllers\Pricing\PricingController::class, 'calculate']);
            Route::get('/rules', [App\Http\Controllers\Pricing\PricingController::class, 'rules']);
            Route::post('/rules', [App\Http\Controllers\Pricing\PricingController::class, 'storeRule']);
            Route::put('/rules/{rule}', [App\Http\Controllers\Pricing\PricingController::class, 'updateRule']);
            Route::delete('/rules/{rule}', [App\Http\Controllers\Pricing\PricingController::class, 'deleteRule']);
            Route::get('/history', [App\Http\Controllers\Pricing\PricingController::class, 'history']);
        });

        // ── Map module ──
        Route::prefix("map")->group(function () {
            Route::get("/search", [App\Http\Controllers\Map\MapController::class, "search"]);
            Route::post("/geocode", [App\Http\Controllers\Map\MapController::class, "geocode"]);
            Route::get("/reverse-geocode", [App\Http\Controllers\Map\MapController::class, "reverseGeocode"]);
            Route::post("/route", [App\Http\Controllers\Map\MapController::class, "route"]);
            Route::post("/distance", [App\Http\Controllers\Map\MapController::class, "distance"]);
            Route::get("/eta", [App\Http\Controllers\Map\MapController::class, "eta"]);
        });

        // ── Customer module ──
        Route::prefix('customer')->group(function () {
            Route::get('/profile', [App\Http\Controllers\Customer\CustomerController::class, 'profile']);
            Route::put('/profile', [App\Http\Controllers\Customer\CustomerController::class, 'updateProfile']);

            Route::get('/addresses', [App\Http\Controllers\Customer\CustomerController::class, 'addresses']);
            Route::post('/addresses', [App\Http\Controllers\Customer\CustomerController::class, 'createAddress']);
            Route::put('/addresses/{id}', [App\Http\Controllers\Customer\CustomerController::class, 'updateAddress']);
            Route::delete('/addresses/{id}', [App\Http\Controllers\Customer\CustomerController::class, 'deleteAddress']);

            Route::get('/favorites', [App\Http\Controllers\Customer\CustomerController::class, 'favorites']);
            Route::post('/favorites', [App\Http\Controllers\Customer\CustomerController::class, 'createFavorite']);

            Route::get('/preferences', [App\Http\Controllers\Customer\CustomerController::class, 'preferences']);
            Route::put('/preferences', [App\Http\Controllers\Customer\CustomerController::class, 'updatePreferences']);

            Route::post('/referral', [App\Http\Controllers\Customer\CustomerController::class, 'createReferral']);
            Route::post('/referral/redeem', [App\Http\Controllers\Customer\CustomerController::class, 'redeemReferral']);
        });

        // ── Promotion module ──
        Route::prefix('promotions')->group(function () {
            Route::get('/', [App\Http\Controllers\Promotion\PromotionController::class, 'index']);
            Route::get('/{id}', [App\Http\Controllers\Promotion\PromotionController::class, 'show']);
            Route::post('/', [App\Http\Controllers\Promotion\PromotionController::class, 'store']);
            Route::put('/{id}', [App\Http\Controllers\Promotion\PromotionController::class, 'update']);
            Route::delete('/{id}', [App\Http\Controllers\Promotion\PromotionController::class, 'destroy']);
            Route::post('/validate', [App\Http\Controllers\Promotion\PromotionController::class, 'validatePromotion']);
            Route::post('/apply', [App\Http\Controllers\Promotion\PromotionController::class, 'applyPromotion']);
            Route::get('/history', [App\Http\Controllers\Promotion\PromotionController::class, 'history']);
        });

        // ── Rating module ──
        Route::prefix('ratings')->group(function () {
            Route::post('/', [App\Http\Controllers\Rating\RatingController::class, 'submit']);
            Route::get('/{id}', [App\Http\Controllers\Rating\RatingController::class, 'show']);
            Route::put('/{id}', [App\Http\Controllers\Rating\RatingController::class, 'update']);
            Route::get('/driver/{driverId}', [App\Http\Controllers\Rating\RatingController::class, 'forDriver']);
            Route::get('/customer/{customerId}', [App\Http\Controllers\Rating\RatingController::class, 'forCustomer']);
            Route::post('/{ratingId}/report', [App\Http\Controllers\Rating\RatingController::class, 'report']);
            Route::get('/summary/{userId}', [App\Http\Controllers\Rating\RatingController::class, 'summary']);
            Route::post('/{ratingId}/moderate', [App\Http\Controllers\Rating\ReviewModerationController::class, 'moderate']);
        });

        // ── Notification module ──
        Route::prefix('notification')->group(function () {
            Route::get('/notifications', [App\Http\Controllers\Notification\NotificationController::class, 'index']);
            Route::get('/notifications/unread', [App\Http\Controllers\Notification\NotificationController::class, 'unread']);
            Route::post('/notifications/read', [App\Http\Controllers\Notification\NotificationController::class, 'markRead']);
            Route::post('/notifications/read-all', [App\Http\Controllers\Notification\NotificationController::class, 'markAllRead']);
            Route::get('/preferences', [App\Http\Controllers\Notification\NotificationController::class, 'preferences']);
            Route::put('/preferences', [App\Http\Controllers\Notification\NotificationController::class, 'updatePreferences']);
        });

        // ── Chat module ──
        Route::prefix('conversations')->group(function () {
            Route::get('/', [App\Http\Controllers\Chat\ChatController::class, 'conversations']);
            Route::get('/{id}', [App\Http\Controllers\Chat\ChatController::class, 'show']);
            Route::post('/', [App\Http\Controllers\Chat\ChatController::class, 'store']);
            Route::get('/{conversation}/messages', [App\Http\Controllers\Chat\ChatController::class, 'messages']);
            Route::post('/messages', [App\Http\Controllers\Chat\ChatController::class, 'send']);
            Route::put('/messages/{id}', [App\Http\Controllers\Chat\ChatController::class, 'update']);
            Route::delete('/messages/{id}', [App\Http\Controllers\Chat\ChatController::class, 'delete']);
            Route::post('/messages/read', [App\Http\Controllers\Chat\ChatController::class, 'read']);
            Route::get('/{conversation}/unread', [App\Http\Controllers\Chat\ChatController::class, 'unread']);
        });

        // ── Driver module ──
        Route::prefix('driver')->group(function () {
            Route::get('/profile', [App\Http\Controllers\Driver\DriverController::class, 'profile']);
            Route::put('/profile', [App\Http\Controllers\Driver\DriverController::class, 'updateProfile']);
        });

        // Readable by any authed user (index/show), so keep them outside the
        // verified gate. Specific actions are declared below.
        Route::post('/drivers/location', [App\Http\Controllers\Driver\DriverController::class, 'updateLocation']);

        Route::apiResource('drivers', App\Http\Controllers\Driver\DriverController::class)
            ->only(['index', 'show']);
        // Admin/driver lifecycle/admin actions
        Route::prefix('drivers/{driver}')->group(function () {
            Route::post('/approve', [App\Http\Controllers\Driver\DriverController::class, 'approve']);
            Route::post('/reject',  [App\Http\Controllers\Driver\DriverController::class, 'reject']);
            Route::post('/suspend', [App\Http\Controllers\Driver\DriverController::class, 'suspend']);
            Route::post('/online', [App\Http\Controllers\Driver\DriverController::class, 'online']);
            Route::post('/offline', [App\Http\Controllers\Driver\DriverController::class, 'offline']);
            Route::get('/documents', [App\Http\Controllers\Driver\DriverController::class, 'documents']);
            Route::post('/documents', [App\Http\Controllers\Driver\DriverController::class, 'uploadDocument']);
        });

        // ── Payment module ──
        Route::prefix("payment")->group(function () {
            Route::get("/methods", [App\Http\Controllers\Payment\PaymentController::class, "methods"]);
            Route::post("/charge", [App\Http\Controllers\Payment\PaymentController::class, "charge"]);
            Route::post("/refund", [App\Http\Controllers\Payment\PaymentController::class, "refund"]);
            Route::post("/webhook/{provider?}", [App\Http\Controllers\Payment\PaymentController::class, "webhook"]);
        });

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

            // ── Booking module ──
            // Readable by any authed user; mutations require verified.
            Route::get('/bookings/history', [App\Http\Controllers\Booking\BookingController::class, 'history']);
            Route::get('/bookings/upcoming', [App\Http\Controllers\Booking\BookingController::class, 'upcoming']);

            Route::middleware('verified')->group(function () {
                Route::apiResource('bookings', App\Http\Controllers\Booking\BookingController::class)
                    ->only(['index', 'show', 'store']);
                Route::post('/bookings/{booking}/cancel', [App\Http\Controllers\Booking\BookingController::class, 'cancel']);
                Route::post('/bookings/{booking}/schedule', [App\Http\Controllers\Booking\BookingController::class, 'schedule']);
                Route::put('/bookings/{booking}', [App\Http\Controllers\Booking\BookingController::class, 'update']);
                Route::delete('/bookings/{booking}', [App\Http\Controllers\Booking\BookingController::class, 'destroy']);
            });

            // ── Wallet module ──
            Route::prefix("wallet")->group(function () {
                Route::get("/balance", [App\Http\Controllers\Wallet\WalletController::class, "balance"]);
                Route::get("/transactions", [App\Http\Controllers\Wallet\WalletController::class, "transactions"]);
                Route::get("/ledger", [App\Http\Controllers\Wallet\WalletController::class, "ledger"]);
                Route::post("/topup", [App\Http\Controllers\Wallet\WalletController::class, "topup"]);
                Route::post("/withdraw", [App\Http\Controllers\Wallet\WalletController::class, "withdraw"]);
                Route::post("/transfer", [App\Http\Controllers\Wallet\WalletController::class, "transfer"]);
                Route::post("/refund", [App\Http\Controllers\Wallet\WalletController::class, "refund"]);
                Route::get("/history", [App\Http\Controllers\Wallet\WalletController::class, "history"]);
            });

            // ── Payment module ──
            Route::prefix("payment")->group(function () {
                Route::post('/orders/{order}/pay',      [App\Http\Controllers\Payment\PaymentController::class, 'pay']);
                Route::get('/orders/{order}/payment',   [App\Http\Controllers\Payment\PaymentController::class, 'show']);
            });
        });

        // ── Admin & Operations Dashboard ──────────────────────────────
        Route::prefix('admin')->middleware('permission:dashboard.view')->group(function () {
            Route::get('/dashboard/stats', [App\Http\Controllers\Admin\DashboardController::class, 'stats']);
            Route::get('/dashboard/alerts', [App\Http\Controllers\Admin\DashboardController::class, 'alerts']);
            Route::get('/dashboard/health', [App\Http\Controllers\Admin\DashboardController::class, 'health']);
            Route::get('/dashboard/reports', [App\Http\Controllers\Admin\DashboardController::class, 'reports']);

            Route::middleware('permission:driver.manage')->prefix('drivers')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\DriverManagementController::class, 'index']);
                Route::post('/{driver}/approve', [App\Http\Controllers\Admin\DriverManagementController::class, 'approve']);
            });

            Route::middleware('permission:customer.manage')->prefix('customers')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\CustomerManagementController::class, 'index']);
            });

            Route::middleware('permission:trip.manage')->prefix('trips')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\TripManagementController::class, 'index']);
                Route::post('/{trip}/cancel', function () { return ApiResponse::success(null, 'Trip cancelled'); });
            });

            Route::middleware('permission:wallet.manage')->prefix('wallet')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\WalletManagementController::class, 'index']);
            });

            Route::middleware('permission:payment.manage')->prefix('payments')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\PaymentManagementController::class, 'index']);
            });

            Route::middleware('permission:promotion.manage')->prefix('promotions')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\PromotionManagementController::class, 'index']);
            });

            Route::middleware('permission:audit.view')->prefix('audit')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\AuditController::class, 'index']);
            });

            Route::get('/notifications/templates', [App\Http\Controllers\Admin\NotificationManagementController::class, 'templates']);

            Route::get('/support/live-trips', [App\Http\Controllers\Admin\SupportController::class, 'liveTrips']);

            Route::middleware('permission:config.manage')->prefix('config')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\ConfigController::class, 'index']);
                Route::put('/', [App\Http\Controllers\Admin\ConfigController::class, 'update']);
            });
        });

        // ── Analytics & Reporting ──────────────────────────────────────
        Route::prefix('analytics')->middleware('permission:analytics.view')->group(function () {
            Route::get('/dashboard', [App\Http\Controllers\Analytics\AnalyticsController::class, 'dashboard']);
            Route::get('/kpi', [App\Http\Controllers\Analytics\AnalyticsController::class, 'kpi']);
            Route::get('/revenue', [App\Http\Controllers\Analytics\AnalyticsController::class, 'revenue']);
            Route::get('/trips', [App\Http\Controllers\Analytics\AnalyticsController::class, 'trips']);
            Route::middleware('permission:analytics.export')->group(function () {
                Route::get('/export', [App\Http\Controllers\Analytics\AnalyticsController::class, 'export']);
            });
            Route::middleware('permission:analytics.manage')->group(function () {
                Route::post('/aggregate', [App\Http\Controllers\Analytics\AnalyticsController::class, 'aggregate']);
            });
        });

        // ── Operations Control Center ─────────────────────────────────
        Route::prefix('operations')->middleware('permission:operations.view')->group(function () {
            Route::get('/dashboard', [App\Http\Controllers\Operation\OperationController::class, 'dashboard']);
            Route::get('/incidents', [App\Http\Controllers\Operation\OperationController::class, 'incidents']);
            Route::post('/incidents', [App\Http\Controllers\Operation\OperationController::class, 'storeIncident']);
            Route::put('/incidents/{id}', [App\Http\Controllers\Operation\OperationController::class, 'updateIncident']);
            Route::get('/sos', [App\Http\Controllers\Operation\OperationController::class, 'sos']);
            Route::get('/alerts', [App\Http\Controllers\Operation\OperationController::class, 'alerts']);

            Route::middleware('permission:operations.dispatch')->group(function () {
                Route::post('/manual-dispatch', [App\Http\Controllers\Operation\OperationController::class, 'manualDispatch']);
                Route::post('/reassign-driver', [App\Http\Controllers\Operation\OperationController::class, 'reassignDriver']);
            });

            Route::middleware('permission:operations.manage')->group(function () {
                Route::post('/driver/offline', [App\Http\Controllers\Operation\OperationController::class, 'forceDriverOffline']);
            });
        });

        // ── API Gateway / Partner ──────────────────────────────────────
        Route::prefix('gateway')->middleware('permission:api.manage')->group(function () {
            Route::get('/clients', [App\Http\Controllers\Api\ApiGatewayController::class, 'clients']);
            Route::post('/clients', [App\Http\Controllers\Api\ApiGatewayController::class, 'createClient']);
            Route::post('/keys', [App\Http\Controllers\Api\ApiGatewayController::class, 'createKey']);
            Route::get('/webhooks', [App\Http\Controllers\Api\ApiGatewayController::class, 'webhooks']);
            Route::post('/webhooks', [App\Http\Controllers\Api\ApiGatewayController::class, 'createWebhook']);
            Route::post('/oauth/token', [App\Http\Controllers\Api\ApiGatewayController::class, 'issueToken']);
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

// Payment routes below in a later patch
