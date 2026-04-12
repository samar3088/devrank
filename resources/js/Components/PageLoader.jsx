import '../../css/components/loader.css';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function PageLoader() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const startListener = router.on('start', () => setLoading(true));
        const finishListener = router.on('finish', () => setLoading(false));

        return () => {
            startListener();
            finishListener();
        };
    }, []);

    if (!loading) return null;

    return (
        <div className="page-loader">
            <div className="page-loader-bar"></div>
        </div>
    );
}