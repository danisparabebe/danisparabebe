'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const stepLabels = {
    items: 'Escolha os Itens',
    fabrics: 'Escolha o Tecido',
    embroidery: 'Escolha o Bordado',
    personalization: 'Personalize',
    review: 'Revise seu Pedido',
};

const stepOrder = ['items', 'fabrics', 'embroidery', 'personalization', 'review'];

export function ConfiguratorLayout({ children }: { children: React.ReactNode }) {
    const { currentStep, getTotalPrice } = useConfiguratorStore();
    const totalPrice = getTotalPrice();

    const currentStepIndex = stepOrder.indexOf(currentStep);
    const progressPercentage = ((currentStepIndex + 1) / stepOrder.length) * 100;

    return (
        <div className="min-h-screen bg-warm-stone">
            {/* Glassmorphism Header */}
            <header className="glass-header border-b border-line sticky top-0 z-10 h-20">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="hover:bg-dusty-rose/10 text-charcoal">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </Link>

                    {/* Logo Centered */}
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <div className="relative w-16 h-16">
                            <Image
                                src="/logo-danis.png"
                                alt="Danis"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>

                    <div className="text-lg md:text-xl font-semibold text-dusty-rose">
                        R$ {totalPrice.toFixed(2)}
                    </div>
                </div>
            </header>

            {/* Progress Bar Section */}
            <div className="bg-surface-white border-b border-line py-6">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm md:text-base text-charcoal font-medium">
                            <span>{stepLabels[currentStep as keyof typeof stepLabels]}</span>
                            <span className="text-slate">Passo {currentStepIndex + 1} de {stepOrder.length}</span>
                        </div>
                        <div className="relative h-2 bg-warm-stone rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-dusty-rose to-deep-rose transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
