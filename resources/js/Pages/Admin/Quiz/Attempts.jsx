import { usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminPagination, fmtDate } from '@/Pages/Admin/AdminShared';

export default function AdminQuizAttempts() {
    const { quiz, attempts, stats } = usePage().props;
    const [expanded, setExpanded] = useState(null);

    function formatTime(s) {
        if (!s) return '—';
        const m = Math.floor(s / 60), sec = s % 60;
        return `${m}m ${sec}s`;
    }

    return (
        <AdminLayout title={`Attempts — ${quiz.title}`}>
            <div className="admin-page-header">
                <div>
                    <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>
                        <Link href="/admin/quiz" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Quizzes</Link>
                        {' '} › <Link href={`/admin/quiz/${quiz.id}/edit`} style={{ color: 'var(--text3)', textDecoration: 'none' }}>{quiz.title}</Link>
                        {' '} › Attempts
                    </div>
                    <h1>Attempts</h1>
                    <p>{attempts.total} completed attempts</p>
                </div>
            </div>

            {/* Stats */}
            <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Attempts', value: stats.total_attempts, color: 'var(--text)' },
                    { label: 'Passed',         value: stats.passed,         color: 'var(--emerald)' },
                    { label: 'Avg Score',      value: `${stats.avg_score}%`, color: 'var(--cyan)' },
                    { label: 'AI Flagged',     value: stats.ai_flagged,     color: stats.ai_flagged > 0 ? 'var(--coral)' : 'var(--text3)' },
                ].map(s => (
                    <div key={s.label} className="admin-stat-card">
                        <div className="admin-stat-label">{s.label}</div>
                        <div className="admin-stat-value" style={{ color: s.color }}>{s.value ?? 0}</div>
                    </div>
                ))}
            </div>

            {/* Attempts table */}
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Candidate</th>
                            <th>Score</th>
                            <th>Percentage</th>
                            <th>Result</th>
                            <th>AI Flag</th>
                            <th>Time Taken</th>
                            <th>Rank Pts</th>
                            <th>Date</th>
                            <th>Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attempts.data.length === 0 ? (
                            <tr><td colSpan={9} className="admin-empty">No completed attempts yet.</td></tr>
                        ) : attempts.data.map(attempt => (
                            <>
                                <tr key={attempt.id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === attempt.id ? null : attempt.id)}>
                                    <td>
                                        <a href={`/candidate/${attempt.user_id}`} target="_blank"
                                            style={{ fontWeight: 600, color: 'var(--text)', textDecoration: 'none' }}
                                            onClick={e => e.stopPropagation()}>
                                            {attempt.user?.name}
                                        </a>
                                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                                            {attempt.user?.total_rank_score?.toLocaleString()} pts total rank
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{attempt.score} / {quiz.total_marks}</td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: attempt.percentage >= quiz.passing_score ? 'var(--emerald)' : 'var(--coral)' }}>
                                            {Math.round(attempt.percentage)}%
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`admin-badge admin-badge-${attempt.passed ? 'green' : 'red'}`}>
                                            {attempt.passed ? 'Passed' : 'Failed'}
                                        </span>
                                    </td>
                                    <td>
                                        {attempt.ai_flagged
                                            ? <span className="admin-badge admin-badge-red">⚠ Flagged</span>
                                            : <span style={{ color: 'var(--text3)', fontSize: 12 }}>Clean</span>
                                        }
                                    </td>
                                    <td style={{ fontSize: 13 }}>{formatTime(attempt.time_taken_seconds)}</td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: 'var(--champagne)' }}>
                                            +{attempt.rank_points_awarded}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{fmtDate(attempt.completed_at)}</td>
                                    <td>
                                        <span style={{ fontSize: 12, color: 'var(--violet-bright)', cursor: 'pointer' }}>
                                            {expanded === attempt.id ? '▲ Hide' : '▼ Show'}
                                        </span>
                                    </td>
                                </tr>

                                {/* Expanded answer detail */}
                                {expanded === attempt.id && attempt.answers && (
                                    <tr key={`${attempt.id}-detail`}>
                                        <td colSpan={9} style={{ padding: 0 }}>
                                            <div style={{ background: 'var(--bg2)', padding: 20, borderTop: '1px solid var(--border)' }}>
                                                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--text3)', marginBottom: 14 }}>
                                                    Answer Breakdown
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                    {attempt.answers.map((ans, i) => (
                                                        <div key={ans.id} style={{
                                                            background: 'var(--surface)', border: `1px solid ${ans.ai_flagged ? 'var(--coral-border)' : 'var(--border)'}`,
                                                            borderLeft: `3px solid ${ans.is_correct ? 'var(--emerald)' : ans.ai_flagged ? 'var(--coral)' : 'var(--border)'}`,
                                                            borderRadius: 'var(--r)', padding: '12px 16px'
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>
                                                                        Q{i + 1} · {ans.question?.type === 'mcq' ? 'MCQ' : `Coding · ${ans.question?.language}`}
                                                                    </div>
                                                                    <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: ans.answer_text ? 8 : 0 }}>
                                                                        {ans.question?.body}
                                                                    </div>
                                                                    {ans.answer_text && (
                                                                        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '8px 12px', maxHeight: 100, overflow: 'auto', color: 'var(--text2)', whiteSpace: 'pre-wrap' }}>
                                                                            {ans.answer_text.slice(0, 300)}{ans.answer_text.length > 300 ? '\n…' : ''}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', flexShrink: 0 }}>
                                                                    <span style={{ fontWeight: 700, fontSize: 13, color: ans.is_correct ? 'var(--emerald)' : 'var(--coral)' }}>
                                                                        {ans.marks_awarded} / {ans.question?.marks} pts
                                                                    </span>
                                                                    {ans.ai_score > 0 && (
                                                                        <span style={{ fontSize: 11, color: ans.ai_flagged ? 'var(--coral)' : 'var(--text3)' }}>
                                                                            AI: {ans.ai_score?.toFixed(1)}/10
                                                                            {ans.ai_flagged && ' ⚠'}
                                                                        </span>
                                                                    )}
                                                                    {ans.paste_count > 0 && (
                                                                        <span style={{ fontSize: 11, color: 'var(--champagne)' }}>
                                                                            {ans.paste_count} paste{ans.paste_count > 1 ? 's' : ''}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
                <AdminPagination data={attempts} />
            </div>
        </AdminLayout>
    );
}
