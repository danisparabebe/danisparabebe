'use client';

import { useEffect } from 'react';
import { initAuthListener } from '@/store/auth-store';

export function AuthInitializer() {
    useEffect(() => {
        initAuthListener();
    }, []);

    return null; // Este componente não renderiza nada visualmente
}
