'use client';

import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { Package, Palette, Home } from 'lucide-react';

const steps = [
    {
        icon: Package,
        title: 'Escolha o Produto',
        description: 'Selecione entre nossa linha exclusiva de peças em algodão egípcio.',
    },
    {
        icon: Palette,
        title: 'Personalize',
        description: 'Combine tecidos nobres, bordados delicados e o nome do bebê.',
    },
    {
        icon: Home,
        title: 'Receba em Casa',
        description: 'Seu enxoval chega embalado com perfume e carinho em todo o Brasil.',
    },
];

export default function HowItWorks() {
    return (
        <section id="como-funciona" className="py-24 bg-creme">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center"
                        >
                            <div className="mb-6 p-6 rounded-full bg-white/50 shadow-soft">
                                <Icon icon={step.icon} className="w-8 h-8 text-rosa" />
                            </div>
                            <h3 className="text-xl font-playfair text-text mb-3">
                                {step.title}
                            </h3>
                            <p className="text-subtle font-nunito leading-relaxed max-w-xs mx-auto">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
