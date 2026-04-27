<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quiz extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'tag_id', 'created_by', 'title', 'slug', 'description',
        'difficulty', 'time_limit_minutes', 'passing_score',
        'total_marks', 'max_attempts', 'status',
    ];

    protected function casts(): array
    {
        return [
            'time_limit_minutes' => 'integer',
            'passing_score'      => 'integer',
            'total_marks'        => 'integer',
            'max_attempts'       => 'integer',
        ];
    }

    // ── Relations ────────────────────────────────────────────
    public function tag()
    {
        return $this->belongsTo(Tag::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function questions()
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('order_column');
    }

    public function attempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    // ── Scopes ───────────────────────────────────────────────
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    // ── Helpers ──────────────────────────────────────────────

    /**
     * Check if a candidate has any attempt (in_progress or completed) on this quiz.
     */
    public function isAttemptedBy(int $userId): bool
    {
        return $this->attempts()
            ->where('user_id', $userId)
            ->whereIn('status', ['in_progress', 'completed'])
            ->exists();
    }

    /**
     * Check if a candidate can still attempt this quiz.
     * max_attempts = 0 means unlimited.
     */
    public function canBeAttemptedBy(int $userId): bool
    {
        if ($this->max_attempts === 0) return true;

        $completedCount = $this->attempts()
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->count();

        return $completedCount < $this->max_attempts;
    }

    /**
     * How many attempts a candidate has remaining.
     * Returns null if unlimited (max_attempts = 0).
     */
    public function remainingAttemptsFor(int $userId): ?int
    {
        if ($this->max_attempts === 0) return null;

        $completedCount = $this->attempts()
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->count();

        return max(0, $this->max_attempts - $completedCount);
    }

    /**
     * Recalculate and save total marks from all questions.
     * Called after adding or removing questions.
     */
    public function recalculateTotalMarks(): void
    {
        $total = $this->questions()->sum('marks');
        $this->update(['total_marks' => $total]);
    }

    /**
     * Human-readable attempts label for display.
     */
    public function attemptsLabel(): string
    {
        return match (true) {
            $this->max_attempts === 0 => 'Unlimited attempts',
            $this->max_attempts === 1 => '1 attempt only',
            default                   => "{$this->max_attempts} attempts allowed",
        };
    }
}