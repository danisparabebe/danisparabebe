'use client';

import { useState, useEffect } from 'react';

const messages = [
    'Frete grátis acima de R$ 350 para SP, MG, RJ, PR, RS, GO e DF',
    'Produção 100% artesanal em até 12 dias úteis',
    'Personalização inclusa com o nome do bebê',
    'Pagamento 100% seguro e protegido'
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
