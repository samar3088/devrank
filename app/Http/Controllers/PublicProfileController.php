<?php

namespace App\Http\Controllers;

use App\Services\InterestService;
use App\Services\PublicProfileService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PublicProfileController extends Controller
{
    public function __construct(
        private PublicProfileService $publicProfileService,
        private InterestService $interestService,
    ) {}

    public function candidateProfile(int $id)
    {
        $data = $this->publicProfileService->getCandidateProfile($id);

        // If viewer is a company, pass their interest status for this candidate
        $interestStatus = (Auth::check() && Auth::user()->hasRole('company'))
            ? $this->interestService->interestStatus($id)
            : null;

        return Inertia::render('PublicProfile/CandidateProfile', [
            ...$data,
            'interestStatus' => $interestStatus,
        ]);
    }

    public function companyProfile(int $id)
    {
        $data = $this->publicProfileService->getCompanyProfile($id);

        return Inertia::render('PublicProfile/CompanyProfile', $data);
    }
}