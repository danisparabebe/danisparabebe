'use client';

import { useBuilderStore } from '@/store/builder-store';
import { mockEmbroideries } from '@/data/mock-data';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StepEmbroidery() {
    const { selectedEmbroidery, setEmbroidery, nextStep } = useBuilderStore();

    const handleSelect = (embroidery: typeof mockEmbroideries[0]) => {
        setEmbroidery(embroidery);
        setTimeout(() => nextStep(), 300);
    };

    return (
        <div className="space-y-12">
            <div className="text-center md:text-left border-b border-gray-100 pb-6">
                <span className="text-xs uppercase tracking-[0.2em] text-subtle font-nunito block mb-2">
                    Passo 3
                </span>
                <h3 className="text-2xl font-playfair text-text">
                    ESTILO DO BORDADO
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {mockEmbroideries.map((embroidery) => (
                    <motion.div
                        key={embroidery.id}
                        whileHover={{ y: -2 }}
                        onClick={() => handleSelect(embroidery)}
                        className={cn(
                            "cursor-pointer p-8 border transition-all duration-300 flex flex-col items-center text-center gap-6 bg-white",
                            selectedEmbroidery?.id === embroidery.id
                                ? "border-text ring-1 ring-text"
                                : "border-gray-200 hover:border-gray-400"
                        )}
                    >
                        <div className="w-20 h-20 bg-gray-50 flex items-center justify-center text-3xl">
                            ✨
                        </div>

                        <div>
                            <h4 className={cn(
                                "font-playfair text-base uppercase tracking-wide mb-2 transition-colors",
                                selectedEmbroidery?.id === embroidery.id ? "text-text font-medium" : "text-subtle"
                            )}>
                                {embroidery.name}
                            </h4>
                            <span className="text-[10px] text-subtle/70 font-nunito uppercase tracking-widest">
                                + R$ {embroidery.additionalPrice.toFixed(2)}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
