'use client';

import { Button } from '@/components/ui/button';

export default function HeroSection() {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image (will be replaced with real image later) */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-brand/20 via-neutral-bg to-secondary-brand/20" />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
                <h1 className="font-fraunces text-5xl md:text-7xl text-neutral-text drop-shadow-lg">
                    Enxovais que Contam Histórias
                </h1>
                <p className="text-lg md:text-xl text-neutral-textSub max-w-2xl mx-auto">
                    Cada peça é única, bordada com amor e personalizada com o nome do seu bebê
                </p>
                <div className="flex gap-4 justify-center">
                    <Button size="lg">
                        Personalizar Agora
                    </Button>
                    <Button variant="secondary" size="lg">
                        Ver Catálogo
                    </Button>
                </div>
            </div>
        </section>
    );
}
