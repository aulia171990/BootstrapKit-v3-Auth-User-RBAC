<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        $wsHost = env('REVERB_HOST', '127.0.0.1');
        $wsPort = env('REVERB_PORT', 8080);
        $wsScheme = env('REVERB_SCHEME', 'http') === 'https' ? 'wss' : 'ws';
        $wsOrigin = "{$wsScheme}://{$wsHost}:{$wsPort}";

        $csp = [
            "base-uri 'none'",
            "default-src 'self'",
            "connect-src 'self' {$wsOrigin}",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "img-src * data:",
            "style-src 'self' 'unsafe-inline'",
            "script-src 'self'",
            "upgrade-insecure-requests",
        ];

        $response->headers->set('Content-Security-Policy', implode('; ', $csp));

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        return $response;
    }
}
