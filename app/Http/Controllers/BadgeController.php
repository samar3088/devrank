<?php

namespace App\Http\Controllers;

use App\Services\CredentialService;
use Illuminate\Http\Request;

class BadgeController extends Controller
{
    public function __construct(private CredentialService $credentials) {}

    /**
     * Public SVG badge. Rendered live from the DB each request, so the number is
     * always current and can't be forged via query params.
     */
    public function show(Request $request, string $token)
    {
        $user = $this->credentials->resolve($token);
        abort_unless($user, 404);

        $content = $this->credentials->badgeContent($user, $request->query('metric', 'rank'));
        abort_unless($content, 404);

        $svg = $this->credentials->badgeSvg($content[0], $content[1]);

        return response($svg, 200, [
            'Content-Type'  => 'image/svg+xml; charset=utf-8',
            'Cache-Control' => 'public, max-age=300',
            'X-Robots-Tag'  => 'noindex',
        ]);
    }
}
