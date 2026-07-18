<?php

use Illuminate\Foundation\Application;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        channels: __DIR__ . '/../routes/channels.php',
        health: '/up',
    )
    ->withBroadcasting(
        __DIR__ . '/../routes/channels.php',
        ['middleware' => ['auth.api']],
    )
    ->withProviders([
        App\Providers\BroadcastServiceProvider::class,
    ])
    ->withMiddleware(function (Illuminate\Foundation\Configuration\Middleware $middleware) {
        $middleware->prepend([
            \App\Http\Middleware\SecurityHeadersMiddleware::class,
            \App\Http\Middleware\StructuredLoggingMiddleware::class,
        ]);

        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->alias([
            'auth.api' => \App\Http\Middleware\AuthenticateApi::class,
            'verified' => \App\Http\Middleware\VerifiedMiddleware::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'permission' => \App\Http\Middleware\PermissionMiddleware::class,
            'customer' => \App\Http\Middleware\CustomerMiddleware::class,
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'superadmin' => \App\Http\Middleware\SuperAdminMiddleware::class,
            'driver.approved' => \App\Http\Middleware\DriverApprovedMiddleware::class,
        ]);
    })
    ->withExceptions(function (Illuminate\Foundation\Configuration\Exceptions $exceptions) {
        // Always answer /api/* requests with a JSON envelope — never an HTML
        // error page (which would expose a stack trace when debug is on).
        $exceptions->shouldRenderJsonWhen(fn ($request) => str_starts_with($request->path(), 'api') || $request->expectsJson());

        // ── Validation errors (422) → standard envelope ──
        $exceptions->render(function (Illuminate\Validation\ValidationException $e) {
            return App\Http\Responses\ApiResponse::validation(
                $e->errors(),
                $e->getMessage() ?: 'Validation error'
            );
        });

        // ── Unauthenticated (401) → standard envelope ──
        // (Laravel's default returns a bare ['message' => ...]; normalise it.)
        $exceptions->render(function (Illuminate\Auth\AuthenticationException $e) {
            return App\Http\Responses\ApiResponse::error(
                $e->getMessage() ?: 'Unauthenticated',
                401
            );
        });

        // ── HTTP exceptions (abort(), 403/404/429/500…) → envelope ──
        // 404 is sanitised so the message never leaks the model class
        // (e.g. "No query results for model [App\User]").
        $exceptions->render(function (Symfony\Component\HttpKernel\Exception\HttpException $e) {
            $status = $e->getStatusCode();
            $errors = [];

            if ($e instanceof Illuminate\Http\Exceptions\ThrottleRequestsException) {
                $errors = ['retry_after' => $e->getHeaders()['Retry-After'] ?? null];
            }

            $message = match ($status) {
                404 => 'Data tidak ditemukan',
                default => $e->getMessage() ?: 'Request gagal',
            };

            return App\Http\Responses\ApiResponse::error($message, $status, $errors);
        });

        // ── Database errors → never leak SQL or bindings ──
        // Constraint violations (SQLSTATE 23*) → 409; everything else → 500.
        // The message is always generic; the real error is only logged server-side.
        $exceptions->render(function (Illuminate\Database\QueryException $e) {
            $sqlState = $e->errorInfo[0] ?? null;
            $constraint = $sqlState !== null && str_starts_with((string) $sqlState, '23');

            return App\Http\Responses\ApiResponse::error(
                $constraint ? 'Konflik data (kemungkinan duplikat)' : 'Terjadi kesalahan pada server',
                $constraint ? 409 : 500
            );
        });

        // ── Any other unexpected exception → safe 500 envelope ──
        // Internal messages / SQL / stack traces are NEVER sent to the client,
        // regardless of APP_DEBUG. The exception is still reported (logged).
        $exceptions->render(function (Throwable $e) {
            if (method_exists($e, 'render') || method_exists($e, 'report')) {
                // Exceptions that provide their own render() (e.g. AuthException)
                // are left untouched so their custom envelope stands.
                return null;
            }

            return App\Http\Responses\ApiResponse::error('Terjadi kesalahan pada server', 500);
        });
    })
    ->create();

return $app;
