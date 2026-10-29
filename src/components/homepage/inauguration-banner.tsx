'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Gift, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { INAUGURATION_PROMO_CONFIG } from '@/data/inauguration-promo';

export function InaugurationBanner() {
    const config = INAUGURATION_PROMO_CONFIG;

    const [stock, setStock] = useState({
        fem: { available: config.kits.fem.unitsAvailable, isSoldOut: false },
        mas: { available: config.kits.mas.unitsAvailable, isSoldOut: false },
    });

    useEffect(() => {
        let isMounted = true;
        fetch('/api/inauguration-stock')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (isMounted && data?.fem && data?.mas) {
                    setStock({
                        fem: { available: data.fem.available, isSoldOut: data.fem.isSoldOut },
                        mas: { available: data.mas.available, isSoldOut: data.mas.isSoldOut },
                    });
                }
            })
            .catch(() => {});
        return () => { isMounted = false; };
    }, []);

    if (!config.enabled) return null;

    const { fem, mas } = config.kits;

    return (
        <section className="relative px-3 sm:px-4 lg:px-6 max-w-[1360px] mx-auto mt-4 mb-8 sm:mb-12">
            {/* ─── Ambient Glow nos Tons da Marca ─── */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ADCEB3]/25 via-[#245E3B]/10 to-[#ADCEB3]/20 rounded-[36px] blur-xl opacity-60 -z-10" />

            <div className="relative overflow-hidden rounded-[26px] sm:rounded-[36px] bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFEB] border border-[#ADCEB3]/50 shadow-[0_20px_50px_-25px_rgba(36,94,59,0.12)] p-4 sm:p-8 lg:p-10">
                
                {/* ─── HEADER: PROFISSIONAL, DIRETO E ELEGANTE ─── */}
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
                    
                    {/* Selo de Lançamento */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/95 border border-[#ADCEB3] shadow-xs">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#245E3B] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#245E3B]"></span>
                        </span>
                        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#245E3B] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#245E3B]" />
                            {config.badgeText}
                        </span>
                    </div>

                    {/* Headline: Oferta Clara */}
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-charcoal font-fraunces leading-tight tracking-tight">
                        {config.headline}{' '}
                        <span className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 mt-1 sm:mt-1 rounded-2xl bg-[#245E3B] text-white shadow-md shadow-[#245E3B]/20 border border-[#ADCEB3]/50 text-xl sm:text-3xl lg:text-4xl font-fraunces font-black align-middle max-w-full text-center">
                            <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-[#ADCEB3] shrink-0" />
                            <span>{config.highlightWord}</span>
                        </span>
                    </h1>

                    {/* Linha de Condição Comercial: Limpa, Sem Poluição */}
                    <div className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2 rounded-2xl bg-white border border-[#ADCEB3]/70 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs">
                        <span>
                            De <span className="line-through text-slate-400 font-normal">R$ 249,00</span> por <strong className="text-[#245E3B] font-black text-sm sm:text-base">R$ 197,00 no Pix</strong> ou <strong className="text-charcoal font-semibold">3x de R$ 70,62</strong> no cartão
                        </span>
                    </div>

                    {/* Subtítulo com Escopo Claro: Apenas essas 2 opções */}
                    <p className="text-xs sm:text-sm text-slate-600 font-dmSans leading-relaxed max-w-2xl">
                        {config.subheadline}{' '}
                        <span className="block mt-1 text-[11px] text-slate-400 font-medium">
                            * Demais produtos fora da promoção.
                        </span>
                    </p>
                </div>

                {/* ─── OS 2 KITS EXCLUSIVOS DA PROMOÇÃO ─── */}
                <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
                    
                    {/* ──── CARD 1: KIT MENINA (BORBOLETAS ROSA) ──── */}
                    <Link
                        href={stock.fem.isSoldOut ? '#' : fem.link}
                        className={`group relative flex flex-col justify-between bg-white rounded-3xl border border-dusty-rose/40 hover:border-dusty-rose hover:shadow-[0_16px_36px_-12px_rgba(212,166,166,0.35)] transition-all duration-300 p-4 sm:p-5 overflow-hidden ${
                            stock.fem.isSoldOut ? 'opacity-70 pointer-events-none' : ''
                        }`}
                    >
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-3 z-10">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FBF3F3] text-dusty-rose border border-dusty-rose/40">
                                🌸 {fem.badge}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                {stock.fem.isSoldOut 
                                    ? 'Esgotado' 
                                    : stock.fem.available < 5 
                                        ? `Restam apenas ${stock.fem.available} unidades` 
                                        : `Lote exclusivo: ${stock.fem.available} unidades`
                                }
                            </span>
                        </div>

                        {/* Imagem do Produto + Brinde Embutido */}
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF7F2] mb-4">
                            <Image
                                src={fem.image}
                                alt={fem.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                                priority
                            />
                            {/* Floating Pill */}
                            <div className="absolute bottom-2.5 inset-x-2.5 sm:bottom-3 sm:inset-x-3 bg-white/95 backdrop-blur-md rounded-xl py-2 px-3 border border-dusty-rose/40 flex items-center justify-between shadow-sm">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-charcoal">
                                    <Gift className="w-3.5 h-3.5 text-dusty-rose shrink-0" />
                                    1x Fralda de Boca Inclusa
                                </span>
                                <span className="text-[10px] font-black uppercase text-dusty-rose bg-dusty-rose/15 px-2 py-0.5 rounded shrink-0">
                                    Brinde
                                </span>
                            </div>
                        </div>

                        {/* Título e Composição */}
                        <div className="space-y-1 mb-4">
                            <h2 className="text-xl sm:text-2xl font-black text-charcoal font-fraunces group-hover:text-dusty-rose transition-colors leading-tight">
                                {fem.name}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                                4 Peças: {fem.composition}
                            </p>
                            <p className="text-[11px] text-slate-600 font-medium">
                                🎀 Bordado exclusivo da promoção: Borboletas Rosa.
                            </p>
                        </div>

                        {/* Preço e Botão */}
                        <div className="pt-3 border-t border-black/5 flex flex-col gap-3">
                            <div className="flex items-baseline justify-between flex-wrap gap-1">
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xs text-slate-400 line-through">
                                        R$ {fem.priceFull.toFixed(2).replace('.', ',')}
                                    </span>
                                    <span className="text-2xl sm:text-3xl font-black text-charcoal font-fraunces">
                                        R$ {fem.pixPrice.toFixed(2).replace('.', ',')}
                                    </span>
                                    <span className="text-xs font-bold text-[#245E3B]">no Pix</span>
                                </div>
                                <span className="text-xs font-medium text-slate-500">
                                    ou 3x de R$ {fem.installmentValue.toFixed(2).replace('.', ',')} no cartão
                                </span>
                            </div>

                            <div className={`w-full ${
                                stock.fem.isSoldOut 
                                    ? 'bg-slate-300 text-slate-600' 
                                    : 'bg-[#245E3B] group-hover:bg-[#1B5231] text-white'
                            } active:scale-[0.99] min-h-[46px] py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all duration-300`}>
                                <span>{stock.fem.isSoldOut ? 'Lote Esgotado' : fem.cta}</span>
                                {!stock.fem.isSoldOut && <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />}
                            </div>
                        </div>
                    </Link>

                    {/* ──── CARD 2: KIT MENINO (SAFARI VERDE MILITAR) ──── */}
                    <Link
                        href={stock.mas.isSoldOut ? '#' : mas.link}
                        className={`group relative flex flex-col justify-between bg-white rounded-3xl border border-[#ADCEB3]/60 hover:border-[#245E3B] hover:shadow-[0_16px_36px_-12px_rgba(36,94,59,0.25)] transition-all duration-300 p-4 sm:p-5 overflow-hidden ${
                            stock.mas.isSoldOut ? 'opacity-70 pointer-events-none' : ''
                        }`}
                    >
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-3 z-10">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F4F8F5] text-[#245E3B] border border-[#ADCEB3]">
                                🌿 {mas.badge}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                {stock.mas.isSoldOut 
                                    ? 'Esgotado' 
                                    : stock.mas.available < 5 
                                        ? `Restam apenas ${stock.mas.available} unidades` 
                                        : `Lote exclusivo: ${stock.mas.available} unidades`
                                }
                            </span>
                        </div>

                        {/* Imagem do Produto + Brinde Embutido */}
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF7F2] mb-4">
                            <Image
                                src={mas.image}
                                alt={mas.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                                priority
                            />
                            {/* Floating Pill */}
                            <div className="absolute bottom-2.5 inset-x-2.5 sm:bottom-3 sm:inset-x-3 bg-white/95 backdrop-blur-md rounded-xl py-2 px-3 border border-[#ADCEB3]/50 flex items-center justify-between shadow-sm">
                                <span className="flex items-center gap-1.5 text-xs font-bold text-charcoal">
                                    <Gift className="w-3.5 h-3.5 text-[#245E3B] shrink-0" />
                                    1x Fralda de Boca Inclusa
                                </span>
                                <span className="text-[10px] font-black uppercase text-[#245E3B] bg-[#ADCEB3]/35 px-2 py-0.5 rounded shrink-0">
                                    Brinde
                                </span>
                            </div>
                        </div>

                        {/* Título e Composição */}
                        <div className="space-y-1 mb-4">
                            <h2 className="text-xl sm:text-2xl font-black text-charcoal font-fraunces group-hover:text-sage-green-dark transition-colors leading-tight">
                                {mas.name}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                                4 Peças: {mas.composition}
                            </p>
                            <p className="text-[11px] text-slate-600 font-medium">
                                🌿 Bordado exclusivo da promoção: Safari Verde Militar.
                            </p>
                        </div>

                        {/* Preço e Botão */}
                        <div className="pt-3 border-t border-black/5 flex flex-col gap-3">
                            <div className="flex items-baseline justify-between flex-wrap gap-1">
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xs text-slate-400 line-through">
                                        R$ {mas.priceFull.toFixed(2).replace('.', ',')}
                                    </span>
                                    <span className="text-2xl sm:text-3xl font-black text-charcoal font-fraunces">
                                        R$ {mas.pixPrice.toFixed(2).replace('.', ',')}
                                    </span>
                                    <span className="text-xs font-bold text-[#245E3B]">no Pix</span>
                                </div>
                                <span className="text-xs font-medium text-slate-500">
                                    ou 3x de R$ {mas.installmentValue.toFixed(2).replace('.', ',')} no cartão
                                </span>
                            </div>

                            <div className={`w-full ${
                                stock.mas.isSoldOut 
                                    ? 'bg-slate-300 text-slate-600' 
                                    : 'bg-[#245E3B] group-hover:bg-[#1B5231] text-white'
                            } active:scale-[0.99] min-h-[46px] py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all duration-300`}>
                                <span>{stock.mas.isSoldOut ? 'Lote Esgotado' : mas.cta}</span>
                                {!stock.mas.isSoldOut && <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />}
                            </div>
                        </div>
                    </Link>

                </div>

                {/* ─── FOOTER: REGRAS E GARANTIA ─── */}
                <div className="mt-7 pt-5 border-t border-[#ADCEB3]/30 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-[11px] sm:text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#245E3B]" /> 100% Algodão Hipoalergênico
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#245E3B]" /> Bordado Exclusivo com o Nome do Bebê
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#245E3B]" /> Pagamento Seguro via InfinitePay
                    </span>
                </div>

            </div>
        </section>
    );
}
