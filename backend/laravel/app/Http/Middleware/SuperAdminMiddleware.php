<?php

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gate: the authenticated user must hold the `superadmin` role.
 * 401 when unauthenticated, 403 otherwise. Alias: `superadmin`.
 */
class SuperAdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Unauthenticated', 401);
        }

        if (! $user->hasRole('superadmin')) {
            return ApiResponse::error('Akses ditolak (hanya untuk superadmin)', 403);
        }

        return $next($request);
    }
}
