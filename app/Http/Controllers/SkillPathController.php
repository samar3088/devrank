<?php

namespace App\Http\Controllers;

use App\Services\SkillPathService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SkillPathController extends Controller
{
    public function __construct(private SkillPathService $paths) {}

    public function index(Request $request)
    {
        return Inertia::render('SkillPaths/Index', [
            'paths' => $this->paths->forCandidate($request->user()->id, 6),
        ]);
    }
}
