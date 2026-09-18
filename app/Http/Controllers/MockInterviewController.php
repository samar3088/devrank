<?php

namespace App\Http\Controllers;

use App\Models\MockInterview;
use App\Services\MockInterviewService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MockInterviewController extends Controller
{
    public function __construct(private MockInterviewService $mock) {}

    public function index(Request $request)
    {
        $past = MockInterview::where('user_id', $request->user()->id)
            ->latest()
            ->limit(20)
            ->get(['id', 'company_name', 'role', 'status', 'ai_graded', 'overall_score', 'created_at']);

        return Inertia::render('MockInterview/Index', [
            'options'   => $this->mock->practiceOptions(),
            'past'      => $past,
            'aiEnabled' => $this->mock->aiEnabled(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => ['nullable', 'string', 'max:255'],
            'role'         => ['nullable', 'string', 'max:255'],
        ]);

        $mock = $this->mock->start(
            $request->user(),
            $validated['company_name'] ?: null,
            $validated['role'] ?: null,
        );

        return redirect()->route('mock.show', $mock->id);
    }

    public function show(Request $request, MockInterview $mock)
    {
        abort_unless($mock->user_id === $request->user()->id, 403);

        return Inertia::render('MockInterview/Show', [
            'mock'      => $mock->only(['id', 'company_name', 'role', 'status', 'ai_graded', 'transcript', 'overall_score', 'summary']),
            'aiEnabled' => $this->mock->aiEnabled(),
            'prep'      => $mock->isCompleted() ? null : $this->mock->prepData($mock->company_name, $mock->role),
        ]);
    }

    public function submit(Request $request, MockInterview $mock)
    {
        abort_unless($mock->user_id === $request->user()->id, 403);
        abort_if($mock->isCompleted(), 422, 'Already completed.');

        $validated = $request->validate([
            'answers'   => ['required', 'array'],
            'answers.*' => ['nullable', 'string', 'max:6000'],
        ]);

        $this->mock->complete($mock, $validated['answers']);

        return redirect()->route('mock.show', $mock->id)->with('success', 'Mock interview submitted.');
    }
}
