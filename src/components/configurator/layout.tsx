'use client';

import { useConfiguratorStore, StepId, STEP_ORDER } from '@/store/configurator-store';
import { formatPrice } from '@/lib/pricing';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';

import { StepName } from './step-name';
import { StepTheme } from './step-theme';
import { StepColors } from './step-colors';
import { StepItems } from './step-items';
import { StepReview } from './step-review';

const STEP_META: { id: StepId; label: string }[] = [
    { id: 'name', label: 'Nome' },
    { id: 'theme', label: 'Tema' },
    { id: 'colors', label: 'Cores' },
    { id: 'items', label: 'Peças' },
    { id: 'review', label: 'Revisão' },
];

export function ConfiguratorLayout() {
    const { currentStep, visitedSteps, setStep, previousStep, getTotalPrice } = useConfiguratorStore();
    const total = getTotalPrice();
    const currentIdx = STEP_ORDER.indexOf(currentStep);

    const canNavigateTo = (stepId: StepId) => visitedSteps.has(stepId);

    const renderStep = () => {
        switch (currentStep) {
            case 'name': return <StepName />;
            case 'theme': return <StepTheme />;
            case 'colors': return <StepColors />;
            case 'items': return <StepItems />;
            case 'review': return <StepReview />;
        }
    };

    return (
        <div className="min-h-screen bg-[#faf9f7] flex flex-col">

            {/* ── Top bar ── */}
            <header className="sticky top-0 z-50 bg-white border-b border-black/8 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

                    {/* Back to store */}
                    <Link
                        href="/"
                        className="cursor-pointer flex items-center gap-1.5 text-slate hover:text-charcoal transition-colors text-sm font-medium shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Loja</span>
                    </Link>

                    {/* Step dots — clickable if already visited */}
                    <nav className="flex items-center gap-1 sm:gap-2">
                        {STEP_META.map((step, i) => {
                            const done = i < currentIdx;
                            const active = i === currentIdx;
                            const visited = canNavigateTo(step.id);
                            const clickable = visited && !active;

                            return (
                                <div key={step.id} className="flex items-center gap-1 sm:gap-2">
                                    <button
                                        disabled={!visited}
                                        onClick={() => clickable && setStep(step.id)}
                                        title={step.label}
                                        className={`
                                            relative flex items-center justify-center rounded-full
                                            text-xs font-bold transition-all duration-200
                                            ${active
                                                ? 'w-8 h-8 bg-[#ADCEB3] text-[#1f2937] shadow-md ring-4 ring-[#ADCEB3]/20 cursor-default'
                                                : done
                                                    ? 'w-7 h-7 bg-[#1f2937] text-white hover:bg-[#ADCEB3] hover:text-[#1f2937] cursor-pointer'
                                                    : 'w-7 h-7 bg-[#ddd8d2] text-[#6b6460] cursor-default'
                                            }
                                        `}
                                    >
                                        {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                                    </button>

                                    {/* Label — desktop only */}
                                    <span
                                        className={`hidden md:inline text-xs font-medium transition-colors ${active ? 'text-[#1f2937] font-semibold' : done ? 'text-[#1f2937]/70' : 'text-[#6b6460]'
                                            }`}
                                    >
                                        {step.label}
                                    </span>

                                    {/* Connector */}
                                    {i < STEP_META.length - 1 && (
                                        <div className={`w-4 sm:w-6 h-px transition-colors ${done ? 'bg-[#1f2937]' : 'bg-black/10'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Live total */}
                    <div className="text-right shrink-0">
                        <p className="text-[10px] text-slate uppercase tracking-widest hidden sm:block">Total</p>
                        <p className="text-base font-bold text-[#1f2937]">{formatPrice(total)}</p>
                    </div>
                </div>
            </header>

            {/* ── Content ── */}
            <main className="flex-1 px-4 py-8 md:py-12 max-w-4xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* ── Persistent bottom back button (all steps except first) ── */}
            {currentIdx > 0 && (
                <div className="sticky bottom-0 z-40 bg-white/80 backdrop-blur-sm border-t border-black/5 px-4 py-3 flex md:hidden">
                    <button
                        onClick={previousStep}
                        className="flex items-center gap-2 text-sm font-semibold text-charcoal hover:text-dusty-rose transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </button>
                </div>
            )}
        </div>
    );
}
