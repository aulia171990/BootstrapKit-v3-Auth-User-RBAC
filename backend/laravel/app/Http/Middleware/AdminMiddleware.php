<?php

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gate: the authenticated user must hold the `admin` role.
 * 401 when unauthenticated, 403 otherwise. Alias: `admin`.
 */
class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Unauthenticated', 401);
        }

        if (! $user->hasRole('admin')) {
            return ApiResponse::error('Akses ditolak (hanya untuk admin)', 403);
        }

        return $next($request);
    }
}
