'use client';

import { useState, useEffect } from 'react';

const messages = [
    'Frete grátis acima de R$ 200',
    '🎁 Devolução estendida - 60 dias',
    'Parcelamento em até 12x sem juros'
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
        <div className="bg-dusty-rose text-white">
            <div className="relative flex items-center justify-center overflow-hidden">
                <div className="animate-fadeIn whitespace-nowrap py-2 text-center text-sm md:text-base">
                    {messages[currentIndex]}
                </div>
            </div>
        </div>
    );
}
