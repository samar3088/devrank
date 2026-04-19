import { Head, useForm, Link, usePage } from '@inertiajs/react';
import CompanyLayout from '@/Layouts/CompanyLayout';
import LoadingButton from '@/Components/LoadingButton';

export default function CreateJob() {
    const { tags, monthlyPostsRemaining } = usePage().props;

    const form = useForm({
        title: '',
        description: '',
        requirements: '',
        benefits: '',
        job_type: 'full-time',
        work_mode: 'onsite',
        location: '',
        experience_level: '',
        experience_range: '',
        salary_min: '',
        salary_max: '',
        salary_currency: 'INR',
        salary_period: 'yearly',
        tags: [],
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.post('/company/jobs', {
            onFinish: () => {
                if (Object.keys(form.errors).length > 0) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            },
        });
    }

    function toggleTag(tagId) {
        const current = [...form.data.tags];
        const index = current.indexOf(tagId);
        if (index > -1) {
            current.splice(index, 1);
        } else if (current.length < 10) {
            current.push(tagId);
        }
        form.setData('tags', current);
    }

    if (monthlyPostsRemaining <= 0) {
        return (
            <CompanyLayout>
                <Head title="Post a Job" />
                <div className="job-form-wrapper">
                    <div className="limit-warning">
                        ⚠️ You've reached your monthly job posting limit. Your limit resets at the start of next month.
                    </div>
                    <Link href="/company/jobs" className="btn-cancel">← Back to My Jobs</Link>
                </div>
            </CompanyLayout>
        );
    }

    return (
        <CompanyLayout>
            <Head title="Post a Job" />
            <div className="job-form-wrapper">
                <div className="job-form-header">
                    <h1>Post a New Job</h1>
                    <p>Fill in the details below. Posts remaining this month: {monthlyPostsRemaining}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Basic Info */}
                    <div className="job-form-section">
                        <div className="job-form-section-title">Basic Information</div>

                        <div className="form-group">
                            <label className="form-label">Job Title</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Senior React Developer — Remote First"
                                value={form.data.title}
                                onChange={e => form.setData('title', e.target.value)}
                            />
                            {form.errors.title && <span className="form-error">{form.errors.title}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Job Description</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                                rows={6}
                                value={form.data.description}
                                onChange={e => form.setData('description', e.target.value)}
                            />
                            {form.errors.description && <span className="form-error">{form.errors.description}</span>}
                            <span className="form-hint">Minimum 50 characters</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Requirements</label>
                            <textarea
                                className="form-textarea"
                                placeholder="List the skills, experience, and qualifications required..."
                                rows={4}
                                value={form.data.requirements}
                                onChange={e => form.setData('requirements', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Benefits & Perks</label>
                            <textarea
                                className="form-textarea"
                                placeholder="What do you offer? Salary, health insurance, remote work, learning budget..."
                                rows={4}
                                value={form.data.benefits}
                                onChange={e => form.setData('benefits', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Job Details */}
                    <div className="job-form-section">
                        <div className="job-form-section-title">Job Details</div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Job Type</label>
                                <select
                                    className="form-select"
                                    value={form.data.job_type}
                                    onChange={e => form.setData('job_type', e.target.value)}
                                >
                                    <option value="full-time">Full-time</option>
                                    <option value="part-time">Part-time</option>
                                    <option value="contract">Contract</option>
                                    <option value="freelance">Freelance</option>
                                    <option value="internship">Internship</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Work Mode</label>
                                <select
                                    className="form-select"
                                    value={form.data.work_mode}
                                    onChange={e => form.setData('work_mode', e.target.value)}
                                >
                                    <option value="onsite">Onsite</option>
                                    <option value="remote">Remote</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Bengaluru, Remote"
                                    value={form.data.location}
                                    onChange={e => form.setData('location', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Experience Level</label>
                                <select
                                    className="form-select"
                                    value={form.data.experience_level}
                                    onChange={e => form.setData('experience_level', e.target.value)}
                                >
                                    <option value="">Select level</option>
                                    <option value="junior">Junior (0-2 years)</option>
                                    <option value="mid">Mid (2-5 years)</option>
                                    <option value="senior">Senior (5-8 years)</option>
                                    <option value="lead">Lead (8+ years)</option>
                                    <option value="principal">Principal</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Experience Range</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. 3-6 years"
                                value={form.data.experience_range}
                                onChange={e => form.setData('experience_range', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Salary */}
                    <div className="job-form-section">
                        <div className="job-form-section-title">Compensation</div>

                        <div className="form-row-3">
                            <div className="form-group">
                                <label className="form-label">Minimum Salary</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="e.g. 1800000"
                                    value={form.data.salary_min}
                                    onChange={e => form.setData('salary_min', e.target.value)}
                                />
                                {form.errors.salary_min && <span className="form-error">{form.errors.salary_min}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Maximum Salary</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="e.g. 2400000"
                                    value={form.data.salary_max}
                                    onChange={e => form.setData('salary_max', e.target.value)}
                                />
                                {form.errors.salary_max && <span className="form-error">{form.errors.salary_max}</span>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Period</label>
                                <select
                                    className="form-select"
                                    value={form.data.salary_period}
                                    onChange={e => form.setData('salary_period', e.target.value)}
                                >
                                    <option value="yearly">Per Year</option>
                                    <option value="monthly">Per Month</option>
                                    <option value="hourly">Per Hour</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="job-form-section">
                        <div className="job-form-section-title">Technology Tags</div>
                        <div className="tag-selector">
                            {tags.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    className={`tag-option ${form.data.tags.includes(tag.id) ? 'selected' : ''}`}
                                    onClick={() => toggleTag(tag.id)}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                        <div className="tag-count">{form.data.tags.length} / 10 tags selected</div>
                        {form.errors.tags && <span className="form-error">{form.errors.tags}</span>}
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <Link href="/company/jobs" className="btn-cancel">Cancel</Link>
                        <LoadingButton
                            type="submit"
                            loading={form.processing}
                            className="btn-submit"
                        >
                            {form.processing ? 'Publishing...' : 'Publish Job'}
                        </LoadingButton>
                    </div>
                </form>
            </div>
        </CompanyLayout>
    );
}
