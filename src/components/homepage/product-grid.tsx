'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ProductCard } from './product-card';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface Product {
    id: string;
    shortCode?: string;
    name: string;
    category?: string;
    price: number;
    installmentPrice?: number;
    installments?: number;
    image: string;
    badge?: string;
    isHot?: boolean;
    comingSoon?: boolean;
}

interface ProductGridProps {
    title: React.ReactNode;
    products: Product[];
    columns?: 4 | 5 | 6;
    enableMobileScroll?: boolean;
}

export function ProductGrid({
    title,
    products,
    columns = 6,
    enableMobileScroll = true,
}: ProductGridProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [activeIdx, setActiveIdx] = useState(0);

    const updateScrollButtons = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 15);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);

        // Identifica qual cartão está mais visível
        const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 260;
        const current = Math.round(scrollLeft / (cardWidth + 14));
        setActiveIdx(Math.min(Math.max(0, current), products.length - 1));
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 260;
        const scrollAmount = (cardWidth + 14) * 1.5;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateScrollButtons, { passive: true });
        updateScrollButtons();
        return () => el.removeEventListener('scroll', updateScrollButtons);
    }, [products.length]);

    const is5Cols = columns === 5;

    return (
        <section className="px-3 sm:px-4 py-8 lg:px-8">
            <div className="mx-auto max-w-[1400px]">
                {/* Título da Seção */}
                <h2
                    className="mb-4 text-2xl font-bold text-charcoal text-center"
                    style={{ fontFamily: 'var(--font-heading)' }}
                >
                    {title}
                </h2>

                {/* ─── Dica Visual no Mobile: Deixa nítido e claro que é uma grade para rolar para o lado ─── */}
                {is5Cols && enableMobileScroll && (
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-4 bg-white/80 backdrop-blur-xs py-2 px-4 rounded-full w-fit mx-auto border border-line shadow-xs">
                        <span className="text-base animate-pulse">👉</span>
                        <span className="text-xs font-bold text-charcoal">
                            Deslize para o lado para ver todos os modelos
                        </span>
                        <span className="text-[11px] font-extrabold bg-dusty-rose/20 text-dusty-rose px-2 py-0.5 rounded-full">
                            {activeIdx + 1} de {products.length}
                        </span>
                    </div>
                )}

                {/* ─── MODO 5 COLUNAS (5 em cima e 5 embaixo no Desktop + Carrossel Responsivo no Mobile) ─── */}
                {is5Cols ? (
                    <div className="relative group/carousel">
                        {/* Botão Seta Esquerda (Mobile / Tablet) */}
                        {enableMobileScroll && canScrollLeft && (
                            <button
                                onClick={() => scroll('left')}
                                aria-label="Voltar produto anterior"
                                className="lg:hidden absolute left-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/95 rounded-full shadow-md border border-black/10 text-charcoal flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}

                        {/* Botão Seta Direita (Mobile / Tablet) */}
                        {enableMobileScroll && canScrollRight && (
                            <button
                                onClick={() => scroll('right')}
                                aria-label="Avançar próximo produto"
                                className="lg:hidden absolute right-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white/95 rounded-full shadow-md border border-black/10 text-charcoal flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}

                        {/* Contêiner dos Produtos:
                            - No Mobile (< lg): carrossel com rolagem horizontal da direita para a esquerda, snap suave e o próximo produto vazando para o lado (peeking)
                            - No Desktop (>= lg): grade ESTÁTICA de 5 colunas centralizada (exatamente 5 em cima e 5 embaixo)
                        */}
                        <div
                            ref={scrollRef}
                            className={`
                                flex gap-3.5 overflow-x-auto pb-4 pt-1 px-2 snap-x snap-mandatory scroll-smooth
                                scrollbar-none
                                lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:pb-0 lg:px-0 lg:justify-center
                            `}
                        >
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="w-[74vw] sm:w-[260px] md:w-[280px] shrink-0 snap-start lg:w-full lg:shrink"
                                >
                                    <ProductCard {...product} />
                                </div>
                            ))}
                        </div>

                        {/* Indicadores de bolinhas no mobile */}
                        {enableMobileScroll && (
                            <div className="lg:hidden flex items-center justify-center gap-1.5 mt-3">
                                {products.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            activeIdx === i ? 'w-5 bg-dusty-rose' : 'w-1.5 bg-slate/30'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ─── MODO PADRÃO (Para Versão Completa e outras páginas) ─── */
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
