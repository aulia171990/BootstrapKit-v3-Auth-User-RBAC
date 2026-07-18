<?php

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gate sensitive endpoints: the authenticated user must have a verified email.
 *
 * Runs AFTER AuthenticateApi (both live in the `auth.api` group), so the user
 * is already resolved on the request. Returns 403 with a JSON envelope that
 * matches the app's success/failure shape. The `verified` alias maps here.
 */
class VerifiedMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if (! $user || ! $user->email_verified) {
            return ApiResponse::error(
                'Email belum diverifikasi. Silakan verifikasi email Anda.',
                403
            );
        }

        return $next($request);
    }
}
