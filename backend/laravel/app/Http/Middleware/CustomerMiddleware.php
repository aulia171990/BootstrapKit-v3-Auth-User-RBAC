<?php

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gate: the authenticated user must hold the `customer` role.
 * 401 when unauthenticated, 403 otherwise. Alias: `customer`.
 */
class CustomerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Unauthenticated', 401);
        }

        if (! $user->hasRole('customer')) {
            return ApiResponse::error('Akses ditolak (hanya untuk customer)', 403);
        }

        return $next($request);
    }
}
