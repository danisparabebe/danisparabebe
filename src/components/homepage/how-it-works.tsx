'use client';

import { Package, Palette, Truck } from '@phosphor-icons/react';

const steps = [
    {
        icon: Package,
        number: '01',
        title: 'Escolha o Modelo',
        description: 'Selecione entre mantas, babadores, almofadas e kits completos',
    },
    {
        icon: Palette,
        number: '02',
        title: 'Personalize Tecido/Nome',
        description: 'Escolha o tecido, bordado e adicione o nome do seu bebê',
    },
    {
        icon: Truck,
        number: '03',
        title: 'Receba em Casa',
        description: 'Entrega premium em até 7 dias úteis com rastreamento',
    },
];

export default function HowItWorks() {
    return (
        <section className="py-20 px-4 bg-neutral-bg">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="font-fraunces text-4xl md:text-5xl text-neutral-text mb-4">
                        Como Funciona
                    </h2>
                    <p className="text-neutral-textSub">
                        Em 3 passos simples, você cria o enxoval perfeito
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid md:grid-cols-3 gap-12">
                    {steps.map((step) => (
                        <div key={step.number} className="text-center space-y-6">
                            {/* Icon Circle */}
                            <div className="relative inline-block">
                                <div className="w-24 h-24 bg-primary-brand/10 rounded-full flex items-center justify-center mx-auto">
                                    <step.icon size={40} weight="light" className="text-primary-brand" />
                                </div>
                                <span className="absolute -top-2 -right-2 w-10 h-10 bg-secondary-brand text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {step.number}
                                </span>
                            </div>

                            {/* Text */}
                            <div>
                                <h3 className="font-fraunces text-2xl text-neutral-text mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-neutral-textSub text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
