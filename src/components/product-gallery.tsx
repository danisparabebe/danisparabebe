'use client';

import { motion } from 'framer-motion';
import { getBestSellers } from '@/data/mock-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProductGallery() {
    const products = getBestSellers();

    return (
        <section className="py-24 bg-white border-t border-gray-50">
            <div className="max-w-[1800px] mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-xs tracking-[0.3em] uppercase text-subtle font-nunito block mb-4">
                        Shop The Look
                    </span>
                    <h2 className="text-3xl md:text-4xl font-playfair text-text">
                        BEST SELLERS
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group cursor-pointer"
                        >
                            <div className="relative aspect-[3/4] bg-gray-50 mb-6 overflow-hidden">
                                {/* Placeholder for real image */}
                                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10 group-hover:scale-105 transition-transform duration-[1.5s] ease-out">
                                    <span className="filter grayscale contrast-50">
                                        {product.category === 'fraldas' ? '🍼' :
                                            product.category === 'bodies' ? '👶' : '🧸'}
                                    </span>
                                </div>

                                {/* Quick Add Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm border-t border-gray-100">
                                    <Link href="/montar-enxoval" className="block w-full">
                                        <Button variant="outline" className="w-full rounded-none border-text text-text hover:bg-text hover:text-white uppercase tracking-widest text-xs h-10">
                                            Personalizar
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <h3 className="text-base font-playfair text-text uppercase tracking-wide">
                                    {product.name}
                                </h3>
                                <p className="text-sm text-subtle font-nunito">
                                    R$ {product.basePrice.toFixed(2)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-16">
                    <Button variant="outline" className="rounded-none border-gray-300 text-subtle hover:border-text hover:text-text px-12 uppercase tracking-widest text-xs h-12">
                        Ver Todos os Produtos
                    </Button>
                </div>
            </div>
        </section>
    );
}
