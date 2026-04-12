import '../../css/components/loader.css';

export default function LoadingButton({ loading, children, className, ...props }) {
    return (
        <button
            className={`${className || ''} ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
            {...props}
        >
            <span className="btn-loading-content">
                {loading && <span className="spinner spinner-sm"></span>}
                {children}
            </span>
        </button>
    );
}