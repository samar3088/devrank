<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;

class CompanyProfileService
{
    /**
     * Update company profile
     */
    public function updateProfile(User $user, array $data): User
    {
        $user->update([
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'company_name' => $data['company_name'],
            'company_website' => $data['company_website'] ?? null,
            'company_size' => $data['company_size'] ?? null,
            'industry' => $data['industry'] ?? null,
            'company_description' => $data['company_description'] ?? null,
            'location' => $data['location'] ?? null,
            'bio' => $data['bio'] ?? null,
        ]);

        return $user->fresh();
    }

    /**
     * Update company logo
     */
    public function updateLogo(User $user, UploadedFile $logo): string
    {
        // Delete old logo if exists
        if ($user->company_logo) {
            $oldPath = storage_path('app/public/' . $user->company_logo);
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }

        $path = $logo->store('company-logos', 'public');
        $user->update(['company_logo' => $path]);

        return $path;
    }
}