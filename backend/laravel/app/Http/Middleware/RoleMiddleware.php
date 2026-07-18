<?php

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RBAC gate: requires the authenticated user to hold ANY of the listed roles.
 * 401 when unauthenticated, 403 when the role set does not match. The `role`
 * alias (registered in bootstrap/app.php) maps here.
 */
class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Unauthenticated', 401);
        }

        foreach ($roles as $role) {
            if ($user->hasRole($role)) {
                return $next($request);
            }
        }

        return ApiResponse::error('Akses ditolak (role tidak sesuai)', 403);
    }
}
