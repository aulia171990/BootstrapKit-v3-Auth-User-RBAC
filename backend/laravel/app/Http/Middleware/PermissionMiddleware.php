<?php

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RBAC gate: requires the authenticated user to hold ALL listed permissions
 * (granted via their roles). 401 when unauthenticated, 403 when any
 * permission is missing. The `permission` alias maps here.
 */
class PermissionMiddleware
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Unauthenticated', 401);
        }

        foreach ($permissions as $permission) {
            if (! $user->hasPermission($permission)) {
                return ApiResponse::error('Akses ditolak (izin tidak mencukupi)', 403);
            }
        }

        return $next($request);
    }
}
