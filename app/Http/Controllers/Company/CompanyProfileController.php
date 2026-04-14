<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Services\CompanyProfileService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyProfileController extends Controller
{
    public function __construct(
        private CompanyProfileService $profileService
    ) {}

    /**
     * Show company profile edit form
     */
    public function edit(Request $request)
    {
        return Inertia::render('Company/Profile/Edit', [
            'company' => $request->user(),
        ]);
    }

    /**
     * Update company profile
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'company_name' => ['required', 'string', 'max:255'],
            'company_website' => ['nullable', 'url', 'max:255'],
            'company_size' => ['nullable', 'in:1-10,11-50,51-200,201-500,500+'],
            'industry' => ['nullable', 'string', 'max:255'],
            'company_description' => ['nullable', 'string', 'max:2000'],
            'location' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:500'],
        ]);

        $this->profileService->updateProfile($request->user(), $validated);

        return back()->with('success', 'Profile updated successfully!');
    }

    /**
     * Update company logo
     */
    public function updateLogo(Request $request)
    {
        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $this->profileService->updateLogo($request->user(), $request->file('logo'));

        return back()->with('success', 'Logo updated successfully!');
    }
}