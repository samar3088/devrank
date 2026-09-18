<?php

namespace App\Http\Controllers;

use App\Services\CredentialService;
use Inertia\Inertia;

class VerifyController extends Controller
{
    public function __construct(private CredentialService $credentials) {}

    /**
     * Public "how this rank was earned" audit page for a credential token.
     */
    public function show(string $token)
    {
        $user = $this->credentials->resolve($token);
        abort_unless($user, 404);

        return Inertia::render('Verify/Credential', [
            'credential' => $this->credentials->verifyData($user),
            'token'      => $token,
        ]);
    }
}
