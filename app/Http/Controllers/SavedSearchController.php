<?php

namespace App\Http\Controllers;

use App\Models\SavedSearch;
use Illuminate\Http\Request;

class SavedSearchController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'              => ['required', 'string', 'max:80'],
            'alerts'            => ['boolean'],
            'filters'           => ['array'],
            'filters.search'    => ['nullable', 'string', 'max:120'],
            'filters.job_type'  => ['nullable', 'string', 'max:40'],
            'filters.work_mode' => ['nullable', 'string', 'max:40'],
            'filters.experience'=> ['nullable', 'string', 'max:40'],
            'filters.tag_id'    => ['nullable', 'integer'],
        ]);

        // Cap saved searches per user.
        if ($request->user()->savedSearches()->count() >= 10) {
            return back()->withErrors(['name' => 'You can keep up to 10 saved searches.']);
        }

        $request->user()->savedSearches()->create([
            'name'    => $validated['name'],
            'filters' => array_filter($validated['filters'] ?? []),
            'alerts'  => $validated['alerts'] ?? true,
        ]);

        return back()->with('success', 'Search saved. We’ll alert you when matching jobs are posted.');
    }

    public function destroy(Request $request, SavedSearch $savedSearch)
    {
        abort_unless($savedSearch->user_id === $request->user()->id, 403);
        $savedSearch->delete();

        return back()->with('success', 'Saved search removed.');
    }
}
