'use client';

import { useState, useEffect } from 'react';

const messages = [
    'Frete grátis acima de R$ 350 para SP, MG, RJ, PR, RS, GO e DF',
    '5% de desconto no PIX — Pagamento instantâneo',
    'Produção artesanal em até 12 dias úteis',
    'Parcelamento em até 3x sem juros no cartão'
];

export function TopBar() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-sage-green-dark text-white">
            <div className="relative flex items-center justify-center overflow-hidden">
                <div className="animate-fadeIn whitespace-nowrap py-1.5 text-center text-[11px] md:text-xs font-medium tracking-wide text-white/90">
                    {messages[currentIndex]}
                </div>
            </div>
        </div>
    );
}
