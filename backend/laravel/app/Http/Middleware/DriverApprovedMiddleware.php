<?php

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gate: the authenticated user must be an approved driver — i.e. hold the
 * `driver` role AND have an onboarded Driver profile. The `Driver` record is
 * created when a driver is approved, so its presence is the approval signal.
 *
 * 401 when unauthenticated, 403 when not an approved driver. Alias: `driver.approved`.
 */
class DriverApprovedMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Unauthenticated', 401);
        }

        if (! $user->hasRole('driver') || ! $user->driver) {
            return ApiResponse::error('Akses ditolak (driver belum disetujui)', 403);
        }

        return $next($request);
    }
}
