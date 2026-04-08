'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Verificar se houve consentimento
        const consent = localStorage.getItem('lgpd_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('lgpd_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1f2937] text-white p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-[11px] md:text-sm md:flex-1 text-center md:text-left leading-relaxed">
                    <p>
                        <strong>Sua privacidade é importante para nós.</strong> Nós utilizamos cookies essenciais para o funcionamento do portal de vendas e processamento seguro no Checkout, respeitando a <strong>Lei Geral de Proteção de Dados (LGPD)</strong>. 
                        Ao prosseguir, consideramos que você está de acordo com nossa{' '}
                        <Link href="/politicas/privacidade" className="underline font-bold text-sage-green hover:text-[#9cbd9f] transition-colors">
                            Política de Privacidade
                        </Link>.
                    </p>
                </div>
                <button
                    onClick={handleAccept}
                    className="shrink-0 bg-sage-green hover:bg-[#9cbd9f] text-[#1f2937] px-6 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all shadow-sm"
                >
                    Entendi e Aceito
                </button>
            </div>
        </div>
    );
}
