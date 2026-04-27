import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminPagination } from '@/Pages/Admin/AdminShared';

const DIFFICULTY_COLOR = { easy: 'green', medium: 'amber', hard: 'red' };

export default function AdminQuizIndex() {
    const { quizzes, stats } = usePage().props;

    function destroy(id) {
        if (!confirm('Delete this quiz? All attempts will also be deleted.')) return;
        router.delete(`/admin/quiz/${id}`, { preserveScroll: true });
    }

    function toggleStatus(id, current) {
        router.put(`/admin/quiz/${id}`, { _status_only: true, status: current === 'published' ? 'draft' : 'published' }, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Quiz Management">
            <div className="admin-page-header">
                <div>
                    <h1>Quiz Management</h1>
                    <p>{quizzes.total} quizzes · {stats.total_attempts} total attempts</p>
                </div>
                <Link href="/admin/quiz/create" className="btn btn-primary">+ Create Quiz</Link>
            </div>

            {/* Integrity stats */}
            <div className="admin-stats-grid" style={{ marginBottom: 28 }}>
                {[
                    { label: 'Total Attempts', value: stats.total_attempts,   color: 'var(--text)' },
                    { label: 'Total Passed',   value: stats.total_passed,     color: 'var(--emerald)' },
                    { label: 'AI Flagged',     value: stats.total_ai_flagged, color: 'var(--coral)' },
                    { label: 'Avg Pass Rate',  value: `${stats.avg_pass_rate}%`, color: 'var(--cyan)' },
                ].map(s => (
                    <div key={s.label} className="admin-stat-card">
                        <div className="admin-stat-label">{s.label}</div>
                        <div className="admin-stat-value" style={{ color: s.color }}>{s.value ?? 0}</div>
                    </div>
                ))}
            </div>

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Quiz</th><th>Tag</th><th>Level</th><th>Questions</th>
                            <th>Attempts</th><th>Pass Rate</th><th>AI Flags</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quizzes.data.length === 0 ? (
                            <tr><td colSpan={9} className="admin-empty">No quizzes yet. <Link href="/admin/quiz/create">Create one →</Link></td></tr>
                        ) : quizzes.data.map(quiz => (
                            <tr key={quiz.id}>
                                <td>
                                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{quiz.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                                        ⏱ {quiz.time_limit_minutes}min · {quiz.passing_score}% pass · {quiz.total_marks} marks
                                    </div>
                                </td>
                                <td style={{ fontSize: 12, color: 'var(--cyan)' }}>
                                    {quiz.tag ? `#${quiz.tag.name}` : '—'}
                                </td>
                                <td>
                                    <span className={`admin-badge admin-badge-${DIFFICULTY_COLOR[quiz.difficulty] || 'gray'}`}>
                                        {quiz.difficulty}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 600 }}>{quiz.questions_count}</td>
                                <td style={{ fontWeight: 600 }}>{quiz.attempts_count ?? 0}</td>
                                <td>
                                    <span style={{ fontWeight: 700, color: (quiz.pass_rate ?? 0) >= 60 ? 'var(--emerald)' : 'var(--coral)' }}>
                                        {quiz.pass_rate ?? 0}%
                                    </span>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 700, color: (quiz.ai_flag_count ?? 0) > 0 ? 'var(--coral)' : 'var(--text3)' }}>
                                        {quiz.ai_flag_count ?? 0}
                                    </span>
                                </td>
                                <td>
                                    <span className={`admin-badge admin-badge-${quiz.status === 'published' ? 'green' : 'gray'}`}>
                                        {quiz.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                        <Link href={`/admin/quiz/${quiz.id}/questions`} className="admin-action-btn">Questions</Link>
                                        <Link href={`/admin/quiz/${quiz.id}/edit`} className="admin-action-btn">Edit</Link>
                                        <Link href={`/admin/quiz/${quiz.id}/attempts`} className="admin-action-btn">Attempts</Link>
                                        <button onClick={() => toggleStatus(quiz.id, quiz.status)}
                                            className={`admin-action-btn ${quiz.status === 'published' ? 'amber' : 'green'}`}>
                                            {quiz.status === 'published' ? 'Unpublish' : 'Publish'}
                                        </button>
                                        <button onClick={() => destroy(quiz.id)} className="admin-action-btn red">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <AdminPagination data={quizzes} />
            </div>
        </AdminLayout>
    );
}
