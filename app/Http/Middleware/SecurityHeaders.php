<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Baseline security response headers. Kept CSP-free on purpose: the app serves
 * Vite/Inertia bundles and inline styles, and a strict Content-Security-Policy
 * would need per-asset nonces to avoid breaking them — out of scope here. These
 * headers are safe, framework-agnostic hardening that won't break the SPA.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Every Symfony HTTP response exposes a `headers` bag; guard defensively
        // in case a non-standard response type slips through.
        if (! isset($response->headers)) {
            return $response;
        }

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');

        // HSTS only over HTTPS so local http dev isn't pinned to https.
        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
