'use client';

import { useBuilderStore } from '@/store/builder-store';
import { mockFabrics } from '@/data/mock-data';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StepFabric() {
    const { selectedFabric, setFabric, nextStep } = useBuilderStore();

    const handleSelect = (fabric: typeof mockFabrics[0]) => {
        setFabric(fabric);
        setTimeout(() => nextStep(), 300);
    };

    return (
        <div className="space-y-12">
            <div className="text-center md:text-left border-b border-gray-100 pb-6">
                <span className="text-xs uppercase tracking-[0.2em] text-subtle font-nunito block mb-2">
                    Passo 2
                </span>
                <h3 className="text-2xl font-playfair text-text">
                    SELECIONE O TECIDO
                </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {mockFabrics.map((fabric) => (
                    <motion.button
                        key={fabric.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSelect(fabric)}
                        className="flex flex-col items-center gap-4 group"
                    >
                        <div className={cn(
                            "w-24 h-24 border transition-all duration-300", // Changed to square
                            selectedFabric?.id === fabric.id
                                ? "border-text ring-1 ring-text"
                                : "border-gray-200 group-hover:border-gray-400"
                        )}>
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundColor: fabric.name.includes('Rosa') ? '#FCE7F3' : '#E0F2FE' }}
                            >
                                <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">
                                    🧵
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <span className={cn(
                                "block font-playfair text-sm uppercase tracking-wide transition-colors mb-1",
                                selectedFabric?.id === fabric.id ? "text-text font-semibold" : "text-subtle"
                            )}>
                                {fabric.name}
                            </span>
                            <span className="text-[10px] text-subtle/70 font-nunito uppercase tracking-widest">
                                + R$ {fabric.additionalPrice.toFixed(2)}
                            </span>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
