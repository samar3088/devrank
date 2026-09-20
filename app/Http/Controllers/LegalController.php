<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class LegalController extends Controller
{
    public function privacy()
    {
        return Inertia::render('Legal/Privacy', [
            'entity'          => config('devrank.privacy.entity_name'),
            'grievanceEmail'  => config('devrank.privacy.grievance_email'),
            'grievanceOfficer'=> config('devrank.privacy.grievance_officer'),
            'updatedAt'       => 'September 2026',
        ]);
    }

    public function terms()
    {
        return Inertia::render('Legal/Terms', [
            'entity'    => config('devrank.privacy.entity_name'),
            'updatedAt' => 'September 2026',
        ]);
    }

    public function cookies()
    {
        return Inertia::render('Legal/Cookies', [
            'entity'         => config('devrank.privacy.entity_name'),
            'grievanceEmail' => config('devrank.privacy.grievance_email'),
            'updatedAt'      => 'September 2026',
        ]);
    }

    public function about()
    {
        return Inertia::render('Legal/About', [
            'entity' => config('devrank.privacy.entity_name'),
        ]);
    }
}
