'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, Flame, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export interface HeroSlide {
    name: string;
    image: string;
    link: string;
    badge?: string;
    isHot?: boolean;
}

interface HeroCarouselPanelProps {
    slides: HeroSlide[];
    intervalMs?: number;
}

function HeroCarouselPanel({ slides, intervalMs = 3500 }: HeroCarouselPanelProps) {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const total = slides.length;

    const goTo = useCallback((idx: number) => {
        setCurrent(((idx % total) + total) % total);
    }, [total]);

    const next = useCallback(() => goTo(current + 1), [current, goTo]);
    const prev = useCallback(() => goTo(current - 1), [current, goTo]);

    useEffect(() => {
        if (isPaused || total <= 1) return;
        const timer = setInterval(next, intervalMs);
        return () => clearInterval(timer);
    }, [isPaused, next, intervalMs, total]);

    if (total === 0) return null;

    return (
        <div
            className="w-full flex flex-col group/hero touch-pan-y"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
            onTouchEnd={(e) => {
                if (!touchStart) return;
                const diff = touchStart - e.changedTouches[0].clientX;
                if (diff > 50) next();
                else if (diff < -50) prev();
                setTouchStart(null);
                
                // Pause resuming giving 10sec of uninterrupted browse
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 8000);
            }}
        >
            {/* ─── Slides Image Area ─── */}
            <div className="relative w-full h-[clamp(280px,40vw,480px)] overflow-hidden rounded-[20px] md:rounded-[32px] shadow-lg border border-black/5">
                {slides.map((slide, idx) => {
                    const isNear = idx === current ||
                        idx === (current + 1) % total ||
                        idx === (current - 1 + total) % total ||
                        idx === 0;

                    return (
                        <Link
                            key={idx}
                            href={slide.link}
                            className={`absolute inset-0 transition-all duration-700 ease-in-out
                            ${idx === current
                                    ? 'opacity-100 translate-x-0 z-10'
                                    : idx < current
                                        ? 'opacity-0 -translate-x-full z-0'
                                        : 'opacity-0 translate-x-full z-0'
                                }`}
                        >
                            {isNear && (
                                <Image
                                    src={slide.image}
                                    alt={slide.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover/hero:scale-105"
                                    quality={100}
                                    priority={idx === 0}
                                />
                            )}

                        </Link>
                    );
                })}

                {/* ─── Arrow Controls ─── */}
                {total > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-md text-white border border-white/10 hover:bg-white/30 hover:border-white/25 transition-all duration-300 opacity-0 group-hover/hero:opacity-100 cursor-pointer shadow-lg hover:scale-110 active:scale-90"
                            aria-label="Anterior"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-md text-white border border-white/10 hover:bg-white/30 hover:border-white/25 transition-all duration-300 opacity-0 group-hover/hero:opacity-100 cursor-pointer shadow-lg hover:scale-110 active:scale-90"
                            aria-label="Próximo"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </>
                )}

                {/* ─── Dot Indicators ─── */}
                {total > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(idx); }}
                                className={`rounded-full transition-all duration-300 cursor-pointer hover:scale-125 active:scale-90
                                    ${idx === current
                                        ? 'w-5 h-1.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]'
                                        : 'w-1.5 h-1.5 bg-white/35 hover:bg-white/70'
                                    }`}
                                aria-label={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Info Area (Below Image) ─── */}
            <div className="mt-4 md:mt-5 flex flex-col items-center justify-center text-center px-2 min-h-[90px]">
                <Link href={slides[current]?.link || '#'} className="flex flex-col items-center group/link max-w-[95%]">
                    <h3 className="text-[13px] md:text-base font-bold text-charcoal mb-3 line-clamp-2 transition-colors group-hover/link:text-sage-green" style={{ fontFamily: 'var(--font-heading)' }}>
                        {slides[current]?.name}
                    </h3>
                    <div className="inline-flex items-center justify-center bg-charcoal text-white px-8 py-2.5 md:py-3 rounded-full text-[10px] md:text-[11px] font-black tracking-[0.15em] uppercase transition-all duration-300 shadow-md group-hover/link:shadow-lg group-hover/link:-translate-y-0.5 group-active/link:scale-95">
                        EU QUERO
                    </div>
                </Link>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════ */

interface HeroGridProps {
    leftSlides: HeroSlide[];
    rightSlides: HeroSlide[];
    leftTitle?: string;
    rightTitle?: string;
}


// ... other existing code remains untouched ...

// Helper component for jumping letters (Spring Bounce effect with Loop)
function BouncingTitle({ text, delayOffset = 0 }: { text: string; delayOffset?: number }) {
    const letters = Array.from(text);

    return (
        <motion.h2
            className="text-[12px] md:text-[13px] font-black tracking-[0.25em] uppercase text-charcoal flex"
            style={{ fontFamily: 'var(--font-heading)' }}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.12,
                        delayChildren: delayOffset
                    }
                }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
        >
            {letters.map((char, index) => (
                <motion.span
                    key={index}
                    variants={{
                        hidden: { opacity: 0, y: -20 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                type: "spring",
                                damping: 8,
                                stiffness: 200,
                                mass: 0.5,
                                repeat: Infinity,
                                repeatType: "loop",
                                repeatDelay: 3
                            }
                        }
                    }}
                    style={{ display: "inline-block", marginRight: char === ' ' ? '0.5em' : '1px' }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.h2>
    );
}

export function HeroGrid({
    leftSlides,
    rightSlides,
    leftTitle = 'Mais Vendidos',
    rightTitle = 'Para Presentear',
}: HeroGridProps) {
    return (
        <section className="mt-8 mb-4 px-2 lg:px-4 max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                {/* ─── Left Panel ─── */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-center gap-2 mb-3 px-2">
                        <Flame className="w-4 h-4 text-sage-green mb-1" />
                        <BouncingTitle text={leftTitle} delayOffset={0} />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <HeroCarouselPanel slides={leftSlides} intervalMs={3500} />
                    </div>
                </div>

                {/* ─── Right Panel ─── */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-center gap-2 mb-3 px-2 mt-6 md:mt-0">
                        <Gift className="w-4 h-4 text-sage-green mb-1" />
                        <BouncingTitle text={rightTitle} delayOffset={0.3} />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <HeroCarouselPanel slides={rightSlides} intervalMs={4500} />
                    </div>
                </div>
            </div>
        </section>
    );
}
