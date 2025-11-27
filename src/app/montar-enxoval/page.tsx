'use client';

import { useBuilderStore } from '@/store/builder-store';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import LivePreview from '@/components/wizard/live-preview';
import StepProduct from '@/components/wizard/step-product';
import StepFabric from '@/components/wizard/step-fabric';
import StepEmbroidery from '@/components/wizard/step-embroidery';
import StepPersonalization from '@/components/wizard/step-personalization';
import StepSummary from '@/components/wizard/step-summary';

const steps = [
    { id: 'product', title: 'Escolha a Peça' },
    { id: 'fabric', title: 'Selecione o Tecido' },
    { id: 'embroidery', title: 'Estilo do Bordado' },
    { id: 'personalization', title: 'Personalize' },
    { id: 'summary', title: 'Revisão' },
];

export default function WizardPage() {
    const { currentStep, prevStep } = useBuilderStore();

    const renderStep = () => {
        switch (currentStep) {
            case 0: return <StepProduct />;
            case 1: return <StepFabric />;
            case 2: return <StepEmbroidery />;
            case 3: return <StepPersonalization />;
            case 4: return <StepSummary />;
            default: return <StepProduct />;
        }
    };

    return (
        <main className="min-h-screen flex flex-col lg:flex-row bg-white">
            {/* Left Panel - Live Preview (Hidden on mobile, sticky on desktop) */}
            <div className="hidden lg:block lg:w-1/2 h-screen sticky top-0">
                <LivePreview />
            </div>

            {/* Right Panel - Controls */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-20 px-8 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        {currentStep > 0 ? (
                            <button
                                onClick={prevStep}
                                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                            >
                                <Icon icon={ArrowLeft} className="w-5 h-5 text-text" />
                            </button>
                        ) : (
                            <Link href="/">
                                <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                                    <Icon icon={ArrowLeft} className="w-5 h-5 text-text" />
                                </button>
                            </Link>
                        )}
                        <span className="text-sm uppercase tracking-widest text-subtle font-nunito">
                            Passo {currentStep + 1} de {steps.length}
                        </span>
                    </div>

                    <div className="text-right">
                        <h2 className="text-lg font-playfair text-text">
                            {steps[currentStep].title}
                        </h2>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 p-6 md:p-12 overflow-y-auto">
                    <div className="max-w-xl mx-auto">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {renderStep()}
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
