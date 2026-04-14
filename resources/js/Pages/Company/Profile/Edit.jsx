import '../../../../css/pages/company/profile.css';
import '../../../../css/pages/company/job-form.css';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import CompanyLayout from '@/Layouts/CompanyLayout';
import LoadingButton from '@/Components/LoadingButton';

export default function EditProfile() {
    const { company, flash } = usePage().props;
    const logoInput = useRef(null);

    const form = useForm({
        name: company.name || '',
        phone: company.phone || '',
        company_name: company.company_name || '',
        company_website: company.company_website || '',
        company_size: company.company_size || '',
        industry: company.industry || '',
        company_description: company.company_description || '',
        location: company.location || '',
        bio: company.bio || '',
    });

    const logoForm = useForm({
        logo: null,
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.put('/company/profile', {
            onFinish: () => {
                if (Object.keys(form.errors).length > 0) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            },
        });
    }

    function handleLogoChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        logoForm.setData('logo', file);
        logoForm.post('/company/profile/logo', {
            forceFormData: true,
            onFinish: () => logoForm.reset(),
        });
    }

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    return (
        <CompanyLayout>
            <Head title="Company Profile" />

            {/* Flash */}
            {flash?.success && (
                <div className="flash-success">✓ {flash.success}</div>
            )}

            <div className="profile-header">
                <h1>Company Profile</h1>
                <p>Update your company information visible to candidates.</p>
            </div>

            {/* Logo Section */}
            <div className="profile-section">
                <div className="profile-section-title">Company Logo</div>
                <div className="logo-upload">
                    <div className="logo-preview">
                        {company.company_logo ? (
                            <img src={`/storage/${company.company_logo}`} alt="Logo" />
                        ) : (
                            getInitials(company.company_name || company.name)
                        )}
                    </div>
                    <div>
                        <button
                            type="button"
                            className="logo-upload-btn"
                            onClick={() => logoInput.current.click()}
                            disabled={logoForm.processing}
                        >
                            {logoForm.processing ? 'Uploading...' : 'Change Logo'}
                        </button>
                        <div className="logo-upload-info">JPG, PNG or WebP. Max 2MB.</div>
                        <input
                            ref={logoInput}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleLogoChange}
                            style={{ display: 'none' }}
                        />
                        {logoForm.errors.logo && (
                            <span className="form-error">{logoForm.errors.logo}</span>
                        )}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Personal Info */}
                <div className="profile-section">
                    <div className="profile-section-title">Contact Person</div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={form.data.name}
                                onChange={e => form.setData('name', e.target.value)}
                            />
                            {form.errors.name && <span className="form-error">{form.errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="+91 98765 43210"
                                value={form.data.phone}
                                onChange={e => form.setData('phone', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bio / About You</label>
                        <textarea
                            className="form-textarea"
                            rows={3}
                            placeholder="A short bio about the contact person..."
                            value={form.data.bio}
                            onChange={e => form.setData('bio', e.target.value)}
                        />
                    </div>
                </div>

                {/* Company Info */}
                <div className="profile-section">
                    <div className="profile-section-title">Company Information</div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Company Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={form.data.company_name}
                                onChange={e => form.setData('company_name', e.target.value)}
                            />
                            {form.errors.company_name && <span className="form-error">{form.errors.company_name}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Company Website</label>
                            <input
                                type="url"
                                className="form-input"
                                placeholder="https://yourcompany.com"
                                value={form.data.company_website}
                                onChange={e => form.setData('company_website', e.target.value)}
                            />
                            {form.errors.company_website && <span className="form-error">{form.errors.company_website}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Company Size</label>
                            <select
                                className="form-select"
                                value={form.data.company_size}
                                onChange={e => form.setData('company_size', e.target.value)}
                            >
                                <option value="">Select size</option>
                                <option value="1-10">1-10 employees</option>
                                <option value="11-50">11-50 employees</option>
                                <option value="51-200">51-200 employees</option>
                                <option value="201-500">201-500 employees</option>
                                <option value="500+">500+ employees</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Industry</label>
                            <select
                                className="form-select"
                                value={form.data.industry}
                                onChange={e => form.setData('industry', e.target.value)}
                            >
                                <option value="">Select industry</option>
                                <option>IT Services & Consulting</option>
                                <option>Product / SaaS</option>
                                <option>Fintech</option>
                                <option>E-commerce</option>
                                <option>Healthcare Tech</option>
                                <option>EdTech</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Bengaluru, India"
                            value={form.data.location}
                            onChange={e => form.setData('location', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Company Description</label>
                        <textarea
                            className="form-textarea"
                            rows={5}
                            placeholder="Tell candidates about your company, culture, and what makes you a great place to work..."
                            value={form.data.company_description}
                            onChange={e => form.setData('company_description', e.target.value)}
                        />
                        {form.errors.company_description && <span className="form-error">{form.errors.company_description}</span>}
                        <span className="form-hint">Max 2000 characters</span>
                    </div>
                </div>

                <div className="form-actions">
                    <LoadingButton
                        type="submit"
                        loading={form.processing}
                        className="btn-submit"
                    >
                        {form.processing ? 'Saving...' : 'Save Changes'}
                    </LoadingButton>
                </div>
            </form>
        </CompanyLayout>
    );
}