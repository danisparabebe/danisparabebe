'use client';

import { useBuilderStore } from '@/store/builder-store';
import { mockProducts } from '@/data/mock-data';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StepProduct() {
    const { selectedProduct, setProduct, nextStep } = useBuilderStore();

    const handleSelect = (product: typeof mockProducts[0]) => {
        setProduct(product);
        setTimeout(() => nextStep(), 300);
    };

    return (
        <div className="space-y-12">
            <div className="text-center md:text-left border-b border-gray-100 pb-6">
                <span className="text-xs uppercase tracking-[0.2em] text-subtle font-nunito block mb-2">
                    Passo 1
                </span>
                <h3 className="text-2xl font-playfair text-text">
                    ESCOLHA A PEÇA
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {mockProducts.map((product) => (
                    <motion.div
                        key={product.id}
                        whileHover={{ y: -4 }}
                        onClick={() => handleSelect(product)}
                        className={cn(
                            "cursor-pointer group relative bg-white border transition-all duration-300",
                            selectedProduct?.id === product.id
                                ? "border-text ring-1 ring-text"
                                : "border-gray-200 hover:border-gray-400"
                        )}
                    >
                        <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center text-5xl group-hover:opacity-90 transition-opacity">
                            <span className="filter grayscale group-hover:grayscale-0 transition-all duration-500">
                                {product.category === 'fraldas' ? '🍼' :
                                    product.category === 'bodies' ? '👶' : '🧸'}
                            </span>
                        </div>

                        <div className="p-6 text-center">
                            <h4 className="font-playfair text-lg text-text uppercase tracking-wide mb-2">
                                {product.name}
                            </h4>
                            <span className="font-nunito text-xs font-bold text-subtle uppercase tracking-widest">
                                R$ {product.basePrice.toFixed(2)}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
