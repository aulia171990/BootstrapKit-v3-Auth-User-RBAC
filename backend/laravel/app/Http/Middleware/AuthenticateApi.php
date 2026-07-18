<?php

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthenticateApi
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $payload = JWTAuth::parseToken()->getPayload();
            $userId = $payload->get('sub');
            $stamp = $payload->get('stamp');
        } catch (JWTException $e) {
            return $this->unauthorized('Token tidak valid / kedaluwarsa');
        }

        $user = User::find($userId);

        if (! $user) {
            return $this->unauthorized('User tidak ditemukan');
        }

        // Security-stamp check: after logout-all / password reset we rotate
        // the stamp, so every previously issued JWT is rejected here.
        if ($stamp !== null && $stamp !== $user->security_stamp) {
            return $this->unauthorized('Sesi telah dibatalkan, silakan login ulang');
        }

        // Reject blocked/suspended accounts (claim may be stale on old tokens).
        if (! $user->isActive()) {
            return $this->unauthorized('Akun tidak aktif');
        }

        // Bind the user for the request lifecycle.
        auth()->setUser($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }

    private function unauthorized(string $message): Response
    {
        return ApiResponse::error($message, 401);
    }
}
