'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X } from 'lucide-react';

const WHATSAPP_PHONE = '5518997518078';
const WHATSAPP_DEFAULT_MSG =
    'Olá, Dani! Tudo bem? Vim através do site e gostaria de tirar uma dúvida sobre os enxovais. Você poderia me ajudar, por gentileza?';

export function WhatsAppButton() {
    const pathname = usePathname();
    const [showBalloon, setShowBalloon] = useState(false);
    const [balloonDismissed, setBalloonDismissed] = useState(false);

    // Exibir balão por apenas 3 segundos e depois ocultar automaticamente
    useEffect(() => {
        if (balloonDismissed) return;

        // Mostra o balão 1 segundo após carregar a home
        const showTimer = setTimeout(() => {
            setShowBalloon(true);
        }, 1000);

        // Oculta automaticamente após 3 segundos visível (4s no total)
        const hideTimer = setTimeout(() => {
            setShowBalloon(false);
        }, 4000);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [balloonDismissed]);

    // O botão do WhatsApp deve ficar SOMENTE na página inicial (Home)
    if (pathname !== '/') {
        return null;
    }

    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MSG)}`;

    // Posição adaptativa para telas com barra inferior fixa (ex: configurador de kit)
    const isConfigurator = pathname.startsWith('/monte-seu-kit');
    const bottomClass = isConfigurator
        ? 'bottom-24 sm:bottom-6'
        : 'bottom-5 sm:bottom-6';

    return (
        <aside
            aria-label="Atendimento via WhatsApp"
            className={`fixed ${bottomClass} right-4 sm:right-6 z-40 flex flex-col items-end print:hidden group select-none`}
        >
            {/* Balãozinho de convite amigável e elegante */}
            {showBalloon && !balloonDismissed && (
                <div className="relative mb-2.5 max-w-[240px] sm:max-w-[260px] bg-white text-slate-800 p-3 sm:p-3.5 rounded-2xl shadow-xl border border-black/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowBalloon(false);
                            setBalloonDismissed(true);
                        }}
                        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                        title="Fechar aviso"
                        aria-label="Fechar aviso"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                            Atendimento Dani
                        </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed pr-3">
                        Olá! Ficou com alguma dúvida sobre as peças ou personalização? Posso te ajudar!
                    </p>
                    {/* Triângulo do balão */}
                    <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-black/5 rotate-45" />
                </div>
            )}

            {/* Botão Principal Flutuante do WhatsApp */}
            <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white px-3.5 sm:px-4 py-3 rounded-full shadow-[0_8px_25px_rgba(37,211,102,0.35)] hover:shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition-all duration-300 group-hover:scale-105"
                aria-label="Falar com a Dani no WhatsApp para tirar dúvidas"
            >
                {/* Ícone oficial WhatsApp em SVG de alta fidelidade */}
                <div className="relative flex items-center justify-center">
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping opacity-75" />
                    <svg
                        className="w-6 h-6 fill-current text-white shrink-0 drop-shadow-sm"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                </div>

                {/* Texto do Botão (visível em desktop e telas médias) */}
                <div className="flex flex-col text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider leading-none text-emerald-100 hidden sm:block">
                        Tirar Dúvidas
                    </span>
                    <span className="text-xs sm:text-sm font-black tracking-tight leading-tight whitespace-nowrap">
                        Fale com a Dani
                    </span>
                </div>
            </a>
        </aside>
    );
}
