<?php

namespace App\Http\Controllers;

use App\Services\PublicProfileService;
use Inertia\Inertia;

class PublicProfileController extends Controller
{
    public function __construct(
        private PublicProfileService $publicProfileService
    ) {}

    public function candidateProfile(int $id)
    {
        $data = $this->publicProfileService->getCandidateProfile($id);

        return Inertia::render('PublicProfile/CandidateProfile', $data);
    }

    public function companyProfile(int $id)
    {
        $data = $this->publicProfileService->getCompanyProfile($id);

        return Inertia::render('PublicProfile/CompanyProfile', $data);
    }
}