'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

const CLARITY_PROJECT_ID = 'yx95m224xe';

export function MicrosoftClarity() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                Clarity.init(CLARITY_PROJECT_ID);
                console.log('✅ Microsoft Clarity inicializado com sucesso:', CLARITY_PROJECT_ID);
            } catch (err) {
                console.warn('Microsoft Clarity init warning:', err);
            }
        }
    }, []);

    return null;
}
