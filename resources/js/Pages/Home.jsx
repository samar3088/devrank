export default function Home() {
    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#0d0f1a',
            color: '#ffffff',
            fontFamily: 'system-ui, sans-serif',
        }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>
                    🚀 DevRank
                </h1>
                <p style={{ color: '#7c6dfa', fontSize: '1.2rem' }}>
                    Inertia + React is working!
                </p>
            </div>
        </div>
    );
}