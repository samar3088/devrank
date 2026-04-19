<?php
// ============================================================
// app/Models/Quiz.php
// ============================================================
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
 
class Quiz extends Model
{
    use SoftDeletes;
 
    protected $fillable = [
        'tag_id', 'created_by', 'title', 'slug', 'description',
        'difficulty', 'time_limit_minutes', 'passing_score',
        'total_marks', 'status',
    ];
 
    protected function casts(): array
    {
        return [
            'time_limit_minutes' => 'integer',
            'passing_score'      => 'integer',
            'total_marks'        => 'integer',
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
    public function isAttemptedBy(int $userId): bool
    {
        return $this->attempts()
            ->where('user_id', $userId)
            ->whereIn('status', ['in_progress', 'completed'])
            ->exists();
    }
 
    public function recalculateTotalMarks(): void
    {
        $total = $this->questions()->sum('marks');
        $this->update(['total_marks' => $total]);
    }
}