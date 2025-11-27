'use client';

import { useBuilderStore } from '@/store/builder-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/icon';
import { ShoppingBag } from 'lucide-react';

export default function LivePreview() {
    const { selectedProduct, selectedFabric, selectedEmbroidery, babyName } = useBuilderStore();

    return (
        <div className="h-full w-full bg-gray-50 flex items-center justify-center p-12 relative overflow-hidden border-r border-gray-100">
            <div className="relative z-10 w-full max-w-md aspect-[3/4] bg-white shadow-sm border border-gray-100 p-12 flex flex-col items-center text-center transition-all duration-500">
                {/* Product Layer */}
                <div className="flex-1 w-full flex items-center justify-center relative">
                    <AnimatePresence mode="wait">
                        {selectedProduct ? (
                            <motion.div
                                key={selectedProduct.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative w-full h-full flex items-center justify-center"
                            >
                                {/* Placeholder for Product Image */}
                                <div className="text-9xl opacity-90 filter grayscale contrast-100">
                                    {selectedProduct.category === 'fraldas' ? '🍼' :
                                        selectedProduct.category === 'bodies' ? '👶' : '🧸'}
                                </div>

                                {/* Fabric Overlay (Conceptual - Sharp Square) */}
                                {selectedFabric && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute bottom-0 right-0 w-16 h-16 border border-gray-200 shadow-sm"
                                        style={{ backgroundColor: selectedFabric.name.includes('Rosa') ? '#FCE7F3' : '#E0F2FE' }}
                                    />
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-subtle/20 flex flex-col items-center"
                            >
                                <Icon icon={ShoppingBag} className="w-12 h-12 mb-6 stroke-1" />
                                <p className="font-playfair italic text-sm">Seu enxoval aparecerá aqui</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Personalization Layer */}
                <div className="mt-12 h-24 w-full flex flex-col items-center justify-center border-t border-gray-100 pt-8">
                    <AnimatePresence mode="wait">
                        {babyName ? (
                            <motion.div
                                key="name"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center"
                            >
                                <p className="font-cursive text-5xl text-text mb-2">{babyName}</p>
                                {selectedEmbroidery && (
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-subtle font-nunito">
                                        {selectedEmbroidery.name}
                                    </p>
                                )}
                            </motion.div>
                        ) : (
                            <p className="text-[10px] text-subtle/40 font-nunito uppercase tracking-[0.3em]">
                                Personalização
                            </p>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
